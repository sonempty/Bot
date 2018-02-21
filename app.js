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

app.get('/binance/ohlc/:symbol/:interval', function(req, res) {
  // i.e.: http://localhost:5000/binance/ohlc/btcusdt/15m
  let symbol = req.params.symbol;
  let interval = req.params.interval;
  let ohlc_data = {
    author: 'Son + huy',
    api_name: 'ohlc',
    interval: interval,
    startTime: [],
    open: [],
    high: [],
    low: [],
    close: [],
    volume: [],
    quoteVolume: [],
    buyVolume: [],
    buyQuoteVolume: []
  };

  // read data from our redis cache and send to customer
  client.lrange(`binance_${ symbol }_${ interval }_t`, 0, -1, function(err, result) {
    if (err) {
      console.log('get redis startTime err');
    } else {
      ohlc_data.startTime = result
    }
  });

  client.lrange(`binance_${ symbol }_${ interval }_o`, 0, -1, function(err, result) {
    if (err) {
      console.log('get redis open price err');
    } else {
      ohlc_data.open = result
    }
  });

  client.lrange(`binance_${ symbol }_${ interval }_h`, 0, -1, function(err, result) {
    if (err) {
      console.log('get redis high price err');
    } else {
      ohlc_data.high = result
    }
  });

  client.lrange(`binance_${ symbol }_${ interval }_l`, 0, -1, function(err, result) {
    if (err) {
      console.log('get redis low price err');
    } else {
      ohlc_data.low = result
    }
  });

  client.lrange(`binance_${ symbol }_${ interval }_c`, 0, -1, function(err, result) {
    if (err) {
      console.log('get redis close price err');
    } else {
      ohlc_data.close = result
    }
  });

  client.lrange(`binance_${ symbol }_${ interval }_v`, 0, -1, function(err, result) {
    if (err) {
      console.log('get redis volume err');
    } else {
      ohlc_data.volume = result
    }
  });

  client.lrange(`binance_${ symbol }_${ interval }_qv`, 0, -1, function(err, result) {
    if (err) {
      console.log('get redis quote volume err');
    } else {
      ohlc_data.quoteVolume = result
    }
  });

  client.lrange(`binance_${ symbol }_${ interval }_bv`, 0, -1, function(err, result) {
    if (err) {
      console.log('get redis buy volume err');
    } else {
      ohlc_data.buyVolume = result
    }
  });

  client.lrange(`binance_${ symbol }_${ interval }_bqv`, 0, -1, function(err, result) {
    if (err) {
      console.log('get redis buy quote volume err');
    } else {
      ohlc_data.buyQuoteVolume = result
      res.send(ohlc_data)
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
