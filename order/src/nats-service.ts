import nats, { Stan } from "node-nats-streaming";

class NatsService {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error("cannot access NATS client before connecting");
    }

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string): Promise<void> {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise((resolve, reject) => {
      this.client.on("connect", () => {
        console.log("NATS connected...");
        resolve();
      });

      this.client.on("error", (err) => {
        if (err) reject(err);
      });
    });
  }
}

export const natsService = new NatsService();
