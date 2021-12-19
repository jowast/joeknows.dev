export function clamp(
    value: number,
    opts: { min?: number, max?: number },
): number {
    if (opts.max !== undefined && value > opts.max) return opts.max;
    if (opts.min !== undefined && value < opts.min) return opts.min;
    return value;
}

export function damp(
    value: number,
    dampingFactor: number,
    minValue?: number,
): number {
    if (minValue !== undefined && Math.abs(value) < minValue) return value;
    return dampingFactor * value;
}

export function degToRad(degrees: number): number {
    return Math.PI * degrees / 180;
}
