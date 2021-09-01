/**
 * @name EditUsers
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 4.3.8
 * @description Allows you to locally edit Users
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditUsers/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/EditUsers/EditUsers.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "EditUsers",
			"author": "DevilBro",
			"version": "4.3.8",
			"description": "Allows you to locally edit Users"
		},
		"changeLog": {
			"improved": {
				"Threads": "Works flawlessly with Threads now"
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
		var changedUsers = {};
	
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
						mutualFriends:		{value: true, 		description: "Mutual Friends"},
						autocompletes:		{value: true, 		description: "Autocomplete Menu"},
						guildSettings:		{value: true, 		description: "Server Settings"},
						quickSwitcher:		{value: true, 		description: "Quick Switcher"},
						searchPopout:		{value: true, 		description: "Search Popout"},
						userAccount:		{value: true, 		description: "Your Account Information"},
						appTitle:			{value: true, 		description: "Discord App Title (DMs)"}
					}
				};
			
				this.patchedModules = {
					before: {
						HeaderBarContainer: "render",
						ChannelEditorContainer: "render",
						AutocompleteUserResult: "render",
						UserPopoutInfo: "UserPopoutInfo",
						UserProfileModal: "default",
						UserProfileModalHeader: "default",
						UserInfo: "default",
						NowPlayingItem: "default",
						VoiceUser: "render",
						RTCConnectionVoiceUsers: "default",
						Account: "render",
						Message: "default",
						MessageUsername: "default",
						MessageContent: "type",
						ThreadMessageAccessoryMessage: "default",
						ReactorsComponent: "render",
						ChannelReply: "default",
						MemberListItem: "render",
						AuditLogs: "render",
						AuditLog: "render",
						GuildSettingsEmoji: "render",
						MemberCard: "render",
						SettingsInvites: "render",
						GuildSettingsBans: "render",
						InvitationCard: "render",
						PrivateChannel: "render",
						PrivateChannelRecipientsInvitePopout: "render",
						QuickSwitchUserResult: "render",
						SearchPopoutComponent: "render",
						PrivateChannelCallParticipants: "render",
						ChannelCall: "render",
						PictureInPictureVideo: "default",
						UserSummaryItem: "render"
					},
					after: {
						ChannelCallHeader: "default",
						AutocompleteUserResult: "render",
						DiscordTag: "default",
						NameTag: "default",
						FocusRing: "default",
						UserPopoutContainer: "type",
						UserPopoutInfo: "UserPopoutInfo",
						MutualFriends: "default",
						VoiceUser: "render",
						Account: "render",
						PrivateChannelEmptyMessage: "default",
						MessageHeader: "default",
						MessageUsername: "default",
						MessageContent: "type",
						Reaction: "render",
						ReactorsComponent: "render",
						UserMention: "default",
						RichUserMention: "UserMention",
						ChannelReply: "default",
						MemberListItem: "render",
						UserHook: "render",
						InvitationCard: "render",
						InviteModalUserRow: "default",
						TypingUsers: "render",
						DirectMessage: "render",
						RTCConnection: "render",
						PrivateChannel: "render",
						QuickSwitchUserResult: "render",
						IncomingCallModal: "default"
					}
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
				`;
			}
			
			onStart () {				
				let observer = new MutationObserver(_ => {this.changeAppTitle();});
				BDFDB.ObserverUtils.connect(this, document.head.querySelector("title"), {name: "appTitleObserver", instance: observer}, {childList: true});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MessageAuthorUtils, ["default", "getMessageAuthor"], {after: e => {
					if (this.settings.places.chatWindow && e.methodArguments[0] && e.methodArguments[0].author && changedUsers[e.methodArguments[0].author.id] && this.shouldChangeInChat(e.methodArguments[0].channel_id)) {
						let data = changedUsers[e.methodArguments[0].author.id];
						if (data.name || data.color1) {
							let member = BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(e.methodArguments[0].channel_id) || {}).guild_id, e.methodArguments[0].author.id);
							let color1 = data.color1 && data.useRoleColor && member && member.colorString || data.color1;
							if (data.name) e.returnValue.nick = data.useServerNick && member && member.nick || [data.name, data.showServerNick && member && member.nick && `(${member.nick})`].filter(n => n).join(" ");
							if (color1) e.returnValue.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
						}
					}
				}});
				
				let searchGroupData = BDFDB.ObjectUtils.get(BDFDB.ModuleUtils.findByName("SearchPopoutComponent", false), "exports.GroupData");
				if (BDFDB.ObjectUtils.is(searchGroupData)) {
					BDFDB.PatchUtils.patch(this, searchGroupData.FILTER_FROM, "component", {after: e => {
						if (typeof e.returnValue.props.renderResult == "function") {
							let renderResult = e.returnValue.props.renderResult;
							e.returnValue.props.renderResult = (...args) => {
								let result = renderResult(...args);
								this.processSearchPopoutUserResult({instance: {props: e.methodArguments[0]}, returnvalue: result});
								return result;
							};
						}
					}});
					BDFDB.PatchUtils.patch(this, searchGroupData.FILTER_MENTIONS, "component", {after: e => {
						if (typeof e.returnValue.props.renderResult == "function") {
							let renderResult = e.returnValue.props.renderResult;
							e.returnValue.props.renderResult = (...args) => {
								let result = renderResult(...args);
								this.processSearchPopoutUserResult({instance: {props: e.methodArguments[0]}, returnvalue: result});
								return result;
							};
						}
					}});
				}
				if (BDFDB.LibraryModules.AutocompleteOptions && BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS) BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS.MENTIONS, "queryResults", {after: e => {
					let userArray = [];
					for (let id in changedUsers) if (changedUsers[id] && changedUsers[id].name) {
						let user = BDFDB.LibraryModules.UserStore.getUser(id);
						let member = user && e.methodArguments[0].guild_id && BDFDB.LibraryModules.MemberStore.getMember(e.methodArguments[0].guild_id, id);
						if (user && (e.methodArguments[0].recipients.includes(id) || member)) userArray.push(Object.assign({
							comparator: changedUsers[id].name,
							nick: member && member.nick || null,
							score: 0,
							user: user
						}, changedUsers[id]));
					}
					userArray = BDFDB.ArrayUtils.keySort(userArray.filter(n => e.returnValue.results.users.every(comp => comp.user.id != n.user.id) && n.comparator.toLowerCase().indexOf(e.methodArguments[2].toLowerCase()) != -1), "lowerCaseName");
					e.returnValue.results.users = [].concat(e.returnValue.results.users, userArray.map(n => ({user: n.user}))).slice(0, BDFDB.DiscordConstants.MAX_AUTOCOMPLETE_RESULTS);
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.IconUtils, "getUserBannerURL", {instead: e => {
					let user = BDFDB.LibraryModules.UserStore.getUser(e.methodArguments[0].id);
					if (user) {
						if (user.id == "278543574059057154") return user.banner;
						let data = changedUsers[user.id];
						if (data && data.banner && !data.removeBanner) return data.banner;
					}
					return e.callOriginalMethod();
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.StatusMetaUtils, "findActivity", {after: e => {
					let data = changedUsers[e.methodArguments[0]];
					if (data && (data.removeStatus || data.status || data.statusEmoji) && (e.returnValue && e.returnValue.type === BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS || !e.returnValue && e.methodArguments[1] && e.methodArguments[1].toString().indexOf("type===") > -1 && e.methodArguments[1].toString().indexOf("CUSTOM_STATUS") > -1)) return this.createCustomStatus(changedUsers[e.methodArguments[0]]);
				}});
				
				this.forceUpdateAll();
			}
			
			onStop () {
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
								children: !Object.keys(changedUsers).length ? BDFDB.LanguageUtils.LanguageStrings.NONE : Object.keys(changedUsers).filter(BDFDB.LibraryModules.UserStore.getUser).map(id => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
									text: this.getUserData(id).username,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.AvatarComponents.default, {
										className: BDFDB.disCN.listavatar,
										src: this.getUserAvatar(id),
										size: BDFDB.LibraryComponents.AvatarComponents.Sizes.SIZE_32,
										onClick: _ => this.openUserSettingsModal(BDFDB.LibraryModules.UserStore.getUser(id))
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
				BDFDB.MessageUtils.rerenderAll();
			}
		
			onUserContextMenu (e) {
				if (e.instance.props.user) {
					let userName = this.getUserData(e.instance.props.user.id).username;
					if (userName != e.instance.props.user.username && this.settings.places.contextMenu) {
						let [kickChilden, kickIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "kick"});
						if (kickIndex > -1) kickChilden[kickIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("KICK_USER", userName);
						let [banChilden, banIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "ban"});
						if (banIndex > -1) banChilden[banIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("BAN_USER", userName);
						let [muteChilden, muteIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "mute-channel"});
						if (muteIndex > -1) muteChilden[muteIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("MUTE_CHANNEL", `@${userName}`);
						let [unmuteChilden, unmuteIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "unmute-channel"});
						if (unmuteIndex > -1) unmuteChilden[unmuteIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("UNMUTE_CHANNEL", `@${userName}`);
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
										action: _ => {
											this.openUserSettingsModal(e.instance.props.user);
										}
									}),
									BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
										label: this.labels.submenu_resetsettings,
										id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-reset"),
										color: BDFDB.LibraryComponents.MenuItems.Colors.DANGER,
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
			
			processChannelEditorContainer (e) {
				if (!e.instance.props.disabled && e.instance.props.channel && e.instance.props.channel.isDM() && e.instance.props.type == BDFDB.DiscordConstants.TextareaTypes.NORMAL && this.settings.places.chatTextarea) {
					let user = BDFDB.LibraryModules.UserStore.getUser(e.instance.props.channel.recipients[0]);
					if (user) e.instance.props.placeholder = BDFDB.LanguageUtils.LanguageStringsFormat("TEXTAREA_PLACEHOLDER", `@${changedUsers[user.id] && changedUsers[user.id].name || user.username}`);
				}
			}

			processAutocompleteUserResult (e) {
				if (e.instance.props.user && this.settings.places.autocompletes) {
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
								let userName = BDFDB.ReactUtils.findChild(children, {name: "AutocompleteRowHeading"});
								if (userName) this.changeUserColor(userName, e.instance.props.user.id);
								return children;
							}, "", this);
						}
					}
				}
			}

			processHeaderBarContainer (e) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.channelId);
				if (channel && channel.isDM() && this.settings.places.dmHeader) {
					let userName = BDFDB.ReactUtils.findChild(e.instance, {name: "Title"});
					if (userName) {
						let recipientId = channel.getRecipientId();
						userName.props.children = this.getUserData(recipientId).username;
						this.changeUserColor(userName, recipientId);
					}
				}
			}

			processChannelCallHeader (e) {
				if (e.instance.props.channel && e.instance.props.channel.isDM() && this.settings.places.dmHeader) {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "Title"});
					if (userName) {
						let recipientId = e.instance.props.channel.getRecipientId();
						userName.props.children = this.getUserData(recipientId).username;
						this.changeUserColor(userName, recipientId);
					}
				}
			}
			
			processDiscordTag (e) {
				this.processNameTag(e);
			}
			
			processNameTag (e) {
				if (e.returnvalue && e.instance.props.user && (e.instance.props.className || e.instance.props.usernameClass)) {
					let change = false, guildId = null;
					let changeBackground = false;
					let tagClass = "";
					switch (e.instance.props.className) {
						case BDFDB.disCN.userpopoutheadertagnonickname:
							change = this.settings.places.userPopout;
							guildId = BDFDB.LibraryModules.LastGuildStore.getGuildId();
							changeBackground = true;
							tagClass = BDFDB.disCNS.userpopoutheaderbottag + BDFDB.disCN.bottagnametag;
							break;
						case BDFDB.disCN.guildsettingsinviteusername:
							change = this.settings.places.guildSettings;
							break;
						case BDFDB.disCN.peoplesdiscordtag:
							change = this.settings.places.friendList;
							tagClass = BDFDB.disCN.bottagnametag;
							break;
					}
					switch (e.instance.props.usernameClass) {
						case BDFDB.disCN.messagereactionsmodalusername:
							change = this.settings.places.reactions && !BDFDB.LibraryModules.MemberStore.getNick(BDFDB.LibraryModules.LastGuildStore.getGuildId(), e.instance.props.user.id);
							break;
						case BDFDB.disCN.userprofileusername:
							change = this.settings.places.userProfile;
							guildId = BDFDB.LibraryModules.LastGuildStore.getGuildId();
							changeBackground = true;
							tagClass = BDFDB.disCNS.userprofilebottag + BDFDB.disCN.bottagnametag;
							break;
					}
					if (change) {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.username]]});
						if (userName) this.changeUserColor(userName, e.instance.props.user.id, {
							changeBackground: changeBackground
						});
						if (tagClass) this.injectBadge(e.returnvalue.props.children, e.instance.props.user.id, guildId, 2, {
							tagClass: tagClass,
							useRem: e.instance.props.useRemSizes,
							inverted: e.instance.props.invertBotTagColor
						});
					}
				}
			}

			processFocusRing (e) {
				if (e.returnvalue && e.returnvalue.props.className) {
					let change, userId, nameClass, modify = {};
					if (this.settings.places.chatWindow && e.returnvalue.props.className.indexOf(BDFDB.disCN.messageswelcomethreadcreator) > -1) {
						change = true;
						userId = BDFDB.ReactUtils.findValue(e.returnvalue._owner, "userId", {up: true});
					}
					if (change && userId) {
						if (changedUsers[userId]) {
							let name = nameClass ? BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", nameClass]]}) : e.returnvalue;
							if (name) {
								if (changedUsers[userId].name) name.props.children = changedUsers[userId].name;
								this.changeUserColor(name, userId, modify);
							}
						}
					}
				}
			}

			processUserPopoutContainer (e) {
				if (e.returnvalue.props.user && this.settings.places.userPopout && changedUsers[e.returnvalue.props.user.id]) e.returnvalue.props.user = this.getUserData(e.returnvalue.props.user.id, true, true);
			}

			processUserPopoutInfo (e) {
				if (e.instance.props.user && this.settings.places.userPopout) {
					let data = changedUsers[e.instance.props.user.id];
					if (!data) return;
					if (!e.returnvalue) {
						if (data.name && !(data.useServerNick && e.instance.props.nickname)) e.instance.props.nickname = [data.name, data.showServerNick && e.instance.props.nickname && `(${e.instance.props.nickname})`].filter(n => n).join(" ");
					}
					else {
						if (data.color1 || data.color2 || data.tag) {
							let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.userpopoutheadernickname]]});
							if (index > -1) {
								this.changeUserColor(children[index], e.instance.props.user.id, {changeBackground: true});
								if (!BDFDB.ArrayUtils.is(children[index].props.children)) children[index].props.children = [children[index].props.children].flat(10);
								this.injectBadge(children[index].props.children, e.instance.props.user.id, BDFDB.LibraryModules.LastGuildStore.getGuildId(), 2, {
									tagClass: BDFDB.disCNS.userpopoutheaderbottag + BDFDB.disCN.bottagnametag,
									inverted: typeof e.instance.getMode == "function" && e.instance.getMode() !== "Normal"
								});
							}
						}
					}
				}
			}

			processUserProfileModal (e) {
				if (e.instance.props.user && this.settings.places.userProfile) e.instance.props.user = this.getUserData(e.instance.props.user.id);
			}

			processUserProfileModalHeader (e) {
				if (e.instance.props.user && this.settings.places.userProfile) e.instance.props.user = this.getUserData(e.instance.props.user.id);
			}

			processMutualFriends (e) {
				if (this.settings.places.mutualFriends) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "FriendRow"});
					if (index > -1) for (let row of children) if (row && row.props && row.props.user) row.props.user = this.getUserData(row.props.user.id);
				}
			}

			processUserInfo (e) {
				if (e.instance.props.user && this.settings.places.friendList) {
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
			}

			processNowPlayingItem (e) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.instance, {name: "NowPlayingHeader"});
				if (index > -1) for (let child of children) if (child && child.props && child.props.party) {
					if (child.type && child.type.displayName == "NowPlayingHeader") {
						const type = child.type;
						child.type = (...args) => {
							const returnValue = type(...args);
							if (BDFDB.ObjectUtils.get(returnValue, "props.priorityUser.user.username") == returnValue.props.title) {
								returnValue.props.title = BDFDB.ReactUtils.createElement("span", {children: returnValue.props.title});
								this.changeUserColor(returnValue.props.title, returnValue.props.priorityUser.user.id);
							}
							return returnValue;
						};
					}
					child.props.party = Object.assign({}, child.props.party);
					if (child.props.party.partiedMembers) for (let i in child.props.party.partiedMembers) if (child.props.party.partiedMembers[i]) child.props.party.partiedMembers[i] = this.getUserData(child.props.party.partiedMembers[i].id);
					if (child.props.party.priorityMembers) for (let i in child.props.party.priorityMembers) if (child.props.party.priorityMembers[i]) child.props.party.priorityMembers[i] = Object.assign({}, child.props.party.priorityMembers[i], {user: this.getUserData(child.props.party.priorityMembers[i].user.id)});
					if (child.props.party.voiceChannels) for (let i in child.props.party.voiceChannels) if (child.props.party.voiceChannels[i]) child.props.party.voiceChannels[i] = Object.assign({}, child.props.party.voiceChannels[i], {members: [].concat(child.props.party.voiceChannels[i].members).map(user => this.getUserData(user.id))});
				}
			}
			
			processVoiceUser (e) {
				if (e.instance.props.user && this.settings.places.voiceChat) {
					if (!e.returnvalue) {
						e.instance.props.user = this.getUserData(e.instance.props.user.id);
						let data = changedUsers[e.instance.props.user.id];
						if (data && data.name) {
							let member = BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), e.instance.props.user.id);
							if (!member || !member.nick || !data.useServerNick) e.instance.props.nick = [data.name, data.showServerNick && member && member.nick && `(${member.nick})`].filter(n => n).join(" ");
						}
					}
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.voicename]]});
						if (userName) this.changeUserColor(userName, e.instance.props.user.id, {modify: e.instance.props});
					}
				}
			}

			processRTCConnectionVoiceUsers (e) {
				if (e.instance.props.voiceStates && this.settings.places.voiceChat) for (let i in e.instance.props.voiceStates) {
					let data = changedUsers[e.instance.props.voiceStates[i].user.id];
					if (data) {
						e.instance.props.voiceStates[i] = Object.assign({}, e.instance.props.voiceStates[i]);
						e.instance.props.voiceStates[i].user = this.getUserData(e.instance.props.voiceStates[i].user.id);
						if (data.name && (!e.instance.props.voiceStates[i].member.nick || !data.useServerNick)) e.instance.props.voiceStates[i].nick = [data.name, data.showServerNick && e.instance.props.voiceStates[i].member.nick && `(${e.instance.props.voiceStates[i].member.nick})`].filter(n => n).join(" ");
					}
				}
			}

			processAccount (e) {
				if (e.instance.props.currentUser && this.settings.places.userAccount) {
					let data = changedUsers[e.instance.props.currentUser.id];
					if (!e.returnvalue) {
						e.instance.props.currentUser = this.getUserData(e.instance.props.currentUser.id);
						if (data && (data.removeStatus || data.status || data.statusEmoji)) e.instance.props.customStatusActivity = this.createCustomStatus(data);
					}
					else {
						if (data && (data.color1 || data.color2)) {
							let tooltip = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "Tooltip"});
							if (tooltip && typeof tooltip.props.children == "function") {
								let renderChildren = tooltip.props.children;
								tooltip.props.children = BDFDB.TimeUtils.suppress((...args) => {
									let renderedChildren = renderChildren(...args);
									let userName = BDFDB.ReactUtils.findChild(renderedChildren, {name: "PanelTitle"});
									if (userName) this.changeUserColor(userName, e.instance.props.currentUser.id);
									return renderedChildren;
								}, "", this);
							}
						}
					}
				}
			}

			processPrivateChannelEmptyMessage (e) {
				if (e.instance.props.channel && e.instance.props.channel.isDM() && this.settings.places.chatWindow) {
					let recipientId = e.instance.props.channel.getRecipientId();
					let name = this.getUserData(recipientId).username;
					let avatar = BDFDB.ReactUtils.findChild(e.returnvalue.props.children, {props: "src"});
					if (avatar) avatar.props.src = this.getUserAvatar(recipientId);
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue.props.children, {name: "EmptyMessageHeader"});
					if (userName) {
						userName.props.children = BDFDB.ReactUtils.createElement("span", {children: name});
						this.changeUserColor(userName.props.children, recipientId);
					}
					userName = BDFDB.ReactUtils.findChild(e.returnvalue.props.children, {name: "strong"});
					if (userName) {
						userName.props.children = "@" + name;
						this.changeUserColor(userName, recipientId);
					}
				}
			}
			
			processMessage (e) {
				if (this.settings.places.chatWindow) {
					let header = e.instance.props.childrenHeader;
					if (header && header.props && header.props.message && this.shouldChangeInChat(header.props.message.channel_id)) {
						let data = changedUsers[header.props.message.author.id];
						if (data) {
							let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(header.props.message.channel_id) || {}).guild_id, header.props.message.author.id) || {}).colorString || data.color1;
							let message = new BDFDB.DiscordObjects.Message(Object.assign({}, header.props.message, {author: this.getUserData(header.props.message.author.id, true, false, header.props.message.author)}));
							if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
							header.props.message = message;
						}
					}
					let content = e.instance.props.childrenMessageContent;
					if (content && content.type && content.type.type && content.props.message && this.shouldChangeInChat(content.props.message.channel_id)) {
						let data = changedUsers[content.props.message.author.id];
						if (data) {
							let messageColor = data.color5 || (BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.coloredText) && (data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(content.props.message.channel_id) || {}).guild_id, content.props.message.author.id) || {}).colorString || data.color1));
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
							let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(referenceMessage.channel_id) || {}).guild_id, header.props.message.author.id) || {}).colorString || data.color1;
							let message = new BDFDB.DiscordObjects.Message(Object.assign({}, referenceMessage, {author: this.getUserData(referenceMessage.author.id, true, false, referenceMessage.author)}));
							if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
							repliedMessage.props.children.props.referencedMessage = Object.assign({}, repliedMessage.props.children.props.referencedMessage, {message: message});
						}
					}
				}
			}
			
			processMessageUsername (e) {
				if (!e.instance.props.message || !this.settings.places.chatWindow || !this.shouldChangeInChat(e.instance.props.message.channel_id)) return;
				const author = e.instance.props.userOverride || e.instance.props.message.author;
				let data = changedUsers[author.id];
				if (!data) return;
				if (!e.returnvalue) {
					let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, author.id) || {}).colorString || data.color1;
					color1 = color1 && BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
					if (e.instance.props.userOverride) e.instance.props.userOverride = this.getUserData(author.id)
					else {
						let message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.message, {author: this.getUserData(author.id, true, false, author)}));
						if (color1) message.colorString = color1;
						e.instance.props.message = message;
					}
					let member = BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, author.id);
					e.instance.props.author = Object.assign({}, e.instance.props.author, {
						nick: (data.useServerNick && member && member.nick || [data.name, data.showServerNick && member && member.nick && `(${member.nick})`].filter(n => n).join(" ")) || e.instance.props.author.nick,
						guildMemberAvatar: (data.removeIcon ? null : data.url) || e.instance.props.author.guildMemberAvatar,
						colorString: color1 || e.instance.props.author.colorString
					});
				}
				else if (e.returnvalue.props.children) {
					if (data.color1 || data.color2) {
						let messageUsername = BDFDB.ReactUtils.findChild(e.returnvalue.props.children, {name: "Popout", props: [["className", BDFDB.disCN.messageusername]]});
						if (messageUsername) {
							if (messageUsername.props && typeof messageUsername.props.children == "function") {
								let renderChildren = messageUsername.props.children;
								messageUsername.props.children = BDFDB.TimeUtils.suppress((...args) => {
									let renderedChildren = renderChildren(...args);
									this.changeUserColor(renderedChildren, author.id, {guildId: (BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id});
									return renderedChildren;
								}, "", this);
							}
							else this.changeUserColor(messageUsername, author.id, {guildId: (BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id});
						}
					}
					this.injectBadge(e.returnvalue.props.children, author.id, (BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, e.instance.props.compact ? 0 : 2, {
						tagClass: e.instance.props.compact ? BDFDB.disCN.messagebottagcompact : BDFDB.disCN.messagebottagcozy,
						useRem: true
					});
				}
			}
			
			processMessageContent (e) {
				if (e.instance.props.message && this.settings.places.chatWindow && this.shouldChangeInChat(e.instance.props.message.channel_id)) {
					if (!e.returnvalue) {
						if (e.instance.props.message.type != BDFDB.DiscordConstants.MessageTypes.DEFAULT && e.instance.props.message.type != BDFDB.DiscordConstants.MessageTypes.REPLY) {
							let message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.message, {author: this.getUserData(e.instance.props.message.author.id, true, false, e.instance.props.message.author)}));
							let data = changedUsers[e.instance.props.message.author.id];
							if (data) {
								let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, e.instance.props.message.author.id) || {}).colorString || data.color1;
								if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
							}
							e.instance.props.message = message;
							if (e.instance.props.children) e.instance.props.children.props.message = e.instance.props.message;
						}
					}
					else if (e.instance.props.message.state != BDFDB.DiscordConstants.MessageStates.SEND_FAILED) {
						let data = changedUsers[e.instance.props.message.author.id];
						let messageColor = data && (data.color5 || (BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.coloredText) && (data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, e.instance.props.message.author.id) || {}).colorString || data.color1)));
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
			}
			
			processThreadMessageAccessoryMessage (e) {
				if (e.instance.props.message && this.settings.places.chatWindow && this.shouldChangeInChat(e.instance.props.message.channel_id)) e.instance.props.message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.message, {author: this.getUserData(e.instance.props.message.author.id)}));
			}
			
			processReaction (e) {
				if (!this.settings.places.reactions || !e.returnvalue || !this.shouldChangeInChat(e.instance.props.message.channel_id)) return;
				if (e.instance.props.reactions && e.instance.props.reactions.length) {
					let channel = BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id);
					let guildId = null == channel || channel.isPrivate() ? null : channel.getGuildId();
					let users = e.instance.props.reactions.filter(user => !BDFDB.LibraryModules.RelationshipStore.isBlocked(user.id)).slice(0, 3).map(user => changedUsers[user.id] && changedUsers[user.id].name || guildId && BDFDB.LibraryModules.MemberStore.getNick(guildId, user.id) || user.username).filter(user => user);
					if (users.length) {
						let reaction = e.instance.props.message.getReaction(e.instance.props.emoji);
						let others = Math.max(0, (reaction && reaction.count || 0) - users.length);
						let emojiName = BDFDB.LibraryModules.ReactionEmojiUtils.getReactionEmojiName(e.instance.props.emoji);
						e.returnvalue.props.text = 
							users.length == 1 ? others > 0 ? BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_1_N", users[0], others, emojiName) :
							BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_1", users[0], emojiName) :
							users.length == 2 ? others > 0 ? BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_2_N", users[0], users[1], others, emojiName) :
							BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_2", users[0], users[1], emojiName) :
							users.length == 3 ? others > 0 ? BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_3_N", users[0], users[1], users[2], others, emojiName) :
							BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_3", users[0], users[1], users[2], emojiName) :
							BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_N", others, emojiName);
					}
				}
				else if (!e.instance.props.reactions) {
					e.instance.props.reactions = [];
					BDFDB.LibraryModules.ReactionUtils.getReactions(e.instance.props.message.channel_id, e.instance.props.message.id, e.instance.props.emoji).then(reactions => {
						e.instance.props.reactions = reactions;
						BDFDB.ReactUtils.forceUpdate(e.instance);
					});
				}
			}
			
			processReactorsComponent (e) {
				if (this.settings.places.reactions && BDFDB.ArrayUtils.is(e.instance.props.reactors) && this.shouldChangeInChat(e.instance.props.channel.id)) {
					if (!e.returnvalue) {
						for (let i in e.instance.props.reactors) if (!BDFDB.LibraryModules.MemberStore.getNick(e.instance.props.guildId, e.instance.props.reactors[i].id)) e.instance.props.reactors[i] = this.getUserData(e.instance.props.reactors[i].id, true, false, e.instance.props.reactors[i]);
					}
					else {
						let renderRow = e.returnvalue.props.renderRow;
						e.returnvalue.props.renderRow = (...args) => {
							let row = renderRow(...args);
							if (row && row.props && row.props.user && changedUsers[row.props.user.id]) {
								let type = row.type;
								row.type = (...args2) => {
									let result = type(...args2);
									let nickName = BDFDB.LibraryModules.MemberStore.getNick(row.props.guildId, row.props.user.id) && BDFDB.ReactUtils.findChild(result, {props: [["className", BDFDB.disCN.messagereactionsmodalnickname]]});
									if (nickName) {
										if (changedUsers[row.props.user.id].name) BDFDB.ReactUtils.setChild(nickName, changedUsers[row.props.user.id].name);
										this.changeUserColor(nickName, row.props.user.id);
									}
									return result;
								};
							}
							return row;
						};
					}
				}
			}
			
			processUserMention (e) {
				if (e.instance.props.userId && this.settings.places.mentions && changedUsers[e.instance.props.userId] && this.shouldChangeInChat(e.instance.props.channelId)) {
					if (typeof e.returnvalue.props.children == "function") {
						let renderChildren = e.returnvalue.props.children;
						e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
							let children = renderChildren(...args);
							this.changeMention(BDFDB.ReactUtils.findChild(children, {name: "Mention"}), changedUsers[e.instance.props.userId]);
							return children;
						}, "", this);
					}
					else this.changeMention(BDFDB.ReactUtils.findChild(e.returnvalue, {name: "Mention"}), changedUsers[e.instance.props.userId]);
				}
			}
			
			processRichUserMention (e) {
				if (e.instance.props.id && this.settings.places.mentions && changedUsers[e.instance.props.id] && this.shouldChangeInChat(e.instance.props.channel && e.instance.props.channel.id)) {
					let data = changedUsers[e.instance.props.id];
					let tooltipChildren = BDFDB.ObjectUtils.get(e, "returnvalue.props.text.props.children");
					if (tooltipChildren) {
						if (tooltipChildren[0] && tooltipChildren[0].props && tooltipChildren[0].props.user) tooltipChildren[0].props.user = this.getUserData(tooltipChildren[0].props.user.id);
						if (data.name && typeof tooltipChildren[1] == "string") tooltipChildren[1] = data.name;
					}
					if (data.name || data.color1) {
						if (typeof e.returnvalue.props.children == "function") {
							let renderChildren = e.returnvalue.props.children;
							e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
								let children = renderChildren(...args);
								this.changeMention(children, data);
								return children;
							}, "", this);
						}
						else this.changeMention(e.returnvalue, data);
					}
				}
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
						else if (child.props && BDFDB.ArrayUtils.is(child.props.children)) changeMentionName(child.props.children);
					};
					changeMentionName(mention);
				}
				if (data.color1) mention.props.color = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data.color1) ? data.color1[0] : data.color1, "INT");
			}

			processChannelReply (e) {
				if (e.instance.props.reply && e.instance.props.reply.message && this.settings.places.chatWindow && this.shouldChangeInChat(e.instance.props.reply.message.channel_id)) {
					if (!e.returnvalue) {
						let message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.reply.message, {author: this.getUserData(e.instance.props.reply.message.author.id)}));
						let data = changedUsers[e.instance.props.reply.message.author.id];
						if (data) {
							let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.reply.message.channel_id) || {}).guild_id, e.instance.props.reply.message.author.id) || {}).colorString || data.color1;
							if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
						}
						e.instance.props.reply = Object.assign({}, e.instance.props.reply, {message: message});
					}
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.messagereplyname]]});
						if (userName) this.changeUserColor(userName, e.instance.props.reply.message.author.id);
					}
				}
			}
			
			processMemberListItem (e) {
				if (e.instance.props.user && this.settings.places.memberList && this.shouldChangeInChat()) {
					if (!e.returnvalue) {
						e.instance.props.user = this.getUserData(e.instance.props.user.id);
						let data = changedUsers[e.instance.props.user.id];
						if (data) {
							if (data.name) {
								let member = BDFDB.LibraryModules.MemberStore.getMember(e.instance.props.channel.guild_id, e.instance.props.user.id);
								if (!member || !member.nick || !data.useServerNick) e.instance.props.nick = [data.name, data.showServerNick && member && member.nick && `(${member.nick})`].filter(n => n).join(" ");
							}
							if (data.removeStatus || data.status || data.statusEmoji) {
								e.instance.props.activities = [].concat(e.instance.props.activities).filter(n => n.type != BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS);
								let activity = this.createCustomStatus(data);
								if (activity) e.instance.props.activities.unshift(activity);
							}
						}
					}
					else {
						this.changeUserColor(e.returnvalue.props.name, e.instance.props.user.id, {changeBackground: true, guildId: e.instance.props.channel.guild_id});
						this.injectBadge(BDFDB.ObjectUtils.get(e.returnvalue, "props.decorators.props.children"), e.instance.props.user.id, BDFDB.LibraryModules.LastGuildStore.getGuildId(), 2, {
							tagClass: BDFDB.disCN.bottagmember
						});
					}
				}
			}

			processAuditLogs (e) {
				if (e.instance.props.logs && this.settings.places.guildSettings) { 
					if (!BDFDB.PatchUtils.isPatched(this, e.instance, "renderUserQuickSelectItem")) BDFDB.PatchUtils.patch(this, e.instance, "renderUserQuickSelectItem", {after: e2 => {if (e2.methodArguments[0] && e2.methodArguments[0].user && changedUsers[e2.methodArguments[0].user.id]) {
						let userName = BDFDB.ReactUtils.findChild(e2.returnValue, {props: [["children", e2.methodArguments[0].label]]});
						if (userName) {
							if (changedUsers[e2.methodArguments[0].user.id].name) userName.props.children = changedUsers[e2.methodArguments[0].user.id].name;
							this.changeUserColor(userName, e2.methodArguments[0].user.id);
						}
						let avatar = BDFDB.ReactUtils.findChild(e2.returnValue, {props: [["className", BDFDB.disCN.auditlogpopoutavatar]]});
						if (avatar) avatar.props.src = this.getUserAvatar(e2.methodArguments[0].user.id);
					}}}, {force: true, noCache: true});
				}
			}

			processAuditLog (e) {
				if (e.instance.props.log && this.settings.places.guildSettings) {
					if (e.instance.props.log.user) e.instance.props.log.user = this.getUserData(e.instance.props.log.user.id);
					if (e.instance.props.log.target && e.instance.props.log.targetType == "USER") e.instance.props.log.target = this.getUserData(e.instance.props.log.target.id);
				}
			}

			processUserHook (e) {
				if (e.instance.props.user && this.settings.places.guildSettings) {
					this.changeUserColor(e.returnvalue.props.children[0], e.instance.props.user.id);
				}
			}

			processGuildSettingsEmoji (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.emojis) && this.settings.places.guildSettings) {
					e.instance.props.emojis = [].concat(e.instance.props.emojis);
					for (let i in e.instance.props.emojis) e.instance.props.emojis[i] = Object.assign({}, e.instance.props.emojis[i], {user: this.getUserData(e.instance.props.emojis[i].user.id)});
				}
			}

			processMemberCard (e) {
				if (e.instance.props.user && this.settings.places.guildSettings) e.instance.props.user = this.getUserData(e.instance.props.user.id);
			}

			processSettingsInvites (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.invites) && this.settings.places.guildSettings) {
					e.instance.props.invites = Object.assign({}, e.instance.props.invites);
					for (let id in e.instance.props.invites) e.instance.props.invites[id] = new BDFDB.DiscordObjects.Invite(Object.assign({}, e.instance.props.invites[id], {inviter: this.getUserData(e.instance.props.invites[id].inviter.id)}));
				}
			}

			processGuildSettingsBans (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.bans) && this.settings.places.guildSettings) {
					e.instance.props.bans = Object.assign({}, e.instance.props.bans);
					for (let id in e.instance.props.bans) e.instance.props.bans[id] = Object.assign({}, e.instance.props.bans[id], {user: this.getUserData(e.instance.props.bans[id].user.id)});
				}
			}

			processInvitationCard (e) {
				if (e.instance.props.user && this.settings.places.inviteList) {
					if (!e.returnvalue) e.instance.props.user = this.getUserData(e.instance.props.user.id);
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.invitemodalinviterowname]]});
						if (userName) this.changeUserColor(userName, e.instance.props.user.id);
					}
				}
			}

			processPrivateChannelRecipientsInvitePopout (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.results) && this.settings.places.inviteList) {
					for (let result of e.instance.props.results) result.user = this.getUserData(result.user.id);
				}
			}

			processInviteModalUserRow (e) {
				if (e.instance.props.user && this.settings.places.inviteList) {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.searchpopoutddmaddnickname]]});
					if (userName) this.changeUserColor(userName, e.instance.props.user.id);
				}
			}

			processTypingUsers (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.typingUsers) && Object.keys(e.instance.props.typingUsers).length && this.settings.places.typing) {
					let users = Object.keys(e.instance.props.typingUsers).filter(id => id != BDFDB.UserUtils.me.id).filter(id => !BDFDB.LibraryModules.RelationshipStore.isBlocked(id)).map(id => BDFDB.LibraryModules.UserStore.getUser(id)).filter(user => user);
					if (users.length) {
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
				}
			}

			processDirectMessage (e) {
				if (e.instance.props.channel && e.instance.props.channel.isDM() && this.settings.places.recentDms) {
					let recipientId = e.instance.props.channel.getRecipientId();
					let tooltip = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "ListItemTooltip"});
					if (tooltip) tooltip.props.text = this.getUserData(recipientId).username;
					let avatar = BDFDB.ReactUtils.findChild(e.returnvalue, {filter: c => c && c.props && !isNaN(parseInt(c.props.id))});
					if (avatar && typeof avatar.props.children == "function") {
						let childrenRender = avatar.props.children;
						avatar.props.children = BDFDB.TimeUtils.suppress((...args) => {
							let renderedChildren = childrenRender(...args);
							if (renderedChildren && renderedChildren.props) renderedChildren.props.icon = this.getUserAvatar(recipientId);
							return renderedChildren;
						}, "", this);
					}
				}
			}

			processPrivateChannel (e) {
				if (e.instance.props.user && this.settings.places.dmsList && changedUsers[e.instance.props.user.id]) {
					if (!e.returnvalue) {
						let data = changedUsers[e.instance.props.user.id];
						if (data.removeStatus || data.status || data.statusEmoji) {
							e.instance.props.activities = [].concat(e.instance.props.activities).filter(n => n.type != BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS);
							let activity = this.createCustomStatus(changedUsers[e.instance.props.user.id]);
							if (activity) e.instance.props.activities.unshift(activity);
						}
					}
					else {
						e.returnvalue.props.name = BDFDB.ReactUtils.createElement("span", {children: this.getUserData(e.instance.props.user.id).username});
						this.changeUserColor(e.returnvalue.props.name, e.instance.props.user.id, {modify: BDFDB.ObjectUtils.extract(Object.assign({}, e.instance.props, e.instance.state), "hovered", "selected", "hasUnreadMessages", "muted")});
						e.returnvalue.props.avatar.props.src = this.getUserAvatar(e.instance.props.user.id);
						e.returnvalue.props.decorators = [e.returnvalue.props.decorators].flat(10);
						this.injectBadge(e.returnvalue.props.decorators, e.instance.props.user.id, null, 1);
					}
				}
			}

			processQuickSwitchUserResult (e) {
				if (e.instance.props.user && this.settings.places.quickSwitcher) {
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
			}

			processSearchPopoutComponent (e) {
				if (BDFDB.ArrayUtils.is(BDFDB.ObjectUtils.get(e, "instance.props.resultsState.autocompletes")) && this.settings.places.searchPopout) {
					for (let autocomplete of e.instance.props.resultsState.autocompletes) if (autocomplete && BDFDB.ArrayUtils.is(autocomplete.results)) for (let result of autocomplete.results) if (result.user) result.user = this.getUserData(result.user.id);
				}
			}

			processSearchPopoutUserResult (e) {
				if (e.instance.props.result && e.instance.props.result.user && this.settings.places.searchPopout) {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.searchpopoutdisplayednick]]});
					if (userName) {
						let data = changedUsers[e.instance.props.result.user.id];
						if (data && data.name) userName.props.children = data.name;
						this.changeUserColor(userName, e.instance.props.result.user.id);
					}
				}
			}
			
			processIncomingCallModal (e) {
				if (e.instance.props.channel && this.settings.places.dmCalls) {
					let user = BDFDB.LibraryModules.UserStore.getUser(e.instance.props.channel.id);
					if (!user) {
						let channel = BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.channel.id);
						if (channel && channel.isDM()) user = BDFDB.LibraryModules.UserStore.getUser(channel.recipients[0]);
					}
					if (user) {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.callincomingtitle]]});
						if (userName) {
							let data = changedUsers[user.id];
							if (data && data.name) userName.props.children = data.name;
							this.changeUserColor(userName, user.id);
						}
						let avatar = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "CallAvatar"});
						if (avatar) avatar.props.src = this.getUserAvatar(user.id);
					}
				}
			}
			
			processRTCConnection (e) {
				if (e.instance.props.channel && e.instance.props.channel.isDM() && this.settings.places.recentDms && typeof e.returnvalue.props.children == "function") {
					let recipientId = e.instance.props.channel.getRecipientId();
					let renderChildren = e.returnvalue.props.children;
					e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let renderedChildren = renderChildren(...args);
						let userName = BDFDB.ReactUtils.findChild(renderedChildren, {name: "PanelSubtext"});
						if (userName) {
							userName.props.children = "@" + this.getUserData(recipientId).username;
							this.changeUserColor(userName, recipientId);
						}
						return renderedChildren;
					}, "", this);
				}
			}

			processPrivateChannelCallParticipants (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.participants) && this.settings.places.dmCalls) {
					for (let participant of e.instance.props.participants) if (participant && participant.user) participant.user = this.getUserData(participant.user.id, true, true);
				}
			}
			
			processChannelCall (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.participants) && this.settings.places.dmCalls) {
					for (let participant of e.instance.props.participants) if (participant && participant.user) participant.user = this.getUserData(participant.user.id);
				}
			}
			
			processPictureInPictureVideo (e) {
				if (e.instance.props.backgroundKey) {
					let user = BDFDB.LibraryModules.UserStore.getUser(e.instance.props.backgroundKey);
					if (user) {
						e.instance.props.title = this.getUserData(user.id).username;
						let videoBackground = BDFDB.ReactUtils.findChild(e.instance.props.children, {name: "VideoBackground"});
						if (videoBackground && videoBackground.props.src) videoBackground.props.src = this.getUserAvatar(user.id);
					}
				}
			}

			processUserSummaryItem (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.users)) {
					for (let i in e.instance.props.users) if (e.instance.props.users[i]) e.instance.props.users[i] = this.getUserData(e.instance.props.users[i].id);
				}
			}

			changeAppTitle () {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
				let title = document.head.querySelector("title");
				if (title && channel && channel.isDM()) {
					let user = BDFDB.LibraryModules.UserStore.getUser(channel.recipients[0]);
					if (user) BDFDB.DOMUtils.setText(title, "@" + this.getUserData(user.id, this.settings.places.appTitle).username);
				}
			}
			
			shouldChangeInChat (channelId) {
				if (this.settings.types.servers && this.settings.types.dms) return true;
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channelId || BDFDB.LibraryModules.LastChannelStore.getChannelId());
				let isDm = channel && (channel.isDM() || channel.isGroupDM());
				if (channel && (this.settings.types.servers && !isDm || this.settings.types.dms && isDm)) return true;
				return false;
			}
			
			changeUserColor (child, userId, options = {}) {
				if (BDFDB.ReactUtils.isValidElement(child)) {
					let data = changedUsers[userId] || {};
					if (data.color1 || (data.color2 && options.changeBackground)) {
						let childProp = child.props.children ? "children" : "text";
						let color1 = data.color1 && data.useRoleColor && options.guildId && (BDFDB.LibraryModules.MemberStore.getMember(options.guildId, userId) || {}).colorString || data.color1;
						let fontColor = options.modify && !(data.useRoleColor && options.guildId) ? this.chooseColor(color1, options.modify) : color1;
						let backgroundColor = options.changeBackground && data.color2;
						let fontGradient = BDFDB.ObjectUtils.is(fontColor);
						if (BDFDB.ObjectUtils.is(child.props.style)) {
							delete child.props.style.color;
							delete child.props.style.backgroundColor;
						}
						child.props[childProp] = BDFDB.ReactUtils.createElement("span", {
							style: {
								background: BDFDB.ObjectUtils.is(backgroundColor) ? BDFDB.ColorUtils.createGradient(backgroundColor) : BDFDB.ColorUtils.convert(backgroundColor, "RGBA"),
								color: fontGradient ? BDFDB.ColorUtils.convert(fontColor[0], "RGBA") : BDFDB.ColorUtils.convert(fontColor, "RGBA")
							},
							children: fontGradient ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
								gradient: BDFDB.ColorUtils.createGradient(fontColor),
								children: child.props[childProp]
							}) : child.props[childProp]
						});
					}
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
				let user = BDFDB.LibraryModules.UserStore.getUser(userId);
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
						newUserObject.getAvatarURL = _ => null;
					}
					else if (data.url) {
						newUserObject.avatar = data.url;
						newUserObject.avatarURL = data.url;
						newUserObject.getAvatarURL = _ => data.url;
					}
					if (data.removeBanner) {
						newUserObject.banner = null;
						newUserObject.bannerURL = null;
						newUserObject.getBannerURL = _ => null;
					}
					else if (data.banner) {
						newUserObject.banner = data.banner;
						newUserObject.bannerURL = data.banner;
						newUserObject.getBannerURL = _ => data.banner;
					}
					return newUserObject;
				}
				return new BDFDB.DiscordObjects.User(user);
			}
			
			getUserAvatar (userId, change = true) {
				let user = BDFDB.LibraryModules.UserStore.getUser(userId);
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
					let memberColor = data.ignoreTagColor && (BDFDB.LibraryModules.MemberStore.getMember(guildId, userId) || {}).colorString;
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
				let member = BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), user.id) || {};
				let activity = BDFDB.LibraryModules.StatusMetaUtils.getApplicationActivity(user.id);
				
				let avatarInput, bannerInput, statusEmojiInput, statusInput, colorPicker3, colorPicker4;
				
				BDFDB.ModalUtils.open(this, {
					size: "LARGE",
					header: this.labels.modal_header,
					subHeader: member.nick || user.username,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader1,
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
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													children: this.labels.modal_username
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													type: "Switch",
													margin: 0,
													grow: 0,
													label: this.labels.modal_showservernick,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													value: data.showServerNick,
													onChange: value => {newData.showServerNick = value}
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													type: "Switch",
													margin: 0,
													grow: 0,
													label: this.labels.modal_useservernick,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													value: data.useServerNick,
													onChange: value => {newData.useServerNick = value}
												})
											]
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
											value: data.name,
											placeholder: member.nick || user.username,
											autoFocus: true,
											onChange: value => {newData.name = value;}
										})
									]
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_usertag,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										value: data.tag,
										onChange: value => {newData.tag = value;}
									})
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
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													children: this.labels.modal_useravatar
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													type: "Switch",
													margin: 0,
													grow: 0,
													label: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
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
															this.checkUrl(avatarInput.props.value, avatarInput).then(returnValue => {
																newData.url = returnValue;
															});
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
											onChange: (value, instance) => {
												this.checkUrl(value, instance).then(returnValue => {
													newData.url = returnValue;
												});
											}
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
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													children: BDFDB.LanguageUtils.LanguageStrings.USER_SETTINGS_PROFILE_BANNER
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													type: "Switch",
													margin: 0,
													grow: 0,
													label: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													value: data.removeBanner && user.id != "278543574059057154",
													disabled: user.id == "278543574059057154",
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
															this.checkUrl(bannerInput.props.value, bannerInput).then(returnValue => {
																newData.banner = returnValue;
															});
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
											disabled: data.removeBanner || user.id == "278543574059057154",
											ref: instance => {if (instance) bannerInput = instance;},
											onChange: (value, instance) => {
												this.checkUrl(value, instance).then(returnValue => {
													newData.banner = returnValue;
												});
											}
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
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													children: BDFDB.LanguageUtils.LanguageStrings.CUSTOM_STATUS
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													type: "Switch",
													margin: 0,
													grow: 0,
													label: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
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
														onSelect: value => {newData.statusEmoji = value;}
													})
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													inputClassName: BDFDB.disCN.emojiinput,
													maxLength: 100000000000000000000,
													value: data.status,
													placeholder: activity && activity.type == BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS && activity.state || "",
													disabled: data.removeStatus,
													ref: instance => {if (instance) statusInput = instance;},
													onChange: value => {newData.status = value;}
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
										onColorChange: value => {newData.color1 = value;}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker2,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color2,
										onColorChange: value => {newData.color2 = value;}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									margin: 20,
									label: this.labels.modal_userolecolor,
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
									value: data.useRoleColor,
									onChange: value => {newData.useRoleColor = value;}
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader3,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker3,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color3,
										disabled: data.ignoreTagColor,
										ref: instance => {if (instance) colorPicker3 = instance;},
										onColorChange: value => {newData.color3 = value;}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker4,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color4,
										disabled: data.ignoreTagColor,
										ref: instance => {if (instance) colorPicker4 = instance;},
										onColorChange: value => {newData.color4 = value;}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									margin: 20,
									label: this.labels.modal_ignoretagcolor,
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
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
							tab: this.labels.modal_tabheader4,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker5,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color5,
										onColorChange: value => {newData.color5 = value;}
									})
								})
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
					else instance.checkTimeout = BDFDB.TimeUtils.timeout(_ => {
						BDFDB.LibraryRequires.request(url, (error, response, result) => {
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
						});
					}, 1000);
				});
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							confirm_reset:						"���������������� ���� ������������ ���� ���������������� �������� ��������������������?",
							confirm_resetall:					"���������������� ���� ������������ ���� ���������������� ������������ ����������������������?",
							context_localusersettings:			"�������������� �������������������������� ������������������",
							modal_colorpicker1:					"������ ��������",
							modal_colorpicker2:					"�������� ���� ��������",
							modal_colorpicker3:					"�������� ���� ��������������",
							modal_colorpicker4:					"�������� ���� ������������",
							modal_colorpicker5:					"�������� ���� ������������",
							modal_header:						"�������������� �������������������������� ������������������",
							modal_ignoretagcolor:				"���������������������� �������� ���� ������������",
							modal_invalidurl:					"������������������ ����������",
							modal_showservernick:				"������������������ ���� ��������������������",
							modal_tabheader1:					"��������������������",
							modal_tabheader2:					"������ ��������",
							modal_tabheader3:					"�������� ���� ��������������",
							modal_tabheader4:					"�������� ���� ����������������������",
							modal_useravatar:					"������������",
							modal_username:						"�������������� �������������������������� ������",
							modal_userolecolor:					"���� �������������������������� ���������� ���� ������������",
							modal_usertag:						"������������",
							modal_useservernick:				"���� �������������������������� ������������������������",
							submenu_resetsettings:				"���������������� ���� ����������������������",
							submenu_usersettings:				"�������������� ���� ����������������������"
						};
					case "cs":		// Czech
						return {
							confirm_reset:						"Opravdu chcete tohoto u��ivatele resetovat?",
							confirm_resetall:					"Opravdu chcete resetovat v��echny u��ivatele?",
							context_localusersettings:			"M��stn�� nastaven�� u��ivatele",
							modal_colorpicker1:					"N��zev Barva",
							modal_colorpicker2:					"Barva pozad��",
							modal_colorpicker3:					"Barva zna��ky",
							modal_colorpicker4:					"Barva fontu",
							modal_colorpicker5:					"Barva fontu",
							modal_header:						"M��stn�� nastaven�� u��ivatele",
							modal_ignoretagcolor:				"Pou��ijte barvu role",
							modal_invalidurl:					"Neplatn�� URL",
							modal_showservernick:				"Zobrazit p��ezd��vku",
							modal_tabheader1:					"U��ivatel",
							modal_tabheader2:					"N��zev Barva",
							modal_tabheader3:					"Barva zna��ky",
							modal_tabheader4:					"Barva zpr��vy",
							modal_useravatar:					"Avatar",
							modal_username:						"M��stn�� u��ivatelsk�� jm��no",
							modal_userolecolor:					"Nep��episujte barvu role",
							modal_usertag:						"��t��tek",
							modal_useservernick:				"Nep��episujte p��ezd��vky",
							submenu_resetsettings:				"Obnovit u��ivatele",
							submenu_usersettings:				"Zm��nit nastaven��"
						};
					case "da":		// Danish
						return {
							confirm_reset:						"Er du sikker p��, at du vil nulstille denne bruger?",
							confirm_resetall:					"Er du sikker p��, at du vil nulstille alle brugere?",
							context_localusersettings:			"Lokale brugerindstillinger",
							modal_colorpicker1:					"Navnfarve",
							modal_colorpicker2:					"Baggrundsfarve",
							modal_colorpicker3:					"Tagfarve",
							modal_colorpicker4:					"Skriftfarve",
							modal_colorpicker5:					"Skriftfarve",
							modal_header:						"Lokale brugerindstillinger",
							modal_ignoretagcolor:				"Brug rollefarve",
							modal_invalidurl:					"Ugyldig URL",
							modal_showservernick:				"Vis kaldenavn",
							modal_tabheader1:					"Bruger",
							modal_tabheader2:					"Navnfarve",
							modal_tabheader3:					"Tagfarve",
							modal_tabheader4:					"Beskedfarve",
							modal_useravatar:					"Avatar",
							modal_username:						"Lokalt brugernavn",
							modal_userolecolor:					"Overskriv ikke rollefarven",
							modal_usertag:						"Tag",
							modal_useservernick:				"Overskriv ikke k��lenavne",
							submenu_resetsettings:				"Nulstil bruger",
							submenu_usersettings:				"��ndre indstillinger"
						};
					case "de":		// German
						return {
							confirm_reset:						"M��chtest du diesen Benutzer wirklich zur��cksetzen?",
							confirm_resetall:					"M��chtest du wirklich alle Benutzer zur��cksetzen?",
							context_localusersettings:			"Lokale Benutzereinstellungen",
							modal_colorpicker1:					"Namensfarbe",
							modal_colorpicker2:					"Hintergrundfarbe",
							modal_colorpicker3:					"Etikettarbe",
							modal_colorpicker4:					"Schriftfarbe",
							modal_colorpicker5:					"Schriftfarbe",
							modal_header:						"Lokale Benutzereinstellungen",
							modal_ignoretagcolor:				"Rollenfarbe verwenden",
							modal_invalidurl:					"Ung��ltige URL",
							modal_showservernick:				"Nicknamen anzeigen",
							modal_tabheader1:					"Benutzer",
							modal_tabheader2:					"Namensfarbe",
							modal_tabheader3:					"Etikettfarbe",
							modal_tabheader4:					"Nachrichtenfarbe",
							modal_useravatar:					"Benutzerbild",
							modal_username:						"Lokaler Benutzername",
							modal_userolecolor:					"Rollenfarbe nicht ��berschreiben",
							modal_usertag:						"Etikett",
							modal_useservernick:				"Nicknamen nicht ��berschreiben",
							submenu_resetsettings:				"Benutzer zur��cksetzen",
							submenu_usersettings:				"Einstellungen ��ndern"
						};
					case "el":		// Greek
						return {
							confirm_reset:						"���������� �������������� ������ ������������ ���� ���������������������� ���������� ������ ������������;",
							confirm_resetall:					"���������� �������������� ������ ������������ ���� ���������������������� ���������� �������� ��������������;",
							context_localusersettings:			"������������������ �������������� ������������",
							modal_colorpicker1:					"���������� ����������������",
							modal_colorpicker2:					"���������� ������ ������������",
							modal_colorpicker3:					"���������� ����������������",
							modal_colorpicker4:					"���������� ����������������������������",
							modal_colorpicker5:					"���������� ����������������������������",
							modal_header:						"������������������ �������������� ������������",
							modal_ignoretagcolor:				"���������������������������� ���� ���������� ������ ����������",
							modal_invalidurl:					"���� ������������ ������������������ URL",
							modal_showservernick:				"���������������� ��������������������",
							modal_tabheader1:					"��������������",
							modal_tabheader2:					"���������� ����������������",
							modal_tabheader3:					"���������� ����������������",
							modal_tabheader4:					"���������� ������������������",
							modal_useravatar:					"������������",
							modal_username:						"������������ ���������� ������������",
							modal_userolecolor:					"������ �������������������������� ���� ���������� ������ ����������",
							modal_usertag:						"��������������",
							modal_useservernick:				"������ �������������������������� ������������������",
							submenu_resetsettings:				"������������������ ������������",
							submenu_usersettings:				"������������ ������������������"
						};
					case "es":		// Spanish
						return {
							confirm_reset:						"��Est�� seguro de que desea restablecer este usuario?",
							confirm_resetall:					"��Est�� seguro de que desea restablecer a todos los usuarios?",
							context_localusersettings:			"Configuraci��n de usuario local",
							modal_colorpicker1:					"Color del nombre",
							modal_colorpicker2:					"Color de fondo",
							modal_colorpicker3:					"Color de etiqueta",
							modal_colorpicker4:					"Color de fuente",
							modal_colorpicker5:					"Color de fuente",
							modal_header:						"Configuraci��n de usuario local",
							modal_ignoretagcolor:				"Usar color de rol",
							modal_invalidurl:					"URL invalida",
							modal_showservernick:				"Mostrar apodo",
							modal_tabheader1:					"Usuario",
							modal_tabheader2:					"Color del nombre",
							modal_tabheader3:					"Color de etiqueta",
							modal_tabheader4:					"Color del mensaje",
							modal_useravatar:					"Avatar",
							modal_username:						"Nombre de usuario local",
							modal_userolecolor:					"No sobrescriba el color de la funci��n",
							modal_usertag:						"Etiqueta",
							modal_useservernick:				"No sobrescriba los apodos",
							submenu_resetsettings:				"Restablecer usuario",
							submenu_usersettings:				"Cambiar ajustes"
						};
					case "fi":		// Finnish
						return {
							confirm_reset:						"Haluatko varmasti nollata t��m��n k��ytt��j��n?",
							confirm_resetall:					"Haluatko varmasti nollata kaikki k��ytt��j��t?",
							context_localusersettings:			"Paikalliset k��ytt��j��asetukset",
							modal_colorpicker1:					"Nimen v��ri",
							modal_colorpicker2:					"Taustav��ri",
							modal_colorpicker3:					"Tagin v��ri",
							modal_colorpicker4:					"Fontin v��ri",
							modal_colorpicker5:					"Fontin v��ri",
							modal_header:						"Paikalliset k��ytt��j��asetukset",
							modal_ignoretagcolor:				"K��yt�� rooliv��ri��",
							modal_invalidurl:					"Virheellinen URL",
							modal_showservernick:				"N��yt�� lempinimi",
							modal_tabheader1:					"K��ytt��j��",
							modal_tabheader2:					"Nimen v��ri",
							modal_tabheader3:					"Tagin v��ri",
							modal_tabheader4:					"Viestin v��ri",
							modal_useravatar:					"Hahmo",
							modal_username:						"Paikallinen k��ytt��j��tunnus",
							modal_userolecolor:					"��l�� korvaa roolin v��ri��",
							modal_usertag:						"Tag",
							modal_useservernick:				"��l�� korvaa lempinimi��",
							submenu_resetsettings:				"Nollaa k��ytt��j��",
							submenu_usersettings:				"Vaihda asetuksia"
						};
					case "fr":		// French
						return {
							confirm_reset:						"��tes-vous s��r de vouloir r��initialiser cet utilisateur?",
							confirm_resetall:					"Voulez-vous vraiment r��initialiser tous les utilisateurs?",
							context_localusersettings:			"Param��tres locaux de l'utilisateur",
							modal_colorpicker1:					"Couleur du nom",
							modal_colorpicker2:					"Couleur de l'arri��re plan",
							modal_colorpicker3:					"Couleur de l'��tiquette",
							modal_colorpicker4:					"Couleur de la police",
							modal_colorpicker5:					"Couleur de la police",
							modal_header:						"Param��tres locaux de l'utilisateur",
							modal_ignoretagcolor:				"Utiliser la couleur du r��le",
							modal_invalidurl:					"URL invalide",
							modal_showservernick:				"Afficher le surnom",
							modal_tabheader1:					"Utilisateur",
							modal_tabheader2:					"Couleur du nom",
							modal_tabheader3:					"Couleur de l'��tiquette",
							modal_tabheader4:					"Couleur du message",
							modal_useravatar:					"Avatar",
							modal_username:						"Nom local d'utilisateur",
							modal_userolecolor:					"Ne pas ��craser la couleur du r��le",
							modal_usertag:						"Marque",
							modal_useservernick:				"Ne pas ��craser les surnoms",
							submenu_resetsettings:				"R��initialiser l'utilisateur",
							submenu_usersettings:				"Modifier les param��tres"
						};
					case "hi":		// Hindi
						return {
							confirm_reset:						"������������ ������ ������������ ������ ������������������������������ ������ ��������������� ������������ ��������������� ���������?",
							confirm_resetall:					"������������ ������ ������������ ��������� ������������������������������������ ������ ��������������� ������������ ��������������� ���������?",
							context_localusersettings:			"��������������������� ������������������������������ ������������������������",
							modal_colorpicker1:					"��������� ���������",
							modal_colorpicker2:					"������������ ������ ���������",
							modal_colorpicker3:					"��������� ���������",
							modal_colorpicker4:					"������������ ������ ���������",
							modal_colorpicker5:					"������������ ������ ���������",
							modal_header:						"��������������������� ������������������������������ ������������������������",
							modal_ignoretagcolor:				"������������������ ��������� ������ ������������������ ������������",
							modal_invalidurl:					"������������������������ ������������������",
							modal_showservernick:				"��������������� ������������������",
							modal_tabheader1:					"������������������������������",
							modal_tabheader2:					"��������� ���������",
							modal_tabheader3:					"��������� ���������",
							modal_tabheader4:					"��������������� ���������",
							modal_useravatar:					"���������������",
							modal_username:						"��������������������� ������������������������������ ���������",
							modal_userolecolor:					"������������������ ��������� ������ ������������������������ ��� ������������",
							modal_usertag:						"���������",
							modal_useservernick:				"��������������������� ������ ������������������������ ��� ������������",
							submenu_resetsettings:				"������������������������������ ������ ��������������� ������������",
							submenu_usersettings:				"������������������������ ��������������������������� ������������"
						};
					case "hr":		// Croatian
						return {
							confirm_reset:						"Jeste li sigurni da ��elite resetirati ovog korisnika?",
							confirm_resetall:					"Jeste li sigurni da ��elite resetirati sve korisnike?",
							context_localusersettings:			"Postavke lokalnog korisnika",
							modal_colorpicker1:					"Naziv Boja",
							modal_colorpicker2:					"Boja pozadine",
							modal_colorpicker3:					"Oznaka u boji",
							modal_colorpicker4:					"Boja fonta",
							modal_colorpicker5:					"Boja fonta",
							modal_header:						"Postavke lokalnog korisnika",
							modal_ignoretagcolor:				"Koristite boju uloga",
							modal_invalidurl:					"Neispravna poveznica",
							modal_showservernick:				"Prika��i nadimak",
							modal_tabheader1:					"Korisnik",
							modal_tabheader2:					"Naziv Boja",
							modal_tabheader3:					"Oznaka u boji",
							modal_tabheader4:					"Boja poruke",
							modal_useravatar:					"Avatar",
							modal_username:						"Lokalno korisni��ko ime",
							modal_userolecolor:					"Nemojte prebrisati boju uloge",
							modal_usertag:						"Ozna��iti",
							modal_useservernick:				"Ne prepisujte nadimke",
							submenu_resetsettings:				"Resetiraj korisnika",
							submenu_usersettings:				"Promijeniti postavke"
						};
					case "hu":		// Hungarian
						return {
							confirm_reset:						"Biztosan vissza akarja ��ll��tani ezt a felhaszn��l��t?",
							confirm_resetall:					"Biztosan vissza akarja ��ll��tani az ��sszes felhaszn��l��t?",
							context_localusersettings:			"Helyi felhaszn��l��i be��ll��t��sok",
							modal_colorpicker1:					"N��v sz��ne",
							modal_colorpicker2:					"H��tt��rsz��n",
							modal_colorpicker3:					"C��mke sz��ne",
							modal_colorpicker4:					"Bet�� sz��n",
							modal_colorpicker5:					"Bet�� sz��n",
							modal_header:						"Helyi felhaszn��l��i be��ll��t��sok",
							modal_ignoretagcolor:				"Haszn��lja a Szerepsz��nt",
							modal_invalidurl:					"��rv��nytelen URL",
							modal_showservernick:				"Becen��v megjelen��t��se",
							modal_tabheader1:					"Felhaszn��l��",
							modal_tabheader2:					"N��v sz��ne",
							modal_tabheader3:					"C��mke sz��ne",
							modal_tabheader4:					"��zenet sz��ne",
							modal_useravatar:					"Avatar",
							modal_username:						"Helyi felhaszn��l��n��v",
							modal_userolecolor:					"Ne ��rja fel��l a Szerepsz��nt",
							modal_usertag:						"C��mke",
							modal_useservernick:				"Ne ��rja fel��l a beceneveket",
							submenu_resetsettings:				"Felhaszn��l�� vissza��ll��t��sa",
							submenu_usersettings:				"Be��ll��t��sok megv��ltoztat��sa"
						};
					case "it":		// Italian
						return {
							confirm_reset:						"Sei sicuro di voler reimpostare questo utente?",
							confirm_resetall:					"Sei sicuro di voler reimpostare tutti gli utenti?",
							context_localusersettings:			"Impostazioni utente locale",
							modal_colorpicker1:					"Nome Colore",
							modal_colorpicker2:					"Colore di sfondo",
							modal_colorpicker3:					"Colore tag",
							modal_colorpicker4:					"Colore del carattere",
							modal_colorpicker5:					"Colore del carattere",
							modal_header:						"Impostazioni utente locale",
							modal_ignoretagcolor:				"Usa colore ruolo",
							modal_invalidurl:					"URL non valido",
							modal_showservernick:				"Mostra soprannome",
							modal_tabheader1:					"Utente",
							modal_tabheader2:					"Nome Colore",
							modal_tabheader3:					"Colore tag",
							modal_tabheader4:					"Colore messaggio",
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
							confirm_reset:						"������������������������������������������������������������������",
							confirm_resetall:					"������������������������������������������������������������������������",
							context_localusersettings:			"������������������������������",
							modal_colorpicker1:					"������������",
							modal_colorpicker2:					"���������",
							modal_colorpicker3:					"������������",
							modal_colorpicker4:					"������������������",
							modal_colorpicker5:					"������������������",
							modal_header:						"������������������������������",
							modal_ignoretagcolor:				"���������������������������",
							modal_invalidurl:					"���������URL",
							modal_showservernick:				"���������������������������",
							modal_tabheader1:					"������������",
							modal_tabheader2:					"������������",
							modal_tabheader3:					"������������",
							modal_tabheader4:					"���������������������",
							modal_useravatar:					"������������",
							modal_username:						"���������������������������",
							modal_userolecolor:					"������������������������������������������������",
							modal_usertag:						"������������",
							modal_useservernick:				"������������������������������������������������������",
							submenu_resetsettings:				"���������������������������",
							submenu_usersettings:				"���������������������"
						};
					case "ko":		// Korean
						return {
							confirm_reset:						"��� ������������ ��������� ������������������?",
							confirm_resetall:					"������ ������������ ��������� ������������������?",
							context_localusersettings:			"������ ��������� ������",
							modal_colorpicker1:					"������ ������",
							modal_colorpicker2:					"���������",
							modal_colorpicker3:					"������ ������",
							modal_colorpicker4:					"������ ���",
							modal_colorpicker5:					"������ ���",
							modal_header:						"������ ��������� ������",
							modal_ignoretagcolor:				"������ ������ ������",
							modal_invalidurl:					"��������� URL",
							modal_showservernick:				"��������� ������",
							modal_tabheader1:					"���������",
							modal_tabheader2:					"������ ������",
							modal_tabheader3:					"������ ������",
							modal_tabheader4:					"��������� ������",
							modal_useravatar:					"������",
							modal_username:						"������ ��������� ������",
							modal_userolecolor:					"������ ��������� ������ ������ ������������.",
							modal_usertag:						"���������",
							modal_useservernick:				"��������� ������ ������ ������������",
							submenu_resetsettings:				"��������� ���������",
							submenu_usersettings:				"������ ������"
						};
					case "lt":		// Lithuanian
						return {
							confirm_reset:						"Ar tikrai norite i�� naujo nustatyti ���� naudotoj��?",
							confirm_resetall:					"Ar tikrai norite i�� naujo nustatyti visus naudotojus?",
							context_localusersettings:			"Vietinio vartotojo nustatymai",
							modal_colorpicker1:					"Pavadinimo spalva",
							modal_colorpicker2:					"Fono spalva",
							modal_colorpicker3:					"��ymos spalva",
							modal_colorpicker4:					"��rifto spalva",
							modal_colorpicker5:					"��rifto spalva",
							modal_header:						"Vietinio vartotojo nustatymai",
							modal_ignoretagcolor:				"Naudokite vaidmens spalv��",
							modal_invalidurl:					"Neteisingas URL",
							modal_showservernick:				"Rodyti slapyvard��",
							modal_tabheader1:					"Vartotojas",
							modal_tabheader2:					"Pavadinimo spalva",
							modal_tabheader3:					"��ymos spalva",
							modal_tabheader4:					"Prane��imo spalva",
							modal_useravatar:					"Avataras",
							modal_username:						"Vietinis vartotojo vardas",
							modal_userolecolor:					"Neperra��ykite vaidmens spalvos",
							modal_usertag:						"��yma",
							modal_useservernick:				"Neperra��ykite slapyvard��i��",
							submenu_resetsettings:				"I�� naujo nustatyti vartotoj��",
							submenu_usersettings:				"Pakeisti nustatymus"
						};
					case "nl":		// Dutch
						return {
							confirm_reset:						"Weet u zeker dat u deze gebruiker wilt resetten?",
							confirm_resetall:					"Weet u zeker dat u alle gebruikers wilt resetten?",
							context_localusersettings:			"Lokale gebruikersinstellingen",
							modal_colorpicker1:					"Naamkleur",
							modal_colorpicker2:					"Achtergrondkleur",
							modal_colorpicker3:					"Tagkleur",
							modal_colorpicker4:					"Letterkleur",
							modal_colorpicker5:					"Letterkleur",
							modal_header:						"Lokale gebruikersinstellingen",
							modal_ignoretagcolor:				"Gebruik rolkleur",
							modal_invalidurl:					"Ongeldige URL",
							modal_showservernick:				"Bijnaam weergeven",
							modal_tabheader1:					"Gebruiker",
							modal_tabheader2:					"Naamkleur",
							modal_tabheader3:					"Tagkleur",
							modal_tabheader4:					"Berichtkleur",
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
							confirm_reset:						"Er du sikker p�� at du vil tilbakestille denne brukeren?",
							confirm_resetall:					"Er du sikker p�� at du vil tilbakestille alle brukere?",
							context_localusersettings:			"Lokale brukerinnstillinger",
							modal_colorpicker1:					"Navnfarge",
							modal_colorpicker2:					"Bakgrunnsfarge",
							modal_colorpicker3:					"Merkefarge",
							modal_colorpicker4:					"Skriftfarge",
							modal_colorpicker5:					"Skriftfarge",
							modal_header:						"Lokale brukerinnstillinger",
							modal_ignoretagcolor:				"Bruk rollefarge",
							modal_invalidurl:					"Ugyldig URL",
							modal_showservernick:				"Vis kallenavn",
							modal_tabheader1:					"Bruker",
							modal_tabheader2:					"Navnfarge",
							modal_tabheader3:					"Merkefarge",
							modal_tabheader4:					"Meldingfarge",
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
							confirm_reset:						"Czy na pewno chcesz zresetowa�� tego u��ytkownika?",
							confirm_resetall:					"Czy na pewno chcesz zresetowa�� wszystkich u��ytkownik��w?",
							context_localusersettings:			"Ustawienia u��ytkownika lokalnego",
							modal_colorpicker1:					"Nazwa Kolor",
							modal_colorpicker2:					"Kolor t��a",
							modal_colorpicker3:					"Kolor tagu",
							modal_colorpicker4:					"Kolor czcionki",
							modal_colorpicker5:					"Kolor czcionki",
							modal_header:						"Ustawienia u��ytkownika lokalnego",
							modal_ignoretagcolor:				"U��yj koloru roli",
							modal_invalidurl:					"Nieprawid��owy URL",
							modal_showservernick:				"Poka�� pseudonim",
							modal_tabheader1:					"U��ytkownik",
							modal_tabheader2:					"Nazwa Kolor",
							modal_tabheader3:					"Kolor tagu",
							modal_tabheader4:					"Kolor wiadomo��ci",
							modal_useravatar:					"Awatara",
							modal_username:						"Lokalna nazwa u��ytkownika",
							modal_userolecolor:					"Nie zast��puj koloru roli",
							modal_usertag:						"Etykietka",
							modal_useservernick:				"Nie nadpisuj pseudonim��w",
							submenu_resetsettings:				"Resetuj u��ytkownika",
							submenu_usersettings:				"Zmie�� ustawienia"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							confirm_reset:						"Tem certeza de que deseja redefinir este usu��rio?",
							confirm_resetall:					"Tem certeza de que deseja redefinir todos os usu��rios?",
							context_localusersettings:			"Configura����es de usu��rio local",
							modal_colorpicker1:					"Cor do nome",
							modal_colorpicker2:					"Cor de fundo",
							modal_colorpicker3:					"Cor da tag",
							modal_colorpicker4:					"Cor da fonte",
							modal_colorpicker5:					"Cor da fonte",
							modal_header:						"Configura����es de usu��rio local",
							modal_ignoretagcolor:				"Use a cor da fun����o",
							modal_invalidurl:					"URL inv��lida",
							modal_showservernick:				"Mostrar apelido",
							modal_tabheader1:					"Do utilizador",
							modal_tabheader2:					"Cor do Nome",
							modal_tabheader3:					"Cor da tag",
							modal_tabheader4:					"Cor da Mensagem",
							modal_useravatar:					"Avatar",
							modal_username:						"Nome de usu��rio local",
							modal_userolecolor:					"N��o sobrescreva a Cor da Fun����o",
							modal_usertag:						"Tag",
							modal_useservernick:				"N��o sobrescrever apelidos",
							submenu_resetsettings:				"Reiniciar usu��rio",
							submenu_usersettings:				"Mudar configura����es"
						};
					case "ro":		// Romanian
						return {
							confirm_reset:						"Sigur dori��i s�� reseta��i acest utilizator?",
							confirm_resetall:					"Sigur dori��i s�� reseta��i to��i utilizatorii?",
							context_localusersettings:			"Set��ri locale ale utilizatorului",
							modal_colorpicker1:					"Culoare nume",
							modal_colorpicker2:					"Culoare de fundal",
							modal_colorpicker3:					"Culoare etichet��",
							modal_colorpicker4:					"Culoarea fontului",
							modal_colorpicker5:					"Culoarea fontului",
							modal_header:						"Set��ri locale ale utilizatorului",
							modal_ignoretagcolor:				"Utiliza��i culoarea rolului",
							modal_invalidurl:					"URL invalid",
							modal_showservernick:				"Afi��eaz�� porecla",
							modal_tabheader1:					"Utilizator",
							modal_tabheader2:					"Culoare nume",
							modal_tabheader3:					"Culoare etichet��",
							modal_tabheader4:					"Culoarea mesajului",
							modal_useravatar:					"Avatar",
							modal_username:						"Nume utilizator local",
							modal_userolecolor:					"Nu suprascrie��i culoarea rolului",
							modal_usertag:						"Etichet��",
							modal_useservernick:				"Nu suprascrie��i porecle",
							submenu_resetsettings:				"Reseta��i utilizatorul",
							submenu_usersettings:				"Schimb�� set��rile"
						};
					case "ru":		// Russian
						return {
							confirm_reset:						"���� ��������������, ������ ������������ ���������������� ���������� ������������������������?",
							confirm_resetall:					"���� ��������������, ������ ������������ ���������������� �������� ��������������������������?",
							context_localusersettings:			"������������������ �������������������� ������������������������",
							modal_colorpicker1:					"�������� ����������",
							modal_colorpicker2:					"�������������� ��������",
							modal_colorpicker3:					"�������� ����������",
							modal_colorpicker4:					"�������� ������������",
							modal_colorpicker5:					"�������� ������������",
							modal_header:						"������������������ �������������������� ������������������������",
							modal_ignoretagcolor:				"������������������������ �������� ��������",
							modal_invalidurl:					"���������������� ������������",
							modal_showservernick:				"���������������� ������",
							modal_tabheader1:					"������������������������",
							modal_tabheader2:					"�������� ����������",
							modal_tabheader3:					"�������� ����������",
							modal_tabheader4:					"�������� ������������������",
							modal_useravatar:					"������������",
							modal_username:						"������������������ ������ ������������������������",
							modal_userolecolor:					"���� ������������������������������ �������� ��������",
							modal_usertag:						"������",
							modal_useservernick:				"���� ���������������������������� ����������������",
							submenu_resetsettings:				"���������������� ������������������������",
							submenu_usersettings:				"���������������� ������������������"
						};
					case "sv":		// Swedish
						return {
							confirm_reset:						"��r du s��ker p�� att du vill ��terst��lla den h��r anv��ndaren?",
							confirm_resetall:					"��r du s��ker p�� att du vill ��terst��lla alla anv��ndare?",
							context_localusersettings:			"Lokala anv��ndarinst��llningar",
							modal_colorpicker1:					"Namnf��rg",
							modal_colorpicker2:					"Bakgrundsf��rg",
							modal_colorpicker3:					"Taggf��rg",
							modal_colorpicker4:					"Fontf��rg",
							modal_colorpicker5:					"Fontf��rg",
							modal_header:						"Lokala anv��ndarinst��llningar",
							modal_ignoretagcolor:				"Anv��nd rollf��rg",
							modal_invalidurl:					"Ogiltig URL",
							modal_showservernick:				"Visa smeknamn",
							modal_tabheader1:					"Anv��ndare",
							modal_tabheader2:					"Namnf��rg",
							modal_tabheader3:					"Taggf��rg",
							modal_tabheader4:					"Meddelandef��rg",
							modal_useravatar:					"Avatar",
							modal_username:						"Lokalt anv��ndarnamn",
							modal_userolecolor:					"Skriv inte ��ver rollf��rgen",
							modal_usertag:						"M��rka",
							modal_useservernick:				"Skriv inte ��ver smeknamn",
							submenu_resetsettings:				"��terst��ll anv��ndare",
							submenu_usersettings:				"��ndra inst��llningar"
						};
					case "th":		// Thai
						return {
							confirm_reset:						"���������������������������������������������������������������������������������������������������",
							confirm_resetall:					"���������������������������������������������������������������������������������������������������������������",
							context_localusersettings:			"���������������������������������������������������������������",
							modal_colorpicker1:					"������������������",
							modal_colorpicker2:					"������������������������������",
							modal_colorpicker3:					"������������������",
							modal_colorpicker4:					"������������������������������",
							modal_colorpicker5:					"������������������������������",
							modal_header:						"���������������������������������������������������������������",
							modal_ignoretagcolor:				"���������������������������������������",
							modal_invalidurl:					"URL ������������������������������",
							modal_showservernick:				"������������������������������������",
							modal_tabheader1:					"������������������",
							modal_tabheader2:					"������������������",
							modal_tabheader3:					"������������������",
							modal_tabheader4:					"���������������������������",
							modal_useravatar:					"���������������������������",
							modal_username:						"������������������������������������������������������",
							modal_userolecolor:					"������������������������������������������������������������������",
							modal_usertag:						"������������",
							modal_useservernick:				"������������������������������������������������������������",
							submenu_resetsettings:				"������������������������������������",
							submenu_usersettings:				"���������������������������������������������������"
						};
					case "tr":		// Turkish
						return {
							confirm_reset:						"Bu Kullan��c��y�� s��f��rlamak istedi��inizden emin misiniz?",
							confirm_resetall:					"T��m Kullan��c��lar�� s��f��rlamak istedi��inizden emin misiniz?",
							context_localusersettings:			"Yerel Kullan��c�� Ayarlar��",
							modal_colorpicker1:					"��sim Rengi",
							modal_colorpicker2:					"Arka plan rengi",
							modal_colorpicker3:					"Etiket Rengi",
							modal_colorpicker4:					"Yaz�� rengi",
							modal_colorpicker5:					"Yaz�� rengi",
							modal_header:						"Yerel Kullan��c�� Ayarlar��",
							modal_ignoretagcolor:				"Rol Rengini Kullan",
							modal_invalidurl:					"Ge��ersiz URL",
							modal_showservernick:				"Takma ad�� g��ster",
							modal_tabheader1:					"Kullan��c��",
							modal_tabheader2:					"��sim Rengi",
							modal_tabheader3:					"Etiket Rengi",
							modal_tabheader4:					"Mesaj Rengi",
							modal_useravatar:					"Avatar",
							modal_username:						"Yerel Kullan��c�� Ad��",
							modal_userolecolor:					"Rol Renginin ��zerine yazmay��n",
							modal_usertag:						"Etiket",
							modal_useservernick:				"Takma adlar��n ��zerine yazmay��n",
							submenu_resetsettings:				"Kullan��c��y�� S��f��rla",
							submenu_usersettings:				"Ayarlar�� de��i��tir"
						};
					case "uk":		// Ukrainian
						return {
							confirm_reset:						"���� ����������������, ���� ������������ �������������� ������������������������ ���������� ����������������������?",
							confirm_resetall:					"���� ����������������, ���� ������������ �������������� ������������������������ �������� ������������������������?",
							context_localusersettings:			"������������������������ �������������������� ����������������������",
							modal_colorpicker1:					"���������� ����������",
							modal_colorpicker2:					"���������� ��������",
							modal_colorpicker3:					"���������� ��������",
							modal_colorpicker4:					"���������� ������������",
							modal_colorpicker5:					"���������� ������������",
							modal_header:						"������������������������ �������������������� ����������������������",
							modal_ignoretagcolor:				"���������������������������� ���������� ��������",
							modal_invalidurl:					"���������������� URL-������������",
							modal_showservernick:				"���������������� ������������������",
							modal_tabheader1:					"��������������������",
							modal_tabheader2:					"���������� ����������",
							modal_tabheader3:					"���������� ��������",
							modal_tabheader4:					"���������� ������������������������",
							modal_useravatar:					"������������",
							modal_username:						"���������������� ��������� ����������������������",
							modal_userolecolor:					"���� �������������������������� ���������� ��������",
							modal_usertag:						"����������������",
							modal_useservernick:				"���� �������������������������� ��������������������",
							submenu_resetsettings:				"�������������� ������������������������ ����������������������",
							submenu_usersettings:				"�������������� ������������������������"
						};
					case "vi":		// Vietnamese
						return {
							confirm_reset:						"B���n c�� ch���c ch���n mu���n �����t l���i Ng�����i d��ng n��y kh��ng?",
							confirm_resetall:					"B���n c�� ch���c ch���n mu���n �����t l���i t���t c��� Ng�����i d��ng kh��ng?",
							context_localusersettings:			"C��i �����t ng�����i d��ng c���c b���",
							modal_colorpicker1:					"T��n m��u",
							modal_colorpicker2:					"M��u n���n",
							modal_colorpicker3:					"M��u th���",
							modal_colorpicker4:					"M��u ph��ng ch���",
							modal_colorpicker5:					"M��u ph��ng ch���",
							modal_header:						"C��i �����t ng�����i d��ng c���c b���",
							modal_ignoretagcolor:				"S��� d���ng m��u vai tr��",
							modal_invalidurl:					"URL kh��ng h���p l���",
							modal_showservernick:				"Hi���n th��� bi���t hi���u",
							modal_tabheader1:					"Ng�����i d��ng",
							modal_tabheader2:					"T��n m��u",
							modal_tabheader3:					"M��u th���",
							modal_tabheader4:					"M��u tin nh���n",
							modal_useravatar:					"H��nh �����i di���n",
							modal_username:						"T��n ng�����i d��ng c���c b���",
							modal_userolecolor:					"Kh��ng ghi ���� M��u vai tr��",
							modal_usertag:						"Nh��n",
							modal_useservernick:				"Kh��ng ghi ���� bi���t hi���u",
							submenu_resetsettings:				"�����t l���i ng�����i d��ng",
							submenu_usersettings:				"Thay �����i c��i �����t"
						};
					case "zh-CN":	// Chinese (China)
						return {
							confirm_reset:						"���������������������������������",
							confirm_resetall:					"������������������������������������",
							context_localusersettings:			"������������������",
							modal_colorpicker1:					"������������",
							modal_colorpicker2:					"������������",
							modal_colorpicker3:					"������������",
							modal_colorpicker4:					"������������",
							modal_colorpicker5:					"������������",
							modal_header:						"������������������",
							modal_ignoretagcolor:				"������������������",
							modal_invalidurl:					"���������������",
							modal_showservernick:				"������������",
							modal_tabheader1:					"������",
							modal_tabheader2:					"������������",
							modal_tabheader3:					"������������",
							modal_tabheader4:					"������������",
							modal_useravatar:					"������",
							modal_username:						"���������������",
							modal_userolecolor:					"������������������������",
							modal_usertag:						"������",
							modal_useservernick:				"������������������",
							submenu_resetsettings:				"������������",
							submenu_usersettings:				"������������"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							confirm_reset:						"���������������������������������",
							confirm_resetall:					"������������������������������������",
							context_localusersettings:			"������������������",
							modal_colorpicker1:					"������������",
							modal_colorpicker2:					"������������",
							modal_colorpicker3:					"������������",
							modal_colorpicker4:					"������������",
							modal_colorpicker5:					"������������",
							modal_header:						"������������������",
							modal_ignoretagcolor:				"������������������",
							modal_invalidurl:					"���������������",
							modal_showservernick:				"������������",
							modal_tabheader1:					"������",
							modal_tabheader2:					"������������",
							modal_tabheader3:					"������������",
							modal_tabheader4:					"������������",
							modal_useravatar:					"������",
							modal_username:						"���������������",
							modal_userolecolor:					"������������������������",
							modal_usertag:						"������",
							modal_useservernick:				"������������������",
							submenu_resetsettings:				"������������",
							submenu_usersettings:				"������������"
						};
					default:		// English
						return {
							confirm_reset:						"Are you sure you want to reset this User?",
							confirm_resetall:					"Are you sure you want to reset all Users?",
							context_localusersettings:			"Local User Settings",
							modal_colorpicker1:					"Name Color",
							modal_colorpicker2:					"Background Color",
							modal_colorpicker3:					"Tag Color",
							modal_colorpicker4:					"Font Color",
							modal_colorpicker5:					"Font Color",
							modal_header:						"Local User Settings",
							modal_ignoretagcolor:				"Use Role Color",
							modal_invalidurl:					"Invalid URL",
							modal_showservernick:				"Show Nickname",
							modal_tabheader1:					"User",
							modal_tabheader2:					"Name Color",
							modal_tabheader3:					"Tag Color",
							modal_tabheader4:					"Message Color",
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
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
