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
				client.lrange(`binance_${ symbol }_${ interval }_t`, 95, -1),
				client.lrange(`binance_${ symbol }_${ interval }_o`, 95, -1),
				client.lrange(`binance_${ symbol }_${ interval }_h`, 95, -1),
				client.lrange(`binance_${ symbol }_${ interval }_l`, 95, -1),
				client.lrange(`binance_${ symbol }_${ interval }_c`, 95, -1),
				client.lrange(`binance_${ symbol }_${ interval }_v`, 95, -1),
				client.lrange(`binance_${ symbol }_${ interval }_qv`, 95, -1),
				client.lrange(`binance_${ symbol }_${ interval }_bv`, 95, -1),
				client.lrange(`binance_${ symbol }_${ interval }_bqv`, 95, -1)
			])
			.then(function ([t, o, h, l, c, v, qv, bv, bqv]) {
				console.log(symbol + ' t: ' + t)
				console.log(symbol + ' o: ' + o)
				console.log(symbol + ' h: ' + h)
				console.log(symbol + ' l: ' + l)
				console.log(symbol + ' c: ' + c)
				console.log(symbol + ' v: ' + v)
				console.log(symbol + ' qv: ' + qv)
				console.log(symbol + ' bv: ' + bv)
				console.log(symbol + ' bqv: ' + bqv)
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
