import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Cpu,
  ShieldCheck,
  Code2,
  Terminal,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  Send,
  Play,
  CheckCircle,
  TrendingUp,
  Bot,
  Video,
  Smartphone,
  Search,
  Lock,
  Volume2,
  Layers,
  Settings,
  Database,
  Calendar,
  DollarSign,
  BookOpen,
  Check,
  FileText,
  RefreshCw,
  Plus,
  ArrowRight,
  GitBranch,
  Star,
  Users,
  Globe,
  Building2,
  Trophy
} from 'lucide-react';
import { PROJECTS, EXPERIENCES, SKILLS } from './constants';
import { SpotlightCard } from './components/SpotlightCard';

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-12">
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-3xl md:text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-sans tracking-tight"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-[#7C3AED] font-mono text-xs uppercase tracking-widest font-semibold"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse movement for luxury hover portal glow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050816] text-[#e2e8f0] overflow-x-hidden font-sans selection:bg-[#7C3AED]/30 selection:text-white">
      {/* Interactive Cyber halo gradient background */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 opacity-30 md:opacity-50"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(124, 58, 237, 0.12), transparent 80%)`
        }}
      />

      {/* Background static cosmic assets */}
      <div className="absolute top-0 left-0 w-full h-[500px] radial-glow pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] radial-glow pointer-events-none z-0 opacity-40" />

      {/* Modern Fixed Header */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050816]/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 font-mono font-bold tracking-tighter text-xl cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-white">⚡</span>
            <span className="text-white hover:text-[#7C3AED] transition-colors">VD.AI</span>
          </motion.div>

          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#about" className="hover:text-[#7C3AED] transition-colors relative py-1 group">
              About <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#7C3AED] transition-all group-hover:w-full" />
            </a>
            <a href="#skills" className="hover:text-[#7C3AED] transition-colors relative py-1 group">
              Bento Stack <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#7C3AED] transition-all group-hover:w-full" />
            </a>
            <a href="#projects" className="hover:text-[#7C3AED] transition-colors relative py-1 group">
              Selected Works <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#7C3AED] transition-all group-hover:w-full" />
            </a>
            <a href="#experience" className="hover:text-[#7C3AED] transition-colors relative py-1 group">
              Experience <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#7C3AED] transition-all group-hover:w-full" />
            </a>
            <a href="#github-stats" className="hover:text-[#7C3AED] transition-colors relative py-1 group">
              Activity <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#7C3AED] transition-all group-hover:w-full" />
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="mailto:vivekdalvi5143@gmail.com"
              className="px-5 py-2 rounded-full border border-white/10 text-sm hover:border-[#7C3AED]/30 hover:bg-[#7C3AED]/10 text-slate-200 transition-all font-medium"
            >
              Get in touch
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-18 left-0 w-full z-40 bg-[#050816]/95 border-b border-white/10 backdrop-blur-2xl py-8 px-6 flex flex-col gap-6"
          >
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-[#7C3AED]">About</a>
            <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-[#7C3AED]">Bento Stack</a>
            <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-[#7C3AED]">Selected Works</a>
            <a href="#experience" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-[#7C3AED]">Experience</a>
            <a href="#github-stats" onClick={() => setMobileMenuOpen(false)} className="text-xl text-gray-300 hover:text-[#7C3AED]">Activity</a>
            <a
              href="mailto:vivekdalvi5143@gmail.com"
              className="py-3 text-center rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white font-semibold"
            >
              Get in touch
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative max-w-7xl mx-auto px-6 md:px-12 pt-36 pb-24 z-10 grid-bg">

        {/* Section 1: Hero Section */}
        <section className="min-h-[85vh] flex flex-col justify-center mb-32 relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left side text core info */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#a78bfa] text-xs font-mono mb-6">
                  <Sparkles size={12} className="animate-pulse" />
                  <span>Available for AI Engineer & LLM Developer Roles</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.05] mb-6 text-white font-sans">
                  Vivek Dalvi <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7C3AED] via-[#3B82F6] to-[#10B981]">
                    AI Engineer

                    Building Agentic AI, RAG & LLM-Powered Applications
                  </span>
                </h1>

                <h3 className="text-xl md:text-2xl font-semibold text-gray-300 mb-6 font-sans">
                  Building Agentic AI, RAG & LLM-Powered Applications
                </h3>

                <p className="text-base md:text-lg text-gray-400 max-w-2xl mb-10 leading-relaxed">
                  Building production-grade intelligent systems that combine Generative AI,
                  Retrieval-Augmented Generation, autonomous agents, and modern software engineering
                  to solve real-world problems.
                </p>

                <div className="flex flex-wrap gap-4 mb-10">
                  <a
                    href="#projects"
                    className="px-8 py-4 bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white font-bold rounded-xl shadow-lg shadow-[#7C3AED]/20 hover:scale-[1.03] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    View Projects <ChevronRight size={18} />
                  </a>
                  <a
                    href="https://drive.google.com/file/d/1UltzuS4Hg_R5iG88l78myh7F_EBaUViL/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-4 glass-card text-white hover:bg-white/5 font-semibold rounded-xl transition-all flex items-center gap-2"
                  >
                    View Resume <FileText size={18} className="text-gray-400" />
                  </a>
                  <a
                    href="#contact"
                    className="px-6 py-4 border border-white/10 hover:border-[#7C3AED]/50 text-gray-300 hover:text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                  >
                    Contact Me
                  </a>
                </div>

                <div className="flex gap-4 items-center">
                  <span className="text-xs font-mono uppercase tracking-widest text-gray-500">Profiles:</span>
                  <div className="h-[1px] w-12 bg-white/10" />
                  <div className="flex gap-3">
                    <a href="https://github.com/Vivek5143" target="_blank" rel="noopener" className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-[#7C3AED]/30 hover:bg-white/15 transition-all text-gray-400 hover:text-white" title="GitHub">
                      <Github size={18} />
                    </a>
                    <a href="https://linkedin.com/in/VivekDalvi5143" target="_blank" rel="noopener" className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-[#3B82F6]/30 hover:bg-white/15 transition-all text-gray-400 hover:text-white" title="LinkedIn">
                      <Linkedin size={18} />
                    </a>
                    <a href="mailto:vivekdalvi5143@gmail.com" className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-[#10B981]/30 hover:bg-white/15 transition-all text-gray-400 hover:text-white" title="Email">
                      <Mail size={18} />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right side interactive animated blueprint element */}
            <div className="lg:col-span-5 h-[400px] md:h-[500px] relative flex justify-center items-center">
              <SpotlightCard
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="w-full h-full flex flex-col p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <span className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <span className="font-mono text-xs text-gray-500">agent_orchestrator_v2.py</span>
                </div>

                {/* Visual rendering of active pipeline simulation */}
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#7C3AED]/20 text-[#a78bfa] border border-[#7C3AED]/20">
                        <Terminal size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-mono text-gray-500">USER INPUT</p>
                        <p className="text-sm font-semibold text-white">"Deploy an analytics agent with RAG fallback"</p>
                      </div>
                    </div>

                    <div className="h-[2px] bg-gradient-to-r from-transparent via-[#7C3AED]/30 to-transparent my-1" />

                    {/* Animated pipeline stages with light cues */}
                    <div className="ml-4 pl-4 border-l-2 border-[#7C3AED]/30 space-y-3">
                      <div className="flex items-center gap-2">
                        <LoaderIcon className="text-[#a78bfa] animate-spin" />
                        <span className="text-xs font-mono text-gray-300">Evaluating Query Intent...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-ping" />
                        <span className="text-xs font-mono text-[#34d399]">Routing to Vector Database</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#10B981]/20 text-[#34d399] rounded">k=5 retrieval</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight size={12} className="text-gray-500" />
                        <span className="text-xs font-mono text-gray-400">Filtering through Hallucination Layers</span>
                      </div>
                    </div>
                  </div>

                  {/* Neural Graph Visualisation overlay */}
                  <div className="relative h-28 glass-card border-dashed border-white/5 rounded-xl overflow-hidden p-3 flex justify-around items-center">
                    <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-[#050816]/90 via-transparent" />

                    {/* Visual nodes representing AI system components */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="p-2 rounded bg-[#7C3AED]/10 text-[#a78bfa] border border-[#7C3AED]/20 animate-bounce">
                        <Cpu size={14} />
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">Gemini</span>
                    </div>

                    <div className="w-10 h-[1px] border-b border-dashed border-[#7C3AED]/40" />

                    <div className="flex flex-col items-center gap-1">
                      <div className="p-2 rounded bg-[#3B82F6]/10 text-blue-400 border border-[#3B82F6]/20">
                        <Database size={14} />
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">FAISS</span>
                    </div>

                    <div className="w-10 h-[1px] border-b border-dashed border-[#3B82F6]/40" />

                    <div className="flex flex-col items-center gap-1">
                      <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Bot size={14} />
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">CrewAI</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-mono text-xs text-[#10B981] bg-[#10B981]/10 px-3 py-2 rounded-lg border border-[#10B981]/20">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                      SYSTEM STATUS: ONLINE
                    </span>
                    <span>LATENCY: 12ms</span>
                  </div>
                </div>
              </SpotlightCard>
            </div>

          </div>
        </section>

        {/* Section 2: About Me Section */}
        <section id="about" className="mb-32 relative">
          <SectionHeader title="About Me" subtitle="Who I Am" />

          <div className="grid lg:grid-cols-12 gap-12 items-stretch">

            {/* Left Side */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                <p>
                  I’m <span className="text-white font-semibold">Vivek Dalvi</span>, a Computer
                  Engineering graduate and AI Engineer passionate about building intelligent
                  systems using Generative AI, Machine Learning, and modern software
                  engineering to solve real-world problems.
                </p>

                <p>
                  My journey has been driven by hands-on learning and continuous exploration
                  of emerging AI technologies. I have developed projects such as
                  <span className="text-white"> CampusPal</span>, an AI-powered campus assistant
                  powered by Retrieval-Augmented Generation (RAG),
                  <span className="text-white"> EduDiff</span>, which converts natural language
                  into educational animations,
                  <span className="text-white"> TransactAI</span>, a hybrid financial transaction
                  categorization platform, and
                  <span className="text-white"> InstaClaim</span>, a privacy-first offline
                  insurance claim assistant using OCR and local language models.
                </p>

                <p>
                  During my internship at <span className="text-white">Data Science Wizards
                    (DSW)</span>, I worked on secure PII detection and encryption pipelines,
                  enterprise backend systems, and AI-powered solutions that emphasized
                  privacy, scalability, and reliability.I enjoy building production-ready AI systems that combine
                  Generative AI, Retrieval-Augmented Generation, and intelligent
                  automation to solve practical business problems.
                </p>
              </div>

              {/* Philosophy Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">

                <SpotlightCard
                  className="p-5 border-white/5"
                  glowColor="rgba(16,185,129,0.1)"
                  borderColor="rgba(16,185,129,0.2)"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="text-emerald-400" size={18} />
                    <span className="text-sm font-semibold text-white">
                      Security & Privacy
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    I believe trustworthy AI starts with secure design. My work focuses on
                    privacy-first architectures, responsible data handling, and building
                    systems that users can rely on.
                  </p>
                </SpotlightCard>

                <SpotlightCard
                  className="p-5 border-white/5"
                  glowColor="rgba(124,58,237,0.1)"
                  borderColor="rgba(124,58,237,0.2)"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Cpu className="text-purple-400" size={18} />
                    <span className="text-sm font-semibold text-white">
                      Engineering Philosophy
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    I enjoy building AI systems that retrieve relevant information,
                    automate workflows, and deliver practical solutions with reliability,
                    scalability, and real-world impact.
                  </p>
                </SpotlightCard>

              </div>
            </div>

            {/* Right Side Timeline */}

            <div className="lg:col-span-5 flex flex-col justify-center">
              <SpotlightCard
                className="p-8 border-white/10 space-y-8 flex-1 flex flex-col justify-around"
                glowColor="rgba(59,130,246,0.1)"
                borderColor="rgba(59,130,246,0.2)"
              >
                <h3 className="font-bold text-white text-xl font-sans border-b border-white/5 pb-4">
                  Education & Experience
                </h3>

                <div className="space-y-6">

                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center text-[#a78bfa] font-mono text-xs font-bold">
                      01
                    </div>

                    <div>
                      <h4 className="font-semibold text-white">
                        A.P. Shah Institute of Technology
                      </h4>

                      <p className="text-xs text-gray-400 font-mono">
                        Bachelor of Engineering (B.E.)
                        Computer Science Engineering
                        Specialization in Artificial Intelligence & Machine Learning
                      </p>

                      <p className="text-sm text-slate-300 mt-1">
                        CGPA:
                        <span className="text-[#10B981] font-bold"> 8.68 / 10</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/30 flex items-center justify-center text-[#60a5fa] font-mono text-xs font-bold">
                      02
                    </div>

                    <div>
                      <h4 className="font-semibold text-white">
                        Honors in Cyber Security
                      </h4>

                      <p className="text-xs text-gray-400 font-mono">
                        A.P. Shah Institute of Technology
                      </p>

                      <p className="text-sm text-slate-300 mt-1">
                        Strengthened my understanding of cybersecurity principles,
                        privacy-focused system design, and secure software development.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center text-[#34d399] font-mono text-xs font-bold">
                      03
                    </div>

                    <div>
                      <h4 className="font-semibold text-white">
                        Data Science Engineer Intern
                      </h4>

                      <p className="text-xs text-gray-400 font-mono">
                        Data Science Wizards • Aug 2025 – Feb 2026
                      </p>

                      <p className="text-sm text-slate-300 mt-1">
                        Worked on enterprise AI solutions, PII detection and encryption
                        pipelines using Microsoft Presidio, and scalable backend systems
                        for production environments.
                      </p>
                    </div>
                  </div>

                </div>

                <div className="pt-4 border-t border-white/5 flex items-center gap-8 text-slate-300 font-mono text-xs">

                  <div>
                    <span className="block text-xl font-bold text-white">7+</span>
                    <span className="text-gray-500 text-[10px]">
                      AI Projects Built
                    </span>
                  </div>

                  <div className="h-8 w-[1px] bg-white/5" />

                  <div>
                    <span className="block text-xl font-bold text-white">1</span>
                    <span className="text-gray-500 text-[10px]">
                      Industry Internship
                    </span>
                  </div>

                  <div className="h-8 w-[1px] bg-white/5" />

                  <div>
                    <span className="block text-xl font-bold text-white">8.68</span>
                    <span className="text-gray-500 text-[10px]">
                      CGPA
                    </span>
                  </div>

                </div>
              </SpotlightCard>
            </div>

          </div>
        </section>


        {/* Section 3: Tech Stack Bento Grid */}
        <section id="skills" className="mb-32 relative">
          <SectionHeader title="Technical Bento Grid" subtitle="Engineering Stack" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SKILLS.map((category, idx) => (
              <SpotlightCard
                key={category.title}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                glowColor={
                  idx % 3 === 0
                    ? "rgba(16, 185, 129, 0.1)"
                    : idx % 3 === 1
                      ? "rgba(124, 58, 237, 0.1)"
                      : "rgba(59, 130, 246, 0.1)"
                }
                borderColor={
                  idx % 3 === 0
                    ? "rgba(16, 185, 129, 0.25)"
                    : idx % 3 === 1
                      ? "rgba(124, 58, 237, 0.25)"
                      : "rgba(59, 130, 246, 0.25)"
                }
                className="p-6 flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                    <h3 className="text-[#a78bfa] font-mono text-xs uppercase tracking-widest">{category.title}</h3>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {category.skills.map((skill, sIdx) => (
                      <span
                        key={skill}
                        className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-gray-300 hover:text-white hover:bg-white/10 hover:border-[#7C3AED]/40 transition-colors duration-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>


              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* Section 4: Featured Works (Selected Projects alternate layouts) */}
        <section id="projects" className="mb-32">
          <SectionHeader title="Selected Works" subtitle="Operational Pipelines" />

          <div className="space-y-24">
            {PROJECTS.map((project, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={project.title}
                  className="group relative grid lg:grid-cols-12 gap-12 items-start"
                >
                  {/* Left-Right side project code content details */}
                  <div className={`lg:col-span-6 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <h3 className="text-3xl md:text-4xl font-extrabold text-white leading-tight font-sans tracking-tight">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono"
                            title="View Repository"
                          >
                            <Github size={14} />
                            <span>Code</span>
                          </a>
                        )}
                        {project.demoLink && (
                          <a
                            href={project.demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-semibold"
                            title="Live Demo Application"
                          >
                            <Globe size={14} />
                            <span>Live App</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-300 mb-6 text-base leading-relaxed font-sans">
                      {project.description}
                    </p>

                    <div className="space-y-4 mb-8">
                      {project.highlights.map((highlight, hIdx) => (
                        <div key={hIdx} className="flex gap-3 text-sm text-gray-400 leading-relaxed">
                          <CheckCircle size={16} className="text-[#10B981] shrink-0 mt-1" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                      {project.technologies.map(tech => (
                        <span key={tech} className="text-[10px] font-mono uppercase tracking-tighter px-2.5 py-1 bg-[#7C3AED]/10 text-[#a78bfa] border border-[#7C3AED]/20 rounded-lg">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right-Left Interactive Simulation Widget */}
                  <div className={`lg:col-span-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <SpotlightCard
                      className="h-[380px] p-5 shadow-2xl flex flex-col justify-between"
                      glowColor={
                        project.title === 'AtlasAI' ? 'rgba(59, 130, 246, 0.15)' :
                          project.title === 'AI Sports Quiz Agent' ? 'rgba(16, 185, 129, 0.15)' :
                            project.title === 'CampusPal' ? 'rgba(124, 58, 237, 0.12)' :
                              project.title === 'EduDiff' ? 'rgba(124, 58, 237, 0.12)' :
                                project.title === 'TransactAI' ? 'rgba(59, 130, 246, 0.12)' :
                                  project.title === 'InstaClaim' ? 'rgba(245, 158, 11, 0.12)' :
                                    project.title === 'Multi-Agent Platform' ? 'rgba(236, 72, 153, 0.12)' :
                                      project.title === 'Daily-Work-Logger' ? 'rgba(6, 182, 212, 0.12)' :
                                        'rgba(249, 115, 22, 0.12)'
                      }
                      borderColor={
                        project.title === 'AtlasAI' ? 'rgba(59, 130, 246, 0.3)' :
                          project.title === 'AI Sports Quiz Agent' ? 'rgba(16, 185, 129, 0.3)' :
                            project.title === 'CampusPal' ? 'rgba(124, 58, 237, 0.25)' :
                              project.title === 'EduDiff' ? 'rgba(124, 58, 237, 0.25)' :
                                project.title === 'TransactAI' ? 'rgba(59, 130, 246, 0.25)' :
                                  project.title === 'InstaClaim' ? 'rgba(245, 158, 11, 0.25)' :
                                    project.title === 'Multi-Agent Platform' ? 'rgba(236, 72, 153, 0.25)' :
                                      project.title === 'Daily-Work-Logger' ? 'rgba(6, 182, 212, 0.25)' :
                                        'rgba(249, 115, 22, 0.25)'
                      }
                    >

                      {/* Sub-Widget: Dynamic Interactive Simulations */}
                      {project.title === 'AtlasAI' && <AtlasAIWidget />}
                      {project.title === 'AI Sports Quiz Agent' && <SportsQuizWidget />}
                      {project.title === 'CampusPal' && <CampusPalWidget />}
                      {project.title === 'EduDiff' && <EduDiffWidget />}
                      {project.title === 'TransactAI' && <TransactAIWidget />}
                      {project.title === 'InstaClaim' && <InstaClaimWidget />}
                      {project.title === 'Multi-Agent Platform' && <MultiAgentWidget />}
                      {project.title === 'Daily-Work-Logger' && <WorkLoggerWidget />}
                      {project.title === 'Interview Assistant' && <InterviewAssistantWidget />}

                    </SpotlightCard>
                  </div>

                </div>
              );
            })}
          </div>
        </section>

        {/* Section 5: Experience Timeline */}
        <section id="experience" className="mb-32 relative">
          <SectionHeader title="The Professional Timeline" subtitle="Experience History" />

          <div className="max-w-4xl mx-auto space-y-12">
            {EXPERIENCES.map((exp, idx) => (
              <div
                key={exp.company}
                className="relative pl-8 md:pl-12 border-l border-white/10 group pb-4"
              >
                {/* Glowing target point */}
                <div className="absolute left-[-5px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#7C3AED] shadow-[0_0_12px_#7c3aed]" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="text-2xl font-extrabold text-white group-hover:text-[#7C3AED] transition-colors">{exp.company}</h3>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#7C3AED]/15 text-[#a78bfa] border border-[#7C3AED]/20 text-xs font-mono mt-1">
                      {exp.role}
                    </div>
                  </div>
                  <div className="text-left md:text-right font-mono text-sm">
                    <p className="text-slate-200">{exp.period}</p>
                    <p className="text-gray-500 text-xs">{exp.location}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {exp.highlights.map((h, i) => (
                    <div key={i} className="flex gap-3 text-sm text-gray-400 leading-relaxed font-sans">
                      <ChevronRight size={16} className="text-[#3B82F6] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Simulated GitHub Stats Dashboard (Activity Graph) */}
        <section id="github-stats" className="mb-32 relative">
          <SectionHeader title="Developer Analytics" subtitle="Contributions & Activity Track" />

          <SpotlightCard className="p-8 border-white/10 rounded-[24px]" glowColor="rgba(16, 185, 129, 0.12)" borderColor="rgba(16, 185, 129, 0.25)">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/5 mb-8">
              <div className="flex items-center gap-4">
                <Github size={36} className="text-slate-200" />
                <div>
                  <h3 className="font-extrabold text-xl font-sans text-white">Vivek5143 Performance Graph</h3>
                  <p className="text-xs text-gray-500 font-mono">Aggregated daily production git events</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center font-mono">
                  <span className="block text-2xl font-bold text-[#10B981]">1,480+</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Commits/Year</span>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="text-center font-mono">
                  <span className="block text-2xl font-bold text-[#7C3AED]">158 Days</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Current Streak</span>
                </div>
              </div>
            </div>

            {/* Custom Interactive Contribution visual block */}
            <div className="space-y-6">
              <div>
                <p className="text-xs font-mono text-slate-400 mb-3 flex justify-between">
                  <span>Commit Calendar Heatmap 2026</span>
                  <span className="text-gray-600">Legend: Less • ● ● ● ● • More</span>
                </p>

                {/* Simulated SVG Grid Squares of contributions */}
                <div className="grid grid-cols-12 md:grid-cols-24 gap-1.5 h-20">
                  {Array.from({ length: 48 }).map((_, idx) => {
                    const contributionWeights = [
                      'bg-white/5', 'bg-[#7C3AED]/20', 'bg-[#7C3AED]/40',
                      'bg-[#3B82F6]/30', 'bg-[#10B981]/50', 'bg-[#10B981]/80'
                    ];
                    const weightIndex = Math.floor(Math.sin(idx / 2 + 1) * 2.5 + 3) % contributionWeights.length;
                    return (
                      <div
                        key={idx}
                        className={`w-full rounded-md aspect-square ${contributionWeights[weightIndex]} border border-white/5 hover:border-white/20 transition-all cursor-pointer`}
                        title={`Activity weight: ${weightIndex}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Commit Timeline Highlights list */}
              <div className="grid md:grid-cols-3 gap-6 pt-4 font-mono text-xs text-slate-400">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[10px] uppercase text-[#7C3AED]">Featured Repository</span>
                  <h4 className="font-semibold text-white">CampusPal</h4>
                  <p className="text-slate-400 text-[11px]">RAG system optimized to fetch academic documents instantly.</p>
                  <div className="flex justify-between items-center text-slate-500 text-[10px]">
                    <span className="flex items-center gap-1"><Star size={10} /> 48 Stars</span>
                    <span className="flex items-center gap-1"><GitBranch size={10} /> 12 Forks</span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[10px] uppercase text-[#3B82F6]">Recent Build</span>
                  <h4 className="font-semibold text-white">EduDiff</h4>
                  <p className="text-slate-400 text-[11px]">Gemini 2.5 Flash Manim render workflow with secure Docker instances.</p>
                  <div className="flex justify-between items-center text-slate-500 text-[10px]">
                    <span className="flex items-center gap-1"><Star size={10} /> 36 Stars</span>
                    <span className="flex items-center gap-1"><GitBranch size={10} /> 8 Forks</span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[10px] uppercase text-[#10B981]">FinTech module</span>
                  <h4 className="font-semibold text-white">TransactAI</h4>
                  <p className="text-slate-400 text-[11px]">DistilBERT classification engine for offline SMS payment tagging.</p>
                  <div className="flex justify-between items-center text-slate-500 text-[10px]">
                    <span className="flex items-center gap-1"><Star size={10} /> 54 Stars</span>
                    <span className="flex items-center gap-1"><GitBranch size={10} /> 15 Forks</span>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </section>

        {/* Section 7: Modern Contact & CTA Section (Let's Build Something Amazing) */}
        <section id="contact" className="mb-20 pt-10">
          <SpotlightCard className="p-8 md:p-16 text-center max-w-4xl mx-auto space-y-8" glowColor="rgba(124, 58, 237, 0.15)" borderColor="rgba(124, 58, 237, 0.3)">
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#a78bfa] block">Core Connection Portal</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight font-sans">
                Let's Build Something Amazing.
              </h2>
              <p className="text-base text-gray-400 max-w-xl mx-auto">
                Always open to collaborate on bleeding-edge AI models, custom agentic workflows, or full-stack software development. Let's build what's next.
              </p>
            </div>

            <div className="flex justify-center">
              <a
                href="mailto:vivekdalvi5143@gmail.com"
                className="px-8 py-5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] text-white font-extrabold text-lg shadow-xl hover:scale-[1.04] transition-all flex items-center gap-3 animate-pulse"
              >
                Send Direct Email <Mail size={22} />
              </a>
            </div>

            {/* Custom Interactive Feedback details */}
            <div className="pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs font-mono text-slate-400">
              <div className="p-3">
                <span className="block text-white font-bold text-base mb-1">Email</span>
                <span className="text-[10px] break-all">vivekdalvi5143@gmail.com</span>
              </div>
              <div className="p-3">
                <span className="block text-white font-bold text-base mb-1">LinkedIn</span>
                <span className="text-[10px]">linkedin/VivekDalvi5143</span>
              </div>
              <div className="p-3">
                <span className="block text-white font-bold text-base mb-1">GitHub</span>
                <span className="text-[10px]">github.com/Vivek5143</span>
              </div>
              <div className="p-3">
                <span className="block text-white font-bold text-base mb-1">Location</span>
                <span className="text-[10px]">Thane, India</span>
              </div>
            </div>
          </SpotlightCard>
        </section>

      </main>

      {/* Styled Footer */}
      <footer className="border-t border-white/5 py-12 relative z-10 bg-[#050816]/90">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <span className="font-mono font-bold text-gradient-purple tracking-tighter text-2xl block">VD.AI</span>
            <p className="text-gray-500 text-sm">"Building AI that doesn't just generate answers—but understands, reasons, retrieves, and acts."</p>
          </div>
          <div className="text-gray-500 text-xs font-mono space-y-2 md:text-right">
            <p>© 2026 Vivek Dalvi. All Rights Reserved.</p>
            <p>Designed and built with React, TypeScript, and modern AI technologies.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Custom simple LoaderIcon
function LoaderIcon({ className, size = 12 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/* ==========================================================================
   INTERACTIVE SCREENSHOT SIMULATION SUB-COMPONENTS
   ========================================================================== */

/**
 * 1. AtlasAI Discovery & RAG Research Widget
 */
function AtlasAIWidget() {
  const [selectedCompany, setSelectedCompany] = useState<'NVIDIA' | 'Stripe' | 'OpenAI'>('NVIDIA');
  const [isResearching, setIsResearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'askatlas'>('overview');
  const [query, setQuery] = useState('Key revenue drivers and AI architecture');
  const [ragResponse, setRagResponse] = useState<string | null>(
    "AskAtlas RAG: NVIDIA dominates enterprise AI compute with Hopper (H100/H200) and Blackwell (B200) architectures. Key revenue is driven by Data Center compute systems and NVLink clusters."
  );

  const companyData = {
    NVIDIA: {
      domain: 'nvidia.com',
      confidence: '98%',
      verifiedSources: 12,
      industry: 'Semiconductors & AI Hardware',
      hq: 'Santa Clara, CA',
      news: 'Blackwell GPU production scaling up; high enterprise demand reported across cloud providers.'
    },
    Stripe: {
      domain: 'stripe.com',
      confidence: '96%',
      verifiedSources: 10,
      industry: 'Financial Infrastructure & Payments',
      hq: 'San Francisco, CA',
      news: 'Expanded crypto payout APIs and automated fraud detection models for global merchant checkout.'
    },
    OpenAI: {
      domain: 'openai.com',
      confidence: '97%',
      verifiedSources: 15,
      industry: 'Artificial Intelligence Research',
      hq: 'San Francisco, CA',
      news: 'Unveiled advanced reasoning models and enterprise API multi-modal agentic workflows.'
    }
  };

  const currentCompany = companyData[selectedCompany];

  const handleRunResearch = () => {
    if (isResearching) return;
    setIsResearching(true);
    setRagResponse(null);

    setTimeout(() => {
      setIsResearching(false);
      if (selectedCompany === 'NVIDIA') {
        setRagResponse("AskAtlas RAG: NVIDIA's Blackwell architecture delivers 2.5x higher FP8 training performance with 30x lower energy consumption for LLM inference clusters.");
      } else if (selectedCompany === 'Stripe') {
        setRagResponse("AskAtlas RAG: Stripe handles over $1T in annual payment volume with 99.999% SLA, offering AI-driven billing orchestration and unified checkout services.");
      } else {
        setRagResponse("AskAtlas RAG: OpenAI powers enterprise intelligence with GPT-4o and o1 reasoning models through low-latency API endpoints and custom fine-tuning pipelines.");
      }
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full text-left font-sans text-xs">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-[#3B82F6]" />
          <span className="font-bold text-white uppercase tracking-wider text-xs">AtlasAI • Company Intelligence Engine</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">Verified DB</span>
      </div>

      {/* Company Selector Buttons */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          {(['NVIDIA', 'Stripe', 'OpenAI'] as const).map(comp => (
            <button
              key={comp}
              onClick={() => {
                setSelectedCompany(comp);
                setRagResponse(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${selectedCompany === comp
                ? 'bg-[#3B82F6] text-white font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              {comp}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-2 py-1 text-[9px] font-mono rounded cursor-pointer ${activeTab === 'overview' ? 'text-white border-b border-[#3B82F6] font-bold' : 'text-gray-500'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('askatlas')}
            className={`px-2 py-1 text-[9px] font-mono rounded cursor-pointer ${activeTab === 'askatlas' ? 'text-white border-b border-[#3B82F6] font-bold' : 'text-gray-500'}`}
          >
            AskAtlas RAG
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-3 overflow-y-auto flex flex-col justify-between min-h-[140px] max-h-[190px]">
        {activeTab === 'overview' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
              <div>
                <h4 className="font-bold text-white text-sm">{selectedCompany}</h4>
                <p className="text-[10px] text-gray-400 font-mono">{currentCompany.domain} • {currentCompany.hq}</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[9px] text-gray-500 block">Verification Score</span>
                <span className="text-emerald-400 font-bold text-xs">{currentCompany.confidence}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-gray-500 block font-mono text-[9px]">INDUSTRY</span>
                <span className="text-slate-200 font-medium">{currentCompany.industry}</span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <span className="text-gray-500 block font-mono text-[9px]">SOURCES VERIFIED</span>
                <span className="text-blue-400 font-medium">{currentCompany.verifiedSources} Sources Checked</span>
              </div>
            </div>

            <div className="bg-[#3B82F6]/10 border border-[#3B82F6]/20 p-2 rounded-lg text-[10px] text-slate-300">
              <span className="text-[#60a5fa] font-mono font-semibold block text-[9px] uppercase mb-0.5">News Intelligence Feed</span>
              <p>{currentCompany.news}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 font-mono text-[10px]">
            <div className="text-gray-400 flex items-center justify-between">
              <span>Querying RAG Vector Index (FAISS + BAAI)</span>
              <span className="text-[#3B82F6]">k=5 embeddings</span>
            </div>

            <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-slate-300">
              <span className="text-gray-500 block text-[8px]">PROMPT:</span>
              <p className="text-white">{query}</p>
            </div>

            {isResearching ? (
              <div className="p-3 bg-[#3B82F6]/10 text-[#60a5fa] rounded-lg border border-[#3B82F6]/20 flex items-center gap-2">
                <LoaderIcon className="animate-spin" size={12} />
                <span>Generating grounded RAG research report...</span>
              </div>
            ) : ragResponse ? (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-slate-200 rounded-lg space-y-1">
                <span className="text-emerald-400 font-bold block text-[9px]">GROUNDED RESPONSE:</span>
                <p className="leading-relaxed">{ragResponse}</p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-2.5 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="AskAtlas company query..."
          disabled={isResearching}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#3B82F6]/50"
        />
        <button
          onClick={() => {
            setActiveTab('askatlas');
            handleRunResearch();
          }}
          disabled={isResearching}
          className="px-3 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs rounded-lg flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Search size={12} /> Research
        </button>
      </div>
    </div>
  );
}

/**
 * 2. AI Sports Quiz Agent Interactive Widget
 */
function SportsQuizWidget() {
  const [selectedSport, setSelectedSport] = useState<'Football' | 'Basketball' | 'Cricket'>('Football');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Hard');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const quizQuestions = {
    Football: {
      question: "Which country won the 2022 FIFA World Cup and who won the Golden Ball?",
      options: [
        "France • Kylian Mbappé",
        "Argentina • Lionel Messi",
        "Croatia • Luka Modrić",
        "Brazil • Vinícius Júnior"
      ],
      correct: 1,
      explanation: "Argentina defeated France on penalties in Qatar 2022, and Lionel Messi won the Golden Ball as the tournament's best player."
    },
    Basketball: {
      question: "Who holds the record for all-time total points scored in NBA regular season history?",
      options: [
        "Kareem Abdul-Jabbar",
        "Michael Jordan",
        "LeBron James",
        "Kobe Bryant"
      ],
      correct: 2,
      explanation: "LeBron James surpassed Kareem Abdul-Jabbar in February 2023 to become the NBA's all-time leading scorer."
    },
    Cricket: {
      question: "Which team won the ICC Men's T20 World Cup in 2024?",
      options: [
        "South Africa",
        "Australia",
        "England",
        "India"
      ],
      correct: 3,
      explanation: "India defeated South Africa in a thrilling final in Barbados to claim the 2024 ICC Men's T20 World Cup title."
    }
  };

  const currentQuiz = quizQuestions[selectedSport];

  const handleRegenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setSelectedOption(null);

    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  };

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === currentQuiz.correct) {
      setScore(prev => prev + 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full text-left font-sans text-xs">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-[#10B981]" />
          <span className="font-bold text-white uppercase tracking-wider text-xs">AI Sports Quiz Agent</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-gray-400">Score: <strong className="text-emerald-400">{score}</strong></span>
          <span className="bg-[#10B981]/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-400/20">ChromaDB + Groq</span>
        </div>
      </div>

      {/* Sport and Difficulty Controls */}
      <div className="flex items-center justify-between gap-2 mb-2 font-mono text-[10px]">
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          {(['Football', 'Basketball', 'Cricket'] as const).map(s => (
            <button
              key={s}
              onClick={() => {
                setSelectedSport(s);
                setSelectedOption(null);
              }}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${selectedSport === s
                ? 'bg-emerald-500 text-black font-bold shadow'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(['Easy', 'Medium', 'Hard'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${difficulty === d ? 'text-emerald-400 font-bold border-b border-emerald-400' : 'text-gray-500'
                }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 bg-black/40 border border-white/5 rounded-xl p-3 overflow-y-auto flex flex-col justify-between min-h-[140px] max-h-[190px]">
        {isGenerating ? (
          <div className="my-auto text-center space-y-2 py-4">
            <LoaderIcon className="animate-spin text-emerald-400 mx-auto" size={20} />
            <span className="text-[10px] font-mono text-gray-400 block">Retrieving fact chunks from ChromaDB & Tavily...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="font-semibold text-white text-xs leading-snug">
              {currentQuiz.question}
            </p>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {currentQuiz.options.map((opt, i) => {
                const isSelected = selectedOption === i;
                const isCorrect = i === currentQuiz.correct;
                let btnStyle = "bg-white/5 text-gray-300 border-white/5 hover:border-emerald-500/30";

                if (selectedOption !== null) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold";
                  } else if (isSelected) {
                    btnStyle = "bg-red-500/20 text-red-300 border-red-500/50";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    disabled={selectedOption !== null}
                    className={`p-2 text-left rounded-lg border text-[10px] transition-all cursor-pointer ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selectedOption !== null && (
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-[9px] font-mono leading-relaxed mt-2">
                <span className="font-bold block uppercase mb-0.5">Factual Explanation (Groq Llama 3.3):</span>
                {currentQuiz.explanation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="mt-2.5">
        <button
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={12} /> Generate Fresh Quiz Question (Tavily Grounded)
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   INTERACTIVE SCREENSHOT SIMULATION SUB-COMPONENTS
   ========================================================================== */

/**
 * 1. CampusPal Chat & RAG assistant Simulator Widget
 */
function CampusPalWidget() {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; sources?: string[] }>>([
    { sender: 'user', text: "What are the placement opportunities at APSIT?" },
    { sender: 'ai', text: "APSIT has an outstanding placement record with 150+ core companies visiting each year. The highest package stands at 32 LPA, and the average package is 6.6 LPA.", sources: ["placement_2024.pdf", "official_brochure.pdf"] }
  ]);
  const [inputText, setInputText] = useState('');
  const [pipelineState, setPipelineState] = useState<'idle' | 'routing' | 'retrieving' | 'hallucination_check' | 'typing'>('idle');

  const presetQuestions = [
    "What is the average packages at APSIT?",
    "Tell me about Cyber Security honors course."
  ];

  const handleTriggerQuery = (query: string) => {
    if (pipelineState !== 'idle') return;
    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text: query }]);

    // Simulate RAG pipeline step by step
    setPipelineState('routing');
    setTimeout(() => {
      setPipelineState('retrieving');
      setTimeout(() => {
        setPipelineState('hallucination_check');
        setTimeout(() => {
          setPipelineState('idle');
          let responseText = "";
          let sourcesList: string[] = [];
          if (query.includes("packages")) {
            responseText = "Average packages offered stand at 6.6 LPA with leading recruiting agencies such as Capgemini, TCS, Amazon and Accenture hiring major cohorts.";
            sourcesList = ["placement_report.pdf"];
          } else {
            responseText = "The Cyber Security Honors track includes complex threat intelligence courses, cryptographic defenses, and advanced compliance standards with 8.54 benchmark criteria.";
            sourcesList = ["honors_curriculum.pdf"];
          }
          setMessages(prev => [...prev, { sender: 'ai', text: responseText, sources: sourcesList }]);
        }, 1200);
      }, 1000);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col h-full text-left justify-between pr-1">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] animate-pulse" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">CampusPal - Live Workspace RAG</span>
        </div>
        <span className="text-[10px] font-mono text-gray-500">FAISS index: v3</span>
      </div>

      {/* RAG pipeline processing ribbon active status feedback */}
      <AnimatePresence>
        {pipelineState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-3 py-1.5 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-mono flex items-center justify-between border border-[#3B82F6]/20 mb-2"
          >
            <span className="flex items-center gap-2">
              <LoaderIcon className="animate-spin" />
              {pipelineState === 'routing' && 'Hybrid ReAct Agent: Routing Query...'}
              {pipelineState === 'retrieving' && 'FAISS Search: Fetching Vectors (k=5)...'}
              {pipelineState === 'hallucination_check' && 'RAG Defense: Filtering Hallucinatory Tokens...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message stream panel */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin max-h-[190px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[9px] text-gray-500 mb-1 font-mono">{m.sender === 'user' ? 'YOU' : 'CampusPal Agent'}</span>
            <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed font-sans ${m.sender === 'user' ? 'bg-[#7C3AED]/20 text-[#e9d5ff] rounded-tr-none' : 'bg-white/5 text-slate-300 rounded-tl-none'}`}>
              <p>{m.text}</p>

              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[8px] font-mono text-[#10B981] font-semibold uppercase">Sources extracted:</span>
                  {m.sources.map(src => (
                    <span key={src} className="text-[8px] font-mono bg-white/5 text-gray-400 px-1 rounded">{src}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input query triggering and suggestions prompts */}
      <div className="mt-3 space-y-2">
        <div className="flex gap-1.5 overflow-x-auto py-1">
          {presetQuestions.map(q => (
            <button
              key={q}
              disabled={pipelineState !== 'idle'}
              onClick={() => handleTriggerQuery(q)}
              className="px-2.5 py-1 text-[9px] font-sans bg-white/5 border border-white/10 hover:border-[#3B82F6]/30 hover:bg-white/10 rounded-full text-slate-300 transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 2. EduDiff Animated Prompt-to-Video sequences Widget
 */
function EduDiffWidget() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState('Explain Pythagorean Theorem');

  const triggerAnimation = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setProgress(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  return (
    <div className="flex-1 flex flex-col justify-between h-full text-left">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5 font-mono text-xs text-gray-400">
        <span className="font-bold text-white uppercase tracking-wider">EduDiff • Gemini-to-Manim Render Engine</span>
        <span>Quality: 1080p (Fast)</span>
      </div>

      {/* Code viewport container */}
      <div className="flex-1 rounded-xl bg-black/40 border border-white/5 overflow-hidden flex flex-col justify-between p-4 relative min-h-[140px]">
        {progress > 0 && progress < 100 ? (
          // Display compiling math code lines in progress
          <div className="space-y-2 font-mono text-[10px] text-[#a78bfa]">
            <p className="text-gray-500 flex items-center gap-2"><LoaderIcon className="animate-spin" /> Transpiling Prompt via Gemini 2.5 Flash...</p>
            <p className="text-[#34d399] ml-2">class PythagoreanProof(Scene):</p>
            <p className="text-[#60a5fa] ml-4">def construct(self):</p>
            <p className="text-slate-400 ml-6">triangle = RightTriangle(side_a=3, side_b=4)</p>
            <p className="text-slate-400 ml-6">self.play(Create(triangle), run_time=1.5)</p>
            <p className="text-slate-400 ml-6">self.play(Write(MathTex("a^2 + b^2 = c^2")))</p>
          </div>
        ) : progress === 100 ? (
          // Completed rendering visual state
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-[#050816]/90 p-4">
            <svg viewBox="0 0 100 100" className="w-18 h-18 text-[#7C3AED] mb-1">
              <polygon points="20,80 80,80 80,20" fill="none" stroke="currentColor" strokeWidth="3" />
              <text x="45" y="88" fill="white" fontSize="10" className="font-mono">a=3</text>
              <text x="85" y="50" fill="white" fontSize="10" className="font-mono">b=4</text>
              <text x="40" y="45" fill="#10B981" fontSize="10" className="font-semibold font-mono">c=5</text>
            </svg>
            <span className="text-[10px] font-mono text-[#10B981] font-semibold uppercase flex items-center gap-1.5">
              <CheckCircle size={10} /> Finished Rendering MP4 (100%)
            </span>
          </div>
        ) : (
          // Idle state
          <div className="my-auto text-center space-y-1">
            <Video className="text-[#7C3AED]/30 mx-auto" size={40} />
            <p className="text-xs text-slate-400 font-sans">Convert math ideas into publication quality animated clips</p>
          </div>
        )}

        {/* Live rendering percentage track bar */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#7C3AED] to-[#3B82F6]" style={{ width: `${progress}%` }} />
        )}
      </div>

      {/* Button workflow actions */}
      <div className="mt-4 flex gap-3 items-center">
        <input
          type="text"
          value={currentPrompt}
          onChange={(e) => setCurrentPrompt(e.target.value)}
          disabled={isPlaying}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED]/50"
        />
        <button
          onClick={triggerAnimation}
          disabled={isPlaying}
          className="px-4 py-2 bg-[#7C3AED] hover:bg-[#7C3AED]/80 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Play size={12} fill="white" /> Render
        </button>
      </div>
    </div>
  );
}

/**
 * 3. TransactAI Analytics & Classification simulator
 */
function TransactAIWidget() {
  const [spentData, setSpentData] = useState({ totalRecs: 2548, spentAmt: 245760 });
  const [recentTrans, setRecentTrans] = useState([
    { title: 'Amazon Pay (UPI)', category: 'Shopping', amount: 1299, time: '10:24 AM' },
    { title: 'HDFC Bank Alert', category: 'Utilities', amount: 350, time: '09:12 AM' }
  ]);
  const [isClassifying, setIsClassifying] = useState(false);

  const simulateAlert = () => {
    if (isClassifying) return;
    setIsClassifying(true);

    setTimeout(() => {
      // Prepend mock transaction to array
      setRecentTrans(prev => [
        { title: 'Zomato Food Delivery', category: 'Food (Rules Engine Fallback)', amount: 610, time: 'Just Now' },
        ...prev.slice(0, 2)
      ]);
      setSpentData(prev => ({
        totalRecs: prev.totalRecs + 1,
        spentAmt: prev.spentAmt + 610
      }));
      setIsClassifying(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full text-left font-sans">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2 font-mono text-xs text-gray-400">
        <span className="font-bold text-white uppercase tracking-wider">TransactAI Dashboard Mock</span>
        <span className="text-[#10B981]">Fine-tuned DistilBERT: Loaded</span>
      </div>

      {/* Metrics layout summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <span className="text-[10px] text-gray-500 font-mono">TOTAL TRANSACTIONS</span>
          <span className="block text-lg font-bold text-white">{spentData.totalRecs}</span>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <span className="text-[10px] text-gray-500 font-mono">TOTAL EXPENDITURE</span>
          <span className="block text-lg font-bold text-emerald-400">₹{spentData.spentAmt.toLocaleString()}</span>
        </div>
      </div>

      {/* Interactive SMS trigger feed */}
      <div className="space-y-2 max-h-[140px] overflow-y-auto">
        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block font-semibold">Real-time Transaction Stream</span>

        {isClassifying ? (
          <div className="p-3 bg-[#10B981]/15 text-[#10B981] rounded-xl border border-[#10B981]/30 flex items-center justify-between font-mono text-xs">
            <span className="flex items-center gap-2"><LoaderIcon className="animate-spin" /> Classifying SMS alert via DistilBERT...</span>
            <span>Batch evaluation</span>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTrans.map((tr, i) => (
              <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">{tr.title}</h4>
                    <p className="text-[9px] text-gray-500 uppercase">{tr.time} • parsed via mobile notification link</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-200">₹{tr.amount}</span>
                  <span className="text-[8px] px-1.5 py-0.5 bg-white/5 text-slate-400 rounded uppercase tracking-tighter">{tr.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Button simulation handler */}
      <div className="mt-4">
        <button
          onClick={simulateAlert}
          disabled={isClassifying}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <Smartphone size={14} /> Simulate UPI Payment Notification
        </button>
      </div>
    </div>
  );
}

/**
 * 4. InstaClaim Offline Claims Assistant Widget
 */
function InstaClaimWidget() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<null | { insurer: string; amount: string; date: string }>(null);

  const triggerScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        insurer: 'CityCare Hospital',
        amount: '₹6,300',
        date: '12/05/2026'
      });
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full text-left">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2 font-mono text-xs text-gray-400">
        <span className="font-bold text-[#f59e0b] uppercase tracking-wider">InstaClaim Private Offline OCR Tool</span>
        <span className="text-red-400 px-1 bg-red-400/10 rounded">Phi-3 Local LLM</span>
      </div>

      {/* Scanning interactive workspace container */}
      <div className="flex-1 glass-card border-dashed border-white/10 rounded-xl overflow-hidden p-4 relative flex flex-col justify-center min-h-[140px]">

        {isScanning && (
          // Laser scrolling scan beam visual effect
          <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center">
            <div className="w-10 h-10 border-4 border-dashed border-[#f59e0b] rounded-full animate-spin mb-2" />
            <span className="text-[10px] font-mono text-[#f59e0b] tracking-wider uppercase animate-pulse">Running Tesseract OCR Scanning...</span>
            <div className="absolute top-0 inset-x-0 h-0.5 bg-[#f59e0b]/80 shadow-[0_0_12px_#f59e0b] animate-bounce w-full" />
          </div>
        )}

        {scanResult ? (
          // Discovered structured output
          <div className="space-y-3 font-mono text-xs">
            <span className="text-[9px] text-[#f59e0b] font-bold uppercase block border-b border-[#f59e0b]/20 pb-1">Extracted Metadata</span>
            <div className="space-y-1 text-slate-300 text-[10px]">
              <p>🏥 HOSPITAL: <span className="text-white font-semibold">{scanResult.insurer}</span></p>
              <p>📅 CLAIM DATE: <span className="text-white">{scanResult.date}</span></p>
              <p>💰 EXTRACTED AMOUNT: <span className="text-[#10B981] font-bold">{scanResult.amount}</span></p>
            </div>
            <div className="bg-[#10B981]/15 text-emerald-400 rounded px-2.5 py-1.5 text-[9px] flex items-center gap-1.5 font-bold">
              <Check size={10} /> Injected to local Ollama workspace memory perfectly.
            </div>
          </div>
        ) : !isScanning && (
          // Upload documents area
          <div className="text-center my-auto space-y-2">
            <FileText className="text-[#f59e0b]/40 mx-auto" size={36} />
            <p className="text-xs text-slate-400">Private offline policy PDF uploads</p>
            <span className="text-[8px] font-mono text-gray-500">Secure: Uploads never touch any public servers</span>
          </div>
        )}
      </div>

      {/* Button action trigger */}
      <div className="mt-4">
        <button
          onClick={triggerScan}
          disabled={isScanning}
          className="w-full py-2.5 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50"
        >
          <Search size={14} /> Scan Paper Document (Tesseract OCR fallback)
        </button>
      </div>
    </div>
  );
}

/**
 * 5. Multi-Agent Platform CrewAI Interactive orchestrator
 */
function MultiAgentWidget() {
  const [crewActive, setCrewActive] = useState(false);
  const [activeAgent, setActiveAgent] = useState<'idle' | 'planner' | 'developer' | 'qa' | 'complete'>('idle');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const runMultiCrew = () => {
    if (crewActive) return;
    setCrewActive(true);
    setTerminalLogs([]);

    // Stage 1: Planner Agent
    setActiveAgent('planner');
    setTerminalLogs(prev => [...prev, "[CrewAI v2.8] Starting collaborative task planning..."]);
    setTerminalLogs(prev => [...prev, "🎨 Planner Agent: Ideating interactive workflow assets..."]);

    // Stage 2: Developer Agent
    setTimeout(() => {
      setActiveAgent('developer');
      setTerminalLogs(prev => [...prev, "💻 Python Code Developer: Writing math functions..."]);

      // Stage 3: QA auditor Check
      setTimeout(() => {
        setActiveAgent('qa');
        setTerminalLogs(prev => [...prev, "🔬 QA Reviewer: Testing safety bounds & exceptions..."]);

        // Stage 4: Completed
        setTimeout(() => {
          setActiveAgent('complete');
          setTerminalLogs(prev => [...prev, "✅ Task finished: Interactive code compiled clean."]);
          setCrewActive(false);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full text-left font-mono">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2 text-xs text-gray-400">
        <span className="font-bold text-white uppercase tracking-wider">Multi-Agent Workflow Simulation</span>
        <span>Framework: CrewAI v2</span>
      </div>

      {/* Orchestration visual cards pipeline */}
      <div className="grid grid-cols-3 gap-2.5 mb-3.5 text-center">
        <div className={`p-2.5 rounded-xl border text-[10px] ${activeAgent === 'planner' ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-[#a78bfa] font-bold animate-pulse' : 'bg-white/5 border-white/5 text-gray-400'}`}>
          <Users size={12} className="mx-auto mb-1" />
          Planner
        </div>
        <div className={`p-2.5 rounded-xl border text-[10px] ${activeAgent === 'developer' ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-blue-400 font-bold animate-pulse' : 'bg-white/5 border-white/5 text-gray-400'}`}>
          <Code2 size={12} className="mx-auto mb-1" />
          Developer
        </div>
        <div className={`p-2.5 rounded-xl border text-[10px] ${activeAgent === 'qa' ? 'bg-[#10B981]/20 border-[#10B981] text-emerald-400 font-bold animate-pulse' : 'bg-white/5 border-white/5 text-gray-400'}`}>
          <ShieldCheck size={12} className="mx-auto mb-1" />
          QA Auditor
        </div>
      </div>

      {/* Live logging stream monitor terminal */}
      <div className="flex-1 h-24 rounded-lg bg-black/60 p-3 overflow-y-auto text-[9px] leading-relaxed text-gray-300">
        {terminalLogs.length === 0 ? (
          <span className="text-gray-500 select-none">// Press Launch to trigger multi-agent collaborations...</span>
        ) : (
          terminalLogs.map((log, idx) => (
            <p key={idx} className={`${log.startsWith('✅') ? 'text-[#10B981] font-bold' : log.includes('🎨') ? 'text-[#a78bfa]' : 'text-slate-300'}`}>{log}</p>
          ))
        )}
      </div>

      {/* Button trigger */}
      <div className="mt-4">
        <button
          onClick={runMultiCrew}
          disabled={crewActive}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50"
        >
          <Play size={10} fill="white" /> Launch Collaborative CrewAI Projects
        </button>
      </div>
    </div>
  );
}

/**
 * 6. Daily Work Logger Natural Language integration
 */
function WorkLoggerWidget() {
  const [logs, setLogs] = useState([
    { pName: 'CampusPal', time: '4.0 hrs', date: 'June 12', note: 'Modified local FAISS database logic.' }
  ]);
  const [inputText, setInputText] = useState("Logged 2 hours refactoring prompt filters for InstaClaim");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleParseText = () => {
    if (!inputText || isProcessing) return;
    setIsProcessing(true);

    setTimeout(() => {
      setLogs(prev => [
        { pName: 'InstaClaim', time: '2.0 hrs', date: 'June 14', note: 'Refactored local OCR prompt filters.' },
        ...prev
      ]);
      setInputText('');
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full text-left">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2 font-mono text-xs text-gray-400">
        <span className="font-bold text-white uppercase tracking-wider">Sheets Sync Activity Logger</span>
        <span className="text-[#10B981]">Sync active: Google Workspace</span>
      </div>

      {/* Structured Google Spreadsheet visual block */}
      <div className="flex-1 rounded-xl bg-black/40 border border-white/5 overflow-hidden flex flex-col justify-between p-3 min-h-[140px] text-[10px]">
        <div className="space-y-2 max-h-[110px] overflow-y-auto font-mono">
          <div className="flex border-b border-white/10 pb-1 text-gray-500 text-[9px] uppercase font-bold tracking-wider">
            <span className="w-1/4">Project</span>
            <span className="w-1/4">Hours</span>
            <span className="w-1/2">Log Notes</span>
          </div>

          {logs.map((lg, i) => (
            <div key={i} className="flex border-b border-white/5 py-1 text-slate-300">
              <span className="w-1/4 text-[#a78bfa] font-bold">{lg.pName}</span>
              <span className="w-1/4">{lg.time}</span>
              <span className="w-1/2 truncate text-slate-400">{lg.note}</span>
            </div>
          ))}
        </div>

        {isProcessing && (
          <div className="text-center font-mono text-[#10B981] text-[9px] animate-pulse flex items-center justify-center gap-1.5 mt-2">
            <LoaderIcon className="animate-spin" /> Appending parsed rows to Sheets cloud file...
          </div>
        )}
      </div>

      {/* Interactive prompt-input logger entry */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isProcessing}
          placeholder="Type activity logs naturally..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#10B981]/50"
        />
        <button
          onClick={handleParseText}
          disabled={isProcessing}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-lg flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Plus size={12} /> Sync Log
        </button>
      </div>
    </div>
  );
}

/**
 * 7. Voice Interview Coach Simulator Widget
 */
function InterviewAssistantWidget() {
  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0);
  const [scores, setScores] = useState({ relevance: 8.5, technicalDepth: 8.0, confidence: 7.0 });
  const [activeText, setActiveText] = useState("AI is preparing targeted Technical queries...");

  const simulateCandidateAnswer = (choice: 'optimal' | 'mediocre') => {
    setActiveStep(1);
    setActiveText("AI is processing audio signal (AssemblyAI)...");

    setTimeout(() => {
      setActiveStep(2);
      if (choice === 'optimal') {
        setScores({ relevance: 9.8, technicalDepth: 9.5, confidence: 9.2 });
        setActiveText("Exceptional performance! Good explanation of REST caching mechanisms.");
      } else {
        setScores({ relevance: 6.2, technicalDepth: 5.5, confidence: 6.0 });
        setActiveText("Average details. Consider referencing HTTP verbs and idempotency protocols.");
      }
    }, 1800);
  };

  const handleReset = () => {
    setActiveStep(0);
    setScores({ relevance: 8.5, technicalDepth: 8.0, confidence: 7.0 });
    setActiveText("Ask technical queries contextually using LangGraph memory maps.");
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full text-left font-sans text-xs">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2 font-mono text-xs text-gray-400">
        <span className="font-bold text-white uppercase tracking-wider">Interview Assistant Simulator</span>
        <span className="text-[#3B82F6]">LangGraph Workflow</span>
      </div>

      {/* Screen console feedback display panels */}
      <div className="flex-1 glass-card border border-white/5 rounded-xl p-4 overflow-hidden flex flex-col justify-between min-h-[140px]">
        {activeStep === 1 ? (
          // Audio frequency animation wave bars
          <div className="my-auto text-center space-y-4">
            <div className="flex justify-center items-end gap-1 h-12">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-blue-500 rounded-full waveform-bar"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: `${Math.floor(Math.random() * 40 + 10)}px`
                  }}
                />
              ))}
            </div>
            <p className="font-mono text-[9px] text-[#3B82F6] animate-pulse uppercase leading-none">Transcribing Answer wave (Processing...)</p>
          </div>
        ) : (
          <div className="space-y-4 font-mono text-[10px]">
            {/* Visual AI Feedback sliders metrics */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-gray-400 text-[9px] mb-1">
                  <span>ANSWER RELEVANCE (Live metrics)</span>
                  <span className="text-[#10B981] font-bold">{scores.relevance}/10</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] transition-all duration-500" style={{ width: `${scores.relevance * 10}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-gray-400 text-[9px] mb-1">
                  <span>TECHNICAL DEPTH SCORE</span>
                  <span className="text-[#7C3AED] font-bold">{scores.technicalDepth}/10</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#7C3AED] transition-all duration-500" style={{ width: `${scores.technicalDepth * 10}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-[#3B82F6]/10 text-blue-400 rounded p-2 text-[9px] leading-relaxed border border-[#3B82F6]/15 font-sans">
              🧠 {activeText}
            </div>
          </div>
        )}
      </div>

      {/* Simulation triggers actions */}
      <div className="mt-4 flex gap-2">
        {activeStep === 2 ? (
          <button
            onClick={handleReset}
            className="w-full py-2 border border-white/10 hover:border-slate-400 text-slate-300 font-bold rounded-lg cursor-pointer transition-colors"
          >
            Restart Simulator Round
          </button>
        ) : (
          <>
            <button
              disabled={activeStep === 1}
              onClick={() => simulateCandidateAnswer('optimal')}
              className="w-1/2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer transition-colors disabled:opacity-50"
            >
              Simulate Good Answer
            </button>
            <button
              disabled={activeStep === 1}
              onClick={() => simulateCandidateAnswer('mediocre')}
              className="w-1/2 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold rounded-lg cursor-pointer transition-colors disabled:opacity-50"
            >
              Simulate Average Answer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
