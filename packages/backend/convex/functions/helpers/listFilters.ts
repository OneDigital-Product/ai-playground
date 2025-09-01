import { v } from "convex/values";

export type ListArgs = {
  status?: string[];
  complexityBand?: string[];
  requestorName?: string;
  planYear?: number;
  requestedProductionTime?: string[];
  sortBy?:
    | "clientName"
    | "requestorName"
    | "guideType"
    | "communicationsAddOns"
    | "complexityBand"
    | "dateReceived"
    | "status"
    | "requestedProductionTime";
  order?: "asc" | "desc";
};

export type IntakeItem = Record<string, any>;

export function applyFiltersAndSorting<T extends IntakeItem>(
  items: T[],
  args: ListArgs
): T[] {
  let results = [...items];

  // Apply filters regardless of earlier index selection
  if (args.status && args.status.length > 0) {
    const set = new Set(args.status);
    results = results.filter((i) => set.has(i.status));
  }
  if (args.complexityBand && args.complexityBand.length > 0) {
    const set = new Set(args.complexityBand);
    results = results.filter((i) => set.has(i.complexityBand));
  }
  if (args.requestorName) {
    const needle = args.requestorName.toLowerCase();
    results = results.filter((i) => i.requestorName.toLowerCase().includes(needle));
  }
  if (typeof args.planYear === "number") {
    results = results.filter((i) => i.planYear === args.planYear);
  }
  if (args.requestedProductionTime && args.requestedProductionTime.length > 0) {
    const set = new Set(args.requestedProductionTime);
    results = results.filter((i) => set.has(i.requestedProductionTime));
  }

  const sortBy = args.sortBy || "dateReceived";
  const order = args.order || "desc";
  results.sort((a, b) => {
    let aVal: string | number = a[sortBy as keyof T] as any;
    let bVal: string | number = b[sortBy as keyof T] as any;

    if (sortBy === "dateReceived") {
      aVal = new Date(aVal as string).getTime();
      bVal = new Date(bVal as string).getTime();
    } else {
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
    }

    let cmp = 0;
    if (aVal < bVal) cmp = -1;
    if (aVal > bVal) cmp = 1;
    return order === "asc" ? cmp : -cmp;
  });

  return results;
}

