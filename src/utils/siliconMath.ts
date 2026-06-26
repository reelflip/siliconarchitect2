/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkloadInputs, EstimationOutputs } from "../types";
export type { WorkloadInputs, EstimationOutputs };


export function estimateAccelerator(inputs: WorkloadInputs): EstimationOutputs {
  const {
    workloadType,
    resolutionWidth = 1920,
    resolutionHeight = 1080,
    fps = 30,
    modelComplexity = "medium",
    powerBudget = 5,
    processNode = "7nm",
    llmParams = 7,
    llmTokensPerSec = 30,
    llmBatchSize = 1,
  } = inputs;

  // 1. Determine frequency based on Process Node (higher node = higher frequency)
  let frequencyGhz = 1.0;
  switch (processNode) {
    case "28nm":
      frequencyGhz = 0.55;
      break;
    case "16nm":
      frequencyGhz = 0.75;
      break;
    case "7nm":
      frequencyGhz = 1.0;
      break;
    case "5nm":
      frequencyGhz = 1.25;
      break;
    case "3nm":
      frequencyGhz = 1.45;
      break;
  }

  // Complexity multiplier
  const complexityMult = modelComplexity === "lite" ? 0.5 : modelComplexity === "medium" ? 1.0 : 2.5;

  // 2. Compute Demand (Required TOPS)
  let requiredTops = 0.1;
  let recommendedArchitecture = "Systolic Array Accelerator";

  if (workloadType === "resnet_classification") {
    // 0.005 GOPs per pixel per frame (ResNet-50-like)
    const gopsPerPixel = 0.005;
    const gopsPerFrame = (resolutionWidth * resolutionHeight * gopsPerPixel * complexityMult);
    requiredTops = (gopsPerFrame * fps) / 1000;
    recommendedArchitecture = "SIMD Vector Processor Core";
  } else if (workloadType === "cnn_object_detection") {
    // 0.035 GOPs per pixel per frame (YOLO-like)
    const gopsPerPixel = 0.035;
    const gopsPerFrame = (resolutionWidth * resolutionHeight * gopsPerPixel * complexityMult);
    requiredTops = (gopsPerFrame * fps) / 1000;
    recommendedArchitecture = "Systolic Array Accelerator";
  } else if (workloadType === "cnn_segmentation") {
    // 0.11 GOPs per pixel per frame (DeepLab-like)
    const gopsPerPixel = 0.11;
    const gopsPerFrame = (resolutionWidth * resolutionHeight * gopsPerPixel * complexityMult);
    requiredTops = (gopsPerFrame * fps) / 1000;
    recommendedArchitecture = "Hybrid Systolic + Vector NPU";
  } else if (workloadType === "transformer_llm" || workloadType === "transformer_vlm") {
    // 2 * Parameters * Tokens/Sec * Batch Size operations per second
    // 1 TOPS = 1000 GOPs
    requiredTops = (2 * llmParams * llmTokensPerSec * llmBatchSize) / 1000;
    recommendedArchitecture = "Transformer Tensor Core Engine";
  } else if (workloadType === "genai_diffusion") {
    // Diffusion runs multiple steps (e.g. 30 steps of U-Net)
    // 0.15 GOPs per pixel per step
    const gopsPerPixelStep = 0.12;
    const steps = 30;
    const gopsPerFrame = (resolutionWidth * resolutionHeight * gopsPerPixelStep * steps * complexityMult) / 1000;
    requiredTops = (gopsPerFrame * fps) / 1000;
    recommendedArchitecture = "High-Throughput Vector Tensor Processor";
  } else {
    // Custom / Default
    const gopsPerPixel = 0.02;
    const gopsPerFrame = (resolutionWidth * resolutionHeight * gopsPerPixel * complexityMult);
    requiredTops = (gopsPerFrame * fps) / 1000;
    recommendedArchitecture = "General Purpose NPU";
  }

  // Minimum required TOPS clamp
  requiredTops = Math.max(0.1, parseFloat(requiredTops.toFixed(3)));

  // 3. Hardware Utilization
  let utilization = 0.6; // average
  if (recommendedArchitecture.includes("Systolic")) {
    utilization = 0.68; // highly optimized for regular matrix multiplies
  } else if (recommendedArchitecture.includes("SIMD") || recommendedArchitecture.includes("Vector")) {
    utilization = 0.45; // lower utilization due to memory shuffling
  } else if (recommendedArchitecture.includes("Transformer")) {
    utilization = 0.58; // dynamic attention scaling, mixed overheads
  }

  // 4. Compute MAC Count
  // OPs = MACs * 2 * frequency * utilization
  // MACs = OPs / (2 * frequency * utilization)
  // OPs/s = requiredTops * 10^12
  const macCountRaw = (requiredTops * 1e12) / (2 * frequencyGhz * 1e9 * utilization);
  // Align to nearest multiple of 128 for realistic hardware design
  const macCount = Math.max(128, Math.round(macCountRaw / 128) * 128);

  // 5. SRAM Size Estimate (MB)
  let sramMb = 4;
  if (workloadType.startsWith("cnn") || workloadType === "resnet_classification") {
    const baseSram = workloadType === "resnet_classification" ? 4 : workloadType === "cnn_object_detection" ? 12 : 24;
    const resolutionFactor = Math.sqrt((resolutionWidth * resolutionHeight) / (1920 * 1080));
    sramMb = baseSram * complexityMult * resolutionFactor;
  } else if (workloadType.startsWith("transformer")) {
    // SRAM buffers weights slice + KV Cache
    // KV Cache = 2 * Layers(32) * Heads(32) * Dim(4096) * ContextLength(2048) * BatchSize * FP16 (2B) = 1.07 GB * BatchSize
    // On edge, context window is usually limited to 1024 or 2048, and SRAM only caches a small sliding window of weights.
    sramMb = 16 + (llmBatchSize * 12);
  } else {
    sramMb = 8 * complexityMult;
  }
  sramMb = Math.max(1, parseFloat(sramMb.toFixed(1)));

  // 6. DDR Bandwidth Estimate (GB/s)
  let ddrBandwidthGbs = 10;
  let arithmeticIntensity = 50; // OPs per byte transferred

  if (workloadType.startsWith("transformer")) {
    // Memory-bound: Read parameter weights once per token + KV cache traffic
    // INT8 quantization (1B params = 1GB weight)
    const weightSizeGb = llmParams * 1.0; 
    // Bandwidth = weightSize * tokenRate * batch_size / weight_reuse (which is batch_size)
    // Wait, weight reuse = batch_size because weight is fetched once from DDR and used for all batch items!
    // So DDR BW for weights = weightSizeGb * llmTokensPerSec. This is the beauty of batching!
    const weightDdrBandwidth = weightSizeGb * llmTokensPerSec;
    const kvCacheDdrBandwidth = llmBatchSize * 4.5 * (llmTokensPerSec / 30); // 4.5 GB/s per active stream at 30 tokens/s
    ddrBandwidthGbs = weightDdrBandwidth + kvCacheDdrBandwidth;
    arithmeticIntensity = (requiredTops * 1000) / ddrBandwidthGbs;
  } else {
    // Compute-bound (CNNs/Vision)
    // Arithmetic Intensity increases with SRAM size (higher caching = less DDR reloading)
    arithmeticIntensity = 45 * Math.log2(sramMb + 1);
    ddrBandwidthGbs = (requiredTops * 1000) / arithmeticIntensity;
  }
  ddrBandwidthGbs = Math.max(1.5, parseFloat(ddrBandwidthGbs.toFixed(1)));
  arithmeticIntensity = parseFloat(arithmeticIntensity.toFixed(1));

  // 7. Area Estimation (mm2)
  // Scaling factors per 1024 MACs and per MB SRAM based on process nodes
  let macAreaPer1024 = 1.2; // 28nm
  let sramAreaPerMb = 0.8;
  let logicBaseArea = 10; // peripheral logic

  switch (processNode) {
    case "28nm":
      macAreaPer1024 = 1.2;
      sramAreaPerMb = 0.8;
      logicBaseArea = 10;
      break;
    case "16nm":
      macAreaPer1024 = 0.55;
      sramAreaPerMb = 0.38;
      logicBaseArea = 5.5;
      break;
    case "7nm":
      macAreaPer1024 = 0.22;
      sramAreaPerMb = 0.16;
      logicBaseArea = 2.5;
      break;
    case "5nm":
      macAreaPer1024 = 0.13;
      sramAreaPerMb = 0.095;
      logicBaseArea = 1.6;
      break;
    case "3nm":
      macAreaPer1024 = 0.075;
      sramAreaPerMb = 0.055;
      logicBaseArea = 1.1;
      break;
  }

  const macArea = (macCount / 1024) * macAreaPer1024;
  const sramArea = sramMb * sramAreaPerMb;
  const estimatedAreaMm2 = parseFloat((logicBaseArea + macArea + sramArea).toFixed(2));

  // 8. Power Sizing (Watts)
  // Dynamic power coefficients (Watts per 1024 active MACs at 1.0 GHz)
  let dynamicMacCoef = 0.14; // 28nm
  let activeSramCoef = 0.025; // Watts per MB active
  let ddrPhyPowerCoef = 0.012; // Watts per GB/s bandwidth

  switch (processNode) {
    case "28nm":
      dynamicMacCoef = 0.14;
      activeSramCoef = 0.025;
      ddrPhyPowerCoef = 0.012;
      break;
    case "16nm":
      dynamicMacCoef = 0.065;
      activeSramCoef = 0.013;
      ddrPhyPowerCoef = 0.008;
      break;
    case "7nm":
      dynamicMacCoef = 0.022;
      activeSramCoef = 0.005;
      ddrPhyPowerCoef = 0.0045;
      break;
    case "5nm":
      dynamicMacCoef = 0.013;
      activeSramCoef = 0.003;
      ddrPhyPowerCoef = 0.003;
      break;
    case "3nm":
      dynamicMacCoef = 0.008;
      activeSramCoef = 0.002;
      ddrPhyPowerCoef = 0.0022;
      break;
  }

  const dynamicPowerW = (macCount / 1024) * dynamicMacCoef * (frequencyGhz / 1.0) * utilization;
  const memoryPowerW = (sramMb * activeSramCoef) + (ddrBandwidthGbs * ddrPhyPowerCoef);
  
  // Leakage scaling with process area (smaller node = lower overall leakage but higher density)
  let leakagePowerPerMm2 = 0.05;
  switch (processNode) {
    case "28nm": leakagePowerPerMm2 = 0.025; break;
    case "16nm": leakagePowerPerMm2 = 0.035; break;
    case "7nm": leakagePowerPerMm2 = 0.05; break;
    case "5nm": leakagePowerPerMm2 = 0.065; break;
    case "3nm": leakagePowerPerMm2 = 0.08; break;
  }
  const leakagePowerW = estimatedAreaMm2 * leakagePowerPerMm2;
  const estimatedPowerW = parseFloat((dynamicPowerW + memoryPowerW + leakagePowerW).toFixed(2));

  // 9. Check if power throttled
  const isPowerThrottled = estimatedPowerW > powerBudget;

  // 10. Bottleneck Analysis
  let bottleneckAnalysis = "";
  if (isPowerThrottled) {
    bottleneckAnalysis += `Power Budget Exceeded (${estimatedPowerW}W required vs ${powerBudget}W budget). `;
  }

  if (workloadType.startsWith("transformer")) {
    if (ddrBandwidthGbs > 300 && processNode !== "3nm" && processNode !== "5nm") {
      bottleneckAnalysis += "DRAM Bandwidth extreme bottleneck. Consider high-bandwidth memory (HBM3) or a smaller process node to improve efficiency. ";
    } else {
      bottleneckAnalysis += "Memory Bandwidth Bound (Autoregressive Weight Fetching). Performance depends heavily on DDR bus width and quantization. ";
    }
  } else {
    // CNN
    if (ddrBandwidthGbs > 120 && sramMb < 16) {
      bottleneckAnalysis += "Memory-bound due to low SRAM capacity. Increasing SRAM will improve arithmetic intensity and lower required memory bandwidth. ";
    } else {
      bottleneckAnalysis += "Compute-Bound (MACs are heavily utilized). Scaling MAC size is the most effective way to improve frame rates. ";
    }
  }

  if (bottleneckAnalysis === "") {
    bottleneckAnalysis = "Balanced design. No critical performance or thermal throttles detected at the specified power budget.";
  }

  return {
    requiredTops,
    frequencyGhz,
    utilization: parseFloat((utilization * 100).toFixed(0)),
    macCount,
    sramMb,
    ddrBandwidthGbs,
    arithmeticIntensity,
    estimatedAreaMm2,
    estimatedPowerW,
    dynamicPowerW: parseFloat(dynamicPowerW.toFixed(2)),
    leakagePowerW: parseFloat(leakagePowerW.toFixed(2)),
    memoryPowerW: parseFloat(memoryPowerW.toFixed(2)),
    recommendedArchitecture,
    isPowerThrottled,
    bottleneckAnalysis: bottleneckAnalysis.trim(),
  };
}
