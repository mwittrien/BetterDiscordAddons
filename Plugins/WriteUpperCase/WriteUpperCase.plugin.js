//META{"name":"WriteUpperCase"}*//

class WriteUpperCase {
	constructor () {
	}

	getName () {return "WriteUpperCase";}

	getDescription () {return "Change input to uppercase.";}

	getVersion () {return "1.0.8";}

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
			
			this.TextArea = BDfunctionsDevilBro.WebModules.findByPrototypes(["saveCurrentText"]);
			this.patchCancel = BDfunctionsDevilBro.WebModules.monkeyPatch(this.TextArea.prototype, "componentDidMount", {after: (e) => {
				if (e && e.thisObject && e.thisObject._ref && e.thisObject._ref._textArea && e.thisObject.props && e.thisObject.props.type) {
					this.bindEventToTextArea(e.thisObject._ref._textArea, e.thisObject.props.type);
				}
			}});
			
			
			this.bindEventToTextArea(document.querySelector("form .channelTextArea-os01xC textarea"), "normal");
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			if (typeof this.patchCancel === "function") this.patchCancel();
			
			$("textarea").off("keyup." + this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}

	
	// begin of own functions
	
	bindEventToTextArea (textarea, type) {
		if (!textarea || !type) return;
		var textareaInstance = BDfunctionsDevilBro.getOwnerInstance({"node":textarea, "props":["handlePaste","saveCurrentText"], "up":true});
		if (textarea && textareaInstance) {
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
