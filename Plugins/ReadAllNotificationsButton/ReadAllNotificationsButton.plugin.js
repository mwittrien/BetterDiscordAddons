//META{"name":"ReadAllNotificationsButton"}*//

class ReadAllNotificationsButton {
	constructor () {
		this.RANbuttonMarkup = 
			`<div class="guild" id="RANbutton-frame" style="height: 20px; width: 50px; margin-bottom: 10px;">
				<div class="guild-inner" style="height: 20px; width: 50px; border-radius: 4px;">
					<a>
						<div id="RANbutton" style="line-height: 20px; font-size: 12px;">read all</div>
					</a>
				</div>
			</div>`;
			
		this.RAMbuttonMarkup = 
			`<button type="button" id="RAMbutton" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMin-1Wh1KC grow-25YQ8u" style="flex: 0 0 auto; margin-top: -5px; height: 25px;">
				<div class="contents-4L4hQM">Clear all Mentions</div>
			</button>`;
	}

	getName () {return "ReadAllNotificationsButton";}

	getDescription () {return "Adds a button to clear all notifications.";}

	getVersion () {return "1.2.8";}

	getAuthor () {return "DevilBro";}

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
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
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
								var mentionspopout = null;
								if (node && node.tagName && (mentionspopout = node.querySelector(".recent-mentions-popout")) != null) {
									$(this.RAMbuttonMarkup).insertBefore(".mention-filter", mentionspopout)
										.on("click", () => {
											var loadinterval = setInterval(() => {
												if (!mentionspopout || !mentionspopout.parentElement) clearInterval(loadinterval);
												var loadbutton = mentionspopout.querySelector(".has-more button");
												var closebuttons = mentionspopout.querySelectorAll(".close-button");
												if (!loadbutton) {
													closebuttons.forEach((btn) => {btn.click();});
													clearInterval(loadinterval);
												}
												else {
													closebuttons.forEach((btn,i) => {if (closebuttons.length-1 > i) btn.click();});
													loadbutton.click();
												}
											},2000);
										});
									mentionspopout.classList.add("RAM-added");
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".popouts", {name:"mentionsPopoutObserver",instance:observer}, {childList: true});
			
			$(this.RANbuttonMarkup).insertBefore(".guild-separator")
				.on("click", "#RANbutton", () => {
					BDfunctionsDevilBro.clearReadNotifications(BDfunctionsDevilBro.readUnreadServerList());
				});
				
			$(".guilds.scroller").addClass("RAN-added");
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			$("#RANbutton-frame, #RAMbutton").remove();
			
			$(".RAN-added").removeClass("RAN-added");
			$(".RAM-added").removeClass("RAM-added");
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
}
