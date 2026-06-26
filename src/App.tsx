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
import { Cpu, FileText, Terminal, AlertTriangle, CpuIcon, BookOpen, Home, Mail } from "lucide-react";
import { KnowledgeHub } from "./components/KnowledgeHub";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { HomePage } from "./components/HomePage";
import { ContactUs } from "./components/ContactUs";


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
  const [currentView, setCurrentView] = useState<"home" | "workspace" | "knowledge" | "contact">("home");

  const handleNavigate = (
    view: "home" | "workspace" | "knowledge" | "contact",
    middleTab?: "estimates" | "roofline" | "wafer" | "registers",
    rightTab?: "report" | "verification"
  ) => {
    setCurrentView(view);
    if (middleTab) setActiveMiddleTab(middleTab);
    if (rightTab) setActiveRightTab(rightTab);
  };

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
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:flex-1 justify-start w-full md:w-auto">
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

        {/* Dynamic View Navigation - Center Fixed */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 shrink-0">
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
          <button
            onClick={() => setCurrentView("contact")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all ${
              currentView === "contact"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>CONTACT US</span>
          </button>
        </div>

        {/* Right Section - Balanced spacer to keep menu perfectly centered, displaying nothing */}
        <div className="hidden md:block md:flex-1" />
      </header>

      {/* WORKSPACE COLUMN LAYOUT */}
      <main id="app-main-content" className="flex-1 p-6 space-y-6 overflow-y-auto min-h-0">
        {currentView === "home" ? (
          <ErrorBoundary>
            <HomePage onNavigate={handleNavigate} />
          </ErrorBoundary>
        ) : currentView === "workspace" ? (
          <>
            {/* WORKFLOW STEPPER FOR INTUITIVE SEQUENTIAL DISCOVERY */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              <div className="space-y-1 max-w-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                  <span className="text-[10px] font-bold font-mono tracking-wider text-indigo-400 uppercase">ACTIVE CO-DESIGN SESSION</span>
                </div>
                <h3 className="text-sm font-black font-mono text-white">ASIC Micro-Architectural Pipeline</h3>
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed">
                  Click any step to focus that part of the Silicon Co-Design workflow. Learn by executing sequentially from workload spec to silicon verification.
                </p>
              </div>

              {/* Horizontal Steps Indicator */}
              <div className="flex-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none flex items-center justify-start lg:justify-end gap-2 text-left font-mono">
                {[
                  {
                    num: "1",
                    title: "Workload Spec",
                    desc: "Tuning Parameters",
                    middleTab: "estimates",
                    rightTab: "report",
                    active: activeMiddleTab === "estimates" && activeRightTab === "report",
                    color: "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/5"
                  },
                  {
                    num: "2",
                    title: "Floorplan Area",
                    desc: "SRAM & MAC Layout",
                    middleTab: "estimates",
                    rightTab: "report",
                    active: activeMiddleTab === "estimates" && activeRightTab === "report",
                    color: "border-teal-500/50 text-teal-400 hover:bg-teal-500/5"
                  },
                  {
                    num: "3",
                    title: "Roofline Model",
                    desc: "Memory vs Compute",
                    middleTab: "roofline",
                    rightTab: "report",
                    active: activeMiddleTab === "roofline",
                    color: "border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/5"
                  },
                  {
                    num: "4",
                    title: "Wafer Economics",
                    desc: "Defects & Die Yields",
                    middleTab: "wafer",
                    rightTab: "report",
                    active: activeMiddleTab === "wafer",
                    color: "border-rose-500/50 text-rose-400 hover:bg-rose-500/5"
                  },
                  {
                    num: "5",
                    title: "RTL Generator",
                    desc: "Verilog Register Maps",
                    middleTab: "registers",
                    rightTab: "report",
                    active: activeMiddleTab === "registers",
                    color: "border-amber-500/50 text-amber-400 hover:bg-amber-500/5"
                  },
                  {
                    num: "6",
                    title: "Verification Suite",
                    desc: "Testbench Coverage",
                    middleTab: "estimates",
                    rightTab: "verification",
                    active: activeRightTab === "verification",
                    color: "border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/5"
                  }
                ].map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveMiddleTab(step.middleTab as any);
                      setActiveRightTab(step.rightTab as any);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left min-w-[140px] md:min-w-0 transition-all ${
                      step.active
                        ? "bg-slate-950 border-indigo-500/80 shadow-md shadow-indigo-950/20 scale-[1.02]"
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                      step.active ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-500"
                    }`}>
                      {step.num}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-black text-white leading-none uppercase">{step.title}</div>
                      <div className="text-[8px] text-slate-500 leading-none">{step.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

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
        ) : currentView === "knowledge" ? (
          <ErrorBoundary>
            <KnowledgeHub />
          </ErrorBoundary>
        ) : (
          <ErrorBoundary>
            <ContactUs />
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
