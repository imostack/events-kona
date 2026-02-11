import { z } from "zod";
import { validationError } from "./api-response";

/**
 * Validates request body against a Zod schema.
 * Returns parsed data on success, or a 400 NextResponse on failure.
 */
export async function validateBody<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: ReturnType<typeof validationError> }
> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".") || "body";
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }
      return { success: false, response: validationError(fieldErrors) };
    }

    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: validationError({ body: ["Invalid JSON body"] }),
    };
  }
}

/**
 * Validates query parameters against a Zod schema.
 */
export function validateQuery<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; response: ReturnType<typeof validationError> } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".") || "query";
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    }
    return { success: false, response: validationError(fieldErrors) };
  }

  return { success: true, data: result.data };
}
