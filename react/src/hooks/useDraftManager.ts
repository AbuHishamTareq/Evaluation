/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useRef, useEffect } from 'react';
import api from '../axios';

interface DraftAnswer {
  question_id: string | number; // Allow both string and number for tabular data
  answer: string;
  score: number;
}

interface DraftSaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
  isLoading: boolean;
}

interface UseDraftManagerOptions {
  responseId: string | null;
  autoSaveDelay?: number;
  onSaveSuccess?: (answerCount: number) => void;
  onSaveError?: (error: string) => void;
  onLoadSuccess?: (answerCount: number) => void;
}

interface LocalStorageData {
  [key: string]: any; // question_id -> answer value
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds

export const useDraftManager = ({
  responseId,
  autoSaveDelay = 3000,
  onSaveSuccess,
  onSaveError,
  onLoadSuccess,
}: UseDraftManagerOptions) => {
  const [draftStatus, setDraftStatus] = useState<DraftSaveStatus>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null,
    isLoading: false,
  });

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const localStorageKey = responseId ? `evaluation_draft_${responseId}` : null;
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // ==================== LOCAL STORAGE OPERATIONS ====================

  /**
   * Save form data to localStorage
   */
  const saveToLocalStorage = useCallback((formData: LocalStorageData): boolean => {
    if (!localStorageKey) return false;

    try {
      const dataString = JSON.stringify(formData);
      localStorage.setItem(localStorageKey, dataString);
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }, [localStorageKey]);

  /**
   * Load form data from localStorage
   */
  const loadFromLocalStorage = useCallback((): LocalStorageData => {
    if (!localStorageKey) return {};

    try {
      const dataString = localStorage.getItem(localStorageKey);
      if (dataString) {
        return JSON.parse(dataString);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return {};
  }, [localStorageKey]);

  /**
   * Clear localStorage for this response
   */
  const clearLocalStorage = useCallback((): boolean => {
    if (!localStorageKey) return false;

    try {
      localStorage.removeItem(localStorageKey);
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }, [localStorageKey]);

  // ==================== SERVER OPERATIONS ====================

  /**
   * Convert form data to server format (DraftAnswer[])
   */
  const convertFormDataToAnswers = useCallback((formData: LocalStorageData): DraftAnswer[] => {
    const answers: DraftAnswer[] = [];
    
    console.log('🔍 DEBUG: Converting form data to answers:', formData);
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        console.log(`🔍 DEBUG: Processing key: "${key}", value: "${value}"`);
        
        // For tabular data, the key format is already "medicationId_fieldId"
        // For regular questions, the key is just the question ID
        answers.push({
          question_id: key, // Keep the key as-is (whether numeric string or composite)
          answer: String(value),
          score: 0,
        });
      }
    });

    console.log('🔍 DEBUG: Final answers array:', answers);
    console.log('🔍 DEBUG: Question IDs being sent:', answers.map(a => a.question_id));
    
    return answers;
  }, []);

  /**
   * Convert server answers to form data format
   */
  const convertAnswersToFormData = useCallback((answers: DraftAnswer[]): LocalStorageData => {
    const formData: LocalStorageData = {};
    
    answers.forEach((answer) => {
      formData[answer.question_id.toString()] = answer.answer;
    });

    return formData;
  }, []);

  /**
   * Load draft data from server (with proper error handling and rate limiting prevention)
   */
  const loadFromServer = useCallback(async (): Promise<LocalStorageData> => {
    if (!responseId || isLoadingRef.current) return {};

    isLoadingRef.current = true;

    try {
      const response = await api.get(`/api/responses/${responseId}/draft`);
      const draftAnswers = response.data.draft_answers || [];
      
      const formData = convertAnswersToFormData(draftAnswers);
      
      if (draftAnswers.length > 0) {
        onLoadSuccess?.(draftAnswers.length);
      }

      return formData;
    } catch (error: any) {
      console.error('Failed to load draft from server:', error);
      // Don't set error state for draft loading failures to avoid UI disruption
      return {};
    } finally {
      isLoadingRef.current = false;
    }
  }, [responseId, convertAnswersToFormData, onLoadSuccess]);

  /**
   * Save draft data to server with retry mechanism
   */
  const saveToServer = useCallback(async (formData: LocalStorageData): Promise<boolean> => {
    if (!responseId) return false;

    const answers = convertFormDataToAnswers(formData);
    if (answers.length === 0) return true; // Nothing to save

    console.log('🚀 DEBUG: About to send to server:', { answers });

    for (let i = 0; i <= MAX_RETRIES; i++) {
      try {
        await api.post(`/api/responses/${responseId}/draft`, { answers });
        console.log('✅ DEBUG: Successfully saved to server');
        return true;
      } catch (error: any) {
        console.error(`❌ DEBUG: Failed to save draft to server (attempt ${i + 1}/${MAX_RETRIES + 1}):`, error);
        console.error('❌ DEBUG: Error response:', error.response?.data);
        
        if (error.response && error.response.status === 429 && i < MAX_RETRIES) {
          // Rate limit exceeded, wait and retry
          const retryAfter = error.response.headers['retry-after'] || RETRY_DELAY_MS / 1000;
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        } else {
          // Other error or max retries reached
          throw new Error(error.response?.data?.error || 'Failed to save draft to server');
        }
      }
    }
    return false; // Should not reach here
  }, [responseId, convertFormDataToAnswers]);

  // ==================== COMBINED OPERATIONS ====================

  /**
   * Load draft data (ONE TIME ONLY to prevent infinite loops)
   */
  const loadDraft = useCallback(async (): Promise<LocalStorageData> => {
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current || hasLoadedRef.current) {
      return loadFromLocalStorage();
    }

    hasLoadedRef.current = true;
    setDraftStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Load from localStorage first (immediate)
      const localData = loadFromLocalStorage();
      
      // Load from server (for cross-device sync) - but only once
      const serverData = await loadFromServer();
      
      // Merge strategy: server data takes precedence for conflicts
      const mergedData = { ...localData, ...serverData };
      
      // Update localStorage with merged data if server had data
      if (Object.keys(serverData).length > 0) {
        saveToLocalStorage(mergedData);
      }

      lastSavedDataRef.current = JSON.stringify(mergedData);
      
      setDraftStatus(prev => ({
        ...prev,
        isLoading: false,
        hasUnsavedChanges: false,
        lastSaved: Object.keys(mergedData).length > 0 ? new Date() : null,
      }));

      return mergedData;
    } catch (error) {
      setDraftStatus(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load draft data',
      }));
      
      // Fallback to localStorage only
      return loadFromLocalStorage();
    }
  }, [loadFromLocalStorage, loadFromServer, saveToLocalStorage]);

  /**
   * Save draft data (both local and server)
   */
  const saveDraft = useCallback(async (
    formData: LocalStorageData,
    showFeedback = false
  ): Promise<boolean> => {
    if (!responseId) return false;

    // Check if there are actually changes to save
    const currentDataString = JSON.stringify(formData);
    if (currentDataString === lastSavedDataRef.current) return true;

    setDraftStatus(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      // Save to localStorage immediately (fast)
      const localSaveSuccess = saveToLocalStorage(formData);
      
      // Save to server (slower, but necessary for cross-device sync)
      await saveToServer(formData);
      
      setDraftStatus(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        error: null,
      }));

      lastSavedDataRef.current = currentDataString;

      if (showFeedback) {
        const answerCount = Object.keys(formData).filter(key => 
          formData[key] !== undefined && formData[key] !== '' && formData[key] !== null
        ).length;
        onSaveSuccess?.(answerCount);
      }

      return localSaveSuccess;
    } catch (error: any) {
      console.error('Failed to save draft:', error);
      const errorMessage = error.message || 'Failed to save draft';
      
      setDraftStatus(prev => ({
        ...prev,
        isSaving: false,
        error: errorMessage,
      }));

      if (showFeedback) {
        onSaveError?.(errorMessage);
      }

      return false;
    }
  }, [responseId, saveToLocalStorage, saveToServer, onSaveSuccess, onSaveError]);

  /**
   * Auto-save with debouncing (FIXED to prevent infinite loops)
   */
  const scheduleAutoSave = useCallback((formData: LocalStorageData) => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Check if there are actual changes
    const currentDataString = JSON.stringify(formData);
    const hasChanges = currentDataString !== lastSavedDataRef.current;
    
    if (hasChanges) {
      // Update status immediately but don't trigger re-renders
      setDraftStatus(prev => ({ ...prev, hasUnsavedChanges: true }));

      // Schedule auto-save
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveDraft(formData);
      }, autoSaveDelay);
    }
  }, [saveDraft, autoSaveDelay]);

  /**
   * Manual save draft (immediate)
   */
  const saveNow = useCallback((formData: LocalStorageData) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    return saveDraft(formData, true);
  }, [saveDraft]);

  /**
   * Clear all draft data (both local and server)
   */
  const clearDraft = useCallback(async (): Promise<boolean> => {
    try {
      // Clear localStorage
      const localClearSuccess = clearLocalStorage();
      
      // Reset refs
      lastSavedDataRef.current = '';
      hasLoadedRef.current = false;
      
      setDraftStatus(prev => ({
        ...prev,
        hasUnsavedChanges: false,
        lastSaved: null,
        error: null,
      }));
      
      return localClearSuccess;
    } catch (error) {
      console.error('Failed to clear draft:', error);
      return false;
    }
  }, [clearLocalStorage]);

  // ==================== LIFECYCLE HOOKS ====================

  // Clear auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (draftStatus.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        
        // Try to save to localStorage one last time (synchronous)
        const currentFormData = loadFromLocalStorage();
        if (Object.keys(currentFormData).length > 0) {
          saveToLocalStorage(currentFormData);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [draftStatus.hasUnsavedChanges, loadFromLocalStorage, saveToLocalStorage]);

  return {
    draftStatus,
    loadDraft,
    saveDraft,
    scheduleAutoSave,
    saveNow,
    clearDraft,
    clearError: () => setDraftStatus(prev => ({ ...prev, error: null })),
    
    // Expose individual operations for advanced use cases
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
  };
};
