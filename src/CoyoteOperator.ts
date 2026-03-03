import { CoyoteController } from './dglab-coyote-v3-lib/CoyoteController';
import { ScriptLine as CoyoteScriptLine } from './CoyoteScript';
import * as C from "./Const";

export class CoyoteOperator {
    private readonly _coyote: CoyoteController;
    private _intervalId: number | null = null;
    private _currentTime: number = 0;
    private _prevTickTime: number = 0;

    // 設定値
    public MinFrequency: number = C.COYOTE_DEFUALT_MAX_FREQUENCY;
    public MaxFrequency: number = C.COYOTE_DEFUALT_MAX_FREQUENCY;
    public MinStrength: number = C.COYOTE_DEFUALT_MIN_STRENGTH;
    public MaxStrength: number = C.COYOTE_DEFUALT_MAX_STRENGTH;

    // スクリプトデータ
    private _originalCoyoteScript: CoyoteScriptLine[] = [];
    private _compiledMap25: Map<number, { frequency: number, strength: number; }> = new Map();

    constructor() {
        this._coyote = new CoyoteController();
    }

    public get controller() {
        return this._coyote;
    }

    public Start() {
        if (this._intervalId !== null) return;
        this._intervalId = window.setInterval(() => this.Tick(), 100);
    }

    public Stop() {
        this._currentTime = 0;
        if (this._intervalId !== null) {
            window.clearInterval(this._intervalId);
            this._intervalId = null;
        }
        // 停止時は安全のため0を送信しておく
        if (this._coyote.isConnected) {
            this._coyote.sendWaveform('A', 10, 0).catch(() => { });
            this._coyote.sendWaveform('B', 10, 0).catch(() => { });
        }
    }

    public setTime(time: number) {
        this._currentTime = time;
    }

    // CoyoteScript(中身がCSVの.coyotescript)をロードする
    public LoadCoyoteScript(script: CoyoteScriptLine[]) {
        this._compiledMap25.clear();

        if (!script || script.length === 0) return;

        this._originalCoyoteScript = script;
        this.CompileCoyoteScript();
    }


    private async Tick() {
        if (!this._coyote.isConnected) return;
        if (this._compiledMap25?.size === 0) return;

        if (this._currentTime <= this._prevTickTime)
            this._currentTime += 0.1; // 時間が進んでいない場合は強制的に進める
        this._prevTickTime = this._currentTime;

        const timeKey = Math.floor(this._currentTime * 1000 / 25) * 25;
        const command = this._compiledMap25.get(timeKey);

        if (command == null || command == undefined)
            throw new Error("Command is null or undefined: timeKey=" + timeKey);
        const command2 = this._compiledMap25.get(timeKey + 25) ?? command;
        const command3 = this._compiledMap25.get(timeKey + 50) ?? command;
        const command4 = this._compiledMap25.get(timeKey + 75) ?? command;

        if (Number.isNaN(command.strength))
            console.log("NaN error");

        if (command.strength != 0 || command2.strength != 0 || command3.strength != 0 || command4.strength != 0) {

            console.log(`Coyote Tick: time=${this._currentTime.toFixed(2)}s, key=${timeKey}`);
            console.log(`1: freq=${command.frequency}, strength=${command.strength}\n` +
                `2: freq=${command2.frequency}, strength=${command2.strength}\n` +
                `3: freq=${command3.frequency}, strength=${command3.strength}\n` +
                `4: freq=${command4.frequency}, strength=${command4.strength}`
            );
        }


        if (command && command.strength !== 0) {
            try {
                this._coyote.sendWaveformQuadPairs('A',
                    [
                        { frequency: command.frequency, strength: command.strength },
                        { frequency: command2.frequency, strength: command2.strength },
                        { frequency: command3.frequency, strength: command3.strength },
                        { frequency: command4.frequency, strength: command4.strength },
                    ]

                );
            } catch (e) {
                console.error(e);
            }
        }
    }


    public UpdateSettings(minStrength: number, maxStrength: number) {
        this.MinStrength = minStrength;
        this.MaxStrength = maxStrength;

        this._coyote.setStrength("A", maxStrength);
        this._coyote.setStrength("B", maxStrength);
        this.CompileCoyoteScript();
    }

    private normalize(
        value: number,
        oldMax: number,
        oldMin: number,
        newMax: number,
        newMin: number
    ): number {
        if (value === 0) {
            return 0;
        }

        if (value > oldMax) {
            value = oldMax;
        }
        if (value < oldMin) {
            value = oldMin;
        }

        const oldRange = oldMax - oldMin;
        const newRange = newMax - newMin;

        const newValue = value - oldMin == 0 ? newMin :
            Math.floor(((value - oldMin) * newRange) / oldRange) + newMin;

        if (Number.isNaN(newValue))
            console.log("NaN error");
        return newValue;
    }


    private CompileCoyoteScript() {
        console.log("Compiling Coyote Script...");
        this._compiledMap25.clear();
        if (!this._originalCoyoteScript || this._originalCoyoteScript.length === 0) return;

        // const scriptMaxStrength = Math.max(...this._originalCoyoteScript
        //     .map(line => line.Strength));
        // const scriptMinStrength = Math.min(...this._originalCoyoteScript
        //     .filter(line => line.Strength > 0)
        //     .map(line => line.Strength)
        // );

        // スクリプトが長すぎると↑でコメントアウトしている配列のスプレッド展開では
        // スタックオーバーフローするため、代わりにfor ofでmaxとminを取得する

        const strengths = this._originalCoyoteScript
            .map(line => line.Strength)
            .filter(s => s > 0);
        let scriptMaxStrength: number = 0;
        for (const s of strengths)
            if (s > scriptMaxStrength) scriptMaxStrength = s;

        let scriptMinStrength: number = 100;
        for (const s of strengths)
            if (s < scriptMinStrength) scriptMinStrength = s;

        const ActualMin = this.MinStrength * (100 / this.MaxStrength);

        console.log(`Coyote Script Strength Range: scriptMin=${scriptMinStrength}, scriptMax=${scriptMaxStrength}, ActualMin=${ActualMin}`);

        const sorted = [...this._originalCoyoteScript].sort((a, b) => a.Milliseconds - b.Milliseconds);

        let lastFreq = 0;
        let lastStrength = 0;
        let lastTime = 0;

        sorted.forEach(line => {
            while (lastTime < line.Milliseconds) {
                this._compiledMap25.set(lastTime, {
                    frequency: lastFreq,
                    strength: lastStrength
                });
                lastTime += 25;
            }

            let strength = 0;
            if (line.Strength > 0) {
                strength = Math.round(this.normalize(
                    line.Strength,
                    scriptMaxStrength,
                    scriptMinStrength,
                    100,
                    ActualMin
                ));
            }

            const ms = Math.floor(line.Milliseconds / 25) * 25; // 25ms単位に丸める

            this._compiledMap25.set(ms, { frequency: line.Frequency, strength: strength });

            lastFreq = line.Frequency;
            lastStrength = strength;
            lastTime = ms;
        });

        console.log(`CoyoteScript Compiled: ${this._compiledMap25.size} points.`);
        // this._compiledMap25.forEach((value, key) => {
        //     console.log(`Time: ${key} ms => Freq: ${value.frequency}, Strength: ${value.strength}`);
        // });
    }
}
