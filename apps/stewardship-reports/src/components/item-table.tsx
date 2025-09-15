"use client";

import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api.js";
import type { Doc } from "@repo/backend/convex/_generated/dataModel";
import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@repo/ui/components/ui/table";
import { Trash2 } from "lucide-react";

export function ItemTable({ items }: { items: Doc<"stewardshipItems">[] }) {
  const remove = useMutation(api.functions.stewardship.remove);

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No items</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead>Month</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item._id}>
            <TableCell>{item.description}</TableCell>
            <TableCell>{item.month}</TableCell>
            <TableCell>{item.year}</TableCell>
            <TableCell>{item.category ?? ""}</TableCell>
            <TableCell>{item.metadata?.notes ?? ""}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove({ id: item._id })}
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
