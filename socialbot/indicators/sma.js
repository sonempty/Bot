'use strict'

// period - 1 ZERO
module.exports.SMA = function SMA(data, period) {
	
	if(data.length < period) throw new Error("data length err");
	
	let x =  data.map((item, i, a) => {
		if(i >= period -1 ) {
			let sum = 0
			for(let j=0; j< period; j++) {
				sum += a[i-j]
			}
			return sum/period
		} else {
			return 0
		}
	})
	return x
}