'use strict'

const { SMA } = require('./sma')

module.exports.EMA = function EMA(data, period){
	
	if(data.length < period) throw new Error("data length err");
	
	let alpha = 2/(period + 1)
	let intial = SMA(data.slice(0,period), period)[period -1]
	
	let result = [intial]
	let tmp = intial
	
	for(let i = period; i < data.length; i++) {
		tmp = (1 -alpha) * tmp + alpha * data[i]
		result.push(tmp)
	}

	let ul = []
	for(let i = 0; i< period -1; i++){
		ul.push(0)
	}
	
	return ul.concat(result)
}
