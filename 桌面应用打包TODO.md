# 桌面应用打包：Electron 方案 ✅ 已交付

> 创建时间：2026-05-15（原 PyWebView 方案）
> 更新时间：2026-05-19（推倒重来用 Electron）
> 完成时间：2026-05-19
> 收尾时间：2026-05-21（修复打包后 .env 读取失效 + 端到端验证 + 提交 git）
> 状态：✅ 已交付并验证
> **桌面快捷方式**：`C:\Users\jiaqi\Desktop\Journal Agent.lnk`
> **发行包位置**：`E:\journal_agent\release\Journal Agent\` (591 MB)

---

## 2026-05-21 收尾修复

上次会话在打包基本完成后中途崩溃，遗留两项未完成：成品未经端到端验证、所有改动未提交 git。本次补完，并修复一个验证中发现的真实 bug。

### 🐛 修复：打包后 AI 功能整体失效（关键 bug）

**问题**：`.env`（含全部 API 密钥）原先只被 `agent/agent.py` 用相对路径 `Path(__file__).parent.parent/.env` 加载。PyInstaller 打包后该路径指向 `_internal/`，而 `.env` 不在 `.spec` 的 `datas` 里 —— 打包版后端读不到任何密钥。诊断确认 6 个 API 密钥均未配置为 Windows 环境变量，**即之前打包版的 AI 导师 / 行为报告 / 邮件实际上全部失效**（崩溃恰好打断在发现它之前）。

**修复**：
- 新增 `core/env_setup.py`：import 即加载 `.env`。开发模式读项目根；打包模式读 `%APPDATA%\journal-agent\.env`（用户可编辑、重新打包不丢失），兜底读 exe 同级目录。
- `main.py` 在导入 routers 之前 `import core.env_setup`，确保 `.env` 早于任何模块读 `os.environ`（顺带修好 `report_config.py` 的 SMTP 配置此前因加载时机过晚也读不到 `.env` 的潜在问题）。
- 密钥不再打进发行包：符合本地优先与商业化（每个用户配自己的 key），改 key 也无需重新打包。

**⚠️ 部署要求**：换机器 / 首次部署时，必须把 `.env` 放到 `%APPDATA%\journal-agent\.env`，否则 AI 功能不可用。

### ✅ 端到端验证结论

打包版 `release\Journal Agent\` 实测：

| 验证项 | 结果 |
|---|---|
| 后端启动 + 前端页面 serve | ✅ HTTP 200，前端资源正常引用 |
| `/api/chat/models` 密钥可用性 | ✅ 5/6 模型 available（Grok 未配 `XAI_API_KEY`，符合预期）|
| CSV 真实数据读取 | ✅ 读到 `D:\` 数据（2026-05 共 21 天）|
| 真实 AI 对话（Gemini 流式 SSE） | ✅ 完整流式回复 + `[DONE]` |
| pytest 回归 | ✅ 103 passed |
| 完整 Electron 应用 | ✅ 进程树 `Journal Agent.exe ×4` + `journal-backend.exe ×1`，动态端口 + 同源接口均正常 |

---

## 最终交付状态

### 进程模型（任务管理器视图）

```
Journal Agent.exe × 4    ← Electron main + Chromium renderer + GPU + utility
journal-backend.exe × 1  ← Python FastAPI sidecar（PyInstaller 打包）
———————————————————————
无 msedge / chrome / 任何浏览器进程   ← 真正"独立软件"形态
```

### 体积构成

| 部分 | 大小 |
|---|---|
| Journal Agent.exe（Electron 主二进制） | 180 MB |
| Chromium + locales + 资源 | ~150 MB |
| journal-backend.exe + Python 依赖 | ~320 MB |
| React build (在 backend 内) | ~5 MB |
| **总计** | **591 MB** |

### 启动链路

```
双击 Journal Agent.exe
    ↓
Electron 主进程 (main.js)
    ↓
[1] findFreePort() → OS 分配空闲端口（避免冲突）
[2] spawn journal-backend.exe，传入 JOURNAL_BACKEND_PORT env
[3] 轮询 http://127.0.0.1:{port}/docs 等就绪（最多 30s）
[4] BrowserWindow 加载 http://127.0.0.1:{port}/
    ↓
React 渲染 UI，所有 API 走同源相对路径 /api/...
    ↓
关窗口：app.on('before-quit') → SIGTERM backend，2s 超时 force kill
```

---

## 代码改动清单（最终落地的）

### 🆕 新增文件

| 文件 | 作用 |
|---|---|
| `backend_entry.py` | Python sidecar 入口，读 `JOURNAL_BACKEND_PORT` env 启动 uvicorn |
| `electron/main.js` | Electron 主进程：spawn backend、窗口管理、退出清理、单实例锁 |
| `package.json` | npm 配置 + 2 个 build script |

### ✏️ 修改的现有文件

| 文件 | 改动 |
|---|---|
| `main.py` | 末尾追加 StaticFiles + SPA fallback（让 backend 同时 serve 前端，前后端同源） |
| `requirements.txt` | 追加 `pyinstaller>=6.0.0` |
| `.gitignore` | 追加 `/build/`、`/dist/`、`*.spec`、`node_modules/`、`/release/` |
| `journal-frontend/src/api/client.ts` | `BASE_URL` 改成 env-aware（dev 用绝对 `http://127.0.0.1:8000/api`，prod 用相对 `/api`）+ export |
| `journal-frontend/src/hooks/useChat.ts` | import `BASE_URL`，替换硬编码 `http://127.0.0.1:8000/api/chat` |
| `journal-frontend/src/components/layout/TopAppBar.tsx` | `<Link>` → `<a>` + `window.location.href = path` 全页面跳转 |
| `journal-frontend/src/components/layout/BottomNavBar.tsx` | 同上 |

### ❌ 业务代码零改动

5 个 router、core、agent、schemas、prompts、前端所有 page 组件、所有 hook（除 useChat）、所有 component（除 TopAppBar / BottomNavBar）—— **全部不动**。

---

## 已知偏差（实际 vs 原计划）

| 项 | 原计划 | 实际落地 | 偏差原因 |
|---|---|---|---|
| 打包工具 | `electron-builder` + NSIS | 手动 PowerShell packaging | electron-builder 在 Windows 普通用户下解压 `winCodeSign` 缓存包卡符号链接权限 |
| 交付形态 | NSIS `.exe` 安装包 | 绿色版文件夹 + 桌面快捷方式 | 同上 |
| 前端路由 | React Router `<Link>` 内部 navigate | 导航触发全页面跳转 | React Router 7 + React 19 + Vite 8 prod build 下 in-page navigation 不触发 Routes 重渲染（深层兼容性 bug） |

---

## 未解决 / 后续 TODO

| 优先级 | 项 | 处理建议 |
|---|---|---|
| 中 | **周记 / 月记 / 日记的"周目标 / 月目标"在某些日期下无数据** | 业务层 bug，跟打包无关。查 `journal-frontend/src/hooks/useCrossPageGoals.ts` 和对应 weekly / monthly router |
| 低 | 导航切换有 ~1s 加载（全页面跳转代价） | 等 React Router 7 修 in-page nav bug、或试 react-router v6 降级、或试新的 `createBrowserRouter` API |
| 低 | 没有 NSIS 安装包（开始菜单 + 控制面板可卸载） | 开启 Win 开发者模式（设置→系统→开发者选项）→ 重新引入 `electron-builder.yml` → `npm install --save-dev electron-builder` → `electron-builder` |
| 中 | Windows SmartScreen 首次启动警告 | 商业化时买代码签名证书（~$200/年） |
| 低 | 跨平台（Mac / Linux） | 当前只针对 Windows。Electron 跨平台天然支持，主要是 PyInstaller 要在目标平台单独打 backend |
| 低 | 自动更新（electron-updater） | 本地软件暂不需要 |
| 低 | 托盘图标 / 全局快捷键 / 自定义菜单栏 | v2 再考虑 |
| 低 | 应用图标 | 当前用 Electron 默认图标，可用 favicon.io 生成 `.ico` 替换 |

---

## 重新打包流程（改代码后用）

```powershell
# 1. 编译前端 + 打包后端 sidecar exe
npm run build:frontend
npm run build:backend

# 2. 替换 release 里的 backend（前端 dist 已经被打入 backend，无需单独拷）
Remove-Item "release\Journal Agent\resources\journal-backend" -Recurse -Force
Copy-Item "dist\journal-backend" "release\Journal Agent\resources\journal-backend" -Recurse

# 3. 如果改了 electron/main.js，单独同步
Copy-Item "electron\main.js" "release\Journal Agent\resources\app\electron\main.js"

# 4.（可选）清 Electron 缓存避免命中旧 JS
@('Cache','Code Cache','GPUCache') | ForEach-Object {
    $p = "$env:APPDATA\journal-agent\$_"
    if (Test-Path $p) { Remove-Item $p -Recurse -Force }
}
```

### 完全从零重新 packaging

```powershell
# 当 release/ 目录损坏或要彻底重做时
Remove-Item "release" -Recurse -Force
npm run build:frontend
npm run build:backend

$release = "release\Journal Agent"
$electronDist = "node_modules\electron\dist"
New-Item -ItemType Directory -Path $release -Force | Out-Null
Copy-Item "$electronDist\*" -Destination $release -Recurse -Force
Remove-Item "$release\resources\default_app.asar" -Force
New-Item -ItemType Directory -Path "$release\resources\app" -Force | Out-Null
Copy-Item "electron" -Destination "$release\resources\app\electron" -Recurse -Force
Copy-Item "package.json" -Destination "$release\resources\app\package.json" -Force
Copy-Item "dist\journal-backend" -Destination "$release\resources\journal-backend" -Recurse -Force
Rename-Item "$release\electron.exe" "Journal Agent.exe"
```

---

## 知识沉淀：踩过的坑

按时间顺序记录，避免下次重复入坑。

### 1. PyWebView 装不上（Python 3.14 太新）

`pip install pywebview` 失败：依赖 `pythonnet`，但 pythonnet 在 Python 3.14 没预编译 wheel，源码编译需要 .NET SDK + nuget。nuget 自更新失败导致编译挂掉。

**解法**：放弃 PyWebView，改用 Electron。

### 2. Edge `--app` 不是独立软件

第一版尝试用系统 Edge 的 `--app` 模式弹无标签栏窗口，看起来像独立应用但任务管理器有 16+ 个 msedge.exe，不符合"像 Claude 桌面"的要求。**真正"独立软件"必须自带 Chromium**（Electron 的做法）。

### 3. electron-builder 卡 `winCodeSign` 符号链接权限

```
ERROR: Cannot create symbolic link : 客户端没有所需的权限
  → libcrypto.dylib / libssl.dylib (macOS symlinks in winCodeSign cache)
```

electron-builder 解压 `winCodeSign` 缓存时包含 macOS 符号链接，Windows 普通用户默认不允许创建符号链接。

**解法**：手动 PowerShell packaging（拷贝 `node_modules/electron/dist/` + 改名 + 注入 `resources/app/`），完全绕开 electron-builder。

**根治**：开启 Windows 开发者模式（设置→系统→开发者选项→开发者模式 ON）后即可正常用 electron-builder。

### 4. PyInstaller `--windowed` 让 uvicorn 崩

```
AttributeError: 'NoneType' object has no attribute 'isatty'
  in uvicorn/logging.py:42 ColourizedFormatter.__init__
```

`--windowed` 模式下 `sys.stdout` / `sys.stderr` 是 `None`，uvicorn 的 ColourizedFormatter 调 `sys.stdout.isatty()` 检测终端时崩。

**解法**：本架构下 backend exe 用 `--console` 模式（不要 `--windowed`），Electron `spawn` 时用 `windowsHide: true` 隐藏 console 黑窗。日志通过 `process.stdout/stderr` pipe 给 Electron 主进程。

### 5. 前端硬编码 `localhost:8000`

`client.ts` 和 `useChat.ts` 硬编码 `http://127.0.0.1:8000/api`：dev 模式 backend 正好在 8000 → 能用；打包后 backend 跑在 OS 分配的动态端口 → 前端全部 404 → 周记/月记/AI 导航看似无反应。

**解法**：`BASE_URL = import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '/api'`，prod 用同源相对路径自动指向 backend 的动态端口。

### 6. React Router 7 + React 19 + Vite 8 prod build 下 in-page navigation bug

点击 `<Link>` → React Router 内部 `pushState` 改 URL → **但 `<Routes>` 不响应 location 变化重渲染**。`window.location.pathname` 已变成 `/weekly`，页面仍显示 Diary。dev 模式正常，prod 模式失败。换 HashRouter 也失败，去 StrictMode 也失败 → 是 React Router 内部 listener 机制在 prod 下被 minify/tree-shake 影响。

**解法**：导航按钮改 `<a>` 标签 + `e.preventDefault()` + `window.location.href = path` 触发全页面跳转，React 重新 mount，BrowserRouter 首次匹配新路径渲染对应组件。代价是切换有 ~1s loading，但 100% 工作。

**根治**：等 React Router 7 升级修这个 bug，或者降级到 react-router v6 试。

### 7. Electron 内置 Chromium 缓存命中旧 JS

部署新版本后用户启动看到的还是旧版本——Chromium HTTP cache 命中了之前的 `index-xxx.js`。

**解法**：每次部署后清 `%APPDATA%\journal-agent\Cache` 和 `Code Cache`、`GPUCache`。已写入"重新打包流程"。

### 8. 浏览器导航事件冲突（Edge `--app` 第一版）

Edge 关闭窗口有 1-2s 子进程清理延迟，立刻重启第二个实例会因为同一个 `--user-data-dir` 被旧 Edge 占着而把任务委托给旧 Edge 立即退出，导致 Python 主进程 `proc.wait()` 立刻返回 → 看似启动了但后端已死。

**这个坑在 Electron 方案里不存在**——Electron 自带 Chromium，没有外部依赖。

### 9. 打包后 .env 相对路径失效（AI 全哑）

`agent/agent.py` 用 `Path(__file__).parent.parent/.env` 加载密钥。开发模式下 `__file__` 在项目里，能找到 `.env`；PyInstaller 打包后 `__file__` 指向 `_internal/`，`.env` 既不在那里、也不在 `.spec` 的 `datas` 里 —— 打包版后端读到的全是空密钥。最隐蔽的是 **UI 不报错**，只是模型显示"未配置"、AI 调用才失败，容易被当成"模型没配好"而非打包 bug。

**解法**：`.env` 加载与代码位置解耦 —— 新增 `core/env_setup.py`，打包模式从 `%APPDATA%\journal-agent\.env` 读（外置、可编辑、重新打包不丢失），并在 `main.py` 最早期 import 它。密钥不进发行包。

**教训**：打包后凡是用 `Path(__file__)` 推算出来的相对路径都要重新审视；配置 / 密钥类文件不应依赖打进包，应放到用户可写的外部位置。

---

## 工作量回顾

| 阶段 | 实际耗时 |
|---|---|
| 第一版（PyWebView → Edge `--app`） | ~2 小时（最后推翻） |
| Electron 后端 sidecar 化 | ~30 分钟 |
| Electron 主进程编写 | ~40 分钟 |
| 手动 packaging（绕 winCodeSign） | ~20 分钟 |
| 修 prod 下 API URL 硬编码 | ~15 分钟 |
| 修 prod 下 React Router 导航 bug | ~1 小时（试错了几个方案） |
| 清理代码 + 收尾 | ~10 分钟 |
| **总计** | **~4.5 小时** |
