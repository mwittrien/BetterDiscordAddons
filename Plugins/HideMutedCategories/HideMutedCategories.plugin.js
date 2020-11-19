/**
 * @name HideMutedCategories
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/HideMutedCategories
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/HideMutedCategories/HideMutedCategories.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/HideMutedCategories/HideMutedCategories.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "HideMutedCategories",
			"author": "DevilBro",
			"version": "1.0.2",
			"description": "Hide muted categories the same way muted channels are hidden, when the server is set to hide muted channels"
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
	} : (([Plugin, BDFDB]) => {
		return class HideMutedCategories extends Plugin {
			onLoad() {
				this.patchPriority = 10;
				
				this.patchedModules = {
					before: {
						Channels: "render"
					},
					after: {
						Channels: "render"
					}
				};
			}
			
			onStart() {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop() {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processChannels (e) {
				if (!e.instance.props.guild || !e.instance.props.collapseMuted) return;
				
				if (!e.returnvalue) {
					e.instance.props.categories = Object.assign({}, e.instance.props.categories);
					
					for (let catId in e.instance.props.categories) if (BDFDB.LibraryModules.MutedUtils.isChannelMuted(e.instance.props.guild.id, catId)) e.instance.props.categories[catId] = [];
				}
				else {
					let list = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.channelsscroller]]});
					if (list) {
						let renderSection = list.props.renderSection;
						list.props.renderSection = (...args) => {
							let section = renderSection(...args);
							if (section && section.props && section.props.channel && BDFDB.LibraryModules.MutedUtils.isChannelMuted(e.instance.props.guild.id, section.props.channel.id))return null;
							else return section;
						};
					}
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();