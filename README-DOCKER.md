# Docker 使用說明

本專案已配置完整的 Docker 開發環境，包含 Koa.js 應用程式和 PostgreSQL 資料庫。

## 前置需求

請先安裝以下軟體：

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac)
- [Docker Engine](https://docs.docker.com/engine/install/) (Linux)
- Docker Compose (通常包含在 Docker Desktop 中)

確認安裝成功：
```bash
docker --version
docker-compose --version
```

## 快速開始

### 1. 安裝相依套件

首先需要在本地安裝 PostgreSQL 驅動程式：

```bash
npm install
```

這會安裝 `pg` package，這是 TypeORM 連接 PostgreSQL 所需的驅動程式。

### 2. 啟動開發環境

使用 Docker Compose 啟動所有服務：

```bash
npm run docker:dev
```

或直接使用 docker-compose：

```bash
docker-compose up --build
```

### 3. 等待服務就緒

啟動過程中會看到：
1. PostgreSQL 容器啟動
2. PostgreSQL 健康檢查 (約 10-30 秒)
3. 應用程式容器啟動
4. TypeORM 自動同步資料庫 schema
5. 伺服器開始監聽 port 3000

看到以下訊息表示啟動成功：
```
koa-demo-app-dev | Server is running on http://localhost:3000
```

### 4. 訪問應用程式

瀏覽器開啟：http://localhost:3000

## 常用指令

### 啟動服務

```bash
# 前景執行 (顯示即時 logs)
npm run docker:dev

# 背景執行
npm run docker:dev:detach
```

### 停止服務

```bash
# 停止所有容器
npm run docker:down

# 或直接使用 docker-compose
docker-compose down
```

### 查看 Logs

```bash
# 查看應用程式 logs (即時)
npm run docker:logs

# 查看所有服務 logs
docker-compose logs -f

# 只看 PostgreSQL logs
docker-compose logs -f postgres
```

### 清除所有資料

```bash
# 停止並刪除所有容器和資料 (包含資料庫資料)
npm run docker:clean

# 或直接使用 docker-compose
docker-compose down -v
```

### 重新建置映像檔

如果修改了 `package.json` 或 `Dockerfile.dev`：

```bash
docker-compose up --build
```

## 開發流程

### Hot Reload 自動重啟

專案已配置 hot reload，修改以下檔案會自動重啟應用程式：

- `src/` 目錄下的所有檔案
- `tsconfig.json`

修改檔案後，nodemon 會偵測到變更並自動重啟，無需手動重新啟動容器。

### 執行 Seed 資料

如果專案有 seed.ts 檔案，可以在容器內執行：

```bash
docker-compose exec app npx ts-node seed.ts
```

### 安裝新的 npm 套件

在本地安裝後需要重新建置容器：

```bash
npm install <package-name>
docker-compose up --build
```

## 資料庫管理

### 連線資訊

- **Host**: `localhost`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: `postgres`
- **Database**: `test1`

### 使用 psql 連線

進入 PostgreSQL 容器內的 psql：

```bash
docker-compose exec postgres psql -U postgres -d test1
```

常用 psql 指令：
```sql
\dt          -- 列出所有資料表
\d+ 表名      -- 查看表結構
\q           -- 退出
```

### 使用圖形化工具連線

可使用以下任一工具連線到 PostgreSQL：

- [pgAdmin](https://www.pgadmin.org/)
- [DBeaver](https://dbeaver.io/)
- [TablePlus](https://tableplus.com/)
- [DataGrip](https://www.jetbrains.com/datagrip/)

連線設定同上面的連線資訊。

### 資料庫備份

備份資料庫到本地檔案：

```bash
docker-compose exec postgres pg_dump -U postgres test1 > backup.sql
```

### 資料庫還原

從備份檔還原：

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d test1
```

或在 Windows PowerShell：

```powershell
Get-Content backup.sql | docker-compose exec -T postgres psql -U postgres -d test1
```

### 清空資料庫

刪除所有資料並重建 schema：

```bash
npm run docker:clean
npm run docker:dev
```

TypeORM 的 `synchronize: true` 會自動重建資料表。

## 故障排除

### 問題 1: Port 5432 已被佔用

**錯誤訊息**:
```
Error starting userland proxy: listen tcp4 0.0.0.0:5432: bind: address already in use
```

**解決方法**:

檢查是否有本地 PostgreSQL 正在運行：

```bash
# Windows
netstat -ano | findstr :5432

# Mac/Linux
lsof -i :5432
```

選項 1：停止本地 PostgreSQL 服務
```bash
# Windows (以管理員身分執行)
net stop postgresql-x64-14

# Mac
brew services stop postgresql

# Linux
sudo systemctl stop postgresql
```

選項 2：修改 docker-compose.yml 的 port mapping
```yaml
ports:
  - "5433:5432"  # 改用 host port 5433
```

### 問題 2: Port 3000 已被佔用

修改 docker-compose.yml：

```yaml
app:
  ports:
    - "3001:3000"  # 改用 host port 3001
```

### 問題 3: 資料庫連線失敗

**錯誤訊息**:
```
Error: connect ECONNREFUSED 172.xx.xx.xx:5432
```

**可能原因**:
1. PostgreSQL 尚未就緒
2. 健康檢查失敗

**解決方法**:

查看 PostgreSQL logs：
```bash
docker-compose logs postgres
```

確認健康檢查狀態：
```bash
docker-compose ps
```

重新啟動：
```bash
docker-compose down
docker-compose up --build
```

### 問題 4: Hot Reload 無效

**症狀**: 修改 src/ 下的檔案但應用程式沒有重啟

**解決方法**:

1. 確認 docker-compose.yml 的 volumes 設定：
```yaml
volumes:
  - ./src:/app/src
  - ./tsconfig.json:/app/tsconfig.json
```

2. 重新啟動容器：
```bash
docker-compose restart app
```

3. 查看 nodemon logs：
```bash
docker-compose logs -f app
```

### 問題 5: npm install 後找不到模組

**錯誤訊息**:
```
Error: Cannot find module 'pg'
```

**解決方法**:

重新建置 Docker 映像檔：
```bash
docker-compose down
docker-compose up --build
```

### 問題 6: TypeORM 連線錯誤 "driver not found"

**解決方法**:

1. 確認 `src/config/database.ts` 中 type 為 `'postgres'`
2. 確認 `package.json` 包含 `"pg": "^8.11.3"`
3. 確認已在本地執行 `npm install`
4. 重新建置：`docker-compose up --build`

### 問題 7: Windows 上 node_modules 權限問題

這個問題已透過匿名 volume 解決：

```yaml
volumes:
  - /app/node_modules  # 匿名 volume 避免衝突
```

如仍有問題，刪除本地 node_modules：
```bash
rm -rf node_modules
docker-compose up --build
```

### 問題 8: 磁碟空間不足

清理未使用的 Docker 資源：

```bash
# 清理未使用的映像檔、容器、網路
docker system prune -a

# 清理未使用的 volumes (會刪除資料庫資料！)
docker volume prune
```

## 監控

本專案整合了 Prometheus + Grafana 監控系統，可即時追蹤應用程式的健康狀態和效能指標。

### 監控服務

啟動 `npm run docker:dev` 後，會同時啟動以下監控服務：

| 服務 | Port | 登入資訊 | 說明 |
|------|------|---------|------|
| **Grafana** | 3001 | admin / admin | 視覺化監控 Dashboard |
| **Prometheus** | 9090 | - | 指標收集和儲存 |
| **Metrics Endpoint** | 3000/metrics | - | 應用程式指標導出端點 |

### 快速開始

1. 啟動所有服務（包含監控）：
```bash
npm run docker:dev
```

2. 訪問 Grafana Dashboard：
   - 開啟 http://localhost:3001
   - 登入: `admin` / `admin`
   - 預設 dashboard: "Koa Demo Application Monitoring"

3. 訪問 Prometheus（進階用戶）：
   - 開啟 http://localhost:9090
   - 可直接查詢和探索指標

4. 查看原始指標：
   - 開啟 http://localhost:3000/metrics
   - Prometheus 文字格式的指標

### 收集的指標

#### HTTP 指標
- `koa_demo_http_requests_total` - HTTP 請求總數（按方法、路由、狀態碼）
- `koa_demo_http_request_duration_seconds` - HTTP 請求延遲分布
- `koa_demo_http_request_size_bytes` - HTTP 請求大小分布
- `koa_demo_http_response_size_bytes` - HTTP 回應大小分布

#### 資料庫指標
- `koa_demo_db_queries_total` - 資料庫查詢總數（按類型和 entity）
- `koa_demo_db_query_duration_seconds` - 資料庫查詢時間分布
- `koa_demo_db_connection_pool_size` - 連線池大小
- `koa_demo_db_connection_pool_active` - 活躍連線數

#### 系統指標
- `koa_demo_event_loop_lag_seconds` - Node.js Event Loop 延遲
- `koa_demo_process_cpu_seconds_total` - CPU 使用時間
- `koa_demo_process_resident_memory_bytes` - 記憶體使用量
- `koa_demo_nodejs_heap_size_used_bytes` - Heap 記憶體使用量

#### 業務指標
- `koa_demo_user_registrations_total` - 用戶註冊總數
- `koa_demo_user_logins_total` - 成功登入總數
- `koa_demo_user_login_failures_total` - 登入失敗總數（按原因）

### Dashboard 說明

預配置的 Grafana Dashboard 包含 12 個 panels：

1. **HTTP Request Rate** - 每秒 HTTP 請求數
2. **HTTP Request Duration (95th percentile)** - 95% 請求延遲
3. **HTTP Status Code Distribution** - 狀態碼分布圓餅圖
4. **Database Query Rate** - 每秒資料庫查詢數
5. **Database Query Duration (95th percentile)** - 95% 查詢延遲
6. **Node.js Memory Usage** - 記憶體使用（RSS, Heap）
7. **CPU Usage** - CPU 使用率百分比
8. **Event Loop Lag** - Event Loop 延遲（Gauge）
9. **Database Connection Pool** - 連線池狀態
10. **User Registrations (24h)** - 24 小時內註冊數
11. **User Logins (24h)** - 24 小時內登入數
12. **Failed Login Attempts (24h)** - 24 小時內失敗登入數

Dashboard 特性：
- **自動刷新**: 每 10 秒更新一次
- **即時資料**: 預設顯示最近 1 小時
- **互動式**: 可點擊圖表深入探索

### 監控故障排除

#### Prometheus 無法抓取指標

**症狀**: Prometheus Targets 頁面顯示 `app:3000` 為 DOWN

**解決方法**:
```bash
# 1. 檢查所有容器狀態
docker-compose ps

# 2. 檢查 app 容器 logs
docker-compose logs app

# 3. 測試 metrics endpoint
curl http://localhost:3000/metrics

# 4. 重啟服務
docker-compose restart app prometheus
```

#### Grafana Dashboard 無資料

**症狀**: Dashboard 載入但所有 panel 顯示 "No data"

**解決方法**:
1. 檢查 Prometheus 是否正常抓取資料：
   - 訪問 http://localhost:9090/targets
   - 確認 `koa-demo-app` target 狀態為 UP

2. 在 Grafana 中測試查詢：
   - 進入任一 panel 編輯模式
   - 執行查詢: `koa_demo_http_requests_total`
   - 應該看到資料

3. 產生一些流量：
   ```bash
   # 發送測試請求
   curl http://localhost:3000/api/auth/login
   ```

4. 檢查時間範圍：
   - Dashboard 右上角選擇 "Last 5 minutes"
   - 確保有最近的資料

#### Port 9090 或 3001 被佔用

**解決方法**: 修改 docker-compose.yml 的 port mapping

```yaml
prometheus:
  ports:
    - "9091:9090"  # 改用 host port 9091

grafana:
  ports:
    - "3002:3000"  # 改用 host port 3002
```

### 資料保留

- **Prometheus**: 保留 30 天資料（可在 prometheus.yml 調整）
- **Grafana**: Dashboard 配置和設定持久化在 `grafana_data` volume

清除監控資料：
```bash
# 只清除監控資料
docker volume rm koa-demo_prometheus_data koa-demo_grafana_data

# 清除所有資料（包含資料庫）
npm run docker:clean
```

## 架構說明

### 服務架構

```
┌─────────────────────────────────────────┐
│         Host Machine                     │
│                                         │
│  Port 3000 ─────> App Container         │
│  Port 5432 ─────> PostgreSQL            │
│  Port 9090 ─────> Prometheus            │
│  Port 3001 ─────> Grafana               │
│                                         │
│         Docker Network                  │
│  ┌──────────┐    ┌────────────┐        │
│  │   App    │───>│ Prometheus │        │
│  │ :3000    │    │   :9090    │        │
│  │ /metrics │    └─────┬──────┘        │
│  └────┬─────┘          │               │
│       │                │               │
│       │          ┌─────▼──────┐        │
│       │          │  Grafana   │        │
│       │          │   :3001    │        │
│       │          └────────────┘        │
│       │                                │
│  ┌────▼──────┐                        │
│  │ PostgreSQL│                        │
│  │   :5432   │                        │
│  └───────────┘                        │
└─────────────────────────────────────────┘
```

### 資料持久化

- **PostgreSQL 資料**: 儲存在 Docker named volume `postgres_data_dev`
- **程式碼**: 透過 bind mount 同步 host 和 container
- **node_modules**: 使用匿名 volume，獨立於 host

即使刪除容器，PostgreSQL 資料仍保留在 volume 中，除非使用 `docker-compose down -v`。

### 網路配置

所有服務都在自訂的 bridge network `koa-demo-network` 中：

- 服務之間透過服務名稱通訊 (例如 `postgres`)
- 對外暴露 port 3000 (應用程式) 和 5432 (PostgreSQL)
- 網路隔離提供安全性

### 啟動順序

1. PostgreSQL 容器啟動
2. 健康檢查執行 `pg_isready -U postgres`
3. 健康檢查通過後，應用程式容器啟動
4. TypeORM 連線到 PostgreSQL
5. 開發模式自動同步 schema (`synchronize: true`)
6. 應用程式開始監聽請求

## 環境變數

環境變數在 `docker-compose.yml` 中設定：

```yaml
environment:
  NODE_ENV: development
  PORT: 3000
  DB_HOST: postgres        # Docker 內部服務名稱
  DB_PORT: 5432
  DB_USER: postgres
  DB_PASSWORD: postgres
  DB_NAME: test1
  JWT_SECRET: your-super-secret-jwt-key-change-this-in-production-min-32-chars
  JWT_EXPIRES_IN: 24h
  CORS_ORIGIN: "*"
```

如需自訂，可修改 docker-compose.yml 或建立 `.env.docker.local` 檔案。

## 最佳實踐

### 開發建議

1. **定期清理**: 定期執行 `docker system prune` 清理未使用資源
2. **版本控制**: 不要提交 `.env.docker.local` 到 git
3. **資料備份**: 重要資料定期備份 (使用 pg_dump)
4. **監控 logs**: 開發時保持 logs 視窗開啟，即時發現問題

### 效能優化

1. **WSL2 on Windows**: Windows 用戶建議使用 WSL2 backend，效能更好
2. **資源限制**: 可在 docker-compose.yml 加入資源限制：
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

### 安全建議

1. **更改預設密碼**: 生產環境務必更改 PostgreSQL 密碼
2. **JWT Secret**: 使用強隨機字串 (至少 32 字元)
3. **CORS 設定**: 生產環境不要使用 `*`，指定明確的 domain

## 進階用途

### 執行測試

如果專案有測試，可在容器內執行：

```bash
docker-compose exec app npm test
```

### 進入容器 Shell

```bash
# 進入應用程式容器
docker-compose exec app sh

# 進入 PostgreSQL 容器
docker-compose exec postgres sh
```

### 查看容器資源使用

```bash
docker stats
```

### 檢查網路設定

```bash
docker network inspect koa-demo_koa-demo-network
```

## 相關資源

- [Docker 官方文件](https://docs.docker.com/)
- [Docker Compose 官方文件](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Node.js Docker Hub](https://hub.docker.com/_/node)
- [TypeORM 文件](https://typeorm.io/)

## 疑難排解聯絡

如遇到本文件未涵蓋的問題，請：

1. 查看容器 logs: `docker-compose logs`
2. 檢查容器狀態: `docker-compose ps`
3. 查看 Docker 版本: `docker --version`
4. 確認系統資源充足 (RAM, 磁碟空間)

祝開發順利！
