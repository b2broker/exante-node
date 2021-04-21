import { Transform } from "stream";

type Callback = (error: Error | null) => void;

export class JSONStream extends Transform {
  public constructor() {
    super({ objectMode: true });
  }

  public _transform(chunk: Buffer, _encoding: string, cb: Callback): void {
    const messages = chunk.toString("utf8").split("\n");
    for (const message of messages) {
      if (message) {
        try {
          this.push(JSON.parse(message));
        } catch (error: unknown) {
          (error as { json_string?: string }).json_string = message;
          cb(error as Error);
          return;
        }
      }
    }
    cb(null);
  }
}

export default JSONStream;
