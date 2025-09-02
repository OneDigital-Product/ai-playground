import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ConvexHttpClient } from "convex/browser";
import type { FunctionReference } from "convex/server";
import { api } from "@repo/backend/convex/_generated/api";

// Status validation schema
const statusSchema = z.enum([
  "NOT_STARTED",
  "STARTED", 
  "ROADBLOCK",
  "READY_FOR_QA",
  "DELIVERED_TO_CONSULTANT"
]);

const updateStatusSchema = z.object({
  status: statusSchema,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ intakeId: string }> }
) {
  try {
    const { intakeId } = await params;
    
    if (!intakeId) {
      return NextResponse.json(
        { error: "Intake ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const result = updateStatusSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          error: "Invalid status", 
          fieldErrors: result.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    // Call Convex mutation to update status
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    await convex.mutation(
      api.functions.intakes.updateStatus as FunctionReference<"mutation">,
      {
        intakeId,
        status: result.data.status,
      }
    );

    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    console.error("Error updating intake status:", error);
    if (error instanceof Error && /not found/i.test(error.message)) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
/**
 * POST /enrollment-dashboard/api/intakes/[intakeId]/status
 * Description: Update the status of an intake.
 * Body: { status: 'NOT_STARTED'|'STARTED'|'ROADBLOCK'|'READY_FOR_QA'|'DELIVERED_TO_CONSULTANT' }
 * 200: { success: true }
 * 400: { error, fieldErrors? }
 * 404: { error: 'Intake not found' }
 * 500: { error: 'Internal server error' }
 * Notes: Calls Convex intakes.updateStatus.
 */
