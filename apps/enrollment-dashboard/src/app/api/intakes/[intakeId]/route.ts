import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@repo/backend/convex/_generated/api";
import type { FunctionReference } from "convex/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ intakeId: string }> }
) {
  try {
    const { intakeId } = await params;
    
    // Delete intake via Convex action (handles cascading deletion)
    const result = await convex.action(
        api.functions.intakes.deleteIntake as FunctionReference<"action">,
        {
      intakeId,
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("Delete intake error:", error);
    
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Intake not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
/**
 * DELETE /enrollment-dashboard/api/intakes/[intakeId]
 * Description: Delete an intake and cascade delete sections and files.
 * 200: { success: true }
 * 404: { error: "Intake not found" }
 * 500: { error: "Internal server error" }
 * Notes: Calls Convex action intakes.deleteIntake (storage + DB cleanup).
 */
