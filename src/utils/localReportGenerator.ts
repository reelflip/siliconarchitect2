/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkloadInputs, EstimationOutputs } from "../types";

export function generateLocalReport(inputs: WorkloadInputs, outputs: EstimationOutputs): string {
  const {
    workloadType,
    resolutionWidth,
    resolutionHeight,
    fps,
    modelComplexity,
    powerBudget,
    processNode,
    llmParams = 7,
    llmTokensPerSec = 30,
    llmBatchSize = 1,
  } = inputs;

  const workloadLabel = workloadType
    .replace(/_/g, " ")
    .toUpperCase();

  const isLlm = workloadType.startsWith("transformer");

  // Deterministic memory mapping offsets
  const baseAddress = "0x4000_0000";
  const weightsOffset = "0x0000_0000";
  const weightsSize = (outputs.sramMb * 0.4).toFixed(1);
  const actOffset = "0x0100_0000";
  const actSize = (outputs.sramMb * 0.45).toFixed(1);
  const instrOffset = "0x0200_0000";
  const instrSize = (outputs.sramMb * 0.05).toFixed(1);

  return `## HARDWARE ARCHITECTURE SPECIFICATION REVIEW
### REPORT ID: NPU-SPEC-${processNode.toUpperCase()}-${Math.floor(Math.random() * 90000 + 10000)}
**Target Workload:** ${workloadLabel} (${modelComplexity.toUpperCase()} model complexity)
**Manufacturing Process:** ${processNode} CMOS Silicon Core
**Cooling Budget limit:** ${powerBudget} W

---

## 1. SYSTEM INTERCONNECT & TOP-LEVEL DESIGN
This document reviews the RTL and floorplan specifications of the high-performance ${processNode} custom NPU core accelerator optimized for running **${workloadLabel}** workloads.

* **Target Compute Core:** ${outputs.macCount} MAC units running at **${outputs.frequencyGhz} GHz**
* **Peak Theoretical Performance:** ${(outputs.macCount * 2 * outputs.frequencyGhz / 1000).toFixed(2)} TOPS
* **Estimated Realized Performance:** ${outputs.requiredTops.toFixed(2)} TOPS at **${(outputs.utilization * 100).toFixed(0)}% utilization**
* **Arithmetic Intensity Required:** ${outputs.arithmeticIntensity.toFixed(1)} FLOP/Byte

\`\`\`verilog
// TOP-LEVEL PARAMETERIZED NPU RTL INTERFACE (Verilog 2001)
module npu_accelerator_top #(
    parameter integer MAC_COLS = ${Math.round(Math.sqrt(outputs.macCount))},
    parameter integer MAC_ROWS = ${Math.round(outputs.macCount / Math.round(Math.sqrt(outputs.macCount)))},
    parameter integer SRAM_SZ_MB = ${outputs.sramMb},
    parameter integer AXI_ADDR_WIDTH = 32,
    parameter integer AXI_DATA_WIDTH = 128
)(
    input  wire                       clk,
    input  wire                       rst_n,
    
    // AXI4-Lite Register Map Interface
    input  wire                       s_axi_awvalid,
    input  wire [AXI_ADDR_WIDTH-1:0]  s_axi_awaddr,
    output wire                       s_axi_awready,
    input  wire [31:0]                s_axi_wdata,
    input  wire                       s_axi_wvalid,
    output wire                       s_axi_wready,
    
    // High-Bandwidth AXI4 memory controller interface to DDR
    output wire [AXI_ADDR_WIDTH-1:0]  m_axi_araddr,
    output wire [7:0]                 m_axi_arlen,
    input  wire [AXI_DATA_WIDTH-1:0]  m_axi_rdata,
    input  wire                       m_axi_rvalid,
    output wire                       m_axi_rready
);
  // Parameter check
  initial begin
    $display("[NPU Spec] Instantiating %0d x %0d Systolic Matrix Core", MAC_COLS, MAC_ROWS);
    $display("[NPU Spec] Integrated Scratchpad Memory Size: %0d Megabytes", SRAM_SZ_MB);
  end
  
  // Custom execution controllers and scheduling units are wired below...
endmodule
\`\`\`

---

## 2. MEMORY MAP & REGISTER SPECIFICATIONS
The integrated **${outputs.sramMb} MB High-Density Scratchpad Memory** is partitioned statically to avoid execution bubbles and memory thrashing. Address offsets are mapped to the high-bandwidth on-chip cache controller.

### Memory Address Segmentation Table
* **Base physical memory pointer:** \`${baseAddress}\`
* **Weights Parameter segment:** Base offset \`+${weightsOffset}\` (Allocation: **${weightsSize} MB**)
* **Activation / Tensor buffer:** Base offset \`+${actOffset}\` (Allocation: **${actSize} MB**)
* **Instruction Ring buffer:** Base offset \`+${instrOffset}\` (Allocation: **${instrSize} MB**)

### AXI4-Lite Control Registers Map
* **0x00 (R/W):** CONTROL_REG (Bit 0: START, Bit 1: RESET, Bit 2: CLOCK_GATE_EN)
* **0x04 (R):** STATUS_REG (Bit 0: BUSY, Bit 1: DONE, Bit 2: CACHE_MISS_FAULT, Bit 3: THERMAL_TRIP)
* **0x08 (R/W):** WEIGHT_BASE_ADDR_REG (Points to weight matrices source pointer)
* **0x0C (R/W):** ACTIVATION_BASE_ADDR_REG (Points to input/output activation maps)
* **0x10 (R/W):** KERNEL_SIZE_REG (Dimension of matrix grid block processing)

---

## 3. ESTIMATED SILICON AREA & DIE BUDGETS
Calculated using empirical PDK modeling coefficients for the selected **${processNode}** lithography process node.

* **Compute Array Area:** ${((outputs.macCount / 1024) * (processNode === "28nm" ? 1.2 : processNode === "16nm" ? 0.55 : processNode === "7nm" ? 0.22 : 0.13)).toFixed(2)} mm²
* **SRAM Buffer Area:** ${(outputs.sramMb * (processNode === "28nm" ? 0.8 : processNode === "16nm" ? 0.38 : processNode === "7nm" ? 0.16 : 0.09)).toFixed(2)} mm²
* **Total Estimated Die Area:** **${outputs.estimatedAreaMm2} mm²**
* **Recommended Package:** Flip-Chip Ball Grid Array (FC-BGA 484-pin)

---

## 4. POWER EFFICIENCY & THERMAL THRESHOLDS
* **Estimated Dynamic Power consumption:** **${outputs.dynamicPowerW.toFixed(2)} Watts** (utilizing clock-gating vectors)
* **Estimated Memory interface power:** **${outputs.memoryPowerW.toFixed(2)} Watts** (SRAM banks + LPDDR PHY)
* **Estimated Static Leakage power:** **${outputs.leakagePowerW.toFixed(2)} Watts** (based on standard threshold voltage cells)
* **Aggregated Thermal Dissipation:** **${outputs.estimatedPowerW.toFixed(2)} Watts**

${outputs.isPowerThrottled ? `
⚠️ **WARNING: THERMAL ENVELOPE OVERRUN**
Your total power requirement (${outputs.estimatedPowerW.toFixed(2)}W) exceeds the design cooling budget (${powerBudget}W). Hardware will implement automatic dynamic voltage and frequency scaling (DVFS) to scale down current execution by **${Math.ceil((1 - powerBudget/outputs.estimatedPowerW) * 100)}%** to prevent physical junction damage.
` : `
✅ **DESIGN THERMAL COMPLIANT**
The overall power footprint (${outputs.estimatedPowerW.toFixed(2)}W) is well within the allotted thermal envelope (${powerBudget}W). You have **${(powerBudget - outputs.estimatedPowerW).toFixed(2)} Watts** of margin for future clock-boosting profiles.
`}

---

## 5. ARCHITECTURAL CRITICAL BOTTLENECK ANALYSIS
${outputs.bottleneckAnalysis}
`;
}
