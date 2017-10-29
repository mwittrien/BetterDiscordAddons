//META{"name":"FixGermanTranslation"}*//

class FixGermanTranslation {
	constructor () {
		this.serverContextObserver = new MutationObserver(() => {});
	}

	getName () {return "FixGermanTranslation";}

	getDescription () {return "Fixes some german translation errors.";}

	getVersion () {return "1.1.6";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	unload () {}

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
			
			setTimeout(() => {
				if (BDfunctionsDevilBro.getDiscordLanguage().id == "de") {
					this.serverContextObserver = new MutationObserver((changes, _) => {
						changes.forEach(
							(change, i) => {
								if (change.addedNodes) {
									change.addedNodes.forEach((node) => {
										if (node.nodeType == 1 && node.className.includes("context-menu")) {
											this.onContextMenu(node);
										}
									});
								}
							}
						);
					});
					if (document.querySelector(".app")) this.serverContextObserver.observe(document.querySelector(".app"), {childList: true});
				}
			},5000);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.serverContextObserver.disconnect();
			
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
		}
	}

	
	// begin of own functions
	
	onContextMenu (context) {
		var serverData = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"guild"});
		var contextType = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"displayName", "value":"GuildLeaveGroup"});
		
		if (serverData && contextType) {
			var allLabels = Array.from(context.getElementsByClassName("label"));
			allLabels.forEach(
				(label) => {
					if (label.innerText.indexOf("Serverweit Mikrofone deaktivieren") != -1) {
						label.innerText = "Server stummschalten";
					}
					if (label.innerText.indexOf("Hide Muted Channels") != -1) {
						label.innerText = "Verstecke stumme Kanäle";
					}
				}
			);
		}
	}
}
