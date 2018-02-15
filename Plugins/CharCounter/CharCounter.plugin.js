//META{"name":"CharCounter"}*//

class CharCounter {
	constructor () {
		
		this.selecting = false;
		
		this.textareaObserver = new MutationObserver(() => {});
		
		this.counterMarkup = `<div id="charcounter"></div>`;
		
		this.css = `
			#charcounter {
				display: block;
				position: absolute;
				right: 0; 
				opacity: .5;
				z-index: 1000;
			}
			#charcounter.normal {
				bottom: -1.3em;
			}
			#charcounter.form,
			#charcounter.edit {
				top: -1.3em;
			}`;
	}

	getName () {return "CharCounter";}

	getDescription () {return "Adds a charcounter in the chat.";}

	getVersion () {return "1.1.5";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js");
			document.head.appendChild(libraryScript);
		}
		if (typeof BDfunctionsDevilBro === "object") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			var observertarget = null;

			this.textareaObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".innerEnabled-gLHeOL, .innerEnabledNoAttach-36PpAk")) {
									this.appendCounter(node.querySelector("textarea"));
								}
							});
						}
					}
				);
			});
			if (observertarget = document.querySelector("#app-mount")) this.textareaObserver.observe(observertarget, {childList: true, subtree:true});
			
			document.querySelectorAll("textarea").forEach(textarea => {this.appendCounter(textarea);});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.textareaObserver.disconnect();
			
			$("#charcounter").remove();
			$("textarea").off("keydown." + this.getName()).off("click." + this.getName()).off("mousedown." + this.getName());
			$(document).off("mouseup." + this.getName()).off("mousemove." + this.getName());
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	// begin of own functions
	
	appendCounter (textarea) {
		if (!textarea) return;
		var textareaWrap = textarea.parentElement;
		if (textareaWrap && !textareaWrap.querySelector("#charcounter")) {
			var textareaInstance = BDfunctionsDevilBro.getOwnerInstance({"node":textarea, "props":["handlePaste","saveCurrentText"], "up":true});
			if (textareaInstance && textareaInstance.props && textareaInstance.props.type) {
				var counter = $(this.counterMarkup);
				counter.addClass(textareaInstance.props.type).appendTo(textareaWrap);
				$(textarea)
					.off("keydown." + this.getName() + " click." + this.getName())
					.on("keydown." + this.getName() + " click." + this.getName(), e => {
						setTimeout(() => {
							updateCounter();
						},10);
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
				
				function updateCounter () {
					var selection = textarea.selectionEnd - textarea.selectionStart == 0 ? "" : " (" + (textarea.selectionEnd - textarea.selectionStart) + ")";
					counter.text(textarea.value.length + "/2000" + selection);
				}
			}
		}
	}
}
