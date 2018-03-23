'use strict'

const {SUM, AVG} = require('./utils');

module.exports.RSI = function RSI(data, period) {
	
	if(data.length < period) throw new Error("data length err")
	
	let g = [], l = []
	
	data.forEach((item, i, a) => {
		let c = item - a[i-1]
		
		if(i > 0 ) {
			if(c > 0) {
				g.push(c)
				l.push(0)
			} else if(c < 0) {
				g.push(0)
				l.push(-c)
			} else {
				g.push(0)
				l.push(0)
			}
		} else {
			g.push(0)
			l.push(0)
		}
	})
	
	let ag = [], al = []
	let tmp_ag, tmp_al
	g.forEach((item,i,a) => {
		if(i < period ) {
			ag.push(0)
			al.push(0)
		} else if (i == period) {
			tmp_ag  = AVG(g.slice(0, period))
			ag.push(tmp_ag)
			
			tmp_al  = AVG(l.slice(0, period))
			al.push(tmp_al)
		} else {
			tmp_ag  = ((period - 1)*tmp_ag + g[i] )/period 
			ag.push(tmp_ag)
			
			tmp_al  = ((period - 1)*tmp_al + l[i] )/period
			al.push(tmp_al)
		}
	})
	
	let rs = []
	ag.forEach((item,i) => {
		if (i < period) {
			rs.push(0)
		} else {
			rs.push(item/al[i])
		}
	})
	
	let rsi = []
	rs.forEach((item,i) => {
		if(i < period) {
			rsi.push(0)
		} else {
			if(al[i] == 0) {
				rsi.push(100)
			} else {
				rsi.push(100 - 100/(1 + item))
			}
		}
	})
	
	return rsi
	
}