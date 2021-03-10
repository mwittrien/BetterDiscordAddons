/**
 * @name ShowHiddenChannels
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 2.9.3
 * @description Displays all hidden Channels, which can't be accessed due to Role Restrictions, this won't allow you to read them (impossible)
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ShowHiddenChannels/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ShowHiddenChannels/ShowHiddenChannels.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ShowHiddenChannels",
			"author": "DevilBro",
			"version": "2.9.3",
			"description": "Displays all hidden Channels, which can't be accessed due to Role Restrictions, this won't allow you to read them (impossible)"
		},
		"changeLog": {
			"added": {
				"Hide connected voice users": "You can now disable the option to show users who are in a hidden voice channel"
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
		var blackList = [], collapseList = [], hiddenCategory, lastGuildId, overrideTypes = [];
		var hiddenChannelCache = {};
		var accessModal;
		var settings = {};
		
		const settingsMap = {
			GUILD_TEXT: "showText",
			GUILD_VOICE: "showVoice",
			GUILD_ANNOUNCEMENT: "showAnnouncement",
			GUILD_STORE: "showStore"
		};

		const typeNameMap = {
			GUILD_TEXT: "TEXT_CHANNEL",
			GUILD_VOICE: "VOICE_CHANNEL",
			GUILD_ANNOUNCEMENT: "NEWS_CHANNEL",
			GUILD_STORE: "STORE_CHANNEL",
			GUILD_CATEGORY: "CATEGORY"
		};

		const channelIcons = {
			GUILD_TEXT: `M 5.88657 21 C 5.57547 21 5.3399 20.7189 5.39427 20.4126 L 6.00001 17 H 2.59511 C 2.28449 17 2.04905 16.7198 2.10259 16.4138 L 2.27759 15.4138 C 2.31946 15.1746 2.52722 15 2.77011 15 H 6.35001 L 7.41001 9 H 4.00511 C 3.69449 9 3.45905 8.71977 3.51259 8.41381 L 3.68759 7.41381 C 3.72946 7.17456 3.93722 7 4.18011 7 H 7.76001 L 8.39677 3.41262 C 8.43914 3.17391 8.64664 3 8.88907 3 H 9.87344 C 10.1845 3 10.4201 3.28107 10.3657 3.58738 L 9.76001 7 H 15.76 L 16.3968 3.41262 C 16.4391 3.17391 16.6466 3 16.8891 3 H 17.8734 C 18.1845 3 18.4201 3.28107 18.3657 3.58738 L 17.76 7 H 21.1649 C 21.4755 7 21.711 7.28023 21.6574 7.58619 L 21.4824 8.58619 C 21.4406 8.82544 21.2328 9 20.9899 9 H 17.41 L 16.35 15 H 19.7549 C 20.0655 15 20.301 15.2802 20.2474 15.5862 L 20.0724 16.5862 C 20.0306 16.8254 19.8228 17 19.5799 17 H 16 L 15.3632 20.5874 C 15.3209 20.8261 15.1134 21 14.8709 21 H 13.8866 C 13.5755 21 13.3399 20.7189 13.3943 20.4126 L 14 17 H 8.00001 L 7.36325 20.5874 C 7.32088 20.8261 7.11337 21 6.87094 21 H 5.88657Z M 9.41045 9 L 8.35045 15 H 14.3504 L 15.4104 9 H 9.41045 Z`,
			GUILD_VOICE: `M 11.383 3.07904 C 11.009 2.92504 10.579 3.01004 10.293 3.29604 L 6 8.00204 H 3 C 2.45 8.00204 2 8.45304 2 9.00204 V 15.002 C 2 15.552 2.45 16.002 3 16.002 H 6 L 10.293 20.71 C 10.579 20.996 11.009 21.082 11.383 20.927 C 11.757 20.772 12 20.407 12 20.002 V 4.00204 C 12 3.59904 11.757 3.23204 11.383 3.07904Z M 14 5.00195 V 7.00195 C 16.757 7.00195 19 9.24595 19 12.002 C 19 14.759 16.757 17.002 14 17.002 V 19.002 C 17.86 19.002 21 15.863 21 12.002 C 21 8.14295 17.86 5.00195 14 5.00195Z M 14 9.00195 C 15.654 9.00195 17 10.349 17 12.002 C 17 13.657 15.654 15.002 14 15.002 V 13.002 C 14.551 13.002 15 12.553 15 12.002 C 15 11.451 14.551 11.002 14 11.002 V 9.00195 Z`,
			GUILD_ANNOUNCEMENT: `M 3.9 8.26 H 2 V 15.2941 H 3.9 V 8.26 Z M 19.1 4 V 5.12659 L 4.85 8.26447 V 18.1176 C 4.85 18.5496 5.1464 18.9252 5.5701 19.0315 L 9.3701 19.9727 C 9.4461 19.9906 9.524 20 9.6 20 C 9.89545 20 10.1776 19.8635 10.36 19.6235 L 12.7065 16.5242 L 19.1 17.9304 V 19.0588 H 21 V 4 H 19.1 Z M 9.2181 17.9944 L 6.75 17.3826 V 15.2113 L 10.6706 16.0753 L 9.2181 17.9944 Z`,
			GUILD_STORE: `M 21.707 13.293l -11 -11 C 10.519 2.105 10.266 2 10 2 H 3c -0.553 0 -1 0.447 -1 1 v 7 c 0 0.266 0.105 0.519 0.293 0.707l11 11 c 0.195 0.195 0.451 0.293 0.707 0.293 s 0.512 -0.098 0.707 -0.293l7 -7 c 0.391 -0.391 0.391 -1.023 0 -1.414 z M 7 9c -1.106 0 -2 -0.896 -2 -2 0 -1.106 0.894 -2 2 -2 1.104 0 2 0.894 2 2 0 1.104 -0.896 2 -2 2 z`,
			DEFAULT: `M 11.44 0 c 4.07 0 8.07 1.87 8.07 6.35 c 0 4.13 -4.74 5.72 -5.75 7.21 c -0.76 1.11 -0.51 2.67 -2.61 2.67 c -1.37 0 -2.03 -1.11 -2.03 -2.13 c 0 -3.78 5.56 -4.64 5.56 -7.76 c 0 -1.72 -1.14 -2.73 -3.05 -2.73 c -4.07 0 -2.48 4.19 -5.56 4.19 c -1.11 0 -2.07 -0.67 -2.07 -1.94 C 4 2.76 7.56 0 11.44 0 z M 11.28 18.3 c 1.43 0 2.61 1.17 2.61 2.61 c 0 1.43 -1.18 2.61 -2.61 2.61 c -1.43 0 -2.61 -1.17 -2.61 -2.61 C 8.68 19.48 9.85 18.3 11.28 18.3 z`
		};
		
		const UserRowComponent = class UserRow extends BdApi.React.Component {
			componentDidMount() {
				if (this.props.user.fetchable) {
					this.props.user.fetchable = false;
					BDFDB.LibraryModules.UserFetchUtils.getUser(this.props.user.id).then(fetchedUser => {
						this.props.user = Object.assign({}, fetchedUser, BDFDB.LibraryModules.MemberStore.getMember(this.props.guildId, this.props.user.id) || {});
						BDFDB.ReactUtils.forceUpdate(this);
					});
				}
			}
			render() {
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListRow, {
					prefix: BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.listavatar,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.AvatarComponents.default, {
							src: BDFDB.UserUtils.getAvatar(this.props.user.id),
							status: BDFDB.UserUtils.getStatus(this.props.user.id),
							size: BDFDB.LibraryComponents.AvatarComponents.Sizes.SIZE_40,
							onClick: _ => {
								if (accessModal) accessModal.props.onClose();
								BDFDB.LibraryModules.UserProfileUtils.open(this.props.user.id);
							}
						})
					}),
					label: [
						BDFDB.ReactUtils.createElement("span", {
							className: BDFDB.disCN.username,
							children: this.props.user.username,
							style: {color: this.props.user.colorString}
						}),
						!this.props.user.discriminator ? null : BDFDB.ReactUtils.createElement("span", {
							className: BDFDB.disCN.listdiscriminator,
							children: `#${this.props.user.discriminator}`
						})
					]
				});
			}
		};
		
		const RoleRowComponent = class RoleRow extends BdApi.React.Component {
			render() {
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListRow, {
					prefix: BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCNS.avataricon + BDFDB.disCNS.listavatar + BDFDB.disCNS.avatariconsizemedium + BDFDB.disCN.avatariconinactive,
						style: {
							boxSizing: "border-box",
							padding: 10
						},
						children: BDFDB.ReactUtils.createElement("div", {
							style: {
								borderRadius: "50%",
								height: "100%",
								width: "100%",
								backgroundColor: BDFDB.ColorUtils.convert(this.props.role.colorString || BDFDB.DiscordConstants.Colors.PRIMARY_DARK_300, "RGB")
							}
						})
					}),
					labelClassName: this.props.role.overwritten && BDFDB.disCN.strikethrough,
					label: BDFDB.ReactUtils.createElement("span", {
						children: this.props.role.name,
						style: {color: this.props.role.colorString}
					})
				});
			}
		};
	
		return class ShowHiddenChannels extends Plugin {
			onLoad () {
				overrideTypes = Object.keys(BDFDB.DiscordConstants.PermissionOverrideType);
				 
				this.defaults = {
					settings: {
						sortNative:				{value: true, 	description: "Sort hidden Channels in the native Order instead of an extra Category"},
						showText:				{value: true, 	description: "Show hidden Text Channels"},
						showVoice:				{value: true, 	description: "Show hidden Voice Channels"},
						showAnnouncement:		{value: true, 	description: "Show hidden Announcement Channels"},
						showStore:				{value: true, 	description: "Show hidden Store Channels"},
						showVoiceUsers:			{value: true, 	description: "Show connected Users in hidden Voice Channels"},
						alwaysCollapse:			{value: false, 	description: "Always collapse 'Hidden' Category after switching Servers"},
						showForNormal:			{value: true,	description: "Add Access-Overview ContextMenu Entry for non-hidden Channels"}
					}
				};
			
				this.patchedModules = {
					before: {
						Channels: "render",
						ChannelCategoryItem: "type",
						VoiceUsers: "render"
					},
					after: {
						ChannelItem: "default"
					}
				};
				
				this.css = `
					${BDFDB.dotCNS._showhiddenchannelsaccessmodal + BDFDB.dotCN.messagespopoutemptyplaceholder} {
						position: absolute;
						bottom: 0;
						width: 100%;
					}
				`;
			}
			
			onStart () {
				let loadedBlackList = BDFDB.DataUtils.load(this, "blacklist");
				this.saveBlackList(!BDFDB.ArrayUtils.is(loadedBlackList) ? [] : loadedBlackList);
				
				let loadedCollapseList = BDFDB.DataUtils.load(this, "categorydata");
				this.saveCollapseList(!BDFDB.ArrayUtils.is(loadedCollapseList) ? [] : loadedCollapseList);
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.UnreadChannelUtils, "hasUnread", {after: e => {
					return e.returnValue && !this.isChannelHidden(e.methodArguments[0]);
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.UnreadChannelUtils, "getMentionCount", {after: e => {
					return this.isChannelHidden(e.methodArguments[0]) ? 0 : e.returnValue;
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.CategoryCollapseStore, "isCollapsed", {after: e => {
					if (e.methodArguments[0] && e.methodArguments[0].endsWith("hidden")) {
						if (settings.alwaysCollapse && e.methodArguments[0] != lastGuildId && !collapseList.includes(e.methodArguments[0])) {
							collapseList.push(e.methodArguments[0]);
							this.saveCollapseList(BDFDB.ArrayUtils.removeCopies(collapseList));
						}
						lastGuildId = e.methodArguments[0];
						return collapseList.includes(e.methodArguments[0]);
					}
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.CategoryCollapseUtils, "categoryCollapse", {before: e => {
					if (e.methodArguments[0] && e.methodArguments[0].endsWith("hidden")) {
						if (!collapseList.includes(e.methodArguments[0])) {
							collapseList.push(e.methodArguments[0]);
							this.saveCollapseList(BDFDB.ArrayUtils.removeCopies(collapseList));
						}
					}
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.CategoryCollapseUtils, "categoryExpand", {before: e => {
					if (e.methodArguments[0] && e.methodArguments[0].endsWith("hidden")) {
						if (collapseList.includes(e.methodArguments[0])) {
							BDFDB.ArrayUtils.remove(collapseList, e.methodArguments[0], true);
							this.saveCollapseList(BDFDB.ArrayUtils.removeCopies(collapseList));
						}
					}
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.GuildChannelStore, "getTextChannelNameDisambiguations", {after: e => {
					let all = this.getAllChannels();
					for (let channel_id in all) if (all[channel_id].guild_id == e.methodArguments[0] && !e.returnValue[channel_id] && (all[channel_id].type != BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY && all[channel_id].type != BDFDB.DiscordConstants.ChannelTypes.GUILD_VOICE)) e.returnValue[channel_id] = {id: channel_id, name: all[channel_id].name};
				}});

				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: "Settings",
					collapseStates: collapseStates,
					children: Object.keys(settings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Switch",
						plugin: this,
						keys: ["settings", key],
						label: this.defaults.settings[key].description,
						value: settings[key]
					}))
				}));
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: "Server Black List",
					collapseStates: collapseStates,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsGuildList, {
							className: BDFDB.disCN.marginbottom20,
							disabled: blackList,
							onClick: disabledGuilds => {
								this.saveBlackList(disabledGuilds);
							}
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Button",
							color: BDFDB.LibraryComponents.Button.Colors.GREEN,
							label: "Enable for all Servers",
							onClick: _ => {
								this.batchSetGuilds(settingsPanel, collapseStates, true);
							},
							children: BDFDB.LanguageUtils.LanguageStrings.ENABLE
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Button",
							color: BDFDB.LibraryComponents.Button.Colors.PRIMARY,
							label: "Disable for all Servers",
							onClick: _ => {
								this.batchSetGuilds(settingsPanel, collapseStates, false);
							},
							children: BDFDB.LanguageUtils.LanguageStrings.DISABLE
						})
					]
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
				
				hiddenChannelCache = {};

				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.ChannelUtils.rerenderAll();
			}
		
			onChannelContextMenu (e) {
				if (e.instance.props.channel) {
					if (e.instance.props.channel.id.endsWith("hidden") && e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY) {
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "ChannelMuteItem"});
						if (index > -1) children.splice(index, 1);
					}
					let isHidden = this.isChannelHidden(e.instance.props.channel.id);
					if (isHidden || BDFDB.DataUtils.get(this, "settings", "showForNormal")) {
						let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "mark-channel-read", group: true});
						children.splice(index > -1 ? index + 1 : 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
							children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								label: BDFDB.LanguageUtils.LanguageStrings.CHANNEL + " " + BDFDB.LanguageUtils.LanguageStrings.ACCESSIBILITY,
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "permissions"),
								action: _ => {
									this.openAccessModal(e.instance.props.channel, !isHidden);
								}
							})
						}));
					}
				}
			}
			
			onGuildContextMenu (e) {
				if (e.instance.props.guild) {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "hide-muted-channels"});
					if (index > -1) children.splice(index + 1, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuCheckboxItem, {
						label: this.labels.context_hidehidden,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "hide-locked-channels"),
						checked: blackList.includes(e.instance.props.guild.id),
						action: value => {
							if (value) blackList.push(e.instance.props.guild.id);
							else BDFDB.ArrayUtils.remove(blackList, e.instance.props.guild.id, true);
							this.saveBlackList(BDFDB.ArrayUtils.removeCopies(blackList));

							BDFDB.PatchUtils.forceAllUpdates(this);
							BDFDB.ChannelUtils.rerenderAll(true);
						}
					}));
				}
			}
			
			onGuildHeaderContextMenu (e) {
				this.onGuildContextMenu(e);
			}
			
			processChannels (e) {
				if (!e.instance.props.guild || blackList.includes(e.instance.props.guild.id)) return;
				let [hiddenChannels, amount] = this.getHiddenChannels(e.instance.props.guild);
				if (amount) {
					e.instance.props.categories = Object.assign({}, e.instance.props.categories);
					for (let catId in e.instance.props.categories) e.instance.props.categories[catId] = [].concat(e.instance.props.categories[catId]);
					e.instance.props.channels = Object.assign({}, e.instance.props.channels);
					for (let type in e.instance.props.channels) e.instance.props.channels[type] = [].concat(e.instance.props.channels[type]);
						
					let hiddenId = e.instance.props.guild.id + "_hidden";
					
					delete e.instance.props.categories[hiddenId];
					e.instance.props.categories._categories = e.instance.props.categories._categories.filter(n => n.channel.id != hiddenId);
					e.instance.props.channels[BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY] = e.instance.props.channels[BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY].filter(n => n.channel.id != hiddenId);
					
					let index = -1;
					for (let catId in e.instance.props.categories) {
						if (catId != "_categories") e.instance.props.categories[catId] = e.instance.props.categories[catId].filter(n => !this.isChannelHidden(n.channel.id));
						for (let channelObj of e.instance.props.categories[catId]) if (channelObj.index > index) index = parseInt(channelObj.index);
					}
					if (!settings.sortNative) {
						hiddenCategory = new BDFDB.DiscordObjects.Channel({
							guild_id: e.instance.props.guild.id,
							id: hiddenId,
								"name": "hidden",
							type: BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY
						});
						e.instance.props.categories[hiddenId] = [];
						e.instance.props.categories._categories.push({
							channel: hiddenCategory,
							index: ++index
						});
						e.instance.props.channels[BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY].push({
							comparator: (e.instance.props.channels[BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY][e.instance.props.channels[BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY].length - 1] || {comparator: 0}).comparator + 1,
							channel: hiddenCategory
						});
					}
					else hiddenCategory = null;
						
					for (let type in hiddenChannels) {
						let channelType = type == BDFDB.DiscordConstants.ChannelTypes.GUILD && e.instance.props.channels.SELECTABLE ? "SELECTABLE" : type;
						if (!BDFDB.ArrayUtils.is(e.instance.props.channels[channelType])) e.instance.props.channels[channelType] = [];
						for (let channel of hiddenChannels[type]) {
							let hiddenChannel = new BDFDB.DiscordObjects.Channel(Object.assign({}, channel, {
								parent_id: hiddenCategory ? hiddenId : channel.parent_id
							}));
							let parent_id = hiddenChannel.parent_id || "null";
							e.instance.props.categories[parent_id].push({
								channel: hiddenChannel,
								index: hiddenChannel.position
							});
							e.instance.props.channels[channelType].push({
								comparator: hiddenChannel.position,
								channel: hiddenChannel
							});
						}
					}
					
					for (let parent_id in e.instance.props.categories) BDFDB.ArrayUtils.keySort(e.instance.props.categories[parent_id], "index");
					for (let channelType in e.instance.props.channels) BDFDB.ArrayUtils.keySort(e.instance.props.channels[channelType], "comparator");
				}
			}
			
			processChannelCategoryItem (e) {
				if (hiddenCategory && e.instance.props.channel && !e.instance.props.channel.id && e.instance.props.channel.type != BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY) e.instance.props.channel = hiddenCategory;
			}
			
			processChannelItem (e) {
				if (e.instance.props.channel && this.isChannelHidden(e.instance.props.channel.id)) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "Icon"});
					if (index > -1) children[index] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						nativeClass: true,
						iconSVG: `<svg class="${BDFDB.disCN.channelicon}" width="24" height="24" viewBox="0 0 24 24"><mask id="${this.name + e.instance.props.channel.id}" fill="black"><path d="M 0 0 H 24 V 24 H 0 Z" fill="white"></path><path d="M24 0 H 13 V 12 H 24 Z" fill="black"></path></mask><path mask="url(#${this.name + e.instance.props.channel.id})" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="${this.channelIcons[BDFDB.DiscordConstants.ChannelTypes[e.instance.props.channel.type]] || this.channelIcons.DEFAULT}"></path><path fill="currentColor" d="M 21.025 5 V 4 C 21.025 2.88 20.05 2 19 2 C 17.95 2 17 2.88 17 4 V 5 C 16.4477 5 16 5.44772 16 6 V 9 C 16 9.55228 16.4477 10 17 10 H 19 H 21 C 21.5523 10 22 9.55228 22 9 V 5.975C22 5.43652 21.5635 5 21.025 5 Z M 20 5 H 18 V 4 C 18 3.42857 18.4667 3 19 3 C 19.5333 3 20 3.42857 20 4 V 5 Z"></path></svg>`
					});
					let channelChildren = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.channelchildren]]});
					if (channelChildren && channelChildren.props && channelChildren.props.children) {
						channelChildren.props.children = [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: BDFDB.LanguageUtils.LanguageStrings.CHANNEL_LOCKED_SHORT,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
								className: BDFDB.disCN.channeliconitem,
								style: {display: "block"},
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									className: BDFDB.disCN.channelactionicon,
									name: BDFDB.LibraryComponents.SvgIcon.Names.LOCK_CLOSED
								})
							})
						})];
					}
					if (!(e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.GUILD_VOICE && e.instance.props.connected)) {
						let wrapper = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.channelwrapper]]});
						if (wrapper) {
							wrapper.props.onMouseDown = _ => {};
							wrapper.props.onMouseUp = _ => {};
						}
						let mainContent = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.channelmaincontent]]});
						if (mainContent) {
							mainContent.props.onClick = _ => {};
							mainContent.props.href = null;
						}
					}
				}
			}
		
			processVoiceUsers (e) {
				if (!settings.showVoiceUsers && this.isChannelHidden(e.instance.props.channel.id)) e.instance.props.voiceStates = [];
			}
			
			isChannelHidden (channelId) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channelId);
				return channel && hiddenChannelCache[channel.guild_id] && hiddenChannelCache[channel.guild_id].hidden[channel.type] && hiddenChannelCache[channel.guild_id].hidden[channel.type].find(c => c.id == channel.id);
			}
			
			getAllChannels () {
				return (BDFDB.LibraryModules.ChannelStore.getGuildChannels || BDFDB.LibraryModules.ChannelStore.getMutableGuildChannels || (_ => {return {};}))();
			}
			
			getHiddenChannels (guild) {
				if (!guild) return [{}, 0];
				let hiddenChannels = {}, rolesAmount = (BDFDB.LibraryModules.MemberStore.getMember(guild.id, BDFDB.UserUtils.me.id) || {roles: []}).roles.length;
				if (!hiddenChannelCache[guild.id] || hiddenChannelCache[guild.id].roles != rolesAmount) {
					let all = this.getAllChannels();
					for (let type in BDFDB.DiscordConstants.ChannelTypes) hiddenChannels[BDFDB.DiscordConstants.ChannelTypes[type]] = [];
					for (let channel_id in all) {
						let channel = all[channel_id];
						if (channel.guild_id == guild.id && channel.type != BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY && (settings[settingsMap[BDFDB.DiscordConstants.ChannelTypes[channel.type]]] || settings[settingsMap[BDFDB.DiscordConstants.ChannelTypes[channel.type]]] === undefined) && !BDFDB.DMUtils.isDMChannel(channel.id) && !BDFDB.UserUtils.can("VIEW_CHANNEL", BDFDB.UserUtils.me.id, channel.id)) hiddenChannels[channel.type].push(channel);
					}
				}
				else hiddenChannels = hiddenChannelCache[guild.id].hidden;
				for (let type in hiddenChannels) hiddenChannels[type] = hiddenChannels[type].filter(c => BDFDB.LibraryModules.ChannelStore.getChannel(c.id));
				hiddenChannelCache[guild.id] = {hidden: hiddenChannels, amount: BDFDB.ObjectUtils.toArray(hiddenChannels).flat().length, roles: rolesAmount};
				return [hiddenChannelCache[guild.id].hidden, hiddenChannelCache[guild.id].amount];
			}
			
			batchSetGuilds (settingsPanel, collapseStates, value) {
				if (!value) {
					for (let id of BDFDB.LibraryModules.FolderStore.getFlattenedGuildIds()) blackList.push(id);
					this.saveBlackList(BDFDB.ArrayUtils.removeCopies(blackList));
				}
				else this.saveBlackList([]);
				BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
			}
			
			saveBlackList (savedBlackList) {
				blackList = savedBlackList;
				BDFDB.DataUtils.save(savedBlackList, this, "blacklist");
			}
			
			saveCollapseList (savedCollapseList) {
				collapseList = savedCollapseList;
				BDFDB.DataUtils.save(savedCollapseList, this, "categorydata");
			}
			
			openAccessModal (channel, allowed) {
				let guild = BDFDB.LibraryModules.GuildStore.getGuild(channel.guild_id);
				let myMember = guild && BDFDB.LibraryModules.MemberStore.getMember(guild.id, BDFDB.UserUtils.me.id);
				let category = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.ChannelStore.getChannel(channel.id).parent_id);
				let lightTheme = BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themelight;
				
				let addUser = (id, users) => {
					let user = BDFDB.LibraryModules.UserStore.getUser(id);
					if (user) allowedUsers.push(Object.assign({}, user, BDFDB.LibraryModules.MemberStore.getMember(guild.id, id) || {}));
					else users.push({id: id, username: `UserId: ${id}`, fetchable: true});
				};
				let checkPerm = permString => {
					return ((permString | BDFDB.DiscordConstants.Permissions.VIEW_CHANNEL) == permString || (permString | BDFDB.DiscordConstants.Permissions.READ_MESSAGE_HISTORY) == permString || channel.type == BDFDB.DiscordConstants.ChannelTypes.GUILD_VOICE && (permString | BDFDB.DiscordConstants.Permissions.CONNECT) == permString);
				};
				
				let allowedRoles = [], allowedUsers = [], deniedRoles = [], deniedUsers = [], everyoneDenied = false;
				for (let id in channel.permissionOverwrites) {
					if ((channel.permissionOverwrites[id].type == BDFDB.DiscordConstants.PermissionOverrideType.ROLE || overrideTypes[channel.permissionOverwrites[id].type] == BDFDB.DiscordConstants.PermissionOverrideType.ROLE) && (guild.roles[id] && guild.roles[id].name != "@everyone") && checkPerm(channel.permissionOverwrites[id].allow)) {
						allowedRoles.push(Object.assign({overwritten: myMember && myMember.roles.includes(id) && !allowed}, guild.roles[id]));
					}
					else if ((channel.permissionOverwrites[id].type == BDFDB.DiscordConstants.PermissionOverrideType.MEMBER || overrideTypes[channel.permissionOverwrites[id].type] == BDFDB.DiscordConstants.PermissionOverrideType.MEMBER) && checkPerm(channel.permissionOverwrites[id].allow)) {
						addUser(id, allowedUsers);
					}
					if ((channel.permissionOverwrites[id].type == BDFDB.DiscordConstants.PermissionOverrideType.ROLE || overrideTypes[channel.permissionOverwrites[id].type] == BDFDB.DiscordConstants.PermissionOverrideType.ROLE) && checkPerm(channel.permissionOverwrites[id].deny)) {
						deniedRoles.push(guild.roles[id]);
						if (guild.roles[id] && guild.roles[id].name == "@everyone") everyoneDenied = true;
					}
					else if ((channel.permissionOverwrites[id].type == BDFDB.DiscordConstants.PermissionOverrideType.MEMBER || overrideTypes[channel.permissionOverwrites[id].type] == BDFDB.DiscordConstants.PermissionOverrideType.MEMBER) && checkPerm(channel.permissionOverwrites[id].den)) {
						addUser(id, deniedUsers);
					}
				}
				
				if (![].concat(allowedUsers, deniedUsers).find(user => user.id == guild.ownerId)) addUser(guild.ownerId, allowedUsers);
				for (let id in guild.roles) if ((guild.roles[id].permissions | BDFDB.DiscordConstants.Permissions.ADMINISTRATOR) == guild.roles[id].permissions && ![].concat(allowedRoles, deniedRoles).find(role => role.id == id)) allowedRoles.push(Object.assign({overwritten: myMember && myMember.roles.includes(id) && !allowed}, guild.roles[id]));
				if (allowed && !everyoneDenied) allowedRoles.push({name: "@everyone"});
				
				let allowedElements = [], deniedElements = [];
				for (let role of allowedRoles) allowedElements.push(BDFDB.ReactUtils.createElement(RoleRowComponent, {role: role, guildId: guild.id, channelId: channel.id}));
				for (let user of allowedUsers) allowedElements.push(BDFDB.ReactUtils.createElement(UserRowComponent, {user: user, guildId: guild.id, channelId: channel.id}));
				for (let role of deniedRoles) deniedElements.push(BDFDB.ReactUtils.createElement(RoleRowComponent, {role: role, guildId: guild.id, channelId: channel.id}));
				for (let user of deniedUsers) deniedElements.push(BDFDB.ReactUtils.createElement(UserRowComponent, {user: user, guildId: guild.id, channelId: channel.id}));

				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: BDFDB.LanguageUtils.LanguageStrings.CHANNEL + " " + BDFDB.LanguageUtils.LanguageStrings.ACCESSIBILITY,
					subHeader: "#" + channel.name,
					className: BDFDB.disCN._showhiddenchannelsaccessmodal,
					contentClassName: BDFDB.disCN.listscroller,
					onOpen: modalInstance => {if (modalInstance) accessModal = modalInstance;},
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							className: BDFDB.disCN.modalsubinner,
							tab: BDFDB.LanguageUtils.LanguageStrings.OVERLAY_SETTINGS_GENERAL_TAB,
							children: [{
									title: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_CHANNEL_NAME,
									text: channel.name
								}, channel.type == BDFDB.DiscordConstants.ChannelTypes.GUILD_VOICE ? {
									title: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_BITRATE,
									text: channel.bitrate || "---"
								} : {
									title: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_CHANNEL_TOPIC,
									text: channel.topic || "---"
								}, {
									title: BDFDB.LanguageUtils.LanguageStrings.CHANNEL_TYPE,
									text: BDFDB.LanguageUtils.LanguageStrings[typeNameMap[BDFDB.DiscordConstants.ChannelTypes[channel.type]]]
								}, {
									title: BDFDB.LanguageUtils.LanguageStrings.CATEGORY_NAME,
									text: category && category.name || BDFDB.LanguageUtils.LanguageStrings.NO_CATEGORY
								}].map((formLabel, i) => formLabel && [
									i == 0 ? null : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
										className: BDFDB.disCN.marginbottom20
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
										title: `${formLabel.title}:`,
										className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.marginbottom20, i == 0 && BDFDB.disCN.margintop8),
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormText, {
											className: BDFDB.disCN.marginleft8,
											children: formLabel.text
										})
									})
								]).flat(10).filter(n => n)
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_allowed,
							children: allowedElements.length ? allowedElements :
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MessagesPopoutComponents.EmptyStateBottom, {
									msg: BDFDB.LanguageUtils.LanguageStrings.AUTOCOMPLETE_NO_RESULTS_HEADER,
									image: lightTheme ? "/assets/9b0d90147f7fab54f00dd193fe7f85cd.svg" : "/assets/308e587f3a68412f137f7317206e92c2.svg"
								})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_denied,
							children: deniedElements.length ? deniedElements :
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MessagesPopoutComponents.EmptyStateBottom, {
									msg: BDFDB.LanguageUtils.LanguageStrings.AUTOCOMPLETE_NO_RESULTS_HEADER,
									image: lightTheme ? "/assets/9b0d90147f7fab54f00dd193fe7f85cd.svg" : "/assets/308e587f3a68412f137f7317206e92c2.svg"
								})
						})
					]
				});
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							context_hidehidden:					"Скриване на заключените канали",
							modal_allowed:						"Разрешено",
							modal_denied:						"Отрича се"
						};
					case "da":		// Danish
						return {
							context_hidehidden:					"Skjul låste kanaler",
							modal_allowed:						"Tilladt",
							modal_denied:						"Nægtet"
						};
					case "de":		// German
						return {
							context_hidehidden:					"Versteckte Kanäle ausblenden",
							modal_allowed:						"Erlaubt",
							modal_denied:						"Verweigert"
						};
					case "el":		// Greek
						return {
							context_hidehidden:					"Απόκρυψη κλειδωμένων καναλιών",
							modal_allowed:						"Επιτρεπόμενο",
							modal_denied:						"Απορρίφθηκε"
						};
					case "es":		// Spanish
						return {
							context_hidehidden:					"Ocultar canales bloqueados",
							modal_allowed:						"Permitido",
							modal_denied:						"Negado"
						};
					case "fi":		// Finnish
						return {
							context_hidehidden:					"Piilota lukitut kanavat",
							modal_allowed:						"Sallittu",
							modal_denied:						"Kielletty"
						};
					case "fr":		// French
						return {
							context_hidehidden:					"Masquer les chaînes verrouillées",
							modal_allowed:						"Permis",
							modal_denied:						"Refusé"
						};
					case "hr":		// Croatian
						return {
							context_hidehidden:					"Sakrij zaključane kanale",
							modal_allowed:						"Dopuštena",
							modal_denied:						"Odbijen"
						};
					case "hu":		// Hungarian
						return {
							context_hidehidden:					"Zárt csatornák elrejtése",
							modal_allowed:						"Megengedett",
							modal_denied:						"Megtagadva"
						};
					case "it":		// Italian
						return {
							context_hidehidden:					"Nascondi canali bloccati",
							modal_allowed:						"Consentito",
							modal_denied:						"Negato"
						};
					case "ja":		// Japanese
						return {
							context_hidehidden:					"ロックされたチャンネルを非表示にする",
							modal_allowed:						"許可",
							modal_denied:						"拒否されました"
						};
					case "ko":		// Korean
						return {
							context_hidehidden:					"잠긴 채널 숨기기",
							modal_allowed:						"허용됨",
							modal_denied:						"거부 됨"
						};
					case "lt":		// Lithuanian
						return {
							context_hidehidden:					"Slėpti užrakintus kanalus",
							modal_allowed:						"Leidžiama",
							modal_denied:						"Paneigta"
						};
					case "nl":		// Dutch
						return {
							context_hidehidden:					"Verberg vergrendelde kanalen",
							modal_allowed:						"Toegestaan",
							modal_denied:						"Geweigerd"
						};
					case "no":		// Norwegian
						return {
							context_hidehidden:					"Skjul låste kanaler",
							modal_allowed:						"Tillatt",
							modal_denied:						"Nektet"
						};
					case "pl":		// Polish
						return {
							context_hidehidden:					"Ukryj zablokowane kanały",
							modal_allowed:						"Dozwolony",
							modal_denied:						"Odmówiono"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							context_hidehidden:					"Ocultar canais bloqueados",
							modal_allowed:						"Permitido",
							modal_denied:						"Negado"
						};
					case "ro":		// Romanian
						return {
							context_hidehidden:					"Ascundeți canalele blocate",
							modal_allowed:						"Permis",
							modal_denied:						"Negat"
						};
					case "ru":		// Russian
						return {
							context_hidehidden:					"Скрыть заблокированные каналы",
							modal_allowed:						"Разрешенный",
							modal_denied:						"Отказано"
						};
					case "sv":		// Swedish
						return {
							context_hidehidden:					"Dölj låsta kanaler",
							modal_allowed:						"Tillåtet",
							modal_denied:						"Förnekad"
						};
					case "th":		// Thai
						return {
							context_hidehidden:					"ซ่อนช่องที่ถูกล็อก",
							modal_allowed:						"ได้รับอนุญาต",
							modal_denied:						"ถูกปฏิเสธ"
						};
					case "tr":		// Turkish
						return {
							context_hidehidden:					"Kilitli Kanalları Gizle",
							modal_allowed:						"İzin veriliyor",
							modal_denied:						"Reddedildi"
						};
					case "uk":		// Ukrainian
						return {
							context_hidehidden:					"Сховати заблоковані канали",
							modal_allowed:						"Дозволено",
							modal_denied:						"Заперечується"
						};
					case "vi":		// Vietnamese
						return {
							context_hidehidden:					"Ẩn các kênh đã khóa",
							modal_allowed:						"Được phép",
							modal_denied:						"Phủ định"
						};
					case "zh-CN":	// Chinese (China)
						return {
							context_hidehidden:					"隐藏锁定的频道",
							modal_allowed:						"允许的",
							modal_denied:						"被拒绝"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							context_hidehidden:					"隱藏鎖定的頻道",
							modal_allowed:						"允許的",
							modal_denied:						"被拒絕"
						};
					default:		// English
						return {
							context_hidehidden:					"Hide Locked Channels",
							modal_allowed:						"Permitted",
							modal_denied:						"Denied"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();