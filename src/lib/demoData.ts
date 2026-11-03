import type { ResumeData } from "@/types";

const uid = () => Math.random().toString(36).substring(2, 11);

export const DEMO_RESUME_DATA: ResumeData = {
  personalInfo: {
    name: { zh: "张明远", en: "Mingyuan Zhang" },
    title: { zh: "前端开发工程师", en: "Frontend Developer" },
    email: "zhangmy@example.com",
    phone: "138-0000-1234",
    location: { zh: "北京", en: "Beijing, China" },
    website: "https://github.com/zhangmy",
    summary: {
      zh: "计算机科学专业大三学生，热爱前端开发与用户体验设计，熟悉 React 生态与 TypeScript，具备独立完成全栈项目的能力，在校期间获多项技术竞赛奖项。",
      en: "Junior CS student passionate about frontend development and UX design. Proficient in React ecosystem and TypeScript. Capable of building full-stack projects independently. Award winner in multiple tech competitions.",
    },
    avatarUrl: "",
    gender: "男",
    birthDate: "2002.03",
    politicalStatus: "共青团员",
  },
  education: [
    {
      id: uid(),
      school: { zh: "北京大学", en: "Peking University" },
      degree: { zh: "工学学士", en: "B.S." },
      major: { zh: "计算机科学与技术", en: "Computer Science & Technology" },
      period: "2020.09 - 2024.06",
      gpa: "**3.82/4.0 (前8%)**",
      description: {
        zh: "主修计算机科学，GPA排名**前8%**，连续三年获校级奖学金",
        en: "Majoring in Computer Science, **top 8%** GPA, awarded university scholarship for three consecutive years",
      },
    },
  ],
  honors: [
    {
      id: uid(),
      title: { zh: "国家奖学金", en: "National Scholarship" },
      level: "国家级",
      period: "2022.10",
      description: { zh: "", en: "" },
    },
    {
      id: uid(),
      title: { zh: "ACM-ICPC 亚洲区域赛银奖", en: "ACM-ICPC Asia Regional Silver Medal" },
      level: "国际级",
      period: "2022.11",
      description: { zh: "", en: "" },
    },
    {
      id: uid(),
      title: { zh: "全国大学生数学建模竞赛二等奖", en: "National Math Modeling Contest 2nd Prize" },
      level: "国家级",
      period: "2021.09",
      description: { zh: "", en: "" },
    },
    {
      id: uid(),
      title: { zh: "校级优秀学生干部", en: "Outstanding Student Leader" },
      level: "校级",
      period: "2022.12",
      description: { zh: "", en: "" },
    },
  ],
  experience: [
    {
      id: uid(),
      company: { zh: "字节跳动", en: "ByteDance" },
      role: { zh: "前端开发实习生", en: "Frontend Intern" },
      period: "2023.06 - 2023.09",
      description: {
        zh: "参与抖音创作者平台的开发与优化，负责数据看板模块",
        en: "Developed and optimized the creator platform dashboard module for Douyin",
      },
      highlights: [
        { zh: "使用 React + TypeScript 重构数据看板，首屏加载速度提升 **40%**", en: "Rebuilt data dashboard with React + TypeScript, improved first-screen load speed by **40%**" },
        { zh: "封装可复用图表组件库，覆盖 **6 种**可视化场景，服务 **3 个**业务线", en: "Built reusable chart component library covering **6** visualization scenarios, serving **3** business lines" },
      ],
    },
  ],
  projects: [
    {
      id: uid(),
      name: { zh: "校园二手交易平台", en: "Campus Marketplace" },
      role: { zh: "全栈开发", en: "Full-stack Developer" },
      tech: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
      period: "2022.09 - 2023.01",
      description: {
        zh: "独立设计开发校园二手物品交易平台，支持商品发布、搜索、即时聊天与交易管理，注册用户超 **2000 人**",
        en: "Independently designed and developed a campus second-hand trading platform with item posting, search, real-time chat, and transaction management. Over **2,000** registered users.",
      },
      highlights: [
        { zh: "实现商品发布、搜索、即时聊天与交易管理核心流程", en: "Implemented core flows for item posting, search, real-time chat, and transaction management" },
        { zh: "优化校招简历场景下的多模板预览与导出体验", en: "Optimized multi-template preview and export experience for campus recruiting resumes" },
      ],
      link: "https://github.com/zhangmy/campus-market",
    },
    {
      id: uid(),
      name: { zh: "智能简历生成器", en: "AI Resume Builder" },
      role: { zh: "前端开发", en: "Frontend Developer" },
      tech: ["React", "Zustand", "Tailwind CSS", "@react-pdf/renderer"],
      period: "2023.10 - 2024.01",
      description: {
        zh: "基于 AI 的校招简历生成工具，支持中英双语、多模板切换、PDF/SVG 导出，专为校招场景优化",
        en: "AI-powered campus recruitment resume builder with bilingual support, multi-template switching, PDF/SVG export, optimized for campus hiring",
      },
      highlights: [
        { zh: "实现中英双语多模板切换，覆盖经典/现代/简约/紧凑 **4 种**风格", en: "Implemented bilingual multi-template switching across classic, modern, minimal, and compact styles" },
        { zh: "设计 Zustand 持久化状态管理，支持 JSON 导入导出与一键重置", en: "Designed Zustand persistent state management with JSON import/export and one-click reset" },
      ],
      link: "",
    },
  ],
  campusActivities: [
    {
      id: uid(),
      organization: { zh: "北京大学计算机协会", en: "PKU Computer Science Association" },
      role: { zh: "技术部副部长", en: "Vice Head of Tech Department" },
      period: "2021.09 - 2023.06",
      description: {
        zh: "组织校内技术沙龙和编程竞赛，管理技术团队完成协会官网改版",
        en: "Organized campus tech meetups and coding competitions, led tech team to revamp the association website",
      },
      highlights: [
        { zh: "组织 **6 场**技术分享，累计参与 **400+ 人次**", en: "Organized **6** tech talks with **400+** total attendees" },
        { zh: "主导协会官网从 jQuery 迁移至 React，页面性能提升 **60%**", en: "Led website migration from jQuery to React, improving page performance by **60%**" },
      ],
    },
    {
      id: uid(),
      organization: { zh: "校青年志愿者协会", en: "University Youth Volunteer Association" },
      role: { zh: "志愿者", en: "Volunteer" },
      period: "2020.10 - 2022.05",
      description: {
        zh: "参与社区支教与数字素养普及活动",
        en: "Participated in community teaching and digital literacy programs",
      },
      highlights: [],
    },
  ],
  researchExperience: [
    {
      id: uid(),
      institution: { zh: "北京大学计算机视觉实验室", en: "PKU Computer Vision Lab" },
      project: { zh: "基于深度学习的医学图像分割研究", en: "Deep Learning for Medical Image Segmentation" },
      role: { zh: "研究助理", en: "Research Assistant" },
      period: "2023.03 - 2023.12",
      description: {
        zh: "参与基于U-Net改进模型的CT图像器官分割课题，负责数据预处理与模型训练",
        en: "Participated in CT image organ segmentation research using improved U-Net model, responsible for data preprocessing and model training",
      },
      highlights: [
        { zh: "在公开数据集上达到Dice系数 **0.91**，较基线提升 **3个百分点**", en: "Achieved Dice coefficient of **0.91** on public dataset, improving baseline by **3 percentage points**" },
        { zh: "共同撰写论文摘要投递至MICCAI 2024", en: "Co-authored abstract submitted to MICCAI 2024" },
      ],
    },
  ],
  skills: [
    {
      id: uid(),
      category: { zh: "编程语言", en: "Languages" },
      items: ["TypeScript", "JavaScript", "Python", "Java", "C++"],
    },
    {
      id: uid(),
      category: { zh: "前端技术", en: "Frontend" },
      items: ["React", "Next.js", "Vue 3", "Tailwind CSS", "Zustand", "Webpack"],
    },
    {
      id: uid(),
      category: { zh: "后端技术", en: "Backend" },
      items: ["Node.js", "Express", "Prisma", "PostgreSQL", "Redis"],
    },
    {
      id: uid(),
      category: { zh: "工具与平台", en: "Tools" },
      items: ["Git", "Docker", "Figma", "Linux", "Vercel"],
    },
  ],
};
