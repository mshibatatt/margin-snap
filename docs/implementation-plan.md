# 実装計画

## 概要

Margin Snap は紙の本を読みながらメモを記録し、後から整理・振り返るためのiOSアプリです。
本ドキュメントでは、MVPの実装計画をフェーズごとに定義します。

## 進捗サマリー

| フェーズ | 状態 | 完了日 |
|---------|------|--------|
| Phase 1: 基盤構築 | ✅ 完了 | - |
| Phase 2: メモ作成機能 | ✅ 完了 | - |
| Phase 3: メモ一覧・詳細機能 | ✅ 完了 | - |
| Phase 4: 本管理機能 | ✅ 完了 | - |
| Phase 5: 未整理・検索機能 | ✅ 完了 | - |
| Phase 6: 仕上げ・改善 | 🔲 未着手 | - |

---

## 実装フェーズ

### Phase 1: 基盤構築 ✅

**目標**: アプリの骨格となるナビゲーション・データ層・基本UIを構築する

#### 1.1 プロジェクト設定
- [x] app.json のアプリ名・スキーマを「Margin Snap」に更新
- [x] 必要なExpoパッケージの追加
  - `expo-camera` (写真撮影)
  - `expo-image-picker` (写真選択)
  - `expo-file-system` (画像保存) - v19の新API使用
  - `expo-sqlite` (ローカルDB)
  - `date-fns` (日付操作)
  - `uuid` (ID生成)
- [x] ESLint / Prettier 設定の調整

#### 1.2 データ層の実装
- [x] SQLiteスキーマ設計・マイグレーション
  - `notes` テーブル
  - `books` テーブル
- [x] データアクセス層（Repository パターン）
  - `NoteRepository` (`db/repositories/noteRepository.ts`)
  - `BookRepository` (`db/repositories/bookRepository.ts`)
- [x] React Context によるグローバル状態管理
  - `NotesContext` (`contexts/NotesContext.tsx`)
  - `BooksContext` (`contexts/BooksContext.tsx`)

#### 1.3 ナビゲーション構造
- [x] 4タブ構成への変更
  - キャプチャ (index.tsx)
  - 未整理 (unsorted.tsx)
  - 本 (books.tsx)
  - 検索 (search.tsx)
- [x] 共通レイアウトコンポーネント

**実装時の変更点**:
- expo-file-system v19で新しいクラスベースAPI（`Paths`, `File`, `Directory`）に移行
- React 19対応のため `JSX.Element` を `React.ReactElement` に変更

---

### Phase 2: メモ作成機能（キャプチャタブ） ✅

**目標**: 読書中に最速でメモを記録できる機能を実装する

#### 2.1 カメラ・写真機能
- [x] カメラプレビュー表示 (`components/capture/CameraView.tsx`)
- [x] 写真撮影機能
- [x] 撮り直し機能
- [x] 写真プレビュー表示
- [x] ギャラリーからの写真選択

#### 2.2 メモ入力フォーム
- [x] ページ番号入力 (`components/capture/PageNumberInput.tsx`)
- [x] 短文メモ入力 (`components/capture/MemoInput.tsx`)
- [x] 感情スタンプ選択 (`components/capture/EmotionStampPicker.tsx`)

#### 2.3 バリデーション・保存
- [x] 保存条件のバリデーション
  - 写真なし & ページなし → 保存不可
- [x] エラーメッセージ表示（アラート）
- [x] メモ保存処理
- [x] 保存成功フィードバック（フォームリセット）

**実装ファイル**:
- `app/(tabs)/index.tsx` - キャプチャ画面
- `components/capture/` - キャプチャ関連コンポーネント
- `services/imageService.ts` - 画像保存サービス

---

### Phase 3: メモ一覧・詳細機能 ✅

**目標**: 条件付きメモ一覧画面とメモ詳細画面を実装する

#### 3.1 条件付きメモ一覧画面（共通コンポーネント）
- [x] メモカード一覧表示 (`components/notes/NoteCard.tsx`)
  - 写真サムネイル
  - ページ番号
  - 感情スタンプ
  - 短文（1行）
  - 作成日時
  - 本タイトル表示
- [x] ソート機能（新しい順 / 古い順 / ページ順）
- [x] 複数選択モード（長押しで開始）
- [x] 一括操作（本にまとめる / 削除）

#### 3.2 フィルタ機能 (`components/notes/FilterBar.tsx`)
- [x] 期間フィルタ（すべて / 今日 / 7日 / 30日）
- [x] 感情スタンプフィルタ（複数選択可）
- [x] メモ状態フィルタ（すべて / 未整理 / 本あり）

#### 3.3 メモ詳細画面 (`app/note/[id].tsx`)
- [x] 写真表示
- [x] メモ情報表示
- [x] 編集機能（ページ番号、メモ、感情スタンプ）
- [x] 本への割り当て
- [x] 削除機能

**実装ファイル**:
- `components/notes/NoteCard.tsx` - メモカード
- `components/notes/NoteList.tsx` - メモリスト（選択モード付き）
- `components/notes/FilterBar.tsx` - フィルタUI
- `app/note/[id].tsx` - メモ詳細画面
- `app/book/select.tsx` - 本選択モーダル
- `app/book/new.tsx` - 新規本作成

---

### Phase 4: 本管理機能 ✅

**目標**: 本の作成・編集・一覧表示を実装する

#### 4.1 本一覧画面（本タブ）
- [x] 本カード一覧表示 (`components/books/BookCard.tsx`)
  - タイトル
  - メモ数
  - 最終更新日
- [x] 本の追加ボタン（FAB）
- [x] 長押しメニュー（編集 / 削除）

#### 4.2 本の追加・編集
- [x] 本タイトル入力 (`app/book/new.tsx`)
- [x] 編集モード (`app/book/[id]/edit.tsx`)
- [ ] 表紙画像設定（任意） - 未実装

#### 4.3 本詳細（メモ一覧への遷移）
- [x] 本タップで本詳細画面へ遷移 (`app/book/[id]/index.tsx`)
- [x] 本に属するメモのみ表示
- [x] フィルタ・ソート機能付き

**実装ファイル**:
- `app/(tabs)/books.tsx` - 本一覧タブ
- `components/books/BookCard.tsx` - 本カード
- `app/book/[id]/index.tsx` - 本詳細画面
- `app/book/[id]/edit.tsx` - 本編集画面
- `app/book/new.tsx` - 新規本作成
- `app/book/select.tsx` - 本選択モーダル

---

### Phase 5: 未整理・検索機能 ✅

**目標**: 未整理メモの処理と横断検索を実装する

#### 5.1 未整理タブ (`app/(tabs)/unsorted.tsx`)
- [x] 未整理フィルタを初期適用
- [x] フィルタ・ソート機能
- [x] 複数選択・一括操作

#### 5.2 検索タブ (`app/(tabs)/search.tsx`)
- [x] 検索バーUI (`components/notes/SearchBar.tsx`)
- [x] テキスト検索（短文メモ / 本タイトル / ページ番号）
- [x] フィルタUIとの連携
- [x] 検索結果表示
- [x] 結果件数表示

**実装ファイル**:
- `app/(tabs)/unsorted.tsx` - 未整理タブ
- `app/(tabs)/search.tsx` - 検索タブ
- `components/notes/SearchBar.tsx` - 検索バー

---

### Phase 6: 仕上げ・改善 🔲

**目標**: UX改善、パフォーマンス最適化、リリース準備

#### 6.1 UX改善
- [x] ローディング状態の表示（ActivityIndicator）
- [ ] エラーハンドリングの統一
- [ ] アニメーション・トランジション
- [ ] ハプティクスフィードバック

#### 6.2 パフォーマンス
- [ ] 画像の最適化・リサイズ
- [ ] リスト仮想化（大量メモ対応）- FlatList使用済み
- [ ] SQLiteクエリの最適化

#### 6.3 リリース準備
- [ ] アプリアイコン・スプラッシュ画面
- [ ] App Store用スクリーンショット
- [ ] プライバシーポリシー

---

## 依存パッケージ

| パッケージ | 用途 | 状態 |
|-----------|------|------|
| `expo-camera` | カメラアクセス | ✅ インストール済み |
| `expo-image-picker` | 写真選択 | ✅ インストール済み |
| `expo-file-system` | ファイル操作 | ✅ インストール済み (v19) |
| `expo-sqlite` | ローカルデータベース | ✅ インストール済み |
| `date-fns` | 日付操作 | ✅ インストール済み |
| `uuid` | ID生成 | ✅ インストール済み |

---

## ディレクトリ構成（実装済み）

```
margin-snap/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx       # タブナビゲーション
│   │   ├── index.tsx         # キャプチャタブ
│   │   ├── unsorted.tsx      # 未整理タブ
│   │   ├── books.tsx         # 本タブ
│   │   └── search.tsx        # 検索タブ
│   ├── note/
│   │   └── [id].tsx          # メモ詳細
│   ├── book/
│   │   ├── [id]/
│   │   │   ├── index.tsx     # 本詳細（メモ一覧）
│   │   │   └── edit.tsx      # 本編集
│   │   ├── new.tsx           # 本追加
│   │   └── select.tsx        # 本選択モーダル
│   ├── +not-found.tsx
│   └── _layout.tsx           # ルートレイアウト
├── components/
│   ├── capture/
│   │   ├── CameraView.tsx
│   │   ├── PageNumberInput.tsx
│   │   ├── MemoInput.tsx
│   │   ├── EmotionStampPicker.tsx
│   │   └── index.ts
│   ├── notes/
│   │   ├── NoteCard.tsx
│   │   ├── NoteList.tsx
│   │   ├── FilterBar.tsx
│   │   ├── SearchBar.tsx
│   │   └── index.ts
│   ├── books/
│   │   ├── BookCard.tsx
│   │   └── index.ts
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── ui/
│       └── icon-symbol.tsx
├── contexts/
│   ├── NotesContext.tsx
│   ├── BooksContext.tsx
│   └── index.ts
├── db/
│   ├── schema.ts
│   └── repositories/
│       ├── noteRepository.ts
│       ├── bookRepository.ts
│       └── index.ts
├── services/
│   └── imageService.ts
├── hooks/
│   └── use-color-scheme.ts
├── types/
│   ├── note.ts
│   ├── book.ts
│   ├── filter.ts
│   └── index.ts
├── constants/
│   └── theme.ts
└── docs/
    ├── planning.md
    ├── implementation-plan.md (このファイル)
    ├── user-stories.md
    ├── testing-strategy.md
    └── technical-architecture.md
```

---

## 技術的な注意点

### expo-file-system v19 API変更
従来の `FileSystem.documentDirectory` は廃止され、新しいクラスベースAPIに移行：

```typescript
// 旧API（非推奨）
import * as FileSystem from 'expo-file-system';
const dir = FileSystem.documentDirectory;

// 新API（v19）
import { Paths, File, Directory } from 'expo-file-system';
const dir = Paths.document;
const file = new File(dir, 'filename.jpg');
file.copy(destination);
```

### React 19 対応
`JSX.Element` 型は利用不可。代わりに `React.ReactElement` を使用：

```typescript
// 旧
function Component(): JSX.Element { ... }

// 新
function Component(): React.ReactElement { ... }
```

---

## 次のステップ

1. ~~[ユーザーストーリー](./user-stories.md) を確認~~ ✅
2. ~~[テスト戦略](./testing-strategy.md) を確認~~ ✅
3. ~~[技術アーキテクチャ](./technical-architecture.md) を確認~~ ✅
4. ~~Phase 1 から実装開始~~ ✅
5. **動作確認・テスト** ← 現在地
6. Phase 6（仕上げ・改善）の実装
