//META{"name":"MoveablePopups"}*//

class MoveablePopups {
	getName () {return "MoveablePopups";}

	getVersion () {return "1.1.1";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds the feature to move all popups and modals around like on a normal desktop. Ctrl + drag with your left mousebutton to drag element.";}

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
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && BDFDB.containsClass(node, BDFDB.disCN.popout)) {
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
								if (node && BDFDB.containsClass(node, BDFDB.disCN.modal) && !node.querySelector(BDFDB.dotCN.downloadlink)) {
									this.makeMoveable(node.querySelector(BDFDB.dotCN.modalinner));
								}
								else if (node.tagName && node.querySelector(BDFDB.dotCN.modal) && !node.querySelector(BDFDB.dotCN.downloadlink)) {
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
		div.removeEventListener("click", div.clickMovablePopups);
		div.removeEventListener("mousedown", div.mousedownMovablePopups);
		div.clickMovablePopups = e => {
			if (this.dragging) {
				e.stopPropagation();
				e.preventDefault();
			}
		};
		div.mousedownMovablePopups = e => {
			if (!e.ctrlKey) return;
			div.style.setProperty("position", "fixed", "important");
			this.dragging = true;
			var rects = div.getBoundingClientRect();
			var transform = getComputedStyle(div,null).getPropertyValue("transform").replace(/[^0-9,-]/g,"").split(",");
			var left = rects.left - (transform.length > 4 ? parseFloat(transform[4]) : 0);
			var top = rects.top - (transform.length > 4 ? parseFloat(transform[5]) : 0);
			var oldX = e.pageX;
			var oldY = e.pageY;
			var mouseup = e2 => {
				BDFDB.removeLocalStyle("disableTextSelection");
				document.removeEventListener("mouseup", mouseup);
				document.removeEventListener("mousemove", mousemove);
				setTimeout(() => {this.dragging = false},1);
			};
			var mousemove = e2 => {
				left = left - (oldX - e2.pageX);
				top = top - (oldY - e2.pageY);
				oldX = e2.pageX;
				oldY = e2.pageY;
				div.style.setProperty("left", left + "px", "important");
				div.style.setProperty("top", top + "px", "important");
				
			};
			document.addEventListener("mouseup", mouseup);
			document.addEventListener("mousemove", mousemove);
		};
		div.addEventListener("click", div.clickMovablePopups);
		div.addEventListener("mousedown", div.mousedownMovablePopups);
	}
}