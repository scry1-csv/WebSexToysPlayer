import { ButtplugOperator } from "./ButtplugOperator";
import { TimeRoter } from "./TimeRoter";
import { Vorze_SA } from "./Vorze_SA";
import { Funscript } from "./Funscript";
import { UFOTW } from "./UFOTW";


export class ScriptOperator {
    private readonly _buttplugOperator: ButtplugOperator;
    private _previousSeconds: number = 0;
    private _timerIDs = new Set<number>();
    Offset: number = 0;

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
    } = {
            TimeRoter: undefined,
            Vorze_SA: undefined,
            Funscript: undefined,
            UFOTW: undefined,
        };

    constructor(buttplug: ButtplugOperator) {
        this._buttplugOperator = buttplug;
    }

    LoadScript(script_str: string, filename: string): boolean {
        console.log("path: " + filename);
        if (filename.endsWith(".funscript")) {
            this.Scripts.Funscript = new Funscript(filename, script_str);
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

    Stop() {
        this._previousSeconds = 0;
        this._buttplugOperator.StopAllDevices();
        this._timerIDs.forEach((id) => {
            clearTimeout(id);
        });
        this._timerIDs.clear();
    }

    TimeUpdate(currentTime: number) {
        const adjustedTime = currentTime + this.Offset;
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

    private OperateTimeRoterScript(currentTime: number) {
        if (!this.Scripts.TimeRoter) return;

        const currentSeconds = Math.trunc(currentTime);
        const script = this.Scripts.TimeRoter.Splitted;

        if (
            this._buttplugOperator.Devices.Viberators.length > 0 &&
            currentSeconds !== this._previousSeconds &&
            script[currentSeconds + 1]
        ) {
            script[currentSeconds + 1].forEach((l) => {
                const delay = l.Milliseconds - Math.trunc(currentTime * 1000);

                const log = `send ViberateMsg: ${l.toString()}`;
                setTimeout(() => console.log(log), delay);

                const id = window.setTimeout(() => {
                    this._buttplugOperator.SendViberateMsg(l.ButtPower);
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

        if (
            this._buttplugOperator.Devices.Rotators.length > 0 &&
            currentSeconds !== this._previousSeconds &&
            script[currentSeconds + 1]
        ) {
            script[currentSeconds + 1].forEach((l) => {
                const delay = l.Milliseconds - Math.trunc(currentTime * 1000);

                const log = `send RotateMsg: ${l.toString()}`;
                setTimeout(() => console.log(log), delay);

                const id = window.setTimeout(() => {
                    this._buttplugOperator.SendRotateMsg(
                        l.ButtPower,
                        l.Clockwise
                    );
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

        if (
            this._buttplugOperator.Devices.UFOTW.length > 0 &&
            currentSeconds !== this._previousSeconds &&
            script[currentSeconds + 1]
        ) {
            script[currentSeconds + 1].forEach((l) => {
                const delay = l.Milliseconds - Math.trunc(currentTime * 1000);

                const log = `send RotateMsg: ${l.toString()}`;
                setTimeout(() => console.log(log), delay);

                const id = window.setTimeout(() => {
                    this._buttplugOperator.SendUFOTWMsg(
                        l.LeftButtPower,
                        l.LeftClockwise,
                        l.RightButtPower,
                        l.RightClockwise
                    );
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

        if (
            this._buttplugOperator.Devices.Linears.length > 0 &&
            currentSeconds !== this._previousSeconds &&
            script[currentSeconds + 1]
        ) {
            script[currentSeconds + 1].forEach((l) => {
                const delay = l.Milliseconds - currentMilliseconds;

                const log = `send LinearMsg: ${l.toString()}`;
                setTimeout(() => console.log(log), delay);

                const id = window.setTimeout(() => {
                    this._buttplugOperator.SendLinearMsg(l.ButtPosition, l.Duration);
                }, delay);

                this._timerIDs.add(id);
                setTimeout(() => {
                    this._timerIDs.delete(id);
                }, 3000);
            });
        }
    }
}