export module UFOTW {
    export class ScriptLine {
        Milliseconds = 0;
        LeftClockwise: boolean = true;
        LeftPower = 0;
        RightClockwise: boolean = true;
        RightPower = 0;


        get LeftButtPower(): number {
            return this.LeftPower / 100;
        }
        get RightButtPower(): number {
            return this.RightPower / 100;
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

        constructor(time: number, leftClockwise: boolean, leftPower: number, rightClockwise: boolean, rightPower: number) {
            this.Milliseconds = time;
            this.LeftClockwise = leftClockwise;
            this.RightClockwise = rightClockwise;

            if (leftPower < 0) this.LeftPower = 0;
            else if (leftPower > 100) this.LeftPower = 100;
            else this.LeftPower = leftPower;

            if (rightPower < 0) this.RightPower = 0;
            else if (rightPower > 100) this.RightPower = 100;
            else this.RightPower = rightPower;
        }

        toString() {
            return `Time: ${this.Milliseconds}, LeftClockwise: ${this.LeftClockwise} LeftPower: ${this.LeftButtPower}, LeftClockwise: ${this.RightClockwise} LeftPower: ${this.RightButtPower}`;
        }
    }

    const regexp = /^([0-9]+),(0|1),(100|[0-9]{1,2}),(0|1),(100|[0-9]{1,2})$/;

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

    export function RawScriptToLines(script_str: string): ScriptLine[] {
        const tmp = script_str.replace(/\r\n|\r/g, "\n");
        const lines = tmp.split(/\n/);
        let result: ScriptLine[] = [];
        for (const l of lines) {
            const match = l.match(regexp);
            //console.log(match);
            if (match) {
                let millisecond = Number(match[1]) * 100;
                const leftClockwise = match[2] === "1" ? true : false;
                const leftPower = Number(match[3]);
                const rightClockwise = match[4] === "1" ? true : false;
                const rightPower = Number(match[5]);
                const line = new ScriptLine(millisecond, leftClockwise, leftPower, rightClockwise, rightPower);
                //console.log(line)
                result.push(line);
            }
        };
        console.log("script start time: " + result[0].HHMMSS);

        return result;
    }

    export function SplitLines(lines: ScriptLine[]) {
        let splitted: ScriptLine[][] = [];
        for (const l of lines) {
            const seconds = l.Seconds;
            if (!splitted[seconds]) {
                splitted[seconds] = [];
            }
            splitted[seconds].push(l);
        };
        const result: readonly ScriptLine[][] = splitted;
        return result;
    }
}
