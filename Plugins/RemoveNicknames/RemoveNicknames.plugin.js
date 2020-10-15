//META{"name":"RemoveNicknames","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RemoveNicknames","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RemoveNicknames/RemoveNicknames.plugin.js"}*//

module.exports = (_ => {
	const config = {
		"info": {
			"name": "RemoveNicknames",
			"author": "DevilBro",
			"version": "1.3.2",
			"description": "Replace all nicknames with the actual accountnames."
		},
		"changeLog": {
			"fixed": {
				"Mentions": "Now also works for mentions inside quotes"
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
		start() {this.load();}
		stop() {}
	} : (([Plugin, BDFDB]) => {
		var settings = {};
	
		return class RemoveNicknames extends Plugin {
			onLoad() {
				this.defaults = {
					settings: {
						replaceOwn:				{value:false, 	inner:false,	description:"Replace your own name:"},
						replaceBots:			{value:true, 	inner:false,	description:"Replace the nickname of bots:"},
						addNickname:			{value:false, 	inner:false,	description:"Add nickname as parentheses:"},
						swapPositions:			{value:false, 	inner:false,	description:"Swap the position of username and nickname:"},
						changeInChatWindow:		{value:true, 	inner:true,		description:"Messages"},
						changeInMentions:		{value:true, 	inner:true,		description:"Mentions"},
						changeInVoiceChat:		{value:true, 	inner:true,		description:"Voice Channels"},
						changeInMemberList:		{value:true, 	inner:true,		description:"Member List"},
						changeInTyping:			{value:true, 	inner:true,		description:"Typing List"},
						changeInAutoComplete:	{value:true, 	inner:true,		description:"Autocomplete Menu"}
					}
				};
			
				this.patchedModules = {
					before: {
						AutocompleteUserResult: "render",
						VoiceUser: "render",
						MemberListItem: "render",
						Message: "default",
						MessageContent: "type",
					},
					after: {
						TypingUsers: "render",
						Mention: "default"
					}
				};
			}
			
			onStart() {
				this.forceUpdateAll();
			}
			
			onStop() {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [], innerItems = [];
				
				for (let key in settings) (!this.defaults.settings[key].inner ? settingsItems : innerItems).push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}));
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
					title: "Remove Nicknames in:",
					first: settingsItems.length == 0,
					last: true,
					children: innerItems
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed (e) {
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

			processAutocompleteUserResult (e) {
				if (e.instance.props.user && e.instance.props.nick && settings.changeInAutoComplete) {
					let newName = this.getNewName(e.instance.props.user);
					if (newName) e.instance.props.nick = newName;
				}
			}

			processVoiceUser (e) {
				if (e.instance.props.user && e.instance.props.nick && settings.changeInVoiceChat) {
					let newName = this.getNewName(e.instance.props.user);
					if (newName) e.instance.props.nick = newName;
				}
			}

			processMemberListItem (e) {
				if (e.instance.props.user && e.instance.props.nick && settings.changeInMemberList) {
					let newName = this.getNewName(e.instance.props.user);
					if (newName) e.instance.props.nick = newName;
				}
			}

			processTypingUsers (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.typingUsers) && Object.keys(e.instance.props.typingUsers).length && settings.changeInTyping) {
					let users = Object.keys(e.instance.props.typingUsers).filter(id => id != BDFDB.UserUtils.me.id).filter(id => !BDFDB.LibraryModules.FriendUtils.isBlocked(id)).map(id => BDFDB.LibraryModules.UserStore.getUser(id)).filter(user => user);
					if (users.length) {
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.typingtext]]});
						if (index > -1 && BDFDB.ArrayUtils.is(children[index].props.children)) for (let child of children[index].props.children) if (child.type == "strong") {
							let newName = this.getNewName(users.shift());
							if (newName) BDFDB.ReactUtils.setChild(child, newName);
						}
					}
				}
			}

			processMessage (e) {
				let header = e.instance.props.childrenHeader;
				if (header && header.props && header.props.message && header.props.message.nick) {
					let newName = this.getNewName(header.props.message.author);
					if (newName) header.props.message = new BDFDB.DiscordObjects.Message(Object.assign({}, header.props.message, {nick: newName}));
				}
			}
			
			processMessageContent (e) {
				if (e.instance.props.message.type != BDFDB.DiscordConstants.MessageTypes.DEFAULT && e.instance.props.message.nick && settings.changeInChatWindow) {
					let newName = this.getNewName(e.instance.props.message.author);
					if (newName) {
						e.instance.props.message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.message, {nick: newName}));
						e.instance.props.children.props.message = e.instance.props.message;
					}
				}
			}
			
			processMention (e) {
				if (e.instance.props.userId && settings.changeInMentions) {
					let newName = this.getNewName(BDFDB.LibraryModules.UserStore.getUser(e.instance.props.userId));
					if (newName) e.returnvalue.props.children[0] = "@" + newName;
				}
			}

			getNewName (user, wrapper) {
				if (!user) return null;
				let member = BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), user.id) || {};
				if (!member.nick || user.id == BDFDB.UserUtils.me.id && !settings.replaceOwn || user.bot && !settings.replaceBots) return null;
				let username = (BDFDB.BDUtils.isPluginEnabled("EditUsers") && BDFDB.DataUtils.load("EditUsers", "users", user.id) || {}).name || user.username;
				return settings.addNickname ? (settings.swapPositions ? (member.nick + " (" + username + ")") : (username + " (" + member.nick + ")")) : username;
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();