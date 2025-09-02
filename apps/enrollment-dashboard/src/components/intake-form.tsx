"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
// import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { intakeCreateSchema, GuideType, CommunicationsAddOns, ProductionTime, SectionCode, type IntakeCreate, type CommunicationsAddOnItem, type GuideType as GuideTypeT, type ProductionTime as ProductionTimeT } from "@/lib/schemas";
import { REQUESTOR_NAMES } from "@/lib/constants";
import SectionConfig from "./section-config";

// Requestor names are centralized in lib/constants

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
  statusCode?: number;
};

export function IntakeForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const errorRef = useRef<HTMLDivElement | null>(null);
  const [firstInvalidId, setFirstInvalidId] = useState<string | null>(null);
  const [openSectionCode, setOpenSectionCode] = useState<keyof typeof SectionCode | null>(null);

  // Move focus to the banner when an error appears
  useEffect(() => {
    if (errors.error && errorRef.current) {
      const id = window.setTimeout(() => errorRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
  }, [errors.error]);

  // Form state with proper defaults
  const [formData, setFormData] = useState<FormData>({
    clientName: "",
    planYear: 2025,
    requestorName: "",
    payrollStorageUrl: "",
    guideType: GuideType.UPDATE_EXISTING_GUIDE,
    communicationsAddOns: [],
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

  const updateFormData = <K extends Extract<keyof FormData, string>>(field: K, value: FormData[K]) => {
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


  // Type guards to safely narrow string values from Radix components
  const isGuideType = (v: string): v is GuideTypeT =>
    v === GuideType.UPDATE_EXISTING_GUIDE || v === GuideType.NEW_GUIDE_BUILD;

  const isProductionTime = (v: string): v is ProductionTimeT =>
    v === ProductionTime.STANDARD || v === ProductionTime.RUSH;

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
        // Determine first invalid field's element id to focus after the summary
        const errorOrder = [
          'clientName',
          'planYear',
          'requestorName',
          'payrollStorageUrl',
          'guideType',
          'communicationsAddOns',
          'requestedProductionTime',
        ];
        const firstKey = errorOrder.find((key) => fieldErrors[key]?.length);
        if (firstKey) {
          const idMap: Record<string, string> = {
            clientName: 'clientName',
            planYear: 'planYear',
            requestorName: 'requestorName',
            payrollStorageUrl: 'payrollStorageUrl',
            guideType: 'guide-update', // first radio id
            communicationsAddOns: 'comm-letter', // first checkbox id
            requestedProductionTime: 'time-standard', // first radio id
          };
          setFirstInvalidId(idMap[firstKey]);
        } else {
          setFirstInvalidId(null);
        }
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

      // Some responses may not include a JSON body on failure; guard parsing
      let parsed: unknown = undefined;
      try {
        parsed = await response.json();
      } catch {
        // ignore body parse errors
      }

      const isRecord = (v: unknown): v is Record<string, unknown> =>
        typeof v === 'object' && v !== null;

      if (!response.ok) {
        // 4xx: show server-provided validation/domain error and keep inputs intact
        if (response.status >= 400 && response.status < 500) {
          const err = isRecord(parsed) ? parsed : undefined;
          setErrors({
            error: (err && typeof err.error === 'string' ? err.error : undefined) || 'Please fix the errors and try again.',
            fieldErrors: (err && isRecord(err.fieldErrors) ? (err.fieldErrors as Record<string, string[]>) : undefined),
            statusCode: response.status,
          });
          setIsSubmitting(false);
          return;
        }

        // 5xx: show distinct infra/backend guidance
        const err = isRecord(parsed) ? parsed : undefined;
        setErrors({
          error:
            (err && typeof err.error === 'string' ? err.error : undefined) ||
            'Backend error: Convex URL may be misconfigured or the backend is unavailable. In local dev, run "npx convex dev" and set NEXT_PUBLIC_CONVEX_URL in apps/enrollment-dashboard/.env.local. In preview, verify env config.',
          fieldErrors: (err && isRecord(err.fieldErrors) ? (err.fieldErrors as Record<string, string[]>) : undefined),
          statusCode: response.status,
        });
        setIsSubmitting(false);
        return;
      }

      // Redirect to the intake detail page on success
      if (!isRecord(parsed) || typeof parsed.intakeId !== 'string') {
        setErrors({ error: 'Unexpected response from server; missing intakeId.' });
        setIsSubmitting(false);
        return;
      }
      router.push(`/enrollment-dashboard/intakes/${parsed.intakeId}?created=1`);

    } catch (error) {
      console.error('Form submission error:', error);
      // Network/infra failures
      setErrors({
        error:
          'Network error: Unable to reach the backend. Ensure Convex is running (npx convex dev) and NEXT_PUBLIC_CONVEX_URL is configured.',
      });
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return errors.fieldErrors?.[field]?.[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Global Error */}
      {errors.error && (
        <div
          ref={errorRef}
          role="alert"
          aria-live="polite"
          tabIndex={-1}
          className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-destructive/50"
        >
          {errors.error}
        </div>
      )}
      {errors.error && (
        <span
          tabIndex={0}
          onFocus={() => {
            if (firstInvalidId) {
              const el = document.getElementById(firstInvalidId);
              el?.focus();
            }
          }}
          className="sr-only"
        >
          Jump to first error
        </span>
      )}

      <fieldset disabled={isSubmitting} className="space-y-4">

      {/* Basic Information Section */}
      <Card density="compact">
        <CardHeader density="compact">
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent density="compact">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <SelectTrigger id="planYear" className={getFieldError('planYear') ? 'border-destructive' : ''}>
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
                <SelectTrigger id="requestorName" className={getFieldError('requestorName') ? 'border-destructive' : ''}>
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
                aria-invalid={!!getFieldError('payrollStorageUrl')}
                aria-describedby={getFieldError('payrollStorageUrl') ? 'payrollStorageUrl-error' : undefined}
              />
              {getFieldError('payrollStorageUrl') && (
                <p id="payrollStorageUrl-error" className="text-sm text-destructive" aria-live="polite">
                  {getFieldError('payrollStorageUrl')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details Section */}
      <Card density="compact">
        <CardHeader density="compact">
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent density="compact">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Guide Type *</Label>
              <RadioGroup
                value={formData.guideType}
                onValueChange={(value) => {
                  if (isGuideType(value)) {
                    updateFormData('guideType', value);
                  }
                }}
                className="flex flex-wrap gap-4"
                aria-invalid={!!getFieldError('guideType')}
              >
                <div className="inline-flex items-center gap-2">
                  <RadioGroupItem value={GuideType.UPDATE_EXISTING_GUIDE} id="guide-update" />
                  <Label htmlFor="guide-update" className="text-sm">Update Existing Guide</Label>
                </div>
                <div className="inline-flex items-center gap-2">
                  <RadioGroupItem value={GuideType.NEW_GUIDE_BUILD} id="guide-new" />
                  <Label htmlFor="guide-new" className="text-sm">New Guide Build</Label>
                </div>
              </RadioGroup>
              {getFieldError('guideType') && (
                <p className="text-sm text-destructive">{getFieldError('guideType')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Communications Add-Ons *</Label>
              <div className="flex flex-wrap items-center gap-4">
                {/* Helper to toggle values in the array */}
                {(() => {
                  const value = formData.communicationsAddOns as CommunicationsAddOnItem[] || [];
                  const set = (next: CommunicationsAddOnItem[]) => updateFormData('communicationsAddOns', next);
                  const hasLiteral = (opt: typeof CommunicationsAddOns.OE_LETTER | typeof CommunicationsAddOns.OE_PRESENTATION) => value.some((v) => v === opt);
                  const toggleLiteral = (opt: typeof CommunicationsAddOns.OE_LETTER | typeof CommunicationsAddOns.OE_PRESENTATION, checked: boolean) => {
                    const present = hasLiteral(opt);
                    const literals = value.filter((v): v is typeof CommunicationsAddOns.OE_LETTER | typeof CommunicationsAddOns.OE_PRESENTATION => typeof v === 'string');
                    const others = value.filter((v) => typeof v === 'object');
                    let nextLiterals = literals.filter((v) => v !== opt);
                    if (checked && !present) nextLiterals = [...literals, opt];
                    return [...nextLiterals, ...others];
                  };
                  const getOther = () => value.find((v) => typeof v === 'object' && v && 'type' in v && v.type === CommunicationsAddOns.OTHER) as { type: typeof CommunicationsAddOns.OTHER; text: string } | undefined;
                  const setOther = (enabled: boolean, text?: string) => {
                    const withoutOther = value.filter((v) => !(typeof v === 'object' && v && 'type' in v && v.type === CommunicationsAddOns.OTHER));
                    if (!enabled) return set(withoutOther);
                    const current = getOther();
                    const nextText = typeof text === 'string' ? text : (current?.text || "");
                    return set([...withoutOther, { type: CommunicationsAddOns.OTHER, text: nextText }]);
                  };

                  return (
                    <>
                      {/* OE Letter */}
                      <div className="inline-flex items-center gap-2">
                        <Checkbox
                          id="comm-letter"
                          checked={hasLiteral(CommunicationsAddOns.OE_LETTER)}
                          onCheckedChange={(checked) => {
                            const next = toggleLiteral(CommunicationsAddOns.OE_LETTER, !!checked);
                            set(next);
                          }}
                        />
                        <Label htmlFor="comm-letter" className="text-sm">OE Letter</Label>
                      </div>

                      {/* OE Presentation */}
                      <div className="inline-flex items-center gap-2">
                        <Checkbox
                          id="comm-presentation"
                          checked={hasLiteral(CommunicationsAddOns.OE_PRESENTATION)}
                          onCheckedChange={(checked) => {
                            const next = toggleLiteral(CommunicationsAddOns.OE_PRESENTATION, !!checked);
                            set(next);
                          }}
                        />
                        <Label htmlFor="comm-presentation" className="text-sm">OE Presentation</Label>
                      </div>

                      {/* Other */}
                      <div className="inline-flex items-center gap-2">
                        <Checkbox
                          id="comm-other"
                          checked={!!getOther()}
                          onCheckedChange={(checked) => {
                            setOther(!!checked);
                          }}
                        />
                        <Label htmlFor="comm-other" className="text-sm">Other</Label>
                        {getOther() && (
                          <Input
                            id="comm-other-text"
                            placeholder="Please specify"
                            value={getOther()!.text}
                            onChange={(e) => setOther(true, e.target.value)}
                            className="ml-2 w-48"
                            aria-invalid={!!getFieldError('communicationsAddOns')}
                          />
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
              {getFieldError('communicationsAddOns') && (
                <p className="text-sm text-destructive">{getFieldError('communicationsAddOns')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Requested Production Time *</Label>
              <RadioGroup
                value={formData.requestedProductionTime}
                onValueChange={(value) => {
                  if (isProductionTime(value)) {
                    updateFormData('requestedProductionTime', value);
                  }
                }}
                className="flex flex-wrap gap-4"
              >
                <div className="inline-flex items-center gap-2">
                  <RadioGroupItem value={ProductionTime.STANDARD} id="time-standard" />
                  <Label htmlFor="time-standard" className="text-sm">Standard</Label>
                </div>
                <div className="inline-flex items-center gap-2">
                  <RadioGroupItem value={ProductionTime.RUSH} id="time-rush" />
                  <Label htmlFor="time-rush" className="text-sm">Rush</Label>
                </div>
              </RadioGroup>
              {getFieldError('requestedProductionTime') && (
                <p className="text-sm text-destructive">{getFieldError('requestedProductionTime')}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections Configuration */}
      <Card density="compact">
        <CardHeader density="compact">
          <CardTitle>Guide Sections Configuration</CardTitle>
          <p className="text-sm text-muted-foreground">
            For each section, specify whether to include it in the guide and if it has changes beyond annual updates.
          </p>
        </CardHeader>
        <CardContent className={process.env.NODE_ENV !== 'production' ? 'min-h-[480px]' : undefined}>
          {/* Mobile: Accordion with index */}
          <div className="md:hidden space-y-3">
            {/* In-page index */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-md p-2">
              <div className="grid grid-cols-8 gap-2">
                {SECTIONS.map((s) => (
                  <Button
                    key={s.code}
                    type="button"
                    variant={openSectionCode === s.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOpenSectionCode((prev) => (prev === s.code ? null : s.code))}
                  >
                    {s.code}
                  </Button>
                ))}
              </div>
            </div>

            {SECTIONS.map((section) => {
              const included = !!formData.sectionsIncludedFlags?.[section.code];
              const changed = !!formData.sectionsChangedFlags?.[section.code];
              return (
                <div key={section.code} className="border rounded-md">
                  <button
                    type="button"
                    className="w-full text-left p-4 flex items-center justify-between"
                    aria-expanded={openSectionCode === section.code}
                    onClick={() => setOpenSectionCode((prev) => (prev === section.code ? null : section.code))}
                  >
                    <span className="text-sm font-medium">
                      Section {section.code}: {section.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Included: {included ? 'Yes' : 'No'} • Changes: {changed ? 'Yes' : 'No'}
                    </span>
                  </button>
                  {openSectionCode === section.code && (
                    <div className="p-4 pt-0">
                      <SectionConfig
                        section={section}
                        formData={formData}
                        updateSectionFlags={updateSectionFlags}
                        updateSectionDescription={updateSectionDescription}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop: Original grid layout */}
          <div className="hidden md:block space-y-3">
            {SECTIONS.map((section, index) => (
              <div key={section.code}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Section {section.code}: {section.name}
                    </Label>
                  </div>
                  <div className="lg:col-span-2">
                    <SectionConfig
                      section={section}
                      formData={formData}
                      updateSectionFlags={updateSectionFlags}
                      updateSectionDescription={updateSectionDescription}
                    />
                  </div>
                </div>
                {index < SECTIONS.length - 1 && <div className="border-t mt-3" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* General Notes Section */}
      <Card density="compact">
        <CardHeader density="compact">
          <CardTitle>General Notes</CardTitle>
        </CardHeader>
        <CardContent density="compact">
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
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Creating Intake..." : "Create Intake"}
        </Button>
      </div>

      </fieldset>
    </form>
  );
}

// SectionConfig extracted to ./section-config
