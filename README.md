# Journal Agent - 量化日记系统

一个本地优先 (Local-First) 的个人量化日记系统。通过 Streamlit 界面进行每日任务管理、时间颗粒度记录和日记反思，数据结构化存储并生成人类可读的 Markdown 归档。

## 功能特性

- **日记** — 量化数据记录（心情、睡眠、番茄钟等）+ 任务看板 + 30 分钟时间流 + 结构化反思
- **周记** — 习惯追踪 + 周任务管理 + 周反思，自动聚合日记数据
- **月记** — 月任务管理 + 月反思 + 数据统计，自动聚合日记数据
- **月历导航** — 侧边栏月历网格，快速切换日期
- **数据双存** — CSV 存原始数据，Markdown 生成可读归档

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/<your-username>/journal_agnet.git
cd journal_agnet
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置数据目录（可选）

默认数据存储在项目根目录下的 `journal_data/`。如需自定义，设置环境变量：

```bash
# Linux / macOS
export JOURNAL_BASE_DIR="/path/to/your/data"

# Windows PowerShell
$env:JOURNAL_BASE_DIR = "D:\your\data\path"
```

### 4. 启动

```bash
streamlit run diary.py
```

## 项目结构

```
journal_agnet/
├── diary.py                    # 日记主页面
├── pages/
│   ├── 1_周记.py               # 周记页面
│   └── 2_月记.py               # 月记页面
├── core/                       # 业务模块
│   ├── config.py               # 路径配置
│   ├── data_manager.py         # 日记数据处理
│   ├── texts.py                # UI 文案与定义
│   ├── template.py             # 日程模板
│   ├── md_template.py          # 日记 Markdown 模板
│   ├── weekly_*.py             # 周记相关模块
│   └── monthly_*.py            # 月记相关模块
├── assets/styles.css           # 自定义样式
├── tests/                      # 单元测试（72 个）
└── docs/                       # 项目文档
```

## 技术栈

- **语言**：Python 3.x
- **Web 框架**：Streamlit
- **数据处理**：Pandas
- **数据存储**：CSV + Markdown
- **测试**：pytest

## 运行测试

```bash
python -m pytest tests/ -v
```

## License

MIT

---

# Journal Agent - Quantified Journaling System

A local-first personal quantified journaling system. Manage daily tasks, track time in 30-minute blocks, and write structured reflections through a Streamlit web interface. All data is stored locally as CSV (raw data) and Markdown (human-readable archives).

## Features

- **Daily Journal** — Quantified metrics (mood, sleep, pomodoros, etc.) + task board + 30-min time blocks + structured reflection
- **Weekly Review** — Habit tracking + weekly tasks + weekly reflection, auto-aggregated from daily data
- **Monthly Review** — Monthly tasks + monthly reflection + statistics, auto-aggregated from daily data
- **Calendar Navigation** — Sidebar calendar grid for quick date switching
- **Dual Storage** — CSV for raw data, Markdown for readable archives

## Quick Start

### 1. Clone

```bash
git clone https://github.com/<your-username>/journal_agnet.git
cd journal_agnet
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure data directory (optional)

By default, data is stored in `journal_data/` under the project root. To customize, set an environment variable:

```bash
# Linux / macOS
export JOURNAL_BASE_DIR="/path/to/your/data"

# Windows PowerShell
$env:JOURNAL_BASE_DIR = "D:\your\data\path"
```

### 4. Run

```bash
streamlit run diary.py
```

## Project Structure

```
journal_agnet/
├── diary.py                    # Main journal page
├── pages/
│   ├── 1_周记.py               # Weekly review page
│   └── 2_月记.py               # Monthly review page
├── core/                       # Business logic modules
│   ├── config.py               # Path configuration
│   ├── data_manager.py         # Journal data processing
│   ├── texts.py                # UI texts & definitions
│   ├── template.py             # Schedule template
│   ├── md_template.py          # Journal Markdown template
│   ├── weekly_*.py             # Weekly review modules
│   └── monthly_*.py            # Monthly review modules
├── assets/styles.css           # Custom styles
├── tests/                      # Unit tests (72 tests)
└── docs/                       # Documentation
```

## Tech Stack

- **Language**: Python 3.x
- **Web Framework**: Streamlit
- **Data Processing**: Pandas
- **Data Storage**: CSV + Markdown
- **Testing**: pytest

## Running Tests

```bash
python -m pytest tests/ -v
```

## License

MIT
