import type { topic, handler, exchangeId, ExchangeSpectator} from './interfaces'

const EXCHANGES: Record<exchangeId, ExchangeSpectator> = {
  bybit: {
    url: 'wss://stream.bybit.com/v5/public/spot',
    subscribeMsg: (topic) => ({ op: 'subscribe', args: [topic] }),
  },
  binance: {
    url: 'wss://stream.binance.com:9443/ws',
    subscribeMsg: (topic) => ({ method: 'SUBSCRIBE', params: [topic], id: Date.now() }),
  },
};

class SocketManager {
  private connections = new Map<exchangeId, WebSocket>();
  private handlers = new Map<exchangeId, Map<topic, Set<handler>>>();

	сonnectToExchange(exchange: exchangeId): WebSocket {
		// открытие нового сокета / получение сущ сокета
    if (!this.connections.has(exchange)) {
      const spec = EXCHANGES[exchange];
      const ws = new WebSocket(spec.url);

      ws.onopen = () => {
        const topics = this.handlers.get(exchange)?.keys() || [];
        for (const topic of topics) {
          ws.send(JSON.stringify(spec.subscribeMsg(topic)));
        }
      };

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        const topic = this.extractTopic(exchange, msg);
        const topicHandlers = this.handlers.get(exchange)?.get(topic);
        if (topicHandlers) {
          topicHandlers.forEach(h => h(msg));
        }
      };

      this.connections.set(exchange, ws);
      this.handlers.set(exchange, new Map());
    }
    return this.connections.get(exchange)!;
  }

  private extractTopic(exchange: exchangeId, msg: any): string {
    if (exchange === 'bybit') return msg.topic;
    // if (exchange === 'binance') {
    //   return msg.params?.[0] || (typeof msg.result === 'string' ? msg.result : '');
    // }
    return 'unknown';
  }

  subscribe(exchange: exchangeId, topic: topic, handler: handler): () => void {
    this.сonnectToExchange(exchange);

    if (!this.handlers.get(exchange)!.has(topic)) {
      this.handlers.get(exchange)!.set(topic, new Set());
      const ws = this.connections.get(exchange)!;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(EXCHANGES[exchange].subscribeMsg(topic)));
      }
    }

    this.handlers.get(exchange)!.get(topic)!.add(handler);

    return () => {
      const handlersSet = this.handlers.get(exchange)?.get(topic);
      if (handlersSet) {
        handlersSet.delete(handler);
        if (handlersSet.size === 0) {
          this.handlers.get(exchange)!.delete(topic);
        }
      }
    };
  }
}

export const socketManager = new SocketManager();