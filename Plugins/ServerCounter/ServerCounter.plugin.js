/**
 * @name ServerCounter
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ServerCounter
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ServerCounter/ServerCounter.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ServerCounter",
			"author": "DevilBro",
			"version": "1.0.2",
			"description": "Add a server counter to the server list"
		},
		"changeLog": {
			"fixed": {
				"Crash on Canary": "Fixed the crash issue that occured one some plugins on canary"
			}
		}
	};
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue:[]});
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
	} : (([Plugin, BDFDB]) => {
		return class ServerCounter extends Plugin {
			onLoad() {
				this.patchedModules = {
					after: {
						Guilds: "render"
					}
				};
			}
			
			onStart() {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop() {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
		
			processGuilds (e) {
				if (typeof e.returnvalue.props.children == "function") {
					let childrenRender = e.returnvalue.props.children;
					e.returnvalue.props.children = (...args) => {
						let children = childrenRender(...args);
						this.injectCounter(children);
						return children;
					};
				}
				else this.injectCounter(e.returnvalue);
			}
			
			injectCounter (returnvalue) {
				let [children, index] = BDFDB.ReactUtils.findParent(returnvalue, {name: "ConnectedUnreadDMs"});
				if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN.guildouter,
					children: BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCNS.guildslabel + BDFDB.disCN._servercounterservercount,
						children: `${BDFDB.LanguageUtils.LanguageStrings.SERVERS} – ${BDFDB.LibraryModules.FolderStore.getFlattenedGuildIds().length}`
					})
				}));
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();