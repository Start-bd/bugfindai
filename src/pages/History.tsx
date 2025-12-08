import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Code, AlertTriangle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Issue } from "@/components/IssueCard";

interface ScanRecord {
  id: string;
  code: string;
  language: string | null;
  issues: Issue[];
  summary: string | null;
  created_at: string;
}

const History = () => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchScans();
    }
  }, [user]);

  const fetchScans = async () => {
    try {
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to handle the JSON issues field
      const typedScans: ScanRecord[] = (data || []).map(scan => ({
        ...scan,
        issues: (scan.issues as unknown as Issue[]) || []
      }));
      
      setScans(typedScans);
    } catch (error) {
      console.error("Failed to fetch scans:", error);
      toast({
        title: "Error",
        description: "Failed to load scan history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteScan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scan_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setScans(scans.filter(s => s.id !== id));
      toast({
        title: "Deleted",
        description: "Scan removed from history.",
      });
    } catch (error) {
      console.error("Failed to delete scan:", error);
      toast({
        title: "Error",
        description: "Failed to delete scan.",
        variant: "destructive",
      });
    }
  };

  const getSeverityCounts = (issues: Issue[]) => {
    return {
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length,
    };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-8 px-6">
          <div className="container mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-8 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Scan <span className="gradient-text">History</span>
            </h1>
            <p className="text-muted-foreground">
              View your previous code scans and their results.
            </p>
          </div>

          {scans.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No scans yet</h3>
              <p className="text-muted-foreground mb-4">
                Start scanning code to see your history here.
              </p>
              <Button onClick={() => navigate('/scan')} variant="hero">
                Start Scanning
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {scans.map((scan) => {
                const counts = getSeverityCounts(scan.issues);
                return (
                  <div
                    key={scan.id}
                    className="glass rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {scan.language || 'Unknown'}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(scan.created_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {scan.summary || 'No summary available'}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {scan.issues.length} issue{scan.issues.length !== 1 ? 's' : ''}
                          </span>
                          {counts.critical > 0 && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                              {counts.critical} critical
                            </Badge>
                          )}
                          {counts.high > 0 && (
                            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                              {counts.high} high
                            </Badge>
                          )}
                          {counts.medium > 0 && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                              {counts.medium} medium
                            </Badge>
                          )}
                          {counts.low > 0 && (
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                              {counts.low} low
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => deleteScan(scan.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
