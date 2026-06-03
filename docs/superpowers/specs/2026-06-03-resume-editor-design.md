# 在线简历编辑器 — 设计文档

**日期：** 2026-06-03
**状态：** 待实施

---

## 一、产品概述

基于 MDC 语法的在线简历编辑器。左侧编写 Markdown/MDC 源码，右侧实时预览渲染效果。内置 4 套模板和 10 个 MDC 组件，用户可自由组合使用。支持微信公众号扫码登录，导出 MD/PDF/PNG 三种格式。

**目标用户：** 中文求职者（技术人员、应届生、管理人员等）

---

## 二、技术栈

- **框架：** Nuxt 4 (SSR/SSG hybrid)
- **MDC 渲染：** @nuxt/mdc
- **编辑器：** CodeMirror 6（MDC 语法高亮）
- **导出：** Print API (PDF) + html2canvas (PNG) + Blob download (MD)
- **认证：** 微信公众号 OAuth 2.0 + JWT Cookie
- **存储：** SQLite / Turso
- **样式：** Tailwind CSS + 模板 CSS 变量

---

## 三、页面结构

### 3.1 首页 (`/`)
- 展示产品价值：一句话介绍 + 特色功能
- 4 套模板的缩略预览
- CTA 按钮："开始制作简历" 跳转模板选择页
- 渲染方式：SSG

### 3.2 模板选择页 (`/templates`)
- 四张模板卡片（技术岗、应届生、管理岗、极简空白）
- 每张卡片展示模板预览图和适用场景说明
- 点击进入编辑器并加载对应模板

### 3.3 编辑器页 (`/editor`)
- 左侧 35%：CodeMirror 6 编辑器，MDC 语法高亮
- 右侧 65%：@nuxt/mdc 实时渲染预览
- 顶部工具栏：模板切换、撤销/重做、导出按钮
- 导出按钮逻辑：未登录灰显+引导登录，已登录可使用

### 3.4 打印页 (`/print/[id]`)
- 仅渲染简历内容（无编辑器壳、无工具栏）
- onload 自动触发 `window.print()`
- 纯服务端渲染，保证打印质量

### 3.5 微信回调页 (`/auth/callback`)
- 处理微信 OAuth 回调，换取 token 后写 cookie 并重定向

---

## 四、MDC 组件库（10个）

### 核心组件（必备）

| 组件 | 标签 | 功能 |
|------|------|------|
| ResumeHeader | `::resume-header` | 姓名、职位、联系方式、可选头像 |
| ResumeSection | `::resume-section` | 带标题的分组区块容器 |
| ResumeItem | `::resume-item` | 时间线条目（标题/副标题/日期/描述） |
| SkillTags | `::skill-tags` | 技能标签组 |

### 增强组件

| 组件 | 标签 | 功能 |
|------|------|------|
| Timeline | `::timeline` | 可视化时间线布局 |
| SkillBar | `::skill-bar` | 技能熟练度进度条 |
| ContactIcons | `::contact-icons` | 带图标的联系方式展示 |
| QuoteBlock | `::quote` | 引用/高亮强调块 |
| CardGrid | `::card-grid` | 项目/作品卡片网格 |
| Divider | `::divider` | 自定义分隔线和间距 |

---

## 五、模板系统

4 套模板，每套 = 预填 MDC 文件 + CSS 变量主题。

| 模板 | 文件名 | 目标用户 | 特点 |
|------|--------|----------|------|
| 技术岗 | `tech.md` | 开发/工程师 | 技能标签+项目卡片突出 |
| 应届生 | `fresh-grad.md` | 毕业生 | 教育背景+实习+校园活动 |
| 管理岗 | `management.md` | 中高层管理 | 业绩数据+领导力+正式风格 |
| 极简空白 | `blank.md` | 通用 | 仅基础结构，用户自由填写 |

切换模板时保留用户已填写的文本内容。

---

## 六、认证系统

### 微信 OAuth 流程
1. 用户点击"登录" → 跳转微信授权 URL
2. 用户扫码关注公众号并授权
3. 微信回调 `/auth/callback?code=xxx`
4. 服务端 `code → access_token → openid → 用户信息`
5. 生成 JWT 写入 httpOnly cookie
6. 重定向回来源页面

### 权限控制
- 编辑器本身无需登录即可使用
- 导出功能需登录后解锁
- 已登录用户可保存/管理多份简历

---

## 七、导出系统

| 格式 | 方案 | 依赖 |
|------|------|------|
| MD | `Blob` 直接下载文本文件 | 无 |
| PDF | 新窗口 `/print/[id]` + `window.print()` | 无 |
| PNG | `html2canvas` 客户端截图，2x 缩放 | html2canvas |

全部零服务端依赖。

---

## 八、项目结构

```
resume-editor/
├── pages/
│   ├── index.vue
│   ├── templates.vue
│   ├── editor.vue
│   ├── print/
│   │   └── [id].vue
│   └── auth/
│       └── callback.vue
├── components/
│   ├── editor/
│   │   ├── MdEditor.vue
│   │   ├── ResumePreview.vue
│   │   └── EditorToolbar.vue
│   ├── mdc/
│   │   ├── ResumeHeader.vue
│   │   ├── ResumeSection.vue
│   │   ├── ResumeItem.vue
│   │   ├── SkillTags.vue
│   │   ├── Timeline.vue
│   │   ├── SkillBar.vue
│   │   ├── ContactIcons.vue
│   │   ├── QuoteBlock.vue
│   │   ├── CardGrid.vue
│   │   └── Divider.vue
│   └── landing/
│       └── TemplateCard.vue
├── templates/
│   ├── tech.md
│   ├── fresh-grad.md
│   ├── management.md
│   └── blank.md
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── wechat.get.ts
│   │   │   └── callback.get.ts
│   │   └── resumes/
│   │       ├── index.get.ts
│   │       ├── index.post.ts
│   │       └── [id].put.ts
│   └── utils/
│       └── wechat.ts
├── composables/
│   ├── useEditor.ts
│   ├── useAuth.ts
│   └── useExport.ts
├── assets/
│   └── styles/
│       └── templates/
│           ├── tech.css
│           ├── fresh-grad.css
│           ├── management.css
│           └── blank.css
├── nuxt.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 九、自检清单

- [x] 无不明确的占位符或 TBD
- [x] 架构与功能描述一致
- [x] 范围聚焦，单次实施计划可覆盖
- [x] 无歧义需求
