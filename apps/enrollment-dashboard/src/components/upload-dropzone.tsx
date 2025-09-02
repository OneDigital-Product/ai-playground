'use client';

import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Progress } from "@repo/ui/components/ui/progress";
import { Badge } from "@repo/ui/components/ui/badge";
import { Upload, X, File, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "./toast";

const UPLOAD_KINDS = [
  { value: "GUIDE", label: "Guide" },
  { value: "PLAN_DOC", label: "Plan Document" },
  { value: "PAYROLL_SCREEN", label: "Payroll Screen" },
  { value: "OTHER", label: "Other" },
];

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
  "image/png",
  "image/jpeg",
  "image/jpg",
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_FILES = 10;

interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface UploadDropzoneProps {
  intakeId: string;
  onUploadComplete?: () => void;
  onUploaded?: (
    files: Array<{
      _id: string;
      originalName: string;
      mimeType: string;
      bytes: number;
      kind: string;
    }>
  ) => void;
}

export function UploadDropzone({ intakeId, onUploadComplete, onUploaded }: UploadDropzoneProps) {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [kind, setKind] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum of 25MB`;
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `File type ${file.type} not allowed. Use PDF, DOCX, XLSX, PNG, or JPG files.`;
    }
    
    return null;
  };

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles: FileUpload[] = [];

    for (const file of newFiles) {
      if (files.length + validFiles.length >= MAX_FILES) {
        showToast("error", `Maximum ${MAX_FILES} files allowed`);
        break;
      }

      const error = validateFile(file);
      if (error) {
        showToast("error", `${file.name}: ${error}`);
        continue;
      }

      const isDuplicate = files.some(f => f.file.name === file.name && f.file.size === file.size);
      if (isDuplicate) {
        showToast("error", `${file.name}: File already added`);
        continue;
      }

      validFiles.push({
        id: Math.random().toString(36).substring(2),
        file,
        progress: 0,
        status: "pending",
      });
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, [files, showToast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  }, [addFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    if (!kind) {
      showToast("error", "Please select a file type");
      return;
    }

    if (files.length === 0) {
      showToast("error", "Please select files to upload");
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("kind", kind);
      
      files.forEach(fileUpload => {
        formData.append("files", fileUpload.file);
      });

      // Update all files to uploading status
      setFiles(prev => prev.map(f => ({ ...f, status: "uploading" as const, progress: 0 })));

      const response = await fetch(`/enrollment-dashboard/api/intakes/${intakeId}/uploads`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error(
            result?.error ||
              "Backend error: Convex may be unavailable or NEXT_PUBLIC_CONVEX_URL is not configured. Ensure 'npx convex dev' is running and the URL is set."
          );
        }
        throw new Error(result.error || "Upload failed");
      }

      // Update files with success status
      setFiles(prev => prev.map(f => ({ ...f, status: "success" as const, progress: 100 })));

      // Show results
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach((error: { filename: string; error: string }) => {
          showToast("error", `${error.filename}: ${error.error}`);
        });
      }

      if (result.files && result.files.length > 0) {
        showToast("success", `Successfully uploaded ${result.files.length} file(s)`);
        try {
          onUploaded?.(result.files);
        } catch {
          // no-op
        }
        onUploadComplete?.();
      }

      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
        setKind("");
      }, 2000);

    } catch (error) {
      console.error("Upload error:", error);
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: "error" as const, 
        error: error instanceof Error ? error.message : "Upload failed" 
      })));
      showToast("error", error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getStatusIcon = (status: FileUpload["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" focusable="false" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" focusable="false" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" aria-hidden="true" focusable="false" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card density="compact"
        className={`border-2 border-dashed transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent density="compact" className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-8 w-8 text-muted-foreground" aria-hidden="true" focusable="false" />
            <div>
              <p className="text-sm font-medium">
                Drag and drop files here, or{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  browse files
                </Button>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOCX, XLSX, PNG, JPG files up to 25MB each. Maximum {MAX_FILES} files.
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card density="compact">
          <CardContent density="compact" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Selected Files ({files.length})</h3>
              <Select value={kind} onValueChange={setKind} disabled={isUploading}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {UPLOAD_KINDS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {files.map((fileUpload) => (
                <div
                  key={fileUpload.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {getStatusIcon(fileUpload.status)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {fileUpload.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileUpload.file.size)}
                      </p>
                      {fileUpload.status === "uploading" && (
                        <Progress value={fileUpload.progress} className="mt-1 h-1" />
                      )}
                      {fileUpload.error && (
                        <p className="text-xs text-red-500 mt-1">{fileUpload.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {fileUpload.status}
                    </Badge>
                    {fileUpload.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileUpload.id)}
                        disabled={isUploading}
                        aria-label={`Remove ${fileUpload.file.name}`}
                      >
                        <X className="h-4 w-4" aria-hidden="true" focusable="false" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFiles([]);
                  setKind("");
                }}
                disabled={isUploading}
              >
                Clear All
              </Button>
              <Button onClick={uploadFiles} disabled={isUploading || !kind}>
                {isUploading ? "Uploading..." : "Upload Files"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
