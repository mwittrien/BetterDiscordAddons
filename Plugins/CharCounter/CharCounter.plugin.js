//META{"name":"CharCounter"}*//

class CharCounter {
	initConstructor () {
		this.patchModules = {
			"ChannelTextArea":"componentDidMount",
			"Note":"componentDidMount",
			"Modal":"componentDidMount"
		};
		
		this.selecting = false;
		
		this.counterMarkup = `<div id="charcounter" class="charcounter"></div>`;
		
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

	getName () {return "CharCounter";}

	getDescription () {return "Adds a charcounter in the chat.";}

	getVersion () {return "1.3.0";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDFDB !== "object" || BDFDB.isLibraryOutdated()) {
			if (typeof BDFDB === "object") BDFDB = "";
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object") this.initialize();
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
		if (wrapper.classList) this.appendCounter(wrapper.firstElementChild, wrapper.classList.contains(BDFDB.disCN.usernotepopout) ? "popout" : (wrapper.classList.contains(BDFDB.disCN.usernoteprofile) ? "profile" : null));
	}
	
	processModal (instance, wrapper) {
		if (instance.props && instance.props.tag == "form") {
			let reset = wrapper.querySelector(BDFDB.dotCN.reset);
			if (reset && BDFDB.getInnerText(reset.firstElementChild) == BDFDB.LanguageStrings.RESET_NICKNAME) this.appendCounter(wrapper.querySelector(BDFDB.dotCN.inputdefault), "nickname");
		}
	}
	
	appendCounter (input, type) {
		if (!input || !type) return;
		var counter = $(this.counterMarkup);
		counter.addClass(type).appendTo(input.parentElement);
		
		var updateCounter = () => {
			var selection = input.selectionEnd - input.selectionStart == 0 ? "" : " (" + (input.selectionEnd - input.selectionStart) + ")";
			var maxLength = this.maxLenghts[type] || 2000;
			counter.text(input.value.length + "/" + maxLength + selection);
		}
		
		input.parentElement.parentElement.classList.add("charcounter-added");
		if (type == "nickname") input.setAttribute("maxlength", 32);
		$(input)
			.off("keydown." + this.getName() + " click." + this.getName())
			.on("keydown." + this.getName() + " click." + this.getName(), e => {
				clearTimeout(input.charcountertimeout);
				input.charcountertimeout = setTimeout(() => {updateCounter();},100);
			})
			.off("mousedown." + this.getName())
			.on("mousedown." + this.getName(), e => {
				this.selecting = true;
			});
		$(document)
			.off("mouseup." + this.getName())
			.on("mouseup." + this.getName(), e => {
				if (this.selecting) {
					this.selecting = false;
				}
			})
			.off("mousemove." + this.getName())
			.on("mousemove." + this.getName(), e => {
				if (this.selecting) {
					setTimeout(() => {
						updateCounter();
					},10);
				}
			});
		
		updateCounter();
	}
}
