import { NextRequest, NextResponse } from 'next/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@repo/backend/convex/_generated/api';
import { Status, ComplexityBand, ProductionTime } from '../../../lib/schemas';

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
    const sortBy = (searchParams.get('sortBy') || 'dateReceived') as
      | 'clientName'
      | 'requestorName'
      | 'guideType'
      | 'communicationsAddOns'
      | 'complexityBand'
      | 'dateReceived'
      | 'status'
      | 'requestedProductionTime';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    // Fetch CSV string from Convex (server handles filters and sorting)
    const csvContent = await fetchQuery(api.functions.intakes.exportCsv, {
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      sortBy,
      order,
    });

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
