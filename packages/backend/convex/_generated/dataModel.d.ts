/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  DocumentByName,
  TableNamesInDataModel,
  SystemTableNames,
  AnyDataModel,
} from "convex/server";
import type { GenericId } from "convex/values";

/**
 * A type describing your Convex data model.
 *
 * This type includes information about what tables you have, the type of
 * documents stored in those tables, and the indexes defined on them.
 *
 * This type is used to parameterize methods like `queryGeneric` and
 * `mutationGeneric` to make them type-safe.
 */

export type DataModel = {
  intakes: {
    document: {
      clientName: string;
      communicationsAddOns: Array<
        | "OE Letter"
        | "OE Presentation"
        | "Other"
        | { text: string; type: "Other" }
      >;
      complexityBand: "Minimal" | "Low" | "Medium" | "High";
      complexityScore: number;
      createdAt: string;
      dateReceived: string;
      guideType: "Update Existing Guide" | "New Guide Build";
      intakeId: string;
      notesGeneral?: string;
      payrollStorageUrl: string;
      planYear: number;
      requestedProductionTime: "Standard" | "Rush";
      requestorName: string;
      sectionsChangedFlags: {
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
      sectionsIncludedFlags: {
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
      status:
        | "NOT_STARTED"
        | "STARTED"
        | "ROADBLOCK"
        | "READY_FOR_QA"
        | "DELIVERED_TO_CONSULTANT";
      updatedAt: string;
      _id: Id<"intakes">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "clientName"
      | "communicationsAddOns"
      | "complexityBand"
      | "complexityScore"
      | "createdAt"
      | "dateReceived"
      | "guideType"
      | "intakeId"
      | "notesGeneral"
      | "payrollStorageUrl"
      | "planYear"
      | "requestedProductionTime"
      | "requestorName"
      | "sectionsChangedFlags.A"
      | "sectionsChangedFlags.B"
      | "sectionsChangedFlags.C"
      | "sectionsChangedFlags.D"
      | "sectionsChangedFlags.E"
      | "sectionsChangedFlags.F"
      | "sectionsChangedFlags.G"
      | "sectionsChangedFlags.H"
      | "sectionsChangedFlags.I"
      | "sectionsChangedFlags.J"
      | "sectionsChangedFlags.K"
      | "sectionsChangedFlags.L"
      | "sectionsChangedFlags.M"
      | "sectionsChangedFlags.N"
      | "sectionsChangedFlags.O"
      | "sectionsChangedFlags.P"
      | "sectionsChangedFlags.Q"
      | "sectionsIncludedFlags.A"
      | "sectionsIncludedFlags.B"
      | "sectionsIncludedFlags.C"
      | "sectionsIncludedFlags.D"
      | "sectionsIncludedFlags.E"
      | "sectionsIncludedFlags.F"
      | "sectionsIncludedFlags.G"
      | "sectionsIncludedFlags.H"
      | "sectionsIncludedFlags.I"
      | "sectionsIncludedFlags.J"
      | "sectionsIncludedFlags.K"
      | "sectionsIncludedFlags.L"
      | "sectionsIncludedFlags.M"
      | "sectionsIncludedFlags.N"
      | "sectionsIncludedFlags.O"
      | "sectionsIncludedFlags.P"
      | "sectionsIncludedFlags.Q"
      | "status"
      | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_complexityBand: ["complexityBand", "_creationTime"];
      by_dateReceived: ["dateReceived", "_creationTime"];
      by_intakeId: ["intakeId", "_creationTime"];
      by_planYear: ["planYear", "_creationTime"];
      by_requestorName: ["requestorName", "_creationTime"];
      by_status: ["status", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  messages: {
    document: {
      author: string;
      body: string;
      _id: Id<"messages">;
      _creationTime: number;
    };
    fieldPaths: "_creationTime" | "_id" | "author" | "body";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  retirementPlans: {
    document: {
      eligibleEmployees: number;
      investmentReturn: number;
      participants: number;
      _id: Id<"retirementPlans">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "eligibleEmployees"
      | "investmentReturn"
      | "participants";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  section_details: {
    document: {
      createdAt: string;
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
      _id: Id<"section_details">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "createdAt"
      | "intakeId"
      | "payload.change_description"
      | "sectionCode";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_intakeId: ["intakeId", "_creationTime"];
      by_intakeId_sectionCode: ["intakeId", "sectionCode", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  uploads: {
    document: {
      bytes: number;
      createdAt: string;
      intakeId: string;
      kind: "GUIDE" | "PLAN_DOC" | "PAYROLL_SCREEN" | "OTHER";
      mimeType: string;
      originalName: string;
      storedKey: string;
      _id: Id<"uploads">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "bytes"
      | "createdAt"
      | "intakeId"
      | "kind"
      | "mimeType"
      | "originalName"
      | "storedKey";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_intakeId: ["intakeId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
};

/**
 * The names of all of your Convex tables.
 */
export type TableNames = TableNamesInDataModel<DataModel>;

/**
 * The type of a document stored in Convex.
 *
 * @typeParam TableName - A string literal type of the table name (like "users").
 */
export type Doc<TableName extends TableNames> = DocumentByName<
  DataModel,
  TableName
>;

/**
 * An identifier for a document in Convex.
 *
 * Convex documents are uniquely identified by their `Id`, which is accessible
 * on the `_id` field. To learn more, see [Document IDs](https://docs.convex.dev/using/document-ids).
 *
 * Documents can be loaded using `db.get(id)` in query and mutation functions.
 *
 * IDs are just strings at runtime, but this type can be used to distinguish them from other
 * strings when type checking.
 *
 * @typeParam TableName - A string literal type of the table name (like "users").
 */
export type Id<TableName extends TableNames | SystemTableNames> =
  GenericId<TableName>;
