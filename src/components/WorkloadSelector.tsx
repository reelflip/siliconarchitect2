/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { WorkloadInputs, WorkloadProfile } from "../types";
import { BookOpen, Upload, FileJson, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";

interface WorkloadSelectorProps {
  currentInputs: WorkloadInputs;
  onSelectInputs: (inputs: WorkloadInputs) => void;
}

// Library of standard preloaded AI workloads
const PRELOADED_PROFILES: WorkloadProfile[] = [
  {
    id: "yolov8_det",
    name: "YOLOv8 Object Detection (ADAS)",
    description: "Real-time automotive safety perception running at high-FPS on Full HD inputs.",
    workloadType: "cnn_object_detection",
    resolutionWidth: 1920,
    resolutionHeight: 1080,
    fps: 60,
    modelComplexity: "medium",
  },
  {
    id: "llama3_8b",
    name: "Llama 3 8B (Edge LLM)",
    description: "Memory-bound autoregressive text generation targeting low-latency token-by-token output.",
    workloadType: "transformer_llm",
    resolutionWidth: 0,
    resolutionHeight: 0,
    fps: 0,
    modelComplexity: "medium",
    llmParams: 8,
    llmTokensPerSec: 35,
    llmBatchSize: 1,
  },
  {
    id: "sdxl_diffusion",
    name: "Stable Diffusion XL (Generative AI)",
    description: "High-latency multi-step diffusion pipeline generating ultra-high resolution image canvases.",
    workloadType: "genai_diffusion",
    resolutionWidth: 1024,
    resolutionHeight: 1024,
    fps: 4,
    modelComplexity: "heavy",
  },
  {
    id: "resnet50_cls",
    name: "ResNet-50 Image Classification",
    description: "Dense convolutional model on classic ImageNet sized frames, optimized for high throughput.",
    workloadType: "resnet_classification",
    resolutionWidth: 224,
    resolutionHeight: 224,
    fps: 240,
    modelComplexity: "lite",
  },
  {
    id: "deeplabv3_seg",
    name: "DeepLabV3 Pixel Segmentation",
    description: "Heavy pixel-wise parsing for autonomous driving scene classification or medical scanning.",
    workloadType: "cnn_segmentation",
    resolutionWidth: 1280,
    resolutionHeight: 720,
    fps: 30,
    modelComplexity: "heavy",
  },
];

export const WorkloadSelector: React.FC<WorkloadSelectorProps> = ({
  currentInputs,
  onSelectInputs,
}) => {
  const [profiles, setProfiles] = useState<WorkloadProfile[]>(PRELOADED_PROFILES);
  const [selectedId, setSelectedId] = useState<string>("yolov8_det");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectProfile = (profile: WorkloadProfile) => {
    setSelectedId(profile.id);
    const newInputs: WorkloadInputs = {
      ...currentInputs,
      workloadType: profile.workloadType,
      resolutionWidth: profile.resolutionWidth,
      resolutionHeight: profile.resolutionHeight,
      fps: profile.fps,
      modelComplexity: profile.modelComplexity,
      llmParams: profile.llmParams || currentInputs.llmParams || 7,
      llmTokensPerSec: profile.llmTokensPerSec || currentInputs.llmTokensPerSec || 30,
      llmBatchSize: profile.llmBatchSize || currentInputs.llmBatchSize || 1,
      customWeightsSizeMb: profile.customWeightsSizeMb,
      customActivationsSizeMb: profile.customActivationsSizeMb,
    };
    onSelectInputs(newInputs);
    setSuccessMsg(`Selected workload: ${profile.name}`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseJsonFile = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed.name || !parsed.workloadType) {
        throw new Error("JSON must contain 'name' and 'workloadType' fields.");
      }
      
      const validWorkloads = [
        "cnn_object_detection",
        "cnn_segmentation",
        "resnet_classification",
        "transformer_llm",
        "transformer_vlm",
        "genai_diffusion"
      ];

      if (!validWorkloads.includes(parsed.workloadType)) {
        throw new Error(`Invalid workloadType: "${parsed.workloadType}". Allowed values: ${validWorkloads.join(", ")}`);
      }

      const customProfile: WorkloadProfile = {
        id: `custom_${Date.now()}`,
        name: parsed.name,
        description: parsed.description || "Uploaded custom workload profile configuration.",
        isCustom: true,
        workloadType: parsed.workloadType,
        resolutionWidth: Number(parsed.resolutionWidth) || 0,
        resolutionHeight: Number(parsed.resolutionHeight) || 0,
        fps: Number(parsed.fps) || 30,
        modelComplexity: parsed.modelComplexity === "lite" || parsed.modelComplexity === "heavy" ? parsed.modelComplexity : "medium",
        llmParams: parsed.llmParams ? Number(parsed.llmParams) : undefined,
        llmTokensPerSec: parsed.llmTokensPerSec ? Number(parsed.llmTokensPerSec) : undefined,
        llmBatchSize: parsed.llmBatchSize ? Number(parsed.llmBatchSize) : undefined,
        customWeightsSizeMb: parsed.customWeightsSizeMb ? Number(parsed.customWeightsSizeMb) : undefined,
        customActivationsSizeMb: parsed.customActivationsSizeMb ? Number(parsed.customActivationsSizeMb) : undefined,
      };

      setProfiles((prev) => [customProfile, ...prev]);
      handleSelectProfile(customProfile);
      setErrorMsg(null);
      setSuccessMsg(`Successfully parsed custom profile: "${customProfile.name}"!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(`Parsing failed: ${err.message}`);
      setSuccessMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          parseJsonFile(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          parseJsonFile(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="workload-profile-manager" className="space-y-4">
      {/* Selector list */}
      <div className="space-y-2">
        <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> SELECT COMMON AI WORKLOAD
        </label>
        <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
          {profiles.map((prof) => (
            <button
              key={prof.id}
              onClick={() => handleSelectProfile(prof)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                selectedId === prof.id
                  ? "bg-cyan-950/20 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)] text-white"
                  : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono">{prof.name}</span>
                {prof.isCustom && (
                  <span className="text-[8px] bg-cyan-900/60 text-cyan-300 font-bold px-1 rounded font-mono">
                    CUSTOM
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 leading-snug mt-1 font-mono">
                {prof.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* JSON Custom Profile Drag & Drop Uploader */}
      <div className="space-y-2">
        <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1 flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-cyan-400" /> UPLOAD CUSTOM PROFILE (.JSON)
        </label>
        
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            dragActive
              ? "border-cyan-400 bg-cyan-950/20 text-cyan-300"
              : "border-slate-800 bg-slate-950 hover:bg-slate-900/50 text-slate-400 hover:border-slate-700"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <FileJson className="w-6 h-6 text-cyan-500/80 animate-pulse" />
          <p className="text-[10px] font-mono font-bold">
            DRAG & DROP PROFILE OR CLICK TO SELECT
          </p>
          <p className="text-[9px] text-slate-600 font-mono">
            Accepts parameters like: name, workloadType, resolutionWidth, resolutionHeight, fps, modelComplexity, etc.
          </p>
        </div>
      </div>

      {/* Profile template snippet info helper */}
      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex gap-2 items-start text-[10px] text-slate-400 font-mono">
        <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-300 font-bold">Template schema:</span>
          <code className="block mt-1 text-[9px] text-cyan-300 bg-slate-900/60 p-1.5 rounded select-all whitespace-pre">
{`{
  "name": "My Custom Model",
  "workloadType": "cnn_object_detection",
  "resolutionWidth": 1280,
  "resolutionHeight": 720,
  "fps": 45,
  "modelComplexity": "medium"
}`}
          </code>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="flex gap-2 items-center p-2.5 bg-red-950/30 border border-red-900/40 text-red-400 text-[10px] rounded font-mono">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex gap-2 items-center p-2.5 bg-cyan-950/30 border border-cyan-900/40 text-cyan-300 text-[10px] rounded font-mono">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
};
