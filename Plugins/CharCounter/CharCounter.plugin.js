//META{"name":"CharCounter"}*//

class CharCounter {
	initConstructor () {
		this.selecting = false;
		
		this.counterMarkup = `<div id="charcounter" class="charcounter"></div>`;
		   
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
				right: 0;
				top: 0;
			}`;
	}

	getName () {return "CharCounter";}

	getDescription () {return "Adds a charcounter in the chat.";}

	getVersion () {return "1.2.8";}

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
						
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.tagName && node.querySelector(BDFDB.dotCN.textareainner + ":not(" + BDFDB.dotCN.textareainnerdisabled + ")")) {
									this.checkTextarea(node.querySelector("textarea"));
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.appmount, {name:"textareaObserver",instance:observer}, {childList: true, subtree: true});

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								let resetnickname;
								if (node.tagName && (resetnickname = node.querySelector(BDFDB.dotCN.reset)) != null) {
									if (BDFDB.getInnerText(resetnickname.firstElementChild) == BDFDB.LanguageStrings.RESET_NICKNAME) {
										this.appendCounter(node.querySelector(BDFDB.dotCN.inputdefault), "nickname");
										console.log("yes");
									}
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.app + " ~ [class^='theme']:not([class*='popouts'])", {name:"modalObserver",instance:observer}, {childList: true, subtree: true});
			
			document.querySelectorAll("textarea").forEach(textarea => {this.checkTextarea(textarea);});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDFDB === "object") {
			$(".charcounter").remove();
			$(".charcounter-added").removeClass("charcounter-added");
						
			BDFDB.unloadMessage(this);
		}
	}
	
	// begin of own functions
	
	checkTextarea (textarea) {
		if (!textarea) return;
		var textareaWrap = textarea.parentElement;
		if (textareaWrap && !textareaWrap.querySelector("#charcounter")) {
			var textareaInstance = BDFDB.getOwnerInstance({"node":textarea, "props":["handlePaste","saveCurrentText"], "up":true});
			if (textareaInstance && textareaInstance.props && textareaInstance.props.type) {
				this.appendCounter(textarea, textareaInstance.props.type);
			}
		}
	}
	
	appendCounter (input, type) {
		if (!input) return;
		var counter = $(this.counterMarkup);
		counter.addClass(type).appendTo(input.parentElement);
		
		var updateCounter = () => {
			var selection = input.selectionEnd - input.selectionStart == 0 ? "" : " (" + (input.selectionEnd - input.selectionStart) + ")";
			counter.text(type == "nickname" ? (input.value.length + "/32" + selection) : (BDFDB.getParsedLength(input.value) + "/2000" + selection));
		}
		
		input.parentElement.parentElement.classList.add("charcounter-added");
		$(input)
			.attr("maxlength", type == "nickname" ? 32 : "")
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
