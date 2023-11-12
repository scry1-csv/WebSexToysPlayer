
export class ScriptLine {
    Milliseconds = 0;
    Power = 0;
    constructor(time: number, power: number) {
        this.Milliseconds = time;

        if (power < 0) this.Power = 0;
        else if (power > 1000) this.Power = 1000;
        else this.Power = power;
    }

    get ButtPower(): number {
        return this.Power / 1000;
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

    toString() {
        return `Time: ${this.Milliseconds}, Power: ${this.ButtPower}`;
    }
}

const regexp = /^([0-9]+)(\.[0-9]{1,2})?,(1000|[0-9]+)$/;

export function Validate(script_str: string): boolean {
    const tmp_str = script_str.replace(/\r\n|\r/g, "\n");
    let lines = tmp_str.split(/\n/);
    if (lines.slice(-1)[0] === "") // 配列の最後の要素が空文字列なら
        lines.pop();             // 最後の要素を削除

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
        if (match) {
            let millisecond = Number(match[1]) * 1000;
            if (match[2]) {
                const str_c = match[2].replace(".", "");
                let centi: number;
                if (str_c.length == 1) {
                    centi = Number(str_c) * 10;
                }
                else {
                    centi = Number(str_c);
                }
                millisecond += centi * 10;
            }
            const power = Number(match[3]);
            const line = new ScriptLine(millisecond, power);
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


export function LoadScript(
    script_str: string
): readonly ScriptLine[][] {
    const lines = RawScriptToLines(script_str);
    return SplitLines(lines);
}

const gTestScriptLines = [
    new ScriptLine(500, 800),
    new ScriptLine(600, 0),
    new ScriptLine(1500, 400),
    new ScriptLine(1600, 0),
    new ScriptLine(2500, 800),
    new ScriptLine(2600, 0),
    new ScriptLine(3500, 400),
    new ScriptLine(3600, 0),
    new ScriptLine(4500, 800),
    new ScriptLine(4600, 0),
    new ScriptLine(5500, 400),
    new ScriptLine(5600, 0),
    new ScriptLine(6500, 800),
    new ScriptLine(6600, 0),
    new ScriptLine(7500, 400),
    new ScriptLine(7600, 0),
];

export const TestScript = SplitLines(gTestScriptLines);
