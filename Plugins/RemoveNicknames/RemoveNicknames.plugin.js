/**
 * @name RemoveNicknames
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.4.4
 * @description Replaces Nicknames with Accountnames
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RemoveNicknames/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/RemoveNicknames/RemoveNicknames.plugin.js
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
		return class RemoveNicknames extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						replaceOwn:			{value: false, 			description: "Replaces your own Name"},
						replaceBots:		{value: true, 			description: "Replaces the Nickname of Bots"},
						removeGlobal:		{value: true, 			description: "Also removes global Displaynames"},
						addNickname:		{value: false, 			description: "Adds Nickname as Parentheses"},
						swapPositions:		{value: false, 			description: "Swaps the Position of Username and Nickname"},
					},
					places: {
						chat:				{value: true, 			description: "Messages"},
						mentions:			{value: true, 			description: "Mentions"},
						voiceChat:			{value: true, 			description: "Voice Channels"},
						memberList:			{value: true, 			description: "Member List"},
						typing:				{value: true, 			description: "Typing List"},
						autocompletes:		{value: true, 			description: "Autocomplete Menu"}
					}
				};
			
				this.modulePatches = {
					before: [
						"AutocompleteUserResult",
						"ChannelReply",
						"MemberListItem",
						"VoiceUser"
					],
					after: [
						"RichUserMention",
						"TypingUsers",
						"UserMention"
					]
				};
			}
			
			onStart () {
				let init = false;
				BDFDB.TimeUtils.timeout(_ => init = true, 3000);
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.UserNameUtils, "getName", {after: e => {
					if (!init) return;
					return this.getNewName(e.methodArguments[2], e.methodArguments[0]);
				}});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MessageAuthorUtils, ["getAuthor", "getMessageAuthor"], {after: e => {
					if (this.settings.places.chat && e.methodArguments[0] && e.methodArguments[0].author) {
						let newName = this.getNewName(e.methodArguments[0].author, (BDFDB.LibraryStores.ChannelStore.getChannel(e.methodArguments[0].channel_id) || {}).guild_id);
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
				BDFDB.DiscordUtils.rerenderAll();
			}

			processAutocompleteUserResult (e) {
				if (e.instance.props.user && (e.instance.props.nick || e.instance.props.user.globalName) && this.settings.places.autocompletes) {
					let newName = this.getNewName(e.instance.props.user);
					if (newName) e.instance.props.nick = newName;
				}
			}

			processVoiceUser (e) {
				if (e.instance.props.user && (e.instance.props.nick || e.instance.props.user.globalName) && this.settings.places.voiceChat) {
					let newName = this.getNewName(e.instance.props.user, e.instance.props.channel && e.instance.props.channel.guild_id);
					if (newName) e.instance.props.nick = newName;
				}
			}

			processTypingUsers (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.typingUsers) && Object.keys(e.instance.props.typingUsers).length && this.settings.places.typing) {
					let users = Object.keys(e.instance.props.typingUsers).filter(id => id != BDFDB.UserUtils.me.id).filter(id => !BDFDB.LibraryStores.RelationshipStore.isBlocked(id)).map(id => BDFDB.LibraryStores.UserStore.getUser(id)).filter(user => user);
					if (users.length) {
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.typingtext]]});
						if (index > -1 && BDFDB.ArrayUtils.is(children[index].props.children)) for (let child of children[index].props.children) if (child.type == "strong") {
							let newName = this.getNewName(users.shift());
							if (newName) child.props.children = newName;
						}
					}
				}
			}
			
			processUserMention (e) {
				if (e.instance.props.userId && this.settings.places.mentions) {
					let newName = this.getNewName(BDFDB.LibraryStores.UserStore.getUser(e.instance.props.userId), (BDFDB.LibraryStores.ChannelStore.getChannel(e.instance.props.channelId) || {}).guild_id);
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
					let newName = this.getNewName(BDFDB.LibraryStores.UserStore.getUser(e.instance.props.id), e.instance.props.guildId);
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
				const changeMentionName = (child, name) => {
					if (!child) return;
					if (BDFDB.ArrayUtils.is(child)) for (let i in child) {
						if (typeof child[i] == "string" && child[i][0] == "@") {
							if (child[i] == "@") child[parseInt(i) + 1] = newName;
							else child[i] = "@" + newName;
						}
						else changeMentionName(child[i]);
					}
					else if (child.props && typeof child.props.children == "string" && child.props.children[0] == "@") child.props.children = "@" + newName;
					else if (child.props && child.props.children) changeMentionName(child.props.children);
				};
				changeMentionName(mention);
			}

			processChannelReply (e) {
				if (e.instance.props.reply && e.instance.props.reply.message && this.settings.places.chat) {
					let newName = this.getNewName(e.instance.props.reply.message.author, e.instance.props.reply.channel && e.instance.props.reply.channel.guild_id);
					if (newName) e.instance.props.reply.message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.reply.message, {nick: newName}));
				}
			}

			processMemberListItem (e) {
				if (e.instance.props.user && (e.instance.props.nick || e.instance.props.user.globalName) && this.settings.places.memberList) {
					let newName = this.getNewName(e.instance.props.user, e.instance.props.channel.guild_id);
					if (newName) e.instance.props.nick = newName;
				}
			}

			getNewName (user, guildId = BDFDB.LibraryStores.SelectedGuildStore.getGuildId()) {
				if (!user) return null;
				let member = BDFDB.LibraryStores.GuildMemberStore.getMember(guildId, user.id) || {};
				let origUser = BDFDB.LibraryStores.UserStore.getUser(user.id) || {};
				let EUdata = BDFDB.BDUtils.getPlugin("EditUsers", true)?.getUserData(user, true, false, origUser);
				let nick = member && member.nick || this.settings.general.removeGlobal && user.globalName;
				if (!nick) return EUdata && (EUdata.globalName || EUdata.username) || user.globalName || user.username;
				let username = EUdata && (EUdata.globalName || EUdata.username) || user.username;
				if (user.id == BDFDB.UserUtils.me.id && !this.settings.general.replaceOwn || user.bot && !this.settings.general.replaceBots) return username != origUser.username ? username : (nick || username);
				return this.settings.general.addNickname ? (this.settings.general.swapPositions ? (nick + " (" + username + ")") : (username + " (" + nick + ")")) : username;
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
