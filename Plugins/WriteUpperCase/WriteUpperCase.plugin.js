//META{"name":"WriteUpperCase"}*//

class WriteUpperCase {
	constructor () {
	}

	getName () {return "WriteUpperCase";}

	getDescription () {return "Change input to uppercase.";}

	getVersion () {return "1.1.2";}

	getAuthor () {return "DevilBro";}

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
								if (node && node.tagName && node.querySelector(".innerEnabled-gLHeOL, .innerEnabledNoAttach-36PpAk")) {
									this.bindEventToTextArea(node.querySelector(".textArea-20yzAH"));
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, "#app-mount", {name:"textareaObserver",instance:observer}, {childList: true, subtree:true});
			
			document.querySelectorAll(".textArea-20yzAH").forEach(textarea => {this.bindEventToTextArea(textarea);});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
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
