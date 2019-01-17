//META{"name":"CharCounter"}*//

class CharCounter {
	getName () {return "CharCounter";}

	getVersion () {return "1.3.1";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a charcounter in the chat.";}
	
	initConstructor () {
		this.patchModules = {
			"ChannelTextArea":"componentDidMount",
			"Note":"componentDidMount",
			"Modal":"componentDidMount"
		};
		
		this.selecting = false;
		
		this.maxLenghts = {
			normal: 2000,
			edit: 2000,
			form: 2000,
			nickname: 32,
			popout: 256,
			profile: 256
		}
		   
		this.css = `
			${BDFDB.dotCN.themelight} #charcounter {
				color: #747f8d; 
				opacity: .7;
			}
			${BDFDB.dotCN.themedark} #charcounter {
				color: #ccc;
				opacity: .5;
			}
			${BDFDB.dotCNS.typing + BDFDB.dotCN.cooldownwrapper} {
				margin-right: 64px;
			}
			.charcounter-added {
				position: relative !important;
			}
			#charcounter {
				display: block;
				position: absolute;
				z-index: 1000;
				pointer-events: none;
			}
			#charcounter.normal {
				right: 0;
				bottom: -1.3em;
			}
			#charcounter.edit {
				left: 0;
				bottom: -1.3em;
			}
			#charcounter.form {
				right: 0;
				bottom: -1.0em;
			}
			#charcounter.nickname {
				right: 0 !important;
				top: 0 !important;
			}
			#charcounter.popout {
				right: 3px !important;
				bottom: 1px !important;
				font-size: 10px !important;
			}
			#charcounter.profile {
				right: -5px !important;
				bottom: 3px !important;
				font-size: 12px !important;
			}
			${BDFDB.dotCN.usernote} textarea:not(:focus) + #charcounter {
				display: none;
			}`;
	}

	//legacy
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
			BDFDB.loadMessage(this);
			
			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".charcounter");
			BDFDB.removeClasses("charcounter-added");
			BDFDB.unloadMessage(this);
		}
	}
	
	
	// begin of own functions
	
	processChannelTextArea (instance, wrapper) {
		if (instance.props && instance.props.type && this.maxLenghts[instance.props.type]) this.appendCounter(wrapper.querySelector("textarea"), instance.props.type);
	}
	
	processNote (instance, wrapper) {
		this.appendCounter(wrapper.firstElementChild, BDFDB.containsClass(wrapper, BDFDB.disCN.usernotepopout) ? "popout" : (BDFDB.containsClass(wrapper, BDFDB.disCN.usernoteprofile) ? "profile" : null));
	}
	
	processModal (instance, wrapper) {
		if (instance.props && instance.props.tag == "form") {
			let reset = wrapper.querySelector(BDFDB.dotCN.reset);
			if (reset && BDFDB.getInnerText(reset.firstElementChild) == BDFDB.LanguageStrings.RESET_NICKNAME) this.appendCounter(wrapper.querySelector(BDFDB.dotCN.inputdefault), "nickname");
		}
	}
	
	appendCounter (input, type) {
		if (!input || !type) return;
		var counter = BDFDB.htmlToElement(`<div id="charcounter" class="charcounter ${type}"></div>`);
		input.parentElement.appendChild(counter);
		
		var updateCounter = () => {counter.innerText = input.value.length + "/" + (this.maxLenghts[type] || 2000) + (input.selectionEnd - input.selectionStart == 0 ? "" : " (" + (input.selectionEnd - input.selectionStart) + ")");};
		
		BDFDB.addClass(input.parentElement.parentElement, "charcounter-added");
		if (type == "nickname") input.setAttribute("maxlength", 32);
		BDFDB.addEventListener(this, input, "keydown click", e => {
			clearTimeout(input.charcountertimeout);
			input.charcountertimeout = setTimeout(() => {updateCounter();},100);
		});
		BDFDB.addEventListener(this, input, "mousedown", e => {
			BDFDB.addEventListener(this, document, "mouseup", () => {
				BDFDB.removeEventListener(this, document);
				if (input.selectionEnd - input.selectionStart) setImmediate(() => {BDFDB.addEventListener(this, document, "click", () => {
					input.selectionStart = 0;
					input.selectionEnd = 0;
					updateCounter();
					BDFDB.removeEventListener(this, document);
				});});
			});
			BDFDB.addEventListener(this, document, "mousemove", () => {setTimeout(() => {updateCounter();},10);});
		});
		
		updateCounter();
	}
}
