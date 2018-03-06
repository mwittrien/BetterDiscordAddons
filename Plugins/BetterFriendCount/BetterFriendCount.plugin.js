//META{"name":"BetterFriendCount"}*//

class BetterFriendCount {
	constructor () {
	}

	getName () {return "BetterFriendCount";}

	getDescription () {return "Shows the amount of total and online friends and blocked users in the friends tab.";}

	getVersion () {return "1.0.1";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
	}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js");
			document.head.appendChild(libraryScript);
		}
		if (typeof BDfunctionsDevilBro === "object") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			var observer = null;
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".friends-column")) {
									this.addCountNumbers();
								}
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".friends-column")) {
									this.addCountNumbers();
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, "#friends", {name:"friendListObserver",instance:observer}, {childList:true, subtree:true});
			
			this.FriendUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getFriendIDs", "getRelationships"]);
			this.UserMetaStore = PluginUtilities.WebpackModules.findByUniqueProperties(["getStatuses", "getOnlineFriendCount"]);
			
			this.addCountNumbers();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			document.querySelectorAll(".betterfriendcount-number").forEach(counter => {counter.remove();});
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		this.addCountNumbers();
		
		BDfunctionsDevilBro.addObserver(this, "#friends", {name:"friendListObserver"}, {childList:true, subtree:true});
	}
	
	// begin of own functions
	
	addCountNumbers () {
		var friendstabbar = document.querySelector("#friends .tab-bar");
		if (!friendstabbar) return;
		friendstabbar.querySelectorAll(".betterfriendcount-number").forEach(counter => {counter.remove();});
		var relationships = this.FriendUtils.getRelationships();
		var onlineFriendCount = this.UserMetaStore.getOnlineFriendCount(), friendCount = 0, blockedCount = 0;
		for (let id in relationships) {
			if (relationships[id] == 1) friendCount++;
			if (relationships[id] == 2) blockedCount++;
		}
		var tabitems = friendstabbar.querySelectorAll(".tab-bar-item");
		$(`<div class="badge betterfriendcount-number friendcount">${friendCount}</div>`).appendTo(tabitems[1]);
		$(`<div class="badge betterfriendcount-number onlinefriendcount">${onlineFriendCount}</div>`).appendTo(tabitems[2]);
		$(`<div class="badge betterfriendcount-number blockedcount">${blockedCount}</div>`).appendTo(tabitems[4]);
	}
}
