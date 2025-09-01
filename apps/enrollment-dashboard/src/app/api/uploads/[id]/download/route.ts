import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import type { FunctionReference } from "convex/server";
import { api } from "@repo/backend/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get download URL from Convex
    const download = await convex.action(api.functions.uploads.getDownloadUrl as FunctionReference<"action">, {
      uploadId: id as string,
    });
    
    if (!download.url) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
    
    // Return redirect to signed URL
    return NextResponse.redirect(download.url);
    
  } catch (error) {
    console.error("Download error:", error);
    
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}