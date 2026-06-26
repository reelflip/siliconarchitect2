/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { WorkloadInputs, EstimationOutputs, DseConfiguration, DseOptions } from "../types";
import { runDesignSpaceExploration } from "../utils/dseEngine";
import { Search, Compass, Sliders, Play, Check, TrendingUp, Cpu, Battery, Layers, ArrowRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DseExplorerProps {
  inputs: WorkloadInputs;
  outputs: EstimationOutputs;
  onApplyConfig: (config: { processNode: any; powerBudget: number }) => void;
}

export const DseExplorer: React.FC<DseExplorerProps> = ({
  inputs,
  outputs,
  onApplyConfig,
}) => {
  const [goal, setGoal] = useState<"balanced" | "power" | "performance" | "area">("balanced");
  const [maxPower, setMaxPower] = useState<number>(inputs.powerBudget);
  const [nodeLimit, setNodeLimit] = useState<"any" | "same" | "advanced">("any");
  const [configs, setConfigs] = useState<DseConfiguration[]>([]);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  // Auto sweep when inputs or parameters change so the user immediately gets fresh recommendations
  const runSweep = () => {
    setIsSweeping(true);
    const opts: DseOptions = {
      optimizationGoal: goal,
      maxPowerBudget: maxPower,
      processNodeLimit: nodeLimit,
    };
    
    // Simulate short chip-design solver latency
    setTimeout(() => {
      const results = runDesignSpaceExploration(inputs, outputs, opts);
      setConfigs(results);
      setIsSweeping(false);
    }, 450);
  };

  // Run on mount or when key dependencies change
  useEffect(() => {
    runSweep();
  }, [goal, maxPower, nodeLimit, inputs, outputs.requiredTops]);

  const handleApply = (cfg: DseConfiguration) => {
    onApplyConfig({
      processNode: cfg.processNode,
      powerBudget: Math.round(cfg.estimatedPowerW),
    });
    setAppliedId(cfg.id);
    setTimeout(() => setAppliedId(null), 3000);
  };

  return (
    <div id="dse-explorer-panel" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-widest flex items-center gap-2">
              DESIGN SPACE EXPLORER
              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded">SWEEP SOLVER</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Deterministic architectural parameter sweep over 2,500 combinations
            </p>
          </div>
        </div>
        <button
          onClick={runSweep}
          disabled={isSweeping}
          className="bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-all flex items-center gap-1.5"
        >
          {isSweeping ? (
            <>
              <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              SWEEPING...
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
              FORCE RE-RUN
            </>
          )}
        </button>
      </div>

      {/* Explorer Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/60 text-xs">
        {/* Goal */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sliders className="w-3 h-3 text-cyan-500" /> Optimization Goal
          </label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs p-2 rounded outline-none focus:border-cyan-500"
          >
            <option value="balanced">Balanced Efficiency</option>
            <option value="performance">Maximum Raw Performance (TOPS)</option>
            <option value="power">Minimum Cooling Power (Watts)</option>
            <option value="area">Smallest Silicon Area (Capex Cost)</option>
          </select>
        </div>

        {/* Node limitation */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-500" /> Process Constraint
          </label>
          <select
            value={nodeLimit}
            onChange={(e) => setNodeLimit(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs p-2 rounded outline-none focus:border-cyan-500"
          >
            <option value="any">Any node (28nm down to 3nm)</option>
            <option value="same">Force same node ({inputs.processNode})</option>
            <option value="advanced">Advanced Sub-10nm (7nm/5nm/3nm)</option>
          </select>
        </div>

        {/* Dynamic Sweep Power Budget */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1"><Battery className="w-3 h-3 text-cyan-500" /> Power Ceiling</span>
            <span className="text-cyan-400">{maxPower}W</span>
          </div>
          <input
            type="range"
            min="2"
            max="150"
            step="1"
            value={maxPower}
            onChange={(e) => setMaxPower(Number(e.target.value))}
            className="w-full accent-cyan-500 mt-1"
          />
          <div className="flex justify-between text-[8px] text-slate-600 font-mono">
            <span>2W (Wearable)</span>
            <span>15W (Automotive)</span>
            <span>150W (Cloud Server)</span>
          </div>
        </div>
      </div>

      {/* Explorer Results Container */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            TOP NOMINATED CHIP SPECIFICATIONS
          </span>
          <span className="text-[9px] font-mono text-slate-500">
            Sorted by relevance to {goal} goal
          </span>
        </div>

        {isSweeping ? (
          <div className="flex flex-col items-center justify-center h-52 text-slate-500 gap-3 font-mono bg-slate-950/30 rounded-xl border border-slate-800 border-dashed">
            <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] text-cyan-400 animate-pulse uppercase">Searching multi-dimensional grid array...</p>
          </div>
        ) : configs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 text-slate-500 gap-1 font-mono bg-slate-950/30 rounded-xl border border-slate-800 border-dashed">
            <p className="text-[11px] text-amber-500 uppercase font-bold">No candidate designs fit these constraints.</p>
            <p className="text-[9px] text-slate-600">Try relaxing the power ceiling or changing the process node limits.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configs.slice(0, 4).map((cfg, idx) => {
              const isBest = idx === 0;
              const isApplied = appliedId === cfg.id;

              return (
                <div
                  key={cfg.id}
                  className={`relative p-4 rounded-xl border transition-all flex flex-col justify-between overflow-hidden ${
                    isBest
                      ? "bg-slate-900 border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.15)]"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  {/* Rank Ribbon */}
                  <div className="absolute top-0 right-0 flex">
                    {isBest && (
                      <span className="text-[8px] bg-cyan-500 text-slate-950 font-mono font-extrabold px-2 py-0.5 rounded-bl uppercase tracking-widest shadow">
                        #1 Rank
                      </span>
                    )}
                    {!isBest && (
                      <span className="text-[8px] bg-slate-800 text-slate-400 font-mono px-1.5 py-0.5 rounded-bl">
                        #{idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Config Name */}
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold font-mono text-white leading-tight uppercase flex items-center gap-1.5">
                      {isBest && <Cpu className="w-3.5 h-3.5 text-cyan-400" />}
                      {cfg.name}
                    </h4>
                    <div className="flex gap-1.5 text-[8px] font-mono text-slate-400">
                      <span className="bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
                        BUS: {cfg.ddrType}
                      </span>
                      <span className="bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
                        FREQ: {cfg.frequencyGhz} GHz
                      </span>
                    </div>
                  </div>

                  {/* Core Scores Overview */}
                  <div className="grid grid-cols-3 gap-2 my-4 bg-slate-950 p-2.5 rounded-lg border border-slate-800/50">
                    <div className="text-center">
                      <span className="text-[8px] text-slate-500 font-mono block">PERF SCORE</span>
                      <span className="text-xs font-bold font-mono text-cyan-400">{cfg.perfScore}/100</span>
                    </div>
                    <div className="text-center border-x border-slate-800">
                      <span className="text-[8px] text-slate-500 font-mono block">THERMAL</span>
                      <span className={`text-xs font-bold font-mono ${cfg.powerScore < 50 ? "text-amber-500" : "text-emerald-400"}`}>
                        {cfg.powerScore}/100
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-[8px] text-slate-500 font-mono block">AREA/COST</span>
                      <span className="text-xs font-bold font-mono text-indigo-400">{cfg.areaScore}/100</span>
                    </div>
                  </div>

                  {/* Physical Outcomes */}
                  <div className="space-y-1.5 text-[10px] font-mono mb-4 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Peak Performance:</span>
                      <span className="text-white font-bold">{cfg.achievedTops} TOPS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Die Power:</span>
                      <span className="text-amber-400 font-bold">{cfg.estimatedPowerW} Watts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Silicon Size:</span>
                      <span className="text-indigo-300 font-bold">{cfg.estimatedAreaMm2} mm²</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/60 text-[9px]">
                      <span className="text-slate-500">Critical Bottleneck:</span>
                      <span className={`px-1.5 py-0.5 rounded uppercase font-bold text-[8px] ${
                        cfg.bottleneck === "Balanced"
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30"
                          : "bg-amber-950/40 text-amber-400 border border-amber-900/30"
                      }`}>
                        {cfg.bottleneck}
                      </span>
                    </div>
                  </div>

                  {/* Apply configuration button */}
                  <button
                    onClick={() => handleApply(cfg)}
                    className={`w-full py-2 font-mono text-[9px] font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 border ${
                      isApplied
                        ? "bg-emerald-600 text-white border-emerald-500"
                        : isBest
                        ? "bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-950/20"
                        : "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800"
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        CONFIGURATION APPLIED
                      </>
                    ) : (
                      <>
                        APPLY CONFIGURATION
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
