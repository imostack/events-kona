import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { withAuth } from "@/lib/server-middleware";
import { TokenPayload } from "@/lib/auth";
import { errorResponse } from "@/lib/api-response";

// Next.js App Router: increase body size limit for file uploads
export const dynamic = "force-dynamic";

export const POST = withAuth(async (request: NextRequest & { user: TokenPayload }) => {
  try {
    // Read and normalize env vars (trim + strip surrounding quotes — Vercel can store these with spaces/quotes)
    const cloudName = (process.env.CLOUDINARY_CLOUD_NAME ?? "").trim().replace(/^["']|["']$/g, "");
    const apiKey = (process.env.CLOUDINARY_API_KEY ?? "").trim().replace(/^["']|["']$/g, "");
    const apiSecret = (process.env.CLOUDINARY_API_SECRET ?? "").trim().replace(/^["']|["']$/g, "");

    if (!cloudName || !apiKey || !apiSecret) {
      return errorResponse({
        message: "Image upload service is not configured. Missing Cloudinary credentials.",
        status: 503,
        code: "UPLOAD_NOT_CONFIGURED",
      });
    }

    // Configure Cloudinary per-request (ensures env vars are read at runtime)
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string || "events";

    if (!file) {
      return NextResponse.json(
        { success: false, error: { message: "No file provided", code: "NO_FILE" } },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.", code: "INVALID_FILE_TYPE" } },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: { message: "File too large. Maximum size is 10MB.", code: "FILE_TOO_LARGE" } },
        { status: 400 }
      );
    }

    // Convert file to base64 data URI (more reliable on serverless than upload_stream)
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary using base64
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `eventskona/${folder}`,
      resource_type: "image",
      transformation: [
        { width: 1920, height: 1080, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    let errMsg = "Unknown error";
    if (error instanceof Error) {
      errMsg = error.message;
    } else if (error && typeof error === "object" && "message" in error) {
      errMsg = String((error as { message: unknown }).message);
    } else if (typeof error === "string") {
      errMsg = error;
    }
    return errorResponse({
      message: `Failed to upload image: ${errMsg}`,
      status: 500,
      code: "UPLOAD_FAILED",
    });
  }
});

// Delete an image from Cloudinary
export const DELETE = withAuth(async (request: NextRequest & { user: TokenPayload }) => {
  try {
    const cloudName = (process.env.CLOUDINARY_CLOUD_NAME ?? "").trim().replace(/^["']|["']$/g, "");
    const apiKey = (process.env.CLOUDINARY_API_KEY ?? "").trim().replace(/^["']|["']$/g, "");
    const apiSecret = (process.env.CLOUDINARY_API_SECRET ?? "").trim().replace(/^["']|["']$/g, "");
    if (!cloudName || !apiKey || !apiSecret) {
      return errorResponse({
        message: "Image upload service is not configured. Missing Cloudinary credentials.",
        status: 503,
        code: "UPLOAD_NOT_CONFIGURED",
      });
    }
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: { message: "No public ID provided", code: "NO_PUBLIC_ID" } },
        { status: 400 }
      );
    }

    if (!publicId.startsWith("eventskona/")) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid public ID", code: "INVALID_PUBLIC_ID" } },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error("Delete error:", error);
    return errorResponse({
      message: "Failed to delete image",
      status: 500,
      code: "DELETE_FAILED",
    });
  }
});
