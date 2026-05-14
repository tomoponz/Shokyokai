# 知性の鏡会プロトコル / Cognitive Mirror Protocol

AIを神託化せず、人間の思考・欲望・矛盾・偏りを映す「鏡」として扱うためのメタ認知実践プロトコルの公開ドラフトです。

## 現在の状態

- 正式団体ではありません。
- 募集ページではなく、プロトコル公開サイトです。
- この更新では、倫理的リスク対応そのものではなく、公開サイトとしての体裁・導線・周辺ファイルを整えています。

## 主なファイル

- `index.html`：GitHub Pages 用トップページ
- `shokyokai.html`：同内容の予備ファイル
- `privacy.html`：プライバシー方針ドラフト
- `contact.html`：連絡・提案の方針ドラフト
- `workshop.html`：90分ワークショップ草案
- `changelog.html`：更新履歴
- `license.html`：ライセンス方針ドラフト
- `404.html`：GitHub Pages用404ページ
- `robots.txt`：検索エンジン向け設定
- `sitemap.xml`：サイトマップ
- `site.webmanifest`：PWA/ホーム画面用メタ情報
- `assets/`：favicon、OGP画像、Apple touch icon

## GitHub Pagesでの配置

リポジトリ直下にこのZIP内のファイルを配置してください。`index.html` がトップページとして表示されます。

## ライセンス

正式ライセンスは未確定です。候補は以下です。

- コード：MIT License
- 本文・プロトコル：CC BY 4.0
- 名称・ロゴ：別管理

詳細は `license.html` を参照してください。


## 機能プロトタイプ更新

以下のページを追加しました。

- `service.html`：機能ポータル
- `contact-form.html`：問い合わせフォーム
- `join.html`：会員登録・ログインのデモ
- `account.html`：保存データの確認・エクスポート・削除
- `workshop-apply.html`：ワークショップ申込フォーム
- `data-vault.html`：判断ログ・プロンプトレビュー保存
- `ai-chat.html`：AIチャット埋め込みUI
- `donate.html`：寄附ボタン・寄附意向フォーム
- `assets/css/feature.css`：機能ページ用CSS
- `assets/js/feature-store.js`：localStorageベースのデモ動作
- `assets/js/config.example.js`：本番接続用の設定テンプレート

### 注意

GitHub Pagesだけでは、実際の会員認証、フォーム送信、決済、AI API接続、サーバー保存はできません。今回の追加は、画面設計・入力設計・ローカル保存・JSONエクスポートのための静的プロトタイプです。
