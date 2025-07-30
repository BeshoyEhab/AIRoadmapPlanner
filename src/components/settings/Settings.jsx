import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  RotateCcw
} from 'lucide-react';

const Settings = ({ onSave, theme, toggleTheme }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [saveButtonText, setSaveButtonText] = useState('Save Settings');
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [exportFormat, setExportFormat] = useState('markdown');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini-api-key');
    const savedModel = localStorage.getItem('gemini-model');
    const savedAutoSave = localStorage.getItem('auto-save');
    const savedNotifications = localStorage.getItem('notifications');
    const savedExportFormat = localStorage.getItem('export-format');
    const savedLanguage = localStorage.getItem('language');

    if (savedApiKey) {
      setApiKey(savedApiKey);
      setSaveButtonText('Update API Key');
    }
    if (savedModel) {
      setModel(savedModel);
    }
    if (savedAutoSave !== null) {
      setAutoSave(savedAutoSave === 'true');
    }
    if (savedNotifications !== null) {
      setNotifications(savedNotifications === 'true');
    }
    if (savedExportFormat) {
      setExportFormat(savedExportFormat);
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey) {
      toast.error('API Key cannot be empty.');
      return;
    }
    localStorage.setItem('gemini-api-key', apiKey);
    localStorage.setItem('gemini-model', model);
    localStorage.setItem('auto-save', autoSave.toString());
    localStorage.setItem('notifications', notifications.toString());
    localStorage.setItem('export-format', exportFormat);
    localStorage.setItem('language', language);
    
    if (onSave) {
      onSave();
    }
    toast.success('Settings saved successfully!');
    setSaveButtonText('Update API Key');
  };

  const handleReset = () => {
    localStorage.removeItem('gemini-api-key');
    localStorage.removeItem('gemini-model');
    localStorage.removeItem('auto-save');
    localStorage.removeItem('notifications');
    localStorage.removeItem('export-format');
    localStorage.removeItem('language');
    
    setApiKey('');
    setModel('gemini-2.5-flash');
    setAutoSave(true);
    setNotifications(true);
    setExportFormat('markdown');
    setLanguage('en');
    setSaveButtonText('Save Settings');
    
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
        
        toast.success('Settings imported successfully!');
      } catch (error) {
        toast.error('Invalid settings file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <ScrollArea className="h-[calc(100vh-100px)] p-1">
      {/* API Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5 text-blue-500" />
            API Configuration
          </CardTitle>
          <CardDescription>
            Configure your AI model settings and API access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Gemini API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Get your API key from{' '}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary transition-colors"
              >
                Google AI Studio
              </a>
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Model
            </Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.5-flash">
                  <div className="flex items-center justify-between w-full">
                    <span>Gemini 2.5 Flash</span>
                    <Badge variant="secondary" className="ml-2">Latest</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="gemini-2.0-flash">
                  <div className="flex items-center justify-between w-full">
                    <span>Gemini 2.0 Flash</span>
                    <Badge variant="outline" className="ml-2">Fast</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                <SelectItem value="gemini-1.5-pro">
                  <div className="flex items-center justify-between w-full">
                    <span>Gemini 1.5 Pro</span>
                    <Badge variant="outline" className="ml-2">Pro</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-purple-500" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Theme Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-yellow-500" />
            Application Settings
          </CardTitle>
          <CardDescription>
            Configure app behavior and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-save Roadmaps</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save your progress while working
              </p>
            </div>
            <Switch
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for important updates
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="export-format">Default Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger id="export-format">
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
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
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Monitor className="h-5 w-5 text-green-500" />
            Data Management
          </CardTitle>
          <CardDescription>
            Import, export, and manage your settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportSettings} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Settings
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import Settings
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <Button 
            variant="destructive" 
            onClick={handleReset}
            className="flex items-center gap-2 w-full"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button onClick={handleSave} className="flex-1 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {saveButtonText}
        </Button>
      </div>
    </ScrollArea>
  );
};

export default Settings;
