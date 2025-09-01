import { NextRequest, NextResponse } from 'next/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@repo/backend/convex/_generated/api';
import { Status, ComplexityBand, ProductionTime } from '../../../lib/schemas';

// CSV column headers matching Express app
const CSV_HEADERS = [
  'Intake ID',
  'Client Name', 
  'Plan Year',
  'Requestor Name',
  'Status',
  'Complexity Band',
  'Complexity Score',
  'Guide Type',
  'Communications Add-ons',
  'Requested Production Time',
  'Date Received',
  'Payroll Storage URL',
  'General Notes'
];

// Escape CSV field value
function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If the field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

// Type for intake data from Convex export
interface IntakeExportData {
  intakeId: string;
  clientName: string;
  planYear: number;
  requestorName: string;
  status: string;
  complexityBand: string;
  complexityScore: number;
  guideType: string;
  communicationsAddOns: string;
  requestedProductionTime: string;
  dateReceived: string;
  payrollStorageUrl: string;
  notesGeneral: string;
}

// Convert intake data to CSV row
function intakeToCSVRow(intake: IntakeExportData): string {
  const fields = [
    intake.intakeId,
    intake.clientName,
    intake.planYear,
    intake.requestorName,
    intake.status,
    intake.complexityBand,
    intake.complexityScore,
    intake.guideType,
    intake.communicationsAddOns,
    intake.requestedProductionTime,
    new Date(intake.dateReceived).toLocaleDateString('en-US'),
    intake.payrollStorageUrl,
    intake.notesGeneral || ''
  ];
  
  return fields.map(escapeCsvField).join(',');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters for filters
    const filters: {
      status?: Status[];
      complexityBand?: ComplexityBand[];
      requestorName?: string;
      planYear?: number;
      requestedProductionTime?: ProductionTime[];
    } = {};
    
    const statusParam = searchParams.get('status');
    if (statusParam) {
      try {
        const statusArray = JSON.parse(statusParam);
        if (Array.isArray(statusArray)) {
          filters.status = statusArray.filter(s => Object.values(Status).includes(s));
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
    
    const complexityParam = searchParams.get('complexityBand');
    if (complexityParam) {
      try {
        const complexityArray = JSON.parse(complexityParam);
        if (Array.isArray(complexityArray)) {
          filters.complexityBand = complexityArray.filter(c => Object.values(ComplexityBand).includes(c));
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
    
    const requestorName = searchParams.get('requestorName');
    if (requestorName) {
      filters.requestorName = requestorName;
    }
    
    const planYear = searchParams.get('planYear');
    if (planYear) {
      const year = parseInt(planYear);
      if (!isNaN(year)) {
        filters.planYear = year;
      }
    }
    
    const productionTimeParam = searchParams.get('requestedProductionTime');
    if (productionTimeParam) {
      try {
        const timeArray = JSON.parse(productionTimeParam);
        if (Array.isArray(timeArray)) {
          filters.requestedProductionTime = timeArray.filter(t => Object.values(ProductionTime).includes(t));
        }
      } catch {
        // Invalid JSON, ignore
      }
    }

    // Get sort parameters
    const sortBy = searchParams.get('sortBy') || 'dateReceived';
    const order = searchParams.get('order') || 'desc';

    // Fetch filtered data from Convex
    const csvData = await fetchQuery(api.functions.intakes.exportCsv, {
      filters: Object.keys(filters).length > 0 ? filters : undefined
    });

    // Apply sorting (since exportCsv doesn't sort)
    if (csvData && csvData.length > 0) {
      csvData.sort((a: IntakeExportData, b: IntakeExportData) => {
        let aVal: string | number = a[sortBy as keyof IntakeExportData] as string | number;
        let bVal: string | number = b[sortBy as keyof IntakeExportData] as string | number;
        
        // Handle date fields
        if (sortBy === 'dateReceived') {
          aVal = new Date(aVal as string).getTime();
          bVal = new Date(bVal as string).getTime();
        } else if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
        }
        
        if (typeof bVal === 'string' && sortBy !== 'dateReceived') {
          bVal = bVal.toLowerCase();
        }

        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;

        return order === 'asc' ? comparison : -comparison;
      });
    }

    // Build CSV content
    const csvContent = [
      CSV_HEADERS.join(','),
      ...(csvData || []).map(intakeToCSVRow)
    ].join('\n');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `enrollment-dashboard-export-${timestamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });
    
  } catch (error) {
    console.error('CSV export error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to export CSV',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}