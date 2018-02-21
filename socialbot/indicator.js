const tulind = require('tulind');

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
						t.push(t1)
						o.push(o1)
						c.push(c1)
						l.push(l1)
						h.push(h1)
						v.push(v1)
						bv.push(bv1)
          })

          tulind.indicators.sma.indicator([c], [settings.sma5_period], function(err, results) {
            console.log(symbol + ' SMA5 :' + results[0])
          });
          tulind.indicators.sma.indicator([c], [settings.sma10_period], function(err, results) {
            console.log(symbol + ' SMA10 :' + [results[0])
          });

          tulind.indicators.sma.indicator([c], [settings.sma20_period], function(err, results) {
            console.log(symbol + ' SMA20 :' + results[0])
          });

          tulind.indicators.macd.indicator([c], [settings.macd_fastPeriod, settings.macd_slowPeriod, settings.macd_signalPeriod], function(err, results) {
            console.log(symbol + ' MACD-MACD :' + results[0])
            console.log(symbol + ' MACD-Signal :' + [results[1])
            console.log(symbol + ' MACD-Histogram :' + [results[2])
          });

          tulind.indicators.rsi.indicator([c], [settings.rsi_period], function(err, results) {
            console.log(symbol + ' RSI :' + [results[0])
          });

          tulind.indicators.bbands.indicator([c], [settings.bbands_period, settings.bbands_stdDev], function(err, results) {
            console.log(symbol + ' BB-Upper: ' + results[0])
            console.log(symbol + ' BB-Middle: ' + results[1])
            console.log(symbol + ' BB-Lower: ' + results[2])
          });

          tulind.indicators.mfi.indicator([h, l, c, v], [settings.mfi_period], function(err, results) {
            console.log(symbol + ' MFI: ' + [results[0])
          });

          tulind.indicators.willr.indicator([h, l, c], [settings.willr_period], function(err, results) {
            console.log(symbol + ' Will%R: ' + results[0])
          });

          tulind.indicators.stoch.indicator([h, l, c], [14, 3, 3], function(err, results) {
            console.log(symbol + ' Stoch-K: ' + results[0])
            console.log(symbol + ' Stoch-D: ' + results[1])
          });
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
