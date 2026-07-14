# Solo — Design Brief (Rebuild v2, 2026-07)

> 目的：把项目从"hackathon 提交作品"升级为"值得付费使用的独立 SaaS"。抛开 Casper 参赛叙事，回到产品本体：**一个 chat-first 的自由职业者操作系统**。
>
> 这份文档是执行前的方向对齐，不是最终交付。所有 token / 布局 / 文案在你 review 后才落到 code。

---

## 0-B. v2 反馈固化（2026-07-11 review 后）

用户 review 第一版 mock 后确定的方向调整，**优先级高于第 5-9 节的初始描述**。执行时以本节为准。

### 核心原则升级
> **Hero Workspace = Agent Autopilot，不是 Project Info。**
>
> Landing 第一屏用户看到的不应是"聊天窗口 + 项目详情"，而是"AI 正在替我推进事情"——thinking、tool call、timeline、pipeline 都要可见。让用户不读文案也能秒懂"我不用操作，Solo 已经在跑我的生意了"。

### 具体决策

| # | 决策 | 状态 |
|---|---|---|
| D1 | **Amber 保留为唯一强调色**——但收缩到只用在：CTA / Focus 状态 / Tool call chip / Logo。其余位置全部降饱和 | ✅ 确定 |
| D2 | **Instrument Serif 引入**——只用在 Hero 第二行 / quote / CTA / editorial heading。目标比例 95% sans / 5% serif | ✅ 确定 |
| D3 | **Watch demo 不做真实视频**——CSS 打字机足够。真正的展示是 Hero 下方的 Autopilot mock | ✅ 确定 |
| D4 | **Workspace panel 桌面端默认展开** + localStorage 记忆用户偏好 + 移动端折叠成抽屉 | ✅ 确定 |
| D5 | **Casper 不在主 Nav**——新增 `Labs` 入口（也叫 "Experimental"），作为技术彩蛋列表存在，可随时删 | ✅ 确定 |
| D6 | **Hero Chat 侧适度精简**——腾出 Workspace 的视觉呼吸，Workspace 才是主角 | ✅ 确定 |
| D7 | **Demo band 播一次不循环**——播完停住 + "Play again" 按钮。无限循环廉价 | ✅ 确定 |
| D8 | **Capability 卡的 code viz 全部替换为"产品切片"**——像 Attio 一样让每张卡里都是产品真实界面片段，不是 pseudo-code | ✅ 确定 |
| D9 | **Five Steps 右列改为产品输出预览**——每一步都给一个 mini mock（chat / doc / status / invoice / email 缩略），不是文案 | ✅ 确定 |
| D10 | **Feature Grid 全部重写围绕 Agent 属性**——废弃 CSV / Bilingual / Command palette 这类"任何 SaaS 都有"的功能列表 | ✅ 确定 |
| D11 | **Final CTA 换品牌感文案**——候选：*"You close clients. Solo runs the business."* 更符合定位 | ✅ 确定 |

### 新的 Feature Grid 内容（D10 具体化）

替换掉 Bilingual / KB / ⌘K / CSV / Any LLM / Casper 这套通用列表。改为：

| Feature | Copy |
|---|---|
| **Persistent memory** | Remembers every client, budget, deadline, tone. Across sessions, forever. |
| **Human approval built in** | Solo asks before it acts. You stay in control of every send. |
| **Context awareness** | Knows *this* Alice from *that* Alice — client history is always in scope. |
| **Works across models** | Qwen, Claude, GPT. Same memory, same tools. Switch by env var. |
| **One conversation, many actions** | Chains create → contract → invoice → schedule in a single flow. |
| **Labs**（隐藏彩蛋）| Casper on-chain balance verify · Command palette · CSV export · Bilingual UI |

前 5 项独占 grid 主位；Labs 一项做成小字 footer-like，"there's more under the hood" 的感觉。

### Hero Workspace 新结构（D1 视觉稿）

```
┌─── Solo · Autopilot ──────────── ● live ─┐
│                                          │
│  Now thinking                            │
│  ┌────────────────────────────────────┐  │
│  │ Preparing follow-up for Alice…    │  │
│  │ ▓▓▓▓▓▓▓▓░░░░░░  (shimmer bar)     │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Today                                   │
│  ● Client Alice created         14:32    │
│  │                                        │
│  ● Contract drafted             14:33    │
│  │                                        │
│  ● Invoice sent                 14:34    │
│  │                                        │
│  ◐ Preparing follow-up…         now      │
│  │                                        │
│  ○ Waiting for payment                   │
│  ○ Auto-remind in 3 days                 │
│                                          │
│  ─── Pipeline ────────────               │
│  active 5  ·  invoiced 2  ·  overdue 1   │
└──────────────────────────────────────────┘
```

关键视觉词汇：
- **实心 amber 圆点 + ✓**：已完成动作
- **半填充 amber 圆 + 呼吸光晕**：正在做
- **空心灰圆**：Solo 计划中的下一步
- **1px 竖线**：连接 timeline 节点
- **shimmer bar**：正在思考中的进度条

这条 timeline **本身就是产品叙事**——用户不需要读任何一行文案，看一眼就知道"这东西替我推事情"。

---

## 0. TL;DR（3 段话）

1. **重定位**：产品名对外简化为 **"Solo"**，slogan：*"Your freelance business, run by chat."* / *"你的业务，交给对话去跑。"* 不再挂 Casper，重心从"链上验证"转为"AI 主动运营"。
2. **视觉方向**：**Vercel 的克制 + Linear 的编辑感 + Attio 的产品截图叙事**。放弃现在这种"每个卡片都发光、每个按钮都缩放、每个 stat 都渐变"的 hackathon 美学——**降噪 70%，把亮度预算集中在少数关键动作上**。
3. **首波交付**：`Landing`（新建）+ `Chat`（重构成 split workspace）+ `Dashboard`（重构成 focus-first）。三页共享一套新的 design token。其他页面（projects/settings/knowledge）跟随 token 自然升级，不单独重构。

---

## 1. 现状诊断（为什么现在不够惊艳）

看代码 + 跑视觉审计得到的问题，按优先级：

| # | 问题 | 证据 | 后果 |
|---|---|---|---|
| P0 | **没有 Landing 页** | `app/page.tsx` 直接 `redirect('/dashboard')` | 陌生访客一进来就撞在应用界面里，没有"这是什么、为什么值得用"的说服 |
| P0 | **视觉预算全砸在 amber 上** | Logo / CTA / stat 高亮 / focus ring / 聊天气泡 / hover 状态全用 `#fbbf24` | Amber 变成"墙纸"，失去指向性，用户不知道该点哪 |
| P0 | **产品叙事挂在 Casper 上** | README/PLAN/PRODUCT_CONCEPT 都以 buildathon 开篇，Casper 出现 20+ 次 | 比赛结束后，这个叙事对普通用户 0 意义 |
| P1 | **卡片噪音过载** | 每个 card 同时叠了：glass 模糊、shine 扫光、glow blob、hover translate、border 变色、渐变背景 | 静止状态就在动，reader 累；违反 Linear/Attio 的"静止时安静，交互时明确"原则 |
| P1 | **Chat 长得像每一个 ChatGPT 套壳** | `messages.length === 0` 的空态就是"图标 + 4 个 prompt 卡"这种通用套路 | 卖点是"AI 主动运营你的生意"，但 UI 完全没体现——tool call 只是个小 chip |
| P1 | **Dashboard 是标准 SaaS 网格** | 4 stat + project 卡 + activity list，跟 Notion/ClickUp/Trello 长得像 | 没有"这里有 agent 在替你思考"的差异化视觉锚点 |
| P2 | **字号层级压缩在 11–15px** | 除了 dashboard 的 38px H1，几乎没有编辑级的字号跳变 | 缺少"呼吸感"和信息层级，读起来平 |
| P2 | **Emoji 图标（⊡ 💬 📋 📚 ⚙）** | Nav.tsx line 25-32 | 廉价感、混色（emoji 有自己的色彩系统，跟你的 palette 打架） |
| P2 | **Radius 用了 18px（非典型值）** | globals.css `--radius-card: 18px` | 让整体气质"业余"——主流产品 stack 在 12/14/16/20，18 出现在设计约束不清晰的项目里 |
| P3 | **`gradient-text` 灰白渐变到处用** | Heading、logo、statvalues | 灰白渐变是 2021 iOS mock 视觉，2026 已经过时 |

---

## 2. 重定位（Casper 之后，Solo 是什么）

### 一句话
> Solo 是自由职业者的 AI 后台。你只跟它对话，它替你记住每个客户、写合同、追发票、发提醒。

### 三段 elevator

- **对客户说**：Notion 记事、Excel 报价、Gmail 追款、Stripe 收钱——4 个工具的心智负担，一个对话解决。
- **对产品经理说**：我们赌的是 chat 会成为独立工作者的默认操作层，而不是 dashboard。Agent 不是"辅助你操作 dashboard"，而是"取代 dashboard 本身"。
- **对投资人说**：全球 6000 万自由职业者，都需要一个"最小可行的 CFO/助理"，SaaS ARPU $12-20/月的入口。

### 三大差异化能力（换掉 Casper 挂帅的旧叙事）

| 能力 | 用户感受 | 技术实现 |
|---|---|---|
| **Persistent memory** | Agent 记住 Alice 的预算、截止日、付款习惯 | Supabase 全量注入 system prompt |
| **Proactive suggestions** | "刚给 Alice 发了发票？我帮你 3 天后生成催款文案" | Tool-call 循环 + 业务规则 |
| **Multi-tool orchestration** | 一句话完成"创建项目 → 生成合同 → 起草邮件" | 流式 agentic loop |

（Casper 演示可保留为 `/casper` 内页作为技术彩蛋，但不再是产品主线）

### 命名建议
| 场景 | 现在 | 建议 |
|---|---|---|
| 产品显示名 | Solo Worker OS | **Solo** |
| 全名（docs / footer） | Solo Worker OS × Casper Network | **Solo — AI operator for freelancers** |
| Logo 单字 | S（琥珀渐变方块） | **·** 或 **S**（去渐变、纯色 off-white 圆角方块） |
| Domain（未来） | — | solo.chat / usesolo.ai |

---

## 3. 参考站视觉语言拆解

选这三个不是"照抄"，是各取一维：**Vercel 教我们克制，Linear 教我们编辑感，Attio 教我们截图叙事**。

### 3.1 Linear (linear.app) — Editorial hero + monochrome discipline

| 维度 | 观察 | 我们要吸收的 |
|---|---|---|
| **色板** | 深蓝黑 `#08090a` bg + 白 + 单一冷紫强调色（`#5e6ad2`），几乎不出现第二个饱和色 | 单一强调色纪律。Amber 只用于 CTA 和 focus，其他都是无色 |
| **Hero type** | 82-120px, `Inter Display`, 字重 500, `letter-spacing: -0.04em`, 行高 0.95 | 大字 + 紧凑 tracking + 500 字重（不是 800）——**减字重加字号**，气质完全不同 |
| **交互** | Hover 只有 opacity 变化 + 4px 的位移，几乎察觉不到 | 拒绝 hover translate/scale/shine 三件套 |
| **文案** | 短句、动词开头、无形容词。"Purpose-built for product development." | 我们的 hero 也是短、直、动词 |
| **命令面板** | Cmd+K 是他们的品牌资产，主页第一屏就有 UI 展示 | 我们已经有 CommandPalette.tsx，Landing 要 hero 就展示 |

### 3.2 Vercel (vercel.com) — Hairline structure + spec table

| 维度 | 观察 | 我们要吸收的 |
|---|---|---|
| **表面** | **完全不用 glass**。纯色 `#0a0a0a` bg + 面板 `#111111` + 1px hairline border `#262626` | 干掉 `glass` / `glass-strong`，换成实心表面 + 1px hairline |
| **字体** | Geist Sans + Geist Mono（自家开源）——像 SF 但更几何、更"工程感" | 引入 Geist（免费，next/font 直接支持） |
| **Spec 表格** | Feature 用 "label · value" 两列排版，等宽字，冷静 | Dashboard 的 stat strip 用同款排版 |
| **产品截图** | 截图放进 `bg: linear-gradient` 淡色渐变面板，圆角 20-24px，1px 内描边 | Landing 的 hero 截图完全同款处理 |
| **Section 节奏** | 首屏 100vh，之后每个 section 80-96px 上下 padding | 我们采用 96/128 的节奏 |

### 3.3 Attio (attio.com) — Product-first storytelling

| 维度 | 观察 | 我们要吸收的 |
|---|---|---|
| **Feature 卡** | 每个能力是一张"大卡"，卡内直接放**产品真实截图**（而非抽象插画），配色分区（一张暖橘、一张冷绿、一张冷紫） | 三大能力卡直接嵌入 chat/dashboard 截图 |
| **数据视觉** | Emoji + 人名 + 时间戳的组合是他们的"信息呼吸"——**信息不装严肃，反而让人觉得可靠** | Activity stream 保留 emoji，但升级为一致的 SVG monoline 图标集 |
| **色彩分区** | 深色模式下 section 之间用非常淡的色块背景切分（`rgba(120, 200, 180, 0.03)`），几乎察觉不到但增加节奏 | Landing section 之间用同样的色相染色 |
| **Timeline 视觉** | Inbox / stream 作为 hero 意象，因为他们的产品就是关系流 | 我们的 hero 意象是"对话 + 项目动作流" |

### 3.4 补充参考（次要维度）

| 站点 | 借鉴点 |
|---|---|
| **Mercury (mercury.com)** | 数字排版的克制——大数字 + 小 label + 单位对齐 |
| **Raycast (raycast.com)** | 命令面板的视觉、快捷键 chip 的样式 |
| **Height (height.app)** | 分栏 chat + workspace 的比例（60/40）和折叠交互 |
| **Instrument Serif（字体）** | 免费编辑级衬线，Hero 的 eyebrow / 引用可以用它加"人文感" |

---

## 4. 新的 Design Token 系统

**核心哲学：静止时安静，交互时明确，重要时华丽。**

### 4.1 Color

```
─── FOUNDATION ─────────────────────────────
bg          #0a0a0c   (near-black, 有一点点冷)
surface     #111114   (面板)
surface-2   #17171b   (面板内的第二层)
elevated    #1c1c21   (弹出层 / 命令面板)

─── BORDER ─────────────────────────────────
border      #23232a   (hairline 1px, solid, 不用 rgba)
border-hi   #2f2f38   (hover / focus 时)
border-lo   #1a1a1f   (最微弱的分隔)

─── TEXT ────────────────────────────────────
text-hi     #f5f5f7   (标题，不是纯白)
text        #d4d4d8   (正文)
text-mid    #8a8a92   (次要)
text-lo     #58585f   (元信息 / mono)
text-xlo    #3d3d43   (禁用)

─── ACTION（唯一饱和色）────────────────────
accent      #f5b544   (Solo Amber，比原来的 #fbbf24 稍暖稍暗，更"金")
accent-hi   #ffcd6b   (hover)
accent-ink  #1a1400   (在 accent 上的文字)

─── SEMANTIC（低饱和，服务信息）───────────
success     #4ade80 @ 70% sat  (paid)
info        #67e8f9 @ 60% sat  (invoiced)
warn        #fbbf24 @ 60% sat  (active)  ← 注意跟 accent 区分（sat 更低）
danger      #f87171 @ 65% sat  (overdue)

─── EDITORIAL（新增）──────────────────────
cream       #f0e6d2   (hero eyebrow / 引用体 / serif accent)
```

**改动要点**：
1. 引入 `cream` 作为编辑级第二色，专门用于 hero 的 eyebrow、引用、编辑排版——让页面有"报刊感"而不是纯粹的产品感
2. `accent` 从纯 amber 挪到"金"（更暖、更贵气）。副色不再是"5 种发光色"，而是低饱和的语义色
3. **删除 `glow-*` 阴影**（`shadow-glow-amber` 等 5 个），只留一个 `shadow-accent` 用在唯一的 hero CTA
4. Border 从 `rgba(255,255,255,0.06)` 改成实心 `#23232a`——玻璃拟态时代已过，2026 的 Vercel/Linear/Attio 都是实心 hairline

### 4.2 Typography

```
─── FAMILIES ───────────────────────────────
--font-sans: "Geist", ...system
--font-mono: "Geist Mono", ...
--font-serif: "Instrument Serif"  (Hero eyebrow, quote 用)

─── SCALE ──────────────────────────────────
xs        11 / 14     (mono meta, eyebrow)
sm        12 / 16     (labels, chips)
base      14 / 22     (body)
md        16 / 24     (large body)
lg        20 / 28     (subheadings)
xl        28 / 36     (H3 sections)
2xl       40 / 46     (H2 sections)
3xl       56 / 60     (H1 pages inside app)
display   96 / 96     (Landing hero, tracking -0.04em)
mega      128 / 116   (可选：Landing 第二屏"quote")

─── WEIGHT ─────────────────────────────────
默认只用 400 / 500 / 600。
Hero 用 500（不是 800——这是气质的分水岭）。
Mono 用 500。
Label / eyebrow 用 600 + tracking 0.14em + uppercase。

─── TRACKING ───────────────────────────────
hero      -0.04em
h2/h3     -0.02em
body      0
mono      -0.01em
eyebrow   +0.14em (uppercase)
```

### 4.3 Spacing / Radius / Motion

```
─── SPACING RHYTHM ─────────────────────────
密：8 / 12 / 16
中：24 / 32
大：48 / 64
Landing section：96 / 128 上下

─── RADIUS ─────────────────────────────────
chip / kbd    6
input         10
card          14   ← 从当前的 18 改成 14
panel         20   ← hero 内的大截图 panel
full          9999

─── MOTION ─────────────────────────────────
删除：card shine sweep、glow-pulse、float、spin-slow（视觉噪音）
保留：fade-up（进场）
新增：
  - route-slide 8px（页面切换）
  - hover-lift 2px + opacity 0.85→1（次要交互）
  - accent-glow 呼吸（只用在 hero CTA 一处）
Easing：cubic-bezier(0.2, 0.8, 0.2, 1)（spring 感）
Duration：200-320ms 主流；进场 400；hero 编排 600-800

─── SHADOW ─────────────────────────────────
删：glow-amber/teal/violet/emerald/coral（5 个都删）
留：
  hairline-inset  inset 0 1px 0 rgba(255,255,255,0.04)
  card-lift       0 8px 32px -12px rgba(0,0,0,0.5)
  accent-glow     0 0 40px rgba(245,181,68,0.35)   ← 只 hero CTA 用
```

### 4.4 组件的"before/after"

| 组件 | Before | After |
|---|---|---|
| Nav 链接 | Emoji + label | 单色 monoline SVG icon + label |
| Logo | 琥珀渐变方块 + 白色 S | Off-white 圆角方块 + 黑色 `·` 或极简 S |
| Stat card | 每个 stat 一个独立卡 + 独立 glow 色 | 一整条 spec strip：`Active   12    Pending  $8,400   Earned  $24k   Overdue  1`，无卡边，用竖线分隔 |
| CTA | `bg-gradient-to-br from-amber-400 to-amber-600 shadow-glow-amber hover:scale-1.03` | `bg-accent text-accent-ink hover:bg-accent-hi shadow-accent-glow` 无 scale |
| Card hover | shine sweep + translate + glow | 只 border 从 `border` 变 `border-hi` + `bg` 加 `rgba(255,255,255,0.02)` |

---

## 5. Landing 页 IA + Wireframe

**目标读者**：第一次听说 Solo 的独立设计师/开发者/顾问，来自 X/HN/朋友推荐。停留 30 秒决定要不要 "Try it"。

**转化优先级**：Hero CTA > Live demo band > Try in chat > Docs

### 结构

```
┌─────────────────────────────────────────────────────────────────┐
│  NAV (sticky, 60px)                                             │
│  · Solo          Features  How it works  Pricing  Docs          │
│                                       [中文]  [Sign in]  [Try→] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HERO (100vh - 60px, 上下 padding 128)                          │
│                                                                 │
│    ──── AI freelance operator · 2026 (eyebrow, cream serif)     │
│                                                                 │
│    Your freelance business,                                     │
│    run by chat.                       ← 96px, Geist 500         │
│                                                                 │
│    One AI agent handles clients, contracts,                     │
│    invoices, and follow-ups. You talk.        ← 20px, text-mid  │
│    Zero forms, zero spreadsheets.                               │
│                                                                 │
│    [Start chatting →]   Watch demo (30s) ▸                      │
│      ↑ accent CTA         ↑ ghost link                          │
│                                                                 │
│    ┌────────────────────────────────────────────────────┐       │
│    │  [大产品截图：Chat 界面 + 右侧 workspace 面板]     │       │
│    │  框在 20px radius + hairline + 内阴影 tinted panel │       │
│    │  背景是 cream/5% 淡色渐变，模拟"聚光灯"打在产品上  │       │
│    └────────────────────────────────────────────────────┘       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LIVE DEMO BAND (72px 上下, bg 淡染 amber/2%)                   │
│                                                                 │
│  ─── SEE IT WORK                                                │
│                                                                 │
│  [3-scene 打字机动画在等宽字里逐字出现]                          │
│  You:    "New client Alice, landing page, $5k, due Aug 15"     │
│  Solo:   [✱ create_project]  Project #47 created.              │
│          Draft a contract now?                                 │
│  You:    "yes"                                                 │
│  Solo:   [📝 generate_contract]  Contract ready. [Preview →]   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  THREE CAPABILITIES (96px 上下)                                 │
│                                                                 │
│  ─── WHY IT'S DIFFERENT                                         │
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                          │
│  │ Memory  │  │ Proact. │  │ Multi-  │                          │
│  │         │  │         │  │ tool    │                          │
│  │ [图]    │  │ [图]    │  │ [图]    │                          │
│  │ Small   │  │ Never   │  │ One msg │                          │
│  │ headline│  │ needs   │  │ = many  │                          │
│  │ + 3-line│  │ nudging │  │ actions │                          │
│  │ story   │  │         │  │         │                          │
│  └─────────┘  └─────────┘  └─────────┘                          │
│     ↑ 每张卡背景稍微染色（暖橘/冷绿/冷紫），Attio 风              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HOW IT WORKS (96px 上下, spec table 风)                        │
│                                                                 │
│  ─── FIVE STEPS                                                 │
│                                                                 │
│  01  Intake     |  Describe a client in one sentence            │
│  ─────────────────────────────────────────────────────          │
│  02  Contract   |  Auto-drafted, downloadable in seconds        │
│  ─────────────────────────────────────────────────────          │
│  03  Track      |  Every project has a status, forever          │
│  ─────────────────────────────────────────────────────          │
│  04  Invoice    |  Solo remembers your terms                    │
│  ─────────────────────────────────────────────────────          │
│  05  Follow-up  |  Firm, polite, or final — you pick tone       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FEATURE GRID (64px, 3x2)                                       │
│                                                                 │
│  · Bilingual (EN/中文)                                          │
│  · Knowledge base RAG                                           │
│  · Command palette (⌘K)                                         │
│  · CSV export                                                   │
│  · Multiple LLM providers (Qwen / Claude / GPT)                 │
│  · Casper on-chain verify (optional)                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TECH STACK STRIP (48px)                                        │
│  BUILT WITH  Next.js  ·  Supabase  ·  Qwen  ·  TypeScript       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FINAL CTA BAND (128px 上下, 居中)                              │
│                                                                 │
│    Stop juggling five apps.                                     │
│    Start with your first client.       ← 56px display           │
│                                                                 │
│    [Open Solo →]                                                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER (48px, hairline top)                                    │
│  © 2026 Solo   ·   Docs   Privacy   GitHub   Twitter            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Chat 页 IA + Wireframe

**核心 insight**：把 chat 从"消息列表"升级为**"AI 工作台"**——右侧永远有一个 workspace 面板，显示 agent 正在做什么、动过什么、下一步会做什么。这是"AI 主动运营"这个卖点的视觉证据。

```
┌────────────────────────────────────────────────────────────────────┐
│  NAV                                                               │
├─────────────────────────────────────┬──────────────────────────────┤
│                                     │                              │
│  CONVERSATION (60%)                 │  WORKSPACE (40%)             │
│                                     │                              │
│  ─── Today                          │  ┌──── FOCUS ─────────┐      │
│                                     │  │                    │      │
│  You                          14:32 │  │  🟡 Alice · Landing│      │
│  ┌───────────────────────────────┐  │  │  $5,000 · Aug 15   │      │
│  │ Send Alice's invoice          │  │  │  Status: invoiced  │      │
│  └───────────────────────────────┘  │  │                    │      │
│                                     │  │  [Draft follow-up] │      │
│  Solo                         14:32 │  │  [Mark paid]       │      │
│  Sure — let me pull it up.          │  │  [Open project]    │      │
│                                     │  └────────────────────┘      │
│  ┌─────────────────────────────┐    │                              │
│  │ ✱ get_project(alice)        │    │  ─── RECENT ACTIONS          │
│  │   → id: p_47                │    │                              │
│  └─────────────────────────────┘    │  • send_invoice · 2m ago     │
│                                     │  • get_project · 2m ago      │
│  ┌─────────────────────────────┐    │  • generate_contract · 1h    │
│  │ ✱ send_invoice(p_47)        │    │  • create_project · 1h       │
│  │   → sent to alice@…         │    │                              │
│  └─────────────────────────────┘    │  ─── PIPELINE                │
│                                     │                              │
│  Invoice sent. Want me to           │  Active     ▓▓▓▓▓░░░  5      │
│  schedule a 3-day follow-up?        │  Invoiced   ▓▓░░░░░░  2      │
│                                     │  Overdue    ▓░░░░░░░  1      │
│                                     │                              │
│  ─── Yesterday                      │                              │
│                                     │                              │
│  (older messages…)                  │                              │
│                                     │                              │
├─────────────────────────────────────┴──────────────────────────────┤
│  INPUT (sticky bottom, full width)                                 │
│                                                                    │
│  Reply to: Alice · Landing page       ← 上下文 pill 可 dismiss     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Type or press ⌘K…                                    [→]   │    │
│  └────────────────────────────────────────────────────────────┘    │
│  Enter to send · Shift+Enter new line · ⌘K quick actions           │
└────────────────────────────────────────────────────────────────────┘
```

**关键改动**：
- **Tool call 卡**从当前的小 chip 升级成"事件卡"：图标 + 工具名 + 参数摘要 + 输出摘要。**这是产品叙事的主体**——让访客立刻看懂"agent 在真的干活"
- **Workspace 面板**（右侧）新增，包含：Focus card / Recent actions / Pipeline mini-viz
- **上下文 pill**（输入框上方）：告诉用户当前对话锁定的项目/客户，可 dismiss
- **消息按日期分组**（Today / Yesterday / Last week），不是无穷流
- 移动端：workspace 面板收纳到抽屉，顶部一个 pill 可拉出

---

## 7. Dashboard 页 IA + Wireframe

**核心 insight**：不是"给我看数字"，是"告诉我下一步做什么"。所以第一屏是 **Focus 卡**（agent 主动推的"最紧要一件事"），不是 stat grid。

```
┌────────────────────────────────────────────────────────────────────┐
│  NAV                                                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Morning, Jesse. Wednesday, July 15.        [Talk to Solo →]       │
│    ↑ 15px text-mid, greeting 由 utils.getGreeting()                │
│                                                                    │
│  ┌─── FOCUS ────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │   🔥 One thing needs you today                               │  │
│  │                                                              │  │
│  │   Alice's invoice is 3 days overdue.                        │  │
│  │   Solo can send a firm-but-friendly follow-up in her tone.  │  │
│  │                                                              │  │
│  │   [Send follow-up →]   [Snooze 3d]   [Ignore]                │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│    ↑ 单张大卡，暗底 + 微暖 tint + hairline border                  │
│                                                                    │
│  ─── STATS (spec strip, no cards)                                  │
│                                                                    │
│  ACTIVE      │ PENDING            │ EARNED (YTD)     │ OVERDUE     │
│  12          │ $8,400 · SGD 3,200 │ $24,120 · S$21k  │ 1 !         │
│                                                                    │
│  ↑ 一整条，用竖线分隔。数字用 mono，label 用 eyebrow 风。          │
│                                                                    │
├──────────────────────────────────────────┬─────────────────────────┤
│                                          │                         │
│  PROJECTS (2/3)                          │  ACTIVITY (1/3)         │
│                                          │                         │
│  Sort: recent · Filter: all              │  ─── TODAY              │
│                                          │  ✱ Alice · invoiced     │
│  CLIENT           STATUS    DUE    ¥     │    14:32                │
│  ─────────────────────────────────────   │  ✱ Marcus · created     │
│  Alice            invoiced  Aug 15 $5k   │    11:04                │
│  Marcus Rivera    active    Aug 22 $12k  │  ─── YESTERDAY          │
│  Priya Shah       paid      —     $3.5k  │  ✱ contract generated   │
│  Jean Dupont      overdue!  Jul 10 $2k   │    for Priya            │
│  … [+8 more]                             │  ─── LAST WEEK          │
│  [View all →]                            │  ✱ 3 projects delivered │
│                                          │                         │
├──────────────────────────────────────────┴─────────────────────────┤
│                                                                    │
│  REVENUE (可选，第三期加)                                          │
│  [轻量 area chart, 最近 12 周, mono 数字 legend, 无 tooltip 装饰]   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**关键改动**：
- **Focus 卡**是新增的最上层组件——从项目数据里推理出"今天最该做什么"（overdue 优先，其次 due-in-3-days，其次 pending invoice）。这是 dashboard 的差异化视觉锚点
- **Stat strip** 替代 4 张 stat card。数据是主角，装饰退位
- **Projects 用密集表格**（Linear 风），不是 card grid。card grid 适合 4-6 个，10+ 项目就该表格化
- **Activity 按日期分组**，配 monoline 图标，替换 emoji
- Onboarding（空态）从当前的"3 步骤 hero"精简为一句话 + 一个 CTA："You don't have any projects yet. [Add your first client →]"

---

## 8. 分阶段执行路线（review 后启动）

| 阶段 | 内容 | 产出 |
|---|---|---|
| **Phase 0 · 现在** | 你 review 本 brief + Landing mock，敲定方向 | ✅ 已交付 |
| **Phase 1 · 基建（1 天）** | 落新 design token：改 `globals.css` / `tailwind.config.ts` / 装 Geist + Instrument Serif / 删掉 `glass` / `glow-*` / `card-shine` 等噪音类 | 全站视觉自动降噪 |
| **Phase 2 · Landing（2 天）** | 建 `app/(marketing)/page.tsx` + 内页所需组件（Hero / DemoBand / CapabilityCard / SpecTable / CtaBand / Footer）。中英双语路由：`/`（EN）+ `/zh` | 陌生访客第一屏 |
| **Phase 3 · Chat 重构（2 天）** | Split workspace 布局 + Tool-call event card 组件 + 上下文 pill + 按日期分组 + workspace panel | 卖点视觉化 |
| **Phase 4 · Dashboard 重构（1.5 天）** | Focus card（含推荐逻辑）+ Stat strip + 项目表格（替换 card grid）+ Activity 分组 | 差异化第一屏 |
| **Phase 5 · Nav + 图标（0.5 天）** | Nav 图标从 emoji 换成 lucide-react（tree-shakable），logo 精简 | 消除廉价感 |
| **Phase 6 · Polish + QA（1 天）** | 响应式 / 键盘 / 空态 / 错误态 / 语言切换回归 | 上线可用 |

**总工时估算**：8 天集中开发。可并行的：Phase 1 + Phase 2 之间可以启动 Phase 5 的图标资源准备。

---

## 9. 需要你决策的开放问题

按重要性排序，可以边做边定，也可以现在敲：

1. **是否保留 Solo Amber (#f5b544) 作为唯一强调色？** 我推荐保留——琥珀色在深色 UI 里辨识度高、有"温暖 / 值得信任"的语义。备选：换成 Linear 的紫色 `#5e6ad2`，会更"科技"但少了独立职业者"温暖工作台"的心智。
2. **是否引入 Instrument Serif（编辑级衬线）？** 我推荐引入——只用在 Landing 的 hero eyebrow 和 quote 处，让页面有一层"人文"气质，跟纯几何 sans 的产品页拉开区分。文件小（~30KB WOFF2），加载成本可控。
3. **Landing 的 "Watch demo (30s)"** 需不需要真的做一个 30 秒视频？还是先用一个静态图 + "Coming soon" placeholder？我倾向 Phase 2 里先做一个 CSS 打字机 loop 动画替代视频，成本 1 小时，效果 80%。
4. **Chat 的 workspace panel 是否默认展开？** 我推荐"首次访问默认展开 + 记忆用户偏好"。第一印象很重要，需要用户看到"哦原来右边一直在跟着我思考"。
5. **是否把 `/casper` 从 nav 里彻底移除，还是作为 `/labs/casper` 保留？** 我推荐保留在 `/labs/casper`，nav 里不出现，但 Landing 的 "Feature grid" 里列"Casper on-chain verify (optional)"——技术彩蛋 + 招募感兴趣的开发者。

---

## 10. 下一步

看完这份 brief 后，我会同步交付一个 **`docs/mocks/landing.html`**——不依赖任何构建工具，浏览器直接打开就能看到新视觉语言下的 Landing 完整效果。你 review mock + 本文档后：

- 如果方向 OK，我进入 Phase 1（token 落地）
- 如果某个方向要调整（比如 accent 换色、layout 换法），你在这份文档上直接批注，我基于你的批注改后再走 Phase 1

**我不会未经确认就动 `app/` 或 `components/` 下的代码。**
