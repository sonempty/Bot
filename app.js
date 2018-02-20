'use strict';

//Run dataservices
let Binance = require('./dataservices/binance.js')
Binance.getTicker()

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

  // use the redis client to get the total number of stars associated to that
  // username from our redis cache
  client.zrange(`binance_${ symbol }_${ interval }`, 0, -1, function(err, result) {
    if (err) {
      console.log('err')
    } else {
      res.send({
        "author": 'Son + Huy',
        "symbol": symbol,
        "interval": interval,
        "ohlc_data": result });
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Server listening on port: ', app.get('port'));
});
