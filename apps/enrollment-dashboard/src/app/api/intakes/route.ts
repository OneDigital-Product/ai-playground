import { NextRequest, NextResponse } from "next/server";
import { validateIntakeCreate } from "@/lib/schemas";

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
  try {
    const body = await request.json();
    
    // Validate the incoming data
    const validation = validateIntakeCreate(body);
    
    if (!validation.success) {
      return NextResponse.json(validation.error, { status: 400 });
    }
    
    const data = validation.data;
    
    // Additional validation for requestor name
    if (!REQUESTOR_NAMES.includes(data.requestorName as RequestorName)) {
      return NextResponse.json({
        error: "Invalid requestor name",
        fieldErrors: {
          requestorName: ["Please select a valid requestor name"]
        }
      }, { status: 400 });
    }

    // For now, just return a mock response since we need to fix the Convex integration
    // TODO: Replace with actual Convex API call once TypeScript issues are resolved
    const mockIntakeId = `INT-${Date.now().toString().slice(-6)}`;
    
    return NextResponse.json({
      intakeId: mockIntakeId
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating intake:", error);
    
    // Handle specific Convex errors
    if (error instanceof Error) {
      if (error.message.includes("validation") || error.message.includes("required")) {
        return NextResponse.json({
          error: error.message,
          fieldErrors: {}
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({
      error: "Failed to create intake. Please try again."
    }, { status: 500 });
  }
}

// Export the list of requestor names for use in components
export { REQUESTOR_NAMES };