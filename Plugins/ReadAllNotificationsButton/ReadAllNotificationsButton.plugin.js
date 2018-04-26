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
		
		this.defaults = {
			settings: {
				includeMuted:	{value:false, 	description:"Include muted Servers (means more API-Requests):"}
			}
		};
	}

	getName () {return "ReadAllNotificationsButton";}

	getDescription () {return "Adds a button to clear all notifications.";}

	getVersion () {return "1.3.2";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settings = BDfunctionsDevilBro.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);});
		return settingspanel;
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
								if (node && node.tagName && (mentionspopout = node.querySelector(".recent-mentions-popout, .recentMentionsPopout-3QkZEg")) != null) {
									$(this.RAMbuttonMarkup).insertBefore(".mention-filter, .mentionFilter-wE0FR9", mentionspopout)
										.on("click", () => {
											var loadinterval = setInterval(() => {
												if (!mentionspopout || !mentionspopout.parentElement) clearInterval(loadinterval);
												var loadbutton = mentionspopout.querySelector(".has-more button, .hasMore-17LQIb button");
												var closebuttons = mentionspopout.querySelectorAll(".close-button, .closeButton-2Rx3ov");
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
			BDfunctionsDevilBro.addObserver(this, ".popouts, .popouts-1TN9u9", {name:"mentionsPopoutObserver",instance:observer}, {childList: true});
			
			$(this.RANbuttonMarkup).insertBefore(".guild-separator")
				.on("click", "#RANbutton", () => {
					let servers = BDfunctionsDevilBro.getData("includeMuted", this, "settings") ? BDfunctionsDevilBro.readServerList() : BDfunctionsDevilBro.readUnreadServerList();
					BDfunctionsDevilBro.clearReadNotifications(servers);
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
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(".checkbox-1KYsPm")) {
			settings[input.value] = input.checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, this, "settings");
	}
}
