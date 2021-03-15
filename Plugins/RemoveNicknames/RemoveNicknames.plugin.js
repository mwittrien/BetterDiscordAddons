/**
 * @name RemoveNicknames
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.3.8
 * @description Replaces Nicknames with Accountnames
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RemoveNicknames/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/RemoveNicknames/RemoveNicknames.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "RemoveNicknames",
			"author": "DevilBro",
			"version": "1.3.8",
			"description": "Replaces Nicknames with Accountnames"
		},
		"changeLog": {
			"fixed": {
				"Mentions": ""
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
		var settings = {};
	
		return class RemoveNicknames extends Plugin {
			onLoad () {
				this.defaults = {
					settings: {
						replaceOwn:				{value: false, 	inner: false,		description: "Replace your own Name"},
						replaceBots:			{value: true, 	inner: false,		description: "Replace the Nickname of Bots"},
						addNickname:			{value: false, 	inner: false,		description: "Add Nickname as Parentheses"},
						swapPositions:			{value: false, 	inner: false,		description: "Swap the Position of Username and Nickname"},
						changeInChatWindow:		{value: true, 	inner: true,		description: "Messages"},
						changeInReactions:		{value: true, 	inner: true,		description: "Reactions"},
						changeInMentions:		{value: true, 	inner: true,		description: "Mentions"},
						changeInVoiceChat:		{value: true, 	inner: true,		description: "Voice Channels"},
						changeInMemberList:		{value: true, 	inner: true,		description: "Member List"},
						changeInTyping:			{value: true, 	inner: true,		description: "Typing List"},
						changeInAutoComplete:	{value: true, 	inner: true,		description: "Autocomplete Menu"}
					}
				};
			
				this.patchedModules = {
					before: {
						AutocompleteUserResult: "render",
						VoiceUser: "render",
						ChannelReply: "default",
						MemberListItem: "render"
					},
					after: {
						TypingUsers: "render",
						Reaction: "render",
						UserMention: "default",
						RichUserMention: "UserMention"
					}
				};
			}
			
			onStart () {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MessageAuthorUtils, ["default", "getMessageAuthor"], {after: e => {
					if (settings.changeInChatWindow && e.methodArguments[0] && e.methodArguments[0].author) {
						let newName = this.getNewName(e.methodArguments[0].author);
						if (newName) e.returnValue.nick = newName;
					}
				}});
				
				this.forceUpdateAll();
			}
			
			onStop () {
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
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
					title: "Remove Nicknames in:",
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

			processTypingUsers (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.typingUsers) && Object.keys(e.instance.props.typingUsers).length && settings.changeInTyping) {
					let users = Object.keys(e.instance.props.typingUsers).filter(id => id != BDFDB.UserUtils.me.id).filter(id => !BDFDB.LibraryModules.RelationshipStore.isBlocked(id)).map(id => BDFDB.LibraryModules.UserStore.getUser(id)).filter(user => user);
					if (users.length) {
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.typingtext]]});
						if (index > -1 && BDFDB.ArrayUtils.is(children[index].props.children)) for (let child of children[index].props.children) if (child.type == "strong") {
							let newName = this.getNewName(users.shift());
							if (newName) BDFDB.ReactUtils.setChild(child, newName);
						}
					}
				}
			}
			
			processReaction (e) {
				if (e.instance.props.reactions) {
					let channel = BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id);
					let guildId = null == channel || channel.isPrivate() ? null : channel.getGuildId();
					let users = e.instance.props.reactions.filter(user => !BDFDB.LibraryModules.RelationshipStore.isBlocked(user.id)).slice(0, 3).map(user => this.getNewName(user) || guildId && BDFDB.LibraryModules.MemberStore.getNick(guildId, user.id) || user.username).filter(user => user);
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
				else BDFDB.LibraryModules.ReactionUtils.getReactions(e.instance.props.message.channel_id, e.instance.props.message.id, e.instance.props.emoji).then(reactions => {
					e.instance.props.reactions = reactions;
					BDFDB.ReactUtils.forceUpdate(e.instance);
				});
			}
			
			processUserMention (e) {
				if (e.instance.props.userId && settings.changeInMentions) {
					let mention = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "Mention"});
					let newName = mention && this.getNewName(BDFDB.LibraryModules.UserStore.getUser(e.instance.props.userId));
					if (newName) mention.props.children = "@" + newName;
				}
			}
			
			processRichUserMention (e) {
				if (e.instance.props.id && settings.changeInMentions && typeof e.returnvalue.props.children == "function") {
					let newName = this.getNewName(BDFDB.LibraryModules.UserStore.getUser(e.instance.props.id));
					if (newName) {
						let renderChildren = e.returnvalue.props.children;
						e.returnvalue.props.children = (...args) => {
							let children = renderChildren(...args);
							children.props.children = "@" + newName;
							return children;
						};
					}
				}
			}

			processChannelReply (e) {
				if (e.instance.props.reply && e.instance.props.reply.message && settings.changeInChatWindow) {
					let newName = this.getNewName(e.instance.props.reply.message.author);
					if (newName) e.instance.props.reply.message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.reply.message, {nick: newName}));
				}
			}

			processMemberListItem (e) {
				if (e.instance.props.user && e.instance.props.nick && settings.changeInMemberList) {
					let newName = this.getNewName(e.instance.props.user);
					if (newName) e.instance.props.nick = newName;
				}
			}

			getNewName (user) {
				if (!user) return null;
				let member = BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), user.id) || {};
				let origUser = BDFDB.LibraryModules.UserStore.getUser(user.id) || {};
				let EditUsers = BDFDB.BDUtils.getPlugin("EditUsers", true);
				let username = EditUsers && EditUsers.getUserData(user, true, false, origUser).username || user.username;
				if (!member.nick || user.id == BDFDB.UserUtils.me.id && !settings.replaceOwn || user.bot && !settings.replaceBots) return username != origUser.username ? username : (member.nick || username);
				return settings.addNickname ? (settings.swapPositions ? (member.nick + " (" + username + ")") : (username + " (" + member.nick + ")")) : username;
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
