import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { withAuth } from "@/lib/server-middleware";
import { TokenPayload } from "@/lib/auth";
import { errorResponse } from "@/lib/api-response";

// Next.js App Router: increase body size limit for file uploads
export const dynamic = "force-dynamic";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = withAuth(async (request: NextRequest & { user: TokenPayload }) => {
  try {
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
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: { message: "File too large. Maximum size is 10MB.", code: "FILE_TOO_LARGE" } },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string; public_id: string; width: number; height: number }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `eventskona/${folder}`,
          resource_type: "image",
          transformation: [
            { width: 1920, height: 1080, crop: "limit" }, // Limit max dimensions
            { quality: "auto:good" }, // Auto optimize quality
            { fetch_format: "auto" }, // Auto format (WebP when supported)
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload failed"));
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height,
            });
          }
        }
      ).end(buffer);
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
  } catch (error) {
    console.error("Upload error:", error);
    const errMsg = error instanceof Error ? error.message : "Unknown error";
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
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: { message: "No public ID provided", code: "NO_PUBLIC_ID" } },
        { status: 400 }
      );
    }

    // Verify the public ID belongs to our folder
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
