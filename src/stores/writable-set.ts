import { writable } from 'svelte/store';

export function writableSet<T = unknown>(iter?: Iterable<T>) {
    const s = new Set(iter);
    const ws = writable(s);

    return {
        subscribe: ws.subscribe,
        add: (value: T) => {
            s.add(value);
            ws.set(s);
        },
        delete: (value: T) => {
            s.delete(value);
            ws.set(s);
        },
        clear: () => {
            s.clear();
            ws.set(s);
        },
        has: s.has.bind(s),
    };
};
