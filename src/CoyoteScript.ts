export interface ScriptLine {
    Milliseconds: number;
    Frequency: number;
    Strength: number;
}

const lineRegexp = /^\s*([0-9]+)\s*,\s*(100|[0-9]{1,2})\s*,\s*(100|[0-9]{1,2})\s*$/;

export function Validate(script_str: string): boolean {
    if (!script_str) return false;
    const tmp = script_str.replace(/\r\n|\r/g, "\n");
    const lines = tmp.split(/\n/).filter(l => l.trim() !== "");
    if (lines.length === 0) return false;

    for (const line of lines) {
        if (!lineRegexp.test(line)) return false;
    }
    return true;
}

export function RawScriptToLines(script_str: string): ScriptLine[] {
    const tmp = script_str.replace(/\r\n|\r/g, "\n");
    const lines = tmp.split(/\n/).filter(l => l.trim() !== "");
    const out: ScriptLine[] = [];
    for (const line of lines) {
        const m = line.match(lineRegexp);
        if (!m) continue; // skip invalid lines defensively
        const ms = parseInt(m[1], 10);
        const freq = parseInt(m[2], 10);
        const str = parseInt(m[3], 10);

        if (Number.isNaN(ms) || Number.isNaN(freq) || Number.isNaN(str))
            console.log("Nan error");

        out.push({
            Milliseconds: ms,
            Frequency: freq,
            Strength: str,
        });
    }
    return out;
}