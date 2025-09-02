import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { ComplexityBadge } from "./complexity-badge";
import { StatusSelect, Status } from "./status-select";
import { IntakeUploads } from "./intake-uploads";
import { getSectionsFromFlags, getSectionName } from "../lib/sections";

interface IntakeData {
  _id: string;
  intakeId: string;
  clientName: string;
  planYear: number;
  requestorName: string;
  dateReceived: string;
  guideType: "Update Existing Guide" | "New Guide Build";
  communicationsAddOns: Array<"OE Letter" | "OE Presentation" | "Other" | { type: "Other"; text: string }>;
  status: string;
  complexityScore: number;
  complexityBand: "Minimal" | "Low" | "Medium" | "High";
  sectionsIncludedFlags: Record<string, boolean>;
  payrollStorageUrl: string;
  requestedProductionTime: string;
  notesGeneral?: string;
  createdAt: string;
  updatedAt: string;
}

interface IntakeOverviewProps {
  intake: IntakeData;
}

export function IntakeOverview({ intake }: IntakeOverviewProps) {
  const pagesRequired = getSectionsFromFlags(intake.sectionsIncludedFlags);

  return (
    <div className="space-y-4">
      {/* Basic Information */}
      <Card density="compact">
        <CardHeader density="compact">
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent density="compact">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Client Name</label>
              <p className="text-sm font-semibold">{intake.clientName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Plan Year</label>
              <p className="text-sm">{intake.planYear}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Requestor Name</label>
              <p className="text-sm">{intake.requestorName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date Received</label>
              <p className="text-sm">{new Date(intake.dateReceived).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide Information */}
      <Card density="compact">
        <CardHeader density="compact">
          <CardTitle>Guide Information</CardTitle>
        </CardHeader>
        <CardContent density="compact">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Guide Type</label>
              <p className="text-sm">{intake.guideType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Communications Add-ons</label>
              <div className="flex flex-wrap gap-1">
                {intake.communicationsAddOns?.length ? (
                  intake.communicationsAddOns.map((v, idx) => (
                    <span key={idx} className="text-xs rounded px-2 py-0.5 bg-muted">
                      {typeof v === 'string' ? v : `${v.type}: ${v.text}`}
                    </span>
                  ))
                ) : (
                  <span className="text-sm">None</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Requested Production Time</label>
              <p className="text-sm">{intake.requestedProductionTime}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <StatusSelect
                  intakeId={intake.intakeId}
                  currentStatus={intake.status as Status}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complexity & Pages Required */}
      <Card density="compact">
        <CardHeader density="compact">
          <CardTitle>Complexity & Pages Required</CardTitle>
        </CardHeader>
        <CardContent density="compact">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">Complexity</label>
            <ComplexityBadge 
              band={intake.complexityBand}
              score={intake.complexityScore}
              showScore={true}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Pages Required ({pagesRequired.length} sections)
            </label>
            <div className="flex flex-wrap gap-2">
              {pagesRequired.map((sectionCode) => (
                <Badge key={sectionCode} variant="secondary" className="text-xs">
                  {sectionCode}: {getSectionName(sectionCode)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card density="compact">
        <CardHeader density="compact">
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent density="compact">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Payroll Storage URL</label>
            <p className="text-sm font-mono bg-muted p-2 rounded text-xs break-all">
              {intake.payrollStorageUrl}
            </p>
          </div>
          
          {intake.notesGeneral && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <p className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                {intake.notesGeneral}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-xs text-muted-foreground">
                {new Date(intake.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-xs text-muted-foreground">
                {new Date(intake.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files & Uploads */}
      <IntakeUploads intakeId={intake.intakeId} />
    </div>
  );
}
