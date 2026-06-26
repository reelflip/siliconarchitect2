/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WorkloadInputs {
  workloadType: string;
  resolutionWidth: number;
  resolutionHeight: number;
  fps: number;
  modelComplexity: "lite" | "medium" | "heavy";
  powerBudget: number;
  processNode: "28nm" | "16nm" | "7nm" | "5nm" | "3nm";
  llmParams?: number;
  llmTokensPerSec?: number;
  llmBatchSize?: number;
  customWeightsSizeMb?: number;
  customActivationsSizeMb?: number;
}

export interface EstimationOutputs {
  requiredTops: number;
  frequencyGhz: number;
  utilization: number;
  macCount: number;
  sramMb: number;
  ddrBandwidthGbs: number;
  arithmeticIntensity: number;
  estimatedAreaMm2: number;
  estimatedPowerW: number;
  dynamicPowerW: number;
  leakagePowerW: number;
  memoryPowerW: number;
  recommendedArchitecture: string;
  isPowerThrottled: boolean;
  bottleneckAnalysis: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface WorkloadProfile {
  id: string;
  name: string;
  description: string;
  isCustom?: boolean;
  workloadType: string;
  resolutionWidth: number;
  resolutionHeight: number;
  fps: number;
  modelComplexity: "lite" | "medium" | "heavy";
  llmParams?: number;
  llmTokensPerSec?: number;
  llmBatchSize?: number;
  customWeightsSizeMb?: number;
  customActivationsSizeMb?: number;
}

export interface DseConfiguration {
  id: string;
  name: string;
  macCount: number;
  sramMb: number;
  frequencyGhz: number;
  processNode: "28nm" | "16nm" | "7nm" | "5nm" | "3nm";
  ddrType: string;
  ddrBandwidthGbs: number;
  estimatedAreaMm2: number;
  estimatedPowerW: number;
  isPowerThrottled: boolean;
  achievedTops: number;
  perfScore: number; // relative to target workload performance
  powerScore: number; // how much power headroom remains
  areaScore: number; // physical cost score
  score: number; // aggregated score
  bottleneck: string;
}

export interface DseOptions {
  optimizationGoal: "balanced" | "power" | "performance" | "area";
  maxPowerBudget: number;
  processNodeLimit: "any" | "same" | "advanced";
}

