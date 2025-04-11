# 001-refact-modular-codebase-organization

## 概要

このリファクタリング計画は、`openapi-mcp-server`のコードベースを再構成し、より堅牢で保守しやすく、テスト可能なアーキテクチャを構築することを目的としています。現在の単一ファイル（`src/index.ts`）は複数の責務を持っており、これを機能ごとに適切に分割することで、コードの可読性と保守性を向上させます。

## 目的

1. **責務の明確な分離**: 各モジュールが単一の責任を持つように設計
2. **コードの再利用性向上**: 重複コードを排除し、適切な抽象化を通じて再利用性を高める
3. **テスト容易性の向上**: 各モジュールが独立してテスト可能な構造に
4. **エラーハンドリングの強化**: 堅牢なエラー処理とバリデーションの実装
5. **拡張性の向上**: 将来の機能追加や変更が容易な構造の実現

## 実装状況

- [x] **CLI モジュール**

  - [x] `src/cli/args.ts`: コマンドライン引数処理の実装
  - [x] `src/cli/index.ts`: CLIエントリーポイントの実装
  - [x] テスト: `tests/cli/args.test.ts`の実装
  - [x] `src/index.ts`からCLIモジュールの利用

- [x] **Config モジュール**

  - [x] `src/config/index.ts`: 設定管理の実装
    - [x] 環境変数（BASE_URL, HEADERS）の読み込みと検証
    - [x] 環境変数BASE_URLを必須とし、OpenAPIスペックのservers情報に関わらず常に使用する設計
    - [x] HEADERSのJSON解析と適切なデフォルト値の提供
  - [x] テスト: `tests/config/index.test.ts`の実装
    - [x] 様々な環境変数パターンでのテストケース
    - [x] エラーケースのテスト

- [x] **MCP モジュール**

  - [x] `src/mcp/server.ts`: MCPサーバーコア機能の実装
    - [x] MCPサーバーの初期化と設定
    - [x] クライアントとの接続管理
    - [x] ツール登録と実行
    - [x] プロトコル準拠の保証
  - [x] `src/mcp/transport.ts`: トランスポート層の実装
  - [x] `src/mcp/index.ts`: モジュールのエクスポート設定
  - [x] テスト: MCPモジュールのテスト実装
    - [x] `tests/mcp/server.test.ts`: サーバー機能のテスト
    - [x] `tests/mcp/transport.test.ts`: トランスポートのテスト
    - [x] `tests/mcp/index.test.ts`: モジュール統合テスト

- [x] **OpenAPI モジュール**

  - [x] `src/openapi/client.ts`: クライアント生成・管理の実装
    - [x] Config モジュールから取得したBASE_URLをOpenAPIClientの生成時に使用
    - [x] Config モジュールから取得したHEADERSをクライアント設定に適用
  - [x] `src/openapi/parser.ts`: スペック解析の実装
    - [x] ファイルまたはURLからOpenAPIスペックを読み込み
    - [x] スキーマの検証と正規化
    - [x] operationIdが存在しない場合の自動生成機能
  - [x] `src/openapi/schema.ts`: スキーマ検証の実装
    - [x] スキーマのバリデーション機能
    - [x] パラメータスキーマのZod形式への変換
    - [x] operationIdの検証と代替ID生成
  - [x] テスト: OpenAPIモジュールのテスト実装
    - [x] `tests/openapi/schema.test.ts`: スキーマ関連機能のテスト
    - [x] `tests/openapi/parser.test.ts`: パーサー関連機能のテスト
    - [x] `tests/openapi/client.test.ts`: クライアント関連機能のテスト

- [x] **Tools モジュール**

  - [x] `src/tools/builder.ts`: ツール生成ロジックの実装
    - [x] OpenAPIスキーマからMCPツールへの変換ロジック
    - [x] Config モジュールとOpenAPIモジュールを連携させたMCPツール生成
  - [x] `src/tools/executor.ts`: ツール実行処理の実装
    - [x] リクエストURLの構築時にOpenAPIスペックのserversではなくConfig.baseUrlを使用
    - [x] パラメータの適切な処理と検証
    - [x] ツールの実行結果のフォーマット処理
  - [x] テスト: Toolsモジュールのテスト実装
    - [x] `tests/tools/builder.test.ts`: ツール生成機能のテスト
    - [x] `tests/tools/executor.test.ts`: ツール実行機能のテスト

- [ ] **Utils モジュール**

  - [ ] `src/utils/http.ts`: HTTP関連ユーティリティの実装
  - [ ] `src/utils/validation.ts`: バリデーションヘルパーの実装
  - [ ] テスト: Utilsモジュールのテスト実装

- [x] **Types モジュール**
  - [x] `src/types/index.ts`: 共通型定義の実装
    - [x] ツール関連の型定義（ToolExecutor、ToolResponse、ToolContentItem）
    - [x] OpenAPI関連の型定義（Parameter、Operation）
    - [x] MCP SDKとの型互換性の確保

## 提案するディレクトリ構造

```
src/
├── cli/
│   ├── args.ts       # コマンドライン引数の処理
│   └── index.ts      # CLIエントリーポイント
├── config/
│   └── index.ts      # 設定管理（環境変数など）
├── mcp/
│   ├── server.ts     # MCPサーバーのコア機能
│   └── transport.ts  # トランスポート層の抽象化
├── openapi/
│   ├── client.ts     # OpenAPI クライアント生成と管理
│   ├── parser.ts     # OpenAPI スペックの解析
│   └── schema.ts     # スキーマ検証とパース
├── tools/
│   ├── builder.ts    # MCP ツール生成ロジック
│   └── executor.ts   # ツール実行と結果ハンドリング
├── utils/
│   ├── http.ts       # HTTP関連ユーティリティ
│   └── validation.ts # バリデーションヘルパー
├── types/
│   └── index.ts      # 型定義
└── index.ts           # アプリケーションのエントリーポイント
```

## 各ディレクトリの責務

### 1. `cli/`

- `args.ts`: コマンドライン引数の処理、パースと検証
- `index.ts`: CLIのエントリーポイント、ユーザー入力と出力の管理

### 2. `config/`

- `index.ts`: 環境変数の読み込みと設定の管理
  - BASE_URL: API エンドポイントの指定（必須）
  - HEADERS: カスタムHTTPヘッダーの指定（オプション、JSON形式）
  - 設定のバリデーションとデフォルト値の提供

### 3. `mcp/`

- `server.ts`: MCPサーバーの初期化と管理
  - MCPサーバーのライフサイクル管理（初期化、接続、終了）
  - ツール、リソース、プロンプトの登録インターフェース提供
  - メッセージルーティングとハンドリング
- `transport.ts`: 通信層の抽象化（StdioServerTransportなど）
  - 異なる通信方式（stdio、HTTP/SSEなど）の抽象化
  - クライアントとの双方向通信の実装

### 4. `openapi/`

- `client.ts`: OpenAPIクライアントの生成と管理
  - 環境変数BASE_URLを使用したクライアント設定
  - 環境変数HEADERSを使用したカスタムヘッダー設定
- `parser.ts`: OpenAPIスペックの解析とデリファレンス
- `schema.ts`: スキーマのバリデーションと変換

### 5. `tools/`

- `builder.ts`: OpenAPIからMCPツールを生成するロジック
  - OpenAPIのパス・オペレーション情報からMCPツール定義への変換
  - スキーマからのパラメータ型定義と説明の抽出
  - 環境設定を考慮したツール生成
- `executor.ts`: ツールの実行とレスポンス処理
  - 環境変数BASE_URLを使用したリクエストURL構築（OpenAPIのservers情報より優先）
  - パラメータ処理とリクエスト実行
  - レスポンスのMCP形式への変換

### 6. `utils/`

- `http.ts`: HTTP関連のユーティリティ関数
- `validation.ts`: 入力検証ヘルパー

### 7. `types/`

- `index.ts`: 共通の型定義

## 具体的なリファクタリング方針

### 1. Single Responsibility Principle (SRP)

- 現在の単一ファイルを機能ごとに分割
- 各モジュールは単一の責務を持つように設計
- コード間の依存関係を明確にし、循環依存を排除

### 2. DRY (Don't Repeat Yourself)

- リクエスト構築ロジックを共通ユーティリティに抽出
- パラメータ処理を再利用可能な関数に整理
- 重複するバリデーションロジックの共通化

### 4. Separation of Concerns (SoC)

- CLIロジックとサーバーロジックの分離
- OpenAPI処理とMCPツール生成の分離
- 設定管理と実行ロジックの分離

### 5. Defensive Programming

- OpenApiSpecPathのnull/undefined検証
- APIレスポンスの適切なエラーハンドリング
- バリデーションとエラーメッセージの強化

## 実装計画

1. **フェーズ1**: 基本的なディレクトリ構造の作成と既存コードの分割

   - ディレクトリ構造のセットアップ
   - MCPモジュールの実装
   - 基本的なテストの追加

2. **フェーズ2**: エラーハンドリングと型安全性の強化

   - バリデーションの強化
   - エラーハンドリングの改善
   - 型定義の整備

3. **フェーズ3**: テストカバレッジの向上とドキュメント整備
   - ユニットテストの拡充
   - 統合テストの追加
   - ドキュメントの更新

## 期待される効果

- **保守性の向上**: 明確に分離された責務により、コードの理解と修正が容易に
- **品質の向上**: テストカバレッジの増加によるバグの減少
- **拡張性の向上**: 新機能の追加が容易に
- **開発効率の向上**: モジュール単位での開発とテストが可能に
- **チームでの開発効率**: コードの責務が明確になることで、並行開発が容易に

## 追加の考慮事項

- **依存性注入**: 柔軟なテストとモック化のための依存性注入パターンの活用
- **ログ機能の強化**: 適切なログレベルとフォーマットの導入
- **設定の柔軟化**: 環境変数や設定ファイルによる設定の外部化
  - BASE_URLとHEADERSの適切な取り扱い
  - OpenAPIスペックのservers情報より環境変数の設定を優先
- **バージョン管理**: APIバージョンの管理と互換性の確保
- **パフォーマンス最適化**: 必要に応じたキャッシングやその他の最適化手法の導入

## モジュール間の依存関係

### コア依存関係

- **MCPモジュール**: 他のモジュールに依存せず独立して機能可能

  - MCPの基本プロトコル実装を担当
  - ツールの登録インターフェースを提供するが、具体的な実装には依存しない
  - OpenAPIに関する知識を持たず、純粋にMCPプロトコルの実装に集中

- **Toolsモジュール**: MCPモジュールとOpenAPIモジュールに依存

  - OpenAPIスキーマをMCPツール形式に変換
  - 変換したツールをMCPサーバーに登録
  - ツール実行時のリクエスト構築と結果処理

- **OpenAPIモジュール**: Configモジュールに依存
  - 環境変数設定を使用したクライアント生成
  - スペック解析とバリデーション
