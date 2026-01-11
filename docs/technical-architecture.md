# 技術アーキテクチャ

## 概要

Margin Snap の技術的な設計方針とアーキテクチャを定義します。

---

## 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| フレームワーク | React Native | 0.81.x | クロスプラットフォーム開発 |
| プラットフォーム | Expo | SDK 54 | 開発環境・ビルド |
| ルーティング | Expo Router | 6.x | ファイルベースルーティング |
| 言語 | TypeScript | 5.x | 型安全性 |
| データベース | expo-sqlite | - | ローカルデータ永続化 |
| カメラ | expo-camera | - | 写真撮影 |
| 画像選択 | expo-image-picker | - | ギャラリーから選択 |
| ファイル操作 | expo-file-system | - | 画像ファイル管理 |
| 日付処理 | date-fns | - | 日付フォーマット・計算 |
| リスト仮想化 | @shopify/flash-list | - | 高パフォーマンスリスト |
| テスト | Jest + RTL | - | ユニット・統合テスト |

---

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│                      UI Layer                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Capture │ │Unsorted │ │  Books  │ │ Search  │       │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │
│       │           │           │           │             │
│  ┌────┴───────────┴───────────┴───────────┴────┐       │
│  │            Shared Components                 │       │
│  │    (NoteList, NoteCard, Filters, etc.)      │       │
│  └──────────────────┬──────────────────────────┘       │
└─────────────────────┼───────────────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────────────┐
│                     │   State Layer                     │
│  ┌──────────────────┴──────────────────────┐           │
│  │           React Context                  │           │
│  │  ┌─────────────┐  ┌─────────────┐       │           │
│  │  │NotesContext │  │BooksContext │       │           │
│  │  └──────┬──────┘  └──────┬──────┘       │           │
│  └─────────┼────────────────┼──────────────┘           │
└────────────┼────────────────┼───────────────────────────┘
             │                │
┌────────────┼────────────────┼───────────────────────────┐
│            │   Data Layer   │                           │
│  ┌─────────┴────────────────┴─────────┐                │
│  │           Repositories              │                │
│  │  ┌──────────────┐ ┌──────────────┐ │                │
│  │  │NoteRepository│ │BookRepository│ │                │
│  │  └──────┬───────┘ └──────┬───────┘ │                │
│  └─────────┼────────────────┼─────────┘                │
│            │                │                           │
│  ┌─────────┴────────────────┴─────────┐                │
│  │              SQLite                 │                │
│  └─────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

---

## データモデル

### ER図

```
┌─────────────────┐         ┌─────────────────┐
│      Note       │         │      Book       │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │    ┌───>│ id (PK)         │
│ photoUri        │    │    │ title           │
│ pageNumber      │    │    │ author          │
│ memo            │    │    │ volume          │
│ emotionStamp    │    │    │ coverUri        │
│ bookId (FK) ────┼────┘    │ createdAt       │
│ createdAt       │         │ updatedAt       │
│ updatedAt       │         └─────────────────┘
└─────────────────┘
```

### SQLite スキーマ

```sql
-- books テーブル
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  volume TEXT,
  cover_uri TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- notes テーブル
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  photo_uri TEXT,
  page_number INTEGER,
  memo TEXT,
  emotion_stamp TEXT,
  book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  -- 写真またはページ番号のいずれかが必須
  CHECK (photo_uri IS NOT NULL OR page_number IS NOT NULL)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_notes_book_id ON notes(book_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_books_updated_at ON books(updated_at);
```

### TypeScript 型定義

```typescript
// types/note.ts
export type EmotionStamp = '🙂' | '🤔' | '😮' | '✨' | '😢';

export interface Note {
  id: string;
  photoUri: string | null;
  pageNumber: number | null;
  memo: string | null;
  emotionStamp: EmotionStamp | null;
  bookId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteInput {
  photoUri?: string;
  pageNumber?: number;
  memo?: string;
  emotionStamp?: EmotionStamp;
  bookId?: string;
}

// types/book.ts
export interface Book {
  id: string;
  title: string;
  author: string | null;
  volume: string | null;  // 巻数（例: "1", "上", "前編"）
  coverUri: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookInput {
  title: string;
  author?: string | null;
  volume?: string | null;
  coverUri?: string | null;
}

// types/filter.ts
export type DateFilter = 'all' | 'today' | 'week' | 'month';
export type NoteStatusFilter = 'all' | 'unsorted' | 'sorted';
export type SortOrder = 'newest' | 'page';

export interface NoteFilter {
  dateFilter: DateFilter;
  emotionStamps: EmotionStamp[];
  statusFilter: NoteStatusFilter;
  bookId: string | null;
  searchQuery: string;
}
```

---

## Repository パターン

### NoteRepository

```typescript
// db/repositories/noteRepository.ts
export interface INoteRepository {
  // CRUD
  create(input: CreateNoteInput): Promise<Note>;
  findById(id: string): Promise<Note | null>;
  update(id: string, input: Partial<CreateNoteInput>): Promise<Note>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;

  // クエリ
  findAll(filter?: NoteFilter, sort?: SortOrder): Promise<Note[]>;
  findByBookId(bookId: string): Promise<Note[]>;
  findUnsorted(): Promise<Note[]>;
  search(query: string): Promise<Note[]>;
  count(filter?: NoteFilter): Promise<number>;

  // バッチ操作
  assignToBook(noteIds: string[], bookId: string): Promise<void>;
}
```

### BookRepository

```typescript
// db/repositories/bookRepository.ts
export interface IBookRepository {
  // CRUD
  create(input: CreateBookInput): Promise<Book>;
  findById(id: string): Promise<Book | null>;
  update(id: string, input: Partial<CreateBookInput>): Promise<Book>;
  delete(id: string): Promise<void>;

  // クエリ
  findAll(): Promise<Book[]>;
  findWithNoteCount(): Promise<(Book & { noteCount: number })[]>;
}
```

---

## 状態管理（React Context）

### NotesContext

```typescript
// contexts/NotesContext.tsx
interface NotesContextValue {
  notes: Note[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  createNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, input: Partial<CreateNoteInput>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  deleteNotes: (ids: string[]) => Promise<void>;
  assignToBook: (noteIds: string[], bookId: string) => Promise<void>;

  // Filters
  filter: NoteFilter;
  setFilter: (filter: Partial<NoteFilter>) => void;
  resetFilter: () => void;

  // Refresh
  refresh: () => Promise<void>;
}
```

### BooksContext

```typescript
// contexts/BooksContext.tsx
interface BooksContextValue {
  books: (Book & { noteCount: number })[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  createBook: (input: CreateBookInput) => Promise<Book>;
  updateBook: (id: string, input: Partial<CreateBookInput>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;

  // Refresh
  refresh: () => Promise<void>;
}
```

---

## 画像ファイル管理

### 保存方針

```
documents/
└── images/
    └── notes/
        ├── {note-id}-{timestamp}.jpg
        └── ...
```

### ImageService

```typescript
// services/imageService.ts
export interface IImageService {
  // 写真を保存してURIを返す
  savePhoto(uri: string): Promise<string>;

  // 写真を削除
  deletePhoto(uri: string): Promise<void>;

  // サムネイル生成（将来的に）
  generateThumbnail(uri: string): Promise<string>;
}
```

---

## ユーティリティ関数

### getBookDisplayName

本の表示名を統一的に生成するユーティリティ。

```typescript
// utils/bookDisplayName.ts
export function getBookDisplayName(book: { title: string; volume?: string | null }): string {
  if (book.volume) {
    return `${book.title} (${book.volume})`;
  }
  return book.title;
}
```

**使用箇所:**
- BookCard（本一覧）
- NoteCard（メモ一覧の本名表示）
- BookDetail（本詳細画面）
- BookSelect（本選択画面）
- NoteDetail（メモ詳細画面）

---

## ナビゲーション構造

```
app/
├── _layout.tsx              # ルートレイアウト
├── (tabs)/
│   ├── _layout.tsx          # タブレイアウト
│   ├── index.tsx            # キャプチャタブ
│   ├── unsorted.tsx         # 未整理タブ
│   ├── books.tsx            # 本タブ
│   └── search.tsx           # 検索タブ
├── note/
│   ├── _layout.tsx          # メモ詳細レイアウト
│   └── [id].tsx             # メモ詳細
├── book/
│   ├── _layout.tsx          # 本関連レイアウト
│   ├── new.tsx              # 本追加（モーダル）
│   ├── select.tsx           # 本選択（モーダル）
│   └── [id]/
│       ├── index.tsx        # 本詳細
│       └── edit.tsx         # 本編集（モーダル）
```

### 画面遷移図

```
[キャプチャ] ──保存──> [未整理]
     │
     │
[未整理] ──タップ──> [メモ一覧] ──タップ──> [メモ詳細]
                         │                    │
                         │                    ├──> [本選択]
                         │                    └──> [編集]
                         │
[本] ──タップ──> [メモ一覧（本フィルタ）]
  │
  └──新規──> [本追加]

[検索] ──────> [メモ一覧（検索結果）]
```

---

## エラーハンドリング

### エラー種別

```typescript
// types/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public isRecoverable: boolean = true
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', true);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', false);
  }
}

export class PermissionError extends AppError {
  constructor(message: string) {
    super(message, 'PERMISSION_ERROR', true);
  }
}
```

### エラー表示方針

| エラー種別 | 表示方法 |
|-----------|---------|
| バリデーションエラー | インラインメッセージ |
| 一時的なエラー | Toast / Snackbar |
| 致命的なエラー | フルスクリーンエラー画面 |

---

## パフォーマンス考慮

### 画像最適化

- 保存時に最大幅 1920px にリサイズ
- JPEG 品質 80%
- サムネイルは 200px 幅で生成

### リスト仮想化

- @shopify/flash-list を使用（大量メモ対応）
- expo-image による遅延読み込みとキャッシング
- estimatedItemSize による最適化

### データ再取得パターン

- `useFocusEffect` を使用して画面フォーカス時にデータを再取得
- モーダルから戻った際の変更反映に対応

### SQLite 最適化

- 適切なインデックス設計
- ページネーション対応
- トランザクション活用

---

## セキュリティ考慮

### データ保護

- すべてのデータはデバイスローカルに保存
- クラウド同期なし（MVP）
- 写真は FileSystem.documentDirectory に保存

### 入力検証

- SQLインジェクション対策（パラメータ化クエリ）
- ファイルパス検証

---

## 将来の拡張性

### 検討中の機能

| 機能 | 優先度 | 技術的考慮 |
|------|--------|-----------|
| クラウド同期 | 低 | Supabase / Firebase |
| OCR（写真からテキスト抽出） | 中 | ML Kit / Vision API |
| エクスポート | 中 | Share Sheet / Files |
| ウィジェット | 低 | expo-widgets |

### 拡張ポイント

- Repository インターフェースにより DB 実装を差し替え可能
- Context により状態管理を切り替え可能
- コンポーネントの再利用性を考慮した設計

---

## 開発環境

### 推奨環境

- Node.js 20.x
- npm 10.x
- Xcode 15+ (iOS開発)
- iOS Simulator または実機

### 開発コマンド

```bash
# 開発サーバー起動
npm start

# iOS シミュレータで実行
npm run ios

# 型チェック
npx tsc --noEmit

# Lint
npm run lint

# テスト
npm test
```

---

## 次のステップ

1. expo-sqlite, expo-camera 等のパッケージをインストール
2. データベーススキーマとマイグレーションを実装
3. Repository を実装
4. 基本的なナビゲーション構造を構築
