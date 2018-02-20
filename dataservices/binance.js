'use strict';

// Require dependencies
const axios = require('axios');
const events = require('events');

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
  /* Delete exist records and creat new one firstly*/
  for (let interval of ['15m', '1h', '4h', '1d']) {
    for (let symbol of symbols) {
      let limit = 2;
      let url = `${ BINANCE_BASE_URL }klines?symbol=${ symbol }&interval=${ interval }&limit=${ limit }`;

      await sleep(500);
      let result = await axios.get(url);

      //Update to Redis Cache - now log to console for testing only
      console.log(symbol + ' init ' + result.data);

      //Call last Update
      getLastOCLH(symbol, interval);
    }
  }
}

//Run function `lastOCLH` during time interval
function getLastOCLH(symbol, interval) {
  let url = `${ BINANCE_BASE_URL }klines?symbol=${ symbol }&interval=${ interval }&limit=1`;
  let transform_interval = interval == '15m' ? 15*60*1000 : interval == '1h' ? 60*60*1000 : interval == '4h'? 4*60*60*1000 : 24*60*60*1000
  setInterval( () => {
    axios.get(url)
      .then( datas => {
        console.log(symbol + ' -- ' + transform_interval + '  :' + datas.data[0])
      })
  }, transform_interval)
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
