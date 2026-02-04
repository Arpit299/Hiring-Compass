import React from 'react';
import { Briefcase, AlertCircle, Layers, Clock } from 'lucide-react';
import ResumeInputForm from './components/ResumeInputForm';
import AnalysisDashboard from './components/AnalysisDashboard';
import ScrollDrivenResults from './components/ScrollDrivenResults';
import HistoryPanel from './components/HistoryPanel';
import type { AnalysisResult } from './types/analysis';
import { analyzeResume } from './services/analysisService';
import { useResultHistory } from './hooks/useResultHistory';
import './index.css';
import BackgroundEffects from './components/BackgroundEffects';

export default function App() {
  const [analysis, setAnalysis] = React.useState<AnalysisResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'traditional' | 'scroll-driven'>('scroll-driven');
  const [showHistory, setShowHistory] = React.useState(false);

  const {
    history,
    isLoaded,
    saveToHistory,
    deleteHistoryItem,
    clearAllHistory,
    getStatistics,
    exportHistory,
    importHistory,
  } = useResultHistory();

  const handleAnalyzeResume = async (data: { resumeFile?: File | null; resumeText?: string; jobRole: string; company: string }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeResume(data);
      setAnalysis(result);
      
      // Save to history
      const textContent = data.resumeText || '';
      if (isLoaded) {
        saveToHistory(data.jobRole, data.company, textContent, result as unknown as Record<string, unknown>);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze resume';
      setError(message);
      console.error('Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFromHistory = (item: any) => {
    setAnalysis(item.fullData);
    setShowHistory(false);
  };

  const statistics = getStatistics();

  return (
    <div className="min-h-screen bg-midnight-900 relative">
      <BackgroundEffects />
      {/* Header */}
      <header className="glass-panel m-4 p-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold tracking-tight">Hiring Compass</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* New Analysis Button */}
          {analysis && (
            <button
              onClick={() => {
                setAnalysis(null);
                setError(null);
                setShowHistory(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 transition-colors"
              title="Start a new resume analysis"
            >
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">New Analysis</span>
            </button>
          )}

          {/* History Button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showHistory
                ? 'bg-blue-600 text-white'
                : 'bg-white/[0.05] text-gray-300 hover:bg-white/[0.08]'
            }`}
            title={`View analysis history (${history.length})`}
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">History</span>
            {history.length > 0 && (
              <span className="ml-1 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {Math.min(history.length, 9)}
              </span>
            )}
          </button>

          {/* View Mode Toggle */}
          {analysis && (
            <div className="flex items-center gap-2 bg-white/[0.05] rounded-lg p-1 border border-white/[0.08]">
              <button
                onClick={() => setViewMode('scroll-driven')}
                className={`px-4 py-2 rounded-md transition-colors font-medium text-sm flex items-center gap-2 ${
                  viewMode === 'scroll-driven'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                Storytelling
              </button>
              <button
                onClick={() => setViewMode('traditional')}
                className={`px-4 py-2 rounded-md transition-colors font-medium text-sm ${
                  viewMode === 'traditional'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Classic
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* History Panel */}
        {showHistory && isLoaded && (
          <div className="mb-8 glass-panel p-6 rounded-lg border border-white/[0.08]">
            <HistoryPanel
              history={history}
              onSelectHistory={handleLoadFromHistory}
              onDeleteHistory={deleteHistoryItem}
              onClearAll={clearAllHistory}
              onExport={exportHistory}
              onImport={importHistory}
              onSaveImported={(jobRole, company, resumeText, fullData) =>
                saveToHistory(jobRole, company, resumeText, fullData)
              }
              statistics={statistics}
            />
          </div>
        )}

        {/* Main Tagline and Headlines */}
        {!analysis && !showHistory && (
          <div className="mb-12 flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent leading-tight md:leading-snug max-w-4xl px-4">
              <div className="block">Precision Hiring,</div>
              <div className="block">Not Mass Applying.</div>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Complete all fields below to get a high-precision audit of your profile against your dream career goals.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 glass-panel p-4 border-l-2 border-red-500 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-400">Analysis Error</p>
              <p className="text-sm text-gray-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!analysis && !showHistory ? (
          <ResumeInputForm onSubmit={handleAnalyzeResume} loading={loading} />
        ) : !showHistory && analysis ? viewMode === 'scroll-driven' ? (
          <ScrollDrivenResults result={analysis} />
        ) : (
          <AnalysisDashboard result={analysis} />
        ) : null}
      </main>
    </div>
  );
}
