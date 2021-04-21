import assert from "assert";
import { Readable } from "stream";
import nock from "nock";

import {
  RestClient,
  ExanteDemoURL,
  ExanteLiveURL,
  IUserAccount,
  IDailyChange,
  ICurrencies,
  ICrossrate,
  IExchange,
  IIntrument,
  IIntruments,
  IInstrumentGroup,
  IInstrumentSchedule,
  IInstrumentSpecification,
  IInstrumentType,
  ILastQuote,
  ICandle,
  ITick,
  IAccountSummary,
  ITransactions,
  IOrder,
  DefaultAPIVersion,
  JSONStream,
} from "../";

const client_id = "d0c5340b-6d6c-49d9-b567-48c4bfca13d2";
const app_id = "6cca6a14-a5e3-4219-9542-86123fc9d6c3";
const shared_key = "5eeac64cc46b34f5332e5326/CHo4bRWq6pqqynnWKQg";

const url = "https://some-other-api.exante.eu/";

const client = new RestClient({ client_id, shared_key, app_id, url });

async function* StreamMessages(
  messages: Record<string, unknown>[]
): AsyncGenerator<Buffer> {
  for (const message of messages) {
    const data = Buffer.from(JSON.stringify({ ...message }));
    const promise = await new Promise<Buffer>((resolve) => {
      setTimeout(resolve, 1, data);
    });
    yield promise;
  }
}

suite("RestClient", () => {
  test("constructor", () => {
    assert.deepStrictEqual(client.url.href, url);
  });

  test("constructor (when `demo` is `true`)", () => {
    const otherClient = new RestClient({
      client_id,
      shared_key,
      app_id,
      demo: true,
    });
    assert.deepStrictEqual(otherClient.url, new URL(ExanteDemoURL));
  });

  test("constructor (when `demo` is `false`)", () => {
    const otherClient = new RestClient({
      client_id,
      shared_key,
      app_id,
      demo: false,
    });
    assert.deepStrictEqual(otherClient.url, new URL(ExanteLiveURL));
  });

  test(".fetch() (passes headers)", async () => {
    const response = { ok: 1 };
    const reqheaders = {
      "Content-Type": "application/json",
      Authorization: (value: string): boolean => value.includes("Bearer "),
    };

    nock(url, { reqheaders }).get("/").delay(1).reply(200, response);

    const data = await client.fetch(url);

    assert.deepStrictEqual(data, response);
  });

  test(".fetch() (rejects with non `Error`)", async () => {
    const response = { ok: 1 };
    const reqheaders = {
      "Content-Type": "application/json",
      Authorization: (value: string): boolean => value.includes("Bearer "),
    };

    nock(url, { reqheaders }).get("/").delay(1).reply(200, response);

    const data = await client.fetch(url);

    assert.deepStrictEqual(data, response);
  });

  test(".fetchStream() (passes headers)", async () => {
    const response = { ok: 1 };
    const reqheaders = {
      "Content-Type": "application/json",
      Authorization: (value: string): boolean => value.includes("Bearer "),
      Accept: "application/x-json-stream",
    };

    nock(url, { reqheaders })
      .get("/")
      .delay(1)
      .reply(200, () => Readable.from(StreamMessages([response])));

    const stream = await client.fetchStream(url);

    await new Promise<void>((resolve) => {
      stream.on("data", (data) => {
        assert.deepStrictEqual(data, response);
        resolve();
      });
    });
  });

  test(".getAccounts()", async () => {
    const version = "3.0";
    const response: IUserAccount[] = [
      { status: "Full", accountId: "ABC1234.002" },
      { status: "Full", accountId: "ABC1234.001" },
    ];

    nock(url).get(`/md/${version}/accounts`).delay(1).reply(200, response);

    const accounts = await client.getAccounts({ version });
    assert.deepStrictEqual(accounts, response);
  });

  test(".getAccounts() (with no arguments)", async () => {
    const response = [
      { status: "Full", accountId: "ABC1234.002" },
      { status: "Full", accountId: "ABC1234.001" },
    ];

    nock(url)
      .get(`/md/${DefaultAPIVersion}/accounts`)
      .delay(1)
      .reply(200, response);

    const accounts = await client.getAccounts();
    assert.deepStrictEqual(accounts, response);
  });

  test(".getDailyChanges()", async () => {
    const version = "3.0";
    const response: IDailyChange[] = [
      {
        symbolId: "AAPL.NASDAQ",
        lastSessionClosePrice: "120.0",
        dailyChange: "0.005",
        basePrice: "120.0",
      },
    ];

    nock(url).get(`/md/${version}/change`).delay(1).reply(200, response);

    const changes = await client.getDailyChanges({ version });
    assert.deepStrictEqual(changes, response);
  });

  test(".getDailyChanges() (with no arguments)", async () => {
    const response: IDailyChange[] = [
      {
        symbolId: "AAPL.NASDAQ",
        lastSessionClosePrice: "120.0",
        dailyChange: "0.005",
        basePrice: "120.0",
      },
    ];

    nock(url)
      .get(`/md/${DefaultAPIVersion}/change`)
      .delay(1)
      .reply(200, response);

    const changes = await client.getDailyChanges();
    assert.deepStrictEqual(changes, response);
  });

  test(".getDailyChange()", async () => {
    const version = "3.0";
    const symbolId = "AAPL.NASDAQ";
    const response: IDailyChange[] = [
      {
        symbolId: "AAPL.NASDAQ",
        lastSessionClosePrice: "120.0",
        dailyChange: "0.005",
        basePrice: "120.0",
      },
    ];

    nock(url)
      .get(`/md/${version}/change/${symbolId}`)
      .delay(1)
      .reply(200, response);

    const changes = await client.getDailyChange({ version, symbolId });
    assert.deepStrictEqual(changes, response);
  });

  test(".getDailyChange() (when `symbolId` is an array)", async () => {
    const symbolId = ["AAPL.NASDAQ", "MSFT.NASDAQ"];
    const response: IDailyChange[] = [
      {
        symbolId: "AAPL.NASDAQ",
        lastSessionClosePrice: "120.0",
        dailyChange: "0.005",
        basePrice: "120.0",
      },
      {
        symbolId: "MSFT.NASDAQQ",
        lastSessionClosePrice: "120.0",
        dailyChange: "0.005",
        basePrice: "120.0",
      },
    ];

    nock(url)
      .get(`/md/${DefaultAPIVersion}/change/${symbolId.join(",")}`)
      .delay(1)
      .reply(200, response);

    const changes = await client.getDailyChange({ symbolId });
    assert.deepStrictEqual(changes, response);
  });

  test(".getCurrencies()", async () => {
    const version = "3.0";
    const response: ICurrencies = {
      currencies: [
        "PLN",
        "UST",
        "ZEC",
        "MKR",
        "XAF",
        "SAR",
        "CAD",
        "HKD",
        "BAT",
        "AUD",
        "SEK",
        "EURS",
        "TRY",
        "MNA",
        "BRL",
        "UAH",
        "LVL",
        "XRP",
        "DAI",
        "DGB",
        "GLBX",
        "CZK",
        "TUSD",
        "GBp",
        "EGP",
        "ETH",
        "XPD",
        "RRT",
        "VND",
        "GBP",
        "TWD",
        "IOTA",
        "MXN",
        "THB",
        "SGD",
        "KZT",
        "SIC",
        "CHF",
        "AED",
        "INR",
        "LTC",
        "REP",
        "OMG",
        "CNH",
        "XBT",
        "XMR",
        "CNY",
        "USDT",
        "PHP",
        "RON",
        "XPT",
        "MAI",
        "BTC",
        "DKK",
        "XLM",
        "DSH",
        "XAU",
        "XAG",
        "JPY",
        "ARS",
        "EMC",
        "HUF",
        "MYR",
        "USD",
        "RUB",
        "ETC",
        "NZD",
        "IDR",
        "EOS",
        "VEO",
        "ILS",
        "NOK",
        "NEO",
        "KWD",
        "BYN",
        "EUR",
        "ZAR",
        "BCN",
        "BNB",
        "BCH",
      ],
    };

    nock(url).get(`/md/${version}/crossrates`).delay(1).reply(200, response);

    const currencies = await client.getCurrencies({ version });
    assert.deepStrictEqual(currencies, response);
  });

  test(".getCurrencies() (with no arguments)", async () => {
    const response: ICurrencies = {
      currencies: [
        "PLN",
        "UST",
        "ZEC",
        "MKR",
        "XAF",
        "SAR",
        "CAD",
        "HKD",
        "BAT",
        "AUD",
        "SEK",
        "EURS",
        "TRY",
        "MNA",
        "BRL",
        "UAH",
        "LVL",
        "XRP",
        "DAI",
        "DGB",
        "GLBX",
        "CZK",
        "TUSD",
        "GBp",
        "EGP",
        "ETH",
        "XPD",
        "RRT",
        "VND",
        "GBP",
        "TWD",
        "IOTA",
        "MXN",
        "THB",
        "SGD",
        "KZT",
        "SIC",
        "CHF",
        "AED",
        "INR",
        "LTC",
        "REP",
        "OMG",
        "CNH",
        "XBT",
        "XMR",
        "CNY",
        "USDT",
        "PHP",
        "RON",
        "XPT",
        "MAI",
        "BTC",
        "DKK",
        "XLM",
        "DSH",
        "XAU",
        "XAG",
        "JPY",
        "ARS",
        "EMC",
        "HUF",
        "MYR",
        "USD",
        "RUB",
        "ETC",
        "NZD",
        "IDR",
        "EOS",
        "VEO",
        "ILS",
        "NOK",
        "NEO",
        "KWD",
        "BYN",
        "EUR",
        "ZAR",
        "BCN",
        "BNB",
        "BCH",
      ],
    };

    nock(url)
      .get(`/md/${DefaultAPIVersion}/crossrates`)
      .delay(1)
      .reply(200, response);

    const currencies = await client.getCurrencies();
    assert.deepStrictEqual(currencies, response);
  });

  test(".getCrossrate()", async () => {
    const version = "3.0";
    const from = "EUR";
    const to = "USD";
    const response: ICrossrate = {
      pair: "EUR/USD",
      rate: "1.2",
      symbolId: "EUR/USD.E.FX",
    };

    nock(url)
      .get(`/md/${version}/crossrates/${from}/${to}`)
      .delay(1)
      .reply(200, response);

    const crossrate = await client.getCrossrate({ version, from, to });
    assert.deepStrictEqual(crossrate, response);
  });

  test(".getCrossrate() (with no `version`)", async () => {
    const from = "EUR";
    const to = "USD";
    const response: ICrossrate = {
      pair: "EUR/USD",
      rate: "1.2",
      symbolId: "EUR/USD.E.FX",
    };

    nock(url)
      .get(`/md/${DefaultAPIVersion}/crossrates/${from}/${to}`)
      .delay(1)
      .reply(200, response);

    const currencies = await client.getCrossrate({ from, to });
    assert.deepStrictEqual(currencies, response);
  });

  test(".getExchanges()", async () => {
    const version = "3.0";
    const response: IExchange[] = [
      {
        id: "NASDAQ",
        country: "US",
        name:
          "NASDAQ: National Association of Securities Dealers Automated Quotations",
      },
    ];

    nock(url).get(`/md/${version}/exchanges`).delay(1).reply(200, response);

    const exchanges = await client.getExchanges({ version });
    assert.deepStrictEqual(exchanges, response);
  });

  test(".getExchanges() (with no arguments)", async () => {
    const response: IExchange[] = [
      {
        id: "NASDAQ",
        country: "US",
        name:
          "NASDAQ: National Association of Securities Dealers Automated Quotations",
      },
    ];

    nock(url)
      .get(`/md/${DefaultAPIVersion}/exchanges`)
      .delay(1)
      .reply(200, response);

    const exchanges = await client.getExchanges();
    assert.deepStrictEqual(exchanges, response);
  });

  test(".getExchangeSymbols()", async () => {
    const version = "3.0";
    const exchangeId = "NASDAQ";
    const response: IIntruments = [
      {
        ticker: "AAPL",
        country: "US",
        symbolType: "Stock",
        exchange: "NASDAQ",
        expiration: 1503619200000,
        minPriceIncrement: "0.01",
        currency: "0.01",
        i18n: {
          property1: "string",
          property2: "string",
        },
        optionData: {
          strikePrice: "30.5",
          optionRight: "PUT",
          optionGroupId: "OZL.CBOT.U2017.P*",
        },
        group: "AAPL",
        name: "Apple",
        symbolId: "AAPL.NASDAQ",
        description: "Apple",
      },
    ];

    nock(url)
      .get(`/md/${version}/exchanges/${exchangeId}`)
      .delay(1)
      .reply(200, response);

    const symbols = await client.getExchangeSymbols({ version, exchangeId });
    assert.deepStrictEqual(symbols, response);
  });

  test(".getExchangeSymbols() (with no version)", async () => {
    const exchangeId = "NASDAQ";
    const response: IIntruments = [
      {
        optionData: null,
        i18n: {},
        name: "Himax Technologies",
        description:
          "Himax Technologies, Inc. - American depositary shares, each of which represents two ordinary shares.",
        country: "US",
        exchange: "NASDAQ",
        id: "HIMX.NASDAQ",
        currency: "USD",
        mpi: "0.01",
        type: "STOCK",
        ticker: "HIMX",
        expiration: null,
        group: null,
      },
    ];

    nock(url)
      .get(`/md/${DefaultAPIVersion}/exchanges/${exchangeId}`)
      .delay(1)
      .reply(200, response);

    const symbols = await client.getExchangeSymbols({ exchangeId });
    assert.deepStrictEqual(symbols, response);
  });

  test(".getGroups()", async () => {
    const version = "3.0";
    const response: IInstrumentGroup[] = [
      {
        exchange: "NYMEX",
        types: [""],
        name: "Henry Hub Natural Gas",
        group: "NG",
      },
    ];

    nock(url).get(`/md/${version}/groups`).delay(1).reply(200, response);

    const groups = await client.getGroups({ version });
    assert.deepStrictEqual(groups, response);
  });

  test(".getGroups() (with no version)", async () => {
    const response: IInstrumentGroup[] = [
      {
        group: "GD",
        name: "S&P-GSCI Commodity Index",
        types: ["FUTURE"],
        exchange: "CME",
      },
    ];

    nock(url)
      .get(`/md/${DefaultAPIVersion}/groups`)
      .delay(1)
      .reply(200, response);

    const groups = await client.getGroups();
    assert.deepStrictEqual(groups, response);
  });

  test(".getGroupSymbols()", async () => {
    const version = "3.0";
    const groupId = "NG";
    const response: IIntruments = [
      {
        currency: "0.01",
        expiration: 1503619200000,
        symbolType: "Stock",
        name: "Apple",
        group: "AAPL",
        exchange: "NASDAQ",
        description: "Apple",
        optionData: {
          strikePrice: "30.5",
          optionGroupId: "OZL.CBOT.U2017.P*",
          optionRight: "PUT",
        },
        symbolId: "AAPL.NASDAQ",
        country: "US",
        minPriceIncrement: "0.01",
        i18n: {
          property1: "string",
          property2: "string",
        },
        ticker: "AAPL",
      },
    ];

    nock(url)
      .get(`/md/${version}/groups/${groupId}`)
      .delay(1)
      .reply(200, response);

    const symbols = await client.getGroupSymbols({ version, groupId });
    assert.deepStrictEqual(symbols, response);
  });

  test(".getGroupSymbols() (with no `version`)", async () => {
    const groupId = "NG";
    const response: IIntruments = [
      {
        optionData: {
          optionGroupId: "ON.NYMEX.X2020.P*",
          strikePrice: "0.65",
          right: "PUT",
        },
        i18n: {},
        name: "Natural Gas",
        description:
          "American Options On Natural Gas Futures Nov 2020 PUT 0.65",
        country: "US",
        exchange: "NYMEX",
        id: "ON.NYMEX.X2020.P0_65",
        currency: "USD",
        mpi: "0.001",
        type: "OPTION",
        ticker: "ON",
        expiration: 1603832400000,
        group: "NG",
      },
    ];

    nock(url)
      .get(`/md/${DefaultAPIVersion}/groups/${groupId}`)
      .delay(1)
      .reply(200, response);

    const symbols = await client.getGroupSymbols({ groupId });
    assert.deepStrictEqual(symbols, response);
  });

  test(".getGroupNearestSymbol()", async () => {
    const version = "3.0";
    const groupId = "NG";
    const response: IIntrument = {
      currency: "0.01",
      type: "Stock",
      expiration: 1503619200000,
      symbolType: "Stock",
      name: "Apple",
      group: "AAPL",
      exchange: "NASDAQ",
      description: "Apple",
      mpi: "0.01",
      id: "AAPL.NASDAQ",
      optionData: {
        strikePrice: "30.5",
        optionGroupId: "OZL.CBOT.U2017.P*",
        optionRight: "PUT",
        right: "PUT",
      },
      symbolId: "AAPL.NASDAQ",
      country: "US",
      minPriceIncrement: "0.01",
      i18n: {
        property1: "string",
        property2: "string",
      },
      ticker: "AAPL",
    };

    nock(url)
      .get(`/md/${version}/groups/${groupId}/nearest`)
      .delay(1)
      .reply(200, response);

    const symbol = await client.getGroupNearestSymbol({ version, groupId });
    assert.deepStrictEqual(symbol, response);
  });

  test(".getGroupNearestSymbol() (with no `version`)", async () => {
    const groupId = "NG";
    const response: IIntrument = {
      optionData: null,
      i18n: {},
      name: "Henry Hub Natural Gas",
      description: "Futures On Henry Hub Natural Gas Oct 2020",
      country: "US",
      exchange: "NYMEX",
      id: "NG.NYMEX.V2020",
      currency: "USD",
      mpi: "0.001",
      type: "FUTURE",
      ticker: "NG",
      expiration: 1601326800000,
      group: "NG",
    };

    nock(url)
      .get(`/md/${DefaultAPIVersion}/groups/${groupId}/nearest`)
      .delay(1)
      .reply(200, response);

    const symbol = await client.getGroupNearestSymbol({ groupId });
    assert.deepStrictEqual(symbol, response);
  });

  test(".getSymbols()", async () => {
    const version = "3.0";
    const response: IIntruments = [
      {
        ticker: "AAPL",
        mpi: "0.01",
        id: "AAPL.NASDAQ",
        country: "US",
        exchange: "NASDAQ",
        type: "Stock",
        expiration: 1503619200000,
        currency: "0.01",
        i18n: {
          property1: "string",
          property2: "string",
        },
        optionData: {
          right: "PUT",
          strikePrice: "30.5",
          optionGroupId: "OZL.CBOT.U2017.P*",
        },
        group: "AAPL",
        name: "Apple",
        description: "Apple",
      },
    ];

    nock(url).get(`/md/${version}/symbols`).delay(1).reply(200, response);

    const symbols = await client.getSymbols({ version });
    assert.deepStrictEqual(symbols, response);
  });

  test(".getSymbols() (with no `version`)", async () => {
    const response: IIntruments = [
      {
        optionData: null,
        i18n: {},
        name: "BASGR 2.5 1/18/2022",
        description: "BASGR 2.5 1/18/2022, BASF SE, Annually",
        country: "DE",
        exchange: "USD",
        id: "XS1551001768.USD",
        currency: "USD",
        mpi: "0.001",
        type: "BOND",
        ticker: "XS1551001768",
        expiration: 1642550399000,
        group: null,
      },
    ];

    nock(url)
      .get(`/md/${DefaultAPIVersion}/symbols`)
      .delay(1)
      .reply(200, response);

    const symbols = await client.getSymbols();
    assert.deepStrictEqual(symbols, response);
  });

  test(".getSymbol()", async () => {
    const version = "3.0";
    const symbolId = "AAPL.NASDAQ";
    const response: IIntrument = {
      ticker: "AAPL",
      mpi: "0.01",
      id: "AAPL.NASDAQ",
      country: "US",
      symbolType: "Stock",
      exchange: "NASDAQ",
      type: "Stock",
      expiration: 1503619200000,
      minPriceIncrement: "0.01",
      currency: "0.01",
      i18n: {
        property1: "string",
        property2: "string",
      },
      optionData: {
        right: "PUT",
        strikePrice: "30.5",
        optionRight: "PUT",
        optionGroupId: "OZL.CBOT.U2017.P*",
      },
      group: "AAPL",
      name: "Apple",
      symbolId: "AAPL.NASDAQ",
      description: "Apple",
    };

    nock(url)
      .get(`/md/${version}/symbols/${symbolId}`)
      .delay(1)
      .reply(200, response);

    const symbol = await client.getSymbol({ version, symbolId });
    assert.deepStrictEqual(symbol, response);
  });

  test(".getSymbol() (with no `version`)", async () => {
    const symbolId = "AAPL.NASDAQ";
    const response: IIntrument = {
      optionData: null,
      i18n: {},
      name: "Apple",
      description: "Apple Inc. - Common Stock",
      country: "US",
      exchange: "NASDAQ",
      id: "AAPL.NASDAQ",
      currency: "USD",
      mpi: "0.01",
      type: "STOCK",
      ticker: "AAPL",
      expiration: null,
      group: null,
    };

    nock(url)
      .get(`/md/${DefaultAPIVersion}/symbols/${symbolId}`)
      .delay(1)
      .reply(200, response);

    const symbol = await client.getSymbol({ symbolId });
    assert.deepStrictEqual(symbol, response);
  });

  test(".getSymbolSchedule()", async () => {
    const version = "3.0";
    const symbolId = "AAPL.NASDAQ";
    const response: IInstrumentSchedule = {
      intervals: [
        {
          period: { start: 1481533200000, end: 1481553000000 },
          orderTypes: { property1: [{}], property2: [{}] },
          name: "online",
        },
      ],
    };

    nock(url)
      .get(`/md/${version}/symbols/${symbolId}/schedule`)
      .delay(1)
      .reply(200, response);

    const schedule = await client.getSymbolSchedule({ version, symbolId });
    assert.deepStrictEqual(schedule, response);
  });

  test(".getSymbolSchedule() (with no `version`)", async () => {
    const symbolId = "AAPL.NASDAQ";
    const response: IInstrumentSchedule = {
      intervals: [
        {
          name: "MainSession",
          period: { start: 1600695000000, end: 1600718400000 },
          orderTypes: {
            market: [
              "day",
              "immediate_or_cancel",
              "good_till_cancel",
              "at_the_close",
              "at_the_opening",
            ],
            unknown: ["day"],
            stop: ["day", "good_till_cancel"],
            stop_limit: ["day", "good_till_cancel", "at_the_close"],
            limit: [
              "day",
              "good_till_cancel",
              "immediate_or_cancel",
              "at_the_close",
              "at_the_opening",
            ],
          },
        },
      ],
    };
    const types = true;

    nock(url)
      .get(`/md/${DefaultAPIVersion}/symbols/${symbolId}/schedule`)
      .query({ types })
      .delay(1)
      .reply(200, response);

    const schedule = await client.getSymbolSchedule({ types, symbolId });
    assert.deepStrictEqual(schedule, response);
  });

  test(".getSymbolSpecification()", async () => {
    const version = "3.0";
    const symbolId = "AAPL.NASDAQ";
    const response: IInstrumentSpecification = {
      leverage: "0.2",
      units: "Shares, Contracts",
      lotSize: "1.0",
      priceUnit: "1.0",
      contractMultiplier: "1.0",
    };

    nock(url)
      .get(`/md/${version}/symbols/${symbolId}/specification`)
      .delay(1)
      .reply(200, response);

    const specification = await client.getSymbolSpecification({
      version,
      symbolId,
    });
    assert.deepStrictEqual(specification, response);
  });

  test(".getSymbolSpecification() (with no `version`)", async () => {
    const symbolId = ["AAPL.NASDAQ"];
    const response: IInstrumentSpecification = {
      leverage: "0.2",
      contractMultiplier: "1.0",
      priceUnit: "1.0",
      units: "Shares",
      lotSize: "1.0",
    };

    nock(url)
      .get(
        `/md/${DefaultAPIVersion}/symbols/${symbolId.join(",")}/specification`
      )
      .delay(1)
      .reply(200, response);

    const specification = await client.getSymbolSpecification({ symbolId });
    assert.deepStrictEqual(specification, response);
  });

  test(".getTypes()", async () => {
    const version = "3.0";
    const response: IInstrumentType[] = [{ id: "FUTURE" }];

    nock(url).get(`/md/${version}/types`).delay(1).reply(200, response);

    const types = await client.getTypes({ version });
    assert.deepStrictEqual(types, response);
  });

  test(".getTypes() (with no `version`)", async () => {
    const response: IInstrumentType[] = [
      { id: "CALENDAR_SPREAD" },
      { id: "CURRENCY" },
      { id: "FX_SPOT" },
      { id: "CFD" },
      { id: "FUND" },
      { id: "STOCK" },
      { id: "FUTURE" },
      { id: "OPTION" },
      { id: "BOND" },
    ];

    nock(url)
      .get(`/md/${DefaultAPIVersion}/types`)
      .delay(1)
      .reply(200, response);

    const types = await client.getTypes();
    assert.deepStrictEqual(types, response);
  });

  test(".getTypeSymbols()", async () => {
    const version = "3.0";
    const symbolType = "Stock";
    const response: IIntruments = [
      {
        ticker: "AAPL",
        mpi: "0.01",
        id: "AAPL.NASDAQ",
        country: "US",
        exchange: "NASDAQ",
        type: "Stock",
        expiration: 1503619200000,
        currency: "0.01",
        i18n: {
          property1: "string",
          property2: "string",
        },
        optionData: {
          right: "PUT",
          strikePrice: "30.5",
          optionGroupId: "OZL.CBOT.U2017.P*",
        },
        group: "AAPL",
        name: "Apple",
        description: "Apple",
      },
    ];

    nock(url)
      .get(`/md/${version}/types/${symbolType}`)
      .delay(1)
      .reply(200, response);

    const symbols = await client.getTypeSymbols({ version, symbolType });
    assert.deepStrictEqual(symbols, response);
  });

  test(".getTypeSymbols() (with no `version`)", async () => {
    const symbolType = "FUTURE";
    const response: IIntruments = [
      {
        optionData: null,
        i18n: {},
        name: "CAD/USD",
        description: "Canadian Dollar Futures Jun 2025",
        country: "US",
        exchange: "CME",
        id: "6C.CME.M2025",
        currency: "USD",
        mpi: "0.00005",
        type: "FUTURE",
        ticker: "6C",
        expiration: 1750169760000,
        group: "6C",
      },
    ];

    nock(url)
      .get(`/md/${DefaultAPIVersion}/types/${symbolType}`)
      .delay(1)
      .reply(200, response);

    const symbols = await client.getTypeSymbols({ symbolType });
    assert.deepStrictEqual(symbols, response);
  });

  test(".getTradesStream()", async () => {
    const symbolIds = ["MSFT.NASDAQ", "AAPL.NASDAQ", "GAZP.MICEX"];
    const trade1 = {
      timestamp: 1600767324644,
      symbolId: "MSFT.NASDAQ",
      price: "204.52",
      size: "106.0",
    };
    const trade2 = {
      timestamp: 1600767396670,
      symbolId: "GAZP.MICEX",
      price: "179.70",
      size: "1490.0",
    };

    const trades = [trade1, trade2];
    const heartbeat = { event: "heartbeat" };
    nock(url)
      .get(`/md/3.0/feed/trades/${symbolIds.join(",")}`)
      .delay(1)
      .reply(200, () => Readable.from(StreamMessages([...trades, heartbeat])));

    const stream = await client.getTradesStream({ symbolIds });

    assert.ok(stream instanceof JSONStream);

    await new Promise((resolve) => {
      stream.once("data", (data1) => {
        assert.deepStrictEqual(data1, trade1);
        stream.once("data", (data2) => {
          assert.deepStrictEqual(data2, trade2);
          stream.once("data", (data3) => {
            assert.deepStrictEqual(data3, heartbeat);
            stream.once("end", resolve);
          });
        });
      });
    });
  });

  test(".getTradesStream()", async () => {
    const symbolIds = "MSFT.NASDAQ";
    const trade1 = {
      timestamp: 1600767324644,
      symbolId: "MSFT.NASDAQ",
      price: "204.52",
      size: "106.0",
    };
    const trade2 = {
      timestamp: 1600767324658,
      symbolId: "MSFT.NASDAQ",
      price: "204.53",
      size: "1102.0",
    };

    const trades = [trade1, trade2];
    const heartbeat = { event: "heartbeat" };
    nock(url)
      .get(`/md/3.0/feed/trades/${symbolIds}`)
      .delay(1)
      .reply(200, () => Readable.from(StreamMessages([...trades, heartbeat])));

    const stream = await client.getTradesStream({ symbolIds });

    assert.ok(stream instanceof JSONStream);

    await new Promise((resolve) => {
      stream.once("data", (data1) => {
        assert.deepStrictEqual(data1, trade1);
        stream.once("data", (data2) => {
          assert.deepStrictEqual(data2, trade2);
          stream.once("data", (data3) => {
            assert.deepStrictEqual(data3, heartbeat);
            stream.once("end", resolve);
          });
        });
      });
    });
  });

  test(".getQuoteStream()", async () => {
    const version = "3.0";
    const symbolIds = "AAPL.NASDAQ";
    const level = "best_price";

    const quote = {
      timestamp: 1550833075530,
      bid: [{ price: "101.02", value: "101.02", size: "100" }],
      ask: [{ price: "101.02", value: "101.02", size: "100" }],
      symbolId: "AAPL.NASDAQ",
    };
    nock(url)
      .get(`/md/${version}/feed/${symbolIds}`)
      .query({ level })
      .delay(1)
      .reply(200, () => Readable.from(StreamMessages([quote])));

    const stream = await client.getQuoteStream({ version, symbolIds, level });

    assert.ok(stream instanceof JSONStream);

    await new Promise((resolve) => {
      stream.once("data", (data) => {
        assert.deepStrictEqual(data, quote);
        stream.once("end", resolve);
      });
    });
  });

  test(".getQuoteStream() (with no `version`)", async () => {
    const symbolIds = ["MSFT.NASDAQ", "AAPL.NASDAQ", "GAZP.MICEX"];
    const level = "market_depth";

    const quote1 = {
      timestamp: 1600767324644,
      symbolId: "MSFT.NASDAQ",
      price: "204.52",
      size: "106.0",
    };
    const quote2 = {
      timestamp: 1600767396670,
      symbolId: "GAZP.MICEX",
      price: "179.70",
      size: "1490.0",
    };
    const quotes = [quote1, quote2];
    const heartbeat = { event: "heartbeat" };

    nock(url)
      .get(`/md/${DefaultAPIVersion}/feed/${symbolIds.join(",")}`)
      .query({ level })
      .delay(1)
      .reply(200, () => Readable.from(StreamMessages([...quotes, heartbeat])));

    const stream = await client.getQuoteStream({ symbolIds, level });

    assert.ok(stream instanceof JSONStream);

    await new Promise((resolve) => {
      stream.once("data", (data1) => {
        assert.deepStrictEqual(data1, quote1);
        stream.once("data", (data2) => {
          assert.deepStrictEqual(data2, quote2);
          stream.once("data", (data3) => {
            assert.deepStrictEqual(data3, heartbeat);
            stream.once("end", resolve);
          });
        });
      });
    });
  });

  test(".getLastQuote()", async () => {
    const version = "3.0";
    const level = "market_depth" as const;
    const symbolIds = ["MSFT.NASDAQ", "AAPL.NASDAQ"];
    const response: ILastQuote[] = [
      {
        timestamp: 1599139073196,
        symbolId: "AAPL.NASDAQ",
        bid: [
          { price: "126.93", size: "5000.0" },
          { price: "126.91", size: "100.0" },
          { price: "126.90", size: "1100.0" },
          { price: "126.70", size: "500.0" },
          { price: "126.65", size: "100.0" },
          { price: "126.02", size: "200.0" },
          { price: "125.56", size: "300.0" },
          { price: "125.55", size: "200.0" },
          { price: "125.12", size: "300.0" },
          { price: "122.00", size: "100.0" },
        ],
        ask: [
          { price: "126.99", size: "100.0" },
          { price: "127.00", size: "2800.0" },
          { price: "127.14", size: "100.0" },
          { price: "127.50", size: "100.0" },
          { price: "128.81", size: "100.0" },
          { price: "133.32", size: "5000.0" },
          { price: "133.50", size: "900.0" },
          { price: "133.60", size: "100.0" },
        ],
      },
      {
        timestamp: 1599139073030,
        symbolId: "MSFT.NASDAQ",
        bid: [
          { price: "229.30", size: "100.0" },
          { price: "229.00", size: "1100.0" },
          { price: "228.92", size: "100.0" },
          { price: "228.75", size: "100.0" },
          { price: "228.56", size: "100.0" },
          { price: "221.45", size: "100.0" },
          { price: "219.21", size: "500.0" },
        ],
        ask: [
          { price: "229.67", size: "100.0" },
          { price: "229.75", size: "100.0" },
          { price: "230.00", size: "1100.0" },
          { price: "232.00", size: "100.0" },
          { price: "240.25", size: "600.0" },
          { price: "242.30", size: "100.0" },
        ],
      },
    ];

    nock(url)
      .get(`/md/${version}/feed/${symbolIds.join(",")}/last`)
      .query({ level })
      .delay(1)
      .reply(200, response);

    const quote = await client.getLastQuote({
      version,
      level,
      symbolIds,
    });
    assert.deepStrictEqual(quote, response);
  });

  test(".getLastQuote() (with no `version`)", async () => {
    const symbolIds = "MSFT.NASDAQ";
    const response: ILastQuote[] = [
      {
        timestamp: 1599139497429,
        symbolId: "MSFT.NASDAQ",
        bid: [{ value: "229.82", size: "500.0" }],
        ask: [{ value: "230.0", size: "200.0" }],
      },
    ];

    nock(url)
      .get(`/md/${DefaultAPIVersion}/feed/${symbolIds}/last`)
      .delay(1)
      .reply(200, response);

    const quote = await client.getLastQuote({ symbolIds });
    assert.deepStrictEqual(quote, response);
  });

  test(".getCandles()", async () => {
    const version = "3.0";
    const duration = "3600" as const;
    const symbolId = "AAPL.NASDAQ";
    const from = 1481565600000;
    const to = "1481572800000";
    const size = 1;
    const response: ICandle[] = [
      {
        volume: "3475756",
        close: "112.965",
        timestamp: 1550833075530,
        high: "113.105",
        low: "112.935",
        open: "112.975",
      },
    ];

    nock(url)
      .get(`/md/${version}/ohlc/${symbolId}/${duration}`)
      .query({ size, to, from })
      .delay(1)
      .reply(200, response);

    const candles = await client.getCandles({
      version,
      symbolId,
      duration,
      from,
      to,
      size,
    });
    assert.deepStrictEqual(candles, response);
  });

  test(".getCandles() (with no `version`)", async () => {
    const duration = "3600" as const;
    const symbolId = ["AAPL.NASDAQ"];
    const response: ICandle[] = [
      {
        volume: "3475756",
        close: "112.965",
        timestamp: 1550833075530,
        high: "113.105",
        low: "112.935",
        open: "112.975",
      },
    ];

    nock(url)
      .get(`/md/${DefaultAPIVersion}/ohlc/${symbolId.join(",")}/${duration}`)
      .delay(1)
      .reply(200, response);

    const candles = await client.getCandles({ duration, symbolId });
    assert.deepStrictEqual(candles, response);
  });

  test(".getTicks()", async () => {
    const version = "3.0";
    const symbolId = ["AAPL.NASDAQ"];
    const from = 1481565600000;
    const to = "1481572800000";
    const size = 1;
    const type = "trades";
    const response: ITick[] = [
      {
        timestamp: 1533643655486,
        symbolId: "AAPL.NASDAQ",
        price: "209.58",
        size: "2",
      },
    ];

    nock(url)
      .get(`/md/${version}/ticks/${symbolId.join(",")}`)
      .query({ size, to, from, type })
      .delay(1)
      .reply(200, response);

    const ticks = await client.getTicks({
      version,
      symbolId,
      from,
      to,
      size,
      type,
    });
    assert.deepStrictEqual(ticks, response);
  });

  test(".getTicks() (with no `version`)", async () => {
    const symbolId = "AAPL.NASDAQ";
    const response: ITick[] = [
      {
        timestamp: 1599174042043,
        symbolId: "AAPL.NASDAQ",
        bid: [{ value: "117.7", size: "600" }],
        ask: [{ value: "117.77", size: "900" }],
      },
    ];

    nock(url)
      .get(`/md/${DefaultAPIVersion}/ticks/${symbolId}`)
      .delay(1)
      .reply(200, response);

    const ticks = await client.getTicks({ symbolId });
    assert.deepStrictEqual(ticks, response);
  });

  test(".getAccountSummaryWithoutDate()", async () => {
    const version = "3.0";
    const id = "ABC1234.001";
    const currency = "EUR";
    const response: IAccountSummary = {
      freeMoney: "123406.01",
      marginUtilization: "0.0",
      account: "ABC1234.001",
      currencies: [
        {
          convertedValue: "123456.01",
          price: "123456.01",
          code: "EUR",
          value: "123456.01",
        },
      ],
      netAssetValue: "123456.01",
      currency: "EUR",
      moneyUsedForMargin: "50.0",
      positions: [
        {
          quantity: "1",
          convertedValue: "133.1",
          convertedPnl: "12.1",
          currency: "USD",
          price: "120.0",
          symbolId: "AAPL.NASDAQ",
          symbolType: "STOCK",
          value: "110.0",
          averagePrice: "110.0",
          pnl: "10.0",
        },
      ],
      timestamp: 1503619200000,
      sessionDate: [2013, 2, 16],
      accountId: "ABC1234.001",
    };

    nock(url)
      .get(`/md/${version}/summary/${id}/${currency}`)
      .delay(1)
      .reply(200, response);

    const summary = await client.getAccountSummaryWithoutDate({
      version,
      id,
      currency,
    });
    assert.deepStrictEqual(summary, response);
  });

  test(".getAccountSummaryWithoutDate() (with no `version`)", async () => {
    const id = "ABC1234.001";
    const currency = "EUR";
    const response: IAccountSummary = {
      freeMoney: "123406.01",
      marginUtilization: "0.0",
      account: "ABC1234.001",
      currencies: [
        {
          convertedValue: "123456.01",
          price: "123456.01",
          code: "EUR",
          value: "123456.01",
        },
      ],
      netAssetValue: "123456.01",
      currency: "EUR",
      moneyUsedForMargin: "50.0",
      positions: [
        {
          quantity: "1",
          convertedValue: "133.1",
          convertedPnl: "12.1",
          id: "AAPL.NASDAQ",
          currency: "USD",
          price: "120.0",
          symbolType: "STOCK",
          value: "110.0",
          averagePrice: "110.0",
          pnl: "10.0",
        },
      ],
      timestamp: 1503619200000,
      sessionDate: [2013, 2, 16],
      accountId: "ABC1234.001",
    };

    nock(url)
      .get(`/md/${DefaultAPIVersion}/summary/${id}/${currency}`)
      .delay(1)
      .reply(200, response);

    const summary = await client.getAccountSummaryWithoutDate({ id, currency });
    assert.deepStrictEqual(summary, response);
  });

  test(".getAccountSummary()", async () => {
    const version = "3.0";
    const id = "ABC1234.001";
    const date = "2013-02-16";
    const currency = "EUR";
    const response: IAccountSummary = {
      freeMoney: "123406.01",
      marginUtilization: "0.0",
      account: "ABC1234.001",
      currencies: [
        {
          convertedValue: "123456.01",
          price: "123456.01",
          code: "EUR",
          value: "123456.01",
        },
      ],
      netAssetValue: "123456.01",
      currency: "EUR",
      moneyUsedForMargin: "50.0",
      positions: [
        {
          quantity: "1",
          convertedValue: "133.1",
          convertedPnl: "12.1",
          currency: "USD",
          price: "120.0",
          symbolId: "AAPL.NASDAQ",
          symbolType: "STOCK",
          value: "110.0",
          averagePrice: "110.0",
          pnl: "10.0",
        },
      ],
      timestamp: 1503619200000,
      sessionDate: [2013, 2, 16],
      accountId: "ABC1234.001",
    };

    nock(url)
      .get(`/md/${version}/summary/${id}/${date}/${currency}`)
      .delay(1)
      .reply(200, response);

    const summary = await client.getAccountSummary({
      version,
      id,
      date,
      currency,
    });
    assert.deepStrictEqual(summary, response);
  });

  test(".getAccountSummary() (with no `version`)", async () => {
    const id = "ABC1234.001";
    const date = "2013-02-16";
    const currency = "EUR";
    const response: IAccountSummary = {
      freeMoney: "123406.01",
      marginUtilization: "0.0",
      account: "ABC1234.001",
      currencies: [
        {
          convertedValue: "123456.01",
          price: "123456.01",
          code: "EUR",
          value: "123456.01",
        },
      ],
      netAssetValue: "123456.01",
      currency: "EUR",
      moneyUsedForMargin: "50.0",
      positions: [
        {
          quantity: "1",
          convertedValue: "133.1",
          convertedPnl: "12.1",
          id: "AAPL.NASDAQ",
          currency: "USD",
          price: "120.0",
          symbolType: "STOCK",
          value: "110.0",
          averagePrice: "110.0",
          pnl: "10.0",
        },
      ],
      timestamp: 1503619200000,
      sessionDate: [2013, 2, 16],
      accountId: "ABC1234.001",
    };

    nock(url)
      .get(`/md/${DefaultAPIVersion}/summary/${id}/${date}/${currency}`)
      .delay(1)
      .reply(200, response);

    const summary = await client.getAccountSummary({
      id,
      date,
      currency,
    });
    assert.deepStrictEqual(summary, response);
  });

  test(".getTransactions()", async () => {
    const version = "3.0";
    const uuid = "c6e9abcc-e9e8-11e9-81b4-2a2ae2dbcce4";
    const accountId = "ABC1234.001";
    const symbolId = "AAPL.NASDAQ";
    const asset = "USD";
    const operationType = ["TRADE", "FUNDING/WITHDRAWAL", "POSITION CLOSE"];
    const offset = 10;
    const limit = 1;
    const fromDate = "1970-01-01T00:00:00.000Z";
    const toDate = "2019-01-01T00:00:00.000Z";
    const orderId = "d767f127-481f-466c-99b1-4d3069d68b66";
    const orderPos = 1;
    const response: ITransactions = [
      {
        id: 42,
        operationType: "TRADE",
        symbolId: "AAPL.NASDAQ",
        asset: "AAPL.NASDAQ",
        timestamp: 1503619200000,
        accountId: "ABC1234.001",
        sum: "101.02",
      },
    ];

    nock(url)
      .get(`/md/${version}/transactions`)
      .query({
        uuid,
        accountId,
        symbolId,
        asset,
        operationType: `${operationType.join(",")}`,
        offset,
        limit,
        fromDate,
        toDate,
        orderId,
        orderPos,
      })
      .delay(1)
      .reply(200, response);

    const transactions = await client.getTransactions({
      version,
      uuid,
      accountId,
      symbolId,
      asset,
      operationType,
      offset,
      limit,
      fromDate,
      toDate,
      orderId,
      orderPos,
    });
    assert.deepStrictEqual(transactions, response);
  });

  test(".getTransactions() (with no `version`)", async () => {
    const response: ITransactions = [
      {
        symbolId: null,
        operationType: "FUNDING/WITHDRAWAL",
        accountId: "ABC1234.001",
        id: 123456789,
        asset: "USD",
        when: 1571244495329,
        sum: "1234567.8",
      },
      {
        symbolId: "XRP.EXANTE",
        when: 1571244495330,
        operationType: "ROLLOVER",
        accountId: "ABC1234.002",
        id: 214365879,
        asset: "USD",
        sum: "-1.23",
      },
    ];

    nock(url)
      .get(`/md/${DefaultAPIVersion}/transactions`)
      .delay(1)
      .reply(200, response);

    const transactions = await client.getTransactions();
    assert.deepStrictEqual(transactions, response);
  });

  test(".placeOrder()", async () => {
    const version = "3.0";
    const symbolId = "AAPL.NASDAQ";
    const side = "sell";
    const quantity = "1";
    const limitPrice = "10000";
    const duration = "good_till_cancel";
    const orderType = "limit";
    const accountId = "ABC1234.001";

    const response: IOrder[] = [
      {
        placeTime: "2020-09-06T17:18:39.131Z",
        username: "abc@def.dev",
        orderId: "d440b5b6-a40f-44e5-8c3b-a9a419fea7b3",
        orderState: {
          status: "placing",
          lastUpdate: "2020-09-06T17:18:39.131Z",
          fills: [],
        },
        accountId: "ABC1234.001",
        orderParameters: {
          side: "sell",
          duration: "good_till_cancel",
          quantity: "1",
          symbolId: "AAPL.NASDAQ",
          ocoGroup: null,
          ifDoneParentId: null,
          orderType: "limit",
          limitPrice: "10000",
        },
        currentModificationId: "3a5bf47e-ec54-4782-b4e3-0091164c7c71",
      },
    ];
    nock(url)
      .post(`/trade/${version}/orders`, {
        symbolId,
        side,
        quantity,
        limitPrice,
        duration,
        orderType,
        accountId,
      })
      .delay(1)
      .reply(200, response);

    const order = await client.placeOrder({
      version,
      symbolId,
      side,
      quantity,
      limitPrice,
      duration,
      orderType,
      accountId,
    });
    assert.deepStrictEqual(order, response);
  });

  test(".placeOrder() (with no version)", async () => {
    const instrument = "AAPL.NASDAQ";
    const clientTag = "some client tag";
    const side = "buy";
    const stopLoss = "90.0";
    const quantity = "6";
    const limitPrice = "120.0";
    const stopPrice = "100.0";
    const duration = "day";
    const orderType = "market";
    const partQuantity = "1.0";
    const ifDoneParentId = "3a5bf47e-ec54-4782-b4e3-0091164c7c71";
    const accountId = "ABC1234.001";
    const takeProfit = "130.0";
    const placeInterval = "1";
    const ocoGroup = "d440b5b6-a40f-44e5-8c3b-a9a419fea7b3";
    const gttExpiration = "2017-08-14T02:40:00.000Z";
    const priceDistance = "1";

    const response: IOrder[] = [
      {
        orderParameters: {
          instrument: "AAPL.NASDAQ",
          orderType: "market",
          ocoGroup: "d440b5b6-a40f-44e5-8c3b-a9a419fea7b3",
          symbolId: "AAPL.NASDAQ",
          limitPrice: "130.0",
          stopPrice: "120.0",
          quantity: "10",
          partQuantity: "1",
          ifDoneParentId: "3a5bf47e-ec54-4782-b4e3-0091164c7c71",
          duration: "day",
          placeInterval: "1",
          side: "sell",
          gttExpiration: "2017-08-14T02:40:00Z",
          priceDistance: "1",
        },
        clientTag: "some client tag",
        accountId: "ABC1234.001",
        username: "root@example.com",
        orderId: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
        orderState: {
          status: "working",
          lastUpdate: "2017-08-14T02:40:00Z",
          reason: "string",
          fills: [
            {
              quantity: "1",
              position: "1",
              price: "120.1",
              time: "2017-08-14T02:40:00Z",
            },
          ],
        },
        currentModificationId: "2d2b75f2-c4ed-4f7f-b38b-8d8219d4216f",
        id: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
        placeTime: "2017-08-14T02:40:00Z",
      },
    ];

    nock(url)
      .post(`/trade/${DefaultAPIVersion}/orders`, {
        instrument,
        clientTag,
        side,
        stopLoss,
        quantity,
        limitPrice,
        stopPrice,
        duration,
        orderType,
        partQuantity,
        ifDoneParentId,
        accountId,
        takeProfit,
        placeInterval,
        ocoGroup,
        gttExpiration,
        priceDistance,
      })
      .delay(1)
      .reply(200, response);

    const order = await client.placeOrder({
      instrument,
      clientTag,
      side,
      stopLoss,
      quantity,
      limitPrice,
      stopPrice,
      duration,
      orderType,
      partQuantity,
      ifDoneParentId,
      accountId,
      takeProfit,
      placeInterval,
      ocoGroup,
      gttExpiration,
      priceDistance,
    });
    assert.deepStrictEqual(order, response);
  });

  test(".getOrders()", async () => {
    const version = "3.0";
    const limit = "10";
    const from = "2017-05-18T10:00:00.000Z";
    const to = "2017-05-21T17:59:59.999Z";
    const accountId = "ABC1234.001";

    const response: IOrder[] = [
      {
        orderParameters: {
          orderType: "market",
          ocoGroup: "d440b5b6-a40f-44e5-8c3b-a9a419fea7b3",
          symbolId: "AAPL.NASDAQ",
          limitPrice: "130.0",
          stopPrice: "120.0",
          quantity: "10",
          partQuantity: "1",
          ifDoneParentId: "3a5bf47e-ec54-4782-b4e3-0091164c7c71",
          duration: "day",
          placeInterval: "1",
          side: "sell",
          gttExpiration: "2017-08-14T02:40:00Z",
          priceDistance: "1",
        },
        clientTag: "some client tag",
        accountId: "ABC1234.001",
        username: "root@example.com",
        orderId: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
        orderState: {
          status: "working",
          lastUpdate: "2017-08-14T02:40:00Z",
          reason: "string",
          fills: [
            {
              timestamp: "2017-08-14T02:40:00Z",
              quantity: "1",
              position: "1",
              price: "120.1",
            },
          ],
        },
        currentModificationId: "2d2b75f2-c4ed-4f7f-b38b-8d8219d4216f",
        id: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
        placeTime: "2017-08-14T02:40:00Z",
      },
    ];
    nock(url)
      .get(`/trade/${version}/orders`)
      .query({ limit, from, to, accountId })
      .delay(1)
      .reply(200, response);

    const orders = await client.getOrders({
      version,
      limit,
      from,
      to,
      accountId,
    });
    assert.deepStrictEqual(orders, response);
  });

  test(".getOrders() (with no version)", async () => {
    const account = "ABC1234.001";

    const response: IOrder[] = [
      {
        placeTime: "2019-10-11T13:22:43.212Z",
        username: "e@mail.net",
        orderState: {
          status: "rejected",
          lastUpdate: "2019-10-11T13:22:43.212Z",
          fills: [],
          reason:
            "Insufficient margin (position: 0, active: 0 long / 0 short, available margin: 0, margin delta: 11.11)",
        },
        accountId: "ABC1234.001",
        id: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
        orderParameters: {
          side: "sell",
          duration: "good_till_cancel",
          quantity: "10000",
          ocoGroup: null,
          ifDoneParentId: null,
          orderType: "limit",
          limitPrice: "10000",
          instrument: "AAPL.NASDAQ",
        },
        currentModificationId: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
      },
    ];

    nock(url)
      .get(`/trade/${DefaultAPIVersion}/orders`)
      .query({ account })
      .delay(1)
      .reply(200, response);

    const orders = await client.getOrders({ account });
    assert.deepStrictEqual(orders, response);
  });

  test(".getActiveOrders()", async () => {
    const version = "3.0";
    const symbolId = "AAPL.NASDAQ";
    const accountId = "ABC1234.001";

    const response: IOrder[] = [
      {
        orderParameters: {
          orderType: "market",
          ocoGroup: "d440b5b6-a40f-44e5-8c3b-a9a419fea7b3",
          symbolId: "AAPL.NASDAQ",
          limitPrice: "130.0",
          stopPrice: "120.0",
          quantity: "10",
          partQuantity: "1",
          ifDoneParentId: "3a5bf47e-ec54-4782-b4e3-0091164c7c71",
          duration: "day",
          placeInterval: "1",
          side: "sell",
          gttExpiration: "2017-08-14T02:40:00Z",
          priceDistance: "1",
        },
        clientTag: "some client tag",
        accountId: "ABC1234.001",
        username: "root@example.com",
        orderId: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
        orderState: {
          status: "working",
          lastUpdate: "2017-08-14T02:40:00Z",
          reason: "string",
          fills: [
            {
              timestamp: "2017-08-14T02:40:00Z",
              quantity: "1",
              position: "1",
              price: "120.1",
            },
          ],
        },
        currentModificationId: "2d2b75f2-c4ed-4f7f-b38b-8d8219d4216f",
        id: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
        placeTime: "2017-08-14T02:40:00Z",
      },
    ];
    nock(url)
      .get(`/trade/${version}/orders/active`)
      .query({ symbolId, accountId })
      .delay(1)
      .reply(200, response);

    const orders = await client.getActiveOrders({
      version,
      symbolId,
      accountId,
    });
    assert.deepStrictEqual(orders, response);
  });

  test(".getActiveOrders() (with no version)", async () => {
    const instrument = "APL.NASDAQ";
    const account = "ABC1234.001";

    const response: IOrder[] = [
      {
        placeTime: "2019-10-11T13:22:43.212Z",
        username: "e@mail.net",
        orderState: {
          status: "rejected",
          lastUpdate: "2019-10-11T13:22:43.212Z",
          fills: [],
          reason:
            "Insufficient margin (position: 0, active: 0 long / 0 short, available margin: 0, margin delta: 11.11)",
        },
        accountId: "ABC1234.001",
        id: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
        orderParameters: {
          side: "sell",
          duration: "good_till_cancel",
          quantity: "10000",
          ocoGroup: null,
          ifDoneParentId: null,
          orderType: "limit",
          limitPrice: "10000",
          instrument: "AAPL.NASDAQ",
        },
        currentModificationId: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
      },
    ];

    nock(url)
      .get(`/trade/${DefaultAPIVersion}/orders/active`)
      .query({ account, instrument })
      .delay(1)
      .reply(200, response);

    const orders = await client.getActiveOrders({ account, instrument });
    assert.deepStrictEqual(orders, response);
  });

  test(".modifyOrder()", async () => {
    const version = "3.0";
    const orderId = "ffecfac8-ccf9-4015-9a0f-b49a6b9673b8";
    const action = "replace";
    const limitPrice = "101.0";
    const quantity = "7";
    const stopPrice = "102.0";
    const priceDistance = "1.0";
    const parameters = { limitPrice, quantity, stopPrice, priceDistance };

    const response: IOrder = {
      orderParameters: {
        instrument: "AAPL.NASDAQ",
        orderType: "market",
        ocoGroup: "d440b5b6-a40f-44e5-8c3b-a9a419fea7b3",
        symbolId: "AAPL.NASDAQ",
        limitPrice: "130.0",
        stopPrice: "120.0",
        quantity: "10",
        partQuantity: "1",
        ifDoneParentId: "3a5bf47e-ec54-4782-b4e3-0091164c7c71",
        duration: "day",
        placeInterval: "1",
        side: "sell",
        gttExpiration: "2017-08-14T02:40:00Z",
        priceDistance: "1",
      },
      clientTag: "some client tag",
      accountId: "ABC1234.001",
      username: "root@example.com",
      orderId: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
      orderState: {
        status: "working",
        lastUpdate: "2017-08-14T02:40:00Z",
        reason: "string",
        fills: [
          {
            timestamp: "2017-08-14T02:40:00Z",
            quantity: "1",
            position: "1",
            price: "120.1",
          },
        ],
      },
      currentModificationId: "2d2b75f2-c4ed-4f7f-b38b-8d8219d4216f",
      id: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
      placeTime: "2017-08-14T02:40:00Z",
    };
    nock(url)
      .post(`/trade/${version}/orders/${orderId}`, { action, parameters })
      .delay(1)
      .reply(200, response);

    const order = await client.modifyOrder({
      version,
      orderId,
      action,
      parameters,
    });
    assert.deepStrictEqual(order, response);
  });

  test(".modifyOrder()  (with no version)", async () => {
    const orderId = "ffecfac8-ccf9-4015-9a0f-b49a6b9673b8";
    const action = "cancel";

    const response: IOrder = {
      placeTime: "2017-08-14T02:40:00Z",
      username: "root@example.com",
      orderState: {
        status: "cancelled",
        lastUpdate: "2017-08-14T02:40:00Z",
        fills: [],
      },
      accountId: "ABC1234.001",
      id: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
      orderParameters: {
        side: "sell",
        duration: "day",
        quantity: "10",
        ocoGroup: null,
        ifDoneParentId: null,
        orderType: "limit",
        limitPrice: "130.0",
        instrument: "AAPL.NASDAQ",
      },
      currentModificationId: "2d2b75f2-c4ed-4f7f-b38b-8d8219d4216f",
    };

    nock(url)
      .post(`/trade/${DefaultAPIVersion}/orders/${orderId}`, { action })
      .delay(1)
      .reply(200, response);

    const order = await client.modifyOrder({ orderId, action });
    assert.deepStrictEqual(order, response);
  });

  test(".getOrder()", async () => {
    const version = "3.0";
    const orderId = "ffecfac8-ccf9-4015-9a0f-b49a6b9673b8";

    const response: IOrder = {
      orderId: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
      placeTime: "2017-08-14T02:40:00Z",
      orderState: {
        reason: "string",
        fills: [
          {
            quantity: "1",
            timestamp: "2017-08-14T02:40:00Z",
            position: "1",
            price: "120.1",
          },
        ],
        lastUpdate: "2017-08-14T02:40:00Z",
        status: "working",
      },
      id: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
      username: "root@example.com",
      clientTag: "some client tag",
      currentModificationId: "2d2b75f2-c4ed-4f7f-b38b-8d8219d4216f",
      orderParameters: {
        symbolId: "AAPL.NASDAQ",
        limitPrice: "130.0",
        instrument: "AAPL.NASDAQ",
        ifDoneParentId: "3a5bf47e-ec54-4782-b4e3-0091164c7c71",
        duration: "day",
        gttExpiration: "2017-08-14T02:40:00Z",
        stopPrice: "120.0",
        quantity: "10",
        ocoGroup: "d440b5b6-a40f-44e5-8c3b-a9a419fea7b3",
        orderType: "market",
        priceDistance: "1",
        partQuantity: "1",
        placeInterval: "1",
        side: "sell",
      },
      accountId: "ABC1234.001",
    };
    nock(url)
      .get(`/trade/${version}/orders/${orderId}`)
      .delay(1)
      .reply(200, response);

    const order = await client.getOrder({ version, orderId });
    assert.deepStrictEqual(order, response);
  });

  test(".getOrder() (with no version)", async () => {
    const orderId = "ffecfac8-ccf9-4015-9a0f-b49a6b9673b8";

    const response: IOrder = {
      placeTime: "2017-08-14T02:40:00.123Z",
      username: "root@example.com",
      orderState: {
        status: "working",
        lastUpdate: "2017-08-14T02:40:00.123Z",
        fills: [],
      },
      accountId: "ABC1234.001",
      id: "ffecfac8-ccf9-4015-9a0f-b49a6b9673b8",
      orderParameters: {
        side: "buy",
        duration: "good_till_cancel",
        quantity: "10",
        ocoGroup: null,
        ifDoneParentId: null,
        orderType: "limit",
        limitPrice: "130.0",
        instrument: "AAPL.NASDAQ",
      },
      currentModificationId: "ffecfac8-ccf9-4015-9a0f-b49a6b9673b8",
    };
    nock(url)
      .get(`/trade/${DefaultAPIVersion}/orders/${orderId}`)
      .delay(1)
      .reply(200, response);

    const order = await client.getOrder({ orderId });
    assert.deepStrictEqual(order, response);
  });

  test(".orderUpdatesHttp()", async () => {
    const version = "3.0";

    const order: IOrder = {
      orderId: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
      placeTime: "2017-08-14T02:40:00Z",
      orderState: {
        reason: "string",
        fills: [
          {
            quantity: "1",
            timestamp: "2017-08-14T02:40:00Z",
            position: "1",
            price: "120.1",
          },
        ],
        lastUpdate: "2017-08-14T02:40:00Z",
        status: "working",
      },
      id: "d642d2ca-fcb5-4910-9de4-7c91f275ca23",
      username: "root@example.com",
      clientTag: "some client tag",
      currentModificationId: "2d2b75f2-c4ed-4f7f-b38b-8d8219d4216f",
      orderParameters: {
        symbolId: "AAPL.NASDAQ",
        limitPrice: "130.0",
        instrument: "AAPL.NASDAQ",
        ifDoneParentId: "3a5bf47e-ec54-4782-b4e3-0091164c7c71",
        duration: "day",
        gttExpiration: "2017-08-14T02:40:00Z",
        stopPrice: "120.0",
        quantity: "10",
        ocoGroup: "d440b5b6-a40f-44e5-8c3b-a9a419fea7b3",
        orderType: "market",
        priceDistance: "1",
        partQuantity: "1",
        placeInterval: "1",
        side: "sell",
      },
      accountId: "ABC1234.001",
    };
    const heartbeat = { event: "heartbeat" };
    nock(url)
      .get(`/trade/${version}/stream/orders`)
      .delay(1)
      .reply(200, () =>
        Readable.from(StreamMessages([{ ...order }, heartbeat]))
      );

    const stream = await client.orderUpdatesHttp({ version });

    assert.ok(stream instanceof JSONStream);

    await new Promise((resolve) => {
      stream.once("data", (data1) => {
        assert.deepStrictEqual(data1, order);
        stream.once("data", (data2) => {
          assert.deepStrictEqual(data2, heartbeat);
          stream.once("end", resolve);
        });
      });
    });
  });

  test(".orderUpdatesHttp() (with no version)", async () => {
    const order: IOrder = {
      placeTime: "2017-08-14T02:40:00.123Z",
      username: "root@example.com",
      orderState: {
        status: "working",
        lastUpdate: "2017-08-14T02:40:00.123Z",
        fills: [],
      },
      accountId: "ABC1234.001",
      id: "ffecfac8-ccf9-4015-9a0f-b49a6b9673b8",
      orderParameters: {
        side: "buy",
        duration: "good_till_cancel",
        quantity: "10",
        ocoGroup: null,
        ifDoneParentId: null,
        orderType: "limit",
        limitPrice: "130.0",
        instrument: "AAPL.NASDAQ",
      },
      currentModificationId: "ffecfac8-ccf9-4015-9a0f-b49a6b9673b8",
    };
    const heartbeat = { event: "heartbeat" };
    nock(url)
      .get(`/trade/${DefaultAPIVersion}/stream/orders`)
      .delay(1)
      .reply(200, () =>
        Readable.from(StreamMessages([{ ...order }, heartbeat]))
      );

    const stream = await client.orderUpdatesHttp();

    assert.ok(stream instanceof JSONStream);

    await new Promise((resolve) => {
      stream.once("data", (data1) => {
        assert.deepStrictEqual(data1, order);
        stream.once("data", (data2) => {
          assert.deepStrictEqual(data2, heartbeat);
          stream.once("end", resolve);
        });
      });
    });
  });

  test(".tradesHttp()", async () => {
    const version = "3.0";

    const trade = {
      orderId: "2abe909b-ec53-4091-a0d4-ea4f82aa047c",
      quantity: "1",
      price: "101.1",
      timestamp: "2017-08-14T02:40:00.000Z",
      position: "1",
      event: "trade",
      time: "2017-08-14T02:40:00.000Z",
    };
    const heartbeat = { event: "heartbeat" };
    nock(url)
      .get(`/trade/${version}/stream/trades`)
      .delay(1)
      .reply(200, () =>
        Readable.from(StreamMessages([{ ...trade }, heartbeat]))
      );

    const stream = await client.tradesHttp({ version });

    assert.ok(stream instanceof JSONStream);

    await new Promise((resolve) => {
      stream.once("data", (data1) => {
        assert.deepStrictEqual(data1, trade);
        stream.once("data", (data2) => {
          assert.deepStrictEqual(data2, heartbeat);
          stream.once("end", resolve);
        });
      });
    });
  });

  test(".tradesHttp() (with no version)", async () => {
    const trade = {
      orderId: "2abe909b-ec53-4091-a0d4-ea4f82aa047c",
      quantity: "1",
      price: "101.1",
      timestamp: "2017-08-14T02:40:00.000Z",
      position: "1",
      event: "trade",
      time: "2017-08-14T02:40:00.000Z",
    };
    const heartbeat = { event: "heartbeat" };
    nock(url)
      .get(`/trade/${DefaultAPIVersion}/stream/trades`)
      .delay(1)
      .reply(200, () =>
        Readable.from(StreamMessages([{ ...trade }, heartbeat]))
      );

    const stream = await client.tradesHttp();

    assert.ok(stream instanceof JSONStream);

    await new Promise((resolve) => {
      stream.once("data", (data1) => {
        assert.deepStrictEqual(data1, trade);
        stream.once("data", (data2) => {
          assert.deepStrictEqual(data2, heartbeat);
          stream.once("end", resolve);
        });
      });
    });
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

    test(".setQuery()", () => {
      let a: undefined;
      const otherUrl = new URL(ExanteDemoURL);
      RestClient.setQuery(otherUrl, { a });
      assert.deepStrictEqual(otherUrl.href, ExanteDemoURL);
      RestClient.setQuery(otherUrl, { a: 1 });
      assert.deepStrictEqual(otherUrl.href, `${ExanteDemoURL}?a=1`);
      RestClient.setQuery(otherUrl, { a: "" });
      assert.deepStrictEqual(otherUrl.href, `${ExanteDemoURL}?a=`);
      RestClient.setQuery(otherUrl, { b: "1" });
      assert.deepStrictEqual(otherUrl.href, `${ExanteDemoURL}?a=&b=1`);
    });

    test(".JWT()", () => {
      const header = { a: "a" };
      const payload = { b: "b" };
      const secret = "secret";
      const jwt =
        "eyJhIjoiYSJ9.eyJiIjoiYiJ9.OEv6m0EMcLTqQIo3ckjolE3nKlaZ_dPQHxtGIlw92GQ";
      const token = RestClient.JWT(secret, payload, header);
      assert.deepStrictEqual(token, jwt);
    });

    test(".JWT() (with no header)", () => {
      const payload = { sub: "sub", iss: "iss", iat: 1, exp: 2, aud: ["ohlc"] };
      const secret = "secret";
      const jwt =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdWIiLCJpc3MiOiJpc3MiLCJpYXQiOjEsImV4cCI6MiwiYXVkIjpbIm9obGMiXX0.W_YpgmyZLs-TP8cSVn0oZmGIJyWtBbkiH9KvjnQr7rw";
      const token = RestClient.JWT(secret, payload);
      assert.deepStrictEqual(token, jwt);
    });

    test(".fetchStream()", async () => {
      const heartbeat = { event: "heartbeat" };
      const pong = { event: "pong" };
      nock(url)
        .get("/")
        .delay(1)
        .reply(200, () => Readable.from(StreamMessages([heartbeat, pong])));

      const stream = await RestClient.fetchStream(url);

      assert.ok(stream instanceof JSONStream);

      await new Promise((resolve) => {
        stream.once("data", (data1) => {
          assert.deepStrictEqual(data1, heartbeat);
          stream.once("data", (data2) => {
            assert.deepStrictEqual(data2, pong);
            stream.once("end", resolve);
          });
        });
      });
    });

    test(".fetchStream()  (throws `Error` on non 2xx responses)", async () => {
      const message = { error: "Bad error", code: 1 };
      nock(url).get("/").delay(1).reply(404, JSON.stringify(message));

      try {
        await RestClient.fetchStream(url);
        assert.fail("Should throw a Error");
      } catch (error) {
        assert.deepStrictEqual(error, message);
      }
    });

    test(".fetch()", async () => {
      const response = { ok: 1 };

      nock(url).get("/").delay(1).reply(200, response);

      const data = await RestClient.fetch(url);

      assert.deepStrictEqual(data, response);
    });

    test(".fetch() (throws `Error` on non 2xx responses)", async () => {
      const message = { error: "Message", code: 1 };
      nock(url).get("/").delay(1).reply(404, JSON.stringify(message));

      try {
        await RestClient.fetch(url);
        assert.fail("Should throw a Error");
      } catch (error) {
        assert.deepStrictEqual(error, message);
      }
    });

    test(".fetch() (throws `Error` on non json reposonses)", async () => {
      nock(url).get("/").delay(1).reply(200, "notjson");

      const message = "Unexpected token o in JSON at position 1";
      try {
        await RestClient.fetch(url);
        assert.fail("Should throw a Error");
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.deepStrictEqual(error.message, message);
      }
    });
  });
});
