import { mutation } from "../_generated/server";

// Migration exposed as a function under functions/ so it's deployable and callable.
export const migrateCommunicationsAddOns = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("intakes").collect();
    let updated = 0;

    for (const i of all) {
      const doc: any = i;
      let { communicationsAddOns } = doc;
      let next: any[] | undefined = undefined;

      if (Array.isArray(communicationsAddOns)) {
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

