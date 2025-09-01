import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@repo/backend/convex/_generated/api";
import { z } from "zod";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Validation schema for section update
const SectionUpdateSchema = z.object({
  change_description: z.string().optional(),
});

// POST /api/intakes/[intakeId]/sections/[code] - Update section description
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ intakeId: string; code: string }> }
) {
  try {
    const { intakeId, code } = await params;
    
    // Validate section code
    if (!code || !code.match(/^[A-Q]$/)) {
      return NextResponse.json(
        { error: "Invalid section code. Must be A-Q." },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validation = SectionUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          fieldErrors: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { change_description } = validation.data;

    // Call Convex mutation
    const result = await convex.mutation(api.functions.sections.upsert, {
      intakeId,
      sectionCode: code as "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q",
      payload: { change_description },
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Section update error:", error);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
}
/**
 * POST /enrollment-dashboard/api/intakes/[intakeId]/sections/[code]
 * Description: Upsert a section's change description for an intake.
 * Body: { change_description?: string }
 * 200: { success: true, result }
 * 400: { error, fieldErrors? }
 * 500: { error: 'Failed to update section' }
 * Notes: Validates section code (A–Q); calls Convex sections.upsert.
 */
