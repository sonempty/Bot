# Bot
Coin analysis

# APIs

## Get OHLC API

*http://your_domain:port/binance/ohlc/symbol/interval*

Respond format:

```javascript
{
  "author":"Son + huy",
  "api_name":"ohlc",
  "symbol":"BNBBTC",
  "interval":"15m",
  "startTime":["1519223400000","1519224300000",...],
  "open":["0.00090060","0.00090940",...],
  "high":["0.00091230","0.00090960",...],
  "low":["0.00089900","0.00089280",...],
  "close":["0.00090980","0.00089950",...],
  "volume":["20934.42000000","46623.63000000",...],
  "quoteVolume":["18.94686911","41.86486623",...
  "buyVolume":["10491.05000000","31808.57000000",...],
  "buyQuoteVolume":["9.49814530","28.55092583",...]
}

```


Example:
* [BTC-USDT-1h](http://207.246.113.77:5000/binance/ohlc/BTCUSDT/15m)
* [ZEC-ETH-15m](http://207.246.113.77:5000/binance/ohlc/ZECETH/15m)
* [STRAT-BTC-1D](http://207.246.113.77:5000/binance/ohlc/STRATBTC/1d)

## Get all tickers API

*http://your_domain:port/binance/symbols*

Respond format:

```javascript
[BTCUSDT, BNBETH, .....]
```

Example:
* [Get all tickers](http://207.246.113.77:5000/binance/symbols)


# Requirement

* [Nodejs](https://nodejs.org/en/) Installed
* [Redis Cache](https://redis.io/download) Installed

# Install dependencies

```
cd <Your_root_dir>
npm install
```

# Run Server

```
node app.js
```
