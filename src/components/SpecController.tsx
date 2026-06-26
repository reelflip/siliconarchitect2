/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { WorkloadInputs } from "../types";
import { Sparkles, Sliders, Cpu, MessageSquare, Zap, Layers, BookOpen } from "lucide-react";
import { WorkloadSelector } from "./WorkloadSelector";

const INDUSTRY_PRESETS = [
  {
    id: "gpt-4",
    name: "GPT-4 (Ultra-Scale Cloud MoE)",
    badge: "70B+ MoE, 3nm GAA, 140W",
    inputs: {
      workloadType: "transformer_llm",
      resolutionWidth: 0,
      resolutionHeight: 0,
      fps: 0,
      modelComplexity: "heavy" as const,
      powerBudget: 140,
      processNode: "3nm" as const,
      llmParams: 70,
      llmTokensPerSec: 45,
      llmBatchSize: 8,
    },
  },
  {
    id: "llama3-70b",
    name: "Llama 3 70B (High-Capacity LLM)",
    badge: "70B, 5nm EUV, 45W",
    inputs: {
      workloadType: "transformer_llm",
      resolutionWidth: 0,
      resolutionHeight: 0,
      fps: 0,
      modelComplexity: "heavy" as const,
      powerBudget: 45,
      processNode: "5nm" as const,
      llmParams: 70,
      llmTokensPerSec: 25,
      llmBatchSize: 2,
    },
  },
  {
    id: "llama3-8b",
    name: "Llama 3 8B (Premium Edge LLM)",
    badge: "8B, 5nm EUV, 8W",
    inputs: {
      workloadType: "transformer_llm",
      resolutionWidth: 0,
      resolutionHeight: 0,
      fps: 0,
      modelComplexity: "medium" as const,
      powerBudget: 8,
      processNode: "5nm" as const,
      llmParams: 8,
      llmTokensPerSec: 35,
      llmBatchSize: 1,
    },
  },
  {
    id: "stable-diffusion-xl",
    name: "Stable Diffusion XL (Generative AI)",
    badge: "1024x1024, 5nm EUV, 25W",
    inputs: {
      workloadType: "genai_diffusion",
      resolutionWidth: 1024,
      resolutionHeight: 1024,
      fps: 4,
      modelComplexity: "heavy" as const,
      powerBudget: 25,
      processNode: "5nm" as const,
      llmParams: 7,
      llmTokensPerSec: 30,
      llmBatchSize: 1,
    },
  },
  {
    id: "yolov8-adas",
    name: "YOLOv8 Object Detection (ADAS)",
    badge: "1080p60, 16nm FinFET, 5W",
    inputs: {
      workloadType: "cnn_object_detection",
      resolutionWidth: 1920,
      resolutionHeight: 1080,
      fps: 60,
      modelComplexity: "medium" as const,
      powerBudget: 5,
      processNode: "16nm" as const,
      llmParams: 7,
      llmTokensPerSec: 30,
      llmBatchSize: 1,
    },
  },
  {
    id: "resnet50-classification",
    name: "ResNet-50 Classifier (High-Throughput)",
    badge: "224x224 @ 120 FPS, 28nm, 2W",
    inputs: {
      workloadType: "resnet_classification",
      resolutionWidth: 224,
      resolutionHeight: 224,
      fps: 120,
      modelComplexity: "lite" as const,
      powerBudget: 2,
      processNode: "28nm" as const,
      llmParams: 7,
      llmTokensPerSec: 30,
      llmBatchSize: 1,
    },
  }
];

interface SpecControllerProps {
  inputs: WorkloadInputs;
  onChangeInputs: (inputs: WorkloadInputs) => void;
}

export const SpecController: React.FC<SpecControllerProps> = ({
  inputs,
  onChangeInputs,
}) => {
  const [activeTab, setActiveTab] = useState<"library" | "manual">("library");

  const updateField = (field: keyof WorkloadInputs, value: any) => {
    onChangeInputs({
      ...inputs,
      [field]: value,
    });
  };

  return (
    <div id="spec-controller-root" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950">
        <button
          onClick={() => setActiveTab("library")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-mono font-bold border-b-2 transition-all ${activeTab === "library" ? "border-cyan-500 text-cyan-400 bg-slate-900/40" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          WORKLOAD LIBRARY
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-mono font-bold border-b-2 transition-all ${activeTab === "manual" ? "border-cyan-500 text-cyan-400 bg-slate-900/40" : "border-transparent text-slate-400 hover:text-slate-200"}`}
        >
          <Sliders className="w-3.5 h-3.5" />
          MANUAL TUNER
        </button>
      </div>

      <div className="p-5">
        {/* Industry standard presets selection */}
        <div className="mb-5 pb-5 border-b border-slate-800">
          <label className="block text-[10px] font-mono font-bold text-slate-400 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-cyan-400">
              <Zap className="w-3.5 h-3.5" /> Industry Workload Presets
            </span>
            <span className="text-[8px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-500 font-mono">Fast Load</span>
          </label>
          <div className="relative">
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const selected = INDUSTRY_PRESETS.find(p => p.id === val);
                if (selected) {
                  onChangeInputs(selected.inputs);
                }
              }}
              value={
                INDUSTRY_PRESETS.find(p => 
                  p.inputs.workloadType === inputs.workloadType &&
                  p.inputs.processNode === inputs.processNode &&
                  (inputs.workloadType.startsWith("transformer") 
                    ? p.inputs.llmParams === inputs.llmParams 
                    : p.inputs.resolutionWidth === inputs.resolutionWidth)
                )?.id || ""
              }
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs p-3 rounded-lg outline-none focus:border-cyan-500/50 hover:border-slate-700 transition-colors"
            >
              <option value="" disabled>-- Select an Industry Preset --</option>
              {INDUSTRY_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} ({preset.badge})
                </option>
              ))}
            </select>
          </div>
          <p className="text-[9px] text-slate-500 font-mono mt-2 leading-relaxed">
            Instantly model state-of-the-art architectures. Changing any manual tuner or selector settings will live-customize your configuration.
          </p>
        </div>
        {/* TAB 1: Workload Library */}
        {activeTab === "library" && (
          <WorkloadSelector currentInputs={inputs} onSelectInputs={onChangeInputs} />
        )}

        {/* TAB 2: Manual Tuning Knobs */}
        {activeTab === "manual" && (
          <div className="space-y-5">
            {/* 1. Workload Type */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> WORKLOAD PROFILE
              </label>
              <select
                value={inputs.workloadType}
                onChange={(e) => updateField("workloadType", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs p-2.5 rounded-lg outline-none focus:border-cyan-500/50"
              >
                <option value="cnn_object_detection">CNN Object Detection (YOLO/SSD)</option>
                <option value="cnn_segmentation">CNN Segmentation (DeepLab/Mask-RCNN)</option>
                <option value="resnet_classification">ResNet Image Classification</option>
                <option value="transformer_llm">Transformer LLM (Llama/GPT Inference)</option>
                <option value="transformer_vlm">Transformer VLM (Vision-Language model)</option>
                <option value="genai_diffusion">Generative AI Diffusion (Stable Diffusion)</option>
              </select>
            </div>

            {/* CONDITIONAL: LLM Inputs */}
            {inputs.workloadType.startsWith("transformer") ? (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-4">
                <span className="text-[9px] bg-cyan-900/40 text-cyan-300 font-bold px-1.5 py-0.5 rounded font-mono uppercase">LLM Spec Adjustments</span>
                
                {/* Parameters */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                    <span>Model Size (Params):</span>
                    <span className="text-cyan-400 font-bold">{inputs.llmParams || 7}B</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="70"
                    step="1"
                    value={inputs.llmParams || 7}
                    onChange={(e) => updateField("llmParams", Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Target token rate */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                    <span>Target Tokens/sec per user:</span>
                    <span className="text-cyan-400 font-bold">{inputs.llmTokensPerSec || 30} T/s</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={inputs.llmTokensPerSec || 30}
                    onChange={(e) => updateField("llmTokensPerSec", Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Concurrent Batch size */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                    <span>Concurrent Batch Size:</span>
                    <span className="text-cyan-400 font-bold">{inputs.llmBatchSize || 1} User(s)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="32"
                    step="1"
                    value={inputs.llmBatchSize || 1}
                    onChange={(e) => updateField("llmBatchSize", Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            ) : (
              /* VISION RESOLUTION KNOBS */
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">Resolution Preset</label>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "720p") {
                        onChangeInputs({ ...inputs, resolutionWidth: 1280, resolutionHeight: 720 });
                      } else if (val === "1080p") {
                        onChangeInputs({ ...inputs, resolutionWidth: 1920, resolutionHeight: 1080 });
                      } else if (val === "4k") {
                        onChangeInputs({ ...inputs, resolutionWidth: 3840, resolutionHeight: 2160 });
                      }
                    }}
                    defaultValue="1080p"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs p-2 rounded outline-none focus:border-cyan-500/50"
                  >
                    <option value="720p">HD (720p)</option>
                    <option value="1080p">Full HD (1080p)</option>
                    <option value="4k">Ultra HD (4K)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-400">
                    <span>Target FPS:</span>
                    <span className="text-cyan-400 font-bold">{inputs.fps} FPS</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={inputs.fps}
                    onChange={(e) => updateField("fps", Number(e.target.value))}
                    className="w-full accent-cyan-500 mt-1"
                  />
                </div>
              </div>
            )}

            {/* 2. Process Node */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> MANUFACTURING PROCESS NODE
              </label>
              <select
                value={inputs.processNode}
                onChange={(e) => updateField("processNode", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs p-2.5 rounded-lg outline-none focus:border-cyan-500/50"
              >
                <option value="28nm">28nm planar (Legacy, Low Wafer Cost)</option>
                <option value="16nm">16nm FinFET (Automotive, High Reliability)</option>
                <option value="7nm">7nm FinFET (Consumer NPU standard)</option>
                <option value="5nm">5nm EUV (Premium Edge/Server acceleration)</option>
                <option value="3nm">3nm GAA (Bleeding-Edge performance)</option>
              </select>
            </div>

            {/* 3. Complexity */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> MODEL BACKBONE COMPLEXITY
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["lite", "medium", "heavy"] as const).map((comp) => (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => updateField("modelComplexity", comp)}
                    className={`font-mono text-[10px] uppercase font-bold py-2 rounded-lg border transition-all ${inputs.modelComplexity === comp ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"}`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Power Budget */}
            <div>
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 mb-1.5">
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-cyan-400" /> COOLING POWER ENVELOP</span>
                <span className="text-cyan-400 font-bold">{inputs.powerBudget} Watts</span>
              </div>
              <input
                type="range"
                min="1"
                max="150"
                step="1"
                value={inputs.powerBudget}
                onChange={(e) => updateField("powerBudget", Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <div className="flex justify-between text-[8px] text-slate-600 font-mono mt-1">
                <span>1W (Mobile IoT)</span>
                <span>15W (Automotive SoC)</span>
                <span>150W (Cloud Accelerator)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
