import { NextRequest, NextResponse } from "next/server";
import { validateIntakeCreate } from "@/lib/schemas";
import { ConvexHttpClient } from "convex/browser";
import type { FunctionReference } from "convex/server";
import { api } from "@repo/backend/convex/_generated/api";
import { REQUESTOR_NAMES, type RequestorName } from "@/lib/constants";

// REQUESTOR_NAMES moved to shared constants module

export async function POST(request: NextRequest) {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  try {
    const body = await request.json();

    // Validate the incoming data
    const validation = validateIntakeCreate(body);

    if (!validation.success) {
      return NextResponse.json(validation.error, { status: 400 });
    }

    const data = validation.data as typeof validation.data & {
      sectionDescriptions?: Record<string, string>;
    };

    // Additional validation for requestor name
    if (!REQUESTOR_NAMES.includes(data.requestorName as RequestorName)) {
      return NextResponse.json(
        {
          error: "Invalid requestor name",
          fieldErrors: {
            requestorName: ["Please select a valid requestor name"],
          },
        },
        { status: 400 }
      );
    }

    // Create intake via Convex
    const { sectionDescriptions = {}, ...intakeArgs } = data;

    const createResult = await convex.mutation(
      api.functions.intakes.create as FunctionReference<"mutation">,
      intakeArgs as any
    );

    // Create initial sections if marked changed and have descriptions
    const changedFlags = (intakeArgs as any).sectionsChangedFlags as
      | Record<string, boolean>
      | undefined;

    if (changedFlags) {
      const sections = Object.entries(changedFlags)
        .filter(([code, changed]) => Boolean(changed) && !!sectionDescriptions[code])
        .map(([sectionCode]) => ({
          intakeId: createResult.intakeId as string,
          sectionCode: sectionCode as
            | "A"
            | "B"
            | "C"
            | "D"
            | "E"
            | "F"
            | "G"
            | "H"
            | "I"
            | "J"
            | "K"
            | "L"
            | "M"
            | "N"
            | "O"
            | "P"
            | "Q",
          payload: { change_description: sectionDescriptions[sectionCode]! },
        }));

      if (sections.length > 0) {
        await convex.mutation(
          api.functions.sections.bulkCreate as FunctionReference<"mutation">,
          { sections }
        );
      }
    }

    return NextResponse.json(
      {
        intakeId: createResult.intakeId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating intake:", error);

    if (error instanceof Error) {
      if (error.message.match(/validation|required|invalid/i)) {
        return NextResponse.json(
          { error: error.message, fieldErrors: {} },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create intake. Please try again." },
      { status: 500 }
    );
  }
}

// Components should import REQUESTOR_NAMES from '@/lib/constants'
/**
 * POST /enrollment-dashboard/api/intakes
 * Description: Create a new intake and (optionally) seed initial section details.
 * Body: IntakeCreate + optional sectionDescriptions (Record<'A'..'Q', string>)
 * 201: { intakeId }
 * 400: { error, fieldErrors? } (validation)
 * 500: { error }
 * Notes: Calls Convex intakes.create and sections.bulkCreate. Error shape is standardized.
 */
