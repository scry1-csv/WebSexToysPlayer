export type UItype = {
    Player: HTMLMediaElement;
    VibDeviceList: HTMLOListElement;
    UFOSADeviceList: HTMLOListElement;
    VibScriptList: HTMLOListElement;
    UFOSAScriptList: HTMLOListElement;
};

export class UIController {
    readonly Elem: UItype;

    constructor(ui: UItype) {
        this.Elem = ui;
    }

    private AppendToList(list: HTMLOListElement, str: string) {
        const e = document.createElement("li");
        e.innerText = str;
        list.appendChild(e);
    }

    AppendVibDeviceList(str: string) {
        this.AppendToList(this.Elem.VibDeviceList, str);
    }
    AppendUFOSADeviceList(str: string) {
        this.AppendToList(this.Elem.UFOSADeviceList, str);
    }
    AppendVibScriptList(str: string) {
        this.AppendToList(this.Elem.VibScriptList, str);
    }
    AppendUFOSAScriptList(str: string) {
        this.AppendToList(this.Elem.UFOSAScriptList, str);
    }

    ClearDeviceLists() {
        while (this.Elem.VibDeviceList.childNodes[0]) {
            this.Elem.VibDeviceList.removeChild(
                this.Elem.VibDeviceList.childNodes[0]
            );
        }
        while (this.Elem.UFOSADeviceList.childNodes[0]) {
            this.Elem.UFOSADeviceList.removeChild(
                this.Elem.UFOSADeviceList.childNodes[0]
            );
        }
    }

    ClearScriptLists() {
        while (this.Elem.VibScriptList.childNodes[0]) {
            this.Elem.VibScriptList.removeChild(
                this.Elem.VibScriptList.childNodes[0]
            );
        }
        while (this.Elem.UFOSAScriptList.childNodes[0]) {
            this.Elem.UFOSAScriptList.removeChild(
                this.Elem.UFOSAScriptList.childNodes[0]
            );
        }
    }
}