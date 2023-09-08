import { getFunscriptFromString } from "funscript-utils/lib/funConverter";
import { Funscript as FunscriptJson } from "funscript-utils/lib/types"

export class Funscript {
    Title: string;
    Origin: readonly ScriptLine[];
    Ranged: readonly ScriptLine[];
    Splitted: readonly ScriptLine[][];

    get OriginMin() { return this.getMin(this.Origin); }
    get OriginMax() { return this.getMax(this.Origin); }
    get RangedMin() { return this.getMin(this.Ranged); }
    get RangedMax() { return this.getMax(this.Ranged); }

    constructor(title: string, script_str: string) {
        this.Title = title;
        const json = getFunscriptFromString(script_str);
        const script = this.ConvertJsonToScript(json);

        console.log("funscript loaded. lines: " + script.length);
        console.log("script start time: " + script[0].HHMMSS);

        this.Origin = script;
        this.Ranged = script;
        this.Splitted = this.splitLines(script);
    }

    private ConvertJsonToScript(json: FunscriptJson) {
        const actions = json.actions;
        const result: ScriptLine[] = [];

        let prevtime = 0;
        for (const now of actions) {
            const duration = now.at - prevtime;
            result.push(new ScriptLine(prevtime, now.pos, duration));
            prevtime = now.at;
        }

        return result;
    }

    public SetRange(min: number, max: number) {
        let result: ScriptLine[] = []
        for (const line of this.Origin) {
            const newpos = this.normalize(line.Position, this.OriginMin, this.OriginMax, min, max)
            const newline = new ScriptLine(line.Milliseconds, newpos, line.Duration);
            result.push(newline);
        }

        this.Ranged = result;
        this.Splitted = this.splitLines(result);

        for (let i = 0; i < 10; i++) {
            console.log(this.Ranged[i])
        }

        console.log("newmin: " + this.getMin(this.Ranged))
        console.log("newmax: " + this.getMax(this.Ranged))
        console.log("splitted.length: " + this.Splitted.length)
    }

    public Validate(script_str: string): boolean {
        try {
            const t = getFunscriptFromString(script_str);
            return true;
        }
        catch (e) {
            console.log("Loading funscript is failed.");
            return false;
        }
    }

    private getMin(script: readonly ScriptLine[]) {
        const positions = script.map((line) => line.Position)
        const compare = (a: number, b: number) => Math.min(a, b);
        return positions.reduce(compare);
    }

    private getMax(script: readonly ScriptLine[]) {
        const positions = script.map((line) => line.Position)
        const compare = (a: number, b: number) => Math.max(a, b);
        return positions.reduce(compare);
    }

    private splitLines(lines: ScriptLine[]) {
        let splitted: ScriptLine[][] = [];

        for (const line of lines) {
            const seconds = line.Seconds;
            if (!splitted[seconds]) {
                splitted[seconds] = [];
            }
            splitted[seconds].push(line);
        }

        const result: readonly ScriptLine[][] = splitted;
        return result;
    }

    private normalize(value: number, oldMin: number, oldMax: number, newMin: number, newMax: number): number {
        if (oldMin > oldMax)
            throw new RangeError("oldMin is greater than oldMax.");
        if (newMin > newMax)
            throw new RangeError("newMin is greater than newMax.");

        if (value > oldMax) value = oldMax;
        if (value < oldMin) value = oldMin;

        const oldRange = oldMax - oldMin;
        const newRange = newMax - newMin;
        const newValue = (((value - oldMin) * newRange) / oldRange) + newMin
        return newValue;
    }
}

export class ScriptLine {
    Milliseconds = 0;
    Position = 0;
    Duration = 0;

    get Seconds(): number {
        return Math.trunc(this.Milliseconds / 1000);
    }

    get ButtPosition(): number {
        return this.Position / 100;
    }

    get HHMMSS(): string {
        const seconds = this.Seconds;
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        const formattedSeconds = String(seconds % 60).padStart(2, "0");
        const formattedMinutes = String(minutes % 60).padStart(2, "0");
        const formattedHours = String(hours).padStart(2, "0");

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    constructor(milliseconds: number, position: number, duration: number) {
        this.Milliseconds = milliseconds;
        this.Duration = duration;

        if (position < 0) this.Position = 0;
        else if (position > 100) this.Position = 100;
        else this.Position = position;
    }

    toString() {
        return `Time: ${this.Milliseconds}, Positon: ${this.Position}, Duration: ${this.Duration}`;
    }
}

