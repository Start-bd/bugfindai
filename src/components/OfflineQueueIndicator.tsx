import { Clock, Loader2, CheckCircle } from "lucide-react";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const OfflineQueueIndicator = () => {
  const { pendingCount, isProcessing, results, processQueue, clearResults } = useOfflineQueue();

  if (pendingCount === 0 && results.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-16 right-4 z-50 gap-2 shadow-lg animate-in slide-in-from-right-4 fade-in duration-300"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : results.length > 0 ? (
            <CheckCircle className="h-4 w-4 text-primary" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
          <span>
            {isProcessing
              ? "Processing..."
              : results.length > 0
              ? `${results.length} completed`
              : `${pendingCount} queued`}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Offline Queue</DialogTitle>
          <DialogDescription>
            Code analyses queued while offline will be processed when you're back online.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {pendingCount > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{pendingCount} pending analysis{pendingCount > 1 ? 'es' : ''}</span>
              </div>
              {navigator.onLine && (
                <Button size="sm" variant="secondary" onClick={processQueue} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Process Now"
                  )}
                </Button>
              )}
            </div>
          )}
          
          {results.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Completed Analyses</h4>
                <Button size="sm" variant="ghost" onClick={clearResults}>
                  Clear
                </Button>
              </div>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 bg-muted/50 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {result.language || "Unknown"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {result.issues.length} issue{result.issues.length !== 1 ? 's' : ''} found
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {result.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {!navigator.onLine && pendingCount > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              You're currently offline. Analyses will be processed when connectivity is restored.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfflineQueueIndicator;
