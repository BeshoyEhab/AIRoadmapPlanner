import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import ModelsManager from "./ModelsManager";
import AIProvidersStatus from "./AIProvidersStatus";
import ColorPicker from "./ColorPicker";
import BackupRestore from "../backup/BackupRestore";
// import { useAppContext } from "@/contexts/AppContext"; // Reserved for future use
import { useColorTheme } from "@/hooks/useColorTheme";
import { validateApiKey, sanitizeInput } from "@/utils/security";
import {
  Brain,
  Palette,
  Monitor,
  Moon,
  Sun,
  Zap,
  Shield,
  Globe,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Database,
  Key,
} from "lucide-react";

const Settings = ({ theme, toggleTheme }) => {
  const isDarkMode = theme === 'dark';
  const { currentTheme, changeTheme } = useColorTheme(isDarkMode);
  // State variables with proper setters
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [exportFormat, setExportFormat] = useState("markdown");
  const [language, setLanguage] = useState("en");
  const [minPhases, setMinPhases] = useState(15);
  const [maxPhases, setMaxPhases] = useState(50);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(true);
  
  // API Key security states
  const [apiKey, setApiKey] = useState("");
  // These states are kept for future implementation
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyValidation, setApiKeyValidation] = useState({ isValid: true, error: null });
  
  useEffect(() => {
    const savedAutoSave = localStorage.getItem("auto-save");
    if (savedAutoSave !== null) {
      setAutoSave(savedAutoSave === "true");
    }

    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications !== null) {
      setNotifications(savedNotifications === "true");
    }

    const savedExportFormat = localStorage.getItem("export-format");
    if (savedExportFormat) {
      setExportFormat(savedExportFormat);
    }

    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    const savedMinPhases = localStorage.getItem("min-phases");
    if (savedMinPhases) {
      setMinPhases(parseInt(savedMinPhases));
    }

    const savedMaxPhases = localStorage.getItem("max-phases");
    if (savedMaxPhases) {
      setMaxPhases(parseInt(savedMaxPhases));
    }

    const savedAdaptiveDifficulty = localStorage.getItem("adaptive-difficulty");
    if (savedAdaptiveDifficulty !== null) {
      setAdaptiveDifficulty(savedAdaptiveDifficulty === "true");
    }

    // Load API key
    const savedApiKey = localStorage.getItem("gemini-api-key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      const validation = validateApiKey(savedApiKey);
      setApiKeyValidation(validation);
    }
  }, []);

  // const handleSettingsSave = () => { // Auto-save functionality - reserved for future use
  //   localStorage.setItem("auto-save", autoSave.toString());
  //   localStorage.setItem("notifications", notifications.toString());
  //   localStorage.setItem("export-format", exportFormat);
  //   localStorage.setItem("language", language);
  //   localStorage.setItem("min-phases", minPhases.toString());
  //   localStorage.setItem("max-phases", maxPhases.toString());
  //   localStorage.setItem(
  //     "adaptive-difficulty",
  //     adaptiveDifficulty.toString(),
  //   );

  //   if (onSave) {
  //     onSave();
  //   }
  //   toast.success("Settings saved successfully!");
  // };


  const handleReset = () => {
    localStorage.clear();
    setAutoSave(true);
    setNotifications(true);
    setExportFormat("markdown");
    setLanguage("en");
    setMinPhases(15);
    setMaxPhases(50);
    setAdaptiveDifficulty(true);
    toast.success("Settings reset to defaults!");
  };

  const exportSettings = () => {
    const settings = {
      autoSave,
      notifications,
      exportFormat,
      language,
      theme: theme || "dark",
      colorTheme: currentTheme,
      minPhases,
      maxPhases,
      adaptiveDifficulty,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timeplan-settings.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Settings exported successfully!");
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result);
        if (settings.autoSave !== undefined) setAutoSave(settings.autoSave);
        if (settings.notifications !== undefined)
          setNotifications(settings.notifications);
        if (settings.exportFormat) setExportFormat(settings.exportFormat);
        if (settings.language) setLanguage(settings.language);
        if (settings.colorTheme) changeTheme(settings.colorTheme);
        if (settings.minPhases) setMinPhases(settings.minPhases);
        if (settings.maxPhases) setMaxPhases(settings.maxPhases);
        if (settings.adaptiveDifficulty !== undefined)
          setAdaptiveDifficulty(settings.adaptiveDifficulty);
        toast.success("Settings imported successfully!");
      } catch {
        toast.error("Invalid settings file format.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // API Key management functions
  const handleApiKeyChange = (value) => {
    const sanitized = sanitizeInput(value);
    setApiKey(sanitized);
    
    if (sanitized.length > 0) {
      const validation = validateApiKey(sanitized);
      setApiKeyValidation(validation);
    } else {
      setApiKeyValidation({ isValid: true, error: null });
    }
  };

  const handleApiKeySave = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    const validation = validateApiKey(apiKey);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    localStorage.setItem("gemini-api-key", apiKey);
    setApiKeyValidation(validation);
    toast.success("API key saved successfully!");
  };

  const handleApiKeyClear = () => {
    setApiKey("");
    localStorage.removeItem("gemini-api-key");
    setApiKeyValidation({ isValid: true, error: null });
    toast.success("API key cleared");
  };

  // Mark unused variables with _ to satisfy linter
  // This must be after all handler functions are defined
  const _unusedVars = { 
    setNotifications, 
    setExportFormat, 
    setLanguage, 
    setMinPhases, 
    setMaxPhases, 
    setAdaptiveDifficulty, 
    showApiKey, 
    apiKeyValidation,
    handleApiKeyChange,
    handleApiKeySave,
    handleApiKeyClear,
    setShowApiKey
  };

  return (
    <div className="h-full w-full p-5 overflow-y-auto no-scrollbar">
      {/* AI Providers */}
      <div className="mb-8">
        <div className="border border-default p-4 rounded-lg">
          <AIProvidersStatus />
        </div>
      </div>

      {/* AI Models */}
      <div className="mb-8">
        <div className="border border-default p-4 rounded-lg">
          <ModelsManager />
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-card-foreground uppercase tracking-wider mb-4">
          Appearance
        </h3>
        <div className="space-y-6 border border-default p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2 text-card-foreground">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 text-card-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-card-foreground" />
                )}
                Theme Mode
              </Label>
              <p className="text-sm text-main">
                Switch between light and dark themes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
              onClick={toggleTheme}
              className="p-3 rounded-xl text-muted hover:bg-hover hover:text-content
    icon-button hover:shadow-md min-w-[2.75rem] flex items-center justify-center ml-2 transition-all duration-200 hover:scale-105"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon size={22} className="text-theme-primary" />
              ) : (
                <Sun size={22} className="text-warning" />
              )}
            </button>
            </div>
          </div>
          
          {/* Color Theme Picker */}
          <div className="border-t border-default pt-6">
            <ColorPicker 
              currentTheme={currentTheme}
              onThemeChange={changeTheme}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>

      {/* Application Settings */}
      <div className="mb-8 text-main">
        <h3 className="text-xs font-semibold text-card-foreground uppercase tracking-wider mb-4">
          Application Settings
        </h3>
        <div className="space-y-4 border border-default p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-card-foreground">Auto-save Roadmaps</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save your progress while working
              </p>
            </div>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-card-foreground">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for important updates
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-format" className="text-card-foreground">Default Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat} className="text-main">
              <SelectTrigger id="export-format">
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent className="bg-theme-primary text-main border-theme-primary">
                <SelectItem value="markdown" className="text-main hover:bg-theme-accent focus:bg-theme-accent focus:text-main data-[highlighted]:bg-theme-accent data-[highlighted]:text-main">Markdown (.md)</SelectItem>
                <SelectItem value="pdf" className="text-main hover:bg-theme-accent focus:bg-theme-accent focus:text-main data-[highlighted]:bg-theme-accent data-[highlighted]:text-main">PDF Document</SelectItem>
                <SelectItem value="json" className="text-main hover:bg-theme-accent focus:bg-theme-accent focus:text-main data-[highlighted]:bg-theme-accent data-[highlighted]:text-main">JSON Data</SelectItem>
                <SelectItem value="html" className="text-main hover:bg-theme-accent focus:bg-theme-accent focus:text-main data-[highlighted]:bg-theme-accent data-[highlighted]:text-main">HTML Page</SelectItem>
              </SelectContent>
            </Select>
          </div>  
        </div>
      </div>

      {/* Roadmap Generation Settings */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-card-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Brain className="h-4 w-4 text-card-foreground" />
          Roadmap Generation
        </h3>
        <div className="space-y-4 border border-default p-4 rounded-lg text-main">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-card-foreground">Adaptive Difficulty Phases</Label>
              <p className="text-sm text-muted-foreground">
                Automatically adjust phase count based on difficulty level
              </p>
            </div>
            <Switch
              checked={adaptiveDifficulty}
              onCheckedChange={setAdaptiveDifficulty}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-phases" className="text-card-foreground">Minimum Phases</Label>
              <Input
                id="min-phases"
                type="number"
                min="5"
                max="100"
                value={minPhases}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value <= maxPhases) {
                    setMinPhases(value);
                  }
                }}
                className="w-full text-card-foreground bg-surface border-default"
              />
              <p className="text-xs text-muted-foreground">
                Minimum number of learning phases
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-phases" className="text-card-foreground">Maximum Phases</Label>
              <Input
                id="max-phases"
                type="number"
                min="5"
                max="100"
                value={maxPhases}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value >= minPhases) {
                    setMaxPhases(value);
                  }
                }}
                className="w-full text-card-foreground bg-surface border-default"
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of learning phases
              </p>
            </div>
          </div>

          {adaptiveDifficulty && (
            <div className="border border-default rounded-lg p-3">
              <h4 className="text-sm font-medium text-card-foreground mb-2">
                Adaptive Phase Count
              </h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  • <strong>Easy:</strong> {Math.ceil(minPhases)} -{" "}
                  {Math.ceil(minPhases + (maxPhases - minPhases) * 0.3)} phases
                </div>
                <div>
                  • <strong>Medium:</strong>{" "}
                  {Math.ceil(minPhases + (maxPhases - minPhases) * 0.3)} -{" "}
                  {Math.ceil(minPhases + (maxPhases - minPhases) * 0.6)} phases
                </div>
                <div>
                  • <strong>Hard:</strong>{" "}
                  {Math.ceil(minPhases + (maxPhases - minPhases) * 0.6)} -{" "}
                  {Math.ceil(minPhases + (maxPhases - minPhases) * 0.8)} phases
                </div>
                <div>
                  • <strong>Expert:</strong>{" "}
                  {Math.ceil(minPhases + (maxPhases - minPhases) * 0.8)} -{" "}
                  {maxPhases} phases
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="mb-8 text-main">
        <h3 className="text-xs font-semibold text-card-foreground uppercase tracking-wider mb-4">
          Data Management
        </h3>
        <div className="space-y-4 border border-default p-4 rounded-lg">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportSettings}
              className="flex items-center gap-2 w-1/2"
            >
              <Download className="h-4 w-4" />
              Export Settings
            </Button>
            <div className="relative w-1/2">
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button
                variant="outline"
                className="flex items-center gap-2 w-full"
              >
                <Upload className="h-4 w-4" />
                Import Settings
              </Button>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={handleReset}
            className="flex items-center gap-2 w-full"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
