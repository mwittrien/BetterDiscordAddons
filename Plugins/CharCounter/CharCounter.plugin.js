//META{"name":"CharCounter","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CharCounter","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CharCounter/CharCounter.plugin.js"}*//

class CharCounter {
	getName () {return "CharCounter";}

	getVersion () {return "1.4.0";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a charcounter in the chat.";}

	constructor () {
		this.changelog = {
			"fixed":[["New WYSIWYG Textarea","Fixed for the new WYSIWYG Textarea that is hidden by experiments"]],
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
			${BDFDB.dotCN._charcountercounteradded} {
				position: relative !important;
			}
			${BDFDB.dotCN._charcountercounter} {
				display: block;
				position: absolute;
				z-index: 1000;
				pointer-events: none;
				font-size: 15px;
			}
			${BDFDB.dotCN._charcountercounter}.normal {
				right: 0;
				bottom: -1.3em;
			}
			${BDFDB.dotCN._charcountercounter}.edit {
				left: 0;
				bottom: -1.3em;
			}
			${BDFDB.dotCN._charcountercounter}.form {
				right: 0;
				bottom: -1.0em;
			}
			${BDFDB.dotCN._charcountercounter}.nickname {
				right: 0 !important;
				top: 0 !important;
			}
			${BDFDB.dotCN._charcountercounter}.popout {
				right: 3px !important;
				bottom: -8px !important;
				font-size: 10px !important;
			}
			${BDFDB.dotCN._charcountercounter}.profile {
				right: 0 !important;
				bottom: -10px !important;
				font-size: 12px !important;
			}
			${BDFDB.dotCN.usernote} textarea:not(:focus) + ${BDFDB.dotCN._charcountercounter} {
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
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: ["TextAreaAutosize", "TextArea", "PlainTextArea", "SlateChannelTextArea"]});
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
		parent.props.className = ((parent.props.className || "") + " " + BDFDB.dotCN._charcountercounteradded).trim();
		children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CharCounter, {
			className: `${BDFDB.disCN._charcountercounter} ${type}`,
			refClass: refClass,
			parsing: parsing,
			max: this.maxLenghts[type]
		}));
	}
}
