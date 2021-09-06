import { deepStrictEqual, ok } from "node:assert";
import { JSONStream } from "../index.js";

suite("JSONStream", () => {
  test("._transform()", async () => {
    const message = { event: "heartbeat" };
    const stream = new JSONStream();

    await new Promise<void>((resolve) => {
      stream.once("data", (data) => {
        deepStrictEqual(data, message);
        resolve();
      });
      stream.write(Buffer.from(`${JSON.stringify(message)}\n`));
    });
  });

  test("._transform() (passes errors)", async () => {
    const json_string = "Not JSON";
    const message = "Unexpected token N in JSON at position 0";
    const stream = new JSONStream();

    await new Promise<void>((resolve) => {
      stream.once("error", (error) => {
        deepStrictEqual(
          (error as { json_string?: string })?.json_string,
          json_string
        );
        deepStrictEqual(error.message, message);
        deepStrictEqual(error.name, "SyntaxError");
        ok(error instanceof SyntaxError);
        resolve();
      });
      stream.write(Buffer.from(`${json_string}\n`));
    });
  });

  test("._transform() (buffers data)", async () => {
    const message1 = { event: "heartbeat" };
    const message2 = { data: "message" };
    const buf1 = Buffer.from(JSON.stringify(message1));
    const buf2 = Buffer.from(JSON.stringify(message2));
    const stream = new JSONStream();

    const promise = new Promise<void>((resolve) => {
      stream.once("data", (data1) => {
        deepStrictEqual(data1, message1);
        stream.once("data", (data2) => {
          deepStrictEqual(data2, message2);
          resolve();
        });
      });
    });

    for (let i = 0; i < buf1.byteLength; i++) {
      await new Promise<void>((resolve, reject) => {
        stream.write(buf1.slice(i, i + 1), (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }

    await new Promise<void>((resolve, reject) => {
      stream.write("\n", (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    for (let i = 0; i < buf2.byteLength; i++) {
      await new Promise<void>((resolve, reject) => {
        stream.write(buf2.slice(i, i + 1), (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }

    await new Promise<void>((resolve, reject) => {
      stream.write("\n", (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    await promise;
  });
});
