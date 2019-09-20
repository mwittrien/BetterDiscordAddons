//META{"name":"BetterFriendCount","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterFriendCount","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterFriendCount/BetterFriendCount.plugin.js"}*//

class BetterFriendCount {
	getName () {return "BetterFriendCount";}

	getVersion () {return "1.1.7";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Shows the amount of total and online friends and blocked users in the friends tab.";}

	constructor () {
		this.changelog = {
			"fixed":[["Light Theme Update","Fixed bugs for the Light Theme Update, which broke 99% of my plugins"]]
		};

		this.patchModules = {
			"TabBar":"componentDidMount",
			"FriendRow":["componentWillMount","componentWillUnmount"]
		};
	}

	initConstructor () {
		this.css = `
			${BDFDB.dotCNS.friends + BDFDB.dotCNS.settingstabbar + BDFDB.dotCN.settingstabbarbadge}:not(.betterfriendcount-badge) {
				display: none !important;
			}
			${BDFDB.dotCNS.friends + BDFDB.dotCNS.settingstabbar + BDFDB.dotCN.settingstabbarbadge}.betterfriendcount-badge {
				margin-left: 5px !important;
			}
		`;

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
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
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

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".betterfriendcount-badge");
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	processTabBar (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.children) for (let child of instance.props.children) if ((child.key || (child.props && child.props.id)) == "ADD_FRIEND") this.addCountNumbers(wrapper);
	}

	processFriendRow (instance, wrapper, returnvalue) {
		this.addCountNumbers();
	}

	addCountNumbers (wrapper = document.querySelector(BDFDB.dotCNS.friends + BDFDB.dotCN.settingstabbar)) {
		if (!wrapper) return;
		let tabitems = wrapper.querySelectorAll(BDFDB.dotCN.settingsitem + BDFDB.dotCN.settingsitemthemed);
		if (!tabitems || tabitems.length < 4) return;
		BDFDB.removeEles(".betterfriendcount-badge");

		let relationships = BDFDB.LibraryModules.FriendUtils.getRelationships(), relationshipCount = {};
		for (let type in this.relationshipTypes) relationshipCount[this.relationshipTypes[type]] = 0;
		for (let id in relationships) relationshipCount[this.relationshipTypes[relationships[id]]]++;
		for (let item of tabitems) switch (BDFDB.getReactValue(item, "return.memoizedProps.id") || BDFDB.getReactValue(item, "return.return.memoizedProps.id")) {
			case "ALL":
				item.appendChild(this.createBadge(relationshipCount.FRIEND, "friendcount"));
				break;
			case "ONLINE":
				item.appendChild(this.createBadge(BDFDB.LibraryModules.StatusMetaUtils.getOnlineFriendCount(), "onlinefriendcount"));
				break;
			case "PENDING":
				item.appendChild(this.createBadge(relationshipCount.PENDING_INCOMING, "requestincount"));
				item.appendChild(this.createBadge(relationshipCount.PENDING_OUTGOING, "requestoutcount"));
				break;
			case "BLOCKED":
				item.appendChild(this.createBadge(relationshipCount.BLOCKED, "blockedcount"));
				break;
		}
	}

	createBadge (amount, type) {
		return BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.settingstabbarbadge + BDFDB.disCN.guildbadgenumberbadge} betterfriendcount-badge ${type}" style="background-color: rgb(240, 71, 71); width: ${amount > 99 ? 30 : (amount > 9 ? 22 : 16)}px; padding-right: ${amount > 99 ? 0 : (amount > 9 ? 0 : 1)}px;">${amount}</div>`)
	}
}