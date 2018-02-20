# Bot
Coin analysis

# Demo
APIs are under this form:
*http://your_domain:port/binance/symbol/interval*

**symbol** : is any pairs on exchange. Example BTCUSDT, ETHBTC, NEOSETH, BNBBTC......

**interval** : now have only:  15m, 1h, 4h, 1d

API example
* [BTC-USDT-1h](http://207.246.113.77:5000/binance/BTCUSDT/15m)
* [ZEC-ETH-15m](http://207.246.113.77:5000/binance/ZECETH/15m)
* [STRAT-BTC-1D](http://207.246.113.77:5000/binance/STRATBTC/1d)

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
