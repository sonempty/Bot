# Bot
Coin analysis

# APIs

## Get OHLC API

*http://your_domain:port/binance/symbol/interval*

Respond format:
```javascript
{
  "author": 'Son + Huy',
  "symbol": 'BTCUSDT',
  "interval": '15m',
  "ohlc_data": [ 'startTime open close low high volume basevolume', .... ]
}

```

**symbol** : is any pairs on exchange. Example BTCUSDT, ETHBTC, NEOSETH, BNBBTC......

**interval** : now have only:  15m, 1h, 4h, 1d

**startTime** : beginning time of candle

**open close low high** : candle price

**volume** : volume

**basevolume** : base assert volume

Example:
* [BTC-USDT-1h](http://207.246.113.77:5000/binance/BTCUSDT/15m)
* [ZEC-ETH-15m](http://207.246.113.77:5000/binance/ZECETH/15m)
* [STRAT-BTC-1D](http://207.246.113.77:5000/binance/STRATBTC/1d)

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
