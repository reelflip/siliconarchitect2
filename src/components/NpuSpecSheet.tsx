/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EstimationOutputs, WorkloadInputs } from "../types";
import { Zap, Cpu, HardDrive, Layout, Flame, DollarSign, ShieldAlert, CheckCircle2 } from "lucide-react";

interface NpuSpecSheetProps {
  inputs: WorkloadInputs;
  outputs: EstimationOutputs;
}

export const NpuSpecSheet: React.FC<NpuSpecSheetProps> = ({ inputs, outputs }) => {
  const {
    requiredTops,
    frequencyGhz,
    utilization,
    macCount,
    sramMb,
    ddrBandwidthGbs,
    arithmeticIntensity,
    estimatedAreaMm2,
    estimatedPowerW,
    dynamicPowerW,
    leakagePowerW,
    memoryPowerW,
    isPowerThrottled,
    bottleneckAnalysis,
  } = outputs;

  // Wafer/Mask Cost Estimator
  const getProcessCostInfo = (node: string) => {
    switch (node) {
      case "28nm":
        return { tier: "Low Cost", maskCost: "~$1.5M", waferCost: "~$3,000", bg: "bg-emerald-950/40 text-emerald-400 border-emerald-900/40" };
      case "16nm":
        return { tier: "Moderate Cost", maskCost: "~$3.5M", waferCost: "~$5,000", bg: "bg-blue-950/40 text-blue-400 border-blue-900/40" };
      case "7nm":
        return { tier: "Premium Cost", maskCost: "~$9.0M", waferCost: "~$11,500", bg: "bg-amber-950/40 text-amber-400 border-amber-900/40" };
      case "5nm":
        return { tier: "Extreme Cost", maskCost: "~$14.0M", waferCost: "~$17,000", bg: "bg-orange-950/40 text-orange-400 border-orange-900/40" };
      case "3nm":
        return { tier: "Bleeding Edge Cost", maskCost: "~$22.0M+", waferCost: "~$24,000", bg: "bg-red-950/40 text-red-400 border-red-900/40" };
      default:
        return { tier: "Standard", maskCost: "N/A", waferCost: "N/A", bg: "bg-slate-900 text-slate-400 border-slate-800" };
    }
  };

  const costInfo = getProcessCostInfo(inputs.processNode);

  // Power budget percentage
  const powerUsagePercent = Math.min(100, Math.round((estimatedPowerW / inputs.powerBudget) * 100));

  return (
    <div id="npu-spec-sheet-root" className="space-y-6">
      {/* 1. Power and Bottleneck Diagnostic Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Power Diagnostic Card */}
        <div className={`p-4 rounded-xl border ${isPowerThrottled ? "bg-red-950/20 border-red-800/40" : "bg-emerald-950/10 border-emerald-800/20"}`}>
          <div className="flex justify-between items-start">
            <div className="flex gap-2.5 items-center">
              <span className={`p-1.5 rounded-lg ${isPowerThrottled ? "bg-red-900/30 text-red-400" : "bg-emerald-900/30 text-emerald-400"}`}>
                <Zap className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400">POWER BUDGET STATUS</h4>
                <p className="text-sm font-semibold font-mono text-slate-200">
                  {estimatedPowerW}W / {inputs.powerBudget}W
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isPowerThrottled ? "bg-red-900/40 text-red-200 animate-pulse" : "bg-emerald-900/40 text-emerald-200"}`}>
              {isPowerThrottled ? "OVER THERMAL LIMIT" : "THERMAL BUDGET SAFE"}
            </span>
          </div>

          <div className="mt-3">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isPowerThrottled ? "bg-red-500" : "bg-emerald-500"}`}
                style={{ width: `${powerUsagePercent}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-1 text-right">
              {powerUsagePercent}% used
            </p>
          </div>
        </div>

        {/* Bottleneck Analysis Card */}
        <div className={`p-4 rounded-xl border ${isPowerThrottled || arithmeticIntensity < 15 ? "bg-amber-950/10 border-amber-800/20 text-amber-300" : "bg-slate-900 border-slate-800 text-slate-300"}`}>
          <div className="flex gap-2.5 items-start">
            <span className={`p-1.5 rounded-lg mt-0.5 ${isPowerThrottled || arithmeticIntensity < 15 ? "bg-amber-900/30 text-amber-400" : "bg-slate-800 text-slate-400"}`}>
              {isPowerThrottled || arithmeticIntensity < 15 ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </span>
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-400">DESIGN BOTTLENECK ANALYSIS</h4>
              <p className="text-xs font-mono mt-1 text-slate-300 leading-relaxed">
                {bottleneckAnalysis}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. WAFER & MASK CAPEX OVERVIEW */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${costInfo.bg}`}>
        <div className="flex gap-3 items-center">
          <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-400">CAPEX ESTIMATION ({inputs.processNode})</h4>
            <p className="text-sm font-bold font-mono">{costInfo.tier}</p>
          </div>
        </div>
        <div className="flex gap-6 text-xs font-mono">
          <div>
            <p className="text-slate-500">Est. Mask Set Cost:</p>
            <p className="text-sm font-bold">{costInfo.maskCost}</p>
          </div>
          <div>
            <p className="text-slate-500">Est. Process Wafer Cost:</p>
            <p className="text-sm font-bold">{costInfo.waferCost}</p>
          </div>
        </div>
      </div>

      {/* 3. CORE HARDWARE SPECIFICATIONS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* TOPS Core */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-mono text-xs">COMPUTE</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-100 font-mono tracking-tight">{requiredTops} <span className="text-xs text-cyan-400">TOPS</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Required Peak Int8 Compute</p>
          </div>
        </div>

        {/* MAC Count */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-mono text-xs">MAC CORE COUNT</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-100 font-mono tracking-tight">{macCount.toLocaleString()}</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1">MAC Multipliers ({utilization}% util)</p>
          </div>
        </div>

        {/* SRAM size */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-mono text-xs">ON-CHIP BUFFER</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-100 font-mono tracking-tight">{sramMb} <span className="text-xs text-emerald-400">MB</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1">SRAM Cache (Weight & Act)</p>
          </div>
        </div>

        {/* Memory Bandwidth */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-mono text-xs">MEMORY BUS</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-100 font-mono tracking-tight">{ddrBandwidthGbs} <span className="text-xs text-cyan-400">GB/s</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Required DDR Bandwidth</p>
          </div>
        </div>

        {/* Arithmetic Intensity */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-mono text-xs">INTENSITY</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-100 font-mono tracking-tight">{arithmeticIntensity} <span className="text-xs text-amber-400">OPs/B</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Compute Reuse per DDR Byte</p>
          </div>
        </div>

        {/* Estimated Area */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-mono text-xs">DIE AREA</span>
            <Layout className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-100 font-mono tracking-tight">{estimatedAreaMm2} <span className="text-xs text-rose-400">mm²</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Logic + Memory silicon area</p>
          </div>
        </div>
      </div>

      {/* 4. DETAIL POWER DRAWS BREAKDOWN */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <h4 className="text-xs font-mono font-bold text-slate-400 mb-4 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-400" /> POWER DISPERSION BREAKDOWN
        </h4>
        <div className="space-y-3 font-mono text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>NPU Core Dynamic Power</span>
              <span>{dynamicPowerW} W</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${(dynamicPowerW / estimatedPowerW) * 100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>SRAM & DRAM PHY Memory Power</span>
              <span>{memoryPowerW} W</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${(memoryPowerW / estimatedPowerW) * 100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Silicon Substrate Static Leakage</span>
              <span>{leakagePowerW} W</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
              <div className="bg-red-500/80 h-full" style={{ width: `${(leakagePowerW / estimatedPowerW) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
