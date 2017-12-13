//META{"name":"FixTwitchEmotes"}*//

class FixTwitchEmotes {
	constructor () {
		this.emojiPickerObserver = new MutationObserver(() => {});
	}

	getName () {return "FixTwitchEmotes";}

	getDescription () {return "Fixes the problem with twitch emotes not being properly inserted in the textarea.";}

	getVersion () {return "2.1.2";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"></script>');
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			this.emojiPickerObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".emoji-picker")) {
									$("img.emote-icon").each((_,emote) => {if ($._data(emote, 'events').click) delete $._data(emote, 'events').click;});
									$(node).on("click." + this.getName(), "#bda-qem button", (e) => {
										$("img.emote-icon").each((_,emote) => {if ($._data(emote, 'events').click) delete $._data(emote, 'events').click;});
									});
									var textarea = document.querySelector(".channelTextArea-1HTP3C textarea");
									if (textarea) {
										var textareaInstance = BDfunctionsDevilBro.getOwnerInstance({"node":textarea, "name":"ChannelTextAreaForm", "up":true});
										$(node).on("click." + this.getName(), "img.emote-icon", (e) => {
											textareaInstance.setState({textValue:textarea.value.length > 0 ? textarea.value + " " + e.target.title : e.target.title});
										});
									}
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".popouts")) this.emojiPickerObserver.observe(document.querySelector(".popouts"), {childList: true});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.emojiPickerObserver.disconnect();
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
}
