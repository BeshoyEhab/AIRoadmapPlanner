import React from 'react';

const SavedPlansTab = ({ savedTimeplans, loadRoadmap, deleteRoadmap, setActiveTab, isDeleteDialogOpen, setIsDeleteDialogOpen, handleDeleteConfirm }) => (
  <div className="p-4 sm:p-6 lg:p-8">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Saved Timeplans</h2>
    {savedTimeplans.length > 0 ? (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {savedTimeplans.map(tp => (
          <div key={tp.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{tp.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tp.phases.length} phases
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  if (loadRoadmap(tp.id)) {
                    setActiveTab('view');
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
              >
                Load
              </button>
              <button
                onClick={() => {
                  deleteRoadmap(tp.id);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center text-gray-500 dark:text-gray-400">
        <p>You haven't saved any timeplans yet.</p>
      </div>
    )}
  </div>
);

export default SavedPlansTab;
