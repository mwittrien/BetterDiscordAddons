//META{"name":"ReadAllNotificationsButton"}*//

class ReadAllNotificationsButton {
	constructor () {
		this.mentionsPopoutObserver = new MutationObserver(() => {});
		
		this.RANbuttonMarkup = 
			`<div class="guild" id="RANbutton-frame" style="height: 20px; margin-bottom: 10px;">
				<div class="guild-inner" style="height: 20px; border-radius: 4px;">
					<a>
						<div id="RANbutton" style="line-height: 20px; font-size: 12px;">read all</div>
					</a>
				</div>
			</div>`;
			
		this.RAMbuttonMarkup = 
			`<button type="button" id="RAMbutton" class="flexChild-1KGW5q buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMin-1Wh1KC grow-25YQ8u" style="flex: 0 0 auto; margin-top: -5px; height: 25px;">
				<div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx">Clear all Mentions</div>
			</button>`;
	}

	getName () {return "ReadAllNotificationsButton";}

	getDescription () {return "Adds a button to clear all notifications.";}

	getVersion () {return "1.2.7";}

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
		if (typeof BDfunctionsDevilBro === "object") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			var observertarget = null;
			
			this.mentionsPopoutObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								var mentionspopout = null;
								if (node && node.tagName && (mentionspopout = node.querySelector(".recent-mentions-popout")) != null) {
									$(this.RAMbuttonMarkup).insertBefore(".mention-filter", mentionspopout)
										.on("click", () => {
											mentionspopout.querySelectorAll(".close-button").forEach(btn => {btn.click();});
										});
									mentionspopout.classList.add("RAM-added");
								}
							});
						}
					}
				);
			});
			if (observertarget = document.querySelector(".popouts")) this.mentionsPopoutObserver.observe(observertarget, {childList: true});
			
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
			this.mentionsPopoutObserver.disconnect();
			
			$("#RANbutton-frame, #RAMbutton").remove();
			
			$(".guilds.scroller").removeClass("RAN-added");
			$(".recent-mentions-popout").removeClass("RAM-added");
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
}
