"use client";

import { useRef } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { SECTION_LABELS } from "@/types";
import type { SectionKey } from "@/types";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { EducationForm } from "./EducationForm";
import { HonorForm } from "./HonorForm";
import { ExperienceForm } from "./ExperienceForm";
import { ProjectForm } from "./ProjectForm";
import { CampusActivityForm } from "./CampusActivityForm";
import { SkillForm } from "./SkillForm";
import { ResearchExperienceForm } from "./ResearchExperienceForm";

const SECTIONS: SectionKey[] = [
  "personalInfo",
  "education",
  "researchExperience",
  "honors",
  "experience",
  "projects",
  "campusActivities",
  "skills",
];

const SECTION_CODES: Record<SectionKey, string> = {
  personalInfo: "PI",
  education: "ED",
  researchExperience: "RE",
  honors: "AW",
  experience: "EX",
  projects: "PR",
  campusActivities: "CA",
  skills: "SK",
};

function isTextEditableElement(
  el: EventTarget | Element | null,
): el is HTMLInputElement | HTMLTextAreaElement {
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el instanceof HTMLTextAreaElement) return !el.readOnly && !el.disabled;
  if (el instanceof HTMLInputElement) {
    const type = (el.type || "text").toLowerCase();
    return (type === "text" || type === "search" || type === "url" || type === "tel" || type === "email") && !el.readOnly && !el.disabled;
  }
  return false;
}

function applyNativeValue(el: HTMLInputElement | HTMLTextAreaElement, nextValue: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) {
    setter.call(el, nextValue);
  } else {
    el.value = nextValue;
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

function toggleMarkdownBoldOnElement(el: HTMLInputElement | HTMLTextAreaElement, lang: "zh" | "en") {
  const val = el.value;
  const start = el.selectionStart ?? val.length;
  const end = el.selectionEnd ?? val.length;
  const selected = val.slice(start, end);

  let nextVal: string;
  let nextStart: number;
  let nextEnd: number;

  if (start !== end) {
    if (selected.startsWith("**") && selected.endsWith("**") && selected.length > 4) {
      const inner = selected.slice(2, -2);
      nextVal = val.slice(0, start) + inner + val.slice(end);
      nextStart = start;
      nextEnd = start + inner.length;
    } else if (start >= 2 && val.slice(start - 2, start) === "**" && val.slice(end, end + 2) === "**") {
      nextVal = val.slice(0, start - 2) + selected + val.slice(end + 2);
      nextStart = start - 2;
      nextEnd = end - 2;
    } else {
      nextVal = val.slice(0, start) + `**${selected}**` + val.slice(end);
      nextStart = start + 2;
      nextEnd = end + 2;
    }
  } else {
    const placeholder = lang === "zh" ? "重点内容" : "bold";
    nextVal = val.slice(0, start) + `**${placeholder}**` + val.slice(end);
    nextStart = start + 2;
    nextEnd = start + 2 + placeholder.length;
  }

  applyNativeValue(el, nextVal);
  requestAnimationFrame(() => {
    el.focus();
    try {
      el.setSelectionRange(nextStart, nextEnd);
    } catch {
      // Ignore input types that do not support selection ranges
    }
  });
}

export function SidebarEditor() {
  const { activeSection, setActiveSection, activeLanguage } = useResumeStore();
  const lang = activeLanguage;
  const lastInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const getLabel = (key: SectionKey) => {
    const label = SECTION_LABELS[key];
    return label[lang] || label.zh;
  };

  const handleFocusCapture = (e: FocusEvent<HTMLDivElement>) => {
    if (isTextEditableElement(e.target)) {
      lastInputRef.current = e.target;
    }
  };

  const handleKeyDownCapture = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      if (isTextEditableElement(e.target)) {
        e.preventDefault();
        lastInputRef.current = e.target;
        toggleMarkdownBoldOnElement(e.target, lang);
      }
    }
  };

  const handleToolbarBoldClick = () => {
    const active = document.activeElement;
    const target = isTextEditableElement(active) ? active : lastInputRef.current;
    if (target && document.body.contains(target)) {
      toggleMarkdownBoldOnElement(target, lang);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case "personalInfo":
        return <PersonalInfoForm />;
      case "education":
        return <EducationForm />;
      case "honors":
        return <HonorForm />;
      case "experience":
        return <ExperienceForm />;
      case "projects":
        return <ProjectForm />;
      case "campusActivities":
        return <CampusActivityForm />;
      case "skills":
        return <SkillForm />;
      case "researchExperience":
        return <ResearchExperienceForm />;
      default:
        return <PersonalInfoForm />;
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      onFocusCapture={handleFocusCapture}
      onKeyDownCapture={handleKeyDownCapture}
    >
      <div className="section-pill-bar">
        {SECTIONS.map((key) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`section-pill ${activeSection === key ? "section-pill--active" : ""}`}
          >
            <span>{SECTION_CODES[key]}</span>
            <span>{getLabel(key)}</span>
          </button>
        ))}
      </div>

      <div className="editor-format-bar">
        <span className="editor-format-hint">
          {lang === "zh" ? (
            <>
              支持 <code>**文字**</code> 语法或选中文字按 <kbd>Ctrl+B</kbd> 自定义加粗重点
            </>
          ) : (
            <>
              Wrap text in <code>**bold**</code> or press <kbd>Ctrl+B</kbd> to emphasize
            </>
          )}
        </span>
        <button
          type="button"
          className="editor-format-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            handleToolbarBoldClick();
          }}
          title={lang === "zh" ? "加粗选中文字 (Ctrl+B)" : "Bold selected text (Ctrl+B)"}
        >
          <strong>B</strong>
          <span>{lang === "zh" ? "加粗" : "Bold"}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {renderSection()}
      </div>
    </div>
  );
}
