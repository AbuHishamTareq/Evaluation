/* eslint-disable react-hooks/exhaustive-deps */
import { useLocation } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import api from '../axios';

export const useResponseId = (section: string | undefined, evalId: string | undefined) => {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [responseId, setResponseId] = useState<string | null>(searchParams.get('responseId'));

  useEffect(() => {
    if (responseId) return;
    if (!section || !evalId) return;

    const init = async () => {
      try {
        const res = await api.post('/api/evaluations/centerSurveyResponse/create', {
          center: section,
          evaluation: evalId,
        });
        const id = res.data?.response?.id;
        if (id) {
          setResponseId(String(id));
          const newUrl = `${location.pathname}?responseId=${encodeURIComponent(String(id))}`;
          window.history.replaceState(null, '', newUrl);
        }
      } catch {
        // error handling optional
      }
    };
    void init();
  }, [responseId, section, evalId]);

  return responseId;
};
