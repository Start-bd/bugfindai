import { useState, useCallback, useRef } from 'react';
import { Issue } from '@/components/IssueCard';

interface StreamingState {
  isStreaming: boolean;
  streamedContent: string;
  issues: Issue[];
  summary: string;
  error: string | null;
}

export const useStreamingAnalysis = () => {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    streamedContent: '',
    issues: [],
    summary: '',
    error: null,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const parseStreamedJSON = useCallback((content: string): { issues: Issue[]; summary: string } | null => {
    // Try to extract JSON from markdown code blocks or raw JSON
    let jsonContent = content;
    
    // Check for markdown code block
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }
    
    try {
      const parsed = JSON.parse(jsonContent.trim());
      return {
        issues: parsed.issues || [],
        summary: parsed.summary || '',
      };
    } catch {
      return null;
    }
  }, []);

  const analyzeCode = useCallback(async (
    code: string, 
    language: string,
    onProgress?: (content: string) => void
  ) => {
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setState({
      isStreaming: true,
      streamedContent: '',
      issues: [],
      summary: '',
      error: null,
    });

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ code, language, stream: true }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              fullContent += content;
              
              // Update streamed content for visual feedback
              setState(prev => ({
                ...prev,
                streamedContent: fullContent,
              }));
              
              onProgress?.(fullContent);
              
              // Try to parse complete JSON periodically
              const result = parseStreamedJSON(fullContent);
              if (result) {
                setState(prev => ({
                  ...prev,
                  issues: result.issues,
                  summary: result.summary,
                }));
              }
            }
          } catch {
            // Incomplete JSON, continue buffering
          }
        }
      }

      // Final parse attempt
      const finalResult = parseStreamedJSON(fullContent);
      
      setState(prev => ({
        ...prev,
        isStreaming: false,
        issues: finalResult?.issues || prev.issues,
        summary: finalResult?.summary || prev.summary || 'Analysis complete.',
      }));

      return {
        issues: finalResult?.issues || [],
        summary: finalResult?.summary || 'Analysis complete.',
        rawContent: fullContent,
      };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: errorMessage,
      }));
      
      throw error;
    }
  }, [parseStreamedJSON]);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        isStreaming: false,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isStreaming: false,
      streamedContent: '',
      issues: [],
      summary: '',
      error: null,
    });
  }, []);

  return {
    ...state,
    analyzeCode,
    abort,
    reset,
  };
};
