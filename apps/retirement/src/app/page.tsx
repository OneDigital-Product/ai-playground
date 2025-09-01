"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";

export default function Page() {
  const savePlan = useMutation("functions/retirementPlans:save");
  const [eligibleEmployees, setEligibleEmployees] = useState(0);
  const [participants, setParticipants] = useState(0);
  const [investmentReturn, setInvestmentReturn] = useState(0);

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-bold">5-Year Retirement Plan</h1>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await savePlan({
            eligibleEmployees,
            participants,
            investmentReturn,
          });
          setEligibleEmployees(0);
          setParticipants(0);
          setInvestmentReturn(0);
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="eligibleEmployees">Eligible Employees</Label>
          <Input
            id="eligibleEmployees"
            type="number"
            value={eligibleEmployees}
            onChange={(e) => setEligibleEmployees(Number(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="participants">Participants</Label>
          <Input
            id="participants"
            type="number"
            value={participants}
            onChange={(e) => setParticipants(Number(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="investmentReturn">Investment Return (%)</Label>
          <Input
            id="investmentReturn"
            type="number"
            step="0.01"
            value={investmentReturn}
            onChange={(e) => setInvestmentReturn(Number(e.target.value))}
            required
          />
        </div>
        <Button type="submit">Save Plan</Button>
      </form>
    </main>
  );
}
