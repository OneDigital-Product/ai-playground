import { mutation } from "../_generated/server";

// Migration: Convert legacy communicationsAddOns into new array form
// - "None" => []
// - "Both" => ["OE Letter", "OE Presentation"]
// - "Other" => ["Other"] (no custom text)
// - single strings => [value]
// - already arrays are left as-is
export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("intakes").collect();
    let updated = 0;

    for (const i of all) {
      let { communicationsAddOns } = i as any;
      let next: any[] | undefined = undefined;

      if (Array.isArray(communicationsAddOns)) {
        // If already new format with objects or strings, keep
        next = communicationsAddOns;
      } else if (typeof communicationsAddOns === "string") {
        switch (communicationsAddOns) {
          case "None":
            next = [];
            break;
          case "Both":
            next = ["OE Letter", "OE Presentation"];
            break;
          case "Other":
            next = ["Other"]; // legacy: no custom text
            break;
          case "OE Letter":
          case "OE Presentation":
            next = [communicationsAddOns];
            break;
          default:
            next = [];
        }
      }

      if (next !== undefined) {
        await ctx.db.patch(i._id, { communicationsAddOns: next } as any);
        updated += 1;
      }
    }

    return { updated };
  },
});

