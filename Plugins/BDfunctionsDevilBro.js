var BDfunctionsDevilBro = {};

BDfunctionsDevilBro.loadMessage = function (pluginName, oldVersion) { 
	console.log(pluginName + " Version: " + oldVersion + " loaded.");
	var rawUrl = BDfunctionsDevilBro.getRawUrl(pluginName);
	var downloadUrl = BDfunctionsDevilBro.getDownloadUrl(pluginName);
	BDfunctionsDevilBro.checkUpdate(pluginName, rawUrl, downloadUrl, oldVersion);
	
	if (typeof window.PluginUpdates !== "object" || !window.PluginUpdates) window.PluginUpdates = {plugins:{}};
	window.PluginUpdates.plugins[rawUrl] = {name:pluginName, raw:rawUrl, download:downloadUrl, version:oldVersion};
	
	if (typeof window.PluginUpdates.interval === "undefined") {
		window.PluginUpdates.interval = setInterval(() => {
			BDfunctionsDevilBro.checkAllUpdates();
		},7200000);
	}
	
	if (typeof window.PluginUpdates.observer === "undefined") {
		window.PluginUpdates.observer = new MutationObserver((changes, _) => {
			changes.forEach(
				(change, i) => {
					if (change.addedNodes) {
						change.addedNodes.forEach((node) => {
							if (node && node.tagName && node.getAttribute("layer-id") == "user-settings") {
								var settingsObserver = new MutationObserver((changes2, _) => {
									changes2.forEach(
										(change2, j) => {
											if (change2.addedNodes) {
												change2.addedNodes.forEach((node2) => {
													if (!document.querySelector(".bd-updatebtn")) {
														if (node2 && node2.tagName && node2.querySelector(".bd-pfbtn")) {
															var updateButton = BDfunctionsDevilBro.createUpdateButton();
															node2.querySelector(".bd-pfbtn").parentElement.insertBefore(updateButton, node2.querySelector(".bd-pfbtn").nextSibling);
														}
													}
												});
											}
										}
									);
								});
								settingsObserver.observe(node, {childList:true, subtree:true});
							}
						});
					}
				}
			);
		});
		window.PluginUpdates.observer.observe(document.querySelector(".layers"), {childList:true});
	}
};

BDfunctionsDevilBro.checkUpdate = function (pluginName, rawUrl, downloadUrl, oldVersion) {
	$.get(rawUrl, (script) => {
		if (script) {
			script = script.replace(new RegExp(" |\t|\n|\r", 'g'), "").split('getVersion(){return"')[1];
			if (script) {
				var newVersion = script.split('";}')[0];
				var oldNmbrs = oldVersion.split(".").map(Number); 
				var newNmbrs = newVersion.split(".").map(Number); 
				if (oldNmbrs.length == newNmbrs.length) {
					var notice = $('#' + pluginName + '-notice');
					if (notice.length) {
						if (notice.next('.separator').length) notice.next().remove();
						else if (notice.prev('.separator').length) notice.prev().remove();
						notice.remove();
					}
					if (!$('#outdatedPlugins').children('span').length) $('#pluginNoticeDismiss').click();
					for (var i = 0; i < oldNmbrs.length; i++) {
						if (newNmbrs[i] > oldNmbrs[i]) {
							var noticeCSS = `
								#pluginNotice span, 
								#pluginNotice span a {
									-webkit-app-region: no-drag;
									color:#fff;
								} 
								#pluginNotice span a:hover {
									text-decoration:underline;
								}`;
							BDfunctionsDevilBro.removeLocalStyle("pluginNoticeCSS");
							BDfunctionsDevilBro.appendLocalStyle("pluginNoticeCSS", noticeCSS);
							var noticeElement = `<div class="notice notice-info" id="pluginNotice"><div class="notice-dismiss" id="pluginNoticeDismiss"></div>The following plugins have updates: &nbsp;<strong id="outdatedPlugins"></strong></div>`;
							if (!$('#pluginNotice').length) {
								$('.app.flex-vertical').children().first().before(noticeElement);
								$('.win-buttons').addClass("win-buttons-notice");
								$('#pluginNoticeDismiss').on('click', () => {
									$('.win-buttons').animate({top: 0}, 400, "swing", () => {$('.win-buttons').css("top","").removeClass("win-buttons-notice");});
									$('#pluginNotice').slideUp({complete: () => {
										$('#pluginNotice').remove();
									}});
								});
							}
							var pluginNoticeID = pluginName + "-notice";
							if (!$('#'+pluginNoticeID).length) {
								var pluginNoticeElement = $('<span id="' + pluginNoticeID + '">');
								pluginNoticeElement.html('<a href="' + downloadUrl + '" target="_blank">' + pluginName + '</a>');
								if ($('#outdatedPlugins').children('span').length) {
									$('#outdatedPlugins').append("<span class='separator'>, </span>");
								}
								$('#outdatedPlugins').append(pluginNoticeElement);
							}
							break;
						}
						else if (newNmbrs[i] < oldNmbrs[i]) {
							break;
						}
					}
				}
			}
		}
	});
};

BDfunctionsDevilBro.checkAllUpdates = function () {
	for (let key in window.PluginUpdates.plugins) {
		let plugin = window.PluginUpdates.plugins[key];
		BDfunctionsDevilBro.checkUpdate(plugin.name, plugin.raw, plugin.download, plugin.version);
	}
};

BDfunctionsDevilBro.createUpdateButton = function () {
	var updateButton = document.createElement("button");
	var tooltip = document.createElement("div");
	var tooltipobserver = new MutationObserver(() => {});
	updateButton.className = "bd-pfbtn bd-updatebtn";
	updateButton.innerText = "Check for Updates";
	updateButton.style.left = "220px";
	updateButton.onclick = function () {
		BDfunctionsDevilBro.checkAllUpdates();
	};			
	updateButton.onmouseover = function () {
		document.querySelector(".tooltips").appendChild(tooltip);
		tooltip.className = "tooltip tooltip-right tooltip-black";
		tooltip.innerText = "Only checks for updates of plugins, which support the updatecheck. Rightclick for a list."
		tooltip.style.maxWidth = "";
		tooltip.style.left = $(updateButton).offset().left + $(updateButton).outerWidth() + "px";
		tooltip.style.top = $(updateButton).offset().top + ($(updateButton).outerHeight() - $(tooltip).outerHeight())/2 + "px";
		tooltipobserver = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				var nodes = Array.from(mutation.removedNodes);
				var directMatch = nodes.indexOf(updateButton) > -1;
				var parentMatch = nodes.some(parent => parent.contains(updateButton));
				if (directMatch || parentMatch) {
					tooltipobserver.disconnect();
					tooltip.remove();
				}
			});
		});
		tooltipobserver.observe(document.body, {subtree: true, childList: true});
	};		
	updateButton.onmouseout = function () {
		tooltipobserver.disconnect();
		tooltip.remove();
	};	
	updateButton.oncontextmenu = function () {
		if (window.PluginUpdates && window.PluginUpdates.plugins) {
			var list = [];
			for (var plugin in window.PluginUpdates.plugins) {
				list.push(window.PluginUpdates.plugins[plugin].name);
			}
			tooltip.innerText = list.sort().join(", ");
			tooltip.style.maxWidth = "400px";
			tooltip.style.left = $(updateButton).offset().left + $(updateButton).outerWidth() + "px";
			tooltip.style.top = $(updateButton).offset().top + ($(updateButton).outerHeight() - $(tooltip).outerHeight())/2 + "px";
		}
	};
	return updateButton;
}
	
BDfunctionsDevilBro.translateMessage = function (pluginName) { 
	console.log(pluginName + ": Changed plugin language to: " + BDfunctionsDevilBro.getDiscordLanguage().lang);
};

BDfunctionsDevilBro.getRawUrl = function (pluginName) {
	return "https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/" + pluginName + "/" + pluginName + ".plugin.js";
};

BDfunctionsDevilBro.getDownloadUrl = function (pluginName) {
	return "https://betterdiscord.net/ghdl?url=https://github.com/mwittrien/BetterDiscordAddons/blob/master/Plugins/" + pluginName + "/" + pluginName + ".plugin.js";
};
	
BDfunctionsDevilBro.getReactInstance = function (node) { 
	return node[Object.keys(node).find((key) => key.startsWith("__reactInternalInstance"))];
};

BDfunctionsDevilBro.getOwnerInstance = function (config) { 
	if (config === undefined) return null;
	if (!config.node || !config.name) return null;
	var inst = BDfunctionsDevilBro.getReactInstance(config.node);
	if (!inst) return null;
	
	var depth = -1;
	var maxDepth = config.depth === undefined ? 15 : config.depth;
	
	var upwards = config.up === undefined ? false : config.up;
	
	var start = performance.now();
	var maxTime = config.time === undefined ? 200000 : config.time;
		
	var keyWhiteList = upwards ? {"return":true,"sibling":true} : {"child":true,"sibling":true};
	
	return searchOwnerInReact(inst);
	
	function searchOwnerInReact (ele) {
		depth++;
		if (!ele || BDfunctionsDevilBro.getReactInstance(ele) || depth > maxDepth || performance.now() - start > maxTime) result = null;
		else {
			var keys = Object.getOwnPropertyNames(ele);
			var result = null;
			for (var i = 0; result === null && i < keys.length; i++) {
				var key = keys[i];
				var value = ele[keys[i]];
				
				if (ele.type && ele.type.displayName === config.name) {
					result = ele.stateNode;
				}
				else if ((typeof value === "object" || typeof value === "function") && keyWhiteList[key]) {
					result = searchOwnerInReact(value);
				}
			}
		}
		depth--;
		return result;
	}
};

BDfunctionsDevilBro.getKeyInformation = function (config) {
	if (config === undefined) return null;
	if (!config.node || !config.key) return null;
	
	var inst = BDfunctionsDevilBro.getReactInstance(config.node);
	if (!inst) return null;
	
	var depth = -1;
	var maxDepth = config.depth === undefined ? 15 : config.depth;
	
	var start = performance.now();
	var maxTime = config.time === undefined ? 200000 : config.time;
		
	var keyWhiteList = {
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
		"sibling":true,
		"firstEffect":true
	};
	
	if (typeof config.whiteList === "object") Object.assign(keyWhiteList, config.whiteList);
	
	var keyBlackList = typeof config.blackList === "object" ? config.blackList : {
	};
	
	var resultArray = [];
	var singleResult = searchKeyInReact(inst);
	
	if (config.all) return resultArray;
	else return singleResult;

	function searchKeyInReact (ele) {
		depth++;
		if (!ele || BDfunctionsDevilBro.getReactInstance(ele) || depth > maxDepth || performance.now() - start > maxTime) result = null;
		else {
			var keys = Object.getOwnPropertyNames(ele);
			var result = null;
			for (var i = 0; result === null && i < keys.length; i++) {
				var key = keys[i];
				var value = ele[keys[i]];
				
				if (config.key === key && (config.value === undefined || config.value === value)) {
					if (config.all === undefined || !config.all) {
						result = value;
					}
					else if (config.all) {
						if (config.noCopies === undefined || !config.noCopies) {
							resultArray.push(value);
						}
						else if (config.noCopies) {
							var included = false;
							for (var j = 0; j < resultArray.length; j++) {
								if (BDfunctionsDevilBro.equals(value, resultArray[j])) {
									included = true;
									break;
								}
							}
							if (!included) resultArray.push(value);
						}
					}
				}
				else if ((typeof value === "object" || typeof value === "function") && ((keyWhiteList[key] && !keyBlackList[key]) || key[0] == "." || !isNaN(key[0]))) {
					result = searchKeyInReact(value);
				}
			}
		}
		depth--;
		return result;
	}
};

BDfunctionsDevilBro.equals = function (check1, check2, compareOrder) {
	var depth = -1;
	
	if (compareOrder === undefined || typeof compareOrder !== "boolean") compareOrder = false;
	
	return recurseEquals(check1, check2);
	
	function recurseEquals (ele1, ele2) {
		depth++;
		var result = true;
		if (depth > 1000) 							result = null;
		else {
			if (typeof ele1 != typeof ele2) 		result = false;
			else if (typeof ele1 === "undefined") 	result = true;
			else if (typeof ele1 === "symbol") 		result = true;
			else if (typeof ele1 === "boolean") 	result = (ele1 == ele2);
			else if (typeof ele1 === "string") 		result = (ele1 == ele2);
			else if (typeof ele1 === "number") {
				if (isNaN(ele1) || isNaN(ele2)) 	result = (isNaN(ele1) == isNaN(ele2));
				else 								result = (ele1 == ele2);
			}
			else if (!ele1 && !ele2) 				result = true;
			else if (!ele1 || !ele2) 				result = false;
			else if (typeof ele1 === "function" || typeof ele1 === "object") {
				var keys1 = Object.getOwnPropertyNames(ele1);
				var keys2 = Object.getOwnPropertyNames(ele2);
				if (keys1.length != keys2.length) 	result = false;
				else {
					for (var i = 0; result === true && i < keys1.length; i++) {
						if (compareOrder) 			result = recurseEquals(ele1[keys1[i]], ele2[keys2[i]]);
						else						result = recurseEquals(ele1[keys1[i]], ele2[keys1[i]]);
					}
				}
			}
		}
		depth--;
		return result;
	}
};

BDfunctionsDevilBro.onSwitchFix = function (plugin) {
	var switchFixObserver = new MutationObserver((changes) => {
		changes.forEach((change) => {
			if (change.addedNodes) {
				change.addedNodes.forEach((node) => {
					if (node && node.id === "friends") plugin.onSwitch(); 
					else if (node && node.className && node.className.length > 0 && node.className.indexOf("noTopic-3Rq-dz") != -1) plugin.onSwitch(); 
					else if (node && node.className && node.className.length > 0 && node.className.indexOf("topic-1KFf6J") != -1) plugin.onSwitch(); 
				});
			}
			if (change.removedNodes) {
				change.removedNodes.forEach((node) => {
					if (node && node.id === "friends") plugin.onSwitch(); 
				});
			}
		});
	});
	switchFixObserver.observe(document.querySelector(":-webkit-any(.chat, #friends)").parentNode, {childList: true});
	return switchFixObserver;
}

BDfunctionsDevilBro.getMyUserData = function () {
	if ($(".container-iksrDt").length > 0) {
		var userData = BDfunctionsDevilBro.getKeyInformation({"node":$(".container-iksrDt")[0],"key":"user"});
		return (userData ? userData : null);
	}
}

BDfunctionsDevilBro.getMyUserID = function () {
	var userData = BDfunctionsDevilBro.getMyUserData();
	return (userData && userData.id ? userData.id : null);
}
	
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
	
BDfunctionsDevilBro.readDmList = function () {
	var foundDMs = [];
	var dms = $(".dms .guild");
	for (var i = 0; i < dms.length; i++) {
		var dmData = BDfunctionsDevilBro.getKeyInformation({"node":dms[i], "key":"channel"});
		if (dmData) {
			foundDMs.push(dms[i]);
		}
	}
	return foundDMs;
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
	
BDfunctionsDevilBro.getSelectedServer = function () {
	var servers = BDfunctionsDevilBro.readServerList();
	for (var i = 0; i < servers.length; i++) {
		if ($(servers[i]).hasClass("selected")) {
			return servers[i];
		}
	}
	return null;
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

BDfunctionsDevilBro.getSettingsPanelDiv = function (ele) {
	return $(".bda-slist > li").has(ele)[0];
}

BDfunctionsDevilBro.themeIsLightTheme = function () {
	if ($(".theme-light").length > $(".theme-dark").length) {
		return true;
	}
	return false;
};

BDfunctionsDevilBro.showHideEle = function (show, ele) {
	if (show) {
		$(ele).show();
	}
	else {
		$(ele).hide();
	}
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

BDfunctionsDevilBro.saveData = function (id, data, pluginName, keyName) {
	var settings = bdPluginStorage.get(pluginName, keyName) ? bdPluginStorage.get(pluginName, keyName) : {};
	
	settings[id] = data;
	
	bdPluginStorage.set(pluginName, keyName, settings);
};

BDfunctionsDevilBro.saveAllData = function (data, pluginName, keyName) {
	var settings = data;
	
	bdPluginStorage.set(pluginName, keyName, settings);
};
	
BDfunctionsDevilBro.removeData = function (id, pluginName, keyName) {
	var settings = bdPluginStorage.get(pluginName, keyName) ? bdPluginStorage.get(pluginName, keyName) : {};
	
	delete settings[id];
	
	bdPluginStorage.set(pluginName, keyName, settings);
};
	
BDfunctionsDevilBro.removeAllData = function (pluginName, keyName) {
	var settings = {};
	
	bdPluginStorage.set(pluginName, keyName, settings);
};

BDfunctionsDevilBro.loadData = function (id, pluginName, keyName) {
	var settings = bdPluginStorage.get(pluginName, keyName) ? bdPluginStorage.get(pluginName, keyName) : {};
	
    try {
        var parse = JSON.parse(settings[id]);
		settings[id] = parse;
		bdPluginStorage.set(pluginName, keyName, settings);
    }
    catch (error) {
    }
	
	var data = settings[id];
	
	return (data === undefined ? null : data);
};

BDfunctionsDevilBro.loadAllData = function (pluginName, keyName) {
	var settings = bdPluginStorage.get(pluginName, keyName) ? bdPluginStorage.get(pluginName, keyName) : {};
	
	return settings;
};

BDfunctionsDevilBro.appendWebScript = function (filepath) {
	$('head script[src="' + filepath + '"]').remove();
	
	var ele = document.createElement('script');
	$(ele)
		.attr("src", filepath);
	$('head').append(ele);
};

BDfunctionsDevilBro.appendWebStyle = function (filepath) {
	$('head link[href="' + filepath + '"]').remove();

	var ele = document.createElement('link');
	$(ele)
		.attr("type", "text/css")
		.attr("rel", "Stylesheet")
		.attr("href", filepath);
	$('head').append(ele);
};

BDfunctionsDevilBro.appendLocalStyle = function (pluginName, css) {
	$('head style[id="' + pluginName + '"]').remove();

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

BDfunctionsDevilBro.color2COMP = function (color) {
	if (color) {
		switch (BDfunctionsDevilBro.checkColorType(color)) {
			case "comp":
				return color;
			case "rgb":
				return color.replace(new RegExp(" ", 'g'), "").slice(4, -1).split(",");
			case "hsl":
				var hsl = color.replace(new RegExp(" ", 'g'), "").slice(4, -1).split(",");
				var r, g, b, i, f, p, q, t;
				var h = hsl[0]/360, s = hsl[1], l = hsl[2];
				i = Math.floor(h * 6);
				f = h * 6 - i;
				p = l * (1 - s);
				q = l * (1 - f * s);
				t = l * (1 - (1 - f) * s);
				switch (i % 6) {
					case 0: r = l, g = t, b = p; break;
					case 1: r = q, g = l, b = p; break;
					case 2: r = p, g = l, b = t; break;
					case 3: r = p, g = q, b = l; break;
					case 4: r = t, g = p, b = l; break;
					case 5: r = l, g = p, b = q; break;
				}
				return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
			case "hex":
				var result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
				return [parseInt(result[1], 16).toString(),parseInt(result[2], 16).toString(),parseInt(result[3], 16).toString()];
			default:
				return null;
		}
	}
	return null;
};

BDfunctionsDevilBro.color2RGB = function (color) {
	if (color) {
		switch (BDfunctionsDevilBro.checkColorType(color)) {
			case "comp":
				return "rgb(" + (color[0]) + ", " + (color[1]) + ", " + (color[2]) + ")";
			case "rgb":
				return color;
			case "hsl":
				return BDfunctionsDevilBro.color2RGB(BDfunctionsDevilBro.color2COMP(color));
			case "hex":
				return BDfunctionsDevilBro.color2RGB(BDfunctionsDevilBro.color2COMP(color));
			default:
				return null;
		}
	}
	return null;
};

BDfunctionsDevilBro.color2HSL = function (color) {
	if (color) {
		switch (BDfunctionsDevilBro.checkColorType(color)) {
			case "comp":
				var r = parseInt(color[0]), g = parseInt(color[1]), b = parseInt(color[2]);
				var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, h, s = (max === 0 ? 0 : d / max), l = max / 255;
				switch (max) {
					case min: h = 0; break;
					case r: h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d; break;
					case g: h = (b - r) + d * 2; h /= 6 * d; break;
					case b: h = (r - g) + d * 4; h /= 6 * d; break;
				}
				return "hsl(" + Math.round(h*360) + ", " + s + ", " + l + ")";
			case "rgb":
				return BDfunctionsDevilBro.color2HSL(BDfunctionsDevilBro.color2COMP(color));
			case "hsl":
				return color;
			case "hex":
				return BDfunctionsDevilBro.color2HSL(BDfunctionsDevilBro.color2COMP(color));
			default:
				return null;
		}
	}
	return null;
};

BDfunctionsDevilBro.color2HEX = function (color) {
	if (color) {
		switch (BDfunctionsDevilBro.checkColorType(color)) {
			case "comp":
				return ("#" + (0x1000000 + ((color[2]) | ((color[1]) << 8) | ((color[0]) << 16))).toString(16).slice(1)).toUpperCase();
			case "rgb":
				return BDfunctionsDevilBro.color2HEX(BDfunctionsDevilBro.color2COMP(color));
			case "hsl":
				return BDfunctionsDevilBro.color2HEX(BDfunctionsDevilBro.color2COMP(color));
			case "hex":
				return color;
			default:
				return null;
		}
	}
	return null;
};

BDfunctionsDevilBro.colorCHANGE = function (color, value) {
	if (color) {
		var comp = BDfunctionsDevilBro.color2COMP(color);
		if (!comp || value === undefined || typeof value != "number") return null;
		comp = comp.map(Number);
		comp = [(comp[0]+value).toString(),(comp[1]+value).toString(),(comp[2]+value).toString()];
		switch (BDfunctionsDevilBro.checkColorType(color)) {
			case "comp":
				return comp;
			case "rgb":
				return BDfunctionsDevilBro.color2RGB(comp);
			case "hsl":
				return BDfunctionsDevilBro.color2HSL(comp);
			case "hex":
				return BDfunctionsDevilBro.color2HEX(comp);
			default:
				return null;
		}
	}
	return null;
};

BDfunctionsDevilBro.colorCOMPARE = function (color1, color2) {
	if (color1 && color2) {
		color1 = BDfunctionsDevilBro.color2RGB(color1);
		color2 = BDfunctionsDevilBro.color2RGB(color2);
		return BDfunctionsDevilBro.equals(color1,color2);
	}
	return null;
};

BDfunctionsDevilBro.colorINV = function (color, conv) {
	if (color) {
		if (conv === undefined) {
			switch (BDfunctionsDevilBro.checkColorType(color)) {
				case "comp":
					return [(255-color[0]), (255-color[1]), (255-color[2])];
				case "rgb":
					var temp = BDfunctionsDevilBro.color2COMP(color);
					temp = [(255-temp[0]), (255-temp[1]), (255-temp[2])];
					return BDfunctionsDevilBro.color2RGB(temp);
				case "hsl":
					var temp = BDfunctionsDevilBro.color2COMP(color);
					temp = [(255-temp[0]), (255-temp[1]), (255-temp[2])];
					return BDfunctionsDevilBro.color2HSL(temp);
				case "hex":
					var temp = BDfunctionsDevilBro.color2COMP(color);
					temp = [(255-temp[0]), (255-temp[1]), (255-temp[2])];
					return BDfunctionsDevilBro.color2HEX(temp);
				default:
					return null;
			}
		}
		else {
			switch (conv.toLowerCase()) {
				case "comp":
					return BDfunctionsDevilBro.colorINV(BDfunctionsDevilBro.color2COMP(color));
				case "rgb":
					return BDfunctionsDevilBro.colorINV(BDfunctionsDevilBro.color2RGB(color));
				case "hsl":
					return BDfunctionsDevilBro.colorINV(BDfunctionsDevilBro.color2HSL(color));
				case "hex":
					return BDfunctionsDevilBro.colorINV(BDfunctionsDevilBro.color2HEX(color));
				default:
					return null;
			}
		}
	}
	return null;
};

BDfunctionsDevilBro.checkColorType = function (color) {
	if (color) {
		if (typeof color === "object" && color.length == 3) {
			return "comp";
		}
		else if (typeof color === "string" && color.indexOf("rgb(") == 0) {
			return "rgb";
		}
		else if (typeof color === "string" && color.indexOf("hsl(") == 0) {
			return "hsl";
		}
		else if (typeof color === "string" && color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)) {
			return "hex";
		}
	}
	return null;
};
	
BDfunctionsDevilBro.encodeToHTML = function (string) {
	var ele = document.createElement("div");
	ele.innerText = string;
	return ele.innerHTML;
}

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

BDfunctionsDevilBro.setColorSwatches = function (currentCOMP, wrapper, swatch) {
	var wrapperDiv = $(wrapper);
		
	var colourList = 
		['rgb(26, 188, 156)','rgb(46, 204, 113)','rgb(52, 152, 219)','rgb(155, 89, 182)','rgb(233, 30, 99)','rgb(241, 196, 15)','rgb(230, 126, 34)','rgb(231, 76, 60)','rgb(149, 165, 166)','rgb(96, 125, 139)','rgb(99, 99, 99)',
		'rgb(254, 254, 254)','rgb(17, 128, 106)','rgb(31, 139, 76)','rgb(32, 102, 148)','rgb(113, 54, 138)','rgb(173, 20, 87)','rgb(194, 124, 14)','rgb(168, 67, 0)','rgb(153, 45, 34)','rgb(151, 156, 159)','rgb(84, 110, 122)','rgb(44, 44, 44)'];
		
	var swatches = 
		`<div class="ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap" style="flex: 1 1 auto; margin-top: 5px;"><div class="ui-color-picker-${swatch} large custom" style="background-color: rgb(0, 0, 0);"><svg class="color-picker-dropper-${swatch}" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16"><path class="color-picker-dropper-fg-${swatch}" fill="#ffffff" d="M14.994 1.006C13.858-.257 11.904-.3 10.72.89L8.637 2.975l-.696-.697-1.387 1.388 5.557 5.557 1.387-1.388-.697-.697 1.964-1.964c1.13-1.13 1.3-2.985.23-4.168zm-13.25 10.25c-.225.224-.408.48-.55.764L.02 14.37l1.39 1.39 2.35-1.174c.283-.14.54-.33.765-.55l4.808-4.808-2.776-2.776-4.813 4.803z"></path></svg></div><div class="regulars ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-wrap ui-color-picker-row" style="flex: 1 1 auto; display: flex; flex-wrap: wrap; overflow: visible !important;"><div class="ui-color-picker-${swatch} nocolor" style="background-color: null;"><svg clas="nocolor-cross" height="22" width="22"><path d="m 3 2 l 17 18 m 0 -18 l -17 18" stroke="red" stroke-width="3" fill="none" /></svg></div>${ colourList.map((val, i) => `<div class="ui-color-picker-${swatch}" style="background-color: ${val};"></div>`).join("")}</div></div>`;
	$(swatches).appendTo(wrapperDiv);
	
	if (currentCOMP) {
		var currentRGB = BDfunctionsDevilBro.color2RGB(currentCOMP);
		var invRGB = BDfunctionsDevilBro.colorINV(currentRGB);
		
		var selection = colourList.indexOf(currentRGB);
		
		if (selection > -1) {
			wrapperDiv.find(".regulars .ui-color-picker-" + swatch).eq(selection+1)
				.addClass("selected")
				.css("background-color", currentRGB)
				.css("border", "4px solid " + invRGB);
		} 
		else {
			$(".custom", wrapperDiv)
				.addClass("selected")
				.css("background-color", currentRGB)
				.css("border", "4px solid " + invRGB);
			
			$(".color-picker-dropper-fg", wrapperDiv)
				.attr("fill", currentCOMP[0] > 150 && currentCOMP[1] > 150 && currentCOMP[2] > 150 ? "#000000" : "#ffffff");
		}
	}
	else {
		$(".nocolor", wrapperDiv)
			.addClass("selected")
			.css("border", "4px solid black");
	}
	
	wrapperDiv.on("click", ".ui-color-picker-" + swatch + ":not(.custom)", (e) => {
		var bgColor = $(e.target).css("background-color");
		var newInvRGB = BDfunctionsDevilBro.checkColorType(bgColor) ? BDfunctionsDevilBro.colorINV(bgColor,"rgb") : "black";
		
		wrapperDiv.find(".ui-color-picker-" + swatch + ".selected.nocolor")
			.removeClass("selected")
			.css("border", "4px solid red");
			
		wrapperDiv.find(".ui-color-picker-" + swatch + ".selected")
			.removeClass("selected")
			.css("border", "4px solid transparent");
			
		$(e.currentTarget)
			.addClass("selected")
			.css("border", "4px solid " + newInvRGB);
	});
	
	wrapperDiv.on("click", ".ui-color-picker-" + swatch + ".custom", (e) => {
		BDfunctionsDevilBro.openColorPicker(e.target.style.backgroundColor, swatch);
	});
}

BDfunctionsDevilBro.openColorPicker = function (currentColor, swatch) {
	var colorPickerModalMarkup = 
		`<span class="colorpicker-modal">
			<div class="backdrop-2ohBEd callout-backdrop" style="background-color:#000; opacity:0.2"></div>
			<div class="modal" style="opacity: 1">
				<div class="modal-inner">
					<div class="colorpicker-container">
						<div class="colorpicker-color">
							<div class="colorpicker-white" style="background: linear-gradient(to right, #fff, rgba(255,255,255,0))">
								<div class="colorpicker-black" style="background: linear-gradient(to top, #000, rgba(0,0,0,0))">
									<div class="colorpicker-pickercursor">
										<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
										   <circle cx="7" cy="7" r="6" stroke="black" stroke-width="2" fill="none" />
										</svg>
									</div>
									<div class="colorpicker-pickerpane"></div>
								</div>
							</div>
						</div>
						<div class="colorpicker-slider" style="background: linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)">
								<div class="colorpicker-slidercursor">
									<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
										<path stroke="grey" fill="white" d="M 0 0, l 5 5, l -5 5, m 29 0, l -5 -5, l 5 -5"></path>
									</svg>
								</div>
								<div class="colorpicker-sliderpane"></div>
						</div>
						<div class="colorpicker-previewcontainer">
							<div class="colorpicker-preview-0 selected" style="background-color:#808080;"></div>
							<div class="colorpicker-preview-2" style="background-color:#808080;"></div>
						</div>
						<div class="colorpicker-inputs">
							<div class="colorpicker-input"><label>Hex:</label><input class="colorpicker-hex" name="hex" value="#000000" maxlength="7"></div>
							<div class="colorpicker-input"><label>R:</label><input class="colorpicker-red" name="rgb" value="0" type="number" min="0" max="255"></div>
							<div class="colorpicker-input"><label>G:</label><input class="colorpicker-green" name="rgb" value="0" type="number" min="0" max="255"></div>
							<div class="colorpicker-input"><label>B:</label><input class="colorpicker-blue" name="rgb" value="0" type="number" min="0" max="255"></div>
							<div class="colorpicker-input"><label>H:</label><input class="colorpicker-hue" name="hsl" value="0" type="number" min="0" max="360"></div>
							<div class="colorpicker-input"><label>S:</label><input class="colorpicker-saturation" name="hsl" value="0" type="number" min="0" max="100"></div>
							<div class="colorpicker-input"><label>L:</label><input class="colorpicker-lightness" name="hsl" value="0" type="number" min="0" max="100"></div>
						</div>
					</div>
				</div>
			</div>
		</span>`;
		
	var colorPickerModal = $(colorPickerModalMarkup)[0];
	$(colorPickerModal).appendTo($(".platform-win > div").last())
		.on("click", ".callout-backdrop", (event) => {
			var newRGB = colorPickerModal.querySelector("[class^='colorpicker-preview-'].selected").style.backgroundColor;
			var newCOMP = BDfunctionsDevilBro.color2COMP(newRGB);
			var newInvRGB = BDfunctionsDevilBro.colorINV(newRGB);
			
			$(".ui-color-picker-" + swatch + ".selected.nocolor")
				.removeClass("selected")
				.css("border", "4px solid red");
				
			$(".ui-color-picker-" + swatch + ".selected")
				.removeClass("selected")
				.css("border", "4px solid transparent");
			
			$(".ui-color-picker-" + swatch + ".custom")
				.addClass("selected")
				.css("background-color", newRGB)
				.css("border", "4px solid " + newInvRGB);
				
			$(".color-picker-dropper-fg-" + swatch)
				.attr("fill", newCOMP[0] > 150 && newCOMP[1] > 150 && newCOMP[2] > 150 ? "#000000" : "#ffffff");
				
			$(colorPickerModal).remove();
		});
	
	var hex = 0, red = 0, green = 0, blue = 0, hue = 0, saturation = 0, lightness = 0;
	
	var ppane = colorPickerModal.querySelector(".colorpicker-pickerpane");
	var pcursor = colorPickerModal.querySelector(".colorpicker-pickercursor");
	
	var pX = 0;
	var pY = 0;
	var pHalfW = pcursor.offsetWidth/2;
	var pHalfH = pcursor.offsetHeight/2;
	var pMinX = $(ppane).offset().left;
	var pMaxX = pMinX + ppane.offsetWidth;
	var pMinY = $(ppane).offset().top;
	var pMaxY = pMinY + ppane.offsetHeight;
	
	var spane = colorPickerModal.querySelector(".colorpicker-sliderpane");
	var scursor = colorPickerModal.querySelector(".colorpicker-slidercursor");
	
	var sY = 0;
	var sHalfH = scursor.offsetHeight/2;
	var sMinY = $(spane).offset().top;
	var sMaxY = sMinY + spane.offsetHeight;
	
	[hue, saturation, lightness] = BDfunctionsDevilBro.color2HSL(currentColor).replace(new RegExp(" ", 'g'), "").slice(4, -1).split(",");
	saturation *= 100;
	lightness *= 100;
	updateAllValues();
	updateCursors();
	
	$(ppane)
		.off("mousedown")
		.on("mousedown", (event) => {
			switchPreviews(event.button);
			pX = event.clientX - pHalfW;
			pY = event.clientY - pHalfH;
			$(pcursor).offset({"left":pX,"top":pY});
			
			saturation = mapRange([pMinX - pHalfW, pMaxX - pHalfW], [0, 100], pX);
			lightness = mapRange([pMinY - pHalfH, pMaxY - pHalfH], [100, 0], pY);
			updateAllValues();
			
			$(document)
				.off("mouseup").off("mousemove")
				.on("mouseup", () => {
					$(document).off("mouseup").off("mousemove");
				})
				.on("mousemove", (event2) => {	
					pX = event2.clientX > pMaxX ? pMaxX - pHalfW : (event2.clientX < pMinX ? pMinX - pHalfW : event2.clientX - pHalfW);
					pY = event2.clientY > pMaxY ? pMaxY - pHalfH : (event2.clientY < pMinY ? pMinY - pHalfH : event2.clientY - pHalfH);
					$(pcursor).offset({"left":pX,"top":pY});
					
					saturation = mapRange([pMinX - pHalfW, pMaxX - pHalfW], [0, 100], pX);
					lightness = mapRange([pMinY - pHalfH, pMaxY - pHalfH], [100, 0], pY);
					updateAllValues();
				});
		});
	
	$(spane)
		.off("mousedown")
		.on("mousedown", (event) => {
			switchPreviews(event.button);
			sY = event.clientY - sHalfH;
			$(scursor).offset({"top":sY});
			
			hue = mapRange([sMinY - sHalfH, sMaxY - sHalfH], [360, 0], sY);
			updateAllValues();
			
			$(document)
				.off("mouseup").off("mousemove")
				.on("mouseup", () => {
					$(document).off("mouseup").off("mousemove");
				})
				.on("mousemove", (event2) => {
					sY = event2.clientY > sMaxY ? sMaxY - sHalfH : (event2.clientY < sMinY ? sMinY - sHalfH : event2.clientY - sHalfH);
					$(scursor).offset({"top":sY});
					
					hue = mapRange([sMinY - sHalfH, sMaxY - sHalfH], [360, 0], sY);
					updateAllValues();
				});
		});
		
	$(".colorpicker-modal .colorpicker-inputs input")
		.off("input")
		.on("input", (event) => {
			updateValues(event.target.name);
		});
		
	$(".colorpicker-modal [class^='colorpicker-preview-']")
		.off("click")
		.on("click", (event) => {
			colorPickerModal.querySelector("[class^='colorpicker-preview-'].selected").style.borderColor = "transparent";
			colorPickerModal.querySelector("[class^='colorpicker-preview-'].selected").classList.remove("selected");
			event.target.classList.add("selected");
			[hue, saturation, lightness] = BDfunctionsDevilBro.color2HSL(event.target.style.backgroundColor).replace(new RegExp(" ", 'g'), "").slice(4, -1).split(",");
			saturation *= 100;
			lightness *= 100;
			updateAllValues();
			updateCursors();
		});
		
	function mapRange (from, to, number) {
		return to[0] + (number - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
	}
	
	function switchPreviews (button) {
		colorPickerModal.querySelector("[class^='colorpicker-preview-'].selected").style.borderColor = "transparent";
		colorPickerModal.querySelector("[class^='colorpicker-preview-'].selected").classList.remove("selected");
		colorPickerModal.querySelector(".colorpicker-preview-" + button).classList.add("selected");
	}
	
	function updateValues (type) {
		switch (type) {
			case "hex":
				hex = colorPickerModal.querySelector(".colorpicker-hex").value;
				if (/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(hex)) {
					[red, green, blue] = BDfunctionsDevilBro.color2COMP(hex);
					[hue, saturation, lightness] = BDfunctionsDevilBro.color2HSL(hex).replace(new RegExp(" ", 'g'), "").slice(4, -1).split(",");
					saturation *= 100;
					lightness *= 100;
					colorPickerModal.querySelector(".colorpicker-hue").value = Math.round(hue);
					colorPickerModal.querySelector(".colorpicker-saturation").value = Math.round(saturation);
					colorPickerModal.querySelector(".colorpicker-lightness").value = Math.round(lightness);
					colorPickerModal.querySelector(".colorpicker-red").value = red;
					colorPickerModal.querySelector(".colorpicker-green").value = green;
					colorPickerModal.querySelector(".colorpicker-blue").value = blue;
				}
				break;
			case "rgb":
				red = colorPickerModal.querySelector(".colorpicker-red").value;
				green = colorPickerModal.querySelector(".colorpicker-green").value;
				blue = colorPickerModal.querySelector(".colorpicker-blue").value;
				[hue, saturation, lightness] = BDfunctionsDevilBro.color2HSL([red, green, blue]).replace(new RegExp(" ", 'g'), "").slice(4, -1).split(",");
				saturation *= 100;
				lightness *= 100;
				colorPickerModal.querySelector(".colorpicker-hex").value = BDfunctionsDevilBro.color2HEX([red, green, blue]);
				colorPickerModal.querySelector(".colorpicker-hue").value = Math.round(hue);
				colorPickerModal.querySelector(".colorpicker-saturation").value = Math.round(saturation);
				colorPickerModal.querySelector(".colorpicker-lightness").value = Math.round(lightness);
				break;
			case "hsl":
				hue = colorPickerModal.querySelector(".colorpicker-hue").value;
				saturation = colorPickerModal.querySelector(".colorpicker-saturation").value;
				lightness = colorPickerModal.querySelector(".colorpicker-lightness").value;
				[red, green, blue] = BDfunctionsDevilBro.color2COMP("hsl(" + hue + ", " + saturation/100 + ", " + lightness/100 + ")");
				colorPickerModal.querySelector(".colorpicker-hex").value = BDfunctionsDevilBro.color2HEX([red, green, blue]);
				colorPickerModal.querySelector(".colorpicker-red").value = red;
				colorPickerModal.querySelector(".colorpicker-green").value = green;
				colorPickerModal.querySelector(".colorpicker-blue").value = blue;
				break; 
		}
		updateColors();
		updateCursors();
	}
	
	function updateCursors () {
		sY = mapRange([360, 0], [sMinY - sHalfH, sMaxY - sHalfH], hue);
		pX = mapRange([0, 100], [pMinX - pHalfW, pMaxX - pHalfW], saturation);
		pY = mapRange([100, 0], [pMinY - pHalfH, pMaxY - pHalfH], lightness);
		$(scursor).offset({"top":sY});
		$(pcursor).offset({"left":pX,"top":pY});
		$(pcursor).find("circle").attr("stroke", BDfunctionsDevilBro.colorINV([red, green, blue], "rgb"));
		$(scursor).find("path").attr("stroke", BDfunctionsDevilBro.color2RGB("hsl(" + hue + ", 1, 1)"));
	}
	
	function updateAllValues () {
		[red, green, blue] = BDfunctionsDevilBro.color2COMP("hsl(" + hue + ", " + saturation/100 + ", " + lightness/100 + ")");
		colorPickerModal.querySelector(".colorpicker-hex").value = BDfunctionsDevilBro.color2HEX([red, green, blue]);
		colorPickerModal.querySelector(".colorpicker-hue").value = Math.round(hue);
		colorPickerModal.querySelector(".colorpicker-saturation").value = Math.round(saturation);
		colorPickerModal.querySelector(".colorpicker-lightness").value = Math.round(lightness);
		colorPickerModal.querySelector(".colorpicker-red").value = Math.round(red);
		colorPickerModal.querySelector(".colorpicker-green").value = Math.round(green);
		colorPickerModal.querySelector(".colorpicker-blue").value = Math.round(blue);
		
		updateColors();
		
		$(pcursor).find("circle").attr("stroke", BDfunctionsDevilBro.colorINV([red, green, blue], "rgb"));
		$(scursor).find("path").attr("stroke", BDfunctionsDevilBro.color2RGB("hsl(" + hue + ", 1, 1)"));
	}
	
	function updateColors () {
		colorPickerModal.querySelector(".colorpicker-color").style.background = BDfunctionsDevilBro.color2RGB("hsl(" + hue + ", 1, 1)");
		colorPickerModal.querySelector("[class^='colorpicker-preview-'].selected").style.background = BDfunctionsDevilBro.color2RGB([red, green, blue]);
		colorPickerModal.querySelector("[class^='colorpicker-preview-'].selected").style.borderColor = BDfunctionsDevilBro.colorINV([red, green, blue], "rgb");
	}
}

BDfunctionsDevilBro.getSwatchColor = function (swatch) {
	return !$(".ui-color-picker-" + swatch + ".nocolor.selected")[0] ? BDfunctionsDevilBro.color2COMP($(".ui-color-picker-" + swatch + ".selected").css("background-color")) : null;
}

BDfunctionsDevilBro.getDiscordLanguage = function () {
	var lang = $("html").attr("lang") ? $("html").attr("lang").split("-")[0] : "en";
	switch (lang) {
		case "da": 		//danish
			return {"id":"da","lang":"danish"};
		case "de": 		//german
			return {"id":"de","lang":"german"};
		case "es": 		//spanish
			return {"id":"es","lang":"spanish"};
		case "fr": 		//french
			return {"id":"fr","lang":"french"};
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

BDfunctionsDevilBro.appendLocalStyle("BDfunctionsDevilBroCSS", `
	.modal-color-picker [class^="swatches"] {
		width: 430px;
		margin: auto;
	}

	.modal-color-picker [class^="ui-color-picker-swatch"] {
		width: 22px;
		height: 22px;
		margin-bottom: 5px;
		margin-top: 5px;
		border: 4px solid transparent;
		border-radius: 12px;
	}

	.modal-color-picker [class^="ui-color-picker-swatch"].large {
		min-width: 62px;
		height: 62px;
		border-radius: 25px;
	}

	.modal-color-picker [class^="ui-color-picker-swatch"].nocolor {
		border: 4px solid red;
	}
	
	.modal-color-picker [class^="color-picker-dropper"] {
		position: relative;
		left: 40px;
		top: 10px;
	}
	
	.colorpicker-modal .modal {
		align-content: space-around;
		align-items: center;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: initial;
		max-height: initial;
		opacity: 0;
		pointer-events: none;
		user-select: none;
		height: 100%;
		width: 100%;
		margin: 0;
		padding: 0;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 1000;
	}

	.colorpicker-modal .modal-inner {
		background-color: #36393E;
		border-radius: 5px;
		box-shadow: 0 0 0 1px rgba(32,34,37,.6),0 2px 10px 0 rgba(0,0,0,.2);
		display: flex;
		min-height: 200px;
		pointer-events: auto;
		width: 480px;
		padding: 15px;
	}
	
	.colorpicker-modal .colorpicker-container {
		padding: 15px;
		overflow: hidden;
		background-color: #484B51;
		border-radius: 5px;
	}
	
	.colorpicker-modal .colorpicker-pickerpane, 
	.colorpicker-modal .colorpicker-black, 
	.colorpicker-modal .colorpicker-white, 
	.colorpicker-modal .colorpicker-color {
		position: relative;
		top: 0px;
		left: 0px;
		height: 256px;
		width: 256px;
	}
	
	.colorpicker-modal .colorpicker-color {
		background-color: #808080;
		border: 3px solid #36393E;
		border-radius: 3px;
		float: left;
		margin-right: 20px;
	}
	
	.colorpicker-modal .colorpicker-pickercursor {
		position: absolute;
		height: 14px;
		width: 14px;
		top: -7px;
		left: -7px;
	}
	
	.colorpicker-modal .colorpicker-pickercursor svg {
		position: relative;
		height: 14px;
		width: 14px;
	}
	
	.colorpicker-modal .colorpicker-sliderpane, 
	.colorpicker-modal .colorpicker-slider {
		position: relative;
		top: 0px;
		left: 0px;
		height: 256px;
		width: 20px;
	}
	.colorpicker-modal .colorpicker-slider {
		border: 3px solid #36393E;
		border-radius: 3px;
		float: left;
		margin-right: 20px;
	}
	
	.colorpicker-modal .colorpicker-slidercursor {
		position: absolute;
		top: -4px;
		left: -5px;
		height: 12px;
		width: 32px;
	}
	.colorpicker-modal .colorpicker-slidercursor svg {
		position: relative;
		height: 12px;
		width: 32px;
	}
	
	.colorpicker-modal .colorpicker-previewcontainer {
		float: left;
		margin: 7px 0 15px 0;
		overflow: hidden;
	}
		
	.colorpicker-modal [class^='colorpicker-preview-'] {
		background-color: #808080;
		border: 3px solid transparent;
		height: 54px;
		width: 58px;
		float: left;
	}
	
	.colorpicker-modal .colorpicker-preview-0 {
		border-radius: 5px 0 0 5px;
		border-right: none;
	}
	
	.colorpicker-modal .colorpicker-preview-2 {
		border-radius: 0 5px 5px 0;
		border-left: none;
	}
	
	.colorpicker-modal .colorpicker-comparison {
		border: 3px solid #36393E;
		height: 60px;
		width: 58px;
		position: relative;
		left: 58px;
		background: red;
		border-radius: 0 5px 5px 0;
	}
	
	.colorpicker-modal .colorpicker-inputs {
		background-color: #7E8084;
		border-radius: 5px;
		width: 115px;
		float: left;
		padding: 3px;
	}
	
	.colorpicker-modal .colorpicker-inputs label {
		display: inline-block;
		width: 30px;
		color: #36393E;
		letter-spacing: .5px;
		text-transform: uppercase;
		text-align: right;
		flex: 1;
		cursor: default;
		font-weight: 600;
		line-height: 16px;
		font-size: 14px;
		position: relative;
		top: 1px;
	}
	
	.colorpicker-modal .colorpicker-inputs input {
		border: 3px solid #36393E;
		width: 65px;
		margin: 1px 0 1px 6px;
		padding: 0 2px 0 2px;
		line-height: 16px;
		color: #36393E;
		font-weight: 600;
		line-height: 16px;
		font-size: 13px;
	}`
);
