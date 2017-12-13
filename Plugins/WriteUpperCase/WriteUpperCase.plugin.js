//META{"name":"WriteUpperCase"}*//

class WriteUpperCase {
	constructor () {
	}

	getName () {return "WriteUpperCase";}

	getDescription () {return "Change input to uppercase.";}

	getVersion () {return "1.0.7";}

	getAuthor () {return "DevilBro";}

	load () {}

	start () {
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBroBeta.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBroBeta.js"></script>');
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			this.bindEventToTextArea();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			$(".channelTextArea-1HTP3C").find("textarea").off("keyup." + this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.bindEventToTextArea();
		}
	}

	
	// begin of own functions
	
	bindEventToTextArea () {
		$(".channelTextArea-1HTP3C").find("textarea")
			.off("keyup." + this.getName())
			.on("keyup." + this.getName(), e => {
				var textarea = e.target;
				var string = textarea.value;
				if (string.length > 0) {
					var textareaInstance = BDfunctionsDevilBro.getOwnerInstance({"node":textarea, "name":"ChannelTextAreaForm", "up":true});
					var first = string.charAt(0);
					var position = e.target.selectionStart;
					if (first === first.toUpperCase() && string.toLowerCase().indexOf("http") == 0) {
						textareaInstance.setState({textValue:string.charAt(0).toLowerCase() + string.slice(1)});
						textarea.selectionStart = position;
						textarea.selectionEnd = position;
					}
					else if (first === first.toLowerCase() && first !== first.toUpperCase() && string.toLowerCase().indexOf("http") != 0) {
						textareaInstance.setState({textValue:string.charAt(0).toUpperCase() + string.slice(1)});
						textarea.selectionStart = position;
						textarea.selectionEnd = position;
					}
				}
			});
	}
}
