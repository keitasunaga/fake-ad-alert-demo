# 要件定義書 - FakeAdAlertDemo Phase 0: 環境構築

## 1. 概要

### 1.1 フェーズ目的

Chrome拡張機能の開発基盤を構築し、空のContent ScriptがInstagram上で動作する状態を確立する。

### 1.2 スコープ

| 対象 | 内容 |
|------|------|
| 含む | プロジェクト初期化、ビルド環境、マニフェスト、雛形コード |
| 含まない | 広告検出ロジック、判定機能、UI表示（Phase 1以降） |

### 1.3 完了条件

Chrome拡張として読み込み、Instagramを開いたときにコンソールにログが出力されること。

---

## 2. 機能要件

**[REQ-P0-001] プロジェクト初期化**
- pnpmでプロジェクトを初期化する
- 必要な依存パッケージをインストールする
- npm scriptsを定義する（dev, build, typecheck, lint）

**[REQ-P0-002] TypeScript環境**
- TypeScript 5.xを使用する
- Chrome拡張開発に適した設定を行う
- 厳格モード（strict: true）を有効にする

**[REQ-P0-003] Viteビルド環境**
- Viteをビルドツールとして使用する
- @crxjs/vite-pluginでChrome拡張をビルドする
- watch modeで開発時の自動リビルドを可能にする

**[REQ-P0-004] Chrome拡張マニフェスト**
- Manifest V3形式で作成する
- Instagram, TikTok, YouTubeのhost_permissionsを設定する
- Content Script、Background Script、Popupを定義する

**[REQ-P0-005] ディレクトリ構成**
- src/content/: Content Scripts（SNS別）
- src/background/: Background Script
- src/popup/: ポップアップUI
- src/lib/: 共通ライブラリ
- config/: 設定ファイル
- public/icons/: 拡張機能アイコン

**[REQ-P0-006] Content Script雛形（Instagram）**
- Instagramで動作するContent Scriptを作成する
- DOMContentLoaded後に初期化処理を実行する
- コンソールにログを出力して動作確認できるようにする

**[REQ-P0-007] Background Script雛形**
- Service Workerとして動作するBackground Scriptを作成する
- 拡張機能インストール時のイベントをハンドリングする
- Content Scriptからのメッセージ受信の基盤を用意する

**[REQ-P0-008] 動作確認**
- ビルドした拡張機能をChromeに読み込む
- Instagramでコンソールログが出力されることを確認する
- エラーが発生しないことを確認する

---

## 3. 非機能要件

**[NFR-P0-001] ビルド速度**
- `pnpm build` が10秒以内に完了すること

**[NFR-P0-002] 開発体験**
- `pnpm dev` でwatch modeが起動し、ファイル変更時に自動リビルドされること

**[NFR-P0-003] 型安全性**
- `pnpm typecheck` でエラーが0件であること

---

## 4. 制約事項

**[CON-P0-001] パッケージマネージャ**
- pnpmを使用する（npm禁止）

**[CON-P0-002] Manifest V3**
- Chrome拡張はManifest V3形式とする（V2は非推奨）

**[CON-P0-003] @crxjs/vite-plugin互換性**
- Vite 5.xとの互換性を確認する
- 問題があれば代替ビルド方法を検討する

---

## 5. 前提条件

**[ASM-P0-001] 開発環境**
- Node.js 20+がインストール済み
- pnpm 9+がインストール済み
- Chrome（最新版）がインストール済み

**[ASM-P0-002] リポジトリ**
- GitHubリポジトリ `keitasunaga/fake-ad-alert-demo` が作成済み
- CONCEPT.md, CLAUDE.mdが存在する

---

## 6. 用語集

| 用語 | 定義 |
|------|------|
| Content Script | Chrome拡張がWebページに注入して実行するJavaScript |
| Background Script | Chrome拡張のバックグラウンドで動作するService Worker |
| Manifest V3 | Chrome拡張の最新マニフェスト形式 |
| @crxjs/vite-plugin | ViteでChrome拡張をビルドするためのプラグイン |
