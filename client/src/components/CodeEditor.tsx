import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RotateCcw, Play } from "lucide-react";
import CodeMirror from "@uiw/react-textarea-code-editor";

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  onLanguageChange?: (language: string) => void;
  onSubmit?: (code: string) => void;
  isSubmitting?: boolean;
}

const languageOptions = [
  { value: "javascript", label: "JavaScript", editorLang: "js" },
  { value: "python", label: "Python", editorLang: "python" },
  { value: "java", label: "Java", editorLang: "java" },
  { value: "cpp", label: "C++", editorLang: "cpp" },
];

const defaultCodeTemplates: Record<string, string> = {
  javascript: "// Write your code here\nfunction solution() {\n  return 'Hello, CareerQuest!';\n}\n\nsolution();",
  python: "# Write your code here\ndef solution():\n    return 'Hello, CareerQuest!'\n\nsolution()",
  java: "// Write your code here\npublic class Solution {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, CareerQuest!\");\n    }\n}",
  cpp: "// Write your code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, CareerQuest!\" << endl;\n    return 0;\n}",
};

export default function CodeEditor({ 
  initialCode,
  language = "javascript",
  onLanguageChange,
  onSubmit,
  isSubmitting = false
}: CodeEditorProps) {
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [code, setCode] = useState(initialCode || defaultCodeTemplates[language]);

  // Update code when initialCode or language changes
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    } else {
      setCode(defaultCodeTemplates[currentLanguage] || "");
    }
  }, [initialCode, currentLanguage]);

  const handleLanguageChange = (newLanguage: string) => {
    setCurrentLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
    
    // Update code template if no custom code
    if (!initialCode) {
      setCode(defaultCodeTemplates[newLanguage] || "");
    }
  };

  const handleReset = () => {
    const resetCode = initialCode || defaultCodeTemplates[currentLanguage];
    setCode(resetCode);
  };

  const handleSubmit = () => {
    onSubmit?.(code);
  };

  const editorLang = languageOptions.find(l => l.value === currentLanguage)?.editorLang || "js";

  return (
    <div className="space-y-4">
      <Card className="flex flex-col">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Language:</span>
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-40" data-testid="select-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleReset}
              data-testid="button-reset"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <CodeMirror
            value={code}
            language={editorLang}
            onChange={(evn) => setCode(evn.target.value)}
            padding={16}
            data-testid="input-code"
            style={{
              fontSize: 14,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              minHeight: '500px',
              backgroundColor: '#1e1e1e',
            }}
            className="w-full"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button 
          size="lg" 
          onClick={handleSubmit}
          disabled={isSubmitting}
          data-testid="button-submit"
        >
          {isSubmitting ? (
            <>Submitting...</>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Submit Solution
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
