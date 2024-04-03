import { useState } from "react";
import { suspend, peek } from "suspend-react";

declare const __VTCHAT_API_BASE__: string;

function apiUrl(endpoint: string) {
    return (new URL(endpoint, __VTCHAT_API_BASE__)).toString();
}

const initSym = Symbol();

export function tags({ refetch = false } = {}): {
    tags: string[],
    k: Symbol,
    reload: () => void,
} {
    const [k, setK] = useState<Symbol>(initSym);
    const [pk, setPk] = useState<Symbol>(initSym);
    const path = "/api/tags";
    const data = suspend(() => {
        return fetch(apiUrl(path)).then(r => r.json())
            .then(d => (setPk(k), d))
            .catch(err => refetch? Promise.resolve(peek([pk, path])): Promise.reject(err));
    }, [k, path]);
    return { ...data, k, reload: () => setK(Symbol()) }
}

export function stats({ refetch = false } = {}): {
    size: { db: bigint }
    count: {
        channel: number,
        job: number,
        msg: number,
    },
    k: Symbol,
    reload: () => void,
} {
    const [k, setK] = useState<Symbol>(initSym);
    const [pk, setPk] = useState<Symbol>(initSym);
    const path = "/mgnt/stats";
    const data = suspend(() => {
        return fetch(path).then(r => r.json())
            .then(d => (setPk(k), d))
            .catch(err => refetch? Promise.resolve(peek([pk, path])): Promise.reject(err));
    }, [k, path]);
    return { ...data, k, reload: () => setK(Symbol()) }
}

export async function csearch(params: { q?: string, limit?: number, offset?: number }): Promise<Array<{
    id: string,
    name: string,
    thumbnail: string,
    tags: { [tag: string]: 1 },
    active: boolean,
}>> {
    const resp = await fetch(apiUrl("/api/csearch"), {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });
    if(resp.status >= 400) throw Error((await resp.text()) || resp.statusText);
    const { channels } = await resp.json();
    return channels;
}

export async function updateChannels(channels: { [id: string]: { active?: boolean, tags?: { [tag: string]: 1 } } }) {
    const resp = await fetch("/mgnt/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channels }),
    });
    if(resp.status >= 400) throw Error((await resp.text()) || resp.statusText);
}

export type Job = {
    type: "chat" | "transcript",
    video: string,
    state: null | "started" | "failed" | "success",
    lastUpdate: number,
    meta?: { [k: string]: any },
    error?: string
};

export function jobs({ refetch = false } = {}): {
    queueLength: number,
    started: Job[],
    failed: Job[],
    queued: Job[],
    recent: Job[],
    k: Symbol,
    reload: () => void,
} {
    const [k, setK] = useState<Symbol>(initSym);
    const [pk, setPk] = useState<Symbol>(initSym);
    const path = "/mgnt/jobs";
    const data = suspend(() => {
        return fetch(path).then(r => r.json())
            .then(d => (setPk(k), d))
            .catch(err => refetch? Promise.resolve(peek([pk, path])): Promise.reject(err));
    }, [k, path]);
    return { ...data, k, reload: () => setK(Symbol()) }
}

export async function submitJob(spec: { scrape: true } | { channel: string } | { video: string }) {
    const resp = await fetch("/mgnt/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spec),
    });
    if(resp.status >= 400) throw Error((await resp.text()) || resp.statusText);
}