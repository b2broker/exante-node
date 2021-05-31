import { Transform } from "stream";

type Callback = (error: Error | null) => void;

export class JSONStream extends Transform {
  public constructor() {
    super({ objectMode: true });
  }

  public _transform(chunk: Buffer, _encoding: string, cb: Callback): void {
    const text = chunk.toString("utf8");
    const messages = text.split("\n");

    for (const message of messages) {
      if (message) {
        try {
          this.push(JSON.parse(message));
        } catch (error: unknown) {
          (error as { json_string?: string }).json_string = message;
          (error as { chunk?: string }).chunk = text;
          cb(error as Error);
          return;
        }
      }
    }

    cb(null);
  }
}

export default JSONStream;
