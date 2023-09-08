import { ButtplugOperator } from "./ButtplugOperator";
import { ScriptOperator } from "./ScriptOperator";
import { UIController, UItype } from "./UI";

export class Controller {
    ButtplugOperator: ButtplugOperator;
    ScriptOperator: ScriptOperator;
    UI: UIController;

    constructor() {
        this.ButtplugOperator = new ButtplugOperator();
        this.ScriptOperator = new ScriptOperator(this.ButtplugOperator);

        const UItypes: UItype = {
            Player: <HTMLMediaElement>document.getElementById("player")!,
            VibDeviceList: <HTMLOListElement>document.getElementById("VibDeviceList")!,
            RotatorDeviceList: <HTMLOListElement>(
                document.getElementById("RotatorDeviceList")!
            ),
            LinearDeviceList: <HTMLOListElement>(
                document.getElementById("LinearDeviceList")!
            ),
            TimeRoterScriptList: <HTMLOListElement>(
                document.getElementById("TimeRoterScriptList")!
            ),
            VorzeSAScriptList: <HTMLOListElement>(
                document.getElementById("VorzeSAScriptList")!
            ),
            FunscriptList: <HTMLOListElement>document.getElementById("FunscriptList"),
            FunscriptSlider: undefined
        };
        this.UI = new UIController(UItypes);

        this.addEvent();
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
    }

    public RefleshScriptLists() {
        const UI = this.UI;

        UI.ClearScriptLists();
        const v = this.ScriptOperator.Scripts.TimeRoter;
        const u = this.ScriptOperator.Scripts.Vorze_SA;
        const f = this.ScriptOperator.Scripts.Funscript;
        if (v) UI.AppendTimeRoterScriptList(v.Title);
        if (u) UI.AppendVorzeSAScriptList(u.Title);
        if (f) {
            UI.AppendFunscriptList(f.Title);
            UI.Elem.FunscriptSlider!.range_min = f.RangedMin;
            UI.Elem.FunscriptSlider!.range_max = f.RangedMax;
            UI.Elem.FunscriptSlider!.addEventListener("mouseup", () => {
                const min = UI.Elem.FunscriptSlider!.range_min;
                const max = UI.Elem.FunscriptSlider!.range_max;
                f.SetRange(min, max);
            })
        }
    }

    public addEvent() {
        console.log("addEvent() called.");

        const UI = this.UI;
        const getScriptOperator = () => this.ScriptOperator;

        UI.Elem.Player.addEventListener("timeupdate", () => {
            if (!UI.Elem.Player.paused)
                this.ScriptOperator.TimeUpdate(UI.Elem.Player.currentTime);
        });

        UI.Elem.Player.addEventListener("pause", () => this.ScriptOperator.Stop());
        UI.Elem.Player.addEventListener("ended", () => this.ScriptOperator.Stop());

        const scriptInput = <HTMLInputElement>(
            document.getElementById("scriptInput")!
        );
        scriptInput.addEventListener("input", (e) => {
            const file = scriptInput.files![0];
            const path = scriptInput.value;
            if (file != undefined) {
                let reader = new FileReader();
                reader.readAsText(file);
                reader.onload = () => {
                    if (reader.result) {
                        if (
                            this.ScriptOperator.LoadScript(<string>reader.result, path)
                        ) {
                            this.RefleshScriptLists();
                        }
                    }
                };
                reader.onerror = () => {
                    console.log(reader.error);
                };
            }
        });
        document.getElementById("scriptButton")!.addEventListener("click", (e) => {
            scriptInput?.click();
        });

        const mediaInput = <HTMLInputElement>document.getElementById("mediaInput")!;
        mediaInput.addEventListener("input", () => {
            const files = mediaInput.files;
            if (files)
                if (files[0].type.startsWith("video/")) {
                    UI.Elem.Player.src = URL.createObjectURL(files[0]);
                    UI.Elem.Player.style.height = "auto";
                } else if (files[0].type.startsWith("audio/")) {
                    UI.Elem.Player.src = URL.createObjectURL(files[0]);
                    UI.Elem.Player.style.height = "3em";
                }
            mediaInput.files = null;
        });
        document.getElementById("mediaButton")?.addEventListener("click", () => {
            mediaInput.click();
        });

        const offsetinput = <HTMLInputElement>document.getElementById("offset");
        offsetinput?.addEventListener("change", (e) => {
            this.ScriptOperator.Offset = Number(offsetinput.value);
        });

        document
            .getElementById("connectButton")!
            .addEventListener("click", async () => {
                await this.ButtplugOperator.ConnectDevice();
            });

        document
            .getElementById("connectServer")!
            .addEventListener("click", async () => {
                const urlelem = <HTMLInputElement>(
                    document.getElementById("serverURL")!
                );
                const result = await this.ButtplugOperator.connectToServer(
                    "ws://" + urlelem.value
                );
                const connectStatusElem = <HTMLElement>(
                    document.getElementById("connectStatus")!
                );
                if (result)
                    connectStatusElem.innerText = "接続中: " + urlelem.value;
                else connectStatusElem.innerText = "接続失敗";
            });

        this.ButtplugOperator.AddDevicesRefleshedEvents(() => this.RefleshDeviceLists());
    }
}
