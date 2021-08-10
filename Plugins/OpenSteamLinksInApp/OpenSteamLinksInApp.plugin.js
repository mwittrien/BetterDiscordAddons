/**
 * @name OpenSteamLinksInApp
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.1.2
 * @description Opens Steam Links in Steam instead of your Browser
 
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/andmagdo/LightcordAddons
 * @source https://github.com/andmagdo/LightcordAddons/tree/master/Plugins/OpenSteamLinksInApp/
 * @updateUrl https://raw.githubusercontent.com/andmagdo/LightcordAddons/master/Plugins/OpenSteamLinksInApp/OpenSteamLinksInApp.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "OpenSteamLinksInApp",
			"author": "DevilBro",
			"version": "1.1.2",
			"description": "Opens Steam Links in Steam instead of your Browser"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://raw.githubusercontent.com/andmagdo/LightcordAddons/master/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		const urls = {
			steam: ["https://steamcommunity.", "https://help.steampowered.", "https://store.steampowered.", "https://s.team/", "a.akamaihd.net/"]
		};
		
		return class OpenSteamLinksInApp extends Plugin {
			onLoad () {}
			
			onStart () {
				for (let key in urls) BDFDB.ListenerUtils.add(this, document, "click", urls[key].map(url => url.indexOf("http") == 0 ? `a[href^="${url}"]` : `a[href*="${url}"][href*="${key}"]`).join(", "), e => {
					this.openIn(e, key, e.currentTarget.href);
				});
			}
			
			onStop () {}
		
			openIn (e, key, url) {
				let platform = BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(key);
				if (url && !url.startsWith("https://images-ext-1.discord") && !url.startsWith("https://images-ext-2.discord") && typeof this[`openIn${platform}`] == "function") {
					BDFDB.ListenerUtils.stopEvent(e);
					this[`openIn${platform}`](url);
					return true;
				}
				return false;
			}

			openInSteam (url) {
				BDFDB.LibraryRequires.request(url, (error, response, body) => {
					if (error) return;
					else if (BDFDB.LibraryRequires.electron.shell.openExternal("steam://openurl/" + response.request.href));
					else BDFDB.DiscordUtils.openLink(response.request.href);
				});
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
