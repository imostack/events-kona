import { NextRequest } from "next/server";
import { z } from "zod";
import { validateBody } from "@/lib/validate";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withAuthAndRateLimit, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit } from "@/lib/rate-limit";

const generateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().optional(),
  eventFormat: z.string().optional(),
  existingDescription: z.string().optional(),
  mode: z.enum(["generate", "enhance"]),
});

async function handler(
  request: NextRequest & { user: TokenPayload }
) {
  const validation = await validateBody(request, generateSchema);
  if (!validation.success) return validation.response;

  const { title, category, eventFormat, existingDescription, mode } = validation.data;

  // Daily limit: 20 AI generations per user per day
  const dailyLimit = checkRateLimit(
    `ai-daily:${request.user.sub}`,
    { windowMs: 24 * 60 * 60 * 1000, max: 20 }
  );
  if (!dailyLimit.allowed) {
    return errorResponse({
      message: `You've reached your daily AI generation limit (20/day). Resets in ${Math.ceil(dailyLimit.retryAfter / 60)} minutes.`,
      status: 429,
      code: "DAILY_LIMIT_EXCEEDED",
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return errorResponse({
      message: "AI service is not configured. Please add GEMINI_API_KEY to your environment.",
      status: 503,
      code: "AI_NOT_CONFIGURED",
    });
  }

  // Initialize Google Generative AI
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `You are an expert event copywriter. Write compelling event descriptions in plain text (no markdown, no bullet points, no headings).

Structure: exactly three paragraphs separated by double line breaks.

Paragraph 1 — Hook: Open with an attention-grabbing statement tied to the event title and category. Set the tone and create excitement.

Paragraph 2 — Value: Explain what attendees will experience and gain. Be specific and concrete about benefits. Stay focused on the category provided.

Paragraph 3 — Call to action: Create urgency, reinforce the key benefit, and invite the reader to register or attend.

Guidelines:
- Write 200–300 words total
- Use a warm, energetic, professional tone
- Stay strictly within the given category — do not add unrelated themes
- Write complete sentences and finish every thought`
  });

  let userPrompt: string;

  if (mode === "generate") {
    userPrompt = `Write a compelling event description for:

Title: "${title}"
${category ? `Category: ${category}` : ""}
${eventFormat ? `Format: ${eventFormat === "IN_PERSON" ? "In-person event" : eventFormat === "ONLINE" ? "Online/virtual event" : "Hybrid (in-person + online) event"}` : ""}

Write the full three-paragraph description now.`;
  } else {
    userPrompt = `Rewrite and enhance this event description. Keep the same core information but make it more engaging, vivid, and persuasive. Fix any awkward phrasing and strengthen the call to action.

Title: "${title}"
${category ? `Category: ${category}` : ""}
${eventFormat ? `Format: ${eventFormat === "IN_PERSON" ? "In-person event" : eventFormat === "ONLINE" ? "Online/virtual event" : "Hybrid (in-person + online) event"}` : ""}

Current description:
"${existingDescription}"

Write the improved three-paragraph description now.`;
  }

  try {
    // Generate content with Gemini 3's generation config
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const response = await result.response;
    const description = response.text().trim();

    if (!description) {
      return errorResponse({
        message: "AI failed to generate description",
        status: 500,
      });
    }

    return successResponse({
      data: { description },
      message:
        mode === "generate"
          ? "Description generated successfully"
          : "Description enhanced successfully",
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    return errorResponse({
      message: "Failed to generate description. Please try again.",
      status: 500,
    });
  }
}

// Rate limit: 10 requests per minute per user
const rateLimitConfig = { windowMs: 60 * 1000, max: 10 };

export const POST = withErrorHandler(
  withAuthAndRateLimit(rateLimitConfig, handler)
);
