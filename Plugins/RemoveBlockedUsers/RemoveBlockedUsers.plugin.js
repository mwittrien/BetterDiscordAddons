/**
 * @name RemoveBlockedUsers
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.7.3
 * @description Removes blocked Messages/Users
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RemoveBlockedUsers/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/RemoveBlockedUsers/RemoveBlockedUsers.plugin.js
 */

module.exports = (_ => {
	const changeLog = {};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js").then(r => {
				if (!r || r.status != 200) throw new Error();
				else return r.text();
			}).then(b => {
				if (!b) throw new Error();
				else return require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.UI.showToast("Finished downloading BDFDB Library", {type: "success"}));
			}).catch(error => {
				BdApi.UI.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.UI.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
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
		var cachedChannelId, cachedReactions;
		
		return class RemoveBlockedUsers extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						hideBlocked:			{value: false, 	description: "Hide 'Blocked' Tab in Friends List"}
					},
					notifications: {
						messages:			{value: true, 	description: "Messages Notifications"},
						voiceChat:			{value: true, 	description: "Voice Chat Notifications"},
					},
					places: {
						messages:			{value: true, 	description: "Messages"},
						spamMessages:			{value: true, 	description: "Spam Messages"},
						ignoredMessages:		{value: true, 	description: "Ignored Messages"},
						pins:				{value: true, 	description: "Pinned Messages"},
						inbox:				{value: true, 	description: "Inbox Messages"},
						replies:			{value: true, 	description: "Message Preview in Replies"},
						repliesToBlocked:		{value: true, 	description: "Replies to blocked Messages"},
						mentions:			{value: true, 	description: "Mentions"},
						reactions:			{value: true, 	description: "Reactions"},
						threads:			{value: true, 	description: "Threads"},
						autocompletes:			{value: true, 	description: "Autocomplete Entries"},
						memberList:			{value: true, 	description: "Members in List"},
						voiceList:			{value: true, 	description: "Members in Voice List"},
						voiceChat:			{value: true, 	description: "Members in Voice Chat"},
						activity:			{value: true, 	description: "Activity Page"},
						channelList:			{value: true, 	description: "Channel/Group List"},
						recentDms:			{value: true, 	description: "Group Notifications"}
					}
				};
				
				this.modulePatches = {
					before: [
						"ChannelCall",
						"ChannelItem",
						"ChannelMembers",
						"PrivateChannel",
						"PrivateChannelRecipients",
						"Message",
						"Messages",
						"NowPlayingItem",
						"ReactionsModalUsers",
						"RTCConnectionVoiceUsers",
						"SearchResults",
						"TabBar",
						"UserSummaryItem",
						"VoiceUsers"
					],
					after: [
						"BlockedMessageGroup",
						"ChannelPins",
						"DirectMessage",
						"PrivateChannel",
						"Reactions",
						"ReactionsModal",
						"RecentMentions",
						"RichUserMention",
						"SearchResultsInner",
						"ThreadCard",
						"UserMention",
						"VoiceUser",
						"VoiceUsers"
					]
				};
				
				this.patchPriority = 8;
			}
			
			onStart () {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryStores.ChannelStore, "getChannel", {after: e => {
					if (e.returnValue && e.returnValue.isGroupDM()) return new BDFDB.DiscordObjects.Channel(Object.assign({}, e.returnValue, {rawRecipients: e.returnValue.rawRecipients.filter(n => !n || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.id)), recipients: e.returnValue.recipients.filter(id => !id || !BDFDB.LibraryStores.RelationshipStore.isBlocked(id))}))
				}});
			
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryStores.StageChannelParticipantStore, "getMutableParticipants", {after: e => {
					e.returnValue = e.returnValue.filter(n => !n.user || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.user.id));
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.RelationshipUtils, "addRelationship", {after: e => {
					if (e.methodArguments[2] == BDFDB.DiscordConstants.RelationshipTypes.BLOCKED) BDFDB.DiscordUtils.rerenderAll();
				}});
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.RelationshipUtils, "removeRelationship", {after: e => BDFDB.DiscordUtils.rerenderAll()});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryStores.ReadStateStore, "getUnreadCount", {after: e => {
					if (e.returnValue && this.settings.notifications.messages && e.returnValue < BDFDB.DiscordConstants.MAX_MESSAGES_PER_CHANNEL) {
						let sub = 0, messages = [].concat(BDFDB.LibraryStores.MessageStore.getMessages(e.methodArguments[0])._array).reverse();
						for (let i = 0; i < e.returnValue; i++) if (messages[i] && messages[i].blocked) sub++;
						e.returnValue -= sub;
					}
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryStores.ReadStateStore, "hasUnread", {after: e => {
					if (e.returnValue && this.settings.notifications.messages && BDFDB.LibraryStores.ReadStateStore.getUnreadCount(e.methodArguments[0]) < BDFDB.DiscordConstants.MAX_MESSAGES_PER_CHANNEL) {
						let id = BDFDB.LibraryStores.ReadStateStore.lastMessageId(e.methodArguments[0]);
						let message = id && BDFDB.LibraryStores.MessageStore.getMessage(e.methodArguments[0], id);
						if (message && message.blocked) {
							let oldestId = BDFDB.LibraryStores.ReadStateStore.getOldestUnreadMessageId(e.methodArguments[0]);
							let messages = BDFDB.LibraryStores.MessageStore.getMessages(e.methodArguments[0]);
							if (messages && oldestId) {
								let index = messages._array.indexOf(messages._array.find(c => c.id == oldestId));
								if (index > -1) return messages._array.slice(index).some(c => !c.blocked);
							}
						}
					}
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryStores.GuildReadStateStore, "hasUnread", {after: e => {
					if (e.returnValue && this.settings.notifications.messages) return BDFDB.LibraryStores.GuildChannelStore.getChannels(e.methodArguments[0]).SELECTABLE.map(n => n.channel && n.channel.id).filter(n => n && n != "null").some(id => BDFDB.LibraryStores.ReadStateStore.hasUnread(id));
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.QuerySearchUtils, ["queryDMUsers", "queryFriends", "queryGuildUsers", "queryChannelUsers"], {after: e => {
					if (!e.methodArguments[0].query) return;
					e.returnValue = e.returnValue.filter(n => !n || !n.record || !n.record.id || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.record.id));
				}});
				
				let muteTimeout;
				let channelId = BDFDB.LibraryModules.RTCConnectionUtils.getChannelId();
				let oldUnblockedConnectedUsers = [BDFDB.LibraryStores.SortedVoiceStateStore.getVoiceStates(BDFDB.LibraryModules.RTCConnectionUtils.getGuildId())[channelId]].flat().filter(n => n && n.user && !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.user.id));
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SoundUtils, "playSound", {before: e => {
					let type = e.methodArguments[0];
					if (!this.settings.notifications.voiceChat || !["disconnect", "user_join", "user_leave", "user_moved"].includes(type)) return;
					channelId = BDFDB.LibraryModules.RTCConnectionUtils.getChannelId();
					if (channelId) {
						let allConnectedUsers = [BDFDB.LibraryStores.SortedVoiceStateStore.getVoiceStates(BDFDB.LibraryModules.RTCConnectionUtils.getGuildId())[channelId]].flat();
						let unblockedUsers = allConnectedUsers.filter(n => n && !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.user.id));
						let unmutedBlockedUsers = allConnectedUsers.filter(n => n && BDFDB.LibraryStores.RelationshipStore.isBlocked(n.user.id) && !BDFDB.LibraryStores.MediaEngineStore.isLocalMute(n.userId));
						if (unmutedBlockedUsers.length) {
							BDFDB.TimeUtils.clear(muteTimeout);
							muteTimeout = BDFDB.TimeUtils.timeout(_ => {
								while (unmutedBlockedUsers.length) {
									let userId = unmutedBlockedUsers.pop().user.id;
									if (!BDFDB.LibraryStores.MediaEngineStore.isLocalMute(userId)) BDFDB.LibraryModules.MediaEngineUtils.toggleLocalMute(userId);
								}
							}, 1000);
						}
						if (unblockedUsers.length == oldUnblockedConnectedUsers.length) e.methodArguments[1] = 0;
						oldUnblockedConnectedUsers = unblockedUsers;
					}
					else oldUnblockedConnectedUsers = [];
				}});
				
				BDFDB.DiscordUtils.rerenderAll();
			}
			
			onStop () {
				BDFDB.DiscordUtils.rerenderAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
				
						for (let key in this.defaults.general) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["general", key],
							label: this.defaults.general[key].description,
							value: this.settings.general[key]
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Disable",
							children: Object.keys(this.defaults.notifications).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["notifications", key],
								label: this.defaults.notifications[key].description,
								value: this.settings.notifications[key]
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
					BDFDB.DiscordUtils.rerenderAll();
				}
			}
		
			processMessages (e) {
				if (!this.settings.places.messages && !this.settings.places.spamMessages && !this.settings.places.ignoredMessages && !this.settings.places.repliesToBlocked) return;
				if (BDFDB.ArrayUtils.is(e.instance.props.channelStream)) {
					let oldStream = e.instance.props.channelStream.filter(n => !(this.settings.places.messages && n.type == "MESSAGE_GROUP_BLOCKED") && !(this.settings.places.spamMessages && n.type == "MESSAGE_GROUP_SPAMMER") &&  !(this.settings.places.ignoredMessages && n.type == "MESSAGE_GROUP_IGNORED") && !(this.settings.places.repliesToBlocked && n.content.messageReference && BDFDB.LibraryStores.RelationshipStore.isBlocked((BDFDB.LibraryStores.MessageStore.getMessage(n.content.messageReference.channel_id, n.content.messageReference.message_id) || {author: {}}).author.id)));
					let newStream = [];
					if (oldStream.length != e.instance.props.channelStream.length) {
						for (let i in oldStream) {
							let next = parseInt(i)+1;
							if (oldStream[i].type != "DIVIDER" || (oldStream[next] && oldStream[i].type == "DIVIDER" && oldStream[next].type != "DIVIDER" && oldStream.slice(next).some(nextStream => nextStream.type != "DIVIDER"))) newStream.push(oldStream[i]);
						}
						let groupId, timestamp, author;
						for (let i in newStream) {
							if (newStream[i].type == "MESSAGE" && BDFDB.DiscordConstants.MessageTypeGroups.USER_MESSAGE.has(newStream[i].content.type) && groupId != newStream[i].groupId && (!timestamp || timestamp && newStream[i].content.timestamp - timestamp < 600000)) {
								if (newStream[i-1] && newStream[i-1].type == "DIVIDER") groupId = newStream[i].groupId = newStream[i].content.id;
								if (author && author.id == newStream[i].content.author.id && author.username == newStream[i].content.author.username) newStream[i] = Object.assign({}, newStream[i], {groupId: groupId});
								author = newStream[i].content.author;
							}
							else author = null;
							groupId = newStream[i].groupId;
							timestamp = newStream[i].content.timestamp;
						}
						e.instance.props.channelStream = newStream;
					}
				}
				if (BDFDB.ObjectUtils.is(e.instance.props.messages) && BDFDB.ArrayUtils.is(e.instance.props.messages._array)) {
					let messages = e.instance.props.messages;
					e.instance.props.messages = new BDFDB.DiscordObjects.Messages(messages);
					for (let key in messages) e.instance.props.messages[key] = messages[key];
					e.instance.props.messages._array = [].concat(e.instance.props.messages._array.filter(n => !n.author || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.author.id)));
					if (e.instance.props.oldestUnreadMessageId && e.instance.props.messages._array.every(n => n.id != e.instance.props.oldestUnreadMessageId)) e.instance.props.oldestUnreadMessageId = null;
				}
			}
		
			processBlockedMessageGroup (e) {
				if (!this.settings.places.messages) return;
				return null;
			}
			
			processMessage (e) {
				if (!this.settings.places.replies) return;
				let repliedMessage = e.instance.props.childrenRepliedMessage;
				if (repliedMessage && repliedMessage.props && repliedMessage.props.referencedMessage && repliedMessage.props.referencedMessage.message && repliedMessage.props.referencedMessage.message.author && BDFDB.LibraryStores.RelationshipStore.isBlocked(repliedMessage.props.referencedMessage.message.author.id)) {
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
			
			processSearchResults (e) {
				if (this.settings.places.messages && e.instance.props.blockCount && e.instance.props.search && e.instance.props.search.totalResults <= BDFDB.DiscordConstants.SEARCH_PAGE_SIZE) e.instance.props.search = Object.assign({}, e.instance.props.search, {totalResults: e.instance.props.search.totalResults - e.instance.props.blockCount});
			}
			
			processSearchResultsInner (e) {
				if (!this.settings.places.messages || !e.instance.props.search) return;
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.searchresultsblocked]]});
				if (index > -1) children.splice(index, 1);
			}
		
			processChannelPins (e) {
				if (this.settings.places.pins && e.returnvalue.props && e.returnvalue.props.children && e.returnvalue.props.children.props && BDFDB.ArrayUtils.is(e.returnvalue.props.children.props.messages)) e.returnvalue.props.children.props.messages = e.returnvalue.props.children.props.messages.filter(n => !n || !n.author || !n.author.id || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.author.id));
			}
			
			processRecentMentions (e) {
				if (this.settings.places.inbox && BDFDB.ArrayUtils.is(e.returnvalue.props.messages)) e.returnvalue.props.messages = e.returnvalue.props.messages.filter(n => !n || !n.author || !n.author.id || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.author.id));
			}
			
			processReactions (e) {
				if (!this.settings.places.reactions) return;
				if (!e.returnvalue || !e.returnvalue.props.children) return;
				let emojiArrayIndex = e.returnvalue.props.children.findIndex(n => BDFDB.ArrayUtils.is(n) && n[0] && n[0].props && n[0].props.emoji);
				if (emojiArrayIndex == -1) return;
				for (let i in e.returnvalue.props.children[emojiArrayIndex]) {
					let reaction = e.returnvalue.props.children[emojiArrayIndex][i];
					let nativeReaction = reaction.props.message.reactions.find(n => n && n.emoji == reaction.props.emoji);
					if (nativeReaction) reaction.props.count = nativeReaction.count;
					let reactions = BDFDB.ObjectUtils.toArray(BDFDB.LibraryStores.MessageReactionsStore.getReactions(reaction.props.message.channel_id, reaction.props.message.id, reaction.props.emoji));
					if (!reactions || !reactions.length) return;
					let blocked = 0;
					reactions.forEach(n => {if (n && BDFDB.LibraryStores.RelationshipStore.isBlocked(n.id)) blocked++;});
					if (blocked) {
						reaction.props.count -= blocked;
						if (!reaction.props.count) e.returnvalue.props.children[emojiArrayIndex][i] = null;
					}
				}
				if (!e.returnvalue.props.children[emojiArrayIndex].filter(n => n).length) return null;
			}
		
			processReactionsModal (e) {
				if (!this.settings.places.reactions) return;
				let [reactionEntries, index] = BDFDB.ReactUtils.findParent(e.returnvalue.props.children, {filter: n => n && n.props && n.props.emoji});
				if (index == -1) return;
				for (let i in reactionEntries) {
					let reaction = reactionEntries[i];
					reaction.props = Object.assign({}, reaction.props);
					let reactions = BDFDB.ObjectUtils.toArray(BDFDB.LibraryStores.MessageReactionsStore.getReactions(e.instance.props.message.channel_id, e.instance.props.message.id, reaction.props.emoji));
					if (reactions && reactions.length) {
						let blocked = 0;
						reactions.forEach(n => {if (n && BDFDB.LibraryStores.RelationshipStore.isBlocked(n.id)) blocked++;});
						if (blocked) reaction.props.count -= blocked;
						if (!reaction.props.count) reactionEntries[i] = null;
					}
				}
			}
		
			processReactionsModalUsers (e) {
				if (this.settings.places.reactions && BDFDB.ArrayUtils.is(e.instance.props.reactors)) e.instance.props.reactors = e.instance.props.reactors.filter(n => !n || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.id));
			}
			
			processThreadCard (e) {
				if (!this.settings.places.threads) return;
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {filter: n => n && n.type && n.type.toString().indexOf(".getMostRecentMessage") > -1});
				if (index > -1 && children[index].props && children[index].props.channel) {
					let message = BDFDB.LibraryStores.MessageStore.getMessage(children[index].props.channel.id, children[index].props.channel.lastMessageId);
					if (message && BDFDB.LibraryStores.RelationshipStore.isBlocked(message.author.id)) children[index] = null;
				}
			}
			
			processChannelMembers (e) {
				if (!this.settings.places.memberList) return;
				let hiddenRows = false, newRows = new Array(e.instance.props.rows.length), newGroups = new Array(e.instance.props.groups.length);
				for (let i in e.instance.props.groups) newGroups[i] = Object.assign({}, e.instance.props.groups[i]);
				for (let i in e.instance.props.rows) {
					let row = e.instance.props.rows[i];
					if (!row || row.type != "MEMBER") newRows[i] = row;
					else if (!row.user || !BDFDB.LibraryStores.RelationshipStore.isBlocked(row.user.id)) newRows[i] = row;
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
					for (let i in newGroups) if (newGroups[i].id != "content-inventory-feed") {
						newGroups[i].index = indexSum;
						if (newGroups[i].count > 0) indexSum += (newGroups[i].count + 1);
					}
					for (let i in newRows) if (newRows[i] && newRows[i].type == "GROUP" && newRows[i].count <= 0) newRows[i] = undefined;
					const removeEmptyWithin = (array, filter) => {
						let reversed = [].concat(array).reverse(), suffixLength = 0;
						for (let i in reversed) if (reversed[i] !== undefined) {
							suffixLength = parseInt(i);
							break;
						}
						return [].concat(array.filter(filter), new Array(suffixLength))
					};
					e.instance.props.rows = removeEmptyWithin(newRows, n => n);
					if (newGroups[0] && newGroups[0].id == "content-inventory-feed") newGroups[0].index = e.instance.props.rows.length - (newGroups[0].count + 1);
					e.instance.props.groups = removeEmptyWithin(newGroups, g => g && g.count > 0);
				}
			}
			
			processPrivateChannelRecipients (e) {
				if (this.settings.places.voiceChat && e.instance.props.channel && e.instance.props.channel.isGroupDM()) e.instance.props.channel = new BDFDB.DiscordObjects.Channel(Object.assign({}, e.instance.props.channel, {rawRecipients: e.instance.props.channel.rawRecipients.filter(n => !n || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.id)), recipients: e.instance.props.channel.recipients.filter(id => !id || !BDFDB.LibraryStores.RelationshipStore.isBlocked(id))}));
			}

			processNowPlayingItem (e) {
				if (!this.settings.places.activity) return;
				let [children, index] = BDFDB.ReactUtils.findParent(e.instance, {name: "NowPlayingHeader"});
				if (index > -1) for (let child of children) if (child && child.props && child.props.party) {
					child.props.party = Object.assign({}, child.props.party);
					if (child.props.party.priorityMembers) {
						child.props.party.priorityMembers = child.props.party.priorityMembers.filter(n => !n || !n.user || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.user.id));
						if (!child.props.party.priorityMembers.length) child.props.party.priorityMembers.push({user: new BDFDB.DiscordObjects.User({id: 0, username: ""})});
					}
					if (child.props.party.partiedMembers) child.props.party.partiedMembers = child.props.party.partiedMembers.filter(n => !n || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.id));
					if (child.props.party.voiceChannels) for (let i in child.props.party.voiceChannels) child.props.party.voiceChannels[i] = Object.assign({}, child.props.party.voiceChannels[i], {members: child.props.party.voiceChannels[i].members.filter(n => !n || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.id))});
				}
			}
			
			processChannelItem (e) {
				if (!this.settings.places.voiceList) return;
				let channelInfo = BDFDB.ReactUtils.findChild(e.instance.props.children, {props: [["className", BDFDB.disCN.channelinfo]]});
				if (channelInfo && channelInfo.props && channelInfo.props.children && channelInfo.props.children.props && BDFDB.ArrayUtils.is(channelInfo.props.children.props.voiceStates)) {
					let newVoiceStates = [].concat(channelInfo.props.children.props.voiceStates).filter(n => !n.user || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.user.id));
					if (channelInfo.props.children.props.channel.userLimit) channelInfo.props.children.props.channel = new BDFDB.DiscordObjects.Channel(Object.assign({}, channelInfo.props.children.props.channel, {userLimit: channelInfo.props.children.props.channel.userLimit - (channelInfo.props.children.props.voiceStates.length - newVoiceStates.length)}));
					channelInfo.props.children.props.voiceStates = newVoiceStates;
				}
			}
			
			processVoiceUser (e) {
				if (this.settings.places.voiceList && e.instance.props.user && BDFDB.LibraryStores.RelationshipStore.isBlocked(e.instance.props.user.id)) return null;
			}
		
			processVoiceUsers (e) {
				if (!this.settings.places.voiceList || !BDFDB.ArrayUtils.is(e.instance.props.voiceStates)) return;
				if (!e.returnvalue) {
					if (e.instance.props.children && e.instance.props.children.props && e.instance.props.children.props.numAudience) e.instance.props.children.props.numAudience = BDFDB.LibraryStores.StageChannelParticipantStore.getMutableParticipants(e.instance.props.channel.id).length;
					e.instance.props.voiceStates = [].concat(e.instance.props.voiceStates).filter(n => !n.user || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.user.id));
				}
				else {
					if (e.instance.props.children && e.instance.props.children.props && e.instance.props.children.props.numAudience === 0) return null;
				}
			}

			processRTCConnectionVoiceUsers (e) {
				if (!this.settings.places.voiceChat || !e.instance.props.voiceStates) return;
				e.instance.props.voiceStates = [].concat(e.instance.props.voiceStates).filter(n => !n.user || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.user.id));
			}

			processDirectMessage (e) {
				if (!this.settings.places.recentDms || !e.instance.props.channel) return;
				if (e.instance.props.channel.isGroupDM()) {
					if (!e.instance.props.channel.name) {
						let tooltip = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "ListItemTooltip"});
						if (tooltip) tooltip.props.text = this.getGroupName(e.instance.props.channel.id);
					}
				}
				else {
					if (BDFDB.LibraryStores.RelationshipStore.isBlocked(e.instance.props.channel.getRecipientId())) e.returnvalue = null;
				}
			}

			processPrivateChannel (e) {
				if (!this.settings.places.channelList || !e.instance.props.channel) return;
				if (e.instance.props.channel.isGroupDM()) {
					if (!e.returnvalue) {
						e.instance.props.channel = new BDFDB.DiscordObjects.Channel(Object.assign({}, e.instance.props.channel, {rawRecipients: e.instance.props.channel.rawRecipients.filter(n => !n || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.id)), recipients: e.instance.props.channel.recipients.filter(id => !id || !BDFDB.LibraryStores.RelationshipStore.isBlocked(id))}));
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
								}, "Error in Children Render of PrivateChannel!", this);
							}
							else wrapper.props.name = BDFDB.ReactUtils.createElement("span", {children: this.getGroupName(e.instance.props.channel.id)});
						}
					}
				}
				else {
					if (e.returnvalue && BDFDB.LibraryStores.RelationshipStore.isBlocked(e.instance.props.channel.getRecipientId())) e.returnvalue = null;
				}
			}
			
			processChannelCall (e) {
				if (!this.settings.places.voiceChat) return;
				if (BDFDB.ArrayUtils.is(e.instance.props.participants)) e.instance.props.participants = [].concat(e.instance.props.participants).filter(n => !n.user || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.user.id));
				if (BDFDB.ArrayUtils.is(e.instance.props.filteredParticipants)) e.instance.props.filteredParticipants = [].concat(e.instance.props.filteredParticipants).filter(n => !n.user || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.user.id));
			}

			processUserSummaryItem (e) {
				if (this.settings.places.memberList && BDFDB.ArrayUtils.is(e.instance.props.users)) e.instance.props.users = [].concat(e.instance.props.users).filter(n => !n || !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.id));
			}
			
			processRichUserMention (e) {
				if (e.instance.props.id && this.settings.places.mentions && BDFDB.LibraryStores.RelationshipStore.isBlocked(e.instance.props.id)) return BDFDB.ReactUtils.createElement("span", {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.mention, BDFDB.disCN.mentionwrapper, e.instance.props.className),
					children: ["@" + BDFDB.LanguageUtils.LanguageStrings.UNKNOWN_USER]
				});
			}
			
			processUserMention (e) {
				if (e.instance.props.userId && this.settings.places.mentions && BDFDB.LibraryStores.RelationshipStore.isBlocked(e.instance.props.userId)) {
					let childrenRender = e.returnvalue.props.children;
					e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let children = childrenRender(...args);
						if (children && children.props) children.props.children = "@" + BDFDB.LanguageUtils.LanguageStrings.UNKNOWN_USER;
						return children;
					}, "Error in Children Render of PrivateChannel!", this);
				}
			}
			
			processTabBar (e) {
				if (this.settings.general.hideBlocked && e.instance.props.children && e.instance.props.children.some(c => c && c.props && c.props.id == BDFDB.DiscordConstants.FriendsSections.ADD_FRIEND)) {
					e.instance.props.children = e.instance.props.children.filter(c => c && c.props.id != BDFDB.DiscordConstants.FriendsSections.BLOCKED);
				}
			}
			
			getGroupName (channelId) {
				let channel = BDFDB.LibraryStores.ChannelStore.getChannel(channelId);
				if (channel.name) return channel.name;
				let recipients = channel.recipients.map(BDFDB.LibraryStores.UserStore.getUser).filter(n => n && !BDFDB.LibraryStores.RelationshipStore.isBlocked(n.id));
				return recipients.length > 0 ? recipients.map(u => u.toString()).join(", ") : BDFDB.LanguageUtils.LanguageStrings.UNNAMED;
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
