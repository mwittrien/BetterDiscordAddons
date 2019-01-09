//META{"name":"BetterFriendCount"}*//

class BetterFriendCount {
	getName () {return "BetterFriendCount";}

	getVersion () {return "1.1.0";}

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
		var libraryScript = null;
		if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDFDB === "object") {		
			BDFDB.loadMessage(this);
			
			this.FriendUtils = BDFDB.WebModules.findByProperties("getFriendIDs", "getRelationships");
			this.UserMetaStore = BDFDB.WebModules.findByProperties("getStatus", "getOnlineFriendCount");
			let RelationshipTypes = BDFDB.WebModules.findByProperties("RelationshipTypes").RelationshipTypes;
			for (let type in RelationshipTypes) {
				this.relationshipTypes[RelationshipTypes[type]] = type;
			}
			
			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			BDFDB.removeEles(".betterfriendcount-badge");
			BDFDB.unloadMessage(this);
		}
	}
	
	
	// begin of own functions
	
	processTabBar (instance, wrapper) {
		if (instance.props && instance.props.children && instance.props.children[0].key == "ADD_FRIEND") this.addCountNumbers(wrapper);
	}
	
	processNameTag (instance, wrapper) {
		if (wrapper.parentElement && wrapper.parentElement.classList && wrapper.parentElement.classList.contains(BDFDB.disCN.friendscolumn)) this.addCountNumbers();
	}
	
	addCountNumbers (wrapper = document.querySelector(BDFDB.dotCNS.friends + BDFDB.dotCN.settingstabbar)) {
		if (!wrapper) return;
		let tabitems = wrapper.querySelectorAll(BDFDB.dotCN.settingsitem);
		if (!tabitems || tabitems.length < 5) return;
		BDFDB.removeEles(".betterfriendcount-badge");
		
		let relationships = this.FriendUtils.getRelationships(), relationshipCount = {};
		for (let type in this.relationshipTypes) relationshipCount[this.relationshipTypes[type]] = 0;
		for (let id in relationships) relationshipCount[this.relationshipTypes[relationships[id]]]++;
		
		$(`<div class="${BDFDB.disCN.badgewrapper} betterfriendcount-badge friendcount">${relationshipCount.FRIEND}</div>`).appendTo(tabitems[1]);
		$(`<div class="${BDFDB.disCN.badgewrapper} betterfriendcount-badge onlinefriendcount">${this.UserMetaStore.getOnlineFriendCount()}</div>`).appendTo(tabitems[2]);
		$(`<div class="${BDFDB.disCN.badgewrapper} betterfriendcount-badge requestincount">${relationshipCount.PENDING_INCOMING}</div>`).appendTo(tabitems[3]);
		$(`<div class="${BDFDB.disCN.badgewrapper} betterfriendcount-badge requestoutcount">${relationshipCount.PENDING_OUTGOING}</div>`).appendTo(tabitems[3]);
		$(`<div class="${BDFDB.disCN.badgewrapper} betterfriendcount-badge blockedcount">${relationshipCount.BLOCKED}</div>`).appendTo(tabitems[4]);
	}
}