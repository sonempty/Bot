'use strict';

// Require dependencies
const axios = require('axios');
const events = require('events');

// Binance Exchange Base API URL
const BINANCE_BASE_URL = 'https://api.binance.com/api/v1/';
const BINANCE_INFOR_URL = 'https://api.binance.com/api/v1/exchangeInfo';
let stores = {};
let tickers = [];
let scores = {}

// Indicator
const { SMA } = require('./socialbot/indicators/sma')
const { STOCHRSI } = require('./socialbot/indicators/stochrsi')
const { MACD } = require('./socialbot/indicators/macd')

// By pass Binance anti-ddos (current: 500ms)
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//Assign the event handler to an event. Call `initOCLH` after `getTicker`
let eventEmitter = new events.EventEmitter();
eventEmitter.on('binance_tickers', initOCLH);
eventEmitter.on('init_done', getTicker);

//Init <limit> records for each interval and coin
async function initOCLH(symbols) {
  for (let interval of ['15m', '1h', '4h', '1d']) {
    for (let item of symbols) {
	  let symbol = item.symbol
      let limit = 200;
      let url = `${ BINANCE_BASE_URL }klines?symbol=${ symbol }&interval=${ interval }&limit=${ limit }`
	  let t,o,h,l,c,v,qv,bv,bqv
	  
	  try { 
		  let result = await axios.get(url);
		  let items = result.data
		  t = stores[`binance_${ symbol }_${ interval }_t`] = []
		  o = stores[`binance_${ symbol }_${ interval }_o`] = []
		  h = stores[`binance_${ symbol }_${ interval }_h`] = []
		  l = stores[`binance_${ symbol }_${ interval }_l`] = []
		  c = stores[`binance_${ symbol }_${ interval }_c`] = []
		  v = stores[`binance_${ symbol }_${ interval }_v`] = []
		  qv = stores[`binance_${ symbol }_${ interval }_qv`] = []
		  bv = stores[`binance_${ symbol }_${ interval }_bv`] = []
		  bqv = stores[`binance_${ symbol }_${ interval }_bqv`] = []
		  
		  items.forEach(item => {
			// startTime - startTime, o, c, l, h, vol, quotevol, buyvol, vuyquotevol
			t.push(+item[0])
			o.push(+item[1])
			h.push(+item[2])
			l.push(+item[3])
			c.push(+item[4])
			v.push(+item[5])
			qv.push(+item[7])
			bv.push(+item[9])
			bqv.push(+item[10])
		  })
		  
	  } catch (err) {
		  console.log(err)
		  continue
	  }
	  
	  try {
			let stochrsi = STOCHRSI(c, 14, 14, 3, 3)
			let macd = MACD(c, 12, 26, 9)
			
			let bot_data = bot(t, macd[0], stochrsi[0])
			
			if(!scores[interval]) 			scores[interval] = {}
		    if(!scores[interval][symbol]) 	scores[interval][symbol] = {}
			
			if(bot_data.buy_final) {
				scores[interval][symbol] =  {symbol, interval, index: bot_data.buy_final, type: 'BUY', score: bot_data.buy_count, time: new Date(t[bot_data.buy_final]).toLocaleString() } 
			} else {
				scores[interval][symbol] =  {symbol, interval, index: bot_data.sell_final, type: 'SELL', score: bot_data.sell_count, time: new Date(t[bot_data.sell_final]).toLocaleString()}
			}

		} catch(err) {
			console.log(err.message)
		}
		  
	  await sleep(500);
	}
	
	console.log('Done interval! - ', interval, new Date().toLocaleString())
  }
  
  console.log('Done a process! - ' + new Date().toLocaleString())
  eventEmitter.emit('init_done', 'done');
}

function getTicker () {
	let result = [];
	axios.get(BINANCE_INFOR_URL)
		.then(datas => {
			datas.data.symbols.forEach( item => {
				let symbol = item.symbol,
				baseAsset = item.baseAsset,
				quoteAsset = item.quoteAsset,
				string = 'Binance:  ' + baseAsset + '/' + quoteAsset
				
				if(symbol !== '123456') result.push({symbol, baseAsset, quoteAsset, string, exchange: 'binance'});
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


// API server
let app = require('express')();
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

app.get('/binance/scores', function(req, res) {
  // i.e.: http://localhost:5000/binance/scores
  res.send(scores)
});

app.get('/binance/tickers', function(req, res) {
  // i.e.: http://localhost:5000/binance/tickers
  res.send(tickers)
});


app.listen(app.get('port'), function() {
  console.log('Server listening on port: ', app.get('port'));
});


function bot(t, macd, stochrsi){
	

	let buy_index = 0, sell_index = 0
	let buy_count = 0, sell_count = 0
	let buy_final = 0, sell_final = 0
	
	let last = macd[macd.length - 1]

	for(let i = macd.length -1; i>=1; i--){
		if(macd[i]*macd[i-1] <= 0) {
			if(macd[i] > 0 ) {
				sell_index = i
			} else {
				buy_index = i
			}
			break
		}
	}
	
	if(buy_index) {
		for(let i = buy_index; i < macd.length; i++) {
			if( macd[i] <= macd[i - 1]) {
				buy_count++
				if(stochrsi[i] < 30){
					buy_final = i
				}
			}
		}
		return { buy_final, buy_count }
	}

	if(sell_index) {
		for(let i = sell_index; i < macd.length; i++) {
			if( macd[i] >= macd[i - 1]) {
				sell_count++
				if(stochrsi[i] > 70){
					sell_final = i
				}
			}
		}
		
		return { sell_final, sell_count }
	}
}

getTicker ()