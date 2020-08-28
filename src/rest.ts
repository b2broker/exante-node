import { createHmac } from "crypto";
import fetch from "node-fetch";

import FetchError from "./error";

export const ExanteDemoURL = "https://api-demo.exante.eu/";
export const ExanteLiveURL = "https://api-live.exante.eu/";
export const DefaultAPIVersion = "2.0";

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

export interface ISymbolId extends IVersion {
  symbolId: string | string[];
}

export interface IAccountSummaryOptions extends IVersion {
  id: string;
  date: string;
  currency: string;
}

export interface IUserAccount {
  status: string;
  accountId: string;
}

export interface IDailyChange {
  lastSessionClosePrice?: string | null;
  basePrice?: string | null;
  symbolId: string;
  dailyChange?: string | null;
}

export interface ICurrency {
  code: string;
  convertedValue: string;
  value?: string;
  price?: string;
}

export interface IPosition {
  convertedPnl: string;
  quantity?: string;
  pnl?: string;
  symbolId: string;
  convertedValue?: string;
  price?: string;
  symbolType: string;
  currency: string;
  averagePrice?: string;
  value?: string;
  id?: string;
}

export interface IAccountSummary {
  currency: string;
  account?: string;
  freeMoney?: string;
  accountId?: string;
  netAssetValue?: string;
  sessionDate?: [number, number, number];
  timestamp: number;
  moneyUsedForMargin?: string;
  marginUtilization?: string;
  currencies: ICurrency[];
  positions: IPosition[];
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
  public async getAccounts({
    version = DefaultAPIVersion,
  }: IVersion = {}): Promise<IUserAccount[]> {
    const url = new URL(`/md/${version}/accounts`, this.url);
    const accounts = (await this.fetch(url)) as IUserAccount[];
    return accounts;
  }

  /**
   * Get the list of daily changes
   */
  public async getDailyChanges({
    version = DefaultAPIVersion,
  }: IVersion = {}): Promise<IDailyChange[]> {
    const url = new URL(`/md/${version}/change`, this.url);
    const changes = (await this.fetch(url)) as IDailyChange[];
    return changes;
  }

  /**
   * Get the list of daily changes for requested instruments
   */
  public async getDailyChange({
    version = DefaultAPIVersion,
    symbolId,
  }: ISymbolId): Promise<IDailyChange[]> {
    const url = new URL(`/md/${version}/change/${symbolId}`, this.url);
    const changes = (await this.fetch(url)) as IDailyChange[];
    return changes;
  }

  /**
   * Get the summary for the specified account.
   */
  public async getAccountSummary({
    version = DefaultAPIVersion,
    id,
    date,
    currency,
  }: IAccountSummaryOptions): Promise<IAccountSummary> {
    const url = new URL(
      `/md/${version}/summary/${id}/${date}/${currency}`,
      this.url
    );

    const summary = (await this.fetch(url)) as IAccountSummary;
    return summary;
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
