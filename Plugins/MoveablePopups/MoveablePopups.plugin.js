//META{"name":"MoveablePopups"}*//

class MoveablePopups {
	constructor () {
		this.popoutObserver = new MutationObserver(() => {});
		this.modalObserver = new MutationObserver(() => {});
	}

	getName () {return "MoveablePopups";}

	getDescription () {return "Adds the feature to move all popups and modals around like on a normal desktop. Ctrl + drag with your left mousebutton to drag element.";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
		}
	}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
			
			this.popoutObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.classList && node.classList.length > 0 && node.classList.contains("popout")) {
									this.makeMoveable(node);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".popouts")) this.popoutObserver.observe(document.querySelector(".popouts"), {childList: true});
			
			this.modalObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector("[class*='modal']") && !node.querySelector(".modal-image")) {
									this.makeMoveable(node.querySelector("[class*='inner']"));
								}
							});
						}
					}
				);
			});
			if (document.querySelector("#app-mount > [class^='theme-']")) this.modalObserver.observe(document.querySelectorAll("#app-mount > [class^='theme-']")[document.querySelectorAll("#app-mount > [class^='theme-']").length-1], {childList: true});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.popoutObserver.disconnect();
			this.modalObserver.disconnect();
			
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
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
						
					BDfunctionsDevilBro.appendLocalStyle("disableTextSelection", disableTextSelectionCSS);
					var left = $(div).offset().left;
					var top = $(div).offset().top;
					var oldX = e.pageX;
					var oldY = e.pageY;
					$(document)
						.off("mouseup." + this.getName()).off("mousemove." + this.getName())
						.on("mouseup." + this.getName(), () => {
							BDfunctionsDevilBro.removeLocalStyle("disableTextSelection");
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