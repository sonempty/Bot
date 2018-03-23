'use strict'


module.exports.SUM = function SUM(arr) {
	return arr.reduce((s, item) => s + item, 0)
}

module.exports.AVG = function AVG(arr) {
	return arr.reduce((s, item) => s + item, 0)/arr.length
}