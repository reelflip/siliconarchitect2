/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { WorkloadInputs, EstimationOutputs } from "../types";
import { Sliders, HelpCircle, AlertCircle, Percent, Coins, Cpu } from "lucide-react";

interface WaferYieldCalculatorProps {
  inputs: WorkloadInputs;
  outputs: EstimationOutputs;
}

export const WaferYieldCalculator: React.FC<WaferYieldCalculatorProps> = ({ inputs, outputs }) => {
  const { estimatedAreaMm2, processNode } = outputs;
  
  const [defectDensity, setDefectDensity] = useState<number>(0.08); // defects/cm²
  const [waferCostOverride, setWaferCostOverride] = useState<number | null>(null);

  // 1. Determine wafer cost based on process node if not overridden
  const getBaseWaferCost = (node: string) => {
    switch (node) {
      case "28nm": return 3000;
      case "16nm": return 5000;
      case "7nm": return 11500;
      case "5nm": return 17000;
      case "3nm": return 24000;
      default: return 5000;
    }
  };

  const waferCost = waferCostOverride !== null ? waferCostOverride : getBaseWaferCost(inputs.processNode);

  // 2. Dies Per Wafer (DPW) calculation (using standard 300mm / 12-inch wafer diameter)
  const waferDiameterMm = 300;
  const dieAreaMm2 = estimatedAreaMm2;
  
  // DPW formula accounts for edge exclusion and partial edge dies
  const rawDpw = (Math.PI * Math.pow(waferDiameterMm, 2)) / (4 * dieAreaMm2) - 
                 (Math.PI * waferDiameterMm) / Math.sqrt(2 * dieAreaMm2);
  const dpw = Math.max(1, Math.floor(rawDpw));

  // 3. Silicon Yield calculation (Murphy / Seeds exponential defect distribution model)
  // S in cm² = dieAreaMm2 / 100
  const S_cm2 = dieAreaMm2 / 100;
  const defectProduct = defectDensity * S_cm2;
  
  let yieldPercentage = 100;
  if (defectProduct > 0) {
    // Murphy model: Y = ((1 - e^(-D0*S)) / (D0*S))^2
    const expTerm = Math.exp(-defectProduct);
    yieldPercentage = Math.pow((1 - expTerm) / defectProduct, 2) * 100;
  }
  
  const goodDiesPerWafer = Math.max(0, Math.round(dpw * (yieldPercentage / 100)));
  const costPerDie = goodDiesPerWafer > 0 ? waferCost / goodDiesPerWafer : waferCost;

  return (
    <div id="wafer-yield-calculator" className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 font-mono text-xs text-slate-300">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-emerald-400 animate-spin-slow" /> Wafer Yield & Silicon Costing
        </h4>
        <span className="text-[9px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded font-bold border border-indigo-900/40">
          300mm / 12&quot; Wafer
        </span>
      </div>

      {/* Inputs sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-3.5 rounded-lg border border-slate-800/60">
        <div className="space-y-1.5">
          <div className="flex justify-between font-bold text-slate-400">
            <span>Defect Density (D₀)</span>
            <span className="text-emerald-400">{defectDensity.toFixed(2)}/cm²</span>
          </div>
          <input
            type="range"
            min="0.02"
            max="0.25"
            step="0.01"
            value={defectDensity}
            onChange={(e) => setDefectDensity(parseFloat(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-[8px] text-slate-600">
            <span>0.02 (Class-10 cleanroom)</span>
            <span>0.25 (Initial pilot line)</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between font-bold text-slate-400">
            <span>Wafer Fab Cost</span>
            <span className="text-cyan-400">${waferCost.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="1500"
            max="35000"
            step="500"
            value={waferCost}
            onChange={(e) => setWaferCostOverride(parseInt(e.target.value))}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-[8px] text-slate-600">
            <span>$1.5K (Legacy legacy)</span>
            <span>$35K (Extremely advanced 3nm)</span>
          </div>
        </div>
      </div>

      {/* Main calculation scores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 text-center">
          <span className="text-[8px] text-slate-500 block">TOTAL DIES/WAFER</span>
          <span className="text-base font-black text-white mt-1 block">{dpw}</span>
          <span className="text-[8.5px] text-slate-600 uppercase">Gross DPW</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 text-center">
          <span className="text-[8px] text-slate-500 block">SILICON YIELD %</span>
          <span className="text-base font-black text-emerald-400 mt-1 block flex items-center justify-center gap-0.5">
            {yieldPercentage.toFixed(1)}<Percent className="w-3.5 h-3.5 shrink-0" />
          </span>
          <span className="text-[8.5px] text-slate-600 uppercase">Murphy Model</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 text-center">
          <span className="text-[8px] text-slate-500 block">GOOD DIES/WAFER</span>
          <span className="text-base font-black text-indigo-400 mt-1 block">{goodDiesPerWafer}</span>
          <span className="text-[8.5px] text-slate-600 uppercase">KGD (Known Good)</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 text-center">
          <span className="text-[8px] text-slate-500 block">DIE COST EST.</span>
          <span className="text-base font-black text-cyan-400 mt-1 block">
            ${costPerDie.toFixed(2)}
          </span>
          <span className="text-[8.5px] text-slate-600 uppercase">Per processed die</span>
        </div>
      </div>

      {/* Warnings & Advice */}
      {dieAreaMm2 > 250 && (
        <div className="bg-red-950/20 border border-red-900/40 p-3 rounded-lg text-[10.5px] leading-relaxed text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <div>
            <span className="font-bold">⚠️ Large Die Penalty Alert (Reticle Limit Pressure)</span>
            <p className="text-slate-500 mt-0.5">
              Your estimated silicon area ({dieAreaMm2} mm²) is quite large. Large dies suffer exponentially lower yields ({yieldPercentage.toFixed(1)}%) because a single silicon crystal point defect will ruin the whole die. Consider partitioning into multiple chiplets or reducing on-chip SRAM to improve profit margins.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
