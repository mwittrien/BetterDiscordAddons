module.exports = (Plugin, Api, Vendor) => {
	if (typeof BDfunctionsDevilBro !== "object") global.BDfunctionsDevilBro = {$: Vendor.$, BDv2Api: Api};
	
	const {$} = Vendor;

	return class extends Plugin {
		onStart() {
			var libraryScript = null;
			if (typeof BDfunctionsDevilBro !== "object" || typeof BDfunctionsDevilBro.isLibraryOutdated !== "function" || BDfunctionsDevilBro.isLibraryOutdated()) {
				libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]');
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js");
				document.head.appendChild(libraryScript);
			}
			this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
			if (typeof BDfunctionsDevilBro === "object" && typeof BDfunctionsDevilBro.isLibraryOutdated === "function") this.initialize();
			else libraryScript.addEventListener("load", () => {this.initialize();});
			return true;
		}
		
		initialize() {
			if (typeof BDfunctionsDevilBro === "object") {
				BDfunctionsDevilBro.loadMessage(this);
				
				var observer = null;

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.tagName && node.querySelector(".innerEnabled-gLHeOL, .innerEnabledNoAttach-36PpAk")) {
										this.bindEventToTextArea(node.querySelector(".textArea-20yzAH"));
									}
								});
							}
						}
					);
				});
				BDfunctionsDevilBro.addObserver(this, ".appMount-14L89u", {name:"textareaObserver",instance:observer}, {childList: true, subtree:true});
				
				document.querySelectorAll(".textArea-20yzAH").forEach(textarea => {this.bindEventToTextArea(textarea);});
				return true;
			}
			else {
				console.error(this.name + ": Fatal Error: Could not load BD functions!");
				return false;
			}
		}

		onStop() {
			if (typeof BDfunctionsDevilBro === "object") {				
				BDfunctionsDevilBro.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}

	
		// begin of own functions
		
		bindEventToTextArea (textarea) {
			if (!textarea) return;
			$(textarea)
				.off("keyup." + this.name)
				.on("keyup." + this.name, () => {
					var string = textarea.value;
					if (string.length > 0) {
						var newstring = string;
						var first = string.charAt(0);
						var position = textarea.selectionStart;
						if (first === first.toUpperCase() && string.toLowerCase().indexOf("http") == 0) {
							newstring = string.charAt(0).toLowerCase() + string.slice(1);
						}
						else if (first === first.toLowerCase() && first !== first.toUpperCase() && string.toLowerCase().indexOf("http") != 0) {
							newstring = string.charAt(0).toUpperCase() + string.slice(1);
						}
						if (string != newstring) {
							textarea.focus();
							textarea.selectionStart = 0;
							textarea.selectionEnd = textarea.value.length;
							document.execCommand("insertText", false, newstring);
							textarea.selectionStart = position;
							textarea.selectionEnd = position;
						}
					}
				});
		}
	}
};
