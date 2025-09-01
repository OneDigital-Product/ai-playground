"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
// import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { intakeCreateSchema, GuideType, CommunicationsAddOns, ProductionTime, SectionCode, type IntakeCreate } from "@/lib/schemas";
import { z } from "zod";

// Requestor names list (should match API)
const REQUESTOR_NAMES = [
  "John Doe",
  "Jane Smith", 
  "Mike Johnson",
  "Sarah Wilson",
  "David Brown",
  "Lisa Garcia",
  "Robert Davis",
  "Emily Chen",
  "Tom Anderson",
  "Maria Rodriguez"
] as const;

// Section definitions with human-readable names
const SECTIONS = [
  { code: 'A' as const, name: 'Plan Design Overview' },
  { code: 'B' as const, name: 'Eligibility Requirements' },
  { code: 'C' as const, name: 'Employee Contribution Options' },
  { code: 'D' as const, name: 'Employer Contribution Overview' },
  { code: 'E' as const, name: 'Vesting Schedule' },
  { code: 'F' as const, name: 'Investment Options' },
  { code: 'G' as const, name: 'Loans and Withdrawals' },
  { code: 'H' as const, name: 'Distribution Options' },
  { code: 'I' as const, name: 'Fee Structure' },
  { code: 'J' as const, name: 'Administrative Services' },
  { code: 'K' as const, name: 'Compliance Testing' },
  { code: 'L' as const, name: 'Employee Communication' },
  { code: 'M' as const, name: 'Enrollment Process' },
  { code: 'N' as const, name: 'Payroll Integration' },
  { code: 'O' as const, name: 'Reporting and Record Keeping' },
  { code: 'P' as const, name: 'Plan Amendments' },
  { code: 'Q' as const, name: 'Additional Services' }
];

type FormData = IntakeCreate & {
  sectionDescriptions: Record<string, string>;
};

type FormErrors = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export function IntakeForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Form state with proper defaults
  const [formData, setFormData] = useState<FormData>({
    clientName: "",
    planYear: 2025,
    requestorName: "",
    payrollStorageUrl: "",
    guideType: GuideType.UPDATE_EXISTING_GUIDE,
    communicationsAddOns: CommunicationsAddOns.NONE,
    requestedProductionTime: ProductionTime.STANDARD,
    notesGeneral: "",
    sectionsChangedFlags: {
      A: false, B: false, C: false, D: false, E: false, F: false, G: false,
      H: false, I: false, J: false, K: false, L: false, M: false, N: false,
      O: false, P: false, Q: false
    },
    sectionsIncludedFlags: {
      A: true, B: true, C: true, D: true, E: true, F: true, G: true,
      H: true, I: true, J: true, K: true, L: true, M: true, N: true,
      O: true, P: true, Q: true
    },
    sectionDescriptions: {}
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific errors when user starts typing
    if (errors.fieldErrors?.[field]) {
      setErrors(prev => ({
        ...prev,
        fieldErrors: prev.fieldErrors ? 
          Object.fromEntries(
            Object.entries(prev.fieldErrors).filter(([key]) => key !== field)
          ) : undefined
      }));
    }
  };

  const updateSectionFlags = (sectionCode: keyof typeof SectionCode, flagType: 'changed' | 'included', value: boolean) => {
    const flagsField = flagType === 'changed' ? 'sectionsChangedFlags' : 'sectionsIncludedFlags';
    setFormData(prev => ({
      ...prev,
      [flagsField]: {
        ...prev[flagsField],
        [sectionCode]: value
      }
    }));
  };

  const updateSectionDescription = (sectionCode: string, description: string) => {
    setFormData(prev => ({
      ...prev,
      sectionDescriptions: {
        ...prev.sectionDescriptions,
        [sectionCode]: description
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Client-side validation
      const validation = intakeCreateSchema.safeParse(formData);
      if (!validation.success) {
        const fieldErrors: Record<string, string[]> = {};
        validation.error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(issue.message);
        });
        
        setErrors({
          error: "Please fix the validation errors below.",
          fieldErrors
        });
        setIsSubmitting(false);
        return;
      }

      // Submit to API
      const response = await fetch('/enrollment-dashboard/api/intakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors(result);
        setIsSubmitting(false);
        return;
      }

      // Redirect to the intake detail page on success
      router.push(`/enrollment-dashboard/intakes/${result.intakeId}?success=created`);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({
        error: 'An unexpected error occurred. Please try again.'
      });
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return errors.fieldErrors?.[field]?.[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Global Error */}
      {errors.error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {errors.error}
        </div>
      )}

      {/* Basic Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => updateFormData('clientName', e.target.value)}
                placeholder="Enter client name"
                className={getFieldError('clientName') ? 'border-destructive' : ''}
              />
              {getFieldError('clientName') && (
                <p className="text-sm text-destructive">{getFieldError('clientName')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="planYear">Plan Year *</Label>
              <Select
                value={formData.planYear.toString()}
                onValueChange={(value) => updateFormData('planYear', parseInt(value))}
              >
                <SelectTrigger className={getFieldError('planYear') ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select plan year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
              {getFieldError('planYear') && (
                <p className="text-sm text-destructive">{getFieldError('planYear')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestorName">Requestor Name *</Label>
              <Select
                value={formData.requestorName}
                onValueChange={(value) => updateFormData('requestorName', value)}
              >
                <SelectTrigger className={getFieldError('requestorName') ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select requestor" />
                </SelectTrigger>
                <SelectContent>
                  {REQUESTOR_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError('requestorName') && (
                <p className="text-sm text-destructive">{getFieldError('requestorName')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payrollStorageUrl">Payroll Storage URL *</Label>
              <Input
                id="payrollStorageUrl"
                value={formData.payrollStorageUrl}
                onChange={(e) => updateFormData('payrollStorageUrl', e.target.value)}
                placeholder="Enter payroll storage URL"
                className={getFieldError('payrollStorageUrl') ? 'border-destructive' : ''}
              />
              {getFieldError('payrollStorageUrl') && (
                <p className="text-sm text-destructive">{getFieldError('payrollStorageUrl')}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Guide Type *</Label>
            <RadioGroup
              value={formData.guideType}
              onValueChange={(value) => updateFormData('guideType', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={GuideType.UPDATE_EXISTING_GUIDE} id="guide-update" />
                <Label htmlFor="guide-update">Update Existing Guide</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={GuideType.NEW_GUIDE_BUILD} id="guide-new" />
                <Label htmlFor="guide-new">New Guide Build</Label>
              </div>
            </RadioGroup>
            {getFieldError('guideType') && (
              <p className="text-sm text-destructive">{getFieldError('guideType')}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Communications Add-Ons *</Label>
            <RadioGroup
              value={formData.communicationsAddOns}
              onValueChange={(value) => updateFormData('communicationsAddOns', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={CommunicationsAddOns.NONE} id="comm-none" />
                <Label htmlFor="comm-none">None</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={CommunicationsAddOns.OE_LETTER} id="comm-letter" />
                <Label htmlFor="comm-letter">OE Letter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={CommunicationsAddOns.OE_PRESENTATION} id="comm-presentation" />
                <Label htmlFor="comm-presentation">OE Presentation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={CommunicationsAddOns.BOTH} id="comm-both" />
                <Label htmlFor="comm-both">Both</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={CommunicationsAddOns.OTHER} id="comm-other" />
                <Label htmlFor="comm-other">Other</Label>
              </div>
            </RadioGroup>
            {getFieldError('communicationsAddOns') && (
              <p className="text-sm text-destructive">{getFieldError('communicationsAddOns')}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Requested Production Time *</Label>
            <RadioGroup
              value={formData.requestedProductionTime}
              onValueChange={(value) => updateFormData('requestedProductionTime', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={ProductionTime.STANDARD} id="time-standard" />
                <Label htmlFor="time-standard">Standard</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={ProductionTime.RUSH} id="time-rush" />
                <Label htmlFor="time-rush">Rush</Label>
              </div>
            </RadioGroup>
            {getFieldError('requestedProductionTime') && (
              <p className="text-sm text-destructive">{getFieldError('requestedProductionTime')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sections Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Guide Sections Configuration</CardTitle>
          <p className="text-sm text-muted-foreground">
            For each section, specify whether to include it in the guide and if it has changes beyond annual updates.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SECTIONS.map((section, index) => (
              <div key={section.code}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Section {section.code}: {section.name}
                    </Label>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Include in Guide</Label>
                      <RadioGroup
                        value={formData.sectionsIncludedFlags?.[section.code] ? "yes" : "no"}
                        onValueChange={(value) => updateSectionFlags(section.code, 'included', value === "yes")}
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
                        onValueChange={(value) => updateSectionFlags(section.code, 'changed', value === "yes")}
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
                
                {index < SECTIONS.length - 1 && <div className="border-t mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* General Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>General Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notesGeneral">Additional Notes or Comments</Label>
            <Textarea
              id="notesGeneral"
              value={formData.notesGeneral || ""}
              onChange={(e) => updateFormData('notesGeneral', e.target.value)}
              placeholder="Enter any additional notes or special instructions"
              className="min-h-[100px]"
            />
            {getFieldError('notesGeneral') && (
              <p className="text-sm text-destructive">{getFieldError('notesGeneral')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Intake..." : "Create Intake"}
        </Button>
      </div>
    </form>
  );
}