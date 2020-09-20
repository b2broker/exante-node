import { Transform } from "stream";

type Callback = (error: Error | null) => void;

export class JSONStream extends Transform {
  public constructor() {
    super({ objectMode: true });
  }

  public _transform(chunk: Buffer, _encoding: string, callback: Callback) {
    try {
      const messages = chunk.toString("utf8").split("\n");

      for (const message of messages) {
        if (message) {
          this.push(JSON.parse(message));
        }
      }

      callback(null);
    } catch (error) {
      callback(error);
    }
  }
}

export default JSONStream;
