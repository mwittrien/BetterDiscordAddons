//META{"name":"ChatFilter"}*//

class ChatFilter {
	constructor () {
		this.types = ["blocked","censored"];
		
		this.defaultReplace = {
			"blocked":"~~BLOCKED~~",
			"censored":"$!%&%!&"
		};
		
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

	getVersion () {return "3.0.9";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			var replaceText = {
				"blocked": "Default: Replace blocked messages with:",
				"censored": "Default: Replace censored words with:"
			};
			var settingshtml = ``;
			for (var i in this.types) {
				var type = this.types[i];
				var words = BDfunctionsDevilBro.loadData(type, this.getName(), "words");
				settingshtml += `<div class="chatfilter-settings">`;
				settingshtml += `<div class="title">${type}-Words:</div>`;
				settingshtml += `<div class="input-bar" id="${type}-input-bar">`;
				settingshtml += `<label class="word-value-label">Replace:</label><input name="inputadd" wordtype="${type}" class="word-value" id="${type}-word-value">`;
				settingshtml += `<label class="replace-value-label">with:</label><input name="inputadd" wordtype="${type}" class="replace-value" id="${type}-replace-value">`;
				settingshtml += `<button name="add" wordtype="${type}" class="word-add" id="${type}-word-add">Add</button>`;
				settingshtml += `<button name="removeall" wordtype="${type}" class="remove-all" id="${type}-remove-all">Remove All</button></br>`;
				settingshtml += `<label class="word-case-text"><input type="checkbox" wordtype="${type}" class="word-case" id="${type}-word-case">case-sensitive</label>`;
				settingshtml += `<label class="word-exact-text"><input type="checkbox" wordtype="${type}" class="word-exact" id="${type}-word-exact" checked>exact word</label>`;
				settingshtml += `</div>`;
				settingshtml += `<div class="word-container" id="${type}-word-container">`;
				for (let word in words) {
					var replaceword = words[word].replace ? "(" + BDfunctionsDevilBro.encodeToHTML(words[word].replace) + ")" : "";
					var wordcomparison = words[word].exact ? "exact" : "noexact";
					var casesensivity = words[word].case ? "case" : "nocase";
					settingshtml += `<div name="${word}" class="added-word ${wordcomparison} ${casesensivity} ${type}-word">${BDfunctionsDevilBro.encodeToHTML(word)} ${replaceword}<div name="remove" wordtype="${type}" class="word-delete">✖</div></div>`;
				}		
				settingshtml += `</div>`;
				var showMessageOnClick = BDfunctionsDevilBro.loadData(type, this.getName(), "showMessageOnClick") ? " checked" : "";
				var hideBlockedMessages = "";
				var disabled = "";
				if (type == "blocked") {
					hideBlockedMessages = BDfunctionsDevilBro.loadData(type, this.getName(), "hideBlockedMessages") ? " checked" : "";
					disabled = hideBlockedMessages ? " disabled" : "";
				}
				var replaceString = BDfunctionsDevilBro.loadData(type, this.getName(), "replaceString");
				replaceString = (replaceString && replaceString.length > 0) ? replaceString : this.defaultReplace[type];
				settingshtml += `<div class="replace-settings" id="${type}-replace-settings"><div class="replace-text" id="${type}-replace-text">${replaceText[type]}</div><input wordtype="${type}" class="default-replace-value" id="${type}-default-replace-value" value="${replaceString}" placeholder="${replaceString}"${disabled}>`;
				settingshtml += `<div class="showmsg-settings"><label class="showmsg-check-text"><input type="checkbox" name="showmsg" wordtype="${type}" class="showmsg-check"${showMessageOnClick}>Show original message on click.</label></div>`;
				if (type == "blocked") {
					settingshtml += `<div class="blockhide-settings"><label class="blockhide-check-text"><input type="checkbox" wordtype="${type}" name="blockhide" class="blockhide-check"${hideBlockedMessages}>Completely hide blocked messages.</label></div>`;
				}
				settingshtml += `</div>`;
			}
			var infoHidden = BDfunctionsDevilBro.loadData("hideInfo", this.getName(), "settings") ? " style='display:none;'" : "";
			settingshtml += `<button class="toggle-info">Toggle Information</button>`;
			settingshtml += `<div class="wordtype-info"${infoHidden}>`;
			settingshtml += `<div class="wordtype-category"><div class="added-word case fake">case<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will censor/block words while comparing lowercase/uppercase. \napple => apple, not APPLE or AppLe</div></div>`;
			settingshtml += `<div class="wordtype-category"><div class="added-word nocase fake">not case<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will censor/block words while ignoring lowercase/uppercase. \napple => apple, APPLE and AppLe</div></div>`;
			settingshtml += `<div class="wordtype-category"><div class="added-word exact fake">exact<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will only censor/block words that are exactly the selected word. \napple => apple, not applepie or pineapple</div></div>`;
			settingshtml += `<div class="wordtype-category"><div class="added-word noexact fake">not exact<div class="word-delete fake">✖</div></div><div class="wordtype-description">Will censor/block all words containing the selected word. \napple => apple, applepie and pineapple</div></div>`;
			settingshtml += `</div>`;
			settingshtml += `<div class="blocked-censored-info"${infoHidden}>Blocked in this case means, that a message that contains one of the words will be completely blocked in your chat window. Censored means you will still be able to read the message but the censored words will be unreadable. Supports Regular Expressions.</div>`;
			settingshtml += `</div>`;
			
			var settingspanel = $(settingshtml)[0];
			$(settingspanel)
				.on("keypress", ".word-value, .replace-value", (e) => {this.updateContainer(settingspanel, e);})
				.on("click", ".word-add, .word-delete:not(.fake), .remove-all", (e) => {this.updateContainer(settingspanel, e);})
				.on("change", ".default-replace-value", (e) => {this.saveReplace(e);})
				.on("change", ".showmsg-check, .blockhide-check", (e) => {this.saveCheckbox(settingspanel, e);})
				.on("click", ".toggle-info", () => {this.toggleInfo(settingspanel);});
			return settingspanel;
		}
    }

	//legacy
	load () {
		BdApi.injectCSS(this.getName() + "CSS", this.css);
	}

	start () {
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"></script>');
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			this.chatWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".message")) {
									this.messageChangeObserver.observe(node, {childList:true, characterData:true, subtree:true});
									node.querySelectorAll(".markup, .accessory").forEach(message => {
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
			
			this.hideAllMessages();
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.chatWindowObserver.disconnect();
			this.messageChangeObserver.disconnect();
			this.settingsWindowObserver.disconnect();
			
			document.querySelectorAll(".markup.blocked, .markup.censored").forEach(message => {
				this.resetMessage(message);
			});
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.hideAllMessages();
			if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true});
		}
	}
	
	
	// begin of own functions
	
	updateContainer (settingspanel, e) {
		var update = false;
		var ele = e.target;
		var type = $(ele).attr("wordtype");
		var words = BDfunctionsDevilBro.loadData(type, this.getName(), "words");
		words = words ? words : {};
		var wordvalue = null;
		var replacevalue = null;
		var wordinput = settingspanel.querySelector("#" + type + "-word-value");
		var replaceinput = settingspanel.querySelector("#" + type + "-replace-value");
		if ($(ele).attr("name") == "add") {
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
				if (wordvalue && wordvalue.trim().length > 0) {
					wordvalue = wordvalue.trim();
					replacevalue = replacevalue.trim();
					words[wordvalue] = {};
					words[wordvalue].replace = replacevalue.length > 0 ? replacevalue : null;
					words[wordvalue].exact = $(settingspanel).find("#" + type + "-word-exact").prop("checked");
					words[wordvalue].case = $(settingspanel).find("#" + type + "-word-case").prop("checked");
					wordinput.value = null;
					replaceinput.value = null;
					update = true;
				}
			}
		}
		
		if (update) {
			BDfunctionsDevilBro.saveData(type, words, this.getName(), "words");
			words = BDfunctionsDevilBro.loadData(type, this.getName(), "words");
			
			var containerhtml = ``;
			for (let word in words) {
				var replaceword = words[word].replace ? "(" + BDfunctionsDevilBro.encodeToHTML(words[word].replace) + ")" : "";
				var wordcomparison = words[word].exact ? "exact" : "noexact";
				var casesensivity = words[word].case ? "case" : "nocase";
				containerhtml += `<div name="${word}" class="added-word ${wordcomparison} ${casesensivity} ${type}-word">${BDfunctionsDevilBro.encodeToHTML(word)} ${replaceword}<div wordtype="${type}" name="remove" class="word-delete">✖</div></div>`;
			}
			
			$(settingspanel).find("#" + type + "-word-container").html(containerhtml);
		}
	}
	
	saveReplace (e) {
		var input = e.target;
		var type = $(input).attr("wordtype");
		var wordvalue = input.value;
		if (wordvalue && wordvalue.trim().length > 0) {
			wordvalue = wordvalue.trim();
			BDfunctionsDevilBro.saveData(type, wordvalue, this.getName(), "replaceString");
		}
	}
	
	saveCheckbox (settingspanel, e) {
		var input = e.target;
		var type = $(input).attr("wordtype");
		var checked = $(input).prop("checked");
		if ($(input).attr("name") == "blockhide") {
			$(settingspanel).find("#" + type + "-replace-value").prop("disabled", checked);
			$(settingspanel).find("#" + type + "-default-replace-value").prop("disabled", checked);
			BDfunctionsDevilBro.saveData(type, checked, this.getName(), "hideBlockedMessages");
		}
		else if ($(input).attr("name") == "showmsg") {
			BDfunctionsDevilBro.saveData(type, checked, this.getName(), "showMessageOnClick");
		}
	}
	
	toggleInfo (settingspanel) {
		var visible = $(settingspanel).find(".wordtype-info").is(":visible");
		$(settingspanel).find(".wordtype-info").toggle(!visible);
		$(settingspanel).find(".blocked-censored-info").toggle(!visible);
		BDfunctionsDevilBro.saveData("hideInfo", visible, this.getName(), "settings");
	}
	
	hideAllMessages () {
		document.querySelectorAll(".markup.blocked, .markup.censored, .accessory.blocked, .accessory.censored").forEach(message => {
			this.resetMessage(message);
		});
		document.querySelectorAll(".message-group").forEach(messageContainer => {
			this.messageChangeObserver.observe(messageContainer, {childList:true, characterData:true, subtree:true});
			messageContainer.querySelectorAll(".markup, .accessory").forEach(message => {
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
					bWord = blockedWords[bWord].exact ? "^" + BDfunctionsDevilBro.regEscape(bWord) + "$" : BDfunctionsDevilBro.regEscape(bWord);
					bWord = BDfunctionsDevilBro.encodeToHTML(bWord);
					
					var reg = new RegExp(bWord, modifier);
					strings.forEach(string => {
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
						cWord = censoredWords[cWord].exact ? "^" + BDfunctionsDevilBro.regEscape(cWord) + "$" : BDfunctionsDevilBro.regEscape(cWord);
						cWord = BDfunctionsDevilBro.encodeToHTML(cWord);
						
						var reg = new RegExp(cWord, modifier);
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
