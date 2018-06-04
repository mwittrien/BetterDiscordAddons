module.exports = (Plugin, Api, Vendor) => {
	if (typeof BDFDB !== "object") global.BDFDB = {$: Vendor.$, BDv2Api: Api};
	
	const {$} = Vendor;

	return class extends Plugin {
		initConstructor () {
			this.selecting = false;
			
			this.counterMarkup = `<div id="charcounter"></div>`;
			
			this.css = `
				#charcounter {
					display: block;
					position: absolute;
					opacity: .5;
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
		
		onStart () {
			var libraryScript = null;
			if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
				libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
				document.head.appendChild(libraryScript);
			}
			this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
			if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
			else libraryScript.addEventListener("load", () => {this.initialize();});
			return true;
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

				return true;
			}
			else {
				console.error(this.name + ": Fatal Error: Could not load BD functions!");
				return false;
			}
		}


		onStop () {
			if (typeof BDFDB === "object") {
				$("#charcounter").remove();
				$(".charcounter-added").removeClass("charcounter-added");
							
				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
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
						.off("keydown." + this.name + " click." + this.name)
						.on("keydown." + this.name + " click." + this.name, e => {
							setTimeout(() => {
								updateCounter();
							},10);
						})
						.off("mousedown." + this.name)
						.on("mousedown." + this.name, e => {
							this.selecting = true;
						});
					$(document)
						.off("mouseup." + this.name)
						.on("mouseup." + this.name, e => {
							if (this.selecting) {
								this.selecting = false;
							}
						})
						.off("mousemove." + this.name)
						.on("mousemove." + this.name, e => {
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
};
