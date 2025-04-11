# OpenAPI Version Suport Plan for v3.0.0

## 1. 背景と目的

現在、`@scalar/openapi-types` の `OpenApiObjectSchema` は `v3.1.0` のみに対応。本計画では、3.0.0 に対応する独立したスキーマ実装を作成。

## 2. 既存実装の分析 ✅

1. OpenAPI `v3.1.0` の仕様を記録 ✅

   - Read: docs/openapi/versions/3.1.0/openapi-speccification-overview.md

2. `@scalar/openapi-types` の `OpenApiObjectSchema` の processed の以下の構造理解して記録 ✅

   - Read: docs/openapi/versions/3.1.0/openapi-schema-analysis.md

3. Step 1 の仕様書理解の結果と Step 2 のコード構造結果の関連付けて記録 ✅
   - Read: docs/openapi/versions/3.1.0/openapi-schema-specification-mapping.md

## 3. 3.0.0 の仕様確認と差分分析 ✅

### 3.1 仕様書の分析

1. OpenAPI 3.0.0 の仕様書を確認 ✅
   - Read: docs/openapi/versions/3.0.0/openapi-specification-overview.md

### 3.2 `v3.1.0` と 3.0.0 の差分を確認

1. 以下の観点で OpenAPI `v3.1.0` の仕様書との差分を記録 ✅
   - Read: docs/openapi/versions/3.0.0/openapi-version-diff-analysis.md

### 3.3 JSON Schemaベースの分析

1. OpenAPI 3.0.0 の JSON Schema を確認して、以下の観点で OpenAPI `v3.1.0` の JSON Schema と差分を記録 ✅
   - Read: docs/openapi/versions/3.0.0/json-schema-diff-analysis.md

## 4. OpenAPI 3.0.0 実装計画確立

Read: docs/codebase-structure.md

Read: docs/openapi/versions/3.0.0/openapi-version-support-detail-plan.md
