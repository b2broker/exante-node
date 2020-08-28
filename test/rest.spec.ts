import assert from "assert";
import nock from "nock";
import fetch from "node-fetch";

import { RestClient, ExanteDemoURL, ExanteLiveURL, FetchError } from "../";

const client_id = "d0c5340b-6d6c-49d9-b567-48c4bfca13d2";
const app_id = "6cca6a14-a5e3-4219-9542-86123fc9d6c3";
const shared_key = "5eeac64cc46b34f5332e5326/CHo4bRWq6pqqynnWKQg";

const url = "https://some-other-api.exante.eu/";

const client = new RestClient({ client_id, shared_key, app_id, url });

suite("RestClient", () => {
  test("constructor", () => {
    assert.deepStrictEqual(client.url.href, url);
  });

  test("constructor (when `demo` is `true`)", () => {
    const client = new RestClient({
      client_id,
      shared_key,
      app_id,
      demo: true,
    });
    assert.deepStrictEqual(client.url.href, ExanteDemoURL);
  });

  test("constructor (when `demo` is `false`)", () => {
    const client = new RestClient({
      client_id,
      shared_key,
      app_id,
      demo: false,
    });
    assert.deepStrictEqual(client.url.href, ExanteLiveURL);
  });

  test(".fetch()", async () => {
    const response = { ok: 1 };

    nock(url).get("/").delay(1).reply(200, response);

    const data = await client.fetch(url);

    assert.deepStrictEqual(data, response);
  });

  test(".fetch() (throws `FetchError` on non 2xx responses)", async () => {
    nock(url).get("/").delay(1).reply(404);

    try {
      await client.fetch(url);
      throw new Error("Should throw a FetchError");
    } catch (error) {
      assert.ok(error instanceof FetchError);
      assert.ok(error.response instanceof fetch.Response);
    }
  });

  test(".fetch() (throws `FetchError` on non json reposonses)", async () => {
    nock(url).get("/").delay(1).reply(200, "notjson");

    try {
      await client.fetch(url);
      throw new Error("Should throw a FetchError");
    } catch (error) {
      assert.ok(error instanceof FetchError);
      assert.ok(error.response instanceof fetch.Response);
    }
  });

  test(".getAccounts()", async () => {
    const version = "3.0";
    const response = [
      { status: "Full", accountId: "ABC1234.002" },
      { status: "Full", accountId: "ABC1234.001" },
    ];

    nock(url).get(`/md/${version}/accounts`).delay(1).reply(200, response);

    const accounts = await client.getAccounts({ version });
    assert.deepStrictEqual(accounts, response);
  });

  test(".getAccounts() (with no arguments)", async () => {
    const version = "2.0";
    const response = [
      { status: "Full", accountId: "ABC1234.002" },
      { status: "Full", accountId: "ABC1234.001" },
    ];

    nock(url).get(`/md/${version}/accounts`).delay(1).reply(200, response);

    const accounts = await client.getAccounts();
    assert.deepStrictEqual(accounts, response);
  });

  suite("Static methods", () => {
    test(".base64URL()", () => {
      const string = "Somestring+=";
      const buffer = Buffer.from([1, 2, 3, 4, 5]);
      const object = { a: 1, b: "@2" };

      const base64URLEncodedString = "Somestring-";
      const base64URLEncodedBuffer = "AQIDBAU";
      const base64URLEncodedObject = "eyJhIjoxLCJiIjoiQDIifQ";

      assert.deepStrictEqual(
        RestClient.base64URL(string),
        base64URLEncodedString
      );
      assert.deepStrictEqual(
        RestClient.base64URL(buffer),
        base64URLEncodedBuffer
      );
      assert.deepStrictEqual(
        RestClient.base64URL(object),
        base64URLEncodedObject
      );
    });
  });
});
