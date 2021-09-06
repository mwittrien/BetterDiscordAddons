/**
 * @name RemoveNicknames
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.4.0
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
			"version": "1.4.0",
			"description": "Replaces Nicknames with Accountnames"
		},
		"changeLog": {
			"fixed": {
				"Mentions": ""
			}
		}
	};

	return (window.Lightcord && !Node.prototype.isPrototypeOf(window.Lightcord) || window.LightCord && !Node.prototype.isPrototypeOf(window.LightCord) || window.Astra && !Node.prototype.isPrototypeOf(window.Astra)) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return "Do not use LightCord!";}
		load () {BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)");}
		start() {}
		stop() {}
	} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
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
		return class RemoveNicknames extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						replaceOwn:			{value: false, 			description: "Replace your own Name"},
						replaceBots:		{value: true, 			description: "Replace the Nickname of Bots"},
						addNickname:		{value: false, 			description: "Add Nickname as Parentheses"},
						swapPositions:		{value: false, 			description: "Swap the Position of Username and Nickname"},
					},
					places: {
						chat:				{value: true, 			description: "Messages"},
						reactions:			{value: true, 			description: "Reactions"},
						mentions:			{value: true, 			description: "Mentions"},
						voiceChat:			{value: true, 			description: "Voice Channels"},
						memberList:			{value: true, 			description: "Member List"},
						typing:				{value: true, 			description: "Typing List"},
						autocompletes:		{value: true, 			description: "Autocomplete Menu"}
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
					if (this.settings.places.chat && e.methodArguments[0] && e.methodArguments[0].author) {
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
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						settingsItems.push(Object.keys(this.defaults.general).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["general", key],
							label: this.defaults.general[key].description,
							value: this.settings.general[key]
						})));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Remove Nicknames in:",
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

			onSettingsClosed (e) {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			processAutocompleteUserResult (e) {
				if (e.instance.props.user && e.instance.props.nick && this.settings.places.autocompletes) {
					let newName = this.getNewName(e.instance.props.user);
					if (newName) e.instance.props.nick = newName;
				}
			}

			processVoiceUser (e) {
				if (e.instance.props.user && e.instance.props.nick && this.settings.places.voiceChat) {
					let newName = this.getNewName(e.instance.props.user);
					if (newName) e.instance.props.nick = newName;
				}
			}

			processTypingUsers (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.typingUsers) && Object.keys(e.instance.props.typingUsers).length && this.settings.places.typing) {
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
				if (e.instance.props.userId && this.settings.places.mentions) {
					let newName = this.getNewName(BDFDB.LibraryModules.UserStore.getUser(e.instance.props.userId));
					if (!newName) return;
					if (typeof e.returnvalue.props.children == "function") {
						let renderChildren = e.returnvalue.props.children;
						e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
							let children = renderChildren(...args);
							this.changeMention(BDFDB.ReactUtils.findChild(children, {name: "Mention"}), newName);
							return children;
						}, "", this);
					}
					else this.changeMention(BDFDB.ReactUtils.findChild(e.returnvalue, {name: "Mention"}), newName);
				}
			}
			
			processRichUserMention (e) {
				if (e.instance.props.id && this.settings.places.mentions && typeof e.returnvalue.props.children == "function") {
					let newName = this.getNewName(BDFDB.LibraryModules.UserStore.getUser(e.instance.props.id));
					if (newName) {
						let renderChildren = e.returnvalue.props.children;
						e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
							let children = renderChildren(...args);
							this.changeMention(children, newName);
							return children;
						}, "", this);
					}
				}
			}
			
			changeMention (mention, newName) {
				if (!mention) return;
				mention.props.children = "@" + newName;
			}

			processChannelReply (e) {
				if (e.instance.props.reply && e.instance.props.reply.message && this.settings.places.chat) {
					let newName = this.getNewName(e.instance.props.reply.message.author);
					if (newName) e.instance.props.reply.message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.reply.message, {nick: newName}));
				}
			}

			processMemberListItem (e) {
				if (e.instance.props.user && e.instance.props.nick && this.settings.places.memberList) {
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
				if (!member.nick || user.id == BDFDB.UserUtils.me.id && !this.settings.general.replaceOwn || user.bot && !this.settings.general.replaceBots) return username != origUser.username ? username : (member.nick || username);
				return this.settings.general.addNickname ? (this.settings.general.swapPositions ? (member.nick + " (" + username + ")") : (username + " (" + member.nick + ")")) : username;
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
