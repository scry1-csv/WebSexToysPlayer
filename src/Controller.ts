import { ButtplugOperator } from "./ButtplugOperator";
import { ScriptOperator } from "./ScriptOperator";
import { UI } from "./UI";

export class Controller {
    ButtplugOperator: ButtplugOperator;
    ScriptOperator: ScriptOperator;
    UI: UI;

    constructor() {
        this.ButtplugOperator = new ButtplugOperator();
        this.ScriptOperator = new ScriptOperator(this.ButtplugOperator);

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


    public RefleshDeviceLists() {
        const UI = this.UI;
        UI.ClearDeviceLists();
        for (const d of this.ButtplugOperator.Devices.Viberators) {
            UI.AppendVibDeviceList(d.name);
        }
        for (const d of this.ButtplugOperator.Devices.Rotators) {
            UI.AppendRotatorDeviceList(d.name);
        }
        for (const d of this.ButtplugOperator.Devices.Linears) {
            UI.AppendLinearDeviceList(d.name);
        }

        if (this.ButtplugOperator.Devices.UFOTW.length > 0) {
            for (const d of this.ButtplugOperator.Devices.UFOTW) {
                UI.AppendUFOTWDeviceList(d.name);
            }
            for (const li of UI.UFOTWsettingli) {
                (li as HTMLLIElement).style.display = "list-item";
            }
        }
        else
            for (const li of UI.UFOTWsettingli) {
                (li as HTMLLIElement).style.display = "none";
            }
    }

    public RefleshScriptLists() {
        const UI = this.UI;

        UI.ClearScriptLists();
        const timeroter = this.ScriptOperator.Scripts.TimeRoter;
        const vorzesa = this.ScriptOperator.Scripts.Vorze_SA;
        const funscript = this.ScriptOperator.Scripts.Funscript;
        const ufotw = this.ScriptOperator.Scripts.UFOTW;
        if (timeroter) UI.AppendTimeRoterScriptList(timeroter.Title);
        if (vorzesa) UI.AppendVorzeSAScriptList(vorzesa.Title);
        if (ufotw) UI.AppendUFOTWScriptList(ufotw.Title);
        if (funscript) {
            UI.AppendFunscriptList(funscript.Title);
            UI.FunscriptSlider!.range_min = funscript.RangedMin;
            UI.FunscriptSlider!.range_max = funscript.RangedMax;
            UI.FunscriptSlider!.addEventListener("mouseup", () => {
                const min = UI.FunscriptSlider!.range_min;
                const max = UI.FunscriptSlider!.range_max;
                funscript.SetRange(min, max);
            });
        }
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
    }
}
