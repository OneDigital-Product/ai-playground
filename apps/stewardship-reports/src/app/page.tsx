"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api.js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@repo/ui/components/ui/card";
import { Label } from "@repo/ui/components/ui/label";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { ItemForm } from "../components/item-form";
import { ItemTable } from "../components/item-table";

export default function Page() {
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");

  const args = useMemo(() => {
    const start =
      startMonth && startYear
        ? { month: Number(startMonth), year: Number(startYear) }
        : undefined;
    const end =
      endMonth && endYear
        ? { month: Number(endMonth), year: Number(endYear) }
        : undefined;
    return { start, end };
  }, [startMonth, startYear, endMonth, endYear]);

  const items = useQuery(api.functions.stewardship.list, args) ?? [];

  function clearFilters() {
    setStartMonth("");
    setStartYear("");
    setEndMonth("");
    setEndYear("");
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <Card className="gap-4 py-5">
        <CardHeader className="pb-4">
          <CardTitle>Add Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ItemForm />
        </CardContent>
      </Card>

      <Card className="gap-4 py-5">
        <CardHeader className="pb-4">
          <CardTitle>Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start Month</Label>
              <Select value={startMonth} onValueChange={setStartMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i + 1} value={`${i + 1}`}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Start Year</Label>
              <Input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>End Month</Label>
              <Select value={endMonth} onValueChange={setEndMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i + 1} value={`${i + 1}`}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>End Year</Label>
              <Input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          </div>
          <ItemTable items={items} />
        </CardContent>
      </Card>
    </main>
  );
}
