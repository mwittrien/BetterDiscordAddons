var BDfunctionsDevilBro = {};
	
BDfunctionsDevilBro.getReactInstance = function (node) { 
	return node[Object.keys(node).find((key) => key.startsWith("__reactInternalInstance"))];
};

BDfunctionsDevilBro.getKeyInformation = function (node, key, value) {
	var inst = BDfunctionsDevilBro.getReactInstance(node);
	if (!inst) return null;
	var curEle = inst.memoizedProps || inst._currentElement;
	if (curEle) {
		return BDfunctionsDevilBro.searchKeyInReact(curEle, key, value); 
	}
	else {
		return null;
	}
};

BDfunctionsDevilBro.searchKeyInReact = function (ele, key, value) {
	if (!ele) return null;
	if (value === undefined) {
		if (ele[key] != null) 						return ele[key];
		if (ele.props && ele.props[key] != null) 	return ele.props[key];
		if (ele.type && ele.type[key] != null) 		return ele.type[key];
		if (ele.state && ele.state[key] != null) 	return ele.state[key];
	}
	else {
		if ((ele[key] === value) || (ele.props && ele.props[key] === value) || (ele.type && ele.type[key] === value) || (ele.state && ele.state[key] === value)) {
			return value;
		}
	}
	var children, result;
	if (ele.children){
		children = Array.isArray(ele.children) ? ele.children : [ele.children];
		result = null;
		for (let i = 0; result === null && i < children.length; i++){
			result = BDfunctionsDevilBro.searchKeyInReact(children[i], key, value);
		}
		return result;
	}
	if (ele.props && ele.props.children){
		children = Array.isArray(ele.props.children) ? ele.props.children : [ele.props.children];
		result = null;
		for (let i = 0; result === null && i < children.length; i++){
			result = BDfunctionsDevilBro.searchKeyInReact(children[i], key, value);
		}
		return result;
	}
	return null;
};

BDfunctionsDevilBro.getRec = function (node, searchedKey, searchedValue) {
	if (!node || !searchedKey) return null;
	var inst = BDfunctionsDevilBro.getReactInstance(node);
	if (!inst) return null;
	
	// to avoid endless loops (parentnode > childnode > parentnode ...)
	var keyWhiteList = {
		"_currentElement":true,
		"_owner":true,
		"_instance":true,
		"_renderedChildren":true,
		"props":true,
		"state":true,
		"refs":true,
		"updater":true,
		"children":true,
		"type":true,
		"memoizedProps":true,
		"memoizedState":true
	};
	
	return rec(inst);

	
	function rec (ele) {
		if (!ele) return null;
		console.log(ele);
		var keys = Object.keys(ele);
		var result = null;
		for (var i = 0; result === null && i < keys.length; i++) {
			var key = keys[i];
			console.log(i)
			console.log(key)
			var value = ele[keys[i]];
			
			if (searchedKey === key && (searchedValue === undefined || searchedValue === value)) {
				result = value;
			}
			else if (typeof value === "object" && (key[0] == "." || !isNaN(key[0]) || keyWhiteList[key])) {
				result = rec(value);
			}
		}
		return result;
	}
};
	
	
BDfunctionsDevilBro.readServerList = function () {
	var foundServers = [];
	var servers = document.getElementsByClassName("guild");
	for (var i = 0; i < servers.length; i++) {
		var serverData = BDfunctionsDevilBro.getKeyInformation(servers[i], "guild");
		if (serverData) {
			foundServers.push(servers[i]);
		}
	}
	return foundServers;
};
	
BDfunctionsDevilBro.readUnreadServerList = function (servers) {
	if (servers === undefined) servers = BDfunctionsDevilBro.readServerList();
	var foundServers = [];
	for (var i = 0; i < servers.length; i++) {
		var serverData = BDfunctionsDevilBro.getKeyInformation(servers[i], "guild");
		if (serverData) {
			if (servers[i].classList.contains("unread") || $(servers[i]).find(".badge")[0]) {
				foundServers.push(servers[i]);
			}
		}
	}
	return foundServers;
};
	
BDfunctionsDevilBro.getDivOfServer = function (id) {
	var servers = BDfunctionsDevilBro.readServerList();
	for (var i = 0; i < servers.length; i++) {
		if (BDfunctionsDevilBro.getIdOfServer(servers[i]) == id) {
			return servers[i];
		}
	}
	return null;
};
	
BDfunctionsDevilBro.getIdOfServer = function (server) {
	var serverData = BDfunctionsDevilBro.getKeyInformation(server, "guild");
	if (serverData) {
		return serverData.id;
	}
	return null;
};

BDfunctionsDevilBro.themeIsLightTheme = function () {
	if ($(".theme-light").length > $(".theme-dark").length) {
		return true;
	}
	return false;
};

BDfunctionsDevilBro.showHideAllEles = function (show, eles) {
	for (var i = 0; eles.length > i; i++) {
		if (show) {
			$(eles[i]).show();
		}
		else {
			$(eles[i]).hide();
		}
	}
};

BDfunctionsDevilBro.showHideEle = function (show, ele) {
	if (show) {
		$(ele).show();
	}
	else {
		$(ele).hide();
	}
};

BDfunctionsDevilBro.saveData = function (id, data, pluginName, keyName) {
	var settings = bdPluginStorage.get(pluginName, keyName) ? bdPluginStorage.get(pluginName, keyName) : {};
	
	settings[id] = JSON.stringify(data);
	
	bdPluginStorage.set(pluginName, keyName, settings);
};
	
BDfunctionsDevilBro.removeData = function (id, pluginName, keyName) {
	var settings = bdPluginStorage.get(pluginName, keyName) ? bdPluginStorage.get(pluginName, keyName) : {};
	
	delete settings[id];
	
	bdPluginStorage.set(pluginName, keyName, settings);
};

BDfunctionsDevilBro.loadData = function (id, pluginName, keyName) {
	var settings = bdPluginStorage.get(pluginName, keyName) ? bdPluginStorage.get(pluginName, keyName) : {};
	
	var data = settings[id];
	
	return (data ? JSON.parse(data) : null);
};

BDfunctionsDevilBro.appendWebScript = function (filepath) {
	if ($('head script[src="' + filepath + '"]').length > 0) return;
	
	var ele = document.createElement('script');
	$(ele)
		.attr("src", filepath);
	$('head').append(ele);
};

BDfunctionsDevilBro.appendWebStyle = function (filepath) {
	if ($('head link[href="' + filepath + '"]').length > 0) return;

	var ele = document.createElement('link');
	$(ele)
		.attr("type", "text/css")
		.attr("rel", "Stylesheet")
		.attr("href", filepath);
	$('head').append(ele);
};

BDfunctionsDevilBro.appendLocalStyle = function (pluginName, css) {
	if ($('head style[id="' + pluginName + '"]').length > 0) return;

	var ele = document.createElement('style');
	$(ele)
		.attr("id", pluginName)
		.text(css);
	$('head').append(ele);
};

BDfunctionsDevilBro.sortArrayByKey = function (array, key, except) {
	if (except === undefined) except = null;
	return array.sort(function(a, b) {
		var x = a[key]; var y = b[key];
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
};

BDfunctionsDevilBro.getDiscordLanguage = function () {
	switch ($("html").attr("lang").split("-")[0]) {
		case "da": 		//danish
			return {"id":"da","lang":"danish"};
		case "de": 		//german
			return {"id":"de","lang":"german"};
		case "es": 		//spanish
			return {"id":"es","lang":"spanish"};
		case "fr": 		//french
			return {"id":"fr","lang":"italian"};
		case "it": 		//italian
			return {"id":"it","lang":"italian"};
		case "nl":		//dutch
			return {"id":"nl","lang":"dutch"};
		case "no":		//norwegian
			return {"id":"no","lang":"norwegian"};
		case "pl":		//polish
			return {"id":"pl","lang":"polish"};
		case "pt":		//portuguese (brazil)
			return {"id":"pt","lang":"portuguese"};
		case "fi":		//finnish
			return {"id":"fi","lang":"finnish"};
		case "sv":		//swedish
			return {"id":"sv","lang":"turkish"};
		case "tr":		//turkish
			return {"id":"tr","lang":"turkish"};
		case "cs":		//czech
			return {"id":"cs","lang":"czech"};
		case "bg":		//bulgarian
			return {"id":"bg","lang":"bulgarian"};
		case "ru":		//russian
			return {"id":"ru","lang":"russian"};
		case "uk":		//ukranian
			return {"id":"uk","lang":"ukranian"};
		case "ja":		//japanese
			return {"id":"ja","lang":"japanese"};
		case "zh":		//chinese (traditional)
			return {"id":"zh","lang":"chinese"};
		case "ko":		//korean
			return {"id":"ko","lang":"korean"};
		default:		//default: english
			return {"id":"en","lang":"english"};
	}
};
