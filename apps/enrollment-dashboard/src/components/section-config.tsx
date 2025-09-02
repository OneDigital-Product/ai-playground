"use client";

import { Label } from "@repo/ui/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Textarea } from "@repo/ui/components/ui/textarea";
import type { SectionCode } from "@/lib/schemas";
import type { IntakeCreate } from "@/lib/schemas";

type FormData = IntakeCreate & {
  sectionDescriptions: Record<string, string>;
};

export function SectionConfig({
  section,
  formData,
  updateSectionFlags,
  updateSectionDescription,
}: {
  section: { code: keyof typeof SectionCode; name: string };
  formData: FormData;
  updateSectionFlags: (
    sectionCode: keyof typeof SectionCode,
    flagType: "changed" | "included",
    value: boolean
  ) => void;
  updateSectionDescription: (sectionCode: string, description: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Include in Guide</Label>
        <RadioGroup
          value={formData.sectionsIncludedFlags?.[section.code] ? "yes" : "no"}
          onValueChange={(value) => updateSectionFlags(section.code, "included", value === "yes")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id={`${section.code}-include-yes`} />
            <Label htmlFor={`${section.code}-include-yes`} className="text-sm">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id={`${section.code}-include-no`} />
            <Label htmlFor={`${section.code}-include-no`} className="text-sm">No</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Changes Beyond Annual Updates</Label>
        <RadioGroup
          value={formData.sectionsChangedFlags?.[section.code] ? "yes" : "no"}
          onValueChange={(value) => updateSectionFlags(section.code, "changed", value === "yes")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id={`${section.code}-changed-yes`} />
            <Label htmlFor={`${section.code}-changed-yes`} className="text-sm">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id={`${section.code}-changed-no`} />
            <Label htmlFor={`${section.code}-changed-no`} className="text-sm">No</Label>
          </div>
        </RadioGroup>
      </div>
      {formData.sectionsChangedFlags?.[section.code] && (
        <div className="space-y-2">
          <Label htmlFor={`${section.code}-description`} className="text-xs text-muted-foreground">
            Change Description
          </Label>
          <Textarea
            id={`${section.code}-description`}
            value={formData.sectionDescriptions[section.code] || ""}
            onChange={(e) => updateSectionDescription(section.code, e.target.value)}
            placeholder="Describe the changes for this section"
            className="min-h-[80px]"
          />
        </div>
      )}
    </div>
  );
}

export default SectionConfig;

