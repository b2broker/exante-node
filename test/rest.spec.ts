import assert from "assert";
import nock from "nock";
import fetch from "node-fetch";

import {
  RestClient,
  ExanteDemoURL,
  ExanteLiveURL,
  FetchError,
  IUserAccount,
  IDailyChange,
  ICurrencies,
  ICrossrate,
  IExchange,
  ILastQuote,
  ICandle,
  IAccountSummary,
  DefaultAPIVersion,
} from "../";

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
      .get(`/md/${DefaultAPIVersion}/change/${symbolId}`)
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
      .get(`/md/${version}/feed/${symbolIds}/last`)
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
    const symbolId = "AAPL.NASDAQ";
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
      .get(`/md/${DefaultAPIVersion}/ohlc/${symbolId}/${duration}`)
      .delay(1)
      .reply(200, response);

    const candles = await client.getCandles({ duration, symbolId });
    assert.deepStrictEqual(candles, response);
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
          id: "AAPL.NASDAQ",
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
      const url = new URL(ExanteDemoURL);
      RestClient.setQuery(url, { a: undefined });
      assert.deepStrictEqual(url.href, ExanteDemoURL);
      RestClient.setQuery(url, { a: 1 });
      assert.deepStrictEqual(url.href, `${ExanteDemoURL}?a=1`);
      RestClient.setQuery(url, { a: "" });
      assert.deepStrictEqual(url.href, `${ExanteDemoURL}?a=`);
      RestClient.setQuery(url, { b: "1" });
      assert.deepStrictEqual(url.href, `${ExanteDemoURL}?a=&b=1`);
    });
  });
});
