/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  BookOpen, 
  Cpu, 
  Terminal, 
  TrendingUp, 
  Thermometer, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ChevronRight, 
  Code, 
  Award, 
  CheckSquare, 
  ShieldAlert, 
  HelpCircle,
  Clock,
  ExternalLink
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  category: "architecture" | "validation" | "economics" | "thermal";
  readTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  date: string;
  icon: React.ReactNode;
}

export const KnowledgeHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeArticleId, setActiveArticleId] = useState<string>("systolic-arrays");
  
  // Interactive audit state
  const [auditAnswers, setAuditAnswers] = useState({
    verificationType: "random",
    coverageGoal: "90",
    hasThermalSensor: true,
    sramEcc: true,
    assertionCount: "medium"
  });

  const articles: Article[] = [
    {
      id: "systolic-arrays",
      title: "Systolic Arrays: Architecting High-Efficiency Compute Engines",
      category: "architecture",
      readTime: "6 min read",
      difficulty: "Advanced",
      summary: "An in-depth analysis of 2D MAC array dataflows, weight-stationary vs. output-stationary architectures, and wire delay optimization.",
      date: "June 25, 2026",
      icon: <Cpu className="w-4 h-4 text-emerald-400" />
    },
    {
      id: "pre-silicon-verification",
      title: "UVM Best Practices: Scaling Pre-Silicon RTL Verification",
      category: "validation",
      readTime: "8 min read",
      difficulty: "Advanced",
      summary: "How to structure modular SystemVerilog testbenches with UVM agents, register abstraction layers (RAL), and dynamic assertion-based coverage.",
      date: "June 24, 2026",
      icon: <Terminal className="w-4 h-4 text-cyan-400" />
    },
    {
      id: "silicon-economics",
      title: "The Math of Wafer Cost: Optimizing Die Size and Mask Budgets",
      category: "economics",
      readTime: "5 min read",
      difficulty: "Intermediate",
      summary: "A mathematical breakdown of defect densities, Murphy's Yield Model, and why bleeding-edge 3nm nodes require extreme architectural modularity.",
      date: "June 22, 2026",
      icon: <TrendingUp className="w-4 h-4 text-indigo-400" />
    },
    {
      id: "thermal-hotspots",
      title: "Thermodynamic Hotspots: Throttling & DVFS Control Loops",
      category: "thermal",
      readTime: "7 min read",
      difficulty: "Intermediate",
      summary: "Mitigating spatial heat gradients in dense compute clusters using proactive clock gating, custom packaging, and closed-loop thermal sensors.",
      date: "June 18, 2026",
      icon: <Thermometer className="w-4 h-4 text-rose-400" />
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Simple validation compliance score calculator
  const calculateComplianceScore = () => {
    let score = 40;
    if (auditAnswers.verificationType === "formal") score += 20;
    if (auditAnswers.verificationType === "random") score += 15;
    if (parseInt(auditAnswers.coverageGoal) >= 95) score += 15;
    else if (parseInt(auditAnswers.coverageGoal) >= 80) score += 10;
    if (auditAnswers.hasThermalSensor) score += 15;
    if (auditAnswers.sramEcc) score += 15;
    if (auditAnswers.assertionCount === "high") score += 15;
    else if (auditAnswers.assertionCount === "medium") score += 10;
    return Math.min(100, score);
  };

  const score = calculateComplianceScore();

  return (
    <div id="knowledge-hub-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      
      {/* LEFT COLUMN: Article Lists & Filters (Col 4) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Search & Categories Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search chip publications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs font-mono">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">CATEGORIES</span>
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex justify-between items-center px-3 py-2 rounded-lg transition-all ${
                selectedCategory === "all" 
                  ? "bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 font-bold" 
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <span>📂 All Publications</span>
              <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">{articles.length}</span>
            </button>
            <button
              onClick={() => setSelectedCategory("architecture")}
              className={`flex justify-between items-center px-3 py-2 rounded-lg transition-all ${
                selectedCategory === "architecture" 
                  ? "bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 font-bold" 
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <span>⚙️ Microarchitecture</span>
              <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">1</span>
            </button>
            <button
              onClick={() => setSelectedCategory("validation")}
              className={`flex justify-between items-center px-3 py-2 rounded-lg transition-all ${
                selectedCategory === "validation" 
                  ? "bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 font-bold" 
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <span>🛡️ Pre-Silicon Verification</span>
              <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">1</span>
            </button>
            <button
              onClick={() => setSelectedCategory("economics")}
              className={`flex justify-between items-center px-3 py-2 rounded-lg transition-all ${
                selectedCategory === "economics" 
                  ? "bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 font-bold" 
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <span>📊 Silicon Economics</span>
              <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">1</span>
            </button>
            <button
              onClick={() => setSelectedCategory("thermal")}
              className={`flex justify-between items-center px-3 py-2 rounded-lg transition-all ${
                selectedCategory === "thermal" 
                  ? "bg-rose-600/10 border border-rose-500/30 text-rose-400 font-bold" 
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <span>🔥 Thermal Validation</span>
              <span className="text-[9px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400">1</span>
            </button>
          </div>
        </div>

        {/* Article Cards List */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider px-1">TECHNICAL ARTICLES</h4>
          {filteredArticles.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-mono">No matching articles found.</p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <motion.div
                key={article.id}
                onClick={() => setActiveArticleId(article.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col gap-2 ${
                  activeArticleId === article.id 
                    ? "bg-slate-900 border-indigo-500/60 shadow-[0_4px_20px_rgba(99,102,241,0.15)]" 
                    : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    {article.icon}
                    <span className="text-[9px] font-mono uppercase text-slate-500">{article.category}</span>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    article.difficulty === "Advanced" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {article.difficulty}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white tracking-tight leading-tight">{article.title}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-mono">{article.summary}</p>
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-slate-850 pt-2 mt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                  <span>{article.date}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Silicon Design Newsletter Mockup */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left space-y-2 relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-indigo-600/10 rounded-full blur-xl"></div>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-500/20 font-mono">
            COREPICK INTELLIGENCE
          </span>
          <h4 className="text-xs font-bold text-white tracking-tight font-mono">Stay updated on validation methods!</h4>
          <p className="text-[11px] text-slate-400 leading-normal font-mono">We regularly publish case-studies on high-yield ASIC tapeouts, UVM regression tuning, and multi-die chiplets.</p>
          <div className="flex gap-2 pt-1">
            <input 
              type="text" 
              placeholder="engineer@company.com" 
              disabled
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[10px] font-mono text-slate-500 w-full"
            />
            <button className="bg-indigo-600 text-white font-mono text-[10px] px-3 py-1 rounded font-bold hover:bg-indigo-500 opacity-65 cursor-not-allowed">
              JOIN
            </button>
          </div>
        </div>

      </div>

      {/* CENTER & RIGHT COLUMN: Active Article Content & Interactive Diagnostic Tool (Col 8) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Active Article Viewer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left space-y-6">
          
          {/* Article Header */}
          {activeArticleId === "systolic-arrays" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                <span className="text-emerald-400 font-bold">⚙️ MICROARCHITECTURE GUIDE</span>
                <span>•</span>
                <span>ADVANCED DEEP-DIVE</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 6 MIN READ</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug">
                Systolic Arrays: Designing High-Efficiency AI Compute Clusters
              </h2>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Modern NPUs rely on 2D grids of Multiply-Accumulate (MAC) elements to speed up massive matrix multiplication (GEMM). To minimize memory bandwidth requirements, systolic arrays pipe intermediate outputs directly to adjacent elements, rather than back to centralized registers.
              </p>
              
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                  <Cpu className="w-4 h-4 text-emerald-400" /> Systolic Array Dataflows Compared
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold">1. Weight-Stationary (WS)</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Weights are loaded into MAC cells once and remain stationary. Inputs flow horizontally, and partial sums flow vertically. Perfect for large batch sizes or convolution heavy layers.
                    </p>
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1 py-0.5 rounded block text-center font-bold">MINIMIZES WEIGHT ACCESS ENERGIES</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
                    <span className="text-cyan-400 font-bold">2. Output-Stationary (OS)</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Partial sums are kept stationary in local accumulators. Input activations and weight kernels stream from opposite directions. Ideal for small batch inference or heavy reuse layers.
                    </p>
                    <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1 py-0.5 rounded block text-center font-bold">ELIMINATES ACCUMULATOR DRIFT POWER</span>
                  </div>
                </div>
              </div>

              {/* Technical Code Snippet / Pseudocode */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">CONV2D SYSTOLIC MAPPER PSEUDOCODE</span>
                <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  <pre className="leading-5">
{`// 1. Pre-fetch Kernel Weights into compute buffer
for (int row = 0; row < ARRAY_HEIGHT; row++) {
    for (int col = 0; col < ARRAY_WIDTH; col++) {
        array_mac_cell[row][col].weight = weights[kernel_id][row][col];
    }
}

// 2. Stream Input Activations (staggered by 1 clock cycle per row for systolic pipeline)
for (int cycle = 0; cycle < TOTAL_CYCLES; cycle++) {
    for (int r = 0; r < ARRAY_HEIGHT; r++) {
        if (cycle >= r) {
            float act = inputs[batch][feature_map][cycle - r];
            array_mac_cell[r][0].inject_activation(act);
        }
    }
    // Propagate activation rightward and partial sums downward
    systolic_tick();
}`}
                  </pre>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-300 leading-relaxed">
                <h4 className="font-bold text-white border-b border-slate-800 pb-1 uppercase text-xs">Architectural Design Guidelines</h4>
                <p>
                  When selecting array sizes, avoid building oversized matrices (e.g., 256x256). While they theoretically deliver exceptional peak TOPS, real-world utilization drops below 15% due to zero padding and layer dimension mismatch. Standardizing around a **64x64 or 128x128 array size** balanced by dual-channel LPDDR5/HBM provides optimal PPA (Power-Performance-Area) metrics.
                </p>
              </div>

            </div>
          )}

          {activeArticleId === "pre-silicon-verification" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                <span className="text-cyan-400 font-bold">🛡️ PRE-SILICON VALIDATION</span>
                <span>•</span>
                <span>UVM METHODOLOGY</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 8 MIN READ</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug">
                Pre-Silicon Verification: Structuring High-Coverage UVM Testbenches
              </h2>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Taping out a chip costs millions of dollars. Pre-silicon verification ensures there are no logical or timing bugs in the RTL before masking. The Universal Verification Methodology (UVM) is the gold standard for creating reusable, scalable, and constrained-random testbenches.
              </p>

              {/* UVM Hierarchy Graphic */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                <h4 className="text-xs font-bold text-cyan-400 uppercase">Universal Verification Environment (UVE) Block Diagram</h4>
                <div className="border border-slate-800 p-3 rounded-lg bg-slate-900 space-y-2">
                  <div className="bg-indigo-950/40 border border-indigo-900 text-indigo-300 text-center py-1.5 rounded font-bold">
                    UVM TEST (Controls Sequences and Scenarios)
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-cyan-950/40 border border-cyan-900 text-cyan-300 text-center py-1.5 rounded text-[10px] flex items-center justify-center">
                      UVM SEQUENCER
                    </div>
                    <div className="bg-slate-950 border border-slate-800 text-slate-400 text-center py-1.5 rounded text-[10px] flex items-center justify-center font-bold">
                      SCOREBOARD (Compares DUT vs Ref Model)
                    </div>
                    <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-300 text-center py-1.5 rounded text-[10px] flex items-center justify-center">
                      COVERAGE (Assert, Covergroups)
                    </div>
                  </div>
                  <div className="border border-dashed border-slate-700 p-2 text-center rounded text-[10px] text-slate-500">
                    UVM DRIVER ─── (VIRTUAL INTERFACE) ─── UVM MONITOR
                  </div>
                  <div className="bg-rose-950/40 border border-rose-900 text-rose-300 text-center py-1 rounded text-[10px] font-bold">
                    DESIGN UNDER TEST (DUT) - RTL REGISTER SPACE
                  </div>
                </div>
              </div>

              {/* Code Snippet - SystemVerilog Assertion */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">SYSTEMVERILOG BIND / ASSERTION SNAPSHOT</span>
                <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  <pre className="leading-5">
{`// Assertion: Detect buffer overruns in SRAM FIFO blocks
property p_fifo_no_overrun;
    @(posedge clk) disable iff (!rst_n)
    (fifo_write && fifo_full) |-> ##0 (!fifo_ack);
endproperty

assert_fifo_overrun: assert property (p_fifo_no_overrun)
    else \`uvm_error("FIFO_ERR", "Data write triggered during absolute FIFO overflow condition!")

// Covergroup: Validate address space access coverage
covergroup cg_sram_addr @(posedge clk);
    option.per_instance = 1;
    coverpoint sram_addr {
        bins lower_range = {[0 : 'h3FFF]};
        bins upper_range = {['h4000 : 'h7FFF]};
    }
endgroup`}
                  </pre>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-300 leading-relaxed">
                <h4 className="font-bold text-white border-b border-slate-800 pb-1 uppercase text-xs">UVM Verification Checkpoints</h4>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-400 text-[11.5px]">
                  <li><strong className="text-slate-200">Constraint-Random Stimulus</strong>: Avoid writing manual tests. Instead, program randomized constraints to hit corner-case scenarios (such as concurrent DMA and MAC activations).</li>
                  <li><strong className="text-slate-200">Functional Coverage</strong>: Define 100% covergroups to verify that all configurations, states, and register fields have been executed.</li>
                  <li><strong className="text-slate-200">Register Model (RAL)</strong>: Implement a mirror register block to track register states without querying physical wires, facilitating easier RTL checking.</li>
                </ul>
              </div>

            </div>
          )}

          {activeArticleId === "silicon-economics" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                <span className="text-indigo-400 font-bold">📊 SILICON ECONOMICS</span>
                <span>•</span>
                <span>WAFER YIELD MATHEMATICS</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5 MIN READ</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug">
                Silicon Economics: Deciphering Wafer Yield, Defect Densities, and Mask Costs
              </h2>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Why does a modern silicon chip cost so much? Silicon manufacturing economics is a brutal trade-off between fabrication node costs, mask set tooling, and the physical area of your die.
              </p>

              {/* Economic Formula Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                <h4 className="text-xs font-bold text-indigo-400 uppercase">The Yield Equation (Murphy's Model)</h4>
                <div className="bg-slate-900 p-4 rounded border border-slate-850 text-center space-y-2">
                  <p className="text-sm font-bold text-indigo-300">
                    Yield = [ (1 - e<sup>-A•D</sup>) / (A • D) ] <sup>2</sup>
                  </p>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Where <strong className="text-slate-300">A</strong> is the physical Die Area (mm²) and <strong className="text-slate-300">D</strong> is the Defect Density (defects/cm²). As die area rises, the probability of intercepting a crystal defect scales exponentially, reducing profitable wafer yields.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="space-y-1">
                    <span className="text-slate-500">Dies Per Wafer (DPW):</span>
                    <p className="text-slate-300 font-bold">DPW ≈ (π • d<sub>wafer</sub>² / 4A) - (π • d<sub>wafer</sub> / √2A)</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500">Gross Die Cost:</span>
                    <p className="text-slate-300 font-bold">Die Cost = Wafer Cost / (DPW • Yield %)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-300 leading-relaxed">
                <h4 className="font-bold text-white border-b border-slate-800 pb-1 uppercase text-xs">Node Economics Comparison</h4>
                <p>
                  A mask set (photolithographic plates used to print circuits) for 28nm costs roughly **$1.5 Million**. For bleeding-edge 3nm, a complete GAA mask set exceeds **$22 Million**. Consequently, designing modular chips (using smaller chiplet tiles on an interposer substrate) rather than monolithic giant dies is becoming necessary to stay commercially viable.
                </p>
              </div>

            </div>
          )}

          {activeArticleId === "thermal-hotspots" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                <span className="text-rose-400 font-bold">🔥 THERMAL MITIGATION</span>
                <span>•</span>
                <span>THERMODYNAMICS & THROTTLING</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 7 MIN READ</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight leading-snug">
                Mitigating Thermodynamic Hotspots with Dynamic Frequency Scaling (DVFS)
              </h2>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                In modern NPUs, millions of MACs pulsing at multi-gigahertz clocks create severe thermal gradients. Heat dissipation cannot keep up with localized dynamic power bursts. Left unchecked, local junction temperatures can exceed 125°C, triggering permanent gate oxide degradation or immediate thermal shutdown.
              </p>

              {/* Thermal feedback diagram */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                <h4 className="text-xs font-bold text-rose-400 uppercase">Closed-Loop Thermal Feedback System</h4>
                <div className="flex justify-around items-center border border-slate-850 p-3 rounded-lg bg-slate-900 text-center gap-2">
                  <div className="bg-slate-950 border border-slate-800 p-2 rounded text-[10px] flex-1">
                    <span className="text-rose-400 block font-bold">On-Die Sensor</span>
                    <p className="text-slate-500 text-[9px] mt-1">Measures core temp in real-time</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                  <div className="bg-slate-950 border border-slate-800 p-2 rounded text-[10px] flex-1">
                    <span className="text-amber-400 block font-bold">DVFS Controller</span>
                    <p className="text-slate-500 text-[9px] mt-1">Computes throttle thresholds</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                  <div className="bg-slate-950 border border-slate-800 p-2 rounded text-[10px] flex-1">
                    <span className="text-cyan-400 block font-bold">Clock Generator</span>
                    <p className="text-slate-500 text-[9px] mt-1">Reduces PLL multiplier or blocks clock gating</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-300 leading-relaxed">
                <h4 className="font-bold text-white border-b border-slate-800 pb-1 uppercase text-xs">Engineering Best Practices for Thermal Design</h4>
                <ul className="list-style-none space-y-1.5 text-slate-400 text-[11px]">
                  <li>
                    🚀 <strong className="text-slate-200">Proactive Gating</strong>: Do not wait for the chip to heat up. Gate unused vector arrays at the microarchitectural level within single-cycle latency when stall bubbles are detected.
                  </li>
                  <li>
                    🔋 <strong className="text-slate-200">DVFS Control Loops</strong>: Implement dynamic voltage and frequency scaling. Lowering operating voltage by 10% drops dynamic power dissipation by roughly 21% (P ∝ f•V²).
                  </li>
                  <li>
                    🌡️ <strong className="text-slate-200">Spatial Separation</strong>: Spread register files and compute blocks physically across the floorplan rather than clustering them together, preventing extreme localized hotspots.
                  </li>
                </ul>
              </div>

            </div>
          )}

        </div>

        {/* INTERACTIVE COMPLIANCE AUDIT / VERIFICATION SANDBOX */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left space-y-6">
          <div className="flex justify-between items-start border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-indigo-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold font-mono uppercase text-white tracking-wider">
                  Interactive Architect's Compliance Audit
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">TEST YOUR CHIP DESIGN & VALIDATION METHODOLOGY FOR TAPEOUT</p>
              </div>
            </div>
            
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
              <span className="text-[9px] text-slate-500 font-mono block uppercase">AUDIT COMPLIANCE SCORE</span>
              <span className={`text-base font-black font-mono ${
                score >= 85 ? "text-emerald-400" : score >= 65 ? "text-amber-400" : "text-red-400"
              }`}>
                {score}% {score >= 85 ? "TAPEOUT READY" : "REASSESS DESIGN"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Input choices */}
            <div className="space-y-4 text-xs font-mono">
              <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">VERIFICATION CHOICES</h4>
              
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px]">Stimulus & Bug Hunting Style:</label>
                <select
                  value={auditAnswers.verificationType}
                  onChange={(e) => setAuditAnswers({ ...auditAnswers, verificationType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="manual">Manual Directed Testcases (Poor coverage)</option>
                  <option value="random">UVM Constrained-Random (Industry Standard)</option>
                  <option value="formal">Mathematical Formal Verification (Highest Security)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px]">RTL Register Assertion Density:</label>
                <select
                  value={auditAnswers.assertionCount}
                  onChange={(e) => setAuditAnswers({ ...auditAnswers, assertionCount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="low">Low Assertion Count (&lt; 100 assertions)</option>
                  <option value="medium">Medium Assertion Density (Harness on core busses)</option>
                  <option value="high">High Verification Bindings (Coverage checkers on every buffer)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px]">Target Functional Coverage Goal (%):</label>
                <select
                  value={auditAnswers.coverageGoal}
                  onChange={(e) => setAuditAnswers({ ...auditAnswers, coverageGoal: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="75">75% (Quick Prototype/RISC-V research)</option>
                  <option value="90">90% (Consumer grade ASIC targets)</option>
                  <option value="95">95% (Automotive grade specifications)</option>
                  <option value="100">100% (High-Rel aerospace/mission critical)</option>
                </select>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditAnswers.hasThermalSensor}
                    onChange={(e) => setAuditAnswers({ ...auditAnswers, hasThermalSensor: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span className="text-slate-300 text-[11px]">Deploy Spatial Thermal Sensors (Prevents hotspots)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditAnswers.sramEcc}
                    onChange={(e) => setAuditAnswers({ ...auditAnswers, sramEcc: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span className="text-slate-300 text-[11px]">Enable ECC Protection in SRAM clusters (Fault tolerance)</span>
                </label>
              </div>
            </div>

            {/* Diagnostic Remarks */}
            <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
              <div className="space-y-3 font-mono">
                <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AUDITOR REMARKS & RECOMMENDATIONS</h4>
                
                {score >= 85 ? (
                  <div className="space-y-2">
                    <p className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> EXCELLENT COVERAGE AND TOLERANCE
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Your architecture utilizes extensive fault tolerance via SRAM ECC alongside rigorous pre-silicon validation. Target functional coverage thresholds are suitable for volume manufacturing. Spatial thermal sensors will successfully protect the silicon die from physical layout aging.
                    </p>
                  </div>
                ) : score >= 65 ? (
                  <div className="space-y-2">
                    <p className="text-amber-400 text-xs font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" /> PASSABLE DESIGN, HIGH CORNER CASE RISK
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      While basic verification is covered, the absence of ECC protection in the SRAM, low assertion density, or lower coverage goals exposes you to potential post-silicon failures. Consider activating verification checkers on inner buffer lanes to catch corner cases.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-red-400 text-xs font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 animate-pulse" /> HIGH CRITICAL DANGER PROFILE
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      A compliance score of {score}% is extremely risky for an ASIC design. Manual directed testcases leave more than 60% of logical states unexercised. High-density arrays without thermal gating or ECC structures are prone to rapid physical degradation or computational corruption.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-850 pt-3 mt-4 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                <span>REACTION MODE: ACTIVE</span>
                <span className="text-slate-400 font-bold">COREPICK VALIDATION SUITE v1.0</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
