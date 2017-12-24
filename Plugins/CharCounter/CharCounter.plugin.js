//META{"name":"CharCounter"}*//

class CharCounter {
	constructor () {
		
		this.selecting = false;
		
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
			
		this.counterMarkup = `<div id="charcounter"></div>`;
	}

	getName () {return "CharCounter";}

	getDescription () {return "Adds a charcounter in the chat.";}

	getVersion () {return "1.1.3";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"></script>');
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.TextArea = BDfunctionsDevilBro.WebModules.findByPrototypes(["saveCurrentText"]);
			this.patchCancel = BDfunctionsDevilBro.WebModules.monkeyPatch(this.TextArea.prototype, "componentDidMount", {after: (e) => {
				if (e && e.thisObject && e.thisObject._ref && e.thisObject._ref._textArea && e.thisObject.props && e.thisObject.props.type) {
					this.appendCounter(e.thisObject._ref._textArea, e.thisObject.props.type);
				}
			}});
			
			this.appendCounter(document.querySelector("form .channelTextArea-os01xC textarea"), "normal");
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			if (typeof this.patchCancel === "function") this.patchCancel();
			
			$("#charcounter").remove();
			$("textarea").off("keydown." + this.getName()).off("click." + this.getName()).off("mousedown." + this.getName());
			$(document).off("mouseup." + this.getName()).off("mousemove." + this.getName());
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	// begin of own functions
	
	appendCounter (textarea, type) {
		if (!textarea || !type) return;
		var textareaWrap = textarea.parentElement;
		if (textareaWrap && !textareaWrap.querySelector("#charcounter." + type)) {
			var counter = $(this.counterMarkup);
			counter.addClass(type).appendTo(textareaWrap);
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
