/**
 * @name RemoveBlockedMessages
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RemoveBlockedMessages
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RemoveBlockedMessages/RemoveBlockedMessages.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "RemoveBlockedMessages",
			"author": "DevilBro",
			"version": "1.1.1",
			"description": "Completely removes blocked messages"
		},
		"changeLog": {
			"improved": {
				"Pinned Messages": "Now also hides pinned messages of blocked ppl",
			},
			"fixed": {
				"Member List": "Fixed issue where some none blocked users are hidden and groups with 0 ppl didn't get hidden",
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
		var settings = {};
		
		return class RemoveBlockedMessages extends Plugin {
			onLoad() {
				this.defaults = {
					settings: {
						removeMessages:			{value:true,			description:"Remove messages of blocked users"},
						removeUsers:			{value:true,			description:"Remove blocked users (memberlist, voicechannels)"},
						disableNotifications:	{value:true,			description:"Disable unread markers for messages of blocked users"},
					}
				};
				
				this.patchedModules = {
					before: {
						MessagesPopout: "render",
						ReactorsComponent: "render",
						ChannelMembers: "render",
						PrivateChannelRecipients: "default",
						VoiceUsers: "render",
						PrivateChannel: "render",
						PrivateChannelCallParticipants: "render",
						ChannelCall: "render",
						UserSummaryItem: "render"
					},
					after: {
						Messages: "type",
						MemberListItem: "render",
						VoiceUser: "render",
						Mention: "default"
					}
				};
				
				this.patchPriority = 10;
			}
			
			onStart() {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.UnreadChannelUtils, "hasUnread", {after: e => {
					if (e.returnValue && settings.disableNotifications) {
						let count = BDFDB.LibraryModules.UnreadChannelUtils.getUnreadCount(e.methodArguments[0]);
						if (count < BDFDB.DiscordConstants.MAX_MESSAGES_PER_CHANNEL) {
							let id = BDFDB.LibraryModules.UnreadChannelUtils.lastMessageId(e.methodArguments[0]);
							let message = id && BDFDB.LibraryModules.MessageStore.getMessage(e.methodArguments[0], id);
							if (message && message.blocked) {
								let oldestId = BDFDB.LibraryModules.UnreadChannelUtils.getOldestUnreadMessageId(e.methodArguments[0]);
								let messages = BDFDB.LibraryModules.MessageStore.getMessages(e.methodArguments[0]);
								if (messages && oldestId) {
									let index = messages._array.indexOf(messages._array.find(c => c.id == oldestId));
									if (index > -1) return messages._array.slice(index).some(c => !c.blocked);
								}
							}
						}
					}
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.UnreadGuildUtils, "hasUnread", {after: e => {
					if (e.returnValue && settings.disableNotifications) {
						return BDFDB.LibraryModules.GuildChannelStore.getChannels(e.methodArguments[0]).SELECTABLE.map(n => n.channel && n.channel.id).filter(n => n && n != "null").some(BDFDB.LibraryModules.UnreadChannelUtils.hasUnread);
					}
				}});
				
				if (BDFDB.LibraryModules.AutocompleteOptions && BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS) BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS.MENTIONS, "queryResults", {after: e => {
					if (settings.removeUsers) e.returnValue.users = e.returnValue.users.filter(n => !n.user || !BDFDB.LibraryModules.FriendUtils.isBlocked(n.user.id));
				}});
				
				this.forceUpdateAll();
			}
			
			onStop() {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
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
				
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}
		
			processMessages (e) {
				if (settings.removeMessages) {
					let messagesIns = e.returnvalue.props.children;
					if (BDFDB.ArrayUtils.is(messagesIns.props.channelStream)) {
						let oldStream = messagesIns.props.channelStream.filter(n => n.type != "MESSAGE_GROUP_BLOCKED"), newChannelStream = [];
						for (let i in oldStream) {
							let next = parseInt(i)+1;
							if (oldStream[i].type != "DIVIDER" || (oldStream[next] && oldStream[i].type == "DIVIDER" && oldStream[next].type != "DIVIDER" && oldStream.slice(next).some(nextStream => nextStream.type != "DIVIDER"))) newChannelStream.push(oldStream[i]);
						}
						messagesIns.props.channelStream = newChannelStream;
					}
					if (BDFDB.ObjectUtils.is(messagesIns.props.messages) && BDFDB.ArrayUtils.is(messagesIns.props.messages._array)) {
						let messages = messagesIns.props.messages;
						messagesIns.props.messages = new BDFDB.DiscordObjects.Messages(messages);
						for (let key in messages) messagesIns.props.messages[key] = messages[key];
						messagesIns.props.messages._array = [].concat(messagesIns.props.messages._array.filter(n => !n.author || !BDFDB.LibraryModules.FriendUtils.isBlocked(n.author.id)));
						if (messagesIns.props.oldestUnreadMessageId && messagesIns.props.messages._array.every(n => n.id != messagesIns.props.oldestUnreadMessageId)) messagesIns.props.oldestUnreadMessageId = null;
					}
				}
			}
		
			processMessagesPopout (e) {
				if (settings.removeMessages && BDFDB.ArrayUtils.is(e.instance.props.messages)) e.instance.props.messages = e.instance.props.messages.filter(n => !n || !n.author || !n.author.id || !BDFDB.LibraryModules.FriendUtils.isBlocked(n.author.id));
			}
		
			processReactorsComponent (e) {
				if (settings.removeUsers && BDFDB.ArrayUtils.is(e.instance.props.reactors)) e.instance.props.reactors = e.instance.props.reactors.filter(n => !n || !BDFDB.LibraryModules.FriendUtils.isBlocked(n.id));
			}
		
			processChannelMembers (e) {
				if (settings.removeUsers) {
					e.instance.props.groups = [].concat(e.instance.props.groups);
					e.instance.props.rows = [].concat(e.instance.props.rows);
					let newRows = [], newGroups = [];
					for (let i in e.instance.props.rows) {
						let row = e.instance.props.rows[i];
						if (row.type != "MEMBER") newRows.push(row);
						else if (!row.user || !BDFDB.LibraryModules.FriendUtils.isBlocked(row.user.id)) newRows.push(row);
						else {
							let found = false, rowIndex = i - 1;
							while (!found && rowIndex > -1) {
								if (newRows[rowIndex] && newRows[rowIndex].type == "GROUP") {
									found = true;
									let groupIndex = e.instance.props.groups.findIndex(r => r.id == newRows[rowIndex].id);
									if (groupIndex) {
										e.instance.props.groups[groupIndex] = Object.assign({}, e.instance.props.groups[groupIndex], {count: e.instance.props.groups[groupIndex].count - 1});
										newRows[rowIndex] = Object.assign({}, newRows[rowIndex], {count: e.instance.props.groups[groupIndex].count});
									}
								}
								else rowIndex--;
							}
						}
					}
					let indexSum = 0;
					for (let i in e.instance.props.groups) {
						newGroups[i] = Object.assign({}, e.instance.props.groups[i], {index: indexSum});
						if (e.instance.props.groups[i].count > 0) indexSum += (e.instance.props.groups[i].count + 1);
					}
					e.instance.props.groups = newGroups.filter(g => g && g.count > 0);
					e.instance.props.rows = newRows.filter(r => r && (r.type != "GROUP" || r.count > 0));
				}
			}
			
			processPrivateChannelRecipients (e) {
				if (settings.removeUsers && e.instance.props.channel && e.instance.props.channel.isGroupDM()) e.instance.props.channel = new BDFDB.DiscordObjects.Channel(Object.assign({}, e.instance.props.channel, {rawRecipients: e.instance.props.channel.rawRecipients.filter(n => !n || !BDFDB.LibraryModules.FriendUtils.isBlocked(n.id)), recipients: e.instance.props.channel.recipients.filter(id => !id || !BDFDB.LibraryModules.FriendUtils.isBlocked(id))}));
			}
			
			processMemberListItem (e) {
				if (settings.removeUsers && e.instance.props.user && BDFDB.LibraryModules.FriendUtils.isBlocked(e.instance.props.user.id)) return null;
			}
		
			processVoiceUsers (e) {
				if (settings.removeUsers && BDFDB.ArrayUtils.is(e.instance.props.voiceStates)) e.instance.props.voiceStates = [].concat(e.instance.props.voiceStates).filter(n => !n.user || !BDFDB.LibraryModules.FriendUtils.isBlocked(n.user.id));
			}
		
			processVoiceUser (e) {
				if (settings.removeUsers && e.instance.props.user && BDFDB.LibraryModules.FriendUtils.isBlocked(e.instance.props.user.id)) return null;
			}

			processPrivateChannel (e) {
				if (settings.removeUsers && e.instance.props.channel && e.instance.props.channel.isGroupDM()) e.instance.props.channel = new BDFDB.DiscordObjects.Channel(Object.assign({}, e.instance.props.channel, {rawRecipients: e.instance.props.channel.rawRecipients.filter(n => !n || !BDFDB.LibraryModules.FriendUtils.isBlocked(n.id)), recipients: e.instance.props.channel.recipients.filter(id => !id || !BDFDB.LibraryModules.FriendUtils.isBlocked(id))}));
			}

			processPrivateChannelCallParticipants (e) {
				if (settings.removeUsers && BDFDB.ArrayUtils.is(e.instance.props.participants)) e.instance.props.participants = [].concat(e.instance.props.participants).filter(n => !n.user || !BDFDB.LibraryModules.FriendUtils.isBlocked(n.user.id));
			}
			
			processChannelCall (e) {
				if (settings.removeUsers && BDFDB.ArrayUtils.is(e.instance.props.participants)) e.instance.props.participants = [].concat(e.instance.props.participants).filter(n => !n.user || !BDFDB.LibraryModules.FriendUtils.isBlocked(n.user.id));
			}

			processUserSummaryItem (e) {
				if (settings.removeUsers && BDFDB.ArrayUtils.is(e.instance.props.users)) e.instance.props.users = [].concat(e.instance.props.users).filter(n => !n || !BDFDB.LibraryModules.FriendUtils.isBlocked(n.id));
			}
			
			processMention (e) {
				if (settings.removeUsers && e.instance.props.userId && BDFDB.LibraryModules.FriendUtils.isBlocked(e.instance.props.userId)) return BDFDB.ReactUtils.createElement("span", {
					className: BDFDB.disCNS.mention + BDFDB.disCN.mentionwrapper,
					children: ["@" + BDFDB_Global.LanguageUtils.LanguageStrings.UNKNOWN_USER]
				});
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();