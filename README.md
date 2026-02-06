# FakeAdAlertDemo

SNS上のフェイク広告を自動検出し、ユーザーに警告を表示するChrome拡張機能のデモアプリケーションです。

## 概要

Verifiable Credential認証のコンセプトを実演するためのデモ用Chrome拡張機能です。SNSフィード上の広告を自動検出し、以下のように表示します：

- **フェイク広告（未認証）**: 警告オーバーレイを表示
- **認証済み広告**: Verifiable Credential認証バッジを表示

> **Note**: １つ1つの広告にVerifiable Credentialが付与される。そんな世界観をイメージしたデモ用アプリケーションです。現状は実際のVC（Verifiable Credentials）検証は行わず、広告主名のパターンマッチによるモック判定を行ってます。

## 対応SNS

| SNS | ステータス |
|-----|-----------|
| Instagram | Phase 1で実装予定 |
| TikTok | Phase 2で実装予定 |
| YouTube | 将来対応予定 |

## 技術スタック

- **Chrome Extension** (Manifest V3)
- **TypeScript** 5.x
- **Vite** + @crxjs/vite-plugin
- **pnpm**

## 開発環境セットアップ

### 前提条件

- Node.js 20+
- pnpm 9+
- Chrome（最新版）

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/keitasunaga/fake-ad-alert-demo.git
cd fake-ad-alert-demo

# 依存関係をインストール
pnpm install

# ビルド
pnpm build
```

### Chromeへのインストール

1. `chrome://extensions/` を開く
2. 「デベロッパーモード」をONにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `dist/` フォルダを選択

詳細は [docs/installation-guide.md](docs/installation-guide.md) を参照してください。

## 開発コマンド

```bash
# 開発ビルド（watch mode）
pnpm dev

# 本番ビルド
pnpm build

# 型チェック
pnpm typecheck

# リント
pnpm lint
```

## プロジェクト構成

```
fake-ad-alert-demo/
├── src/
│   ├── content/          # Content Scripts（各SNS用）
│   ├── background/       # Background Script
│   ├── popup/            # ポップアップUI
│   ├── components/       # 共通UIコンポーネント
│   └── lib/              # ユーティリティ
├── config/               # 設定ファイル
├── public/icons/         # 拡張機能アイコン
├── docs/                 # ドキュメント
└── .specs/               # 仕様書
```

## 開発ロードマップ

- [x] **Phase 0**: 環境構築
- [ ] **Phase 1**: Instagram対応（MVP）
- [ ] **Phase 2**: TikTok対応
- [ ] **Phase 3**: 仕上げ（ポップアップUI、アイコン、ドキュメント）

## ライセンス

Private - Demo purposes only
