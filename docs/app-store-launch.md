# App Store ローンチ手順

## 概要

Margin SnapをApple App Storeに公開するための手順書です。

## 前提条件

- [x] Apple Developer Program 登録済み（年間$99）
- [x] EAS設定済み (`eas.json`)
- [x] Bundle ID: `com.mshibatatt.marginsnap`

## 作業チェックリスト

### 1. プライバシーポリシー ✅

- ファイル: `docs/privacy-policy.md`
- ホスティング: GitHub Pages
- URL: `https://[ユーザー名].github.io/margin-snap/privacy-policy`

**GitHub Pagesの設定:**
1. GitHubリポジトリ → Settings → Pages
2. Source: Deploy from a branch
3. Branch: main, /docs
4. Save

### 2. アプリ説明文 ✅

- ファイル: `docs/app-store-description.md`
- サブタイトル、説明文、キーワードを記載済み

### 3. スクリーンショット ⏳

**必要なサイズ:**
| サイズ | デバイス | 必須 |
|--------|----------|------|
| 6.7インチ | iPhone 15 Pro Max | ✅ |
| 6.5インチ | iPhone 11 Pro Max | ✅ |
| 5.5インチ | iPhone 8 Plus | オプション |

**撮影する画面（3〜5枚）:**
1. キャプチャ画面（カメラ）
2. メモ詳細画面
3. 本の一覧画面
4. 未整理メモ一覧
5. オンボーディング（任意）

**撮影方法:**
```bash
# Xcodeシミュレーターで起動
npm run ios

# シミュレーターで Cmd + S でスクリーンショット保存
```

### 4. App Store Connectでアプリ作成

1. [App Store Connect](https://appstoreconnect.apple.com) にログイン
2. 「マイApp」→「+」→「新規App」
3. 以下を入力:
   - プラットフォーム: iOS
   - 名前: Margin Snap
   - プライマリ言語: 日本語
   - Bundle ID: `com.mshibatatt.marginsnap`
   - SKU: `margin-snap-001`（任意の一意な文字列）

### 5. App Store Connect メタデータ入力

- アプリ説明文 (`docs/app-store-description.md` から)
- スクリーンショット
- プライバシーポリシーURL
- サポートURL
- カテゴリ: ブック
- 年齢制限: 4+

### 6. 本番ビルドと提出

```bash
# 本番ビルド
eas build --platform ios --profile production

# App Storeに提出
eas submit --platform ios
```

### 7. 審査

- 審査期間: 通常1〜3日
- 審査ガイドライン: https://developer.apple.com/app-store/review/guidelines/

## 参考リンク

- [Expo EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
