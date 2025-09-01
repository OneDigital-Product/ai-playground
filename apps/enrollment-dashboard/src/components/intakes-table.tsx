"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@repo/ui/components/ui/table";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import { StatusSelect, Status } from "./status-select";
import { ComplexityBadge } from "./complexity-badge";
import { Intake } from "../lib/schemas";
import { DashboardFilters } from "./dashboard-filters";

type SortField = 
  | "clientName" 
  | "requestorName" 
  | "guideType" 
  | "communicationsAddOns" 
  | "complexityBand" 
  | "dateReceived" 
  | "requestedProductionTime" 
  | "status";

type SortOrder = "asc" | "desc";

interface IntakesTableProps {
  intakes: Intake[];
  filters: DashboardFilters;
  onStatusChange?: () => void;
  onIntakeDeleted?: () => void;
}

export function IntakesTable({ intakes, filters, onStatusChange, onIntakeDeleted }: IntakesTableProps) {
  const [sortField, setSortField] = useState<SortField>("dateReceived");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [deletingIntakeId, setDeletingIntakeId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  // Filter and sort intakes
  const filteredAndSortedIntakes = useMemo(() => {
    let filtered = intakes;

    // Apply global search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(intake => 
        intake.clientName.toLowerCase().includes(searchLower) ||
        intake.intakeId.toLowerCase().includes(searchLower) ||
        intake.requestorName.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(intake => filters.status.includes(intake.status));
    }

    // Apply complexity band filter
    if (filters.complexityBand.length > 0) {
      filtered = filtered.filter(intake => filters.complexityBand.includes(intake.complexityBand));
    }

    // Apply requestor name filter
    if (filters.requestorName) {
      filtered = filtered.filter(intake => 
        intake.requestorName.toLowerCase().includes(filters.requestorName.toLowerCase())
      );
    }

    // Apply plan year filter
    if (filters.planYear) {
      filtered = filtered.filter(intake => intake.planYear === filters.planYear);
    }

    // Apply requested production time filter
    if (filters.requestedProductionTime.length > 0) {
      filtered = filtered.filter(intake => 
        filters.requestedProductionTime.includes(intake.requestedProductionTime)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      // Handle date fields
      if (sortField === "dateReceived") {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
      }
      
      if (typeof bVal === 'string' && sortField !== "dateReceived") {
        bVal = bVal.toLowerCase();
      }

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [intakes, filters, sortField, sortOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteIntake = async (intakeId: string) => {
    setDeletingIntakeId(intakeId);
    
    try {
      const response = await fetch(`/enrollment-dashboard/api/intakes/${intakeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete intake');
      }
      
      // Call the callback to refresh the list
      onIntakeDeleted?.();
      
      // Show success toast if available
      if (window.__toastInstance) {
        window.__toastInstance.success('Intake deleted successfully');
      }
    } catch (error) {
      console.error('Delete intake error:', error);
      
      // Show error toast if available
      if (window.__toastInstance) {
        window.__toastInstance.error(
          error instanceof Error ? error.message : 'Failed to delete intake'
        );
      }
    } finally {
      setDeletingIntakeId(null);
    }
  };


  if (filteredAndSortedIntakes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {intakes.length === 0 
            ? "No intakes available. Create your first intake to get started."
            : "No intakes match your current filters. Try adjusting your search criteria."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("clientName")}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Client Name
                {getSortIcon("clientName")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("requestorName")}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Requestor
                {getSortIcon("requestorName")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("guideType")}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Guide Type
                {getSortIcon("guideType")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("communicationsAddOns")}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Communications
                {getSortIcon("communicationsAddOns")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("complexityBand")}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Complexity
                {getSortIcon("complexityBand")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("dateReceived")}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Date Received
                {getSortIcon("dateReceived")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("requestedProductionTime")}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Production Time
                {getSortIcon("requestedProductionTime")}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort("status")}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Status
                {getSortIcon("status")}
              </Button>
            </TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedIntakes.map((intake) => (
            <TableRow key={intake.intakeId} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold">{intake.clientName}</div>
                  <div className="text-xs text-muted-foreground">
                    {intake.intakeId} • Plan Year: {intake.planYear}
                  </div>
                </div>
              </TableCell>
              <TableCell>{intake.requestorName}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {intake.guideType}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {intake.communicationsAddOns}
                </Badge>
              </TableCell>
              <TableCell>
                <ComplexityBadge 
                  band={intake.complexityBand} 
                  score={intake.complexityScore} 
                  showScore={true}
                />
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(intake.dateReceived)}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={intake.requestedProductionTime === "Rush" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {intake.requestedProductionTime}
                </Badge>
              </TableCell>
              <TableCell>
                <StatusSelect
                  intakeId={intake.intakeId}
                  currentStatus={intake.status as Status}
                  onStatusChange={onStatusChange}
                  size="sm"
                />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/enrollment-dashboard/intakes/${intake.intakeId}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Intake
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Intake</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this intake for{' '}
                            <strong>{intake.clientName}</strong>? This will permanently delete 
                            the intake, all associated sections, and uploaded files. This action 
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteIntake(intake.intakeId)}
                            disabled={deletingIntakeId === intake.intakeId}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingIntakeId === intake.intakeId ? 'Deleting...' : 'Delete Intake'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}