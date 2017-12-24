//META{"name":"WriteUpperCase"}*//

class WriteUpperCase {
	constructor () {
		this.textareaObserver = new MutationObserver(() => {});
	}

	getName () {return "WriteUpperCase";}

	getDescription () {return "Change input to uppercase.";}

	getVersion () {return "1.1.0";}

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
			
			this.textareaObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".innerEnabled-gLHeOL")) {
									this.bindEventToTextArea(node.querySelector("textarea"));
								}
							});
						}
					}
				);
			});
			if (document.querySelector("#app-mount")) this.textareaObserver.observe(document.querySelector("#app-mount"), {childList: true, subtree:true});
			
			document.querySelectorAll("textarea").forEach(textarea => {this.bindEventToTextArea(textarea);});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.textareaObserver.disconnect();
			
			$("textarea").off("keyup." + this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}

	
	// begin of own functions
	
	bindEventToTextArea (textarea) {
		if (!textarea) return;
		var textareaInstance = BDfunctionsDevilBro.getOwnerInstance({"node":textarea, "props":["handlePaste","saveCurrentText"], "up":true});
		if (textareaInstance && textareaInstance.props && textareaInstance.props.type) {
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
							textarea.value = newstring;
							textareaInstance.saveCurrentText();
							textarea.selectionStart = position;
							textarea.selectionEnd = position;
						}
					}
				});
		}
	}
}
