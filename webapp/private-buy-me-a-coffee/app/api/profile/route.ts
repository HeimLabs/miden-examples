import { NextRequest, NextResponse } from "next/server";
import { upsertCreator } from "../../lib/db";

/**
 * POST /api/profile
 * 
 * Creates or updates a creator profile.
 * 
 * Body: { walletAddress: string; name: string; bio?: string }
 * 
 * Flow for creators:
 * 1. Creator connects their Miden wallet
 * 2. Creator fills out name and bio in dashboard
 * 3. This endpoint is called with wallet address and profile data
 * 4. Profile is saved/updated in SQLite database
 * 5. Creator can then share their public link: /c/[walletAddress]
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, name, bio } = body;

    if (!walletAddress || !name) {
      return NextResponse.json(
        { error: "walletAddress and name are required" },
        { status: 400 }
      );
    }

    // Validate wallet address format (basic check)
    if (!walletAddress.startsWith("mtst1") && !walletAddress.startsWith("mm1")) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    const creator = upsertCreator(walletAddress, name, bio || null);

    if (!creator) {
      return NextResponse.json(
        { error: "Failed to save profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      walletAddress: creator.walletAddress,
      name: creator.name,
      bio: creator.bio,
      createdAt: creator.createdAt,
      updatedAt: creator.updatedAt,
    });
  } catch (error: any) {
    console.error("Error saving profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save profile" },
      { status: 500 }
    );
  }
}
