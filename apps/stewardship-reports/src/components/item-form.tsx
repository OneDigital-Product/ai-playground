"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api.js";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Textarea } from "@repo/ui/components/ui/textarea";

export function ItemForm() {
  const create = useMutation(api.functions.stewardship.create);
  const [description, setDescription] = useState("");
  const [month, setMonth] = useState("1");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await create({
      description,
      month: Number(month),
      year: Number(year),
      category: category || undefined,
      metadata: notes ? { notes } : undefined,
    });
    setDescription("");
    setCategory("");
    setNotes("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Month</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger>
              <SelectValue />
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
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <Button type="submit">Add Item</Button>
    </form>
  );
}
