import { Project, Experience, SkillCategory } from './types';

export const PROJECTS: Project[] = [
  {
    title: "AtlasAI",
    description: "An end-to-end AI platform that enables users to discover, verify, and analyze companies through intelligent search, Retrieval-Augmented Generation (RAG), automated company discovery, and AI-powered research.",
    technologies: ["React.js", "TypeScript", "FastAPI", "Python", "Google Gemini API", "LangChain", "RAG Pipeline", "FAISS", "PostgreSQL", "Tavily Search API", "Vercel", "Docker"],
    highlights: [
      "Built a complete Retrieval-Augmented Generation (RAG) pipeline with FAISS vector store and BAAI embeddings for context-aware company research (AskAtlas).",
      "Developed an automated AI company discovery engine with web extraction, multi-stage verification pipeline, confidence scoring, and duplicate detection.",
      "Designed a scalable Clean Architecture REST API in FastAPI with PostgreSQL/SQLAlchemy, JWT role-based access control, and admin approval workflows.",
      "Integrated real-time company news intelligence and automated web extraction grounded in verified multi-source intelligence."
    ],
    link: "https://github.com/Vivek5143/AtlasAI",
    demoLink: "https://atlas-ai-ashen.vercel.app/"
  },
  {
    title: "AI Sports Quiz Agent",
    description: "An intelligent RAG-powered quiz generation platform that creates engaging and factually grounded sports quizzes using Large Language Models, semantic search, and real-time web search.",
    technologies: ["Streamlit", "Python", "Groq API (Llama 3.3)", "ChromaDB", "LangChain", "Sentence Transformers", "Tavily Search API"],
    highlights: [
      "RAG-powered quiz generation architecture combining semantic retrieval from ChromaDB vector store with live web search via Tavily to eliminate hallucinations.",
      "Integrates Groq Llama 3.3 70B Versatile LLM for real-time creation of customizable multiple-choice sports questions with detailed explanations.",
      "Interactive scoring dashboard with dynamic difficulty selection, topic customization, and fresh quiz regeneration with duplicate avoidance."
    ],
    link: "https://github.com/Vivek5143/ai-sports-quiz-agent"
  },
  {
    title: "CampusPal",
    description: "An AI-powered campus assistant specifically designed for APSIT. It provides intelligent responses to student queries about admissions, fees, courses, placements, faculty, and campus facilities.",
    technologies: ["React 19", "Vite", "Tailwind CSS", "FastAPI", "LangChain", "Groq LLM", "FAISS", "Hugging Face Embeddings", "Docker"],
    highlights: [
      "Retrieval-Augmented Generation (RAG) using FAISS index with optimized retrieval (k=5) for accurate context-aware responses.",
      "Implemented a Multi-layer hallucination mitigation strategy system including strict prompt engineering and precise temperature control (0.1).",
      "Features dynamic query routing between local RAG and real-time live web search using a Hybrid ReAct Agent framework.",
      "Full chat history persistence stored locally with browser storage, support for custom themes, and markdown-rendered responses with source attributions."
    ],
    link: "https://github.com/Vivek5143/CampusPal"
  },
  {
    title: "EduDiff",
    description: "A full-stack application that transforms natural language prompts into animated math lessons or specialized video explanations using the Google Gemini model and Manim mathematical animation engine.",
    technologies: ["Next.js", "Flask", "Manim", "Google Gemini API", "Docker", "Python", "JavaScript"],
    highlights: [
      "Built a full-stack Generative AI workspace converting complex descriptions to premium-grade Math animations.",
      "Utilized Google Gemini 2.5 Flash for high-speed automated code generation and Manim containerized render pipeline.",
      "Designed a robust end-to-end prompt-to-video workflow complete with multiple quality mode selectors and a REST API route system.",
      "Fully containerized local services and static routes with Docker Compose for reliable, reproducible deployment."
    ],
    link: "https://github.com/Vivek5143/EduDiff"
  },
  {
    title: "TransactAI",
    description: "A production-grade hybrid transaction categorization service matching strict banking logic, fine-tuned DistilBERT models, and semantic embedding fallbacks to sort financial transaction alerts in real-time.",
    technologies: ["FastAPI", "PostgreSQL", "PyTorch", "Transformers", "DistilBERT", "Next.js", "TypeScript", "TailwindCSS", "Kotlin", "Android", "Docker"],
    highlights: [
      "Designed a hybrid three-tier classification architecture: deterministic routing heuristics → DistilBERT analysis → SentenceTransformer similarity embedding fallback.",
      "Preloaded optimized classifiers fine-tuned on custom datasets (DistilBERT is 40% memory lighter with near-identical target metrics).",
      "Features a native Android mobile application that parses incoming UPI and SMS payment notifications in real-time.",
      "Built a highly responsive Next.js admin trends panel displaying multi-category charts, budget filters, and custom transaction timelines."
    ],
    link: "https://github.com/Vivek5143/TransactAI"
  },
  {
    title: "InstaClaim",
    description: "**InstaClaim** is a **privacy-first offline insurtech claim processing assistant** that extracts and analyzes insurance documents using local OCR pipelines and offline Large Language Models, enabling secure, intelligent claim support without relying on cloud services.",
    technologies: ["Streamlit", "LangChain", "Ollama (Phi3)", "Tesseract OCR", "Python", "PIL", "pytesseract"],
    highlights: [
      "Integrates robust Tesseract OCR to scan and extract unstructured fields from user-uploaded PDF or digital scans.",
      "Injects specialized document metadata directly to LangChain memory contexts, ensuring zero external leakage or offline runtime boundaries.",
      "Runs fully localized Ollama models (Phi3:mini) for offline processing and on-premise insurance privacy.",
      "Styled on top of a tailored, high-contrast Dark & Gold themed Streamlit cockpit."
    ],
    link: "https://github.com/Vivek5143/InstaClaim"
  },
  {
    title: "Multi-Agent Platform",
    description: "**Multi-Agent Platform** is a **CrewAI-powered collaborative workflow platform** that orchestrates specialized AI agents to execute complex tasks through structured, sequential workflows, enabling intelligent automation, task delegation, and coordinated problem-solving across multiple domains.",
    technologies: ["Python", "CrewAI", "Google Gemini", "Ollama", "Pygame", "CrewAI Tools"],
    highlights: [
      "Coordinates sequential crews across four domain apps, including game architecture, content copywriting, and codebase reviews.",
      "Game Dev Crew: Bridges designers, developers, and QA modules to dynamically compile completely playable 2D Pygames from text.",
      "Code Debugger Crew: Analyzes incoming modules, executes structural testing, provides targeted diffs, and tests boundary conditions.",
      "Reel Content Crew: Leverages analytical modules for Engagement Optimization, scheduling tags, dynamic ideas, and scripting scene sequences."
    ],
    link: "https://github.com/Vivek5143/Multi-Agent-Platform"
  },
  {
    title: "Interview Assistant",
    description: "An interactive, voice-first AI interview simulator that uses real-time Speech-to-Text and Text-to-Speech models to host natural conversations with memory history.",
    technologies: ["Flask", "Python", "Google Gemini", "LangChain", "AssemblyAI", "Murf AI", "LangGraph", "Docker"],
    highlights: [
      "Designed dynamic 5-question multi-turn simulated interview tracks with user answer validation.",
      "Saves active conversational trees using LangGraph state charts and state workflows.",
      "Integrates premium speech pipelines using AssemblyAI processing engines and Murf AI voices.",
      "Adapts contextually, tailoring downstream technical questions to evaluate prior strengths, errors, and vocabulary."
    ],
    link: "https://github.com/Vivek5143/Interview-Assistant"
  },
  {
    title: "Daily-Work-Logger",
    description: "A lightweight, production-ready logging platform with natural-language parsing for structured calendar scheduling and real-time cloud spreadsheet synchronization.",
    technologies: ["Streamlit", "Python", "Google Sheets API", "Google Gemini API"],
    highlights: [
      "Built a seamless natural language text parsing engine to cleanly translate unstructured notes into structured daily logs.",
      "Integrates directly with Google Workspace Sheets API for live server syncing and secure token-based database persistence.",
      "Reduces manual workflow overhead and clock-in recording times by up to 50% through automatic categorizations."
    ],
    link: "https://github.com/Vivek5143/Daily-Work-Logger"
  }
];

export const EXPERIENCES: Experience[] = [
  {
    company: "DSW | Data Science Wizards",
    role: "Data Science Engineer Intern",
    period: "Aug 2025 – Feb 2026",
    location: "Thane, India",
    highlights: [
      "Contributed to enterprise observability platforms by improving backend systems and data pipelines for real client environments, scaling backend systems and data models.",
      "Designed and deployed a highly secure PII detection and encryption pipeline using Microsoft Presidio, greatly enhancing regulatory compliance and data handling privacy.",
      "Collaborated with cross-functional development teams to introduce architectural improvements, clean code designs, and extensive API documentation structures."
    ]
  }
];

export const SKILLS: SkillCategory[] = [
  {
    title: "Languages",
    skills: [
      "Python (AI/ML & Automation)",
      "C++",
      "JavaScript"
    ]
  },
  {
    title: "Computer Science Fundamentals",
    skills: [
      "Object-Oriented Programming (OOP)",
      "Data Structures",
      "Algorithms",
      "Operating Systems",
      "Database Management Systems (DBMS)"
    ]
  },
  {
    title: "AI & Machine Learning",
    skills: [
      "LangChain",
      "CrewAI",
      "LangGraph",
      "Retrieval-Augmented Generation (RAG)",
      "FAISS",
      "Hugging Face",
      "DistilBERT",
      "PyTorch",
      "Transformers",
      "Ollama",
      "Gemini API",
      "Groq LLM",
      "Tesseract OCR"
    ]
  },
  {
    title: "Automation & RPA",
    skills: [
      "Basic Exposure to RPA",
      "Control Room",
      "Bot Orchestration",
      "Automation Workflows"
    ]
  },
  {
    title: "Web & Backend",
    skills: [
      "React.js",
      "Next.js",
      "FastAPI",
      "Flask",
      "Streamlit",
      "Node.js",
      "SQLAlchemy"
    ]
  },
  {
    title: "Databases",
    skills: [
      "PostgreSQL",
      "MongoDB",
      "ClickHouse"
    ]
  },
  {
    title: "DevOps & Tools",
    skills: [
      "Docker",
      "Kubernetes",
      "Git",
      "GitHub"
    ]
  }
];
