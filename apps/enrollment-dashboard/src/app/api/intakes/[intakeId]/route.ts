import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@repo/backend/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function DELETE(
  request: NextRequest,
  { params }: { params: { intakeId: string } }
) {
  try {
    const { intakeId } = params;
    
    // Delete intake via Convex action (handles cascading deletion)
    const result = await convex.action(api.functions.intakes.deleteIntake, {
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