import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { type SectionCode, getAllSectionCodes, getSectionName } from "../lib/sections";
import { SectionEditor } from "./section-editor";

interface SectionData {
  _id: string;
  intakeId: string;
  sectionCode: SectionCode;
  payload: Record<string, unknown>;
  createdAt: string;
}

interface IntakeData {
  _id: string;
  intakeId: string;
  sectionsChangedFlags: Record<SectionCode, boolean>;
  sectionsIncludedFlags: Record<SectionCode, boolean>;
  [key: string]: unknown;
}

interface IntakeSectionsProps {
  sections: SectionData[];
  intake: IntakeData;
  onRefresh: () => void;
}

export function IntakeSections({ sections, intake, onRefresh }: IntakeSectionsProps) {
  // Create a map for quick lookup of sections with data
  const sectionsMap = new Map<SectionCode, SectionData>();
  sections.forEach(section => {
    sectionsMap.set(section.sectionCode, section);
  });

  // Get all section codes in order (A-Q)
  const allSections = getAllSectionCodes();
  // Show all sections, but distinguish between those with and without data
  const sectionsWithData = allSections.filter(code => sectionsMap.has(code));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Sections ({sectionsWithData.length} of {allSections.length})
        </h3>
        <Badge variant="outline" className="text-xs">
          {sectionsWithData.length} sections with data
        </Badge>
      </div>

      <div className="space-y-4">
        {allSections.map((sectionCode) => {
          const sectionData = sectionsMap.get(sectionCode);
          const sectionName = getSectionName(sectionCode);
          const hasData = !!sectionData;
          
          // Extract change_description from payload if it exists (payload values are unknown)
          const changeDescription =
            (sectionData?.payload?.change_description as string | undefined) ||
            (sectionData?.payload?.description as string | undefined) ||
            "";

          // Get flags from intake
          const changed = intake.sectionsChangedFlags[sectionCode] || false;
          const included = intake.sectionsIncludedFlags[sectionCode] || false;

          return (
            <Card 
              key={sectionCode}
              className={`gap-4 py-5 border-l-4 ${hasData ? "border-l-primary" : "border-l-muted"}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Section {sectionCode}: {sectionName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {hasData && (
                      <Badge variant="secondary" className="text-xs">
                        Has Data
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {sectionCode}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <SectionEditor
                  intakeId={intake.intakeId}
                  sectionCode={sectionCode}
                  description={changeDescription}
                  changed={changed}
                  included={included}
                  onUpdate={onRefresh}
                />
                
                {hasData && sectionData && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(sectionData.createdAt).toLocaleString()}
                    </div>

                    {/* Show additional payload data if present */}
                    {Object.keys(sectionData.payload).length > 1 && (
                      <details className="mt-3">
                        <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">
                          View Raw Data
                        </summary>
                        <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-auto max-h-40">
                          {JSON.stringify(sectionData.payload, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
