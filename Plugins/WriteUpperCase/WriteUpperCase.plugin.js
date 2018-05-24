//META{"name":"WriteUpperCase"}*//

class WriteUpperCase {
	getName () {return "WriteUpperCase";}

	getDescription () {return "Change input to uppercase.";}

	getVersion () {return "1.1.5";}

	getAuthor () {return "DevilBro";}

	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDFDB === "object") {
			BDFDB.loadMessage(this);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(BDFDB.dotCNC.textareainnerenabled + BDFDB.dotCN.textareainnerenablednoattach)) {
									this.bindEventToTextArea(node.querySelector(BDFDB.dotCN.textarea));
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.appmount, {name:"textareaObserver",instance:observer}, {childList: true, subtree:true});
			
			this.onSwitch();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {			
			BDFDB.unloadMessage(this);
		}
	}
	
	onSwitch () {
		document.querySelectorAll(BDFDB.dotCN.textarea).forEach(textarea => {this.bindEventToTextArea(textarea);});
	}

	
	// begin of own functions
	
	bindEventToTextArea (textarea) {
		if (!textarea) return;
		$(textarea)
			.off("keyup." + this.getName())
			.on("keyup." + this.getName(), () => {
				clearTimeout(textarea.writeuppercasetimeout);
				textarea.writeuppercasetimeout = setTimeout(() => {this.formatText(textarea);},1);
			});
	}
	
	formatText (textarea) {
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
	}
}
