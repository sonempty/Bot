'use strict';

//Run dataservices
let Binance2 = require('./dataservices/binance2.js');
Binance2.getTicker();

// require the dependencies we installed
let app = require('express')();
let axios = require('axios');

// cross origin
const cors = require('cors');
app.use(cors());

// create a new redis client and connect to our local redis instance
let redis = require('redis');
let client = redis.createClient();
const { promisify } = require('util');
const lrange = promisify(client.lrange).bind(client);

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
    symbol: symbol,
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
  Promise.all([
      lrange(`binance_${ symbol }_${ interval }_t`, -1, -1),
      lrange(`binance_${ symbol }_${ interval }_o`, -1, -1),
      lrange(`binance_${ symbol }_${ interval }_h`, -1, -1),
      lrange(`binance_${ symbol }_${ interval }_l`, -1, -1),
      lrange(`binance_${ symbol }_${ interval }_c`, -1, -1),
      lrange(`binance_${ symbol }_${ interval }_v`, -1, -1),
      lrange(`binance_${ symbol }_${ interval }_qv`, -1, -1),
      lrange(`binance_${ symbol }_${ interval }_bv`, -1, -1),
      lrange(`binance_${ symbol }_${ interval }_bqv`, -1, -1)
    ])
    .then(function([t, o, h, l, c, v, qv, bv, bqv]) {
      ohlc_data.startTime = t;
      ohlc_data.open = o;
      ohlc_data.high = h;
      ohlc_data.low = l;
      ohlc_data.close = c;
      ohlc_data.volume = v;
      ohlc_data.quoteVolume = qv;
      ohlc_data.buyVolume = bv;
      ohlc_data.buyQuoteVolume = bqv;

      res.send(ohlc_data);
    })
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
