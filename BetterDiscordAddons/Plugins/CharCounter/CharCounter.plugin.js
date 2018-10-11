//META{"name":"CharCounter"}*//

class CharCounter {
	initConstructor () {
		this.selecting = false;
		
		this.counterMarkup = `<div id="charcounter"></div>`;
		   
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
			}`;
	}

	getName () {return "CharCounter";}

	getDescription () {return "Adds a charcounter in the chat.";}

	getVersion () {return "1.2.6";}

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
								if (node && node.tagName && node.querySelector(BDFDB.dotCN.textareainner + ":not(" + BDFDB.dotCN.textareainnerdisabled + ")")) {
									this.appendCounter(node.querySelector("textarea"));
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.appmount, {name:"textareaObserver",instance:observer}, {childList: true, subtree: true});
			
			document.querySelectorAll("textarea").forEach(textarea => {this.appendCounter(textarea);});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDFDB === "object") {
			$("#charcounter").remove();
			$(".charcounter-added").removeClass("charcounter-added");
						
			BDFDB.unloadMessage(this);
		}
	}
	
	// begin of own functions
	
	appendCounter (textarea) {
		if (!textarea) return;
		var textareaWrap = textarea.parentElement;
		if (textareaWrap && !textareaWrap.querySelector("#charcounter")) {
			var textareaInstance = BDFDB.getOwnerInstance({"node":textarea, "props":["handlePaste","saveCurrentText"], "up":true});
			if (textareaInstance && textareaInstance.props && textareaInstance.props.type) {
				var counter = $(this.counterMarkup);
				counter.addClass(textareaInstance.props.type).appendTo(textareaWrap);
				
				var updateCounter = () => {
					var selection = textarea.selectionEnd - textarea.selectionStart == 0 ? "" : " (" + (textarea.selectionEnd - textarea.selectionStart) + ")";
					counter.text(BDFDB.getParsedLength(textarea.value) + "/2000" + selection);
				}
				
				textareaWrap.parentElement.classList.add("charcounter-added");
				$(textarea)
					.off("keydown." + this.getName() + " click." + this.getName())
					.on("keydown." + this.getName() + " click." + this.getName(), e => {
						clearTimeout(textarea.charcountertimeout);
						textarea.charcountertimeout = setTimeout(() => {updateCounter();},100);
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
	}
}
