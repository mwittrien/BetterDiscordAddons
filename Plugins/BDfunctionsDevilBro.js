var BDfunctionsDevilBro = {};
	
BDfunctionsDevilBro.loadMessage = function (pluginName) { 
	console.log(pluginName + ": Loaded.");
};
	
BDfunctionsDevilBro.fatalMessage = function (pluginName) { 
	console.error(pluginName + ": Fatal Error: Could not load BD functions!");
};
	
BDfunctionsDevilBro.translateMessage = function (pluginName) { 
	console.log(pluginName + ": Changed plugin language to: " + BDfunctionsDevilBro.getDiscordLanguage().lang);
};
	
BDfunctionsDevilBro.getReactInstance = function (node) { 
	return node[Object.keys(node).find((key) => key.startsWith("__reactInternalInstance"))];
};

BDfunctionsDevilBro.getKeyInformation = function (config) {
	if (config === undefined) return null;
	if (config.node === undefined || config.key === undefined) return null;
	
	var inst = BDfunctionsDevilBro.getReactInstance(config.node);
	if (!inst) return null;
	
	
	// to avoid endless loops (parentnode > childnode > parentnode ...)
	var maxDepth = config.depth === undefined ? 50 : config.depth;
		
	var keyWhiteList = typeof config.whiteList === "object" ? config.whiteList : {
		"_currentElement":true,
		"_renderedChildren":true,
		"_instance":true,
		"_owner":true,
		"props":true,
		"state":true,
		"stateNode":true,
		"refs":true,
		"updater":true,
		"children":true,
		"type":true,
		"memoizedProps":true,
		"memoizedState":true,
		"child":true,
		"firsEffect":true
	};
	
	var keyBlackList = typeof config.blackList === "object" ? config.blackList : {
	};
	
	return searchKeyInReact(inst, 0);

	function searchKeyInReact (ele, depth) {
		if (!ele || depth > maxDepth) return null;
		var keys = Object.keys(ele);
		var result = null;
		for (var i = 0; result === null && i < keys.length; i++) {
			var key = keys[i];
			var value = ele[keys[i]];
			
			if (config.key === key && (config.value === undefined || config.value === value)) {
				result = value;
			}
			else if ((typeof value === "object" || typeof value === "function") && ((keyWhiteList[key] && !keyBlackList[key]) || key[0] == "." || !isNaN(key[0]))) {
				result = searchKeyInReact(value, depth++);
			}
		}
		return result;
	}
};
	
	
BDfunctionsDevilBro.readServerList = function () {
	var foundServers = [];
	var servers = $(".guild");
	for (var i = 0; i < servers.length; i++) {
		var serverData = BDfunctionsDevilBro.getKeyInformation({"node":servers[i], "key":"guild"});
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
		var serverData = BDfunctionsDevilBro.getKeyInformation({"node":servers[i], "key":"guild"});
		if (serverData) {
			if (servers[i].classList.contains("unread") || $(servers[i]).find(".badge")[0]) {
				foundServers.push(servers[i]);
			}
		}
	}
	return foundServers;
};
	
BDfunctionsDevilBro.readChannelList = function () {
	var foundChannels = [];
	var channels = $(".containerDefault-7RImuF");
	for (var i = 0; i < channels.length; i++) {
		var channelData = BDfunctionsDevilBro.getKeyInformation({"node":channels[i], "key":"channel"});
		if (channelData) {
			foundChannels.push(channels[i]);
		}
	}
	return foundChannels;
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
	var serverData = BDfunctionsDevilBro.getKeyInformation({"node":server, "key":"guild"});
	if (serverData) {
		return serverData.id;
	}
	return null;
};
	
BDfunctionsDevilBro.getDivOfChannel = function (channelID, serverID) {
	var channels = BDfunctionsDevilBro.readChannelList();
	for (var i = 0; i < channels.length; i++) {
		var channelData = BDfunctionsDevilBro.getKeyInformation({"node":channels[i], "key":"channel"});
		if (channelData) {
			if (channelID == channelData.id && serverID == channelData.guild_id) {
				return channels[i];
			}
		}
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

BDfunctionsDevilBro.removeLocalStyle = function (pluginName) {
	$('head style[id="' + pluginName + '"]').remove();
};

BDfunctionsDevilBro.sortArrayByKey = function (array, key, except) {
	if (except === undefined) except = null;
	return array.sort(function(a, b) {
		var x = a[key]; var y = b[key];
		if (x != except) {
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		}
	});
};

BDfunctionsDevilBro.clearReadNotifications = function (servers) {
	if (!servers) return;
	servers = Array.isArray(servers) ? servers : Array.of(servers);
	servers.forEach(
			(server,i) => {
				setTimeout(() => {
					var handleContextMenu = BDfunctionsDevilBro.getKeyInformation({"node":server.firstElementChild, "key":"handleContextMenu", "blackList":{"_owner":true}});
					
					if (handleContextMenu) {
						var data = {
							preventDefault: a=>a,
							stopPropagation: a=>a,
							pageX: -1000 + Math.round(Math.random()*500),
						};
						
						handleContextMenu(data);
						
						var contextentries = $(".context-menu .item-group");
						
						for (var i = 0; contextentries.length > i; i++) {
							var ele = contextentries[i];
							var contextType = BDfunctionsDevilBro.getKeyInformation({"node":ele, "key":"displayName", "value":"GuildMarkReadItem"});
							if (contextType) {
								ele.firstElementChild.click();
								break;
							}
						}
					}
				},i*100);
			}
		); 
};

BDfunctionsDevilBro.checkForNewPluginVersion = function (pluginName, pluginUrl, oldVersion) {
	$.get(pluginUrl, (script) => {
		if (script) {
			script = script.split('getVersion () {return "')[1];
			if (script) {
				var newVersion = script.split('";}')[0];
				console.log(newVersion);
			}
		}
	});
}

BDfunctionsDevilBro.getDiscordLanguage = function () {
	var lang = $("html").attr("lang").split("-")[0] ? $("html").attr("lang").split("-")[0] : "en";
	switch (lang) {
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
