module.exports = (Plugin, Api, Vendor) => {
	if (typeof BDfunctionsDevilBro !== "object") global.BDfunctionsDevilBro = {$: Vendor.$, BDv2Api: Api};
	
	const {$} = Vendor;

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
				BDfunctionsDevilBro.loadMessage(this);
			
				var observer = null;

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.classList && node.classList.length > 0 && node.classList.contains("popout-2RRwAO")) {
										this.makeMoveable(node);
									}
								});
							}
						}
					);
				});
				BDfunctionsDevilBro.addObserver(this, ".popouts-1TN9u9", {name:"popoutObserver",instance:observer}, {childList: true});
				
				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.classList && node.classList.contains("modal-2LIEKY") && !node.querySelector(".downloadLink-wANcd8")) {
										this.makeMoveable(node.querySelector(".inner-1_1f7b"));
									}
									else if (node && node.tagName && node.querySelector(".modal-2LIEKY") && !node.querySelector(".downloadLink-wANcd8")) {
										this.makeMoveable(node.querySelector(".inner-1_1f7b"));
									}
								});
							}
						}
					);
				});
				BDfunctionsDevilBro.addObserver(this, ".app-XZYfmp ~ [class^='theme-']:not([class*='popouts-1TN9u9'])", {name:"modalObserver",instance:observer}, {childList: true});
				
				return true;
			}
			else {
				console.error(this.name + ": Fatal Error: Could not load BD functions!");
				return false;
			}
		}

		onStop() {
			if (typeof BDfunctionsDevilBro === "object") {				
				BDfunctionsDevilBro.unloadMessage(this);
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
							
						BDfunctionsDevilBro.appendLocalStyle("disableTextSelection", disableTextSelectionCSS);
						var left = div.getBoundingClientRect().left;
						var top = div.getBoundingClientRect().top;
						var oldX = e.pageX;
						var oldY = e.pageY;
						$(document)
							.off("mouseup." + this.name).off("mousemove." + this.name)
							.on("mouseup." + this.name, () => {
								BDfunctionsDevilBro.removeLocalStyle("disableTextSelection");
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
