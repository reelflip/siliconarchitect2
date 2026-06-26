/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from "react";
import { WorkloadInputs, EstimationOutputs, ChatMessage } from "./types";
import { estimateAccelerator } from "./utils/siliconMath";
import { SpecController } from "./components/SpecController";
import { NpuSpecSheet } from "./components/NpuSpecSheet";
import { ChipFloorplan } from "./components/ChipFloorplan";
import { ReportViewer } from "./components/ReportViewer";
import { HardwareVerificationSuite } from "./components/HardwareVerificationSuite";
import { DseExplorer } from "./components/DseExplorer";
import { RooflineModel } from "./components/RooflineModel";
import { WaferYieldCalculator } from "./components/WaferYieldCalculator";
import { RtlRegisterGenerator } from "./components/RtlRegisterGenerator";
import { generateLocalReport } from "./utils/localReportGenerator";
import { Cpu, FileText, Terminal, AlertTriangle, CpuIcon, BookOpen, Home } from "lucide-react";
import { KnowledgeHub } from "./components/KnowledgeHub";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { HomePage } from "./components/HomePage";


export default function App() {
  // 1. Core input specifications state
  const [inputs, setInputs] = useState<WorkloadInputs>({
    workloadType: "cnn_object_detection",
    resolutionWidth: 1920,
    resolutionHeight: 1080,
    fps: 30,
    modelComplexity: "medium",
    powerBudget: 5,
    processNode: "7nm",
    llmParams: 7,
    llmTokensPerSec: 30,
    llmBatchSize: 1,
  });

  // 2. Local Specification report states (Deterministic Offline MVP)
  const [reportText, setReportText] = useState<string | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);

  // 3. Active column tab selection state
  const [activeRightTab, setActiveRightTab] = useState<"report" | "verification">("report");
  const [activeMiddleTab, setActiveMiddleTab] = useState<"estimates" | "roofline" | "wafer" | "registers">("estimates");
  
  // 4. App-level navigation state
  const [currentView, setCurrentView] = useState<"home" | "workspace" | "knowledge">("home");

  // 4. Instantly compute deterministic estimates on the client side whenever inputs change
  const outputs = useMemo(() => {
    return estimateAccelerator(inputs);
  }, [inputs]);

  // Reset report if the underlying inputs change to maintain exact structural alignment
  useEffect(() => {
    if (reportText) {
      setReportText(generateLocalReport(inputs, outputs));
    }
  }, [inputs, outputs]);

  // Scroll main container to top when switching views
  useEffect(() => {
    const mainEl = document.getElementById("app-main-content");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentView]);

  // 5. Full Specification Report Compiler (Local, fast synthesis simulation)
  const handleGenerateReport = () => {
    setIsReportLoading(true);
    setTimeout(() => {
      setReportText(generateLocalReport(inputs, outputs));
      setIsReportLoading(false);
    }, 450);
  };

  return (
    <div id="ai-silicon-workspace" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* HEADER SECTION */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-950/40 border border-indigo-500/30">
            <Cpu className="w-5.5 h-5.5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black font-mono tracking-tight text-white flex items-center gap-2">
              COREPICK ARCHITECT
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-500/20">
                PRO v1.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              NPU Core Selection & Silicon Accelerator Synthesis
            </p>
          </div>
        </div>

        {/* Dynamic View Navigation */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setCurrentView("home")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all ${
              currentView === "home"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>HOME</span>
          </button>
          <button
            onClick={() => setCurrentView("workspace")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all ${
              currentView === "workspace"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>DESIGN WORKSPACE</span>
          </button>
          <button
            onClick={() => setCurrentView("knowledge")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all ${
              currentView === "knowledge"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>KNOWLEDGE HUB & BLOG</span>
          </button>
        </div>

        {/* Process State Quick Overview Bar */}
        <div className="flex flex-wrap gap-2.5 text-[10px] font-mono">
          <div className="bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800">
            <span className="text-slate-500">WORKLOAD:</span> <span className="text-slate-300 font-bold uppercase">{inputs.workloadType.replace("_", " ")}</span>
          </div>
          <div className="bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800">
            <span className="text-slate-500">FABRICATION:</span> <span className="text-indigo-400 font-bold">{inputs.processNode} GAA</span>
          </div>
          <div className="bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800">
            <span className="text-slate-500">POWER LIMIT:</span> <span className="text-amber-400 font-bold">{inputs.powerBudget}W</span>
          </div>
        </div>
      </header>

      {/* WORKSPACE COLUMN LAYOUT */}
      <main id="app-main-content" className="flex-1 p-6 space-y-6 overflow-y-auto min-h-0">
        {currentView === "home" ? (
          <ErrorBoundary>
            <HomePage onNavigate={setCurrentView} />
          </ErrorBoundary>
        ) : currentView === "workspace" ? (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* LEFT COLUMN: Input Controllers & Quick Settings (Col 4) */}
              <div className="xl:col-span-4 space-y-6 flex flex-col min-h-0">
                <SpecController
                  inputs={inputs}
                  onChangeInputs={setInputs}
                />
                <ChipFloorplan inputs={inputs} outputs={outputs} />
              </div>

              {/* MIDDLE COLUMN: Peak Estimations & Architectural Exploration (Col 4) */}
              <div className="xl:col-span-4 flex flex-col min-h-[500px] xl:min-h-0 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                {/* Middle Workspace Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-950 text-slate-400">
                  <button
                    onClick={() => setActiveMiddleTab("estimates")}
                    className={`flex-1 flex flex-col items-center justify-center py-2.5 text-[9px] font-mono font-bold border-b-2 transition-all uppercase ${activeMiddleTab === "estimates" ? "border-emerald-500 text-emerald-400 bg-slate-900/40" : "border-transparent hover:text-slate-200"}`}
                  >
                    <span>SPEC SHEET</span>
                  </button>
                  <button
                    onClick={() => setActiveMiddleTab("roofline")}
                    className={`flex-1 flex flex-col items-center justify-center py-2.5 text-[9px] font-mono font-bold border-b-2 transition-all uppercase ${activeMiddleTab === "roofline" ? "border-rose-500 text-rose-400 bg-slate-900/40" : "border-transparent hover:text-slate-200"}`}
                  >
                    <span>ROOFLINE</span>
                  </button>
                  <button
                    onClick={() => setActiveMiddleTab("wafer")}
                    className={`flex-1 flex flex-col items-center justify-center py-2.5 text-[9px] font-mono font-bold border-b-2 transition-all uppercase ${activeMiddleTab === "wafer" ? "border-indigo-500 text-indigo-400 bg-slate-900/40" : "border-transparent hover:text-slate-200"}`}
                  >
                    <span>WAFER COST</span>
                  </button>
                  <button
                    onClick={() => setActiveMiddleTab("registers")}
                    className={`flex-1 flex flex-col items-center justify-center py-2.5 text-[9px] font-mono font-bold border-b-2 transition-all uppercase ${activeMiddleTab === "registers" ? "border-cyan-500 text-cyan-400 bg-slate-900/40" : "border-transparent hover:text-slate-200"}`}
                  >
                    <span>RTL / REGS</span>
                  </button>
                </div>

                <div className="flex-1 p-5 overflow-y-auto">
                  {activeMiddleTab === "estimates" && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold font-mono text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-2 uppercase">
                        <CpuIcon className="w-4 h-4 text-emerald-400" /> Peak NPU Core Estimations
                      </h3>
                      <NpuSpecSheet inputs={inputs} outputs={outputs} />
                    </div>
                  )}
                  {activeMiddleTab === "roofline" && (
                    <div className="space-y-2">
                      <RooflineModel inputs={inputs} outputs={outputs} />
                    </div>
                  )}
                  {activeMiddleTab === "wafer" && (
                    <div className="space-y-2">
                      <WaferYieldCalculator inputs={inputs} outputs={outputs} />
                    </div>
                  )}
                  {activeMiddleTab === "registers" && (
                    <div className="space-y-2">
                      <RtlRegisterGenerator inputs={inputs} outputs={outputs} />
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: AI Specifications & LLM Tradeoffs + Code Generative Chat (Col 4) */}
              <div className="xl:col-span-4 flex flex-col min-h-[500px] xl:min-h-0 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                {/* Tabs header */}
                <div className="flex border-b border-slate-800 bg-slate-950">
                  <button
                    onClick={() => setActiveRightTab("report")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-mono font-bold border-b-2 transition-all ${activeRightTab === "report" ? "border-cyan-500 text-cyan-400 bg-slate-900/40" : "border-transparent text-slate-400 hover:text-slate-200"}`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    SPEC REVIEW REPORT
                  </button>
                  <button
                    onClick={() => setActiveRightTab("verification")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-mono font-bold border-b-2 transition-all ${activeRightTab === "verification" ? "border-cyan-500 text-cyan-400 bg-slate-900/40" : "border-transparent text-slate-400 hover:text-slate-200"}`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    HARDWARE VERIFICATION
                  </button>
                </div>

                <div className="flex-1 p-5 min-h-0 overflow-hidden">
                  {activeRightTab === "report" ? (
                    <ReportViewer
                      reportText={reportText}
                      isLoading={isReportLoading}
                      onGenerate={handleGenerateReport}
                    />
                  ) : (
                    <HardwareVerificationSuite
                      inputs={inputs}
                      outputs={outputs}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* DESIGN SPACE EXPLORATION (DSE) */}
            <DseExplorer
              inputs={inputs}
              outputs={outputs}
              onApplyConfig={({ processNode, powerBudget }) => {
                setInputs((prev) => ({
                  ...prev,
                  processNode,
                  powerBudget,
                }));
              }}
            />
          </>
        ) : (
          <ErrorBoundary>
            <KnowledgeHub />
          </ErrorBoundary>
        )}
      </main>


      {/* FOOTER BAR */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-3 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-600 font-mono gap-2 shrink-0">
        <span>COREPICK ARCHITECT • NPU CORE SELECTION & ACCELERATOR SYNTHESIS</span>
        <div className="flex gap-4">
          <span>CORES: {outputs.macCount} MACs</span>
          <span>SRAM: {outputs.sramMb} MB</span>
          <span>EST AREA: {outputs.estimatedAreaMm2} mm²</span>
        </div>
      </footer>
    </div>
  );
}
