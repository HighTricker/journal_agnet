# 线上部署计划：腾讯云服务器

> 创建时间：2026-04-04
> 当前状态：待执行

---

## 1. 基础部署

- [ ] 前端打包：`cd journal-frontend && npm run build`，生成 `dist/` 静态文件
- [ ] `main.py` 加 `StaticFiles` 挂载 `journal-frontend/dist`，前后端同端口访问
- [ ] 服务器安装 Python 3.x + Node.js，`pip install -r requirements.txt`
- [ ] 配置 `.env`：修改 `JOURNAL_BASE_DIR` 为服务器路径，填入 API Keys 和邮箱配置
- [ ] 用 `systemd` 创建服务：开机自启 + 崩溃自动重启
- [ ] 浏览器访问 `http://服务器IP:8000` 验证

## 2. 安全防护

- [ ] Nginx 反向代理：80/443 端口转发到 uvicorn 8000
- [ ] HTTPS：Let's Encrypt 免费证书（日记是隐私数据，不能裸 HTTP 传输）
- [ ] 登录认证：至少加简单密码保护，防止任何人通过 IP 访问日记

## 3. 数据备份（服务器 crontab 每天凌晨 3 点自动执行）

- [ ] 安装 `BaiduPCS-Go`，登录百度网盘账号
- [ ] 创建 GitHub 私有仓库（和代码仓库分开，专门存数据）
- [ ] 编写 `backup_journal.sh` 脚本：
  - 打包 `data/` 目录 → `journal_backup_YYYYMMDD.tar.gz`
  - 上传百度网盘 `/日记备份/` 目录
  - Git commit + push 到私有仓库
  - 清理 7 天前的本地备份文件
- [ ] 配置 crontab：`0 3 * * * /home/用户/backup_journal.sh`
- [ ] 本地电脑不需要开机，想看时从百度网盘 APP 或 `git pull` 拉取

## 4. 移动端访问（后续）

- [ ] PWA 方案：加 `manifest.json` + Service Worker
- [ ] 手机浏览器"添加到主屏幕"，像 APP 一样使用
- [ ] 不需要重写前端，改动量很小

## 5. 功能更新流程

```
本地 Windows 开发测试
        ↓
   git commit + git push
        ↓
   服务器 git pull
        ↓
   如果改了前端：cd journal-frontend && npm run build
        ↓
   sudo systemctl restart journal-agent
```
