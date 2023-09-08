# WebSexToysPlayer

## 概要

WebSexToysPlayerは、the HandyやU.F.O SA等の連動機能つき大人のオモチャ用のスクリプトを音声や動画と連動させて再生するwebアプリです。

他の Web 上の連動プレイヤーと比べて、音声や動画とスクリプトの連動タイミングができるだけ正確になるように工夫してあります。

## プレイヤー URL

[https://scry1-csv.github.io/WebSexToysPlayer-Pages/](https://scry1-csv.github.io/WebSexToysPlayer-Pages/)

## 使い方

1. 使用している端末に [Intiface Central](https://intiface.com/central/) をインストール
2. (必要なら)プレイヤー画面上部の「localhost:12345」をIntifaceのサーバアドレスに書き換え
3. 「Buttplugサーバーへ接続」を押す
4. 接続に成功したら、端末のBluetoothと連動デバイスの電源がオンなのを確認してから「デバイス接続」を押す
5. 動画や音声とスクリプトを読み込んで再生

## 対応スクリプト

- Funscript
- U.F.O SA / A10サイクロンSA用CSV
- タイムローター用CSV

## 同時連動について

現在のところ、上記のスクリプト3種類につき一度に1ファイルずつ読み込んでの同時連動が可能です。それぞれのフォーマットの動作（前後移動・回転・振動）に対応した各デバイスをすべて同時に動かすようになっています。
そのため、現時点ではU.F.O SAとA10サイクロンSAを別々のスクリプトで連動させることはできません。（今後対応予定）

## 対応デバイス
- U.F.O SA
- the Handy
- その他、Buttplugでの振動・回転・前後運動操作に対応したデバイス ( [リスト](https://iostindex.com/?filter0ButtplugSupport=7) )

A10 サイクロンSAやA10ピストンSAなどでも動くはずですが、当方では未所持につき動作は確認しておりません。
U.F.O TWを接続した場合、左右同じ連動をすると思います。

## 動作確認済みデバイス

- U.F.O. SA
- the Handy
- MagicMotion Dante
- LOVENSE Domi2

## 更新履歴

### 2023.9.8

- the Handy 等の前後移動デバイス（Buttplug の LinearCmd 対応デバイス）に対応
- Intiface を利用するように

### 2023.1.4

- 作成

## 使用しているライブラリ

[Buttplug JS](https://github.com/buttplugio/buttplug-rs-ffi/tree/master/js)

## ライセンス

MIT License

## 不具合報告

リポジトリの Issues 又は [https://twitter.com/scry1\_](https://twitter.com/scry1_) まで
