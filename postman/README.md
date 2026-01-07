# Postman Collection

這個目錄包含完整的 API 測試 collection 和 environment 配置檔案。

## 檔案列表

### Collections
- **koa-auth-api.postman_collection.json** - 主要 API collection，包含所有端點和測試腳本

### Environments
- **Docker.postman_environment.json** - Docker 環境配置
- **Local.postman_environment.json** - 本地開發環境配置

## 匯入到 Postman

### 1. 匯入 Collection

1. 開啟 Postman
2. 點擊左上角 **Import** 按鈕
3. 選擇 `koa-auth-api.postman_collection.json`
4. 點擊 **Import**

### 2. 匯入 Environment

1. 點擊右上角的 **Environments** (齒輪圖示)
2. 點擊 **Import**
3. 選擇以下其中一個或兩個檔案：
   - `Docker.postman_environment.json` - 用於 Docker 環境
   - `Local.postman_environment.json` - 用於本地開發
4. 點擊 **Import**

### 3. 選擇 Environment

在 Postman 右上角的下拉選單中選擇：
- **Docker Environment** - 如果你使用 `npm run docker:dev`
- **Local Environment** - 如果你在本地運行 `npm run dev`

## API 端點總覽

### 🔓 Authentication (公開端點)

| 方法 | 端點 | 說明 | 自動儲存 Token |
|------|------|------|----------------|
| POST | `/api/auth/register` | 註冊新帳號 | ✅ |
| POST | `/api/auth/login` | 登入現有帳號 | ✅ |

### 🔒 Users (需要 JWT 認證)

| 方法 | 端點 | 說明 |
|------|------|------|
| POST | `/api/users` | 建立使用者資料 |
| GET | `/api/users` | 取得所有使用者 |
| GET | `/api/users/:id` | 取得特定使用者 |
| PUT | `/api/users/:id` | 更新使用者資料 |

## 使用流程

### 步驟 1: 啟動伺服器

#### 使用 Docker (推薦)
```bash
npm install
npm run docker:dev
```

#### 本地開發
```bash
npm install
npm run dev
```

### 步驟 2: 註冊或登入

1. 在 Postman 中選擇 **Auth** 資料夾
2. 執行 **Register** 請求建立新帳號
   - 或執行 **Login** 請求登入現有帳號
3. JWT token 會自動儲存到 collection variable `{{token}}`

### 步驟 3: 測試受保護的端點

1. Token 已自動儲存，所有 Users 端點都會自動使用
2. 直接執行 **Users** 資料夾下的任何請求
3. Authorization header 會自動帶入 `Bearer {{token}}`

## Collection Variables

Collection 包含以下變數：

| 變數 | 預設值 | 說明 |
|------|--------|------|
| `baseUrl` | `http://localhost:3000/api` | API 基礎 URL |
| `token` | (空) | JWT token (自動儲存) |

## Environment Variables

### Docker Environment
| 變數 | 值 | 說明 |
|------|------|------|
| `baseUrl` | `http://localhost:3000/api` | Docker 容器暴露的 API URL |
| `token` | (空) | JWT token |
| `environment` | `docker` | 環境識別 |

### Local Environment
| 變數 | 值 | 說明 |
|------|------|------|
| `baseUrl` | `http://localhost:3000/api` | 本地開發伺服器 URL |
| `token` | (空) | JWT token |
| `environment` | `local` | 環境識別 |

## 自動化功能

### Token 自動儲存

Register 和 Login 端點包含 Test Scripts，成功後會自動儲存 token：

```javascript
if (pm.response.code === 201 || pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success && response.data && response.data.token) {
        pm.collectionVariables.set('token', response.data.token);
        console.log('Token saved:', response.data.token);
    }
}
```

### Authorization Header 自動設定

所有受保護的端點都自動包含：

```
Authorization: Bearer {{token}}
```

## Response 範例

每個端點都包含多個 response 範例：

### Register/Login
- ✅ Success (201/200)
- ❌ Duplicate Email (409)
- ❌ Validation Error (400)
- ❌ Invalid Credentials (401)

### Create User
- ✅ Success (201)
- ❌ Unauthorized (401)
- ❌ Validation Error (400)

### Get All Users
- ✅ Success (200)
- ❌ Unauthorized (401)

### Get User By ID
- ✅ Success (200)
- ❌ Not Found (404)
- ❌ Unauthorized (401)

### Update User
- ✅ Success (200)
- ❌ Forbidden - Not Owner (403)
- ❌ Not Found (404)
- ❌ Validation Error (400)

## 驗證規則

### Register/Login
- **Email**: 必須是有效的 email 格式
- **Password**: 至少 8 個字元，必須包含大寫、小寫和數字

### Create/Update User
- **Username**: 3-50 字元，只能包含英數字、底線、連字號
- **Age**: 13-120
- **Gender**: `male`, `female`, 或 `other`
- **AccountId**: 必須是有效的 account ID (僅 Create User 需要)

## 常見問題

### Q: Token 過期了怎麼辦？

A: 重新執行 Login 請求，token 會自動更新。

### Q: 如何切換環境？

A: 在 Postman 右上角的下拉選單選擇不同的 environment。

### Q: 為什麼我收到 401 Unauthorized？

A: 檢查：
1. 是否已執行 Register 或 Login
2. Token 是否已儲存到 collection variable
3. Authorization header 是否正確設定為 `Bearer {{token}}`

### Q: 如何查看當前的 token？

A:
1. 點擊 collection 名稱 "Koa Auth API"
2. 切換到 **Variables** 標籤
3. 查看 `token` 變數的 **Current value**

### Q: Response 範例在哪裡？

A:
1. 點擊任一請求
2. 右側面板選擇 **Examples** 標籤
3. 查看各種成功和錯誤情境的範例

## 進階用法

### 使用 Collection Runner

1. 點擊 collection 右側的 **...** 選單
2. 選擇 **Run collection**
3. 選擇要執行的請求
4. 點擊 **Run Koa Auth API**

建議執行順序：
1. Register (建立帳號)
2. Create User (建立使用者資料)
3. Get All Users (查看所有使用者)
4. Get User By ID (查看特定使用者)
5. Update User (更新使用者資料)

### 匯出測試結果

1. 執行 Collection Runner
2. 完成後點擊 **Export Results**
3. 選擇格式 (JSON 或 CSV)

## 技術資訊

### 資料庫
- **類型**: PostgreSQL 16
- **ORM**: TypeORM
- **Port**: 5432 (Docker 和本地都使用標準 port)

### 認證機制
- **類型**: JWT (JSON Web Token)
- **Header**: `Authorization: Bearer <token>`
- **有效期**: 24 小時 (預設)

### 回應格式

所有 API 回應都遵循統一格式：

成功回應：
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

錯誤回應：
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]  // 可選，驗證錯誤時才有
}
```

## 相關資源

- [主要 README](../README.md)
- [Docker 使用說明](../README-DOCKER.md)
- [Postman 官方文件](https://learning.postman.com/docs/getting-started/introduction/)
- [JWT 介紹](https://jwt.io/introduction)

## 問題回報

如遇到 API 相關問題，請：
1. 檢查伺服器是否正常運行
2. 確認 environment 設定正確
3. 查看 Postman Console (View → Show Postman Console)
4. 檢查伺服器 logs

---

更新日期: 2026-01-07
版本: 2.0.0
