# テスト戦略

## 概要

Margin Snap の品質を担保するためのテスト戦略を定義します。
モバイルアプリの特性を考慮し、効率的かつ効果的なテストアプローチを採用します。

---

## テストピラミッド

```
         /\
        /  \      E2E テスト（少）
       /────\     - 主要フロー
      /      \
     /────────\   統合テスト（中）
    /          \  - 画面単位
   /────────────\ ユニットテスト（多）
  /              \ - ロジック・Repository
```

---

## テストレベル

### 1. ユニットテスト

**対象**
- データアクセス層（Repository）
- ビジネスロジック（ユーティリティ関数）
- バリデーション関数
- カスタムフック

**ツール**
- Jest
- React Testing Library（フック用）

**カバレッジ目標**: 80%以上

#### テストケース例

```typescript
// NoteRepository のテスト
describe('NoteRepository', () => {
  describe('create', () => {
    it('写真ありでメモを作成できる', async () => {});
    it('ページ番号ありでメモを作成できる', async () => {});
    it('写真・ページ両方なしでエラーになる', async () => {});
    it('作成日時が自動付与される', async () => {});
  });

  describe('findByBookId', () => {
    it('指定した本のメモのみ取得できる', async () => {});
    it('本がない場合は空配列を返す', async () => {});
  });

  describe('findUnsorted', () => {
    it('本に紐づいていないメモのみ取得できる', async () => {});
  });
});

// バリデーション関数のテスト
describe('validateNote', () => {
  it('写真ありならページなしでも有効', () => {});
  it('ページありなら写真なしでも有効', () => {});
  it('写真・ページ両方なしで無効', () => {});
  it('感情スタンプは任意', () => {});
});
```

---

### 2. 統合テスト

**対象**
- 画面コンポーネント
- Context と コンポーネントの連携
- ナビゲーションフロー

**ツール**
- Jest
- React Native Testing Library
- MSW（API モック、将来的に必要な場合）

**方針**
- 主要な画面ごとにテストファイルを作成
- ユーザー操作をシミュレート
- 状態変化を検証

#### テストケース例

```typescript
// キャプチャ画面のテスト
describe('CaptureScreen', () => {
  it('初期状態で保存ボタンが無効', () => {});
  it('ページ番号入力後に保存ボタンが有効になる', () => {});
  it('保存成功後にフォームがリセットされる', () => {});
  it('バリデーションエラー時にエラーメッセージが表示される', () => {});
});

// メモ一覧画面のテスト
describe('NoteListScreen', () => {
  it('メモがカード形式で表示される', () => {});
  it('ソート切り替えで並び順が変わる', () => {});
  it('フィルタ適用で表示件数が変わる', () => {});
  it('メモタップで詳細画面に遷移する', () => {});
});

// 本一覧画面のテスト
describe('BookListScreen', () => {
  it('本がカード形式で表示される', () => {});
  it('追加ボタンで追加画面に遷移する', () => {});
  it('本タップでメモ一覧に遷移する', () => {});
});
```

---

### 3. E2Eテスト

**対象**
- クリティカルパス（主要ユーザーフロー）

**ツール**
- Maestro（推奨）または Detox

**方針**
- 最小限のテストケースで主要フローをカバー
- CI/CD パイプラインで実行
- 実機またはシミュレータで実行

#### テストシナリオ

```yaml
# Maestro フロー例
# flow-create-note.yaml
appId: com.marginsnap.app
---
- launchApp
- assertVisible: "キャプチャ"
- tapOn: "123"  # ページ番号入力
- inputText: "42"
- tapOn: "🤔"  # 感情スタンプ選択
- tapOn: "保存"
- assertVisible: "保存しました"

# flow-assign-book.yaml
appId: com.marginsnap.app
---
- launchApp
- tapOn: "未整理"
- tapOn:
    id: "note-card-0"
- tapOn: "本に割り当て"
- tapOn: "新しい本を作成"
- inputText: "テスト本"
- tapOn: "作成"
- assertVisible: "テスト本"
```

#### E2Eテストケース一覧

| シナリオ | 優先度 | 説明 |
|---------|--------|------|
| メモ作成（写真） | P0 | 写真を撮ってメモを保存 |
| メモ作成（ページ番号） | P0 | ページ番号のみでメモを保存 |
| 未整理メモ確認 | P0 | 未整理タブでメモを確認 |
| 本へ割り当て | P0 | メモを本に割り当て |
| 検索 | P1 | キーワードでメモを検索 |
| 本一覧確認 | P1 | 本タブで本一覧を確認 |

---

## テスト環境

### ローカル開発

```bash
# ユニットテスト実行
npm test

# ウォッチモード
npm test -- --watch

# カバレッジレポート
npm test -- --coverage
```

### CI/CD（GitHub Actions）

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v4

  e2e-test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx expo prebuild --platform ios
      - run: brew install maestro
      - run: maestro test .maestro/
```

---

## テストデータ

### フィクスチャ

```typescript
// __fixtures__/notes.ts
export const mockNotes = {
  withPhoto: {
    id: '1',
    photoUri: 'file://photo1.jpg',
    pageNumber: null,
    memo: 'テストメモ',
    emotionStamp: '🤔',
    bookId: null,
    createdAt: new Date('2024-01-01'),
  },
  withPageOnly: {
    id: '2',
    photoUri: null,
    pageNumber: 42,
    memo: null,
    emotionStamp: null,
    bookId: null,
    createdAt: new Date('2024-01-02'),
  },
  withBook: {
    id: '3',
    photoUri: 'file://photo2.jpg',
    pageNumber: 100,
    memo: '重要な箇所',
    emotionStamp: '✨',
    bookId: 'book-1',
    createdAt: new Date('2024-01-03'),
  },
};

// __fixtures__/books.ts
export const mockBooks = {
  book1: {
    id: 'book-1',
    title: 'テスト本',
    coverUri: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-03'),
  },
};
```

---

## 品質ゲート

### PR マージ条件

- [ ] すべてのユニットテストがパス
- [ ] カバレッジが 80% 以上
- [ ] ESLint エラーなし
- [ ] TypeScript コンパイルエラーなし

### リリース条件

- [ ] すべての E2E テストがパス
- [ ] 実機での手動テスト完了
- [ ] パフォーマンス基準を満たす
  - 起動時間: 2秒以内
  - メモ保存: 500ms以内

---

## テスト優先度

### Phase 1 で必須

| テスト種別 | 対象 |
|-----------|------|
| ユニット | NoteRepository |
| ユニット | BookRepository |
| ユニット | validateNote |
| 統合 | CaptureScreen（保存フロー） |

### Phase 2 以降

| テスト種別 | 対象 |
|-----------|------|
| 統合 | NoteListScreen |
| 統合 | BookListScreen |
| E2E | 主要フロー |

---

## セットアップ手順

### Jest 設定追加

```bash
npm install --save-dev jest @types/jest ts-jest \
  @testing-library/react-native @testing-library/jest-native
```

### jest.config.js

```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
  collectCoverageFrom: [
    'db/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
};
```

---

## 次のステップ

1. Jest + Testing Library をセットアップ
2. Repository のユニットテストを作成
3. キャプチャ画面の統合テストを作成
4. CI パイプラインを構築
