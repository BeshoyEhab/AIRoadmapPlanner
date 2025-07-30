import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const AdaptiveScheduling = ({ roadmap, onUpdateRoadmap }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (roadmap && roadmap.phases) {
      generateSuggestions();
    }
  }, [roadmap]);

  const generateSuggestions = () => {
    const newSuggestions = [];
    
    roadmap.phases.forEach((phase, index) => {
      // Check if phase is behind schedule
      if (phase.actualDuration && phase.duration) {
        const actualWeeks = parseTimeToWeeks(phase.actualDuration);
        const plannedWeeks = parseTimeToWeeks(phase.duration);
        
        if (actualWeeks > plannedWeeks) {
          newSuggestions.push({
            type: 'behind_schedule',
            phaseIndex: index,
            title: `Phase ${phase.phaseNumber} is behind schedule`,
            description: `Taking ${phase.actualDuration} instead of planned ${phase.duration}`,
            impact: 'high',
            actions: [
              'Extend remaining phases by 1-2 weeks each',
              'Focus on high-priority mini-goals only',
              'Consider parallel learning for some topics'
            ]
          });
        }
      }

      // Check mini-goal completion rate
      if (phase.miniGoals) {
        const completedCount = phase.miniGoals.filter(mg => mg.completed).length;
        const totalCount = phase.miniGoals.length;
        const completionRate = totalCount > 0 ? completedCount / totalCount : 0;
        
        if (completionRate < 0.3 && totalCount > 0) {
          newSuggestions.push({
            type: 'low_progress',
            phaseIndex: index,
            title: `Low progress in Phase ${phase.phaseNumber}`,
            description: `Only ${Math.round(completionRate * 100)}% of mini-goals completed`,
            impact: 'medium',
            actions: [
              'Break down complex mini-goals into smaller tasks',
              'Allocate more time to this phase',
              'Consider getting help or mentoring'
            ]
          });
        }
      }

      // Check for overloaded phases
      if (phase.miniGoals && phase.miniGoals.length > 8) {
        newSuggestions.push({
          type: 'overloaded',
          phaseIndex: index,
          title: `Phase ${phase.phaseNumber} may be overloaded`,
          description: `${phase.miniGoals.length} mini-goals might be too many for the timeframe`,
          impact: 'medium',
          actions: [
            'Split phase into two smaller phases',
            'Move some mini-goals to later phases',
            'Extend phase duration'
          ]
        });
      }
    });

    // Check overall timeline
    const totalPhases = roadmap.phases.length;
    const completedPhases = roadmap.phases.filter(phase => 
      phase.miniGoals && phase.miniGoals.every(mg => mg.completed)
    ).length;
    
    if (completedPhases > 0) {
      const progressRate = completedPhases / totalPhases;
      const estimatedTotalTime = parseTimeToWeeks(roadmap.totalDuration);
      
      if (progressRate < 0.2 && estimatedTotalTime > 52) { // Less than 20% progress on long roadmaps
        newSuggestions.push({
          type: 'timeline_adjustment',
          phaseIndex: -1,
          title: 'Consider timeline adjustment',
          description: 'Based on current progress, the original timeline might be too ambitious',
          impact: 'high',
          actions: [
            'Extend overall timeline by 20-30%',
            'Focus on core skills first',
            'Consider intensive learning periods'
          ]
        });
      }
    }

    setSuggestions(newSuggestions);
  };

  const parseTimeToWeeks = (timeString) => {
    if (!timeString) return 0;
    
    const lowerTime = timeString.toLowerCase();
    if (lowerTime.includes('week')) {
      const match = lowerTime.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    } else if (lowerTime.includes('month')) {
      const match = lowerTime.match(/(\d+)/);
      return match ? parseInt(match[1]) * 4 : 0;
    } else if (lowerTime.includes('day')) {
      const match = lowerTime.match(/(\d+)/);
      return match ? Math.ceil(parseInt(match[1]) / 7) : 0;
    }
    return 0;
  };

  const applySuggestion = (suggestion, actionIndex) => {
    const updatedRoadmap = { ...roadmap };
    
    switch (suggestion.type) {
      case 'behind_schedule':
        // Extend remaining phases
        updatedRoadmap.phases.forEach((phase, index) => {
          if (index > suggestion.phaseIndex) {
            const currentWeeks = parseTimeToWeeks(phase.duration);
            const newDuration = `${currentWeeks + 1}-${currentWeeks + 2} weeks`;
            phase.duration = newDuration;
            phase.adjustedForDelay = true;
          }
        });
        break;
        
      case 'low_progress':
        // Extend current phase
        const phase = updatedRoadmap.phases[suggestion.phaseIndex];
        const currentWeeks = parseTimeToWeeks(phase.duration);
        phase.duration = `${currentWeeks + 2}-${currentWeeks + 3} weeks`;
        phase.extendedForProgress = true;
        break;
        
      case 'overloaded':
        // Split phase (simplified - just extend duration)
        const overloadedPhase = updatedRoadmap.phases[suggestion.phaseIndex];
        const weeks = parseTimeToWeeks(overloadedPhase.duration);
        overloadedPhase.duration = `${weeks + 2}-${weeks + 4} weeks`;
        overloadedPhase.splitForManageability = true;
        break;
        
      case 'timeline_adjustment':
        // Extend overall timeline
        const currentTotal = parseTimeToWeeks(updatedRoadmap.totalDuration);
        const newTotal = Math.ceil(currentTotal * 1.25);
        updatedRoadmap.totalDuration = `${Math.floor(newTotal / 52)} years ${newTotal % 52} weeks`;
        updatedRoadmap.timelineAdjusted = true;
        break;
    }
    
    onUpdateRoadmap(updatedRoadmap);
    
    // Remove applied suggestion
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const dismissSuggestion = (suggestion) => {
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'high': return <AlertTriangle size={16} />;
      case 'medium': return <Clock size={16} />;
      case 'low': return <CheckCircle size={16} />;
      default: return <TrendingUp size={16} />;
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle size={16} />
          <span className="font-medium">Timeline looks good!</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          No scheduling adjustments needed at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-medium text-gray-800 flex items-center gap-2">
          <Calendar size={16} className="text-purple-600" />
          Adaptive Scheduling
        </h5>
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-purple-600 hover:text-purple-800 text-sm"
        >
          {showSuggestions ? 'Hide' : 'Show'} Suggestions ({suggestions.length})
        </button>
      </div>

      {showSuggestions && (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(suggestion.impact)}`}>
                    {getImpactIcon(suggestion.impact)}
                    {suggestion.impact}
                  </span>
                  <h6 className="font-medium text-gray-800">{suggestion.title}</h6>
                </div>
                <button
                  onClick={() => dismissSuggestion(suggestion)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ×
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Suggested actions:</p>
                {suggestion.actions.map((action, actionIndex) => (
                  <div key={actionIndex} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">• {action}</span>
                    <button
                      onClick={() => applySuggestion(suggestion, actionIndex)}
                      className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdaptiveScheduling;

