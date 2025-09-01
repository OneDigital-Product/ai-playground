import { NextRequest, NextResponse } from "next/server";
import { validateIntakeCreate } from "@/lib/schemas";
import { ConvexHttpClient } from "convex/browser";
import type { FunctionReference } from "convex/server";
import { api } from "@repo/backend/convex/_generated/api";

// Define requestor names as enum for consistency
const REQUESTOR_NAMES = [
  "John Doe",
  "Jane Smith", 
  "Mike Johnson",
  "Sarah Wilson",
  "David Brown",
  "Lisa Garcia",
  "Robert Davis",
  "Emily Chen",
  "Tom Anderson",
  "Maria Rodriguez"
] as const;

type RequestorName = typeof REQUESTOR_NAMES[number];

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

// Export the list of requestor names for use in components
export { REQUESTOR_NAMES };
