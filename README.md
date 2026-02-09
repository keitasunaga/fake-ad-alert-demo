# FakeAdAlertDemo

SNS上のフェイク広告を自動検出し、ユーザーに警告を表示するChrome拡張機能のデモアプリケーションです。

## 概要

Verifiable Credential認証のコンセプトを実演するためのデモ用Chrome拡張機能です。SNSフィード上の広告を自動検出し、以下のように表示します：

- **フェイク広告（未認証）**: 警告オーバーレイを表示
- **認証済み広告**: Verifiable Credential認証バッジを表示
- **サイドパネル**: DID/VC検証情報をブラウザ右側に常時表示、リアルタイム自動更新

> **Note**: 1つ1つの広告にVerifiable Credentialが付与される。そんな世界観をイメージしたデモ用アプリケーションです。現状は実際のVC（Verifiable Credentials）検証は行わず、広告主名のパターンマッチによるモック判定を行っています。

## 対応SNS

| SNS | ステータス |
|-----|-----------|
| Instagram | ✅ 対応済み（Phase 1） |
| TikTok | ✅ 対応済み（Phase 2） |
| YouTube | 将来対応予定 |

## 主な機能

### SNSフィード上の広告検出
- Instagram / TikTok のフィード、プロフィールページ、個別投稿で広告主を自動検出
- 認証済み広告には緑のバッジ、フェイク広告には赤い警告オーバーレイを表示

### サイドパネル（VC検証情報表示）
ツールバーアイコンをクリックすると、ブラウザ右側にサイドパネルが開き、VC検証情報をリアルタイム表示：
- **広告情報カード**: 広告主名、DID、カテゴリ、プラットフォーム
- **検証ステータスカード**: 署名、有効期限、失効状態、トラストレジストリ、ブロックチェーン
- **信頼チェーンカード**: 消費者庁 → 認定代理店 → 広告主 の階層表示
- **ブロックチェーン証明カード**: Network、TxHash、Contract

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
│   ├── content/           # Content Scripts（各SNS用）
│   │   ├── instagram.ts
│   │   └── tiktok.ts
│   ├── background/        # Background Script
│   │   └── index.ts
│   ├── sidepanel/         # サイドパネルUI（VC検証情報表示）
│   │   ├── index.html
│   │   ├── index.ts
│   │   └── style.css
│   ├── components/        # 共通UIコンポーネント
│   └── lib/               # ユーティリティ
│       ├── vc-types.ts    # VC型定義
│       ├── vc-mock.ts     # モックVC情報
│       ├── verifier.ts    # 判定ロジック
│       └── observer.ts    # DOM監視
├── config/
│   └── ad-verification.yml  # ホワイト/ブラックリスト
├── public/icons/          # 拡張機能アイコン
├── docs/                  # ドキュメント
└── .specs/                # 仕様書
```

## デモ実施

営業デモの手順については [docs/demo-guide.md](docs/demo-guide.md) を参照してください。

## 開発ロードマップ

- [x] **Phase 0**: 環境構築
- [x] **Phase 1**: Instagram対応（MVP）
- [x] **Phase 2**: TikTok対応
- [x] **Phase 3**: 仕上げ（ポップアップUI、アイコン、ドキュメント）
- [x] **Phase 4**: サイドパネル化（リアルタイム更新対応）

## ライセンス

Private - Demo purposes only
