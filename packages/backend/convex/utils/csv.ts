export type SortField =
  | "clientName"
  | "requestorName"
  | "guideType"
  | "communicationsAddOns"
  | "complexityBand"
  | "dateReceived"
  | "status"
  | "requestedProductionTime";

export type SortOrder = "asc" | "desc";

export function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function sortForExport<T extends Record<string, unknown>>(
  items: T[],
  sortBy: SortField,
  order: SortOrder
): T[] {
  return [...items].sort((a, b) => {
    const aRaw = a[sortBy as keyof T] as unknown;
    const bRaw = b[sortBy as keyof T] as unknown;
    let aVal: string | number = typeof aRaw === "number" ? aRaw : String(aRaw ?? "");
    let bVal: string | number = typeof bRaw === "number" ? bRaw : String(bRaw ?? "");

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
}
