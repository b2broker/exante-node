import type fetch from "node-fetch";

export class FetchError extends Error {
  readonly #response: fetch.Response;

  public readonly name = "FetchError";

  constructor(message: string, response: fetch.Response) {
    super(message);
    this.#response = response;
  }

  public get response(): fetch.Response {
    return this.#response;
  }
}

export default FetchError;
