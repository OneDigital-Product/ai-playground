import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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

    // TODO: In a real implementation, you would:
    // 1. Validate the intakeId exists
    // 2. Update the intake status in your database
    // 3. Return the updated intake or success response
    
    // For now, simulate success since the actual update happens via Convex
    // This route serves as validation and can be extended for additional logging
    // or webhooks in the future
    // The status is validated by the schema above
    
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    console.error("Error updating intake status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}