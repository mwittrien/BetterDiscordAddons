//META{"name":"BDFDB","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/0BDFDB.plugin.js"}*//

var BDFDB = (_ => {
	const myId = "278543574059057154", myGuildId = "410787888507256842";
	
	if (window.BDFDB && window.BDFDB.PluginUtils && typeof window.BDFDB.PluginUtils.cleanUp == "function") window.BDFDB.PluginUtils.cleanUp(window.BDFDB);
	
	const BDFDB = {
		name: "BDFDB",
		patchPriority: 0,
		started: true
	};
	const InternalBDFDB = Object.assign({}, BDFDB);
	
	const Plugin = function(config) {
		return class Plugin {
			getName() {return config.name;}
			getAuthor() {return config.author;}
			getVersion() {return config.version;}
			getDescription() {return config.description;}
			load() {
				Object.assign(this, BDFDB.ObjectUtils.extract(config, "name", "author", "version", "description"));
				BDFDB.PluginUtils.load(this, config);
				if (typeof this.onLoad == "function") this.onLoad();
			}
			start() {
				if (this.started) return;
				
				BDFDB.PluginUtils.init(this, config);
				if (typeof this.onStart == "function") this.onStart();
				
				this.started = true;
				delete this.stopping;
			}
			stop() {
				if (this.stopping) return;
				this.stopping = true;
				BDFDB.TimeUtils.timeout(_ => {delete this.stopping;});
				
				if (typeof this.onStop == "function") this.onStop();
				BDFDB.PluginUtils.clear(this, config);

				delete this.started;
			}
		};
	};
	
	const updateTimeouts = [], plugins = [];
	BDFDB.PluginUtils = {};
	BDFDB.PluginUtils.buildPlugin = function (config) {
		return [Plugin(config), Object.assign({}, BDFDB)];
	};
	BDFDB.PluginUtils.load = function (plugin, config) {		
		if (!updateTimeouts.includes(config.name)) {
			updateTimeouts.push(config.name);
			let url = ["ImageZoom", "ImageGallery", "ReverseImageSearch", "ShowImageDetails"].includes(config.name) ? "https://mwittrien.github.io/BetterDiscordAddons/Plugins/ImageUtilities/ImageUtilities.plugin.js" : ["BetterFriendCount"].includes(config.name) ? "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BetterFriendList/BetterFriendList.plugin.js" : (config.rawUrl ||`https://mwittrien.github.io/BetterDiscordAddons/Plugins/${config.name}/${config.name}.plugin.js`);
			BDFDB.PluginUtils.checkUpdate(config.name, url);

			if (!window.PluginUpdates || typeof window.PluginUpdates !== "object") window.PluginUpdates = {plugins: {} };
			window.PluginUpdates.plugins[url] = {name: config.name, raw: url, version: config.version};
			if (typeof window.PluginUpdates.interval === "undefined") window.PluginUpdates.interval = BDFDB.TimeUtils.interval(_ => {
				BDFDB.PluginUtils.checkAllUpdates();
			}, 1000*60*60*2);
			BDFDB.TimeUtils.timeout(_ => {BDFDB.ArrayUtils.remove(updateTimeouts, config.name, true);}, 30000);
		}
	};
	BDFDB.PluginUtils.init = BDFDB.loadMessage = function (plugin, config) {
		BDFDB.PluginUtils.load(plugin, config);
		if (!plugins.includes(plugin)) plugins.push(plugin);
		
		let startMsg = BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_started", "v" + config.version);
		BDFDB.LogUtils.log(startMsg, config.name);
		if (settings.showToasts && !BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.showToasts)) BDFDB.NotificationUtils.toast(`${config.name} ${startMsg}`, {nopointer: true});

		if (typeof plugin.initConstructor === "function") BDFDB.TimeUtils.suppress(plugin.initConstructor.bind(plugin), "Could not initiate constructor!", config.name)();
		if (typeof plugin.css === "string") BDFDB.DOMUtils.appendLocalStyle(config.name, plugin.css);

		InternalBDFDB.patchPlugin(plugin);
		InternalBDFDB.addSpecialListeners(plugin);

		BDFDB.PluginUtils.translate(plugin);

		BDFDB.PluginUtils.checkChangeLog(plugin);
	};
	BDFDB.PluginUtils.clear = BDFDB.unloadMessage = function (plugin, config) {
		InternalBDFDB.clearStartTimeout(plugin);

		let stopMsg = BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_stopped", "v" + config.version);
		BDFDB.LogUtils.log(stopMsg, config.name);
		if (settings.showToasts && !BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.showToasts)) BDFDB.NotificationUtils.toast(`${config.name} ${stopMsg}`, {nopointer: true});

		let url = ["ImageZoom", "ImageGallery", "ReverseImageSearch", "ShowImageDetails"].includes(config.name) ? "https://mwittrien.github.io/BetterDiscordAddons/Plugins/ImageUtilities/ImageUtilities.plugin.js" : ["BetterFriendCount"].includes(config.name) ? "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BetterFriendList/BetterFriendList.plugin.js" : (config.rawUrl ||`https://mwittrien.github.io/BetterDiscordAddons/Plugins/${config.name}/${config.name}.plugin.js`);

		if (typeof plugin.css === "string") BDFDB.DOMUtils.removeLocalStyle(plugin.name);

		BDFDB.PluginUtils.cleanUp(plugin);
		
		for (let type in BDFDB.InternalData.componentPatchQueries) BDFDB.ArrayUtils.remove(BDFDB.InternalData.componentPatchQueries[type].query, plugin, true);
		
		for (let modal of document.querySelectorAll(`.${config.name}-modal, .${config.name.toLowerCase()}-modal, .${config.name}-settingsmodal, .${plugin.name.toLowerCase()}-settingsmodal`)) {
			let closeButton = modal.querySelector(BDFDB.dotCN.modalclose);
			if (closeButton) closeButton.click();
		}
		
		delete BDFDB.DataUtils.cached[config.name]
		delete window.PluginUpdates.plugins[url];
	};
	BDFDB.PluginUtils.translate = function (plugin) {
		plugin.labels = {};
		if (typeof plugin.setLabelsByLanguage === "function" || typeof plugin.changeLanguageStrings === "function") {
			if (LibraryModules.LanguageStore.chosenLocale) translate();
			else BDFDB.TimeUtils.interval(interval => {
				if (LibraryModules.LanguageStore.chosenLocale) {
					BDFDB.TimeUtils.clear(interval);
					translate();
				}
			}, 100);
			function translate() {
				let language = BDFDB.LanguageUtils.getLanguage();
				if (typeof plugin.setLabelsByLanguage === "function") plugin.labels = plugin.setLabelsByLanguage(language.id);
				if (typeof plugin.changeLanguageStrings === "function") plugin.changeLanguageStrings();
				BDFDB.LogUtils.log(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_translated", language.ownlang), plugin.name);
			}
		}
	};
	BDFDB.PluginUtils.cleanUp = function (plugin) {
		return;
		if (!BDFDB.ObjectUtils.is(plugin)) return;
		if (plugin.name == "BDFDB") {
			plugin = BDFDB;
		}
		BDFDB.ListenerUtils.remove(plugin);
		BDFDB.StoreChangeUtils.remove(plugin);
		BDFDB.ObserverUtils.disconnect(plugin);
		BDFDB.ModuleUtils.unpatch(plugin);
		BDFDB.WindowUtils.closeAll(plugin);
		BDFDB.WindowUtils.removeListener(plugin);
	};
	BDFDB.PluginUtils.checkUpdate = function (pluginName, url) {
		if (pluginName && url) return new Promise(callback => {
			LibraryRequires.request(url, (error, response, body) => {
				if (error) return callback(null);
				let newName = (body.match(/"name"\s*:\s*"([^"]+)"/) || [])[1] || pluginName;
				let newVersion = body.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i);
				if (!newVersion) return callback(null);
				if (pluginName == newName && BDFDB.NumberUtils.getVersionDifference(newVersion[0], window.PluginUpdates.plugins[url].version) > 0.2) {
					BDFDB.NotificationUtils.toast(`${pluginName} will be force updated, because your version is heavily outdated.`, {
						type: "warn",
						nopointer: true
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
			updateNotice = BDFDB.NotificationUtils.notice(`${BDFDB.LanguageUtils.LibraryStrings.update_notice_update}&nbsp;&nbsp;&nbsp;&nbsp;<strong id="outdatedPlugins"></strong>`, {html:true, id:"pluginNotice", type:"info", btn:!BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.automaticLoading) ? BDFDB.LanguageUtils.LanguageStrings.ERRORS_RELOAD : "", customicon:`<svg height="100%" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="100%" version="1.1" viewBox="0 0 2000 2000"><metadata /><defs><filter id="shadow1"><feDropShadow dx="20" dy="0" stdDeviation="20" flood-color="rgba(0,0,0,0.35)"/></filter><filter id="shadow2"><feDropShadow dx="15" dy="0" stdDeviation="20" flood-color="rgba(255,255,255,0.15)"/></filter><filter id="shadow3"><feDropShadow dx="10" dy="0" stdDeviation="20" flood-color="rgba(0,0,0,0.35)"/></filter></defs><g><path style="filter: url(#shadow3)" d="M1195.44+135.442L1195.44+135.442L997.6+136.442C1024.2+149.742+1170.34+163.542+1193.64+179.742C1264.34+228.842+1319.74+291.242+1358.24+365.042C1398.14+441.642+1419.74+530.642+1422.54+629.642L1422.54+630.842L1422.54+632.042C1422.54+773.142+1422.54+1228.14+1422.54+1369.14L1422.54+1370.34L1422.54+1371.54C1419.84+1470.54+1398.24+1559.54+1358.24+1636.14C1319.74+1709.94+1264.44+1772.34+1193.64+1821.44C1171.04+1837.14+1025.7+1850.54+1000+1863.54L1193.54+1864.54C1539.74+1866.44+1864.54+1693.34+1864.54+1296.64L1864.54+716.942C1866.44+312.442+1541.64+135.442+1195.44+135.442Z" fill="#171717" opacity="1"/><path style="filter: url(#shadow2)" d="M1695.54+631.442C1685.84+278.042+1409.34+135.442+1052.94+135.442L361.74+136.442L803.74+490.442L1060.74+490.442C1335.24+490.442+1335.24+835.342+1060.74+835.342L1060.74+1164.84C1150.22+1164.84+1210.53+1201.48+1241.68+1250.87C1306.07+1353+1245.76+1509.64+1060.74+1509.64L361.74+1863.54L1052.94+1864.54C1409.24+1864.54+1685.74+1721.94+1695.54+1368.54C1695.54+1205.94+1651.04+1084.44+1572.64+999.942C1651.04+915.542+1695.54+794.042+1695.54+631.442Z" fill="#3E82E5" opacity="1"/><path style="filter: url(#shadow1)" d="M1469.25+631.442C1459.55+278.042+1183.05+135.442+826.65+135.442L135.45+135.442L135.45+1004C135.45+1004+135.427+1255.21+355.626+1255.21C575.825+1255.21+575.848+1004+575.848+1004L577.45+490.442L834.45+490.442C1108.95+490.442+1108.95+835.342+834.45+835.342L664.65+835.342L664.65+1164.84L834.45+1164.84C923.932+1164.84+984.244+1201.48+1015.39+1250.87C1079.78+1353+1019.47+1509.64+834.45+1509.64L135.45+1509.64L135.45+1864.54L826.65+1864.54C1182.95+1864.54+1459.45+1721.94+1469.25+1368.54C1469.25+1205.94+1424.75+1084.44+1346.35+999.942C1424.75+915.542+1469.25+794.042+1469.25+631.442Z" fill="#FFFFFF" opacity="1"/></g></svg>`});
			updateNotice.style.setProperty("z-index", "100000", "important");
			updateNotice.style.setProperty("display", "block", "important");
			updateNotice.style.setProperty("visibility", "visible", "important");
			updateNotice.style.setProperty("opacity", "1", "important");
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
				updateEntry.addEventListener("click", _ => {
					if (!updateEntry.wasClicked) {
						updateEntry.wasClicked = true;
						BDFDB.PluginUtils.downloadUpdate(pluginName, url);
					}
				});
				updateNoticeList.appendChild(updateEntry);
				if (!updateNoticeList.hasTooltip) {
					updateNoticeList.hasTooltip = true;
					updateNotice.tooltip = BDFDB.TooltipUtils.create(updateNoticeList, BDFDB.LanguageUtils.LibraryStrings.update_notice_click, {
						type: "bottom",
						unhideable: true,
						zIndex: 100001,
						delay: 500,
						onHide: _ => {updateNoticeList.hasTooltip = false;}
					});
				}
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
					updateNotice.querySelector(".notice-message").innerText = BDFDB.LanguageUtils.LibraryStrings.update_notice_reload;
					BDFDB.DOMUtils.toggle(reloadButton, false);
				}
				else updateNotice.querySelector(BDFDB.dotCN.noticedismiss).click();
			}
		}
	};
	BDFDB.PluginUtils.downloadUpdate = function (pluginName, url) {
		if (pluginName && url) LibraryRequires.request(url, (error, response, body) => {
			if (error) {
				let updateNotice = document.querySelector("#pluginNotice");
				if (updateNotice) BDFDB.PluginUtils.removeUpdateNotice(pluginName, updateNotice);
				BDFDB.LogUtils.warn("Unable to get update for " + pluginName);
			}
			else {
				BDFDB.InternalData.creationTime = 0;
				let wasEnabled = BDFDB.BDUtils.isPluginEnabled(pluginName);
				let newName = (body.match(/"name"\s*:\s*"([^"]+)"/) || [])[1] || pluginName;
				let newVersion = body.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i).toString().replace(/['"]/g, "");
				let oldVersion = window.PluginUpdates.plugins[url].version;
				LibraryRequires.fs.writeFile(LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), newName + ".plugin.js"), body, _ => {
					if (pluginName != newName) {
						url = url.replace(new RegExp(pluginName, "g"), newName);
						LibraryRequires.fs.unlink(LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), pluginName + ".plugin.js"), _ => {});
						let configPath = LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), pluginName + ".config.json");
						LibraryRequires.fs.exists(configPath, exists => {
							if (exists) LibraryRequires.fs.rename(configPath, LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), newName + ".config.json"), _ => {});
						});
						BDFDB.TimeUtils.timeout(_ => {if (wasEnabled && !BDFDB.BDUtils.isPluginEnabled(newName)) BDFDB.BDUtils.enablePlugin(newName);}, 3000);
					}
					BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_updated", pluginName, "v" + oldVersion, newName, "v" + newVersion), {nopointer:true, selector:"plugin-updated-toast"});
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
		let app = document.querySelector(BDFDB.dotCN.app);
		if (!app) return;
		BDFDB.DOMUtils.addClass(icon, BDFDB.disCN.loadingicon);
		let loadingIconWrapper = document.querySelector(BDFDB.dotCN.app + ">" + BDFDB.dotCN.loadingiconwrapper)
		if (!loadingIconWrapper) {
			loadingIconWrapper = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN.loadingiconwrapper}"></div>`);
			app.appendChild(loadingIconWrapper);
			let killObserver = new MutationObserver(changes => {if (!loadingIconWrapper.firstElementChild) BDFDB.DOMUtils.remove(loadingIconWrapper);});
			killObserver.observe(loadingIconWrapper, {childList:true});
		}
		loadingIconWrapper.appendChild(icon);
	};
	BDFDB.PluginUtils.createSettingsPanel = function (plugin, children) {
		if (!BDFDB.ObjectUtils.is(plugin) || !children || (!BDFDB.ReactUtils.isValidElement(children) && !BDFDB.ArrayUtils.is(children))) return;
		let settingsPanel = BDFDB.DOMUtils.create(`<div class="${plugin.name}-settings ${BDFDB.disCN.settingsPanel}"></div>`);
		BDFDB.ReactUtils.render(BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SettingsPanel, {
			key: `${plugin.name}-settingsPanel`,
			plugin: plugin,
			title: plugin.name,
			controls: [
				plugin.changelog && BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Clickable, {
					className: BDFDB.disCN.settingspanelheaderbutton,
					children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.TooltipContainer, {
						text: BDFDB.LanguageUtils.LanguageStrings.CHANGE_LOG,
						children: BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SvgIcon, {
							name: InternalComponents.LibraryComponents.SvgIcon.Names.CHANGELOG,
							onClick: _ => {BDFDB.PluginUtils.openChangeLog(plugin);}
						})
					})
				}),
				plugin != BDFDB && !plugin.noLibrary && BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.Button, {
					size: InternalComponents.LibraryComponents.Button.Sizes.MIN,
					children: BDFDB.LanguageUtils.LibraryStrings.library_settings,
					onClick: event => {
						let wrapper = BDFDB.DOMUtils.getParent(BDFDB.dotCN._repocard, event.currentTarget);
						if (wrapper) {
							let settingsPanel = InternalBDFDB.createLibrarySettings();
							if (settingsPanel) {
								let savedChildren = [];
								while (wrapper.childElementCount) {
									savedChildren.push(wrapper.firstChild);
									wrapper.firstChild.remove();
								}
								let closeButton = BDFDB.DOMUtils.create(`<div style="float: right; cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" style="width: 18px; height: 18px;"><g class="background" fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="#dcddde" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg></div>`);
								wrapper.appendChild(closeButton);
								closeButton.addEventListener("click", _ => {
									while (wrapper.childElementCount) wrapper.firstChild.remove();
									while (savedChildren.length) wrapper.appendChild(savedChildren.shift());
									let settings = wrapper.querySelector(BDFDB.dotCN._reposettings);
									if (settings) {
										while (settings.childElementCount) settings.firstChild.remove();
										settings.appendChild(plugin.getSettingsPanel());
									}
								});
								wrapper.appendChild(settingsPanel);
							}
						}
					}
				})
			],
			children: children
		}), settingsPanel);
		return settingsPanel;
	};
	BDFDB.PluginUtils.refreshSettingsPanel = function (plugin, settingsPanel, ...args) {
		if (!BDFDB.ObjectUtils.is(plugin) || typeof plugin.getSettingsPanel != "function" || !Node.prototype.isPrototypeOf(settingsPanel) || !settingsPanel.parentElement) return;
		settingsPanel.parentElement.appendChild(plugin.getSettingsPanel(...args));
		settingsPanel.remove();
	};
	InternalBDFDB.createLibrarySettings = function () {
		if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded) return;
		let settingsPanel, settingsItems = [];
		
		let bdToastSetting = BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.showToasts);
		for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(InternalComponents.LibraryComponents.SettingsSaveItem, {
			className: BDFDB.disCN.marginbottom8,
			type: "Switch",
			plugin: InternalBDFDB,
			disabled: key == "showToasts" && bdToastSetting,
			keys: ["settings", key],
			label: InternalBDFDB.defaults.settings[key].description,
			note: key == "showToasts" && bdToastSetting && "Disable BBDs general 'Show Toast' setting before disabling this",
			dividerbottom: true,
			value: settings[key] || key == "showToasts" && bdToastSetting
		}));
		
		return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(BDFDB, settingsItems);
	};
	InternalBDFDB.clearStartTimeout = function (plugin) {
		if (!BDFDB.ObjectUtils.is(plugin)) return;
		BDFDB.TimeUtils.clear(plugin.startTimeout, plugin.libLoadTimeout);
		delete plugin.startTimeout;
		delete plugin.libLoadTimeout;
	};
	InternalBDFDB.addSpecialListeners = function (plugin) {
		plugin = plugin == BDFDB && InternalBDFDB || plugin;
		if (BDFDB.ObjectUtils.is(plugin)) {
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
		let nextObj = objs.shift();
		if (BDFDB.ObjectUtils.is(obj) && BDFDB.ObjectUtils.is(nextObj)) {
			for (let key in nextObj) {
				if (BDFDB.ObjectUtils.is(nextObj[key])) {
					if (!obj[key]) Object.assign(obj, {[key]:{}});
					BDFDB.ObjectUtils.deepAssign(obj[key], nextObj[key]);
				}
				else Object.assign(obj, {[key]:nextObj[key]});
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
		return array.sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
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
	
	if (window.BDFDB && BDFDB.ArrayUtils.is(window.BDFDB.pluginQueue)) for (let config of window.BDFDB.pluginQueue) BdApi.Plugins.reload(config.name);
	
	window.BDFDB = {
		name: "BDFDB",
		loaded: true,
		PluginUtils: {
			buildPlugin: BDFDB.PluginUtils.buildPlugin,
			cleanUp: BDFDB.PluginUtils.cleanUp
		}
	};
			
	return class BDFDB {
		getName () {return "BDFDB";}

		getAuthor () {return "DevilBro";}

		getVersion () {return "1.0.0";}

		getDescription () {return "Gives other plugins utility functions.";}

		// Legacy
		load () {}
		
		start () {}

		stop () {}
		
		// Begin of own functions
	}
})();

module.exports = BDFDB;