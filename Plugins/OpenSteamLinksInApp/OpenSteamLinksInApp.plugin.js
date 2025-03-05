/**
 * @name OpenSteamLinksInApp
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.1.7
 * @description Opens Steam Links in Steam instead of your Browser
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/OpenSteamLinksInApp/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/OpenSteamLinksInApp/OpenSteamLinksInApp.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js").then(r => {
				if (!r || r.status != 200) throw new Error();
				else return r.text();
			}).then(b => {
				if (!b) throw new Error();
				else return require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.UI.showToast("Finished downloading BDFDB Library", {type: "success"}));
			}).catch(error => {
				BdApi.UI.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.UI.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		const urls = {
			steam: ["https://steamcommunity.", "https://help.steampowered.", "https://store.steampowered.", "https://s.team/", "a.akamaihd.net/"]
		};
		
		return class OpenSteamLinksInApp extends Plugin {
			onLoad () {
				this.modulePatches = {
					before: [
						"MessageContent"
					]
				};
			}
			
			onStart () {
				for (let key in urls) BDFDB.ListenerUtils.add(this, document, "click", BDFDB.ArrayUtils.removeCopies(urls[key].map(url => url.indexOf("http") == 0 ? (url.indexOf("https://") == 0 ? [`a[href^="${url}"]`, `a[href^="${url.replace(/https:\/\//i, "http://")}"]`] : `a[href^="${url}"]`) : `a[href*="${url}"][href*="${key}"]`).flat(10).filter(n => n)).join(", "), e => {
					if (!(e.currentTarget.className && e.currentTarget.className.indexOf(BDFDB.disCN.imagezoom) > -1) && !BDFDB.DOMUtils.getParent(BDFDB.dotCN.imagezoom, e.currentTarget)) this.openIn(e, key, e.currentTarget.href);
				});
			}
			
			onStop () {}
			
			processMessageContent (e) {
				if (!BDFDB.ArrayUtils.is(e.instance.props.content)) return;
				for (let i in e.instance.props.content) if (e.instance.props.content[i] && e.instance.props.content[i].type == "span" && typeof e.instance.props.content[i].props.children == "string" && e.instance.props.content[i].props.children.indexOf("steam://") == 0) {
					const url = e.instance.props.content[i].props.children;
					e.instance.props.content[i] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
						href: url,
						title: url,
						onClick: _ => BDFDB.LibraryRequires.electron.shell.openExternal(url),
						children: BDFDB.ReactUtils.createElement("span", {children: url})
					});
				}
			}
		
			openIn (e, key, url) {
				let platform = BDFDB.StringUtils.upperCaseFirstChar(key);
				if (url && !url.startsWith("https://images-ext-1.discord") && !url.startsWith("https://images-ext-2.discord") && typeof this[`openIn${platform}`] == "function") {
					BDFDB.ListenerUtils.stopEvent(e);
					this[`openIn${platform}`](url);
					return true;
				}
				return false;
			}

			openInSteam (url) {
				const xhr = new XMLHttpRequest();
				xhr.open("GET", url, true);
				xhr.onreadystatechange = function () {
					if (xhr.readyState != 4) return;
					let responseUrl = xhr.responseURL || url;
					if (BDFDB.LibraryRequires.electron.shell.openExternal("steam://openurl/" + responseUrl));
					else BDFDB.DiscordUtils.openLink(responseUrl);
				};
				xhr.send(null);
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();