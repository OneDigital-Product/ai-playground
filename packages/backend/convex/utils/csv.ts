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

export function sortForExport<T extends Record<string, any>>(
  items: T[],
  sortBy: SortField,
  order: SortOrder
): T[] {
  return [...items].sort((a, b) => {
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
}

