import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Download,
  Upload,
  Key,
  Database,
  Shield,
  Copy,
  Check,
  Info,
  AlertCircle
} from 'lucide-react';
import * as browserStorage from '@/lib/storage/browserStorage';

const BackupRestore = ({ onDataImported }) => {
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [backupKey, setBackupKey] = useState('');
  const [restoreData, setRestoreData] = useState('');
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleBackup = () => {
    try {
      const backupData = browserStorage.exportUserData();
      setBackupKey(backupData.backupKey);
      
      // Create downloadable file
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-roadmap-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      toast.success('Backup created and downloaded!');
    } catch (error) {
      console.error('Backup error:', error);
      toast.error('Failed to create backup: ' + error.message);
    }
  };

  const handleRestore = async () => {
    if (!restoreData.trim()) {
      toast.error('Please paste your backup data');
      return;
    }

    setImporting(true);
    try {
      const backupData = JSON.parse(restoreData);
      const importedCount = browserStorage.importUserData(backupData);
      
      toast.success(`Successfully restored ${importedCount} roadmaps!`);
      
      if (onDataImported) {
        onDataImported();
      }
      
      setRestoreData('');
      setIsRestoreOpen(false);
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore data: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const copyBackupKey = () => {
    if (backupKey) {
      navigator.clipboard.writeText(backupKey);
      setCopied(true);
      toast.success('Backup key copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStats = () => {
    return browserStorage.getStorageStats();
  };

  const stats = getStats();

  return (
    <div className="space-y-4">
      {/* Storage Stats */}
      <div className="bg-theme-primary/10 dark:bg-theme-primary/20 border border-theme-primary/30 rounded-lg p-4">
        <h4 className="font-semibold text-theme-primary mb-3 flex items-center gap-2">
          <Database size={18} />
          Your Data
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Roadmaps:</span>
            <span className="ml-2 font-medium text-card-foreground">{stats?.roadmapCount || 0}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Completed:</span>
            <span className="ml-2 font-medium text-success">{stats?.completedRoadmaps || 0}</span>
          </div>
          <div>
            <span className="text-muted-foreground">In Progress:</span>
            <span className="ml-2 font-medium text-info">{stats?.inProgressRoadmaps || 0}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Storage Used:</span>
            <span className="ml-2 font-medium text-card-foreground">
              {stats?.storageSize ? (stats.storageSize / 1024).toFixed(1) + ' KB' : '0 KB'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Backup Dialog */}
        <Dialog open={isBackupOpen} onOpenChange={setIsBackupOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-medium h-auto p-4 flex flex-col items-center gap-2">
              <Download size={20} />
              <div className="text-center">
                <div className="font-semibold">Backup Data</div>
                <div className="text-xs opacity-90">Export your roadmaps</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="text-green-600" size={20} />
                Backup Your Roadmaps
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="text-blue-600 mt-0.5" size={16} />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Secure Backup
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Your roadmaps will be exported as a JSON file with a unique backup key. 
                      Keep this file safe - it contains all your learning plans!
                    </p>
                  </div>
                </div>
              </div>

              {backupKey && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Your Backup Key:</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
                    <span className="flex-1 break-all">{backupKey}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyBackupKey}
                      className="h-8 w-8 p-0"
                    >
                      {copied ? (
                        <Check className="text-green-600" size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 This key helps verify your backup integrity
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBackupOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBackup} className="bg-green-600 hover:bg-green-700">
                <Download size={16} className="mr-2" />
                Create Backup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Restore Dialog */}
        <Dialog open={isRestoreOpen} onOpenChange={setIsRestoreOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-auto p-4 flex flex-col items-center gap-2">
              <Upload size={20} />
              <div className="text-center">
                <div className="font-semibold">Restore Data</div>
                <div className="text-xs opacity-90">Import your roadmaps</div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="text-blue-600" size={20} />
                Restore Your Roadmaps
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-orange-600 mt-0.5" size={16} />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                      Import Warning
                    </p>
                    <p className="text-orange-700 dark:text-orange-300">
                      This will replace your current roadmaps with the backed up data. 
                      Make sure to backup your current data first if needed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restore-data">Paste Your Backup Data:</Label>
                <textarea
                  id="restore-data"
                  value={restoreData}
                  onChange={(e) => setRestoreData(e.target.value)}
                  placeholder="Paste the JSON backup data here..."
                  className="w-full h-32 p-3 border border-border rounded-lg bg-background font-mono text-sm resize-none focus:ring-2 focus:ring-theme-primary focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground">
                  Paste the contents of your backup JSON file here
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsRestoreOpen(false);
                  setRestoreData('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRestore} 
                disabled={importing || !restoreData.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {importing ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Restore Data
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>🔒 All data is stored locally in your browser</p>
        <p>💾 Use backup/restore to transfer between devices</p>
      </div>
    </div>
  );
};

export default BackupRestore;
