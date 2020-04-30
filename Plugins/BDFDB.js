(_ => {
	if (window.BDFDB && window.BDFDB.ListenerUtils && typeof window.BDFDB.ListenerUtils.remove == "function") window.BDFDB.ListenerUtils.remove(window.BDFDB);
	if (window.BDFDB && window.BDFDB.StoreChangeUtils && typeof window.BDFDB.StoreChangeUtils.remove == "function") window.BDFDB.StoreChangeUtils.remove(window.BDFDB);
	if (window.BDFDB && window.BDFDB.ObserverUtils && typeof window.BDFDB.ObserverUtils.disconnect == "function") window.BDFDB.ObserverUtils.disconnect(window.BDFDB);
	if (window.BDFDB && window.BDFDB.ModuleUtils && typeof window.BDFDB.ModuleUtils.unpatch == "function") window.BDFDB.ModuleUtils.unpatch(window.BDFDB);
	if (window.BDFDB && window.BDFDB.WindowUtils && typeof window.BDFDB.WindowUtils.closeAll == "function") window.BDFDB.WindowUtils.closeAll(window.BDFDB);
	if (window.BDFDB && window.BDFDB.WindowUtils && typeof window.BDFDB.WindowUtils.removeListener == "function") window.BDFDB.WindowUtils.removeListener(window.BDFDB);
	
	const BDFDB = {
		myPlugins: Object.assign({}, window.BDFDB && window.BDFDB.myPlugins),
		InternalData: Object.assign({
			pressedKeys: [],
			mousePosition: {
				pageX: 0,
				pageY: 0
			},
			componentPatchQueries: {}
		},
		window.BDFDB && window.BDFDB.InternalData,
		{
			creationTime: performance.now()
		}),
		BDv2Api: window.BDFDB && window.BDFDB.BDv2Api || undefined,
		name: "BDFDB"
	};
	const InternalBDFDB = {
		name: "BDFDB",
		patchPriority: 0
	};
	const loadId = Math.round(Math.random() * 10000000000000000);
	BDFDB.InternalData.loadId = loadId;
	
	if (typeof Array.prototype.flat != "function") Array.prototype.flat = function () {return this;}

	InternalBDFDB.defaults = {
		settings: {
			showToasts:				{value:true,	description:"Show Plugin start and stop Toasts"},
			showSupportBadges:		{value:true,	description:"Show little Badges for Users who support my Patreon"}
		}
	};

	BDFDB.LogUtils = {};
	BDFDB.LogUtils.log = function (string, name) {
		console.log(`%c[${typeof name == "string" && name || "BDFDB"}]`, "color: #3a71c1; font-weight: 700;", (typeof string == "string" && string || "").trim());
	};
	BDFDB.LogUtils.warn = function (string, name) {
		console.warn(`%c[${typeof name == "string" && name || "BDFDB"}]`, "color: #3a71c1; font-weight: 700;", (typeof string == "string" && string || "").trim());
	};
	BDFDB.LogUtils.error = function (string, name) {
		console.error(`%c[${typeof name == "string" && name || "BDFDB"}]`, "color: #3a71c1; font-weight: 700;", "Fatal Error: " + (typeof string == "string" && string || "").trim());
	};
	
	BDFDB.LogUtils.log("Loading library.");
	
	BDFDB.PluginUtils = {};
	BDFDB.PluginUtils.init = function (plugin) {
		plugin.name = plugin.name || (typeof plugin.getName == "function" ? plugin.getName() : null);
		plugin.version = plugin.version || (typeof plugin.getVersion == "function" ? plugin.getVersion() : null);
		plugin.author = plugin.author || (typeof plugin.getAuthor == "function" ? plugin.getAuthor() : null);
		plugin.description = plugin.description || (typeof plugin.getDescription == "function" ? plugin.getDescription() : null);

		let loadMessage = BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_started", "v" + plugin.version);
		BDFDB.LogUtils.log(loadMessage, plugin.name);
		if (!BDFDB.BDUtils.getSettings("fork-ps-2") && BDFDB.DataUtils.get(BDFDB, "settings", "showToasts")) BDFDB.NotificationUtils.toast(plugin.name + " " + loadMessage, {nopointer: true, selector: "plugin-started-toast"});

		let url = typeof plugin.getRawUrl == "function" && typeof plugin.getRawUrl() == "string" ? plugin.getRawUrl() : `https://mwittrien.github.io/BetterDiscordAddons/Plugins/${plugin.name}/${plugin.name}.plugin.js`;
		BDFDB.PluginUtils.checkUpdate(plugin.name, url);

		if (typeof plugin.initConstructor === "function") BDFDB.TimeUtils.suppress(plugin.initConstructor.bind(plugin), "Could not initiate constructor!", plugin.name)();
		if (typeof plugin.css === "string") BDFDB.DOMUtils.appendLocalStyle(plugin.name, plugin.css);

		InternalBDFDB.patchPlugin(plugin);
		InternalBDFDB.addSpecialListeners(plugin);

		BDFDB.PluginUtils.translate(plugin);

		BDFDB.PluginUtils.checkChangeLog(plugin);

		if (!window.PluginUpdates || typeof window.PluginUpdates !== "object") window.PluginUpdates = {plugins: {} };
		window.PluginUpdates.plugins[url] = {name: plugin.name, raw: url, version: plugin.version};
		if (typeof window.PluginUpdates.interval === "undefined") window.PluginUpdates.interval = BDFDB.TimeUtils.interval(_ => {BDFDB.PluginUtils.checkAllUpdates();}, 1000*60*60*2);

		plugin.started = true;
		delete plugin.stopping;

		for (let name in BDFDB.myPlugins) if (!BDFDB.myPlugins[name].started && typeof BDFDB.myPlugins[name].initialize == "function") setImmediate(_ => {BDFDB.TimeUtils.suppress(BDFDB.myPlugins[name].initialize.bind(BDFDB.myPlugins[name]), "Could not initiate plugin!", name)();});
	};
	BDFDB.PluginUtils.clear = function (plugin) {
		InternalBDFDB.clearStartTimeout(plugin);

		delete BDFDB.myPlugins[plugin.name];

		let unloadMessage = BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_stopped", "v" + plugin.version);
		BDFDB.LogUtils.log(unloadMessage, plugin.name);
		if (!BDFDB.BDUtils.getSettings("fork-ps-2") && BDFDB.DataUtils.get(BDFDB, "settings", "showToasts")) BDFDB.NotificationUtils.toast(plugin.name + " " + unloadMessage, {nopointer: true, selector: "plugin-stopped-toast"});

		let url = typeof plugin.getRawUrl == "function" && typeof plugin.getRawUrl() == "string" ? plugin.getRawUrl() : `https://mwittrien.github.io/BetterDiscordAddons/Plugins/${plugin.name}/${plugin.name}.plugin.js`;

		if (typeof plugin.css === "string") BDFDB.DOMUtils.removeLocalStyle(plugin.name);

		BDFDB.ModuleUtils.unpatch(plugin);
		BDFDB.ListenerUtils.remove(plugin);
		BDFDB.StoreChangeUtils.remove(plugin);
		BDFDB.ObserverUtils.disconnect(plugin);
		BDFDB.WindowUtils.closeAll(plugin);
		BDFDB.WindowUtils.removeListener(plugin);
		
		for (let type in BDFDB.InternalData.componentPatchQueries) BDFDB.ArrayUtils.remove(BDFDB.InternalData.componentPatchQueries[type].query, plugin, true);
		
		for (let modal of document.querySelectorAll(`.${plugin.name}-modal, .${plugin.name.toLowerCase()}-modal, .${plugin.name}-settingsmodal, .${plugin.name.toLowerCase()}-settingsmodal`)) {
			let closeButton = modal.querySelector(BDFDB.dotCN.modalclose);
			if (closeButton) closeButton.click();
		}
		
		delete BDFDB.DataUtils.cached[plugin.name]
		delete window.PluginUpdates.plugins[url];

		delete plugin.started;
		BDFDB.TimeUtils.timeout(_ => {delete plugin.stopping;});
	};
	BDFDB.PluginUtils.translate = function (plugin) {
		plugin.labels = {};
		if (typeof plugin.setLabelsByLanguage === "function" || typeof plugin.changeLanguageStrings === "function") {
			if (document.querySelector("html").lang) translate();
			else {
				let translateInterval = BDFDB.TimeUtils.interval(_ => {
					if (document.querySelector("html").lang) {
						BDFDB.TimeUtils.clear(translateInterval);
						translate();
					}
				}, 100);
			}
			function translate() {
				let language = BDFDB.LanguageUtils.getLanguage();
				if (typeof plugin.setLabelsByLanguage === "function") plugin.labels = plugin.setLabelsByLanguage(language.id);
				if (typeof plugin.changeLanguageStrings === "function") plugin.changeLanguageStrings();
				BDFDB.LogUtils.log(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_translated", language.ownlang), plugin.name);
			}
		}
	};
	BDFDB.PluginUtils.checkUpdate = function (pluginName, url) {
		if (pluginName && url) return new Promise(callback => {
			LibraryRequires.request(url, (error, response, result) => {
				if (error) return callback(null);
				let newVersion = result.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i);
				if (!newVersion) return callback(null);
				if (BDFDB.NumberUtils.getVersionDifference(newVersion[0], window.PluginUpdates.plugins[url].version) > 0.2) {
					BDFDB.NotificationUtils.toast(`${pluginName} will be force updated, because your version is heavily outdated.`, {
						type: "warn",
						nopointer: true,
						selector: "plugin-forceupdate-toast"
					});
					BDFDB.PluginUtils.downloadUpdate(pluginName, url);
					return callback(2);
				}
				else if (BDFDB.NumberUtils.compareVersions(newVersion[0], window.PluginUpdates.plugins[url].version)) {
					BDFDB.PluginUtils.showUpdateNotice(pluginName, url);
					return callback(1);
				}
				else {
					BDFDB.PluginUtils.removeUpdateNotice(pluginName);
					return callback(0);
				}
			});
		});
		return new Promise(_ => {callback(null);});
	};
	BDFDB.PluginUtils.checkAllUpdates = function () {
		return new Promise(callback => {
			let finished = 0, amount = 0;
			for (let url in window.PluginUpdates.plugins) {
				let plugin = window.PluginUpdates.plugins[url];
				if (plugin) BDFDB.PluginUtils.checkUpdate(plugin.name, plugin.raw).then(state => {
					finished++;
					if (state == 1) amount++;
					if (finished >= Object.keys(window.PluginUpdates.plugins).length) callback(amount);
				});
			}
		});
	};
	BDFDB.PluginUtils.showUpdateNotice = function (pluginName, url) {
		if (!pluginName || !url) return;
		let updateNotice = document.querySelector("#pluginNotice");
		if (!updateNotice) {
			updateNotice = BDFDB.NotificationUtils.notice(`The following plugins need to be updated:&nbsp;&nbsp;<strong id="outdatedPlugins"></strong>`, {html:true, id:"pluginNotice", type:"info", btn:!BDFDB.BDUtils.isAutoLoadEnabled() ? "Reload" : "", customicon:`<svg height="100%" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="100%" version="1.1" viewBox="0 0 2000 2000"><metadata /><defs><filter id="shadow1"><feDropShadow dx="20" dy="0" stdDeviation="20" flood-color="rgba(0,0,0,0.35)"/></filter><filter id="shadow2"><feDropShadow dx="15" dy="0" stdDeviation="20" flood-color="rgba(255,255,255,0.15)"/></filter><filter id="shadow3"><feDropShadow dx="10" dy="0" stdDeviation="20" flood-color="rgba(0,0,0,0.35)"/></filter></defs><g><path style="filter: url(#shadow3)" d="M1195.44+135.442L1195.44+135.442L997.6+136.442C1024.2+149.742+1170.34+163.542+1193.64+179.742C1264.34+228.842+1319.74+291.242+1358.24+365.042C1398.14+441.642+1419.74+530.642+1422.54+629.642L1422.54+630.842L1422.54+632.042C1422.54+773.142+1422.54+1228.14+1422.54+1369.14L1422.54+1370.34L1422.54+1371.54C1419.84+1470.54+1398.24+1559.54+1358.24+1636.14C1319.74+1709.94+1264.44+1772.34+1193.64+1821.44C1171.04+1837.14+1025.7+1850.54+1000+1863.54L1193.54+1864.54C1539.74+1866.44+1864.54+1693.34+1864.54+1296.64L1864.54+716.942C1866.44+312.442+1541.64+135.442+1195.44+135.442Z" fill="#171717" opacity="1"/><path style="filter: url(#shadow2)" d="M1695.54+631.442C1685.84+278.042+1409.34+135.442+1052.94+135.442L361.74+136.442L803.74+490.442L1060.74+490.442C1335.24+490.442+1335.24+835.342+1060.74+835.342L1060.74+1164.84C1150.22+1164.84+1210.53+1201.48+1241.68+1250.87C1306.07+1353+1245.76+1509.64+1060.74+1509.64L361.74+1863.54L1052.94+1864.54C1409.24+1864.54+1685.74+1721.94+1695.54+1368.54C1695.54+1205.94+1651.04+1084.44+1572.64+999.942C1651.04+915.542+1695.54+794.042+1695.54+631.442Z" fill="#3E82E5" opacity="1"/><path style="filter: url(#shadow1)" d="M1469.25+631.442C1459.55+278.042+1183.05+135.442+826.65+135.442L135.45+135.442L135.45+1004C135.45+1004+135.427+1255.21+355.626+1255.21C575.825+1255.21+575.848+1004+575.848+1004L577.45+490.442L834.45+490.442C1108.95+490.442+1108.95+835.342+834.45+835.342L664.65+835.342L664.65+1164.84L834.45+1164.84C923.932+1164.84+984.244+1201.48+1015.39+1250.87C1079.78+1353+1019.47+1509.64+834.45+1509.64L135.45+1509.64L135.45+1864.54L826.65+1864.54C1182.95+1864.54+1459.45+1721.94+1469.25+1368.54C1469.25+1205.94+1424.75+1084.44+1346.35+999.942C1424.75+915.542+1469.25+794.042+1469.25+631.442Z" fill="#FFFFFF" opacity="1"/></g></svg>`});
			updateNotice.style.setProperty("display", "block", "important");
			updateNotice.style.setProperty("visibility", "visible", "important");
			updateNotice.style.setProperty("opacity", "1", "important");
			updateNotice.querySelector(BDFDB.dotCN.noticedismiss).addEventListener("click", _ => {
				BDFDB.DOMUtils.remove(".update-clickme-tooltip");
			});
			let reloadButton = updateNotice.querySelector(BDFDB.dotCN.noticebutton);
			if (reloadButton) {
				BDFDB.DOMUtils.toggle(reloadButton, true);
				reloadButton.addEventListener("click", _ => {
					LibraryRequires.electron.remote.getCurrentWindow().reload();
				});
				reloadButton.addEventListener("mouseenter", _ => {
					if (window.PluginUpdates.downloaded) BDFDB.TooltipUtils.create(reloadButton, window.PluginUpdates.downloaded.join(", "), {type:"bottom", selector:"update-notice-tooltip", style: "max-width: 420px"});
				});
			}
		}
		if (updateNotice) {
			let updateNoticeList = updateNotice.querySelector("#outdatedPlugins");
			if (updateNoticeList && !updateNoticeList.querySelector(`#${pluginName}-notice`)) {
				if (updateNoticeList.querySelector("span")) updateNoticeList.appendChild(BDFDB.DOMUtils.create(`<span class="separator">, </span>`));
				let updateEntry = BDFDB.DOMUtils.create(`<span id="${pluginName}-notice">${pluginName}</span>`);
				updateEntry.addEventListener("click", _ => {BDFDB.PluginUtils.downloadUpdate(pluginName, url);});
				updateNoticeList.appendChild(updateEntry);
				if (!document.querySelector(".update-clickme-tooltip")) BDFDB.TooltipUtils.create(updateNoticeList, "Click us!", {type:"bottom", selector:"update-clickme-tooltip", delay:500});
			}
		}
	};
	BDFDB.PluginUtils.removeUpdateNotice = function (pluginName, updateNotice = document.querySelector("#pluginNotice")) {
		if (!pluginName || !updateNotice) return;
		let updateNoticeList = updateNotice.querySelector("#outdatedPlugins");
		if (updateNoticeList) {
			let noticeEntry = updateNoticeList.querySelector(`#${pluginName}-notice`);
			if (noticeEntry) {
				let nextSibling = noticeEntry.nextSibling;
				let prevSibling = noticeEntry.prevSibling;
				if (nextSibling && BDFDB.DOMUtils.containsClass(nextSibling, "separator")) nextSibling.remove();
				else if (prevSibling && BDFDB.DOMUtils.containsClass(prevSibling, "separator")) prevSibling.remove();
				noticeEntry.remove();
			}
			if (!updateNoticeList.querySelector("span")) {
				let reloadButton = updateNotice.querySelector(BDFDB.dotCN.noticebutton);
				if (reloadButton) {
					updateNotice.querySelector(".notice-message").innerText = "To finish updating you need to reload.";
					BDFDB.DOMUtils.toggle(reloadButton, false);
				}
				else updateNotice.querySelector(BDFDB.dotCN.noticedismiss).click();
			}
		}
	};
	BDFDB.PluginUtils.downloadUpdate = function (pluginName, url) {
		if (!pluginName || !url) return;
		LibraryRequires.request(url, (error, response, result) => {
			if (error) return BDFDB.LogUtils.warn("Unable to get update for " + pluginName);
			BDFDB.InternalData.creationTime = 0;
			let newVersion = result.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i);
			newVersion = newVersion.toString().replace(/['"]/g, "");
			LibraryRequires.fs.writeFileSync(LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), url.split("/").slice(-1)[0]), result);
			BDFDB.NotificationUtils.toast(`${pluginName} v${window.PluginUpdates.plugins[url].version} has been replaced by ${pluginName} v${newVersion}.`, {nopointer:true, selector:"plugin-updated-toast"});
			let updateNotice = document.querySelector("#pluginNotice");
			if (updateNotice) {
				if (updateNotice.querySelector(BDFDB.dotCN.noticebutton)) {
					window.PluginUpdates.plugins[url].version = newVersion;
					if (!window.PluginUpdates.downloaded) window.PluginUpdates.downloaded = [];
					if (!window.PluginUpdates.downloaded.includes(pluginName)) window.PluginUpdates.downloaded.push(pluginName);
				}
				BDFDB.PluginUtils.removeUpdateNotice(pluginName, updateNotice);
			}
		});
	};
	BDFDB.PluginUtils.checkChangeLog = function (plugin) {
		if (!BDFDB.ObjectUtils.is(plugin) || !plugin.changelog) return;
		let changeLog = BDFDB.DataUtils.load(plugin, "changelog");
		if (!changeLog.currentversion || BDFDB.NumberUtils.compareVersions(plugin.version, changeLog.currentversion)) {
			changeLog.currentversion = plugin.version;
			BDFDB.DataUtils.save(changeLog, plugin, "changelog");
			BDFDB.PluginUtils.openChangeLog(plugin);
		}
	};
	BDFDB.PluginUtils.openChangeLog = function (plugin) {
		if (!BDFDB.ObjectUtils.is(plugin) || !plugin.changelog) return;
		let changeLogHTML = "", headers = {
			added: "New Features",
			fixed: "Bug Fixes",
			improved: "Improvements",
			progress: "Progress"
		};
		for (let type in plugin.changelog) {
			type = type.toLowerCase();
			let className = BDFDB.disCN["changelog" + type];
			if (className) {
				changeLogHTML += `<h1 class="${className} ${BDFDB.disCN.margintop20}"${changeLogHTML.indexOf("<h1") == -1 ? `style="margin-top: 0px !important;"` : ""}>${headers[type]}</h1><ul>`;
				for (let log of plugin.changelog[type]) changeLogHTML += `<li><strong>${log[0]}</strong>${log[1] ? (": " + log[1] + ".") : ""}</li>`;
				changeLogHTML += `</ul>`
			}
		}
		if (changeLogHTML) BDFDB.ModalUtils.open(plugin, {header:`${plugin.name} ${BDFDB.LanguageUtils.LanguageStrings.CHANGE_LOG}`, subheader:`Version ${plugin.version}`, children:BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(changeLogHTML)), className:BDFDB.disCN.modalchangelogmodal, contentClassName:BDFDB.disCNS.changelogcontainer + BDFDB.disCN.modalminicontent});
	};
	BDFDB.PluginUtils.addLoadingIcon = function (icon) {
		if (!Node.prototype.isPrototypeOf(icon)) return;
		BDFDB.DOMUtils.addClass(icon, BDFDB.disCN.loadingicon);
		let loadingIconWrapper = document.querySelector(BDFDB.dotCN.app + ">" + BDFDB.dotCN.loadingiconwrapper);
		if (!loadingIconWrapper) {
			loadingIconWrapper = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN.loadingiconwrapper}"></div>`);
			document.querySelector(BDFDB.dotCN.app).appendChild(loadingIconWrapper);
			let killObserver = new MutationObserver(changes => {if (!loadingIconWrapper.firstElementChild) BDFDB.DOMUtils.remove(loadingIconWrapper);});
			killObserver.observe(loadingIconWrapper, {childList:true});
		}
		loadingIconWrapper.appendChild(icon);
	};
	BDFDB.PluginUtils.createSettingsPanel = function (plugin, children) {
		if (!BDFDB.ObjectUtils.is(plugin) || !children || (!BDFDB.ReactUtils.isValidElement(children) && !BDFDB.ArrayUtils.is(children)) || (BDFDB.ArrayUtils.is(children) && !children.length)) return;
		let settingsPanel = BDFDB.DOMUtils.create(`<div class="${plugin.name}-settings ${BDFDB.disCN.settingsPanel}"></div>`);
		BDFDB.ReactUtils.render(BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SettingsPanel, {
			key: `${plugin.name}-settingsPanel`,
			title: plugin.name,
			children
		}), settingsPanel);
		return settingsPanel;
	};
	BDFDB.PluginUtils.refreshSettingsPanel = function (plugin, settingsPanel, ...args) {
		if (!BDFDB.ObjectUtils.is(plugin) || typeof plugin.getSettingsPanel != "function" || !Node.prototype.isPrototypeOf(settingsPanel) || !settingsPanel.parentElement) return;
		settingsPanel.parentElement.appendChild(plugin.getSettingsPanel(...args));
		settingsPanel.remove();
	};
	InternalBDFDB.clearStartTimeout = function (plugin) {
		if (!BDFDB.ObjectUtils.is(plugin)) return;
		BDFDB.TimeUtils.clear(plugin.startTimeout, plugin.libLoadTimeout);
		delete plugin.startTimeout;
		delete plugin.libLoadTimeout;
	};
	InternalBDFDB.addSpecialListeners = function (plugin) {
		if (BDFDB.ObjectUtils.is(plugin)) {
			if (typeof plugin.onSettingsClosed === "function") {
				let SettingsLayer = BDFDB.ModuleUtils.findByName("StandardSidebarView");
				if (SettingsLayer) BDFDB.ModuleUtils.patch(plugin, SettingsLayer.prototype, "componentWillUnmount", {after: e => {
					plugin.onSettingsClosed();
				}});
			}
			if (typeof plugin.onSwitch === "function") {
				let spacer = document.querySelector(`${BDFDB.dotCN.guildswrapper} ~ * > ${BDFDB.dotCN.chatspacer}`);
				if (spacer) {
					let noChannelObserver = new MutationObserver(changes => {changes.forEach(change => {
						if (change.target && BDFDB.DOMUtils.containsClass(change.target, BDFDB.disCN.nochannel)) plugin.onSwitch();
					});});
					BDFDB.ObserverUtils.connect(plugin, spacer.querySelector(BDFDB.dotCNC.chat + BDFDB.dotCN.nochannel), {name:"switchFixNoChannelObserver", instance:noChannelObserver}, {attributes: true});
					let spacerObserver = new MutationObserver(changes => {changes.forEach(change => {if (change.addedNodes) {change.addedNodes.forEach(node => {
						if (BDFDB.DOMUtils.containsClass(node, BDFDB.disCN.chat, BDFDB.disCN.nochannel, false)) {
							BDFDB.ObserverUtils.connect(plugin, node, {name:"switchFixNoChannelObserver", instance:noChannelObserver}, {attributes: true});
						}
					});}});});
					BDFDB.ObserverUtils.connect(plugin, spacer, {name:"switchFixSpacerObserver", instance:spacerObserver}, {childList: true});
				}
			}
			InternalBDFDB.addContextListeners(plugin);
		}
	};
	
	BDFDB.ObserverUtils = {};
	BDFDB.ObserverUtils.connect = function (plugin, eleOrSelec, observer, config = {childList: true}) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (!BDFDB.ObjectUtils.is(plugin) || !eleOrSelec || !observer) return;
		if (BDFDB.ObjectUtils.isEmpty(plugin.observers)) plugin.observers = {};
		if (!BDFDB.ArrayUtils.is(plugin.observers[observer.name])) plugin.observers[observer.name] = [];
		if (!observer.multi) for (let subinstance of plugin.observers[observer.name]) subinstance.disconnect();
		if (observer.instance) plugin.observers[observer.name].push(observer.instance);
		let instance = plugin.observers[observer.name][plugin.observers[observer.name].length - 1];
		if (instance) {
			let node = Node.prototype.isPrototypeOf(eleOrSelec) ? eleOrSelec : typeof eleOrSelec === "string" ? document.querySelector(eleOrSelec) : null;
			if (node) instance.observe(node, config);
		}
	};
	BDFDB.ObserverUtils.disconnect = function (plugin, observer) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
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

	BDFDB.StoreChangeUtils = {};
	BDFDB.StoreChangeUtils.add = function (plugin, store, callback) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ObjectUtils.is(store) || typeof store.addChangeListener != "function" ||  typeof callback != "function") return;
		BDFDB.ListenerUtils.remove(plugin, store, callback);
		if (!BDFDB.ArrayUtils.is(plugin.changeListeners)) plugin.changeListeners = [];
		plugin.changeListeners.push({store, callback});
		store.addChangeListener(callback);
	};
	BDFDB.StoreChangeUtils.remove = function (plugin, store, callback) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ArrayUtils.is(plugin.changeListeners)) return;
		if (!store) {
			while (plugin.changeListeners.length) {
				let listener = plugin.changeListeners.pop();
				listener.store.removeChangeListener(listener.callback);
			}
		}
		else if (BDFDB.ObjectUtils.is(store) && typeof store.addChangeListener == "function") {
			if (!callback) {
				for (let listener of plugin.changeListeners) {
					let removedListeners = [];
					if (listener.store == store) {
						listener.store.removeChangeListener(listener.callback);
						removedListeners.push(listener);
					}
					if (removedListeners.length) plugin.changeListeners = plugin.changeListeners.filter(listener => !removedListeners.includes(listener));
				}
			}
			else if (typeof callback == "function") {
				store.removeChangeListener(callback);
				plugin.changeListeners = plugin.changeListeners.filter(listener => listener.store == store && listener.callback == callback);
			}
		}
	};

	BDFDB.ListenerUtils = {};
	BDFDB.ListenerUtils.add = function (plugin, ele, actions, selectorOrCallback, callbackOrNothing) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (!BDFDB.ObjectUtils.is(plugin) || (!Node.prototype.isPrototypeOf(ele) && ele !== window) || !actions) return;
		let callbackIs4th = typeof selectorOrCallback == "function";
		let selector = callbackIs4th ? undefined : selectorOrCallback;
		let callback = callbackIs4th ? selectorOrCallback : callbackOrNothing;
		if (typeof callback != "function") return;
		BDFDB.ListenerUtils.remove(plugin, ele, actions, selector);
		for (let action of actions.split(" ")) {
			action = action.split(".");
			let eventname = action.shift().toLowerCase();
			if (!eventname) return;
			let origeventname = eventname;
			eventname = eventname == "mouseenter" || eventname == "mouseleave" ? "mouseover" : eventname;
			let namespace = (action.join(".") || "") + plugin.name;
			if (!BDFDB.ArrayUtils.is(plugin.eventListeners)) plugin.eventListeners = [];
			let eventcallback = null;
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

			plugin.eventListeners.push({ele, eventname, origeventname, namespace, selector, eventcallback});
			ele.addEventListener(eventname, eventcallback, true);
		}
	};
	BDFDB.ListenerUtils.remove = function (plugin, ele, actions = "", selector) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ArrayUtils.is(plugin.eventListeners)) return;
		if (!ele) {
			while (plugin.eventListeners.length) {
				let listener = plugin.eventListeners.pop();
				listener.ele.removeEventListener(listener.eventname, listener.eventcallback, true);
			}
		}
		else if (Node.prototype.isPrototypeOf(ele) || ele === window) {
			for (let action of actions.split(" ")) {
				action = action.split(".");
				let eventname = action.shift().toLowerCase();
				let namespace = (action.join(".") || "") + plugin.name;
				for (let listener of plugin.eventListeners) {
					let removedListeners = [];
					if (listener.ele == ele && (!eventname || listener.origeventname == eventname) && listener.namespace == namespace && (selector === undefined || listener.selector == selector)) {
						listener.ele.removeEventListener(listener.eventname, listener.eventcallback, true);
						removedListeners.push(listener);
					}
					if (removedListeners.length) plugin.eventListeners = plugin.eventListeners.filter(listener => !removedListeners.includes(listener));
				}
			}
		}
	};
	BDFDB.ListenerUtils.multiAdd = function (node, actions, callback) {
		if (!Node.prototype.isPrototypeOf(node) || !actions || typeof callback != "function") return;
		for (let action of actions.trim().split(" ").filter(n => n)) node.addEventListener(action, callback, true);
	};
	BDFDB.ListenerUtils.multiRemove = function (node, actions, callback) {
		if (!Node.prototype.isPrototypeOf(node) || !actions || typeof callback != "function") return;
		for (let action of actions.trim().split(" ").filter(n => n)) node.removeEventListener(action, callback, true);
	};
	BDFDB.ListenerUtils.addToChildren = function (node, actions, selector, callback) {
		if (!Node.prototype.isPrototypeOf(node) || !actions || !selector || !selector.trim() || typeof callback != "function") return;
		for (let action of actions.trim().split(" ").filter(n => n)) {
			let eventcallback = callback;
			if (action == "mouseenter" || action == "mouseleave") eventcallback = e => {if (e.target.matches(selector)) callback(e);};
			node.querySelectorAll(selector.trim()).forEach(child => {child.addEventListener(action, eventcallback, true);});
		}
	};
	BDFDB.ListenerUtils.copyEvent = function (e, ele) {
		if (!e || !e.constructor || !e.type) return e;
		let ecopy = new e.constructor(e.type, e);
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
		let toasts = document.querySelector(".toasts, .bd-toasts");
		if (!toasts) {
			let channels = document.querySelector(BDFDB.dotCN.channels + " + div");
			let channelRects = channels ? BDFDB.DOMUtils.getRects(channels) : null;
			let members = channels ? channels.querySelector(BDFDB.dotCN.memberswrap) : null;
			let left = channelRects ? channelRects.left : 310;
			let width = channelRects ? (members ? channelRects.width - BDFDB.DOMUtils.getRects(members).width : channelRects.width) : window.outerWidth - 0;
			let form = channels ? channels.querySelector("form") : null;
			let bottom = form ? BDFDB.DOMUtils.getRects(form).height : 80;
			toasts = BDFDB.DOMUtils.create(`<div class="toasts bd-toasts" style="width:${width}px; left:${left}px; bottom:${bottom}px;"></div>`);
			(document.querySelector(BDFDB.dotCN.app) || document.body).appendChild(toasts);
		}
		const {type = "", icon = true, timeout = 3000, html = false, selector = "", nopointer = false, color = ""} = options;
		let toast = BDFDB.DOMUtils.create(`<div class="toast bd-toast">${html === true ? text : BDFDB.StringUtils.htmlEscape(text)}</div>`);
		if (type) {
			BDFDB.DOMUtils.addClass(toast, "toast-" + type);
			if (icon) BDFDB.DOMUtils.addClass(toast, "icon");
		}
		else if (color) {
			let rgbcolor = BDFDB.ColorUtils.convert(color, "RGB");
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
		const queue = _ => {
			DesktopNotificationQueue.queue.push({parsedcontent, parsedoptions});
			runqueue();
		};
		const runqueue = _ => {
			if (!DesktopNotificationQueue.running) {
				let notification = DesktopNotificationQueue.queue.shift();
				if (notification) notify(notification.parsedcontent, notification.parsedoptions);
			}
		};
		const notify = (content, options) => {
			DesktopNotificationQueue.running = true;
			let muted = options.silent;
			options.silent = options.silent || options.sound ? true : false;
			let notification = new Notification(content, options);
			let audio = new Audio();
			let timeout = BDFDB.TimeUtils.timeout(_ => {close();}, options.timeout ? options.timeout : 3000);
			if (typeof options.click == "function") notification.onclick = _ => {
				BDFDB.TimeUtils.clear(timeout);
				close();
				options.click();
			};
			if (!muted && options.sound) {
				audio.src = options.sound;
				audio.play();
			}
			const close = _ => {
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
		let layers = document.querySelector(BDFDB.dotCN.layers);
		if (!layers) return;
		let id = BDFDB.NumberUtils.generateId(NotificationBars);
		let notice = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCNS.notice + BDFDB.disCN.noticewrapper}" notice-id="${id}"><div class="${BDFDB.disCN.noticedismiss}" style="height: 36px !important; position: absolute !important; top: 0 !important; right: 0 !important; left: unset !important;"></div><span class="notice-message"></span></div>`);
		layers.parentElement.insertBefore(notice, layers);
		let noticeMessage = notice.querySelector(".notice-message");
		if (options.platform) for (let platform of options.platform.split(" ")) if (DiscordClasses["noticeicon" + platform]) {
			let icon = BDFDB.DOMUtils.create(`<i class="${BDFDB.disCN["noticeicon" + platform]}"></i>`);
			BDFDB.DOMUtils.addClass(icon, BDFDB.disCN.noticeplatformicon);
			BDFDB.DOMUtils.removeClass(icon, BDFDB.disCN.noticeicon);
			notice.insertBefore(icon, noticeMessage);
		}
		if (options.customicon) {
			let iconinner = BDFDB.DOMUtils.create(options.customicon)
			let icon = BDFDB.DOMUtils.create(`<i></i>`);
			if (iconinner.tagName == "span" && !iconinner.firstElementChild) icon.style.setProperty("background", `url(${options.customicon}) center/cover no-repeat`);
			else icon.appendChild(iconinner);
			BDFDB.DOMUtils.addClass(icon, BDFDB.disCN.noticeplatformicon);
			BDFDB.DOMUtils.removeClass(icon, BDFDB.disCN.noticeicon);
			notice.insertBefore(icon, noticeMessage);
		}
		if (options.btn || options.button) notice.appendChild(BDFDB.DOMUtils.create(`<button class="${BDFDB.disCNS.noticebutton + BDFDB.disCN.titlesize14}">${options.btn || options.button}</button>`));
		if (options.id) notice.id = options.id.split(" ").join("");
		if (options.selector) BDFDB.DOMUtils.addClass(notice, options.selector);
		if (options.css) BDFDB.DOMUtils.appendLocalStyle("BDFDBcustomNotificationBar" + id, options.css);
		if (options.style) notice.style = options.style;
		if (options.html === true) noticeMessage.innerHTML = text;
		else {
			let link = document.createElement("a");
			let newText = [];
			for (let word of text.split(" ")) {
				let encodedWord = BDFDB.StringUtils.htmlEscape(word);
				link.href = word;
				newText.push(link.host && link.host !== window.location.host ? `<label class="${BDFDB.disCN.textlink}">${encodedWord}</label>` : encodedWord);
			}
			noticeMessage.innerHTML = newText.join(" ");
		}
		let type = null;
		if (options.type && !document.querySelector(BDFDB.dotCNS.chatbase + BDFDB.dotCN.noticestreamer)) {
			if (type = BDFDB.disCN["notice" + options.type]) BDFDB.DOMUtils.addClass(notice, type);
			if (options.type == "premium") {
				let noticeButton = notice.querySelector(BDFDB.dotCN.noticebutton);
				if (noticeButton) BDFDB.DOMUtils.addClass(noticeButton, BDFDB.disCN.noticepremiumaction);
				BDFDB.DOMUtils.addClass(noticeMessage, BDFDB.disCN.noticepremiumtext);
				notice.insertBefore(BDFDB.DOMUtils.create(`<i class="${BDFDB.disCN.noticepremiumlogo}"></i>`), noticeMessage);
			}
		}
		if (!type) {
			let comp = BDFDB.ColorUtils.convert(options.color, "RGBCOMP");
			if (comp) {
				let fontColor = comp[0] > 180 && comp[1] > 180 && comp[2] > 180 ? "#000" : "#FFF";
				let backgroundcolor = BDFDB.ColorUtils.convert(comp, "HEX");
				let filter = comp[0] > 180 && comp[1] > 180 && comp[2] > 180 ? "brightness(0%)" : "brightness(100%)";
				BDFDB.DOMUtils.appendLocalStyle("BDFDBcustomNotificationBarColorCorrection" + id, `${BDFDB.dotCN.noticewrapper}[notice-id="${id}"]{background-color:${backgroundcolor} !important;}${BDFDB.dotCN.noticewrapper}[notice-id="${id}"] .notice-message {color:${fontColor} !important;}${BDFDB.dotCN.noticewrapper}[notice-id="${id}"] ${BDFDB.dotCN.noticebutton} {color:${fontColor} !important;border-color:${BDFDB.ColorUtils.setAlpha(fontColor, 0.25, "RGBA")} !important;}${BDFDB.dotCN.noticewrapper}[notice-id="${id}"] ${BDFDB.dotCN.noticebutton}:hover {color:${backgroundcolor} !important;background-color:${fontColor} !important;}${BDFDB.dotCN.noticewrapper}[notice-id="${id}"] ${BDFDB.dotCN.noticedismiss} {filter:${filter} !important;}`);
			}
			else BDFDB.DOMUtils.addClass(notice, BDFDB.disCN.noticedefault);
		}
		notice.style.setProperty("height", "36px", "important");
		notice.style.setProperty("min-width", "70vw", "important");
		notice.style.setProperty("left", "unset", "important");
		notice.style.setProperty("right", "unset", "important");
		let sideMargin = ((BDFDB.DOMUtils.getWidth(document.body.firstElementChild) - BDFDB.DOMUtils.getWidth(notice))/2);
		notice.style.setProperty("left", sideMargin + "px", "important");
		notice.style.setProperty("right", sideMargin + "px", "important");
		notice.style.setProperty("min-width", "unset", "important");
		notice.style.setProperty("width", "unset", "important");
		notice.style.setProperty("max-width", "calc(100vw - " + (sideMargin*2) + "px)", "important");
		notice.querySelector(BDFDB.dotCN.noticedismiss).addEventListener("click", _ => {
			notice.style.setProperty("overflow", "hidden", "important");
			notice.style.setProperty("height", "0px", "important");
			BDFDB.TimeUtils.timeout(_ => {
				BDFDB.ArrayUtils.remove(NotificationBars, id);
				BDFDB.DOMUtils.removeLocalStyle("BDFDBcustomNotificationBar" + id);
				BDFDB.DOMUtils.removeLocalStyle("BDFDBcustomNotificationBarColorCorrection" + id);
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
		let itemLayerContainer = document.querySelector(BDFDB.dotCN.appmount +  " > " + BDFDB.dotCN.itemlayercontainer);
		if (!itemLayerContainer || (typeof text != "string" && !BDFDB.ObjectUtils.is(options.guild)) || !Node.prototype.isPrototypeOf(anker) || !document.contains(anker)) return null;
		let id = BDFDB.NumberUtils.generateId(Tooltips);
		let itemLayer = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCNS.itemlayer + BDFDB.disCN.itemlayerdisabledpointerevents}"><div class="${BDFDB.disCN.tooltip}" tooltip-id="${id}"></div></div>`);
		itemLayerContainer.appendChild(itemLayer);
		
		let tooltip = itemLayer.firstElementChild;
		
		if (options.id) tooltip.id = options.id.split(" ").join("");
		
		if (typeof options.type != "string" || !BDFDB.disCN["tooltip" + options.type.toLowerCase()]) options.type = "top";
		let type = options.type.toLowerCase();
		BDFDB.DOMUtils.addClass(tooltip, BDFDB.disCN["tooltip" + type]);
		
		let fontColorIsGradient = false, customBackgroundColor = false, style = "";
		if (options.style) style += options.style;
		if (options.fontColor) {
			fontColorIsGradient = BDFDB.ObjectUtils.is(options.fontColor);
			if (!fontColorIsGradient) style = (style ? (style + " ") : "") + `color: ${BDFDB.ColorUtils.convert(options.fontColor, "RGBA")} !important;`
		}
		if (options.backgroundColor) {
			customBackgroundColor = true;
			let backgroundColorIsGradient = BDFDB.ObjectUtils.is(options.backgroundColor);
			let backgroundColor = !backgroundColorIsGradient ? BDFDB.ColorUtils.convert(options.backgroundColor, "RGBA") : BDFDB.ColorUtils.createGradient(options.backgroundColor);
			style = (style ? (style + " ") : "") + `background: ${backgroundColor} !important; border-color: ${backgroundColorIsGradient ? BDFDB.ColorUtils.convert(options.backgroundColor[type == "left" ? 100 : 0], "RGBA") : backgroundColor} !important;`;
		}
		if (style) tooltip.style = style;
		if (typeof options.zIndex == "number") {
			itemLayer.style.setProperty("z-index", options.zIndex, "important");
			tooltip.style.setProperty("z-index", options.zIndex, "important");
		}
		if (customBackgroundColor) BDFDB.DOMUtils.addClass(tooltip, BDFDB.disCN.tooltipcustom);
		else if (options.color && BDFDB.disCN["tooltip" + options.color.toLowerCase()]) BDFDB.DOMUtils.addClass(tooltip, BDFDB.disCN["tooltip" + options.color.toLowerCase()]);
		else BDFDB.DOMUtils.addClass(tooltip, BDFDB.disCN.tooltipblack);
		
		if (options.list || BDFDB.ObjectUtils.is(options.guild)) BDFDB.DOMUtils.addClass(tooltip, BDFDB.disCN.tooltiplistitem);
		
		if (options.selector) BDFDB.DOMUtils.addClass(tooltip, options.selector);
		
		if (BDFDB.ObjectUtils.is(options.guild)) {
			let streamOwnerIds = LibraryModules.StreamUtils.getAllApplicationStreams().filter(app => app.guildId === options.guild.id).map(app => app.ownerId);
			let streamOwners = streamOwnerIds.map(ownerId => LibraryModules.UserStore.getUser(ownerId)).filter(n => n);
			let connectedUsers = Object.keys(LibraryModules.VoiceUtils.getVoiceStates(options.guild.id)).map(userId => !streamOwnerIds.includes(userId) && BDFDB.LibraryModules.UserStore.getUser(userId)).filter(n => n);
			let tooltipText = text || options.guild.toString();
			if (fontColorIsGradient) tooltipText = `<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.ColorUtils.createGradient(options.fontColor)} !important;">${BDFDB.StringUtils.htmlEscape(tooltipText)}</span>`;
			BDFDB.ReactUtils.render(BDFDB.ReactUtils.createElement(BDFDB.ReactUtils.Fragment, {
				children: [
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tooltiprow, BDFDB.disCN.tooltiprowguildname),
						children: [
							BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.GuildComponents.Badge, {
								guild: options.guild,
								size: LibraryModules.StringUtils.cssValueToNumber(DiscordClassModules.TooltipGuild.iconSize),
								className: BDFDB.disCN.tooltiprowicon
							}),
							BDFDB.ReactUtils.createElement("span", {
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tooltipguildnametext, (connectedUsers.length || streamOwners.length) && BDFDB.disCN.tooltipguildnametextlimitedsize),
								children: fontColorIsGradient || options.html ? BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(tooltipText)) : tooltipText
							})
						]
					}),
					connectedUsers.length ? BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.tooltiprow,
						children: [
							BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SvgIcon, {
								name: InternalComponents.LibraryComponents.SvgIcon.Names.SPEAKER,
								className: BDFDB.disCN.tooltipactivityicon
							}),
							BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.UserSummaryItem, {
								users: connectedUsers,
								max: 6
							})
						]
					}) : null,
					streamOwners.length ? BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.tooltiprow,
						children: [
							BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SvgIcon, {
								name: InternalComponents.LibraryComponents.SvgIcon.Names.STREAM,
								className: BDFDB.disCN.tooltipactivityicon
							}),
							BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.UserSummaryItem, {
								users: streamOwners,
								max: 6
							})
						]
					}) : null
				].filter(n => n)
			}), tooltip);
		}
		else {
			if (fontColorIsGradient) tooltip.innerHTML = `<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.ColorUtils.createGradient(options.fontColor)} !important;">${BDFDB.StringUtils.htmlEscape(text)}</span>`;
			else if (options.html === true) tooltip.innerHTML = text;
			else tooltip.innerText = text;
		}
		
		tooltip.appendChild(BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN.tooltippointer}"></div>`));
		
		if (options.hide) BDFDB.DOMUtils.appendLocalStyle("BDFDBhideOtherTooltips" + id, `#app-mount ${BDFDB.dotCN.tooltip}:not([tooltip-id="${id}"]) {display: none !important;}`, itemLayerContainer);
					
		let mouseleave = _ => {BDFDB.DOMUtils.remove(itemLayer);};
		anker.addEventListener("mouseleave", mouseleave);
		
		let observer = new MutationObserver(changes => changes.forEach(change => {
			let nodes = Array.from(change.removedNodes);
			if (nodes.indexOf(itemLayer) > -1 || nodes.indexOf(anker) > -1 || nodes.some(n => n.contains(anker))) {
				BDFDB.ArrayUtils.remove(Tooltips, id);
				observer.disconnect();
				BDFDB.DOMUtils.remove(itemLayer);
				BDFDB.DOMUtils.removeLocalStyle("BDFDBhideOtherTooltips" + id, itemLayerContainer);
				anker.removeEventListener("mouseleave", mouseleave);
			}
		}));
		observer.observe(document.body, {subtree:true, childList:true});

		(tooltip.update = _ => {
			let pointer = tooltip.querySelector(BDFDB.dotCN.tooltippointer);
			let left, top, tRects = BDFDB.DOMUtils.getRects(anker), iRects = BDFDB.DOMUtils.getRects(itemLayer), aRects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount)), positionOffsets = {height: 10, width: 10}, offset = typeof options.offset == "number" ? options.offset : 0;
			switch (type) {
				case "top":
					top = tRects.top - iRects.height - positionOffsets.height + 2 - offset;
					left = tRects.left + (tRects.width - iRects.width) / 2;
					break;
				case "bottom":
					top = tRects.top + tRects.height + positionOffsets.height - 2 + offset;
					left = tRects.left + (tRects.width - iRects.width) / 2;
					break;
				case "left":
					top = tRects.top + (tRects.height - iRects.height) / 2;
					left = tRects.left - iRects.width - positionOffsets.width + 2 - offset;
					break;
				case "right":
					top = tRects.top + (tRects.height - iRects.height) / 2;
					left = tRects.left + tRects.width + positionOffsets.width - 2 + offset;
					break;
				}
				
			itemLayer.style.setProperty("top", top + "px");
			itemLayer.style.setProperty("left", left + "px");
			
			pointer.style.removeProperty("margin-left");
			pointer.style.removeProperty("margin-top");
			if (type == "top" || type == "bottom") {
				if (left < 0) {
					itemLayer.style.setProperty("left", "5px");
					pointer.style.setProperty("margin-left", `${left - 10}px`);
				}
				else {
					let rightMargin = aRects.width - (left + iRects.width);
					if (rightMargin < 0) {
						itemLayer.style.setProperty("left", (aRects.width - iRects.width - 5) + "px");
						pointer.style.setProperty("margin-left", `${-1*rightMargin}px`);
					}
				}
			}
			else if (type == "left" || type == "right") {
				if (top < 0) {
					itemLayer.style.setProperty("top", "5px");
					pointer.style.setProperty("margin-top", `${top - 10}px`);
				}
				else {
					let bottomMargin = aRects.height - (top + iRects.height);
					if (bottomMargin < 0) {
						itemLayer.style.setProperty("top", aRects.height - iRects.height - 5 + "px");
						pointer.style.setProperty("margin-top", `${-1*bottomMargin}px`);
					}
				}
			}
		})();
		
		if (options.delay) {
			BDFDB.DOMUtils.toggle(itemLayer);
			BDFDB.TimeUtils.timeout(_ => {BDFDB.DOMUtils.toggle(itemLayer);}, options.delay);
		}
		return itemLayer;
	};

	BDFDB.ObjectUtils = {};
	BDFDB.ObjectUtils.is = function (obj) {
		return obj && Object.prototype.isPrototypeOf(obj) && !Array.prototype.isPrototypeOf(obj);
	};
	BDFDB.ObjectUtils.extract = function (obj, ...keys) {
		let newObj = {};
		if (BDFDB.ObjectUtils.is(obj)) for (let key of keys.flat(10).filter(n => n)) if (obj[key]) newObj[key] = obj[key];
		return newObj;
	};
	BDFDB.ObjectUtils.exclude = function (obj, ...keys) {
		let newObj = Object.assign({}, obj);
		BDFDB.ObjectUtils.delete(newObj, ...keys)
		return newObj;
	};
	BDFDB.ObjectUtils.delete = function (obj, ...keys) {
		if (BDFDB.ObjectUtils.is(obj)) for (let key of keys.flat(10).filter(n => n)) delete obj[key];
	};
	BDFDB.ObjectUtils.sort = function (obj, sort, except) {
		if (!BDFDB.ObjectUtils.is(obj)) return {};
		let newObj = {};
		if (sort === undefined || !sort) for (let key of Object.keys(obj).sort()) newObj[key] = obj[key];
		else {
			let values = [];
			for (let key in obj) values.push(obj[key]);
			values = BDFDB.ArrayUtils.keySort(values, sort, except);
			for (let value of values) for (let key in obj) if (BDFDB.equals(value, obj[key])) {
				newObj[key] = value;
				break;
			}
		}
		return newObj;
	};
	BDFDB.ObjectUtils.reverse = function (obj, sort) {
		if (!BDFDB.ObjectUtils.is(obj)) return {};
		let newObj = {};
		for (let key of (sort === undefined || !sort) ? Object.keys(obj).reverse() : Object.keys(obj).sort().reverse()) newObj[key] = obj[key];
		return newObj;
	};
	BDFDB.ObjectUtils.filter = function (obj, filter, byKey = false) {
		if (!BDFDB.ObjectUtils.is(obj)) return {};
		if (typeof filter != "function") return obj;
		return Object.keys(obj).filter(key => filter(byKey ? key : obj[key])).reduce((newObj, key) => (newObj[key] = obj[key], newObj), {});
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
		let newObj = {};
		for (let key in obj) if (BDFDB.ObjectUtils.is(obj[key])) newObj[key] = typeof mapfunc == "string" ? obj[key][mapfunc] : mapfunc(obj[key], key);
		return newObj;
	};
	BDFDB.ObjectUtils.toArray = function (obj) {
		if (!BDFDB.ObjectUtils.is(obj)) return [];
		return Object.entries(obj).map(n => n[1]);
	};
	BDFDB.ObjectUtils.deepAssign = function (obj, ...objs) {
		if (!objs.length) return obj;
		let nextobj = objs.shift();
		if (BDFDB.ObjectUtils.is(obj) && BDFDB.ObjectUtils.is(nextobj)) {
			for (let key in nextobj) {
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
	BDFDB.ArrayUtils.sum = function (array) {
		return Array.isArray(array) ? array.reduce((total, num) => total + Math.round(num), 0) : 0;
	};
	BDFDB.ArrayUtils.keySort = function (array, key, except) {
		if (!BDFDB.ArrayUtils.is(array)) return [];
		if (key == null) return array;
		if (except === undefined) except = null;
		return array.sort((x, y) => {
			let xValue = x[key], yValue = y[key];
			if (xValue !== except) return xValue < yValue ? -1 : xValue > yValue ? 1 : 0;
		});
	};
	BDFDB.ArrayUtils.numSort = function (array) {
		return array.sort((x, y) => {return x < y ? -1 : x > y ? 1 : 0;});
	};
	BDFDB.ArrayUtils.includes = function (array, ...values) {
		if (!BDFDB.ArrayUtils.is(array)) return null;
		if (!array.length) return false;
		let all = values.pop();
		if (typeof all != "boolean") {
			values.push(all);
			all = true;
		}
		if (!values.length) return false;
		let contained = undefined;
		for (let v of values) {
			if (contained === undefined) contained = all;
			if (all && !array.includes(v)) contained = false;
			if (!all && array.includes(v)) contained = true;
		}
		return contained;
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
	BDFDB.ModuleUtils.cached = window.BDFDB && window.BDFDB.ModuleUtils && window.BDFDB.ModuleUtils.cached || {};
	BDFDB.ModuleUtils.find = function (filter, getExport) {
		getExport = typeof getExport != "boolean" ? true : getExport;
		let req = InternalBDFDB.getWebModuleReq();
		for (let i in req.c) if (req.c.hasOwnProperty(i)) {
			let m = req.c[i].exports;
			if (m && (typeof m == "object" || typeof m == "function") && filter(m)) return getExport ? m : req.c[i];
			if (m && m.__esModule) {
				for (let j in m) if (m[j] && (typeof m[j] == "object" || typeof m[j] == "function") && filter(m[j])) return getExport ? m[j] : req.c[i];
				if (m.default && (typeof m.default == "object" || typeof m.default == "function")) for (let j in m.default) if (m.default[j] && (typeof m.default[j] == "object" || typeof m.default[j] == "function") && filter(m.default[j])) return getExport ? m.default[j] : req.c[i];
			}
		}
		for (let i in req.m) if (req.m.hasOwnProperty(i)) {
			let m = req.m[i];
			if (m && (typeof m == "object" || typeof m == "function") && filter(m)) return getExport ? eq.c[i] && req.c[i].exports : req.c[i];
		}
	};
	BDFDB.ModuleUtils.findByProperties = function (...properties) {
		properties = properties.flat(10);
		let getExport = properties.pop();
		if (typeof getExport != "boolean") {
			properties.push(getExport);
			getExport = true;
		}
		return InternalBDFDB.findModule("prop", JSON.stringify(properties), m => properties.every(prop => m[prop] !== undefined), getExport);
	};
	BDFDB.ModuleUtils.findByName = function (name, getExport) {
		return InternalBDFDB.findModule("name", JSON.stringify(name), m => m.displayName === name || m.render && m.render.displayName === name, typeof getExport != "boolean" ? true : getExport);
	};
	BDFDB.ModuleUtils.findByString = function (...strings) {
		strings = strings.flat(10);
		let getExport = strings.pop();
		if (typeof getExport != "boolean") {
			strings.push(getExport);
			getExport = true;
		}
		return InternalBDFDB.findModule("string", JSON.stringify(strings), m => strings.every(string => typeof m == "function" && (m.toString().indexOf(string) > -1 || typeof m.__originalMethod == "function" && m.__originalMethod.toString().indexOf(string) > -1 || typeof m.__originalFunction == "function" && m.__originalFunction.toString().indexOf(string) > -1) || BDFDB.ObjectUtils.is(m) && typeof m.type == "function" && m.type.toString().indexOf(string) > -1), getExport);
	};
	BDFDB.ModuleUtils.findByPrototypes = function (...protoprops) {
		protoprops = protoprops.flat(10);
		let getExport = protoprops.pop();
		if (typeof getExport != "boolean") {
			protoprops.push(getExport);
			getExport = true;
		}
		return InternalBDFDB.findModule("proto", JSON.stringify(protoprops), m => m.prototype && protoprops.every(prop => m.prototype[prop] !== undefined), getExport);
	};
	InternalBDFDB.findModule = function (type, cachestring, filter, getExport) {
		if (!BDFDB.ObjectUtils.is(BDFDB.ModuleUtils.cached[type])) BDFDB.ModuleUtils.cached[type] = {module:{}, export:{}};
		if (getExport && BDFDB.ModuleUtils.cached[type].export[cachestring]) return BDFDB.ModuleUtils.cached[type].export[cachestring];
		else if (!getExport && BDFDB.ModuleUtils.cached[type].module[cachestring]) return BDFDB.ModuleUtils.cached[type].module[cachestring];
		else {
			var m = BDFDB.ModuleUtils.find(filter, getExport);
			if (m) {
				if (getExport) BDFDB.ModuleUtils.cached[type].export[cachestring] = m;
				else BDFDB.ModuleUtils.cached[type].module[cachestring] = m;
				return m;
			}
			else BDFDB.LogUtils.warn(`${cachestring} [${type}] not found in WebModules`);
		}
	};
	InternalBDFDB.getWebModuleReq = function () {
		if (!InternalBDFDB.getWebModuleReq.req) {
			const id = "BDFDB-WebModules";
			const req = window.webpackJsonp.push([[], {[id]: (module, exports, req) => module.exports = req}, [[id]]]);
			delete req.m[id];
			delete req.c[id];
			InternalBDFDB.getWebModuleReq.req = req;
		}
		return InternalBDFDB.getWebModuleReq.req;
	};
	
	var WebModulesData = {};
	WebModulesData.PatchTypes = ["before", "instead", "after"];
	WebModulesData.PatchMap = {
		BannedCard: "BannedUser",
		ChannelWindow: "Channel",
		InvitationCard: "InviteRow",
		InviteCard: "InviteRow",
		MemberCard: "Member",
		PopoutContainer: "Popout",
		QuickSwitchResult: "Result",
		UserProfile: "UserProfileBody",
		WebhookCard: "Webhook"
	};
	WebModulesData.ForceObserve = [
		"DirectMessage",
		"GuildIcon"
	];
	WebModulesData.MemoComponent = [
		"ExpressionPicker",
		"ExpressionEmojiPicker",
		"GuildFolder",
		"MessageContent",
		"NowPlayingHeader"
	];
	WebModulesData.NonRender = BDFDB.ArrayUtils.removeCopies([].concat(WebModulesData.MemoComponent, [
		"Attachment",
		"ConnectedPrivateChannelsList",
		"ContextMenuItem",
		"DiscordTag",
		"InviteModalUserRow",
		"Mention",
		"Message",
		"MessageTimestamp",
		"NameTag",
		"NowPlayingItem",
		"PrivateChannelEmptyMessage",
		"RecentsHeader",
		"SystemMessage",
		"SimpleMessageAccessories",
		"UserInfo"
	]));
	WebModulesData.LoadedInComponents = {
		AutocompleteChannelResult: "LibraryComponents.AutocompleteItems.Channel",
		AutocompleteUserResult: "LibraryComponents.AutocompleteItems.User",
		ContextMenuItem: "NativeSubComponents.ContextMenuItem",
		QuickSwitchChannelResult: "LibraryComponents.QuickSwitchItems.Channel",
		QuickSwitchGroupDMResult: "LibraryComponents.QuickSwitchItems.GroupDM",
		QuickSwitchGuildResult: "LibraryComponents.QuickSwitchItems.Guild",
		QuickSwitchUserResult: "LibraryComponents.QuickSwitchItems.User",
	};
	WebModulesData.SpecialFilter = {
		V2C_ContentColumn: ins => ins && ins.return && ins.return.stateNode && ins.return.stateNode.props && typeof ins.return.stateNode.props.title == "string" && (ins.return.stateNode.props.title.toUpperCase().indexOf("PLUGINS") == 0 || ins.return.stateNode.props.title.toUpperCase().indexOf("THEMES") == 0) && ins.return.type,
		V2C_PluginCard: ins => ins && ins.return && ins.return.stateNode && ins.return.stateNode.props && ins.return.stateNode.props.addon && ins.return.stateNode.props.addon.plugin && ins.return.type,
		V2C_ThemeCard: ins => ins && ins.return && ins.return.stateNode && ins.return.stateNode.props && ins.return.stateNode.props.addon && ins.return.stateNode.props.addon.css && ins.return.type,
		GuildFolder: ins => ins && ins.return && ins.return.memoizedProps && ins.return.memoizedProps.folderId && ins.return.memoizedProps.guildIds && ins.return.type
	};
	WebModulesData.PatchFinder = {
		Account: "accountinfo",
		App: "app",
		AppSkeleton: "app",
		AppView: "appcontainer",
		AuthWrapper: "loginscreen",
		BannedCard: "guildsettingsbannedcard",
		ChannelCall: "callcurrentcontainer",
		ChannelMember: "member",
		ChannelTextAreaForm: "chatform",
		ChannelWindow: "chatcontent",
		DirectMessage: "guildouter",
		EmojiPicker: "emojipicker",
		Guild: "guildouter",
		GuildFolder: "guildfolderwrapper",
		GuildIcon: "avataricon",
		Guilds: "guildswrapper",
		GuildSettingsBans: "guildsettingsbannedcard",
		GuildSettingsEmoji: "guildsettingsemojicard",
		GuildSettingsMembers: "guildsettingsmembercard",
		GuildSidebar: "guildchannels",
		I18nLoaderWrapper: "app",
		InstantInviteModal: "invitemodalwrapper",
		InvitationCard: "invitemodalinviterow",
		InviteCard: "guildsettingsinvitecard",
		MemberCard: "guildsettingsmembercard",
		Messages: "messages",
		MessagesPopout: "messagespopout",
		ModalLayer: "layermodal",
		MutualGuilds: "userprofilebody",
		MutualFriends: "userprofilebody",
		Note: "usernote",
		PopoutContainer: "popout",
		Popouts: "popouts",
		PrivateChannelCall: "callcurrentcontainer",
		PrivateChannelCallParticipants: "callcurrentcontainer",
		PrivateChannelRecipientsInvitePopout: "searchpopoutdmaddpopout",
		PrivateChannelsList: "dmchannelsscroller",
		QuickSwitchChannelResult: "quickswitchresult",
		QuickSwitchGuildResult: "quickswitchresult",
		QuickSwitchResult: "quickswitchresult",
		SearchResults: "searchresultswrap",
		TypingUsers: "typing",
		UnreadDMs: "guildsscroller",
		Upload: "uploadmodal",
		UserHook: "auditloguserhook",
		UserPopout: "userpopout",
		UserProfile: "userprofile",
		V2C_ContentColumn: "contentcolumn",
		V2C_PluginCard: "_repocard",
		V2C_ThemeCard: "_repocard"
	};
	WebModulesData.CodeFinder = {
		ExpressionEmojiPicker: ["allowManagedEmojis", "EMOJI_PICKER_TAB_PANEL_ID", "diversitySelector"]
	};
	WebModulesData.PropsFinder = {
		MessageHeader: "MessageTimestamp",
		UnavailableGuildsButton: "UnavailableGuildsButton"
	};
	WebModulesData.NonPrototype = BDFDB.ArrayUtils.removeCopies([].concat(WebModulesData.NonRender, Object.keys(WebModulesData.CodeFinder), Object.keys(WebModulesData.PropsFinder), [
		"ChannelTextAreaContainer"
	]));
	
	BDFDB.ModuleUtils.isPatched = function (plugin, module, methodName) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (!plugin || !BDFDB.ObjectUtils.is(module) || !module.BDFDBpatch || !methodName) return false;
		const pluginId = (typeof plugin === "string" ? plugin : plugin.name).toLowerCase();
		return pluginId && module[methodName] && module[methodName].__isBDFDBpatched && module.BDFDBpatch[methodName] && BDFDB.ObjectUtils.toArray(module.BDFDBpatch[methodName]).some(patchObj => BDFDB.ObjectUtils.toArray(patchObj).some(priorityObj => Object.keys(priorityObj).includes(pluginId)));
	};
	BDFDB.ModuleUtils.patch = function (plugin, module, methodNames, patchMethods, config = {}) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (!plugin || !BDFDB.ObjectUtils.is(module) || !methodNames || !BDFDB.ObjectUtils.is(patchMethods)) return null;
		patchMethods = BDFDB.ObjectUtils.filter(patchMethods, type => WebModulesData.PatchTypes.includes(type), true);
		if (BDFDB.ObjectUtils.isEmpty(patchMethods)) return null;
		const pluginName = typeof plugin === "string" ? plugin : plugin.name;
		const pluginId = pluginName.toLowerCase();
		const patchPriority = BDFDB.ObjectUtils.is(plugin) && !isNaN(plugin.patchPriority) ? (plugin.patchPriority < 0 ? 0 : (plugin.patchPriority > 10 ? 10 : Math.round(plugin.patchPriority))) : 5;
		if (!BDFDB.ObjectUtils.is(module.BDFDBpatch)) module.BDFDBpatch = {};
		methodNames = [methodNames].flat(10).filter(n => n);
		let cancel = _ => {BDFDB.ModuleUtils.unpatch(plugin, module, methodNames);};
		for (let methodName of methodNames) if (module[methodName] == null || typeof module[methodName] == "function") {
			let i = 0;
			if (!module.BDFDBpatch[methodName] || config.force && (!module[methodName] || !module[methodName].__isBDFDBpatched)) {
				if (!module.BDFDBpatch[methodName]) {
					module.BDFDBpatch[methodName] = {};
					for (let type of WebModulesData.PatchTypes) module.BDFDBpatch[methodName][type] = {};
				}
				if (!module[methodName]) module[methodName] = (_ => {});
				const originalMethod = module[methodName];
				module.BDFDBpatch[methodName].originalMethod = originalMethod;
				module[methodName] = function () {
					let callInstead = false, stopCall = false;
					const data = {
						thisObject: this,
						methodArguments: arguments,
						originalMethod: originalMethod,
						originalMethodName: methodName,
						callOriginalMethod: _ => {if (!stopCall) data.returnValue = data.originalMethod.apply(data.thisObject, data.methodArguments)},
						callOriginalMethodAfterwards: _ => {callInstead = true;},
						stopOriginalMethodCall: _ => {stopCall = true;}
					};
					if (module.BDFDBpatch && module.BDFDBpatch[methodName]) {
						for (let priority in module.BDFDBpatch[methodName].before) for (let id in BDFDB.ObjectUtils.sort(module.BDFDBpatch[methodName].before[priority])) {
							BDFDB.TimeUtils.suppress(module.BDFDBpatch[methodName].before[priority][id], `"before" callback of ${methodName} in ${module.constructor ? (module.constructor.displayName || module.constructor.name) : "module"}`, module.BDFDBpatch[methodName].before[priority][id].pluginName)(data);
						}
						let hasInsteadPatches = BDFDB.ObjectUtils.toArray(module.BDFDBpatch[methodName].instead).some(priorityObj => !BDFDB.ObjectUtils.isEmpty(priorityObj));
						if (hasInsteadPatches) for (let priority in module.BDFDBpatch[methodName].instead) for (let id in BDFDB.ObjectUtils.sort(module.BDFDBpatch[methodName].instead[priority])) {
							let tempreturn = BDFDB.TimeUtils.suppress(module.BDFDBpatch[methodName].instead[priority][id], `"instead" callback of ${methodName} in ${module.constructor ? (module.constructor.displayName || module.constructor.name) : "module"}`, module.BDFDBpatch[methodName].instead[priority][id].pluginName)(data);
							if (tempreturn !== undefined) data.returnValue = tempreturn;
						}
						if ((!hasInsteadPatches || callInstead) && !stopCall) BDFDB.TimeUtils.suppress(data.callOriginalMethod, `originalMethod of ${methodName} in ${module.constructor ? (module.constructor.displayName || module.constructor.name) : "module"}`)();
						for (let priority in module.BDFDBpatch[methodName].after) for (let id in BDFDB.ObjectUtils.sort(module.BDFDBpatch[methodName].after[priority])) {
							let tempreturn = BDFDB.TimeUtils.suppress(module.BDFDBpatch[methodName].after[priority][id], `"after" callback of ${methodName} in ${module.constructor ? (module.constructor.displayName || module.constructor.name) : "module"}`, module.BDFDBpatch[methodName].after[priority][id].pluginName)(data);
							if (tempreturn !== undefined) data.returnValue = tempreturn;
						}
					}
					else BDFDB.TimeUtils.suppress(data.callOriginalMethod, `originalMethod of ${methodName} in ${module.constructor ? module.constructor.displayName || module.constructor.name : "module"}`)();
					callInstead = false, stopCall = false;
					return methodName == "render" && data.returnValue === undefined ? null : data.returnValue;
				};
				for (let key of Object.keys(originalMethod)) module[methodName][key] = originalMethod[key];
				if (!module[methodName].__originalFunction) {
					let realOriginalMethod = originalMethod.__originalMethod || originalMethod.__originalFunction || originalMethod;
					if (typeof realOriginalMethod == "function") {
						module[methodName].__originalFunction = realOriginalMethod;
						module[methodName].toString = _ => realOriginalMethod.toString();
					}
				}
				module[methodName].__isBDFDBpatched = true;
			}
			for (let type in patchMethods) if (typeof patchMethods[type] == "function") {
				if (!BDFDB.ObjectUtils.is(module.BDFDBpatch[methodName][type][patchPriority])) module.BDFDBpatch[methodName][type][patchPriority] = {};
				module.BDFDBpatch[methodName][type][patchPriority][pluginId] = (...args) => {
					if (config.once) cancel();
					return patchMethods[type](...args);
				};
				module.BDFDBpatch[methodName][type][patchPriority][pluginId].pluginName = pluginName;
			}
		}
		if (BDFDB.ObjectUtils.is(plugin) && !config.once && !config.noCache) {
			if (!BDFDB.ArrayUtils.is(plugin.patchCancels)) plugin.patchCancels = [];
			plugin.patchCancels.push(cancel);
		}
		return cancel;
	};
	BDFDB.ModuleUtils.unpatch = function (plugin, module, methodNames) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (!module && !methodNames) {
			if (BDFDB.ObjectUtils.is(plugin) && BDFDB.ArrayUtils.is(plugin.patchCancels)) while (plugin.patchCancels.length) (plugin.patchCancels.pop())();
		}
		else {
			if (!BDFDB.ObjectUtils.is(module) || !module.BDFDBpatch) return;
			const pluginId = !plugin ? null : (typeof plugin === "string" ? plugin : plugin.name).toLowerCase();
			if (methodNames) {
				for (let methodName of [methodNames].flat(10).filter(n => n)) if (module[methodName] && module.BDFDBpatch[methodName]) unpatch(methodName, pluginId);
			}
			else for (let patchedMethod of module.BDFDBpatch) unpatch(patchedMethod, pluginId);
		}
		function unpatch (funcName, pluginId) {
			for (let type of WebModulesData.PatchTypes) {
				if (pluginId) for (let priority in module.BDFDBpatch[funcName][type]) {
					delete module.BDFDBpatch[funcName][type][priority][pluginId];
					if (BDFDB.ObjectUtils.isEmpty(module.BDFDBpatch[funcName][type][priority])) delete module.BDFDBpatch[funcName][type][priority];
				}
				else delete module.BDFDBpatch[funcName][type];
			}
			if (BDFDB.ObjectUtils.isEmpty(BDFDB.ObjectUtils.filter(module.BDFDBpatch[funcName], key => WebModulesData.PatchTypes.includes(key) && !BDFDB.ObjectUtils.isEmpty(module.BDFDBpatch[funcName][key]), true))) {
				module[funcName] = module.BDFDBpatch[funcName].originalMethod;
				delete module.BDFDBpatch[funcName];
				if (BDFDB.ObjectUtils.isEmpty(module.BDFDBpatch)) delete module.BDFDBpatch;
			}
		}
	};
	BDFDB.ModuleUtils.forceAllUpdates = function (plugin, selectedTypes) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (BDFDB.ObjectUtils.is(plugin) && BDFDB.ObjectUtils.is(plugin.patchedModules)) {
			const app = document.querySelector(BDFDB.dotCN.app);
			const bdSettings = document.querySelector("#bd-settingspane-container > *");
			if (app) {
				selectedTypes = [selectedTypes].flat(10).filter(n => n).map(type => type && WebModulesData.PatchMap[type] ? WebModulesData.PatchMap[type] + " _ _ " + type : type);
				let filteredModules = [], specialModules = [], patchtypes = {};
				for (let patchType in plugin.patchedModules) for (let type in plugin.patchedModules[patchType]) {
					let methodNames = [plugin.patchedModules[patchType][type]].flat(10).filter(n => n);
					if (BDFDB.ArrayUtils.includes(methodNames, "componentDidMount", "componentDidUpdate", "render", false) && (!selectedTypes.length || selectedTypes.includes(type))) {
						let unmappedType = type.split(" _ _ ")[1] || type;
						let className = WebModulesData.PatchFinder[unmappedType];
						let filter = WebModulesData.SpecialFilter[unmappedType];
						if (className && DiscordClasses[className] && typeof filter == "function") {
							for (let ele of document.querySelectorAll(BDFDB.dotCN[className])) {
								let constro = filter(BDFDB.ReactUtils.getInstance(ele));
								if (constro) {
									specialModules.push([type, constro]);
									break;
								}
							}
						}
						else filteredModules.push(type);
						let name = type.split(" _ _ ")[0];
						if (!patchtypes[name]) patchtypes[name] = [];
						patchtypes[name].push(patchType);
					}
				}
				if (filteredModules.length || specialModules.length) {
					filteredModules = BDFDB.ArrayUtils.removeCopies(filteredModules);
					specialModules = BDFDB.ArrayUtils.removeCopies(specialModules);
					try {
						const appInsDown = BDFDB.ReactUtils.findOwner(app, {name:filteredModules, type:specialModules, all:true, group:true, unlimited:true});
						const appInsUp = BDFDB.ReactUtils.findOwner(app, {name:filteredModules, type:specialModules, all:true, group:true, unlimited:true, up:true});
						for (let type in appInsDown) for (let ins of appInsDown[type]) InternalBDFDB.forceInitiateProcess(plugin, ins, type, patchtypes[type]);
						for (let type in appInsUp) for (let ins of appInsUp[type]) InternalBDFDB.forceInitiateProcess(plugin, ins, type, patchtypes[type]);
						if (bdSettings) {
							const bdSettingsIns = BDFDB.ReactUtils.findOwner(bdSettings, {name:filteredModules, type:specialModules, all:true, unlimited:true});
							if (bdSettingsIns.length) {
								const bdSettingsWrap = BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.getInstance(document.querySelector("#bd-settingspane-container > *")), {props:"onChange", up:true});
								if (bdSettingsWrap && bdSettingsWrap.props && typeof bdSettingsWrap.props.onChange == "function") bdSettingsWrap.props.onChange(bdSettingsWrap.props.type);
							}
						}
					}
					catch (err) {BDFDB.LogUtils.error("Could not force update components! " + err, plugin.name);}
				}
			}
		}
	};
	InternalBDFDB.forceInitiateProcess = function (plugin, instance, type, patchtypes) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (!plugin || !instance || !type) return;
		let methodNames = [];
		for (let patchType in plugin.patchedModules) if (plugin.patchedModules[patchType][type]) methodNames.push(plugin.patchedModules[patchType][type]);
		methodNames = BDFDB.ArrayUtils.removeCopies(methodNames).flat(10).filter(n => n);
		if (methodNames.includes("componentDidMount")) InternalBDFDB.initiateProcess(plugin, type, {instance, methodname:"componentDidMount", patchtypes});
		if (methodNames.includes("render")) BDFDB.ReactUtils.forceUpdate(instance);
		else if (methodNames.includes("componentDidUpdate")) InternalBDFDB.initiateProcess(plugin, type, {instance, methodname:"componentDidUpdate", patchtypes});
	};
	InternalBDFDB.initiateProcess = function (plugin, type, e) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (BDFDB.ObjectUtils.is(plugin) && !plugin.stopping && e.instance) {
			type = LibraryModules.StringUtils.upperCaseFirstChar(type.split(" _ _ ")[1] || type).replace(/[^A-z0-9]|_/g, "");
			if (typeof plugin[`process${type}`] == "function") {
				if (typeof e.methodname == "string" && (e.methodname.indexOf("componentDid") == 0 || e.methodname.indexOf("componentWill") == 0)) {
					e.node = BDFDB.ReactUtils.findDOMNode(e.instance);
					if (e.node) return plugin[`process${type}`](e);
					else BDFDB.TimeUtils.timeout(_ => {
						e.node = BDFDB.ReactUtils.findDOMNode(e.instance);
						if (e.node) return plugin[`process${type}`](e);
					});
					
				}
				else if (e.returnvalue || e.patchtypes.includes("before")) return plugin[`process${type}`](e);
			}
		}
	};
	InternalBDFDB.patchPlugin = function (plugin) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ObjectUtils.is(plugin.patchedModules)) return;
		BDFDB.ModuleUtils.unpatch(plugin);
		for (let patchType in plugin.patchedModules) for (let type in plugin.patchedModules[patchType]) {
			let unmappedType = type.split(" _ _ ")[1] || type;
			let component = WebModulesData.LoadedInComponents[type] && BDFDB.ReactUtils.getValue(InternalComponents, WebModulesData.LoadedInComponents[type]);
			if (component) patchInstance(WebModulesData.NonRender.includes(unmappedType) ? (BDFDB.ModuleUtils.find(m => m == component, false) || {}).exports : component, type, patchType);
			else {
				let className = WebModulesData.PatchFinder[unmappedType];
				let codeFind = WebModulesData.CodeFinder[unmappedType];
				let propertyFind = WebModulesData.PropsFinder[unmappedType];
				let mapped = WebModulesData.PatchMap[type];
				let mappedType = mapped ? mapped + " _ _ " + type : type;
				let name = mappedType.split(" _ _ ")[0];
				if (mapped) {
					plugin.patchedModules[patchType][mappedType] = plugin.patchedModules[patchType][type];
					delete plugin.patchedModules[patchType][type];
				}
				if (className && DiscordClasses[className]) checkForInstance(className, mappedType, patchType, WebModulesData.ForceObserve.includes(unmappedType));
				else if (codeFind) {
					let exports = (BDFDB.ModuleUtils.findByString(codeFind, false) || {}).exports;
					patchInstance(exports && WebModulesData.MemoComponent.includes(unmappedType) ? exports.default : exports, mappedType, patchType, true);
				}
				else if (propertyFind) {
					let exports = (BDFDB.ModuleUtils.findByProperties(propertyFind, false) || {}).exports;
					patchInstance(exports && WebModulesData.MemoComponent.includes(unmappedType) ? exports.default : exports, mappedType, patchType, true);
				}
				else if (WebModulesData.NonRender.includes(unmappedType)) {
					let exports = (BDFDB.ModuleUtils.findByName(name, false) || {}).exports;
					patchInstance(exports && WebModulesData.MemoComponent.includes(unmappedType) ? exports.default : exports, mappedType, patchType, true);
				}
				else patchInstance(BDFDB.ModuleUtils.findByName(name), mappedType, patchType);
			}
		}
		function patchInstance(instance, type, patchType, ignoreCheck) {
			if (instance) {
				let name = type.split(" _ _ ")[0];
				instance = instance._reactInternalFiber && instance._reactInternalFiber.type ? instance._reactInternalFiber.type : instance;
				instance = ignoreCheck || InternalBDFDB.isInstanceCorrect(instance, name) || WebModulesData.LoadedInComponents[type] ? instance : (BDFDB.ReactUtils.findConstructor(instance, name) || BDFDB.ReactUtils.findConstructor(instance, name, {up:true}));
				if (instance) {
					instance = instance._reactInternalFiber && instance._reactInternalFiber.type ? instance._reactInternalFiber.type : instance;
					let patchMethods = {};
					patchMethods[patchType] = e => {
						return InternalBDFDB.initiateProcess(plugin, type, {
							instance: window != e.thisObject ? e.thisObject : {props:e.methodArguments[0]},
							returnvalue: e.returnValue,
							methodname: e.originalMethodName,
							patchtypes: [patchType]
						})
					};
					BDFDB.ModuleUtils.patch(plugin, WebModulesData.NonPrototype.includes(name) ? instance : instance.prototype, plugin.patchedModules[patchType][type], patchMethods);
				}
			}
		}
		function checkEle(ele, type, patchType, instanceObserver) {
			let unmappedType = type.split(" _ _ ")[1] || type;
			let ins = BDFDB.ReactUtils.getInstance(ele);
			let filter = WebModulesData.SpecialFilter[unmappedType];
			if (typeof filter == "function") {
				let component = filter(ins);
				if (component) {
					if (WebModulesData.NonRender.includes(unmappedType)) {
						let exports = (BDFDB.ModuleUtils.find(m => m == component, false) || {}).exports;
						patchInstance(exports && WebModulesData.MemoComponent.includes(unmappedType) ? exports.default : exports, type, patchType, true);
					}
					else patchInstance(component, type, patchType, true);
					BDFDB.ModuleUtils.forceAllUpdates(plugin, type);
					return true;
				}
			}
			else if (isCorrectInstance(ins, type)) {
				patchInstance(ins, type, patchType);
				BDFDB.ModuleUtils.forceAllUpdates(plugin, type);
				return true;
			}
			return false;
		}
		function checkForInstance(className, type, patchType, forceobserve) {
			const app = document.querySelector(BDFDB.dotCN.app), bdSettings = document.querySelector("#bd-settingspane-container " + BDFDB.dotCN.scrollerwrap);
			let instancefound = false;
			if (!forceobserve) {
				if (app) {
					let appins = BDFDB.ReactUtils.findConstructor(app, type, {unlimited:true}) || BDFDB.ReactUtils.findConstructor(app, type, {unlimited:true, up:true});
					if (appins && (instancefound = true)) patchInstance(appins, type, patchType);
				}
				if (!instancefound && bdSettings) {
					let bdSettingsIns = BDFDB.ReactUtils.findConstructor(bdSettings, type, {unlimited:true});
					if (bdSettingsIns && (instancefound = true)) patchInstance(bdSettingsIns, type, patchType);
				}
			}
			if (!instancefound) {
				let found = false, disclass = BDFDB.disCN[className], dotclass = BDFDB.dotCN[className];
				for (let ele of document.querySelectorAll(dotclass)) {
					found = checkEle(ele, type, patchType);
					if (found) break;
				}
				if (!found) {
					let instanceObserver = new MutationObserver(cs => {cs.forEach(c => {c.addedNodes.forEach(n => {
						if (found || !n || !n.tagName) return;
						let ele = null;
						if ((ele = BDFDB.DOMUtils.containsClass(n, disclass) ? n : n.querySelector(dotclass)) != null) {
							found = checkEle(ele, type, patchType);
							if (found) instanceObserver.disconnect();
						}
					});});});
					BDFDB.ObserverUtils.connect(plugin, BDFDB.dotCN.appmount, {name:"checkForinstanceObserver", instance:instanceObserver, multi:true
					}, {childList:true, subtree:true});
				}
			}
		}
		function isCorrectInstance(instance, name) {
			if (!instance) return false;
			instance = instance._reactInternalFiber && instance._reactInternalFiber.type ? instance._reactInternalFiber.type : instance;
			instance = InternalBDFDB.isInstanceCorrect(instance, name) ? instance : (BDFDB.ReactUtils.findConstructor(instance, name) || BDFDB.ReactUtils.findConstructor(instance, name, {up:true}));
			return !!instance;
		}
	};

	InternalBDFDB.isInstanceCorrect = function (instance, name) {
		return instance && ((instance.type && (instance.type.render && instance.type.render.displayName === name || instance.type.displayName === name || instance.type.name === name || instance.type === name)) || instance.render && (instance.render.displayName === name || instance.render.name === name) || instance.displayName == name || instance.name === name);
	};
	
	InternalBDFDB.addContextListeners = function (plugin) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		for (let type of ComponentTypeData.NormalContextMenus) if (typeof plugin[`on${type}`] === "function") InternalBDFDB.patchContextMenuPlugin(plugin, type, InternalComponents.LibraryComponents.ContextMenus[type]);
		for (let type of ComponentTypeData.FluxContextMenus) if (typeof plugin[`on${type}`] === "function") {
			if (BDFDB.InternalData.componentPatchQueries[type].module) InternalBDFDB.patchContextMenuPlugin(plugin, type, BDFDB.InternalData.componentPatchQueries[type].module);
			else {
				BDFDB.InternalData.componentPatchQueries[type].query.push(plugin);
				BDFDB.InternalData.componentPatchQueries[type].query.sort((x, y) => {return x.name < y.name ? -1 : x.name > y.name ? 1 : 0;});
			}
		}
		for (let type of ComponentTypeData.QueuedComponents) if (typeof plugin[`on${type}`] === "function") {
			if (BDFDB.InternalData.componentPatchQueries[type].module) InternalBDFDB.patchExportedContextMenuPlugin(plugin, type, BDFDB.InternalData.componentPatchQueries[type].module);
			else {
				BDFDB.InternalData.componentPatchQueries[type].query.push(plugin);
				BDFDB.InternalData.componentPatchQueries[type].query.sort((x, y) => {return x.name < y.name ? -1 : x.name > y.name ? 1 : 0;});
			}
		}
	};
	InternalBDFDB.patchContextMenuPlugin = function (plugin, type, module) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (module && module.prototype) BDFDB.ModuleUtils.patch(plugin, module.prototype, "render", {after: e => {
			if (e.thisObject && e.returnValue && typeof plugin[`on${type}`] === "function") plugin[`on${type}`]({instance:e.thisObject, returnvalue:e.returnValue, methodname:"render"});
		}});
	};
	InternalBDFDB.patchExportedContextMenuPlugin = function (plugin, type, module) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (module && module.exports) BDFDB.ModuleUtils.patch(plugin, module.exports, "default", {after: e => {
			if (e.returnValue && typeof plugin[`on${type}`] === "function") plugin[`on${type}`]({instance:{props:e.methodArguments[0]}, returnvalue:e.returnValue, methodname:"default"});
		}});
	};
	InternalBDFDB.executeExtraPatchedPatches = function (type, e) {
		if (BDFDB.ObjectUtils.is(BDFDB.InternalData.componentPatchQueries[type]) && BDFDB.ArrayUtils.is(BDFDB.InternalData.componentPatchQueries[type].query)) for (let plugin of BDFDB.InternalData.componentPatchQueries[type].query) if (e.returnvalue && typeof plugin[`on${type}`] === "function") plugin[`on${type}`](e);
	};
	InternalBDFDB.patchContextMenuLib = function (module, repatch) {
		if (module && module.prototype) {
			BDFDB.ModuleUtils.patch(BDFDB, module.prototype, "render", {after: e => {
				if (e.thisObject.props.BDFDBcontextMenu && e.thisObject.props.children && e.returnValue && e.returnValue.props) {
					e.returnValue.props.children = e.thisObject.props.children;
					delete e.thisObject.props.value;
					delete e.thisObject.props.children;
					delete e.thisObject.props.BDFDBcontextMenu;
				}
				if (repatch) {
					let newmodule = BDFDB.ReactUtils.getValue(e, "thisObject._reactInternalFiber.child.type");
					if (newmodule && newmodule.displayName && BDFDB.InternalData.componentPatchQueries[newmodule.displayName] && !BDFDB.InternalData.componentPatchQueries[newmodule.displayName].module) {
						BDFDB.InternalData.componentPatchQueries[newmodule.displayName].module = newmodule;
						InternalBDFDB.patchContextMenuLib(newmodule, false);
						while (BDFDB.InternalData.componentPatchQueries[newmodule.displayName].query.length) InternalBDFDB.patchContextMenuPlugin(BDFDB.InternalData.componentPatchQueries[newmodule.displayName].query.pop(), newmodule.displayName, newmodule);
					}
				}
			}});
		}
	};
	InternalBDFDB.patchExportedContextMenuLib = function (menu, type, shouldCloseOnPatch) {
		let module = BDFDB.ModuleUtils.find(m => m == menu.type, false);
		if (module && module.exports && module.exports.default) {
			if (!InternalComponents.LibraryComponents.ContextMenus[type]) {
				InternalComponents.LibraryComponents.ContextMenus[type] = module.exports.default;
				BDFDB.LibraryComponents.ContextMenus[type] = module.exports.default;
			}
			if (!InternalComponents.LibraryComponents.ContextMenus._Exports[type]) {
				InternalComponents.LibraryComponents.ContextMenus._Exports[type] = module.exports;
				BDFDB.LibraryComponents.ContextMenus._Exports[type] = module.exports;
			}
			if (BDFDB.InternalData.componentPatchQueries[type] && !BDFDB.InternalData.componentPatchQueries[type].module) {
				BDFDB.InternalData.componentPatchQueries[type].module = module;
				while (BDFDB.InternalData.componentPatchQueries[type].query.length) InternalBDFDB.patchExportedContextMenuPlugin(BDFDB.InternalData.componentPatchQueries[type].query.pop(), type, module);
				let close = shouldCloseOnPatch && BDFDB.ReactUtils.getValue(menu, "memoizedProps.onClose");
				if (typeof close == "function") close();
			}
			if (!module.exports.default.displayName) module.exports.default.displayName = type;
		}
	};
	InternalBDFDB.getContextMenuType = function (menuType, component) {
		if (menuType) {
			if (menuType == "MessageContextMenu" && component && component.type != InternalComponents.LibraryComponents.ContextMenus.MessageContextMenu) return "MessageOptionContextMenu";
			else if (menuType.endsWith("ContextMenu")) return menuType;
			else if (InternalComponents.LibraryComponents.ContextMenus._Types.includes(menuType)) {
				if (menuType.indexOf("USER_") == 0) return "UserContextMenu";
				else if (menuType.indexOf("CHANNEL_") == 0) return "ChannelContextMenu";
				else if (menuType.indexOf("GUILD_") == 0) return "GuildContextMenu";
				else if (menuType.indexOf("MESSAGE_") == 0) return "MessageContextMenu";
			}
		}
		return null;
	};

	BDFDB.DiscordConstants = BDFDB.ModuleUtils.findByProperties("Permissions", "ActivityTypes");
	
	var DiscordObjects = {};
	DiscordObjects.Channel = BDFDB.ModuleUtils.findByPrototypes("getRecipientId", "isManaged", "getGuildId");
	DiscordObjects.Guild = BDFDB.ModuleUtils.findByPrototypes("getIconURL", "getMaxEmojiSlots", "getRole");
	DiscordObjects.Invite = BDFDB.ModuleUtils.findByPrototypes("getExpiresAt", "isExpired");
	DiscordObjects.Message = BDFDB.ModuleUtils.findByPrototypes("getReaction", "getAuthorName", "getChannelId");
	DiscordObjects.Messages = BDFDB.ModuleUtils.findByPrototypes("jumpToMessage", "hasAfterCached", "forEach");
	DiscordObjects.Timestamp = BDFDB.ModuleUtils.findByPrototypes("add", "dayOfYear", "hasAlignedHourOffset");
	DiscordObjects.User = BDFDB.ModuleUtils.findByPrototypes("hasFlag", "isLocalBot", "isClaimed");
	BDFDB.DiscordObjects = Object.assign({}, DiscordObjects);
	
	var LibraryRequires = {};
	for (let name of ["child_process", "electron", "fs", "path", "process", "request"]) {
		try {LibraryRequires[name] = require(name);} catch (err) {}
	}
	BDFDB.LibraryRequires = Object.assign({}, LibraryRequires);
	
	var LibraryModules = {};
	LibraryModules.AckUtils = BDFDB.ModuleUtils.findByProperties("localAck", "bulkAck");
	LibraryModules.APIUtils = BDFDB.ModuleUtils.findByProperties("getAPIBaseURL");
	LibraryModules.AnalyticsUtils = BDFDB.ModuleUtils.findByProperties("isThrottled", "track");
	LibraryModules.AnimationUtils = BDFDB.ModuleUtils.findByProperties("spring", "decay");
	LibraryModules.BadgeUtils = BDFDB.ModuleUtils.findByProperties("getBadgeCountString", "getBadgeWidthForValue");
	LibraryModules.CategoryCollapseStore = BDFDB.ModuleUtils.findByProperties("getCollapsedCategories", "isCollapsed");
	LibraryModules.CategoryCollapseUtils = BDFDB.ModuleUtils.findByProperties("categoryCollapse", "categoryCollapseAll");
	LibraryModules.ChannelStore = BDFDB.ModuleUtils.findByProperties("getChannel", "getChannels");
	LibraryModules.ColorUtils = BDFDB.ModuleUtils.findByProperties("hex2int", "hex2rgb");
	LibraryModules.ContextMenuUtils = BDFDB.ModuleUtils.findByProperties("closeContextMenu", "openContextMenu");
	LibraryModules.CopyLinkUtils = BDFDB.ModuleUtils.findByProperties("SUPPORTS_COPY", "copy");
	LibraryModules.CurrentUserStore = BDFDB.ModuleUtils.findByProperties("getCurrentUser");
	LibraryModules.CurrentVoiceUtils = BDFDB.ModuleUtils.findByProperties("getAveragePing", "isConnected");
	LibraryModules.DirectMessageStore = BDFDB.ModuleUtils.findByProperties("getPrivateChannelIds", "getPrivateChannelTimestamps");
	LibraryModules.DirectMessageUnreadStore = BDFDB.ModuleUtils.findByProperties("getUnreadPrivateChannelIds");
	LibraryModules.DispatchApiUtils = BDFDB.ModuleUtils.findByProperties("dirtyDispatch", "isDispatching");
	LibraryModules.DispatchUtils = BDFDB.ModuleUtils.findByProperties("ComponentDispatch");
	LibraryModules.DirectMessageUtils = BDFDB.ModuleUtils.findByProperties("addRecipient", "openPrivateChannel");
	LibraryModules.EmojiUtils = BDFDB.ModuleUtils.findByProperties("translateInlineEmojiToSurrogates", "translateSurrogatesToInlineEmoji");
	LibraryModules.EmojiStateUtils = BDFDB.ModuleUtils.findByProperties("getURL", "isEmojiDisabled");
	LibraryModules.FriendUtils = BDFDB.ModuleUtils.findByProperties("getFriendIDs", "getRelationships");
	LibraryModules.FolderStore = BDFDB.ModuleUtils.findByProperties("getGuildFolderById", "getFlattenedGuilds");
	LibraryModules.FolderUtils = BDFDB.ModuleUtils.findByProperties("isFolderExpanded", "getExpandedFolders");
	LibraryModules.GuildBoostUtils = BDFDB.ModuleUtils.findByProperties("getTierName", "getUserLevel");
	LibraryModules.GuildChannelStore = BDFDB.ModuleUtils.findByProperties("getChannels", "getDefaultChannel");
	LibraryModules.GuildEmojiStore = BDFDB.ModuleUtils.findByProperties("getGuildEmoji", "getDisambiguatedEmojiContext");
	LibraryModules.GuildSettingsUtils = BDFDB.ModuleUtils.findByProperties("updateChannelOverrideSettings", "updateNotificationSettings");
	LibraryModules.GuildStore = BDFDB.ModuleUtils.findByProperties("getGuild", "getGuilds");
	LibraryModules.GuildUnavailableStore = BDFDB.ModuleUtils.findByProperties("isUnavailable", "totalUnavailableGuilds");
	LibraryModules.GuildUtils = BDFDB.ModuleUtils.findByProperties("transitionToGuildSync");
	LibraryModules.HistoryUtils = BDFDB.ModuleUtils.findByProperties("transitionTo", "replaceWith", "getHistory");;
	LibraryModules.IconUtils = BDFDB.ModuleUtils.findByProperties("getGuildIconURL", "getGuildBannerURL");
	LibraryModules.InviteUtils = BDFDB.ModuleUtils.findByProperties("acceptInvite", "createInvite");
	LibraryModules.KeyCodeUtils = Object.assign({}, BDFDB.ModuleUtils.findByProperties("toCombo", "keyToCode"));
	LibraryModules.KeyCodeUtils.getString = function (keyarray) {
		return LibraryModules.KeyCodeUtils.toString([keyarray].flat(10).filter(n => n).map(keycode => [BDFDB.DiscordConstants.KeyboardDeviceTypes.KEYBOARD_KEY, keycode, BDFDB.DiscordConstants.KeyboardEnvs.BROWSER]), true);
	};
	LibraryModules.KeyEvents = BDFDB.ModuleUtils.findByProperties("aliases", "code", "codes");
	LibraryModules.LanguageStore = BDFDB.ModuleUtils.findByProperties("getLanguages", "Messages");
	LibraryModules.LastChannelStore = BDFDB.ModuleUtils.findByProperties("getLastSelectedChannelId");
	LibraryModules.LastGuildStore = BDFDB.ModuleUtils.findByProperties("getLastSelectedGuildId");
	LibraryModules.LoginUtils = BDFDB.ModuleUtils.findByProperties("login", "logout");
	LibraryModules.MemberStore = BDFDB.ModuleUtils.findByProperties("getMember", "getMembers");
	LibraryModules.MentionUtils = BDFDB.ModuleUtils.findByProperties("isRawMessageMentioned", "isMentioned");
	LibraryModules.MessagePinUtils = BDFDB.ModuleUtils.findByProperties("pinMessage", "unpinMessage");
	LibraryModules.MessageStore = BDFDB.ModuleUtils.findByProperties("getMessage", "getMessages");
	LibraryModules.MessageUtils = BDFDB.ModuleUtils.findByProperties("receiveMessage", "editMessage");
	LibraryModules.ModalUtils = BDFDB.ModuleUtils.findByProperties("openModal", "hasModalOpen");
	LibraryModules.MutedUtils = BDFDB.ModuleUtils.findByProperties("isGuildOrCategoryOrChannelMuted");
	LibraryModules.NoteStore = BDFDB.ModuleUtils.findByProperties("getNote");
	LibraryModules.NotificationSettingsStore = BDFDB.ModuleUtils.findByProperties("getDesktopType", "getTTSType");
	LibraryModules.NotificationSettingsUtils = BDFDB.ModuleUtils.findByProperties("setDesktopType", "setTTSType");
	LibraryModules.NotificationUtils = BDFDB.ModuleUtils.findByProperties("makeTextChatNotification", "shouldNotify");
	LibraryModules.PlatformUtils = BDFDB.ModuleUtils.findByProperties("isWindows", "isLinux");
	LibraryModules.PermissionUtils = BDFDB.ModuleUtils.findByProperties("getChannelPermissions", "canUser");
	LibraryModules.PermissionRoleUtils = BDFDB.ModuleUtils.findByProperties("getHighestRole", "can");
	LibraryModules.QuoteUtils = BDFDB.ModuleUtils.findByProperties("canQuote", "createQuotedText");
	LibraryModules.ReactionUtils = BDFDB.ModuleUtils.findByProperties("addReaction", "removeReaction");
	LibraryModules.RecentMentionUtils = BDFDB.ModuleUtils.findByProperties("deleteRecentMention", "fetchRecentMentions");
	LibraryModules.SearchPageUtils = BDFDB.ModuleUtils.findByProperties("searchNextPage", "searchPreviousPage");
	LibraryModules.SelectChannelUtils = BDFDB.ModuleUtils.findByProperties("selectChannel", "selectPrivateChannel");
	LibraryModules.SettingsUtils = BDFDB.ModuleUtils.findByProperties("updateRemoteSettings", "updateLocalSettings");
	LibraryModules.SoundUtils = BDFDB.ModuleUtils.findByProperties("playSound", "createSound");
	LibraryModules.SpellCheckUtils = BDFDB.ModuleUtils.findByProperties("learnWord", "toggleSpellcheck");
	LibraryModules.SlateUtils = BDFDB.ModuleUtils.findByProperties("serialize", "deserialize");
	LibraryModules.SlateSelectionUtils = BDFDB.ModuleUtils.findByProperties("serialize", "serializeSelection");
	LibraryModules.StateStoreUtils = BDFDB.ModuleUtils.findByProperties("useStateFromStores", "useStateFromStoresArray");
	LibraryModules.StatusMetaUtils = BDFDB.ModuleUtils.findByProperties("getApplicationActivity", "getStatus");
	LibraryModules.StoreChangeUtils = BDFDB.ModuleUtils.findByProperties("get", "set", "clear", "remove");
	LibraryModules.StreamUtils = BDFDB.ModuleUtils.findByProperties("getStreamForUser", "getActiveStream");
	LibraryModules.StringUtils = BDFDB.ModuleUtils.findByProperties("cssValueToNumber", "upperCaseFirstChar");
	LibraryModules.UnreadGuildUtils = BDFDB.ModuleUtils.findByProperties("hasUnread", "getUnreadGuilds");
	LibraryModules.UnreadChannelUtils = BDFDB.ModuleUtils.findByProperties("getUnreadCount", "getOldestUnreadMessageId");
	LibraryModules.UploadUtils = BDFDB.ModuleUtils.findByProperties("upload", "instantBatchUpload");
	LibraryModules.UserNameUtils = BDFDB.ModuleUtils.findByProperties("getName", "getNickname");
	LibraryModules.UserStore = BDFDB.ModuleUtils.findByProperties("getUser", "getUsers");
	LibraryModules.Utilities = BDFDB.ModuleUtils.findByProperties("flatMap", "cloneDeep");
	LibraryModules.VoiceUtils = BDFDB.ModuleUtils.findByProperties("getAllVoiceStates", "getVoiceStatesForChannel");
	LibraryModules.ZoomUtils = BDFDB.ModuleUtils.findByProperties("setZoom", "setFontSize");
	BDFDB.LibraryModules = Object.assign({}, LibraryModules);

	LibraryModules.React = BDFDB.ModuleUtils.findByProperties("createElement", "cloneElement");
	LibraryModules.ReactDOM = BDFDB.ModuleUtils.findByProperties("render", "findDOMNode");
	
	BDFDB.ReactUtils = Object.assign({}, LibraryModules.React, LibraryModules.ReactDOM);
	BDFDB.ReactUtils.childrenToArray = function (parent) {
		if (parent && parent.props && parent.props.children && !BDFDB.ArrayUtils.is(parent.props.children)) {
			var child = parent.props.children;
			parent.props.children = [];
			parent.props.children.push(child);
		}
		return parent.props.children;
	}
	BDFDB.ReactUtils.createElement = function (component, props) {
		if (component && component.defaultProps) for (let key in component.defaultProps) if (props[key] == null) props[key] = component.defaultProps[key];
		try {return LibraryModules.React.createElement(component || "div", props || {}) || null;}
		catch (err) {BDFDB.LogUtils.error("Could not create react element! " + err);}
		return null;
	};
	BDFDB.ReactUtils.elementToReact = function (node, ref) {
		if (BDFDB.ReactUtils.isValidElement(node)) return node;
		else if (!Node.prototype.isPrototypeOf(node)) return null;
		else if (node.nodeType == Node.TEXT_NODE) return node.nodeValue;
		let attributes = {}, importantStyles = [];
		if (typeof ref == "function") attributes.ref = ref;
		for (let attr of node.attributes) attributes[attr.name] = attr.value;
		if (node.attributes.style) attributes.style = BDFDB.ObjectUtils.filter(node.style, n => node.style[n] && isNaN(parseInt(n)), true);
		attributes.children = [];
		if (node.style && node.style.cssText) for (let propStr of node.style.cssText.split(";")) if (propStr.endsWith("!important")) {
			let key = propStr.split(":")[0];
			let camelprop = key.replace(/-([a-z]?)/g, (m, g) => g.toUpperCase());
			if (attributes.style[camelprop] != null) importantStyles.push(key);
		}
		for (let child of node.childNodes) attributes.children.push(BDFDB.ReactUtils.elementToReact(child));
		attributes.className = BDFDB.DOMUtils.formatClassName(attributes.className, attributes.class);
		delete attributes.class;
		let reactEle = BDFDB.ReactUtils.createElement(node.tagName, attributes);
		BDFDB.ReactUtils.forceStyle(reactEle, importantStyles);
		return reactEle;
	};
	BDFDB.ReactUtils.forceStyle = function (reactEle, styles) {
		if (!BDFDB.ReactUtils.isValidElement(reactEle) || !BDFDB.ObjectUtils.is(reactEle.props.style) || !BDFDB.ArrayUtils.is(styles) || !styles.length) return;
		let ref = reactEle.ref;
		reactEle.ref = instance => {
			if (typeof ref == "function") ref(instance);
			let node = BDFDB.ReactUtils.findDOMNode(instance);
			if (Node.prototype.isPrototypeOf(node)) for (let key of styles) {
				let propValue = reactEle.props.style[key.replace(/-([a-z]?)/g, (m, g) => g.toUpperCase())];
				if (propValue != null) node.style.setProperty(key, propValue, "important");
			}
		};
	};
	BDFDB.ReactUtils.findChild = function (nodeOrInstance, config) {
		if (!nodeOrInstance || !BDFDB.ObjectUtils.is(config) || !config.name && !config.key && !config.props && !config.filter) return null;
		let instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
		if (!BDFDB.ObjectUtils.is(instance) && !BDFDB.ArrayUtils.is(instance)) return null;
		config.name = config.name && [config.name].flat().filter(n => n);
		config.key = config.key && [config.key].flat().filter(n => n);
		config.props = config.props && [config.props].flat().filter(n => n);
		config.filter = typeof config.filter == "function" && config.filter;
		let depth = -1;
		let start = performance.now();
		let maxDepth = config.unlimited ? 999999999 : (config.depth === undefined ? 30 : config.depth);
		let maxTime = config.unlimited ? 999999999 : (config.time === undefined ? 150 : config.time);
		return getChild(instance);
		function getChild (children) {
			let result = null;
			if (!children || depth >= maxDepth && performance.now() - start >= maxTime) return result;
			if (!BDFDB.ArrayUtils.is(children)) {
				if (check(children)) result = children;
				else if (children.props && children.props.children) {
					depth++;
					result = getChild(children.props.children);
					depth--;
				}
			}
			else {
				for (let child of children) if (child) {
					if (BDFDB.ArrayUtils.is(child)) result = getChild(child);
					else if (check(child)) result = child;
					else if (child.props && child.props.children) {
						depth++;
						result = getChild(child.props.children);
						depth--;
					}
				}
			}
			return result;
		}
		function check (instance) {
			if (!instance) return false;
			let props = instance.stateNode ? instance.stateNode.props : instance.props;
			return instance.type && config.name && config.name.some(name => InternalBDFDB.isInstanceCorrect(instance, name)) || config.key && config.key.some(key => instance.key == key) || props && config.props && config.props[config.someProps ? "some" : "every"](prop => BDFDB.ArrayUtils.is(prop) ? (BDFDB.ArrayUtils.is(prop[1]) ? prop[1].some(checkvalue => propCheck(props, prop[0], checkvalue)) : propCheck(props, prop[0], prop[1])) : props[prop] !== undefined) || config.filter && config.filter(instance);
		}
		function propCheck (props, key, value) {
			return key != null && props[key] != null && value != null && (key == "className" ? (" " + props[key] + " ").indexOf(" " + value + " ") > -1 : BDFDB.equals(props[key], value));
		}
	};
	BDFDB.ReactUtils.findChildren = function (nodeOrInstance, config) {
		if (!nodeOrInstance || !BDFDB.ObjectUtils.is(config) || !config.name && !config.key && !config.props && !config.filter) return [null, -1];
		let instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
		if (!BDFDB.ObjectUtils.is(instance) && !BDFDB.ArrayUtils.is(instance)) return [null, -1];
		config.name = config.name && [config.name].flat().filter(n => n);
		config.key = config.key && [config.key].flat().filter(n => n);
		config.props = config.props && [config.props].flat().filter(n => n);
		config.filter = typeof config.filter == "function" && config.filter;
		let parent = firstArray = instance;
		while (!BDFDB.ArrayUtils.is(firstArray) && firstArray.props && firstArray.props.children) firstArray = firstArray.props.children;
		if (!BDFDB.ArrayUtils.is(firstArray)) {
			if (parent && parent.props) {
				parent.props.children = [parent.props.children];
				firstArray = parent.props.children;
			}
			else firstArray = [];
		}
		return getChildren(instance);
		function getChildren (children) {
			let result = [firstArray, -1];
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
			return instance.type && config.name && config.name.some(name => InternalBDFDB.isInstanceCorrect(instance, name)) || config.key && config.key.some(key => instance.key == key) || props && config.props && config.props[config.someProps ? "some" : "every"](prop => BDFDB.ArrayUtils.is(prop) ? (BDFDB.ArrayUtils.is(prop[1]) ? prop[1].some(checkvalue => propCheck(props, prop[0], checkvalue)) : propCheck(props, prop[0], prop[1])) : props[prop] !== undefined) || config.filter && config.filter(instance);
		}
		function propCheck (props, key, value) {
			return key != null && props[key] != null && value != null && (key == "className" ? (" " + props[key] + " ").indexOf(" " + value + " ") > -1 : BDFDB.equals(props[key], value));
		}
	};
	BDFDB.ReactUtils.setChild = function (parent, stringOrChild) {
		if (!BDFDB.ReactUtils.isValidElement(parent) || (!BDFDB.ReactUtils.isValidElement(stringOrChild) && typeof stringOrChild != "string" && !BDFDB.ArrayUtils.is(stringOrChild))) return;
		let set = false;
		checkParent(parent);
		function checkParent(child) {
			if (set) return;
			if (!BDFDB.ArrayUtils.is(child)) checkChild(child);
			else for (let subChild of child) checkChild(subChild);
		}
		function checkChild(child) {
			if (!BDFDB.ReactUtils.isValidElement(child)) return;
			if (BDFDB.ReactUtils.isValidElement(child.props.children)) checkParent(child.props.children);
			else if (BDFDB.ArrayUtils.is(child.props.children)) {
				if (child.props.children.every(c => !c || typeof c == "string")) {
					set = true;
					child.props.children = [stringOrChild].flat(10);
				}
				else checkParent(child.props.children);
			}
			else {
				set = true;
				child.props.children = stringOrChild;
			}
		}
	};
	BDFDB.ReactUtils.findConstructor = function (nodeOrInstance, types, config = {}) {
		if (!BDFDB.ObjectUtils.is(config)) return null;
		if (!nodeOrInstance || !types) return config.all ? (config.group ? {} : []) : null;
		let instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
		if (!BDFDB.ObjectUtils.is(instance)) return config.all ? (config.group ? {} : []) : null;
		types = types && [types].flat(10).filter(n => typeof n == "string");
		if (!types.length) return config.all ? (config.group ? {} : []) : null;;
		let depth = -1;
		let start = performance.now();
		let maxDepth = config.unlimited ? 999999999 : (config.depth === undefined ? 30 : config.depth);
		let maxTime = config.unlimited ? 999999999 : (config.time === undefined ? 150 : config.time);
		let whitelist = config.up ? {return:true, sibling:true, default:true, _reactInternalFiber:true} : {child:true, sibling:true, default:true, _reactInternalFiber:true};
		let foundConstructors = config.group ? {} : [];
		let singleConstructor = getConstructor(instance);
		if (config.all) {
			for (let i in foundConstructors) {
				if (config.group) for (let j in foundConstructors[i]) delete foundConstructors[i][j].BDFDBreactSearch;
				else delete foundConstructors[i].BDFDBreactSearch;
			}
			return foundConstructors;
		}
		else return singleConstructor;

		function getConstructor (instance) {
			depth++;
			let result = undefined;
			if (instance && !Node.prototype.isPrototypeOf(instance) && !BDFDB.ReactUtils.getInstance(instance) && depth < maxDepth && performance.now() - start < maxTime) {
				if (instance.type && types.some(name => InternalBDFDB.isInstanceCorrect(instance, name.split(" _ _ ")[0]))) {
					if (config.all === undefined || !config.all) result = instance.type;
					else if (config.all) {
						if (!instance.type.BDFDBreactSearch) {
							instance.type.BDFDBreactSearch = true;
							if (config.group) {
								if (instance.type && (instance.type.render && instance.type.render.displayName || instance.type.displayName || instance.type.name)) {
									let group = config.name.find(name => (instance.type.render && instance.type.render.displayName || instance.type.displayName || instance.type.name || instance.type) == name.split(" _ _ ")[0]) || "Default";
									if (!BDFDB.ArrayUtils.is(foundConstructors[group])) foundConstructors[group] = [];
									foundConstructors[group].push(instance.stateNode);
								}
							}
							else foundConstructors.push(instance.type);
						}
					}
				}
				if (result === undefined) {
					let keys = Object.getOwnPropertyNames(instance);
					for (let i = 0; result === undefined && i < keys.length; i++) {
						let key = keys[i];
						if (key && whitelist[key] && (typeof instance[key] === "object" || typeof instance[key] === "function")) result = getConstructor(instance[key]);
					}
				}
			}
			depth--;
			return result;
		}
	};
	BDFDB.ReactUtils.findDOMNode = function (instance) {
		if (Node.prototype.isPrototypeOf(instance)) return instance;
		if (!instance || !instance.updater || typeof instance.updater.isMounted !== "function" || !instance.updater.isMounted(instance)) return null;
		let node = LibraryModules.ReactDOM.findDOMNode(instance) || BDFDB.ReactUtils.getValue(instance, "child.stateNode");
		return Node.prototype.isPrototypeOf(node) ? node : null;
	};
	BDFDB.ReactUtils.findOwner = function (nodeOrInstance, config) {
		if (!BDFDB.ObjectUtils.is(config)) return null;
		if (!nodeOrInstance || !config.name && !config.type && !config.key && !config.props) return config.all ? (config.group ? {} : []) : null;
		let instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
		if (!BDFDB.ObjectUtils.is(instance)) return config.all ? (config.group ? {} : []) : null;
		config.name = config.name && [config.name].flat().filter(n => n);
		config.type = config.type && [config.type].flat().filter(n => n);
		config.key = config.key && [config.key].flat().filter(n => n);
		config.props = config.props && [config.props].flat().filter(n => n);
		let depth = -1;
		let start = performance.now();
		let maxDepth = config.unlimited ? 999999999 : (config.depth === undefined ? 30 : config.depth);
		let maxTime = config.unlimited ? 999999999 : (config.time === undefined ? 150 : config.time);
		let whitelist = config.up ? {return:true, sibling:true, _reactInternalFiber:true} : {child:true, sibling:true, _reactInternalFiber:true};
		let foundInstances = config.group ? {} : [];
		let singleInstance = getOwner(instance);
		if (config.all) {
			for (let i in foundInstances) {
				if (config.group) for (let j in foundInstances[i]) delete foundInstances[i][j].BDFDBreactSearch;
				else delete foundInstances[i].BDFDBreactSearch;
			}
			return foundInstances;
		}
		else return singleInstance;

		function getOwner (instance) {
			depth++;
			let result = undefined;
			if (instance && !Node.prototype.isPrototypeOf(instance) && !BDFDB.ReactUtils.getInstance(instance) && depth < maxDepth && performance.now() - start < maxTime) {
				let props = instance.stateNode ? instance.stateNode.props : instance.props;
				if (instance.stateNode && !Node.prototype.isPrototypeOf(instance.stateNode) && (instance.type && config.name && config.name.some(name => InternalBDFDB.isInstanceCorrect(instance, name.split(" _ _ ")[0])) || instance.type && config.type && config.type.some(type => BDFDB.ArrayUtils.is(type) ? instance.type === type[1] : instance.type === type) || instance.key && config.key && config.key.some(key => instance.key == key) || props && config.props && config.props.every(prop => BDFDB.ArrayUtils.is(prop) ? (BDFDB.ArrayUtils.is(prop[1]) ? prop[1].some(checkvalue => BDFDB.equals(props[prop[0]], checkvalue)) : BDFDB.equals(props[prop[0]], prop[1])) : props[prop] !== undefined))) {
					if (config.all === undefined || !config.all) result = instance.stateNode;
					else if (config.all) {
						if (!instance.stateNode.BDFDBreactSearch) {
							instance.stateNode.BDFDBreactSearch = true;
							if (config.group) {
								if (config.name && instance.type && (instance.type.render && instance.type.render.displayName || instance.type.displayName || instance.type.name || instance.type)) {
									let group = config.name.find(name => (instance.type.render && instance.type.render.displayName || instance.type.displayName || instance.type.name || instance.type) == name.split(" _ _ ")[0]) || "Default";
									if (!BDFDB.ArrayUtils.is(foundInstances[group])) foundInstances[group] = [];
									foundInstances[group].push(instance.stateNode);
								}
								if (config.type && instance.type) {
									let group = [config.type.find(t => BDFDB.ArrayUtils.is(t) && instance.type === t[1])].flat(10)[0] || "Default";
									if (!BDFDB.ArrayUtils.is(foundInstances[group])) foundInstances[group] = [];
									foundInstances[group].push(instance.stateNode);
								}
							}
							else foundInstances.push(instance.stateNode);
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
		let instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
		if (!BDFDB.ObjectUtils.is(instance)) return null;
		config.name = config.name && [config.name].flat().filter(n => n);
		config.key = config.key && [config.key].flat().filter(n => n);
		let depth = -1;
		let start = performance.now();
		let maxDepth = config.unlimited ? 999999999 : (config.depth === undefined ? 30 : config.depth);
		let maxTime = config.unlimited ? 999999999 : (config.time === undefined ? 150 : config.time);
		let whitelist = config.up ? {return:true, sibling:true, _reactInternalFiber:true} : {child:true, sibling:true, _reactInternalFiber:true};
		return findProps(instance);

		function findProps (instance) {
			depth++;
			let result = undefined;
			if (instance && !Node.prototype.isPrototypeOf(instance) && !BDFDB.ReactUtils.getInstance(instance) && depth < maxDepth && performance.now() - start < maxTime) {
				if (instance.memoizedProps && (instance.type && config.name && config.name.some(name => InternalBDFDB.isInstanceCorrect(instance, name.split(" _ _ ")[0])) || config.key && config.key.some(key => instance.key == key))) result = instance.memoizedProps;
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
	BDFDB.ReactUtils.findValue = function (nodeOrInstance, searchKey, config = {}) {
		if (!BDFDB.ObjectUtils.is(config)) return null;
		if (!nodeOrInstance || typeof searchKey != "string") return config.all ? [] : null;
		let instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
		if (!BDFDB.ObjectUtils.is(instance)) return config.all ? [] : null;
		instance = instance._reactInternalFiber || instance;
		let depth = -1;
		let start = performance.now();
		let maxDepth = config.unlimited ? 999999999 : (config.depth === undefined ? 30 : config.depth);
		let maxTime = config.unlimited ? 999999999 : (config.time === undefined ? 150 : config.time);
		let whitelist = {
			props: true,
			state: true,
			stateNode: true,
			updater: true,
			prototype: true,
			type: true,
			children: config.up ? false : true,
			memoizedProps: true,
			memoizedState: true,
			child: config.up ? false : true,
			return: config.up ? true : false,
			sibling: config.up ? false : true
		};
		let blacklist = {
			contextSection: true
		};
		if (BDFDB.ObjectUtils.is(config.whitelist)) Object.assign(whitelist, config.whiteList);
		if (BDFDB.ObjectUtils.is(config.blacklist)) Object.assign(blacklist, config.blacklist);
		let foundKeys = [];
		let singleKey = getKey(instance);
		if (config.all) return foundKeys;
		else return singleKey;
		function getKey(instance) {
			depth++;
			let result = undefined;
			if (instance && !Node.prototype.isPrototypeOf(instance) && !BDFDB.ReactUtils.getInstance(instance) && depth < maxDepth && performance.now() - start < maxTime) {
				let keys = Object.getOwnPropertyNames(instance);
				for (let i = 0; result === undefined && i < keys.length; i++) {
					let key = keys[i];
					if (key && !blacklist[key]) {
						let value = instance[key];
						if (searchKey === key && (config.value === undefined || BDFDB.equals(config.value, value))) {
							if (config.all === undefined || !config.all) result = value;
							else if (config.all) {
								if (config.noCopies === undefined || !config.noCopies) foundKeys.push(value);
								else if (config.noCopies) {
									let copy = false;
									for (let foundKey of foundKeys) if (BDFDB.equals(value, foundKey)) {
										copy = true;
										break;
									}
									if (!copy) foundKeys.push(value);
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
		for (let ins of instances.flat(10).filter(n => n)) if (ins.updater && typeof ins.updater.isMounted == "function" && ins.updater.isMounted(ins)) ins.forceUpdate();
	};
	BDFDB.ReactUtils.getInstance = function (node) {
		if (!BDFDB.ObjectUtils.is(node)) return null;
		return node[Object.keys(node).find(key => key.startsWith("__reactInternalInstance"))];
	};
	BDFDB.ReactUtils.getValue = function (nodeOrInstance, valuepath) {
		if (!nodeOrInstance || !valuepath) return null;
		let instance = Node.prototype.isPrototypeOf(nodeOrInstance) ? BDFDB.ReactUtils.getInstance(nodeOrInstance) : nodeOrInstance;
		if (!BDFDB.ObjectUtils.is(instance)) return null;
		let found = instance, values = valuepath.split(".").filter(n => n);
		for (value of values) {
			if (!found) return null;
			found = found[value];
		}
		return found;
	};
	BDFDB.ReactUtils.render = function (component, node) {
		if (!BDFDB.ReactUtils.isValidElement(component) || !Node.prototype.isPrototypeOf(node)) return;
		try {
			LibraryModules.ReactDOM.render(component, node);
			let observer = new MutationObserver(changes => changes.forEach(change => {
				let nodes = Array.from(change.removedNodes);
				if (nodes.indexOf(node) > -1 || nodes.some(n => n.contains(node))) {
					observer.disconnect();
					BDFDB.ReactUtils.unmountComponentAtNode(node);
				}
			}));
			observer.observe(document.body, {subtree:true, childList:true});
		}
		catch (err) {BDFDB.LogUtils.error("Could not render react element! " + err);}
	};
	InternalBDFDB.setDefaultProps = function (component, defaultProps) {
		if (BDFDB.ObjectUtils.is(component)) component.defaultProps = Object.assign({}, component.defaultProps, defaultProps);
	};
	InternalBDFDB.loadPatchedComp = function (path) {
		let comp = BDFDB.ReactUtils.getValue(window.BDFDB, `LibraryComponents.${path}`);
		if (comp && comp.prototype && comp.prototype.BDFDBpatch) return comp;
	};

	BDFDB.sameProto = function (a, b) {
		if (a != null && typeof a == "object") return a.constructor && a.constructor.prototype && typeof a.constructor.prototype.isPrototypeOf == "function" && a.constructor.prototype.isPrototypeOf(b);
		else return typeof a == typeof b;
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
				else if (typeof a === "function") result = a.toString() == b.toString();
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
				else if (typeof a === "object") {
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

	let MessageRerenderTimeout;
	BDFDB.MessageUtils = {};
	BDFDB.MessageUtils.rerenderAll = function () {
		BDFDB.TimeUtils.clear(MessageRerenderTimeout);
		MessageRerenderTimeout = BDFDB.TimeUtils.timeout(_ => {
			let MessagesIns = BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.app), {name:"Messages", unlimited:true});
			let MessagesPrototype = BDFDB.ReactUtils.getValue(MessagesIns, "_reactInternalFiber.type.prototype");
			if (MessagesIns && MessagesPrototype) {
				BDFDB.ModuleUtils.patch(BDFDB, MessagesPrototype, "render", {after: e => {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnValue, {props: ["message", "channel"]});
					if (index > -1) for (let ele of children) if (ele.props.message) ele.props.message = new BDFDB.DiscordObjects.Message(ele.props.message);
				}}, {once: true});
				BDFDB.ReactUtils.forceUpdate(MessagesIns);
			}
		}, 1000);
	};
		
	BDFDB.UserUtils = {};
	BDFDB.UserUtils.is = function (user) {
		return user && user instanceof BDFDB.DiscordObjects.User;
	};
	var myDataUser = LibraryModules.CurrentUserStore && LibraryModules.CurrentUserStore.getCurrentUser();
	BDFDB.UserUtils.me = new Proxy(myDataUser || {}, {
		get: function (list, item) {
			return (myDataUser = LibraryModules.CurrentUserStore.getCurrentUser()) && myDataUser[item];
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
		if (!user) return window.location.origin + "/assets/322c936a8c8be1b803cd94861bdfa868.png";
		else return ((user.avatar ? "" : window.location.origin) + LibraryModules.IconUtils.getUserAvatarURL(user)).split("?")[0];
	};
	BDFDB.UserUtils.can = function (permission, id = BDFDB.UserUtils.me.id, channelid = LibraryModules.LastChannelStore.getChannelId()) {
		if (!BDFDB.DiscordConstants.Permissions[permission]) BDFDB.LogUtils.warn(permission + " not found in Permissions");
		else {
			var channel = LibraryModules.ChannelStore.getChannel(channelid);
			if (channel) return LibraryModules.PermissionUtils.canUser(id, BDFDB.DiscordConstants.Permissions[permission], channel);
		}
		return false;
	};

	let GuildsRerenderTimeout;
	BDFDB.GuildUtils = {};
	BDFDB.GuildUtils.is = function (guild) {
		return guild && guild instanceof BDFDB.DiscordObjects.Guild;
	};
	BDFDB.GuildUtils.getIcon = function (id) {
		let guild = LibraryModules.GuildStore.getGuild(typeof id == "number" ? id.toFixed() : id);
		if (!guild || !guild.icon) return null;
		return LibraryModules.IconUtils.getGuildIconURL(guild).split("?")[0];
	};
	BDFDB.GuildUtils.getBanner = function (id) {
		let guild = LibraryModules.GuildStore.getGuild(typeof id == "number" ? id.toFixed() : id);
		if (!guild || !guild.banner) return null;
		return LibraryModules.IconUtils.getGuildBannerURL(guild).split("?")[0];
	};
	BDFDB.GuildUtils.getFolder = function (id) {
		return BDFDB.LibraryModules.FolderStore.guildFolders.filter(n => n.folderId).find(n => n.guildIds.includes(id));
	};
	BDFDB.GuildUtils.getId = function (div) {
		if (!Node.prototype.isPrototypeOf(div) || !BDFDB.ReactUtils.getInstance(div)) return;
		let guilddiv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildouter, div);
		if (!guilddiv) return;
		let iconWrap = guilddiv.querySelector(BDFDB.dotCN.guildiconwrapper);
		let id = iconWrap && iconWrap.href ? iconWrap.href.split("/").slice(-2)[0] : null;
		return id && !isNaN(parseInt(id)) ? id.toString() : null;
	};
	BDFDB.GuildUtils.getData = function (eleOrInfoOrId) {
		if (!eleOrInfoOrId) return null;
		let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.GuildUtils.getId(eleOrInfoOrId) : (typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId);
		id = typeof id == "number" ? id.toFixed() : id;
		for (let info of BDFDB.GuildUtils.getAll()) if (info && info.id == id) return info;
		return null;
	};
	BDFDB.GuildUtils.getAll = function () {
		let found = [], objs = [];
		for (let ins of BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.guilds), {name:["Guild","GuildIcon"], all:true, unlimited:true})) {
			if (ins.props && ins.props.guild) objs.push(Object.assign(new ins.props.guild.constructor(ins.props.guild), {div:ins.handleContextMenu && BDFDB.ReactUtils.findDOMNode(ins), instance:ins}));
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
				if (guild) found.push(Object.assign(new guild.constructor(guild), {div:null, instance:null}))
			}
		}
		return found;
	};
	BDFDB.GuildUtils.getUnread = function (servers) {
		let found = [];
		for (let eleOrInfoOrId of servers === undefined || !BDFDB.ArrayUtils.is(servers) ? BDFDB.GuildUtils.getAll() : servers) {
			if (!eleOrInfoOrId) return null;
			let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.GuildUtils.getId(eleOrInfoOrId) : (typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId);
			id = typeof id == "number" ? id.toFixed() : id;
			if (id && (LibraryModules.UnreadGuildUtils.hasUnread(id) || LibraryModules.UnreadGuildUtils.getMentionCount(id) > 0)) found.push(eleOrInfoOrId);
		}
		return found;
	};
	BDFDB.GuildUtils.getPinged = function (servers) {
		let found = [];
		for (let eleOrInfoOrId of servers === undefined || !BDFDB.ArrayUtils.is(servers) ? BDFDB.GuildUtils.getAll() : servers) {
			if (!eleOrInfoOrId) return null;
			let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.GuildUtils.getId(eleOrInfoOrId) : (typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId);
			id = typeof id == "number" ? id.toFixed() : id;
			if (id && LibraryModules.UnreadGuildUtils.getMentionCount(id) > 0) found.push(eleOrInfoOrId);
		}
		return found;
	};
	BDFDB.GuildUtils.getMuted = function (servers) {
		let found = [];
		for (let eleOrInfoOrId of servers === undefined || !BDFDB.ArrayUtils.is(servers) ? BDFDB.GuildUtils.getAll() : servers) {
			if (!eleOrInfoOrId) return null;
			let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.GuildUtils.getId(eleOrInfoOrId) : (typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId);
			id = typeof id == "number" ? id.toFixed() : id;
			if (id && LibraryModules.MutedUtils.isGuildOrCategoryOrChannelMuted(id)) found.push(eleOrInfoOrId);
		}
		return found;
	};
	BDFDB.GuildUtils.getSelected = function () {
		let info = LibraryModules.GuildStore.getGuild(LibraryModules.LastGuildStore.getGuildId());
		if (info) return BDFDB.GuildUtils.getData(info.id) || Object.assign(new info.constructor(info), {div:null, instance:null});
		else return null;
	};
	BDFDB.GuildUtils.openMenu = function (eleOrInfoOrId, e = BDFDB.InternalData.mousePosition) {
		if (!eleOrInfoOrId) return;
		let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.GuildUtils.getId(eleOrInfoOrId) : (typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId);
		let guild = LibraryModules.GuildStore.getGuild(id);
		if (guild) LibraryModules.ContextMenuUtils.openContextMenu(e, function (e) {
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ContextMenus._Exports.GuildContextMenu && InternalComponents.LibraryComponents.ContextMenus._Exports.GuildContextMenu.default, Object.assign({}, e, {
				type: BDFDB.DiscordConstants.ContextMenuTypes.GUILD_ICON_BAR,
				guild: guild,
				badge: LibraryModules.UnreadGuildUtils.getMentionCount(guild.id),
				link: BDFDB.DiscordConstants.Routes.CHANNEL(guild.id, LibraryModules.LastChannelStore.getChannelId(guild.id)),
				selected: guild.id == LibraryModules.LastGuildStore.getGuildId()
			}));
		});
	};
	BDFDB.GuildUtils.markAsRead = function (guilds) {
		if (!guilds) return;
		let unreadChannels = [];
		for (let guild of BDFDB.ArrayUtils.is(guilds) ? guilds : (typeof guilds == "string" || typeof guilds == "number" ? Array.of(guilds) : Array.from(guilds))) {
			let id = Node.prototype.isPrototypeOf(guild) ? BDFDB.GuildUtils.getId(guild) : (guild && typeof guild == "object" ? guild.id : guild);
			let channels = id && LibraryModules.GuildChannelStore.getChannels(id);
			if (channels) for (let type in channels) if (BDFDB.ArrayUtils.is(channels[type])) for (let channelObj of channels[type]) unreadChannels.push(channelObj.channel.id);
		}
		if (unreadChannels.length) BDFDB.ChannelUtils.markAsRead(unreadChannels);
	};
	BDFDB.GuildUtils.rerenderAll = function () {
		BDFDB.TimeUtils.clear(GuildsRerenderTimeout);
		GuildsRerenderTimeout = BDFDB.TimeUtils.timeout(_ => {
			let GuildsIns = BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.app), {name:"Guilds", unlimited:true});
			let GuildsPrototype = BDFDB.ReactUtils.getValue(GuildsIns, "_reactInternalFiber.type.prototype");
			if (GuildsIns && GuildsPrototype) {
				BDFDB.ModuleUtils.patch(BDFDB, GuildsPrototype, "render", {after: e => {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnValue, {name: "ConnectedUnreadDMs"});
					if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement("div", {}));
					BDFDB.ReactUtils.forceUpdate(GuildsIns);
				}}, {once: true});
				BDFDB.ReactUtils.forceUpdate(GuildsIns);
			}
		}, 1000);
	};

	BDFDB.FolderUtils = {};
	BDFDB.FolderUtils.getId = function (div) {
		if (!Node.prototype.isPrototypeOf(div) || !BDFDB.ReactUtils.getInstance(div)) return;
		div = BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildfolderwrapper, div);
		if (!div) return;
		return BDFDB.ReactUtils.findValue(div, "folderId", {up:true});
	};
	BDFDB.FolderUtils.getDefaultName = function (folderId) {
		let folder = BDFDB.LibraryModules.FolderStore.getGuildFolderById(folderId);
		if (!folder) return "";
		let rest = 2 * BDFDB.DiscordConstants.MAX_GUILD_FOLDER_NAME_LENGTH;
		let names = [], allNames = folder.guildIds.map(guildId => (BDFDB.LibraryModules.GuildStore.getGuild(guildId) || {}).name).filter(n => n);
		for (let name of allNames) if (name.length < rest || names.length === 0) {
			names.push(name);
			rest -= name.length;
		}
		return names.join(", ") + (names.length < allNames.length ? ", ..." : "");
	};
	BDFDB.FolderUtils.getDiv = function (eleOrInfoOrId) {
		if (!eleOrInfoOrId) return null;
		let info = BDFDB.FolderUtils.getData(eleOrInfoOrId);
		return info ? info.div : null;
	};
	BDFDB.FolderUtils.getData = function (eleOrInfoOrId) {
		if (!eleOrInfoOrId) return null;
		let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.FolderUtils.getId(eleOrInfoOrId) : (typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId);
		id = typeof id == "number" ? id.toFixed() : id;
		for (let info of BDFDB.FolderUtils.getAll()) if (info && info.folderId == id) return info;
		return null;
	};
	BDFDB.FolderUtils.getAll = function () {
		let found = [];
		for (let ins of BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.guildswrapper), {name:"GuildFolder", all:true, unlimited:true})) {
			if (ins.props && ins.props.folderId) found.push(Object.assign({}, ins.props, {div:BDFDB.ReactUtils.findDOMNode(ins), instance:ins}));
		}
		return found;
	};

	BDFDB.ChannelUtils = {};
	BDFDB.ChannelUtils.is = function (channel) {
		return channel && channel instanceof BDFDB.DiscordObjects.Channel;
	};
	BDFDB.ChannelUtils.isTextChannel = function (channelOrId) {
		let channel = typeof channelOrId == "string" ? LibraryModules.ChannelStore.getChannel(channelOrId) : channelOrId;
		return BDFDB.ObjectUtils.is(channel) && (channel.type == BDFDB.DiscordConstants.ChannelTypes.GUILD_TEXT || channel.type == BDFDB.DiscordConstants.ChannelTypes.GUILD_STORE || channel.type == BDFDB.DiscordConstants.ChannelTypes.GUILD_ANNOUNCEMENT);
	};
	BDFDB.ChannelUtils.getId = function (div) {
		if (!Node.prototype.isPrototypeOf(div) || !BDFDB.ReactUtils.getInstance(div)) return;
		div = BDFDB.DOMUtils.getParent(BDFDB.dotCNC.categorycontainerdefault + BDFDB.dotCNC.channelcontainerdefault + BDFDB.dotCN.dmchannel, div);
		if (!div) return;
		let info = BDFDB.ReactUtils.findValue(div, "channel");
		return info ? info.id.toString() : null;
	};
	BDFDB.ChannelUtils.getDiv = function (eleOrInfoOrId) {
		if (!eleOrInfoOrId) return null;
		let info = BDFDB.ChannelUtils.getData(eleOrInfoOrId);
		return info ? info.div : null;
	};
	BDFDB.ChannelUtils.getData = function (eleOrInfoOrId) {
		if (!eleOrInfoOrId) return null;
		let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.ChannelUtils.getId(eleOrInfoOrId) : (typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId);
		id = typeof id == "number" ? id.toFixed() : id;
		for (let info of BDFDB.ChannelUtils.getAll()) if (info && info.id == id) return info;
		return null;
	};
	BDFDB.ChannelUtils.getName = function (id, addPrefix) {
		let channel = BDFDB.LibraryModules.ChannelStore.getChannel(id);
		if (!channel) return "";
		switch (channel.type) {
			case BDFDB.DiscordConstants.ChannelTypes.DM:
				let user = channel.recipients.map(BDFDB.LibraryModules.UserStore.getUser).filter(n => n)[0];
				return (addPrefix && "@" || "") + (user && user.toString() || "");
			case BDFDB.DiscordConstants.ChannelTypes.GROUP_DM:
				if (channel.name) return channel.name;
				let users = channel.recipients.map(BDFDB.LibraryModules.UserStore.getUser).filter(n => n);
				return users.length > 0 ? users.map(user => user.toString).join(", ") : BDFDB.LanguageUtils.LanguageStrings.UNNAMED;
			case BDFDB.DiscordConstants.ChannelTypes.GUILD_ANNOUNCEMENT:
			case BDFDB.DiscordConstants.ChannelTypes.GUILD_TEXT:
				return (addPrefix && "#" || "") + channel.name;
			default:
				return channel.name
		}
	};
	BDFDB.ChannelUtils.getAll = function () {
		let found = [];
		for (let ins of BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.channels), {name: ["ChannelCategoryItem", "ChannelItem", "PrivateChannel"], all:true, unlimited:true})) if (ins.props && !ins.props.ispin && ins.props.channel && ins._reactInternalFiber.return) {
			var div = BDFDB.ReactUtils.findDOMNode(ins);
			div = div && BDFDB.DOMUtils.containsClass(div.parentElement, BDFDB.disCN.categorycontainerdefault, BDFDB.disCN.channelcontainerdefault, false) ? div.parentElement : div;
			found.push(Object.assign(new ins.props.channel.constructor(ins.props.channel), {div, instance:ins}));
		}
		return found;
	};
	BDFDB.ChannelUtils.getSelected = function () {
		let info = LibraryModules.ChannelStore.getChannel(LibraryModules.LastChannelStore.getChannelId());
		if (info) return BDFDB.ChannelUtils.getData(info.id) || Object.assign(new info.constructor(info), {div:null, instance:null});
		else return null;
	};
	BDFDB.ChannelUtils.openMenu = function (eleOrInfoOrId, e = BDFDB.InternalData.mousePosition) {
		if (!eleOrInfoOrId) return;
		let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.ChannelUtils.getId(eleOrInfoOrId) : (typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId);
		let channel = LibraryModules.ChannelStore.getChannel(id);
		if (channel) {
			let type = null;
			for (let t in BDFDB.DiscordConstants.ChannelTypes) if (BDFDB.DiscordConstants.ChannelTypes[t] == channel.type) {
				type = BDFDB.DiscordConstants.ContextMenuTypes[(t == "GUILD_CATEGORY" ? "CHANNEL_" : "CHANNEL_LIST_") + t.replace("GUILD_", "")];
				break;
			}
			if (type) LibraryModules.ContextMenuUtils.openContextMenu(e, function (e) {
				return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ContextMenus._Exports.ChannelContextMenu && InternalComponents.LibraryComponents.ContextMenus._Exports.ChannelContextMenu.default, Object.assign({}, e, {
					type: type,
					channel: channel,
					guild: LibraryModules.GuildStore.getGuild(channel.guild_id),
					selected: channel.id == LibraryModules.LastChannelStore.getChannelId()
				}));
			});
		}
	};
	BDFDB.ChannelUtils.markAsRead = function (channels) {
		if (!channels) return;
		let unreadChannels = [];
		for (let channel of channels = BDFDB.ArrayUtils.is(channels) ? channels : (typeof channels == "string" || typeof channels == "number" ? Array.of(channels) : Array.from(channels))) {
			let id = Node.prototype.isPrototypeOf(channel) ? BDFDB.ChannelUtils.getId(channel) : (channel && typeof channel == "object" ? channel.id : channel);
			if (id && BDFDB.ChannelUtils.isTextChannel(id)) unreadChannels.push({
				channelId: id,
				messageId: LibraryModules.UnreadChannelUtils.lastMessageId(id)
			});
		}
		if (unreadChannels.length) LibraryModules.AckUtils.bulkAck(unreadChannels);
	};
	
	BDFDB.DMUtils = {};
	BDFDB.DMUtils.isDMChannel = function (channelOrId) {
		let channel = typeof channelOrId == "string" ? LibraryModules.ChannelStore.getChannel(channelOrId) : channelOrId;
		return BDFDB.ObjectUtils.is(channel) && (channel.type == BDFDB.DiscordConstants.ChannelTypes.DM || channel.type == BDFDB.DiscordConstants.ChannelTypes.GROUP_DM);
	};
	BDFDB.DMUtils.getIcon = function (id) {
		let channel = LibraryModules.ChannelStore.getChannel(id = typeof id == "number" ? id.toFixed() : id);
		if (!channel) return null;
		if (!channel.icon) return channel.type == 1 ? BDFDB.UserUtils.getAvatar(channel.recipients[0]) : (channel.type == 3 ? window.location.origin + LibraryModules.IconUtils.getChannelIconURL(channel).split("?")[0] : null);
		return LibraryModules.IconUtils.getChannelIconURL(channel).split("?")[0];
	};
	BDFDB.DMUtils.getId = function (div) {
		if (!Node.prototype.isPrototypeOf(div) || !BDFDB.ReactUtils.getInstance(div)) return;
		let dmdiv = BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildouter, div);
		if (!dmdiv) return;
		let iconWrap = dmdiv.querySelector(BDFDB.dotCN.guildiconwrapper);
		let id = iconWrap && iconWrap.href ? iconWrap.href.split("/").slice(-1)[0] : null;
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
		let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.BDFDB.DMUtils.getId(eleOrInfoOrId) : (typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId);
		id = typeof id == "number" ? id.toFixed() : id;
		for (let info of BDFDB.DMUtils.getAll()) if (info && info.id == id) return info;
		return null;
	};
	BDFDB.DMUtils.getAll = function () {
		let found = [];
		for (let ins of BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.guilds), {name:"DirectMessage", all:true, unlimited:true})) {
			if (ins.props && ins.props.channel) found.push(Object.assign(new ins.props.channel.constructor(ins.props.channel), {div:BDFDB.ReactUtils.findDOMNode(ins), instance:ins}));
		}
		return found;
	};
	BDFDB.DMUtils.openMenu = function (eleOrInfoOrId, e = BDFDB.InternalData.mousePosition) {
		if (!eleOrInfoOrId) return;
		let id = Node.prototype.isPrototypeOf(eleOrInfoOrId) ? BDFDB.ChannelUtils.getId(eleOrInfoOrId) : (typeof eleOrInfoOrId == "object" ? eleOrInfoOrId.id : eleOrInfoOrId);
		let channel = LibraryModules.ChannelStore.getChannel(id);
		if (channel) {
			if (channel.isMultiUserDM()) LibraryModules.ContextMenuUtils.openContextMenu(e, function (e) {
				return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ContextMenus.GroupDMContextMenu, Object.assign({}, e, {
					channelId: channel.id,
					selected: channel.id == LibraryModules.LastChannelStore.getChannelId()
				}));
			}, {noBlurEvent: true});
			else LibraryModules.ContextMenuUtils.openContextMenu(e, function (e) {
				return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ContextMenus._Exports.UserContextMenu && InternalComponents.LibraryComponents.ContextMenus._Exports.UserContextMenu.default, Object.assign({}, e, {
					type: BDFDB.DiscordConstants.ContextMenuTypes.USER_PRIVATE_CHANNELS,
					user: LibraryModules.UserStore.getUser(channel.recipients[0]),
					channelId: channel.id,
					selected: channel.id == LibraryModules.LastChannelStore.getChannelId()
				}));
			});
		}
	};
	BDFDB.DMUtils.markAsRead = function (dms) {
		if (!dms) return;
		let unreadChannels = [];
		for (let dm of dms = BDFDB.ArrayUtils.is(dms) ? dms : (typeof dms == "string" || typeof dms == "number" ? Array.of(dms) : Array.from(dms))) {
			let id = Node.prototype.isPrototypeOf(dm) ? BDFDB.BDFDB.DMUtils.getId(dm) : (dm && typeof dm == "object" ? dm.id : dm);
			if (id) unreadChannels.push(id);
		}
		for (let i in unreadChannels) BDFDB.TimeUtils.timeout(_ => {LibraryModules.AckUtils.ack(unreadChannels[i]);}, i * 1000);
	};

	BDFDB.DataUtils = {};
	BDFDB.DataUtils.cached = window.BDFDB && window.BDFDB.DataUtils && window.BDFDB.DataUtils.cached || {};
	BDFDB.DataUtils.save = function (data, plugin, key, id) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		let pluginName = typeof plugin === "string" ? plugin : plugin.name;
		let configPath = LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), pluginName + ".config.json");
		
		let config = BDFDB.DataUtils.cached[pluginName] !== undefined ? BDFDB.DataUtils.cached[pluginName] : (InternalBDFDB.readConfig(configPath) || {});
		
		if (key === undefined) config = BDFDB.ObjectUtils.is(data) ? BDFDB.ObjectUtils.sort(data) : data;
		else {
			if (id === undefined) config[key] = BDFDB.ObjectUtils.is(data) ? BDFDB.ObjectUtils.sort(data) : data;
			else {
				if (!BDFDB.ObjectUtils.is(config[key])) config[key] = {};
				config[key][id] = BDFDB.ObjectUtils.is(data) ? BDFDB.ObjectUtils.sort(data) : data;
			}
		}
		
		let configIsObject = BDFDB.ObjectUtils.is(config);
		if (key !== undefined && configIsObject && BDFDB.ObjectUtils.is(config[key]) && BDFDB.ObjectUtils.isEmpty(config[key])) delete config[key];
		if (BDFDB.ObjectUtils.isEmpty(config)) {
			delete BDFDB.DataUtils.cached[pluginName];
			if (LibraryRequires.fs.existsSync(configPath)) LibraryRequires.fs.unlinkSync(configPath);
		}
		else {
			if (configIsObject) config = BDFDB.ObjectUtils.sort(config);
			BDFDB.DataUtils.cached[pluginName] = configIsObject ? BDFDB.ObjectUtils.deepAssign({}, config) : config;
			LibraryRequires.fs.writeFileSync(configPath, JSON.stringify(config, null, "	"));
		}
	};

	BDFDB.DataUtils.load = function (plugin, key, id) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		let pluginName = typeof plugin === "string" ? plugin : plugin.name;
		let configPath = LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), pluginName + ".config.json");
		
		let config = BDFDB.DataUtils.cached[pluginName] !== undefined ? BDFDB.DataUtils.cached[pluginName] : (InternalBDFDB.readConfig(configPath) || {});
		let configIsObject = BDFDB.ObjectUtils.is(config);
		BDFDB.DataUtils.cached[pluginName] = configIsObject ? BDFDB.ObjectUtils.deepAssign({}, config) : config;
		
		if (key === undefined) return config;
		else {
			let keydata = configIsObject ? (BDFDB.ObjectUtils.is(config[key]) || config[key] == undefined ? BDFDB.ObjectUtils.deepAssign({}, config[key]) : config[key]) : null;
			if (id === undefined) return keydata;
			else return !BDFDB.ObjectUtils.is(keydata) || keydata[id] === undefined ? null : keydata[id];
		}
	};
	BDFDB.DataUtils.remove = function (plugin, key, id) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		let pluginName = typeof plugin === "string" ? plugin : plugin.name;
		let configPath = LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), pluginName + ".config.json");
		
		let config = BDFDB.DataUtils.cached[pluginName] !== undefined ? BDFDB.DataUtils.cached[pluginName] : (InternalBDFDB.readConfig(configPath) || {});
		let configIsObject = BDFDB.ObjectUtils.is(config);
		
		if (key === undefined || !configIsObject) config = {};
		else {
			if (id === undefined) delete config[key];
			else if (BDFDB.ObjectUtils.is(config[key])) delete config[key][id];
		}
		
		if (BDFDB.ObjectUtils.is(config[key]) && BDFDB.ObjectUtils.isEmpty(config[key])) delete config[key];
		if (BDFDB.ObjectUtils.isEmpty(config)) {
			delete BDFDB.DataUtils.cached[pluginName];
			if (LibraryRequires.fs.existsSync(configPath)) LibraryRequires.fs.unlinkSync(configPath);
		}
		else {
			if (configIsObject) config = BDFDB.ObjectUtils.sort(config);
			BDFDB.DataUtils.cached[pluginName] = configIsObject ? BDFDB.ObjectUtils.deepAssign({}, config) : config;
			LibraryRequires.fs.writeFileSync(configPath, JSON.stringify(config, null, "	"));
		}
	};
	BDFDB.DataUtils.get = function (plugin, key, id) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		plugin = typeof plugin == "string" ? BDFDB.BDUtils.getPlugin(plugin) : plugin;
		if (!BDFDB.ObjectUtils.is(plugin)) return id === undefined ? {} : null;
		let defaults = plugin.defaults;
		if (!BDFDB.ObjectUtils.is(defaults) || !defaults[key]) return id === undefined ? {} : null;
		let oldC = BDFDB.DataUtils.load(plugin, key), newC = {}, update = false;
		for (let k in defaults[key]) {
			let isObj = BDFDB.ObjectUtils.is(defaults[key][k].value);
			if (oldC[k] == null || isObj && (!BDFDB.ObjectUtils.is(oldC[k]) || Object.keys(defaults[key][k].value).some(n => defaults[key][k].value[n] != null && !BDFDB.sameProto(defaults[key][k].value[n], oldC[k][n])))) {
				newC[k] = isObj ? BDFDB.ObjectUtils.deepAssign({}, defaults[key][k].value) : defaults[key][k].value;
				update = true;
			}
			else newC[k] = oldC[k];
		}
		if (update) BDFDB.DataUtils.save(newC, plugin, key);
		
		if (id === undefined) return newC;
		else return newC[id] === undefined ? null : newC[id];
	};
	InternalBDFDB.readConfig = function (path) {
		try {return JSON.parse(LibraryRequires.fs.readFileSync(path));}
		catch (err) {return {};}
	};
	
	BDFDB.ColorUtils = {};
	BDFDB.ColorUtils.convert = function (color, conv, type) {
		if (BDFDB.ObjectUtils.is(color)) {
			var newcolor = {};
			for (let pos in color) newcolor[pos] = BDFDB.ColorUtils.convert(color[pos], conv, type);
			return newcolor;
		}
		else {
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
						return BDFDB.ColorUtils.convert(`hsl(${hslcomp.slice(0, 3).join(",")})`, "RGBCOMP").concat(processA(hslcomp.pop()));
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
		}
		return null;
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
			for (let pos in color) newcolor[pos] = BDFDB.ColorUtils.setAlpha(color[pos], a, conv);
			return newcolor;
		}
		else {
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
		}
		return null;
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
				for (let pos in color) newcolor[pos] = BDFDB.ColorUtils.change(color[pos], value, conv);
				return newcolor;
			}
			else {
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
			}
		}
		return null;
	};
	BDFDB.ColorUtils.invert = function (color, conv) {
		if (BDFDB.ObjectUtils.is(color)) {
			var newcolor = {};
			for (let pos in color) newcolor[pos] = BDFDB.ColorUtils.invert(color[pos], conv);
			return newcolor;
		}
		else {
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
		for (let pos of Object.keys(colorobj).sort()) {
			let color = BDFDB.ColorUtils.convert(colorobj[pos], "RGBA");
			gradientstring += color ? `, ${color} ${pos*100}%` : ''
		}
		return gradientstring += ")";
	};
	BDFDB.ColorUtils.getSwatchColor = function (container, number) {
		if (!Node.prototype.isPrototypeOf(container)) return;
		let swatches = container.querySelector(`${BDFDB.dotCN.colorpickerswatches}[number="${number}"], ${BDFDB.dotCN.colorpickerswatch}[number="${number}"]`);
		if (!swatches) return null;
		return BDFDB.ColorUtils.convert(BDFDB.ReactUtils.findValue(BDFDB.ReactUtils.getInstance(swatches), "selectedColor", {up:true, blacklist:{"props":true}}));
	};
	BDFDB.ColorUtils.openPicker = function (container, target, color, options = {gradient: true, alpha: true, callback: _ => {}}) {
		let itemLayerContainer = document.querySelector(BDFDB.dotCN.appmount +  " > " + BDFDB.dotCN.itemlayercontainer);
		if (!itemLayerContainer || !container || !target) return;
		
		if (typeof options.callback != "function") options.callback = _ => {};
		
		let hexFormat = options.alpha ? "HEXA" : "HEX";
		let hexRegex = options.alpha ? /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i : /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
		let isGradient = color && BDFDB.ObjectUtils.is(color);
		let selectedColor = BDFDB.ColorUtils.convert(isGradient ? color[Object.keys(color)[0]] : color, hexFormat) || (options.alpha ? "#000000FF" : "#000000");
		let [h, s, l] = BDFDB.ColorUtils.convert(selectedColor, "HSLCOMP");
		let a = BDFDB.ColorUtils.getAlpha(isGradient ? color[Object.keys(color)[0]] : color);
		a = a == null ? 1 : a;
			 
		let targetrects = BDFDB.DOMUtils.getRects(target);
		let colorPicker = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN.itemlayer}"><div role="dialog" class="${BDFDB.disCNS.colorpickerwrapper + BDFDB.disCNS.popoutnoarrow + BDFDB.disCNS.popoutnoshadow + BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottom + BDFDB.disCNS.popoutarrowalignmenttop + BDFDB.disCN.themeundefined}" style="z-index: 2001; visibility: visible; left: ${targetrects.left + targetrects.width/2}px; top: ${targetrects.top + targetrects.height}px; transform: translateX(-50%) translateY(0%) translateZ(0px);"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.colorpicker}" style="flex: 1 1 auto;"><div class="${BDFDB.disCN.colorpickerinner}"><div class="${BDFDB.disCN.colorpickersaturation}"><div class="saturation-color" style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px; background: ${BDFDB.ColorUtils.convert([h, "100%", "100%"], "RGB")} !important;"><style>.saturation-white {background: -webkit-linear-gradient(to right, #fff, rgba(255,255,255,0));background: linear-gradient(to right, #fff, rgba(255,255,255,0));}.saturation-black {background: -webkit-linear-gradient(to top, #000, rgba(0,0,0,0));background: linear-gradient(to top, #000, rgba(0,0,0,0));}</style><div class="saturation-white" style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"><div class="saturation-black" style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"></div><div class="saturation-cursor" style="position: absolute; top: 55.2941%; left: 44.7368%; cursor: default;"><div style="width: 4px; height: 4px; box-shadow: rgb(255, 255, 255) 0px 0px 0px 1.5px, rgba(0, 0, 0, 0.3) 0px 0px 1px 1px inset, rgba(0, 0, 0, 0.4) 0px 0px 1px 2px; border-radius: 50%; transform: translate(-2px, -2px);"></div></div></div></div></div><div class="${BDFDB.disCN.colorpickerhue}"><div style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"><div class="hue-horizontal" style="padding: 0px 2px; position: relative; height: 100%;"><style>.hue-horizontal {background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);background: -webkit-linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);}.hue-vertical {background: linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);background: -webkit-linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);}</style><div class="hue-cursor" style="position: absolute; left: 0%;"><div style="margin-top: -4px !important; width: 4px; border-radius: 1px; height: 8px; box-shadow: rgba(0, 0, 0, 0.6) 0px 0px 2px; background: rgb(255, 255, 255); transform: translateX(-2px);"></div></div></div></div></div><div class="alpha-bar" style="position: relative; height: 8px; margin: 16px 0 8px;"><div style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"><div class="alpha-checker" style="padding: 0px 2px; position: relative; height: 100%; background-color: transparent;"></div></div><div style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"><div class="alpha-horizontal" style="padding: 0px 2px; position: relative; height: 100%;"><div class="alpha-cursor" style="position: absolute; left: 0%;"><div style="margin-top: -4px; width: 8px; border-radius: 3px; height: 16px; box-shadow: rgba(0, 0, 0, 0.6) 0px 0px 2px; background: rgb(255, 255, 255); transform: translateX(-2px);"></div></div></div></div></div><div class="gradient-bar" style="position: relative; height: 8px; margin: 27px 2px 2px 2px;${!isGradient ? " display: none;" : ""}"><div style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"><div class="alpha-checker" style="padding: 0px 2px; position: relative; height: 100%; background-color: transparent;"></div></div><div style="position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;"><div class="gradient-horizontal" style="padding: 0px 2px; position: relative; height: 100%; background-color: ${selectedColor};"><div class="gradient-cursor edge selected" style="position: absolute; left: 0%;"><div style="background-color: ${selectedColor} !important;"></div></div><div class="gradient-cursor edge" style="position: absolute; left: 100%;"><div style="background-color: ${isGradient ? BDFDB.ColorUtils.convert(color[1], "RGBA") : selectedColor} !important;"></div></div></div></div></div></div><div class="${BDFDB.disCNS.horizontal + BDFDB.disCNS.colorpickerhexinput + BDFDB.disCN.margintop8}"><input class="${BDFDB.disCN.inputdefault}" maxlength="${options.alpha ? 9 : 7}" name="" type="text" placeholder="${selectedColor}" value="${selectedColor}"></input><div class="gradient-button${isGradient ? " selected" : ""}" style="transform: rotate(-90deg); margin: 2px 0 0 5px; cursor: pointer; border-radius: 5px; height: 36px;"><svg width="36" height="36" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M469.333333 384h85.333334v85.333333h-85.333334z m-85.333333 85.333333h85.333333v85.333334H384z m170.666667 0h85.333333v85.333334h-85.333333z m85.333333-85.333333h85.333333v85.333333h-85.333333zM298.666667 384h85.333333v85.333333H298.666667z m512-256H213.333333c-46.933333 0-85.333333 38.4-85.333333 85.333333v597.333334c0 46.933333 38.4 85.333333 85.333333 85.333333h597.333334c46.933333 0 85.333333-38.4 85.333333-85.333333V213.333333c0-46.933333-38.4-85.333333-85.333333-85.333333zM384 768H298.666667v-85.333333h85.333333v85.333333z m170.666667 0h-85.333334v-85.333333h85.333334v85.333333z m170.666666 0h-85.333333v-85.333333h85.333333v85.333333z m85.333334-298.666667h-85.333334v85.333334h85.333334v85.333333h-85.333334v-85.333333h-85.333333v85.333333h-85.333333v-85.333333h-85.333334v85.333333H384v-85.333333H298.666667v85.333333H213.333333v-85.333333h85.333334v-85.333334H213.333333V213.333333h597.333334v256z"></path></svg></div></div></div><div class="move-corner" style="width: 10px; height: 10px; cursor: move; position: absolute; top: 0; left: 0;"></div><div class="move-corner" style="width: 10px; height: 10px; cursor: move; position: absolute; top: 0; right: 0;"></div><div class="move-corner" style="width: 10px; height: 10px; cursor: move; position: absolute; bottom: 0; right: 0;"></div><div class="move-corner" style="width: 10px; height: 10px; cursor: move; position: absolute; bottom: 0; left: 0;"></div></div></div>`);
		
		itemLayerContainer.appendChild(colorPicker);

		var removePopout = e => {
			if (!colorPicker.contains(e.target)) {
				document.removeEventListener("mousedown", removePopout);
				colorPicker.remove();
			}
		};
		document.addEventListener("mousedown", removePopout);

		let hexInput = colorPicker.querySelector(BDFDB.dotCNS.colorpickerhexinput + BDFDB.dotCN.input);
		let satPane = colorPicker.querySelector(".saturation-color");
		let satCursor = colorPicker.querySelector(".saturation-cursor");
		let huePane = colorPicker.querySelector(".hue-horizontal");
		let hueCursor = colorPicker.querySelector(".hue-cursor");
		let alphaPane = colorPicker.querySelector(".alpha-horizontal");
		let alphaCursor = colorPicker.querySelector(".alpha-cursor");
		let gradientButton = colorPicker.querySelector(".gradient-button");
		let gradientBar = colorPicker.querySelector(".gradient-bar");
		let gradientPane = colorPicker.querySelector(".gradient-horizontal");

		let sMinX, sMaxX, sMinY, sMaxY, hMinX, hMaxX, aMinX, aMaxX, gMinX, gMaxX;

		updateRects();
		
		if (isGradient) for (let pos in color) if (pos > 0 && pos < 1) gradientPane.appendChild(BDFDB.DOMUtils.create(`<div class="gradient-cursor" style="position: absolute; left: ${pos * 100}%;"><div style="background-color: ${BDFDB.ColorUtils.convert(color[pos], "RGBA")} !important;"></div></div>`));

		updateColors(false);
		
		if (!options.gradient) BDFDB.DOMUtils.remove(colorPicker.querySelectorAll(".gradient-button, .gradient-bar"));
		if (!options.alpha) BDFDB.DOMUtils.remove(colorPicker.querySelectorAll(".alpha-bar"));

		BDFDB.ListenerUtils.addToChildren(colorPicker, "mousedown", ".move-corner", e => {
			let rects = BDFDB.DOMUtils.getRects(colorPicker);
			let transform = getComputedStyle(colorPicker, null).getPropertyValue("transform").replace(/[^0-9,-]/g,"").split(",");
			let left = rects.left - (transform.length > 4 ? parseFloat(transform[4]) : 0);
			let top = rects.top - (transform.length > 4 ? parseFloat(transform[5]) : 0);
			let oldX = e.pageX;
			let oldY = e.pageY;
			let mouseup = _ => {
				BDFDB.DOMUtils.removeLocalStyle("disableTextSelection");
				document.removeEventListener("mouseup", mouseup);
				document.removeEventListener("mousemove", mousemove);
			};
			let mousemove = e2 => {
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
		satPane.addEventListener("mousedown", e => {
			s = BDFDB.NumberUtils.mapRange([sMinX, sMaxX], [0, 100], e.clientX) + "%";
			l = BDFDB.NumberUtils.mapRange([sMinY, sMaxY], [100, 0], e.clientY) + "%";
			updateColors(true);
			let mouseup = _ => {
				document.removeEventListener("mouseup", mouseup);
				document.removeEventListener("mousemove", mousemove);
			};
			let mousemove = e2 => {
				s = BDFDB.NumberUtils.mapRange([sMinX, sMaxX], [0, 100], e2.clientX) + "%";
				l = BDFDB.NumberUtils.mapRange([sMinY, sMaxY], [100, 0], e2.clientY) + "%";
				updateColors(true);
			};
			document.addEventListener("mouseup", mouseup);
			document.addEventListener("mousemove", mousemove);
		});
		huePane.addEventListener("mousedown", e => {
			h = BDFDB.NumberUtils.mapRange([hMinX, hMaxX], [0, 360], e.clientX);
			updateColors(true);
			let mouseup = _ => {
				document.removeEventListener("mouseup", mouseup);
				document.removeEventListener("mousemove", mousemove);
			};
			let mousemove = e2 => {
				h = BDFDB.NumberUtils.mapRange([hMinX, hMaxX], [0, 360], e2.clientX);
				updateColors(true);
			};
			document.addEventListener("mouseup", mouseup);
			document.addEventListener("mousemove", mousemove);
		});
		alphaPane.addEventListener("mousedown", e => {
			a = BDFDB.NumberUtils.mapRange([aMinX, aMaxX], [0, 1], e.clientX);
			updateColors(true);
			let bubble = BDFDB.DOMUtils.create(`<span class="${BDFDB.disCN.sliderbubble}" style="opacity: 1 !important; left: -24px !important;"></span>`);
			let mouseup = _ => {
				bubble.remove();
				document.removeEventListener("mouseup", mouseup);
				document.removeEventListener("mousemove", mousemove);
			};
			let mousemove = e2 => {
				if (!bubble.parentElement) alphaCursor.appendChild(bubble);
				a = Math.floor(BDFDB.NumberUtils.mapRange([aMinX, aMaxX], [0, 100], e2.clientX))/100;
				bubble.innerText = a;
				updateColors(true);
			};
			document.addEventListener("mouseup", mouseup);
			document.addEventListener("mousemove", mousemove);
		});
		gradientPane.addEventListener("mousedown", e => {
			BDFDB.TimeUtils.timeout(_ => {
				if (BDFDB.DOMUtils.containsClass(e.target.parentElement, "gradient-cursor")) {
					if (e.which == 1) {
						if (!BDFDB.DOMUtils.containsClass(e.target.parentElement, "selected")) {
							BDFDB.DOMUtils.removeClass(gradientPane.querySelectorAll(".gradient-cursor.selected"), "selected");
							BDFDB.DOMUtils.addClass(e.target.parentElement, "selected");
							[h, s, l] = BDFDB.ColorUtils.convert(e.target.style.getPropertyValue("background-color"), "HSLCOMP");
							a = BDFDB.ColorUtils.getAlpha(e.target.style.getPropertyValue("background-color"));
							updateColors(true);
						}
						if (!BDFDB.DOMUtils.containsClass(e.target.parentElement, "edge")) {
							let mouseup = _ => {
								document.removeEventListener("mouseup", mouseup);
								document.removeEventListener("mousemove", mousemove);
							};
							let mousemove = e2 => {
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
							let firstcursor = gradientPane.querySelector(".gradient-cursor");
							BDFDB.DOMUtils.addClass(firstcursor, "selected");
							[h, s, l] = BDFDB.ColorUtils.convert(firstcursor.firstElementChild.style.getPropertyValue("background-color"), "HSLCOMP");
							a = BDFDB.ColorUtils.getAlpha(firstElementChild.style.getPropertyValue("background-color"));
						}
						updateColors(true);
					}
				}
				else if (gradientPane == e.target && e.which == 1) {
					BDFDB.DOMUtils.removeClass(gradientPane.querySelectorAll(".gradient-cursor.selected"), "selected");
					let newcursor = BDFDB.DOMUtils.create(`<div class="gradient-cursor selected" style="position: absolute; left: ${BDFDB.NumberUtils.mapRange([gMinX, gMaxX], [1, 99], e.clientX)}%;"><div style="background-color: rgba(0, 0, 0, 1) !important;"></div></div>`);
					gradientPane.appendChild(newcursor);
					[h, s, l] = [0, "0%", "0%"];
					a = 1;
					updateColors(true);
					let mouseup = _ => {
						document.removeEventListener("mouseup", mouseup);
						document.removeEventListener("mousemove", mousemove);
					};
					let mousemove = e2 => {
						newcursor.style.setProperty("left", BDFDB.NumberUtils.mapRange([gMinX, gMaxX], [1, 99], e2.clientX) + "%");
						updateGradient();
					};
					document.addEventListener("mouseup", mouseup);
					document.addEventListener("mousemove", mousemove);
				}
			});
		});
		hexInput.addEventListener("input", e => {
			if (hexRegex.test(hexInput.value)) {
				[h, s, l, a] = BDFDB.ColorUtils.convert(hexInput.value, "HSLCOMP");
				if (a == null) a = 1;
				updateColors(false);
			}
		});
		gradientButton.addEventListener("click", e => {
			isGradient = !isGradient;
			BDFDB.DOMUtils.toggle(gradientBar, isGradient);
			BDFDB.DOMUtils.toggleClass(gradientButton, "selected", isGradient);
			updateColors(true);
		});
		gradientButton.addEventListener("mouseenter", e => {
			BDFDB.TooltipUtils.create(gradientButton, "Color Gradient", {type: "bottom", zIndex: 3001});
		});
		function updateRects () {
			let satPaneRects = BDFDB.DOMUtils.getRects(satPane);
			sMinX = satPaneRects.left;
			sMaxX = sMinX + satPaneRects.width;
			sMinY = satPaneRects.top;
			sMaxY = sMinY + satPaneRects.height;
			let huePaneRects = BDFDB.DOMUtils.getRects(huePane);
			hMinX = huePaneRects.left;
			hMaxX = hMinX + huePaneRects.width;
			let alphaPaneRects = BDFDB.DOMUtils.getRects(alphaPane);
			aMinX = alphaPaneRects.left;
			aMaxX = aMinX + alphaPaneRects.width;
			let gradientPaneRects = BDFDB.DOMUtils.getRects(gradientPane);
			gMinX = gradientPaneRects.left;
			gMaxX = gMinX + gradientPaneRects.width;
		}
		function updateColors (setInput) {
			satPane.style.setProperty("background", BDFDB.ColorUtils.convert([h, "100%", "100%"], "RGB"), "important");
			satCursor.style.setProperty("left", s, "important");
			satCursor.style.setProperty("top", BDFDB.NumberUtils.mapRange([0, 100], [100, 0], parseFloat(l)) + "%", "important");
			hueCursor.style.setProperty("left", BDFDB.NumberUtils.mapRange([0, 360], [0, 100], h) + "%", "important");
			alphaPane.style.setProperty("background", `linear-gradient(to right, ${BDFDB.ColorUtils.setAlpha([h, s, l], 0, "RGBA")}, ${BDFDB.ColorUtils.setAlpha([h, s, l], 1, "RGBA")}`, "important");
			alphaCursor.style.setProperty("left", (a * 100) + "%", "important");
			let hex = BDFDB.ColorUtils.convert([h, s, l, a], hexFormat);
			let rgb = BDFDB.ColorUtils.convert(hex, "RGBA");
			if (isGradient) {
				gradientPane.querySelector(".gradient-cursor.selected").firstElementChild.style.setProperty("background-color", rgb);
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
					container.refInput.handleChange(container.refInput.props.value);
				}
			}
			if (setInput) hexInput.value = hex;
			options.callback(rgb);
		}
		function updateGradient () {
			gradientPane.style.removeProperty("background-color");
			let gradient = {};
			for (let cursor of gradientPane.querySelectorAll(".gradient-cursor")) gradient[parseFloat(cursor.style.getPropertyValue("left"))/100] = cursor.firstElementChild.style.getPropertyValue("background-color");
			gradientPane.style.setProperty("background-image", BDFDB.ColorUtils.createGradient(gradient));
			container.setState({
				selectedColor: gradient,
				customColor: gradient
			});
		}
	};

	BDFDB.DOMUtils = {};
	BDFDB.DOMUtils.getSelection = function () {
		let selection = document.getSelection();
		return selection && selection.anchorNode ? selection.getRangeAt(0).toString() : "";
	};
	BDFDB.DOMUtils.addClass = function (eles, ...classes) {
		if (!eles || !classes) return;
		for (let ele of [eles].flat(10).filter(n => n)) {
			if (Node.prototype.isPrototypeOf(ele)) add(ele);
			else if (NodeList.prototype.isPrototypeOf(ele)) for (let e of ele) add(e);
			else if (typeof ele == "string") for (let e of ele.split(",")) if (e && (e = e.trim())) for (let n of document.querySelectorAll(e)) add(n);
		}
		function add(node) {
			if (node && node.classList) for (let cla of classes) for (let cl of [cla].flat(10).filter(n => n)) if (typeof cl == "string") for (let c of cl.split(" ")) if (c) node.classList.add(c);
		}
	};
	BDFDB.DOMUtils.removeClass = function (eles, ...classes) {
		if (!eles || !classes) return;
		for (let ele of [eles].flat(10).filter(n => n)) {
			if (Node.prototype.isPrototypeOf(ele)) remove(ele);
			else if (NodeList.prototype.isPrototypeOf(ele)) for (let e of ele) remove(e);
			else if (typeof ele == "string") for (let e of ele.split(",")) if (e && (e = e.trim())) for (let n of document.querySelectorAll(e)) remove(n);
		}
		function remove(node) {
			if (node && node.classList) for (let cla of classes) for (let cl of [cla].flat(10).filter(n => n)) if (typeof cl == "string") for (let c of cl.split(" ")) if (c) node.classList.remove(c);
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
		for (let ele of [eles].flat(10).filter(n => n)) {
			if (!ele) {}
			else if (Node.prototype.isPrototypeOf(ele)) toggle(ele);
			else if (NodeList.prototype.isPrototypeOf(ele)) for (let e of ele) toggle(e);
			else if (typeof ele == "string") for (let e of ele.split(",")) if (e && (e = e.trim())) for (let n of document.querySelectorAll(e)) toggle(n);
		}
		function toggle(node) {
			if (node && node.classList) for (let cla of classes) for (let cl of [cla].flat(10).filter(n => n)) if (typeof cl == "string") for (let c of cl.split(" ")) if (c) node.classList.toggle(c, force);
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
		for (let ele of [eles].flat(10).filter(n => n)) {
			if (Node.prototype.isPrototypeOf(ele)) replace(ele);
			else if (NodeList.prototype.isPrototypeOf(ele)) for (let e of ele) replace(e);
			else if (typeof ele == "string") for (let e of ele.split(",")) if (e && (e = e.trim())) for (let n of document.querySelectorAll(e)) replace(n);
		}
		function replace(node) {
			if (node && node.tagName && node.className) node.className = node.className.replace(new RegExp(oldclass, "g"), newclass).trim();
		}
	};
	BDFDB.DOMUtils.formatClassName = function (...classes) {
		return BDFDB.ArrayUtils.removeCopies(classes.flat(10).filter(n => n).join(" ").split(" ")).join(" ").trim();
	};
	BDFDB.DOMUtils.removeClassFromDOM = function (...classes) {
		for (let c of classes.flat(10).filter(n => n)) if (typeof c == "string") for (let a of c.split(",")) if (a && (a = a.replace(/\.|\s/g, ""))) BDFDB.DOMUtils.removeClass(document.querySelectorAll("." + a), a);
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
		for (let ele of eles.flat(10).filter(n => n)) {
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
		for (let ele of eles.flat(10).filter(n => n)) {
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
			let wrapper = document.createElement("span");
			let nodes = Array.from(template.content.childNodes);
			while (nodes.length) wrapper.appendChild(nodes.shift());
			return wrapper;
		}
	};
	BDFDB.DOMUtils.getParent = function (listOrSelector, node) {
		let parent = null;
		if (Node.prototype.isPrototypeOf(node) && listOrSelector) {
			let list = NodeList.prototype.isPrototypeOf(listOrSelector) ? listOrSelector : typeof listOrSelector == "string" ? document.querySelectorAll(listOrSelector) : null;
			if (list) for (let listNode of list) if (listNode.contains(node)) {
				parent = listNode;
				break;
			}
		}
		return parent;
	};
	BDFDB.DOMUtils.setText = function (node, stringOrNode) {
		if (!node || !Node.prototype.isPrototypeOf(node)) return;
		let textnode = node.nodeType == Node.TEXT_NODE ? node : null;
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
		let rects = {};
		if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) {
			let hideNode = node;
			while (hideNode) {
				let hidden = BDFDB.DOMUtils.isHidden(hideNode);
				if (hidden) {
					BDFDB.DOMUtils.toggle(hideNode, true);
					hideNode.BDFDBgetRectsHidden = true;
				}
				hideNode = hideNode.parentElement;
			}
			rects = node.getBoundingClientRect();
			hideNode = node;
			while (hideNode) {
				if (hideNode.BDFDBgetRectsHidden) {
					BDFDB.DOMUtils.toggle(hideNode, false);
					delete hideNode.BDFDBgetRectsHidden;
				}
				hideNode = hideNode.parentElement;
			}
		}
		return rects;
	};
	BDFDB.DOMUtils.getHeight = function (node) {
		if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) {
			let rects = BDFDB.DOMUtils.getRects(node);
			let style = getComputedStyle(node);
			return rects.height + parseInt(style.marginTop) + parseInt(style.marginBottom);
		}
		return 0;
	};
	BDFDB.DOMUtils.getInnerHeight = function (node) {
		if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) {
			let rects = BDFDB.DOMUtils.getRects(node);
			let style = getComputedStyle(node);
			return rects.height - parseInt(style.paddingTop) - parseInt(style.paddingBottom);
		}
		return 0;
	};
	BDFDB.DOMUtils.getWidth = function (node) {
		if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) {
			let rects = BDFDB.DOMUtils.getRects(node);
			let style = getComputedStyle(node);
			return rects.width + parseInt(style.marginLeft) + parseInt(style.marginRight);
		}
		return 0;
	};
	BDFDB.DOMUtils.getInnerWidth = function (node) {
		if (Node.prototype.isPrototypeOf(node) && node.nodeType != Node.TEXT_NODE) {
			let rects = BDFDB.DOMUtils.getRects(node);
			let style = getComputedStyle(node);
			return rects.width - parseInt(style.paddingLeft) - parseInt(style.paddingRight);
		}
		return 0;
	};
	BDFDB.DOMUtils.appendWebScript = function (url, container) {
		if (!container && !document.head.querySelector("bd-head bd-scripts")) document.head.appendChild(BDFDB.DOMUtils.create(`<bd-head><bd-scripts></bd-scripts></bd-head>`));
		container = container || document.head.querySelector("bd-head bd-scripts") || document.head;
		container = Node.prototype.isPrototypeOf(container) ? container : document.head;
		BDFDB.DOMUtils.removeWebScript(url, container);
		let script = document.createElement("script");
		script.src = url;
		container.appendChild(script);
	};
	BDFDB.DOMUtils.removeWebScript = function (url, container) {
		container = container || document.head.querySelector("bd-head bd-scripts") || document.head;
		container = Node.prototype.isPrototypeOf(container) ? container : document.head;
		BDFDB.DOMUtils.remove(container.querySelectorAll(`script[src="${url}"]`));
	};
	BDFDB.DOMUtils.appendWebStyle = function (url, container) {
		if (!container && !document.head.querySelector("bd-head bd-styles")) document.head.appendChild(BDFDB.DOMUtils.create(`<bd-head><bd-styles></bd-styles></bd-head>`));
		container = container || document.head.querySelector("bd-head bd-styles") || document.head;
		container = Node.prototype.isPrototypeOf(container) ? container : document.head;
		BDFDB.DOMUtils.removeWebStyle(url, container);
		container.appendChild(BDFDB.DOMUtils.create(`<link type="text/css" rel="Stylesheet" href="${url}"></link>`));
	};
	BDFDB.DOMUtils.removeWebStyle = function (url, container) {
		container = container || document.head.querySelector("bd-head bd-styles") || document.head;
		container = Node.prototype.isPrototypeOf(container) ? container : document.head;
		BDFDB.DOMUtils.remove(container.querySelectorAll(`link[href="${url}"]`));
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
	
	BDFDB.ModalUtils = {};
	BDFDB.ModalUtils.open = function (plugin, config) {
		if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ObjectUtils.is(config)) return;
		let modal, modalInstance, modalProps, cancels = [], closeModal = _ => {
			if (BDFDB.ObjectUtils.is(modalProps) && typeof modalProps.onClose == "function") modalProps.onClose();
		};
		let headerChildren = [], contentChildren = [], footerChildren = [];
		if (typeof config.text == "string") {
			contentChildren.push(BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TextElement, {
				children: config.text
			}));
		}
		if (config.children) {
			let tabBarItems = [];
			for (let child of [config.children].flat(10).filter(n => n)) if (LibraryModules.React.isValidElement(child)) {
				if (child.type == InternalComponents.LibraryComponents.ModalComponents.ModalTabContent) {
					if (!tabBarItems.length) child.props.open = true;
					else delete child.props.open;
					tabBarItems.push({value:child.props.tab});
				}
				contentChildren.push(child);
			}
			if (tabBarItems.length) headerChildren.push(BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
				className: BDFDB.disCN.tabbarcontainer,
				align: InternalComponents.LibraryComponents.Flex.Align.CENTER,
				children: [
					BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TabBar, {
						className: BDFDB.disCN.tabbar,
						itemClassName: BDFDB.disCN.tabbaritem,
						type: InternalComponents.LibraryComponents.TabBar.Types.TOP,
						items: tabBarItems,
						onItemSelect: (value, instance) => {
							let tabContentInstances = BDFDB.ReactUtils.findOwner(modal, {name:"BDFDB_ModalTabContent", all:true, unlimited:true});
							for (let ins of tabContentInstances) {
								if (ins.props.tab == value) ins.props.open = true;
								else delete ins.props.open;
							}
							BDFDB.ReactUtils.forceUpdate(tabContentInstances);
						}
					}),
					config.tabBarChildren
				].flat(10).filter(n => n)
			}));
		}
		if (BDFDB.ArrayUtils.is(config.buttons)) for (let button of config.buttons) {
			let contents = typeof button.contents == "string" && button.contents;
			if (contents) {
				let color = typeof button.color == "string" && InternalComponents.LibraryComponents.Button.Colors[button.color.toUpperCase()];
				let look = typeof button.look == "string" && InternalComponents.LibraryComponents.Button.Looks[button.look.toUpperCase()];
				let click = typeof button.click == "function" ? button.click : (typeof button.onClick == "function" ? button.onClick : _ => {});
				
				if (button.cancel) cancels.push(click);
				
				footerChildren.push(BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Button, BDFDB.ObjectUtils.exclude(Object.assign({}, button, {
					look: look || (color ? InternalComponents.LibraryComponents.Button.Looks.FILLED : InternalComponents.LibraryComponents.Button.Looks.LINK),
					color: color || InternalComponents.LibraryComponents.Button.Colors.PRIMARY,
					onClick: _ => {
						if (button.close) closeModal();
						if (!(button.close && button.cancel)) click(modal, modalInstance);
					},
					children: contents
				}), "click", "close", "cancel", "contents")));
			}
		}
		contentChildren = contentChildren.concat(config.contentChildren).filter(n => n && (typeof n == "string" || BDFDB.ReactUtils.isValidElement(n)));
		headerChildren = headerChildren.concat(config.headerChildren).filter(n => n && (typeof n == "string" || BDFDB.ReactUtils.isValidElement(n)));
		footerChildren = footerChildren.concat(config.footerChildren).filter(n => n && (typeof n == "string" || BDFDB.ReactUtils.isValidElement(n)));
		if (contentChildren.length) {
			if (typeof config.onClose != "function") config.onClose = _ => {};
			if (typeof config.onOpen != "function") config.onOpen = _ => {};
			
			let name = plugin.name || (typeof plugin.getName == "function" ? plugin.getName() : null);
			name = typeof name == "string" ? name : null;
			let oldTransitionState = 0;
			LibraryModules.ModalUtils.openModal(props => {
				modalProps = props;
				return BDFDB.ReactUtils.createElement(class BDFDB_Modal extends LibraryModules.React.Component {
					render () {
						return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ModalComponents.ModalRoot, {
							className: BDFDB.DOMUtils.formatClassName(name && `${name}-modal`, BDFDB.disCN.modalwrapper, config.className),
							size: typeof config.size == "string" && InternalComponents.LibraryComponents.ModalComponents.ModalSize[config.size.toUpperCase()] || InternalComponents.LibraryComponents.ModalComponents.ModalSize.SMALL,
							transitionState: props.transitionState,
							children: [
								BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ModalComponents.ModalHeader, {
									className: BDFDB.DOMUtils.formatClassName(config.headerClassName, headerChildren.length && BDFDB.disCN.modalheaderhassibling),
									separator: config.headerSeparator || false,
									children: [
										BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex.Child, {
											children: [
												BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormTitle, {
													tag: InternalComponents.LibraryComponents.FormComponents.FormTitle.Tags.H4,
													children: config.header
												}),
												BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TextElement, {
													size: InternalComponents.LibraryComponents.TextElement.Sizes.SIZE_12,
													children: typeof config.subheader == "string" || BDFDB.ReactUtils.isValidElement(config.subheader) ? config.subheader : (name || "")
												})
											]
										}),
										BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ModalComponents.ModalCloseButton, {
											onClick: closeModal
										})
									]
								}),
								headerChildren.length ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
									grow: 0,
									shrink: 0,
									children: headerChildren
								}) : null,
								BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ModalComponents.ModalContent, {
									className: config.contentClassName,
									scroller: config.scroller,
									children: contentChildren
								}),
								footerChildren.length ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ModalComponents.ModalFooter, {
									className: config.footerClassName,
									children: footerChildren
								}) : null
							]
						});
					}
					componentDidMount () {
						modalInstance = this;
						modal = BDFDB.ReactUtils.findDOMNode(this);
						modal = modal && modal.parentElement ? modal.parentElement.querySelector(BDFDB.dotCN.modalwrapper) : null;
						if (modal && props.transitionState == 1 && props.transitionState > oldTransitionState) config.onOpen(modal, this);
						oldTransitionState = props.transitionState;
					}
					componentWillUnmount () {
						if (modal && props.transitionState == 3) {
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
		BDFDB.ModalUtils.open(plugin, {text, header:"Are you sure?", className:BDFDB.disCN.modalconfirmmodal, scroller:false, buttons:[
			{contents: BDFDB.LanguageUtils.LanguageStrings.OKAY, close:true, color:"RED", click:typeof callback == "function" ? callback : _ => {}},
			{contents: BDFDB.LanguageUtils.LanguageStrings.CANCEL, close:true}
		]});
	};
	
	BDFDB.ContextMenuUtils = {};
	BDFDB.ContextMenuUtils.open = function (plugin, e, children) {
		LibraryModules.ContextMenuUtils.openContextMenu(e, function (e) {
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ContextMenus.NativeContextMenu, Object.assign({}, e, {
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
		else BDFDB.LibraryModules.ContextMenuUtils.closeContextMenu();
	};

	BDFDB.TimeUtils = {};
	BDFDB.TimeUtils.interval = function (callback, delay) {
		if (typeof callback != "function" || typeof delay != "number" || delay < 1) return;
		else return setInterval(_ => {BDFDB.TimeUtils.suppress(callback, "Interval")();}, delay);
	};
	BDFDB.TimeUtils.timeout = function (callback, delay) {
		if (typeof callback != "function") return;
		else if (typeof delay != "number" || delay < 1) return setImmediate(_ => {BDFDB.TimeUtils.suppress(callback, "Immediate")();});
		else return setTimeout(_ => {BDFDB.TimeUtils.suppress(callback, "Timeout")();}, delay);
	};
	BDFDB.TimeUtils.clear = function (...timeobjects) {
		for (let t of timeobjects.flat(10).filter(n => n)) {
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
	
	BDFDB.SlateUtils = {};
	BDFDB.SlateUtils.isRichValue = function (richValue) {
		return BDFDB.ObjectUtils.is(richValue) && LibraryModules.SlateUtils.deserialize("").constructor.prototype.isPrototypeOf(richValue);
	};
	BDFDB.SlateUtils.copyRichValue = function (string, richValue) {
		let newRichValue = LibraryModules.SlateUtils.deserialize(string);
		if (BDFDB.SlateUtils.isRichValue(richValue) && richValue._map && richValue._map._root && BDFDB.ArrayUtils.is(richValue._map._root.entries)) {
			for (let i in richValue._map._root.entries) if (richValue._map._root.entries[i][0] == "selection") {
				newRichValue._map._root.entries[i] = richValue._map._root.entries[i];
				break;
			}
		}
		return newRichValue;
	};
	BDFDB.SlateUtils.hasOpenPlainTextCodeBlock = function (editor) {
		let richValue = BDFDB.ReactUtils.getValue(editor, "props.richValue");
		if (!BDFDB.SlateUtils.isRichValue(richValue)) return false;
		let codeMatches = BDFDB.LibraryModules.SlateSelectionUtils.serializeSelection(richValue.document, {
			start: {
				key: richValue.document.getFirstText().key,
				offset: 0
			},
			end: richValue.selection.start
		}, "raw").match(/```/g);
		return codeMatches && codeMatches.length && codeMatches.length % 2 != 0;
	};
	BDFDB.SlateUtils.getCurrentWord = function (editor) {
		let richValue = BDFDB.ReactUtils.getValue(editor, "props.richValue");
		if (!BDFDB.SlateUtils.isRichValue(richValue) || !richValue.selection.isCollapsed || BDFDB.SlateUtils.hasOpenPlainTextCodeBlock(editor) || richValue.document.text.trim().length == 0) return {word: null, isAtStart: false};
		if (editor.props.useSlate) {
			if (richValue.document.text.startsWith("/giphy ") || richValue.document.text.startsWith("/tenor ")) {
				let node = richValue.document.getNode(richValue.selection.start.key);
				if (node) return {
					word: node.text.substring(0, richValue.selection.start.offset),
					isAtStart: true
				}
			}
			let node = richValue.document.getNode(richValue.selection.start.key);
			if (node == null) return {
				word: null,
				isAtStart: false
			};
			let word = "", atStart = false;
			let offset = richValue.selection.start.offset;
			let block = richValue.document.getClosestBlock(node.key);
			while (true) {
				if (--offset < 0) {
					if ((node = block.getPreviousNode(node.key) == null)) {
						atStart = true;
						break;
					}
					if (node.object!== "text") break;
					offset = node.text.length - 1;
				}
				if (node.object !== "text") break;
				let prefix = node.text[offset];
				if (/(\t|\s)/.test(prefix)) break;
				word = prefix + word;
			}
			return {
				word: !word ? null : word,
				isAtStart: atStart && block.type == "line" && richValue.document.nodes.get(0) === block
			};
		}
		else {
			let textarea = BDFDB.ReactUtils.findDOMNode(editor.ref.current);
			if (!Node.prototype.isPrototypeOf(textarea) || textarea.tagName != "TEXTAREA" || !textarea.value.length || /\s/.test(textarea.value.slice(textarea.selectionStart, textarea.selectionEnd))) return {
				word: null,
				isAtStart: true
			};
			else {
				if (textarea.selectionEnd == textarea.value.length) {
					let words = textarea.value.split(/\s/).reverse();
					return {
						word: !words[0] ? null : words[0],
						isAtStart: words.length > 1
					};
				}
				else {
					let chars = textarea.value.split(""), word = "", currentWord = "", isCurrentWord = false, isAtStart = true;
					for (let i in chars) {
						if (i == textarea.selectionStart) isCurrentWord = true;
						if (/\s/.test(chars[i])) {
							word = "";
							isAtStart = currentWord.length > 0 && isAtStart || false;
							isCurrentWord = false;
						}
						else {
							word += chars[i];
							if (isCurrentWord) currentWord = word;
						}
					}
					return {
						word: !currentWord ? null : currentWord,
						isAtStart: isAtStart
					};
				}
			}
		}
	};
	
	BDFDB.NumberUtils = {};
	BDFDB.NumberUtils.formatBytes = function (bytes, sigDigits) {
		bytes = parseInt(bytes);
		if (isNaN(bytes) || bytes < 0) return "0 Bytes";
		if (bytes == 1) return "1 Byte";
		let size = Math.floor(Math.log(bytes) / Math.log(1024));
		return parseFloat((bytes / Math.pow(1024, size)).toFixed(sigDigits < 1 ? 0 : sigDigits > 20 ? 20 : sigDigits || 2)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][size];
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
	BDFDB.DiscordUtils.openLink = function (url, inbuilt, minimized) {
		if (!inbuilt) window.open(url, "_blank");
		else {
			let browserWindow = new LibraryRequires.electron.remote.BrowserWindow({
				frame: true,
				resizeable: true,
				show: true,
				darkTheme: BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themedark,
				webPreferences: {
					nodeIntegration: false,
					nodeIntegrationInWorker: false
				}
			});
			browserWindow.setMenu(null);
			browserWindow.loadURL(url);
			if (minimized) browserWindow.minimize(null);
		}
	};
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
			let version = null;
			try {version = LibraryRequires.electron.remote.app.getVersion();}
			catch (err) {version = "";}
			BDFDB.DiscordUtils.getBuilt.version = version;
			return version;
		}
	};
	BDFDB.DiscordUtils.isDevModeEnabled = function () {
		return LibraryModules.StoreChangeUtils.get("UserSettingsStore").developerMode;
	};
	BDFDB.DiscordUtils.getTheme = function () {
		return LibraryModules.StoreChangeUtils.get("UserSettingsStore").theme == "dark" ? BDFDB.disCN.themedark : BDFDB.disCN.themelight;
	};
	BDFDB.DiscordUtils.getMode = function () {
		return LibraryModules.StoreChangeUtils.get("UserSettingsStore").message_display_compact ? "compact" : "cozy";
	};
	BDFDB.DiscordUtils.getZoomFactor = function () {
		let aRects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount));
		let widthZoom = Math.round(100 * window.outerWidth / aRects.width);
		let heightZoom = Math.round(100 * window.outerHeight / aRects.height);
		return widthZoom < heightZoom ? widthZoom : heightZoom;
	};
	BDFDB.DiscordUtils.getFontScale = function () {
		return parseInt(document.firstElementChild.style.fontSize.replace("%", ""));
	};
	BDFDB.DiscordUtils.shake = function () {
		BDFDB.ReactUtils.getInstance(document.querySelector(BDFDB.dotCN.appold)).return.stateNode.shake();
	};

	BDFDB.WindowUtils = {};
	BDFDB.WindowUtils.open = function (plugin, url, options = {}) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (!BDFDB.ObjectUtils.is(plugin) || !url) return;
		if (!BDFDB.ArrayUtils.is(plugin.browserWindows)) plugin.browserWindows = [];
		let config = Object.assign({
			show: false,
			webPreferences: {
				nodeIntegration: true,
				nodeIntegrationInWorker: true
			}
		}, options);
		let browserWindow = new LibraryRequires.electron.remote.BrowserWindow(BDFDB.ObjectUtils.exclude(config, "showOnReady", "onLoad"));
		
		if (!config.show && config.showOnReady) browserWindow.once("ready-to-show", browserWindow.show);
		if (typeof config.onLoad == "function") browserWindow.webContents.on("did-finish-load", (...args) => {config.onLoad(...args);});
		
		if (typeof browserWindow.removeMenu == "function") browserWindow.removeMenu();
		else browserWindow.setMenu(null);
		browserWindow.loadURL(url);
		browserWindow.executeJavaScriptSafe = js => {if (!browserWindow.isDestroyed()) browserWindow.webContents.executeJavaScript(`(_ => {${js}})();`);};
		plugin.browserWindows.push(browserWindow);
		return browserWindow;
	};
	BDFDB.WindowUtils.close = function (browserWindow) {
		if (BDFDB.ObjectUtils.is(browserWindow) && !browserWindow.isDestroyed() && browserWindow.isClosable()) browserWindow.close();
	};
	BDFDB.WindowUtils.closeAll = function (plugin) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (BDFDB.ObjectUtils.is(plugin) && BDFDB.ArrayUtils.is(plugin.browserWindows)) while (plugin.browserWindows.length) BDFDB.WindowUtils.close(plugin.browserWindows.pop());
	};
	BDFDB.WindowUtils.addListener = function (plugin, actions, callback) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (!BDFDB.ObjectUtils.is(plugin) || !actions || typeof callback != "function") return;
		BDFDB.WindowUtils.removeListener(plugin, actions);
		for (let action of actions.split(" ")) {
			action = action.split(".");
			let eventname = action.shift();
			if (!eventname) return;
			let namespace = (action.join(".") || "") + plugin.name;
			if (!BDFDB.ArrayUtils.is(plugin.ipcListeners)) plugin.ipcListeners = [];

			plugin.ipcListeners.push({eventname, namespace, callback});
			LibraryRequires.electron.ipcRenderer.on(eventname, callback);
		}
	};
	BDFDB.WindowUtils.removeListener = function (plugin, actions = "") {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (!BDFDB.ObjectUtils.is(plugin) || !BDFDB.ArrayUtils.is(plugin.ipcListeners)) return;
		if (actions) {
			for (let action of actions.split(" ")) {
				action = action.split(".");
				let eventname = action.shift();
				let namespace = (action.join(".") || "") + plugin.name;
				for (let listener of plugin.ipcListeners) {
					let removedListeners = [];
					if (listener.eventname == eventname && listener.namespace == namespace) {
						LibraryRequires.electron.ipcRenderer.off(listener.eventname, listener.callback);
						removedListeners.push(listener);
					}
					if (removedListeners.length) plugin.ipcListeners = plugin.ipcListeners.filter(listener => {return removedListeners.indexOf(listener) < 0;});
				}
			}
		}
		else {
			for (let listener of plugin.ipcListeners) LibraryRequires.electron.ipcRenderer.off(listener.eventname, listener.callback);
			plugin.ipcListeners = [];
		}
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
		let folderbutton = usersettings.querySelector(BDFDB.dotCN._repofolderbutton);
		if (!folderbutton) return;
		let header = folderbutton.parentElement.querySelector("h2");
		if (header && header.innerText) {
			let headerText = header.innerText.toLowerCase();
			if (headerText === "plugins" || headerText === "themes") return headerText;
		}
	};
	BDFDB.BDUtils.isPluginEnabled = function (pluginName) {
		if (BdApi.Plugins && typeof BdApi.Plugins.Plugins == "function") return BdApi.Plugins.isEnabled(pluginName);
		else if (typeof BdApi.isPluginEnabled == "function") return BdApi.isPluginEnabled(pluginName);
	};
	BDFDB.BDUtils.enablePlugin = function (pluginName) {
		if (BdApi.Plugins && typeof BdApi.Plugins.enable == "function") BdApi.Plugins.enable(pluginName);
		else if (window.pluginModule) window.pluginModule.startPlugin(pluginName);
	};
	BDFDB.BDUtils.disablePlugin = function (pluginName) {
		if (BdApi.Plugins && typeof BdApi.Plugins.disable == "function") BdApi.Plugins.disable(pluginName);
		else if (window.pluginModule) window.pluginModule.stopPlugin(pluginName);
	};
	BDFDB.BDUtils.getPlugin = function (pluginName, hasToBeEnabled = false, overHead = false) {
		if (!hasToBeEnabled || BDFDB.BDUtils.isPluginEnabled(pluginName)) {	
			if (BdApi.Plugins.get && typeof BdApi.Plugins.get == "function") {
				let plugin = BdApi.Plugins.get(pluginName);
				if (overHead) return plugin ? {filename: LibraryRequires.fs.existsSync(LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), `${pluginName}.plugin.js`)) ? `${pluginName}.plugin.js` : null, id: pluginName, name: pluginName, plugin: plugin} : null;
				else return plugin;
			}
			else if (window.bdplugins) overHead ? window.bdplugins[pluginName] : (window.bdplugins[pluginName] || {}).plugin;
		}
		return null;
	};
	BDFDB.BDUtils.isThemeEnabled = function (themeName) {
		if (BdApi.Themes && typeof BdApi.Themes.isEnabled == "function") return BdApi.Themes.isEnabled(themeName);
		else if (typeof BdApi.isThemeEnabled == "function") return BdApi.isThemeEnabled(themeName);
	};
	BDFDB.BDUtils.enableTheme = function (themeName) {
		if (BdApi.Themes && typeof BdApi.Themes.enable == "function") BdApi.Themes.enable(themeName);
		else if (window.themeModule) window.themeModule.enableTheme(themeName);
	};
	BDFDB.BDUtils.disableTheme = function (themeName) {
		if (BdApi.Themes && typeof BdApi.Themes.disable == "function") BdApi.Themes.disable(themeName);
		else if (window.themeModule) window.themeModule.disableTheme(themeName);
	};
	BDFDB.BDUtils.getTheme = function (themeName, hasToBeEnabled = false) {
		if (!hasToBeEnabled || BDFDB.BDUtils.isThemeEnabled(themeName)) {
			if (BdApi.Themes && typeof BdApi.Themes.get == "function") return BdApi.Themes.get(themeName);
			else if (window.bdthemes) window.bdthemes[themeName];
		}
		return null;
	};
	BDFDB.BDUtils.getSettings = function (key) {
		if (key) return BdApi.isSettingEnabled(key);
		else return BDFDB.ReactUtils.getValue(BdApi.getBDData("settings"), `${BDFDB.DiscordUtils.getBuilt()}.settings`);
	};
	BDFDB.BDUtils.isAutoLoadEnabled = function () {
		return BDFDB.BDUtils.getSettings("fork-ps-5") === true || BDFDB.BDUtils.isPluginEnabled("Restart-No-More") || BDFDB.BDUtils.isPluginEnabled("Restart No More");
	};

	var DiscordClassModules = {};
	DiscordClassModules.BDFDB = {
		BDFDBundefined: "BDFDB_undefined",
		avatarStatusHovered: "statusHovered-gF2976",
		bdaRepoEntry: "entry-9JnAPs",
		cardInner: "inner-OP_8zd",
		cardWrapper: "card-rT4Wbb",
		charCounter: "counter-uAzbKp",
		changeLogModal: "changeLogModal-ny_dHC",
		collapseContainer: "container-fAVkOf",
		collapseContainerArrow: "arrow-uglXxc",
		collapseContainerCollapsed: "collapsed-2BUBZm",
		collapseContainerHeader: "header-2s6x-5",
		collapseContainerInner: "inner-TkGytd",
		collapseContainerMini: "container-fAVkOf containerMini-_k6Rts",
		collapseContainerTitle: "title-ROsJi-",
		colorPicker: "colorPicker-h5sF8g",
		colorPickerSwatches: "swatches-QxZw_N",
		colorPickerSwatchesDisabled: "disabled-2JgNxl",
		colorPickerSwatchSingle: "single-Fbb1wB",
		colorPickerSwatchSelected: "selected-f5IVXN",
		confirmModal: "confirmModal-t-WDWJ",
		dev: "dev-A7f2Rx",
		favButtonContainer: "favbutton-8Fzu45",
		guild: "guild-r3yAE_",
		guildLowerLeftBadge: "lowerLeftBadge-zr4T_9",
		guildUpperLeftBadge: "upperLeftBadge-e35IpL",
		hotkeyResetButton: "resetButton-hI9Ax7",
		hotkeyWrapper: "recorder-can0vx",
		inputNumberButton: "button-J9muv5",
		inputNumberButtonDown: "down-cOY7Qp button-J9muv5",
		inputNumberButtonUp: "up-mUs_72 button-J9muv5",
		inputNumberButtons: "buttons-our3p-",
		inputNumberWrapper: "numberInputWrapper-j4svZS",
		inputNumberWrapperDefault: "numberInputWrapperDefault-gRxcuK numberInputWrapper-j4svZS",
		inputNumberWrapperMini: "numberInputWrapperMini-wtUU31 numberInputWrapper-j4svZS",
		loadingIcon: "loadingIcon-cOYMPl",
		loadingIconWrapper: "loadingIconWrapper-PsVJ9m",
		overflowEllipsis: "ellipsis-qlo9sA",
		popoutWrapper: "popout-xwjvsX",
		quickSelectWrapper: "quickSelectWrapper-UCfTKz",
		quickSelectPopoutWrapper: "quickSelectPopout-u2dtIf",
		modalHeaderHasSibling: "hasSiblings-fRyjyl",
		modalInnerScrollerLess: "inner-YgPpF3",
		modalTabContent: "tabContent-nZ-1U5",
		modalTabContentOpen: "open-yICTYu",
		modalWrapper: "modal-6GHvdM",
		noticeWrapper: "noticeWrapper-8z511t",
		selectWrapper: "selectWrapper-yPjeij",
		settingsGuild: "guild-J3Egt5",
		settingsGuildDisabled: "disabled-b2o83O",
		settingsPanel: "settingsPanel-w2ySNR",
		settingsPanelInner: "settingsInner-zw1xAY",
		settingsPanelList: "settingsList-eZjkXj",
		settingsPanelTitle: "title-GTF_8J",
		settingsTableCard: "settingsTableCard-628t52",
		settingsTableCardConfigs: "settingsTableCardConfigs-w5X9-Z",
		settingsTableCardLabel: "settingsTableCardLabel-MElgIg",
		settingsTableHeaders: "settingsTableHeaders-WKzw9_",
		settingsTableHeaderVertical: "headerVertical-4MNxqk",
		settingsTableList: "settingsTableList-f6sW2y",
		supporter: "supporter-Z3FfwL",
		svgIcon: "icon-GhnIRB",
		table: "table-moqjM0",
		tableBodyCell: "bodyCell-dQam9V",
		tableHeader: "header-g67q9_",
		tableHeaderCell: "headerCell-T6Fo3K",
		tableHeaderCellSorted: "headerCellSorted-FMjMWK",
		tableHeaderSortIcon: "sortIcon-WZjMja",
		tableRow: "row-_9Ehcp",
		tableStickyHeader: "stickyHeader-JabwjW header-g67q9_",
		textScroller: "textScroller-dc9_kz",
		themedPopout: "themedPopout-1TrfdI",
		tooltipCustom: "tooltipCustom-hH39_Z"
	};
	DiscordClassModules.BDrepo = {
		bdAddonCard: "bd-card bd-addon-card",
		bdButton: "bd-button",
		bdaAuthor: "author bda-author",
		bdaControls: "bd-addon-controls bda-controls",
		bdaControlsButton: "bd-addon-button",
		bdaDescription: "bd-addon-description bda-description",
		bdaDescriptionWrap: "bda-description-wrap",
		bdaFooter: "bd-card-footer bda-footer",
		bdaHeader: "bd-addon-header bda-header",
		bdaHeaderTitle: "bd-card-title bda-header-title",
		bdaLink: "bda-link",
		bdaLinks: "bd-addon-links bda-links",
		bdaName: "name bda-name",
		bdaSettingsButton: "bda-settings-button",
		bdaSlist: "bda-slist bd-addon-list",
		bdaVersion: "version bda-version",
		bdGuild: "bd-guild",
		bdGuildAnimatable: "bd-animatable",
		bdGuildAudio: "bd-audio",
		bdGuildSelected: "bd-selected",
		bdGuildSeparator: "bd-guild-separator",
		bdGuildUnread: "bd-unread",
		bdGuildVideo: "bd-video",
		bdIcon: "bd-icon",
		bdPillSelected: "bd-selected",
		bdPillUnread: "bd-unread",
		bdPfbtn: "bd-pfbtn",
		bdSwitch: "bd-switch",
		bdSwitchChecked: "bd-switch-checked",
		bdSwitchInner: "bd-checkbox",
		bdUpdatebtn: "bd-updatebtn",
		settingsOpen: "settings-open",
		settingsClosed: "settings-closed",
		switch: "ui-switch",
		switchCheckbox: "ui-switch-checkbox",
		switchChecked: "checked",
		switchItem: "ui-switch-item",
		switchWrapper: "ui-switch-wrapper"
	};
	DiscordClassModules.BetterNsfwTag = {
		nsfwTag: "nsfwTag-666omg"
	};
	DiscordClassModules.ChatFilter = {
		blocked: "blocked-jUhayi",
		blockedStamp: "blockedStamp-ijVeNn",
		censored: "censored-UYfeYg",
		censoredStamp: "censoredStamp-fb2cYb"
	};
	DiscordClassModules.CharCounter = {
		charCounter: "charCounter-7fw40k charcounter",
		counterAdded: "counterAdded-zz9O4t"
	};
	DiscordClassModules.DisplayLargeMessages = {
		injectButton: "injectButton-8eKqGu"
	};
	DiscordClassModules.DisplayServersAsChannels = {
		badge: "badge-fxFrUP",
		name: "name-z5133D",
		styled: "styledGuildsAsChannels-DNHtg_"
	};
	DiscordClassModules.EmojiStatistics = {
		statisticsButton: "statisticsButton-nW2KoM",
		amountCell: "amountCell-g_W6Rx",
		iconCell: "iconCell--wniOu",
		nameCell: "nameCell-xyXENZ"
	};
	DiscordClassModules.FriendNotifications = {
		friendsOnline: "friendsOnline-2JkivW"
	};
	DiscordClassModules.GoogleTranslateOption = {
		reverseButton: "reverseButton-5S47qV",
		translateButton: "translateButton-DhP9x8",
		translated: "translated-5YO8i3",
		translating: "translating-Yi-YxC"
	};
	DiscordClassModules.ImageGallery = {
		details: "details-9dkFPc",
		detailsLabel: "label-mrlccN",
		detailsWrapper: "detailsWrapper-TE1mu5",
		gallery: "gallery-JViwKR",
		icon: "icon-QY6cR4",
		next: "next-SHEZrz",
		previous: "previous-xsNq6B",
		sibling: "sibling-6vI7Pu"
	};
	DiscordClassModules.ImageZoom = {
		backdrop: "lenseBackdrop-yEm7Om",
		lense: "zoomLense-uOK8xV",
		modal: "imageModal-8J0ttB"
	};
	DiscordClassModules.OldTitleBar = {
		oldTitleBarEnabled: "oldTitleBarEnabled-D8ppJQ",
		settingsToolbar: "settingsToolbar-wu4yfQ",
		toolbar: "toolbar-hRzFw-"
	};
	DiscordClassModules.PinDMs = {
		dragPreview: "dragPreview-nXiByA",
		dmChannelPinned: "pinned-0lM4wD",
		dmChannelPlaceholder: "placeholder-7bhR5s",
		pinnedChannelsHeaderAmount: "headerAmount-_-7GrS",
		pinnedChannelsHeaderArrow: "pinnedChannelsHeaderArrow-44rrTz",
		pinnedChannelsHeaderCollapsed: "collapsed-3w_-ff",
		pinnedChannelsHeaderColored: "colored-oIzG5s",
		pinnedChannelsHeaderContainer: "pinnedChannelsHeaderContainer-89Gjv4",
		recentPinned: "pinned-jHvFrr",
		recentPlaceholder: "placeholder-Uff-gH",
		unpinButton: "unpinButton-z3-UVO",
		unpinIcon: "unpinIcon-79ZnEr"
	};
	DiscordClassModules.ReadAllNotificationsButton	= {
		button: "button-Jt-tIg",
		frame: "frame-oXWS21",
		innerFrame: "innerFrame-8Hg64E"
	};
	DiscordClassModules.ServerFolders = {
		dragPreview: "dragPreview-nXiByA",
		guildPlaceholder: "placeholder-7bhR5s",
		folderContent: "content-Pph8t6",
		folderContentClosed: "closed-j55_T-",
		folderContentIsOpen: "folderContentIsOpen-zz6FgW",
		iconSwatch: "iconSwatch-_78Ghj",
		iconSwatchInner: "iconInner-aOY-qk",
		iconSwatchPreview: "preview-Bbg_24",
		iconSwatchSelected: "selected-P5oePO"
	};
	DiscordClassModules.ShowImageDetails = {
		details: "details-1t6Zms",
		detailsAdded: "detailsAdded-SAy48f"
	};
	DiscordClassModules.SpellCheck = {
		error: "error-k9z2IV",
		overlay: "spellCheckOverlay-cNSap5"
	};
	DiscordClassModules.TimedLightDarkMode = {
		dateGrabber: "dateGrabber-QrRkIX",
		timerGrabber: "timerGrabber-zpRAIk",
		timerSettings: "timerSettings-wkvEfF"
	};
	DiscordClassModules.TopRolesEverywhere = {
		badgeStyle: "badgeStyle-tFiEQ8",
		chatTag: "chatTag-Y-5TDc",
		memberTag: "memberTag-QVWzGc",
		roleStyle: "roleStyle-jQ7KI2",
		tag: "tag-wWVHyf"
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
		mentionInteractive: "interactive",
		mentionWrapper: "wrapper-3WhCwL",
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
	DiscordClassModules.Backdrop = BDFDB.ModuleUtils.findByProperties("backdrop", "backdropWithLayer");
	DiscordClassModules.Badge = BDFDB.ModuleUtils.findByProperties("numberBadge", "textBadge", "iconBadge");
	DiscordClassModules.BotTag = BDFDB.ModuleUtils.findByProperties("botTag", "botTagInvert");
	DiscordClassModules.Button = BDFDB.ModuleUtils.findByProperties("colorBlack", "button");
	DiscordClassModules.CallAvatar = BDFDB.ModuleUtils.findByProperties("callAvatarMask", "video");
	DiscordClassModules.CallCurrent = BDFDB.ModuleUtils.findByProperties("wrapper", "fullScreen");
	DiscordClassModules.CallDetails = BDFDB.ModuleUtils.findByProperties("container", "hotspot");
	DiscordClassModules.CallIncoming = BDFDB.ModuleUtils.findByProperties("incomingCall", "container");
	DiscordClassModules.CallIncomingInner = BDFDB.ModuleUtils.findByProperties("incomingCallInner", "members");
	DiscordClassModules.Card = BDFDB.ModuleUtils.findByProperties("card", "cardBrand");
	DiscordClassModules.CardStatus = BDFDB.ModuleUtils.findByProperties("reset", "error", "card");
	DiscordClassModules.Category = BDFDB.ModuleUtils.findByProperties("wrapper", "children", "muted");
	DiscordClassModules.CategoryContainer = BDFDB.ModuleUtils.findByProperties("addButtonIcon", "containerDefault");
	DiscordClassModules.ChangeLog = BDFDB.ModuleUtils.findByProperties("added", "fixed", "improved", "progress");
	DiscordClassModules.Channel = BDFDB.ModuleUtils.findByProperties("wrapper", "content", "modeSelected");
	DiscordClassModules.ChannelContainer = BDFDB.ModuleUtils.findByProperties("actionIcon", "containerDefault");
	DiscordClassModules.ChannelLimit = BDFDB.ModuleUtils.findByProperties("users", "total", "wrapper");
	DiscordClassModules.ChannelTextArea = BDFDB.ModuleUtils.findByProperties("textArea", "buttons");
	DiscordClassModules.ChannelTextAreaAttachButton = BDFDB.ModuleUtils.findByProperties("attachButton", "attachWrapper");
	DiscordClassModules.ChannelTextAreaButton = BDFDB.ModuleUtils.findByProperties("buttonWrapper", "active");
	DiscordClassModules.ChannelTextAreaCharCounter = BDFDB.ModuleUtils.findByProperties("characterCount", "error");
	DiscordClassModules.ChannelTextAreaSlate = BDFDB.ModuleUtils.findByProperties("slateContainer", "placeholder");
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
	DiscordClassModules.EmojiInput = BDFDB.ModuleUtils.findByProperties("inputContainer", "emojiButton");
	DiscordClassModules.EmojiPicker = BDFDB.ModuleUtils.findByProperties("emojiPicker", "diversitySelector");
	DiscordClassModules.ExpressionPicker = BDFDB.ModuleUtils.findByProperties("contentWrapper", "navButton", "navList");
	DiscordClassModules.File = BDFDB.ModuleUtils.findByProperties("downloadButton", "fileNameLink");
	DiscordClassModules.Flex = BDFDB.ModuleUtils.findByProperties("alignBaseline", "alignCenter");
	DiscordClassModules.FlexChild = BDFDB.ModuleUtils.findByProperties("flexChild", "flex");
	DiscordClassModules.FlowerStar = BDFDB.ModuleUtils.findByProperties("flowerStarContainer", "flowerStar");
	DiscordClassModules.FormText = BDFDB.ModuleUtils.findByProperties("description", "modeDefault");
	DiscordClassModules.Game = BDFDB.ModuleUtils.findByProperties("game", "gameName");
	DiscordClassModules.GameIcon = BDFDB.ModuleUtils.findByProperties("gameIcon", "small", "xsmall");
	DiscordClassModules.GameLibraryTable = BDFDB.ModuleUtils.findByProperties("stickyHeader", "emptyStateText");
	DiscordClassModules.GifFavoriteButton = BDFDB.ModuleUtils.findByProperties("gifFavoriteButton", "showPulse");
	DiscordClassModules.GoLiveDetails = BDFDB.ModuleUtils.findByProperties("panel", "gameWrapper");
	DiscordClassModules.Guild = BDFDB.ModuleUtils.findByProperties("wrapper", "lowerBadge", "svg");
	DiscordClassModules.GuildChannels = BDFDB.ModuleUtils.findByProperties("positionedContainer", "unreadBar");
	DiscordClassModules.GuildDiscovery = BDFDB.ModuleUtils.findByProperties("pageWrapper", "guildCard");
	DiscordClassModules.GuildDm = BDFDB.ModuleUtils.find(m => typeof m.pill == "string" && Object.keys(m).length == 1);
	DiscordClassModules.GuildEdges = BDFDB.ModuleUtils.findByProperties("wrapper", "edge", "autoPointerEvents");
	DiscordClassModules.GuildFolder = BDFDB.ModuleUtils.findByProperties("folder", "expandedFolderIconWrapper");
	DiscordClassModules.GuildHeader = BDFDB.ModuleUtils.findByProperties("header", "name", "bannerImage");
	DiscordClassModules.GuildHeaderButton = BDFDB.ModuleUtils.findByProperties("button", "open");
	DiscordClassModules.GuildIcon = BDFDB.ModuleUtils.findByProperties("acronym", "selected", "wrapper");
	DiscordClassModules.GuildInvite = BDFDB.ModuleUtils.findByProperties("wrapper", "guildIconJoined");
	DiscordClassModules.GuildSettingsBanned = BDFDB.ModuleUtils.findByProperties("bannedUser", "bannedUserAvatar");
	DiscordClassModules.GuildSettingsEmoji = BDFDB.ModuleUtils.findByProperties("emojiRow", "emojiAliasPlaceholder");
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
	DiscordClassModules.ItemRole = BDFDB.ModuleUtils.findByProperties("role", "dragged");
	DiscordClassModules.ItemLayerContainer = BDFDB.ModuleUtils.findByProperties("layer", "layerContainer");
	DiscordClassModules.Input = BDFDB.ModuleUtils.findByProperties("inputMini", "inputDefault");
	DiscordClassModules.LayerModal = BDFDB.ModuleUtils.findByProperties("root", "small", "medium");
	DiscordClassModules.Layers = BDFDB.ModuleUtils.findByProperties("layer", "layers");
	DiscordClassModules.LiveTag = BDFDB.ModuleUtils.findByProperties("liveLarge", "live");
	DiscordClassModules.LoadingScreen = BDFDB.ModuleUtils.findByProperties("container", "problemsText", "problems");
	DiscordClassModules.Margins = BDFDB.ModuleUtils.findByProperties("marginBottom4", "marginCenterHorz");
	DiscordClassModules.Member = BDFDB.ModuleUtils.findByProperties("member", "ownerIcon");
	DiscordClassModules.MembersWrap = BDFDB.ModuleUtils.findByProperties("membersWrap", "membersGroup");
	DiscordClassModules.Message = BDFDB.ModuleUtils.findByProperties("message", "mentioned");
	DiscordClassModules.MessageAccessory = BDFDB.ModuleUtils.findByProperties("embedWrapper", "gifFavoriteButton");
	DiscordClassModules.MessageBlocked = BDFDB.ModuleUtils.findByProperties("blockedMessageText", "expanded");
	DiscordClassModules.MessageBody = BDFDB.ModuleUtils.findByProperties("markupRtl", "edited");
	DiscordClassModules.MessageDivider = BDFDB.ModuleUtils.findByProperties("isUnread", "divider");
	DiscordClassModules.MessageElements = BDFDB.ModuleUtils.findByProperties("messageGroupBlockedBtn", "dividerRed");
	DiscordClassModules.MessageFile = BDFDB.ModuleUtils.findByProperties("cancelButton", "filenameLinkWrapper");
	DiscordClassModules.MessageLocalBot = BDFDB.ModuleUtils.find(m => typeof m.localBotMessage == "string" && Object.keys(m).length == 1);
	DiscordClassModules.MessageMarkup = BDFDB.ModuleUtils.findByProperties("markup");
	DiscordClassModules.MessageOperations = BDFDB.ModuleUtils.find(m => typeof m.operations == "string" && Object.keys(m).length == 1);
	DiscordClassModules.MessageSystem = BDFDB.ModuleUtils.findByProperties("container", "actionAnchor");
	DiscordClassModules.MessageToolbar = BDFDB.ModuleUtils.findByProperties("container", "icon", "isHeader");
	DiscordClassModules.MessageToolbarItems = BDFDB.ModuleUtils.findByProperties("wrapper", "button", "separator");
	DiscordClassModules.MessagesPopout = BDFDB.ModuleUtils.findByProperties("messagesPopoutWrap", "jumpButton");
	DiscordClassModules.MessagesPopoutButtons = BDFDB.ModuleUtils.findByProperties("secondary", "tertiary", "button");
	DiscordClassModules.MessagesPopoutTabBar = BDFDB.ModuleUtils.findByProperties("header", "tabBar", "active");
	DiscordClassModules.MessagesWelcome = BDFDB.ModuleUtils.findByProperties("welcomeMessage", "h1");
	DiscordClassModules.MessagesWrap = BDFDB.ModuleUtils.findByProperties("messagesWrapper", "messageGroupBlocked");
	DiscordClassModules.Modal = BDFDB.ModuleUtils.findByProperties("modal", "sizeLarge");
	DiscordClassModules.ModalDivider = BDFDB.ModuleUtils.find(m => typeof m.divider == "string" && Object.keys(m).length == 1);
	DiscordClassModules.ModalItems = BDFDB.ModuleUtils.findByProperties("guildName", "checkboxContainer");
	DiscordClassModules.ModalMiniContent = BDFDB.ModuleUtils.find(m => typeof m.modal == "string" && typeof m.content == "string" && Object.keys(m).length == 2);
	DiscordClassModules.ModalWrap = BDFDB.ModuleUtils.find(m => typeof m.modal == "string" && typeof m.inner == "string" && Object.keys(m).length == 2);
	DiscordClassModules.NameContainer = DiscordClassModules.ContextMenu.subMenuContext ? BDFDB.ModuleUtils.findByProperties("nameAndDecorators", "name") : {};
	DiscordClassModules.NameTag = BDFDB.ModuleUtils.findByProperties("bot", "nameTag");
	DiscordClassModules.NitroStore = BDFDB.ModuleUtils.findByProperties("applicationStore", "marketingHeader");
	DiscordClassModules.Note = BDFDB.ModuleUtils.find(m => typeof m.note == "string" && Object.keys(m).length == 1);
	DiscordClassModules.Notice = BDFDB.ModuleUtils.findByProperties("notice", "noticeFacebook");
	DiscordClassModules.Peoples = BDFDB.ModuleUtils.findByProperties("peopleColumn", "tabBar");
	DiscordClassModules.PictureInPicture = BDFDB.ModuleUtils.findByProperties("pictureInPicture", "pictureInPictureWindow");
	DiscordClassModules.PillWrapper = BDFDB.ModuleUtils.find(m => typeof m.item == "string" && typeof m.wrapper == "string" && Object.keys(m).length == 2);
	DiscordClassModules.PrivateChannel = BDFDB.ModuleUtils.findByProperties("channel", "closeButton");
	DiscordClassModules.PrivateChannelList = BDFDB.ModuleUtils.findByProperties("privateChannels", "searchBar");
	DiscordClassModules.PrivateChannelListScroller = BDFDB.ModuleUtils.findByProperties("scroller", "empty");
	DiscordClassModules.Popout = BDFDB.ModuleUtils.findByProperties("popout", "arrowAlignmentTop");
	DiscordClassModules.PopoutActivity = BDFDB.ModuleUtils.findByProperties("ellipsis", "activityActivityFeed");
	DiscordClassModules.QuickMessage = BDFDB.ModuleUtils.findByProperties("quickMessage", "isBlocked");
	DiscordClassModules.QuickSelect = BDFDB.ModuleUtils.findByProperties("quickSelectArrow", "selected");
	DiscordClassModules.QuickSwitch = BDFDB.ModuleUtils.findByProperties("resultFocused", "guildIconContainer");
	DiscordClassModules.QuickSwitchWrap = BDFDB.ModuleUtils.findByProperties("container", "miscContainer");
	DiscordClassModules.Reactions = BDFDB.ModuleUtils.findByProperties("reactionBtn", "reaction");
	DiscordClassModules.RecentMentions = BDFDB.ModuleUtils.findByProperties("recentMentionsPopout");
	DiscordClassModules.Role = BDFDB.ModuleUtils.findByProperties("roleCircle", "roleName", "roleRemoveIcon");
	DiscordClassModules.Scrollbar = BDFDB.ModuleUtils.findByProperties("scrollbar", "scrollbarGhost");
	DiscordClassModules.Scroller = BDFDB.ModuleUtils.findByProperties("scrollerThemed", "scroller");
	DiscordClassModules.SearchBar = BDFDB.ModuleUtils.findByProperties("clear", "container", "pointer");
	DiscordClassModules.SearchPopout = BDFDB.ModuleUtils.findByProperties("datePicker", "searchResultChannelIconBackground");
	DiscordClassModules.SearchPopoutWrap = BDFDB.ModuleUtils.findByProperties("container", "queryContainer");
	DiscordClassModules.SearchResults = BDFDB.ModuleUtils.findByProperties("messageGroupCozy", "searchResultsWrap");
	DiscordClassModules.Select = BDFDB.ModuleUtils.findByProperties("select", "error", "errorMessage");
	DiscordClassModules.SettingsCloseButton = BDFDB.ModuleUtils.findByProperties("closeButton", "keybind");
	DiscordClassModules.SettingsItems = BDFDB.ModuleUtils.findByProperties("dividerMini", "note");
	DiscordClassModules.SettingsTable = BDFDB.ModuleUtils.findByProperties("headerOption", "headerName");
	DiscordClassModules.SettingsWindow = BDFDB.ModuleUtils.findByProperties("contentRegion", "standardSidebarView");
	DiscordClassModules.Slider = BDFDB.ModuleUtils.findByProperties("slider", "grabber");
	DiscordClassModules.Spoiler = BDFDB.ModuleUtils.findByProperties("spoilerContainer", "hidden");
	DiscordClassModules.SpoilerEmbed = BDFDB.ModuleUtils.findByProperties("hiddenSpoilers", "spoiler");
	DiscordClassModules.Switch = BDFDB.ModuleUtils.findByProperties("switchDisabled", "valueChecked");
	DiscordClassModules.Table = BDFDB.ModuleUtils.findByProperties("stickyHeader", "sortIcon");
	DiscordClassModules.Text = BDFDB.ModuleUtils.findByProperties("defaultColor", "defaultMarginh1");
	DiscordClassModules.TextColor = BDFDB.ModuleUtils.findByProperties("colorStandard", "colorMuted", "colorError");
	DiscordClassModules.TextColor2 = BDFDB.ModuleUtils.findByProperties("muted", "wrapper", "base");
	DiscordClassModules.TextSize = BDFDB.ModuleUtils.findByProperties("size10", "size14", "size20");
	DiscordClassModules.TextStyle = BDFDB.ModuleUtils.findByProperties("strikethrough", "underline", "bold");
	DiscordClassModules.Tip = BDFDB.ModuleUtils.findByProperties("pro", "inline");
	DiscordClassModules.Title = BDFDB.ModuleUtils.findByProperties("title", "size18");
	DiscordClassModules.TitleBar = BDFDB.ModuleUtils.findByProperties("titleBar", "wordmark");
	DiscordClassModules.Tooltip = BDFDB.ModuleUtils.findByProperties("tooltip", "tooltipTop");
	DiscordClassModules.TooltipGuild = BDFDB.ModuleUtils.findByProperties("rowIcon", "rowGuildName");
	DiscordClassModules.Typing = BDFDB.ModuleUtils.findByProperties("cooldownWrapper", "typing");
	DiscordClassModules.UnreadBar = BDFDB.ModuleUtils.findByProperties("active", "bar", "unread");
	DiscordClassModules.UploadModal = BDFDB.ModuleUtils.findByProperties("uploadModal", "bgScale");
	DiscordClassModules.UserInfo = BDFDB.ModuleUtils.findByProperties("userInfo", "discordTag");
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
		_betternsfwtagtag: ["BetterNsfwTag", "nsfwTag"],
		_chatfilterblocked: ["ChatFilter", "blocked"],
		_chatfilterblockedstamp: ["ChatFilter", "blockedStamp"],
		_chatfiltercensored: ["ChatFilter", "censored"],
		_chatfiltercensoredstamp: ["ChatFilter", "censoredStamp"],
		_charcountercounter: ["CharCounter", "charCounter"],
		_charcountercounteradded: ["CharCounter", "counterAdded"],
		_displaylargemessagesinjectbutton: ["DisplayLargeMessages", "injectButton"],
		_displayserversaschannelsbadge: ["DisplayServersAsChannels", "badge"],
		_displayserversaschannelsname: ["DisplayServersAsChannels", "name"],
		_displayserversaschannelsstyled: ["DisplayServersAsChannels", "styled"],
		_emojistatisticsstatisticsbutton: ["EmojiStatistics", "statisticsButton"],
		_emojistatisticsamountcell: ["EmojiStatistics", "amountCell"],
		_emojistatisticsiconcell: ["EmojiStatistics", "iconCell"],
		_emojistatisticsnamecell: ["EmojiStatistics", "nameCell"],
		_imagegallerydetails: ["ImageGallery", "details"],
		_imagegallerydetailslabel: ["ImageGallery", "detailsLabel"],
		_imagegallerydetailswrapper: ["ImageGallery", "detailsWrapper"],
		_imagegallerygallery: ["ImageGallery", "gallery"],
		_imagegalleryicon: ["ImageGallery", "icon"],
		_imagegallerynext: ["ImageGallery", "next"],
		_imagegalleryprevious: ["ImageGallery", "previous"],
		_imagegallerysibling: ["ImageGallery", "sibling"],
		_imagezoombackdrop: ["ImageZoom", "backdrop"],
		_imagezoomimagemodal: ["ImageZoom", "modal"],
		_imagezoomlense: ["ImageZoom", "lense"],
		_friendnotificationsfriendsonline: ["FriendNotifications", "friendsOnline"],
		_googletranslateoptionreversebutton: ["GoogleTranslateOption", "reverseButton"],
		_googletranslateoptiontranslatebutton: ["GoogleTranslateOption", "translateButton"],
		_googletranslateoptiontranslated: ["GoogleTranslateOption", "translated"],
		_googletranslateoptiontranslating: ["GoogleTranslateOption", "translating"],
		_oldtitlebarenabled: ["OldTitleBar", "oldTitleBarEnabled"],
		_oldtitlebarsettingstoolbar: ["OldTitleBar", "settingsToolbar"],
		_oldtitlebartoolbar: ["OldTitleBar", "toolbar"],
		_pindmsdragpreview: ["PinDMs", "dragPreview"],
		_pindmsdmchannelpinned: ["PinDMs", "dmChannelPinned"],
		_pindmsdmchannelplaceholder: ["PinDMs", "dmChannelPlaceholder"],
		_pindmspinnedchannelsheaderamount: ["PinDMs", "pinnedChannelsHeaderAmount"],
		_pindmspinnedchannelsheaderarrow: ["PinDMs", "pinnedChannelsHeaderArrow"],
		_pindmspinnedchannelsheadercollapsed: ["PinDMs", "pinnedChannelsHeaderCollapsed"],
		_pindmspinnedchannelsheadercolored: ["PinDMs", "pinnedChannelsHeaderColored"],
		_pindmspinnedchannelsheadercontainer: ["PinDMs", "pinnedChannelsHeaderContainer"],
		_pindmsrecentpinned: ["PinDMs", "recentPinned"],
		_pindmsrecentplaceholder: ["PinDMs", "recentPlaceholder"],
		_pindmsunpinbutton: ["PinDMs", "unpinButton"],
		_pindmsunpinicon: ["PinDMs", "unpinIcon"],
		_readallnotificationsbuttonbutton: ["ReadAllNotificationsButton", "button"],
		_readallnotificationsbuttonframe: ["ReadAllNotificationsButton", "frame"],
		_readallnotificationsbuttoninner: ["ReadAllNotificationsButton", "innerFrame"],
		_serverfoldersdragpreview: ["ServerFolders", "dragPreview"],
		_serverfoldersfoldercontent: ["ServerFolders", "folderContent"],
		_serverfoldersfoldercontentclosed: ["ServerFolders", "folderContentClosed"],
		_serverfoldersfoldercontentisopen: ["ServerFolders", "folderContentIsOpen"],
		_serverfoldersguildplaceholder: ["ServerFolders", "guildPlaceholder"],
		_serverfoldersiconswatch: ["ServerFolders", "iconSwatch"],
		_serverfoldersiconswatchinner: ["ServerFolders", "iconSwatchInner"],
		_serverfoldersiconswatchpreview: ["ServerFolders", "iconSwatchPreview"],
		_serverfoldersiconswatchselected: ["ServerFolders", "iconSwatchSelected"],
		_showimagedetailsdetails: ["ShowImageDetails", "details"],
		_spellcheckerror: ["SpellCheck", "error"],
		_spellcheckoverlay: ["SpellCheck", "overlay"],
		_timedlightdarkmodedategrabber: ["TimedLightDarkMode", "dateGrabber"],
		_timedlightdarkmodetimergrabber: ["TimedLightDarkMode", "timerGrabber"],
		_timedlightdarkmodetimersettings: ["TimedLightDarkMode", "timerSettings"],
		_toproleseverywherebadgestyle: ["TopRolesEverywhere", "badgeStyle"],
		_toproleseverywherechattag: ["TopRolesEverywhere", "chatTag"],
		_toproleseverywheremembertag: ["TopRolesEverywhere", "memberTag"],
		_toproleseverywhererolestyle: ["TopRolesEverywhere", "roleStyle"],
		_toproleseverywheretag: ["TopRolesEverywhere", "tag"],
		_repoauthor: ["BDrepo", "bdaAuthor"],
		_repobutton: ["BDrepo", "bdButton"],
		_repocard: ["BDrepo", "bdAddonCard"],
		_repocheckbox: ["BDrepo", "switchCheckbox"],
		_repocheckboxchecked: ["BDrepo", "switchChecked"],
		_repocheckboxinner: ["BDrepo", "switch"],
		_repocheckboxitem: ["BDrepo", "switchItem"],
		_repocheckboxwrap: ["BDrepo", "switchWrapper"],
		_repocontrols: ["BDrepo", "bdaControls"],
		_repocontrolsbutton: ["BDrepo", "bdaControlsButton"],
		_repodescription: ["BDrepo", "bdaDescription"],
		_repodescriptionwrap: ["BDrepo", "bdaDescriptionWrap"],
		_repoentry: ["BDFDB", "bdaRepoEntry"],
		_repofolderbutton: ["BDrepo", "bdPfbtn"],
		_repofooter: ["BDrepo", "bdaFooter"],
		_repoheader: ["BDrepo", "bdaHeader"],
		_repoheadertitle: ["BDrepo", "bdaHeaderTitle"],
		_repoicon: ["BDrepo", "bdIcon"],
		_repolist: ["BDrepo", "bdaSlist"],
		_repolink: ["BDrepo", "bdaLink"],
		_repolinks: ["BDrepo", "bdaLinks"],
		_reponame: ["BDrepo", "bdaName"],
		_reposettingsbutton: ["BDrepo", "bdaSettingsButton"],
		_reposettingsopen: ["BDrepo", "settingsOpen"],
		_reposettingsclosed: ["BDrepo", "settingsClosed"],
		_reposwitch: ["BDrepo", "bdSwitch"],
		_reposwitchchecked: ["BDrepo", "bdSwitchChecked"],
		_reposwitchinner: ["BDrepo", "bdSwitchInner"],
		_repoupdatebutton: ["BDrepo", "bdUpdatebtn"],
		_repoversion: ["BDrepo", "bdaVersion"],
		accountinfo: ["AccountDetails", "container"],
		accountinfoavatar: ["AccountDetails", "avatar"],
		accountinfoavatarwrapper: ["AccountDetails", "avatarWrapper"],
		accountinfobutton: ["AccountDetailsButtons", "button"],
		accountinfobuttondisabled: ["AccountDetailsButtons", "disabled"],
		accountinfobuttonenabled: ["AccountDetailsButtons", "enabled"],
		accountinfodetails: ["AccountDetails", "usernameContainer"],
		accountinfonametag: ["AccountDetails", "nameTag"],
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
		auditlogoverflowellipsis: ["AuditLog", "overflowEllipsis"],
		auditloguserhook: ["AuditLog", "userHook"],
		authbox: ["AuthBox", "authBox"],
		autocomplete: ["Autocomplete", "autocomplete"],
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
		avatarstatushovered: ["BDFDB", "avatarStatusHovered"],
		avatarwrapper: ["Avatar", "wrapper"],
		backdrop: ["Backdrop", "backdrop"],
		backdropwithlayer: ["Backdrop", "backdropWithLayer"],
		badgebase: ["Badge", "base"],
		badgeicon: ["Badge", "icon"],
		badgeiconbadge: ["Badge", "iconBadge"],
		badgenumberbadge: ["Badge", "numberBadge"],
		badgetextbadge: ["Badge", "textBadge"],
		badgewrapper: ["NotFound", "badgeWrapper"],
		bdfdbdev: ["BDFDB", "dev"],
		bdfdbsupporter: ["BDFDB", "supporter"],
		bold: ["TextStyle", "bold"],
		bottag: ["BotTag", "botTag"],
		bottaginvert: ["BotTag", "botTagInvert"],
		bottagmember: ["Member", "botTag"],
		bottagnametag: ["NameTag", "bot"],
		bottagpx: ["BotTag", "px"],
		bottagregular: ["BotTag", "botTagRegular"],
		bottagrem: ["BotTag", "rem"],
		bottagtext: ["BotTag", "botText"],
		bottagverified: ["BotTag", "botTagVerified"],
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
		callavatarmask: ["CallAvatar", "callAvatarMask"],
		callavatarvideo: ["CallAvatar", "videoAvatar"],
		callavatarvoice: ["CallAvatar", "voiceAvatar"],
		callavatarwrapper: ["CallAvatar", "wrapper"],
		callcurrentcontainer: ["CallCurrent", "wrapper"],
		callcurrentdetails: ["CallDetails", "container"],
		callcurrentvideo: ["Video", "video"],
		callincoming: ["CallIncoming", "incomingCall"],
		callincomingcontainer: ["CallIncoming", "container"],
		callincominginner: ["CallIncomingInner", "incomingCallInner"],
		callmembers: ["CallIncomingInner", "members"],
		callselected: ["CallAvatar", "selected"],
		callvideo: ["CallAvatar", "video"],
		card: ["Card", "card"],
		cardbrand: ["Card", "cardBrand"],
		cardbrandoutline: ["Card", "cardBrandOutline"],
		carddanger: ["Card", "cardDanger"],
		carddangeroutline: ["Card", "cardDangerOutline"],
		carderror: ["CardStatus", "error"],
		cardprimary: ["Card", "cardPrimary"],
		cardprimaryeditable: ["Card", "cardPrimaryEditable"],
		cardprimaryoutline: ["Card", "cardPrimaryOutline"],
		cardprimaryoutlineeditable: ["Card", "cardPrimaryOutlineEditable"],
		cardreset: ["CardStatus", "reset"],
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
		collapsecontainer: ["BDFDB", "collapseContainer"],
		collapsecontainerarrow: ["BDFDB", "collapseContainerArrow"],
		collapsecontainercollapsed: ["BDFDB", "collapseContainerCollapsed"],
		collapsecontainerheader: ["BDFDB", "collapseContainerHeader"],
		collapsecontainerinner: ["BDFDB", "collapseContainerInner"],
		collapsecontainermini: ["BDFDB", "collapseContainerMini"],
		collapsecontainertitle: ["BDFDB", "collapseContainerTitle"],
		colorbase: ["TextColor2", "base"],
		colorbrand: ["TextColor", "colorBrand"],
		colorerror: ["TextColor", "colorError"],
		colormuted: ["TextColor", "colorMuted"],
		colorgreen: ["TextColor", "colorStatusGreen"],
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
		colorpickerwrapper: ["BDFDB", "colorPicker"],
		colorprimary: ["TextColor", "colorHeaderPrimary"],
		colorred: ["TextColor", "colorStatusRed"],
		colorsecondary: ["TextColor", "colorHeaderSecondary"],
		colorselectable: ["TextColor", "selectable"],
		colorstandard: ["TextColor", "colorStandard"],
		coloryellow: ["TextColor", "colorStatusYellow"],
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
		dmchannel: ["PrivateChannel", "channel"],
		dmchannelactivity: ["PrivateChannel", "activity"],
		dmchannelactivityemoji: ["PrivateChannel", "activityEmoji"],
		dmchannelactivitytext: ["PrivateChannel", "activityText"],
		dmchannelclose: ["PrivateChannel", "closeButton"],
		dmchannelheadercontainer: ["PrivateChannelListScroller", "privateChannelsHeaderContainer"],
		dmchannelheadertext: ["PrivateChannelListScroller", "headerText"],
		dmchannels: ["PrivateChannelList", "privateChannels"],
		dmchannelsempty: ["PrivateChannelListScroller", "empty"],
		dmchannelsscroller: ["PrivateChannelListScroller", "scroller"],
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
		embediframe: ["Embed", "embedIframe"],
		embedimage: ["Embed", "embedImage"],
		embedlink: ["Embed", "embedLink"],
		embedmargin: ["Embed", "embedMargin"],
		embedmedia: ["Embed", "embedMedia"],
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
		emojiinput: ["EmojiInput", "input"],
		emojiinputbutton: ["EmojiInput", "emojiButton"],
		emojiinputbuttoncontainer: ["EmojiInput", "emojiButtonContainer"],
		emojiinputclearbutton: ["EmojiInput", "clearButton"],
		emojiinputclearicon: ["EmojiInput", "clearIcon"],
		emojiinputcontainer: ["EmojiInput", "inputContainer"],
		emojipicker: ["EmojiPicker", "emojiPicker"],
		emojipickerbutton: ["Reactions", "reactionBtn"],
		emojipickercategories: ["EmojiPicker", "categories"],
		emojipickercategory: ["EmojiPicker", "category"],
		emojipickerdisabled: ["EmojiPicker", "disabled"],
		emojipickerdiversityselector: ["EmojiPicker", "diversitySelector"],
		emojipickeremojiitem: ["EmojiPicker", "emojiItem"],
		emojipickerheader: ["EmojiPicker", "header"],
		emojipickeritem: ["EmojiPicker", "item"],
		emojipickerpopout: ["EmojiPicker", "popout"],
		emojipickerpremiumpromo: ["EmojiPicker", "premiumPromo"],
		emojipickerpremiumpromoclose: ["EmojiPicker", "premiumPromoClose"],
		emojipickerpremiumpromodescription: ["EmojiPicker", "premiumPromoDescription"],
		emojipickerpremiumpromoimage: ["EmojiPicker", "premiumPromoImage"],
		emojipickerpremiumpromotitle: ["EmojiPicker", "premiumPromoTitle"],
		emojipickerrow: ["EmojiPicker", "row"],
		emojipickersearchbar: ["EmojiPicker", "searchBar"],
		emojipickerscroller: ["EmojiPicker", "scroller"],
		emojipickerscrollerwrap: ["EmojiPicker", "scrollerWrap"],
		emojipickerselected: ["EmojiPicker", "selected"],
		emojipickerspriteitem: ["EmojiPicker", "spriteItem"],
		emojipickerstickyheader: ["EmojiPicker", "stickyHeader"],
		expressionpicker: ["ExpressionPicker", "contentWrapper"],
		expressionpickernav: ["ExpressionPicker", "nav"],
		expressionpickernavbutton: ["ExpressionPicker", "navButton"],
		expressionpickernavbuttonactive: ["ExpressionPicker", "navButtonActive"],
		expressionpickernavitem: ["ExpressionPicker", "navItem"],
		expressionpickernavlist: ["ExpressionPicker", "navList"],
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
		game: ["Game", "game"],
		gameicon: ["GameIcon", "gameIcon"],
		gameiconlarge: ["GameIcon", "large"],
		gameiconmedium: ["GameIcon", "medium"],
		gameiconsmall: ["GameIcon", "small"],
		gameiconxsmall: ["GameIcon", "xsmall"],
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
		goliveactions: ["GoLiveDetails", "actions"],
		golivebody: ["GoLiveDetails", "body"],
		goliveclickablegamewrapper: ["GoLiveDetails", "clickableGameWrapper"],
		golivegameicon: ["GoLiveDetails", "gameIcon"],
		golivegamename: ["GoLiveDetails", "gameName"],
		golivegamewrapper: ["GoLiveDetails", "gameWrapper"],
		goliveinfo: ["GoLiveDetails", "info"],
		golivepanel: ["GoLiveDetails", "panel"],
		guild: ["BDFDB", "guild"],
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
		guildfolderexpandedbackground: ["GuildFolder", "expandedFolderBackground"],
		guildfolderexpandedbackgroundcollapsed: ["GuildFolder", "collapsed"],
		guildfolderexpandedbackgroundhover: ["GuildFolder", "hover"],
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
		guildiconbadge: ["GuildsItems", "iconBadge"],
		guildiconchildwrapper: ["GuildIcon", "childWrapper"],
		guildiconselected: ["GuildIcon", "selected"],
		guildiconwrapper: ["GuildIcon", "wrapper"],
		guildinner: ["Guild", "wrapper"],
		guildinnerwrapper: ["GuildsItems", "listItemWrapper"],
		guildlowerbadge: ["Guild", "lowerBadge"],
		guildlowerleftbadge: ["BDFDB", "guildLowerLeftBadge"],
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
		guildsettingsemojicard: ["GuildSettingsEmoji", "emojiRow"],
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
		guildtutorialcontainer: ["GuildsItems", "tutorialContainer"],
		guildupperbadge: ["Guild", "upperBadge"],
		guildupperleftbadge: ["BDFDB", "guildUpperLeftBadge"],
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
		hotkeyresetbutton: ["BDFDB", "hotkeyResetButton"],
		hotkeyshadowpulse: ["HotKeyRecorder", "shadowPulse"],
		hotkeytext: ["HotKeyRecorder", "text"],
		hotkeywrapper: ["BDFDB", "hotkeyWrapper"],
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
		itemlayerdisabledpointerevents: ["ItemLayerContainer", "disabledPointerEvents"],
		input: ["Input", "input"],
		inputdefault: ["Input", "inputDefault"],
		inputdisabled: ["Input", "disabled"],
		inputeditable: ["Input", "editable"],
		inputerror: ["Input", "error"],
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
		invitebuttonfornonmember: ["GuildInvite", "buttonForNonMember"],
		invitebuttonresolving: ["GuildInvite", "invite-button-resolving"],
		invitebuttonsize: ["GuildInvite", "buttonSize"],
		invitechannel: ["GuildInvite", "channel"],
		invitechannelicon: ["GuildInvite", "channelIcon"],
		invitechannelname: ["GuildInvite", "channelName"],
		invitecontent: ["GuildInvite", "content"],
		invitecount: ["GuildInvite", "count"],
		invitecursordefault: ["GuildInvite", "cursorDefault"],
		invitedestination: ["GuildInvite", "inviteDestination"],
		invitedestinationexpired: ["GuildInvite", "inviteDestinationExpired"],
		invitedestinationjoined: ["GuildInvite", "inviteDestinationJoined"],
		inviteguildbadge: ["GuildInvite", "guildBadge"],
		inviteguilddetail: ["GuildInvite", "guildDetail"],
		inviteguildicon: ["GuildInvite", "guildIcon"],
		inviteguildiconexpired: ["GuildInvite", "guildIconExpired"],
		inviteguildiconimage: ["GuildInvite", "guildIconImage"],
		inviteguildiconimagejoined: ["GuildInvite", "guildIconImageJoined"],
		inviteguildiconjoined: ["GuildInvite", "guildIconJoined"],
		inviteguildinfo: ["GuildInvite", "guildInfo"],
		inviteguildname: ["GuildInvite", "guildName"],
		inviteguildnamewrapper: ["GuildInvite", "guildNameWrapper"],
		inviteheader: ["GuildInvite", "header"],
		invitemodal: ["InviteModal", "modal"],
		invitemodalinviterow: ["InviteModal", "inviteRow"],
		invitemodalinviterowname: ["InviteModal", "inviteRowName"],
		invitemodalwrapper: ["InviteModal", "wrapper"],
		invitesplash: ["GuildInvite", "inviteSplash"],
		invitesplashimage: ["GuildInvite", "inviteSplashImage"],
		invitesplashimageloaded: ["GuildInvite", "inviteSplashImageLoaded"],
		inviteresolving: ["GuildInvite", "resolving"],
		inviteresolvingbackground: ["GuildInvite", "resolvingBackground"],
		invitestatus: ["GuildInvite", "status"],
		invitestatuscounts: ["GuildInvite", "statusCounts"],
		invitestatusoffline: ["GuildInvite", "statusOffline"],
		invitestatusonline: ["GuildInvite", "statusOnline"],
		inviteuserselectnone: ["GuildInvite", "userSelectNone"],
		italics: ["TextStyle", "italics"],
		justifycenter: ["Flex", "justifyCenter"],
		justifyend: ["Flex", "justifyEnd"],
		justifystart: ["Flex", "justifyStart"],
		layermodal: ["LayerModal", "root"],
		layermodallarge: ["LayerModal", "large"],
		layermodalmedium: ["LayerModal", "medium"],
		layermodalsmall: ["LayerModal", "small"],
		layer: ["Layers", "layer"],
		layerbase: ["Layers", "baseLayer"],
		layers: ["Layers", "layers"],
		layersbg: ["Layers", "bg"],
		linethrough: ["TextStyle", "strikethrough"],
		listavatar: ["UserProfile", "listAvatar"],
		listdiscriminator: ["UserProfile", "listDiscriminator"],
		listname: ["UserProfile", "listName"],
		listrow: ["UserProfile", "listRow"],
		listrowcontent: ["UserProfile", "listRowContent"],
		listscroller: ["UserProfile", "listScroller"],
		livetag: ["LiveTag", "live"],
		livetaggrey: ["LiveTag", "grey"],
		livetaglarge: ["LiveTag", "liveLarge"],
		livetagsmall: ["LiveTag", "liveSmall"],
		loadingicon: ["BDFDB", "loadingIcon"],
		loadingiconwrapper: ["BDFDB", "loadingIconWrapper"],
		loadingscreen: ["LoadingScreen", "container"],
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
		member: ["Member", "member"],
		memberactivity: ["Member", "activity"],
		membericon: ["Member", "icon"],
		memberoffline: ["Member", "offline"],
		memberownericon: ["Member", "ownerIcon"],
		memberpremiumicon: ["Member", "premiumIcon"],
		members: ["MembersWrap", "members"],
		membersgroup: ["MembersWrap", "membersGroup"],
		memberswrap: ["MembersWrap", "membersWrap"],
		memberusername: ["Member", "roleColor"],
		mention: ["NotFound", "mention"],
		mentioninteractive: ["NotFound", "mentionInteractive"],
		mentionwrapper: ["NotFound", "mentionWrapper"],
		message: ["Message", "message"],
		messageaccessory: ["MessageAccessory", "container"],
		messageavatar: ["MessageBody", "avatar"],
		messagebackgroundflash: ["Message", "backgroundFlash"],
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
		messagebeforegroup: ["Message", "beforeGroup"],
		messageblockedaction: ["MessageBlocked", "blockedAction"],
		messageblockedcontainer: ["MessageBlocked", "container"],
		messageblockedexpanded: ["MessageBlocked", "expanded"],
		messageblockedicon: ["MessageBlocked", "blockedIcon"],
		messageblockedsystemmessage: ["MessageBlocked", "blockedSystemMessage"],
		messageblockedtext: ["MessageBlocked", "blockedMessageText"],
		messageblockquotecontainer: ["MessageMarkup", "blockquoteContainer"],
		messageblockquotedivider: ["MessageMarkup", "blockquoteDivider"],
		messagebottag: ["MessageBody", "botTag"],
		messagebottagcompact: ["MessageBody", "botTagCompact"],
		messagebottagcozy: ["MessageBody", "botTagCozy"],
		messagebuttoncontainer: ["MessageBody", "buttonContainer"],
		messagebuttons: ["Message", "buttons"],
		messagechanneltextarea: ["Message", "channelTextArea"],
		messagecompact: ["MessageBody", "compact"],
		messagecontents: ["MessageBody", "contents"],
		messagecozy: ["MessageBody", "cozy"],
		messagecozymessage: ["Message", "cozyMessage"],
		messagedisableinteraction: ["Message", "disableInteraction"],
		messagedivider: ["Message", "divider"],
		messagedividerhascontent: ["Message", "hasContent"],
		messageedited: ["MessageBody", "edited"],
		messagegroupstart: ["Message", "groupStart"],
		messagegroupblocked: ["MessageElements", "messageGroupBlocked"],
		messagegroupblockedbtn: ["MessageElements", "messageGroupBlockedBtn"],
		messagegroupblockedrevealed: ["MessageElements", "revealed"],
		messageheader: ["MessageBody", "header"],
		messagelocalbot: ["Message", "localBot"],
		messagelocalbotoperations: ["MessageLocalBot", "localBotMessage"],
		messagemarkup: ["MessageMarkup", "markup"],
		messagemarkupcompact: ["MessageBody", "compact"],
		messagemarkupcontent: ["MessageBody", "messageContent"],
		messagemarkupcozy: ["MessageBody", "cozy"],
		messagemarkupisfailed: ["MessageBody", "isFailed"],
		messagemarkupissending: ["MessageBody", "isSending"],
		messagemarkuprtl: ["MessageBody", "markupRtl"],
		messagementioned: ["Message", "mentioned"],
		messageoperations: ["MessageOperations", "operations"],
		messageselected: ["Message", "selected"],
		messages: ["MessagesWrap", "messages"],
		messagesdivider: ["MessagesWrap", "divider"],
		messagespopout: ["MessagesPopout", "messagesPopout"],
		messagespopoutactionbuttons: ["MessagesPopout", "actionButtons"],
		messagespopoutbody: ["MessagesPopout", "body"],
		messagespopoutbottom: ["MessagesPopout", "bottom"],
		messagespopoutbutton: ["MessagesPopoutButtons", "button"],
		messagespopoutbuttonsecondary: ["MessagesPopoutButtons", "secondary"],
		messagespopoutbuttontertiary: ["MessagesPopoutButtons", "tertiary"],
		messagespopoutchannelname: ["MessagesPopout", "channelName"],
		messagespopoutchannelseparator: ["MessagesPopout", "channelSeparator"],
		messagespopoutclosebutton: ["MessagesPopout", "closeIcon"],
		messagespopoutemptyplaceholder: ["MessagesPopout", "emptyPlaceholder"],
		messagespopoutfooter: ["MessagesPopout", "footer"],
		messagespopoutguildname: ["MessagesPopout", "guildName"],
		messagespopoutgroupcozy: ["MessagesPopout", "messageGroupCozy"],
		messagespopoutgroupwrapper: ["MessagesPopout", "messageGroupWrapper"],
		messagespopouthasmore: ["MessagesPopout", "hasMore"],
		messagespopouthasmorebutton: ["MessagesPopout", "hasMoreButton"],
		messagespopoutheader: ["MessagesPopout", "header"],
		messagespopoutimage: ["MessagesPopout", "image"],
		messagespopoutjumpbutton: ["MessagesPopout", "jumpButton"],
		messagespopoutloading: ["MessagesPopout", "loading"],
		messagespopoutloadingmore: ["MessagesPopout", "loadingMore"],
		messagespopoutloadingplaceholder: ["MessagesPopout", "loadingPlaceholder"],
		messagespopoutscroller: ["MessagesPopout", "scroller"],
		messagespopoutscrollingfooterwrap: ["MessagesPopout", "scrollingFooterWrap"],
		messagespopoutspinner: ["MessagesPopout", "spinner"],
		messagespopouttabbar: ["MessagesPopoutTabBar", "tabBar"],
		messagespopouttabbarheader: ["MessagesPopoutTabBar", "header"],
		messagespopouttabbartab: ["MessagesPopoutTabBar", "tab"],
		messagespopouttabbartabactive: ["MessagesPopoutTabBar", "active"],
		messagespopouttitle: ["MessagesPopout", "title"],
		messagespopoutvisible: ["MessagesPopout", "visible"],
		messagespopoutwrap: ["MessagesPopout", "messagesPopoutWrap"],
		messagesscroller: ["MessagesWrap", "scroller"],
		messagesscrollerinner: ["MessagesWrap", "scrollerInner"],
		messagesscrollerwrapper: ["MessagesWrap", "scrollerWrap"],
		messageswelcomemessage: ["MessagesWelcome", "welcomeMessage"],
		messageswelcomemessageheader: ["MessagesWelcome", "h1"],
		messageswrapper: ["MessagesWrap", "messagesWrapper"],
		messageswrapperplaceholder: ["MessagesWrap", "placeholder"],
		messagesystem: ["Message", "systemMessage"],
		messagesystemaccessories: ["MessageBody", "systemMessageAccessories"],
		messagesystemcontainer: ["MessageSystem", "container"],
		messagesystemcontent: ["MessageSystem", "content"],
		messagesystemicon: ["MessageSystem", "icon"],
		messagesystemiconcontainer: ["MessageSystem", "iconContainer"],
		messagesystemiconsize: ["MessageSystem", "iconSize"],
		messagetimedivider: ["MessageDivider", "divider"],
		messagetimedividercontent: ["MessageDivider", "content"],
		messagetimedividerhascontent: ["MessageDivider", "hasContent"],
		messagetimedividerisunread: ["MessageDivider", "isUnread"],
		messagetimedividerunreadpill: ["MessageDivider", "unreadPill"],
		messagetimedividerunreadpillcap: ["MessageDivider", "unreadPillCap"],
		messagetimedividerunreadpillcapstroke: ["MessageDivider", "unreadPillCapStroke"],
		messagetimestampasiancompact: ["MessageBody", "asianCompactTimeStamp"],
		messagetimestamp: ["MessageBody", "timestamp"],
		messagetimestampalt: ["MessageBody", "alt"],
		messagetimestamplatin12compact: ["MessageBody", "latin12CompactTimeStamp"],
		messagetimestamplatin24compact: ["MessageBody", "latin24CompactTimeStamp"],
		messagetimestampseparator: ["MessageBody", "separator"],
		messagetimestampsystem: ["MessageSystem", "timestamp"],
		messagetimestamptooltip: ["MessageBody", "timestampTooltip"],
		messagetimestampvisibleonhover: ["MessageBody", "timestampVisibleOnHover"],
		messagetoolbar: ["MessageToolbar", "container"],
		messagetoolbarbutton: ["MessageToolbarItems", "button"],
		messagetoolbarbuttondisabled: ["MessageToolbarItems", "disabled"],
		messagetoolbarbuttonselected: ["MessageToolbarItems", "selected"],
		messagetoolbaricon: ["MessageToolbar", "icon"],
		messagetoolbarinner: ["MessageToolbarItems", "wrapper"],
		messagetoolbarisheader: ["MessageToolbar", "isHeader"],
		messagetoolbarseparator: ["MessageToolbarItems", "separator"],
		messageuploadcancel: ["MessageFile", "cancelButton"],
		messageusername: ["MessageBody", "username"],
		messagewrapper: ["MessageBody", "wrapper"],
		messagezalgo: ["MessageBody", "zalgo"],
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
		namecontainerchildren: ["NameContainer", "children"],
		namecontainerclickable: ["NameContainer", "clickable"],
		namecontainercontent: ["NameContainer", "content"],
		namecontainerlayout: ["NameContainer", "layout"],
		namecontainername: ["NameContainer", "name"],
		namecontainernamecontainer: ["NotFound", "nameContainerNameContainer"],
		namecontainernamewrapper: ["NameContainer", "nameAndDecorators"],
		namecontainerselected: ["NameContainer", "selected"],
		namecontainersubtext: ["NameContainer", "subText"],
		nametag: ["NameTag", "nameTag"],
		nitrostore: ["NitroStore", "applicationStore"],
		nochannel: ["ChatWindow", "noChannel"],
		notice: ["Notice", "notice"],
		noticebrand: ["Notice", "noticeBrand"],
		noticebutton: ["Notice", "button"],
		noticedanger: ["Notice", "noticeDanger"],
		noticedefault: ["Notice", "noticeDefault"],
		noticedownload: ["Notice", "noticeDownload"],
		noticedismiss: ["Notice", "dismiss"],
		noticefacebook: ["Notice", "noticeFacebook"],
		noticeicon: ["Notice", "icon"],
		noticeiconandroid: ["Notice", "iconAndroid"],
		noticeiconapple: ["Notice", "iconApple"],
		noticeiconwindows: ["Notice", "iconWindows"],
		noticeinfo: ["Notice", "noticeInfo"],
		noticenotification: ["Notice", "noticeNotification"],
		noticeplatformicon: ["Notice", "platformIcon"],
		noticepremium: ["Notice", "noticePremium"],
		noticepremiumaction: ["Notice", "premiumAction"],
		noticepremiumlogo: ["Notice", "premiumLogo"],
		noticepremiumtext: ["Notice", "premiumText"],
		noticepremiumtier1: ["Notice", "noticePremiumTier1"],
		noticepremiumtier2: ["Notice", "noticePremiumTier2"],
		noticerichpresence: ["Notice", "noticeRichPresence"],
		noticespotify: ["Notice", "noticeSpotify"],
		noticestreamer: ["Notice", "noticeStreamerMode"],
		noticesuccess: ["Notice", "noticeSuccess"],
		noticesurvey: ["Notice", "noticeSurvey"],
		noticewrapper: ["BDFDB", "noticeWrapper"],
		note: ["SettingsItems", "note"],
		nowrap: ["Flex", "noWrap"],
		overflowellipsis: ["BDFDB", "overflowEllipsis"],
		peoples: ["Peoples", "container"],
		peoplesbadge: ["Peoples", "badge"],
		peoplesnowplayingcolumn: ["Peoples", "nowPlayingColumn"],
		peoplespeoplecolumn: ["Peoples", "peopleColumn"],
		peoplestabbar: ["Peoples", "tabBar"],
		pictureinpicture: ["PictureInPicture", "pictureInPicture"],
		pictureinpicturewindow: ["PictureInPicture", "pictureInPictureWindow"],
		popout: ["Popout", "popout"],
		popoutarrowalignmentmiddle: ["Popout", "arrowAlignmentMiddle"],
		popoutarrowalignmenttop: ["Popout", "arrowAlignmentTop"],
		popoutbottom: ["Popout", "popoutBottom"],
		popoutbottomleft: ["Popout", "popoutBottomLeft"],
		popoutbottomright: ["Popout", "popoutBottomRight"],
		popoutinvert: ["Popout", "popoutInvert"],
		popoutleft: ["Popout", "popoutLeft"],
		popoutnoarrow: ["Popout", "noArrow"],
		popoutnoshadow: ["Popout", "noShadow"],
		popoutright: ["Popout", "popoutRight"],
		popouts: ["Popout", "popouts"],
		popoutthemedpopout: ["BDFDB", "themedPopout"],
		popouttop: ["Popout", "popoutTop"],
		popouttopleft: ["Popout", "popoutTopLeft"],
		popouttopright: ["Popout", "popoutTopRight"],
		popoutwrapper: ["BDFDB", "popoutWrapper"],
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
		quickswitchresulticon: ["QuickSwitch", "icon"],
		quickswitchresulticoncontainer: ["QuickSwitch", "iconContainer"],
		quickswitchresultmatch: ["QuickSwitch", "match"],
		quickswitchresultmisccontainer: ["QuickSwitchWrap", "miscContainer"],
		quickswitchresultname: ["QuickSwitch", "name"],
		quickswitchresultnote: ["QuickSwitch", "note"],
		quickswitchresultusername: ["QuickSwitch", "username"],
		recentmentionsclosebutton: ["RecentMentions", "closeButton"],
		recentmentionsfilterpopout: ["RecentMentions", "recentMentionsFilterPopout"],
		recentmentionsheader: ["RecentMentions", "header"],
		recentmentionsjumpbutton: ["RecentMentions", "jumpButton"],
		recentmentionsmentionfilter: ["RecentMentions", "mentionFilter"],
		recentmentionsmentionfilterlabel: ["RecentMentions", "label"],
		recentmentionsmentionfiltervalue: ["RecentMentions", "value"],
		recentmentionspopout: ["RecentMentions", "recentMentionsPopout"],
		recentmentionstabbar: ["RecentMentions", "tabBar"],
		recentmentionstabbaritem: ["RecentMentions", "tabBarItem"],
		recentmentionstabbarwrapper: ["RecentMentions", "headerTabBarWrapper"],
		scrollbar: ["Scrollbar", "scrollbar"],
		scrollbardefault: ["Scrollbar", "scrollbarDefault"],
		scrollbarghost: ["Scrollbar", "scrollbarGhost"],
		scrollbarghosthairline: ["Scrollbar", "scrollbarGhostHairline"],
		scroller: ["Scroller", "scroller"],
		scrollerfade: ["Scroller", "scrollerFade"],
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
		searchpopoutddmadddiscordtag: ["DmAddPopoutItems", "discordTag"],
		searchpopoutddmaddfriend: ["DmAddPopoutItems", "friend"],
		searchpopoutddmaddfriendwrapper: ["DmAddPopoutItems", "friendWrapper"],
		searchpopoutddmaddnickname: ["DmAddPopoutItems", "nickname"],
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
		searchresultsafter: ["SearchResults", "after"],
		searchresultsalt: ["SearchResults", "alt"],
		searchresultsbefore: ["SearchResults", "before"],
		searchresultschannelname: ["SearchResults", "channelName"],
		searchresultschannelSeparator: ["SearchResults", "channelSeparator"],
		searchresultsexpanded: ["SearchResults", "expanded"],
		searchresultsgroupcozy: ["SearchResults", "messageGroupCozy"],
		searchresultshit: ["SearchResults", "hit"],
		searchresultspagination: ["SearchResults", "pagination"],
		searchresultspaginationbutton: ["SearchResults", "paginationButton"],
		searchresultspaginationdisabled: ["SearchResults", "disabled"],
		searchresultspaginationicon: ["SearchResults", "icon"],
		searchresultssearchheader: ["SearchResults", "searchHeader"],
		searchresultswrap: ["SearchResults", "searchResultsWrap"],
		select: ["NotFound", "select"],
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
		selectwrapper: ["BDFDB", "selectWrapper"],
		settingsclosebutton: ["SettingsCloseButton", "closeButton"],
		settingsclosebuttoncontainer: ["SettingsCloseButton", "container"],
		settingsguild: ["BDFDB", "settingsGuild"],
		settingsguilddisabled: ["BDFDB", "settingsGuildDisabled"],
		settingsheader: ["Item", "header"],
		settingsitem: ["Item", "item"],
		settingsitemdragged: ["ItemRole", "dragged"],
		settingsitemdlock: ["ItemRole", "lock"],
		settingsitemrole: ["ItemRole", "role"],
		settingsitemroleinner: ["ItemRole", "roleInner"],
		settingsitemselected: ["Item", "selected"],
		settingsitemthemed: ["Item", "themed"],
		settingsPanel: ["BDFDB", "settingsPanel"],
		settingspanelinner: ["BDFDB", "settingsPanelInner"],
		settingspanellist: ["BDFDB", "settingsPanelList"],
		settingspaneltitle: ["BDFDB", "settingsPanelTitle"],
		settingsseparator: ["Item", "separator"],
		settingstableheader: ["SettingsTable", "header"],
		settingstableheadername: ["SettingsTable", "headerName"],
		settingstableheaderoption: ["SettingsTable", "headerOption"],
		settingstableheaders: ["BDFDB", "settingsTableHeaders"],
		settingstableheadervertical: ["BDFDB", "settingsTableHeaderVertical"],
		settingstablecard: ["BDFDB", "settingsTableCard"],
		settingstablecardconfigs: ["BDFDB", "settingsTableCardConfigs"],
		settingstablecardlabel: ["BDFDB", "settingsTableCardLabel"],
		settingstablelist: ["BDFDB", "settingsTableList"],
		sidebarregion: ["SettingsWindow", "sidebarRegion"],
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
		spoilerembed: ["SpoilerEmbed", "spoiler"],
		spoilerembedhidden: ["SpoilerEmbed", "hiddenSpoilers"],
		spoilerembedinline: ["SpoilerEmbed", "inline"],
		spoilerhidden: ["Spoiler", "hidden"],
		spoilertext: ["Spoiler", "spoilerText"],
		spoilerwarning: ["Spoiler", "spoilerWarning"],
		splashbackground: ["NotFound", "splashBackground"],
		standardsidebarview: ["SettingsWindow", "standardSidebarView"],
		strikethrough: ["TextStyle", "strikeThrough"],
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
		textareaattachbutton: ["ChannelTextAreaAttachButton", "attachButton"],
		textareaattachbuttoninner: ["ChannelTextAreaAttachButton", "attachButtonInner"],
		textareaattachbuttonplus: ["ChannelTextAreaAttachButton", "attachButtonPlus"],
		textareaattachwrapper: ["ChannelTextAreaAttachButton", "attachWrapper"],
		textareabutton: ["ChannelTextAreaButton", "button"],
		textareabuttonactive: ["ChannelTextAreaButton", "active"],
		textareabuttonpulse: ["ChannelTextAreaButton", "pulseButton"],
		textareabuttonwrapper: ["ChannelTextAreaButton", "buttonWrapper"],
		textareacharcounter: ["ChannelTextAreaCharCounter", "characterCount"],
		textareacharcountererror: ["ChannelTextAreaCharCounter", "error"],
		textareadisabled: ["ChannelTextArea", "textAreaDisabled"],
		textareafontsize12padding: ["ChannelTextArea", "fontSize12Padding"],
		textareafontsize14padding: ["ChannelTextArea", "fontSize14Padding"],
		textareafontsize15padding: ["ChannelTextArea", "fontSize15Padding"],
		textareafontsize16padding: ["ChannelTextArea", "fontSize16Padding"],
		textareafontsize18padding: ["ChannelTextArea", "fontSize18Padding"],
		textareafontsize20padding: ["ChannelTextArea", "fontSize20Padding"],
		textareafontsize24padding: ["ChannelTextArea", "fontSize24Padding"],
		textareahasautocomplete: ["ChannelTextArea", "hasAutocomplete"],
		textareaicon: ["ChannelTextAreaButton", "icon"],
		textareaiconpulse: ["ChannelTextAreaButton", "pulseIcon"],
		textareainner: ["ChannelTextArea", "inner"],
		textareainnerdisabled: ["ChannelTextArea", "innerDisabled"],
		textareapickerbutton: ["ChannelTextArea", "button"],
		textareapickerbuttoncontainer: ["ChannelTextArea", "buttonContainer"],
		textareapickerbuttons: ["ChannelTextArea", "buttons"],
		textareascrollablecontainer: ["ChannelTextArea", "scrollableContainer"],
		textareaslate: ["ChannelTextArea", "textAreaSlate"],
		textareaslatemarkup: ["ChannelTextAreaSlate", "slateTextArea"],
		textareaslatecontainer: ["ChannelTextAreaSlate", "slateContainer"],
		textareaslateplaceholder: ["ChannelTextAreaSlate", "placeholder"],
		textareauploadinput: ["ChannelTextAreaAttachButton", "uploadInput"],
		textareawebkit: ["ChannelTextArea", "webkit"],
		textareawrapall: ["ChannelTextArea", "channelTextArea"],
		textareawrapchat: ["ChatWindow", "channelTextArea"],
		textareawrapdisabled: ["ChannelTextArea", "channelTextAreaDisabled"],
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
		titlesize18: ["Title", "size18"],
		tooltip: ["Tooltip", "tooltip"],
		tooltipactivityicon: ["TooltipGuild", "activityIcon"],
		tooltipblack: ["Tooltip", "tooltipBlack"],
		tooltipbottom: ["Tooltip", "tooltipBottom"],
		tooltipbrand: ["Tooltip", "tooltipBrand"],
		tooltipcustom: ["BDFDB", "tooltipCustom"],
		tooltipgreen: ["Tooltip", "tooltipGreen"],
		tooltipgrey: ["Tooltip", "tooltipGrey"],
		tooltipguildnametext: ["TooltipGuild", "guildNameText"],
		tooltipguildnametextlimitedsize: ["TooltipGuild", "guildNameTextLimitedSize"],
		tooltipleft: ["Tooltip", "tooltipLeft"],
		tooltiplistitem: ["GuildsItems", "listItemTooltip"],
		tooltippointer: ["Tooltip", "tooltipPointer"],
		tooltipred: ["Tooltip", "tooltipRed"],
		tooltipright: ["Tooltip", "tooltipRight"],
		tooltiprow: ["TooltipGuild", "row"],
		tooltiprowguildname: ["TooltipGuild", "rowGuildName"],
		tooltiprowicon: ["TooltipGuild", "rowIcon"],
		tooltiptop: ["Tooltip", "tooltipTop"],
		tooltipyellow: ["Tooltip", "tooltipYellow"],
		typing: ["Typing", "typing"],
		typingcooldownwrapper: ["Typing", "cooldownWrapper"],
		typingtext: ["Typing", "text"],
		underline: ["TextStyle", "underline"],
		unreadbar: ["UnreadBar", "bar"],
		unreadbaractive: ["UnreadBar", "active"],
		unreadbarcontainer: ["UnreadBar", "container"],
		unreadbaricon: ["UnreadBar", "icon"],
		unreadbarmention: ["UnreadBar", "mention"],
		unreadbartext: ["UnreadBar", "text"],
		unreadbarunread: ["UnreadBar", "unread"],
		uploadmodal: ["UploadModal", "uploadModal"],
		userinfo: ["UserInfo", "userInfo"],
		userinfoavatar: ["UserInfo", "avatar"],
		userinfodiscordtag: ["UserInfo", "discordTag"],
		userinfodiscriminator: ["UserInfo", "discriminator"],
		userinfohovered: ["UserInfo", "hovered"],
		userinfosubtext: ["UserInfo", "subtext"],
		userinfotext: ["UserInfo", "text"],
		userinfousername: ["UserInfo", "username"],
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
		voicedetailschannel: ["VoiceDetails", "channel"],
		voicedetailscustomstatuscontainer: ["VoiceDetails", "customStatusContainer"],
		voicedetailshotspot: ["VoiceDetails", "hotspot"],
		voicedetailsinactive: ["VoiceDetailsPing", "inactive"],
		voicedetailsinner: ["VoiceDetails", "inner"],
		voicedetailslabelwrapper: ["VoiceDetailsPing", "labelWrapper"],
		voicedetailsping: ["VoiceDetailsPing", "ping"],
		voicedetailspingforeground: ["VoiceDetailsPing", "pingForeground"],
		voicedetailsqualityaverage: ["VoiceDetailsPing", "rtcConnectionQualityAverage"],
		voicedetailsqualitybad: ["VoiceDetailsPing", "rtcConnectionQualityBad"],
		voicedetailsqualityfine: ["VoiceDetailsPing", "rtcConnectionQualityFine"],
		voicedetailsstatus: ["VoiceDetailsPing", "rtcConnectionStatus"],
		voicedetailsstatusconnected: ["VoiceDetailsPing", "rtcConnectionStatusConnected"],
		voicedetailsstatusconnecting: ["VoiceDetailsPing", "rtcConnectionStatusConnecting"],
		voicedetailsstatuserror: ["VoiceDetailsPing", "rtcConnectionStatusError"],
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
		wrap: ["Flex", "wrap"],
		wrapreverse: ["Flex", "wrapReverse"]
	};
	BDFDB.DiscordClasses = Object.assign({}, DiscordClasses);

	InternalBDFDB.getDiscordClass = (item, selector) => {
		let className = DiscordClassModules.BDFDB.BDFDBundefined;
		if (DiscordClasses[item] === undefined) {
			BDFDB.LogUtils.warn(item + " not found in DiscordClasses");
			return className;
		} 
		else if (!BDFDB.ArrayUtils.is(DiscordClasses[item]) || DiscordClasses[item].length != 2) {
			BDFDB.LogUtils.warn(item + " is not an Array of Length 2 in DiscordClasses");
			return className;
		}
		else if (DiscordClassModules[DiscordClasses[item][0]] === undefined) {
			BDFDB.LogUtils.warn(DiscordClasses[item][0] + " not found in DiscordClassModules");
			return className;
		}
		else if (DiscordClassModules[DiscordClasses[item][0]][DiscordClasses[item][1]] === undefined) {
			BDFDB.LogUtils.warn(DiscordClasses[item][1] + " not found in " + DiscordClasses[item][0] + " in DiscordClassModules");
			return className;
		}
		else {
			className = DiscordClassModules[DiscordClasses[item][0]][DiscordClasses[item][1]];
			if (selector) {
				className = className.split(" ").filter(n => n.indexOf("da-") != 0).join(selector ? "." : " ");
				className = className || DiscordClassModules.BDFDB.BDFDBundefined;
			}
			return className;
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
			let className = InternalBDFDB.getDiscordClass(item, true);
			return (className.indexOf("#") == 0 ? "" : ".") + className;
		}
	});
	BDFDB.dotCNS = new Proxy(DiscordClasses, {
		get: function (list, item) {
			let className = InternalBDFDB.getDiscordClass(item, true);
			return (className.indexOf("#") == 0 ? "" : ".") + className + " ";
		}
	});
	BDFDB.dotCNC = new Proxy(DiscordClasses, {
		get: function (list, item) {
			let className = InternalBDFDB.getDiscordClass(item, true);
			return (className.indexOf("#") == 0 ? "" : ".") + className + ",";
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
		"$discord": 	{name:"Discord (English))",			id:"en",		ownlang:"English",						integrated:false,		dic:false},
		"af":			{name:"Afrikaans",					id:"af",		ownlang:"Afrikaans",					integrated:false,		dic:true},
		"sq":			{name:"Albanian",					id:"sq",		ownlang:"Shqiptar",						integrated:false,		dic:false},
		"am":			{name:"Amharic",					id:"am",		ownlang:"አማርኛ",						integrated:false,		dic:false},
		"ar":			{name:"Arabic",						id:"ar",		ownlang:"اللغة العربية",				integrated:false,		dic:false},
		"hy":			{name:"Armenian",					id:"hy",		ownlang:"Հայերեն",						integrated:false,		dic:false},
		"az":			{name:"Azerbaijani",				id:"az",		ownlang:"آذربایجان دیلی",				integrated:false,		dic:false},
		"ba":			{name:"Bashkir",					id:"ba",		ownlang:"Башҡорт",						integrated:false,		dic:false},
		"eu":			{name:"Basque",						id:"eu",		ownlang:"Euskara",						integrated:false,		dic:false},
		"be":			{name:"Belarusian",					id:"be",		ownlang:"Беларуская",					integrated:false,		dic:false},
		"bn":			{name:"Bengali",					id:"bn",		ownlang:"বাংলা",							integrated:false,		dic:false},
		"bs":			{name:"Bosnian",					id:"bs",		ownlang:"Босански",						integrated:false,		dic:false},
		"bg":			{name:"Bulgarian",					id:"bg",		ownlang:"български",					integrated:true,		dic:false},
		"my":			{name:"Burmese",					id:"my",		ownlang:"မြန်မာစာ",						integrated:false,		dic:false},
		"ca":			{name:"Catalan",					id:"ca",		ownlang:"Català",						integrated:false,		dic:false},
		"ceb":			{name:"Cebuano",					id:"ceb",		ownlang:"Bisaya",						integrated:false,		dic:false},
		"ny":			{name:"Chichewa",					id:"ny",		ownlang:"Nyanja",						integrated:false,		dic:false},
		"zh":			{name:"Chinese",					id:"zh",		ownlang:"中文",							integrated:false,		dic:false},
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
		"he":			{name:"Hebrew",						id:"he",		ownlang:"עברית",						integrated:false,		dic:false},
		"iw":			{name:"Hebrew (Israel)",			id:"iw",		ownlang:"עברית",						integrated:false,		dic:false},
		"hi":			{name:"Hindi",						id:"hi",		ownlang:"हिन्दी",							integrated:false,		dic:false},
		"hmn":			{name:"Hmong",						id:"hmn",		ownlang:"lol Hmongb",					integrated:false,		dic:false},
		"hu":			{name:"Hungarian",					id:"hu",		ownlang:"Magyar",						integrated:false,		dic:false},
		"is":			{name:"Icelandic",					id:"is",		ownlang:"Íslenska",						integrated:false,		dic:false},
		"ig":			{name:"Igbo",						id:"ig",		ownlang:"Asụsụ Igbo",					integrated:false,		dic:false},
		"id":			{name:"Indonesian",					id:"id",		ownlang:"Bahasa Indonesia",				integrated:false,		dic:false},
		"ga":			{name:"Irish",						id:"ga",		ownlang:"Gaeilge",						integrated:false,		dic:false},
		"it":			{name:"Italian",					id:"it",		ownlang:"Italiano",						integrated:true,		dic:true},
		"ja":			{name:"Japanese",					id:"ja",		ownlang:"日本語",						integrated:true,		dic:false},
		"jv":			{name:"Javanese",					id:"jv",		ownlang:"ꦧꦱꦗꦮ",						integrated:false,		dic:false},
		"jw":			{name:"Javanese (Javanese)",		id:"jw",		ownlang:"ꦧꦱꦗꦮ",						integrated:false,		dic:false},
		"kn":			{name:"Kannada",					id:"kn",		ownlang:"ಕನ್ನಡ",							integrated:false,		dic:false},
		"kk":			{name:"Kazakh",						id:"kk",		ownlang:"Қазақ Tілі",					integrated:false,		dic:false},
		"km":			{name:"Khmer",						id:"km",		ownlang:"ភាសាខ្មែរ",						integrated:false,		dic:false},
		"rw":			{name:"Kinyarwanda",				id:"rw",		ownlang:"Ikinyarwanda",					integrated:false,		dic:false},
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
		"mhr":			{name:"Mari",						id:"mhr",		ownlang:"марий йылме",					integrated:false,		dic:false},
		"mn":			{name:"Mongolian",					id:"mn",		ownlang:"Монгол Хэл",					integrated:false,		dic:false},
		"my":			{name:"Myanmar (Burmese)",			id:"my",		ownlang:"မြန်မာл Хэл",						integrated:false,		dic:false},
		"ne":			{name:"Nepali",						id:"ne",		ownlang:"नेपाली",							integrated:false,		dic:false},
		"no":			{name:"Norwegian",					id:"no",		ownlang:"Norsk",						integrated:true,		dic:false},
		"or":			{name:"Odia",						id:"or",		ownlang:"ଓଡ଼ିଆ",							integrated:false,		dic:false},
		"pap":			{name:"Papiamento",					id:"pap",		ownlang:"Papiamentu",					integrated:false,		dic:false},
		"ps":			{name:"Pashto",						id:"ps",		ownlang:"پښتو",							integrated:false,		dic:false},
		"fa":			{name:"Persian",					id:"fa",		ownlang:"فارسی",						integrated:false,		dic:false},
		"pl":			{name:"Polish",						id:"pl",		ownlang:"Polski",						integrated:true,		dic:true},
		"pt":			{name:"Portuguese",					id:"pt",		ownlang:"Português",					integrated:false,		dic:true},
		"pt-BR":		{name:"Portuguese (Brazil)",		id:"pt-BR",		ownlang:"Português do Brasil",			integrated:true,		dic:true},
		"pt-PT":		{name:"Portuguese (Portugal)",		id:"pt-PT",		ownlang:"Português do Portugal",		integrated:false,		dic:false},
		"pa":			{name:"Punjabi",					id:"pa",		ownlang:"पंजाबी",							integrated:false,		dic:false},
		"ro":			{name:"Romanian",					id:"ro",		ownlang:"Română",						integrated:false,		dic:false},
		"ru":			{name:"Russian",					id:"ru",		ownlang:"Pусский",						integrated:true,		dic:true},
		"sm":			{name:"Samoan",						id:"sm",		ownlang:"Gagana Sāmoa",					integrated:false,		dic:false},
		"gd":			{name:"Scottish Gaelic",			id:"gd",		ownlang:"Gàidhlig",						integrated:false,		dic:false},
		"sr":			{name:"Serbian",					id:"sr",		ownlang:"Српски",						integrated:false,		dic:false},
		"st":			{name:"Sesotho",					id:"st",		ownlang:"Sesotho",						integrated:false,		dic:false},
		"sn":			{name:"Shona",						id:"sn",		ownlang:"Shona",						integrated:false,		dic:false},
		"sd":			{name:"Sindhi",						id:"sd",		ownlang:"سنڌي",							integrated:false,		dic:false},
		"si":			{name:"Sinhala",					id:"si",		ownlang:"සිංහල",						integrated:false,		dic:false},
		"sk":			{name:"Slovak",						id:"sk",		ownlang:"Slovenčina",					integrated:false,		dic:false},
		"sl":			{name:"Slovenian",					id:"sl",		ownlang:"Slovenščina",					integrated:false,		dic:false},
		"so":			{name:"Somali",						id:"so",		ownlang:"Soomaali",						integrated:false,		dic:false},
		"es":			{name:"Spanish",					id:"es",		ownlang:"Español",						integrated:true,		dic:true},
		"es-419":		{name:"Spanish (Latin America)",	id:"es-419",	ownlang:"Español latinoamericano",		integrated:false,		dic:false},
		"su":			{name:"Sundanese",					id:"su",		ownlang:"Basa Sunda",					integrated:false,		dic:false},
		"sw":			{name:"Swahili",					id:"sw",		ownlang:"Kiswahili",					integrated:false,		dic:false},
		"sv":			{name:"Swedish",					id:"sv",		ownlang:"Svenska",						integrated:true,		dic:true},
		"tl":			{name:"Tagalog",					id:"tl",		ownlang:"Wikang Tagalog",				integrated:false,		dic:false},
		"tg":			{name:"Tajik",						id:"tg",		ownlang:"тоҷикӣ",						integrated:false,		dic:false},
		"ta":			{name:"Tamil",						id:"ta",		ownlang:"தமிழ்",							integrated:false,		dic:false},
		"tt":			{name:"Tatar",						id:"tt",		ownlang:"татарча",						integrated:false,		dic:false},
		"te":			{name:"Telugu",						id:"te",		ownlang:"తెలుగు",						integrated:false,		dic:false},
		"th":			{name:"Thai",						id:"th",		ownlang:"ภาษาไทย",						integrated:false,		dic:false},
		"tr":			{name:"Turkish",					id:"tr",		ownlang:"Türkçe",						integrated:true,		dic:false},
		"tk":			{name:"Turkmen",					id:"tk",		ownlang:"Türkmençe",					integrated:false,		dic:false},
		"udm":			{name:"Udmurt",						id:"udm",		ownlang:"удмурт кыл",					integrated:false,		dic:false},
		"uk":			{name:"Ukrainian",					id:"uk",		ownlang:"Yкраїнський",					integrated:true,		dic:false},
		"ur":			{name:"Urdu",						id:"ur",		ownlang:"اُردُو",							integrated:false,		dic:false},
		"ug":			{name:"Uyghur",						id:"ug",		ownlang:"ئۇيغۇر تىلى",					integrated:false,		dic:false},
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
			file_navigator_text: "Pregledajte datoteku"
		},
		"da": {
			toast_plugin_started: "{{var0}} er startet.",
			toast_plugin_stopped: "{{var0}} er stoppet.",
			toast_plugin_translated: "oversat til {{var0}}.",
			file_navigator_text: "Gennemse fil"
		},
		"de": {
			toast_plugin_started: "{{var0}} wurde gestartet.",
			toast_plugin_stopped: "{{var0}} wurde gestoppt.",
			toast_plugin_translated: "auf {{var0}} übersetzt.",
			file_navigator_text: "Datei durchsuchen"
		},
		"es": {
			toast_plugin_started: "{{var0}} se guilddiv iniciado.",
			toast_plugin_stopped: "{{var0}} se guilddiv detenido.",
			toast_plugin_translated: "traducido a {{var0}}.",
			file_navigator_text: "Buscar archivo"
		},
		"fr": {
			toast_plugin_started: "{{var0}} a été démarré.",
			toast_plugin_stopped: "{{var0}} a été arrêté.",
			toast_plugin_translated: "traduit en {{var0}}.",
			file_navigator_text: "Parcourir le fichier"
		},
		"it": {
			toast_plugin_started: "{{var0}} è stato avviato.",
			toast_plugin_stopped: "{{var0}} è stato interrotto.",
			toast_plugin_translated: "tradotto in {{var0}}.",
			file_navigator_text: "Sfoglia file"
		},
		"nl": {
			toast_plugin_started: "{{var0}} is gestart.",
			toast_plugin_stopped: "{{var0}} is gestopt.",
			toast_plugin_translated: "vertaald naar {{var0}}.",
			file_navigator_text: "Bestand zoeken"
		},
		"no": {
			toast_plugin_started: "{{var0}} er startet.",
			toast_plugin_stopped: "{{var0}} er stoppet.",
			toast_plugin_translated: "oversatt til {{var0}}.",
			file_navigator_text: "Bla gjennom fil"
		},
		"pl": {
			toast_plugin_started: "{{var0}} został uruchomiony.",
			toast_plugin_stopped: "{{var0}} został zatrzymany.",
			toast_plugin_translated: "przetłumaczono na {{var0}}.",
			file_navigator_text: "Przeglądać plik"
		},
		"pt-BR": {
			toast_plugin_started: "{{var0}} foi iniciado.",
			toast_plugin_stopped: "{{var0}} foi interrompido.",
			toast_plugin_translated: "traduzido para {{var0}}.",
			file_navigator_text: "Procurar arquivo"
		},
		"fi": {
			toast_plugin_started: "{{var0}} on käynnistetty.",
			toast_plugin_stopped: "{{var0}} on pysäytetty.",
			toast_plugin_translated: "käännetty osoitteeseen {{var0}}.",
			file_navigator_text: "Selaa tiedostoa"
		},
		"sv": {
			toast_plugin_started: "{{var0}} har startats.",
			toast_plugin_stopped: "{{var0}} har blivit stoppad.",
			toast_plugin_translated: "översatt till {{var0}}.",
			file_navigator_text: "Bläddra i fil"
		},
		"tr": {
			toast_plugin_started: "{{var0}} başlatıldı.",
			toast_plugin_stopped: "{{var0}} durduruldu.",
			toast_plugin_translated: "{{var0}} olarak çevrildi.",
			file_navigator_text: "Dosyaya gözat"
		},
		"cs": {
			toast_plugin_started: "{{var0}} byl spuštěn.",
			toast_plugin_stopped: "{{var0}} byl zastaven.",
			toast_plugin_translated: "přeložen do {{var0}}.",
			file_navigator_text: "Procházet soubor"
		},
		"bg": {
			toast_plugin_started: "{{var0}} е стартиран.",
			toast_plugin_stopped: "{{var0}} е спрян.",
			toast_plugin_translated: "преведена на {{var0}}.",
			file_navigator_text: "Прегледайте файла"
		},
		"ru": {
			toast_plugin_started: "{{var0}} запущен.",
			toast_plugin_stopped: "{{var0}} остановлен.",
			toast_plugin_translated: "переведен на {{var0}}.",
			file_navigator_text: "Просмотр файла"
		},
		"uk": {
			toast_plugin_started: "{{var0}} було запущено.",
			toast_plugin_stopped: "{{var0}} було зупинено.",
			toast_plugin_translated: "перекладено {{var0}}.",
			file_navigator_text: "Перегляньте файл"
		},
		"ja": {
			toast_plugin_started: "{{var0}}が開始されました.",
			toast_plugin_stopped: "{{var0}}が停止しました.",
			toast_plugin_translated: "は{{var0}}に翻訳されました.",
			file_navigator_text: "ファイルを参照"
		},
		"zh-TW": {
			toast_plugin_started: "{{var0}}已經啟動.",
			toast_plugin_stopped: "{{var0}}已停止.",
			toast_plugin_translated: "翻譯為{{var0}}.",
			file_navigator_text: "瀏覽文件"
		},
		"ko": {
			toast_plugin_started: "{{var0}} 시작되었습니다.",
			toast_plugin_stopped: "{{var0}} 중지되었습니다.",
			toast_plugin_translated: "{{var0}} 로 번역되었습니다.",
			file_navigator_text: "파일 찾아보기"
		},
		"default": {
			toast_plugin_started: "{{var0}} has been started.",
			toast_plugin_stopped: "{{var0}} has been stopped.",
			toast_plugin_translated: "translated to {{var0}}.",
			file_navigator_text: "Browse File"
		}
	};
	BDFDB.LanguageUtils.getLanguage = function () {
		let lang = document.querySelector("html").lang || "en";
		if (lang == "en-GB" || lang == "en-US") lang = "en";
		let langIds = lang.split("-");
		let langId = langIds[0];
		let langId2 = langIds[1] || "";
		lang = langId2 && langId.toUpperCase() !== langId2.toUpperCase() ? langId + "-" + langId2 : langId;
		return BDFDB.LanguageUtils.languages[lang] || BDFDB.LanguageUtils.languages[langId] || BDFDB.LanguageUtils.languages["en"];
	};
	BDFDB.LanguageUtils.LanguageStrings = new Proxy(LanguageStrings, {
		get: function (list, item) {
			let stringObj = LibraryModules.LanguageStore.Messages[item];
			if (!stringObj) BDFDB.LogUtils.warn(item + " not found in BDFDB.LanguageUtils.LanguageStrings");
			else {
				if (stringObj && typeof stringObj == "object" && typeof stringObj.format == "function") return BDFDB.LanguageUtils.LanguageStringsFormat(item);
				else return stringObj;
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
			let stringObj = LibraryModules.LanguageStore.Messages[item];
			if (stringObj && typeof stringObj == "object" && typeof stringObj.format == "function") {
				let i = 0, returnvalue, formatvars = {};
				while (!returnvalue && i < 10) {
					i++;
					try {returnvalue = stringObj.format(formatvars);}
					catch (err) {
						returnvalue = null;
						let value = values.shift();
						formatvars[err.toString().split("for: ")[1]] = value != null ? (value === 0 ? "0" : value) : "undefined";
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
	var initDiscordLanguageInterval = BDFDB.TimeUtils.interval(_ => {
		if (document.querySelector("html").lang) {
			BDFDB.TimeUtils.clear(initDiscordLanguageInterval);
			var language = BDFDB.LanguageUtils.getLanguage();
			BDFDB.LanguageUtils.languages.$discord.name = `Discord (${language.name})`;
			BDFDB.LanguageUtils.languages.$discord.id = language.id;
			BDFDB.LanguageUtils.languages.$discord.google = language.google;
			BDFDB.LanguageUtils.languages.$discord.ownlang = language.ownlang;
		}
	}, 100);
	
	var InternalComponents = {NativeSubComponents: {}, LibraryComponents: {}}, reactInitialized = LibraryModules.React && LibraryModules.React.Component;
	InternalComponents.NativeSubComponents.Button = BDFDB.ModuleUtils.findByProperties("Colors", "Hovers", "Looks");
	InternalComponents.NativeSubComponents.Checkbox = BDFDB.ModuleUtils.findByName("Checkbox");
	InternalComponents.NativeSubComponents.Clickable = BDFDB.ModuleUtils.findByName("Clickable");
	InternalComponents.NativeSubComponents.ContextMenuItem = BDFDB.ModuleUtils.findByString("default.item", "default.hint", "danger", "brand");
	InternalComponents.NativeSubComponents.ContextMenuSliderItem = BDFDB.ModuleUtils.findByName("SliderMenuItem");
	InternalComponents.NativeSubComponents.ContextMenuToggleItem = BDFDB.ModuleUtils.findByName("ToggleMenuItem");
	InternalComponents.NativeSubComponents.FavButton = BDFDB.ModuleUtils.findByName("GIFFavButton");
	InternalComponents.NativeSubComponents.KeybindRecorder = BDFDB.ModuleUtils.findByName("KeybindRecorder");
	InternalComponents.NativeSubComponents.PopoutContainer = BDFDB.ModuleUtils.findByName("Popout");
	InternalComponents.NativeSubComponents.QuickSelect = BDFDB.ModuleUtils.findByName("QuickSelectWrapper");
	InternalComponents.NativeSubComponents.RadioGroup = BDFDB.ModuleUtils.findByName("RadioGroup");
	InternalComponents.NativeSubComponents.SearchBar = BDFDB.ModuleUtils.find(m => m && m.displayName == "SearchBar" && m.defaultProps.placeholder == BDFDB.LanguageUtils.LanguageStrings.SEARCH);
	InternalComponents.NativeSubComponents.Select = BDFDB.ModuleUtils.findByName("SelectTempWrapper");
	InternalComponents.NativeSubComponents.Slider = BDFDB.ModuleUtils.findByName("Slider");
	InternalComponents.NativeSubComponents.Switch = BDFDB.ModuleUtils.findByName("Switch");
	InternalComponents.NativeSubComponents.TabBar = BDFDB.ModuleUtils.findByName("TabBar");
	InternalComponents.NativeSubComponents.Table = BDFDB.ModuleUtils.findByName("Table");
	InternalComponents.NativeSubComponents.TextArea = BDFDB.ModuleUtils.findByName("TextArea");
	InternalComponents.NativeSubComponents.TextInput = BDFDB.ModuleUtils.findByName("TextInput");
	InternalComponents.NativeSubComponents.TooltipContainer = BDFDB.ModuleUtils.findByName("Tooltip");
	
	InternalComponents.LibraryComponents.AddonCard = InternalBDFDB.loadPatchedComp("AddonCard") || reactInitialized && class BDFDB_AddonCard extends LibraryModules.React.Component {
		render() {
			return !BDFDB.ObjectUtils.is(this.props.data) ? null : BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._repoentry, this.props.className, BDFDB.disCN._repocard, BDFDB.disCN._reposettingsclosed, BDFDB.disCN._repocheckboxitem),
				children: [
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._repoheader,
						style: {overflow: "visible"},
						children: [
							BDFDB.ReactUtils.createElement("span", {
								className: BDFDB.disCN._repoheadertitle,
								children: [
									BDFDB.ReactUtils.createElement("span", {
										className: BDFDB.disCN._reponame,
										children: this.props.data.name
									}),
									" v",
									BDFDB.ReactUtils.createElement("span", {
										className: BDFDB.disCN._repoversion,
										children: this.props.data.version
									}),
									" by ",
									BDFDB.ReactUtils.createElement("span", {
										className: BDFDB.disCN._repoauthor,
										children: this.props.data.author
									})
								]
							}),
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN._repocontrols,
								children: this.props.controls
							})
						]
					}),
					BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ScrollerVertical, {
						outerClassName: BDFDB.disCNS._repodescriptionwrap,
						className: BDFDB.disCNS._repodescription,
						children: this.props.data.description
					}),
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._repofooter,
						children: [
							BDFDB.ReactUtils.createElement("span", {
								className: BDFDB.disCN._repolinks,
								children: [].concat(this.props.links).map((link, i) => BDFDB.ObjectUtils.is(link) && [
									i > 0 && " | ",
									BDFDB.ReactUtils.createElement("a", {
										className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._repolink, typeof link.label == "string" && BDFDB.disCN._repolink + "-" + link.label.toLowerCase().replace(/\s/g, "")),
										href: link.href,
										children: link.label
									})
								]).flat(10).filter(n => n)
							}),
							this.props.buttons
						].flat(10).filter(n => n)
					}),
				]
			});
		}
	};
	
	InternalComponents.LibraryComponents.Anchor = BDFDB.ModuleUtils.findByName("Anchor");
	
	InternalComponents.LibraryComponents.Animations = Object.assign({}, BDFDB.ModuleUtils.findByProperties("Controller", "Spring"));
	
	InternalComponents.LibraryComponents.AutocompleteItems = BDFDB.ModuleUtils.findByProperties("Generic", "User", "Command");
	
	InternalComponents.LibraryComponents.AutocompleteMenu = BDFDB.ModuleUtils.findByName("Autocomplete");
	
	InternalComponents.LibraryComponents.Avatar = (BDFDB.ModuleUtils.findByProperties("AnimatedAvatar") || {}).default;
	
	InternalComponents.LibraryComponents.BadgeAnimationContainer = InternalBDFDB.loadPatchedComp("BadgeAnimationContainer") || reactInitialized && class BDFDB_BadgeAnimationContainer extends LibraryModules.React.Component {
		componentDidMount() {BDFDB.ReactUtils.forceUpdate(this);}
		componentWillAppear(e) {if (typeof e == "function") e();}
		componentWillEnter(e) {if (typeof e == "function") e();}
		componentWillLeave(e) {if (typeof e == "function") this.timeoutId = setTimeout(e, 300);}
		componentWillUnmount() {clearTimeout(this.timeoutId)}
		render() {
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Animations.animated.div, {
				className: this.props.className,
				style: this.props.animatedStyle,
				children: this.props.children
			});
		}
	};
	
	InternalComponents.LibraryComponents.Badges = Object.assign({}, BDFDB.ModuleUtils.findByProperties("IconBadge", "NumberBadge"));
	InternalComponents.LibraryComponents.Badges.IconBadge = InternalBDFDB.loadPatchedComp("Badges.IconBadge") || reactInitialized && class BDFDB_IconBadge extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.badgeiconbadge, this.props.className),
				style: Object.assign({
					backgroundColor: this.props.disableColor ? null : (this.props.color || BDFDB.DiscordConstants.Colors.STATUS_RED)
				}, this.props.style),
				children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SvgIcon, {
					className: BDFDB.disCN.badgeicon,
					name: this.props.icon
				})
			});
		}
	};
	
	InternalComponents.LibraryComponents.BotTag = InternalBDFDB.loadPatchedComp("BotTag") || reactInitialized && class BDFDB_BotTag extends LibraryModules.React.Component {
		handleClick(e) {if (typeof this.props.onClick == "function") this.props.onClick(e, this);}
		handleContextMenu(e) {if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);}
		render() {
			return BDFDB.ReactUtils.createElement("span", {
				className: BDFDB.DOMUtils.formatClassName(this.props.className, this.props.invertColor ? BDFDB.disCN.bottaginvert : BDFDB.disCN.bottagregular, this.props.useRemSizes ? BDFDB.disCN.bottagrem : BDFDB.disCN.bottagpx),
				style: this.props.style,
				onClick: this.handleClick.bind(this),
				onContextMenu: this.handleContextMenu.bind(this),
				children: BDFDB.ReactUtils.createElement("span", {
					className: BDFDB.disCN.bottagtext,
					children: this.props.tag || BDFDB.LanguageUtils.LanguageStrings.BOT_TAG_BOT
				})
			});
		}
	};
	
	InternalComponents.LibraryComponents.Button = InternalBDFDB.loadPatchedComp("Button") || reactInitialized && class BDFDB_Button extends LibraryModules.React.Component {
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
				className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.button, this.props.look != null ? this.props.look : InternalComponents.LibraryComponents.Button.Looks.FILLED, this.props.color != null ? this.props.color : InternalComponents.LibraryComponents.Button.Colors.BRAND, this.props.hover, this.props.size != null ? this.props.size : InternalComponents.LibraryComponents.Button.Sizes.MEDIUM, processingAndListening && this.props.wrapperClassName, this.props.fullWidth && BDFDB.disCN.buttonfullwidth, (this.props.grow === undefined || this.props.grow) && BDFDB.disCN.buttongrow, this.props.hover && this.props.hover !== InternalComponents.LibraryComponents.Button.Hovers.DEFAULT && BDFDB.disCN.buttonhashover, this.props.submitting && BDFDB.disCN.buttonsubmitting),
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
					this.props.submitting && !this.props.disabled ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Spinner, {
						type: InternalComponents.LibraryComponents.Spinner.Type.PULSING_ELLIPSIS,
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
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.buttondisabledwrapper, this.props.wrapperClassName, this.props.size != null ? this.props.size : InternalComponents.LibraryComponents.Button.Sizes.MEDIUM, this.props.fullWidth && BDFDB.disCN.buttonfullwidth, (this.props.grow === undefined || this.props.grow) && BDFDB.disCN.buttongrow),
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
	};
	
	InternalComponents.LibraryComponents.Card = InternalBDFDB.loadPatchedComp("Card") || reactInitialized && class BDFDB_Card extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.hovercardwrapper, this.props.backdrop && BDFDB.disCN.hovercard, this.props.className),
				onMouseEnter: e => {if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);},
				onMouseLeave: e => {if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);},
				onClick: e => {if (typeof this.props.onClick == "function") this.props.onClick(e, this);},
				onContextMenu: e => {if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);},
				children: [
					!this.props.noRemove ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.CardRemoveButton, {
						onClick: e => {
							if (typeof this.props.onRemove == "function") this.props.onRemove(e, this);
							BDFDB.ListenerUtils.stopEvent(e);
						}
					}) : null,
					typeof this.props.children == "string" ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TextElement, {
						className: BDFDB.disCN.hovercardinner,
						children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TextScroller, {children: this.props.children})
					}) : this.props.children
				].flat(10).filter(n => n)
			}), "backdrop", "noRemove"));
		}
	};
	InternalBDFDB.setDefaultProps(InternalComponents.LibraryComponents.Card, {backdrop:true, noRemove:false});
	
	InternalComponents.LibraryComponents.CardRemoveButton = BDFDB.ModuleUtils.findByName("RemoveButton");
	
	InternalComponents.LibraryComponents.ChannelTextAreaButton = InternalBDFDB.loadPatchedComp("ChannelTextAreaButton") || reactInitialized && class BDFDB_ChannelTextAreaButton extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Button, {
				look: InternalComponents.LibraryComponents.Button.Looks.BLANK,
				size: InternalComponents.LibraryComponents.Button.Sizes.NONE,
				"aria-label": this.props.label,
				tabIndex: this.props.tabIndex,
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.textareabuttonwrapper, this.props.isActive && BDFDB.disCN.textareabuttonactive),
				innerClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.textareabutton, this.props.className, this.props.pulse && BDFDB.disCN.textareaattachbuttonplus),
				onClick: this.props.onClick,
				onContextMenu: this.props.onContextMenu,
				onMouseEnter: this.props.onMouseEnter,
				onMouseLeave: this.props.onMouseLeave,
				children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SvgIcon, {
					name: this.props.iconName,
					iconSVG: this.props.iconSVG,
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.textareaicon, this.props.iconClassName, this.props.pulse && BDFDB.disCN.textareaiconpulse)
				})
			});
		}
	};
	
	InternalComponents.LibraryComponents.CharCounter = InternalBDFDB.loadPatchedComp("CharCounter") || reactInitialized && class BDFDB_CharCounter extends LibraryModules.React.Component {
		getCounterString() {
			let input = this.refElement || {}, string = "";
			if (BDFDB.DOMUtils.containsClass(this.refElement, BDFDB.disCN.textarea)) {
				let instance = BDFDB.ReactUtils.findOwner(input, {name:"ChannelEditorContainer", up:true});
				if (instance) string = instance.props.textValue;
				else string = input.value || input.textContent || "";
			}
			else string = input.value || input.textContent || "";
			let start = input.selectionStart || 0, end = input.selectionEnd || 0, selectlength = end - start, selection = BDFDB.DOMUtils.getSelection();
			let select = !selectlength && !selection ? 0 : (selectlength || selection.length);
			select = !select ? 0 : (select > string.length ? (end || start ? string.length - (string.length - end - start) : string.length) : select);
			let children = [
				typeof this.props.renderPrefix == "function" && this.props.renderPrefix(string.length),
				`${string.length}${!this.props.max ? "" : "/" + this.props.max}${!select ? "" : " (" + select + ")"}`,
				typeof this.props.renderSuffix == "function" && this.props.renderSuffix(string.length)
			].filter(n => n);
			return children.length == 1 ? children[0] : BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
				align: InternalComponents.LibraryComponents.Flex.Align.CENTER,
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
			let mousemove = _ => {
				BDFDB.TimeUtils.timeout(this.forceUpdateCounter.bind(this), 10);
			};
			let mouseup = _ => {
				document.removeEventListener("mousemove", mousemove);
				document.removeEventListener("mouseup", mouseup);
				if (this.refElement.selectionEnd - this.refElement.selectionStart) BDFDB.TimeUtils.timeout(_ => {
					document.addEventListener("click", click);
				});
			};
			let click = _ => {
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
				if (node && node.parentElement) {
					this.refElement = node.parentElement.querySelector(this.props.refClass);
					if (this.refElement) {
						if (!this._updateCounter) this._updateCounter = _ => {
							if (!document.contains(node)) BDFDB.ListenerUtils.multiRemove(this.refElement, "keydown click change", this._updateCounter);
							else this.updateCounter();
						};
						if (!this._handleSelection) this._handleSelection = _ => {
							if (!document.contains(node)) BDFDB.ListenerUtils.multiRemove(this.refElement, "mousedown", this._handleSelection);
							else this.handleSelection();
						};
						BDFDB.ListenerUtils.multiRemove(this.refElement, "mousedown", this._handleSelection);
						BDFDB.ListenerUtils.multiAdd(this.refElement, "mousedown", this._handleSelection);
						if (this.refElement.tagName == "INPUT" || this.refElement.tagName == "TEXTAREA") {
							BDFDB.ListenerUtils.multiRemove(this.refElement, "keydown click change", this._updateCounter);
							BDFDB.ListenerUtils.multiAdd(this.refElement, "keydown click change", this._updateCounter);
						}
						else {
							if (!this._mutationObserver) this._mutationObserver = new MutationObserver(changes => {
								if (!document.contains(node)) this._mutationObserver.disconnect();
								else this.updateCounter();
							});
							else this._mutationObserver.disconnect();
							this._mutationObserver.observe(this.refElement, {childList: true, subtree: true});
						}
						this.updateCounter();
					}
					else BDFDB.LogUtils.warn("could not find referenceElement for BDFDB_CharCounter");
				}
			}
			else BDFDB.LogUtils.warn("refClass can not be undefined for BDFDB_CharCounter");
		}
		render() {
			let string = this.getCounterString();
			BDFDB.TimeUtils.timeout(_ => {if (string != this.getCounterString()) BDFDB.ReactUtils.forceUpdate(this);});
			return BDFDB.ReactUtils.createElement("div", BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.charcounter, this.props.className),
				children: string
			}), "parsing", "max", "refClass", "renderPrefix", "renderSuffix"));
		}
	};
	
	InternalComponents.LibraryComponents.Checkbox = InternalBDFDB.loadPatchedComp("Checkbox") || reactInitialized && class BDFDB_Checkbox extends LibraryModules.React.Component {
		handleChange() {
			this.props.value = !this.props.value;
			if (typeof this.props.onChange == "function") this.props.onChange(this.props.value, this);
			BDFDB.ReactUtils.forceUpdate(this);
		}
		render() {
			return BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.Checkbox, Object.assign({}, this.props, {onChange: this.handleChange.bind(this)}));
		}
	};
	
	InternalComponents.LibraryComponents.Clickable = InternalBDFDB.loadPatchedComp("Clickable") || reactInitialized && class BDFDB_Clickable extends LibraryModules.React.Component {
		handleClick(e) {if (typeof this.props.onClick == "function") this.props.onClick(e, this);}
		handleContextMenu(e) {if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);}
		handleMouseDown(e) {if (typeof this.props.onMouseDown == "function") this.props.onMouseDown(e, this);}
		handleMouseUp(e) {if (typeof this.props.onMouseUp == "function") this.props.onMouseUp(e, this);}
		handleMouseEnter(e) {if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);}
		handleMouseLeave(e) {if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);}
		render() {
			return BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.Clickable, Object.assign({}, this.props, {
				className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.cursorpointer),
				onClick: this.handleClick.bind(this),
				onContextMenu: this.handleContextMenu.bind(this),
				onMouseUp: this.handleMouseDown.bind(this),
				onMouseDown: !this.props.disabled && this.handleMouseUp.bind(this),
				onMouseEnter: this.handleMouseEnter.bind(this),
				onMouseLeave: this.handleMouseLeave.bind(this)
			}));
		}
	};
	
	InternalComponents.LibraryComponents.CollapseContainer = InternalBDFDB.loadPatchedComp("CollapseContainer") || reactInitialized && class BDFDB_CollapseContainer extends LibraryModules.React.Component {
		render() {
			if (!BDFDB.ObjectUtils.is(this.props.collapseStates)) this.props.collapseStates = {};
			this.props.collapsed = this.props.collapsed && (this.props.collapseStates[this.props.title] || this.props.collapseStates[this.props.title] == undefined);
			this.props.collapseStates[this.props.title] = this.props.collapsed;
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.DOMUtils.formatClassName(this.props.collapsed && BDFDB.disCN.collapsecontainercollapsed, this.props.mini ? BDFDB.disCN.collapsecontainermini : BDFDB.disCN.collapsecontainer, this.props.className),
				id: this.props.id,
				children: [
					this.props.dividertop ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormDivider, {
						className: this.props.mini ? BDFDB.disCN.marginbottom8 : BDFDB.disCN.marginbottom20
					}) : null,
					BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
						className: BDFDB.disCNS.collapsecontainerheader + BDFDB.disCN.cursorpointer,
						align: InternalComponents.LibraryComponents.Flex.Align.CENTER,
						onClick: e => {
							this.props.collapsed = !this.props.collapsed;
							this.props.collapseStates[this.props.title] = this.props.collapsed;
							if (typeof this.props.onClick == "function") this.props.onClick(this.props.collapsed, this);
							BDFDB.ReactUtils.forceUpdate(this);
						},
						children: [
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.collapsecontainerarrow
							}),
							BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormTitle, {
								tag: InternalComponents.LibraryComponents.FormComponents.FormTitle.Tags.H2,
								className: BDFDB.disCNS.collapsecontainertitle + BDFDB.disCN.cursorpointer,
								children: this.props.title
							})
						]
					}),
					!this.props.collapsed ? BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.collapsecontainerinner,
						children: this.props.children
					}) : null,
					this.props.dividerbottom ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormDivider, {
						className: this.props.mini ? BDFDB.disCN.margintop8 : BDFDB.disCN.margintop20
					}) : null
				]
			});
		}
	};
	InternalBDFDB.setDefaultProps(InternalComponents.LibraryComponents.CollapseContainer, {collapsed:true, mini:true});
	
	InternalComponents.LibraryComponents.ColorSwatches = InternalBDFDB.loadPatchedComp("ColorSwatches") || reactInitialized && class BDFDB_ColorSwatches extends LibraryModules.React.Component {
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
			this.ColorSwatch = class BDFDB_ColorSwatch extends LibraryModules.React.Component {
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
							this.props.isCustom || this.props.isSingle ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SvgIcon, {
								className: BDFDB.disCN.colorpickerswatchdropper,
								foreground: BDFDB.disCN.colorpickerswatchdropperfg,
								name: InternalComponents.LibraryComponents.SvgIcon.Names.DROPPER,
								width: this.props.isCustom ? 14 : 10,
								height: this.props.isCustom ? 14 : 10,
								color: usewhite ? BDFDB.DiscordConstants.Colors.WHITE : BDFDB.DiscordConstants.Colors.BLACK
							}) : null,
							this.props.isSelected && !this.props.isSingle ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SvgIcon, {
								name: InternalComponents.LibraryComponents.SvgIcon.Names.CHECKMARK,
								width: this.props.isCustom ? 32 : 16,
								height: this.props.isCustom ? 24 : 16,
								color: usewhite ? BDFDB.DiscordConstants.Colors.WHITE : BDFDB.DiscordConstants.Colors.BLACK
							}) : null
						]
					});
					return this.props.isCustom || this.props.isSingle || this.props.color == null ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TooltipContainer, {
						text: this.props.isCustom || this.props.isSingle ? BDFDB.LanguageUtils.LanguageStrings.CUSTOM_COLOR : BDFDB.LanguageUtils.LanguageStrings.DEFAULT,
						tooltipConfig: {type: this.props.isSingle ? "top" : "bottom"},
						children: swatch
					}) : swatch;
				}
			}
		}
		renderRow(colors) {
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
				className: BDFDB.disCN.colorpickerrow,
				wrap: InternalComponents.LibraryComponents.Flex.Wrap.WRAP,
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
			return !this.state.colors.length ? customSwatch : BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.colorpickerswatches, this.state.disabled && BDFDB.disCN.colorpickerswatchesdisabled),
				number: this.props.number != null ? this.props.number : 0,
				children: [
					BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex.Child, {
						className: BDFDB.disCN.marginreset,
						shrink: 0,
						grow: 0,
						children: customSwatch
					}),
					BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
						direction: InternalComponents.LibraryComponents.Flex.Direction.VERTICAL,
						className: BDFDB.disCN.flexmarginreset,
						grow: 1,
						children: [
							this.renderRow(this.state.colorRows[0]),
							this.renderRow(this.state.colorRows[1])
						]
					}) 
				]
			});
		}
	};
	
	InternalComponents.LibraryComponents.Connectors = Object.assign({}, BDFDB.ModuleUtils.findByProperties("Router", "Link"));
	
	InternalComponents.LibraryComponents.ContextMenuItems = {};
	
	InternalComponents.LibraryComponents.ContextMenuItems.Group = BDFDB.ModuleUtils.findByString(`"div",{className`, `default.itemGroup}`);
	
	InternalComponents.LibraryComponents.ContextMenuItems.Hint = InternalBDFDB.loadPatchedComp("ContextMenuItems.Hint") || reactInitialized && class BDFDB_ContextMenuItemHint extends LibraryModules.React.Component {
		render() {
			let hintIsString = typeof this.props.hint == "string";
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN.contextmenuhint,
				style: hintIsString ? {
					width: 42,
					maxWidth: 42,
					marginLeft: 8
				} : {},
				children: hintIsString ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TextScroller, {
					speed: 2,
					children: this.props.hint
				}) : (this.props.hint || null)
			});
		}
	};
	
	InternalComponents.LibraryComponents.ContextMenuItems.Item = InternalBDFDB.loadPatchedComp("ContextMenuItems.Item") || reactInitialized && class BDFDB_ContextMenuItem extends LibraryModules.React.Component {
		render() {
			let hintIsString = typeof this.props.hint == "string";
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Clickable, {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.contextmenuitem, !this.props.disabled && BDFDB.disCN.contextmenuitemclickable, this.props.danger && BDFDB.disCN.contextmenuitemdanger, this.props.disabled && BDFDB.disCN.contextmenuitemdisabled, this.props.brand && BDFDB.disCN.contextmenuitembrand, this.props.className),
				style: this.props.style,
				role: "menuitem",
				onClick: this.props.disabled || typeof this.props.action != "function" ? null : this.props.action,
				children: [
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.contextmenulabel,
						children: this.props.label
					}),
					BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ContextMenuItems.Hint, {hint: this.props.hint}),
					this.props.children
				]
			});
		}
	};
	
	InternalComponents.LibraryComponents.ContextMenuItems.Slider = InternalBDFDB.loadPatchedComp("ContextMenuItems.Slider") || reactInitialized && class BDFDB_ContextMenuSliderItem extends LibraryModules.React.Component {
		handleValueChange(value) {
			let newvalue = BDFDB.ArrayUtils.is(this.props.edges) && this.props.edges.length == 2 ? BDFDB.NumberUtils.mapRange([0, 100], this.props.edges, value) : value;
			if (typeof this.props.digits == "number") newvalue = Math.round(newvalue * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits);
			this.props.defaultValue = newvalue;
			if (typeof this.props.onValueChange == "function") this.props.onValueChange(newvalue, this);
			BDFDB.ReactUtils.forceUpdate(this);
		}
		handleValueRender(value) {
			let newvalue = BDFDB.ArrayUtils.is(this.props.edges) && this.props.edges.length == 2 ? BDFDB.NumberUtils.mapRange([0, 100], this.props.edges, value) : value;
			if (typeof this.props.digits == "number") newvalue = Math.round(newvalue * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits);
			if (typeof this.props.renderLabel == "function") this.props.label = this.props.renderLabel(newvalue);
			if (typeof this.props.onValueRender == "function") {
				let tempreturn = this.props.onValueRender(newvalue, this);
				if (tempreturn != undefined) newvalue = tempreturn;
			}
			return newvalue;
		}
		render() {
			let defaultValue = BDFDB.ArrayUtils.is(this.props.edges) && this.props.edges.length == 2 ? BDFDB.NumberUtils.mapRange(this.props.edges, [0, 100], this.props.defaultValue) : this.props.defaultValue;
			if (typeof this.props.digits == "number") defaultValue = Math.round(defaultValue * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits);
			return BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.ContextMenuSliderItem, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
				defaultValue: defaultValue,
				label: typeof this.props.renderLabel == "function" ? this.props.renderLabel(this.props.defaultValue) : this.props.label,
				onValueChange: this.handleValueChange.bind(this),
				onValueRender: this.handleValueRender.bind(this)
			}), "digits", "edges", "renderLabel"));
		}
	};
	
	InternalComponents.LibraryComponents.ContextMenuItems.Sub = BDFDB.ModuleUtils.findByName("FluxContainer(SubMenuItem)");
	
	InternalComponents.LibraryComponents.ContextMenuItems.Toggle = InternalBDFDB.loadPatchedComp("ContextMenuItems.Toggle") || reactInitialized && class BDFDB_ContextMenuToggleItem extends LibraryModules.React.Component {
		handleToggle() {
			this.props.active = !this.props.active;
			if (typeof this.props.action == "function") this.props.action(this.props.active);
			BDFDB.ReactUtils.forceUpdate(this);
		}
		render() {
			return BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.ContextMenuToggleItem, Object.assign({}, this.props, {action: this.handleToggle.bind(this)}));
		}
	};
	
	var ComponentTypeData = {};
	ComponentTypeData.NormalContextMenus = ["DeveloperContextMenu", "GuildRoleContextMenu", "NativeContextMenu", "ScreenshareContextMenu", "UserSettingsCogContextMenu"];
	ComponentTypeData.FluxContextMenus = ["ApplicationContextMenu", "GroupDMContextMenu"];
	ComponentTypeData.NonRenderContextMenus = ["ChannelContextMenu", "GuildContextMenu", "MessageContextMenu", "SlateContextMenu", "UserContextMenu"];
	ComponentTypeData.ObservedContextMenus = [];
	ComponentTypeData.ExtraPatchedComponents = ["MessageOptionContextMenu", "MessageOptionToolbar"];
	ComponentTypeData.QueuedComponents = [].concat(ComponentTypeData.NonRenderContextMenus, ComponentTypeData.ObservedContextMenus, ComponentTypeData.ExtraPatchedComponents);
	
	InternalComponents.LibraryComponents.ContextMenus = {};
	InternalComponents.LibraryComponents.ContextMenus._Exports = {};
	
	InternalComponents.LibraryComponents.ContextMenus._Types = Object.entries(BDFDB.DiscordConstants.ContextMenuTypes).map(n => n[1]);
	
	InternalComponents.LibraryComponents.ContextMenus.ApplicationContextMenu = BDFDB.ModuleUtils.findByName("FluxContainer(ApplicationContextMenu)");
	
	InternalComponents.LibraryComponents.ContextMenus.ChannelContextMenu = BDFDB.ModuleUtils.findByString("Error - no such ctx menu type", BDFDB.DiscordConstants.ContextMenuTypes.CHANNEL_LIST_TEXT);
	InternalComponents.LibraryComponents.ContextMenus._Exports.ChannelContextMenu = (BDFDB.ModuleUtils.findByString("Error - no such ctx menu type", BDFDB.DiscordConstants.ContextMenuTypes.CHANNEL_LIST_TEXT, false) || {}).exports;
	
	InternalComponents.LibraryComponents.ContextMenus.DeveloperContextMenu = BDFDB.ModuleUtils.findByName("DeveloperContextMenu");
	
	InternalComponents.LibraryComponents.ContextMenus.GroupDMContextMenu = BDFDB.ModuleUtils.findByName("FluxContainer(GroupDMContextMenu)");
	
	InternalComponents.LibraryComponents.ContextMenus.GuildContextMenu = BDFDB.ModuleUtils.findByString("Error - no such ctx menu type", BDFDB.DiscordConstants.ContextMenuTypes.GUILD_CHANNEL_LIST);
	InternalComponents.LibraryComponents.ContextMenus._Exports.GuildContextMenu = (BDFDB.ModuleUtils.findByString("Error - no such ctx menu type", BDFDB.DiscordConstants.ContextMenuTypes.GUILD_CHANNEL_LIST, false) || {}).exports;
	
	InternalComponents.LibraryComponents.ContextMenus.GuildRoleContextMenu = BDFDB.ModuleUtils.findByName("GuildRoleContextMenu");
	
	InternalComponents.LibraryComponents.ContextMenus.MessageContextMenu = BDFDB.ModuleUtils.findByString("message", "target", BDFDB.DiscordConstants.ContextMenuTypes.MESSAGE_MAIN);
	InternalComponents.LibraryComponents.ContextMenus._Exports.MessageContextMenu = (BDFDB.ModuleUtils.findByString("message", "target", BDFDB.DiscordConstants.ContextMenuTypes.MESSAGE_MAIN, false) || {}).exports;
	
	InternalComponents.LibraryComponents.ContextMenus.NativeContextMenu = BDFDB.ModuleUtils.findByName("NativeContextMenu");
	
	InternalComponents.LibraryComponents.ContextMenus.ScreenshareContextMenu = BDFDB.ModuleUtils.findByName("ScreenshareContextMenu");
	
	InternalComponents.LibraryComponents.ContextMenus.SlateContextMenu = BDFDB.ModuleUtils.findByName("SlateContextMenu");
	InternalComponents.LibraryComponents.ContextMenus._Exports.SlateContextMenu = BDFDB.ModuleUtils.findByName("SlateContextMenu", false);
	
	InternalComponents.LibraryComponents.ContextMenus.UserContextMenu = BDFDB.ModuleUtils.findByString("Error - no such ctx menu type", BDFDB.DiscordConstants.ContextMenuTypes.USER_CHANNEL_MEMBERS);
	InternalComponents.LibraryComponents.ContextMenus._Exports.UserContextMenu = (BDFDB.ModuleUtils.findByString("Error - no such ctx menu type", BDFDB.DiscordConstants.ContextMenuTypes.USER_CHANNEL_MEMBERS, false) || {}).exports;
	
	InternalComponents.LibraryComponents.ContextMenus.UserSettingsCogContextMenu = BDFDB.ModuleUtils.findByName("UserSettingsCogContextMenu");
	
	InternalComponents.LibraryComponents.DiscordTag = BDFDB.ModuleUtils.findByName("DiscordTag");
	
	InternalComponents.LibraryComponents.Emoji = BDFDB.ModuleUtils.findByName("Emoji");
	
	InternalComponents.LibraryComponents.EmojiButton = BDFDB.ModuleUtils.findByName("EmojiButton");
	
	InternalComponents.LibraryComponents.EmojiPicker = BDFDB.ModuleUtils.findByString("allowManagedEmojis", "theme");
	
	InternalComponents.LibraryComponents.EmojiPickerButton = InternalBDFDB.loadPatchedComp("EmojiPickerButton") || reactInitialized && class BDFDB_EmojiPickerButton extends LibraryModules.React.Component {
		handleEmojiChange(emoji) {
			if (emoji != null) {
				this.props.emoji = emoji.id ? {
					id: emoji.id,
					name: emoji.name,
					animated: emoji.animated
				} : {
					id: null,
					name: emoji.optionallyDiverseSequence,
					animated: false
				};
				if (typeof this.props.onSelect == "function") this.props.onSelect(this.props.emoji, this);
				BDFDB.ReactUtils.forceUpdate(this);
			}
		}
		render() {
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.PopoutContainer, {
				children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.EmojiButton, {
					className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.emojiinputbutton),
					renderButtonContents: this.props.emoji ? _ => BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Emoji, {
						className: BDFDB.disCN.emoji,
						emoji: this.props.emoji
					}) : null
				}),
				wrap: false,
				animation: InternalComponents.LibraryComponents.PopoutContainer.Animation.NONE,
				position: InternalComponents.LibraryComponents.PopoutContainer.Positions.TOP,
				align: InternalComponents.LibraryComponents.PopoutContainer.Align.LEFT,
				renderPopout: instance => {
					return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.EmojiPicker, {
						closePopout: instance.close,
						onSelectEmoji: this.handleEmojiChange.bind(this),
						allowManagedEmojis: false
					});
				}
			})
		}
	};
	
	InternalComponents.LibraryComponents.FavButton = InternalBDFDB.loadPatchedComp("FavButton") || reactInitialized && class BDFDB_FavButton extends LibraryModules.React.Component {
		handleClick() {
			this.props.isFavorite = !this.props.isFavorite;
			if (typeof this.props.onClick == "function") this.props.onClick(this.props.isFavorite, this);
			BDFDB.ReactUtils.forceUpdate(this);
		}
		render() {
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.favbuttoncontainer, this.props.className),
				children: BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.FavButton, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {onClick: this.handleClick.bind(this)}), "className"))
			});
		}
	};
	
	InternalComponents.LibraryComponents.FileButton = InternalBDFDB.loadPatchedComp("FileButton") || reactInitialized && class BDFDB_FileButton extends LibraryModules.React.Component {
		render() {
			let filter = this.props.filter && [this.props.filter].flat(10).filter(n => typeof n == "string") || [];
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Button, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
				onClick: e => {e.currentTarget.querySelector("input").click();},
				children: [
					BDFDB.LanguageUtils.LibraryStrings.file_navigator_text,
					BDFDB.ReactUtils.createElement("input", {
						type: "file",
						accept: filter.length && (filter.join("/*,") + "/*"),
						style: {display: "none"},
						onChange: e => {
							let file = e.currentTarget.files[0];
							if (this.refInput && file && (!filter.length || filter.some(n => file.type.indexOf(n) == 0))) {
								this.refInput.props.value = `${this.props.mode == "url" ? "url('" : ""}${this.props.useFilepath ? file.path : `data:${file.type};base64,${BDFDB.LibraryRequires.fs.readFileSync(file.path).toString("base64")}`}${this.props.mode ? "')" : ""}`;
								BDFDB.ReactUtils.forceUpdate(this.refInput);
								this.refInput.handleChange(this.refInput.props.value);
							}
						}
					})
				]
			}), "filter", "mode", "useFilepath"));
		}
	};
	
	InternalComponents.LibraryComponents.Flex = BDFDB.ModuleUtils.findByProperties("Wrap", "Direction", "Child");
	
	InternalComponents.LibraryComponents.FlowerStarIcon = BDFDB.ModuleUtils.findByName("FlowerStarIcon");
	
	InternalComponents.LibraryComponents.FormComponents = Object.assign({}, BDFDB.ModuleUtils.findByProperties("FormSection", "FormText"));
	
	InternalComponents.LibraryComponents.FormComponents.FormItem = InternalBDFDB.loadPatchedComp("FormComponents.FormItem") || reactInitialized && class BDFDB_FormItem extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement("div", {
				className: this.props.className,
				style: this.props.style,
				children: [
					BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
						align: InternalComponents.LibraryComponents.Flex.Align.BASELINE,
						children: [
							this.props.title != null || this.props.error != null ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex.Child, {
								wrap: true,
								children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormTitle, {
									tag: this.props.tag || InternalComponents.LibraryComponents.FormComponents.FormTitle.Tags.H5,
									disabled: this.props.disabled,
									required: this.props.required,
									error: this.props.error,
									className: this.props.titleClassName,
									children: this.props.title
								})
							}) : null
						].concat([this.props.titlechildren].flat(10)).filter(n => n)
					}),
				].concat(this.props.children)
			});
		}
	};
	
	InternalComponents.LibraryComponents.GuildComponents = {};
	
	InternalComponents.LibraryComponents.GuildComponents.Badge = BDFDB.ModuleUtils.findByName("GuildBadge");
	
	InternalComponents.LibraryComponents.GuildComponents.BlobMask = BDFDB.ModuleUtils.findByName("BlobMask");
	
	InternalComponents.LibraryComponents.GuildComponents.Guild = InternalBDFDB.loadPatchedComp("GuildComponents.Guild") || reactInitialized && class BDFDB_Guild extends LibraryModules.React.Component {
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
			if (e.button == 0 && typeof this.props.onMouseDown == "function") this.props.onMouseDown(e, this);
		}
		handleMouseUp(e) {
			if (e.button == 0 && typeof this.props.onMouseUp == "function") this.props.onMouseUp(e, this);
		}
		handleClick(e) {
			if (typeof this.props.onClick == "function") this.props.onClick(e, this);
		}
		handleContextMenu(e) {
			if (this.props.menu) BDFDB.GuildUtils.openMenu(this.props.guild, e);
			if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);
		}
		setRef(e) {
			if (typeof this.props.setRef == "function") this.props.setRef(this.props.guild.id, e)
		}
		componentDidMount() {
			let node = BDFDB.ReactUtils.findDOMNode(this);
			if (node) for (let child of node.querySelectorAll("a")) child.setAttribute("draggable", false);
		}
		render() {
			if (!this.props.guild) return null;
			this.props.guildId = this.props.guild.id;
			this.props.selectedChannelId = LibraryModules.LastChannelStore.getChannelId(this.props.guild.id);
			this.props.selected = this.props.state ? LibraryModules.LastGuildStore.getGuildId() == this.props.guild.id : false;
			this.props.unread = this.props.state ? LibraryModules.UnreadGuildUtils.hasUnread(this.props.guild.id) : false;
			this.props.badge = this.props.state ? LibraryModules.UnreadGuildUtils.getMentionCount(this.props.guild.id) : 0;
			this.props.audio = this.props.state ? (LibraryModules.ChannelStore.getChannel(LibraryModules.LastChannelStore.getVoiceChannelId()) || {}).guild_id == this.props.guild.id : false;
			this.props.video = this.props.state ? (LibraryModules.StreamUtils.getActiveStream() || {}).guildId == this.props.guild.id : false;
			this.props.screenshare = this.props.state ? !!LibraryModules.StreamUtils.getAllApplicationStreams().filter(stream => stream.guildId == this.props.guild.id)[0] : false;
			this.props.isCurrentUserInThisGuildVoice = this.props.state ? !LibraryModules.CurrentVoiceUtils.isDisabled() && LibraryModules.CurrentVoiceUtils.getGuildId() == this.props.guild.id : false;
			this.props.animatable = this.props.state ? LibraryModules.IconUtils.hasAnimatedGuildIcon(this.props.guild) : false;
			this.props.unavailable = this.props.state ? LibraryModules.GuildUnavailableStore.unavailableGuilds.includes(this.props.guild.id) : false;
			var isDraggedGuild = this.props.draggingGuildId === this.props.guild.id;
			let guild = isDraggedGuild ? BDFDB.ReactUtils.createElement("div", {
				children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.GuildComponents.Items.DragPlaceholder, {})
			}) : BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN.guildcontainer,
				children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.GuildComponents.BlobMask, {
					selected: this.state.isDropHovering || this.props.selected || this.state.hovered,
					upperBadge: this.props.unavailable ? InternalComponents.LibraryComponents.GuildComponents.Items.renderUnavailableBadge() : InternalComponents.LibraryComponents.GuildComponents.Items.renderIconBadge(this.props.audio, this.props.video, this.props.screenshare, this.props.isCurrentUserInThisGuildVoice),
					lowerBadge: this.props.badge > 0 ? InternalComponents.LibraryComponents.GuildComponents.Items.renderMentionBadge(this.props.badge) : null,
					lowerBadgeWidth: InternalComponents.LibraryComponents.Badges.getBadgeWidthForValue(this.props.badge),
					children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.NavItem, {
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
						onMouseUp: this.handleMouseUp.bind(this),
						onClick: this.handleClick.bind(this),
						onContextMenu: this.handleContextMenu.bind(this),
						icon: this.props.guild.getIconURL(this.state.hovered && this.props.animatable ? "gif" : "jpg"),
						selected: this.props.selected || this.state.hovered
					})
				})
			});
				
			if (this.props.draggable && typeof this.props.connectDragSource == "function") guild = this.props.connectDragSource(guild);
			
			let children = [
				this.props.list || this.props.pill ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.GuildComponents.Pill, {
					hovered: !isDraggedGuild && this.state.hovered,
					selected: !isDraggedGuild && this.props.selected,
					unread: !isDraggedGuild && this.props.unread,
					className: BDFDB.disCN.guildpill
				}) : null,
				!this.props.tooltip ? guild : BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TooltipContainer, {
					tooltipConfig: Object.assign({type: "right"}, this.props.tooltipConfig, {guild: this.props.list && this.props.guild}),
					children: guild
				})
			].filter(n => n);
			return this.props.list ? InternalComponents.LibraryComponents.GuildComponents.Items.renderListItem(BDFDB.ReactUtils.createElement(BDFDB.ReactUtils.Fragment, {
				children: children
			}), null != this.props.setRef ? this.setRef : null) : BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.guild, this.props.className),
				children: children
			});
		}
	};
	InternalBDFDB.setDefaultProps(InternalComponents.LibraryComponents.GuildComponents.Guild, {menu:true, tooltip:true, list:false, state:false, draggable:false, sorting:false});
	
	InternalComponents.LibraryComponents.GuildComponents.Icon = BDFDB.ModuleUtils.findByName("GuildIconWrapper");
	
	InternalComponents.LibraryComponents.GuildComponents.Items = BDFDB.ModuleUtils.findByProperties("Separator", "DragPlaceholder");
	
	InternalComponents.LibraryComponents.GuildComponents.Pill = BDFDB.ModuleUtils.findByString("opacity:1,height:", "20:8", "default.item");
	
	InternalComponents.LibraryComponents.HeaderBarComponents = BDFDB.ModuleUtils.findByName("HeaderBarContainer");
	
	InternalComponents.LibraryComponents.KeybindRecorder = InternalBDFDB.loadPatchedComp("KeybindRecorder") || reactInitialized && class BDFDB_KeybindRecorder extends LibraryModules.React.Component {
		handleChange(arrays) {
			if (typeof this.props.onChange == "function") this.props.onChange(arrays.map(platformkey => LibraryModules.KeyEvents.codes[BDFDB.LibraryModules.KeyCodeUtils.codeToKey(platformkey)] || platformkey[1]), this);
		}
		handleReset() {
			this.props.defaultValue = [];
			let recorder = BDFDB.ReactUtils.findOwner(this, {name: "KeybindRecorder"});
			if (recorder) recorder.setState({codes: []});
			if (typeof this.props.onChange == "function") this.props.onChange([], this);
			if (typeof this.props.onReset == "function") this.props.onReset(this);
		}
		render() {
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
				className: BDFDB.disCN.hotkeywrapper,
				direction: InternalComponents.LibraryComponents.Flex.Direction.HORIZONTAL,
				align: InternalComponents.LibraryComponents.Flex.Align.CENTER,
				children: [
					BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.KeybindRecorder, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
						defaultValue: [this.props.defaultValue].flat(10).filter(n => n).map(keycode => [BDFDB.DiscordConstants.KeyboardDeviceTypes.KEYBOARD_KEY, keycode, BDFDB.DiscordConstants.KeyboardEnvs.BROWSER]),
						onChange: this.handleChange.bind(this)
					}), "reset", "onReset")),
					this.props.reset || this.props.onReset ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TooltipContainer, {
						text: BDFDB.LanguageUtils.LanguageStrings.REMOVE_KEYBIND,
						tooltipConfig: {type: "top"},
						children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Clickable, {
							className: BDFDB.disCN.hotkeyresetbutton,
							onClick: this.handleReset.bind(this),
							children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SvgIcon, {
								iconSVG: `<svg height="20" width="20" viewBox="0 0 20 20"><path fill="currentColor" d="M 14.348 14.849 c -0.469 0.469 -1.229 0.469 -1.697 0 l -2.651 -3.030 -2.651 3.029 c -0.469 0.469 -1.229 0.469 -1.697 0 -0.469 -0.469 -0.469 -1.229 0 -1.697l2.758 -3.15 -2.759 -3.152 c -0.469 -0.469 -0.469 -1.228 0 -1.697 s 1.228 -0.469 1.697 0 l 2.652 3.031 2.651 -3.031 c 0.469 -0.469 1.228 -0.469 1.697 0 s 0.469 1.229 0 1.697l -2.758 3.152 2.758 3.15 c 0.469 0.469 0.469 1.229 0 1.698 z"></path></svg>`,
							})
						})
					}) : null
				].filter(n => n)
			});
		}
	};
	
	InternalComponents.LibraryComponents.LazyImage = BDFDB.ModuleUtils.findByName("LazyImage");
	
	InternalComponents.LibraryComponents.ListHeader = BDFDB.ModuleUtils.findByName("ListSectionItem");
	
	InternalComponents.LibraryComponents.ListRow = InternalBDFDB.loadPatchedComp("ListRow") || reactInitialized && class BDFDB_ListRow extends LibraryModules.React.Component {
		render () {
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.listrow, this.props.className),
				children: [
					this.props.prefix,
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.listrowcontent,
						style: {flex: "1 1 auto"},
						children: [
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.listname, this.props.labelClassName),
								style: {flex: "1 1 auto"},
								children: this.props.label
							}),
							typeof this.props.note == "string" ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormText, {
								type: InternalComponents.LibraryComponents.FormComponents.FormText.Types.DESCRIPTION,
								children: this.props.note
							}) : null
						].filter(n => n)
					}),
					this.props.suffix
				].filter(n => n)
			});
		}
	};
	
	InternalComponents.LibraryComponents.MessageGroup = BDFDB.ModuleUtils.findByName("ChannelMessage");
	
	InternalComponents.LibraryComponents.MessagesPopoutComponents = BDFDB.ModuleUtils.findByProperties("Header", "EmptyStateBottom");
	
	InternalComponents.LibraryComponents.MemberRole = InternalBDFDB.loadPatchedComp("MemberRole") || reactInitialized && class BDFDB_MemberRole extends LibraryModules.React.Component {
		handleClick(e) {if (typeof this.props.onClick == "function") this.props.onClick(e, this);}
		handleContextMenu(e) {if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);}
		render() {
			let color = BDFDB.ColorUtils.convert(this.props.role.colorString || BDFDB.DiscordConstants.Colors.PRIMARY_DARK_300, "RGB");
			return BDFDB.ReactUtils.createElement("li", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.userpopoutrole, this.props.className),
				style: {borderColor: BDFDB.ColorUtils.setAlpha(color, 0.6)},
				onClick: this.handleClick.bind(this),
				onContextMenu: this.handleContextMenu.bind(this),
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
	};
	
	InternalComponents.LibraryComponents.ModalComponents = Object.assign({}, BDFDB.ModuleUtils.findByProperties("ModalContent", "ModalFooter"));
	
	InternalComponents.LibraryComponents.ModalComponents.ModalContent = InternalBDFDB.loadPatchedComp("ModalComponents.ModalContent") || reactInitialized && class BDFDB_ModalContent extends LibraryModules.React.Component {
		render() {
			return this.props.scroller ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ScrollerVertical, {
				outerClassName: BDFDB.disCN.modalcontent,
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.modalsubinner, this.props.className),
				theme: InternalComponents.LibraryComponents.ScrollerVertical.Themes.GHOST_HAIRLINE,
				ref: this.props.scrollerRef,
				children: this.props.children
			}) : BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
				className: BDFDB.disCN.modalcontent,
				direction: InternalComponents.LibraryComponents.Flex.Direction.VERTICAL,
				align: InternalComponents.LibraryComponents.Flex.Align.STRETCH,
				children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.modalsubinner, BDFDB.disCN.modalsubinnerscrollerless, this.props.className),
					direction: InternalComponents.LibraryComponents.Flex.Direction.VERTICAL,
					align: InternalComponents.LibraryComponents.Flex.Align.STRETCH,
					children: this.props.children
				})
			});
		}
	};
	InternalBDFDB.setDefaultProps(InternalComponents.LibraryComponents.ModalComponents.ModalContent, {scroller:true});
	
	InternalComponents.LibraryComponents.ModalComponents.ModalTabContent = InternalBDFDB.loadPatchedComp("ModalComponents.ModalTabContent") || reactInitialized && class BDFDB_ModalTabContent extends LibraryModules.React.Component {
		render() {
			let childprops = Object.assign({}, this.props);
			BDFDB.ObjectUtils.delete(childprops, "open");
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, Object.assign({tab:"unnamed"}, childprops, {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.modaltabcontent, this.props.open && BDFDB.disCN.modaltabcontentopen, this.props.className),
				direction: InternalComponents.LibraryComponents.Flex.Direction.VERTICAL,
				align: InternalComponents.LibraryComponents.Flex.Align.STRETCH,
				style: Object.assign({}, childprops.style, {
					display: this.props.open ? null : "none"
				})
			}));
		}
	};
	
	InternalComponents.LibraryComponents.NavItem = BDFDB.ModuleUtils.findByName("NavItem");
	
	InternalComponents.LibraryComponents.Popout = InternalBDFDB.loadPatchedComp("Popout") || reactInitialized && class BDFDB_Popout extends LibraryModules.React.Component {
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
	};
	
	InternalComponents.LibraryComponents.PopoutContainer = InternalBDFDB.loadPatchedComp("PopoutContainer") || reactInitialized && class BDFDB_PopoutContainer extends LibraryModules.React.Component {
		handleRender(e) {
			let children = typeof this.props.renderPopout == "function" ? this.props.renderPopout(this) : null;
			return this.popout = !children ? null : (!this.props.wrap ? children : BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Popout, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
				className: this.props.popoutClassName,
				containerInstance: this,
				isChild: true,
				position: e.position,
				style: this.props.popoutStyle,
				onClose: typeof this.props.onClose == "function" ? this.props.onClose.bind(this) : _ => {},
				children: typeof this.props.renderPopout == "function" ? this.props.renderPopout(this) : null
			}), "popoutStyle", "popoutClassName")));
		}
		componentDidMount() {
			let basepopout = BDFDB.ReactUtils.findOwner(this, {name:"BasePopout"});
			if (!basepopout || !basepopout.handleClick) return;
			this.handleClick = e => {return basepopout.handleClick(BDFDB.ObjectUtils.is(e) ? e : (new MouseEvent({})));};
			this.close = basepopout.close;
			this.domElementRef = basepopout.domElementRef;
		}
		render() {
			let child = (BDFDB.ArrayUtils.is(this.props.children) ? this.props.children[0] : this.props.children) || BDFDB.ReactUtils.createElement("div", {style: {height: "100%", width: "100%"}});
			child.props.className = BDFDB.DOMUtils.formatClassName(child.props.className, this.props.className);
			let childClick = child.props.onClick, childContextMenu = child.props.onContextMenu;
			child.props.onClick = (e, childThis) => {
				if (!this.domElementRef.current || this.domElementRef.current.contains(e.target)) {
					if ((this.props.openOnClick || this.props.openOnClick === undefined) && typeof this.handleClick == "function") this.handleClick(e);
					if (typeof this.props.onClick == "function") this.props.onClick(e, this);
					if (typeof childClick == "function") childClick(e, childThis);
				}
				else e.stopPropagation();
			};
			child.props.onContextMenu = (e, childThis) => {
				if (!this.domElementRef.current || this.domElementRef.current.contains(e.target)) {
					if (this.props.openOnContextMenu && typeof this.handleClick == "function") this.handleClick(e);
					if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);
					if (typeof childContextMenu == "function") childContextMenu(e, childThis);
				}
				else e.stopPropagation();
			};
			return BDFDB.ReactUtils.createElement(LibraryModules.React.Fragment, {
				children: BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.PopoutContainer, Object.assign({}, this.props, {
					children: _ => {return child;},
					renderPopout: this.handleRender.bind(this)
				}))
			});
		}
	};
	InternalBDFDB.setDefaultProps(InternalComponents.LibraryComponents.PopoutContainer, {wrap:true});
	
	InternalComponents.LibraryComponents.PrivateChannelItems = BDFDB.ModuleUtils.findByProperties("DirectMessage", "GroupDM");
	
	InternalComponents.LibraryComponents.QuickSelect = InternalBDFDB.loadPatchedComp("QuickSelect") || reactInitialized && class BDFDB_QuickSelect extends LibraryModules.React.Component {
		handleChange(option) {
			this.props.value = option;
			if (typeof this.props.onChange == "function") this.props.onChange(option.value || option.key, this);
			BDFDB.ReactUtils.forceUpdate(this);
		}
		render() {
			let options = (BDFDB.ArrayUtils.is(this.props.options) ? this.props.options : [{}]).filter(n => n);
			let selectedOption = BDFDB.ObjectUtils.is(this.props.value) ? this.props.value : (options[0] || {});
			return this.props.nativeComponent ? BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.QuickSelect, Object.assign({}, this.props, {
				className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.quickselectwrapper),
				popoutClassName: BDFDB.DOMUtils.formatClassName(this.props.popoutClassName, BDFDB.disCN.quickselectpopoutwrapper),
				popoutProps: {position: "bottom", zIndexBoost: 1000},
				value: selectedOption,
				options: options,
				renderOption: typeof this.props.renderOption == "function" ? this.props.renderOption : option => option.label,
				onChange: this.handleChange.bind(this)
			})) : BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.PopoutContainer, Object.assign({}, this.props, {
				children: BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.DOMUtils.formatClassName(this.props.className, BDFDB.disCN.quickselectwrapper),
					children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
						className: BDFDB.disCN.quickselect,
						align: InternalComponents.LibraryComponents.Flex.Align.CENTER,
						children: [
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.quickselectlabel,
								children: this.props.label
							}),
							BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
								align: InternalComponents.LibraryComponents.Flex.Align.CENTER,
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
				animation: InternalComponents.LibraryComponents.PopoutContainer.Animation.TRANSLATE,
				position: InternalComponents.LibraryComponents.PopoutContainer.Positions.BOTTOM,
				align: InternalComponents.LibraryComponents.PopoutContainer.Align.RIGHT,
				renderPopout: instance => {
					let items = options.map(option => {
						let selected = option.value && option.value === selectedOption.value || option.key && option.key === selectedOption.key;
						return typeof this.props.renderOption == "function" ? this.props.renderOption(option) : BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ContextMenuItems.Item, {
							className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.quickselectpopoutoption, selected && BDFDB.disCN.quickselectpopoutoptionselected),
							action: selected ? null : _ => {
								instance.close();
								this.handleChange.bind(this)(option)
							},
							label: option.label
						});
					});
					return this.props.scroller ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ScrollerVertical, {
						className: BDFDB.disCN.quickselectscroller,
						children: items
					}) : items;
				}
			}));
		}
	};
	
	InternalComponents.LibraryComponents.QuickSwitchItems = BDFDB.ModuleUtils.findByProperties("Channel", "GroupDM", "Header");
	
	InternalComponents.LibraryComponents.QuickSwitchMenu = BDFDB.ModuleUtils.findByName("QuickSwitcher");
	
	InternalComponents.LibraryComponents.RadioGroup = InternalBDFDB.loadPatchedComp("RadioGroup") || reactInitialized && class BDFDB_RadioGroup extends LibraryModules.React.Component {
		handleChange(value) {
			this.props.value = value.value;
			if (typeof this.props.onChange == "function") this.props.onChange(value, this);
			BDFDB.ReactUtils.forceUpdate(this);
		}
		render() {
			return BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.RadioGroup, Object.assign({}, this.props, {
				onChange: this.handleChange.bind(this)
			}));
		}
	};
	
	InternalComponents.LibraryComponents.ScrollerHorizontal = BDFDB.ModuleUtils.findByName("HorizontalScroller");
	
	InternalComponents.LibraryComponents.ScrollerVertical = BDFDB.ModuleUtils.findByName("VerticalScroller");
	
	InternalComponents.LibraryComponents.SearchBar = InternalBDFDB.loadPatchedComp("SearchBar") || reactInitialized && class BDFDB_SearchBar extends LibraryModules.React.Component {
		handleChange(query) {
			this.props.query = query;
			if (typeof this.props.onChange == "function") this.props.onChange(query, this);
			BDFDB.ReactUtils.forceUpdate(this);
		}
		handleClear() {
			this.props.query = "";
			if (this.props.changeOnClear && typeof this.props.onChange == "function") this.props.onChange("", this);
			if (typeof this.props.onClear == "function") this.props.onClear(this);
			BDFDB.ReactUtils.forceUpdate(this);
		}
		render() {
			let props = Object.assign({}, this.props, {
				onChange: this.handleChange.bind(this),
				onClear: this.handleClear.bind(this)
			});
			if (typeof props.query != "string") props.query = "";
			return BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.SearchBar, props);
		}
	};
	
	InternalComponents.LibraryComponents.Select = InternalBDFDB.loadPatchedComp("Select") || reactInitialized && class BDFDB_Select extends LibraryModules.React.Component {
		handleChange(value) {
			this.props.value = value;
			if (typeof this.props.onChange == "function") this.props.onChange(value, this);
			BDFDB.ReactUtils.forceUpdate(this);
		}
		render() {
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
				className: BDFDB.disCN.selectwrapper,
				direction: InternalComponents.LibraryComponents.Flex.Direction.HORIZONTAL,
				align: InternalComponents.LibraryComponents.Flex.Align.CENTER,
				children: BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.Select, Object.assign({}, this.props, {
					onChange: this.handleChange.bind(this)
				}))
			});
		}
	};
	
	InternalComponents.LibraryComponents.SettingsGuildList = InternalBDFDB.loadPatchedComp("SettingsGuildList") || reactInitialized && class BDFDB_SettingsGuildList extends LibraryModules.React.Component {
		render() {
			this.props.disabled = BDFDB.ArrayUtils.is(this.props.disabled) ? this.props.disabled : [];
			return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
				className: this.props.className,
				wrap: BDFDB.LibraryComponents.Flex.Wrap.WRAP,
				children: [this.props.includeDMs && {name:"Direct Messages", acronym:"DMs", id:BDFDB.DiscordConstants.ME, getIconURL: _ => {}}].concat(BDFDB.LibraryModules.FolderStore.getFlattenedGuilds()).filter(n => n).map(guild => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: guild.name,
					children: BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.DOMUtils.formatClassName(this.props.guildClassName, BDFDB.disCN.settingsguild, this.props.disabled.includes(guild.id) && BDFDB.disCN.settingsguilddisabled),
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Icon, {
							guild: guild,
							size: this.props.size || BDFDB.LibraryComponents.GuildComponents.Icon.Sizes.MEDIUM
						}),
						onClick: e => {
							let isDisabled = this.props.disabled.includes(guild.id);
							if (isDisabled) BDFDB.ArrayUtils.remove(this.props.disabled, guild.id, true);
							else this.props.disabled.push(guild.id);
							if (typeof this.props.onClick == "function") this.props.onClick(this.props.disabled, this);
							BDFDB.ReactUtils.forceUpdate(this);
						}
					})
				}))
			});
		}
	};
	
	InternalComponents.LibraryComponents.SettingsPanel = InternalBDFDB.loadPatchedComp("SettingsPanel") || reactInitialized && class BDFDB_SettingsPanel extends LibraryModules.React.Component {
		render() {
			return this.props.children ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
				direction: InternalComponents.LibraryComponents.Flex.Direction.VERTICAL,
				grow: 1,
				children: [
					typeof this.props.title == "string" ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormTitle, {
						className: BDFDB.disCN.settingspaneltitle,
						tag: InternalComponents.LibraryComponents.FormComponents.FormTitle.Tags.H2,
						children: this.props.title
					}) : null,
					typeof this.props.title == "string" ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormDivider, {
						className: BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom8
					}) : null,
					BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
						className: BDFDB.disCN.settingspanelinner,
						direction: InternalComponents.LibraryComponents.Flex.Direction.VERTICAL,
						children: this.props.children
					})
				]
			}) : null;
		}
	};
	
	InternalComponents.LibraryComponents.SettingsPanelInner = InternalBDFDB.loadPatchedComp("SettingsPanelInner") || reactInitialized && class BDFDB_SettingsPanelInner extends LibraryModules.React.Component {
		render() {
			return this.props.children ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
				className: this.props.className,
				direction: InternalComponents.LibraryComponents.Flex.Direction.VERTICAL,
				children: [
					!this.props.first ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormDivider, {
						className: BDFDB.disCN.marginbottom8
					}) : null,
					typeof this.props.title == "string" ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormTitle, {
						className: BDFDB.disCN.marginbottom4,
						tag: InternalComponents.LibraryComponents.FormComponents.FormTitle.Tags.H3,
						children: this.props.title
					}) : null,
					BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
						className: BDFDB.disCN.settingspanellist,
						direction: InternalComponents.LibraryComponents.Flex.Direction.VERTICAL,
						children: this.props.children
					}),
					!this.props.last ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormDivider, {
						className: BDFDB.disCN.marginbottom20
					}) : null
				]
			}) : null;
		}
	};
	
	InternalComponents.LibraryComponents.SettingsItem = InternalBDFDB.loadPatchedComp("SettingsItem") || reactInitialized && class BDFDB_SettingsItem extends LibraryModules.React.Component {
		handleChange(value) {
			if (typeof this.props.onChange == "function") this.props.onChange(value, this);
		}
		render() {
			if (typeof this.props.type != "string" || !["BUTTON", "SELECT", "SWITCH", "TEXTINPUT"].includes(this.props.type.toUpperCase())) return null;
			let childcomponent = InternalComponents.LibraryComponents[this.props.type];
			if (!childcomponent) return null;
			if (this.props.mini && childcomponent.Sizes) this.props.size = childcomponent.Sizes.MINI || childcomponent.Sizes.MIN;
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
				className: BDFDB.DOMUtils.formatClassName(this.props.className, this.props.disabled && BDFDB.disCN.disabled),
				id: this.props.id,
				direction: InternalComponents.LibraryComponents.Flex.Direction.VERTICAL,
				align: InternalComponents.LibraryComponents.Flex.Align.STRETCH,
				grow: this.props.grow,
				stretch: this.props.stretch,
				children: [
					this.props.dividertop ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormDivider, {
						className: this.props.mini ? BDFDB.disCN.marginbottom4 : BDFDB.disCN.marginbottom8
					}) : null,
					BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
						align: InternalComponents.LibraryComponents.Flex.Align.CENTER,
						children: [
							this.props.label ? (this.props.tag ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormTitle, {
								className: BDFDB.DOMUtils.formatClassName(this.props.labelClassName, BDFDB.disCN.marginreset),
								tag: this.props.tag,
								children: this.props.label
							}) : BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex.Child, {
								children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SettingsLabel, {
									className: this.props.labelClassName,
									mini: this.props.mini,
									label: this.props.label
								})
							})) : null,
							this.props.labelchildren,
							BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex.Child, {
								grow: 0,
								shrink: this.props.basis ? 0 : 1,
								basis: this.props.basis,
								wrap: true,
								children: BDFDB.ReactUtils.createElement(childcomponent, BDFDB.ObjectUtils.exclude(Object.assign(BDFDB.ObjectUtils.exclude(this.props, "className", "id", "type"), this.props.childProps, {onChange: this.handleChange.bind(this)}), "grow", "stretch", "basis", "dividerbottom", "dividertop", "label", "labelClassName", "labelchildren", "tag", "mini", "note", "childProps"))
							})
						].flat(10).filter(n => n)
					}),
					typeof this.props.note == "string" ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex.Child, {
						className: BDFDB.disCN.note,
						children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormText, {
							disabled: this.props.disabled,
							type: InternalComponents.LibraryComponents.FormComponents.FormText.Types.DESCRIPTION,
							children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TextScroller, {speed: 2, children: this.props.note})
						})
					}) : null,
					this.props.dividerbottom ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FormComponents.FormDivider, {
						className: this.props.mini ? BDFDB.disCN.margintop4 : BDFDB.disCN.margintop8
					}) : null
				]
			});
		}
	};
	
	InternalComponents.LibraryComponents.SettingsLabel = InternalBDFDB.loadPatchedComp("SettingsLabel") || reactInitialized && class BDFDB_SettingsLabel extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TextScroller, {
				className: BDFDB.DOMUtils.formatClassName(this.props.className, this.props.mini ? BDFDB.disCN.titlemini : BDFDB.disCN.titledefault, BDFDB.disCN.cursordefault),
				speed: 2,
				children: this.props.label
			});
		}	
	};
	
	InternalComponents.LibraryComponents.SettingsList = InternalBDFDB.loadPatchedComp("SettingsList") || reactInitialized && class BDFDB_SettingsList extends LibraryModules.React.Component {
		componentDidMount() {
			let list = BDFDB.ReactUtils.findDOMNode(this);
			if (list && !this.props.maxWidth) {
				let headers = Array.from(list.querySelectorAll(BDFDB.dotCN.settingstableheader));
				headers.shift();
				if (BDFDB.DOMUtils.getRects(headers[0]).width == 0) BDFDB.TimeUtils.timeout(_ => {this.resizeList(list, headers);});
				else this.resizeList(list, headers);
			}
		}
		resizeList(list, headers) {
			let maxWidth = 0, biggestWidth = 0;
			if (!maxWidth) {
				for (let header of headers) {
					header.style = "";
					let width = BDFDB.DOMUtils.getRects(header).width;
					maxWidth = width > maxWidth ? width : maxWidth;
				}
				maxWidth += 4;
				biggestWidth = maxWidth;
			}
			if (headers.length * maxWidth > 300) {
				this.props.vertical = true;
				maxWidth = parseInt(290 / headers.length);
			}
			else if (maxWidth < 36) {
				maxWidth = 36;
				biggestWidth = maxWidth;
			}
			this.props.maxWidth = maxWidth;
			this.props.biggestWidth = biggestWidth;
			this.props.fullWidth = BDFDB.DOMUtils.getRects(list).width;
			BDFDB.ReactUtils.forceUpdate(this);
		}
		render() {
			this.props.settings = BDFDB.ArrayUtils.is(this.props.settings) ? this.props.settings : [];
			this.props.renderLabel = typeof this.props.renderLabel == "function" ? this.props.renderLabel : data => data.label;
			let labelWidth = this.props.maxWidth && this.props.fullWidth && (this.props.fullWidth - 20 - (this.props.maxWidth * this.props.settings.length));
			let configWidth = this.props.maxWidth && this.props.maxWidth * this.props.settings.length;
			let isHeaderClickable = typeof this.props.onHeaderClick == "function" || typeof this.props.onHeaderContextMenu == "function";
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.settingstablelist, this.props.className),
				children: [
					BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
						className: BDFDB.disCN.settingstableheaders,
						align: InternalComponents.LibraryComponents.Flex.Align.STRETCH,
						style: this.props.vertical && this.props.biggestWidth ? {
							marginTop: this.props.biggestWidth - 15 || 0
						} : {},
						children: [].concat(this.props.title || "", this.props.settings).map((setting, i) => BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.DOMUtils.formatClassName(i == 0 ? BDFDB.disCN.settingstableheadername : BDFDB.disCN.settingstableheaderoption, i != 0 && this.props.vertical && BDFDB.disCN.settingstableheadervertical, BDFDB.disCN.colorbase, BDFDB.disCN.size10, isHeaderClickable && BDFDB.disCN.cursorpointer),
							onClick: _ => {if (typeof this.props.onHeaderClick == "function") this.props.onHeaderClick(setting, this);},
							onContextMenu: _ => {if (typeof this.props.onHeaderContextMenu == "function") this.props.onHeaderContextMenu(setting, this);},
							style: i != 0 && this.props.maxWidth ? {
								maxWidth: this.props.maxWidth,
								width: this.props.maxWidth,
								flex: `0 0 ${this.props.maxWidth}px`
							} : {},
							children: BDFDB.ReactUtils.createElement("span", {
								children: setting
							})
						}))
					}),
					(BDFDB.ArrayUtils.is(this.props.data) ? this.props.data : [{}]).filter(n => n).map(data => BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Card, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
						className: BDFDB.DOMUtils.formatClassName([this.props.cardClassName, data.className].filter(n => n).join(" ").indexOf(BDFDB.disCN.card) == -1 && BDFDB.disCN.cardprimaryoutline, BDFDB.disCN.settingstablecard, this.props.cardClassName, data.className),
						cardId: data.key,
						backdrop: false,
						style: Object.assign({}, this.props.cardStyle, data.style),
						children: [
							BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
								className: BDFDB.disCN.settingstablecardlabel,
								align: InternalComponents.LibraryComponents.Flex.Align.CENTER,
								grow: 0,
								shrink: 0,
								basis: labelWidth || "auto",
								style: {maxWidth: labelWidth || null},
								children: this.props.renderLabel(data)
							}),
							BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
								className: BDFDB.disCN.settingstablecardconfigs,
								justify: InternalComponents.LibraryComponents.Flex.Justify.AROUND,
								align: InternalComponents.LibraryComponents.Flex.Align.CENTER,
								grow: 0,
								shrink: 0,
								basis: configWidth || "auto",
								style: {maxWidth: configWidth || null},
								children: this.props.settings.map(setting => BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex.Child, {
									className: BDFDB.disCN.checkboxcontainer,
									grow: 0,
									shrink: 0,
									wrap: true,
									children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Checkbox, {
										disabled: data.disabled,
										cardId: data.key,
										settingId: setting,
										shape: InternalComponents.LibraryComponents.Checkbox.Shapes.ROUND,
										type: InternalComponents.LibraryComponents.Checkbox.Types.INVERTED,
										value: data[setting],
										onChange: this.props.onCheckboxChange
									})
								})).flat(10).filter(n => n)
							})
						]
					}), "title", "data", "settings", "renderLabel", "cardClassName", "cardStyle", "onCheckboxChange", "maxWidth", "fullWidth")))
				]
			});
		}
	};
	
	InternalComponents.LibraryComponents.SettingsSaveItem = InternalBDFDB.loadPatchedComp("SettingsSaveItem") || reactInitialized && class BDFDB_SettingsSaveItem extends LibraryModules.React.Component {
		saveSettings(value) {
			if (!BDFDB.ArrayUtils.is(this.props.keys) || !BDFDB.ObjectUtils.is(this.props.plugin)) return;
			let keys = this.props.keys.filter(n => n);
			let option = keys.shift();
			if (BDFDB.ObjectUtils.is(this.props.plugin) && option) {
				let data = BDFDB.DataUtils.load(this.props.plugin, option);
				let newdata = "";
				for (let key of keys) newdata += `{"${key}":`;
				value = value != null && value.value != null ? value.value : value;
				let isString = typeof value == "string";
				let marker = isString ? `"` : ``;
				newdata += (marker + (isString ? value.replace(/\\/g, "\\\\") : value) + marker) + "}".repeat(keys.length);
				newdata = JSON.parse(newdata);
				BDFDB.DataUtils.save(BDFDB.ObjectUtils.is(newdata) ? BDFDB.ObjectUtils.deepAssign({}, data, newdata) : newdata, this.props.plugin, option);
				this.props.plugin.SettingsUpdated = true;
			}
			if (typeof this.props.onChange == "function") this.props.onChange(value, this);
		}
		render() {
			if (typeof this.props.type != "string" || !["SELECT", "SWITCH", "TEXTINPUT"].includes(this.props.type.toUpperCase())) return null;
			return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SettingsItem, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
				onChange: this.saveSettings.bind(this)
			}), "keys", "plugin"));
		}
	};
	
	InternalComponents.LibraryComponents.Slider = InternalBDFDB.loadPatchedComp("Slider") || reactInitialized && class BDFDB_Slider extends LibraryModules.React.Component {
		handleValueChange(value) {
			let newvalue = BDFDB.ArrayUtils.is(this.props.edges) && this.props.edges.length == 2 ? BDFDB.NumberUtils.mapRange([0, 100], this.props.edges, value) : value;
			if (typeof this.props.digits == "number") newvalue = Math.round(newvalue * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits);
			this.props.defaultValue = newvalue;
			if (typeof this.props.onValueChange == "function") this.props.onValueChange(newvalue, this);
			BDFDB.ReactUtils.forceUpdate(this);
		}
		handleValueRender(value) {
			let newvalue = BDFDB.ArrayUtils.is(this.props.edges) && this.props.edges.length == 2 ? BDFDB.NumberUtils.mapRange([0, 100], this.props.edges, value) : value;
			if (typeof this.props.digits == "number") newvalue = Math.round(newvalue * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits);
			if (typeof this.props.onValueRender == "function") {
				let tempreturn = this.props.onValueRender(newvalue, this);
				if (tempreturn != undefined) newvalue = tempreturn;
			}
			return newvalue;
		}
		render() {
			let defaultValue = BDFDB.ArrayUtils.is(this.props.edges) && this.props.edges.length == 2 ? BDFDB.NumberUtils.mapRange(this.props.edges, [0, 100], this.props.defaultValue) : this.props.defaultValue;
			if (typeof this.props.digits == "number") defaultValue = Math.round(defaultValue * Math.pow(10, this.props.digits)) / Math.pow(10, this.props.digits);
			return BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.Slider, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
				initialValue: defaultValue,
				onValueChange: this.handleValueChange.bind(this),
				onValueRender: this.handleValueRender.bind(this)
			}), "digits", "edges"));
		}
	};
	
	InternalComponents.LibraryComponents.Spinner = BDFDB.ModuleUtils.findByName("Spinner");
	
	InternalComponents.LibraryComponents.SvgIcon = InternalBDFDB.loadPatchedComp("SvgIcon") || reactInitialized && class BDFDB_Icon extends LibraryModules.React.Component {
		render() {
			if (BDFDB.ObjectUtils.is(this.props.name)) {
				if (this.props.className) this.props.nativeClass = true;
				this.props.iconSVG = this.props.name.icon;
				let props = Object.assign({
					width: 24,
					height: 24,
					color: "currentColor"
				}, this.props.name.defaultProps, this.props);
				for (let key in props) this.props.iconSVG = this.props.iconSVG.replace(new RegExp(`%%${key}`, "g"), props[key]);
			}
			if (this.props.iconSVG) {
				let icon = BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(this.props.iconSVG));
				if (BDFDB.ReactUtils.isValidElement(icon)) {
					icon.props.className = BDFDB.DOMUtils.formatClassName(!this.props.nativeClass && BDFDB.disCN.svgicon, icon.props.className, this.props.className);
					icon.props.style = Object.assign({}, icon.props.style, this.props.style);
					icon.props = Object.assign({}, BDFDB.ObjectUtils.extract(this.props, "onClick", "onContextMenu", "onMouseDown", "onMouseUp", "onMouseEnter", "onMouseLeave"), icon.props);
					return icon;
				}
			}
			return null;
		}
	};
	InternalComponents.LibraryComponents.SvgIcon.Names = {
		CHANGELOG: {
			icon: `<svg name="ChangeLog" viewBox="0 0 24 24" fill="%%color" width="%%width" height="%%height"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"></path></svg>`
		},
		CHECKMARK: {
			defaultProps: {
				width: 18,
				height: 18
			},
			icon: `<svg name="Checkmark" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 18 18"><g fill="none" fill-rule="evenodd"><polyline stroke="%%color" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg>`
		},
		CLOSE: {
			defaultProps: {
				width: 12,
				height: 12
			},
			icon: `<svg name="Close" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 12 12"><g fill="none" fill-rule="evenodd" aria-hidden="true"><path d="M0 0h12v12H0"></path><path class="fill" fill="%%color" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg>`
		},
		CLOSE_CIRCLE: {
			icon: `<svg name="CloseCircle" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 14 14"><path fill="%%color" d="M7.02799 0.333252C3.346 0.333252 0.361328 3.31792 0.361328 6.99992C0.361328 10.6819 3.346 13.6666 7.02799 13.6666C10.71 13.6666 13.6947 10.6819 13.6947 6.99992C13.6947 3.31792 10.7093 0.333252 7.02799 0.333252ZM10.166 9.19525L9.22333 10.1379L7.02799 7.94325L4.83266 10.1379L3.89 9.19525L6.08466 6.99992L3.88933 4.80459L4.832 3.86259L7.02733 6.05792L9.22266 3.86259L10.1653 4.80459L7.97066 6.99992L10.166 9.19525Z"></path></svg>`
		},
		CROWN: {
			icon: `<svg name="Crown" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.6572 5.42868C13.8879 5.29002 14.1806 5.30402 14.3973 5.46468C14.6133 5.62602 14.7119 5.90068 14.6473 6.16202L13.3139 11.4954C13.2393 11.7927 12.9726 12.0007 12.6666 12.0007H3.33325C3.02725 12.0007 2.76058 11.792 2.68592 11.4954L1.35258 6.16202C1.28792 5.90068 1.38658 5.62602 1.60258 5.46468C1.81992 5.30468 2.11192 5.29068 2.34325 5.42868L5.13192 7.10202L7.44592 3.63068C7.46173 3.60697 7.48377 3.5913 7.50588 3.57559C7.5192 3.56612 7.53255 3.55663 7.54458 3.54535L6.90258 2.90268C6.77325 2.77335 6.77325 2.56068 6.90258 2.43135L7.76458 1.56935C7.89392 1.44002 8.10658 1.44002 8.23592 1.56935L9.09792 2.43135C9.22725 2.56068 9.22725 2.77335 9.09792 2.90268L8.45592 3.54535C8.46794 3.55686 8.48154 3.56651 8.49516 3.57618C8.51703 3.5917 8.53897 3.60727 8.55458 3.63068L10.8686 7.10202L13.6572 5.42868ZM2.66667 12.6673H13.3333V14.0007H2.66667V12.6673Z" fill="%%color" aria-hidden="true"></path></svg>`
		},
		DROPPER: {
			defaultProps: {
				width: 16,
				height: 16,
				foreground: ""
			},
			icon: `<svg width="%%width" height="%%height" viewBox="0 0 16 16"><g fill="none"><path d="M-4-4h24v24H-4z"></path><path className="%%foreground" fill="%%color" d="M14.994 1.006C13.858-.257 11.904-.3 10.72.89L8.637 2.975l-.696-.697-1.387 1.388 5.557 5.557 1.387-1.388-.697-.697 1.964-1.964c1.13-1.13 1.3-2.985.23-4.168zm-13.25 10.25c-.225.224-.408.48-.55.764L.02 14.37l1.39 1.39 2.35-1.174c.283-.14.54-.33.765-.55l4.808-4.808-2.776-2.776-4.813 4.803z"></path></g></svg>`
		},
		FOLDER: {
			icon: `<svg name="Folder" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 24 24"><path fill="%%color" d="M20 7H12L10.553 5.106C10.214 4.428 9.521 4 8.764 4H3C2.447 4 2 4.447 2 5V19C2 20.104 2.895 21 4 21H20C21.104 21 22 20.104 22 19V9C22 7.896 21.104 7 20 7Z"></path></svg>`
		},
		GITHUB: {
			icon: `<svg name="Github" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 24 24"><g fill="%%color" transform="translate(2, 2)"><path d="M 7.19, 16.027 c -0.139, 0.026 -0.199, 0.091 -0.182, 0.195 c 0.017, 0.104, 0.095, 0.138, 0.234, 0.104 c 0.139 -0.035, 0.199 -0.095, 0.182 -0.182 C 7.406, 16.049, 7.328, 16.01, 7.19, 16.027 z"></path><path d="M 6.45, 16.131 c -0.138, 0 -0.208, 0.047 -0.208, 0.143 c 0, 0.112, 0.074, 0.16, 0.221, 0.143 c 0.138, 0, 0.208 -0.048, 0.208 -0.143 C 6.671, 16.162, 6.597, 16.114, 6.45, 16.131 z"></path><path d="M 5.438, 16.092 c -0.035, 0.095, 0.022, 0.16, 0.169, 0.195 c 0.13, 0.052, 0.212, 0.026, 0.247 -0.078 c 0.026 -0.095 -0.03 -0.164 -0.169 -0.208 C 5.554, 15.967, 5.472, 15.996, 5.438, 16.092 z"></path><path d="M 18.837, 1.097 C 18.106, 0.366, 17.226, 0, 16.196, 0 H 3.738 C 2.708, 0, 1.828, 0.366, 1.097, 1.097 C 0.366, 1.828, 0, 2.708, 0, 3.738 v 12.459 c 0, 1.03, 0.366, 1.91, 1.097, 2.641 c 0.731, 0.731, 1.612, 1.097, 2.641, 1.097 h 2.907 c 0.19, 0, 0.333 -0.007, 0.428 -0.019 c 0.095 -0.013, 0.19 -0.069, 0.285 -0.169 c 0.095 -0.099, 0.143 -0.244, 0.143 -0.435 c 0 -0.026 -0.002 -0.32 -0.007 -0.883 c -0.004 -0.562 -0.007 -1.008 -0.007 -1.337 l -0.298, 0.052 c -0.19, 0.035 -0.43, 0.05 -0.72, 0.045 c -0.29 -0.004 -0.59 -0.035 -0.902 -0.091 c -0.312 -0.056 -0.601 -0.186 -0.87 -0.389 c -0.268 -0.203 -0.458 -0.469 -0.571 -0.798 l -0.13 -0.299 c -0.086 -0.199 -0.223 -0.419 -0.409 -0.662 c -0.186 -0.242 -0.374 -0.407 -0.564 -0.493 l -0.091 -0.065 c -0.06 -0.043 -0.117 -0.095 -0.169 -0.156 c -0.052 -0.061 -0.091 -0.121 -0.117 -0.182 c -0.026 -0.061 -0.004 -0.11, 0.065 -0.149 c 0.069 -0.039, 0.195 -0.058, 0.376 -0.058 l 0.259, 0.039 c 0.173, 0.035, 0.387, 0.138, 0.642, 0.311 c 0.255, 0.173, 0.465, 0.398, 0.629, 0.675 c 0.199, 0.355, 0.439, 0.625, 0.72, 0.811 c 0.281, 0.186, 0.565, 0.279, 0.85, 0.279 s 0.532 -0.022, 0.74 -0.065 c 0.208 -0.043, 0.402 -0.108, 0.584 -0.195 c 0.078 -0.58, 0.29 -1.025, 0.636 -1.337 c -0.493 -0.052 -0.936 -0.13 -1.33 -0.234 c -0.394 -0.104 -0.8 -0.272 -1.22 -0.506 c -0.42 -0.234 -0.768 -0.523 -1.045 -0.87 c -0.277 -0.346 -0.504 -0.8 -0.681 -1.363 c -0.177 -0.562 -0.266 -1.211 -0.266 -1.947 c 0 -1.047, 0.342 -1.938, 1.025 -2.673 c -0.32 -0.787 -0.29 -1.67, 0.091 -2.647 c 0.251 -0.078, 0.623 -0.019, 1.116, 0.175 c 0.493, 0.195, 0.854, 0.361, 1.084, 0.5 c 0.229, 0.138, 0.413, 0.255, 0.552, 0.35 c 0.805 -0.225, 1.635 -0.337, 2.492 -0.337 c 0.856, 0, 1.687, 0.112, 2.492, 0.337 l 0.493 -0.311 c 0.338 -0.208, 0.735 -0.398, 1.194 -0.571 c 0.459 -0.173, 0.809 -0.221, 1.051 -0.143 c 0.389, 0.978, 0.424, 1.86, 0.104, 2.647 c 0.683, 0.735, 1.025, 1.627, 1.025, 2.673 c 0, 0.735 -0.089, 1.387 -0.266, 1.953 c -0.177, 0.567 -0.406, 1.021 -0.688, 1.363 c -0.281, 0.342 -0.632, 0.629 -1.051, 0.863 c -0.42, 0.234 -0.826, 0.402 -1.22, 0.506 c -0.394, 0.104 -0.837, 0.182 -1.33, 0.234 c 0.45, 0.389, 0.675, 1.003, 0.675, 1.843 v 3.102 c 0, 0.147, 0.021, 0.266, 0.065, 0.357 c 0.044, 0.091, 0.113, 0.153, 0.208, 0.188 c 0.096, 0.035, 0.18, 0.056, 0.253, 0.065 c 0.074, 0.009, 0.18, 0.013, 0.318, 0.013 h 2.907 c 1.029, 0, 1.91 -0.366, 2.641 -1.097 c 0.731 -0.731, 1.097 -1.612, 1.097 -2.641 V 3.738 C 19.933, 2.708, 19.568, 1.827, 18.837, 1.097 z"></path><path d="M 3.945, 14.509 c -0.06, 0.043 -0.052, 0.112, 0.026, 0.208 c 0.087, 0.086, 0.156, 0.1, 0.208, 0.039 c 0.061 -0.043, 0.052 -0.112 -0.026 -0.208 C 4.066, 14.47, 3.997, 14.457, 3.945, 14.509 z"></path><path d="M 3.517, 14.184 c -0.026, 0.061, 0.004, 0.113, 0.091, 0.156 c 0.069, 0.043, 0.126, 0.035, 0.169 -0.026 c 0.026 -0.061 -0.004 -0.113 -0.091 -0.156 C 3.599, 14.132, 3.543, 14.141, 3.517, 14.184 z"></path><path d="M 4.348, 15.015 c -0.078, 0.043 -0.078, 0.121, 0, 0.234 c 0.078, 0.113, 0.151, 0.143, 0.221, 0.091 c 0.078 -0.061, 0.078 -0.143, 0 -0.247 C 4.499, 14.981, 4.425, 14.954, 4.348, 15.015 z"></path><path d="M 4.802, 15.599 c -0.078, 0.069 -0.061, 0.151, 0.052, 0.247 c 0.104, 0.104, 0.19, 0.117, 0.259, 0.039 c 0.069 -0.069, 0.052 -0.151 -0.052 -0.246 C 4.958, 15.534, 4.871, 15.521, 4.802, 15.599 z"></path></g></svg>`
		},
		LEFT_CARET: {
			icon: `<svg name="LeftCaret" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><polygon fill="%%color" fill-rule="nonzero" points="18.35 4.35 16 2 6 12 16 22 18.35 19.65 10.717 12"></polygon><polygon points="0 0 24 0 24 24 0 24"></polygon></g></svg>`
		},
		LOCK_CLOSED: {
			icon: `<svg name="LockClosed" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 24 24"><path fill="%%color" d="M17 11V7C17 4.243 14.756 2 12 2C9.242 2 7 4.243 7 7V11C5.897 11 5 11.896 5 13V20C5 21.103 5.897 22 7 22H17C18.103 22 19 21.103 19 20V13C19 11.896 18.103 11 17 11ZM12 18C11.172 18 10.5 17.328 10.5 16.5C10.5 15.672 11.172 15 12 15C12.828 15 13.5 15.672 13.5 16.5C13.5 17.328 12.828 18 12 18ZM15 11H9V7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V11Z"></path></svg>`
		},
		NOVA_AT: {
			icon: `<svg name="Nova_At" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 24 24"><path fill="%%color" d="M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z"></path></svg>`
		},
		NOVA_PIN: {
			icon: `<svg name="Nova_Pin" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 24 24"><path fill="%%color" d="M22 12L12.101 2.10101L10.686 3.51401L12.101 4.92901L7.15096 9.87801V9.88001L5.73596 8.46501L4.32196 9.88001L8.56496 14.122L2.90796 19.778L4.32196 21.192L9.97896 15.536L14.222 19.778L15.636 18.364L14.222 16.95L19.171 12H19.172L20.586 13.414L22 12Z"></path></svg>`
		},
		NOVA_TRASH: {
			icon: `<svg name="Nova_Trash" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 24 24"><path fill="%%color" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path><path fill="%%color" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path></svg>`
		},
		PENCIL: {
			defaultProps: {
				width: 16,
				height: 16
			},
			icon: `<svg name="Pencil" aria-hidden="false" width="16" height="16" viewBox="0 0 24 24"><path fill="%%color" d="M20.1039 9.58997L20.8239 8.87097C22.3929 7.30197 22.3929 4.74797 20.8239 3.17797C19.2549 1.60897 16.6999 1.60897 15.1309 3.17797L14.4119 3.89797L20.1039 9.58997ZM12.9966 5.30896L4.42847 13.8795L10.1214 19.5709L18.6896 11.0003L12.9966 5.30896ZM3.24398 21.968L8.39998 20.68L3.31998 15.6L2.03098 20.756C1.94598 21.096 2.04598 21.457 2.29398 21.705C2.54198 21.953 2.90298 22.052 3.24398 21.968Z"></path></svg>`
		},
		PIN: {
			defaultProps: {
				width: 16,
				height: 16
			},
			icon: `<svg name="Pin" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path fill="%%color" d="M19 3H5V5H7V12H5V14H11V22H13V14H19V12H17V5H19V3Z"></path></g></svg>`
		},
		RAW_TEXT: {
			icon: `<svg name="RawText" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 48 48"><path fill="%%color" d="M 2,2 h 28 v 8 h -6 v -2 h -4 v 28 h 4 v 6 h -16 v -6 h 4 v -28 h -4 v 2 h -6 Z"></path><path fill="%%color" d="M 24,16 h 22 v 7 h -5 v -2 h -3 v 16 h 3 v 5 h -12 v -5 h 3 v -16 h -3 v 2 h -5 Z"></path></svg>`
		},
		RIGHT_CARET: {
			icon: `<svg name="RightCaret" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><polygon fill="%%color" fill-rule="nonzero" points="8.47 2 6.12 4.35 13.753 12 6.12 19.65 8.47 22 18.47 12"></polygon><polygon points="0 0 24 0 24 24 0 24"></polygon></g></svg>`
		},
		SPEAKER: {
			icon: `<svg name="Speaker" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 24 24"><path fill="%%color" fill-rule="evenodd" clip-rule="evenodd" d="M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z"></path></svg>`
		},
		STREAM: {
			icon: `<svg name="Stream" aria-hidden="false" width="%%width" height="%%height" viewBox="0 0 24 24"><path fill="%%color" fill-rule="evenodd" clip-rule="evenodd" d="M20 3V4L23 3V7L20 6V7C20 7.553 19.552 8 19 8H15C14.448 8 14 7.553 14 7V3C14 2.447 14.448 2 15 2H19C19.552 2 20 2.447 20 3ZM18 15V10H19H20V17C20 18.104 19.103 19 18 19H11V21H15V23H5V21H9V19H2C0.897 19 0 18.104 0 17V6C0 4.897 0.897 4 2 4H12V6H2V15H7H10H13H18Z"></path></svg>`
		}
	};
	
	InternalComponents.LibraryComponents.Switch = InternalBDFDB.loadPatchedComp("Switch") || reactInitialized && class BDFDB_Switch extends LibraryModules.React.Component {
		handleChange() {
			this.props.value = !this.props.value;
			if (typeof this.props.onChange == "function") this.props.onChange(this.props.value, this);
			BDFDB.ReactUtils.forceUpdate(this);
		}
		render() {
			return BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.Switch, Object.assign({}, this.props, {onChange: this.handleChange.bind(this)}));
		}
	};
	
	InternalComponents.LibraryComponents.TabBar = InternalBDFDB.loadPatchedComp("TabBar") || reactInitialized && class BDFDB_TabBar extends LibraryModules.React.Component {
		handleItemSelect(item) {
			this.props.selectedItem = item;
			if (typeof this.props.onItemSelect == "function") this.props.onItemSelect(item, this);
			BDFDB.ReactUtils.forceUpdate(this);
		}
		render() {
			let items = (BDFDB.ArrayUtils.is(this.props.items) ? this.props.items : [{}]).filter(n => n);
			let selectedItem = this.props.selectedItem || (items[0] || {}).value;
			return BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.TabBar, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
				selectedItem: selectedItem,
				onItemSelect: this.handleItemSelect.bind(this),
				children: items.map(data => {
					return BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TabBar.Item, {
						className: BDFDB.DOMUtils.formatClassName(this.props.itemClassName, selectedItem == data.value && this.props.itemSelectedClassName),
						itemType: this.props.type,
						id: data.value,
						children: data.label || data.value,
						"aria-label": data.label || data.value
					})
				})
			}), "itemClassName", "items"));
		}
	};
	
	InternalComponents.LibraryComponents.Table = InternalBDFDB.loadPatchedComp("Table") || reactInitialized && class BDFDB_Table extends LibraryModules.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.Table, Object.assign({}, this.props, {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.table, this.props.className),
				headerClassName: BDFDB.DOMUtils.formatClassName(this.props.stickyHeader ? BDFDB.disCN.tablestickyheader : BDFDB.disCN.tableheader, this.props.headerClassName),
				headerCellClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tableheadercell, this.props.headerCellClassName),
				sortedHeaderCellClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tableheadercellsorted, this.props.sortedHeaderCellClassName),
				bodyCellClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tablebodycell, this.props.bodyCellClassName),
				rowClassName: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tablerow, this.props.rowClassName),
				onSort: (sortKey, sortDirection) => {
					this.props.sortDirection = this.props.sortKey != sortKey && sortDirection == InternalComponents.LibraryComponents.Table.SortDirection.ASCENDING && this.props.columns.filter(n => n.key == sortKey)[0].reverse ? InternalComponents.LibraryComponents.Table.SortDirection.DESCENDING : sortDirection;
					this.props.sortKey = sortKey;
					this.props.data = BDFDB.ArrayUtils.keySort(this.props.data, this.props.sortKey);
					if (this.props.sortDirection == InternalComponents.LibraryComponents.Table.SortDirection.DESCENDING) this.props.data.reverse();
					if (typeof this.props.onSort == "function") this.props.onSort(this.props.sortKey, this.props.sortDirection);
					BDFDB.ReactUtils.forceUpdate(this);
				}
			}));
		}
	};
	
	InternalComponents.LibraryComponents.TextArea = InternalBDFDB.loadPatchedComp("TextArea") || reactInitialized && class BDFDB_TextArea extends LibraryModules.React.Component {
		handleChange(e) {
			this.props.value = e;
			if (typeof this.props.onChange == "function") this.props.onChange(e, this);
			BDFDB.ReactUtils.forceUpdate(this);
		}
		handleBlur(e) {if (typeof this.props.onBlur == "function") this.props.onBlur(e, this);}
		handleFocus(e) {if (typeof this.props.onFocus == "function") this.props.onFocus(e, this);}
		render() {
			return BDFDB.ReactUtils.createElement(InternalComponents.NativeSubComponents.TextArea, Object.assign({}, this.props, {
				onChange: this.handleChange.bind(this),
				onBlur: this.handleBlur.bind(this),
				onFocus: this.handleFocus.bind(this)
			}));
		}
	};
	
	InternalComponents.LibraryComponents.TextElement = BDFDB.ModuleUtils.findByName("Text");
	
	InternalComponents.LibraryComponents.TextGradientElement = InternalBDFDB.loadPatchedComp("TextGradientElement") || reactInitialized && class BDFDB_TextGradientElement extends LibraryModules.React.Component {
		render() {
			if (this.props.gradient && this.props.children) return BDFDB.ReactUtils.createElement("span", {
				children: this.props.children,
				ref: instance => {
					let ele = BDFDB.ReactUtils.findDOMNode(instance);
					if (ele) {
						ele.style.setProperty("background-image", this.props.gradient, "important");
						ele.style.setProperty("color", "transparent", "important");
						ele.style.setProperty("-webkit-background-clip", "text", "important");
					}
				}
			});
			return this.props.children || null;
		}
	};
	
	InternalComponents.LibraryComponents.TextInput = InternalBDFDB.loadPatchedComp("TextInput") || reactInitialized && class BDFDB_TextInput extends LibraryModules.React.Component {
		handleChange(e) {
			e = BDFDB.ObjectUtils.is(e) ? e.currentTarget.value : e;
			this.props.value = e;
			if (typeof this.props.onChange == "function") this.props.onChange(e, this);
			BDFDB.ReactUtils.forceUpdate(this);
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
			if (this.props.type == "color") {
				let swatchinstance = BDFDB.ReactUtils.findOwner(this, {name: "BDFDB_ColorSwatches"});
				if (swatchinstance) swatchinstance.refInput = this;
			}
			else if (this.props.type == "file") {
				let navigatorinstance = BDFDB.ReactUtils.findOwner(this, {name: "BDFDB_FileButton"});
				if (navigatorinstance) navigatorinstance.refInput = this;
			}
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
		}
		render() {
			let inputchildren = [
				BDFDB.ReactUtils.createElement("input", BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
					className: BDFDB.DOMUtils.formatClassName(this.props.size && InternalComponents.LibraryComponents.TextInput.Sizes[this.props.size.toUpperCase()] && BDFDB.disCN["input" + this.props.size.toLowerCase()] || BDFDB.disCN.inputdefault, this.props.inputClassName, this.props.focused && BDFDB.disCN.inputfocused, this.props.error || this.props.errorMessage ? BDFDB.disCN.inputerror : (this.props.success && BDFDB.disCN.inputsuccess), this.props.disabled && BDFDB.disCN.inputdisabled, this.props.editable && BDFDB.disCN.inputeditable),
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
				}), "errorMessage", "focused", "error", "success", "inputClassName", "inputPrefix", "size", "editable", "inputRef", "style", "mode", "filter", "useFilepath")),
				this.props.type == "color" ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex.Child, {
					wrap: true,
					children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.ColorSwatches, {
						colors: [],
						compMode: this.props.mode == "comp",
						color: this.props.value && this.props.mode == "comp" ? BDFDB.ColorUtils.convert(this.props.value.split(","), "RGB") : this.props.value,
						pickerConfig: {gradient:false, alpha:this.props.mode != "comp"}
					})
				}) : null,
				this.props.type == "file" ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.FileButton, {
					filter: this.props.filter,
					mode: this.props.mode,
					useFilepath: this.props.useFilepath,
				}) : null
			].filter(n => n);
			
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.inputwrapper, this.props.type == "number" && (this.props.size && InternalComponents.LibraryComponents.TextInput.Sizes[this.props.size.toUpperCase()] && BDFDB.disCN["inputnumberwrapper" + this.props.size.toLowerCase()] || BDFDB.disCN.inputnumberwrapperdefault), this.props.className),
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
									let min = parseInt(this.props.min);
									let max = parseInt(this.props.max);
									let newv = parseInt(this.props.value) + 1 || min || 0;
									if (isNaN(max) || !isNaN(max) && newv <= max) this.handleNumberButton.bind(this)(e._targetInst, isNaN(min) || !isNaN(min) && newv >= min ? newv : min);
								}
							}),
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.inputnumberbuttondown,
								onClick: e => {
									let min = parseInt(this.props.min);
									let max = parseInt(this.props.max);
									let newv = parseInt(this.props.value) - 1 || min || 0;
									if (isNaN(min) || !isNaN(min) && newv >= min) this.handleNumberButton.bind(this)(e._targetInst, isNaN(max) || !isNaN(max) && newv <= max ? newv : max);
								}
							})
						]
					}) : null,
					inputchildren.length == 1 ? inputchildren[0] : BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex, {
						align: InternalComponents.LibraryComponents.Flex.Align.CENTER,
						children: inputchildren.map((child, i) => i != 0 ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Flex.Child, {shrink: 0, children: child}) : child)
					}),
					this.props.errorMessage ? BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TextElement, {
						className: BDFDB.disCN.carderror,
						size: InternalComponents.LibraryComponents.TextElement.Sizes.SIZE_12,
						color: InternalComponents.LibraryComponents.TextElement.Colors.STATUS_RED,
						children: this.props.errorMessage
					}) : null
				].filter(n => n)
			});
		}
	};
	
	InternalComponents.LibraryComponents.TextScroller = InternalBDFDB.loadPatchedComp("TextScroller") || reactInitialized && class BDFDB_TextScroller extends LibraryModules.React.Component {
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
					if (ele && ele.parentElement) {
						let maxWidth = BDFDB.DOMUtils.getInnerWidth(ele.parentElement);
						if (maxWidth > 50) ele.style.setProperty("max-width", `${maxWidth}px`);
						BDFDB.TimeUtils.timeout(_ => {
							if (document.contains(ele.parentElement)) {
								let newMaxWidth = BDFDB.DOMUtils.getInnerWidth(ele.parentElement);
								if (newMaxWidth > maxWidth) ele.style.setProperty("max-width", `${newMaxWidth}px`);
							}
						}, 3000);
						let Animation = new LibraryModules.AnimationUtils.Value(0);
						Animation
							.interpolate({inputRange:[0, 1], outputRange:[0, (BDFDB.DOMUtils.getRects(ele.firstElementChild).width - BDFDB.DOMUtils.getRects(ele).width) * -1]})
							.addListener(v => {ele.firstElementChild.style.setProperty("left", v.value + "px", "important");});
						this.scroll = p => {
							let w = p + parseFloat(ele.firstElementChild.style.getPropertyValue("left")) / (BDFDB.DOMUtils.getRects(ele.firstElementChild).width - BDFDB.DOMUtils.getRects(ele).width);
							w = isNaN(w) || !isFinite(w) ? p : w;
							w *= BDFDB.DOMUtils.getRects(ele.firstElementChild).width / (BDFDB.DOMUtils.getRects(ele).width * 2);
							LibraryModules.AnimationUtils.parallel([LibraryModules.AnimationUtils.timing(Animation, {toValue:p, duration:Math.sqrt(w**2) * 4000 / (parseInt(this.props.speed) || 1)})]).start();
						}
					}
				},
				onClick: e => {
					if (typeof this.props.onClick == "function") this.props.onClick(e, this);
				},
				onMouseEnter: e => {
					if (BDFDB.DOMUtils.getRects(e.currentTarget).width < BDFDB.DOMUtils.getRects(e.currentTarget.firstElementChild).width) {
						this.scrolling = true;
						e.currentTarget.firstElementChild.style.setProperty("display", "block", "important");
						this.scroll(1);
					}
				},
				onMouseLeave: e => {
					if (this.scrolling) {
						delete this.scrolling;
						e.currentTarget.firstElementChild.style.setProperty("display", "inline", "important");
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
	};
	InternalComponents.LibraryComponents.TooltipContainer = InternalBDFDB.loadPatchedComp("TooltipContainer") || reactInitialized && class BDFDB_TooltipContainer extends LibraryModules.React.Component {
		render() {
			let child = (BDFDB.ArrayUtils.is(this.props.children) ? this.props.children[0] : this.props.children) || BDFDB.ReactUtils.createElement("div", {});
			child.props.className = BDFDB.DOMUtils.formatClassName(child.props.className, this.props.className);
			let childMouseEnter = child.props.onMouseEnter, childMouseLeave = child.props.onMouseLeave, childClick = child.props.onClick, childContextMenu = child.props.onContextMenu;
			let shown = false;
			child.props.onMouseEnter = (e, childThis) => {
				if (!shown) {
					shown = true;
					BDFDB.TooltipUtils.create(e.currentTarget, this.props.text, Object.assign({delay: this.props.delay}, this.props.tooltipConfig));
					if (typeof this.props.onMouseEnter == "function") this.props.onMouseEnter(e, this);
					if (typeof childMouseEnter == "function") childMouseEnter(e, childThis);
				}
			};
			child.props.onMouseLeave = (e, childThis) => {
				shown = false;
				if (typeof this.props.onMouseLeave == "function") this.props.onMouseLeave(e, this);
				if (typeof childMouseLeave == "function") childMouseLeave(e, childThis);
			};
			child.props.onClick = (e, childThis) => {
				if (typeof this.props.onClick == "function") this.props.onClick(e, this);
				if (typeof childClick == "function") childClick(e, childThis);
			};
			child.props.onContextMenu = (e, childThis) => {
				if (typeof this.props.onContextMenu == "function") this.props.onContextMenu(e, this);
				if (typeof childContextMenu == "function") childContextMenu(e, childThis);
			};
			return BDFDB.ReactUtils.createElement(LibraryModules.React.Fragment, {
				children: child
			});
		}
	};
	
	InternalComponents.LibraryComponents.UserSummaryItem = BDFDB.ModuleUtils.findByName("UserSummaryItem");
	
	for (let type in InternalComponents.NativeSubComponents) if (InternalComponents.LibraryComponents[type]) for (let key in InternalComponents.NativeSubComponents[type]) if (key != "displayName" && key != "name" && (typeof InternalComponents.NativeSubComponents[type][key] != "function" || key.charAt(0) == key.charAt(0).toUpperCase())) {
		if (key == "defaultProps") InternalComponents.LibraryComponents[type][key] = Object.assign({}, InternalComponents.LibraryComponents[type][key], InternalComponents.NativeSubComponents[type][key]);
		else InternalComponents.LibraryComponents[type][key] = InternalComponents.NativeSubComponents[type][key];
	}
	BDFDB.LibraryComponents = Object.assign({}, InternalComponents.LibraryComponents);

	BDFDB.DOMUtils.appendLocalStyle("BDFDB", `
		@import url(https://mwittrien.github.io/BetterDiscordAddons/Themes/SupporterBadge.css);
		
		img:not([src]), img[src=""], img[src="null"] {
			opacity: 0;
		}
		
		${BDFDB.dotCN.loadingiconwrapper} {
			position: absolute;
			bottom: 0;
			right: 0;
			z-index: 1000;
			animation: loadingwrapper-fade 3s infinite ease;
		}
		${BDFDB.dotCNS.loadingiconwrapper + BDFDB.dotCN.loadingicon} {
			margin: 0 5px;
		}
		@keyframes loadingwrapper-fade {
			from {opacity: 0.1;}
			50% {opacity: 0.9;}
			to {opacity: 0.1;}
		}
		
		${BDFDB.dotCN.settingspanelinner} {
			padding-left: 15px;
			padding-right: 5px;
		}
		${BDFDB.dotCN.settingspanellist} {
			padding-left: 15px;
		}
		
		${BDFDB.dotCN.collapsecontainer} {
			margin-bottom: 20px;
		}
		${BDFDB.dotCN.collapsecontainermini} {
			margin-bottom: 8px;
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
		
		${BDFDB.dotCN.settingsguild} {
			border-radius: 50%;
			border: 3px solid ${BDFDB.DiscordConstants.Colors.STATUS_GREEN};
			box-sizing: border-box;
			cursor: pointer;
			margin: 3px;
			overflow: hidden;
		}
		${BDFDB.dotCN.settingsguilddisabled} {
			border-color: ${BDFDB.DiscordConstants.Colors.STATUS_GREY};
			filter: grayscale(100%) brightness(50%);
		}
		
		${BDFDB.dotCN.overflowellipsis} {
			overflow: hidden;
			text-overflow: ellipsis;
		}

		${BDFDB.dotCN.avatarwrapper + BDFDB.dotCN.messageavatar} {
			overflow: visible;
			border-radius: 0;
		}

		${BDFDB.dotCN.favbuttoncontainer} {
			display: flex;
			position: relative;
			cursor: pointer;
		}

		${BDFDB.dotCN.cursordefault} {
			cursor: default !important;
		}
		${BDFDB.dotCN.cursorpointer} {
			cursor: pointer !important;
		}
		
		${BDFDB.dotCNS.selectwrapper + BDFDB.dotCN.selectwrap} {
			flex: 1 1 auto;
		}
		${BDFDB.dotCN.selectwrapper} [class*="css-"][class*="-container"] > [class*="css-"][class*="-menu"] {
			z-index: 3;
		}
		
		${BDFDB.dotCNS.hotkeywrapper + BDFDB.dotCN.hotkeycontainer} {
			flex: 1 1 auto;
		}
		${BDFDB.dotCN.hotkeyresetbutton} {
			cursor: pointer;
			margin-left: 5px;
		}
		${BDFDB.dotCNS.hotkeyresetbutton + BDFDB.dotCN.svgicon}:hover {
			color: ${BDFDB.DiscordConstants.Colors.STATUS_RED};
		}
		
		
		${BDFDB.dotCNC.hovercardwrapper + BDFDB.dotCN.hovercardinner} {
			min-height: 28px;
		}
		${BDFDB.dotCN.hovercardinner} {
			width: 100%;
			padding-right: 5px;
			display: flex;
			align-items: center;
			z-index: 1;
		}
		${BDFDB.dotCNS.hovercardwrapper + BDFDB.dotCN.hovercardbutton} {
			position: absolute;
			top: -6px;
			right: -6px;
			opacity: 0;
		}
		${BDFDB.dotCN.hovercardwrapper + BDFDB.dotCNS.hovercard + BDFDB.dotCN.hovercardbutton} {
			right: -25px;
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
		
		${BDFDB.dotCNS.settingstablelist + BDFDB.dotCN.checkboxcontainer}:before {
			display: none;
		}
		
		${BDFDB.dotCNS.settingstablelist + BDFDB.dotCN.settingstableheader} {
			min-height: 10px;
		}
		${BDFDB.dotCNS.settingstablelist + BDFDB.dotCN.settingstableheaderoption} {
			width: unset;
		}
		${BDFDB.dotCN.settingstableheadervertical} {
			position: relative;
		}
		${BDFDB.dotCN.settingstableheadervertical} > span {
			position: absolute;
			bottom: 50%;
			right: calc(50% - 5px);
			margin-bottom: -5px;
			writing-mode: vertical-rl;
		}
		${BDFDB.dotCN.settingstablecard} {
			height: 60px;
			padding: 0 10px;
			margin-bottom: 10px;
		}
		${BDFDB.dotCNS.settingstablecard + BDFDB.dotCN.settingstablecardlabel} {
			padding-right: 10px;
		}
		${BDFDB.dotCNS.settingstablecard + BDFDB.dotCN.settingstablecardlabel},
		${BDFDB.dotCNS.settingstablecard + BDFDB.dotCN.settingstablecardconfigs} {
			margin: 0;
		}
		${BDFDB.dotCN.settingstableheaders} {
			margin-right: 10px;
		}
		
		${BDFDB.dotCNS.popoutwrapper + BDFDB.dotCN.messagespopouttabbarheader} {
			flex: 1 0 auto;
			align-items: center;
			height: unset;
			min-height: 56px;
		}
		${BDFDB.dotCNS.popoutwrapper + BDFDB.dotCNS.messagespopouttabbarheader + BDFDB.dotCN.messagespopouttabbar} {
			min-height: 32px;
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
		
		${BDFDB.dotCN.guildupperleftbadge} {
			top: 0;
		}
		${BDFDB.dotCN.guildlowerleftbadge} {
			bottom: 0;
		}
		${BDFDB.dotCNC.guildlowerleftbadge + BDFDB.dotCN.guildupperleftbadge} {
			pointer-events: none;
			position: absolute;
			left: 0;
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
		${BDFDB.dotCN.modaltabcontent} {
			margin-top: 10px;
		}
		${BDFDB.dotCNS.listscroller + BDFDB.dotCN.modaltabcontent} {
			margin-top: 0;
		}
		${BDFDB.dotCNS.modalwrapper + BDFDB.dotCN.modalheader + BDFDB.dotCN.modalheaderhassibling} {
			padding-bottom: 10px;
		}
		${BDFDB.dotCNS.modalwrapper + BDFDB.dotCN.tabbarcontainer} {
			background: rgba(0, 0, 0, 0.1);
			border: none;
			box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.05);
			padding-right: 12px;
		}
		${BDFDB.dotCNS.themedark + BDFDB.dotCNS.modalwrapper + BDFDB.dotCN.tabbarcontainer} {
			background: rgba(0, 0, 0, 0.2);
			box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1);
		}
		
		${BDFDB.dotCN.popoutthemedpopout} {
			background-color: #fff;
			border: 1px solid hsla(0,0%,74.9%,.3);
			-webkit-box-shadow: 0 2px 10px 0 rgba(0,0,0,.1);
			box-shadow: 0 2px 10px 0 rgba(0,0,0,.1);
			-webkit-box-sizing: border-box;
			box-sizing: border-box;
			border-radius: 5px;
			display: -webkit-box;
			display: -ms-flexbox;
			display: flex;
			-webkit-box-orient: vertical;
			-webkit-box-direction: normal;
			-ms-flex-direction: column;
			flex-direction: column;
		}
		${BDFDB.dotCNS.themedark + BDFDB.dotCN.popoutthemedpopout} {
			background-color: #2f3136;
			border: 1px solid rgba(28,36,43,.6);
			-webkit-box-shadow: 0 2px 10px 0 rgba(0,0,0,20%);
			box-shadow: 0 2px 10px 0 rgba(0,0,0,.2);
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
		#bd-settingspane-container ${BDFDB.dotCN._repoupdatebutton}[style] {
			display: none !important;
		}
		${BDFDB.dotCNS._repolist + BDFDB.dotCN._repocontrols} {
			display: flex;
			justify-content: center;
			align-items: center;
		}
		${BDFDB.dotCNS._repolist + BDFDB.dotCNS._repofooter + BDFDB.dotCN._repolinks} + * {
			margin-left: auto;
		}
		${BDFDB.dotCNS._repolist + BDFDB.dotCN._repocontrols} > *,
		${BDFDB.dotCNS._repolist + BDFDB.dotCNS._repofooter} button + button,
		${BDFDB.dotCNS._repolist + BDFDB.dotCNS._repofooter + BDFDB.dotCN._repolinks} + * ~ * {
			margin-left: 8px;
		}
		${BDFDB.dotCN._repoicon} {
			color: var(--interactive-active);
		}
		
		${BDFDB.dotCN.noticewrapper} {
			transition: height 0.5s ease !important;
			border-radius: 0 !important;
		}
		${BDFDB.dotCNS.noticewrapper + BDFDB.dotCN.noticeplatformicon} {
			margin-top: -7px;
		}
		${BDFDB.dotCNS.noticewrapper + BDFDB.dotCN.noticeplatformicon} svg {
			max-height: 28px;
		}
		${BDFDB.dotCN.noticesurvey} {
			background-color: #222;
		}
		
		${BDFDB.dotCN.tooltip + BDFDB.dotCNS.tooltipcustom + BDFDB.dotCN.tooltippointer} {
			border-top-color: inherit !important;
		}
		
		${BDFDB.dotCN.colorpickerswatchsingle} {
			height: 30px;
			width: 30px;
		}
		${BDFDB.dotCN.colorpickerswatches + BDFDB.dotCN.colorpickerswatchesdisabled} {
			cursor: no-drop;
			filter: grayscale(70%) brightness(50%);
		}
		${BDFDB.dotCN.colorpickerswatch + BDFDB.notCN.colorpickerswatchnocolor + BDFDB.notCN.colorpickerswatchdefault + BDFDB.notCN.colorpickerswatchdisabled} {
			overflow: hidden;
		}
		${BDFDB.dotCN.colorpickerwrapper} .gradient-bar .gradient-cursor > div:after,
		${BDFDB.dotCN.colorpickerswatch + BDFDB.notCN.colorpickerswatchnocolor + BDFDB.notCN.colorpickerswatchdefault + BDFDB.notCN.colorpickerswatchdisabled}:after {
			content: "";
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			z-index: -1;
		}
		${BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatchcustom}[style*="background"] {
			border: none;
		}
		${BDFDB.dotCN.colorpickerswatch + BDFDB.notCN.colorpickerswatchdefault}:after {
			border-radius: 3px;
		}
		${BDFDB.dotCN.colorpickerswatch + BDFDB.dotCN.colorpickerswatchcustom + BDFDB.notCN.colorpickerswatchdefault}:after {
			border-radius: 5px;
		}
		${BDFDB.dotCN.colorpickerwrapper} .alpha-checker,
		${BDFDB.dotCN.colorpickerwrapper} .gradient-bar .gradient-cursor > div:after,
		${BDFDB.dotCN.colorpickerswatch + BDFDB.notCN.colorpickerswatchnocolor + BDFDB.notCN.colorpickerswatchdefault + BDFDB.notCN.colorpickerswatchdisabled}:after {
			background: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect x="0" y="0" width="4" height="4" fill="black"></rect><rect x="0" y="4" width="4" height="4" fill="white"></rect><rect x="4" y="0" width="4" height="4" fill="white"></rect><rect x="4" y="4" width="4" height="4" fill="black"></rect></svg>') center repeat;
		}
		${BDFDB.dotCNS.themelight + BDFDB.dotCN.colorpickersaturation} > div > div > div > div {
			box-shadow: rgb(200, 200, 200) 0px 0px 0px 1.5px, rgba(0, 0, 0, 0.6) 0px 0px 1px 1px inset, rgba(0, 0, 0, 0.6) 0px 0px 1px 2px !important;
		}
		${BDFDB.dotCNS.themelight + BDFDB.dotCN.colorpickerhue} > div > div > div > div,
		${BDFDB.dotCNS.themelight + BDFDB.dotCN.colorpickerwrapper} .alpha-bar > div > div > div > div {
			background: rgb(200, 200, 200) !important;
			box-shadow: rgba(0, 0, 0, 1) 0px 0px 2px !important;
		}
		${BDFDB.dotCN.colorpickerwrapper} .gradient-button {
			cursor: pointer;
			opacity: 0.3;
			transition: all 200ms ease;
		}
		${BDFDB.dotCN.colorpickerwrapper} .gradient-button:hover {
			opacity: 0.6;
		}
		${BDFDB.dotCN.colorpickerwrapper} .gradient-button.selected,
		${BDFDB.dotCN.colorpickerwrapper} .gradient-button.selected:hover {
			opacity: 1;
		}
		${BDFDB.dotCNS.themelight + BDFDB.dotCN.colorpickerwrapper} .gradient-button {
			color: #4f545c;
		}
		${BDFDB.dotCNS.themedark + BDFDB.dotCN.colorpickerwrapper} .gradient-button {
			color: #fff;
		}
		${BDFDB.dotCN.colorpickerwrapper} .alpha-checker,
		${BDFDB.dotCN.colorpickerwrapper} .alpha-horizontal,
		${BDFDB.dotCN.colorpickerwrapper} .gradient-horizontal {
			border-radius: 3px;
		}
		${BDFDB.dotCN.colorpickerwrapper} .alpha-bar .alpha-cursor,
		${BDFDB.dotCN.colorpickerwrapper} .gradient-bar .gradient-cursor {
			position: absolute;
		}
		${BDFDB.dotCN.colorpickerwrapper} .gradient-bar .gradient-cursor > div {
			height: 8px;
			width: 8px;
			margin-top: -15px;
			border: 1px solid rgb(128, 128, 128);
			border-radius: 3px;
			transform: translateX(-5px);
			transform-style: preserve-3d;
		}
		${BDFDB.dotCN.colorpickerwrapper} .gradient-bar .gradient-cursor > div:after {
			border-radius: 3px;
			transform: translateZ(-1px);
		}
		${BDFDB.dotCN.colorpickerwrapper} .gradient-bar .gradient-cursor > div:before {
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
		${BDFDB.dotCN.colorpickerwrapper} .gradient-bar .gradient-cursor.edge > div:before {
			border-right-width: 0;
			border-left-width: 5px;
		}
		${BDFDB.dotCN.colorpickerwrapper} .gradient-bar .gradient-cursor.edge ~ .gradient-cursor.edge > div:before {
			border-right-width: 5px;
			border-left-width: 0;
		}
		${BDFDB.dotCNS.themelight + BDFDB.dotCN.colorpickerwrapper} .gradient-bar .gradient-cursor.selected > div {
			border-color: rgb(55, 55, 55);
		}
		${BDFDB.dotCNS.themelight + BDFDB.dotCN.colorpickerwrapper} .gradient-bar .gradient-cursor.selected > div:before {
			border-top-color: rgb(55, 55, 55);
		}
		${BDFDB.dotCNS.themedark + BDFDB.dotCN.colorpickerwrapper} .gradient-bar .gradient-cursor.selected > div {
			border-color: rgb(200, 200, 200);
		}
		${BDFDB.dotCNS.themedark + BDFDB.dotCN.colorpickerwrapper} .gradient-bar .gradient-cursor.selected > div:before {
			border-top-color: rgb(200, 200, 200);
		}
		
		${BDFDB.dotCNC.layermodallarge + BDFDB.dotCN.modalsizelarge} {
			max-height: 95vh;
		}
		@media only screen and (max-height: 900px) {
			${BDFDB.dotCNC.layermodalmedium + BDFDB.dotCN.modalsizemedium} {
				max-height: 75vh;
			}
		}
		
		#pluginNotice #outdatedPlugins span {
			-webkit-app-region: no-drag;
			color: #FFF;
			cursor: pointer;
		}
		#pluginNotice #outdatedPlugins span:hover {
			text-decoration: underline;
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
			flex: 0 0 auto;
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
		}`);

	var KeyDownTimeouts = {};
	BDFDB.ListenerUtils.add(BDFDB, document, "keydown.BDFDBPressedKeys", e => {
		if (!BDFDB.InternalData.pressedKeys.includes(e.which)) {
			BDFDB.TimeUtils.clear(KeyDownTimeouts[e.which]);
			BDFDB.InternalData.pressedKeys.push(e.which);
			KeyDownTimeouts[e.which] = BDFDB.TimeUtils.timeout(_ => {
				BDFDB.ArrayUtils.remove(BDFDB.InternalData.pressedKeys, e.which, true);
			},60000);
		}
	});
	BDFDB.ListenerUtils.add(BDFDB, document, "keyup.BDFDBPressedKeys", e => {
		BDFDB.TimeUtils.clear(KeyDownTimeouts[e.which]);
		BDFDB.ArrayUtils.remove(BDFDB.InternalData.pressedKeys, e.which, true);
	});
	BDFDB.ListenerUtils.add(BDFDB, document, "mousedown.BDFDBMousePosition", e => {
		BDFDB.InternalData.mousePosition = e;
	});
	BDFDB.ListenerUtils.add(BDFDB, window, "focus.BDFDBPressedKeysReset", e => {
		BDFDB.InternalData.pressedKeys = [];
	});
	
	/* unavailable */
	
	InternalBDFDB.patchedModules = {
		before: {
			MessageContent: "type",
		},
		after: {
			V2C_ContentColumn: "render",
			V2C_PluginCard: "render",
			V2C_ThemeCard: "render",
			Mention: "default",
			Message: "default",
			MessageHeader: "default",
			MemberListItem: "componentDidMount",
			UserPopout: "componentDidMount",
			UserProfile: "componentDidMount",
			DiscordTag: "default"
		}
	};

	InternalBDFDB.processV2CContentColumn = function (e) {
		if (window.PluginUpdates && window.PluginUpdates.plugins && typeof e.instance.props.title == "string" && e.instance.props.title.toUpperCase().indexOf("PLUGINS") == 0) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {key: "folder-button"});
			if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TooltipContainer, {
				text: "Only checks for updates of plugins, which support the updatecheck. Rightclick for a list of supported plugins. (Listed ≠ Outdated)",
				tooltipConfig: {
					selector: "update-button-tooltip",
					style: "max-width: 420px"
				},
				children: BDFDB.ReactUtils.createElement("button", {
					className: `${BDFDB.disCNS._repobutton + BDFDB.disCN._repofolderbutton} bd-updatebtn`,
					onClick: _ => {
						let toast = BDFDB.NotificationUtils.toast("Plugin update check in progress.", {type: "info", timeout: 0});
						BDFDB.PluginUtils.checkAllUpdates().then(outdated => {
							toast.close();
							if (outdated > 0) BDFDB.NotificationUtils.toast(`Plugin update check complete. ${outdated} outdated!`, {type: "error"});
							else BDFDB.NotificationUtils.toast(`Plugin update check complete.`, {type: "success"});
						});
					},
					onContextMenu: e => {
						if (window.PluginUpdates && window.PluginUpdates.plugins && !document.querySelector(".update-list-tooltip")) BDFDB.TooltipUtils.create(e.currentTarget, BDFDB.ObjectUtils.toArray(window.PluginUpdates.plugins).map(p => p.name).filter(n => n).sort().join(", "), {type: "bottom", selector: "update-list-tooltip", style: "max-width: 420px"});
					},
					children: "Check for Updates"
				})
			}));
		}
	};

	InternalBDFDB._processCard = function (e, data) {
		if (e.instance.state && !e.instance.state.settings) {
			if (BDFDB.ObjectUtils.toArray(BDFDB.myPlugins).some(n => n == data)) {
				let children, index;
				if (data.changelog) {
					[children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["className", BDFDB.disCN._repocontrols]]});
					if (index > -1) children[index].props.children.unshift(BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._repocontrolsbutton,
						children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TooltipContainer, {
							text: BDFDB.LanguageUtils.LanguageStrings.CHANGE_LOG,
							children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SvgIcon, {
								name: InternalComponents.LibraryComponents.SvgIcon.Names.CHANGELOG,
								className: BDFDB.disCN._repoicon,
								onClick: _ => {BDFDB.PluginUtils.openChangeLog(data);}
							})
						})
					}));
				}
				[children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["className", BDFDB.disCN._repofooter]]});
				if (index == -1) {
					let footer = BDFDB.ReactUtils.createElement("div", {className: BDFDB.disCN._repofooter, children: []});
					e.returnvalue.props.children.push(footer);
					children = footer.props.children;
				}
				else {
					children[index].props.children = [children[index].props.children].flat();
					children = children[index].props.children;
				}
				children.splice(children.length - 1, 0, BDFDB.ReactUtils.createElement("button", {
					className: BDFDB.disCNS._repobutton + BDFDB.disCN._reposettingsbutton,
					children: "Library Settings",
					onClick: event => {
						let wrapper = BDFDB.DOMUtils.getParent(BDFDB.dotCN._reposettingsclosed, event.currentTarget);
						if (wrapper) {
							let settingsPanel = InternalBDFDB.createLibrarySettings();
							if (settingsPanel) {
								BDFDB.DOMUtils.addClass(wrapper, BDFDB.disCN._reposettingsopen);
								BDFDB.DOMUtils.removeClass(wrapper, BDFDB.disCN._reposettingsclosed);
								let children = [];
								while (wrapper.childElementCount) {
									children.push(wrapper.firstChild);
									wrapper.firstChild.remove();
								}
								let closeButton = BDFDB.DOMUtils.create(`<div style="float: right; cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" style="width: 18px; height: 18px;"><g class="background" fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="#dcddde" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg></div>`);
								wrapper.appendChild(closeButton);
								closeButton.addEventListener("click", _ => {
									BDFDB.DOMUtils.removeClass(wrapper, BDFDB.disCN._reposettingsopen);
									BDFDB.DOMUtils.addClass(wrapper, BDFDB.disCN._reposettingsclosed);
									while (wrapper.childElementCount) wrapper.firstChild.remove();
									while (children.length) wrapper.appendChild(children.shift());
								});
								wrapper.appendChild(settingsPanel);
							}
						}
					}
				}));
			}
		}
	};
	InternalBDFDB.processV2CPluginCard = function (e) {InternalBDFDB._processCard(e, e.instance.props.addon && e.instance.props.addon.plugin);};
	InternalBDFDB.processV2CThemeCard = function (e) {InternalBDFDB._processCard(e, e.instance.props.addon && !e.instance.props.addon.plugin && e.instance.props.addon.css);};
	
	InternalBDFDB.createLibrarySettings = function () {
		if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded) return;
		let settings = BDFDB.DataUtils.get(BDFDB, "settings");
		let settingsPanel, settingsItems = [];
		
		let bdToastSetting = BDFDB.BDUtils.getSettings("fork-ps-2");
		for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SettingsSaveItem, {
			className: BDFDB.disCN.marginbottom8,
			type: "Switch",
			plugin: BDFDB,
			disabled: key == "showToasts" && bdToastSetting,
			keys: ["settings", key],
			label: InternalBDFDB.defaults.settings[key].description,
			note: key == "showToasts" && bdToastSetting && "Disable BBDs general 'Show Toast' setting before disabling this",
			dividerbottom: true,
			value: settings[key] || key == "showToasts" && bdToastSetting
		}));
		
		return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(BDFDB, settingsItems);
	};
	
	let MessageHeaderExport = BDFDB.ModuleUtils.findByProperties("MessageTimestamp", false);
	if (MessageHeaderExport) InternalBDFDB.processMessage = function (e) {
		if (BDFDB.ReactUtils.getValue(e, "instance.props.childrenHeader.type.type.name") && BDFDB.ReactUtils.getValue(e, "instance.props.childrenHeader.props.message")) {
			e.instance.props.childrenHeader.type = MessageHeaderExport.exports.default;
		}
	};

	const BDFDB_Patrons = [
		"363785301195358221",
		"443943393660239872"
	];
	InternalBDFDB._processAvatarRender = function (user, avatar) {
		if (BDFDB.ReactUtils.isValidElement(avatar) && BDFDB.ObjectUtils.is(user)) {
			let changed = false;
			if (avatar.type == "img") avatar = BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Avatar, Object.assign({}, avatar.props, {
				className: BDFDB.DOMUtils.formatClassName((avatar.props.className || "").replace(BDFDB.disCN.avatar, "")),
				size: InternalComponents.LibraryComponents.Avatar.Sizes.SIZE_40
			}));
			avatar.props["user_by_BDFDB"] = user.id;
			if (BDFDB_Patrons.includes(user.id)) {
				changed = true;
				avatar.props.className = BDFDB.DOMUtils.formatClassName(avatar.props.className, BDFDB.disCN.bdfdbsupporter);
			}
			if (user.id == "278543574059057154") {
				changed = true;
				avatar.props.className = BDFDB.DOMUtils.formatClassName(avatar.props.className, BDFDB.disCN.bdfdbdev);
			}
			if (changed && BDFDB.DataUtils.get(BDFDB, "settings", "showSupportBadges")) return avatar;
		}
	};
	InternalBDFDB._processAvatarMount = function (user, avatar) {
		if (Node.prototype.isPrototypeOf(avatar) && BDFDB.ObjectUtils.is(user)) {
			avatar.setAttribute("user_by_BDFDB", user.id);
			if (BDFDB_Patrons.includes(user.id) && BDFDB.DataUtils.get(BDFDB, "settings", "showSupportBadges")) BDFDB.DOMUtils.addClass(avatar, BDFDB.disCN.bdfdbsupporter);
			if (user.id == "278543574059057154") BDFDB.DOMUtils.addClass(avatar, BDFDB.disCN.bdfdbdev);
			let status = avatar.querySelector(BDFDB.dotCN.avatarpointerevents);
			if (status) {
				status.addEventListener("mouseenter", _ => {BDFDB.DOMUtils.addClass(avatar, BDFDB.disCN.avatarstatushovered)});
				status.addEventListener("mouseleave", _ => {BDFDB.DOMUtils.removeClass(avatar, BDFDB.disCN.avatarstatushovered)});
			}
		}
	};
	InternalBDFDB.processMessageHeader = function (e) {
		if (e.instance.props.message && e.instance.props.message.author) {
			let avatarWrapper = BDFDB.ReactUtils.getValue(e, "returnvalue.props.children.0");
			if (avatarWrapper && avatarWrapper.props && typeof avatarWrapper.props.children == "function") {
				let renderChildren = avatarWrapper.props.children;
				avatarWrapper.props.children = (...args) => {
					let renderedChildren = renderChildren(...args);
					return InternalBDFDB._processAvatarRender(e.instance.props.message.author, renderedChildren) || renderedChildren;
				};
			}
			else if (avatarWrapper && avatarWrapper.type == "img") e.returnvalue.props.children[0] = InternalBDFDB._processAvatarRender(e.instance.props.message.author, avatarWrapper) || avatarWrapper;
		}
	};
	InternalBDFDB.processMemberListItem = function (e) {
		InternalBDFDB._processAvatarMount(e.instance.props.user, e.node.querySelector(BDFDB.dotCN.avatarwrapper));
	};
	InternalBDFDB.processUserPopout = function (e) {
		InternalBDFDB._processAvatarMount(e.instance.props.user, e.node.querySelector(BDFDB.dotCN.userpopoutavatarwrapper));
	};
	InternalBDFDB.processUserProfile = function (e) {
		InternalBDFDB._processAvatarMount(e.instance.props.user, e.node.querySelector(BDFDB.dotCN.avatarwrapper));
	};
	InternalBDFDB.processDiscordTag = function (e) {
		if (e.instance && e.instance.props && e.instance.props.user && e.returnvalue) e.returnvalue.props.user = e.instance.props.user;
	};
	InternalBDFDB.processMessageContent = function (e) {
		if (BDFDB.ArrayUtils.is(e.instance.props.content)) for (let ele of e.instance.props.content) InternalBDFDB._processMessageContentEle(ele);
	};
	InternalBDFDB._processMessageContentEle = function (ele) {
		if (BDFDB.ReactUtils.isValidElement(ele)) {
			if (typeof ele.props.render == "function" && BDFDB.ReactUtils.getValue(ele, "props.children.type.displayName") == "Mention") {
				let userId = BDFDB.ReactUtils.getValue(ele.props.render(), "props.userId");
				if (userId && !ele.props.children.props.userId) ele.props.children.props.userId = userId;
			}
			else if (BDFDB.ReactUtils.isValidElement(ele.props.children)) InternalBDFDB._processMessageContentEle(ele.props.children);
			else if (BDFDB.ArrayUtils.is(ele.props.children)) for (let child of ele.props.children) InternalBDFDB._processMessageContentEle(child);
		}
		else if (BDFDB.ArrayUtils.is(ele)) for (let child of ele) InternalBDFDB._processMessageContentEle(child);
	};
	InternalBDFDB.processMention = function (e) {
		delete e.returnvalue.props.userId;
	};

	InternalBDFDB.patchPlugin(BDFDB);

	if (InternalComponents.LibraryComponents.GuildComponents.BlobMask) {
		let newBadges = ["lowerLeftBadge", "upperLeftBadge"];
		BDFDB.ModuleUtils.patch(BDFDB, InternalComponents.LibraryComponents.GuildComponents.BlobMask.prototype, "render", {
			before: e => {
				e.thisObject.props = Object.assign({}, InternalComponents.LibraryComponents.GuildComponents.BlobMask.defaultProps, e.thisObject.props);
				for (let type of newBadges) if (!e.thisObject.state[`${type}Mask`]) e.thisObject.state[`${type}Mask`] = new InternalComponents.LibraryComponents.Animations.Controller({spring: 0});
			},
			after: e => {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnValue, {name: "TransitionGroup"});
				if (index > -1) {
					children[index].props.children.push(!e.thisObject.props.lowerLeftBadge ? null : BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.BadgeAnimationContainer, {
						className: BDFDB.disCN.guildlowerleftbadge,
						key: "lower-left-badge",
						animatedStyle: e.thisObject.getLowerLeftBadgeStyles(),
						children: e.thisObject.props.lowerLeftBadge
					}));
					children[index].props.children.push(!e.thisObject.props.upperLeftBadge ? null : BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.BadgeAnimationContainer, {
						className: BDFDB.disCN.guildupperleftbadge,
						key: "upper-left-badge",
						animatedStyle: e.thisObject.getUpperLeftBadgeStyles(),
						children: e.thisObject.props.upperLeftBadge
					}));
				}
				[children, index] = BDFDB.ReactUtils.findChildren(e.returnValue, {name: "mask"});
				if (index > -1) {
					children[index].props.children.push(BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Animations.animated.rect, {
						x: -4,
						y: -4,
						width: e.thisObject.props.upperLeftBadgeWidth + 8,
						height: 24,
						rx: 12,
						ry: 12,
						transform: e.thisObject.getLeftBadgePositionInterpolation(e.thisObject.state.upperLeftBadgeMask, -1),
						fill: "black"
					}));
					children[index].props.children.push(BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Animations.animated.rect, {
						x: -4,
						y: 28,
						width: e.thisObject.props.lowerLeftBadgeWidth + 8,
						height: 24,
						rx: 12,
						ry: 12,
						transform: e.thisObject.getLeftBadgePositionInterpolation(e.thisObject.state.lowerLeftBadgeMask),
						fill: "black"
					}));
				}
			}
		});
		BDFDB.ModuleUtils.patch(BDFDB, InternalComponents.LibraryComponents.GuildComponents.BlobMask.prototype, "componentDidMount", {
			after: e => {
				for (let type of newBadges) e.thisObject.state[`${type}Mask`].update({
					spring: e.thisObject.props[type] != null ? 1 : 0,
					immediate: true
				}).start();
			}
		});
		BDFDB.ModuleUtils.patch(BDFDB, InternalComponents.LibraryComponents.GuildComponents.BlobMask.prototype, "componentWillUnmount", {
			after: e => {
				for (let type of newBadges) if (e.thisObject.state[`${type}Mask`]) e.thisObject.state[`${type}Mask`].destroy();
			}
		});
		BDFDB.ModuleUtils.patch(BDFDB, InternalComponents.LibraryComponents.GuildComponents.BlobMask.prototype, "componentDidUpdate", {
			after: e => {
				for (let type of newBadges) if (e.thisObject.props[type] != null && e.methodArguments[0][type] == null) {
					e.thisObject.state[`${type}Mask`].update({
						spring: 1,
						immediate: !document.hasFocus(),
						config: {friction: 30, tension: 900, mass: 1}
					}).start();
				}
				else if (e.thisObject.props[type] == null && e.methodArguments[0][type] != null) {
					e.thisObject.state[`${type}Mask`].update({
						spring: 0,
						immediate: !document.hasFocus(),
						config: {duration: 150, friction: 10, tension: 100, mass: 1}
					}).start();
				}
			}
		});
		InternalComponents.LibraryComponents.GuildComponents.BlobMask.prototype.getLeftBadgePositionInterpolation = function (e, t) {
			return void 0 === t && (t = 1), e.animated.spring.to([0, 1], [20, 0]).to(function (e) {
				return "translate(" + e * -1 + " " + e * t + ")";
			});
		};
		InternalComponents.LibraryComponents.GuildComponents.BlobMask.prototype.getLowerLeftBadgeStyles = function () {
			var e = this.state.lowerLeftBadgeMask.animated.spring;
			return {
				opacity: e.to([0, .5, 1], [0, 0, 1]),
				transform: e.to(function (e) {
					return "translate(" + -1 * (16 - 16 * e) + "px, " + (16 - 16 * e) + "px)";
				})
			};
		};
		InternalComponents.LibraryComponents.GuildComponents.BlobMask.prototype.getUpperLeftBadgeStyles = function () {
			var e = this.state.upperLeftBadgeMask.animated.spring;
			return {
				opacity: e.to([0, .5, 1], [0, 0, 1]),
				transform: e.to(function (e) {
					return "translate(" + -1 * (16 - 16 * e) + "px, " + -1 * (16 - 16 * e) + "px)";
				})
			};
		};
		let extraDefaultProps = {};
		for (let type of newBadges) extraDefaultProps[`${type}Width`] = 16;
		InternalBDFDB.setDefaultProps(InternalComponents.LibraryComponents.GuildComponents.BlobMask, extraDefaultProps);
	}
	
	BDFDB.ModuleUtils.patch(BDFDB, LibraryModules.GuildStore, "getGuild", {after: e => {
		if (e.returnValue && e.methodArguments[0] == "410787888507256842" && !e.returnValue.banner) {
			e.returnValue.banner = "data:image/png;base64,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W7fu537u5xYtWjQ9Pd3tdp/VUxEPTsLqdruVSmVqaurgJKzJycnp6enp6empqamD/xwbG9u6dWtPT8/Y2Nj+/fsPHDhw4MCBvXv3HjhwIMuy4eHhOT0kzzzzzDe84Q2XXnrpypUri//dbt26dWhoyA8SAOY6BRYA80R7bGd7bGeBCyxm1H/ceyjmsZvHpP3vu1yFJEm+vwFWVksrPUmyIOtdFpaelMSYhCR2252p4c7Ens7Yzu7U/uaBzc2990zvuDUmMcm7sduOSRJCJWSVws7PCiF0u90777xz06ZNX/7yl9/whje84Q1v6O/vn7kjDg4O/tCvxMcsko0xhhA6nc7ExMTU1NTExMTY2NjExESe5/v379+5c+fu3bu3bt360EMPNZvNRx55JE3T4q9JXLFixVvf+taf+ImfOO644+bKe+O+++5rtVp+RgAw5+/2ivmoFAA4/GtauuyF/33hGW+UBIcgJo9ZhBi+/7DCENIkhBjz2J7OO9N5a6w9um161x2TO+9ojzzSbY51J3bnnWaa1UNWSUL6w8VZEf5iMR5czddoNNavX/+2t73tFa94xbJlywr1TeZ53ul0frDqcHp6evPmzTfeeOPevXs3bdq0c+fOiYmJ4eHhPM8PLlEsgtWrV1966aU/8zM/s3bt2izL5spA37Zt2y//8i/fcsst3vMAzPmbfQUWAPPGglN/atlFvxVST/rjGd0dJckPiq0kJiGENIQsbw5P73twavut0/vua+3f0BzaHNtTIasmSZqkaQhp0f4aBxf6tdvtCy644E1vetOll166bNmywj4mL8/zg9OvYoy7du168MEH77vvvna7fccdd2zatGl6enrv3r3dbvcHf2zWNBqN00477cUvfvFrX/vaY489dg5VVwddd911v/qrv7p7925vbADm/C2aAguAeaO2+IRVL/tobdEJomAGbprSNKuFak/eHGsNb2kNbZ7edcfE1htaBzbmnWbsNkOShqz6/Q2zCmRiYiLGeP755//Mz/zMq171qqLNxnoSMcY9e/bs27dvcnLy/vvvv/feezdv3rxly5bx8fGpqamDs7dm7ugLFy487bTTfvqnf/olL3nJ4sVzcm1yjPEv/uIv/viP/9jbF4D5cC+mwAJgPln143/Uf8JLC7iwi3khJjEJWRayRsiqeWe62xzpjGwf33z1xJbvdMZ2tUa3J3k3hJCkWUirSZol8chv6pSmaafTGRsby7Ls/PPP/y//5b9ccsklc+4OsNvtNpvNgztqbdy48aabbtq2bdsdd9yxb9++vXv3PosH6unpWbFixYUXXvjKV176nOecOzAwMHfH6+jo6K/92q9deeWV3roAzAMKLADmlQWnvnbZRb8VKrWk8LtBM5fFJCZJloW0FkKapFnenmruuXt807fbw5un9tzTHn4ktqdjkqS13pDVkhiP+L7vIYSDu011u92LL774DW94w+te97of3YV9brnrrrs2bdp0991333bbbXv37t2+ffv09PTTW2NYr9ePPvro5z3veeecc875559/4oknzoNheu+9977jHe/YuHGjdywA84ACC4B5JetZctxPfyHrXxo7TWkw82KSJElIk5CmWU9a6+lM7G0deGhq5+0Tm/9tatc9nYm9eXs8q/WHal8ROqwkSfI8HxkZybLsTW960y//8i+fc845c/0cdDqdRx55ZGpq6vrrr7/hhhu2bNmyc+fOoaGhQ/naarV63HHHPec5z7noogtPOunk0047bT6Nzv/zf/7P7/zO73S7XW9UAOYBBRYA86tOiPGoSz/ev+4/xU77iPcFlHAAhqye1vpizLsTe5tDmye3XDe1/XvTu+9pj24Ntf600jh4A3ZkB2eaps1mc2JiYv369a9//et/6qd+6tRTT50H6U9PT4+Pj2/fvv2WW27ZuXPnTTfddN99942Njf3on+zv7z/llFNOP/30008//eyzzz7uuON6enrm2VgcHR39rd/6rX/5l3/xtgRgflBgATC/+oPO9ILTX7/qP304xjzm5h1wREZhTNIsrfYmaZp0u92p/dO7757cftPo/f/a3P9gWqknIQtpLQlHuMbK83x8fDxJktNOO+3d7373ZZddNm/OQLfbTdP0vvvu27hx49VXX33fffc9/PDDK1asWLVq1bnnnnv00UevXLnyhBNOWLlyZbU6bx9aes8997z+9a8fHh72jgRgflBgATC/qoNOs7Zk3dGv/l/VhcfETksgHMHBmCTh4FbuIYTYabVGt03vunP0wa9Obb+p2xpLut202nPEH1nYbrdbrVZfX9+ll176u7/7uyecMN8e4jk8PDw6OtpsNnt7e3t6ehYuXJim6fwffDH+7d/+7fve9z7vQwDmjWxOP1oFAH5YSLuT+6qDR/WsPj/J2/LgCI7FJEmSmCd5J+bdJIRKz6La0pMG117Sd/zFWX1B3hrrjO+KeSek2RGssbIsq9Vq7Xb77rvvvu6663p7e0866aQsy+bNaWg0GgsWLFiyZMng4GBPT08IpXhE6d69ez/0oQ/t2bPH+xCAeUOBBcD86gzSNDbH0/pA/5oLQ1azDRaFEZPYTWKepGl1YHX/8S/uX3NhdeGxsTnaHt+dxG6SJCEcsZlBWZZVq9Xt27d/7Wtf27Vr10knnbRw4cKSdD3z0i233PKpT30qRj8AAZg/FFgAzDMhSdPOxL7eo55bX7gm5h2JUDAxyTux28p6l/QefV7fcS+qLzmxM7Evnx6KnYkkJiGkyRFqsmq1WpIkt9xyy7e//e3+/v5169bN4y2i5rFOp/MXf/EXd999tygAmE8UWADMNyFU8umhat+K3mMuSExAoLDyduy2s8ZgY8UZg+tfXlt4XD492pnc122OhCSGtPLoIsTZlaZptVrdsWPHVVddtX///lNOOWXBggXO1dzy8MMPf+xjH3vcxy8CwNylwAJgPkqz9uj2gXUvy3oWJDGXB4UUkiRJ8k4S22ml3rPqnIETX1YbPCq2pzvjuzrTwyFNj9Qy2Hq93m63v/Od79x6663r1q079thjna055G//9m+vvPJKOQAwzyiwAJiPxUBI8+ZIdcHRvUc/N3aaia18KPBoTZIkiXnsTIVKT+/RF/Qe98LaouNiZ6o9vjNvjqWVepIcgRWFlUqlp6dnw4YN119/faPROPnkky0nnBOGhob+6I/+yPbtAMw/CiwA5qvYndzXd9yLs8ZAErtHZDUWHI6Q5O28PZn1LOxZeVbvmotqi46L0yPNoYdDkh+RFYVpmvb09OzevfvKK6/csWPHWWedZTlh8f1//9//9w//8A95buYpAPONAguA+VoGxO70WG3R8X1Hn5+3Jk3CYm4M2ySJnWbM21nPgp7lZ/Yd8/zqwIrW0ObuxJ4kSUJ6BOZA1ev1brd766233nPPPSeccMLRRx/tPBVWu93+yEc+8vDDD4sCgPlHgQXAfK0CQt6eDknee9zFWbUv5m2TsJgrQzdJYtJtx9jNehb1rDqnf82FMebtoc3d5mhIKyFks/wd1Wq1SqXyyCOPfOMb38iy7Mwzz6xUKk5UAX3rW9/627/921arJQoA5h8FFgDztgZIkrwzsbe++ITGqrNie1oizDUxyTtJklT7V/Sv/bGe1eflU0Otoc1J7IY0neVCNk3TLMvGxsauvvrq0dHRCy+8UIdVuOES4/vf//4HHnhAFADMSwosAOavELqtsSTmfce+IKsNxrxlEhZzUIx5J4mxvmTtwNqXVPuXTe+9L2+OJkkIIZ3d91OoVCrtdvvmm28eHx9//vOfX6vVnJ7iuPzyyz/72c82m01RADAvKbAAmLdCCEne7U6P9Cw/rbb0pNixrIa5K8ZuM2T1nlXn9R7zvHx6qHVgc2xPhTRLZrfGqlQqeZ7ffPPNGzZsWL9+/fLly52bImi1Wn/1V391xx13iAKA+UqBBcB8FrJqd3Jv7LT71lyY1voOLsiCOTqck5jHvFMbXN13/EsrjYH26LbO+K6YxJDN6ubulUolTdNbbrnl6quvXrly5cknnxw8JOFIu/zyyz/1qU/Z/QqAeUyBBcA8/8wfkrQ1uqW++PjGitNj3kmSKBTmtJi3QlrpXXNh76pzus3h5r77k24rZPXZfV+F3t7e7du3X3XVVcuWLTv77LOdlyNobGzsT/7kT+6//35RADCPKbAAmOdCVsmnRvL2eP+ai7P6QDQJi7k/qJOYx06ztvj4/jUvzBqLpvfe153cF7LaLO+K1dPTMzo6ev311y9fvvzMM890Yo6UL3/5y5/5zGc6HT/cAJjPFFgAlODjflbrDG/J+pf3rj43iblJWMwPsTOd1gf7jn5uY8UZ7QMPtQ5sDmkW0upsjvBGozE2NnbjjTcuWbJEh3VE7Ny588Mf/vDWrVtFAcD8psACYP4LIUu6zdbII73HvKA6uDJ2zVNgnoidZhJjffEJfWsuDCFt7r0370yFrD6bHVatVhsfH7/hhht0WLMvz/NPf/rTX/ziF0UBwLynwAKgFEJW7YzvTpLYd8wLkrSSxFwmzIuRHZKYx2670ru479gXVvpXTO+8pTs1HCq12fwuKpXKwQ5r0aJFZ511ltMya2655Zb3v//9U1NTogBg3lNgAVCaD/pp2tx7X33JusbyU2PelgjzScw7IaQ9q87uWX5a+8BDrbGdIaTJ0304YJ7nh/tgwYMd1nXXXbds2bIzzjjDcwlnwfDw8Pvf//777rtPFACUgQILgLIIaSW2p7oTe3vXXJg1FiSxKxPmlZjHbre2+IS+Y5/fndzX3PdgkndCWnk6b5YQnl6HNTEx8d3vfnf58uWnnXaaDmum/dM//dPf/M3fyAGAklBgAVAiIau3Rh6p9C7sO+Z5HkfIfBRj3s56l/Qf96IkCVPbvxcf3RLr8N8sj6mfDr2KqlarY2Nj11577YoVK04//XQd1szZuXPne9/73v3794sCgJJQYAFQLiHNmnsfbKw4o7bwuCRvJ4kP2Mw7eTtUe/qOuyit9U4+8t28PZlW6rN28FqtNjw8fN11151xxhlr1651NmbkDOf5H/7hH1511VWiAKA8FFgAlEwI3enhbnNk8MSXJ0k6mw9rg1kb5UneSZK079jnVwePmt51Z3dyf5jFDqvRaOzZs+ehhx665JJLFixY4Hw86/7xH//x4x//eLdrHTQAJaLAAqB0YszTrNJ3/IuznsUmYTFPhSRvJyH2HnVebfHx03vu6oztDFkteQZr+g5rPWCj0XjooYeazeZLXvKSSqXifDyLHnjggd/8zd8cHh4WBQClosACoHxiXu1fPrDu5Qos5rMQkm43dtv15ac0lp7S3Htfe2RrqNRmZ8CHEKrV6p133jk1NXXhhRdmWeaEPCump6ff97733XLLLaIAoGwUWACUT+xW+pYNrL80ayxUYDGfhZDEbszb9cXrGstOntp9V2dsR8hqs3SXmWUxxltvvXVsbOwFL3hBtVp1Qp65z33uc5/+9KfzPBcFAGWjwAKgfB4tsF6hwGL+CyGJeey0qguPqS87pbnzjs7knpDOUpeUZVm327355ptDCBdddJGz8Qx9/etf/4M/+IPR0VFRAFBCCiwAykeBRbmEJEli3q4tOLa+9KSpXXd0x3eFbPY6rHa7fccdd6xbt+6kk05yMp62++67733ve9/mzZtFAUA5KbAAKB8FFuUc+LFTW3hcfelJkztvbY/tTJ/Znu6HcbuZZWNjY1u3br3ooosWLVrkRDwNe/fu/e3f/u2bb75ZFACUlgILgBJ+jldgUd7BX198Qm3xCVPbvteZ2pNmjVk45sEN3Tdv3rx79+5LLrmkVqs5D4el3W5/4hOf+Kd/+idRAFBmCiwAyvgZXoFFWeVJ3qkvPaW24OiJR67rTg2l1dnosNI0TdP07rvvrtfrL3jBC0LwpjtUnU7nf//v//2xj30sxigNAMpMgQVA+SiwKK+QxDyJncaKM9Jq7+SWa2K3NTvPJcyyrNVq3X///WecccYJJ5zgTByir3zlKx/84AebzaYoACg5BRYA5aPAosxCSGI3iXnP6nNDVpt85Lok78zOcwlrtdru3bu3bt36yle+sre316l4SjfccMPv/u7v7tu3TxQAoMACoHwUWJRdSGInCaHnqOeGJExuuzFJ8hCyWThwtVp96KGHFi5c+PznP99Cwid3xx13/Pqv//qWLVtEAQCJAguAMlJgQRKSvJOmWc9R53Um9jT33BXSbBbeC5VKJUmS733ve2vXrj3llFOchidy2223vfvd737wwQdFAQAHpSIAACilkHemQhqWveCdPUddEPPWLBwyxtjT0zM1NfX+97//zjvvdA4e17XXXvuud73rnnvuEQUA/IACCwCgtELens56ly676N1ZY3HszlKHNTAw8Mgjj/zRH/3R1NSUc/BYeZ5/7Wtfe9e73vXAAw9IAwAeyxJCAMrHEkL4dyHJO7WB1ZW+FeMPfyt22iGrzPhbMMZKpbJx48Z6vf6CF7zAOTio2Wz+3d/93fve9z67tgPAj1JgAVA+Ciz4EbWlJ8ZOc3LLtSGthnTGN3QPIbTb7YceeujCCy9csWKF/Ldv3/6JT3ziz/7sz6anp6UBAD9KgQVA+Siw4EfeFWm1t7HslOnddzf33Z9We2bjNjTL9u3bt2XLlksvvbRer5c5/Wuvvfbtb3/7N7/5zRijsQgAj8seWAAAJHl7Mutfsfyi364vWZu3xpIw48VuCKFarX7rW9+64oorSh7+ww8/vH37doMQAJ6EGVgAlI8ZWPD474xOffHxSac5vvnbIWQhnfHNsLIsa7Va+/fvf/nLX97b21va5NesWbNhw4ZNmzaZgQUAT3jboMACoIQf0xVY8HjyEEJ96SmdsR3Te+5OskqY4XlYIYQ0TR955JHe3t4LL7ywtLk3Go1jjjnmm9/85sTEhFEIAI9LgQVA+Siw4PGFmLeznoX1peundtzaGdsZsspMv0HSNO10Onfffffpp59+wgknlDb6pUuX7tix47bbbjMKAeBxKbAAKB8FFjyhELvt6oJj00p94uGrY7c9C08krFQq+/fvr9VqL3nJS2q1WklvyrNszZo1t9xyy+7du41CAPhRNnEHAOAxYjdvj/evf/ngST8R804S8xm/H03TWq12+eWX33jjjWUOfu3ata94xSuyLDMGAeBHmYEFQBk/n5uBBU8sJN1OVh+oDKyefOTafHo4mfnd3CuVyvDwcLVafdGLXlSv10sb/fHHH3/bbbdt27bNKASAH2IGFgAA/1EI3eZIY+UZi856c54kSTLjj8arVCpZlv3rv/7rLbfcUubgV6xYcckll/T09BiDAPBDFFgAAPyoENsTC894Y+/Ks2O7OdMTFfM8X7BgwY4dO/7hH/5hamqqzLm/+tWvXr9+/Uw//xEA5hwFFgAAjyPmnbQ2uOT5/y3UeuPML7aNMS5atOjLX/7y7bffXubYV65c+dKXvrTM6ygB4HEpsAAAeFwh7zZ7j3ne4PpL8+ZoEma8wOrp6RkeHv7sZz/b6XRKG3qWZT/xEz+xevVq4w8AHkuBBQDAE4h5yOoLT39DdcExeXN8pjusgwsJv/zlL5d8J6wTTzzRTlgA8EMUWAAAPLFuu7HqzIETXx7zdoz5jN+bpunU1NQnPvGJbrdb2sizLHvzm9/caDSMPgD495sEEQAA8ERi3glpfcFpr6suPDa2JpKZ31y8Wq3eeeedmzdvLnPsa9euvfjii7MsMwIB4CAFFgAATybmzfrSUwfXvzLmeZLP+MSoLMv2799/zTXXlDnzEMLP/uzPVioVww8ADlJgAQDwZGK3k1brC075ydriE/LO9Izfnqbp2NjYF7/4xbGxsTLHfs4556xfv97wA4BH7xBEAADAk4ud6fqyUwdPfHmMnSTGmT5cb2/vd7/73a985Stlzrynp+d1r3tdmrpdB4AkUWABAPCUYt4NlVr/uv9UHTwm70wmyczuhJWmaavV+vznPz8yMlLm2C+66KLVq1cbfgCQKLAAADgknWbPyrP6jn1BEpNk5h9HWKvVbrvttjvvvLPMka9Zs2bdunWGHgAkCiwAAA5F3m2ntYHBE18Rqr15Z3qmJ2FVKpVWq/Xtb3+7zJn39vY+73nP6+vrM/wAQIEFAMChyGPe7jnq/L6jzgsxzvQkrDRNm83mt771rf3795c59EsuuaSnp8fgAwAFFgAAhyLkrYnqwKrBk38iqdRi3pnp42VZtnPnzrvuuqvMoR9zzDGnnXZaCMH4A6DkFFgAAByaGPPOVO+aC3uWn57ETpLM7OMIa7Xa9u3bv/GNb5Q58lqt9vKXv7xarRp9AJScAgsAgEMTQmxN1Bae0HP0c2OozHB/lRycdvTAAw/s3r27tJHXarUzzjjD0AMABRYAAIcqJjF2m/0nvLTSuySJ3Rk9VgihUqncdNNNN998c5kzX7Fixemnn27sAVByCiwAAA5dyFsTvavPqy09Mc70kULIsuzAgQN33nlnnuelTXzJkiUXXXSRkQdAySmwAAA4HCFJ0mTBSa9OYjdJZnBz8RhjtVrN8/yaa67ZuXNnafNuNBpr165tNBqGHgBlpsACAODwxG6795jnZ/WFSZzZiVEhhBDC3Xff/dBDD5U58DPOOOOcc84x8AAoMwUWAACHJ8ZupW/p4Kmvie3JmZ6E1dfXd+DAgWuuuabdbpc28OOPP75SqRh4AJSZAgsAgMMUk7TSaKw+N+9Mz2iBlSRJtVqdnp7+zne+s2/fvtLmXavV1q9fn6Zu3QEoL1dBAAAOW8y79cXrGqvPydtjszAJ6+GHH37kkUfKHPh55523YsUKAw+A0lJgAQBw2GJs1xYe21hxRt4cT0I6kweKPT09W7du3bhxY5kDX7t27ZIlSww8AEpLgQUAwOGLMa329Kw8O2ssSrqtGT1UlmWtVuv2229vNpulzXv16tUTExPGHQClZTNIAOAxQgiF/N+3YhIf/c/v/yNJYhJjkvxg+Vpw9mb3lMSYd3qPvqC64JjWgQ1pY8Gjp2Nm9PX13X777aOjo8uWLStn3o1G46STTtq6dWun0zH6ACghBRYA8H0xJmklZLUCfmshSZIQ/v3fQhKSNAkhxjzJu0nMY96JeSeJ+cHf1WfNyoDJqwuOri1e29z/4Iy2VwdXEd577727du0qbYFVqVSe+9zn3nTTTfv37zf0ACjjpVAEAMBBoVJvHdg0vfuOGLsF22cgpFmWpLWQ1UJaCVklZI2svjCt9yZZLa000rQaKj1ZY2GSZnl7Kuk0824ziVGTNbNiN6SVvmOeN/7w1TFvh7Q6c4fKsmx0dPTOO+88/fTTQyjjOa1UKkcfffT09LRxB0A5KbAAgCRJDm5p1D+16/a9V38k7zaTtFA3CTEkaRLSkKZJyEKSJmkWKrUkSbPGYGVgddazqNq/srbw2LRnSW1wdaVveaV/eRLSvDmRd6eTvOv0zshZyfO0WmksPzWkadLtJGn4wfLOGRiesVqtfu9733vDG95QrVZLmHaapkuWLMnz3MADoJwUWADA94UQY95tT8XudBKywn17MX5/D6yYJDHGbpLnSQhJqIY0hLSSpJU0q9cXHVcZPLrSv6K26PjGyrPqS9dnjQWx04x5N8bvrzHk2TonSVIZXF0bPLp54KGQxBkenuGmm26anp4uZ4GVJMmiRYtWr169adOmGKOxB0DZKLAAgB+IIUnTSj2GUMQC60eFJIkxiXkSY0zypNvOu62p3XfG3XcmeZ7VBioDK9L6YH3p+oG1L2usOjurD4RKX8ybsdt2sp8d3XbWs6hn9XOa+zYkMSYzubgvy7Ldu3dv2LDhOc95TjnDHhgYOO644zZv3qzAAqCEFFgAwGM8WkDEJJkLn5APfo8hTUISkuz723bFEGOSJTFvtYYfSWJ3es89Yw9+tdK3sv/El/UdfUHPqrOznkV5eyrm3bnx1yzyGYidrD5YX7I+5jPeCaZpOjk5ecstt5S2wOrr61u5cmU5twADAAUWAPAYMc79Tic8WsOFNCRJklSTJMZuuz26Zd93P3Gg8qm+NRcOnPzqgeNfkvUsiN2OGuuZDpi0Ul10fNa7OHZbIczsPu7j4+N33HFHacPu7e1dtWqV6VcAlFMqAgBgvgtJSJNQyeoDIa2ObfzGrivfs+1f3j5yzxe7rfFQaYQ0k9HT1+3UFh1XX3JibDdn4WibNm0aGRkpZ9K1Ws1TCAEoLQUWAPAYIczrPc5jEkLWsyhJksmtN+z4+m/t/PpvTzz8nSTN0lpvEoKpWE8n09ip9q+qDh4du80ZHTwxxlqttm3btgcffLC0aZ988sn9/f1GHQAlpMACAEom5iGtpLWBkFbHN1yx/V/fsf/G/9ke25k1FiZpJbE+67DzjGl9oDKwMqRZEvMZPVSlUtm+fXuZC6zly5cvXLjQoAOghBRYAMBjzIc9sA71rxrSLK0Pxm5r79V/uP1ff3Viy7VZY1Go1M3DOswg8ySJ9YVr0sbCPO/M6KFCCFNTUxMTE6UNe2BgoLe316ADoIQUWADAY8zzJYQ/KoasEep9Ew9fvfOrvzF0++eSkIZMh3U4CcY8SZLqwuOy+oIkb830+Dm4lXtp0x4YGOjr6zPqACghBRYAUHIxZLVK3/LW8Jbd//Z7+6//eBK7aaUhl0MPMElCdcGxWa0vdjszfbAsy+69997S7mU+ODiowAKgnBRYAEDpxZgkIa0P5p3pfd/75N7rPx7zTshqgjn0BLPGgrQxmCQzvgQ1y7I777xz165d5Qx6wYIFg4ODBhwAJaTAAgAeo0R7YP3w3zxJkrTSkyTp0C2f3vfdP495O4TMiDik7LrttNpbX3ZaWqnHvDujx8qybOvWraOjo+WMulqt7t2715ADoIQUWADAY5RuD6wfCSCrxiTdf/OnD9z0qSRNk+Bm6akzS2Ieslp14bFJWp3pBxEe1Ol0Shv3ihUr0tSwBKB0XPwAAP6DkGZJEg7c+rej938lVHuSEOzp/uRi7CZprdq/IqSVmS6wQgh5nj/44IOlTfv000+v1axvBaB0FFgAAD8spFneHN9z7cemtt6Y1QeTGGTyZPJuyKpZ37KQZjHmMzqJL4TQ7XZvuumm0oa9cOHCLLO4FYDSUWABAI9R3j2wflio1NvDm/Ze97HO5IG03ieWp4grdrP6YNazMIRkRrNK07Tb7d5+++15npcz6oULF1YqFUMOgLJRYAEAj1H6PbAem0VW65/c9r2h2/53klaStKLDepJhk3fbWX2w0rdyFirQGOPExES32y1n2IsXLzYDC4ASUmABADzRjVI1ybvDd/7D1I5b0mqvPJ5EjJ20NpD1LglJkiQzvg1WpVIJoaRNqxlYAJT0vkwEAMC/s4TwP8aR1vraI4+M3Pn3eXsqpFWJPIGQ5J203p/1Lomz1SuVtsDq7e31FEIASsjFDwDgiYUQssrYpqumtt+SVnvk8URit5NW+6s9S0KSxBhn+py02+2RkZFyRp3n+UwnDAAFpMACAB7DHlg/GklW74xuH99wRbc1ETKTsJ5A7KbVeqj1JTPfraRpOjIycscdd5Qz6Xa7bbgBUEIKLACAJxWyJGSjG69o7nsgVBryeJKkQlpNZn5lX5ZlIyMjt99+ezlT7nQ6ZmABUEIKLACApxAqtc747okt1yTddgj2z378kGLervQuSesDMz0JK03T8fHxjRs3ljNoBRYA5aTAAgB4cjFktdiZntp2U7c5lqSZRB4/pryb1vtDZpLazOp2uwosAEpIgQUA8NRCVpvee39z731BgfVE8m5a6w+VRpLkM346QijtUwjb7bYCC4ASUmABAI8RY5L4bPw4saS1vvboI5M7bkliTII7qB8RkiTpprW+tFIXxoyanJzM81wOAJSN2y8A4DE8hfAJk8li3mnte7DbHFVgPa4876bVgwWWDnQGTUxMKLAAKCG3XwDAY5iB9cTJZNXe5oGHOpN7gwLr8SPK02pfyMzAmllTU1MKLABKyO0XAPAYZmA9oRgqjeaBDZ3JfUkQ0eMMnSTmabUWKlVZzKjx8XEFFgAlpMACAB7DDKwnu2+q5NNj7QMPJ3lXGI8jj0lW95TGmTYxMdHtGoEAlO9GTAQAwL8zA+tJxCRUas2Rh2PeEcbjxZOnWT0EM7Bm1vDwsBlYAJSQAgsA4BDFJEk7Y7tj3lHzPZ48qdRCls3OHL40Lel97MMPP9xqtYw2AMpGgQUAcKhClnVGtyZmYD2uGENaTWZrBlY5S5wY444dO4w1AEpIgQUA/IfPx/bAehIhZM2hh83AesJ8kiRJ8pk/CyFN0507d46MjJQt4YmJiaOOOspIA6CEFFgAwGPYA+upAordduy2hfSE4sECdGZr0CzLtmzZcvfdd5ct3fHx8aGhIaMMgBJSYAEAj2EG1pMLSQhp3hxT8z3B8Mkrvctm4UGEaZpu3779oYceKlvC4+PjU1NTRhoAJaTAAgA4LN1uezwJCqzHFUO1MTvhdDqd6enpsuU7Ojo6OTlpnAFQQgosAOAxLCF8SjHG1mSQ0uOHk8zaDL6DO2GVLeCRkZGxsTEDDYASUmABAI9hCeFTJxTz1rj+iiNi586dw8PDcgCghBRYAMBjmIF1CGLMhcCRGHjxrrvusgcWAOWkwAIAgDlgenp6xYoVwf5rAJSSAgsAAOaAqamphx9+WIEFQDkpsAAAYA6YnJzcu3dvjHapA6CMFFgAADAHjI6Obtq0SYEFQDkpsAAAYA7YtWvX7t27FVgAlJMCCwAAiq7b7Q4PD9frdVEAUE4KLAAAKLpOp7NlyxbTrwAoLQUWAAAUXbfbvfvuuycnJ0UBQDkpsAAAoOimpqYefPDBTqcjCgDKSYEFAABFt2/fvsWLF8sBgNJSYAEAQNFt2LBh27ZtcgCgtBRYAABQdDfddNOBAwfkAEBpKbAAAKDoNmzY0Gw25QBAaSmwAACg0LZt2xZjlAMAZabAAgCAQrvllltuvfVWOQBQZgosAAAorhjjtm3bxsbGRAFAmSmwAACguIaGhh566CE5AFByCiwAACiu/fv3X3vttXIAoOQUWAAAUFAxxq1bt27btk0UAJScAgsAAAqq2WzecMMNtVpNFACUnAILAAAKanJy8qqrrmq1WqIAoOQUWAAAUEQxxg0bNhw4cEAUAKDAAgCAgvr6178+NDQkBwBQYAEAQBGNjIxs2LCh2WyKAgAUWAAAUEQbN26899575QAAiQILAACK6bvf/e7OnTvlAACJAguAsl4As5B5LD1QXNPT01dddZUcAODR+3cRAFA6IeTTo93JfVl9IEmSJIkiAYrmwQcfvPXWW+UAAAcpsAAonZBWWkOb9lzzR839D1R6lyQh6LCAovn0pz/d6XTkAAAHKbAAKKGQVBrjm67a/pVfn957X9ZYnAQXRKBAtmzZct1118WoWweAR7lfB6CMQppljYWTj1y7/Su/PrX9e1ltIEmCWICC+Kd/+qfh4WE5AMAPKLAAKKUYkzRLGwuntt+044r/Pr7522mtN5iHBRTAnj17rrnmmsnJSVEAwA+4UwegrGIMIct6FkzveWDH139r9P5/CZV6EjLBAEfWlVde+cADD8gBAB5LgQVAmcUkSbN6f3d81+6rPjh05+dDWglZRS7AkTIxMXH99ddPTEyIAgAeS4EFAEmoNLrNsT1Xf3T/zX+dxBiymkyAI+L222+/8cYbu92uKADgsRRYAJAkSRLSSuxM773mj3d/+w9i3k6r/UmSJIlHgAGzJ8/zf/7nf963b58oAOCHKLAA4FEhq4WQ7r/5b3Zd9ft5cyyrDyZJ0GEBs+aBBx648sor2+22KADghyiwAOAHYqg2slr/8O2f3fXN322P76w0FiZBhwXMhk6n85nPfGZ4eFgUAPCj7FMLAI8RY8hqaZIM3/2Fbmt8xYvfV196Yrc5mkQdFjCzbr311ssvvzzPc1EAwI8yAwsAfkgMWS2t941t+NqOr/3G5Pabs9pAkgS5ADNncnLyL/7iL0y/AoAnosACgB8VQ1ZNawOT22/eecVvTjz8nbTWlwQdFjAzP3FivPbaa2+77bZosicAPAEFFgA8/gfKkGZZbaB54KGdV/726ANfSSsNHRYwE4aGhj772c+OjIyIAgCeiAILAJ5YCGml0RnbvfOr7xq+8+9D1gip7SOBZ1OM8V//9V9vvfVW068A4EkosADgqWSVGLu7rvrg0G2fSbJKWqmLBHi27Ny58y//8i9NvwKAJ6fAAoCnFrJazDt7vv0H+2/4q9jtptW+JEmSxHQJ4Jn6xCc+sXPnTjkAwJNTYAHAoYhppScm+d7v/sXeaz/abQ5n9cEkCTos4Jm48sor/+Ef/kEOAPCUFFgAcIhiWu0NSbL/pr/Z9c33tcd2VhoLQ2Jbd+Bp2r179x/8wR+0Wi1RAMBTUmABwCGLMWSNUKmP3P2FnV//zebQQ6E+KBXgaZiamvrDP/zDDRs22LsdAA6FAgsADksMWT2t940/dNW2L/3S1I7b0lqfUIDD9cUvfvErX/mKHADgECmwAOBwxZDW0lrf9J57d1z+q5NbbwyVniRYSwgcqk2bNn3qU5+anJwUBQAcIgUWADwNMQlpWutrjWzd8bV3Tmz5TlbtDamrKvDUdu7c+T/+x//YuHGjKADg0LnVBoBncB2tNDqjO3Ze8e6RB74SskZIqzIBnkS73f6f//N/fvGLXxQFABzejbcIAOCZCNWezsSeXd/4vaHb/y5JklBpyAR4XHmef/WrX/3Hf/zHZrMpDQA4LAosAHjGV9NqX3d6ZPe3/2D/jf8j5m3bugOP64477vjoRz86OjoqCgA47FtuEQDAMxbTak/M23u/+xd7v/2HsT2VNRYIBXisLVu2/NZv/daWLVtEAQBPgwILAJ4VMa32hBAO3PrpnVe+pz22yzws4AeGh4c/9KEP3XfffaIAgKdHgQUAz5IYQ7UnVBtDd/39jq/+entkW1rtkQowNjb2l3/5l1deeWWe59IAgKdHgQUAz54YQ1bL6gvHN317x9f+e/PAprRqHhaU3d///d9/5jOf6XQ6ogCAp02BBQDPqhhDWsnq/ZNbv7vjindP7bo9qw+EEAQDpXXxxRefc845cgCAZ0KBBQDPupiENK32Te+8ZcfX/vvYQ1el1b4kuOZCSZ100kkf/ehHTz/9dFEAwNPmZhoAZkZI0mpfa/+GXd/4nZH7vpRWGiGtSgXK+MMghPXr13/wgx885phjzMcEgKdHgQUAM3mhrfW1x3bs+rf3D93xf0JWDbZ1h7J6wQte8N73vnfRokWiAICnc18tAgCY2Wtttbc7PbL7W//Pvus/HvJuWuuXCZTTy1/+8re85S21Wk0UAHDYN9UiAIAZv9zW+mK3tfs7H9397T/IWxOh2isTKKFarfaOd7zj0ksvTVM34QBwmHfUIgCAGRfztDaY1vv33/y/dl/1/+RTQ6HSm0S5QOn09/e/973vXb9+fbVqUzwAOAwKLACYFbGbVnrSat/wXZ/fddUHOmM7Q30giUosKJ2jjjrqT/7kT5YsWSIKADh0CiwAmC0xD1k9VBqj93951zd+p7XvgbSxUCpQQueee+6b3vSmRqMhCgA4RAosAJhNMaSVtNIz8fC3d3393VM7bs4ag0KBEvov/+W/nH/++SEEUQDAoVBgAcCsC2mo9EzuvG3nFf99fNO30/pAEjKpQKksX778Ax/4wIoVK0QBAIdCgQUAR0IIabW3uW/Djq/86sjdX8hqfSGzozOUy6mnnvqOd7yjVquJAgCekgILAI7cZbjW357cv/MbvzN0++dCVg0VG+JAubz1rW8966yzLCQEgKe+cxYBABw5MWssiO3J3Vd94MBNf5PEPK32JIlHE0JZVCqVD37wg4sXLxYFADw5BRYAHFExT+sL8m5z7zV/tP+GT+StybTal0QdFpTFOeec83M/93O9vb2iAIAnocACgCMtdtPaQB67+274xJ6rP9KdOpDWB3RYUB5vfOMbjzvuODkAwJNQYAFAAcQ8rfQmSTp85+d3/dv7O+O70sZiHRaUxDHHHPO6172uXq+LAgCeiAILAAoihko9yapjD35t5xW/1dx7d9a7yH5YUAYhhMsuu2zt2rWiAIAnosACgOKIIa2ErDq+6d+2/8s7JrfdlDUWJInHk8H8t3Tp0re//e39/f2iAIDHpcACgIIJaVrrn957347Lf21iy7VZvT8JmVRgnr/vQ3jZy152zjnnhKCzBoDHocACgCJ+ls0aC5r7N+742n8f3fj1tFIPWc1yQpjfFixY8La3vc3jCAHgcSmwAKCYQtazsD3yyO4rf3fk3n9OkixkDR0WzG8vfOELzzrrLJOwAOBHKbAAoKhiTOsL2xO7dv/bBw/c+tdJkoSKDgvms97e3l/4hV9oNBqiAIAfosACgAKL3bQ20G2O7r32T/dd//Gk20mrfUnUYcG89YIXvOC8887LMjvfAcB/oMACgGKLMa31J3l3/03/a/c1H8mbY2ljQIcF89XAwMCLX/zier0uCgB4LAUWABRfDJVGkoThWz+34+u/2ZnYmzYGdVgwP+/O0/SlL33p6tWrRQEA/+ESKQIAmBNCVk2yytgDX9n51Xe1hh/JGoNJYqdnmIfWrVt30UUX1Wo1UQDADyiwAGDOCGklrfaPbbxy59feNb33/qzWlwSXcphvsix785vf3NvbKwoA+AF3vQAwty7dlayxYHLLdTu/9q7xbd9Nq40ktdkzzDennnrqC1/4wjR1rw4A378LFgEAzCkxCWnaGJzadeeur/3W+MZvpJVGSCtygXnmDW94gwILAH7ARREA5uYlvNbfGtm888rfGb7nC6HSCFktSWzrDvPHueeeayt3APj3u18RAMDcFNNqf2diz56rPnjg5r9OQghZXYcF88aCBQt+6qd+Sg4AcJACCwDm8oW8NpC3JnZ/+w/2XfdnSYxppTeJOiyYD7IsO+usswYHB0UBAIkCCwDmuBgqPSFN933vk3uu+WjstrL6gHlYMD+cffbZ69evlwMAJAosAJj7YsjqIWQHbv7/7fq393enhrL6oA4L5oFly5adcMIJIQRRAIACCwDmg5DVQ1YdvuvzO7/xntbwI6HWnyQ+9MIcv1NP0xe96EVLliwRBQAosABgfoghq6eVnpEHLt9xxW+29tybVnuS4EIPc1gI4bzzzuvp6REFALivBYB5IyZpJav1TT1y3Y6v/fepHbek1b4kVOQCc9fSpUuf//znZ1kmCgBKToEFAPNMCLX+6T337Lj818c3XJHWekJasSUWzFGVSuXiiy+Oni4KQOkpsABgPl7g6wPNoU3bv/rO0Xu+GCo1HRbMUdVqde3atf39/aIAoOz3tyIAgHko5lnv4rw1tuubvzt8598naTVUehKTOGAOWrFixdlnny0HAEpOgQUA81Sep/X+vDWx+1sfOnDz/y9JQlrvNw8L5pwlS5acc845cgCg5BRYADB/xRiqfXl7cs91f7r32j+J7emsPmgeFswt1Wr1jDPO8CxCAEpOgQUA81tMq30hb+//3id3/dv7OhP70nqfeVgwt6xbt+7MM8+UAwBlpsACgHkvhkpvSKtDd//fnVe+pz26La32CgXmkOOPP77RaMgBgDJTYAFAGcSQVbNKY/TBy7d96e3NfQ+mtb4kBLnAnFCtVgcHB4P3LAAlpsACgNIIWdZYMLXr9u2X/9rUrtvTam8SUssJYU648MILFy1aJAcASkuBBQBlEmPWWDS9994dX33X5Jbr0mojpBUdFhTfKaecsnjxYjkAUFoKLAAomZhn9QWtfQ/u+Pq7xzd8PUkbIat7NCEU3PHHH9/pdOQAQGkpsACgfGKeNgbbI4/s/Mbvjtz1+ZDVQ60vidFULCisEMLKlSuzLBMFAOWkwAKAUooxrQ10Jvbu/vaHD3zvf4YkpPV+qUBh9fT0nHrqqbVaTRQAlJMCCwBKfB9Q68/bk3uu/ZO91/xR7LbSak+S5OZhQQFVKpWTTjqpr69PFACU9MZVBABQ6luBak8Su/tu+uTOK3+7Oz0cqr0ygQKqVCp9fX3j4+OiAKCkl0IRAEDJhUoj6baH7/x8qNRrC9YkWTXptsQCxXqfhrB27dq+vr7p6WlpAFBCCiwAIAlZNasvGrnnS2mlFvNuEmwU/eRikgQpMMsGBwfXrFlz4MCB6LGhAJSPAgsASJIkSdI0JEnMO5I4BMFOYcy+np6e5cuXhxAUWACU8V5VBAAAUHy9vb0rVqwIwew/AMpIgQUAcLjMf+EI6O3tXbZsWZ7nogCghBRYAACHJ6Q2YeAIqFQq3W7XDCwAykmBBQBwGEJI00qPOVgcEYsXL+7t7ZUDACWkwAIAOBwhCdWGVYQcESeeeOLixYvlAEAJKbAAAA5LCJWGx8BxRAwODpqBBUA5KbAAAA5LyGr9UuCI6Ovr6+npkQMAJaTAAgA4ZDGJMQn1wcQMLI6E/v5+BRYA5aTAAgA4VDHm1YGVachE8fjCo/8/K+cilnAh58DAgCWEAJSTAgsA4JDlndqi45K0YhP3JxDyztTsTE+rVCq1Wq1s+fb19VUqFeMMgBJSYAEAHKoY80rvsiR1B/X4QpJ2J/cneXemD5Tn+erVq9euXVu6hEMYGRkx0gAoIbdfAACHJoTYna4uOT7NamZgPUFEyfeXEM7sQsJut7tmzZrTTjuthBkPDg6mKlQAysfFDwDgkMQYQ1arL16X2APrSJ+IgzOwFi1aVMK//hlnnFGtVg0DAMpGgQUAcChC7DSri9ZW+pabflUEJdwA66C+vj4zsAAoIRc/AIBDEJLYnqgvWVvpXVLCh98VUJ7n5fyL9/b2KrAAKCEXPwCAQxBjzPPG0lOynkVJzOXxeEKMXeHMNDOwACgnFz8AgKcUYnuyuuDonlXnhJBaQvgEIYW8PRU7bUnMqJ6eHgUWACXk4gcA8FRCyDtTtUVrGytPjzFJLCF8/JCy2JqK3VYSgjRmTr1eV2ABUEIufgAATyF220la7T3qOZWeRUneFcjjC1nemY7dlhlqM6perwcVIQDlo8ACAHhyIek2s/rCvuMuTtJazC2Re1wxCWnenpLPTKtWqwosAEpIgQUA8GRikufddt9xFzVWnpnkHdOLniimNE1jZzLvNpNEvTKDLCEEoJxc/AAAnlS3ndYHB096VaVnSd6Z1s488X1lpdscje0pEc2oWq1mBhYAZbzREAEAwBMLsdPsPeq8vqOfF7vT4njSqLJucyS2J2ehwIoxxrJupa/AAqCcFFgAAE8k5J2prLFw4Rk/nQ0sz9sKrCcRQ1btTg532xOzMAErTdNqtSp0ACgPBRYAwBOI3STv9K/9sYF1l3i43lMKIetODcfWxEwfqNvtDg4OnnbaaeXMeXx8PM9z4w2AslFgAQA8vrwzVVt0wuLz357WemPH3uRPKqQxb8XOVBLCTAeV5/nChQvPOeecciY9MTGhwAKghBRYAACPJ2+HrL7oOW/tWXVW3hyTx5MLaSVvTXSm98ckmekNmrrd7sDAwCmnnFLOqCcmJrrdriEHQNkosAAAHkfebS08/Y2LzvzPeXMiRhNenlxM0kq3Odad3BeSZBamqmVZ1mg0ypm1GVgAlJMCCwDgPwpZd2qo96jnLnveryZpiHnL4sGnziyt5q2xzsS+GMNM32HGGNvtdmlLHAUWAOWkwAIAeOzNUdad2l9fcuLyF78vG1gZO1Paq6cWY5pVu9OjnbGdIcSZDiyE0Nvbm2VZOcO2hBCAkt6jiQAA4FEhdMb31BYev/rSP+tdfW7emnCzdGi5JTFNu9PD3amhGJMZrfzyPM+y7KyzzkrTkp6aPXv2dDodgw6AsqmIAAAgSZIk5t3pkcbS9ate/mc9xzzfxu2HIWRJt90Z3x3zTgghSeIMnqUYsyw7//zzSxv2bbfdpsACoIQUWAAAIead2JkaOOE/LXvRexvLT8mbY4mN2w89vlDJO832yCOx207SmV3ZF2OsVConnXRSOaNut9s9PT0xRqMOgLJRYAEA5RaTvDsVQrrorDcvff67KgMr8vZ4oh84nARDmuXdZntoc8zbaWXGHw4YY6xWq+XMenR01AZYAJSTAgsAKKeQJDHmrSTPK41Fi859y5Lz33HwUXp2bT9saRanp5sHHo7dVlLtndFDdbvdNWvWDA4OljPp0dHRiYkJIw6AElJgAQDlE0JsN/O8VakP9q29eMl5b2+sOid2m3l7Qnv1NNJMYtIe39NtjiQhPdgMztzBut3uGWecsWLFinJmrcACoLQUWABAmYQ0dlt5azyESs+qMxef9XODp7w6VBp5ZzyJUXv19DJNQtIZfSRvjoVsxlf2tdvtk08+uaenp5xZDw8PK7AAKCcFFgBQGnm30zwQ0kpjxWkLTvmpwZNeWVtyUt4a+/7EK+3V0xLSJITWgY2dqf1pVpvpRxCmabps2bLShr1hw4b9+/cbdACUkAILAJivwsF9rmLeSfJu3plOa339ay7qO+HFAyde2liyPglJd2ooSUy8emYppyG2W819G2NrLOldPtPrB1etWnXccceVNu09e/ZMTk4adQCUkAILAJhnvt9bdZux00ySJFQbaWPBgnWX9R3/4p6VZ1YHjkpCmrcnYredBNXVM887a4/vao/tDDM8/SqE0Gq1jjnmmFNOOaWcSU9OTrZaLSMOgHJSYAEA80NIkiTmzdhpxW4rSdLq4MqssaS28Ni+tT/Wu/rcysDqtN7/aLGVd5Mk0V49O7mnlfbwI82hTSFrzPSx8jw/+uijS7uD+8TExM6dO9M07Xa7Bh4AZaPAAqCcYhKjFOb+aezGPI8xJkke824ISW3BcdWFx1QHVlQGj+lZcWZj+elZ7+IkpEmSJrET29MzOkWolEIS0vbIlvbII1l9wYweqdvt1uv1M844I5S1eRwbG9u+fXv0swuAUlJgAVDST90zvdyJmThpj25WFZIkxiSktQXHVgaPzhoLKj2Lq4NHZb1LK/0rKr1LKr1LQq0/5u2k20mSPOZtfeVMnZM0zZvjrQObQ0hn+lh5nvf395977rmlTXvbtm2bNm3K89zAA6CEFFgAlE7sdvrWPH/p89+Zt0bs3j1XhFAJlVqS1dOsFir1kNWSJAlZNaT1kGYhy5KsFkIlid1Ht2xvjgptNmTV7sSuqR23JCGb6SWZeZ4vWLDg9NNPL/G7ILTbbYMOgHJSYAFQNjFJ08ay0/qOuzCfHlZgzaUzF5PvT5qLSTx44g6uH4wxxqQ9HR/9Xed09oSQtcd2Tu+9N6TZwalxM3esPM/PPPPMwcHBckbdbrcfeOCBRqMxMTFh4AFQQgosAMoo5p2808w7TWXH/OJsznLeaex2mnvuit1OklZmek1up9O54IILqtVqOcNut9vf+973RkdNLQSgpFIRAFBKUdkBz1AIWRI7k9u+l3cmQzqz/7NojLFarZ533nlpWtLb11ardffdd1tCCEBpKbAAKOlHbzu4wzO+kUzbY7um9z2YJHFGN8AKITSbzRNPPPHYY48tbdjbt2834gAo9X2HCAAAOGwhpGllaset7dGtaaVnpp/zODExcdZZZ5V2A6wkSTZs2GD6FQBlpsACAODwhRA701M7bupOHgiVxoweKsaY5/nZZ5/d29tb2rxvvPHGHTt2GHcAlJYCCwCAwxZCpTnyyPSuO7Jq74xOvzq4fnDVqlWnnHJKCCXduq7ZbN5xxx0xWvgMQHkpsAAAOGwhzVr7N0ztuivU+mZ6R7nx8fE1a9asWbOmtGnff//9Y2NjRh0AZabAAgDgcIW8Mz2x5bokCTP9QM+D046e85znLF++vJxZxxhvvvnmhx56yLADoMwUWAAAHKaQdif2j2/6Vqj1zuj0qxDCxMTEokWLXvayl/X19ZUz7PHx8eHhYYMOgJJTYAEAcJh3kJXqxJZrOxN7wsxPv2q322vWrFm3bl1p096/f//ll19u1AFQ9tsPEQAAcHhiGNv49Vm4k+x0OmmavuQlLzn++ONLmnSMO3bs2Lx5s0EHQMkpsAAo6afCmd64B+bpWyemtf7JXbdN77t/Ft5C3W630WicffbZtVqtnHm3Wq1rrrmm1WoZegCUnAILgHIKM/3cNJivb51QaYw9cHlnfE+SZjN6qBhjt9s9++yzzzvvvNLmPTo6+o1vfOPgTvYAUGYKLAAADk3Ms55FU9tvHn/o30ISkzDjc7Da7fbJJ598wgknlDTvGO+5556RkRFDDwAUWAAAHJKQVpIknXjkutbww0lamenDtdvt5cuXv/SlL03Tkt6yxhi/9rWv7dq1y9gDAAUWAACHIoZKb3t0x8TmbyUxCSGb6eO12+2VK1eWef3gvn37tmzZ0u12DT4AUGABUNKP4jZxh8MTsiTLJrddP7XrjiTNkjCzt5F5nidJcv755x977LGljfy+++67/fbbDT0ASBRYAJT2s7hN3OHw3jNZNZ8aGrn3S/n0SFqpz/Q76OD0q1/8xV8sbeDdbvdLX/rS6OiosQcAiQILAIBDumvM6pNbrpncekOo1GZ6AmOMsdVqveY1rzn99NNLG/iePXuuvPJKAw8AHr0VEQEAAE8uVOrd6eGR+/+1O3kgVHpmevpVp9M56qijLrvsshDKu9T3y1/+sulXAPADCiwAyskeWHDoQlqpT26/aXzzt9NaTxJnfPnt1NTUSSedVObpV6Ojo3//939/cCMwACBRYAFQ2g/k9sCCQ71fzGrdqaHhO/+hOzUcstpMHy7G2Gg0Lrjggp6entJm/oUvfGHbtm0x+jEFAN+/IREBAABPKKRJmo1v/tbEw98O1cYs3D22Wq01a9a85S1vKW3k+/fv/+pXvzo9PW30AcAPKLAAAHhCIa10JvcP3/VPnemRtDrju1/FGGOMb37zm1evXl3azK+44op77rnH9CsAeCwFFgDl5JMhHJKQVsYf+sbkI9dntQUzvftVCOHg9Ks3vvGNpQ18YmLi29/+9vj4uLEHAI+lwAKgvB/MRQBP8SbJaq3hh/ff9NcxxpBVZuGIExMTb3vb21atWlXazK+//vobb7yx2+0afgDwWAosAEr6wdwkLDiUd8rQ7Z9r7rs/rfXO9Fsmy7KhoaFzzjnnJ37iJ9K0pPeorVbrS1/60v79+408APghCiwAAH5EzNNa/9SOm4fv/kLWWJDEfEaPFkJoNpvdbvc//+f/fMwxx5Q29RtvvPGGG26w+xUA/CgFFgAl/XRuCSE88fsjhlpv3hzbf9P/ylujs/NmGRkZOfvss1/xileEUNL35tTU1Oc+97mdO3cagADwoxRYAJSTJYTwxG+PkKbV3qE7/9/xzd9O0+rMHy40m80sy376p3/6+OOPL2fmeZ5/7Wtfu/rqqw0/AHhcCiwAAP6DUB+Y2nnH8J1/n+R5ks7G3u1TU1NnnXXWK1/5yizLypn5vn37PvOZz4yNjRl+APC4FFgAAPxATKuNvDW679o/bu7bkNZ6Z+GQ09PTS5Ys+Y3f+I1169aVM/Rut/ulL33p3nvvNf4A4IkosAAA+L6QJWlt7IGvTD5yQ1qtz8LuVzHGTqfzqle96vWvf31pHz748MMPf/azn52amjIAAeCJKLAAKCebuMOPCEla65/edtO+Gz7ZbY+HrD7jBwxhcnJy1apVv/iLv1ja9mpycvJTn/rU5s2bDUAAeBIKLADK+kndJu7wH8S02tsZ373nuj9t7r03rfbNwiE7nU4I4bWvfe0555xT2tyvuOKKL3/5y8YfADw5BRYAAEnI6kme77/5b8a3XJ31LJqdKYrj4+PPe97zfuM3fqO0sW/duvXDH/6wvdsB4CkpsAAooWgJIfwHIQ3VnpF7v3jg5r8JaTVJK7MwRbHdbi9cuPBXfuVXli9fXtrgP/KRj+zZs8cABICnpMACACi7rNoztf2mvdf9WexMp9W+JM7GAttWq/WLv/iLL3/5y0sb+2c+85mvfe1reZ4bgQDwlBRYAJRQsAcW/Pv7Ia20Rrfvufoj7dHtWWNhEme8TwkhTE1NnXHGGb/2a79WrVbLGfsNN9zwV3/1V61WywgEgEOhwAIAKK+QVmK3s+c7fzy59XtptXd2it12u71o0aLf//3fX7x4cTljn5yc/NM//dPdu3cbgQBwiBRYAJSQPbAgSZIY0mpaaez77p+N3v/ltFpPwiy9KYaHh9/ylre86EUvKmfu7Xb7z/7sz2644QaLBwHg0CmwACghSwghCWk1rfXsv/UzQ3f+fcgqSchm57gHDhx4yUte8nM/93NZlpUw9jzPP//5z19xxRXaKwA4LAosAIDSCSHNan0j93xx33f/Im9Ph7Q6KwcNY2NjS5cu/e3f/u3jjjuuhLHHGL/zne/8r//1vzZt2mQQAsBhUWABAJRMSNPawNjmb+/5zh91J/enlfpsHDOEZrOZpulv/MZvXHTRReUMfuPGjR/5yEe2bNliDALA4VJgAQCUSUjT+uDUztv2fPvDreEtaa1vNo4ZQrfbnZ6eftOb3vS2t72tnE8e3Lt370c/+tG7777bGASAp0GBBQBQFiGErD7Y2v/Arm+8d2rHbVl9YNYOPTIycuaZZ77vfe9buHBhCZMfHx//3d/93W9961sGIQA8PQosAMrJUwgpo1Draw8/vPNrvzmx7btpz6IkzNKt4Pj4+NKlS9/73vceddRRJYx9eHj4ve997ze+8Y3p6WmDEACenooIACgrTyGkXEKl0Rp6ZNfX3z3xyHVZz+KQpkmcjXdBu90eGBh43/ved+mll5Yw9pGRkd/7vd/76le/2mq1DEIAeNoUWACU9LO8CCjVeE+zemto884r3zOx9YassSiZrfYqz/MkSX7lV37lrW99awile9+Njo5+4AMf+OpXv2ruFQA8Q5YQAgDMayGktf7p/Rt2fO03J7fflNX6kzBL7VWSJNPT0y984Qv/23/7b5VK6f5309HR0Q996EP/+q//qr0CgGfODCwAgPkqJqGS1vqmtn1v11Xvn959V1rte/TXZ8XU1NTatWs/9KEP9ff3ly36/fv3v//977/iiiumpqYMRAB45hRYAADzUgxZNWT18Y3f2HP1h5v7N6S1WWqRQggxxrGxsXXr1n3sYx8744wzyhb9rl27fud3fudb3/qWfa8A4NmiwAIAmH9iWulN0mzk7n/ce80ft8d2pvWB2TnwwfZqaGjoxBNP/NjHPvbiF7+4bNFv3br1Pe95zzXXXNPpdAxEAHi2KLAAKOnHe/u4M4+l9YGk2zlw81/vvf7j+fToM2mvDhZSh/HWivHAgQPr1q37+Mc//tKXvrRsyW/evPn973//1VdffXD3egDg2aLAAgCYT2JaX9Cd3L/vux8/cOv/TpKQNgafyZbth9VehRCGhobWr1//8Y9//Md+7MfKFv23vvWtv/qrv/rud79rFALAs06BBUA5hVnbxxpmU1YfnN53/95rPzZ2/78kWS2t9SVx9qYCjYyMrF+//s///M/LtnJwdHT0//7f//u5z31u48aNBiEAzAQFFgAlFC0hZP6N6pBWQ6Uxvunbe6//2NSOW0O1L1Rqs9lejY+Pr1279uMf/3jZ2qtOp/PHf/zHX/jCF0ZHRw1EAJghCiwASiiYgcX8EtNab2y3DnzvU/tv+mRneiSt9iYhm832anJy8oQTTviTP/mTl7zkJSXKPcY777zz05/+9Je+9CVbtgPAjFJgAQDMXTEJWVrva+3ftO+7fzn2wL/GmKeV+ixXtNPT08cff/zHPvaxUu3a3m63v/KVr/z5n//5xo0bY1SIA8DMUmABAMxRIVTqSZqNP/iNvdf98dTue9JaX0hn++7u4NyrP/3TPy1Pe5Xn+Z49ez7/+c9/8pOfnJycNBABYBYosAAA5pwY0mrIap2JvUO3f+7AbZ/pTh7IGoOzubNbCCHP87GxsbVr1/7Zn/1Zefa9mp6evummm/78z//8pptusmwQAGaNAgsAYA6JSRLSal8SwvSOm/dc9xdjG67IGguyngWzuatbCCHGODw8fOKJJ5aqvdq2bdvf/d3ffeELX9i1a5exCACzSYEFQDkrAE8hZE4O3ZBWs8aC9viu0Xv++cBt/7u5f2Olb+mjg3q2HJx7tW/fvlNOOeXP//zPS7JycHR09K677vrkJz95ww03TE1NGYsAMMsUWACUkKcQMufEJMa01hey2thD3zxw299NPHRlzDtZY9Esj+QQQqvVGh4ePu+88z760Y++6EUvmvfRt9vtbdu2ffKTn7zxxhs3btxoLALAEaHAAqCUXYAZWMwtaTWrDXTHdx644/89cOtnOuO700pPWuud/faq2WzGGH/+53/+3e9+94knnjjvg5+env7c5z73xS9+8YEHHpienjYSAeBIUWABUEJmYDGHRmtIK715d3r47n88cOtnmnvujt1OVh9IQjbLYzhN08nJyb6+vne/+90///M/PzAwML+Dn56evvXWWz/96U9ff/31IyMjRiIAHFkKLACAYgqhUg8hTO28dd+Nn5zYdFUSQhLStNabJMnsN7AjIyOrVq36zd/8zbe+9a2Vyny+hxwZGdm1a9dnP/vZK664Yv/+/e1221gEgCNOgQVAOVlCSIGFNKRZkmatvRuG7/3C2IOXt0e2h2pPCOkR+XY6nU673X7hC1/427/92y960YvSNJ2fPxRi7HQ6d9xxxz//8z9fe+21W7Zs6XQ6BiMAFIQCC4CSNgSWEFLIgZmFrJrEbnt0x8g9Xxi771+aw5uTtJrW+md/xB582uD09HQI4Wd/9md/53d+Z9WqVfM1+MnJyTvvvPPyyy//5je/uWPHDrOuAKBoFFgAlJMZWBRqPMaQVUOlkSTd1tAjYxu/PnTH/9sZ3hKTJK31f3/Ezrbp6elWq3XMMcf81//6X3/pl36pVqvNy+wnJyfvvvvur3zlK1ddddWmTZsMRgAoJgUWAOVkBhbFEGPIammtL8ZOe2jL2MYrhu/6x+ndd6eVRqj0hnDEBur4+HiM8ZJLLnnPe97z3Oc+d/4F3263W63W1Vdffc0111xzzTWqKwAoOAUWACWtDczA4ogPwpBW0/pAbE9P77l7YvN3Ru/94tSuO2PMs57F3x+lR6a9GhkZOeqoo375l3/5Z37mZ5YtWzbPcp+cnBwaGrrqqqtuueWW66+/ftu2bcYiABSfAgsAYDbFJKQhrWS1gW5zZHzTVRMPXz3+0DdbBzbnncmsvjDJqknMj8h3FkLodrtDQ0Pnn3/++9///pe97GXzLPqhoaENGzZ885vfvO222+6///6RkRHbtAPAXKHAAqCcLCFk1j260VVPDDGf3D9y1z+Obf5Wc8+97bEdSZ6HrJr1Lk1iPCLtVZqmnU5nYmKiXq+/5S1veec733nyySfPp+z37Nlz/fXXf+lLX3rggQf27t07OTlpPALA3KLAAgCYaTFktVDti82R6Z23jj989djGbzT3PxTbEyGrhKweqlmShCQesVJ1fHw8SZK1a9f+6q/+6hvf+MaBgYF5EHqz2Txw4MDtt9/+3e9+9zvf+c7+/fv3799vLALAHKXAAqCkhYI9sJgNIYRQSauN1vju6Y3/Nv7Q10c3Xhk7zSRJkpCmtd7HjMMj017FGCcmJlatWvXWt771zW9+8+rVq9M0ndOR53m+adOmrVu33nnnnZdffvnevXuHhoZarZbBCABzmgILgJL2CpYQMlNDK4QQQpKEGJIkxtbQ5tENV0w+cl1z912d5lha7QtpJQlHviTK87zdbscYX/KSl3zgAx84++yz52511el08jw/uE7whhtueOCBB7Zu3To6OnrwL2hQAsA8oMACAHiGYpKEkFaSkIU0xJh3p0Y7k3um99w9vuHKqV13dif3xryTVhpZ/cgvzQshdDqddrtdrVbPPvvsX/7lX375y1/e398/F3Nvt9v79u2bmpq65ZZbbr311quvvnr//v1jY2NGJADMPwosAICnJcYkSUJWDZV6SEKM3e70cHP/xube+ya23Ti19cbOxJ4krYYQQloLWeOIT/oLIeR5PjEx0el0li1b9vM///O/8iu/snTp0rmSd57neZ6HEMbGxrZt27Z79+4NGzZ8/etfHxoaevDBB41HAJjfFFgAAIfl4HyralrrSdJa3p7oTu5vHtg8ueOW6R03Te+5t3VgU5KEtN6f1vqSJHx/veqRbK9CCEmSjI2NtVqt5cuX//iP//hrXvOaV77ylcXPut1uT05OdjqdycnJTZs23XPPPdPT0w8//PCGDRv27t27Y8cOwxEASkKBBQDwJA4WTyEJIUlCyKpppRHSandqqLn3gebww9N77p3a9r3W/g3t8d15azyt9WWNhUmaPuaRgke4uooxNpvNkZGRFStWXHrppZdddtnFF1/caDQKm3in0zlw4MDevXsnJyc3b958++2379q1a3R0dMeOHQe3Y5+amjIuAaBsFFgAAI8VH22c0jSELAlZkmYhJElIY0y6o9vH99w3vefOzsiO6X33tfZvzLvTsdNKQkgrPZX+5Uk8+ApHfuPwg9XV1NTU9PT0ggUL3va2t73+9a9/wQteUMzqqtVq7dix49577x0bG9u0adOWLVs2btw4OTm5a9euH2w2b2gCQJkpsAAop5gkQQr8+3iISZIkIU2TtBayakirMe/E9lTsTHSb463hh5u7757YcVNnbGd3Yl97fGcSkySkIYQQKmmjJwkhiUlSmJIlTdOJiYlWq7VgwYLLLrvszW9+8/nnn9/b23ukvp88zw8+KLDT6SRJ0u12x8bGDhw48Mgjj9xzzz179+7dvn37/v379+zZ0263h4aGjEgA4IcosAAop3DEd9SmICMhpFmSVkNWC1kltic6kwe6k/s643taI4+09j/UPLChNbQ5tqfyznTemUxiEtJKWmkkSUhC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";
		}
	}});

	BDFDB.ModuleUtils.patch(BDFDB, LibraryModules.IconUtils, "getGuildBannerURL", {instead: e => {
		return e.methodArguments[0].id == "410787888507256842" ? e.methodArguments[0].banner : e.callOriginalMethod();
	}});
	
	for (let type of ComponentTypeData.NormalContextMenus) InternalBDFDB.patchContextMenuLib(InternalComponents.LibraryComponents.ContextMenus[type], false);
	for (let type of ComponentTypeData.FluxContextMenus) {
		if (!BDFDB.InternalData.componentPatchQueries[type]) BDFDB.InternalData.componentPatchQueries[type] = {query:[], module:null};
		InternalBDFDB.patchContextMenuLib(InternalComponents.LibraryComponents.ContextMenus[type], true);
	}
	for (let type of ComponentTypeData.QueuedComponents) if (!BDFDB.InternalData.componentPatchQueries[type]) BDFDB.InternalData.componentPatchQueries[type] = {query:[], module:null};
	if (ComponentTypeData.NonRenderContextMenus.length) BDFDB.ModuleUtils.patch(BDFDB, LibraryModules.ContextMenuUtils, "openContextMenu", {before: e => {
		let menu = e.methodArguments[1]();
		if (BDFDB.ObjectUtils.is(menu)) {
			let type = InternalBDFDB.getContextMenuType(menu.type && menu.type.displayName || menu.props && menu.props.type, menu);
			if (type && ComponentTypeData.NonRenderContextMenus.includes(type)) InternalBDFDB.patchExportedContextMenuLib(menu, type, false);
		}
	}});
	if (ComponentTypeData.ObservedContextMenus.length) BDFDB.ObserverUtils.connect(BDFDB, BDFDB.dotCN.appmount +  " > " + BDFDB.dotCN.itemlayercontainer, {name:"contextMenuObserver", instance:(new MutationObserver(changes => {changes.forEach(change => {change.addedNodes.forEach(node => {
		let menu = node && node.nodeType != Node.TEXT_NODE && (BDFDB.ReactUtils.getInstance(node.querySelector(BDFDB.dotCN.contextmenu)) || {}).return;
		if (BDFDB.ObjectUtils.is(menu)) {
			let type = InternalBDFDB.getContextMenuType(menu.type && menu.type.displayName || menu.props && menu.props.type, menu);
			if (type && ComponentTypeData.ObservedContextMenus.includes(type)) InternalBDFDB.patchExportedContextMenuLib(menu, type, true);
		}
	});});}))}, {childList: true});
	BDFDB.ModuleUtils.patch(BDFDB, BDFDB.ReactUtils.getValue(BDFDB.ModuleUtils.findByString("renderReactions", "canAddNewReactions", "showMoreUtilities", false), "exports.default"), "type", {after: e => {
		if (document.querySelector(BDFDB.dotCN.emojipicker)) return; // avoid multi react EmojiPicker rerender
		let toolbar = BDFDB.ReactUtils.findChild(e.returnValue, {filter: c => c && c.props && c.props.showMoreUtilities != undefined && c.props.showEmojiPicker != undefined && c.props.setPopout != undefined});
		if (toolbar) BDFDB.ModuleUtils.patch(BDFDB, toolbar, "type", {after: e2 => {
			let menu = BDFDB.ReactUtils.findChild(e2.returnValue, {filter: c => c && c.props && typeof c.props.onRequestClose == "function" && c.props.onRequestClose.toString().indexOf("moreUtilities") > -1});
			InternalBDFDB.executeExtraPatchedPatches("MessageOptionToolbar", {instance:{props:Object.assign({}, e2.methodArguments[0], {hasMorePopout: !!menu})}, returnvalue:e2.returnValue, methodname:"default"});
			if (menu && typeof menu.props.renderPopout == "function") {
				let renderPopout = menu.props.renderPopout;
				menu.props.renderPopout = (...args) => {
					let renderedPopout = renderPopout(...args);
					BDFDB.ModuleUtils.patch(BDFDB, renderedPopout, "type", {after: e3 => {
						InternalBDFDB.executeExtraPatchedPatches("MessageOptionContextMenu", {instance:{props:e3.methodArguments[0]}, returnvalue:e3.returnValue, methodname:"default"});
					}}, {noCache: true});
					return renderedPopout;
				}
			}
		}}, {once: true});
	}});

	BDFDB.ModuleUtils.forceAllUpdates(BDFDB);
	
	InternalBDFDB.addContextListeners(BDFDB);

	if (BDFDB.UserUtils.me.id == "278543574059057154") {
		let cachedGuilds = {};
		InternalBDFDB.cacheGuilds = function () {
			cachedGuilds = Object.assign(cachedGuilds, {
				"86004744966914048": {
					default_message_notifications: 1,
					icon: "292e7f6bfff2b71dfd13e508a859aedd",
					id: "86004744966914048",
					joined_at: Date.now(),
					name: "BetterDiscord",
					owner_id: "81388395867156480"
				},
				"280806472928198656": {
					default_message_notifications: 1,
					icon: "cbdda04c041699d80689b99c4e5e89dc",
					id: "280806472928198656",
					joined_at: Date.now(),
					name: "BetterDiscord2",
					owner_id: "81388395867156480"
				}
			}, BDFDB.ObjectUtils.map(BDFDB.LibraryModules.GuildStore.getGuilds(), guild => {
				return {
					default_message_notifications: guild.defaultMessageNotifications,
					icon: guild.icon,
					id: guild.id,
					joined_at: guild.joinedAt,
					name: guild.name,
					owner_id: guild.ownerId
				};
			}));
		};
		InternalBDFDB.guildStoreChanged = function () {
			InternalBDFDB.cacheGuilds();
			BDFDB.LibraryModules.DispatchApiUtils.wait(_ => {
				for (let guildId of BDFDB.LibraryModules.GuildUnavailableStore.unavailableGuilds) if (cachedGuilds[guildId] && !BDFDB.LibraryModules.GuildStore.getGuild(guildId)) {
					BDFDB.LibraryModules.DispatchApiUtils.dispatch({
						type: "GUILD_CREATE",
						guild: Object.assign({
							channels: [],
							icon: null,
							members: [],
							presences: [],
							roles: {},
							unavailable: true
						}, cachedGuilds[guildId])
					});
					BDFDB.LibraryModules.DispatchApiUtils.dispatch({
						type: "GUILD_UNAVAILABLE",
						guildId: guildId
					});
				}
			});
		};
		BDFDB.ListenerUtils.add(BDFDB, BDFDB.LibraryModules.GuildStore, InternalBDFDB.guildStoreChanged);
		InternalBDFDB.guildStoreChanged();
	
		for (let module in DiscordClassModules) if (!DiscordClassModules[module]) BDFDB.LogUtils.warn(module + " not initialized in DiscordClassModules");
		for (let obj in DiscordObjects) if (!DiscordObjects[obj]) BDFDB.LogUtils.warn(obj + " not initialized in DiscordObjects");
		for (let require in LibraryRequires) if (!LibraryRequires[require]) BDFDB.LogUtils.warn(require + " not initialized in LibraryRequires");
		for (let module in LibraryModules) if (!LibraryModules[module]) BDFDB.LogUtils.warn(module + " not initialized in LibraryModules");
		for (let component in InternalComponents.NativeSubComponents) if (!InternalComponents.NativeSubComponents[component]) BDFDB.LogUtils.warn(component + " not initialized in NativeSubComponents");
		for (let component in InternalComponents.LibraryComponents) if (!InternalComponents.LibraryComponents[component]) BDFDB.LogUtils.warn(component + " not initialized in LibraryComponents");

		BDFDB.ModuleUtils.DevFuncs = {};
		BDFDB.ModuleUtils.DevFuncs.generateClassId = function (index) {
			let chars = "0123456789ABCDEFGHIJKMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split("");
			let id = "";
			while (id.length < 6) id += chars[Math.floor(Math.random() * chars.length)];
			return id;
		};
		BDFDB.ModuleUtils.DevFuncs.findByIndex = function (index) {
			return BDFDB.ModuleUtils.DevFuncs.req.c[index];
		};
		BDFDB.ModuleUtils.DevFuncs.findPropAny = function (...strings) {
			window.t = {"$filter":(prop => [...strings].flat(10).filter(n => typeof n == "string").every(string => prop.toLowerCase().indexOf(string.toLowerCase()) > -1))};
			for (let i in BDFDB.ModuleUtils.DevFuncs.req.c) if (BDFDB.ModuleUtils.DevFuncs.req.c.hasOwnProperty(i)) {
				let m = BDFDB.ModuleUtils.DevFuncs.req.c[i].exports;
				if (m && typeof m == "object") for (let j in m) if (window.t.$filter(j)) window.t[j + "_" + i] = m;
				if (m && typeof m == "object" && typeof m.default == "object") for (let j in m.default) if (window.t.$filter(j)) window.t[j + "_default_" + i] = m.default;
			}
			console.clear();
			console.log(window.t);
		};
		BDFDB.ModuleUtils.DevFuncs.findPropFunc = function (...strings) {
			window.t = {"$filter":(prop => [...strings].flat(10).filter(n => typeof n == "string").every(string => prop.toLowerCase().indexOf(string.toLowerCase()) > -1))};
			for (let i in BDFDB.ModuleUtils.DevFuncs.req.c) if (BDFDB.ModuleUtils.DevFuncs.req.c.hasOwnProperty(i)) {
				let m = BDFDB.ModuleUtils.DevFuncs.req.c[i].exports;
				if (m && typeof m == "object") for (let j in m) if (window.t.$filter(j) && typeof m[j] != "string") window.t[j + "_" + i] = m;
				if (m && typeof m == "object" && typeof m.default == "object") for (let j in m.default) if (window.t.$filter(j) && typeof m.default[j] != "string") window.t[j + "_default_" + i] = m.default;
			}
			console.clear();
			console.log(window.t);
		};
		BDFDB.ModuleUtils.DevFuncs.findPropStringLib = function (...strings) {
			window.t = {"$filter":(prop => [...strings].flat(10).filter(n => typeof n == "string").every(string => prop.toLowerCase().indexOf(string.toLowerCase()) > -1))};
			for (let i in BDFDB.ModuleUtils.DevFuncs.req.c) if (BDFDB.ModuleUtils.DevFuncs.req.c.hasOwnProperty(i)) {
				let m = BDFDB.ModuleUtils.DevFuncs.req.c[i].exports;
				if (m && typeof m == "object") for (let j in m) if (window.t.$filter(j) && typeof m[j] == "string" && /^[A-z0-9]+\-[A-z0-9_-]{6}$/.test(m[j])) window.t[j + "_" + i] = m;
				if (m && typeof m == "object" && typeof m.default == "object") for (let j in m.default) if (window.t.$filter(j) && typeof m.default[j] == "string" && /^[A-z0-9]+\-[A-z0-9_-]{6}$/.test(m.default[j])) window.t[j + "_default_" + i] = m.default;
			}
			console.clear();
			console.log(window.t);
		};
		BDFDB.ModuleUtils.DevFuncs.findNameAny = function (...strings) {
			window.t = {"$filter":(modu => [...strings].flat(10).filter(n => typeof n == "string").some(string => typeof modu.displayName == "string" && modu.displayName.toLowerCase().indexOf(string.toLowerCase()) > -1 || modu.name == "string" && modu.name.toLowerCase().indexOf(string.toLowerCase()) > -1))};
			for (let i in BDFDB.ModuleUtils.DevFuncs.req.c) if (BDFDB.ModuleUtils.DevFuncs.req.c.hasOwnProperty(i)) {
				let m = BDFDB.ModuleUtils.DevFuncs.req.c[i].exports;
				if (m && (typeof m == "object" || typeof m == "function") && window.t.$filter(m)) window.t[(m.displayName || m.name) + "_" + i] = m;
				if (m && (typeof m == "object" || typeof m == "function") && m.default && (typeof m.default == "object" || typeof m.default == "function") && window.t.$filter(m.default)) window.t[(m.default.displayName || m.default.name) + "_" + i] = m.default;
			}
			console.clear();
			console.log(window.t);
		};
		BDFDB.ModuleUtils.DevFuncs.findCodeAny = function (...strings) {
			window.t = {"$filter":(m => [...strings].flat(10).filter(n => typeof n == "string").map(string => string.toLowerCase()).every(string => typeof m == "function" && (m.toString().toLowerCase().indexOf(string) > -1 || typeof m.__originalMethod == "function" && m.__originalMethod.toString().toLowerCase().indexOf(string) > -1 || typeof m.__originalFunction == "function" && m.__originalFunction.toString().toLowerCase().indexOf(string) > -1) || BDFDB.ObjectUtils.is(m) && typeof m.type == "function" && m.type.toString().toLowerCase().indexOf(string) > -1))};
			for (let i in BDFDB.ModuleUtils.DevFuncs.req.c) if (BDFDB.ModuleUtils.DevFuncs.req.c.hasOwnProperty(i)) {
				let m = BDFDB.ModuleUtils.DevFuncs.req.c[i].exports;
				if (m && typeof m == "function" && window.t.$filter(m)) window.t["module_" + i] = {string:m.toString(), func:m};
				if (m && m.__esModule) {
					for (let j in m) if (m[j] && typeof m[j] == "function" && window.t.$filter(m[j])) window.t[j + "_module_" + i] = {string:m[j].toString(), func:m[j], module:m};
					if (m.default && (typeof m.default == "object" || typeof m.default == "function")) for (let j in m.default) if (m.default[j] && typeof m.default[j] == "function" && window.t.$filter(m.default[j])) window.t[j + "_module_" + i + "_default"] = {string:m.default[j].toString(), func:m.default[j], module:m};
				}
			}
			for (let i in BDFDB.ModuleUtils.DevFuncs.req.m) if (typeof BDFDB.ModuleUtils.DevFuncs.req.m[i] == "function" && window.t.$filter(BDFDB.ModuleUtils.DevFuncs.req.m[i])) window.t["funtion_" + i] = {string:BDFDB.ModuleUtils.DevFuncs.req.m[i].toString(), func:BDFDB.ModuleUtils.DevFuncs.req.m[i]};
			console.clear();
			console.log(window.t);
		};
		BDFDB.ModuleUtils.DevFuncs.getAllModules = function () {
			window.t = {};
			for (let i in BDFDB.ModuleUtils.DevFuncs.req.c) if (BDFDB.ModuleUtils.DevFuncs.req.c.hasOwnProperty(i)) {
				let m = BDFDB.ModuleUtils.DevFuncs.req.c[i].exports;
				if (m && typeof m == "object") window.t[i] = m;
			}
			console.clear();
			console.log(window.t);
		};
		BDFDB.ModuleUtils.DevFuncs.getAllStringLibs = function () {
			window.t = [];
			for (let i in BDFDB.ModuleUtils.DevFuncs.req.c) if (BDFDB.ModuleUtils.DevFuncs.req.c.hasOwnProperty(i)) {
				let m = BDFDB.ModuleUtils.DevFuncs.req.c[i].exports;
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
	for (let component in InternalComponents.NativeSubComponents) if (!InternalComponents.NativeSubComponents[component]) InternalComponents.NativeSubComponents[component] = "div";
	for (let component in InternalComponents.LibraryComponents) if (!InternalComponents.LibraryComponents[component]) {
		InternalComponents.LibraryComponents[component] = "div";
		BDFDB.LibraryComponents[component] = "div";
	}

	BDFDB.loaded = true;
	window.BDFDB = BDFDB;
	InternalBDFDB.reloadLib = _ => {
		let libraryScript = document.querySelector("head script#BDFDBLibraryScript");
		if (libraryScript) libraryScript.remove();
		libraryScript = document.createElement("script");
		libraryScript.setAttribute("id", "BDFDBLibraryScript");
		libraryScript.setAttribute("type", "text/javascript");
		libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
		libraryScript.setAttribute("date", performance.now());
		document.head.appendChild(libraryScript);
	};
	let libKeys = Object.keys(BDFDB).length - 10, crashInterval = BDFDB.TimeUtils.interval(_ => {
		if (!window.BDFDB || typeof BDFDB != "object" || Object.keys(BDFDB).length < libKeys || !BDFDB.InternalData.loadId) {
			BDFDB.LogUtils.warn("Reloading library due to internal error.");
			BDFDB.TimeUtils.clear(crashInterval);
			InternalBDFDB.reloadLib();
		}
		else if (BDFDB.InternalData.loadId != loadId) {
			BDFDB.TimeUtils.clear(crashInterval);
		}
		else if (!BDFDB.InternalData.creationTime || performance.now() - BDFDB.InternalData.creationTime > 18000000) {
			BDFDB.TimeUtils.clear(crashInterval);
			InternalBDFDB.reloadLib();
		}
	}, 10000);
})();
