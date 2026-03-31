import { useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface BulkUploadProps {
  type: "products" | "users" | "customers";
  onComplete?: (results: any[]) => void;
  trigger?: React.ReactNode;
}

const templates = {
  products: {
    headers: ["name", "sku", "category", "price", "cost", "stock", "description", "image_url", "status"],
    sample: [
      ["Wireless Headphones", "WH-001", "Electronics", "99.99", "45.00", "245", "Premium wireless headphones", "https://example.com/img.jpg", "active"],
      ["Smart Watch", "SW-002", "Electronics", "499.00", "250.00", "89", "Advanced smartwatch", "https://example.com/img2.jpg", "active"],
    ]
  },
  users: {
    headers: ["name", "email", "role", "department", "status"],
    sample: [
      ["John Doe", "john@example.com", "Editor", "Marketing", "active"],
      ["Jane Smith", "jane@example.com", "Admin", "Operations", "active"],
    ]
  },
  customers: {
    headers: ["name", "email", "phone", "location", "tags"],
    sample: [
      ["Emma Wilson", "emma@example.com", "+1234567890", "New York, USA", "vip,repeat"],
      ["John Smith", "john@example.com", "+0987654321", "Los Angeles, USA", "regular"],
    ]
  }
};

export function BulkUpload({ type, onComplete, trigger }: BulkUploadProps) {
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ total: number; success: number; errors: number; warnings: number; items: any[] } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.json'))) {
      setFile(droppedFile);
    } else {
      toast.error("Please upload a CSV, XLSX, or JSON file");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          const mockResults = {
            total: type === "products" ? 47 : type === "users" ? 23 : 156,
            success: type === "products" ? 44 : type === "users" ? 22 : 150,
            errors: type === "products" ? 2 : type === "users" ? 1 : 4,
            warnings: type === "products" ? 1 : type === "users" ? 0 : 2,
            items: [
              { row: 12, status: "error", message: "Invalid price format" },
              { row: 23, status: "error", message: "Duplicate SKU" },
              { row: 8, status: "warning", message: "Missing image URL" },
            ]
          };
          setResults(mockResults);
          toast.success(`${mockResults.success} ${type} imported successfully!`);
          if (onComplete) onComplete([]);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  const downloadTemplate = () => {
    const template = templates[type];
    const csv = [template.headers.join(","), ...template.sample.map(row => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded!");
  };

  const reset = () => {
    setFile(null);
    setProgress(0);
    setResults(null);
    setUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Bulk Upload
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Upload {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Upload a CSV, XLSX, or JSON file to import {type} in bulk. Download our template for the correct format.
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-6 mt-4">
            {/* Template Download */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Download Template</p>
                    <p className="text-xs text-gray-500">CSV template with required columns and sample data</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </Card>

            {/* Required Fields */}
            <div>
              <p className="text-sm font-medium mb-2">Required Fields:</p>
              <div className="flex flex-wrap gap-1.5">
                {templates[type].headers.map((h) => (
                  <Badge key={h} variant="outline" className="text-xs">{h}</Badge>
                ))}
              </div>
            </div>

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' :
                file ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                'border-gray-300 dark:border-gray-700'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div>
                  <FileText className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => setFile(null)}>
                    <X className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium">Drag & drop your file here</p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.json"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    onChange={handleFileSelect}
                  />
                  <div className="relative mt-4">
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
                        <FileText className="w-4 h-4" /> Browse Files
                      </Button>
                      <input type="file" accept=".csv,.xlsx,.json" className="sr-only" onChange={handleFileSelect} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Supports CSV, XLSX, JSON (max 10MB)</p>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processing {type}...</span>
                  </div>
                  <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1 gap-2" disabled={!file || uploading} onClick={handleUpload}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Processing..." : "Upload & Import"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Results Summary */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold">{results.total}</p>
                <p className="text-xs text-gray-500">Total Rows</p>
              </Card>
              <Card className="p-4 text-center bg-green-50 dark:bg-green-900/20">
                <p className="text-2xl font-bold text-green-600">{results.success}</p>
                <p className="text-xs text-gray-500">Imported</p>
              </Card>
              <Card className="p-4 text-center bg-red-50 dark:bg-red-900/20">
                <p className="text-2xl font-bold text-red-600">{results.errors}</p>
                <p className="text-xs text-gray-500">Errors</p>
              </Card>
              <Card className="p-4 text-center bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-2xl font-bold text-yellow-600">{results.warnings}</p>
                <p className="text-xs text-gray-500">Warnings</p>
              </Card>
            </div>

            {/* Error/Warning Details */}
            {results.items.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Issues Found:</h4>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {results.items.map((item, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                        item.status === 'error' ? 'bg-red-50 dark:bg-red-900/10' : 'bg-yellow-50 dark:bg-yellow-900/10'
                      }`}>
                        {item.status === 'error' ? (
                          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium">Row {item.row}</p>
                          <p className="text-xs text-gray-500">{item.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={reset}>
                Upload Another File
              </Button>
              <Button className="flex-1" onClick={() => setOpen(false)}>
                <CheckCircle className="w-4 h-4 mr-2" /> Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}