/**
 * Component to display and manage analysis history
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, DownloadCloud, Upload, Search } from 'lucide-react';
import type { HistoryItem } from '../hooks/useResultHistory';
import LazyRechartsScoreChart from './LazyRechartsScoreChart';
import LazyTrendChart from './LazyTrendChart';
import '../styles/components.css';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearAll: () => void;
  onExport: () => void;
  onImport: (file: File) => Promise<string | null>;
  onSaveImported: (
    jobRole: string,
    company: string,
    resumeText: string,
    fullData?: Record<string, unknown>
  ) => void;
  statistics: {
    totalItems: number;
    averageAtsScore: number;
    companiesAnalyzed: number;
    rolesAnalyzed: number;
    oldestAnalysis?: number;
    newestAnalysis?: number;
  };
}

export const HistoryPanel = ({
  history,
  onSelectHistory,
  onDeleteHistory,
  onClearAll,
  onExport,
  onImport,
  onSaveImported,
  statistics,
}: HistoryPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'score'>('recent');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [importPreviewText, setImportPreviewText] = React.useState<string | null>(null);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [importJobRole, setImportJobRole] = React.useState('Imported PDF');
  const [importCompany, setImportCompany] = React.useState('');

  const filteredHistory = history.filter((item) =>
    `${item.jobRole} ${item.company}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === 'recent') {
      return b.timestamp - a.timestamp;
    } else {
      return (b.atsScore || 0) - (a.atsScore || 0);
    }
  });

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const parsed = await onImport(file);
      if (parsed) {
        setImportPreviewText(parsed);
        setImportJobRole('Imported PDF');
        setImportCompany(file.name);
        setShowImportModal(true);
      } else {
        alert('Failed to parse PDF. Ensure the file is a valid PDF.');
      }
    }
  };

  const handleSaveImport = () => {
    if (!importPreviewText) return;
    const fullData = { importedPdfText: importPreviewText };
    onSaveImported(importJobRole, importCompany, importPreviewText, fullData);
    setShowImportModal(false);
    setImportPreviewText(null);
    alert('Imported history saved');
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analysis History</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onExport}
            disabled={history.length === 0}
            className="p-2 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Export history as PDF"
          >
            <DownloadCloud className="w-5 h-5" />
          </button>
          <button
            onClick={handleImportClick}
            className="p-2 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/40 transition-colors"
            title="Import history from PDF"
          >
            <Upload className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelected}
            className="hidden"
            title="Select PDF file to import"
            aria-label="PDF import"
          />
        </div>
      </div>
      {/* Trend chart summarizing overall score over time */}
      {history.length > 1 && (
        <div>
          <LazyTrendChart
            points={history.map((h) => ({ timestamp: h.timestamp, score: h.overallScore }))}
          />
        </div>
      )}
      {/* Import confirmation modal */}
      {showImportModal && importPreviewText && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowImportModal(false)} />
          <div className="relative bg-midnight-800 rounded-lg p-6 w-[min(90%,720px)] z-60">
            <h3 className="text-lg font-semibold mb-2">Confirm Imported PDF</h3>
            <div className="mb-3">
              <label htmlFor="import-job-role" className="text-sm text-gray-400">Job Role</label>
              <input id="import-job-role" title="Job role for imported analysis" value={importJobRole} onChange={(e) => setImportJobRole(e.target.value)} className="w-full mt-1 p-2 rounded bg-midnight-700/50" placeholder="e.g., Senior Developer" />
            </div>
            <div className="mb-3">
              <label htmlFor="import-company" className="text-sm text-gray-400">Company / Source</label>
              <input id="import-company" title="Company or source name" value={importCompany} onChange={(e) => setImportCompany(e.target.value)} className="w-full mt-1 p-2 rounded bg-midnight-700/50" placeholder="e.g., Acme Corp" />
            </div>
            <div className="mb-4">
              <label htmlFor="import-preview" className="text-sm text-gray-400">Preview</label>
              <textarea id="import-preview" title="PDF preview" value={importPreviewText} readOnly rows={6} className="w-full mt-1 p-2 rounded bg-midnight-700/40 text-sm" placeholder="Preview of extracted text from PDF" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowImportModal(false)} className="px-4 py-2 rounded bg-gray-700/40">Cancel</button>
              <button onClick={handleSaveImport} className="px-4 py-2 rounded bg-cyan-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {history.length > 0 && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-400/10 rounded-lg p-3 border border-blue-400/30">
            <div className="text-sm text-gray-400">Total Analyses</div>
            <div className="text-2xl font-bold text-blue-300">{statistics.totalItems}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-400/10 rounded-lg p-3 border border-emerald-400/30">
            <div className="text-sm text-gray-400">Avg ATS Score</div>
            <div className="text-2xl font-bold text-emerald-300">{statistics.averageAtsScore}%</div>
          </div>
          <div className="bg-gradient-to-br from-amber-600/20 to-amber-400/10 rounded-lg p-3 border border-amber-400/30">
            <div className="text-sm text-gray-400">Companies</div>
            <div className="text-2xl font-bold text-amber-300">{statistics.companiesAnalyzed}</div>
          </div>
          <div className="bg-gradient-to-br from-pink-600/20 to-pink-400/10 rounded-lg p-3 border border-pink-400/30">
            <div className="text-sm text-gray-400">Roles</div>
            <div className="text-2xl font-bold text-pink-300">{statistics.rolesAnalyzed}</div>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      {history.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by role or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-midnight-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'score')}
            className="px-4 py-2 bg-midnight-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
            title="Sort history items"
            aria-label="Sort by most recent or highest score"
          >
            <option value="recent">Most Recent</option>
            <option value="score">Highest Score</option>
          </select>

          {/* Clear All */}
          <button
            onClick={onClearAll}
            className="px-4 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/40 transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* History List */}
      {history.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-gray-400 mb-2">No analysis history yet</p>
          <p className="text-sm text-gray-500">Your analyses will appear here</p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-3 max-h-96 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
        >
          {sortedHistory.map((item, index) => (
            <motion.div
              key={item.id}
              className="bg-gradient-to-r from-midnight-700/50 to-midnight-600/50 rounded-lg p-4 border border-gray-600/30 hover:border-cyan-400/50 cursor-pointer transition-colors group"
              onClick={() => onSelectHistory(item)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {item.jobRole}
                    </h3>
                    <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded">
                      {item.company}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    {item.atsScore !== undefined && (
                      <span className="text-emerald-400">
                        ATS: <span className="font-semibold">{item.atsScore}%</span>
                      </span>
                    )}
                  </div>
                  {/* Small breakdown chart if available */}
                  {Array.isArray((item.fullData as Record<string, unknown>)?.breakdown) && (
                    <div className="mt-3">
                      <LazyRechartsScoreChart breakdown={(item.fullData as Record<string, unknown>).breakdown as Array<{category: string; score: number}>} compact />
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHistory(item.id);
                  }}
                  className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors ml-2"
                  title="Delete this history entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {searchQuery && filteredHistory.length === 0 && history.length > 0 && (
        <motion.div
          className="text-center py-8 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No results found for "{searchQuery}"
        </motion.div>
      )}
    </motion.div>
  );
};

export default HistoryPanel;
