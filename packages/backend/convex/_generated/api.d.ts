/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FunctionReference } from "convex/server";

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: {
  functions: {
    intakes: {
      create: FunctionReference<
        "mutation",
        "public",
        {
          clientName: string;
          communicationsAddOns:
            | "None"
            | "OE Letter"
            | "OE Presentation"
            | "Both"
            | "Other";
          guideType: "Update Existing Guide" | "New Guide Build";
          notesGeneral?: string;
          payrollStorageUrl: string;
          planYear: number;
          requestedProductionTime: "Standard" | "Rush";
          requestorName: string;
          sectionsChangedFlags?: {
            A: boolean;
            B: boolean;
            C: boolean;
            D: boolean;
            E: boolean;
            F: boolean;
            G: boolean;
            H: boolean;
            I: boolean;
            J: boolean;
            K: boolean;
            L: boolean;
            M: boolean;
            N: boolean;
            O: boolean;
            P: boolean;
            Q: boolean;
          };
          sectionsIncludedFlags?: {
            A: boolean;
            B: boolean;
            C: boolean;
            D: boolean;
            E: boolean;
            F: boolean;
            G: boolean;
            H: boolean;
            I: boolean;
            J: boolean;
            K: boolean;
            L: boolean;
            M: boolean;
            N: boolean;
            O: boolean;
            P: boolean;
            Q: boolean;
          };
        },
        any
      >;
      get: FunctionReference<"query", "public", { intakeId: string }, any>;
      list: FunctionReference<
        "query",
        "public",
        {
          complexityBand?: Array<"Minimal" | "Low" | "Medium" | "High">;
          order?: "asc" | "desc";
          planYear?: number;
          requestedProductionTime?: Array<"Standard" | "Rush">;
          requestorName?: string;
          sortBy?:
            | "clientName"
            | "requestorName"
            | "guideType"
            | "communicationsAddOns"
            | "complexityBand"
            | "dateReceived"
            | "status"
            | "requestedProductionTime";
          status?: Array<
            | "NOT_STARTED"
            | "STARTED"
            | "ROADBLOCK"
            | "READY_FOR_QA"
            | "DELIVERED_TO_CONSULTANT"
          >;
        },
        any
      >;
      updateStatus: FunctionReference<
        "mutation",
        "public",
        {
          intakeId: string;
          status:
            | "NOT_STARTED"
            | "STARTED"
            | "ROADBLOCK"
            | "READY_FOR_QA"
            | "DELIVERED_TO_CONSULTANT";
        },
        any
      >;
      updateComplexityFactors: FunctionReference<
        "mutation",
        "public",
        {
          communicationsAddOns?:
            | "None"
            | "OE Letter"
            | "OE Presentation"
            | "Both"
            | "Other";
          guideType?: "Update Existing Guide" | "New Guide Build";
          intakeId: string;
          sectionsChangedFlags?: {
            A: boolean;
            B: boolean;
            C: boolean;
            D: boolean;
            E: boolean;
            F: boolean;
            G: boolean;
            H: boolean;
            I: boolean;
            J: boolean;
            K: boolean;
            L: boolean;
            M: boolean;
            N: boolean;
            O: boolean;
            P: boolean;
            Q: boolean;
          };
        },
        any
      >;
      deleteIntake: FunctionReference<
        "action",
        "public",
        { intakeId: string },
        any
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { intakeId: string },
        any
      >;
      updateSectionFlags: FunctionReference<
        "mutation",
        "public",
        {
          changed?: boolean;
          included?: boolean;
          intakeId: string;
          sectionCode:
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
            | "Q";
        },
        any
      >;
      stats: FunctionReference<"query", "public", {}, any>;
      exportCsv: FunctionReference<
        "query",
        "public",
        {
          filters?: {
            complexityBand?: Array<string>;
            planYear?: number;
            requestedProductionTime?: Array<string>;
            requestorName?: string;
            status?: Array<string>;
          };
          order?: "asc" | "desc";
          sortBy?:
            | "clientName"
            | "requestorName"
            | "guideType"
            | "communicationsAddOns"
            | "complexityBand"
            | "dateReceived"
            | "status"
            | "requestedProductionTime";
        },
        any
      >;
    };
    messages: {
      list: FunctionReference<"query", "public", {}, any>;
      send: FunctionReference<
        "mutation",
        "public",
        { author: string; body: string },
        any
      >;
    };
    retirementPlans: {
      save: FunctionReference<
        "mutation",
        "public",
        {
          eligibleEmployees: number;
          investmentReturn: number;
          participants: number;
        },
        any
      >;
      list: FunctionReference<"query", "public", {}, any>;
    };
    sections: {
      upsert: FunctionReference<
        "mutation",
        "public",
        {
          intakeId: string;
          payload: { change_description?: string };
          sectionCode:
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
            | "Q";
        },
        any
      >;
      getByIntake: FunctionReference<
        "query",
        "public",
        { intakeId: string },
        any
      >;
      bulkCreate: FunctionReference<
        "mutation",
        "public",
        {
          sections: Array<{
            intakeId: string;
            payload: { change_description?: string };
            sectionCode:
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
              | "Q";
          }>;
        },
        any
      >;
      deleteSection: FunctionReference<
        "mutation",
        "public",
        {
          intakeId: string;
          sectionCode:
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
            | "Q";
        },
        any
      >;
      getSection: FunctionReference<
        "query",
        "public",
        {
          intakeId: string;
          sectionCode:
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
            | "Q";
        },
        any
      >;
      deleteByIntake: FunctionReference<
        "mutation",
        "public",
        { intakeId: string },
        any
      >;
    };
    uploads: {
      uploadFile: FunctionReference<
        "action",
        "public",
        {
          file: any;
          intakeId: string;
          kind: "GUIDE" | "PLAN_DOC" | "PAYROLL_SCREEN" | "OTHER";
        },
        any
      >;
      create: FunctionReference<
        "mutation",
        "public",
        {
          bytes: number;
          intakeId: string;
          kind: "GUIDE" | "PLAN_DOC" | "PAYROLL_SCREEN" | "OTHER";
          mimeType: string;
          originalName: string;
          storedKey: string;
        },
        any
      >;
      get: FunctionReference<
        "query",
        "public",
        { uploadId: Id<"uploads"> },
        any
      >;
      listByIntake: FunctionReference<
        "query",
        "public",
        { intakeId: string },
        any
      >;
      deleteUpload: FunctionReference<
        "action",
        "public",
        { uploadId: Id<"uploads"> },
        any
      >;
      remove: FunctionReference<
        "mutation",
        "public",
        { uploadId: Id<"uploads"> },
        any
      >;
      download: FunctionReference<
        "query",
        "public",
        { uploadId: Id<"uploads"> },
        any
      >;
      getDownloadUrl: FunctionReference<
        "action",
        "public",
        { uploadId: Id<"uploads"> },
        any
      >;
      getStatsForIntake: FunctionReference<
        "query",
        "public",
        { intakeId: string },
        any
      >;
      updateMetadata: FunctionReference<
        "mutation",
        "public",
        {
          kind?: "GUIDE" | "PLAN_DOC" | "PAYROLL_SCREEN" | "OTHER";
          originalName?: string;
          uploadId: Id<"uploads">;
        },
        any
      >;
    };
  };
};

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: {};

export declare const components: {};
