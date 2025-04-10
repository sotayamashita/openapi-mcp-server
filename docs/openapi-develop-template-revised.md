## 1. 背景と目的

現在、`@scalar/openapi-types` の `OpenApiObjectSchema` は `v3.1.0` のみに対応。本計画では、{{TARGET_VERSION}} に対応する独立したスキーマ実装を作成。

## 2. 既存実装の分析

1. OpenAPI `v3.1.0` の仕様を理解

   1. [OpenAPI 3.1.0 仕様書](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md)
   2. [OpenAPI 3.1 JSONスキーマ](https://spec.openapis.org/oas/3.1/schema/2025-02-13.html)

2. `@scalar/openapi-types` の `OpenApiObjectSchema` の processed の以下の構造理解して記録

   1. ディレクトリ構造とファイルの構成
   2. 主要なスキーマオブジェクトの定義方法
   3. インポート構造とモジュール分割の仕方

3. Step 1 の仕様書理解の結果と Step 2 のコード構造結果の関連付けて記録
   1. 各スキーマオブジェクトが OpenAPI `v3.1.0` の仕様のどの部分対応しているのか
   2. Zodスキーマでの表現方法（特に複雑な制約条件の実装方法）
   3. バリデーションロジックの詳細と特殊ケース処理

## 3. {{TARGET_VERSION}} の仕様確認と差分分析

### 3.1 仕様書ベースの分析

1. OpenAPI {{TARGET_VERSION}} の仕様書を確認して、以下の観点で OpenAPI `v3.1.0` の仕様書との差分を記録
   1. オブジェクト構造的差異（追加/削除/変更）
   2. 必須フィールドの差異
   3. 各フィールドの意味論的差異
   4. デフォルト値の差異

### 3.2 JSON Schemaベースの分析

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

### 4.1 実装アプローチ

- 各バージョンの実装は独立しており、一方の変更が他方に影響しない
- ユーザーは明示的に必要なバージョンを選択できる
- 将来の新バージョン追加時にも同様のパターンで拡張可能

  4.2 基本アーキテクチャ

TBD
