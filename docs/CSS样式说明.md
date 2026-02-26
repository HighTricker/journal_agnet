# CSS 样式属性完全参考手册

> 适用于 Streamlit 网页应用的CSS样式设置指南
> 
> 最后更新：2026年2月11日

---

## 📑 目录

- [字体相关属性](#字体相关属性)
- [颜色与背景](#颜色与背景)
- [间距与布局](#间距与布局)
- [边框与圆角](#边框与圆角)
- [阴影与特效](#阴影与特效)
- [文本样式](#文本样式)
- [尺寸控制](#尺寸控制)
- [定位与显示](#定位与显示)
- [动画与过渡](#动画与过渡)
- [颜色代码大全](#颜色代码大全)
- [实用组合技巧](#实用组合技巧)

---

## 字体相关属性

### font-family（字体类型）

**作用：** 决定文字使用什么字体

**语法：** `font-family: 字体名称, 备用字体, 字体族;`

**常用值：**

| 值 | 说明 | 适用场景 |
|---|------|----------|
| `'Arial'` | 无衬线字体，简洁现代 | 正文、界面文字 |
| `'Times New Roman'` | 衬线字体，经典优雅 | 标题、正式文档 |
| `'Georgia'` | 衬线字体，易读性高 | 长文本、博客 |
| `'Courier New'` | 等宽字体，代码风格 | 代码、技术文档 |
| `'Microsoft YaHei'`, `'微软雅黑'` | 中文无衬线字体 | 中文界面 |
| `'SimSun'`, `'宋体'` | 中文衬线字体 | 正式中文文档 |
| `'KaiTi'`, `'楷体'` | 中文手写体 | 标题、艺术文字 |
| `serif` | 衬线字体族（后备） | 通用后备 |
| `sans-serif` | 无衬线字体族（后备） | 通用后备 |
| `monospace` | 等宽字体族（后备） | 代码后备 |

**示例：**
```css
/* 优先使用微软雅黑，找不到就用Arial，最后用无衬线字体 */
font-family: 'Microsoft YaHei', Arial, sans-serif;

/* 代码字体组合 */
font-family: 'Courier New', 'Consolas', monospace;
```

---

### font-size（字体大小）

**作用：** 控制文字的大小

**单位说明：**

| 单位 | 说明 | 示例 | 适用场景 |
|------|------|------|----------|
| `px` | 像素，绝对单位 | `16px`, `24px` | 精确控制 |
| `em` | 相对父元素字体大小 | `1.5em`, `2em` | 响应式设计 |
| `rem` | 相对根元素字体大小 | `1rem`, `1.5rem` | 响应式设计 |
| `%` | 百分比，相对父元素 | `120%`, `150%` | 相对缩放 |
| `pt` | 点，用于打印 | `12pt`, `14pt` | 打印文档 |

**常用尺寸参考：**

| 用途 | 推荐大小 | 说明 |
|------|----------|------|
| 小字/注释 | `12px - 14px` | 辅助信息 |
| 正文 | `15px - 18px` | 主要内容 |
| 子标题 | `20px - 24px` | 次级标题 |
| 章节标题 | `26px - 32px` | 主要章节 |
| 主标题 | `36px - 48px` | 页面标题 |
| 超大标题 | `50px+` | 首屏标题 |

**示例：**
```css
/* 绝对大小 */
font-size: 16px;

/* 相对大小（1.5倍父元素） */
font-size: 1.5em;

/* 百分比 */
font-size: 120%;
```

---

### font-weight（字体粗细）

**作用：** 控制文字的粗细程度

**数值范围：** 100 - 900（100的倍数）

| 值 | 关键词 | 外观 | 适用场景 |
|----|--------|------|----------|
| `100` | Thin | 极细 | 大标题装饰 |
| `200` | Extra Light | 超细 | 轻盈感标题 |
| `300` | Light | 细体 | 副标题 |
| `400` | Normal / Regular | **正常** | **正文默认** |
| `500` | Medium | 中等 | 强调文字 |
| `600` | Semi Bold | 半粗 | 子标题 |
| `700` | Bold | **粗体** | **重要标题** |
| `800` | Extra Bold | 超粗 | 强烈强调 |
| `900` | Black | 最粗 | 醒目标题 |

**关键词：**
- `normal` = `400`
- `bold` = `700`
- `lighter` 比父元素细一级
- `bolder` 比父元素粗一级

**示例：**
```css
/* 正常粗细 */
font-weight: 400;
font-weight: normal;

/* 粗体 */
font-weight: 700;
font-weight: bold;

/* 半粗（常用于标题） */
font-weight: 600;
```

---

### font-style（字体样式）

**作用：** 控制文字的倾斜样式

| 值 | 说明 | 示例 |
|---|------|------|
| `normal` | 正常（默认） | 普通文字 |
| `italic` | 斜体（使用字体的斜体版本） | *斜体文字* |
| `oblique` | 倾斜（强制倾斜正常字体） | 倾斜文字 |

**示例：**
```css
/* 斜体 */
font-style: italic;

/* 取消斜体 */
font-style: normal;
```

---

### letter-spacing（字母间距）

**作用：** 控制字符之间的间距

**常用值：**

| 值 | 效果 | 适用场景 |
|---|------|----------|
| `normal` | 正常间距 | 默认 |
| `1px` | 稍微宽松 | 提高可读性 |
| `2px - 3px` | 宽松 | 标题、标语 |
| `5px+` | 很宽松 | 艺术字、logo |
| `-1px` | 紧凑 | 节省空间 |

**示例：**
```css
/* 标题字母间距 */
letter-spacing: 3px;

/* 正常间距 */
letter-spacing: normal;

/* 紧凑间距 */
letter-spacing: -0.5px;
```

---

## 颜色与背景

### color（文字颜色）

**作用：** 设置文字的颜色

**颜色表示方法：**

| 方法 | 格式 | 示例 | 说明 |
|------|------|------|------|
| 颜色名 | 英文单词 | `red`, `blue`, `white` | 简单直观，选择有限 |
| 十六进制 | `#RRGGBB` | `#ff0000`, `#3498db` | 最常用，精确 |
| 简写十六进制 | `#RGB` | `#f00` (等于 `#ff0000`) | 简洁写法 |
| RGB | `rgb(R, G, B)` | `rgb(255, 0, 0)` | 0-255数值 |
| RGBA | `rgba(R, G, B, A)` | `rgba(255, 0, 0, 0.5)` | 带透明度(0-1) |
| HSL | `hsl(H, S%, L%)` | `hsl(0, 100%, 50%)` | 色相/饱和度/亮度 |
| HSLA | `hsla(H, S%, L%, A)` | `hsla(0, 100%, 50%, 0.5)` | HSL+透明度 |

**示例：**
```css
/* 十六进制（最常用） */
color: #3498db;

/* RGB */
color: rgb(52, 152, 219);

/* RGBA（半透明红色） */
color: rgba(255, 0, 0, 0.5);

/* 颜色名 */
color: white;
```

---

### background-color（背景颜色）

**作用：** 设置元素的背景颜色

**用法：** 与 `color` 相同，支持所有颜色格式

**示例：**
```css
/* 纯色背景 */
background-color: #f8f9fa;

/* 半透明背景 */
background-color: rgba(255, 255, 255, 0.8);

/* 白色背景 */
background-color: white;
```

---

### background（背景综合属性）

**作用：** 设置背景的所有属性（颜色、图片、渐变等）

**渐变类型：**

#### 1. 线性渐变（linear-gradient）

```css
/* 从上到下 */
background: linear-gradient(to bottom, #667eea, #764ba2);

/* 从左到右 */
background: linear-gradient(to right, #ff0000, #00ff00);

/* 45度角 */
background: linear-gradient(45deg, #667eea, #764ba2);

/* 特定角度 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 多个颜色 */
background: linear-gradient(to right, #ff0000, #ffff00, #00ff00);
```

#### 2. 径向渐变（radial-gradient）

```css
/* 圆形渐变 */
background: radial-gradient(circle, #667eea, #764ba2);

/* 椭圆渐变 */
background: radial-gradient(ellipse, #667eea, #764ba2);

/* 指定位置和大小 */
background: radial-gradient(circle at center, #667eea 0%, #764ba2 100%);
```

#### 3. 背景图片

```css
/* 使用图片 */
background: url('image.jpg');

/* 图片 + 颜色 */
background: url('image.jpg') #f8f9fa;

/* 图片不重复 */
background: url('image.jpg') no-repeat center center;

/* 图片覆盖整个区域 */
background: url('image.jpg') no-repeat center center / cover;
```

**示例：**
```css
/* 渐变背景（紫色到深紫色） */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 多色渐变 */
background: linear-gradient(to right, #ff6b6b, #4ecdc4, #45b7d1);

/* 半透明渐变 */
background: linear-gradient(
    to bottom, 
    rgba(255,255,255,0.9), 
    rgba(255,255,255,0.5)
);
```

---

### opacity（透明度）

**作用：** 设置整个元素的透明度（包括内容和背景）

**值范围：** 0 - 1

| 值 | 效果 |
|---|------|
| `0` | 完全透明（不可见） |
| `0.5` | 半透明 |
| `1` | 完全不透明（默认） |

**示例：**
```css
/* 半透明 */
opacity: 0.5;

/* 几乎透明 */
opacity: 0.1;

/* 完全不透明 */
opacity: 1;
```

**注意：** `opacity` 会影响整个元素（包括文字），如果只想让背景透明，使用 `rgba()`

---

## 间距与布局

### margin（外边距）

**作用：** 控制元素**外部**的空白距离（元素与其他元素之间的距离）

**语法格式：**

```css
/* 四个方向相同 */
margin: 20px;

/* 上下 | 左右 */
margin: 20px 10px;

/* 上 | 左右 | 下 */
margin: 10px 20px 30px;

/* 上 | 右 | 下 | 左（顺时针） */
margin: 10px 20px 30px 40px;

/* 单独设置某一边 */
margin-top: 20px;
margin-right: 15px;
margin-bottom: 30px;
margin-left: 10px;
```

**特殊值：**

| 值 | 效果 |
|---|------|
| `0` | 无外边距 |
| `auto` | 自动计算（常用于水平居中） |
| `负值` | 负边距，可让元素重叠 |

**常用场景：**
```css
/* 水平居中 */
margin: 0 auto;

/* 顶部间距 */
margin-top: 30px;

/* 上下间距，左右0 */
margin: 20px 0;

/* 负边距（向上移动） */
margin-top: -10px;
```

---

### padding（内边距）

**作用：** 控制元素**内部**的空白距离（内容与边框之间的距离）

**语法：** 与 `margin` 完全相同

```css
/* 四个方向相同 */
padding: 20px;

/* 上下 | 左右 */
padding: 15px 20px;

/* 上 | 右 | 下 | 左 */
padding: 10px 15px 20px 25px;

/* 单独设置 */
padding-top: 20px;
padding-right: 15px;
padding-bottom: 30px;
padding-left: 10px;
```

**margin vs padding 区别图解：**

```
┌─────────────── margin ───────────────┐
│                                       │
│  ┌─────────── border ──────────────┐ │
│  │                                  │ │
│  │  ┌──── padding ────┐            │ │
│  │  │                 │            │ │
│  │  │    内容区域     │            │ │
│  │  │                 │            │ │
│  │  └─────────────────┘            │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                       │
└───────────────────────────────────────┘
```

**示例：**
```css
/* 内边距让内容不贴边 */
padding: 20px;

/* 上下内边距大，左右内边距小 */
padding: 30px 15px;

/* 只设置左内边距 */
padding-left: 25px;
```

---

### width & height（宽度和高度）

**作用：** 设置元素的宽度和高度

**单位：**

| 单位 | 说明 | 示例 |
|------|------|------|
| `px` | 像素（绝对单位） | `200px`, `500px` |
| `%` | 百分比（相对父元素） | `50%`, `100%` |
| `em` | 相对字体大小 | `10em` |
| `rem` | 相对根字体大小 | `20rem` |
| `vw` | 视口宽度的百分比 | `50vw`（屏幕宽度的50%） |
| `vh` | 视口高度的百分比 | `100vh`（全屏高度） |
| `auto` | 自动计算 | `auto` |

**特殊值：**

| 属性 | 说明 |
|------|------|
| `max-width` | 最大宽度 |
| `min-width` | 最小宽度 |
| `max-height` | 最大高度 |
| `min-height` | 最小高度 |

**示例：**
```css
/* 固定宽度 */
width: 500px;

/* 占满父元素 */
width: 100%;

/* 最大宽度800px */
max-width: 800px;

/* 最小高度200px */
min-height: 200px;

/* 宽度为视口的50% */
width: 50vw;

/* 高度为全屏 */
height: 100vh;
```

---

## 边框与圆角

### border（边框）

**作用：** 设置元素的边框

**完整语法：** `border: 宽度 样式 颜色;`

**边框样式：**

| 样式 | 外观 | 说明 |
|------|------|------|
| `solid` | ──── | 实线（最常用） |
| `dashed` | ─ ─ ─ | 虚线 |
| `dotted` | ····· | 点线 |
| `double` | ════ | 双线 |
| `groove` | 凹槽 | 3D凹陷效果 |
| `ridge` | 脊线 | 3D凸起效果 |
| `inset` | 内凹 | 3D内嵌效果 |
| `outset` | 外凸 | 3D外凸效果 |
| `none` | 无 | 无边框 |

**单独设置某一边：**
```css
border-top: 2px solid #000;
border-right: 1px dashed #ccc;
border-bottom: 3px double #333;
border-left: 5px solid #3498db;
```

**示例：**
```css
/* 完整边框 */
border: 2px solid #3498db;

/* 虚线边框 */
border: 1px dashed #999;

/* 双线边框 */
border: 3px double #000;

/* 只设置左边框 */
border-left: 5px solid #e74c3c;

/* 上下边框 */
border-top: 1px solid #ddd;
border-bottom: 1px solid #ddd;

/* 无边框 */
border: none;
```

---

### border-radius（圆角）

**作用：** 设置边框的圆角程度

**语法：**
```css
/* 四个角相同 */
border-radius: 10px;

/* 左上右上 | 右下左下 */
border-radius: 10px 20px;

/* 左上 | 右上右下 | 左下 */
border-radius: 10px 20px 30px;

/* 左上 | 右上 | 右下 | 左下 */
border-radius: 10px 20px 30px 40px;

/* 单独设置某个角 */
border-top-left-radius: 10px;
border-top-right-radius: 20px;
border-bottom-right-radius: 30px;
border-bottom-left-radius: 40px;
```

**常用值：**

| 值 | 效果 | 适用场景 |
|---|------|----------|
| `0` | 直角（默认） | 正式、严肃 |
| `3px - 5px` | 微圆角 | 按钮、卡片 |
| `8px - 12px` | 圆角 | 面板、对话框 |
| `15px - 25px` | 大圆角 | 标签、徽章 |
| `50%` | 圆形/椭圆 | 头像、图标 |
| `999px` | 完全圆角 | 药丸形按钮 |

**示例：**
```css
/* 标准圆角 */
border-radius: 10px;

/* 圆形（配合相同宽高） */
width: 50px;
height: 50px;
border-radius: 50%;

/* 药丸形状 */
border-radius: 999px;

/* 只圆角左上和右上 */
border-radius: 15px 15px 0 0;
```

---

## 阴影与特效

### box-shadow（盒子阴影）

**作用：** 为元素添加阴影效果

**完整语法：** `box-shadow: 水平偏移 垂直偏移 模糊半径 扩散半径 颜色 内/外阴影;`

**参数说明：**

| 参数 | 说明 | 示例 |
|------|------|------|
| 水平偏移 | 正值向右，负值向左 | `5px`, `-5px` |
| 垂直偏移 | 正值向下，负值向上 | `5px`, `-5px` |
| 模糊半径 | 值越大越模糊 | `10px` |
| 扩散半径（可选） | 阴影大小 | `5px` |
| 颜色 | 阴影颜色 | `#000`, `rgba(0,0,0,0.5)` |
| inset（可选） | 内阴影 | `inset` |

**常用阴影效果：**

```css
/* 基础阴影 */
box-shadow: 0 2px 4px rgba(0,0,0,0.1);

/* 悬浮效果（较深） */
box-shadow: 0 4px 8px rgba(0,0,0,0.15);

/* 强烈阴影 */
box-shadow: 0 10px 30px rgba(0,0,0,0.3);

/* 内阴影 */
box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);

/* 多个阴影（用逗号分隔） */
box-shadow: 
    0 2px 4px rgba(0,0,0,0.1),
    0 8px 16px rgba(0,0,0,0.1);

/* 彩色阴影 */
box-shadow: 0 4px 20px rgba(255,0,0,0.3);

/* 向上的阴影 */
box-shadow: 0 -4px 8px rgba(0,0,0,0.1);

/* 无阴影 */
box-shadow: none;
```

**阴影强度对比：**

| 用途 | 阴影值 |
|------|--------|
| 微妙阴影 | `0 1px 3px rgba(0,0,0,0.05)` |
| 卡片阴影 | `0 2px 8px rgba(0,0,0,0.1)` |
| 悬浮效果 | `0 4px 12px rgba(0,0,0,0.15)` |
| 弹窗阴影 | `0 10px 40px rgba(0,0,0,0.2)` |
| 强烈阴影 | `0 20px 60px rgba(0,0,0,0.3)` |

---

### text-shadow（文字阴影）

**作用：** 为文字添加阴影

**语法：** `text-shadow: 水平偏移 垂直偏移 模糊半径 颜色;`

**示例：**
```css
/* 基础文字阴影 */
text-shadow: 2px 2px 4px rgba(0,0,0,0.3);

/* 发光效果 */
text-shadow: 0 0 10px #fff;

/* 立体效果 */
text-shadow: 
    1px 1px 0 #ccc,
    2px 2px 0 #aaa,
    3px 3px 0 #888;

/* 霓虹效果 */
text-shadow: 
    0 0 5px #fff,
    0 0 10px #fff,
    0 0 20px #ff00de,
    0 0 30px #ff00de;
```

---

## 文本样式

### text-align（文本对齐）

**作用：** 设置文本的水平对齐方式

| 值 | 效果 |
|---|------|
| `left` | 左对齐（默认） |
| `right` | 右对齐 |
| `center` | 居中对齐 |
| `justify` | 两端对齐 |

**示例：**
```css
/* 居中对齐 */
text-align: center;

/* 右对齐 */
text-align: right;

/* 两端对齐（适合段落） */
text-align: justify;
```

---

### line-height（行高）

**作用：** 设置行与行之间的高度（行间距）

**值类型：**

| 类型 | 示例 | 说明 |
|------|------|------|
| 数字（倍数） | `1.5`, `2.0` | 字体大小的倍数（推荐） |
| 像素 | `24px`, `30px` | 固定高度 |
| 百分比 | `150%`, `200%` | 相对百分比 |

**推荐值：**

| 场景 | 行高 | 说明 |
|------|------|------|
| 紧凑文本 | `1.2 - 1.4` | 标题 |
| 正常文本 | `1.5 - 1.6` | 正文默认 |
| 宽松文本 | `1.8 - 2.0` | 提高可读性 |
| 超宽松 | `2.5+` | 诗歌、引用 |

**示例：**
```css
/* 1.5倍行高（推荐） */
line-height: 1.5;

/* 2倍行高 */
line-height: 2.0;

/* 固定行高 */
line-height: 30px;

/* 百分比 */
line-height: 180%;
```

---

### text-decoration（文本装饰）

**作用：** 添加文本装饰线

**值：**

| 值 | 效果 |
|---|------|
| `none` | 无装饰（默认） |
| `underline` | 下划线 |
| `overline` | 上划线 |
| `line-through` | 删除线 |

**组合属性：**
```css
/* 完整语法 */
text-decoration: 线条位置 线条样式 线条颜色 线条粗细;

/* 示例 */
text-decoration: underline solid red 2px;
text-decoration: line-through wavy blue;
```

**示例：**
```css
/* 下划线 */
text-decoration: underline;

/* 删除线 */
text-decoration: line-through;

/* 去除下划线（常用于链接） */
text-decoration: none;

/* 红色波浪下划线 */
text-decoration: underline wavy red;
```

---

### text-transform（文本转换）

**作用：** 控制文本的大小写

| 值 | 效果 |
|---|------|
| `none` | 正常（默认） |
| `uppercase` | 全部大写 |
| `lowercase` | 全部小写 |
| `capitalize` | 首字母大写 |

**示例：**
```css
/* 全部大写 */
text-transform: uppercase;

/* 首字母大写 */
text-transform: capitalize;

/* 全部小写 */
text-transform: lowercase;
```

---

### text-indent（首行缩进）

**作用：** 设置段落首行缩进

**示例：**
```css
/* 缩进2个字符（中文常用） */
text-indent: 2em;

/* 像素缩进 */
text-indent: 30px;

/* 负缩进（悬挂缩进） */
text-indent: -20px;
```

---

### word-spacing（单词间距）

**作用：** 设置单词之间的间距（对中文是字间距）

**示例：**
```css
/* 增加单词间距 */
word-spacing: 5px;

/* 正常间距 */
word-spacing: normal;
```

---

## 定位与显示

### display（显示类型）

**作用：** 控制元素的显示方式

**常用值：**

| 值 | 说明 | 特点 |
|---|------|------|
| `block` | 块级元素 | 独占一行，可设置宽高 |
| `inline` | 行内元素 | 不换行，不能设置宽高 |
| `inline-block` | 行内块元素 | 不换行，可设置宽高 |
| `none` | 隐藏 | 元素不显示，不占空间 |
| `flex` | 弹性布局 | 现代布局方式 |
| `grid` | 网格布局 | 二维布局 |

**示例：**
```css
/* 块级显示 */
display: block;

/* 行内块 */
display: inline-block;

/* 隐藏元素 */
display: none;

/* 弹性布局 */
display: flex;
```

---

### position（定位）

**作用：** 设置元素的定位方式

| 值 | 说明 |
|---|------|
| `static` | 默认定位（正常文档流） |
| `relative` | 相对定位（相对自身原位置） |
| `absolute` | 绝对定位（相对最近的定位父元素） |
| `fixed` | 固定定位（相对浏览器窗口） |
| `sticky` | 粘性定位（滚动到特定位置时固定） |

**配合使用的属性：**
- `top`: 距离顶部的距离
- `right`: 距离右边的距离
- `bottom`: 距离底部的距离
- `left`: 距离左边的距离
- `z-index`: 层叠顺序（值越大越在上层）

**示例：**
```css
/* 相对定位 */
position: relative;
top: 10px;
left: 20px;

/* 绝对定位 */
position: absolute;
top: 0;
right: 0;

/* 固定定位（固定在页面顶部） */
position: fixed;
top: 0;
left: 0;
width: 100%;

/* 居中定位 */
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
```

---

### overflow（溢出处理）

**作用：** 控制内容溢出时的处理方式

| 值 | 效果 |
|---|------|
| `visible` | 溢出可见（默认） |
| `hidden` | 溢出隐藏 |
| `scroll` | 始终显示滚动条 |
| `auto` | 需要时显示滚动条 |

**单独控制：**
- `overflow-x`: 水平方向
- `overflow-y`: 垂直方向

**示例：**
```css
/* 溢出隐藏 */
overflow: hidden;

/* 自动滚动 */
overflow: auto;

/* 只垂直滚动 */
overflow-y: auto;
overflow-x: hidden;
```

---

## 动画与过渡

### transition（过渡）

**作用：** 让CSS属性变化时产生平滑过渡效果

**语法：** `transition: 属性 持续时间 缓动函数 延迟;`

**缓动函数：**

| 函数 | 效果 |
|------|------|
| `ease` | 慢-快-慢（默认） |
| `linear` | 匀速 |
| `ease-in` | 慢-快 |
| `ease-out` | 快-慢 |
| `ease-in-out` | 慢-快-慢 |
| `cubic-bezier()` | 自定义贝塞尔曲线 |

**示例：**
```css
/* 所有属性过渡 */
transition: all 0.3s ease;

/* 指定属性过渡 */
transition: background-color 0.5s ease;

/* 多个属性 */
transition: 
    color 0.3s ease,
    background-color 0.3s ease,
    transform 0.2s ease;

/* 延迟过渡 */
transition: all 0.3s ease 0.1s;
```

**常见应用：**
```css
/* 悬停变色 */
.button {
    background-color: #3498db;
    transition: background-color 0.3s ease;
}
.button:hover {
    background-color: #2980b9;
}

/* 平滑阴影 */
.card {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: box-shadow 0.3s ease;
}
.card:hover {
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}
```

---

### transform（变换）

**作用：** 对元素进行2D/3D变换

**常用变换：**

| 函数 | 说明 | 示例 |
|------|------|------|
| `translate(x, y)` | 平移 | `translate(50px, 100px)` |
| `translateX(x)` | 水平平移 | `translateX(50px)` |
| `translateY(y)` | 垂直平移 | `translateY(100px)` |
| `rotate(角度)` | 旋转 | `rotate(45deg)` |
| `scale(倍数)` | 缩放 | `scale(1.5)` |
| `scaleX(倍数)` | 水平缩放 | `scaleX(2)` |
| `scaleY(倍数)` | 垂直缩放 | `scaleY(0.5)` |
| `skew(角度)` | 倾斜 | `skew(10deg)` |

**示例：**
```css
/* 平移 */
transform: translate(50px, 100px);

/* 旋转45度 */
transform: rotate(45deg);

/* 放大1.5倍 */
transform: scale(1.5);

/* 组合变换 */
transform: translate(50px, 0) rotate(45deg) scale(1.2);

/* 居中定位常用 */
transform: translate(-50%, -50%);
```

---

### cursor（鼠标指针）

**作用：** 改变鼠标悬停时的光标样式

**常用值：**

| 值 | 效果 | 适用场景 |
|---|------|----------|
| `default` | 默认箭头 | 普通元素 |
| `pointer` | 手指（点击） | 按钮、链接 |
| `text` | 文本选择 | 文本区域 |
| `move` | 移动 | 可拖动元素 |
| `not-allowed` | 禁止 | 禁用元素 |
| `wait` | 等待（沙漏） | 加载中 |
| `help` | 帮助（问号） | 提示信息 |
| `grab` | 抓取（手掌） | 可抓取 |
| `grabbing` | 抓取中 | 拖动中 |

**示例：**
```css
/* 鼠标变成手指 */
cursor: pointer;

/* 禁止点击 */
cursor: not-allowed;

/* 可拖动 */
cursor: grab;
```

---

## 颜色代码大全

### 基础色系

#### 红色系
```css
#ff0000  /* 纯红 */
#ff6b6b  /* 浅红 */
#e74c3c  /* 番茄红 */
#c0392b  /* 深红 */
#d63031  /* 砖红 */
#eb3b5a  /* 玫瑰红 */
#fa8072  /* 鲑鱼红 */
#ff4757  /* 亮红 */
```

#### 橙色系
```css
#ff9800  /* 标准橙 */
#ffa500  /* 纯橙 */
#ff6348  /* 珊瑚橙 */
#ff7675  /* 桃橙 */
#fdcb6e  /* 浅橙 */
#f39c12  /* 南瓜橙 */
#e67e22  /* 胡萝卜橙 */
#d35400  /* 深橙 */
```

#### 黄色系
```css
#ffff00  /* 纯黄 */
#ffd700  /* 金黄 */
#ffeaa7  /* 浅黄 */
#fdcb6e  /* 奶黄 */
#f1c40f  /* 向日葵黄 */
#f39c12  /* 橙黄 */
#fff3cd  /* 米黄 */
#fffbea  /* 乳黄 */
```

#### 绿色系
```css
#00ff00  /* 纯绿 */
#00d2d3  /* 青绿 */
#00b894  /* 薄荷绿 */
#27ae60  /* 翡翠绿 */
#2ecc71  /* 草绿 */
#20bf6b  /* 森林绿 */
#16a085  /* 海绿 */
#4cd137  /* 霓虹绿 */
```

#### 蓝色系
```css
#0000ff  /* 纯蓝 */
#3498db  /* 天蓝 */
#2980b9  /* 深天蓝 */
#0984e3  /* 湖蓝 */
#74b9ff  /* 浅蓝 */
#4834df  /* 靛蓝 */
#667eea  /* 薰衣草蓝 */
#5f27cd  /* 紫蓝 */
```

#### 紫色系
```css
#800080  /* 紫色 */
#9b59b6  /* 紫罗兰 */
#8e44ad  /* 深紫 */
#6c5ce7  /* 亮紫 */
#a29bfe  /* 淡紫 */
#764ba2  /* 梅紫 */
#5f27cd  /* 蓝紫 */
#c44569  /* 紫红 */
```

#### 灰色系
```css
#000000  /* 纯黑 */
#1a1a1a  /* 深黑 */
#2c3e50  /* 深蓝灰 */
#34495e  /* 湿柏油 */
#555555  /* 深灰 */
#7f8c8d  /* 灰石 */
#95a5a6  /* 混凝土 */
#bdc3c7  /* 银灰 */
#dfe6e9  /* 浅灰 */
#ecf0f1  /* 云白 */
#f5f6fa  /* 雪白 */
#ffffff  /* 纯白 */
```

---

### 常用配色方案

#### 专业商务风
```css
主色: #2c3e50   /* 深蓝灰 */
辅色: #3498db   /* 天蓝 */
强调: #e74c3c   /* 红色 */
背景: #ecf0f1   /* 浅灰 */
文字: #2c3e50   /* 深灰 */
```

#### 清新自然风
```css
主色: #27ae60   /* 绿色 */
辅色: #16a085   /* 海绿 */
强调: #f39c12   /* 橙色 */
背景: #ecf0f1   /* 浅灰 */
文字: #2c3e50   /* 深灰 */
```

#### 温暖活力风
```css
主色: #e67e22   /* 橙色 */
辅色: #f39c12   /* 黄橙 */
强调: #e74c3c   /* 红色 */
背景: #fff3e0   /* 浅橙背景 */
文字: #2c3e50   /* 深灰 */
```

#### 优雅紫色风
```css
主色: #9b59b6   /* 紫色 */
辅色: #8e44ad   /* 深紫 */
强调: #3498db   /* 蓝色 */
背景: #f5f6fa   /* 淡紫背景 */
文字: #2c3e50   /* 深灰 */
```

#### 科技蓝色风
```css
主色: #3498db   /* 蓝色 */
辅色: #2980b9   /* 深蓝 */
强调: #1abc9c   /* 青色 */
背景: #ecf0f1   /* 浅灰 */
文字: #2c3e50   /* 深灰 */
```

---

### 渐变色方案

```css
/* 日落渐变 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 海洋渐变 */
background: linear-gradient(to right, #00d2ff, #3a7bd5);

/* 森林渐变 */
background: linear-gradient(135deg, #0cebeb, #20e3b2, #29ffc6);

/* 火焰渐变 */
background: linear-gradient(to right, #f83600, #f9d423);

/* 薄荷渐变 */
background: linear-gradient(135deg, #2afadf, #4c83ff);

/* 樱花渐变 */
background: linear-gradient(to right, #ff9a9e, #fecfef, #fecfef);

/* 黄昏渐变 */
background: linear-gradient(to right, #fa709a, #fee140);

/* 极光渐变 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
```

---

## 实用组合技巧

### 完美居中

```css
/* 方法1: Flexbox居中（推荐） */
.container {
    display: flex;
    justify-content: center;  /* 水平居中 */
    align-items: center;      /* 垂直居中 */
}

/* 方法2: 绝对定位居中 */
.element {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/* 方法3: 文本居中 */
.text {
    text-align: center;       /* 水平居中 */
    line-height: 100px;       /* 垂直居中（高度要固定） */
}

/* 方法4: Margin自动居中（仅水平） */
.block {
    margin: 0 auto;
    width: 800px;
}
```

---

### 卡片样式

```css
.card {
    /* 基础样式 */
    background-color: white;
    padding: 20px;
    
    /* 圆角 */
    border-radius: 12px;
    
    /* 阴影 */
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    
    /* 过渡效果 */
    transition: all 0.3s ease;
}

/* 悬停效果 */
.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}
```

---

### 按钮样式

```css
.button {
    /* 基础 */
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    
    /* 颜色 */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    /* 边框圆角 */
    border: none;
    border-radius: 8px;
    
    /* 阴影 */
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    
    /* 交互 */
    cursor: pointer;
    transition: all 0.3s ease;
}

.button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

.button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

---

### 输入框样式

```css
.input {
    /* 尺寸 */
    width: 100%;
    padding: 12px 15px;
    
    /* 字体 */
    font-size: 16px;
    font-family: 'Arial', sans-serif;
    
    /* 边框 */
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    
    /* 过渡 */
    transition: border-color 0.3s ease;
}

.input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 10px rgba(52, 152, 219, 0.2);
}
```

---

### 标签/徽章样式

```css
.badge {
    /* 内边距 */
    padding: 4px 12px;
    
    /* 字体 */
    font-size: 12px;
    font-weight: 600;
    
    /* 颜色 */
    background-color: #3498db;
    color: white;
    
    /* 形状 */
    border-radius: 999px;
    
    /* 行内块 */
    display: inline-block;
}
```

---

### 提示框样式

```css
.alert {
    /* 布局 */
    padding: 15px 20px;
    margin: 20px 0;
    
    /* 边框 */
    border-left: 4px solid #3498db;
    border-radius: 4px;
    
    /* 背景 */
    background-color: #e3f2fd;
    
    /* 文字 */
    color: #1976d2;
    font-size: 15px;
}

/* 成功提示 */
.alert-success {
    border-left-color: #27ae60;
    background-color: #d5f4e6;
    color: #27ae60;
}

/* 警告提示 */
.alert-warning {
    border-left-color: #f39c12;
    background-color: #fff3cd;
    color: #856404;
}

/* 错误提示 */
.alert-error {
    border-left-color: #e74c3c;
    background-color: #ffe8e8;
    color: #c0392b;
}
```

---

### 加载动画

```css
.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

---

### 响应式字体

```css
/* 根据屏幕大小调整 */
@media screen and (max-width: 768px) {
    /* 小屏幕 */
    h1 { font-size: 28px; }
    p { font-size: 14px; }
}

@media screen and (min-width: 769px) and (max-width: 1024px) {
    /* 中屏幕 */
    h1 { font-size: 36px; }
    p { font-size: 16px; }
}

@media screen and (min-width: 1025px) {
    /* 大屏幕 */
    h1 { font-size: 48px; }
    p { font-size: 18px; }
}
```

---

## 快速修改指南

### 想让标题更突出？

```css
/* 增大字号 + 加粗 + 添加颜色 */
font-size: 36px;
font-weight: 700;
color: #2c3e50;

/* 添加阴影 */
text-shadow: 2px 2px 4px rgba(0,0,0,0.2);

/* 添加下划线 */
border-bottom: 3px solid #3498db;
```

---

### 想让元素更有立体感？

```css
/* 增加阴影 */
box-shadow: 0 10px 30px rgba(0,0,0,0.3);

/* 添加渐变背景 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 添加边框 */
border: 2px solid #3498db;
```

---

### 想让间距更舒适？

```css
/* 增加内边距 */
padding: 30px;

/* 增加外边距 */
margin: 40px 0;

/* 增加行高 */
line-height: 2.0;
```

---

### 想让交互更流畅？

```css
/* 添加过渡 */
transition: all 0.3s ease;

/* 悬停效果 */
.element:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

/* 点击效果 */
.element:active {
    transform: scale(0.95);
}
```

---

## 常见问题解决

### Q: 为什么我的CSS没生效？

**检查清单：**
1. ✅ 是否在 Streamlit 中使用 `unsafe_allow_html=True`
2. ✅ CSS 选择器是否正确（类名前要加`.`）
3. ✅ 是否有拼写错误
4. ✅ 是否被其他样式覆盖（检查优先级）
5. ✅ 颜色代码是否完整（`#` 不能少）

---

### Q: 如何覆盖Streamlit默认样式？

```css
/* 使用 !important 强制覆盖 */
.stButton > button {
    background-color: #3498db !important;
    color: white !important;
}
```

---

### Q: 如何让样式只对某个元素生效？

```css
/* 使用类名 */
.my-special-title {
    color: red;
}

/* 使用ID（唯一性更强） */
#unique-element {
    background-color: blue;
}
```

---

### Q: 颜色透明度怎么设置？

```css
/* 方法1: RGBA（推荐） */
color: rgba(255, 0, 0, 0.5);  /* 半透明红色 */

/* 方法2: 十六进制+透明度 */
color: #ff000080;  /* 半透明红色（80 = 50%） */

/* 方法3: 整体透明 */
opacity: 0.5;
```

---

## 总结

### 记住这些核心原则：

1. **字体三要素**: `font-family`（类型）, `font-size`（大小）, `font-weight`（粗细）
2. **间距双雄**: `margin`（外距）, `padding`（内距）
3. **颜色二重奏**: `color`（文字色）, `background-color`（背景色）
4. **美化三件套**: `border-radius`（圆角）, `box-shadow`（阴影）, `transition`（过渡）

---

**祝你设计出美观的界面！** 🎨✨
