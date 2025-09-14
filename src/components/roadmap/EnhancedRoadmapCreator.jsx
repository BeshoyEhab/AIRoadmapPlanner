import React, { useState, useCallback } from 'react';
import { useRoadmapGeneration, PROGRESS_STEPS } from '@/hooks/useRoadmapGeneration';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Clock, Target, Book, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
];

const TIME_CONSTRAINTS = [
  { value: '1month', label: '1 Month', hours: 40 },
  { value: '3months', label: '3 Months', hours: 120 },
  { value: '6months', label: '6 Months', hours: 240 },
  { value: '1year', label: '1 Year', hours: 480 },
  { value: 'custom', label: 'Custom' }
];

const EnhancedRoadmapCreator = () => {
  const { hasValidApiKey, saveRoadmap } = useAppContext();
  const { generateEnhancedRoadmap, isGenerating, currentStep, progress } = useRoadmapGeneration();

  const [field, setField] = useState('');
  const [targetLevel, setTargetLevel] = useState('intermediate');
  const [timeConstraint, setTimeConstraint] = useState('3months');
  const [customHours, setCustomHours] = useState('');
  const [existingSkills, setExistingSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = useCallback(() => {
    if (newSkill.trim()) {
      setExistingSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  }, [newSkill]);

  const handleRemoveSkill = useCallback((skillToRemove) => {
    setExistingSkills(prev => prev.filter(skill => skill !== skillToRemove));
  }, []);

  const handleGenerate = async () => {
    if (!field.trim()) {
      toast.error('Please enter a field of study');
      return;
    }

    const hours = timeConstraint === 'custom'
      ? parseInt(customHours)
      : TIME_CONSTRAINTS.find(t => t.value === timeConstraint)?.hours;

    if (!hours || isNaN(hours)) {
      toast.error('Please specify a valid time constraint');
      return;
    }

    const roadmap = await generateEnhancedRoadmap({
      field: field.trim(),
      targetLevel,
      timeConstraint: hours,
      userPreferences: {
        maxItemsPerPhase: 5,
        includeProjects: true,
        includePractice: true
      },
      existingSkills: existingSkills.reduce((acc, skill) => {
        acc[skill] = 'intermediate';
        return acc;
      }, {})
    });

    if (roadmap) {
      await saveRoadmap(roadmap);
      toast.success('Roadmap saved successfully!');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Create Enhanced Roadmap
          </CardTitle>
          <CardDescription>
            Generate a personalized learning roadmap with prerequisites and recommendations
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Field Input */}
          <div className="space-y-2">
            <Label htmlFor="field">Field of Study</Label>
            <Input
              id="field"
              placeholder="e.g., Machine Learning, Web Development"
              value={field}
              onChange={(e) => setField(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Target Level */}
          <div className="space-y-2">
            <Label htmlFor="target-level" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Target Level
            </Label>
            <Select value={targetLevel} onValueChange={setTargetLevel} disabled={isGenerating}>
              <SelectTrigger id="target-level">
                <SelectValue placeholder="Select target level" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Constraint */}
          <div className="space-y-2">
            <Label htmlFor="time-constraint" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Constraint
            </Label>
            <Select value={timeConstraint} onValueChange={setTimeConstraint} disabled={isGenerating}>
              <SelectTrigger id="time-constraint">
                <SelectValue placeholder="Select time constraint" />
              </SelectTrigger>
              <SelectContent>
                {TIME_CONSTRAINTS.map(time => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {timeConstraint === 'custom' && (
              <Input
                type="number"
                placeholder="Enter hours"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                className="mt-2"
                min="1"
                disabled={isGenerating}
              />
            )}
          </div>

          {/* Existing Skills */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              Existing Skills
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill you already know"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                disabled={isGenerating}
              />
              <Button onClick={handleAddSkill} disabled={isGenerating}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {existingSkills.map(skill => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  {skill} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {currentStep || PROGRESS_STEPS[Math.floor(progress / 10) * 10]}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !hasValidApiKey}
            className="w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Roadmap'}
          </Button>
        </CardFooter>
      </Card>

      {!hasValidApiKey && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please add your OpenAI API key in settings to generate roadmaps.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedRoadmapCreator;
