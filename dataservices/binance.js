'use strict';

// Require dependencies
const axios = require('axios');
const events = require('events');
const redis = require('redis');

// create a new redis client and connect to our local redis instance
var client = redis.createClient();
client.on('error', function(err) {
  console.log("Redis Error " + err);
});


// Binance Exchange Base API URL
const BINANCE_BASE_URL = 'https://api.binance.com/api/v1/';
const BINANCE_INFOR_URL = 'https://api.binance.com/api/v1/exchangeInfo';

// By pass Binance anti-ddos (current: 500ms)
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//Assign the event handler to an event. Call `initOCLH` after `getTicker`
let eventEmitter = new events.EventEmitter();
eventEmitter.on('binance_tickers', initOCLH);

//Init <limit> records for each interval and coin
async function initOCLH(symbols) {
  for (let interval of ['15m', '30m', '1h', '4h', '1d']) {
    for (let symbol of symbols) {
      let limit = 100;
      let url = `${ BINANCE_BASE_URL }klines?symbol=${ symbol }&interval=${ interval }&limit=${ limit }`;
      client.del(`binance_${ symbol }_${ interval }_t`)
      client.del(`binance_${ symbol }_${ interval }_o`)
      client.del(`binance_${ symbol }_${ interval }_h`)
      client.del(`binance_${ symbol }_${ interval }_l`)
      client.del(`binance_${ symbol }_${ interval }_c`)
      client.del(`binance_${ symbol }_${ interval }_v`)
      client.del(`binance_${ symbol }_${ interval }_qv`)
      client.del(`binance_${ symbol }_${ interval }_bv`)
      client.del(`binance_${ symbol }_${ interval }_bqv`)

      await sleep(500);
      let result = await axios.get(url);
      let items = result.data
      items.forEach(item => {
        //Update to Redis Cache
        // startTime - startTime, o, c, l, h, vol, quotevol, buyvol, vuyquotevol
        client.rpush(`binance_${ symbol }_${ interval }_t`, item[0])
        client.rpush(`binance_${ symbol }_${ interval }_o`, item[1])
        client.rpush(`binance_${ symbol }_${ interval }_h`, item[2])
        client.rpush(`binance_${ symbol }_${ interval }_l`, item[3])
        client.rpush(`binance_${ symbol }_${ interval }_c`, item[4])
        client.rpush(`binance_${ symbol }_${ interval }_v`, item[5])
        client.rpush(`binance_${ symbol }_${ interval }_qv`, item[7])
        client.rpush(`binance_${ symbol }_${ interval }_bv`, item[9])
        client.rpush(`binance_${ symbol }_${ interval }_bqv`, item[10])
      })
      //Call last Update
      getLastOCLH(symbol, interval);
    }
  }
}

//Run function `lastOCLH` during time interval
function getLastOCLH(symbol, interval) {
  let url = `${ BINANCE_BASE_URL }klines?symbol=${ symbol }&interval=${ interval }&limit=1`;
  let transform_interval = interval == '15m' ? 15 * 60 * 1000 : interval == '30m' ? 30 * 60 * 1000 : interval == '1h' ? 60 * 60 * 1000 : interval == '4h' ? 4 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  setInterval(() => {
    axios.get(url)
      .then(datas => {
        let item = datas.data[0]
        let last = ''
        client.lrange(`binance_${ symbol }_${ interval }_t`, -1, -1,
        function (err, res) {
          if(err) console.log('write LastOCLH fail ' + symbol + '  ' + err)
          if(res) {
            let [last] = res
            if( (+last) === (+item[0]) ) {
              client.rpush(`binance_${ symbol }_${ interval }_t`, +item[0])
              client.lpop(`binance_${ symbol }_${ interval }_t`)

              client.rpush(`binance_${ symbol }_${ interval }_o`, +item[1])
              client.lpop(`binance_${ symbol }_${ interval }_o`)

              client.rpush(`binance_${ symbol }_${ interval }_h`, +item[2])
              client.lpop(`binance_${ symbol }_${ interval }_h`)

              client.rpush(`binance_${ symbol }_${ interval }_l`, +item[3])
              client.lpop(`binance_${ symbol }_${ interval }_l`)

              client.rpush(`binance_${ symbol }_${ interval }_c`, +item[4])
              client.lpop(`binance_${ symbol }_${ interval }_c`)

              client.rpush(`binance_${ symbol }_${ interval }_v`, +item[5])
              client.lpop(`binance_${ symbol }_${ interval }_v`)

              client.rpush(`binance_${ symbol }_${ interval }_qv`, +item[7])
              client.lpop(`binance_${ symbol }_${ interval }_qv`)

              client.rpush(`binance_${ symbol }_${ interval }_bv`, +item[9])
              client.lpop(`binance_${ symbol }_${ interval }_bv`)

              client.rpush(`binance_${ symbol }_${ interval }_bqv`, +item[10])
              client.lpop(`binance_${ symbol }_${ interval }_bqv`)
            }
          }
        })
      })
  }, 1.01 * transform_interval)
}

//Check and Update Exchanges coin if have new listing/delisting coin
function getTicker() {
  let result = [];
  axios.get(BINANCE_INFOR_URL)
    .then(datas => {
      datas.data.symbols.forEach(item => {
        result.push(item.symbol);
      })
      client.set('binance_symbols', '' + result)
      eventEmitter.emit('binance_tickers', result);
    })
}

//Export API function
module.exports.getTicker = getTicker;
