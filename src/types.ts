export interface Project {
  title: string;
  description: string;
  technologies: string[];
  highlights: string[];
  link?: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  highlights: string[];
}

export interface SkillCategory {
  title: string;
  skills: string[];
}
