import { createHmac } from "crypto";
import fetch from "node-fetch";

import FetchError from "./error";

export const ExanteDemoURL = "https://api-demo.exante.eu/";
export const ExanteLiveURL = "https://api-live.exante.eu/";
export const DefaultAPIVersion = "2.0";

export interface IExanteOptions {
  /**
   * Client id
   */
  client_id: string;
  /**
   * Application id
   */
  app_id: string;
  /**
   * Shared secret
   */
  shared_key: string;
  /**
   * Use demo endpoint
   */
  demo?: boolean;
  /**
   * Base url - e.g., https://api-live.exante.eu/
   */
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

export interface ILastQuoteOptions extends IVersion {
  /**
   * Symbol id or symbol ids
   */
  symbolIds: string | string[];
  /**
   * Quote level
   */
  level?: "best_price" | "market_depth";
}

export type ICandleSize =
  | "60"
  | "300"
  | "600"
  | "900"
  | "3600"
  | "14400"
  | "21600"
  | "86400";

export interface ICandlesOptions extends ISymbolId {
  /**
   * Aggregation interval in seconds
   */
  duration: ICandleSize;
  /**
   * Starting timestamp in ms
   */
  from?: string | number;
  /**
   * Ending timestamp in ms
   */
  to?: string | number;
  /**
   * Maximum amount of candles to retrieve
   */
  size?: string | number;
}

export interface ITicksOptions extends ISymbolId {
  /**
   * Starting timestamp in ms
   */
  from?: string | number;
  /**
   * Ending timestamp in ms
   */
  to?: string | number;
  /**
   * Maximum amount of candles to retrieve
   */
  size?: string | number;
  /**
   * Tick types
   */
  type?: "quotes" | "trades";
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

export interface ITransactionsOptions extends IVersion {
  /**
   * Transaction UUID
   */
  uuid?: string;
  /**
   * Transaction account ID
   */
  accountId?: string;
  /**
   * Filter transactions by the symbol id
   */
  symbolId?: string;
  /**
   * Asset
   */
  asset?: string;
  /**
   * Transaction types
   */
  operationType?: string | string[];
  /**
   * Offset to list transactions
   */
  offset?: number;
  /**
   * Limit response to this amount of transactions
   */
  limit?: number;
  /**
   * Order transactions by descending or ascending
   */
  order?: "ASC" | "DESC";
  /**
   * Starting timestamp of transactions in ISO format
   */
  fromDate?: string;
  /**
   * Ending timestamp of transactions in ISO format
   */
  toDate?: string;
  /**
   * Filter transactions by the order id
   */
  orderId?: string;
  /**
   * Filter transactions by the position in the order
   */
  orderPos?: number;
}

export type ISide = "buy" | "sell";

export type IOrderType =
  | "unknown"
  | "market"
  | "limit"
  | "stop"
  | "stop_limit"
  | "twap"
  | "trailing_stop"
  | "iceberg";

export type IDuration =
  | "unknown"
  | "day"
  | "fill_or_kill"
  | "immediate_or_cancel"
  | "good_till_cancel"
  | "good_till_time"
  | "at_the_opening"
  | "at_the_close";

interface IBasePlaceOrderOptions extends IVersion {
  /**
   * Client tag to identify or group orders
   */
  clientTag?: string;
  /**
   * Order type
   */
  orderType: IOrderType;
  /**
   * Order side
   */
  side: ISide;
  /**
   * Price of stop loss order
   */
  stopLoss?: string;
  /**
   * Order limit price
   */
  limitPrice?: string;
  /**
   * Order stop price
   */
  stopPrice?: string;
  /**
   * Order quantity
   */
  quantity: string;
  /**
   * Order partial quantity, twap and iceberg orders only
   */
  partQuantity?: string;
  /**
   * Id of an order on which this order depends
   */
  ifDoneParentId?: string | null;
  /**
   * Order duration
   */
  duration: IDuration;
  /**
   * User account to place order
   */
  accountId?: string;
  /**
   * Price of take profit order
   */
  takeProfit?: string;
  /**
   * Order place interval, twap orders only
   */
  placeInterval?: string;
  /**
   * One-Cancels-the-Other group ID if set
   */
  ocoGroup?: string | null;
  /**
   * Order expiration
   */
  gttExpiration?: string;
  /**
   * Order price distance, trailing_stop orders only
   */
  priceDistance?: string;
}

export interface IPlaceOrderOptionsV2 extends IBasePlaceOrderOptions {
  /**
   * Order instrument
   */
  instrument: string;
}

export interface IPlaceOrderOptionsV3 extends IBasePlaceOrderOptions {
  /**
   * Order instrument
   */
  symbolId: string;
}

export type IPlaceOrderOptions = IPlaceOrderOptionsV2 | IPlaceOrderOptionsV3;

interface IBaseOrdersOptions extends IVersion {
  /**
   * The limit for max items of the order list
   */
  limit?: string;
  /**
   * The start date
   */
  from?: string;
  /**
   * The stop date
   */
  to?: string;
}

export interface IOrdersOptionsV2 extends IBaseOrdersOptions {
  /**
   * User account
   */
  account: string;
}

export interface IOrdersOptionsV3 extends IBaseOrdersOptions {
  /**
   * User account
   */
  accountId: string;
}

export type IOrdersOptions = IOrdersOptionsV2 | IOrdersOptionsV3;

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

export interface IQuoteSideV2 {
  /**
   * Quantity value
   */
  size: string;
  /**
   * Quantity value
   */
  value: string;
}

export interface IQuoteSideV3 {
  /**
   * Quantity value
   */
  size: string;
  /**
   * Quantity value
   */
  price: string;
}

export type IQuoteSide = IQuoteSideV2 | IQuoteSideV3;

interface ITickBase {
  /**
   * Tick timestamp
   */
  timestamp: number;
  /**
   * Symbol id
   */
  symbolId: string;
}

export interface ILastQuote extends ITickBase {
  /**
   * Array of bid levels
   */
  bid: IQuoteSide[];
  /**
   * Array of ask levels
   */
  ask: IQuoteSide[];
}

export interface ICandle {
  /**
   * Candle timestamp
   */
  timestamp: number;
  /**
   * Candle open price
   */
  open: string;
  /**
   * Candle low price
   */
  low: string;
  /**
   * Candle close price
   */
  close: string;
  /**
   * Candle high price
   */
  high: string;
  /**
   * Total volume
   */
  volume?: string;
}

export interface ITradeTickV2 extends ITickBase {
  /**
   * Trade price
   */
  value: string;
  /**
   * Trade size
   */
  size: string;
}

export interface ITradeTickV3 extends ITickBase {
  /**
   * Trade price
   */
  price: string;
  /**
   * Trade size
   */
  size: string;
}

export type ITick = ILastQuote | ITradeTickV2 | ITradeTickV3;

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

interface ITransactionBase {
  /**
   * Transaction id
   */
  id: number;
  /**
   * Transaction type
   */
  operationType: string;
  /**
   * Transaction symbol id
   */
  symbolId: string | null;
  /**
   * Transaction asset
   */
  asset: string;
  /**
   * Transaction account id
   */
  accountId: string;
  /**
   * Transaction amount
   */
  sum: string;
}

export interface ITransactionV2 extends ITransactionBase {
  /**
   * Timestamp of the transaction
   */
  when: number;
}

export interface ITransactionV3 extends ITransactionBase {
  /**
   * Timestamp of the transaction
   */
  timestamp: number;
}

export type ITransactions = ITransactionV2[] | ITransactionV3[];

export type IOrdersStatus =
  | "placing"
  | "working"
  | "cancelled"
  | "pending"
  | "filled"
  | "rejected";

interface IBaseFill {
  /**
   * Fill quantity
   */
  quantity: string;
  /**
   * Fill serial number
   */
  position: string;
  /**
   * Fill price
   */
  price: string;
}

export interface IFillV2 extends IBaseFill {
  /**
   * Fill time
   */
  time: string;
}

export interface IFillV3 extends IBaseFill {
  /**
   * Fill time
   */
  timestamp: string;
}

export type IFill = IFillV2 | IFillV3;

interface IBaseOrderState {
  /**
   * Order status
   */
  status: IOrdersStatus;
  /**
   * Order last update time
   */
  lastUpdate: string;
  /**
   * Order rejected reason
   */
  reason?: string;
}

export interface IOrderStateV2 extends IBaseOrderState {
  /**
   * Order fills
   */
  fills: IFillV2[];
}

export interface IOrderStateV3 extends IBaseOrderState {
  /**
   * Order fills
   */
  fills: IFillV3[];
}

export type IOrderState = IOrderStateV2 | IOrderStateV3;

interface IBaseOrder {
  /**
   * Client tag to identify or group orders
   */
  clientTag?: string;
  /**
   * Associated account ID
   */
  accountId: string;
  /**
   * Associated name
   */
  username?: string;
  /**
   * Current order modification unique ID
   */
  currentModificationId: string;
  /**
   * Current order modification unique ID
   */
  placeTime: string;
}

export interface IOrderV2 extends IBaseOrder {
  /**
   * Order response parameters
   */
  orderParameters: IPlaceOrderOptionsV2;
  /**
   * Order state response
   */
  orderState: IOrderStateV2;
  /**
   * Unique order id
   */
  id: string;
}

export interface IOrderV3 extends IBaseOrder {
  /**
   * Order response parameters
   */
  orderParameters: IPlaceOrderOptionsV3;
  /**
   * Order state response
   */
  orderState: IOrderStateV3;
  /**
   * Unique order id
   */
  orderId: string;
}

export type IOrder = IOrderV2 | IOrderV3;

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

  /**
   * Make a request and parse the body as JSON
   */
  public async fetch(
    url: string | URL,
    { headers = this.headers, ...options }: fetch.RequestInit = {}
  ): Promise<unknown> {
    const response = await RestClient.fetch(url, { headers, ...options });

    return response;
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
   * Get the last quote
   */
  public async getLastQuote({
    version = DefaultAPIVersion,
    symbolIds,
    level,
  }: ILastQuoteOptions): Promise<ILastQuote[]> {
    const url = new URL(`/md/${version}/feed/${symbolIds}/last`, this.url);
    RestClient.setQuery(url, { level });
    const exchanges = (await this.fetch(url)) as ILastQuote[];
    return exchanges;
  }

  /**
   * Get the list of OHLC candles
   */
  public async getCandles({
    version = DefaultAPIVersion,
    symbolId,
    duration,
    ...query
  }: ICandlesOptions): Promise<ICandle[]> {
    const url = new URL(
      `/md/${version}/ohlc/${symbolId}/${duration}`,
      this.url
    );
    RestClient.setQuery(url, { ...query });

    const candles = (await this.fetch(url)) as ICandle[];
    return candles;
  }

  /**
   * Get the list of ticks
   */
  public async getTicks({
    version = DefaultAPIVersion,
    symbolId,
    ...query
  }: ITicksOptions): Promise<ITick[]> {
    const url = new URL(`/md/${version}/ticks/${symbolId}`, this.url);
    RestClient.setQuery(url, { ...query });

    const ticks = (await this.fetch(url)) as ITick[];
    return ticks;
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

  /**
   * Get the list of transactions
   */
  public async getTransactions({
    version = DefaultAPIVersion,
    operationType,
    ...query
  }: ITransactionsOptions = {}): Promise<ITransactions> {
    if (Array.isArray(operationType)) {
      operationType = `${operationType}`;
    }
    const url = new URL(`/md/${version}/transactions`, this.url);
    RestClient.setQuery(url, { operationType, ...query });

    const transactions = (await this.fetch(url)) as ITransactions;
    return transactions;
  }

  /**
   * Place new trading order
   */
  public async placeOrder({
    version = DefaultAPIVersion,
    ...data
  }: IPlaceOrderOptions): Promise<IOrder[]> {
    const url = new URL(`/trade/${version}/orders`, this.url);
    const method = "POST";
    const body = JSON.stringify(data);

    const order = (await this.fetch(url, { method, body })) as IOrder[];

    return order;
  }

  /**
   * Get the list of historical orders
   */
  public async getOrders({
    version = DefaultAPIVersion,
    ...query
  }: IOrdersOptions): Promise<IOrder[]> {
    const url = new URL(`/trade/${version}/orders`, this.url);
    RestClient.setQuery(url, { ...query });

    const orders = (await this.fetch(url)) as IOrder[];
    return orders;
  }

  /**
   * Get a JSON Web Token
   */
  private get token(): string {
    const iat = (Date.now() / 1000) | 0;

    const payload = {
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
    };

    const jwt = RestClient.JWT(this.#shared_key, payload);

    return jwt;
  }

  /**
   * Get authorization headers
   */
  private get headers(): fetch.Headers {
    return new fetch.Headers({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
  }

  /**
   * Convert to Base64URL
   */
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

  /**
   * Get a JSON Web Token (HMAC + SHA256)
   */
  public static JWT(
    secret: string,
    payload: Record<string, unknown> | string | Buffer,
    header:
      | Record<string, unknown>
      | string
      | Buffer = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
  ): string {
    const encodedHeader = RestClient.base64URL(header);
    const encodedPayload = RestClient.base64URL(payload);
    const signature = createHmac("sha256", secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64");
    const encodedSignature = RestClient.base64URL(signature);
    const jwt = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
    return jwt;
  }

  /**
   * Make a request and parse the body as JSON
   */
  public static async fetch(
    url: string | URL,
    options: fetch.RequestInit = {}
  ): Promise<unknown> {
    const response = await fetch(url.toString(), { ...options });

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
}

export default RestClient;
