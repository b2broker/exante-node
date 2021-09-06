import { Transform } from "node:stream";

type Callback = (error: Error | null) => void;

export class JSONStream extends Transform {
  #buffer: string;

  public constructor() {
    super({ objectMode: true });
    this.#buffer = "";
  }

  public _transform(chunk: Buffer, _encoding: string, cb: Callback): void {
    const text = this.#buffer + chunk.toString("utf8");

    this.#buffer = "";

    const messages = text.split("\n").filter((s) => s);

    if (!text.endsWith("\n")) {
      const last_chunk = messages.pop();

      if (last_chunk) {
        this.#buffer = last_chunk;
      }
    }

    for (const message of messages) {
      try {
        this.push(JSON.parse(message));
      } catch (error: unknown) {
        (error as { json_string?: string }).json_string = message;
        (error as { chunk?: string }).chunk = text;
        cb(error as Error);
        return;
      }
    }

    cb(null);
  }
}

export default JSONStream;
