export module Vorze_SA {
    export class ScriptLine {
        Milliseconds = 0;
        Clockwise: boolean = true;
        Power = 0;

        get ButtPower(): number {
            return this.Power / 100;
        }

        get Seconds(): number {
            return Math.trunc(this.Milliseconds / 1000);
        }

        get HHMMSS(): string {
            const seconds = Math.floor(this.Milliseconds / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);

            const formattedSeconds = String(seconds % 60).padStart(2, "0");
            const formattedMinutes = String(minutes % 60).padStart(2, "0");
            const formattedHours = String(hours).padStart(2, "0");

            return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        }

        constructor(time: number, clockwise: boolean, power: number) {
            this.Milliseconds = time;
            this.Clockwise = clockwise;

            if (power < 0) this.Power = 0;
            else if (power > 100) this.Power = 100;
            else this.Power = power;
        }

        toString() {
            return `Time: ${this.Milliseconds}, Clockwise: ${this.Clockwise} Power: ${this.ButtPower}`;
        }
    }

    const regexp = /^([0-9]+),(0|1),(100|[0-9]{1,2})$/;

    export function Validate(script_str: string): boolean {
        const tmp = script_str.replace(/\r\n|\r/g, "\n");
        let lines = tmp.split(/\n/);
        if (lines.slice(-1)[0] === "") // 配列の最後の要素が空文字列なら
            lines.pop();               // 最後の要素を削除

        let result = true;
        for (let i = 0; i < lines.length; i++) {
            if (!lines[i].match(regexp)) {
                result = false;
                break;
            }
        }
        return result;
    }

    function RawScriptToLines(script_str: string): ScriptLine[] {
        const tmp = script_str.replace(/\r\n|\r/g, "\n");
        const lines = tmp.split(/\n/);
        let result: ScriptLine[] = [];
        lines.forEach((l) => {
            const match = l.match(regexp);
            //console.log(match);
            if (match) {
                let millisecond = Number(match[1]) * 100;
                const clockwise = match[2]==="1" ? true : false;
                const power = Number(match[3]);
                const line = new ScriptLine(millisecond, clockwise, power);
                //console.log(line)
                result.push(line);
            }
        });
        console.log("script start time: " + result[0].HHMMSS);

        return result;
    }

    function SplitLines(lines: ScriptLine[]) {
        let splitted: ScriptLine[][] = [];
        lines.forEach((line) => {
            const seconds = line.Seconds;
            if (splitted[seconds] === undefined) {
                splitted[seconds] = [];
            }
            splitted[seconds].push(line);
        });
        const result: readonly ScriptLine[][] = splitted;
        return result;
    }

    export function LoadScript(script_str: string): readonly ScriptLine[][] {
        const lines = RawScriptToLines(script_str);
        return SplitLines(lines);
    }

    const gTestScriptLines = [
        new ScriptLine(500, true, 800),
        new ScriptLine(600, true, 0),
        new ScriptLine(1500, false, 400),
        new ScriptLine(1600, false, 0),
        new ScriptLine(2500, true, 800),
        new ScriptLine(2600, true, 0),
        new ScriptLine(3500, false, 400),
        new ScriptLine(3600, false, 0),
        new ScriptLine(4500, true, 800),
        new ScriptLine(4600, true, 0),
        new ScriptLine(5500, false, 400),
        new ScriptLine(5600, false, 0),
        new ScriptLine(6500, true, 800),
        new ScriptLine(6600, true, 0),
        new ScriptLine(7500, false, 400),
        new ScriptLine(7600, false, 0),
    ];

    export const TestScript = SplitLines(gTestScriptLines);
}
