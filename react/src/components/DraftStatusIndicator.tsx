import React from 'react';
import { Save, Check, AlertCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface DraftStatusIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
  onManualSave: () => void;
  onClearError?: () => void;
  className?: string;
}

export const DraftStatusIndicator: React.FC<DraftStatusIndicatorProps> = ({
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  error,
  onManualSave,
  onClearError,
  className = '',
}) => {
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 flex items-center justify-between">
            <span>{error}</span>
            {onClearError && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearError}
                className="text-red-600 hover:text-red-800 h-auto p-1"
              >
                ×
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <div className="flex items-center space-x-4 text-sm">
          {/* Saving Status */}
          {isSaving && (
            <div className="flex items-center text-blue-600">
              <Save className="w-4 h-4 mr-2 animate-spin" />
              <span>Saving draft...</span>
            </div>
          )}

          {/* Last Saved Status */}
          {lastSaved && !isSaving && (
            <div className="flex items-center text-green-600">
              <Check className="w-4 h-4 mr-2" />
              <span>Saved {formatLastSaved(lastSaved)}</span>
            </div>
          )}

          {/* Unsaved Changes Status */}
          {hasUnsavedChanges && !isSaving && (
            <div className="flex items-center text-amber-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Unsaved changes</span>
            </div>
          )}

          {/* No changes status */}
          {!hasUnsavedChanges && !isSaving && !lastSaved && (
            <div className="flex items-center text-gray-500">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>No changes to save</span>
            </div>
          )}
        </div>

        {/* Manual Save Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onManualSave}
          disabled={isSaving || !hasUnsavedChanges}
          className="border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-1" />
          Save Draft
        </Button>
      </div>

      {/* Auto-save Info */}
      <div className="text-xs text-gray-500 text-center">
        Changes are automatically saved every few seconds
      </div>
    </div>
  );
};

export default DraftStatusIndicator;