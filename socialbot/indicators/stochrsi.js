'use strict'

const { SMA } = require('./sma')
const { RSI } = require('./rsi');

module.exports.STOCHRSI = function STOCHRSI(close, rsi_length, stoch_length, k, d) {
	
	if(close.length < rsi_length + stoch_length) throw new Error("data length err");
	
	let s = []
	let rsi_data = RSI(close, rsi_length)
	
	for(let i = 0; i < rsi_length + stoch_length -1; i++ ) {
		s.push(0)
	}


	for(let i = rsi_length + stoch_length - 1; i < close.length; i++) {
		let max = Math.max(...rsi_data.slice(i + 1 - stoch_length, i + 1))
		let min = Math.min(...rsi_data.slice(i + 1 - stoch_length, i + 1))
		
		let x = rsi_data[i] - min
		let y = max - min
		
		s.push(100*x/y)
	}
	
	let K = SMA(s, k)
	let D = SMA(K, d)
	
	return [K, D]
	
}