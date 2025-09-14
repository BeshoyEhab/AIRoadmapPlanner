import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Brain, 
  Settings, 
  Plus, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Trash2, 
  TestTube,
  Zap,
  Globe,
  Server,
  Cpu,
  Sparkles,
  Edit
} from 'lucide-react';
import { AIProviderManager } from '@/lib/ai/AIProviderManager';

const AIProviderSettings = ({ onProviderChange }) => {
  const [aiManager] = useState(() => new AIProviderManager());
  const [currentProvider, setCurrentProvider] = useState(null);
  const [availableProviders] = useState(() => aiManager.getAvailableProviders());
  const [initializedProviders, setInitializedProviders] = useState([]);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedProviderForConfig, setSelectedProviderForConfig] = useState(null);
  const [configForm, setConfigForm] = useState({});
  const [showApiKeys, setShowApiKeys] = useState({});
  const [testingProvider, setTestingProvider] = useState(null);
  const [isEditingProvider, setIsEditingProvider] = useState(false);

  useEffect(() => {
    loadExistingProviders();
  }, []);

  const loadExistingProviders = async () => {
    try {
      const { configs, currentProviderType } = aiManager.loadProvidersFromStorage();
      
      // Initialize providers that were previously configured
      const initialized = [];
      
      // Check if there's an existing Gemini API key (for migration)
      const existingGeminiKey = localStorage.getItem('gemini-api-key');
      if (existingGeminiKey) {
        try {
          await aiManager.initializeProvider('gemini', existingGeminiKey);
          initialized.push('gemini');
          
          // Set as current provider if no other is set
          if (!currentProviderType) {
            aiManager.setCurrentProvider('gemini');
            setCurrentProvider('gemini');
          }
        } catch (error) {
          console.warn('Failed to initialize existing Gemini provider:', error);
        }
      }

      // Set current provider if specified
      if (currentProviderType && aiManager.hasProvider(currentProviderType)) {
        aiManager.setCurrentProvider(currentProviderType);
        setCurrentProvider(currentProviderType);
      }

      setInitializedProviders(initialized);
      
      if (onProviderChange) {
        onProviderChange(aiManager);
      }
    } catch (error) {
      console.error('Failed to load existing providers:', error);
    }
  };

  const getProviderIcon = (providerType) => {
    switch (providerType) {
      case 'gemini': return <Sparkles className="h-4 w-4" />;
      case 'openai': return <Brain className="h-4 w-4" />;
      case 'claude': return <Zap className="h-4 w-4" />;
      case 'grok': return <Globe className="h-4 w-4" />;
      case 'local': return <Server className="h-4 w-4" />;
      case 'custom': return <Cpu className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const openConfigDialog = (providerType, isEdit = false) => {
    setSelectedProviderForConfig(providerType);
    setIsEditingProvider(isEdit);
    const requirements = aiManager.getProviderConfigRequirements(providerType);
    
    // Initialize form with default values or current values if editing
    const form = {};
    if (requirements.apiKey) {
      form.apiKey = isEdit ? '••••••••' : '';
    }
    requirements.fields.forEach(field => {
      form[field.name] = field.default || '';
    });
    
    setConfigForm(form);
    setIsConfigDialogOpen(true);
  };

  const handleConfigSubmit = async () => {
    if (!selectedProviderForConfig) return;

    try {
      const { apiKey, ...config } = configForm;
      await aiManager.initializeProvider(selectedProviderForConfig, apiKey, config);
      
      const newInitialized = [...initializedProviders];
      if (!newInitialized.includes(selectedProviderForConfig)) {
        newInitialized.push(selectedProviderForConfig);
      }
      setInitializedProviders(newInitialized);
      
      // Set as current provider if it's the first one
      if (!currentProvider) {
        aiManager.setCurrentProvider(selectedProviderForConfig);
        setCurrentProvider(selectedProviderForConfig);
      }
      
      // Save to storage
      aiManager.saveProvidersToStorage();
      
      toast.success(`${aiManager.getProviderInfo(selectedProviderForConfig).name} configured successfully!`);
      setIsConfigDialogOpen(false);
      
      if (onProviderChange) {
        onProviderChange(aiManager);
      }
    } catch (error) {
      toast.error(`Failed to configure provider: ${error.message}`);
    }
  };

  const handleProviderSwitch = (providerType) => {
    try {
      aiManager.setCurrentProvider(providerType);
      setCurrentProvider(providerType);
      aiManager.saveProvidersToStorage();
      toast.success(`Switched to ${aiManager.getProviderInfo(providerType).name}`);
      
      if (onProviderChange) {
        onProviderChange(aiManager);
      }
    } catch (error) {
      toast.error(`Failed to switch provider: ${error.message}`);
    }
  };

  const handleProviderRemove = (providerType) => {
    aiManager.removeProvider(providerType);
    setInitializedProviders(prev => prev.filter(p => p !== providerType));
    
    if (currentProvider === providerType) {
      const remaining = initializedProviders.filter(p => p !== providerType);
      if (remaining.length > 0) {
        aiManager.setCurrentProvider(remaining[0]);
        setCurrentProvider(remaining[0]);
      } else {
        setCurrentProvider(null);
      }
    }
    
    aiManager.saveProvidersToStorage();
    toast.success(`${aiManager.getProviderInfo(providerType).name} removed`);
    
    if (onProviderChange) {
      onProviderChange(aiManager);
    }
  };

  const testProvider = async (providerType) => {
    setTestingProvider(providerType);
    try {
      await aiManager.testProvider(providerType);
      toast.success(`${aiManager.getProviderInfo(providerType).name} connection successful!`);
    } catch (error) {
      toast.error(`Connection test failed: ${error.message}`);
    } finally {
      setTestingProvider(null);
    }
  };

  const toggleApiKeyVisibility = (fieldName) => {
    setShowApiKeys(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const renderConfigFields = (requirements) => {
    if (!requirements) return null;

    return (
      <div className="space-y-4">
        {requirements.apiKey && (
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex items-center gap-2">
              <Input
                id="apiKey"
                type={showApiKeys.apiKey ? 'text' : 'password'}
                value={configForm.apiKey || ''}
                onChange={(e) => setConfigForm(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your API key"
                className="font-mono"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleApiKeyVisibility('apiKey')}
              >
                {showApiKeys.apiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
        
        {requirements.fields.map(field => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            
            {field.type === 'select' ? (
              <Select
                value={configForm[field.name] || field.default || ''}
                onValueChange={(value) => setConfigForm(prev => ({ ...prev, [field.name]: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'password' ? (
              <div className="flex items-center gap-2">
                <Input
                  id={field.name}
                  type={showApiKeys[field.name] ? 'text' : 'password'}
                  value={configForm[field.name] || ''}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, [field.name]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="font-mono"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleApiKeyVisibility(field.name)}
                >
                  {showApiKeys[field.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <Input
                id={field.name}
                type={field.type}
                value={configForm[field.name] || ''}
                onChange={(e) => setConfigForm(prev => ({ ...prev, [field.name]: e.target.value }))}
                placeholder={field.placeholder}
              />
            )}
            
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            AI Providers
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure and manage your AI providers
          </p>
        </div>
        
        <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{isEditingProvider ? 'Edit AI Provider' : 'Configure AI Provider'}</DialogTitle>
            </DialogHeader>
            
            {!selectedProviderForConfig ? (
              <div className="space-y-4">
                <Label>Select Provider Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableProviders.map(provider => (
                    <Button
                      key={provider.key}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-2"
                      onClick={() => openConfigDialog(provider.key)}
                      disabled={initializedProviders.includes(provider.key)}
                    >
                      <div className="flex items-center gap-2">
                        {getProviderIcon(provider.key)}
                        <span className="font-medium">{provider.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        {provider.description}
                      </p>
                      {initializedProviders.includes(provider.key) && (
                        <Badge variant="secondary" className="mt-1">
                          <Check className="h-3 w-3 mr-1" />
                          Configured
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getProviderIcon(selectedProviderForConfig)}
                  <span className="font-medium">
                    {aiManager.getProviderInfo(selectedProviderForConfig).name}
                  </span>
                </div>
                
                {renderConfigFields(aiManager.getProviderConfigRequirements(selectedProviderForConfig))}
                
                <div className="flex gap-2">
                  <Button onClick={handleConfigSubmit} className="flex-1">
                    {isEditingProvider ? 'Update Provider' : 'Configure Provider'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedProviderForConfig(null);
                      setConfigForm({});
                      setIsEditingProvider(false);
                    }}
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Active Provider */}
      {currentProvider && (
        <div className="border border-primary rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">Active Provider</span>
          </div>
          <div className="flex items-center gap-2">
            {getProviderIcon(currentProvider)}
            <span className="font-medium">{aiManager.getProviderInfo(currentProvider).name}</span>
          </div>
        </div>
      )}

      {/* Initialized Providers */}
      {initializedProviders.length > 0 && (
        <div className="space-y-3">
          <Label>Configured Providers</Label>
          {initializedProviders.map(providerType => {
            const providerInfo = aiManager.getProviderInfo(providerType);
            const isActive = currentProvider === providerType;
            
            return (
              <div key={providerType} className={`border rounded-lg p-3 ${isActive ? 'border-primary' : 'border-border'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getProviderIcon(providerType)}
                    <div>
                      <div className="font-medium">{providerInfo.name}</div>
                      <p className="text-sm text-muted-foreground">
                        {providerInfo.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProviderSwitch(providerType)}
                      >
                        Use
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openConfigDialog(providerType, true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => testProvider(providerType)}
                      disabled={testingProvider === providerType}
                    >
                      {testingProvider === providerType ? (
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleProviderRemove(providerType)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                
                {isActive && (
                  <Badge variant="outline" className="mt-2 border-primary text-primary">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}

      {initializedProviders.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="w-16 h-16 border-2 border-border rounded-xl flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-muted-foreground" />
          </div>
          <p>No AI providers configured yet.</p>
          <p className="text-sm">Click "Add Provider" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default AIProviderSettings;
