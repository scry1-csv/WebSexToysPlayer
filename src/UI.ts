import { SliderContainer } from "./SliderContainer";

export type UItype = {
    Player: HTMLMediaElement;
    VibDeviceList: HTMLOListElement;
    RotatorDeviceList: HTMLOListElement;
    LinearDeviceList: HTMLOListElement;
    TimeRoterScriptList: HTMLOListElement;
    VorzeSAScriptList: HTMLOListElement;
    FunscriptList: HTMLOListElement;
    FunscriptSlider: SliderContainer | undefined;
};

export class UIController {
    readonly Elem: UItype;

    constructor(ui: UItype) {
        this.Elem = ui;
    }

    private AppendToList(list: HTMLOListElement, str: string): HTMLLIElement {
        const li = document.createElement("li");
        const span = document.createElement("span")
        span.className = ("name");
        span.innerText = str;
        li.appendChild(span)
        list.appendChild(li);
        return li;
    }

    AppendVibDeviceList(str: string) {
        this.AppendToList(this.Elem.VibDeviceList, str);
    }
    AppendRotatorDeviceList(str: string) {
        this.AppendToList(this.Elem.RotatorDeviceList, str);
    }
    AppendLinearDeviceList(str: string) {
        this.AppendToList(this.Elem.LinearDeviceList, str);
    }
    AppendTimeRoterScriptList(str: string) {
        this.AppendToList(this.Elem.TimeRoterScriptList, str);
    }
    AppendVorzeSAScriptList(str: string) {
        this.AppendToList(this.Elem.VorzeSAScriptList, str);
    }

    AppendFunscriptList(str: string) {
        const e = this.AppendToList(this.Elem.FunscriptList, str);
        const slider = document.createElement("slider-container") as SliderContainer;
        e.appendChild(slider);
        slider.InitializeSlider();
        this.Elem.FunscriptSlider = slider;
    }

    ClearDeviceLists() {
        this.Elem.VibDeviceList.innerHTML = '';
        this.Elem.RotatorDeviceList.innerHTML = "";
        this.Elem.LinearDeviceList.innerHTML = "";
    }

    ClearScriptLists() {
        this.Elem.TimeRoterScriptList.innerHTML = '';
        this.Elem.VorzeSAScriptList.innerHTML = "";
        this.Elem.FunscriptList.innerHTML = "";
    }

    AddFunscriptSliderUpdateEvent(event: (min: number, max: number) => void) {
        const slider = this.Elem.FunscriptSlider;
        slider?.addEventListener("mouseup", () => {
            event(slider.range_min, slider.range_max);
        })
    }
}