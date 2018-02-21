const technicalindicators = require('technicalindicators');
const SMA = technicalindicators.SMA;
const RSI = technicalindicators.RSI;
const MACD = technicalindicators.MACD;

// Redis Client to read Data
let redis = require('redis');
let client = redis.createClient();

const {promisify} = require('util');
const lrange = promisify(client.lrange).bind(client);

client.on('error', function(err) {
  console.log("Error " + err);
});

// Get all symbols and calculate all indicator
client.get('binance_symbols', calculateIndicator)

function calculateIndicator(err, symbols) {

	if(err) {
		console.log('Get symbols from Redis error', err)
		return
	}

  let symbol_list = symbols.split(',')
  let intervals = ['15m', '30m', '1h', '4h', '1d']
  intervals.forEach(interval => {
    symbol_list.forEach(symbol => {
			Promise.all([
				lrange(`binance_${ symbol }_${ interval }_t`, 0, -1),
				lrange(`binance_${ symbol }_${ interval }_o`, 0, -1),
				lrange(`binance_${ symbol }_${ interval }_h`, 0, -1),
				lrange(`binance_${ symbol }_${ interval }_l`, 0, -1),
				lrange(`binance_${ symbol }_${ interval }_c`, 0, -1),
				lrange(`binance_${ symbol }_${ interval }_v`, 0, -1),
				lrange(`binance_${ symbol }_${ interval }_qv`, 0, -1),
				lrange(`binance_${ symbol }_${ interval }_bv`, 0, -1),
				lrange(`binance_${ symbol }_${ interval }_bqv`, 0, -1)
			])
			.then(function ([t, o, h, l, c, v, qv, bv, bqv]) {
				//convert to number
				[t, o, h, l, c, v, qv, bv, bqv] = [t, o, h, l, c, v, qv, bv, bqv].map(item => item.map(x => +x))

				let sma5 = [0,0,0,0].concat( SMA.calculate({period:5, values:c}) )  //t.length + 1 - period
				let sma10 = [0,0,0,0,0,0,0,0,0].concat( SMA.calculate({period:10, values:c}) )
				let sma20 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0].concat( SMA.calculate({period:20, values:c}) )
				console.log(`binance_${ symbol }_${ interval }` + ' t - sma5 length:  ' + t.length + ' ' + sma5.length)
				console.log(`binance_${ symbol }_${ interval }` + ' t - sma10 length:  ' + t.length + ' ' + sma10.length)
				console.log(`binance_${ symbol }_${ interval }` + ' t - sma20 length:  ' + t.length + ' ' + sma20.length)

				let rsi = RSI.calculate({period:14, values:c})

				let macd = MACD.calculate({fastPeriod:12, slowPeriod:26, signalPeriod:9, values:c, SimpleMAOscillator:false, SimpleMASignal:false})

			})
    })
  })
}
