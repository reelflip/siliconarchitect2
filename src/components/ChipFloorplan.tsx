/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { EstimationOutputs, WorkloadInputs } from "../types";
import { Cpu, Database, Activity, Shuffle, Thermometer, Flame, Maximize2, Minimize2, X } from "lucide-react";

interface ChipFloorplanProps {
  inputs: WorkloadInputs;
  outputs: EstimationOutputs;
}

export const ChipFloorplan: React.FC<ChipFloorplanProps> = ({ inputs, outputs }) => {
  const {
    sramMb,
    macCount,
    ddrBandwidthGbs,
    estimatedAreaMm2,
    recommendedArchitecture,
    processNode,
  } = outputs;

  const [isThermalMode, setIsThermalMode] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  // Calculate relative ratios for visual floorplan allocation
  const sramUnits = sramMb;
  const macUnits = macCount / 512;

  const totalUnits = sramUnits + macUnits + 8; // +8 for control/peripherals
  const sramPercent = Math.max(15, Math.min(65, (sramUnits / totalUnits) * 100));
  const macPercent = Math.max(20, Math.min(70, (macUnits / totalUnits) * 100));
  const controlPercent = 100 - sramPercent - macPercent;

  // Number of memory controllers based on DDR bandwidth
  const numDdrPhys = Math.max(1, Math.min(4, Math.ceil(ddrBandwidthGbs / 40)));

  // Physical saturation / thermal throttling model:
  // Heat dissipation, fans, or thermal throttling (DVFS) prevents temperatures from rising infinitely.
  // Throttling starts around 85°C and pushes the temperature to saturate gracefully below 115°C under absolute maximum load.
  const clampTemp = (rawTemp: number) => {
    if (rawTemp <= 85) {
      return Math.max(30, Math.round(rawTemp));
    }
    const maxCeiling = 115;
    const delta = rawTemp - 85;
    const saturatedDelta = (maxCeiling - 85) * Math.tanh(delta / (maxCeiling - 85));
    return Math.round(85 + saturatedDelta);
  };

  // Thermodynamic modeling estimates based on real power densities and active thermal throttling / cooling dissipation
  const baseTemp = 30; // Ambient / Idle chassis temperature
  
  // Localized heat generation based on local block power dissipation & thermal resistance (Rth_ja)
  const macRawTemp = baseTemp + (outputs.dynamicPowerW * 4.2) + (outputs.leakagePowerW * 1.5);
  const sramRawTemp = baseTemp + (outputs.memoryPowerW * 1.8) + (outputs.leakagePowerW * 0.8);
  // DDR PHY temperature rises with bandwidth, but modern high-performance memory controllers use low-power PHYs (e.g. LPDDR5/HBM).
  // Total DDR PHY power is capped or scales logarithmically with multi-channel efficiency, so we use a non-linear scaling.
  const ddrPowerScale = Math.log10(ddrBandwidthGbs + 1) * 8; // Logarithmic growth of memory interface power
  const ddrRawTemp = baseTemp + ddrPowerScale + (outputs.memoryPowerW * 1.2);
  const ctrlRawTemp = baseTemp + (outputs.frequencyGhz * 3.5) + (outputs.leakagePowerW * 0.5);

  const macTemp = clampTemp(macRawTemp);
  const sramTemp = clampTemp(sramRawTemp);
  const ddrTemp = clampTemp(ddrRawTemp);
  const ctrlTemp = clampTemp(ctrlRawTemp);

  const getThermalProfile = (temp: number) => {
    if (temp < 45) {
      return {
        bg: "bg-teal-950/40",
        border: "border-teal-500/50",
        text: "text-teal-400",
        glow: "rgba(20, 184, 166, 0.12)",
        label: "Cool",
      };
    }
    if (temp < 60) {
      return {
        bg: "bg-emerald-950/40",
        border: "border-emerald-500/50",
        text: "text-emerald-400",
        glow: "rgba(16, 185, 129, 0.15)",
        label: "Nominal",
      };
    }
    if (temp < 78) {
      return {
        bg: "bg-amber-950/40",
        border: "border-amber-500/50",
        text: "text-amber-400",
        glow: "rgba(245, 158, 11, 0.18)",
        label: "Warm",
      };
    }
    if (temp < 95) {
      return {
        bg: "bg-orange-950/50",
        border: "border-orange-500/60",
        text: "text-orange-400",
        glow: "rgba(249, 115, 22, 0.25)",
        label: "Hot",
      };
    }
    return {
      bg: "bg-red-950/60",
      border: "border-red-500/80 animate-pulse",
      text: "text-red-400 font-bold",
      glow: "rgba(239, 68, 68, 0.35)",
      label: "CRITICAL",
    };
  };

  const macProfile = getThermalProfile(macTemp);
  const sramProfile = getThermalProfile(sramTemp);
  const ddrProfile = getThermalProfile(ddrTemp);
  const ctrlProfile = getThermalProfile(ctrlTemp);

  return (
    <div id="chip-floorplan-container" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-inner">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-semibold text-slate-300 font-mono flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          SILICON FLOORPLAN VISUALIZER
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsThermalMode(!isThermalMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-[10px] font-bold transition-all ${
              isThermalMode
                ? "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
            }`}
          >
            {isThermalMode ? (
              <>
                <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                THERMAL OVERLAY: ON
              </>
            ) : (
              <>
                <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                SHOW THERMAL MAP
              </>
            )}
          </button>
          <button
            onClick={() => setIsZoomed(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-750 font-mono text-[10px] font-bold transition-all"
            title="Zoom Floorplan"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>ZOOM</span>
          </button>
        </div>
      </div>

      {/* Main Silicon Die Layout */}
      <div className="relative w-full aspect-video bg-slate-950 border-2 border-slate-700 rounded-lg p-3 overflow-hidden flex flex-col justify-between transition-all">
        {/* Subtle silicon circuit lines background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Top Memory PHY Row */}
        <div className="flex justify-around gap-2 mb-2">
          {Array.from({ length: numDdrPhys }).map((_, i) => (
            <motion.div
              key={`ddr-top-${i}`}
              className={`text-[9px] font-mono px-3 py-1.5 rounded flex items-center justify-center gap-1.5 flex-1 transition-all ${
                isThermalMode
                  ? `${ddrProfile.bg} border ${ddrProfile.border} ${ddrProfile.text}`
                  : "bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
              }`}
              style={
                isThermalMode
                  ? { boxShadow: `0 0 15px ${ddrProfile.glow}` }
                  : undefined
              }
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Database className="w-2.5 h-2.5 text-cyan-400" />
              <span>DDR PHY {i + 1}</span>
              {isThermalMode ? (
                <span className="font-bold border-l border-current pl-1">{ddrTemp}°C</span>
              ) : (
                <span className="opacity-80">({Math.round(ddrBandwidthGbs / numDdrPhys)} GB/s)</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Central Core Fabric */}
        <div className="flex-1 flex gap-2 min-h-0">
          {/* SRAM Block */}
          <motion.div
            id="sram-block-visual"
            className={`border rounded p-2 flex flex-col justify-between min-h-0 relative group cursor-pointer transition-all ${
              isThermalMode
                ? `${sramProfile.bg} ${sramProfile.border}`
                : "border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-950/40"
            }`}
            style={{
              width: `${sramPercent}%`,
              boxShadow: isThermalMode ? `0 0 20px ${sramProfile.glow}` : undefined,
            }}
            layout
          >
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-[linear-gradient(45deg,transparent_25%,#10b981_25%,#10b981_50%,transparent_50%,transparent_75%,#10b981_75%,#10b981)] bg-[length:10px_10px]"></div>
            <div>
              <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${isThermalMode ? sramProfile.text : "text-emerald-400"}`}>
                <Database className="w-3 h-3" /> SRAM BUFFER
              </span>
              <p className="text-[9px] text-slate-400 font-mono mt-1">L2 SCRATCHPAD</p>
            </div>
            <div className="text-right">
              {isThermalMode ? (
                <div className="font-mono">
                  <p className={`text-sm font-black ${sramProfile.text}`}>{sramTemp}°C</p>
                  <p className="text-[8px] text-slate-500 uppercase">{sramProfile.label}</p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-emerald-300 font-mono">{sramMb} MB</p>
                  <p className="text-[8px] text-slate-500 font-mono">{(sramPercent).toFixed(0)}% area</p>
                </>
              )}
            </div>
          </motion.div>

          {/* Compute Core Array */}
          <motion.div
            id="mac-block-visual"
            className={`border rounded p-2 flex flex-col justify-between min-h-0 relative group cursor-pointer transition-all ${
              isThermalMode
                ? `${macProfile.bg} ${macProfile.border}`
                : "border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-950/40"
            }`}
            style={{
              width: `${macPercent}%`,
              boxShadow: isThermalMode ? `0 0 25px ${macProfile.glow}` : undefined,
            }}
            layout
          >
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-[radial-gradient(#06b6d4_1.5px,transparent_1.5px)] [background-size:8px_8px]"></div>
            <div>
              <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${isThermalMode ? macProfile.text : "text-cyan-400"}`}>
                <Cpu className="w-3 h-3" /> COMPUTE CORE
              </span>
              <p className="text-[9px] text-slate-400 font-mono mt-1 truncate">{recommendedArchitecture}</p>
            </div>
            <div className="text-right">
              {isThermalMode ? (
                <div className="font-mono">
                  <p className={`text-sm font-black ${macProfile.text}`}>{macTemp}°C</p>
                  <p className="text-[8px] text-slate-500 uppercase">{macProfile.label}</p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-cyan-300 font-mono">{macCount.toLocaleString()} MACs</p>
                  <p className="text-[8px] text-slate-500 font-mono">{(macPercent).toFixed(0)}% area</p>
                </>
              )}
            </div>
          </motion.div>

          {/* Control Unit */}
          <motion.div
            id="control-block-visual"
            className={`border rounded p-2 flex flex-col justify-between min-h-0 relative group cursor-pointer transition-all ${
              isThermalMode
                ? `${ctrlProfile.bg} ${ctrlProfile.border}`
                : "border-amber-500/30 bg-amber-950/30 hover:bg-amber-950/40"
            }`}
            style={{
              width: `${controlPercent}%`,
              boxShadow: isThermalMode ? `0 0 20px ${ctrlProfile.glow}` : undefined,
            }}
            layout
          >
            <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#b45309_1px,transparent_1px)] bg-[size:12px]"></div>
            <div>
              <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${isThermalMode ? ctrlProfile.text : "text-amber-400"}`}>
                <Shuffle className="w-3 h-3" /> CONTROL UNIT
              </span>
              <p className="text-[9px] text-slate-400 font-mono mt-1">AGU & DECODE</p>
            </div>
            <div className="text-right">
              {isThermalMode ? (
                <div className="font-mono">
                  <p className={`text-sm font-black ${ctrlProfile.text}`}>{ctrlTemp}°C</p>
                  <p className="text-[8px] text-slate-500 uppercase">{ctrlProfile.label}</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-bold text-amber-300 font-mono">VEC / ALU</p>
                  <p className="text-[8px] text-slate-500 font-mono">{(controlPercent).toFixed(0)}% area</p>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Die Edge Frame / Info bar */}
        <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-[9px] text-slate-500 font-mono">
          <span>DIE_ID_ACCEL_X0</span>
          {isThermalMode ? (
            <span className="text-amber-500 font-bold flex items-center gap-1">
              <Thermometer className="w-3 h-3 animate-pulse" /> THERMALLY ACTIVE SENSORS
            </span>
          ) : (
            <span className="text-slate-400">CLK FREQ: {outputs.frequencyGhz} GHz</span>
          )}
          <span>FAB_UTIL: {outputs.utilization}%</span>
        </div>
      </div>

      {/* Thermography Legend Bar */}
      {isThermalMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 bg-slate-950 border border-slate-800 rounded p-3"
        >
          <div className="flex justify-between text-[8px] text-slate-500 font-mono mb-1 uppercase tracking-wider">
            <span>Thermal Junction Range</span>
            <span>Scale Coefficient (°C)</span>
          </div>
          <div className="h-2 w-full rounded bg-gradient-to-right bg-gradient-to-r from-teal-500 via-emerald-500 via-amber-500 via-orange-500 to-red-500 relative mb-2"></div>
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Cool (&lt;45°C)</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Nom (&lt;60°C)</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Warm (&lt;78°C)</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Hot (&lt;95°C)</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span> Crit (95°C+)</span>
          </div>
        </motion.div>
      )}

      {/* Zoom / Full-screen Floorplan Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col gap-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold font-mono uppercase text-white tracking-wider">
                    High-Fidelity Silicon Die Visualizer ({processNode} Node)
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">ESTIMATED DIE AREA: {estimatedAreaMm2} mm²</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsThermalMode(!isThermalMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-[10px] font-bold transition-all ${
                    isThermalMode
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                  }`}
                >
                  {isThermalMode ? (
                    <>
                      <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      THERMAL MAP: ACTIVE
                    </>
                  ) : (
                    <>
                      <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                      SHOW THERMAL MAP
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsZoomed(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 font-mono text-[10px] font-bold transition-all"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>CLOSE</span>
                </button>
              </div>
            </div>

            {/* Main Silicon Die Layout (ENLARGED) */}
            <div className="relative w-full aspect-[21/9] bg-slate-950 border-2 border-slate-700 rounded-xl p-5 overflow-hidden flex flex-col justify-between transition-all">
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(#06b6d4_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>

              {/* Top Memory PHY Row */}
              <div className="flex justify-around gap-3 mb-3">
                {Array.from({ length: numDdrPhys }).map((_, i) => (
                  <motion.div
                    key={`ddr-modal-${i}`}
                    className={`text-[10px] font-mono px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 flex-1 transition-all ${
                      isThermalMode
                        ? `${ddrProfile.bg} border ${ddrProfile.border} ${ddrProfile.text}`
                        : "bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                    }`}
                    style={
                      isThermalMode ? { boxShadow: `0 0 20px ${ddrProfile.glow}` } : undefined
                    }
                  >
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold">DDR CONTROLLER {i + 1}</span>
                    {isThermalMode ? (
                      <span className="font-extrabold border-l border-current pl-2 text-xs">{ddrTemp}°C</span>
                    ) : (
                      <span className="opacity-80">({Math.round(ddrBandwidthGbs / numDdrPhys)} GB/s)</span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Middle Blocks */}
              <div className="flex gap-3 h-full min-h-0">
                {/* SRAM Block */}
                <motion.div
                  className={`border rounded-lg p-3.5 flex flex-col justify-between min-h-0 relative group cursor-pointer transition-all ${
                    isThermalMode
                      ? `${sramProfile.bg} ${sramProfile.border}`
                      : "border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-950/40"
                  }`}
                  style={{
                    width: `${sramPercent}%`,
                    boxShadow: isThermalMode ? `0 0 25px ${sramProfile.glow}` : undefined,
                  }}
                  layout
                >
                  <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity bg-[linear-gradient(45deg,transparent_25%,#10b981_25%,#10b981_50%,transparent_50%,transparent_75%,#10b981_75%,#10b981)] bg-[length:12px_12px]"></div>
                  <div className="relative">
                    <span className={`text-[11px] font-mono font-bold flex items-center gap-1.5 ${isThermalMode ? sramProfile.text : "text-emerald-400"}`}>
                      <Database className="w-4 h-4" /> SRAM BUFFER
                    </span>
                    <p className="text-[9px] text-slate-400 font-mono mt-1">ON-CHIP WORKLOAD MEMORY</p>
                  </div>
                  <div className="relative">
                    {isThermalMode ? (
                      <div className="font-mono">
                        <p className={`text-base font-black ${sramProfile.text}`}>{sramTemp}°C</p>
                        <p className="text-[9px] text-slate-500 uppercase">{sramProfile.label}</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-emerald-300 font-mono">{sramMb} MB</p>
                        <p className="text-[9px] text-slate-500 font-mono">{(sramPercent).toFixed(1)}% area</p>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* COMPUTE BLOCK */}
                <motion.div
                  className={`border rounded-lg p-3.5 flex flex-col justify-between min-h-0 relative group cursor-pointer transition-all ${
                    isThermalMode
                      ? `${macProfile.bg} ${macProfile.border}`
                      : "border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-950/40"
                  }`}
                  style={{
                    width: `${macPercent}%`,
                    boxShadow: isThermalMode ? `0 0 30px ${macProfile.glow}` : undefined,
                  }}
                  layout
                >
                  <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity bg-[radial-gradient(#06b6d4_2px,transparent_2px)] [background-size:12px_12px]"></div>
                  <div className="relative">
                    <span className={`text-[11px] font-mono font-bold flex items-center gap-1.5 ${isThermalMode ? macProfile.text : "text-cyan-400"}`}>
                      <Cpu className="w-4 h-4" /> COMPUTE ARRAY (NPU)
                    </span>
                    <p className="text-[9px] text-slate-400 font-mono mt-1 truncate">{recommendedArchitecture}</p>
                  </div>
                  <div className="relative">
                    {isThermalMode ? (
                      <div className="font-mono">
                        <p className={`text-base font-black ${macProfile.text}`}>{macTemp}°C</p>
                        <p className="text-[9px] text-slate-500 uppercase">{macProfile.label}</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-cyan-300 font-mono">{macCount.toLocaleString()} SYSTOLIC MACs</p>
                        <p className="text-[9px] text-slate-500 font-mono">{(macPercent).toFixed(1)}% area</p>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* CONTROL BLOCK */}
                <motion.div
                  className={`border rounded-lg p-3.5 flex flex-col justify-between min-h-0 relative group cursor-pointer transition-all ${
                    isThermalMode
                      ? `${ctrlProfile.bg} ${ctrlProfile.border}`
                      : "border-amber-500/30 bg-amber-950/30 hover:bg-amber-950/40"
                  }`}
                  style={{
                    width: `${controlPercent}%`,
                    boxShadow: isThermalMode ? `0 0 25px ${ctrlProfile.glow}` : undefined,
                  }}
                  layout
                >
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#b45309_1.5px,transparent_1.5px)] bg-[size:16px]"></div>
                  <div className="relative">
                    <span className={`text-[11px] font-mono font-bold flex items-center gap-1.5 ${isThermalMode ? ctrlProfile.text : "text-amber-400"}`}>
                      <Shuffle className="w-4 h-4" /> CONTROL UNIT
                    </span>
                    <p className="text-[9px] text-slate-400 font-mono mt-1">AGU, INSTRUCTION DECODE, VECTOR ALU</p>
                  </div>
                  <div className="relative">
                    {isThermalMode ? (
                      <div className="font-mono">
                        <p className={`text-base font-black ${ctrlProfile.text}`}>{ctrlTemp}°C</p>
                        <p className="text-[9px] text-slate-500 uppercase">{ctrlProfile.label}</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-amber-300 font-mono">VEC / ALU</p>
                        <p className="text-[9px] text-slate-500 font-mono">{(controlPercent).toFixed(1)}% area</p>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Bottom Edge Info */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>CHIP_REVISION_1.0 // DIE_X0Y0_NPU</span>
                {isThermalMode ? (
                  <span className="text-amber-500 font-bold flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 animate-pulse text-amber-400" /> ACTIVE CHIP JUNCTION MONITORING SENSORS
                  </span>
                ) : (
                  <span className="text-slate-400">CLOCK TARGET FREQUENCY: {outputs.frequencyGhz} GHz</span>
                )}
                <span>FABRIC UTILIZATION: {outputs.utilization}%</span>
              </div>
            </div>

            {/* Scale Legends */}
            {isThermalMode && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                <div className="flex justify-between text-[9px] text-slate-500 font-mono mb-2 uppercase tracking-wider font-bold">
                  <span>Thermal Silicon Sensor Range</span>
                  <span>Temperature Profile scale</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 via-amber-500 via-orange-500 to-red-500 relative mb-3"></div>
                <div className="flex justify-between text-[10px] font-mono text-slate-300">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400"></span> Cool (&lt;45°C)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Nominal (&lt;60°C)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Warm (&lt;78°C)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Hot (&lt;95°C)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span> CRITICAL (95°C+)</span>
                </div>
              </div>
            )}

            {/* Extra details of model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                <h4 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">Silicon Node Constants</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                  <div>Process Technology Node:</div>
                  <div className="text-slate-200 font-bold">{inputs.processNode} GAA/FinFET</div>
                  <div>Power Budget Target:</div>
                  <div className="text-slate-200 font-bold">{inputs.powerBudget} Watts</div>
                  <div>Recommended Microarchitecture:</div>
                  <div className="text-slate-200 font-bold">{recommendedArchitecture}</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">Thermodynamic Analysis Remarks</h4>
                <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                  The thermal behavior is modeled deterministically from core dynamic load power and leakage coefficient. Current peak temperature of <span className="text-amber-400 font-bold">{macTemp}°C</span> is located in the compute core due to high density of systolic multipliers. Keep node packaging thermal resistance low or limit clock speed if it exceeds 95°C.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      <div className="mt-3 bg-slate-950 border border-slate-800 rounded p-3">
        <h5 className="text-xs font-semibold text-slate-400 font-mono mb-1">DETERMINISTIC SILICON METRICS</h5>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex justify-between border-b border-slate-900 pb-1">
            <span className="text-slate-500">Node Leakage:</span>
            <span className="text-slate-300">{outputs.leakagePowerW} W</span>
          </div>
          <div className="flex justify-between border-b border-slate-900 pb-1">
            <span className="text-slate-500">Core Dynamic:</span>
            <span className="text-slate-300">{outputs.dynamicPowerW} W</span>
          </div>
          <div className="flex justify-between border-b border-slate-900 pb-1 text-cyan-400">
            <span className="text-slate-500">DRAM Traffic:</span>
            <span>{ddrBandwidthGbs} GB/s</span>
          </div>
          <div className="flex justify-between border-b border-slate-900 pb-1 text-emerald-400">
            <span className="text-slate-500">SRAM Caching:</span>
            <span>{sramMb} MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
