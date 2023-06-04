import { ButtplugOperator } from "./ButtplugOperator";
import { ScriptOperator } from "./ScriptOperator";
import { UIController, UItype } from "./UI";

const UItypes: UItype = {
    Player: <HTMLMediaElement>document.getElementById("player")!,
    VibDeviceList: <HTMLOListElement>document.getElementById("VibDeviceList")!,
    UFOSADeviceList: <HTMLOListElement>(
        document.getElementById("UFOSADeviceList")!
    ),
    VibScriptList: <HTMLOListElement>document.getElementById("VibScriptList")!,
    UFOSAScriptList: <HTMLOListElement>(
        document.getElementById("UFOSAScriptList")!
    ),
};
const UI = new UIController(UItypes);

const gButtplugOperator = new ButtplugOperator();
const gScriptOperator = new ScriptOperator(gButtplugOperator)

function RefleshDeviceLists() {
    UI.ClearDeviceLists();
    for (const d of gButtplugOperator.Devices.Viberators) {
        UI.AppendVibDeviceList(d.Name);
    }
    for (const d of gButtplugOperator.Devices.Vorze_SA) {
        UI.AppendUFOSADeviceList(d.Name);
    }
}

function RefleshScriptLists() {
    UI.ClearScriptLists();
    const v = gScriptOperator.Scripts.Viberator;
    const u = gScriptOperator.Scripts.UFOSA;
    if(v)
        UI.AppendVibScriptList(v.Name);
    if(u)
        UI.AppendUFOSAScriptList(u.Name)
}

function addEvent()
{
    console.log("addEvent() called.")

    UI.Elem.Player.addEventListener("timeupdate",()=>{
        if (!UI.Elem.Player.paused)
            gScriptOperator.TimeUpdate(UI.Elem.Player.currentTime);
    });

    function video_stopped(e:any) {
        gScriptOperator.Stop();
    };
    UI.Elem.Player.addEventListener("pause", video_stopped);
    UI.Elem.Player.addEventListener("ended", video_stopped);

    const scriptInput = <HTMLInputElement>(
        document.getElementById("scriptInput")!
    );
    scriptInput.addEventListener("input", (e)=>{
        const file = scriptInput.files![0];
        const path = scriptInput.value;
        if (file != undefined) {
            let reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function () {
                if(reader.result)
                    if(gScriptOperator.LoadScript(<string>reader.result, path))
                        RefleshScriptLists();

            };
            reader.onerror = function () {
                console.log(reader.error);
            };
        }
    });
    document.getElementById("scriptButton")!.addEventListener("click",(e)=>
    {
        scriptInput?.click();
    });

    const mediaInput = <HTMLInputElement>(
        document.getElementById("mediaInput")!
    );
    mediaInput.addEventListener("input",()=>{
        const files = mediaInput.files;
        if (files)
            if (files[0].type.startsWith("video/"))
            {
                UI.Elem.Player.src = URL.createObjectURL(files[0]);
                UI.Elem.Player.style.height = "auto";
            }
            else if (files[0].type.startsWith("audio/"))
            {
                UI.Elem.Player.src = URL.createObjectURL(files[0]);
                UI.Elem.Player.style.height = "3em";
            }
            mediaInput.files = null;
    })
    document.getElementById("mediaButton")?.addEventListener("click", ()=>{
        mediaInput.click();
    });

    const offsetinput = <HTMLInputElement>document.getElementById("offset");
    offsetinput?.addEventListener("change",(e)=>{
        gScriptOperator.Offset = Number(offsetinput.value);
    });

    document
        .getElementById("connectButton")!
        .addEventListener("click", async () => {
            await gButtplugOperator.ConnectDevice();
            RefleshDeviceLists();
        });
};

async function main()
{
    console.log("main loaded.");
    addEvent();
    gButtplugOperator.Initialize();

}

window.onload = main