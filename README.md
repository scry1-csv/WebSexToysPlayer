# WebSexToysPlayer

## About

WebSexToysPlayer is a web app that plays scripts for sex toys with sync features (such as the Handy or U.F.O. SA) in sync with audio or video.

Compared to other web-based synchronized players, it has been designed to make the sync timing between audio/video and scripts as accurate as possible.

## Player URL

Standalone ver: [https://scry1-csv.github.io/WebSexToysPlayer-Pages/player_wasm.html](https://scry1-csv.github.io/WebSexToysPlayer-Pages/player_wasm.html)

Intiface ver: [https://scry1-csv.github.io/WebSexToysPlayer-Pages/player_intiface.html](https://scry1-csv.github.io/WebSexToysPlayer-Pages/player_intiface.html)

## Requirements
Standalone ver: A browser that supports WebBluetooth (Chrome, Edge, etc.)

## Setup

### For the Standalone version
Enable the WebBluetooth feature in your browser. Please refer to your browser's documentation for instructions.

### For the Intiface version
Install [Intiface Central](https://intiface.com/central/) on your device.

## How to Use

1. Intiface version only (not required for the Standalone version)
    1. Install <a href="https://intiface.com/central/">Intiface Central</a> on your device
    2. (If necessary) Replace "localhost:12345" at the top of the player screen with your Intiface server address
    3. Press "Connect to Buttplug Server" and wait for a successful connection
2. Make sure your device's Bluetooth and the linked device are powered on, then press "Connect Device"
3. If you are using the DG-Lab COYOTE 3.0, press "Connect Coyote" next to "Connect Device"
4. Load your video or audio and scripts, then start playback

## Supported Script Format

- Funscript
- Vorze [U.F.O. SA](https://www.vorze.jp/en/ufosa/) / [A10 Cyclone SA](https://www.vorze.jp/en/a10cyclonesa/) CSV
- Vorze [U.F.O TW](https://www.vorze.jp/en/ufotw/) CSV
- Time Rotor CSV
- CoyoteScript (a script format for controlling the COYOTE device. [See specification here](https://scry1-csv.github.io/WebSexToysPlayer-Pages/coyotescript.html))

## Simultaneous Interactivity

Currently, it is possible to simultaneously load and play one file for each of the three above formats. It is configured to control all compatible devices simultaneously for each script format (forward/backward movement, rotation, and vibration).

Therefore, it is not possible to control the U.F.O SA and A10 Cyclone SA separately with different scripts at this time. (Future support planned)

## Supported Devices
- U.F.O. SA
- U.F.O. TW
- the Handy
- [DG-Lab COYOTE 3.0](https://foryourpleasure.jp/products/coyote-e-stim-powerbox-3-0)
- Other devices compatible with vibration, rotation, and forward/backward movement via Buttplug ([List](https://iostindex.com/?filter0ButtplugSupport=7))

The A10 Cyclone SA, A10 Piston SA, etc. should also work, but we do not own them and have not confirmed their operation.

## Tested Devices

- U.F.O. SA
- U.F.O. TW
- the Handy
- MagicMotion Dante
- LOVENSE Domi2
- DG-Lab COYOTE 3.0

## Change Log

### March 3, 2026
- Added support for DG-Lab COYOTE 3.0
- Redesigned UI

### May 3, 2025
- Added force stop button

### March 19, 2024
- Added button and process to set offset +-0.1

### November 12, 2023
- Added option to control UFOTW by UFOSA script

### November 8, 2023

- Fixed previous UFOTW script remained in the list when reopening UFOTW scripts.
- Now displayed an error when trying to open non-media files using the "Open Video or Audio" button
- Tweaked some variable names

### November 7, 2023

- Added support for U.F.O. TW CSV
- Provided Standalone version and Intiface version

### September 8, 2023

- Added support for devices with forward/backward movement capabilities (Buttplug's LinearCmd compatible devices) like the Handy
- Now uses Intiface

### January 4, 2023

- Initial creation

## Library Used

[Buttplug JS](https://github.com/buttplugio/buttplug-rs-ffi/tree/master/js)

## License

MIT License

## Report Bug

Issue Tracker or [https://twitter.com/scry1\_](https://twitter.com/scry1_) (in English or Japanese )
