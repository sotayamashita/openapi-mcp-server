# OpenAPI 関連のディレクトリ構造

## 概要

このドキュメントでは、OpenAPI MCP Serverのディレクトリ構造について説明します。プロジェクトは主に以下の要素で構成されています：

1. `/examples` - MCPサーバーからアクセスするテスト用サーバーとOpenAPI仕様
2. `/src` - コアとなるソースコード
3. `/tests` - テストコード

## ディレクトリ構造の詳細

### examples/

テスト目的でMCPサーバからアクセスするためのサーバーとOpenAPI仕様が含まれています。

```
examples/
└── versions/
    ├── 3.0.0/
    │   ├── simple/                # シンプルな例
    │   │   ├── server.ts
    │   │   └── openapi.yml
    │   ├── complex-refs/          # refを含めた複雑な例
    │   │   ├── server.ts
    │   │   └── openapi.yml
    │   ├── auth-basic/            # Basic認証の例
    │   │   ├── server.ts
    │   │   └── openapi.yml
    │   ├── auth-bearer/           # Bearerトークン認証の例
    │   │   ├── server.ts
    │   │   └── openapi.yml
    │   └── auth-apikey/           # APIキー認証の例
    │       ├── server.ts
    │       └── openapi.yml
    └── 3.1.0/
        ├── 3.0.0の繰り返し
```

### src/ （既存実装からの変更なし）

ソースコードが含まれており、特に`openapi`ディレクトリにはOpenAPIの各バージョンに対する実装が含まれています。

```
src/
└── openapi/
    ├── parser.ts    # OpenAPIパーサーの共通実装
    ├── schema.ts    # スキーマ定義
    ├── client.ts    # クライアント実装
    ├── index.ts     # エントリーポイント
    └── versions/    # 各バージョンの実装
        └── 3.0.0/   # OpenAPI 3.0.0の実装
            ├── parser.ts   # 3.0.0特有のパーサー実装
            └── schemas/    # 3.0.0特有のスキーマ
                └── processed/  # 処理済みスキーマ
```

### tests/

テストコードが含まれており、特に`openapi`ディレクトリにはOpenAPIの各バージョンに対するテストが含まれています。

```
tests/
└── openapi/
    ├── parser.test.ts    # 共通パーサーのテスト
    ├── schema.test.ts    # スキーマのテスト
    ├── client.test.ts    # クライアントのテスト
    ├── fixtures/
    │   └── versions/     # バージョン別フィクスチャ
    │       ├── 3.0.0/
    │       │   ├── simple.yaml                     # シンプルな例
    │       │   ├── complex-refs.yaml               # refを含めた複雑な例
    │       │   ├── auth-basic.yaml                 # Basic認証の例
    │       │   ├── auth-bearer.yaml                # Bearerトークン認証の例
    │       │   ├── auth-apikey.yaml                # APIキー認証の例
    │       └── 3.1.0/
    │           ├── simple.yaml                      # シンプルな例
    │           ├── complex-refs.yaml                # refを含めた複雑な例
    │           ├── auth-basic.yaml                  # Basic認証の例
    │           ├── auth-bearer.yaml                 # Bearerトークン認証の例
    │           └── auth-apikey.yaml                 # APIキー認証の例
    └── versions/         # 各バージョンのテスト
        ├── 3.0.0/        # 3.0.0特有のテスト
        │  ├── parser.test.ts                   # 3.0.0パーサーのテスト
        │  ├── simple/                          # シンプルな例のテスト
        │  │   ├── schema.test.ts              # シンプルなスキーマのテスト
        │  │   └── integration.test.ts         # シンプルな例の統合テスト
        │  ├── complex-refs/                    # refを含めた複雑な例のテスト
        │  │   ├── schema.test.ts              # 複雑なスキーマのテスト
        │  │   └── integration.test.ts         # 複雑な例の統合テスト
        │  ├── auth-basic/                      # Basic認証のテスト
        │  ├── schema.test.ts                   # Basic認証スキーマのテスト
        │  │   └── integration.test.ts         # Basic認証の統合テスト
        │  ├── auth-bearer/                     # Bearerトークン認証のテスト
        │  │   ├── schema.test.ts              # Bearerトークン認証スキーマのテスト
        │  │   └── integration.test.ts         # Bearerトークン認証の統合テスト
        │  └── auth-apikey/                     # APIキー認証のテスト
        │      ├── schema.test.ts               # APIキー認証スキーマのテスト
        │      └── integration.test.ts          # APIキー認証の統合テスト
        ├── 3.1.0/        # 3.1.0特有のテスト
            ├──  3.0.0の繰り返し
```

## ディレクトリ構造の説明

このプロジェクトは、OpenAPIの各バージョン（現在は3.0.0が実装済み）に対する実装とテストを体系的に管理するための構造になっています。

- `/examples`: MCPサーバーからアクセスするためのテスト用サーバーとOpenAPI仕様。各バージョンごと、各サンプルごとに独立した実装
- `/src/openapi`: コア実装。共通部分と各バージョン固有の実装を分離
- `/tests/openapi`: テストコード。共通テストとバージョン固有のテストを分離
  - `examples/`: サンプル実装に対応するテスト
  - `fixtures/versions/`: バージョン別のテスト用フィクスチャ
  - `versions/`: 各バージョン固有のテスト（単体テスト、統合テスト、スキーマテスト）

この構造により、OpenAPIの新しいバージョンをサポートする際にも、既存のコードに影響を与えずに拡張することが可能になっています。
