import { Transform } from "stream";

type Callback = (error: Error | null) => void;

export class JSONStream extends Transform {
  public constructor() {
    super({ objectMode: true });
  }

  public _transform(chunk: Buffer, _encoding: string, cb: Callback): void {
    try {
      const messages = chunk.toString("utf8").split("\n");
      for (const message of messages) {
        if (message) {
          this.push(JSON.parse(message));
        }
      }
      cb(null);
    } catch (error) {
      cb(error);
    }
  }
}

export default JSONStream;
