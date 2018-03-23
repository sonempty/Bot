'use strict'

const { EMA } = require('./ema')

module.exports.MACD = function MACD(data, fast, slow, signal) {
	
	if(data.length < slow) throw new Error("data length err");
	
	let ema12 = EMA(data, fast)
	let ema26 = EMA(data, slow)
	let macd = ema12.map((item, i) => {
		if(i >= slow + fast) return ema12[i] - ema26[i]
		return 0
	})
	
	let ul = []
	for(let i = 0; i< slow; i++){
		ul.push(0)
	}
	
	let signal_data = EMA( macd.slice(slow), signal)
	signal_data = ul.concat(signal_data)
	
	let histogram = macd.map((item,i) => {
		return item - signal_data[i]
	})
	
	return [histogram, signal_data, macd]
	
}