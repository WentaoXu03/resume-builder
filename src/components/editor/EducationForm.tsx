"use client";

import { useResumeStore } from "@/store/useResumeStore";
import t from "@/lib/i18n";
import { normalizeSchoolTier } from "@/types";

export function EducationForm() {
  const { data, addEducation, updateEducation, removeEducation } = useResumeStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          {t("sections.education")}
        </h3>
        <button onClick={() => addEducation()} className="btn-primary text-xs">
          + {t("editor.addSection")}
        </button>
      </div>

      {(data.education?.length ?? 0) === 0 && (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
          暂无教育经历，点击上方按钮添加
        </p>
      )}

      {data.education.map((edu, index) => (
        <div key={edu.id} className="section-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[var(--color-text-muted)]">#{index + 1}</span>
            <button onClick={() => removeEducation(edu.id)} className="btn-danger text-xs">
              {t("editor.deleteSection")}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="field-label">{t("education.schoolZh")}</label>
              <input
                type="text"
                value={edu.school.zh}
                onChange={(e) => updateEducation(edu.id, { school: { ...edu.school, zh: e.target.value } })}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">{t("education.schoolEn")}</label>
              <input
                type="text"
                value={edu.school.en}
                onChange={(e) => updateEducation(edu.id, { school: { ...edu.school, en: e.target.value } })}
                className="field-input"
              />
            </div>
          </div>

          <div className="mb-3 max-w-[220px]">
            <label htmlFor={`school-tier-${edu.id}`} className="field-label">{t("education.schoolTier")}</label>
            <select
              id={`school-tier-${edu.id}`}
              value={edu.schoolTier ?? ""}
              onChange={(event) => updateEducation(edu.id, { schoolTier: normalizeSchoolTier(event.target.value) })}
              className="field-input"
            >
              <option value="">{t("education.schoolTierNone")}</option>
              <option value="985">985</option>
              <option value="211">211</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="field-label">{t("education.degreeZh")}</label>
              <input
                type="text"
                value={edu.degree.zh}
                onChange={(e) => updateEducation(edu.id, { degree: { ...edu.degree, zh: e.target.value } })}
                className="field-input"
                placeholder="计算机科学学士"
              />
            </div>
            <div>
              <label className="field-label">{t("education.degreeEn")}</label>
              <input
                type="text"
                value={edu.degree.en}
                onChange={(e) => updateEducation(edu.id, { degree: { ...edu.degree, en: e.target.value } })}
                className="field-input"
                placeholder="B.S. in Computer Science"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="field-label">{t("education.majorZh")}</label>
              <input
                type="text"
                value={edu.major.zh}
                onChange={(e) => updateEducation(edu.id, { major: { ...edu.major, zh: e.target.value } })}
                className="field-input"
                placeholder="计算机科学与技术"
              />
            </div>
            <div>
              <label className="field-label">{t("education.majorEn")}</label>
              <input
                type="text"
                value={edu.major.en}
                onChange={(e) => updateEducation(edu.id, { major: { ...edu.major, en: e.target.value } })}
                className="field-input"
                placeholder="Computer Science"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="field-label">{t("education.period")}</label>
              <input
                type="text"
                value={edu.period}
                onChange={(e) => updateEducation(edu.id, { period: e.target.value })}
                className="field-input"
                placeholder="2018.09 - 2022.06"
              />
            </div>
            <div>
              <label className="field-label">{t("education.gpa")}</label>
              <input
                type="text"
                value={edu.gpa}
                onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                className="field-input"
                placeholder="3.8/4.0 或 前5%"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="field-label">{t("education.descriptionZh")}</label>
            <textarea
              value={edu.description.zh}
              onChange={(e) => updateEducation(edu.id, { description: { ...edu.description, zh: e.target.value } })}
              className="field-input min-h-[60px] resize-y"
              rows={2}
            />
          </div>

          <div>
            <label className="field-label">{t("education.descriptionEn")}</label>
            <textarea
              value={edu.description.en}
              onChange={(e) => updateEducation(edu.id, { description: { ...edu.description, en: e.target.value } })}
              className="field-input min-h-[60px] resize-y"
              rows={2}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
