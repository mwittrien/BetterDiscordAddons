//META{"name":"ReadAllNotificationsButton"}*//

class ReadAllNotificationsButton {
	constructor () {
		this.RANbuttonMarkup = 
			`<div class="guild" id="RANbutton-frame" style="height: 20px; margin-bottom: 10px;">
				<div class="guild-inner" style="height: 20px; border-radius: 4px;">
					<a>
						<div id="RANbutton" style="line-height: 20px; font-size: 12px;">read all</div>
					</a>
				</div>
			</div>`;
	}

	getName () {return "ReadAllNotificationsButton";}

	getDescription () {return "Adds a button to clear all notifications.";}

	getVersion () {return "1.2.6";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBroBeta.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBroBeta.js"></script>');
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
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
			$("#RANbutton-frame").remove();
			
			$(".guilds.scroller").removeClass("RAN-added");
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
}
