export const RESUME_TOKENS = {
  page: {
    widthPx: 794,
    minHeightPx: 1123,
    padding: {
      classic: { top: 28, right: 36, bottom: 26, left: 36 },
      minimal: { top: 28, right: 36, bottom: 26, left: 36 },
      compact: { top: 22, right: 30, bottom: 20, left: 30 },
      modern: { top: 26, right: 28, bottom: 24, left: 26 },
    },
  },
  colors: {
    text: "#111827",
    textSecondary: "#374151",
    textMuted: "#6b7280",
    lineStrong: "#111827",
    line: "#d1d5db",
    lineSubtle: "#e5e7eb",
    accentBlue: "#2563eb",
    modernSidebar: "#1e293b",
    modernSidebarText: "#f8fafc",
    modernSidebarMuted: "#94a3b8",
  },
  line: {
    sectionStrongPx: 1.25,
    sectionNormalPx: 1,
    itemPx: 0.75,
  },
  spacing: {
    sectionTop: 10,
    sectionTitleBottom: 5,
    itemBottom: 6,
    paragraphTop: 1.5,
    listTop: 1.5,
  },
  fontSize: {
    name: 26,
    sectionTitle: 13.5,
    itemTitle: 12,
    body: 11,
    meta: 10,
    tag: 9.5,
  },
  fontFamily: "system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
  radius: {
    tag: 2,
  },
  photo: {
    classic: { width: 90, height: 124 },
    modern: { width: 86, height: 118 },
    minimal: { width: 88, height: 120 },
    compact: { width: 80, height: 110 },
  },
} as const;

export const RESUME_TEMPLATE_ROOT_STYLE = {
  width: "100%",
  minHeight: `${RESUME_TOKENS.page.minHeightPx}px`,
  boxSizing: "border-box",
} as const;
