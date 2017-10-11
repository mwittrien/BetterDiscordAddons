//META{"name":"FixTwitchEmotes"}*//

class FixTwitchEmotes {
	constructor () {
		this.emojiPickerObserver = new MutationObserver(() => {});
	}

	getName () {return "FixTwitchEmotes";}

	getDescription () {return "Fixes the problem with twitch emotes not being properly inserted in the textarea.";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}

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
			this.emojiPickerObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.classList && node.classList.contains("popout") && $(node).find(".emoji-picker").length != 0) {
									this.addClickListeners(node);
								}
							});
						}
					}
				);
			});
			this.emojiPickerObserver.observe($(".tooltips").parent()[0], {childList: true, subtree: true});
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.emojiPickerObserver.disconnect();
		}
	}

	
	// begin of own functions
	
	addClickListeners (picker) {
		var textarea = $(".channel-text-area-default").find("textarea");
		if (textarea) {
			$(picker).find("img.emote-icon").each((_,emote) => {
				$(emote)
					.off("click." + this.getName())
					.on("click." + this.getName(), (e) => {
						textarea.focus();
						document.execCommand("insertText", false, " " + emote.title);
					});
			});
		}
	}
}