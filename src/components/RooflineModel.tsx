/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { WorkloadInputs, EstimationOutputs } from "../types";
import { Info, HelpCircle, Activity, Maximize2, Minimize2 } from "lucide-react";

interface RooflineModelProps {
  inputs: WorkloadInputs;
  outputs: EstimationOutputs;
}

export const RooflineModel: React.FC<RooflineModelProps> = ({ inputs, outputs }) => {
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const {
    requiredTops,
    macCount,
    frequencyGhz,
    ddrBandwidthGbs,
    arithmeticIntensity,
    recommendedArchitecture,
  } = outputs;

  // Calculate Peak Theoretical TOPS of this hardware configuration
  const peakTops = (macCount * 2 * frequencyGhz) / 1000;
  
  // Intersection point is where: Peak TOPS = (ddrBandwidthGbs * AI) / 1000
  // AI_knee = (Peak TOPS * 1000) / ddrBandwidthGbs = (2 * macCount * frequencyGhz) / ddrBandwidthGbs
  const kneePointAi = (peakTops * 1000) / ddrBandwidthGbs;

  // Determine current region
  const isMemoryBound = arithmeticIntensity < kneePointAi;

  // Map coordinates to a logarithmic-like spacing SVG viewport
  // X-axis (Arithmetic Intensity): 1 to 500
  // Y-axis (TOPS): 0 to PeakTops * 1.4
  const svgWidth = 480;
  const svgHeight = 260;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Log scale conversion helpers
  const minX = 1;
  const maxX = 1000;
  const logMinX = Math.log10(minX);
  const logMaxX = Math.log10(maxX);

  const getXCoord = (val: number) => {
    const clamped = Math.max(minX, Math.min(maxX, val));
    const ratio = (Math.log10(clamped) - logMinX) / (logMaxX - logMinX);
    return paddingLeft + ratio * chartWidth;
  };

  const minY = 0.05;
  const maxY = Math.max(10, peakTops * 1.5);
  const logMinY = Math.log10(minY);
  const logMaxY = Math.log10(maxY);

  const getYCoord = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    const ratio = (Math.log10(clamped) - logMinY) / (logMaxY - logMinY);
    // In SVG, y=0 is at the top, so we subtract from bottom
    return svgHeight - paddingBottom - ratio * chartHeight;
  };

  // Generate SVG path for the Roofline boundaries
  // Slope line from (minX, memory tops at minX) to (kneePointAi, peakTops)
  const xStart = minX;
  const yStart = (ddrBandwidthGbs * xStart) / 1000;
  const xKnee = kneePointAi;
  const yKnee = peakTops;
  const xEnd = maxX;
  const yEnd = peakTops;

  const pathD = `
    M ${getXCoord(xStart)} ${getYCoord(yStart)}
    L ${getXCoord(xKnee)} ${getYCoord(yKnee)}
    L ${getXCoord(xEnd)} ${getYCoord(yEnd)}
  `;

  // Workload active coordinate
  const currentX = getXCoord(arithmeticIntensity);
  const currentY = getYCoord(requiredTops);

  return (
    <div id="roofline-model-root" className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-rose-400" /> Roofline Analysis (PPA Bounds)
        </h4>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
            isMemoryBound
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          }`}>
            {isMemoryBound ? "Memory Bandwidth Bound" : "Compute / Core Bound"}
          </span>
          <button
            onClick={() => setIsZoomed(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-750 font-mono text-[9px] font-bold transition-all"
            title="Zoom Roofline Model"
          >
            <Maximize2 className="w-3 h-3 text-rose-400" />
            <span>ZOOM</span>
          </button>
        </div>
      </div>

      <div className="relative bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 overflow-hidden">
        {/* Responsive Roofline Graph */}
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto text-slate-600">
          {/* Grid lines (Logarithmic guides for X-axis) */}
          {[1, 10, 100, 1000].map((tick) => {
            const cx = getXCoord(tick);
            return (
              <g key={`x-grid-${tick}`}>
                <line
                  x1={cx}
                  y1={paddingTop}
                  x2={cx}
                  y2={svgHeight - paddingBottom}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={cx}
                  y={svgHeight - paddingBottom + 12}
                  fill="#64748b"
                  fontSize="8"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Grid lines (Logarithmic guides for Y-axis) */}
          {[0.1, 1, 10, 100, 1000].filter(t => t <= maxY).map((tick) => {
            const cy = getYCoord(tick);
            return (
              <g key={`y-grid-${tick}`}>
                <line
                  x1={paddingLeft}
                  y1={cy}
                  x2={svgWidth - paddingRight}
                  y2={cy}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={paddingLeft - 6}
                  y={cy + 3}
                  fill="#64748b"
                  fontSize="8"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line
            x1={paddingLeft}
            y1={svgHeight - paddingBottom}
            x2={svgWidth - paddingRight}
            y2={svgHeight - paddingBottom}
            stroke="#334155"
            strokeWidth="1.5"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={svgHeight - paddingBottom}
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Memory-Bound Shaded Region */}
          <path
            d={`
              M ${paddingLeft} ${svgHeight - paddingBottom}
              L ${getXCoord(xStart)} ${getYCoord(yStart)}
              L ${getXCoord(xKnee)} ${getYCoord(yKnee)}
              L ${getXCoord(xKnee)} ${svgHeight - paddingBottom}
              Z
            `}
            fill="rgba(245, 158, 11, 0.04)"
          />

          {/* Compute-Bound Shaded Region */}
          <path
            d={`
              M ${getXCoord(xKnee)} ${svgHeight - paddingBottom}
              L ${getXCoord(xKnee)} ${getYCoord(yKnee)}
              L ${getXCoord(xEnd)} ${getYCoord(yEnd)}
              L ${getXCoord(xEnd)} ${svgHeight - paddingBottom}
              Z
            `}
            fill="rgba(16, 185, 129, 0.04)"
          />

          {/* Boundary Roofline Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#475569"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Slope line accent (DRAM Speed representation) */}
          <path
            d={`M ${getXCoord(xStart)} ${getYCoord(yStart)} L ${getXCoord(xKnee)} ${getYCoord(yKnee)}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Peak ceiling line accent (Compute engine representation) */}
          <path
            d={`M ${getXCoord(xKnee)} ${getYCoord(yKnee)} L ${getXCoord(xEnd)} ${getYCoord(yEnd)}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Active Operating Point */}
          <g>
            {/* Soft pulsing ring */}
            <circle
              cx={currentX}
              cy={currentY}
              r="7"
              fill={isMemoryBound ? "rgba(245, 158, 11, 0.25)" : "rgba(16, 185, 129, 0.25)"}
              className="animate-ping"
              style={{ transformOrigin: `${currentX}px ${currentY}px` }}
            />
            {/* Center solid indicator */}
            <circle
              cx={currentX}
              cy={currentY}
              r="4.5"
              fill={isMemoryBound ? "#f59e0b" : "#10b981"}
              stroke="#0f172a"
              strokeWidth="1.5"
            />
          </g>

          {/* X and Y Axes Titles */}
          <text
            x={svgWidth / 2 + 10}
            y={svgHeight - 6}
            fill="#94a3b8"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
          >
            ARITHMETIC INTENSITY (OPs / Byte)
          </text>

          <text
            transform={`rotate(-90) translate(${-svgHeight / 2 + 10}, 10)`}
            fill="#94a3b8"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
          >
            PERFORMANCE (TOPS)
          </text>

          {/* Roof labels inside graph */}
          <text
            x={getXCoord(maxX) - 10}
            y={getYCoord(peakTops) - 7}
            fill="#10b981"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="end"
          >
            COMPUTE CEILING: {peakTops.toFixed(1)} TOPS
          </text>
          
          <text
            x={getXCoord(minX) + 15}
            y={getYCoord(yStart) - 15}
            fill="#f59e0b"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="bold"
            transform={`rotate(-28, ${getXCoord(minX) + 15}, ${getYCoord(yStart) - 15})`}
          >
            MEM BANDWIDTH: {ddrBandwidthGbs} GB/s
          </text>
        </svg>

        {/* Labels overlay */}
        <div className="absolute top-2 left-2 flex gap-2">
          <span className="text-[7.5px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            Knee-point AI: {kneePointAi.toFixed(1)} OPs/B
          </span>
          <span className="text-[7.5px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            Workload AI: {arithmeticIntensity} OPs/B
          </span>
        </div>
      </div>

      {/* Explanatory text */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 flex items-start gap-2 text-[11px] font-mono leading-relaxed">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-slate-300 font-bold">
            {isMemoryBound ? "⚠️ Memory-Bound Bottleneck Identified" : "✅ Compute-Bound Architecture Confirmed"}
          </p>
          <p className="text-slate-500 mt-1">
            {isMemoryBound
              ? `Your design sits left of the architectural knee-point (${kneePointAi.toFixed(1)} OPs/B). The MAC array will experience execution stalls because the DRAM interface (${ddrBandwidthGbs} GB/s) cannot feed weights/activations fast enough. Increasing SRAM or batching will help.`
              : `Your design sits right of the knee-point. The core is compute-bound. The MAC units are highly utilized. To boost framerates further, you must increase the MAC multipliers or raise the clock frequency.`}
          </p>
        </div>
      </div>

      {/* Zoom / Full-screen Roofline Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col gap-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-rose-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold font-mono uppercase text-white tracking-wider">
                    High-Fidelity Roofline Model & Operational Bound Analysis
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    DESIGN BOTTLENECK REGION: <span className={isMemoryBound ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>{isMemoryBound ? "MEMORY BANDWIDTH BOUND" : "COMPUTE ENGINE BOUND"}</span>
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsZoomed(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 font-mono text-[10px] font-bold transition-all"
              >
                <Minimize2 className="w-3.5 h-3.5 text-rose-400" />
                <span>CLOSE</span>
              </button>
            </div>

            {/* Enlarged Roofline Graph */}
            <div className="relative bg-slate-950 p-6 rounded-xl border border-slate-800/80 overflow-hidden shadow-inner flex flex-col md:flex-row gap-6 items-center">
              
              {/* SVG Section */}
              <div className="flex-1 w-full max-w-2xl">
                <svg viewBox="0 0 480 260" className="w-full h-auto text-slate-600">
                  {/* Grid lines (Logarithmic guides for X-axis) */}
                  {[1, 10, 100, 1000].map((tick) => {
                    const cx = getXCoord(tick);
                    return (
                      <g key={`x-grid-modal-${tick}`}>
                        <line
                          x1={cx}
                          y1={paddingTop}
                          x2={cx}
                          y2={svgHeight - paddingBottom}
                          stroke="#1e293b"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                        <text
                          x={cx}
                          y={svgHeight - paddingBottom + 12}
                          fill="#64748b"
                          fontSize="8"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {tick}
                        </text>
                      </g>
                    );
                  })}

                  {/* Grid lines (Logarithmic guides for Y-axis) */}
                  {[0.1, 1, 10, 100, 1000].filter(t => t <= maxY).map((tick) => {
                    const cy = getYCoord(tick);
                    return (
                      <g key={`y-grid-modal-${tick}`}>
                        <line
                          x1={paddingLeft}
                          y1={cy}
                          x2={svgWidth - paddingRight}
                          y2={cy}
                          stroke="#1e293b"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                        <text
                          x={paddingLeft - 6}
                          y={cy + 3}
                          fill="#64748b"
                          fontSize="8"
                          textAnchor="end"
                          fontFamily="monospace"
                        >
                          {tick}
                        </text>
                      </g>
                    );
                  })}

                  {/* Axes */}
                  <line
                    x1={paddingLeft}
                    y1={svgHeight - paddingBottom}
                    x2={svgWidth - paddingRight}
                    y2={svgHeight - paddingBottom}
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={paddingLeft}
                    y1={paddingTop}
                    x2={paddingLeft}
                    y2={svgHeight - paddingBottom}
                    stroke="#334155"
                    strokeWidth="1.5"
                  />

                  {/* Memory-Bound Shaded Region */}
                  <path
                    d={`
                      M ${paddingLeft} ${svgHeight - paddingBottom}
                      L ${getXCoord(xStart)} ${getYCoord(yStart)}
                      L ${getXCoord(xKnee)} ${getYCoord(yKnee)}
                      L ${getXCoord(xKnee)} ${svgHeight - paddingBottom}
                      Z
                    `}
                    fill="rgba(245, 158, 11, 0.05)"
                  />

                  {/* Compute-Bound Shaded Region */}
                  <path
                    d={`
                      M ${getXCoord(xKnee)} ${svgHeight - paddingBottom}
                      L ${getXCoord(xKnee)} ${getYCoord(yKnee)}
                      L ${getXCoord(xEnd)} ${getYCoord(yEnd)}
                      L ${getXCoord(xEnd)} ${svgHeight - paddingBottom}
                      Z
                    `}
                    fill="rgba(16, 185, 129, 0.05)"
                  />

                  {/* Boundary Roofline Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#475569"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Slope line accent (DRAM Speed representation) */}
                  <path
                    d={`M ${getXCoord(xStart)} ${getYCoord(yStart)} L ${getXCoord(xKnee)} ${getYCoord(yKnee)}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.9"
                  />

                  {/* Peak ceiling line accent (Compute engine representation) */}
                  <path
                    d={`M ${getXCoord(xKnee)} ${getYCoord(yKnee)} L ${getXCoord(xEnd)} ${getYCoord(yEnd)}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.9"
                  />

                  {/* Active Operating Point */}
                  <g>
                    {/* Soft pulsing ring */}
                    <circle
                      cx={currentX}
                      cy={currentY}
                      r="9"
                      fill={isMemoryBound ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.3)"}
                      className="animate-ping"
                      style={{ transformOrigin: `${currentX}px ${currentY}px` }}
                    />
                    {/* Center solid indicator */}
                    <circle
                      cx={currentX}
                      cy={currentY}
                      r="5.5"
                      fill={isMemoryBound ? "#f59e0b" : "#10b981"}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                  </g>

                  {/* X and Y Axes Titles */}
                  <text
                    x={svgWidth / 2 + 10}
                    y={svgHeight - 6}
                    fill="#94a3b8"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    ARITHMETIC INTENSITY (OPs / Byte)
                  </text>

                  <text
                    transform={`rotate(-90) translate(${-svgHeight / 2 + 10}, 10)`}
                    fill="#94a3b8"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    PERFORMANCE (TOPS)
                  </text>

                  {/* Roof labels inside graph */}
                  <text
                    x={getXCoord(maxX) - 10}
                    y={getYCoord(peakTops) - 7}
                    fill="#10b981"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    COMPUTE CEILING: {peakTops.toFixed(1)} TOPS
                  </text>
                  
                  <text
                    x={getXCoord(minX) + 15}
                    y={getYCoord(yStart) - 15}
                    fill="#f59e0b"
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                    transform={`rotate(-28, ${getXCoord(minX) + 15}, ${getYCoord(yStart) - 15})`}
                  >
                    MEM BANDWIDTH: {ddrBandwidthGbs} GB/s
                  </text>
                </svg>
              </div>

              {/* Side Parameters panel inside modal */}
              <div className="w-full md:w-80 bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col gap-3 font-mono text-xs">
                <h4 className="text-slate-300 font-bold border-b border-slate-800 pb-1.5 uppercase text-[10px]">OPERATING POINT VALUES</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Arithmetic Intensity:</span>
                    <span className="text-cyan-400 font-bold">{arithmeticIntensity} OPs/B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Required NPU Performance:</span>
                    <span className="text-cyan-400 font-bold">{requiredTops.toFixed(1)} TOPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Knee-point Boundary:</span>
                    <span className="text-amber-500 font-bold">{kneePointAi.toFixed(1)} OPs/B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Peak Theoretical TOPS:</span>
                    <span className="text-emerald-400 font-bold">{peakTops.toFixed(1)} TOPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Memory Bandwidth:</span>
                    <span className="text-emerald-400 font-bold">{ddrBandwidthGbs} GB/s</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10.5px] leading-relaxed text-slate-400 mt-2">
                  <p className="font-bold text-slate-300 mb-1">Architectural Guide:</p>
                  {isMemoryBound ? (
                    <span>The operational roof slope represents the DRAM limits. Since your workload is memory bound, you can only raise performance by increasing memory channel widths, utilizing compression, or aggressively caches.</span>
                  ) : (
                    <span>The horizontal roof is the peak compute potential of your MAC engine. Since your workload is compute bound, you have optimal DRAM utilization; any further performance boosts must come from accelerating the clock or packing more multipliers.</span>
                  )}
                </div>
              </div>

            </div>

            {/* Extra detailed guidance */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-mono leading-relaxed space-y-2">
              <span className="text-rose-400 font-bold uppercase block tracking-wider">Understanding the Roofline Model</span>
              <p className="text-slate-400">
                The Roofline model visualizes hardware performance limits in relation to the operational intensity of neural network layers. Under-utilization happens when workloads are bound to memory transfers instead of operations, creating bubbles in the systolic array pipeline. A balanced accelerator aligns the workload arithmetic intensity with the hardware's knee-point to maximize performance efficiency while lowering thermal dissipated power.
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
