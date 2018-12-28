//META{"name":"WriteUpperCase"}*//

class WriteUpperCase {
	initConstructor () {
		this.patchModules = {
			"ChannelTextArea":"componentDidMount"
		};
	}
	
	getName () {return "WriteUpperCase";}

	getDescription () {return "Change input to uppercase.";}

	getVersion () {return "1.1.9";}

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
			
			BDFDB.WebModules.forceAllUpdates(this);
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

	
	// begin of own functions
	
	bindEventToTextArea (textarea) {
		if (!textarea) return;
		$(textarea)
			.off("keyup." + this.getName())
			.on("keyup." + this.getName(), () => {
				clearTimeout(textarea.WriteUpperCaseTimeout);
				textarea.WriteUpperCaseTimeout = setTimeout(() => {
					let string = textarea.value;
					if (string.length > 0) {
						let newstring = string;
						let first = string.charAt(0);
						let position = textarea.selectionStart;
						if (first === first.toUpperCase() && (string.toLowerCase().indexOf("http") == 0 || string.toLowerCase().indexOf("s/") == 0)) newstring = string.charAt(0).toLowerCase() + string.slice(1);
						else if (first === first.toLowerCase() && first !== first.toUpperCase() && string.toLowerCase().indexOf("http") != 0 && string.toLowerCase().indexOf("s/") != 0) newstring = string.charAt(0).toUpperCase() + string.slice(1);
						if (string != newstring) {
							textarea.focus();
							textarea.selectionStart = 0;
							textarea.selectionEnd = textarea.value.length;
							document.execCommand("insertText", false, newstring);
							textarea.selectionStart = position;
							textarea.selectionEnd = position;
						}
					}
				},1);
			});
	}
	
	processChannelTextArea (instance, wrapper) {
		if (instance.props && instance.props.type) this.bindEventToTextArea(wrapper.querySelector("textarea"));
	}
}
