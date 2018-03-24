'use strict';

// Require dependencies
const axios = require('axios');
const events = require('events');

// Binance Exchange Base API URL
const BINANCE_BASE_URL = 'https://api.binance.com/api/v1/';
const BINANCE_INFOR_URL = 'https://api.binance.com/api/v1/exchangeInfo';
let stores = {};
let tickers = [];

// By pass Binance anti-ddos (current: 500ms)
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//Assign the event handler to an event. Call `initOCLH` after `getTicker`
let eventEmitter = new events.EventEmitter();
eventEmitter.on('binance_tickers', initOCLH);
eventEmitter.on('init_done', getTicker);

//Init <limit> records for each interval and coin
async function initOCLH(symbols) {
  for (let interval of ['15m', '1h', '4h', '1d']) {
    for (let item in symbols) {
		
	let symbol = symbols.symbol
      let limit = 200;
      let url = `${ BINANCE_BASE_URL }klines?symbol=${ symbol }&interval=${ interval }&limit=${ limit }`;
	  
	  try { 
		  let result = await axios.get(url);
		  let items = result.data
		  stores[`binance_${ symbol }_${ interval }_t`] = []
		  stores[`binance_${ symbol }_${ interval }_o`] = []
		  stores[`binance_${ symbol }_${ interval }_h`] = []
		  stores[`binance_${ symbol }_${ interval }_l`] = []
		  stores[`binance_${ symbol }_${ interval }_c`] = []
		  stores[`binance_${ symbol }_${ interval }_v`] = []
		  stores[`binance_${ symbol }_${ interval }_qv`] = []
		  stores[`binance_${ symbol }_${ interval }_bv`] = []
		  stores[`binance_${ symbol }_${ interval }_bqv`] = []
		  
		  items.forEach(item => {
			// startTime - startTime, o, c, l, h, vol, quotevol, buyvol, vuyquotevol
			stores[`binance_${ symbol }_${ interval }_t`].push(item[0])
			stores[`binance_${ symbol }_${ interval }_o`].push(item[1])
			stores[`binance_${ symbol }_${ interval }_h`].push(item[2])
			stores[`binance_${ symbol }_${ interval }_l`].push(item[3])
			stores[`binance_${ symbol }_${ interval }_c`].push(item[4])
			stores[`binance_${ symbol }_${ interval }_v`].push(item[5])
			stores[`binance_${ symbol }_${ interval }_qv`].push(item[7])
			stores[`binance_${ symbol }_${ interval }_bv`].push(item[9])
			stores[`binance_${ symbol }_${ interval }_bqv`].push(item[10])
		  })
		  
	  } catch (err) {
		  console.log(err)
		  continue
	  }
	  
	  await sleep(500);
    }
  }
  
  console.log('Done a process! - ' + new Date().toLocaleString())
  eventEmitter.emit('init_done', 'done');
}


//Check and Update Exchanges coin if have new listing/delisting coin
function getTicker () {
	let result = [];
	axios.get(BINANCE_INFOR_URL)
		.then(datas => {
			datas.data.symbols.forEach( item => {
				let symbol = item.symbol,
				baseAsset = item.baseAsset,
				quoteAsset = item.quoteAsset
				
				result.push({symbol, baseAsset, quoteAsset, exchange: 'binance'});
			})
			console.log('get all symbols done')
			tickers = result
			eventEmitter.emit('binance_tickers', result);
		})
		.catch(err => {
			console.log('Get Ticker Error')
			console.log(err)
		})
}


// require the dependencies we installed
let app = require('express')();

// cross origin
const cors = require('cors');
app.use(cors());

app.set('port', (process.env.PORT || 5000));

app.get('/binance/ohlc/:symbol/:interval', function(req, res) {
  // i.e.: http://localhost:5000/binance/ohlc/btcusdt/1h
  let symbol = req.params.symbol;
  let interval = req.params.interval;
  let ohlc_data = {
    api_name: 'ohlc',
    symbol: symbol,
    interval: interval,
    t: [],
    o: [],
    h: [],
    l: [],
    c: [],
    v: [],
    qv: [],
    bv: [],
    bqv: []
  };

  ohlc_data.t 		= stores[`binance_${ symbol }_${ interval }_t`];
  ohlc_data.o 		= stores[`binance_${ symbol }_${ interval }_o`];
  ohlc_data.h 		= stores[`binance_${ symbol }_${ interval }_h`];
  ohlc_data.l     	= stores[`binance_${ symbol }_${ interval }_l`];
  ohlc_data.c 		= stores[`binance_${ symbol }_${ interval }_c`];
  ohlc_data.v      	= stores[`binance_${ symbol }_${ interval }_v`];
  ohlc_data.qv 		= stores[`binance_${ symbol }_${ interval }_qv`];
  ohlc_data.bv 		= stores[`binance_${ symbol }_${ interval }_bv`];
  ohlc_data.bqv 	= stores[`binance_${ symbol }_${ interval }_bqv`];
  
  res.send(ohlc_data);
  
});

app.get('/binance/tickers', function(req, res) {
  // i.e.: http://localhost:5000/binance/tickers
  res.send(tickers)
});


app.listen(app.get('port'), function() {
  console.log('Server listening on port: ', app.get('port'));
});

getTicker ()