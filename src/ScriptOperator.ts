import { ButtplugOperator } from "./ButtplugOperator";
import { CoyoteOperator } from "./CoyoteOperator";
import * as Buttplug from "buttplug";
import * as TimeRoter from "./TimeRoter";
import * as CoyoteScript from "./CoyoteScript";

import * as  Vorze_SA from "./Vorze_SA";
import * as  UFOTW from "./UFOTW";
import { Funscript } from "./Funscript";

export type ScriptType = "TimeRoter" | "Vorze_SA" | "Funscript" | "UFOTW" | "CoyoteScript" | "none";

export class ScriptOperator {
    private readonly _buttplugOperator: ButtplugOperator;
    private readonly _coyoteOperator: CoyoteOperator;
    private _previousSeconds: number = 0;

    private _timerIDs = new Set<number>();

    public VorzeSAScriptToUFOTW: boolean = false;
    public Offset: number = 0;

    /**
     * デバイスID → スクリプト種別のマッピング
     * キーはButtplugデバイスのindex文字列、またはCoyoteの場合は "coyote"
     */
    public DeviceScriptAssignments: Map<string, ScriptType> = new Map();

    public CoyoteSettings = {
        MinFrequency: 10,
        MaxFrequency: 50,
        MinStrength: 1,
        MaxStrength: 30,
    };

    Scripts: {
        TimeRoter: {
            Script: readonly TimeRoter.ScriptLine[];
            Splitted: readonly TimeRoter.ScriptLine[][];
            Title: string;
        } | undefined;
        Vorze_SA: {
            Script: readonly Vorze_SA.ScriptLine[];
            Splitted: readonly Vorze_SA.ScriptLine[][];
            Title: string;
        } | undefined;
        Funscript: Funscript | undefined;
        UFOTW: {
            Script: readonly UFOTW.ScriptLine[];
            Splitted: readonly UFOTW.ScriptLine[][];
            Title: string;
        } | undefined;
        CoyoteScript: {
            Script: readonly CoyoteScript.ScriptLine[];
            Title: string;
        } | undefined;
    } = {
            TimeRoter: undefined,
            Vorze_SA: undefined,
            Funscript: undefined,
            UFOTW: undefined,
            CoyoteScript: undefined,
        };

    constructor(buttplug: ButtplugOperator, coyote: CoyoteOperator) {
        this._buttplugOperator = buttplug;
        this._coyoteOperator = coyote;
    }


    LoadScript(script_str: string, filename: string): boolean {
        console.log("path: " + filename);
        if (filename.endsWith(".funscript")) {
            this.Scripts.Funscript = new Funscript(filename, script_str);
            return true;
        }

        if (filename.endsWith(".coyotescript") && CoyoteScript.Validate(script_str)) {
            const script = CoyoteScript.RawScriptToLines(script_str);
            this.Scripts.CoyoteScript = {
                Script: script,
                Title: filename,
            };
            this._coyoteOperator.LoadCoyoteScript(script);
            console.log("CoyoteScript loaded. lines: " + script.length);
            return true;
        }

        if (TimeRoter.Validate(script_str)) {
            const script = TimeRoter.RawScriptToLines(script_str);
            this.Scripts.TimeRoter = {
                Script: script,
                Splitted: TimeRoter.SplitLines(script),
                Title: filename,
            };
            console.log("timeroter script loaded. lines: " + script.length);
            return true;

        } else if (UFOTW.Validate(script_str)) {
            const script = UFOTW.RawScriptToLines(script_str);
            this.Scripts.UFOTW = {
                Script: script,
                Splitted: UFOTW.SplitLines(script),
                Title: filename,
            };
            console.log("UFOTW script loaded. lines: " + script.length);
            return true;
        } else if (Vorze_SA.Validate(script_str)) {
            const script = Vorze_SA.RawScriptToLines(script_str);
            this.Scripts.Vorze_SA = {
                Script: script,
                Splitted: Vorze_SA.SplitLines(script),
                Title: filename,
            };
            console.log("Vorze_SA script loaded. lines: " + script.length);
            return true;
        } else return false;
    }

    Start() {
        this._coyoteOperator.Start();
    }

    Stop() {
        this._previousSeconds = 0;
        this._buttplugOperator.StopAllDevices();
        this._coyoteOperator.Stop();
        this._timerIDs.forEach((id) => {

            clearTimeout(id);
        });
        this._timerIDs.clear();
    }

    TimeUpdate(currentTime: number) {
        const adjustedTime = currentTime + this.Offset;
        this._coyoteOperator.setTime(adjustedTime);
        const seconds = Math.trunc(adjustedTime);

        if (seconds !== this._previousSeconds) {
            this.OperateTimeRoterScript(adjustedTime);
            this.OperateVorzeSAScript(adjustedTime);
            this.OperateFunscript(adjustedTime);
            this.OperateUFOTWScript(adjustedTime);
            this._previousSeconds = seconds;
        }
    }

    SetFunscriptRange(min: number, max: number) {
        this.Scripts.Funscript?.SetRange(min, max);
    }

    /**
     * 指定デバイスに割り当てられたスクリプト種別を取得する
     * @param deviceKey デバイス識別キー
     * @returns スクリプト種別（未設定の場合は "none"）
     */
    GetDeviceScriptType(deviceKey: string): ScriptType {
        return this.DeviceScriptAssignments.get(deviceKey) ?? "none";
    }

    /**
     * TimeRoterスクリプトが割り当てられた振動デバイスを返す
     */
    private GetTimeRoterDevices(): Buttplug.ButtplugClientDevice[] {
        return this._buttplugOperator.Devices.Viberators.filter(d => {
            const key = String(d.index);
            const assigned = this.DeviceScriptAssignments.get(key);
            // 割り当てが未設定の場合は後方互換として動作させない（明示的に選択が必要）
            return assigned === "TimeRoter";
        });
    }

    /**
     * VorzeSAスクリプトが割り当てられた回転デバイスを返す
     */
    private GetVorzeSARotatorDevices(): Buttplug.ButtplugClientDevice[] {
        return this._buttplugOperator.Devices.Rotators.filter(d => {
            return this.DeviceScriptAssignments.get(String(d.index)) === "Vorze_SA";
        });
    }

    /**
     * VorzeSAスクリプトが割り当てられたUFOTWデバイスを返す
     */
    private GetVorzeSAUFOTWDevices(): Buttplug.ButtplugClientDevice[] {
        return this._buttplugOperator.Devices.UFOTW.filter(d => {
            return this.DeviceScriptAssignments.get(String(d.index)) === "Vorze_SA";
        });
    }

    /**
     * Funscriptが割り当てられたリニアデバイスを返す
     */
    private GetFunscriptLinearDevices(): Buttplug.ButtplugClientDevice[] {
        return this._buttplugOperator.Devices.Linears.filter(d => {
            return this.DeviceScriptAssignments.get(String(d.index)) === "Funscript";
        });
    }

    /**
     * UFOTWスクリプトが割り当てられたUFOTWデバイスを返す
     */
    private GetUFOTWDevices(): Buttplug.ButtplugClientDevice[] {
        return this._buttplugOperator.Devices.UFOTW.filter(d => {
            return this.DeviceScriptAssignments.get(String(d.index)) === "UFOTW";
        });
    }

    private OperateTimeRoterScript(currentTime: number) {
        if (!this.Scripts.TimeRoter) return;

        const currentSeconds = Math.trunc(currentTime);
        const script = this.Scripts.TimeRoter.Splitted;

        // 割り当て済みデバイスのみを取得
        const devices = this.GetTimeRoterDevices();

        if (
            devices.length > 0 &&
            currentSeconds !== this._previousSeconds &&
            script[currentSeconds + 1]
        ) {
            script[currentSeconds + 1].forEach((l) => {
                const delay = l.Milliseconds - Math.trunc(currentTime * 1000);

                const log = `send ViberateMsg: ${l.toString()}`;
                setTimeout(() => console.log(log), delay);

                const id = window.setTimeout(() => {
                    // 割り当て済みデバイスにのみ送信
                    devices.forEach(d => d.vibrate(l.ButtPower));
                }, delay);

                this._timerIDs.add(id);
                setTimeout(() => {
                    this._timerIDs.delete(id);
                }, 3000);
            });
        }
    }

    private OperateVorzeSAScript(currentTime: number) {
        if (!this.Scripts.Vorze_SA) return;

        const currentSeconds = Math.trunc(currentTime);
        const script = this.Scripts.Vorze_SA.Splitted;

        const rotatorDevices = this.GetVorzeSARotatorDevices();
        const ufotwDevices = this.VorzeSAScriptToUFOTW ? this.GetVorzeSAUFOTWDevices() : [];

        const deviceFlag = rotatorDevices.length > 0 || ufotwDevices.length > 0;

        if (deviceFlag &&
            currentSeconds !== this._previousSeconds &&
            script[currentSeconds + 1]
        ) {
            script[currentSeconds + 1].forEach((l) => {
                const delay = l.Milliseconds - Math.trunc(currentTime * 1000);

                const log = `send RotateMsg: ${l.toString()}`;
                setTimeout(() => console.log(log), delay);

                const id = window.setTimeout(() => {
                    rotatorDevices.forEach(d => d.rotate(l.ButtPower, l.Clockwise));
                    if (this.VorzeSAScriptToUFOTW) {
                        ufotwDevices.forEach(d => {
                            if (this._buttplugOperator.UFOTWReverseLR)
                                d.rotate([[l.ButtPower, l.Clockwise], [l.ButtPower, l.Clockwise]]);
                            else
                                d.rotate([[l.ButtPower, l.Clockwise], [l.ButtPower, l.Clockwise]]);
                        });
                    }
                }, delay);

                this._timerIDs.add(id);
                setTimeout(() => {
                    this._timerIDs.delete(id);
                }, 3000);
            });
        }
    }


    private OperateUFOTWScript(currentTime: number) {
        if (!this.Scripts.UFOTW) return;

        const currentSeconds = Math.trunc(currentTime);
        const script = this.Scripts.UFOTW.Splitted;

        const devices = this.GetUFOTWDevices();

        if (
            devices.length > 0 &&
            !this.VorzeSAScriptToUFOTW &&
            currentSeconds !== this._previousSeconds &&
            script[currentSeconds + 1]
        ) {
            script[currentSeconds + 1].forEach((l) => {
                const delay = l.Milliseconds - Math.trunc(currentTime * 1000);

                const log = `send RotateMsg: ${l.toString()}`;
                setTimeout(() => console.log(log), delay);

                const id = window.setTimeout(() => {
                    devices.forEach(d => {
                        if (this._buttplugOperator.UFOTWReverseLR)
                            d.rotate([[l.RightButtPower, l.RightClockwise], [l.LeftButtPower, l.LeftClockwise]]);
                        else
                            d.rotate([[l.LeftButtPower, l.LeftClockwise], [l.RightButtPower, l.RightClockwise]]);
                    });
                }, delay);

                this._timerIDs.add(id);
                setTimeout(() => {
                    this._timerIDs.delete(id);
                }, 3000);
            });
        }
    }


    private OperateFunscript(currentTime: number) {
        if (!this.Scripts.Funscript) return;

        const currentSeconds = Math.trunc(currentTime);
        const currentMilliseconds = currentTime * 1000;
        const script = this.Scripts.Funscript.Splitted;

        const devices = this.GetFunscriptLinearDevices();

        if (
            devices.length > 0 &&
            currentSeconds !== this._previousSeconds &&
            script[currentSeconds + 1]
        ) {
            script[currentSeconds + 1].forEach((l) => {
                const delay = l.Milliseconds - currentMilliseconds;

                const log = `send LinearMsg: ${l.toString()}`;
                setTimeout(() => console.log(log), delay);

                const id = window.setTimeout(() => {
                    devices.forEach(d => d.linear(l.ButtPosition, l.Duration));
                }, delay);

                this._timerIDs.add(id);
                setTimeout(() => {
                    this._timerIDs.delete(id);
                }, 3000);
            });
        }
    }
}