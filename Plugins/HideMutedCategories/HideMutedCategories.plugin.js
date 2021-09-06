/**
 * @name HideMutedCategories
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.0.6
 * @description Hides muted Categories, if muted Channels are hidden
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/HideMutedCategories/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/HideMutedCategories/HideMutedCategories.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "HideMutedCategories",
			"author": "DevilBro",
			"version": "1.0.6",
			"description": "Hides muted Categories, if muted Channels are hidden"
		},
		"changeLog": {
			"fixed": {
				"Unread Bar": "Unread Badge no longer shows in the channel list when an unmuted channel inside a hidden muted category has unread messages"
			}
		}
	};

	return (window.Lightcord && !Node.prototype.isPrototypeOf(window.Lightcord) || window.LightCord && !Node.prototype.isPrototypeOf(window.LightCord) || window.Astra && !Node.prototype.isPrototypeOf(window.Astra)) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return "Do not use LightCord!";}
		load () {BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)");}
		start() {}
		stop() {}
	} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
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
				
				this.patchPriority = 9;
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
					let topBar = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.channelsunreadbartop]]});
					if (topBar) {
						let topIsVisible = topBar.props.isVisible;
						topBar.props.isVisible = (...args) => {
							args[2] = args[2].filter(id => !this.isCategoryMuted(e.instance.props.guildId, id));
							return args[2].some(id => BDFDB.LibraryModules.UnreadChannelUtils.hasUnread(id) || BDFDB.LibraryModules.UnreadChannelUtils.getMentionCount(id)) ? topIsVisible(...args) : true;
						};
					}
					let bottomBar = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.channelsunreadbarbottom]]});
					if (bottomBar) {
						let bottomIsVisible = bottomBar.props.isVisible;
						bottomBar.props.isVisible = (...args) => {
							args[2] = args[2].filter(id => !this.isCategoryMuted(e.instance.props.guildId, id));
							return args[2].some(id => BDFDB.LibraryModules.UnreadChannelUtils.hasUnread(id) || BDFDB.LibraryModules.UnreadChannelUtils.getMentionCount(id)) ? bottomIsVisible(...args) : true;
						};
					}
					let tree = BDFDB.ReactUtils.findChild(e.returnvalue, {filter: n => n && n.props && typeof n.props.children == "function"});
					if (tree) {
						let childrenRender = tree.props.children;
						tree.props.children = BDFDB.TimeUtils.suppress((...args) => {
							let children = childrenRender(...args);
							this.patchList(e.instance.props.guild.id, children);
							return children;
						}, "", this);
					}
					else this.patchList(e.instance.props.guild.id, e.returnvalue);
				}
			}
			
			isCategoryMuted (guildId, channelId) {
				if (!guildId || !channelId) return false;
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channelId);
				return channel && channel.parent_id && BDFDB.LibraryModules.MutedUtils.isChannelMuted(guildId, channel.parent_id);
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