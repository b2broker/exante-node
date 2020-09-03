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
  /**
   * API version
   */
  version?: "2.0" | "3.0";
}

export interface ISymbolId extends IVersion {
  /**
   * Financial instrument ids
   */
  symbolId: string | string[];
}

export interface ICrossrateOptions extends IVersion {
  /**
   * From currency
   */
  from: string;
  /**
   * To currency
   */
  to: string;
}

export interface IAccountSummaryOptions extends IVersion {
  /**
   * Account id
   */
  id: string;
  /**
   * Session date
   */
  date: string;
  /**
   * Summary's currency
   */
  currency: string;
}

export interface IUserAccount {
  /**
   * Account status
   */
  status: "ReadOnly" | "CloseOnly" | "Full";
  /**
   * Account ID
   */
  accountId: string;
}

export interface IDailyChange {
  /**
   * Previous session close price, required api 3.0 only
   */
  lastSessionClosePrice?: string | null;
  /**
   * Previous session close price
   */
  basePrice?: string | null;
  /**
   * Symbol id
   */
  symbolId: string;
  /**
   * Absolute daily change of the price at the moment of request
   */
  dailyChange?: string | null;
}

export interface ICurrencies {
  /**
   * Currencies
   */
  currencies: string[];
}

export interface ICrossrate {
  /**
   * Symbol id
   */
  symbolId?: string | null;
  /**
   * Crossrate pair
   */
  pair: string;
  /**
   * Current crossrate
   */
  rate: string;
}

export interface IExchange {
  /**
   * Exchange internal id
   */
  id: string;
  /**
   * Exchange country
   */
  country?: string | null;
  /**
   * Full exchange name
   */
  name?: string | null;
}

export interface ICurrency {
  /**
   * Currency code
   */
  code: string;
  /**
   * Converted value of position
   */
  convertedValue: string;
  /**
   * Value of position
   */
  value?: string;
  /**
   * Value of position
   */
  price?: string;
}

export interface IPosition {
  /**
   * Current position PnL in the currency of the report
   */
  convertedPnl: string;
  /**
   * Quantity on position
   */
  quantity?: string;
  /**
   * Current position PnL
   */
  pnl?: string;
  /**
   * Symbol id
   */
  symbolId: string;
  /**
   * Position value in the currency of the report
   */
  convertedValue?: string;
  /**
   * Current financial instrument price
   */
  price?: string;
  /**
   * Symbol type
   */
  symbolType: string;
  /**
   * Currency code
   */
  currency: string;
  /**
   * Average position opening price
   */
  averagePrice?: string;
  /**
   * Position value
   */
  value?: string;
  /**
   * Symbol id
   */
  id?: string;
}

export interface IAccountSummary {
  /**
   * Currency of the report
   */
  currency: string;
  /**
   * User account id
   */
  account?: string;
  /**
   * Free money in the currency of the report
   */
  freeMoney?: string;
  /**
   * User account id
   */
  accountId?: string;
  /**
   * Total NAV of user in the currency of the report
   */
  netAssetValue?: string;
  /**
   * Session date of the report
   */
  sessionDate?: [number, number, number];
  /**
   * Timestamp of the report
   */
  timestamp: number;
  /**
   * Money used for margin in the currency of the report
   */
  moneyUsedForMargin?: string;
  /**
   * Margin utilization in fraction of NAV
   */
  marginUtilization?: string;
  /**
   * Currencies on position
   */
  currencies: ICurrency[];
  /**
   * Open positions
   */
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
   * Get the list of available currencies
   */
  public async getCurrencies({
    version = DefaultAPIVersion,
  }: IVersion = {}): Promise<ICurrencies> {
    const url = new URL(`/md/${version}/crossrates`, this.url);
    const changes = (await this.fetch(url)) as ICurrencies;
    return changes;
  }

  /**
   * Get the crossrate from one currency to another
   */
  public async getCrossrate({
    version = DefaultAPIVersion,
    from,
    to,
  }: ICrossrateOptions): Promise<ICrossrate> {
    const url = new URL(`/md/${version}/crossrates/${from}/${to}`, this.url);
    const crossrate = (await this.fetch(url)) as ICrossrate;
    return crossrate;
  }

  /**
   * Get list of exchanges
   */
  public async getExchanges({
    version = DefaultAPIVersion,
  }: IVersion = {}): Promise<IExchange[]> {
    const url = new URL(`/md/${version}/exchanges`, this.url);
    const exchanges = (await this.fetch(url)) as IExchange[];
    return exchanges;
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

  /**
   * Add query to URL
   */
  public static setQuery(
    url: URL,
    query: Record<string, string | number | undefined>
  ): void {
    for (const key in query) {
      const value = query[key];
      if (value !== undefined) {
        url.searchParams.set(key, value.toString());
      }
    }
  }
}

export default RestClient;
