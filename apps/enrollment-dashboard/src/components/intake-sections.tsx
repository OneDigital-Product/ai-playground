import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { type SectionCode, getAllSectionCodes, getSectionName } from "../lib/sections";

interface SectionData {
  _id: string;
  intakeId: string;
  sectionCode: SectionCode;
  payload: Record<string, unknown>;
  createdAt: string;
}

interface IntakeSectionsProps {
  sections: SectionData[];
}

export function IntakeSections({ sections }: IntakeSectionsProps) {
  // Create a map for quick lookup of sections with data
  const sectionsMap = new Map<SectionCode, SectionData>();
  sections.forEach(section => {
    sectionsMap.set(section.sectionCode, section);
  });

  // Get all section codes in order (A-Q) and filter to only show those with data
  const allSections = getAllSectionCodes();
  const sectionsWithData = allSections.filter(code => sectionsMap.has(code));

  if (sectionsWithData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No sections have been created for this intake yet.
          </p>
        </CardContent>
      </Card>
    );
  }

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
        {sectionsWithData.map((sectionCode) => {
          const sectionData = sectionsMap.get(sectionCode)!;
          const sectionName = getSectionName(sectionCode);
          
          // Extract change_description from payload if it exists
          const changeDescription = sectionData.payload?.change_description || 
                                  sectionData.payload?.description ||
                                  "No description provided";

          return (
            <Card key={sectionCode} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Section {sectionCode}: {sectionName}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {sectionCode}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Change Description
                    </label>
                    <p className="text-sm mt-1 bg-muted p-3 rounded whitespace-pre-wrap">
                      {changeDescription}
                    </p>
                  </div>
                  
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}