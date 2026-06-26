/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { estimateAccelerator, WorkloadInputs } from "./src/utils/siliconMath.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK to prevent startup crashes when API key is missing
let aiInstance: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it in the Secrets panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// 1. Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Direct estimation endpoint (deterministic only)
app.post("/api/estimate", (req, res) => {
  try {
    const inputs: WorkloadInputs = req.body;
    const outputs = estimateAccelerator(inputs);
    res.json({ inputs, outputs });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Natural Language Requirement Extractor (Phase 2 & 4)
app.post("/api/extractor", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt string" });
    }

    const ai = getAI();
    const systemPrompt = `
      You are an expert Silicon Architect parser. Extract hardware and workload configuration details from the user's natural language request.
      Map the workload to one of these valid types:
      - "resnet_classification" (for standard classification, ResNet, MobileNet, image class identification)
      - "cnn_object_detection" (for YOLO, SSD, camera detection, ADAS detection, vision security)
      - "cnn_segmentation" (for autonomous driving lanes, pixel-level classification, mask-rcnn, medical imaging segment)
      - "transformer_llm" (for large language models, GPT, Llama, chatbot inference, text generation)
      - "transformer_vlm" (for vision-language models, Gemini-Nano, clip, image description)
      - "genai_diffusion" (for image generation, stable diffusion, flux, denoising, text-to-image)

      Valid process nodes are: "28nm", "16nm", "7nm", "5nm", "3nm". If not mentioned, infer a realistic node based on power budget (e.g. <3W on mobile usually needs 7nm or 5nm; server grade can use 5nm/3nm; cheap automotive can use 16nm/28nm).
      Valid complexities are: "lite", "medium", "heavy".

      Default fallbacks if not specified:
      - resolutionWidth: 1920
      - resolutionHeight: 1080
      - fps: 30
      - powerBudget: 5.0
      - modelComplexity: "medium"
      - llmParams: 7
      - llmTokensPerSec: 30
      - llmBatchSize: 1
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Extract accelerator parameters from this request: "${prompt}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            workloadType: {
              type: Type.STRING,
              description: "The matched workload category name.",
            },
            resolutionWidth: {
              type: Type.INTEGER,
              description: "Horizontal pixels. Defaults to 1920 if vision and unspecified.",
            },
            resolutionHeight: {
              type: Type.INTEGER,
              description: "Vertical pixels. Defaults to 1080 if vision and unspecified.",
            },
            fps: {
              type: Type.INTEGER,
              description: "Frames per second, default 30.",
            },
            modelComplexity: {
              type: Type.STRING,
              description: "lite, medium, or heavy",
            },
            powerBudget: {
              type: Type.NUMBER,
              description: "Power budget in Watts.",
            },
            processNode: {
              type: Type.STRING,
              description: "Silicon manufacturing process node (e.g., '7nm', '5nm', '3nm', '16nm', '28nm').",
            },
            llmParams: {
              type: Type.NUMBER,
              description: "LLM parameter count in Billions (if transformer).",
            },
            llmTokensPerSec: {
              type: Type.NUMBER,
              description: "Target token generation rate per user (if transformer).",
            },
            llmBatchSize: {
              type: Type.INTEGER,
              description: "Batch size / concurrent users (if transformer).",
            },
            explanation: {
              type: Type.STRING,
              description: "Short friendly explanation of the extracted parameters and assumptions.",
            },
          },
          required: ["workloadType", "processNode", "modelComplexity", "powerBudget"],
        },
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    const extractedData = JSON.parse(jsonStr);

    // Apply deterministic estimates on the extracted parameters
    const finalInputs: WorkloadInputs = {
      workloadType: extractedData.workloadType || "cnn_object_detection",
      resolutionWidth: Number(extractedData.resolutionWidth) || 1920,
      resolutionHeight: Number(extractedData.resolutionHeight) || 1080,
      fps: Number(extractedData.fps) || 30,
      modelComplexity: (extractedData.modelComplexity as "lite" | "medium" | "heavy") || "medium",
      powerBudget: Number(extractedData.powerBudget) || 5,
      processNode: (extractedData.processNode as "28nm" | "16nm" | "7nm" | "5nm" | "3nm") || "7nm",
      llmParams: Number(extractedData.llmParams) || 7,
      llmTokensPerSec: Number(extractedData.llmTokensPerSec) || 30,
      llmBatchSize: Number(extractedData.llmBatchSize) || 1,
    };

    const outputs = estimateAccelerator(finalInputs);

    res.json({
      inputs: finalInputs,
      outputs,
      nlpExplanation: extractedData.explanation || "Extracted using AI Silicon requirement parser.",
    });
  } catch (error: any) {
    console.error("Extractor error:", error);
    res.status(500).json({ error: error.message || "Silicon parameters extraction failed." });
  }
});

// 4. Report generator endpoint (Phase 2 & 3)
app.post("/api/report", async (req, res) => {
  try {
    const { inputs, outputs } = req.body;
    if (!inputs || !outputs) {
      return res.status(400).json({ error: "Missing hardware inputs or estimation outputs" });
    }

    const ai = getAI();
    const prompt = `
      As a veteran Lead Silicon Architect, analyze these NPU estimator results and write a professional hardware design report:

      === WORKLOAD INPUTS ===
      - Workload Type: ${inputs.workloadType}
      - Target Complexity: ${inputs.modelComplexity}
      - Resolution: ${inputs.resolutionWidth} x ${inputs.resolutionHeight} at ${inputs.fps} FPS
      - Power Budget: ${inputs.powerBudget} Watts
      - Process Node: ${inputs.processNode}
      ${inputs.llmParams ? `- LLM Parameters: ${inputs.llmParams} Billion, Target Token Rate: ${inputs.llmTokensPerSec} T/s, Batch Size: ${inputs.llmBatchSize}` : ""}

      === DETERMINISTIC HARDWARE ESTIMATES ===
      - Required TOPS: ${outputs.requiredTops}
      - Core Clock Frequency: ${outputs.frequencyGhz} GHz
      - Recommended Architecture: ${outputs.recommendedArchitecture}
      - Target MAC Count: ${outputs.macCount}
      - SRAM size: ${outputs.sramMb} MB
      - DDR Bandwidth: ${outputs.ddrBandwidthGbs} GB/s (Arithmetic Intensity: ${outputs.arithmeticIntensity} OPs/Byte)
      - Die Area (Estimate): ${outputs.estimatedAreaMm2} mm²
      - Total Power Consumption: ${outputs.estimatedPowerW} Watts (Dynamic: ${outputs.dynamicPowerW}W, Memory: ${outputs.memoryPowerW}W, Leakage: ${outputs.leakagePowerW}W)
      - Throttled Status: ${outputs.isPowerThrottled ? "YES (Power budget exceeded!)" : "NO"}
      - Primary Bottleneck: ${outputs.bottleneckAnalysis}

      Provide a 4-section silicon specification report using clear, high-contrast Markdown headers (###):
      
      ### 1. Architectural Strategy & Datapath Design
      Explain why ${outputs.recommendedArchitecture} is the correct pick. Detail how data should flow from SRAM to the MAC structures (e.g. weight stationary vs output stationary systolic array, or SIMD vector lanes layout, double buffering, and accumulator bit-widths like INT8 inputs with INT32 accumulators).

      ### 2. Memory Hierarchy & Bandwidth Optimization
      Detail the caching strategy. Discuss how to buffer activation maps and weights in the ${outputs.sramMb} MB SRAM scratchpad to keep external DDR memory traffic within ${outputs.ddrBandwidthGbs} GB/s. Propose ping-pong buffering configurations.

      ### 3. Power, Area, and Thermal Budget Tradeoffs
      Address the estimated ${outputs.estimatedPowerW}W total power under ${inputs.powerBudget}W budget and ${outputs.estimatedAreaMm2}mm² die area. Give specific suggestions: e.g. voltage domains, power gating unused MAC blocks, or lowering clock frequency to meet the thermal envelop if throttled.

      ### 4. RTL Implementation & Verification Roadmap
      List the critical Verilog blocks that must be coded (e.g. MAC array, AGU (Address Generation Unit), Activation function unit) and outline a hardware verification strategy (coverage targets, random transaction generator testing). Keep it highly detailed and professional.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ report: response.text });
  } catch (error: any) {
    console.error("Report generator error:", error);
    res.status(500).json({ error: error.message || "Failed to generate silicon report." });
  }
});

// 5. Silicon AI Architect Chat (Phase 4)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, currentState } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array." });
    }

    const ai = getAI();
    
    // Inject hardware context as the system prompt to guide the AI Architect
    let contextStr = "No active design configuration selected.";
    if (currentState && currentState.inputs && currentState.outputs) {
      contextStr = `
        Active Design Configuration:
        - Workload: ${currentState.inputs.workloadType} (${currentState.inputs.modelComplexity})
        - Silicon Node: ${currentState.inputs.processNode} at ${currentState.outputs.frequencyGhz} GHz
        - Compute Core: ${currentState.outputs.macCount} MACs (${currentState.outputs.requiredTops} TOPS target)
        - Memory: ${currentState.outputs.sramMb} MB SRAM, DDR Bandwidth target ${currentState.outputs.ddrBandwidthGbs} GB/s
        - Power/Area: ${currentState.outputs.estimatedPowerW} Watts (Budget: ${currentState.inputs.powerBudget}W), ${currentState.outputs.estimatedAreaMm2} mm² Area.
        - Primary Bottleneck: ${currentState.outputs.bottleneckAnalysis}
      `;
    }

    const systemInstruction = `
      You are 'Silicon AI Architect', a principal silicon design engineer with a deep background in hardware accelerators, NPUs, DSPs, systolic arrays, and RTL verification.
      You are guiding an engineer through drafting their custom NPU accelerator.
      
      Your current hardware context is:
      ${contextStr}

      Aesthetic & Style Guidelines:
      - Be technical, objective, and supportive. Use realistic chip terminology (e.g. clock gates, routing congestion, SRAM banks, FIFO depth, AXIS buses, Systolic Mesh).
      - If the user asks for RTL, write clean, synthesizable Verilog code snippets. Include comments explaining inputs, outputs, and control states.
      - If they ask about verification, write a realistic Verilog/SystemVerilog testbench skeleton or discuss assertions (SVA).
      - If they ask about block diagrams, use ASCII art to represent datapath blocks (e.g. SRAM -> Input FIFOs -> MAC Array -> Accumulators) to make it interactive and visual.
    `;

    // Map conversation format to Gemini API contents structure
    const contents = messages.map((m: any) => {
      return {
        role: m.role === "assistant" ? "model" : m.role === "system" ? "user" : m.role,
        parts: [{ text: m.content }],
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("AI Architect Chat error:", error);
    res.status(500).json({ error: error.message || "Silicon AI chat failed." });
  }
});

// Setup Vite development or production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static production files serving from /dist");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Silicon Architect is listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
