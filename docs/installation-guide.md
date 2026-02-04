# Chrome拡張インストールガイド

FakeAdAlertDemo をローカル開発環境からChromeにインストールする手順です。

## 前提条件

- Node.js 20+ がインストール済み
- pnpm 9+ がインストール済み
- Chrome（最新版）がインストール済み

## 1. ビルド

```bash
# 依存関係のインストール（初回のみ）
pnpm install

# ビルド
pnpm build
```

ビルドが成功すると、`dist/` フォルダが生成されます。

## 2. Chromeへのインストール

1. Chromeで `chrome://extensions/` を開く

2. 右上の「デベロッパーモード」をONにする

   ![デベロッパーモード](https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/extensions-page-e702401975101.png)

3. 「パッケージ化されていない拡張機能を読み込む」をクリック

4. プロジェクトの `dist/` フォルダを選択
   ```
   fake-ad-alert-demo/dist
   ```

5. 「FakeAdAlertDemo」がインストールされ、ツールバーにアイコンが表示される

## 3. 動作確認

### Instagram での確認

1. https://www.instagram.com/ を開く（ログインが必要）

2. DevTools を開く（`F12` または `Cmd+Option+I`）

3. Console タブで以下のログが表示されることを確認:
   ```
   [FakeAdAlertDemo] Instagram Content Script loaded
   [FakeAdAlertDemo] Initializing on Instagram...
   ```

4. エラーが表示されていないことを確認

### Background Script の確認

1. `chrome://extensions/` を開く

2. FakeAdAlertDemo の「Service Worker」リンクをクリック

3. DevTools の Console で以下のログを確認:
   ```
   [FakeAdAlertDemo] Background Script loaded
   [FakeAdAlertDemo] Extension installed: install
   ```

## 4. 開発時の更新

コードを変更した後は以下の手順で更新します：

1. ビルドを再実行
   ```bash
   pnpm build
   ```

2. `chrome://extensions/` で FakeAdAlertDemo の更新ボタン（🔄）をクリック

3. 対象のSNSページをリロード

### Watch モード（自動リビルド）

開発中は watch モードを使用すると便利です：

```bash
pnpm dev
```

ファイル変更時に自動でリビルドされます。ただし、Chromeへの再読み込みは手動で行う必要があります。

## トラブルシューティング

### 拡張機能が読み込めない

- `dist/` フォルダが存在するか確認
- `pnpm build` でエラーが出ていないか確認
- `dist/manifest.json` が存在するか確認

### Content Script が動作しない

- 対象サイト（Instagram等）を完全にリロード
- 拡張機能を `chrome://extensions/` で更新
- DevTools の Console でエラーを確認

### 「Service Worker の登録に失敗しました」エラー

- 拡張機能を一度削除して再インストール
- Chromeを再起動
