import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  addToQueue, 
  getPendingItems, 
  removeFromQueue, 
  updateItemStatus,
  getQueueCount,
  QueuedAnalysis 
} from '@/lib/offlineQueue';

interface AnalysisResult {
  id: string;
  issues: any[];
  summary: string;
  code: string;
  language: string;
}

export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const { toast } = useToast();

  // Update pending count
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getQueueCount();
      setPendingCount(count);
    } catch (error) {
      console.error('Failed to get queue count:', error);
    }
  }, []);

  // Queue an analysis for later processing
  const queueAnalysis = useCallback(async (code: string, language: string) => {
    try {
      const id = await addToQueue(code, language);
      await refreshPendingCount();
      
      toast({
        title: "Analysis queued",
        description: "Your code will be analyzed when you're back online.",
      });
      
      return id;
    } catch (error) {
      console.error('Failed to queue analysis:', error);
      toast({
        title: "Failed to queue",
        description: "Could not save analysis for later. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [refreshPendingCount, toast]);

  // Process a single queued item
  const processItem = useCallback(async (item: QueuedAnalysis): Promise<AnalysisResult | null> => {
    try {
      await updateItemStatus(item.id, 'processing');
      
      const { data, error } = await supabase.functions.invoke('analyze-code', {
        body: { code: item.code, language: item.language }
      });

      if (error || data?.error) {
        throw new Error(error?.message || data?.error || 'Analysis failed');
      }

      await removeFromQueue(item.id);
      
      return {
        id: item.id,
        issues: data.issues || [],
        summary: data.summary || 'Analysis complete.',
        code: item.code,
        language: item.language,
      };
    } catch (error) {
      console.error(`Failed to process ${item.id}:`, error);
      
      // Retry up to 3 times
      if (item.retryCount < 3) {
        await updateItemStatus(item.id, 'pending', item.retryCount + 1);
      } else {
        await updateItemStatus(item.id, 'failed');
      }
      
      return null;
    }
  }, []);

  // Process all pending items
  const processQueue = useCallback(async () => {
    if (isProcessing || !navigator.onLine) return;
    
    const pending = await getPendingItems();
    if (pending.length === 0) return;
    
    setIsProcessing(true);
    const processedResults: AnalysisResult[] = [];
    
    toast({
      title: "Processing queued analyses",
      description: `Processing ${pending.length} queued analysis${pending.length > 1 ? 'es' : ''}...`,
    });

    for (const item of pending) {
      const result = await processItem(item);
      if (result) {
        processedResults.push(result);
      }
    }
    
    await refreshPendingCount();
    setIsProcessing(false);
    
    if (processedResults.length > 0) {
      setResults(prev => [...prev, ...processedResults]);
      toast({
        title: "Queue processed",
        description: `Successfully completed ${processedResults.length} analysis${processedResults.length > 1 ? 'es' : ''}.`,
      });
    }
    
    return processedResults;
  }, [isProcessing, processItem, refreshPendingCount, toast]);

  // Clear processed results
  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  // Listen for online status and process queue
  useEffect(() => {
    const handleOnline = () => {
      // Small delay to ensure connectivity is stable
      setTimeout(() => {
        processQueue();
      }, 1000);
    };

    window.addEventListener('online', handleOnline);
    
    // Initial count
    refreshPendingCount();
    
    // Process any pending items if we're already online
    if (navigator.onLine) {
      processQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [processQueue, refreshPendingCount]);

  // Listen for messages from service worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        refreshPendingCount();
        processQueue();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [processQueue, refreshPendingCount]);

  return {
    pendingCount,
    isProcessing,
    results,
    queueAnalysis,
    processQueue,
    clearResults,
    refreshPendingCount,
  };
}
