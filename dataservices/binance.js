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
  for (let interval of ['15m', '1h', '4h', '1d']) {
    for (let symbol of symbols) {
      let limit = 100;
      let url = `${ BINANCE_BASE_URL }klines?symbol=${ symbol }&interval=${ interval }&limit=${ limit }`;
      client.del(`binance_${ symbol }_${ interval }`)
      await sleep(500);
      let result = await axios.get(url);
      let items = result.data
      items.forEach(item => {
        //Update to Redis Cache
        // startTime - startTime, o, c, l, h, vol, basevol
        client.zadd(`binance_${ symbol }_${ interval }`, item[0], `${ item[0] } ${ item[1] } ${ item[4] } ${ item[3] } ${ item[2] } ${ item[5] } ${ item[7] }`)
      })

      //Call last Update
      getLastOCLH(symbol, interval);
    }
  }
}

//Run function `lastOCLH` during time interval
function getLastOCLH(symbol, interval) {
  let url = `${ BINANCE_BASE_URL }klines?symbol=${ symbol }&interval=${ interval }&limit=1`;
  let transform_interval = interval == '15m' ? 15 * 60 * 1000 : interval == '1h' ? 60 * 60 * 1000 : interval == '4h' ? 4 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  setInterval(() => {
    axios.get(url)
      .then(datas => {
        let item = datas.data[0]
        client.zadd(`binance_${ symbol }_${ interval }`,
          item[0],
          `${ item[0] } ${ item[1] } ${ item[4] } ${ item[3] } ${ item[2] } ${ item[5] } ${ item[7] }`,
        function (err, res) {
          if(err) console.log('getLastOCLH fail ' + symbol + '  ' + err)
          if(res) client.ZREMRANGEBYRANK(`binance_${ symbol }_${ interval }`, 0, 0)
        })
        console.log(symbol + ' -- ' + transform_interval + ':   ' + datas.data[0])
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
      eventEmitter.emit('binance_tickers', result);
    })
}

//Export API function
module.exports.getTicker = getTicker;
