/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FileText, Copy, Check, Download, AlertCircle } from "lucide-react";

interface ReportViewerProps {
  reportText: string | null;
  isLoading: boolean;
  onGenerate: () => void;
}

// Custom High-Fidelity Markdown & Code Renderer for React 19 Compatibility
export const ReportMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!text) return null;

  // Split text into lines/blocks to parse
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 text-slate-300 font-sans text-sm leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          // Extract code language and body
          const lines = part.split("\n");
          const firstLine = lines[0];
          const lang = firstLine.replace("```", "").trim() || "verilog";
          const codeLines = lines.slice(1, -1); // remove the starting and ending backticks lines
          const codeString = codeLines.join("\n");

          return (
            <div key={`code-${index}`} className="my-4 border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
              <div className="flex justify-between items-center bg-slate-900 px-4 py-2 border-b border-slate-800">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">{lang}</span>
                <button
                  onClick={() => handleCopyCode(codeString, index)}
                  className="text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-800/40 hover:bg-slate-800 px-2 py-1 rounded transition-colors"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> COPIED
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> COPY CODE
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-300 bg-slate-950 max-h-96">
                <code>{codeString}</code>
              </pre>
            </div>
          );
        } else {
          // Standard markdown element splits
          const lines = part.split("\n");
          return (
            <React.Fragment key={`text-block-${index}`}>
              {lines.map((line, lIndex) => {
                const trimmed = line.trim();

                // Headers ###
                if (trimmed.startsWith("###")) {
                  const title = trimmed.replace(/^###\s*/, "");
                  return (
                    <h3 key={`h3-${lIndex}`} className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-1.5 mt-6 mb-3">
                      <span className="w-1.5 h-3.5 bg-cyan-500 rounded-sm"></span>
                      {title}
                    </h3>
                  );
                }

                // Headers ##
                if (trimmed.startsWith("##")) {
                  const title = trimmed.replace(/^##\s*/, "");
                  return (
                    <h2 key={`h2-${lIndex}`} className="text-base font-black font-mono text-white flex items-center gap-2 border-b border-slate-700 pb-2 mt-8 mb-4">
                      {title}
                    </h2>
                  );
                }

                // List items with bullet
                if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                  const content = trimmed.replace(/^(\*|-)\s*/, "");
                  return (
                    <li key={`li-${lIndex}`} className="ml-4 pl-1 list-disc text-slate-300 my-1 font-sans">
                      {content}
                    </li>
                  );
                }

                // Bold text parser inside paragraphs
                if (trimmed === "") return <div key={`empty-${lIndex}`} className="h-2"></div>;

                // Handle bold words
                return (
                  <p key={`p-${lIndex}`} className="text-slate-300 text-sm font-sans my-1.5 leading-relaxed">
                    {trimmed}
                  </p>
                );
              })}
            </React.Fragment>
          );
        }
      })}
    </div>
  );
};

export const ReportViewer: React.FC<ReportViewerProps> = ({ reportText, isLoading, onGenerate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReport = () => {
    if (!reportText) return;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    if (!reportText) return;
    const element = document.createElement("a");
    const file = new Blob([reportText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "silicon_architecture_specification_report.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div id="report-viewer-root" className="h-full flex flex-col">
      {/* Header Controls */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-sm font-bold font-mono text-slate-300 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-cyan-400" /> ARCHITECTURE REVIEW SPEC
        </h3>
        {reportText && (
          <div className="flex gap-2">
            <button
              onClick={handleCopyReport}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-800/60 hover:bg-slate-800 px-2 py-1 rounded transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "COPIED" : "COPY"}
            </button>
            <button
              onClick={handleDownloadReport}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-800/60 hover:bg-slate-800 px-2 py-1 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> DOWNLOAD
            </button>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3 font-mono">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-cyan-400 animate-pulse">GENERATING HARDWARE SPECIFICATION...</p>
            <p className="text-[10px] text-slate-600">Drafting hardware blocks, cache mappings, and leakage analyses...</p>
          </div>
        ) : reportText ? (
          <ReportMarkdown text={reportText} />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-slate-800 rounded-xl p-6 bg-slate-900/10">
            <AlertCircle className="w-8 h-8 text-slate-600 mb-3" />
            <h4 className="text-xs font-mono font-bold text-slate-400 mb-1">NO ACTIVE SPECIFICATION DRAFTED</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mb-4">
              Press the generate button to ask the AI Silicon Architect to compile your deterministic estimators into a full-scale chip specification document.
            </p>
            <button
              onClick={onGenerate}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-cyan-950/20 shadow-[0_0_20px_rgba(8,145,178,0.3)]"
            >
              GENERATE REVIEW SPEC
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
