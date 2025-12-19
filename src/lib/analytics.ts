// Google Analytics event tracking utility

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js' | 'consent',
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

type EventName = 
  | 'code_scan'
  | 'batch_scan'
  | 'file_upload'
  | 'report_download'
  | 'copy_fix'
  | 'copy_all_fixes'
  | 'github_import'
  | 'scan_cancelled';

interface EventParams {
  code_scan: {
    language: string;
    issues_found: number;
    code_length: number;
  };
  batch_scan: {
    file_count: number;
    total_issues: number;
  };
  file_upload: {
    file_count: number;
    file_types: string;
  };
  report_download: {
    format: 'json' | 'pdf';
    issues_count: number;
  };
  copy_fix: {
    severity: string;
    issue_type: string;
  };
  copy_all_fixes: {
    fixes_count: number;
  };
  github_import: {
    success: boolean;
  };
  scan_cancelled: Record<string, never>;
}

export function trackEvent<T extends EventName>(
  eventName: T,
  params: EventParams[T]
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}
