//META{"name":"CharCounter","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CharCounter","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CharCounter/CharCounter.plugin.js"}*//

class CharCounter {
	getName () {return "CharCounter";}

	getVersion () {return "1.3.9";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a charcounter in the chat.";}

	constructor () {
		this.changelog = {
			"fixed":[["Textarea","Fixed issue where counter would not get attached to chat textarea"]],
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};

		this.patchedModules = {
			after: {
				ChannelTextArea: "render",
				Note: "render",
				ChangeNickname: "render"
			}
		};
	}

	initConstructor () {
		this.maxLenghts = {
			normal: 2000,
			edit: 2000,
			form: 2000,
			nickname: 32,
			popout: 256,
			profile: 256
		}
		   
		this.css = `
			${BDFDB.dotCNS.typing + BDFDB.dotCN.cooldownwrapper} {
				margin-right: 64px;
			}
			.charcounter-added {
				position: relative !important;
			}
			.charcounter {
				display: block;
				position: absolute;
				z-index: 1000;
				pointer-events: none;
				font-size: 15px;
			}
			.charcounter.normal {
				right: 0;
				bottom: -1.3em;
			}
			.charcounter.edit {
				left: 0;
				bottom: -1.3em;
			}
			.charcounter.form {
				right: 0;
				bottom: -1.0em;
			}
			.charcounter.nickname {
				right: 0 !important;
				top: 0 !important;
			}
			.charcounter.popout {
				right: 3px !important;
				bottom: -8px !important;
				font-size: 10px !important;
			}
			.charcounter.profile {
				right: 0 !important;
				bottom: -10px !important;
				font-size: 12px !important;
			}
			${BDFDB.dotCN.usernote} textarea:not(:focus) + .charcounter {
				display: none;
			}`;
	}

	//legacy
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

			BDFDB.ModuleUtils.forceAllUpdates(this);
			
			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	processChannelTextArea (e) {
		if (e.instance.props.type && this.maxLenghts[e.instance.props.type]) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: ["TextAreaAutosize", "TextArea", "PlainTextArea"]});
			if (index > -1) this.injectCounter(e.returnvalue, children, e.instance.props.type, BDFDB.dotCN.textarea, true);
		}
	}

	processNote (e) {
		let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: ["TextAreaAutosize", "TextArea", "PlainTextArea"]});
		if (index > -1) this.injectCounter(e.returnvalue, children, e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.usernotepopout) > -1 ? "popout" : "profile", "textarea");
	}

	processChangeNickname (e) {
		let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "FormItem"});
		if (index > -1) {
			let [children2, index2] = BDFDB.ReactUtils.findChildren(children[index], {name: "TextInput"});
			if (index2 > -1) this.injectCounter(children[index], children2, "nickname", BDFDB.dotCN.input);
		}
	}
	
	injectCounter (parent, children, type, refClass, parsing) {
		if (!children) return;
		parent.props.className = ((parent.props.className || "") + " charcounter-added").trim();
		children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CharCounter, {
			className: `charcounter ${type}`,
			refClass: refClass,
			parsing: parsing,
			max: this.maxLenghts[type]
		}));
	}
}
