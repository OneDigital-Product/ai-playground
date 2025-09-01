export const REQUESTOR_NAMES = [
  "John Doe",
  "Jane Smith",
  "Mike Johnson",
  "Sarah Wilson",
  "David Brown",
  "Lisa Garcia",
  "Robert Davis",
  "Emily Chen",
  "Tom Anderson",
  "Maria Rodriguez",
] as const;

export type RequestorName = (typeof REQUESTOR_NAMES)[number];

