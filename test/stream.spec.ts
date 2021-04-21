import assert from "assert";
import { JSONStream } from "../";

suite("JSONStream", () => {
  test("._transform()", async () => {
    const message = { event: "heartbeat" };
    const stream = new JSONStream();

    await new Promise<void>((resolve) => {
      stream.once("data", (data) => {
        assert.deepStrictEqual(data, message);
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
        assert.deepStrictEqual(
          (error as { json_string?: string })?.json_string,
          json_string
        );
        assert.deepStrictEqual(error.message, message);
        assert.deepStrictEqual(error.name, "SyntaxError");
        assert.ok(error instanceof SyntaxError);
        resolve();
      });
      stream.write(Buffer.from(json_string));
    });
  });
});
