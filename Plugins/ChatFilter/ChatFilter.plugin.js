//META{"name":"ChatFilter"}*//

class ChatFilter {
	constructor () {
		this.types = ["blocked","censored"];
		
		this.defaultReplace = {
			"blocked":"~~BLOCKED~~",
			"censored":"$!%&%!&"
		};
		
		this.switchFixObserver = new MutationObserver(() => {});
		this.chatWindowObserver = new MutationObserver(() => {});
		this.messageChangeObserver = new MutationObserver(() => {});
		this.settingsWindowObserver = new MutationObserver(() => {});
		
		this.css = ` 
			.message-group .comment .accessory.blocked:not(.revealed),
			.message-group .comment .markup.blocked:not(.revealed) {
				font-weight: bold;
				font-style: italic;
			}
			
			.message-group .comment .accessory.censored:not(.revealed),
			.message-group .comment .markup.censored:not(.revealed) {
				
			}
		
			.chatfilter-settings .title {
				color: #757C87;
				font-size: 20px;
				font-weight: bold;
				text-transform: capitalize;
				margin: 0 0 10px 0 !important;
				padding: 0 !important;
			}

			.chatfilter-settings .input-bar {
				margin: 0 !important;
				padding: 0 !important;
			}

			.chatfilter-settings .replace-value-label,
			.chatfilter-settings .word-value-label {
				position: relative;
				display: inline-block;
				color: #757C87;
				font-weight: bold;
				margin: 0 5px 0 0 !important;
				padding: 0 !important;
			}

			.chatfilter-settings input.default-replace-value,
			.chatfilter-settings input.replace-value,
			.chatfilter-settings input.word-value {
				width: 150px;
				height: 21px;
				margin: 0 15px 0 0 !important;
				padding: 0 !important;
				border-radius: 5px;
			}

			.chatfilter-settings input:disabled {
				color: #292B2F;
				cursor: no-drop;
				background-color: #36393F;
				border-color: #292B2F;
			}

			.chatfilter-settings button.word-add,
			.chatfilter-settings button.toggle-info,
			.chatfilter-settings button.remove-all {
				height: 21px;
				font-weight: 500;
				margin: 0 15px 0 0 !important;
				padding: 0 7px 0 7px !important;
				border-radius: 5px;
			}

			.chatfilter-settings button.remove-all {
				color: red;
				margin: 0 15px 0 15px !important;
			}

			.chatfilter-settings input.showmsg-check,
			.chatfilter-settings input.blockhide-check,
			.chatfilter-settings input.word-exact,
			.chatfilter-settings input.word-case {
				position: relative;
				margin: 0 5px 0 0 !important;
				padding: 0 !important;
				top: 3px;
				width: 15px;
				height: 15px;
				cursor: pointer;
			}

			.chatfilter-settings .replace-text,
			.chatfilter-settings .showmsg-check-text,
			.chatfilter-settings .blockhide-check-text,
			.chatfilter-settings .word-exact-text,
			.chatfilter-settings .word-case-text {
				position: relative;
				display: inline-block;
				color: #757C87;
				font-weight: bold;
				margin: 0 15px 0 0 !important;
				padding: 0 !important;
			}

			.chatfilter-settings .replace-text {
				width: 300px;
			}
			
			.chatfilter-settings .replace-text,
			.chatfilter-settings .showmsg-check-text,
			.chatfilter-settings .blockhide-check-text {
				top: 1px;
			}

			.chatfilter-settings .showmsg-settings,
			.chatfilter-settings .blockhide-settings {
				margin: 10px 0 0 0 !important;
				padding: 0 !important;
			}
			
			.chatfilter-settings .word-container {
				min-height: 30px;
				background-color: #36393F;
				margin: 10px 2px 20px 2px !important;
				padding: 5px !important;
				border-radius: 5px;
			}

			.chatfilter-settings .added-word {
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

			.chatfilter-settings .added-word.case {
				background-color: #6699ff;
			}

			.chatfilter-settings .added-word.nocase {
				background-color: #ff6666;
			}

			.chatfilter-settings .added-word.exact {
				border: 2px solid #ffcc00;
			}

			.chatfilter-settings .added-word.noexact {
				border: 2px solid #009933;
			}

			.chatfilter-settings .added-word.fake {
				float: left;
				text-align: center;
				width: 90px;
			}

			.chatfilter-settings .word-delete {
				color: black;
				position: relative;
				display: inline-block;
				bottom: 1px;
				width: 15px;
				text-align: center;
				font-size: 13px;
				margin: 2px !important;
				padding: 2px !important;
				border-radius: 5px;
			}

			.chatfilter-settings .word-delete.fake {
				bottom: 0px;
			}

			.chatfilter-settings .word-delete:hover {
				color: #757C87;
				background-color: #26272B;
				cursor: pointer;
			}

			.chatfilter-settings .replace-word-text {
				margin: 0 10px 0 0 !important;
			}
			
			.chatfilter-settings .replace-settings,
			.chatfilter-settings .wordtype-info,
			.chatfilter-settings .blocked-censored-info {
				color: #757C87;
				font-weight: bold;
				background-color: #36393F;
				margin: 10px 2px 20px 2px !important;
				padding: 10px !important;
				border-radius: 5px;
			}
			
			.chatfilter-settings .wordtype-category {
				overflow: hidden;
				color: #757C87;
				font-weight: bold;
				margin: 10px 2px 10px 2px !important;
				padding: 0 !important;
			}
			
			.chatfilter-settings .wordtype-description {
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

	getName () {return "ChatFilter";}

	getDescription () {return "Allows the user to censor words or block complete messages based on words in the chatwindow.";}

	getVersion () {return "3.0.6";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			var replaceText = {
				"blocked": "Default: Replace blocked messages with:",
				"censored": "Default: Replace censored words with:"
			};
			var settingspanel = ``;
			for (var i in this.types) {
				var key = this.types[i];
				var words = BDfunctionsDevilBro.loadData(key, this.getName(), "words");
				settingspanel += `<div class="chatfilter-settings">`;
				settingspanel += `<div class="title">` + key + `-Words:</div>`;
				settingspanel += `<div class="input-bar" id="` + key + `-input-bar">`;
				settingspanel += `<label class="word-value-label">Replace:</label><input class="word-value" id="` + key + `-word-value" onkeypress='` + this.getName() + `.updateContainer(this, "` + key + `", "` + this.getName() + `", event);'>`;
				settingspanel += `<label class="replace-value-label">with:</label><input class="replace-value" id="` + key + `-replace-value" onkeypress='` + this.getName() + `.updateContainer(this, "` + key + `", "` + this.getName() + `", event);'>`;
				settingspanel += `<button name="add" class="word-add" id="` + key + `-word-add" onclick='` + this.getName() + `.updateContainer(this, "` + key + `", "` + this.getName() + `", event);'>Add</button>`;
				settingspanel += `<button name="removeall" class="remove-all" id="` + key + `-remove-all" onclick='` + this.getName() + `.updateContainer(this, "` + key + `", "` + this.getName() + `", event);'>Remove All</button></br>`;
				settingspanel += `<label class="word-case-text"><input type="checkbox" class="word-case" id="` + key + `-word-case">case-sensitive</label>`;
				settingspanel += `<label class="word-exact-text"><input type="checkbox" class="word-exact" id="` + key + `-word-exact" checked>exact word</label>`;
				settingspanel += `</div>`;
				settingspanel += `<div class="word-container" id="` + key + `-word-container">`;
				for (let word in words) {
					var replaceword = words[word].replace ? " (" + BDfunctionsDevilBro.encodeToHTML(words[word].replace) + ")" : "";
					var wordcomparison = words[word].exact ? "exact" : "noexact";
					var casesensivity = words[word].case ? "case" : "nocase";
					settingspanel += `<div name="` + word + `" class="added-word ` + wordcomparison + ` ` + casesensivity + ` ` + key + `-word">` + BDfunctionsDevilBro.encodeToHTML(word) + replaceword + `<div class="word-delete" onclick='` + this.getName() + `.updateContainer(this.parentElement, "` + key + `", "` + this.getName() + `", event);'>✖</div></div>`;
				}		
				settingspanel += `</div>`;
				
				var showMessageOnClick = BDfunctionsDevilBro.loadData(key, this.getName(), "showMessageOnClick") ? " checked" : "";
				var hideBlockedMessages = "";
				var disabled = "";
				if (key == "blocked") {
					hideBlockedMessages = BDfunctionsDevilBro.loadData(key, this.getName(), "hideBlockedMessages") ? " checked" : "";
					disabled = hideBlockedMessages ? " disabled" : "";
				}
				var replaceString = BDfunctionsDevilBro.loadData(key, this.getName(), "replaceString");
				replaceString = (replaceString && replaceString.length > 0) ? replaceString : this.defaultReplace[key];
				settingspanel += `<div class="replace-settings" id="` + key + `-replace-settings"><div class="replace-text" id="` + key + `-replace-text">` + replaceText[key] + `</div><input class="default-replace-value" id="` + key + `-default-replace-value" value="` + replaceString + `" placeholder="` + replaceString + `" onchange='` + this.getName() + `.saveReplace(this, "` + key + `", "` + this.getName() + `");'` + disabled + `>`;
				settingspanel += `<div class="showmsg-settings"><label class="showmsg-check-text"><input type="checkbox" name="showmsg" class="showmsg-check" onchange='` + this.getName() + `.saveCheckbox(this, "` + key + `", "` + this.getName() + `");'` + showMessageOnClick + `>Show original message on click.</label></div>`;
				
				if (key == "blocked") {
					settingspanel += `<div class="blockhide-settings"><label class="blockhide-check-text"><input type="checkbox" name="blockhide" class="blockhide-check" onchange='` + this.getName() + `.saveCheckbox(this, "` + key + `", "` + this.getName() + `");'` + hideBlockedMessages + `>Completely hide blocked messages.</label></div>`;
				}
				
				settingspanel += `</div>`;
			}
			var infoHidden = BDfunctionsDevilBro.loadData("hideInfo", this.getName(), "settings") ? " style='display:none;'" : "";
			settingspanel += `<button class="toggle-info" onclick='` + this.getName() + `.toggleInfo(this, "` + this.getName() + `");'>Toggle Information</button>`;
			settingspanel += `<div class="wordtype-info"` + infoHidden + `>`;
			settingspanel += `<div class="wordtype-category"><div class="added-word case fake">case<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will censor/block words while comparing lowercase/uppercase. \napple => apple, not APPLE or AppLe</div></div>`;
			settingspanel += `<div class="wordtype-category"><div class="added-word nocase fake">not case<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will censor/block words while ignoring lowercase/uppercase. \napple => apple, APPLE and AppLe</div></div>`;
			settingspanel += `<div class="wordtype-category"><div class="added-word exact fake">exact<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will only censor/block words that are exactly the selected word. \napple => apple, not applepie or pineapple</div></div>`;
			settingspanel += `<div class="wordtype-category"><div class="added-word noexact fake">not exact<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will censor/block all words containing the selected word. \napple => apple, applepie and pineapple</div></div>`;
			settingspanel += `</div>`;
			settingspanel += `<div class="blocked-censored-info"` + infoHidden + `>Blocked in this case means, that a message that contains one of the words will be completely blocked in your chat window. Censored means you will still be able to read the message but the censored words will be unreadable. Supports Regular Expressions.</div>`;
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
			
			this.chatWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if ($(node).find(".message").length > 0) {
									this.messageChangeObserver.observe(node, {childList:true, characterData:true, subtree:true});
									$(node).find(".markup, .accessory").each((_,message) => {
										this.hideMessage(message);
									});
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true});
			
			this.settingsWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && $(node).attr("layer-id") == "user-settings") this.hideAllMessages();
							});
						}
					}
				);
			});
			if (document.querySelector(".layers")) this.settingsWindowObserver.observe(document.querySelector(".layers"), {childList:true});
			
			this.messageChangeObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.type == "characterData") {
							this.hideMessage(change.target.parentElement);
						}
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if ($(node).attr("class") == "message") this.hideMessage($(node).find(".markup")[0]);
							});
						}
					}
				);
			});
			
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);
			
			this.hideAllMessages();
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.switchFixObserver.disconnect();
			this.chatWindowObserver.disconnect();
			this.messageChangeObserver.disconnect();
			this.settingsWindowObserver.disconnect();
			
			$(".markup.blocked, .markup.censored").each((_,message) => {
				this.resetMessage(message);
			});
			
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.hideAllMessages();
			if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true});
		}
	}
	
	
	// begin of own functions
	
	static updateContainer (ele, type, pluginName, event) {
		var settingspanel = BDfunctionsDevilBro.getSettingsPanelDiv(ele);
		var words = BDfunctionsDevilBro.loadData(type, pluginName, "words");
		words = words ? words : {};
		var wordvalue = null;
		var replacevalue = null;
		var wordinput = settingspanel.querySelector("#" + type + "-word-value");
		var replaceinput = settingspanel.querySelector("#" + type + "-replace-value");
		if (ele.tagName == "BUTTON") {
			if (ele.name == "add") {
				wordvalue = wordinput.value;
				replacevalue = replaceinput.value;
				if (wordvalue && wordvalue.trim().length > 0) {
					wordvalue = wordvalue.trim();
					replacevalue = replacevalue.trim();
					words[wordvalue] = {};
					words[wordvalue].replace = replacevalue;
					words[wordvalue].exact = $(settingspanel).find("#" + type + "-word-exact").prop("checked");
					words[wordvalue].case = $(settingspanel).find("#" + type + "-word-case").prop("checked");
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
				if (wordvalue && wordvalue.trim().length > 0) {
					wordvalue = wordvalue.trim();
					replacevalue = replacevalue.trim();
					words[wordvalue] = {};
					words[wordvalue].replace = replacevalue.length > 0 ? replacevalue : null;
					words[wordvalue].exact = $(settingspanel).find("#" + type + "-word-exact").prop("checked");
					words[wordvalue].case = $(settingspanel).find("#" + type + "-word-case").prop("checked");
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
		
		BDfunctionsDevilBro.saveData(type, words, pluginName, "words");
		words = BDfunctionsDevilBro.loadData(type, pluginName, "words");
		
		var container = ``;
		for (let word in words) {
			var replaceword = words[word].replace ? " (" + BDfunctionsDevilBro.encodeToHTML(words[word].replace) + ")" : "";
			var wordcomparison = words[word].exact ? "exact" : "noexact";
			var casesensivity = words[word].case ? "case" : "nocase";
			container += `<div name="` + word + `" class="added-word ` + wordcomparison + ` ` + casesensivity + ` ` + type + `-word">` + BDfunctionsDevilBro.encodeToHTML(word) + replaceword + `<div class="word-delete" onclick='` + pluginName + `.updateContainer(this.parentElement, "` + type + `", "` + pluginName + `", event);'>✖</div></div>`;
		}
		
		$(settingspanel).find("#" + type + "-word-container").html(container);
	}
	
	static saveReplace (input, type, pluginName) {
		var settingspanel = BDfunctionsDevilBro.getSettingsPanelDiv(input);
		var wordvalue = input.value;
		if (wordvalue && wordvalue.trim().length > 0) {
			wordvalue = wordvalue.trim();
			BDfunctionsDevilBro.saveData(type, wordvalue, pluginName, "replaceString");
		}
	}
	
	static saveCheckbox (input, type, pluginName) {
		var settingspanel = BDfunctionsDevilBro.getSettingsPanelDiv(input);
		var checked = $(input).prop("checked");
		if (input.name == "blockhide") {
			$(settingspanel).find("#" + type + "-replace-value").prop("disabled", checked);
			$(settingspanel).find("#" + type + "-default-replace-value").prop("disabled", checked);
			BDfunctionsDevilBro.saveData(type, checked, pluginName, "hideBlockedMessages");
		}
		else if (input.name == "showmsg") {
			BDfunctionsDevilBro.saveData(type, checked, pluginName, "showMessageOnClick");
		}
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
	
	hideAllMessages () {
		$(".markup.blocked, .markup.censored, .accessory.blocked, .accessory.censored").each((_,message) => {
			this.resetMessage(message);
		});
		$(".message-group").each((_,messageContainer) => {
			this.messageChangeObserver.observe(messageContainer, {childList:true, characterData:true, subtree:true});
			$(messageContainer).find(".markup, .accessory").each((_,message) => {
				this.hideMessage(message);
			});
		});
	}
	
	hideMessage (message) {
		if (!$(message).hasClass("blocked") && !$(message).hasClass("censored")) {
			var orightml = $(message).html();
			var newhtml = "";
			
			if (orightml) {
				var blocked = null;
				
				var strings = [];
				var count = 0;
				orightml.split("").forEach((chara) => { 
					if(chara == "<") {
						if (strings[count]) count++;
					}
					strings[count] = strings[count] ? strings[count] + chara : chara; 
					if (chara == ">") {
						count++;
					}
				});
			
				var blockedWords = BDfunctionsDevilBro.loadData("blocked", this.getName(), "words");
				var blocked = false;
				for (let bWord in blockedWords) {
					var blockedReplace = blockedWords[bWord].replace ? blockedWords[bWord].replace : BDfunctionsDevilBro.loadData("blocked", this.getName(), "replaceString");
					blockedReplace = (blockedReplace && blockedReplace.length > 0) ? blockedReplace : this.defaultReplace.blocked;
					var modifier = blockedWords[bWord].case ? "" : "i";
					bWord = blockedWords[bWord].exact ? "^" + bWord + "$" : bWord;
					bWord = BDfunctionsDevilBro.encodeToHTML(bWord);
					
					var reg = new RegExp(BDfunctionsDevilBro.regEscape(bWord), modifier);
					strings.forEach((string,i) => {
						if (string.indexOf("<img draggable") == 0) {
							var emojiname = string.split('alt="').length > 0 ? string.split('alt="')[1] : null;
							emojiname = emojiname ? emojiname.split('"')[0] : null;
							emojiname = emojiname.replace(new RegExp(":", 'g'), "");
							if (reg.test(emojiname)) blocked = true;
						}
						else if (string.indexOf('<a class="embed') == 0) {
							var url = string.split('href="').length > 0 ? string.split('href="')[1] : null;
							url = url ? url.split('"')[0] : null;
							if (reg.test(url)) blocked = true;
						}
						else if (string.indexOf("<") != 0) {
							string.split(" ").forEach((word) => {
								if (reg.test(word)) blocked = true;
							});
						}
					});
					if (blocked) break;
				}
				if (blocked) {
					var hideMessage = BDfunctionsDevilBro.loadData("blocked", this.getName(), "hideBlockedMessages");
					if (hideMessage) {
						$(message).hide();
					}
					newhtml = BDfunctionsDevilBro.encodeToHTML(blockedReplace);
					$(message)
						.html(newhtml)
						.addClass("blocked")
						.data("newhtml",newhtml)
						.data("orightml",orightml);
						
					this.addClickListener(message, "blocked");
				}
				else {
					var censoredWords = BDfunctionsDevilBro.loadData("censored", this.getName(), "words");
					for (let cWord in censoredWords) {
						var censoredReplace = censoredWords[cWord].replace ? censoredWords[cWord].replace : BDfunctionsDevilBro.loadData("censored", this.getName(), "replaceString");
						censoredReplace = (censoredReplace && censoredReplace.length > 0) ? censoredReplace : this.defaultReplace.censored;
						var modifier = censoredWords[cWord].case ? "" : "i";
						cWord = censoredWords[cWord].exact ? "^" + cWord + "$" : cWord;
						cWord = BDfunctionsDevilBro.encodeToHTML(cWord);
						
						var reg = new RegExp(BDfunctionsDevilBro.regEscape(cWord), modifier);
						strings.forEach((string,i) => {
							if (string.indexOf("<img draggable") == 0) {
								var emojiname = string.split('alt="').length > 0 ? string.split('alt="')[1] : null;
								emojiname = emojiname ? emojiname.split('" src')[0] : null;
								emojiname = emojiname.replace(new RegExp(":", 'g'), "");
								if (reg.test(emojiname)) {
									strings[i] = BDfunctionsDevilBro.encodeToHTML(censoredReplace);
									if (strings[i+1] && strings[i+1].indexOf("<input") == 0) {
										strings[i+1] = "";
										if (strings[i-1] && strings[i-1].indexOf("<span") == 0) strings[i-1] = "";
										if (strings[i+2] && strings[i+2].indexOf("</span") == 0) strings[i+2] = "";
									}
								}
							}
							else if (string.indexOf('<a class="embed') == 0) {
								var url = string.split('href="').length > 0 ? string.split('href="')[1] : null;
								url = url ? url.split('"')[0] : null;
								if (reg.test(url)) {
									strings = [BDfunctionsDevilBro.encodeToHTML(censoredReplace)];
								}
							}
							else if (string.indexOf("<") != 0) {
								var newstring = [];
								string.split(" ").forEach((word) => {
									newstring.push(reg.test(word) ? BDfunctionsDevilBro.encodeToHTML(censoredReplace) : word);
								});
								strings[i] = newstring.join(" ");
							}
						});
					}
					
					newhtml = strings.join("");
					
					if (newhtml != orightml) {
						$(message)
							.html(newhtml)
							.addClass("censored")
							.data("newhtml",newhtml)
							.data("orightml",orightml);
							
						this.addClickListener(message, "censored");
					}
				}
			}
		}
	}
	
	resetMessage (message) {
		var orightml = $(message).data("orightml");
		$(message)
			.html(orightml)
			.off("click")
			.removeClass("blocked")
			.removeClass("censored")
			.removeClass("revealed");
	}
	
	addClickListener (message, type) {
		$(message)
			.off("click");
		if (BDfunctionsDevilBro.loadData(type, this.getName(), "showMessageOnClick")) {
			var orightml = $(message).data("orightml");
			var newhtml = $(message).data("newhtml");
			$(message)
				.on("click", () => {	
					if ($(message).hasClass("revealed")) {
						$(message)
							.html(newhtml)
							.removeClass("revealed");
					}
					else {
						$(message)
							.html(orightml)
							.addClass("revealed");
					}
				});
				
		}
	}
}
