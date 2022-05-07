/**
 * @name RemoveBlockedUsers
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.4.8
 * @description Removes blocked Messages/Users
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RemoveBlockedUsers/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/RemoveBlockedUsers/RemoveBlockedUsers.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "RemoveBlockedUsers",
			"author": "DevilBro",
			"version": "1.4.8",
			"description": "Removes blocked Messages/Users"
		},
		"changeLog": {
			"fixed": {
				"Search Page": "Removes the 'we hide x blocked messages from search' message"
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
		var cachedChannelId, cachedReactions;
		
		return class RemoveBlockedUsers extends Plugin {
			onLoad () {
				this.defaults = {
					notifcations: {
						messages:			{value: true, 	description: "Messages Notifications"},
						voiceChat:			{value: true, 	description: "Voice Chat Notifications"},
					},
					places: {
						messages:			{value: true, 	description: "Messages"},
						pins:				{value: true, 	description: "Pinned Messages"},
						inbox:				{value: true, 	description: "Inbox Messages"},
						replies:			{value: true, 	description: "Replies"},
						mentions:			{value: true, 	description: "Mentions"},
						reactions:			{value: true, 	description: "Reactions"},
						autocompletes:		{value: true, 	description: "Autocomplete Entries"},
						memberList:			{value: true, 	description: "Members in List"},
						voiceList:			{value: true, 	description: "Members in Voice List"},
						voiceChat:			{value: true, 	description: "Members in Voice Chat"},
						activity:			{value: true, 	description: "Activity Page"},
						channelList:		{value: true, 	description: "Channel/Group List"},
						recentDms:			{value: true, 	description: "Group Notifications"},
						friendsBlocked:		{value: true, 	description: "Friends Tab (Blocked Users List)"}
					}
				};
				
				this.patchedModules = {
					before: {
						SearchResults: "render",
						Message: "default",
						ReactorsComponent: "render",
						PrivateChannelRecipients: "default",
						NowPlayingItem: "default",
						VoiceUsers: "render",
						PrivateChannel: "render",
						PrivateChannelCallParticipants: "render",
						ChannelCall: "render",
						UserSummaryItem: "render"
					},
					after: {
						ChannelPins: "default",
						RecentMentions: "default",
						Messages: "type",
						SearchResultsInner: "default",
						Reactions: "render",
						ConnectedChannelMembers: "default",
						MemberListItem: "render",
						NowPlayingItem: "default",
						VoiceUser: "render",
						DirectMessage: "render",
						PrivateChannel: "render",
						UserMention: "default",
						RichUserMention: "UserMention"
					}
				};
				
				this.patchPriority = 8;
			}
			
			onStart () {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.ChannelStore, "getChannel", {after: e => {
					if (e.returnValue && e.returnValue.isGroupDM()) return new BDFDB.DiscordObjects.Channel(Object.assign({}, e.returnValue, {rawRecipients: e.returnValue.rawRecipients.filter(n => !n || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.id)), recipients: e.returnValue.recipients.filter(id => !id || !BDFDB.LibraryModules.RelationshipStore.isBlocked(id))}))
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.RelationshipUtils, "addRelationship", {after: e => {
					if (e.methodArguments[2] == BDFDB.DiscordConstants.RelationshipTypes.BLOCKED) this.forceUpdateAll();
				}});
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.RelationshipUtils, "removeRelationship", {after: e => this.forceUpdateAll()});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.UnreadChannelUtils, "getUnreadCount", {after: e => {
					if (e.returnValue && this.settings.notifcations.messages && e.returnValue < BDFDB.DiscordConstants.MAX_MESSAGES_PER_CHANNEL) {
						let sub = 0, messages = [].concat(BDFDB.LibraryModules.MessageStore.getMessages(e.methodArguments[0])._array).reverse();
						for (let i = 0; i < e.returnValue; i++) if (messages[i] && messages[i].blocked) sub++;
						e.returnValue -= sub;
					}
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.UnreadChannelUtils, "hasUnread", {after: e => {
					if (e.returnValue && this.settings.notifcations.messages && BDFDB.LibraryModules.UnreadChannelUtils.getUnreadCount(e.methodArguments[0]) < BDFDB.DiscordConstants.MAX_MESSAGES_PER_CHANNEL) {
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
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.UnreadGuildUtils, "hasUnread", {after: e => {
					if (e.returnValue && this.settings.notifcations.messages) return BDFDB.LibraryModules.GuildChannelStore.getChannels(e.methodArguments[0]).SELECTABLE.map(n => n.channel && n.channel.id).filter(n => n && n != "null").some(id => BDFDB.LibraryModules.UnreadChannelUtils.hasUnread(id));
				}});
				
				if (BDFDB.LibraryModules.AutocompleteOptions && BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS) BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS.MENTIONS, "queryResults", {after: e => {
					if (this.settings.places.autocompletes && e.returnValue.results && e.returnValue.results.users) e.returnValue.results.users = e.returnValue.results.users.filter(n => !n.user || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.user.id));
				}});
				
				let muteTimeout;
				let channelId = BDFDB.LibraryModules.CurrentVoiceUtils.getChannelId();
				let connectedUsers = BDFDB.ObjectUtils.filter(BDFDB.LibraryModules.VoiceUtils.getVoiceStates(BDFDB.LibraryModules.CurrentVoiceUtils.getGuildId()), n => n && n.channelId == channelId && !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.userId));
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SoundUtils, "playSound", {instead: e => {
					let type = e.methodArguments[0];
					if (this.settings.notifcations.voiceChat && type == "user_join" || type == "user_leave" || type == "user_moved") {
						channelId = BDFDB.LibraryModules.CurrentVoiceUtils.getChannelId();
						if (channelId) {
							let allConnectedUsers = BDFDB.ObjectUtils.filter(BDFDB.LibraryModules.VoiceUtils.getVoiceStates(BDFDB.LibraryModules.CurrentVoiceUtils.getGuildId()), n => n && n.channelId == channelId);
							let unblockedUsers = BDFDB.ObjectUtils.filter(allConnectedUsers, n => n && !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.userId));
							let unmutedBlockedUsers = BDFDB.ObjectUtils.toArray(allConnectedUsers).filter(n => n && BDFDB.LibraryModules.RelationshipStore.isBlocked(n.userId) && !BDFDB.LibraryModules.MediaDeviceUtils.isLocalMute(n.userId));
							if (unmutedBlockedUsers.length) {
								BDFDB.TimeUtils.clear(muteTimeout);
								muteTimeout = BDFDB.TimeUtils.timeout(_ => {
									while (unmutedBlockedUsers.length) BDFDB.LibraryModules.MediaDeviceSetUtils.toggleLocalMute(unmutedBlockedUsers.pop().userId);
								}, 1000);
							}
							if (Object.keys(unblockedUsers).length == Object.keys(connectedUsers).length) {
								e.stopOriginalMethodCall();
								e.methodArguments[0] = null;
							}
							else e.callOriginalMethodAfterwards();
							connectedUsers = unblockedUsers;
						}
						else e.callOriginalMethodAfterwards();
					}
					else e.callOriginalMethodAfterwards();
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
							title: "Disable",
							children: Object.keys(this.defaults.notifcations).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["notifcations", key],
								label: this.defaults.notifcations[key].description,
								value: this.settings.notifcations[key]
							}))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Remove",
							children: Object.keys(this.defaults.places).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["places", key],
								label: this.defaults.places[key].description,
								value: this.settings.places[key]
							}))
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
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}
		
			processMessages (e) {
				if (this.settings.places.messages) {
					let messagesIns = e.returnvalue.props.children;
					if (BDFDB.ArrayUtils.is(messagesIns.props.channelStream)) {
						let oldStream = messagesIns.props.channelStream.filter(n => n.type != "MESSAGE_GROUP_BLOCKED"), newStream = [];
						for (let i in oldStream) {
							let next = parseInt(i)+1;
							if (oldStream[i].type != "DIVIDER" || (oldStream[next] && oldStream[i].type == "DIVIDER" && oldStream[next].type != "DIVIDER" && oldStream.slice(next).some(nextStream => nextStream.type != "DIVIDER"))) newStream.push(oldStream[i]);
						}
						let groupId, author;
						for (let i in newStream) {
							if (newStream[i].type == "MESSAGE" && (newStream[i].content.type.type == BDFDB.DiscordConstants.MessageTypes.DEFAULT || newStream[i].content.type.type == BDFDB.DiscordConstants.MessageTypes.REPLY) && groupId != newStream[i].groupId) {
								if (author && author.id == newStream[i].content.author.id && author.username == newStream[i].content.author.username) newStream[i] = Object.assign({}, newStream[i], {groupId: groupId});
								author = newStream[i].content.author;
							}
							else author = null;;
							groupId = newStream[i].groupId;
						}
						messagesIns.props.channelStream = newStream;
					}
					if (BDFDB.ObjectUtils.is(messagesIns.props.messages) && BDFDB.ArrayUtils.is(messagesIns.props.messages._array)) {
						let messages = messagesIns.props.messages;
						messagesIns.props.messages = new BDFDB.DiscordObjects.Messages(messages);
						for (let key in messages) messagesIns.props.messages[key] = messages[key];
						messagesIns.props.messages._array = [].concat(messagesIns.props.messages._array.filter(n => !n.author || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.author.id)));
						if (messagesIns.props.oldestUnreadMessageId && messagesIns.props.messages._array.every(n => n.id != messagesIns.props.oldestUnreadMessageId)) messagesIns.props.oldestUnreadMessageId = null;
					}
				}
			}
		
			processMessage (e) {
				if (this.settings.places.replies) {
					let repliedMessage = e.instance.props.childrenRepliedMessage;
					if (repliedMessage && repliedMessage.props && repliedMessage.props.children && repliedMessage.props.children.props && repliedMessage.props.children.props.referencedMessage && repliedMessage.props.children.props.referencedMessage.message && repliedMessage.props.children.props.referencedMessage.message.author && BDFDB.LibraryModules.RelationshipStore.isBlocked(repliedMessage.props.children.props.referencedMessage.message.author.id)) {
						delete e.instance.props.childrenRepliedMessage;
						let header = e.instance.props.childrenHeader;
						if (header && header.props) {
							delete header.props.referencedMessage;
							delete header.props.referencedUsernameProfile;
							delete header.props.replyReference;
							header.props.message = new BDFDB.DiscordObjects.Message(Object.assign({}, header.props.message, {messageReference: null}));
						}
					}
				}
			}
			
			processSearchResults (e) {
				console.log(e);
				if (this.settings.places.messages && e.instance.props.blockCount && e.instance.props.search && e.instance.props.search.totalResults <= BDFDB.DiscordConstants.SEARCH_PAGE_SIZE) e.instance.props.search = Object.assign({}, e.instance.props.search, {totalResults: e.instance.props.search.totalResults - e.instance.props.blockCount});
			}
			
			processSearchResultsInner (e) {
				if (this.settings.places.messages && e.instance.props.search) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.searchresultsblocked]]});
					if (index > -1) children.splice(index, 1);
				}
			}
		
			processChannelPins (e) {
				if (this.settings.places.pins && e.returnvalue.props && e.returnvalue.props.children && e.returnvalue.props.children.props && BDFDB.ArrayUtils.is(e.returnvalue.props.children.props.messages)) e.returnvalue.props.children.props.messages = e.returnvalue.props.children.props.messages.filter(n => !n || !n.author || !n.author.id || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.author.id));
			}
			
			processRecentMentions (e) {
				if (this.settings.places.inbox && BDFDB.ArrayUtils.is(e.returnvalue.props.messages)) e.returnvalue.props.messages = e.returnvalue.props.messages.filter(n => !n || !n.author || !n.author.id || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.author.id));
			}
			
			processReactions (e) {
				if (this.settings.places.reactions && e.returnvalue && e.returnvalue.props.children && BDFDB.ArrayUtils.is(e.returnvalue.props.children[0])) {
					let updateTimeout, relationshipCount = BDFDB.LibraryModules.RelationshipStore.getRelationshipCount();
					if (cachedChannelId != e.instance.props.message.channel_id) {
						cachedReactions = {};
						cachedChannelId = e.instance.props.message.channel_id;
					}
					if (!cachedReactions[e.instance.props.message.id]) cachedReactions[e.instance.props.message.id] = {};
					for (let i in e.returnvalue.props.children[0]) {
						let reaction = e.returnvalue.props.children[0][i];
						let emojiId = reaction.props.emoji.name || reaction.props.emoji.id;
						let oldCount = (reaction.props.message.reactions.find(n => n.emoji.name && n.emoji.name == emojiId || n.emoji.id == emojiId) || {}).count;
						if (oldCount && oldCount < 10) {
							if (cachedReactions[reaction.props.message.id][emojiId] && cachedReactions[reaction.props.message.id][emojiId].relationshipCount == relationshipCount && cachedReactions[reaction.props.message.id][emojiId].oldCount == oldCount) {
								reaction.props.count = cachedReactions[reaction.props.message.id][emojiId].reactions.length;
								if (reaction.props.count < 1) e.returnvalue.props.children[0][i] = null;
							}
							else BDFDB.LibraryModules.ReactionUtils.getReactions(reaction.props.message.channel_id, reaction.props.message.id, reaction.props.emoji).then(reactions => {
								if (!reactions || !reactions.length) return;
								let someBlocked = false;
								let filteredReactions = reactions.filter(n => {
									let isBlocked = n && BDFDB.LibraryModules.RelationshipStore.isBlocked(n.id);
									someBlocked = someBlocked || isBlocked;
									return !isBlocked;
								});
								if (someBlocked) {
									reaction.props.reactions = filteredReactions;
									reaction.props.count = reaction.props.reactions.length;
									BDFDB.TimeUtils.clear(updateTimeout);
									updateTimeout = BDFDB.TimeUtils.timeout(_ => BDFDB.ReactUtils.forceUpdate(e.instance), 1000);
								}
								if (cachedReactions && cachedReactions[reaction.props.message.id]) cachedReactions[reaction.props.message.id][emojiId] = {
									blocked: someBlocked,
									relationshipCount: relationshipCount,
									oldCount: oldCount || 0,
									reactions: reaction.props.reactions || reactions
								};
							});
						}
					}
					if (!e.returnvalue.props.children[0].filter(n => n).length) return null;
				}
			}
		
			processReactorsComponent (e) {
				if (this.settings.places.reactions && BDFDB.ArrayUtils.is(e.instance.props.reactors)) e.instance.props.reactors = e.instance.props.reactors.filter(n => !n || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.id));
			}
			
			processConnectedChannelMembers (e) {
				if (!this.settings.places.memberList) return;
				let channelMembers = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "ChannelMembers"});
				if (!channelMembers) return;
				let hiddenRows = false, newRows = new Array(channelMembers.props.rows.length), newGroups = new Array(channelMembers.props.groups.length);
				for (let i in channelMembers.props.groups) newGroups[i] = Object.assign({}, channelMembers.props.groups[i]);
				for (let i in channelMembers.props.rows) {
					let row = channelMembers.props.rows[i];
					if (!row || row.type != "MEMBER") newRows[i] = row;
					else if (!row.user || !BDFDB.LibraryModules.RelationshipStore.isBlocked(row.user.id)) newRows[i] = row;
					else {
						hiddenRows = true;
						let found = false, rowIndex = i - 1;
						while (!found && rowIndex > -1) {
							if (newRows[rowIndex] && newRows[rowIndex].type == "GROUP") {
								found = true;
								let groupIndex = newGroups.findIndex(r => r.id == newRows[rowIndex].id);
								if (groupIndex > -1) {
									newGroups[groupIndex].count = newGroups[groupIndex].count - 1;
									newRows[rowIndex].count = newGroups[groupIndex].count;
								}
							}
							else rowIndex--;
						}
					}
				}
				if (hiddenRows) {
					let indexSum = 0;
					for (let i in newGroups) {
						newGroups[i].index = indexSum;
						if (newGroups[i].count > 0) indexSum += (newGroups[i].count + 1);
					}
					for (let i in newRows) if (newRows[i] && newRows[i].type == "GROUP" && newRows[i].count <= 0) newRows[i] = undefined;
					const removeEmptyWithin = (array, filter) => {
						let reversed = [].concat(array).reverse();
						let prefixLength = 0, suffixLength = 0;
						for (let i in array) if (array[i] !== undefined) {
							prefixLength = parseInt(i);
							break;
						}
						for (let i in reversed) if (reversed[i] !== undefined) {
							suffixLength = parseInt(i);
							break;
						}
						return [].concat(new Array(prefixLength), array.filter(filter), new Array(suffixLength))
					};
					channelMembers.props.rows = removeEmptyWithin(newRows, n => n);
					channelMembers.props.groups = removeEmptyWithin(newGroups, g => g && g.count > 0);
				}
			}
			
			processPrivateChannelRecipients (e) {
				if (this.settings.places.voiceChat && e.instance.props.channel && e.instance.props.channel.isGroupDM()) e.instance.props.channel = new BDFDB.DiscordObjects.Channel(Object.assign({}, e.instance.props.channel, {rawRecipients: e.instance.props.channel.rawRecipients.filter(n => !n || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.id)), recipients: e.instance.props.channel.recipients.filter(id => !id || !BDFDB.LibraryModules.RelationshipStore.isBlocked(id))}));
			}
			
			processMemberListItem (e) {
				if (this.settings.places.memberList && e.instance.props.user && BDFDB.LibraryModules.RelationshipStore.isBlocked(e.instance.props.user.id)) return null;
			}

			processNowPlayingItem (e) {
				if (this.settings.places.activity) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.instance, {name: "NowPlayingHeader"});
					if (index > -1) for (let child of children) if (child && child.props && child.props.party) {
						if (!e.returnvalue) {
							if (child.props.party.priorityMembers) {
								child.props.party.priorityMembers = child.props.party.priorityMembers.filter(n => !n || !n.user || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.user.id));
								if (!child.props.party.priorityMembers.length) child.props.party.priorityMembers.push({user: new BDFDB.DiscordObjects.User({id: 0, username: ""})});
							}
							if (child.props.party.partiedMembers) child.props.party.partiedMembers = child.props.party.partiedMembers.filter(n => !n || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.id));
							if (child.props.party.voiceChannels) for (let i in child.props.party.voiceChannels) child.props.party.voiceChannels[i] = Object.assign({}, child.props.party.voiceChannels[i], {members: child.props.party.voiceChannels[i].members.filter(n => !n || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.id))});
						}
						else {
							if (child.props.party.priorityMembers && child.props.party.priorityMembers[0].user && child.props.party.priorityMembers[0].user.id == 0) {
								e.returnvalue = null;
								break;
							}
						}
					}
				}
			}
		
			processVoiceUsers (e) {
				if (this.settings.places.voiceList && BDFDB.ArrayUtils.is(e.instance.props.voiceStates)) e.instance.props.voiceStates = [].concat(e.instance.props.voiceStates).filter(n => !n.user || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.user.id));
			}
		
			processVoiceUser (e) {
				if (this.settings.places.voiceList && e.instance.props.user && BDFDB.LibraryModules.RelationshipStore.isBlocked(e.instance.props.user.id)) return null;
			}

			processDirectMessage (e) {
				if (this.settings.places.recentDms && e.instance.props.channel) {
					if (e.instance.props.channel.isGroupDM()) {
						if (!e.instance.props.channel.name) {
							let tooltip = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "ListItemTooltip"});
							if (tooltip) tooltip.props.text = this.getGroupName(e.instance.props.channel.id);
						}
					}
					else {
						if (BDFDB.LibraryModules.RelationshipStore.isBlocked(e.instance.props.channel.getRecipientId())) e.returnvalue = null;
					}
				}
			}

			processPrivateChannel (e) {
				if (this.settings.places.channelList && e.instance.props.channel) {
					if (e.instance.props.channel.isGroupDM()) {
						if (!e.returnvalue) {
							e.instance.props.channel = new BDFDB.DiscordObjects.Channel(Object.assign({}, e.instance.props.channel, {rawRecipients: e.instance.props.channel.rawRecipients.filter(n => !n || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.id)), recipients: e.instance.props.channel.recipients.filter(id => !id || !BDFDB.LibraryModules.RelationshipStore.isBlocked(id))}));
						}
						else {
							if (!e.instance.props.channel.name) {
								let wrapper = e.returnvalue && e.returnvalue.props.children && e.returnvalue.props.children.props && typeof e.returnvalue.props.children.props.children == "function" ? e.returnvalue.props.children : e.returnvalue;
								if (typeof wrapper.props.children == "function") {
									let childrenRender = wrapper.props.children;
									wrapper.props.children = BDFDB.TimeUtils.suppress((...args) => {
										let children = childrenRender(...args);
										children.props.name = BDFDB.ReactUtils.createElement("span", {children: this.getGroupName(e.instance.props.channel.id)});
										return children;
									}, "", this);
								}
								else wrapper.props.name = BDFDB.ReactUtils.createElement("span", {children: this.getGroupName(e.instance.props.channel.id)});
							}
						}
					}
					else {
						if (e.returnvalue && BDFDB.LibraryModules.RelationshipStore.isBlocked(e.instance.props.channel.getRecipientId())) e.returnvalue = null;
					}
				}
			}

			processPrivateChannelCallParticipants (e) {
				if (this.settings.places.voiceChat) {
					if (BDFDB.ArrayUtils.is(e.instance.props.participants)) e.instance.props.participants = [].concat(e.instance.props.participants).filter(n => !n.user || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.user.id));
					if (BDFDB.ArrayUtils.is(e.instance.props.filteredParticipants)) e.instance.props.filteredParticipants = [].concat(e.instance.props.filteredParticipants).filter(n => !n.user || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.user.id));
				}
			}
			
			processChannelCall (e) {
				if (this.settings.places.voiceChat) {
					if (BDFDB.ArrayUtils.is(e.instance.props.participants)) e.instance.props.participants = [].concat(e.instance.props.participants).filter(n => !n.user || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.user.id));
					if (BDFDB.ArrayUtils.is(e.instance.props.filteredParticipants)) e.instance.props.filteredParticipants = [].concat(e.instance.props.filteredParticipants).filter(n => !n.user || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.user.id));
				}
			}

			processUserSummaryItem (e) {
				if (this.settings.places.memberList && BDFDB.ArrayUtils.is(e.instance.props.users)) e.instance.props.users = [].concat(e.instance.props.users).filter(n => !n || !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.id));
			}
			
			processUserMention (e) {
				if (e.instance.props.userId && this.settings.places.mentions && BDFDB.LibraryModules.RelationshipStore.isBlocked(e.instance.props.userId)) return BDFDB.ReactUtils.createElement("span", {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.mention, BDFDB.disCN.mentionwrapper, e.instance.props.className),
					children: ["@" + BDFDB.LanguageUtils.LanguageStrings.UNKNOWN_USER]
				});
			}
			
			processRichUserMention (e) {
				if (e.instance.props.id && this.settings.places.mentions && BDFDB.LibraryModules.RelationshipStore.isBlocked(e.instance.props.id)) return BDFDB.ReactUtils.createElement("span", {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.mention, BDFDB.disCN.mentionwrapper, e.instance.props.className),
					children: ["@" + BDFDB.LanguageUtils.LanguageStrings.UNKNOWN_USER]
				});
			}
			
			getGroupName (channelId) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channelId);
				if (channel.name) return channel.name;
				let recipients = channel.recipients.map(BDFDB.LibraryModules.UserStore.getUser).filter(n => n && !BDFDB.LibraryModules.RelationshipStore.isBlocked(n.id));
				return recipients.length > 0 ? recipients.map(u => u.toString()).join(", ") : BDFDB.LanguageUtils.LanguageStrings.UNNAMED;
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
