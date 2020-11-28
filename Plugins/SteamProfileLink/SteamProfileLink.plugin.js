/**
 * @name SteamProfileLink
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SteamProfileLink
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SteamProfileLink/SteamProfileLink.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SteamProfileLink/SteamProfileLink.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "SteamProfileLink",
			"author": "DevilBro",
			"version": "1.0.9",
			"description": "Open any Steam links in Steam instead of your internet browser"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
		stop() {}
		getSettingsPanel() {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The library plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", _ => {
				require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
					if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
					else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
				});
			});
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var settings = {};
		
		var urls = {
			steam: ["https://steamcommunity.", "https://help.steampowered.", "https://store.steampowered.", "a.akamaihd.net/"]
		};
		
		return class SteamProfileLink extends Plugin {
			onLoad() {
				this.defaults = {
					settings: {
						useChromium: 			{value: false,			description: "Use inbuilt browser instead of default if fails to open Steam"}
					}
				};
			}
			
			onStart() {
				for (let key in urls) BDFDB.ListenerUtils.add(this, document, "click", urls[key].map(url => url.indexOf("http") == 0 ? `a[href^="${url}"]` : `a[href*="${url}"][href*="${key}"]`).join(", "), e => {
					this.openIn(e, key, e.currentTarget.href);
				});
				
				this.forceUpdateAll();
			}
			
			onStop() {}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				settingsItems = settingsItems.concat(this.createSelects(false));
				
				for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
			}
		
			openIn (e, key, url) {
				let platform = BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(key);
				if (typeof this[`openIn${platform}`] == "function") {
					BDFDB.ListenerUtils.stopEvent(e);
					this[`openIn${platform}`](url);
					return true;
				}
				return false;
			}

			openInSteam (url) {
				BDFDB.LibraryRequires.request(url, (error, response, body) => {
					if (BDFDB.LibraryRequires.electron.shell.openExternal("steam://openurl/" + response.request.href));
					else BDFDB.DiscordUtils.openLink(response.request.href, settings.useChromium);
				});
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();