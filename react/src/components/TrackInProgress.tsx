/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import api from '../axios';

export const TrackInProgress = ({ values, responseId }: { values: Record<string, any>; responseId: string | null }) => {
  const firstTriggered = useRef(false);
  useEffect(() => {
    if (firstTriggered.current || !responseId) return;

    const hasAnyAnswer = Object.values(values).some((v) => v !== '' && v !== null && v !== undefined);
    if (!hasAnyAnswer) return;

    firstTriggered.current = true;

    const markInProgress = async () => {
      try {
        await api.patch(`/api/evaluations/${responseId}`, { status: 'in-progress' });
      } catch {
        console.warn('Failed to mark in-progress');
      }
    };
    void markInProgress();
  }, [values, responseId]);

  return null;
};
