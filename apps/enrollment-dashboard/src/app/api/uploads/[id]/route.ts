import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@repo/backend/convex/_generated/api";
import type { FunctionReference } from "convex/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Delete upload via Convex action
    const result = await convex.action(
        api.functions.uploads.deleteUpload as FunctionReference<"action">,
        {
      uploadId: id as string,
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("Delete error:", error);
    
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