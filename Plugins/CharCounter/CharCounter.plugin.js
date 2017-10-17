//META{"name":"CharCounter"}*//

class CharCounter {
	constructor () {
		this.switchFixObserver = new MutationObserver(() => {});
		
		this.selecting = false;
		
		this.css = `
			.character-counter {
				display: block;
				position: absolute;
				right: 0; 
				bottom: -1.3em;
				opacity: .5;
				z-index: 1000;
			}`;
			
		this.counterMarkup = `<div class="character-counter"></div>`;
	}

	getName () {return "CharCounter";}

	getDescription () {return "Adds a charcounter in the chat.";}

	getVersion () {return "1.0.1";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.appendCounter();
			
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.switchFixObserver.disconnect();
			
			$(".character-counter").remove();
			var textarea = document.querySelector(".channel-text-area-default");
			var textinput = textarea.querySelector("textarea");
			$(textinput).off("input." + this.getName()).off("click." + this.getName()).off("mousedown." + this.getName());
			$(document).off("mouseup." + this.getName()).off("mousemove." + this.getName());
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.appendCounter();
		}
	}
	
	// begin of own functions
	
	appendCounter () {
		var textarea = document.querySelector(".channel-text-area-default");
		if (textarea) {
			$(".character-counter").remove();
			var counter = $(this.counterMarkup);
			var textinput = textarea.querySelector("textarea");
			$(textinput)
				.off("input." + this.getName() + " click." + this.getName())
				.on("input." + this.getName() + " click." + this.getName(), e => {
					setTimeout(() => {
						counter.text(textinput.value.length + "/2000 (" + (textinput.selectionEnd - textinput.selectionStart) + ")")
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
							counter.text(textinput.value.length + "/2000 (" + (textinput.selectionEnd - textinput.selectionStart) + ")")
						},10);
					}
				});
			$(textarea).append(counter);
			counter.text(textinput.value.length + "/2000 (" + (textinput.selectionEnd - textinput.selectionStart) + ")");
		}
	}
}
