import { NextRequest, NextResponse } from "next/server";
import { getCreator } from "../../../lib/db";

/**
 * GET /api/creator/[walletAddress]
 * 
 * Retrieves a creator profile by wallet address.
 * 
 * Flow for supporters:
 * 1. Supporter visits /c/[walletAddress] page
 * 2. This endpoint is called to fetch creator profile
 * 3. If found, profile is displayed with support card
 * 4. Supporter enters amount (min 10 HLT) and clicks "Pay privately with Miden"
 * 5. Private transaction is created via Miden wallet adapter
 * 6. Transaction creates a consumable note on the blockchain
 * 7. Creator can later consume the note in their dashboard to add tokens to vault
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { walletAddress } = await params;

    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 }
      );
    }

    const creator = getCreator(walletAddress);

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      walletAddress: creator.walletAddress,
      name: creator.name,
      bio: creator.bio,
    });
  } catch (error: any) {
    console.error("Error fetching creator:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch creator" },
      { status: 500 }
    );
  }
}
