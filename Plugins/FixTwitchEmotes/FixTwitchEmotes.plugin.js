//META{"name":"FixTwitchEmotes"}*//

class FixTwitchEmotes {
	constructor () {
	}

	getName () {return "FixTwitchEmotes";}

	getDescription () {return "Fixes the problem with twitch emotes not being properly inserted in the textarea.";}

	getVersion () {return "2.1.4";}

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
								if (node && node.tagName && node.querySelector(".emoji-picker, .emojiPicker-3g68GS")) {
									$(node).find(".emote-icon").each((_,emote) => {if ($._data(emote, 'events').click) delete $._data(emote, 'events').click;});
									$(node).on("click." + this.getName(), "#bda-qem button", (e) => {
										$(node).find(".emote-icon").each((_,emote) => {if ($._data(emote, 'events').click) delete $._data(emote, 'events').click;});
									});
									var textarea = document.querySelector(".channelTextArea-1HTP3C textarea");
									if (textarea) {
										var textareaInstance = BDfunctionsDevilBro.getOwnerInstance({"node":textarea, "name":"ChannelTextAreaForm", "up":true});
										$(node).on("click." + this.getName(), ".emote-icon", (e) => {
											textareaInstance.setState({textValue:textarea.value.length > 0 ? textarea.value + " " + e.target.title : e.target.title});
										});
									}
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".popouts", {name:"emojiPickerObserver",instance:observer}, {childList: true});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
}
