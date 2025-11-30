import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  FileText,
  Upload,
  Loader2,
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string;
  careerPath: string | null;
  requiredLevel: number;
  order: number;
  lessonCount: number;
  totalXP: number;
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  description?: string;
  type: string;
  order: number;
  xpReward: number;
  requiredLevel?: number;
  estimatedTime?: string;
  pdfUrl?: string;
}

const careerPaths = [
  { value: null, label: "All Paths" },
  { value: "Full Stack Development", label: "Full Stack Development" },
  { value: "Data Science & AI", label: "Data Science & AI" },
  { value: "Cloud & DevOps", label: "Cloud & DevOps" },
  { value: "Mobile Development", label: "Mobile Development" },
  { value: "Cybersecurity", label: "Cybersecurity" },
];

export default function ModuleManagement() {
  const { toast } = useToast();
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isPdfUploadOpen, setIsPdfUploadOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [deletingModule, setDeletingModule] = useState<{ id: string; title: string } | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<{ id: string; title: string } | null>(null);

  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    careerPath: null as string | null,
    requiredLevel: 0,
    order: 0,
  });

  const [lessonForm, setLessonForm] = useState({
    moduleId: "",
    title: "",
    content: "",
    description: "",
    type: "theory",
    order: 0,
    xpReward: 50,
    requiredLevel: 0,
    estimatedTime: "10 min",
    pdfUrl: "",
  });

  // Fetch modules
  const { data: modulesData, isLoading } = useQuery<{ modules: Module[] }>({
    queryKey: ["/api/admin/modules"],
  });

  // Fetch lessons for selected module
  const { data: lessonsData } = useQuery<{ lessons: Lesson[] }>({
    queryKey: ["/api/admin/modules", selectedModuleId, "lessons"],
    enabled: !!selectedModuleId,
  });

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: (data: typeof moduleForm) => apiRequest("POST", "/api/admin/modules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      toast({ title: "Success", description: "Module created successfully" });
      setIsModuleDialogOpen(false);
      resetModuleForm();
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create module" });
    },
  });

  // Update module mutation
  const updateModuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof moduleForm> }) =>
      apiRequest("PATCH", `/api/admin/modules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      toast({ title: "Success", description: "Module updated successfully" });
      setIsModuleDialogOpen(false);
      setEditingModule(null);
      resetModuleForm();
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to update module" });
    },
  });

  // Delete module mutation
  const deleteModuleMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/modules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      toast({ title: "Success", description: "Module and its lessons deleted successfully" });
      setDeletingModule(null);
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete module" });
      setDeletingModule(null);
    },
  });

  // Create lesson mutation
  const createLessonMutation = useMutation({
    mutationFn: (data: typeof lessonForm) => apiRequest("POST", "/api/admin/lessons", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules", selectedModuleId, "lessons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      toast({ title: "Success", description: "Lesson created successfully" });
      setIsLessonDialogOpen(false);
      resetLessonForm();
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create lesson" });
    },
  });

  // Update lesson mutation
  const updateLessonMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof lessonForm> }) =>
      apiRequest("PATCH", `/api/admin/lessons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules", selectedModuleId, "lessons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      toast({ title: "Success", description: "Lesson updated successfully" });
      setIsLessonDialogOpen(false);
      setEditingLesson(null);
      resetLessonForm();
    },
    onError: (error: any) => {
      console.error("Update lesson error:", error);
      toast({ variant: "destructive", title: "Error", description: error?.message || "Failed to update lesson" });
    },
  });

  // Delete lesson mutation
  const deleteLessonMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/lessons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules", selectedModuleId, "lessons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/modules"] });
      toast({ title: "Success", description: "Lesson deleted successfully" });
      setDeletingLesson(null);
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete lesson" });
      setDeletingLesson(null);
    },
  });

  const resetModuleForm = () => {
    setModuleForm({
      title: "",
      description: "",
      careerPath: null,
      requiredLevel: 0,
      order: 0,
    });
  };

  const resetLessonForm = (moduleId?: string) => {
    setLessonForm({
      moduleId: moduleId || selectedModuleId || "",
      title: "",
      content: "",
      description: "",
      type: "theory",
      order: 0,
      xpReward: 50,
      requiredLevel: 0,
      estimatedTime: "10 min",
      pdfUrl: "",
    });
    setPdfUrl("");
  };

  const handleCreateModule = () => {
    setEditingModule(null);
    resetModuleForm();
    setIsModuleDialogOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setModuleForm({
      title: module.title,
      description: module.description,
      careerPath: module.careerPath,
      requiredLevel: module.requiredLevel,
      order: module.order,
    });
    setIsModuleDialogOpen(true);
  };

  const confirmDeleteModule = () => {
    if (!deletingModule) return;
    deleteModuleMutation.mutate(deletingModule.id);
  };

  const handleSaveModule = () => {
    if (editingModule) {
      updateModuleMutation.mutate({ id: editingModule.id, data: moduleForm });
    } else {
      createModuleMutation.mutate(moduleForm);
    }
  };

  const handleCreateLesson = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setEditingLesson(null);
    resetLessonForm(moduleId);
    // Override order after resetLessonForm
    setLessonForm(prev => ({
      ...prev,
      moduleId, // Ensure moduleId is set explicitly
      order: (lessonsData?.lessons?.length || 0) + 1,
    }));
    setIsLessonDialogOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedModuleId(lesson.moduleId);
    setEditingLesson(lesson);
    setLessonForm({
      moduleId: lesson.moduleId,
      title: lesson.title,
      content: lesson.content,
      description: lesson.description || "",
      type: lesson.type,
      order: lesson.order,
      xpReward: lesson.xpReward,
      requiredLevel: lesson.requiredLevel || 0,
      estimatedTime: lesson.estimatedTime || "10 min",
      pdfUrl: lesson.pdfUrl || "",
    });
    setPdfUrl(lesson.pdfUrl || "");
    setIsLessonDialogOpen(true);
  };

  const confirmDeleteLesson = () => {
    if (!deletingLesson) return;
    deleteLessonMutation.mutate(deletingLesson.id);
  };

  const handleSaveLesson = () => {
    // Validate moduleId before submission
    if (!lessonForm.moduleId) {
      toast({ variant: "destructive", title: "Error", description: "Module ID is required" });
      return;
    }

    // Validate that either content or pdfUrl exists
    if (!lessonForm.content && !pdfUrl && !lessonForm.pdfUrl) {
      toast({ variant: "destructive", title: "Error", description: "Please provide either HTML content or upload a PDF" });
      return;
    }

    const data: any = { ...lessonForm };
    if (pdfUrl) {
      data.pdfUrl = pdfUrl;
      // For PDF lessons, content can be empty
      if (!data.content) {
        data.content = "";
      }
    }
    
    if (editingLesson) {
      // Don't send moduleId when updating (lessons can't be moved between modules)
      const { moduleId, ...updateData } = data;
      updateLessonMutation.mutate({ id: editingLesson.id, data: updateData });
    } else {
      createLessonMutation.mutate(data);
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ variant: "destructive", title: "Error", description: "Only PDF files are allowed" });
      return;
    }

    setUploadingPdf(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/lesson-pdf", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setPdfUrl(data.pdfUrl);
      toast({ title: "Success", description: "PDF uploaded successfully" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to upload PDF" });
    } finally {
      setUploadingPdf(false);
    }
  };

  const modules = modulesData?.modules || [];
  const lessons = lessonsData?.lessons || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Module Management</h2>
          <p className="text-muted-foreground">Create and manage learning modules and lessons</p>
        </div>
        <Button onClick={handleCreateModule} data-testid="button-create-module">
          <Plus className="w-4 h-4 mr-2" />
          Create Module
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : modules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Modules Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first module to start building learning content
            </p>
            <Button onClick={handleCreateModule}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((module) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                    <CardDescription className="mt-1">{module.description}</CardDescription>
                    <div className="flex items-center gap-2 mt-3">
                      {module.careerPath && (
                        <Badge variant="outline">{module.careerPath}</Badge>
                      )}
                      {module.requiredLevel > 0 && (
                        <Badge variant="secondary">Level {module.requiredLevel}+</Badge>
                      )}
                      <Badge>{module.lessonCount} lessons</Badge>
                      <Badge variant="outline">{module.totalXP} XP</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditModule(module)}
                      data-testid={`button-edit-module-${module.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingModule({ id: module.id, title: module.title })}
                      data-testid={`button-delete-module-${module.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">Lessons</h4>
                    {selectedModuleId === module.id && (
                      <Badge variant="default" className="text-xs">
                        Viewing
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {selectedModuleId === module.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedModuleId(null)}
                        data-testid={`button-hide-lessons-${module.id}`}
                      >
                        Hide
                      </Button>
                    )}
                    {selectedModuleId !== module.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedModuleId(module.id)}
                        data-testid={`button-view-lessons-${module.id}`}
                      >
                        View
                      </Button>
                    )}
                    {selectedModuleId === module.id && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleCreateLesson(module.id)}
                        data-testid={`button-add-lesson-${module.id}`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Lesson
                      </Button>
                    )}
                  </div>
                </div>
                {selectedModuleId === module.id && lessons.length > 0 && (
                  <div className="space-y-2">
                    {lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{lesson.title}</h5>
                            {lesson.pdfUrl && (
                              <FileText className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {lesson.type} • {lesson.xpReward} XP • {lesson.estimatedTime || "10 min"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLesson(lesson)}
                            data-testid={`button-edit-lesson-${lesson.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingLesson({ id: lesson.id, title: lesson.title })}
                            data-testid={`button-delete-lesson-${lesson.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedModuleId === module.id && lessons.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No lessons yet. Click "Add Lesson" to create one.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Module" : "Create New Module"}</DialogTitle>
            <DialogDescription>
              {editingModule ? "Update module details" : "Add a new learning module"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="module-title">Title *</Label>
              <Input
                id="module-title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="e.g., Python for Data Science"
                data-testid="input-module-title"
              />
            </div>
            <div>
              <Label htmlFor="module-description">Description *</Label>
              <Textarea
                id="module-description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Module description..."
                rows={3}
                data-testid="input-module-description"
              />
            </div>
            <div>
              <Label htmlFor="module-career-path">Career Path</Label>
              <Select
                value={moduleForm.careerPath || "null"}
                onValueChange={(value) =>
                  setModuleForm({ ...moduleForm, careerPath: value === "null" ? null : value })
                }
              >
                <SelectTrigger data-testid="select-module-career-path">
                  <SelectValue placeholder="Select career path" />
                </SelectTrigger>
                <SelectContent>
                  {careerPaths.map((path) => (
                    <SelectItem key={path.value || "null"} value={path.value || "null"}>
                      {path.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="module-level">Required Level</Label>
                <Input
                  id="module-level"
                  type="number"
                  min="0"
                  value={moduleForm.requiredLevel}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, requiredLevel: parseInt(e.target.value) || 0 })
                  }
                  data-testid="input-module-level"
                />
              </div>
              <div>
                <Label htmlFor="module-order">Order</Label>
                <Input
                  id="module-order"
                  type="number"
                  min="0"
                  value={moduleForm.order}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 0 })
                  }
                  data-testid="input-module-order"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveModule}
              disabled={!moduleForm.title || !moduleForm.description || createModuleMutation.isPending || updateModuleMutation.isPending}
              data-testid="button-save-module"
            >
              {(createModuleMutation.isPending || updateModuleMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingModule ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "Create New Lesson"}</DialogTitle>
            <DialogDescription>
              {editingLesson ? "Update lesson details" : "Add a new lesson to this module"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">Title *</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="e.g., Introduction to NumPy"
                data-testid="input-lesson-title"
              />
            </div>
            <div>
              <Label htmlFor="lesson-description">Description</Label>
              <Input
                id="lesson-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Brief description of the lesson"
                data-testid="input-lesson-description"
              />
            </div>
            <div>
              <Label htmlFor="lesson-type">Lesson Type</Label>
              <Select
                value={lessonForm.type}
                onValueChange={(value) => setLessonForm({ ...lessonForm, type: value })}
              >
                <SelectTrigger data-testid="select-lesson-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">Theory</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content Type</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  variant={!pdfUrl ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPdfUrl("")}
                  data-testid="button-content-html"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  HTML Content
                </Button>
                <Button
                  variant={pdfUrl ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!pdfUrl) {
                      document.getElementById("pdf-upload")?.click();
                    }
                  }}
                  data-testid="button-content-pdf"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  PDF Lesson
                </Button>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handlePdfUpload}
                />
              </div>
              {uploadingPdf && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading PDF...
                </div>
              )}
              {pdfUrl && (
                <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                  <FileText className="w-4 h-4" />
                  PDF uploaded: {pdfUrl}
                </div>
              )}
            </div>
            {!pdfUrl ? (
              <div>
                <Label htmlFor="lesson-content">HTML Content *</Label>
                <Textarea
                  id="lesson-content"
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  placeholder="Lesson content in HTML format..."
                  rows={8}
                  data-testid="input-lesson-content"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="lesson-pdf-description">PDF Description *</Label>
                <Textarea
                  id="lesson-pdf-description"
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  placeholder="Brief description that will be shown before viewing the PDF..."
                  rows={3}
                  data-testid="input-lesson-pdf-description"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lesson-xp">XP Reward</Label>
                <Input
                  id="lesson-xp"
                  type="number"
                  min="0"
                  value={lessonForm.xpReward}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, xpReward: parseInt(e.target.value) || 0 })
                  }
                  data-testid="input-lesson-xp"
                />
              </div>
              <div>
                <Label htmlFor="lesson-time">Estimated Time</Label>
                <Input
                  id="lesson-time"
                  value={lessonForm.estimatedTime}
                  onChange={(e) => setLessonForm({ ...lessonForm, estimatedTime: e.target.value })}
                  placeholder="e.g., 10 min"
                  data-testid="input-lesson-time"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lesson-level">Required Level</Label>
                <Input
                  id="lesson-level"
                  type="number"
                  min="0"
                  value={lessonForm.requiredLevel}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, requiredLevel: parseInt(e.target.value) || 0 })
                  }
                  data-testid="input-lesson-level"
                />
              </div>
              <div>
                <Label htmlFor="lesson-order">Order</Label>
                <Input
                  id="lesson-order"
                  type="number"
                  min="0"
                  value={lessonForm.order}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, order: parseInt(e.target.value) || 0 })
                  }
                  data-testid="input-lesson-order"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveLesson}
              disabled={!lessonForm.title || createLessonMutation.isPending || updateLessonMutation.isPending}
              data-testid="button-save-lesson"
            >
              {(createLessonMutation.isPending || updateLessonMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingLesson ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!deletingModule}
        onOpenChange={(open) => {
          if (!open && !deleteModuleMutation.isPending) {
            setDeletingModule(null);
          }
        }}
        onConfirm={confirmDeleteModule}
        title="Delete Module"
        description={`Are you sure you want to delete "${deletingModule?.title}"? This will permanently delete the module and all ${modulesData?.modules.find(m => m.id === deletingModule?.id)?.lessonCount || 0} lessons inside it. This action cannot be undone.`}
        confirmText="Delete Module"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteModuleMutation.isPending}
      />

      <ConfirmationDialog
        open={!!deletingLesson}
        onOpenChange={(open) => {
          if (!open && !deleteLessonMutation.isPending) {
            setDeletingLesson(null);
          }
        }}
        onConfirm={confirmDeleteLesson}
        title="Delete Lesson"
        description={`Are you sure you want to delete "${deletingLesson?.title}"? This action cannot be undone and will permanently remove this lesson.`}
        confirmText="Delete Lesson"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteLessonMutation.isPending}
      />
    </div>
  );
}
