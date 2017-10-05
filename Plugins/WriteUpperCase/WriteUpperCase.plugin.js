//META{"name":"WriteUpperCase"}*//

class WriteUpperCase {
	constructor () {
		this.serverSwitchObserver = new MutationObserver(() => {});
		this.channelSwitchObserver = new MutationObserver(() => {});
		this.inputEventHandler;
		this.eventFired = false;
	}

	getName () {return "WriteUpperCase";}

	getDescription () {return "Change input to uppercase.";}

	getVersion () {return "1.0.1";}

	getAuthor () {return "DevilBro";}

	start () {
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			this.serverSwitchObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.type == "attributes" && change.attributeName == "class" && change.oldValue && change.oldValue.indexOf("guild") != -1) {
							var serverData = BDfunctionsDevilBro.getKeyInformation({"node":change.target, "key":"guild"});
							if (serverData) {
								this.bindEventToTextArea();
								if ($(".chat").length != 0) this.channelSwitchObserver.observe($(".chat")[0], {childList:true, subtree:true});
							}
						}
					}
				);
			});
			this.serverSwitchObserver.observe($(".guilds.scroller")[0], {subtree:true, attributes:true, attributeOldValue:true});
			
			this.channelSwitchObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if ($(node).find(".messages.scroller").length > 0) {
									this.bindEventToTextArea();
								}
							});
						}
					}
				);
			});
			if ($(".chat").length != 0) this.channelSwitchObserver.observe($(".chat")[0], {childList:true, subtree:true});
					
			this.inputEventHandler = (e) => {
				if (!this.eventFired) {
					this.eventFired = true;
					var string = e.target.value;
					if (string.length > 0) {
						var first = string.charAt(0);
						if (first === first.toUpperCase() && e.target.value.toLowerCase().indexOf("http") == 0) {
							var position = e.target.selectionStart;
							e.target.value = "";
							document.execCommand("insertText", false, string.charAt(0).toLowerCase() + string.slice(1));
							e.target.selectionStart = position;
							e.target.selectionEnd = position;
						}
						else if (first === first.toLowerCase() && first !== first.toUpperCase() && e.target.value.toLowerCase().indexOf("http") != 0) {
							var position = e.target.selectionStart;
							e.target.value = "";
							document.execCommand("insertText", false, string.charAt(0).toUpperCase() + string.slice(1));
							e.target.selectionStart = position;
							e.target.selectionEnd = position;
						}
					} 
					this.eventFired = false;
				}
			};			
			
			this.bindEventToTextArea();
								
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.serverSwitchObserver.disconnect();
			this.channelSwitchObserver.disconnect();
			$("textarea.textArea-20yzAH").unbind("keyup", this.inputEventHandler);
		}
	}

	load () {}

	
	// begin of own functions
	
	bindEventToTextArea () {
		$("textarea.textArea-20yzAH").unbind("keyup", this.inputEventHandler);
		$("textarea.textArea-20yzAH").bind("keyup", this.inputEventHandler);
	}
}
