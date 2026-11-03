# Resume Builder - Agent 工作指南

## ⚠️ 状态存储迁移通知 (2026-05)

`.ai/` 目录已归档，不再作为项目状态参考源。项目状态已迁移至 **Linear**。
- `.ai/` 目录保留为历史存档，**不要读取或写入**
- 所有项目状态、任务跟踪、issue 管理均以 Linear 为准
- 如需查看历史状态，可直接查阅 Linear 中对应的 project

## 项目概况

AI驱动的中英双语简历构建器，当前为纯客户端 Web 应用，计划转为微信小程序。

- **技术栈**: Next.js 16 + React 19 + Tailwind 4 + Zustand 5 + TypeScript
- **PDF**: @react-pdf/renderer 4 (客户端生成，小程序环境不可用)
- **状态持久化**: Zustand persist → localStorage (小程序需适配 wx.storage)
- **后端**: 暂无，所有数据存客户端
- **团队**: 单人开发，前端完全依赖 Agent 辅助

## 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # 主页 (编辑器+预览双栏布局)
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Tailwind 4 + CSS变量 + 组件样式
├── components/
│   ├── editor/             # 侧边栏编辑器 (7个Section表单)
│   │   ├── SidebarEditor.tsx   # Tab容器，按activeSection路由
│   │   ├── PersonalInfoForm.tsx
│   │   ├── EducationForm.tsx
│   │   ├── HonorForm.tsx
│   │   ├── ExperienceForm.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── CampusActivityForm.tsx
│   │   └── SkillForm.tsx
│   ├── preview/
│   │   └── PreviewPanel.tsx    # A4比例(794x1123)实时预览，dynamic import无SSR
│   ├── templates/             # 4套简历模板
│   │   ├── ClassicTemplate.tsx  # 传统单栏，黑色分割线
│   │   ├── ModernTemplate.tsx   # 双栏(30/70)，深色侧边栏，头像
│   │   ├── MinimalTemplate.tsx  # 简约单栏，细线分割
│   │   └── CompactTemplate.tsx  # 紧凑单栏，蓝色左侧条，完整展示所有亮点
│   ├── export/
│   │   └── ExportBar.tsx       # PDF/SVG/JSON导出 + 导入/示例/重置
│   └── ui/                    # (空，预留)
├── store/
│   └── useResumeStore.ts      # Zustand store，28个action，persist到localStorage
├── types/
│   ├── resume.ts              # 核心类型定义 (详见下方)
│   └── index.ts              # Re-export
└── lib/
    ├── demoData.ts            # 示例简历数据 (CS学生张明远)
    ├── export/
    │   ├── pdf.tsx            # @react-pdf/renderer 4套PDF模板
    │   ├── svg.ts             # 纯字符串拼接SVG生成，CJK文字换行
    │   └── json.ts            # JSON导出/导入，mergeWithDefaults
    └── i18n/
        ├── index.ts           # t()函数，dot-notation取值，setLocale()未接入
        ├── zh.ts              # 中文词典 (source of truth，as const)
        └── en.ts              # 英文词典
tests/
└── visual.test.js            # Playwright + Applitools 视觉测试 (9个用例)
infrastructure/
└── (none，计划中)
```

## 核心数据模型

```typescript
interface ResumeData {
  personalInfo: PersonalInfo;       // 含 BilingualText name/title/summary/location
  education: Education[];           // school/degree/major 双语，可选 schoolTier (985/211)，period, gpa
  honors: Honor[];                  // title双语, level(国家级/省级/校级), period
  experience: Experience[];         // company/role双语, highlights: BilingualText[]
  projects: Project[];              // name/role双语, tech: string[], link
  campusActivities: CampusActivity[]; // organization/role双语, highlights: BilingualText[]
  skills: SkillCategory[];          // category双语, items: string[]
}

interface BilingualText { zh: string; en: string; }

type TemplateName = 'classic' | 'modern' | 'minimal' | 'compact';
type SectionKey = 'personalInfo' | 'education' | 'honors' | 'experience' | 'projects' | 'campusActivities' | 'skills';
type SectionEmphasis = 'expanded' | 'normal' | 'compact' | 'hidden';
```

中文校园招聘特有字段: `gender`, `birthDate`, `politicalStatus`

## Zustand Store 关键信息

- **持久化key**: `resume-builder-data`
- **默认数据**: DEMO_RESUME_DATA (不是空，是示例数据)
- **merge策略**: persist中间件自定义merge，合并persisted与defaults确保向后兼容
- **28个actions**: setField, setPersonalInfo, add/update/remove×6(education/honor/experience/project/campusActivity/skillCategory), setTemplate, setSectionOrder, setEmphasis, setActiveLanguage, setActiveSection, loadResumeData, loadDemoData, resetResumeData

## 模板系统

所有模板接收统一 props:
```typescript
interface TemplateProps {
  data: ResumeData;
  sectionOrder: SectionKey[];
  emphasis: Partial<Record<SectionKey, SectionEmphasis>>;
  language: "zh" | "en";
}
```
- 用 `Record<SectionKey, () => ReactNode>` section渲染器映射
- 按 `sectionOrder` 排序，`emphasis === "hidden"` 跳过
- **纯内联style**，不依赖CSS类（为导出可移植性）

## i18n 系统注意事项

- `t()` 函数基于模块级 `currentLocale` 变量，**setLocale()从未被调用**
- 模板直接用 `language === "zh"` 条件判断，不走i18n
- 编辑器UI标签用 `t()` 取值，但始终返回中文
- 如果要让i18n真正工作，需要在语言切换时调用 `setLocale()`

## 已知未实现功能

- AI简历生成 (i18n key已预留 ai.settings/ai.provider/ai.apiKey/ai.model/ai.baseUrl，无UI)
- Section拖拽排序 (store有setSectionOrder，无UI)
- 头像上传 (PersonalInfo.avatarUrl字段存在，Modern模板渲染，无上传UI)
- Section强调控制 (store有setEmphasis，无UI设expanded/compact/hidden)
- 设置页面 (app/settings/目录存在但空)

## 视觉测试

- **命令**: `npm run test:visual`
- **依赖**: @playwright/test + @applitools/eyes-playwright
- **配置**: playwright.config.ts (chromium, 1440x900, headless)
- **9个用例**: 4模板×中文 + 2模板×英文 + 编辑器个人信息/教育 + 导出栏
- **运行前提**: 需要启动 dev server (`npm run dev`) + 设置 `APPLITOOLS_API_KEY`
- **CI**: .github/workflows/visual-tests.yml (push/PR自动运行)
- **首次运行**: 建立baseline; 后续运行: 自动视觉对比

## 代码风格

- 组件函数式声明，不用 `export default`
- CSS变量定义在 globals.css `:root`，组件用 `var(--color-xxx)`
- 按钮样式用 globals.css 定义的 `.btn-primary` / `.btn-secondary` / `.btn-danger`
- Tailwind 4 语法 (@tailwindcss/postcss, 无 tailwind.config.js)
- UUID用 `uuid` 包的 `v4()`，不用 `crypto.randomUUID()`

## 下一步计划 (微信小程序)

当前Web版功能完整，接下来要:
1. **搭建后端** (Express + TypeScript + Prisma + PostgreSQL): 用户系统、简历CRUD、PDF生成
2. **微信小程序前端** (Taro 4 + React): 复用 types/store/模板逻辑，重写渲染层
3. **微信集成**: wx.login、支付、分享卡片、订阅消息
4. **不可移植到小程序的**: @react-pdf/renderer (移后端)、SVG导出 (移后端)、localStorage (改wx.storage)、Tailwind CSS (改Taro样式方案)
