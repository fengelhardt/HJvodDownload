var HomerjVODDownload = {
	init: function() {
		// The event can be DOMContentLoaded, pageshow, pagehide, load or unload.
		if(gBrowser) gBrowser.addEventListener("DOMContentLoaded", this.onPageLoad, false);
		// constants
	},
	
	base64_decode: function(data) {
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
		ac = 0,
		dec = "",
		tmp_arr = [];
		if (!data) {
			return data;
		}
		data += "";
		do {
			h1 = b64.indexOf(data.charAt(i++));
			h2 = b64.indexOf(data.charAt(i++));
			h3 = b64.indexOf(data.charAt(i++));
			h4 = b64.indexOf(data.charAt(i++));
			if(h1 < 0 || h2 < 0 || h3 < 0 || h4 < 0) return data;
			bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
			o1 = bits >> 16 & 0xff;
			o2 = bits >> 8 & 0xff;
			o3 = bits & 0xff;
			if (h3 == 64) {
				tmp_arr[ac++] = String.fromCharCode(o1);
			} else if (h4 == 64) {
				tmp_arr[ac++] = String.fromCharCode(o1, o2);
			} else {
				tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
			}
		} while (i < data.length);
		dec = tmp_arr.join("");
		return dec;
	},
	
	putLink: function(doc, url) {
		var node = doc.getElementById("current_vod_title");
		if(node) {
			node = node.parentNode;
			if(node) {
				node.innerHTML += "&nbsp; (<a href='" + url + "'>video url</a>)";
				return;
			}
		}
		HomerjVODDownload.consoleService.logStringMessage(
			"Homerj VOD Downloader: Did not find position to input vod link. Maybe the techlab changed the site structure.");
	},
	
	extractURL: function(doc) {
		// 2. param: server, 3. param: file
		VOD_PATTERN = /pseudo_VodPlayer\([^,]*,([^,]*),([^,]*),[^,]*,[^,]*,[^,]*/g;
		PARAM_PATTERN = /'([^']*)'/g;
		PARAM_PATTERN2 = /'([^']*)'/g;
		
		var url = "";
		var text = doc.body.innerHTML;
		if(VOD_PATTERN.test(text)) {
			var paramServer = RegExp.$1;
			var paramFile = RegExp.$2;
			if(null == PARAM_PATTERN.test(paramServer)) {
				HomerjVODDownload.consoleService.logStringMessage(
					"Homerj VOD Downloader: Param pattern did not match site content, although there seems to be a vod in here. Maybe the techlab changed the site structure.");
				return "";
			}
			url = "http://" + HomerjVODDownload.base64_decode(RegExp.$1);
			if(null == PARAM_PATTERN2.test(paramFile)) {
				HomerjVODDownload.consoleService.logStringMessage(
					"Homerj VOD Downloader: Param pattern did not match site content, although there seems to be a vod in here. Maybe the techlab changed the site structure.");
				return "";
			}
			url = url + "/" + HomerjVODDownload.base64_decode(RegExp.$1);
			
		}
		else {
			HomerjVODDownload.consoleService.logStringMessage(
				"Homerj VOD Downloader: Vod pattern did not match site content, although there seems to be a vod in here. Maybe the techlab changed the site structure.");
			return "";
		}/*
		if(url.search(/http/g) < 0) {
			HomerjVODDownload.consoleService.logStringMessage(
				"Homerj VOD Downloader: Found object '"+url+"' doesn't seem to be a vod url, although there seems to be a vod in here. Maybe the techlab changed the site structure.");
			return "";
		}
		else {*/
			HomerjVODDownload.consoleService.logStringMessage(
				"Homerj VOD Downloader: Retrieved vod url: " + url);
		/*}*/
		return url;
	},
	
	onPageLoad: function(event) {
		var doc = event.originalTarget; // doc is document that triggered the event
		var win = doc.defaultView; // win is the window for the doc
		// test desired conditions and do something
		if (win != win.top) return; //only top window.
		if (win.frameElement) return; // skip iframes/frames
		
		PAGE_PATTERN = /.*homerj\.de.*play.*/g;
		
		if(PAGE_PATTERN.test(doc.defaultView.location.href)) {
			var url = HomerjVODDownload.extractURL(doc);
			if(url != "") HomerjVODDownload.putLink(doc, url);
		}
	},
	
	consoleService: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService)
}

window.addEventListener("load", function load(event){
	window.removeEventListener("load", load, false); //remove listener, no longer needed
	HomerjVODDownload.init();  
},false);
