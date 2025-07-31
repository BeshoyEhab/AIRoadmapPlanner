import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Key, 
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
  Eye,
  EyeOff
} from 'lucide-react';

const Settings = ({ onSave, theme, toggleTheme }) => {
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyChanged, setIsApiKeyChanged] = useState(false);
  const [model, setModel] = useState('gemini-2.5-flash');
  const [availableModels, setAvailableModels] = useState([]);
  const [newModelName, setNewModelName] = useState('');
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveButtonText, setSaveButtonText] = useState('Save Settings');
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [exportFormat, setExportFormat] = useState('markdown');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    const savedModels = localStorage.getItem('gemini-available-models');
    if (savedModels) {
      setAvailableModels(JSON.parse(savedModels));
    } else {
      setAvailableModels(['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro']);
    }

    const savedModel = localStorage.getItem('gemini-model');
    if (savedModel) {
      setModel(savedModel);
    }
    
    const savedAutoSave = localStorage.getItem('auto-save');
    if (savedAutoSave !== null) {
      setAutoSave(savedAutoSave === 'true');
    }

    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications !== null) {
      setNotifications(savedNotifications === 'true');
    }

    const savedExportFormat = localStorage.getItem('export-format');
    if (savedExportFormat) {
      setExportFormat(savedExportFormat);
    }

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSave = () => {
    if (isApiKeyChanged) {
        if (!apiKey) {
            toast.error('API Key cannot be empty.');
            return;
        }
        localStorage.setItem('gemini-api-key', apiKey);
        setIsApiKeyChanged(false);
        toast.success('API Key updated successfully!');
    } else {
        localStorage.setItem('gemini-model', model);
        localStorage.setItem('gemini-available-models', JSON.stringify(availableModels));
        localStorage.setItem('auto-save', autoSave.toString());
        localStorage.setItem('notifications', notifications.toString());
        localStorage.setItem('export-format', exportFormat);
        localStorage.setItem('language', language);
        
        if (onSave) {
          onSave();
        }
        toast.success('Settings saved successfully!');
    }
  };

  const handleAddModel = () => {
    if (newModelName.trim() && !availableModels.includes(newModelName.trim())) {
      const updatedModels = [...availableModels, newModelName.trim()];
      setAvailableModels(updatedModels);
      localStorage.setItem('gemini-available-models', JSON.stringify(updatedModels));
      setNewModelName('');
      toast.success(`Model '${newModelName.trim()}' added.`);
    } else if (availableModels.includes(newModelName.trim())) {
      toast.error(`Model '${newModelName.trim()}' already exists.`);
    }
  };

  const handleRemoveModel = (modelToRemove) => {
    if (availableModels.length === 1) {
      toast.error("Cannot remove the last model.");
      return;
    }
    const updatedModels = availableModels.filter(m => m !== modelToRemove);
    setAvailableModels(updatedModels);
    localStorage.setItem('gemini-available-models', JSON.stringify(updatedModels));
    if (model === modelToRemove) {
      setModel(updatedModels[0]);
      localStorage.setItem('gemini-model', updatedModels[0]);
    }
    toast.success(`Model '${modelToRemove}' removed.`);
  };

  const handleMoveModel = (fromIndex, toIndex) => {
    const updatedModels = [...availableModels];
    const [movedModel] = updatedModels.splice(fromIndex, 1);
    updatedModels.splice(toIndex, 0, movedModel);
    setAvailableModels(updatedModels);
    localStorage.setItem('gemini-available-models', JSON.stringify(updatedModels));
    toast.success(`Model '${movedModel}' moved.`);
  };

  const handleReset = () => {
    localStorage.clear();
    setApiKey('');
    setModel('gemini-2.5-flash');
    setAvailableModels(['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro']);
    setAutoSave(true);
    setNotifications(true);
    setExportFormat('markdown');
    setLanguage('en');
    setIsApiKeyChanged(false);
    toast.success('Settings reset to defaults!');
  };

  const exportSettings = () => {
    const settings = {
      model,
      autoSave,
      notifications,
      exportFormat,
      language,
      theme: theme || 'dark',
      availableModels,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timeplan-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully!');
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result);
        if (settings.model) setModel(settings.model);
        if (settings.autoSave !== undefined) setAutoSave(settings.autoSave);
        if (settings.notifications !== undefined) setNotifications(settings.notifications);
        if (settings.exportFormat) setExportFormat(settings.exportFormat);
        if (settings.language) setLanguage(settings.language);
        if (settings.availableModels) setAvailableModels(settings.availableModels);
        toast.success('Settings imported successfully!');
      } catch (error) {
        toast.error('Invalid settings file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="h-full w-full p-5 overflow-y-auto no-scrollbar">
      {/* API Configuration */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">API Configuration</h3>
        <div className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="flex items-center gap-2"><Shield className="h-4 w-4" />Gemini API Key</Label>
            <div className="flex items-center gap-2">
              <Input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setIsApiKeyChanged(true); }}
                placeholder="Enter your Gemini API key"
                className="font-mono bg-transparent"
              />
              <Button variant="ghost" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {isApiKeyChanged && <Button onClick={handleSave} className="w-full mt-2">Update API Key</Button>}
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Get your API key from{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">Google AI Studio</a>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="model-select" className="flex items-center gap-2"><Brain className="h-4 w-4" />Default AI Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model-select">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Brain className="h-4 w-4" />Available AI Models (Drag to reorder)</Label>
            <div className="space-y-2 mt-2">
              {availableModels.map((m, index) => (
                <div
                  key={m}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData('text/plain', index); setDraggingIndex(index); }}
                  onDragEnd={() => setDraggingIndex(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { const draggedIndex = e.dataTransfer.getData('text/plain'); handleMoveModel(parseInt(draggedIndex), index); }}
                  className={`flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md cursor-grab ${draggingIndex === index ? 'opacity-50' : ''}`}>
                  <span>{m}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveModel(m)} disabled={availableModels.length === 1}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Appearance</h3>
        <div className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">{theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}Theme Mode</Label>
              <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Application Settings */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Application Settings</h3>
        <div className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-save Roadmaps</Label>
              <p className="text-sm text-muted-foreground">Automatically save your progress while working</p>
            </div>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications for important updates</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-format">Default Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger id="export-format"><SelectValue placeholder="Select export format" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="markdown">Markdown (.md)</SelectItem>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="json">JSON Data</SelectItem>
                <SelectItem value="html">HTML Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Interface Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language"><SelectValue placeholder="Select language" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Data Management</h3>
        <div className="space-y-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportSettings} className="flex items-center gap-2 w-1/2"><Download className="h-4 w-4" />Export Settings</Button>
            <div className="relative w-1/2">
              <input type="file" accept=".json" onChange={importSettings} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Button variant="outline" className="flex items-center gap-2 w-full"><Upload className="h-4 w-4" />Import Settings</Button>
            </div>
          </div>
          <Button variant="destructive" onClick={handleReset} className="flex items-center gap-2 w-full"><RotateCcw className="h-4 w-4" />Reset to Defaults</Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button onClick={handleSave} className="flex-1 flex items-center gap-2"><Shield className="h-4 w-4" />Save All Settings</Button>
      </div>
    </div>
  );
};

export default Settings;
