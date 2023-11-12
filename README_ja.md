# WebSexToysPlayer

## 概要

WebSexToysPlayerは、the HandyやU.F.O. SA等の連動機能つき大人のオモチャ用のスクリプトを音声や動画と連動させて再生するwebアプリです。

他の Web 上の連動プレイヤーと比べて、音声や動画とスクリプトの連動タイミングができるだけ正確になるように工夫してあります。

## プレイヤー URL

単独動作版: [https://scry1-csv.github.io/WebSexToysPlayer-Pages/player_wasm.html](https://scry1-csv.github.io/WebSexToysPlayer-Pages/player_wasm.html)

Intiface接続版: [https://scry1-csv.github.io/WebSexToysPlayer-Pages/player_intiface.html](https://scry1-csv.github.io/WebSexToysPlayer-Pages/player_intiface.html)

## 動作環境
単独動作版: WebBluetoothに対応しているブラウザ ( Chrome, Edgeなど )

## 準備

### 単独動作版の場合
[こちらの解説](https://neos21.net/blog/2020/07/04-01.html)を参考にして、ブラウザのWebBluetooth機能をオンにしてください。

### Intiface版の場合
お使いの端末に、 [Intiface Central](https://intiface.com/central/) をインストールしてください。

## 使い方

1. Intiface版のみ ( 単独動作版では不要 )
    1. 使用している端末に <a href="https://intiface.com/central/">Intiface Central</a> をインストール</li>
    2. (必要なら)プレイヤー画面上部の「localhost:12345」をIntifaceのサーバアドレスに書き換え</li>
    3. 「Buttplugサーバーへ接続」を押して接続成功を待つ</li>
2. 端末のBluetoothと連動デバイスの電源がオンなのを確認してから「デバイス接続」を押す
3. 動画や音声とスクリプトを読み込んで再生

## 対応スクリプト

- Funscript
- U.F.O. SA / A10サイクロンSA用CSV
- U.F.O. TW用CSV
- タイムローター用CSV

## 同時連動について

現在のところ、上記のスクリプト3種類につき一度に1ファイルずつ読み込んでの同時連動が可能です。それぞれのフォーマットの動作（前後移動・回転・振動）に対応した各デバイスをすべて同時に動かすようになっています。
そのため、現時点ではU.F.O. SAとA10サイクロンSAを別々のスクリプトで連動させることはできません。（今後対応予定）

## 対応デバイス
- U.F.O. SA
- U.F.O. TW
- the Handy
- その他、Buttplugでの振動・回転・前後運動操作に対応したデバイス ( [リスト](https://iostindex.com/?filter0ButtplugSupport=7) )

A10サイクロンSAやA10ピストンSAなどでも動くはずですが、当方では未所持につき動作は確認しておりません。

## 動作確認済みデバイス

- U.F.O. SA
- U.F.O. TW
- the Handy
- MagicMotion Dante
- LOVENSE Domi2

## 更新履歴

### 2023.11.12
- UFOSA用のスクリプトでUFOTWを動かすオプションを追加

### 2023.11.8
- UFOTWのスクリプトを開き直した時に以前のファイルがリストに残ったままだったのを修正
- メディアファイルを開くボタンでメディア以外のファイルを開いた時にエラーを表示するように修正
- いくつかの変数名の微修正

### 2023.11.7
- U.F.O. TWに対応
- スタンドアローン版と Intiface 接続版を用意

### 2023.9.8

- the Handy等の前後移動デバイス（ ButtplugのLinearCmd対応デバイス）に対応
- Intifaceを利用するように

### 2023.1.4

- 作成

## 使用しているライブラリ

[Buttplug JS](https://github.com/buttplugio/buttplug-rs-ffi/tree/master/js)

## ライセンス

MIT License

## 不具合報告

リポジトリの Issues 又は [https://twitter.com/scry1\_](https://twitter.com/scry1_) まで
