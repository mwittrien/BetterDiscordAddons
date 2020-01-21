//META{"name":"BetterFriendCount","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterFriendCount","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterFriendCount/BetterFriendCount.plugin.js"}*//

class BetterFriendCount {
	getName () {return "BetterFriendCount";}

	getVersion () {return "1.2.0";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Shows the amount of total and online friends and blocked users in the friends tab.";}

	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};

		this.patchedModules = {
			after: {
				TabBar: "render",
				FriendRow: ["componentWillMount","componentWillUnmount"]
			}
		};
	}

	initConstructor () {
		this.relationshipTypes = {};
		for (let type in BDFDB.DiscordConstants.RelationshipTypes) this.relationshipTypes[BDFDB.DiscordConstants.RelationshipTypes[type]] = type;
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

			BDFDB.ModuleUtils.forceAllUpdates(this, "TabBar");
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.DOMUtils.remove(".betterfriendcount-badge");
			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	processTabBar (e) {
		if (e.returnvalue.props.children) for (let checkchild of e.returnvalue.props.children) if (checkchild && checkchild.props.id == "ADD_FRIEND") {
			let relationships = BDFDB.LibraryModules.FriendUtils.getRelationships(), relationshipCount = {};
			for (let type in this.relationshipTypes) relationshipCount[this.relationshipTypes[type]] = 0;
			for (let id in relationships) relationshipCount[this.relationshipTypes[relationships[id]]]++;
			for (let child of e.returnvalue.props.children) if (child && child.props.id != "ADD_FRIEND") {
				let newchildren = [Array.isArray(child.props.children) ? child.props.children[0] : child.props.children];
				switch (child.props.id) {
					case "ALL":
						newchildren.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BadgeComponents.NumberBadge, {
							className: BDFDB.disCN.settingstabbarbadge,
							count: relationshipCount.FRIEND
						}));
						break;
					case "ONLINE":
						newchildren.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BadgeComponents.NumberBadge, {
							className: BDFDB.disCN.settingstabbarbadge,
							count: BDFDB.LibraryModules.StatusMetaUtils.getOnlineFriendCount()
						}));
						break;
					case "PENDING":
						newchildren.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BadgeComponents.NumberBadge, {
							className: BDFDB.disCN.settingstabbarbadge,
							count: relationshipCount.PENDING_INCOMING
						}));
						newchildren.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BadgeComponents.NumberBadge, {
							className: BDFDB.disCN.settingstabbarbadge,
							count: relationshipCount.PENDING_OUTGOING
						}));
						break;
					case "BLOCKED":
						newchildren.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BadgeComponents.NumberBadge, {
							className: BDFDB.disCN.settingstabbarbadge,
							count: relationshipCount.BLOCKED
						}));
						break;
				}
				child.props.children = newchildren;
			}
		}
	}

	processFriendRow () {
		BDFDB.TimeUtils.clear(this.rerenderTimeout);
		this.rerenderTimeout = BDFDB.TimeUtils.timeout(_ => {
			delete this.rerenderTimeout;
			BDFDB.ModuleUtils.forceAllUpdates(this, "TabBar");
		}, 1000);
	}
}