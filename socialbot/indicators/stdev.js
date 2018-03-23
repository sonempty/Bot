'use strict'

const {SMA} = require('./sma')

module.exports.STDEV = function STDEV(data, period) {
	let s = SMA(data, period)
	let x = s.map((item,i,a) => Math.pow(data[i] - item, 2))

	let y = SMA(x, period)
	
	return y.map(item => Math.sqrt(item))
}