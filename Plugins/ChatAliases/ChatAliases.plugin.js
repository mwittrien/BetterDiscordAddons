//META{"name":"ChatAliases"}*//

class ChatAliases {
	constructor () {
		
		this.switchFixObserver = new MutationObserver(() => {});
		this.settingsWindowObserver = new MutationObserver(() => {});
		
		this.format = false;
		
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

	getVersion () {return "1.4.3";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			var settingspanel = ``;
			var words = BDfunctionsDevilBro.loadAllData(this.getName(), "words");
			settingspanel += `<div class="chataliases-settings">`;
			settingspanel += `<div class="title">Chat-Aliases:</div>`;
			settingspanel += `<div class="input-bar" id="chataliases-input-bar">`;
			settingspanel += `<label class="word-value-label">Replace:</label><input class="word-value" id="chataliases-word-value" onkeypress='` + this.getName() + `.updateContainer(this, "` + this.getName() + `", event);'>`;
			settingspanel += `<label class="replace-value-label">with:</label><input class="replace-value" id="chataliases-replace-value" onkeypress='` + this.getName() + `.updateContainer(this, "` + this.getName() + `", event);'>`;
			settingspanel += `<button name="add" class="word-add" id="chataliases-word-add" onclick='` + this.getName() + `.updateContainer(this, "` + this.getName() + `", event);'>Add</button>`;
			settingspanel += `<button name="removeall" class="remove-all" id="chataliases-remove-all" onclick='` + this.getName() + `.updateContainer(this, "` + this.getName() + `", event);'>Remove All</button></br>`;
			settingspanel += `<label class="word-case-text"><input type="checkbox" class="word-case" id="chataliases-word-case">case-sensitive</label>`;
			settingspanel += `<label class="word-exact-text"><input type="checkbox" class="word-exact" id="chataliases-word-exact" checked>exact word</label>`;
			settingspanel += `</div>`;
			settingspanel += `<div class="word-container" id="chataliases-word-container">`;
			for (let word in words) {
				var wordcomparison = words[word].exact ? "exact" : "noexact";
				var casesensivity = words[word].case ? "case" : "nocase";
				settingspanel += `<div name="` + word + `" class="added-word ` + wordcomparison + ` ` + casesensivity + ` chataliases-word">` + BDfunctionsDevilBro.encodeToHTML(word) + ` (` + BDfunctionsDevilBro.encodeToHTML(words[word].replace) + `)<div class="word-delete" onclick='` + this.getName() + `.updateContainer(this.parentElement, "` + this.getName() + `", event);'>✖</div></div>`;
			}		
			settingspanel += `</div>`;
			var infoHidden = BDfunctionsDevilBro.loadData("hideInfo", this.getName(), "settings") ? " style='display:none;'" : "";
			settingspanel += `<button class="toggle-info" onclick='` + this.getName() + `.toggleInfo(this, "` + this.getName() + `");'>Toggle Information</button>`;
			settingspanel += `<div class="wordtype-info"` + infoHidden + `>`;
			settingspanel += `<div class="wordtype-category"><div class="added-word case fake">case<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will censor/block words while comparing lowercase/uppercase. \napple => apple, not APPLE or AppLe</div></div>`;
			settingspanel += `<div class="wordtype-category"><div class="added-word nocase fake">not case<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will censor/block words while ignoring lowercase/uppercase. \napple => apple, APPLE and AppLe</div></div>`;
			settingspanel += `<div class="wordtype-category"><div class="added-word exact fake">exact<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will only censor/block words that are exactly the selected word. \napple => apple, not applepie or pineapple</div></div>`;
			settingspanel += `<div class="wordtype-category"><div class="added-word noexact fake">not exact<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will censor/block all words containing the selected word. \napple => apple, applepie and pineapple</div></div>`;
			settingspanel += `</div>`;
			settingspanel += `</div>`;
			return settingspanel;
		}
    }

	//legacy
	load () {
		BdApi.injectCSS(this.getName() + "CSS", this.css);
	}

	start () {
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
			
			this.settingsWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && node.tagName && node.getAttribute("layer-id") == "user-settings") this.bindEventToTextArea();
							});
						}
					}
				);
			});
			if (document.querySelector(".layers")) this.settingsWindowObserver.observe(document.querySelector(".layers"), {childList:true});
			
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);	
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.bindEventToTextArea();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.switchFixObserver.disconnect();
			this.settingsWindowObserver.disconnect();
			$(".channelTextArea-1HTP3C").find("textarea").off("keydown." + this.getName()).off("input." + this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.bindEventToTextArea();
		}
	}
	
	
	// begin of own functions
	
	static updateContainer (ele, pluginName, event) {
		var settingspanel = BDfunctionsDevilBro.getSettingsPanelDiv(ele);
		var words = BDfunctionsDevilBro.loadAllData(pluginName, "words");
		words = words ? words : {};
		var wordvalue = null;
		var replacevalue = null;
		var wordinput = settingspanel.querySelector("#chataliases-word-value");
		var replaceinput = settingspanel.querySelector("#chataliases-replace-value");
		if (ele.tagName == "BUTTON") {
			if (ele.name == "add") {
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
				}
			}
			else if (ele.name == "removeall") {
				words = {};
			}
		}
		else if (ele.tagName == "INPUT") {
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
				}
			}
		}
		else if (ele.tagName == "DIV") {
			wordvalue = $(ele).attr("name");
			if (wordvalue) {
				delete words[wordvalue];
			}
		}
		
		BDfunctionsDevilBro.saveAllData(words, pluginName, "words");
		words = BDfunctionsDevilBro.loadAllData(pluginName, "words");
		
		var container = ``;
		for (let word in words) {
			var wordcomparison = words[word].exact ? "exact" : "noexact";
			var casesensivity = words[word].case ? "case" : "nocase";
			container += `<div name="` + word + `" class="added-word ` + wordcomparison + ` ` + casesensivity + ` chataliases-word">` + BDfunctionsDevilBro.encodeToHTML(word) + ` (` + BDfunctionsDevilBro.encodeToHTML(words[word].replace) + `)<div class="word-delete" onclick='` + pluginName + `.updateContainer(this.parentElement, "` + pluginName + `", event);'>✖</div></div>`;
		}
		
		$(settingspanel).find("#chataliases-word-container").html(container);
	}
	
	static toggleInfo (btn, pluginName) {
		var settingspanel = BDfunctionsDevilBro.getSettingsPanelDiv(btn);
		var visible = $(settingspanel).find(".wordtype-info").is(":visible");
		if (visible) {
			$(settingspanel).find(".wordtype-info").hide();
			$(settingspanel).find(".blocked-censored-info").hide();
		}
		else if (!visible) {
			$(settingspanel).find(".wordtype-info").show();
			$(settingspanel).find(".blocked-censored-info").show();
		}
		BDfunctionsDevilBro.saveData("hideInfo", visible, pluginName, "settings");
	}
	
	bindEventToTextArea () {
		var textarea = document.querySelector(".channelTextArea-1HTP3C textarea");
		if (textarea) {
			var BFRenabled = false;
			var events = $._data(textarea, 'events') ? $._data(textarea, 'events') : {};
			for (var event in events.keypress) {
				if (events.keypress[event].namespace == "BFRedux") BFRenabled = true;
			}
			if (BFRenabled) {
				this.eventWithBFR(textarea);
			}
			else {
				this.eventWithoutBFR(textarea);
			}
		}
	}
	
	eventWithoutBFR (textarea) {
		$(textarea)
			.off("keydown." + this.getName())
			.on("keydown." + this.getName(), e => {
				if (!e.shiftKey && e.which == 13) {
					this.formatText(e.target);
				}
			});
	}
	
	eventWithBFR (textarea) {
		$(textarea)
			.off("input." + this.getName())
			.on("input." + this.getName(), e => {
				if (!this.format) return;
				this.format = false;
				this.formatText(e.target);
			})
			.off("keydown." + this.getName())
			.on("keydown." + this.getName(), e => {
				if (!e.shiftKey && e.which == 13) this.format = true;
			});
	}
	
	formatText (textarea) {
		var text = textarea.value;
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
						word = word.replace(reg, aliases[alias].replace);
					}
				}
			}
			newText.push(word);
		}
		newText = newText.length == 1 ? newText[0] : newText.join(" ");
		BDfunctionsDevilBro.getOwnerInstance({"node":textarea, "name":"ChannelTextAreaForm", "up":true}).setState({textValue:newText});
	}
}
