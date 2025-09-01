import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Upload a file to an intake via HTTP (hybrid alternative to Next route)
// POST /enrollment/uploads?intakeId=...&kind=GUIDE|PLAN_DOC|PAYROLL_SCREEN|OTHER
http.route({
  path: "/enrollment/uploads",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const intakeId = url.searchParams.get("intakeId");
    const kind = url.searchParams.get("kind") as
      | "GUIDE"
      | "PLAN_DOC"
      | "PAYROLL_SCREEN"
      | "OTHER"
      | null;

    if (!intakeId || !kind) {
      return new Response(
        JSON.stringify({ error: "Missing intakeId or kind" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const blob = await request.blob();
      const result = await ctx.runAction(api.functions.uploads.uploadFile, {
        intakeId,
        kind,
        file: blob,
      });

      return new Response(
        JSON.stringify({ file: result }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      return new Response(
        JSON.stringify({ error: message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// Redirect to a signed download URL
// GET /enrollment/uploads/download?id=<uploadId>
http.route({
  path: "/enrollment/uploads/download",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    try {
      const download = await ctx.runAction(
        api.functions.uploads.getDownloadUrl,
        { uploadId: id as unknown as import("./_generated/dataModel").Id<"uploads"> }
      );
      if (!download?.url) {
        return new Response(JSON.stringify({ error: "File not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return Response.redirect(download.url, 302);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Download failed";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// CSV export via Convex HTTP action (matches Next route behavior)
// GET /enrollment/dashboard.csv?...filters&sortBy&order
http.route({
  path: "/enrollment/dashboard.csv",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);

    const parseJsonArray = (value: string | null) => {
      if (!value) return undefined;
      try {
        const arr = JSON.parse(value);
        return Array.isArray(arr) ? arr : undefined;
      } catch {
        return undefined;
      }
    };

    type ExportFilters = {
      status?: string[];
      complexityBand?: string[];
      requestorName?: string;
      planYear?: number;
      requestedProductionTime?: string[];
    };
    const filters: ExportFilters = {};
    const status = parseJsonArray(searchParams.get("status"));
    if (status) filters.status = status;
    const complexityBand = parseJsonArray(searchParams.get("complexityBand"));
    if (complexityBand) filters.complexityBand = complexityBand;
    const requestorName = searchParams.get("requestorName");
    if (requestorName) filters.requestorName = requestorName;
    const planYearStr = searchParams.get("planYear");
    if (planYearStr && !Number.isNaN(Number(planYearStr))) {
      filters.planYear = Number(planYearStr);
    }
    const requestedProductionTime = parseJsonArray(
      searchParams.get("requestedProductionTime")
    );
    if (requestedProductionTime) filters.requestedProductionTime = requestedProductionTime;

    try {
      const csv = await ctx.runQuery(api.functions.intakes.exportCsv, {
        filters: Object.keys(filters).length ? filters : undefined,
      });

      const timestamp = new Date().toISOString().slice(0, 10);
      const headers = new Headers({
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="enrollment-dashboard-export-${timestamp}.csv"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
      return new Response(csv as string, { status: 200, headers });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Export failed";
      return new Response(
        JSON.stringify({ error: "Failed to export CSV", details: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;
