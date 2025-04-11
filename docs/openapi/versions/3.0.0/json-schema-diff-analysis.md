# OpenAPI 3.0.0 と 3.1.0 の JSON Schema 差分分析

この文書では、OpenAPI 3.0.0 と 3.1.0 で使用されている JSON Schema の主要な差異を詳細に分析し、それらが Zod スキーマの実装に与える影響について考察します。

## 1. スキーマの構造的差異

### 1.1 JSON Schema バージョンの違い

| 項目             | v3.0.0                                  | v3.1.0                                       | 影響度 |
| ---------------- | --------------------------------------- | -------------------------------------------- | ------ |
| 準拠 JSON Schema | Draft 4 の修正サブセット                | Draft 2020-12 の完全実装                     | 大     |
| メタスキーマ URI | http://json-schema.org/draft-04/schema# | https://json-schema.org/draft/2020-12/schema | 中     |
| スキーマ宣言     | `$schema` 未使用                        | `jsonSchemaDialect` プロパティ導入           | 中     |

### 1.2 スキーマ構造の変化

| 構造要素               | v3.0.0             | v3.1.0                                             | 影響度 |
| ---------------------- | ------------------ | -------------------------------------------------- | ------ |
| トップレベル要件       | `paths` 必須       | `paths`、`components`、`webhooks` のいずれか必須   | 大     |
| Schema Object 参照構造 | 単純な `$ref` のみ | `$ref`, `$dynamicRef`, `$dynamicAnchor` をサポート | 大     |
| Webhooks               | 未サポート         | トップレベルオブジェクトとして追加                 | 大     |
| Discriminator          | OpenAPI 固有の実装 | より柔軟な実装                                     | 中     |

### 1.3 拡張プロパティの扱い

| 項目                   | v3.0.0                                                   | v3.1.0                                                                      | 影響度 |
| ---------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------- | ------ |
| 拡張プロパティパターン | `^x-` パターンプロパティ + `additionalProperties: false` | `$ref: "#/$defs/specification-extensions"` + `unevaluatedProperties: false` | 大     |
| 実装方法               | 各オブジェクトで個別に定義                               | 共通の `$defs/specification-extensions` 定義を使用                          | 中     |

## 2. バリデーションルールの差異

### 2.1 スキーマ検証メカニズムの変更

| 機能                                  | v3.0.0                                      | v3.1.0                                        | 影響度 |
| ------------------------------------- | ------------------------------------------- | --------------------------------------------- | ------ |
| `additionalProperties`                | 使用                                        | `unevaluatedProperties` に置き換え            | 大     |
| `exclusiveMinimum`/`exclusiveMaximum` | ブール値 (`minimum`/`maximum` と一緒に使用) | 数値 (単独で使用可能)                         | 中     |
| `dependencies`                        | サポート                                    | `dependentSchemas`/`dependentRequired` に分割 | 大     |

### 2.2 追加されたバリデーション機能

| 機能                        | v3.0.0     | v3.1.0   | 影響度 |
| --------------------------- | ---------- | -------- | ------ |
| `contentEncoding`           | 未サポート | サポート | 中     |
| `contentMediaType`          | 未サポート | サポート | 中     |
| `minContains`/`maxContains` | 未サポート | サポート | 小     |
| `dependentSchemas`          | 未サポート | サポート | 中     |
| `dependentRequired`         | 未サポート | サポート | 中     |
| `unevaluatedProperties`     | 未サポート | サポート | 大     |
| `unevaluatedItems`          | 未サポート | サポート | 中     |

## 3. 型定義の差異

### 3.1 データ型の表現方法

| 機能          | v3.0.0                      | v3.1.0                | 影響度 |
| ------------- | --------------------------- | --------------------- | ------ |
| 複数型の指定  | 不可 (単一の型のみ)         | 可能 (型の配列)       | 大     |
| null 値の扱い | `nullable: true` プロパティ | `type: ["X", "null"]` | 大     |
| const 値      | 未サポート                  | サポート              | 小     |

### 3.2 Schema Object の型表現

v3.0.0:

```json
{
  "type": "string",
  "nullable": true,
  "format": "email"
}
```

v3.1.0:

```json
{
  "type": ["string", "null"],
  "format": "email"
}
```

### 3.3 配列アイテムの型定義

v3.0.0:

```json
{
  "type": "array",
  "items": {
    "type": "string"
  }
}
```

v3.1.0 (同じ表現も可能ですが、以下のようなより詳細な制御が可能):

```json
{
  "type": "array",
  "prefixItems": [{ "type": "string" }, { "type": "number" }],
  "items": { "type": "boolean" }
}
```

## 4. 制約条件の差異

### 4.1 数値制約

| 制約               | v3.0.0   | v3.1.0 | 影響度 |
| ------------------ | -------- | ------ | ------ |
| `exclusiveMinimum` | ブール値 | 数値   | 中     |
| `exclusiveMaximum` | ブール値 | 数値   | 中     |

v3.0.0:

```json
{
  "type": "number",
  "minimum": 5,
  "exclusiveMinimum": true // 5より大きい
}
```

v3.1.0:

```json
{
  "type": "number",
  "exclusiveMinimum": 5 // 5より大きい
}
```

### 4.2 配列制約

| 制約                        | v3.0.0     | v3.1.0   | 影響度 |
| --------------------------- | ---------- | -------- | ------ |
| `contains`                  | 未サポート | サポート | 中     |
| `minContains`/`maxContains` | 未サポート | サポート | 小     |
| `unevaluatedItems`          | 未サポート | サポート | 中     |

### 4.3 オブジェクト制約

| 制約                    | v3.0.0                             | v3.1.0   | 影響度 |
| ----------------------- | ---------------------------------- | -------- | ------ |
| `dependentSchemas`      | 未サポート（`dependencies`を使用） | サポート | 中     |
| `dependentRequired`     | 未サポート（`dependencies`を使用） | サポート | 中     |
| `unevaluatedProperties` | 未サポート                         | サポート | 大     |
| `propertyNames`         | 未サポート                         | サポート | 小     |

### 4.4 パターンプロパティの扱い

v3.0.0では各オブジェクトで個別に定義:

```json
{
  "patternProperties": {
    "^x-": {}
  },
  "additionalProperties": false
}
```

v3.1.0では共通定義を参照:

```json
{
  "$ref": "#/$defs/specification-extensions",
  "unevaluatedProperties": false
}
```

## 5. Zodスキーマへの影響分析

### 5.1 型定義の変更が必要な箇所

1. **Schema Object**:

   - `type` フィールドの表現方法 (単一型 vs 配列型)
   - `nullable` プロパティの処理方法

   ```typescript
   // v3.0.0
   const SchemaObjectSchema = z.object({
     type: z
       .enum(["string", "number", "integer", "boolean", "array", "object"])
       .optional(),
     nullable: z.boolean().optional(),
     // その他のプロパティ
   });

   // v3.1.0
   const SchemaObjectSchema = z.object({
     type: z
       .union([
         z.enum([
           "string",
           "number",
           "integer",
           "boolean",
           "array",
           "object",
           "null",
         ]),
         z.array(
           z.enum([
             "string",
             "number",
             "integer",
             "boolean",
             "array",
             "object",
             "null",
           ]),
         ),
       ])
       .optional(),
     // nullable プロパティはない
     // その他のプロパティ
   });
   ```

2. **OpenAPI Object**:

   - `paths`フィールドの必須条件の変更
   - `webhooks`と`jsonSchemaDialect`フィールドの追加

   ```typescript
   // v3.0.0
   const OpenAPIObjectSchema = z.object({
     openapi: z.string().regex(/^3\.0\.\d(-.+)?$/),
     info: InfoObjectSchema,
     paths: PathsObjectSchema,
     // オプショナルフィールド
   });

   // v3.1.0
   const OpenAPIObjectSchema = z
     .object({
       openapi: z.string().regex(/^3\.1\.\d(-.+)?$/),
       info: InfoObjectSchema,
       paths: PathsObjectSchema.optional(),
       webhooks: WebhooksObjectSchema.optional(),
       jsonSchemaDialect: z
         .string()
         .url()
         .optional()
         .default("https://spec.openapis.org/oas/3.1/dialect/2024-11-10"),
       // オプショナルフィールド
     })
     .refine((data) => !!data.paths || !!data.components || !!data.webhooks, {
       message:
         "At least one of paths, components, or webhooks must be specified",
     });
   ```

### 5.2 バリデーションロジックの変更が必要な箇所

1. **数値バリデーション**:

   - `exclusiveMinimum`/`exclusiveMaximum` の処理方法

   ```typescript
   // v3.0.0
   if (schema.minimum !== undefined && schema.exclusiveMinimum === true) {
     zodSchema = zodSchema.gt(schema.minimum);
   } else if (schema.minimum !== undefined) {
     zodSchema = zodSchema.gte(schema.minimum);
   }

   // v3.1.0
   if (schema.exclusiveMinimum !== undefined) {
     zodSchema = zodSchema.gt(schema.exclusiveMinimum);
   } else if (schema.minimum !== undefined) {
     zodSchema = zodSchema.gte(schema.minimum);
   }
   ```

2. **拡張プロパティの処理**:

   - パターンプロパティからの変更

   ```typescript
   // v3.0.0 - 各スキーマで個別に定義
   const ComponentsObjectSchema = z
     .object({
       // 必須フィールド
     })
     .passthrough(); // x- プレフィックスに対応するため

   // v3.1.0 - 共通処理
   const withExtensions = <T extends z.ZodType>(schema: T) => {
     return schema.passthrough(); // unevaluatedProperties: false に相当
   };

   const ComponentsObjectSchema = withExtensions(
     z.object({
       // 必須フィールド
     }),
   );
   ```

### 5.3 完全に新規作成が必要なスキーマ

1. **Webhooks Object Schema**:

   ```typescript
   const WebhooksObjectSchema = z.record(
     z.string(),
     z.lazy(() => PathItemObjectSchema),
   );
   ```

2. **動的参照サポート**:

   ```typescript
   // $dynamicRef と $dynamicAnchor をサポートするロジック
   const dynamicRefSchema = z.object({
     $dynamicRef: z.string(),
   });

   const dynamicAnchorSchema = z.object({
     $dynamicAnchor: z.string(),
   });
   ```

3. **Specification Extensions Helper**:
   ```typescript
   // 拡張プロパティを統一的に処理するヘルパー
   const specificationExtensionsSchema = z.record(
     z.string().regex(/^x-/),
     z.any(),
   );
   ```

## 6. 実装戦略

### 6.1 アプローチ

1. **独立した実装**:

   - 3.0.0 と 3.1.0 の実装は完全に分離
   - 各バージョン専用の型定義とバリデーションを提供

2. **共通コードの最小化**:

   - 共通の基本型と関数は共有
   - バージョン固有のロジックは別々のモジュールに配置

3. **互換性レイヤー**:
   - 3.0.0 から 3.1.0 へのアップグレードパスを提供するユーティリティ関数
   - 特に `nullable` から型配列への変換などの重要な変更に対応

### 6.2 実装ステップ

1. 既存の 3.1.0 実装をベースとした基本構造の複製
2. 3.0.0 固有の要件に合わせた修正
3. バリデーションルールの適応
4. JSON Schema の差異に対応した型変換ロジックの実装
5. ユニットテストによる検証

## 7. まとめ

OpenAPI 3.0.0 と 3.1.0 の間の JSON Schema の主要な差異は、基礎となる JSON Schema のバージョン (Draft 4 vs Draft 2020-12) の変更、型定義の表現方法（特に複数型と null の扱い）、バリデーションルールの拡張、そして新しいスキーマ構造要素の導入にあります。

これらの差異を適切に処理するために、3.0.0 向けの Zod スキーマ実装は、特に型定義、バリデーションロジック、および必須フィールドの扱いにおいて、3.1.0 実装とは明確に区別される必要があります。最も重要な変更点は Schema Object の処理方法、特に `nullable` と `type` フィールドの扱いであり、互換性を確保するために慎重な実装が必要です。
