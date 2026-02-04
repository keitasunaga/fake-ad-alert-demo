# Spec-based Issue Creation Template / 仕様書ベースIssue作成テンプレート

仕様書ディレクトリ `.specs/{SPEC_DIR}/` から GitHub Issue を自動生成するためのテンプレートです。

## 概要

`/spec-init` コマンドで作成された仕様書（requirement.md, design.md, tasks.md）から、構造化されたGitHub Issueを自動生成します。これにより、仕様策定から実装タスクへのスムーズな移行を実現します。

## 仕様書の構造

期待される仕様書ディレクトリ構造:
```
.specs/
└── {feature-name}/
    ├── requirement.md  # 要件定義書
    ├── design.md       # 設計書
    └── tasks.md        # タスクリスト
```

## Issue生成プロセス

### 1. 仕様書の解析

#### requirement.md からの抽出
```markdown
# 抽出対象
- タイトル: 最初の # 行から「要件定義書」を除いた部分
- 概要: ## 概要 セクションの内容
- 主な機能: ### で始まる機能セクション（番号付き）
- 技術要件: ## 技術要件 セクションの内容
```

#### tasks.md からの抽出
```markdown
# 抽出対象
- フェーズ: ## フェーズX: で始まる行
- タスク: 各フェーズ内の ### セクションと - [ ] 項目
- 完了条件: ## 完了の定義 セクションの内容
- 注意事項: ## 注意事項 セクションの内容
```

#### design.md からの抽出（オプション）
```markdown
# 必要に応じて抽出
- アーキテクチャ概要
- 技術的な詳細情報
```

### 2. Issue テンプレート

生成されるIssueの形式:

```markdown
# [Feature] {FEATURE_NAME}

## 概要

**⚠️ 重要: 実装を開始する前に、必ず以下の仕様書を熟読してください。**

{requirement.mdの概要セクションから抽出}

## 仕様書
`.specs/{SPEC_DIR}/` ディレクトリ参照
- [要件定義](../blob/develop/.specs/{SPEC_DIR}/requirement.md)
- [設計書](../blob/develop/.specs/{SPEC_DIR}/design.md)
- [タスクリスト](../blob/develop/.specs/{SPEC_DIR}/tasks.md)

## 主な機能
{requirement.mdから主要機能を箇条書きで抽出}
- 機能1
- 機能2
- 機能3

## 実装チェックリスト
{tasks.mdのフェーズごとにグループ化して生成}

### フェーズ1: {フェーズ名}（{期間}）
- [ ] タスク1
- [ ] タスク2
- [ ] タスク3

### フェーズ2: {フェーズ名}（{期間}）
- [ ] タスク1
- [ ] タスク2

## 技術スタック
{requirement.mdの技術要件から抽出、またはデフォルト値}
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- その他使用技術

## 完了条件
{tasks.mdの完了の定義から生成、存在しない場合はデフォルト}
- [ ] すべての必須機能が実装されている
- [ ] 国際化対応が完了している
- [ ] ドキュメントが更新されている
- [ ] コードレビューが完了している
- [ ] developブランチにマージされている

## 注意事項
{tasks.mdの注意事項から抽出、またはrequirement.mdの前提条件}
```

## 抽出ルールの詳細

### タイトル抽出
```bash
# requirement.md の最初の # 行から
grep -m1 "^# " requirement.md | sed 's/^# //' | sed 's/ 要件定義書$//'
```

### 概要抽出
```bash
# ## 概要 から次の ## までの内容
sed -n '/^## 概要/,/^##/p' requirement.md | grep -v "^##" | tail -n +2
```

### 主要機能抽出
```bash
# ### 1. のような番号付きセクション
sed -n '/^### [0-9]\./p' requirement.md | sed 's/^### [0-9]\. /- /'
```

### フェーズ・タスク抽出
```bash
# tasks.md から ## フェーズ を抽出
grep "^## フェーズ" tasks.md

# 各フェーズ内の主要タスクを簡略化して抽出
# 実際の実装では、より詳細な解析を行う
```
## エラーハンドリング

### 必須ファイルの確認
```bash
# requirement.md が存在しない場合
echo "エラー: requirement.md が見つかりません"

# tasks.md が存在しない場合
echo "警告: tasks.md が見つかりません。基本的なチェックリストを生成します"
```

### フォールバック処理
- セクションが見つからない場合はデフォルト値を使用
- 抽出に失敗した場合は手動入力を促す

## 実装における注意点

1. **文字エンコーディング**
   - UTF-8を前提とする
   - 日本語の適切な処理

2. **Markdownの構造**
   - ヘッダーレベルの一貫性を期待
   - リスト記法の統一性

3. **GitHubの制限**
   - Issue本文の最大文字数を考慮
   - 必要に応じて詳細は仕様書へのリンクに委ねる

4. **更新の容易性**
   - 仕様書が更新されてもIssueは自動更新されない
   - 重要な変更は手動でIssueに反映する必要がある

```

### 生成されるIssueの例
```markdown
# [Feature] メンバー管理機能

## 概要
組織管理者が自組織のメンバーを管理するための機能を実装する。
本機能は「メンバー一覧」と「メンバー招待」の2つの画面で構成される。

## 仕様書
`.specs/member-management/` ディレクトリ参照
- [要件定義](../blob/develop/.specs/member-management/requirement.md)
- [設計書](../blob/develop/.specs/member-management/design.md)
- [タスクリスト](../blob/develop/.specs/member-management/tasks.md)

## 主な機能
- メンバー一覧画面
- メンバー詳細画面
- メンバー招待画面

## 実装チェックリスト

### フェーズ1: 基盤構築（1-2日）
- [ ] 型定義の作成
- [ ] モックデータの作成

### フェーズ2: メンバー一覧画面（3-4日）
- [ ] ページコンポーネント作成
- [ ] MemberListコンポーネントの実装
- [ ] フィルタリング機能の実装

[以下省略]
```