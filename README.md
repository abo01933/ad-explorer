# Ad Explorer

Meta 廣告庫數據分析工具 - 用於探索、分析和比較 Meta 廣告數據的靜態網頁應用程式

## 📋 專案概述

Ad Explorer 是一個基於 BigSpy 概念開發的前端廣告分析工具，專門用於分析從 Meta Ad Library 收集的廣告數據。本工具提供了豐富的篩選、統計、時間軸分析和競品比對功能，幫助用戶深入了解廣告市場趨勢。

### 核心特色

- **零建置需求**：純靜態 HTML/CSS/JavaScript，無需編譯或打包
- **本地運行**：所有數據處理都在瀏覽器端完成，保護數據隱私
- **多維度分析**：支援關鍵字、廣告主、媒體類型、CTA 等多種維度的數據篩選
- **時間軸視覺化**：追蹤廣告投放趨勢，了解市場動態
- **競品比對**：三種比對模式（手動選擇、關鍵字分群、指紋偵測）
- **響應式設計**：支援桌面和移動設備瀏覽

## 🚀 快速開始

### 環境需求

- Python 3.x（用於啟動本地服務器）
- 現代瀏覽器（Chrome、Firefox、Safari、Edge）

### 安裝步驟

1. **確認資料文件**
   ```bash
   # 確保 data/ads.json 存在
   ls ad-explorer/data/ads.json
   ```

2. **啟動本地服務器**
   ```bash
   cd ad-explorer
   python -m http.server 8080
   ```

3. **開啟瀏覽器**
   ```
   http://localhost:8080
   ```

## 🏗️ 技術架構

### 技術棧

- **前端框架**：Vanilla JavaScript (ES6+)
- **CSS 框架**：Tailwind CSS v3.4 (CDN)
- **圖表庫**：Chart.js v4.4 (CDN)
- **架構模式**：模組化設計（IIFE）

### 檔案結構

```
ad-explorer/
├── index.html              # 主頁面
├── css/
│   └── styles.css         # 自定義樣式
├── js/
│   ├── app.js            # 應用程式初始化和視圖切換
│   ├── data.js           # 數據載入和管理
│   ├── filters.js        # 篩選邏輯
│   ├── cards.js          # 廣告卡片渲染
│   ├── charts.js         # 統計圖表
│   ├── timeline.js       # 時間軸分析
│   ├── compare.js        # 手動比對
│   ├── keyword-group.js  # 關鍵字分群
│   └── fingerprint.js    # 指紋偵測
└── data/
    └── ads.json          # 廣告數據（來自 Meta Ad Library）
```

### 模組說明

#### 1. **DataModule** (`data.js`)
負責數據載入、儲存和提供全局數據訪問。

**核心功能**：
- 載入並解析 `ads.json`
- 計算數據統計資訊（廣告數、廣告主數、日期範圍等）
- 提供篩選後數據的全局狀態管理

**關鍵方法**：
```javascript
DataModule.loadData()           // 載入數據
DataModule.getAllAds()          // 獲取所有廣告
DataModule.getFilteredAds()     // 獲取篩選後廣告
DataModule.getMetadata()        // 獲取數據統計資訊
DataModule.getAdsByAdvertiser() // 獲取特定廣告主的廣告
```

#### 2. **FiltersModule** (`filters.js`)
處理所有篩選邏輯，包括動態篩選選項更新。

**核心功能**：
- 關鍵字、CTA、媒體類型、平台等多維度篩選
- 運行天數、粉絲數範圍篩選
- 日期範圍篩選
- 域名篩選（含賭博網站分類、排除通用域名）
- 病毒式傳播廣告快速篩選
- **動態篩選計數**：顯示每個選項可用的廣告數量，自動禁用無數據選項

**關鍵字翻譯**：
```javascript
const keywordTranslations = {
    'স্লট': 'Slot',
    'ক্যাসিনো': 'Casino',
    'জ্যাকপট': 'Jackpot',
    'বড় জয়': 'Big Win',
    'ফ্রি কয়েন': 'Free Coins'
};
```

**域名分類**：
- **賭博網站**：如 vegasslotsonline.com、casinoguru.com 等
- **通用域名**：Google Play、App Store、Facebook 短網址等（默認排除）

#### 3. **CardsModule** (`cards.js`)
負責廣告卡片的渲染、分頁和詳情模態框。

**核心功能**：
- 廣告卡片渲染（媒體預覽、廣告資訊、徽章）
- 分頁控制（每頁 20 張卡片）
- 排序功能（運行天數、粉絲數、首次/最後出現時間）
- 詳情模態框（完整廣告資訊、媒體畫廊）
- **廣告主導航**：點擊廣告主名稱可查看該廣告主所有廣告

**廣告主導航功能**：
```javascript
CardsModule.filterByAdvertiser(advertiserName)
// 自動切換到列表視圖
// 篩選出該廣告主的所有廣告
// 滾動到頂部
```

#### 4. **ChartsModule** (`charts.js`)
使用 Chart.js 生成統計圖表。

**圖表類型**：
- 關鍵字分布（圓餅圖）
- 媒體類型分布（甜甜圈圖）
- CTA 類型分布（甜甜圈圖）
- 投放平台分布（橫條圖）
- Top 20 廣告主（橫條圖）

#### 5. **TimelineModule** (`timeline.js`)
時間軸分析和趨勢視覺化。

**核心功能**：
- **時間粒度**：支援每日、每週、每月聚合
- **顯示模式**：
  - 新增廣告數：該時間段新出現的廣告
  - 活躍廣告數：該時間點仍在運行的廣告
  - 累計廣告數：累積總數
- **多維度趨勢**：
  - 整體廣告數量趨勢
  - Top 5 關鍵字趨勢
  - Top 5 廣告主趨勢

**時間聚合邏輯**：
```javascript
// 根據 granularity 對齊日期到桶邊界
if (granularity === 'week') {
    current.setDate(current.getDate() - current.getDay()); // 對齊週一
} else if (granularity === 'month') {
    current.setDate(1); // 對齊月初
}
```

#### 6. **CompareModule** (`compare.js`)
手動選擇廣告主進行比對。

**核心功能**：
- 搜尋並選擇廣告主
- 顯示選定廣告主的統計資料
- 生成對比表格和圖表
- 移除已選廣告主

#### 7. **KeywordGroupModule** (`keyword-group.js`)
基於關鍵字自動分群比對。

**核心功能**：
- 自動按關鍵字分組廣告
- 顯示每組的廣告數、廣告主數、平均運行天數等
- 生成關鍵字分組圖表

#### 8. **FingerprintModule** (`fingerprint.js`)
基於創意指紋偵測重複廣告。

**核心功能**：
- 按 `creative_fingerprint` 分組
- 識別大量複製的創意（指紋出現次數 ≥ 3）
- 顯示每組的廣告數、廣告主數、代表性廣告

## 📊 數據結構

### ads.json 格式

```json
[
  {
    "id": "1234567890",
    "advertiser_name": "Example Casino",
    "keyword": "Slot",
    "media_type": "video",
    "media_urls": ["https://..."],
    "ad_text": "Win big jackpot!",
    "title": "Play Now",
    "cta_type": "PLAY_GAME",
    "cta_text": "Play Now",
    "first_seen": "2024-01-01",
    "last_seen": "2024-01-15",
    "running_days": 15,
    "page_like_count": 50000,
    "publisher_platforms": ["facebook", "instagram"],
    "landing_page": "https://example.com",
    "landing_page_domain": "example.com",
    "ad_url": "https://www.facebook.com/ads/library/?id=...",
    "is_viral": false,
    "duplication_count": 1,
    "creative_fingerprint": "abc123..."
  }
]
```

### 重要欄位說明

| 欄位 | 說明 |
|------|------|
| `keyword` | 廣告關鍵字（可能含非英文） |
| `media_type` | video / image / carousel |
| `running_days` | 廣告運行天數 |
| `is_viral` | 是否為病毒式傳播廣告 |
| `creative_fingerprint` | 創意指紋（用於偵測重複） |
| `landing_page_domain` | 落地頁域名 |

**注意**：目前數據集 **不包含** 投放區域（國家/地區）資訊。若需此功能，需更新數據收集腳本從 Meta Ad Library API 獲取 `target_locations` 欄位。

## 🎨 UI/UX 設計重點

### 視覺設計

- **配色方案**：淺色系為主，藍色為主題色
- **左側欄篩選器**：統一灰色風格，無額外顏色區分
- **快���篩選區**：
  - 病毒廣告：紫色主題
  - 排除通用域名：綠色主題

### 互動設計

1. **動態篩選反饋**
   - 無數據選項自動禁用（灰色、不可點擊）
   - 即時顯示可用廣告數量

2. **廣告主導航**
   - 廣告卡片和詳情頁的廣告主名稱可點擊
   - 點擊後自動篩選該廣告主所有廣告並切換到列表視圖
   - 模態框顯示該廣告主總廣告數

3. **鍵盤快捷鍵**
   - `ESC`：關閉模態框
   - `Ctrl/Cmd + K`：聚焦搜尋框

4. **響應式設計**
   - 桌面：左側固定欄 + 主內容區
   - 平板/手機：可收合側欄

## 🔧 核心功能詳解

### 1. 動態篩選系統

**工作原理**：
- 用戶選擇篩選器 A 後，系統重新計算其他篩選器的可用選項
- 禁用無數據選項，並顯示每個選項的廣告數量
- 實現「級聯篩選」效果，避免用戶選擇無效組合

**實現邏輯**：
```javascript
function getBaseFilteredAds() {
    // 先應用所有非特定類型的篩選器
    // 返回基礎篩選結果
}

function updateFilterCounts() {
    const baseAds = getBaseFilteredAds();
    // 對每個篩選選項計算可用廣告數
    // 禁用計數為 0 的選項
}
```

### 2. 時間軸聚合算法

**時間桶生成**：
```javascript
function generateTimeBuckets(minDate, maxDate, granularity) {
    // 1. 對齊起始日期到桶邊界（週一、月初等）
    // 2. 逐步推進生成所有時間桶
    // 3. 返回帶標籤的桶陣列
}
```

**廣告計數模式**：
- **新增模式**：計算 `first_seen` 落在該桶內的廣告
- **活躍模式**：計算 `first_seen <= 桶時間 <= last_seen` 的廣告
- **累計模式**：對新增廣告進行累加

### 3. 指紋偵測機制

**原理**：
- 使用 `creative_fingerprint` 欄位（可能基於媒體內容哈希值生成）
- 相同指紋代表相同或極度相似的創意
- 群組指紋出現次數 ≥ 3 視為「大量複製」

**應用場景**：
- 識別爆款創意
- 發現跨廣告主的創意抄襲
- 分析創意重複使用策略

## 🚧 已知限制與改進方向

### 已知限制

1. **無投放區域資料**
   - 原因：當前數據集未包含 `target_locations` 欄位
   - 解決方案：更新 `meta_ads_scraper.py` 從 API 獲取此欄位

2. **靜態數據集**
   - 原因：基於一次性抓取的 JSON 檔案
   - 解決方案：整合自動更新機制，定期刷新數據

3. **無後端服務**
   - 原因：純前端應用
   - 影響：無法處理大規模數據集（建議 < 1000 筆）

### 未來改進方向

1. **數據增強**
   - 整合 BigSpy API 獲取更多元數據
   - 添加創意效果追蹤（如 engagement 指標）
   - 支援多平台數據（TikTok、Google Ads）

2. **分析功能**
   - AI 驅動的創意分類（Fake Gameplay、News Style 等）
   - Hook 分析（前 3 秒元素偵測）
   - 文案情感分析

3. **協作功能**
   - 支援數據導出（CSV、Excel）
   - 創意標籤系統
   - 團隊協作筆記

4. **效能優化**
   - 虛擬滾動（處理大數據集）
   - Web Worker 加速篩選計算
   - IndexedDB 緩存機制

## 📝 開發備註

### 設計決策

1. **為何不使用 React/Vue？**
   - 降低學習門檻，純原生 JavaScript 易於理解和修改
   - 無建置流程，開箱即用
   - 數據量適中，性能足夠

2. **為何使用 IIFE 模組模式？**
   - 避免全局命名空間汙染
   - 清晰的依賴關係
   - 無需打包工具即可實現模組化

3. **為何使用 CDN？**
   - 簡化部署
   - 利用瀏覽器緩存
   - 適合小型專案

### 貢獻指南

如需修改或擴展功能：

1. **添加新篩選器**
   - 在 `filters.js` 的 `renderFilters()` 中添加 UI
   - 在 `applyFilters()` 中添加篩選邏輯
   - 更新 `updateFilterCounts()` 以支援動態計數

2. **添加新圖表**
   - 在 `charts.js` 中添加渲染函數
   - 在 `index.html` 的統計視圖中添加 canvas 元素
   - 調用新函數於 `initCharts()`

3. **添加新視圖**
   - 創建新的 JS 模組（如 `feature.js`）
   - 在 `index.html` 添加視圖內容和導航按鈕
   - 在 `app.js` 的 `switchView()` 中處理視圖切換

## 📧 聯絡資訊

本專案為 META ANALYSIS 分析框架的一部分。

相關文件：
- 主專案：`/META ANALYSIS/`
- 數據收集：`workflows/bigspy_collection.md`
- 分析流程：`workflows/ad_pattern_analysis.md`

---

**版本**：1.0.0
**最後更新**：2026-02-02
**相容瀏覽器**：Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
