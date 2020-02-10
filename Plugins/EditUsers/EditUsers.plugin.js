//META{"name":"EditUsers","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditUsers","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EditUsers/EditUsers.plugin.js"}*//

var EditUsers = (_ => {
	return class EditUsers {
		getName () {return "EditUsers";}

		getVersion () {return "3.7.5";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Allows you to change the icon, name, tag and color of users.";}

		constructor () {
			this.changelog = {
				"added":[["Message Color","You can now set unique message colors for users"]],
				"fixed":[["Colored Text","Changing a User Color will now properly change the message color if Colored Text is enabled"],["Message Update","Fixed the plugin for the new Message Update"]],
				"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
			};

			this.patchedModules = {
				before: {
					HeaderBarContainer: "render",
					ChannelEditorContainer: "render",
					ChannelAutoComplete: "render",
					AutocompleteUserResult: "render",
					UserPopout: "render",
					UserProfile: "render",
					UserInfo: "default",
					NowPlayingHeader: "Header",
					VoiceUser: "render",
					Account: "render",
					Message: "default",
					MessageContent: "type",
					MemberListItem: "render",
					AuditLog: "render",
					GuildSettingsEmoji: "render",
					MemberCard: "render",
					SettingsInvites: "render",
					GuildSettingsBans: "render",
					InvitationCard: "render",
					PrivateChannelRecipientsInvitePopout: "render",
					QuickSwitchUserResult: "render",
					SearchPopoutComponent: "render",
					IncomingCall: "render",
					PrivateChannelCallParticipants: "render",
					VideoTile: "render"
				},
				after: {
					AutocompleteUserResult: "render",
					NameTag: "default",
					UserPopout: "render",
					NowPlayingHeader: "Header",
					VoiceUser: "render",
					Account: "render",
					MessageHeader: "default",
					MessageContent: "type",
					MemberListItem: "render",
					Mention: "default",
					UserHook: "render",
					InvitationCard: "render",
					InviteModalUserRow: "default",
					TypingUsers: "render",
					DirectMessage: "render",
					PrivateChannel: "render",
					QuickSwitchUserResult: "render",
					IncomingCall: "render"
				}
			};
		}

		initConstructor () {
			this.css = `
				${BDFDB.dotCN.messageusername}:hover > span[style*="color"] {
					text-decoration: underline;
				}
				${BDFDB.dotCN.dmchannel}:hover ${BDFDB.dotCN.namecontainername} span[style*="color"] {
					filter: brightness(150%);
				}
				${BDFDB.dotCNS.userpopoutheadernamewrapper + BDFDB.dotCN.bottag} {
					position: relative;
					bottom: 1px;
				}
				${BDFDB.dotCNS.dmchannel + BDFDB.dotCN.bottag} {
					margin-left: 4px;
					position: relative;
					bottom: 3px;
				}
				${BDFDB.dotCNS.userinfo + BDFDB.dotCN.userinfodiscriminator} {
					display: none;
				}
				${BDFDB.dotCNS.userinfohovered + BDFDB.dotCN.userinfodiscriminator} {
					display: block;
				}
			`;
			
			this.defaults = {
				settings: {
					changeInChatTextarea:	{value:true, 	inner:true,		description:"Chat Textarea"},
					changeInChatWindow:		{value:true, 	inner:true,		description:"Messages"},
					changeInMentions:		{value:true, 	inner:true,		description:"Mentions"},
					changeInVoiceChat:		{value:true, 	inner:true,		description:"Voice Channels"},
					changeInMemberList:		{value:true, 	inner:true,		description:"Member List"},
					changeInRecentDms:		{value:true, 	inner:true,		description:"Direct Message Notifications"},
					changeInDmsList:		{value:true, 	inner:true,		description:"Direct Message List"},
					changeInDmHeader:		{value:true, 	inner:true,		description:"Direct Message Header"},
					changeInDmCalls:		{value:true, 	inner:true,		description:"Calls/ScreenShares"},
					changeInTyping:			{value:true, 	inner:true,		description:"Typing List"},
					changeInFriendList:		{value:true, 	inner:true,		description:"Friend List"},
					changeInInviteList:		{value:true, 	inner:true,		description:"Invite List"},
					changeInActivity:		{value:true, 	inner:true,		description:"Activity Page"},
					changeInUserPopout:		{value:true, 	inner:true,		description:"User Popouts"},
					changeInUserProfile:	{value:true, 	inner:true,		description:"User Profile Modal"},
					changeInAutoComplete:	{value:true, 	inner:true,		description:"Autocomplete Menu"},
					changeInAuditLog:		{value:true, 	inner:true,		description:"Audit Log"},
					changeInEmojiLog:		{value:true, 	inner:true,		description:"Emoji Upload Log"},
					changeInMemberLog:		{value:true, 	inner:true,		description:"Member Log"},
					changeInQuickSwitcher:	{value:true, 	inner:true,		description:"Quick Switcher"},
					changeInSearchPopout:	{value:true, 	inner:true,		description:"Search Popout"},
					changeInUserAccount:	{value:true, 	inner:true,		description:"Your Account Information"},
					changeInAppTitle:		{value:true, 	inner:true,		description:"Discord App Title (DMs)"}
				}
			};
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let settingspanel, settingsitems = [], inneritems = [];
			
			for (let key in settings) (!this.defaults.settings[key].inner ? settingsitems : inneritems).push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
			}));
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
				title: "Change Users in:",
				first: settingsitems.length == 0,
				children: inneritems
			}));
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
				type: "Button",
				className: BDFDB.disCN.marginbottom8,
				color: BDFDB.LibraryComponents.Button.Colors.RED,
				label: "Reset all Users",
				onClick: _ => {
					BDFDB.ModalUtils.confirm(this, "Are you sure you want to reset all users?", _ => {
						BDFDB.DataUtils.remove(this, "users");
						this.forceUpdateAll();
					});
				},
				children: BDFDB.LanguageUtils.LanguageStrings.RESET
			}));
			
			return settingspanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
		}

		//legacy
		load () {}

		start () {
			if (!window.BDFDB) window.BDFDB = {myPlugins:{}};
			if (window.BDFDB && window.BDFDB.myPlugins && typeof window.BDFDB.myPlugins == "object") window.BDFDB.myPlugins[this.getName()] = this;
			let libraryScript = document.querySelector("head script#BDFDBLibraryScript");
			if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("id", "BDFDBLibraryScript");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", _ => {this.initialize();});
				document.head.appendChild(libraryScript);
			}
			else if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(_ => {
				try {return this.initialize();}
				catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
			}, 30000);
		}

		initialize () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				if (this.started) return;
				BDFDB.PluginUtils.init(this);

				let observer = new MutationObserver(_ => {this.changeAppTitle();});
				BDFDB.ObserverUtils.connect(this, document.head.querySelector("title"), {name:"appTitleObserver", instance:observer}, {childList:true});
				
				let searchGroupData = BDFDB.ReactUtils.getValue(BDFDB.ModuleUtils.findByName("SearchPopoutComponent", false), "exports.GroupData");
				if (BDFDB.ObjectUtils.is(searchGroupData)) {
					BDFDB.ModuleUtils.patch(this, searchGroupData.FILTER_FROM, "component", {after: e => {
						if (typeof e.returnValue.props.renderResult == "function") {
							let renderResult = e.returnValue.props.renderResult;
							e.returnValue.props.renderResult = (...args) => {
								let result = renderResult(...args);
								this.processSearchPopoutUserResult({instance: {props: e.methodArguments[0]}, returnvalue: result});
								return result;
							}
						}
					}});
					BDFDB.ModuleUtils.patch(this, searchGroupData.FILTER_MENTIONS, "component", {after: e => {
						if (typeof e.returnValue.props.renderResult == "function") {
							let renderResult = e.returnValue.props.renderResult;
							e.returnValue.props.renderResult = (...args) => {
								let result = renderResult(...args);
								this.processSearchPopoutUserResult({instance: {props: e.methodArguments[0]}, returnvalue: result});
								return result;
							}
						}
					}});
				}
				
				this.forceUpdateAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}


		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;
				
				this.forceUpdateAll();

				BDFDB.PluginUtils.clear(this);
			}
		}


		// begin of own functions
		
		onUserContextMenu (e) {
			if (e.instance.props.user) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]});
				children.splice(index > -1 ? index : children.length, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Group, {
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Sub, {
							label: this.labels.context_localusersettings_text,
							render: [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Group, {
								children: [
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
										label: this.labels.submenu_usersettings_text,
										action: _ => {
											BDFDB.ContextMenuUtils.close(e.instance);
											this.showUserSettings(e.instance.props.user);
										}
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
										label: this.labels.submenu_resetsettings_text,
										disabled: !BDFDB.DataUtils.load(this, "users", e.instance.props.user.id),
										action: _ => {
											BDFDB.ContextMenuUtils.close(e.instance);
											BDFDB.DataUtils.remove(this, "users", e.instance.props.user.id);
											this.forceUpdateAll();
										}
									})
								]
							})]
						})
					]
				}));
			}
		}

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
		}
		
		processChannelEditorContainer (e) {
			if (!e.instance.props.disabled && e.instance.props.channel && e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && e.instance.props.type == BDFDB.DiscordConstants.TextareaTypes.NORMAL && BDFDB.DataUtils.get(this, "settings", "changeInChatTextarea")) {
				let user = BDFDB.LibraryModules.UserStore.getUser(e.instance.props.channel.recipients[0]);
				if (user) {
					let data = BDFDB.DataUtils.load(this, "users", user.id);
					e.instance.props.placeholder = BDFDB.LanguageUtils.LanguageStringsFormat("TEXTAREA_PLACEHOLDER", `@${data && data.name || user.username}`);
				}
			}
		}

		processChannelAutoComplete (e) {
			if (e.instance.state.autocompleteType == "MENTIONS" && BDFDB.ArrayUtils.is(e.instance.state.autocompletes.users) && e.instance.props.channel) {
				let lastword = (e.instance.props.textValue || "").slice(1).toLowerCase();
				let users = BDFDB.DataUtils.load(this, "users");
				if (!users || !lastword) return;
				let userarray = [];
				for (let id in users) if (users[id] && users[id].name) {
					let user = BDFDB.LibraryModules.UserStore.getUser(id);
					if (user && (e.instance.props.channel.recipients.includes(id) || (e.instance.props.channel.guild_id && BDFDB.LibraryModules.MemberStore.getMember(e.instance.props.channel.guild_id, id)))) userarray.push(Object.assign({
						lowercasename: users[id].name.toLowerCase(),
						user
					}, users[id]));
				}
				userarray = BDFDB.ArrayUtils.keySort(userarray.filter(n => e.instance.state.autocompletes.users.every(comp => comp.user.id != n.user.id) && n.lowercasename.indexOf(lastword) != -1), "lowercasename");
				e.instance.state.autocompletes.users = [].concat(e.instance.state.autocompletes.users, userarray.map(n => {return {user: n.user};})).slice(0, BDFDB.DiscordConstants.MAX_AUTOCOMPLETE_RESULTS);
			}
		}

		processAutocompleteUserResult (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "changeInAutoComplete")) {
				if (!e.returnvalue) {
					e.instance.props.user = this.getUserData(e.instance.props.user.id);
					let data = BDFDB.DataUtils.load(this, "users", e.instance.props.user.id);
					if (data && data.name) e.instance.props.nick = data.name;
				}
				else {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props:[["className", BDFDB.disCN.marginleft8]]});
					if (index > -1) this.changeUserColor(children[index], e.instance.props.user.id);
				}
			}
		}

		processHeaderBarContainer (e) {
			let channel = BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.channelId);
			if (channel && channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && BDFDB.DataUtils.get(this, "settings", "changeInDmHeader")) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.instance, {name: "Title"});
				if (index > -1) {
					let recipientId = channel.getRecipientId();
					children[index].props.children = this.getUserData(recipientId).username;
					this.changeUserColor(children[index], recipientId);
				}
			}
		}
		
		processNameTag (e) {
			if (e.instance.props.user && e.instance.props.className) {
				let change = false, guildId = null, options = {changeBackground: false}, botClass = "";
				switch (e.instance.props.className) {
					case BDFDB.disCN.userpopoutheadertagnonickname:
						change = BDFDB.DataUtils.get(this, "settings", "changeInUserPopout");
						guildId = BDFDB.LibraryModules.LastGuildStore.getGuildId();
						options.changeBackground = true;
						botClass = BDFDB.disCN.bottagnametag;
						break;
					case BDFDB.disCN.userprofilenametag:
						change = BDFDB.DataUtils.get(this, "settings", "changeInUserProfile");
						guildId = BDFDB.LibraryModules.LastGuildStore.getGuildId();
						options.changeBackground = true;
						botClass = BDFDB.disCNS.userprofilebottag + BDFDB.disCN.bottagnametag;
						break;
					case BDFDB.disCN.guildsettingsinviteusername:
						change = BDFDB.DataUtils.get(this, "settings", "changeInMemberLog");
						break;
					case BDFDB.disCN.userinfodiscordtag:
						change = BDFDB.DataUtils.get(this, "settings", "changeInFriendList");
						botClass = BDFDB.disCN.bottagnametag;
						break;
				}
				if (change) {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props:[["className", BDFDB.disCN.username]]});
					if (index > -1) this.changeUserColor(children[index], e.instance.props.user.id, options);
					if (botClass) this.injectBadge(e.returnvalue.props.children, e.instance.props.user.id, guildId, 2, botClass, e.instance.props.invertBotTagColor);
				}
			}
		}

		processUserPopout (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "changeInUserPopout")) {
				let data = BDFDB.DataUtils.load(this, "users", e.instance.props.user.id);
				if (!e.returnvalue) {
					e.instance.props.user = this.getUserData(e.instance.props.user.id, true, true);
					if (data && data.name) {
						e.instance.props.nickname = data.name;
						e.instance.props.guildMember = Object.assign({}, e.instance.props.guildMember, {nick: data.name});
					}
				}
				else {
					if (data && (data.color1 || data.color2 || data.tag)) {
						let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["className", BDFDB.disCN.userpopoutheadernickname]]});
						if (index > -1) {
							this.changeUserColor(children[index], e.instance.props.user.id, {changeBackground:true});
							this.injectBadge(children, e.instance.props.user.id, BDFDB.LibraryModules.LastGuildStore.getGuildId(), 2, BDFDB.disCN.bottagnametag, !!e.instance.props.activity);
						}
					}
				}
			}
		}

		processUserProfile (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "changeInUserProfile")) e.instance.props.user = this.getUserData(e.instance.props.user.id);
		}

		processUserInfo (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "changeInFriendList")) e.instance.props.user = this.getUserData(e.instance.props.user.id);
		}

		processNowPlayingHeader (e) {
			if (BDFDB.ObjectUtils.is(e.instance.props.priorityUser) && e.instance.props.priorityUser.user && BDFDB.DataUtils.get(this, "settings", "changeInFriendList")) {
				if (!e.returnvalue) {
					let titleIsName = e.instance.props.priorityUser.user.username == e.instance.props.title;
					e.instance.props.priorityUser.user = this.getUserData(e.instance.props.priorityUser.user.id);
					if (titleIsName) e.instance.props.title = e.instance.props.priorityUser.user.username;
				}
				else {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "Header"});
					if (index > -1) this.changeUserColor(children[index], e.instance.props.priorityUser.user.id);
				}
			}
		}

		processVoiceUser (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "changeInVoiceChat")) {
				if (!e.returnvalue) {
					e.instance.props.user = this.getUserData(e.instance.props.user.id);
					let data = BDFDB.DataUtils.load(this, "users", e.instance.props.user.id);
					if (data && data.name) e.instance.props.nick = data.name;
				}
				else {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["className", BDFDB.disCN.voicename]]});
					if (index > -1) this.changeUserColor(children[index], e.instance.props.user.id, {modify: e.instance.props});
				}
			}
		}

		processAccount (e) {
			if (e.instance.props.currentUser && BDFDB.DataUtils.get(this, "settings", "changeInUserAccount")) {
				if (!e.returnvalue) e.instance.props.currentUser = this.getUserData(e.instance.props.currentUser.id);
				else {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "Tooltip"});
					if (index > -1) {
						if (typeof children[index].props.children == "function") {
							let data = BDFDB.DataUtils.load(this, "users", e.instance.props.currentUser.id);
							if (data && (data.color1 || data.color2)) {
								let renderChildren = children[index].props.children;
								children[index].props.children = (...args) => {
									let renderedChildren = renderChildren(...args);
									let [children2, index2] = BDFDB.ReactUtils.findChildren(renderedChildren, {name: "PanelTitle"});
									if (index2 > -1) this.changeUserColor(children2[index2], e.instance.props.currentUser.id);
									return renderedChildren;
								}
							}
						}
					}
				}
			}
		}

		processMessage (e) {
			let header = e.instance.props.childrenHeader;
			if (header && header.props && header.props.message) {
				let data = BDFDB.DataUtils.load(this, "users", header.props.message.author.id);
				if (data) {
					let message = new BDFDB.DiscordObjects.Message(Object.assign({}, header.props.message, {author: this.getUserData(header.props.message.author.id)}));
					if (data.name) message.nick = data.name;
					if (data.color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data.color1) ? data.color1[0] : data.color1, "HEX");
					header.props.message = message;
				}
			}
			let content = e.instance.props.childrenMessageContent;
			if (content && content.type && content.type.type) {
				let data = BDFDB.DataUtils.load(this, "users", content.props.message.author.id);
				let messageColor = data && (data.color5 || (BDFDB.BDUtils.getSettings("bda-gs-7") && data.color1));
				if (messageColor) {
					let message = new BDFDB.DiscordObjects.Message(Object.assign({}, content.props.message, {author: this.getUserData(content.props.message.author.id)}));
					if (data.name) message.nick = data.name;
					message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(messageColor) ? messageColor[0] : messageColor, "HEX");
					content.props.message = message;
				}
			}
		}
		
		processMessageHeader (e) {
			if (e.instance.props.message && BDFDB.DataUtils.get(this, "settings", "changeInChatWindow")) {
				let data = BDFDB.DataUtils.load(this, "users", e.instance.props.message.author.id);
				if (data && (data.color1 || data.color2)) {
					let usernamePopout = BDFDB.ReactUtils.getValue(e, "returnvalue.props.children.2.props.children.1")
					if (usernamePopout && usernamePopout.props && typeof usernamePopout.props.children == "function") {
						let renderChildren = usernamePopout.props.children;
						usernamePopout.props.children = (...args) => {
							let renderedChildren = renderChildren(...args);
							this.changeUserColor(renderedChildren, e.instance.props.message.author.id);
							return renderedChildren;
						}
					}
				}
				this.injectBadge(e.returnvalue.props.children[2].props.children, e.instance.props.message.author.id, (BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, 2, e.instance.props.compact ? BDFDB.disCN.messagebottagcompact : BDFDB.disCN.messagebottagcozy);
			}
		}
		
		processMessageContent (e) {
			if (e.instance.props.message && BDFDB.DataUtils.get(this, "settings", "changeInChatWindow")) {
				if (!e.returnvalue) {
					if (e.instance.props.message.type != BDFDB.DiscordConstants.MessageTypes.DEFAULT) {
						let message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.message, {author: this.getUserData(e.instance.props.message.author.id)}));
						let data = BDFDB.DataUtils.load(this, "users", e.instance.props.message.author.id);
						if (data) {
							if (data.name) message.nick = data.name;
							if (data.color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data.color1) ? data.color1[0] : data.color1, "HEX");
						}
						e.instance.props.message = message;
						e.instance.props.children.props.message = e.instance.props.message;
					}
				}
				else {
					let data = BDFDB.DataUtils.load(this, "users", e.instance.props.message.author.id);
					let messageColor = data && (data.color5 || (BDFDB.BDUtils.getSettings("bda-gs-7") && data.color1));
					if (messageColor) e.returnvalue.props.style = Object.assign({}, e.returnvalue.props.style, {color: BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(messageColor) ? messageColor[0] : messageColor, "RGBA")});
				}
			}
		}
		
		processMention (e) {
			if (e.instance.props.userId && BDFDB.DataUtils.get(this, "settings", "changeInMentions")) {
				let data = BDFDB.DataUtils.load(this, "users", e.instance.props.userId);
				if (data) {
					if (data.name) e.returnvalue.props.children[0] = "@" + data.name;
					if (data.color1) {
						let color1_0 = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data.color1) ? data.color1[0] : data.color1, "RGBA");
						let color0_1 = BDFDB.ColorUtils.setAlpha(color1_0, 0.1, "RGBA");
						let color0_7 = BDFDB.ColorUtils.setAlpha(color1_0, 0.7, "RGBA");
						e.returnvalue.props.style = Object.assign({}, e.returnvalue.props.style, {
							background: color0_1,
							color: color1_0
						});
						let onMouseEnter = e.returnvalue.props.onMouseEnter || ( _ => {});
						e.returnvalue.props.onMouseEnter = event => {
							onMouseEnter(event);
							event.target.style.setProperty("background", color0_7, "important");
							event.target.style.setProperty("color", "#FFFFFF", "important");
						};
						let onMouseLeave = e.returnvalue.props.onMouseLeave || ( _ => {});
						e.returnvalue.props.onMouseLeave = event => {
							onMouseLeave(event);
							event.target.style.setProperty("background", color0_1, "important");
							event.target.style.setProperty("color", color1_0, "important");
						};
					}
				}
			}
		}

		processMemberListItem (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "changeInMemberList")) {
				if (!e.returnvalue) {
					e.instance.props.user = this.getUserData(e.instance.props.user.id);
					let data = BDFDB.DataUtils.load(this, "users", e.instance.props.user.id);
					if (data && data.name) e.instance.props.nick = data.name;
				}
				else {
					this.changeUserColor(e.returnvalue.props.name, e.instance.props.user.id, {changeBackground: true});
					this.injectBadge(BDFDB.ReactUtils.getValue(e.returnvalue, "props.decorators.props.children"), e.instance.props.user.id, BDFDB.LibraryModules.LastGuildStore.getGuildId(), 2, BDFDB.disCN.bottagmember);
				}
			}
		}

		processAuditLog (e) {
			if (e.instance.props.log && BDFDB.DataUtils.get(this, "settings", "changeInAuditLog")) {
				if (e.instance.props.log.user) e.instance.props.log.user = this.getUserData(e.instance.props.log.user.id);
				if (e.instance.props.log.target && e.instance.props.log.targetType == "USER") e.instance.props.log.target = this.getUserData(e.instance.props.log.target.id);
			}
		}

		processUserHook (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "changeInAuditLog")) {
				this.changeUserColor(e.returnvalue.props.children[0], e.instance.props.user.id);
			}
		}

		processGuildSettingsEmoji (e) {
			if (BDFDB.ArrayUtils.is(e.instance.props.emojis) && BDFDB.DataUtils.get(this, "settings", "changeInEmojiLog")) {
				e.instance.props.emojis = [].concat(e.instance.props.emojis);
				for (let i in e.instance.props.emojis) e.instance.props.emojis[i] = Object.assign({}, e.instance.props.emojis[i], {user: this.getUserData(e.instance.props.emojis[i].user.id)});
			}
		}

		processMemberCard (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "changeInMemberLog")) e.instance.props.user = this.getUserData(e.instance.props.user.id);
		}

		processSettingsInvites (e) {
			if (BDFDB.ObjectUtils.is(e.instance.props.invites) && BDFDB.DataUtils.get(this, "settings", "changeInMemberLog")) {
				e.instance.props.invites = Object.assign({}, e.instance.props.invites);
				for (let id in e.instance.props.invites) e.instance.props.invites[id] = new BDFDB.DiscordObjects.Invite(Object.assign({}, e.instance.props.invites[id], {inviter: this.getUserData(e.instance.props.invites[id].inviter.id)}));
			}
		}

		processGuildSettingsBans (e) {
			if (BDFDB.ObjectUtils.is(e.instance.props.bans) && BDFDB.DataUtils.get(this, "settings", "changeInMemberLog")) {
				e.instance.props.bans = Object.assign({}, e.instance.props.bans);
				for (let id in e.instance.props.bans) e.instance.props.bans[id] = Object.assign({}, e.instance.props.bans[id], {user: this.getUserData(e.instance.props.bans[id].user.id)});
			}
		}

		processInvitationCard (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "changeInInviteList")) {
				if (!e.returnvalue) e.instance.props.user = this.getUserData(e.instance.props.user.id);
				else {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["className", BDFDB.disCN.invitemodalinviterowname]]});
					if (index > -1) this.changeUserColor(children[index], e.instance.props.user.id);
				}
			}
		}

		processPrivateChannelRecipientsInvitePopout (e) {
			if (BDFDB.ArrayUtils.is(e.instance.props.results) && BDFDB.DataUtils.get(this, "settings", "changeInInviteList")) {
				for (let result of e.instance.props.results) result.user = this.getUserData(result.user.id);
			}
		}

		processInviteModalUserRow (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "changeInInviteList")) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["className", BDFDB.disCN.searchpopoutddmaddnickname]]});
				if (index > -1) this.changeUserColor(children[index], e.instance.props.user.id);
			}
		}

		processTypingUsers (e) {
			if (BDFDB.ObjectUtils.is(e.instance.props.typingUsers) && Object.keys(e.instance.props.typingUsers).length && BDFDB.DataUtils.get(this, "settings", "changeInTyping")) {
				let users = Object.keys(e.instance.props.typingUsers).filter(id => id != BDFDB.UserUtils.me.id).filter(id => !BDFDB.LibraryModules.FriendUtils.isBlocked(id)).map(id => BDFDB.LibraryModules.UserStore.getUser(id)).filter(user => user);
				if (users.length) {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["className", BDFDB.disCN.typingtext]]});
					if (index > -1 && BDFDB.ArrayUtils.is(children[index].props.children)) for (let child of children[index].props.children) if (child.type == "strong") {
						let userId = (users.shift() || {}).id;
						if (userId) {
							let data = BDFDB.DataUtils.load(this, "users", userId);
							if (data && data.name) child.props.children = data.name;
							this.changeUserColor(child, userId);
						}
					}
				}
			}
		}

		processDirectMessage (e) {
			if (e.instance.props.channel && e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && BDFDB.DataUtils.get(this, "settings", "changeInRecentDms")) {
				let recipientId = e.instance.props.channel.getRecipientId();
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "ListItemTooltip"});
				if (index > -1) children[index].props.text = this.getUserData(recipientId).username;
				[children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "NavItem"});
				if (index > -1) children[index].props.icon = this.getUserAvatar(recipientId);
			}
		}

		processPrivateChannel (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "changeInDmsList")) {
				e.returnvalue.props.name = BDFDB.ReactUtils.createElement("span", {children: this.getUserData(e.instance.props.user.id).username});
				e.returnvalue.props.avatar.props.src = this.getUserAvatar(e.instance.props.user.id);
				this.changeUserColor(e.returnvalue.props.name, e.instance.props.user.id, {changeBackground: true});
				e.returnvalue.props.name = [e.returnvalue.props.name];
				this.injectBadge(e.returnvalue.props.name, e.instance.props.user.id, null, 1);
			}
		}

		processQuickSwitchUserResult (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "changeInQuickSwitcher")) {
				if (!e.returnvalue) e.instance.props.user = this.getUserData(e.instance.props.user.id);
				else {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props:[["className", BDFDB.disCN.quickswitchresultmatch]]});
					if (index > -1) {
						let data = BDFDB.DataUtils.load(this, "users", e.instance.props.user.id);
						if (data && data.name) children[index].props.children = data.name;
						this.changeUserColor(children[index], e.instance.props.user.id, {modify: BDFDB.ObjectUtils.extract(e.instance.props, "focused", "unread", "mentions")});
					}
				}
			}
		}

		processSearchPopoutComponent (e) {
			if (BDFDB.ArrayUtils.is(BDFDB.ReactUtils.getValue(e, "instance.props.resultsState.autocompletes")) && BDFDB.DataUtils.get(this, "settings", "changeInSearchPopout")) {
				for (let autocomplete of e.instance.props.resultsState.autocompletes) if (autocomplete && BDFDB.ArrayUtils.is(autocomplete.results)) for (let result of autocomplete.results) if (result.user) result.user = this.getUserData(result.user.id);
			}
		}

		processSearchPopoutUserResult (e) {
			if (e.instance.props.result && e.instance.props.result.user && BDFDB.DataUtils.get(this, "settings", "changeInSearchPopout")) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props:[["className", BDFDB.disCN.searchpopoutdisplayednick]]});
				if (index > -1) {
					let data = BDFDB.DataUtils.load(this, "users", e.instance.props.result.user.id);
					if (data && data.name) children[index].props.children = data.name;
					this.changeUserColor(children[index], e.instance.props.result.user.id);
				}
			}
		}

		processIncomingCall (e) {
			if (e.instance.props.channelId && BDFDB.DataUtils.get(this, "settings", "changeInDmCalls")) {
				let user = BDFDB.LibraryModules.UserStore.getUser(e.instance.props.channelId);
				if (!user) {
					let channel = BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.channelId);
					if (channel && channel.type == BDFDB.DiscordConstants.ChannelTypes.DM) user = BDFDB.LibraryModules.UserStore.getUser(channel.recipients[0]);
				}
				if (user) {
					if (!e.returnvalue) {
						e.instance.props.channelName = this.getUserData(user.id).username;
						e.instance.props.avatarUrl = this.getUserAvatar(user.id);
					}
					else {
						let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props:[["className", BDFDB.disCN.callmembers]]});
						if (index > -1) this.changeUserColor(children[index], user.id);
					}
				}
			}
		}

		processPrivateChannelCallParticipants (e) {
			if (BDFDB.ArrayUtils.is(e.instance.props.participants) && BDFDB.DataUtils.get(this, "settings", "changeInDmCalls")) {
				for (let participant of e.instance.props.participants) if (participant && participant.user) participant.user = this.getUserData(participant.user.id);
			}
		}

		processVideoTile (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "changeInDmCalls")) e.instance.props.user = this.getUserData(e.instance.props.user.id);
		}

		changeAppTitle () {
			let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
			let title = document.head.querySelector("title");
			if (title && channel && channel.type == 1) {
				let info = BDFDB.LibraryModules.UserStore.getUser(channel.recipients[0]);
				if (info) {
					let data = this.getUserData(info.id, title);
					BDFDB.DOMUtils.setText(title, "@" + (data.name || info.username));
				}
			}
		}
		
		changeUserColor (parent, userId, options = {}) {
			if (BDFDB.ReactUtils.isValidElement(parent)) {
				let data = BDFDB.DataUtils.load(this, "users", userId) || {};
				if (data.color1 || (data.color2 && options.changeBackground)) {
					let fontColor = options.modify ? this.chooseColor(data.color1, options.modify) : data.color1;
					let backgroundColor = options.changeBackground && data.color2;
					let fontGradient = BDFDB.ObjectUtils.is(fontColor);
					if (BDFDB.ObjectUtils.is(parent.props.style)) {
						delete parent.props.style.color;
						delete parent.props.style.backgroundColor;
					}
					parent.props.children = BDFDB.ReactUtils.createElement("span", {
						style: {
							background: BDFDB.ObjectUtils.is(backgroundColor) ? BDFDB.ColorUtils.createGradient(backgroundColor) : BDFDB.ColorUtils.convert(backgroundColor, "RGBA"),
							color: fontGradient ? BDFDB.ColorUtils.convert(fontColor[0], "RGBA") : BDFDB.ColorUtils.convert(fontColor, "RGBA")
						},
						children: fontGradient ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
							gradient: BDFDB.ColorUtils.createGradient(fontColor),
							children: parent.props.children
						}) : parent.props.children
					});
				}
			}
		}

		chooseColor (color, config = {}) {
			if (color) {
				if (BDFDB.ObjectUtils.is(config)) {
					if (config.mentions || config.focused || config.hovered || config.selected || config.unread || config.speaking) color = BDFDB.ColorUtils.change(color, 0.5);
					else if (config.muted || config.locked) color = BDFDB.ColorUtils.change(color, -0.5);
				}
				return color;
			}
			return null;
		}
		
		getUserData (userId, change = true, keepName = false) {
			let user = BDFDB.LibraryModules.UserStore.getUser(userId);
			if (!user) return new BDFDB.DiscordObjects.User({});
			let data = change && BDFDB.DataUtils.load(this, "users", user.id);
			if (data) {
				let newUserObject = {}, nativeObject = new BDFDB.DiscordObjects.User(user);
				for (let key in nativeObject) newUserObject[key] = nativeObject[key];
				newUserObject.tag = nativeObject.tag;
				newUserObject.createdAt = nativeObject.createdAt;
				newUserObject.username = !keepName && data.name || nativeObject.username;
				newUserObject.usernameNormalized = !keepName &&data.name && data.name.toLowerCase() || nativeObject.usernameNormalized;
				if (data.removeIcon) {
					newUserObject.avatar = null;
					newUserObject.avatarURL = null;
					newUserObject.getAvatarURL = _ => {return null;};
				}
				else if (data.url) {
					newUserObject.avatar = data.url;
					newUserObject.avatarURL = data.url;
					newUserObject.getAvatarURL = _ => {return data.url;};
				}
				return newUserObject;
			}
			return new BDFDB.DiscordObjects.User(user);
		}
		
		getUserAvatar (userId, change = true) {
			let user = BDFDB.LibraryModules.UserStore.getUser(userId);
			if (!user) return "";
			let data = change && BDFDB.DataUtils.load(this, "users", user.id);
			if (data) {
				if (data.removeIcon) return "";
				else if (data.url) return data.url;
			}
			return BDFDB.LibraryModules.IconUtils.getUserAvatarURL(user);
		}
		
		injectBadge (children, userId, guildId, insertIndex, botClass = "", inverted = false) {
			if (!BDFDB.ArrayUtils.is(children) || !userId) return;
			let data = BDFDB.DataUtils.load(this, "users", userId);
			if (data && data.tag) {
				let memberColor = data.ignoreTagColor && (BDFDB.LibraryModules.MemberStore.getMember(guildId, userId) || {}).colorString;
				let fontColor = !inverted ? data.color4 : (memberColor || data.color3);
				let backgroundColor = !inverted ? (memberColor || data.color3) : data.color4;
				let fontGradient = BDFDB.ObjectUtils.is(fontColor);
				children.splice(insertIndex, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BotTag, {
					className: botClass,
					invertColor: inverted,
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
		
		forceUpdateAll () {
			this.changeAppTitle();
			BDFDB.ModuleUtils.forceAllUpdates(this);
			BDFDB.MessageUtils.rerenderAll();
		}

		showUserSettings (info) {
			let data = BDFDB.DataUtils.load(this, "users", info.id) || {};
			let member = BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), info.id) || {};
			
			BDFDB.ModalUtils.open(this, {
				size: "MEDIUM",
				header: this.labels.modal_header_text,
				subheader: member.nick || info.username,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
						tab: this.labels.modal_tabheader1_text,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: this.labels.modal_username_text,
								className: BDFDB.disCN.marginbottom20 + " input-username",
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									value: data.name,
									placeholder: member.nick || info.username,
									autoFocus: true
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: this.labels.modal_usertag_text,
								className: BDFDB.disCN.marginbottom20 + " input-usertag",
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									value: data.tag
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: this.labels.modal_useravatar_text,
								className: BDFDB.disCN.marginbottom8 + " input-useravatar",
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									inputClassName: !data.removeIcon && data.url ? BDFDB.disCN.inputsuccess : null,
									inputId: "USERAVATAR",
									value: data.url,
									placeholder: BDFDB.UserUtils.getAvatar(info.id),
									disabled: data.removeIcon,
									onChange: (value, instance) => {
										this.checkUrl(value, instance);
									}
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Switch",
								className: BDFDB.disCN.marginbottom20 + " input-removeicon",
								label: this.labels.modal_removeicon_text,
								value: data.removeIcon,
								onChange: (value, instance) => {
									let avatarinputins = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {props:[["inputId","USERAVATAR"]]});
									if (avatarinputins) {
										delete avatarinputins.props.success;
										delete avatarinputins.props.errorMessage;
										avatarinputins.props.disabled = value;
										BDFDB.ReactUtils.forceUpdate(avatarinputins);
									}
								}
							})
						]
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
						tab: this.labels.modal_tabheader2_text,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: this.labels.modal_colorpicker1_text,
								className: BDFDB.disCN.marginbottom20,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color1,
									number: 1
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: this.labels.modal_colorpicker2_text,
								className: BDFDB.disCN.marginbottom20,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color2,
									number: 2
								})
							})
						]
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
						tab: this.labels.modal_tabheader3_text,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: this.labels.modal_colorpicker3_text,
								className: BDFDB.disCN.marginbottom20,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color3,
									number: 3,
									disabled: data.ignoreTagColor
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: this.labels.modal_colorpicker4_text,
								className: BDFDB.disCN.marginbottom20,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color4,
									number: 4,
									disabled: data.ignoreTagColor
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Switch",
								className: BDFDB.disCN.marginbottom20 + " input-ignoretagcolor",
								label: this.labels.modal_ignoretagcolor_text,
								value: data.ignoreTagColor,
								onChange: (value, instance) => {
									let colorpicker3ins = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {props:[["number",3]]});
									let colorpicker4ins = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {props:[["number",4]]});
									if (colorpicker3ins) colorpicker3ins.setState({disabled: value});
									if (colorpicker4ins) colorpicker4ins.setState({disabled: value});
								}
							})
						]
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
						tab: this.labels.modal_tabheader4_text,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: this.labels.modal_colorpicker5_text,
								className: BDFDB.disCN.marginbottom20,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color5,
									pickerConfig: {gradient: false},
									number: 5
								})
							})
						]
					})
				],
				buttons: [{
					contents: BDFDB.LanguageUtils.LanguageStrings.SAVE,
					color: "BRAND",
					close: true,
					click: modal => {
						let olddata = Object.assign({}, data);
						
						let usernameinput = modal.querySelector(".input-username " + BDFDB.dotCN.input);
						let usertaginput = modal.querySelector(".input-usertag " + BDFDB.dotCN.input);
						let useravatarinput = modal.querySelector(".input-useravatar " + BDFDB.dotCN.input);
						let removeiconinput = modal.querySelector(".input-removeicon " + BDFDB.dotCN.switchinner);
						let ignoretagcolorinput = modal.querySelector(".input-ignoretagcolor " + BDFDB.dotCN.switchinner);
						
						data.name = usernameinput.value.trim() || null;
						data.tag = usertaginput.value.trim() || null;
						data.url = (!data.removeIcon && BDFDB.DOMUtils.containsClass(useravatarinput, BDFDB.disCN.inputsuccess) ? useravatarinput.value.trim() : null) || null;
						data.removeIcon = removeiconinput.checked;
						data.ignoreTagColor = ignoretagcolorinput.checked;

						data.color1 = BDFDB.ColorUtils.getSwatchColor(modal, 1);
						data.color2 = BDFDB.ColorUtils.getSwatchColor(modal, 2);
						data.color3 = BDFDB.ColorUtils.getSwatchColor(modal, 3);
						data.color4 = BDFDB.ColorUtils.getSwatchColor(modal, 4);
						data.color5 = BDFDB.ColorUtils.getSwatchColor(modal, 5);

						let changed = false;
						if (Object.keys(data).every(key => data[key] == null || data[key] == false) && (changed = true)) BDFDB.DataUtils.remove(this, "users", info.id);
						else if (!BDFDB.equals(olddata, data) && (changed = true)) BDFDB.DataUtils.save(data, this, "users", info.id);
						if (changed) this.forceUpdateAll();
					}
				}]
			});
		}
		
		checkUrl (url, instance) {
			BDFDB.TimeUtils.clear(instance.checkTimeout);
			if (url == null || !url.trim()) {
				delete instance.props.success;
				delete instance.props.errorMessage;
				instance.forceUpdate();
			}
			else instance.checkTimeout = BDFDB.TimeUtils.timeout(_ => {
				BDFDB.LibraryRequires.request(url.trim(), (error, response, result) => {
					if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") != -1) {
						instance.props.success = true;
						delete instance.props.errorMessage;
					}
					else {
						delete instance.props.success;
						instance.props.errorMessage = this.labels.modal_invalidurl_text;
					}
					delete instance.checkTimeout;
					instance.forceUpdate();
				});
			}, 1000);
		}

		setLabelsByLanguage () {
			switch (BDFDB.LanguageUtils.getLanguage().id) {
				case "hr":		//croatian
					return {
						context_localusersettings_text:		"Lokalne korisničke postavke",
						submenu_usersettings_text:			"Promijeni postavke",
						submenu_resetsettings_text:			"Poništi korisnika",
						modal_header_text:					"Lokalne korisničke postavke",
						modal_username_text:				"Lokalno korisničko ime",
						modal_usertag_text:					"Oznaka",
						modal_useravatar_text:				"Ikona",
						modal_removeicon_text:				"Ukloni ikonu",
						modal_tabheader1_text:				"Korisnik",
						modal_tabheader2_text:				"Boja naziva",
						modal_tabheader3_text:				"Boja oznaka",
						modal_tabheader4_text:				"Boja poruke",
						modal_colorpicker1_text:			"Boja naziva",
						modal_colorpicker2_text:			"Boja pozadine",
						modal_colorpicker3_text:			"Boja oznaka",
						modal_colorpicker4_text:			"Boja fonta",
						modal_colorpicker5_text:			"Boja fonta",
						modal_ignoretagcolor_text:			"Upotrijebite boju uloga",
						modal_invalidurl_text:				"Nevažeći URL"
					};
				case "da":		//danish
					return {
						context_localusersettings_text:		"Lokal brugerindstillinger",
						submenu_usersettings_text:			"Skift indstillinger",
						submenu_resetsettings_text:			"Nulstil bruger",
						modal_header_text:					"Lokal brugerindstillinger",
						modal_username_text:				"Lokalt brugernavn",
						modal_usertag_text:					"Initialer",
						modal_useravatar_text:				"Ikon",
						modal_removeicon_text:				"Fjern ikon",
						modal_tabheader1_text:				"Bruger",
						modal_tabheader2_text:				"Navnefarve",
						modal_tabheader3_text:				"Etiketfarve",
						modal_tabheader4_text:				"Meddelelsesfarve",
						modal_colorpicker1_text:			"Navnefarve",
						modal_colorpicker2_text:			"Baggrundsfarve",
						modal_colorpicker3_text:			"Etiketfarve",
						modal_colorpicker4_text:			"Skriftfarve",
						modal_colorpicker5_text:			"Skriftfarve",
						modal_ignoretagcolor_text:			"Brug rollefarve",
						modal_invalidurl_text:				"Ugyldig URL"
					};
				case "de":		//german
					return {
						context_localusersettings_text:		"Lokale Benutzereinstellungen",
						submenu_usersettings_text:			"Einstellungen ändern",
						submenu_resetsettings_text:			"Benutzer zurücksetzen",
						modal_header_text:					"Lokale Benutzereinstellungen",
						modal_username_text:				"Lokaler Benutzername",
						modal_usertag_text:					"Etikett",
						modal_useravatar_text:				"Icon",
						modal_removeicon_text:				"Entferne Icon",
						modal_tabheader1_text:				"Benutzer",
						modal_tabheader2_text:				"Namensfarbe",
						modal_tabheader3_text:				"Etikettfarbe",
						modal_tabheader4_text:				"Nachrichtenfarbe",
						modal_colorpicker1_text:			"Namensfarbe",
						modal_colorpicker2_text:			"Hintergrundfarbe",
						modal_colorpicker3_text:			"Etikettfarbe",
						modal_colorpicker4_text:			"Schriftfarbe",
						modal_colorpicker5_text:			"Schriftfarbe",
						modal_ignoretagcolor_text:			"Benutze Rollenfarbe",
						modal_invalidurl_text:				"Ungültige URL"
					};
				case "es":		//spanish
					return {
						context_localusersettings_text:		"Ajustes local de usuario",
						submenu_usersettings_text:			"Cambiar ajustes",
						submenu_resetsettings_text:			"Restablecer usuario",
						modal_header_text:					"Ajustes local de usuario",
						modal_username_text:				"Nombre local de usuario",
						modal_usertag_text:					"Etiqueta",
						modal_useravatar_text:				"Icono",
						modal_removeicon_text:				"Eliminar icono",
						modal_tabheader1_text:				"Usuario",
						modal_tabheader2_text:				"Color del nombre",
						modal_tabheader3_text:				"Color de la etiqueta",
						modal_tabheader4_text:				"Color del mensaje",
						modal_colorpicker1_text:			"Color del nombre",
						modal_colorpicker2_text:			"Color de fondo",
						modal_colorpicker3_text:			"Color de la etiqueta",
						modal_colorpicker4_text:			"Color de fuente",
						modal_colorpicker5_text:			"Color de fuente",
						modal_ignoretagcolor_text:			"Usar color de rol",
						modal_invalidurl_text:				"URL inválida"
					};
				case "fr":		//french
					return {
						context_localusersettings_text:		"Paramètres locale d'utilisateur",
						submenu_usersettings_text:			"Modifier les paramètres",
						submenu_resetsettings_text:			"Réinitialiser l'utilisateur",
						modal_header_text:					"Paramètres locale d'utilisateur",
						modal_username_text:				"Nom local d'utilisateur",
						modal_usertag_text:					"Étiquette",
						modal_useravatar_text:				"Icône",
						modal_removeicon_text:				"Supprimer l'icône",
						modal_tabheader1_text:				"Serveur",
						modal_tabheader2_text:				"Couleur du nom",
						modal_tabheader3_text:				"Couleur de l'étiquette",
						modal_tabheader4_text:				"Couleur du message",
						modal_colorpicker1_text:			"Couleur du nom",
						modal_colorpicker2_text:			"Couleur de fond",
						modal_colorpicker3_text:			"Couleur de l'étiquette",
						modal_colorpicker4_text:			"Couleur de la police",
						modal_colorpicker5_text:			"Couleur de la police",
						modal_ignoretagcolor_text:			"Utiliser la couleur de rôle",
						modal_invalidurl_text:				"URL invalide"
					};
				case "it":		//italian
					return {
						context_localusersettings_text:		"Impostazioni locale utente",
						submenu_usersettings_text:			"Cambia impostazioni",
						submenu_resetsettings_text:			"Ripristina utente",
						modal_header_text:					"Impostazioni locale utente",
						modal_username_text:				"Nome locale utente",
						modal_usertag_text:					"Etichetta",
						modal_useravatar_text:				"Icona",
						modal_removeicon_text:				"Rimuova l'icona",
						modal_tabheader1_text:				"Utente",
						modal_tabheader2_text:				"Colore del nome",
						modal_tabheader3_text:				"Colore della etichetta",
						modal_tabheader4_text:				"Colore del messaggio",
						modal_colorpicker1_text:			"Colore del nome",
						modal_colorpicker2_text:			"Colore di sfondo",
						modal_colorpicker3_text:			"Colore della etichetta",
						modal_colorpicker4_text:			"Colore del carattere",
						modal_colorpicker5_text:			"Colore del carattere",
						modal_ignoretagcolor_text:			"Usa il colore del ruolo",
						modal_invalidurl_text:				"URL non valido"
					};
				case "nl":		//dutch
					return {
						context_localusersettings_text:		"Lokale gebruikerinstellingen",
						submenu_usersettings_text:			"Verandere instellingen",
						submenu_resetsettings_text:			"Reset gebruiker",
						modal_header_text:					"Lokale gebruikerinstellingen",
						modal_username_text:				"Lokale gebruikernaam",
						modal_usertag_text:					"Etiket",
						modal_useravatar_text:				"Icoon",
						modal_removeicon_text:				"Verwijder icoon",
						modal_tabheader1_text:				"Gebruiker",
						modal_tabheader2_text:				"Naamkleur",
						modal_tabheader3_text:				"Etiketkleur",
						modal_tabheader4_text:				"Berichtkleur",
						modal_colorpicker1_text:			"Naamkleur",
						modal_colorpicker2_text:			"Achtergrondkleur",
						modal_colorpicker3_text:			"Etiketkleur",
						modal_colorpicker4_text:			"Doopvontkleur",
						modal_colorpicker5_text:			"Doopvontkleur",
						modal_ignoretagcolor_text:			"Gebruik rolkleur",
						modal_invalidurl_text:				"Ongeldige URL"
					};
				case "no":		//norwegian
					return {
						context_localusersettings_text:		"Lokal brukerinnstillinger",
						submenu_usersettings_text:			"Endre innstillinger",
						submenu_resetsettings_text:			"Tilbakestill bruker",
						modal_header_text:					"Lokal brukerinnstillinger",
						modal_username_text:				"Lokalt gebruikernavn",
						modal_usertag_text:					"Stikkord",
						modal_useravatar_text:				"Ikon",
						modal_removeicon_text:				"Fjern ikon",
						modal_tabheader1_text:				"Bruker",
						modal_tabheader2_text:				"Navnfarge",
						modal_tabheader3_text:				"Stikkordfarge",
						modal_tabheader4_text:				"Meldingsfarge",
						modal_colorpicker1_text:			"Navnfarge",
						modal_colorpicker2_text:			"Bakgrunnfarge",
						modal_colorpicker3_text:			"Stikkordfarge",
						modal_colorpicker4_text:			"Skriftfarge",
						modal_colorpicker5_text:			"Skriftfarge",
						modal_ignoretagcolor_text:			"Bruk rollefarge",
						modal_invalidurl_text:				"Ugyldig URL"
					};
				case "pl":		//polish
					return {
						context_localusersettings_text:		"Lokalne ustawienia użytkownika",
						submenu_usersettings_text:			"Zmień ustawienia",
						submenu_resetsettings_text:			"Resetuj ustawienia",
						modal_header_text:					"Lokalne ustawienia użytkownika",
						modal_username_text:				"Lokalna nazwa użytkownika",
						modal_usertag_text:					"Etykieta",
						modal_useravatar_text:				"Ikona",
						modal_removeicon_text:				"Usuń ikonę",
						modal_tabheader1_text:				"Użytkownik",
						modal_tabheader2_text:				"Kolor nazwy",
						modal_tabheader3_text:				"Kolor etykiety",
						modal_tabheader4_text:				"Kolor wiadomości",
						modal_colorpicker1_text:			"Kolor nazwy",
						modal_colorpicker2_text:			"Kolor tła",
						modal_colorpicker3_text:			"Kolor etykiety",
						modal_colorpicker4_text:			"Kolor czcionki",
						modal_colorpicker5_text:			"Kolor czcionki",
						modal_ignoretagcolor_text:			"Użyj kolor roli",
						modal_invalidurl_text:				"Nieprawidłowe URL"
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						context_localusersettings_text:		"Configurações local do utilizador",
						submenu_usersettings_text:			"Mudar configurações",
						submenu_resetsettings_text:			"Redefinir utilizador",
						modal_header_text:					"Configurações local do utilizador",
						modal_username_text:				"Nome local do utilizador",
						modal_usertag_text:					"Etiqueta",
						modal_useravatar_text:				"Icone",
						modal_removeicon_text:				"Remover ícone",
						modal_tabheader1_text:				"Utilizador",
						modal_tabheader2_text:				"Cor do nome",
						modal_tabheader3_text:				"Cor da etiqueta",
						modal_tabheader4_text:				"Cor da mensagem",
						modal_colorpicker1_text:			"Cor do nome",
						modal_colorpicker2_text:			"Cor do fundo",
						modal_colorpicker3_text:			"Cor da etiqueta",
						modal_colorpicker4_text:			"Cor da fonte",
						modal_colorpicker5_text:			"Cor da fonte",
						modal_ignoretagcolor_text:			"Use a cor do papel",
						modal_invalidurl_text:				"URL inválida"
					};
				case "fi":		//finnish
					return {
						context_localusersettings_text:		"Paikallinen käyttäjä asetukset",
						submenu_usersettings_text:			"Vaihda asetuksia",
						submenu_resetsettings_text:			"Nollaa käyttäjä",
						modal_header_text:					"Paikallinen käyttäjä asetukset",
						modal_username_text:				"Paikallinen käyttäjätunnus",
						modal_usertag_text:					"Merkki",
						modal_useravatar_text:				"Ikonin",
						modal_removeicon_text:				"Poista kuvake",
						modal_tabheader1_text:				"Käyttäjä",
						modal_tabheader2_text:				"Nimiväri",
						modal_tabheader3_text:				"Merkkiväri",
						modal_tabheader4_text:				"Viestinväri",
						modal_colorpicker1_text:			"Nimiväri",
						modal_colorpicker2_text:			"Taustaväri",
						modal_colorpicker3_text:			"Merkkiväri",
						modal_colorpicker4_text:			"Fontinväri",
						modal_colorpicker5_text:			"Fontinväri",
						modal_ignoretagcolor_text:			"Käytä rooliväriä",
						modal_invalidurl_text:				"Virheellinen URL"
					};
				case "sv":		//swedish
					return {
						context_localusersettings_text:		"Lokal användareinställningar",
						submenu_usersettings_text:			"Ändra inställningar",
						submenu_resetsettings_text:			"Återställ användare",
						modal_header_text:					"Lokal användareinställningar",
						modal_username_text:				"Lokalt användarenamn",
						modal_usertag_text:					"Märka",
						modal_useravatar_text:				"Ikon",
						modal_removeicon_text:				"Ta bort ikonen",
						modal_tabheader1_text:				"Användare",
						modal_tabheader2_text:				"Namnfärg",
						modal_tabheader3_text:				"Märkafärg",
						modal_tabheader4_text:				"Meddelandefärg",
						modal_colorpicker1_text:			"Namnfärg",
						modal_colorpicker2_text:			"Bakgrundfärg",
						modal_colorpicker3_text:			"Märkafärg",
						modal_colorpicker4_text:			"Fontfärg",
						modal_colorpicker5_text:			"Fontfärg",
						modal_ignoretagcolor_text:			"Använd rollfärg",
						modal_invalidurl_text:				"Ogiltig URL"
					};
				case "tr":		//turkish
					return {
						context_localusersettings_text:		"Yerel Kullanıcı Ayarları",
						submenu_usersettings_text:			"Ayarları Değiştir",
						submenu_resetsettings_text:			"Kullanıcı Sıfırla",
						modal_header_text:					"Yerel Kullanıcı Ayarları",
						modal_username_text:				"Yerel Kullanıcı Isim",
						modal_usertag_text:					"Etiket",
						modal_useravatar_text:				"Simge",
						modal_removeicon_text:				"Simge kaldır",
						modal_tabheader1_text:				"Kullanıcı",
						modal_tabheader2_text:				"Simge rengi",
						modal_tabheader3_text:				"Isim rengi",
						modal_tabheader4_text:				"Mesaj rengi",
						modal_colorpicker1_text:			"Simge rengi",
						modal_colorpicker2_text:			"Arka fon rengi",
						modal_colorpicker3_text:			"Etiket rengi",
						modal_colorpicker4_text:			"Yazı rengi",
						modal_colorpicker5_text:			"Yazı rengi",
						modal_ignoretagcolor_text:			"Rol rengini kullan",
						modal_invalidurl_text:				"Geçersiz URL"
					};
				case "cs":		//czech
					return {
						context_localusersettings_text:		"Místní nastavení uživatel",
						submenu_usersettings_text:			"Změnit nastavení",
						submenu_resetsettings_text:			"Obnovit uživatel",
						modal_header_text:					"Místní nastavení uživatel",
						modal_username_text:				"Místní název uživatel",
						modal_usertag_text:					"Štítek",
						modal_useravatar_text:				"Ikony",
						modal_removeicon_text:				"Odstranit ikonu",
						modal_tabheader1_text:				"Uživatel",
						modal_tabheader2_text:				"Barva název",
						modal_tabheader3_text:				"Barva štítek",
						modal_tabheader4_text:				"Barva zprávy",
						modal_colorpicker1_text:			"Barva název",
						modal_colorpicker2_text:			"Barva pozadí",
						modal_colorpicker3_text:			"Barva štítek",
						modal_colorpicker4_text:			"Barva fontu",
						modal_colorpicker5_text:			"Barva fontu",
						modal_ignoretagcolor_text:			"Použijte barva role",
						modal_invalidurl_text:				"Neplatná URL"
					};
				case "bg":		//bulgarian
					return {
						context_localusersettings_text:		"Настройки за локални потребител",
						submenu_usersettings_text:			"Промяна на настройките",
						submenu_resetsettings_text:			"Възстановяване на потребител",
						modal_header_text:					"Настройки за локални потребител",
						modal_username_text:				"Локално име на потребител",
						modal_usertag_text:					"Cвободен край",
						modal_useravatar_text:				"Икона",
						modal_removeicon_text:				"Премахване на иконата",
						modal_tabheader1_text:				"Потребител",
						modal_tabheader2_text:				"Цвят на име",
						modal_tabheader3_text:				"Цвят на свободен край",
						modal_tabheader4_text:				"Цвят на съобщението",
						modal_colorpicker1_text:			"Цвят на име",
						modal_colorpicker2_text:			"Цвят на заден план",
						modal_colorpicker3_text:			"Цвят на свободен край",
						modal_colorpicker4_text:			"Цвят на шрифта",
						modal_colorpicker5_text:			"Цвят на шрифта",
						modal_ignoretagcolor_text:			"Използвайте цвят на ролите",
						modal_invalidurl_text:				"Невалиден URL"
					};
				case "ru":		//russian
					return {
						context_localusersettings_text:		"Настройки локального пользователь",
						submenu_usersettings_text:			"Изменить настройки",
						submenu_resetsettings_text:			"Сбросить пользователь",
						modal_header_text:					"Настройки локального пользователь",
						modal_username_text:				"Имя локального пользователь",
						modal_usertag_text:					"Tег",
						modal_useravatar_text:				"Значок",
						modal_removeicon_text:				"Удалить значок",
						modal_tabheader1_text:				"Пользователь",
						modal_tabheader2_text:				"Цвет имя",
						modal_tabheader3_text:				"Цвет тег",
						modal_tabheader4_text:				"Цвет сообщения",
						modal_colorpicker1_text:			"Цвет имя",
						modal_colorpicker2_text:			"Цвет задний план",
						modal_colorpicker3_text:			"Цвет тег",
						modal_colorpicker4_text:			"Цвет шрифта",
						modal_colorpicker5_text:			"Цвет шрифта",
						modal_ignoretagcolor_text:			"Использовать цвет ролей",
						modal_invalidurl_text:				"Неверная URL"
					};
				case "uk":		//ukrainian
					return {
						context_localusersettings_text:		"Налаштування локального користувач",
						submenu_usersettings_text:			"Змінити налаштування",
						submenu_resetsettings_text:			"Скидання користувач",
						modal_header_text:					"Налаштування локального користувач",
						modal_username_text:				"Локальне ім'я користувач",
						modal_usertag_text:					"Tег",
						modal_useravatar_text:				"Іконка",
						modal_removeicon_text:				"Видалити піктограму",
						modal_tabheader1_text:				"Користувач",
						modal_tabheader2_text:				"Колір ім'я",
						modal_tabheader3_text:				"Колір тег",
						modal_tabheader4_text:				"Колір повідомлення",
						modal_colorpicker1_text:			"Колір ім'я",
						modal_colorpicker2_text:			"Колір фон",
						modal_colorpicker3_text:			"Колір тег",
						modal_colorpicker4_text:			"Колір шрифту",
						modal_colorpicker5_text:			"Колір шрифту",
						modal_ignoretagcolor_text:			"Використовуйте рольовий колір",
						modal_invalidurl_text:				"Недійсна URL"
					};
				case "ja":		//japanese
					return {
						context_localusersettings_text:		"ローカルユーザーー設定",
						submenu_usersettings_text:			"設定を変更する",
						submenu_resetsettings_text:			"ユーザーーをリセットする",
						modal_header_text:					"ローカルユーザーー設定",
						modal_username_text:				"ローカルユーザーー名",
						modal_usertag_text:					"タグ",
						modal_useravatar_text:				"アイコン",
						modal_removeicon_text:				"アイコンを削除",
						modal_tabheader1_text:				"ユーザー",
						modal_tabheader2_text:				"名の色",
						modal_tabheader3_text:				"タグの色",
						modal_tabheader4_text:				"メッセージの色",
						modal_colorpicker1_text:			"名の色",
						modal_colorpicker2_text:			"バックグラウンドの色",
						modal_colorpicker3_text:			"タグの色",
						modal_colorpicker4_text:			"フォントの色",
						modal_colorpicker5_text:			"フォントの色",
						modal_ignoretagcolor_text:			"ロールカラーを使用する",
						modal_invalidurl_text:				"無効な URL"
					};
				case "zh-TW":	//chinese (traditional)
					return {
						context_localusersettings_text:		"本地用戶設置",
						submenu_usersettings_text:			"更改設置",
						submenu_resetsettings_text:			"重置用戶",
						modal_header_text:					"本地用戶設置",
						modal_username_text:				"用戶名稱",
						modal_usertag_text:					"標籤",
						modal_useravatar_text:				"圖標",
						modal_removeicon_text:				"刪除圖標",
						modal_tabheader1_text:				"用戶",
						modal_tabheader2_text:				"名稱顏色",
						modal_tabheader3_text:				"標籤顏色",
						modal_tabheader4_text:				"訊息顏色",
						modal_colorpicker1_text:			"名稱顏色",
						modal_colorpicker2_text:			"背景顏色",
						modal_colorpicker3_text:			"標籤顏色",
						modal_colorpicker4_text:			"字體顏色",
						modal_colorpicker5_text:			"字體顏色",
						modal_ignoretagcolor_text:			"使用角色",
						modal_invalidurl_text:				"無效的 URL"
					};
				case "ko":		//korean
					return {
						context_localusersettings_text:		"로컬 사용자 설정",
						submenu_usersettings_text:			"설정 변경",
						submenu_resetsettings_text:			"사용자 재설정",
						modal_header_text:					"로컬 사용자 설정",
						modal_username_text:				"로컬 사용자 이름",
						modal_usertag_text:					"꼬리표",
						modal_useravatar_text:				"상",
						modal_removeicon_text:				"상 삭제",
						modal_tabheader1_text:				"사용자",
						modal_tabheader2_text:				"이름 색깔",
						modal_tabheader3_text:				"꼬리표 색깔",
						modal_tabheader4_text:				"메시지 색상",
						modal_colorpicker1_text:			"이름 색깔",
						modal_colorpicker2_text:			"배경 색깔",
						modal_colorpicker3_text:			"꼬리표 색깔",
						modal_colorpicker4_text:			"글꼴 색깔",
						modal_colorpicker5_text:			"글꼴 색깔",
						modal_ignoretagcolor_text:			"역할 색상 사용",
						modal_invalidurl_text:				"잘못된 URL"
					};
				default:	//default: english
					return {
						context_localusersettings_text:		"Local Usersettings",
						submenu_usersettings_text:			"Change Settings",
						submenu_resetsettings_text:			"Reset User",
						modal_header_text:					"Local Usersettings",
						modal_username_text:				"Local Username",
						modal_usertag_text:					"Tag",
						modal_useravatar_text:				"Icon",
						modal_removeicon_text:				"Remove Icon",
						modal_tabheader1_text:				"User",
						modal_tabheader2_text:				"Namecolor",
						modal_tabheader3_text:				"Tagcolor",
						modal_tabheader4_text:				"Messagecolor",
						modal_colorpicker1_text:			"Namecolor",
						modal_colorpicker2_text:			"Backgroundcolor",
						modal_colorpicker3_text:			"Tagcolor",
						modal_colorpicker4_text:			"Fontcolor",
						modal_colorpicker5_text:			"Fontcolor",
						modal_ignoretagcolor_text:			"Use Rolecolor",
						modal_invalidurl_text:				"Invalid URL"
					};
			}
		}
	}
})();
