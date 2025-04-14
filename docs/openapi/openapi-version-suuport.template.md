<!--
Prompt (Do not edit):
docs/openapi-version-suuport.template.md のテンプレートを利用して vx.x.x に対応する計画書を docs/openapi/versions/x.x.x/ 以下に作成してください。
-->

# OpenAPI Version Support Template

## 1. 背景と目的

現在、`@scalar/openapi-types` の `OpenApiObjectSchema` は `v3.1.0` のみに対応。本計画では、{{TARGET_VERSION}} に対応する独立したスキーマ実装を作成。

## 2. 既存実装の分析

1. OpenAPI `v3.1.0` の仕様を記録 ✅

   - Read: docs/openapi/versions/3.1.0/openapi-speccification-overview.md

2. `@scalar/openapi-types` の `OpenApiObjectSchema` の processed の以下の構造理解して記録 ✅

   - Read: docs/openapi/versions/3.1.0/openapi-schema-analysis.md

3. Step 1 の仕様書理解の結果と Step 2 のコード構造結果の関連付けて記録 ✅
   - Read: docs/openapi/versions/3.1.0/openapi-schema-specification-mapping.md

## 3. {{TARGET_VERSION}} の仕様確認と差分分析

### 3.1 仕様書の分析

1. OpenAPI {{TARGET_VERSION}} の仕様書を確認

### 3.2 `v3.1.0` と {{TARGET_VERSION}} の差分を確認

1. 以下の観点で OpenAPI `v3.1.0` の仕様書との差分を記録
   1. オブジェクト構造的差異（追加/削除/変更）
   2. 必須フィールドの差異
   3. 各フィールドの意味論的差異
   4. デフォルト値の差異

### 3.3 JSON Schemaベースの分析

1. OpenAPI {{TARGET_VERSION}} の JSON Schema を確認して、以下の観点で OpenAPI `v3.1.0` の JSON Schema と差分を記録

   1. スキーマの構造的差異
   2. バリデーションルールの差異
   3. 型定義の差異
   4. 制約条件の差異

2. Step 1の結果からZodスキーマへの影響を分析
   1. 型定義の変更が必要な箇所
   2. バリデーションロジックの変更が必要な箇所
   3. 完全に新規作成が必要なスキーマ

## 4. OpenAPI {{TARGET_VERSION}} 実装計画確立

### 4.1 ディレクトリ構造

- Read: docs/codebase-structure.md

### 4.2 実装アプローチ

- 各バージョンの実装は独立しており、一方の変更が他方に影響しない
- ユーザーは明示的に必要なバージョンを選択できる
- 将来の新バージョン追加時にも同様のパターンで拡張可能
- 生成するファイルやディレクトリ構成は docs/openapi/versions/3.1.0/openapi-schema-analysis.md を参照し可能な同じ限り構造にする
  - 生成結果を @scalar/openapi-types に還元することを検討
