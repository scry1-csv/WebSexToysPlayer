import { ButtplugOperator } from "./ButtplugOperator";
import { ScriptOperator, ScriptType } from "./ScriptOperator";
import { CoyoteOperator } from "./CoyoteOperator";
import { UI } from "./UI";


export class Controller {
    ButtplugOperator: ButtplugOperator;
    ScriptOperator: ScriptOperator;
    CoyoteOperator: CoyoteOperator;
    UI: UI;

    // Coyoteデバイスカードのキー定数
    private readonly COYOTE_DEVICE_KEY = "coyote";
    private readonly COYOTE_DEVICE_NAME = "DG-Lab Coyote V3";

    constructor() {
        this.ButtplugOperator = new ButtplugOperator();
        this.CoyoteOperator = new CoyoteOperator();
        this.ScriptOperator = new ScriptOperator(this.ButtplugOperator, this.CoyoteOperator);

        this.UI = new UI();


        this.addEvents();
    }

    public async ConnectWasm() {
        const status = this.UI.ConnectStatusSpan;
        status.innerText = "Buttplug準備中..";
        const result = await this.ButtplugOperator.connectWasm();
        if (result)
            status.innerText = "Buttplug準備完了";
        else
            status.innerText = "Buttplug準備に失敗しました";
    }

    private async ConnectServer() {
        const urlelem = <HTMLInputElement>(
            document.getElementById("serverURL")!
        );
        const status = this.UI.ConnectStatusSpan;
        status.innerText = "接続中...";
        const result = await this.ButtplugOperator.connectWebsocket("ws://" + urlelem.value);
        if (result)
            status.innerText = "接続成功: " + urlelem.value;
        else status.innerText = "接続失敗";
    }


    /**
     * Buttplugデバイスリストを刷新し、デバイスカードを動的生成する
     */
    public RefleshDeviceLists() {
        const UI = this.UI;
        UI.ClearDeviceLists();

        const devices = this.ButtplugOperator.Devices;

        // 振動デバイスのカードを生成
        for (const d of devices.Viberators) {
            const key = String(d.index);
            UI.AddDeviceCard(key, d.name, ["振動"], false);
        }

        // 回転デバイスのカードを生成
        for (const d of devices.Rotators) {
            const key = String(d.index);
            UI.AddDeviceCard(key, d.name, ["回転"], false);
        }

        // リニアデバイスのカードを生成
        for (const d of devices.Linears) {
            const key = String(d.index);
            UI.AddDeviceCard(key, d.name, ["前後運動"], false);
        }

        // UFOTWデバイスのカードを生成
        const hasUFOTW = devices.UFOTW.length > 0;
        for (const d of devices.UFOTW) {
            const key = String(d.index);
            UI.AddDeviceCard(key, d.name, ["UFOTW"], false);
        }

        // UFOTWが存在する場合のみUFOTW設定を表示
        for (const li of UI.UFOTWsettingli) {
            (li as HTMLLIElement).style.display = hasUFOTW ? "list-item" : "none";
        }

        if (this.CoyoteOperator.controller.isConnected) {
            UI.AddDeviceCard(this.COYOTE_DEVICE_KEY, this.COYOTE_DEVICE_NAME, ["Coyote"], true);
        }

        // デバイスカードのスクリプト選択肢を更新
        this._refreshScriptOptionsOnCards();
    }

    /**
     * 読込済みスクリプトリストを更新し、カードのスクリプト選択肢も更新する
     */
    public RefleshScriptLists() {
        const UI = this.UI;

        UI.ClearScriptLists();

        const scripts = this.ScriptOperator.Scripts;

        // 読込済みスクリプトをリストに追加し、script optionsを構築
        const options: { value: ScriptType; label: string; }[] = [];

        if (scripts.TimeRoter) {
            UI.AppendScriptList("TimeRoter", scripts.TimeRoter.Title);
            options.push({ value: "TimeRoter", label: `[TimeRoter] ${scripts.TimeRoter.Title}` });
        }
        if (scripts.Vorze_SA) {
            UI.AppendScriptList("Vorze_SA", scripts.Vorze_SA.Title);
            options.push({ value: "Vorze_SA", label: `[Vorze_SA] ${scripts.Vorze_SA.Title}` });
        }
        if (scripts.UFOTW) {
            UI.AppendScriptList("UFOTW", scripts.UFOTW.Title);
            options.push({ value: "UFOTW", label: `[UFOTW] ${scripts.UFOTW.Title}` });
        }
        if (scripts.CoyoteScript) {
            UI.AppendScriptList("CoyoteScript", scripts.CoyoteScript.Title);
            // Coyoteスクリプトは専用のため選択肢には含めない
        }
        if (scripts.Funscript) {
            UI.AppendFunscriptToList(scripts.Funscript.Title);
            options.push({ value: "Funscript", label: `[Funscript] ${scripts.Funscript.Title}` });
            UI.FunscriptSlider!.range_min = scripts.Funscript.RangedMin;
            UI.FunscriptSlider!.range_max = scripts.Funscript.RangedMax;
            UI.FunscriptSlider!.addEventListener("mouseup", () => {
                const min = UI.FunscriptSlider!.range_min;
                const max = UI.FunscriptSlider!.range_max;
                scripts.Funscript!.SetRange(min, max);
            });
        }

        // デバイスカードのスクリプト選択肢を更新
        UI.UpdateScriptOptions(options);
    }

    /**
     * スクリプト読み込み後にデバイスカードの選択肢を更新するユーティリティ
     */
    private _refreshScriptOptionsOnCards() {
        const scripts = this.ScriptOperator.Scripts;
        const options: { value: ScriptType; label: string; }[] = [];
        if (scripts.TimeRoter) options.push({ value: "TimeRoter", label: `[TimeRoter] ${scripts.TimeRoter.Title}` });
        if (scripts.Vorze_SA) options.push({ value: "Vorze_SA", label: `[Vorze_SA] ${scripts.Vorze_SA.Title}` });
        if (scripts.UFOTW) options.push({ value: "UFOTW", label: `[UFOTW] ${scripts.UFOTW.Title}` });
        if (scripts.Funscript) options.push({ value: "Funscript", label: `[Funscript] ${scripts.Funscript.Title}` });
        this.UI.UpdateScriptOptions(options);
    }

    OffsetValueChanged(value: number) {
        this.ScriptOperator.Offset = value;
    }

    OffsetPlusMinusButtonEvent(isPositive: boolean) {
        const input = this.UI.OffsetInput;
        let value = Number(input.value);
        if (isPositive)
            value += 0.1;
        else
            value -= 0.1;

        value = Math.round(value * 100) / 100;

        input.value = String(value);
        this.OffsetValueChanged(value);
    }

    LoadScript() {
        const file = this.UI.ScriptInput.files![0];
        if (file != undefined) {
            let reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => {
                if (reader.result) {
                    if (
                        this.ScriptOperator.LoadScript(<string>reader.result, file.name)
                    ) {
                        this.RefleshScriptLists();
                    }
                }
            };
            reader.onerror = () => {
                console.log(reader.error);
            };
        }
    }


    LoadMedia() {
        const UI = this.UI;
        const files = UI.MediaInput.files;
        if (files) {
            if (files[0].type.startsWith("video/")) {
                UI.Player.src = URL.createObjectURL(files[0]);
                UI.Player.style.height = "auto";
                UI.MediaNameSpan.innerText = files[0].name;
            } else if (files[0].type.startsWith("audio/")) {
                UI.Player.src = URL.createObjectURL(files[0]);
                UI.Player.style.height = "3em";
                UI.MediaNameSpan.innerText = files[0].name;
            } else {
                UI.MediaNameSpan.innerText = "このファイルは再生できません: " + files[0].name;
            }
            UI.MediaInput.files = null;
        }
    }

    public addEvents() {
        console.log("addEvent() called.");

        const UI = this.UI;

        UI.Player.addEventListener("timeupdate", () => {
            if (!UI.Player.paused)
                this.ScriptOperator.TimeUpdate(UI.Player.currentTime);
        });

        UI.Player.addEventListener("play", () => this.ScriptOperator.Start());
        UI.Player.addEventListener("pause", () => this.ScriptOperator.Stop());
        UI.Player.addEventListener("ended", () => this.ScriptOperator.Stop());

        UI.ScriptInput.addEventListener("input", () => { this.LoadScript(); });
        document.getElementById("scriptButton")!.addEventListener("click", () => {
            UI.ScriptInput?.click();
        });

        UI.MediaInput.addEventListener("input", () => { this.LoadMedia(); });
        document.getElementById("mediaButton")?.addEventListener("click", () => {
            UI.MediaInput.click();
        });

        UI.SeekButton?.addEventListener("click", () => {
            const h = Number(UI.SeekHourInput.value) || 0;
            const m = Number(UI.SeekMinuteInput.value) || 0;
            const s = Number(UI.SeekSecondInput.value) || 0;
            const time = h * 3600 + m * 60 + s;
            if (!isNaN(time) && isFinite(time)) {
                UI.Player.currentTime = time;
            }
        });

        UI.Player.addEventListener("loadedmetadata", () => {
            const duration = UI.Player.duration;
            if (isNaN(duration) || !isFinite(duration)) return;

            if (duration <= 60) {
                UI.SeekHourSpan.style.display = "none";
                UI.SeekMinuteSpan.style.display = "none";
            } else if (duration <= 3600) {
                UI.SeekHourSpan.style.display = "none";
                UI.SeekMinuteSpan.style.display = "";
            } else {
                UI.SeekHourSpan.style.display = "";
                UI.SeekMinuteSpan.style.display = "";
            }
        });

        UI.UFOTWreverseLRCheckbox.addEventListener("change", () => {
            this.ButtplugOperator.UFOTWReverseLR = this.UI.UFOTWreverseLRCheckbox.checked;
        });

        UI.VorzeSAScriptToUFOTWCheckbox.addEventListener("change", () => {
            this.ScriptOperator.VorzeSAScriptToUFOTW = this.UI.VorzeSAScriptToUFOTWCheckbox.checked;
        });

        UI.OffsetInput.addEventListener("change", () => {
            this.OffsetValueChanged(Number(UI.OffsetInput.value));
        });
        UI.OffsetPlusButton.addEventListener("click", () => this.OffsetPlusMinusButtonEvent(true));
        UI.OffsetMinusButton.addEventListener("click", () => this.OffsetPlusMinusButtonEvent(false));

        UI.ConnectDeviceButton.addEventListener("click", async () => {
            await this.ButtplugOperator.ConnectDevice();
        });

        if (UI.ConnectServerButton != null)
            UI.ConnectServerButton?.addEventListener("click", async () => this.ConnectServer());
        else
            this.ConnectWasm();

        this.ButtplugOperator.AddDevicesRefleshedEvents(() => this.RefleshDeviceLists());

        UI.ForceStopButton.addEventListener("click", () => {
            this.ButtplugOperator.ForceStopAllDevices();
            this.CoyoteOperator.Stop();
        });

        // デバイスカードのスクリプト選択変更イベントをScriptOperatorに伝達
        UI.OnDeviceScriptChanged = (deviceKey: string, scriptType: ScriptType) => {
            console.log(`デバイス ${deviceKey} のスクリプト割り当てを ${scriptType} に変更`);
            this.ScriptOperator.DeviceScriptAssignments.set(deviceKey, scriptType);
        };

        // Coyoteイベント
        UI.CoyoteConnectButton.addEventListener("click", async () => {
            await this.CoyoteOperator.controller.requestDevice();
            await this.CoyoteOperator.controller.connect();
        });

        this.CoyoteOperator.controller.on('connect', () => {
            // Coyoteデバイスカードを動的生成
            UI.AddDeviceCard(this.COYOTE_DEVICE_KEY, this.COYOTE_DEVICE_NAME, ["Coyote"], true);

            // 動的生成された強度入力にイベントを追加
            const minInput = document.getElementById("coyoteMinStrength") as HTMLInputElement;
            const maxInput = document.getElementById("coyoteMaxStrength") as HTMLInputElement;

            if (maxInput) {
                const strength = Number(maxInput.value);
                this.CoyoteOperator.controller.setStrength("A", strength);
                this.CoyoteOperator.controller.setStrength("B", strength);

                let count = 0;
                const intervalId = setInterval(() => {
                    this.CoyoteOperator.controller.sendWaveform("A", 10, 50);
                    this.CoyoteOperator.controller.sendWaveform("B", 10, 50);
                    count++;

                    if (count >= 6) {
                        clearInterval(intervalId);
                    }
                }, 100);
            }

            const updateCoyoteSettings = () => {
                const min = Number(minInput?.value ?? 30);
                const max = Number(maxInput?.value ?? 40);
                console.log(`Coyote settings changed: minStrength=${min}, maxStrength=${max}`);
                this.CoyoteOperator.UpdateSettings(min, max);
            };

            minInput?.addEventListener("change", updateCoyoteSettings);
            maxInput?.addEventListener("change", updateCoyoteSettings);
        });

        this.CoyoteOperator.controller.on('disconnect', () => {
            UI.RemoveDeviceCard(this.COYOTE_DEVICE_KEY);
        });
    }
}