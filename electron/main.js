// Electron 主进程：spawn Python sidecar (journal-backend.exe) + 创建窗口 + 退出清理

const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const http = require('http');
const net = require('net');
const path = require('path');

let backendProcess = null;
let mainWindow = null;

// --- 单实例锁：第二次启动直接激活已有窗口，避免端口冲突 / 多实例 ---
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// --- 找一个空闲 TCP 端口（OS 自动分配，永不撞车）---
function findFreePort() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
    });
}

// --- 找 journal-backend.exe 路径（dev / prod 不一样）---
function getBackendPath() {
    if (app.isPackaged) {
        // 打包后：手动 packaging 时把 dist/journal-backend/ 拷到 resources/journal-backend/
        return path.join(process.resourcesPath, 'journal-backend', 'journal-backend.exe');
    }
    // dev 模式：用 PyInstaller 输出目录（npm run build:backend 产生的）
    return path.join(__dirname, '..', 'dist', 'journal-backend', 'journal-backend.exe');
}

// --- 启动 backend 子进程 ---
async function startBackend() {
    const port = await findFreePort();
    const backendExe = getBackendPath();

    backendProcess = spawn(backendExe, [], {
        env: { ...process.env, JOURNAL_BACKEND_PORT: String(port) },
        windowsHide: true,   // 不显示 PyInstaller console 黑窗
    });

    backendProcess.on('error', (err) => {
        dialog.showErrorBox(
            '后端启动失败',
            `无法启动 backend：\n${err.message}\n\n路径：${backendExe}`
        );
        app.quit();
    });

    backendProcess.on('exit', (code, signal) => {
        // 非主动 quit 时 backend 退出 = 异常
        if (!app.isQuitting) {
            dialog.showErrorBox(
                '后端异常退出',
                `Backend 进程意外退出 (code=${code}, signal=${signal})`
            );
            app.quit();
        }
    });

    // 转发 backend 日志到 Electron console，方便调试
    backendProcess.stdout?.on('data', (data) => {
        process.stdout.write(`[backend] ${data}`);
    });
    backendProcess.stderr?.on('data', (data) => {
        process.stderr.write(`[backend] ${data}`);
    });

    await waitForBackend(port, 30000);
    return port;
}

// --- 轮询 backend 就绪 ---
function waitForBackend(port, timeoutMs) {
    return new Promise((resolve, reject) => {
        const deadline = Date.now() + timeoutMs;

        const tryOnce = () => {
            if (Date.now() > deadline) {
                return reject(new Error(`Backend 在 ${timeoutMs}ms 内未就绪`));
            }
            const req = http.get(`http://127.0.0.1:${port}/docs`, (res) => {
                // 任何响应（哪怕 404）都说明 uvicorn 起来了
                resolve();
            });
            req.on('error', () => setTimeout(tryOnce, 200));
            req.setTimeout(500, () => req.destroy());
        };

        tryOnce();
    });
}

// --- 创建主窗口 ---
function createWindow(port) {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        title: 'Journal Agent',
        autoHideMenuBar: true,   // 隐藏菜单栏，按 Alt 临时显示
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.loadURL(`http://127.0.0.1:${port}/`);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// --- 应用生命周期 ---
app.whenReady().then(async () => {
    try {
        const port = await startBackend();
        createWindow(port);
    } catch (err) {
        dialog.showErrorBox('启动失败', String(err.message || err));
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    app.isQuitting = true;
    if (backendProcess && !backendProcess.killed) {
        backendProcess.kill('SIGTERM');
        // 2s 后还活着就 force kill，防止僵尸进程
        setTimeout(() => {
            if (backendProcess && !backendProcess.killed) {
                backendProcess.kill('SIGKILL');
            }
        }, 2000);
    }
});

app.on('activate', () => {
    // macOS：dock 图标点击重开窗口（虽然现在主要针对 Win，写上未来兼容）
    if (BrowserWindow.getAllWindows().length === 0) {
        app.whenReady();
    }
});
