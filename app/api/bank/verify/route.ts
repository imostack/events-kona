import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountNumber = searchParams.get("account_number");
  const bankCode = searchParams.get("bank_code");

  if (!accountNumber || !bankCode) {
    return errorResponse({
      message: "Account number and bank code are required",
      status: 400,
    });
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok || !data.status) {
      return errorResponse({
        message: data.message || "Could not verify account. Please check your details.",
        status: 400,
      });
    }

    return successResponse({
      data: {
        accountName: data.data.account_name,
        accountNumber: data.data.account_number,
      },
      message: "Account verified successfully",
    });
  } catch {
    return errorResponse({
      message: "Failed to verify account. Please try again.",
      status: 500,
    });
  }
}

export const GET = withErrorHandler(withAuth(handler));
