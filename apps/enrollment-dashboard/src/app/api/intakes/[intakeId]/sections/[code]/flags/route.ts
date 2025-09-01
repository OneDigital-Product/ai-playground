import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@repo/backend/convex/_generated/api";
import { z } from "zod";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Validation schema for flags update
const FlagsUpdateSchema = z.object({
  changed: z.boolean().optional(),
  included: z.boolean().optional(),
});

// POST /api/intakes/[intakeId]/sections/[code]/flags - Update section flags
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
    const validation = FlagsUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          fieldErrors: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { changed, included } = validation.data;

    // At least one flag must be provided
    if (changed === undefined && included === undefined) {
      return NextResponse.json(
        { error: "At least one flag (changed or included) must be provided" },
        { status: 400 }
      );
    }

    // Call Convex mutation
    const result = await convex.mutation(api.functions.intakes.updateSectionFlags, {
      intakeId,
      sectionCode: code as "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q",
      changed,
      included,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Section flags update error:", error);
    return NextResponse.json(
      { error: "Failed to update section flags" },
      { status: 500 }
    );
  }
}
/**
 * POST /enrollment-dashboard/api/intakes/[intakeId]/sections/[code]/flags
 * Description: Update section-level flags (changed, included) on an intake.
 * Body: { changed?: boolean, included?: boolean }
 * 200: { success: true, result }
 * 400: { error, fieldErrors? }
 * 500: { error: 'Failed to update section flags' }
 * Notes: Validates section code (A–Q); calls Convex intakes.updateSectionFlags.
 */
