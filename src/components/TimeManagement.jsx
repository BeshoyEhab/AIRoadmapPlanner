import React, { useState } from 'react';
import { Clock, Calendar, AlertCircle, Settings, Save } from 'lucide-react';

const TimeManagement = ({ phase, phaseIndex, onUpdatePhase }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPhase, setEditedPhase] = useState(phase);

  const handleSave = () => {
    onUpdatePhase(phaseIndex, editedPhase);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPhase(phase);
    setIsEditing(false);
  };

  const addBufferTime = (days) => {
    const updated = { ...editedPhase };
    const currentDuration = updated.duration;
    const bufferText = days > 0 ? ` (+${days} days buffer)` : '';
    updated.duration = currentDuration.replace(/ \(\+\d+ days buffer\)/, '') + bufferText;
    updated.bufferDays = days;
    setEditedPhase(updated);
  };

  const updateDeadlineType = (type) => {
    const updated = { ...editedPhase };
    updated.deadlineType = type; // 'soft' or 'hard'
    setEditedPhase(updated);
  };

  const updateMiniGoalTime = (miniGoalId, newTime) => {
    const updated = { ...editedPhase };
    const miniGoal = updated.miniGoals.find(mg => mg.id === miniGoalId);
    if (miniGoal) {
      miniGoal.estimatedTime = newTime;
      miniGoal.isFlexible = true;
    }
    setEditedPhase(updated);
  };

  if (!isEditing) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-medium text-gray-800 flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            Time Management
          </h5>
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
          >
            <Settings size={14} />
            Adjust
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Duration:</span>
            <div className="font-medium">{phase.duration}</div>
          </div>
          <div>
            <span className="text-gray-600">Deadline Type:</span>
            <div className="font-medium">
              <span className={`px-2 py-1 rounded-full text-xs ${
                phase.deadlineType === 'hard' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {phase.deadlineType || 'Flexible'}
              </span>
            </div>
          </div>
        </div>
        
        {phase.bufferDays && (
          <div className="mt-2 text-sm text-blue-600">
            <AlertCircle size={14} className="inline mr-1" />
            {phase.bufferDays} days buffer time included
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-medium text-gray-800 flex items-center gap-2">
          <Settings size={16} className="text-blue-600" />
          Adjust Time Settings
        </h5>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Duration Adjustment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phase Duration
          </label>
          <input
            type="text"
            value={editedPhase.duration}
            onChange={(e) => setEditedPhase({ ...editedPhase, duration: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="e.g., 4-6 weeks"
          />
        </div>

        {/* Buffer Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buffer Time
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => addBufferTime(0)}
              className={`px-3 py-1 rounded text-sm ${
                (editedPhase.bufferDays || 0) === 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              No Buffer
            </button>
            <button
              onClick={() => addBufferTime(3)}
              className={`px-3 py-1 rounded text-sm ${
                editedPhase.bufferDays === 3
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              3 Days
            </button>
            <button
              onClick={() => addBufferTime(7)}
              className={`px-3 py-1 rounded text-sm ${
                editedPhase.bufferDays === 7
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              1 Week
            </button>
            <button
              onClick={() => addBufferTime(14)}
              className={`px-3 py-1 rounded text-sm ${
                editedPhase.bufferDays === 14
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              2 Weeks
            </button>
          </div>
        </div>

        {/* Deadline Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deadline Type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => updateDeadlineType('flexible')}
              className={`px-3 py-1 rounded text-sm ${
                editedPhase.deadlineType === 'flexible'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Flexible
            </button>
            <button
              onClick={() => updateDeadlineType('soft')}
              className={`px-3 py-1 rounded text-sm ${
                editedPhase.deadlineType === 'soft'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Soft Deadline
            </button>
            <button
              onClick={() => updateDeadlineType('hard')}
              className={`px-3 py-1 rounded text-sm ${
                editedPhase.deadlineType === 'hard'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Hard Deadline
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {editedPhase.deadlineType === 'hard' && 'Fixed deadline - cannot be extended'}
            {editedPhase.deadlineType === 'soft' && 'Preferred deadline - can be extended if needed'}
            {(editedPhase.deadlineType === 'flexible' || !editedPhase.deadlineType) && 'Flexible timing - adjust as needed'}
          </p>
        </div>

        {/* Mini-Goal Time Adjustments */}
        {editedPhase.miniGoals && editedPhase.miniGoals.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mini-Goal Time Estimates
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {editedPhase.miniGoals.map((miniGoal) => (
                <div key={miniGoal.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate">{miniGoal.title}</span>
                  <input
                    type="text"
                    value={miniGoal.estimatedTime}
                    onChange={(e) => updateMiniGoalTime(miniGoal.id, e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
                    placeholder="3-5 days"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Tracking */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Actual Time Spent
          </label>
          <input
            type="text"
            value={editedPhase.actualDuration || ''}
            onChange={(e) => setEditedPhase({ ...editedPhase, actualDuration: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder="e.g., 3 weeks (leave empty if not started)"
          />
        </div>
      </div>
    </div>
  );
};

export default TimeManagement;

