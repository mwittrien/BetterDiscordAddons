//META{"name":"WriteUpperCase","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/WriteUpperCase","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/WriteUpperCase/WriteUpperCase.plugin.js"}*//

class WriteUpperCase {
	getName () {return "WriteUpperCase";}

	getVersion () {return "1.2.2";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Change input to uppercase.";}

	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};
		
		this.patchModules = {
			ChannelTextArea: "componentDidMount",
		};
	}

	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {
			try {return this.initialize();}
			catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
		}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);

			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	processChannelTextArea (e) {
		if (e.instance.props && e.instance.props.type) {
			var textarea = e.node.querySelector("textarea");
			if (!textarea) return;
			BDFDB.ListenerUtils.add(this, textarea, "keyup", () => {
				BDFDB.TimeUtils.clear(textarea.WriteUpperCaseTimeout);
				textarea.WriteUpperCaseTimeout = BDFDB.TimeUtils.timeout(() => {
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
