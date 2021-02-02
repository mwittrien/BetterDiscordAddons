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
			"version": "1.0.4",
			"description": "Hide muted categories the same way muted channels are hidden, when the server is set to hide muted channels"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin, try again later or download it manually from GitHub: https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/");
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
		return class HideMutedCategories extends Plugin {
			onLoad () {
				this.patchedModules = {
					before: {
						Channels: "render"
					},
					after: {
						Channels: "render"
					}
				};
				
				this.patchPriority = 10;
			}
			
			onStart () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processChannels (e) {
				if (!e.instance.props.guild || !e.instance.props.collapseMuted) return;
				
				if (!e.returnvalue) {
					e.instance.props.categories = Object.assign({}, e.instance.props.categories);
					
					for (let catId in e.instance.props.categories) if (BDFDB.LibraryModules.MutedUtils.isChannelMuted(e.instance.props.guild.id, catId)) e.instance.props.categories[catId] = [];
				}
				else {
					let tree = BDFDB.ReactUtils.findChild(e.returnvalue, {filter: n => n && n.props && typeof n.props.children == "function"});
					if (tree) {
						let childrenRender = tree.props.children;
						tree.props.children = (...args) => {
							let children = childrenRender(...args);
							this.patchList(e.instance.props.guild.id, children);
							return children;
						};
					}
					else this.patchList(e.instance.props.guild.id, e.returnvalue);
				}
			}
		
			patchList (guildId, returnvalue) {
				let list = BDFDB.ReactUtils.findChild(returnvalue, {props: [["className", BDFDB.disCN.channelsscroller]]});
				if (list) {
					let renderSection = list.props.renderSection;
					list.props.renderSection = (...args) => {
						let section = renderSection(...args);
						if (section && section.props && section.props.channel && BDFDB.LibraryModules.MutedUtils.isChannelMuted(guildId, section.props.channel.id)) return null;
						else return section;
					};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();