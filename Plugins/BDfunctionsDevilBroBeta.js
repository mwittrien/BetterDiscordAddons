var BDfunctionsDevilBro = {};

BDfunctionsDevilBro.creationTime = performance.now();

BDfunctionsDevilBro.isLibraryOutdated = () => {
	return performance.now() - BDfunctionsDevilBro.creationTime > 600000;
};

BDfunctionsDevilBro.loadMessage = (plugin, oldVersionRemove) => {
	var pluginName = typeof plugin == "object" ? plugin.getName() : plugin;
	var oldVersion = typeof plugin == "object" ? plugin.getVersion() : oldVersionRemove;
	var loadMessage = BDfunctionsDevilBro.getLibraryStrings().toast_plugin_started.replace("${pluginName}", pluginName).replace("${oldVersion}", oldVersion);
	console.log(loadMessage);
	BDfunctionsDevilBro.showToast(loadMessage);
	
	if (typeof plugin.onSwitch == "function") BDfunctionsDevilBro.addOnSwitchListener(plugin.onSwitch);
	
	var downloadUrl = "https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/" + pluginName + "/" + pluginName + ".plugin.js";
	BDfunctionsDevilBro.checkUpdate(pluginName, downloadUrl);
	
	if (typeof window.PluginUpdates !== "object" || !window.PluginUpdates) window.PluginUpdates = {plugins:{}};
	window.PluginUpdates.plugins[downloadUrl] = {name:pluginName, raw:downloadUrl, version:oldVersion};
	
	if (typeof window.PluginUpdates.interval === "undefined") {
		window.PluginUpdates.interval = setInterval(() => {
			BDfunctionsDevilBro.checkAllUpdates();
		},7200000);
	}
	
	if (typeof window.PluginUpdates.observer === "undefined" && document.querySelector(".layers")) {
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
													if (node2 && node2.tagName && !node2.querySelector(".bd-pfbtn.bd-updatebtn") && node2.querySelector(".bd-pfbtn") && node2.querySelector("h2") && node2.querySelector("h2").innerText.toLowerCase() === "plugins") {
														node2.querySelector(".bd-pfbtn").parentElement.insertBefore(BDfunctionsDevilBro.createUpdateButton(), node2.querySelector(".bd-pfbtn").nextSibling);
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
	
	var bdbutton = document.querySelector(".bd-pfbtn");
	if (bdbutton && bdbutton.parentElement.querySelector("h2") && bdbutton.parentElement.querySelector("h2").innerText.toLowerCase() === "plugins") {
		bdbutton.parentElement.insertBefore(BDfunctionsDevilBro.createUpdateButton(), bdbutton.nextSibling);
	}
};

BDfunctionsDevilBro.unloadMessage = (plugin, oldVersionRemove) => { 
	var pluginName = typeof plugin == "object" ? plugin.getName() : plugin;
	var oldVersion = typeof plugin == "object" ? plugin.getVersion() : oldVersionRemove;
	var unloadMessage = BDfunctionsDevilBro.getLibraryStrings().toast_plugin_stopped.replace("${pluginName}", pluginName).replace("${oldVersion}", oldVersion);
	console.log(unloadMessage);
	BDfunctionsDevilBro.showToast(unloadMessage);
	
	if (typeof plugin.onSwitch == "function") BDfunctionsDevilBro.removeOnSwitchListener(plugin.onSwitch);
	
	var downloadUrl = "https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/" + pluginName + "/" + pluginName + ".plugin.js";
	
	delete window.PluginUpdates.plugins[downloadUrl];
	
	if (BDfunctionsDevilBro.isObjectEmpty(window.PluginUpdates.plugins)) {
		window.PluginUpdates.observer.disconnect();
		delete window.PluginUpdates.observer;
		$("#bd-settingspane-container .bd-pfbtn.bd-updatebtn").remove();
	}
};


// plugin update notifications created in cooperation with Zerebos https://github.com/rauenzi/BetterDiscordAddons/blob/master/Plugins/PluginLibrary.js
BDfunctionsDevilBro.checkUpdate = (pluginName, downloadUrl) => {
	let request = require("request");
	request(downloadUrl, (error, response, result) => {
		if (error) return;
		var remoteVersion = result.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i);
		if (!remoteVersion) return;
		remoteVersion = remoteVersion.toString().replace(/['"]/g, "");
		var ver = remoteVersion.split(".");
		var lver = window.PluginUpdates.plugins[downloadUrl].version.split(".");
		var hasUpdate = false;
		if (ver[0] > lver[0]) hasUpdate = true;
		else if (ver[0] == lver[0] && ver[1] > lver[1]) hasUpdate = true;
		else if (ver[0] == lver[0] && ver[1] == lver[1] && ver[2] > lver[2]) hasUpdate = true;
		else hasUpdate = false;
		if (hasUpdate) BDfunctionsDevilBro.showUpdateNotice(pluginName, downloadUrl);
		else BDfunctionsDevilBro.removeUpdateNotice(pluginName);
	});
};

BDfunctionsDevilBro.showUpdateNotice = (pluginName, downloadUrl) => {
	let noticeElement = `<div class="notice notice-info DevilBro-notice" id="pluginNotice"><div class="notice-dismiss" id="pluginNoticeDismiss"></div><span class="notice-message">The following plugins have updates:</span>&nbsp;&nbsp;<strong id="outdatedPlugins"></strong></div>`;
	if (!$("#pluginNotice").length)  {
		$(".app .guilds-wrapper + div > div:first > div:first").append(noticeElement);
        $(".win-buttons").addClass("win-buttons-notice");
		$("#pluginNoticeDismiss").on("click", () => {
			$(".win-buttons").animate({top: 0}, 400, "swing", () => {
				$(".win-buttons").css("top","").removeClass("win-buttons-notice");
			});
			$("#pluginNotice").slideUp({complete: () => {
				$("#pluginNotice").remove();
			}});
		});
	}
	let pluginNoticeID = pluginName + "-notice";
	if (!$("#" + pluginNoticeID).length) {
		let pluginNoticeElement = $(`<span id="${pluginNoticeID}">`);
        pluginNoticeElement.text(pluginName);
        pluginNoticeElement.on("click", () => {
            BDfunctionsDevilBro.downloadPlugin(pluginName, downloadUrl);
        });
		if ($("#outdatedPlugins").children("span").length) $("#outdatedPlugins").append(`<span class="separator">, </span>`);
		$("#outdatedPlugins").append(pluginNoticeElement);
	}
};

BDfunctionsDevilBro.downloadPlugin = (pluginName, downloadUrl) => {
    let request = require("request");
    let fileSystem = require("fs");
    let path = require("path");
    request(downloadUrl, (error, response, body) => {
        if (error) return console.warn("Unable to get update for " + pluginName);
        let remoteVersion = body.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i);
        remoteVersion = remoteVersion.toString().replace(/['"]/g, "");
        let filename = downloadUrl.split("/");
        filename = filename[filename.length - 1];
        var file = path.join(BDfunctionsDevilBro.getPluginsFolder(), filename);
        fileSystem.writeFileSync(file, body);
        BDfunctionsDevilBro.showToast(`${pluginName} ${window.PluginUpdates.plugins[downloadUrl].version} has been replaced by ${pluginName} ${remoteVersion}`);
        if (!BDfunctionsDevilBro.isRestartNoMoreEnabled()) {
            if (!window.PluginUpdates.downloaded) {
                window.PluginUpdates.downloaded = [];
                let button = $(`<button class="btn btn-reload">Reload</button>`);
                button.on("click", (e) => {
                    e.preventDefault();
                    window.location.reload(false);
                });
                var tooltip = document.createElement("div");
                tooltip.className = "tooltip tooltip-bottom tooltip-black";
                tooltip.style.maxWidth = "400px";
                button.on("mouseenter", () => {
                    document.querySelector(".tooltips").appendChild(tooltip);
                    tooltip.innerText = window.PluginUpdates.downloaded.join(", ");
                    tooltip.style.left = button.offset().left + (button.outerWidth() / 2) - ($(tooltip).outerWidth() / 2) + "px";
                    tooltip.style.top = button.offset().top + button.outerHeight() + "px";
                });
    
                button.on("mouseleave", () => {
                    tooltip.remove();
                });
    
                button.appendTo($("#pluginNotice"));
            }
            window.PluginUpdates.plugins[downloadUrl].version = remoteVersion;
            window.PluginUpdates.downloaded.push(pluginName);
            BDfunctionsDevilBro.removeUpdateNotice(pluginName);
        }
    });
};

BDfunctionsDevilBro.removeUpdateNotice = (pluginName) => {
	let notice = $("#" + pluginName + "-notice");
	if (notice.length) {
		if (notice.next(".separator").length) notice.next().remove();
		else if (notice.prev(".separator").length) notice.prev().remove();
		notice.remove();
    }

	if (!$("#outdatedPlugins").children("span").length && !$("#pluginNotice .btn-reload").length) {
        $("#pluginNoticeDismiss").click();
    } 
    else if (!$("#outdatedPlugins").children("span").length && $("#pluginNotice .btn-reload").length) {
        $("#pluginNotice .notice-message").text("To finish updating you need to reload.");
    }
};

BDfunctionsDevilBro.showToast = (content, options = {}) => {
    if (!document.querySelector(".toasts")) {
        let toastWrapper = document.createElement("div");
        toastWrapper.classList.add("toasts");
        toastWrapper.style.setProperty("left", document.querySelector(".chat form, #friends, .noChannel-2EQ0a9, .activityFeed-HeiGwL").getBoundingClientRect().left + "px");
        toastWrapper.style.setProperty("width", document.querySelector(".chat form, #friends, .noChannel-2EQ0a9, .activityFeed-HeiGwL").offsetWidth + "px");
        toastWrapper.style.setProperty("bottom", (document.querySelector(".chat form") ? document.querySelector(".chat form").offsetHeight : 80) + "px");
        document.querySelector(".app").appendChild(toastWrapper);
    }
    const {type = "", icon = true, timeout = 3000} = options;
    let toastElem = document.createElement("div");
    toastElem.classList.add("toast");
	if (type) toastElem.classList.add("toast-" + type);
	if (type && icon) toastElem.classList.add("icon");
    toastElem.innerText = content;
    document.querySelector(".toasts").appendChild(toastElem);
    setTimeout(() => {
        toastElem.classList.add("closing");
        setTimeout(() => {
            toastElem.remove();
            if (!document.querySelectorAll(".toasts .toast").length) document.querySelector(".toasts").remove();
        }, 300);
    }, timeout);
};

BDfunctionsDevilBro.createTooltip = (content, container, options = {}) => {
	if (!document.querySelector(".tooltips") || !content || !container) return null;
	let id = Math.round(Math.random()*10000000000000000);
    let tooltip = document.createElement("div");
    tooltip.classList.add("tooltip", "tooltip-black", "DevilBro-tooltip");
	if (options.type) tooltip.classList.add("tooltip-" + options.type);
	if (options.selector) options.selector.split(" ").forEach(selector => {if(selector) tooltip.classList.add(selector);});
	if (options.css) BDfunctionsDevilBro.appendLocalStyle("customTooltipDevilBro" + id, options.css);
	if (options.html === true) tooltip.innerHTML = content;
	else tooltip.innerText = content;
    
	document.querySelector(".tooltips").appendChild(tooltip);
	
	var left, top;
	
	if (!options.position) options.position = options.type;
	switch (options.position) {
		case "top": 
			left = $(container).offset().left + ($(container).outerWidth() - $(tooltip).outerWidth())/2;
			top = $(container).offset().top - $(tooltip).outerHeight();
			break;
		case "bottom": 
			left = $(container).offset().left + ($(container).outerWidth() - $(tooltip).outerWidth())/2;
			top = $(container).offset().top + $(container).outerHeight();
			break;
		case "left": 
			left = $(container).offset().left - $(tooltip).outerWidth();
			top = $(container).offset().top + ($(container).outerHeight() - $(tooltip).outerHeight())/2;
			break;
		default: 
			left = $(container).offset().left + $(container).outerWidth();
			top = $(container).offset().top + ($(container).outerHeight() - $(tooltip).outerHeight())/2;
			break;
	}
	
	tooltip.style.setProperty("left", left + "px");
	tooltip.style.setProperty("top", top + "px");
	
	var tooltipObserver = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			var nodes = Array.from(mutation.removedNodes);
			var ownMatch = nodes.indexOf(tooltip) > -1;
			var directMatch = nodes.indexOf(container) > -1;
			var parentMatch = nodes.some(parent => parent.contains(container));
			if (ownMatch || directMatch || parentMatch) {
				tooltipObserver.disconnect();
				tooltip.remove();
				$(container).off("mouseleave.BDfunctionsDevilBroTooltip" + id);
				BDfunctionsDevilBro.removeLocalStyle("customTooltipDevilBro" + id);
			}
		});
	});
	tooltipObserver.observe(document.body, {subtree: true, childList: true});
	
	$(container).on("mouseleave.BDfunctionsDevilBroTooltip" + id, () => {
		tooltip.remove();
	});
	
	return tooltip;
};

BDfunctionsDevilBro.createNotificationsBar = (content, options = {}) => {
	if (!content) return;
	let id = Math.round(Math.random()*10000000000000000);
    let notifiybar = document.createElement("div");
    notifiybar.classList.add("notice", "DevilBro-notice", "notice-" + id);
	notifiybar.innerHTML = `<div class="notice-dismiss"></div><span class="notice-message">${content}</span></strong>`;
	$(".app .guilds-wrapper + div > div:first > div:first").append(notifiybar);
	if (options.btn) {
		$(`<button class="btn">${options.btn}</button>`).insertAfter(notifiybar.querySelector(".notice-message"));
	}
	if (options.selector) options.selector.split(" ").forEach(selector => {if(selector) notifiybar.classList.add(selector);});
	if (options.css) BDfunctionsDevilBro.appendLocalStyle("customNotificationsBarDevilBro" + id, options.css);
	var comp = BDfunctionsDevilBro.color2COMP(options.color);
	var color = comp && comp[0] > 180 && comp[1] > 180 && comp[2] > 180 ? "#000" : "#FFF";
	var bgColor = comp ? BDfunctionsDevilBro.color2HEX(comp) : "#F26522";
	var dismissFilter = comp && comp[0] > 180 && comp[1] > 180 && comp[2] > 180 ? "brightness(0%)" : "brightness(100%)";
	BDfunctionsDevilBro.appendLocalStyle("customNotificationsBarColorCorrectionDevilBro" + id, 
		`.DevilBro-notice.notice-${id} {
			background-color: ${bgColor};
		}
		.DevilBro-notice.notice-${id} .notice-message {
			color: ${color};
		}
		.DevilBro-notice.notice-${id} .btn {
			color: ${color};
			border-color: ${color};
		}
		.DevilBro-notice.notice-${id} .btn:hover {
			color: ${bgColor};
			background-color: ${color};
		}
		.DevilBro-notice.notice-${id} .notice-dismiss {
			filter: ${dismissFilter};
		}`);
	$(notifiybar).on("click", ".notice-dismiss", () => {
		$(notifiybar).slideUp({complete: () => {
			BDfunctionsDevilBro.removeLocalStyle("customNotificationsBarDevilBro" + id);
			BDfunctionsDevilBro.removeLocalStyle("customNotificationsBarColorCorrectionDevilBro" + id);
			notifiybar.remove();
		}});
	});
	
	return notifiybar;
};

// Plugins/Themes folder resolver from Square
BDfunctionsDevilBro.getPluginsFolder = () => {
    let process = require("process");
    let path = require("path");
    switch (process.platform) {
        case "win32":
        return path.resolve(process.env.appdata, "BetterDiscord/plugins/");
        case "darwin":
        return path.resolve(process.env.HOME, "Library/Preferences/", "BetterDiscord/plugins/");
        default:
        return path.resolve(process.env.HOME, ".config/", "BetterDiscord/plugins/");
    }
};

BDfunctionsDevilBro.getThemesFolder = () => {
    let process = require("process");
    let path = require("path");
    switch (process.platform) {
        case "win32":
        return path.resolve(process.env.appdata, "BetterDiscord/themes/");
        case "darwin":
        return path.resolve(process.env.HOME, "Library/Preferences/", "BetterDiscord/themes/");
        default:
        return path.resolve(process.env.HOME, ".config/", "BetterDiscord/themes/");
    }
};

BDfunctionsDevilBro.createUpdateButton = () => {
	var updateButton = document.createElement("button");
	updateButton.className = "bd-pfbtn bd-updatebtn";
	updateButton.innerText = "Check for Updates";
	updateButton.style.left = "220px";
	updateButton.onclick = () => {
		BDfunctionsDevilBro.checkAllUpdates();
	};			
	updateButton.onmouseenter = () => {
		BDfunctionsDevilBro.createTooltip("Only checks for updates of plugins, which support the updatecheck. Rightclick for a list.", updateButton, {type:"right",selector:"update-button-tooltip"});
		
	};
	updateButton.oncontextmenu = () => {
		if (window.PluginUpdates && window.PluginUpdates.plugins && !document.querySelector(".update-list-tooltip")) {
			var list = [];
			for (var plugin in window.PluginUpdates.plugins) {
				list.push(window.PluginUpdates.plugins[plugin].name);
			}
			BDfunctionsDevilBro.createTooltip(list.sort().join(", "), updateButton, {type:"bottom",selector:"update-list-tooltip"});
		}
	};
	return updateButton;
};

BDfunctionsDevilBro.checkAllUpdates = () => {
	for (let key in window.PluginUpdates.plugins) {
		let plugin = window.PluginUpdates.plugins[key];
		BDfunctionsDevilBro.checkUpdate(plugin.name, plugin.raw);
	}
};
	
BDfunctionsDevilBro.translateMessage = (pluginName) => { 
	console.log(BDfunctionsDevilBro.getLibraryStrings().toast_plugin_translated.replace("${pluginName}", pluginName).replace("${ownlang}", BDfunctionsDevilBro.getDiscordLanguage().ownlang));
};

BDfunctionsDevilBro.translatePlugin = (plugin) => {
	if (typeof plugin.labels === "object") {
		var translateInterval = setInterval(() => {
			if (document.querySelector("html").lang) {
				clearInterval(translateInterval);
				var language = BDfunctionsDevilBro.getDiscordLanguage();
				plugin.labels = plugin.setLabelsByLanguage(language.id);
				plugin.changeLanguageStrings();
				console.log(BDfunctionsDevilBro.getLibraryStrings().toast_plugin_translated.replace("${pluginName}", plugin.getName()).replace("${ownlang}", language.ownlang));
			}
		},100);
	}
};
	
BDfunctionsDevilBro.getReactInstance = (node) => { 
	if (!node) return null;
	return node[Object.keys(node).find((key) => key.startsWith("__reactInternalInstance"))];
};

BDfunctionsDevilBro.getOwnerInstance = (config) => { 
	if (config === undefined) return null;
	if (!config.node || !config.name) return null;
	var inst = BDfunctionsDevilBro.getReactInstance(config.node);
	if (!inst) return null;
	
	var depth = -1;
	var maxDepth = config.depth === undefined ? 15 : config.depth;
	
	var upwards = config.up === undefined ? false : config.up;
	
	var start = performance.now();
	var maxTime = config.time === undefined ? 150 : config.time;
		
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

BDfunctionsDevilBro.getKeyInformation = (config) => {
	if (config === undefined) return null;
	if (!config.node || !config.key) return null;
	
	var inst = BDfunctionsDevilBro.getReactInstance(config.node);
	if (!inst) return null;
	
	var depth = -1;
	var maxDepth = config.depth === undefined ? 15 : config.depth;
	
	var start = performance.now();
	var maxTime = config.time === undefined ? 30 : config.time;
		
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

BDfunctionsDevilBro.WebModules = {};
// code in this closure based on code by samogot and edited by myself
// https://github.com/samogot/betterdiscord-plugins/blob/master/v2/1Lib%20Discord%20Internals/plugin.js
BDfunctionsDevilBro.WebModules.find = (filter) => {
	const req = webpackJsonp([], {"__extra_id__": (module, exports, req) => exports.default = req}, ["__extra_id__"]).default;
	delete req.c["__extra_id__"];
	for (let i in req.c) { 
		if (req.c.hasOwnProperty(i)) {
			let m = req.c[i].exports;
			if (m && m.__esModule && m.default && filter(m.default)) return m.default;
			if (m && filter(m)) return m;
		}
	}
	return null;
};

BDfunctionsDevilBro.WebModules.findByProperties = (names) => {
	return BDfunctionsDevilBro.WebModules.find(module => names.every(prop => module[prop] !== undefined));
};

// OLD REMOVE AFTER A WHILE
BDfunctionsDevilBro.findInWebModulesByName = (names) => {
	return BDfunctionsDevilBro.WebModules.find(module => names.every(prop => module[prop] !== undefined));
};

BDfunctionsDevilBro.WebModules.addListener = (internalModule, moduleFunction, callback) => {
    const moduleName = internalModule.displayName || internalModule.name || internalModule.constructor.displayName || internalModule.constructor.name; // borrowed from Samogot
    if (!internalModule[moduleFunction] || typeof(internalModule[moduleFunction]) !== "function") return console.error(`Module ${moduleName} has no function ${moduleFunction}`);
    if (!internalModule.__internalListeners) internalModule.__internalListeners = {};
    if (!internalModule.__internalListeners[moduleFunction]) internalModule.__internalListeners[moduleFunction] = new Set();
	
    internalModule.__internalListeners[moduleFunction].add(callback);
	
    if (!internalModule.__listenerPatches) internalModule.__listenerPatches = {};
    if (!internalModule.__listenerPatches[moduleFunction]) {
        if (internalModule[moduleFunction].__monkeyPatched) console.warn(`Function ${moduleFunction} of module ${moduleName} has already been patched by someone else.`);
        internalModule.__listenerPatches[moduleFunction] = BDfunctionsDevilBro.WebModules.monkeyPatch(internalModule, moduleFunction, {after: (data) => {
            for (let listener of internalModule.__internalListeners[moduleFunction]) listener();
        }});
    }
};

BDfunctionsDevilBro.WebModules.removeListener = (internalModule, moduleFunction, callback) => {
    const moduleName = internalModule.displayName || internalModule.name || internalModule.constructor.displayName || internalModule.constructor.name; // borrowed from Samogot
    if (!internalModule[moduleFunction] || typeof(internalModule[moduleFunction]) !== "function") return console.error(`Module ${moduleName} has no function ${moduleFunction}`);
    if (!internalModule.__internalListeners || !internalModule.__internalListeners[moduleFunction] || !internalModule.__internalListeners[moduleFunction].size) return;
    
    internalModule.__internalListeners[moduleFunction].delete(callback);
    
    if (!internalModule.__internalListeners[moduleFunction].size) {
        internalModule.__listenerPatches[moduleFunction]();
        delete internalModule.__listenerPatches[moduleFunction];
    }
};

BDfunctionsDevilBro.WebModules.monkeyPatch = (internalModule, moduleFunction, {before, after, instead, once = false, silent = false} = options) => {
	const origMethod = internalModule[moduleFunction];
	const cancel = () => {
		internalModule[moduleFunction] = origMethod;
	};
	const suppressErrors = (method, desiption) => (...params) => {
		try {
			return method(...params);
		}
		catch (e) {
			console.error('Error occurred in ' + desiption, e)
		}
	};
	internalModule[moduleFunction] = function() {
		const data = {
			thisObject: this,
			methodArguments: arguments,
			cancelPatch: cancel,
			originalMethod: origMethod,
			callOriginalMethod: () => data.returnValue = data.originalMethod.apply(data.thisObject, data.methodArguments)
		};
		if (instead) {
			const tempRet = suppressErrors(instead, '`instead` callback of ' + internalModule[moduleFunction].displayName)(data);
			if (tempRet !== undefined)
				data.returnValue = tempRet;
		}
		else {
			if (before) suppressErrors(before, '`before` callback of ' + internalModule[moduleFunction].displayName)(data);
			data.callOriginalMethod();
			if (after) suppressErrors(after, '`after` callback of ' + internalModule[moduleFunction].displayName)(data);
		}
		if (once) cancel();
		return data.returnValue;
	};
	internalModule[moduleFunction].__monkeyPatched = true;
	internalModule[moduleFunction].displayName = 'patched ' + (internalModule[moduleFunction].displayName || moduleFunction);
	return cancel;
};

BDfunctionsDevilBro.addOnSwitchListener = (callback) => {
    SelectedChannelStore = BDfunctionsDevilBro.WebModules.findByProperties(["getLastSelectedChannelId"]);
    BDfunctionsDevilBro.WebModules.addListener(SelectedChannelStore._actionHandlers, "CHANNEL_SELECT", callback);
    GuildActions = BDfunctionsDevilBro.WebModules.findByProperties(["markGuildAsRead"]);
    BDfunctionsDevilBro.WebModules.addListener(GuildActions, "nsfwAgree", callback);
};

BDfunctionsDevilBro.removeOnSwitchListener = (callback) => {
    SelectedChannelStore = BDfunctionsDevilBro.WebModules.findByProperties(["getLastSelectedChannelId"]);
    BDfunctionsDevilBro.WebModules.removeListener(SelectedChannelStore._actionHandlers, "CHANNEL_SELECT", callback);
    GuildActions = BDfunctionsDevilBro.WebModules.findByProperties(["markGuildAsRead"]);
    BDfunctionsDevilBro.WebModules.removeListener(GuildActions, "nsfwAgree", callback);
};

BDfunctionsDevilBro.getLanguageTable = (lang) => {
	var ti = {
		bg: "холандски", //bulgarian
		cs: "Nizozemština", //czech
		da: "Hollandsk", //danish
		de: "Niederländisch", //german
		en: "Dutch", //english
		es: "Holandés", //spanish
		fi: "hollanti", //finnish
		fr: "Néerlandais", //french
		it: "Olandese", //italian
		ja: "オランダ語", //japanese
		ko: "네덜란드어", //korean
		nl: "Nederlands", //dutch
		no: "Nederlandsk", //norwegian
		pl: "Holenderski", //polish
		pt: "Holandês", //portuguese (brazil)
		ru: "Голландский", //russian
		sv: "Holländska", //swedish
		tr: "Flemenkçe", //turkish
		uk: "Нідерландська", //ukranian
		zh: "荷蘭文" //chinese (traditional)
    };
	lang = lang ? lang : BDfunctionsDevilBro.getDiscordLanguage().id;
	return BDfunctionsDevilBro.WebModules.find((m) => {
		return m.nl === ti[lang];
	});
};

BDfunctionsDevilBro.equals = (check1, check2, compareOrder) => {
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

BDfunctionsDevilBro.isObjectEmpty = (obj) => {
	var empty = true;
	for (var key in obj) {
		empty = false;
		break;
	}
	return empty;
};

BDfunctionsDevilBro.removeFromArray = (array, value) => {
	if (!array || !value || !Array.isArray(array) || !array.includes(value)) return;
	array.splice(array.indexOf(value), 1);
};

BDfunctionsDevilBro.onSwitchFix = (plugin) => {
	return new MutationObserver(() => {});
};

BDfunctionsDevilBro.getMyUserData = () => {
	var UserActions = BDfunctionsDevilBro.WebModules.findByProperties(["getCurrentUser"]);
	return UserActions ? UserActions.getCurrentUser() : null;
};

BDfunctionsDevilBro.getMyUserID = () => {
	var userData = BDfunctionsDevilBro.getMyUserData();
	return (userData && userData.id ? userData.id : null);
};

BDfunctionsDevilBro.getMyUserStatus = () => {
	var userStatus = "invisible";
	var status = document.querySelector(".container-iksrDt .status");
	if (status) userStatus = status.classList[1].split("-")[1];
	return userStatus;
};
	
BDfunctionsDevilBro.readServerList = () => {
	var foundServers = [];
	var servers = $(".guild");
	for (var i = 0; i < servers.length; i++) {
		if (BDfunctionsDevilBro.getKeyInformation({"node":servers[i], "key":"guild"})) foundServers.push(servers[i]);
	}
	return foundServers;
};
	
BDfunctionsDevilBro.readUnreadServerList = (servers) => {
	if (servers === undefined) servers = BDfunctionsDevilBro.readServerList();
	var foundServers = [];
	for (var i = 0; i < servers.length; i++) {
		if (BDfunctionsDevilBro.getKeyInformation({"node":servers[i], "key":"guild"})) {
			if (servers[i].classList.contains("unread") || servers[i].querySelector(".badge")) foundServers.push(servers[i]);
		}
	}
	return foundServers;
};
	
BDfunctionsDevilBro.readDmList = () => {
	var foundDMs = [];
	var dms = $(".dms .guild");
	for (var i = 0; i < dms.length; i++) {
		if (BDfunctionsDevilBro.getKeyInformation({"node":dms[i], "key":"channel"})) foundDMs.push(dms[i]);
	}
	return foundDMs;
};
	
BDfunctionsDevilBro.readChannelList = () => {
	var foundChannels = [];
	var channels = $(".containerDefault-7RImuF, .containerDefault-1bbItS");
	for (var i = 0; i < channels.length; i++) {
		if (BDfunctionsDevilBro.getKeyInformation({"node":channels[i], "key":"channel"})) foundChannels.push(channels[i]);
	}
	return foundChannels;
};
	
BDfunctionsDevilBro.getSelectedServer = () => {
	var servers = BDfunctionsDevilBro.readServerList();
	for (var i = 0; i < servers.length; i++) {
		if (servers[i].classList.contains("selected")) {
			return servers[i];
		}
	}
	return null;
};
	
BDfunctionsDevilBro.getDivOfServer = (id) => {
	var servers = BDfunctionsDevilBro.readServerList();
	for (var i = 0; i < servers.length; i++) {
		if (BDfunctionsDevilBro.getIdOfServer(servers[i]) == id) {
			return servers[i];
		}
	}
	return null;
};
	
BDfunctionsDevilBro.getIdOfServer = (server) => {
	var serverData = BDfunctionsDevilBro.getKeyInformation({"node":server, "key":"guild"});
	if (serverData) {
		return serverData.id;
	}
	return null;
};
	
BDfunctionsDevilBro.getDivOfChannel = (channelID) => {
	var channels = BDfunctionsDevilBro.readChannelList();
	for (var i = 0; i < channels.length; i++) {
		var channelData = BDfunctionsDevilBro.getKeyInformation({"node":channels[i], "key":"channel"});
		if (channelData) {
			if (channelID == channelData.id) {
				return channels[i];
			}
		}
	}
	return null;
};

BDfunctionsDevilBro.getSettingsPanelDiv = (ele) => {
	return $(".bda-slist > li").has(ele)[0];
};

BDfunctionsDevilBro.themeIsLightTheme = () => {
	if ($(".theme-light").length > $(".theme-dark").length) {
		return true;
	}
	return false;
};

BDfunctionsDevilBro.saveAllData = (settings, pluginName, keyName) => {
	bdPluginStorage.set(pluginName, keyName, settings);
};

BDfunctionsDevilBro.loadAllData = (pluginName, keyName) => {
	return bdPluginStorage.get(pluginName, keyName) ? bdPluginStorage.get(pluginName, keyName) : {};
};

BDfunctionsDevilBro.removeAllData = (pluginName, keyName) => {
	BDfunctionsDevilBro.saveAllData({}, pluginName, keyName);
};

BDfunctionsDevilBro.saveData = (id, data, pluginName, keyName) => {
	var settings = BDfunctionsDevilBro.loadAllData(pluginName, keyName);
	
	settings[id] = data;
	
	BDfunctionsDevilBro.saveAllData(settings, pluginName, keyName);
};

BDfunctionsDevilBro.loadData = (id, pluginName, keyName) => {
	var settings = BDfunctionsDevilBro.loadAllData(pluginName, keyName);
	
	var data = settings[id];
	
	return data === undefined ? null : data;
};
	
BDfunctionsDevilBro.removeData = (id, pluginName, keyName) => {
	var settings = BDfunctionsDevilBro.loadAllData(pluginName, keyName);
	
	delete settings[id];
	
	BDfunctionsDevilBro.saveAllData(settings, pluginName, keyName);
};

BDfunctionsDevilBro.appendWebScript = (filepath) => {
	$('head script[src="' + filepath + '"]').remove();
	
	var ele = document.createElement("script");
	$(ele)
		.attr("src", filepath);
	$("head").append(ele);
};

BDfunctionsDevilBro.appendWebStyle = (filepath) => {
	$('head link[href="' + filepath + '"]').remove();

	var ele = document.createElement("link");
	$(ele)
		.attr("type", "text/css")
		.attr("rel", "Stylesheet")
		.attr("href", filepath);
	$("head").append(ele);
};

BDfunctionsDevilBro.appendLocalStyle = (pluginName, css) => {
	$('head style[id="' + pluginName + 'CSS"]').remove();

	var ele = document.createElement("style");
	$(ele)
		.attr("id", pluginName + "CSS")
		.text(css);
	$("head").append(ele);
};

BDfunctionsDevilBro.removeLocalStyle = (pluginName) => {
	$('head style[id="' + pluginName + 'CSS"]').remove();
};

BDfunctionsDevilBro.sortArrayByKey = (array, key, except) => {
	if (except === undefined) except = null;
	return array.sort((a, b) => {
		var x = a[key]; var y = b[key];
		if (x != except) {
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		}
	});
};

BDfunctionsDevilBro.getAllIndexes = (array, val) => {
    var indexes = [], i = -1;
    while ((i = array.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
};

BDfunctionsDevilBro.color2COMP = (color) => {
	if (color) {
		switch (BDfunctionsDevilBro.checkColorType(color)) {
			case "comp":
				return color;
			case "rgb":
				return color.replace(new RegExp(" ", "g"), "").slice(4, -1).split(",");
			case "hsl":
				var hsl = color.replace(new RegExp(" ", "g"), "").slice(4, -1).split(",");
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

BDfunctionsDevilBro.color2RGB = (color) => {
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

BDfunctionsDevilBro.color2HSL = (color) => {
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

BDfunctionsDevilBro.color2HEX = (color) => {
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

BDfunctionsDevilBro.colorCHANGE = (color, value) => {
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

BDfunctionsDevilBro.colorCOMPARE = (color1, color2) => {
	if (color1 && color2) {
		color1 = BDfunctionsDevilBro.color2RGB(color1);
		color2 = BDfunctionsDevilBro.color2RGB(color2);
		return BDfunctionsDevilBro.equals(color1,color2);
	}
	return null;
};

BDfunctionsDevilBro.colorINV = (color, conv) => {
	if (color) {
		var type = BDfunctionsDevilBro.checkColorType(color);
		if (type) {
			if (conv === undefined) {
				var inv = BDfunctionsDevilBro.color2COMP(color);
				inv = [(255-inv[0]), (255-inv[1]), (255-inv[2])];
				switch (BDfunctionsDevilBro.checkColorType(color)) {
					case "comp":
						return inv;
					case "rgb":
						return BDfunctionsDevilBro.color2RGB(inv);
					case "hsl":
						return BDfunctionsDevilBro.color2HSL(inv);
					case "hex":
						return BDfunctionsDevilBro.color2HEX(inv);
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
	}
	return null;
};

BDfunctionsDevilBro.checkColorType = (color) => {
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

BDfunctionsDevilBro.setInnerText = (div, text) => {
	if (!div) return;
	var textNode = $(div).contents().filter(() => {return this.nodeType == Node.TEXT_NODE;})[0];
	if (textNode) textNode.textContent = text;
}
	
BDfunctionsDevilBro.getInnerText = (div) => {
	if (!div) return;
	var textNode = $(div).contents().filter(() => {return this.nodeType == Node.TEXT_NODE;})[0];
	return textNode ? textNode.textContent : undefined;
}
	
BDfunctionsDevilBro.encodeToHTML = (string) => {
	var ele = document.createElement("div");
	ele.innerText = string;
	return ele.innerHTML;
};

BDfunctionsDevilBro.regEscape = (string) => {
	return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
};

BDfunctionsDevilBro.clearReadNotifications = (servers) => {
	var GuildActions = BDfunctionsDevilBro.WebModules.findByProperties(['markGuildAsRead']);
	if (!servers || !GuildActions) return;
	servers = Array.isArray(servers) ? servers : Array.from(servers);
	servers.forEach((server, i) => {
		var serverData = BDfunctionsDevilBro.getKeyInformation({"node":server, "key":"guild"});
		if (serverData) GuildActions.markGuildAsRead(serverData.id);
	}); 
};

BDfunctionsDevilBro.appendModal = (modal) => {
	let id = Math.round(Math.random()*10000000000000000);
	$(modal)
		.appendTo(".app ~ [class^='theme-']")
		.on("click", ".checkbox-1KYsPm", (e) => {
			$(e.target.parentElement)
				.toggleClass("valueChecked-3Bzkbm", $(e.target).prop("checked"))
				.toggleClass("valueUnchecked-XR6AOk", $(e.target).prop("checked"));
		})
		.on("click", ".tab, .tab-bar-item", (e) => {
			$(".tab-content.open", modal)
				.removeClass("open");
				
			$(".tab.selected, .tab-bar-item.selected", modal)
				.removeClass("selected");
				
			$(".tab-content." + $(e.currentTarget).attr("value") + ", .tab-content[tab='" + $(e.currentTarget).attr("tab") + "']", modal)
				.addClass("open");
				
			$(e.currentTarget)
				.addClass("selected");
		})
		.on("click", ".backdrop-2ohBEd, .btn-cancel, .btn-save", () => {
			$(document).off("keydown.modalEscapeListenerDevilBro" + id);
			$(modal).addClass("closing");
			setTimeout(() => {modal.remove();}, 300);
		});
		
	$(modal).find(".modalTabButton").addClass("tab");
	$(modal).find(".tab, .tab-bar-item").first().addClass("selected");
	$(modal).find(".modalTab").addClass("tab-content");
	$(modal).find(".tab-content").first().addClass("open");
	$(modal)
		.find(".checkbox-1KYsPm").each((_, checkBox) => {
			$(checkBox.parentElement)
				.toggleClass("valueChecked-3Bzkbm", $(checkBox).prop("checked"))
				.toggleClass("valueUnchecked-XR6AOk", $(checkBox).prop("checked"));
		});
		
	$(document)
		.off("keydown.modalEscapeListenerDevilBro" + id)
		.on("keydown.modalEscapeListenerDevilBro" + id, (e) => {
			if (e.which == 27) $(modal).find(".backdrop-2ohBEd").click();
		});
};

BDfunctionsDevilBro.setColorSwatches = (currentCOMP, wrapper, swatch) => {
	var wrapperDiv = $(wrapper);
		
	var colourList = 
		["rgb(82, 233, 30)","rgb(46, 204, 113)","rgb(26, 188, 156)","rgb(52, 152, 219)","rgb(52, 84, 219)","rgb(134, 30, 233)","rgb(155, 89, 182)","rgb(233, 30, 99)","rgb(233, 65, 30)","rgb(231, 76, 60)","rgb(230, 126, 34)","rgb(241, 196, 15)","rgb(199, 204, 205)","rgb(112, 128, 136)","rgb(99, 99, 99)",
		"rgb(255, 255, 255)","rgb(59, 173, 20)","rgb(31, 139, 76)","rgb(17, 128, 106)","rgb(32, 102, 148)","rgb(32, 57, 148)","rgb(109, 20, 173)","rgb(113, 54, 138)","rgb(173, 20, 87)","rgb(173, 32, 20)","rgb(153, 45, 34)","rgb(168, 67, 0)","rgb(194, 124, 14)","rgb(151, 156, 159)","rgb(93, 104, 109)","rgb(44, 44, 44)"];
		
	var swatches = 
		`<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO" style="flex: 1 1 auto; margin-top: 5px;">
			<div class="ui-color-picker-${swatch} large custom" style="background-color: rgb(0, 0, 0);">
				<svg class="color-picker-dropper-${swatch}" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16">
					<path class="color-picker-dropper-fg-${swatch}" fill="#ffffff" d="M14.994 1.006C13.858-.257 11.904-.3 10.72.89L8.637 2.975l-.696-.697-1.387 1.388 5.557 5.557 1.387-1.388-.697-.697 1.964-1.964c1.13-1.13 1.3-2.985.23-4.168zm-13.25 10.25c-.225.224-.408.48-.55.764L.02 14.37l1.39 1.39 2.35-1.174c.283-.14.54-.33.765-.55l4.808-4.808-2.776-2.776-4.813 4.803z"></path>
				</svg>
			</div>
			<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa wrap-1da0e3  ui-color-picker-row" style="flex: 1 1 auto; display: flex; flex-wrap: wrap; overflow: visible !important;">
				<div class="ui-color-picker-${swatch} nocolor" style="background-color: null;">
					<svg class="nocolor-cross" height="22" width="22">
						<path d="m 3 2 l 17 18 m 0 -18 l -17 18" stroke="red" stroke-width="3" fill="none"/>
					</svg>
				</div>
				${ colourList.map((val, i) => `<div class="ui-color-picker-${swatch}" style="background-color: ${val};"></div>`).join("")}
			</div>
		</div>`;
	$(swatches).appendTo(wrapperDiv);
	
	if (currentCOMP) {
		var currentRGB = BDfunctionsDevilBro.color2RGB(currentCOMP);
		var invRGB = BDfunctionsDevilBro.colorINV(currentRGB);
		
		var selection = colourList.indexOf(currentRGB);
		
		if (selection > -1) {
			wrapperDiv.find(".ui-color-picker-" + swatch + ":not(.custom, .nocolor)").eq(selection)
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
		BDfunctionsDevilBro.openColorPicker(e.currentTarget.style.backgroundColor, swatch);
	});
};

BDfunctionsDevilBro.openColorPicker = (currentColor, swatch) => {
	var strings = BDfunctionsDevilBro.getLibraryStrings();
	var colorPickerModalMarkup = 
		`<span class="colorpicker-modal DevilBro-modal">
			<div class="backdrop-2ohBEd"></div>
			<div class="modal-2LIEKY">
				<div class="inner-1_1f7b">
					<div class="modal-3HOjGZ sizeMedium-1-2BNS">
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
							<div class="flexChild-1KGW5q" style="flex: 1 1 auto;">
								<h4 class="h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl">${strings.colorpicker_modal_header_text}</h4>
								<div class="guildName-1u0hy7 small-3-03j1 size12-1IGJl9 height16-1qXrGy primary-2giqSn"></div>
							</div>
							<svg class="btn-cancel close-3ejNTg flexChild-1KGW5q" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
								<g fill="none" fill-rule="evenodd">
									<path d="M0 0h12v12H0"></path>
									<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
								</g>
							</svg>
						</div>
						<div class="flex-lFgbSz flex-3B1Tl4 inner-tqJwAU vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO colorpicker-container" style="flex: 1 1 auto;">
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
											<path stroke="grey" fill="white" d="M 0 0, l 5 5, l -5 5, m 31 0, l -5 -5, l 5 -5"></path>
										</svg>
									</div>
									<div class="colorpicker-sliderpane"></div>
							</div>
							<div class="colorpicker-controls">
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
						<div class="flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw">
							<button type="button" class="btn-save buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu">
								<div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM">${strings.btn_ok_text}</div>
							</button>
						</div>
					</div>
				</div>
			</div>
		</span>`;
		
	var colorPickerModal = $(colorPickerModalMarkup)[0];
	BDfunctionsDevilBro.appendModal(colorPickerModal);
	$(colorPickerModal)
		.on("click", ".btn-save", (event) => {
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
	
	[hue, saturation, lightness] = BDfunctionsDevilBro.color2HSL(currentColor).replace(new RegExp(" ", "g"), "").slice(4, -1).split(",");
	saturation *= 100;
	lightness *= 100;
	updateAllValues();
	updateCursors();
	
	$(ppane)
		.off("mousedown")
		.on("mousedown", (event) => {
			BDfunctionsDevilBro.appendLocalStyle("crossHairColorPicker", `* {cursor: crosshair !important;}`);
			
			switchPreviews(event.button);
			
			pHalfW = pcursor.offsetWidth/2;
			pHalfH = pcursor.offsetHeight/2;
			pMinX = $(ppane).offset().left;
			pMaxX = pMinX + ppane.offsetWidth;
			pMinY = $(ppane).offset().top;
			pMaxY = pMinY + ppane.offsetHeight;
			pX = event.clientX - pHalfW;
			pY = event.clientY - pHalfH;
			
			$(pcursor).offset({"left":pX,"top":pY});
			
			saturation = mapRange([pMinX - pHalfW, pMaxX - pHalfW], [0, 100], pX);
			lightness = mapRange([pMinY - pHalfH, pMaxY - pHalfH], [100, 0], pY);
			updateAllValues();
			
			$(document)
				.off("mouseup.ColorPicker").off("mousemove.ColorPicker")
				.on("mouseup.ColorPicker", () => {
					BDfunctionsDevilBro.removeLocalStyle("crossHairColorPicker");
					$(document).off("mouseup.ColorPicker").off("mousemove.ColorPicker");
				})
				.on("mousemove.ColorPicker", (event2) => {
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
			BDfunctionsDevilBro.appendLocalStyle("crossHairColorPicker", `* {cursor: crosshair !important;}`);
			
			switchPreviews(event.button);
			
			sHalfH = scursor.offsetHeight/2;
			sMinY = $(spane).offset().top;
			sMaxY = sMinY + spane.offsetHeight;
			sY = event.clientY - sHalfH;
			
			$(scursor).offset({"top":sY});
			
			hue = mapRange([sMinY - sHalfH, sMaxY - sHalfH], [360, 0], sY);
			updateAllValues();
			
			$(document)
				.off("mouseup.ColorPicker").off("mousemove.ColorPicker")
				.on("mouseup.ColorPicker", () => {
					BDfunctionsDevilBro.removeLocalStyle("crossHairColorPicker");
					$(document).off("mouseup.ColorPicker").off("mousemove.ColorPicker");
				})
				.on("mousemove.ColorPicker", (event2) => {
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
			[hue, saturation, lightness] = BDfunctionsDevilBro.color2HSL(event.target.style.backgroundColor).replace(new RegExp(" ", "g"), "").slice(4, -1).split(",");
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
					[hue, saturation, lightness] = BDfunctionsDevilBro.color2HSL(hex).replace(new RegExp(" ", "g"), "").slice(4, -1).split(",");
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
				[hue, saturation, lightness] = BDfunctionsDevilBro.color2HSL([red, green, blue]).replace(new RegExp(" ", "g"), "").slice(4, -1).split(",");
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
		sHalfH = scursor.offsetHeight/2;
		sMinY = $(spane).offset().top;
		sY = mapRange([360, 0], [sMinY - sHalfH, sMaxY - sHalfH], hue);
		
		pHalfW = pcursor.offsetWidth/2;
		pHalfH = pcursor.offsetHeight/2;
		pMinX = $(ppane).offset().left;
		pMaxX = pMinX + ppane.offsetWidth;
		pMinY = $(ppane).offset().top;
		pMaxY = pMinY + ppane.offsetHeight;
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
};

BDfunctionsDevilBro.getSwatchColor = (swatch) => {
	return !$(".ui-color-picker-" + swatch + ".nocolor.selected")[0] ? BDfunctionsDevilBro.color2COMP($(".ui-color-picker-" + swatch + ".selected").css("background-color")) : null;
};

BDfunctionsDevilBro.isRestartNoMoreEnabled = () => {
	return (window.bdplugins["Restart-No-More"] && window.pluginCookie["Restart-No-More"] || window.bdplugins["Restart No More"] && window.pluginCookie["Restart No More"]);
};

BDfunctionsDevilBro.getDiscordTheme = () => {
	if ($(".theme-light").length > $(".theme-dark").length) return "theme-light";
	else return "theme-dark";
};

BDfunctionsDevilBro.getDiscordLanguage = () => {
	var lang = document.querySelector("html").lang ? document.querySelector("html").lang.split("-")[0] : "en";
	switch (lang) {
		case "da": 		//danish
			return {"id":"da","lang":"danish","ownlang":"Dansk"};
		case "de": 		//german
			return {"id":"de","lang":"german","ownlang":"Deutsch"};
		case "es": 		//spanish
			return {"id":"es","lang":"spanish","ownlang":"Español"};
		case "fr": 		//french
			return {"id":"fr","lang":"french","ownlang":"Français"};
		case "it": 		//italian
			return {"id":"it","lang":"italian","ownlang":"Italiano"};
		case "nl":		//dutch
			return {"id":"nl","lang":"dutch","ownlang":"Nederlands"};
		case "no":		//norwegian
			return {"id":"no","lang":"norwegian","ownlang":"Norsk"};
		case "pl":		//polish
			return {"id":"pl","lang":"polish","ownlang":"Polskie"};
		case "pt":		//portuguese (brazil)
			return {"id":"pt","lang":"portuguese","ownlang":"Português"};
		case "fi":		//finnish
			return {"id":"fi","lang":"finnish","ownlang":"Suomalainen"};
		case "sv":		//swedish
			return {"id":"sv","lang":"turkish","ownlang":"Svenska"};
		case "tr":		//turkish
			return {"id":"tr","lang":"turkish","ownlang":"Türk"};
		case "cs":		//czech
			return {"id":"cs","lang":"czech","ownlang":"Čeština"};
		case "bg":		//bulgarian
			return {"id":"bg","lang":"bulgarian","ownlang":"български"};
		case "ru":		//russian
			return {"id":"ru","lang":"russian","ownlang":"Pусский"};
		case "uk":		//ukrainian
			return {"id":"uk","lang":"ukrainian","ownlang":"Yкраїнський"};
		case "ja":		//japanese
			return {"id":"ja","lang":"japanese","ownlang":"日本語"};
		case "zh":		//chinese (traditional)
			return {"id":"zh","lang":"chinese","ownlang":"中文","googleid":"zh-TW"};
		case "ko":		//korean
			return {"id":"ko","lang":"korean","ownlang":"한국어"};
		default:		//default: english
			return {"id":"en","lang":"english","ownlang":"English"};
	}
};

BDfunctionsDevilBro.getLibraryStrings = () => {
	switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
		case "da": 		//danish
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} er startet.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} er stoppet.",
				toast_plugin_translated:		"${pluginName} oversat til ${ownlang}.",
				colorpicker_modal_header_text:	"Farvevælger",
				btn_ok_text: 					"OK"
			};
		case "de": 		//german
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} wurde gestartet.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} wurde gestoppt.",
				toast_plugin_translated:		"${pluginName} auf ${ownlang} übersetzt.",
				colorpicker_modal_header_text:	"Farbauswahl",
				btn_ok_text: 					"OK"
			};
		case "es": 		//spanish
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} se ha iniciado.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} se ha detenido.",
				toast_plugin_translated:		"${pluginName} traducido a ${ownlang}.",
				colorpicker_modal_header_text:	"Selector de color",
				btn_ok_text: 					"OK"
			};
		case "fr": 		//french
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} a été démarré.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} a été arrêté.",
				toast_plugin_translated:		"${pluginName} traduit en ${ownlang}.",
				colorpicker_modal_header_text:	"Pipette à couleurs",
				btn_ok_text: 					"OK"
			};
		case "it": 		//italian
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} è stato avviato.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} è stato interrotto.",
				toast_plugin_translated:		"${pluginName} tradotto in ${ownlang}.",
				colorpicker_modal_header_text:	"Raccoglitore di colore",
				btn_ok_text: 					"OK"
			};
		case "nl":		//dutch
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} is gestart.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} is gestopt.",
				toast_plugin_translated:		"${pluginName} vertaald naar ${ownlang}.",
				colorpicker_modal_header_text:	"Kleur kiezer",
				btn_ok_text: 					"OK"
			};
		case "no":		//norwegian
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} er startet.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} er stoppet.",
				toast_plugin_translated:		"${pluginName} oversatt til ${ownlang}.",
				colorpicker_modal_header_text:	"Fargevelger",
				btn_ok_text: 					"OK"
			};
		case "pl":		//polish
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} został uruchomiony.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} został zatrzymany.",
				toast_plugin_translated:		"${pluginName} przetłumaczono na ${ownlang}.",
				colorpicker_modal_header_text:	"Narzędzie do wybierania kolorów",
				btn_ok_text: 					"OK"
			};
		case "pt":		//portuguese (brazil)
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} foi iniciado.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} foi interrompido.",
				toast_plugin_translated:		"${pluginName} traduzido para ${ownlang}.",
				colorpicker_modal_header_text:	"Seletor de cores",
				btn_ok_text: 					"OK"
			};
		case "fi":		//finnish
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} on käynnistetty.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} on pysäytetty.",
				toast_plugin_translated:		"${pluginName} käännetty osoitteeseen ${ownlang}.",
				colorpicker_modal_header_text:	"Värinvalitsija",
				btn_ok_text: 					"OK"
			};
		case "sv":		//swedish
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} har startats.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} har blivit stoppad.",
				toast_plugin_translated:		"${pluginName} översatt till ${ownlang}.",
				colorpicker_modal_header_text:	"Färgväljare",
				btn_ok_text: 					"OK"
			};
		case "tr":		//turkish
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} başlatıldı.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} durduruldu.",
				toast_plugin_translated:		"${pluginName} ${ownlang} olarak çevrildi.",
				colorpicker_modal_header_text:	"Renk seçici",
				btn_ok_text: 					"Okey"
			};
		case "cs":		//czech
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} byl spuštěn.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} byl zastaven.",
				toast_plugin_translated:		"${pluginName} přeložen do ${ownlang}.",
				colorpicker_modal_header_text:	"Výběr barev",
				btn_ok_text: 					"OK"
			};
		case "bg":		//bulgarian
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} е стартиран.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} е спрян.",
				toast_plugin_translated:		"${pluginName} преведена на ${ownlang}.",
				colorpicker_modal_header_text:	"Избор на цвят",
				btn_ok_text: 					"Добре"
			};
		case "ru":		//russian
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} запущен.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} остановлен.",
				toast_plugin_translated:		"${pluginName} переведен на ${ownlang}.",
				colorpicker_modal_header_text:	"Выбор цвета",
				btn_ok_text: 					"ОК"
			};
		case "uk":		//ukranian
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} було запущено.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} було зупинено.",
				toast_plugin_translated:		"${pluginName} перекладено ${ownlang}.",
				colorpicker_modal_header_text:	"Колір обкладинки",
				btn_ok_text: 					"Добре"
			};
		case "ja":		//japanese
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion}が開始されました.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion}が停止しました.",
				toast_plugin_translated:		"${pluginName} は${ownlang}に翻訳されました.",
				colorpicker_modal_header_text:	"カラーピッカー",
				btn_ok_text: 					"はい"
			};
		case "zh":		//chinese (traditional)
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion}已經啟動.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion}已停止.",
				toast_plugin_translated:		"${pluginName} 翻譯為${ownlang}.",
				colorpicker_modal_header_text:	"選色器",
				btn_ok_text: 					"好"
			};
		case "ko":		//korean
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} 시작되었습니다.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} 중지되었습니다.",
				toast_plugin_translated:		"${pluginName} ${ownlang} 로 번역되었습니다.",
				colorpicker_modal_header_text:	"색상 선택 도구",
				btn_ok_text: 					"승인"
			};
		default:		//default: english
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} has been started.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} has been stopped.",
				toast_plugin_translated:		"${pluginName} translated to ${ownlang}.",
				colorpicker_modal_header_text:	"Color Picker",
				btn_ok_text: 					"OK"
			};
	}
}

BDfunctionsDevilBro.pressedKeys = [];

$(window)
	.off("keydown.BDfunctionsDevilBroPressedKeys")
	.off("keyup.BDfunctionsDevilBroPressedKeys")
	.on("keydown.BDfunctionsDevilBroPressedKeys", (e) => {
		if (!BDfunctionsDevilBro.pressedKeys.includes(e.which)) BDfunctionsDevilBro.pressedKeys.push(e.which);
	})
	.on("keyup.BDfunctionsDevilBroPressedKeys", (e) => {
		BDfunctionsDevilBro.removeFromArray(BDfunctionsDevilBro.pressedKeys, e.which);
	});

BDfunctionsDevilBro.appendLocalStyle("BDfunctionsDevilBro", `
	#pluginNotice, .DevilBro-notice {
		-webkit-app-region: drag;
	} 
	
	#pluginNotice #outdatedPlugins span {
		-webkit-app-region: no-drag;
		color:#fff;
		cursor:pointer;
	} 
	
	#pluginNotice #outdatedPlugins span:hover {
		text-decoration:underline;
	}
	
	.toasts {
		position: fixed;
		display: flex;
		top: 0;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		pointer-events: none;
		z-index: 4000;
	}
	
	@keyframes toast-up {
		from {
			transform: translateY(0);
			opacity: 0;
		}
	}
	
	.toast {
		animation: toast-up 300ms ease;
		transform: translateY(-10px);
		background: #36393F;
		padding: 10px;
		border-radius: 5px;
		box-shadow: 0 0 0 1px rgba(32,34,37,.6), 0 2px 10px 0 rgba(0,0,0,.2);
		font-weight: 500;
		color: #fff;
		user-select: text;
		font-size: 14px;
		opacity: 1;
		margin-top: 10px;
		pointer-events: auto;
	}
	
	@keyframes toast-down {
		to {
			transform: translateY(0px);
			opacity: 0;
		}
	}
	
	.toast.closing {
		animation: toast-down 200ms ease;
		animation-fill-mode: forwards;
		opacity: 1;
		transform: translateY(-10px);
	}
	
	
	.toast.icon {
		padding-left: 30px;
		background-size: 20px 20px;
		background-repeat: no-repeat;
		background-position: 6px 50%;
	}
	
	.toast.toast-info {
		background-color: #4a90e2;
	}
	
	.toast.toast-info.icon {
		background-image: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPiAgICA8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMSAxNWgtMnYtNmgydjZ6bTAtOGgtMlY3aDJ2MnoiLz48L3N2Zz4=);
	}
	
	.toast.toast-success {
		background-color: #43b581;
	}
	
	.toast.toast-success.icon {
		background-image: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPiAgICA8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNy41OS03LjU5TDE5IDhsLTkgOXoiLz48L3N2Zz4=);
	}
	.toast.toast-danger, .toast.toast-error {
		background-color: #f04747;
	}
	
	.toast.toast-danger.icon,
	.toast.toast-error.icon {
		background-image: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTEyIDJDNi40NyAyIDIgNi40NyAyIDEyczQuNDcgMTAgMTAgMTAgMTAtNC40NyAxMC0xMFMxNy41MyAyIDEyIDJ6bTUgMTMuNTlMMTUuNTkgMTcgMTIgMTMuNDEgOC40MSAxNyA3IDE1LjU5IDEwLjU5IDEyIDcgOC40MSA4LjQxIDcgMTIgMTAuNTkgMTUuNTkgNyAxNyA4LjQxIDEzLjQxIDEyIDE3IDE1LjU5eiIvPiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+PC9zdmc+);
	}
	
	.toast.toast-warning,
	.toast.toast-warn {
		background-color: #FFA600;
		color: white;
	}
	
	.toast.toast-warning.icon,
	.toast.toast-warn.icon {
		background-image: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPiAgICA8cGF0aCBkPSJNMSAyMWgyMkwxMiAyIDEgMjF6bTEyLTNoLTJ2LTJoMnYyem0wLTRoLTJ2LTRoMnY0eiIvPjwvc3ZnPg==);
	}
	
	.update-list-tooltip {
		max-width: 400px;
	}

	[class^="ui-color-picker-swatch"] {
		width: 22px;
		height: 22px;
		margin-bottom: 5px;
		margin-top: 5px;
		border: 4px solid transparent;
		border-radius: 12px;
	}

	[class^="ui-color-picker-swatch"].large {
		min-width: 62px;
		height: 62px;
		border-radius: 25px;
	}

	[class^="ui-color-picker-swatch"].nocolor {
		border: 4px solid red;
	}
	
	[class^="color-picker-dropper"] {
		position: relative;
		left: 40px;
		top: 10px;
	}
	
	@keyframes animation-backdrop {
		to { opacity: 0.7; }
	}

	@keyframes animation-backdrop-closing {
		to { opacity: 0; }
	}

	@keyframes animation-modal {
		to { transform: scale(1); opacity: 1; }
	}

	@keyframes animation-modal-closing {
		to { transform: scale(0.7); opacity: 0; }
	}

	.DevilBro-modal .backdrop-2ohBEd {
		animation: animation-backdrop 250ms ease;
		animation-fill-mode: forwards;
		opacity: 0;
		background-color: rgb(0, 0, 0);
		transform: translateZ(0px);
	}

	.DevilBro-modal.closing .backdrop-2ohBEd {
		animation: animation-backdrop-closing 200ms linear;
		animation-fill-mode: forwards;
		animation-delay: 50ms;
		opacity: 0.2;
	}
	
	.DevilBro-modal .modal-2LIEKY {
		animation: animation-modal 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
		animation-fill-mode: forwards;
		transform: scale(0.7);
		transform-origin: 50% 50%;
	}

	.DevilBro-modal.closing .modal-2LIEKY {
		animation: animation-modal-closing 250ms cubic-bezier(0.19, 1, 0.22, 1);
		animation-fill-mode: forwards;
		opacity: 1;
		transform: scale(1);
	}

	.DevilBro-modal input.valid {
		background-color: rgba(10,167,0,.5);
	}

	.DevilBro-modal input.invalid {
		background-color: rgba(208,0,0,.5);
	}

	.DevilBro-modal input:disabled {
		color: #555555;
		cursor: no-drop;
		background-color: rgba(0,0,0,.5);
	}

	.DevilBro-modal .tab {
		opacity: .3;
		-webkit-box-flex: 0;
		cursor: pointer;
		flex-grow: 0;
		flex-shrink: 0;
		margin-right: 12px;
		padding: 0px 5px 15px 5px;
		text-align: center;   
		border-bottom: 2px solid transparent;
		color: #fff;
	}

	.DevilBro-modal .tab:hover {
		border-bottom-color: #fff;
	}

	.DevilBro-modal .tab.selected {
		opacity: 1;
		border-bottom-color: #fff;
	}

	.DevilBro-modal .tab-content {
		display: none;
	}

	.DevilBro-modal .tab-content.open {
		display: initial;
	}
	
	.colorpicker-modal .colorpicker-container {
		padding: 15px;
		overflow: hidden;
		display: initial;
		margin: auto;
	}
	
	.colorpicker-modal .colorpicker-color,
	.colorpicker-modal .colorpicker-slider,
	.colorpicker-modal .colorpicker-controls {
		float: left;
		margin-right: 20px;
	}
	
	.colorpicker-modal .colorpicker-inputs {
		text-align: center;
		background-color: #7E8084;
		border-radius: 5px;
		width: 115px;
		padding: 3px;
		margin-top: 87px;
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
	
	.colorpicker-modal .colorpicker-slidercursor {
		position: absolute;
		top: -4px;
		left: -6px;
		height: 12px;
		width: 32px;
	}
	.colorpicker-modal .colorpicker-slidercursor svg {
		position: relative;
		height: 12px;
		width: 32px;
	}
		
	.colorpicker-modal [class^="colorpicker-preview-"] {
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
		top: 2px;
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
