/**
 * Hook for managing analysis result history
 * Stores results in browser localStorage and provides methods to manage history
 */

import { useEffect, useState } from 'react';

export interface HistoryItem {
  id: string;
  timestamp: number;
  jobRole: string;
  company: string;
  atsScore?: number;
  overallScore?: number;
  resumePreview: string; // First 100 chars of resume
  fullData: Record<string, unknown>; // Full analysis result
}

const STORAGE_KEY = 'hiring-compass-history';
const MAX_HISTORY_ITEMS = 50;

/**
 * Hook to manage analysis history
 */
export const useResultHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('[History] Failed to load history:', error);
    }
    setIsLoaded(true);
  }, []);

  /**
   * Save a new analysis result to history
   */
  const saveToHistory = (
    jobRole: string,
    company: string,
    resumeText: string,
    analysisResult?: Record<string, unknown>
  ) => {
    try {
      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        jobRole,
        company,
        atsScore: (analysisResult?.atsScore as number | undefined),
        overallScore: (analysisResult?.overallScore as number | undefined),
        resumePreview: resumeText.substring(0, 100),
        fullData: analysisResult || {},
      };

      setHistory((prevHistory) => {
        const updated = [newItem, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          console.log('[History] Saved analysis result:', newItem.id);
        } catch (storageError) {
          console.error('[History] Failed to save to localStorage:', storageError);
        }
        return updated;
      });

      return newItem;
    } catch (error) {
      console.error('[History] Failed to save result:', error);
      return null;
    }
  };

  /**
   * Get a single history item by ID
   */
  const getHistoryItem = (id: string): HistoryItem | undefined => {
    return history.find((item) => item.id === id);
  };

  /**
   * Delete a history item
   */
  const deleteHistoryItem = (id: string) => {
    try {
      setHistory((prevHistory) => {
        const updated = prevHistory.filter((item) => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        console.log('[History] Deleted item:', id);
        return updated;
      });
      return true;
    } catch (error) {
      console.error('[History] Failed to delete item:', error);
      return false;
    }
  };

  /**
   * Clear all history
   */
  const clearAllHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
      console.log('[History] Cleared all history');
      return true;
    } catch (error) {
      console.error('[History] Failed to clear history:', error);
      return false;
    }
  };

  /**
   * Get statistics about history
   */
  const getStatistics = () => {
    return {
      totalItems: history.length,
      oldestAnalysis: history.length > 0 ? history[history.length - 1].timestamp : undefined,
      newestAnalysis: history.length > 0 ? history[0].timestamp : undefined,
      averageAtsScore:
        history.length > 0
          ? Math.round(
              history.filter((h) => h.atsScore).reduce((sum, h) => sum + (h.atsScore || 0), 0) /
                history.filter((h) => h.atsScore).length
            )
          : 0,
      companiesAnalyzed: new Set(history.map((h) => h.company)).size,
      rolesAnalyzed: new Set(history.map((h) => h.jobRole)).size,
    };
  };

  /**
   * Search history by job role or company
   */
  const searchHistory = (query: string): HistoryItem[] => {
    const lowerQuery = query.toLowerCase();
    return history.filter(
      (item) =>
        item.jobRole.toLowerCase().includes(lowerQuery) ||
        item.company.toLowerCase().includes(lowerQuery)
    );
  };

  /**
   * Export history as PDF (public API)
   */
  const exportHistory = async (): Promise<boolean> => {
    return exportHistoryPDF();
  };

  /**
   * Export history as PDF (render a simple report)
   * Attempts dynamic import of `html2pdf.js`. If unavailable, falls back to download JSON.
   */
  const exportHistoryPDF = async () => {
    try {
      // Build simple HTML report
      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Hiring Compass - History Report</title>
            <style>
              body { font-family: Arial, sans-serif; color: #0f172a; background: #fff; padding: 24px }
              h1 { color: #0b84ff }
              .item { margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px }
              .meta { color: #475569; font-size: 12px }
            </style>
          </head>
          <body>
            <h1>Hiring Compass - Analysis History</h1>
            <p>Exported: ${new Date().toLocaleString()}</p>
            ${history
              .map(
                (it) => `
              <div class="item">
                <div><strong>${escapeHtml(it.jobRole)}</strong> — <em>${escapeHtml(it.company)}</em></div>
                <div class="meta">${new Date(it.timestamp).toLocaleString()} · ATS: ${it.atsScore ?? '—'}</div>
                <div style="margin-top:6px">${escapeHtml(it.resumePreview)}</div>
              </div>`
              )
              .join('\n')}
          </body>
        </html>`;

      // Load from local dependency (prevents third-party script injection from remote CDNs).
      try {
        const html2pdfModule = await import('html2pdf.js');
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const html2pdfFn = ((html2pdfModule as any).default || html2pdfModule) as any;
        if (typeof html2pdfFn !== 'function') {
          throw new Error('html2pdf local module did not export a function');
        }

        await html2pdfFn().set({ filename: `hiring-compass-history-${Date.now()}.pdf` }).from(container).save();
        document.body.removeChild(container);
        console.log('[History] Exported history as PDF (local package)');
        return true;
      } catch (pdfErr) {
        console.error('[History] html2pdf local module failed; PDF export aborted', pdfErr);
        return false;
      }
    } catch (error) {
      console.error('[History] Failed to export PDF:', error);
      return false;
    }
  };

  /**
   * Import history from JSON file
   */
  
  /**
   * Parse a PDF and return extracted text for confirmation UI.
   * Note: this function does NOT save the parsed data to history — caller must call `saveToHistory` to persist.
   */
  const importHistory = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      (async () => {
        try {
          if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            console.error('[History] Import failed: only PDF imports are supported');
            resolve(null);
            return;
          }

          // Dynamically import pdfjs to extract text
          try {
            const pdfjs = await import('pdfjs-dist/legacy/build/pdf');
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            let text = '';
            for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              const pageText = content.items.map((it: Record<string, unknown>) => (it.str ? String(it.str) : '')).join(' ');
              text += pageText + '\n';
            }

            resolve(text);
            return;
          } catch (pdfErr) {
            console.error('[History] pdfjs failed to parse PDF:', pdfErr);
            resolve(null);
            return;
          }
        } catch (error) {
          console.error('[History] Failed to import history:', error);
          resolve(null);
        }
      })();
    });
  };

  return {
    history,
    isLoaded,
    saveToHistory,
    getHistoryItem,
    deleteHistoryItem,
    clearAllHistory,
    getStatistics,
    searchHistory,
    exportHistory,
      importHistory,
      exportHistoryPDF,
  };
};

  // small helper
  function escapeHtml(str: string) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
