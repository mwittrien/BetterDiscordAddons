module.exports = (Plugin, Api, Vendor) => {
	if (!global.BDFDB || typeof BDFDB != "object") global.BDFDB = {BDv2Api: Api};

	return class extends Plugin {
		onStart () {
			var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", () => {
					BDFDB.loaded = true;
					this.initialize();
				});
				document.head.appendChild(libraryScript);
			}
			else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		}

		initialize () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
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

				return true;
			}
			else {
				console.error(`%c[${this.name}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
				return false;
			}
		}


		onStop () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}


		// begin of own functions

		makeMoveable (div) {
			$(div)
				.off("mousedown." + this.name).off("click." + this.name)
				.on("click." + this.name, (e) => {
					if (this.dragging) {
						e.stopPropagation();
						e.preventDefault();
					}
				})
				.on("mousedown." + this.name, (e) => {
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
							.off("mouseup." + this.name).off("mousemove." + this.name)
							.on("mouseup." + this.name, () => {
								BDFDB.removeLocalStyle("disableTextSelection");
								$(document).off("mouseup." + this.name).off("mousemove." + this.name);
								setTimeout(() => {this.dragging = false},1);
							})
							.on("mousemove." + this.name, (e2) => {
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
};
