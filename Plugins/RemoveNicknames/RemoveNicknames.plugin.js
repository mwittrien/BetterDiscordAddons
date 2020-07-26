//META{"name":"RemoveNicknames","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RemoveNicknames","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RemoveNicknames/RemoveNicknames.plugin.js"}*//

var RemoveNicknames = (_ => {
	var settings = {};
	
	return class RemoveNicknames {
		getName () {return "RemoveNicknames";}

		getVersion () {return "1.3.0";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Replace all nicknames with the actual accountnames.";}

		constructor () {
			this.changelog = {
				"fixed":[["Typing List","Works now"]]
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
					TypingUsers: "render"
				}
			};
		}

		initConstructor () {
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
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let settingsPanel, settingsItems = [], innerItems = [];
			
			for (let key in settings) (!this.defaults.settings[key].inner ? settingsItems : innerItems).push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
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

		// Legacy
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


		// Begin of own functions

		onSettingsClosed (e) {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
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
			if (BDFDB.ArrayUtils.is(e.instance.props.content) && settings.changeInMentions) for (let ele of e.instance.props.content) {
				if (BDFDB.ReactUtils.isValidElement(ele) && ele.type && (ele.type.displayName || "").toLowerCase().indexOf("popout") > -1 && typeof ele.props.render == "function") {
					if (BDFDB.ReactUtils.getValue(ele, "props.children.type.displayName") == "Mention") {
						let newName = this.getNewName(BDFDB.LibraryModules.UserStore.getUser(ele.props.render().props.userId));
						if (newName) ele.props.children.props.children[0] = "@" + newName;
					}
				}
			}
			if (e.instance.props.message.type != BDFDB.DiscordConstants.MessageTypes.DEFAULT && e.instance.props.message.nick && settings.changeInChatWindow) {
				let newName = this.getNewName(e.instance.props.message.author);
				if (newName) {
					e.instance.props.message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.message, {nick: newName}));
					e.instance.props.children.props.message = e.instance.props.message;
				}
			}
		}

		getNewName (user, wrapper) {
			if (!user) return null;
			let member = BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), user.id) || {};
			if (!member.nick || user.id == BDFDB.UserUtils.me.id && !settings.replaceOwn || user.bot && !settings.replaceBots) return null;
			let username = (BDFDB.BDUtils.isPluginEnabled("EditUsers") && BDFDB.DataUtils.load("EditUsers", "users", user.id) || {}).name || user.username;
			return settings.addNickname ? (settings.swapPositions ? (member.nick + " (" + username + ")") : (username + " (" + member.nick + ")")) : username;
		}
		
		forceUpdateAll () {
			settings = BDFDB.DataUtils.get(this, "settings");
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
			BDFDB.MessageUtils.rerenderAll();
		}
	}
})();

module.exports = RemoveNicknames;