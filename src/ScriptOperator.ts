import { ButtplugOperator } from "./ButtplugOperator";
import { TimeRoter } from "./TimeRoter";
import { Vorze_SA } from "./Vorze_SA";

export class ScriptOperator {
    private readonly _buttplugOperator: ButtplugOperator;
    private _previousSeconds: number = 0;
    private _timerIDs = new Set<number>();
    Offset: number = 0;

    Scripts: {
        Viberator: {
            Script: readonly TimeRoter.ScriptLine[][],
            Name: string
        } | undefined,
        UFOSA: {
            Script: readonly Vorze_SA.ScriptLine[][],
            Name: string
        } | undefined
    } =
    {
        Viberator: undefined, UFOSA: undefined
    };

    constructor(buttplug: ButtplugOperator) {
        this._buttplugOperator = buttplug;
    }

    GetFileName(path:string) {
        if(path.match(/[a-zA-Z]:\\/)) {
            return path.split("\\").reverse()[0];
        }
        else
        {
            return path.split("/").reverse()[0];
        }
    }

    LoadScript(script_str: string, path: string): boolean {
        if (TimeRoter.Validate(script_str)) {
            const script = TimeRoter.LoadScript(script_str);
            this.Scripts.Viberator = {
                Script:script,
                Name: this.GetFileName(path)
            };
            console.log("timeroter script loaded. lines: " + script.length);
            return true;
        } else if (Vorze_SA.Validate(script_str)) {
            const script = Vorze_SA.LoadScript(script_str);
            this.Scripts.UFOSA = {
                Script: script,
                Name: this.GetFileName(path),
            };
            console.log("Vorze_SA script loaded. lines: " + script.length);
            return true;
        } else return false;
    }

    Play(currentTime: number) {
        const currentSeconds = Math.trunc(currentTime);
        this._previousSeconds = currentSeconds - 2;
        this.OperateViberatorScript(currentSeconds - 1);
        this.OperateSAScript(currentSeconds - 1);
        this._previousSeconds = currentSeconds;
    }

    Stop() {
        this._previousSeconds = 0;
        this._buttplugOperator.Devices.Viberators.forEach((d) => {
            d.stop();
        });
        this._buttplugOperator.Devices.Vorze_SA.forEach((d) => {
            d.stop();
        });
        this._timerIDs.forEach((id) => {
            clearTimeout(id);
        });
        this._timerIDs.clear();
    }

    TimeUpdate(currentTime: number) {
        const adjustedTime = currentTime + this.Offset;
        const seconds = Math.trunc(adjustedTime);
        if (seconds !== this._previousSeconds) {
            this.OperateViberatorScript(adjustedTime);
            this.OperateSAScript(adjustedTime);
            this._previousSeconds = seconds;
        }
    }

    private OperateSAScript(currentTime: number) {
        if (!this.Scripts.UFOSA) return;

        const currentSeconds = Math.trunc(currentTime);
        const script = this.Scripts.UFOSA.Script;

        if (
            this._buttplugOperator.Devices.Vorze_SA.length > 0 &&
            currentSeconds !== this._previousSeconds &&
            script[currentSeconds + 1]
        ) {
            script[currentSeconds + 1].forEach((l) => {
                const delay = l.Milliseconds - Math.trunc(currentTime * 1000);

                setTimeout(() => console.log(l.toString()), delay);

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

    private OperateViberatorScript(currentTime: number) {
        if (!this.Scripts.Viberator) return;

        const currentSeconds = Math.trunc(currentTime);
        const script = this.Scripts.Viberator.Script;

        if (
            this._buttplugOperator.Devices.Viberators.length > 0 &&
            currentSeconds !== this._previousSeconds &&
            script[currentSeconds + 1]
        ) {
            script[currentSeconds + 1].forEach((l) => {
                const delay = l.Milliseconds - Math.trunc(currentTime * 1000);

                setTimeout(() => console.log(l.toString()), delay);

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
}