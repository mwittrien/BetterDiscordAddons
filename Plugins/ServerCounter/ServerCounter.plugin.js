/**
 * @name ServerCounter
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.0.3
 * @description Adds a Server Counter to the Server List
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ServerCounter/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ServerCounter/ServerCounter.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ServerCounter",
			"author": "DevilBro",
			"version": "1.0.3",
			"description": "Adds a Server Counter to the Server List"
		},
		"changeLog": {
			"fixed": {
				"Works again": "Can discord stop messing with the server list, jeez"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
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
		return class ServerCounter extends Plugin {
			onLoad () {
				this.patchedModules = {
					after: {
						Guilds: "render"
					}
				};
			}
			
			onStart () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
		
			processGuilds (e) {
				if (typeof e.returnvalue.props.children == "function") {
					let childrenRender = e.returnvalue.props.children;
					e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let children = childrenRender(...args);
						this.checkTree(children);
						return children;
					}, "", this);
				}
				else this.checkTree(e.returnvalue);
			}
			
			checkTree (returnvalue) {
				let tree = BDFDB.ReactUtils.findChild(returnvalue, {filter: n => n && n.props && typeof n.props.children == "function"});
				if (tree) {
					let childrenRender = tree.props.children;
					tree.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let children = childrenRender(...args);
						this.injectCounter(children);
						return children;
					}, "", this);
				}
				else this.injectCounter(returnvalue);
			}
			
			injectCounter (returnvalue) {
				let [children, index] = BDFDB.ReactUtils.findParent(returnvalue, {name: "ConnectedUnreadDMs"});
				if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCNS.guildouter + BDFDB.disCN._servercounterservercountwrap,
					children: BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCNS.guildslabel + BDFDB.disCN._servercounterservercount,
						children: `${BDFDB.LanguageUtils.LanguageStrings.SERVERS} – ${BDFDB.LibraryModules.FolderStore.getFlattenedGuildIds().length}`
					})
				}));
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
