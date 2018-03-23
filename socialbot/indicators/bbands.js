'use strict'

const {SMA} = require('./sma');
const {STDEV} = require('./stdev');

module.exports.BBANDS = function BBANDS(data, period, D) {
	
	let middle = SMA(data, period)
	let y = STDEV(data, period)

	let upper = middle.map((item,i) => item + D * y[i])
	let lower = middle.map((item,i) => item - D * y[i])
	
	return [lower, middle, upper]
}