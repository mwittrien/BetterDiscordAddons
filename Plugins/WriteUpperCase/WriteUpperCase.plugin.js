//META{"name":"WriteUpperCase","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/WriteUpperCase","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/WriteUpperCase/WriteUpperCase.plugin.js"}*//

var WriteUpperCase = (_ => {
	return class WriteUpperCase {
		getName () {return "WriteUpperCase";}

		getVersion () {return "1.2.5";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Change input to uppercase.";}

		constructor () {
			this.changelog = {
				"fixed":[["New WYSIWYG Textarea","Fixed for the new WYSIWYG Textarea that is hidden by experiments"]],
				"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
			};
			
			this.patchedModules = {
				before: {
					ChannelEditorContainer: "render"
				}
			};
		}

		// Legacy
		load () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) BDFDB.PluginUtils.load(this);
		}

		start () {
			if (!window.BDFDB) window.BDFDB = {myPlugins:{}};
			if (window.BDFDB && window.BDFDB.myPlugins && typeof window.BDFDB.myPlugins == "object") window.BDFDB.myPlugins[this.getName()] = this;
			let libraryScript = document.querySelector("head script#BDFDBLibraryScript");
			if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("id", "BDFDBLibraryScript");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", _ => {this.initialize();});
				document.head.appendChild(libraryScript);
			}
			else if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(_ => {
				try {return this.initialize();}
				catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
			}, 30000);
		}

		initialize () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				if (this.started) return;
				BDFDB.PluginUtils.init(this);

				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		processChannelEditorContainer (e) {
			if (e.instance.props.textValue && e.instance.state.focused) {
				let string = e.instance.props.textValue;
				if (string.length > 0) {
					let newstring = string;
					let first = string.charAt(0);
					if (first === first.toUpperCase() && (string.toLowerCase().indexOf("http") == 0 || string.toLowerCase().indexOf("s/") == 0)) newstring = string.charAt(0).toLowerCase() + string.slice(1);
					else if (first === first.toLowerCase() && first !== first.toUpperCase() && string.toLowerCase().indexOf("http") != 0 && string.toLowerCase().indexOf("s/") != 0) newstring = string.charAt(0).toUpperCase() + string.slice(1);
					if (string != newstring) {
						e.instance.props.textValue = newstring;
						if (e.instance.props.richValue) e.instance.props.richValue = BDFDB.SlateUtils.copyRichValue(newstring, e.instance.props.richValue);
					}
				}
			}
		}
	}
})();

module.exports = WriteUpperCase;