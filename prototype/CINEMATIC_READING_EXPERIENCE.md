# Cinematic Reading Experience — Technical & Design Document

> 文字是骨骼。音乐是血液。星空是呼吸。色彩是体温。
> 读者以为自己在"理性地阅读"，但他的灵魂已经被感官通道悄悄调动了。

---

## 设计原则

1. **文字保持冷峻。** 零感性词汇。不煽情。不用感叹号堆情绪。
2. **感性通过感官通道传递。** 音乐、星空、色温——走耳朵和眼睛，不走文字。
3. **SUBTLE（有文字时）。** 如果读者注意到某个变化的瞬间，那就太快了。
4. **EXPRESSIVE（无文字时）。** 章节间的过渡区没有文字，可以尽情释放视觉能量。
5. **电影手法。** 诺兰的《星际穿越》——台词极其克制，Hans Zimmer的管风琴让你哭。

---

## 可控维度总览

| # | 维度 | 控制方式 | 情绪效果 |
|---|------|---------|---------|
| 1 | 音乐 | 曲目切换 + 5s crossfade | 情绪底色 |
| 2 | 星空密度 | 星星数量 (350–1800) | 孤独 ↔ 丰盛 |
| 3 | 星空方向 | 流动方向 | 空间感/叙事方向 |
| 4 | 星空速度 | 漂移速率 (1x–21x) | 静止 ↔ 穿越 |
| 5 | 星空亮度 | brightness range | 暗淡 ↔ 明亮 |
| 6 | 星空闪烁 | flare频率 | 死寂 ↔ 生机 |
| 7 | 星辰颜色 | 7种恒星光谱色 + 5种过渡色 | 冷 ↔ 暖 ↔ 彩虹 |
| 8 | 星云颜色 | 渐变色调（5组） | 冷蓝 → 紫红 → 暗金 → 虚无 → 全彩 |
| 9 | 星云亮度 | opacity (0.2–0.85) | 隐约 ↔ 壮丽 |
| 10 | 星云动画速度 | animation-duration (14s–40s) | 活跃 ↔ 沉寂 |
| 11 | 文字效果 | 4种入场动画 | 强调关键句 |
| 12 | 章节过渡 | Lightspeed（加速/巡航/减速） | 情绪转场 |
| 13 | 背景底色 | body background #050508 | 纯黑深空 |

---

## 维度详解

### 1. 音乐系统

**机制：** 多条音轨循环播放，scroll触发切换，5秒sine-easing crossfade。

**参数：**
- 最大音量：0.28（背景级，不抢注意力）
- Crossfade时长：5秒（旧曲fade out，新曲延迟0.8秒后fade in）
- Easing：cosine curve（非线性，自然感）

**当前曲目映射：**

| Mood | 曲目 | 作者 | 情绪 |
|------|------|------|------|
| calm | Snowfall | Scott Buckley | 安静、客观、深夜书房 |
| wonder | Filaments | Scott Buckley | 好奇、展开、有什么在那里 |
| awe | Horizons | Scott Buckley | 宏大、层叠、不可阻挡 |
| weight | Escape | Sappheiros | 沉重、永恒、无法逃避 |

**通知 Toast：**
- 位置：右上角
- 入场：从右侧滑入 + fade（1.2s）
- 发光脉冲：入场后0.6s触发，持续1.2s，蓝白色 box-shadow
- 退场：5s后滑回右侧 + fade out
- 内容：`♪ 曲名 — 作者`

**许可：** 全部 CC BY 3.0/4.0，需在 credits 页标注。

---

### 2–7. 星空系统（Starfield）

**机制：** Canvas 2D，requestAnimationFrame 循环。

**星辰颜色（7种基础 + 5种过渡专用）：**

| 颜色 | RGB | 类型 | 基础概率 |
|------|-----|------|---------|
| 蓝白 | 210, 225, 255 | O/B class | 35% |
| 纯白 | 255, 252, 240 | F class | 20% |
| 淡蓝白 | 230, 235, 255 | — | 15% |
| 冷蓝 | 195, 215, 255 | A class | 12% |
| 暖白 | 255, 240, 220 | G class | 8% |
| 黄橙 | 255, 220, 180 | K class | 6% |
| 橙红 | 255, 195, 170 | M class | 4% |

**过渡专用色（lightspeed时额外生成）：**

| 颜色 | RGB | 感觉 |
|------|-----|------|
| 暖金 | 255, 200, 140 | 希望、温暖 |
| 薰衣草 | 200, 160, 255 | 神秘、灵性 |
| 冰蓝 | 140, 200, 255 | 清澈、真理 |
| 珊瑚橙 | 255, 160, 120 | 生命、活力 |
| 薄荷绿 | 180, 255, 200 | 新生、盼望 |

**方向语义：**

| Direction | 视觉效果 | 情绪含义 |
|-----------|---------|---------|
| `center-zoom` | 从中心向外扩散 | 穿越深空 / 宇宙在展开 |
| `rise` | 向上漂浮 | 希望升起 / 被提升 |
| `sink` | 向下沉落 | 重力 / 沉重 / 坠落 |
| `drift-left` | 水平漂移 | 时间在流逝 / 旅途 |

**性能：** radius < 0.4px 用 `fillRect`（3x快于arc）。1200颗星60fps无压力。

---

### 8–10. 星云系统（Cosmic Nebula）

**机制：** 5组 CSS div（每组3个blob），通过 `opacity: 0/1` + `transition: 5s` 交叉淡入淡出。

**设计参考：** JWST（韦伯太空望远镜）深场照片。

**5组星云：**

| 组 | 主色调 | 最高opacity | 动画速度 | 感觉 |
|----|--------|------------|---------|------|
| calm | 冷蓝/深海军蓝 | 0.55 | 30s | 远处微弱星云 |
| wonder | 紫/品红 | 0.55 | 22s | 创造之柱发光 |
| awe | 浓紫+蓝+暗金（多口袋） | 0.85 | 20s | JWST深场 |
| weight | 近黑/极暗靛蓝 | 0.3 | 40s | 星云消散 |
| **lightspeed** | **紫+蓝+金橙（全彩）** | **0.85** | **14s** | **宇宙全力绽放** |

**Vignette保护层：** `::after` 伪元素，中心15%暗化，边缘35%暗化。

---

### 11. 文字效果

| 效果 | Class | 触发 | 描述 | 适用场景 |
|------|-------|------|------|---------|
| **Glow** | `fx-glow` | 进入视口 | 文字淡入后蓝白光晕脉冲3秒 | 每节最重要的一句话 |
| **Fade Up** | `fx-fade-up` | 进入视口 | 从下方20px滑入+淡入 | 普通段落入场 |
| **Typewriter** | `fx-typewriter` | 进入视口 | 逐字出现(45ms/字)+光标闪烁 | 需要读者放慢的句子 |
| **Reveal** | `fx-reveal` | 进入视口 | 逐词出现(180ms间隔)+微滑入 | 名字、结论、终极声明 |
| **Cinematic Quote** | `fx-quote` | 进入视口 | 缩放入场+左边框发光+背景微亮 | 核心论点blockquote |

**使用原则：**
- 每个section最多1个 `fx-glow`（最重要的那句）
- `fx-fade-up` 可以多用（通用入场）
- `fx-typewriter` 极少用（强制减速，只用于转折点）
- `fx-reveal` 用于"第一次说出一个名字"的时刻
- `fx-quote` 用于每节的核心thesis blockquote

---

### 12. 章节过渡：Lightspeed

**设计理念：** 章节之间是一整屏的空白（100vh）。没有文字，不需要顾忌可读性。这是视觉可以完全释放的区域。

**不是"超光速线条"。是"宇宙苏醒"。**

**触发机制：**
```
读者滚动进入 transition zone (100vh空白)
  → IntersectionObserver (threshold: 0.15) 触发
  → triggerLightspeed() 调用
  → 星空加速 + 加星 + 星云切换到 lightspeed 组

读者继续滚动，下一章的顶部进入屏幕30%位置
  → 第二个 Observer (rootMargin: '0px 0px -70% 0px') 触发
  → endLightspeed() 调用
  → 星空减速 + 多余星星淡出 + 星云切换到下一个mood

结果：文字出现时，一切已经平静下来
```

**Lightspeed 期间发生什么：**

| 维度 | 正常状态 | Lightspeed状态 |
|------|---------|---------------|
| 星星数量 | 350–1200 | +600 额外生成 |
| 速度 | 1x | 21x |
| 方向 | 当前mood | 强制 center-zoom |
| 亮度上限 | 0.25–0.5 | 1.0（alpha cap 0.85保色） |
| 星星大小 | 正常 | ×2.5 放大 |
| 星星颜色 | 70%冷色 | 额外星25%暖金/15%薰衣草/15%冰蓝/10%珊瑚/10%薄荷 |
| 星云 | 当前mood | lightspeed组（紫+蓝+金，0.85 opacity，14s动画） |
| 中心光晕 | 无 | 暖紫色径向渐变 |

**时间线（90帧≈1.5秒加速/减速）：**
```
ACCELERATING: 速度 1→21x, 亮度渐增, 星星渐入 (1.5s)
CRUISING:     保持最大值，持续到 endLightspeed() 被调用
DECELERATING: 速度 21→1x, 多余星星标记dying并淡出 (1.5s)
```

**HTML用法：**
```html
<!-- 放在任意两个 mood zone 之间 -->
<section class="zone-transition" data-transition="lightspeed">
    <div class="transition-space"></div>
</section>
```

---

## 预设摄影机（Camera Presets）

### `calm` — 凝视虚空

```
星空：350颗，极慢(0.03)，中心扩散
星云：冷蓝，opacity 0.55，30s动画
音乐：Snowfall
感觉：你独自站在宇宙边缘。安静。孤独。但不恐惧。
适用：结论层、前言、镜片选择
```

### `wonder` — 有什么在那里

```
星空：600颗，缓慢上升(0.045)
星云：紫色浮现，opacity 0.55，22s动画
音乐：Filaments
感觉：星星在聚集。有什么正在被揭示。你开始好奇。
适用：逻辑层、生活化Lens、年轻人视角
```

### `awe` — 穿越启示

```
星空：1200颗，快速中心扩散(0.09)
星云：浓郁多色（紫+蓝+金），opacity 0.85，20s动画
音乐：Horizons
感觉：证据如星海般涌来。密集。不可阻挡。你在穿越真相。
适用：论证层、证据表格、预言链条
```

### `weight` — 永恒的重量

```
星空：400颗，极慢下沉(0.01)
星云：几乎消失，opacity 0.3，40s动画
音乐：Escape
感觉：一切慢下来。星星在坠落。你感受到永恒的重力。
适用：结尾段落、"墙那边是永恒"、过渡章
```

### `lightspeed` — 宇宙苏醒（仅过渡区）

```
星空：当前数量+600，21x速度，center-zoom，全亮度，彩色
星云：全彩（紫+蓝+金橙），opacity 0.85，14s动画（最快）
感觉：宇宙在你面前完全展开。不是旅行，是创造本身在呼吸。
适用：章节间100vh空白过渡区
```

---

## 情绪弧线设计指南

### 典型弧线A（大部分章节）
```
calm → wonder → awe → [LIGHTSPEED] → weight
安静开场 → 好奇展开 → 证据高潮 → 宇宙过渡 → 沉重结尾
```

### 典型弧线B（Q&A/抵抗章）
```
wonder → awe → awe → [LIGHTSPEED] → calm
直接进入 → 论证密集 → 持续高压 → 过渡 → 平静收尾
```

### 典型弧线C（过渡章/温柔章）
```
calm → calm → wonder → weight
全程安静 → 微微展开 → 沉入永恒
```

---

## 使用指南：为新章节配置

### 步骤1：划分 mood zones

```html
<section class="zone" data-mood="calm">结论</section>
<section class="zone" data-mood="wonder">逻辑</section>
<section class="zone-transition" data-transition="lightspeed">
    <div class="transition-space"></div>
</section>
<section class="zone" data-mood="awe">论证</section>
<section class="zone" data-mood="weight">结尾</section>
```

### 步骤2：标记文字效果

```html
<blockquote class="fx-quote">核心论点</blockquote>
<p class="fx-glow">最重要的一句话</p>
<p class="fx-fade-up">普通段落</p>
<p class="fx-typewriter" data-text="需要慢读的句子">需要慢读的句子</p>
<p class="fx-reveal">第一次说出的名字</p>
```

### 步骤3：选择音乐

修改 `app.js` 中的 `MOOD_TRACKS` 和 `TRACK_INFO`。

### 步骤4：微调（可选）

- 需要特殊星云色？在 CSS 中新增 `.aurora-[name]` 组
- 需要不同的过渡效果？修改 `data-transition` 属性（目前只有 lightspeed）
- 需要更多/更少星星？修改 `CAMERAS` 中的 `starCount`

---

## 文件结构

```
/prototype/
  index.html          — 页面结构 + 音频 + aurora DOM + transition zones
  style.css           — 星云5组 + 动画 + 排版 + toast + 文字效果
  app.js              — mood引擎 + 音乐crossfade + aurora切换 + toast + 文字效果触发 + lightspeed触发
  starfield.js        — 星空引擎 + camera presets + lightspeed加速/巡航/减速
  CINEMATIC_READING_EXPERIENCE.md  — 本文档

/music_asset/
  Scott Buckley - Snowfall.mp3
  Scott Buckley - Filaments.mp3
  Scott Buckley - Horizons.mp3
  Sappheiros - Escape.mp3
  (+ 其他备用曲目)
```

---

## 核心理念

> 纸质书的逻辑：所有人看同一本书，从头到尾。
> 
> 这个 Web App 的逻辑：**文字负责理性，感官负责灵魂。两条轨道同时运行，互不干扰，但共同指向同一个结论。**
> 
> 读者读到"墙那边是永恒"时——
> 如果他在白纸黑字中读到，他会说"嗯，逻辑上是这样"。
> 如果他在深空星海+下沉星辰+渐暗星云+Escape缓缓响起的环境中读到——
> 他会说"嗯，逻辑上是这样"，同时他的胸口会有一种说不清的东西在动。
> 
> **那个"说不清的东西"，就是灵魂在回应。**
> 
> 而文字从头到尾没有煽情一个字。

---

## 未来可扩展

| 维度 | 想法 | 难度 |
|------|------|------|
| 视差滚动 | 星空/星云以不同速度响应scroll | 低 |
| 星云呼吸 | opacity微幅脉动 | 低 |
| 音频可视化 | 音乐频率驱动星云亮度 | 中 |
| 粒子爆发 | "33条全部命中"时星星短暂加速 | 中 |
| 行星特写 | 特定段落一颗行星缓缓划过 | 中 |
| 低频环境音 | 太空嗡鸣叠加在音乐下 | 中 |
| 镜片选择器 | 首页选镜片，影响全书呈现方式 | 中 |
| 对话式入口 | "你最大的疑问是什么？"→跳转 | 中 |
| 独立分享 | 每个Q&A可独立链接分享 | 低 |
| 进度条 | 顶部极简路线图 | 低 |
