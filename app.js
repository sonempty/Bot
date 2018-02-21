'use strict';

//Run dataservices
let Binance = require('./dataservices/binance.js');
Binance.getTicker();

// require the dependencies we installed
let app = require('express')();
let axios = require('axios');
let redis = require('redis');

// create a new redis client and connect to our local redis instance
let client = redis.createClient();

// if an error occurs, print it to the console
client.on('error', function(err) {
  console.log("Error " + err);
});

app.set('port', (process.env.PORT || 5000));

app.get('/binance/:symbol/:interval', function(req, res) {
  // i.e.: http://localhost:5000/binance/btcusdt/15m
  let symbol = req.params.symbol;
  let interval = req.params.interval;

  // read data from our redis cache and send to customer
  client.zrange(`binance_${ symbol }_${ interval }`, 0, -1, function(err, result) {
    if (err) {
      console.log('err');
    } else {
      res.send({
        "author": 'Son + Huy',
        "symbol": symbol,
        "interval": interval,
        "ohlc_data": result });
    }
  });
});

app.get('/binance/symbols', function(req, res) {
  // i.e.: http://localhost:5000/binance/symbols
  client.get('binance_symbols', function(err, result) {
    let symbols = result.split(',')
    res.send(symbols)
  })
});

app.listen(app.get('port'), function() {
  console.log('Server listening on port: ', app.get('port'));
});
