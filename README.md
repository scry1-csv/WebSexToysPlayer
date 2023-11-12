# WebSexToysPlayer

## About

WebSexToysPlayer is a web-based sextoy script player.

Compared to other web-based script players, it has been devised so that the sync timing between script and media is as accurate as possible.

## Player URL

Standalone ver: [https://scry1-csv.github.io/WebSexToysPlayer-Pages/player_wasm.html](https://scry1-csv.github.io/WebSexToysPlayer-Pages/player_wasm.html)

Intiface ver: [https://scry1-csv.github.io/WebSexToysPlayer-Pages/player_intiface.html](https://scry1-csv.github.io/WebSexToysPlayer-Pages/player_intiface.html)

## Supported Script Format

- Funscript
- Vorze [U.F.O. SA](https://www.vorze.jp/en/ufosa/) / [A10 Cyclone SA](https://www.vorze.jp/en/a10cyclonesa/) CSV
- Vorze [U.F.O TW](https://www.vorze.jp/en/ufotw/) CSV
- [Time Roter](http://trance-innovation.com/lp_time/) CSV

## Simultaneous Interactivity

Currently, it is possible to simultaneously load and play one file for each of the three above formats. It is configured to control all compatible devices simultaneously for each script format (forward/backward movement, rotation, and vibration).

Therefore, it is not possible to control the U.F.O SA and A10 Cyclone SA separately with different scripts at this time. (Future support planned)

## Supported Devices
- Devices compatible with vibration, rotation, and forward/backward movement via Buttplug
([List](https://iostindex.com/?filter0ButtplugSupport=7) )

## Tested Devices
- U.F.O. SA
- U.F.O. TW
- the Handy
- MagicMotion Dante
- LOVENSE Domi2

## Change Log

## November 12, 2023
- Added option to control UFOTW by UFOSA script

## November 8, 2023

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
