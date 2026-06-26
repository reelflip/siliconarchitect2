/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkloadInputs, EstimationOutputs, DseConfiguration, DseOptions } from "../types";

export interface DdrSpec {
  type: string;
  pinSpeedGbps: number;
  busWidthBits: number;
  bandwidthGbs: number;
  basePowerW: number;
  powerPerGbsW: number; // energy efficiency coefficient
}

export const DDR_CATALOG: DdrSpec[] = [
  { type: "LPDDR4", pinSpeedGbps: 3.2, busWidthBits: 32, bandwidthGbs: 12.8, basePowerW: 0.15, powerPerGbsW: 0.012 },
  { type: "LPDDR5", pinSpeedGbps: 6.4, busWidthBits: 64, bandwidthGbs: 51.2, basePowerW: 0.25, powerPerGbsW: 0.007 },
  { type: "GDDR6", pinSpeedGbps: 16.0, busWidthBits: 128, bandwidthGbs: 256.0, basePowerW: 0.95, powerPerGbsW: 0.005 },
  { type: "HBM2e", pinSpeedGbps: 3.2, busWidthBits: 1024, bandwidthGbs: 410.0, basePowerW: 1.5, powerPerGbsW: 0.0035 },
  { type: "HBM3", pinSpeedGbps: 6.4, busWidthBits: 1024, bandwidthGbs: 819.0, basePowerW: 2.2, powerPerGbsW: 0.0022 },
];

export function runDesignSpaceExploration(
  inputs: WorkloadInputs,
  currentOutputs: EstimationOutputs,
  options: DseOptions
): DseConfiguration[] {
  const targetTops = currentOutputs.requiredTops;
  const targetPowerBudget = options.maxPowerBudget || inputs.powerBudget;
  const currentProcessNode = inputs.processNode;

  // 1. Generate design space candidates
  const nodes: ("28nm" | "16nm" | "7nm" | "5nm" | "3nm")[] = [];
  if (options.processNodeLimit === "same") {
    nodes.push(currentProcessNode);
  } else if (options.processNodeLimit === "advanced") {
    // Only advanced sub-10nm nodes
    nodes.push("7nm", "5nm", "3nm");
  } else {
    // any node
    nodes.push("28nm", "16nm", "7nm", "5nm", "3nm");
  }

  // MAC Count sweep around target, rounded to nice steps
  const macBase = currentOutputs.macCount;
  const macSweepFactors = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0];
  const macCandidateSet = new Set<number>();
  macSweepFactors.forEach(f => {
    const raw = macBase * f;
    const aligned = Math.max(128, Math.round(raw / 128) * 128);
    macCandidateSet.add(aligned);
  });
  // Add some default standard steps if set is small
  [512, 1024, 2048, 4096, 8192, 16384].forEach(m => macCandidateSet.add(m));
  const macCandidates = Array.from(macCandidateSet).sort((a, b) => a - b);

  // SRAM sizes sweep (MB)
  const sramCandidates = [2, 4, 8, 12, 16, 24, 32, 48, 64];

  // Frequency candidates (GHz) per node
  const frequencyMap: Record<string, number[]> = {
    "28nm": [0.4, 0.5, 0.6],
    "16nm": [0.6, 0.75, 0.9],
    "7nm": [0.8, 1.0, 1.2],
    "5nm": [1.0, 1.25, 1.4],
    "3nm": [1.2, 1.45, 1.6],
  };

  const results: DseConfiguration[] = [];

  // 2. Multi-dimensional grid search
  for (const node of nodes) {
    const freqs = frequencyMap[node] || [1.0];
    for (const freq of freqs) {
      for (const mac of macCandidates) {
        for (const sram of sramCandidates) {
          for (const ddr of DDR_CATALOG) {
            // Quick physical check: High-speed HBM or GDDR6 makes little sense on 28nm planar due to physical pad layout limits.
            if (node === "28nm" && (ddr.type.startsWith("HBM") || ddr.type === "GDDR6")) continue;
            // High MAC (>8192) on 28nm is physically impossible or extremely hot
            if (node === "28nm" && mac > 4096) continue;

            // Compute peak theoretical TOPS
            const peakTops = (2 * mac * freq) / 1000;

            // Determine utilization factor
            let utilization = 0.6;
            if (currentOutputs.recommendedArchitecture.includes("Systolic")) {
              utilization = 0.68;
            } else if (currentOutputs.recommendedArchitecture.includes("SIMD") || currentOutputs.recommendedArchitecture.includes("Vector")) {
              utilization = 0.45;
            } else if (currentOutputs.recommendedArchitecture.includes("Transformer")) {
              utilization = 0.58;
            }

            // Memory bottle necking math
            // Arithmetic intensity scales with SRAM size (greater reuse with larger scratchpad)
            let arithmeticIntensity = currentOutputs.arithmeticIntensity;
            if (!inputs.workloadType.startsWith("transformer")) {
              arithmeticIntensity = 45 * Math.log2(sram + 1);
            }

            // Ideal DDR bandwidth required at peak performance
            const idealBwRequired = (peakTops * 1000) / arithmeticIntensity;

            // Actual achieved bandwidth is capped by the selected DDR spec
            const actualBwGbs = Math.min(idealBwRequired, ddr.bandwidthGbs);

            // Achieved TOPS is limited by bandwidth if we are memory bound
            let achievedTops = peakTops;
            let bottleneck = "Balanced";

            if (idealBwRequired > ddr.bandwidthGbs) {
              // Memory bound
              achievedTops = (ddr.bandwidthGbs * arithmeticIntensity) / 1000;
              bottleneck = "DRAM Bandwidth Bound";
            } else if (mac * 2 * freq * utilization / 1e3 < targetTops) {
              bottleneck = "Compute Core Limited";
            }

            achievedTops = Math.max(0.1, parseFloat(achievedTops.toFixed(3)));

            // Area calculation
            let macAreaPer1024 = 0.22;
            let sramAreaPerMb = 0.16;
            let logicBaseArea = 2.5;

            switch (node) {
              case "28nm": macAreaPer1024 = 1.2; sramAreaPerMb = 0.8; logicBaseArea = 10; break;
              case "16nm": macAreaPer1024 = 0.55; sramAreaPerMb = 0.38; logicBaseArea = 5.5; break;
              case "7nm": macAreaPer1024 = 0.22; sramAreaPerMb = 0.16; logicBaseArea = 2.5; break;
              case "5nm": macAreaPer1024 = 0.13; sramAreaPerMb = 0.095; logicBaseArea = 1.6; break;
              case "3nm": macAreaPer1024 = 0.075; sramAreaPerMb = 0.055; logicBaseArea = 1.1; break;
            }

            const macArea = (mac / 1024) * macAreaPer1024;
            const sramArea = sram * sramAreaPerMb;
            const estimatedAreaMm2 = parseFloat((logicBaseArea + macArea + sramArea).toFixed(2));

            // Power calculation
            let dynamicMacCoef = 0.022;
            let activeSramCoef = 0.005;

            switch (node) {
              case "28nm": dynamicMacCoef = 0.14; activeSramCoef = 0.025; break;
              case "16nm": dynamicMacCoef = 0.065; activeSramCoef = 0.013; break;
              case "7nm": dynamicMacCoef = 0.022; activeSramCoef = 0.005; break;
              case "5nm": dynamicMacCoef = 0.013; activeSramCoef = 0.003; break;
              case "3nm": dynamicMacCoef = 0.008; activeSramCoef = 0.002; break;
            }

            const dynamicPowerW = (mac / 1024) * dynamicMacCoef * freq * utilization;
            const sramPowerW = sram * activeSramCoef;
            const ddrPowerW = ddr.basePowerW + (actualBwGbs * ddr.powerPerGbsW);
            const memoryPowerW = sramPowerW + ddrPowerW;

            let leakagePowerPerMm2 = 0.05;
            switch (node) {
              case "28nm": leakagePowerPerMm2 = 0.025; break;
              case "16nm": leakagePowerPerMm2 = 0.035; break;
              case "7nm": leakagePowerPerMm2 = 0.05; break;
              case "5nm": leakagePowerPerMm2 = 0.065; break;
              case "3nm": leakagePowerPerMm2 = 0.08; break;
            }
            const leakagePowerW = estimatedAreaMm2 * leakagePowerPerMm2;
            const estimatedPowerW = parseFloat((dynamicPowerW + memoryPowerW + leakagePowerW).toFixed(2));

            // Power Budget Check
            const isPowerThrottled = estimatedPowerW > targetPowerBudget;

            // Scoring Metrics
            // Performance score: How close are we to target? Capped at 120 points.
            let perfScore = (achievedTops / targetTops) * 100;
            if (perfScore > 100) {
              perfScore = 100 + Math.min(20, (perfScore - 100) * 0.1); // slow marginal returns for excess TOPS
            }

            // Power score: Under budget is excellent. Exceeding is penalized heavily.
            let powerScore = 100;
            if (isPowerThrottled) {
              const overrunRatio = estimatedPowerW / targetPowerBudget;
              powerScore = Math.max(0, 100 - (overrunRatio - 1) * 300); // sharp penalty
            } else {
              // Reward having extra power headroom
              const margin = (targetPowerBudget - estimatedPowerW) / targetPowerBudget;
              powerScore = 60 + (margin * 40);
            }

            // Area / Cost score: Smaller silicon is cheaper.
            // Under 10 mm2 is awesome, over 100 mm2 is expensive.
            const areaScore = Math.max(10, Math.min(100, 100 - (estimatedAreaMm2 / 1.5)));

            // Aggregated Score
            let score = 0;
            switch (options.optimizationGoal) {
              case "performance":
                score = (perfScore * 0.70) + (powerScore * 0.15) + (areaScore * 0.15);
                break;
              case "power":
                score = (perfScore * 0.15) + (powerScore * 0.70) + (areaScore * 0.15);
                break;
              case "area":
                score = (perfScore * 0.15) + (powerScore * 0.15) + (areaScore * 0.70);
                break;
              case "balanced":
              default:
                score = (perfScore * 0.40) + (powerScore * 0.30) + (areaScore * 0.30);
                break;
            }

            // Filter out configurations that are totally unusable (e.g. extremely over budget or extremely underperforming)
            if (isPowerThrottled && estimatedPowerW > targetPowerBudget * 1.5) continue; // too power hungry
            if (achievedTops < targetTops * 0.25) continue; // way too slow

            // Label/Name the configuration
            let sizeLabel = "Micro";
            if (mac >= 8192) sizeLabel = "Enterprise Ultra";
            else if (mac >= 4096) sizeLabel = "Pro Studio";
            else if (mac >= 2048) sizeLabel = "Standard Edge";
            else if (mac >= 1024) sizeLabel = "IoT Lite";

            const name = `${node} ${sizeLabel} (${(mac/1024).toFixed(0)}k MACs, ${sram}MB SRAM)`;

            results.push({
              id: `${node}-${mac}-${sram}-${ddr.type}-${freq}`,
              name,
              macCount: mac,
              sramMb: sram,
              frequencyGhz: freq,
              processNode: node,
              ddrType: ddr.type,
              ddrBandwidthGbs: parseFloat(actualBwGbs.toFixed(1)),
              estimatedAreaMm2,
              estimatedPowerW,
              isPowerThrottled,
              achievedTops,
              perfScore: Math.round(perfScore),
              powerScore: Math.round(powerScore),
              areaScore: Math.round(areaScore),
              score: Math.round(score),
              bottleneck,
            });
          }
        }
      }
    }
  }

  // Sort by score descending and return Top 6
  return results.sort((a, b) => b.score - a.score).slice(0, 6);
}
