import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";

// Initialize CDP client (server-side only)
const cdp = new CdpClient({
  apiKeyId: process.env.CDP_API_KEY_ID as string,
  apiKeySecret: process.env.CDP_API_KEY_SECRET as string,
  walletSecret: process.env.CDP_WALLET_SECRET as string
});

/**
 * POST /api/cdp/sign
 * 
 * Sign a message using CDP wallet
 * 
 * Body: { message: string, address: string, midenAddress?: string }
 * 
 * Returns: { signature: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, address, midenAddress } = body;

    if (!message || !address) {
      return NextResponse.json(
        { error: "message and address are required" },
        { status: 400 }
      );
    }

    let account;

    // Try to get account by name (midenAddress) first, then by address
    if (midenAddress) {
      try {
        account = await cdp.evm.getAccount({
          name: midenAddress,
        });
      } catch (e) {
        // Fall back to address lookup
        console.warn("Failed to get account by name, trying address:", e);
      }
    }

    // If account not found by name, try by address
    if (!account) {
      account = await cdp.evm.getAccount({
        address: address,
      });
    }

    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    // Sign the message
    // CDP SDK signMessage expects a message string
    const signature = await account.signMessage({
      message: message,
    });

    return NextResponse.json({
      signature: signature,
    });
  } catch (error: any) {
    console.error("Error signing message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sign message" },
      { status: 500 }
    );
  }
}
