# 要件定義書 - FakeAdAlertDemo Phase 7: コンテンツ証明書VC埋め込み＋リアル検証

## 1. 概要

### 1.1 フェーズ目的

デモサイトのHTMLに実際のVC（Verifiable Credential）をSD-JWT形式で埋め込み、Chrome拡張がDID/VC EngineのVerify APIを呼び出してリアルタイム検証を行う。Phase 6までのモックVCベースの表示から、**実際のVC発行・検証フローを通したデモ**に進化させる。

### 1.2 背景

| 項目 | Phase 6まで（現状） | Phase 7（今回） |
|------|---------------------|-----------------|
| VC検証 | モックデータ（vc-mock.ts）で擬似表示 | DID/VC Engine `/v1/vc/verify` でリアル検証 |
| VC埋め込み | なし（Content Scriptが広告検出→モックVC参照） | `<script type="application/dc+sd-jwt">` でHTML埋め込み |
| 検証項目 | 静的な表示のみ | 署名検証、失効確認、フォーマット検証、発行者解決 |
| コンテンツ整合性 | なし | 将来フェーズで対応予定（Phase 7ではスコープ外） |

### 1.3 技術的背景

- **SD-JWT（Selective Disclosure JWT）**: IETF draft-ietf-oauth-sd-jwt-vc で標準化中のVC形式
- **メディアタイプ `application/dc+sd-jwt`**: IETF SD-JWT VC仕様で定義されたメディアタイプ。DID/VC Engineのデフォルトフォーマット
- **HTMLへのVC埋め込み**: `<script type="application/ld+json">` の構造化データ埋め込みパターンに倣い、`<script type="application/dc+sd-jwt">` でVCをインラインで配置する。これは既存の標準にはない独自のアプローチであり、Web記事版Content Credentialsの実験的実装
- **DID/VC Engineは2つのVCフォーマットに対応**: IETF形式（`dc+sd-jwt`、デフォルト）とW3C形式（`vc+sd-jwt`）。Strategy Patternで切り替え可能

### 1.4 スコープ

| 対象 | 内容 |
|------|------|
| 含む | デモサイトへのVC埋め込み、**全サイト対応のVC検出Content Script（vc-detector.ts）の新規追加**、Chrome拡張でのAPI検証・結果表示、manifest.json のhost_permissions追加 |
| 含まない | VC発行フローの変更、DID/VC Engine側の変更、バナー広告VCのリアル検証（サイトVCのみ対象）、W3C形式（vc+sd-jwt）対応 |

### 1.5 完了条件

- デモサイトの `<head>` にSD-JWT形式のVCが `<script>` タグで埋め込まれている
- Chrome拡張が**任意のWebサイト**でページロード時にVCを自動検出する
- 検出したVCをDID/VC Engine（review環境）のVerify APIに送信して検証する
- 検証結果（署名、失効、フォーマット、発行者）がサイドパネルに表示される
- 検証失敗時に適切なエラー表示がされる
- 既存のバナー広告検出・モックVC表示機能にデグレなし
- VCが埋め込まれた外部サイト（クライアントサイト等）でも検出・検証が動作する

### 1.6 前提条件

- [ASM-P7-001] Phase 0〜6が完了していること
- [ASM-P7-002] DID/VC Engine review環境（`https://zero-engine-review.vericerts.io`）が稼働していること
- [ASM-P7-003] review環境で発行済みのコンテンツ証明書VC（SD-JWT形式）が存在すること
- [ASM-P7-004] Chrome 114以上

---

## 2. 機能要件

### 2.1 デモサイトへのVC埋め込み

**[REQ-P7-001] HTMLへのVC埋め込み**
- デモサイト（`demo-site/index.html`）の `<head>` タグ内に、SD-JWT形式のVCを埋め込む
- 埋め込み形式:
  ```html
  <script id="content-proof-vc" type="application/dc+sd-jwt">
  eyJhbGciOi...（SD-JWT + disclosures）
  </script>
  ```
- `type="application/dc+sd-jwt"` はIETF SD-JWT VC仕様のメディアタイプに準拠
- `id="content-proof-vc"` でChrome拡張から一意に取得可能とする
- VCの内容はreview環境の管理画面から発行済みのコンテンツ証明書VCを使用する

### 2.2 Chrome拡張によるVC検出

**[REQ-P7-002] 全サイト対応のVC自動検出**
- VC検出専用の Content Script（`vc-detector.ts`）を新規作成し、`<all_urls>` で全サイトに注入する
- ページロード時に `<script type="application/dc+sd-jwt">` タグを検出する
- 検出されたVCのテキスト内容をBackground Scriptに転送する
- メッセージタイプ: `VC_DETECTED`（新規追加）
- VeriCertsのクライアントが自社サイトにVCを埋め込んだ場合も自動検出・検証できることが目的

**[REQ-P7-003] W3C形式への将来対応を考慮した検出ロジック**
- 将来的に `type="application/vc+sd-jwt"`（W3C形式）にも対応可能なセレクタ設計とする
- Phase 7では `dc+sd-jwt` のみ実装

**[REQ-P7-011] VC検出とデモサイト機能の分離**
- VC検出ロジック（`vc-detector.ts`）はデモサイトのバナー広告検出ロジック（`news-site.ts`）から完全に分離する
- `news-site.ts` は従来通り localhost / *.netlify.app のみで動作し、バナー広告検出・SITE_DETECTED・AD_DETECTEDを担当する
- `vc-detector.ts` は全サイトで動作し、VC_DETECTEDのみを担当する
- デモサイトでは両方のContent Scriptが並行動作する

### 2.3 VC検証（API連携）

**[REQ-P7-004] DID/VC Engine Verify API呼び出し**
- Background Scriptが `POST https://zero-engine-review.vericerts.io/v1/vc/verify` を呼び出す
- リクエストボディ: `{ "vc": "<SD-JWT文字列>" }`
- Chrome拡張の `host_permissions` を利用してCORS制約を回避する
- API呼び出しはBackground Service Workerから実行する（Content Scriptからではない）

**[REQ-P7-005] 検証結果の受信と解釈**
- APIレスポンスから以下の検証ステータスを取得する:
  - `signatureStatus`: 署名の有効性（valid / invalid）
  - `expiryStatus`: 有効期限（valid / expired）
  - `issuerStatus`: 発行者の信頼性（trusted / untrusted / unknown）
  - `revocationStatus`: 失効状態（valid / revoked / unavailable）
  - `formatStatus`: フォーマットの妥当性（valid / invalid）
  - `blockchainStatus`: ブロックチェーン検証（valid / skipped / etc.）
- `displayData` からクレーム情報（見出し、著者、公開日等）を取得する
- `metadata` から発行者DID、クレデンシャルタイプ等を取得する

**[REQ-P7-006] API呼び出しのエラーハンドリング**
- ネットワークエラー時: 「検証サーバーに接続できません」を表示
- APIエラーレスポンス時: エラーコードとメッセージを表示
- タイムアウト時（10秒）: 「検証がタイムアウトしました」を表示

### 2.4 サイドパネルへの検証結果表示

**[REQ-P7-007] サイトVCの検証結果表示**
- サイドパネルのサイトVC詳細エリアに、リアル検証結果を表示する
- 表示項目:
  - 検証ステータスサマリー（全項目パスの場合「検証済み」、一部失敗で「検証警告」、全失敗で「検証失敗」）
  - 各検証項目のステータス（署名、失効、フォーマット、発行者）をアイコン付きで表示
  - VCから取得したクレーム情報（headline, author, datePublished, editor, genre）
  - 発行者DID
- モックVCの表示（Phase 6）からの段階的移行: サイトVCのみリアル検証に切り替え、バナー広告VCは引き続きモック

**[REQ-P7-008] 検証中ステータス表示**
- API呼び出し中はローディング表示を出す
- サイドパネル上で「検証中...」とスピナーを表示

### 2.5 既存機能の互換性

**[REQ-P7-009] バナー広告検出の後方互換**
- バナー広告の検出・モックVC表示は変更しない
- サイトVCのみリアル検証に切り替える
- ストーリーバーの表示ロジックに影響を与えない

**[REQ-P7-010] Instagram/TikTok機能の互換性**
- Instagram/TikTok用のContent Scriptに変更を加えない
- Background Scriptの既存メッセージハンドラに影響を与えない

---

## 3. 非機能要件

**[NFR-P7-001] 検証レスポンス時間**
- Verify API呼び出しの応答は3秒以内を想定
- 10秒でタイムアウト

**[NFR-P7-002] セキュリティ**
- VCのSD-JWT文字列はページ上に公開情報として存在するため、秘匿の必要はない
- API呼び出しは認証不要のパブリックエンドポイント
- API呼び出しにはエンジン側のレート制限（60回/分）が適用される

---

## 4. 制約事項

**[CON-P7-001] review環境依存**
- Verify APIはreview環境（`https://zero-engine-review.vericerts.io`）を使用する
- review環境が停止している場合、検証機能は動作しない

**[CON-P7-002] IETF形式のみ**
- Phase 7では `dc+sd-jwt`（IETF形式）のみ対応する
- W3C形式（`vc+sd-jwt`）は将来フェーズで対応

**[CON-P7-003] サイトVCのみリアル検証**
- バナー広告VCのリアル検証は本フェーズのスコープ外
- バナー広告は引き続きモックVCで表示

---

## 5. 用語集

| 用語 | 説明 |
|------|------|
| SD-JWT | Selective Disclosure JWT。開示する項目を選択的に制御できるJWT拡張 |
| dc+sd-jwt | IETF SD-JWT VC仕様のメディアタイプ。Digital Credentialの略 |
| vc+sd-jwt | W3C VC Data Model準拠のSD-JWTメディアタイプ |
| DID | Decentralized Identifier。分散型識別子 |
| Verify API | DID/VC Engineの `POST /v1/vc/verify` エンドポイント。認証不要のパブリックAPI |
| Content Credentials | C2PA策定のデジタルコンテンツ来歴証明規格。本フェーズではVC/SD-JWTでWeb記事版を実験的に実装 |
| コンテンツ証明書VC | ニュース記事のメタデータ（headline, author, datePublished等）とコンテンツ整合性情報をVCとして発行したもの |
