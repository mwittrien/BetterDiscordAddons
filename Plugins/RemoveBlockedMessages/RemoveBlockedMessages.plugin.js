//META{"name":"RemoveBlockedMessages","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RemoveBlockedMessages","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RemoveBlockedMessages/RemoveBlockedMessages.plugin.js"}*//

module.exports = (_ => {
    const config = {
		"info": {
			"name": "RemoveBlockedMessages",
			"author": "DevilBro",
			"version": "1.0.6",
			"description": "Completely removes blocked messages."
		},
		"changeLog": {
			"improved": {
				"Unread Markers": "No longer marks channels and servers that only contain unread blocked messages as unread"
			},
			"fixed": {
				"Date Deviders": "No longer shows date deviders of blocked messages"
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
							if (!e && b && b.indexOf(`//META{"name":"`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
        }
        start() {}
        stop() {}
    } : (([Plugin, BDFDB]) => {
        return class RemoveBlockedMessages extends Plugin {
			onLoad() {
				this.patchedModules = {
					after: {
						Messages: "type"
					}
				};
			}
			
			onStart() {
				BDFDB.MessageUtils.rerenderAll();
				
				/* PATCH GUILD UNREAD */
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.UnreadChannelUtils, "hasUnread", {after: e => {
					if (e.returnValue) {
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
					if (e.returnValue && e.methodArguments[0] == "377831025201512448") {
						return BDFDB.LibraryModules.GuildChannelStore.getChannels(e.methodArguments[0]).SELECTABLE.map(n => n.channel && n.channel.id).filter(n => n && n != "null").some(BDFDB.LibraryModules.UnreadChannelUtils.hasUnread);
					}
				}});
			}
			
			onStop() {
				BDFDB.MessageUtils.rerenderAll();
			}
		
			processMessages (e) {
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
					messagesIns.props.messages._array = [].concat(messagesIns.props.messages._array.filter(n => n.author && !BDFDB.LibraryModules.FriendUtils.isBlocked(n.author.id)));
					if (messagesIns.props.oldestUnreadMessageId && messagesIns.props.messages._array.every(n => n.id != messagesIns.props.oldestUnreadMessageId)) messagesIns.props.oldestUnreadMessageId = null;
				}
			}
		};
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();