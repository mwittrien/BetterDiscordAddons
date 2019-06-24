//META{"name":"RemoveNicknames","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RemoveNicknames","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RemoveNicknames/RemoveNicknames.plugin.js"}*//

class RemoveNicknames {
	getName () {return "RemoveNicknames";}

	getVersion () {return "1.2.2";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Replace all nicknames with the actual accountnames.";}

	initConstructor () {
		this.changelog = {
			"improved":[["Normalized Classes","Normalized Classes no longer make the plugin be rendered useless in the member list"]]
		};
		
		this.patchModules = {
			"NameTag":"componentDidMount",
			"TypingUsers":"componentDidUpdate",
			"MessageUsername":"componentDidMount",
			"Clickable":"componentDidMount",
			"StandardSidebarView":"componentWillUnmount"
		};

		this.defaults = {
			settings: {
				replaceOwn:		{value:false, 	description:"Replace your own name:"},
				addNickname:    {value:false, 	description:"Add nickname as parentheses:"},
				swapPositions:	{value:false, 	description:"Swap the position of username and nickname:"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var settings = BDFDB.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);
;
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				require("request")("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
					if (body) {
						libraryScript = document.createElement("script");
						libraryScript.setAttribute("id", "BDFDBLibraryScript");
						libraryScript.setAttribute("type", "text/javascript");
						libraryScript.setAttribute("date", performance.now());
						libraryScript.innerText = body;
						document.head.appendChild(libraryScript);
					}
					this.initialize();
				});
			}, 15000);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			this.reseting = false;

			this.RelationshipUtils = BDFDB.WebModules.findByProperties("isBlocked", "isFriend");
			this.UserUtils = BDFDB.WebModules.findByProperties("getUsers", "getUser");
			this.MemberUtils = BDFDB.WebModules.findByProperties("getNicknames", "getNick");
			this.LastGuildStore = BDFDB.WebModules.findByProperties("getLastSelectedGuildId");
			this.LastChannelStore = BDFDB.WebModules.findByProperties("getLastSelectedChannelId");

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.reseting = true;

			BDFDB.WebModules.forceAllUpdates(this);

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	getNewName (info) {
		if (!info) return null;
		let settings = BDFDB.getAllData(this, "settings");
		let member = this.MemberUtils.getMember(this.LastGuildStore.getGuildId(), info.id) || {};
		let EditUsersData = (BDFDB.isPluginEnabled("EditUsers") ? BDFDB.loadData(info.id, "EditUsers", "users") : null) || {};
		if (this.reseting || !member.nick || info.id == BDFDB.myData.id && !settings.replaceOwn) return EditUsersData.name || member.nick || info.username;
		var username = EditUsersData.name || info.username;
		return settings.addNickname ? (settings.swapPositions ? (member.nick + " (" + username + ")") : (username + " (" + member.nick + ")")) : username;
	}

	processNameTag (instance, wrapper) {
		if (wrapper && !BDFDB.getParentEle(BDFDB.dotCNC.userprofile + BDFDB.dotCN.userpopout, wrapper)) {
			let username = wrapper.parentElement.querySelector("." + instance.props.usernameClass.replace(/ /g, "."));
			if (username) BDFDB.setInnerText(username, this.getNewName(instance.props.user));
		}
	}

	processMessageUsername (instance, wrapper) {
		let message = BDFDB.getReactValue(instance, "props.message");
		if (message) {
			let username = wrapper.querySelector(BDFDB.dotCN.messageusername);
			if (username) BDFDB.setInnerText(username, this.getNewName(message.author));
		}
	}

	processTypingUsers (instance, wrapper) {
		let users = !instance.props.typingUsers ? [] : Object.keys(instance.props.typingUsers).filter(id => id != BDFDB.myData.id).filter(id => !this.RelationshipUtils.isBlocked(id)).map(id => this.UserUtils.getUser(id)).filter(id => id != null);
		wrapper.querySelectorAll("strong").forEach((username, i) => {
			if (users[i] && username) BDFDB.setInnerText(username, this.getNewName(users[i]));
		});
	}

	processClickable (instance, wrapper) {
		if (!wrapper || !instance.props || !instance.props.className) return;
		if (instance.props.tag == "a" && instance.props.className.indexOf(BDFDB.disCN.anchorunderlineonhover) > -1) {
			if (BDFDB.containsClass(wrapper.parentElement, BDFDB.disCN.messagesystemcontent) && wrapper.parentElement.querySelector("a") == wrapper) {
				let message = BDFDB.getKeyInformation({node:wrapper.parentElement, key:"message", up:true});
				if (message) {
					BDFDB.setInnerText(wrapper, this.getNewName(message.author));
					if (message.mentions.length == 1) {
						let seconduser = this.UserUtils.getUser(message.mentions[0]);
						let secondwrapper = wrapper.parentElement.querySelectorAll("a")[1];
						if (seconduser && secondwrapper) BDFDB.setInnerText(secondwrapper, this.getNewName(seconduser));
					}
				}
			}
		}
		else if (instance.props.tag == "span" && instance.props.className.indexOf(BDFDB.disCN.mention) > -1) {
			let render = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.stateNode.props.render");
			if (typeof render == "function") BDFDB.setInnerText(wrapper, "@" + this.getNewName(render().props.user));
			if (typeof render == "function") {
				var props = render().props;
				if (props && props.user) BDFDB.setInnerText(wrapper, "@" + this.getNewName(props.user, wrapper));
				else if (props && props.userId) BDFDB.setInnerText(wrapper, "@" + this.getNewName(this.UserUtils.getUser(props.userId), wrapper));
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.voiceuser) > -1) {
			let user = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.user");
			if (user) {
				let username = wrapper.querySelector(BDFDB.dotCN.voicename);
				if (username) BDFDB.setInnerText(username, this.getNewName(user));
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.autocompleterow) > -1) {
			let user = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.user");
			if (user) {
				let username = wrapper.querySelector(BDFDB.dotCN.marginleft8);
				if (username) BDFDB.setInnerText(username, this.getNewName(user));
			}
		}
	}

	processStandardSidebarView (instance, wrapper) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			BDFDB.WebModules.forceAllUpdates(this);
		}
	}
}
