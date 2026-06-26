/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Cpu, 
  BookOpen, 
  Terminal, 
  TrendingUp, 
  Thermometer, 
  ChevronRight, 
  Award, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  Code, 
  HelpCircle,
  FileText,
  ShieldAlert,
  Settings,
  Scale
} from "lucide-react";

interface HomePageProps {
  onNavigate: (
    view: "home" | "workspace" | "knowledge",
    middleTab?: "estimates" | "roofline" | "wafer" | "registers",
    rightTab?: "report" | "verification"
  ) => void;
}

interface SiliconPhase {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentClass: string;
  description: string;
  learnings: string[];
  jargon: { term: string; definition: string }[];
  targetAction: "workspace" | "knowledge";
  targetMiddleTab?: "estimates" | "roofline" | "wafer" | "registers";
  targetRightTab?: "report" | "verification";
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [activePhase, setActivePhase] = useState<string>("arch");

  const phases: SiliconPhase[] = [
    {
      id: "arch",
      title: "1. System Specification & Architecture",
      subtitle: "Product Definition & Block Architecture",
      icon: <Layers className="w-5 h-5" />,
      accentClass: "emerald",
      description: "Product managers and architects define the chip's core purpose, features, power constraints, and performance targets. Engineers create a high-level block diagram determining how the chip's components will interact, often incorporating existing reusable IP (Intellectual Property) blocks and chiplets.",
      learnings: [
        "Product Definition: Establishing application-level throughput targets, clock rate bounds, and strict thermal/power limits.",
        "Architecture Design: Creating block diagrams for memory hierarchies, bus connections, compute arrays, and cache coherence.",
        "IP blocks & Chiplets: Choosing custom blocks vs. reusable pre-verified commercial IPs and advanced modular packaging designs."
      ],
      jargon: [
        { term: "PPA", definition: "Power, Performance, and Area - the three major axes of silicon architecture optimization." },
        { term: "IP Block", definition: "Intellectual Property block - a pre-designed, reusable layout of a logic module used as a component." }
      ],
      targetAction: "workspace",
      targetMiddleTab: "estimates"
    },
    {
      id: "rtl",
      title: "2. RTL Design (Front-End)",
      subtitle: "Coding the hardware implementation",
      icon: <Code className="w-5 h-5" />,
      accentClass: "cyan",
      description: "Architects and design engineers write human-readable code using Hardware Description Languages (HDLs) like Verilog, SystemVerilog, or VHDL. This Register Transfer Level (RTL) code describes how data moves between hardware registers, establishing pipelined stages and combinational logic.",
      learnings: [
        "Hardware Description Languages: Translating logic functions into structural code with Verilog, SystemVerilog, or VHDL.",
        "Register Transfer Level (RTL): Describing digital signals and synchronous clock cycles regulating register transitions.",
        "Control vs. Data Path: Decoupling state machines (FSM) regulating scheduling from execution paths like MACs and ALUs."
      ],
      jargon: [
        { term: "HDL", definition: "Hardware Description Language - specialized computer languages used to program and specify digital hardware systems." },
        { term: "RTL", definition: "Register Transfer Level - high-level design abstraction describing register transactions and signal flows." }
      ],
      targetAction: "workspace",
      targetMiddleTab: "registers"
    },
    {
      id: "val",
      title: "3. Verification & Simulation",
      subtitle: "Bug hunting & functional correctness",
      icon: <Terminal className="w-5 h-5" />,
      accentClass: "indigo",
      description: "Engineers test the RTL code to verify its functionality under various conditions using simulation tools. This is the most time-consuming stage of chip design, often occupying over half of the development lifecycle to prevent incredibly expensive physical bugs.",
      learnings: [
        "Functional Bug Hunting: Simulating millions of clock cycles using stimulus generators to detect hardware race conditions.",
        "Universal Verification Methodology (UVM): The industry standard methodology for organizing stimulus, scoreboards, and drivers.",
        "SystemVerilog Assertions (SVA): Writing in-circuit sanity checks that immediately sound an alarm if logic invariants are broken."
      ],
      jargon: [
        { term: "UVM", definition: "Universal Verification Methodology - a standardized system class library in SystemVerilog for modular verification." },
        { term: "DUT", definition: "Design Under Test - the design block or full chip being verified inside the simulator." }
      ],
      targetAction: "workspace",
      targetMiddleTab: "estimates",
      targetRightTab: "verification"
    },
    {
      id: "synthesis",
      title: "4. Logic Synthesis",
      subtitle: "Translating abstract RTL to gate-level netlists",
      icon: <Cpu className="w-5 h-5" />,
      accentClass: "amber",
      description: "A synthesis tool translates the abstract, high-level RTL code into a gate-level netlist, which consists of standard logic gates (e.g., AND, OR, NOT) mapped to a specific semiconductor library provided by the foundry.",
      learnings: [
        "Standard Cell Library: Leveraging library-specific logic gates, flip-flops, and buffers supplied for the target process node.",
        "Gate-Level Netlist: The text-based logical topology detailing how standard cells are interconnected.",
        "Synthesis Constraints: Specifying timing goals, input delays, and area limits to guide optimization solvers."
      ],
      jargon: [
        { term: "Netlist", definition: "A list of digital components and connections (nets) between them, compiled from abstract HDL code." },
        { term: "Standard Cell", definition: "A pre-designed logic cell (such as a full adder or D flip-flop) of a standardized height." }
      ],
      targetAction: "workspace",
      targetMiddleTab: "estimates"
    },
    {
      id: "phys",
      title: "5. Physical Design (Back-End)",
      subtitle: "Placing gates, routing copper, & verifying rule checks",
      icon: <Settings className="w-5 h-5" />,
      accentClass: "rose",
      description: "Engineers map out the physical boundaries of the chip (floorplanning), and automated tools place individual gates and connect them with microscopic copper wires (P&R). Finally, Design Rule Checking (DRC) is performed against strict foundry manufacturing rules to ensure buildability.",
      learnings: [
        "Floorplanning & Macro Placement: Deciding where major blocks (like SRAMs, MAC arrays, and interfaces) sit on the physical die.",
        "Placement & Routing (P&R): Automatically placing millions of logic cells and choosing metal layer paths to wire them up.",
        "Design Rule Checking (DRC): Performing physical layout verification against micro-geometry foundry requirements to verify yield."
      ],
      jargon: [
        { term: "DRC", definition: "Design Rule Checking - verification validating that layout geometries meet precise manufacturing limits." },
        { term: "P&R", definition: "Placement and Routing - back-end physical design stage where cells are placed and connected on silicon layers." }
      ],
      targetAction: "workspace",
      targetMiddleTab: "estimates"
    },
    {
      id: "mask",
      title: "6. GDSII / Mask Generation",
      subtitle: "Creating the photolithography geometric blueprint",
      icon: <FileText className="w-5 h-5" />,
      accentClass: "emerald",
      description: "The finished physical layout is converted into a standard file format (typically GDSII or OASIS). These files serve as the absolute geometrical blueprint that tells the manufacturing facility (foundry) exactly how to print and layer the chip's physical structures.",
      learnings: [
        "GDSII & OASIS Formats: Standard database files detailing polygons, paths, text labels, and layering information.",
        "Photolithographic Mask Creation: Preparing the quartz glass masks used to expose light-sensitive photoresist onto wafers.",
        "Optical Proximity Correction (OPC): Modifying original layout polygons to compensate for light diffraction during wafer exposure."
      ],
      jargon: [
        { term: "GDSII", definition: "Graphic Database System II - the classic standard database file format for integrated circuit layout artwork." },
        { term: "Mask", definition: "A photographic template on glass used in lithography to define patterns on the wafer surface." }
      ],
      targetAction: "workspace",
      targetMiddleTab: "estimates"
    },
    {
      id: "fab",
      title: "7. Fabrication & Packaging",
      subtitle: "Foundry printing & physical encasement",
      icon: <TrendingUp className="w-5 h-5" />,
      accentClass: "cyan",
      description: "The GDSII file is sent to a semiconductor foundry where it is printed layer by layer onto silicon wafers using photolithography, ion implantation, and etching. The fragile silicon die is then cut and encased in a protective package with pins, enabling board mounting.",
      learnings: [
        "Photolithography: Using light to transfer geometric patterns from photomasks to light-sensitive chemical photoresist on the wafer.",
        "Etching & Implantation: Selectively removing silicon material or injecting ions into silicon grids to create conductive properties.",
        "Integrated Circuit Packaging: Protecting the delicate raw silicon die and creating physical copper/gold bond wires to outer pins."
      ],
      jargon: [
        { term: "Wafer", definition: "A thin slice of crystalline semiconductor material used as a substrate to fabricate integrated circuits." },
        { term: "Die", definition: "An individual rectangular block of silicon on a wafer containing a complete functional circuit." }
      ],
      targetAction: "workspace",
      targetMiddleTab: "wafer"
    },
    {
      id: "postval",
      title: "8. Post-Silicon Validation",
      subtitle: "Lab testing, extreme temperatures, & hardware characterization",
      icon: <Thermometer className="w-5 h-5" />,
      accentClass: "indigo",
      description: "Once physical chips return from the factory, they are tested in high-tech laboratories under extreme conditions of voltage, clock frequency, and temperature. This guarantees they meet strict performance benchmarks and operate correctly across all physical envelopes.",
      learnings: [
        "Lab Validation Boards: Custom boards designed to run physical silicon chips under complex high-speed signal analysis.",
        "Thermal & Voltage Characterization: Sweeping voltages and temperatures (e.g., -40°C to 125°C) to map operating limits.",
        "Hardware Errata Identification: Finding silicon bugs that slipped through simulation, documentable via hardware errata lists."
      ],
      jargon: [
        { term: "Errata", definition: "A published list of functional errors, bugs, or anomalies discovered in microprocessors after production." },
        { term: "Shmoo Plot", definition: "A visual graph representing silicon operational margins by sweeping voltage against frequency." }
      ],
      targetAction: "workspace",
      targetMiddleTab: "estimates",
      targetRightTab: "verification"
    }
  ];

  return (
    <div id="home-view-root" className="space-y-12 pb-12 animate-fade-in text-left">
      
      {/* HERO SECTION */}
      <section className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-8 md:p-12">
        {/* Glow ambient background elements */}
        <div className="absolute top-[-40px] right-[-40px] w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-40px] left-[-40px] w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs font-mono text-indigo-300 font-bold">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            Silicon Engineering Workspace & Sandbox
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-sans leading-tight">
            Master the Mechanics of <br className="hidden md:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
              Custom Silicon Engineering
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 font-mono leading-relaxed max-w-2xl">
            CorePick Architect is an interactive design and analysis sandbox built to help you explore, visualize, and understand the end-to-end silicon engineering lifecycle. From mapping architectural workloads and modeling roofline performance to analyzing wafer fabrication economics and generating RTL registers, this platform provides hands-on simulators to demystify and master key semiconductor concepts.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => onNavigate("workspace")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-950/50 flex items-center gap-2 transition-all group"
            >
              <span>LAUNCH EXPLORATION LAB</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate("knowledge")}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 font-bold font-mono text-xs px-6 py-3.5 rounded-xl flex items-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>EXPLORE PUBLICATIONS</span>
            </button>
          </div>
        </div>
      </section>

      {/* THREE-CARD QUICK INTRODUCERS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="font-bold text-sm text-white font-mono uppercase">Multi-Phase Co-Design</h3>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            Link high-level architectural metrics (SRAM arrays, system buses) with wafer defect modeling, static thermal limits, and logic gate costs instantly.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center">
            <Terminal className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="font-bold text-sm text-white font-mono uppercase">Pre-Silicon Validation</h3>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            Generate clean SystemVerilog register maps, testbenches, and UVM abstractions to simulate and audit logic coverage before physical tapeout.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-rose-400" />
          </div>
          <h3 className="font-bold text-sm text-white font-mono uppercase">Silicon Economics</h3>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            Evaluate Murphy's yield equation across cutting-edge nodes (3nm, 5nm, 7nm). Estimate die densities and fabrication budgets mathematically.
          </p>
        </div>
      </section>

      {/* INTERACTIVE DESIGN WORKFLOW PIPELINE */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-white">Your Silicon Co-Design Pipeline</h2>
            <p className="text-xs text-slate-500 font-mono">FOLLOW THIS LOGICAL INTERACTIVE PIPELINE FROM SPECS TO FABRICATION ECONOMICS</p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 uppercase">
            6 Core Laboratories
          </span>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 relative">
          {[
            {
              step: "01",
              title: "TUNE WORKLOAD",
              desc: "Define vision models or transformer parameters.",
              icon: <Layers className="w-4 h-4" />,
              accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40",
              middleTab: "estimates",
              rightTab: "report",
            },
            {
              step: "02",
              title: "FLOORPLAN DIE",
              desc: "Map MAC units and custom SRAM array boundaries.",
              icon: <Cpu className="w-4 h-4" />,
              accent: "text-teal-400 bg-teal-500/10 border-teal-500/20 hover:border-teal-500/40",
              middleTab: "estimates",
              rightTab: "report",
            },
            {
              step: "03",
              title: "ROOFLINE LIMITS",
              desc: "Model dynamic memory vs compute operational bounds.",
              icon: <Scale className="w-4 h-4" />,
              accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/40",
              middleTab: "roofline",
              rightTab: "report",
            },
            {
              step: "04",
              title: "FABRICATION COST",
              desc: "Solve Murphy yield equations across wafer nodes.",
              icon: <TrendingUp className="w-4 h-4" />,
              accent: "text-rose-400 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40",
              middleTab: "wafer",
              rightTab: "report",
            },
            {
              step: "05",
              title: "RTL REGISTERS",
              desc: "Export SystemVerilog hardware register blocks.",
              icon: <Code className="w-4 h-4" />,
              accent: "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40",
              middleTab: "registers",
              rightTab: "report",
            },
            {
              step: "06",
              title: "VERIFICATION",
              desc: "Run active UVM simulations & check line coverage.",
              icon: <Terminal className="w-4 h-4" />,
              accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40",
              middleTab: "estimates",
              rightTab: "verification",
            }
          ].map((item, index) => (
            <button
              key={item.step}
              onClick={() => onNavigate("workspace", item.middleTab as any, item.rightTab as any)}
              className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between text-left hover:border-slate-700 transition-all group relative"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold font-mono text-slate-600">STEP {item.step}</span>
                  <div className={`p-1.5 rounded-lg border ${item.accent} transition-colors`}>
                    {item.icon}
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black font-mono text-white tracking-tight uppercase group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono leading-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
              <div className="pt-3 mt-1 border-t border-slate-900 text-[9px] font-mono text-slate-600 flex justify-between items-center w-full">
                <span>Configure lab</span>
                <span className="group-hover:translate-x-1 transition-transform text-indigo-400 font-bold">➔</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CORE PHASES OF SILICON DESIGN & DEVELOPMENT */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-white">Silicon Design & Verification Phases</h2>
            <p className="text-xs text-slate-500 font-mono">LEARN THE CRITICAL STAGES OF SEMICONDUCTOR ASIC DEVELOPMENT</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Phase Navigation List (Left 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            {phases.map((phase) => {
              const isActive = activePhase === phase.id;
              let borderCol = "hover:bg-slate-900 border-slate-850";
              let textCol = "text-slate-300";
              let iconBg = "bg-slate-950 border-slate-850 text-slate-400";
              
              if (isActive) {
                if (phase.accentClass === "emerald") {
                  borderCol = "bg-emerald-600/5 border-emerald-500/40";
                  textCol = "text-emerald-400";
                  iconBg = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                } else if (phase.accentClass === "cyan") {
                  borderCol = "bg-cyan-600/5 border-cyan-500/40";
                  textCol = "text-cyan-400";
                  iconBg = "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
                } else if (phase.accentClass === "indigo") {
                  borderCol = "bg-indigo-600/5 border-indigo-500/40";
                  textCol = "text-indigo-400";
                  iconBg = "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
                } else if (phase.accentClass === "amber") {
                  borderCol = "bg-amber-600/5 border-amber-500/40";
                  textCol = "text-amber-400";
                  iconBg = "bg-amber-500/10 border-amber-500/20 text-amber-400";
                } else {
                  borderCol = "bg-rose-600/5 border-rose-500/40";
                  textCol = "text-rose-400";
                  iconBg = "bg-rose-500/10 border-rose-500/20 text-rose-400";
                }
              }

              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all font-mono ${borderCol}`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-all ${iconBg}`}>
                    {phase.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-bold block truncate leading-snug ${isActive ? textCol : "text-white"}`}>
                      {phase.title}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate leading-none mt-1">
                      {phase.subtitle}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-slate-400 translate-x-1" : "text-slate-600"}`} />
                </button>
              );
            })}
          </div>

          {/* Detailed Learnings Panel (Right 7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            {phases.map((phase) => {
              if (phase.id !== activePhase) return null;

              let themeColor = "indigo";
              let badgeStyle = "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
              if (phase.accentClass === "emerald") {
                themeColor = "emerald";
                badgeStyle = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
              } else if (phase.accentClass === "cyan") {
                themeColor = "cyan";
                badgeStyle = "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
              } else if (phase.accentClass === "amber") {
                themeColor = "amber";
                badgeStyle = "bg-amber-500/10 border-amber-500/20 text-amber-400";
              } else if (phase.accentClass === "rose") {
                themeColor = "rose";
                badgeStyle = "bg-rose-500/10 border-rose-500/20 text-rose-400";
              }

              return (
                <div key={phase.id} className="space-y-6 flex flex-col h-full justify-between animate-fade-in">
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${badgeStyle} uppercase`}>
                          CORE CURRICULUM
                        </span>
                        <h3 className="text-base font-bold text-white mt-1.5 font-mono">{phase.title}</h3>
                        <p className="text-xs text-slate-400 font-mono italic">{phase.subtitle}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${badgeStyle}`}>
                        {phase.icon}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-850">
                      {phase.description}
                    </p>

                    {/* Learnings list */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">KEY SYLLABUS TOPICS</h4>
                      <ul className="space-y-2">
                        {phase.learnings.map((learning, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs font-mono text-slate-300 leading-relaxed">
                            <span className={`text-${themeColor}-400 shrink-0 font-bold mt-0.5`}>•</span>
                            <span>{learning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Jargon Glossary */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">CRITICAL INDUSTRIAL JARGON</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
                        {phase.jargon.map((j, idx) => (
                          <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 space-y-0.5">
                            <span className={`text-[10px] font-bold text-${themeColor}-400 block uppercase`}>{j.term}</span>
                            <span className="text-[10.5px] text-slate-400 block leading-tight">{j.definition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-slate-850 pt-4 mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-mono">Interactive tool link is fully synchronized.</span>
                    <button
                      onClick={() => onNavigate(phase.targetAction, phase.targetMiddleTab, phase.targetRightTab)}
                      className={`w-full sm:w-auto bg-${themeColor}-600/10 hover:bg-${themeColor}-600/20 text-${themeColor}-400 border border-${themeColor}-500/30 font-bold font-mono text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all`}
                    >
                      {phase.targetAction === "workspace" ? (
                        <>
                          <Settings className="w-3.5 h-3.5" />
                          <span>LAUNCH IN EXPLORATION LAB</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>READ RELATED ARTICLE</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CORE SPEC TOOL PROMOTION (ONE SECTION FOR THIS TOOL) */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-left space-y-6 relative overflow-hidden">
        <div className="absolute right-[-40px] top-[-40px] w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 uppercase">
              INTERACTIVE SANDBOX
            </span>
            <h2 className="text-lg font-bold font-mono uppercase text-white">ASIC / NPU Exploration Lab</h2>
            <p className="text-xs text-slate-500 font-mono">AN EDUCATIONAL SIMULATION LAB TO EXPERIMENT WITH CHIP SPECS AND MODELS</p>
          </div>
          
          <button
            onClick={() => onNavigate("workspace")}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black font-mono text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-lg shadow-cyan-950/20 transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>OPEN EXPLORATION LAB</span>
          </button>
        </div>

        {/* Feature Bento Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <button
            onClick={() => onNavigate("workspace", "estimates")}
            className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-emerald-500/30 text-left space-y-2 transition-all hover:bg-slate-900/40 group relative overflow-hidden"
          >
            <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center justify-center">
              <Cpu className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-bold text-slate-200 block group-hover:text-emerald-400 transition-colors">Floorplan Visualizer</span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Map MAC units and SRAM blocks across actual physical square-millimeter boundaries inside deep sub-micron process nodes.
            </p>
            <span className="absolute bottom-2 right-3 text-[9px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
          </button>

          <button
            onClick={() => onNavigate("workspace", "roofline")}
            className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-cyan-500/30 text-left space-y-2 transition-all hover:bg-slate-900/40 group relative overflow-hidden"
          >
            <div className="w-7 h-7 bg-cyan-500/10 border border-cyan-500/20 rounded-md flex items-center justify-center">
              <Scale className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-bold text-slate-200 block group-hover:text-cyan-400 transition-colors">Roofline Model</span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Plot operational ceilings dynamically for standard AI models (Llama 3, ResNet) based on local memory and FLOPS.
            </p>
            <span className="absolute bottom-2 right-3 text-[9px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
          </button>

          <button
            onClick={() => onNavigate("workspace", "registers")}
            className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-indigo-500/30 text-left space-y-2 transition-all hover:bg-slate-900/40 group relative overflow-hidden"
          >
            <div className="w-7 h-7 bg-indigo-500/10 border border-indigo-500/20 rounded-md flex items-center justify-center">
              <Terminal className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-bold text-slate-200 block group-hover:text-indigo-400 transition-colors">RTL Auto-Generator</span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Generate synthesizing SystemVerilog code, memory bus mappings, and register mirrors automatically with custom configurations.
            </p>
            <span className="absolute bottom-2 right-3 text-[9px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
          </button>

          <button
            onClick={() => onNavigate("workspace", "wafer")}
            className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-rose-500/30 text-left space-y-2 transition-all hover:bg-slate-900/40 group relative overflow-hidden"
          >
            <div className="w-7 h-7 bg-rose-500/10 border border-rose-500/20 rounded-md flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-bold text-slate-200 block group-hover:text-rose-400 transition-colors">Wafer Defect Estimator</span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Calculate silicon wafer yield rates, Dies-Per-Wafer (DPW), and unit fabrication prices using industrial defect equations.
            </p>
            <span className="absolute bottom-2 right-3 text-[9px] text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>
          </button>
        </div>
      </section>

      {/* RECENT ARTICLES (ONE SECTION FOR THE BLOG) */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-white">Latest Technical Publications</h2>
              <p className="text-xs text-slate-500 font-mono">SOPHISTICATED CHIP DESIGN CASE-STUDIES & TUTORIALS</p>
            </div>
          </div>
          
          <button
            onClick={() => onNavigate("knowledge")}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold font-mono flex items-center gap-1"
          >
            <span>VIEW ALL PUBLICATIONS</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left flex flex-col justify-between hover:border-indigo-500/30 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">
                  MICROARCHITECTURE
                </span>
                <span className="text-[10px] font-mono text-slate-500">6 min read</span>
              </div>
              <h3 className="text-sm font-bold text-white font-mono">Systolic Arrays: Architecting High-Efficiency Compute Engines</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                An in-depth analysis of 2D MAC array dataflows, weight-stationary vs. output-stationary architectures, and wire delay optimization.
              </p>
            </div>
            <div className="border-t border-slate-850 pt-3 mt-4 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-mono">Published June 25, 2026</span>
              <button
                onClick={() => onNavigate("knowledge")}
                className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Read Article</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left flex flex-col justify-between hover:border-cyan-500/30 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-bold uppercase">
                  PRE-SILICON VALIDATION
                </span>
                <span className="text-[10px] font-mono text-slate-500">8 min read</span>
              </div>
              <h3 className="text-sm font-bold text-white font-mono">UVM Best Practices: Scaling Pre-Silicon RTL Verification</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                How to structure modular SystemVerilog testbenches with UVM agents, register abstraction layers (RAL), and dynamic assertions.
              </p>
            </div>
            <div className="border-t border-slate-850 pt-3 mt-4 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-mono">Published June 24, 2026</span>
              <button
                onClick={() => onNavigate("knowledge")}
                className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Read Article</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
