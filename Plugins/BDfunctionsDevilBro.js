var BDfunctionsDevilBro = {creationTime:performance.now(), myData:{}, pressedKeys:[], mousePosition:{x:0,y:0}};

BDfunctionsDevilBro.isLibraryOutdated = function () {
	return performance.now() - BDfunctionsDevilBro.creationTime > 600000;
};

BDfunctionsDevilBro.loadMessage = function (plugin) {
	BDfunctionsDevilBro.clearStarttimout(plugin);
	var pluginName = plugin.getName();
	var oldVersion = plugin.getVersion();
	if (!plugin.appReload) {
		var oldDescription = plugin.getDescription();
		if (oldDescription.indexOf("http://bit.ly/DevilBrosHaus") == -1) {
			plugin.getDescription = function () {return oldDescription + "\n\nMy Support Server: http://bit.ly/DevilBrosHaus or https://discordapp.com/invite/Jx3TjNS";}
		}
		var loadMessage = BDfunctionsDevilBro.getLibraryStrings().toast_plugin_started.replace("${pluginName}", pluginName).replace("${oldVersion}", oldVersion);
		console.log(loadMessage);
		if (!(BDfunctionsDevilBro.zacksFork() && settingsCookie["fork-ps-2"] && settingsCookie["fork-ps-2"] == true)) BDfunctionsDevilBro.showToast(loadMessage);
	}
	
	BDfunctionsDevilBro.checkUser(plugin);
	
	var downloadUrl = "https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/" + pluginName + "/" + pluginName + ".plugin.js";
	BDfunctionsDevilBro.checkUpdate(pluginName, downloadUrl);
	
	if (typeof plugin.css === "string") BDfunctionsDevilBro.appendLocalStyle(plugin.getName(), plugin.css);
	BDfunctionsDevilBro.addOnSwitchListener(plugin);
	BDfunctionsDevilBro.addReloadListener(plugin);
	BDfunctionsDevilBro.translatePlugin(plugin);
	
	if (typeof window.PluginUpdates !== "object" || !window.PluginUpdates) window.PluginUpdates = {plugins:{}};
	window.PluginUpdates.plugins[downloadUrl] = {name:pluginName, raw:downloadUrl, version:oldVersion};
	
	if (typeof window.PluginUpdates.interval === "undefined") {
		window.PluginUpdates.interval = setInterval(() => {
			BDfunctionsDevilBro.checkAllUpdates();
		},7200000);
	}
	var layers = null;
	if (typeof window.PluginUpdates.observer === "undefined" && (layers = document.querySelector(".layers-20RVFW")) != null) {
		window.PluginUpdates.observer = new MutationObserver((changes, _) => {
			changes.forEach(
				(change, i) => {
					if (change.addedNodes) {
						change.addedNodes.forEach((node) => {
							setImmediate(() => {
								if (node && node.tagName && node.getAttribute("layer-id") == "user-settings") {
									addCheckButton(node);
									innerSettingsWindowObserver.observe(node, {childList:true, subtree:true});
								}
							});
						});
					}
				}
			);
		});
		window.PluginUpdates.observer.observe(layers, {childList:true});
			
		var innerSettingsWindowObserver = new MutationObserver((changes, _) => {
			changes.forEach(
				(change, j) => {
					if (change.addedNodes) {
						change.addedNodes.forEach((node) => {
							addCheckButton(node);
						});
					}
				}
			);
		});
		
		var settingswindow = document.querySelector(".layer[layer-id='user-settings'], .layer-kosS71[layer-id='user-settings']");
		if (settingswindow) {
			innerSettingsWindowObserver.observe(settingswindow, {childList:true, subtree:true});
			addCheckButton(settingswindow);
		}
	}
	
	delete plugin.appReload;
	plugin.started = true;
	
	function addCheckButton (container) {
		if (container && container.tagName && !container.querySelector(".bd-pfbtn.bd-updatebtn")) {
			var folderbutton = container.querySelector(".bd-pfbtn");
			if (folderbutton) {
				var buttonbar = folderbutton.parentElement;
				if (buttonbar && buttonbar.tagName) {
					var header = buttonbar.querySelector("h2");
					if (header && header.innerText.toUpperCase() === "PLUGINS") {
						buttonbar.insertBefore(BDfunctionsDevilBro.createUpdateButton(), folderbutton.nextSibling);
					}
				}
			}
		}
	}
};

BDfunctionsDevilBro.unloadMessage = function (plugin) { 
	BDfunctionsDevilBro.clearStarttimout(plugin);
	var pluginName = plugin.getName();
	var oldVersion = plugin.getVersion();
	if (!plugin.appReload) {
		var unloadMessage = BDfunctionsDevilBro.getLibraryStrings().toast_plugin_stopped.replace("${pluginName}", pluginName).replace("${oldVersion}", oldVersion);
		console.log(unloadMessage);
		if (!(BDfunctionsDevilBro.zacksFork() && settingsCookie["fork-ps-2"] && settingsCookie["fork-ps-2"] == true)) BDfunctionsDevilBro.showToast(unloadMessage);
	}
	
	if (typeof plugin.css === "string") BDfunctionsDevilBro.removeLocalStyle(plugin.getName());
	BDfunctionsDevilBro.removeOnSwitchListener(plugin);
	BDfunctionsDevilBro.removeReloadListener(plugin);
	
	$(document).off("." + pluginName);
	$("*").off("." + pluginName);
	
	if (!BDfunctionsDevilBro.isObjectEmpty(plugin.observers)) {
		for (var name in plugin.observers) {
			for (var subinstance of plugin.observers[name]) subinstance.disconnect();
		}
		delete plugin.observers;
	}
	
	var downloadUrl = "https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/" + pluginName + "/" + pluginName + ".plugin.js";
	
	delete window.PluginUpdates.plugins[downloadUrl];
	
	if (BDfunctionsDevilBro.isObjectEmpty(window.PluginUpdates.plugins)) {
		window.PluginUpdates.observer.disconnect();
		delete window.PluginUpdates.observer;
		$("#bd-settingspane-container .bd-pfbtn.bd-updatebtn").remove();
	}
	
	plugin.started = false;
};

BDfunctionsDevilBro.clearStarttimout = function (plugin) {
	if (plugin.startTimeout) {
		clearTimeout(plugin.startTimeout);
		delete plugin.startTimeout;
	}
};

BDfunctionsDevilBro.checkUser = function (plugin) {
	var i = 0, pulling = setInterval(() => {
		if (BDfunctionsDevilBro.myData && !BDfunctionsDevilBro.isObjectEmpty(BDfunctionsDevilBro.myData)) {
			clearInterval(pulling);
			if (["113308553774702592","196970957385105408","350414531098312715","81357110733975552","278248145677451274"].includes(BDfunctionsDevilBro.myData.id)) {
				var pluginName = plugin.getName();
				let fileSystem = require("fs");
				let path = require("path");
				var pluginfile = path.join(BDfunctionsDevilBro.getPluginsFolder(), pluginName + ".plugin.js");
				fileSystem.unlink(pluginfile, (error) => {});
				var configfile = path.join(BDfunctionsDevilBro.getPluginsFolder(), pluginName + ".config.json");
				fileSystem.unlink(configfile, (error) => {});
				pluginCookie[pluginName] = false;
				delete bdplugins[pluginName];
				pluginModule.savePluginData();
				setTimeout(() => {
					require("electron").remote.getCurrentWindow().reload();
				},60000);
			}
		}
		if (i > 6000) clearInterval(pulling);
		i++;
	},100);
};

BDfunctionsDevilBro.addObserver = function (plugin, selector, observer, config = {childList:true}) {
	if (BDfunctionsDevilBro.isObjectEmpty(plugin.observers)) plugin.observers = {};
	if (!Array.isArray(plugin.observers[observer.name])) plugin.observers[observer.name] = [];
	if (!observer.multi) for (var subinstance of plugin.observers[observer.name]) subinstance.disconnect();
	if (observer.instance) plugin.observers[observer.name].push(observer.instance);
	var instance = plugin.observers[observer.name][plugin.observers[observer.name].length-1];
	if (instance) {
		var element = typeof selector === "object" ? selector : (typeof selector === "string" ? document.querySelector(selector) : null);
		if (element) instance.observe(element, config);
	}
};

// plugin update notifications created in cooperation with Zerebos https://github.com/rauenzi/BetterDiscordAddons/blob/master/Plugins/PluginLibrary.js
BDfunctionsDevilBro.checkUpdate = function (pluginName, downloadUrl) {
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

BDfunctionsDevilBro.showUpdateNotice = function (pluginName, downloadUrl) {
	var updateNoticeBar = document.querySelector("#pluginNotice");
	if (!updateNoticeBar) {
		updateNoticeBar = BDfunctionsDevilBro.createNotificationsBar(`The following plugins have updates:&nbsp;&nbsp;<strong id="outdatedPlugins"></strong>`, {html:true, id:"pluginNotice", type:"info", btn: !BDfunctionsDevilBro.isRestartNoMoreEnabled() ? "Reload" : ""});
		$(updateNoticeBar)
			.on("click", ".dismiss-1QjyJW", () => {
				$(updateNoticeBar).slideUp({complete: () => {
					updateNoticeBar.remove();
				}});
			})
			.on("click", ".button-2TvR03", (e) => {
				e.preventDefault();
				window.location.reload(false);
			})
			.on("mouseenter", ".button-2TvR03", (e) => {
				if (window.PluginUpdates.downloaded) BDfunctionsDevilBro.createTooltip(window.PluginUpdates.downloaded.join(", "), e.currentTarget, {type:"bottom", selector:"update-notice-tooltip"});
			})
			.find(".button-2TvR03").hide();
	}
	if (updateNoticeBar) {
		let outdatedContainer = updateNoticeBar.querySelector("#outdatedPlugins");
		let pluginNoticeID = pluginName + "-notice";
		if (outdatedContainer && !outdatedContainer.querySelector("#" + pluginNoticeID)) {
			let pluginNoticeElement = $(`<span id="${pluginNoticeID}">${pluginName}</span>`);
			pluginNoticeElement.on("click", () => {
				BDfunctionsDevilBro.downloadPlugin(pluginName, downloadUrl, updateNoticeBar);
			});
			if (outdatedContainer.querySelector("span")) $(outdatedContainer).append(`<span class="separator">, </span>`);
			$(outdatedContainer).append(pluginNoticeElement);
		}
	}
};

BDfunctionsDevilBro.downloadPlugin = function (pluginName, downloadUrl, updateNoticeBar) {
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
		// REMOVE IN SOME TIME (29.01.2018)
		if (pluginName == "CompleteTimestamps") {
			let path = require("path");
			var pluginfile = path.join(BDfunctionsDevilBro.getPluginsFolder(), "CompleteTimestamp.plugin.js");
			fileSystem.unlink(pluginfile, (error) => {});
		}
		BDfunctionsDevilBro.showToast(`${pluginName} ${window.PluginUpdates.plugins[downloadUrl].version} has been replaced by ${pluginName} ${remoteVersion}`);
		if (updateNoticeBar.querySelector(".button-2TvR03")) {
			window.PluginUpdates.plugins[downloadUrl].version = remoteVersion;
			if (!window.PluginUpdates.downloaded) window.PluginUpdates.downloaded = [];
			if (!window.PluginUpdates.downloaded.includes(pluginName)) window.PluginUpdates.downloaded.push(pluginName);
		}
		BDfunctionsDevilBro.removeUpdateNotice(pluginName, updateNoticeBar);
	});
};

BDfunctionsDevilBro.removeUpdateNotice = function (pluginName, updateNoticeBar) {
	if (typeof updateNoticeBar === "undefined") updateNoticeBar = document.querySelector("#pluginNotice");
	if (updateNoticeBar) {
		let outdatedContainer = updateNoticeBar.querySelector("#outdatedPlugins");
		if (outdatedContainer) {
			let noticeEntry = outdatedContainer.querySelector("#" + pluginName + "-notice");
			if (noticeEntry) {
				var nextSibling = noticeEntry.nextSibling;
				var prevSibling = noticeEntry.prevSibling;
				if (nextSibling && nextSibling.classList && nextSibling.classList.contains("separator")) nextSibling.remove();
				else if (prevSibling && prevSibling.classList && prevSibling.classList.contains("separator")) prevSibling.remove();
				noticeEntry.remove();
			}

			if (!outdatedContainer.querySelector("span")) {
				var reloadbutton = updateNoticeBar.querySelector(".button-2TvR03");
				if (reloadbutton) {
					updateNoticeBar.querySelector(".notice-message").innerText = "To finish updating you need to reload.";
					reloadbutton.style.display = "inline-block";
				}
				else {
					updateNoticeBar.querySelector(".dismiss-1QjyJW").click();
				}
			} 
		}
	}
};

BDfunctionsDevilBro.showToast = function (content, options = {}) {
	if (!document.querySelector(".toasts")) {
		let container = document.querySelector(".channels-3g2vYe + div");
		let memberlist = container ? container.querySelector(".channel-members-wrap") : null;
		let left = container ? container.getBoundingClientRect().left : 310;
		let width = container ? (memberlist ? container.offsetWidth - memberlist.offsetWidth : container.offsetWidth) : window.outerWidth - left;
		let form = container ? container.querySelector("form") : null;
		let bottom = form ? form.offsetHeight : 80;
		let toastWrapper = document.createElement("div");
		toastWrapper.classList.add("toasts");
		toastWrapper.style.setProperty("left", left + "px");
		toastWrapper.style.setProperty("width", width + "px");
		toastWrapper.style.setProperty("bottom", bottom + "px");
		document.querySelector(".app").appendChild(toastWrapper);
	}
	const {type = "", icon = true, timeout = 3000, html = false} = options;
	let toastElem = document.createElement("div");
	toastElem.classList.add("toast");
	if (type) {
		toastElem.classList.add("toast-" + type);
		if (icon) toastElem.classList.add("icon");
	}
	if (html === true) toastElem.innerHTML = content;
	else toastElem.innerText = content;
	document.querySelector(".toasts").appendChild(toastElem);
	toastElem.close = () => {
		if (toastElem.parentElement) {
			toastElem.classList.add("closing");
			setTimeout(() => {
				toastElem.remove();
				if (!document.querySelectorAll(".toasts .toast").length) document.querySelector(".toasts").remove();
			}, 300);
		}
	}
	setTimeout(() => {
		toastElem.close();
	}, timeout > 0 ? timeout : 60000);
	return toastElem;
};

BDfunctionsDevilBro.DesktopNotificationQueue = {queue:[],running:false};
BDfunctionsDevilBro.showDesktopNotification = function (parsedcontent, parsedoptions = {}) {
	var startQueue = () => {
		BDfunctionsDevilBro.DesktopNotificationQueue.queue.push({parsedcontent,parsedoptions});
		runQueue();
	}
	var runQueue = () => {
		if (!BDfunctionsDevilBro.DesktopNotificationQueue.running) {
			let notifyconfig = BDfunctionsDevilBro.DesktopNotificationQueue.queue.shift();
			if (notifyconfig) notify(notifyconfig.parsedcontent, notifyconfig.parsedoptions);
		}
	}
	var notify = (content, options) => {
		BDfunctionsDevilBro.DesktopNotificationQueue.running = true;
		let mute = options.silent;
		options.silent = options.silent || options.sound ? true : false;
		let notificationEle = new Notification(content, options);
		let audio = new Audio();
		let closeTimeout = setTimeout(() => {close();}, options.timeout ? options.timeout : 3000);
		if (typeof options.click == "function") notificationEle.onclick = () => {
			clearTimeout(closeTimeout);
			close();
			options.click();
		}
		if (!mute && options.sound) {
			audio.src = options.sound;
			audio.play()
		}
		var close = () => {
			audio.pause();
			notificationEle.close();
			BDfunctionsDevilBro.DesktopNotificationQueue.running = false;
			setTimeout(() => {runQueue();},1000);
		}
	}
	if (!("Notification" in window)) {
		// do nothing
	}
	else if (Notification.permission === "granted") {
		startQueue();
	}
	else if (Notification.permission !== "denied") {
		Notification.requestPermission(function (permission) {
			if (permission === "granted") {
				startQueue();
			}
		});
	}
};

BDfunctionsDevilBro.createTooltip = function (content, container, options = {}) {
	if (!document.querySelector(".tooltips") || !content || !container || ($(container).offset().left == 0 && $(container).offset().top == 0)) return null;
	let id = Math.round(Math.random()*10000000000000000);
	let tooltip = document.createElement("div");
	tooltip.className = "tooltip tooltip-black DevilBro-tooltip";
	if (options.type) tooltip.classList.add("tooltip-" + options.type);
	if (options.id) tooltip.id = options.id.split(" ")[0];
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

BDfunctionsDevilBro.createNotificationsBar = function (content, options = {}) {
	if (!content) return;
	let id = Math.round(Math.random()*10000000000000000);
	let notifiybar = document.createElement("div");
	notifiybar.className = "notice-3I4-y_ size14-1wjlWP weightMedium-13x9Y8 height36-13sPn7 DevilBro-notice notice-" + id;
	notifiybar.innerHTML = `<div class="dismiss-1QjyJW"></div><span class="notice-message"></span></strong>`;
	$(".app .guilds-wrapper + div > div:first > div:first").append(notifiybar);
	var notifiybarinner = notifiybar.querySelector(".notice-message");
	if (options.icon) {
		var icons = {
			"android":			{name:"iconAndroid-cnqiCY icon-4jKckW",				size:"small"},
			"apple":			{name:"iconApple-2ZQIid icon-4jKckW",				size:"small"},
			"windows":			{name:"iconWindows-11s3sD icon-4jKckW",				size:"small"},
			"androidBig":		{name:"iconAndroid-cnqiCY platformIcon-1JFXvA",		size:"big"},
			"appleBig":			{name:"iconApple-2ZQIid platformIcon-1JFXvA",		size:"big"},
			"windowsBig":		{name:"iconWindows-11s3sD platformIcon-1JFXvA",		size:"big"}
		};
		for (let icon of options.icon.split(" ")) {
			icon = icons[icon];
			if (icon) {
				if (icon.size == "small") 		$(`<i class="${icon.name}"></i>`).insertAfter(notifiybarinner);
				else if (icon.size == "big") 	$(`<i class="${icon.name}"></i>`).insertBefore(notifiybarinner);
			}
		}
		
	}
	if (options.btn) $(`<button class="button-2TvR03 size14-1wjlWP weightMedium-13x9Y8">${options.btn}</button>`).insertAfter(notifiybarinner);
	if (options.id) notifiybar.id = options.id.split(" ")[0];
	if (options.selector) options.selector.split(" ").forEach(selector => {if(selector) notifiybar.classList.add(selector);});
	if (options.css) BDfunctionsDevilBro.appendLocalStyle("customNotificationsBarDevilBro" + id, options.css);
	if (options.html === true) notifiybarinner.innerHTML = content;
	else {
		var urltest = document.createElement("a");
		var newcontent = [];
		for (let word of content.split(" ")) {
			let encodedword = BDfunctionsDevilBro.encodeToHTML(word);
			urltest.href = word;
			newcontent.push((urltest.host && urltest.host != window.location.host) ? `<label class="textLink-3eOiS-">${encodedword}</label>` : encodedword);
		}
		notifiybarinner.innerHTML = newcontent.join(" ");
	}
	
	var type = null;
	if (options.type) {
		var types = {
			"brand":		"noticeBrand-3o3fQA",
			"danger":		"noticeDanger-1SIxaf",
			"default":		"noticeDefault-16Om2m",
			"facebook":		"noticeFacebook-1eAoSW",
			"info":			"noticeInfo-3v29SJ",
			"premium":		"noticePremium-2x9Tv2",
			"spotify":		"noticeSpotify-27AKmv flex-3B1Tl4 alignCenter-3VxkQP justifyCenter-29N31w",
			"streamer":		"noticeStreamerMode-1OlfKV",
			"success":		"noticeSuccess-P1EnBb"
		};
		if (type = types[options.type]) type.split(" ").forEach(selector => {if(selector) notifiybar.classList.add(selector);});
		if (options.type == "premium") {
			var button = notifiybar.querySelector(".button-2TvR03");
			if (button) button.classList.add("premiumAction-2lj9ha");
			notifiybarinner.classList.add("premiumText-2gecpf");
			$(`<i class="premiumLogo-2PV9qw"></i>`).insertBefore(notifiybarinner);
		}
	}
	if (!type) {
		var comp = BDfunctionsDevilBro.color2COMP(options.color);
		var color = comp && comp[0] > 180 && comp[1] > 180 && comp[2] > 180 ? "#000" : "#FFF";
		var bgColor = comp ? BDfunctionsDevilBro.color2HEX(comp) : "#F26522";
		var dismissFilter = comp && comp[0] > 180 && comp[1] > 180 && comp[2] > 180 ? "brightness(0%)" : "brightness(100%)";
		BDfunctionsDevilBro.appendLocalStyle("customNotificationsBarColorCorrectionDevilBro" + id, 
			`.DevilBro-notice.notice-${id} {
				background-color: ${bgColor} !important;
			}
			.DevilBro-notice.notice-${id} .notice-message {
				color: ${color} !important;
			}
			.DevilBro-notice.notice-${id} .button-2TvR03 {
				color: ${color} !important;
				border-color: ${color} !important;
			}
			.DevilBro-notice.notice-${id} .button-2TvR03:hover {
				color: ${bgColor} !important;
				background-color: ${color} !important;
			}
			.DevilBro-notice.notice-${id} .dismiss-1QjyJW {
				filter: ${dismissFilter} !important;
			}`);
	}
	$(notifiybar).on("click", ".dismiss-1QjyJW", () => {
		$(notifiybar).slideUp({complete: () => {
			BDfunctionsDevilBro.removeLocalStyle("customNotificationsBarDevilBro" + id);
			BDfunctionsDevilBro.removeLocalStyle("customNotificationsBarColorCorrectionDevilBro" + id);
			notifiybar.remove();
		}});
	});
	
	return notifiybar;
};

// Plugins/Themes folder resolver from Square
BDfunctionsDevilBro.getPluginsFolder = function () {
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

BDfunctionsDevilBro.getThemesFolder = function () {
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

BDfunctionsDevilBro.createUpdateButton = function () {
	var updateButton = document.createElement("button");
	updateButton.className = "bd-pfbtn bd-updatebtn";
	updateButton.innerText = "Check for Updates";
	updateButton.onclick = function () {
		BDfunctionsDevilBro.checkAllUpdates();
	};			
	updateButton.onmouseenter = function () {
		BDfunctionsDevilBro.createTooltip("Only checks for updates of plugins, which support the updatecheck. Rightclick for a list.", updateButton, {type:"top",selector:"update-button-tooltip"});
		
	};
	updateButton.oncontextmenu = function () {
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

BDfunctionsDevilBro.checkAllUpdates = function () {
	for (let key in window.PluginUpdates.plugins) {
		let plugin = window.PluginUpdates.plugins[key];
		BDfunctionsDevilBro.checkUpdate(plugin.name, plugin.raw);
	}
};

BDfunctionsDevilBro.translatePlugin = function (plugin) {
	if (typeof plugin.setLabelsByLanguage === "function" || typeof plugin.changeLanguageStrings === "function") {
		var translateInterval = setInterval(() => {
			if (document.querySelector("html").lang) {
				clearInterval(translateInterval);
				var language = BDfunctionsDevilBro.getDiscordLanguage();
				if (typeof plugin.setLabelsByLanguage === "function") 		plugin.labels = plugin.setLabelsByLanguage(language.id);
				if (typeof plugin.changeLanguageStrings === "function") 	plugin.changeLanguageStrings();
				if (!plugin.appReload) {
					console.log(BDfunctionsDevilBro.getLibraryStrings().toast_plugin_translated.replace("${pluginName}", plugin.getName()).replace("${ownlang}", language.ownlang));
				}
			}
		},100);
	}
};

BDfunctionsDevilBro.languages = {
	"$discord":	{name:"Discord (English (US))",		id:"en-US",		ownlang:"English (US)",				integrated:false,		dic:false,		deepl:false},
	"af":		{name:"Afrikaans",					id:"af",		ownlang:"Afrikaans",				integrated:false,		dic:true,		deepl:false},
	"sq":		{name:"Albanian",					id:"sq",		ownlang:"Shqiptar",					integrated:false,		dic:false,		deepl:false},
	"am":		{name:"Amharic",					id:"am",		ownlang:"አማርኛ",					integrated:false,		dic:false,		deepl:false},
	"ar":		{name:"Arabic",						id:"ar",		ownlang:"اللغة العربية",			integrated:false,		dic:false,		deepl:false},
	"hy":		{name:"Armenian",					id:"hy",		ownlang:"Հայերեն",					integrated:false,		dic:false,		deepl:false},
	"az":		{name:"Azerbaijani",				id:"az",		ownlang:"آذربایجان دیلی",			integrated:false,		dic:false,		deepl:false},
	"eu":		{name:"Basque",						id:"eu",		ownlang:"Euskara",					integrated:false,		dic:false,		deepl:false},
	"be":		{name:"Belarusian",					id:"be",		ownlang:"Беларуская",				integrated:false,		dic:false,		deepl:false},
	"bn":		{name:"Bengali",					id:"bn",		ownlang:"বাংলা",						integrated:false,		dic:false,		deepl:false},
	"bs":		{name:"Bosnian",					id:"bs",		ownlang:"Босански",					integrated:false,		dic:false,		deepl:false},
	"bg":		{name:"Bulgarian",					id:"bg",		ownlang:"български",				integrated:true,		dic:false,		deepl:false},
	"my":		{name:"Burmese",					id:"my",		ownlang:"မြန်မာစာ",					integrated:false,		dic:false,		deepl:false},
	"ca":		{name:"Catalan",					id:"ca",		ownlang:"Català",					integrated:false,		dic:false,		deepl:false},
	"ceb":		{name:"Cebuano",					id:"ceb",		ownlang:"Bisaya",					integrated:false,		dic:false,		deepl:false},
	"ny":		{name:"Chewa",						id:"ny",		ownlang:"Nyanja",					integrated:false,		dic:false,		deepl:false},
	"zh-HK":	{name:"Chinese (Hong Kong)",		id:"zh-HK",		ownlang:"香港中文",					integrated:false,		dic:false,		deepl:false},
	"zh-CN":	{name:"Chinese (Simplified)",		id:"zh-CN",		ownlang:"简体中文",					integrated:false,		dic:false,		deepl:false},
	"zh-TW":	{name:"Chinese (Traditional)",		id:"zh-TW",		ownlang:"繁體中文",					integrated:true,		dic:false,		deepl:false},
	"co":		{name:"Corsican",					id:"co",		ownlang:"Corsu",					integrated:false,		dic:false,		deepl:false},
	"hr":		{name:"Croatian",					id:"hr",		ownlang:"Hrvatski",					integrated:true,		dic:false,		deepl:false},
	"cs":		{name:"Czech",						id:"cs",		ownlang:"Čeština",					integrated:true,		dic:false,		deepl:false},
	"da":		{name:"Danish",						id:"da",		ownlang:"Dansk",					integrated:true,		dic:true,		deepl:false},
	"nl":		{name:"Dutch",						id:"nl",		ownlang:"Nederlands",				integrated:true,		dic:true,		deepl:true},
	"en":		{name:"English",					id:"en",		ownlang:"English",					integrated:false,		dic:true,		deepl:true},
	"en-GB":	{name:"English (UK)",				id:"en-GB",		ownlang:"English (UK)",				integrated:true,		dic:true,		deepl:false},
	"en-US":	{name:"English (US)",				id:"en-US",		ownlang:"English (US)",				integrated:true,		dic:true,		deepl:false},
	"eo":		{name:"Esperanto",					id:"eo",		ownlang:"Esperanto",				integrated:false,		dic:false,		deepl:false},
	"et":		{name:"Estonian",					id:"et",		ownlang:"Eesti",					integrated:false,		dic:false,		deepl:false},
	"fil":		{name:"Filipino",					id:"fil",		ownlang:"Wikang Filipino",			integrated:false,		dic:false,		deepl:false},
	"fi":		{name:"Finnish",					id:"fi",		ownlang:"Suomi",					integrated:true,		dic:false,		deepl:false},
	"fr":		{name:"French",						id:"fr",		ownlang:"Français",					integrated:true,		dic:true,		deepl:true},
	"fr-CA":	{name:"French (Canadian)",			id:"fr-CA",		ownlang:"Français Canadien",		integrated:false,		dic:false,		deepl:false},
	"fy":		{name:"Frisian",					id:"fy",		ownlang:"Frysk",					integrated:false,		dic:false,		deepl:false},
	"gl":		{name:"Galician",					id:"gl",		ownlang:"Galego",					integrated:false,		dic:false,		deepl:false},
	"ka":		{name:"Georgian",					id:"ka",		ownlang:"ქართული",				integrated:false,		dic:false,		deepl:false},
	"de":		{name:"German",						id:"de",		ownlang:"Deutsch",					integrated:true,		dic:true,		deepl:true},
	"de-AT":	{name:"German (Austria)",			id:"de-AT",		ownlang:"Österreichisch Deutsch",	integrated:false,		dic:false,		deepl:false},
	"de-CH":	{name:"German (Switzerland)",		id:"de-CH",		ownlang:"Schweizerdeutsch",			integrated:false,		dic:false,		deepl:false},
	"el":		{name:"Greek",						id:"el",		ownlang:"Ελληνικά",					integrated:false,		dic:false,		deepl:false},
	"gu":		{name:"Gujarati",					id:"gu",		ownlang:"ગુજરાતી",					integrated:false,		dic:false,		deepl:false},
	"ht":		{name:"Haitian Creole",				id:"ht",		ownlang:"Kreyòl Ayisyen",			integrated:false,		dic:false,		deepl:false},
	"ha":		{name:"Hausa",						id:"ha",		ownlang:"حَوْسَ",						integrated:false,		dic:false,		deepl:false},
	"haw":		{name:"Hawaiian",					id:"haw",		ownlang:"ʻŌlelo Hawaiʻi",			integrated:false,		dic:false,		deepl:false},
	"iw":		{name:"Hebrew",						id:"iw",		ownlang:"עברית",					integrated:false,		dic:false,		deepl:false},
	"hi":		{name:"Hindi",						id:"hi",		ownlang:"हिन्दी",						integrated:false,		dic:false,		deepl:false},
	"hmn":		{name:"Hmong",						id:"hmn",		ownlang:"lol Hmongb",				integrated:false,		dic:false,		deepl:false},
	"hu":		{name:"Hungarain",					id:"hu",		ownlang:"Magyar",					integrated:false,		dic:false,		deepl:false},
	"is":		{name:"Icelandic",					id:"is",		ownlang:"Íslenska",					integrated:false,		dic:false,		deepl:false},
	"ig":		{name:"Igbo",						id:"ig",		ownlang:"Asụsụ Igbo",				integrated:false,		dic:false,		deepl:false},
	"id":		{name:"Indonesian",					id:"id",		ownlang:"Bahasa Indonesia",			integrated:false,		dic:false,		deepl:false},
	"ga":		{name:"Irish",						id:"ga",		ownlang:"Gaeilge",					integrated:false,		dic:false,		deepl:false},
	"it":		{name:"Italian",					id:"it",		ownlang:"Italiano",					integrated:true,		dic:true,		deepl:true},
	"ja":		{name:"Japanese",					id:"ja",		ownlang:"日本語",					integrated:true,		dic:false,		deepl:false},
	"jv":		{name:"Javanese",					id:"jv",		ownlang:"ꦧꦱꦗꦮ",					integrated:false,		dic:false,		deepl:false},
	"kn":		{name:"Kannada",					id:"kn",		ownlang:"ಕನ್ನಡ",						integrated:false,		dic:false,		deepl:false},
	"kk":		{name:"Kazakh",						id:"kk",		ownlang:"Қазақ Tілі",				integrated:false,		dic:false,		deepl:false},
	"km":		{name:"Khmer",						id:"km",		ownlang:"ភាសាខ្មែរ",					integrated:false,		dic:false,		deepl:false},
	"ko":		{name:"Korean",						id:"ko",		ownlang:"한국어",					integrated:true,		dic:false,		deepl:false},
	"ku":		{name:"Kurdish",					id:"ku",		ownlang:"کوردی",					integrated:false,		dic:false,		deepl:false},
	"ky":		{name:"Kyrgyz",						id:"ky",		ownlang:"кыргызча",					integrated:false,		dic:false,		deepl:false},
	"lo":		{name:"Lao",						id:"lo",		ownlang:"ພາສາລາວ",					integrated:false,		dic:false,		deepl:false},
	"la":		{name:"Latin",						id:"la",		ownlang:"Latina",					integrated:false,		dic:false,		deepl:false},
	"lv":		{name:"Latvian",					id:"lv",		ownlang:"Latviešu",					integrated:false,		dic:false,		deepl:false},
	"lt":		{name:"Lithuanian",					id:"lt",		ownlang:"Lietuvių",					integrated:false,		dic:false,		deepl:false},
	"lb":		{name:"Luxembourgish",				id:"lb",		ownlang:"Lëtzebuergesch",			integrated:false,		dic:false,		deepl:false},
	"mk":		{name:"Macedonian",					id:"mk",		ownlang:"Mакедонски",				integrated:false,		dic:false,		deepl:false},
	"mg":		{name:"Malagasy",					id:"mg",		ownlang:"Malagasy",					integrated:false,		dic:false,		deepl:false},
	"ms":		{name:"Malay",						id:"ms",		ownlang:"بهاس ملايو",				integrated:false,		dic:false,		deepl:false},
	"ml":		{name:"Malayalam",					id:"ml",		ownlang:"മലയാളം",					integrated:false,		dic:false,		deepl:false},
	"mt":		{name:"Maltese",					id:"mt",		ownlang:"Malti",					integrated:false,		dic:false,		deepl:false},
	"mi":		{name:"Maori",						id:"mi",		ownlang:"te Reo Māori",				integrated:false,		dic:false,		deepl:false},
	"mr":		{name:"Marathi",					id:"mr",		ownlang:"मराठी",						integrated:false,		dic:false,		deepl:false},
	"mn":		{name:"Mongolian",					id:"mn",		ownlang:"Монгол Хэл",				integrated:false,		dic:false,		deepl:false},
	"ne":		{name:"Nepali",						id:"ne",		ownlang:"नेपाली",						integrated:false,		dic:false,		deepl:false},
	"no":		{name:"Norwegian",					id:"no",		ownlang:"Norsk",					integrated:true,		dic:false,		deepl:false},
	"ps":		{name:"Pashto",						id:"ps",		ownlang:"پښتو",						integrated:false,		dic:false,		deepl:false},
	"fa":		{name:"Persian",					id:"fa",		ownlang:"فارسی",					integrated:false,		dic:false,		deepl:false},
	"pl":		{name:"Polish",						id:"pl",		ownlang:"Polski",					integrated:true,		dic:false,		deepl:true},
	"pt":		{name:"Portuguese",					id:"pt",		ownlang:"Português",				integrated:false,		dic:true,		deepl:false},
	"pt-BR":	{name:"Portuguese (Brazil)",		id:"pt-BR",		ownlang:"Português do Brasil",		integrated:true,		dic:true,		deepl:false},
	"pt-PT":	{name:"Portuguese (Portugal)",		id:"pt-PT",		ownlang:"Português do Portugal",	integrated:false,		dic:false,		deepl:false},
	"pa":		{name:"Punjabi",					id:"pa",		ownlang:"पंजाबी",						integrated:false,		dic:false,		deepl:false},
	"ro":		{name:"Romanian",					id:"ro",		ownlang:"Română",					integrated:false,		dic:false,		deepl:false},
	"ru":		{name:"Russian",					id:"ru",		ownlang:"Pусский",					integrated:true,		dic:false,		deepl:false},
	"sm":		{name:"Samoan",						id:"sm",		ownlang:"Gagana Sāmoa",				integrated:false,		dic:false,		deepl:false},
	"gd":		{name:"Scottish Gaelic",			id:"gd",		ownlang:"Gàidhlig",					integrated:false,		dic:false,		deepl:false},
	"sr":		{name:"Serbian",					id:"sr",		ownlang:"Српски",					integrated:false,		dic:false,		deepl:false},
	"st":		{name:"Sotho",						id:"st",		ownlang:"Sesotho",					integrated:false,		dic:false,		deepl:false},
	"sn":		{name:"Shona",						id:"sn",		ownlang:"Shona",					integrated:false,		dic:false,		deepl:false},
	"sd":		{name:"Sindhi",						id:"sd",		ownlang:"سنڌي",						integrated:false,		dic:false,		deepl:false},
	"si":		{name:"Sinhala",					id:"si",		ownlang:"සිංහල",					integrated:false,		dic:false,		deepl:false},
	"sk":		{name:"Slovak",						id:"sk",		ownlang:"Slovenčina",				integrated:false,		dic:false,		deepl:false},
	"sl":		{name:"Slovenian",					id:"sl",		ownlang:"Slovenščina",				integrated:false,		dic:false,		deepl:false},
	"es":		{name:"Spanish",					id:"es",		ownlang:"Español",					integrated:true,		dic:true,		deepl:true},
	"es-419":	{name:"Spanish (Latin America)",	id:"es-419",	ownlang:"Español latinoamericano",	integrated:false,		dic:false,		deepl:false},
	"sw":		{name:"Swahili",					id:"sw",		ownlang:"Kiswahili",				integrated:false,		dic:false,		deepl:false},
	"sv":		{name:"Swedish",					id:"sv",		ownlang:"Svenska",					integrated:true,		dic:true,		deepl:false},
	"tg":		{name:"Tajik",						id:"tg",		ownlang:"тоҷикӣ",					integrated:false,		dic:false,		deepl:false},
	"ta":		{name:"Tamil",						id:"ta",		ownlang:"தமிழ்",						integrated:false,		dic:false,		deepl:false},
	"te":		{name:"Telugu",						id:"te",		ownlang:"తెలుగు",					integrated:false,		dic:false,		deepl:false},
	"th":		{name:"Thai",						id:"th",		ownlang:"ภาษาไทย",					integrated:false,		dic:false,		deepl:false},
	"tr":		{name:"Turkish",					id:"tr",		ownlang:"Türkçe",					integrated:true,		dic:false,		deepl:false},
	"uk":		{name:"Ukrainian",					id:"uk",		ownlang:"Yкраїнський",				integrated:true,		dic:false,		deepl:false},
	"ur":		{name:"Urdu",						id:"ur",		ownlang:"اُردُو",						integrated:false,		dic:false,		deepl:false},
	"uz":		{name:"Uzbek",						id:"uz",		ownlang:"اوزبیک",					integrated:false,		dic:false,		deepl:false},
	"vi":		{name:"Vietnamese",					id:"vi",		ownlang:"Tiếng Việt Nam",			integrated:false,		dic:false,		deepl:false},
	"cy":		{name:"Welsh",						id:"cy",		ownlang:"Cymraeg",					integrated:false,		dic:false,		deepl:false},
	"xh":		{name:"Xhosa",						id:"xh",		ownlang:"Xhosa",					integrated:false,		dic:false,		deepl:false},
	"yi":		{name:"Yiddish",					id:"yi",		ownlang:"ייִדיש ייִדיש‬",				integrated:false,		dic:false,		deepl:false},
	"yo":		{name:"Yoruba",						id:"yo",		ownlang:"Èdè Yorùbá",				integrated:false,		dic:false,		deepl:false},
	"zu":		{name:"Zulu",						id:"zu",		ownlang:"Zulu",						integrated:false,		dic:false,		deepl:false}
};
				
(() => {
var pulling = setInterval(() => {
		var languageID = document.querySelector("html").lang;
		if (languageID) {
			clearInterval(pulling);
			BDfunctionsDevilBro.languages.$discord.name = "Discord (" + BDfunctionsDevilBro.languages[languageID].name + ")";
			BDfunctionsDevilBro.languages.$discord.id = BDfunctionsDevilBro.languages[languageID].id;
			BDfunctionsDevilBro.languages.$discord.ownlang = BDfunctionsDevilBro.languages[languageID].ownlang;
		}
	},100);
})();

BDfunctionsDevilBro.getDiscordBuilt = function () {
	return require(require('electron').remote.app.getAppPath() + "/build_info.json").releaseChannel.toLowerCase();
};

BDfunctionsDevilBro.getDiscordVersion = function () {
	return require(require('electron').remote.app.getAppPath() + "/build_info.json").version.toLowerCase();
};

BDfunctionsDevilBro.getDiscordLanguage = function () {
	var languageCode = document.querySelector("html").lang || "en-US";
	var codeParts = languageCode.split("-");
	var prefix = codeParts[0];
	var suffix = codeParts[1] ? codeParts[1] : "";
	languageCode = suffix && prefix.toUpperCase() != suffix.toUpperCase() ? prefix + "-" + suffix : prefix;
	return BDfunctionsDevilBro.languages[languageCode] || BDfunctionsDevilBro.languages["en-US"];
};

BDfunctionsDevilBro.getDiscordTheme = function () {
	if ($(".theme-light").length > $(".theme-dark").length) return "theme-light";
	else return "theme-dark";
};
	
BDfunctionsDevilBro.getReactInstance = function (node) { 
	if (!node) return null;
	return node[Object.keys(node).find((key) => key.startsWith("__reactInternalInstance"))];
};

BDfunctionsDevilBro.getOwnerInstance = function (config) { 
	if (config === undefined) return null;
	if (!config.node || (!config.name && (!config.props || !Array.isArray(config.props)))) return null;
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
				
				if (config.name && ele.type && (ele.type.displayName === config.name || ele.type.name === config.name)) {
					result = ele.stateNode;
				}
				else if (config.props && ele.stateNode && config.props.every(prop => ele.stateNode[prop] !== undefined)) {
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
	var maxTime = config.time === undefined ? 30 : config.time;
		
	var keyWhiteList = {
		"props":true,
		"state":true,
		"stateNode":true,
		"refs":true,
		"updater":true,
		"children": config.up ? false : true,
		"type":true,
		"memoizedProps":true,
		"memoizedState":true,
		"child": config.up ? false : true,
		"return": config.up ? true : false,
		"sibling": config.up ? false : true,
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
BDfunctionsDevilBro.WebModules.find = function (filter) {
	const req = webpackJsonp([], {"__extra_id__": (module, exports, req) => exports.default = req}, ["__extra_id__"]).default;
	delete req.c["__extra_id__"];
	for (let i in req.c) { 
		if (req.c.hasOwnProperty(i)) {
			let m = req.c[i].exports;
			if (m && m.__esModule && m.default && filter(m.default)) return m.default;
			if (m && filter(m)) return m;
		}
	}
};

BDfunctionsDevilBro.WebModules.findByProperties = function (properties) {
	return BDfunctionsDevilBro.WebModules.find((module) => properties.every(prop => module[prop] !== undefined));
};

BDfunctionsDevilBro.WebModules.findByName = function (name) {
	return BDfunctionsDevilBro.WebModules.find((module) => module.displayName === name);
};

BDfunctionsDevilBro.WebModules.findByPrototypes = function (prototypes) {
	return BDfunctionsDevilBro.WebModules.find((module) => module.prototype && prototypes.every(proto => module.prototype[proto] !== undefined));
};

BDfunctionsDevilBro.WebModules.addListener = function (internalModule, moduleFunction, callback) {
	if (typeof internalModule !== "object" || !moduleFunction || typeof callback !== "function") return;
	if (!internalModule[moduleFunction] || typeof(internalModule[moduleFunction]) !== "function") return;
	if (!internalModule.__internalListeners) internalModule.__internalListeners = {};
	if (!internalModule.__internalListeners[moduleFunction]) internalModule.__internalListeners[moduleFunction] = new Set();
	
	if (!internalModule.__listenerPatches) internalModule.__listenerPatches = {};
	if (!internalModule.__listenerPatches[moduleFunction]) {
		internalModule.__listenerPatches[moduleFunction] = BDfunctionsDevilBro.WebModules.monkeyPatch(internalModule, moduleFunction, {after: (data) => {
			for (let listener of internalModule.__internalListeners[moduleFunction]) listener();
		}});
	}

	internalModule.__internalListeners[moduleFunction].add(callback);
};

BDfunctionsDevilBro.WebModules.removeListener = function (internalModule, moduleFunction, callback) {
	if (typeof internalModule !== "object" || !moduleFunction || typeof callback !== "function") return;
	if (!internalModule[moduleFunction] || typeof(internalModule[moduleFunction]) !== "function") return;
	if (!internalModule.__internalListeners || !internalModule.__internalListeners[moduleFunction] || !internalModule.__internalListeners[moduleFunction].size) return;
	
	internalModule.__internalListeners[moduleFunction].delete(callback);
	
	if (!internalModule.__internalListeners[moduleFunction].size) {
		internalModule.__listenerPatches[moduleFunction]();
		delete internalModule.__listenerPatches[moduleFunction];
	}
};

BDfunctionsDevilBro.WebModules.monkeyPatch = function (internalModule, moduleFunction, {before, after, instead, once = false, silent = false} = options) {
	const origMethod = internalModule[moduleFunction];
	const cancel = function () {
		internalModule[moduleFunction] = origMethod;
	};
	const suppressErrors = (method, desiption) => (...params) => {
		try {
			return method(...params);
		}
		catch (e) {
			console.error('Error occurred in ' + desiption, e);
		}
	};
	internalModule[moduleFunction] = function () {
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

BDfunctionsDevilBro.WebModules.findFunction = function (filter) {
	const req = webpackJsonp([], {"__extra_id__": (module, exports, req) => exports.default = req}, ["__extra_id__"]).default;
	delete req.c["__extra_id__"];
	for (let i in req.m) { 
		if (req.m.hasOwnProperty(i)) {
			let m = req.m[i];
			if (m && m.__esModule && m.default && filter(m.default)) return {func:m.default,id:i};
			if (m && filter(m)) return {func:m,id:i,array:req.m};
		}
	}
	return null;
};

BDfunctionsDevilBro.WebModules.patchFunction = function (newOutput, index) {
	const req = webpackJsonp([], {"__extra_id__": (module, exports, req) => exports.default = req}, ["__extra_id__"]).default;
	try {
		var output = {};
		var oldFunction = req.m[index];
		oldFunction(output,{},req);
		var oldOutput = output.exports;
		req.c[index] = {
			id: index,
			loaded: true,
			exports: (...params) => {return newOutput(...params) || oldOutput(...params);}
		};
		return function () {
			req.m[index] = oldFunction;
			req.c[index] = {
				id: index,
				loaded: true,
				exports: oldOutput
			};
		};
	}
	catch (err) {
		console.warn("BDfunctionsDevilBro: Could not patch Function. Error: " + err);
	}
};

BDfunctionsDevilBro.addOnSwitchListener = function (plugin) {
	if (typeof plugin.onSwitch === "function") {
		BDfunctionsDevilBro.removeOnSwitchListener(plugin);
		if (!BDfunctionsDevilBro.zacksFork()) {
			plugin.onSwitch = plugin.onSwitch.bind(plugin);
			require("electron").remote.getCurrentWindow().webContents.addListener("did-navigate-in-page", plugin.onSwitch);
		}
		var chatspacer = document.querySelector(".guilds-wrapper + * > .spacer-3Dkonz");
		if (chatspacer) {
			plugin.onSwitchFix = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.classList && (node.classList.contains("chat") || node.classList.contains("noChannel-2EQ0a9"))) {
									attributeObserver.observe(node, {attributes:true});
								}
							});
						}
					}
				);
			});
			plugin.onSwitchFix.observe(chatspacer, {childList:true});
			
			var attributeObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.target && change.target.classList && change.target.classList.contains("noChannel-2EQ0a9")) plugin.onSwitch();
					}
				);
			});
			var chat = chatspacer.querySelector(".chat, .noChannel-2EQ0a9");
			if (chat) attributeObserver.observe(chat, {attributes:true});
		}
	}
};

BDfunctionsDevilBro.removeOnSwitchListener = function (plugin) {
	if (typeof plugin.onSwitch === "function") {
		if (!BDfunctionsDevilBro.zacksFork()) {
			require("electron").remote.getCurrentWindow().webContents.removeListener("did-navigate-in-page", plugin.onSwitch);
		}
		if (typeof plugin.onSwitchFix === "object") plugin.onSwitchFix.disconnect();
	}
};

BDfunctionsDevilBro.addReloadListener = function (plugin) {
	if (typeof plugin.initialize === "function") {
		BDfunctionsDevilBro.removeReloadListener(plugin);
		var appwindow = document.querySelector(".app-XZYfmp");
		if (appwindow) {
			plugin.reloadFix = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.classList && node.classList.contains("app")) {
									if (window.PluginUpdates && window.PluginUpdates.observer) {
										window.PluginUpdates.observer.disconnect();
										delete window.PluginUpdates.observer;
									}
									plugin.appReload = true;
									plugin.initialize();
								}
							});
						}
					}
				);
			});
			plugin.reloadFix.observe(appwindow, {childList:true});
		}
	}
};

BDfunctionsDevilBro.removeReloadListener = function (plugin) {
	if (typeof plugin.initialize === "function") {
		if (typeof plugin.reloadFix === "object") plugin.reloadFix.disconnect();
	}
};

BDfunctionsDevilBro.getLanguageTable = function (lang) {
	var ti = {
		"bg":		"холандски",		//bulgarian
		"cs":		"Nizozemština",		//czech
		"da":		"Hollandsk",		//danish
		"de":		"Niederländisch",	//german
		"el":		"Ολλανδικά",		//greek
		"en-GB":	"Dutch",			//english
		"en-US":	"Dutch",			//english
		"es":		"Holandés",			//spanish
		"fi":		"hollanti",			//finnish
		"fr":		"Néerlandais",		//french
		"hr":		"Nizozemski",		//croatian
		"hu":		"Holland",			//hungarian
		"it":		"Olandese",			//italian
		"ja":		"オランダ語",			//japanese
		"ko":		"네덜란드어",			//korean
		"lt":		"Olandų",			//lithuanian
		"nl":		"Nederlands",		//dutch
		"no":		"Nederlandsk",		//norwegian
		"pl":		"Holenderski",		//polish
		"pt-BR":	"Holandês",			//portuguese(brazil)
		"ro":		"Olandeză",			//romanian
		"ru":		"Голландский",		//russian
		"sv":		"Holländska",		//swedish
		"tr":		"Flemenkçe",		//turkish
		"uk":		"Нідерландська",	//ukranian
		"zh-CN":	"荷兰语",			//chinese(china)
		"zh-TW":	"荷蘭文"				//chinese(traditional)
	};
	lang = lang ? lang : BDfunctionsDevilBro.getDiscordLanguage().id;
	return BDfunctionsDevilBro.WebModules.find(function (m) {
		return m.nl === ti[lang];
	});
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

BDfunctionsDevilBro.filterObject = function (obj, predicate) {
return Object.keys(obj).filter(key => predicate(obj[key])).reduce((res, key) => (res[key] = obj[key], res), {});
};

BDfunctionsDevilBro.isObjectEmpty = function (obj) {
	return typeof obj !== "object" || Object.getOwnPropertyNames(obj).length == 0;
};

BDfunctionsDevilBro.removeFromArray = function (array, value) {
	if (!array || !value || !Array.isArray(array) || !array.includes(value)) return;
	array.splice(array.indexOf(value), 1);
};

(() => {
var pulling = setInterval(() => {
		var UserActions = BDfunctionsDevilBro.WebModules.findByProperties(["getCurrentUser"]);
		var userData = UserActions && typeof UserActions.getCurrentUser == "function" ? UserActions.getCurrentUser() : null;
		if (userData && !BDfunctionsDevilBro.isObjectEmpty(userData)) {
			clearInterval(pulling);
			BDfunctionsDevilBro.myData = userData;
		}
	},100);
})();

BDfunctionsDevilBro.getMyUserStatus = function () {
	var userStatus = "invisible";
	var status = document.querySelector(".container-iksrDt .status");
	if (status) userStatus = status.classList[1].split("-")[1];
	return userStatus;
};

BDfunctionsDevilBro.readServerList = function () {
	var server, id, info, foundServers = [], GuildStore = BDfunctionsDevilBro.WebModules.findByProperties(["getGuilds"]);
	for (server of document.querySelectorAll(".guild-separator ~ .guild")) {
		id = BDfunctionsDevilBro.getIdOfServer(server);
		info = id ? GuildStore.getGuild(id) : null;
		if (info) foundServers.push(Object.assign({},info,{div:server,data:info}));
	}
	return foundServers;
};

BDfunctionsDevilBro.readUnreadServerList = function (servers) {
	var serverObj, foundServers = [];
	for (serverObj of (servers === undefined || !Array.isArray(servers) ? BDfunctionsDevilBro.readServerList() : servers)) {
		if (serverObj && serverObj.div && (serverObj.div.classList.contains("unread") || serverObj.div.querySelector(".badge"))) foundServers.push(serverObj);
	}
	return foundServers;
};

BDfunctionsDevilBro.getSelectedServer = function () {
	var server, info, GuildStore = BDfunctionsDevilBro.WebModules.findByProperties(["getGuilds"]);
	for (server of document.querySelectorAll(".guild-separator ~ .guild.selected")) {
		id = BDfunctionsDevilBro.getIdOfServer(server);
		info = id ? GuildStore.getGuild(id) : null;
		if (info) return Object.assign({},info,{div:server,data:info});
	}
	return null;
};

BDfunctionsDevilBro.getIdOfServer = function (server) {
	if (!server || !server.classList || !server.classList.contains("guild") || server.classList.contains("copy") || server.classList.contains("folder")) return;
	var switchlink, id;
	switchlink = server.querySelector("a");
	id = switchlink && switchlink.href ? switchlink.href.split("/") : null;
	return id && id.length > 3 && !isNaN(parseInt(id[4])) ? id[4] : null;
};

BDfunctionsDevilBro.getDivOfServer = function (id) {
	for (var serverObj of BDfunctionsDevilBro.readServerList()) {
		if (serverObj && serverObj.id == id) return serverObj;
	}
	return null;
};

BDfunctionsDevilBro.readChannelList = function () {
	var channel, info, foundChannels = [], ChannelStore = BDfunctionsDevilBro.WebModules.findByProperties(["getChannels"]);
	for (channel of document.querySelectorAll(".containerDefault-7RImuF, .containerDefault-1bbItS")) {
		info = BDfunctionsDevilBro.getKeyInformation({"node":channel, "key":"channel"});
		if (info) info = ChannelStore.getChannel(info.id);
		if (info) foundChannels.push(Object.assign({},info,{div:channel,data:info}));
	}
	for (channel of document.querySelectorAll(".channel.private")) {
		info = BDfunctionsDevilBro.getKeyInformation({"node":channel, "key":"user"}) || BDfunctionsDevilBro.getKeyInformation({"node":channel, "key":"channel"});
		if (info) info = ChannelStore.getChannel(ChannelStore.getDMFromUserId(info.id)) || ChannelStore.getChannel(info.id)
		if (info) foundChannels.push(Object.assign({},info,{div:channel,data:info}));
	}
	return foundChannels;
};

BDfunctionsDevilBro.getSelectedChannel = function () {
	var channel, info, ChannelStore = BDfunctionsDevilBro.WebModules.findByProperties(["getChannels"]);
	for (channel of document.querySelectorAll(".wrapperSelectedText-31jJa8")) {
		info = BDfunctionsDevilBro.getKeyInformation({"node":channel.parentElement, "key":"channel"});
		if (info) info = ChannelStore.getChannel(info.id);
		if (info) return Object.assign({},info,{div:channel,data:info});
	}
	for (channel of document.querySelectorAll(".channel.private.selected")) {
		info = BDfunctionsDevilBro.getKeyInformation({"node":channel, "key":"user"}) || BDfunctionsDevilBro.getKeyInformation({"node":channel, "key":"channel"});
		if (info) info = ChannelStore.getChannel(ChannelStore.getDMFromUserId(info.id)) || ChannelStore.getChannel(info.id)
		if (info) return Object.assign({},info,{div:channel,data:info});
	}
	info = BDfunctionsDevilBro.getKeyInformation({"node":document.querySelector(".chat"), "key":"channel"});
	if (info) info = ChannelStore.getChannel(info.id)
	if (info) return Object.assign({},info,{div:null,data:info});
	return null;
};

BDfunctionsDevilBro.getDivOfChannel = function (id) {
	for (var channelObj of BDfunctionsDevilBro.readChannelList()) {
		if (channelObj && channelObj.id == id) return channelObj;
	}
	return null;
};

BDfunctionsDevilBro.readDmList = function () {
	var dm, info, foundDMs = [], ChannelStore = BDfunctionsDevilBro.WebModules.findByProperties(["getChannels"]);
	for (dm of document.querySelectorAll(".dms > .guild")) {
		id = BDfunctionsDevilBro.getIdOfDM(dm);
		info = id ? ChannelStore.getChannel(id) : null;
		if (info) foundDMs.push(Object.assign({},info,{div:dm,data:info}));
	}
	return foundDMs;
};

BDfunctionsDevilBro.getIdOfDM = function (dm) {
	if (!dm || !dm.classList || !dm.classList.contains("guild") || dm.classList.contains("copy") || dm.classList.contains("folder")) return;
	if (!dm.parentElement || !dm.parentElement.classList || !dm.parentElement.classList("dms")) return;
	var switchlink, id;
	switchlink = dm.querySelector("a");
	id = switchlink && switchlink.href ? switchlink.href.split("/") : null;
	return id && id.length > 3 && !isNaN(parseInt(id[5])) ? id[5] : null;
};

BDfunctionsDevilBro.getDivOfDM = function (id) {
	for (var dmObj of BDfunctionsDevilBro.readDmList()) {
		if (dmObj && dmObj.id == id) return dmObj;
	}
	return null;
};

BDfunctionsDevilBro.saveAllData = function (settings, plugin, keyName) {
	bdPluginStorage.set(typeof plugin === "string" ? plugin : plugin.getName(), keyName, settings);
};

BDfunctionsDevilBro.loadAllData = function (plugin, keyName) {
	return bdPluginStorage.get(typeof plugin === "string" ? plugin : plugin.getName(), keyName) || {};
};

BDfunctionsDevilBro.removeAllData = function (plugin, keyName) {
	BDfunctionsDevilBro.saveAllData({}, plugin, keyName);
};

BDfunctionsDevilBro.getAllData = function (plugin, keyName, compareObject) {
	if (!plugin.defaults || !plugin.defaults[keyName]) return {};
	var oldData = BDfunctionsDevilBro.loadAllData(plugin, keyName), newData = {}, saveData = false;
	for (let key in plugin.defaults[keyName]) {
		if (oldData[key] == null) {
			newData[key] = plugin.defaults[keyName][key].value;
			saveData = true;
		}
		else {
			newData[key] = oldData[key];
		}
		if (typeof compareObject === "object" && compareObject && typeof compareObject[newData[key]] === "undefined") {
			newData[key] = Object.keys(compareObject)[0];
			saveData = true;
		}
	}
	if (saveData) BDfunctionsDevilBro.saveAllData(newData, plugin, keyName);
	return newData;
};

BDfunctionsDevilBro.saveData = function (id, value, plugin, keyName) {
	var data = BDfunctionsDevilBro.loadAllData(plugin, keyName);
	
	data[id] = value;
	
	BDfunctionsDevilBro.saveAllData(data, plugin, keyName);
};

BDfunctionsDevilBro.loadData = function (id, plugin, keyName) {
	var data = BDfunctionsDevilBro.loadAllData(plugin, keyName);
	
	var value = data[id];
	
	return value === undefined ? null : value;
};
	
BDfunctionsDevilBro.removeData = function (id, plugin, keyName) {
	var data = BDfunctionsDevilBro.loadAllData(plugin, keyName);
	
	delete data[id];
	
	BDfunctionsDevilBro.saveAllData(data, plugin, keyName);
};

BDfunctionsDevilBro.getData = function (id, plugin, keyName, compareObject) {
	var data = BDfunctionsDevilBro.getAllData(plugin, keyName, compareObject);
	
	var value = data[id];
	
	return value === undefined ? null : value;
};

BDfunctionsDevilBro.appendWebScript = function (filepath) {
	$('head script[src="' + filepath + '"]').remove();
	
	var ele = document.createElement("script");
	$(ele)
		.attr("src", filepath);
	$("head").append(ele);
};

BDfunctionsDevilBro.appendWebStyle = function (filepath) {
	$('head link[href="' + filepath + '"]').remove();

	var ele = document.createElement("link");
	$(ele)
		.attr("type", "text/css")
		.attr("rel", "Stylesheet")
		.attr("href", filepath);
	$("head").append(ele);
};

BDfunctionsDevilBro.appendLocalStyle = function (cssname, css) {
	$('head style[id="' + cssname + 'CSS"]').remove();

	var ele = document.createElement("style");
	$(ele)
		.attr("id", cssname + "CSS")
		.text(css);
	$("head").append(ele);
};

BDfunctionsDevilBro.removeLocalStyle = function (cssname) {
	$('head style[id="' + cssname + 'CSS"]').remove();
};

BDfunctionsDevilBro.sortArrayByKey = function (array, key, except) {
	if (except === undefined) except = null;
	return array.sort(function (a, b) {
		var x = a[key]; var y = b[key];
		if (x != except) {
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		}
	});
};

BDfunctionsDevilBro.highlightText = function (string, searchstring) {
	if (!(searchstring.length > 0)) return string;
	var added = 0, copy = string, wrapperopen = `<span class="highlight">`, wrapperclose = `</span>`;
	BDfunctionsDevilBro.getAllIndexes(string.toUpperCase(), searchstring.toUpperCase()).forEach((start) => {
		let offset = added*(wrapperopen.length + wrapperclose.length);
		start = start + offset;
		let end = start + searchstring.length;
		let openIndexes = [-1].concat(BDfunctionsDevilBro.getAllIndexes(string.substring(0, start), "<"));
		let closedIndexes = [-1].concat(BDfunctionsDevilBro.getAllIndexes(string.substring(0, start), ">"));
		if (openIndexes[openIndexes.length-1] > closedIndexes[closedIndexes.length-1]) return;
		string = string.substring(0, start) + wrapperopen + string.substring(start, end) + wrapperclose + string.substring(end);
		added++;
	});
	return string ? string : copy;
};

BDfunctionsDevilBro.getAllIndexes = function (array, val) {
	var indexes = [], i = -1;
	while ((i = array.indexOf(val, i+1)) != -1){
		indexes.push(i);
	}
	return indexes;
};

BDfunctionsDevilBro.formatBytes = function (a, b) {
	if (a == 0) return "0 Bytes";
	if (a == 1) return "1 Byte";
	var c = 1024, d = b < 1 ? 0 : b > 20 ? 20: b || 2, e = ["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"], f = Math.floor(Math.log(a)/Math.log(c));
	return parseFloat((a/Math.pow(c,f)).toFixed(d)) + " " + e[f];
};

BDfunctionsDevilBro.color2COMP = function (color) {
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

BDfunctionsDevilBro.setInnerText = function (div, text) {
	if (!div) return;
	var textNode = $(div).contents().filter(function () {return this.nodeType == Node.TEXT_NODE;})[0];
	if (textNode) textNode.textContent = text;
};
	
BDfunctionsDevilBro.getInnerText = function (div) {
	if (!div) return;
	var textNode = $(div).contents().filter(function () {return this.nodeType == Node.TEXT_NODE;})[0];
	return textNode ? textNode.textContent : undefined;
};
	
BDfunctionsDevilBro.encodeToHTML = function (string) {
	var ele = document.createElement("div");
	ele.innerText = string;
	return ele.innerHTML;
};

BDfunctionsDevilBro.regEscape = function (string) {
	return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
};

BDfunctionsDevilBro.insertNRST = function (string) {
	return string
		.replace(new RegExp(BDfunctionsDevilBro.regEscape("\\n"),"g"),"\n")
		.replace(new RegExp(BDfunctionsDevilBro.regEscape("\\r"),"g"),"\r")
		.replace(new RegExp(BDfunctionsDevilBro.regEscape("\\s"),"g")," ")
		.replace(new RegExp(BDfunctionsDevilBro.regEscape("\\t"),"g"),"\t");
};

BDfunctionsDevilBro.clearReadNotifications = function (servers) {
	var GuildActions = BDfunctionsDevilBro.WebModules.findByProperties(["markGuildAsRead"]);
	if (!servers || !GuildActions) return;
	servers = Array.isArray(servers) ? servers : Array.from(servers);
	servers.forEach((serverObj, i) => {
		if (!serverObj || !serverObj.id) return;
		GuildActions.markGuildAsRead(serverObj.id);
	}); 
};

BDfunctionsDevilBro.triggerSend = function (textarea) {
	setImmediate(() => {
		var press = new KeyboardEvent("keypress", {key: "Enter", code: "Enter", which: 13, keyCode: 13, bubbles: true});
		Object.defineProperty(press, "keyCode", {value: 13});
		Object.defineProperty(press, "which", {value: 13});
		textarea.dispatchEvent(press);
	});
};

BDfunctionsDevilBro.initElements = function (container) {
	$(container)
		.off(".BDFDBinitElements")
		.on("click.BDFDBinitElements", ".checkbox-1KYsPm", (e) => {
			var checked = e.currentTarget.checked;
			$(e.currentTarget.parentElement)
				.toggleClass("valueChecked-3Bzkbm", checked)
				.toggleClass("valueUnchecked-XR6AOk", !checked);
		})
		.on("click.BDFDBinitElements", ".checkboxWrapper-2Yvr_Y .input-oWyROL", (e) => {
			var checked = e.currentTarget.checked;
			var checkBoxStyle = e.currentTarget.parentElement.querySelector(".checkbox-1QwaS4");
			$(checkBoxStyle)
				.toggleClass("checked-2TahvT", checked)
				.css("background-color", checked ? "rgb(67, 181, 129)" : "")
				.css("border-color", checked ? "rgb(67, 181, 129)" : "")
				.find("polyline")
					.attr("stroke", checked ? "#ffffff" : "transparent");
		})
		.on("click.BDFDBinitElements", ".file-navigator", (e) => {
			var filenavigator = e.currentTarget.querySelector("input[type='file']");
			if (filenavigator) filenavigator.click();
		})
		.on("change.BDFDBinitElements", "input[type='file']", (e) => {
			var filenavigator = e.currentTarget;
			var fileoutput = e.currentTarget.parentElement.parentElement.querySelector("input[type='text']");
			var file = e.currentTarget.files[0];
			if (file && fileoutput) fileoutput.value = file.path;
		})
		.on("keyup.BDFDBinitElements", ".searchBar-YMJBu9 .input-yt44Uw", (e) => {
			var input = e.currentTarget;
			input.parentElement.querySelector(".eyeGlass-6rahZf").classList.toggle("visible-4lw4vs", !input.value);
			input.parentElement.querySelector(".clear-4pSDsx").classList.toggle("visible-4lw4vs", input.value);
		})
		.on("click.BDFDBinitElements", ".searchBar-YMJBu9 .clear-4pSDsx.visible-4lw4vs", (e) => {
			var clear = e.currentTarget;
			clear.parentElement.parentElement.querySelector(".input-yt44Uw").value = "";
			clear.parentElement.querySelector(".eyeGlass-6rahZf").classList.add("visible-4lw4vs");
			clear.classList.remove("visible-4lw4vs");
		})
		.on("click.BDFDBinitElements", ".numberinput-button-up", (e) => {
			var input = e.currentTarget.parentElement.parentElement.querySelector("input");
			var max = parseInt(input.getAttribute("max"));
			var newvalue = parseInt(input.value) + 1;
			if (isNaN(max) || (!isNaN(max) && newvalue <= max)) {
				e.currentTarget.parentElement.classList.add("pressed");
				clearTimeout(e.currentTarget.parentElement.pressedTimeout);
				input.value = newvalue;
				$(input).trigger("input");
				e.currentTarget.parentElement.pressedTimeout = setTimeout(() => {
					e.currentTarget.parentElement.classList.remove("pressed");
				},3000);
			}
		})
		.on("click.BDFDBinitElements", ".numberinput-button-down", (e) => {
			var input = e.currentTarget.parentElement.parentElement.querySelector("input");
			var min = parseInt(input.getAttribute("min"));
			var newvalue = parseInt(input.value) - 1;
			if (isNaN(min) || (!isNaN(min) && newvalue >= min)) {
				e.currentTarget.parentElement.classList.add("pressed");
				clearTimeout(e.currentTarget.parentElement.pressedTimeout);
				input.value = newvalue;
				$(input).trigger("input");
				e.currentTarget.parentElement.pressedTimeout = setTimeout(() => {
					e.currentTarget.parentElement.classList.remove("pressed");
				},3000);
			}
		})
		.on("click.BDFDBinitElements", ".tab", (e) => {
			$(container).find(".tab-content.open").removeClass("open");
			$(container).find(".tab.selected").removeClass("selected");
			$(container).find(".tab-content[tab='" + $(e.currentTarget).attr("tab") + "']").addClass("open");	
			$(e.currentTarget).addClass("selected");
		});
		
	$(container).find(".tab").first().addClass("selected");
	$(container).find(".tab-content").first().addClass("open");
	
	var libraryStrings = BDfunctionsDevilBro.getLibraryStrings();
	$(container).find(".btn-save .contents-4L4hQM").text(libraryStrings.btn_save_text);
	$(container).find(".btn-cancel .contents-4L4hQM").text(libraryStrings.btn_cancel_text);
	$(container).find(".btn-all .contents-4L4hQM").text(libraryStrings.btn_all_text);
	$(container).find(".btn-add .contents-4L4hQM").text(libraryStrings.btn_add_text);
	$(container).find(".btn-ok .contents-4L4hQM").text(libraryStrings.btn_ok_text);
	$(container).find(".file-navigator .contents-4L4hQM").text(libraryStrings.file_navigator_text);
	$(container).find(".searchBar-YMJBu9 .input-yt44Uw").attr("placeholder", libraryStrings.search_placeholder);
		
	$(container)
		.find(".checkbox-1KYsPm").each((_, checkBox) => {
			$(checkBox.parentElement)
				.toggleClass("valueChecked-3Bzkbm", checkBox.checked)
				.toggleClass("valueUnchecked-XR6AOk", !checkBox.checked);
		});
		
	$(container)
		.find(".checkboxWrapper-2Yvr_Y .input-oWyROL").each((_, checkBox) => {
			if (checkBox.checked) {
				var checkBoxStyle = checkBox.parentElement.querySelector(".checkbox-1QwaS4");
				$(checkBoxStyle)
					.addClass("checked-2TahvT")
					.css("background-color", "rgb(67, 181, 129)")
					.css("border-color", "rgb(67, 181, 129)")
					.find("polyline")
						.attr("stroke", "#ffffff");
			}
		});
};

BDfunctionsDevilBro.appendModal = function (modal) {
	let id = Math.round(Math.random()*10000000000000000);
	var container = document.querySelector(".app-XZYfmp ~ [class^='theme-']:not([class*='popouts'])");
	if (!container) return;
	
	$(modal)
		.appendTo(container)
		.on("click", ".backdrop-2ohBEd, .btn-cancel, .btn-save, .btn-send, .btn-cancel, .btn-ok", () => {
			$(document).off("keydown.modalEscapeListenerDevilBro" + id);
			$(modal).addClass("closing");
			setTimeout(() => {modal.remove();}, 300);
		});
		
	
	BDfunctionsDevilBro.initElements(modal);
		
	$(document)
		.off("keydown.modalEscapeListenerDevilBro" + id)
		.on("keydown.modalEscapeListenerDevilBro" + id, (e) => {
			if (e.which == 27) $(modal).find(".backdrop-2ohBEd").click();
		});
};

BDfunctionsDevilBro.updateContextPosition = function (context) {
	var app = document.querySelector(".appMount-14L89u");
	var menuWidth = $(context).outerWidth();
	var menuHeight = $(context).outerHeight();
	var position = BDfunctionsDevilBro.mousePosition;
	var newposition = {
		x: position.x - menuWidth,
		y: position.y - menuHeight
	};
	$(context)
		.css("left", (position.x + menuWidth > app.offsetWidth ? (newposition.x < 0 ? 10 : newposition.x) : position.x) + "px")
		.css("top", (position.y + menuHeight > app.offsetHeight ? (newposition.y < 0 ? 10 : newposition.y) : position.y) + "px");
};

BDfunctionsDevilBro.appendContextMenu = function (context, e) {
	$(".tooltips").before(context);
	var app = document.querySelector(".appMount-14L89u");
	var menuWidth = $(context).outerWidth();
	var menuHeight = $(context).outerHeight();
	$(context)
		.toggleClass("invertX", e.pageX + menuWidth > app.offsetWidth)
		.toggleClass("invertChildX", e.pageX + menuWidth > app.offsetWidth)
		.toggleClass("invertY", e.pageY + menuHeight > app.offsetHeight)
		.addClass(BDfunctionsDevilBro.getDiscordTheme());
		
	BDfunctionsDevilBro.updateContextPosition(context);
	
	$(document).on("mousedown.BDfunctionsDevilBroContextMenu", (e2) => {
		if ($(context).has(e2.target).length == 0 && context != e2.target) {
			$(document).off("mousedown.BDfunctionsDevilBroContextMenu");
			context.remove();
		}
		else {
			var item = $(".item-1XYaYf").has(e2.target)[0];
			if (item && !$(item).hasClass("disabled-dlOjhg") && !$(item).hasClass("itemSubMenu-3ZgIw-") && !$(item).hasClass("itemToggle-e7vkml")) {
				$(document).off("mousedown.BDfunctionsDevilBroContextMenu");
			}
		}
	});
};

BDfunctionsDevilBro.appendSubMenu = function (target, menu) {
	$(target).append(menu);
	var offsets = $(target).offset();
	var menuHeight = $(menu).outerHeight();
	$(menu)
		.addClass(BDfunctionsDevilBro.getDiscordTheme())
		.css("left", offsets.left + "px")
		.css("top", offsets.top + menuHeight > window.outerHeight ? (offsets.top - menuHeight + $(target).outerHeight()) + "px" : offsets.top + "px");
		
	$(target).on("mouseleave.BDfunctionsDevilBroSubContextMenu", () => {
		$(target).off("mouseleave.BDfunctionsDevilBroSubContextMenu");
		menu.remove();
	});
};

BDfunctionsDevilBro.setColorSwatches = function (currentCOMP, wrapper, swatch) {
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
			<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa wrap-1da0e3ui-color-picker-row" style="flex: 1 1 auto; display: flex; flex-wrap: wrap; overflow: visible !important;">
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
		if (wrapperDiv.hasClass("disabled")) return;
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
		if (wrapperDiv.hasClass("disabled")) return;
		BDfunctionsDevilBro.openColorPicker(e.currentTarget.style.backgroundColor, swatch);
	});
};

BDfunctionsDevilBro.openColorPicker = function (currentColor, swatch) {
	var libraryStrings = BDfunctionsDevilBro.getLibraryStrings();
	var inputs = {
		HEX: 	{type:"text", 		name:"hex",				group:"hex", 	min:null,	max:null,	length:7,		default:"#000000"},
		R: 		{type:"number", 	name:"red",				group:"rgb", 	min:0,		max:255,	length:null,	default:0},
		G:		{type:"number", 	name:"green",			group:"rgb", 	min:0,		max:255,	length:null,	default:0},
		B:		{type:"number", 	name:"blue",			group:"rgb", 	min:0,		max:255,	length:null,	default:0},
		H: 		{type:"number", 	name:"hue",				group:"hsl", 	min:0,		max:360,	length:null,	default:0},
		S: 		{type:"number", 	name:"saturation",		group:"hsl", 	min:0,		max:100,	length:null,	default:0},
		L: 		{type:"number", 	name:"lightness",		group:"hsl", 	min:0,		max:100,	length:null,	default:0}
	};
	
	var colorPickerModalMarkup = 
		`<span class="colorpicker-modal DevilBro-modal">
			<div class="backdrop-2ohBEd"></div>
			<div class="modal-2LIEKY">
				<div class="inner-1_1f7b">
					<div class="modal-3HOjGZ">
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
							<div class="flexChild-1KGW5q" style="flex: 1 1 auto;">
								<h4 class="h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl">${libraryStrings.colorpicker_modal_header_text}</h4>
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
								<div class="colorpicker-inputs card-3DrRmC cardPrimaryEditable-2IQ7-V">
									${Object.keys(inputs).map((key, i) => 
									`<div class="colorpicker-input flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyCenter-29N31w alignCenter-3VxkQP noWrap-v6g9vO marginTop4-2rEBfJ marginBottom4-_yArcI">
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJnoWrap-v6g9vO"style="flex: 1 1 20%">
											<h5 class="h5-3KssQU size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH">${key}:</h5>
										</div>
										<div class="inputWrapper-3xoRWR${inputs[key].type == 'number' ? ' inputNumberWrapper inputNumberWrapperMini' : ''} vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR" style="flex: 1 1 80%;">
											${inputs[key].type == 'number' ? '<span class="numberinput-buttons-zone"><span class="numberinput-button-up"></span><span class="numberinput-button-down"></span></span>' : ''}
											<input type="${inputs[key].type}"${!isNaN(inputs[key].min) && inputs[key].min != null ? ' min="' + inputs[key].min + '"' : ''}${!isNaN(inputs[key].max) && inputs[key].max != null ? ' max="' + inputs[key].max + '"' : ''}${!isNaN(inputs[key].length) && inputs[key].length != null ? ' maxlength="' + inputs[key].length + '"' : ''} name="${inputs[key].group}" placeholder="${inputs[key].default}" class="inputMini-3MyfLa input-2YozMi size16-3IvaX_ colorpicker-${inputs[key].name}">
										</div>
									</div>`).join("")}
								</div>
							</div>
						</div>
						<div class="flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw">
							<button type="button" class="btn-ok buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u">
								<div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx"></div>
							</button>
						</div>
					</div>
				</div>
			</div>
		</span>`;
		
	var colorPickerModal = $(colorPickerModalMarkup)[0];
	BDfunctionsDevilBro.appendModal(colorPickerModal);
	$(colorPickerModal)
		.on("click", ".btn-ok", () => {
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
		.on("mousedown", (e) => {
			BDfunctionsDevilBro.appendLocalStyle("crossHairColorPicker", `* {cursor: crosshair !important;}`);
			
			switchPreviews(e.button);
			
			pHalfW = pcursor.offsetWidth/2;
			pHalfH = pcursor.offsetHeight/2;
			pMinX = $(ppane).offset().left;
			pMaxX = pMinX + ppane.offsetWidth;
			pMinY = $(ppane).offset().top;
			pMaxY = pMinY + ppane.offsetHeight;
			pX = e.clientX - pHalfW;
			pY = e.clientY - pHalfH;
			
			$(pcursor).offset({"left":pX,"top":pY});
			
			saturation = BDfunctionsDevilBro.mapRange([pMinX - pHalfW, pMaxX - pHalfW], [0, 100], pX);
			lightness = BDfunctionsDevilBro.mapRange([pMinY - pHalfH, pMaxY - pHalfH], [100, 0], pY);
			updateAllValues();
			
			$(document)
				.off("mouseup.ColorPicker").off("mousemove.ColorPicker")
				.on("mouseup.ColorPicker", () => {
					BDfunctionsDevilBro.removeLocalStyle("crossHairColorPicker");
					$(document).off("mouseup.ColorPicker").off("mousemove.ColorPicker");
				})
				.on("mousemove.ColorPicker", (e2) => {
					pX = e2.clientX > pMaxX ? pMaxX - pHalfW : (e2.clientX < pMinX ? pMinX - pHalfW : e2.clientX - pHalfW);
					pY = e2.clientY > pMaxY ? pMaxY - pHalfH : (e2.clientY < pMinY ? pMinY - pHalfH : e2.clientY - pHalfH);
					$(pcursor).offset({"left":pX,"top":pY});
					
					saturation = BDfunctionsDevilBro.mapRange([pMinX - pHalfW, pMaxX - pHalfW], [0, 100], pX);
					lightness = BDfunctionsDevilBro.mapRange([pMinY - pHalfH, pMaxY - pHalfH], [100, 0], pY);
					updateAllValues();
				});
		});
	
	$(spane)
		.on("mousedown", (e) => {
			BDfunctionsDevilBro.appendLocalStyle("crossHairColorPicker", `* {cursor: crosshair !important;}`);
			
			switchPreviews(e.button);
			
			sHalfH = scursor.offsetHeight/2;
			sMinY = $(spane).offset().top;
			sMaxY = sMinY + spane.offsetHeight;
			sY = e.clientY - sHalfH;
			
			$(scursor).offset({"top":sY});
			
			hue = BDfunctionsDevilBro.mapRange([sMinY - sHalfH, sMaxY - sHalfH], [360, 0], sY);
			updateAllValues();
			
			$(document)
				.off("mouseup.ColorPicker").off("mousemove.ColorPicker")
				.on("mouseup.ColorPicker", () => {
					BDfunctionsDevilBro.removeLocalStyle("crossHairColorPicker");
					$(document).off("mouseup.ColorPicker").off("mousemove.ColorPicker");
				})
				.on("mousemove.ColorPicker", (e2) => {
					sY = e2.clientY > sMaxY ? sMaxY - sHalfH : (e2.clientY < sMinY ? sMinY - sHalfH : e2.clientY - sHalfH);
					$(scursor).offset({"top":sY});
					
					hue = BDfunctionsDevilBro.mapRange([sMinY - sHalfH, sMaxY - sHalfH], [360, 0], sY);
					updateAllValues();
				});
		});
		
	$(colorPickerModal)
		.on("input", ".inputMini-3MyfLa", (e) => {
			updateValues(e.currentTarget.name);
		});
		
	$(colorPickerModal)
		.on("click", "[class^='colorpicker-preview-']", (e) => {
			colorPickerModal.querySelector("[class^='colorpicker-preview-'].selected").style.borderColor = "transparent";
			colorPickerModal.querySelector("[class^='colorpicker-preview-'].selected").classList.remove("selected");
			e.currentTarget.classList.add("selected");
			[hue, saturation, lightness] = BDfunctionsDevilBro.color2HSL(e.currentTarget.style.backgroundColor).replace(new RegExp(" ", "g"), "").slice(4, -1).split(",");
			saturation *= 100;
			lightness *= 100;
			updateAllValues();
			updateCursors();
		});
	
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
				if (red && red >= 0 && red <= 255 && green && green >= 0 && green <= 255 && blue && blue >= 0 && blue <= 255) {
					[hue, saturation, lightness] = BDfunctionsDevilBro.color2HSL([red, green, blue]).replace(new RegExp(" ", "g"), "").slice(4, -1).split(",");
					saturation *= 100;
					lightness *= 100;
					colorPickerModal.querySelector(".colorpicker-hex").value = BDfunctionsDevilBro.color2HEX([red, green, blue]);
					colorPickerModal.querySelector(".colorpicker-hue").value = Math.round(hue);
					colorPickerModal.querySelector(".colorpicker-saturation").value = Math.round(saturation);
					colorPickerModal.querySelector(".colorpicker-lightness").value = Math.round(lightness);
				}
				break;
			case "hsl":
				hue = colorPickerModal.querySelector(".colorpicker-hue").value;
				saturation = colorPickerModal.querySelector(".colorpicker-saturation").value;
				lightness = colorPickerModal.querySelector(".colorpicker-lightness").value;
				if (hue && hue >= 0 && hue <= 360 && saturation && saturation >= 0 && saturation <= 100 && lightness && lightness >= 0 && lightness <= 100) {
					[red, green, blue] = BDfunctionsDevilBro.color2COMP("hsl(" + hue + ", " + saturation/100 + ", " + lightness/100 + ")");
					colorPickerModal.querySelector(".colorpicker-hex").value = BDfunctionsDevilBro.color2HEX([red, green, blue]);
					colorPickerModal.querySelector(".colorpicker-red").value = red;
					colorPickerModal.querySelector(".colorpicker-green").value = green;
					colorPickerModal.querySelector(".colorpicker-blue").value = blue;
				}
				break; 
		}
		updateColors();
		updateCursors();
	}
	
	function updateCursors () {
		sHalfH = scursor.offsetHeight/2;
		sMinY = $(spane).offset().top;
		sY = BDfunctionsDevilBro.mapRange([360, 0], [sMinY - sHalfH, sMaxY - sHalfH], hue);
		
		pHalfW = pcursor.offsetWidth/2;
		pHalfH = pcursor.offsetHeight/2;
		pMinX = $(ppane).offset().left;
		pMaxX = pMinX + ppane.offsetWidth;
		pMinY = $(ppane).offset().top;
		pMaxY = pMinY + ppane.offsetHeight;
		pX = BDfunctionsDevilBro.mapRange([0, 100], [pMinX - pHalfW, pMaxX - pHalfW], saturation);
		pY = BDfunctionsDevilBro.mapRange([100, 0], [pMinY - pHalfH, pMaxY - pHalfH], lightness);
		
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

BDfunctionsDevilBro.mapRange = function (from, to, number) {
	return to[0] + (number - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
};

BDfunctionsDevilBro.getSwatchColor = function (swatch) {
	return !$(".ui-color-picker-" + swatch + ".nocolor.selected")[0] ? BDfunctionsDevilBro.color2COMP($(".ui-color-picker-" + swatch + ".selected").css("background-color")) : null;
};

BDfunctionsDevilBro.isPluginEnabled = function (name) {
	return window.bdplugins[name] && window.pluginCookie[name];
};

BDfunctionsDevilBro.isRestartNoMoreEnabled = function () {
	return BDfunctionsDevilBro.isPluginEnabled("Restart-No-More") || BDfunctionsDevilBro.isPluginEnabled("Restart No More");
};

BDfunctionsDevilBro.isThemeEnabled = function (name) {
	return window.bdthemes[name] && window.themeCookie[name];
};

BDfunctionsDevilBro.zacksFork = function () {
	return (typeof bdpluginErrors === "object" && typeof bdthemeErrors === "object" && typeof bbdVersion === "string");
};

BDfunctionsDevilBro.getLibraryStrings = function () {
	switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
		case "hr": 		//croatian
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} je započeo.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} zaustavljen.",
				toast_plugin_translated:		"${pluginName} prijevod na ${ownlang}.",
				colorpicker_modal_header_text:	"Birač boja",
				file_navigator_text:			"Pregledajte datoteku",
				btn_add_text:					"Dodati",
				btn_cancel_text:				"Prekid",
				btn_all_text:					"Sve",
				btn_save_text:					"Uštedjeti",
				btn_ok_text: 					"OK",
				search_placeholder: 			"Traziti ..." 
			};
		case "da": 		//danish
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} er startet.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} er stoppet.",
				toast_plugin_translated:		"${pluginName} oversat til ${ownlang}.",
				colorpicker_modal_header_text:	"Farvevælger",
				file_navigator_text:			"Gennemse fil",
				btn_add_text:					"Tilføje",
				btn_cancel_text:				"Afbryde",
				btn_all_text:					"Alle",
				btn_save_text:					"Spare",
				btn_ok_text: 					"OK",
				search_placeholder: 			"Søge efter ..." 
			};
		case "de": 		//german
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} wurde gestartet.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} wurde gestoppt.",
				toast_plugin_translated:		"${pluginName} auf ${ownlang} übersetzt.",
				colorpicker_modal_header_text:	"Farbauswahl",
				file_navigator_text:			"Datei durchsuchen",
				btn_add_text:					"Hinzufügen",
				btn_cancel_text:				"Abbrechen",
				btn_all_text:					"Alle",
				btn_save_text:					"Speichern",
				btn_ok_text: 					"OK",
				search_placeholder: 			"Suchen nach ..." 
			};
		case "es": 		//spanish
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} se ha iniciado.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} se ha detenido.",
				toast_plugin_translated:		"${pluginName} traducido a ${ownlang}.",
				colorpicker_modal_header_text:	"Selector de color",
				file_navigator_text:			"Buscar archivo",
				btn_add_text:					"Añadir",
				btn_cancel_text:				"Cancelar",
				btn_all_text:					"Todo",
				btn_save_text:					"Guardar",
				btn_ok_text: 					"OK",
				search_placeholder: 			"Buscar ..." 
			};
		case "fr": 		//french
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} a été démarré.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} a été arrêté.",
				toast_plugin_translated:		"${pluginName} traduit en ${ownlang}.",
				colorpicker_modal_header_text:	"Pipette à couleurs",
				file_navigator_text:			"Parcourir le fichier",
				btn_add_text:					"Ajouter",
				btn_cancel_text:				"Abandonner",
				btn_all_text:					"Tout",
				btn_save_text:					"Enregistrer",
				btn_ok_text: 					"OK",
				search_placeholder: 			"Rechercher ..." 
			};
		case "it": 		//italian
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} è stato avviato.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} è stato interrotto.",
				toast_plugin_translated:		"${pluginName} tradotto in ${ownlang}.",
				colorpicker_modal_header_text:	"Raccoglitore di colore",
				file_navigator_text:			"Sfoglia file",
				btn_add_text:					"Inserisci",
				btn_cancel_text:				"Cancellare",
				btn_all_text:					"Tutto",
				btn_save_text:					"Salvare",
				btn_ok_text: 					"OK",
				search_placeholder: 			"Cercare ..." 
			};
		case "nl":		//dutch
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} is gestart.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} is gestopt.",
				toast_plugin_translated:		"${pluginName} vertaald naar ${ownlang}.",
				colorpicker_modal_header_text:	"Kleur kiezer",
				file_navigator_text:			"Bestand zoeken",
				btn_add_text:					"Toevoegen",
				btn_cancel_text:				"Afbreken",
				btn_all_text:					"Alle",
				btn_save_text:					"Opslaan",
				btn_ok_text: 					"OK",
				search_placeholder: 			"Zoeken ..." 
			};
		case "no":		//norwegian
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} er startet.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} er stoppet.",
				toast_plugin_translated:		"${pluginName} oversatt til ${ownlang}.",
				colorpicker_modal_header_text:	"Fargevelger",
				file_navigator_text:			"Bla gjennom fil",
				btn_add_text:					"Legg til",
				btn_cancel_text:				"Avbryte",
				btn_all_text:					"Alle",
				btn_save_text:					"Lagre",
				btn_ok_text: 					"OK",
				search_placeholder: 			"Søk etter ..." 
			};
		case "pl":		//polish
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} został uruchomiony.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} został zatrzymany.",
				toast_plugin_translated:		"${pluginName} przetłumaczono na ${ownlang}.",
				colorpicker_modal_header_text:	"Narzędzie do wybierania kolorów",
				file_navigator_text:			"Przeglądać plik",
				btn_add_text:					"Dodaj",
				btn_cancel_text:				"Anuluj",
				btn_all_text:					"Wszystkie",
				btn_save_text:					"Zapisz",
				btn_ok_text: 					"OK",
				search_placeholder: 			"Szukać ..." 
			};
		case "pt-BR":		//portuguese (brazil)
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} foi iniciado.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} foi interrompido.",
				toast_plugin_translated:		"${pluginName} traduzido para ${ownlang}.",
				colorpicker_modal_header_text:	"Seletor de cores",
				file_navigator_text:			"Procurar arquivo",
				btn_add_text:					"Adicionar",
				btn_cancel_text:				"Cancelar",
				btn_all_text:					"Todo",
				btn_save_text:					"Salvar",
				btn_ok_text: 					"OK",
				search_placeholder: 			"Procurar por ..." 
			};
		case "fi":		//finnish
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} on käynnistetty.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} on pysäytetty.",
				toast_plugin_translated:		"${pluginName} käännetty osoitteeseen ${ownlang}.",
				colorpicker_modal_header_text:	"Värinvalitsija",
				file_navigator_text:			"Selaa tiedostoa",
				btn_add_text:					"Lisätä",
				btn_cancel_text:				"Peruuttaa",
				btn_all_text:					"Kaikki",
				btn_save_text:					"Tallentaa",
				btn_ok_text: 					"OK",
				search_placeholder: 			"Etsiä ..." 
			};
		case "sv":		//swedish
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} har startats.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} har blivit stoppad.",
				toast_plugin_translated:		"${pluginName} översatt till ${ownlang}.",
				colorpicker_modal_header_text:	"Färgväljare",
				file_navigator_text:			"Bläddra i fil",
				btn_add_text:					"Lägg till",
				btn_cancel_text:				"Avbryta",
				btn_all_text:					"All",
				btn_save_text:					"Spara",
				btn_ok_text: 					"OK",
				search_placeholder: 			"Söka efter ..." 
			};
		case "tr":		//turkish
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} başlatıldı.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} durduruldu.",
				toast_plugin_translated:		"${pluginName} ${ownlang} olarak çevrildi.",
				colorpicker_modal_header_text:	"Renk seçici",
				file_navigator_text:			"Dosyaya gözat",
				btn_add_text:					"Eklemek",
				btn_cancel_text:				"Iptal",
				btn_all_text:					"Her",
				btn_save_text:					"Kayıt",
				btn_ok_text: 					"Okey",
				search_placeholder: 			"Aramak ..." 
			};
		case "cs":		//czech
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} byl spuštěn.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} byl zastaven.",
				toast_plugin_translated:		"${pluginName} přeložen do ${ownlang}.",
				colorpicker_modal_header_text:	"Výběr barev",
				file_navigator_text:			"Procházet soubor",
				btn_add_text:					"Přidat",
				btn_cancel_text:				"Zrušení",
				btn_all_text:					"Vše",
				btn_save_text:					"Uložit",
				btn_ok_text: 					"OK",
				search_placeholder: 			"Hledat ..." 
			};
		case "bg":		//bulgarian
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} е стартиран.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} е спрян.",
				toast_plugin_translated:		"${pluginName} преведена на ${ownlang}.",
				colorpicker_modal_header_text:	"Избор на цвят",
				file_navigator_text:			"Прегледайте файла",
				btn_add_text:					"Добави",
				btn_cancel_text:				"Зъбести",
				btn_all_text:					"Bсичко",
				btn_save_text:					"Cпасяване",
				btn_ok_text: 					"Добре",
				search_placeholder: 			"Търся ..." 
			};
		case "ru":		//russian
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} запущен.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} остановлен.",
				toast_plugin_translated:		"${pluginName} переведен на ${ownlang}.",
				colorpicker_modal_header_text:	"Выбор цвета",
				file_navigator_text:			"Просмотр файла",
				btn_add_text:					"Добавить",
				btn_cancel_text:				"Отмена",
				btn_all_text:					"Все",
				btn_save_text:					"Cпасти",
				btn_ok_text: 					"ОК",
				search_placeholder: 			"Искать ..." 
			};
		case "uk":		//ukranian
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} було запущено.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} було зупинено.",
				toast_plugin_translated:		"${pluginName} перекладено ${ownlang}.",
				colorpicker_modal_header_text:	"Колір обкладинки",
				file_navigator_text:			"Перегляньте файл",
				btn_add_text:					"Додати",
				btn_cancel_text:				"Скасувати",
				btn_all_text:					"Все",
				btn_save_text:					"Зберегти",
				btn_ok_text: 					"Добре",
				search_placeholder: 			"Шукати ..." 
			};
		case "ja":		//japanese
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion}が開始されました.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion}が停止しました.",
				toast_plugin_translated:		"${pluginName} は${ownlang}に翻訳されました.",
				colorpicker_modal_header_text:	"カラーピッカー",
				file_navigator_text:			"ファイルを参照",
				btn_add_text:					"追加",
				btn_cancel_text:				"キャンセル",
				btn_all_text:					"すべて",
				btn_save_text:					"セーブ",
				btn_ok_text: 					"はい",
				search_placeholder: 			"検索する ..." 
			};
		case "zh-TW":	//chinese (traditional)
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion}已經啟動.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion}已停止.",
				toast_plugin_translated:		"${pluginName} 翻譯為${ownlang}.",
				colorpicker_modal_header_text:	"選色器",
				file_navigator_text:			"瀏覽文件",
				btn_add_text:					"加",
				btn_cancel_text:				"取消",
				btn_all_text:					"所有",
				btn_save_text:					"保存",
				btn_ok_text: 					"好",
				search_placeholder: 			"搜索 ..." 
			};
		case "ko":		//korean
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} 시작되었습니다.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} 중지되었습니다.",
				toast_plugin_translated:		"${pluginName} ${ownlang} 로 번역되었습니다.",
				colorpicker_modal_header_text:	"색상 선택 도구",
				file_navigator_text:			"파일 찾아보기",
				btn_add_text:					"더하다",
				btn_cancel_text:				"취소",
				btn_all_text:					"모든",
				btn_save_text:					"저장",
				btn_ok_text: 					"승인",
				search_placeholder: 			"검색 ..." 
			};
		default:		//default: english
			return {
				toast_plugin_started:			"${pluginName} ${oldVersion} has been started.",
				toast_plugin_stopped:			"${pluginName} ${oldVersion} has been stopped.",
				toast_plugin_translated:		"${pluginName} translated to ${ownlang}.",
				colorpicker_modal_header_text:	"Color Picker",
				file_navigator_text:			"Browser File",
				btn_add_text:					"Add",
				btn_cancel_text:				"Cancel",
				btn_all_text:					"All",
				btn_save_text:					"Save",
				btn_ok_text: 					"OK",
				search_placeholder: 			"Search for ..."
			};
	}
};

$(window)
	.off("keydown.BDfunctionsDevilBroPressedKeys")
	.off("keyup.BDfunctionsDevilBroPressedKeys")
	.off("mousedown.BDfunctionsDevilBroMousePosition")
	.on("keydown.BDfunctionsDevilBroPressedKeys", (e) => {
		if (!BDfunctionsDevilBro.pressedKeys.includes(e.which)) BDfunctionsDevilBro.pressedKeys.push(e.which);
	})
	.on("keyup.BDfunctionsDevilBroPressedKeys", (e) => {
		BDfunctionsDevilBro.removeFromArray(BDfunctionsDevilBro.pressedKeys, e.which);
	})
	.on("mousedown.BDfunctionsDevilBroMousePosition", (e) => {
		BDfunctionsDevilBro.mousePosition = {x:e.pageX,y:e.pageY};
	});

BDfunctionsDevilBro.appendLocalStyle("BDfunctionsDevilBro", `
	#bd-settingspane-container .ui-form-title {
		display: inline-block;
	}
	#bd-settingspane-container .bd-pfbtn {
		position: static;
		margin-bottom: 0;
		border-radius: 5px;
		display: inline-block;
		margin-left: 10px;
	}
	#bd-settingspane-container .bda-description {
		white-space: pre-line !important;
	}
	
	.DevilBro-notice {
		-webkit-app-region: drag;
		border-radius: 0 5px 0 0 !important;
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
	
	.toast .toast-inner {
		display: flex;
		align-items: center;
	}
	
	.toast .toast-avatar {
		margin-right: 5px;
		width: 25px;
		height: 25px;
		background-size: cover;
		background-position: center;
		border-radius: 50%;
	}
	
	.toast.icon {
		padding-left: 30px;
		background-size: 20px 20px;
		background-repeat: no-repeat;
		background-position: 6px 50%;
	}
	
	.toast.toast-brand {
		background-color: #7289DA;
	}
	.toast.toast-brand.icon {
		background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHhtbDpzcGFjZT0icHJlc2VydmUiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiIHZpZXdCb3g9IjI3IDI3IDExNSAxMTUiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDkwIDkwOyI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMTEuMywxMjQuMWMwLDAtMy40LTQuMS02LjMtNy43YzEyLjYtMy41LDE3LjQtMTEuMywxNy40LTExLjMgYy00LDIuNi03LjcsNC40LTExLjEsNS42Yy00LjgsMi05LjUsMy4zLTE0LDQuMWMtOS4yLDEuNy0xNy42LDEuMy0yNC45LTAuMWMtNS41LTEtMTAuMi0yLjUtMTQuMS00LjFjLTIuMi0wLjgtNC42LTEuOS03LjEtMy4zIGMtMC4zLTAuMi0wLjYtMC4zLTAuOS0wLjVjLTAuMS0wLjEtMC4zLTAuMi0wLjQtMC4yYy0xLjctMS0yLjYtMS42LTIuNi0xLjZzNC42LDcuNiwxNi44LDExLjJjLTIuOSwzLjYtNi40LDcuOS02LjQsNy45IGMtMjEuMi0wLjYtMjkuMy0xNC41LTI5LjMtMTQuNWMwLTMwLjYsMTMuOC01NS40LDEzLjgtNTUuNGMxMy44LTEwLjMsMjYuOS0xMCwyNi45LTEwbDEsMS4xQzUyLjgsNTAuMyw0NSw1Ny45LDQ1LDU3LjkgczIuMS0xLjIsNS43LTIuN2MxMC4zLTQuNSwxOC40LTUuNywyMS44LTZjMC41LTAuMSwxLjEtMC4yLDEuNi0wLjJjNS45LTAuNywxMi41LTAuOSwxOS40LTAuMmM5LjEsMSwxOC45LDMuNywyOC45LDkuMSBjMCwwLTcuNS03LjItMjMuOS0xMi4xbDEuMy0xLjVjMCwwLDEzLjEtMC4zLDI2LjksMTBjMCwwLDEzLjgsMjQuOCwxMy44LDU1LjRDMTQwLjYsMTA5LjYsMTMyLjUsMTIzLjUsMTExLjMsMTI0LjF6IE0xMDEuNyw3OS43Yy01LjQsMC05LjgsNC43LTkuOCwxMC41YzAsNS44LDQuNCwxMC41LDkuOCwxMC41YzUuNCwwLDkuOC00LjcsOS44LTEwLjUgQzExMS41LDg0LjQsMTA3LjEsNzkuNywxMDEuNyw3OS43eiBNNjYuNyw3OS43Yy01LjQsMC05LjgsNC43LTkuOCwxMC41YzAsNS44LDQuNCwxMC41LDkuOCwxMC41YzUuNCwwLDkuOC00LjcsOS44LTEwLjUgQzc2LjUsODQuNCw3Mi4xLDc5LjcsNjYuNyw3OS43eiIvPjwvc3ZnPg==);
	}
	
	.toast.toast-danger, 
	.toast.toast-error {
		background-color: #F04747;
	}
	.toast.toast-danger.icon,
	.toast.toast-error.icon {
		background-image: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTEyIDJDNi40NyAyIDIgNi40NyAyIDEyczQuNDcgMTAgMTAgMTAgMTAtNC40NyAxMC0xMFMxNy41MyAyIDEyIDJ6bTUgMTMuNTlMMTUuNTkgMTcgMTIgMTMuNDEgOC40MSAxNyA3IDE1LjU5IDEwLjU5IDEyIDcgOC40MSA4LjQxIDcgMTIgMTAuNTkgMTUuNTkgNyAxNyA4LjQxIDEzLjQxIDEyIDE3IDE1LjU5eiIvPiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+PC9zdmc+);
	}
	
	.toast.toast-default {
		background-color: #F26522;
	}
	.toast.toast-default.icon {
		padding-left: 10px;
	}
	
	.toast.toast-facebook {
		background-color: #355089;
	}
	.toast.toast-facebook.icon {
		background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiIHZpZXdCb3g9Ii01IC01IDEwMCAxMDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDkwIDkwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+PHBhdGggaWQ9IkZhY2Vib29rX194MjhfYWx0X3gyOV8iIGQ9Ik05MCwxNS4wMDFDOTAsNy4xMTksODIuODg0LDAsNzUsMEgxNUM3LjExNiwwLDAsNy4xMTksMCwxNS4wMDF2NTkuOTk4ICAgQzAsODIuODgxLDcuMTE2LDkwLDE1LjAwMSw5MEg0NVY1NkgzNFY0MWgxMXYtNS44NDRDNDUsMjUuMDc3LDUyLjU2OCwxNiw2MS44NzUsMTZINzR2MTVINjEuODc1QzYwLjU0OCwzMSw1OSwzMi42MTEsNTksMzUuMDI0VjQxICAgaDE1djE1SDU5djM0aDE2YzcuODg0LDAsMTUtNy4xMTksMTUtMTUuMDAxVjE1LjAwMXoiIGZpbGw9IndoaXRlIi8+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjwvc3ZnPg==);
	}
	
	.toast.toast-info {
		background-color: #4A90E2;
	}
	.toast.toast-info.icon {
		background-image: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPiAgICA8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMSAxNWgtMnYtNmgydjZ6bTAtOGgtMlY3aDJ2MnoiLz48L3N2Zz4=);
	}
	
	.toast.toast-premium {
		background-color: #202225;
	}
	.toast.toast-premium.icon {
		background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDMiIGhlaWdodD0iMjYiPiAgPHBhdGggZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOTYuMjgyNiA4LjYwMjc4ODI0bC0xLjIxNTUgOC4zOTAzNTI5NmMtLjI3NzUgMS45ODI2Mjc0LTIuNDY1NSAyLjkwMzMzMzMtNC40NzkgMi45MDMzMzMzLTEuODc1IDAtMy43MTU1LS45MjA3MDU5LTMuNDcyNS0yLjcyNTkyMTZsMS4yMTU1LTguNTY3NzY0NjZjLjI3NzUtMS44NzY1ODgyNCAyLjQ2NTUtMi44MzI0NzA2IDQuNDc5LTIuODMyNDcwNiAyLjAxNCAwIDMuNzUuOTU1ODgyMzYgMy40NzI1IDIuODMyNDcwNk05My43NzIxLjAwMzkyNTVsLjAwMDUtLjAwNDA3ODQ0aC0xMy4wODRjLS4zMzQgMC0uNjE4LjI1MDMxMzcyLS42NjYuNTg3Mjk0MTJsLS42MzY1IDQuNDMyMjM1M2MtLjA1OTUuNDE0NDcwNTguMjU2Ljc4NjExNzY0LjY2NjUuNzg2MTE3NjRoMi4zODk1Yy4yNCAwIC40MDQ1LjI0OTgwMzkyLjMxLjQ3NTY0NzA2LS4yOTguNzEyMTk2MDctLjUxNTUgMS40ODYwNzg0My0uNjM2IDIuMzIxNjQ3MDZsLTEuMjE1NSA4LjU2Nzc2NDY2Yy0uNzk5IDUuNzM1Mjk0MiAzLjg4OSA4LjYwMjQzMTQgOC45OTMgOC42MDI0MzE0IDUuMzQ3NSAwIDEwLjU5MDUtMi44NjcxMzcyIDExLjM4OS04LjYwMjQzMTRsMS4yMTUtOC41Njc3NjQ2NmMuNzgzLTUuNjIyMTE3NjUtMy43Mzk1LTguNDg4MjM1My04LjcyNTUtOC41OTg4NjI3NW0tNzguNTk1MjUgMTEuNzI4NjUxbC4wNjcgNC4xNTg5ODA0Yy4wMDE1LjA4NTEzNzItLjA1NS4xNjA1ODgyLS4xMzYuMTgxNDkwMmgtLjAwMDVsLTEuMzg1NS01LjAxNjQ3MDZjLS4wMDItLjAwNzY0NzEtLjAwNS0uMDE0Nzg0My0uMDA4LS4wMjI0MzE0TDkuNDE0MzUuNzcwNzcyNTNjLS4xMDYtLjI1Mjg2Mjc1LS4zNDk1LS40MTY1MDk4LS42MTk1LS40MTY1MDk4aC00Ljg3MjVjLS4zMzYgMC0uNjIwNS4yNTIzNTI5NC0uNjY3LjU5MTM3MjU0TC4wMDY4NSAyNC42MzcyNDMxYy0uMDU3LjQxMzQ1MS4yNTc1Ljc4MjAzOTMuNjY2NS43ODIwMzkzaDQuODU0Yy4zMzY1IDAgLjYyMTUtLjI1MzM3MjYuNjY3NS0uNTkyOTAybDEuMjcyLTkuNDEyNTA5OGMuMDAxNS0uMDA5MTc2NS4wMDItLjAxODM1My4wMDItLjAyNzUyOTRsLS4wNjk1LTQuODM2NTA5OC4xMzg1LS4wMzUxNzY1IDEuNDU1NSA1LjAxNjQ3MDZjLjAwMjUuMDA3MTM3Mi4wMDUuMDEzNzY0Ny4wMDc1LjAyMDkwMmw0LjAyMTUgOS40NTM4MDM5Yy4xMDY1LjI1MDgyMzUuMzQ5NS40MTM0NTEuNjE3NS40MTM0NTFoNS4yNTY1Yy4zMzYgMCAuNjIwNS0uMjUyMzUzLjY2Ny0uNTkxODgyNGwzLjI0OTUtMjMuNjkxNjA3ODRjLjA1NjUtLjQxMjk0MTE4LS4yNTgtLjc4MTUyOTQyLS42NjctLjc4MTUyOTQyaC00LjgyMDVjLS4zMzYgMC0uNjIwNS4yNTE4NDMxNC0uNjY3LjU5MDg2Mjc1bC0xLjQ4IDEwLjc1ODkwMmMtLjAwMS4wMDkxNzY0LS4wMDE1LjAxODg2MjctLjAwMTUuMDI4NTQ5bTkuMzk0IDEzLjY4NjYwMzloNC44NTVjLjMzNiAwIC42MjA1LS4yNTIzNTI5LjY2Ny0uNTkxMzcyNmwzLjI0OS0yMy42OTIxMTc2Yy4wNTY1LS40MTI5NDEyLS4yNTgtLjc4MTUyOTQ0LS42NjctLjc4MTUyOTQ0aC00Ljg1NWMtLjMzNiAwLS42MjA1LjI1MjM1Mjk0LS42NjcuNTkxMzcyNTVsLTMuMjQ5IDIzLjY5MjExNzY4Yy0uMDU2NS40MTI5NDEyLjI1OC43ODE1Mjk0LjY2Ny43ODE1Mjk0TTM2LjYyMTE1LjkwNjA3NDVsLS42MzYgNC40MzIyMzUzYy0uMDU5NS40MTQ0NzA2LjI1NTUuNzg2MTE3NjUuNjY2Ljc4NjExNzY1aDUuMDgwNWMuNDA4NSAwIC43MjMuMzY3NTY4NjMuNjY3NS43ODA1MDk4bC0yLjM5MzUgMTcuNzM0MDM5MjVjLS4wNTU1LjQxMjQzMTMuMjU4NS43OC42NjcuNzhoNC45MjU1Yy4zMzY1IDAgLjYyMS0uMjUyODYyOC42NjctLjU5MjkwMmwyLjQ0NC0xOC4xMDg3NDUxYy4wNDYtLjMzOTUyOTQuMzMwNS0uNTkyOTAxOTUuNjY3LS41OTI5MDE5NWg1LjQ2MjVjLjMzNCAwIC42MTgtLjI0OTgwMzkyLjY2Ni0uNTg3Mjk0MTJsLjYzNy00LjQzMjIzNTNjLjA1OTUtLjQxNDQ3MDU4LS4yNTU1LS43ODYxMTc2NC0uNjY2NS0uNzg2MTE3NjRoLTE4LjE4NzVjLS4zMzQ1IDAtLjYxOC4yNTAzMTM3LS42NjY1LjU4NzI5NDFNNzEuMDM4NyA5LjA5ODM2ODZjLS4xNzQgMS40NTE0MTE3Ny0xLjI4NDUgMi45MDI4MjM1Ny0zLjE5NSAyLjkwMjgyMzU3aC0yLjg2OTVjLS40MSAwLS43MjQ1LS4zNjk2MDc5LS42NjctLjc4MzA1ODlsLjYwNzUtNC4zNjE4ODIzM2MuMDQ3LS4zMzg1MDk4LjMzMTUtLjU5MDM1Mjk0LjY2Ny0uNTkwMzUyOTRoMy4wNjFjMS44NDA1IDAgMi41Njk1IDEuMzEwMTk2MDggMi4zOTYgMi44MzI0NzA2TTY5LjMzNzIuMzU0MjExNzZoLTkuMjQwNWMtLjMzNiAwLS42MjA1LjI1MjM1Mjk0LS42NjcuNTkxMzcyNTRsLTMuMjQ5IDIzLjY5MjExNzdjLS4wNTY1LjQxMjk0MTEuMjU4Ljc4MTUyOTQuNjY3Ljc4MTUyOTRoNC45MjM1Yy4zMzY1IDAgLjYyMTUtLjI1MzM3MjYuNjY3NS0uNTkyOTAybC45NTYtNy4wNzY1ODgyYy4wMjMtLjE2OTc2NDcuMTY1LS4yOTYxOTYxLjMzMzUtLjI5NjE5NjFoLjYzM2MuMTE0NSAwIC4yMjE1LjA1OTY0NzEuMjgzNS4xNTgwMzkybDQuNzAyIDcuNDkxMDU4OGMuMTI0LjE5NzI5NDIuMzM3NS4zMTY1ODgzLjU2NzUuMzE2NTg4M2g2LjA4MWMuNTQ1IDAgLjg2NDUtLjYyNTAxOTYuNTUyLTEuMDgwMjc0NWwtNC45MzQ1LTcuMTkxODA0Yy0uMTE4LS4xNzI4MjM1LS4wNTc1LS40MTI0MzEzLjEyOC0uNTA0NzA1OCAzLjE1MDUtMS41Njk2ODYzIDQuOTc5NS0zLjE3ODExNzcgNS41ODMtNy42NTAxMTc3LjY5MzUtNS44NzcwMTk2LTIuOTE3LTguNjM4MTE3NjMtNy45ODY1LTguNjM4MTE3NjMiLz48L3N2Zz4=);
		background-size: 63px 16px;
		padding-left: 73px;
	}
	
	.toast.toast-spotify {
		background-color: #1DB954;
	}
	.toast.toast-spotify.icon {
		background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUwOC41MiA1MDguNTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUwOC41MiA1MDguNTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4Ij4KPGc+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggZD0iTTI1NC4yNiwwQzExMy44NDUsMCwwLDExMy44NDUsMCwyNTQuMjZzMTEzLjg0NSwyNTQuMjYsMjU0LjI2LDI1NC4yNiAgICAgczI1NC4yNi0xMTMuODQ1LDI1NC4yNi0yNTQuMjZTMzk0LjY3NSwwLDI1NC4yNiwweiBNMzcxLjY5Niw0MDMuMjg4Yy0zLjE3OCw1LjgxNi05LjEyMiw5LjA1OC0xNS4yODcsOS4wNTggICAgIGMtMi44NiwwLTUuNzIxLTAuNjY3LTguNDIyLTIuMTI5Yy00MC43MTMtMjIuNDM4LTg2Ljk1Ny0zNC4yOTMtMTMzLjY3Ny0zNC4yOTNjLTI4LDAtNTUuNjUxLDQuMTYzLTgyLjEyNiwxMi4zNjMgICAgIGMtOS4yMTcsMi44Ni0xOS4wMDYtMi4yODgtMjEuODM1LTExLjUzN2MtMi44Ni05LjE4NSwyLjI4OC0yOC43LDExLjUzNy0zMS41OTJjMjkuODQ0LTkuMjQ5LDYwLjk1OS0xMy45MjEsOTIuNDU1LTEzLjkyMSAgICAgYzUyLjU2OCwwLDEwNC42NiwxMy4zNDksMTUwLjUyMiwzOC42MTZDMzczLjMxNywzNzQuNDYxLDM3Ni40LDM5NC44NjYsMzcxLjY5Niw0MDMuMjg4eiBNNDA0LjAxOSwzMDcuNTI3ICAgICBjLTMuNjIzLDcuMDI0LTEwLjc0MiwxOC4zMzgtMTguMDg0LDE4LjMzOGMtMy4yMSwwLTYuMzg4LTAuNjk5LTkuMzc2LTIuMzJjLTUwLjQ3MS0yNi4xODktMTA1LjA0MS0zOS40NzQtMTYyLjIxOC0zOS40NzQgICAgIGMtMzEuNDk2LDAtNjIuNzcsNC4xMzItOTIuOTY0LDEyLjQ1OWMtMTAuOTAxLDIuOTU2LTIyLjA4OS0zLjQwMS0yNS4wNDUtMTQuMzAyYy0yLjkyNC0xMC45MDEsMy40NjQtMjkuNDMxLDE0LjMzNC0zMi4zODYgICAgIGMzMy42ODktOS4xODUsNjguNTg3LTEzLjg1NywxMDMuNjc0LTEzLjg1N2M2Mi44OTgsMCwxMjUuNDQ1LDE1LjI1NiwxODAuOTM4LDQ0LjExNCAgICAgQzQwNS4yOSwyODUuMjQ4LDQwOS4xOTksMjk3LjUxNiw0MDQuMDE5LDMwNy41Mjd6IE00MTcuNTI2LDIzMC44MzZjLTMuNDY0LDAtNy4wMjQtMC43OTUtMTAuMzYxLTIuNDQ3ICAgICBjLTYwLjIyOC0zMC4wMzQtMTI1LjA5Ni00NS4yMjYtMTkyLjc2MS00NS4yMjZjLTM1LjI3OSwwLTcwLjQzLDQuMjkxLTEwNC41MzMsMTIuNzEzYy0xMi41MjIsMy4wODMtMjUuMTQtNC41MTMtMjguMjIzLTE3LjAwNCAgICAgYy0zLjExNS0xMi40NTksNC41MTMtMjcuNTU1LDE3LjAwNC0zMC42MzhjMzcuNzI2LTkuMzc2LDc2LjY1OS0xNC4xMTEsMTE1LjcyLTE0LjExMWM3NC45NzUsMCwxNDYuODY3LDE2Ljg3NywyMTMuNTc4LDUwLjEyMSAgICAgYzExLjUzNyw1Ljc1MywxNi4yNDEsMTkuNzM3LDEwLjQ4OCwzMS4yNDJDNDM0LjMwOCwyMjMuNjUzLDQyNi4xMDgsMjMwLjgzNiw0MTcuNTI2LDIzMC44MzZ6IiBmaWxsPSIjRkZGRkZGIi8+CgkJPC9nPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=);
	}
	
	.toast.toast-streamermode {
		background-color: #593695;
	}
	.toast.toast-streamermode.icon {
		background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSItMjUgLTI1IDU0MiA1NDIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ5MiA0OTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPjxwYXRoIGQ9Ik00ODguMywxNDIuNXYyMDMuMWMwLDE1LjctMTcsMjUuNS0zMC42LDE3LjdsLTg0LjYtNDguOHYxMy45YzAsNDEuOC0zMy45LDc1LjctNzUuNyw3NS43SDc1LjdDMzMuOSw0MDQuMSwwLDM3MC4yLDAsMzI4LjQgICBWMTU5LjljMC00MS44LDMzLjktNzUuNyw3NS43LTc1LjdoMjIxLjhjNDEuOCwwLDc1LjcsMzMuOSw3NS43LDc1Ljd2MTMuOWw4NC42LTQ4LjhDNDcxLjMsMTE3LDQ4OC4zLDEyNi45LDQ4OC4zLDE0Mi41eiIgZmlsbD0iI0ZGRkZGRiIvPjwvc3ZnPg==);
	}
	
	.toast.toast-success {
		background-color: #43B581;
	}
	.toast.toast-success.icon {
		background-image: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPiAgICA8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNy41OS03LjU5TDE5IDhsLTkgOXoiLz48L3N2Zz4=);
	}

	.toast.toast-warning,
	.toast.toast-warn {
		background-color: #FFA600;
	}
	.toast.toast-warning.icon,
	.toast.toast-warn.icon {
		background-image: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPiAgICA8cGF0aCBkPSJNMSAyMWgyMkwxMiAyIDEgMjF6bTEyLTNoLTJ2LTJoMnYyem0wLTRoLTJ2LTRoMnY0eiIvPjwvc3ZnPg==);
	}
	
	.update-notice-tooltip,
	.update-button-tooltip,
	.update-list-tooltip {
		max-width: 420px !important;
	}
	
	.quickSelectPopout {
		min-width: 210px !important;
		position: relative !important;
		width: auto !important;
	}
	
	.DevilBro-settings div:not([class*="marginTop"]) {
		margin-top: 0px !important;
	}
	.DevilBro-settings .marginTop4-2rEBfJ {
		margin-top: 4px !important;
	}
	.DevilBro-settings .marginTop8-2gOa2N {
		margin-top: 8px !important;
	}
	.DevilBro-settings .marginTop20-3UscxH {
		margin-top: 20px !important;
	}
	.DevilBro-settings .marginTop40-1bNyG9 {
		margin-top: 40px !important;
	}
	.DevilBro-settings .marginTop60-10QB5x {
		margin-top: 60px !important;
	}
	
	.DevilBro-settings .DevilBro-settings-inner {
		padding-left: 15px;
		padding-right: 5px;
	}
	
	.DevilBro-settings .DevilBro-settings-inner-list {
		padding-left: 15px;
	}
	
	.DevilBro-modal .inputNumberWrapper .numberinput-buttons-zone:hover + .input-2YozMi,
	.DevilBro-settings .inputNumberWrapper .numberinput-buttons-zone:hover + .input-2YozMi {
		border-color: black;
	}
	.DevilBro-modal .inputNumberWrapper .numberinput-buttons-zone:hover + .input-2YozMi:focus,
	.DevilBro-settings .inputNumberWrapper .numberinput-buttons-zone:hover + .input-2YozMi:focus,
	.DevilBro-modal .inputNumberWrapper .numberinput-buttons-zone.pressed + .input-2YozMi,
	.DevilBro-settings .inputNumberWrapper .numberinput-buttons-zone.pressed + .input-2YozMi {
		border-color: #7289da;
	}
	.DevilBro-modal .inputNumberWrapper,
	.DevilBro-settings .inputNumberWrapper {
		position: relative !important;
	}
	.DevilBro-modal .inputNumberWrapper .input-2YozMi[type=number],
	.DevilBro-settings .inputNumberWrapper .input-2YozMi[type=number] {
		padding-right: 25px;
	}
	.DevilBro-modal .inputNumberWrapper .input-2YozMi[type=number]::-webkit-inner-spin-button, 
	.DevilBro-modal .inputNumberWrapper .input-2YozMi[type=number]::-webkit-outer-spin-button,
	.DevilBro-settings .inputNumberWrapper .input-2YozMi[type=number]::-webkit-inner-spin-button, 
	.DevilBro-settings .inputNumberWrapper .input-2YozMi[type=number]::-webkit-outer-spin-button {
		-webkit-appearance: none;
	}
	.DevilBro-modal .inputNumberWrapper .numberinput-buttons-zone,
	.DevilBro-settings .inputNumberWrapper .numberinput-buttons-zone {
		cursor: pointer;
		position: absolute;
		top: 2px;
		right: 8px;
		text-align: center;
		vertical-align: middle;
		width: 15px;
	}
	.DevilBro-modal .inputNumberWrapper.inputNumberWrapperMini .numberinput-buttons-zone,
	.DevilBro-settings .inputNumberWrapper.inputNumberWrapperMini .numberinput-buttons-zone {
		top: -4px;
		right: 4px;
	}
	.DevilBro-modal .inputNumberWrapper .numberinput-button-up,
	.DevilBro-settings .inputNumberWrapper .numberinput-button-up {
		border-color: transparent transparent #999 transparent;
		border-style: solid;
		border-width: 2.5px 5px 5px 5px;
		display: inline-block;
	}
	.DevilBro-modal .inputNumberWrapper .numberinput-button-up:hover,
	.DevilBro-settings .inputNumberWrapper .numberinput-button-up:hover {
		border-bottom-color: #666;
	}
	.theme-light .DevilBro-modal .inputNumberWrapper .numberinput-button-up,
	.theme-light .DevilBro-settings .inputNumberWrapper .numberinput-button-up {
		border-bottom-color: #dcddde;
	}
	.theme-light .DevilBro-modal .inputNumberWrapper .numberinput-button-up:hover,
	.theme-light .DevilBro-settings .inputNumberWrapper .numberinput-button-up:hover {
		border-bottom-color: #4f545c;
	}
	.theme-dark .DevilBro-modal .inputNumberWrapper .numberinput-button-up,
	.theme-dark .DevilBro-settings .inputNumberWrapper .numberinput-button-up {
		border-bottom-color: #72767d;
	}
	.theme-dark .DevilBro-modal .inputNumberWrapper .numberinput-button-up:hover,
	.theme-dark .DevilBro-settings .inputNumberWrapper .numberinput-button-up:hover {
		border-bottom-color: #f6f6f7;
	}
	.DevilBro-modal .inputNumberWrapper .numberinput-button-down,
	.DevilBro-settings .inputNumberWrapper .numberinput-button-down {
		border-color: #999 transparent transparent transparent;
		border-style: solid;
		border-width: 5px 5px 2.5px 5px;
		display: inline-block;
	}
	.DevilBro-modal .inputNumberWrapper .numberinput-button-down:hover,
	.DevilBro-settings .inputNumberWrapper .numberinput-button-down:hover {
		border-top-color: #666;
	}
	.theme-light .DevilBro-modal .inputNumberWrapper .numberinput-button-down,
	.theme-light .DevilBro-settings .inputNumberWrapper .numberinput-button-down {
		border-top-color: #dcddde;
	}
	.theme-light .DevilBro-modal .inputNumberWrapper .numberinput-button-down:hover,
	.theme-light .DevilBro-settings .inputNumberWrapper .numberinput-button-down:hover {
		border-top-color: #4f545c;
	}
	.theme-dark .DevilBro-modal .inputNumberWrapper .numberinput-button-down,
	.theme-dark .DevilBro-settings .inputNumberWrapper .numberinput-button-down {
		border-top-color: #72767d;
	}
	.theme-dark .DevilBro-modal .inputNumberWrapper .numberinput-button-down:hover,
	.theme-dark .DevilBro-settings .inputNumberWrapper .numberinput-button-down:hover {
		border-top-color: #f6f6f7;
	}
	
	.DevilBro-settings .card-11ynQk,
	.DevilBro-settings .card-11ynQk .card-11ynQk-inner {
		width: 550px;
		min-height: 28px;
	}
	
	.DevilBro-settings .card-11ynQk:before {
		z-index: 50;
		left: -10px;
	}
	
	.DevilBro-settings .card-11ynQk .card-11ynQk-inner {
		overflow: hidden;
		display: flex;
		align-items: center;
		position: relative;
		z-index: 100;
	}
	
	.DevilBro-settings .card-11ynQk .button-1qrA-N {
		opacity: 0;
		position: absolute;
		right: -31px;
		top: -12px;
		z-index: 200;
	}
	
	.DevilBro-settings .card-11ynQk:hover .button-1qrA-N {
		opacity: 1;
	}
	
	.DevilBro-modal .checkboxContainer-1sZ9eo,
	.DevilBro-settings .checkboxContainer-1sZ9eo {
		margin-left: 10px;
	}
	
	.DevilBro-modal .checkboxContainer-1sZ9eo:before,
	.DevilBro-settings .checkboxContainer-1sZ9eo:before {
		display: none;
	}
	
	.DevilBro-modal [class^="swatches"].disabled {
		cursor: no-drop;
		filter: grayscale(70%) brightness(50%);
	}

	.DevilBro-modal [class^="ui-color-picker-swatch"] {
		cursor: pointer;
		width: 22px;
		height: 22px;
		margin-bottom: 5px;
		margin-top: 5px;
		border: 4px solid transparent;
		border-radius: 12px;
	}
	
	.DevilBro-modal [class^="swatches"].disabled [class^="ui-color-picker-swatch"] {
		cursor: no-drop;
	}

	.DevilBro-modal [class^="ui-color-picker-swatch"].large {
		min-width: 62px;
		height: 62px;
		border-radius: 25px;
	}

	.DevilBro-modal [class^="ui-color-picker-swatch"].nocolor {
		border: 4px solid red;
	}
	
	.DevilBro-modal [class^="color-picker-dropper"] {
		position: relative;
		left: 40px;
		top: 10px;
	}
	
	@keyframes animation-backdrop {
		to { opacity: 0.85; }
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
		padding: 10px 10px 10px 30px;
		overflow: hidden;
		display: initial;
		margin: auto;
	}
	.colorpicker-modal .modal-3HOjGZ {
		width: 600px;
	}
	.colorpicker-modal .colorpicker-color,
	.colorpicker-modal .colorpicker-slider,
	.colorpicker-modal .colorpicker-controls {
		float: left;
		margin-right: 20px;
	}
	.colorpicker-modal .colorpicker-inputs {
		text-align: center;
		width: 150px;
		padding: 3px 3px 3px 10px;
		margin-top: 87px;
	}
	.colorpicker-modal .colorpicker-pickerpane, 
	.colorpicker-modal .colorpicker-black, 
	.colorpicker-modal .colorpicker-white, 
	.colorpicker-modal .colorpicker-color {
		position: relative;
		top: 0px;
		left: 0px;
		height: 308px;
		width: 308px;
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
		height: 308px;
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
		height: 65px;
		width: 80px;
		float: left;
	}
	.colorpicker-modal .colorpicker-preview-0 {
		border-radius: 5px 0 0 5px;
		border-right: none;
	}
	.colorpicker-modal .colorpicker-preview-2 {
		border-radius: 0 5px 5px 0;
		border-left: none;
	}`
);
