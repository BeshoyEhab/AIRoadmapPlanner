import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  GripVertical,
  Sparkles,
  Cpu,
  Brain,
  Zap,
  Globe,
  Server,
  Settings2,
  Check,
  X,
  Move3D
} from 'lucide-react';
import { toast } from 'sonner';

const MODELS_STORAGE_KEY = 'ai-models-config';

// Default available providers for model selection
const AVAILABLE_PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini', icon: Sparkles, color: 'text-blue-600' },
  { id: 'openai', name: 'OpenAI', icon: Brain, color: 'text-green-600' },
  { id: 'claude', name: 'Anthropic Claude', icon: Zap, color: 'text-purple-600' },
  { id: 'grok', name: 'Grok', icon: Globe, color: 'text-orange-600' },
  { id: 'local', name: 'Local Model', icon: Server, color: 'text-gray-600' },
  { id: 'custom', name: 'Custom Provider', icon: Cpu, color: 'text-indigo-600' },
];

const ModelsManager = () => {
  const [models, setModels] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [newModel, setNewModel] = useState({
    provider: '',
    modelName: '',
    displayName: '',
    description: ''
  });

  // Load models from localStorage on mount
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = useCallback(() => {
    try {
      const stored = localStorage.getItem(MODELS_STORAGE_KEY);
      if (stored) {
        const parsedModels = JSON.parse(stored);
        // Ensure each model has a unique ID and order
        const modelsWithIds = parsedModels.map((model, index) => ({
          ...model,
          id: model.id || `model-${Date.now()}-${index}`,
          order: model.order !== undefined ? model.order : index
        }));
        // Sort by order
        modelsWithIds.sort((a, b) => a.order - b.order);
        setModels(modelsWithIds);
      } else {
        // Set default models if none exist
        const defaultModels = [
          {
            id: 'default-gemini-flash',
            provider: 'gemini',
            modelName: 'gemini-2.0-flash-exp',
            displayName: 'Gemini 2.0 Flash (Experimental)',
            description: 'Fast and efficient model for general tasks',
            order: 0,
            isDefault: true
          },
          {
            id: 'default-gemini-pro',
            provider: 'gemini',
            modelName: 'gemini-1.5-pro',
            displayName: 'Gemini 1.5 Pro',
            description: 'Advanced model for complex reasoning',
            order: 1,
            isDefault: true
          }
        ];
        setModels(defaultModels);
        saveModels(defaultModels);
      }
    } catch (_error) {
      console.error('Failed to load models:', _error);
      toast.error('Failed to load models configuration');
    }
  }, []);

  const saveModels = useCallback((modelsToSave) => {
    try {
      localStorage.setItem(MODELS_STORAGE_KEY, JSON.stringify(modelsToSave));
      
      // Also save to the legacy gemini models format for compatibility
      const geminiModels = modelsToSave
        .filter(model => model.provider === 'gemini')
        .map(model => model.modelName);
      
      if (geminiModels.length > 0) {
        localStorage.setItem('gemini-available-models', JSON.stringify(geminiModels));
      }
      
      // Trigger storage event to notify other components of model changes
      window.dispatchEvent(new StorageEvent('storage', {
        key: MODELS_STORAGE_KEY,
        newValue: JSON.stringify(modelsToSave),
        storageArea: localStorage
      }));
    } catch (_error) {
      console.error('Failed to save models:', _error);
      toast.error('Failed to save models configuration');
    }
  }, []);

  const handleAddModel = useCallback(() => {
    if (!newModel.provider || !newModel.modelName) {
      toast.error('Provider and model name are required');
      return;
    }

    // Check for duplicate model names
    const isDuplicate = models.some(model => 
      model.provider === newModel.provider && model.modelName === newModel.modelName
    );

    if (isDuplicate) {
      toast.error('This model already exists');
      return;
    }

    const modelToAdd = {
      id: `model-${Date.now()}`,
      provider: newModel.provider,
      modelName: newModel.modelName.trim(),
      displayName: newModel.displayName.trim() || newModel.modelName.trim(),
      description: newModel.description.trim() || 'Custom model',
      order: models.length,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    const updatedModels = [...models, modelToAdd];
    setModels(updatedModels);
    saveModels(updatedModels);

    // Reset form
    setNewModel({
      provider: '',
      modelName: '',
      displayName: '',
      description: ''
    });
    setIsAddDialogOpen(false);

    toast.success(`Added model: ${modelToAdd.displayName}`);
  }, [models, newModel, saveModels]);

  const handleDeleteModel = useCallback((modelId) => {
    const modelToDelete = models.find(m => m.id === modelId);
    
    if (!modelToDelete) {
      toast.error('Model not found');
      return;
    }

    // Allow deletion of all models, including default ones
    const updatedModels = models.filter(m => m.id !== modelId);
    // Reorder remaining models
    const reorderedModels = updatedModels.map((model, index) => ({
      ...model,
      order: index
    }));

    setModels(reorderedModels);
    saveModels(reorderedModels);
    
    toast.success(`Removed model: ${modelToDelete?.displayName || modelToDelete?.modelName || 'Unknown'}`);
  }, [models, saveModels]);

  const handleDragStart = useCallback((e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const updatedModels = [...models];
    const draggedModel = updatedModels[draggedIndex];
    
    // Remove the dragged model from its original position
    updatedModels.splice(draggedIndex, 1);
    
    // Insert it at the new position
    updatedModels.splice(dropIndex, 0, draggedModel);
    
    // Update order property for all models
    const reorderedModels = updatedModels.map((model, index) => ({
      ...model,
      order: index
    }));

    setModels(reorderedModels);
    saveModels(reorderedModels);
    setDraggedIndex(null);
    
    toast.success('Models reordered successfully');
  }, [models, draggedIndex, saveModels]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const getProviderInfo = useCallback((providerId) => {
    return AVAILABLE_PROVIDERS.find(p => p.id === providerId) || {
      id: providerId,
      name: providerId,
      icon: Cpu,
      color: 'text-gray-600'
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-main flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-theme-primary" />
            Models
          </h3>
          <p className="text-sm text-main text-secondary mt-1">
            Manage AI models and their order for generation. Drag to reorder.
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-theme-primary hover:bg-theme-accent text-white text-main">
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-main">
                <Plus className="h-5 w-5 text-theme-primary" />
                Add New Model
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Provider Selection */}
              <div className="space-y-2">
                <Label htmlFor="provider" className="text-main">Provider *</Label>
                <Select 
                  value={newModel.provider} 
                  onValueChange={(value) => setNewModel({...newModel, provider: value})}
                >
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center gap-2 text-main">
                          <provider.icon className={`h-4 w-4 ${provider.color}`} />
                          {provider.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model Name */}
              <div className="space-y-2">
                <Label htmlFor="modelName" className="text-main">Model Name *</Label>
                <Input
                  id="modelName"
                  value={newModel.modelName}
                  onChange={(e) => setNewModel({...newModel, modelName: e.target.value})}
                  placeholder="e.g., gpt-4, claude-3-opus, gemini-pro"
                  className="font-mono"
                />
                <p className="text-xs text-main text-muted-foreground">
                  Enter the exact model identifier used by the API
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-main">Display Name</Label>
                <Input
                  id="displayName"
                  value={newModel.displayName}
                  onChange={(e) => setNewModel({...newModel, displayName: e.target.value})}
                  placeholder="e.g., GPT-4 Turbo, Claude 3 Opus"
                />
                <p className="text-xs text-main text-muted-foreground">
                  Friendly name shown in the interface (optional)
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-main">Description</Label>
                <Input
                  id="description"
                  value={newModel.description}
                  onChange={(e) => setNewModel({...newModel, description: e.target.value})}
                  placeholder="Brief description of the model's capabilities"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="text-main">
                Cancel
              </Button>
              <Button onClick={handleAddModel} className="text-main">
                Add Model
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Models List */}
      <div className="space-y-3">
        {models.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
            <Settings2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h4 className="text-lg font-medium text-main text-muted-foreground mb-2">No models configured</h4>
            <p className="text-sm text-main text-muted-foreground mb-4">Add your first model to get started</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-theme-primary hover:bg-theme-accent text-white text-main"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </div>
        ) : (
          models.map((model, index) => {
            const providerInfo = getProviderInfo(model.provider);
            const ProviderIcon = providerInfo.icon;
            
            return (
              <div
                key={model.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  group flex items-center gap-3 p-3 border border-border rounded-lg bg-card
                  hover:border-theme-primary/50 hover:shadow-md transition-all duration-200
                  cursor-move ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                `}
              >
                {/* Drag Handle */}
                <div className="flex items-center text-muted-foreground group-hover:text-theme-primary cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-5 w-5" />
                </div>

                {/* Provider Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted flex-shrink-0">
                  <ProviderIcon className={`h-5 w-5 ${providerInfo.color}`} />
                </div>
                
                {/* Model Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-main break-words leading-tight">{model.displayName || model.modelName}</h4>
                    <div className="flex gap-1 flex-shrink-0">
                      {model.isDefault && (
                        <Badge variant="secondary" className="text-xs text-main">
                          Default
                        </Badge>
                      )}
                      {model.isCustom && (
                        <Badge variant="outline" className="text-xs text-main border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300">
                          Custom
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-main text-muted-foreground">{providerInfo.name}</p>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Remove "${model.displayName || model.modelName}"?`)) {
                      handleDeleteModel(model.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 flex-shrink-0"
                  title={`Remove ${model.displayName || model.modelName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      {models.length > 0 && (
        <div className="text-center text-sm text-main text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <Move3D className="h-4 w-4 inline mr-2" />
          {models.length} model{models.length !== 1 ? 's' : ''} configured. 
          Models are tried in the order shown above during generation.
        </div>
      )}
    </div>
  );
};

export default ModelsManager;
