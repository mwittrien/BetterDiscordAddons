//META{"name":"RemoveBlockedMessages","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RemoveBlockedMessages","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RemoveBlockedMessages/RemoveBlockedMessages.plugin.js"}*//

module.exports = (_ => {
    const config = {
		"info": {
			"name": "RemoveBlockedMessages",
			"author": "DevilBro",
			"version": "1.0.5",
			"description": "Completely removes blocked messages."
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
					onConfirm: _ => {delete window.BDFDB_Global.downloadModal;require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (error, response, body) => {require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), body, _ => {});});}
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