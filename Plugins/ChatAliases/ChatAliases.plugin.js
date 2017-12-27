//META{"name":"ChatAliases"}*//

class ChatAliases {
	constructor () {
		
		this.settingsWindowObserver = new MutationObserver(() => {});
		this.textareaObserver = new MutationObserver(() => {});
		
		this.css = ` 
			.chataliases-settings .title {
				color: #757C87;
				font-size: 20px;
				font-weight: bold;
				text-transform: capitalize;
				margin: 0 0 10px 0 !important;
				padding: 0 !important;
			}

			.chataliases-settings .input-bar {
				margin: 0 !important;
				padding: 0 !important;
			}

			.chataliases-settings .replace-value-label,
			.chataliases-settings .word-value-label {
				position: relative;
				display: inline-block;
				color: #757C87;
				font-weight: bold;
				margin: 0 5px 0 0 !important;
				padding: 0 !important;
			}
			
			.chataliases-settings input.replace-value,
			.chataliases-settings input.word-value {
				width: 140px;
				height: 21px;
				margin: 0 15px 0 0 !important;
				padding: 0 !important;
				border-radius: 5px;
			}

			.chataliases-settings button.word-add,
			.chataliases-settings button.toggle-info,
			.chataliases-settings button.remove-all {
				height: 21px;
				font-weight: 500;
				margin: 0 15px 0 0 !important;
				padding: 0 7px 0 7px !important;
				border-radius: 5px;
			}

			.chataliases-settings button.remove-all {
				color: red;
				margin: 0 15px 0 15px !important;
			}
			
			.chataliases-settings .word-container {
				min-height: 30px;
				background-color: #36393F;
				margin: 10px 2px 20px 2px !important;
				padding: 5px !important;
				border-radius: 5px;
			}
			
			.chataliases-settings input.word-exact,
			.chataliases-settings input.word-case {
				position: relative;
				margin: 0 5px 0 0 !important;
				padding: 0 !important;
				top: 3px;
				width: 15px;
				height: 15px;
				cursor: pointer;
			}
			
			.chataliases-settings .word-exact-text,
			.chataliases-settings .word-case-text {
				position: relative;
				display: inline-block;
				color: #757C87;
				font-weight: bold;
				margin: 0 15px 0 0 !important;
				padding: 0 !important;
			}

			.chataliases-settings .added-word {
				color: black;
				position: relative;
				display: inline-block;
				font-weight: 500;
				margin: 2px !important;
				padding: 1px 2px 0 2px !important;
				border-radius: 5px;
				background-color: #757C7E;
				border: 2px solid #757C7E;
				max-width: 600px;
				overflow: hidden;
			}

			.chataliases-settings .added-word.fake {
				float: left;
				text-align: center;
				width: 90px;
			}

			.chataliases-settings .added-word.case {
				background-color: #6699ff;
			}

			.chataliases-settings .added-word.nocase {
				background-color: #ff6666;
			}

			.chataliases-settings .added-word.exact {
				border: 2px solid #ffcc00;
			}

			.chataliases-settings .added-word.noexact {
				border: 2px solid #009933;
			}

			.chataliases-settings .word-delete {
				color: black;
				position: relative;
				display: inline-block;
				width: 15px;
				bottom: 1px;
				text-align: center;
				font-size: 13px;
				margin: 2px !important;
				padding: 2px !important;
				border-radius: 5px;
			}

			.chataliases-settings .word-delete:hover {
				color: #757C87;
				background-color: #26272B;
				cursor: pointer;
			}

			.chatfilter-settings .word-delete.fake {
				bottom: 0px;
			}

			.chataliases-settings .replace-word-text {
				margin: 0 10px 0 0 !important;
			}
			
			.chataliases-settings .wordtype-info {
				color: #757C87;
				font-weight: bold;
				background-color: #36393F;
				margin: 10px 2px 20px 2px !important;
				padding: 10px !important;
				border-radius: 5px;
			}
			
			.chataliases-settings .wordtype-category {
				overflow: hidden;
				color: #757C87;
				font-weight: bold;
				margin: 10px 2px 10px 2px !important;
				padding: 0 !important;
			}
			
			.chataliases-settings .wordtype-description {
				white-space: pre;
				width: 500px;
				float: left;
				display: inline-block;
				color: #757C87;
				font-weight: bold;
				margin: 0 0 0 10px !important;
				padding: 0 !important;
			}`;
	}

	getName () {return "ChatAliases";}

	getDescription () {return "Allows the user to configure their own chat-aliases which will automatically be replaced before the message is being sent.";}

	getVersion () {return "1.5.6";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settingshtml = ``;
		var words = BDfunctionsDevilBro.loadAllData(this.getName(), "words");
		settingshtml += `<div class="chataliases-settings">`;
		settingshtml += `<div class="title">Chat-Aliases:</div>`;
		settingshtml += `<div class="input-bar" id="chataliases-input-bar">`;
		settingshtml += `<label class="word-value-label">Replace:</label><input name="inputadd" class="word-value" id="chataliases-word-value">`;
		settingshtml += `<label class="replace-value-label">with:</label><input name="inputadd" class="replace-value" id="chataliases-replace-value">`;
		settingshtml += `<button name="add" class="word-add" id="chataliases-word-add">Add</button>`;
		settingshtml += `<button name="removeall" class="remove-all" id="chataliases-remove-all">Remove All</button></br>`;
		settingshtml += `<label class="word-case-text"><input type="checkbox" class="word-case" id="chataliases-word-case">case-sensitive</label>`;
		settingshtml += `<label class="word-exact-text"><input type="checkbox" class="word-exact" id="chataliases-word-exact" checked>exact word</label>`;
		settingshtml += `</div>`;
		settingshtml += `<div class="word-container" id="chataliases-word-container">`;
		for (let word in words) {
			var wordcomparison = words[word].exact ? "exact" : "noexact";
			var casesensivity = words[word].case ? "case" : "nocase";
			settingshtml += `<div name="${word}" class="added-word ${wordcomparison} ${casesensivity} chataliases-word">${BDfunctionsDevilBro.encodeToHTML(word)} (${BDfunctionsDevilBro.encodeToHTML(words[word].replace)})<div name="remove" class="word-delete">✖</div></div>`;
		}		
		settingshtml += `</div>`;
		var infoHidden = BDfunctionsDevilBro.loadData("hideInfo", this.getName(), "settings") ? " style='display:none;'" : "";
		settingshtml += `<button class="toggle-info">Toggle Information</button>`;
		settingshtml += `<div class="wordtype-info"${infoHidden}>`;
		settingshtml += `<div class="wordtype-category"><div class="added-word case fake">case<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will replace words while comparing lowercase/uppercase. \napple => apple, not APPLE or AppLe</div></div>`;
		settingshtml += `<div class="wordtype-category"><div class="added-word nocase fake">not case<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will replace words while ignoring lowercase/uppercase. \napple => apple, APPLE and AppLe</div></div>`;
		settingshtml += `<div class="wordtype-category"><div class="added-word exact fake">exact<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will only replace words that are exactly the selected word. \napple to pear => applepieapple stays applepieapple</div></div>`;
		settingshtml += `<div class="wordtype-category"><div class="added-word noexact fake">not exact<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will replace words anywhere they appear. \napple to pear => applepieapple to pearpiepear</div></div>`;
		settingshtml += `</div>`;
		settingshtml += `</div>`;
		
		var settingspanel = $(settingshtml)[0];
		$(settingspanel)
			.on("keypress", ".word-value, .replace-value", (e) => {this.updateContainer(settingspanel, e);})
			.on("click", ".word-add, .word-delete:not(.fake), .remove-all", (e) => {this.updateContainer(settingspanel, e);})
			.on("click", ".toggle-info", () => {this.toggleInfo(settingspanel);});
		return settingspanel;
	}

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
			
			this.settingsWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && node.tagName && node.getAttribute("layer-id") == "user-settings") {
									document.querySelectorAll("textarea").forEach(textarea => {this.bindEventToTextArea(textarea);});
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".layers")) this.settingsWindowObserver.observe(document.querySelector(".layers"), {childList:true});
			
			this.textareaObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".innerEnabled-gLHeOL, .innerEnabledNoAttach-36PpAk")) {
									this.bindEventToTextArea(node.querySelector("textarea"));
								}
							});
						}
					}
				);
			});
			if (document.querySelector("#app-mount")) this.textareaObserver.observe(document.querySelector("#app-mount"), {childList: true, subtree:true});
			
			document.querySelectorAll("textarea").forEach(textarea => {this.bindEventToTextArea(textarea);});
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.settingsWindowObserver.disconnect();
			this.textareaObserver.disconnect();
			$("textarea").off("keydown." + this.getName()).off("input." + this.getName());
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	
	// begin of own functions
	
	updateContainer (settingspanel, e) {
		var update = false;
		var ele = e.target;
		var words = BDfunctionsDevilBro.loadAllData(this.getName(), "words");
		words = words ? words : {};
		var wordvalue = null;
		var replacevalue = null;
		var wordinput = settingspanel.querySelector("#chataliases-word-value");
		var replaceinput = settingspanel.querySelector("#chataliases-replace-value");
		if ($(ele).attr("name") == "add") {
			wordvalue = wordinput.value;
			replacevalue = replaceinput.value;
			if (wordvalue && wordvalue.trim().length > 0 && replacevalue && replacevalue.trim().length > 0) {
				wordvalue = wordvalue.trim();
				replacevalue = replacevalue.trim();
				words[wordvalue] = {};
				words[wordvalue].replace = replacevalue;
				words[wordvalue].exact = $(settingspanel).find("#chataliases-word-exact").prop("checked");
				words[wordvalue].case = $(settingspanel).find("#chataliases-word-case").prop("checked");
				wordinput.value = null;
				replaceinput.value = null;
				update = true;
			}
		}
		else if ($(ele).attr("name") == "remove") {
			wordvalue = $(ele.parentElement).attr("name");
			if (wordvalue) {
				delete words[wordvalue];
				update = true;
			}
		}
		else if ($(ele).attr("name") == "removeall") {
			words = {};
			update = true;
		}
		else if ($(ele).attr("name") == "addinput") {
			if (event.which == '13'){
				wordvalue = wordinput.value;
				replacevalue = replaceinput.value;
				if (wordvalue && wordvalue.trim().length > 0 && replacevalue && replacevalue.trim().length > 0) {
					wordvalue = wordvalue.trim();
					replacevalue = replacevalue.trim();
					words[wordvalue] = {};
					words[wordvalue].replace = replacevalue;
					words[wordvalue].exact = $(settingspanel).find("#chataliases-word-exact").prop("checked");
					words[wordvalue].case = $(settingspanel).find("#chataliases-word-case").prop("checked");
					wordinput.value = null;
					replaceinput.value = null;
					update = true;
				}
			}
		}
		if (update) {
			BDfunctionsDevilBro.saveAllData(words, this.getName(), "words");
			words = BDfunctionsDevilBro.loadAllData(this.getName(), "words");
			
			var containerhtml = ``;
			for (let word in words) {
				var wordcomparison = words[word].exact ? "exact" : "noexact";
				var casesensivity = words[word].case ? "case" : "nocase";
				containerhtml += `<div name="${word}" class="added-word ${wordcomparison} ${casesensivity} chataliases-word">${BDfunctionsDevilBro.encodeToHTML(word)} (${BDfunctionsDevilBro.encodeToHTML(words[word].replace)})<div name="remove" class="word-delete">✖</div></div>`;
			}
			$(settingspanel).find("#chataliases-word-container").html(containerhtml);
		}
	}
	
	toggleInfo (settingspanel) {
		var visible = $(settingspanel).find(".wordtype-info").is(":visible");
		$(settingspanel).find(".wordtype-info").toggle(!visible);
		$(settingspanel).find(".blocked-censored-info").toggle(!visible);
		BDfunctionsDevilBro.saveData("hideInfo", visible, this.getName(), "settings");
	}
	
	bindEventToTextArea (textarea) {
		if (!textarea) return;
		$(textarea)
			.off("input." + this.getName())
			.on("input." + this.getName(), () => {
				if (this.format) {
					this.format = false;
					textarea.focus();
					textarea.selectionStart = 0;
					textarea.selectionEnd = textarea.value.length;
					document.execCommand("insertText", false, this.formatText(textarea.value));
				}
			})
			.off("keydown." + this.getName())
			.on("keydown." + this.getName(), e => {
				if (!e.shiftKey && e.which == 13 && !document.querySelector(".chat form .autocomplete-1TnWNR")) {
					this.format = true;
					$(textarea).trigger("input");
				}
			});
	}
	
	formatText (text) {
		var words = text.trim().split(" ");
		var aliases = BDfunctionsDevilBro.loadAllData(this.getName(), "words");
		var newText = [];
		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			var swapped = false;
			for (let alias in aliases) {
				if (!swapped) {
					let casemod = aliases[alias].case ? "" : "i";
					let exactmod = aliases[alias].exact ? "" : "g";
					let escpAlias = BDfunctionsDevilBro.regEscape(alias);
					let reg = new RegExp(aliases[alias].exact ? "^" + escpAlias + "$" : escpAlias, casemod + exactmod);
					if (reg.test(word)) {
						swapped = true;
						word = word.replace(reg, aliases[alias].replace.replace(new RegExp(BDfunctionsDevilBro.regEscape("\\n"),"g"),"\n"));
					}
				}
			}
			newText.push(word);
		}
		return  newText.length == 1 ? newText[0] : newText.join(" ");
	}
}
