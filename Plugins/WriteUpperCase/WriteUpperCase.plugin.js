//META{"name":"WriteUpperCase"}*//

class WriteUpperCase {
	constructor () {
		this.textareaObserver = new MutationObserver(() => {});
	}

	getName () {return "WriteUpperCase";}

	getDescription () {return "Change input to uppercase.";}

	getVersion () {return "1.1.2";}

	getAuthor () {return "DevilBro";}

	load () {}

	start () {
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"></script>');
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			var observertarget = null;

			this.textareaObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".innerEnabled-gLHeOL, .innerEnabledNoAttach-36PpAk")) {
									this.bindEventToTextArea(node.querySelector(".textArea-20yzAH"));
								}
							});
						}
					}
				);
			});
			if (observertarget = document.querySelector("#app-mount")) this.textareaObserver.observe(observertarget, {childList: true, subtree:true});
			
			document.querySelectorAll(".textArea-20yzAH").forEach(textarea => {this.bindEventToTextArea(textarea);});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.textareaObserver.disconnect();
			
			$(".textArea-20yzAH").off("keyup." + this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}

	
	// begin of own functions
	
	bindEventToTextArea (textarea) {
		if (!textarea) return;
		$(textarea)
			.off("keyup." + this.getName())
			.on("keyup." + this.getName(), () => {
				var string = textarea.value;
				if (string.length > 0) {
					var newstring = string;
					var first = string.charAt(0);
					var position = textarea.selectionStart;
					if (first === first.toUpperCase() && string.toLowerCase().indexOf("http") == 0) {
						newstring = string.charAt(0).toLowerCase() + string.slice(1);
					}
					else if (first === first.toLowerCase() && first !== first.toUpperCase() && string.toLowerCase().indexOf("http") != 0) {
						newstring = string.charAt(0).toUpperCase() + string.slice(1);
					}
					if (string != newstring) {
						textarea.focus();
						textarea.selectionStart = 0;
						textarea.selectionEnd = textarea.value.length;
						document.execCommand("insertText", false, newstring);
						textarea.selectionStart = position;
						textarea.selectionEnd = position;
					}
				}
			});
	}
}
