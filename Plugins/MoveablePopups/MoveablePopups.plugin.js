//META{"name":"MoveablePopups"}*//

class MoveablePopups {
	initConstructor () {
	}

	getName () {return "MoveablePopups";}

	getDescription () {return "Adds the feature to move all popups and modals around like on a normal desktop. Ctrl + drag with your left mousebutton to drag element.";}

	getVersion () {return "1.1.0";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDFDB !== "object" || BDFDB.isLibraryOutdated()) {
			if (typeof BDFDB === "object") BDFDB = "";
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDFDB === "object") {
			BDFDB.loadMessage(this);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.classList && node.classList.length > 0 && node.classList.contains(BDFDB.disCN.popout)) {
									this.makeMoveable(node);
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.popouts, {name:"popoutObserver",instance:observer}, {childList: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.classList && node.classList.contains(BDFDB.disCN.modal) && !node.querySelector(BDFDB.dotCN.downloadlink)) {
									this.makeMoveable(node.querySelector(BDFDB.dotCN.modalinner));
								}
								else if (node && node.tagName && node.querySelector(BDFDB.dotCN.modal) && !node.querySelector(BDFDB.dotCN.downloadlink)) {
									this.makeMoveable(node.querySelector(BDFDB.dotCN.modalinner));
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.app + " ~ [class^='theme-']:not([class*='popouts'])", {name:"modalObserver",instance:observer}, {childList: true});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDFDB === "object") {
			BDFDB.unloadMessage(this);
		}
	}

	
	// begin of own functions
	
	makeMoveable (div) {
		$(div)
			.off("mousedown." + this.getName()).off("click." + this.getName())
			.on("click." + this.getName(), (e) => {
				if (this.dragging) {
					e.stopPropagation();
					e.preventDefault();
				}
			})
			.on("mousedown." + this.getName(), (e) => {
				if (e.ctrlKey) {
					this.dragging = true;
					
					var disableTextSelectionCSS = `
						* {
							user-select: none !important;
						}`;
						
					BDFDB.appendLocalStyle("disableTextSelection", disableTextSelectionCSS);
					var left = div.getBoundingClientRect().left;
					var top = div.getBoundingClientRect().top;
					var oldX = e.pageX;
					var oldY = e.pageY;
					$(document)
						.off("mouseup." + this.getName()).off("mousemove." + this.getName())
						.on("mouseup." + this.getName(), () => {
							BDFDB.removeLocalStyle("disableTextSelection");
							$(document).off("mouseup." + this.getName()).off("mousemove." + this.getName());
							setTimeout(() => {this.dragging = false},1);
						})
						.on("mousemove." + this.getName(), (e2) => {
							var newX = e2.pageX;
							var newY = e2.pageY;
							left = left - (oldX - newX);
							top = top - (oldY - newY);
							oldX = newX;
							oldY = newY;
							$(div).offset({"left":left,"top":top});
						});
				}
			});
	}
}