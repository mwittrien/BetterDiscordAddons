//META{"name":"WriteUpperCase"}*//

class WriteUpperCase {
	constructor () {
		this.switchFixObserver = new MutationObserver(() => {});
		
		this.eventFired = false;
	}

	getName () {return "WriteUpperCase";}

	getDescription () {return "Change input to uppercase.";}

	getVersion () {return "1.0.4";}

	getAuthor () {return "DevilBro";}

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
			
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);	
			
			this.bindEventToTextArea();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.switchFixObserver.disconnect();
			$(".channelTextArea-1HTP3C").find("textarea")
				.off("keyup." + this.getName() + " keydown." + this.getName());
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
			.off("keyup." + this.getName() + " keydown." + this.getName())
			.on("keyup." + this.getName() + " keydown." + this.getName(), e => {
				if (!this.eventFired) {
					this.eventFired = true;
					var string = e.target.value;
					if (string.length > 0) {
						var first = string.charAt(0);
						if (first === first.toUpperCase() && e.target.value.toLowerCase().indexOf("http") == 0) {
							var position = e.target.selectionStart;
							e.target.selectionStart = 0;
							e.target.selectionEnd = string.length;
							document.execCommand("insertText", false, string.charAt(0).toLowerCase() + string.slice(1));
							e.target.selectionStart = position;
							e.target.selectionEnd = position;
						}
						else if (first === first.toLowerCase() && first !== first.toUpperCase() && e.target.value.toLowerCase().indexOf("http") != 0) {
							var position = e.target.selectionStart;
							e.target.selectionStart = 0;
							e.target.selectionEnd = string.length;
							document.execCommand("insertText", false, string.charAt(0).toUpperCase() + string.slice(1));
							e.target.selectionStart = position;
							e.target.selectionEnd = position;
						}
					} 
					this.eventFired = false;
				}
			});
	}
}
