import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@repo/backend/convex/_generated/api";
import type { FunctionReference } from "convex/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ intakeId: string }> }
) {
  try {
    const { intakeId } = await params;
    const formData = await request.formData();
    
    const files = formData.getAll("files") as File[];
    const kind = formData.get("kind") as string;
    
    if (!kind || !["GUIDE", "PLAN_DOC", "PAYROLL_SCREEN", "OTHER"].includes(kind)) {
      return NextResponse.json(
        { error: "Invalid or missing file kind" },
        { status: 400 }
      );
    }
    
    if (!files.length) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }
    
    if (files.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 files allowed per upload" },
        { status: 400 }
      );
    }
    
    const results: Array<{
      _id: string;
      originalName: string;
      mimeType: string;
      bytes: number;
      kind: string;
    }> = [];
    const errors: Array<{
      filename: string;
      error: string;
    }> = [];
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await convex.action(
            api.functions.uploads.uploadFile as FunctionReference<"action">,
            {
          intakeId,
          kind: kind as "GUIDE" | "PLAN_DOC" | "PAYROLL_SCREEN" | "OTHER",
          file,
        });
        
        results.push(result);
      } catch (error) {
        errors.push({
          filename: file.name,
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    }
    
    return NextResponse.json({
      files: results,
      errors: errors.length > 0 ? errors : undefined,
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}