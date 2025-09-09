import type { EventMap } from './types';

type Handler<K extends keyof EventMap> = (payload: EventMap[K]) => Promise<void> | void;

class Bus {
  private handlers: Partial<{ [K in keyof EventMap]: Handler<K>[] }> = {};

  on<K extends keyof EventMap>(event: K, handler: Handler<K>) {
    const list = (this.handlers[event] ??= [] as Handler<K>[]);
    list.push(handler);
  }

  async emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    const list = (this.handlers[event] ?? []) as Handler<K>[];
    for (const h of list) await h(payload);
  }
}

export const bus = new Bus();
