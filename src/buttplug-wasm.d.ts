import { IButtplugClientConnector, ButtplugMessage } from "buttplug"

export class ButtplugWasmClientConnector implements IButtplugClientConnector {
    constructor();
    static activateLogging(logLevel?: string): Promise<void>;
    eventNames(): (string | symbol)[];
    listeners<T extends string | symbol>(event: T): ((...args: any[]) => void)[];
    listenerCount(event: string | symbol): number;
    emit<T extends string | symbol>(event: T, ...args: any[]): boolean;
    on<T extends string | symbol>(event: T, fn: (...args: any[]) => void, context?: any): this;
    addListener<T extends string | symbol>(event: T, fn: (...args: any[]) => void, context?: any): this;
    once<T extends string | symbol>(event: T, fn: (...args: any[]) => void, context?: any): this;
    removeListener<T extends string | symbol>(event: T, fn?: ((...args: any[]) => void) | undefined, context?: any, once?: boolean | undefined): this;
    off<T extends string | symbol>(event: T, fn?: ((...args: any[]) => void) | undefined, context?: any, once?: boolean | undefined): this;
    removeAllListeners(event?: string | symbol | undefined): this;
    activateLogging(): Promise<void>;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    initialize: () => Promise<void>;
    send: (msg: ButtplugMessage) => void;
    readonly Connected: boolean;
}
