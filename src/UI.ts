import { SliderContainer } from "./SliderContainer";

export class UI {
    readonly Player: HTMLMediaElement = <HTMLMediaElement>document.getElementById("player")!;

    readonly MediaNameSpan: HTMLElement = <HTMLMediaElement>document.getElementById("mediaNameSpan")!;

    readonly OffsetInput: HTMLInputElement = <HTMLInputElement>document.getElementById("offset")!;
    readonly UFOTWreverseLRli: HTMLOListElement = <HTMLOListElement>document.getElementById("UFOTWreverseLRli")!;
    readonly UFOTWreverseLRCheckbox: HTMLInputElement = <HTMLInputElement>document.getElementById("UFOTWreverseLRCheckbox")!;

    readonly VibDeviceList: HTMLOListElement = <HTMLOListElement>document.getElementById("VibDeviceList")!;
    readonly RotatorDeviceList: HTMLOListElement = <HTMLOListElement>document.getElementById("RotatorDeviceList")!;
    readonly LinearDeviceList: HTMLOListElement = <HTMLOListElement>document.getElementById("LinearDeviceList")!;
    readonly UFOTWDeviceList: HTMLOListElement = <HTMLOListElement>document.getElementById("UFOTWDeviceList")!;

    readonly TimeRoterScriptList: HTMLOListElement = <HTMLOListElement>document.getElementById("TimeRoterScriptList")!;
    readonly VorzeSAScriptList: HTMLOListElement = <HTMLOListElement>document.getElementById("VorzeSAScriptList")!;
    readonly FunscriptList: HTMLOListElement = <HTMLOListElement>document.getElementById("FunscriptList")!;
    readonly UFOTWScriptList: HTMLOListElement = <HTMLOListElement>document.getElementById("UFOTWScriptList")!;

    readonly ScriptInput: HTMLInputElement = <HTMLInputElement>(document.getElementById("scriptInput")!);
    readonly MediaInput: HTMLInputElement = <HTMLInputElement>document.getElementById("mediaInput")!;

    readonly ConnectServerButton: HTMLButtonElement | null = document.getElementById("connectServerButton") as HTMLButtonElement | null;
    readonly ConnectDeviceButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("connectDeviceButton")!;

    readonly ConnectStatusSpan: HTMLElement = <HTMLElement>document.getElementById("connectStatus")!;

    FunscriptSlider: SliderContainer | undefined;

    private AppendToList(list: HTMLOListElement, str: string): HTMLLIElement {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.className = ("name");
        span.innerText = str;
        li.appendChild(span);
        list.appendChild(li);
        return li;
    }

    AppendVibDeviceList(str: string) {
        this.AppendToList(this.VibDeviceList, str);
    }
    AppendRotatorDeviceList(str: string) {
        this.AppendToList(this.RotatorDeviceList, str);
    }
    AppendLinearDeviceList(str: string) {
        this.AppendToList(this.LinearDeviceList, str);
    }
    AppendUFOTWDeviceList(str: string) {
        this.AppendToList(this.UFOTWDeviceList, str);
    }
    AppendTimeRoterScriptList(str: string) {
        this.AppendToList(this.TimeRoterScriptList, str);
    }
    AppendVorzeSAScriptList(str: string) {
        this.AppendToList(this.VorzeSAScriptList, str);
    }
    AppendUFOTWScriptList(str: string) {
        this.AppendToList(this.UFOTWScriptList, str);
    }

    AppendFunscriptList(str: string) {
        const e = this.AppendToList(this.FunscriptList, str);
        const slider = document.createElement("slider-container") as SliderContainer;
        e.appendChild(slider);
        slider.InitializeSlider();
        this.FunscriptSlider = slider;
    }

    ClearDeviceLists() {
        this.VibDeviceList.innerHTML = '';
        this.RotatorDeviceList.innerHTML = "";
        this.LinearDeviceList.innerHTML = "";
    }

    ClearScriptLists() {
        this.TimeRoterScriptList.innerHTML = '';
        this.VorzeSAScriptList.innerHTML = "";
        this.FunscriptList.innerHTML = "";
        this.UFOTWScriptList.innerHTML = "";
    }

    AddFunscriptSliderUpdateEvent(event: (min: number, max: number) => void) {
        const slider = this.FunscriptSlider;
        slider?.addEventListener("mouseup", () => {
            event(slider.range_min, slider.range_max);
        });
    }
}