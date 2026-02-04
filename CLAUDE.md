# CLAUDE.md - FakeAdAlertDemo

このファイルは Claude Code がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

**FakeAdAlertDemo** は、SNS上のフェイク広告（VC未認証）を自動検出し、ユーザーに警告を表示するChrome拡張機能のデモアプリケーションです。

### ターゲット
- 広告代理店（サイバーエージェント、電通、博報堂等）の役員向け営業デモ

### 主要機能
- SNSフィード上の広告を自動検出
- フェイク広告に警告オーバーレイを表示
- 認証済み広告にVeriCerts認証バッジを表示

### 対象SNS
1. **Instagram**（最優先）
2. **TikTok**（2番目）
3. **YouTube**（余力があれば）

## 技術スタック

| 項目 | 技術 |
|------|------|
| 種類 | Chrome Extension (Manifest V3) |
| 言語 | TypeScript |
| ビルド | Vite |
| スタイル | CSS |
| パッケージマネージャ | pnpm |

## ディレクトリ構成（予定）

```
fake-ad-alert-demo/
├── src/
│   ├── content/           # Content Scripts（各SNS用）
│   │   ├── instagram.ts
│   │   ├── tiktok.ts
│   │   └── youtube.ts
│   ├── background/        # Background Script
│   │   └── index.ts
│   ├── popup/             # ポップアップUI
│   │   ├── index.html
│   │   ├── index.ts
│   │   └── style.css
│   ├── components/        # 共通UIコンポーネント
│   │   ├── warning-overlay.ts
│   │   └── verified-badge.ts
│   └── lib/               # ユーティリティ
│       ├── detector.ts    # 広告検出ロジック
│       └── verifier.ts    # 判定ロジック
├── config/
│   └── ad-verification.yml  # ホワイト/ブラックリスト
├── public/
│   └── icons/             # 拡張機能アイコン
├── manifest.json          # Chrome拡張マニフェスト
├── CONCEPT.md             # コンセプトドキュメント
├── CLAUDE.md              # このファイル
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## CRITICAL RULES

### 1. パッケージマネージャ
**必ず pnpm を使用してください。npm は禁止です。**

```bash
# ✅ 正しい
pnpm install
pnpm add [package]
pnpm dev
pnpm build

# ❌ 禁止
npm install
npm run dev
```

### 2. Git Workflow
- **コミットメッセージ**: 必ず日本語で記述
- **ブランチ戦略**: 小規模デモなのでmainブランチで直接作業OK

### 3. Chrome拡張開発
- **Manifest V3** を使用（V2は非推奨）
- Content Scriptは各SNSごとに分離
- 本番のSNSでテストする際はDOM構造の変更に注意

## 開発コマンド

```bash
# 依存関係インストール
pnpm install

# 開発ビルド（watch mode）
pnpm dev

# 本番ビルド
pnpm build

# 型チェック
pnpm typecheck

# リント
pnpm lint
```

## Chrome拡張のロード方法

1. `pnpm build` でビルド
2. Chrome で `chrome://extensions/` を開く
3. 「デベロッパーモード」を有効化
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. `dist/` フォルダを選択

## 判定ロジック

### デモ用判定ルール
- `config/ad-verification.yml` でホワイトリスト/ブラックリストを管理
- 広告主名のパターンマッチで判定
- 実際のVC検証は行わない（モック）

### 判定フロー
```
広告検出
  ↓
広告主名を取得
  ↓
ホワイトリストにマッチ？ → ✅ 認証済みバッジ表示
  ↓ No
ブラックリストにマッチ？ → ⚠️ 警告オーバーレイ表示
  ↓ No
デフォルト → ⚠️ 未検証として警告表示
```

## UI仕様

### 警告オーバーレイ（フェイク広告）
- 赤系の半透明オーバーレイ
- ⚠️ アイコン + 「未認証広告」テキスト
- 「詐欺の可能性」の補足テキスト

### 認証バッジ（認証済み広告）
- 緑 or 青のバッジ
- ✅ アイコン + 「VeriCerts認証済み」テキスト
- 広告主名の横に表示

## トラブルシューティング

### Content Scriptが動作しない
- `manifest.json` の `matches` パターンを確認
- Chrome拡張をリロード（更新ボタン）
- コンソールでエラーを確認

### スタイルが適用されない
- CSS のスコープが他の要素と衝突していないか確認
- `!important` の使用を検討
- Shadow DOMの使用を検討

### SNSのDOM構造が変わった
- 各SNSは頻繁にDOM構造を変更する
- セレクタを更新する必要がある場合あり
- デモ前に必ず動作確認を行うこと

## 注意事項

1. **デモ専用**: このアプリは営業デモ用であり、本番環境での使用は想定していません
2. **VC検証はモック**: 実際のVC検証は行っておらず、広告主名のパターンマッチで判定しています
3. **SNSのDOM依存**: 各SNSのDOM構造変更により動作しなくなる可能性があります
4. **公開リポジトリ**: このリポジトリはパブリックです。機密情報をコミットしないでください
