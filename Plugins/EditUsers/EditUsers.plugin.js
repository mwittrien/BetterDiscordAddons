/**
 * @name EditUsers
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 4.7.8
 * @description Allows you to locally edit Users
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditUsers/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/EditUsers/EditUsers.plugin.js
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
		var changedUsers = {};
		var appTitleObserver;
	
		return class EditUsers extends Plugin {
			onLoad () {
				this.defaults = {
					types: {
						servers:			{value: true, 		description: "Servers"},
						dms:				{value: true, 		description: "Direct Messages"},
					},
					places: {
						contextMenu:		{value: true, 		description: "User ContextMenu"},
						chatTextarea:		{value: true, 		description: "Chat Textarea"},
						chatWindow:			{value: true, 		description: "Messages"},
						reactions:			{value: true, 		description: "Reactions"},
						mentions:			{value: true, 		description: "Mentions"},
						memberList:			{value: true, 		description: "Member List"},
						voiceChat:			{value: true, 		description: "Voice Channels"},
						recentDms:			{value: true, 		description: "Direct Message Notifications"},
						dmsList:			{value: true, 		description: "Direct Message List"},
						dmHeader:			{value: true, 		description: "Direct Message Header"},
						dmCalls:			{value: true, 		description: "Calls/ScreenShares"},
						typing:				{value: true, 		description: "Typing List"},
						friendList:			{value: true, 		description: "Friend List"},
						inviteList:			{value: true, 		description: "Invite List"},
						activity:			{value: true, 		description: "Activity Page"},
						userPopout:			{value: true, 		description: "User Popouts"},
						userProfile:		{value: true, 		description: "User Profile Modal"},
						autocompletes:		{value: true, 		description: "Autocomplete Menu"},
						guildSettings:		{value: true, 		description: "Server Settings"},
						quickSwitcher:		{value: true, 		description: "Quick Switcher"},
						searchPopout:		{value: true, 		description: "Search Popout"},
						userAccount:		{value: true, 		description: "Your Account Information"},
						appTitle:			{value: true, 		description: "Discord App Title (DMs)"}
					}
				};
			
				this.modulePatches = {
					before: [
						"Account",
						"AuditLogEntry",
						"AutocompleteUserResult",
						"ChannelCall",
						"ChannelCallGrid",
						"ChannelCallVideoParticipants",
						"ChannelReply",
						"ChannelTextAreaEditor",
						"DirectMessageAddPopout",
						"GuildBans",
						"GuildEmojis",
						"GuildInvitationRow",
						"GuildInvites",
						"GuildMemberEntry",
						"HeaderBarContainer",
						"MemberListItem",
						"Message",
						"MessageContent",
						"MessageHeader",
						"NowPlayingItem",
						"PictureInPictureVideo",
						"PrivateChannel",
						"QuickSwitcher",
						"QuickSwitchUserResult",
						"RTCConnectionVoiceUsers",
						"SearchPopoutOption",
						"ThreadMessageAccessoryMessage",
						"UserBanner",
						"UserBannerMask",
						"UserInfo",
						"UsernameSection",
						"UserPopoutAvatar",
						"UserProfile",
						"UserProfileHeader",
						"UserProfileUsername",
						"UserSummaryItem",
						"VoiceUser"
					],
					after: [
						"Account",
						"AuditLogs",
						"AutocompleteUserResult",
						"ChannelCallHeader",
						"ChannelReply",
						"ChannelEmptyMessages",
						"DirectMessage",
						"DirectMessageAddPopoutRow",
						"DiscordTag",
						"GuildInvitationRow",
						"IncomingCallModal",
						"MemberListItem",
						"Mention",
						"MessageContent",
						"MessageUsername",
						"NameTag",
						"ParticipantsForSelectedParticipant",
						"PrivateChannel",
						"QuickSwitchUserResult",
						"RTCConnection",
						"Reactor",
						"RichUserMention",
						"SearchPopoutOption",
						"ThreadCardDescription",
						"ThreadEmptyMessageAuthor",
						"TypingUsers",
						"UserMention",
						"UsernameSection",
						"UserProfileMutualFriends",
						"VoiceUser"
					]
				};
				
				this.patchPriority = 3;
				
				this.css = `
					${BDFDB.dotCN.messageavatar} {
						background-size: cover;
						object-fit: cover;
					}
					${BDFDB.dotCNS.chat + BDFDB.dotCN.messageusername}:hover > span[style*="color"],
					${BDFDB.dotCN.voicedetailschannel}:hover > span[style*="color"],
					${BDFDB.dotCN.messageswelcomethreadcreator}:hover > span[style*="color"] {
						text-decoration: underline;
					}
					${BDFDB.dotCNS.dmchannel + BDFDB.dotCN.bottag} {
						margin-left: 4px;
					}
					${BDFDB.dotCNS.peoplesuser + BDFDB.dotCN.peoplesdiscriminator} {
						display: none;
					}
					${BDFDB.dotCNS.peoplesuserhovered + BDFDB.dotCN.peoplesdiscriminator} {
						display: block;
					}
					${BDFDB.dotCN.messagemarkup} span[style*="linear-gradient"] code.inline,
					${BDFDB.dotCN.messagemarkup} span[style*="linear-gradient"] blockquote,
					${BDFDB.dotCN.messagemarkup} span[style*="linear-gradient"] ${BDFDB.dotCN.spoilertext} {
						color: var(--text-normal);
					}
					${BDFDB.dotCN.mention}[style*="--edited-mention-color"] {
						background-color: rgba(var(--edited-mention-color), .1) !important;
						color: rgb(var(--edited-mention-color)) !important;
					}
					${BDFDB.dotCN.mention + BDFDB.dotCN.mentioninteractive}[style*="--edited-mention-color"]:hover {
						background-color: rgba(var(--edited-mention-color), .3) !important;
						color: rgb(var(--edited-mention-color)) !important;
					}
				`;
			}
			
			onStart () {
				appTitleObserver = new MutationObserver(_ => this.changeAppTitle());
				appTitleObserver.observe(document.head.querySelector("title"), {childList: true});
			
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.UserNameUtils, "getName", {after: e => {
					if (e.methodArguments[2] && changedUsers[e.methodArguments[2].id] && changedUsers[e.methodArguments[2].id].name) return changedUsers[e.methodArguments[2].id].name;
				}});
			
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryStores.StageChannelParticipantStore, "getMutableParticipants", {after: e => {
					if (BDFDB.ArrayUtils.is(e.returnValue)) for (let i in e.returnValue) {
						if (e.returnValue[i] && e.returnValue[i].user && changedUsers[e.returnValue[i].user.id]) e.returnValue[i] = Object.assign({}, e.returnValue[i], {user: this.getUserData(e.returnValue[i].user.id)});
					}
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MessageAuthorUtils, ["getAuthor", "getMessageAuthor"], {after: e => {
					if (!this.settings.places.chatWindow || !e.methodArguments[0] || !e.methodArguments[0].author || !changedUsers[e.methodArguments[0].author.id] || !this.shouldChangeInChat(e.methodArguments[0].channel_id)) return;
					let data = changedUsers[e.methodArguments[0].author.id];
					if (!data) return;
					let member = BDFDB.LibraryStores.GuildMemberStore.getMember((BDFDB.LibraryStores.ChannelStore.getChannel(e.methodArguments[0].channel_id) || {}).guild_id, e.methodArguments[0].author.id);
					let color1 = data.color1 && data.useRoleColor && member && member.colorString || data.color1;
					color1 = color1 && BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
					e.returnValue = Object.assign({}, e.returnValue, {
						nick: this.getUserNick(e.methodArguments[0].author.id, member && member.nick) || e.returnValue.nick,
						guildMemberAvatar: (data.removeIcon || data.url) ? null : e.returnValue.guildMemberAvatar,
						colorString: color1 || e.returnValue.colorString
					});
				}});

				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.QuerySearchUtils, ["queryDMUsers", "queryFriends"], {after: e => {
					if (!e.methodArguments[0].query) return;
					for (let id in changedUsers) if (changedUsers[id] && changedUsers[id].name && changedUsers[id].name.toLocaleLowerCase().indexOf(e.methodArguments[0].query.toLocaleLowerCase()) > -1 && !e.returnValue.find(n => n.record && n.record.id == id && n.type == BDFDB.DiscordConstants.AutocompleterResultTypes.USER)) {
						let user = BDFDB.LibraryStores.UserStore.getUser(id);
						if (user) e.returnValue.push({
							comparator: user.username,
							record: user,
							score: 10,
							sortable: user.username.toLocaleLowerCase(),
							type: BDFDB.DiscordConstants.AutocompleterResultTypes.USER
						});
					}
				}});
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.QuerySearchUtils, "queryGuildUsers", {after: e => {
					if (!e.methodArguments[0].query) return;
					for (let id in changedUsers) if (changedUsers[id] && changedUsers[id].name && changedUsers[id].name.toLocaleLowerCase().indexOf(e.methodArguments[0].query.toLocaleLowerCase()) > -1 && !e.returnValue.find(n => n.record && n.record.id == id && n.type == BDFDB.DiscordConstants.AutocompleterResultTypes.USER)) {
						let user = BDFDB.LibraryStores.UserStore.getUser(id);
						let member = user && e.methodArguments[0].guildId && BDFDB.LibraryStores.GuildMemberStore.getMember(e.methodArguments[0].guildId, id);
						if (user) e.returnValue.push({
							comparator: member && member.nick ? member.nick.toLocaleLowerCase() : user.username.toLocaleLowerCase(),
							record: user,
							score: 0,
							type: BDFDB.DiscordConstants.AutocompleterResultTypes.USER
						});
					}
				}});
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.QuerySearchUtils, "queryChannelUsers", {after: e => {
					if (!e.methodArguments[0].query) return;
					for (let id in changedUsers) if (changedUsers[id] && changedUsers[id].name && changedUsers[id].name.toLocaleLowerCase().indexOf(e.methodArguments[0].query.toLocaleLowerCase()) > -1 && !e.returnValue.find(n => n.record && n.record.id == id && n.type == BDFDB.DiscordConstants.AutocompleterResultTypes.USER)) {
						let user = BDFDB.LibraryStores.UserStore.getUser(id);
						let member = user && e.methodArguments[0].channelId && BDFDB.LibraryStores.GuildMemberStore.getMember((BDFDB.LibraryStores.ChannelStore.getChannel(e.methodArguments[0].channelId) || {}).guild_id, id);
						if (user) e.returnValue.push({
							comparator: member && member.nick ? member.nick.toLocaleLowerCase() : user.username.toLocaleLowerCase(),
							record: user,
							score: 0,
							type: BDFDB.DiscordConstants.AutocompleterResultTypes.USER
						});
					}
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.IconUtils, "getUserBannerURL", {instead: e => {
					let data = changedUsers[e.methodArguments[0].id];
					if (data) {
						if (data.removeBanner) return null;
						else if (data.banner) return data.banner;
					}
					return e.callOriginalMethod();
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MemberDisplayUtils, "getUserProfile", {after: e => {
					if (!e.returnValue || !changedUsers[e.methodArguments[0]] || !changedUsers[e.methodArguments[0]].color5 && !changedUsers[e.methodArguments[0]].color6 && !changedUsers[e.methodArguments[0]].color7) return;
					let newProfileObject = {};
					for (let key in e.returnValue) newProfileObject[key] = e.returnValue[key];
					for (let key of Reflect.ownKeys(e.returnValue.constructor.prototype)) if (!newProfileObject[key] && e.returnValue[key] !== undefined) newProfileObject[key] = e.returnValue[key];
					if (changedUsers[e.methodArguments[0]].color5) newProfileObject.primaryColor = newProfileObject.accentColor = BDFDB.ColorUtils.convert(changedUsers[e.methodArguments[0]].color5, "INT");
					if (changedUsers[e.methodArguments[0]].color6 || changedUsers[e.methodArguments[0]].color7) {
						let isLightTheme = BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themelight;
						newProfileObject.themeColors = [
							BDFDB.ColorUtils.convert(changedUsers[e.methodArguments[0]].color6 || (isLightTheme ? "#FFF" : "#000"), "INT"),
							BDFDB.ColorUtils.convert(changedUsers[e.methodArguments[0]].color7 || (isLightTheme ? "#FFF" : "#000"), "INT")
						];
						newProfileObject.canEditThemes = true;
					}
					return newProfileObject;
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryStores.PresenceStore, "findActivity", {after: e => {
					let data = changedUsers[e.methodArguments[0]];
					if (data && (data.removeStatus || data.status || data.statusEmoji) && (e.returnValue && e.returnValue.type === BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS || !e.returnValue && e.methodArguments[1] && e.methodArguments[1].toString().indexOf("type===") > -1 && e.methodArguments[1].toString().indexOf("CUSTOM_STATUS") > -1)) return this.createCustomStatus(changedUsers[e.methodArguments[0]]);
				}});
				
				this.forceUpdateAll();
			}
			
			onStop () {
				if (appTitleObserver) appTitleObserver.disconnect();
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Change Users in:",
							children: Object.keys(this.defaults.places).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["places", key],
								label: this.defaults.places[key].description,
								value: this.settings.places[key]
							}))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Change Users in the Chat Window (Messages, Reactions, Mentions, etc.) in:",
							children: Object.keys(this.defaults.types).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["types", key],
								label: this.defaults.types[key].description,
								value: this.settings.types[key]
							}))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsLabel, {
							label: "Changed Users:"
						}));
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Button",
							color: BDFDB.LibraryComponents.Button.Colors.RED,
							label: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
								children: !Object.keys(changedUsers).length ? BDFDB.LanguageUtils.LanguageStrings.NONE : Object.keys(changedUsers).filter(BDFDB.LibraryStores.UserStore.getUser).map(id => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
									text: this.getUserData(id).username,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Avatars.Avatar, {
										className: BDFDB.disCN.listavatar,
										src: this.getUserAvatar(id),
										size: BDFDB.LibraryComponents.AvatarConstants.Sizes.SIZE_32,
										onClick: _ => this.openUserSettingsModal(BDFDB.LibraryStores.UserStore.getUser(id))
									})
								}))
							}),
							onClick: _ => {
								BDFDB.ModalUtils.confirm(this, this.labels.confirm_resetall, _ => {
									BDFDB.DataUtils.remove(this, "users");
									BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
									this.forceUpdateAll();
								});
							},
							children: BDFDB.LanguageUtils.LanguageStrings.RESET
						}));
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				changedUsers = BDFDB.DataUtils.load(this, "users");
				
				this.changeAppTitle();
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.DiscordUtils.rerenderAll();
			}
		
			onUserContextMenu (e) {
				if (e.instance.props.channel && e.instance.props.channel.isDM()) {
					const user = BDFDB.LibraryStores.UserStore.getUser(e.instance.props.channel.getRecipientId());
					if (user && this.settings.places.contextMenu) {
						let userName = this.getUserData(user.id).username;
						if (userName != user.username) {
							let [muteChildren, muteIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "mute-channel"});
							if (muteIndex > -1) muteChildren[muteIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("MUTE_CHANNEL", `@${userName}`);
							let [unmuteChildren, unmuteIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "unmute-channel"});
							if (unmuteIndex > -1) unmuteChildren[unmuteIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("UNMUTE_CHANNEL", `@${userName}`);
						}
					}
				}
				if (e.instance.props.user) {
					if (this.settings.places.contextMenu) {
						let userName = this.getUserData(e.instance.props.user.id).username;
						if (userName != e.instance.props.user.username) {
							let [timeoutChildren, timeoutIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "timeout"});
							if (timeoutIndex > -1) timeoutChildren[timeoutIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("DISABLE_GUILD_COMMUNICATION_FOR_USER", userName);
							let [removeTimeoutChildren, removeTimeoutIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "removetimeout"});
							if (removeTimeoutIndex > -1) removeTimeoutChildren[removeTimeoutIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("ENABLE_GUILD_COMMUNICATION_FOR_USER", userName);
							let [kickChildren, kickIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "kick"});
							if (kickIndex > -1) kickChildren[kickIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("KICK_USER", userName);
							let [banChildren, banIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "ban"});
							if (banIndex > -1) banChildren[banIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("BAN_USER", userName);
						}
					}
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
					children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_localusersettings,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-submenu"),
							children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
								children: [
									BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
										label: this.labels.submenu_usersettings,
										id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-change"),
										action: _ => this.openUserSettingsModal(e.instance.props.user)
									}),
									BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
										label: this.labels.submenu_resetsettings,
										id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-reset"),
										color: BDFDB.DiscordConstants.MenuItemColors.DANGER,
										disabled: !changedUsers[e.instance.props.user.id],
										action: event => {
											let remove = _ => {
												BDFDB.DataUtils.remove(this, "users", e.instance.props.user.id);
												this.forceUpdateAll(true);
											};
											if (event.shiftKey) remove();
											else BDFDB.ModalUtils.confirm(this, this.labels.confirm_reset, remove);
										}
									})
								]
							})
						})
					}));
				}
			}
			
			processChannelTextAreaEditor (e) {
				if (!e.instance.props.disabled && e.instance.props.channel && e.instance.props.channel.isDM() && (e.instance.props.type == BDFDB.DiscordConstants.ChannelTextAreaTypes.NORMAL || e.instance.props.type == BDFDB.DiscordConstants.ChannelTextAreaTypes.NORMAL_WITH_ACTIVITY) && this.settings.places.chatTextarea) {
					let user = BDFDB.LibraryStores.UserStore.getUser(e.instance.props.channel.recipients[0]);
					if (user) e.instance.props.placeholder = BDFDB.LanguageUtils.LanguageStringsFormat("TEXTAREA_PLACEHOLDER", `@${changedUsers[user.id] && changedUsers[user.id].name || user.username}`);
				}
			}

			processAutocompleteUserResult (e) {
				if (!this.settings.places.autocompletes || !e.instance.props.user) return;
				if (!e.returnvalue) {
					e.instance.props.user = this.getUserData(e.instance.props.user.id);
					let data = changedUsers[e.instance.props.user.id];
					if (data && data.name) e.instance.props.nick = data.name;
				}
				else {
					if (typeof e.returnvalue.props.children == "function") {
						let childrenRender = e.returnvalue.props.children;
						e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
							let children = childrenRender(...args);
							let userName = BDFDB.ReactUtils.findChild(children, {name: "AutocompleteRowContentPrimary"});
							if (userName) this.changeUserColor(userName.props.children, e.instance.props.user.id);
							return children;
						}, "Error in Children Render of AutocompleteUserResult!", this);
					}
				}
			}

			processHeaderBarContainer (e) {
				if (!this.settings.places.dmHeader) return;
				let channel = BDFDB.LibraryStores.ChannelStore.getChannel(e.instance.props.channelId);
				if (!channel || !channel.isDM()) return;
				let userName = BDFDB.ReactUtils.findChild(e.instance, {props: [["className", BDFDB.disCN.channelheadercursorpointer]]});
				if (!userName) return;
				let recipientId = channel.getRecipientId();
				userName.props.children = this.getUserData(recipientId).username;
				this.changeUserColor(userName, recipientId);
			}

			processChannelCallHeader (e) {
				if (!this.settings.places.dmHeader || !e.instance.props.channel || !e.instance.props.channel.isDM()) return;
				let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "HeaderBarTitle"});
				if (!userName) return;
				let recipientId = e.instance.props.channel.getRecipientId();
				if (!changedUsers[recipientId]) return;
				userName.props.children = this.getUserData(recipientId).username;
				this.changeUserColor(userName, recipientId);
			}
			
			processDiscordTag (e) {
				this.processNameTag(e);
			}
			
			processNameTag (e) {
				if (!e.returnvalue || !e.instance.props.user || !changedUsers[e.instance.props.user.id] || !e.instance.props.className && !e.instance.props.usernameClass) return;
				let change = false, guildId = null;
				let tagClass = "";
				if (e.instance.props.className) {
					if (e.instance.props.className.indexOf(BDFDB.disCN.userpopoutheadertagnonickname) > -1) {
						change = this.settings.places.userPopout;
						guildId = BDFDB.LibraryStores.SelectedGuildStore.getGuildId();
						tagClass = BDFDB.disCNS.userpopoutheaderbottag + BDFDB.disCN.bottagnametag;
					}
					else if (e.instance.props.className.indexOf(BDFDB.disCN.guildsettingsinviteusername) > -1) {
						change = this.settings.places.guildSettings;
					}
					else if (e.instance.props.className.indexOf(BDFDB.disCN.peoplesdiscordtag) > -1) {
						change = this.settings.places.friendList;
						tagClass = BDFDB.disCN.bottagnametag;
					}
				}
				if (e.instance.props.usernameClass) {
					if (e.instance.props.usernameClass.indexOf(BDFDB.disCN.userprofileusername) > -1) {
						change = this.settings.places.userProfile;
						guildId = BDFDB.LibraryStores.SelectedGuildStore.getGuildId();
						tagClass = BDFDB.disCN.bottagnametag;
					}
				}
				if (!change) return;
				let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.username]]});
				if (userName) this.changeUserColor(userName, e.instance.props.user.id);
				if (tagClass) this.injectBadge(e.returnvalue.props.children, e.instance.props.user.id, guildId, 2, {
					tagClass: tagClass,
					useRem: e.instance.props.useRemSizes,
					inverted: e.instance.props.invertBotTagColor
				});
			}

			processUserBanner (e) {
				if (!e.instance.props.user || !changedUsers[e.instance.props.user.id]) return;
				if (changedUsers[e.instance.props.user.id].removeBanner) {
					e.instance.props.bannerSrc = null;
					if (e.instance.props.displayProfile) e.instance.props.displayProfile.banner = null;
				}
				else if (changedUsers[e.instance.props.user.id].banner) {
					e.instance.props.bannerSrc = changedUsers[e.instance.props.user.id].banner;
					if (e.instance.props.displayProfile) e.instance.props.displayProfile.banner = changedUsers[e.instance.props.user.id].banner;
				}
			}

			processUserBannerMask (e) {
				if (!e.instance.props.user || !changedUsers[e.instance.props.user.id]) return;
				if (changedUsers[e.instance.props.user.id].removeBanner) e.instance.props.isPremium = false;
				else if (changedUsers[e.instance.props.user.id].banner) e.instance.props.isPremium = true;
			}
			
			processUserPopoutAvatar (e) {
				if (!e.instance.props.user || !changedUsers[e.instance.props.user.id]) return;
				if (this.settings.places.userPopout) e.instance.props.user = this.getUserData(e.instance.props.user.id, true, true);
				if (e.instance.props.displayProfile) {
					if (changedUsers[e.instance.props.user.id].removeBanner) {
						e.instance.props.hasBanner = false;
						e.instance.props.displayProfile.banner = null;
					}
					else if (changedUsers[e.instance.props.user.id].banner) {
						e.instance.props.hasBanner = true;
						e.instance.props.displayProfile.banner = changedUsers[e.instance.props.user.id].banner;
					}
				}
			}
			
			processUsernameSection (e) {
				if (!this.settings.places.userPopout || !e.instance.props.user) return;
				let data = changedUsers[e.instance.props.user.id];
				if (!data) return;
				if (!e.returnvalue) {
					let nickname = this.getUserNick(e.instance.props.user.id, e.instance.props.nickname);
					e.instance.props.nickname = nickname ? nickname : null;
				}
				else {
					if (data.color1 || data.tag) {
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.userpopoutheadernickname]]});
						if (index > -1) {
							this.changeUserColor(children[index], e.instance.props.user.id);
							if (!BDFDB.ArrayUtils.is(children[index].props.children)) children[index].props.children = [children[index].props.children].flat(10);
							this.injectBadge(children[index].props.children, e.instance.props.user.id, BDFDB.LibraryStores.SelectedGuildStore.getGuildId(), 2, {
								tagClass: BDFDB.disCNS.userpopoutheaderbottag + BDFDB.disCN.bottagnametag,
								inverted: typeof e.instance.getMode == "function" && e.instance.getMode() !== "Normal"
							});
						}
					}
				}
			}

			processUserProfile (e) {
				if (e.instance.props.user && this.settings.places.userProfile) e.instance.props.user = this.getUserData(e.instance.props.user.id);
			}

			processUserProfileHeader (e) {
				if (e.instance.props.user && this.settings.places.userProfile) e.instance.props.user = this.getUserData(e.instance.props.user.id);
			}

			processUserProfileUsername (e) {
				if (e.instance.props.user && this.settings.places.userProfile) e.instance.props.user = this.getUserData(e.instance.props.user.id);
			}

			processUserProfileMutualFriends (e) {
				if (!this.settings.places.userProfile || !e.returnvalue.props.children || !e.returnvalue.props.children.length) return;
				for (let row of e.returnvalue.props.children) if (row && row.props && row.props.user) row.props.user = this.getUserData(row.props.user.id);
			}

			processUserInfo (e) {
				if (!this.settings.places.friendList || !e.instance.props.user) return;
				e.instance.props.user = this.getUserData(e.instance.props.user.id);
				if (BDFDB.ReactUtils.isValidElement(e.instance.props.subText)) {
					let data = changedUsers[e.instance.props.user.id];
					if (data && (data.removeStatus || data.status || data.statusEmoji)) {
						e.instance.props.subText.props.activities = [].concat(e.instance.props.subText.props.activities).filter(n => n && n.type != BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS);
						let activity = this.createCustomStatus(data);
						if (activity) e.instance.props.subText.props.activities.unshift(activity);
					}
				}
			}

			processNowPlayingItem (e) {
				if (!this.settings.places.activity) return;
				let [children, index] = BDFDB.ReactUtils.findParent(e.instance, {name: "NowPlayingHeader"});
				if (index > -1) for (let child of children) if (child && child.props && child.props.party) {
					child.props.party = Object.assign({}, child.props.party);
					if (child.props.party.partiedMembers) for (let i in child.props.party.partiedMembers) if (child.props.party.partiedMembers[i]) child.props.party.partiedMembers[i] = this.getUserData(child.props.party.partiedMembers[i].id);
					if (child.props.party.priorityMembers) for (let i in child.props.party.priorityMembers) if (child.props.party.priorityMembers[i]) child.props.party.priorityMembers[i] = Object.assign({}, child.props.party.priorityMembers[i], {user: this.getUserData(child.props.party.priorityMembers[i].user.id)});
					if (child.props.party.voiceChannels) for (let i in child.props.party.voiceChannels) if (child.props.party.voiceChannels[i]) child.props.party.voiceChannels[i] = Object.assign({}, child.props.party.voiceChannels[i], {members: [].concat(child.props.party.voiceChannels[i].members).map(user => this.getUserData(user.id))});
					if (child == children[index]) {
						const type = child.type;
						child.type = BDFDB.TimeUtils.suppress((...args) => {
							const returnValue = type(...args);
							if (BDFDB.ObjectUtils.get(returnValue, "props.priorityUser.user.username") == returnValue.props.title) {
								returnValue.props.title = BDFDB.ReactUtils.createElement("span", {children: returnValue.props.title});
								this.changeUserColor(returnValue.props.title, returnValue.props.priorityUser.user.id);
							}
							return returnValue;
						}, "Error in Type Render of NowPlayingHeader!", this);
					}
				}
			}
			
			processVoiceUser (e) {
				if (!this.settings.places.voiceChat || !e.instance.props.user) return;
				if (!e.returnvalue) {
					e.instance.props.user = this.getUserData(e.instance.props.user.id);
					let data = changedUsers[e.instance.props.user.id];
					if (data && data.name) {
						let member = BDFDB.LibraryStores.GuildMemberStore.getMember(BDFDB.LibraryStores.SelectedGuildStore.getGuildId(), e.instance.props.user.id);
						e.instance.props.nick = this.getUserNick(e.instance.props.user.id, e.instance.props.nick) || e.instance.props.nick;
					}
				}
				else {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.voicename]]});
					if (userName) this.changeUserColor(userName, e.instance.props.user.id, {modify: e.instance.props});
				}
			}
			
			processRTCConnection (e) {
				if (!this.settings.places.voiceChat || !e.instance.props.channel || !e.instance.props.channel.isDM() || typeof e.returnvalue.props.children != "function") return;
				let recipientId = e.instance.props.channel.getRecipientId();
				let renderChildren = e.returnvalue.props.children;
				e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
					let renderedChildren = renderChildren(...args);
					let userName = BDFDB.ReactUtils.findChild(renderedChildren, {props: [["className", BDFDB.disCN.voicedetailschannel]]});
					if (userName) {
						userName.props.children = "@" + this.getUserData(recipientId).username;
						this.changeUserColor(userName, recipientId);
					}
					return renderedChildren;
				}, "Error in Children Render of RTCConnection!", this);
			}

			processRTCConnectionVoiceUsers (e) {
				if (!this.settings.places.voiceChat || !e.instance.props.voiceStates) return;
				for (let i in e.instance.props.voiceStates) {
					let data = changedUsers[e.instance.props.voiceStates[i].user.id];
					if (data) {
						e.instance.props.voiceStates[i] = Object.assign({}, e.instance.props.voiceStates[i]);
						e.instance.props.voiceStates[i].user = this.getUserData(e.instance.props.voiceStates[i].user.id);
						e.instance.props.voiceStates[i].nick = this.getUserNick(e.instance.props.voiceStates[i].user.id, e.instance.props.voiceStates[i].member && e.instance.props.voiceStates[i].member.nick) || e.instance.props.voiceStates[i].nick;
					}
				}
			}
			
			processAccount (e) {
				if (!this.settings.places.userAccount || !e.instance.props.currentUser || !changedUsers[e.instance.props.currentUser.id]) return;
				if (!e.returnvalue) {
					e.instance.props.currentUser = this.getUserData(e.instance.props.currentUser.id);
					let data = changedUsers[e.instance.props.currentUser.id];
					if (data && (data.removeStatus || data.status || data.statusEmoji)) e.instance.props.customStatusActivity = this.createCustomStatus(data);
				}
				else {
					let accountButton = BDFDB.ReactUtils.findChild(e.returnvalue, {props: ["contentTypes"]});
					if (accountButton) {
						const renderChildren = accountButton.props.children;
						accountButton.props.children = BDFDB.TimeUtils.suppress((...args) => {
							const returnValue = renderChildren(...args);
							const renderChildren2 = returnValue.props.children.props.children;
							returnValue.props.children.props.children = BDFDB.TimeUtils.suppress((...args2) => {
								const returnValue2 = renderChildren2(...args2);
								let userName = BDFDB.ReactUtils.findChild(returnValue2, {props: [["className", BDFDB.disCN.accountinfodetails]]});
								if (userName) this.changeUserColor(userName.props.children, e.instance.props.currentUser.id);
								return returnValue2;
							}, "Error in Children Render of Account Button Children!", this);
							return returnValue;
						}, "Error in Children Render of Account Button!", this);
					}
				}
			}

			processPanelTitle (e) {
				if (!this.settings.places.userAccount || !changedUsers[BDFDB.UserUtils.me.id] || !changedUsers[BDFDB.UserUtils.me.id].color1) return;
				let user = this.getUserData(BDFDB.UserUtils.me.id);
				if (user && e.instance.props.children == user.username) this.changeUserColor(e.returnvalue, BDFDB.UserUtils.me.id);
			}

			processChannelEmptyMessages (e) {
				if (!this.settings.places.chatWindow || !e.instance.props.channel || !e.instance.props.channel.isDM()) return;
				let recipientId = e.instance.props.channel.getRecipientId();
				if (!recipientId || !changedUsers[recipientId]) return;
				const type = e.returnvalue.type;
				e.returnvalue.type = BDFDB.TimeUtils.suppress((...args) => {
					const returnValue = type(...args);
					let name = this.getUserData(recipientId).username;
					if (returnValue.props.children[0]) returnValue.props.children[0].props.src = this.getUserAvatar(recipientId);
					if (returnValue.props.children[1]) {
						returnValue.props.children[1].props.children = BDFDB.ReactUtils.createElement("span", {children: name});
						this.changeUserColor(returnValue.props.children[1].props.children, recipientId);
					}
					let userName = BDFDB.ReactUtils.findChild(returnValue.props.children[2], {type: "strong"});
					if (userName) {
						userName.props.children = "@" + name;
						this.changeUserColor(userName, recipientId);
					}
					return returnValue;
				}, "Error in Type Render of ChannelEmptyMessages!", this);
			}
			
			processThreadEmptyMessageAuthor (e) {
				if (!this.settings.places.chatWindow || !e.instance.props.userId || !changedUsers[e.instance.props.userId]) return;
				const data = changedUsers[e.instance.props.userId];
				const renderChildren = e.returnvalue.props.children;
				e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
					const returnValue = renderChildren(...args);
					returnValue.props.children.props.name = BDFDB.ReactUtils.createElement("span", {
						children: this.getUserData(e.instance.props.userId).username
					});
					this.changeUserColor(returnValue.props.children.props.name, e.instance.props.userId);
					returnValue.props.children.props.color = data.color1 && (data.useRoleColor && returnValue.props.children.props.color || BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data.color1) ? data.color1[0] : data.color1, "HEX")) || returnValue.props.children.props.color;
					return returnValue;
				}, "Error in Children Render of ThreadEmptyMessageAuthor!", this);
			}
			
			processMessage (e) {
				if (!this.settings.places.chatWindow) return;
				let header = e.instance.props.childrenHeader;
				if (header && header.props && header.props.message && this.shouldChangeInChat(header.props.message.channel_id)) {
					let data = changedUsers[header.props.message.author.id];
					if (data) {
						let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryStores.GuildMemberStore.getMember((BDFDB.LibraryStores.ChannelStore.getChannel(header.props.message.channel_id) || {}).guild_id, header.props.message.author.id) || {}).colorString || data.color1;
						let message = new BDFDB.DiscordObjects.Message(Object.assign({}, header.props.message, {author: this.getUserData(header.props.message.author.id, true, false, header.props.message.author)}));
						if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
						header.props.message = message;
					}
				}
				let content = e.instance.props.childrenMessageContent;
				if (content && content.type && content.type.type && content.props.message && this.shouldChangeInChat(content.props.message.channel_id)) {
					let data = changedUsers[content.props.message.author.id];
					if (data) {
						let messageColor = data.color2 || (BDFDB.ObjectUtils.get(BDFDB.BDUtils.getPlugin("BetterRoleColors", true), "settings.modules.chat") && (data.color1 && data.useRoleColor && (BDFDB.LibraryStores.GuildMemberStore.getMember((BDFDB.LibraryStores.ChannelStore.getChannel(content.props.message.channel_id) || {}).guild_id, content.props.message.author.id) || {}).colorString || data.color1));
						if (messageColor) {
							let message = new BDFDB.DiscordObjects.Message(Object.assign({}, content.props.message, {author: this.getUserData(content.props.message.author.id, true, false, content.props.message.author)}));
							message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(messageColor) ? messageColor[0] : messageColor, "HEX");
							content.props.message = message;
						}
					}
				}
				let repliedMessage = e.instance.props.childrenRepliedMessage;
				if (repliedMessage && repliedMessage.props && repliedMessage.props.children && repliedMessage.props.children.props && repliedMessage.props.children.props.referencedMessage && repliedMessage.props.children.props.referencedMessage.message && this.shouldChangeInChat(repliedMessage.props.children.props.referencedMessage.message.channel_id)) {
					let referenceMessage = repliedMessage.props.children.props.referencedMessage.message;
					let data = changedUsers[referenceMessage.author.id];
					if (data) {
						let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryStores.GuildMemberStore.getMember((BDFDB.LibraryStores.ChannelStore.getChannel(referenceMessage.channel_id) || {}).guild_id, header.props.message.author.id) || {}).colorString || data.color1;
						let message = new BDFDB.DiscordObjects.Message(Object.assign({}, referenceMessage, {author: this.getUserData(referenceMessage.author.id, true, false, referenceMessage.author)}));
						if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
						repliedMessage.props.children.props.referencedMessage = Object.assign({}, repliedMessage.props.children.props.referencedMessage, {message: message});
					}
				}
			}
			
			processMessageHeader (e) {
				if (!this.settings.places.chatWindow || !e.instance.props.message || !this.shouldChangeInChat(e.instance.props.message.channel_id)) return;
				const author = e.instance.props.userOverride || e.instance.props.message.author;
				let data = changedUsers[author.id];
				if (!data) return;
				let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryStores.GuildMemberStore.getMember((BDFDB.LibraryStores.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, author.id) || {}).colorString || data.color1;
				color1 = color1 && BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
				if (e.instance.props.userOverride) e.instance.props.userOverride = this.getUserData(author.id)
				else {
					let message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.message, {author: this.getUserData(author.id, true, false, author)}));
					if (color1) message.colorString = color1;
					e.instance.props.message = message;
				}
			}
			
			processMessageUsername (e) {
				if (!this.settings.places.chatWindow || !e.instance.props.author || !this.shouldChangeInChat(e.instance.props.channel.id)) return;
				const author = e.instance.props.userOverride || e.instance.props.message.author;
				let data = changedUsers[author.id];
				if (!data) return;
				let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {filter: n => n && n.props && typeof n.props.renderPopout == "function"});
				if (userName) {
					let renderChildren = userName.props.children;
					userName.props.children = BDFDB.TimeUtils.suppress((...args) => {
						const returnValue = renderChildren(...args);
						this.changeUserColor(returnValue, author.id, {guildId: (BDFDB.LibraryStores.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id});
						return returnValue;
					}, "Error in Children Render of MessageUsername!", this);
				}
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {filter: n => n && n.props && typeof n.props.renderPopout == "function"});
				if (index > -1) this.injectBadge(children, author.id, (BDFDB.LibraryStores.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, e.instance.props.compact ? index : (index + 1), {
					tagClass: e.instance.props.compact ? BDFDB.disCN.messagebottagcompact : BDFDB.disCN.messagebottagcozy,
					useRem: true
				});
			}
			
			processMessageContent (e) {
				if (!this.settings.places.chatWindow || !e.instance.props.message || !this.shouldChangeInChat(e.instance.props.message.channel_id)) return;
				if (!e.returnvalue) {
					if (!BDFDB.DiscordConstants.MessageTypeGroups.USER_MESSAGE.has(e.instance.props.message.type)) {
						let message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.message, {author: this.getUserData(e.instance.props.message.author.id, true, false, e.instance.props.message.author)}));
						let data = changedUsers[e.instance.props.message.author.id];
						if (data) {
							let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryStores.GuildMemberStore.getMember((BDFDB.LibraryStores.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, e.instance.props.message.author.id) || {}).colorString || data.color1;
							if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
						}
						e.instance.props.message = message;
						if (e.instance.props.children) e.instance.props.children.props.message = e.instance.props.message;
					}
				}
				else if (e.instance.props.message.state != BDFDB.DiscordConstants.MessageStates.SEND_FAILED) {
					let data = changedUsers[e.instance.props.message.author.id];
					let messageColor = data && (data.color2 || (BDFDB.ObjectUtils.get(BDFDB.BDUtils.getPlugin("BetterRoleColors", true), "settings.modules.chat") && (data.color1 && data.useRoleColor && (BDFDB.LibraryStores.GuildMemberStore.getMember((BDFDB.LibraryStores.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, e.instance.props.message.author.id) || {}).colorString || data.color1)));
					if (messageColor) {
						if (BDFDB.ObjectUtils.is(messageColor)) e.returnvalue.props.children = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
							gradient: BDFDB.ColorUtils.createGradient(messageColor),
							children: e.returnvalue.props.children
						});
						else e.returnvalue.props.children = BDFDB.ReactUtils.createElement("span", {
							style: Object.assign({}, e.returnvalue.props.style, {color: BDFDB.ColorUtils.convert(messageColor, "RGBA")}),
							children: e.returnvalue.props.children
						});
					}
				}
			}
			
			processThreadMessageAccessoryMessage (e) {
				if (!this.settings.places.chatWindow || !e.instance.props.message || !this.shouldChangeInChat(e.instance.props.message.channel_id)) return;
				e.instance.props.message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.message, {author: this.getUserData(e.instance.props.message.author.id)}));
			}
			
			processThreadCardDescription (e) {
				if (!this.settings.places.chatWindow || !e.instance.props.channel || !changedUsers[e.instance.props.channel.ownerId] || !this.shouldChangeInChat(e.instance.props.channel.id)) return;
				let ownerName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.threadcardstartedby]]});
				if (!ownerName) return;
				let data = changedUsers[e.instance.props.channel.ownerId];
				ownerName.props.name = this.getUserData(e.instance.props.channel.ownerId).username;
				ownerName.props.color = data.color1 && (data.useRoleColor && ownerName.props.color || BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data.color1) ? data.color1[0] : data.color1, "HEX")) || ownerName.props.color;
			}
			
			processReactor (e) {
				if (!this.settings.places.reactions || !e.instance.props.user || !changedUsers[e.instance.props.user.id] || !this.shouldChangeInChat(e.instance.props.channel.id)) return;
				let nickName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.messagereactionsmodalnickname]]});
				if (nickName) this.changeUserColor(nickName, e.instance.props.user.id);
				let avatar = BDFDB.ReactUtils.findChild(e.returnvalue, {props: ["size"]});
				if (avatar) avatar.props.user = this.getUserData(e.instance.props.user.id);
			}
			
			processUserMention (e) {
				if (!this.settings.places.mentions || !e.instance.props.userId || !changedUsers[e.instance.props.userId] || !this.shouldChangeInChat(e.instance.props.channelId)) return;
				if (typeof e.returnvalue.props.children == "function") {
					let renderChildren = e.returnvalue.props.children;
					e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let children = renderChildren(...args);
						this.changeMention(BDFDB.ReactUtils.findChild(children, {name: "Mention"}), changedUsers[e.instance.props.userId]);
						return children;
					}, "Error in Children Render of UserMention!", this);
				}
				else this.changeMention(BDFDB.ReactUtils.findChild(e.returnvalue, {name: "Mention"}), changedUsers[e.instance.props.userId]);
			}
			
			processRichUserMention (e) {
				if (!this.settings.places.mentions || !e.instance.props.id || !changedUsers[e.instance.props.id] || !this.shouldChangeInChat(e.instance.props.channel && e.instance.props.channel.id)) return;
				let data = changedUsers[e.instance.props.id];
				let tooltipChildren = BDFDB.ObjectUtils.get(e, "returnvalue.props.text.props.children");
				if (tooltipChildren) {
					if (tooltipChildren[0] && tooltipChildren[0].props && tooltipChildren[0].props.user) tooltipChildren[0].props.user = this.getUserData(tooltipChildren[0].props.user.id);
					if (data.name && typeof tooltipChildren[1] == "string") tooltipChildren[1] = data.name;
				}
				if (!data.name && !data.color1) return;
				if (typeof e.returnvalue.props.children == "function") {
					let renderChildren = e.returnvalue.props.children;
					e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let children = renderChildren(...args);
						this.changeMention(children, data);
						return children;
					}, "Error in Children Render of RichUserMention!", this);
				}
				else this.changeMention(e.returnvalue, data);
			}
			
			changeMention (mention, data) {
				if (!mention) return;
				if (data.name) {
					const changeMentionName = (child, name) => {
						if (!child) return;
						if (BDFDB.ArrayUtils.is(child)) for (let i in child) {
							if (typeof child[i] == "string" && child[i][0] == "@") {
								if (child[i] == "@") child[parseInt(i) + 1] = data.name;
								else child[i] = "@" + data.name;
							}
							else changeMentionName(child[i]);
						}
						else if (child.props && typeof child.props.children == "string" && child.props.children[0] == "@") child.props.children = "@" + data.name;
						else if (child.props && child.props.children) changeMentionName(child.props.children);
					};
					changeMentionName(mention);
				}
				if (data.color1) {
					mention.props.color = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data.color1) ? data.color1[0] : data.color1, "INT");
					mention.props["edited-mention-color"] = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data.color1) ? data.color1[0] : data.color1, "RGBCOMP").slice(0, 3).join(",");
					if (mention.props.children && mention.props.children.props) {
						mention.props.children.props.color = mention.props.color;
						mention.props.children.props["edited-mention-color"] = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data.color1) ? data.color1[0] : data.color1, "RGBCOMP").slice(0, 3).join(",");
					}
				}
			}
			
			processMention (e) {
				if (e.instance.props["edited-mention-color"]) e.returnvalue.props.style = Object.assign({}, e.returnvalue.props.style, {"--edited-mention-color": e.instance.props["edited-mention-color"]});
			}

			processChannelReply (e) {
				if (!this.settings.places.chatWindow || !e.instance.props.reply || !e.instance.props.reply.message || !this.shouldChangeInChat(e.instance.props.reply.message.channel_id)) return;
				if (!e.returnvalue) {
					let message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.reply.message, {author: this.getUserData(e.instance.props.reply.message.author.id)}));
					let data = changedUsers[e.instance.props.reply.message.author.id];
					if (data) {
						let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryStores.GuildMemberStore.getMember((BDFDB.LibraryStores.ChannelStore.getChannel(e.instance.props.reply.message.channel_id) || {}).guild_id, e.instance.props.reply.message.author.id) || {}).colorString || data.color1;
						if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
					}
					e.instance.props.reply = Object.assign({}, e.instance.props.reply, {message: message});
				}
				else {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.messagereplyname]]});
					if (userName) this.changeUserColor(userName, e.instance.props.reply.message.author.id);
				}
			}
			
			processMemberListItem (e) {
				if (!this.settings.places.memberList || !e.instance.props.user) return;
				if (!e.returnvalue) {
					e.instance.props.user = this.getUserData(e.instance.props.user.id);
					let data = changedUsers[e.instance.props.user.id];
					if (data) {
						if (data.name) {
							let member = BDFDB.LibraryStores.GuildMemberStore.getMember(e.instance.props.channel.guild_id, e.instance.props.user.id);
							e.instance.props.nick = this.getUserNick(e.instance.props.user.id, member && member.nick);
						}
						if (data.removeStatus || data.status || data.statusEmoji) {
							e.instance.props.activities = [].concat(e.instance.props.activities).filter(n => n.type != BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS);
							let activity = this.createCustomStatus(data);
							if (activity) e.instance.props.activities.unshift(activity);
						}
					}
				}
				else {
					this.changeUserColor(e.returnvalue.props.name, e.instance.props.user.id, {e: e, guildId: e.instance.props.channel.guild_id});
					this.injectBadge(BDFDB.ObjectUtils.get(e.returnvalue, "props.decorators.props.children"), e.instance.props.user.id, BDFDB.LibraryStores.SelectedGuildStore.getGuildId(), 2, {
						tagClass: BDFDB.disCN.bottagmember
					});
				}
			}

			processAuditLogs (e) {
				if (!this.settings.places.guildSettings || !e.instance.props.logs) return;
				if (!BDFDB.PatchUtils.isPatched(this, e.instance, "renderUserQuickSelectItem")) BDFDB.PatchUtils.patch(this, e.instance, "renderUserQuickSelectItem", {after: e2 => {
					if (!e2.methodArguments[0] || !e2.methodArguments[0].user || !changedUsers[e2.methodArguments[0].user.id]) return;
					let userName = BDFDB.ReactUtils.findChild(e2.returnValue, {props: [["children", e2.methodArguments[0].label]]});
					if (userName) {
						if (changedUsers[e2.methodArguments[0].user.id].name) userName.props.children = changedUsers[e2.methodArguments[0].user.id].name;
						this.changeUserColor(userName, e2.methodArguments[0].user.id);
					}
					let avatar = BDFDB.ReactUtils.findChild(e2.returnValue, {props: [["className", BDFDB.disCN.selectfilterpopoutavatar]]});
					if (avatar) avatar.props.src = this.getUserAvatar(e2.methodArguments[0].user.id);
				}}, {noCache: true});
			}

			processAuditLogEntry (e) {
				if (!this.settings.places.guildSettings || !e.instance.props.log) return;
				if (e.instance.props.log.user) e.instance.props.log.user = this.getUserData(e.instance.props.log.user.id);
				if (e.instance.props.log.target && e.instance.props.log.targetType == "USER") e.instance.props.log.target = this.getUserData(e.instance.props.log.target.id);
			}

			processGuildEmojis (e) {
				if (!this.settings.places.guildSettings) return;
				if (e.instance.props.staticEmojis) {
					e.instance.props.staticEmojis = [].concat(e.instance.props.staticEmojis);
					for (let i in e.instance.props.staticEmojis) e.instance.props.staticEmojis[i] = Object.assign({}, e.instance.props.staticEmojis[i], {user: this.getUserData(e.instance.props.staticEmojis[i].user.id)});
				}
				if (e.instance.props.animatedEmojis) {
					e.instance.props.animatedEmojis = [].concat(e.instance.props.animatedEmojis);
					for (let i in e.instance.props.animatedEmojis) e.instance.props.animatedEmojis[i] = Object.assign({}, e.instance.props.animatedEmojis[i], {user: this.getUserData(e.instance.props.animatedEmojis[i].user.id)});
				}
			}

			processGuildMemberEntry (e) {
				if (this.settings.places.guildSettings && e.instance.props.user) e.instance.props.user = this.getUserData(e.instance.props.user.id);
			}

			processGuildInvites (e) {
				if (!this.settings.places.guildSettings || !e.instance.props.invites) return;
				e.instance.props.invites = Object.assign({}, e.instance.props.invites);
				for (let id in e.instance.props.invites) e.instance.props.invites[id] = new BDFDB.DiscordObjects.Invite(Object.assign({}, e.instance.props.invites[id], {inviter: this.getUserData(e.instance.props.invites[id].inviter.id)}));
			}

			processGuildBans (e) {
				if (!this.settings.places.guildSettings || !e.instance.props.bans) return;
				e.instance.props.bans = Object.assign({}, e.instance.props.bans);
				for (let id in e.instance.props.bans) e.instance.props.bans[id] = Object.assign({}, e.instance.props.bans[id], {user: this.getUserData(e.instance.props.bans[id].user.id)});
			}

			processGuildInvitationRow (e) {
				if (!this.settings.places.inviteList || !e.instance.props.user) return;
				if (!e.returnvalue) e.instance.props.user = this.getUserData(e.instance.props.user.id);
				else {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.invitemodalinviterowname]]});
					if (userName) this.changeUserColor(userName, e.instance.props.user.id);
				}
			}

			processDirectMessageAddPopout (e) {
				if (!this.settings.places.inviteList || !BDFDB.ArrayUtils.is(e.instance.props.results)) return;
				for (let result of e.instance.props.results) result.user = this.getUserData(result.user.id);
			}

			processDirectMessageAddPopoutRow (e) {
				if (!this.settings.places.inviteList || !e.instance.props.user) return;
				let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.dmaddpopoutnickname]]});
				if (userName) this.changeUserColor(userName, e.instance.props.user.id);
			}

			processTypingUsers (e) {
				if (!this.settings.places.typing || !BDFDB.ObjectUtils.is(e.instance.props.typingUsers) || !Object.keys(e.instance.props.typingUsers).length) return;
				let users = Object.keys(e.instance.props.typingUsers).filter(id => id != BDFDB.UserUtils.me.id).filter(id => !BDFDB.LibraryStores.RelationshipStore.isBlocked(id)).map(id => BDFDB.LibraryStores.UserStore.getUser(id)).filter(n => n);
				if (!users.length) return;
				let typingText = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.typingtext]]});
				if (typingText && BDFDB.ArrayUtils.is(typingText.props.children)) for (let child of typingText.props.children) if (child.type == "strong") {
					let userId = (users.shift() || {}).id;
					if (userId) {
						let data = changedUsers[userId];
						if (data && data.name) child.props.children = data.name;
						this.changeUserColor(child, userId);
					}
				}
			}

			processDirectMessage (e) {
				if (!this.settings.places.recentDms || !e.instance.props.channel || !e.instance.props.channel.isDM()) return;
				let recipientId = e.instance.props.channel.getRecipientId();
				if (!recipientId || !changedUsers[recipientId]) return;
				e.instance.props.channelName = this.getUserData(recipientId).username;
				let avatar = BDFDB.ReactUtils.findChild(e.returnvalue, {filter: c => c && c.props && !isNaN(parseInt(c.props.id))});
				if (avatar && typeof avatar.props.children == "function") {
					let childrenRender = avatar.props.children;
					avatar.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let renderedChildren = childrenRender(...args);
						if (renderedChildren && renderedChildren.props) renderedChildren.props.icon = this.getUserAvatar(recipientId);
						return renderedChildren;
					}, "Error in Avatar Render of DirectMessage!", this);
				}
			}
			
			processPrivateChannel (e) {
				if (!this.settings.places.dmsList || !e.instance.props.user || !changedUsers[e.instance.props.user.id]) return;
				if (!e.returnvalue) {
					let data = changedUsers[e.instance.props.user.id];
					if (data.removeStatus || data.status || data.statusEmoji) {
						e.instance.props.activities = [].concat(e.instance.props.activities).filter(n => n.type != BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS);
						let activity = this.createCustomStatus(changedUsers[e.instance.props.user.id]);
						if (activity) e.instance.props.activities.unshift(activity);
					}
				}
				else {
					let wrapper = e.returnvalue && e.returnvalue.props.children && e.returnvalue.props.children.props && typeof e.returnvalue.props.children.props.children == "function" ? e.returnvalue.props.children : e.returnvalue;
					if (typeof wrapper.props.children == "function") {
						let childrenRender = wrapper.props.children;
						wrapper.props.children = BDFDB.TimeUtils.suppress((...args) => {
							let children = childrenRender(...args);
							this._processPrivateChannel(e.instance, children);
							return children;
						}, "Error in Children Render of PrivateChannel!", this);
					}
					else this._processPrivateChannel(e.instance, wrapper);
				}
			}

			_processPrivateChannel (instance, returnvalue) {
				const wrapper = returnvalue.props.avatar ? returnvalue : BDFDB.ReactUtils.findChild(returnvalue, {props: ["avatar"]});
				if (!wrapper) return;
				wrapper.props.name = BDFDB.ReactUtils.createElement("span", {children: this.getUserData(instance.props.user.id).username});
				this.changeUserColor(wrapper.props.name, instance.props.user.id, {modify: BDFDB.ObjectUtils.extract(Object.assign({}, instance.props, instance.state), "hovered", "selected", "hasUnreadMessages", "muted")});
				if (wrapper.props.avatar) wrapper.props.avatar.props.src = this.getUserAvatar(instance.props.user.id);
				wrapper.props.decorators = [wrapper.props.decorators].flat(10);
				this.injectBadge(wrapper.props.decorators, instance.props.user.id, null, 1);
			}

			processQuickSwitcher (e) {
				if (!e.instance.props.query || e.instance.props.queryMode && e.instance.props.queryMode != BDFDB.DiscordConstants.AutocompleterResultTypes.USER) return;
				for (let id in changedUsers) if (changedUsers[id] && changedUsers[id].name && changedUsers[id].name.toLocaleLowerCase().indexOf(e.instance.props.query.toLocaleLowerCase()) > -1 && !e.instance.props.results.find(n => n.record && n.record.id == id && n.type == BDFDB.DiscordConstants.AutocompleterResultTypes.USER)) {
					let user = BDFDB.LibraryStores.UserStore.getUser(id);
					if (user) e.instance.props.results.splice(1, 0, {
						comparator: `${user.username}#${user.discriminator}`,
						record: user,
						score: 30000,
						type: BDFDB.DiscordConstants.AutocompleterResultTypes.USER
					});
				}
			}
			
			processQuickSwitchUserResult (e) {
				if (!this.settings.places.quickSwitcher || !e.instance.props.user) return;
				if (!e.returnvalue) e.instance.props.user = this.getUserData(e.instance.props.user.id);
				else {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.quickswitchresultmatch]]});
					if (userName) {
						let data = changedUsers[e.instance.props.user.id];
						if (data && data.name) userName.props.children = data.name;
						this.changeUserColor(userName, e.instance.props.user.id, {modify: BDFDB.ObjectUtils.extract(e.instance.props, "focused", "unread", "mentions")});
					}
				}
			}

			processSearchPopoutOption (e) {
				if (!this.settings.places.searchPopout || !e.instance.props.result || !e.instance.props.result.user || !changedUsers[e.instance.props.result.user.id]) return;
				if (!e.returnvalue) e.instance.props.result = Object.assign({}, e.instance.props.result, {user: this.getUserData(e.instance.props.result.user.id)});
				else {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.searchpopoutdisplayednick]]});
					if (userName) {
						let data = changedUsers[e.instance.props.result.user.id];
						if (data && data.name) userName.props.children = data.name;
						this.changeUserColor(userName, e.instance.props.result.user.id);
					}
					let avatar = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.searchpopoutdisplayavatar]]});
					if (avatar) avatar.props.src = this.getUserAvatar(e.instance.props.result.user.id);
				}
			}
			
			processIncomingCallModal (e) {
				if (!this.settings.places.dmCalls || !e.instance.props.channel) return;
				let user = BDFDB.LibraryStores.UserStore.getUser(e.instance.props.channel.id);
				if (!user) {
					let channel = BDFDB.LibraryStores.ChannelStore.getChannel(e.instance.props.channel.id);
					if (channel && channel.isDM()) user = BDFDB.LibraryStores.UserStore.getUser(channel.recipients[0]);
				}
				if (user) {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.callincomingtitle]]});
					if (userName) {
						let data = changedUsers[user.id];
						if (data && data.name) userName.props.children = data.name;
						this.changeUserColor(userName, user.id);
					}
					let avatar = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.callincomingicon]]});
					if (avatar) avatar.props.src = this.getUserAvatar(user.id);
				}
			}

			processParticipantsForSelectedParticipant (e) {
				if (!this.settings.places.voiceChat) return;
				let popout = BDFDB.ReactUtils.findChild(e.returnvalue, {filter: n => n && n.props && typeof n.props.renderPopout == "function"});
				if (!popout) return;
				let renderPopout = popout.props.renderPopout;
				popout.props.renderPopout = BDFDB.TimeUtils.suppress((...args) => {
					let renderedPopout = renderPopout(...args);
					renderedPopout.props.users = [].concat(renderedPopout.props.users);
					for (let i in renderedPopout.props.users) if (renderedPopout.props.users[i]) renderedPopout.props.users[i] = this.getUserData(renderedPopout.props.users[i].id);
					return renderedPopout;
				});
				if (typeof popout.props.children == "function") {
					let renderChildren = popout.props.children;
					popout.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let renderedChildren = renderChildren(...args);
						for (let viewer of renderedChildren.props.children) viewer.props.src = this.getUserAvatar(viewer.key);
						return renderedChildren;
					});
				}
			}
			
			processChannelCall (e) {
				if (!this.settings.places.voiceChat || !BDFDB.ArrayUtils.is(e.instance.props.participants)) return;
				e.instance.props.participants = [].concat(e.instance.props.participants);
				for (let i in e.instance.props.participants) if (e.instance.props.participants[i] && e.instance.props.participants[i].user) e.instance.props.participants[i] = Object.assign({}, e.instance.props.participants[i], {user: this.getUserData(e.instance.props.participants[i].user.id)});
			}
			
			processChannelCallGrid (e) {
				this.processChannelCall(e);
			}
			
			processChannelCallVideoParticipants (e) {
				this.processChannelCall(e);
			}
			
			processPictureInPictureVideo (e) {
				if (!e.instance.props.backgroundKey) return;
				let user = BDFDB.LibraryStores.UserStore.getUser(e.instance.props.backgroundKey);
				if (!user) return;
				e.instance.props.title = this.getUserData(user.id).username;
				let videoBackground = BDFDB.ReactUtils.findChild(e.instance.props.children, {name: "VideoBackground"});
				if (videoBackground && videoBackground.props.src) videoBackground.props.src = this.getUserAvatar(user.id);
			}

			processUserSummaryItem (e) {
				if (!BDFDB.ArrayUtils.is(e.instance.props.users)) return;
				for (let i in e.instance.props.users) if (e.instance.props.users[i]) e.instance.props.users[i] = this.getUserData(e.instance.props.users[i].id);
			}

			changeAppTitle () {
				let channel = BDFDB.LibraryStores.ChannelStore.getChannel(BDFDB.LibraryStores.SelectedChannelStore.getChannelId());
				let title = document.head.querySelector("title");
				if (title && channel && channel.isDM() && (document.location.href || "").indexOf(channel.id) > -1) {
					let user = BDFDB.LibraryStores.UserStore.getUser(channel.recipients[0]);
					if (user) BDFDB.DOMUtils.setText(title, "@" + this.getUserData(user.id, this.settings.places.appTitle).username);
				}
			}
			
			shouldChangeInChat (channelId) {
				if (this.settings.types.servers && this.settings.types.dms) return true;
				let channel = BDFDB.LibraryStores.ChannelStore.getChannel(channelId || BDFDB.LibraryStores.SelectedChannelStore.getChannelId());
				let isDm = channel && (channel.isDM() || channel.isGroupDM());
				if (channel && (this.settings.types.servers && !isDm || this.settings.types.dms && isDm)) return true;
				return false;
			}
			
			changeUserColor (child, userId, options = {}) {
				if (!BDFDB.ReactUtils.isValidElement(child)) return;
				let data = changedUsers[userId] || {};
				if (data.color1) {
					let childProp = child.props.children ? "children" : child.props.name ? "name" : "text";
					if (!child.props[childProp]) return;
					let color1 = data.color1 && data.useRoleColor && options.guildId && (BDFDB.LibraryStores.GuildMemberStore.getMember(options.guildId, userId) || {}).colorString || data.color1;
					let fontColor = options.modify && !(data.useRoleColor && options.guildId) ? this.chooseColor(color1, options.modify) : color1;
					let fontGradient = BDFDB.ObjectUtils.is(fontColor);
					if (BDFDB.ObjectUtils.is(child.props.style)) delete child.props.style.color;
					if (child.props[childProp].props && BDFDB.LibraryStores.AccessibilityStore.roleStyle != "dot") delete child.props[childProp].props.color;
					child.props[childProp] = BDFDB.ReactUtils.createElement("span", {
						style: {
							color: fontGradient ? BDFDB.ColorUtils.convert(fontColor[0], "RGBA") : BDFDB.ColorUtils.convert(fontColor, "RGBA")
						},
						children: fontGradient ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
							gradient: BDFDB.ColorUtils.createGradient(fontColor),
							children: child.props[childProp]
						}) : child.props[childProp]
					});
				}
			}

			chooseColor (color, config = {}) {
				if (color) {
					if (BDFDB.ObjectUtils.is(config)) {
						if (config.mentions || config.focused || config.hovered || config.selected || config.unread || config.hasUnreadMessages || config.speaking) color = BDFDB.ColorUtils.change(color, 0.5);
						else if (config.muted || config.locked) color = BDFDB.ColorUtils.change(color, -0.5);
					}
					return color;
				}
				return null;
			}
			
			getUserData (userId, change = true, keepName = false, fallbackData) {
				let user = BDFDB.LibraryStores.UserStore.getUser(userId);
				if (!user && BDFDB.ObjectUtils.is(fallbackData) || user && BDFDB.ObjectUtils.is(fallbackData) && user.username != fallbackData.username) user = fallbackData;
				if (!user) return new BDFDB.DiscordObjects.User({});
				let data = change && changedUsers[user.id];
				if (data) {
					let newUserObject = {}, nativeObject = new BDFDB.DiscordObjects.User(user);
					for (let key in nativeObject) newUserObject[key] = nativeObject[key];
					newUserObject.tag = nativeObject.tag;
					newUserObject.createdAt = nativeObject.createdAt;
					newUserObject.username = !keepName && data.name || nativeObject.username;
					newUserObject.usernameNormalized = !keepName && data.name && data.name.toLowerCase() || nativeObject.usernameNormalized;
					if (data.removeIcon) {
						newUserObject.avatar = null;
						newUserObject.avatarURL = null;
						newUserObject.getAvatarSource = _ => null;
						newUserObject.getAvatarURL = _ => null;
						newUserObject.guildMemberAvatars = {};
					}
					else if (data.url) {
						newUserObject.avatar = data.url;
						newUserObject.avatarURL = data.url;
						newUserObject.getAvatarSource = _ => data.url;
						newUserObject.getAvatarURL = _ => data.url;
						newUserObject.guildMemberAvatars = {};
					}
					return newUserObject;
				}
				return new BDFDB.DiscordObjects.User(user);
			}
			
			getUserNick (userId, nick, change = true) {
				let user = BDFDB.LibraryStores.UserStore.getUser(userId);
				if (!user) return "";
				let data = change && changedUsers[user.id];
				if (data) return (data.useServerNick && nick || data.name && [data.name, data.showServerNick && nick && `(${nick})` || data.showAccountName && user.username && `(${user.username})`].filter(n => n).join(" ")) || nick || "";
				return "";
			}
			
			getUserAvatar (userId, change = true) {
				let user = BDFDB.LibraryStores.UserStore.getUser(userId);
				if (!user) return "";
				let data = change && changedUsers[user.id];
				if (data) {
					if (data.removeIcon) return "";
					else if (data.url) return data.url;
				}
				return BDFDB.LibraryModules.IconUtils.getUserAvatarURL(user);
			}
			
			injectBadge (children, userId, guildId, insertIndex, config = {}) {
				if (!BDFDB.ArrayUtils.is(children) || !userId) return;
				let data = changedUsers[userId];
				if (data && data.tag) {
					let memberColor = data.ignoreTagColor && (BDFDB.LibraryStores.GuildMemberStore.getMember(guildId, userId) || {}).colorString;
					let fontColor = !config.inverted ? data.color4 : (memberColor || data.color3);
					let backgroundColor = !config.inverted ? (memberColor || data.color3) : data.color4;
					let fontGradient = BDFDB.ObjectUtils.is(fontColor);
					children.splice(insertIndex, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BotTag, {
						className: config.tagClass,
						useRemSizes: config.useRem,
						invertColor: config.inverted,
						style: {
							background: BDFDB.ObjectUtils.is(backgroundColor) ? BDFDB.ColorUtils.createGradient(backgroundColor) : BDFDB.ColorUtils.convert(backgroundColor, "RGBA"),
							color: fontGradient ? BDFDB.ColorUtils.convert(fontColor[0], "RGBA") : BDFDB.ColorUtils.convert(fontColor, "RGBA")
						},
						tag: fontGradient ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
							gradient: BDFDB.ColorUtils.createGradient(fontColor),
							children: data.tag
						}) : data.tag
					}));
				}
			}
			
			createCustomStatus (data) {
				return !BDFDB.ObjectUtils.is(data) || data.removeStatus ? null : {
					created_at: (new Date()).getTime().toString(),
					emoji: data.statusEmoji,
					id: "custom",
					name: "Custom Status",
					state: data.status,
					type: BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS
				}
			}

			openUserSettingsModal (user) {
				let data = changedUsers[user.id] || {};
				let newData = Object.assign({}, data);
				let member = BDFDB.LibraryStores.GuildMemberStore.getMember(BDFDB.LibraryStores.SelectedGuildStore.getGuildId(), user.id) || {};
				let activity = BDFDB.LibraryStores.PresenceStore.getApplicationActivity(user.id);
				
				let avatarInput, bannerInput, statusEmojiInput, statusInput, colorPicker3, colorPicker4, colorPicker5, colorPicker6, colorPicker7;
				
				BDFDB.ModalUtils.open(this, {
					size: "LARGE",
					header: this.labels.modal_header,
					subHeader: member.nick || user.username,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader1,
							children: [
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.marginbottom8,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
											className: BDFDB.disCN.marginbottom8,
											align: BDFDB.LibraryComponents.Flex.Align.CENTER,
											direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
												className: BDFDB.disCN.marginreset,
												tag: BDFDB.LibraryComponents.FormComponents.FormTags.H5,
												children: this.labels.modal_username
											})
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
											value: data.name,
											placeholder: member.nick || user.username,
											autoFocus: true,
											onChange: value => newData.name = value
										})
									]
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									className: BDFDB.disCN.marginbottom20,
									justify: BDFDB.LibraryComponents.Flex.Justify.END,
									align: BDFDB.LibraryComponents.Flex.Align.CENTER,
									direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
											type: "Switch",
											margin: 0,
											grow: 0,
											label: this.labels.modal_showaccountname,
											tag: BDFDB.LibraryComponents.FormComponents.FormTags.H5,
											value: data.showAccountName,
											onChange: value => newData.showAccountName = value
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
											type: "Switch",
											margin: 0,
											grow: 0,
											label: this.labels.modal_showservernick,
											tag: BDFDB.LibraryComponents.FormComponents.FormTags.H5,
											value: data.showServerNick,
											onChange: value => newData.showServerNick = value
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
											type: "Switch",
											margin: 0,
											grow: 0,
											label: this.labels.modal_useservernick,
											tag: BDFDB.LibraryComponents.FormComponents.FormTags.H5,
											value: data.useServerNick,
											onChange: value => newData.useServerNick = value
										})
									]
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.marginbottom20,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
											className: BDFDB.disCN.marginbottom8,
											align: BDFDB.LibraryComponents.Flex.Align.CENTER,
											direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
											children: [
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
													className: BDFDB.disCN.marginreset,
													tag: BDFDB.LibraryComponents.FormComponents.FormTags.H5,
													children: this.labels.modal_useravatar
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													type: "Switch",
													margin: 0,
													grow: 0,
													label: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
													tag: BDFDB.LibraryComponents.FormComponents.FormTags.H5,
													value: data.removeIcon,
													onChange: value => {
														newData.removeIcon = value;
														if (value) {
															delete avatarInput.props.success;
															delete avatarInput.props.errorMessage;
															avatarInput.props.disabled = true;
															BDFDB.ReactUtils.forceUpdate(avatarInput);
														}
														else {
															avatarInput.props.disabled = false;
															this.checkUrl(avatarInput.props.value, avatarInput).then(returnValue => newData.url = returnValue);
														}
													}
												})
											]
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
											success: !data.removeIcon && data.url,
											maxLength: 100000000000000000000,
											value: data.url,
											placeholder: BDFDB.UserUtils.getAvatar(user.id),
											disabled: data.removeIcon,
											ref: instance => {if (instance) avatarInput = instance;},
											onChange: (value, instance) => this.checkUrl(value, instance).then(returnValue => newData.url = returnValue)
										})
									]
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.marginbottom20,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
											className: BDFDB.disCN.marginbottom8,
											align: BDFDB.LibraryComponents.Flex.Align.CENTER,
											direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
											children: [
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
													className: BDFDB.disCN.marginreset,
													tag: BDFDB.LibraryComponents.FormComponents.FormTags.H5,
													children: BDFDB.LanguageUtils.LanguageStrings.CUSTOM_STATUS
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													type: "Switch",
													margin: 0,
													grow: 0,
													label: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
													tag: BDFDB.LibraryComponents.FormComponents.FormTags.H5,
													value: data.removeStatus,
													onChange: value => {
														newData.removeStatus = value;
														statusInput.props.disabled = value;
														BDFDB.ReactUtils.forceUpdate(statusInput);
													}
												})
											]
										}),
										BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.disCN.emojiinputcontainer,
											children: [
												BDFDB.ReactUtils.createElement("div", {
													className: BDFDB.disCN.emojiinputbuttoncontainer,
													children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.EmojiPickerButton, {
														emoji: data.statusEmoji,
														allowManagedEmojis: true,
														allowManagedEmojisUsage: true,
														ref: instance => {if (instance) statusEmojiInput = instance;},
														onSelect: value => newData.statusEmoji = value
													})
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													inputClassName: BDFDB.disCN.emojiinput,
													maxLength: 100000000000000000000,
													value: data.status,
													placeholder: activity && activity.type == BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS && activity.state || "",
													disabled: data.removeStatus,
													ref: instance => {if (instance) statusInput = instance;},
													onChange: value => newData.status = value
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
													size: BDFDB.LibraryComponents.Button.Sizes.NONE,
													look: BDFDB.LibraryComponents.Button.Looks.BLANK,
													className: BDFDB.disCN.emojiinputclearbutton,
													children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
														className: BDFDB.disCN.emojiinputclearicon,
														name: BDFDB.LibraryComponents.SvgIcon.Names.CLOSE_CIRCLE
													}),
													onClick: _ => {
														newData.status = "";
														newData.statusEmoji = null;
														statusInput.props.value = "";
														delete statusEmojiInput.props.emoji;
														BDFDB.ReactUtils.forceUpdate(statusInput, statusEmojiInput);
													}
												})
											]
										})
									]
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader2,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker1,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color1,
										onColorChange: value => newData.color1 = value
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker2,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color2,
										onColorChange: value => newData.color2 = value
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									margin: 20,
									label: this.labels.modal_userolecolor,
									tag: BDFDB.LibraryComponents.FormComponents.FormTags.H5,
									value: data.useRoleColor,
									onChange: value => newData.useRoleColor = value
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader3,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_usertag,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										value: data.tag,
										onChange: value => newData.tag = value
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker3,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color3,
										disabled: data.ignoreTagColor,
										ref: instance => {if (instance) colorPicker3 = instance;},
										onColorChange: value => newData.color3 = value
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker4,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color4,
										disabled: data.ignoreTagColor,
										ref: instance => {if (instance) colorPicker4 = instance;},
										onColorChange: value => newData.color4 = value
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									margin: 20,
									label: this.labels.modal_ignoretagcolor,
									tag: BDFDB.LibraryComponents.FormComponents.FormTags.H5,
									value: data.ignoreTagColor,
									onChange: value => {
										newData.ignoreTagColor = value;
										colorPicker3.props.disabled = value;
										colorPicker4.props.disabled = value;
										BDFDB.ReactUtils.forceUpdate(colorPicker3, colorPicker4);
									}
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: BDFDB.LibraryModules.LanguageStore.Messages.USER_SETTINGS_PROFILE_THEME,
							children: [
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.marginbottom20,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
											className: BDFDB.disCN.marginbottom8,
											align: BDFDB.LibraryComponents.Flex.Align.CENTER,
											direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
											children: [
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
													className: BDFDB.disCN.marginreset,
													tag: BDFDB.LibraryComponents.FormComponents.FormTags.H5,
													children: BDFDB.LanguageUtils.LanguageStrings.USER_SETTINGS_PROFILE_BANNER
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													type: "Switch",
													margin: 0,
													grow: 0,
													label: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
													tag: BDFDB.LibraryComponents.FormComponents.FormTags.H5,
													value: data.removeBanner,
													onChange: value => {
														newData.removeBanner = value;
														if (value) {
															delete bannerInput.props.success;
															delete bannerInput.props.errorMessage;
															bannerInput.props.disabled = true;
															BDFDB.ReactUtils.forceUpdate(bannerInput);
														}
														else {
															bannerInput.props.disabled = false;
															this.checkUrl(bannerInput.props.value, bannerInput).then(returnValue => newData.banner = returnValue);
														}
													}
												})
											]
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
											success: !data.removeBanner && data.banner,
											maxLength: 100000000000000000000,
											value: data.banner,
											placeholder: BDFDB.UserUtils.getBanner(user.id),
											ref: instance => {if (instance) bannerInput = instance;},
											onChange: (value, instance) => this.checkUrl(value, instance).then(returnValue => newData.banner = returnValue)
										})
									]
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: BDFDB.LibraryModules.LanguageStore.Messages.USER_SETTINGS_BANNER_COLOR_TITLE,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color5,
										pickerConfig: {
											alpha: false,
											gradient: false
										},
										ref: instance => {if (instance) colorPicker5 = instance;},
										onColorChange: value => newData.color5 = value
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: BDFDB.LibraryModules.LanguageStore.Messages.USER_SETTINGS_PROFILE_THEME_PRIMARY,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color6,
										pickerConfig: {
											alpha: false,
											gradient: false
										},
										ref: instance => {if (instance) colorPicker6 = instance;},
										onColorChange: value => newData.color6 = value
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: BDFDB.LibraryModules.LanguageStore.Messages.USER_SETTINGS_PROFILE_THEME_ACCENT,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color7,
										pickerConfig: {
											alpha: false,
											gradient: false
										},
										ref: instance => {if (instance) colorPicker7 = instance;},
										onColorChange: value => newData.color7 = value
									})
								}),
							]
						})
					],
					buttons: [{
						contents: BDFDB.LanguageUtils.LanguageStrings.SAVE,
						color: "BRAND",
						close: true,
						onClick: _ => {
							newData.url = !newData.removeIcon ? newData.url : "";
							newData.status = !newData.removeStatus ? newData.status : "";
							newData.statusEmoji = !newData.removeStatus ? newData.statusEmoji : null;

							let changed = false;
							if (Object.keys(newData).every(key => newData[key] == null || newData[key] == false) && (changed = true)) {
								BDFDB.DataUtils.remove(this, "users", user.id);
							}
							else if (!BDFDB.equals(newData, data) && (changed = true)) {
								BDFDB.DataUtils.save(newData, this, "users", user.id);
							}
							if (changed) this.forceUpdateAll();
						}
					}]
				});
			}
			
			checkUrl (url, instance) {
				return new Promise(callback => {
					BDFDB.TimeUtils.clear(instance.checkTimeout);
					url = url && url.trim();
					if (!url || instance.props.disabled) {
						delete instance.props.success;
						delete instance.props.errorMessage;
						callback("");
						BDFDB.ReactUtils.forceUpdate(instance);
					}
					else if (url.indexOf("data:") == 0) {
						instance.props.success = true;
						delete instance.props.errorMessage;
						callback(url);
					}
					else instance.checkTimeout = BDFDB.TimeUtils.timeout(_ => BDFDB.LibraryRequires.request(url, {agentOptions: {rejectUnauthorized: false}}, (error, response, result) => {
						delete instance.checkTimeout;
						if (instance.props.disabled) {
							delete instance.props.success;
							delete instance.props.errorMessage;
							callback("");
						}
						else if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") != -1) {
							instance.props.success = true;
							delete instance.props.errorMessage;
							callback(url);
						}
						else {
							delete instance.props.success;
							instance.props.errorMessage = this.labels.modal_invalidurl;
							callback("");
						}
						BDFDB.ReactUtils.forceUpdate(instance);
					}), 1000);
				});
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							confirm_reset:						"Наистина ли искате да нулирате този потребител?",
							confirm_resetall:					"Наистина ли искате да нулирате всички потребители?",
							context_localusersettings:			"Локални потребителски настройки",
							modal_colorpicker1:					"Име Цвят",
							modal_colorpicker2:					"Цвят на съобщението",
							modal_colorpicker3:					"Цвят на маркера",
							modal_colorpicker4:					"Цвят на шрифта",
							modal_header:						"Локални потребителски настройки",
							modal_ignoretagcolor:				"Използвайте Цвят на ролята",
							modal_invalidurl:					"Невалиден адрес",
							modal_showaccountname:				"Покажи име",
							modal_showservernick:				"Показване на псевдонима",
							modal_tabheader1:					"Потребител",
							modal_tabheader2:					"Име Цвят",
							modal_tabheader3:					"Етикет",
							modal_useravatar:					"Аватар",
							modal_username:						"Локално потребителско име",
							modal_userolecolor:					"Не презаписвайте цвета на ролята",
							modal_usertag:						"Етикет",
							modal_useservernick:				"Не презаписвайте псевдонимите",
							submenu_resetsettings:				"Нулиране на потребителя",
							submenu_usersettings:				"Промяна на настройките"
						};
					case "cs":		// Czech
						return {
							confirm_reset:						"Opravdu chcete tohoto uživatele resetovat?",
							confirm_resetall:					"Opravdu chcete resetovat všechny uživatele?",
							context_localusersettings:			"Místní nastavení uživatele",
							modal_colorpicker1:					"Název Barva",
							modal_colorpicker2:					"Barva zprávy",
							modal_colorpicker3:					"Barva značky",
							modal_colorpicker4:					"Barva fontu",
							modal_header:						"Místní nastavení uživatele",
							modal_ignoretagcolor:				"Použijte barvu role",
							modal_invalidurl:					"Neplatná URL",
							modal_showaccountname:				"Zobrazit jméno",
							modal_showservernick:				"Zobrazit přezdívku",
							modal_tabheader1:					"Uživatel",
							modal_tabheader2:					"Název Barva",
							modal_tabheader3:					"Štítek",
							modal_useravatar:					"Avatar",
							modal_username:						"Místní uživatelské jméno",
							modal_userolecolor:					"Nepřepisujte barvu role",
							modal_usertag:						"Štítek",
							modal_useservernick:				"Nepřepisujte přezdívky",
							submenu_resetsettings:				"Obnovit uživatele",
							submenu_usersettings:				"Změnit nastavení"
						};
					case "da":		// Danish
						return {
							confirm_reset:						"Er du sikker på, at du vil nulstille denne bruger?",
							confirm_resetall:					"Er du sikker på, at du vil nulstille alle brugere?",
							context_localusersettings:			"Lokale brugerindstillinger",
							modal_colorpicker1:					"Navnfarve",
							modal_colorpicker2:					"Beskedfarve",
							modal_colorpicker3:					"Tagfarve",
							modal_colorpicker4:					"Skriftfarve",
							modal_header:						"Lokale brugerindstillinger",
							modal_ignoretagcolor:				"Brug rollefarve",
							modal_invalidurl:					"Ugyldig URL",
							modal_showaccountname:				"Vis navn",
							modal_showservernick:				"Vis kaldenavn",
							modal_tabheader1:					"Bruger",
							modal_tabheader2:					"Navnfarve",
							modal_tabheader3:					"Tag",
							modal_useravatar:					"Avatar",
							modal_username:						"Lokalt brugernavn",
							modal_userolecolor:					"Overskriv ikke rollefarven",
							modal_usertag:						"Tag",
							modal_useservernick:				"Overskriv ikke kælenavne",
							submenu_resetsettings:				"Nulstil bruger",
							submenu_usersettings:				"Ændre indstillinger"
						};
					case "de":		// German
						return {
							confirm_reset:						"Möchtest du diesen Benutzer wirklich zurücksetzen?",
							confirm_resetall:					"Möchtest du wirklich alle Benutzer zurücksetzen?",
							context_localusersettings:			"Lokale Benutzereinstellungen",
							modal_colorpicker1:					"Namensfarbe",
							modal_colorpicker2:					"Nachrichtenfarbe",
							modal_colorpicker3:					"Abzeichenfarbe",
							modal_colorpicker4:					"Schriftfarbe",
							modal_header:						"Lokale Benutzereinstellungen",
							modal_ignoretagcolor:				"Rollenfarbe verwenden",
							modal_invalidurl:					"Ungültige URL",
							modal_showaccountname:				"Name anzeigen",
							modal_showservernick:				"Nicknamen anzeigen",
							modal_tabheader1:					"Benutzer",
							modal_tabheader2:					"Namensfarbe",
							modal_tabheader3:					"Abzeichen",
							modal_useravatar:					"Benutzerbild",
							modal_username:						"Lokaler Benutzername",
							modal_userolecolor:					"Rollenfarbe nicht überschreiben",
							modal_usertag:						"Abzeichen",
							modal_useservernick:				"Nicknamen nicht überschreiben",
							submenu_resetsettings:				"Benutzer zurücksetzen",
							submenu_usersettings:				"Einstellungen ändern"
						};
					case "el":		// Greek
						return {
							confirm_reset:						"Θέλετε την επαναφορά αυτού του χρήστη;",
							confirm_resetall:					"Θέλετε την επαναφορά όλων των χρηστών;",
							context_localusersettings:			"Ρυθμίσεις χρήστη (τοπικά)",
							modal_colorpicker1:					"Χρώμα ονόματος",
							modal_colorpicker2:					"Χρώμα μηνύματος",
							modal_colorpicker3:					"Χρώμα ετικέτας",
							modal_colorpicker4:					"Χρώμα γραμματοσειράς",
							modal_header:						"Ρυθμίσεις χρήστη (τοπικά)",
							modal_ignoretagcolor:				"Χρήση του χρώματος του ρόλου",
							modal_invalidurl:					"Μη έγκυρη διεύθυνση URL",
							modal_showaccountname:				"Εμφάνιση ονόματος",
							modal_showservernick:				"Εμφάνιση ψευδωνύμου",
							modal_tabheader1:					"Χρήστης",
							modal_tabheader2:					"Χρώμα ονόματος",
							modal_tabheader3:					"Ετικέτα",
							modal_useravatar:					"Εικόνα",
							modal_username:						"Όνομα χρήστη (τοπικά)",
							modal_userolecolor:					"Χωρίς αντικατάσταση του χρώματος του ρόλου",
							modal_usertag:						"Ετικέτα",
							modal_useservernick:				"Χωρίς αντικατάσταση των ψευδωνύμων",
							submenu_resetsettings:				"Επαναφορά χρήστη",
							submenu_usersettings:				"Αλλαγή ρυθμίσεις"
						};
					case "es":		// Spanish
						return {
							confirm_reset:						"¿Está seguro de que desea restablecer este usuario?",
							confirm_resetall:					"¿Está seguro de que desea restablecer a todos los usuarios?",
							context_localusersettings:			"Configuración de usuario local",
							modal_colorpicker1:					"Color del nombre",
							modal_colorpicker2:					"Color del mensaje",
							modal_colorpicker3:					"Color de etiqueta",
							modal_colorpicker4:					"Color de fuente",
							modal_header:						"Configuración de usuario local",
							modal_ignoretagcolor:				"Usar color de rol",
							modal_invalidurl:					"URL invalida",
							modal_showaccountname:				"Mostrar nombre",
							modal_showservernick:				"Mostrar apodo",
							modal_tabheader1:					"Usuario",
							modal_tabheader2:					"Color del nombre",
							modal_tabheader3:					"Etiqueta",
							modal_useravatar:					"Avatar",
							modal_username:						"Nombre de usuario local",
							modal_userolecolor:					"No sobrescriba el color de la función",
							modal_usertag:						"Etiqueta",
							modal_useservernick:				"No sobrescriba los apodos",
							submenu_resetsettings:				"Restablecer usuario",
							submenu_usersettings:				"Cambiar ajustes"
						};
					case "fi":		// Finnish
						return {
							confirm_reset:						"Haluatko varmasti nollata tämän käyttäjän?",
							confirm_resetall:					"Haluatko varmasti nollata kaikki käyttäjät?",
							context_localusersettings:			"Paikalliset käyttäjäasetukset",
							modal_colorpicker1:					"Nimen väri",
							modal_colorpicker2:					"Viestin väri",
							modal_colorpicker3:					"Tagin väri",
							modal_colorpicker4:					"Fontin väri",
							modal_header:						"Paikalliset käyttäjäasetukset",
							modal_ignoretagcolor:				"Käytä rooliväriä",
							modal_invalidurl:					"Virheellinen URL",
							modal_showaccountname:				"Näytä nimi",
							modal_showservernick:				"Näytä lempinimi",
							modal_tabheader1:					"Käyttäjä",
							modal_tabheader2:					"Nimen väri",
							modal_tabheader3:					"Tag",
							modal_useravatar:					"Hahmo",
							modal_username:						"Paikallinen käyttäjätunnus",
							modal_userolecolor:					"Älä korvaa roolin väriä",
							modal_usertag:						"Tag",
							modal_useservernick:				"Älä korvaa lempinimiä",
							submenu_resetsettings:				"Nollaa käyttäjä",
							submenu_usersettings:				"Vaihda asetuksia"
						};
					case "fr":		// French
						return {
							confirm_reset:						"Êtes-vous sûr de vouloir réinitialiser cet utilisateur?",
							confirm_resetall:					"Voulez-vous vraiment réinitialiser tous les utilisateurs?",
							context_localusersettings:			"Paramètres locaux de l'utilisateur",
							modal_colorpicker1:					"Couleur du nom",
							modal_colorpicker2:					"Couleur du message",
							modal_colorpicker3:					"Couleur de l'étiquette",
							modal_colorpicker4:					"Couleur de la police",
							modal_header:						"Paramètres locaux de l'utilisateur",
							modal_ignoretagcolor:				"Utiliser la couleur du rôle",
							modal_invalidurl:					"URL invalide",
							modal_showaccountname:				"Afficher le nom",
							modal_showservernick:				"Afficher le surnom",
							modal_tabheader1:					"Utilisateur",
							modal_tabheader2:					"Couleur du nom",
							modal_tabheader3:					"Marque",
							modal_useravatar:					"Avatar",
							modal_username:						"Nom local d'utilisateur",
							modal_userolecolor:					"Ne pas écraser la couleur du rôle",
							modal_usertag:						"Marque",
							modal_useservernick:				"Ne pas écraser les surnoms",
							submenu_resetsettings:				"Réinitialiser l'utilisateur",
							submenu_usersettings:				"Modifier les paramètres"
						};
					case "hi":		// Hindi
						return {
							confirm_reset:						"क्या आप वाकई इस उपयोगकर्ता को रीसेट करना चाहते हैं?",
							confirm_resetall:					"क्या आप वाकई सभी उपयोगकर्ताओं को रीसेट करना चाहते हैं?",
							context_localusersettings:			"स्थानीय उपयोगकर्ता सेटिंग्स",
							modal_colorpicker1:					"नाम रंग",
							modal_colorpicker2:					"संदेश रंग",
							modal_colorpicker3:					"टैग रंग",
							modal_colorpicker4:					"लिपि का रंग",
							modal_header:						"स्थानीय उपयोगकर्ता सेटिंग्स",
							modal_ignoretagcolor:				"भूमिका रंग का प्रयोग करें",
							modal_invalidurl:					"असामान्य यूआरएल",
							modal_showaccountname:				"नाम दिखाएं",
							modal_showservernick:				"उपनाम दिखाएं",
							modal_tabheader1:					"उपयोगकर्ता",
							modal_tabheader2:					"नाम रंग",
							modal_tabheader3:					"टैग",
							modal_useravatar:					"अवतार",
							modal_username:						"स्थानीय उपयोगकर्ता नाम",
							modal_userolecolor:					"भूमिका रंग को अधिलेखित न करें",
							modal_usertag:						"टैग",
							modal_useservernick:				"उपनामों को अधिलेखित न करें",
							submenu_resetsettings:				"उपयोगकर्ता को रीसेट करें",
							submenu_usersettings:				"सेटिंग्स परिवर्तित करना"
						};
					case "hr":		// Croatian
						return {
							confirm_reset:						"Jeste li sigurni da želite resetirati ovog korisnika?",
							confirm_resetall:					"Jeste li sigurni da želite resetirati sve korisnike?",
							context_localusersettings:			"Postavke lokalnog korisnika",
							modal_colorpicker1:					"Naziv Boja",
							modal_colorpicker2:					"Boja poruke",
							modal_colorpicker3:					"Oznaka u boji",
							modal_colorpicker4:					"Boja fonta",
							modal_header:						"Postavke lokalnog korisnika",
							modal_ignoretagcolor:				"Koristite boju uloga",
							modal_invalidurl:					"Neispravna poveznica",
							modal_showaccountname:				"Prikaži ime",
							modal_showservernick:				"Prikaži nadimak",
							modal_tabheader1:					"Korisnik",
							modal_tabheader2:					"Naziv Boja",
							modal_tabheader3:					"Označiti",
							modal_useravatar:					"Avatar",
							modal_username:						"Lokalno korisničko ime",
							modal_userolecolor:					"Nemojte prebrisati boju uloge",
							modal_usertag:						"Označiti",
							modal_useservernick:				"Ne prepisujte nadimke",
							submenu_resetsettings:				"Resetiraj korisnika",
							submenu_usersettings:				"Promijeniti postavke"
						};
					case "hu":		// Hungarian
						return {
							confirm_reset:						"Biztosan vissza akarja állítani ezt a felhasználót?",
							confirm_resetall:					"Biztosan vissza akarja állítani az összes felhasználót?",
							context_localusersettings:			"Helyi felhasználói beállítások",
							modal_colorpicker1:					"Név színe",
							modal_colorpicker2:					"Üzenet színe",
							modal_colorpicker3:					"Címke színe",
							modal_colorpicker4:					"Betű szín",
							modal_header:						"Helyi felhasználói beállítások",
							modal_ignoretagcolor:				"Használja a Szerepszínt",
							modal_invalidurl:					"Érvénytelen URL",
							modal_showaccountname:				"Név megjelenítése",
							modal_showservernick:				"Becenév megjelenítése",
							modal_tabheader1:					"Felhasználó",
							modal_tabheader2:					"Név színe",
							modal_tabheader3:					"Címke",
							modal_useravatar:					"Avatar",
							modal_username:						"Helyi felhasználónév",
							modal_userolecolor:					"Ne írja felül a Szerepszínt",
							modal_usertag:						"Címke",
							modal_useservernick:				"Ne írja felül a beceneveket",
							submenu_resetsettings:				"Felhasználó visszaállítása",
							submenu_usersettings:				"Beállítások megváltoztatása"
						};
					case "it":		// Italian
						return {
							confirm_reset:						"Sei sicuro di voler reimpostare questo utente?",
							confirm_resetall:					"Sei sicuro di voler reimpostare tutti gli utenti?",
							context_localusersettings:			"Impostazioni utente locale",
							modal_colorpicker1:					"Colore nome",
							modal_colorpicker2:					"Colore messaggio",
							modal_colorpicker3:					"Colore tag",
							modal_colorpicker4:					"Colore del carattere",
							modal_header:						"Impostazioni utente locale",
							modal_ignoretagcolor:				"Usa colore ruolo",
							modal_invalidurl:					"URL non valido",
							modal_showaccountname:				"Mostra nome",
							modal_showservernick:				"Mostra soprannome",
							modal_tabheader1:					"Utente",
							modal_tabheader2:					"Nome Colore",
							modal_tabheader3:					"Etichetta",
							modal_useravatar:					"Avatar",
							modal_username:						"Nome utente locale",
							modal_userolecolor:					"Non sovrascrivere il colore del ruolo",
							modal_usertag:						"Etichetta",
							modal_useservernick:				"Non sovrascrivere i soprannomi",
							submenu_resetsettings:				"Reimposta utente",
							submenu_usersettings:				"Cambia impostazioni"
						};
					case "ja":		// Japanese
						return {
							confirm_reset:						"このユーザーをリセットしてもよろしいですか？",
							confirm_resetall:					"すべてのユーザーをリセットしてもよろしいですか？",
							context_localusersettings:			"ローカルユーザー設定",
							modal_colorpicker1:					"名前の色",
							modal_colorpicker2:					"メッセージの色",
							modal_colorpicker3:					"タグの色",
							modal_colorpicker4:					"フォントの色",
							modal_header:						"ローカルユーザー設定",
							modal_ignoretagcolor:				"役割の色を使用する",
							modal_invalidurl:					"無効なURL",
							modal_showaccountname:				"名前を表示",
							modal_showservernick:				"ニックネームを表示",
							modal_tabheader1:					"ユーザー",
							modal_tabheader2:					"名前の色",
							modal_tabheader3:					"鬼ごっこ",
							modal_useravatar:					"アバター",
							modal_username:						"ローカルユーザー名",
							modal_userolecolor:					"役割の色を上書きしないでください",
							modal_usertag:						"鬼ごっこ",
							modal_useservernick:				"ニックネームを上書きしないでください",
							submenu_resetsettings:				"ユーザーのリセット",
							submenu_usersettings:				"設定を変更する"
						};
					case "ko":		// Korean
						return {
							confirm_reset:						"이 사용자를 재설정 하시겠습니까?",
							confirm_resetall:					"모든 사용자를 재설정 하시겠습니까?",
							context_localusersettings:			"로컬 사용자 설정",
							modal_colorpicker1:					"이름 색상",
							modal_colorpicker2:					"메시지 색상",
							modal_colorpicker3:					"태그 색상",
							modal_colorpicker4:					"글자 색",
							modal_header:						"로컬 사용자 설정",
							modal_ignoretagcolor:				"역할 색상 사용",
							modal_invalidurl:					"잘못된 URL",
							modal_showaccountname:				"이름 표시",
							modal_showservernick:				"닉네임 표시",
							modal_tabheader1:					"사용자",
							modal_tabheader2:					"이름 색상",
							modal_tabheader3:					"꼬리표",
							modal_useravatar:					"화신",
							modal_username:						"로컬 사용자 이름",
							modal_userolecolor:					"역할 색상을 덮어 쓰지 마십시오.",
							modal_usertag:						"꼬리표",
							modal_useservernick:				"별명을 덮어 쓰지 마십시오",
							submenu_resetsettings:				"사용자 재설정",
							submenu_usersettings:				"설정 변경"
						};
					case "lt":		// Lithuanian
						return {
							confirm_reset:						"Ar tikrai norite iš naujo nustatyti šį naudotoją?",
							confirm_resetall:					"Ar tikrai norite iš naujo nustatyti visus naudotojus?",
							context_localusersettings:			"Vietinio vartotojo nustatymai",
							modal_colorpicker1:					"Pavadinimo spalva",
							modal_colorpicker2:					"Pranešimo spalva",
							modal_colorpicker3:					"Žymos spalva",
							modal_colorpicker4:					"Šrifto spalva",
							modal_header:						"Vietinio vartotojo nustatymai",
							modal_ignoretagcolor:				"Naudokite vaidmens spalvą",
							modal_invalidurl:					"Neteisingas URL",
							modal_showaccountname:				"Rodyti pavadinimą",
							modal_showservernick:				"Rodyti slapyvardį",
							modal_tabheader1:					"Vartotojas",
							modal_tabheader2:					"Pavadinimo spalva",
							modal_tabheader3:					"Žyma",
							modal_useravatar:					"Avataras",
							modal_username:						"Vietinis vartotojo vardas",
							modal_userolecolor:					"Neperrašykite vaidmens spalvos",
							modal_usertag:						"Žyma",
							modal_useservernick:				"Neperrašykite slapyvardžių",
							submenu_resetsettings:				"Iš naujo nustatyti vartotoją",
							submenu_usersettings:				"Pakeisti nustatymus"
						};
					case "nl":		// Dutch
						return {
							confirm_reset:						"Weet u zeker dat u deze gebruiker wilt resetten?",
							confirm_resetall:					"Weet u zeker dat u alle gebruikers wilt resetten?",
							context_localusersettings:			"Lokale gebruikersinstellingen",
							modal_colorpicker1:					"Naamkleur",
							modal_colorpicker2:					"Berichtkleur",
							modal_colorpicker3:					"Tagkleur",
							modal_colorpicker4:					"Letterkleur",
							modal_header:						"Lokale gebruikersinstellingen",
							modal_ignoretagcolor:				"Gebruik rolkleur",
							modal_invalidurl:					"Ongeldige URL",
							modal_showaccountname:				"Toon naam",
							modal_showservernick:				"Bijnaam weergeven",
							modal_tabheader1:					"Gebruiker",
							modal_tabheader2:					"Naamkleur",
							modal_tabheader3:					"Label",
							modal_useravatar:					"Avatar",
							modal_username:						"Lokale gebruikersnaam",
							modal_userolecolor:					"Overschrijf de rolkleur niet",
							modal_usertag:						"Label",
							modal_useservernick:				"Overschrijf geen bijnamen",
							submenu_resetsettings:				"Gebruiker resetten",
							submenu_usersettings:				"Instellingen veranderen"
						};
					case "no":		// Norwegian
						return {
							confirm_reset:						"Er du sikker på at du vil tilbakestille denne brukeren?",
							confirm_resetall:					"Er du sikker på at du vil tilbakestille alle brukere?",
							context_localusersettings:			"Lokale brukerinnstillinger",
							modal_colorpicker1:					"Navnfarge",
							modal_colorpicker2:					"Meldingfarge",
							modal_colorpicker3:					"Merkefarge",
							modal_colorpicker4:					"Skriftfarge",
							modal_header:						"Lokale brukerinnstillinger",
							modal_ignoretagcolor:				"Bruk rollefarge",
							modal_invalidurl:					"Ugyldig URL",
							modal_showaccountname:				"Vis navn",
							modal_showservernick:				"Vis kallenavn",
							modal_tabheader1:					"Bruker",
							modal_tabheader2:					"Navnfarge",
							modal_tabheader3:					"Stikkord",
							modal_useravatar:					"Avatar",
							modal_username:						"Lokalt brukernavn",
							modal_userolecolor:					"Ikke skriv rollefargen",
							modal_usertag:						"Stikkord",
							modal_useservernick:				"Ikke overskriv kallenavn",
							submenu_resetsettings:				"Tilbakestill bruker",
							submenu_usersettings:				"Endre innstillinger"
						};
					case "pl":		// Polish
						return {
							confirm_reset:						"Czy na pewno chcesz zresetować tego użytkownika?",
							confirm_resetall:					"Czy na pewno chcesz zresetować wszystkich użytkowników?",
							context_localusersettings:			"Ustawienia użytkownika lokalnego",
							modal_colorpicker1:					"Nazwa Kolor",
							modal_colorpicker2:					"Kolor wiadomości",
							modal_colorpicker3:					"Kolor tagu",
							modal_colorpicker4:					"Kolor czcionki",
							modal_header:						"Ustawienia użytkownika lokalnego",
							modal_ignoretagcolor:				"Użyj koloru roli",
							modal_invalidurl:					"Nieprawidłowy URL",
							modal_showaccountname:				"Pokaż nazwę",
							modal_showservernick:				"Pokaż pseudonim",
							modal_tabheader1:					"Użytkownik",
							modal_tabheader2:					"Nazwa Kolor",
							modal_tabheader3:					"Etykietka",
							modal_useravatar:					"Awatara",
							modal_username:						"Lokalna nazwa użytkownika",
							modal_userolecolor:					"Nie zastępuj koloru roli",
							modal_usertag:						"Etykietka",
							modal_useservernick:				"Nie nadpisuj pseudonimów",
							submenu_resetsettings:				"Resetuj użytkownika",
							submenu_usersettings:				"Zmień ustawienia"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							confirm_reset:						"Tem certeza de que deseja redefinir este usuário?",
							confirm_resetall:					"Tem certeza de que deseja redefinir todos os usuários?",
							context_localusersettings:			"Configurações de usuário local",
							modal_colorpicker1:					"Cor do nome",
							modal_colorpicker2:					"Cor da Mensagem",
							modal_colorpicker3:					"Cor da tag",
							modal_colorpicker4:					"Cor da fonte",
							modal_header:						"Configurações de usuário local",
							modal_ignoretagcolor:				"Use a cor da função",
							modal_invalidurl:					"URL inválida",
							modal_showaccountname:				"Mostrar nome",
							modal_showservernick:				"Mostrar apelido",
							modal_tabheader1:					"Do utilizador",
							modal_tabheader2:					"Cor do Nome",
							modal_tabheader3:					"Tag",
							modal_useravatar:					"Avatar",
							modal_username:						"Nome de usuário local",
							modal_userolecolor:					"Não sobrescreva a Cor da Função",
							modal_usertag:						"Tag",
							modal_useservernick:				"Não sobrescrever apelidos",
							submenu_resetsettings:				"Reiniciar usuário",
							submenu_usersettings:				"Mudar configurações"
						};
					case "ro":		// Romanian
						return {
							confirm_reset:						"Sigur doriți să resetați acest utilizator?",
							confirm_resetall:					"Sigur doriți să resetați toți utilizatorii?",
							context_localusersettings:			"Setări locale ale utilizatorului",
							modal_colorpicker1:					"Culoare nume",
							modal_colorpicker2:					"Culoarea mesajului",
							modal_colorpicker3:					"Culoare etichetă",
							modal_colorpicker4:					"Culoarea fontului",
							modal_header:						"Setări locale ale utilizatorului",
							modal_ignoretagcolor:				"Utilizați culoarea rolului",
							modal_invalidurl:					"URL invalid",
							modal_showaccountname:				"Afișează numele",
							modal_showservernick:				"Afișează porecla",
							modal_tabheader1:					"Utilizator",
							modal_tabheader2:					"Culoare nume",
							modal_tabheader3:					"Etichetă",
							modal_useravatar:					"Avatar",
							modal_username:						"Nume utilizator local",
							modal_userolecolor:					"Nu suprascrieți culoarea rolului",
							modal_usertag:						"Etichetă",
							modal_useservernick:				"Nu suprascrieți porecle",
							submenu_resetsettings:				"Resetați utilizatorul",
							submenu_usersettings:				"Schimbă setările"
						};
					case "ru":		// Russian
						return {
							confirm_reset:						"Вы уверены, что хотите сбросить этого пользователя?",
							confirm_resetall:					"Вы уверены, что хотите сбросить всех пользователей?",
							context_localusersettings:			"Настройки локального пользователя",
							modal_colorpicker1:					"Цвет имени",
							modal_colorpicker2:					"Цвет сообщения",
							modal_colorpicker3:					"Цвет метки",
							modal_colorpicker4:					"Цвет шрифта",
							modal_header:						"Настройки локального пользователя",
							modal_ignoretagcolor:				"Использовать цвет роли",
							modal_invalidurl:					"Неверная ссылка",
							modal_showaccountname:				"Показать имя",
							modal_showservernick:				"Показать ник",
							modal_tabheader1:					"Пользователь",
							modal_tabheader2:					"Цвет имени",
							modal_tabheader3:					"Тег",
							modal_useravatar:					"Аватар",
							modal_username:						"Локальное имя пользователя",
							modal_userolecolor:					"Не перезаписывайте цвет роли",
							modal_usertag:						"Тег",
							modal_useservernick:				"Не перезаписывать никнеймы",
							submenu_resetsettings:				"Сбросить пользователя",
							submenu_usersettings:				"Изменить настройки"
						};
					case "sv":		// Swedish
						return {
							confirm_reset:						"Är du säker på att du vill återställa den här användaren?",
							confirm_resetall:					"Är du säker på att du vill återställa alla användare?",
							context_localusersettings:			"Lokala användarinställningar",
							modal_colorpicker1:					"Namnfärg",
							modal_colorpicker2:					"Meddelandefärg",
							modal_colorpicker3:					"Taggfärg",
							modal_colorpicker4:					"Fontfärg",
							modal_header:						"Lokala användarinställningar",
							modal_ignoretagcolor:				"Använd rollfärg",
							modal_invalidurl:					"Ogiltig URL",
							modal_showaccountname:				"Visa namn",
							modal_showservernick:				"Visa smeknamn",
							modal_tabheader1:					"Användare",
							modal_tabheader2:					"Namnfärg",
							modal_tabheader3:					"Märka",
							modal_useravatar:					"Avatar",
							modal_username:						"Lokalt användarnamn",
							modal_userolecolor:					"Skriv inte över rollfärgen",
							modal_usertag:						"Märka",
							modal_useservernick:				"Skriv inte över smeknamn",
							submenu_resetsettings:				"Återställ användare",
							submenu_usersettings:				"Ändra inställningar"
						};
					case "th":		// Thai
						return {
							confirm_reset:						"แน่ใจไหมว่าต้องการรีเซ็ตผู้ใช้นี้",
							confirm_resetall:					"แน่ใจไหมว่าต้องการรีเซ็ตผู้ใช้ทั้งหมด",
							context_localusersettings:			"การตั้งค่าผู้ใช้ภายใน",
							modal_colorpicker1:					"ชื่อสี",
							modal_colorpicker2:					"สีข้อความ",
							modal_colorpicker3:					"สีแท็ก",
							modal_colorpicker4:					"สีตัวอักษร",
							modal_header:						"การตั้งค่าผู้ใช้ภายใน",
							modal_ignoretagcolor:				"ใช้สีของบทบาท",
							modal_invalidurl:					"URL ไม่ถูกต้อง",
							modal_showaccountname:				"แสดงชื่อ",
							modal_showservernick:				"แสดงชื่อเล่น",
							modal_tabheader1:					"ผู้ใช้",
							modal_tabheader2:					"ชื่อสี",
							modal_tabheader3:					"แท็ก",
							modal_useravatar:					"สัญลักษณ์",
							modal_username:						"ชื่อผู้ใช้ท้องถิ่น",
							modal_userolecolor:					"อย่าเขียนทับสีของบทบาท",
							modal_usertag:						"แท็ก",
							modal_useservernick:				"อย่าเขียนทับชื่อเล่น",
							submenu_resetsettings:				"รีเซ็ตผู้ใช้",
							submenu_usersettings:				"เปลี่ยนการตั้งค่า"
						};
					case "tr":		// Turkish
						return {
							confirm_reset:						"Bu Kullanıcıyı sıfırlamak istediğinizden emin misiniz?",
							confirm_resetall:					"Tüm Kullanıcıları sıfırlamak istediğinizden emin misiniz?",
							context_localusersettings:			"Yerel Kullanıcı Ayarları",
							modal_colorpicker1:					"İsim Rengi",
							modal_colorpicker2:					"Mesaj Rengi",
							modal_colorpicker3:					"Etiket Rengi",
							modal_colorpicker4:					"Yazı rengi",
							modal_header:						"Yerel Kullanıcı Ayarları",
							modal_ignoretagcolor:				"Rol Rengini Kullan",
							modal_invalidurl:					"Geçersiz URL",
							modal_showaccountname:				"İsim göster",
							modal_showservernick:				"Takma adı göster",
							modal_tabheader1:					"Kullanıcı",
							modal_tabheader2:					"İsim Rengi",
							modal_tabheader3:					"Etiket",
							modal_useravatar:					"Avatar",
							modal_username:						"Yerel Kullanıcı Adı",
							modal_userolecolor:					"Rol Renginin üzerine yazmayın",
							modal_usertag:						"Etiket",
							modal_useservernick:				"Takma adların üzerine yazmayın",
							submenu_resetsettings:				"Kullanıcıyı Sıfırla",
							submenu_usersettings:				"Ayarları değiştir"
						};
					case "uk":		// Ukrainian
						return {
							confirm_reset:						"Ви впевнені, що хочете скинути налаштування цього користувача?",
							confirm_resetall:					"Ви впевнені, що хочете скинути налаштування всіх користувачів?",
							context_localusersettings:			"Налаштування локального користувача",
							modal_colorpicker1:					"Назва Колір",
							modal_colorpicker2:					"Колір повідомлення",
							modal_colorpicker3:					"Колір тегу",
							modal_colorpicker4:					"Колір шрифту",
							modal_header:						"Налаштування локального користувача",
							modal_ignoretagcolor:				"Використовуйте колір ролі",
							modal_invalidurl:					"Недійсна URL-адреса",
							modal_showaccountname:				"Показати ім'я",
							modal_showservernick:				"Показати псевдонім",
							modal_tabheader1:					"Користувач",
							modal_tabheader2:					"Назва Колір",
							modal_tabheader3:					"Позначка",
							modal_useravatar:					"Аватар",
							modal_username:						"Локальне ім’я користувача",
							modal_userolecolor:					"Не перезаписуйте колір ролі",
							modal_usertag:						"Позначка",
							modal_useservernick:				"Не перезаписуйте псевдоніми",
							submenu_resetsettings:				"Скинути налаштування користувача",
							submenu_usersettings:				"Змінити налаштування"
						};
					case "vi":		// Vietnamese
						return {
							confirm_reset:						"Bạn có chắc chắn muốn đặt lại Người dùng này không?",
							confirm_resetall:					"Bạn có chắc chắn muốn đặt lại tất cả Người dùng không?",
							context_localusersettings:			"Cài đặt người dùng cục bộ",
							modal_colorpicker1:					"Tên màu",
							modal_colorpicker2:					"Màu tin nhắn",
							modal_colorpicker3:					"Màu thẻ",
							modal_colorpicker4:					"Màu phông chữ",
							modal_header:						"Cài đặt người dùng cục bộ",
							modal_ignoretagcolor:				"Sử dụng màu vai trò",
							modal_invalidurl:					"URL không hợp lệ",
							modal_showaccountname:				"Hiện tên",
							modal_showservernick:				"Hiển thị biệt hiệu",
							modal_tabheader1:					"Người dùng",
							modal_tabheader2:					"Tên màu",
							modal_tabheader3:					"Nhãn",
							modal_useravatar:					"Hình đại diện",
							modal_username:						"Tên người dùng cục bộ",
							modal_userolecolor:					"Không ghi đè Màu vai trò",
							modal_usertag:						"Nhãn",
							modal_useservernick:				"Không ghi đè biệt hiệu",
							submenu_resetsettings:				"Đặt lại người dùng",
							submenu_usersettings:				"Thay đổi cài đặt"
						};
					case "zh-CN":	// Chinese (China)
						return {
							confirm_reset:						"您确定要重置此用户吗？",
							confirm_resetall:					"您确定要重置所有用户吗？",
							context_localusersettings:			"本地用户设置",
							modal_colorpicker1:					"名称颜色",
							modal_colorpicker2:					"讯息颜色",
							modal_colorpicker3:					"标签颜色",
							modal_colorpicker4:					"字体颜色",
							modal_header:						"本地用户设置",
							modal_ignoretagcolor:				"使用角色颜色",
							modal_invalidurl:					"无效的网址",
							modal_showaccountname:				"显示名称",
							modal_showservernick:				"显示昵称",
							modal_tabheader1:					"用户",
							modal_tabheader2:					"名称颜色",
							modal_tabheader3:					"标签",
							modal_useravatar:					"头像",
							modal_username:						"本地用户名",
							modal_userolecolor:					"不要覆盖角色颜色",
							modal_usertag:						"标签",
							modal_useservernick:				"不要覆盖昵称",
							submenu_resetsettings:				"重置用户",
							submenu_usersettings:				"更改设置"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							confirm_reset:						"您確定要重置此用戶嗎？",
							confirm_resetall:					"您確定要重置所有用戶嗎？",
							context_localusersettings:			"本地用戶設置",
							modal_colorpicker1:					"名稱顏色",
							modal_colorpicker2:					"訊息顏色",
							modal_colorpicker3:					"標籤顏色",
							modal_colorpicker4:					"字體顏色",
							modal_header:						"本地用戶設置",
							modal_ignoretagcolor:				"使用角色顏色",
							modal_invalidurl:					"無效的網址",
							modal_showaccountname:				"顯示名稱",
							modal_showservernick:				"顯示暱稱",
							modal_tabheader1:					"用戶",
							modal_tabheader2:					"名稱顏色",
							modal_tabheader3:					"標籤",
							modal_useravatar:					"頭像",
							modal_username:						"本地用戶名",
							modal_userolecolor:					"不要覆蓋角色顏色",
							modal_usertag:						"標籤",
							modal_useservernick:				"不要覆蓋暱稱",
							submenu_resetsettings:				"重置用戶",
							submenu_usersettings:				"更改設置"
						};
					default:		// English
						return {
							confirm_reset:						"Are you sure you want to reset this User?",
							confirm_resetall:					"Are you sure you want to reset all Users?",
							context_localusersettings:			"Local User Settings",
							modal_colorpicker1:					"Name Color",
							modal_colorpicker2:					"Message Color",
							modal_colorpicker3:					"Tag Color",
							modal_colorpicker4:					"Font Color",
							modal_header:						"Local User Settings",
							modal_ignoretagcolor:				"Use Role Color",
							modal_invalidurl:					"Invalid URL",
							modal_showaccountname:				"Show Name",
							modal_showservernick:				"Show Nickname",
							modal_tabheader1:					"User",
							modal_tabheader2:					"Name Color",
							modal_tabheader3:					"Tag",
							modal_useravatar:					"Avatar",
							modal_username:						"Local Username",
							modal_userolecolor:					"Do not overwrite the Role Color",
							modal_usertag:						"Tag",
							modal_useservernick:				"Do not overwrite Nicknames",
							submenu_resetsettings:				"Reset User",
							submenu_usersettings:				"Change Settings"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
