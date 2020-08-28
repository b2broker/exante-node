import { createHmac } from "crypto";
import fetch from "node-fetch";

import FetchError from "./error";

export const ExanteDemoURL = "https://api-demo.exante.eu/";
export const ExanteLiveURL = "https://api-live.exante.eu/";

export interface IExanteOptions {
  client_id: string;
  app_id: string;
  shared_key: string;
  demo?: boolean;
  url?: string | URL;
}

export interface IVersion {
  version?: "2.0" | "3.0";
}

export interface IUserAccount {
  status: string;
  accountId: string;
}

export class RestClient {
  readonly #client_id: string;
  readonly #app_id: string;
  readonly #shared_key: string;

  public readonly url: URL;

  constructor({
    client_id,
    app_id,
    shared_key,
    demo = false,
    url = demo ? ExanteDemoURL : ExanteLiveURL,
  }: IExanteOptions) {
    this.#client_id = client_id;
    this.#app_id = app_id;
    this.#shared_key = shared_key;
    this.url = new URL(url.toString());
  }

  public async fetch(
    url: string | URL,
    { headers = this.headers, ...options }: fetch.RequestInit = {}
  ): Promise<unknown> {
    const response = await fetch(url.toString(), { headers, ...options });

    if (!response.ok) {
      throw new FetchError(response.statusText, response);
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      throw new FetchError(error.message, response);
    }
  }

  /**
   * Get the list of user accounts and their statuses
   */
  public async getAccounts({ version = "2.0" }: IVersion = {}): Promise<
    IUserAccount[]
  > {
    const url = new URL(`/md/${version}/accounts`, this.url);
    const accounts = (await this.fetch(url)) as IUserAccount[];
    return accounts;
  }

  private get token(): string {
    const header = RestClient.base64URL({ alg: "HS256", typ: "JWT" });

    const iat = (Date.now() / 1000) | 0;

    const payload = RestClient.base64URL({
      sub: this.#app_id,
      iss: this.#client_id,
      iat,
      exp: iat + 5,
      aud: [
        "symbols",
        "feed",
        "change",
        "ohlc",
        "crossrates",
        "summary",
        "transactions",
        "orders",
      ],
    });

    const signature = RestClient.base64URL(
      createHmac("sha256", this.#shared_key)
        .update(`${header}.${payload}`)
        .digest("base64")
    );

    return `${header}.${payload}.${signature}`;
  }

  private get headers(): fetch.Headers {
    return new fetch.Headers({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
  }

  public static base64URL(
    input: string | Record<string, unknown> | Buffer
  ): string {
    if (input instanceof Buffer) {
      const string = input.toString("base64");
      return RestClient.base64URL(string);
    } else if (typeof input === "object") {
      const string = Buffer.from(JSON.stringify(input)).toString("base64");
      return RestClient.base64URL(string);
    }
    return input.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  }
}

export default RestClient;
