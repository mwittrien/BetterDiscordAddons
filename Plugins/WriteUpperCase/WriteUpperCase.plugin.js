//META{"name":"WriteUpperCase"}*//

class WriteUpperCase {
	getName () {return "WriteUpperCase";}

	getVersion () {return "1.2.0";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Change input to uppercase.";}
	
	initConstructor () {
		this.patchModules = {
			"ChannelTextArea":"componentDidMount",
		};
	}

	load () {}

	start () {
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {
				BDFDB.loaded = true;
				this.initialize();
			});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);
			
			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {			
			BDFDB.unloadMessage(this);
		}
	}

	
	// begin of own functions
	
	processChannelTextArea (instance, wrapper) {
		if (instance.props && instance.props.type) {
			var textarea = wrapper.querySelector("textarea");
			if (!textarea) return;
			BDFDB.addEventListener(this, textarea, "keyup", () => {
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
	}
}
