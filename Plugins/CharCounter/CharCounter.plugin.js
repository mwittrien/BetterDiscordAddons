//META{"name":"CharCounter","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CharCounter","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CharCounter/CharCounter.plugin.js"}*//

var CharCounter = (_ => {
	const maxLenghts = {
		normal: 2000,
		edit: 2000,
		form: 2000,
		nickname: 32,
		popout: 256,
		profile: 256
	};
	
	return class CharCounter {
		getName () {return "CharCounter";}

		getVersion () {return "1.4.7";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds a charcounter in the chat.";}

		constructor () {
			this.patchedModules = {
				after: {
					ChannelTextAreaContainer: "render",
					Note: "render",
					ChangeNickname: "render"
				}
			};
		}

		initConstructor () {
			this.css = `
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
					right: 0;
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

		// Legacy
		load () {}

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

				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}


		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.ModuleUtils.forceAllUpdates(this);
				
				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		processChannelTextAreaContainer (e) {
			let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "ChannelEditorContainer"});
			if (index > -1 && children[index].props.type && maxLenghts[children[index].props.type] && !children[index].props.disabled) {
				if (!BDFDB.ArrayUtils.is(e.returnvalue.props.children)) e.returnvalue.props.children = [e.returnvalue.props.children];
				this.injectCounter(e.returnvalue, e.returnvalue.props.children, children[index].props.type, BDFDB.dotCN.textarea, true);
			}
		}

		processNote (e) {
			let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["TextAreaAutosize", "TextArea", "PlainTextArea"]});
			if (index > -1) this.injectCounter(e.returnvalue, children, e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.usernotepopout) > -1 ? "popout" : "profile", "textarea");
		}

		processChangeNickname (e) {
			let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "FormItem"});
			if (index > -1) {
				let [children2, index2] = BDFDB.ReactUtils.findParent(children[index], {name: "TextInput"});
				if (index2 > -1) this.injectCounter(children[index], children2, "nickname", BDFDB.dotCN.input);
			}
		}
		
		injectCounter (parent, children, type, refClass, parsing) {
			if (!children) return;
			parent.props.className = BDFDB.DOMUtils.formatClassName(parent.props.className, BDFDB.disCN._charcountercounteradded);
			children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CharCounter, {
				className: `${BDFDB.disCN._charcountercounter} ${type}`,
				refClass: refClass,
				parsing: parsing,
				max: maxLenghts[type],
				onChange: instance => {
					let node = BDFDB.ReactUtils.findDOMNode(instance);
					let form = node && BDFDB.DOMUtils.getParent(BDFDB.dotCN.chatform, node);
					if (form) {
						let typing = form.querySelector(BDFDB.dotCN.typing);
						if (typing) typing.style.setProperty("margin-right", `${BDFDB.DOMUtils.getWidth(node) + 10}px`);
					}
				}
			}));
		}
	}
})();