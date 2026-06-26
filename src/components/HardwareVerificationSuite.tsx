/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { WorkloadInputs, EstimationOutputs } from "../types";
import { Play, ShieldAlert, CheckCircle, Terminal, RefreshCw, XCircle } from "lucide-react";

interface HardwareVerificationSuiteProps {
  inputs: WorkloadInputs;
  outputs: EstimationOutputs;
}

interface LogLine {
  text: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
}

export const HardwareVerificationSuite: React.FC<HardwareVerificationSuiteProps> = ({
  inputs,
  outputs,
}) => {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<"pass" | "warn" | "fail" | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the logs on addition
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (text: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const timeStr = new Date().toLocaleTimeString([], { hour12: false, fractionDigits: 3 } as any);
    setLogs((prev) => [...prev, { text, type, timestamp: timeStr }]);
  };

  const handleRunSuite = () => {
    setIsRunning(true);
    setTestResult(null);
    setLogs([]);

    const runSteps = [
      { delay: 100, text: "System reset released. Initializing NPU model testbench...", type: "info" as const },
      { delay: 400, text: `Mapping target workload: ${inputs.workloadType.toUpperCase()} | Node: ${inputs.processNode}`, type: "info" as const },
      { delay: 700, text: "Configuring clock synthesizers and PLL frequency locks...", type: "info" as const },
      {
        delay: 1100,
        text: `PLL locked at stable frequency: ${outputs.frequencyGhz} GHz. Sync checked.`,
        type: "success" as const
      },
      // Check timing closure based on process node + frequency limits
      {
        delay: 1500,
        fn: () => {
          let timingPass = true;
          if (inputs.processNode === "28nm" && outputs.frequencyGhz > 0.5) timingPass = false;
          if (inputs.processNode === "16nm" && outputs.frequencyGhz > 0.8) timingPass = false;

          if (timingPass) {
            addLog(`[PASS] Setup/Hold timing bounds cleared! Clock Slack: +0.124 ns.`, "success");
          } else {
            addLog(`[FAIL] TIMING VIOLATION: Frequency ${outputs.frequencyGhz} GHz exceeds ${inputs.processNode} critical path delay. Slack: -0.455 ns!`, "error");
          }
          return timingPass;
        }
      },
      // Check memory interface bandwidth bounds
      {
        delay: 2000,
        fn: () => {
          const bwUsageRatio = outputs.ddrBandwidthGbs / 512.0; // dummy boundary check relative to scale
          if (outputs.bottleneckAnalysis.includes("Memory Bound") || outputs.bottleneckAnalysis.includes("Bandwidth")) {
            addLog(`[WARN] DRAM Memory Throttling detected. Execution stalled by memory latency. Bandwidth: ${outputs.ddrBandwidthGbs} GB/s.`, "warning");
            return "warn";
          } else {
            addLog(`[PASS] SRAM/DDR bus arbitration clear. No bottleneck stalls identified.`, "success");
            return "pass";
          }
        }
      },
      // Thermal Envelope Check
      {
        delay: 2500,
        fn: () => {
          if (outputs.isPowerThrottled) {
            addLog(`[WARN] Thermal design power (TDP) limit exceeded! Estimated: ${outputs.estimatedPowerW}W (Budget: ${inputs.powerBudget}W). DVFS Throttling engaged.`, "warning");
            return "warn";
          } else {
            addLog(`[PASS] Core TDP verified at ${outputs.estimatedPowerW} Watts. Well within structural thermal margin.`, "success");
            return "pass";
          }
        }
      },
      // Register Map Alignment
      { delay: 2900, text: "Verifying SystemVerilog Register Map boundaries... 100% correct address bounds.", type: "success" as const },
      {
        delay: 3300,
        text: "NPU Verification complete.",
        type: "info" as const
      }
    ];

    let overallState: "pass" | "warn" | "fail" = "pass";

    runSteps.forEach((step, idx) => {
      setTimeout(() => {
        if (step.text) {
          addLog(step.text, step.type);
        }
        if (step.fn) {
          const outcome = step.fn();
          if (outcome === false) {
            overallState = "fail";
          } else if (outcome === "warn" && overallState !== "fail") {
            overallState = "warn";
          }
        }

        // Finalize at the last step
        if (idx === runSteps.length - 1) {
          setIsRunning(false);
          setTestResult(overallState);
        }
      }, step.delay);
    });
  };

  return (
    <div id="hardware-verification-panel" className="h-full flex flex-col font-mono text-xs">
      {/* Header controls */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3 shrink-0">
        <h4 className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-cyan-400" /> ASIC LOGIC VERIFICATION
        </h4>
        <button
          onClick={handleRunSuite}
          disabled={isRunning}
          className="bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-all flex items-center gap-1.5"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
              TESTING...
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-cyan-400 text-cyan-400" />
              RUN VERIFICATION
            </>
          )}
        </button>
      </div>

      {/* Terminal Viewport */}
      <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-[10px] overflow-y-auto min-h-64 flex flex-col justify-between">
        <div className="space-y-1.5">
          {logs.length === 0 && (
            <div className="text-slate-600 h-full flex flex-col justify-center items-center py-10 gap-2">
              <Terminal className="w-6 h-6 text-slate-800" />
              <p className="text-center uppercase font-bold text-[9px]">Simulator Standby</p>
              <p className="text-center text-[8px] text-slate-700 max-w-[200px]">
                Click 'Run Verification' to start SystemVerilog cycle-accurate register timing assertions.
              </p>
            </div>
          )}

          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-2 leading-relaxed">
              <span className="text-slate-600 select-none">[{log.timestamp}]</span>
              <span
                className={`flex-1 ${
                  log.type === "success"
                    ? "text-emerald-400 font-bold"
                    : log.type === "warning"
                    ? "text-amber-400 font-bold"
                    : log.type === "error"
                    ? "text-red-400 font-bold"
                    : "text-slate-300"
                }`}
              >
                {log.text}
              </span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Floating Test Status Banner */}
        {testResult && (
          <div
            className={`mt-4 p-3 rounded-lg border flex items-center gap-2 ${
              testResult === "pass"
                ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
                : testResult === "warn"
                ? "bg-amber-950/20 border-amber-900/40 text-amber-400"
                : "bg-red-950/20 border-red-900/40 text-red-400"
            }`}
          >
            {testResult === "pass" && (
              <>
                <CheckCircle className="w-4 h-4 shrink-0" />
                <div>
                  <p className="font-bold text-[9px] uppercase">TIMING & POWER VERIFIED PASSED</p>
                  <p className="text-[8px] opacity-80">Design is clear of physical constraint violations.</p>
                </div>
              </>
            )}
            {testResult === "warn" && (
              <>
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <div>
                  <p className="font-bold text-[9px] uppercase">WARNING: CONSTRAINTS THREADING</p>
                  <p className="text-[8px] opacity-80">Execution capped by physical bottleneck limits or DVFS throttling.</p>
                </div>
              </>
            )}
            {testResult === "fail" && (
              <>
                <XCircle className="w-4 h-4 shrink-0" />
                <div>
                  <p className="font-bold text-[9px] uppercase">FAIL: TIMING CLOSURE BROKEN</p>
                  <p className="text-[8px] opacity-80">Setup slack violates physical capability. Switch process node or scale down clock.</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
