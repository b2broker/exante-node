import { createHmac } from "crypto";
import fetch from "node-fetch";

import JSONStream from "./stream";

export const ExanteDemoURL = "https://api-demo.exante.eu/";
export const ExanteLiveURL = "https://api-live.exante.eu/";
export const DefaultAPIVersion = "2.0";

export interface IExanteOptions {
  /** Client id */
  client_id: string;
  /** Application id */
  app_id: string;
  /** Shared secret */
  shared_key: string;
  /** Use demo endpoint */
  demo?: boolean;
  /** Base url - e.g., https://api-live.exante.eu/ */
  url?: string | URL;
}

export interface IVersion {
  /** API version */
  version?: "2.0" | "3.0";
}

export interface ISymbolId extends IVersion {
  /** Financial instrument ids */
  symbolId: string | string[];
}

export interface ICrossrateOptions extends IVersion {
  /** From currency */
  from: string;
  /** To currency */
  to: string;
}

export interface IExchangeId extends IVersion {
  /** Exchange id */
  exchangeId: string;
}

export interface IGroupId extends IVersion {
  /** Group id */
  groupId: string;
}

export interface ISymbolIdOptions extends IVersion {
  /** Financial instrument id */
  symbolId: string;
}

export interface ISymbolSchedule extends ISymbolIdOptions {
  /** Show available order types */
  types?: boolean;
}

export interface ISymbolIdType extends IVersion {
  /** Type name */
  symbolType: string;
}

export interface ISymbolIds {
  /** Financial instrument id */
  symbolIds: string | string[];
}

export interface ILastQuoteOptions extends IVersion {
  /** Symbol id or symbol ids */
  symbolIds: string | string[];
  /** Quote level */
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
  /** Aggregation interval in seconds */
  duration: ICandleSize;
  /** Starting timestamp in ms */
  from?: string | number;
  /** Ending timestamp in ms */
  to?: string | number;
  /** Maximum amount of candles to retrieve */
  size?: string | number;
}

export interface ITicksOptions extends ISymbolId {
  /** Starting timestamp in ms */
  from?: string | number;
  /** Ending timestamp in ms */
  to?: string | number;
  /** Maximum amount of candles to retrieve */
  size?: string | number;
  /** Tick types */
  type?: "quotes" | "trades";
}

export interface IBaseAccountSummaryOptions extends IVersion {
  /** Account id */
  id: string;
  /** Summary's currency */
  currency: string;
}

export interface IAccountSummaryOptions extends IBaseAccountSummaryOptions {
  /** Session date */
  date: string;
}

export interface ITransactionsOptions extends IVersion {
  /** Transaction UUID */
  uuid?: string;
  /** Transaction account ID */
  accountId?: string;
  /** Filter transactions by the symbol id */
  symbolId?: string;
  /** Asset */
  asset?: string;
  /** Transaction types */
  operationType?: string | string[];
  /** Offset to list transactions */
  offset?: number;
  /** Limit response to this amount of transactions */
  limit?: number;
  /** Order transactions by descending or ascending */
  order?: "ASC" | "DESC";
  /** Starting timestamp of transactions in ISO format */
  fromDate?: string;
  /** Ending timestamp of transactions in ISO format */
  toDate?: string;
  /** Filter transactions by the order id */
  orderId?: string;
  /** Filter transactions by the position in the order */
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
  /** Client tag to identify or group orders */
  clientTag?: string;
  /** Order type */
  orderType: IOrderType;
  /** Order side */
  side: ISide;
  /** Price of stop loss order */
  stopLoss?: string;
  /** Order limit price */
  limitPrice?: string;
  /** Order stop price */
  stopPrice?: string;
  /** Order quantity */
  quantity: string;
  /** Order partial quantity, twap and iceberg orders only */
  partQuantity?: string;
  /** Id of an order on which this order depends */
  ifDoneParentId?: string | null;
  /** Order duration */
  duration: IDuration;
  /** Price of take profit order */
  takeProfit?: string;
  /** Order place interval, twap orders only */
  placeInterval?: string;
  /** One-Cancels-the-Other group ID if set */
  ocoGroup?: string | null;
  /** Order expiration */
  gttExpiration?: string;
  /** Order price distance, trailing_stop orders only */
  priceDistance?: string;
}

export interface IPlaceOrderOptionsV2 extends IBasePlaceOrderOptions {
  /** User account to place order */
  accountId: string;
  /** Order instrument */
  instrument: string;
}

export interface IPlaceOrderOptionsV3 extends IBasePlaceOrderOptions {
  /** User account to place order */
  accountId: string;
  /** API version */
  version: "3.0";
  /** Order instrument */
  symbolId: string;
}

export type IPlaceOrderOptions = IPlaceOrderOptionsV2 | IPlaceOrderOptionsV3;

interface IBaseOrdersOptions extends IVersion {
  /** The limit for max items of the order list */
  limit?: string;
  /** The start date */
  from?: string;
  /** The stop date */
  to?: string;
}

export interface IOrdersOptionsV2 extends IBaseOrdersOptions {
  /** User account */
  account: string;
}

export interface IOrdersOptionsV3 extends IBaseOrdersOptions {
  /** API version */
  version: "3.0";
  /** User account */
  accountId: string;
}

export type IOrdersOptions = IOrdersOptionsV2 | IOrdersOptionsV3;

export interface IBaseActiveOrdersOptions extends IVersion {
  /** Limit for max items of the order list */
  limit?: string;
}

export interface IActiveOrdersOptionsV2 extends IBaseActiveOrdersOptions {
  /** User's account */
  account: string;
  /** Instrument identifier */
  instrument: string;
}

export interface IActiveOrdersOptionsV3 extends IBaseActiveOrdersOptions {
  /** API version */
  version: "3.0";
  /** User's account */
  accountId: string;
  /** Instrument identifier */
  symbolId: string;
}

export type IActiveOrdersOptions =
  | IActiveOrdersOptionsV2
  | IActiveOrdersOptionsV3;

export interface IReplaceOrderOptions extends IVersion {
  /** The order identifier */
  orderId: string;
  /** Order modification action */
  action: "replace";
  /** Order modification parameters */
  parameters: {
    /** New order quantity to replace */
    quantity: string;
    /** New order stop price */
    stopPrice?: string;
    /** New order limit price */
    limitPrice?: string;
    /** New order price distance */
    priceDistance?: string;
  };
}

export interface ICancelOrderOptions extends IVersion {
  /** The order identifier */
  orderId: string;
  /** Order modification action */
  action: "cancel";
}

export type IModifyOrderOptions = IReplaceOrderOptions | ICancelOrderOptions;

export interface IOrderId extends IVersion {
  /** The order identifier */
  orderId: string;
}

export interface IUserAccount {
  /** Account status */
  status: "ReadOnly" | "CloseOnly" | "Full";
  /** Account ID */
  accountId: string;
}

export interface IDailyChange {
  /** Previous session close price, required api 3.0 only */
  lastSessionClosePrice?: string | null;
  /** Previous session close price */
  basePrice?: string | null;
  /** Symbol id */
  symbolId: string;
  /** Absolute daily change of the price at the moment of request */
  dailyChange?: string | null;
}

export interface ICurrencies {
  /** Currencies */
  currencies: string[];
}

export interface ICrossrate {
  /** Symbol id */
  symbolId?: string | null;
  /** Crossrate pair */
  pair: string;
  /** Current crossrate */
  rate: string;
}

export interface IExchange {
  /** Exchange internal id */
  id: string;
  /** Exchange country */
  country?: string | null;
  /** Full exchange name */
  name?: string | null;
}

interface IBaseOptionData {
  /** Option strike price */
  strikePrice: string;
  /** Option group name */
  optionGroupId: string;
}

export interface IOptionDataV2 extends IBaseOptionData {
  /** Option right */
  right: string;
}

export interface IOptionDataV3 extends IBaseOptionData {
  /** Option right */
  optionRight: string;
}

export type IOptionData = IOptionDataV2 | IOptionDataV3;

interface IBaseIntrument {
  /** Exchange ticker */
  ticker: string;
  /** Country of symbol's exchange */
  country?: string;
  /** Exchange id */
  exchange?: string;
  /** Expiration timestamp in ms */
  expiration?: number | string | null;
  /** Currency of symbol price */
  currency: string;
  /** Localized symbol descriptions */
  i18n?: Record<string, unknown>;
  /** Group of symbol */
  group?: string | null;
  /** Short symbol description */
  name?: string;
  /** Long symbol description */
  description: string;
}

export interface IIntrumentV2 extends IBaseIntrument {
  /** Minimum possible increment of symbol price */
  mpi: string;
  /** Internal symbol id */
  id: string;
  /** Symbol type */
  type: string;
  /** Option specific properties */
  optionData?: IOptionDataV2 | null;
}

export interface IIntrumentV3 extends IBaseIntrument {
  /** Symbol type */
  symbolType: string;
  /** Minimum possible increment of symbol price */
  minPriceIncrement: string;
  /** Option specific properties */
  optionData?: IOptionDataV3 | null;
  /** Internal symbol id */
  symbolId: string;
}

export type IIntrument = IIntrumentV2 | IIntrumentV3;

export type IIntruments = IIntrumentV2[] | IIntrumentV3[];

export interface IInstrumentGroup {
  /** Exchange id where the group is traded */
  exchange?: string;
  /** List of symbol types in the group */
  types: string[];
  /** Group title */
  name?: string;
  /** Group id */
  group: string;
}

export interface IIntrumentInterval {
  /** Trading session name */
  name: string;
  /** Trading session interval */
  period: {
    /** Session start timestamp in ms */
    start: number;
    /** Session end timestamp in ms */
    end: number;
  };
  /** Available order types */
  orderTypes?: Record<string, unknown[]> | null;
}

export interface IInstrumentSchedule {
  /** Instrument schedule intervals */
  intervals: IIntrumentInterval[];
}

export interface IInstrumentSpecification {
  /** Instrument leverage rate value */
  leverage: string;
  /** Instrument contract multiplier */
  contractMultiplier: string;
  /** Instrument price unit */
  priceUnit: string;
  /** Instrument units name */
  units?: string | null;
  /** Instrument lot size value */
  lotSize: string;
}

export interface IInstrumentType {
  /** Type id */
  id: string;
}

export interface IQuoteSideV2 {
  /** Quantity value */
  size: string;
  /** Quantity value */
  value: string;
}

export interface IQuoteSideV3 {
  /** Quantity value */
  size: string;
  /** Quantity value */
  price: string;
}

export type IQuoteSide = IQuoteSideV2 | IQuoteSideV3;

interface ITickBase {
  /** Tick timestamp */
  timestamp: number;
  /** Symbol id */
  symbolId: string;
}

export interface ILastQuote extends ITickBase {
  /** Array of bid levels */
  bid: IQuoteSide[];
  /** Array of ask levels */
  ask: IQuoteSide[];
}

export interface ICandle {
  /** Candle timestamp */
  timestamp: number;
  /** Candle open price */
  open: string;
  /** Candle low price */
  low: string;
  /** Candle close price */
  close: string;
  /** Candle high price */
  high: string;
  /** Total volume */
  volume?: string;
}

export interface ITradeTickV2 extends ITickBase {
  /** Trade price */
  value: string;
  /** Trade size */
  size: string;
}

export interface ITradeTickV3 extends ITickBase {
  /** Trade price */
  price: string;
  /** Trade size */
  size: string;
}

export type ITick = ILastQuote | ITradeTickV2 | ITradeTickV3;

export interface ICurrency {
  /** Currency code */
  code: string;
  /** Converted value of position */
  convertedValue: string;
  /** Value of position */
  value?: string;
  /** Value of position */
  price?: string;
}

export interface IBasePosition {
  /** Current position PnL in the currency of the report */
  convertedPnl: string;
  /** Quantity on position */
  quantity?: string;
  /** Current position PnL */
  pnl?: string;
  /** Position value in the currency of the report */
  convertedValue?: string;
  /** Current financial instrument price */
  price?: string;
  /** Symbol type */
  symbolType: string;
  /** Currency code */
  currency: string;
  /** Average position opening price */
  averagePrice?: string;
  /** Position value */
  value?: string;
}

export interface IPositionV2 extends IBasePosition {
  /** Symbol id */
  id: string;
}

export interface IPositionV3 extends IBasePosition {
  /** Symbol id */
  symbolId: string;
}

export type IPosition = IPositionV2 | IPositionV3;

export interface IAccountSummary {
  /** Currency of the report */
  currency: string;
  /** User account id */
  account?: string;
  /** Free money in the currency of the report */
  freeMoney?: string;
  /** User account id */
  accountId?: string;
  /** Total NAV of user in the currency of the report */
  netAssetValue?: string;
  /** Session date of the report */
  sessionDate?: [number, number, number] | null;
  /** Timestamp of the report */
  timestamp: number;
  /** Money used for margin in the currency of the report */
  moneyUsedForMargin?: string;
  /** Margin utilization in fraction of NAV */
  marginUtilization?: string;
  /** Currencies on position */
  currencies: ICurrency[];
  /** Open positions */
  positions: IPositionV2[] | IPositionV3[];
}

interface ITransactionBase {
  /** Transaction id */
  id: number;
  /** Transaction type */
  operationType: string;
  /** Transaction symbol id */
  symbolId: string | null;
  /** Transaction asset */
  asset: string;
  /** Transaction account id */
  accountId: string;
  /** Transaction amount */
  sum: string;
}

export interface ITransactionV2 extends ITransactionBase {
  /** Timestamp of the transaction */
  when: number;
}

export interface ITransactionV3 extends ITransactionBase {
  /** Timestamp of the transaction */
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
  /** Fill quantity */
  quantity: string;
  /** Fill serial number */
  position: string;
  /** Fill price */
  price: string;
}

export interface IFillV2 extends IBaseFill {
  /** Fill time */
  time: string;
}

export interface IFillV3 extends IBaseFill {
  /** Fill time */
  timestamp: string;
}

export type IFill = IFillV2 | IFillV3;

interface IBaseOrderState {
  /** Order status */
  status: IOrdersStatus;
  /** Order last update time */
  lastUpdate: string;
  /** Order rejected reason */
  reason?: string;
}

export interface IOrderStateV2 extends IBaseOrderState {
  /** Order fills */
  fills: IFillV2[];
}

export interface IOrderStateV3 extends IBaseOrderState {
  /** Order fills */
  fills: IFillV3[];
}

export type IOrderState = IOrderStateV2 | IOrderStateV3;

interface IBaseOrder {
  /** Client tag to identify or group orders */
  clientTag?: string;
  /** Associated account ID */
  accountId: string;
  /** Associated name */
  username?: string;
  /** Current order modification unique ID */
  currentModificationId: string;
  /** Current order modification unique ID */
  placeTime: string;
}

export interface IOrderV2 extends IBaseOrder {
  /** Order response parameters */
  orderParameters: IBasePlaceOrderOptions & { instrument: string };
  /** Order state response */
  orderState: IOrderStateV2;
  /** Unique order id */
  id: string;
}

export interface IOrderV3 extends IBaseOrder {
  /** Order response parameters */
  orderParameters: IBasePlaceOrderOptions & { symbolId: string };
  /** Order state response */
  orderState: IOrderStateV3;
  /** Unique order id */
  orderId: string;
}

export type IOrder = IOrderV2 | IOrderV3;

export class RestClient {
  readonly #client_id: string;
  readonly #app_id: string;
  readonly #shared_key: string;

  public readonly url: URL;

  public constructor({
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

  /** Make a request and parse the body as JSON */
  public fetch<T = unknown>(
    url: string | URL,
    { headers = this.headers, ...options }: fetch.RequestInit = {}
  ): Promise<T> {
    return RestClient.fetch<T>(url, { headers, ...options });
  }

  /** Get the list of user accounts and their statuses */
  public async getAccounts({
    version = DefaultAPIVersion,
  }: IVersion = {}): Promise<IUserAccount[]> {
    const url = new URL(`/md/${version}/accounts`, this.url);
    const accounts = await this.fetch<IUserAccount[]>(url);
    return accounts;
  }

  /** Get the list of daily changes */
  public async getDailyChanges({
    version = DefaultAPIVersion,
  }: IVersion = {}): Promise<IDailyChange[]> {
    const url = new URL(`/md/${version}/change`, this.url);
    const changes = await this.fetch<IDailyChange[]>(url);
    return changes;
  }

  /** Get the list of daily changes for requested instruments */
  public async getDailyChange({
    version = DefaultAPIVersion,
    symbolId,
  }: ISymbolId): Promise<IDailyChange[]> {
    const symbolIds = Array.isArray(symbolId) ? symbolId.join(",") : symbolId;
    const url = new URL(`/md/${version}/change/${symbolIds}`, this.url);
    const changes = await this.fetch<IDailyChange[]>(url);
    return changes;
  }

  /** Get the list of available currencies */
  public async getCurrencies({
    version = DefaultAPIVersion,
  }: IVersion = {}): Promise<ICurrencies> {
    const url = new URL(`/md/${version}/crossrates`, this.url);
    const changes = await this.fetch<ICurrencies>(url);
    return changes;
  }

  /** Get the crossrate from one currency to another */
  public async getCrossrate({
    version = DefaultAPIVersion,
    from,
    to,
  }: ICrossrateOptions): Promise<ICrossrate> {
    const url = new URL(`/md/${version}/crossrates/${from}/${to}`, this.url);
    const crossrate = await this.fetch<ICrossrate>(url);
    return crossrate;
  }

  /** Get list of exchanges */
  public async getExchanges({
    version = DefaultAPIVersion,
  }: IVersion = {}): Promise<IExchange[]> {
    const url = new URL(`/md/${version}/exchanges`, this.url);
    const exchanges = await this.fetch<IExchange[]>(url);
    return exchanges;
  }

  /** Get instruments by exchange */
  public async getExchangeSymbols({
    version = DefaultAPIVersion,
    exchangeId,
  }: IExchangeId): Promise<IIntruments> {
    const url = new URL(`/md/${version}/exchanges/${exchangeId}`, this.url);
    const instruments = await this.fetch<IIntruments>(url);
    return instruments;
  }

  /** Get list of available instrument groups */
  public async getGroups({
    version = DefaultAPIVersion,
  }: IVersion = {}): Promise<IInstrumentGroup[]> {
    const url = new URL(`/md/${version}/groups`, this.url);
    const groups = await this.fetch<IInstrumentGroup[]>(url);
    return groups;
  }

  /** Get financial instruments which belong to specified group */
  public async getGroupSymbols({
    version = DefaultAPIVersion,
    groupId,
  }: IGroupId): Promise<IIntruments> {
    const url = new URL(`/md/${version}/groups/${groupId}`, this.url);
    const instruments = await this.fetch<IIntruments>(url);
    return instruments;
  }

  /** Get financial instrument which has the nearest expiration in the group */
  public async getGroupNearestSymbol({
    version = DefaultAPIVersion,
    groupId,
  }: IGroupId): Promise<IIntrument> {
    const url = new URL(`/md/${version}/groups/${groupId}/nearest`, this.url);
    const instrument = await this.fetch<IIntrument>(url);
    return instrument;
  }

  /** Get list of instruments available for authorized user */
  public async getSymbols({
    version = DefaultAPIVersion,
  }: IVersion = {}): Promise<IIntruments> {
    const url = new URL(`/md/${version}/symbols`, this.url);
    const groups = await this.fetch<IIntruments>(url);
    return groups;
  }

  /** Get instrument available for authorized user */
  public async getSymbol({
    version = DefaultAPIVersion,
    symbolId,
  }: ISymbolIdOptions): Promise<IIntrument> {
    const url = new URL(`/md/${version}/symbols/${symbolId}`, this.url);
    const symbol = await this.fetch<IIntrument>(url);
    return symbol;
  }

  /** Get financial schedule for requested instrument */
  public async getSymbolSchedule({
    version = DefaultAPIVersion,
    symbolId,
    types,
  }: ISymbolSchedule): Promise<IInstrumentSchedule> {
    const path = `/md/${version}/symbols/${symbolId}/schedule`;
    const url = new URL(path, this.url);
    RestClient.setQuery(url, { types });
    const schedule = await this.fetch<IInstrumentSchedule>(url);
    return schedule;
  }

  /** Get additional parameters for requested instrument */
  public async getSymbolSpecification({
    version = DefaultAPIVersion,
    symbolId,
  }: ISymbolId): Promise<IInstrumentSpecification> {
    const symbolIds = Array.isArray(symbolId) ? symbolId.join(",") : symbolId;
    const path = `/md/${version}/symbols/${symbolIds}/specification`;
    const url = new URL(path, this.url);
    const instrument = await this.fetch<IInstrumentSpecification>(url);
    return instrument;
  }

  /** Get list of known instrument types */
  public async getTypes({
    version = DefaultAPIVersion,
  }: IVersion = {}): Promise<IInstrumentType[]> {
    const url = new URL(`/md/${version}/types`, this.url);
    const groups = await this.fetch<IInstrumentType[]>(url);
    return groups;
  }

  /** Get financial instruments of the requested type */
  public async getTypeSymbols({
    version = DefaultAPIVersion,
    symbolType,
  }: ISymbolIdType): Promise<IIntruments> {
    const url = new URL(`/md/${version}/types/${symbolType}`, this.url);
    const symbols = await this.fetch<IIntruments>(url);
    return symbols;
  }

  /** Get the last quote */
  public async getLastQuote({
    version = DefaultAPIVersion,
    symbolIds,
    level,
  }: ILastQuoteOptions): Promise<ILastQuote[]> {
    const symbolId = Array.isArray(symbolIds) ? symbolIds.join(",") : symbolIds;
    const url = new URL(`/md/${version}/feed/${symbolId}/last`, this.url);
    RestClient.setQuery(url, { level });
    const exchanges = await this.fetch<ILastQuote[]>(url);
    return exchanges;
  }

  /** Get the trades stream for the specified financial instrument */
  public async getTradesStream({ symbolIds }: ISymbolIds): Promise<JSONStream> {
    const symbolId = Array.isArray(symbolIds) ? symbolIds.join(",") : symbolIds;
    const url = new URL(`/md/3.0/feed/trades/${symbolId}`, this.url);
    const stream = await this.fetchStream(url);
    return stream;
  }

  /** Get the trades stream for the specified financial instrument */
  public async getQuoteStream({
    version = DefaultAPIVersion,
    symbolIds,
    ...query
  }: ILastQuoteOptions): Promise<JSONStream> {
    const symbolId = Array.isArray(symbolIds) ? symbolIds.join(",") : symbolIds;
    const url = new URL(`/md/${version}/feed/${symbolId}`, this.url);
    RestClient.setQuery(url, { ...query });
    const stream = await this.fetchStream(url);
    return stream;
  }

  /** Get the list of OHLC candles */
  public async getCandles({
    version = DefaultAPIVersion,
    symbolId,
    duration,
    ...query
  }: ICandlesOptions): Promise<ICandle[]> {
    const symbolIds = Array.isArray(symbolId) ? symbolId.join(",") : symbolId;
    const path = `/md/${version}/ohlc/${symbolIds}/${duration}`;
    const url = new URL(path, this.url);
    RestClient.setQuery(url, { ...query });
    const candles = await this.fetch<ICandle[]>(url);
    return candles;
  }

  /** Get the list of ticks */
  public async getTicks({
    version = DefaultAPIVersion,
    symbolId,
    ...query
  }: ITicksOptions): Promise<ITick[]> {
    const symbolIds = Array.isArray(symbolId) ? symbolId.join(",") : symbolId;
    const url = new URL(`/md/${version}/ticks/${symbolIds}`, this.url);
    RestClient.setQuery(url, { ...query });
    const ticks = await this.fetch<ITick[]>(url);
    return ticks;
  }

  /** Get the summary for the specified account */
  public async getAccountSummaryWithoutDate({
    version = DefaultAPIVersion,
    id,
    currency,
  }: IBaseAccountSummaryOptions): Promise<IAccountSummary> {
    const path = `/md/${version}/summary/${id}/${currency}`;
    const url = new URL(path, this.url);
    const summary = await this.fetch<IAccountSummary>(url);
    return summary;
  }

  /** Get the summary for the specified account and session date */
  public async getAccountSummary({
    version = DefaultAPIVersion,
    id,
    date,
    currency,
  }: IAccountSummaryOptions): Promise<IAccountSummary> {
    const path = `/md/${version}/summary/${id}/${date}/${currency}`;
    const url = new URL(path, this.url);
    const summary = await this.fetch<IAccountSummary>(url);
    return summary;
  }

  /** Get the list of transactions */
  public async getTransactions({
    version = DefaultAPIVersion,
    operationType,
    ...query
  }: ITransactionsOptions = {}): Promise<ITransactions> {
    const type = Array.isArray(operationType)
      ? operationType.join(",")
      : operationType;
    const url = new URL(`/md/${version}/transactions`, this.url);
    RestClient.setQuery(url, { operationType: type, ...query });
    const transactions = await this.fetch<ITransactions>(url);
    return transactions;
  }

  /** Place new trading order */
  public async placeOrder(options: IPlaceOrderOptionsV2): Promise<IOrderV2[]>;
  public async placeOrder(options: IPlaceOrderOptionsV3): Promise<IOrderV3[]>;
  public async placeOrder({
    version = DefaultAPIVersion,
    ...data
  }: IPlaceOrderOptions): Promise<IOrderV2[] | IOrderV3[]> {
    const url = new URL(`/trade/${version}/orders`, this.url);
    const method = "POST";
    const body = JSON.stringify(data);
    const order = await this.fetch<IOrderV2[] | IOrderV3[]>(url, {
      method,
      body,
    });
    return order;
  }

  /** Get the list of historical orders */
  public async getOrders({
    version = DefaultAPIVersion,
    ...query
  }: IOrdersOptions): Promise<IOrder[]> {
    const url = new URL(`/trade/${version}/orders`, this.url);
    RestClient.setQuery(url, { ...query });
    const orders = await this.fetch<IOrder[]>(url);
    return orders;
  }

  /** Get the list of active trading orders */
  public async getActiveOrders({
    version = DefaultAPIVersion,
    ...query
  }: IActiveOrdersOptions): Promise<IOrder[]> {
    const url = new URL(`/trade/${version}/orders/active`, this.url);
    RestClient.setQuery(url, { ...query });
    const orders = await this.fetch<IOrder[]>(url);
    return orders;
  }

  /** Replace or cancel trading order */
  public async modifyOrder({
    version = DefaultAPIVersion,
    orderId,
    ...data
  }: IModifyOrderOptions): Promise<IOrder> {
    const url = new URL(`/trade/${version}/orders/${orderId}`, this.url);
    const body = JSON.stringify(data);
    const order = await this.fetch<IOrder>(url, { method: "POST", body });
    return order;
  }

  /** Get the order with specified identifier */
  public async getOrder({
    version = DefaultAPIVersion,
    orderId,
  }: IOrderId): Promise<IOrder> {
    const url = new URL(`/trade/${version}/orders/${orderId}`, this.url);
    const order = await this.fetch<IOrder>(url);
    return order;
  }

  /** Get order updates stream via HTTP */
  public async orderUpdatesHttp({
    version = DefaultAPIVersion,
  }: IVersion = {}): Promise<JSONStream> {
    const url = new URL(`/trade/${version}/stream/orders`, this.url);
    const stream = await this.fetchStream(url);
    return stream;
  }

  /** Get trades updates stream via HTTP */
  public async tradesHttp({
    version = DefaultAPIVersion,
  }: IVersion = {}): Promise<JSONStream> {
    const url = new URL(`/trade/${version}/stream/trades`, this.url);
    const stream = await this.fetchStream(url);
    return stream;
  }

  /** Make a request and return JSONStream */
  public async fetchStream(
    url: string | URL,
    options: fetch.RequestInit = {}
  ): Promise<JSONStream> {
    const headers = new fetch.Headers(options.headers ?? this.headers);
    headers.set("Accept", "application/x-json-stream");

    const stream = RestClient.fetchStream(url, { ...options, headers });

    return stream;
  }

  /** Get a JSON Web Token */
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

  /** Get authorization headers */
  private get headers(): fetch.Headers {
    const Authorization = `Bearer ${this.token}`;
    const type = "application/json";
    return new fetch.Headers({ Authorization, "Content-Type": type });
  }

  /** Convert to Base64URL */
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

  /** Add query to URL */
  public static setQuery(
    url: URL,
    query: Record<string, string | number | boolean | undefined>
  ): void {
    for (const key in query) {
      const value = query[key];
      if (typeof value !== "undefined") {
        url.searchParams.set(key, value.toString());
      }
    }
  }

  /** Get a JSON Web Token (HMAC + SHA256) */
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

  /** Make a request and return a stream */
  public static async fetchStream(
    url: string | URL,
    options: fetch.RequestInit = {}
  ): Promise<JSONStream> {
    const response = await fetch(url.toString(), { ...options });
    /* istanbul ignore next */
    if (!response.body) {
      throw new Error("Empty body");
    }

    if (!response.ok) {
      const data = await response.json();
      throw data;
    }

    const stream = new JSONStream();
    response.body.pipe(stream);
    return stream;
  }

  /** Make a request and parse the body as JSON */
  public static async fetch<T = unknown>(
    url: string | URL,
    options: fetch.RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url.toString(), { ...options });

    const data = (await response.json()) as T;

    if (!response.ok) {
      throw data;
    }

    return data;
  }
}

export default RestClient;
