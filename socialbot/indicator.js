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
				lrange(`binance_${ symbol }_${ interval }_t`, 95, -1),
				lrange(`binance_${ symbol }_${ interval }_o`, 95, -1),
				lrange(`binance_${ symbol }_${ interval }_h`, 95, -1),
				lrange(`binance_${ symbol }_${ interval }_l`, 95, -1),
				lrange(`binance_${ symbol }_${ interval }_c`, 95, -1),
				lrange(`binance_${ symbol }_${ interval }_v`, 95, -1),
				lrange(`binance_${ symbol }_${ interval }_qv`, 95, -1),
				lrange(`binance_${ symbol }_${ interval }_bv`, 95, -1),
				lrange(`binance_${ symbol }_${ interval }_bqv`, 95, -1)
			])
			.then(function ([t, o, h, l, c, v, qv, bv, bqv]) {
				let sma5 = SMA.calculate({period:5, values:c})
				let sma10 = SMA.calculate({period:10, values:c})
				let sma20 = SMA.calculate({period:20, values:c})
				console.log(`binance_${ symbol }_${ interval }` + ' Time: ' + new Date(t[t.length -1]).toLocaleString() + ' SMA5: ' + sma5)
				console.log(`binance_${ symbol }_${ interval }` + ' Time: ' + new Date(t[t.length -1]).toLocaleString() + ' SMA10: ' + sma10)
				console.log(`binance_${ symbol }_${ interval }` + ' Time: ' + new Date(t[t.length -1]).toLocaleString() + ' SMA20: ' + sma20)

				let rsi = RSI.calculate({period:14, values:c})
				console.log(`binance_${ symbol }_${ interval }` + ' Time: ' + new Date(t[t.length -1]).toLocaleString() + ' RSI: ' + rsi)

				let macd = MACD.calculate({fastPeriod:12, slowPeriod:26, signalPeriod:9, values:c, SimpleMAOscillator:false, SimpleMASignal:false})
				console.log(`binance_${ symbol }_${ interval }` + ' Time: ' + new Date(t[t.length -1]).toLocaleString() + ' MACD: ' + macd)
			})
    })
  })
}


const settings = {
  array_length: 30,

  sma5_period: 5,
  sma10_period: 10,
  sma20_period: 20,

  ema_period: 10,

  macd_fastPeriod: 12,
  macd_slowPeriod: 26,
  macd_signalPeriod: 9,

  rsi_period: 14,

  bbands_period: 20,
  bbands_stdDev: 2,

  mfi_period: 14,

  willr_period: 14
}
