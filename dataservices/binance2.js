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
eventEmitter.on('init_done', getTicker);

//Init <limit> records for each interval and coin
async function initOCLH(symbols) {
  for (let interval of ['1h']) {
    for (let symbol of symbols) {
      let limit = 200;
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
	  try {
		  
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
		  
	  } catch (err) {
		  console.log(err)
		  continue
	  }
    }
  }
  
  console.log('Done a process! - ' + new Date().toLocaleString())
  await sleep(20 * 60 * 1000)
  eventEmitter.emit('init_done', 'done');
}


//Check and Update Exchanges coin if have new listing/delisting coin
function getTicker () {
	let result = [];
	axios.get(BINANCE_INFOR_URL)
		.then(datas => {
			datas.data.symbols.forEach( item => {
				if(item.quoteAsset == 'BTC' || item.quoteAsset == 'USDT') {
					result.push(item.symbol);
				}
			})
			client.set('binance_symbols', '' + result)
			console.log('get all symbols done')
			eventEmitter.emit('binance_tickers', result);
		})
		.catch(err => {
			console.log('Get Ticker Error')
			console.log(err)
		})
}


//Export API function
module.exports.getTicker = getTicker;
