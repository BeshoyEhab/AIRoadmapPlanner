import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bot, 
  Sparkles,
  Zap,
  Twitter,
  HardDrive,
  Cpu,
  Plus,
  Key,
  Check,
  X,
  Settings,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

// Available AI providers with their configurations
const AI_PROVIDERS = [
  { 
    id: 'gemini', 
    name: 'Google Gemini', 
    icon: Sparkles, 
    color: 'text-blue-600',
    keyName: 'gemini-api-key',
    description: 'Google\'s advanced AI model for text and multimodal tasks'
  },
  { 
    id: 'openai', 
    name: 'OpenAI', 
    icon: Bot, 
    color: 'text-green-600',
    keyName: 'openai-api-key',
    description: 'ChatGPT and GPT models from OpenAI'
  },
  { 
    id: 'claude', 
    name: 'Anthropic Claude', 
    icon: Zap, 
    color: 'text-orange-600',
    keyName: 'claude-api-key',
    description: 'Claude AI models by Anthropic'
  },
  { 
    id: 'grok', 
    name: 'Grok', 
    icon: Twitter, 
    color: 'text-gray-800',
    keyName: 'grok-api-key',
    description: 'xAI\'s Grok model with real-time data access'
  },
  { 
    id: 'local', 
    name: 'Ollama', 
    icon: HardDrive, 
    color: 'text-purple-600',
    keyName: 'local-api-endpoint',
    description: 'Local AI models running through Ollama'
  },
  { 
    id: 'custom', 
    name: 'Custom Provider', 
    icon: Cpu, 
    color: 'text-indigo-600',
    keyName: 'custom-api-key',
    description: 'Custom AI provider or API endpoint'
  }
];

const AIProvidersStatus = () => {
  const [configuredProviders, setConfiguredProviders] = useState([]);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Check which providers are configured
  useEffect(() => {
    checkConfiguredProviders();
  }, []);

  const checkConfiguredProviders = () => {
    const configured = [];
    
    AI_PROVIDERS.forEach(provider => {
      const key = localStorage.getItem(provider.keyName);
      if (key && key.trim() !== '') {
        configured.push({
          ...provider,
          hasKey: true,
          keyPreview: key.length > 8 ? `${key.substring(0, 8)}...` : '***'
        });
      }
    });
    
    setConfiguredProviders(configured);
  };

  const openConfigDialog = (provider, edit = false) => {
    setSelectedProvider(provider);
    setIsEditing(edit);
    
    if (edit) {
      // const existingKey = localStorage.getItem(provider.keyName) || ''; // For future use
      setApiKey('••••••••'); // Show masked key for editing
    } else {
      setApiKey('');
    }
    
    setShowApiKey(false);
    setIsConfigDialogOpen(true);
  };

  const handleSaveApiKey = () => {
    if (!selectedProvider) return;

    // If editing and user didn't change the masked key, don't update
    if (isEditing && apiKey === '••••••••') {
      setIsConfigDialogOpen(false);
      return;
    }

    if (!apiKey.trim()) {
      toast.error('API key is required');
      return;
    }

    try {
      localStorage.setItem(selectedProvider.keyName, apiKey.trim());
      checkConfiguredProviders(); // Refresh the list
      setIsConfigDialogOpen(false);
      setApiKey('');
      setSelectedProvider(null);
      
      toast.success(`${selectedProvider.name} API key ${isEditing ? 'updated' : 'configured'} successfully!`);
    } catch {
      toast.error('Failed to save API key');
    }
  };

  const handleRemoveProvider = (provider) => {
    try {
      localStorage.removeItem(provider.keyName);
      checkConfiguredProviders(); // Refresh the list
      toast.success(`${provider.name} API key removed`);
    } catch {
      toast.error('Failed to remove API key');
    }
  };

  // const unconfiguredProviders = AI_PROVIDERS.filter(
  //   provider => !configuredProviders.some(configured => configured.id === provider.id)
  // ); // Reserved for future use

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-main flex items-center gap-2">
          <Key className="h-5 w-5 text-theme-primary" />
          AI Providers
        </h3>
        <p className="text-sm text-main text-secondary mt-1">
          Configure API keys for AI providers
        </p>
      </div>

      {/* Providers List */}
      <div className="space-y-3">
        {AI_PROVIDERS.map((provider) => {
          const ProviderIcon = provider.icon;
          const isConfigured = configuredProviders.some(p => p.id === provider.id);
          const configuredProvider = configuredProviders.find(p => p.id === provider.id);
          
          return (
            <div
              key={provider.id}
              className="p-4 border border-border rounded-lg bg-card hover:shadow-sm transition-all duration-200"
            >
              {/* First Row: Icon, Name, State */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted flex-shrink-0">
                    <ProviderIcon className={`h-6 w-6 ${provider.color}`} />
                  </div>
                  <h4 className="font-semibold text-main text-lg">{provider.name}</h4>
                </div>
                
                {/* State Badge */}
                {isConfigured ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-sm px-3 py-1">
                    <Check className="h-3 w-3 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    Not Setup
                  </Badge>
                )}
              </div>

              {/* Second Row: Description */}
              <div className="mb-3 ml-15">
                <p className="text-sm text-main text-muted-foreground leading-relaxed">{provider.description}</p>
              </div>

              {/* Third Row: Action Buttons */}
              <div className="flex items-center gap-2 ml-15">
                {isConfigured ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConfigDialog(configuredProvider, true)}
                      className="text-main flex items-center gap-2 h-9"
                    >
                      <Settings className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Remove ${provider.name} configuration?`)) {
                          handleRemoveProvider(configuredProvider);
                        }
                      }}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 h-9"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => openConfigDialog(provider, false)}
                    className="bg-theme-primary hover:bg-theme-accent text-white flex items-center gap-2 h-9"
                  >
                    <Plus className="h-4 w-4" />
                    Setup
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedProvider && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-main">
                  <selectedProvider.icon className={`h-5 w-5 ${selectedProvider.color}`} />
                  {isEditing ? 'Update' : 'Setup'} {selectedProvider.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-main">API Key *</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Enter your ${selectedProvider.name} API key`}
                      className="pr-10 font-mono"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-main text-muted-foreground">
                    Stored locally in your browser
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)} className="text-main">
                  Cancel
                </Button>
                <Button onClick={handleSaveApiKey} className="text-main">
                  {isEditing ? 'Update' : 'Save'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIProvidersStatus;
