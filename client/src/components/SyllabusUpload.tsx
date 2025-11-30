import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CareerPath } from "@shared/schema";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2,
  X,
  AlertCircle
} from "lucide-react";

export default function SyllabusUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedCareerPathId, setSelectedCareerPathId] = useState<string>("");
  const [result, setResult] = useState<{ questionsGenerated: number; careerPath: string } | null>(null);
  const { toast } = useToast();

  // Fetch career paths for selection
  const { data: careerPathsData } = useQuery<{ careerPaths: CareerPath[] }>({
    queryKey: ["/api/career-paths"],
  });
  const careerPaths = careerPathsData?.careerPaths || [];

  // Mutation for uploading syllabus
  const uploadMutation = useMutation({
    mutationFn: async ({ pdfBase64, careerPathId, fileName }: { pdfBase64: string; careerPathId: string; fileName: string }) => {
      const response = await fetch("/api/admin/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64, careerPathId, fileName }),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      const careerPath = careerPaths.find(cp => cp.id === selectedCareerPathId);
      setResult({
        questionsGenerated: data.questionsGenerated || 0,
        careerPath: careerPath?.name || "Unknown"
      });
      toast({
        title: "Success!",
        description: `Generated ${data.questionsGenerated} questions from syllabus`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to process syllabus PDF",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedCareerPathId) {
      toast({
        title: "Missing Information",
        description: "Please select both a PDF file and a career path",
        variant: "destructive",
      });
      return;
    }
    
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const pdfBase64 = base64.split(',')[1]; // Remove data:application/pdf;base64, prefix
      uploadMutation.mutate({ pdfBase64, careerPathId: selectedCareerPathId, fileName: file.name });
    };
    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "Failed to read the PDF file",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setFile(null);
    setResult(null);
    setSelectedCareerPathId("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Syllabus PDF</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!file && !result && (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover-elevate transition-all">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="mb-2 text-sm font-medium">
                Drop PDF here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                AI will automatically generate questions from the syllabus
              </p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf"
              onChange={handleFileChange}
              data-testid="input-file-upload"
            />
          </label>
        )}

        {file && !result && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border border-card-border rounded-lg">
              <FileText className="w-10 h-10 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleRemove}
                disabled={uploadMutation.isPending}
                data-testid="button-remove-file"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Career Path</label>
              <Select 
                value={selectedCareerPathId} 
                onValueChange={setSelectedCareerPathId}
                disabled={uploadMutation.isPending}
              >
                <SelectTrigger data-testid="select-career-path">
                  <SelectValue placeholder="Choose a career path" />
                </SelectTrigger>
                <SelectContent>
                  {careerPaths.map((path) => (
                    <SelectItem key={path.id} value={path.id}>
                      {path.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedCareerPathId && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Questions will be assigned to this career path
                </p>
              )}
            </div>

            {uploadMutation.isPending && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">AI Processing...</span>
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Extracting content and generating questions with OpenAI...
                </p>
              </div>
            )}

            {!uploadMutation.isPending && (
              <Button 
                onClick={handleUpload} 
                className="w-full"
                disabled={!selectedCareerPathId}
                data-testid="button-upload"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload and Process with AI
              </Button>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-[hsl(var(--success))]" />
              <div className="flex-1">
                <p className="font-semibold">Processing Complete!</p>
                <p className="text-sm text-muted-foreground">
                  AI successfully generated {result.questionsGenerated} questions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-card-border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Questions Generated</div>
                <div className="text-2xl font-bold">{result.questionsGenerated}</div>
              </div>
              <div className="p-4 border border-card-border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Assigned to Path</div>
                <Badge className="mt-1">{result.careerPath}</Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRemove} className="flex-1" data-testid="button-upload-another">
                Upload Another
              </Button>
              <Button className="flex-1" data-testid="button-review">
                Review Questions
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
