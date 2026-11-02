import React, { useState } from 'react';
import { Github, Globe, Star, GitBranch, Terminal, CheckCircle2, Play, RefreshCw, Cpu, Layers } from 'lucide-react';
import { Project } from '../types';

interface DynamicProjectWidgetProps {
  project: Project;
}

export function DynamicProjectWidget({ project }: DynamicProjectWidgetProps) {
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const runSimulation = () => {
    setIsRunningSim(true);
    setSimStep(1);
    setTimeout(() => setSimStep(2), 600);
    setTimeout(() => setSimStep(3), 1200);
    setTimeout(() => {
      setSimStep(0);
      setIsRunningSim(false);
    }, 2500);
  };

  return (
    <div className="h-full flex flex-col justify-between font-mono text-xs select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-gray-300 font-bold ml-1">{project.repoName || project.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
          <span className="text-[10px] text-gray-500">v1.0</span>
        </div>
      </div>

      {/* Middle Content */}
      <div className="my-auto space-y-3 py-2">
        {/* Repo Telemetry */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[10px] text-gray-400 flex items-center gap-1 mb-1">
              <Star size={11} className="text-amber-400" />
              <span>GITHUB STARS</span>
            </div>
            <div className="text-base font-extrabold text-white">
              {project.starsCount !== undefined ? project.starsCount : 0}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="text-[10px] text-gray-400 flex items-center gap-1 mb-1">
              <GitBranch size={11} className="text-[#a78bfa]" />
              <span>PRIMARY STACK</span>
            </div>
            <div className="text-sm font-semibold text-[#c4b5fd] truncate">
              {project.language || project.technologies[0] || 'Python'}
            </div>
          </div>
        </div>

        {/* Live Simulation Trace Terminal */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-gray-500 border-b border-white/5 pb-1">
            <span className="flex items-center gap-1">
              <Terminal size={10} /> Architecture Trace
            </span>
            <span>200 OK</span>
          </div>

          <div className="text-gray-300 font-mono text-[10.5px]">
            {simStep === 0 && (
              <span className="text-gray-400">
                &gt; Standby. Ready to trace reasoning and data pipeline.
              </span>
            )}
            {simStep === 1 && (
              <span className="text-blue-400 animate-pulse">
                &gt; [TRACE] Loading model weights & RAG context vector store...
              </span>
            )}
            {simStep === 2 && (
              <span className="text-purple-400 animate-pulse">
                &gt; [EVAL] Verifying boundary conditions & API latency...
              </span>
            )}
            {simStep === 3 && (
              <span className="text-emerald-400">
                &gt; [SUCCESS] Pipeline test complete. Zero hallucinations detected.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
        <button
          onClick={runSimulation}
          disabled={isRunningSim}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#7C3AED]/20 to-[#3B82F6]/20 border border-[#7C3AED]/30 hover:bg-[#7C3AED]/30 text-[#a78bfa] hover:text-white transition-all text-[11px] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isRunningSim ? (
            <>
              <RefreshCw size={12} className="animate-spin" /> Tracing...
            </>
          ) : (
            <>
              <Play size={11} /> Test Trace
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="GitHub Repository"
            >
              <Github size={14} />
            </a>
          )}
          {project.demoLink && (
            <a
              href={project.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
              title="Live Demo"
            >
              <Globe size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
