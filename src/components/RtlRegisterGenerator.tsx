/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { WorkloadInputs, EstimationOutputs } from "../types";
import { Terminal, Copy, Check, Code2, Cpu } from "lucide-react";

interface RtlRegisterGeneratorProps {
  inputs: WorkloadInputs;
  outputs: EstimationOutputs;
}

export const RtlRegisterGenerator: React.FC<RtlRegisterGeneratorProps> = ({ inputs, outputs }) => {
  const [busType, setBusType] = useState<"AXI4-Lite" | "APB">("AXI4-Lite");
  const [addressWidth, setAddressWidth] = useState<32 | 64>(32);
  const [baseAddress, setBaseAddress] = useState<string>("0x40000000");
  const [activeTab, setActiveTab] = useState<"verilog" | "cheader">("verilog");
  const [copied, setCopied] = useState<boolean>(false);

  const { macCount, sramMb, frequencyGhz, utilization } = outputs;

  // Render synthesizable register map
  const generateVerilog = () => {
    return `// ====================================================================
// COMPANY: Silicon AI Labs
// FILE: npu_csr_regs.v
// DESCRIPTION: Auto-generated Address Decoder & CSR registers block
// PROTOCOL: ${busType} Interface (${addressWidth}-bit addressing)
// BASE ADDRESS: ${baseAddress}
// ====================================================================

\`timescale 1ns / 1ps

module npu_csr_regs #(
    parameter ADDR_WIDTH = ${addressWidth},
    parameter DATA_WIDTH = 32
)(
    input  wire                  clk,
    input  wire                  rst_n,

    // ${busType} Interface Ports
    input  wire [ADDR_WIDTH-1:0] s_addr,
    input  wire                  s_write,
    input  wire                  s_valid,
    input  wire [DATA_WIDTH-1:0] s_wdata,
    output reg  [DATA_WIDTH-1:0] s_rdata,
    output reg                   s_ready,

    // Core Hardware Configuration signals
    output reg  [15:0]           cfg_mac_multipliers,
    output reg  [15:0]           cfg_sram_mb_allocation,
    output reg  [31:0]           cfg_freq_khz,
    output reg  [7:0]            cfg_utilization_target,
    output reg                   npu_start,
    input  wire                  npu_busy,
    input  wire                  npu_done
);

    // Register Offsets Mapping
    localparam REG_CONTROL        = 8'h00; // [0] Start, [1] Interrupt Enable
    localparam REG_STATUS         = 8'h04; // [0] Busy,  [1] Done
    localparam REG_MAC_COUNT      = 8'h08; // Multipliers (Static readout: ${macCount})
    localparam REG_SRAM_ALLOC     = 8'h0C; // L2 buffer size MB: ${sramMb}
    localparam REG_FREQ_TARGET    = 8'h10; // Clock target kHz: ${Math.round(frequencyGhz * 1000000)}
    localparam REG_UTILIZATION    = 8'h14; // Utilization percent: ${utilization}

    // Internal Registers State
    reg [DATA_WIDTH-1:0] ctrl_reg;
    reg                  start_pulse;

    // Output Wire Assignments
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            cfg_mac_multipliers     <= 16'd${macCount};
            cfg_sram_mb_allocation  <= 16'd${Math.floor(sramMb)};
            cfg_freq_khz            <= 32'd${Math.round(frequencyGhz * 1000000)};
            cfg_utilization_target  <= 8'd${utilization};
            ctrl_reg                <= 32'd0;
            npu_start               <= 1'b0;
        end else begin
            npu_start <= start_pulse;
            
            if (s_valid && s_write) begin
                case (s_addr[7:0])
                    REG_CONTROL: begin
                        ctrl_reg <= s_wdata;
                        start_pulse <= s_wdata[0]; // Self-clearing start pulse
                    end
                    // Read-only configurations cannot be written
                    default: ;
                endcase
            end else begin
                start_pulse <= 1'b0;
            end
        end
    end

    // Read Logic Decoder
    always @(*) begin
        s_rdata = 32'd0;
        case (s_addr[7:0])
            REG_CONTROL:     s_rdata = ctrl_reg;
            REG_STATUS:      s_rdata = {30'd0, npu_done, npu_busy};
            REG_MAC_COUNT:   s_rdata = {16'd0, cfg_mac_multipliers};
            REG_SRAM_ALLOC:  s_rdata = {16'd0, cfg_sram_mb_allocation};
            REG_FREQ_TARGET: s_rdata = cfg_freq_khz;
            REG_UTILIZATION: s_rdata = {24'd0, cfg_utilization_target};
            default:         s_rdata = 32'hDEADBEEF; // Address mismatch code
        endcase
    end

    // Protocol Ready Signaling
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            s_ready <= 1'b0;
        end else begin
            s_ready <= s_valid; // Handshake completed instantly in single cycle
        end
    end

endmodule
`;
  };

  const generateCHeader = () => {
    return `/**
 * ====================================================================
 * COMPANY: Silicon AI Labs
 * FILE: npu_csr_regs.h
 * DESCRIPTION: C Hardware Register Address Map & Bitfields Definition
 * PROTOCOL: ${busType} Interface (${addressWidth}-bit addressing)
 * BASE ADDRESS: ${baseAddress}
 * ====================================================================
 */

#ifndef NPU_CSR_REGS_H
#define NPU_CSR_REGS_H

#include <stdint.h>

#define NPU_BASE_ADDR            (${baseAddress}ULL)

/* Register Offsets */
#define NPU_REG_CONTROL_OFFSET   (0x00)
#define NPU_REG_STATUS_OFFSET    (0x04)
#define NPU_REG_MAC_COUNT_OFFSET (0x08)
#define NPU_REG_SRAM_ALLOC_OFFSET (0x0C)
#define NPU_REG_FREQ_KHZ_OFFSET  (0x10)
#define NPU_REG_UTIL_OFFSET      (0x14)

/* Absolute Register Addresses */
#define NPU_REG_CONTROL          ((volatile uint32_t*)(NPU_BASE_ADDR + NPU_REG_CONTROL_OFFSET))
#define NPU_REG_STATUS           ((volatile uint32_t*)(NPU_BASE_ADDR + NPU_REG_STATUS_OFFSET))
#define NPU_REG_MAC_COUNT        ((volatile uint32_t*)(NPU_BASE_ADDR + NPU_REG_MAC_COUNT_OFFSET))
#define NPU_REG_SRAM_ALLOC       ((volatile uint32_t*)(NPU_BASE_ADDR + NPU_REG_SRAM_ALLOC_OFFSET))
#define NPU_REG_FREQ_KHZ         ((volatile uint32_t*)(NPU_BASE_ADDR + NPU_REG_FREQ_KHZ_OFFSET))
#define NPU_REG_UTIL             ((volatile uint32_t*)(NPU_BASE_ADDR + NPU_REG_UTIL_OFFSET))

/* Control Bitfields */
#define NPU_CTRL_START           (1 << 0)  /**< Write 1 to initiate tensor computation */
#define NPU_CTRL_INT_EN          (1 << 1)  /**< 1: Enable Done Interrupt Signaling */

/* Status Bitfields */
#define NPU_STAT_BUSY            (1 << 0)  /**< 1: Systolic arrays currently running */
#define NPU_STAT_DONE            (1 << 1)  /**< 1: Execution complete. Pending Interrupt Clear */

/* Current Silicon Specifics */
#define NPU_HARDWARE_MAC_COUNT   (${macCount})
#define NPU_HARDWARE_SRAM_MB     (${sramMb})
#define NPU_HARDWARE_FREQ_HZ     (${Math.round(frequencyGhz * 1e9)}ULL)

/**
 * @brief Initialize the NPU core with standard starting values
 */
static inline void npu_core_start(void) {
    *NPU_REG_CONTROL |= NPU_CTRL_START | NPU_CTRL_INT_EN;
}

/**
 * @brief Block poll wait until NPU systolic core is idle
 */
static inline void npu_core_poll_wait(void) {
    while (*NPU_REG_STATUS & NPU_STAT_BUSY) {
        // Spin lock
    }
}

#endif /* NPU_CSR_REGS_H */
`;
  };

  const handleCopy = () => {
    const code = activeTab === "verilog" ? generateVerilog() : generateCHeader();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="rtl-register-generator" className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 text-xs font-mono">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-cyan-400" /> RTL Register & C Map Generator
        </h4>
        <span className="text-[8px] bg-slate-950 px-1.5 py-0.5 text-slate-500 rounded uppercase">Synthesizable Code</span>
      </div>

      {/* Selector Options */}
      <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800/60">
        <div className="space-y-1">
          <span className="text-[8px] text-slate-500 font-bold uppercase block">Protocol Interface</span>
          <select
            value={busType}
            onChange={(e) => setBusType(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] p-1.5 rounded outline-none"
          >
            <option value="AXI4-Lite">AXI4-Lite (DDR5/PCIe)</option>
            <option value="APB">APB (Low Power APB)</option>
          </select>
        </div>

        <div className="space-y-1">
          <span className="text-[8px] text-slate-500 font-bold uppercase block">Address Bus Width</span>
          <select
            value={addressWidth}
            onChange={(e) => setAddressWidth(Number(e.target.value) as any)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] p-1.5 rounded outline-none"
          >
            <option value={32}>32-bit (Standard APB)</option>
            <option value={64}>64-bit (High PCIe Base)</option>
          </select>
        </div>

        <div className="space-y-1">
          <span className="text-[8px] text-slate-500 font-bold uppercase block">Base Memory Address</span>
          <input
            type="text"
            value={baseAddress}
            onChange={(e) => setBaseAddress(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] p-1.5 rounded outline-none"
          />
        </div>
      </div>

      {/* Code Viewer Tab Area */}
      <div className="space-y-2">
        <div className="flex justify-between items-center bg-slate-950 border border-slate-800 p-1 rounded-lg">
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab("verilog")}
              className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wider uppercase transition-all ${
                activeTab === "verilog" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Verilog HDL Block
            </button>
            <button
              onClick={() => setActiveTab("cheader")}
              className={`px-3 py-1.5 rounded text-[10px] font-bold tracking-wider uppercase transition-all ${
                activeTab === "cheader" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              C Header Register Map
            </button>
          </div>
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-cyan-400 p-1.5 rounded bg-slate-900 border border-slate-800 transition-colors flex items-center gap-1.5 font-bold text-[10px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> COPIED!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> COPY CODE
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="w-full h-48 overflow-y-auto bg-slate-950/90 border border-slate-800 p-3.5 rounded-lg text-[9px] text-slate-300 leading-normal font-mono scrollbar-thin scrollbar-thumb-slate-800 select-all">
            <code>{activeTab === "verilog" ? generateVerilog() : generateCHeader()}</code>
          </pre>
          <div className="absolute bottom-2 right-2 pointer-events-none opacity-20">
            <Code2 className="w-10 h-10 text-cyan-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
