//META{"name":"BetterFriendCount","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterFriendCount","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterFriendCount/BetterFriendCount.plugin.js"}*//

class BetterFriendCount {
	getName () {return "BetterFriendCount";}

	getVersion () {return "1.1.1";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Shows the amount of total and online friends and blocked users in the friends tab.";}

	initConstructor () {
		this.patchModules = {
			"TabBar":"componentDidMount",
			"NameTag":["componentWillMount","componentWillUnmount"]
		};

		this.css = `
			${BDFDB.dotCNS.friends + BDFDB.dotCNS.settingstabbar + BDFDB.dotCN.badge}:not(.betterfriendcount-badge), 
			${BDFDB.dotCNS.friends + BDFDB.dotCNS.settingstabbar + BDFDB.dotCN.badgewrapper}:not(.betterfriendcount-badge) {
				display: none !important;
			}
			${BDFDB.dotCNS.friends + BDFDB.dotCNS.settingstabbar + BDFDB.dotCN.badgewrapper}.betterfriendcount-badge {
				margin-left: 5px !important;
			}
		`;

		this.relationshipTypes = {};
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			this.FriendUtils = BDFDB.WebModules.findByProperties("getFriendIDs", "getRelationships");
			this.UserMetaStore = BDFDB.WebModules.findByProperties("getStatus", "getOnlineFriendCount");
			let RelationshipTypes = BDFDB.WebModules.findByProperties("RelationshipTypes").RelationshipTypes;
			for (let type in RelationshipTypes) this.relationshipTypes[RelationshipTypes[type]] = type;

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

	processTabBar (instance, wrapper) {
		if (instance.props && instance.props.children && instance.props.children[0].key == "ADD_FRIEND") this.addCountNumbers(wrapper);
	}

	processNameTag (instance, wrapper) {
		if (wrapper.parentElement && BDFDB.containsClass(wrapper.parentElement, BDFDB.disCN.friendscolumn)) this.addCountNumbers();
	}

	addCountNumbers (wrapper = document.querySelector(BDFDB.dotCNS.friends + BDFDB.dotCN.settingstabbar)) {
		if (!wrapper) return;
		let tabitems = wrapper.querySelectorAll(BDFDB.dotCN.settingsitem);
		if (!tabitems || tabitems.length < 5) return;
		BDFDB.removeEles(".betterfriendcount-badge");

		let relationships = this.FriendUtils.getRelationships(), relationshipCount = {};
		for (let type in this.relationshipTypes) relationshipCount[this.relationshipTypes[type]] = 0;
		for (let id in relationships) relationshipCount[this.relationshipTypes[relationships[id]]]++;
		let badgeclass = BDFDB.disCN.badgewrapper;
		tabitems[1].appendChild(BDFDB.htmlToElement(`<div class="${badgeclass} betterfriendcount-badge friendcount">${relationshipCount.FRIEND}</div>`));
		tabitems[2].appendChild(BDFDB.htmlToElement(`<div class="${badgeclass} betterfriendcount-badge onlinefriendcount">${this.UserMetaStore.getOnlineFriendCount()}</div>`));
		tabitems[3].appendChild(BDFDB.htmlToElement(`<div class="${badgeclass} betterfriendcount-badge requestincount">${relationshipCount.PENDING_INCOMING}</div>`));
		tabitems[3].appendChild(BDFDB.htmlToElement(`<div class="${badgeclass} betterfriendcount-badge requestoutcount">${relationshipCount.PENDING_OUTGOING}</div>`));
		tabitems[4].appendChild(BDFDB.htmlToElement(`<div class="${badgeclass} betterfriendcount-badge blockedcount">${relationshipCount.BLOCKED}</div>`));
	}
}