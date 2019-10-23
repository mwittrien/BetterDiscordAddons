//META{"name":"BetterFriendCount","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterFriendCount","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterFriendCount/BetterFriendCount.plugin.js"}*//

class BetterFriendCount {
	getName () {return "BetterFriendCount";}

	getVersion () {return "1.1.8";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Shows the amount of total and online friends and blocked users in the friends tab.";}

	constructor () {
		this.changelog = {
			"fixed":[["Light Theme Update","Fixed bugs for the Light Theme Update, which broke 99% of my plugins"]]
		};

		this.patchModules = {
			"TabBar":"render",
			"FriendRow":["componentWillMount","componentWillUnmount"]
		};
	}

	initConstructor () {
		this.relationshipTypes = {};
		for (let type in BDFDB.DiscordConstants.RelationshipTypes) this.relationshipTypes[BDFDB.DiscordConstants.RelationshipTypes[type]] = type;
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
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);

			BDFDB.ModuleUtils.forceAllUpdates(this, 'TabBar');
		}
		else console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.DOMUtils.remove(".betterfriendcount-badge");
			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	processTabBar (instance, wrapper, returnvalue) {
		if (returnvalue && returnvalue.props.children) for (let checkchild of returnvalue.props.children) if (checkchild && checkchild.props.id == "ADD_FRIEND") {
			let relationships = BDFDB.LibraryModules.FriendUtils.getRelationships(), relationshipCount = {};
			for (let type in this.relationshipTypes) relationshipCount[this.relationshipTypes[type]] = 0;
			for (let id in relationships) relationshipCount[this.relationshipTypes[relationships[id]]]++;
			for (let child of returnvalue.props.children) if (child && child.props.id != "ADD_FRIEND") {
				let newchildren = [Array.isArray(child.props.children) ? child.props.children[0] : child.props.children];
				switch (child.props.id) {
					case "ALL":
						newchildren.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.NumberBadge, {
							className: BDFDB.disCN.settingstabbarbadge,
							count: relationshipCount.FRIEND
						}));
						break;
					case "ONLINE":
						newchildren.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.NumberBadge, {
							className: BDFDB.disCN.settingstabbarbadge,
							count: BDFDB.LibraryModules.StatusMetaUtils.getOnlineFriendCount()
						}));
						break;
					case "PENDING":
						newchildren.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.NumberBadge, {
							className: BDFDB.disCN.settingstabbarbadge,
							count: relationshipCount.PENDING_INCOMING
						}));
						newchildren.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.NumberBadge, {
							className: BDFDB.disCN.settingstabbarbadge,
							count: relationshipCount.PENDING_OUTGOING
						}));
						break;
					case "BLOCKED":
						newchildren.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.NumberBadge, {
							className: BDFDB.disCN.settingstabbarbadge,
							count: relationshipCount.BLOCKED
						}));
						break;
				}
				child.props.children = newchildren;
			}
		}
	}

	processFriendRow (instance, wrapper, returnvalue) {
		clearTimeout(this.rerenderTimeout);
		this.rerenderTimeout = setTimeout(() => {
			delete this.rerenderTimeout;
			BDFDB.ModuleUtils.forceAllUpdates(this, 'TabBar');
		}, 1000);
	}
}