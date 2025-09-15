import React, { useState } from 'react';
import {
  Play,
  Pause,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  GripVertical,
  Zap,
  Activity,
  Target,
  ChevronRight,
  BarChart3,
  Timer,
  Layers,
  Sparkles,
  Brain,
  Settings,
  RefreshCw
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import QueueDashboard from "../QueueDashboard";

const SortableItem = ({ id, objective, finalGoal, removeFromQueue, position, estimatedTime }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const [isHovered, setIsHovered] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative 
                  rounded-xl border-2 border-default transition-all duration-300 
                  ${isDragging ? 'border-primary rotate-2' : 'border-border hover:border-primary/50'}`}
    >
      {/* Priority Indicator */}
      <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
      
      {/* Position Badge */}
      <div className="absolute w-6 h-6 bg-primary rounded-full 
                      flex items-center justify-center text-xs font-bold text-muted shadow-lg">
        #{position}
      </div>

      <div className="p-4 text-main">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Drag Handle */}
            <button 
              {...listeners} 
              className={`mt-1 p-2 text-theme-primary rounded-lg transition-all duration-200 hover:bg-muted
                         ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                         active:scale-95`}
              title="Drag to reorder"
            >
              <GripVertical size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-theme-primary flex-shrink-0" />
                <h4 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {objective || "Untitled Roadmap"}
                </h4>
              </div>
              
              {finalGoal && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 pl-5">
                  {finalGoal}
                </p>
              )}
              
              {/* Metadata Row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pl-5">
                <div className="flex items-center gap-1">
                  <Timer size={12} className="text-theme-primary" />
                  <span>Est. {estimatedTime || '2-4h'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity size={12} className="text-theme-primary" />
                  <span>Ready to start</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <div className="relative">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium 
                             border border-default">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Queued
              </span>
            </div>
            
            {/* Remove Button */}
            <button 
              onClick={() => {
                removeFromQueue(id);
                toast.success('Removed from queue');
              }}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted 
                         transition-all duration-200 active:scale-90"
              title="Remove from queue"
            >
              <Trash2 size={16} className="text-red-400 hover:text-red-600 transition duration-200" />
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

const OngoingTab = ({
  generationQueue,
  setGenerationQueue, // New prop to update the queue order
  incompleteRoadmaps,
  isQueuePaused,
  currentlyGenerating,
  pauseQueue,
  resumeQueue,
  removeFromQueue,
  loadRoadmap,
  deleteRoadmap,
  addToQueue,
  clearQueue,
  loading,
  loadingMessage,
  setObjective,
  setFinalGoal,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "queued":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-border text-foreground">
            <Clock size={12} />
            Queued
          </span>
        );
      case "generating":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-border text-foreground animate-pulse">
            <Play size={12} />
            Generating
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-border text-foreground">
            <Pause size={12} />
            Paused
          </span>
        );
      case "incomplete":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-border text-foreground">
            <AlertCircle size={12} />
            Incomplete
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-border text-foreground">
            <AlertCircle size={12} />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  const getProgressBar = (roadmap) => {
    if (!roadmap || !roadmap.phases || roadmap.phases.length === 0) return 0;
    const totalPhases = roadmap.phases.length;
    const completedPhases = roadmap.phases.filter(
      (phase) =>
        phase.goal && phase.goal !== "..." && phase.miniGoals && phase.miniGoals.length > 0,
    ).length;
    return Math.round((completedPhases / totalPhases) * 100);
  };

  const queuedItems = generationQueue.filter(item => item.id !== currentlyGenerating?.id);
  const generatingRoadmapData = currentlyGenerating ? incompleteRoadmaps.find(r => r.id === currentlyGenerating.roadmapId) : null;
  const progress = generatingRoadmapData ? getProgressBar(generatingRoadmapData) : (currentlyGenerating ? 1 : 0);

  const filteredIncomplete = incompleteRoadmaps.filter(
    (roadmap) =>
      roadmap.id !== currentlyGenerating?.roadmapId &&
      !generationQueue.some((item) => item.roadmapId === roadmap.id)
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setGenerationQueue((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Enhanced Header with Animations */}
      <div className="text-center mb-12">
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/20 to-theme-accent/20 rounded-3xl blur-xl animate-pulse" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-theme-primary to-theme-accent rounded-2xl flex items-center justify-center shadow-2xl shadow-theme-primary/30 transform hover:scale-110 transition-all duration-500">
            <Brain className="text-main" size={36} />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
          </div>
        </div>
        
        <h1 className="text-5xl font-bold bg-gradient-to-r from-theme-primary via-theme-accent to-theme-primary bg-clip-text text-main mb-6 animate-gradient">
          AI Generation Hub
        </h1>
        
        <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
          Monitor and manage your AI-powered roadmap generation queue with advanced controls and real-time insights.
        </p>
        
        {/* Floating particles */}
        <div className="absolute top-0 left-1/4 w-2 h-2 bg-theme-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-theme-accent/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-theme-primary/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      </div>

      {/* Queue Dashboard */}
      <QueueDashboard
        generationQueue={generationQueue}
        currentlyGenerating={currentlyGenerating}
        isQueuePaused={isQueuePaused}
        pauseQueue={pauseQueue}
        resumeQueue={resumeQueue}
        clearQueue={clearQueue}
        loading={loading}
        loadingMessage={loadingMessage}
      />

      {currentlyGenerating && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-border p-8">
          
          {/* Header */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 border-2 border-default rounded-xl flex items-center justify-center bg-surface">
                    <Brain className="text-theme-primary animate-pulse" size={24} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-bounce"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-main mb-1">
                    AI Generation Active
                  </h3>
                  <p className="text-theme-primary text-sm font-medium">
                    Creating your personalized roadmap
                  </p>
                </div>
              </div>
              
              {/* Control Panel */}
              <div className="flex items-center gap-3">
                <div className="bg-surface rounded-lg px-3 py-2 shadow-md border border-default">
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <Zap size={14} className="text-warning" />
                    <span>Phase {Math.ceil((progress / 100) * (generatingRoadmapData?.phases?.length || 1))}</span>
                  </div>
                </div>
                
                <button 
                  onClick={pauseQueue} 
                  disabled={!loading} 
                  className="group relative p-3 border-2 border-default hover:border-theme-primary 
                           text-main rounded-xl transition-all duration-300 
                           disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  title="Pause generation"
                >
                  <Pause size={18} className="group-hover:scale-110 transition-transform" />
                  
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Pause Generation
                  </div>
                </button>
              </div>
            </div>
            
            {/* Roadmap Info Card */}
            <div className="bg-surface rounded-xl p-6 shadow-md border border-default mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-theme-primary/20 to-theme-accent/20 rounded-lg flex items-center justify-center">
                    <Target className="text-theme-primary" size={20} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold text-main mb-2 line-clamp-2">
                    {currentlyGenerating.objective || "Untitled Roadmap"}
                  </h4>
                  {currentlyGenerating.finalGoal && (
                    <p className="text-sm text-secondary line-clamp-2 mb-3">
                      <span className="font-medium">Goal:</span> {currentlyGenerating.finalGoal}
                    </p>
                  )}
                  
                  {/* Status and Metadata */}
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <div className="flex items-center gap-1">
                      <Activity size={14} className="text-success" />
                      <span>Generating</span>
                    </div>
                    {generatingRoadmapData?.phases?.length && (
                      <div className="flex items-center gap-1">
                        <Layers size={14} className="text-theme-primary" />
                        <span>{generatingRoadmapData.phases.length} phases</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Live Status Badge */}
                <div className="flex-shrink-0">
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium 
                                bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 
                                text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold">LIVE</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Advanced Progress Bar */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-main">Generation Progress</span>
                <span className="font-bold text-theme-primary">{progress}% Complete</span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-border rounded-full h-6 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-theme-primary via-theme-accent to-theme-primary h-6 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                    style={{ width: `${Math.max(progress, 3)}%` }}
                  >
                    {/* Animated shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                    transform -skew-x-12 animate-shimmer"></div>
                  </div>
                </div>
                
                {/* Progress Steps */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted">
                  <span>Start</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>Complete</span>
                </div>
              </div>
              
              {/* Status Message */}
              <div className="bg-muted dark:bg-theme-primary rounded-lg p-4 mt-6 border border-default">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-theme-primary rounded-full flex items-center justify-center">
                      <Sparkles className="text-white" size={16} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-theme-primary">
                      {loadingMessage || "AI is analyzing your learning objectives and creating a personalized roadmap..."}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-main">
                      <div className="flex items-center gap-1">
                        <Timer size={12} />
                        <span>Est. time remaining: {Math.max(1, Math.ceil((100 - progress) / 10))}m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 size={12} />
                        <span>Processing phase {Math.ceil((progress / 100) * 10)}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Queue Section */}
      <div className="bg-card rounded-2xl shadow-xl border border-default overflow-hidden">
        {/* Queue Header */}
        <div className="p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-theme-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-main">Generation Queue</h3>
                <p className="text-main text-sm font-medium">
                  {queuedItems.length} {queuedItems.length === 1 ? 'roadmap' : 'roadmaps'} waiting to be processed
                </p>
              </div>
            </div>
            
            {/* Queue Status Badge */}
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                isQueuePaused 
                  ? 'bg-yellow-500/30 text-yellow-100 border-yellow-300/50'
                  : 'bg-green-500/30 text-green-100 border-green-300/50'
              }`}>
                {isQueuePaused ? 'PAUSED' : 'PROCESSING'}
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2">
                {isQueuePaused && generationQueue.length > 0 && (
                  <button 
                    onClick={resumeQueue} 
                    className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors text-white shadow-md"
                    title="Resume Queue"
                  >
                    <Play size={16} />
                  </button>
                )}
                <button 
                  onClick={clearQueue} 
                  disabled={generationQueue.length === 0}
                  className="p-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white shadow-md"
                  title="Clear All"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Queue Content */}
        <div className="p-6">
          <ScrollArea className="h-80 custom-scrollbar">
            {queuedItems.length > 0 ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={queuedItems} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {queuedItems.map((item, index) => (
                      <SortableItem 
                        key={item.id} 
                        id={item.id} 
                        objective={item.objective} 
                        finalGoal={item.finalGoal}
                        removeFromQueue={removeFromQueue}
                        position={index + 1}
                        estimatedTime={item.estimatedTime}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl border border-default flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-success" size={32} />
                </div>
                <h4 className="text-lg font-semibold text-main mb-2">
                  Queue is Empty
                </h4>
                <p className="text-main max-w-sm mx-auto">
                  Create new roadmaps to see them appear here for AI generation. Your queue will process them automatically.
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Enhanced Incomplete Roadmaps Section */}
      <div className="bg-card rounded-2xl shadow-xl border border-default border-destructive/30 overflow-hidden">
        {/* Section Header */}
        <div className="bg-destructive p-6 text-destructive-foreground">
          <div className="flex items-center gap-3">
            <div className="text-theme-primary w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-main">Incomplete Roadmaps</h3>
              <p className="text-main text-sm">
                {filteredIncomplete.length} {filteredIncomplete.length === 1 ? 'roadmap' : 'roadmaps'} waiting to be completed
              </p>
            </div>
          </div>
        </div>
        
        {/* Section Content */}
        <div className="p-6">
          {filteredIncomplete.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredIncomplete.map(roadmap => {
                const progressPercent = getProgressBar(roadmap);
                return (
                  <div key={roadmap.id} className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {/* Progress Indicator Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Target size={16} className="text-orange-500 flex-shrink-0" />
                            <h4 className="font-semibold text-main text-sm line-clamp-1">
                              {roadmap.title || roadmap.name || "Untitled Roadmap"}
                            </h4>
                          </div>
                          <p className="text-sm text-secondary line-clamp-2 mb-3">
                            {roadmap.objective}
                          </p>
                        </div>
                        
                        <div className="flex-shrink-0 ml-3">
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium 
                                         bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 
                                         text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-700">
                            <AlertCircle size={12} />
                            Incomplete
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Details */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-secondary">Generation Progress</span>
                          <span className="font-semibold text-warning">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-warning to-error h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        
                        {/* Metadata */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                          <div className="flex items-center gap-1">
                            <Layers size={12} />
                            <span>{roadmap.phases?.length || 0} phases</span>
                          </div>
                          {roadmap.updatedAt && (
                            <div className="flex items-center gap-1">
                              <Timer size={12} />
                              <span>Updated {new Date(roadmap.updatedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Ensure objective and finalGoal are set before adding to queue
                            const objectiveText = roadmap.objective || roadmap.title || "Continue learning roadmap";
                            const finalGoalText = roadmap.finalGoal || "Complete the learning objectives";
                            
                            // Set the form values for generation
                            if (typeof setObjective === 'function') {
                              setObjective(objectiveText);
                            }
                            if (typeof setFinalGoal === 'function') {
                              setFinalGoal(finalGoalText);
                            }
                            
                            loadRoadmap(roadmap.sanitizedName);
                            if (!generationQueue.some(item => item.roadmapId === roadmap.id)) {
                              addToQueue({
                                id: Date.now(),
                                roadmapId: roadmap.id,
                                name: roadmap.name || roadmap.title,
                                objective: objectiveText,
                                finalGoal: finalGoalText,
                                status: "queued",
                                isResume: true,
                                initialRoadmap: {
                                  ...roadmap,
                                  objective: objectiveText,
                                  finalGoal: finalGoalText,
                                  generationState: "in-progress"
                                }
                              });
                            }
                            toast.success('Roadmap added to queue! 🚀');
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium
                                   bg-gradient-to-r from-theme-primary to-theme-accent hover:from-theme-accent hover:to-theme-primary 
                                   text-white transition-all duration-300 hover:shadow-lg hover:shadow-theme-primary/20
                                   active:scale-95"
                        >
                          <Play size={16} />
                          Resume Generation
                        </button>
                        
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this incomplete roadmap?')) {
                              deleteRoadmap(roadmap.sanitizedName);
                              toast.success('Roadmap deleted');
                            }
                          }}
                          disabled={loading}
                          className="p-3 rounded-lg font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 
                                   hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800
                                   transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md
                                   active:scale-95"
                          title="Delete roadmap"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-surface border border-default rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-success" size={32} />
              </div>
              <h4 className="text-lg font-semibold text-main mb-2">
                All Caught Up!
              </h4>
              <p className="text-secondary max-w-sm mx-auto">
                You don't have any incomplete roadmaps. All your roadmaps have been successfully generated or are in the queue.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-theme-primary/10 dark:bg-theme-primary/20 border border-theme-primary/30 rounded-lg p-4 shadow-sm">
        <h4 className="font-semibold text-theme-primary mb-2 flex items-center gap-2">
          <CheckCircle size={18} />
          Queue Management Tips
        </h4>
        <ul className="text-sm text-theme-primary space-y-1">
          <li>• The queue processes roadmaps automatically in order.</li>
          <li>• You can pause/resume the queue at any time.</li>
          <li>• Creating a new roadmap will pause the queue temporarily.</li>
          <li>• Incomplete roadmaps can be resumed by adding them to the queue.</li>
        </ul>
      </div>
    </div>
  );
};

export default OngoingTab;
