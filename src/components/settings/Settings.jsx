import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Settings = ({ onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [saveButtonText, setSaveButtonText] = useState('Save Settings');

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini-api-key');
    const savedModel = localStorage.getItem('gemini-model');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setSaveButtonText('Change Existing Key');
    }
    if (savedModel) {
      setModel(savedModel);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey) {
      toast.error('API Key cannot be empty.');
      return;
    }
    localStorage.setItem('gemini-api-key', apiKey);
    localStorage.setItem('gemini-model', model);
    if (onSave) {
      onSave();
    }
    toast.success('Settings saved!');
    setSaveButtonText('Change Existing Key');
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Settings</h2>
      <div className="space-y-2">
        <Label htmlFor="api-key">Gemini API Key</Label>
        <Input
          id="api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API key"
        />
        <p className="text-sm text-muted-foreground">
          Get your API key from{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Google AI Studio
          </a>
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="model">Preferred Model</Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger id="model">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
            <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
            <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
            <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
            <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSave}>{saveButtonText}</Button>
    </div>
  );
};

export default Settings;
