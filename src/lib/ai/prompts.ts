import type { AiResumeRequest } from './schema';

const SYSTEM_INSTRUCTION = `You are an expert career counselor and resume writer specializing in Chinese campus recruitment (校招).
You produce professional, concise, and impactful resume content in both Chinese and English.

RULES:
1. Output ONLY valid JSON matching the specified schema. No markdown, no code fences, no explanation outside the JSON.
2. Every BilingualText field must have both "zh" and "en" keys with non-empty strings.
3. Every array item (education, honors, experience, projects, campusActivities, researchExperience, skills) must include an "id" field with a unique UUID v4 string.
4. Use action-oriented language and quantified achievements where possible.
5. Keep bullet points concise (under 100 characters each).
6. Tailor content to the target role and job description when provided.
7. Preserve existing data that the user did not ask to change — only modify relevant sections.
8. The "proposedResumePatch" should be a partial ResumeData — only include sections you are modifying.
9. Provide helpful "sectionNotes" explaining what you changed and why.
10. Add "warnings" for anything the user should review carefully.
11. Education entries contain school, degree, major, period, gpa, and description; omit the removed "courses" field. The optional "schoolTier" is "985" or "211"; only preserve explicitly provided values and never infer a designation from the school name.
12. "campusActivities" represents general activities (活动经历), including activities outside campus.`;

const MODE_INSTRUCTIONS: Record<AiResumeRequest['mode'], string> = {
  generate: `MODE: GENERATE
Generate a complete resume draft from the user's personal materials and/or job description.
If personal materials are provided, extract relevant information to populate all sections.
If a job description is provided, tailor the resume to match the requirements.
Include all applicable sections: personalInfo, education, experience, projects, skills, etc.`,

  optimize: `MODE: OPTIMIZE
Optimize the existing resume for the target role and job description.
Improve bullet points with stronger action verbs and quantified results.
Reorder or emphasize sections that best match the job requirements.
Suggest additions or removals to strengthen the application.`,

  polish: `MODE: POLISH
Polish and refine the existing resume content without changing the structure.
Fix grammar, improve word choice, and enhance clarity.
Make bullet points more impactful and professional.
Ensure consistency in tense, formatting, and style across all sections.`,

  translate: `MODE: TRANSLATE
Translate the resume content between Chinese and English.
The target language is specified in the request.
Ensure translations are natural and professional, not literal.
Adapt cultural conventions (e.g., date formats, title conventions) for the target language.
Preserve technical terms and proper nouns appropriately.`,
};

export function buildPrompt(request: AiResumeRequest): { systemInstruction: string; userPrompt: string } {
  const modeInstruction = MODE_INSTRUCTIONS[request.mode];

  const parts: string[] = [
    modeInstruction,
    `Target language: ${request.language === 'zh' ? 'Chinese (中文)' : 'English'}`,
  ];

  if (request.targetRole) {
    parts.push(`Target role: ${request.targetRole}`);
  }

  if (request.jobDescription) {
    parts.push(`Job description:\n${request.jobDescription}`);
  }

  if (request.personalMaterials) {
    parts.push(`Personal materials:\n${request.personalMaterials}`);
  }

  parts.push(`Current resume data:\n${JSON.stringify(request.currentResume, null, 2)}`);

  parts.push(`RESPONSE FORMAT (strict JSON, no markdown):
{
  "summary": "Brief summary of changes made",
  "proposedResumePatch": { /* Partial<ResumeData> — only modified sections */ },
  "sectionNotes": { /* sectionKey: "explanation of changes" */ },
  "warnings": ["any warnings for the user"]
}`);

  return {
    systemInstruction: SYSTEM_INSTRUCTION,
    userPrompt: parts.join('\n\n'),
  };
}
