# タスクリスト - FakeAdAlertDemo Phase 5: デモ用フェイクニュースサイト

## 1. 概要

Phase 5の設計書に基づくタスク分解。デモ用フェイクニュースサイトの作成、バナー広告検出、クリックブロック機能を実装する。

### 前提条件
- Phase 0〜4が完了していること
- Chrome 114以上

### 完了条件
- デモサイトがNetlifyで公開されている
- ニュースメディア風の見た目でリアルなフェイク記事が表示される
- フェイクバナー広告（3種）と認証済みバナー広告（2種）が混在表示される
- フェイクバナーに赤い警告オーバーレイが自動表示される
- フェイクバナーをクリックするとカスタム警告モーダルが表示され、遷移がブロックされる
- 認証済みバナーには緑のバッジが表示され、クリックは通常通り動作する
- サイドパネルにVC検証情報がリアルタイム反映される
- 既存のInstagram/TikTok機能にデグレなし

---

## 2. タスク一覧

### Phase 5-A: デモサイト作成
- [ ] T501: デモサイトHTML作成（index.html）
- [ ] T502: デモサイトCSS作成（style.css）
- [ ] T503: バナー広告画像作成（SVG 5種）

### Phase 5-B: 拡張機能コア変更
- [ ] T504: Platform型・DetectedAdInfo型の拡張
- [ ] T505: manifest.json更新（v0.5.0、content_scripts追加）
- [ ] T506: config/ad-verification.yml更新（なりすまし検出パターン追加）

### Phase 5-C: バナー検出・表示
- [ ] T507: ニュースバナー検出ロジック作成（news-detector.ts）
- [ ] T508: ニュースサイト用Content Script作成（news-site.ts）
- [ ] T509: warning-overlay.ts にnews-site対応追加
- [ ] T510: verified-badge.ts にnews-site対応追加

### Phase 5-D: クリックブロック機能
- [ ] T511: クリックブロッカー作成（click-blocker.ts）
- [ ] T512: 警告モーダル作成（warning-modal.ts）
- [ ] T513: モーダル・オーバーレイCSS作成（news-site.css）

### Phase 5-E: サイドパネル連携
- [ ] T514: サイドパネルUI更新（index.html, index.ts）

### Phase 5-F: ビルド・テスト
- [ ] T515: ビルド・型チェック
- [ ] T516: デモサイトでの動作確認（ローカル） ※ブラウザで手動確認
- [ ] T517: Instagram/TikTok回帰テスト ※ブラウザで手動確認
- [ ] T518: デバッグ・調整

### Phase 5-G: デプロイ・完了
- [ ] T519: Netlifyデプロイ設定（mainプッシュで自動デプロイ）
- [ ] T520: ドキュメント更新（README、デモ手順書）
- [ ] T521: コミット・プッシュ・PR作成

---

## 3. タスク詳細

### T501: デモサイトHTML作成

- **要件ID**: REQ-P5-001, REQ-P5-002
- **設計書参照**: design.md §3.1, §4
- **依存関係**: なし
- **対象ファイル**: demo-site/index.html（新規）
- **完了条件**:
  - [ ] ニュースメディア風レイアウト（ヘッダー、記事エリア、サイドバー、フッター）
  - [ ] メイン記事1本 + サブ記事2本のリアルな架空記事
  - [ ] フェイクバナー3種（投資詐欺、なりすまし、情報商材）を配置
  - [ ] 認証済みバナー2種（トヨタ、ソニー）を配置
  - [ ] 全バナーに `data-ad-slot`, `data-advertiser` 属性を付与
  - [ ] 各バナーに `<a>` タグでリンクを設定
  - [ ] レスポンシブ対応（基本レベル）
- **並列実行**: T502, T503, T504, T505, T506と同時実行可能

---

### T502: デモサイトCSS作成

- **要件ID**: REQ-P5-001, NFR-P5-002
- **設計書参照**: design.md §4.3
- **依存関係**: なし
- **対象ファイル**: demo-site/style.css（新規）
- **完了条件**:
  - [ ] Noto Sans JP / sans-serif系フォント
  - [ ] ヘッダーのナビゲーションスタイル
  - [ ] 2カラムレイアウト（メインコンテンツ + サイドバー300px）
  - [ ] 記事カードのスタイル
  - [ ] バナー広告のスタイル（300x250サイドバー、728x90インライン）
  - [ ] 「広告」ラベルの表示
  - [ ] フッターのスタイル
  - [ ] レスポンシブ対応（基本レベル）
- **並列実行**: T501, T503, T504, T505, T506と同時実行可能

---

### T503: バナー広告画像作成

- **要件ID**: REQ-P5-002, NFR-P5-002, CON-P5-003
- **設計書参照**: design.md §3.1.3
- **依存関係**: なし
- **対象ファイル**: demo-site/images/（新規ディレクトリ）
- **完了条件**:
  - [ ] banner-invest.svg: 投資詐欺系（「月収100万円」テーマ）
  - [ ] banner-fake-sony.svg: なりすまし系（「S0NY」風デザイン）
  - [ ] banner-info.svg: 情報商材系（「LINE無料講座」テーマ、横長728x90）
  - [ ] banner-toyota.svg: 認証済み（トヨタ風、実ロゴは使用しない）
  - [ ] banner-sony.svg: 認証済み（ソニー風、実ロゴは使用しない）
  - [ ] 各SVGがリアルな広告に見えるデザイン
  - [ ] 実在企業のロゴ・商標をそのまま使用しない
- **並列実行**: T501, T502, T504, T505, T506と同時実行可能

---

### T504: Platform型・DetectedAdInfo型の拡張

- **要件ID**: REQ-P5-003
- **設計書参照**: design.md §3.8, §3.9
- **依存関係**: なし
- **対象ファイル**: src/lib/types.ts, src/lib/vc-types.ts
- **完了条件**:
  - [ ] `Platform` 型に `'news-site'` を追加
  - [ ] `DetectedAdInfo.platform` に `'news-site'` を追加
  - [ ] `pnpm typecheck` エラーなし
- **並列実行**: T501〜T503, T505, T506と同時実行可能

---

### T505: manifest.json更新

- **要件ID**: CON-P5-002
- **設計書参照**: design.md §3.7
- **依存関係**: なし
- **対象ファイル**: manifest.json
- **完了条件**:
  - [ ] `version` を `"0.5.0"` に更新
  - [ ] `content_scripts` にニュースサイト用エントリ追加（localhost, netlify.app）
  - [ ] `content_scripts[2].js` に `src/content/news-site.ts` を指定
  - [ ] `content_scripts[2].css` に `src/content/news-site.css` を指定
  - [ ] `host_permissions` に `http://localhost:*/*`, `https://*.netlify.app/*` を追加
- **並列実行**: T501〜T504, T506と同時実行可能

---

### T506: config/ad-verification.yml更新

- **要件ID**: REQ-P5-002（なりすまし検出）
- **設計書参照**: design.md §3.1.4
- **依存関係**: なし
- **対象ファイル**: config/ad-verification.yml
- **完了条件**:
  - [ ] ブラックリストに「なりすまし系」カテゴリ追加
  - [ ] パターン: `"(公式)"`, `"公式サイト限定"`, `"S0NY"` 等
  - [ ] 既存パターンとの重複なし
- **並列実行**: T501〜T505と同時実行可能

---

### T507: ニュースバナー検出ロジック作成

- **要件ID**: REQ-P5-003
- **設計書参照**: design.md §3.3
- **依存関係**: T504（型定義）
- **対象ファイル**: src/lib/news-detector.ts（新規）
- **完了条件**:
  - [ ] `detectNewsBanners()` 関数をexport
  - [ ] `.ad-banner[data-ad-slot]` セレクタでバナーを検出
  - [ ] `data-advertiser` 属性から広告主名を取得
  - [ ] `data-fakead-processed` 属性で二重処理を防止
  - [ ] `AdInfo` 型で結果を返す
  - [ ] `pnpm typecheck` エラーなし
- **並列実行**: T508と並列可（ただしT508はT507に依存）

---

### T508: ニュースサイト用Content Script作成

- **要件ID**: REQ-P5-003
- **設計書参照**: design.md §3.2
- **依存関係**: T504, T507
- **対象ファイル**: src/content/news-site.ts（新規）
- **完了条件**:
  - [ ] `detectNewsBanners()` でバナー検出
  - [ ] `verifyAdvertiser()` で判定
  - [ ] verified → `showVerifiedBadge(ad, 'news-site')`
  - [ ] fake/unknown → `showWarningOverlay()` + `setupClickBlocker()`
  - [ ] `notifyBackground()` でBackground Scriptに通知
  - [ ] DOMContentLoaded/readyState判定で初期化
  - [ ] `pnpm typecheck` エラーなし
- **並列実行**: 不可（T504, T507に依存）

---

### T509: warning-overlay.ts にnews-site対応追加

- **要件ID**: REQ-P5-003
- **設計書参照**: design.md §3.12
- **依存関係**: T504（Platform型）
- **対象ファイル**: src/components/warning-overlay.ts
- **完了条件**:
  - [ ] `platform === 'news-site'` 分岐を追加
  - [ ] ニュースサイト: `ad.element` をrelativeに設定し直接appendChild
  - [ ] 既存のInstagram/TikTokパスに影響なし
  - [ ] `pnpm typecheck` エラーなし
- **並列実行**: T510と同時実行可能

---

### T510: verified-badge.ts にnews-site対応追加

- **要件ID**: REQ-P5-006
- **設計書参照**: design.md §3.11
- **依存関係**: T504（Platform型）
- **対象ファイル**: src/components/verified-badge.ts
- **完了条件**:
  - [ ] `insertBadgeForNewsSite()` 関数を追加
  - [ ] バナーコンテナの左上にabsolute配置
  - [ ] `showVerifiedBadge()` にnews-site分岐を追加
  - [ ] 既存のInstagram/TikTokパスに影響なし
  - [ ] `pnpm typecheck` エラーなし
- **並列実行**: T509と同時実行可能

---

### T511: クリックブロッカー作成

- **要件ID**: REQ-P5-004
- **設計書参照**: design.md §3.4
- **依存関係**: T504（型定義）
- **対象ファイル**: src/components/click-blocker.ts（新規）
- **完了条件**:
  - [ ] `setupClickBlocker()` 関数をexport
  - [ ] バナー内の `<a>` タグにclickリスナーを設定（キャプチャフェーズ）
  - [ ] `event.preventDefault()` + `event.stopPropagation()` でナビゲーション阻止
  - [ ] クリック時に `showWarningModal()` を呼び出し
  - [ ] リンク要素の `pointer-events`, `cursor`, `z-index` を適切に設定
  - [ ] `pnpm typecheck` エラーなし
- **並列実行**: T512と同時実行可能

---

### T512: 警告モーダル作成

- **要件ID**: REQ-P5-005
- **設計書参照**: design.md §3.5
- **依存関係**: なし
- **対象ファイル**: src/components/warning-modal.ts（新規）
- **完了条件**:
  - [ ] `showWarningModal()` 関数をexport
  - [ ] 背景暗転オーバーレイ（rgba(0,0,0,0.7)）
  - [ ] ダークテーマ + グラスモーフィズムのモーダル本体
  - [ ] 警告アイコン、タイトル「この広告はVC未認証です」
  - [ ] 検出情報（広告主名、判定、マッチパターン）表示
  - [ ] 「安全なページに戻る」ボタン → モーダルを閉じる
  - [ ] 「リスクを理解して進む」ボタン → 元URLに遷移
  - [ ] 背景クリックでもモーダルを閉じる
  - [ ] 既存モーダルの重複防止
  - [ ] `pnpm typecheck` エラーなし
- **並列実行**: T511と同時実行可能

---

### T513: モーダル・オーバーレイCSS作成

- **要件ID**: REQ-P5-005, NFR-P5-003
- **設計書参照**: design.md §3.6
- **依存関係**: なし
- **対象ファイル**: src/content/news-site.css（新規）
- **完了条件**:
  - [ ] 警告モーダルのCSS（backdrop, modal, buttons等）
  - [ ] ダークテーマ + グラスモーフィズム（#0f0f23ベース、backdrop-filter: blur）
  - [ ] 安全ボタン: 緑グラデーション（#10b981 → #059669）
  - [ ] 進むボタン: 控えめなスタイル（rgba(255,255,255,0.05)）
  - [ ] ニュースサイト用バナー警告オーバーレイCSS
  - [ ] ニュースサイト用認証バッジCSS
  - [ ] fadeInアニメーション
  - [ ] BEMライクなクラス命名（`fakead-warning-modal__*`）
- **並列実行**: T511, T512と同時実行可能

---

### T514: サイドパネルUI更新

- **要件ID**: REQ-P5-006（サイドパネル反映）
- **設計書参照**: design.md §3.10
- **依存関係**: T504（型定義）
- **対象ファイル**: src/sidepanel/index.html, src/sidepanel/index.ts
- **完了条件**:
  - [ ] index.html: SNSタグに `📰 News ✓` を追加
  - [ ] index.ts: `platformLabel()` に `'news-site'` → `'ニュースサイト'` を追加
  - [ ] 既存のInstagram/TikTok表示に影響なし
  - [ ] `pnpm typecheck` エラーなし
- **並列実行**: 他のタスクと同時実行可能

---

### T515: ビルド・型チェック

- **依存関係**: T501〜T514
- **完了条件**:
  - [ ] `pnpm typecheck` エラーなし
  - [ ] `pnpm build` 正常完了
  - [ ] dist/ にnews-site Content Scriptが含まれる
  - [ ] dist/ にnews-site CSSが含まれる
  - [ ] dist/ に既存のInstagram/TikTok Content Scriptが含まれる
- **並列実行**: 不可（全実装完了後）

---

### T516: デモサイトでの動作確認（ローカル）

- **依存関係**: T515
- **完了条件**:
  - [ ] demo-site/をローカルサーバーで起動（`npx serve demo-site` 等）
  - [ ] Chrome拡張を再読み込み
  - [ ] デモサイトにアクセスし、ニュースメディア風の見た目を確認
  - [ ] フェイクバナー3種に赤い警告オーバーレイが表示される
  - [ ] 認証済みバナー2種に緑の認証バッジが表示される
  - [ ] フェイクバナーをクリック → 警告モーダルが表示される
  - [ ] 「安全なページに戻る」→ モーダルが閉じる
  - [ ] 「リスクを理解して進む」→ 元URLに遷移する
  - [ ] 認証済みバナーをクリック → 通常通り遷移する
  - [ ] サイドパネルにVC検証情報がリアルタイム反映される
  - [ ] コンソールエラーなし
- **並列実行**: T517と同時実行可能

---

### T517: Instagram/TikTok回帰テスト

- **依存関係**: T515
- **完了条件**:
  - [ ] Instagramで警告オーバーレイ表示確認
  - [ ] Instagramで認証バッジ表示確認
  - [ ] TikTokで警告オーバーレイ表示確認
  - [ ] TikTokで認証バッジ表示確認
  - [ ] Phase 4までの機能にデグレなし
- **並列実行**: T516と同時実行可能

---

### T518: デバッグ・調整

- **依存関係**: T516, T517
- **完了条件**:
  - [ ] テストで発見された不具合の修正
  - [ ] UI微調整（必要に応じて）
  - [ ] コンソールエラーなし
- **並列実行**: 不可

---

### T519: Netlifyデプロイ設定（mainプッシュで自動デプロイ）

- **依存関係**: T518
- **対象ファイル**: netlify.toml（新規）, demo-site/
- **完了条件**:
  - [ ] `netlify.toml` をリポジトリルートに作成（`publish = "demo-site/"`, ビルドコマンドなし）
  - [ ] Netlifyでプロジェクト作成、GitHubリポジトリと連携
  - [ ] mainブランチへのプッシュで自動デプロイされることを確認
  - [ ] デプロイ成功
  - [ ] 公開URLでデモサイトにアクセスできる
  - [ ] 公開URLでChrome拡張のContent Scriptが動作する
  - [ ] manifest.jsonのURLパターン（`*.netlify.app`）が公開URLにマッチすることを確認
- **並列実行**: 不可

---

### T520: ドキュメント更新

- **依存関係**: なし（並列で事前作業可能）
- **対象ファイル**: README.md, docs/demo-guide.md
- **完了条件**:
  - [ ] README.md のロードマップにPhase 5完了を反映
  - [ ] README.md のディレクトリ構成にdemo-site/を追加
  - [ ] docs/demo-guide.md にデモニュースサイトの操作手順を追加
  - [ ] デプロイURLの記載
  - [ ] クリックブロック機能の説明を追加
- **並列実行**: 他のタスクと同時実行可能

---

### T521: コミット・プッシュ・PR作成

- **依存関係**: T515〜T520
- **完了条件**:
  - [ ] 全ファイルをステージング
  - [ ] コミットメッセージ（日本語）
  - [ ] GitHubにプッシュ
  - [ ] PR作成（mainへ）
- **コミットメッセージ例**:
  ```
  feat: Phase 5完了 - デモ用フェイクニュースサイト + クリックブロック機能

  - ニュースメディア風デモサイト（demo-site/）を新規作成
  - フェイクバナー3種 + 認証済みバナー2種を配置
  - フェイクバナーのクリックブロック機能を実装
  - カスタム警告モーダル（ダークテーマ + グラスモーフィズム）
  - ニュースサイト用Content Script（news-site.ts）追加
  - サイドパネルにニュースサイト対応を追加
  - Netlifyデプロイ対応
  ```

---

## 4. 依存関係図

```mermaid
graph LR
    subgraph Phase 5-A: デモサイト
        T501[T501: HTML]
        T502[T502: CSS]
        T503[T503: SVG画像]
    end

    subgraph Phase 5-B: コア変更
        T504[T504: 型拡張]
        T505[T505: manifest.json]
        T506[T506: config更新]
    end

    subgraph Phase 5-C: 検出・表示
        T507[T507: news-detector]
        T508[T508: Content Script]
        T509[T509: overlay拡張]
        T510[T510: badge拡張]
    end

    subgraph Phase 5-D: クリックブロック
        T511[T511: click-blocker]
        T512[T512: warning-modal]
        T513[T513: CSS]
    end

    subgraph Phase 5-E: サイドパネル
        T514[T514: パネルUI更新]
    end

    subgraph Phase 5-F: テスト
        T515[T515: ビルド確認]
        T516[T516: デモサイト動作確認]
        T517[T517: 回帰テスト]
        T518[T518: デバッグ]
    end

    subgraph Phase 5-G: 完了
        T519[T519: デプロイ]
        T520[T520: ドキュメント]
        T521[T521: コミット・PR]
    end

    T504 --> T507
    T504 --> T509
    T504 --> T510
    T504 --> T511
    T504 --> T514
    T507 --> T508
    T504 --> T508

    T501 --> T515
    T502 --> T515
    T503 --> T515
    T505 --> T515
    T506 --> T515
    T508 --> T515
    T509 --> T515
    T510 --> T515
    T511 --> T515
    T512 --> T515
    T513 --> T515
    T514 --> T515

    T515 --> T516
    T515 --> T517
    T516 --> T518
    T517 --> T518
    T518 --> T519
    T519 --> T521
    T520 --> T521
```

---

## 5. 並列実行計画

| フェーズ | 並列実行可能タスク | 備考 |
|---------|-------------------|------|
| 1 | T501, T502, T503, T504, T505, T506, T520 | デモサイト作成 + コア変更 + ドキュメント（全独立） |
| 2 | T507, T509, T510, T511, T512, T513, T514 | 検出・表示 + クリックブロック（T504完了後） |
| 3 | T508 | Content Script（T507完了後） |
| 4 | T515 | ビルド確認（全実装完了後） |
| 5 | T516, T517 | 動作確認 + 回帰テスト（並列可） |
| 6 | T518 | デバッグ（テスト完了後） |
| 7 | T519 | デプロイ（デバッグ完了後） |
| 8 | T521 | コミット・PR（全タスク完了後） |

**見積もり**: 新規ファイルが多いがロジックはシンプル。デモサイトのHTML/CSS/SVG作成が最もボリュームがある部分。拡張機能側の変更は既存パターンの踏襲が中心。

---

## 6. 品質チェックリスト

- [x] すべてのタスクが要件IDと紐付いているか
- [x] Phase 4までの機能が全て維持されるか（回帰テストT517含む）
- [x] クリックブロックのテスト項目が含まれているか（T516）
- [x] 回帰テストが含まれているか（T517）
- [x] デプロイ手順が含まれているか（T519）
- [x] デモ手順書の更新が含まれているか（T520）
- [x] 並列実行の機会が最大化されているか
- [x] 著作権・商標に配慮しているか（T503, CON-P5-003）
