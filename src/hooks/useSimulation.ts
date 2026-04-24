import { useState, useCallback } from 'react';
import { simulateWorkflow } from '../api';
import type { SimulateResponse, WorkflowNode, WorkflowEdge } from '../types';

export function useSimulation() {
  const [result, setResult] = useState<SimulateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);

  const run = useCallback(async (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
    setLoading(true);
    setResult(null);
    setCurrentStep(-1);
    try {
      const response = await simulateWorkflow({ nodes, edges });
      setResult(response);
      // Animate through steps
      if (response.success) {
        for (let i = 0; i < response.steps.length; i++) {
          await new Promise(res => setTimeout(res, 200));
          setCurrentStep(i);
        }
      }
    } catch (err) {
      setResult({
        success: false,
        steps: [],
        errors: ['Simulation failed unexpectedly.'],
        summary: 'Error occurred.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setCurrentStep(-1);
  }, []);

  return { result, loading, currentStep, run, reset };
}
