module.exports = (Plugin, Api, Vendor) => {
	if (typeof BDfunctionsDevilBro !== "object") global.BDfunctionsDevilBro = {$: Vendor.$, BDv2Api: Api};
	
	const {$} = Vendor;
		
	var relationshipTypes = {};

	return class extends Plugin {
		onStart() {
			var libraryScript = null;
			if (typeof BDfunctionsDevilBro !== "object" || typeof BDfunctionsDevilBro.isLibraryOutdated !== "function" || BDfunctionsDevilBro.isLibraryOutdated()) {
				libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]');
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js");
				document.head.appendChild(libraryScript);
			}
			this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
			if (typeof BDfunctionsDevilBro === "object" && typeof BDfunctionsDevilBro.isLibraryOutdated === "function") this.initialize();
			else libraryScript.addEventListener("load", () => {this.initialize();});
			return true;
		}
		
		initialize() {
			if (typeof BDfunctionsDevilBro === "object") {
				this.css = `
					#friends .tab-bar-item .badge:not(.betterfriendcount-badge) {
						display: none !important;
					}
				`;
				this.relationshipTypes = {};
				
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
				
				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							this.addCountNumbers();
						}
					);
				});
				BDfunctionsDevilBro.addObserver(this, ".friends-online", {name:"friendCountObserver",instance:observer}, {childList:true, subtree:true, characterData:true});
				
				this.FriendUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getFriendIDs", "getRelationships"]);
				this.UserMetaStore = BDfunctionsDevilBro.WebModules.findByProperties(["getStatuses", "getOnlineFriendCount"]);
				var RelationshipTypes = BDfunctionsDevilBro.WebModules.findByProperties(["RelationshipTypes"]).RelationshipTypes;
				for (let type in RelationshipTypes) {
					this.relationshipTypes[RelationshipTypes[type]] = type;
				}
				this.addCountNumbers();
				
				return true;
			}
			else {
				console.error(this.name + ": Fatal Error: Could not load BD functions!");
				return false;
			}
		}

		onStop() {
			if (typeof BDfunctionsDevilBro === "object") {
				document.querySelectorAll(".betterfriendcount-badge").forEach(counter => {counter.remove();});
						
				BDfunctionsDevilBro.unloadMessage(this);
				return true;
			}
			else {
				return false;
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
			friendstabbar.querySelectorAll(".betterfriendcount-badge").forEach(counter => {counter.remove();});
			
			var relationships = this.FriendUtils.getRelationships(), relationshipCount = {};
			for (let type in this.relationshipTypes) {relationshipCount[this.relationshipTypes[type]] = 0;}
			for (let id in relationships) {relationshipCount[this.relationshipTypes[relationships[id]]]++;}
			
			var tabitems = friendstabbar.querySelectorAll(".tab-bar-item");
			$(`<div class="badge betterfriendcount-badge friendcount">${relationshipCount.FRIEND}</div>`).appendTo(tabitems[1]);
			$(`<div class="badge betterfriendcount-badge onlinefriendcount">${this.UserMetaStore.getOnlineFriendCount()}</div>`).appendTo(tabitems[2]);
			$(`<div class="badge betterfriendcount-badge requestincount">${relationshipCount.PENDING_INCOMING}</div>`).appendTo(tabitems[3]);
			$(`<div class="badge betterfriendcount-badge requestoutcount">${relationshipCount.PENDING_OUTGOING}</div>`).appendTo(tabitems[3]);
			$(`<div class="badge betterfriendcount-badge blockedcount">${relationshipCount.BLOCKED}</div>`).appendTo(tabitems[4]);
		}
	}
};
