import { useState, useEffect } from 'react';
import { fetchAutomations } from '../api';
import type { AutomationAction } from '../types';

export function useAutomations() {
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAutomations()
      .then(setAutomations)
      .catch(() => setError('Failed to load automations'))
      .finally(() => setLoading(false));
  }, []);

  return { automations, loading, error };
}
