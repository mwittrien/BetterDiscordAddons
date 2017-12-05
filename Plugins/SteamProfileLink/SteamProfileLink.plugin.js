//META{"name":"SteamProfileLink"}*//

class SteamProfileLink {
	constructor () {
	}

	getName () {return "SteamProfileLink";}

	getDescription () {return "Opens a steam profile in steam instead of a browser when clicking the steamlink in a userprofile. With the help of square.";}

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
			
			$(document).on("click." + this.getName(), "a[href^='https://steamcommunity.com/profiles/']", (e) => {
				if (require("electron").shell.openExternal("steam://openurl/" + e.currentTarget.href)) {
					e.preventDefault();
					e.stopImmediatePropagation();
				}
			});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
			$(document).off("click." + this.getName(), "a[href^='https://steamcommunity.com/profiles/']");
		}
	}

	
	// begin of own functions
}