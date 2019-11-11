if (window.BDFDB && BDFDB.ListenerUtils && typeof BDFDB.ListenerUtils.remove == "function") BDFDB.ListenerUtils.remove(BDFDB);
if (window.BDFDB && BDFDB.ObserverUtils && typeof BDFDB.ObserverUtils.disconnect == "function") BDFDB.ObserverUtils.disconnect(BDFDB);
if (window.BDFDB && BDFDB.ModuleUtils && typeof BDFDB.ModuleUtils.unpatch == "function") BDFDB.ModuleUtils.unpatch(BDFDB);
var BDFDB = {
	myPlugins: BDFDB && BDFDB.myPlugins || {},
	InternalData: BDFDB && BDFDB.InternalData || {
		pressedKeys: [],
		mousePosition: {
			pageX: 0,
			pageY: 0
		}
	},
	BDv2Api: BDFDB && BDFDB.BDv2Api || undefined,
	pressedKeys: [], //REMOVE
	mousePosition: {pageX: 0, pageY: 0}, //REMOVE
	name: "$BDFDB"
};
(_ => {
	var loadid = Math.round(Math.random() * 10000000000000000), InternalBDFDB = {};
	BDFDB.InternalData.loadid = loadid;
	BDFDB.InternalData.creationTime = performance.now();

	BDFDB.LogUtils = {};
	BDFDB.LogUtils.log = function (string, name) {
		if (typeof string != "string") string = "";
		if (typeof name != "string" || name == "$BDFDB") name = "BDFDB";
		console.log(`%c[${name}]%c`, "color: #3a71c1; font-weight: 700;", "", string.trim());
	};
	BDFDB.LogUtils.warn = function (string, name) {
		if (typeof string != "string") string = "";
		if (typeof name != "string" || name == "$BDFDB") name = "BDFDB";
		console.warn(`%c[${name}]%c`, "color: #3a71c1; font-weight: 700;", "", string.trim());
	};
	BDFDB.LogUtils.error = function (string, name) {
		if (typeof string != "string") string = "";
		if (typeof name != "string" || name == "$BDFDB") name = "BDFDB";
		console.error(`%c[${name}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: " + string.trim());
	};
	
	BDFDB.LogUtils.log("Loading library.");
	
	BDFDB.PluginUtils = {};
	BDFDB.PluginUtils.init = function (plugin) {
		plugin.name = plugin.name || (typeof plugin.getName == "function" ? plugin.getName() : null);
		plugin.version = plugin.version || (typeof plugin.getVersion == "function" ? plugin.getVersion() : null);
		plugin.author = plugin.author || (typeof plugin.getAuthor == "function" ? plugin.getAuthor() : null);
		plugin.description = plugin.description || (typeof plugin.getDescription == "function" ? plugin.getDescription() : null);
		
		InternalBDFDB.clearStartTimeout(plugin);

		var loadmessage = BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_started", "v" + plugin.version);
		BDFDB.LogUtils.log(loadmessage, plugin.name);
		if (!BDFDB.BDUtils.getSettings("fork-ps-2")) BDFDB.NotificationUtils.toast(plugin.name + " " + loadmessage, {nopointer: true, selector: "plugin-started-toast"});

		var url = typeof plugin.getRawUrl == "function" && typeof plugin.getRawUrl() == "string" ? plugin.getRawUrl() : `https://mwittrien.github.io/BetterDiscordAddons/Plugins/${plugin.name}/${plugin.name}.plugin.js`;
		BDFDB.PluginUtils.checkUpdate(plugin.name, url);

		if (typeof plugin.initConstructor === "function") BDFDB.TimeUtils.suppress(plugin.initConstructor.bind(plugin), "Could not initiate constructor!", plugin.name)();
		if (typeof plugin.css === "string") BDFDB.DOMUtils.appendLocalStyle(plugin.name, plugin.css);

		InternalBDFDB.patchPlugin(plugin);
		InternalBDFDB.addOnSettingsClosedListener(plugin);
		InternalBDFDB.addOnSwitchListener(plugin);
		InternalBDFDB.addContextListeners(plugin);

		BDFDB.PluginUtils.translate(plugin);

		BDFDB.PluginUtils.checkChangeLog(plugin);

		if (!window.PluginUpdates || typeof window.PluginUpdates !== "object") window.PluginUpdates = {plugins: {} };
		window.PluginUpdates.plugins[url] = {name: plugin.name, raw: url, version: plugin.version};
		if (typeof window.PluginUpdates.interval === "undefined") window.PluginUpdates.interval = BDFDB.TimeUtils.interval(_ => {BDFDB.PluginUtils.checkAllUpdates();}, 1000*60*60*2);

		plugin.started = true;
		delete plugin.stopping;

		for (let name in BDFDB.myPlugins) if (!BDFDB.myPlugins[name].started && typeof BDFDB.myPlugins[name].initialize == "function") setImmediate(() => {BDFDB.TimeUtils.suppress(BDFDB.myPlugins[name].initialize.bind(BDFDB.myPlugins[name]), "Could not initiate plugin!", name)();});
	};
	BDFDB.PluginUtils.clear = function (plugin) {
		InternalBDFDB.clearStartTimeout(plugin);

		delete BDFDB.myPlugins[plugin.name];

		var unloadmessage = BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_stopped", "v" + plugin.version);
		BDFDB.LogUtils.log(unloadmessage, plugin.name);
		if (!BDFDB.BDUtils.getSettings("fork-ps-2")) BDFDB.NotificationUtils.toast(plugin.name + " " + unloadmessage, {nopointer: true, selector: "plugin-stopped-toast"});

		var url = typeof plugin.getRawUrl == "function" && typeof plugin.getRawUrl() == "string" ? plugin.getRawUrl() : `https://mwittrien.github.io/BetterDiscordAddons/Plugins/${plugin.name}/${plugin.name}.plugin.js`;

		if (typeof plugin.css === "string") BDFDB.DOMUtils.removeLocalStyle(plugin.name);

		BDFDB.ModuleUtils.unpatch(plugin);
		BDFDB.ListenerUtils.remove(plugin);
		BDFDB.ObserverUtils.disconnect(plugin);
		InternalBDFDB.removeOnSwitchListener(plugin);
		
		for (let modal of document.querySelectorAll(`.${plugin.name}-modal, .${plugin.name.toLowerCase()}-modal, .${plugin.name}-settingsmodal, .${plugin.name.toLowerCase()}-settingsmodal`)) {
			let closebutton = modal.querySelector(BDFDB.dotCN.modalclose);
			if (closebutton) closebutton.click();
		}

		delete window.PluginUpdates.plugins[url];

		delete plugin.started;
		BDFDB.TimeUtils.timeout(() => {delete plugin.stopping;});
	};
	BDFDB.PluginUtils.translate = function (plugin) {
		plugin.labels = {};
		if (typeof plugin.setLabelsByLanguage === "function" || typeof plugin.changeLanguageStrings === "function") {
			if (document.querySelector("html").lang) translate();
			else {
				var translateinterval = BDFDB.TimeUtils.interval(_ => {
					if (document.querySelector("html").lang) {
						BDFDB.TimeUtils.clear(translateinterval);
						translate();
					}
				}, 100);
			}
			function translate() {
				var language = BDFDB.LanguageUtils.getLanguage();
				if (typeof plugin.setLabelsByLanguage === "function") plugin.labels = plugin.setLabelsByLanguage(language.id);
				if (typeof plugin.changeLanguageStrings === "function") plugin.changeLanguageStrings();
				BDFDB.LogUtils.log(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_translated", language.ownlang), plugin.name);
			}
		}
	};
	BDFDB.PluginUtils.checkUpdate = function (pluginname, url) {
		if (BDFDB.BDUtils.isBDv2() || !pluginname || !url) return;
		LibraryRequires.request(url, (error, response, result) => {
			if (error) return;
			var newversion = result.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i);
			if (!newversion) return;
			if (BDFDB.NumberUtils.getVersionDifference(newversion[0], window.PluginUpdates.plugins[url].version) > 0.2) {
				BDFDB.NotificationUtils.toast(`${pluginname} will be force updated, because your version is heavily outdated.`, {type:"warn", nopointer:true, selector:"plugin-forceupdate-toast"});
				BDFDB.PluginUtils.downloadUpdate(pluginname, url);
			}
			else if (BDFDB.NumberUtils.compareVersions(newversion[0], window.PluginUpdates.plugins[url].version)) BDFDB.PluginUtils.showUpdateNotice(pluginname, url);
			else BDFDB.PluginUtils.removeUpdateNotice(pluginname);
		});
	};
	BDFDB.PluginUtils.checkAllUpdates = function () {
		for (let url in window.PluginUpdates.plugins) {
			var plugin = window.PluginUpdates.plugins[url];
			BDFDB.PluginUtils.checkUpdate(plugin.name, plugin.raw);
		}
	};
	BDFDB.PluginUtils.showUpdateNotice = function (pluginname, url) {
		if (!pluginname || !url) return;
		var updatenotice = document.querySelector("#pluginNotice");
		if (!updatenotice) {
			updatenotice = BDFDB.NotificationUtils.notice(`The following plugins need to be updated:&nbsp;&nbsp;<strong id="outdatedPlugins"></strong>`, {html:true, id:"pluginNotice", type:"info", btn:!BDFDB.BDUtils.isAutoLoadEnabled() ? "Reload" : "", customicon:`<svg height="100%" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="100%" version="1.1" viewBox="0 0 2000 2000"><metadata /><defs><filter id="shadow1"><feDropShadow dx="20" dy="0" stdDeviation="20" flood-color="rgba(0,0,0,0.35)"/></filter><filter id="shadow2"><feDropShadow dx="15" dy="0" stdDeviation="20" flood-color="rgba(255,255,255,0.15)"/></filter><filter id="shadow3"><feDropShadow dx="10" dy="0" stdDeviation="20" flood-color="rgba(0,0,0,0.35)"/></filter></defs><g><path style="filter: url(#shadow3)" d="M1195.44+135.442L1195.44+135.442L997.6+136.442C1024.2+149.742+1170.34+163.542+1193.64+179.742C1264.34+228.842+1319.74+291.242+1358.24+365.042C1398.14+441.642+1419.74+530.642+1422.54+629.642L1422.54+630.842L1422.54+632.042C1422.54+773.142+1422.54+1228.14+1422.54+1369.14L1422.54+1370.34L1422.54+1371.54C1419.84+1470.54+1398.24+1559.54+1358.24+1636.14C1319.74+1709.94+1264.44+1772.34+1193.64+1821.44C1171.04+1837.14+1025.7+1850.54+1000+1863.54L1193.54+1864.54C1539.74+1866.44+1864.54+1693.34+1864.54+1296.64L1864.54+716.942C1866.44+312.442+1541.64+135.442+1195.44+135.442Z" fill="#171717" opacity="1"/><path style="filter: url(#shadow2)" d="M1695.54+631.442C1685.84+278.042+1409.34+135.442+1052.94+135.442L361.74+136.442L803.74+490.442L1060.74+490.442C1335.24+490.442+1335.24+835.342+1060.74+835.342L1060.74+1164.84C1150.22+1164.84+1210.53+1201.48+1241.68+1250.87C1306.07+1353+1245.76+1509.64+1060.74+1509.64L361.74+1863.54L1052.94+1864.54C1409.24+1864.54+1685.74+1721.94+1695.54+1368.54C1695.54+1205.94+1651.04+1084.44+1572.64+999.942C1651.04+915.542+1695.54+794.042+1695.54+631.442Z" fill="#3E82E5" opacity="1"/><path style="filter: url(#shadow1)" d="M1469.25+631.442C1459.55+278.042+1183.05+135.442+826.65+135.442L135.45+135.442L135.45+1004C135.45+1004+135.427+1255.21+355.626+1255.21C575.825+1255.21+575.848+1004+575.848+1004L577.45+490.442L834.45+490.442C1108.95+490.442+1108.95+835.342+834.45+835.342L664.65+835.342L664.65+1164.84L834.45+1164.84C923.932+1164.84+984.244+1201.48+1015.39+1250.87C1079.78+1353+1019.47+1509.64+834.45+1509.64L135.45+1509.64L135.45+1864.54L826.65+1864.54C1182.95+1864.54+1459.45+1721.94+1469.25+1368.54C1469.25+1205.94+1424.75+1084.44+1346.35+999.942C1424.75+915.542+1469.25+794.042+1469.25+631.442Z" fill="#FFFFFF" opacity="1"/></g></svg>`});
			updatenotice.style.setProperty("display", "block", "important");
			updatenotice.style.setProperty("visibility", "visible", "important");
			updatenotice.style.setProperty("opacity", "1", "important");
			updatenotice.querySelector(BDFDB.dotCN.noticedismiss).addEventListener("click", _ => {
				BDFDB.DOMUtils.remove(".update-clickme-tooltip");
			});
			var reloadbutton = updatenotice.querySelector(BDFDB.dotCN.noticebutton);
			if (reloadbutton) {
				BDFDB.DOMUtils.toggle(reloadbutton, true);
				reloadbutton.addEventListener("click", _ => {
					window.location.reload(false);
				});
				reloadbutton.addEventListener("mouseenter", _ => {
					if (window.PluginUpdates.downloaded) BDFDB.TooltipUtils.create(reloadbutton, window.PluginUpdates.downloaded.join(", "), {type:"bottom", selector:"update-notice-tooltip", style: "max-width: 420px"});
				});
			}
		}
		if (updatenotice) {
			var updatenoticelist = updatenotice.querySelector("#outdatedPlugins");
			if (updatenoticelist && !updatenoticelist.querySelector(`#${pluginname}-notice`)) {
				if (updatenoticelist.querySelector("span")) updatenoticelist.appendChild(BDFDB.DOMUtils.create(`<span class="separator">, </span>`));
				var updateentry = BDFDB.DOMUtils.create(`<span id="${pluginname}-notice">${pluginname}</span>`);
				updateentry.addEventListener("click", _ => {BDFDB.PluginUtils.downloadUpdate(pluginname, url);});
				updatenoticelist.appendChild(updateentry);
				if (!document.querySelector(".update-clickme-tooltip")) BDFDB.TooltipUtils.create(updatenoticelist, "Click us!", {type:"bottom", selector:"update-clickme-tooltip", delay:500});
			}
		}
	};
	BDFDB.PluginUtils.removeUpdateNotice = function (pluginname, updatenotice = document.querySelector("#pluginNotice")) {
		if (!pluginname || !updatenotice) return;
		var updatenoticelist = updatenotice.querySelector("#outdatedPlugins");
		if (updatenoticelist) {
			var noticeentry = updatenoticelist.querySelector(`#${pluginname}-notice`);
			if (noticeentry) {
				var nextsibling = noticeentry.nextSibling;
				var prevsibling = noticeentry.prevSibling;
				if (nextsibling && BDFDB.DOMUtils.containsClass(nextsibling, "separator")) nextsibling.remove();
				else if (prevsibling && BDFDB.DOMUtils.containsClass(prevsibling, "separator")) prevsibling.remove();
				noticeentry.remove();
			}
			if (!updatenoticelist.querySelector("span")) {
				var reloadbutton = updatenotice.querySelector(BDFDB.dotCN.noticebutton);
				if (reloadbutton) {
					updatenotice.querySelector(".notice-message").innerText = "To finish updating you need to reload.";
					BDFDB.DOMUtils.toggle(reloadbutton, false);
				}
				else updatenotice.querySelector(BDFDB.dotCN.noticedismiss).click();
			}
		}
	};
	BDFDB.PluginUtils.downloadUpdate = function (pluginname, url) {
		if (!pluginname || !url) return;
		LibraryRequires.request(url, (error, response, result) => {
			if (error) return BDFDB.LogUtils.warn("Unable to get update for " + pluginname);
			BDFDB.InternalData.creationTime = 0;
			var newversion = result.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i);
			newversion = newversion.toString().replace(/['"]/g, "");
			LibraryRequires.fs.writeFileSync(LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), url.split("/").slice(-1)[0]), result);
			BDFDB.NotificationUtils.toast(`${pluginname} v${window.PluginUpdates.plugins[url].version} has been replaced by ${pluginname} v${newversion}.`, {nopointer:true, selector:"plugin-updated-toast"});
			var updatenotice = document.querySelector("#pluginNotice");
			if (updatenotice) {
				if (updatenotice.querySelector(BDFDB.dotCN.noticebutton)) {
					window.PluginUpdates.plugins[url].version = newversion;
					if (!window.PluginUpdates.downloaded) window.PluginUpdates.downloaded = [];
					if (!window.PluginUpdates.downloaded.includes(pluginname)) window.PluginUpdates.downloaded.push(pluginname);
				}
				BDFDB.PluginUtils.removeUpdateNotice(pluginname, updatenotice);
			}
		});
	};
	BDFDB.PluginUtils.checkChangeLog = function (plugin) {
		if (!BDFDB.ObjectUtils.is(plugin) || !plugin.changelog) return;
		var changelog = BDFDB.DataUtils.load(plugin, "changelog");
		if (!changelog.currentversion || BDFDB.NumberUtils.compareVersions(plugin.version, changelog.currentversion)) {
			changelog.currentversion = plugin.version;
			BDFDB.DataUtils.save(changelog, plugin, "changelog");
			BDFDB.PluginUtils.openChangeLog(plugin);
		}
	};
	BDFDB.PluginUtils.openChangeLog = function (plugin) {
		if (!BDFDB.ObjectUtils.is(plugin) || !plugin.changelog) return;
		var changeLogHTML = "", headers = {
			added: "New Features",
			fixed: "Bug Fixes",
			improved: "Improvements",
			progress: "Progress"
		};
		for (let type in plugin.changelog) {
			type = type.toLowerCase();
			var classname = BDFDB.disCN["changelog" + type];
			if (classname) {
				changeLogHTML += `<h1 class="${classname + " " + BDFDB.disCN.margintop20}"${changeLogHTML.indexOf("<h1") == -1 ? `style="margin-top: 0px !important;"` : ""}>${headers[type]}</h1><ul>`;
				for (let log of plugin.changelog[type]) changeLogHTML += `<li><strong>${log[0]}</strong>${log[1] ? (": " + log[1] + ".") : ""}</li>`;
				changeLogHTML += `</ul>`
			}
		}
		if (changeLogHTML) BDFDB.ModalUtils.open(plugin, {header:BDFDB.LanguageUtils.LanguageStrings.CHANGE_LOG, children:BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(changeLogHTML)), className:BDFDB.disCN.modalchangelogmodal, contentClassName:BDFDB.disCNS.changelogcontainer + BDFDB.disCN.modalminicontent});
	};
	BDFDB.PluginUtils.createSettingsPanel = function (plugin, children) {
		if (!BDFDB.ObjectUtils.is(plugin) || !children || (!BDFDB.ReactUtils.isValidElement(children) && !BDFDB.ArrayUtils.is(children)) || (BDFDB.ArrayUtils.is(children) && !children.length)) return;
		var settingspanel = BDFDB.DOMUtils.create(`<div class="${plugin.name}-settings ${BDFDB.disCN.settingspanel}"></div>`);
		BDFDB.ReactUtils.render(BDFDB.ReactUtils.createElement(LibraryComponents.SettingsPanel, {
			title: plugin.name,
			children
		}), settingspanel);
		return settingspanel;
	};
	InternalBDFDB.clearStartTimeout = function (plugin) {
		if (!BDFDB.ObjectUtils.is(plugin)) return;
		BDFDB.TimeUtils.clear(plugin.startTimeout, plugin.libLoadTimeout);
		delete plugin.startTimeout;
		delete plugin.libLoadTimeout;
	};
	InternalBDFDB.addOnSettingsClosedListener = function (plugin) {
		if (BDFDB.ObjectUtils.is(plugin) && typeof plugin.onSettingsClosed === "function") {
			let SettingsLayer = BDFDB.ModuleUtils.findByName("StandardSidebarView");
			if (SettingsLayer) BDFDB.ModuleUtils.patch(plugin, SettingsLayer.prototype, "componentWillUnmount", {after: e => {
				plugin.onSettingsClosed();
			}});
		}
	};
	InternalBDFDB.addOnSwitchListener = function (plugin) {
		if (BDFDB.ObjectUtils.is(plugin) && typeof plugin.onSwitch === "function") {
			InternalBDFDB.removeOnSwitchListener(plugin);
			var spacer = document.querySelector(`${BDFDB.dotCN.guildswrapper} ~ * > ${BDFDB.dotCN.chatspacer}`);
			if (spacer) {
				var nochannelobserver = new MutationObserver(changes => {changes.forEach(change => {
					if (change.target && BDFDB.DOMUtils.containsClass(change.target, BDFDB.disCN.nochannel)) plugin.onSwitch();
				});});
				var nochannel = spacer.querySelector(BDFDB.dotCNC.chat + BDFDB.dotCN.nochannel);
				if (nochannel) nochannelobserver.observe(nochannel, {attributes:true});
				plugin.onSwitchFix = new MutationObserver(changes => {changes.forEach(change => {if (change.addedNodes) {change.addedNodes.forEach(node => {
					if (BDFDB.DOMUtils.containsClass(node, BDFDB.disCN.chat, BDFDB.disCN.nochannel, false)) nochannelobserver.observe(node, {attributes:true});
				});}});});
				plugin.onSwitchFix.observe(spacer, {childList:true});
			}
		}
	};
	InternalBDFDB.removeOnSwitchListener = function (plugin) {
		if (BDFDB.ObjectUtils.is(plugin) && typeof plugin.onSwitch === "function" && BDFDB.ObjectUtils.is(plugin.onSwitchFix)) {
			plugin.onSwitchFix.disconnect();
			delete plugin.onSwitchFix;
		}
	};
	
	BDFDB.ObserverUtils = {};
	BDFDB.ObserverUtils.connect = function (plugin, eleOrSelec, observer, config = {childList: true}) {
		if (!BDFDB.ObjectUtils.is(plugin) || !eleOrSelec || !observer) return;
		if (BDFDB.ObjectUtils.isEmpty(plugin.observers)) plugin.observers = {};
		if (!BDFDB.ArrayUtils.is(plugin.observers[observer.name])) plugin.observers[observer.name] = [];
		if (!observer.multi) for (let subinstance of plugin.observers[observer.name]) subinstance.disconnect();
		if (observer.instance) plugin.observers[observer.name].push(observer.instance);
		var instance = plugin.observers[observer.name][plugin.observers[observer.name].length - 1];
		if (instance) {
			var node = Node.prototype.isPrototypeOf(eleOrSelec) ? eleOrSelec : typeof eleOrSelec === "string" ? document.querySelector(eleOrSelec) : null;
			if (node) instance.observe(node, config);
		}
	};
	BDFDB.ObserverUtils.disconnect = function (plugin, observer) {
		if (BDFDB.ObjectUtils.is(plugin) && !BDFDB.ObjectUtils.isEmpty(plugin.observers)) {
			let observername = typeof observer == "string" ? observer : (BDFDB.ObjectUtils.is(observer) ? observer.name : null);
			if (!observername) {
				for (let observer in plugin.observers) for (let instance of plugin.observers[observer]) instance.disconnect();
				delete plugin.observers;
			}
			else if (!BDFDB.ArrayUtils.is(plugin.observers[observername])) {
				for (let instance of plugin.observers[observername]) instance.disconnect();
				delete plugin.observers[observername];
			}
		}
	};

	BDFDB.ListenerUtils = {};
	BDFDB.ListenerUtils.add = function (plugin, ele, actions, selectorOrCallback, callbackOrNothing) {
		if (!BDFDB.ObjectUtils.is(plugin) || (!Node.prototype.isPrototypeOf(ele) && ele !== window) || !actions) return;
		var callbackIs4th = typeof selectorOrCallback == "function";
		var selector = callbackIs4th ? undefined : selectorOrCallback;
		var callback = callbackIs4th ? selectorOrCallback : callbackOrNothing;
		if (typeof callback != "function") return;
		BDFDB.ListenerUtils.remove(plugin, ele, actions, selector);
		for (var action of actions.split(" ")) {
			action = action.split(".");
			var eventname = action.shift().toLowerCase();
			if (!eventname) return;
			var origeventname = eventname;
			eventname = eventname == "mouseenter" || eventname == "mouseleave" ? "mouseover" : eventname;
			var namespace = (action.join(".") || "") + plugin.name;
			if (!BDFDB.ArrayUtils.is(plugin.listeners)) plugin.listeners = [];
			var eventcallback = null;
			if (selector) {
				if (origeventname == "mouseenter" || origeventname == "mouseleave") {
					eventcallback = e => {
						for (let child of e.path) if (typeof child.matches == "function" && child.matches(selector) && !child[namespace + "BDFDB" + origeventname]) {
							child[namespace + "BDFDB" + origeventname] = true;
							if (origeventname == "mouseenter") callback(BDFDB.ListenerUtils.copyEvent(e, child));
							let mouseout = e2 => {
								if (e2.target.contains(child) || e2.target == child || !child.contains(e2.target)) {
									if (origeventname == "mouseleave") callback(BDFDB.ListenerUtils.copyEvent(e, child));
									delete child[namespace + "BDFDB" + origeventname];
									document.removeEventListener("mouseout", mouseout);
								}
							};
							document.addEventListener("mouseout", mouseout);
							break;
						}
					};
				}
				else {
					eventcallback = e => {
						for (let child of e.path) if (typeof child.matches == "function" && child.matches(selector)) {
							callback(BDFDB.ListenerUtils.copyEvent(e, child));
							break;
						}
					};
				}
			}
			else eventcallback = e => {callback(BDFDB.ListenerUtils.copyEvent(e, ele));};

			plugin.listeners.push({ele, eventname, origeventname, namespace, selector, eventcallback});
			ele.addEventListener(eventname, eventcallback, true);
		}
	};
	BDFDB.ListenerUtils.remove = function (plugin, ele, actions = "", selector) {
		if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ArrayUtils.is(plugin.listeners)) return;
		if (Node.prototype.isPrototypeOf(ele) || ele === window) {
			for (var action of actions.split(" ")) {
				action = action.split(".");
				var eventname = action.shift().toLowerCase();
				var namespace = (action.join(".") || "") + plugin.name;
				for (let listener of plugin.listeners) {
					let removedlisteners = [];
					if (listener.ele == ele && (!eventname || listener.origeventname == eventname) && listener.namespace == namespace && (selector === undefined || listener.selector == selector)) {
						ele.removeEventListener(listener.eventname, listener.eventcallback, true);
						removedlisteners.push(listener);
					}
					if (removedlisteners.length) plugin.listeners = plugin.listeners.filter(listener => {return removedlisteners.indexOf(listener) < 0;});
				}
			}
		}
		else if (!ele) {
			for (let listener of plugin.listeners) listener.ele.removeEventListener(listener.eventname, listener.eventcallback, true);
			plugin.listeners = [];
		}
	};
	BDFDB.ListenerUtils.multiAdd = function (node, actions, callback) {
		if (!Node.prototype.isPrototypeOf(node) || !actions || typeof callback != "function") return;
		for (var action of actions.trim().split(" ").filter(n => n)) node.addEventListener(action, callback, true);
	};
	BDFDB.ListenerUtils.multiRemove = function (node, actions, callback) {
		if (!Node.prototype.isPrototypeOf(node) || !actions || typeof callback != "function") return;
		for (var action of actions.trim().split(" ").filter(n => n)) node.removeEventListener(action, callback, true);
	};
	BDFDB.ListenerUtils.addToChildren = function (node, actions, selector, callback) {
		if (!Node.prototype.isPrototypeOf(node) || !actions || !selector || !selector.trim() || typeof callback != "function") return;
		for (var action of actions.trim().split(" ").filter(n => n)) {
			var eventcallback = callback;
			if (action == "mouseenter" || action == "mouseleave") eventcallback = e => {if (e.target.matches(selector)) callback(e);};
			node.querySelectorAll(selector.trim()).forEach(child => {child.addEventListener(action, eventcallback, true);});
		}
	};
	BDFDB.ListenerUtils.copyEvent = function (e, ele) {
		if (!e || !e.constructor || !e.type) return e;
		var ecopy = new e.constructor(e.type, e);
		Object.defineProperty(ecopy, "originalEvent", {value: e});
		Object.defineProperty(ecopy, "which", {value: e.which});
		Object.defineProperty(ecopy, "keyCode", {value: e.keyCode});
		Object.defineProperty(ecopy, "path", {value: e.path});
		Object.defineProperty(ecopy, "relatedTarget", {value: e.relatedTarget});
		Object.defineProperty(ecopy, "srcElement", {value: e.srcElement});
		Object.defineProperty(ecopy, "target", {value: e.target});
		Object.defineProperty(ecopy, "toElement", {value: e.toElement});
		if (ele) Object.defineProperty(ecopy, "currentTarget", {value: ele});
		return ecopy;
	};
	BDFDB.ListenerUtils.stopEvent = function (e) {
		if (BDFDB.ObjectUtils.is(e)) {
			if (typeof e.preventDefault == "function") e.preventDefault();
			if (typeof e.stopPropagation == "function") e.stopPropagation();
			if (typeof e.stopImmediatePropagation == "function") e.stopImmediatePropagation();
			if (BDFDB.ObjectUtils.is(e.originalEvent)) {
				if (typeof e.originalEvent.preventDefault == "function") e.originalEvent.preventDefault();
				if (typeof e.originalEvent.stopPropagation == "function") e.originalEvent.stopPropagation();
				if (typeof e.originalEvent.stopImmediatePropagation == "function") e.originalEvent.stopImmediatePropagation();
			}
		}
	};
	
	var NotificationBars = [], DesktopNotificationQueue = {queue:[], running:false};
	BDFDB.NotificationUtils = {};
	BDFDB.NotificationUtils.toast = function (text, options = {}) {
		var toasts = document.querySelector(".toasts, .bd-toasts");
		if (!toasts) {
			var channels = document.querySelector(BDFDB.dotCN.channels + " + div");
			var channelrects = channels ? BDFDB.DOMUtils.getRects(channels) : null;
			var members = channels ? channels.querySelector(BDFDB.dotCN.memberswrap) : null;
			var left = channelrects ? channelrects.left : 310;
			var width = channelrects ? (members ? channelrects.width - BDFDB.DOMUtils.getRects(members).width : channelrects.width) : window.outerWidth - 0;
			var form = channels ? channels.querySelector("form") : null;
			var bottom = form ? BDFDB.DOMUtils.getRects(form).height : 80;
			toasts = BDFDB.DOMUtils.create(`<div class="toasts bd-toasts" style="width:${width}px; left:${left}px; bottom:${bottom}px;"></div>`);
			(document.querySelector(BDFDB.dotCN.app) || document.body).appendChild(toasts);
		}
		const {type = "", icon = true, timeout = 3000, html = false, selector = "", nopointer = false, color = ""} = options;
		var toast = BDFDB.DOMUtils.create(`<div class="toast bd-toast">${html === true ? text : BDFDB.StringUtils.htmlEscape(text)}</div>`);
		if (type) {
			BDFDB.DOMUtils.addClass(toast, "toast-" + type);
			if (icon) BDFDB.DOMUtils.addClass(toast, "icon");
		}
		else if (color) {
			var rgbcolor = BDFDB.ColorUtils.convert(color, "RGB");
			if (rgbcolor) toast.style.setProperty("background-color", rgbcolor);
		}
		BDFDB.DOMUtils.addClass(toast, selector);
		toasts.appendChild(toast);
		toast.close = _ => {
			if (document.contains(toast)) {
				BDFDB.DOMUtils.addClass(toast, "closing");
				toast.style.setProperty("pointer-events", "none", "important");
				BDFDB.TimeUtils.timeout(_ => {
					toast.remove();
					if (!toasts.querySelectorAll(".toast, .bd-toast").length) toasts.remove();
				}, 3000);
			}
		};
		if (nopointer) toast.style.setProperty("pointer-events", "none", "important");
		else toast.addEventListener("click", toast.close);
		BDFDB.TimeUtils.timeout(_ => {toast.close();}, timeout > 0 ? timeout : 600000);
		return toast;
	};
	BDFDB.NotificationUtils.desktop = function (parsedcontent, parsedoptions = {}) {
		var queue = _ => {
			DesktopNotificationQueue.queue.push({parsedcontent, parsedoptions});
			runqueue();
		};
		var runqueue = _ => {
			if (!DesktopNotificationQueue.running) {
				var notification = DesktopNotificationQueue.queue.shift();
				if (notification) notify(notification.parsedcontent, notification.parsedoptions);
			}
		};
		var notify = (content, options) => {
			DesktopNotificationQueue.running = true;
			var muted = options.silent;
			options.silent = options.silent || options.sound ? true : false;
			var notification = new Notification(content, options);
			var audio = new Audio();
			var timeout = BDFDB.TimeUtils.timeout(_ => {close();}, options.timeout ? options.timeout : 3000);
			if (typeof options.click == "function") notification.onclick = _ => {
				BDFDB.TimeUtils.clear(timeout);
				close();
				options.click();
			};
			if (!muted && options.sound) {
				audio.src = options.sound;
				audio.play();
			}
			var close = _ => {
				audio.pause();
				notification.close();
				DesktopNotificationQueue.running = false;
				BDFDB.TimeUtils.timeout(_ => {runqueue();}, 1000);
			};
		};
		if (!("Notification" in window)) {}
		else if (Notification.permission === "granted") queue();
		else if (Notification.permission !== "denied") Notification.requestPermission(function (response) {if (response === "granted") queue();});
	};
	BDFDB.NotificationUtils.notice = function (text, options = {}) {
		if (!text) return;
		var layers = document.querySelector(BDFDB.dotCN.layers);
		if (!layers) return;
		var id = BDFDB.NumberUtils.generateId(NotificationBars);
		var notice = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN.notice} BDFDB-notice notice-${id}"><div class="${BDFDB.disCN.noticedismiss}" style="height:36px !important; position: absolute !important; top: 0 !important; right: 0 !important; left: unset !important;"></div><span class="notice-message"></span></div>`);
		layers.parentElement.insertBefore(notice, layers);
		var noticemessage = notice.querySelector(".notice-message");
		if (options.platform) for (let platform of options.platform.split(" ")) if (DiscordClasses["noticeicon" + platform]) {
			let icon = BDFDB.DOMUtils.create(`<i class="${BDFDB.disCN["noticeicon" + platform]}"></i>`);
			BDFDB.DOMUtils.addClass(icon, BDFDB.disCN.noticeplatformicon);
			BDFDB.DOMUtils.removeClass(icon, BDFDB.disCN.noticeicon);
			notice.insertBefore(icon, noticemessage);
		}
		if (options.customicon) {
			let iconinner = BDFDB.DOMUtils.create(options.customicon)
			let icon = BDFDB.DOMUtils.create(`<i></i>`);
			if (iconinner.tagName == "span" && !iconinner.firstElementChild) icon.style.setProperty("background", `url(${options.customicon}) center/cover no-repeat`);
			else icon.appendChild(iconinner);
			BDFDB.DOMUtils.addClass(icon, BDFDB.disCN.noticeplatformicon);
			BDFDB.DOMUtils.removeClass(icon, BDFDB.disCN.noticeicon);
			notice.insertBefore(icon, noticemessage);
		}
		if (options.btn || options.button) notice.appendChild(BDFDB.DOMUtils.create(`<button class="${BDFDB.disCNS.noticebutton + BDFDB.disCNS.titlesize14 + BDFDB.disCN.weightmedium}">${options.btn || options.button}</button>`));
		if (options.id) notice.id = options.id.split(" ").join("");
		if (options.selector) BDFDB.DOMUtils.addClass(notice, options.selector);
		if (options.css) BDFDB.DOMUtils.appendLocalStyle("BDFDBcustomnotificationbar" + id, options.css);
		if (options.style) notice.style = options.style;
		if (options.html === true) noticemessage.innerHTML = text;
		else {
			var link = document.createElement("a");
			var newtext = [];
			for (let word of text.split(" ")) {
				var encodedword = BDFDB.StringUtils.htmlEscape(word);
				link.href = word;
				newtext.push(link.host && link.host !== window.location.host ? `<label class="${BDFDB.disCN.textlink}">${encodedword}</label>` : encodedword);
			}
			noticemessage.innerHTML = newtext.join(" ");
		}
		var type = null;
		if (options.type && !document.querySelector(BDFDB.dotCNS.chatbase + BDFDB.dotCN.noticestreamer)) {
			if (type = BDFDB.disCN["notice" + options.type]) BDFDB.DOMUtils.addClass(notice, type);
			if (options.type == "premium") {
				var noticebutton = notice.querySelector(BDFDB.dotCN.noticebutton);
				if (noticebutton) BDFDB.DOMUtils.addClass(noticebutton, BDFDB.disCN.noticepremiumaction);
				BDFDB.DOMUtils.addClass(noticemessage, BDFDB.disCN.noticepremiumtext);
				notice.insertBefore(BDFDB.DOMUtils.create(`<i class="${BDFDB.disCN.noticepremiumlogo}"></i>`), noticemessage);
			}
		}
		if (!type) {
			var comp = BDFDB.ColorUtils.convert(options.color, "RGBCOMP");
			if (comp) {
				var fontcolor = comp[0] > 180 && comp[1] > 180 && comp[2] > 180 ? "#000" : "#FFF";
				var backgroundcolor = BDFDB.ColorUtils.convert(comp, "HEX");
				var filter = comp[0] > 180 && comp[1] > 180 && comp[2] > 180 ? "brightness(0%)" : "brightness(100%)";
				BDFDB.DOMUtils.appendLocalStyle("BDFDBcustomnotificationbarColorCorrection" + id, `.BDFDB-notice.notice-${id}{background-color:${backgroundcolor} !important;}.BDFDB-notice.notice-${id} .notice-message {color:${fontcolor} !important;}.BDFDB-notice.notice-${id} ${BDFDB.dotCN.noticebutton} {color:${fontcolor} !important;border-color:${BDFDB.ColorUtils.setAlpha(fontcolor,0.25,"RGBA")} !important;}.BDFDB-notice.notice-${id} ${BDFDB.dotCN.noticebutton}:hover {color:${backgroundcolor} !important;background-color:${fontcolor} !important;}.BDFDB-notice.notice-${id} ${BDFDB.dotCN.noticedismiss} {filter:${filter} !important;}`);
			}
			else BDFDB.DOMUtils.addClass(notice, BDFDB.disCN.noticedefault);
		}
		notice.style.setProperty("height", "36px", "important");
		notice.style.setProperty("min-width", "70vw", "important");
		notice.style.setProperty("left", "unset", "important");
		notice.style.setProperty("right", "unset", "important");
		let sidemargin = ((BDFDB.DOMUtils.getWidth(document.body.firstElementChild) - BDFDB.DOMUtils.getWidth(notice))/2);
		notice.style.setProperty("left", sidemargin + "px", "important");
		notice.style.setProperty("right", sidemargin + "px", "important");
		notice.style.setProperty("min-width", "unset", "important");
		notice.style.setProperty("width", "unset", "important");
		notice.style.setProperty("max-width", "calc(100vw - " + (sidemargin*2) + "px)", "important");
		notice.querySelector(BDFDB.dotCN.noticedismiss).addEventListener("click", _ => {
			notice.style.setProperty("overflow", "hidden", "important");
			notice.style.setProperty("height", "0px", "important");
			BDFDB.TimeUtils.timeout(_ => {
				BDFDB.ArrayUtils.remove(NotificationBars, id);
				BDFDB.DOMUtils.removeLocalStyle("BDFDBcustomnotificationbar" + id);
				BDFDB.DOMUtils.removeLocalStyle("BDFDBcustomnotificationbarColorCorrection" + id);
				notice.remove();
			}, 500);
		});
		return notice;
	};
	BDFDB.NotificationUtils.alert = function (header, body) {
		if (typeof header == "string" && typeof header == "string" && window.BdApi && typeof BdApi.alert == "function") BdApi.alert(header, body);
	};

	var Tooltips = [];
	BDFDB.TooltipUtils = {};
	BDFDB.TooltipUtils.create = function (anker, text, options = {}) {
		var itemlayercontainernative = document.querySelector(BDFDB.dotCN.itemlayercontainer);
		if (!itemlayercontainernative || typeof text != "string" || !Node.prototype.isPrototypeOf(anker) || !document.contains(anker)) return null;
		var itemlayercontainer = document.querySelector(".BDFDB-itemlayercontainer");
		if (!itemlayercontainer) {
			itemlayercontainer = itemlayercontainernative.cloneNode();
			BDFDB.DOMUtils.addClass(itemlayercontainer, "BDFDB-itemlayercontainer");
			itemlayercontainernative.parentElement.insertBefore(itemlayercontainer, itemlayercontainernative.nextSibling);
		}
		var id = BDFDB.NumberUtils.generateId(Tooltips);
		var itemlayer = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN.itemlayer} BDFDB-itemlayer"><div class="${BDFDB.disCN.tooltip} BDFDB-tooltip-${id}"></div></div>`);
		itemlayercontainer.appendChild(itemlayer);
		
		var tooltip = itemlayer.firstElementChild;
		if (options.id) tooltip.id = options.id.split(" ").join("");
		if (options.selector) BDFDB.DOMUtils.addClass(tooltip, options.selector);
		if (options.style) tooltip.style = options.style;
		if (options.html === true) tooltip.innerHTML = text;
		else tooltip.innerText = text;
		if (!options.type || !BDFDB.disCN["tooltip" + options.type.toLowerCase()]) options.type = "top";
		BDFDB.DOMUtils.addClass(tooltip, BDFDB.disCN["tooltip" + options.type.toLowerCase()]);
		tooltip.position = options.type.toLowerCase();
		tooltip.appendChild(BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN.tooltippointer}"></div>`));
		
		if (tooltip.style.getPropertyValue("border-color") && (tooltip.style.getPropertyValue("background-color") || tooltip.style.getPropertyValue("background-image"))) BDFDB.DOMUtils.addClass(tooltip, "tooltip-customcolor");
		else if (options.color && BDFDB.disCN["tooltip" + options.color.toLowerCase()]) BDFDB.DOMUtils.addClass(tooltip, BDFDB.disCN["tooltip" + options.color.toLowerCase()]);
		else BDFDB.DOMUtils.addClass(tooltip, BDFDB.disCN.tooltipblack);
		tooltip.anker = anker;
		
		if (options.hide) BDFDB.DOMUtils.appendLocalStyle("BDFDBhideOtherTooltips" + id, `#app-mount ${BDFDB.dotCN.tooltip}:not(.BDFDB-tooltip-${id}) {display: none !important;}`, itemlayercontainer);
					
		var mouseleave = _ => {
			BDFDB.DOMUtils.remove(itemlayer);
		};
		anker.addEventListener("mouseleave", mouseleave);
		
		var observer = new MutationObserver(changes => {
			changes.forEach(change => {
				var nodes = Array.from(change.removedNodes);
				var ownmatch = nodes.indexOf(itemlayer) > -1;
				var ankermatch = nodes.indexOf(anker) > -1;
				var parentmatch = nodes.some(n => n.contains(anker));
				if (ownmatch || ankermatch || parentmatch) {
					BDFDB.ArrayUtils.remove(Tooltips, id);
					observer.disconnect();
					BDFDB.DOMUtils.remove(itemlayer);
					BDFDB.DOMUtils.removeLocalStyle("BDFDBhideOtherTooltips" + id, itemlayercontainer);
					BDFDB.DOMUtils.removeLocalStyle("BDFDBcustomTooltips" + id, itemlayercontainer);
					if (!itemlayercontainer.firstElementChild) BDFDB.DOMUtils.remove(itemlayercontainer);
					anker.removeEventListener("mouseleave", mouseleave);
				}
			});
		});
		observer.observe(document.body, {subtree:true, childList:true});

		BDFDB.TooltipUtils.update(tooltip);
		
		if (options.delay) {
			BDFDB.DOMUtils.toggle(itemlayer);
			BDFDB.TimeUtils.timeout(_ => {BDFDB.DOMUtils.toggle(itemlayer);}, options.delay);
		}
		return itemlayer;
	};
	BDFDB.TooltipUtils.update = function (tooltip) {
		if (!Node.prototype.isPrototypeOf(tooltip)) return;
		let itemlayer = BDFDB.DOMUtils.getParent(BDFDB.dotCN.itemlayer, tooltip);
		if (!Node.prototype.isPrototypeOf(itemlayer)) return;
		tooltip = itemlayer.querySelector(BDFDB.dotCN.tooltip);
		if (!Node.prototype.isPrototypeOf(tooltip) || !Node.prototype.isPrototypeOf(tooltip.anker) || !tooltip.position) return;
		
		var pointer = tooltip.querySelector(BDFDB.dotCN.tooltippointer);
		var left, top, trects = BDFDB.DOMUtils.getRects(tooltip.anker), irects = BDFDB.DOMUtils.getRects(itemlayer), arects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount)), positionoffsets = {height: 10, width: 10};
		switch (tooltip.position) {
			case "top":
				top = trects.top - irects.height - positionoffsets.height + 2;
				left = trects.left + (trects.width - irects.width) / 2;
				break;
			case "bottom":
				top = trects.top + trects.height + positionoffsets.height - 2;
				left = trects.left + (trects.width - irects.width) / 2;
				break;
			case "left":
				top = trects.top + (trects.height - irects.height) / 2;
				left = trects.left - irects.width - positionoffsets.width + 2;
				break;
			case "right":
				top = trects.top + (trects.height - irects.height) / 2;
				left = trects.left + trects.width + positionoffsets.width - 2;
				break;
			}
			
		itemlayer.style.setProperty("top", top + "px");
		itemlayer.style.setProperty("left", left + "px");
		
		pointer.style.removeProperty("margin-left");
		pointer.style.removeProperty("margin-top");
		if (tooltip.position == "top" || tooltip.position == "bottom") {
			if (left < 0) {
				itemlayer.style.setProperty("left", "5px");
				pointer.style.setProperty("margin-left", `${left - 10}px`);
			}
			else {
				var rightmargin = arects.width - (left + irects.width);
				if (rightmargin < 0) {
					itemlayer.style.setProperty("left", arects.width - irects.width - 5 + "px");
					pointer.style.setProperty("margin-left", `${-1*rightmargin}px`);
				}
			}
		}
		else if (tooltip.position == "left" || tooltip.position == "right") {
			if (top < 0) {
				itemlayer.style.setProperty("top", "5px");
				pointer.style.setProperty("margin-top", `${top - 10}px`);
			}
			else {
				var bottommargin = arects.height - (top + irects.height);
				if (bottommargin < 0) {
					itemlayer.style.setProperty("top", arects.height - irects.height - 5 + "px");
					pointer.style.setProperty("margin-top", `${-1*bottommargin}px`);
				}
			}
		}
	};

	BDFDB.ObjectUtils = {};
	BDFDB.ObjectUtils.is = function (obj) {
		return obj && Object.prototype.isPrototypeOf(obj) && !Array.prototype.isPrototypeOf(obj);
	};
	BDFDB.ObjectUtils.extract = function (obj, ...keys) {
		let newobj = {};
		if (BDFDB.ObjectUtils.is(obj)) for (let key of keys.flat()) if (obj[key]) newobj[key] = obj[key];
		return newobj;
	};
	BDFDB.ObjectUtils.exclude = function (obj, ...keys) {
		let newobj = Object.assign({}, obj);
		BDFDB.ObjectUtils.delete(newobj, ...keys)
		return newobj;
	};
	BDFDB.ObjectUtils.delete = function (obj, ...keys) {
		if (BDFDB.ObjectUtils.is(obj)) for (let key of keys.flat()) delete obj[key];
	};
	BDFDB.ObjectUtils.sort = function (obj, sort, except) {
		if (!BDFDB.ObjectUtils.is(obj)) return {};
		var newobj = {};
		if (sort === undefined || !sort) for (let key of Object.keys(obj).sort()) newobj[key] = obj[key];
		else {
			let values = [];
			for (let key in obj) values.push(obj[key]);
			values = BDFDB.ArrayUtils.keySort(values, sort, except);
			for (let value of values) for (let key in obj) if (BDFDB.equals(value, obj[key])) {
				newobj[key] = value;
				break;
			}
		}
		return newobj;
	};
	BDFDB.ObjectUtils.reverse = function (obj, sort) {
		if (!BDFDB.ObjectUtils.is(obj)) return {};
		var newobj = {};
		for (let key of (sort === undefined || !sort) ? Object.keys(obj).reverse() : Object.keys(obj).sort().reverse()) newobj[key] = obj[key];
		return newobj;
	};
	BDFDB.ObjectUtils.filter = function (obj, filter, bykey = false) {
		if (!BDFDB.ObjectUtils.is(obj)) return {};
		if (typeof filter != "function") return obj;
		return Object.keys(obj).filter(key => filter(bykey ? key : obj[key])).reduce((newobj, key) => (newobj[key] = obj[key], newobj), {});
	};
	BDFDB.ObjectUtils.push = function (obj, value) {
		if (BDFDB.ObjectUtils.is(obj)) obj[Object.keys(obj).length] = value;
	};
	BDFDB.ObjectUtils.pop = function (obj, value) {
		if (BDFDB.ObjectUtils.is(obj)) {
			let keys = Object.keys(obj);
			if (!keys.length) return;
			let value = obj[keys[keys.length-1]];
			delete obj[keys[keys.length-1]];
			return value;
		}
	};
	BDFDB.ObjectUtils.map = function (obj, mapfunc) {
		if (!BDFDB.ObjectUtils.is(obj)) return {};
		if (typeof mapfunc != "string" && typeof mapfunc != "function") return obj;
		var newobj = {};
		for (let key in obj) if (BDFDB.ObjectUtils.is(obj[key])) newobj[key] = typeof mapfunc == "string" ? obj[key][mapfunc] : mapfunc(obj[key], key);
		return newobj;
	};
	BDFDB.ObjectUtils.toArray = function (obj) {
		if (!BDFDB.ObjectUtils.is(obj)) return [];
		return Object.entries(obj).map(n => n[1]);
	};
	BDFDB.ObjectUtils.deepAssign = function (obj, ...objs) {
		if (!objs.length) return obj;
		var nextobj = objs.shift();
		if (BDFDB.ObjectUtils.is(obj) && BDFDB.ObjectUtils.is(nextobj)) {
			for (var key in nextobj) {
				if (BDFDB.ObjectUtils.is(nextobj[key])) {
					if (!obj[key]) Object.assign(obj, {[key]:{}});
					BDFDB.ObjectUtils.deepAssign(obj[key], nextobj[key]);
				}
				else Object.assign(obj, {[key]:nextobj[key]});
			}
		}
		return BDFDB.ObjectUtils.deepAssign(obj, ...objs);
	};
	BDFDB.ObjectUtils.isEmpty = function (obj) {
		return !BDFDB.ObjectUtils.is(obj) || Object.getOwnPropertyNames(obj).length == 0;
	};

	BDFDB.ArrayUtils = {};
	BDFDB.ArrayUtils.is = function (array) {
		return array && Array.isArray(array);
	};
	BDFDB.ArrayUtils.keySort = function (array, key, except) {
		if (!BDFDB.ArrayUtils.is(array)) return [];
		if (key == null) return array;
		if (except === undefined) except = null;
		return array.sort(function (x, y) {
			var xvalue = x[key], yvalue = y[key];
			if (xvalue !== except) return xvalue < yvalue ? -1 : xvalue > yvalue ? 1 : 0;
		});
	};
	BDFDB.ArrayUtils.numSort = function (array) {
		return array.sort(function (x, y) {return x < y ? -1 : x > y ? 1 : 0;});
	};
	BDFDB.ArrayUtils.remove = function (array, value, all = false) {
		if (!BDFDB.ArrayUtils.is(array)) return [];
		if (!array.includes(value)) return array;
		if (!all) array.splice(array.indexOf(value), 1);
		else while (array.indexOf(value) > -1) array.splice(array.indexOf(value), 1);
		return array;
	};
	BDFDB.ArrayUtils.getAllIndexes = function (array, value) {
		if (!BDFDB.ArrayUtils.is(array) && typeof array != "string") return [];
		var indexes = [], index = -1;
		while ((index = array.indexOf(value, index + 1)) !== -1) indexes.push(index);
		return indexes;
	};
	BDFDB.ArrayUtils.removeCopies = function (array) {
		if (!BDFDB.ArrayUtils.is(array)) return [];
		return [...new Set(array)];
	};
	
	BDFDB.ModuleUtils = {};
	BDFDB.ModuleUtils.cached = {};
	BDFDB.ModuleUtils.find = function (filter) {
		var req = InternalBDFDB.getWebModuleReq();
		for (let i in req.c) if (req.c.hasOwnProperty(i)) {
			var m = req.c[i].exports;
			if (m && (typeof m == "object" || typeof m == "function") && filter(m)) return m;
			if (m && m.__esModule) for (let j in m) if (m[j] && (typeof m[j] == "object" || typeof m[j] == "function") && filter(m[j])) return m[j];
		}
	};
	BDFDB.ModuleUtils.findByProperties = function (properties) {
		properties = BDFDB.ArrayUtils.is(properties) ? properties : Array.from(arguments);
		var cachestring = JSON.stringify(properties);
		if (!BDFDB.ObjectUtils.is(BDFDB.ModuleUtils.cached.prop)) BDFDB.ModuleUtils.cached.prop = {};
		if (BDFDB.ModuleUtils.cached.prop[cachestring]) return BDFDB.ModuleUtils.cached.prop[cachestring];
		else {
			var m = BDFDB.ModuleUtils.find(m => properties.every(prop => m[prop] !== undefined));
			if (m) {
				BDFDB.ModuleUtils.cached.prop[cachestring] = m;
				return m;
			}
			else BDFDB.LogUtils.warn(cachestring + " [properties] not found in WebModules");
		}
	};
	BDFDB.ModuleUtils.findByName = function (name) {
		var cachestring = JSON.stringify(name);
		if (!BDFDB.ObjectUtils.is(BDFDB.ModuleUtils.cached.name)) BDFDB.ModuleUtils.cached.name = {};
		if (BDFDB.ModuleUtils.cached.name[cachestring]) return BDFDB.ModuleUtils.cached.name[cachestring];
		else {
			var m = BDFDB.ModuleUtils.find(m => m.displayName === name);
			if (m) {
				BDFDB.ModuleUtils.cached.name[cachestring] = m;
				return m;
			}
			else BDFDB.LogUtils.warn(cachestring + " [name] not found in WebModules");
		}
	};
	BDFDB.ModuleUtils.findByString = function (strings) {
		strings = BDFDB.ArrayUtils.is(strings) ? strings : Array.from(arguments);
		var cachestring = JSON.stringify(strings);
		if (!BDFDB.ObjectUtils.is(BDFDB.ModuleUtils.cached.string)) BDFDB.ModuleUtils.cached.string = {};
		if (BDFDB.ModuleUtils.cached.string[cachestring]) return BDFDB.ModuleUtils.cached.string[cachestring];
		else {
			var m = BDFDB.ModuleUtils.find(m => strings.every(string => typeof m == "function" && m.toString().indexOf(string) > -1));
			if (m) {
				BDFDB.ModuleUtils.cached.string[cachestring] = m;
				return m;
			}
			else BDFDB.LogUtils.warn(cachestring + " [string] not found in WebModules");
		}
	};
	BDFDB.ModuleUtils.findByPrototypes = function (protoprops) {
		protoprops = BDFDB.ArrayUtils.is(protoprops) ? protoprops : Array.from(arguments);
		var cachestring = JSON.stringify(protoprops);
		if (!BDFDB.ObjectUtils.is(BDFDB.ModuleUtils.cached.proto)) BDFDB.ModuleUtils.cached.proto = {};
		if (BDFDB.ModuleUtils.cached.proto[cachestring]) return BDFDB.ModuleUtils.cached.proto[cachestring];
		else {
			var m = BDFDB.ModuleUtils.find(m => m.prototype && protoprops.every(prop => m.prototype[prop] !== undefined));
			if (m) {
				BDFDB.ModuleUtils.cached.proto[cachestring] = m;
				return m;
			}
			else BDFDB.LogUtils.warn(cachestring + " [prototypes] not found in WebModules");
		}
	};
	InternalBDFDB.getWebModuleReq = function () {
		if (!InternalBDFDB.getWebModuleReq.req) {
			const id = "BDFDB-WebModules";
			const req = typeof(window.webpackJsonp) == "function" ? window.webpackJsonp([], {[id]: (module, exports, req) => exports.default = req}, [id]).default : window.webpackJsonp.push([[], {[id]: (module, exports, req) => module.exports = req}, [[id]]]);
			delete req.m[id];
			delete req.c[id];
			InternalBDFDB.getWebModuleReq.req = req;
		}
		return InternalBDFDB.getWebModuleReq.req;
	};
	
	var WebModulesData = {};
	WebModulesData.Patchtypes = ["before", "instead", "after"];
	WebModulesData.Patchmap = {
		BannedCard: "BannedUser",
		InvitationCard: "InviteRow",
		InviteCard: "InviteRow",
		PopoutContainer: "Popout",
		MemberCard: "Member",
		WebhookCard: "Webhook"
	};
	WebModulesData.Patchfinder = {
		Account: "accountinfo",
		App: "app",
		AuthWrapper: "loginscreen",
		BannedCard: "guildsettingsbannedcard",
		ChannelMember: "member",
		EmojiPicker: "emojipicker",
		FriendRow: "friendsrow",
		Guild: "guildouter",
		InstantInviteModal: "invitemodalwrapper",
		InvitationCard: "invitemodalinviterow",
		InviteCard: "guildsettingsinvitecard",
		PopoutContainer: "popout",
		PrivateChannelCall: "callcurrentcontainer",
		MemberCard: "guildsettingsmembercard",
		NameTag: "nametag",
		Note: "usernote",
		SearchResults: "searchresultswrap",
		TypingUsers: "typing",
		UserPopout: "userpopout",
		V2C_ContentColumn: "contentcolumn",
		V2C_List: "_repolist",
		V2C_PluginCard: "_repoheader",
		V2C_ThemeCard: "_repoheader"
	};
	WebModulesData.GlobalModules = {};
	try {WebModulesData.GlobalModules["V2C_ContentColumn"] = V2C_ContentColumn;} catch(err) {BDFDB.LogUtils.warn(`Could not find global Module "V2C_ContentColumn"`);}
	try {WebModulesData.GlobalModules["V2C_List"] = V2C_List;} catch(err) {BDFDB.LogUtils.warn(`Could not find global Module "V2C_List"`);}
	try {WebModulesData.GlobalModules["V2C_PluginCard"] = V2C_PluginCard;} catch(err) {BDFDB.LogUtils.warn(`Could not find global Module "V2C_PluginCard"`);}
	try {WebModulesData.GlobalModules["V2C_ThemeCard"] = V2C_ThemeCard;} catch(err) {BDFDB.LogUtils.warn(`Could not find global Module "V2C_ThemeCard"`);}
	
	BDFDB.ModuleUtils.patch = function (plugin, module, modulefunctions, patchfunctions) {
		if (!plugin || !module || !modulefunctions || !Object.keys(patchfunctions).some(type => WebModulesData.Patchtypes.includes(type))) return null;
		const pluginname = typeof plugin === "string" ? plugin : plugin.name;
		const pluginid = pluginname.toLowerCase();
		if (!module.BDFDBpatch) module.BDFDBpatch = {};
		modulefunctions = BDFDB.ArrayUtils.is(modulefunctions) ? modulefunctions : Array.of(modulefunctions);
		for (let modulefunction of modulefunctions) {
			if (!module[modulefunction]) module[modulefunction] = _ => {};
			const originalfunction = module[modulefunction];
			if (!module.BDFDBpatch[modulefunction]) {
				module.BDFDBpatch[modulefunction] = {};
				for (let type of WebModulesData.Patchtypes) module.BDFDBpatch[modulefunction][type] = {};
				module.BDFDBpatch[modulefunction].originalMethod = originalfunction;
				module[modulefunction] = function () {
					const data = {
						thisObject: this,
						methodArguments: arguments,
						originalMethod: originalfunction,
						originalMethodName: modulefunction,
						callOriginalMethod: _ => data.returnValue = data.originalMethod.apply(data.thisObject, data.methodArguments)
					};
					if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded && module.BDFDBpatch[modulefunction]) {
						if (!BDFDB.ObjectUtils.isEmpty(module.BDFDBpatch[modulefunction].before)) for (let id in BDFDB.ObjectUtils.sort(module.BDFDBpatch[modulefunction].before)) {
							BDFDB.TimeUtils.suppress(module.BDFDBpatch[modulefunction].before[id], `"before" callback of ${modulefunction} in ${module.constructor ? module.constructor.displayName || module.constructor.name : "module"}`, module.BDFDBpatch[modulefunction].before[id].pluginname)(data);
						}
						if (BDFDB.ObjectUtils.isEmpty(module.BDFDBpatch[modulefunction].instead)) BDFDB.TimeUtils.suppress(data.callOriginalMethod, `originalMethod of ${modulefunction} in ${module.constructor ? module.constructor.displayName || module.constructor.name : "module"}`)();
						else for (let id in BDFDB.ObjectUtils.sort(module.BDFDBpatch[modulefunction].instead)) {
							let tempreturn = BDFDB.TimeUtils.suppress(module.BDFDBpatch[modulefunction].instead[id], `"instead" callback of ${modulefunction} in ${module.constructor ? module.constructor.displayName || module.constructor.name : "module"}`, module.BDFDBpatch[modulefunction].instead[id].pluginname)(data);
							if (tempreturn !== undefined) data.returnValue = tempreturn;
						}
						if (!BDFDB.ObjectUtils.isEmpty(module.BDFDBpatch[modulefunction].after)) for (let id in BDFDB.ObjectUtils.sort(module.BDFDBpatch[modulefunction].after)) {
							let tempreturn = BDFDB.TimeUtils.suppress(module.BDFDBpatch[modulefunction].after[id], `"after" callback of ${modulefunction} in ${module.constructor ? module.constructor.displayName || module.constructor.name : "module"}`, module.BDFDBpatch[modulefunction].after[id].pluginname)(data);
							if (tempreturn !== undefined) data.returnValue = tempreturn;
						}
					}
					else BDFDB.TimeUtils.suppress(data.callOriginalMethod, `originalMethod of ${modulefunction} in ${module.constructor ? module.constructor.displayName || module.constructor.name : "module"}`)();
					return modulefunction == "render" && data.returnValue === undefined ? null : data.returnValue;
				};
			}
			for (let type of WebModulesData.Patchtypes) if (typeof patchfunctions[type] == "function") {
				module.BDFDBpatch[modulefunction][type][pluginid] = patchfunctions[type];
				module.BDFDBpatch[modulefunction][type][pluginid].pluginname = pluginname;
			}
		}
		let cancel = _ => {BDFDB.ModuleUtils.unpatch(plugin, module, modulefunctions);};
		if (plugin && typeof plugin == "object") {
			if (!BDFDB.ArrayUtils.is(plugin.patchCancels)) plugin.patchCancels = [];
			plugin.patchCancels.push(cancel);
		}
		return cancel;
	};
	BDFDB.ModuleUtils.unpatch = function (plugin, module, modulefunctions) {
		if (!module && !modulefunctions) {
			if (BDFDB.ObjectUtils.is(plugin) && BDFDB.ArrayUtils.is(plugin.patchCancels)) {
				for (let cancel of plugin.patchCancels) cancel();
				plugin.patchCancels = [];
			}
		}
		else {
			if (!BDFDB.ObjectUtils.is(module) || !module.BDFDBpatch) return;
			const pluginname = !plugin ? null : (typeof plugin === "string" ? plugin : plugin.name).toLowerCase();
			if (modulefunctions) {
				for (let modulefunction of BDFDB.ArrayUtils.is(modulefunctions) ? modulefunctions : Array.of(modulefunctions)) if (module[modulefunction] && module.BDFDBpatch[modulefunction]) unpatch(modulefunction, pluginname);
			}
			else {
				for (let patchedfunction of module.BDFDBpatch) unpatch(patchedfunction, pluginname);
			}
		}
		function unpatch (func, pluginname) {
			for (let type of WebModulesData.Patchtypes) {
				if (pluginname) delete module.BDFDBpatch[func][type][pluginname];
				else delete module.BDFDBpatch[func][type];
			}
			var empty = true;
			for (let type of WebModulesData.Patchtypes) if (!BDFDB.ObjectUtils.isEmpty(module.BDFDBpatch[func][type])) empty = false;
			if (empty) {
				module[func] = module.BDFDBpatch[func].originalMethod;
				delete module.BDFDBpatch[func];
				if (BDFDB.ObjectUtils.isEmpty(module.BDFDBpatch)) delete module.BDFDBpatch;
			}
		}
	};
	BDFDB.ModuleUtils.forceAllUpdates = function (plugin, selectedtypes) {
		if (BDFDB.ObjectUtils.is(plugin) && BDFDB.ObjectUtils.is(plugin.patchModules)) {
			const app = document.querySelector(BDFDB.dotCN.app);
			const bdsettings = document.querySelector("#bd-settingspane-container " + BDFDB.dotCN.scrollerwrap);
			if (app) {
				var filteredmodules = [];
				for (let type in plugin.patchModules) {
					var methodnames = BDFDB.ArrayUtils.is(plugin.patchModules[type]) ? plugin.patchModules[type] : Array.of(plugin.patchModules[type]);
					if (methodnames.includes("componentDidMount") || methodnames.includes("componentDidUpdate") || methodnames.includes("render")) filteredmodules.push(type);
				}
				selectedtypes = (BDFDB.ArrayUtils.is(selectedtypes) ? selectedtypes : Array.of(selectedtypes)).filter(n => n);
				if (selectedtypes.length) {
					selectedtypes = selectedtypes.map(type => type && WebModulesData.Patchmap[type] ? WebModulesData.Patchmap[type] + " _ _ " + type : type);
					filteredmodules = filteredmodules.filter(type => selectedtypes.indexOf(type) > -1);
				}
				if (filteredmodules.length) {
					try {
						const appinsdown = BDFDB.ReactUtils.findOwner(app, {name:filteredmodules, all:true, noCopies:true, group:true, unlimited:true});
						const appinsup = BDFDB.ReactUtils.findOwner(app, {name:filteredmodules, all:true, noCopies:true, group:true, unlimited:true, up:true});
						for (let type in appinsdown) for (let ins of appinsdown[type]) InternalBDFDB.forceInitiateProcess(plugin, ins, type);
						for (let type in appinsup) for (let ins of appinsup[type]) InternalBDFDB.forceInitiateProcess(plugin, ins, type);
						if (bdsettings) {
							const bdsettingsins = BDFDB.ReactUtils.findOwner(bdsettings, {name:filteredmodules, all:true, noCopies:true, group:true, unlimited:true});
							for (let type in bdsettingsins) for (let ins of bdsettingsins[type]) InternalBDFDB.forceInitiateProcess(plugin, ins, type);
						}
					}
					catch (err) {BDFDB.LogUtils.error("Could not force update components! " + err, plugin.name);}
				}
			}
		}
	};
	InternalBDFDB.forceInitiateProcess = function (plugin, instance, type) {
		if (!plugin || !instance || !type) return;
		let methodnames = BDFDB.ArrayUtils.is(plugin.patchModules[type]) ? plugin.patchModules[type] : Array.of(plugin.patchModules[type]);
		if (methodnames.includes("componentDidMount")) InternalBDFDB.initiateProcess(plugin, type, {instance, methodname:"componentDidMount"});
		if (methodnames.includes("render")) BDFDB.ReactUtils.forceUpdate(instance);
		else if (methodnames.includes("componentDidUpdate")) InternalBDFDB.initiateProcess(plugin, type, {instance, methodname:"componentDidUpdate"});
	};
	InternalBDFDB.initiateProcess = function (plugin, type, e) {
		if (BDFDB.ObjectUtils.is(plugin) && !plugin.stopping && e.instance) {
			// REMOVE
			let isLib = plugin.name == "$BDFDB";
			if (plugin.name == "$BDFDB") plugin = BDFDBprocessFunctions;
			type = (type.split(" _ _ ")[1] || type).replace(/[^A-z0-9]|_/g, "");
			type = type.charAt(0).toUpperCase() + type.slice(1);
			if (typeof plugin["process" + type] == "function") {
				// REMOVE
				let isOldType = !isLib && plugin["process" + type].toString().split("\n")[0].replace(/ /g, "").split(",").length > 1;
				if (isOldType) {
					if (e.methodname == "render") {
						if (e.returnvalue) plugin["process" + type](e.instance, null, e.returnvalue, [e.methodname]);
					}
					else {
						let wrapper = BDFDB.ReactUtils.findDOMNode(e.instance);
						if (wrapper) plugin["process" + type](e.instance, wrapper, e.returnvalue, [e.methodname]);
						else BDFDB.TimeUtils.timeout(_ => {
							wrapper = BDFDB.ReactUtils.findDOMNode(e.instance);
							if (wrapper) plugin["process" + type](e.instance, wrapper, e.returnvalue, [e.methodname]);
						});
					}
				}
				else {
					if (e.methodname == "render") {
						if (e.returnvalue) plugin["process" + type](e);
					}
					else {
						e.node = BDFDB.ReactUtils.findDOMNode(e.instance);
						if (e.node) plugin["process" + type](e);
						else BDFDB.TimeUtils.timeout(_ => {
							e.node = BDFDB.ReactUtils.findDOMNode(e.instance);
							if (e.node) plugin["process" + type](e);
						});
					}
				}
			}
		}
	};
	InternalBDFDB.patchPlugin = function (plugin) {
		if (BDFDB.ObjectUtils.is(plugin) && BDFDB.ObjectUtils.is(plugin.patchModules)) {
			BDFDB.ModuleUtils.unpatch(plugin);
			for (let type in plugin.patchModules) {
				if (WebModulesData.GlobalModules[type] && typeof WebModulesData.GlobalModules[type] == "function") patchInstance(WebModulesData.GlobalModules[type], type);
				else {
					var mapped = WebModulesData.Patchmap[type];
					var classname = WebModulesData.Patchfinder[type.split(" _ _ ")[1] || type];
					var patchtype = mapped ? mapped + " _ _ " + type : type;
					if (mapped) {
						plugin.patchModules[patchtype] = plugin.patchModules[type];
						delete plugin.patchModules[type];
					}
					if (!classname) patchInstance(BDFDB.ModuleUtils.findByName(patchtype.split(" _ _ ")[0]), patchtype);
					else if (DiscordClasses[classname]) checkForInstance(classname, patchtype);
				}
			}
			function patchInstance(instance, type) {
				if (instance) {
					var name = type.split(" _ _ ")[0];
					instance = instance._reactInternalFiber && instance._reactInternalFiber.type ? instance._reactInternalFiber.type : instance;
					instance = instance.displayName == name || instance.name == name ? instance : BDFDB.ReactUtils.findOwner(instance, {name, up:true});
					if (instance) {
						instance = instance._reactInternalFiber && instance._reactInternalFiber.type ? instance._reactInternalFiber.type : instance;
						BDFDB.ModuleUtils.patch(plugin, instance.prototype, plugin.patchModules[type], {after: e => {
							if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) InternalBDFDB.initiateProcess(plugin, type, {instance:e.thisObject, returnvalue:e.returnValue, methodname:e.originalMethodName});
						}});
					}
				}
			}
			function checkForInstance(classname, type) {
				const app = document.querySelector(BDFDB.dotCN.app), bdsettings = document.querySelector("#bd-settingspane-container " + BDFDB.dotCN.scrollerwrap);
				var instancefound = false;
				if (app) {
					var appins = BDFDB.ReactUtils.findOwner(app, {name:type, unlimited:true}) || BDFDB.ReactUtils.findOwner(app, {name:type, unlimited:true, up:true});
					if (appins) {
						instancefound = true;
						patchInstance(appins, type);
					}
				}
				if (!instancefound && bdsettings) {
					var bdsettingsins = BDFDB.ReactUtils.findOwner(bdsettings, {name:type, unlimited:true});
					if (bdsettingsins) {
						instancefound = true;
						patchInstance(bdsettingsins, type);
					}
				}
				if (!instancefound) {
					var found = false, instanceobserver = new MutationObserver(cs => {cs.forEach(c => {c.addedNodes.forEach(n => {
						if (found || !n || !n.tagName) return;
						var ele = null;
						if ((ele = BDFDB.DOMUtils.containsClass(n, BDFDB.disCN[classname]) ? n : n.querySelector(BDFDB.dotCN[classname])) != null) {
							var ins = BDFDB.ReactUtils.getInstance(ele);
							if (isCorrectInstance(ins, type)) {
								found = true;
								instanceobserver.disconnect();
								patchInstance(ins, type);
								BDFDB.ModuleUtils.forceAllUpdates(plugin, type);
							}
						}
					});});});
					BDFDB.ObserverUtils.connect(plugin, BDFDB.dotCN.appmount, {name:"checkForInstanceObserver", instance:instanceobserver, multi:true
					}, {childList:true, subtree:true});
				}
			}
			function isCorrectInstance(instance, name) {
				if (!instance) return false;
				instance = instance._reactInternalFiber && instance._reactInternalFiber.type ? instance._reactInternalFiber.type : instance;
				instance = instance.displayName == name || instance.name == name ? instance : BDFDB.ReactUtils.findOwner(instance, {name, up:true});
				return !!instance;
			}
		}
	};

	var NoFluxContextMenus = ["ChannelContextMenu", "DeveloperContextMenu", "GuildContextMenu", "GuildRoleContextMenu", "MessageContextMenu", "NativeContextMenu", "ScreenshareContextMenu", "UserContextMenu", "UserSettingsCogContextMenu"];
	var NoFluxPopouts = ["MessageOptionPopout"];
	var FluxContextMenus = ["ApplicationContextMenu", "GroupDMContextMenu"];
	var PatchMenuQueries = {};
	for (let type of FluxContextMenus) PatchMenuQueries[type] = {query:[], module:null};
	InternalBDFDB.addContextListeners = (plugin) => {
		if (!BDFDB.ObjectUtils.is(plugin)) return;
		for (let type of NoFluxContextMenus) if (typeof plugin[`on${type}`] === "function") InternalBDFDB.patchContextMenuPlugin(plugin, type, BDFDB.ModuleUtils.findByName(type));
		for (let type of NoFluxPopouts) if (typeof plugin[`on${type}`] === "function") InternalBDFDB.patchPopoutPlugin(plugin, type, BDFDB.ModuleUtils.findByName(type));
		for (let type of FluxContextMenus) if (typeof plugin[`on${type}`] === "function") {
			if (PatchMenuQueries[type].module) InternalBDFDB.patchContextMenuPlugin(plugin, type, PatchMenuQueries[type].module);
			else PatchMenuQueries[type].query.push(plugin);
		}
	};
	InternalBDFDB.patchContextMenuPlugin = (plugin, type, module) => {
		if (module && module.prototype) {
			// REMOVE
			let isOldType = plugin["on" + type].toString().split("\n")[0].replace(/ /g, "").split(",").length > 1;
			if (isOldType) {
				BDFDB.ModuleUtils.patch(plugin, module.prototype, "render", {after: e => {
					let instance = e.thisObject, menu = BDFDB.ReactUtils.findDOMNode(e.thisObject), returnvalue = e.returnValue;
					if (instance && menu && returnvalue && typeof plugin[`on${type}`] === "function") plugin[`on${type}`](instance, menu, returnvalue);
				}});
			}
			else {
				BDFDB.ModuleUtils.patch(plugin, module.prototype, "render", {after: e => {
					if (e.thisObject && e.returnValue && typeof plugin[`on${type}`] === "function") plugin[`on${type}`]({instance:e.thisObject, returnvalue:e.returnValue, methodname:"render"});
				}});
			}
		}
	};
	InternalBDFDB.patchPopoutPlugin = (plugin, type, module) => {
		if (module && module.prototype) {
			// REMOVE
			let isOldType = plugin["on" + type].toString().split("\n")[0].replace(/ /g, "").split(",").length > 1;
			if (isOldType) {
				BDFDB.ModuleUtils.patch(plugin, module.prototype, "render", {after: e => {
					let instance = e.thisObject, menu = BDFDB.ReactUtils.findDOMNode(e.thisObject), returnvalue = e.returnValue;
					if (instance && menu && returnvalue && typeof plugin[`on${type}`] === "function") {
						plugin[`on${type}`](instance, menu, returnvalue);
						if (!instance.BDFDBforceUpdateTimeout) BDFDB.ReactUtils.forceUpdate(instance);
					}
				}});
			}
			else {
				BDFDB.ModuleUtils.patch(plugin, module.prototype, "render", {after: e => {
					if (e.thisObject && e.returnValue && typeof plugin[`on${type}`] === "function") plugin[`on${type}`]({instance:e.thisObject, returnvalue:e.returnValue, methodname:"render"});
				}});
			}
		}
	};
	InternalBDFDB.patchContextMenuLib = (module, repatch) => {
		if (module && module.prototype) {
			// REMOVE
			BDFDB.ModuleUtils.patch(BDFDB, module.prototype, "componentDidMount", {after: e => {
				if (!e.thisObject.BDFDBforceRenderTimeout && typeof e.thisObject.render == "function") e.thisObject.render();
			}});
			BDFDB.ModuleUtils.patch(BDFDB, module.prototype, "componentDidUpdate", {after: e => {
				var menu = BDFDB.ReactUtils.findDOMNode(e.thisObject);
				if (menu) {
					const updater = BDFDB.ReactUtils.getValue(e, "thisObject._reactInternalFiber.stateNode.props.onHeightUpdate");
					const mrects = BDFDB.DOMUtils.getRects(menu), arects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount));
					if (updater && (mrects.top + mrects.height > arects.height)) updater();
				}
			}});
			BDFDB.ModuleUtils.patch(BDFDB, module.prototype, "render", {after: e => {
				if (e.thisObject.props.BDFDBcontextMenu && e.thisObject.props.children && e.returnValue && e.returnValue.props) {
					e.returnValue.props.children = e.thisObject.props.children;
					delete e.thisObject.props.value;
					delete e.thisObject.props.children;
					delete e.thisObject.props.BDFDBcontextMenu;
				}
				if (BDFDB.ReactUtils.findDOMNode(e.thisObject)) {
					e.thisObject.BDFDBforceRenderTimeout = true;
					BDFDB.TimeUtils.timeout(_ => {delete e.thisObject.BDFDBforceRenderTimeout;}, 1000);
				}
				if (repatch) {
					let newmodule = BDFDB.ReactUtils.getValue(e, "thisObject._reactInternalFiber.child.type");
					if (newmodule && newmodule.displayName && PatchMenuQueries[newmodule.displayName] && !PatchMenuQueries[newmodule.displayName].module) {
						PatchMenuQueries[newmodule.displayName].module = newmodule;
						InternalBDFDB.patchContextMenuLib(newmodule, false);
						while (PatchMenuQueries[newmodule.displayName].query.length) {
							InternalBDFDB.patchContextMenuPlugin(PatchMenuQueries[newmodule.displayName].query.pop(), newmodule.displayName, newmodule);
						}
					}
				}
			}});
		}
	};
	InternalBDFDB.patchPopoutLib = (module, repatch) => {
		if (module && module.prototype) {
			// REMOVE
			BDFDB.ModuleUtils.patch(BDFDB, module.prototype, "componentDidMount", {after: e => {
				if (!e.thisObject.BDFDBforceRenderTimeout && !e.thisObject.BDFDBforceUpdateTimeout && typeof e.thisObject.render == "function") e.thisObject.render();
			}});
			BDFDB.ModuleUtils.patch(BDFDB, module.prototype, "componentDidUpdate", {after: e => {
				const updater = BDFDB.ReactUtils.getValue(e, "thisObject._reactInternalFiber.return.return.return.stateNode.updateOffsets");
				if (updater) updater();
				e.thisObject.BDFDBforceUpdateTimeout = true;
				BDFDB.TimeUtils.timeout(_ => {delete e.thisObject.BDFDBforceUpdateTimeout;}, 1000);
			}});
			BDFDB.ModuleUtils.patch(BDFDB, module.prototype, "render", {after: e => {
				if (BDFDB.ReactUtils.findDOMNode(e.thisObject)) {
					e.thisObject.BDFDBforceRenderTimeout = true;
					BDFDB.TimeUtils.timeout(_ => {delete e.thisObject.BDFDBforceRenderTimeout;}, 1000);
				}
				if (e.thisObject.props.message && !e.thisObject.props.target) {
					const messageswrap = document.querySelector(BDFDB.dotCN.messages);
					if (messageswrap) for (let message of BDFDB.ReactUtils.findOwner(messageswrap, {name:"Message", all:true, noCopies:true, unlimited:true})) {
						if (e.thisObject.props.message.id == message.props.message.id) {
							target = BDFDB.ReactUtils.findDOMNode(message);
							if (target) e.thisObject.props.target = target
							break;
						}
					}
				}
			}});
		}
	};

	BDFDB.DiscordConstants = BDFDB.ModuleUtils.findByProperties("Permissions", "ActivityTypes");
	
	var DiscordObjects = {};
	DiscordObjects.Channel = BDFDB.ModuleUtils.findByPrototypes("initialize", "getTitleIcon", "getGuildId");
	DiscordObjects.Guild = BDFDB.ModuleUtils.findByPrototypes("initialize", "getMaxEmojiSlots", "getRole");
	DiscordObjects.Message = BDFDB.ModuleUtils.findByPrototypes("initialize", "getAuthorName", "getChannelId");
	DiscordObjects.Timestamp = BDFDB.ModuleUtils.findByPrototypes("add", "dayOfYear", "hasAlignedHourOffset");
	DiscordObjects.User = BDFDB.ModuleUtils.findByPrototypes("initialize", "isLocalBot", "isClaimed");
	BDFDB.DiscordObjects = Object.assign({}, DiscordObjects);
	
	var LibraryRequires = {};
	for (let name of ["child_process", "electron", "fs", "path", "process", "request"]) {
		try {LibraryRequires[name] = require(name);} catch (err) {}
	}
	BDFDB.LibraryRequires = Object.assign({}, LibraryRequires);
	
	var LibraryModules = {};
	LibraryModules.AckUtils = BDFDB.ModuleUtils.findByProperties("localAck", "bulkAck");
	LibraryModules.APIUtils = BDFDB.ModuleUtils.findByProperties("getAPIBaseURL");
	LibraryModules.AnimationUtils = BDFDB.ModuleUtils.findByProperties("spring", "decay");
	LibraryModules.BadgeUtils = BDFDB.ModuleUtils.findByProperties("getBadgeCountString", "getBadgeWidthForValue");
	LibraryModules.ChannelStore = BDFDB.ModuleUtils.findByProperties("getChannel", "getChannels");
	LibraryModules.ColorUtils = BDFDB.ModuleUtils.findByProperties("hex2int", "hex2rgb");
	LibraryModules.ContextMenuUtils = BDFDB.ModuleUtils.findByProperties("closeContextMenu", "openContextMenu");
	LibraryModules.CopyLinkUtils = BDFDB.ModuleUtils.findByProperties("SUPPORTS_COPY", "copy");
	LibraryModules.CurrentUserStore = BDFDB.ModuleUtils.findByProperties("getCurrentUser");
	LibraryModules.DirectMessageUtils = BDFDB.ModuleUtils.findByProperties("addRecipient", "openPrivateChannel");
	LibraryModules.FriendUtils = BDFDB.ModuleUtils.findByProperties("getFriendIDs", "getRelationships");
	LibraryModules.FolderStore = BDFDB.ModuleUtils.findByProperties("getGuildFolderById", "getFlattenedGuilds");
	LibraryModules.FolderUtils = BDFDB.ModuleUtils.findByProperties("isFolderExpanded", "getExpandedFolders");
	LibraryModules.GuildBoostUtils = BDFDB.ModuleUtils.findByProperties("getTierName", "getUserLevel");
	LibraryModules.GuildChannelStore = BDFDB.ModuleUtils.findByProperties("getChannels", "getDefaultChannel");
	LibraryModules.GuildEmojiStore = BDFDB.ModuleUtils.findByProperties("getGuildEmoji", "getDisambiguatedEmojiContext");
	LibraryModules.GuildSettingsUtils = BDFDB.ModuleUtils.findByProperties("updateChannelOverrideSettings", "updateNotificationSettings");
	LibraryModules.GuildStore = BDFDB.ModuleUtils.findByProperties("getGuild", "getGuilds");
	LibraryModules.GuildUtils = BDFDB.ModuleUtils.findByProperties("transitionToGuildSync");
	LibraryModules.HistoryUtils = BDFDB.ModuleUtils.findByProperties("transitionTo", "replaceWith", "getHistory");;
	LibraryModules.IconUtils = BDFDB.ModuleUtils.findByProperties("getGuildIconURL", "getGuildBannerURL");
	LibraryModules.InviteUtils = BDFDB.ModuleUtils.findByProperties("acceptInvite", "createInvite");
	LibraryModules.LanguageStore = BDFDB.ModuleUtils.findByProperties("getLanguages", "Messages");
	LibraryModules.LastChannelStore = BDFDB.ModuleUtils.findByProperties("getLastSelectedChannelId");
	LibraryModules.LastGuildStore = BDFDB.ModuleUtils.findByProperties("getLastSelectedGuildId");
	LibraryModules.LoginUtils = BDFDB.ModuleUtils.findByProperties("login", "logout");
	LibraryModules.MemberStore = BDFDB.ModuleUtils.findByProperties("getMember", "getMembers");
	LibraryModules.MentionUtils = BDFDB.ModuleUtils.findByProperties("getMentionCount", "getMentionCounts");
	LibraryModules.MessageCreationUtils = BDFDB.ModuleUtils.findByProperties("parse", "isMentioned");
	LibraryModules.MessagePinUtils = BDFDB.ModuleUtils.findByProperties("pinMessage", "unpinMessage");
	LibraryModules.MessageStore = BDFDB.ModuleUtils.findByProperties("getMessage", "getMessages");
	LibraryModules.MessageUtils = BDFDB.ModuleUtils.findByProperties("receiveMessage", "editMessage");
	LibraryModules.ModalUtils = BDFDB.ModuleUtils.findByProperties("openModal", "registerModalDispatch");
	LibraryModules.MutedUtils = BDFDB.ModuleUtils.findByProperties("isGuildOrCategoryOrChannelMuted");
	LibraryModules.NotificationSettingsUtils = BDFDB.ModuleUtils.findByProperties("setDesktopType", "setTTSType");
	LibraryModules.NotificationSettingsStore = BDFDB.ModuleUtils.findByProperties("getDesktopType", "getTTSType");
	LibraryModules.PermissionUtils = BDFDB.ModuleUtils.findByProperties("getChannelPermissions", "canUser");
	LibraryModules.PermissionRoleUtils = BDFDB.ModuleUtils.findByProperties("getHighestRole", "can");
	LibraryModules.ReactionUtils = BDFDB.ModuleUtils.findByProperties("addReaction", "removeReaction");
	LibraryModules.SearchPageUtils = BDFDB.ModuleUtils.findByProperties("searchNextPage", "searchPreviousPage");
	LibraryModules.SelectChannelUtils = BDFDB.ModuleUtils.findByProperties("selectChannel", "selectPrivateChannel");
	LibraryModules.SettingsUtils = BDFDB.ModuleUtils.findByProperties("updateRemoteSettings", "updateLocalSettings");
	LibraryModules.SoundUtils = BDFDB.ModuleUtils.findByProperties("playSound", "createSound");
	LibraryModules.SpellCheckUtils = BDFDB.ModuleUtils.findByProperties("learnWord", "toggleSpellcheck");
	LibraryModules.StatusMetaUtils = BDFDB.ModuleUtils.findByProperties("getApplicationActivity", "getStatus");
	LibraryModules.StreamUtils = BDFDB.ModuleUtils.findByProperties("getStreamForUser", "getActiveStream");
	LibraryModules.UnreadGuildUtils = BDFDB.ModuleUtils.findByProperties("hasUnread", "getUnreadGuilds");
	LibraryModules.UnreadChannelUtils = BDFDB.ModuleUtils.findByProperties("getUnreadCount", "getOldestUnreadMessageId");
	LibraryModules.UploadUtils = BDFDB.ModuleUtils.findByProperties("upload", "instantBatchUpload");
	LibraryModules.UserStore = BDFDB.ModuleUtils.findByProperties("getUser", "getUsers");
	LibraryModules.VoiceUtils = BDFDB.ModuleUtils.findByProperties("getAllVoiceStates", "getVoiceStatesForChannel");
	LibraryModules.ZoomUtils = BDFDB.ModuleUtils.findByProperties("setZoom", "setFontSize");
	BDFDB.LibraryModules = Object.assign({}, LibraryModules);

	LibraryModules.React = BDFDB.ModuleUtils.findByProperties("createElement", "cloneElement");
	LibraryModules.ReactDOM = BDFDB.ModuleUtils.findByProperties("render", "findDOMNode");
	
	BDFDB.ReactUtils = Object.assign({}, LibraryModules.React, LibraryModules.ReactDOM);
	BDFDB.ReactUtils.createElement = function (component, props) {
		if (component && component.defaultProps) for (let key in component.defaultProps) if (props[key] == null) props[key] = component.defaultProps[key];
		try {return LibraryModules.React.createElement(component || "div", props || {}) || null;}
		catch (err) {BDFDB.LogUtils.error("Fatal Error: Could not create react element! " + err);}
		return null;
	};
	BDFDB.ReactUtils.elementToReact = function (node) {
		if (BDFDB.ReactUtils.isValidElement(node)) return node;
		else if (!Node.prototype.isPrototypeOf(node)) return null;
		else if (node.nodeType == Node.TEXT_NODE) return node.nodeValue;
		let attributes = {}, importantstyleprops = {};
		for (let attr of node.attributes) attributes[attr.name] = attr.value;
		if (node.attributes.style) attributes.style = BDFDB.ObjectUtils.filter(node.style, n => node.style[n] && isNaN(parseInt(n)), true);
		attributes.children = [];
		if (node.style && node.style.cssText) for (let propstr of node.style.cssText.split(";")) if (propstr.endsWith("!important")) {
			let importantprop = propstr.split(":")[0];
			let camelprop = importantprop.replace(/-([a-z]?)/g, (m, g) => g.toUpperCase());
			if (attributes.style[camelprop] != null) importantstyleprops[importantprop] = attributes.style[camelprop];
		}
		if (Object.keys(importantstyleprops).length) attributes.ref = instance => {
			let ele = BDFDB.ReactUtils.findDOMNode(instance);
			if (ele) for (let importantprop in importantstyleprops) ele.style.setProperty(importantprop, importantstyleprops[importantprop], "important");
		}
		for (let child of node.childNodes) attributes.children.push(BDFDB.ReactUtils.elementToReact(child));
		return BDFDB.ReactUtils.createElement(node.tagName, attributes);
	};
	BDFDB.ReactUtils.findDOMNode = function (instance) {
		if (Node.prototype.isPrototypeOf(instance)) return instance;
		if (!instance || !instance.updater || typeof instance.updater.isMounted !== "function" || !instance.updater.isMounted(instance)) return null;
		var node = LibraryModules.ReactDOM.findDOMNode(instance) || BDFDB.ReactUtils.getValue(instance, "child.stateNode");
		return Node.prototype.isPrototypeOf(node) ? node : null;
	};
	BDFDB.ReactUtils.childrenToArray = function (parent) {
		if (parent && parent.props && parent.props.children && !BDFDB.ArrayUtils.is(parent.props.children)) {
			var child = parent.props.children;
			parent.props.children = [];
			parent.props.children.push(child);
		}
		return parent.props.children;
	}
	BDFDB.ReactUtils.findChildren = function (nodeOrInstance, config) {
		if (!nodeOrInstance || !BDFDB.ObjectUtils.is(config) || !config.name && !config.key && !config.props) return [null, -1];
		var instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
		if (!BDFDB.ObjectUtils.is(instance) && !BDFDB.ArrayUtils.is(instance)) return [null, -1];
		config.name = config.name && !BDFDB.ArrayUtils.is(config.name) ? Array.of(config.name) : config.name;
		config.key = config.key && !BDFDB.ArrayUtils.is(config.key) ? Array.of(config.key) : config.key;
		config.props = config.props && !BDFDB.ArrayUtils.is(config.props) ? Array.of(config.props) : config.props;
		var parent = firstarray = instance;
		while (!BDFDB.ArrayUtils.is(firstarray) && firstarray.props && firstarray.props.children) firstarray = firstarray.props.children;
		if (!BDFDB.ArrayUtils.is(firstarray)) firstarray = [];
		return getChildren(instance);
		function getChildren (children) {
			var result = [firstarray, -1];
			if (!children) return result;
			if (!BDFDB.ArrayUtils.is(children)) {
				if (check(children)) result = found(children);
				else if (children.props && children.props.children) {
					parent = children;
					result = getChildren(children.props.children);
				}
			}
			else {
				for (let i = 0; result[1] == -1 && i < children.length; i++) if (children[i]) {
					if (BDFDB.ArrayUtils.is(children[i])) {
						parent = children;
						result = getChildren(children[i]);
					}
					else if (check(children[i])) {
						parent = children;
						result = found(children[i]);
					}
					else if (children[i].props && children[i].props.children) {
						parent = children[i];
						result = getChildren(children[i].props.children);
					}
				}
			}
			return result;
		}
		function found (child) {
			if (BDFDB.ArrayUtils.is(parent)) return [parent, parent.indexOf(child)];
			else {
				parent.props.children = [];
				parent.props.children.push(child);
				return [parent.props.children, 0];
			}
		}
		function check (instance) {
			if (!instance) return false;
			let props = instance.stateNode ? instance.stateNode.props : instance.props;
			return instance.type && config.name && config.name.some(name => ((instance.type.displayName || instance.type.name) === name)) || config.key && config.key.some(key => instance.key == key) || props && config.props && config.props.every(prop => BDFDB.ArrayUtils.is(prop) ? (BDFDB.ArrayUtils.is(prop[1]) ? prop[1].some(checkvalue => propCheck(props, prop[0], checkvalue)) : propCheck(props, prop[0], prop[1])) : props[prop] !== undefined);
		}
		function propCheck (props, key, value) {
			return key != null && props[key] != null && value != null && (key == "className" ? (" " + props[key] + " ").indexOf(" " + value + " ") > -1 : BDFDB.equals(props[key], value));
		}
	};
	BDFDB.ReactUtils.findOwner = function (nodeOrInstance, config) {
		if (!BDFDB.ObjectUtils.is(config)) return null;
		if (!nodeOrInstance || !config.name && !config.key && !config.props) return config.all ? (config.group ? {} : []) : null;
		var instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
		if (!BDFDB.ObjectUtils.is(instance)) return config.all ? (config.group ? {} : []) : null;
		config.name = config.name && !BDFDB.ArrayUtils.is(config.name) ? Array.of(config.name) : config.name;
		config.key = config.key && !BDFDB.ArrayUtils.is(config.key) ? Array.of(config.key) : config.key;
		config.props = config.props && !BDFDB.ArrayUtils.is(config.props) ? Array.of(config.props) : config.props;
		var depth = -1;
		var start = performance.now();
		var maxdepth = config.unlimited ? 999999999 : (config.depth === undefined ? 30 : config.depth);
		var maxtime = config.unlimited ? 999999999 : (config.time === undefined ? 150 : config.time);
		var whitelist = config.up ? {return:true, sibling:true, _reactInternalFiber:true} : {child:true, sibling:true, _reactInternalFiber:true};
		var foundinstances = config.group ? {} : [];
		var singleinstance = getOwner(instance);
		if (config.all) {
			for (let i in foundinstances) {
				if (config.group) for (let j in foundinstances[i]) delete foundinstances[i][j].BDFDBreactSearch;
				else delete foundinstances[i].BDFDBreactSearch;
			}
			return foundinstances;
		}
		else return singleinstance;

		function getOwner (instance) {
			depth++;
			var result = undefined;
			if (instance && !Node.prototype.isPrototypeOf(instance) && !BDFDB.ReactUtils.getInstance(instance) && depth < maxdepth && performance.now() - start < maxtime) {
				let props = instance.stateNode ? instance.stateNode.props : instance.props;
				if (instance.stateNode && !Node.prototype.isPrototypeOf(instance.stateNode) && (instance.type && config.name && config.name.some(name => (instance.type.displayName || instance.type.name) === name.split(" _ _ ")[0]) || config.key && config.key.some(key => instance.key == key) || props && config.props && config.props.every(prop => BDFDB.ArrayUtils.is(prop) ? (BDFDB.ArrayUtils.is(prop[1]) ? prop[1].some(checkvalue => BDFDB.equals(props[prop[0]], checkvalue)) : BDFDB.equals(props[prop[0]], prop[1])) : props[prop] !== undefined))) {
					if (config.all === undefined || !config.all) result = instance.stateNode;
					else if (config.all) {
						if (config.noCopies === undefined || !config.noCopies || config.noCopies && !instance.stateNode.BDFDBreactSearch) {
							instance.stateNode.BDFDBreactSearch = true;
							if (config.group) {
								if (config.name && instance.type && (instance.type.displayName || instance.type.name)) {
									var group = "Default";
									for (let name of config.name) if (instance.type.displayName === name.split(" _ _ ")[0] || instance.type.name === name.split(" _ _ ")[0]) {
										group = name;
										break;
									}
									if (typeof foundinstances[group] == "undefined") foundinstances[group] = [];
									foundinstances[group].push(instance.stateNode);
								}
							}
							else foundinstances.push(instance.stateNode);
						}
					}
				}
				if (result === undefined) {
					let keys = Object.getOwnPropertyNames(instance);
					for (let i = 0; result === undefined && i < keys.length; i++) {
						let key = keys[i];
						if (key && whitelist[key] && (typeof instance[key] === "object" || typeof instance[key] === "function")) result = getOwner(instance[key]);
					}
				}
			}
			depth--;
			return result;
		}
	};
	BDFDB.ReactUtils.findProps = function (nodeOrInstance, config) {
		if (!BDFDB.ObjectUtils.is(config)) return null;
		if (!nodeOrInstance || !config.name && !config.key) return null;
		var instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
		if (!BDFDB.ObjectUtils.is(instance)) return null;
		config.name = config.name && !BDFDB.ArrayUtils.is(config.name) ? Array.of(config.name) : config.name;
		config.key = config.key && !BDFDB.ArrayUtils.is(config.key) ? Array.of(config.key) : config.key;
		var depth = -1;
		var start = performance.now();
		var maxdepth = config.unlimited ? 999999999 : (config.depth === undefined ? 30 : config.depth);
		var maxtime = config.unlimited ? 999999999 : (config.time === undefined ? 150 : config.time);
		var whitelist = config.up ? {return:true, sibling:true, _reactInternalFiber:true} : {child:true, sibling:true, _reactInternalFiber:true};
		return findProps(instance);

		function findProps (instance) {
			depth++;
			var result = undefined;
			if (instance && !Node.prototype.isPrototypeOf(instance) && !BDFDB.ReactUtils.getInstance(instance) && depth < maxdepth && performance.now() - start < maxtime) {
				if (instance.memoizedProps && (instance.type && config.name && config.name.some(name => (instance.type.displayName || instance.type.name) === name.split(" _ _ ")[0]) || config.key && config.key.some(key => instance.key == key))) result = instance.memoizedProps;
				if (result === undefined) {
					let keys = Object.getOwnPropertyNames(instance);
					for (let i = 0; result === undefined && i < keys.length; i++) {
						let key = keys[i];
						if (key && whitelist[key] && (typeof instance[key] === "object" || typeof instance[key] === "function")) result = findProps(instance[key]);
					}
				}
			}
			depth--;
			return result;
		}
	};
	BDFDB.ReactUtils.findValue = function (nodeOrInstance, searchkey, config = {}) {
		if (!BDFDB.ObjectUtils.is(config)) return null;
		if (!nodeOrInstance || typeof searchkey != "string") return config.all ? [] : null;
		var instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
		if (!BDFDB.ObjectUtils.is(instance)) return config.all ? [] : null;
		instance = instance._reactInternalFiber || instance;
		var depth = -1;
		var start = performance.now();
		var maxdepth = config.unlimited ? 999999999 : (config.depth === undefined ? 30 : config.depth);
		var maxtime = config.unlimited ? 999999999 : (config.time === undefined ? 150 : config.time);
		var whitelist = {
			props: true,
			state: true,
			stateNode: true,
			refs: true,
			updater: true,
			prototype: true,
			type: true,
			children: config.up ? false : true,
			type: true,
			memoizedProps: true,
			memoizedState: true,
			child: config.up ? false : true,
			return: config.up ? true : false,
			sibling: config.up ? false : true,
			firstEffect: true
		};
		var blacklist = {
			contextSection: true
		};
		if (BDFDB.ObjectUtils.is(config.whitelist)) Object.assign(whitelist, config.whiteList);
		if (BDFDB.ObjectUtils.is(config.blacklist)) Object.assign(blacklist, config.blacklist);
		var foundkeys = [];
		var singlekey = getKey(instance);
		if (config.all) return foundkeys;
		else return singlekey;
		function getKey(instance) {
			depth++;
			var result = undefined;
			if (instance && !Node.prototype.isPrototypeOf(instance) && !BDFDB.ReactUtils.getInstance(instance) && depth < maxdepth && performance.now() - start < maxtime) {
				let keys = Object.getOwnPropertyNames(instance);
				for (let i = 0; result === undefined && i < keys.length; i++) {
					let key = keys[i];
					if (key && !blacklist[key]) {
						var value = instance[key];
						if (searchkey === key && (config.value === undefined || BDFDB.equals(config.value, value))) {
							if (config.all === undefined || !config.all) result = value;
							else if (config.all) {
								if (config.noCopies === undefined || !config.noCopies) foundkeys.push(value);
								else if (config.noCopies) {
									var copy = false;
									for (let foundkey of foundkeys) if (BDFDB.equals(value, foundkey)) {
										copy = true;
										break;
									}
									if (!copy) foundkeys.push(value);
								}
							}
						}
						else if ((typeof value === "object" || typeof value === "function") && (whitelist[key] || key[0] == "." || !isNaN(key[0]))) result = getKey(value);
					}
				}
			}
			depth--;
			return result;
		}
	};
	BDFDB.ReactUtils.forceUpdate = function (...instances) {
		for (let ins of instances.flat()) if (ins && ins.updater && typeof ins.updater.isMounted == "function" && ins.updater.isMounted(ins)) ins.forceUpdate();
	};
	BDFDB.ReactUtils.getInstance = function (node) {
		if (!BDFDB.ObjectUtils.is(node)) return null;
		return node[Object.keys(node).find(key => key.startsWith("__reactInternalInstance"))];
	};
	BDFDB.ReactUtils.getValue = function (nodeOrInstance, valuepath) {
		if (!nodeOrInstance || !valuepath) return null;
		var instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
		if (!BDFDB.ObjectUtils.is(instance)) return null;
		var found = instance, values = valuepath.split(".").filter(n => n);
		for (value of values) {
			if (!found) return null;
			found = found[value];
		}
		return found;
	};
	InternalBDFDB.setDefaultProps = function (component, defaultProps) {
		if (BDFDB.ObjectUtils.is(component)) component.defaultProps = Object.assign({}, component.defaultProps, defaultProps);
	};

	BDFDB.equals = function (mainA, mainB, sorted) {
		var i = -1;
		if (sorted === undefined || typeof sorted !== "boolean") sorted = false;
		return equal(mainA, mainB);
		function equal(a, b) {
			i++;
			var result = true;
			if (i > 1000) result = null;
			else {
				if (typeof a !== typeof b) result = false;
				else if (typeof a === "undefined") result = true;
				else if (typeof a === "symbol") result = true;
				else if (typeof a === "boolean") result = a == b;
				else if (typeof a === "string") result = a == b;
				else if (typeof a === "number") {
					if (isNaN(a) || isNaN(b)) result = isNaN(a) == isNaN(b);
					else result = a == b;
				}
				else if (!a && !b) result = true;
				else if (!a || !b) result = false;
				else if (typeof a === "function" || typeof a === "object") {
					var keysA = Object.getOwnPropertyNames(a);
					var keysB = Object.getOwnPropertyNames(b);
					if (keysA.length !== keysB.length) result = false;
					else for (let j = 0; result === true && j < keysA.length; j++) {
						if (sorted) result = equal(a[keysA[j]], b[keysB[j]]);
						else result = equal(a[keysA[j]], b[keysA[j]]);
					}
				}
			}
			i--;
			return result;
		}
	};

	BDFDB.UserUtils = {};
	var myDataUser = LibraryModules.CurrentUserStore ? LibraryModules.CurrentUserStore.getCurrentUser() : null;
	BDFDB.UserUtils.me = new Proxy(myDataUser || {}, {
		get: function (list, item) {
			if (!myDataUser) myDataUser = LibraryModules.CurrentUserStore.getCurrentUser();
			return myDataUser ? myDataUser[item] : null;
		}
	});
	BDFDB.UserUtils.getStatus = function (id = BDFDB.UserUtils.me.id) {
		id = typeof id == "number" ? id.toFixed() : id;
		let activity = BDFDB.UserUtils.getActivitiy(id);
		return activity && activity.type == BDFDB.DiscordConstants.ActivityTypes.STREAMING ? "streaming" : LibraryModules.StatusMetaUtils.getStatus(id);
	};
	BDFDB.UserUtils.getStatusColor = function (status) {
		status = typeof status == "string" ? status.toLowerCase() : null;
		switch (status) {
			case "online": return BDFDB.DiscordConstants.Colors.STATUS_GREEN;
			case "mobile": return BDFDB.DiscordConstants.Colors.STATUS_GREEN;
			case "idle": return BDFDB.DiscordConstants.Colors.STATUS_YELLOW;
			case "dnd": return BDFDB.DiscordConstants.Colors.STATUS_RED;
			case "playing": return BDFDB.DiscordConstants.Colors.BRAND;
			case "listening": return BDFDB.DiscordConstants.Colors.SPOTIFY;
			case "streaming": return BDFDB.DiscordConstants.Colors.TWITCH;
			default: return BDFDB.DiscordConstants.Colors.STATUS_GREY;
		}
	};
	BDFDB.UserUtils.getActivitiy = function (id = BDFDB.UserUtils.me.id) {
		for (let activity of LibraryModules.StatusMetaUtils.getActivities(id)) if (activity.type != BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS) return activity;
		return null;
	};
	BDFDB.UserUtils.getAvatar = function (id = BDFDB.UserUtils.me.id) {
		var user = LibraryModules.UserStore.getUser(typeof id == "number" ? id.toFixed() : id);
		if (!user) return "https://discordapp.com/assets/322c936a8c8be1b803cd94861bdfa868.png";
		else return ((user.avatar ? "" : "https://discordapp.com") + LibraryModules.IconUtils.getUserAvatarURL(user)).split("?")[0];
	};
	BDFDB.UserUtils.can = function (permission, id = BDFDB.UserUtils.me.id, channelid = LibraryModules.LastChannelStore.getChannelId()) {
		if (!BDFDB.DiscordConstants.Permissions[permission]) BDFDB.LogUtils.warn(permission + " not found in Permissions");
		else {
			var channel = LibraryModules.ChannelStore.getChannel(channelid);
			if (channel) return LibraryModules.PermissionUtils.canUser(id, BDFDB.DiscordConstants.Permissions[permission], channel);
		}
		return false;
	};

	BDFDB.GuildUtils = {};
	BDFDB.GuildUtils.getIcon = function (id) {
		var guild = LibraryModules.GuildStore.getGuild(typeof id == "number" ? id.toFixed() : id);
		if (!guild || !guild.icon) return null;
		return LibraryModules.IconUtils.getGuildIconURL(guild).split("?")[0];
	};
	BDFDB.GuildUtils.getBanner = function (id) {
		var guild = LibraryModules.GuildStore.getGuild(typeof id == "number" ? id.toFixed() : id);
		if (!guild || !guild.banner) return null;
		return LibraryModules.IconUtils.getGuildBannerURL(guild).split("?")[0];
	};
	BDFDB.GuildUtils.getId = function (div) {
		if (!Node.prototype.isPrototypeOf(div) || !BDFDB.ReactUtils.getInstance(div)) return;
		let guilddiv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildouter, div);
		if (!guilddiv) return;
		var iconwrap = guilddiv.querySelector(BDFDB.dotCN.guildiconwrapper);
		var id = iconwrap && iconwrap.href ? iconwrap.href.split("/").slice(-2)[0] : null;
		return id && !isNaN(parseInt(id)) ? id.toString() : null;
	};
	BDFDB.GuildUtils.getDiv = function (eleOrInfoOrId) {
		if (!eleOrInfoOrId) return null;
		if (Node.prototype.isPrototypeOf(eleOrInfoOrId)) return BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildouter, eleOrInfoOrId);
		else {
			let id = typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId;
			if (id) return BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildouter, document.querySelector(`${BDFDB.dotCNS.guilds + BDFDB.dotCN.guildiconwrapper}[href*="/channels/${id}"]`)) || BDFDB.GuildUtils.createCopy(id, {pill: true, hover: true, click: true, menu: true});
		}
		return null;
	};
	BDFDB.GuildUtils.getData = function (eleOrInfoOrId) {
		if (!eleOrInfoOrId) return null;
		let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.GuildUtils.getId(eleOrInfoOrId) : typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId;
		id = typeof id == "number" ? id.toFixed() : id;
		for (let info of BDFDB.GuildUtils.getAll()) if (info && info.id == id) return info;
		return null;
	};
	BDFDB.GuildUtils.getAll = function () {
		var found = [], objs = [];
		for (let ins of BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.guilds), {name:["Guild","GuildIcon"], all:true, noCopies:true, unlimited:true})) {
			if (ins.props && ins.props.guild) objs.push(Object.assign(new ins.props.guild.constructor(ins.props.guild), {div:ins.handleContextMenu ? BDFDB.ReactUtils.findDOMNode(ins) : BDFDB.GuildUtils.createCopy(ins.props.guild), instance:ins}));
		}
		for (let id of BDFDB.LibraryModules.FolderStore.getFlattenedGuildIds()) {
			let foundobj = null;
			for (let obj of objs) if (obj.id == id) {
				foundobj = obj
				break;
			}
			if (foundobj) found.push(foundobj);
			else {
				let guild = BDFDB.LibraryModules.GuildStore.getGuild(id);
				found.push(Object.assign(new guild.constructor(guild), {div:BDFDB.GuildUtils.createCopy(guild), instance:null}))
			}
		}
		return found;
	};
	BDFDB.GuildUtils.getUnread = function (servers) {
		var found = [];
		for (let eleOrInfoOrId of servers === undefined || !BDFDB.ArrayUtils.is(servers) ? BDFDB.GuildUtils.getAll() : servers) {
			if (!eleOrInfoOrId) return null;
			let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.GuildUtils.getId(eleOrInfoOrId) : typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId;
			id = typeof id == "number" ? id.toFixed() : id;
			if (id && (LibraryModules.UnreadGuildUtils.hasUnread(id) || LibraryModules.MentionUtils.getMentionCount(id) > 0)) found.push(eleOrInfoOrId);
		}
		return found;
	};
	BDFDB.GuildUtils.getPinged = function (servers) {
		var found = [];
		for (let eleOrInfoOrId of servers === undefined || !BDFDB.ArrayUtils.is(servers) ? BDFDB.GuildUtils.getAll() : servers) {
			if (!eleOrInfoOrId) return null;
			let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.GuildUtils.getId(eleOrInfoOrId) : typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId;
			id = typeof id == "number" ? id.toFixed() : id;
			if (id && LibraryModules.MentionUtils.getMentionCount(id) > 0) found.push(eleOrInfoOrId);
		}
		return found;
	};
	BDFDB.GuildUtils.getMuted = function (servers) {
		var found = [];
		for (let eleOrInfoOrId of servers === undefined || !BDFDB.ArrayUtils.is(servers) ? BDFDB.GuildUtils.getAll() : servers) {
			if (!eleOrInfoOrId) return null;
			let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.GuildUtils.getId(eleOrInfoOrId) : typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId;
			id = typeof id == "number" ? id.toFixed() : id;
			if (id && LibraryModules.MutedUtils.isGuildOrCategoryOrChannelMuted(id)) found.push(eleOrInfoOrId);
		}
		return found;
	};
	BDFDB.GuildUtils.getSelected = function () {
		var info = LibraryModules.GuildStore.getGuild(LibraryModules.LastGuildStore.getGuildId());
		if (info) return BDFDB.GuildUtils.getData(info.id) || Object.assign(new info.constructor(info), {div:null, instance:null});
		else return null;
	};
	BDFDB.GuildUtils.createCopy = function (infoOrId, functionality = {pill:false, hover:false, click:false, menu:false, size:null}) {
		let id = typeof infoOrId == "object" ? infoOrId.id : infoOrId;
		let guild = id ? LibraryModules.GuildStore.getGuild(id) : null;
		if (guild) {
			let selected = LibraryModules.LastGuildStore.getGuildId() == guild.id;
			let unread = LibraryModules.UnreadGuildUtils.hasUnread(guild.id);
			let div = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCNS.guildouter + BDFDB.disCN._bdguild}"><div class="${BDFDB.disCNS.guildpill + BDFDB.disCN.guildpillwrapper}"><span class="${BDFDB.disCN.guildpillitem}" style="opacity: 0; height: 8px; transform: translate3d(0px, 0px, 0px);"></span></div><div class="${BDFDB.disCN.guildcontainer}" draggable="false" style="border-radius: 50%; overflow: hidden;"><div class="${BDFDB.disCN.guildinner}"><svg width="48" height="48" viewBox="0 0 48 48" class="${BDFDB.disCN.guildsvg}"><mask id="" fill="black" x="0" y="0" width="48" height="48"><path d="M48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24Z" fill="white"></path><rect x="28" y="-4" width="24" height="24" rx="12" ry="12" transform="translate(20 -20)" fill="black"></rect><rect x="28" y="28" width="24" height="24" rx="12" ry="12" transform="translate(20 20)" fill="black"></rect></mask><foreignObject mask="" x="0" y="0" width="48" height="48"><a class="${BDFDB.disCN.guildiconwrapper} ${selected ? (" " + BDFDB.disCN.guildiconselected) : ""}" aria-label="${guild.name}"${functionality.click ? ` href="channels/${guild.id}/${LibraryModules.LastChannelStore.getChannelId(guild.id)}"` : ``} draggable="false">${guild.icon ? `<img class="${BDFDB.disCN.guildicon}" src="${BDFDB.GuildUtils.getIcon(guild.id)}?size=128" alt="" width="48" height="48" draggable="false" aria-hidden="true"></img>` : `<div class="${BDFDB.disCNS.guildiconchildwrapper + BDFDB.disCN.guildiconacronym}" aria-hidden="true" style="font-size: ${guild.acronym.length > 5 ? 10 : (guild.acronym.length > 4 ? 12 : (guild.acronym.length > 3 ? 14 : (guild.acronym.length > 1 ? 16 : 18)))}px;">${guild.acronym}</div>`}</a></foreignObject></svg></div></div><div class="${BDFDB.disCN.guildedgewrapper}" aria-hidden="true"><span class="${BDFDB.disCN.guildedge}"></span><span class="${BDFDB.disCN.guildedgemiddle}"></span><span class="${BDFDB.disCN.guildedge}"></span></div></div>`);
			let divinner = div.querySelector(BDFDB.dotCN.guildcontainer);
			let divpillitem = div.querySelector(BDFDB.dotCN.guildpillitem);
			
			BDFDB.DOMUtils.toggle(divpillitem.parentElement, functionality.pill);
			if (functionality.pill) {
				divpillitem.style.setProperty("opacity", selected ? 1 : (unread ? 0.7 : 0));
				divpillitem.style.setProperty("height", selected ? "40px" : "8px");
				divpillitem.style.setProperty("transform", "translate3d(0px, 0px, 0px)");

				BDFDB.DOMUtils.toggleClass(div, BDFDB.disCN._bdguildselected, selected);
				BDFDB.DOMUtils.toggleClass(div, BDFDB.disCN._bdguildunread, unread);
				BDFDB.DOMUtils.toggleClass(divpillitem, BDFDB.disCN._bdguildunread, unread);
			}
			
			if (functionality.hover) {
				let diviconwrapper = div.querySelector(BDFDB.dotCN.guildiconwrapper);

				let pillvisible = divpillitem.style.getPropertyValue("opacity") != 0;

				let borderRadius = new LibraryModules.AnimationUtils.Value(0);
				borderRadius
					.interpolate({inputRange: [0, 1], outputRange: [50, 30]})
					.addListener((value) => {divinner.style.setProperty("border-radius", `${value.value}%`);});

				let pillHeight = new LibraryModules.AnimationUtils.Value(0);
				pillHeight
					.interpolate({inputRange: [0, 1], outputRange: [8, 20]})
					.addListener((value) => {divpillitem.style.setProperty("height", `${value.value}px`);});

				let pillOpacity = new LibraryModules.AnimationUtils.Value(0);
				pillOpacity
					.interpolate({inputRange: [0, 1], outputRange: [0, 0.7]})
					.addListener((value) => {divpillitem.style.setProperty("opacity", `${value.value}`);});

				let animate = (v) => {
					LibraryModules.AnimationUtils.parallel([
						LibraryModules.AnimationUtils.timing(borderRadius, {toValue: v, duration: 200}),
						LibraryModules.AnimationUtils.spring(pillHeight, {toValue: v, friction: 5})
					]).start();
				};

				let animate2 = (v) => {
					LibraryModules.AnimationUtils.parallel([
						LibraryModules.AnimationUtils.timing(pillOpacity, {toValue: v, duration: 200}),
					]).start();
				};

				divinner.addEventListener("mouseenter", _ => {
					pillvisible = divpillitem.style.getPropertyValue("opacity") != 0;
					if (LibraryModules.LastGuildStore.getGuildId() != guild.id) {
						animate(1);
						if (!pillvisible) animate2(1);
					}
				})
				divinner.addEventListener("mouseleave", _ => {
					if (LibraryModules.LastGuildStore.getGuildId() != guild.id) {
						animate(0);
						if (!pillvisible) animate2(0);
					}
				});
			}
			
			if (functionality.click) divinner.addEventListener("click", e => {
				BDFDB.ListenerUtils.stopEvent(e);
				LibraryModules.GuildUtils.transitionToGuildSync(guild.id);
				if (typeof functionality.click == "function") functionality.click();
			});
			
			if (functionality.menu) divinner.addEventListener("contextmenu", e => {
				BDFDB.GuildUtils.openMenu(guild.id, e);
				if (typeof functionality.menu == "function") functionality.menu();
			});
			
			if (functionality.size) {
				div.style.setProperty("margin", "0", "important");
				div.style.setProperty("width", functionality.size + "px", "important");
				div.style.setProperty("height", functionality.size + "px", "important");
			}
			
			return div;
		}
		else return null;
	};
	BDFDB.GuildUtils.openMenu = function (eleOrInfoOrId, e = BDFDB.mousePosition) {
		if (!eleOrInfoOrId) return;
		let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.GuildUtils.getId(eleOrInfoOrId) : typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId;
		let guild = LibraryModules.GuildStore.getGuild(id);
		if (guild) LibraryModules.ContextMenuUtils.openContextMenu(e, function (e) {
			return BDFDB.ReactUtils.createElement(BDFDB.ModuleUtils.findByName("GuildContextMenu"), Object.assign({}, e, {
				type: BDFDB.DiscordConstants.ContextMenuTypes.GUILD_ICON_BAR,
				guild: guild,
				badge: LibraryModules.MentionUtils.getMentionCount(guild.id),
				link: BDFDB.DiscordConstants.Routes.CHANNEL(guild.id, LibraryModules.LastChannelStore.getChannelId(guild.id)),
				selected: guild.id == LibraryModules.LastGuildStore.getGuildId()
			}));
		});
	};
	BDFDB.GuildUtils.markAsRead = function (guilds) {
		if (!guilds) return;
		var unreadchannels = [];
		for (let guild of BDFDB.ArrayUtils.is(guilds) ? guilds : (typeof guilds == "string" || typeof guilds == "number" ? Array.of(guilds) : Array.from(guilds))) {
			let id = Node.prototype.isPrototypeOf(guild) ? BDFDB.GuildUtils.getId(guild) : guild && typeof guild == "object" ? guild.id : guild;
			let channels = id ? LibraryModules.GuildChannelStore.getChannels(id) : null;
			if (channels) for (let type in channels) if (BDFDB.ArrayUtils.is(channels[type])) for (let channelobj of channels[type]) unreadchannels.push(channelobj.channel.id);
		}
		if (unreadchannels.length) LibraryModules.AckUtils.bulkAck(unreadchannels);
	};

	BDFDB.FolderUtils = {};
	BDFDB.FolderUtils.getId = function (div) {
		if (!Node.prototype.isPrototypeOf(div) || !BDFDB.ReactUtils.getInstance(div)) return;
		div = BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildfolderwrapper, div);
		if (!div) return;
		return BDFDB.ReactUtils.findValue(div, "folderId", {up:true});
	};
	BDFDB.FolderUtils.getDiv = function (eleOrInfoOrId) {
		if (!eleOrInfoOrId) return null;
		let info = BDFDB.FolderUtils.getData(eleOrInfoOrId);
		return info ? info.div : null;
	};
	BDFDB.FolderUtils.getData = function (eleOrInfoOrId) {
		if (!eleOrInfoOrId) return null;
		let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.FolderUtils.getId(eleOrInfoOrId) : typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId;
		id = typeof id == "number" ? id.toFixed() : id;
		for (let info of BDFDB.FolderUtils.getAll()) if (info && info.folderId == id) return info;
		return null;
	};
	BDFDB.FolderUtils.getAll = function () {
		var found = [];
		for (let ins of BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.guildswrapper), {name:"GuildFolder", all:true, noCopies:true, unlimited:true})) {
			if (ins.props && ins.props.folderId) found.push(Object.assign({}, ins.props, {div:BDFDB.ReactUtils.findDOMNode(ins), instance:ins}));
		}
		return found;
	};

	BDFDB.ChannelUtils = {};
	BDFDB.ChannelUtils.getId = function (div) {
		if (!Node.prototype.isPrototypeOf(div) || !BDFDB.ReactUtils.getInstance(div)) return;
		div = BDFDB.DOMUtils.getParent(BDFDB.dotCNC.categorycontainerdefault + BDFDB.dotCNC.channelcontainerdefault + BDFDB.dotCN.dmchannel, div);
		if (!div) return;
		var info = BDFDB.ReactUtils.findValue(div, "channel");
		return info ? info.id.toString() : null;
	};
	BDFDB.ChannelUtils.getDiv = function (eleOrInfoOrId) {
		if (!eleOrInfoOrId) return null;
		let info = BDFDB.ChannelUtils.getData(eleOrInfoOrId);
		return info ? info.div : null;
	};
	BDFDB.ChannelUtils.getData = function (eleOrInfoOrId) {
		if (!eleOrInfoOrId) return null;
		let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.ChannelUtils.getId(eleOrInfoOrId) : typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId;
		id = typeof id == "number" ? id.toFixed() : id;
		for (let info of BDFDB.ChannelUtils.getAll()) if (info && info.id == id) return info;
		return null;
	};
	BDFDB.ChannelUtils.getAll = function () {
		var found = [];
		for (let ins of BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.channels), {name: ["ChannelCategoryItem", "ChannelItem", "PrivateChannel"], all:true, noCopies:true, unlimited:true})) if (ins.props && !ins.props.ispin && ins.props.channel && ins._reactInternalFiber.return) {
			var div = BDFDB.ReactUtils.findDOMNode(ins);
			div = div && BDFDB.DOMUtils.containsClass(div.parentElement, BDFDB.disCN.categorycontainerdefault, BDFDB.disCN.channelcontainerdefault, false) ? div.parentElement : div;
			found.push(Object.assign(new ins.props.channel.constructor(ins.props.channel), {div, instance:ins}));
		}
		return found;
	};
	BDFDB.ChannelUtils.getSelected = function () {
		var info = LibraryModules.ChannelStore.getChannel(LibraryModules.LastChannelStore.getChannelId());
		if (info) return BDFDB.ChannelUtils.getData(info.id) || Object.assign(new info.constructor(info), {div:null, instance:null});
		else return null;
	};
	BDFDB.ChannelUtils.openMenu = function (eleOrInfoOrId, e = BDFDB.mousePosition) {
		if (!eleOrInfoOrId) return;
		let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.ChannelUtils.getId(eleOrInfoOrId) : typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId;
		let channel = LibraryModules.ChannelStore.getChannel(id);
		if (channel) {
			let type = null;
			for (let t in BDFDB.DiscordConstants.ChannelTypes) if (BDFDB.DiscordConstants.ChannelTypes[t] == channel.type) {
				type = BDFDB.DiscordConstants.ContextMenuTypes[(t == "GUILD_CATEGORY" ? "CHANNEL_" : "CHANNEL_LIST_") + t.replace("GUILD_", "")];
				break;
			}
			if (type) LibraryModules.ContextMenuUtils.openContextMenu(e, function (e) {
				return BDFDB.ReactUtils.createElement(BDFDB.ModuleUtils.findByName("ChannelContextMenu"), Object.assign({}, e, {
					type,
					channel,
					guild: LibraryModules.GuildStore.getGuild(channel.guild_id),
					selected: channel.id == LibraryModules.LastChannelStore.getChannelId()
				}));
			});
		}
	};
	
	BDFDB.DMUtils = {};
	BDFDB.DMUtils.getIcon = function (id) {
		var channel = LibraryModules.ChannelStore.getChannel(id = typeof id == "number" ? id.toFixed() : id);
		if (!channel) return null;
		if (!channel.icon) return channel.type == 1 ? BDFDB.UserUtils.getAvatar(channel.recipients[0]) : (channel.type == 3 ? "https://discordapp.com/assets/f046e2247d730629309457e902d5c5b3.svg" : null);
		return LibraryModules.IconUtils.getChannelIconURL(channel).split("?")[0];
	};
	BDFDB.DMUtils.getId = function (div) {
		if (!Node.prototype.isPrototypeOf(div) || !BDFDB.ReactUtils.getInstance(div)) return;
		let dmdiv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildouter, div);
		if (!dmdiv) return;
		var iconwrap = dmdiv.querySelector(BDFDB.dotCN.guildiconwrapper);
		var id = iconwrap && iconwrap.href ? iconwrap.href.split("/").slice(-1)[0] : null;
		return id && !isNaN(parseInt(id)) ? id.toString() : null;
	};
	BDFDB.DMUtils.getDiv = function (eleOrInfoOrId) {
		if (!eleOrInfoOrId) return null;
		if (Node.prototype.isPrototypeOf(eleOrInfoOrId)) {
			var div = BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildouter, eleOrInfoOrId);
			return div ? div.parentElement : div;
		}
		else {
			let id = typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId;
			if (id) {
				var div = BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildouter, document.querySelector(`${BDFDB.dotCNS.guilds + BDFDB.dotCN.dmpill + " + * " + BDFDB.dotCN.guildiconwrapper}[href*="/channels/@me/${id}"]`));
				return div && BDFDB? div.parentElement : div;
			}
		}
		return null;
	};
	BDFDB.DMUtils.getData = function (eleOrInfoOrId) {
		if (!eleOrInfoOrId) return null;
		let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.getDmID(eleOrInfoOrId) : typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId;
		id = typeof id == "number" ? id.toFixed() : id;
		for (let info of BDFDB.DMUtils.getAll()) if (info && info.id == id) return info;
		return null;
	};
	BDFDB.DMUtils.getAll = function () {
		var found = [];
		for (let ins of BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.guilds), {name:"DirectMessage", all:true, noCopies:true, unlimited:true})) {
			if (ins.props && ins.props.channel) found.push(Object.assign(new ins.props.channel.constructor(ins.props.channel), {div:BDFDB.ReactUtils.findDOMNode(ins), instance:ins}));
		}
		return found;
	};
	BDFDB.DMUtils.markAsRead = BDFDB.ChannelUtils.markAsRead = function (channels) {
		if (!channels) return;
		var unreadchannels = [];
		for (let cha of channels = BDFDB.ArrayUtils.is(channels) ? channels : (typeof channels == "string" || typeof channels == "number" ? Array.of(channels) : Array.from(channels))) {
			let id = Node.prototype.isPrototypeOf(cha) ? (BDFDB.ChannelUtils.getId(cha) || BDFDB.getDmID(cha)) : cha && typeof cha == "object" ? cha.id : cha;
			if (id) unreadchannels.push(id);
		}
		if (unreadchannels.length) LibraryModules.AckUtils.bulkAck(unreadchannels);
	};

	BDFDB.DataUtils = {};
	BDFDB.DataUtils.cached = {};
	BDFDB.DataUtils.save = function (data, plugin, key, id) {
		var configpath, pluginname;
		if (!BDFDB.BDUtils.isBDv2()) {
			pluginname = typeof plugin === "string" ? plugin : plugin.name;
			configpath = LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), pluginname + ".config.json");
		}
		else {
			pluginname = typeof plugin === "string" ? plugin.toLowerCase() : null;
			var contentpath = pluginname ? BDFDB.Plugins[pluginname] ? BDFDB.Plugins[pluginname].contentPath : null : plugin.contentPath;
			if (!contentpath) return;
			configpath = LibraryRequires.path.join(contentpath, "settings.json");
		}
		
		var exists = LibraryRequires.fs.existsSync(configpath);
		var config = !exists ? {} : typeof BDFDB.DataUtils.cached[pluginname] !== "undefined" ? BDFDB.DataUtils.cached[pluginname] : InternalBDFDB.readConfig(configpath);
		
		if (id === undefined) config[key] = BDFDB.ObjectUtils.is(data) ? BDFDB.ObjectUtils.sort(data) : data;
		else {
			if (!BDFDB.ObjectUtils.is(config[key])) config[key] = {};
			config[key][id] = BDFDB.ObjectUtils.is(data) ? BDFDB.ObjectUtils.sort(data) : data;
		}
		
		if (BDFDB.ObjectUtils.isEmpty(config[key])) delete config[key];
		if (BDFDB.ObjectUtils.isEmpty(config)) {
			delete BDFDB.DataUtils.cached[pluginname];
			if (exists) LibraryRequires.fs.unlinkSync(configpath);
		}
		else {
			config = BDFDB.ObjectUtils.sort(config);
			BDFDB.DataUtils.cached[pluginname] = BDFDB.ObjectUtils.deepAssign({}, config);
			LibraryRequires.fs.writeFileSync(configpath, JSON.stringify(config, null, "	"));
		}
	};

	BDFDB.DataUtils.load = function (plugin, key, id) {
		var configpath, pluginname;
		if (!BDFDB.BDUtils.isBDv2()) {
			pluginname = typeof plugin === "string" ? plugin : plugin.name;
			configpath = LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), pluginname + ".config.json");
		}
		else {
			pluginname = typeof plugin === "string" ? plugin.toLowerCase() : null;
			var contentpath = pluginname ? BDFDB.Plugins[pluginname] ? BDFDB.Plugins[pluginname].contentPath : null : plugin.contentPath;
			if (!contentpath) return {};
			configpath = LibraryRequires.path.join(contentpath, "settings.json");
		}
		
		if (!LibraryRequires.fs.existsSync(configpath)) {
			delete BDFDB.DataUtils.cached[pluginname];
			return {};
		}
		var config = typeof BDFDB.DataUtils.cached[pluginname] !== "undefined" && typeof BDFDB.DataUtils.cached[pluginname][key] !== "undefined" ? BDFDB.DataUtils.cached[pluginname] : InternalBDFDB.readConfig(configpath);
		BDFDB.DataUtils.cached[pluginname] = BDFDB.ObjectUtils.deepAssign({}, config);
		
		let keydata = BDFDB.ObjectUtils.deepAssign({}, config && typeof config[key] !== "undefined" ? config[key] : {});
		if (id === undefined) return keydata;
		else return keydata[id] === undefined ? null : keydata[id];
	};
	BDFDB.DataUtils.remove = function (plugin, key, id) {
		var configpath, pluginname;
		if (!BDFDB.BDUtils.isBDv2()) {
			pluginname = typeof plugin === "string" ? plugin : plugin.name;
			configpath = LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), pluginname + ".config.json");
		}
		else {
			pluginname = typeof plugin === "string" ? plugin.toLowerCase() : null;
			var contentpath = pluginname ? BDFDB.Plugins[pluginname] ? BDFDB.Plugins[pluginname].contentPath : null : plugin.contentPath;
			if (!contentpath) return;
			configpath = LibraryRequires.path.join(contentpath, "settings.json");
		}
		
		var exists = LibraryRequires.fs.existsSync(configpath);
		var config = !exists ? {} : typeof BDFDB.DataUtils.cached[pluginname] !== "undefined" ? BDFDB.DataUtils.cached[pluginname] : InternalBDFDB.readConfig(configpath);
		
		if (id === undefined) delete config[key];
		else if (BDFDB.ObjectUtils.is(config[key])) delete config[key][id];
		
		if (BDFDB.ObjectUtils.isEmpty(config[key])) delete config[key];
		if (BDFDB.ObjectUtils.isEmpty(config)) {
			delete BDFDB.DataUtils.cached[pluginname];
			if (exists) LibraryRequires.fs.unlinkSync(configpath);
		}
		else {
			config = BDFDB.ObjectUtils.sort(config);
			BDFDB.DataUtils.cached[pluginname] = config;
			LibraryRequires.fs.writeFileSync(configpath, JSON.stringify(config, null, "	"));
		}
	};
	BDFDB.DataUtils.get = function (plugin, key, id) {
		plugin = typeof plugin == "string" ? BDFDB.BDUtils.getPlugin(plugin) : plugin;
		if (!BDFDB.ObjectUtils.is(plugin) || !plugin.defaults || !plugin.defaults[key]) return {};
		var oldconfig = BDFDB.DataUtils.load(plugin, key), newconfig = {}, update = false;
		for (let k in plugin.defaults[key]) {
			if (oldconfig[k] == null) {
				newconfig[k] = BDFDB.ObjectUtils.is(plugin.defaults[key][k].value) ? BDFDB.ObjectUtils.deepAssign({}, plugin.defaults[key][k].value) : plugin.defaults[key][k].value;
				update = true;
			}
			else newconfig[k] = oldconfig[k];
		}
		if (update) BDFDB.DataUtils.save(newconfig, plugin, key);
		
		if (id === undefined) return newconfig;
		else return newconfig[id] === undefined ? null : newconfig[id];
	};
	InternalBDFDB.readConfig = function (path) {
		try {return JSON.parse(LibraryRequires.fs.readFileSync(path));}
		catch (err) {return {};}
	};
	
	BDFDB.ColorUtils = {};
	BDFDB.ColorUtils.convert = function (color, conv, type) {
		if (color == null) return null;
		conv = conv === undefined || !conv ? conv = "RGBCOMP" : conv.toUpperCase();
		type = type === undefined || !type || !["RGB", "RGBA", "RGBCOMP", "HSL", "HSLA", "HSLCOMP", "HEX", "HEXA", "INT"].includes(type.toUpperCase()) ? BDFDB.ColorUtils.getType(color) : type.toUpperCase();
		if (conv == "RGBCOMP") {
			switch (type) {
				case "RGBCOMP":
					if (color.length == 3) return processRGB(color);
					else if (color.length == 4) {
						let a = processA(color.pop());
						return processRGB(color).concat(a);
					}
					break;
				case "RGB":
					return processRGB(color.replace(/\s/g, "").slice(4, -1).split(","));
				case "RGBA":
					let comp = color.replace(/\s/g, "").slice(5, -1).split(",");
					let a = processA(comp.pop());
					return processRGB(comp).concat(a);
				case "HSLCOMP":
					if (color.length == 3) return BDFDB.ColorUtils.convert(`hsl(${processHSL(color).join(",")})`, "RGBCOMP");
					else if (color.length == 4) {
						let a = processA(color.pop());
						return BDFDB.ColorUtils.convert(`hsl(${processHSL(color).join(",")})`, "RGBCOMP").concat(a);
					}
					break;
				case "HSL":
					var hslcomp = processHSL(color.replace(/\s/g, "").slice(4, -1).split(","));
					var r, g, b, m, c, x, p, q;
					var h = hslcomp[0] / 360, l = parseInt(hslcomp[1]) / 100, s = parseInt(hslcomp[2]) / 100; m = Math.floor(h * 6); c = h * 6 - m; x = s * (1 - l); p = s * (1 - c * l); q = s * (1 - (1 - c) * l);
					switch (m % 6) {
						case 0: r = s, g = q, b = x; break;
						case 1: r = p, g = s, b = x; break;
						case 2: r = x, g = s, b = q; break;
						case 3: r = x, g = p, b = s; break;
						case 4: r = q, g = x, b = s; break;
						case 5: r = s, g = x, b = p; break;
					}
					return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
				case "HSLA":
					var hslcomp = color.replace(/\s/g, "").slice(5, -1).split(",");
					return BDFDB.ColorUtils.convert(`hsl(${hslcomp.join(",")})`, "RGBCOMP").concat(processA(hslcomp.pop()));
				case "HEX":
					var hex = /^#([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$|^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
					return [parseInt(hex[1] + hex[1] || hex[4], 16).toString(), parseInt(hex[2] + hex[2] || hex[5], 16).toString(), parseInt(hex[3] + hex[3] || hex[6], 16).toString()];
				case "HEXA":
					var hex = /^#([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$|^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
					return [parseInt(hex[1] + hex[1] || hex[5], 16).toString(), parseInt(hex[2] + hex[2] || hex[6], 16).toString(), parseInt(hex[3] + hex[3] || hex[7], 16).toString(), Math.floor(BDFDB.NumberUtils.mapRange([0, 255], [0, 100], parseInt(hex[4] + hex[4] || hex[8], 16).toString()))/100];
				case "INT":
					color = processINT(color);
					return [(color >> 16 & 255).toString(), (color >> 8 & 255).toString(), (color & 255).toString()];
				default:
					return null;
			}
		}
		else {
			var rgbcomp = type == "RGBCOMP" ? color : BDFDB.ColorUtils.convert(color, "RGBCOMP", type);
			if (rgbcomp) switch (conv) {
				case "RGB":
					return `rgb(${processRGB(rgbcomp.slice(0, 3)).join(",")})`;
				case "RGBA":
					rgbcomp = rgbcomp.slice(0, 4);
					var a = rgbcomp.length == 4 ? processA(rgbcomp.pop()) : 1;
					return `rgba(${processRGB(rgbcomp).concat(a).join(",")})`;
				case "HSLCOMP":
					var a = rgbcomp.length == 4 ? processA(rgbcomp.pop()) : null;
					var hslcomp = processHSL(BDFDB.ColorUtils.convert(rgbcomp, "HSL").replace(/\s/g, "").split(","));
					return a != null ? hslcomp.concat(a) : hslcomp;
				case "HSL":
					var r = processC(rgbcomp[0]), g = processC(rgbcomp[1]), b = processC(rgbcomp[2]);
					var max = Math.max(r, g, b), min = Math.min(r, g, b), dif = max - min, h, l = max === 0 ? 0 : dif / max, s = max / 255;
					switch (max) {
						case min: h = 0; break;
						case r: h = g - b + dif * (g < b ? 6 : 0); h /= 6 * dif; break;
						case g: h = b - r + dif * 2; h /= 6 * dif; break;
						case b: h = r - g + dif * 4; h /= 6 * dif; break;
					}
					return `hsl(${processHSL([Math.round(h * 360), l * 100, s * 100]).join(",")})`;
				case "HSLA":
					var j0 = rgbcomp.length == 4 ? processA(rgbcomp.pop()) : 1;
					return `hsla(${BDFDB.ColorUtils.convert(rgbcomp, "HSL").slice(4, -1).split(",").concat(j0).join(",")})`;
				case "HEX":
					return ("#" + (0x1000000 + (rgbcomp[2] | rgbcomp[1] << 8 | rgbcomp[0] << 16)).toString(16).slice(1)).toUpperCase();
				case "HEXA":
					return ("#" + (0x1000000 + (rgbcomp[2] | rgbcomp[1] << 8 | rgbcomp[0] << 16)).toString(16).slice(1) + (0x100 + Math.round(BDFDB.NumberUtils.mapRange([0, 100], [0, 255], processA(rgbcomp[3]) * 100))).toString(16).slice(1)).toUpperCase();
				case "INT":
					return processINT(rgbcomp[2] | rgbcomp[1] << 8 | rgbcomp[0] << 16);
				default:
					return null;
			}
		}
		function processC(c) {if (c == null) {return 255;} else {c = parseInt(c.toString().replace(/[^0-9\-]/g, ""));return isNaN(c) || c > 255 ? 255 : c < 0 ? 0 : c;}};
		function processRGB(comp) {return comp.map(c => {return processC(c);});};
		function processA(a) {if (a == null) {return 1;} else {a = a.toString();a = (a.indexOf("%") > -1 ? 0.01 : 1) * parseFloat(a.replace(/[^0-9\.\-]/g, ""));return isNaN(a) || a > 1 ? 1 : a < 0 ? 0 : a;}};
		function processSL(sl) {if (sl == null) {return "100%";} else {sl = parseFloat(sl.toString().replace(/[^0-9\.\-]/g, ""));return (isNaN(sl) || sl > 100 ? 100 : sl < 0 ? 0 : sl) + "%";}};
		function processHSL(comp) {let h = parseFloat(comp.shift().toString().replace(/[^0-9\.\-]/g, ""));h = isNaN(h) || h > 360 ? 360 : h < 0 ? 0 : h;return [h].concat(comp.map(sl => {return processSL(sl);}));};
		function processINT(c) {if (c == null) {return 16777215;} else {c = parseInt(c.toString().replace(/[^0-9]/g, ""));return isNaN(c) || c > 16777215 ? 16777215 : c < 0 ? 0 : c;}};
	};
	BDFDB.ColorUtils.setAlpha = function (color, a, conv) {
		if (BDFDB.ObjectUtils.is(color)) {
			var newcolor = {};
			for (let pos in color) newcolor[pos] = setAlpha(color[pos], a, conv);
			return newcolor;
		}
		return setAlpha(color, a, conv);
		function setAlpha (color) {
			var comp = BDFDB.ColorUtils.convert(color, "RGBCOMP");
			if (comp) {
				a = a.toString();
				a = (a.indexOf("%") > -1 ? 0.01 : 1) * parseFloat(a.replace(/[^0-9\.\-]/g, ""));
				a = isNaN(a) || a > 1 ? 1 : a < 0 ? 0 : a;
				comp[3] = a;
				conv = (conv || BDFDB.ColorUtils.getType(color)).toUpperCase();
				conv = conv == "RGB" || conv == "HSL" || conv == "HEX" ? conv + "A" : conv;
				return BDFDB.ColorUtils.convert(comp, conv);
			}
			return null;
		}
	};
	BDFDB.ColorUtils.getAlpha = function (color) {
		var comp = BDFDB.ColorUtils.convert(color, "RGBCOMP");
		if (comp) {
			if (comp.length == 3) return 1;
			else if (comp.length == 4) {
				let a = comp[3].toString();
				a = (a.indexOf("%") > -1 ? 0.01 : 1) * parseFloat(a.replace(/[^0-9\.\-]/g, ""));
				return isNaN(a) || a > 1 ? 1 : a < 0 ? 0 : a;
			}
		}
		return null;
	};
	BDFDB.ColorUtils.change = function (color, value, conv) {
		value = parseFloat(value);
		if (color != null && typeof value == "number" && !isNaN(value)) {
			if (BDFDB.ObjectUtils.is(color)) {
				var newcolor = {};
				for (let pos in color) newcolor[pos] = change(color[pos], value, conv);
				return newcolor;
			}
			else return change(color, value, conv);
		}
		return null;
		function change (color) {
			var comp = BDFDB.ColorUtils.convert(color, "RGBCOMP");
			if (comp) {
				if (parseInt(value) !== value) {
					value = value.toString();
					value = (value.indexOf("%") > -1 ? 0.01 : 1) * parseFloat(value.replace(/[^0-9\.\-]/g, ""));
					value = isNaN(value) ? 0 : value;
					return BDFDB.ColorUtils.convert([Math.round(comp[0] * (1 + value)), Math.round(comp[1] * (1 + value)), Math.round(comp[2] * (1 + value))], conv || BDFDB.ColorUtils.getType(color));
				}
				else return BDFDB.ColorUtils.convert([Math.round(comp[0] + value), Math.round(comp[1] + value), Math.round(comp[2] + value)], conv || BDFDB.ColorUtils.getType(color));
			}
			return null;
		};
	};
	BDFDB.ColorUtils.invert = function (color, conv) {
		if (color != null) {
			var comp = BDFDB.ColorUtils.convert(color, "RGBCOMP");
			if (comp) return BDFDB.ColorUtils.convert([255 - comp[0], 255 - comp[1], 255 - comp[2]], conv || BDFDB.ColorUtils.getType(color));
		}
		return null;
	};

	BDFDB.ColorUtils.compare = function (color1, color2) {
		if (color1 && color2) {
			color1 = BDFDB.ColorUtils.convert(color1, "RGBA");
			color2 = BDFDB.ColorUtils.convert(color2, "RGBA");
			if (color1 && color2) return BDFDB.equals(color1, color2);
		}
		return null;
	};
	BDFDB.ColorUtils.isBright = function (color, compare = 160) {
		color = BDFDB.ColorUtils.convert(color, "RGBCOMP");
		if (!color) return false;
		return parseInt(compare) < Math.sqrt(0.299 * color[0]**2 + 0.587 * color[1]**2 + 0.144 * color[2]**2);
	};
	BDFDB.ColorUtils.getType = function (color) {
		if (color != null) {
			if (typeof color === "object" && (color.length == 3 || color.length == 4)) {
				if (isRGB(color)) return "RGBCOMP";
				else if (isHSL(color)) return "HSLCOMP";
			}
			else if (typeof color === "string") {
				if (/^#[a-f\d]{3}$|^#[a-f\d]{6}$/i.test(color)) return "HEX";
				else if (/^#[a-f\d]{4}$|^#[a-f\d]{8}$/i.test(color)) return "HEXA";
				else {
					color = color.toUpperCase();
					var comp = color.replace(/[^0-9\.\-\,\%]/g, "").split(",");
					if (color.indexOf("RGB(") == 0 && comp.length == 3 && isRGB(comp)) return "RGB";
					else if (color.indexOf("RGBA(") == 0 && comp.length == 4 && isRGB(comp)) return "RGBA";
					else if (color.indexOf("HSL(") == 0 && comp.length == 3 && isHSL(comp)) return "HSL";
					else if (color.indexOf("HSLA(") == 0 && comp.length == 4 && isHSL(comp)) return "HSLA";
				}
			}
			else if (typeof color === "number" && parseInt(color) == color && color > -1 && color < 16777216) return "INT";
		}
		return null;
		function isRGB(comp) {return comp.slice(0, 3).every(rgb => rgb.toString().indexOf("%") == -1 && parseFloat(rgb) == parseInt(rgb));};
		function isHSL(comp) {return comp.slice(1, 3).every(hsl => hsl.toString().indexOf("%") == hsl.length - 1);};
	};
	BDFDB.ColorUtils.createGradient = function (colorobj, direction = "to right") {
		var sortedgradient = {};
		var gradientstring = "linear-gradient(" + direction;
		for (let pos of Object.keys(colorobj).sort()) gradientstring += `, ${colorobj[pos]} ${pos*100}%`
		return gradientstring += ")";
	};
	BDFDB.ColorUtils.getSwatchColor = function (container, number) {
		if (!Node.prototype.isPrototypeOf(container)) return;
		var swatches = container.querySelector(`${BDFDB.dotCN.colorpickerswatches}[number="${number}"], ${BDFDB.dotCN.colorpickerswatch}[number="${number}"]`);
		if (!swatches) return null;
		var ins = BDFDB.ReactUtils.getInstance(swatches);
		if (ins) return BDFDB.ReactUtils.findValue(ins, "selectedColor", {up:true, blacklist:{"props":true}});
		else { // REMOVE ONCE REWRITTEN
			var swatch = swatches.querySelector(`${BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatchselected}`);
			return swatch ? swatch.gradient || BDFDB.ColorUtils.convert(swatch.style.getPropertyValue("background-color"), "RGBCOMP") : null;
		}
	};
	BDFDB.ColorUtils.openPicker = function (container, target, color, options = {gradient: true, alpha: true, callback: _ => {}}) {
		if (!container || !target) return;
		
		if (typeof options.callback != "function") options.callback = _ => {};
		
		var hexformat = options.alpha ? "HEXA" : "HEX";
		var hexregex = options.alpha ? /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i : /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
		var isreact = BDFDB.ObjectUtils.is(container) && !!container._reactInternalFiber;
		var isswatches = !isreact && BDFDB.DOMUtils.containsClass(container, "swatches");
		var isgradient = color && BDFDB.ObjectUtils.is(color);
		var selectedcolor = BDFDB.ColorUtils.convert(isgradient ? color[Object.keys(color)[0]] : color, hexformat) || (options.alpha ? "#000000FF" : "#000000");
		var [h, s, l] = BDFDB.ColorUtils.convert(selectedcolor, "HSLCOMP");
		var a = BDFDB.ColorUtils.getAlpha(isgradient ? color[Object.keys(color)[0]] : color);
		a = a == null ? 1 : a;
			 
		var targetrects = BDFDB.DOMUtils.getRects(target);
		var colorPicker = BDFDB.DOMUtils.create(`<div role="dialog" class="BDFDB-colorpicker ${BDFDB.disCNS.popoutnoarrow + BDFDB.disCNS.popoutnoshadow + BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottom + BDFDB.disCNS.popoutarrowalignmenttop + BDFDB.disCN.themeundefined}" style="z-index: 2001; visibility: visible; left: ${targetrects.left + targetrects.width/2}px; top: ${targetrects.top + targetrects.height}px; transform: translateX(-50%) translateY(0%) translateZ(0px);"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.colorpicker}" style="flex: 1 1 auto;"><div class="${BDFDB.disCN.colorpickerinner}"><div class="${BDFDB.disCN.colorpickersaturation}"><div class="saturation-color" style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px; background: ${BDFDB.ColorUtils.convert([h, "100%", "100%"], "RGB")} !important;"><style>.saturation-white {background: -webkit-linear-gradient(to right, #fff, rgba(255,255,255,0));background: linear-gradient(to right, #fff, rgba(255,255,255,0));}.saturation-black {background: -webkit-linear-gradient(to top, #000, rgba(0,0,0,0));background: linear-gradient(to top, #000, rgba(0,0,0,0));}</style><div class="saturation-white" style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"><div class="saturation-black" style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"></div><div class="saturation-cursor" style="position: absolute; top: 55.2941%; left: 44.7368%; cursor: default;"><div style="width: 4px; height: 4px; box-shadow: rgb(255, 255, 255) 0px 0px 0px 1.5px, rgba(0, 0, 0, 0.3) 0px 0px 1px 1px inset, rgba(0, 0, 0, 0.4) 0px 0px 1px 2px; border-radius: 50%; transform: translate(-2px, -2px);"></div></div></div></div></div><div class="${BDFDB.disCN.colorpickerhue}"><div style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"><div class="hue-horizontal" style="padding: 0px 2px; position: relative; height: 100%;"><style>.hue-horizontal {background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);background: -webkit-linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);}.hue-vertical {background: linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);background: -webkit-linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);}</style><div class="hue-cursor" style="position: absolute; left: 0%;"><div style="margin-top: -4px !important; width: 4px; border-radius: 1px; height: 8px; box-shadow: rgba(0, 0, 0, 0.6) 0px 0px 2px; background: rgb(255, 255, 255); transform: translateX(-2px);"></div></div></div></div></div><div class="alpha-bar" style="position: relative; height: 8px; margin: 16px 0 8px;"><div style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"><div class="alpha-checker" style="padding: 0px 2px; position: relative; height: 100%; background-color: transparent;"></div></div><div style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"><div class="alpha-horizontal" style="padding: 0px 2px; position: relative; height: 100%;"><div class="alpha-cursor" style="position: absolute; left: 0%;"><div style="margin-top: -4px; width: 8px; border-radius: 3px; height: 16px; box-shadow: rgba(0, 0, 0, 0.6) 0px 0px 2px; background: rgb(255, 255, 255); transform: translateX(-2px);"></div></div></div></div></div><div class="gradient-bar" style="position: relative; height: 8px; margin: 27px 2px 2px 2px;${!isgradient ? " display: none;" : ""}"><div style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"><div class="alpha-checker" style="padding: 0px 2px; position: relative; height: 100%; background-color: transparent;"></div></div><div style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"><div class="gradient-horizontal" style="padding: 0px 2px; position: relative; height: 100%; background-color: ${selectedcolor};"><div class="gradient-cursor edge selected" style="position: absolute; left: 0%;"><div style="background-color: ${selectedcolor} !important;"></div></div><div class="gradient-cursor edge" style="position: absolute; left: 100%;"><div style="background-color: ${isgradient ? BDFDB.ColorUtils.convert(color[1], "RGBA") : selectedcolor} !important;"></div></div></div></div></div></div><div class="${BDFDB.disCNS.horizontal + BDFDB.disCNS.colorpickerhexinput + BDFDB.disCN.margintop8}"><input class="${BDFDB.disCN.inputdefault}" maxlength="${options.alpha ? 9 : 7}" name="" type="text" placeholder="${selectedcolor}" value="${selectedcolor}"></input><div class="gradient-button${isgradient ? " selected" : ""}" style="transform: rotate(-90deg); margin: 2px 0 0 5px; cursor: pointer; border-radius: 5px; height: 36px;"><svg width="36" height="36" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M469.333333 384h85.333334v85.333333h-85.333334z m-85.333333 85.333333h85.333333v85.333334H384z m170.666667 0h85.333333v85.333334h-85.333333z m85.333333-85.333333h85.333333v85.333333h-85.333333zM298.666667 384h85.333333v85.333333H298.666667z m512-256H213.333333c-46.933333 0-85.333333 38.4-85.333333 85.333333v597.333334c0 46.933333 38.4 85.333333 85.333333 85.333333h597.333334c46.933333 0 85.333333-38.4 85.333333-85.333333V213.333333c0-46.933333-38.4-85.333333-85.333333-85.333333zM384 768H298.666667v-85.333333h85.333333v85.333333z m170.666667 0h-85.333334v-85.333333h85.333334v85.333333z m170.666666 0h-85.333333v-85.333333h85.333333v85.333333z m85.333334-298.666667h-85.333334v85.333334h85.333334v85.333333h-85.333334v-85.333333h-85.333333v85.333333h-85.333333v-85.333333h-85.333334v85.333333H384v-85.333333H298.666667v85.333333H213.333333v-85.333333h85.333334v-85.333334H213.333333V213.333333h597.333334v256z"></path></svg></div></div></div><div class="move-corner" style="width: 10px; height: 10px; cursor: move; position: absolute; top: 0; left: 0;"></div><div class="move-corner" style="width: 10px; height: 10px; cursor: move; position: absolute; top: 0; right: 0;"></div><div class="move-corner" style="width: 10px; height: 10px; cursor: move; position: absolute; bottom: 0; right: 0;"></div><div class="move-corner" style="width: 10px; height: 10px; cursor: move; position: absolute; bottom: 0; left: 0;"></div></div>`);
		document.querySelector(BDFDB.dotCN.popouts).appendChild(colorPicker);

		var removePopout = e => {
			if (!colorPicker.contains(e.target)) {
				document.removeEventListener("mousedown", removePopout);
				colorPicker.remove();
			}
		};
		document.addEventListener("mousedown", removePopout);

		var hexinput = colorPicker.querySelector(BDFDB.dotCNS.colorpickerhexinput + BDFDB.dotCN.input);
		var satpane = colorPicker.querySelector(".saturation-color");
		var satcursor = colorPicker.querySelector(".saturation-cursor");
		var huepane = colorPicker.querySelector(".hue-horizontal");
		var huecursor = colorPicker.querySelector(".hue-cursor");
		var alphabar = colorPicker.querySelector(".alpha-bar");
		var alphapane = colorPicker.querySelector(".alpha-horizontal");
		var alphacursor = colorPicker.querySelector(".alpha-cursor");
		var gradientbutton = colorPicker.querySelector(".gradient-button");
		var gradientbar = colorPicker.querySelector(".gradient-bar");
		var gradientpane = colorPicker.querySelector(".gradient-horizontal");

		var sMinX, sMaxX, sMinY, sMaxY, hMinX, hMaxX, aMinX, aMaxX, gMinX, gMaxX;

		updateRects();

		if (isgradient) for (let pos in color) if (pos > 0 && pos < 1) gradientpane.appendChild(BDFDB.DOMUtils.create(`<div class="gradient-cursor" style="position: absolute; left: ${pos * 100}%;"><div style="background-color: ${color[pos]} !important;"></div></div>`));

		updateColors(false);
		
		if (!options.gradient) BDFDB.DOMUtils.remove(colorPicker.querySelectorAll(".gradient-button, .gradient-bar"));
		if (!options.alpha) BDFDB.DOMUtils.remove(colorPicker.querySelectorAll(".alpha-bar"));

		BDFDB.ListenerUtils.addToChildren(colorPicker, "mousedown", ".move-corner", e => {
			var rects = BDFDB.DOMUtils.getRects(colorPicker);
			var transform = getComputedStyle(colorPicker, null).getPropertyValue("transform").replace(/[^0-9,-]/g,"").split(",");
			var left = rects.left - (transform.length > 4 ? parseFloat(transform[4]) : 0);
			var top = rects.top - (transform.length > 4 ? parseFloat(transform[5]) : 0);
			var oldX = e.pageX;
			var oldY = e.pageY;
			var mouseup = _ => {
				BDFDB.DOMUtils.removeLocalStyle("disableTextSelection");
				document.removeEventListener("mouseup", mouseup);
				document.removeEventListener("mousemove", mousemove);
			};
			var mousemove = e2 => {
				left = left - (oldX - e2.pageX);
				top = top - (oldY - e2.pageY);
				oldX = e2.pageX;
				oldY = e2.pageY;
				colorPicker.style.setProperty("left", left + "px", "important");
				colorPicker.style.setProperty("top", top + "px", "important");
				updateRects();
			};
			document.addEventListener("mouseup", mouseup);
			document.addEventListener("mousemove", mousemove);
		});
		satpane.addEventListener("mousedown", e => {
			s = BDFDB.NumberUtils.mapRange([sMinX, sMaxX], [0, 100], e.clientX) + "%";
			l = BDFDB.NumberUtils.mapRange([sMinY, sMaxY], [100, 0], e.clientY) + "%";
			updateColors(true);
			var mouseup = _ => {
				document.removeEventListener("mouseup", mouseup);
				document.removeEventListener("mousemove", mousemove);
			};
			var mousemove = e2 => {
				s = BDFDB.NumberUtils.mapRange([sMinX, sMaxX], [0, 100], e2.clientX) + "%";
				l = BDFDB.NumberUtils.mapRange([sMinY, sMaxY], [100, 0], e2.clientY) + "%";
				updateColors(true);
			};
			document.addEventListener("mouseup", mouseup);
			document.addEventListener("mousemove", mousemove);
		});
		huepane.addEventListener("mousedown", e => {
			h = BDFDB.NumberUtils.mapRange([hMinX, hMaxX], [0, 360], e.clientX);
			updateColors(true);
			var mouseup = _ => {
				document.removeEventListener("mouseup", mouseup);
				document.removeEventListener("mousemove", mousemove);
			};
			var mousemove = e2 => {
				h = BDFDB.NumberUtils.mapRange([hMinX, hMaxX], [0, 360], e2.clientX);
				updateColors(true);
			};
			document.addEventListener("mouseup", mouseup);
			document.addEventListener("mousemove", mousemove);
		});
		alphapane.addEventListener("mousedown", e => {
			a = BDFDB.NumberUtils.mapRange([aMinX, aMaxX], [0, 1], e.clientX);
			updateColors(true);
			var bubble = BDFDB.DOMUtils.create(`<span class="${BDFDB.disCN.sliderbubble}" style="opacity: 1 !important; left: -24px !important;"></span>`);
			var mouseup = _ => {
				bubble.remove();
				document.removeEventListener("mouseup", mouseup);
				document.removeEventListener("mousemove", mousemove);
			};
			var mousemove = e2 => {
				if (!bubble.parentElement) alphacursor.appendChild(bubble);
				a = Math.floor(BDFDB.NumberUtils.mapRange([aMinX, aMaxX], [0, 100], e2.clientX))/100;
				bubble.innerText = a;
				updateColors(true);
			};
			document.addEventListener("mouseup", mouseup);
			document.addEventListener("mousemove", mousemove);
		});
		gradientpane.addEventListener("mousedown", e => {
			BDFDB.TimeUtils.timeout(_ => {
				if (BDFDB.DOMUtils.containsClass(e.target.parentElement, "gradient-cursor")) {
					if (e.which == 1) {
						if (!BDFDB.DOMUtils.containsClass(e.target.parentElement, "selected")) {
							BDFDB.DOMUtils.removeClass(gradientpane.querySelectorAll(".gradient-cursor.selected"), "selected");
							BDFDB.DOMUtils.addClass(e.target.parentElement, "selected");
							[h, s, l] = BDFDB.ColorUtils.convert(e.target.style.getPropertyValue("background-color"), "HSLCOMP");
							a = BDFDB.ColorUtils.getAlpha(e.target.style.getPropertyValue("background-color"));
							updateColors(true);
						}
						if (!BDFDB.DOMUtils.containsClass(e.target.parentElement, "edge")) {
							var mouseup = _ => {
								document.removeEventListener("mouseup", mouseup);
								document.removeEventListener("mousemove", mousemove);
							};
							var mousemove = e2 => {
								e.target.parentElement.style.setProperty("left", BDFDB.NumberUtils.mapRange([gMinX, gMaxX], [1, 99], e2.clientX) + "%");
								updateGradient();
							};
							document.addEventListener("mouseup", mouseup);
							document.addEventListener("mousemove", mousemove);
						}
					}
					else if (e.which == 3 && !BDFDB.DOMUtils.containsClass(e.target.parentElement, "edge")) {
						BDFDB.DOMUtils.remove(e.target.parentElement);
						if (BDFDB.DOMUtils.containsClass(e.target.parentElement, "selected")) {
							var firstcursor = gradientpane.querySelector(".gradient-cursor");
							BDFDB.DOMUtils.addClass(firstcursor, "selected");
							[h, s, l] = BDFDB.ColorUtils.convert(firstcursor.firstElementChild.style.getPropertyValue("background-color"), "HSLCOMP");
							a = BDFDB.ColorUtils.getAlpha(firstElementChild.style.getPropertyValue("background-color"));
						}
						updateColors(true);
					}
				}
				else if (gradientpane == e.target && e.which == 1) {
					BDFDB.DOMUtils.removeClass(gradientpane.querySelectorAll(".gradient-cursor.selected"), "selected");
					var newcursor = BDFDB.DOMUtils.create(`<div class="gradient-cursor selected" style="position: absolute; left: ${BDFDB.NumberUtils.mapRange([gMinX, gMaxX], [1, 99], e.clientX)}%;"><div style="background-color: rgba(0, 0, 0, 1) !important;"></div></div>`);
					gradientpane.appendChild(newcursor);
					[h, s, l] = [0, "0%", "0%"];
					a = 1;
					updateColors(true);
					var mouseup = _ => {
						document.removeEventListener("mouseup", mouseup);
						document.removeEventListener("mousemove", mousemove);
					};
					var mousemove = e2 => {
						newcursor.style.setProperty("left", BDFDB.NumberUtils.mapRange([gMinX, gMaxX], [1, 99], e2.clientX) + "%");
						updateGradient();
					};
					document.addEventListener("mouseup", mouseup);
					document.addEventListener("mousemove", mousemove);
				}
			});
		});
		hexinput.addEventListener("input", e => {
			if (hexregex.test(hexinput.value)) {
				[h, s, l, a] = BDFDB.ColorUtils.convert(hexinput.value, "HSLCOMP");
				if (a == null) a = 1;
				updateColors(false);
			}
		});
		gradientbutton.addEventListener("click", e => {
			isgradient = !isgradient;
			BDFDB.DOMUtils.toggle(gradientbar, isgradient);
			BDFDB.DOMUtils.toggleClass(gradientbutton, "selected", isgradient);
			updateColors(true);
		});
		gradientbutton.addEventListener("mouseenter", e => {
			BDFDB.TooltipUtils.create(gradientbutton, "Color Gradient", {type: "bottom"});
		});
		function updateRects () {
			var satpanerects = BDFDB.DOMUtils.getRects(satpane);
			sMinX = satpanerects.left;
			sMaxX = sMinX + satpanerects.width;
			sMinY = satpanerects.top;
			sMaxY = sMinY + satpanerects.height;
			var huepanerects = BDFDB.DOMUtils.getRects(huepane);
			hMinX = huepanerects.left;
			hMaxX = hMinX + huepanerects.width;
			var alphapanerects = BDFDB.DOMUtils.getRects(alphapane);
			aMinX = alphapanerects.left;
			aMaxX = aMinX + alphapanerects.width;
			var gradientpanerects = BDFDB.DOMUtils.getRects(gradientpane);
			gMinX = gradientpanerects.left;
			gMaxX = gMinX + gradientpanerects.width;
		}
		function updateColors (setinput) {
			satpane.style.setProperty("background", BDFDB.ColorUtils.convert([h, "100%", "100%"], "RGB"), "important");
			satcursor.style.setProperty("left", s, "important");
			satcursor.style.setProperty("top", BDFDB.NumberUtils.mapRange([0, 100], [100, 0], parseFloat(l)) + "%", "important");
			huecursor.style.setProperty("left", BDFDB.NumberUtils.mapRange([0, 360], [0, 100], h) + "%", "important");
			alphapane.style.setProperty("background", `linear-gradient(to right, ${BDFDB.ColorUtils.setAlpha([h, s, l], 0, "RGBA")}, ${BDFDB.ColorUtils.setAlpha([h, s, l], 1, "RGBA")}`, "important");
			alphacursor.style.setProperty("left", (a * 100) + "%", "important");
			var hex = BDFDB.ColorUtils.convert([h, s, l, a], hexformat);
			var rgb = BDFDB.ColorUtils.convert(hex, "RGBA");
			if (isreact) {
				if (isgradient) {
					gradientpane.querySelector(".gradient-cursor.selected").firstElementChild.style.setProperty("background-color", rgb);
					updateGradient();
				}
				else {
					container.setState({
						selectedColor: rgb,
						customColor: rgb
					});
					if (container.refInput) {
						container.refInput.props.value = !rgb ? "" : (container.state.compMode ? BDFDB.ColorUtils.convert(rgb, "RGBCOMP").slice(0,3).join(",") : rgb);
						BDFDB.ReactUtils.forceUpdate(container.refInput);
					}
				}
			}
			else if (isswatches) {
				setSwatch(container.querySelector(BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatchselected), null, false);
				if (isgradient) {
					gradientpane.querySelector(".gradient-cursor.selected").firstElementChild.style.setProperty("background-color", rgb);
					updateGradient();
				}
				else setSwatch(container.querySelector(BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatch), rgb, true);
			}
			if (setinput) hexinput.value = hex;
			options.callback(rgb);
		}
		function updateGradient () {
			gradientpane.style.removeProperty("background-color");
			var gradient = {};
			for (let cursor of gradientpane.querySelectorAll(".gradient-cursor")) gradient[parseFloat(cursor.style.getPropertyValue("left"))/100] = cursor.firstElementChild.style.getPropertyValue("background-color");
			gradientpane.style.setProperty("background-image", BDFDB.ColorUtils.createGradient(gradient));
			if (isreact) container.setState({
				selectedColor: gradient,
				customColor: gradient
			});
			else setSwatch(container.querySelector(BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatch), gradient, true);
		}
	};

	BDFDB.DOMUtils = {};
	BDFDB.DOMUtils.addClass = function (eles, ...classes) {
		if (!eles || !classes) return;
		for (let ele of BDFDB.ArrayUtils.is(eles) ? eles : Array.of(eles)) {
			if (!ele) {}
			else if (Node.prototype.isPrototypeOf(ele)) add(ele);
			else if (NodeList.prototype.isPrototypeOf(ele)) for (let e of ele) add(e);
			else if (typeof ele == "string") for (let e of ele.split(",")) if (e && (e = e.trim())) for (let n of document.querySelectorAll(e)) add(n);
		}
		function add(node) {
			if (node && node.classList) for (let cla of classes) for (let cl of BDFDB.ArrayUtils.is(cla) ? cla : Array.of(cla)) if (typeof cl == "string") for (let c of cl.split(" ")) if (c) node.classList.add(c);
		}
	};
	BDFDB.DOMUtils.removeClass = function (eles, ...classes) {
		if (!eles || !classes) return;
		for (let ele of BDFDB.ArrayUtils.is(eles) ? eles : Array.of(eles)) {
			if (!ele) {}
			else if (Node.prototype.isPrototypeOf(ele)) remove(ele);
			else if (NodeList.prototype.isPrototypeOf(ele)) for (let e of ele) remove(e);
			else if (typeof ele == "string") for (let e of ele.split(",")) if (e && (e = e.trim())) for (let n of document.querySelectorAll(e)) remove(n);
		}
		function remove(node) {
			if (node && node.classList) for (let cla of classes) for (let cl of BDFDB.ArrayUtils.is(cla) ? cla : Array.of(cla)) if (typeof cl == "string") for (let c of cl.split(" ")) if (c) node.classList.remove(c);
		}
	};
	BDFDB.DOMUtils.toggleClass = function (eles, ...classes) {
		if (!eles || !classes) return;
		var force = classes.pop();
		if (typeof force != "boolean") {
			classes.push(force);
			force = undefined;
		}
		if (!classes.length) return;
		for (let ele of BDFDB.ArrayUtils.is(eles) ? eles : Array.of(eles)) {
			if (!ele) {}
			else if (Node.prototype.isPrototypeOf(ele)) toggle(ele);
			else if (NodeList.prototype.isPrototypeOf(ele)) for (let e of ele) toggle(e);
			else if (typeof ele == "string") for (let e of ele.split(",")) if (e && (e = e.trim())) for (let n of document.querySelectorAll(e)) toggle(n);
		}
		function toggle(node) {
			if (node && node.classList) for (let cla of classes) for (let cl of BDFDB.ArrayUtils.is(cla) ? cla : Array.of(cla)) if (typeof cl == "string") for (let c of cl.split(" ")) if (c) node.classList.toggle(c, force);
		}
	};
	BDFDB.DOMUtils.containsClass = function (eles, ...classes) {
		if (!eles || !classes) return;
		var all = classes.pop();
		if (typeof all != "boolean") {
			classes.push(all);
			all = true;
		}
		if (!classes.length) return;
		var contained = undefined;
		for (let ele of BDFDB.ArrayUtils.is(eles) ? eles : Array.of(eles)) {
			if (!ele) {}
			else if (Node.prototype.isPrototypeOf(ele)) contains(ele);
			else if (NodeList.prototype.isPrototypeOf(ele)) for (let e of ele) contains(e);
			else if (typeof ele == "string") for (let c of ele.split(",")) if (c && (c = c.trim())) for (let n of document.querySelectorAll(c)) contains(n);
		}
		return contained;
		function contains(node) {
			if (node && node.classList) for (let cla of classes) if (typeof cla == "string") for (let c of cla.split(" ")) if (c) {
				if (contained === undefined) contained = all;
				if (all && !node.classList.contains(c)) contained = false;
				if (!all && node.classList.contains(c)) contained = true;
			}
		}
	};
	BDFDB.DOMUtils.replaceClass = function (eles, oldclass, newclass) {
		if (!eles || typeof oldclass != "string" || typeof newclass != "string") return;
		for (let ele of BDFDB.ArrayUtils.is(eles) ? eles : Array.of(eles)) {
			if (!ele) {}
			else if (Node.prototype.isPrototypeOf(ele)) replace(ele);
			else if (NodeList.prototype.isPrototypeOf(ele)) for (let e of ele) replace(e);
			else if (typeof ele == "string") for (let e of ele.split(",")) if (e && (e = e.trim())) for (let n of document.querySelectorAll(e)) replace(n);
		}
		function replace(node) {
			if (node && node.tagName && node.className) node.className = node.className.replace(new RegExp(oldclass, "g"), newclass).trim();
		}
	};
	BDFDB.DOMUtils.formatClassName = function (...classes) {
		return BDFDB.ArrayUtils.removeCopies(classes.flat().filter(n => n).join(" ").split(" ")).join(" ").trim();
	};
	BDFDB.DOMUtils.removeClassFromDOM = function (...classes) {
		for (let c of classes.flat()) if (typeof c == "string") for (let a of c.split(",")) if (a && (a = a.replace(/\.|\s/g, ""))) BDFDB.DOMUtils.removeClass(document.querySelectorAll("." + a), a);
	};
	BDFDB.DOMUtils.show = function (...eles) {
		BDFDB.DOMUtils.toggle(...eles, true);
	};
	BDFDB.DOMUtils.hide = function (...eles) {
		BDFDB.DOMUtils.toggle(...eles, false);
	};
	BDFDB.DOMUtils.toggle = function (...eles) {
		if (!eles) return;
		var force = eles.pop();
		if (typeof force != "boolean") {
			eles.push(force);
			force = undefined;
		}
		if (!eles.length) return;
		for (let ele of eles.flat()) {
			if (Node.prototype.isPrototypeOf(ele)) toggle(ele);
			else if (NodeList.prototype.isPrototypeOf(ele)) for (let node of ele) toggle(node);
			else if (typeof ele == "string") for (let c of ele.split(",")) if (c && (c = c.trim())) for (let node of document.querySelectorAll(c)) toggle(node);
		}
		function toggle(node) {
			if (!node || !Node.prototype.isPrototypeOf(node)) return;
			var hidden = force === undefined ? !BDFDB.DOMUtils.isHidden(node) : !force;
			if (hidden) node.style.setProperty("display", "none", "important");
			else node.style.removeProperty("display");
		}
	};
	BDFDB.DOMUtils.isHidden = function (node) {
		if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) return getComputedStyle(node, null).getPropertyValue("display") == "none";
	};
	BDFDB.DOMUtils.remove = function (...eles) {
		for (let ele of eles.flat()) {
			if (Node.prototype.isPrototypeOf(ele)) ele.remove();
			else if (NodeList.prototype.isPrototypeOf(ele)) {
				let nodes = Array.from(ele);
				while (nodes.length) nodes.shift().remove();
			}
			else if (typeof ele == "string") for (let c of ele.split(",")) if (c && (c = c.trim())) {
				let nodes = Array.from(document.querySelectorAll(c));
				while (nodes.length) nodes.shift().remove();
			}
		}
	};
	BDFDB.DOMUtils.create = function (html) {
		if (typeof html != "string" || !html.trim()) return null;
		let template = document.createElement("template");
		try {template.innerHTML = html.replace(/(?<!pre)>[\t\r\n]+<(?!pre)/g, "><");}
		catch (err) {template.innerHTML = html.replace(/>[\t\r\n]+<(?!pre)/g, "><");}
		if (template.content.childNodes.length == 1) return template.content.firstElementChild;
		else {
			var wrapper = document.createElement("span");
			var nodes = Array.from(template.content.childNodes);
			while (nodes.length) wrapper.appendChild(nodes.shift());
			return wrapper;
		}
	};
	BDFDB.DOMUtils.getParent = function (listOrSelector, node) {
		var parent = null;
		if (Node.prototype.isPrototypeOf(node) && listOrSelector) {
			var list = NodeList.prototype.isPrototypeOf(listOrSelector) ? listOrSelector : typeof listOrSelector == "string" ? document.querySelectorAll(listOrSelector) : null;
			if (list) for (let listnode of list) if (listnode.contains(node)) {
				parent = listnode;
				break;
			}
		}
		return parent;
	};
	BDFDB.DOMUtils.setText = function (node, stringOrNode) {
		if (!node || !Node.prototype.isPrototypeOf(node)) return;
		var textnode = node.nodeType == Node.TEXT_NODE ? node : null;
		if (!textnode) for (let child of node.childNodes) if (child.nodeType == Node.TEXT_NODE || BDFDB.DOMUtils.containsClass(child, "BDFDB-textnode")) {
			textnode = child;
			break;
		}
		if (textnode) {
			if (Node.prototype.isPrototypeOf(stringOrNode) && stringOrNode.nodeType != Node.TEXT_NODE) {
				BDFDB.DOMUtils.addClass(stringOrNode, "BDFDB-textnode");
				node.replaceChild(stringOrNode, textnode);
			}
			else if (Node.prototype.isPrototypeOf(textnode) && textnode.nodeType != Node.TEXT_NODE) node.replaceChild(document.createTextNode(stringOrNode), textnode);
			else textnode.textContent = stringOrNode;
		}
		else node.appendChild(Node.prototype.isPrototypeOf(stringOrNode) ? stringOrNode : document.createTextNode(stringOrNode));
	};
	BDFDB.DOMUtils.getText = function (node) {
		if (!node || !Node.prototype.isPrototypeOf(node)) return;
		for (let child of node.childNodes) if (child.nodeType == Node.TEXT_NODE) return child.textContent;
	};
	BDFDB.DOMUtils.getRects = function (node) {
		var rects = {};
		if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) {
			var hidenode = node;
			while (hidenode) {
				var hidden = BDFDB.DOMUtils.isHidden(hidenode);
				if (hidden) {
					BDFDB.DOMUtils.toggle(hidenode, true);
					hidenode.BDFDBgetRectsHidden = true;
				}
				hidenode = hidenode.parentElement;
			}
			rects = node.getBoundingClientRect();
			hidenode = node;
			while (hidenode) {
				if (hidenode.BDFDBgetRectsHidden) {
					BDFDB.DOMUtils.toggle(hidenode, false);
					delete hidenode.BDFDBgetRectsHidden;
				}
				hidenode = hidenode.parentElement;
			}
		}
		return rects;
	};
	BDFDB.DOMUtils.getHeight = function (node) {
		if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) {
			var rects = BDFDB.DOMUtils.getRects(node);
			var style = getComputedStyle(node);
			return rects.height + parseInt(style.marginTop) + parseInt(style.marginBottom);
		}
		return 0;
	};
	BDFDB.DOMUtils.getWidth = function (node) {
		if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) {
			var rects = BDFDB.DOMUtils.getRects(node);
			var style = getComputedStyle(node);
			return rects.width + parseInt(style.marginLeft) + parseInt(style.marginRight);
		}
		return 0;
	};
	BDFDB.DOMUtils.appendWebScript = function (path, container) {
		if (!container && !document.head.querySelector("bd-head bd-scripts")) document.head.appendChild(BDFDB.DOMUtils.create(`<bd-head><bd-scripts></bd-scripts></bd-head>`));
		container = container || document.head.querySelector("bd-head bd-scripts") || document.head;
		container = Node.prototype.isPrototypeOf(container) ? container : document.head;
		BDFDB.DOMUtils.removeWebScript(path, container);
		container.appendChild(BDFDB.DOMUtils.create(`<script src="${path}"></script>`));
	};
	BDFDB.DOMUtils.removeWebScript = function (path, container) {
		container = container || document.head.querySelector("bd-head bd-scripts") || document.head;
		container = Node.prototype.isPrototypeOf(container) ? container : document.head;
		BDFDB.DOMUtils.remove(container.querySelectorAll(`script[src="${path}"]`));
	};
	BDFDB.DOMUtils.appendWebStyle = function (path, container) {
		if (!container && !document.head.querySelector("bd-head bd-styles")) document.head.appendChild(BDFDB.DOMUtils.create(`<bd-head><bd-styles></bd-styles></bd-head>`));
		container = container || document.head.querySelector("bd-head bd-styles") || document.head;
		container = Node.prototype.isPrototypeOf(container) ? container : document.head;
		BDFDB.DOMUtils.removeWebStyle(path, container);
		container.appendChild(BDFDB.DOMUtils.create(`<link type="text/css" rel="Stylesheet" href="${path}"></link>`));
	};
	BDFDB.DOMUtils.removeWebStyle = function (path, container) {
		container = container || document.head.querySelector("bd-head bd-styles") || document.head;
		container = Node.prototype.isPrototypeOf(container) ? container : document.head;
		BDFDB.DOMUtils.remove(container.querySelectorAll(`link[href="${path}"]`));
	};
	BDFDB.DOMUtils.appendLocalStyle = function (id, css, container) {
		if (!container && !document.head.querySelector("bd-head bd-styles")) document.head.appendChild(BDFDB.DOMUtils.create(`<bd-head><bd-styles></bd-styles></bd-head>`));
		container = container || document.head.querySelector("bd-head bd-styles") || document.head;
		container = Node.prototype.isPrototypeOf(container) ? container : document.head;
		BDFDB.DOMUtils.removeLocalStyle(id, container);
		container.appendChild(BDFDB.DOMUtils.create(`<style id="${id}CSS">${css.replace(/\t|\r|\n/g,"")}</style>`));
	};
	BDFDB.DOMUtils.removeLocalStyle = function (id, container) {
		container = container || document.head.querySelector("bd-head bd-styles") || document.head;
		container = Node.prototype.isPrototypeOf(container) ? container : document.head;
		BDFDB.DOMUtils.remove(container.querySelectorAll(`style[id="${id}CSS"]`));
	};

	BDFDB.triggerSend = function (textarea) {
		if (!textarea) return;
		BDFDB.TimeUtils.timeout(_ => {
			var e = new KeyboardEvent("keypress", {key:"Enter", code:"Enter", which:13, keyCode:13, bubbles:true });
			Object.defineProperty(e, "keyCode", {value:13});
			Object.defineProperty(e, "which", {value:13});
			textarea.dispatchEvent(e);
		});
	};

	BDFDB.initElements = function (container, plugin) {
		if (!Node.prototype.isPrototypeOf(container)) return;
		var islighttheme = BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themelight;
		container.querySelectorAll(".BDFDB-containertext").forEach(ele => {
			if (BDFDB.DOMUtils.containsClass(ele.nextElementSibling, "BDFDB-collapsecontainer")) {
				if (BDFDB.DOMUtils.containsClass(ele.firstElementChild, "closed")) BDFDB.DOMUtils.toggle(ele.nextElementSibling, false);
				ele.BDFDBupdateElement = _ => {
					BDFDB.DOMUtils.toggle(ele.nextElementSibling, BDFDB.DOMUtils.containsClass(ele.firstElementChild, "closed"));
					BDFDB.DOMUtils.toggleClass(ele.firstElementChild, "closed");
				};
				addInitEventListener(ele, "click", ele.BDFDBupdateElement);
			}
		});
		container.querySelectorAll(BDFDB.dotCN.switchinner).forEach(ele => {
			setSwitch(ele, false);
			ele.BDFDBupdateElement = _ => {
				setSwitch(ele, true);
			};
			addInitEventListener(ele, "click", ele.BDFDBupdateElement);
		});
		container.querySelectorAll(BDFDB.dotCNS.checkboxwrapper + BDFDB.dotCN.checkboxinput).forEach(ele => {
			setCheckbox(ele);
			ele.BDFDBupdateElement = _ => {
				setCheckbox(ele);
			};
			addInitEventListener(ele, "click", ele.BDFDBupdateElement);
		});
		container.querySelectorAll(BDFDB.dotCN.giffavoritebutton).forEach(ele => {
			setGifFavButton(ele);
			ele.BDFDBupdateElement = _ => {
				BDFDB.DOMUtils.toggleClass(ele, BDFDB.disCN.giffavoriteselected);
				setGifFavButton(ele);
			};
			addInitEventListener(ele, "click", ele.BDFDBupdateElement);
			var id = "FAV_s" + Math.round(Math.random() * 10000000000000000);
			addInitEventListener(ele, "mouseenter", _ => {
				BDFDB.DOMUtils.remove(`#${id}_tooltip`);
				BDFDB.TooltipUtils.create(ele, BDFDB.LanguageUtils.LanguageStrings[`GIF_TOOLTIP_${BDFDB.DOMUtils.containsClass(ele, BDFDB.disCN.giffavoriteselected) ? "REMOVE_FROM" : "ADD_TO"}_FAVORITES`], {type:"top", id:id+"_tooltip"});
			});
		});
		container.querySelectorAll(".file-navigator").forEach(ele => {
			ele.BDFDBupdateElement = _ => {
				var input = ele.querySelector(`input[type="file"]`);
				if (input) input.click();
			};
			addInitEventListener(ele, "click", ele.BDFDBupdateElement);
		});
		container.querySelectorAll(`input[type="file"]`).forEach(ele => {
			addInitEventListener(ele, "change", e => {
				var input = ele.parentElement.parentElement.querySelector(`input[type="text"]`);
				var file = ele.files[0];
				if (input && file) input.value = file.path;
			});
		});
		container.querySelectorAll(BDFDB.dotCN.input).forEach(ele => {
			addInitEventListener(ele, "keydown", e => {
				e.stopPropagation();
			});
		});
		container.querySelectorAll(BDFDB.dotCNS.searchbar + BDFDB.dotCN.searchbarinput).forEach(ele => {
			ele.setAttribute("placeholder", BDFDB.LanguageUtils.LanguageStrings.SEARCHING);
			addInitEventListener(ele, "keyup", e => {
				let icons = ele.parentElement.querySelectorAll(BDFDB.dotCN.searchbaricon);
				BDFDB.DOMUtils.toggleClass(icons[0], BDFDB.disCN.searchbarvisible, ele.value.length == 0);
				BDFDB.DOMUtils.toggleClass(icons[1], BDFDB.disCN.searchbarvisible, ele.value.length);
			});
		});
		container.querySelectorAll(BDFDB.dotCNS.searchbar + BDFDB.dotCN.searchbarclear).forEach(ele => {
			addInitEventListener(ele, "click", e => {
				if (BDFDB.DOMUtils.containsClass(ele, BDFDB.disCN.searchbarvisible)) {
					var input = BDFDB.DOMUtils.getParent(BDFDB.dotCN.searchbar, ele).querySelector(BDFDB.dotCN.searchbarinput);
					input.value = "";
					input.dispatchEvent(new Event("change"));
					input.dispatchEvent(new Event("input"));
					input.dispatchEvent(new Event("keydown"));
					input.dispatchEvent(new Event("keyup"));
					input.dispatchEvent(new Event("keypressed"));
					BDFDB.DOMUtils.addClass(ele.parentElement.querySelectorAll(BDFDB.dotCN.searchbaricon)[0], BDFDB.disCN.searchbarvisible);
					BDFDB.DOMUtils.removeClass(ele, BDFDB.disCN.searchbarvisible);
				}
			});
		});
		container.querySelectorAll(".numberinput-button-up").forEach(ele => {
			addInitEventListener(ele, "click", e => {
				var input = ele.parentElement.parentElement.querySelector("input");
				var min = parseInt(input.getAttribute("min"));
				var max = parseInt(input.getAttribute("max"));
				var newv = parseInt(input.value) + 1;
				if (isNaN(max) || !isNaN(max) && newv <= max) {
					BDFDB.DOMUtils.addClass(ele.parentElement, "pressed");
					BDFDB.TimeUtils.clear(ele.parentElement.pressedTimeout);
					input.value = isNaN(min) || !isNaN(min) && newv >= min ? newv : min;
					input.dispatchEvent(new Event("change"));
					input.dispatchEvent(new Event("input"));
					input.dispatchEvent(new Event("keydown"));
					input.dispatchEvent(new Event("keyup"));
					input.dispatchEvent(new Event("keypressed"));
					ele.parentElement.pressedTimeout = BDFDB.TimeUtils.timeout(_ => {BDFDB.DOMUtils.removeClass(ele.parentElement, "pressed");}, 3000);
				}
			});
		});
		container.querySelectorAll(".numberinput-button-down").forEach(ele => {
			addInitEventListener(ele, "click", e => {
				var input = ele.parentElement.parentElement.querySelector("input");
				var min = parseInt(input.getAttribute("min"));
				var max = parseInt(input.getAttribute("max"));
				var newv = parseInt(input.value) - 1;
				if (isNaN(min) || !isNaN(min) && newv >= min) {
					BDFDB.DOMUtils.addClass(ele.parentElement, "pressed");
					BDFDB.TimeUtils.clear(ele.parentElement.pressedTimeout);
					input.value = isNaN(max) || !isNaN(max) && newv <= max ? newv : max;
					input.dispatchEvent(new Event("change"));
					input.dispatchEvent(new Event("input"));
					input.dispatchEvent(new Event("keydown"));
					input.dispatchEvent(new Event("keyup"));
					input.dispatchEvent(new Event("keypressed"));
					ele.parentElement.pressedTimeout = BDFDB.TimeUtils.timeout(_ => {BDFDB.DOMUtils.removeClass(ele.parentElement, "pressed");}, 3000);
				}
			});
		});
		container.querySelectorAll(".amount-input").forEach(ele => {
			addInitEventListener(ele, "input", e => {
				if (BDFDB.ObjectUtils.is(plugin)) {
					var option = ele.getAttribute("option");
					var newv = parseInt(ele.value);
					var min = parseInt(ele.getAttribute("min"));
					var max = parseInt(ele.getAttribute("max"));
					if (option && !isNaN(newv) && (isNaN(min) || !isNaN(min) && newv >= min) && (isNaN(max) || !isNaN(max) && newv <= max)) {
						BDFDB.DataUtils.save(newv, plugin, "amounts", option);
						plugin.SettingsUpdated = true;
					}
				}
			});
		});
		container.querySelectorAll(BDFDB.dotCNC.tabbaritem + BDFDB.dotCN.tabbarheaderitem).forEach(ele => {
			setTabitem(ele, ele.parentElement.querySelector(BDFDB.dotCNC.tabbaritem + BDFDB.dotCN.tabbarheaderitem) == ele ? 2 : 0);
			addInitEventListener(ele, "click", e => {
				BDFDB.DOMUtils.removeClass(container.querySelectorAll(BDFDB.dotCN.modaltabcontent + BDFDB.dotCN.modaltabcontentopen), BDFDB.disCN.modaltabcontentopen);
				ele.parentElement.querySelectorAll(BDFDB.dotCNC.tabbaritem + BDFDB.dotCN.tabbarheaderitem).forEach(ele => {setTabitem(ele, 0);});
				var tab = container.querySelector(`${BDFDB.dotCN.modaltabcontent}[tab="${ele.getAttribute("tab")}"]`);
				if (tab) BDFDB.DOMUtils.addClass(tab, BDFDB.disCN.modaltabcontentopen);
				setTabitem(ele, 2);
			});
			addInitEventListener(ele, "mouseenter", e => {
				if (!BDFDB.DOMUtils.containsClass(ele, BDFDB.disCN.settingsitemselected)) setTabitem(ele, 1);
			});
			addInitEventListener(ele, "mouseleave", e => {
				if (!BDFDB.DOMUtils.containsClass(ele, BDFDB.disCN.settingsitemselected)) setTabitem(ele, 0);
			});
		});
		container.querySelectorAll(".BDFDB-textscrollwrapper").forEach(ele => {
			var inner = ele.querySelector(".BDFDB-textscroll");
			if (inner) {
				if (BDFDB.DOMUtils.containsClass(ele.parentElement, BDFDB.disCN.contextmenuitemsubmenu)) ele.style.setProperty("margin-right", "10px");
				if (BDFDB.DOMUtils.getRects(ele).width > 100) ele.style.setProperty("text-overflow", "ellipsis", "important");
				ele.style.setProperty("position", "relative", "important");
				ele.style.setProperty("display", "block", "important");
				ele.style.setProperty("overflow", "hidden", "important");
				inner.style.setProperty("left", "0px", "important");
				inner.style.setProperty("position", "relative", "important");
				inner.style.setProperty("white-space", "nowrap", "important");
				inner.style.setProperty("display", "inline", "important");
				var animate, Animation;
				addInitEventListener(ele, "mouseenter", e => {
					if (BDFDB.DOMUtils.getRects(ele).width < BDFDB.DOMUtils.getRects(inner).width) {
						BDFDB.DOMUtils.addClass(ele, "scrolling");
						if (!Animation || !animate) initAnimation();
						animate(1);
						inner.style.setProperty("display", "block", "important");
					}
				});
				addInitEventListener(ele, "mouseleave", e => {
					if (BDFDB.DOMUtils.containsClass(ele, "scrolling")) {
						BDFDB.DOMUtils.removeClass(ele, "scrolling");
						inner.style.setProperty("display", "inline", "important");
						if (!Animation || !animate) initAnimation();
						animate(0);
					}
				});
				function initAnimation() {
					Animation = new LibraryModules.AnimationUtils.Value(0);
					Animation
						.interpolate({inputRange:[0, 1], outputRange:[0, (BDFDB.DOMUtils.getRects(inner).width - BDFDB.DOMUtils.getRects(ele).width) * -1]})
						.addListener(v => {inner.style.setProperty("left", v.value + "px", "important");});
					animate = p => {
						var w = p + parseFloat(inner.style.getPropertyValue("left")) / (BDFDB.DOMUtils.getRects(inner).width - BDFDB.DOMUtils.getRects(ele).width);
						w = isNaN(w) || !isFinite(w) ? p : w;
						w *= BDFDB.DOMUtils.getRects(inner).width / (BDFDB.DOMUtils.getRects(ele).width * 2);
						LibraryModules.AnimationUtils.parallel([LibraryModules.AnimationUtils.timing(Animation, {toValue:p, duration:Math.sqrt(w**2) * 4000 / (ele.getAttribute("speed") || 1)})]).start();
					};
				}
			}
		});

		BDFDB.DOMUtils.removeClass(container.querySelectorAll(BDFDB.dotCN.modaltabcontent), BDFDB.disCN.modaltabcontentopen);
		BDFDB.DOMUtils.addClass(container.querySelector(BDFDB.dotCN.modaltabcontent), BDFDB.disCN.modaltabcontentopen);

		container.querySelectorAll(".btn-add " + BDFDB.dotCN.buttoncontents).forEach(ele => {ele.innerText = BDFDB.LanguageUtils.LanguageStrings.ADD;});
		container.querySelectorAll(".btn-all " + BDFDB.dotCN.buttoncontents).forEach(ele => {ele.innerText = BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL;});
		container.querySelectorAll(".btn-cancel " + BDFDB.dotCN.buttoncontents).forEach(ele => {ele.innerText = BDFDB.LanguageUtils.LanguageStrings.CANCEL;});
		container.querySelectorAll(".btn-done " + BDFDB.dotCN.buttoncontents).forEach(ele => {ele.innerText = BDFDB.LanguageUtils.LanguageStrings.DONE;});
		container.querySelectorAll(".btn-download " + BDFDB.dotCN.buttoncontents).forEach(ele => {ele.innerText = BDFDB.LanguageUtils.LanguageStrings.DOWNLOAD;});
		container.querySelectorAll(".btn-ok " + BDFDB.dotCN.buttoncontents).forEach(ele => {ele.innerText = BDFDB.LanguageUtils.LanguageStrings.OKAY;});
		container.querySelectorAll(".btn-save " + BDFDB.dotCN.buttoncontents).forEach(ele => {ele.innerText = BDFDB.LanguageUtils.LanguageStrings.SAVE;});
		container.querySelectorAll(".btn-send " + BDFDB.dotCN.buttoncontents).forEach(ele => {ele.innerText = BDFDB.LanguageUtils.LanguageStrings.SEND;});
		container.querySelectorAll(".file-navigator " + BDFDB.dotCN.buttoncontents).forEach(ele => {ele.innerText = BDFDB.LanguageUtils.LibraryStrings.file_navigator_text;});

		if (islighttheme) {
			BDFDB.DOMUtils.replaceClass(container.querySelectorAll(BDFDB.dotCN.selectcontroldark), BDFDB.disCN.selectcontroldark, BDFDB.disCN.selectcontrollight);
			BDFDB.DOMUtils.replaceClass(container.querySelectorAll(BDFDB.dotCN.selectsingledark), BDFDB.disCN.selectsingledark, BDFDB.disCN.selectsinglelight);
			BDFDB.DOMUtils.replaceClass(container.querySelectorAll(BDFDB.dotCN.selectarrowcontainerdark), BDFDB.disCN.selectarrowcontainerdark, BDFDB.disCN.selectarrowcontainerlight);
		}
		else {
			BDFDB.DOMUtils.replaceClass(container.querySelectorAll(BDFDB.dotCN.selectcontrollight), BDFDB.disCN.selectcontrollight, BDFDB.disCN.selectcontroldark);
			BDFDB.DOMUtils.replaceClass(container.querySelectorAll(BDFDB.dotCN.selectsinglelight), BDFDB.disCN.selectsinglelight, BDFDB.disCN.selectsingledark);
			BDFDB.DOMUtils.replaceClass(container.querySelectorAll(BDFDB.dotCN.selectarrowcontainerlight), BDFDB.disCN.selectarrowcontainerlight, BDFDB.disCN.selectarrowcontainerdark);
		}

		var executeDelayedIfNotAppened = _ => {
			container.querySelectorAll(".BDFDB-tableheader").forEach(ele => {
				var panel = BDFDB.DOMUtils.getParent(".BDFDB-modal, .BDFDB-settings", ele);
				var tableid = ele.getAttribute("table-id");
				var text = ele.querySelector(".BDFDB-tableheadertext");
				var columns = ele.querySelectorAll(".BDFDB-tableheadercolumns .BDFDB-tableheadercolumn");
				if (panel && tableid && text && columns.length) {
					let toobig = false, maxwidth = BDFDB.ObjectUtils.is(panel["BDFDB-tableheader-maxwidth"]) ? panel["BDFDB-tableheader-maxwidth"][tableid] : 0;
					if (!maxwidth) {
						for (let column of columns) {
							let width = BDFDB.DOMUtils.getRects(column).width;
							maxwidth = width > maxwidth ? width : maxwidth;
						}
						maxwidth += 4;
					}
					if (columns.length * maxwidth > 300) {
						toobig = true;
						maxwidth = parseInt(290 / columns.length);
					}
					else if (maxwidth < 36) {
						maxwidth = 36;
					}
					columns.forEach((column, i) => {
						column.style.setProperty("flex", `0 0 ${maxwidth}px`, "important");
						if (toobig) {
							if (i == 0) column.style.setProperty("margin-left", `${-1 * (10 + maxwidth/2)}px`, "important");
							column.style.setProperty("margin-top", "0", "important");
							column.style.setProperty("text-align", "right", "important");
							column.style.setProperty("writing-mode", "vertical-rl", "important");
						}
						else column.style.setProperty("text-align", "center", "important");
					});
					text.style.setProperty("flex", `0 0 ${556 - (columns.length * maxwidth)}px`, "important");
					columns[0].parentElement.style.setProperty("flex", `0 0 ${columns.length * maxwidth}px`, "important");
					if (!BDFDB.ObjectUtils.is(panel["BDFDB-tableheader-maxwidth"])) panel["BDFDB-tableheader-maxwidth"] = {}
					panel["BDFDB-tableheader-maxwidth"][tableid] = maxwidth;
				}
			});
			container.querySelectorAll(".BDFDB-tablecheckbox").forEach(ele => {
				var panel = BDFDB.DOMUtils.getParent(".BDFDB-modal, .BDFDB-settings", ele);
				var tableid = ele.getAttribute("table-id");
				if (panel && tableid && BDFDB.ObjectUtils.is(panel["BDFDB-tableheader-maxwidth"]) && panel["BDFDB-tableheader-maxwidth"][tableid]) {
					var style = getComputedStyle(ele);
					ele.style.setProperty("flex", `0 0 ${panel["BDFDB-tableheader-maxwidth"][tableid] - parseInt(style.marginLeft) - parseInt(style.marginRight)}px`, "important");
				}
			});
		};

		if (document.contains(container)) executeDelayedIfNotAppened();
		else BDFDB.TimeUtils.timeout(_ => {executeDelayedIfNotAppened();});

		function setSwitch(switchitem, triggered) {
			if (!switchitem) return;
			var checked = switchitem.checked;
			BDFDB.DOMUtils.toggleClass(switchitem.parentElement, BDFDB.disCN.switchvaluechecked, checked);
			BDFDB.DOMUtils.toggleClass(switchitem.parentElement, BDFDB.disCN.switchvalueunchecked, !checked);
			if (triggered && BDFDB.ObjectUtils.is(plugin) && BDFDB.DOMUtils.containsClass(switchitem, "settings-switch")) {
				let keys = switchitem.getAttribute("value").trim().split(" ").filter(n => n);
				let option = keys.shift();
				if (option) {
					var data = BDFDB.DataUtils.load(plugin, option);
					var newdata = "";
					for (let key of keys) newdata += `{"${key}":`;
					newdata += checked + "}".repeat(keys.length);
					newdata = JSON.parse(newdata);
					if (BDFDB.ObjectUtils.is(newdata)) BDFDB.ObjectUtils.deepAssign(data, newdata);
					else data = newdata;
					BDFDB.DataUtils.save(data, plugin, option);
					plugin.SettingsUpdated = true;
				}
			}
		};
		function setCheckbox(checkbox) {
			if (!checkbox) return;
			var checkboxstyle = checkbox.parentElement.querySelector(BDFDB.dotCN.checkbox);
			var checkboxstyleinner = checkboxstyle.querySelector("polyline");
			if (checkbox.checked) {
				BDFDB.DOMUtils.addClass(checkboxstyle, BDFDB.disCN.checkboxchecked);
				checkboxstyle.style.setProperty("background-color", "rgb(67, 181, 129)");
				checkboxstyle.style.setProperty("border-color", "rgb(67, 181, 129)");
				if (checkboxstyleinner) checkboxstyleinner.setAttribute("stroke", "#ffffff");
			}
			else {
				BDFDB.DOMUtils.removeClass(checkboxstyle, BDFDB.disCN.checkboxchecked);
				checkboxstyle.style.removeProperty("background-color");
				checkboxstyle.style.removeProperty("border-color");
				if (checkboxstyleinner) checkboxstyleinner.setAttribute("stroke", "transparent");
			}
		};
		function setGifFavButton(button) {
			var selected = BDFDB.DOMUtils.containsClass(button, BDFDB.disCN.giffavoriteselected);
			var icon = button.querySelector(BDFDB.dotCN.giffavoriteicon);
			if (icon) {
				icon.setAttribute("name", selected ? "FavoriteFilled" : "Favorite");
				icon.innerHTML = selected ? `<path d="M0,0H24V24H0Z" fill="none"></path><path fill="currentColor" d="M12.5,17.6l3.6,2.2a1,1,0,0,0,1.5-1.1l-1-4.1a1,1,0,0,1,.3-1l3.2-2.8A1,1,0,0,0,19.5,9l-4.2-.4a.87.87,0,0,1-.8-.6L12.9,4.1a1.05,1.05,0,0,0-1.9,0l-1.6,4a1,1,0,0,1-.8.6L4.4,9a1.06,1.06,0,0,0-.6,1.8L7,13.6a.91.91,0,0,1,.3,1l-1,4.1a1,1,0,0,0,1.5,1.1l3.6-2.2A1.08,1.08,0,0,1,12.5,17.6Z"></path>` : `<path fill="currentColor" d="M19.6,9l-4.2-0.4c-0.4,0-0.7-0.3-0.8-0.6l-1.6-3.9c-0.3-0.8-1.5-0.8-1.8,0L9.4,8.1C9.3,8.4,9,8.6,8.6,8.7L4.4,9c-0.9,0.1-1.2,1.2-0.6,1.8L7,13.6c0.3,0.2,0.4,0.6,0.3,1l-1,4.1c-0.2,0.9,0.7,1.5,1.5,1.1l3.6-2.2c0.3-0.2,0.7-0.2,1,0l3.6,2.2c0.8,0.5,1.7-0.2,1.5-1.1l-1-4.1c-0.1-0.4,0-0.7,0.3-1l3.2-2.8C20.9,10.2,20.5,9.1,19.6,9zM12,15.4l-3.8,2.3l1-4.3l-3.3-2.9l4.4-0.4l1.7-4l1.7,4l4.4,0.4l-3.3,2.9l1,4.3L12,15.4z"></path>`;
			}
			if (selected) {
				BDFDB.DOMUtils.addClass(button, BDFDB.disCN.giffavoriteshowpulse);
				BDFDB.TimeUtils.timeout(_ => {BDFDB.DOMUtils.removeClass(button, BDFDB.disCN.giffavoriteshowpulse);}, 500);
			}
		};
		function setTabitem(item, state) {
			if (!item) return;
			switch (state) {
				case 0:
					BDFDB.DOMUtils.removeClass(item, BDFDB.disCN.settingsitemselected);
					item.style.setProperty("border-color", "transparent");
					item.style.setProperty("color", islighttheme ? "rgba(79, 84, 92, 0.4)" : "rgba(255, 255, 255, 0.4)");
					break;
				case 1:
					BDFDB.DOMUtils.removeClass(item, BDFDB.disCN.settingsitemselected);
					item.style.setProperty("border-color", islighttheme ? "rgba(79, 84, 92, 0.6)" : "rgba(255, 255, 255, 0.6)");
					item.style.setProperty("color", islighttheme ? "rgba(79, 84, 92, 0.6)" : "rgba(255, 255, 255, 0.6)");
					break;
				case 2:
					BDFDB.DOMUtils.addClass(item, BDFDB.disCN.settingsitemselected);
					item.style.setProperty("border-color", islighttheme ? "rgb(79, 84, 92)" : "rgb(255, 255, 255)");
					item.style.setProperty("color", islighttheme ? "rgb(79, 84, 92)" : "rgb(255, 255, 255)");
					break;
				}
		};
		function addInitEventListener(ele, action, callback) {
			if (!ele.BDFDBupdateElementsListeners) ele.BDFDBupdateElementsListeners = {};
			if (ele.BDFDBupdateElementsListeners[action]) ele.removeEventListener(action, ele.BDFDBupdateElementsListeners[action]);
			ele.BDFDBupdateElementsListeners[action] = callback;
			ele.addEventListener(action, callback, true);
		};
	};

	// REMOVE ONCE REWRITTEN
	BDFDB.appendModal = function (modalwrapper) {
		if (!Node.prototype.isPrototypeOf(modalwrapper)) return;
		if (!BDFDB.appendModal.modals || !document.contains(BDFDB.appendModal.modals)) BDFDB.appendModal.modals = BDFDB.ReactUtils.findDOMNode(BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.app), {name:"Modals", unlimited:true}));
		if (!BDFDB.appendModal.modals) return;

		var modal = BDFDB.DOMUtils.containsClass(modalwrapper, BDFDB.disCN.modal) ? modalwrapper : modalwrapper.querySelector(BDFDB.dotCN.modal);
		var backdrop = modal ? modal.previousElementSibling : null;

		var modalOpacity = new LibraryModules.AnimationUtils.Value(0);
		modalOpacity
			.interpolate({inputRange: [0, 1], outputRange: [0, 1]})
			.addListener((value) => {if (modal) modal.style.setProperty("opacity", `${value.value}`);});
		var modalTransform = new LibraryModules.AnimationUtils.Value(0);
		modalTransform
			.interpolate({inputRange: [0, 1], outputRange: [0.7, 1]})
			.addListener((value) => {if (modal) modal.style.setProperty("transform", `scale(${value.value}) translateZ(0px)`);});
		var backdropOpacity = new LibraryModules.AnimationUtils.Value(0);
		backdropOpacity
			.interpolate({inputRange: [0, 1], outputRange: [0, 0.85]})
			.addListener((value) => {if (backdrop) {
				backdrop.style.setProperty("opacity", `${value.value}`);
				backdrop.style.setProperty("background-color", "rgb(0, 0, 0)");
				backdrop.style.setProperty("z-index", "1000");
				backdrop.style.setProperty("transform", "translateZ(0px)");
			}});

		var animate = (v) => {
			LibraryModules.AnimationUtils.parallel([
				LibraryModules.AnimationUtils.timing(modalOpacity, {toValue: v, duration: 250, easing: LibraryModules.AnimationUtils.Easing.inOut(LibraryModules.AnimationUtils.Easing.ease)}),
				LibraryModules.AnimationUtils.timing(modalTransform, {toValue: v, duration: 250, easing: LibraryModules.AnimationUtils.Easing.inOut(LibraryModules.AnimationUtils.Easing.ease)}),
				LibraryModules.AnimationUtils.timing(backdropOpacity, {toValue: v, duration: 200, delay:50}),
			]).start();
		};

		var keydown = e => {
			if (!document.contains(modalwrapper)) document.removeEventListener("keydown", keydown);
			else if (e.which == 27 && backdrop) backdrop.click();
		};
		document.addEventListener("keydown", keydown);
		BDFDB.ListenerUtils.addToChildren(modalwrapper, "click", BDFDB.dotCNC.backdrop + BDFDB.dotCNC.modalclose + ".btn-close, .btn-save, .btn-send, .btn-cancel, .btn-ok, .btn-done", _ => {
			document.removeEventListener("keydown", keydown);
			animate(0);
			BDFDB.TimeUtils.timeout(_ => {modalwrapper.remove();}, 300);
		});
		BDFDB.appendModal.modals.appendChild(modalwrapper);
		BDFDB.initElements(modalwrapper);
		animate(1);
	};

	BDFDB.createSearchBar = function (size = "small") {
		if (typeof size != "string" || !["small","medium","large"].includes(size.toLowerCase())) size = "small";
		var sizeclass = DiscordClassModules.SearchBar[size] ? (" " + BDFDB.disCN["searchbar" + size]) : "";
		var searchBar = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.searchbar + sizeclass}" style="flex: 1 1 auto;"><div class="${BDFDB.disCN.searchbarinner}"><input class="${BDFDB.disCN.searchbarinput}" type="text" spellcheck="false" placeholder="" value=""><div tabindex="0" class="${BDFDB.disCN.searchbariconlayout + sizeclass}" role="button"><div class="${BDFDB.disCN.searchbariconwrap}"><svg name="Search" class="${BDFDB.disCNS.searchbaricon + BDFDB.disCN.searchbarvisible}" width="18" height="18" viewBox="0 0 18 18"><g fill="none" fill-rule="evenodd"><path fill="currentColor" d="M3.60091481,7.20297313 C3.60091481,5.20983419 5.20983419,3.60091481 7.20297313,3.60091481 C9.19611206,3.60091481 10.8050314,5.20983419 10.8050314,7.20297313 C10.8050314,9.19611206 9.19611206,10.8050314 7.20297313,10.8050314 C5.20983419,10.8050314 3.60091481,9.19611206 3.60091481,7.20297313 Z M12.0057176,10.8050314 L11.3733562,10.8050314 L11.1492281,10.5889079 C11.9336764,9.67638651 12.4059463,8.49170955 12.4059463,7.20297313 C12.4059463,4.32933105 10.0766152,2 7.20297313,2 C4.32933105,2 2,4.32933105 2,7.20297313 C2,10.0766152 4.32933105,12.4059463 7.20297313,12.4059463 C8.49170955,12.4059463 9.67638651,11.9336764 10.5889079,11.1492281 L10.8050314,11.3733562 L10.8050314,12.0057176 L14.8073185,16 L16,14.8073185 L12.2102538,11.0099776 L12.0057176,10.8050314 Z"></path></g></svg><svg name="Clear" class="${BDFDB.disCNS.searchbaricon + BDFDB.disCN.searchbarclear}" width="12" height="12" viewBox="0 0 12 12"><g fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg></div></div></div></div>`);
		BDFDB.initElements(searchBar);
		return searchBar;
	};

	BDFDB.createSelectMenu = function (inner, value, type = "", dark = BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themedark) {
		if (typeof inner != "string" || (typeof value != "string" && typeof value != "number")) return BDFDB.DOMUtils.create(`<div></div>`);
		var suffix = dark ? "dark" : "light";
		return `<div class="${BDFDB.disCN.selectwrap} BDFDB-select" style="flex: 1 1 auto;"><div class="${BDFDB.disCN.select}" type="${type}" value="${value}"><div class="${BDFDB.disCNS.selectcontrol + BDFDB.disCN["selectcontrol" + suffix]}"><div class="${BDFDB.disCN.selectvalue}"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCNS.selectsingle + BDFDB.disCN["selectsingle" + suffix]}">${inner}</div><input readonly="" tabindex="0" class="${BDFDB.disCN.selectdummyinput}" value=""></div><div class="${BDFDB.disCN.selectarrowzone}"><div aria-hidden="true" class="${BDFDB.disCNS.selectarrowcontainer + BDFDB.disCN["selectarrowcontainer" + suffix]}"><svg height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false" class="${BDFDB.disCN.selectarrow}"><path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path></svg></div></div></div></div></div>`;
	};

	BDFDB.openDropdownMenu = function (e, callback, createinner, values, above = false, dark = BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themedark) {
		if (typeof callback != "function" || typeof createinner != "function" || !values || typeof values != "object") return;
		let selectControl = (BDFDB.DOMUtils.getParent(BDFDB.dotCN.selectwrap, e.currentTarget) || e.currentTarget).querySelector(BDFDB.dotCN.selectcontrol);
		let selectWrap = selectControl.parentElement;
		if (BDFDB.DOMUtils.containsClass(selectWrap, BDFDB.disCN.selectisopen)) return;

		BDFDB.DOMUtils.addClass(selectWrap, BDFDB.disCN.selectisopen);

		var type = selectWrap.getAttribute("type");
		var oldchoice = selectWrap.getAttribute("value");
		var suffix = dark ? "dark" : "light";
		var menuhtml = `<div class="${BDFDB.disCNS.selectmenuouter + BDFDB.disCN["selectmenuouter" + suffix]}"><div class="${BDFDB.disCN.selectmenu}">`;
		for (var key in values) menuhtml += `<div value="${key}" class="${BDFDB.disCNS.selectoption + (key == oldchoice ? BDFDB.disCN["selectoptionselect" + suffix] : BDFDB.disCN["selectoption" + suffix])}" style="flex: 1 1 auto; display: flex;">${createinner(key)}</div>`;
		menuhtml += `</div></div>`;
		var selectMenu = BDFDB.DOMUtils.create(menuhtml);
		if (above) {
			BDFDB.DOMUtils.addClass(selectMenu, "above-select");
			selectMenu.style.setProperty("top", "unset", "important");
			selectMenu.style.setProperty("bottom", BDFDB.DOMUtils.getRects(selectWrap).height + "px", "important");
		}
		selectWrap.appendChild(selectMenu);
		BDFDB.initElements(selectMenu);

		BDFDB.ListenerUtils.addToChildren(selectMenu, "mouseenter", BDFDB.dotCN.selectoption + BDFDB.notCN.selectoptionselectlight + BDFDB.notCN.selectoptionselectdark, e2 => {
			if (dark) {
				BDFDB.DOMUtils.removeClass(e2.currentTarget, BDFDB.disCN.selectoptiondark);
				BDFDB.DOMUtils.addClass(e2.currentTarget, BDFDB.disCN.selectoptionhoverdark);
			}
			else {
				BDFDB.DOMUtils.removeClass(e2.currentTarget, BDFDB.disCN.selectoptionlight);
				BDFDB.DOMUtils.addClass(e2.currentTarget, BDFDB.disCN.selectoptionhoverlight);
			}
		});
		BDFDB.ListenerUtils.addToChildren(selectMenu, "mouseleave", BDFDB.dotCN.selectoption + BDFDB.notCN.selectoptionselectlight + BDFDB.notCN.selectoptionselectdark, e2 => {
			if (dark) {
				BDFDB.DOMUtils.removeClass(e2.currentTarget, BDFDB.disCN.selectoptionhoverdark);
				BDFDB.DOMUtils.addClass(e2.currentTarget, BDFDB.disCN.selectoptiondark);
			}
			else {
				BDFDB.DOMUtils.removeClass(e2.currentTarget, BDFDB.disCN.selectoptionhoverlight);
				BDFDB.DOMUtils.addClass(e2.currentTarget, BDFDB.disCN.selectoptionlight);
			}	
		});
		BDFDB.ListenerUtils.addToChildren(selectMenu, "mousedown", BDFDB.dotCN.selectoption, e2 => {
			if (!BDFDB.DOMUtils.getParent(BDFDB.dotCN.giffavoritebutton, e2.target)) {
				var newchoice = e2.currentTarget.getAttribute("value");
				selectWrap.setAttribute("value", newchoice);
				callback(selectWrap, type, newchoice);
			}
		});

		var removeMenu = e2 => {
			if (e2.target.parentElement != selectMenu && !BDFDB.DOMUtils.getParent(BDFDB.dotCN.giffavoritebutton, e2.target)) {
				document.removeEventListener("mousedown", removeMenu);
				selectMenu.remove();
				BDFDB.TimeUtils.timeout(_ => {BDFDB.DOMUtils.removeClass(selectWrap, BDFDB.disCN.selectisopen);},100);
			}
		};
		document.addEventListener("mousedown", removeMenu);
		
		return selectMenu;
	};
	
	BDFDB.ModalUtils = {};
	BDFDB.ModalUtils.open = function (plugin, config) {
		if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ObjectUtils.is(config)) return;
		var modal, headerchildren = [], contentchildren = [], footerchildren = [], modalprops, cancels = [], closeModal = _ => {
			if (BDFDB.ObjectUtils.is(modalprops) && typeof modalprops.onClose == "function") modalprops.onClose();
		};
		if (typeof config.text == "string") {
			contentchildren.push(BDFDB.ReactUtils.createElement(LibraryComponents.TextElement, {
				color: LibraryComponents.TextElement.Colors.PRIMARY,
				children: config.text
			}));
		}
		if (config.children) {
			let selectedtab, tabbaritems = [];
			for (let child of (BDFDB.ArrayUtils.is(config.children) ? config.children : Array.of(config.children))) if (LibraryModules.React.isValidElement(child)) {
				if (child.type == LibraryComponents.ModalComponents.ModalTabContent) {
					if (!tabbaritems.length) child.props.open = true;
					else delete child.props.open;
					tabbaritems.push({value:child.props.tab});
				}
				contentchildren.push(child);
			}
			if (tabbaritems.length) headerchildren.push(BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
				className: BDFDB.disCN.tabbarcontainer,
				children: BDFDB.ReactUtils.createElement(LibraryComponents.TabBar, {
					className: BDFDB.disCN.tabbar,
					itemClassName: BDFDB.disCN.tabbaritem,
					type: LibraryComponents.TabBar.Types.TOP,
					items: tabbaritems,
					onItemSelect: (value, instance) => {
						let modal = BDFDB.DOMUtils.getParent(BDFDB.dotCN.modalwrapper, BDFDB.ReactUtils.findDOMNode(instance));
						if (modal) for (let tabcontent of modal.querySelectorAll(BDFDB.dotCN.modaltabcontent)) {
							let tabcontentinstance = BDFDB.ReactUtils.getValue(tabcontent, "return.return.stateNode");
							if (tabcontentinstance) {
								if (tabcontentinstance.props.tab == value) tabcontentinstance.props.open = true;
								else delete tabcontentinstance.props.open;
								BDFDB.ReactUtils.forceUpdate(tabcontentinstance);
							}
						}
					}
				}),
				style: {marginBottom: 10}
			}));
		}
		if (BDFDB.ArrayUtils.is(config.buttons)) for (let button of config.buttons) {
			let contents = typeof button.contents == "string" ? button.contents : null;
			if (contents) {
				let color = typeof button.color == "string" && LibraryComponents.Button.Colors[button.color.toUpperCase()];
				let look = typeof button.look == "string" && LibraryComponents.Button.Looks[button.look.toUpperCase()];
				let click = typeof button.click == "function" ? button.click : _ => {};
				
				if (button.cancel) cancels.push(click);
				
				footerchildren.push(BDFDB.ReactUtils.createElement(LibraryComponents.Button, {
					look: look || (color ? LibraryComponents.Button.Looks.FILLED : LibraryComponents.Button.Looks.LINK),
					color: color || LibraryComponents.Button.Colors.PRIMARY,
					onClick: _ => {
						if (button.close) closeModal();
						if (!(button.close && button.cancel)) click(modal);
					},
					children: contents
				}));
			}
		}
		contentchildren = contentchildren.filter(n => n && BDFDB.ReactUtils.isValidElement(n));
		headerchildren = headerchildren.filter(n => n && BDFDB.ReactUtils.isValidElement(n));
		footerchildren = footerchildren.filter(n => n && BDFDB.ReactUtils.isValidElement(n));
		if (contentchildren.length) {
			if (typeof config.onClose != "function") config.onClose = _ => {};
			if (typeof config.onOpen != "function") config.onOpen = _ => {};
			
			let name = plugin.name || (typeof plugin.getName == "function" ? plugin.getName() : null);
			name = typeof name == "string" ? name : null;
			let size = typeof config.size == "string" && LibraryComponents.ModalComponents.ModalSize[config.size.toUpperCase()];
			let oldTransitionState = 0;
			LibraryModules.ModalUtils.openModal(props => {
				modalprops = props;
				return BDFDB.ReactUtils.createElement(class BDFDB_Modal extends LibraryModules.React.Component {
					render () {
						return BDFDB.ReactUtils.createElement(LibraryComponents.ModalComponents.ModalRoot, {
							className: BDFDB.DOMUtils.formatClassName(name && `${name}-modal`, BDFDB.disCN.modalwrapper, config.className),
							size: size || LibraryComponents.ModalComponents.ModalSize.SMALL,
							transitionState: props.transitionState,
							children: [
								BDFDB.ReactUtils.createElement(LibraryComponents.ModalComponents.ModalHeader, {
									className: BDFDB.DOMUtils.formatClassName(config.headerClassName, headerchildren.length && BDFDB.disCN.modalheaderhassibling),
									separator: config.headerSeparator || false,
									children: [
										BDFDB.ReactUtils.createElement(LibraryComponents.Flex.Child, {
											grow: 1,
											shrink: 1,
											children: [
												BDFDB.ReactUtils.createElement(LibraryComponents.FormComponents.FormTitle, {
													tag: LibraryComponents.FormComponents.FormTitle.Tags.H4,
													children: typeof config.header == "string" ? config.header : ""
												}),
												BDFDB.ReactUtils.createElement(LibraryComponents.TextElement, {
													size: LibraryComponents.TextElement.Sizes.SMALL,
													color: LibraryComponents.TextElement.Colors.PRIMARY,
													children: typeof config.subheader == "string" ? config.subheader : (name || "")
												})
											]
										}),
										BDFDB.ReactUtils.createElement(LibraryComponents.ModalComponents.ModalCloseButton, {
											onClick: closeModal
										})
									]
								}),
								headerchildren.length ? BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
									children: headerchildren
								}) : null,
								BDFDB.ReactUtils.createElement(LibraryComponents.ModalComponents.ModalContent, {
									className: config.contentClassName,
									scroller: config.scroller,
									children: contentchildren
								}),
								footerchildren.length ? BDFDB.ReactUtils.createElement(LibraryComponents.ModalComponents.ModalFooter, {
									className: config.footerClassName,
									children: footerchildren
								}) : null
							]
						});
					}
					componentDidMount () {
						modal = BDFDB.ReactUtils.findDOMNode(this);
						modal = modal && modal.parentElement ? modal.parentElement.querySelector(BDFDB.dotCN.modalwrapper) : null;
						if (modal && props.transitionState == 2 && props.transitionState > oldTransitionState) config.onOpen(modal, this);
						oldTransitionState = props.transitionState;
					}
					componentWillUnmount () {
						if (modal && props.transitionState == 4) {
							for (let cancel of cancels) cancel(modal);
							config.onClose(modal, this);
						}
					}
				}, props);
			}, {
				onCloseRequest: closeModal
			});
		}
	};
	BDFDB.ModalUtils.confirm = function (plugin, text, callback) {
		if (!BDFDB.ObjectUtils.is(plugin) || typeof text != "string") return;
		callback = typeof callback == "function" ? callback : _ => {};
		BDFDB.ModalUtils.open(plugin, {text, header:"Are you sure?", className:BDFDB.disCN.modalconfirmmodal, scroller:false, buttons:[
			{contents: BDFDB.LanguageUtils.LanguageStrings.OKAY, close:true, color:"RED", click:callback},
			{contents: BDFDB.LanguageUtils.LanguageStrings.CANCEL, close:true}
		]});
	};
	
	BDFDB.ContextMenuUtils = {};
	BDFDB.ContextMenuUtils.open = function (plugin, e, children) {
		LibraryModules.ContextMenuUtils.openContextMenu(e, function (e) {
			return BDFDB.ReactUtils.createElement(LibraryComponents.ContextMenu, Object.assign({}, e, {
				BDFDBcontextMenu: true,
				type: BDFDB.DiscordConstants.ContextMenuTypes.NATIVE_TEXT,
				value: "",
				className: BDFDB.disCN.contextmenu,
				children: children
			}));
		});
	};
	BDFDB.ContextMenuUtils.close = function (nodeOrInstance) {
		if (!BDFDB.ObjectUtils.is(nodeOrInstance)) return;
		var instance = BDFDB.ReactUtils.findOwner(nodeOrInstance, {props:"closeContextMenu", up:true});
		if (BDFDB.ObjectUtils.is(instance) && instance.props && typeof instance.props.closeContextMenu == "function") instance.props.closeContextMenu();
	};

	BDFDB.createMessageOptionPopout = function (button) {
		if (!button) return;
		var popouts = document.querySelector(BDFDB.dotCN.popouts);
		if (!popouts) return;
		button = BDFDB.DOMUtils.containsClass(button, BDFDB.disCN.optionpopoutbutton) ? button : button.querySelector(BDFDB.dotCN.optionpopoutbutton);
		var containerins = BDFDB.ReactUtils.getInstance(BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagebuttoncontainer, button));
		containerins = containerins && containerins.child ? containerins.child : null;
		containerins = containerins && containerins.stateNode && typeof containerins.stateNode.renderReactionPopout == "function" ? containerins.sibling : containerins;
		if (containerins && containerins.stateNode && typeof containerins.stateNode.renderOptionPopout == "function") {
			BDFDB.DOMUtils.addClass(button, "popout-open");
			var popout = BDFDB.DOMUtils.create(`<div role="dialog" class="${BDFDB.disCNS.popoutnoarrow + BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottom + BDFDB.disCN.popoutarrowalignmenttop}" style="z-index:1001; visibility:visible; transform:translateX(-50%) translateY(0%) translateZ(0px);"></div>`);
			popouts.appendChild(popout);
			var popoutinstance = containerins.stateNode.renderOptionPopout(containerins.stateNode.props);
			popoutinstance.props.target = button;
			popoutinstance.props.onClose = _ => {
				BDFDB.DOMUtils.removeClass(button, "popout-open");
				popout.remove();
			};
			BDFDB.ReactUtils.render(popoutinstance, popout);
			var buttonrects = BDFDB.DOMUtils.getRects(button);
			popout.style.setProperty("left", buttonrects.left + buttonrects.width / 2 + "px");
			popout.style.setProperty("top", buttonrects.top + buttonrects.height / 2 + "px");
			var mousedown = e => {
				document.removeEventListener("mousedown", mousedown);
				if (!popout.contains(e.target)) popoutinstance.props.onClose();
			};
			document.addEventListener("mousedown", mousedown);
		}
	};

	BDFDB.createSortPopout = function (anker, markup, callback) {
		if (!anker || !markup || typeof callback != "function" || BDFDB.DOMUtils.containsClass(anker, "popout-open")) return;
		var popouts = document.querySelector(BDFDB.dotCN.popouts);
		var valueinput = anker.querySelector(BDFDB.dotCNC.quickselectvalue + BDFDB.dotCN.recentmentionsmentionfiltervalue);
		if (!popouts || !valueinput) return;
		BDFDB.DOMUtils.addClass(anker, "popout-open");
		var popout = BDFDB.DOMUtils.create(markup);
		var ankerrects = BDFDB.DOMUtils.getRects(anker);
		popout.style.setProperty("left", ankerrects.left + ankerrects.width + "px");
		popout.style.setProperty("top", ankerrects.top + BDFDB.DOMUtils.getRects(valueinput).height + "px");
		BDFDB.DOMUtils.addClass(popout.querySelector(BDFDB.dotCN.contextmenu), BDFDB.DiscordUtils.getTheme());
		BDFDB.ListenerUtils.addToChildren(popout, "click", BDFDB.dotCN.contextmenuitem, e => {
			valueinput.innerText = e.currentTarget.innerText;
			valueinput.setAttribute("option", e.currentTarget.getAttribute("option"));
			document.removeEventListener("mousedown", mousedown);
			popout.remove();
			BDFDB.TimeUtils.timeout(_ => {BDFDB.DOMUtils.removeClass(anker, "popout-open");}, 300);
			callback();
		});
		popouts.appendChild(popout);
		BDFDB.initElements(popout);
		var mousedown = e => {
			if (!document.contains(popout)) document.removeEventListener("mousedown", mousedown);
			else if (!popout.contains(e.target)) {
				document.removeEventListener("mousedown", mousedown);
				popout.remove();
				BDFDB.TimeUtils.timeout(_ => {BDFDB.DOMUtils.removeClass(anker, "popout-open");}, 300);
			}
		};
		document.addEventListener("mousedown", mousedown);
	};

	// REMOVE ONCE REWRITTEN
	var setSwatch = (swatch, color, selected) => {
		if (!swatch) return;
		else if (selected) {
			BDFDB.DOMUtils.addClass(swatch, BDFDB.disCN.colorpickerswatchselected);
			var iscustom = BDFDB.DOMUtils.containsClass(swatch, BDFDB.disCN.colorpickerswatchcustom);
			var isgradient = color && BDFDB.ObjectUtils.is(color);
			var selectedcolor = BDFDB.ObjectUtils.is(color) ? BDFDB.ColorUtils.createGradient(color) : BDFDB.ColorUtils.convert(color, "RGBA");
			var bright = selectedcolor && !isgradient ? BDFDB.ColorUtils.isBright(selectedcolor) : false;
			if (!swatch.querySelector(`svg[name="Checkmark"]`)) swatch.appendChild(BDFDB.DOMUtils.create(`<svg class="swatch-checkmark" name="Checkmark" aria-hidden="false" width="${iscustom ? 32 : 16}" height="${iscustom ? 24 : 16}" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="${bright ? "#000000" : "#ffffff"}" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg>`));
			if (iscustom) {
				BDFDB.DOMUtils.removeClass(swatch, BDFDB.disCN.colorpickerswatchnocolor);
				swatch.querySelector(BDFDB.dotCN.colorpickerswatchdropperfg).setAttribute("fill", bright ? "#000000" : "#ffffff");
				if (selectedcolor) {
					if (isgradient) swatch.gradient = color;
					swatch.style.setProperty(isgradient ? "background-image" : "background-color", selectedcolor, "important");
				}
			}
		}
		else {
			delete swatch.gradient;
			BDFDB.DOMUtils.removeClass(swatch, "selected");
			BDFDB.DOMUtils.remove(swatch.querySelectorAll(".swatch-checkmark"));
			if (BDFDB.DOMUtils.containsClass(swatch, BDFDB.disCN.colorpickerswatchcustom)) {
				BDFDB.DOMUtils.addClass(swatch, BDFDB.disCN.colorpickerswatchnocolor);
				swatch.querySelector(BDFDB.dotCN.colorpickerswatchdropperfg).setAttribute("fill", "#ffffff");
				swatch.style.removeProperty("background-color");
				swatch.style.removeProperty("background-image");
			}
		}
	};

	// REMOVE ONCE REWRITTEN
	BDFDB.setColorSwatches = function (container, currentcolor) {
		if (!Node.prototype.isPrototypeOf(container)) return;

		var swatches = container.querySelector(`${BDFDB.dotCN.colorpickerswatches}:not([number])`);
		if (!swatches) return;
		swatches.setAttribute("number", parseInt(container.querySelectorAll(`${BDFDB.dotCN.colorpickerswatches}[number]`).length + 1));

		var colorlist = [null, "rgba(82,233,30,1)", "rgba(46,204,113,1)", "rgba(26,188,156,1)", "rgba(52,152,219,1)", "rgba(52,84,219,1)", "rgba(134,30,233,1)", "rgba(155,89,182,1)", "rgba(233,30,99,1)", "rgba(233,65,30,1)", "rgba(231,76,60,1)", "rgba(230,126,34,1)", "rgba(241,196,15,1)", "rgba(199,204,205,1)", "rgba(112,128,136,1)", "rgba(99,99,99,1)", "rgba(255,255,255,1)", "rgba(59,173,20,1)", "rgba(31,139,76,1)", "rgba(17,128,106,1)", "rgba(32,102,148,1)", "rgba(32,57,148,1)", "rgba(109,20,173,1)", "rgba(113,54,138,1)", "rgba(173,20,87,1)", "rgba(173,32,20,1)", "rgba(153,45,34,1)", "rgba(168,67,0,1)", "rgba(194,124,14,1)", "rgba(151,156,159,1)", "rgba(93,104,109,1)", "rgba(44,44,44,1)"];
		var colorrows = [colorlist.slice(0, parseInt(colorlist.length/2)), colorlist.slice(parseInt(colorlist.length/2))];
		colorlist.shift();

		swatches.appendChild(BDFDB.DOMUtils.create(`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.margintop8}" style="flex: 1 1 auto;"><div class="${BDFDB.disCN.marginreset}" style="flex: 0 0 auto;"><div aria-label="" class=""><button type="button" class="${BDFDB.disCNS.colorpickerswatch + BDFDB.disCNS.colorpickerswatchcustom + BDFDB.disCN.colorpickerswatchnocolor}" style="margin-left: 0;"><svg class="${BDFDB.disCN.colorpickerswatchdropper}" width="14" height="14" viewBox="0 0 16 16"><g fill="none"><path d="M-4-4h24v24H-4z"/><path class="${BDFDB.disCN.colorpickerswatchdropperfg}" fill="#ffffff" d="M14.994 1.006C13.858-.257 11.904-.3 10.72.89L8.637 2.975l-.696-.697-1.387 1.388 5.557 5.557 1.387-1.388-.697-.697 1.964-1.964c1.13-1.13 1.3-2.985.23-4.168zm-13.25 10.25c-.225.224-.408.48-.55.764L.02 14.37l1.39 1.39 2.35-1.174c.283-.14.54-.33.765-.55l4.808-4.808-2.776-2.776-4.813 4.803z"/></g></svg></button></div></div><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.flexmarginreset}" style="flex: 1 1 auto;">${colorrows.map(row => `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.wrap + BDFDB.disCN.colorpickerrow}">` + row.map(c => `<button type="button" class="${BDFDB.disCN.colorpickerswatch + (c ? "" : (" " + BDFDB.disCN.colorpickerswatchnocolor))}" style="background-color: ${c};"></button>`).join("") + `</div>`).join("")}</div></div>`));

		if (currentcolor && !BDFDB.ColorUtils.compare(currentcolor, [0, 0, 0, 0])) {
			var selection = colorlist.indexOf(BDFDB.ColorUtils.convert(currentcolor, "RGBA"));
			setSwatch(selection > -1 ? swatches.querySelectorAll(BDFDB.dotCNS.colorpickerrow + BDFDB.dotCN.colorpickerswatch + BDFDB.notCN.colorpickerswatchnocolor)[selection] : swatches.querySelector(BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatchcustom), currentcolor, true);
		}
		else setSwatch(swatches.querySelector(BDFDB.dotCNS.colorpickerrow + BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatchnocolor), null, true);
		BDFDB.ListenerUtils.addToChildren(swatches, "click", BDFDB.dotCN.colorpickerswatch, e => {
			if (BDFDB.DOMUtils.containsClass(swatches, "disabled") || BDFDB.DOMUtils.containsClass(e.currentTarget, BDFDB.disCN.colorpickerswatchdisabled)) return;
			else if (BDFDB.DOMUtils.containsClass(e.currentTarget, BDFDB.disCN.colorpickerswatchcustom)) {
				BDFDB.ColorUtils.openPicker(swatches, e.currentTarget, e.currentTarget.gradient || e.currentTarget.style.getPropertyValue("background-color"));
			}
			else {
				setSwatch(swatches.querySelector(BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatchselected), null, false);
				setSwatch(e.currentTarget, e.currentTarget.style.getPropertyValue("background-color"), true);
			}
		});
		BDFDB.ListenerUtils.addToChildren(swatches, "mouseenter", BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatchcustom, e => {
			BDFDB.TooltipUtils.create(e.currentTarget, BDFDB.LanguageUtils.LanguageStrings.CUSTOM_COLOR, {type: "bottom"});
		});
		BDFDB.ListenerUtils.addToChildren(swatches, "mouseenter", BDFDB.dotCNS.colorpickerrow + BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatchnocolor, e => {
			BDFDB.TooltipUtils.create(e.currentTarget, BDFDB.LanguageUtils.LanguageStrings.DEFAULT, {type: "bottom"});
		});
	};

	BDFDB.TimeUtils = {};
	BDFDB.TimeUtils.interval = function (callback, delay) {
		if (typeof callback != "function" || typeof delay != "number" || delay < 1) return;
		else return setInterval(() => {BDFDB.TimeUtils.suppress(callback, "Interval")();}, delay);
	};
	BDFDB.TimeUtils.timeout = function (callback, delay) {
		if (typeof callback != "function") return;
		else if (typeof delay != "number" || delay < 1) return setImmediate(() => {BDFDB.TimeUtils.suppress(callback, "Immediate")();});
		else return setTimeout(() => {BDFDB.TimeUtils.suppress(callback, "Timeout")();}, delay);
	};
	BDFDB.TimeUtils.clear = function (...timeobjects) {
		for (let t of timeobjects.flat()) {
			if (typeof t == "number") {
				clearInterval(t);
				clearTimeout(t);
			}
			else if (typeof t == "object") clearImmediate(t);
		}
	};
	BDFDB.TimeUtils.suppress = function (callback, string, name) {return function (...args) {
		try {return callback(...args);}
		catch (err) {
			if (typeof string != "string") string = "";
			BDFDB.LogUtils.error(string + " " + err, name);
		}
	}};

	BDFDB.StringUtils = {};
	BDFDB.StringUtils.htmlEscape = function (string) {
		var ele = document.createElement("div");
		ele.innerText = string;
		return ele.innerHTML;
	};
	BDFDB.StringUtils.regEscape = function (string) {
		return typeof string == "string" && string.replace(/([\-\/\\\^\$\*\+\?\.\(\)\|\[\]\{\}])/g, "\\$1");
	};
	BDFDB.StringUtils.insertNRST = function (string) {
		return typeof string == "string" && string.replace(/\\r/g, "\r").replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\s/g, " ");
	};
	BDFDB.StringUtils.getParsedLength = function (string, channelid = LibraryModules.LastChannelStore.getChannelId()) {
		if (typeof string != "string" || !string) return 0;
		var channel = LibraryModules.ChannelStore.getChannel(channelid);
		var length = (!channel || string.indexOf("/") == 0 || string.indexOf("s/") == 0 || string.indexOf("+:") == 0) ? string.length : LibraryModules.MessageCreationUtils.parse(channel, string).content.length;
		return length > string.length ? length : string.length;
	};
	BDFDB.StringUtils.highlight = function (string, searchstring, prefix = `<span class="${BDFDB.disCN.highlight}">`, suffix = `</span>`) {
		if (typeof string != "string" || !searchstring || searchstring.length < 1) return string;
		var offset = 0, original = string;
		BDFDB.ArrayUtils.getAllIndexes(string.toUpperCase(), searchstring.toUpperCase()).forEach(index => {
			var d1 = offset * (prefix.length + suffix.length);
			index = index + d1;
			var d2 = index + searchstring.length;
			var d3 = [-1].concat(BDFDB.ArrayUtils.getAllIndexes(string.substring(0, index), "<"));
			var d4 = [-1].concat(BDFDB.ArrayUtils.getAllIndexes(string.substring(0, index), ">"));
			if (d3[d3.length - 1] > d4[d4.length - 1]) return;
			string = string.substring(0, index) + prefix + string.substring(index, d2) + suffix + string.substring(d2);
			offset++;
		});
		return string || original;
	};
	
	BDFDB.NumberUtils = {};
	BDFDB.NumberUtils.formatBytes = function (bytes, sigdigits) {
		bytes = parseInt(bytes);
		if (isNaN(bytes) || bytes < 0) return "0 Bytes";
		if (bytes == 1) return "1 Byte";
		var size = Math.floor(Math.log(bytes) / Math.log(1024));
		return parseFloat((bytes / Math.pow(1024, size)).toFixed(sigdigits < 1 ? 0 : sigdigits > 20 ? 20 : sigdigits || 2)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][size];
	};
	BDFDB.NumberUtils.mapRange = function (from, to, value) {
		if (parseFloat(value) < parseFloat(from[0])) return parseFloat(to[0]);
		else if (parseFloat(value) > parseFloat(from[1])) return parseFloat(to[1]);
		else return parseFloat(to[0]) + (parseFloat(value) - parseFloat(from[0])) * (parseFloat(to[1]) - parseFloat(to[0])) / (parseFloat(from[1]) - parseFloat(from[0]));
	};
	BDFDB.NumberUtils.generateId = function (array) {
		array = BDFDB.ArrayUtils.is(array) ? array : [];
		let id = Math.floor(Math.random() * 10000000000000000);
		if (array.includes(id)) return BDFDB.NumberUtils.generateId(array);
		else {
			array.push(id);
			return id;
		}
	};
	BDFDB.NumberUtils.compareVersions = function (newv, oldv) {
		if (!newv || !oldv) return true;
		newv = newv.toString().replace(/["'`]/g, "").split(/,|\./g).map(n => parseInt(n)).filter(n => (n || n == 0) && !isNaN(n));
		oldv = oldv.toString().replace(/["'`]/g, "").split(/,|\./g).map(n => parseInt(n)).filter(n => (n || n == 0) && !isNaN(n));
		var length = Math.max(newv.length, oldv.length);
		if (!length) return true;
		if (newv.length > oldv.length) {
			var temparray = new Array(newv.length - oldv.length);
			for (let i = 0; i < temparray.length; i++) temparray[i] = 0;
			oldv = temparray.concat(oldv);
		}
		else if (newv.length < oldv.length) {
			var temparray = new Array(oldv.length - newv.length);
			for (let i = 0; i < temparray.length; i++) temparray[i] = 0;
			newv = temparray.concat(newv);
		}
		for (let i = 0; i < length; i++) for (let ioutdated = false, j = 0; j <= i; j++) {
			if (j == i && newv[j] < oldv[j]) return false;
			if (j < i) ioutdated = newv[j] == oldv[j];
			if ((j == 0 || ioutdated) && j == i && newv[j] > oldv[j]) return true;
		}
		return false;
	};
	BDFDB.NumberUtils.getVersionDifference = function (newv, oldv) {
		if (!newv || !oldv) return false;
		newv = newv.toString().replace(/["'`]/g, "").split(/,|\./g).map(n => parseInt(n)).filter(n => (n || n == 0) && !isNaN(n));
		oldv = oldv.toString().replace(/["'`]/g, "").split(/,|\./g).map(n => parseInt(n)).filter(n => (n || n == 0) && !isNaN(n));
		var length = Math.max(newv.length, oldv.length);
		if (!length) return false;
		if (newv.length > oldv.length) {
			var temparray = new Array(newv.length - oldv.length);
			for (let i = 0; i < temparray.length; i++) temparray[i] = 0;
			oldv = temparray.concat(oldv);
		}
		else if (newv.length < oldv.length) {
			var temparray = new Array(oldv.length - newv.length);
			for (let i = 0; i < temparray.length; i++) temparray[i] = 0;
			newv = temparray.concat(newv);
		}
		var oldvvalue = 0, newvvalue = 0;
		for (let i in oldv.reverse()) oldvvalue += (oldv[i] * (10 ** i));
		for (let i in newv.reverse()) newvvalue += (newv[i] * (10 ** i));
		return (newvvalue - oldvvalue) / (10 ** (length-1));
	};

	BDFDB.DiscordUtils = {};
	BDFDB.DiscordUtils.getFolder = function () {
		var built = BDFDB.DiscordUtils.getBuilt();
		built = "discord" + (built == "stable" ? "" : built);
		return LibraryRequires.path.resolve(LibraryRequires.electron.remote.app.getPath("appData"), built, BDFDB.DiscordUtils.getVersion());
	};
	BDFDB.DiscordUtils.getBuilt = function () {
		if (BDFDB.DiscordUtils.getBuilt.built) return BDFDB.DiscordUtils.getBuilt.built;
		else {
			var built = null;
			try {built = require(LibraryRequires.electron.remote.app.getAppPath() + "/build_info.json").releaseChannel.toLowerCase();} 
			catch (err) {
				try {built = require(LibraryRequires.electron.remote.app.getAppPath().replace("\app.asar", "") + "/build_info.json").releaseChannel.toLowerCase();} 
				catch (err) {
					var version = BDFDB.DiscordUtils.getVersion();
					if (version) {
						version = version.split(".");
						if (version.length == 3 && !isNaN(version = parseInt(version[2]))) built = version > 300 ? "stable" : da > 200 ? "canary" : "ptb";
						else built = "stable";
					}
					else built = "stable";
				}
			}
			BDFDB.DiscordUtils.getBuilt.built = built;
			return built;
		}
	};
	BDFDB.DiscordUtils.getVersion = function () {
		if (BDFDB.DiscordUtils.getBuilt.version) return BDFDB.DiscordUtils.getBuilt.version;
		else {
			var version = null;
			try {version = LibraryRequires.electron.remote.app.getVersion();}
			catch (err) {version = "";}
			BDFDB.DiscordUtils.getBuilt.version = version;
			return version;
		}
	};
	BDFDB.DiscordUtils.getTheme = function () {
		return BDFDB.DOMUtils.containsClass(document.documentElement, BDFDB.disCN.themelight) ? BDFDB.disCN.themelight : BDFDB.disCN.themedark;
	};
	BDFDB.DiscordUtils.getMode = function () {
		return document.querySelectorAll(BDFDB.dotCN.messagegroupcompact).length >= document.querySelectorAll(BDFDB.dotCN.messagegroupcozy).length ? "compact" : "cozy";
	};
	BDFDB.DiscordUtils.getZoomFactor = function () {
		var arects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount));
		var widthzoom = Math.round(100 * window.outerWidth / arects.width);
		var heightzoom = Math.round(100 * window.outerHeight / arects.height);
		return widthzoom < heightzoom ? widthzoom : heightzoom;
	};
	BDFDB.DiscordUtils.getFontScale = function () {
		return parseInt(document.firstElementChild.style.fontSize.replace("%", ""));
	};
	BDFDB.DiscordUtils.shake = function () {
		BDFDB.ReactUtils.getInstance(document.querySelector(BDFDB.dotCN.appold)).return.stateNode.shake();
	};

	BDFDB.BDUtils = {};
	BDFDB.BDUtils.getPluginsFolder = function () {
		if (LibraryRequires.process.env.injDir) return LibraryRequires.path.resolve(LibraryRequires.process.env.injDir, "plugins/");
		switch (LibraryRequires.process.platform) {
			case "win32":
				return LibraryRequires.path.resolve(LibraryRequires.process.env.appdata, "BetterDiscord/plugins/");
			case "darwin":
				return LibraryRequires.path.resolve(LibraryRequires.process.env.HOME, "Library/Preferences/BetterDiscord/plugins/");
			default:
				if (LibraryRequires.process.env.XDG_CONFIG_HOME) return LibraryRequires.path.resolve(LibraryRequires.process.env.XDG_CONFIG_HOME, "BetterDiscord/plugins/");
				else return LibraryRequires.path.resolve(LibraryRequires.process.env.HOME, ".config/BetterDiscord/plugins/");
			}
	};
	BDFDB.BDUtils.getThemesFolder = function () {
		if (LibraryRequires.process.env.injDir) return LibraryRequires.path.resolve(LibraryRequires.process.env.injDir, "plugins/");
		switch (LibraryRequires.process.platform) {
			case "win32": 
				return LibraryRequires.path.resolve(LibraryRequires.process.env.appdata, "BetterDiscord/themes/");
			case "darwin": 
				return LibraryRequires.path.resolve(LibraryRequires.process.env.HOME, "Library/Preferences/BetterDiscord/themes/");
			default:
				if (LibraryRequires.process.env.XDG_CONFIG_HOME) return LibraryRequires.path.resolve(LibraryRequires.process.env.XDG_CONFIG_HOME, "BetterDiscord/themes/");
				else return LibraryRequires.path.resolve(LibraryRequires.process.env.HOME, ".config/BetterDiscord/themes/");
			}
	};
	BDFDB.BDUtils.checkRepoPage = function (usersettings = document.querySelector(BDFDB.dotCN.layer + `[layer-id="user-settings"]`)) {
		if (!usersettings) return;
		var folderbutton = usersettings.querySelector(BDFDB.dotCN._repofolderbutton);
		if (!folderbutton) return;
		var header = folderbutton.parentElement.querySelector("h2");
		if (header && header.innerText) {
			let headertext = header.innerText.toLowerCase();
			if (headertext === "plugins" || headertext === "themes") return headertext;
		}
	};
	BDFDB.BDUtils.isBDv2 = function () {
		return typeof BDFDB.BDv2Api !== "undefined";
	};
	BDFDB.BDUtils.isPluginEnabled = function (pluginname) {
		if (!pluginname) return false;
		if (!BDFDB.BDUtils.isBDv2()) return BdApi.isPluginEnabled(pluginname);
		else return BDFDB.Plugins[pluginname.toLowerCase()] ? BDFDB.Plugins[pluginname.toLowerCase()].enabled : null;
	};
	BDFDB.BDUtils.getPlugin = function (pluginname, hasToBeEnabled = false) {
		if (!hasToBeEnabled || BDFDB.BDUtils.isPluginEnabled(pluginname)) return BdApi.getPlugin(pluginname);
		return null;
	};
	BDFDB.BDUtils.isThemeEnabled = function (themename) {
		if (!BDFDB.BDUtils.isBDv2()) return BdApi.isThemeEnabled(themename)
		else return BDFDB.Themes[themename.toLowerCase()] ? BDFDB.Themes[themename.toLowerCase()].enabled : null;
	};
	BDFDB.BDUtils.getTheme = function (themename, hasToBeEnabled = false) {
		if (window.bdthemes && (!hasToBeEnabled || BDFDB.BDUtils.isThemeEnabled(themename))) return window.bdthemes[themename];
		return null;
	};
	BDFDB.BDUtils.getSettings = function (key) {
		if (!window.settingsCookie) return null;
		if (!key) return window.settingsCookie;
		return window.settingsCookie[key];
	};
	BDFDB.BDUtils.isAutoLoadEnabled = function () {
		return BDFDB.BDUtils.getSettings("fork-ps-5") === true || BDFDB.BDUtils.isPluginEnabled("Restart-No-More") || BDFDB.BDUtils.isPluginEnabled("Restart No More");
	};
	(BDFDB.BDUtils.setPluginCache = function () {
		if (!BDFDB.BDUtils.isBDv2()) return;
		BDFDB.Plugins = {};
		for (let plugin of BDFDB.BDv2Api.Plugins.listPlugins()) BDFDB.BDv2Api.Plugins.getPlugin(plugin).then(plugindata => {BDFDB.Plugins[plugin] = plugindata;});
	})();
	(BDFDB.BDUtils.setThemeCache = function () {
		if (!BDFDB.BDUtils.isBDv2()) return;
		BDFDB.Themes = {};
		for (let theme of BDFDB.BDv2Api.Themes.listThemes()) BDFDB.BDv2Api.Themes.getTheme(theme).then(themedata => {BDFDB.Themes[theme] = themedata;});
	})();

	var DiscordClassModules = {};
	DiscordClassModules.BDFDB = {
		BDFDBundefined: "BDFDB_undefined",
		cardInner: "inner-OP_8zd",
		cardWrapper: "card-rT4Wbb",
		charCounter: "counter-uAzbKp",
		changeLogModal: "changeLogModal-ny_dHC",
		collapseContainer: "container-fAVkOf",
		collapseContainerArrow: "arrow-uglXxc",
		collapseContainerCollapsed: "container-fAVkOf collapsed-2BUBZm",
		collapseContainerHeader: "header-2s6x-5",
		collapseContainerInner: "inner-TkGytd",
		collapseContainerTitle: "title-ROsJi-",
		colorPickerSwatches: "swatches-QxZw_N",
		colorPickerSwatchesDisabled: "disabled-2JgNxl",
		colorPickerSwatchSingle: "single-Fbb1wB",
		colorPickerSwatchSelected: "selected-f5IVXN",
		confirmModal: "confirmModal-t-WDWJ",
		favButtonContainer: "favbutton-8Fzu45",
		guild: "guild-r3yAE_",
		inputNumberButton: "button-J9muv5",
		inputNumberButtonDown: "down-cOY7Qp button-J9muv5",
		inputNumberButtonUp: "up-mUs_72 button-J9muv5",
		inputNumberButtons: "buttons-our3p-",
		inputNumberWrapper: "numberInputWrapper-j4svZS",
		inputNumberWrapperDefault: "numberInputWrapperDefault-gRxcuK numberInputWrapper-j4svZS",
		inputNumberWrapperMini: "numberInputWrapperMini-wtUU31 numberInputWrapper-j4svZS",
		overflowEllipsis: "ellipsis-qlo9sA",
		popoutWrapper: "popout-xwjvsX",
		quickSelectWrapper: "quickSelectWrapper-UCfTKz",
		quickSelectPopoutWrapper: "quickSelectPopout-u2dtIf",
		modalHeaderHasSibling: "hasSiblings-fRyjyl",
		modalInnerScrollerLess: "inner-YgPpF3",
		modalTabContent: "tab-content",
		modalTabContentOpen: "open",
		modalWrapper: "modal-6GHvdM",
		settingsPanel: "settingsPanel-w2ySNR",
		settingsPanelInner: "settingsInner-zw1xAY",
		settingsPanelList: "settingsList-eZjkXj",
		settingsPanelTitle: "title-GTF_8J",
		svgIcon: "icon-GhnIRB",
		table: "table-moqjM0",
		tableBodyCell: "bodyCell-dQam9V",
		tableHeader: "header-g67q9_",
		tableHeaderCell: "headerCell-T6Fo3K",
		tableHeaderCellSorted: "headerCellSorted-FMjMWK",
		tableHeaderSortIcon: "sortIcon-WZjMja",
		tableRow: "row-_9Ehcp",
		tableStickyHeader: "stickyHeader-JabwjW header-g67q9_",
		textScroller: "textScroller-dc9_kz"
	};
	DiscordClassModules.BDrepo = {
		bdGuild: "bd-guild",
		bdGuildAnimatable: "bd-animatable",
		bdGuildAudio: "bd-audio",
		bdGuildSelected: "bd-selected",
		bdGuildSeparator: "bd-guild-separator",
		bdGuildUnread: "bd-unread",
		bdGuildVideo: "bd-video",
		bdPillSelected: "bd-selected",
		bdPillUnread: "bd-unread",
		bdaAuthor: "bda-author",
		bdaControls: "bda-controls",
		bdaDescription: "bda-description",
		bdaDescriptionWrap: "bda-description-wrap",
		bdaFooter: "bda-footer",
		bdaHeader: "bda-header",
		bdaHeaderTitle: "bda-header-title",
		bdaLink: "bda-link",
		bdaLinks: "bda-links",
		bdaName: "bda-name",
		bdaSettingsButton: "bda-settings-button",
		bdaSlist: "bda-slist",
		bdaVersion: "bda-version",
		bdPfbtn: "bd-pfbtn",
		settingsOpen: "settings-open",
		settingsClosed: "settings-closed",
		switch: "ui-switch",
		switchCheckbox: "ui-switch-checkbox",
		switchChecked: "checked",
		switchItem: "ui-switch-item",
		switchWrapper: "ui-switch-wrapper"
	};
	DiscordClassModules.BDv2repo = {
		bdButton: "bd-button",
		bdCard: "bd-card",
		bdHasTooltip: "bd-hasTooltip",
		bdMaterialDesignIcon: "bd-materialDesignIcon",
		bdTooltip: "bd-tooltip",
		vTooltipOpen: "v-tooltip-open"
	};
	DiscordClassModules.NotFound = {
		_: "",
		badgeWrapper: "wrapper-232cHJ",
		channelPanelTitle: "title-eS5yk3",
		emoji: "emoji",
		guildChannels: "container-PNkimc",
		highlight: "highlight",
		hoverCardButton: "button-2CgfFz",
		loginScreen: "wrapper-3Q5DdO",
		mention: "mention",
		nameContainerNameContainer: "container-2ax-kl",
		quickSelectPopoutOptionSelected: "selected",
		select: "css-1kj8ui-container",
		selectArrow: "css-19bqh2r",
		selectArrowContainer: "css-bdfdb-indicatorContainer",
		selectArrowContainerDark: "css-12qlrak-indicatorContainer",
		selectArrowContainerLight: "css-11dkexk-indicatorContainer",
		selectArrowZone: "css-1wy0on6",
		selectControl: "css-bdfdb-control",
		selectControlDark: "css-15ejc46-control",
		selectControlLight: "css-oc2jo8-control",
		selectDummyInput: "css-gj7qu5-dummyInput",
		selectHasValue: "css-bdfdb-hasValue",
		selectIsOpen: "css-bdfdb-isOpen",
		selectIsSelected: "css-bdfdb-isSelected",
		selectMenu: "css-1ye7vu0",
		selectMenuOuter: "css-bdfdb-menuOuter",
		selectMenuOuterDark: "css-ua3v5p-menu",
		selectMenuOuterLight: "css-1ea7eys-menu",
		selectOption: "css-bdfdb-option",
		selectOptionDark: "css-1aymab5-option",
		selectOptionLight: "css-ddw2o3-option",
		selectOptionHoverDark: "css-1gnr91b-option",
		selectOptionHoverLight: "css-qgio2y-option",
		selectOptionSelectDark: "css-12o7ek3-option",
		selectOptionSelectLight: "css-1kft5vg-option",
		selectSingle: "css-bdfdb-singleValue",
		selectSingleDark: "css-1k00wn6-singleValue",
		selectSingleLight: "css-6nrxdk-singleValue",
		selectValue: "css-1hwfws3",
		splashBackground: "splashBackground-1FRCko",
		stopAnimations: "stop-animations",
		subtext: "subtext-3CDbHg",
		themeDark: "theme-dark",
		themeLight: "theme-light",
		themeUndefined: "theme-undefined",
		voiceDraggable: "draggable-1KoBzC"
	};

	DiscordClassModules.AccountDetails = BDFDB.ModuleUtils.findByProperties("usernameContainer", "container");
	DiscordClassModules.AccountDetailsButtons = BDFDB.ModuleUtils.findByProperties("button", "enabled", "disabled");
	DiscordClassModules.ActivityFeed = BDFDB.ModuleUtils.findByProperties("activityFeed");
	DiscordClassModules.Anchor = BDFDB.ModuleUtils.findByProperties("anchor", "anchorUnderlineOnHover");
	DiscordClassModules.AnimationContainer = BDFDB.ModuleUtils.findByProperties("animatorLeft", "didRender");
	DiscordClassModules.AppBase = BDFDB.ModuleUtils.findByProperties("container", "base");
	DiscordClassModules.AppInner = BDFDB.ModuleUtils.findByProperties("app", "layers");
	DiscordClassModules.AppMount = BDFDB.ModuleUtils.findByProperties("appMount");
	DiscordClassModules.ApplicationStore = BDFDB.ModuleUtils.findByProperties("applicationStore", "navigation");
	DiscordClassModules.AppOuter = BDFDB.ModuleUtils.find(m => typeof m.app == "string" && Object.keys(m).length == 1);
	DiscordClassModules.AuditLog = BDFDB.ModuleUtils.findByProperties("auditLog");
	DiscordClassModules.AuthBox = BDFDB.ModuleUtils.findByProperties("authBox");
	DiscordClassModules.Autocomplete = BDFDB.ModuleUtils.findByProperties("autocomplete", "autocompleteRow");
	DiscordClassModules.Avatar = BDFDB.ModuleUtils.findByProperties("avatar", "mask", "wrapper");
	DiscordClassModules.AvatarIcon = BDFDB.ModuleUtils.findByProperties("iconActiveLarge", "iconActiveMedium");
	DiscordClassModules.Backdrop = BDFDB.ModuleUtils.findByProperties("backdrop");
	DiscordClassModules.Badge = BDFDB.ModuleUtils.findByProperties("numberBadge", "textBadge", "iconBadge");
	DiscordClassModules.BotTag = BDFDB.ModuleUtils.findByProperties("botTag", "botTagInvert");
	DiscordClassModules.Button = BDFDB.ModuleUtils.findByProperties("colorBlack", "button");
	DiscordClassModules.Call = BDFDB.ModuleUtils.findByProperties("callAvatarWrapper", "video");
	DiscordClassModules.CallCurrent = BDFDB.ModuleUtils.findByProperties("wrapper", "fullScreen");
	DiscordClassModules.CallDetails = BDFDB.ModuleUtils.findByProperties("container", "hotspot");
	DiscordClassModules.CallIncoming = BDFDB.ModuleUtils.findByProperties("incomingCall", "container");
	DiscordClassModules.CallIncomingInner = BDFDB.ModuleUtils.findByProperties("incomingCallInner", "members");
	DiscordClassModules.Card = BDFDB.ModuleUtils.findByProperties("card", "cardBrand");
	DiscordClassModules.CardStatus = BDFDB.ModuleUtils.findByProperties("reset", "error", "card");
	DiscordClassModules.CardStore = BDFDB.ModuleUtils.findByProperties("card", "interactive", "url");
	DiscordClassModules.Category = BDFDB.ModuleUtils.findByProperties("wrapper", "children", "muted");
	DiscordClassModules.CategoryContainer = BDFDB.ModuleUtils.findByProperties("addButtonIcon", "containerDefault");
	DiscordClassModules.ChangeLog = BDFDB.ModuleUtils.findByProperties("added", "fixed", "improved", "progress");
	DiscordClassModules.Channel = BDFDB.ModuleUtils.findByProperties("wrapper", "content", "modeSelected");
	DiscordClassModules.ChannelContainer = BDFDB.ModuleUtils.findByProperties("actionIcon", "containerDefault");
	DiscordClassModules.ChannelLimit = BDFDB.ModuleUtils.findByProperties("users", "total", "wrapper");
	DiscordClassModules.ChannelTextArea = BDFDB.ModuleUtils.findByProperties("textArea", "attachButtonDivider");
	DiscordClassModules.ChannelTextAreaButton = BDFDB.ModuleUtils.findByProperties("buttonWrapper", "active");
	DiscordClassModules.ChatWindow = BDFDB.ModuleUtils.findByProperties("chat", "channelTextArea");
	DiscordClassModules.Checkbox = BDFDB.ModuleUtils.findByProperties("checkboxWrapper", "round");
	DiscordClassModules.ColorPicker = BDFDB.ModuleUtils.findByProperties("colorPickerCustom", "customColorPickerInput");
	DiscordClassModules.ColorPickerInner = BDFDB.ModuleUtils.findByProperties("saturation", "hue", "wrapper");
	DiscordClassModules.ContextMenu = BDFDB.ModuleUtils.findByProperties("contextMenu", "itemGroup");
	DiscordClassModules.ContextMenuCheckbox = BDFDB.ModuleUtils.findByProperties("checkboxInner", "checkboxElement");
	DiscordClassModules.CtaVerification = BDFDB.ModuleUtils.findByProperties("attendeeCTA", "verificationNotice");
	DiscordClassModules.Cursor = BDFDB.ModuleUtils.findByProperties("cursorDefault", "userSelectNone");
	DiscordClassModules.CustomStatus = BDFDB.ModuleUtils.findByProperties("customStatusContentIcon", "customStatus");
	DiscordClassModules.CustomStatusIcon = BDFDB.ModuleUtils.findByProperties("icon", "emoji");
	DiscordClassModules.DmAddPopout = BDFDB.ModuleUtils.findByProperties("popout", "searchBarComponent");
	DiscordClassModules.DmAddPopoutItems = BDFDB.ModuleUtils.findByProperties("friendSelected", "friendWrapper");
	DiscordClassModules.DownloadLink = BDFDB.ModuleUtils.findByProperties("downloadLink");
	DiscordClassModules.Embed = BDFDB.ModuleUtils.findByProperties("embed", "embedAuthorIcon");
	DiscordClassModules.EmbedActions = BDFDB.ModuleUtils.findByProperties("iconPlay", "iconWrapperActive");
	DiscordClassModules.Emoji = BDFDB.ModuleUtils.find(m => typeof m.emoji == "string" && Object.keys(m).length == 1);
	DiscordClassModules.EmojiButton = BDFDB.ModuleUtils.findByProperties("emojiButton", "sprite");
	DiscordClassModules.EmojiPicker = BDFDB.ModuleUtils.findByProperties("emojiPicker", "categories");
	DiscordClassModules.File = BDFDB.ModuleUtils.findByProperties("downloadButton", "fileNameLink");
	DiscordClassModules.Flex = BDFDB.ModuleUtils.findByProperties("alignBaseline", "alignCenter");
	DiscordClassModules.FlexChild = BDFDB.ModuleUtils.findByProperties("flexChild", "flex");
	DiscordClassModules.FlowerStar = BDFDB.ModuleUtils.findByProperties("flowerStarContainer", "flowerStar");
	DiscordClassModules.FormText = BDFDB.ModuleUtils.findByProperties("description", "modeDefault");
	DiscordClassModules.Friends = BDFDB.ModuleUtils.findByProperties("friendsColumn", "friendsRow");
	DiscordClassModules.Game = BDFDB.ModuleUtils.findByProperties("game", "gameName");
	DiscordClassModules.GameIcon = BDFDB.ModuleUtils.findByProperties("gameIcon", "small", "xsmall");
	DiscordClassModules.GameLibrary = BDFDB.ModuleUtils.findByProperties("gameLibrary", "scroller");
	DiscordClassModules.GameLibraryTable = BDFDB.ModuleUtils.findByProperties("stickyHeader", "emptyStateText");
	DiscordClassModules.GifFavoriteButton = BDFDB.ModuleUtils.findByProperties("gifFavoriteButton", "showPulse");
	DiscordClassModules.GiftInventory = BDFDB.ModuleUtils.findByProperties("root", "body", "scroller");
	DiscordClassModules.GoLiveDetails = BDFDB.ModuleUtils.findByProperties("panel", "gameWrapper");
	DiscordClassModules.Guild = BDFDB.ModuleUtils.findByProperties("wrapper", "lowerBadge", "svg");
	DiscordClassModules.GuildChannels = BDFDB.ModuleUtils.findByProperties("positionedContainer", "unreadBar");
	DiscordClassModules.GuildDiscovery = BDFDB.ModuleUtils.findByProperties("pageWrapper", "guildCard");
	DiscordClassModules.GuildDm = BDFDB.ModuleUtils.find(m => typeof m.pill == "string" && Object.keys(m).length == 1);
	DiscordClassModules.GuildEdges = BDFDB.ModuleUtils.findByProperties("wrapper", "edge", "autoPointerEvents")
	DiscordClassModules.GuildFolder = BDFDB.ModuleUtils.findByProperties("folder", "expandedGuilds")
	DiscordClassModules.GuildHeader = BDFDB.ModuleUtils.findByProperties("header", "name", "bannerImage");
	DiscordClassModules.GuildHeaderButton = BDFDB.ModuleUtils.findByProperties("button", "open");
	DiscordClassModules.GuildIcon = BDFDB.ModuleUtils.findByProperties("acronym", "selected", "wrapper");
	DiscordClassModules.GuildInvite = BDFDB.ModuleUtils.findByProperties("wrapper", "guildIconJoined");
	DiscordClassModules.GuildSettingsBanned = BDFDB.ModuleUtils.findByProperties("bannedUser", "bannedUserAvatar");
	DiscordClassModules.GuildSettingsInvite = BDFDB.ModuleUtils.findByProperties("countdownColumn", "inviteSettingsInviteRow");
	DiscordClassModules.GuildSettingsMember = BDFDB.ModuleUtils.findByProperties("member", "membersFilterPopout");
	DiscordClassModules.GuildServer = BDFDB.ModuleUtils.findByProperties("blobContainer", "pill");
	DiscordClassModules.GuildsItems = BDFDB.ModuleUtils.findByProperties("guildSeparator", "guildsError");
	DiscordClassModules.GuildsWrapper = BDFDB.ModuleUtils.findByProperties("scrollerWrap", "unreadMentionsBar", "wrapper");
	DiscordClassModules.HeaderBar = BDFDB.ModuleUtils.findByProperties("container", "children", "toolbar");
	DiscordClassModules.HeaderBarExtras = BDFDB.ModuleUtils.findByProperties("headerBarLoggedOut", "search");
	DiscordClassModules.HeaderBarSearch = BDFDB.ModuleUtils.findByProperties("search", "searchBar", "open");
	DiscordClassModules.HeaderBarTopic = BDFDB.ModuleUtils.findByProperties("topic", "expandable", "content");
	DiscordClassModules.HomeIcon = BDFDB.ModuleUtils.findByProperties("homeIcon");
	DiscordClassModules.HotKeyRecorder = BDFDB.ModuleUtils.findByProperties("editIcon", "recording");
	DiscordClassModules.HoverCard = BDFDB.ModuleUtils.findByProperties("card", "active");
	DiscordClassModules.IconDirection = BDFDB.ModuleUtils.findByProperties("directionDown", "directionUp");
	DiscordClassModules.ImageWrapper = BDFDB.ModuleUtils.findByProperties("clickable", "imageWrapperBackground");
	DiscordClassModules.InviteModal = BDFDB.ModuleUtils.findByProperties("inviteRow", "modal");
	DiscordClassModules.Item = BDFDB.ModuleUtils.findByProperties("item", "side", "header");
	DiscordClassModules.ItemLayerContainer = BDFDB.ModuleUtils.findByProperties("layer", "layerContainer");
	DiscordClassModules.Input = BDFDB.ModuleUtils.findByProperties("inputMini", "inputDefault");
	DiscordClassModules.LayerModal = BDFDB.ModuleUtils.findByProperties("root", "small", "medium");
	DiscordClassModules.Layers = BDFDB.ModuleUtils.findByProperties("layer", "layers");
	DiscordClassModules.LiveTag = BDFDB.ModuleUtils.findByProperties("liveLarge", "live");
	DiscordClassModules.Margins = BDFDB.ModuleUtils.findByProperties("marginBottom4", "marginCenterHorz");
	DiscordClassModules.Member = BDFDB.ModuleUtils.findByProperties("member", "ownerIcon");
	DiscordClassModules.MembersWrap = BDFDB.ModuleUtils.findByProperties("membersWrap", "membersGroup");
	DiscordClassModules.Mention = BDFDB.ModuleUtils.findByProperties("wrapperHover", "wrapperNoHover");
	DiscordClassModules.Message = BDFDB.ModuleUtils.findByProperties("containerCozy", "content");
	DiscordClassModules.MessageAccessory = BDFDB.ModuleUtils.findByProperties("embedWrapper", "gifFavoriteButton");
	DiscordClassModules.MessageBody = BDFDB.ModuleUtils.findByProperties("buttonContainer", "isMentioned");
	DiscordClassModules.MessageElements = BDFDB.ModuleUtils.findByProperties("messageGroupBlockedBtn", "dividerRed");
	DiscordClassModules.MessageFile = BDFDB.ModuleUtils.findByProperties("cancelButton", "filenameLinkWrapper");
	DiscordClassModules.MessageMarkup = BDFDB.ModuleUtils.findByProperties("markup");
	DiscordClassModules.MessageOperations = BDFDB.ModuleUtils.find(m => typeof m.operations == "string" && Object.keys(m).length == 1);
	DiscordClassModules.MessageSystem = BDFDB.ModuleUtils.findByProperties("container", "actionAnchor");
	DiscordClassModules.MessagesPopout = BDFDB.ModuleUtils.findByProperties("messageGroupWrapperOffsetCorrection", "messagesPopout");
	DiscordClassModules.MessagesWelcome = BDFDB.ModuleUtils.findByProperties("welcomeMessage", "h1");
	DiscordClassModules.MessagesWrap = BDFDB.ModuleUtils.findByProperties("messagesWrapper", "messageGroupBlocked");
	DiscordClassModules.Modal = BDFDB.ModuleUtils.findByProperties("modal", "sizeLarge");
	DiscordClassModules.ModalDivider = BDFDB.ModuleUtils.find(m => typeof m.divider == "string" && Object.keys(m).length == 1);
	DiscordClassModules.ModalItems = BDFDB.ModuleUtils.findByProperties("guildName", "checkboxContainer");
	DiscordClassModules.ModalMiniContent = BDFDB.ModuleUtils.find(m => typeof m.modal == "string" && typeof m.content == "string" && typeof m.size == "string" && Object.keys(m).length == 3);
	DiscordClassModules.ModalWrap = BDFDB.ModuleUtils.find(m => typeof m.modal == "string" && typeof m.inner == "string" && Object.keys(m).length == 2);
	DiscordClassModules.NameContainer = DiscordClassModules.ContextMenu.subMenuContext ? BDFDB.ModuleUtils.findByProperties("nameAndDecorators", "name") : {};
	DiscordClassModules.NameTag = BDFDB.ModuleUtils.findByProperties("bot", "nameTag");
	DiscordClassModules.Note = BDFDB.ModuleUtils.find(m => typeof m.note == "string" && Object.keys(m).length == 1);
	DiscordClassModules.Notice = BDFDB.ModuleUtils.findByProperties("notice", "noticeFacebook");
	DiscordClassModules.OptionPopout = BDFDB.ModuleUtils.findByProperties("container", "button", "item");
	DiscordClassModules.PictureInPicture = BDFDB.ModuleUtils.findByProperties("pictureInPicture", "pictureInPictureWindow");
	DiscordClassModules.PillWrapper = BDFDB.ModuleUtils.find(m => typeof m.item == "string" && typeof m.wrapper == "string" && Object.keys(m).length == 2);
	DiscordClassModules.PrivateChannel = BDFDB.ModuleUtils.findByProperties("channel", "closeButton");
	DiscordClassModules.PrivateChannelList = BDFDB.ModuleUtils.findByProperties("privateChannels", "searchBar");
	DiscordClassModules.Popout = BDFDB.ModuleUtils.findByProperties("popout", "arrowAlignmentTop");
	DiscordClassModules.PopoutActivity = BDFDB.ModuleUtils.findByProperties("ellipsis", "activityActivityFeed");
	DiscordClassModules.QuickMessage = BDFDB.ModuleUtils.findByProperties("quickMessage", "isBlocked");
	DiscordClassModules.QuickSelect = BDFDB.ModuleUtils.findByProperties("quickSelectArrow", "selected");
	DiscordClassModules.QuickSwitch = BDFDB.ModuleUtils.findByProperties("resultFocused", "guildIconContainer");
	DiscordClassModules.QuickSwitchWrap = BDFDB.ModuleUtils.findByProperties("container", "miscContainer");
	DiscordClassModules.Reactions = BDFDB.ModuleUtils.findByProperties("reactionBtn", "reaction");
	DiscordClassModules.RecentMentions = BDFDB.ModuleUtils.findByProperties("recentMentionsFilterPopout", "mentionFilter");
	DiscordClassModules.Role = BDFDB.ModuleUtils.findByProperties("roleCircle", "roleName");
	DiscordClassModules.Scrollbar = BDFDB.ModuleUtils.findByProperties("scrollbar", "scrollbarGhost");
	DiscordClassModules.Scroller = BDFDB.ModuleUtils.findByProperties("firefoxFixScrollFlex", "scroller");
	DiscordClassModules.SearchBar = BDFDB.ModuleUtils.findByProperties("container", "clear");
	DiscordClassModules.SearchPopout = BDFDB.ModuleUtils.findByProperties("datePicker", "searchResultChannelIconBackground");
	DiscordClassModules.SearchPopoutWrap = BDFDB.ModuleUtils.findByProperties("container", "queryContainer");
	DiscordClassModules.SearchResults = BDFDB.ModuleUtils.findByProperties("resultsWrapper", "searchResults");
	DiscordClassModules.Select = BDFDB.ModuleUtils.findByProperties("select", "error", "errorMessage");
	DiscordClassModules.SettingsCloseButton = BDFDB.ModuleUtils.findByProperties("closeButton", "keybind");
	DiscordClassModules.SettingsItems = BDFDB.ModuleUtils.findByProperties("dividerMini", "note");
	DiscordClassModules.SettingsTable = BDFDB.ModuleUtils.findByProperties("headerOption", "headerSize");
	DiscordClassModules.SettingsWindow = BDFDB.ModuleUtils.findByProperties("contentRegion", "standardSidebarView");
	DiscordClassModules.Slider = BDFDB.ModuleUtils.findByProperties("slider", "grabber");
	DiscordClassModules.Spoiler = BDFDB.ModuleUtils.findByProperties("spoilerContainer", "hidden");
	DiscordClassModules.Switch = BDFDB.ModuleUtils.findByProperties("switchDisabled", "valueChecked");
	DiscordClassModules.Table = BDFDB.ModuleUtils.findByProperties("stickyHeader", "sortIcon");
	DiscordClassModules.Text = BDFDB.ModuleUtils.findByProperties("defaultColor", "defaultMarginh1");
	DiscordClassModules.TextColor = BDFDB.ModuleUtils.findByProperties("colorStandard", "colorMuted", "colorError");
	DiscordClassModules.TextColor2 = BDFDB.ModuleUtils.findByProperties("base", "muted", "wrapper");
	DiscordClassModules.TextSize = BDFDB.ModuleUtils.findByProperties("size10", "size14", "size20");
	DiscordClassModules.TextStyle = BDFDB.ModuleUtils.findByProperties("large", "primary", "selectable");
	DiscordClassModules.Tip = BDFDB.ModuleUtils.findByProperties("pro", "inline");
	DiscordClassModules.Title = BDFDB.ModuleUtils.findByProperties("title", "size18");
	DiscordClassModules.TitleBar = BDFDB.ModuleUtils.findByProperties("titleBar", "wordmark");
	DiscordClassModules.Tooltip = BDFDB.ModuleUtils.findByProperties("tooltip", "tooltipTop");
	DiscordClassModules.Typing = BDFDB.ModuleUtils.findByProperties("cooldownWrapper", "typing");
	DiscordClassModules.UnreadBar = BDFDB.ModuleUtils.findByProperties("active", "bar", "unread");
	DiscordClassModules.UserPopout = BDFDB.ModuleUtils.findByProperties("userPopout", "headerPlaying");
	DiscordClassModules.UserProfile = BDFDB.ModuleUtils.findByProperties("topSectionNormal", "tabBarContainer");
	DiscordClassModules.Video = BDFDB.ModuleUtils.findByProperties("video", "fullScreen");
	DiscordClassModules.VoiceChannel = BDFDB.ModuleUtils.findByProperties("avatarSpeaking", "voiceUser");
	DiscordClassModules.VoiceChannelList = BDFDB.ModuleUtils.findByProperties("list", "collapsed");
	DiscordClassModules.VoiceDetails = BDFDB.ModuleUtils.findByProperties("container", "customStatusContainer");
	DiscordClassModules.VoiceDetailsPing = BDFDB.ModuleUtils.findByProperties("rtcConnectionQualityBad", "rtcConnectionQualityFine");
	BDFDB.DiscordClassModules = Object.assign({}, DiscordClassModules);

	var DiscordClasses = {
		_bdguild: ["BDrepo", "bdGuild"],
		_bdguildanimatable: ["BDrepo", "bdGuildAnimatable"],
		_bdguildaudio: ["BDrepo", "bdGuildAudio"],
		_bdguildselected: ["BDrepo", "bdGuildSelected"],
		_bdguildseparator: ["BDrepo", "bdGuildSeparator"],
		_bdguildunread: ["BDrepo", "bdGuildUnread"],
		_bdguildvideo: ["BDrepo", "bdGuildVideo"],
		_bdpillselected: ["BDrepo", "bdPillSelected"],
		_bdpillunread: ["BDrepo", "bdPillUnread"],
		_bdv2button: ["BDv2repo", "bdButton"],
		_bdv2card: ["BDv2repo", "bdCard"],
		_bdv2hastooltip: ["BDv2repo", "bdHasTooltip"],
		_bdv2materialdesignicon: ["BDv2repo", "bdMaterialDesignIcon"],
		_bdv2tooltipopen: ["BDv2repo", "vTooltipOpen"],
		_repoauthor: ["BDrepo", "bdaAuthor"],
		_repocheckbox: ["BDrepo", "switchCheckbox"],
		_repocheckboxchecked: ["BDrepo", "switchChecked"],
		_repocheckboxinner: ["BDrepo", "switch"],
		_repocheckboxitem: ["BDrepo", "switchItem"],
		_repocheckboxwrap: ["BDrepo", "switchWrapper"],
		_repocontrols: ["BDrepo", "bdaControls"],
		_repodescription: ["BDrepo", "bdaDescription"],
		_repodescriptionwrap: ["BDrepo", "bdaDescriptionWrap"],
		_repofolderbutton: ["BDrepo", "bdPfbtn"],
		_repofooter: ["BDrepo", "bdaFooter"],
		_repoheader: ["BDrepo", "bdaHeader"],
		_repoheadertitle: ["BDrepo", "bdaHeaderTitle"],
		_repolist: ["BDrepo", "bdaSlist"],
		_repolink: ["BDrepo", "bdaLink"],
		_repolinks: ["BDrepo", "bdaLinks"],
		_reponame: ["BDrepo", "bdaName"],
		_reposettingsbutton: ["BDrepo", "bdaSettingsButton"],
		_reposettingsopen: ["BDrepo", "settingsOpen"],
		_reposettingsclosed: ["BDrepo", "settingsClosed"],
		_repoversion: ["BDrepo", "bdaVersion"],
		accountinfo: ["AccountDetails", "container"],
		accountinfoavatar: ["AccountDetails", "avatar"],
		accountinfoavatarwrapper: ["AccountDetails", "avatarWrapper"],
		accountinfobutton: ["AccountDetailsButtons", "button"],
		accountinfobuttondisabled: ["AccountDetailsButtons", "disabled"],
		accountinfobuttonenabled: ["AccountDetailsButtons", "enabled"],
		accountinfodetails: ["AccountDetails", "usernameContainer"],
		accountinfonametag: ["AccountDetails", "nameTag"],
		activityfeed: ["ActivityFeed", "activityFeed"],
		alignbaseline: ["Flex", "alignBaseline"],
		aligncenter: ["Flex", "alignCenter"],
		alignend: ["Flex", "alignEnd"],
		alignstart: ["Flex", "alignStart"],
		alignstretch: ["Flex", "alignStretch"],
		anchor: ["Anchor", "anchor"],
		anchorunderlineonhover: ["Anchor", "anchorUnderlineOnHover"],
		animationcontainerbottom: ["AnimationContainer", "animatorBottom"],
		animationcontainerleft: ["AnimationContainer", "animatorLeft"],
		animationcontainerright: ["AnimationContainer", "animatorRight"],
		animationcontainertop: ["AnimationContainer", "animatorTop"],
		animationcontainerrender: ["AnimationContainer", "didRender"],
		animationcontainerscale: ["AnimationContainer", "scale"],
		animationcontainertranslate: ["AnimationContainer", "translate"],
		app: ["AppOuter", "app"],
		appcontainer: ["AppBase", "container"],
		appmount: ["AppMount", "appMount"],
		applayers: ["AppInner", "layers"],
		applicationstore: ["ApplicationStore", "applicationStore"],
		appold: ["AppInner", "app"],
		auditlog: ["AuditLog", "auditLog"],
		auditloguserhook: ["AuditLog", "userHook"],
		authbox: ["AuthBox", "authBox"],
		autocomplete: ["Autocomplete", "autocomplete"],
		autocomplete2: ["ChannelTextArea", "autocomplete"],
		autocompletecontent: ["Autocomplete", "content"],
		autocompletecontenttitle: ["Autocomplete", "contentTitle"],
		autocompletedescription: ["Autocomplete", "description"],
		autocompletedescriptiondiscriminator: ["Autocomplete", "descriptionDiscriminator"],
		autocompletedescriptionusername: ["Autocomplete", "descriptionUsername"],
		autocompleteicon: ["Autocomplete", "icon"],
		autocompleteiconforeground: ["Autocomplete", "iconForeground"],
		autocompleteinner: ["Autocomplete", "autocompleteInner"],
		autocompleterow: ["Autocomplete", "autocompleteRow"],
		autocompleterowhorizontal: ["Autocomplete", "autocompleteRowHorizontal"],
		autocompleterowvertical: ["Autocomplete", "autocompleteRowVertical"],
		autocompleteselectable: ["Autocomplete", "selectable"],
		autocompleteselected: ["Autocomplete", "selectorSelected"],
		autocompleteselector: ["Autocomplete", "selector"],
		avatar: ["Avatar", "avatar"],
		avatarcursordefault: ["Avatar", "cursorDefault"],
		avataricon: ["AvatarIcon", "icon"],
		avatariconactivelarge: ["AvatarIcon", "iconActiveLarge"],
		avatariconactivemedium: ["AvatarIcon", "iconActiveMedium"],
		avatariconactivemini: ["AvatarIcon", "iconActiveMini"],
		avatariconactivesmall: ["AvatarIcon", "iconActiveSmall"],
		avatariconactivexlarge: ["AvatarIcon", "iconActiveXLarge"],
		avatariconinactive: ["AvatarIcon", "iconInactive"],
		avatariconsizelarge: ["AvatarIcon", "iconSizeLarge"],
		avatariconsizemedium: ["AvatarIcon", "iconSizeMedium"],
		avatariconsizemini: ["AvatarIcon", "iconSizeMini"],
		avatariconsizesmol: ["AvatarIcon", "iconSizeSmol"],
		avatariconsizesmall: ["AvatarIcon", "iconSizeSmall"],
		avatariconsizexlarge: ["AvatarIcon", "iconSizeXLarge"],
		avatarmask: ["Avatar", "mask"],
		avatarnoicon: ["AvatarIcon", "noIcon"],
		avatarpointer: ["Avatar", "pointer"],
		avatarpointerevents: ["Avatar", "pointerEvents"],
		avatarwrapper: ["Avatar", "wrapper"],
		backdrop: ["Backdrop", "backdrop"],
		badgewrapper: ["NotFound", "badgeWrapper"],
		bottag: ["BotTag", "botTag"],
		bottaginvert: ["BotTag", "botTagInvert"],
		bottagmember: ["Member", "botTag"],
		bottagmessage: ["Message", "botTag"],
		bottagmessagecompact: ["Message", "botTagCompact"],
		bottagmessagecozy: ["Message", "botTagCozy"],
		bottagnametag: ["NameTag", "bot"],
		bottagregular: ["BotTag", "botTagRegular"],
		button: ["Button", "button"],
		buttoncolorblack: ["Button", "colorBlack"],
		buttoncolorbrand: ["Button", "colorBrand"],
		buttoncolorgreen: ["Button", "colorGreen"],
		buttoncolorgrey: ["Button", "colorGrey"],
		buttoncolorlink: ["Button", "colorLink"],
		buttoncolorprimary: ["Button", "colorPrimary"],
		buttoncolorred: ["Button", "colorRed"],
		buttoncolortransparent: ["Button", "colorTransparent"],
		buttoncolorwhite: ["Button", "colorWhite"],
		buttoncoloryellow: ["Button", "colorYellow"],
		buttoncontents: ["Button", "contents"],
		buttondisabledoverlay: ["Button", "disabledButtonOverlay"],
		buttondisabledwrapper: ["Button", "disabledButtonWrapper"],
		buttonfullwidth: ["Button", "fullWidth"],
		buttongrow: ["Button", "grow"],
		buttonhashover: ["Button", "hasHover"],
		buttonhoverblack: ["Button", "hoverBlack"],
		buttonhoverbrand: ["Button", "hoverBrand"],
		buttonhovergreen: ["Button", "hoverGreen"],
		buttonhovergrey: ["Button", "hoverGrey"],
		buttonhoverlink: ["Button", "hoverLink"],
		buttonhoverprimary: ["Button", "hoverPrimary"],
		buttonhoverred: ["Button", "hoverRed"],
		buttonhovertransparent: ["Button", "hoverTransparent"],
		buttonhoverwhite: ["Button", "hoverWhite"],
		buttonhoveryellow: ["Button", "hoverYellow"],
		buttonlookblank: ["Button", "lookBlank"],
		buttonlookfilled: ["Button", "lookFilled"],
		buttonlookghost: ["Button", "lookGhost"],
		buttonlookinverted: ["Button", "lookInverted"],
		buttonlooklink: ["Button", "lookLink"],
		buttonlookoutlined: ["Button", "lookOutlined"],
		buttonsizeicon: ["Button", "sizeIcon"],
		buttonsizelarge: ["Button", "sizeLarge"],
		buttonsizemax: ["Button", "sizeMax"],
		buttonsizemedium: ["Button", "sizeMedium"],
		buttonsizemin: ["Button", "sizeMin"],
		buttonsizesmall: ["Button", "sizeSmall"],
		buttonsizexlarge: ["Button", "sizeXlarge"],
		buttonspinner: ["Button", "spinner"],
		buttonspinneritem: ["Button", "spinnerItem"],
		buttonsubmitting: ["Button", "submitting"],
		callavatarvideo: ["Call", "callAvatarVideo"],
		callavatarvoice: ["Call", "callAvatarVoice"],
		callavatarwrapper: ["Call", "callAvatarWrapper"],
		callcurrentcontainer: ["CallCurrent", "wrapper"],
		callcurrentdetails: ["CallDetails", "container"],
		callcurrentvideo: ["Video", "video"],
		callincoming: ["CallIncoming", "incomingCall"],
		callincomingcontainer: ["CallIncoming", "container"],
		callincominginner: ["CallIncomingInner", "incomingCallInner"],
		callmembers: ["CallIncomingInner", "members"],
		callselected: ["Call", "selected"],
		callvideo: ["Call", "video"],
		card: ["Card", "card"],
		cardbrand: ["Card", "cardBrand"],
		cardbrandoutline: ["Card", "cardBrandOutline"],
		carddanger: ["Card", "cardDanger"],
		carddangeroutline: ["Card", "cardDangerOutline"],
		cardprimary: ["Card", "cardPrimary"],
		cardprimaryeditable: ["Card", "cardPrimaryEditable"],
		cardprimaryoutline: ["Card", "cardPrimaryOutline"],
		cardprimaryoutlineeditable: ["Card", "cardPrimaryOutlineEditable"],
		cardstore: ["CardStore", "card"],
		cardstoreinteractive: ["CardStore", "interactive"],
		cardsuccess: ["Card", "cardSuccess"],
		cardsuccessoutline: ["Card", "cardSuccessOutline"],
		cardwarning: ["Card", "cardWarning"],
		cardwarningoutline: ["Card", "cardWarningOutline"],
		categoryaddbutton: ["CategoryContainer", "addButton"],
		categoryaddbuttonicon: ["CategoryContainer", "addButtonIcon"],
		categorychildren: ["Category", "children"],
		categoryclickable: ["Category", "clickable"],
		categorycollapsed: ["Category", "collapsed"],
		categorycontainerdefault: ["CategoryContainer", "containerDefault"],
		categoryforcevisible: ["CategoryContainer", "forceVisible"],
		categoryicon: ["Category", "icon"],
		categoryiconvisibility: ["CategoryContainer", "iconVisibility"],
		categorymuted: ["Category", "muted"],
		categoryname: ["Category", "name"],
		categorywrapper: ["Category", "wrapper"],
		changelogadded: ["ChangeLog", "added"],
		changelogcontainer: ["ChangeLog", "container"],
		changelogfixed: ["ChangeLog", "fixed"],
		changelogimproved: ["ChangeLog", "improved"],
		changelogprogress: ["ChangeLog", "added"],
		changelogtitle: ["ChangeLog", "title"],
		channelactionicon: ["ChannelContainer", "actionIcon"],
		channelchildicon: ["ChannelContainer", "iconItem"],
		channelchildiconbase: ["ChannelContainer", "iconBase"],
		channelchildren: ["Channel", "children"],
		channelcontainerdefault: ["ChannelContainer", "containerDefault"],
		channelcontent: ["Channel", "content"],
		channeldisabled: ["ChannelContainer", "disabled"],
		channelheaderchannelname: ["ChatWindow", "channelName"],
		channelheaderchildren: ["HeaderBar", "children"],
		channelheaderdivider: ["HeaderBar", "divider"],
		channelheaderheaderbar: ["HeaderBar", "container"],
		channelheaderheaderbarthemed: ["HeaderBar", "themed"],
		channelheaderheaderbartitle: ["HeaderBar", "title"],
		channelheadericon: ["HeaderBar", "icon"],
		channelheadericonbadge: ["HeaderBar", "iconBadge"],
		channelheadericonclickable: ["HeaderBar", "clickable"],
		channelheadericonselected: ["HeaderBar", "selected"],
		channelheadericonwrapper: ["HeaderBar", "iconWrapper"],
		channelheadertitle: ["ChatWindow", "title"],
		channelheadertitlewrapper: ["ChatWindow", "titleWrapper"],
		channelheadersearch: ["HeaderBarExtras", "search"],
		channelheadersearchbar: ["HeaderBarSearch", "searchBar"],
		channelheadersearchicon: ["HeaderBarSearch", "icon"],
		channelheadersearchinner: ["HeaderBarSearch", "search"],
		channelheadertoolbar: ["HeaderBar", "toolbar"],
		channelheadertoolbar2: ["HeaderBarExtras", "toolbar"],
		channelheadertopic: ["HeaderBarTopic", "topic"],
		channelheadertopicexpandable: ["HeaderBarTopic", "expandable"],
		channelicon: ["Channel", "icon"],
		channeliconvisibility: ["ChannelContainer", "iconVisibility"],
		channelmentionsbadge: ["ChannelContainer", "mentionsBadge"],
		channelmodeconnected: ["Channel", "modeConnected"],
		channelmodelocked: ["Channel", "modeLocked"],
		channelmodemuted: ["Channel", "modeMuted"],
		channelmodeselected: ["Channel", "modeSelected"],
		channelmodeunread: ["Channel", "modeUnread"],
		channelname: ["Channel", "name"],
		channelpanel: ["AppBase", "activityPanel"],
		channelpaneltitle: ["NotFound", "channelPanelTitle"],
		channelpanels: ["AppBase", "panels"],
		channels: ["AppBase", "sidebar"],
		channelselected: ["ChannelContainer", "selected"],
		channelsscroller: ["GuildChannels", "scroller"],
		channelsunreadbar: ["GuildChannels", "unreadBar"],
		channelsunreadbarcontainer: ["GuildChannels", "positionedContainer"],
		channelsunreadbarbottom: ["GuildChannels", "unreadBottom"],
		channelsunreadbarunread: ["GuildChannels", "unread"],
		channelsunreadbartop: ["GuildChannels", "unreadTop"],
		channelunread: ["Channel", "unread"],
		channeluserlimit: ["ChannelLimit", "wrapper"],
		channeluserlimitcontainer: ["ChannelContainer", "userLimit"],
		channeluserlimittotal: ["ChannelLimit", "total"],
		channeluserlimitusers: ["ChannelLimit", "users"],
		channelwrapper: ["Channel", "wrapper"],
		charcounter: ["BDFDB", "charCounter"],
		chat: ["ChatWindow", "chat"],
		chatbase: ["AppBase", "base"],
		chatcontent: ["ChatWindow", "chatContent"],
		chatform: ["ChatWindow", "form"],
		chatinner: ["ChatWindow", "content"],
		chatspacer: ["AppBase", "content"],
		checkbox: ["Checkbox", "checkbox"],
		checkboxchecked: ["Checkbox", "checked"],
		checkboxcontainer: ["ModalItems", "checkboxContainer"],
		checkboxinput: ["Checkbox", "input"],
		checkboxinputdefault: ["Checkbox", "inputDefault"],
		checkboxinputdisabled: ["Checkbox", "inputDisabled"],
		checkboxround: ["Checkbox", "round"],
		checkboxwrapper: ["Checkbox", "checkboxWrapper"],
		checkboxwrapperdisabled: ["Checkbox", "checkboxWrapperDisabled"],
		clickable: ["Message", "clickOverride"],
		collapsecontainer: ["BDFDB", "collapseContainer"],
		collapsecontainerarrow: ["BDFDB", "collapseContainerArrow"],
		collapsecontainercollapsed: ["BDFDB", "collapseContainerCollapsed"],
		collapsecontainerheader: ["BDFDB", "collapseContainerHeader"],
		collapsecontainerinner: ["BDFDB", "collapseContainerInner"],
		collapsecontainertitle: ["BDFDB", "collapseContainerTitle"],
		colorbase: ["TextColor2", "base"],
		colorerror: ["TextColor", "colorError"],
		colormuted: ["TextColor", "colorMuted"],
		colormuted2: ["TextColor2", "muted"],
		colorpicker: ["ColorPicker", "colorPickerCustom"],
		colorpickerhexinput: ["ColorPicker", "customColorPickerInput"],
		colorpickerhue: ["ColorPickerInner", "hue"],
		colorpickerinner: ["ColorPickerInner", "wrapper"],
		colorpickerrow: ["ColorPicker", "colorPickerRow"],
		colorpickersaturation: ["ColorPickerInner", "saturation"],
		colorpickerswatch: ["ColorPicker", "colorPickerSwatch"],
		colorpickerswatches: ["BDFDB", "colorPickerSwatches"],
		colorpickerswatchesdisabled: ["BDFDB", "colorPickerSwatchesDisabled"],
		colorpickerswatchcustom: ["ColorPicker", "custom"],
		colorpickerswatchdefault: ["ColorPicker", "default"],
		colorpickerswatchdisabled: ["ColorPicker", "disabled"],
		colorpickerswatchdropper: ["ColorPicker", "colorPickerDropper"],
		colorpickerswatchdropperfg: ["ColorPicker", "colorPickerDropperFg"],
		colorpickerswatchnocolor: ["ColorPicker", "noColor"],
		colorpickerswatchselected: ["BDFDB", "colorPickerSwatchSelected"],
		colorpickerswatchsingle: ["BDFDB", "colorPickerSwatchSingle"],
		colorstandard: ["TextColor", "colorStandard"],
		contentcolumn: ["SettingsWindow", "contentColumn"],
		contentregion: ["SettingsWindow", "contentRegion"],
		contextmenu: ["ContextMenu", "contextMenu"],
		contextmenucheckbox: ["ContextMenuCheckbox", "checkbox"],
		contextmenucheckbox2: ["ContextMenu", "checkbox"],
		contextmenucheckboxdisabled: ["ContextMenuCheckbox", "disabled"],
		contextmenucheckboxinner: ["ContextMenuCheckbox", "checkboxInner"],
		contextmenucheckboxelement: ["ContextMenuCheckbox", "checkboxElement"],
		contextmenuhint: ["ContextMenu", "hint"],
		contextmenuitem: ["ContextMenu", "item"],
		contextmenuitembrand: ["ContextMenu", "brand"],
		contextmenuitemclickable: ["ContextMenu", "clickable"],
		contextmenuitemdanger: ["ContextMenu", "danger"],
		contextmenuitemdisabled: ["ContextMenu", "disabled"],
		contextmenuitemgroup: ["ContextMenu", "itemGroup"],
		contextmenuitemtoggle: ["ContextMenu", "itemToggle"],
		contextmenuitemselected: ["ContextMenu", "selected"],
		contextmenuitemslider: ["ContextMenu", "itemSlider"],
		contextmenuitemsubmenu: ["ContextMenu", "itemSubMenu"],
		contextmenuitemsubmenucaret: ["ContextMenu", "caret"],
		contextmenulabel: ["ContextMenu", "label"],
		contextmenuscroller: ["ContextMenu", "scroller"],
		contextmenuslider: ["ContextMenu", "slider"],
		contextmenusubcontext: ["ContextMenu", "subMenuContext"],
		cooldownwrapper: ["Typing", "cooldownWrapper"],
		cursordefault: ["Cursor", "cursorDefault"],
		cursorpointer: ["Cursor", "cursorPointer"],
		customstatus: ["CustomStatus", "customStatus"],
		customstatuscontenticon: ["CustomStatus", "customStatusContentIcon"],
		customstatusemoji: ["CustomStatusIcon", "emoji"],
		customstatusicon: ["CustomStatusIcon", "icon"],
		defaultcolor: ["Text", "defaultColor"],
		description: ["FormText", "description"],
		directioncolumn: ["Flex", "directionColumn"],
		directiondown: ["IconDirection", "directionDown"],
		directionleft: ["IconDirection", "directionLeft"],
		directionright: ["IconDirection", "directionRight"],
		directionrow: ["Flex", "directionRow"],
		directionrowreverse: ["Flex", "directionRowReverse"],
		directionup: ["IconDirection", "directionUp"],
		directiontransition: ["IconDirection", "transition"],
		disabled: ["SettingsItems", "disabled"],
		discriminator: ["NameTag", "discriminator"],
		divider: ["ModalDivider", "divider"],
		dividerdefault: ["SettingsItems", "dividerDefault"],
		dividermini: ["SettingsItems", "dividerMini"],
		modaldivider: ["ModalDivider", "divider"], // REMOVE
		modaldividerdefault: ["SettingsItems", "dividerDefault"], // REMOVE
		modaldividermini: ["SettingsItems", "dividerMini"], // REMOVE
		dmchannel: ["PrivateChannel", "channel"],
		dmchannelactivity: ["PrivateChannel", "activity"],
		dmchannelactivityemoji: ["PrivateChannel", "activityEmoji"],
		dmchannelactivitytext: ["PrivateChannel", "activityText"],
		dmchannelclose: ["PrivateChannel", "closeButton"],
		dmchannelheader: ["PrivateChannelList", "header"],
		dmchannels: ["PrivateChannelList", "privateChannels"],
		dmpill: ["GuildDm", "pill"],
		downloadlink: ["DownloadLink", "downloadLink"],
		ellipsis: ["PopoutActivity", "ellipsis"],
		embed: ["Embed", "embed"],
		embedauthor: ["Embed", "embedAuthor"],
		embedauthoricon: ["Embed", "embedAuthorIcon"],
		embedauthorname: ["Embed", "embedAuthorName"],
		embedauthornamelink: ["Embed", "embedAuthorNameLink"],
		embedcentercontent: ["Embed", "centerContent"],
		embeddescription: ["Embed", "embedDescription"],
		embedfield: ["Embed", "embedField"],
		embedfieldname: ["Embed", "embedFieldName"],
		embedfields: ["Embed", "embedFields"],
		embedfieldvalue: ["Embed", "embedFieldValue"],
		embedfooter: ["Embed", "embedFooter"],
		embedfootericon: ["Embed", "embedFooterIcon"],
		embedfooterseparator: ["Embed", "embedFooterSeparator"],
		embedfootertext: ["Embed", "embedFooterText"],
		embedfull: ["Embed", "embedFull"],
		embedgiftag: ["Embed", "embedGIFTag"],
		embedgrid: ["Embed", "grid"],
		embedhasthumbnail: ["Embed", "hasThumbnail"],
		embedhiddenspoiler: ["Embed", "hiddenSpoiler"],
		embedhighbackgroundopacity: ["Embed", "highBackgroundOpacity"],
		embediframe: ["Embed", "embedIframe"],
		embedimage: ["Embed", "embedImage"],
		embedinner: ["Embed", "embedInner"],
		embedlink: ["Embed", "embedLink"],
		embedlowbackgroundopacity: ["Embed", "lowBackgroundOpacity"],
		embedmargin: ["Embed", "embedMargin"],
		embedmedia: ["Embed", "embedMedia"],
		embedmediumbackgroundopacity: ["Embed", "mediumBackgroundOpacity"],
		embedprovider: ["Embed", "embedProvider"],
		embedspoilerattachment: ["Embed", "spoilerAttachment"],
		embedspoilerembed: ["Embed", "spoilerEmbed"],
		embedspotify: ["Embed", "embedSpotify"],
		embedthumbnail: ["Embed", "embedThumbnail"],
		embedtitle: ["Embed", "embedTitle"],
		embedtitlelink: ["Embed", "embedTitleLink"],
		embedvideo: ["Embed", "embedVideo"],
		embedvideoaction: ["Embed", "embedVideoAction"],
		embedvideoactions: ["Embed", "embedVideoActions"],
		embedvideoimagecomponent: ["Embed", "embedVideoImageComponent"],
		embedvideoimagecomponentinner: ["Embed", "embedVideoImageComponentInner"],
		embedwrapper: ["MessageAccessory", "embedWrapper"],
		emoji: ["Emoji", "emoji"],
		emojiold: ["NotFound", "emoji"],
		emojibutton: ["EmojiButton", "emojiButton"],
		emojibuttonhovered: ["EmojiButton", "emojiButtonHovered"],
		emojibuttonnormal: ["EmojiButton", "emojiButtonNormal"],
		emojibuttonsprite: ["EmojiButton", "sprite"],
		emojipicker: ["EmojiPicker", "emojiPicker"],
		emojipickeractivity: ["EmojiPicker", "activity"],
		emojipickerbutton: ["Reactions", "reactionBtn"],
		emojipickercategories: ["EmojiPicker", "categories"],
		emojipickercategory: ["EmojiPicker", "category"],
		emojipickercustom: ["EmojiPicker", "custom"],
		emojipickerdimmer: ["EmojiPicker", "dimmer"],
		emojipickerdisabled: ["EmojiPicker", "disabled"],
		emojipickerdiversityselector: ["EmojiPicker", "diversitySelector"],
		emojipickeremojiitem: ["EmojiPicker", "emojiItem"],
		emojipickerflags: ["EmojiPicker", "flags"],
		emojipickerfood: ["EmojiPicker", "food"],
		emojipickerheader: ["EmojiPicker", "header"],
		emojipickeritem: ["EmojiPicker", "item"],
		emojipickernature: ["EmojiPicker", "nature"],
		emojipickerobjects: ["EmojiPicker", "objects"],
		emojipickerpeople: ["EmojiPicker", "people"],
		emojipickerpopout: ["EmojiPicker", "popout"],
		emojipickerpremiumpromo: ["EmojiPicker", "premiumPromo"],
		emojipickerpremiumpromoclose: ["EmojiPicker", "premiumPromoClose"],
		emojipickerpremiumpromodescription: ["EmojiPicker", "premiumPromoDescription"],
		emojipickerpremiumpromoimage: ["EmojiPicker", "premiumPromoImage"],
		emojipickerpremiumpromotitle: ["EmojiPicker", "premiumPromoTitle"],
		emojipickerrecent: ["EmojiPicker", "recent"],
		emojipickerrow: ["EmojiPicker", "row"],
		emojipickersearchbar: ["EmojiPicker", "searchBar"],
		emojipickerscroller: ["EmojiPicker", "scroller"],
		emojipickerscrollerwrap: ["EmojiPicker", "scrollerWrap"],
		emojipickerselected: ["EmojiPicker", "selected"],
		emojipickerspriteitem: ["EmojiPicker", "spriteItem"],
		emojipickerstickyheader: ["EmojiPicker", "stickyHeader"],
		emojipickersymbols: ["EmojiPicker", "symbols"],
		emojipickertravel: ["EmojiPicker", "travel"],
		emojipickervisible: ["EmojiPicker", "visible"],
		favbuttoncontainer: ["BDFDB", "favButtonContainer"],
		fileattachment: ["File", "attachment"],
		fileattachmentinner: ["File", "attachmentInner"],
		filecancelbutton: ["File", "cancelButton"],
		filedownloadbutton: ["File", "downloadButton"],
		filename: ["File", "filename"],
		filenamelink: ["File", "fileNameLink"],
		filenamelinkwrapper: ["File", "filenameLinkWrapper"],
		filenamewrapper: ["File", "filenameWrapper"],
		flex: ["FlexChild", "flex"],
		flex2: ["Flex", "flex"],
		flexcenter: ["Flex", "flexCenter"],
		flexchild: ["FlexChild", "flexChild"],
		flexmarginreset: ["FlexChild", "flexMarginReset"],
		flexspacer: ["Flex", "spacer"],
		flowerstar: ["FlowerStar", "flowerStar"],
		flowerstarchild: ["FlowerStar", "childContainer"],
		flowerstarcontainer: ["FlowerStar", "flowerStarContainer"],
		formtext: ["FormText", "formText"],
		friends: ["Friends", "container"],
		friendscolumn: ["Friends", "friendsColumn"],
		friendscolumnnamewrap: ["Friends", "friendsColumnName"],
		friendsrow: ["Friends", "friendsRow"],
		friendstable: ["Friends", "friendsTable"],
		friendstableheader: ["Friends", "friendsTableHeader"],
		friendsusername: ["Friends", "username"],
		game: ["Game", "game"],
		gameicon: ["GameIcon", "gameIcon"],
		gameiconlarge: ["GameIcon", "large"],
		gameiconmedium: ["GameIcon", "medium"],
		gameiconsmall: ["GameIcon", "small"],
		gameiconxsmall: ["GameIcon", "xsmall"],
		gamelibrary: ["GameLibrary", "gameLibrary"],
		gamelibrarytable: ["GameLibraryTable", "table"],
		gamelibrarytableheader: ["GameLibraryTable", "header"],
		gamelibrarytableheadercell: ["GameLibraryTable", "headerCell"],
		gamelibrarytableheadercellsorted: ["GameLibraryTable", "headerCellSorted"],
		gamelibrarytablerow: ["GameLibraryTable", "row"],
		gamelibrarytablerowwrapper: ["GameLibraryTable", "rowWrapper"],
		gamelibrarytablestickyheader: ["GameLibraryTable", "stickyHeader"],
		gamename: ["Game", "gameName"],
		gamenameinput: ["Game", "gameNameInput"],
		giffavoritebutton: ["MessageAccessory", "gifFavoriteButton"],
		giffavoritecolor: ["GifFavoriteButton", "gifFavoriteButton"],
		giffavoriteicon: ["GifFavoriteButton", "icon"],
		giffavoriteshowpulse: ["GifFavoriteButton", "showPulse"],
		giffavoritesize: ["GifFavoriteButton", "size"],
		giffavoriteselected: ["GifFavoriteButton", "selected"],
		giftinventory: ["GiftInventory", "root"],
		goliveactions: ["GoLiveDetails", "actions"],
		golivebody: ["GoLiveDetails", "body"],
		goliveclickablegamewrapper: ["GoLiveDetails", "clickableGameWrapper"],
		golivegameicon: ["GoLiveDetails", "gameIcon"],
		golivegamename: ["GoLiveDetails", "gameName"],
		golivegamewrapper: ["GoLiveDetails", "gameWrapper"],
		goliveinfo: ["GoLiveDetails", "info"],
		golivepanel: ["GoLiveDetails", "panel"],
		green: ["TextStyle", "statusGreen"],
		grey: ["TextStyle", "statusGrey"],
		guild: ["BDFDB", "guild"],
		guildbadgebase: ["Badge", "base"],
		guildbadgeicon: ["Badge", "icon"],
		guildbadgeiconbadge: ["Badge", "iconBadge"],
		guildbadgeiconbadge2: ["GuildsItems", "iconBadge"],
		guildbadgenumberbadge: ["Badge", "numberBadge"],
		guildbadgetextbadge: ["Badge", "textBadge"],
		guildbuttoncontainer: ["GuildsItems", "circleButtonMask"],
		guildbuttoninner: ["GuildsItems", "circleIconButton"],
		guildbuttonicon: ["GuildsItems", "circleIcon"],
		guildbuttonpill: ["GuildsItems", "pill"],
		guildbuttonselected: ["GuildsItems", "selected"],
		guildchannels: ["NotFound", "guildChannels"],
		guildcontainer: ["GuildServer", "blobContainer"],
		guilddiscovery: ["GuildDiscovery", "pageWrapper"],
		guildedge: ["GuildEdges", "edge"],
		guildedgehalf: ["GuildEdges", "half"],
		guildedgehigher: ["GuildEdges", "higher"],
		guildedgemiddle: ["GuildEdges", "middle"],
		guildedgewrapper: ["GuildEdges", "wrapper"],
		guildserror: ["GuildsItems", "guildsError"],
		guildserrorinner: ["GuildsItems", "errorInner"],
		guildfolder: ["GuildFolder", "folder"],
		guildfolderexpandendbackground: ["GuildFolder", "expandedFolderBackground"],
		guildfolderexpandendbackgroundcollapsed: ["GuildFolder", "collapsed"],
		guildfolderexpandendbackgroundhover: ["GuildFolder", "hover"],
		guildfolderexpandedguilds: ["GuildFolder", "expandedGuilds"],
		guildfolderguildicon: ["GuildFolder", "guildIcon"],
		guildfoldericonwrapper: ["GuildFolder", "folderIconWrapper"],
		guildfoldericonwrapperclosed: ["GuildFolder", "closedFolderIconWrapper"],
		guildfoldericonwrapperexpanded: ["GuildFolder", "expandedFolderIconWrapper"],
		guildfolderwrapper: ["GuildFolder", "wrapper"],
		guildheader: ["GuildHeader", "container"],
		guildheaderbannerimage: ["GuildHeader", "bannerImage"],
		guildheaderbannerimagecontainer: ["GuildHeader", "animatedContainer"],
		guildheaderbannervisible: ["GuildHeader", "bannerVisible"],
		guildheaderbutton: ["GuildHeaderButton", "button"],
		guildheaderbuttonopen: ["GuildHeaderButton", "open"],
		guildheaderclickable: ["GuildHeader", "clickable"],
		guildheaderhasbanner: ["GuildHeader", "hasBanner"],
		guildheadericoncontainer: ["GuildHeader", "guildIconContainer"],
		guildheadericonbgtiernone: ["GuildHeader", "iconBackgroundTierNone"],
		guildheadericonbgtierone: ["GuildHeader", "iconBackgroundTierOne"],
		guildheadericonbgtierthree: ["GuildHeader", "iconBackgroundTierThree"],
		guildheadericonbgtiertwo: ["GuildHeader", "iconBackgroundTierTwo"],
		guildheadericonpremiumgem: ["GuildHeader", "premiumGuildIconGem"],
		guildheadericontiernone: ["GuildHeader", "iconTierNone"],
		guildheadericontierone: ["GuildHeader", "iconTierOne"],
		guildheadericontierthree: ["GuildHeader", "iconTierThree"],
		guildheadericontiertwo: ["GuildHeader", "iconTierTwo"],
		guildheaderheader: ["GuildHeader", "header"],
		guildheadername: ["GuildHeader", "name"],
		guildicon: ["GuildIcon", "icon"],
		guildiconacronym: ["GuildIcon", "acronym"],
		guildiconchildwrapper: ["GuildIcon", "childWrapper"],
		guildiconselected: ["GuildIcon", "selected"],
		guildiconwrapper: ["GuildIcon", "wrapper"],
		guildinner: ["Guild", "wrapper"],
		guildinnerwrapper: ["GuildsItems", "listItemWrapper"],
		guildlowerbadge: ["Guild", "lowerBadge"],
		guildouter: ["GuildsItems", "listItem"],
		guildpill: ["GuildServer", "pill"],
		guildpillitem: ["PillWrapper", "item"],
		guildpillwrapper: ["PillWrapper", "wrapper"],
		guildplaceholder: ["GuildsItems", "dragInner"],
		guildplaceholdermask: ["GuildsItems", "placeholderMask"],
		guilds: ["AppBase", "guilds"],
		guildseparator: ["GuildsItems", "guildSeparator"],
		guildserror: ["GuildsItems", "guildsError"],
		guildsettingsbannedcard: ["GuildSettingsBanned", "bannedUser"],
		guildsettingsbanneddiscrim: ["GuildSettingsBanned", "discrim"],
		guildsettingsbannedusername: ["GuildSettingsBanned", "username"],
		guildsettingsinvitecard: ["GuildSettingsInvite", "inviteSettingsInviteRow"],
		guildsettingsinvitechannelname: ["GuildSettingsInvite", "channelName"],
		guildsettingsinviteusername: ["GuildSettingsInvite", "username"],
		guildsettingsmembercard: ["GuildSettingsMember", "member"],
		guildsettingsmembername: ["GuildSettingsMember", "name"],
		guildsettingsmembernametag: ["GuildSettingsMember", "nameTag"],
		guildsscroller: ["GuildsWrapper", "scroller"],
		guildsscrollerwrap: ["GuildsWrapper", "scrollerWrap"],
		guildsvg: ["Guild", "svg"],
		guildswrapper: ["GuildsWrapper", "wrapper"],
		guildswrapperunreadmentionsbar: ["GuildsWrapper", "unreadMentionsBar"],
		guildswrapperunreadmentionsbarbottom: ["GuildsWrapper", "unreadMentionsIndicatorBottom"],
		guildswrapperunreadmentionsbartop: ["GuildsWrapper", "unreadMentionsIndicatorTop"],
		guildupperbadge: ["Guild", "upperBadge"],
		h1: ["Text", "h1"],
		h1defaultmargin: ["Text", "defaultMarginh1"],
		h2: ["Text", "h2"],
		h2defaultmargin: ["Text", "defaultMarginh2"],
		h3: ["Text", "h3"],
		h3defaultmargin: ["Text", "defaultMarginh3"],
		h4: ["Text", "h4"],
		h4defaultmargin: ["Text", "defaultMarginh4"],
		h5: ["Text", "h5"],
		h5defaultmargin: ["Text", "defaultMarginh5"],
		headertitle: ["Text", "title"],
		height12: ["UserPopout", "height12"],
		height16: ["File", "height16"],
		height24: ["Title", "height24"],
		height36: ["Notice", "height36"],
		highlight: ["NotFound", "highlight"],
		homebuttonicon: ["HomeIcon", "homeIcon"],
		homebuttonpill: ["HomeIcon", "pill"],
		horizontal: ["FlexChild", "horizontal"],
		horizontal2: ["NotFound", "_"],
		horizontalreverse: ["FlexChild", "horizontalReverse"],
		horizontalreverse2: ["NotFound", "_"],
		hotkeybase: ["NotFound", "_"],
		hotkeybutton: ["HotKeyRecorder", "button"],
		hotkeybutton2: ["NotFound", "_"],
		hotkeycontainer: ["HotKeyRecorder", "container"],
		hotkeycontainer2: ["NotFound", "_"],
		hotkeydisabled: ["HotKeyRecorder", "disabled"],
		hotkeydisabled2: ["NotFound", "_"],
		hotkeyediticon: ["HotKeyRecorder", "editIcon"],
		hotkeyhasvalue: ["HotKeyRecorder", "hasValue"],
		hotkeyinput: ["HotKeyRecorder", "input"],
		hotkeyinput2: ["HotKeyRecorder", "input"],
		hotkeylayout: ["HotKeyRecorder", "layout"],
		hotkeylayout2: ["HotKeyRecorder", "layout"],
		hotkeyrecording: ["HotKeyRecorder", "recording"],
		hotkeyshadowpulse: ["HotKeyRecorder", "shadowPulse"],
		hotkeytext: ["HotKeyRecorder", "text"],
		hovercard: ["HoverCard", "card"],
		hovercardbutton: ["NotFound", "hoverCardButton"],
		hovercardinner: ["BDFDB", "cardInner"],
		hovercardwrapper: ["BDFDB", "cardWrapper"],
		icon: ["EmbedActions", "icon"],
		iconactionswrapper: ["EmbedActions", "wrapper"],
		iconexternal: ["EmbedActions", "iconExternal"],
		iconexternalmargins: ["EmbedActions", "iconExternalMargins"],
		iconplay: ["EmbedActions", "iconPlay"],
		iconwrapper: ["EmbedActions", "iconWrapper"],
		iconwrapperactive: ["EmbedActions", "iconWrapperActive"],
		imageaccessory: ["ImageWrapper", "imageAccessory"],
		imageclickable: ["ImageWrapper", "clickable"],
		imageerror: ["ImageWrapper", "imageError"],
		imageplaceholder: ["ImageWrapper", "imagePlaceholder"],
		imageplaceholderoverlay: ["ImageWrapper", "imagePlaceholderOverlay"],
		imagewrapper: ["ImageWrapper", "imageWrapper"],
		imagewrapperbackground: ["ImageWrapper", "imageWrapperBackground"],
		imagewrapperinner: ["ImageWrapper", "imageWrapperInner"],
		imagezoom: ["ImageWrapper", "imageZoom"],
		itemlayer: ["ItemLayerContainer", "layer"],
		itemlayercontainer: ["ItemLayerContainer", "layerContainer"],
		input: ["Input", "input"],
		inputdefault: ["Input", "inputDefault"],
		inputdisabled: ["Input", "disabled"],
		inputeditable: ["Input", "editable"],
		inputerror: ["Input", "error"],
		inputerrormessage: ["Input", "errorMessage"],
		inputfocused: ["Input", "focused"],
		inputmini: ["Input", "inputMini"],
		inputprefix: ["Input", "inputPrefix"],
		inputsuccess: ["Input", "success"],
		inputwrapper: ["Input", "inputWrapper"],
		inputnumberbutton: ["BDFDB", "inputNumberButton"],
		inputnumberbuttondown: ["BDFDB", "inputNumberButtonDown"],
		inputnumberbuttonup: ["BDFDB", "inputNumberButtonUp"],
		inputnumberbuttons: ["BDFDB", "inputNumberButtons"],
		inputnumberwrapper: ["BDFDB", "inputNumberWrapper"],
		inputnumberwrapperdefault: ["BDFDB", "inputNumberWrapperDefault"],
		inputnumberwrappermini: ["BDFDB", "inputNumberWrapperMini"],
		invite: ["GuildInvite", "wrapper"],
		invitebutton: ["GuildInvite", "button"],
		invitebuttoncontent: ["GuildInvite", "buttonContent"],
		invitebuttonicon: ["GuildInvite", "buttonIcon"],
		invitebuttoninner: ["GuildInvite", "buttonInner"],
		invitebuttonsize: ["GuildInvite", "buttonSize"],
		invitechannelname: ["GuildInvite", "channelName"],
		invitecontent: ["GuildInvite", "content"],
		invitecursordefault: ["GuildInvite", "cursorDefault"],
		inviteguilddetail: ["GuildInvite", "guildDetail"],
		inviteguildicon: ["GuildInvite", "guildIcon"],
		inviteguildiconexpired: ["GuildInvite", "guildIconExpired"],
		inviteguildiconimage: ["GuildInvite", "guildIconImage"],
		inviteguildiconimagejoined: ["GuildInvite", "guildIconImageJoined"],
		inviteguildiconjoined: ["GuildInvite", "guildIconJoined"],
		inviteguildinfo: ["GuildInvite", "guildInfo"],
		inviteguildname: ["GuildInvite", "guildName"],
		inviteguildnameexpired: ["GuildInvite", "guildNameExpired"],
		inviteguildnamejoined: ["GuildInvite", "guildNameJoined"],
		inviteheader: ["GuildInvite", "header"],
		invitehighbackgroundopacity: ["GuildInvite", "highBackgroundOpacity"],
		inviteiconsizeoverride: ["GuildInvite", "iconSizeOverride"],
		invitelowbackgroundopacity: ["GuildInvite", "lowBackgroundOpacity"],
		invitemediumbackgroundopacity: ["GuildInvite", "mediumBackgroundOpacity"],
		invitemodal: ["InviteModal", "modal"],
		invitemodalinviterow: ["InviteModal", "inviteRow"],
		invitemodalinviterowname: ["InviteModal", "inviteRowName"],
		invitemodalwrapper: ["InviteModal", "wrapper"],
		inviteonlinecount: ["GuildInvite", "onlineCount"],
		inviteresolving: ["GuildInvite", "resolving"],
		inviteresolvingbackground: ["GuildInvite", "resolvingBackground"],
		invitestatus: ["GuildInvite", "status"],
		invitestatusoffline: ["GuildInvite", "statusOffline"],
		invitestatusonline: ["GuildInvite", "statusOnline"],
		inviteuserselectnone: ["GuildInvite", "userSelectNone"],
		justifycenter: ["Flex", "justifyCenter"],
		justifyend: ["Flex", "justifyEnd"],
		justifystart: ["Flex", "justifyStart"],
		large: ["TextStyle", "large"],
		layermodal: ["LayerModal", "root"],
		layermodallarge: ["LayerModal", "large"],
		layermodalmedium: ["LayerModal", "medium"],
		layermodalsmall: ["LayerModal", "small"],
		layer: ["Layers", "layer"],
		layerbase: ["Layers", "baseLayer"],
		layers: ["Layers", "layers"],
		layersbg: ["Layers", "bg"],
		livetag: ["LiveTag", "live"],
		livetaggrey: ["LiveTag", "grey"],
		livetaglarge: ["LiveTag", "liveLarge"],
		livetagsmall: ["LiveTag", "liveSmall"],
		loginscreen: ["NotFound", "loginScreen"],
		marginbottom4: ["Margins", "marginBottom4"],
		marginbottom8: ["Margins", "marginBottom8"],
		marginbottom20: ["Margins", "marginBottom20"],
		marginbottom40: ["Margins", "marginBottom40"],
		marginbottom60: ["Margins", "marginBottom60"],
		margincenterhorz: ["Margins", "marginCenterHorz"],
		marginleft4: ["Autocomplete", "marginLeft4"],
		marginleft8: ["Autocomplete", "marginLeft8"],
		marginreset: ["Margins", "marginReset"],
		margintop4: ["Margins", "marginTop4"],
		margintop8: ["Margins", "marginTop8"],
		margintop20: ["Margins", "marginTop20"],
		margintop40: ["Margins", "marginTop40"],
		margintop60: ["Margins", "marginTop60"],
		medium: ["TextStyle", "medium"],
		member: ["Member", "member"],
		membericon: ["Member", "icon"],
		memberoffline: ["Member", "offline"],
		memberownericon: ["Member", "ownerIcon"],
		memberpremiumicon: ["Member", "premiumIcon"],
		members: ["MembersWrap", "members"],
		membersgroup: ["MembersWrap", "membersGroup"],
		memberswrap: ["MembersWrap", "membersWrap"],
		memberusername: ["Member", "roleColor"],
		mention: ["NotFound", "mention"],
		mentionwrapper: ["Mention", "wrapper"],
		mentionwrapperhover: ["Mention", "wrapperHover"],
		mentionwrappernohover: ["Mention", "wrapperNoHover"],
		messageaccessory: ["MessageAccessory", "container"],
		messageaccessorycompact: ["MessageAccessory", "containerCompact"],
		messageaccessorycozy: ["MessageAccessory", "containerCozy"],
		messageavatar: ["Message", "avatar"],
		messagebarbase: ["MessageElements", "barBase"],
		messagebarbuttonalt: ["MessageElements", "barButtonAlt"],
		messagebarbuttonbase: ["MessageElements", "barButtonBase"],
		messagebarbuttonicon: ["MessageElements", "barButtonIcon"],
		messagebarbuttonmain: ["MessageElements", "barButtonMain"],
		messagebarhasmore: ["MessageElements", "hasMore"],
		messagebarjumptopresentbar: ["MessageElements", "jumpToPresentBar"],
		messagebarloadingmore: ["MessageElements", "loadingMore"],
		messagebarnewmessagesbar: ["MessageElements", "newMessagesBar"],
		messagebarspan: ["MessageElements", "span"],
		messagebarspinner: ["MessageElements", "spinner"],
		messagebarspinneritem: ["MessageElements", "spinnerItem"],
		messagebody: ["MessageBody", "container"],
		messagebodycompact: ["MessageBody", "containerCompact"],
		messagebodycozy: ["MessageBody", "containerCozy"],
		messagebodyismentioned: ["MessageBody", "isMentioned"],
		messagebodyismentionedcompact: ["MessageBody", "isMentionedCompact"],
		messagebodyismentionedcozy: ["MessageBody", "isMentionedCozy"],
		messagebuttoncontainer: ["Message", "buttonContainer"],
		messagebuttoncontainerouter: ["MessageBody", "buttonContainer"],
		messagecompact: ["Message", "messageCompact"],
		messagecontent: ["Message", "content"],
		messagecontentcompact: ["Message", "contentCompact"],
		messagecontentcozy: ["Message", "contentCozy"],
		messagedivider: ["Message", "divider"],
		messagedividerenabled: ["Message", "dividerEnabled"],
		messageedited: ["MessageBody", "edited"],
		messagegroup: ["Message", "container"],
		messagegroupblocked: ["MessageElements", "messageGroupBlocked"],
		messagegroupblockedbtn: ["MessageElements", "messageGroupBlockedBtn"],
		messagegroupblockedrevealed: ["MessageElements", "revealed"],
		messagegroupcozy: ["Message", "containerCozy"],
		messagegroupcompact: ["Message", "containerCompact"],
		messagegroupwrapper: ["MessagesPopout", "messageGroupWrapper"],
		messagegroupwrapperoffsetcorrection: ["MessagesPopout", "messageGroupWrapperOffsetCorrection"],
		messageheadercompact: ["Message", "headerCompact"],
		messageheadercozy: ["Message", "headerCozy"],
		messageheadercozymeta: ["Message", "headerCozyMeta"],
		messagehighbackgroundopacity: ["Message", "highBackgroundOpacity"],
		messagelocalbotmessage: ["Message", "localBotMessage"],
		messagelowbackgroundopacity: ["Message", "lowBackgroundOpacity"],
		messagemarkup: ["MessageMarkup", "markup"],
		messagemarkupiscompact: ["MessageBody", "isCompact"],
		messagemediumbackgroundopacity: ["Message", "mediumBackgroundOpacity"],
		messageoperations: ["MessageOperations", "operations"],
		messages: ["MessagesWrap", "messages"],
		messagesdivider: ["MessagesWrap", "divider"],
		messagespopout: ["MessagesPopout", "messagesPopout"],
		messagespopoutaccessories: ["MessagesPopout", "accessories"],
		messagespopoutactionbuttons: ["MessagesPopout", "actionButtons"],
		messagespopoutbody: ["MessagesPopout", "body"],
		messagespopoutbottom: ["MessagesPopout", "bottom"],
		messagespopoutchannelname: ["MessagesPopout", "channelName"],
		messagespopoutchannelseparator: ["MessagesPopout", "channelSeparator"],
		messagespopoutclosebutton: ["MessagesPopout", "closeButton"],
		messagespopoutcomment: ["MessagesPopout", "comment"],
		messagespopoutcontainercompactbounded: ["Message", "containerCompactBounded"],
		messagespopoutcontainercozybounded: ["Message", "containerCozyBounded"],
		messagespopoutemptyplaceholder: ["MessagesPopout", "emptyPlaceholder"],
		messagespopoutfooter: ["MessagesPopout", "footer"],
		messagespopoutguildname: ["MessagesPopout", "guildName"],
		messagespopouthasmore: ["MessagesPopout", "hasMore"],
		messagespopouthasmorebutton: ["MessagesPopout", "hasMoreButton"],
		messagespopoutheader: ["MessagesPopout", "header"],
		messagespopouthidden: ["MessagesPopout", "hidden"],
		messagespopoutimage: ["MessagesPopout", "image"],
		messagespopoutjumpbutton: ["MessagesPopout", "jumpButton"],
		messagespopoutloading: ["MessagesPopout", "loading"],
		messagespopoutloadingmore: ["MessagesPopout", "loadingMore"],
		messagespopoutloadingplaceholder: ["MessagesPopout", "loadingPlaceholder"],
		messagespopoutmessagegroupcozy: ["MessagesPopout", "messageGroupCozy"],
		messagespopoutmessagegroupwrapper: ["MessagesPopout", "messageGroupWrapper"],
		messagespopoutmessagegroupwrapperoffsetcorrection: ["MessagesPopout", "messageGroupWrapperOffsetCorrection"],
		messagespopoutscrollingfooterwrap: ["MessagesPopout", "scrollingFooterWrap"],
		messagespopoutspinner: ["MessagesPopout", "spinner"],
		messagespopouttext: ["MessagesPopout", "text"],
		messagespopouttip: ["MessagesPopout", "tip"],
		messagespopouttitle: ["MessagesPopout", "title"],
		messagespopoutvisible: ["MessagesPopout", "visible"],
		messagespopoutwrap: ["MessagesPopout", "messagesPopoutWrap"],
		messagesscrollerwrapper: ["MessagesWrap", "scrollerWrap"],
		messageswelcomemessage: ["MessagesWelcome", "welcomeMessage"],
		messageswelcomemessageheader: ["MessagesWelcome", "h1"],
		messageswrapper: ["MessagesWrap", "messagesWrapper"],
		messagesystem: ["MessageSystem", "container"],
		messagesystemcontent: ["MessageSystem", "content"],
		messagesystemicon: ["MessageSystem", "icon"],
		messagetimedivider: ["MessageElements", "divider"],
		messagetimedividerred: ["MessageElements", "dividerRed"],
		messagetimedividercontent: ["MessageElements", "dividerContent"],
		messagetimestampcompact: ["Message", "timestampCompact"],
		messagetimestampcompactismentioned: ["Message", "timestampCompactIsMentioned"],
		messagetimestampcozy: ["Message", "timestampCozy"],
		messagetimestampseparator: ["Message", "separator"],
		messagetimestampseparatorleft: ["Message", "separatorLeft"],
		messagetimestampseparatorright: ["Message", "separatorRight"],
		messagetimestampsystem: ["MessageSystem", "timestamp"],
		messagetimestampvisibleonhover: ["Message", "timestampVisibleOnHover"],
		messageuploadcancel: ["MessageFile", "cancelButton"],
		messageusername: ["Message", "username"],
		modal: ["ModalWrap", "modal"],
		modalclose: ["Modal", "close"],
		modalchangelogmodal: ["BDFDB", "changeLogModal"],
		modalconfirmmodal: ["BDFDB", "confirmModal"],
		modalcontent: ["Modal", "content"],
		modalfooter: ["Modal", "footer"],
		modalguildname: ["ModalItems", "guildName"],
		modalheader: ["Modal", "header"],
		modalheaderhassibling: ["BDFDB", "modalHeaderHasSibling"],
		modalinner: ["ModalWrap", "inner"],
		modalmini: ["ModalMiniContent", "modal"],
		modalminicontent: ["ModalMiniContent", "content"],
		modalminisize: ["ModalMiniContent", "size"],
		modalminitext: ["HeaderBarTopic", "content"],
		modalseparator: ["Modal", "separator"],
		modalsizelarge: ["Modal", "sizeLarge"],
		modalsizemedium: ["Modal", "sizeMedium"],
		modalsizesmall: ["Modal", "sizeSmall"],
		modalsub: ["Modal", "modal"],
		modalsubinner: ["Modal", "inner"],
		modalsubinnerscrollerless: ["BDFDB", "modalInnerScrollerLess"],
		modaltabcontent: ["BDFDB", "modalTabContent"],
		modaltabcontentopen: ["BDFDB", "modalTabContentOpen"],
		modalwrapper: ["BDFDB", "modalWrapper"],
		modedefault: ["FormText", "modeDefault"],
		modedisabled: ["FormText", "modeDisabled"],
		modeselectable: ["FormText", "modeSelectable"],
		namecontainer: ["NameContainer", "container"],
		namecontaineravatar: ["NameContainer", "avatar"],
		namecontainerclickable: ["NameContainer", "clickable"],
		namecontainercontent: ["NameContainer", "content"],
		namecontainerlayout: ["NameContainer", "layout"],
		namecontainername: ["NameContainer", "name"],
		namecontainernamecontainer: ["NotFound", "nameContainerNameContainer"],
		namecontainernamewrapper: ["NameContainer", "nameAndDecorators"],
		namecontainerselected: ["NameContainer", "selected"],
		namecontainersubtext: ["NameContainer", "subText"],
		nametag: ["NameTag", "nameTag"],
		nochannel: ["ChatWindow", "noChannel"],
		notice: ["Notice", "notice"],
		noticebrand: ["Notice", "noticeBrand"],
		noticebutton: ["Notice", "button"],
		noticedanger: ["Notice", "noticeDanger"],
		noticedefault: ["Notice", "noticeDefault"],
		noticedismiss: ["Notice", "dismiss"],
		noticefacebook: ["Notice", "noticeFacebook"],
		noticeicon: ["Notice", "icon"],
		noticeiconandroid: ["Notice", "iconAndroid"],
		noticeiconapple: ["Notice", "iconApple"],
		noticeiconwindows: ["Notice", "iconWindows"],
		noticeinfo: ["Notice", "noticeInfo"],
		noticeplatformicon: ["Notice", "platformIcon"],
		noticepremium: ["Notice", "noticePremium"],
		noticepremiumaction: ["Notice", "premiumAction"],
		noticepremiumgrandfathered: ["Notice", "noticePremiumGrandfathered"],
		noticepremiumlogo: ["Notice", "premiumLogo"],
		noticepremiumtext: ["Notice", "premiumText"],
		noticerichpresence: ["Notice", "noticeRichPresence"],
		noticespotify: ["Notice", "noticeSpotify"],
		noticestreamer: ["Notice", "noticeStreamerMode"],
		noticesuccess: ["Notice", "noticeSuccess"],
		noticesurvey: ["Notice", "noticeSurvey"],
		note: ["SettingsItems", "note"],
		nowrap: ["Flex", "noWrap"],
		optionpopout: ["OptionPopout", "container"],
		optionpopoutbutton: ["OptionPopout", "button"],
		optionpopoutbuttonicon: ["OptionPopout", "icon"],
		optionpopoutitem: ["OptionPopout", "item"],
		overflowellipsis: ["BDFDB", "overflowEllipsis"],
		pictureinpicture: ["PictureInPicture", "pictureInPicture"],
		pictureinpicturewindow: ["PictureInPicture", "pictureInPictureWindow"],
		popout: ["Popout", "popout"],
		popoutarrowalignmenttop: ["Popout", "arrowAlignmentTop"],
		popoutarrowalignmentmiddle: ["Popout", "arrowAlignmentMiddle"],
		popoutbody: ["Popout", "body"],
		popoutbottom: ["Popout", "popoutBottom"],
		popoutbottomleft: ["Popout", "popoutBottomLeft"],
		popoutbottomright: ["Popout", "popoutBottomRight"],
		popoutfooter: ["Popout", "footer"],
		popoutheader: ["Popout", "header"],
		popoutinvert: ["Popout", "popoutInvert"],
		popoutleft: ["Popout", "popoutLeft"],
		popoutnoarrow: ["Popout", "noArrow"],
		popoutnoshadow: ["Popout", "noShadow"],
		popoutright: ["Popout", "popoutRight"],
		popouts: ["Popout", "popouts"],
		popoutsubtitle: ["Popout", "subtitle"],
		popoutthemedpopout: ["Popout", "themedPopout"],
		popouttip: ["Popout", "tip"],
		popouttitle: ["Popout", "title"],
		popouttop: ["Popout", "popoutTop"],
		popouttopleft: ["Popout", "popoutTopLeft"],
		popouttopright: ["Popout", "popoutTopRight"],
		popoutwrapper: ["BDFDB", "popoutWrapper"],
		primary: ["TextStyle", "primary"],
		quickmessage: ["QuickMessage", "quickMessage"],
		quickmessagepopout: ["UserPopout", "quickMessage"],
		quickselect: ["QuickSelect", "quickSelect"],
		quickselectarrow: ["QuickSelect", "quickSelectArrow"],
		quickselectclick: ["QuickSelect", "quickSelectClick"],
		quickselectlabel: ["QuickSelect", "quickSelectLabel"],
		quickselectpopout: ["QuickSelect", "quickSelectPopout"],
		quickselectpopoutoption: ["QuickSelect", "quickSelectPopoutOption"],
		quickselectpopoutoptionselected: ["NotFound", "quickSelectPopoutOptionSelected"],
		quickselectpopoutscroll: ["QuickSelect", "quickSelectPopoutScroll"],
		quickselectpopoutwrapper: ["BDFDB", "quickSelectPopoutWrapper"],
		quickselectscroller: ["QuickSelect", "quickSelectScroller"],
		quickselectselected: ["QuickSelect", "selected"],
		quickselectvalue: ["QuickSelect", "quickSelectValue"],
		quickselectwrapper: ["BDFDB", "quickSelectWrapper"],
		quickswitcher: ["QuickSwitchWrap", "quickswitcher"],
		quickswitchresult: ["QuickSwitch", "result"],
		quickswitchresultfocused: ["QuickSwitch", "resultFocused"],
		quickswitchresultguildicon: ["QuickSwitch", "guildIcon"],
		quickswitchresultmatch: ["QuickSwitch", "match"],
		quickswitchresultmisccontainer: ["QuickSwitchWrap", "miscContainer"],
		quickswitchresultname: ["QuickSwitch", "name"],
		quickswitchresultnote: ["QuickSwitch", "note"],
		quickswitchresultusername: ["QuickSwitch", "username"],
		recentmentionsfilterpopout: ["RecentMentions", "recentMentionsFilterPopout"],
		recentmentionsheader: ["RecentMentions", "header"],
		recentmentionsloadingmore: ["RecentMentions", "loadingMore"],
		recentmentionsmentionfilter: ["RecentMentions", "mentionFilter"],
		recentmentionsmentionfilterlabel: ["RecentMentions", "label"],
		recentmentionsmentionfiltervalue: ["RecentMentions", "value"],
		recentmentionspopout: ["RecentMentions", "recentMentionsPopout"],
		red: ["TextStyle", "statusRed"],
		reset: ["CardStatus", "reset"],
		scrollbar: ["Scrollbar", "scrollbar"],
		scrollbardefault: ["Scrollbar", "scrollbarDefault"],
		scrollbarghost: ["Scrollbar", "scrollbarGhost"],
		scrollbarghosthairline: ["Scrollbar", "scrollbarGhostHairline"],
		scroller: ["Scroller", "scroller"],
		scrollerfade: ["Scroller", "scrollerFade"],
		scrollerfirefoxfixscrollflex: ["Scroller", "firefoxFixScrollFlex"],
		scrollersystempad: ["Scroller", "systemPad"],
		scrollerthemed: ["Scroller", "scrollerThemed"],
		scrollerthemedwithtrack: ["Scroller", "themedWithTrack"],
		scrollerthemeghost: ["Scroller", "themeGhost"],
		scrollerthemeghosthairline: ["Scroller", "themeGhostHairline"],
		scrollerthemeghosthairlinechannels: ["Scroller", "themeGhostHairlineChannels"],
		scrollerwrap: ["Scroller", "scrollerWrap"],
		searchbar: ["SearchBar", "container"],
		searchbarclear: ["SearchBar", "clear"],
		searchbarclose: ["SearchBar", "close"],
		searchbaricon: ["SearchBar", "icon"],
		searchbariconlayout: ["SearchBar", "iconLayout"],
		searchbariconwrap: ["SearchBar", "iconContainer"],
		searchbarinner: ["SearchBar", "inner"],
		searchbarinput: ["SearchBar", "input"],
		searchbarlarge: ["SearchBar", "large"],
		searchbarmedium: ["SearchBar", "medium"],
		searchbarsmall: ["SearchBar", "small"],
		searchbartag: ["SearchBar", "tag"],
		searchbarvisible: ["SearchBar", "visible"],
		searchpopout: ["SearchPopoutWrap", "container"],
		searchpopoutanswer: ["SearchPopout", "answer"],
		searchpopoutdatepicker: ["SearchPopout", "datePicker"],
		searchpopoutdatepickerhint: ["SearchPopout", "datePickerHint"],
		searchpopoutdmaddpopout: ["DmAddPopout", "popout"],
		searchpopoutddmaddfriend: ["DmAddPopoutItems", "friend"],
		searchpopoutddmaddfriendwrapper: ["DmAddPopoutItems", "friendWrapper"],
		searchpopoutdisplayavatar: ["SearchPopout", "displayAvatar"],
		searchpopoutdisplayusername: ["SearchPopout", "displayUsername"],
		searchpopoutdisplayednick: ["SearchPopout", "displayedNick"],
		searchpopoutfilter: ["SearchPopout", "filter"],
		searchpopoutheader: ["SearchPopout", "header"],
		searchpopouthint: ["SearchPopout", "hint"],
		searchpopouthintvalue: ["SearchPopout", "hintValue"],
		searchpopoutlinksource: ["SearchPopout", "linkSource"],
		searchpopoutnontext: ["SearchPopout", "nonText"],
		searchpopoutoption: ["SearchPopout", "option"],
		searchpopoutplusicon: ["SearchPopout", "plusIcon"],
		searchpopoutresultchannel: ["SearchPopout", "resultChannel"],
		searchpopoutresultsgroup: ["SearchPopout", "resultsGroup"],
		searchpopoutsearchclearhistory: ["SearchPopout", "searchClearHistory"],
		searchpopoutsearchlearnmore: ["SearchPopout", "searchLearnMore"],
		searchpopoutsearchoption: ["SearchPopout", "searchOption"],
		searchpopoutsearchresultchannelcategory: ["SearchPopout", "searchResultChannelCategory"],
		searchpopoutsearchresultchannelicon: ["SearchPopout", "searchResultChannelIcon"],
		searchpopoutsearchresultchanneliconbackground: ["SearchPopout", "searchResultChannelIconBackground"],
		searchpopoutselected: ["SearchPopout", "selected"],
		searchpopoutuser: ["SearchPopout", "user"],
		searchresults: ["SearchResults", "searchResults"],
		searchresultschannelname: ["SearchResults", "channelName"],
		searchresultspagination: ["SearchResults", "pagination"],
		searchresultspaginationdisabled: ["SearchResults", "disabled"],
		searchresultspaginationnext: ["SearchResults", "paginationNext"],
		searchresultspaginationprevious: ["SearchResults", "paginationPrevious"],
		searchresultssearchheader: ["SearchResults", "searchHeader"],
		searchresultswrap: ["SearchResults", "searchResultsWrap"],
		searchresultswrapper: ["SearchResults", "resultsWrapper"],
		select: ["NotFound", "select"],
		selectable: ["TextStyle", "selectable"],
		selectarrow: ["NotFound", "selectArrow"],
		selectarrowcontainer: ["NotFound", "selectArrowContainer"],
		selectarrowcontainerdark: ["NotFound", "selectArrowContainerDark"],
		selectarrowcontainerlight: ["NotFound", "selectArrowContainerLight"],
		selectarrowzone: ["NotFound", "selectArrowZone"],
		selectcontrol: ["NotFound", "selectControl"],
		selectcontroldark: ["NotFound", "selectControlDark"],
		selectcontrollight: ["NotFound", "selectControlLight"],
		selectdummyinput: ["NotFound", "selectDummyInput"],
		selecthasvalue: ["NotFound", "selectHasValue"],
		selectisopen: ["NotFound", "selectIsOpen"],
		selectmenu: ["NotFound", "selectMenu"],
		selectmenuouter: ["NotFound", "selectMenuOuter"],
		selectmenuouterdark: ["NotFound", "selectMenuOuterDark"],
		selectmenuouterlight: ["NotFound", "selectMenuOuterLight"],
		selectoption: ["NotFound", "selectOption"],
		selectoptiondark: ["NotFound", "selectOptionDark"],
		selectoptionlight: ["NotFound", "selectOptionLight"],
		selectoptionhoverdark: ["NotFound", "selectOptionHoverDark"],
		selectoptionhoverlight: ["NotFound", "selectOptionHoverLight"],
		selectoptionselectdark: ["NotFound", "selectOptionSelectDark"],
		selectoptionselectlight: ["NotFound", "selectOptionSelectLight"],
		selectselected: ["NotFound", "selectIsSelected"],
		selectsingle: ["NotFound", "selectSingle"],
		selectsingledark: ["NotFound", "selectSingleDark"],
		selectsinglelight: ["NotFound", "selectSingleLight"],
		selectvalue: ["NotFound", "selectValue"],
		selectwrap: ["Select", "select"],
		settingsclosebutton: ["SettingsCloseButton", "closeButton"],
		settingsclosebuttoncontainer: ["SettingsCloseButton", "container"],
		settingsheader: ["Item", "header"],
		settingsitem: ["Item", "item"],
		settingsitemselected: ["Item", "selected"],
		settingsitemthemed: ["Item", "themed"],
		settingspanel: ["BDFDB", "settingsPanel"],
		settingspanelinner: ["BDFDB", "settingsPanelInner"],
		settingspanellist: ["BDFDB", "settingsPanelList"],
		settingspaneltitle: ["BDFDB", "settingsPanelTitle"],
		settingsseparator: ["Item", "separator"],
		settingstabbar: ["Friends", "tabBar"],
		settingstabbarbadge: ["Friends", "badge"],
		settingstabbartoppill: ["Item", "topPill"],
		settingstableheader: ["SettingsTable", "header"],
		settingstableheadername: ["SettingsTable", "headerName"],
		settingstableheaderoption: ["SettingsTable", "headerOption"],
		settingstableheadersize: ["SettingsTable", "headerSize"],
		sidebarregion: ["SettingsWindow", "sidebarRegion"],
		sinkinteractions: ["Message", "disableInteraction"],
		size10: ["TextSize", "size10"],
		size12: ["TextSize", "size12"],
		size14: ["TextSize", "size14"],
		size16: ["TextSize", "size16"],
		size20: ["TextSize", "size20"],
		size24: ["TextSize", "size24"],
		size32: ["TextSize", "size32"],
		slider: ["Slider", "slider"],
		sliderbar: ["Slider", "bar"],
		sliderbarfill: ["Slider", "barFill"],
		sliderbubble: ["Slider", "bubble"],
		sliderdisabled: ["Slider", "disabled"],
		slidergrabber: ["Slider", "grabber"],
		sliderinput: ["Slider", "input"],
		slidermark: ["Slider", "mark"],
		slidermarkdash: ["Slider", "markDash"],
		slidermarkdashsimple: ["Slider", "markDashSimple"],
		slidermarkvalue: ["Slider", "markValue"],
		slidermini: ["Slider", "mini"],
		slidertrack: ["Slider", "track"],
		spoilercontainer: ["Spoiler", "spoilerContainer"],
		spoilerhidden: ["Spoiler", "hidden"],
		spoilertext: ["Spoiler", "spoilerText"],
		spoilerwarning: ["Spoiler", "spoilerWarning"],
		small: ["TextStyle", "small"],
		splashbackground: ["NotFound", "splashBackground"],
		standardsidebarview: ["SettingsWindow", "standardSidebarView"],
		status: ["Avatar", "status"],
		stopanimations: ["NotFound", "stopAnimations"],
		subtext: ["NotFound", "subtext"],
		svgicon: ["BDFDB", "svgIcon"],
		switch: ["Switch", "switch"],
		switchdisabled: ["Switch", "switchDisabled"],
		switchenabled: ["Switch", "switchEnabled"],
		switchinner: ["Switch", "checkbox"],
		switchinnerdisabled: ["Switch", "checkboxDisabled"],
		switchinnerenabled: ["Switch", "checkboxEnabled"],
		switchsize: ["Switch", "size"],
		switchsizedefault: ["Switch", "sizeDefault"],
		switchsizemini: ["Switch", "sizeMini"],
		switchthemeclear: ["Switch", "themeClear"],
		switchthemedefault: ["Switch", "themeDefault"],
		switchvalue: ["Switch", "value"],
		switchvaluechecked: ["Switch", "valueChecked"],
		switchvalueunchecked: ["Switch", "valueUnchecked"],
		systempad: ["Scroller", "systemPad"],
		tabbar: ["UserProfile", "tabBar"],
		tabbarcontainer: ["UserProfile", "tabBarContainer"],
		tabbarheader: ["RecentMentions", "tabBar"],
		tabbarheadercontainer: ["RecentMentions", "headerTabBarWrapper"],
		tabbarheaderitem: ["RecentMentions", "tabBarItem"],
		tabbaritem: ["UserProfile", "tabBarItem"],
		tabbartop: ["Item", "top"],
		table: ["BDFDB", "table"],
		tablebodycell: ["BDFDB", "tableBodyCell"],
		tableheader: ["BDFDB", "tableHeader"],
		tableheadercell: ["BDFDB", "tableHeaderCellSorted"],
		tableheadercellsorted: ["BDFDB", "tableHeaderCell"],
		tableheadersorticon: ["BDFDB", "tableHeaderSortIcon"],
		tablerow: ["BDFDB", "tableRow"],
		tablestickyheader: ["BDFDB", "tableStickyHeader"],
		textarea: ["ChannelTextArea", "textArea"],
		textareaattachbutton: ["ChannelTextArea", "attachButton"],
		textareaattachbuttondivider: ["ChannelTextArea", "attachButtonDivider"],
		textareaattachbuttoninner: ["ChannelTextArea", "attachButtonInner"],
		textareaattachbuttonplus: ["ChannelTextArea", "attachButtonPlus"],
		textareabutton: ["ChannelTextAreaButton", "button"],
		textareabuttonactive: ["ChannelTextAreaButton", "active"],
		textareabuttonpulse: ["ChannelTextAreaButton", "pulseButton"],
		textareabuttonwrapper: ["ChannelTextAreaButton", "buttonWrapper"],
		textareadisabled: ["ChannelTextArea", "textAreaDisabled"],
		textareaedit: ["ChannelTextArea", "textAreaEdit"],
		textareaenabled: ["ChannelTextArea", "textAreaEnabled"],
		textareaenablednoattach: ["ChannelTextArea", "textAreaEnabledNoAttach"],
		textareaicon: ["ChannelTextAreaButton", "icon"],
		textareaiconpulse: ["ChannelTextAreaButton", "pulseIcon"],
		textareainner: ["ChannelTextArea", "inner"],
		textareainnerautocomplete: ["ChannelTextArea", "innerAutocomplete"],
		textareainnerdisabled: ["ChannelTextArea", "innerDisabled"],
		textareainnerenablednoattach: ["ChannelTextArea", "innerEnabledNoAttach"],
		textareainnernoautocomplete: ["ChannelTextArea", "innerNoAutocomplete"],
		textareapickerbutton: ["ChannelTextArea", "button"],
		textareapickerbuttoncontainer: ["ChannelTextArea", "buttonContainer"],
		textareapickerbuttons: ["ChannelTextArea", "buttons"],
		textareauploadinput: ["ChannelTextArea", "uploadInput"],
		textareawrapall: ["ChannelTextArea", "channelTextArea"],
		textareawrapchat: ["ChatWindow", "channelTextArea"],
		textareawrapdisabled: ["ChannelTextArea", "channelTextAreaDisabled"],
		textareawrapenablednoattach: ["ChannelTextArea", "channelTextAreaEnabledNoAttach"],
		textlink: ["Notice", "textLink"],
		textrow: ["PopoutActivity", "textRow"],
		textscroller: ["BDFDB", "textScroller"],
		themedark: ["NotFound", "themeDark"],
		themeghosthairline: ["Scroller", "themeGhostHairline"],
		themelight: ["NotFound", "themeLight"],
		themeundefined: ["NotFound", "themeUndefined"],
		tip: ["Tip", "tip"],
		tipblock: ["Tip", "block"],
		tippro: ["Tip", "pro"],
		tipinline: ["Tip", "inline"],
		title: ["SettingsItems", "title"],
		titlebar: ["TitleBar", "titleBar"],
		titlebarmac: ["TitleBar", "typeMacOS"],
		titlebarmacbutton: ["TitleBar", "macButton"],
		titlebarmacbuttonclose: ["TitleBar", "macButtonClose"],
		titlebarmacbuttonmin: ["TitleBar", "macButtonMinimize"],
		titlebarmacbuttonmax: ["TitleBar", "macButtonMaximize"],
		titlebarmacbuttons: ["TitleBar", "macButtons"],
		titlebarmacwithframe: ["TitleBar", "typeMacOSWithFrame"],
		titlebarwinbutton: ["TitleBar", "winButton"],
		titlebarwinbuttonclose: ["TitleBar", "winButtonClose"],
		titlebarwinbuttonminmax: ["TitleBar", "winButtonMinMax"],
		titlebarwindows: ["TitleBar", "typeWindows"],
		titlebarwithframe: ["TitleBar", "withFrame"],
		titlebarwordmark: ["TitleBar", "wordmark"],
		titlebarwordmarkmac: ["TitleBar", "wordmarkMacOS"],
		titlebarwordmarkwindows: ["TitleBar", "wordmarkWindows"],
		titledefault: ["SettingsItems", "titleDefault"],
		titlemini: ["SettingsItems", "titleMini"],
		titlesize10: ["UserPopout", "size10"],
		titlesize12: ["UserPopout", "size12"],
		titlesize14: ["UserPopout", "size14"],
		titlesize16: ["UserPopout", "size16"],
		size18: ["Title", "size18"], // REMOVE
		titlesize18: ["Title", "size18"],
		tooltip: ["Tooltip", "tooltip"],
		tooltipblack: ["Tooltip", "tooltipBlack"],
		tooltipbottom: ["Tooltip", "tooltipBottom"],
		tooltipbrand: ["Tooltip", "tooltipBrand"],
		tooltipgreen: ["Tooltip", "tooltipGreen"],
		tooltipgrey: ["Tooltip", "tooltipGrey"],
		tooltipleft: ["Tooltip", "tooltipLeft"],
		tooltippointer: ["Tooltip", "tooltipPointer"],
		tooltipred: ["Tooltip", "tooltipRed"],
		tooltipright: ["Tooltip", "tooltipRight"],
		tooltiptop: ["Tooltip", "tooltipTop"],
		tooltipyellow: ["Tooltip", "tooltipYellow"],
		typing: ["Typing", "typing"],
		unreadbar: ["UnreadBar", "bar"],
		unreadbaractive: ["UnreadBar", "active"],
		unreadbarcontainer: ["UnreadBar", "container"],
		unreadbaricon: ["UnreadBar", "icon"],
		unreadbarmention: ["UnreadBar", "mention"],
		unreadbartext: ["UnreadBar", "text"],
		unreadbarunread: ["UnreadBar", "unread"],
		userpopout: ["UserPopout", "userPopout"],
		userpopoutavatarhint: ["UserPopout", "avatarHint"],
		userpopoutavatarhintinner: ["UserPopout", "avatarHintInner"],
		userpopoutavatarwrapper: ["UserPopout", "avatarWrapper"],
		userpopoutavatarwrappernormal: ["UserPopout", "avatarWrapperNormal"],
		userpopoutbody: ["UserPopout", "body"],
		userpopoutbodyinner: ["UserPopout", "bodyInner"],
		userpopoutbodytitle: ["UserPopout", "bodyTitle"],
		userpopoutcustomstatus: ["UserPopout", "customStatus"],
		userpopoutcustomstatusemoji: ["UserPopout", "customStatusEmoji"],
		userpopoutcustomstatussoloemoji: ["UserPopout", "customStatusSoloEmoji"],
		userpopoutcustomstatustext: ["UserPopout", "customStatusText"],
		userpopoutendbodysection: ["UserPopout", "endBodySection"],
		userpopoutfooter: ["UserPopout", "footer"],
		userpopoutheader: ["UserPopout", "header"],
		userpopoutheaderbottagwithnickname: ["UserPopout", "headerBotTagWithNickname"],
		userpopoutheadernamewrapper: ["UserPopout", "headerNameWrapper"],
		userpopoutheadernickname: ["UserPopout", "headerName"],
		userpopoutheadernonickname: ["UserPopout", "headerTagUsernameNoNickname"],
		userpopoutheadernormal: ["UserPopout", "headerNormal"],
		userpopoutheaderplaying: ["UserPopout", "headerPlaying"],
		userpopoutheaderspotify: ["UserPopout", "headerSpotify"],
		userpopoutheaderstreaming: ["UserPopout", "headerStreaming"],
		userpopoutheadertag: ["UserPopout", "headerTag"],
		userpopoutheadertagnonickname: ["UserPopout", "headerTagNoNickname"],
		userpopoutheadertagusernamenonickname: ["UserPopout", "headerTagUsernameNoNickname"],
		userpopoutheadertagwithnickname: ["UserPopout", "headerTagWithNickname"],
		userpopoutheadertext: ["UserPopout", "headerText"],
		userpopoutheadertop: ["UserPopout", "headerTop"],
		userpopoutprotip: ["UserPopout", "protip"],
		userpopoutrole: ["Role", "role"],
		userpopoutrolecircle: ["Role", "roleCircle"],
		userpopoutrolelist: ["UserPopout", "rolesList"],
		userpopoutrolename: ["Role", "roleName"],
		userpopoutroles: ["Role", "root"],
		userprofile: ["UserProfile", "root"],
		userprofilebody: ["UserProfile", "body"],
		userprofilebottag: ["UserProfile", "botTag"],
		userprofilecustomstatus: ["UserProfile", "customStatusText"],
		userprofilecustomstatusemoji: ["UserProfile", "customStatusEmoji"],
		userprofileheader: ["UserProfile", "header"],
		userprofileheaderfill: ["UserProfile", "headerFill"],
		userprofileheaderinfo: ["UserProfile", "headerInfo"],
		userprofilelistavatar: ["UserProfile", "listAvatar"],
		userprofilelistguildavatarwithouticon: ["UserProfile", "guildAvatarWithoutIcon"],
		userprofilelistname: ["UserProfile", "listName"],
		userprofilelistrow: ["UserProfile", "listRow"],
		userprofilenametag: ["UserProfile", "nameTag"],
		userprofiletopsectionnormal: ["UserProfile", "topSectionNormal"],
		userprofiletopsectionplaying: ["UserProfile", "topSectionPlaying"],
		userprofiletopsectionspotify: ["UserProfile", "topSectionSpotify"],
		userprofiletopsectionstreaming: ["UserProfile", "topSectionStreaming"],
		userprofiletopsectionxbox: ["UserProfile", "topSectionXbox"],
		userprofileusername: ["UserProfile", "username"],
		username: ["NameTag", "username"],
		usernote: ["Note", "note"],
		usernotepopout: ["UserPopout", "note"],
		usernoteprofile: ["UserProfile", "note"],
		vertical: ["Flex", "vertical"],
		voiceavatar: ["VoiceChannel", "avatar"],
		voiceavatarcontainer: ["VoiceChannel", "avatarContainer"],
		voiceavatarlarge: ["VoiceChannel", "avatarLarge"],
		voiceavatarsmall: ["VoiceChannel", "avatarSmall"],
		voiceavatarspeaking: ["VoiceChannel", "avatarSpeaking"],
		voiceclickable: ["VoiceChannel", "clickable"],
		voicecontent: ["VoiceChannel", "content"],
		voicedetails: ["VoiceDetails", "container"],
		voicedetailsactive: ["VoiceDetailsPing", "active"],
		voicedetailschannel: ["VoiceDetails", "channel"],
		voicedetailscustomstatuscontainer: ["VoiceDetails", "customStatusContainer"],
		voicedetailshotspot: ["VoiceDetails", "hotspot"],
		voicedetailsinactive: ["VoiceDetailsPing", "inactive"],
		voicedetailsinner: ["VoiceDetails", "inner"],
		voicedetailslabelwrapper: ["VoiceDetailsPing", "labelWrapper"],
		voicedetailsping: ["VoiceDetailsPing", "ping"],
		voicedetailsqualityaverage: ["VoiceDetailsPing", "rtcConnectionQualityAverage"],
		voicedetailsqualitybad: ["VoiceDetailsPing", "rtcConnectionQualityBad"],
		voicedetailsqualityfine: ["VoiceDetailsPing", "rtcConnectionQualityFine"],
		voicedetailsstatus: ["VoiceDetailsPing", "rtcConnectionStatus"],
		voicedetailsstatusconnected: ["VoiceDetailsPing", "rtcConnectionStatusConnected"],
		voicedetailsstatusconnecting: ["VoiceDetailsPing", "rtcConnectionStatusConnecting"],
		voicedetailsstatuserror: ["VoiceDetailsPing", "rtcConnectionStatusError"],
		voicedetailsstatustooltip: ["VoiceDetails", "statusTooltip"],
		voicedetailsstatuswithpopout: ["VoiceDetails", "statusWithPopout"],
		voicedraggable: ["NotFound", "voiceDraggable"],
		voiceflipped: ["VoiceChannel", "flipped"],
		voiceicon: ["VoiceChannel", "icon"],
		voiceicons: ["VoiceChannel", "icons"],
		voiceiconspacing: ["VoiceChannel", "iconSpacing"],
		voicelist: ["VoiceChannel", "list"],
		voicelist2: ["VoiceChannelList", "list"],
		voicelistcollapsed: ["VoiceChannel", "listCollapse"],
		voicelistcollapsed2: ["VoiceChannelList", "collapsed"],
		voicelistdefault: ["VoiceChannel", "listDefault"],
		voiceliveicon: ["VoiceChannel", "liveIcon"],
		voicename: ["VoiceChannel", "username"],
		voicenamefont: ["VoiceChannel", "usernameFont"],
		voicenamespeaking: ["VoiceChannel", "usernameSpeaking"],
		voiceselected: ["VoiceChannel", "selected"],
		voiceuser: ["VoiceChannel", "voiceUser"],
		voiceuserlarge: ["VoiceChannel", "userLarge"],
		voiceusersmall: ["VoiceChannel", "userSmall"],
		weightbold: ["TextStyle", "weightBold"],
		weightlight: ["TextStyle", "weightLight"],
		weightmedium: ["TextStyle", "weightMedium"],
		weightnormal: ["TextStyle", "weightNormal"],
		weightsemibold: ["TextStyle", "weightSemiBold"],
		white: ["TextStyle", "white"],
		whitney: ["TextStyle", "whitney"],
		wrap: ["Flex", "wrap"],
		wrapreverse: ["Flex", "wrapReverse"],
		yellow: ["TextStyle", "statusYellow"]
	};
	BDFDB.DiscordClasses = Object.assign({}, DiscordClasses);

	InternalBDFDB.getDiscordClass = (item, selector) => {
		var classname = DiscordClassModules.BDFDB.BDFDBundefined;
		if (DiscordClasses[item] === undefined) {
			BDFDB.LogUtils.warn(item + " not found in DiscordClasses");
			return classname;
		} 
		else if (!BDFDB.ArrayUtils.is(DiscordClasses[item]) || DiscordClasses[item].length != 2) {
			BDFDB.LogUtils.warn(item + " is not an Array of Length 2 in DiscordClasses");
			return classname;
		}
		else if (DiscordClassModules[DiscordClasses[item][0]] === undefined) {
			BDFDB.LogUtils.warn(DiscordClasses[item][0] + " not found in DiscordClassModules");
			return classname;
		}
		else if (DiscordClassModules[DiscordClasses[item][0]][DiscordClasses[item][1]] === undefined) {
			BDFDB.LogUtils.warn(DiscordClasses[item][1] + " not found in " + DiscordClasses[item][0] + " in DiscordClassModules");
			return classname;
		}
		else {
			classname = DiscordClassModules[DiscordClasses[item][0]][DiscordClasses[item][1]];
			if (selector) {
				classname = classname.split(" ").filter(n => n.indexOf("da-") != 0).join(selector ? "." : " ");
				classname = classname || DiscordClassModules.BDFDB.BDFDBundefined;
			}
			return classname;
		}	
	};
	BDFDB.disCN = new Proxy(DiscordClasses, {
		get: function (list, item) {
			return InternalBDFDB.getDiscordClass(item, false).replace("#", "");
		}
	});
	BDFDB.disCNS = new Proxy(DiscordClasses, {
		get: function (list, item) {
			return InternalBDFDB.getDiscordClass(item, false).replace("#", "") + " ";
		}
	});
	BDFDB.disCNC = new Proxy(DiscordClasses, {
		get: function (list, item) {
			return InternalBDFDB.getDiscordClass(item, false).replace("#", "") + ",";
		}
	});
	BDFDB.dotCN = new Proxy(DiscordClasses, {
		get: function (list, item) {
			let classname = InternalBDFDB.getDiscordClass(item, true);
			return (classname.indexOf("#") == 0 ? "" : ".") + classname;
		}
	});
	BDFDB.dotCNS = new Proxy(DiscordClasses, {
		get: function (list, item) {
			let classname = InternalBDFDB.getDiscordClass(item, true);
			return (classname.indexOf("#") == 0 ? "" : ".") + classname + " ";
		}
	});
	BDFDB.dotCNC = new Proxy(DiscordClasses, {
		get: function (list, item) {
			let classname = InternalBDFDB.getDiscordClass(item, true);
			return (classname.indexOf("#") == 0 ? "" : ".") + classname + ",";
		}
	});
	BDFDB.notCN = new Proxy(DiscordClasses, {
		get: function (list, item) {
			return `:not(.${InternalBDFDB.getDiscordClass(item, true).split(".")[0]})`;
		}
	});
	BDFDB.notCNS = new Proxy(DiscordClasses, {
		get: function (list, item) {
			return `:not(.${InternalBDFDB.getDiscordClass(item, true).split(".")[0]}) `;
		}
	});
	BDFDB.notCNC = new Proxy(DiscordClasses, {
		get: function (list, item) {
			return `:not(.${InternalBDFDB.getDiscordClass(item, true).split(".")[0]}),`;
		}
	});
	
	var LanguageStrings = LibraryModules.LanguageStore && LibraryModules.LanguageStore._proxyContext ? Object.assign({}, LibraryModules.LanguageStore._proxyContext.defaultMessages) : {};
	BDFDB.LanguageUtils = {};
	BDFDB.LanguageUtils.languages = {
		"$discord": 	{name:"Discord (English (US))",		id:"en-US",		ownlang:"English (US)",					integrated:false,		dic:false},
		"af":			{name:"Afrikaans",					id:"af",		ownlang:"Afrikaans",					integrated:false,		dic:true},
		"sq":			{name:"Albanian",					id:"sq",		ownlang:"Shqiptar",						integrated:false,		dic:false},
		"am":			{name:"Amharic",					id:"am",		ownlang:"አማርኛ",						integrated:false,		dic:false},
		"ar":			{name:"Arabic",						id:"ar",		ownlang:"اللغة العربية",				integrated:false,		dic:false},
		"hy":			{name:"Armenian",					id:"hy",		ownlang:"Հայերեն",						integrated:false,		dic:false},
		"az":			{name:"Azerbaijani",				id:"az",		ownlang:"آذربایجان دیلی",				integrated:false,		dic:false},
		"eu":			{name:"Basque",						id:"eu",		ownlang:"Euskara",						integrated:false,		dic:false},
		"be":			{name:"Belarusian",					id:"be",		ownlang:"Беларуская",					integrated:false,		dic:false},
		"bn":			{name:"Bengali",					id:"bn",		ownlang:"বাংলা",							integrated:false,		dic:false},
		"bs":			{name:"Bosnian",					id:"bs",		ownlang:"Босански",						integrated:false,		dic:false},
		"bg":			{name:"Bulgarian",					id:"bg",		ownlang:"български",					integrated:true,		dic:false},
		"my":			{name:"Burmese",					id:"my",		ownlang:"မြန်မာစာ",						integrated:false,		dic:false},
		"ca":			{name:"Catalan",					id:"ca",		ownlang:"Català",						integrated:false,		dic:false},
		"ceb":			{name:"Cebuano",					id:"ceb",		ownlang:"Bisaya",						integrated:false,		dic:false},
		"ny":			{name:"Chewa",						id:"ny",		ownlang:"Nyanja",						integrated:false,		dic:false},
		"zh-HK":		{name:"Chinese (Hong Kong)",		id:"zh-HK",		ownlang:"香港中文",						integrated:false,		dic:false},
		"zh-CN":		{name:"Chinese (Simplified)",		id:"zh-CN",		ownlang:"简体中文",						integrated:false,		dic:false},
		"zh-TW":		{name:"Chinese (Traditional)",		id:"zh-TW",		ownlang:"繁體中文",						integrated:true,		dic:false},
		"co":			{name:"Corsican",					id:"co",		ownlang:"Corsu",						integrated:false,		dic:false},
		"hr":			{name:"Croatian",					id:"hr",		ownlang:"Hrvatski",						integrated:true,		dic:false},
		"cs":			{name:"Czech",						id:"cs",		ownlang:"Čeština",						integrated:true,		dic:false},
		"da":			{name:"Danish",						id:"da",		ownlang:"Dansk",						integrated:true,		dic:true},
		"nl":			{name:"Dutch",						id:"nl",		ownlang:"Nederlands",					integrated:true,		dic:true},
		"en":			{name:"English",					id:"en",		ownlang:"English",						integrated:false,		dic:true},
		"en-GB":		{name:"English (UK)",				id:"en-GB",		ownlang:"English (UK)",					integrated:true,		dic:true},
		"en-US":		{name:"English (US)",				id:"en-US",		ownlang:"English (US)",					integrated:true,		dic:true},
		"eo":			{name:"Esperanto",					id:"eo",		ownlang:"Esperanto",					integrated:false,		dic:false},
		"et":			{name:"Estonian",					id:"et",		ownlang:"Eesti",						integrated:false,		dic:false},
		"fil":			{name:"Filipino",					id:"fil",		ownlang:"Wikang Filipino",				integrated:false,		dic:false},
		"fi":			{name:"Finnish",					id:"fi",		ownlang:"Suomi",						integrated:true,		dic:false},
		"fr":			{name:"French",						id:"fr",		ownlang:"Français",						integrated:true,		dic:true},
		"fr-CA":		{name:"French (Canadian)",			id:"fr-CA",		ownlang:"Français Canadien",			integrated:false,		dic:false},
		"fy":			{name:"Frisian",					id:"fy",		ownlang:"Frysk",						integrated:false,		dic:false},
		"gl":			{name:"Galician",					id:"gl",		ownlang:"Galego",						integrated:false,		dic:false},
		"ka":			{name:"Georgian",					id:"ka",		ownlang:"ქართული",					integrated:false,		dic:false},
		"de":			{name:"German",						id:"de",		ownlang:"Deutsch",						integrated:true,		dic:true},
		"de-AT":		{name:"German (Austria)",			id:"de-AT",		ownlang:"Österreichisch Deutsch",		integrated:false,		dic:false},
		"de-CH":		{name:"German (Switzerland)",		id:"de-CH",		ownlang:"Schweizerdeutsch",				integrated:false,		dic:false},
		"el":			{name:"Greek",						id:"el",		ownlang:"Ελληνικά",						integrated:false,		dic:false},
		"gu":			{name:"Gujarati",					id:"gu",		ownlang:"ગુજરાતી",						integrated:false,		dic:false},
		"ht":			{name:"Haitian Creole",				id:"ht",		ownlang:"Kreyòl Ayisyen",				integrated:false,		dic:false},
		"ha":			{name:"Hausa",						id:"ha",		ownlang:"حَوْسَ",							integrated:false,		dic:false},
		"haw":			{name:"Hawaiian",					id:"haw",		ownlang:"ʻŌlelo Hawaiʻi",				integrated:false,		dic:false},
		"iw":			{name:"Hebrew",						id:"iw",		ownlang:"עברית",						integrated:false,		dic:false},
		"hi":			{name:"Hindi",						id:"hi",		ownlang:"हिन्दी",							integrated:false,		dic:false},
		"hmn":			{name:"Hmong",						id:"hmn",		ownlang:"lol Hmongb",					integrated:false,		dic:false},
		"hu":			{name:"Hungarain",					id:"hu",		ownlang:"Magyar",						integrated:false,		dic:false},
		"is":			{name:"Icelandic",					id:"is",		ownlang:"Íslenska",						integrated:false,		dic:false},
		"ig":			{name:"Igbo",						id:"ig",		ownlang:"Asụsụ Igbo",					integrated:false,		dic:false},
		"id":			{name:"Indonesian",					id:"id",		ownlang:"Bahasa Indonesia",				integrated:false,		dic:false},
		"ga":			{name:"Irish",						id:"ga",		ownlang:"Gaeilge",						integrated:false,		dic:false},
		"it":			{name:"Italian",					id:"it",		ownlang:"Italiano",						integrated:true,		dic:true},
		"ja":			{name:"Japanese",					id:"ja",		ownlang:"日本語",						integrated:true,		dic:false},
		"jv":			{name:"Javanese",					id:"jv",		ownlang:"ꦧꦱꦗꦮ",						integrated:false,		dic:false},
		"kn":			{name:"Kannada",					id:"kn",		ownlang:"ಕನ್ನಡ",							integrated:false,		dic:false},
		"kk":			{name:"Kazakh",						id:"kk",		ownlang:"Қазақ Tілі",					integrated:false,		dic:false},
		"km":			{name:"Khmer",						id:"km",		ownlang:"ភាសាខ្មែរ",						integrated:false,		dic:false},
		"ko":			{name:"Korean",						id:"ko",		ownlang:"한국어",						integrated:true,		dic:false},
		"ku":			{name:"Kurdish",					id:"ku",		ownlang:"کوردی",						integrated:false,		dic:false},
		"ky":			{name:"Kyrgyz",						id:"ky",		ownlang:"кыргызча",						integrated:false,		dic:false},
		"lo":			{name:"Lao",						id:"lo",		ownlang:"ພາສາລາວ",						integrated:false,		dic:false},
		"la":			{name:"Latin",						id:"la",		ownlang:"Latina",						integrated:false,		dic:false},
		"lv":			{name:"Latvian",					id:"lv",		ownlang:"Latviešu",						integrated:false,		dic:false},
		"lt":			{name:"Lithuanian",					id:"lt",		ownlang:"Lietuvių",						integrated:false,		dic:false},
		"lb":			{name:"Luxembourgish",				id:"lb",		ownlang:"Lëtzebuergesch",				integrated:false,		dic:false},
		"mk":			{name:"Macedonian",					id:"mk",		ownlang:"Mакедонски",					integrated:false,		dic:false},
		"mg":			{name:"Malagasy",					id:"mg",		ownlang:"Malagasy",						integrated:false,		dic:false},
		"ms":			{name:"Malay",						id:"ms",		ownlang:"بهاس ملايو",					integrated:false,		dic:false},
		"ml":			{name:"Malayalam",					id:"ml",		ownlang:"മലയാളം",						integrated:false,		dic:false},
		"mt":			{name:"Maltese",					id:"mt",		ownlang:"Malti",						integrated:false,		dic:false},
		"mi":			{name:"Maori",						id:"mi",		ownlang:"te Reo Māori",					integrated:false,		dic:false},
		"mr":			{name:"Marathi",					id:"mr",		ownlang:"मराठी",							integrated:false,		dic:false},
		"mn":			{name:"Mongolian",					id:"mn",		ownlang:"Монгол Хэл",					integrated:false,		dic:false},
		"ne":			{name:"Nepali",						id:"ne",		ownlang:"नेपाली",							integrated:false,		dic:false},
		"no":			{name:"Norwegian",					id:"no",		ownlang:"Norsk",						integrated:true,		dic:false},
		"ps":			{name:"Pashto",						id:"ps",		ownlang:"پښتو",							integrated:false,		dic:false},
		"fa":			{name:"Persian",					id:"fa",		ownlang:"فارسی",						integrated:false,		dic:false},
		"pl":			{name:"Polish",						id:"pl",		ownlang:"Polski",						integrated:true,		dic:false},
		"pt":			{name:"Portuguese",					id:"pt",		ownlang:"Português",					integrated:false,		dic:true},
		"pt-BR":		{name:"Portuguese (Brazil)",		id:"pt-BR",		ownlang:"Português do Brasil",			integrated:true,		dic:true},
		"pt-PT":		{name:"Portuguese (Portugal)",		id:"pt-PT",		ownlang:"Português do Portugal",		integrated:false,		dic:false},
		"pa":			{name:"Punjabi",					id:"pa",		ownlang:"पंजाबी",							integrated:false,		dic:false},
		"ro":			{name:"Romanian",					id:"ro",		ownlang:"Română",						integrated:false,		dic:false},
		"ru":			{name:"Russian",					id:"ru",		ownlang:"Pусский",						integrated:true,		dic:true},
		"sm":			{name:"Samoan",						id:"sm",		ownlang:"Gagana Sāmoa",					integrated:false,		dic:false},
		"gd":			{name:"Scottish Gaelic",			id:"gd",		ownlang:"Gàidhlig",						integrated:false,		dic:false},
		"sr":			{name:"Serbian",					id:"sr",		ownlang:"Српски",						integrated:false,		dic:false},
		"st":			{name:"Sotho",						id:"st",		ownlang:"Sesotho",						integrated:false,		dic:false},
		"sn":			{name:"Shona",						id:"sn",		ownlang:"Shona",						integrated:false,		dic:false},
		"sd":			{name:"Sindhi",						id:"sd",		ownlang:"سنڌي",							integrated:false,		dic:false},
		"si":			{name:"Sinhala",					id:"si",		ownlang:"සිංහල",						integrated:false,		dic:false},
		"sk":			{name:"Slovak",						id:"sk",		ownlang:"Slovenčina",					integrated:false,		dic:false},
		"sl":			{name:"Slovenian",					id:"sl",		ownlang:"Slovenščina",					integrated:false,		dic:false},
		"es":			{name:"Spanish",					id:"es",		ownlang:"Español",						integrated:true,		dic:true},
		"es-419":		{name:"Spanish (Latin America)",	id:"es-419",	ownlang:"Español latinoamericano",		integrated:false,		dic:false},
		"sw":			{name:"Swahili",					id:"sw",		ownlang:"Kiswahili",					integrated:false,		dic:false},
		"sv":			{name:"Swedish",					id:"sv",		ownlang:"Svenska",						integrated:true,		dic:true},
		"tg":			{name:"Tajik",						id:"tg",		ownlang:"тоҷикӣ",						integrated:false,		dic:false},
		"ta":			{name:"Tamil",						id:"ta",		ownlang:"தமிழ்",							integrated:false,		dic:false},
		"te":			{name:"Telugu",						id:"te",		ownlang:"తెలుగు",						integrated:false,		dic:false},
		"th":			{name:"Thai",						id:"th",		ownlang:"ภาษาไทย",						integrated:false,		dic:false},
		"tr":			{name:"Turkish",					id:"tr",		ownlang:"Türkçe",						integrated:true,		dic:false},
		"uk":			{name:"Ukrainian",					id:"uk",		ownlang:"Yкраїнський",					integrated:true,		dic:false},
		"ur":			{name:"Urdu",						id:"ur",		ownlang:"اُردُو",							integrated:false,		dic:false},
		"uz":			{name:"Uzbek",						id:"uz",		ownlang:"اوزبیک",						integrated:false,		dic:false},
		"vi":			{name:"Vietnamese",					id:"vi",		ownlang:"Tiếng Việt Nam",				integrated:false,		dic:false},
		"cy":			{name:"Welsh",						id:"cy",		ownlang:"Cymraeg",						integrated:false,		dic:false},
		"xh":			{name:"Xhosa",						id:"xh",		ownlang:"Xhosa",						integrated:false,		dic:false},
		"yi":			{name:"Yiddish",					id:"yi",		ownlang:"ייִדיש ייִדיש‬",					integrated:false,		dic:false},
		"yo":			{name:"Yoruba",						id:"yo",		ownlang:"Èdè Yorùbá",					integrated:false,		dic:false},
		"zu":			{name:"Zulu",						id:"zu",		ownlang:"Zulu",							integrated:false,		dic:false}
	};
	InternalBDFDB.LibraryStrings = {
		"hr": {
			toast_plugin_started: "{{var0}} je započeo.",
			toast_plugin_stopped: "{{var0}} zaustavljen.",
			toast_plugin_translated: "prijevod na {{var0}}.",
			file_navigator_text: "Pregledajte datoteku",
			btn_all_text: "Sve" //REMOVE
		},
		"da": {
			toast_plugin_started: "{{var0}} er startet.",
			toast_plugin_stopped: "{{var0}} er stoppet.",
			toast_plugin_translated: "oversat til {{var0}}.",
			file_navigator_text: "Gennemse fil",
			btn_all_text: "Alle"
		},
		"de": {
			toast_plugin_started: "{{var0}} wurde gestartet.",
			toast_plugin_stopped: "{{var0}} wurde gestoppt.",
			toast_plugin_translated: "auf {{var0}} übersetzt.",
			file_navigator_text: "Datei durchsuchen",
			btn_all_text: "Alle"
		},
		"es": {
			toast_plugin_started: "{{var0}} se guilddiv iniciado.",
			toast_plugin_stopped: "{{var0}} se guilddiv detenido.",
			toast_plugin_translated: "traducido a {{var0}}.",
			file_navigator_text: "Buscar archivo",
			btn_all_text: "Todo"
		},
		"fr": {
			toast_plugin_started: "{{var0}} a été démarré.",
			toast_plugin_stopped: "{{var0}} a été arrêté.",
			toast_plugin_translated: "traduit en {{var0}}.",
			file_navigator_text: "Parcourir le fichier",
			btn_all_text: "Tout"
		},
		"it": {
			toast_plugin_started: "{{var0}} è stato avviato.",
			toast_plugin_stopped: "{{var0}} è stato interrotto.",
			toast_plugin_translated: "tradotto in {{var0}}.",
			file_navigator_text: "Sfoglia file",
			btn_all_text: "Tutto"
		},
		"nl": {
			toast_plugin_started: "{{var0}} is gestart.",
			toast_plugin_stopped: "{{var0}} is gestopt.",
			toast_plugin_translated: "vertaald naar {{var0}}.",
			file_navigator_text: "Bestand zoeken",
			btn_all_text: "Alle"
		},
		"no": {
			toast_plugin_started: "{{var0}} er startet.",
			toast_plugin_stopped: "{{var0}} er stoppet.",
			toast_plugin_translated: "oversatt til {{var0}}.",
			file_navigator_text: "Bla gjennom fil",
			btn_all_text: "Alle"
		},
		"pl": {
			toast_plugin_started: "{{var0}} został uruchomiony.",
			toast_plugin_stopped: "{{var0}} został zatrzymany.",
			toast_plugin_translated: "przetłumaczono na {{var0}}.",
			file_navigator_text: "Przeglądać plik",
			btn_all_text: "Wszystkie"
		},
		"pt-BR": {
			toast_plugin_started: "{{var0}} foi iniciado.",
			toast_plugin_stopped: "{{var0}} foi interrompido.",
			toast_plugin_translated: "traduzido para {{var0}}.",
			file_navigator_text: "Procurar arquivo",
			btn_all_text: "Todo"
		},
		"fi": {
			toast_plugin_started: "{{var0}} on käynnistetty.",
			toast_plugin_stopped: "{{var0}} on pysäytetty.",
			toast_plugin_translated: "käännetty osoitteeseen {{var0}}.",
			file_navigator_text: "Selaa tiedostoa",
			btn_all_text: "Kaikki"
		},
		"sv": {
			toast_plugin_started: "{{var0}} har startats.",
			toast_plugin_stopped: "{{var0}} har blivit stoppad.",
			toast_plugin_translated: "översatt till {{var0}}.",
			file_navigator_text: "Bläddra i fil",
			btn_all_text: "All"
		},
		"tr": {
			toast_plugin_started: "{{var0}} başlatıldı.",
			toast_plugin_stopped: "{{var0}} durduruldu.",
			toast_plugin_translated: "{{var0}} olarak çevrildi.",
			file_navigator_text: "Dosyaya gözat",
			btn_all_text: "Her"
		},
		"cs": {
			toast_plugin_started: "{{var0}} byl spuštěn.",
			toast_plugin_stopped: "{{var0}} byl zastaven.",
			toast_plugin_translated: "přeložen do {{var0}}.",
			file_navigator_text: "Procházet soubor",
			btn_all_text: "Vše"
		},
		"bg": {
			toast_plugin_started: "{{var0}} е стартиран.",
			toast_plugin_stopped: "{{var0}} е спрян.",
			toast_plugin_translated: "преведена на {{var0}}.",
			file_navigator_text: "Прегледайте файла",
			btn_all_text: "Bсичко"
		},
		"ru": {
			toast_plugin_started: "{{var0}} запущен.",
			toast_plugin_stopped: "{{var0}} остановлен.",
			toast_plugin_translated: "переведен на {{var0}}.",
			file_navigator_text: "Просмотр файла",
			btn_all_text: "Все"
		},
		"uk": {
			toast_plugin_started: "{{var0}} було запущено.",
			toast_plugin_stopped: "{{var0}} було зупинено.",
			toast_plugin_translated: "перекладено {{var0}}.",
			file_navigator_text: "Перегляньте файл",
			btn_all_text: "Все"
		},
		"ja": {
			toast_plugin_started: "{{var0}}が開始されました.",
			toast_plugin_stopped: "{{var0}}が停止しました.",
			toast_plugin_translated: "は{{var0}}に翻訳されました.",
			file_navigator_text: "ファイルを参照",
			btn_all_text: "すべて"
		},
		"zh-TW": {
			toast_plugin_started: "{{var0}}已經啟動.",
			toast_plugin_stopped: "{{var0}}已停止.",
			toast_plugin_translated: "翻譯為{{var0}}.",
			file_navigator_text: "瀏覽文件",
			btn_all_text: "所有"
		},
		"ko": {
			toast_plugin_started: "{{var0}} 시작되었습니다.",
			toast_plugin_stopped: "{{var0}} 중지되었습니다.",
			toast_plugin_translated: "{{var0}} 로 번역되었습니다.",
			file_navigator_text: "파일 찾아보기",
			btn_all_text: "모든"
		},
		"default": {
			toast_plugin_started: "{{var0}} has been started.",
			toast_plugin_stopped: "{{var0}} has been stopped.",
			toast_plugin_translated: "translated to {{var0}}.",
			file_navigator_text: "Browse File",
			btn_all_text: "All"
		}
	};
	BDFDB.LanguageUtils.getLanguage = function () {
		var lang = document.querySelector("html").lang || "en-US";
		var langids = lang.split("-");
		var langid = langids[0];
		var langid2 = langids[1] || "";
		lang = langid2 && langid.toUpperCase() !== langid2.toUpperCase() ? langid + "-" + langid2 : langid;
		return BDFDB.LanguageUtils.languages[lang] || BDFDB.LanguageUtils.languages[langid] || BDFDB.LanguageUtils.languages["en-US"];
	};
	BDFDB.LanguageUtils.LanguageStrings = new Proxy(LanguageStrings, {
		get: function (list, item) {
			var stringobj = LibraryModules.LanguageStore.Messages[item];
			if (!stringobj) BDFDB.LogUtils.warn(item + " not found in BDFDB.LanguageUtils.LanguageStrings");
			else {
				if (stringobj && typeof stringobj == "object" && typeof stringobj.format == "function") return BDFDB.LanguageUtils.LanguageStringsFormat(item);
				else return stringobj;
			}
			return "";
		}
	});
	BDFDB.LanguageUtils.LanguageStringsCheck = new Proxy(LanguageStrings, {
		get: function (list, item) {
			return !!LibraryModules.LanguageStore.Messages[item];
		}
	});
	BDFDB.LanguageUtils.LanguageStringsFormat = function (item, ...values) {
		if (item) {
			var stringobj = LibraryModules.LanguageStore.Messages[item];
			if (stringobj && typeof stringobj == "object" && typeof stringobj.format == "function") {
				let i = 0, returnvalue, formatvars = {};
				while (!returnvalue && i < 10) {
					i++;
					try {returnvalue = stringobj.format(formatvars);}
					catch (err) {
						returnvalue = null;
						formatvars[err.toString().split("for: ")[1]] = values.shift() || "undefined";
					}
				}
				if (returnvalue) {
					if (BDFDB.ArrayUtils.is(returnvalue)) {
						let newstring = "";
						for (let ele of returnvalue) {
							if (typeof ele == "string") newstring += BDFDB.StringUtils.htmlEscape(ele);
							else if (BDFDB.ObjectUtils.is(ele) && ele.props) newstring += `<${ele.type}>${BDFDB.StringUtils.htmlEscape(ele.props.children[0].toString())}</${ele.type}>`
						}
						return newstring;
					}
					return returnvalue;
				}
				else {
					BDFDB.LogUtils.warn(item + " failed to format string in BDFDB.LanguageUtils.LanguageStrings");
					return "";
				}
			}
			else return BDFDB.LanguageUtils.LanguageStrings[item];
		}
		else BDFDB.LogUtils.warn(item + " enter a valid key to format the string in BDFDB.LanguageUtils.LanguageStrings");
		return "";
	};
	BDFDB.LanguageUtils.LibraryStrings = new Proxy(InternalBDFDB.LibraryStrings.default, {
		get: function (list, item) {
			let languageid = BDFDB.LanguageUtils.getLanguage().id;
			if (InternalBDFDB.LibraryStrings[languageid] && InternalBDFDB.LibraryStrings[languageid][item]) return InternalBDFDB.LibraryStrings[languageid][item];
			else if (InternalBDFDB.LibraryStrings.default[item]) return InternalBDFDB.LibraryStrings.default[item];
			else BDFDB.LogUtils.warn(item + " not found in BDFDB.LanguageUtils.LibraryStrings");
			return "";
		}
	});
	BDFDB.LanguageUtils.LibraryStringsCheck = new Proxy(LanguageStrings, {
		get: function (list, item) {
			return !!InternalBDFDB.LibraryStrings.default[item];
		}
	});
	BDFDB.LanguageUtils.LibraryStringsFormat = function (item, ...values) {
		if (item && values.length) {
			let languageid = BDFDB.LanguageUtils.getLanguage().id, string = null;
			if (InternalBDFDB.LibraryStrings[languageid] && InternalBDFDB.LibraryStrings[languageid][item]) string = InternalBDFDB.LibraryStrings[languageid][item];
			else if (InternalBDFDB.LibraryStrings.default[item]) string = InternalBDFDB.LibraryStrings.default[item];
			if (string) {
				for (let i = 0; i < values.length; i++) if (typeof values[i] == "string") string = string.replace(new RegExp(`{{var${i}}}`, "g"), values[i]);
				return string;
			}
			else BDFDB.LogUtils.warn(item + " not found in BDFDB.LanguageUtils.LibraryStrings");
		}
		else BDFDB.LogUtils.warn(item + " enter a valid key and at least one value to format the string in BDFDB.LanguageUtils.LibraryStrings");
		return "";
	};
	var initDiscordLanguageInterval = (_ => {
		if (document.querySelector("html").lang) {
			BDFDB.TimeUtils.clear(initDiscordLanguageInterval);
			var language = BDFDB.LanguageUtils.getLanguage();
			BDFDB.LanguageUtils.languages.$discord.name = `Discord (${language.name})`;
			BDFDB.LanguageUtils.languages.$discord.id = language.id;
			BDFDB.LanguageUtils.languages.$discord.ownlang = language.ownlang;
		}
	}, 100);
	
	var NativeSubComponents = {}, LibraryComponents = {}, reactInitialized = LibraryModules.React && LibraryModules.React.Component;
	NativeSubComponents.Button = BDFDB.ModuleUtils.findByProperties("Colors", "Hovers", "Looks");
	NativeSubComponents.ContextMenuToggleItem = BDFDB.ModuleUtils.findByName("ToggleMenuItem");
	NativeSubComponents.FavButton = BDFDB.ModuleUtils.findByName("GIFFavButton");
	NativeSubComponents.PopoutContainer = BDFDB.ModuleUtils.findByName("Popout");
	NativeSubComponents.QuickSelect = BDFDB.ModuleUtils.findByName("QuickSelectWrapper");
	NativeSubComponents.SearchBar = BDFDB.ModuleUtils.find(m => m && m.displayName == "SearchBar" && m.defaultProps.placeholder == BDFDB.LanguageUtils.LanguageStrings.SEARCH);
	NativeSubComponents.Select = BDFDB.ModuleUtils.findByName("SelectTempWrapper");
	NativeSubComponents.Switch = BDFDB.ModuleUtils.findByName("Switch");
	NativeSubComponents.TabBar = BDFDB.ModuleUtils.findByName("TabBar");
	NativeSubComponents.Table = BDFDB.ModuleUtils.findByName("Table");
	NativeSubComponents.TextArea = BDFDB.ModuleUtils.findByName("TextArea");
	NativeSubComponents.TextInput = BDFDB.ModuleUtils.findByName("TextInput");
	NativeSubComponents.TooltipContainer = BDFDB.ModuleUtils.findByName("Tooltip");
	
	
	LibraryComponents.Anchor = BDFDB.ModuleUtils.findByName("Anchor");
	
	LibraryComponents.BadgeComponents = Object.assign({}, BDFDB.ModuleUtils.findByProperties("IconBadge", "NumberBadge"));
	
	LibraryComponents.BotTag = reactInitialized ? class BDFDB_BotTag extends LibraryModules.React.Component {
		handleClick(e) {if (typeof this.props.onClick == "function") this.props.onClick(e, this);}
		handleContextMenu(e) {if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);}
		render() {
			return BDFDB.ReactUtils.createElement("span", {
				className: BDFDB.DOMUtils.formatClassName(this.props.invertColor ? BDFDB.disCN.bottaginvert : BDFDB.disCN.bottagregular, this.props.className),
				style: this.props.style,
				onClick: this.handleClick.bind(this),
				onContextMenu: this.handleContextMenu.bind(this),
				children: this.props.tag || BDFDB.LanguageUtils.LanguageStrings.BOT_TAG_BOT
			});
		}
	} : LibraryComponents.BotTag;
	
	LibraryComponents.Button = reactInitialized ? class BDFDB_Button extends LibraryModules.React.Component {
		handleClick(e) {if (typeof this.props.onClick == "function") this.props.onClick(e, this);}
		handleContextMenu(e) {if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);}
		handleMouseDown(e) {if (typeof this.props.onMouseDown == "function") this.props.onMouseDown(e, this);}
		handleMouseUp(e) {if (typeof this.props.onMouseUp == "function") this.props.onMouseUp(e, this);}
		handleMouseEnter(e) {if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);}
		handleMouseLeave(e) {if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);}
		render() {
			let processingAndListening = (this.props.disabled || this.props.submitting) && (null != this.props.onMouseEnter || null != this.props.onMouseLeave);
			let props = BDFDB.ObjectUtils.exclude(this.props, "look", "color", "hover", "size", "fullWidth", "grow", "disabled", "submitting", "type", "style", "wrapperClassName", "className", "innerClassName", "onClick", "onContextMenu", "onMouseDown", "onMouseUp", "onMouseEnter", "onMouseLeave", "children", "rel");
			let button = BDFDB.ReactUtils.createElement("button", Object.assign({}, !this.props.disabled && !this.props.submitting && props, {
				className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.button, this.props.look != null ? this.props.look : LibraryComponents.Button.Looks.FILLED, this.props.color != null ? this.props.color : LibraryComponents.Button.Colors.BRAND, this.props.hover, this.props.size != null ? this.props.size : LibraryComponents.Button.Sizes.MEDIUM, processingAndListening && this.props.wrapperClassName, this.props.fullWidth && BDFDB.disCN.buttonfullwidth, (this.props.grow === undefined || this.props.grow) && BDFDB.disCN.buttongrow, this.props.hover && this.props.hover !== LibraryComponents.Button.Hovers.DEFAULT && BDFDB.disCN.buttonhashover, this.props.submitting && BDFDB.disCN.buttonsubmitting, this.props.disabled && BDFDB.disCN.buttondisabled),
				onClick: (this.props.disabled || this.props.submitting) ? e => {return e.preventDefault();} : this.handleClick.bind(this),
				onContextMenu: (this.props.disabled || this.props.submitting) ? e => {return e.preventDefault();} : this.handleContextMenu.bind(this),
				onMouseUp: !this.props.disabled && this.handleMouseDown.bind(this),
				onMouseDown: !this.props.disabled && this.handleMouseUp.bind(this),
				onMouseEnter: this.handleMouseEnter.bind(this),
				onMouseLeave: this.handleMouseLeave.bind(this),
				type: this.props.type === "undefined" ? "button" : this.props.type,
				disabled: this.props.disabled,
				style: this.props.style,
				rel: this.props.rel,
				children: [
					this.props.submitting && !this.props.disabled ? BDFDB.ReactUtils.createElement(LibraryComponents.Spinner, {
						type: LibraryComponents.Spinner.Type.PULSING_ELLIPSIS,
						className: BDFDB.disCN.buttonspinner,
						itemClassName: BDFDB.disCN.buttonspinneritem
					}) : null,
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.buttoncontents, this.props.innerClassName),
						children: this.props.children
					})
				]
			}));
			return !processingAndListening ? button : BDFDB.ReactUtils.createElement("span", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.buttondisabledwrapper, this.props.wrapperClassName, this.props.size != null ? this.props.size : LibraryComponents.Button.Sizes.MEDIUM, this.props.fullWidth && BDFDB.disCN.buttonfullwidth, (this.props.grow === undefined || this.props.grow) && BDFDB.disCN.buttongrow),
				children: [
					button,
					BDFDB.ReactUtils.createElement("span", {
						onMouseEnter: this.handleMouseEnter.bind(this),
						onMouseLeave: this.handleMouseLeave.bind(this),
						className: BDFDB.disCN.buttondisabledoverlay
					})
				]
			});
		}
	} : LibraryComponents.Button;
	
	LibraryComponents.Card = reactInitialized ? class BDFDB_Card extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.hovercardwrapper, (this.props.backdrop || this.props.backdrop === undefined) && BDFDB.disCN.hovercard, this.props.className),
				direction: this.props.direction,
				justify: this.props.justify,
				align: this.props.align,
				wrap: this.props.wrap,
				style: this.props.style,
				onMouseEnter: e => {if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);},
				onMouseLeave: e => {if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);},
				onClick: e => {if (typeof this.props.onClick == "function") this.props.onClick(e, this);},
				onContextMenu: e => {if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);},
				children: [
					!this.props.noRemove ? BDFDB.ReactUtils.createElement(LibraryComponents.CardRemoveButton, {
						onClick: e => {
							if (typeof this.props.onRemove == "function") this.props.onRemove(e, this);
							BDFDB.ListenerUtils.stopEvent(e);
						}
					}) : null
				].concat(this.props.children)
			});
		}
	} : LibraryComponents.Card;
	
	LibraryComponents.CardRemoveButton = BDFDB.ModuleUtils.findByName("RemoveButton");
	
	LibraryComponents.ChannelTextAreaButton = reactInitialized ? class BDFDB_ChannelTextAreaButton extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement(LibraryComponents.Button, {
				look: LibraryComponents.Button.Looks.BLANK,
				size: LibraryComponents.Button.Sizes.NONE,
				"aria-label": this.props.label,
				tabIndex: this.props.tabIndex,
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.textareabuttonwrapper, this.props.isActive && BDFDB.disCN.textareabuttonactive),
				innerClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.textareabutton, this.props.className, this.props.pulse && BDFDB.disCN.textareaattachbuttonplus),
				onClick: this.props.onClick,
				onContextMenu: this.props.onContextMenu,
				onMouseEnter: this.props.onMouseEnter,
				onMouseLeave: this.props.onMouseLeave,
				children: BDFDB.ReactUtils.createElement(LibraryComponents.SvgIcon, {
					name: this.props.iconName,
					iconSVG: this.props.iconSVG,
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.textareaicon, this.props.iconClassName, this.props.pulse && BDFDB.disCN.textareaiconpulse)
				})
			});
		}
	} : LibraryComponents.ChannelTextAreaButton;
	
	LibraryComponents.CharCounter = reactInitialized ? class BDFDB_CharCounter extends LibraryModules.React.Component {
		getCounterString() {
			let input = this.refElement || {};
			let string = input.value || "", start = input.selectionStart || 0, end = input.selectionEnd || 0;
			let length = this.props.parsing ? BDFDB.StringUtils.getParsedLength(string) : string.length;
			let select = end - start == 0 ? 0 : (this.props.parsing ? BDFDB.StringUtils.getParsedLength(string.slice(start, end)) : (end - start));
			select = !select ? 0 : (select > length ? length - (length - end - start) : select);
			let children = [
				typeof this.props.renderPrefix == "function" && this.props.renderPrefix(length),
				`${length}${!this.props.max ? "" : "/" + this.props.max}${!select ? "" : " (" + select + ")"}`,
				typeof this.props.renderSuffix == "function" && this.props.renderSuffix(length)
			].filter(n => n);
			return children.length == 1 ? children[0] : BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
				align: LibraryComponents.Flex.Align.CENTER,
				children: children
			});
		}
		updateCounter() {
			if (!this.refElement) return;
			BDFDB.TimeUtils.clear(this.updateTimeout);
			this.updateTimeout = BDFDB.TimeUtils.timeout(this.forceUpdateCounter.bind(this), 100);
		}
		forceUpdateCounter() {
			if (!this.refElement) return;
			this.props.children = this.getCounterString();
			BDFDB.ReactUtils.forceUpdate(this);
		}
		handleSelection() {
			if (!this.refElement) return;
			let mousemove = () => {
				BDFDB.TimeUtils.timeout(this.forceUpdateCounter.bind(this), 10);
			};
			let mouseup = () => {
				document.removeEventListener("mousemove", mousemove);
				document.removeEventListener("mouseup", mouseup);
				if (this.refElement.selectionEnd - this.refElement.selectionStart) BDFDB.TimeUtils.timeout(() => {
					document.addEventListener("click", click);
				});
			};
			let click = () => {
				var contexttype = BDFDB.ReactUtils.getValue(document.querySelector(BDFDB.dotCN.contextmenu), "return.stateNode.props.type");
				if (!contexttype || !contexttype.startsWith("CHANNEL_TEXT_AREA")) this.forceUpdateCounter();
				BDFDB.TimeUtils.timeout(this.forceUpdateCounter.bind(this), 100);
				document.removeEventListener("mousemove", mousemove);
				document.removeEventListener("mouseup", mouseup);
				document.removeEventListener("click", click);
			};
			document.addEventListener("mousemove", mousemove);
			document.addEventListener("mouseup", mouseup);
		}
		componentDidMount() {
			if (this.props.refClass) {
				let node = BDFDB.ReactUtils.findDOMNode(this);
				if (node) {
					this.refElement = node.parentElement.querySelector(this.props.refClass);
					if (this.refElement) {
						if (!this._updateCounter) this._updateCounter = () => {
							if (!document.contains(node)) BDFDB.ListenerUtils.multiRemove(this.refElement, "keydown click change", this._updateCounter);
							else this.updateCounter();
						};
						if (!this._handleSelection) this._handleSelection = () => {
							if (!document.contains(node)) BDFDB.ListenerUtils.multiRemove(this.refElement, "mousedown", this._handleSelection);
							else this.handleSelection();
						};
						BDFDB.ListenerUtils.multiRemove(this.refElement, "keydown click change", this._updateCounter);
						BDFDB.ListenerUtils.multiRemove(this.refElement, "mousedown", this._handleSelection);
						BDFDB.ListenerUtils.multiAdd(this.refElement, "keydown click change", this._updateCounter);
						BDFDB.ListenerUtils.multiAdd(this.refElement, "mousedown", this._handleSelection);
						this.updateCounter();
					}
					else BDFDB.LogUtils.warn("could not find referenceElement for BDFDB_CharCounter");
				}
			}
			else BDFDB.LogUtils.warn("refClass can not be undefined for BDFDB_CharCounter");
		}
		render() {;
			return BDFDB.ReactUtils.createElement("div", BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.charcounter, this.props.className),
				children: this.getCounterString()
			}), "parsing", "max", "refClass", "renderPrefix", "renderSuffix"));
		}
	} : LibraryComponents.CharCounter;
	
	LibraryComponents.Clickable = BDFDB.ModuleUtils.findByName("Clickable");
	
	LibraryComponents.CollapseContainer = reactInitialized ? class BDFDB_CollapseContainer extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.DOMUtils.formatClassName(this.props.collapsed ? BDFDB.disCN.collapsecontainercollapsed : BDFDB.disCN.collapsecontainer, this.props.className),
				id: this.props.id,
				children: [
					this.props.dividertop ? BDFDB.ReactUtils.createElement(LibraryComponents.FormComponents.FormDivider, {
						className: this.props.mini ? BDFDB.disCN.marginbottom8 : BDFDB.disCN.marginbottom20
					}) : null,
					BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
						className: BDFDB.disCNS.collapsecontainerheader + BDFDB.disCN.cursorpointer,
						align: LibraryComponents.Flex.Align.CENTER,
						onClick: e => {
							this.props.collapsed = !this.props.collapsed;
							BDFDB.ReactUtils.forceUpdate(this);
							if (typeof this.props.onClick == "function") this.props.onClick(this.props.collapsed, this);
						},
						children: [
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.collapsecontainerarrow
							}),
							BDFDB.ReactUtils.createElement(LibraryComponents.FormComponents.FormTitle, {
								tag: LibraryComponents.FormComponents.FormTitle.Tags.H2,
								className: BDFDB.disCNS.collapsecontainertitle + BDFDB.disCN.cursorpointer,
								children: this.props.title
							})
						]
					}),
					!this.props.collapsed ? BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.collapsecontainerinner,
						children: this.props.children
					}) : null,
					this.props.dividerbottom ? BDFDB.ReactUtils.createElement(LibraryComponents.FormComponents.FormDivider, {
						className: this.props.mini ? BDFDB.disCN.margintop8 : BDFDB.disCN.margintop20
					}) : null
				]
			});
		}
	} : LibraryComponents.CollapseContainer;
	
	LibraryComponents.ColorSwatches = reactInitialized ? class BDFDB_ColorSwatches extends LibraryModules.React.Component {
		constructor(props) {
			super(props);
			
			props.selectedColor = BDFDB.ObjectUtils.is(props.color) ? props.color : BDFDB.ColorUtils.convert(props.color, "RGBA");
			props.colors = (BDFDB.ArrayUtils.is(props.colors) ? props.colors : [null, 5433630, 3066993, 1752220, 3447003, 3429595, 8789737, 10181046, 15277667, 15286558, 15158332, 15105570, 15844367, 13094093, 7372936, 6513507, 16777215, 3910932, 2067276, 1146986, 2123412, 2111892, 7148717, 7419530, 11342935, 11345940, 10038562, 11027200, 12745742, 9936031, 6121581, 2894892]).map(c => BDFDB.ColorUtils.convert(c, "RGBA"));
			props.colorRows = props.colors.length ? [props.colors.slice(0, parseInt(props.colors.length/2)), props.colors.slice(parseInt(props.colors.length/2))] : [];
			props.customColor = props.selectedColor != null ? (props.colors.indexOf(props.selectedColor) > -1 ? null : props.selectedColor) : null;
			props.customSelected = !!props.customColor;
			props.pickerConfig = BDFDB.ObjectUtils.is(props.pickerConfig) ? props.pickerConfig : {gradient: true, alpha: true, callback: _ => {}};
			this.state = props;
			
			var swatches = this;
			this.ColorSwatch = class ColorSwatch extends LibraryModules.React.Component {
				render() {
					let usewhite = !BDFDB.ColorUtils.isBright(this.props.color);
					let swatch = BDFDB.ReactUtils.createElement("button", {
						type: "button",
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.colorpickerswatch, this.props.isSingle && BDFDB.disCN.colorpickerswatchsingle, this.props.isDisabled && BDFDB.disCN.colorpickerswatchdisabled, this.props.isSelected && BDFDB.disCN.colorpickerswatchselected, this.props.isCustom && BDFDB.disCN.colorpickerswatchcustom, this.props.color == null && BDFDB.disCN.colorpickerswatchnocolor),
						number: this.props.number,
						disabled: this.props.isDisabled,
						onClick: _ => {
							if (!this.props.isSelected) {
								let color = this.props.isCustom && this.props.color == null ? "rgba(0,0,0,1)" : this.props.color;
								swatches.setState({
									selectedColor: color,
									customColor: this.props.isCustom ? color : swatches.state.customColor,
									customSelected: this.props.isCustom
								});
							}
							if (this.props.isCustom || this.props.isSingle) {
								let swatch = BDFDB.ReactUtils.findDOMNode(this);
								if (swatch) BDFDB.ColorUtils.openPicker(swatches, swatch, this.props.color, swatches.state.pickerConfig);
							};
						},
						style: Object.assign({}, this.props.style, {
							background: BDFDB.ObjectUtils.is(this.props.color) ? BDFDB.ColorUtils.createGradient(this.props.color) : BDFDB.ColorUtils.convert(this.props.color, "RGBA")
						}),
						children: [
							this.props.isCustom || this.props.isSingle ? BDFDB.ReactUtils.createElement(LibraryComponents.SvgIcon, {
								className: BDFDB.disCN.colorpickerswatchdropper,
								foreground: BDFDB.disCN.colorpickerswatchdropperfg,
								name: LibraryComponents.SvgIcon.Names.DROPPER,
								width: this.props.isCustom ? 14 : 10,
								height: this.props.isCustom ? 14 : 10,
								color: usewhite ? BDFDB.DiscordConstants.Colors.WHITE : BDFDB.DiscordConstants.Colors.BLACK
							}) : null,
							this.props.isSelected && !this.props.isSingle ? BDFDB.ReactUtils.createElement(LibraryComponents.SvgIcon, {
								name: LibraryComponents.SvgIcon.Names.CHECKMARK,
								width: this.props.isCustom ? 32 : 16,
								height: this.props.isCustom ? 24 : 16,
								color: usewhite ? BDFDB.DiscordConstants.Colors.WHITE : BDFDB.DiscordConstants.Colors.BLACK
							}) : null
						]
					});
					return this.props.isCustom || this.props.isSingle || this.props.color == null ? BDFDB.ReactUtils.createElement(LibraryComponents.TooltipContainer, {
						text: this.props.isCustom || this.props.isSingle ? BDFDB.LanguageUtils.LanguageStrings.CUSTOM_COLOR : BDFDB.LanguageUtils.LanguageStrings.DEFAULT,
						tooltipConfig: {position: this.props.isSingle ? "top" : "bottom"},
						children: swatch
					}) : swatch;
				}
			}
		}
		renderRow(colors) {
			return BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
				className: BDFDB.disCN.colorpickerrow,
				wrap: LibraryComponents.Flex.Wrap.WRAP,
				children: colors.map(color => {
					return BDFDB.ReactUtils.createElement(this.ColorSwatch, {
						color: color,
						isCustom: false,
						isSelected: !this.state.customSelected && color === this.state.selectedColor,
						isDisabled: this.state.disabled
					})
				})
			});
		}
		render() {
			let customSwatch = BDFDB.ReactUtils.createElement(this.ColorSwatch, {
				number: !this.state.colors.length ? (this.props.number != null ? this.props.number : 0) : null,
				color: this.state.customColor,
				isSingle: !this.state.colors.length,
				isCustom: this.state.colors.length,
				isSelected: this.state.customSelected,
				isDisabled: this.state.disabled,
				style: {margin: 0}
			});
			return !this.state.colors.length ? customSwatch : BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.colorpickerswatches, this.state.disabled && BDFDB.disCN.colorpickerswatchesdisabled),
				number: this.props.number != null ? this.props.number : 0,
				children: [
					BDFDB.ReactUtils.createElement(LibraryComponents.Flex.Child, {
						className: BDFDB.disCN.marginreset,
						shrink: 0,
						grow: 0,
						children: customSwatch
					}),
					this.state.colors.length ? BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
						direction: LibraryComponents.Flex.Direction.VERTICAL,
						className: BDFDB.disCN.flexmarginreset,
						grow: 1,
						children: [
							this.renderRow(this.state.colorRows[0]),
							this.renderRow(this.state.colorRows[1])
						]
					}) : null
				]
			})
		}
	} : LibraryComponents.ColorSwatches;
	
	LibraryComponents.ContextMenu = BDFDB.ModuleUtils.findByName("NativeContextMenu");
	
	LibraryComponents.ContextMenuItem = reactInitialized ? class BDFDB_ContextMenuItem extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement(LibraryComponents.Clickable, {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.contextmenuitem, !this.props.disabled && BDFDB.disCN.contextmenuitemclickable, this.props.danger && BDFDB.disCN.contextmenuitemdanger, this.props.disabled && BDFDB.disCN.contextmenuitemdisabled, this.props.brand && BDFDB.disCN.contextmenuitembrand, this.props.className),
				style: this.props.style,
				role: "menuitem",
				onClick: this.props.disabled || typeof this.props.action != "function" ? null : this.props.action,
				children: [
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.contextmenulabel,
						children: this.props.label
					}),
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.contextmenuhint,
						style: this.props.hint ? {
							width: 42,
							maxWidth: 42,
							marginLeft: 8
						} : {},
						children: this.props.hint ? BDFDB.ReactUtils.createElement(LibraryComponents.TextScroller, {
							speed: 2,
							children: this.props.hint
						}) : null
					}),
					this.props.children
				]
			});
		}
	} : LibraryComponents.ContextMenuItem;
	
	LibraryComponents.ContextMenuItemGroup = BDFDB.ModuleUtils.findByString(`"div",{className`, `default.itemGroup}`);
	
	LibraryComponents.ContextMenuSliderItem = BDFDB.ModuleUtils.findByName("SliderMenuItem");
	
	LibraryComponents.ContextMenuSubItem = BDFDB.ModuleUtils.findByName("FluxContainer(SubMenuItem)");
	
	LibraryComponents.ContextMenuToggleItem = reactInitialized ? class BDFDB_ContextMenuToggleItem extends LibraryModules.React.Component {
		handleToggle() {
			if (typeof this.props.action == "function") this.props.action(!this.props.active);
			this.props.active = !this.props.active;
			BDFDB.ReactUtils.forceUpdate(this);
		}
		render() {
			return BDFDB.ReactUtils.createElement(NativeSubComponents.ContextMenuToggleItem, Object.assign({}, this.props, {action: this.handleToggle.bind(this)}));
		}
	} : LibraryComponents.ContextMenuToggleItem;
	
	LibraryComponents.FavButton = reactInitialized ? class BDFDB_FavButton extends LibraryModules.React.Component {
		handleClick() {
			this.props.isFavorite = !this.props.isFavorite;
			BDFDB.ReactUtils.forceUpdate(this);
			if (typeof this.props.onClick == "function") this.props.onClick(this.props.isFavorite, this);
		}
		render() {
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN.favbuttoncontainer,
				children: BDFDB.ReactUtils.createElement(NativeSubComponents.FavButton, Object.assign({}, this.props, {onClick: this.handleClick.bind(this)}))
			});
		}
	} : LibraryComponents.FavButton;
	
	LibraryComponents.FileButton = reactInitialized ? class BDFDB_FileButton extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement(LibraryComponents.Button, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
				onClick: e => {e.currentTarget.querySelector("input").click();},
				children: [
					BDFDB.LanguageUtils.LibraryStrings.file_navigator_text,
					BDFDB.ReactUtils.createElement("input", {
						type: "file",
						accept: this.props.filter && `${this.props.filter}/*`,
						style: {display: "none"},
						onChange: e => {
							let file = e.currentTarget.files[0];
							if (this.refInput && file && (!this.props.filter || file.type.indexOf(this.props.filter) == 0)) {
								this.refInput.props.value = `${this.props.mode == "url" ? "url('" : ""}data:${file.type};base64,${BDFDB.LibraryRequires.fs.readFileSync(file.path).toString("base64")}${this.props.mode ? "')" : ""}`;
								BDFDB.ReactUtils.forceUpdate(this.refInput);
							}
						}
					})
				]
			}), "filter"));
		}
	} : LibraryComponents.FileButton;
	
	LibraryComponents.Flex = BDFDB.ModuleUtils.findByProperties("Wrap", "Direction", "Child");
	
	LibraryComponents.FormComponents = Object.assign({}, BDFDB.ModuleUtils.findByProperties("FormSection", "FormText"));
	
	LibraryComponents.FormComponents.FormItem = reactInitialized ? class BDFDB_FormItem extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement("div", {
				className: this.props.className,
				style: this.props.style,
				children: [
					BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
						align: LibraryComponents.Flex.Align.BASELINE,
						children: [
							this.props.title != null || this.props.error != null ? BDFDB.ReactUtils.createElement(LibraryComponents.Flex.Child, {
								wrap: true,
								children: BDFDB.ReactUtils.createElement(LibraryComponents.FormComponents.FormTitle, {
									tag: this.props.tag || LibraryComponents.FormComponents.FormTitle.Tags.H5,
									disabled: this.props.disabled,
									required: this.props.required,
									error: this.props.error,
									className: this.props.titleClassName,
									children: this.props.title
								})
							}) : null,
							(BDFDB.ArrayUtils.is(this.props.titlechildren) ? this.props.titlechildren : Array.of(this.props.titlechildren))
						]
					}),
				].concat(this.props.children)
			});
		}
	} : LibraryComponents.FormComponents.FormItem;
	
	LibraryComponents.GuildComponents = Object.assign({}, BDFDB.ModuleUtils.findByProperties("Separator", "DragPlaceholder"));
	
	LibraryComponents.GuildComponents.BlobMask = BDFDB.ModuleUtils.findByName("BlobMask");
	
	LibraryComponents.GuildComponents.Guild = reactInitialized ? class BDFDB_Guild extends LibraryModules.React.Component {
		constructor(props) {
			super(props);
			this.state = {hovered: false};
		}
		handleMouseEnter(e) {
			if (!this.props.sorting) this.setState({hovered: true});
			if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);
		}
		handleMouseLeave(e) {
			if (!this.props.sorting) this.setState({hovered: false});
			if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);
		}
		handleMouseDown(e) {
			if (!this.props.unavailable && this.props.guild && this.props.selectedChannelId) LibraryModules.DirectMessageUtils.preload(this.props.guild.id, this.props.selectedChannelId);
			if (typeof this.props.onMouseDown == "function") this.props.onMouseDown(e, this);
		}
		handleContextMenu(e) {
			if (this.props.menu) BDFDB.GuildUtils.openMenu(this.props.guild);
			if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);
		}
		setRef(e) {
			if (typeof this.props.setRef == "function") this.props.setRef(this.props.guild.id, e)
		}
		render() {
			if (!this.props.guild) return;
			this.props.selectedChannelId = LibraryModules.LastChannelStore.getChannelId(this.props.guild.id);
			this.props.selected = this.props.state ? LibraryModules.LastGuildStore.getGuildId() == this.props.guild.id : false;
			this.props.unread = this.props.state ? LibraryModules.UnreadGuildUtils.hasUnread(this.props.guild.id) : false;
			this.props.badge = this.props.state ? LibraryModules.MentionUtils.getMentionCount(this.props.guild.id) : 0;
			this.props.audio = this.props.state ? (LibraryModules.ChannelStore.getChannel(LibraryModules.LastChannelStore.getVoiceChannelId()) || {}).guild_id == this.props.guild.id : false;
			this.props.video = this.props.state ? (LibraryModules.StreamUtils.getActiveStream() || {}).guildId == this.props.guild.id : false;
			var isDraggedGuild = this.props.draggingGuildId === this.props.guild.id;
			var Guild = isDraggedGuild ? BDFDB.ReactUtils.createElement("div", {
				children: BDFDB.ReactUtils.createElement(LibraryComponents.GuildComponents.DragPlaceholder, {})
			}) : BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN.guildcontainer,
				children: BDFDB.ReactUtils.createElement(LibraryComponents.GuildComponents.BlobMask, {
					selected: this.state.isDropHovering || this.props.selected || this.state.hovered,
					upperBadge: this.props.unavailable ? LibraryComponents.GuildComponents.renderUnavailableBadge() : LibraryComponents.GuildComponents.renderIconBadge(this.props.audio, this.props.video),
					lowerBadge: this.props.badge > 0 ? LibraryComponents.GuildComponents.renderMentionBadge(this.props.badge) : null,
					lowerBadgeWidth: LibraryComponents.BadgeComponents.getBadgeWidthForValue(this.props.badge),
					children: BDFDB.ReactUtils.createElement(LibraryComponents.NavItem, {
						to: {
							pathname: BDFDB.DiscordConstants.Routes.CHANNEL(this.props.guild.id, this.props.selectedChannelId),
							state: {
								analyticsSource: {
									page: BDFDB.DiscordConstants.AnalyticsPages.GUILD_CHANNEL,
									section: BDFDB.DiscordConstants.AnalyticsSections.CHANNEL_LIST,
									object: BDFDB.DiscordConstants.AnalyticsObjects.CHANNEL
								}
							}
						},
						name: this.props.guild.name,
						onMouseEnter: this.handleMouseEnter.bind(this),
						onMouseLeave: this.handleMouseLeave.bind(this),
						onMouseDown: this.handleMouseDown.bind(this),
						onContextMenu: this.handleContextMenu.bind(this),
						icon: this.props.guild.getIconURL(this.state.hovered && this.props.animatable ? "gif" : "jpg"),
						selected: this.props.selected || this.state.hovered
					})
				})
			});
				
			if (this.props.draggable && typeof this.props.connectDragSource == "function") Guild = this.props.connectDragSource(Guild);
			
			var children = [
				this.props.listItem || this.props.pill ? BDFDB.ReactUtils.createElement(LibraryComponents.GuildComponents.Pill, {
					hovered: !isDraggedGuild && this.state.hovered,
					selected: !isDraggedGuild && this.props.selected,
					unread: !isDraggedGuild && this.props.unread,
					className: BDFDB.disCN.guildpill
				}) : null,
				BDFDB.ReactUtils.createElement(LibraryComponents.TooltipContainer, {
					text: this.props.tooltip ? this.props.guild.name : null,
					tooltipConfig: Object.assign({type: "right"}, this.props.tooltipConfig),
					children: Guild
				})
			];
			return this.props.listItem ? LibraryComponents.GuildComponents.renderListItem(BDFDB.ReactUtils.createElement(BDFDB.ReactUtils.Fragment, {
				children: children
			}), null != this.props.setRef ? this.setRef : null) : BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN.guild,
				children: children
			});
		}
	} : LibraryComponents.GuildComponents.Guild;
	InternalBDFDB.setDefaultProps(LibraryComponents.GuildComponents.Guild, {menu:true, tooltip:true, state:false, draggable:false, sorting:false});
	
	LibraryComponents.GuildComponents.GuildDropTarget = BDFDB.ModuleUtils.findByName("GuildDropTarget");
	
	LibraryComponents.GuildComponents.Pill = BDFDB.ModuleUtils.findByString("opacity:1,height:", "20:8", "default.item");
	
	LibraryComponents.MessageComponents = Object.assign({}, BDFDB.ModuleUtils.findByProperties("Message", "MessageTimestamp"));
	
	LibraryComponents.MessageGroup = BDFDB.ModuleUtils.findByName("FluxContainer(ConnectedMessageGroup)");
	
	LibraryComponents.MessagesPopoutComponents = Object.assign({}, BDFDB.ModuleUtils.findByProperties("Header", "EmptyStateBottom"));
	
	LibraryComponents.MemberRole = reactInitialized ? class BDFDB_MemberRole extends LibraryModules.React.Component {
		render() {
			let color = BDFDB.ColorUtils.convert(this.props.role.colorString || BDFDB.DiscordConstants.Colors.PRIMARY_DARK_300, "RGB");
			return BDFDB.ReactUtils.createElement("li", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.userpopoutrole, this.props.className),
				style: {borderColor: BDFDB.ColorUtils.setAlpha(color, 0.6)},
				onContextMenu: this.handleContextMenu,
				children: [
					!this.props.noCircle ? BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.userpopoutrolecircle,
						style: {backgroundColor: color}
					}) : null,
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.userpopoutrolename,
						children: this.props.role.name
					})
				].filter(n => n)
			});
		}
	} : LibraryComponents.MemberRole;
	
	LibraryComponents.ModalComponents = Object.assign({}, BDFDB.ModuleUtils.findByProperties("ModalContent", "ModalFooter"));
	
	LibraryComponents.ModalComponents.ModalContent = reactInitialized ? class BDFDB_ModalContent extends LibraryModules.React.Component {
		render() {
			return this.props.scroller || this.props.scroller === undefined ? BDFDB.ReactUtils.createElement(LibraryComponents.ScrollerVertical, {
				outerClassName: BDFDB.disCN.modalcontent,
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.modalsubinner, this.props.className),
				theme: LibraryComponents.ScrollerVertical.Themes.GHOST_HAIRLINE,
				ref: this.props.scrollerRef,
				children: this.props.children
			}) : BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN.modalcontent,
				children: BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.modalsubinner, BDFDB.disCN.modalsubinnerscrollerless, this.props.className),
					children: this.props.children
				})
			});
		}
	} : LibraryComponents.ModalComponents.ModalContent;
	
	LibraryComponents.ModalComponents.ModalTabContent = reactInitialized ? class BDFDB_ModalTabContent extends LibraryModules.React.Component {
		render() {
			let childprops = Object.assign({}, this.props);
			BDFDB.ObjectUtils.delete(childprops, "open");
			return BDFDB.ReactUtils.createElement(LibraryComponents.Flex, Object.assign({tab:"unnamed"}, childprops, {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.modaltabcontent, this.props.open && BDFDB.disCN.modaltabcontentopen, this.props.className),
				direction: LibraryComponents.Flex.Direction.VERTICAL,
				align: LibraryComponents.Flex.Align.STRETCH,
				style: Object.assign({}, childprops.style, {
					display: this.props.open ? null : "none",
					marginTop: 10
				})
			}));
		}
	} : LibraryComponents.ModalComponents.ModalTabContent;
	
	LibraryComponents.NavItem = BDFDB.ModuleUtils.findByName("NavItem");
	
	LibraryComponents.Popout = reactInitialized ? class BDFDB_Popout extends LibraryModules.React.Component {
		componentWillUnmount() {
			delete this.props.containerInstance.popout;
			if (typeof this.props.onClose == "function") this.props.onClose(this.props.containerInstance, this);
		}
		render() {
			let pos = typeof this.props.position == "string" ? this.props.position.toLowerCase() : null;
			let position = pos && DiscordClasses["popout" + pos] ? BDFDB.disCN["popout" + pos] : BDFDB.disCN.popouttop;
			let arrow = !this.props.arrow ? BDFDB.disCN.popoutnoarrow : (pos && pos.indexOf("top") > -1 && pos != "top" ? BDFDB.disCN.popoutarrowalignmenttop : BDFDB.disCN.popoutarrowalignmentmiddle);
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.popoutwrapper, BDFDB.disCN.popout, position, this.props.invert && pos && pos != "bottom" && BDFDB.disCN.popoutinvert, arrow, !this.props.shadow && BDFDB.disCN.popoutnoshadow),
				id: this.props.id,
				onClick: e => {e.stopPropagation();},
				style: Object.assign({}, this.props.style, {
					position: this.props.isChild ? "relative" : "absolute"
				}),
				children: BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.DOMUtils.formatClassName(this.props.className, (this.props.themed || this.props.themed === undefined) && BDFDB.disCN.popoutthemedpopout),
					style: BDFDB.ObjectUtils.extract(this.props, "padding", "height", "maxHeight", "minHeight", "width", "maxWidth", "minWidth"),
					children: this.props.children
				})
			});
		}
	} : LibraryComponents.Popout;
	
	LibraryComponents.PopoutContainer = reactInitialized ? class BDFDB_PopoutContainer extends LibraryModules.React.Component {
		handleRender(e) {
			return this.popout = BDFDB.ReactUtils.createElement(LibraryComponents.Popout, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
				className: this.props.popoutClassName,
				containerInstance: this,
				isChild: true,
				position: e.position,
				style: this.props.popoutStyle,
				onClose: typeof this.props.onClose == "function" ? this.props.onClose.bind(this) : _ => {},
				children: typeof this.props.renderPopout == "function" ? this.props.renderPopout(this) : null
			}), "popoutStyle", "popoutClassName"));
		}
		componentDidMount() {
			let basepopout = BDFDB.ReactUtils.findOwner(this, {name:"BasePopout"});
			if (!basepopout || !basepopout.handleClick) return;
			this.handleClick = basepopout.handleClick;
			this.close = basepopout.close;
			this.domElementRef = basepopout.domElementRef;
		}
		render() {
			let child = (BDFDB.ArrayUtils.is(this.props.children) ? this.props.children[0] : this.props.children) || BDFDB.ReactUtils.createElement("div", {style: {height: "100%", width: "100%"}});
			child.props.className = BDFDB.DOMUtils.formatClassName(child.props.className, this.props.className);
			let childClick = child.props.onClick, childContextMenu = child.props.onContextMenu;
			child.props.onClick = (e, childthis) => {
				if (!this.domElementRef.current || this.domElementRef.current.contains(e.target)) {
					if ((this.props.openOnClick || this.props.openOnClick === undefined) && typeof this.handleClick == "function") this.handleClick();
					if (typeof this.props.onClick == "function") this.props.onClick(e, this);
					if (typeof childClick == "function") childClick(e, childthis);
				}
				else e.stopPropagation();
			};
			child.props.onContextMenu = (e, childthis) => {
				if (!this.domElementRef.current || this.domElementRef.current.contains(e.target)) {
					if (this.props.openOnContextMenu && typeof this.handleClick == "function") this.handleClick();
					if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);
					if (typeof childContextMenu == "function") childContextMenu(e, childthis);
				}
				else e.stopPropagation();
			};
			return BDFDB.ReactUtils.createElement(LibraryModules.React.Fragment, {
				children: BDFDB.ReactUtils.createElement(NativeSubComponents.PopoutContainer, Object.assign({}, this.props, {
					children: _ => {return child;},
					renderPopout: this.handleRender.bind(this),
					onRequestClose: (...args) => {console.log(...args);}
				}))
			});
		}
	} : LibraryComponents.PopoutContainer;
	
	LibraryComponents.QuickSelect = reactInitialized ? class BDFDB_QuickSelect extends LibraryModules.React.Component {
		handleChange(option) {
			this.props.value = option;
			BDFDB.ReactUtils.forceUpdate(this);
			if (typeof this.props.onChange == "function") this.props.onChange(option.value || option.key, this);
		}
		render() {
			let options = (BDFDB.ArrayUtils.is(this.props.options) ? this.props.options : [{}]).filter(n => n);
			let selectedOption = BDFDB.ObjectUtils.is(this.props.value) ? this.props.value : (options[0] || {});
			return this.props.nativeComponent ? BDFDB.ReactUtils.createElement(NativeSubComponents.QuickSelect, Object.assign({}, this.props, {
				className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.quickselectwrapper),
				popoutClassName: BDFDB.DOMUtils.formatClassName(this.props.popoutClassName, BDFDB.disCN.quickselectpopoutwrapper),
				popoutProps: {position: "bottom", zIndexBoost: 1000},
				value: selectedOption,
				options: options,
				renderOption: typeof this.props.renderOption == "function" ? this.props.renderOption : option => {return option.label;},
				onChange: this.handleChange.bind(this)
			})) : BDFDB.ReactUtils.createElement(LibraryComponents.PopoutContainer, Object.assign({}, this.props, {
				children: BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.quickselectwrapper),
					children: BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
						className: BDFDB.disCN.quickselect,
						align: LibraryComponents.Flex.Align.CENTER,
						children: [
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.quickselectlabel,
								children: this.props.label
							}),
							BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
								align: LibraryComponents.Flex.Align.CENTER,
								className: BDFDB.disCN.quickselectclick,
								children: [
									BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN.quickselectvalue,
										children: typeof this.props.renderValue == "function" ? this.props.renderValue(this.props.value) : this.props.value.label
									}),
									BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN.quickselectarrow
									})
								]
							})
						]
					})
				}),
				popoutClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.quickselectpopout, this.props.popoutClassName, BDFDB.disCN.contextmenu, BDFDB.disCN.quickselectpopoutwrapper, this.props.scroller && BDFDB.disCN.quickselectpopoutscroll),
				themed: false,
				animation: BDFDB.LibraryComponents.PopoutContainer.Animation.TRANSLATE,
				position: BDFDB.LibraryComponents.PopoutContainer.Positions.BOTTOM,
				align: BDFDB.LibraryComponents.PopoutContainer.Align.RIGHT,
				renderPopout: instance => {
					let items = options.map(option => {
						let selected = option.value && option.value === selectedOption.value || option.key && option.key === selectedOption.key;
						return typeof this.props.renderOption == "function" ? this.props.renderOption(option) : BDFDB.ReactUtils.createElement(LibraryComponents.ContextMenuItem, {
							className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.quickselectpopoutoption, selected && BDFDB.disCN.quickselectpopoutoptionselected),
							action: selected ? null : _ => {
								instance.close();
								this.handleChange.bind(this)(option)
							},
							label: option.label
						});
					});
					return this.props.scroller ? BDFDB.ReactUtils.createElement(LibraryComponents.ScrollerVertical, {
						className: BDFDB.disCN.quickselectscroller,
						children: items
					}) : items;
				}
			}));
		}
	} : LibraryComponents.QuickSelect;
	
	LibraryComponents.ScrollerHorizontal = BDFDB.ModuleUtils.findByName("HorizontalScroller");
	
	LibraryComponents.ScrollerVertical = BDFDB.ModuleUtils.findByName("VerticalScroller");
	
	LibraryComponents.SearchBar = reactInitialized ? class BDFDB_SearchBar extends LibraryModules.React.Component {
		handleChange(query) {
			this.props.query = query;
			BDFDB.ReactUtils.forceUpdate(this);
			if (typeof this.props.onChange == "function") this.props.onChange(query, this);
		}
		handleClear() {
			this.props.query = "";
			BDFDB.ReactUtils.forceUpdate(this);
			if (this.props.changeOnClear && typeof this.props.onChange == "function") this.props.onChange("", this);
			if (typeof this.props.onClear == "function") this.props.onClear(this);
		}
		render() {
			let props = Object.assign({}, this.props, {
				onChange: this.handleChange.bind(this),
				onClear: this.handleClear.bind(this)
			});
			if (typeof props.query != "string") props.query = "";
			return BDFDB.ReactUtils.createElement(NativeSubComponents.SearchBar, props);
		}
	} : LibraryComponents.SearchBar;
	
	LibraryComponents.Select = reactInitialized ? class BDFDB_Select extends LibraryModules.React.Component {
		handleChange(value) {
			this.props.value = value;
			BDFDB.ReactUtils.forceUpdate(this);
			if (typeof this.props.onChange == "function") this.props.onChange(value, this);
		}
		render() {
			return BDFDB.ReactUtils.createElement(NativeSubComponents.Select, Object.assign({}, this.props, {onChange: this.handleChange.bind(this)}));
		}
	} : LibraryComponents.Select;
	
	LibraryComponents.SettingsPanel = reactInitialized ? class BDFDB_SettingsPanel extends LibraryModules.React.Component {
		render() {
			return this.props.children ? BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
				direction: LibraryComponents.Flex.Direction.VERTICAL,
				grow: 1,
				children: [
					typeof this.props.title == "string" ? BDFDB.ReactUtils.createElement(LibraryComponents.FormComponents.FormTitle, {
						className: BDFDB.disCN.settingspaneltitle,
						tag: LibraryComponents.FormComponents.FormTitle.Tags.H2,
						children: this.props.title
					}) : null,
					typeof this.props.title == "string" ? BDFDB.ReactUtils.createElement(LibraryComponents.FormComponents.FormDivider, {
						className: BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom8
					}) : null,
					BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
						className: BDFDB.disCN.settingspanelinner,
						direction: LibraryComponents.Flex.Direction.VERTICAL,
						children: this.props.children
					})
				]
			}) : null;
		}
	} : LibraryComponents.SettingsPanel;
	
	LibraryComponents.SettingsPanelInner = reactInitialized ? class BDFDB_SettingsPanelInner extends LibraryModules.React.Component {
		render() {
			return this.props.children ? BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
				direction: LibraryComponents.Flex.Direction.VERTICAL,
				children: [
					!this.props.first ? BDFDB.ReactUtils.createElement(LibraryComponents.FormComponents.FormDivider, {
						className: BDFDB.disCN.marginbottom8
					}) : null,
					typeof this.props.title == "string" ? BDFDB.ReactUtils.createElement(LibraryComponents.FormComponents.FormTitle, {
						className: BDFDB.disCN.marginbottom4,
						tag: LibraryComponents.FormComponents.FormTitle.Tags.H3,
						children: this.props.title
					}) : null,
					BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
						className: BDFDB.disCN.settingspanellist,
						direction: LibraryComponents.Flex.Direction.VERTICAL,
						children: this.props.children
					}),
					!this.props.last ? BDFDB.ReactUtils.createElement(LibraryComponents.FormComponents.FormDivider, {
						className: BDFDB.disCN.marginbottom20
					}) : null
				]
			}) : null;
		}
	} : LibraryComponents.SettingsPanelInner;
	
	LibraryComponents.SettingsItem = reactInitialized ? class BDFDB_SettingsItem extends LibraryModules.React.Component {
		handleChange(value) {
			if (typeof this.props.onChange == "function") this.props.onChange(value, this);
		}
		render() {
			if (typeof this.props.type != "string" || !["BUTTON", "SELECT", "SWITCH", "TEXTINPUT"].includes(this.props.type.toUpperCase())) return null;
			let childcomponent = LibraryComponents[this.props.type];
			if (!childcomponent) return null;
			if (this.props.mini && childcomponent.Sizes) this.props.size = childcomponent.Sizes.MINI || childcomponent.Sizes.MIN;
			let childprops = BDFDB.ObjectUtils.exclude(Object.assign(BDFDB.ObjectUtils.exclude(this.props, "className", "id", "type"), this.props.childProps, {
				onChange: this.handleChange.bind(this)
			}), "basis", "dividerbottom", "dividertop", "label", "labelchildren", "mini", "note", "childProps");
			return BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
				className: BDFDB.DOMUtils.formatClassName(this.props.className, this.props.disabled && BDFDB.disCN.disabled),
				id: this.props.id,
				direction: LibraryComponents.Flex.Direction.VERTICAL,
				align: LibraryComponents.Flex.Align.STRETCH,
				children: [
					this.props.dividertop ? BDFDB.ReactUtils.createElement(LibraryComponents.FormComponents.FormDivider, {
						className: this.props.mini ? BDFDB.disCN.marginbottom8 : BDFDB.disCN.marginbottom20
					}) : null,
					BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
						align: LibraryComponents.Flex.Align.CENTER,
						children: [
							BDFDB.ReactUtils.createElement(LibraryComponents.Flex.Child, {
								children: BDFDB.ReactUtils.createElement(LibraryComponents.SettingsLabel, {
									mini: this.props.mini,
									label: this.props.label
								})
							}),
							(BDFDB.ArrayUtils.is(this.props.labelchildren) ? this.props.labelchildren : Array.of(this.props.labelchildren)),
							BDFDB.ReactUtils.createElement(LibraryComponents.Flex.Child, {
								grow: 0,
								shrink: this.props.basis ? 0 : 1,
								basis: this.props.basis,
								wrap: true,
								children: BDFDB.ReactUtils.createElement(childcomponent, childprops)
							})
						]
					}),
					typeof this.props.note == "string" ? BDFDB.ReactUtils.createElement(LibraryComponents.Flex.Child, {
						className: BDFDB.disCN.note,
						children: BDFDB.ReactUtils.createElement(LibraryComponents.FormComponents.FormText, {
							disabled: this.props.disabled,
							type: LibraryComponents.FormComponents.FormText.Types.DESCRIPTION,
							children: BDFDB.ReactUtils.createElement(LibraryComponents.TextScroller, {speed: 2, children: this.props.note})
						})
					}) : null,
					this.props.dividerbottom ? BDFDB.ReactUtils.createElement(LibraryComponents.FormComponents.FormDivider, {
						className: this.props.mini ? BDFDB.disCN.margintop8 : BDFDB.disCN.margintop20
					}) : null
				]
			});
		}
	} : LibraryComponents.SettingsItem;
	
	LibraryComponents.SettingsLabel = reactInitialized ? class BDFDB_SettingsLabel extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement(LibraryComponents.TextScroller, {
				className: BDFDB.DOMUtils.formatClassName(this.props.mini ? BDFDB.disCN.titlemini : BDFDB.disCN.titledefault, BDFDB.disCN.cursordefault),
				speed: 2,
				children: this.props.label
			});
		}	
	} : LibraryComponents.SettingsLabel;
	
	LibraryComponents.SettingsSaveItem = reactInitialized ? class BDFDB_SettingsSaveItem extends LibraryModules.React.Component {
		saveSettings(value) {
			if (!BDFDB.ArrayUtils.is(this.props.keys) || !BDFDB.ObjectUtils.is(this.props.plugin)) return;
			let keys = this.props.keys.filter(n => n);
			let option = keys.shift();
			if (BDFDB.ObjectUtils.is(this.props.plugin) && option) {
				let data = BDFDB.DataUtils.load(this.props.plugin, option);
				let newdata = "";
				for (let key of keys) newdata += `{"${key}":`;
				value = value != null && value.value != null ? value.value : value;
				let marker = typeof value == "string" ? `"` : ``;
				newdata += (marker + value + marker) + "}".repeat(keys.length);
				newdata = JSON.parse(newdata);
				if (BDFDB.ObjectUtils.is(newdata)) BDFDB.ObjectUtils.deepAssign(data, newdata);
				else data = newdata;
				BDFDB.DataUtils.save(data, this.props.plugin, option);
				this.props.plugin.SettingsUpdated = true;
			}
			if (typeof this.props.onChange == "function") this.props.onChange(value, this);
		}
		render() {
			if (typeof this.props.type != "string" || !["SELECT", "SWITCH", "TEXTINPUT"].includes(this.props.type.toUpperCase())) return null;
			let props = Object.assign({}, this.props, {
				onChange: this.saveSettings.bind(this)
			});
			BDFDB.ObjectUtils.delete(props, "keys", "plugin");
			return BDFDB.ReactUtils.createElement(LibraryComponents.SettingsItem, props);
		}
	} : LibraryComponents.SettingsSaveItem;
	
	LibraryComponents.SettingsSwitch = reactInitialized ? class BDFDB_SettingsSwitch extends LibraryModules.React.Component { // REMOVE
		render() {
			return BDFDB.ReactUtils.createElement(LibraryComponents.SettingsSaveItem, Object.assign({keys:[]}, this.props, {
				type: "Switch"
			}));
		}
	} : LibraryComponents.SettingsSwitch;
	
	LibraryComponents.Spinner = BDFDB.ModuleUtils.findByName("Spinner");
	
	LibraryComponents.SvgIcon = BDFDB.ModuleUtils.findByProperties("Gradients", "Names");
	
	LibraryComponents.Switch = reactInitialized ? class BDFDB_Switch extends LibraryModules.React.Component {
		handleChange() {
			this.props.value = !this.props.value;
			BDFDB.ReactUtils.forceUpdate(this);
			if (typeof this.props.onChange == "function") this.props.onChange(this.props.value, this);
		}
		render() {
			return BDFDB.ReactUtils.createElement(NativeSubComponents.Switch, Object.assign({}, this.props, {onChange: this.handleChange.bind(this)}));
		}
	} : LibraryComponents.Switch;
	
	LibraryComponents.TabBar = reactInitialized ? class BDFDB_TabBar extends LibraryModules.React.Component {
		handleItemSelect(item) {
			this.props.selectedItem = item;
			BDFDB.ReactUtils.forceUpdate(this);
			if (typeof this.props.onItemSelect == "function") this.props.onItemSelect(item, this);
		}
		render() {
			let items = (BDFDB.ArrayUtils.is(this.props.items) ? this.props.items : [{}]).filter(n => n);
			return BDFDB.ReactUtils.createElement(NativeSubComponents.TabBar, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
				selectedItem: this.props.selectedItem || (items[0] || {}).value,
				onItemSelect: this.handleItemSelect.bind(this),
				children: items.map(data => {
					return BDFDB.ReactUtils.createElement(LibraryComponents.TabBar.Item, {
						className: this.props.itemClassName,
						itemType: this.props.type,
						id: data.value,
						children: data.label || data.value,
						"aria-label": data.label || data.value
					})
				})
			}), "itemClassName", "items"));
		}
	} : LibraryComponents.TabBar;
	
	LibraryComponents.Table = reactInitialized ? class BDFDB_Table extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement(NativeSubComponents.Table, Object.assign({}, this.props, {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.table, this.props.className),
				headerClassName: BDFDB.DOMUtils.formatClassName(this.props.stickyHeader ? BDFDB.disCN.tablestickyheader : BDFDB.disCN.tableheader, this.props.headerClassName),
				headerCellClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tableheadercell, this.props.headerCellClassName),
				sortedHeaderCellClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tableheadercellsorted, this.props.sortedHeaderCellClassName),
				bodyCellClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tablebodycell, this.props.bodyCellClassName),
				rowClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tablerow, this.props.rowClassName),
				onSort: (sortKey, sortDirection) => {
					this.props.sortDirection = this.props.sortKey != sortKey && sortDirection == LibraryComponents.Table.SortDirection.ASCENDING && this.props.columns.filter(n => n.key == sortKey)[0].reverse ? LibraryComponents.Table.SortDirection.DESCENDING : sortDirection;
					this.props.sortKey = sortKey;
					this.props.data = BDFDB.ArrayUtils.keySort(this.props.data, this.props.sortKey);
					if (this.props.sortDirection == LibraryComponents.Table.SortDirection.DESCENDING) this.props.data.reverse();
					BDFDB.ReactUtils.forceUpdate(this);
					if (typeof this.props.onSort == "function") this.props.onSort(this.props.sortKey, this.props.sortDirection);
				}
			}));
		}
	} : LibraryComponents.Table;
	
	LibraryComponents.TextArea = reactInitialized ? class BDFDB_TextArea extends LibraryModules.React.Component {
		handleChange(e) {
			this.props.value = e;
			BDFDB.ReactUtils.forceUpdate(this);
			if (typeof this.props.onChange == "function") this.props.onChange(e, this);
		}
		handleBlur(e) {if (typeof this.props.onBlur == "function") this.props.onBlur(e, this);}
		handleFocus(e) {if (typeof this.props.onFocus == "function") this.props.onFocus(e, this);}
		render() {
			return BDFDB.ReactUtils.createElement(NativeSubComponents.TextArea, Object.assign({}, this.props, {
				onChange: this.handleChange.bind(this),
				onBlur: this.handleBlur.bind(this),
				onFocus: this.handleFocus.bind(this)
			}));
		}
	} : LibraryComponents.TextArea;
	
	LibraryComponents.TextElement = BDFDB.ModuleUtils.findByName("Text");
	
	LibraryComponents.TextInput = reactInitialized ? class BDFDB_TextInput extends LibraryModules.React.Component {
		handleChange(e) {
			e = BDFDB.ObjectUtils.is(e) ? e.currentTarget.value : e;
			this.props.value = e;
			BDFDB.ReactUtils.forceUpdate(this);
			if (typeof this.props.onChange == "function") this.props.onChange(e, this);
		}
		handleInput(e) {if (typeof this.props.onInput == "function") this.props.onInput(BDFDB.ObjectUtils.is(e) ? e.currentTarget.value : e, this);}
		handleKeyDown(e) {if (typeof this.props.onKeyDown == "function") this.props.onKeyDown(e, this);}
		handleBlur(e) {if (typeof this.props.onBlur == "function") this.props.onBlur(e, this);}
		handleFocus(e) {if (typeof this.props.onFocus == "function") this.props.onFocus(e, this);}
		handleMouseEnter(e) {if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);}
		handleMouseLeave(e) {if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);}
		handleNumberButton(ins, value) {
			BDFDB.TimeUtils.clear(ins.pressedTimeout);
			ins.pressedTimeout = BDFDB.TimeUtils.timeout(_ => {
				delete this.props.focused;
				BDFDB.ReactUtils.forceUpdate(this);
			}, 1000);
			this.props.focused = true;
			this.handleChange.bind(this)(value);
			this.handleInput.bind(this)(value);
		}
		componentDidMount() {
			let input = BDFDB.ReactUtils.findDOMNode(this);
			if (!input) return;
			input = input.querySelector("input") || input;
			if (input && !input.patched) {
				input.addEventListener("keydown", e => {
					this.handleKeyDown.bind(this)(e);
					e.stopImmediatePropagation();
				});
				input.patched = true;
			}
			if (this.props.type == "color") {
				let swatchinstance = BDFDB.ReactUtils.findOwner(this, {name: "BDFDB_ColorSwatches"});
				if (swatchinstance) swatchinstance.refInput = this;
			}
			else if (this.props.type == "file") {
				let navigatorinstance = BDFDB.ReactUtils.findOwner(this, {name: "BDFDB_FileButton"});
				if (navigatorinstance) navigatorinstance.refInput = this;
			}
		}
		render() {
			let children = [
				BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.inputwrapper, this.props.type == "number" && (this.props.size && LibraryComponents.TextInput.Sizes[this.props.size.toUpperCase()] && BDFDB.disCN["inputnumberwrapper" + this.props.size.toLowerCase()] || BDFDB.disCN.inputnumberwrapperdefault), this.props.className),
					style: this.props.style,
					children: [
						this.props.inputPrefix ? BDFDB.ReactUtils.createElement("span", {
							className: BDFDB.disCN.inputprefix
						}) : null,
						this.props.type == "number" ? BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.inputnumberbuttons,
							children: [
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.inputnumberbuttonup,
									onClick: e => {
										var min = parseInt(this.props.min);
										var max = parseInt(this.props.max);
										var newv = parseInt(this.props.value) + 1 || min || 0;
										if (isNaN(max) || !isNaN(max) && newv <= max) this.handleNumberButton.bind(this)(e._targetInst, isNaN(min) || !isNaN(min) && newv >= min ? newv : min);
									}
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.inputnumberbuttondown,
									onClick: e => {
										var min = parseInt(this.props.min);
										var max = parseInt(this.props.max);
										var newv = parseInt(this.props.value) - 1 || min || 0;
										if (isNaN(min) || !isNaN(min) && newv >= min) this.handleNumberButton.bind(this)(e._targetInst, isNaN(max) || !isNaN(max) && newv <= max ? newv : max);
									}
								})
							]
						}) : null,
						BDFDB.ReactUtils.createElement("input", BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
							className: BDFDB.DOMUtils.formatClassName(this.props.size && LibraryComponents.TextInput.Sizes[this.props.size.toUpperCase()] && BDFDB.disCN["input" + this.props.size.toLowerCase()] || BDFDB.disCN.inputdefault, this.props.inputClassName, this.props.focused && BDFDB.disCN.inputfocused, this.props.error || this.props.errorMessage ? BDFDB.disCN.inputerror : (this.props.success && BDFDB.disCN.inputsuccess), this.props.disabled && BDFDB.disCN.inputdisabled, this.props.editable && BDFDB.disCN.inputeditable),
							type: this.props.type == "color" || this.props.type == "file" ? "text" : this.props.type,
							onChange: this.handleChange.bind(this),
							onInput: this.handleInput.bind(this),
							onKeyDown: this.handleKeyDown.bind(this),
							onBlur: this.handleBlur.bind(this),
							onFocus: this.handleFocus.bind(this),
							onMouseEnter: this.handleMouseEnter.bind(this),
							onMouseLeave: this.handleMouseLeave.bind(this),
							maxLength: this.props.type == "file" ? false : this.props.maxLength,
							ref: this.props.inputRef
						}), "errorMessage", "focused", "error", "success", "inputClassName", "inputPrefix", "size", "editable", "inputRef", "style", "mode", "filter")),
						this.props.errorMessage ? BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.inputerrormessage,
							children: this.props.errorMessage
						}) : null,
					].filter(n => n)
				}),
				this.props.type == "color" ? BDFDB.ReactUtils.createElement(LibraryComponents.ColorSwatches, {
					colors: [],
					compMode: this.props.mode == "comp",
					color: this.props.value && this.props.mode == "comp" ? BDFDB.ColorUtils.convert(this.props.value.split(","), "RGB") : this.props.value,
					pickerConfig: {gradient:false, alpha:this.props.mode != "comp"}
				}) : null,
				this.props.type == "file" ? BDFDB.ReactUtils.createElement(LibraryComponents.FileButton, {
					filter: this.props.filter
				}) : null
			].filter(n => n);
			return children.length == 1 ? children[0] : BDFDB.ReactUtils.createElement(LibraryComponents.Flex, {
				align: LibraryComponents.Flex.Align.CENTER,
				children: children.map((child, i) => i == 0 ? BDFDB.ReactUtils.createElement(LibraryComponents.Flex.Child, {children: child}) : child)
			});
		}
	} : LibraryComponents.TextInput;
	
	LibraryComponents.TextScroller = reactInitialized ? class BDFDB_TextScroller extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.textscroller, this.props.className),
				style: Object.assign({}, this.props.style, {
					position: "relative",
					display: "block",
					overflow: "hidden"
				}),
				ref: instance => {
					let ele = BDFDB.ReactUtils.findDOMNode(instance);
					if (ele) {
						var inner = ele.firstElementChild;
						var Animation = new LibraryModules.AnimationUtils.Value(0);
						Animation
							.interpolate({inputRange:[0, 1], outputRange:[0, (BDFDB.DOMUtils.getRects(inner).width - BDFDB.DOMUtils.getRects(ele).width) * -1]})
							.addListener(v => {inner.style.setProperty("left", v.value + "px", "important");});
						this.scroll = p => {
							var w = p + parseFloat(inner.style.getPropertyValue("left")) / (BDFDB.DOMUtils.getRects(inner).width - BDFDB.DOMUtils.getRects(ele).width);
							w = isNaN(w) || !isFinite(w) ? p : w;
							w *= BDFDB.DOMUtils.getRects(inner).width / (BDFDB.DOMUtils.getRects(ele).width * 2);
							LibraryModules.AnimationUtils.parallel([LibraryModules.AnimationUtils.timing(Animation, {toValue:p, duration:Math.sqrt(w**2) * 4000 / (parseInt(this.props.speed) || 1)})]).start();
						}
					}
				},
				onMouseEnter: e => {
					var ele = e.currentTarget;
					var inner = ele.firstElementChild;
					if (BDFDB.DOMUtils.getRects(ele).width < BDFDB.DOMUtils.getRects(inner).width) {
						this.scrolling = true;
						inner.style.setProperty("display", "block", "important");
						this.scroll(1);
					}
				},
				onMouseLeave: e => {
					var ele = e.currentTarget;
					var inner = ele.firstElementChild;
					if (this.scrolling) {
						delete this.scrolling;
						inner.style.setProperty("display", "inline", "important");
						this.scroll(0);
					}
				},
				children: BDFDB.ReactUtils.createElement("div", {
					style: {
						left: "0",
						position: "relative",
						display: "inline",
						whiteSpace: "nowrap"
					},
					children: this.props.children
				})
			});
		}
	} : LibraryComponents.TextScroller;
	
	LibraryComponents.TooltipContainer = reactInitialized ? class BDFDB_TooltipContainer extends LibraryModules.React.Component {
		render() {
			let child = (BDFDB.ArrayUtils.is(this.props.children) ? this.props.children[0] : this.props.children) || BDFDB.ReactUtils.createElement("div", {});
			child.props.className = BDFDB.DOMUtils.formatClassName(child.props.className, this.props.className);
			let childMouseEnter = child.props.onMouseEnter, childMouseLeave = child.props.onMouseLeave, childClick = child.props.onClick, childContextMenu = child.props.onContextMenu;
			let shown = false;
			child.props.onMouseEnter = (e, childthis) => {
				if (!shown) {
					shown = true;
					BDFDB.TooltipUtils.create(e.currentTarget, this.props.text, Object.assign({}, this.props.tooltipConfig));
					if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);
					if (typeof childMouseEnter == "function") childMouseEnter(e, childthis);
				}
			};
			child.props.onMouseLeave = (e, childthis) => {
				shown = false;
				if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);
				if (typeof childMouseLeave == "function") child.props.onMouseLeave(e, childthis);
			};
			child.props.onClick = (e, childthis) => {
				if (typeof this.props.onClick == "function") this.props.onClick(e, this);
				if (typeof childClick == "function") childClick(e, childthis);
			};
			child.props.onContextMenu = (e, childthis) => {
				if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);
				if (typeof childContextMenu == "function") childContextMenu(e, childthis);
			};
			return BDFDB.ReactUtils.createElement(LibraryModules.React.Fragment, {
				children: child
			});
		}
	} : LibraryComponents.TooltipContainer;
	
	for (let type in NativeSubComponents) if (LibraryComponents[type]) for (let key in NativeSubComponents[type]) if (key != "displayName" && key != "name" && (typeof NativeSubComponents[type][key] != "function" || key.charAt(0) == key.charAt(0).toUpperCase())) LibraryComponents[type][key] = NativeSubComponents[type][key];
	BDFDB.LibraryComponents = Object.assign({}, LibraryComponents);

	BDFDB.DOMUtils.appendLocalStyle("BDFDB", `
		@import url(https://mwittrien.github.io/BetterDiscordAddons/Themes/BetterDocsBlock.css);

		.BDFDB-versionchangelog {
			display: inline-block;
			background: currentColor;
			-webkit-mask: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 510 510"><path fill="currentColor" d="M267.75,12.75c-89.25,0-168.3,48.45-209.1,122.4L0,76.5v165.75h165.75 l-71.4-71.4c33.15-63.75,96.9-107.1,173.4-107.1C372.3,63.75,459,150.45,459,255s-86.7,191.25-191.25,191.25 c-84.15,0-153-53.55-181.05-127.5H33.15c28.05,102,122.4,178.5,234.6,178.5C402.9,497.25,510,387.6,510,255 C510,122.4,400.35,12.75,267.75,12.75z M229.5,140.25V270.3l119.85,71.4l20.4-33.15l-102-61.2v-107.1H229.5z"></path></svg>') center/contain no-repeat;
			cursor: pointer;
			margin: 0 4px 0 3px;
		}
		
		${BDFDB.dotCN.settingspanelinner} {
			padding-left: 15px;
			padding-right: 5px;
		}
		${BDFDB.dotCN.settingspanellist} {
			padding-left: 15px;
		}
		
		${BDFDB.dotCN.collapsecontainerinner} {
			padding-left: 15px;
		}
		${BDFDB.dotCNS.settingspanelinner + BDFDB.dotCN.collapsecontainerheader} {
			margin-left: -16px;
		}
		${BDFDB.dotCN.collapsecontainerarrow} {
			background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FscXVlXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSItOTUwIDUzMiAxOCAxOCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAtOTUwIDUzMiAxOCAxODsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuc3Qwe2ZpbGw6bm9uZTt9DQoJLnN0MXtmaWxsOm5vbmU7c3Ryb2tlOiNGRkZGRkY7c3Ryb2tlLXdpZHRoOjEuNTtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9DQo8L3N0eWxlPg0KPHBhdGggY2xhc3M9InN0MCIgZD0iTS05MzIsNTMydjE4aC0xOHYtMThILTkzMnoiLz4NCjxwb2x5bGluZSBjbGFzcz0ic3QxIiBwb2ludHM9Ii05MzYuNiw1MzguOCAtOTQxLDU0My4yIC05NDUuNCw1MzguOCAiLz4NCjwvc3ZnPg0K) center/cover no-repeat;
			height: 16px;
			width: 16px;
			transition: transform .3s ease;
			transform: rotate(0);
		}
		${BDFDB.dotCNS.collapsecontainercollapsed + BDFDB.dotCN.collapsecontainerarrow} {
			transform: rotate(-90deg);
		}
		
		${BDFDB.dotCN.overflowellipsis} {
			overflow: hidden;
			text-overflow: ellipsis;
		}

		${BDFDB.dotCN.favbuttoncontainer} {
			display: flex;
			position: relative;
		}

		${BDFDB.dotCN.cursordefault} {
			cursor: default !important;
		}
		${BDFDB.dotCN.cursorpointer} {
			cursor: pointer !important;
		}
		
		${BDFDB.dotCN.selectwrap} > [class*="css-"][class*="-container"] > [class*="css-"][class*="-menu"] {
			z-index: 3;
		}
		
		${BDFDB.dotCNS.hovercardwrapper + BDFDB.dotCN.hovercardbutton} {
			position: absolute;
			top: -3px;
			right: -3px;
			opacity: 0;
		}
		${BDFDB.dotCNS.hovercardwrapper + BDFDB.dotCN.hovercard + BDFDB.dotCN.hovercardbutton} {
			right: -31px;
			top: -12px;
		}
		${BDFDB.dotCN.hovercardwrapper}:hover ${BDFDB.dotCN.hovercardbutton} {
			opacity: 1;
		}
		
		${BDFDB.dotCN.table} {
			width: 100%;
		}
		${BDFDB.dotCN.tableheader} {
			padding: 0px 12px 8px 0;
			margin-bottom: 5px;
			font-size: 12px;
			font-weight: 600;
			box-sizing: border-box;
			background-color: var(--background-primary);
			border-bottom: 1px solid var(--background-modifier-accent);
		}
		${BDFDB.dotCN.tablestickyheader}:first-child {
			position: absolute;
			width: 100%;
		}
		${BDFDB.dotCNS.modalsubinner + BDFDB.dotCN.tablestickyheader}:first-child {
			padding-left: 20px;
		}
		${BDFDB.dotCN.tableheadercell} {
			text-transform: uppercase;
			color: var(--interactive-normal);
		}
		${BDFDB.dotCN.tableheadercell},
		${BDFDB.dotCN.tablebodycell} {
			border-left: 1px solid var(--background-modifier-accent);
			box-sizing: border-box;
			padding: 0 12px;
		}
		${BDFDB.dotCN.tableheadercell}:first-child,
		${BDFDB.dotCN.tablebodycell}:first-child {
			border-left: none;
			padding-left: 0;
		}
		${BDFDB.dotCN.tableheadercellsorted},
		${BDFDB.dotCN.tableheadercellsorted}:hover {
			color: var(--interactive-active);
		}
		${BDFDB.dotCN.tableheadersorticon} {
			width: 18px;
			height: 18px;
			margin-left: 4px;
		}
		${BDFDB.dotCN.tablerow} {
			position: relative;
			display: flex;
			margin-bottom: 5px;
			align-items: center;
			color: var(--header-secondary);
		}
		${BDFDB.dotCN.tablebodycell} {
			font-size: 15px;
		}
		
		${BDFDB.dotCNS.themelight + BDFDB.dotCN.quickselectpopoutwrapper},
		${BDFDB.dotCNS.themedark + BDFDB.dotCN.quickselectpopoutwrapper} {
			border-radius: 4px;
			padding: 6px 8px;
			cursor: default;
			background-color: var(--background-floating);
			box-sizing: border-box;
			box-shadow: var(--elevation-high);
		}
		${BDFDB.dotCNS.quickselectpopoutwrapper + BDFDB.dotCN.quickselectpopoutoption} {
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
			align-items: center;
			position: relative;
			font-weight: 500;
			box-sizing: border-box;
			margin-top: 2px;
			margin-bottom: 2px;
			padding: 0 8px;
			font-size: 14px;
			line-height: 18px;
			min-height: 32px;
			border-radius: 2px;
			color: var(--interactive-normal);
		}
		${BDFDB.dotCNS.quickselectpopoutwrapper + BDFDB.dotCN.quickselectpopoutoption}:hover {
			color: var(--interactive-hover);
			background-color: var(--background-modifier-hover);
		}
		${BDFDB.dotCNS.quickselectpopoutwrapper + BDFDB.dotCN.quickselectpopoutoption + BDFDB.dotCN.quickselectpopoutoptionselected} {
			color: var(--interactive-active);
			background-color: var(--background-modifier-selected);
		}
		
		${BDFDB.dotCN.charcounter} {
			color: var(--channels-default);
		}
		
		${BDFDB.dotCN.inputnumberwrapper} {
			position: relative;
		}
		${BDFDB.dotCN.inputnumberbuttons}:hover + ${BDFDB.dotCN.input + BDFDB.notCN.inputfocused + BDFDB.notCN.inputerror + BDFDB.notCN.inputsuccess + BDFDB.notCN.inputdisabled}:not(:focus) {
			border-color: #040405;
		}
		${BDFDB.dotCNS.inputnumberwrapperdefault + BDFDB.dotCN.input} {
			padding-right: 25px;
		}
		${BDFDB.dotCNS.inputnumberwrappermini + BDFDB.dotCN.input} {
			padding-left: 6px;
			padding-right: 17px;
		}
		${BDFDB.dotCNS.inputnumberwrapper + BDFDB.dotCN.input}::-webkit-inner-spin-button, 
		${BDFDB.dotCNS.inputnumberwrapper + BDFDB.dotCN.input}::-webkit-outer-spin-button{
			-webkit-appearance: none !important;
		}
		${BDFDB.dotCN.inputnumberbuttons} {
			position: absolute;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: space-around;
			height: 110%;
			top: -2%;
		}
		${BDFDB.dotCNS.inputnumberwrapperdefault + BDFDB.dotCN.inputnumberbuttons} {
			right: 8px;
		}
		${BDFDB.dotCNS.inputnumberwrappermini + BDFDB.dotCN.inputnumberbuttons} {
			right: 4px;
		}
		${BDFDB.dotCN.inputnumberbutton} {
			cursor: pointer;
			border: transparent solid 5px;
			border-top-width: 2.5px;
			display: inline-block;
		}
		${BDFDB.dotCNS.themelight + BDFDB.dotCN.inputnumberbutton} {
			border-bottom-color: #dcddde;
		}
		${BDFDB.dotCNS.themelight + BDFDB.dotCN.inputnumberbutton}:hover {
			border-bottom-color: #4f545c;
		}
		${BDFDB.dotCNS.themedark + BDFDB.dotCN.inputnumberbutton} {
			border-bottom-color: #72767d;
		}
		${BDFDB.dotCNS.themedark + BDFDB.dotCN.inputnumberbutton}:hover {
			border-bottom-color: #f6f6f7;
		}
		${BDFDB.dotCN.inputnumberbuttondown} {
			transform: rotate(180deg);
		}
		
		${BDFDB.dotCN.colorpickerswatches + BDFDB.dotCN.colorpickerswatchesdisabled} {
			cursor: no-drop;
			filter: grayscale(70%) brightness(50%);
		}
		${BDFDB.dotCN.colorpickerswatchsingle} {
			height: 30px;
			width: 30px;
		}
		
		${BDFDB.dotCN.svgicon} {
			color: var(--interactive-normal);
		}
		${BDFDB.dotCN.svgicon}:hover {
			color: var(--interactive-hover);
		}
		${BDFDB.dotCN.svgicon}:active {
			color: var(--interactive-active);
		}
		
		${BDFDB.dotCN.modalsubinnerscrollerless} {
			padding-bottom: 10px;
			overflow: visible;
		}
		${BDFDB.dotCNS.modalwrapper + BDFDB.dotCN.modalheader + BDFDB.dotCN.modalheaderhassibling} {
			padding-bottom: 10px;
		}
		${BDFDB.dotCNS.modalwrapper + BDFDB.dotCN.tabbarcontainer} {
			background: rgba(0, 0, 0, 0.1);
			border: none !important;
			box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.05);
		}
		${BDFDB.dotCNS.themedark + BDFDB.dotCNS.modalwrapper + BDFDB.dotCN.tabbarcontainer} {
			background: rgba(0, 0, 0, 0.2);
			box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1);
		}
		
		${BDFDB.dotCNS.themedark + BDFDB.dotCNS.popoutwrapper + BDFDB.dotCN.popoutthemedpopout} {
			-webkit-box-shadow: 0 2px 10px 0 rgba(0,0,0,20%);
			background-color: #2f3136;
			border: 1px solid rgba(28,36,43,.6);
			box-shadow: 0 2px 10px 0 rgba(0,0,0,.2);
		}
		
		
		/*OLD*/

		${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messageheadercozy} {
			padding-top: 0;
		}
		${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messageheadercompact} > span.popout-open,
		${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messageheadercompact} > span[class=""],
		${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messageheadercozymeta} > span.popout-open,
		${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messageheadercozymeta} > span[class=""] {
			display: inline-flex;
			align-items: baseline;
		}
		${BDFDB.dotCNS.messagegroup + BDFDB.dotCNS.messageheadercompact + BDFDB.dotCN.bottag},
		${BDFDB.dotCNS.messagegroup + BDFDB.dotCNS.messageheadercompact + BDFDB.dotCN.messageusername} {
			text-indent: 0px;
		}
		
		.BDFDB-modal ${BDFDB.dotCN.modalheader + BDFDB.dotCN.modalheaderhassibling} {
			padding-bottom: 10px;
		}
		.BDFDB-modal ${BDFDB.dotCN.tabbarcontainer} {
			background: rgba(0, 0, 0, 0.1);
			border: none !important;
			box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.05);
		}
		${BDFDB.dotCN.themedark} .BDFDB-modal ${BDFDB.dotCN.tabbarcontainer} {
			background: rgba(0, 0, 0, 0.2);
			box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1);
		}

		#bd-settingspane-container .ui-form-title {
			display: inline-block;
		}
		#bd-settingspane-container ${BDFDB.dotCN._repofolderbutton} {
			position: static;
			margin-bottom: 0;
			border-radius: 5px;
			display: inline-block;
			margin-left: 10px;
		}
		#bd-settingspane-container .bd-updatebtn[style] {
			display: none !important;
		}
		#bd-settingspane-container ${BDFDB.dotCN._repodescription} {
			white-space: pre-line !important;
		}
		.BDFDB-notice {
			transition: height 0.5s ease !important;
			border-radius: 0 !important;
		}
		.BDFDB-notice ${BDFDB.dotCN.noticeplatformicon} {
			margin-top: -7px;
		}
		.BDFDB-notice ${BDFDB.dotCN.noticeplatformicon} svg {
			max-height: 28px;
		}
		.hidden-by-OTB .BDFDB-notice {
			-webkit-app-region: drag !important;
		}
		#pluginNotice #outdatedPlugins span {
			-webkit-app-region: no-drag;
			color: #FFF;
			cursor: pointer;
		}
		#pluginNotice #outdatedPlugins span:hover {
			text-decoration: underline;
		}
		.BDFDB-itemlayercontainer, .BDFDB-itemlayer {
			z-index: 3002;
		}
		${BDFDB.dotCN.tooltip}.tooltip-customcolor ${BDFDB.dotCN.tooltippointer} {
			border-top-color: inherit !important;
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
			background-color: #36393F;
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
			background-position: 6px 50%;
			background-size: 20px 20px;
			background-repeat: no-repeat;
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
		.BDFDB-quickSelectPopout {
			min-width: 210px !important;
			position: relative !important;
			width: auto !important;
		}
		.BDFDB-modal .BDFDB-settings-inner .BDFDB-containertext,
		.BDFDB-settings .BDFDB-settings-inner .BDFDB-containertext {
			margin-left: -18px;
		}
		.BDFDB-modal .BDFDB-containerarrow,
		.BDFDB-settings .BDFDB-containerarrow {
			background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FscXVlXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSItOTUwIDUzMiAxOCAxOCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAtOTUwIDUzMiAxOCAxODsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuc3Qwe2ZpbGw6bm9uZTt9DQoJLnN0MXtmaWxsOm5vbmU7c3Ryb2tlOiNGRkZGRkY7c3Ryb2tlLXdpZHRoOjEuNTtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9DQo8L3N0eWxlPg0KPHBhdGggY2xhc3M9InN0MCIgZD0iTS05MzIsNTMydjE4aC0xOHYtMThILTkzMnoiLz4NCjxwb2x5bGluZSBjbGFzcz0ic3QxIiBwb2ludHM9Ii05MzYuNiw1MzguOCAtOTQxLDU0My4yIC05NDUuNCw1MzguOCAiLz4NCjwvc3ZnPg0K);
			height: 16px;
			width: 16px;
			display: inline-block;
			position: relative;
			top: 2px;
			transition: transform .3s ease;
			transform: rotate(0);
		}
		.BDFDB-modal .BDFDB-containerarrow.closed,
		.BDFDB-settings .BDFDB-containerarrow.closed {
			transform: rotate(-90deg);
		}
		.BDFDB-settings .BDFDB-settings-inner {
			padding-left: 15px;
			padding-right: 5px;
		}
		.BDFDB-settings .BDFDB-settings-inner-list {
			padding-left: 15px;
		}
		.inputNumberWrapper .numberinput-buttons-zone:hover + ${BDFDB.dotCN.input} {
			border-color: black;
		}
		.inputNumberWrapper .numberinput-buttons-zone:hover + ${BDFDB.dotCN.input}:focus,
		.inputNumberWrapper .numberinput-buttons-zone.pressed + ${BDFDB.dotCN.input} {
			border-color: #7289da;
		}
		.inputNumberWrapper {
			position: relative !important;
		}
		.inputNumberWrapper ${BDFDB.dotCN.input}[type=number] {
			padding-right: 25px;
		}
		.inputNumberWrapper.inputNumberWrapperMini ${BDFDB.dotCN.input}[type=number] {
			padding-left: 6px;
			padding-right: 17px;
		}
		.inputNumberWrapper ${BDFDB.dotCN.input}[type=number]::-webkit-inner-spin-button, 
		.inputNumberWrapper ${BDFDB.dotCN.input}[type=number]::-webkit-outer-spin-button{
			-webkit-appearance: none;
		}
		.inputNumberWrapper .numberinput-buttons-zone {
			cursor: pointer;
			position: absolute;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: space-around;
			height: 110%;
			right: 8px;
			top: -5%;
		}
		.inputNumberWrapper.inputNumberWrapperMini .numberinput-buttons-zone {
			right: 4px;
		}
		.inputNumberWrapper .numberinput-button-up {
			border-color: transparent transparent #999 transparent;
			border-style: solid;
			border-width: 2.5px 5px 5px 5px;
			display: inline-block;
		}
		.inputNumberWrapper .numberinput-button-up:hover {
			border-bottom-color: #666;
		}
		${BDFDB.dotCN.themelight} .inputNumberWrapper .numberinput-button-up {
			border-bottom-color: #dcddde;
		}
		${BDFDB.dotCN.themelight} .inputNumberWrapper .numberinput-button-up:hover {
			border-bottom-color: #4f545c;
		}
		${BDFDB.dotCN.themedark} .inputNumberWrapper .numberinput-button-up {
			border-bottom-color: #72767d;
		}
		${BDFDB.dotCN.themedark} .inputNumberWrapper .numberinput-button-up:hover {
			border-bottom-color: #f6f6f7;
		}
		.inputNumberWrapper .numberinput-button-down {
			border-color: #999 transparent transparent transparent;
			border-style: solid;
			border-width: 5px 5px 2.5px 5px;
			display: inline-block;
		}
		.inputNumberWrapper .numberinput-button-down:hover {
			border-top-color: #666;
		}
		${BDFDB.dotCN.themelight} .inputNumberWrapper .numberinput-button-down {
			border-top-color: #dcddde;
		}
		${BDFDB.dotCN.themelight} .inputNumberWrapper .numberinput-button-down:hover {
			border-top-color: #4f545c;
		}
		${BDFDB.dotCN.themedark} .inputNumberWrapper .numberinput-button-down {
			border-top-color: #72767d;
		}
		${BDFDB.dotCN.themedark} .inputNumberWrapper .numberinput-button-down:hover {
			border-top-color: #f6f6f7;
		}
		.BDFDB-select ${BDFDB.dotCN.select} {
			position: relative;
			box-sizing: border-box;
		}
		.BDFDB-select ${BDFDB.dotCN.selectcontrol} {
			-webkit-box-align: center;
			align-items: center;
			display: flex;
			flex-wrap: wrap;
			-webkit-box-pack: justify;
			justify-content: space-between;
			min-height: 40px;
			position: relative;
			box-sizing: border-box;
			border-radius: 3px;
			border-style: solid;
			border-width: 1px;
			transition: border 0.15s ease 0s;
			outline: 0px !important;
		}
		.BDFDB-select ${BDFDB.dotCN.selectcontrollight} {
			background-color: rgba(79, 84, 92, 0.02);
			background-color: rgba(79, 84, 92, 0.02);
		}
		.BDFDB-select ${BDFDB.dotCN.selectcontroldark} {
			background-color: rgba(0, 0, 0, 0.1);
			border-color: rgba(0, 0, 0, 0.3);
		}
		.BDFDB-select ${BDFDB.dotCN.selectvalue} {
			-webkit-box-align: center;
			align-items: center;
			display: flex;
			flex-wrap: wrap;
			position: relative;
			box-sizing: border-box;
			flex: 1 1 0%;
			padding: 2px 8px;
			overflow: hidden;
		}
		.BDFDB-select ${BDFDB.dotCN.selectsingle} {
			margin-left: 2px;
			margin-right: 2px;
			max-width: calc(100% - 8px);
			width: calc(100% - 8px);
			position: absolute;
			text-overflow: ellipsis;
			white-space: nowrap;
			top: 50%;
			transform: translateY(-50%);
			box-sizing: border-box;
			opacity: 1;
			overflow: hidden;
		}
		.BDFDB-select ${BDFDB.dotCN.selectsinglelight} {
			color: rgb(32, 34, 37);
		}
		.BDFDB-select ${BDFDB.dotCN.selectsingledark} {
			color: rgb(246, 246, 247);
		}
		.BDFDB-select ${BDFDB.dotCN.selectdummyinput} {
			font-size: inherit;
			width: 1px;
			color: transparent;
			left: -100px;
			opacity: 0;
			position: relative;
			transform: scale(0);
			background: 0px center;
			border-width: 0px;
			border-style: initial;
			border-color: initial;
			border-image: initial;
			outline: 0px;
			padding: 0px;
		}
		.BDFDB-select ${BDFDB.dotCN.selectarrowzone} {
			-webkit-box-align: center;
			align-items: center;
			align-self: stretch;
			display: flex;
			flex-shrink: 0;
			box-sizing: border-box;
		}
		.BDFDB-select ${BDFDB.dotCN.selectarrowcontainer} {
			display: flex;
			box-sizing: border-box;
			cursor: pointer;
			opacity: 0.3;
			padding: 8px 8px 8px 0px;
			transition: color 150ms ease 0s;
		}
		.BDFDB-select ${BDFDB.dotCN.selectarrowcontainerlight} {
			color: rgb(32, 34, 37);
		}
		.BDFDB-select ${BDFDB.dotCN.selectarrowcontainerdark} {
			color: rgb(246, 246, 247);
		}
		.BDFDB-select ${BDFDB.dotCN.selectarrow} {
			display: inline-block;
			fill: currentcolor;
			line-height: 1;
			stroke: currentcolor;
			stroke-width: 0;
		}
		.BDFDB-select ${BDFDB.dotCN.selectmenuouter} {
			top: 100%;
			margin-bottom: -1px;
			margin-top: -1px;
			position: absolute;
			width: 100%;
			z-index: 100;
			box-sizing: border-box;
			border-radius: 0px 0px 3px 3px;
			border-width: 1px;
			border-style: solid;
			border-image: initial;
		}
		.BDFDB-select ${BDFDB.dotCN.selectmenuouter}.above-select {
			border-radius: 3px 3px 0 0;
		}
		.BDFDB-select ${BDFDB.dotCN.selectmenuouterlight} {
			background-color: rgb(255, 255, 255);
			border-color: rgb(185, 187, 190);
			color: rgb(32, 34, 37);
		}
		.BDFDB-select ${BDFDB.dotCN.selectmenuouterdark} {
			background-color: rgb(47, 49, 54);
			border-color: rgb(32, 34, 37);
			color: rgb(246, 246, 247);
		}
		.BDFDB-select ${BDFDB.dotCN.selectmenu} {
			max-height: 300px;
			overflow-y: auto;
			position: relative;
			box-sizing: border-box;
			padding: 0px;
		}
		.BDFDB-select ${BDFDB.dotCN.selectmenu}::-webkit-scrollbar {
			width: 8px;
		}
		.BDFDB-select ${BDFDB.dotCN.selectmenu}::-webkit-scrollbar-thumb {
			background-color: rgba(0, 0, 0, 0.4);
			background-clip: padding-box;
			border-color: transparent;
			border-radius: 4px;
		}
		.BDFDB-select ${BDFDB.dotCN.selectmenu}::-webkit-scrollbar-track-piece {
			background-color: transparent;
			border-color: transparent;
		}
		.BDFDB-select ${BDFDB.dotCN.selectoption} {
			cursor: pointer;
			display: flex;
			font-size: inherit;
			width: 100%;
			user-select: none;
			-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
			box-sizing: border-box;
			-webkit-box-align: center;
			align-items: center;
			min-height: 40px;
			padding: 8px 12px;
		}
		.BDFDB-select ${BDFDB.dotCN.selectoptionlight} {
			background-color: transparent;
			color: rgb(32, 34, 37);
		}
		.BDFDB-select ${BDFDB.dotCN.selectoptiondark} {
			background-color: transparent;
			color: rgb(246, 246, 247);
		}
		.BDFDB-select ${BDFDB.dotCN.selectoptionhoverlight} {
			background-color: rgb(246, 246, 247);
			color: rgb(32, 34, 37);
		}
		.BDFDB-select ${BDFDB.dotCN.selectoptionhoverdark} {
			background-color: rgba(0, 0, 0, 0.1);
			color: rgb(246, 246, 247);
		}
		.BDFDB-select ${BDFDB.dotCN.selectoptionselectlight} {
			background-color: rgb(220, 221, 222);
			color: rgb(32, 34, 37);
		}
		.BDFDB-select ${BDFDB.dotCN.selectoptionselectdark} {
			background-color: rgba(0, 0, 0, 0.2);
			color: rgb(246, 246, 247);
		}
		.BDFDB-settings ${BDFDB.dotCN.hovercard},
		.BDFDB-settings ${BDFDB.dotCNS.hovercard + BDFDB.dotCN.hovercardinner} {
			width: 550px;
			min-height: 28px;
		}
		.BDFDB-settingsmodal .BDFDB-settings {
			margin-bottom: 20px;
		}
		.BDFDB-settingsmodal .BDFDB-settings ${BDFDB.dotCN.hovercard},
		.BDFDB-settingsmodal .BDFDB-settings ${BDFDB.dotCNS.hovercard + BDFDB.dotCN.hovercardinner} {
			width: 520px;
		}
		.BDFDB-settings ${BDFDB.dotCN.hovercard}:before {
			z-index: 50;
			left: -10px;
		}
		.BDFDB-settings ${BDFDB.dotCNS.hovercard + BDFDB.dotCN.hovercardinner} {
			overflow: hidden;
			display: flex;
			align-items: center;
			position: relative;
			z-index: 100;
		}
		.BDFDB-settings ${BDFDB.dotCNS.hovercard + BDFDB.dotCN.hovercardbutton} {
			opacity: 0;
			position: absolute;
			right: -31px;
			top: -12px;
			z-index: 200;
		}
		.BDFDB-settings ${BDFDB.dotCN.hovercard}:hover ${BDFDB.dotCN.hovercardbutton} {
			opacity: 1;
		}		
		.BDFDB-modal ${BDFDB.dotCN.checkboxcontainer},
		.BDFDB-settings ${BDFDB.dotCN.checkboxcontainer} {
			display: flex;
			align-items: center;
			flex-direction: column;
			margin-right: 5px;
			margin-left: 5px;
		}		
		.BDFDB-modal ${BDFDB.dotCN.checkboxcontainer}:before,
		.BDFDB-settings ${BDFDB.dotCN.checkboxcontainer}:before {
			display: none;
		}
		.BDFDB-modal ${BDFDB.dotCN.colorpickerswatches + BDFDB.dotCN.colorpickerswatchesdisabled},
		.BDFDB-settings ${BDFDB.dotCN.colorpickerswatches + BDFDB.dotCN.colorpickerswatchesdisabled} {
			cursor: no-drop;
			filter: grayscale(70%) brightness(50%);
		}
		.BDFDB-modal ${BDFDB.dotCN.colorpickerswatch + BDFDB.notCN.colorpickerswatchnocolor + BDFDB.notCN.colorpickerswatchdefault + BDFDB.notCN.colorpickerswatchdisabled},
		.BDFDB-settings ${BDFDB.dotCN.colorpickerswatch + BDFDB.notCN.colorpickerswatchnocolor + BDFDB.notCN.colorpickerswatchdefault + BDFDB.notCN.colorpickerswatchdisabled} {
			overflow: hidden;
		}
		.BDFDB-colorpicker .gradient-bar .gradient-cursor > div:after,
		.BDFDB-modal ${BDFDB.dotCN.colorpickerswatch + BDFDB.notCN.colorpickerswatchnocolor + BDFDB.notCN.colorpickerswatchdefault + BDFDB.notCN.colorpickerswatchdisabled}:after,
		.BDFDB-settings ${BDFDB.dotCN.colorpickerswatch + BDFDB.notCN.colorpickerswatchnocolor + BDFDB.notCN.colorpickerswatchdefault + BDFDB.notCN.colorpickerswatchdisabled}:after {
			content: "";
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			z-index: -1;
		}
		.BDFDB-modal ${BDFDB.dotCN.colorpickerswatch + BDFDB.notCN.colorpickerswatchdefault}:after,
		.BDFDB-settings ${BDFDB.dotCN.colorpickerswatch + BDFDB.notCN.colorpickerswatchdefault}:after {
			border-radius: 3px;
		}
		.BDFDB-modal ${BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatchcustom + BDFDB.notCN.colorpickerswatchdefault}:after,
		.BDFDB-settings ${BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatchcustom + BDFDB.notCN.colorpickerswatchdefault}:after {
			border-radius: 5px;
		}
		.BDFDB-colorpicker .alpha-checker,
		.BDFDB-colorpicker .gradient-bar .gradient-cursor > div:after,
		.BDFDB-modal ${BDFDB.dotCN.colorpickerswatch + BDFDB.notCN.colorpickerswatchnocolor + BDFDB.notCN.colorpickerswatchdefault + BDFDB.notCN.colorpickerswatchdisabled}:after,
		.BDFDB-settings ${BDFDB.dotCN.colorpickerswatch + BDFDB.notCN.colorpickerswatchnocolor + BDFDB.notCN.colorpickerswatchdefault + BDFDB.notCN.colorpickerswatchdisabled}:after {
			background: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect x="0" y="0" width="4" height="4" fill="black"></rect><rect x="0" y="4" width="4" height="4" fill="white"></rect><rect x="4" y="0" width="4" height="4" fill="white"></rect><rect x="4" y="4" width="4" height="4" fill="black"></rect></svg>') center repeat
		}
		.BDFDB-modal ${BDFDB.dotCN.colorpickerswatches + BDFDB.dotCN.colorpickerswatchesdisabled} ${BDFDB.dotCN.colorpickerswatch},
		.BDFDB-settings ${BDFDB.dotCN.colorpickerswatches + BDFDB.dotCN.colorpickerswatchesdisabled} ${BDFDB.dotCN.colorpickerswatch} {
			cursor: no-drop;
		}
		.BDFDB-modal ${BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatchcustom}[style*="background"],
		.BDFDB-settings ${BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatchcustom}[style*="background"] {
			border: none;
		}
		${BDFDB.dotCNS.themelight + BDFDB.dotCN.colorpickersaturation} > div > div > div > div {
			box-shadow: rgb(200, 200, 200) 0px 0px 0px 1.5px, rgba(0, 0, 0, 0.6) 0px 0px 1px 1px inset, rgba(0, 0, 0, 0.6) 0px 0px 1px 2px !important;
		}
		${BDFDB.dotCNS.themelight + BDFDB.dotCN.colorpickerhue} > div > div > div > div,
		${BDFDB.dotCN.themelight} .BDFDB-colorpicker .alpha-bar > div > div > div > div {
			background: rgb(200, 200, 200) !important;
			box-shadow: rgba(0, 0, 0, 1) 0px 0px 2px !important;
		}
		.BDFDB-colorpicker .gradient-button {
			cursor: pointer;
			opacity: 0.3;
			transition: all 200ms ease;
		}
		.BDFDB-colorpicker .gradient-button:hover {
			opacity: 0.6;
		}
		.BDFDB-colorpicker .gradient-button.selected,
		.BDFDB-colorpicker .gradient-button.selected:hover {
			opacity: 1;
		}
		${BDFDB.dotCN.themelight} .BDFDB-colorpicker .gradient-button {
			color: #4f545c;
		}
		${BDFDB.dotCN.themedark} .BDFDB-colorpicker .gradient-button {
			color: #fff;
		}
		.BDFDB-colorpicker .alpha-checker,
		.BDFDB-colorpicker .alpha-horizontal,
		.BDFDB-colorpicker .gradient-horizontal {
			border-radius: 3px;
		}
		.BDFDB-colorpicker .alpha-bar .alpha-cursor,
		.BDFDB-colorpicker .gradient-bar .gradient-cursor {
			position: absolute;
		}
		.BDFDB-colorpicker .gradient-bar .gradient-cursor > div {
			height: 8px;
			width: 8px;
			margin-top: -15px;
			border: 1px solid rgb(128, 128, 128);
			border-radius: 3px;
			transform: translateX(-5px);
			transform-style: preserve-3d;
		}
		.BDFDB-colorpicker .gradient-bar .gradient-cursor > div:after {
			border-radius: 3px;
			transform: translateZ(-1px);
		}
		.BDFDB-colorpicker .gradient-bar .gradient-cursor > div:before {
			content: "";
			position: absolute;
			border: 3px solid transparent;
			border-top-width: 5px;
			border-top-color: rgb(128, 128, 128);
			width: 0;
			height: 0;
			top: 100%;
			left: -50%;
			transform: translateX(5px);
		}
		.BDFDB-colorpicker .gradient-bar .gradient-cursor.edge > div:before {
			border-right-width: 0;
			border-left-width: 5px;
		}
		.BDFDB-colorpicker .gradient-bar .gradient-cursor.edge ~ .gradient-cursor.edge > div:before {
			border-right-width: 5px;
			border-left-width: 0;
		}
		${BDFDB.dotCN.themelight} .BDFDB-colorpicker .gradient-bar .gradient-cursor.selected > div {
			border-color: rgb(55, 55, 55);
		}
		${BDFDB.dotCN.themelight} .BDFDB-colorpicker .gradient-bar .gradient-cursor.selected > div:before {
			border-top-color: rgb(55, 55, 55);
		}
		${BDFDB.dotCN.themedark} .BDFDB-colorpicker .gradient-bar .gradient-cursor.selected > div {
			border-color: rgb(200, 200, 200);
		}
		${BDFDB.dotCN.themedark} .BDFDB-colorpicker .gradient-bar .gradient-cursor.selected > div:before {
			border-top-color: rgb(200, 200, 200);
		}
		.BDFDB-modal ${BDFDB.dotCN.inputdefault}.valid {
			background-color: rgba(67, 181 ,129, 0.5);
		}
		.BDFDB-modal ${BDFDB.dotCN.inputdefault}.valid:hover {
			border-color: rgb(27, 141, 89);
		}
		.BDFDB-modal ${BDFDB.dotCN.inputdefault}.valid:focus {
			border-color: rgb(67, 181, 129);
		}
		.BDFDB-modal ${BDFDB.dotCN.inputdefault}.valid::placeholder {
			color: rgba(67, 181, 129, 0.7);
		}
		.BDFDB-modal ${BDFDB.dotCN.inputdefault}.invalid {
			background-color: rgba(241, 71, 71, 0.5);
		}
		.BDFDB-modal ${BDFDB.dotCN.inputdefault}.invalid:hover {
			border-color: rgb(201, 31, 31);
		}
		.BDFDB-modal ${BDFDB.dotCN.inputdefault}.invalid:focus {
			border-color: rgb(241, 71, 71);
		}
		.BDFDB-modal ${BDFDB.dotCN.inputdefault}.invalid::placeholder {
			color: rgba(241, 71, 71, 0.7);
		}
		.BDFDB-modal ${BDFDB.dotCN.inputdefault}:disabled {
			color: #555555;
			cursor: no-drop;
			background-color: rgba(0, 0, 0, 0.5);
		}
		/* REMOVE */
		.BDFDB-modal ${BDFDB.dotCN.modaltabcontent + BDFDB.dotCN.modaltabcontentopen} {
			display: flex;
			flex-direction: column;
			flex-wrap: nowrap;
			justify-content: flex-start;
			align-items: stretch;
		}
		.BDFDB-modal ${BDFDB.dotCN.modaltabcontent + BDFDB.notCN.modaltabcontentopen} {
			display: none;
		}
		/* REMOVE */
		.BDFDB-modal *${BDFDB.notCN.modalsubinner} > ${BDFDB.dotCN.modaltabcontent + BDFDB.dotCN.modaltabcontentopen + BDFDB.notCN.modalsubinner} > * {
			padding: 0 20px 0 12px;
		}
		.colorpicker-modal .colorpicker-container {
			padding: 10px 10px 10px 30px;
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
		}`);

	BDFDB.ListenerUtils.add(BDFDB, document, "click.BDFDBPluginClick", ".bd-settingswrap .bd-refresh-button, .bd-settingswrap .bd-switch-checkbox", _ => {
		BDFDB.BDUtils.setPluginCache();
		BDFDB.BDUtils.setThemeCache();
	});
	var KeyDownTimeouts = {};
	BDFDB.ListenerUtils.add(BDFDB, document, "keydown.BDFDBPressedKeys", e => {
		if (!BDFDB.InternalData.pressedKeys.includes(e.which)) {
			BDFDB.TimeUtils.clear(KeyDownTimeouts[e.which]);
			BDFDB.InternalData.pressedKeys.push(e.which);
			BDFDB.pressedKeys.push(e.which);	// REMOVE
			KeyDownTimeouts[e.which] = BDFDB.TimeUtils.timeout(_ => {
				BDFDB.ArrayUtils.remove(BDFDB.InternalData.pressedKeys, e.which, true);
				BDFDB.ArrayUtils.remove(BDFDB.pressedKeys, e.which, true);	// REMOVE
			},60000);
		}
	});
	BDFDB.ListenerUtils.add(BDFDB, document, "keyup.BDFDBPressedKeys", e => {
		BDFDB.TimeUtils.clear(KeyDownTimeouts[e.which]);
		BDFDB.ArrayUtils.remove(BDFDB.InternalData.pressedKeys, e.which, true);
		BDFDB.ArrayUtils.remove(BDFDB.pressedKeys, e.which, true); // REMOVE
	});
	BDFDB.ListenerUtils.add(BDFDB, document, "mousedown.BDFDBMousePosition", e => {
		BDFDB.InternalData.mousePosition = e;
		BDFDB.mousePosition = e; // REMOVE
	});
	BDFDB.ListenerUtils.add(BDFDB, window, "focus.BDFDBPressedKeysReset", e => {
		BDFDB.InternalData.pressedKeys = [];
		BDFDB.pressedKeys = []; // REMOVE
	});

	BDFDB.patchModules = {
		V2C_ContentColumn: "render",
		V2C_PluginCard: "render",
		V2C_ThemeCard: "render",
		UserPopout: "componentDidMount",
		UserProfile: "componentDidMount",
		Message: ["componentDidMount","componentDidUpdate"]
	};

	var BDFDBprocessFunctions = {};
	BDFDBprocessFunctions.processV2CContentColumn = function (e) {
		if (window.PluginUpdates && window.PluginUpdates.plugins && e.instance.props && e.instance.props.title == "Plugins") {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {key: "folder-button"});
			if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(LibraryComponents.TooltipContainer, {
				text: "Only checks for updates of plugins, which support the updatecheck. Rightclick for a list of supported plugins. (Listed ≠ Outdated)",
				tooltipConfig: {
					selector: "update-button-tooltip", 
					style: "max-width: 420px"
				},
				children: BDFDB.ReactUtils.createElement("button", {
					className: `${BDFDB.disCN._repofolderbutton} bd-updatebtn`,
					onClick: _ => {BDFDB.PluginUtils.checkAllUpdates();},
					onContextMenu: e => {
						if (window.PluginUpdates && window.PluginUpdates.plugins && !document.querySelector(".update-list-tooltip")) {
							var pluginnames = [];
							for (let url in window.PluginUpdates.plugins) pluginnames.push(window.PluginUpdates.plugins[url].name);
							BDFDB.TooltipUtils.create(e.currentTarget, pluginnames.sort().join(", "), {type: "bottom", selector: "update-list-tooltip", style: "max-width: 420px"});
						}
					},
					children: "Check for Updates"
				})
			}));
		}
	};

	BDFDBprocessFunctions._processCard = function (e, data) {
		if (e.instance.state && !e.instance.state.settings) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["className", BDFDB.disCN._repoauthor]]});
			if (index > -1) {
				let author = children[index].props.children;
				if (author && (author == "DevilBro" || author.indexOf("DevilBro,") == 0)) {
					children.splice(index, 1, BDFDB.ReactUtils.createElement(LibraryComponents.Anchor, {
						className: BDFDB.disCN._repoauthor,
						children: "DevilBro",
						onClick: e => {
							BDFDB.ListenerUtils.stopEvent(e);
							if (BDFDB.UserUtils.me.id == "278543574059057154") return;
							let DMid = LibraryModules.ChannelStore.getDMFromUserId("278543574059057154")
							if (DMid) LibraryModules.SelectChannelUtils.selectPrivateChannel(DMid);
							else LibraryModules.DirectMessageUtils.openPrivateChannel(BDFDB.UserUtils.me.id, "278543574059057154");
							let close = document.querySelector(BDFDB.dotCNS.settingsclosebuttoncontainer + BDFDB.dotCN.settingsclosebutton);
							if (close) close.click();
						}
					}));
					if (author != "DevilBro") children.splice(index + 1, author.split("DevilBro").slice(1).join("DevilBro"));
					
					if (data.changelog) {
						[children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["className", BDFDB.disCN._repoversion]]});
						if (index > -1) children[index].props.children = [children[index].props.children, BDFDB.ReactUtils.createElement(LibraryComponents.TooltipContainer, {
							text: BDFDB.LanguageUtils.LanguageStrings.CHANGE_LOG,
							children: BDFDB.ReactUtils.createElement("span", {
								className: "BDFDB-versionchangelog",
								children: "     ",
								style: {whiteSpace: "pre"},
								onClick: _ => {BDFDB.PluginUtils.openChangeLog(data);}
							})
						})];
					}
					
					[children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["className", BDFDB.disCN._repolinks]]});
					if (index > -1) {
						if (children[index].props.children.filter(n => n).length) children[index].props.children.push(" | ");
						children[index].props.children.push(BDFDB.ReactUtils.createElement("a", {
							className: `${BDFDB.disCN._repolink}`,
							target: "_blank",
							children: "Support Server",
							onClick: e => {
								BDFDB.ListenerUtils.stopEvent(e);
								let switchguild = _ => {
									LibraryModules.GuildUtils.transitionToGuildSync("410787888507256842");
									let close = document.querySelector(BDFDB.dotCNS.settingsclosebuttoncontainer + BDFDB.dotCN.settingsclosebutton);
									if (close) close.click();
								};
								if (LibraryModules.GuildStore.getGuild("410787888507256842")) switchguild();
								else LibraryModules.InviteUtils.acceptInvite("Jx3TjNS").then(_ => {switchguild();});
							}
						}));
						children[index].props.children.push(" | ");
						children[index].props.children.push(BDFDB.ReactUtils.createElement("a", {
							className: `${BDFDB.disCN._repolink}`,
							target: "_blank",
							href: "https://www.paypal.me/MircoWittrien",
							children: "Donations"
						}));
					}
				}
			}
		}
	};
	BDFDBprocessFunctions.processV2CPluginCard = function (e) {BDFDBprocessFunctions._processCard(e, e.instance.props.plugin);};
	BDFDBprocessFunctions.processV2CThemeCard = function (e) {BDFDBprocessFunctions._processCard(e, e.instance.props.theme);};

	BDFDBprocessFunctions._processAvatar = function (user, avatar) {
		if (avatar && user) {
			avatar.setAttribute("user_by_BDFDB", user.id);
			var status = avatar.querySelector(BDFDB.dotCN.avatarpointerevents);
			if (status) {
				status.addEventListener("mouseenter", _ => {BDFDB.DOMUtils.addClass(avatar, "statusHovered")});
				status.addEventListener("mouseleave", _ => {BDFDB.DOMUtils.removeClass(avatar, "statusHovered")});
			}
		}
	};
	BDFDBprocessFunctions.processUserPopout = function (e) {
		BDFDBprocessFunctions._processAvatar(e.instance.props.user, e.node.querySelector(BDFDB.dotCN.userpopoutavatarwrapper));
	};
	BDFDBprocessFunctions.processUserProfile = function (e) {
		BDFDBprocessFunctions._processAvatar(e.instance.props.user, e.node.querySelector(BDFDB.dotCN.avatarwrapper));
	};
	BDFDBprocessFunctions.processMessage = function (e) {
		BDFDBprocessFunctions._processAvatar(e.instance.props.message.author, e.node.querySelector(BDFDB.dotCN.avatarwrapper));
	};

	InternalBDFDB.patchPlugin(BDFDB);

	if (LibraryComponents.SvgIcon) BDFDB.ModuleUtils.patch(BDFDB, LibraryComponents.SvgIcon.prototype, "render", {after: e => {
		if (!e.thisObject.props.name) {
			let iconSVG = e.thisObject.props.iconSVG || BDFDB.ReactUtils.findValue(e.thisObject, "iconSVG", {up:true});
			if (iconSVG) {
				e.returnValue = BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(iconSVG));
				e.returnValue.props.class = BDFDB.DOMUtils.formatClassName(BDFDB.disCN.svgicon, e.returnValue.props.class, e.thisObject.props.className);
			}
		}
	}});
	
	BDFDB.ModuleUtils.patch(BDFDB, LibraryModules.GuildStore, "getGuild", {after: e => {
		if (e.returnValue && e.methodArguments[0] == "410787888507256842" && !e.returnValue.banner) {
			e.returnValue.banner = "data:image/png;base64,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W7fu537u5xYtWjQ9Pd3tdp/VUxEPTsLqdruVSmVqaurgJKzJycnp6enp6empqamD/xwbG9u6dWtPT8/Y2Nj+/fsPHDhw4MCBvXv3HjhwIMuy4eHhOT0kzzzzzDe84Q2XXnrpypUri//dbt26dWhoyA8SAOY6BRYA80R7bGd7bGeBCyxm1H/ceyjmsZvHpP3vu1yFJEm+vwFWVksrPUmyIOtdFpaelMSYhCR2252p4c7Ens7Yzu7U/uaBzc2990zvuDUmMcm7sduOSRJCJWSVws7PCiF0u90777xz06ZNX/7yl9/whje84Q1v6O/vn7kjDg4O/tCvxMcsko0xhhA6nc7ExMTU1NTExMTY2NjExESe5/v379+5c+fu3bu3bt360EMPNZvNRx55JE3T4q9JXLFixVvf+taf+ImfOO644+bKe+O+++5rtVp+RgAw5+/2ivmoFAA4/GtauuyF/33hGW+UBIcgJo9ZhBi+/7DCENIkhBjz2J7OO9N5a6w9um161x2TO+9ojzzSbY51J3bnnWaa1UNWSUL6w8VZEf5iMR5czddoNNavX/+2t73tFa94xbJlywr1TeZ53ul0frDqcHp6evPmzTfeeOPevXs3bdq0c+fOiYmJ4eHhPM8PLlEsgtWrV1966aU/8zM/s3bt2izL5spA37Zt2y//8i/fcsst3vMAzPmbfQUWAPPGglN/atlFvxVST/rjGd0dJckPiq0kJiGENIQsbw5P73twavut0/vua+3f0BzaHNtTIasmSZqkaQhp0f4aBxf6tdvtCy644E1vetOll166bNmywj4mL8/zg9OvYoy7du168MEH77vvvna7fccdd2zatGl6enrv3r3dbvcHf2zWNBqN00477cUvfvFrX/vaY489dg5VVwddd911v/qrv7p7925vbADm/C2aAguAeaO2+IRVL/tobdEJomAGbprSNKuFak/eHGsNb2kNbZ7edcfE1htaBzbmnWbsNkOShqz6/Q2zCmRiYiLGeP755//Mz/zMq171qqLNxnoSMcY9e/bs27dvcnLy/vvvv/feezdv3rxly5bx8fGpqamDs7dm7ugLFy487bTTfvqnf/olL3nJ4sVzcm1yjPEv/uIv/viP/9jbF4D5cC+mwAJgPln143/Uf8JLC7iwi3khJjEJWRayRsiqeWe62xzpjGwf33z1xJbvdMZ2tUa3J3k3hJCkWUirSZol8chv6pSmaafTGRsby7Ls/PPP/y//5b9ccsklc+4OsNvtNpvNgztqbdy48aabbtq2bdsdd9yxb9++vXv3PosH6unpWbFixYUXXvjKV176nOecOzAwMHfH6+jo6K/92q9deeWV3roAzAMKLADmlQWnvnbZRb8VKrWk8LtBM5fFJCZJloW0FkKapFnenmruuXt807fbw5un9tzTHn4ktqdjkqS13pDVkhiP+L7vIYSDu011u92LL774DW94w+te97of3YV9brnrrrs2bdp0991333bbbXv37t2+ffv09PTTW2NYr9ePPvro5z3veeecc875559/4oknzoNheu+9977jHe/YuHGjdywA84ACC4B5JetZctxPfyHrXxo7TWkw82KSJElIk5CmWU9a6+lM7G0deGhq5+0Tm/9tatc9nYm9eXs8q/WHal8ROqwkSfI8HxkZybLsTW960y//8i+fc845c/0cdDqdRx55ZGpq6vrrr7/hhhu2bNmyc+fOoaGhQ/naarV63HHHPec5z7noogtPOunk0047bT6Nzv/zf/7P7/zO73S7XW9UAOYBBRYA86tOiPGoSz/ev+4/xU77iPcFlHAAhqye1vpizLsTe5tDmye3XDe1/XvTu+9pj24Ntf600jh4A3ZkB2eaps1mc2JiYv369a9//et/6qd+6tRTT50H6U9PT4+Pj2/fvv2WW27ZuXPnTTfddN99942Njf3on+zv7z/llFNOP/30008//eyzzz7uuON6enrm2VgcHR39rd/6rX/5l3/xtgRgflBgATC/+oPO9ILTX7/qP304xjzm5h1wREZhTNIsrfYmaZp0u92p/dO7757cftPo/f/a3P9gWqknIQtpLQlHuMbK83x8fDxJktNOO+3d7373ZZddNm/OQLfbTdP0vvvu27hx49VXX33fffc9/PDDK1asWLVq1bnnnnv00UevXLnyhBNOWLlyZbU6bx9aes8997z+9a8fHh72jgRgflBgATC/qoNOs7Zk3dGv/l/VhcfETksgHMHBmCTh4FbuIYTYabVGt03vunP0wa9Obb+p2xpLut202nPEH1nYbrdbrVZfX9+ll176u7/7uyecMN8e4jk8PDw6OtpsNnt7e3t6ehYuXJim6fwffDH+7d/+7fve9z7vQwDmjWxOP1oFAH5YSLuT+6qDR/WsPj/J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1q37+Mc//tKXvrRsyW/evPn973//1VdffXD3egDg2aLAAgCYT2JaX9Cd3L/vux8/cOv/TpKQNgafyZbth9VehRCGhobWr1//8Y9//Md+7MfKFv23vvWtv/qrv/rud79rFALAs06BBUA5hVnbxxpmU1YfnN53/95rPzZ2/78kWS2t9SVx9qYCjYyMrF+//s///M/LtnJwdHT0//7f//u5z31u48aNBiEAzAQFFgAlFC0hZP6N6pBWQ6Uxvunbe6//2NSOW0O1L1Rqs9lejY+Pr1279uMf/3jZ2qtOp/PHf/zHX/jCF0ZHRw1EAJghCiwASiiYgcX8EtNab2y3DnzvU/tv+mRneiSt9iYhm832anJy8oQTTviTP/mTl7zkJSXKPcY777zz05/+9Je+9CVbtgPAjFJgAQDMXTEJWVrva+3ftO+7fzn2wL/GmKeV+ixXtNPT08cff/zHPvaxUu3a3m63v/KVr/z5n//5xo0bY1SIA8DMUmABAMxRIVTqSZqNP/iNvdf98dTue9JaX0hn++7u4NyrP/3TPy1Pe5Xn+Z49ez7/+c9/8pOfnJycNBABYBYosAAA5pwY0mrIap2JvUO3f+7AbZ/pTh7IGoOzubNbCCHP87GxsbVr1/7Zn/1Zefa9mp6evummm/78z//8pptusmwQAGaNAgsAYA6JSRLSal8SwvSOm/dc9xdjG67IGguyngWzuatbCCHGODw8fOKJJ5aqvdq2bdvf/d3ffeELX9i1a5exCACzSYEFQDkrAE8hZE4O3ZBWs8aC9viu0Xv++cBt/7u5f2Olb+mjg3q2HJx7tW/fvlNOOeXP//zPS7JycHR09K677vrkJz95ww03TE1NGYsAMMsUWACUkKcQMufEJMa01hey2thD3zxw299NPHRlzDtZY9Esj+QQQqvVGh4ePu+88z760Y++6EUvmvfRt9vtbdu2ffKTn7zxxhs3btxoLALAEaHAAqCUXYAZWMwtaTWrDXTHdx644/89cOtnOuO700pPWuud/faq2WzGGH/+53/+3e9+94knnjjvg5+env7c5z73xS9+8YEHHpienjYSAeBIUWABUEJmYDGHRmtIK715d3r47n88cOtnmnvujt1OVh9IQjbLYzhN08nJyb6+vne/+90///M/PzAwML+Dn56evvXWWz/96U9ff/31IyMjRiIAHFkKLACAYgqhUg8hTO28dd+Nn5zYdFUSQhLStNabJMnsN7AjIyOrVq36zd/8zbe+9a2Vyny+hxwZGdm1a9dnP/vZK664Yv/+/e1221gEgCNOgQVAOVlCSIGFNKRZkmatvRuG7/3C2IOXt0e2h2pPCOkR+XY6nU673X7hC1/427/92y960YvSNJ2fPxRi7HQ6d9xxxz//8z9fe+21W7Zs6XQ6BiMAFIQCC4CSNgSWEFLIgZmFrJrEbnt0x8g9Xxi771+aw5uTtJrW+md/xB582uD09HQI4Wd/9md/53d+Z9WqVfM1+MnJyTvvvPPyyy//5je/uWPHDrOuAKBoFFgAlJMZWBRqPMaQVUOlkSTd1tAjYxu/PnTH/9sZ3hKTJK31f3/Ezrbp6elWq3XMMcf81//6X3/pl36pVqvNy+wnJyfvvvvur3zlK1ddddWmTZsMRgAoJgUWAOVkBhbFEGPIammtL8ZOe2jL2MYrhu/6x+ndd6eVRqj0hnDEBur4+HiM8ZJLLnnPe97z3Oc+d/4F3263W63W1Vdffc0111xzzTWqKwAoOAUWACWtDczA4ogPwpBW0/pAbE9P77l7YvN3Ru/94tSuO2PMs57F3x+lR6a9GhkZOeqoo375l3/5Z37mZ5YtWzbPcp+cnBwaGrrqqqtuueWW66+/ftu2bcYiABSfAgsAYDbFJKQhrWS1gW5zZHzTVRMPXz3+0DdbBzbnncmsvjDJqknMj8h3FkLodrtDQ0Pnn3/++9///pe97GXzLPqhoaENGzZ885vfvO222+6///6RkRHbtAPAXKHAAqCcLCFk1j260VVPDDGf3D9y1z+Obf5Wc8+97bEdSZ6HrJr1Lk1iPCLtVZqmnU5nYmKiXq+/5S1veec733nyySfPp+z37Nlz/fXXf+lLX3rggQf27t07OTlpPALA3KLAAgCYaTFktVDti82R6Z23jj989djGbzT3PxTbEyGrhKweqlmShCQesVJ1fHw8SZK1a9f+6q/+6hvf+MaBgYF5EHqz2Txw4MDtt9/+3e9+9zvf+c7+/fv3799vLALAHKXAAqCkhYI9sJgNIYRQSauN1vju6Y3/Nv7Q10c3Xhk7zSRJkpCmtd7HjMMj017FGCcmJlatWvXWt771zW9+8+rVq9M0ndOR53m+adOmrVu33nnnnZdffvnevXuHhoZarZbBCABzmgILgJL2CpYQMlNDK4QQQpKEGJIkxtbQ5tENV0w+cl1z912d5lha7QtpJQlHviTK87zdbscYX/KSl3zgAx84++yz52511el08jw/uE7whhtueOCBB7Zu3To6OnrwL2hQAsA8oMACAHiGYpKEkFaSkIU0xJh3p0Y7k3um99w9vuHKqV13dif3xryTVhpZ/cgvzQshdDqddrtdrVbPPvvsX/7lX375y1/e398/F3Nvt9v79u2bmpq65ZZbbr311quvvnr//v1jY2NGJADMPwosAICnJcYkSUJWDZV6SEKM3e70cHP/xube+ya23Ti19cbOxJ4krYYQQloLWeOIT/oLIeR5PjEx0el0li1b9vM///O/8iu/snTp0rmSd57neZ6HEMbGxrZt27Z79+4NGzZ8/etfHxoaevDBB41HAJjfFFgAAIfl4HyralrrSdJa3p7oTu5vHtg8ueOW6R03Te+5t3VgU5KEtN6f1vqSJHx/veqRbK9CCEmSjI2NtVqt5cuX//iP//hrXvOaV77ylcXPut1uT05OdjqdycnJTZs23XPPPdPT0w8//PCGDRv27t27Y8cOwxEASkKBBQDwJA4WTyEJIUlCyKpppRHSandqqLn3gebww9N77p3a9r3W/g3t8d15azyt9WWNhUmaPuaRgke4uooxNpvNkZGRFStWXHrppZdddtnFF1/caDQKm3in0zlw4MDevXsnJyc3b958++2379q1a3R0dMeOHQe3Y5+amjIuAaBsFFgAAI8VH22c0jSELAlZkmYhJElIY0y6o9vH99w3vefOzsiO6X33tfZvzLvTsdNKQkgrPZX+5Uk8+ApHfuPwg9XV1NTU9PT0ggUL3va2t73+9a9/wQteUMzqqtVq7dix49577x0bG9u0adOWLVs2btw4OTm5a9euH2w2b2gCQJkpsAAop5gkQQr8+3iISZIkIU2TtBayakirMe/E9lTsTHSb463hh5u7757YcVNnbGd3Yl97fGcSkySkIYQQKmmjJwkhiUlSmJIlTdOJiYlWq7VgwYLLLrvszW9+8/nnn9/b23ukvp88zw8+KLDT6SRJ0u12x8bGDhw48Mgjj9xzzz179+7dvn37/v379+zZ0263h4aGjEgA4IcosAAop3DEd9SmICMhpFmSVkNWC1kltic6kwe6k/s643taI4+09j/UPLChNbQ5tqfyznTemUxiEtJKWmkkSUhC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";
		}
	}});

	BDFDB.ModuleUtils.patch(BDFDB, LibraryModules.IconUtils, "getGuildBannerURL", {instead: e => {
		return e.methodArguments[0].id == "410787888507256842" ? e.methodArguments[0].banner : e.callOriginalMethod();
	}});
	
	for (let type of NoFluxContextMenus) InternalBDFDB.patchContextMenuLib(BDFDB.ModuleUtils.findByName(type), false);
	for (let type of NoFluxPopouts) InternalBDFDB.patchPopoutLib(BDFDB.ModuleUtils.findByName(type), false);
	for (let type of FluxContextMenus) InternalBDFDB.patchContextMenuLib(BDFDB.ModuleUtils.findByName(`FluxContainer(${type})`), true);

	BDFDB.ModuleUtils.forceAllUpdates(BDFDB);
	
	InternalBDFDB.addContextListeners(BDFDB);

	if (BDFDB.UserUtils.me.id == "278543574059057154") {
		for (let module in DiscordClassModules) if (!DiscordClassModules[module]) BDFDB.LogUtils.warn(module + " not initialized in DiscordClassModules");
		for (let obj in DiscordObjects) if (!DiscordObjects[obj]) BDFDB.LogUtils.warn(obj + " not initialized in DiscordObjects");
		for (let require in LibraryRequires) if (!LibraryRequires[require]) BDFDB.LogUtils.warn(require + " not initialized in LibraryRequires");
		for (let module in LibraryModules) if (!LibraryModules[module]) BDFDB.LogUtils.warn(module + " not initialized in LibraryModules");
		for (let component in NativeSubComponents) if (!NativeSubComponents[component]) BDFDB.LogUtils.warn(component + " not initialized in NativeSubComponents");
		for (let component in LibraryComponents) if (!LibraryComponents[component]) BDFDB.LogUtils.warn(component + " not initialized in LibraryComponents");

		BDFDB.ModuleUtils.DevFuncs = {};
		BDFDB.ModuleUtils.DevFuncs.generateClassId = function (index) {
			let chars = "0123456789ABCDEFGHIJKMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split("");
			let id = "";
			while (id.length < 6) id += chars[Math.floor(Math.random() * chars.length)];
			return id;
		};
		BDFDB.ModuleUtils.DevFuncs.findByIndex = function (index) {
			var req = InternalBDFDB.getWebModuleReq();
			return req.c[index];
		};
		BDFDB.ModuleUtils.DevFuncs.findPropAny = function (strings) {
			strings = BDFDB.ArrayUtils.is(strings) ? strings : Array.from(arguments);
			var req = InternalBDFDB.getWebModuleReq(); window.t = {"$filter":(prop => strings.every(string => prop.toLowerCase().indexOf(string.toLowerCase()) > -1))};
			for (let i in req.c) if (req.c.hasOwnProperty(i)) {
				let m = req.c[i].exports;
				if (m && typeof m == "object") for (let j in m) if (window.t.$filter(j)) window.t[j + "_" + i] = m;
				if (m && typeof m == "object" && typeof m.default == "object") for (let j in m.default) if (window.t.$filter(j)) window.t[j + "_default_" + i] = m.default;
			}
			console.clear();
			console.log(window.t);
		};
		BDFDB.ModuleUtils.DevFuncs.findPropFunc = function (strings) {
			strings = BDFDB.ArrayUtils.is(strings) ? strings : Array.from(arguments);
			var req = InternalBDFDB.getWebModuleReq(); window.t = {"$filter":(prop => strings.every(string => prop.toLowerCase().indexOf(string.toLowerCase()) > -1))};
			for (let i in req.c) if (req.c.hasOwnProperty(i)) {
				let m = req.c[i].exports;
				if (m && typeof m == "object") for (let j in m) if (window.t.$filter(j) && typeof m[j] != "string") window.t[j + "_" + i] = m;
				if (m && typeof m == "object" && typeof m.default == "object") for (let j in m.default) if (window.t.$filter(j) && typeof m.default[j] != "string") window.t[j + "_default_" + i] = m.default;
			}
			console.clear();
			console.log(window.t);
		};
		BDFDB.ModuleUtils.DevFuncs.findPropStringLib = function (strings) {
			strings = BDFDB.ArrayUtils.is(strings) ? strings : Array.from(arguments);
			var req = InternalBDFDB.getWebModuleReq(); window.t = {"$filter":(prop => strings.every(string => prop.toLowerCase().indexOf(string.toLowerCase()) > -1))};
			for (let i in req.c) if (req.c.hasOwnProperty(i)) {
				let m = req.c[i].exports;
				if (m && typeof m == "object") for (let j in m) if (window.t.$filter(j) && typeof m[j] == "string" && /^[A-z0-9]+\-[A-z0-9_-]{6}$/.test(m[j])) window.t[j + "_" + i] = m;
				if (m && typeof m == "object" && typeof m.default == "object") for (let j in m.default) if (window.t.$filter(j) && typeof m.default[j] == "string" && /^[A-z0-9]+\-[A-z0-9_-]{6}$/.test(m.default[j])) window.t[j + "_default_" + i] = m.default;
			}
			console.clear();
			console.log(window.t);
		};
		BDFDB.ModuleUtils.DevFuncs.findNameAny = function (strings) {
			strings = BDFDB.ArrayUtils.is(strings) ? strings : Array.from(arguments);
			var req = InternalBDFDB.getWebModuleReq(); window.t = {"$filter":(modu => strings.some(string => typeof modu.displayName == "string" && modu.displayName.toLowerCase().indexOf(string.toLowerCase()) > -1 || modu.name == "string" && modu.name.toLowerCase().indexOf(string.toLowerCase()) > -1))};
			for (let i in req.c) if (req.c.hasOwnProperty(i)) {
				let m = req.c[i].exports;
				if (m && (typeof m == "object" || typeof m == "function") && window.t.$filter(m)) window.t[(m.displayName || m.name) + "_" + i] = m;
				if (m && (typeof m == "object" || typeof m == "function") && m.default && (typeof m.default == "object" || typeof m.default == "function") && window.t.$filter(m.default)) window.t[(m.default.displayName || m.default.name) + "_" + i] = m.default;
			}
			console.clear();
			console.log(window.t);
		};
		BDFDB.ModuleUtils.DevFuncs.findCodeAny = function (strings) {
			strings = BDFDB.ArrayUtils.is(strings) ? strings : Array.from(arguments);
			var req = InternalBDFDB.getWebModuleReq(); window.t = {"$filter":(prop => strings.every(string => prop.toLowerCase().indexOf(string.toLowerCase()) > -1))};
			for (let i in req.c) if (req.c.hasOwnProperty(i)) {
				let m = req.c[i].exports;
				if (m && typeof m == "object") for (let j in m) {
					let f = m[j];
					if (typeof f == "function" && window.t.$filter(f.toString())) window.t[j + "_module_" + i] = {string:f.toString(), func:f, module:m};
				}
				if (m && typeof m == "object" && typeof m.default == "object") for (let j in m.default) {
					let f = m.default[j];
					if (typeof f == "function" && window.t.$filter(f.toString())) window.t[j + "_default_" + i] = {string:f.toString(), func:f, module:m.default};
				}
			}
			for (let i in req.m) { 
				let f = req.m[i];
				if (typeof f == "function" && window.t.$filter(f.toString())) window.t["funtion_" + i] = {string:f.toString(), func:f};
			}
			console.clear();
			console.log(window.t);
		};
		BDFDB.ModuleUtils.DevFuncs.getAllModules = function () {
			var req = InternalBDFDB.getWebModuleReq(); window.t = {};
			for (let i in req.c) if (req.c.hasOwnProperty(i)) {
				let m = req.c[i].exports;
				if (m && typeof m == "object") window.t[i] = m;
			}
			console.clear();
			console.log(window.t);
		};
		BDFDB.ModuleUtils.DevFuncs.getAllStringLibs = function () {
			var req = InternalBDFDB.getWebModuleReq(); window.t = [];
			for (let i in req.c) if (req.c.hasOwnProperty(i)) {
				let m = req.c[i].exports;
				if (m && typeof m == "object" && !BDFDB.ArrayUtils.is(m) && Object.keys(m).length) {
					var string = true, stringlib = false;
					for (let j in m) {
						if (typeof m[j] != "string") string = false;
						if (typeof m[j] == "string" && /^[A-z0-9]+\-[A-z0-9_-]{6}$/.test(m[j])) stringlib = true;
					}
					if (string && stringlib) window.t.push(m);
				}
				if (m && typeof m == "object" && m.default && typeof m.default == "object" && !BDFDB.ArrayUtils.is(m.default) && Object.keys(m.default).length) {
					var string = true, stringlib = false;
					for (let j in m.default) {
						if (typeof m.default[j] != "string") string = false;
						if (typeof m.default[j] == "string" && /^[A-z0-9]+\-[A-z0-9_-]{6}$/.test(m.default[j])) stringlib = true;
					}
					if (string && stringlib) window.t.push(m.default);
				}
			}
			console.clear();
			console.log(window.t);
		};
		BDFDB.ModuleUtils.DevFuncs.listen = function (strings) {
			strings = BDFDB.ArrayUtils.is(strings) ? strings : Array.from(arguments);
			BDFDB.ModuleUtils.DevFuncs.listenstop();
			BDFDB.ModuleUtils.DevFuncs.listen.p = BDFDB.ModuleUtils.patch("WebpackSearch", BDFDB.ModuleUtils.findByProperties(strings), strings[0], {after: e => {
				console.log(e);
			}});
		};
		BDFDB.ModuleUtils.DevFuncs.listenstop = function () {
			if (typeof BDFDB.ModuleUtils.DevFuncs.listen.p == "function") BDFDB.ModuleUtils.DevFuncs.listen.p();
		};
		BDFDB.ModuleUtils.DevFuncs.req = InternalBDFDB.getWebModuleReq();
	}
	for (let obj in DiscordObjects) if (!DiscordObjects[obj]) {
		DiscordObjects[obj] = function () {};
		BDFDB.DiscordObjects[obj] = function () {};
	}
	for (let component in NativeSubComponents) if (!NativeSubComponents[component]) NativeSubComponents[component] = "div";
	for (let component in LibraryComponents) if (!LibraryComponents[component]) {
		LibraryComponents[component] = "div";
		BDFDB.LibraryComponents[component] = "div";
	}

	BDFDB.loadMessage = BDFDB.PluginUtils.init;
	BDFDB.unloadMessage = BDFDB.PluginUtils.clear;
	BDFDB.createSettingsPanel = BDFDB.PluginUtils.createSettingsPanel;
	
	BDFDB.addObserver = BDFDB.ObserverUtils.connect;
	BDFDB.killObservers = BDFDB.ObserverUtils.disconnect;
	
	BDFDB.addEventListener = BDFDB.ListenerUtils.add;
	BDFDB.removeEventListener = BDFDB.ListenerUtils.remove;
	BDFDB.addChildEventListener = BDFDB.ListenerUtils.addToChildren;
	BDFDB.copyEvent = BDFDB.ListenerUtils.copyEvent;
	BDFDB.stopEvent = BDFDB.ListenerUtils.stopEvent;
	
	BDFDB.showToast = BDFDB.NotificationUtils.toast;
	BDFDB.showDesktopNotification = BDFDB.NotificationUtils.desktop;
	BDFDB.createNotificationsBar = BDFDB.NotificationUtils.notice;
	
	BDFDB.createTooltip = (string, ele, config) => {return BDFDB.TooltipUtils.create(ele, string, config);};
	BDFDB.updateTooltipPosition = BDFDB.TooltipUtils.update;
	
	BDFDB.isObject = BDFDB.ObjectUtils.is;
	BDFDB.sortObject = BDFDB.ObjectUtils.sort;
	BDFDB.reverseObject = BDFDB.ObjectUtils.reverse;
	BDFDB.filterObject = BDFDB.ObjectUtils.filter;
	BDFDB.mapObject = BDFDB.ObjectUtils.map;
	BDFDB.isObjectEmpty = BDFDB.ObjectUtils.isEmpty;
	
	BDFDB.sortArrayByKey = BDFDB.ArrayUtils.keySort;
	BDFDB.numSortArray = BDFDB.ArrayUtils.numSort;
	BDFDB.removeFromArray = BDFDB.ArrayUtils.remove;
	BDFDB.getAllIndexes = BDFDB.ArrayUtils.getAllIndexes;
	BDFDB.removeCopiesFromArray = BDFDB.ArrayUtils.removeCopies;
	
	BDFDB.React = Object.assign({}, BDFDB.ReactUtils);
	BDFDB.getKeyInformation = (config) => {return BDFDB.ReactUtils.findValue(config.node || config.instance, config.key, config);};
	BDFDB.getReactInstance = BDFDB.ReactUtils.getInstance;
	BDFDB.getOwnerInstance = (config) => {return BDFDB.ReactUtils.findOwner(config.node || config.instance, config);};
	BDFDB.ReactUtils.getOwner = BDFDB.ReactUtils.findOwner;
	BDFDB.getContextMenuGroupAndIndex = (startchildren, names) => {return BDFDB.ReactUtils.findChildren(startchildren, {name:names, props:[["label",names]]});};
	BDFDB.getReactValue = BDFDB.ReactUtils.getValue;
	
	BDFDB.WebModules = Object.assign({}, BDFDB.ModuleUtils);
	BDFDB.WebModules.patch = (module, modulefunctions, plugin, patchfunctions) => {return BDFDB.ModuleUtils.patch(plugin, module, modulefunctions, patchfunctions)};
	BDFDB.ModuleUtils.initiateProcess = InternalBDFDB.initiateProcess;
	BDFDB.WebModules.initiateProcess = InternalBDFDB.initiateProcess;
	
	BDFDB.myData = BDFDB.UserUtils.me;
	BDFDB.getUserStatus = BDFDB.UserUtils.getStatus;
	BDFDB.getUserStatusColor = BDFDB.UserUtils.getStatusColor;
	BDFDB.getUserAvatar = BDFDB.UserUtils.getAvatar;
	BDFDB.isUserAllowedTo = BDFDB.UserUtils.can;
	
	BDFDB.getGuildIcon = BDFDB.GuildUtils.getIcon;
	BDFDB.getGuildBanner = BDFDB.GuildUtils.getBanner;
	BDFDB.getServerDiv = BDFDB.GuildUtils.getDiv;
	BDFDB.getServerData = BDFDB.GuildUtils.getData;
	BDFDB.readServerList = BDFDB.GuildUtils.getAll;
	BDFDB.readUnreadServerList = BDFDB.GuildUtils.getUnread;
	BDFDB.readPingedServerList = BDFDB.GuildUtils.getPinged;
	BDFDB.readMutedServerList = BDFDB.GuildUtils.getMuted;
	BDFDB.getSelectedServer = BDFDB.GuildUtils.getSelected;
	BDFDB.createServerDivCopy = BDFDB.GuildUtils.createCopy;
	BDFDB.openGuildContextMenu = BDFDB.GuildUtils.openMenu;
	BDFDB.markGuildAsRead = BDFDB.GuildUtils.markAsRead;
	
	BDFDB.getFolderID = BDFDB.FolderUtils.getId;
	BDFDB.getFolderDiv = BDFDB.FolderUtils.getDiv;
	
	BDFDB.getChannelDiv = BDFDB.ChannelUtils.getDiv;
	BDFDB.getSelectedChannel = BDFDB.ChannelUtils.getSelected;
	BDFDB.openChannelContextMenu = BDFDB.ChannelUtils.openMenu;
	BDFDB.markChannelAsRead = BDFDB.ChannelUtils.markAsRead;
	
	BDFDB.DmUtils = BDFDB.DMUtils;
	BDFDB.getDmDiv = BDFDB.DMUtils.getDiv;
	BDFDB.getChannelIcon = BDFDB.DMUtils.getIcon;
	BDFDB.readDmList = BDFDB.DMUtils.getAll;
	
	BDFDB.saveAllData = (data, plugin, key) => {BDFDB.DataUtils.save(data, plugin, key)};
	BDFDB.saveData = (id, data, plugin, key) => {BDFDB.DataUtils.save(data, plugin, key, id)};
	BDFDB.loadAllData = (plugin, key) => {return BDFDB.DataUtils.load(plugin, key)};
	BDFDB.loadData = (id, plugin, key) => {return BDFDB.DataUtils.load(plugin, key, id)};
	BDFDB.removeAllData = (plugin, key) => {BDFDB.DataUtils.remove(plugin, key)};
	BDFDB.removeData = (id, plugin, key) => {BDFDB.DataUtils.remove(plugin, key, id)};
	BDFDB.getAllData = (plugin, key) => {return BDFDB.DataUtils.get(plugin, key)};
	BDFDB.getData = (id, plugin, key) => {return BDFDB.DataUtils.get(plugin, key, id)};
	
	BDFDB.colorCONVERT = BDFDB.ColorUtils.convert;
	BDFDB.colorSETALPHA = BDFDB.ColorUtils.setAlpha;
	BDFDB.colorGETALPHA = BDFDB.ColorUtils.getAlpha;
	BDFDB.colorCHANGE = BDFDB.ColorUtils.change;
	BDFDB.colorINV = BDFDB.ColorUtils.invert;
	BDFDB.colorCOMPARE = BDFDB.ColorUtils.compare;
	BDFDB.colorISBRIGHT = BDFDB.ColorUtils.isBright;
	BDFDB.colorTYPE = BDFDB.ColorUtils.getType;
	BDFDB.colorGRADIENT = BDFDB.ColorUtils.createGradient;
	BDFDB.getSwatchColor = BDFDB.ColorUtils.getSwatchColor;
	BDFDB.openColorPicker = BDFDB.ColorUtils.openPicker;
	
	BDFDB.addClass = BDFDB.DOMUtils.addClass;
	BDFDB.removeClass = BDFDB.DOMUtils.removeClass;
	BDFDB.toggleClass = BDFDB.DOMUtils.toggleClass;
	BDFDB.containsClass = BDFDB.DOMUtils.containsClass;
	BDFDB.replaceClass = BDFDB.DOMUtils.replaceClass;
	BDFDB.removeClasses = BDFDB.DOMUtils.removeClassFromDOM;
	BDFDB.toggleEles = BDFDB.DOMUtils.toggle;
	BDFDB.isEleHidden = BDFDB.DOMUtils.isHidden;
	BDFDB.removeEles = BDFDB.DOMUtils.remove;
	BDFDB.htmlToElement = BDFDB.DOMUtils.create;
	BDFDB.getParentEle = BDFDB.DOMUtils.getParent;
	BDFDB.setInnerText = BDFDB.DOMUtils.setText;
	BDFDB.getInnerText = BDFDB.DOMUtils.getText;
	BDFDB.getRects = BDFDB.DOMUtils.getRects;
	BDFDB.getTotalHeight = BDFDB.DOMUtils.getHeight;
	BDFDB.getTotalWidth = BDFDB.DOMUtils.getWidth;
	BDFDB.appendLocalStyle = BDFDB.DOMUtils.appendLocalStyle;
	BDFDB.removeLocalStyle = BDFDB.DOMUtils.removeLocalStyle;
	
	BDFDB.encodeToHTML = BDFDB.StringUtils.htmlEscape;
	BDFDB.regEscape = BDFDB.StringUtils.regEscape;
	BDFDB.insertNRST = BDFDB.StringUtils.insertNRST;
	BDFDB.getParsedLength = BDFDB.StringUtils.getParsedLength;
	BDFDB.highlightText = BDFDB.StringUtils.highlight;
	
	BDFDB.formatBytes = BDFDB.NumberUtils.formatBytes;
	BDFDB.mapRange = BDFDB.NumberUtils.mapRange;
	
	BDFDB.getDiscordTheme = BDFDB.DiscordUtils.getTheme;
	BDFDB.getDiscordMode = BDFDB.DiscordUtils.getMode;
	BDFDB.getDiscordZoomFactor = BDFDB.DiscordUtils.getZoomFactor;
	BDFDB.getDiscordFontScale = BDFDB.DiscordUtils.getFontScale;
	
	BDFDB.openModal = BDFDB.ModalUtils.open;
	BDFDB.openConfirmModal = BDFDB.ModalUtils.confirm;
	
	BDFDB.openContextMenu = BDFDB.ContextMenuUtils.open;
	BDFDB.closeContextMenu = BDFDB.ContextMenuUtils.close;
	
	BDFDB.BdUtils = BDFDB.BDUtils;
	BDFDB.getPluginsFolder = BDFDB.BDUtils.getPluginsFolder;
	BDFDB.getThemesFolder = BDFDB.BDUtils.getThemesFolder;
	BDFDB.isPluginEnabled = BDFDB.BDUtils.isPluginEnabled;
	BDFDB.getPlugin = BDFDB.BDUtils.getPlugin;
	BDFDB.isThemeEnabled = BDFDB.BDUtils.isThemeEnabled;
	BDFDB.getTheme = BDFDB.BDUtils.getTheme;
	BDFDB.isRestartNoMoreEnabled = BDFDB.BDUtils.isAutoLoadEnabled;
	
	BDFDB.languages = BDFDB.LanguageUtils.languages;
	BDFDB.getDiscordLanguage = BDFDB.LanguageUtils.getLanguage;
	BDFDB.LanguageStrings = BDFDB.LanguageUtils.LanguageStrings;
	BDFDB.LanguageStringsCheck = BDFDB.LanguageUtils.LanguageStringsCheck;
	BDFDB.LanguageStringsFormat = BDFDB.LanguageUtils.LanguageStringsFormat;
	BDFDB.getLibraryStrings = () => {
		let languageid = BDFDB.LanguageUtils.getLanguage().id;
		if (InternalBDFDB.LibraryStrings[languageid]) return InternalBDFDB.LibraryStrings[languageid];
		return InternalBDFDB.LibraryStrings.default;
	};
	
	BDFDB.LibraryComponents.ModalTabContent = LibraryComponents.ModalComponents.ModalTabContent;
	BDFDB.LibraryComponents.NumberBadge = LibraryComponents.BadgeComponents.NumberBadge;

	BDFDB.loaded = true;
	InternalBDFDB.reloadLib = _ => {
		var libraryScript = document.querySelector("head script#BDFDBLibraryScript");
		if (libraryScript) libraryScript.remove();
		libraryScript = document.createElement("script");
		libraryScript.setAttribute("id", "BDFDBLibraryScript");
		libraryScript.setAttribute("type", "text/javascript");
		libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
		libraryScript.setAttribute("date", performance.now());
		document.head.appendChild(libraryScript);
	};
	var libKeys = Object.keys(BDFDB).length - 10, crashInterval = BDFDB.TimeUtils.interval(_ => {
		if (!window.BDFDB || typeof BDFDB != "object" || Object.keys(BDFDB).length < libKeys || !BDFDB.InternalData.loadid) {
			BDFDB.LogUtils.warn("Reloading library due to internal error.");
			BDFDB.TimeUtils.clear(crashInterval);
			InternalBDFDB.reloadLib();
		}
		else if (BDFDB.InternalData.loadid != loadid) {
			BDFDB.TimeUtils.clear(crashInterval);
		}
		else if (!BDFDB.InternalData.creationTime || performance.now() - BDFDB.InternalData.creationTime > 18000000) {
			BDFDB.TimeUtils.clear(crashInterval);
			InternalBDFDB.reloadLib();
		}
	}, 10000);
})();