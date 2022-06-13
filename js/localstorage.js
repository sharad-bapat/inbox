function setLocalStorage(key, value, ttl) {
	const now = new Date();
	const item = {
		value: value,
		expiry: now.getTime() + ttl
	};
	localStorage.setItem(key, JSON.stringify(item));
}
function getLocalStorage(key) {
	const itemStr = localStorage.getItem(key);
	if (!itemStr) {
		return null;
	}
	const item = JSON.parse(itemStr);
	const now = new Date();
	if (now.getTime() > item.expiry) {
		localStorage.removeItem(key);
		return null;
	}
	return item.value;
}
function get_localstorage_size() {
	var _lsTotal = 0,
		_xLen, _x;
	for (_x in localStorage) {
		if (!localStorage.hasOwnProperty(_x)) {
			continue;
		}
		_xLen = ((localStorage[_x].length + _x.length) * 2);
		_lsTotal += _xLen;
		var unixtime = JSON.parse(localStorage[_x]).expiry;
		var currTime = Date.now();
		var timediff = Math.round(unixtime/1000 - currTime / 1000);
		if (timediff / 60 / 60 < 1) {
			timediff = Math.round(timediff / 60) + " minutes";
		} else {
			timediff = Math.round(timediff / 60 / 60) + " hours";
		}
		if (parseInt(timediff)>0){
			console.log(_x.slice(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB. Expires in:" + timediff)			
		}		
		
	};
	console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");
}

get_localstorage_size();