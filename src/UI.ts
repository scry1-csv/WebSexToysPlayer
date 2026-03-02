import { SliderContainer } from "./SliderContainer";
import { ScriptType } from "./ScriptOperator";
import * as C from "./Const";

export class UI {
    readonly Player: HTMLMediaElement = <HTMLMediaElement>document.getElementById("player")!;

    readonly MediaNameSpan: HTMLElement = <HTMLMediaElement>document.getElementById("mediaNameSpan")!;

    readonly OffsetInput: HTMLInputElement = <HTMLInputElement>document.getElementById("offset")!;
    readonly OffsetPlusButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("offsetPlusButton")!;
    readonly OffsetMinusButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("offsetMinusButton")!;

    readonly UFOTWsettingli = document.getElementsByClassName("UFOTWsettingli")!;
    readonly UFOTWreverseLRCheckbox: HTMLInputElement = <HTMLInputElement>document.getElementById("UFOTWreverseLRCheckbox")!;
    readonly VorzeSAScriptToUFOTWCheckbox: HTMLInputElement = <HTMLInputElement>document.getElementById("VorzeSAScriptToUFOTWCheckbox")!;

    // デバイスカードを動的生成するコンテナ
    readonly DeviceListContainer: HTMLElement = document.getElementById("DeviceListContainer")!;

    // 統合スクリプトリスト
    readonly ScriptList: HTMLUListElement = <HTMLUListElement>document.getElementById("ScriptList")!;

    readonly ScriptInput: HTMLInputElement = <HTMLInputElement>(document.getElementById("scriptInput")!);
    readonly MediaInput: HTMLInputElement = <HTMLInputElement>document.getElementById("mediaInput")!;
    readonly SeekHourSpan: HTMLElement = document.getElementById("seekHourSpan")!;
    readonly SeekMinuteSpan: HTMLElement = document.getElementById("seekMinuteSpan")!;
    readonly SeekSecondSpan: HTMLElement = document.getElementById("seekSecondSpan")!;
    readonly SeekHourInput: HTMLInputElement = <HTMLInputElement>document.getElementById("seekHourInput")!;
    readonly SeekMinuteInput: HTMLInputElement = <HTMLInputElement>document.getElementById("seekMinuteInput")!;
    readonly SeekSecondInput: HTMLInputElement = <HTMLInputElement>document.getElementById("seekSecondInput")!;
    readonly SeekButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("seekButton")!;

    readonly ConnectServerButton: HTMLButtonElement | null = document.getElementById("connectServerButton") as HTMLButtonElement | null;
    readonly ConnectDeviceButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("connectDeviceButton")!;

    readonly ConnectStatusSpan: HTMLElement = <HTMLElement>document.getElementById("connectStatus")!;

    readonly ForceStopButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("forceStopButton")!;

    readonly CoyoteConnectButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("coyoteConnectButton")!;

    FunscriptSlider: SliderContainer | undefined;

    // 現在読み込まれているスクリプトのオプション一覧（デバイスカード更新用）
    private _scriptOptions: { value: ScriptType; label: string; }[] = [];

    // デバイスカードのselect要素を管理するMap (deviceKey → select要素)
    private _deviceSelectMap: Map<string, HTMLSelectElement> = new Map();

    // デバイスカードのDOM要素を管理するMap (deviceKey → card要素)
    private _deviceCardMap: Map<string, HTMLElement> = new Map();

    // デバイスカード内のスクリプト選択が変更されたときのコールバック
    public OnDeviceScriptChanged: ((deviceKey: string, scriptType: ScriptType) => void) | null = null;

    /**
     * 統合スクリプトリストにエントリを追加する
     * @param type スクリプト種別
     * @param filename ファイル名
     * @returns 追加されたli要素
     */
    AppendScriptList(type: string, filename: string): HTMLLIElement {
        const li = document.createElement("li");

        // "[タイプ] ファイル名" 形式で表示
        const span = document.createElement("span");
        span.className = "name";
        span.innerText = `[${type}] ${filename}`;
        li.appendChild(span);
        this.ScriptList.appendChild(li);
        return li;
    }

    AppendFunscriptToList(filename: string): HTMLLIElement {
        const li = this.AppendScriptList("Funscript", filename);
        const slider = document.createElement("slider-container") as SliderContainer;
        li.appendChild(slider);
        slider.InitializeSlider();
        this.FunscriptSlider = slider;
        return li;
    }

    /**
     * デバイスカードを動的生成してDeviceListContainerに追加する
     * @param deviceKey デバイス識別キー（Buttplugデバイスindexの文字列、または "coyote"）
     * @param deviceName デバイス名
     * @param capabilities 機能バッジ文字列の配列
     * @param coyote CoyoteではないButtplugデバイスかどうか（true=Coyote固有設定あり）
     */
    AddDeviceCard(
        deviceKey: string,
        deviceName: string,
        capabilities: string[],
        coyote: boolean = false
    ): HTMLElement {
        const card = document.createElement("div");
        card.className = "device-card";
        card.dataset.deviceKey = deviceKey;

        // デバイス名
        const nameEl = document.createElement("div");
        nameEl.className = "device-name";
        nameEl.innerText = deviceName;
        card.appendChild(nameEl);

        // 機能バッジ
        if (capabilities.length > 0) {
            const badgeTitle = document.createElement("div");
            badgeTitle.innerText = "機能: ";
            card.appendChild(badgeTitle);

            const badgeWrap = document.createElement("span");
            badgeTitle.appendChild(badgeWrap);
            badgeWrap.className = "capability-badges";
            capabilities.forEach(cap => {
                const badge = document.createElement("span");
                badge.className = "badge";
                badge.innerText = cap;
                badgeWrap.appendChild(badge);
            });
            badgeTitle.appendChild(badgeWrap);
        }

        // スクリプト選択ドロップダウン（Coyote以外のデバイスのみ）
        if (!coyote) {
            const selectWrap = document.createElement("div");
            const label = document.createElement("label");
            label.innerText = "スクリプト: ";
            const select = document.createElement("select");
            select.dataset.deviceKey = deviceKey;

            // 初期オプションを追加
            this._updateSelectOptions(select, deviceKey);

            select.addEventListener("change", () => {
                const scriptType = select.value as ScriptType;
                this.OnDeviceScriptChanged?.(deviceKey, scriptType);
            });

            label.appendChild(select);
            selectWrap.appendChild(label);
            card.appendChild(selectWrap);
            this._deviceSelectMap.set(deviceKey, select);
        }

        // Coyote固有設定
        if (coyote) {
            const settingsWrap = document.createElement("div");
            settingsWrap.className = "coyote-settings";

            const minLabel = document.createElement("label");
            minLabel.innerText = "最小強度: ";
            const minInput = document.createElement("input");
            minInput.id = "coyoteMinStrength";
            minInput.type = "number";
            minInput.value = C.COYOTE_DEFUALT_MIN_STRENGTH.toString();
            minInput.min = "0";
            minInput.max = "100";
            minInput.style.width = "4em";
            minLabel.appendChild(minInput);

            const maxLabel = document.createElement("label");
            maxLabel.innerText = "最大強度: ";
            const maxInput = document.createElement("input");
            maxInput.id = "coyoteMaxStrength";
            maxInput.type = "number";
            maxInput.value = C.COYOTE_DEFUALT_MAX_STRENGTH.toString();
            maxInput.min = "0";
            maxInput.max = "100";
            maxInput.style.width = "4em";
            maxLabel.appendChild(maxInput);

            settingsWrap.appendChild(minLabel);
            settingsWrap.appendChild(maxLabel);
            card.appendChild(settingsWrap);
        }

        this.DeviceListContainer.appendChild(card);
        this._deviceCardMap.set(deviceKey, card);
        return card;
    }

    /**
     * デバイスカードを削除する
     * @param deviceKey 削除するデバイスの識別キー
     */
    RemoveDeviceCard(deviceKey: string) {
        const card = this._deviceCardMap.get(deviceKey);
        if (card) {
            this.DeviceListContainer.removeChild(card);
            this._deviceCardMap.delete(deviceKey);
        }
        this._deviceSelectMap.delete(deviceKey);
    }

    /**
     * 全デバイスカードを削除する
     */
    ClearDeviceLists() {
        this.DeviceListContainer.innerHTML = '';
        this._deviceCardMap.clear();
        this._deviceSelectMap.clear();
    }

    /**
     * 読込スクリプトオプションを更新し、全デバイスカードのセレクトを再構築する
     * @param options スクリプト選択肢
     */
    UpdateScriptOptions(options: { value: ScriptType; label: string; }[]) {
        this._scriptOptions = options;
        // 全デバイスカードのselectを更新
        this._deviceSelectMap.forEach((select, deviceKey) => {
            const current = select.value as ScriptType;
            this._updateSelectOptions(select, deviceKey);
            // 以前の選択値が残っていれば復元する
            if ([...select.options].some(o => o.value === current)) {
                select.value = current;
            }
        });
    }

    ClearScriptLists() {
        this.ScriptList.innerHTML = '';
        this.FunscriptSlider = undefined;
    }

    AddFunscriptSliderUpdateEvent(event: (min: number, max: number) => void) {
        const slider = this.FunscriptSlider;
        slider?.addEventListener("mouseup", () => {
            event(slider.range_min, slider.range_max);
        });
    }

    /**
     * selectのoptionをスクリプトオプションで上書きする
     */
    private _updateSelectOptions(select: HTMLSelectElement, _deviceKey: string) {
        select.innerHTML = '';
        // 「なし」オプション
        const noneOption = document.createElement("option");
        noneOption.value = "none";
        noneOption.innerText = "（なし）";
        select.appendChild(noneOption);

        this._scriptOptions.forEach(opt => {
            const option = document.createElement("option");
            option.value = opt.value;
            option.innerText = opt.label;
            select.appendChild(option);
        });
    }
}