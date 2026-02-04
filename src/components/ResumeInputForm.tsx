import React from 'react';
import { Send, AlertCircle, Upload, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResumeInputFormProps {
  onSubmit: (data: {
    resumeFile?: File | null;
    resumeText?: string;
    jobRole: string;
    company: string;
  }) => void;
  loading: boolean;
}

export default function ResumeInputForm({ onSubmit, loading }: ResumeInputFormProps) {
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [jobRole, setJobRole] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Require file upload
    if (!resumeFile) newErrors.resumeFile = 'Resume file is required (PDF or DOCX)';
    if (!jobRole.trim()) newErrors.jobRole = 'Job role is required';
    if (!company.trim()) newErrors.company = 'Company name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ resumeFile, jobRole, company });
    }
  };

  const handleFileChange = (file: File | null) => {
    setErrors((s) => ({ ...s, resumeFile: '' }));
    if (file) {
      const max = 5 * 1024 * 1024;
      const name = file.name.toLowerCase();
      if (!(name.endsWith('.pdf') || name.endsWith('.docx'))) {
        setErrors((s) => ({ ...s, resumeFile: 'Unsupported file type. Use PDF or DOCX.' }));
        setResumeFile(null);
        return;
      }
      if (file.size > max) {
        setErrors((s) => ({ ...s, resumeFile: 'File too large (max 5 MB).' }));
        setResumeFile(null);
        return;
      }
    }
    setResumeFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-8 max-w-2xl mx-auto">
        {/* Resume Upload Box - Centered */}
        <motion.div
          variants={itemVariants}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-2xl transition-all duration-300 ${
            dragActive
              ? 'border-2 border-blue-400 bg-blue-500/10'
              : 'border-2 border-dashed border-gray-600 bg-gradient-to-br from-midnight-800 to-midnight-900'
          } p-12 text-center cursor-pointer group hover:border-blue-400/60 hover:bg-blue-500/5`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
            disabled={loading}
            className="hidden"
          />

          <motion.div
            animate={dragActive ? { scale: 1.05 } : { scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.1, y: -5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 group-hover:border-blue-400/60 transition-colors"
            >
              {resumeFile ? (
                <FileText className="w-10 h-10 text-green-400" />
              ) : (
                <Upload className="w-10 h-10 text-blue-400" />
              )}
            </motion.div>

            {resumeFile ? (
              <>
                <div>
                  <p className="text-lg font-semibold text-green-400">Resume Uploaded</p>
                  <p className="text-sm text-gray-400 mt-1">{resumeFile.name}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {(resumeFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResumeFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition-colors mt-2"
                >
                  Change File
                </button>
              </>
            ) : (
              <>
                <div>
                  <p className="text-lg font-semibold">Drag your resume here</p>
                  <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                </div>
                <p className="text-xs text-gray-500">PDF or DOCX • Max 5 MB</p>
              </>
            )}
          </motion.div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="absolute inset-0 rounded-2xl opacity-0"
          />

          {errors.resumeFile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.resumeFile}
            </motion.div>
          )}
        </motion.div>

        {/* Job Role and Company - Below Upload Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Role */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-3 text-gray-300">Job Role *</label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => {
                setJobRole(e.target.value);
                setErrors((s) => ({ ...s, jobRole: '' }));
              }}
              placeholder="e.g., Senior Frontend Engineer"
              className="w-full glass-panel px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-lg transition-all"
              disabled={loading}
            />
            {errors.jobRole && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-2 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.jobRole}
              </motion.div>
            )}
          </motion.div>

          {/* Company */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-3 text-gray-300">Company *</label>
            <input
              type="text"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                setErrors((s) => ({ ...s, company: '' }));
              }}
              placeholder="e.g., TechCorp Inc"
              className="w-full glass-panel px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-lg transition-all"
              disabled={loading}
            />
            {errors.company && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-2 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {errors.company}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Submit Button */}
        <motion.div variants={itemVariants}>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 font-semibold flex items-center justify-center gap-2 transition-all rounded-lg text-white shadow-lg hover:shadow-blue-500/50"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                Analyzing Resume...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Analyze Resume
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Info text */}
        <motion.p variants={itemVariants} className="text-center text-xs text-gray-500">
          Your resume data is analyzed and not stored. Results are generated based on current market expectations.
        </motion.p>
      </div>
    </motion.form>
  );
}
