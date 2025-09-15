import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Settings, 
  Cpu, 
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const CUSTOM_MODELS_STORAGE_KEY = 'ai-custom-models';

const ModelManager = ({ providerType, providerName, currentModels = [], onModelsUpdate }) => {
  const [customModels, setCustomModels] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelDescription, setNewModelDescription] = useState('');

  // Load custom models from localStorage on mount
  useEffect(() => {
    loadCustomModels();
  }, [providerType]);

  const loadCustomModels = () => {
    try {
      const stored = localStorage.getItem(CUSTOM_MODELS_STORAGE_KEY);
      if (stored) {
        const allCustomModels = JSON.parse(stored);
        setCustomModels(allCustomModels[providerType] || []);
      }
    } catch (error) {
      console.error('Failed to load custom models:', error);
    }
  };

  const saveCustomModels = (models) => {
    try {
      const stored = localStorage.getItem(CUSTOM_MODELS_STORAGE_KEY);
      const allCustomModels = stored ? JSON.parse(stored) : {};
      
      allCustomModels[providerType] = models;
      localStorage.setItem(CUSTOM_MODELS_STORAGE_KEY, JSON.stringify(allCustomModels));
      
      setCustomModels(models);
      
      // Notify parent component about the update
      if (onModelsUpdate) {
        const combinedModels = [...currentModels, ...models.map(m => m.name)];
        onModelsUpdate(combinedModels);
      }
    } catch (error) {
      console.error('Failed to save custom models:', error);
      toast.error('Failed to save custom model');
    }
  };

  const handleAddModel = () => {
    if (!newModelName.trim()) {
      toast.error('Please enter a model name');
      return;
    }

    // Check if model already exists (in current or custom models)
    const allModelNames = [...currentModels, ...customModels.map(m => m.name)];
    if (allModelNames.includes(newModelName.trim())) {
      toast.error('Model already exists');
      return;
    }

    const newModel = {
      name: newModelName.trim(),
      description: newModelDescription.trim() || 'Custom model',
      isCustom: true,
      addedAt: new Date().toISOString(),
    };

    const updatedModels = [...customModels, newModel];
    saveCustomModels(updatedModels);

    // Reset form
    setNewModelName('');
    setNewModelDescription('');
    setIsDialogOpen(false);

    toast.success(`Added custom model: ${newModel.name}`);
  };

  const handleRemoveModel = (modelName) => {
    const updatedModels = customModels.filter(m => m.name !== modelName);
    saveCustomModels(updatedModels);
    toast.success(`Removed custom model: ${modelName}`);
  };

  const getModelIcon = (model) => {
    if (model.isCustom) {
      return <Cpu className="h-3 w-3" />;
    }
    return <Sparkles className="h-3 w-3" />;
  };

  const totalModels = currentModels.length + customModels.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Available Models</Label>
          <p className="text-xs text-muted-foreground">
            {totalModels} model{totalModels !== 1 ? 's' : ''} available for {providerName}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Model
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Custom Model</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Add a custom model for {providerName}
              </p>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modelName">Model Name *</Label>
                <Input
                  id="modelName"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="e.g., my-custom-model-v2"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the exact model name as used by the API
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="modelDescription">Description (Optional)</Label>
                <Input
                  id="modelDescription"
                  value={newModelDescription}
                  onChange={(e) => setNewModelDescription(e.target.value)}
                  placeholder="Brief description of the model"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddModel}>
                Add Model
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Model List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {/* Default Models */}
        {currentModels.map((modelName) => (
          <div key={modelName} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-theme-primary" />
              <div>
                <span className="text-sm font-medium">{modelName}</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  Official
                </Badge>
              </div>
            </div>
          </div>
        ))}
        
        {/* Custom Models */}
        {customModels.map((model) => (
          <div key={model.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center gap-2">
              <Cpu className="h-3 w-3 text-orange-500" />
              <div>
                <span className="text-sm font-medium">{model.name}</span>
                <Badge variant="outline" className="ml-2 text-xs border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300">
                  Custom
                </Badge>
                {model.description !== 'Custom model' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {model.description}
                  </p>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveModel(model.name)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              title={`Remove ${model.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {/* Empty State */}
        {totalModels === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No models available</p>
            <p className="text-xs">Add a custom model to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelManager;
