import { NextRequest, NextResponse } from "next/server";
import { CdpClient } from "@coinbase/cdp-sdk";

// Initialize CDP client (server-side only, no SSR issues)
const cdp = new CdpClient({
  apiKeyId: process.env.CDP_API_KEY_ID as string,
  apiKeySecret: process.env.CDP_API_KEY_SECRET as string,
  walletSecret: process.env.CDP_WALLET_SECRET as string
});

/**
 * POST /api/cdp/account
 * 
 * Get or create a deterministic EVM wallet account for a Miden wallet address.
 * 
 * Body: { midenAddress: string }
 * 
 * Returns: { evmAddress: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { midenAddress } = body;

    if (!midenAddress) {
      return NextResponse.json(
        { error: "midenAddress is required" },
        { status: 400 }
      );
    }

    // Get or create CDP account
    const account = await cdp.evm.getOrCreateAccount({
      name: midenAddress,
    });

    console.log(account);


    return NextResponse.json({
      evmAddress: account.address,
      midenAddress: midenAddress,
    });
  } catch (error: any) {
    console.error("Error getting or creating CDP account:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get or create CDP account" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cdp/account?midenAddress=...
 * 
 * Get the EVM wallet address for a Miden wallet address.
 * 
 * Query params: midenAddress: string
 * 
 * Returns: { evmAddress: string | null }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const midenAddress = searchParams.get("midenAddress");

    if (!midenAddress) {
      return NextResponse.json(
        { error: "midenAddress query parameter is required" },
        { status: 400 }
      );
    }

    // Validate wallet address format (basic check)
    if (!midenAddress.startsWith("mtst1") && !midenAddress.startsWith("mm1")) {
      return NextResponse.json(
        { error: "Invalid Miden wallet address format" },
        { status: 400 }
      );
    }

    // Get CDP account
    const account = await cdp.evm.getAccount({
      name: midenAddress,
    });

    return NextResponse.json({
      evmAddress: account?.address || null,
      midenAddress: midenAddress,
    });
  } catch (error: any) {
    console.error("Error getting CDP account:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get CDP account" },
      { status: 500 }
    );
  }
}
