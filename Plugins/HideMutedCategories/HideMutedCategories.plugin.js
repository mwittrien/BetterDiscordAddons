/**
 * @name HideMutedCategories
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.1.2
 * @description Hides muted Categories, if muted Channels are hidden
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/HideMutedCategories/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/HideMutedCategories/HideMutedCategories.plugin.js
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
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
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
		const renderLevels = {
			CAN_NOT_SHOW: 1,
			DO_NOT_SHOW: 2,
			WOULD_SHOW_IF_UNCOLLAPSED: 3,
			SHOW: 4
		};
		
		return class HideMutedCategories extends Plugin {
			onLoad () {
				this.modulePatches = {
					before: [
						"ChannelsList"
					],
					after: [
						"ChannelsList"
					]
				};
				
				this.patchPriority = 9;
			}
			
			onStart () {
				BDFDB.ChannelUtils.rerenderAll();
			}
			
			onStop () {
				BDFDB.ChannelUtils.rerenderAll();
			}

			processChannelsList (e) {
				if (!e.instance.props.guild || !e.instance.props.guildChannels.hideMutedChannels) return;
				
				if (!e.returnvalue) {
					e.instance.props.guildChannels.categories = Object.assign({}, e.instance.props.guildChannels.categories);
					for (let id in e.instance.props.guildChannels.categories) if (e.instance.props.guildChannels.categories[id].isMuted) {
						let channelArray = BDFDB.ObjectUtils.toArray(e.instance.props.guildChannels.categories[id].channels);
						for (let n of channelArray) if (n.renderLevel > renderLevels.DO_NOT_SHOW && n.id != e.instance.props.selectedChannelId && n.id != e.instance.props.selectedVoiceChannelId && BDFDB.LibraryStores.ReadStateStore.getMentionCount(n.id) <= 0) {
							n.renderLevel = renderLevels.CAN_NOT_SHOW;
							BDFDB.ArrayUtils.remove(e.instance.props.guildChannels.categories[id].shownChannelIds, n.id, true);
						}
					}
				}
				else {
					let topBar = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.channelsunreadbartop]]});
					if (topBar) {
						let topIsVisible = topBar.props.isVisible;
						topBar.props.isVisible = BDFDB.TimeUtils.suppress((...args) => {
							args[2] = args[2].filter(id => !this.isCategoryMuted(e.instance.props.guildId, id));
							return args[2].some(id => BDFDB.LibraryStores.ReadStateStore.hasUnread(id) || BDFDB.LibraryStores.ReadStateStore.getMentionCount(id)) ? topIsVisible(...args) : true;
						}, "Error in isVisible of Top Bar in ChannelsList!", this);
					}
					let bottomBar = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.channelsunreadbarbottom]]});
					if (bottomBar) {
						let bottomIsVisible = bottomBar.props.isVisible;
						bottomBar.props.isVisible = BDFDB.TimeUtils.suppress((...args) => {
							args[2] = args[2].filter(id => !this.isCategoryMuted(e.instance.props.guildId, id));
							return args[2].some(id => BDFDB.LibraryStores.ReadStateStore.hasUnread(id) || BDFDB.LibraryStores.ReadStateStore.getMentionCount(id)) ? bottomIsVisible(...args) : true;
						}, "Error in isVisible of Bottom Bar in ChannelsList!", this);
					}
					let tree = BDFDB.ReactUtils.findChild(e.returnvalue, {filter: n => n && n.props && typeof n.props.children == "function"});
					if (!tree) return;
					let childrenRender = tree.props.children;
					tree.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let children = childrenRender(...args);
						let list = BDFDB.ReactUtils.findChild(children, {props: [["className", BDFDB.disCN.channelsscroller]]});
						if (list) {
							let selectedChannel = BDFDB.LibraryStores.ChannelStore.getChannel(e.instance.props.selectedChannelId);
							let selectedVoiceChannel = BDFDB.LibraryStores.ChannelStore.getChannel(e.instance.props.selectedVoiceChannelId);
							let renderSection = list.props.renderSection;
							list.props.renderSection = BDFDB.TimeUtils.suppress((...args2) => {
								let section = renderSection(...args2);
								if (section && section.props && section.props.channel && BDFDB.LibraryStores.UserGuildSettingsStore.isChannelMuted(e.instance.props.guild.id, section.props.channel.id) && !(selectedChannel && selectedChannel.parent_id == section.props.channel.id) && !(selectedVoiceChannel && selectedVoiceChannel.parent_id == section.props.channel.id) && BDFDB.ObjectUtils.toArray(BDFDB.LibraryStores.ChannelStore.getMutableGuildChannelsForGuild(e.instance.props.guild.id)).filter(n => n.parent_id == section.props.channel.id && BDFDB.LibraryStores.ReadStateStore.getMentionCount(n.id) > 0).length == 0) return null;
								else return section;
							}, "Error in renderSection of ChannelsList!", this);
						}
						return children;
					}, "Error in Child Render of ChannelsList!", this);
				}
			}
			
			isCategoryMuted (guildId, channelId) {
				if (!guildId || !channelId) return false;
				let channel = BDFDB.LibraryStores.ChannelStore.getChannel(channelId);
				return channel && channel.parent_id && BDFDB.LibraryStores.UserGuildSettingsStore.isChannelMuted(guildId, channel.parent_id);
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();