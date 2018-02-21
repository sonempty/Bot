const technicalindicators = require('technicalindicators')
const SMA = technicalindicators.SMA

// Redis Client to read Data
let redis = require('redis');
let client = redis.createClient();
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
      client.zrange(`binance_${ symbol }_${ interval }`, 70, -1, function(err, result) {
        if (err) console.log('indicator get data symbol error!', err)
        if (result) {
          let t = o = c = l = h = v = bv = []
          result.forEach(r => {
            let rows = r.split(' ')
						let [t1, o1, c1, l1, h1, v1, bv1] = rows
						t.push(+t1)
						o.push(+o1)
						c.push(+c1)
						l.push(+l1)
						h.push(+h1)
						v.push(+v1)
						bv.push(+bv1)
						let sma5 = SMA.calculate({period : 5, values : c})
						let sma10 = SMA.calculate({period : 10, values : c})
						let sma20 = SMA.calculate({period : 20, values : c})
						console.log(symbol + ' Time: ' + new Date(t[t.length - 1]).toLocaleString() + ' SMA5: ' + sma5)
						console.log(symbol + ' Time: ' + new Date(t[t.length - 1]).toLocaleString() + ' SMA10: ' + sma10)
						console.log(symbol + ' Time: ' + new Date(t[t.length - 1]).toLocaleString() + ' SMA20: ' + sma20)
						
          })
        }
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
