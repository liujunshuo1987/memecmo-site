# MemeCMO.ai — 官网

让品牌成为 AI 的答案。GEO 出海服务官网。

## 技术栈
- 静态 HTML/CSS/JS（单文件部署）
- 托管：Vercel
- 域名：`memecmo.ai`（主域名），`www.memecmo.ai` → 301 重定向到 apex

## 本地预览
```bash
# 任意一种方式启动本地服务即可
python3 -m http.server 3000
# 或
npx serve .
```
打开 http://localhost:3000

## 部署流程

### 1. 推送到 GitHub
```bash
cd memecmo-site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin git@github.com:<你的用户名>/memecmo-site.git
git push -u origin main
```

### 2. Vercel 接入
1. 进入 https://vercel.com → New Project → Import 这个 GitHub 仓库
2. Framework Preset 选 **Other**（静态站点，无需构建命令）
3. 部署后会拿到一个 `xxx.vercel.app` 域名

### 3. 绑定自定义域名
在 Vercel 项目 → Settings → Domains 添加：
- `memecmo.ai`（设为 Primary）
- `www.memecmo.ai`（Vercel 默认会让它 301 到 apex；本仓库 `vercel.json` 也兜底了一层）

### 4. DNS 切换（在原域名注册商处操作）
当前你的 DNS 指向 Netlify，需要改为指向 Vercel。

**删除旧记录：**
| Name | Type | Value |
|---|---|---|
| memecmo.ai | NETLIFY | luxury-speculoos-685753.netlify.app |
| www.memecmo.ai | NETLIFY | luxury-speculoos-685753.netlify.app |

**新增 Vercel 记录：**
| Name | Type | Value | TTL |
|---|---|---|---|
| @ (memecmo.ai) | A | `76.76.21.21` | 3600 |
| www | CNAME | `cname.vercel-dns.com.` | 3600 |

> 如果你的 DNS 服务商支持 ALIAS/ANAME（不是所有都支持），apex 也可以用 `ALIAS @ → cname.vercel-dns.com`，效果更好。
> 不支持就用 A 记录 `76.76.21.21`（Vercel 官方静态 IP）。

### 5. 验证
- DNS 生效后（通常几分钟到几小时）Vercel 会自动签发 Let's Encrypt SSL
- 访问 https://memecmo.ai 应返回主页
- 访问 https://www.memecmo.ai 应 301 跳转到 https://memecmo.ai

## 文件说明
- `index.html` — 主页
- `vercel.json` — Vercel 路由 / 重定向 / 安全头配置
- `robots.txt` / `sitemap.xml` — SEO 基础
