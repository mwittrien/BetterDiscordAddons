//META{"name":"ChatFilter"}*//

class ChatFilter {
	constructor () {
		this.types = ["blocked","censored"];
		
		this.defaultReplace = {
			"blocked":"~~BLOCKED~~",
			"censored":"$!%&%!&"
		};
		
		this.serverSwitchObserver = new MutationObserver(() => {});
		this.channelSwitchObserver = new MutationObserver(() => {});
		this.chatWindowObserver = new MutationObserver(() => {});
		this.messageChangeObserver = new MutationObserver(() => {});
		this.settingsWindowObserver = new MutationObserver(() => {});
		
		this.css = ` 
			.message-group .comment .markup.blocked {
				font-weight: bold;
				font-style: italic;
			}
			
			.message-group .comment .markup.censored {
				
			}
		
			.bda-slist .title {
				color: #757C87;
				font-size: 20px;
				font-weight: bold;
				text-transform: capitalize;
				margin: 0 !important;
				padding: 0 !important;
			}

			.bda-slist .input-bar {
				margin: 0 !important;
				padding: 0 !important;
			}

			.bda-slist input.replace-value,
			.bda-slist input.word-value {
				width: 150px;
				height: 21px;
				margin: 0 15px 0 0 !important;
				padding: 0 !important;
				border-radius: 5px;
			}

			.bda-slist input.replace-value:disabled ,
			.bda-slist input.word-value:disabled {
				color: #292B2F;
				cursor: no-drop;
				background-color: #36393F;
				border-color: #292B2F;
			}

			.bda-slist button.word-add,
			.bda-slist button.remove-all {
				height: 21px;
				font-weight: 500;
				margin: 0 15px 0 0 !important;
				padding: 0 7px 0 7px !important;
				border-radius: 5px;
			}

			.bda-slist button.remove-all {
				color: red;
				margin: 0 15px 0 15px !important;
			}

			.bda-slist input.showmsg-case,
			.bda-slist input.blockhide-case,
			.bda-slist input.word-case {
				position: relative;
				margin: 0 5px 0 0 !important;
				padding: 0 !important;
				top: 4px;
				width: 15px;
				height: 15px;
				cursor: pointer;
			}

			.bda-slist .replace-text,
			.bda-slist .showmsg-case-text,
			.bda-slist .blockhide-case-text,
			.bda-slist .word-case-text {
				position: relative;
				display: inline-block;
				color: #757C87;
				font-weight: bold;
				margin: 0 5px 0 0 !important;
				padding: 0 !important;
			}

			.bda-slist .replace-text {
				width: 230px;
			}
			
			.bda-slist .replace-text,
			.bda-slist .showmsg-case-text,
			.bda-slist .blockhide-case-text {
				top: 1px;
			}

			.bda-slist .showmsg-settings,
			.bda-slist .blockhide-settings {
				margin: 10px 0 0 0 !important;
				padding: 0 !important;
			}
			.bda-slist .word-container {
				min-height: 30px;
				background-color: #36393F;
				margin: 10px 2px 20px 2px !important;
				padding: 5px !important;
				border-radius: 5px;
			}

			.bda-slist .added-word {
				position: relative;
				display: inline-block;
				font-weight: 500;
				line-height: 12px;
				margin: 2px !important;
				padding: 3px 2px 2px 2px !important;
				border-radius: 5px;
			}

			.bda-slist .added-word.case {
				background-color: #6699ff;
			}

			.bda-slist .added-word.nocase {
				background-color: #ff6666;
			}

			.bda-slist .word-delete {
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

			.bda-slist .word-delete.fake{
				bottom: 0px;
			}

			.bda-slist .word-delete:hover {
				color: #757C87;
				background-color: #26272B;
				cursor: pointer;
			}

			.bda-slist .replace-word-text {
				margin: 0 10px 0 0 !important;
			}
			
			.bda-slist .replace-settings,
			.bda-slist .blocked-censored-info {
				color: #757C87;
				font-weight: bold;
				background-color: #36393F;
				margin: 10px 2px 20px 2px !important;
				padding: 10px !important;
				border-radius: 5px;
			}`;
	}

	getName () {return "ChatFilter";}

	getDescription () {return "Allows the user to censor words or block complete messages based on words in the chatwindow.";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			var replaceText = {
				"blocked": "Replace blocked messages with:",
				"censored": "Replace censored words with:"
			}
			var settingspanel = ``;
			for (var i in this.types) {
				var key = this.types[i];
				var words = BDfunctionsDevilBro.loadData(key, this.getName(), "words");
				settingspanel += `<div class="title">` + key + `-Words:</div>`;
				settingspanel += `<div class="input-bar" id="` + key + `-input-bar">`;
				settingspanel += `<input class="word-value" id="` + key + `-word-value" onkeypress='` + this.getName() + `.updateContainer(this, "` + key + `", "` + this.getName() + `", event);'>`;
				settingspanel += `<button name="add" class="word-add" id="` + key + `-word-add" onclick='` + this.getName() + `.updateContainer(this, "` + key + `", "` + this.getName() + `", event);'>Add</button>`;
				settingspanel += `<input type="checkbox" class="word-case" id="` + key + `-word-case"><label class="word-case-text">case-sensitive</label>`;
				settingspanel += `<div class="added-word case">case<div class="word-delete fake">✖</div></div>`;
				settingspanel += `<div class="added-word nocase">nocase<div class="word-delete fake">✖</div></div>`;
				settingspanel += `<button name="removeall" class="remove-all" id="` + key + `-remove-all" onclick='` + this.getName() + `.updateContainer(this, "` + key + `", "` + this.getName() + `", event);'>Remove All</button>`;
				settingspanel += `</div>`;
				settingspanel += `<div class="word-container" id="` + key + `-word-container">`;
				for (let word in words) {
					var casesensivity = words[word] ? "case" : "nocase";
					settingspanel += `<div name="` + word + `" class="added-word ` + casesensivity + ` ` + key + `-word">` + word + `<div class="word-delete" onclick='` + this.getName() + `.updateContainer(this.parentElement, "` + key + `", "` + this.getName() + `", event);'>✖</div></div>`;
				}		
				settingspanel += `</div>`;
				
				var showMessageOnHover = BDfunctionsDevilBro.loadData(key, this.getName(), "showMessageOnHover") ? " checked" : "";
				var hideBlockedMessages = "";
				var disabled = "";
				if (key == "blocked") {
					hideBlockedMessages = BDfunctionsDevilBro.loadData(key, this.getName(), "hideBlockedMessages") ? " checked" : "";
					disabled = hideBlockedMessages ? " disabled" : "";
				}
				var replaceString = BDfunctionsDevilBro.loadData(key, this.getName(), "replaceString");
				replaceString = (replaceString && replaceString.length > 0) ? replaceString : this.defaultReplace[key];
				settingspanel += `<div class="replace-settings" id="` + key + `-replace-settings"><div class="replace-text" id="` + key + `-replace-text">` + replaceText[key] + `</div><input class="replace-value" id="` + key + `-replace-value" value="` + replaceString + `" placeholder="` + replaceString + `" onchange='` + this.getName() + `.saveReplace(this, "` + key + `", "` + this.getName() + `");'` + disabled + `>`;
				settingspanel += `<div class="showmsg-settings"><input type="checkbox" name="showmsg" class="showmsg-case" onchange='` + this.getName() + `.saveCheckbox(this, "` + key + `", "` + this.getName() + `");'` + showMessageOnHover + `><label class="showmsg-case-text">Show original message on hover.</label></div>`;
				
				if (key == "blocked") {
					settingspanel += `<div class="blockhide-settings"><input type="checkbox" name="blockhide" class="blockhide-case" onchange='` + this.getName() + `.saveCheckbox(this, "` + key + `", "` + this.getName() + `");'` + hideBlockedMessages + `><label class="blockhide-case-text">Completely hide blocked messages.</label></div>`;
				}
				
				settingspanel += `</div>`;
			}
			
			settingspanel += `<div class="blocked-censored-info">Blocked in this case means, that a message that contains one of the words will be completely blocked in your chat window. Censored means you will still be able to read the message but the censored words will be unreadable.</div>`;
			return settingspanel;
		}
    }

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
			this.serverSwitchObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.type == "attributes" && change.attributeName == "class" && change.oldValue && change.oldValue.indexOf("guild") != -1) {
							var serverData = BDfunctionsDevilBro.getKeyInformation({"node":change.target, "key":"guild"});
							if (serverData) {
								this.hideAllMessages();
								if ($(".messages.scroller").length != 0) this.chatWindowObserver.observe($(".messages.scroller")[0], {childList:true});
								if ($(".chat").length != 0) this.channelSwitchObserver.observe($(".chat")[0], {childList:true, subtree:true});
							}
						}
					}
				);
			});
			this.serverSwitchObserver.observe($(".guilds.scroller")[0], {subtree:true, attributes:true, attributeOldValue:true});
			
			this.channelSwitchObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if ($(node).find(".messages.scroller").length > 0) {
									this.hideAllMessages();
									this.chatWindowObserver.observe($(".messages.scroller")[0], {childList:true});
								}
							});
						}
					}
				);
			});
			if ($(".chat").length != 0) this.channelSwitchObserver.observe($(".chat")[0], {childList:true, subtree:true});
			
			this.chatWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if ($(node).find(".message").length > 0) {
									this.messageChangeObserver.observe(node, {childList:true, characterData:true, subtree:true});
									$(node).find(".markup").each((_,message) => {
										this.hideMessage(message);
									});
								}
							});
						}
					}
				);
			});
			if ($(".messages.scroller").length != 0) this.chatWindowObserver.observe($(".messages.scroller")[0], {childList:true});
			
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
			this.settingsWindowObserver.observe($(".layers")[0], {childList:true});
			
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
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.hideAllMessages();
			
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.serverSwitchObserver.disconnect();
			this.channelSwitchObserver.disconnect();
			this.chatWindowObserver.disconnect();
			this.messageChangeObserver.disconnect();
			this.settingsWindowObserver.disconnect();
			
			$(".markup.blocked, .markup.censored").each((_,message) => {
				this.resetMessage(message);
			});
		}
	}
	
	
	// begin of own functions
	
	static updateContainer (ele, type, pluginName, event) {
		var settingspanel = ele.parentElement.parentElement;
		var words = BDfunctionsDevilBro.loadData(type, pluginName, "words");
		words = words ? words : {};
		var wordvalue = null;
		if (ele.tagName == "BUTTON") {
			if (ele.name == "add") {
				var wordinput = $(settingspanel).find("#" + type + "-word-value")[0];
				wordvalue = wordinput.value;
				if (wordvalue && wordvalue.trim().length > 0) {
					wordvalue = wordvalue.trim();
					words[wordvalue] = $(settingspanel).find("#" + type + "-word-case").prop("checked");
					wordinput.value = null;
				}
			}
			else if (ele.name == "removeall") {
				words = {};
			}
		}
		else if (ele.tagName == "INPUT") {
			if (event.keyCode == '13'){
				wordvalue = ele.value;
				if (wordvalue && wordvalue.trim().length > 0) {
					wordvalue = wordvalue.trim();
					words[wordvalue] = $(settingspanel).find("#" + type + "-word-case").prop("checked");
					ele.value = null;
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
			var casesensivity = words[word] ? "case" : "nocase";
			container += `<div name="` + word + `" class="added-word ` + casesensivity + ` ` + type + `-word">` + word + `<div class="word-delete" onclick='` + pluginName + `.updateContainer(this.parentElement, "` + type + `", "` + pluginName + `", event);'>✖</div></div>`;
		}
		
		$(settingspanel).find("#" + type + "-word-container").html(container);
	}
	
	static saveReplace (input, type, pluginName) {
		var settingspanel = input.parentElement.parentElement;
		var wordvalue = input.value;
		if (wordvalue && wordvalue.trim().length > 0) {
			wordvalue = wordvalue.trim();
			BDfunctionsDevilBro.saveData(type, wordvalue, pluginName, "replaceString");
		}
	}
	
	static saveCheckbox (input, type, pluginName) {
		var settingspanel = input.parentElement.parentElement.parentElement;
		var checked = $(input).prop("checked");
		if (input.name == "blockhide") {
			$(settingspanel).find("#" + type + "-replace-value").prop("disabled", checked);
			BDfunctionsDevilBro.saveData(type, checked, pluginName, "hideBlockedMessages");
		}
		else if (input.name == "showmsg") {
			BDfunctionsDevilBro.saveData(type, checked, pluginName, "showMessageOnHover");
		}
	}
	
	hideAllMessages () {
		$(".markup.blocked, .markup.censored").each((_,message) => {
			this.resetMessage(message);
		});
		$(".message-group").each((_,messageContainer) => {
			this.messageChangeObserver.observe(messageContainer, {childList:true, characterData:true, subtree:true});
			$(messageContainer).find(".markup").each((_,message) => {
				this.hideMessage(message);
			});
		});
	}
	
	hideMessage (message) {
		if (!$(message).hasClass("blocked") && !$(message).hasClass("censored")) {
			var messageData = BDfunctionsDevilBro.getKeyInformation({"node":message,"key":"0"});
			if (messageData) {
				var txt = messageData[0];
				var html = $(message).html();
				var orightml = html;
				var blocked = false;
				if (typeof txt === "string" && html) {
					var blockedWords = BDfunctionsDevilBro.loadData("blocked", this.getName(), "words");
					var blockedReplace = BDfunctionsDevilBro.loadData("blocked", this.getName(), "replaceString");
					blockedReplace = (blockedReplace && blockedReplace.length > 0) ? blockedReplace : this.defaultReplace["blocked"];
					for (let bWord in blockedWords) {
						var modifier = blockedWords[bWord] ? "" : "i";
						txt.split(" ").forEach((word) => {
							var newWord = word.replace(new RegExp("^" + bWord + "$", modifier), blockedReplace);
							if (newWord != word) blocked = true;
						});
						if (blocked) break;
					}
					if (blocked) {
						var hideMessage = BDfunctionsDevilBro.loadData("blocked", this.getName(), "hideBlockedMessages");
						if (hideMessage) {
							$(message).hide();
						}
						html = this.encodeToHTML(blockedReplace);
						$(message)
							.html(html)
							.addClass("blocked")
							.data("newhtml",html)
							.data("orightml",orightml);
							
						this.addHoverListener(message, "blocked");
					}
					else {
						var censoredWords = BDfunctionsDevilBro.loadData("censored", this.getName(), "words");
						var censoredReplace = BDfunctionsDevilBro.loadData("censored", this.getName(), "replaceString");
						censoredReplace = (censoredReplace && censoredReplace.length > 0) ? censoredReplace : this.defaultReplace["censored"];
						for (let cWord in censoredWords) {
							var modifier = censoredWords[cWord] ? "" : "i";
							var newTxt = "";
							txt.split(" ").forEach((word) => {
								newTxt += word.replace(new RegExp("^" + cWord + "$", modifier), censoredReplace) + " ";
							});
							newTxt = newTxt.trim();
							html = html.replace("-->" + this.encodeToHTML(txt) + "<!--","-->" + this.encodeToHTML(newTxt) + "<!--");
							txt = newTxt;
							$(message).html(html);
						}
						if (html != orightml) {
							$(message)
								.addClass("censored")
								.data("newhtml",html)
								.data("orightml",orightml);
								
							this.addHoverListener(message, "censored");
						}
					}
				}
			}
		}
	}
	
	encodeToHTML (string) {
		var ele = document.createElement("div");
		ele.innerText = string;
		return ele.innerHTML;
	}
	
	resetMessage (message) {
		var orightml = $(message).data("orightml");
		$(message)
			.html(orightml)
			.off("mouseenter")
			.off("mouseleave")
			.removeClass("blocked")
			.removeClass("censored");
	}
	
	addHoverListener (message, type) {
		var orightml = $(message).data("orightml");
		var newhtml = $(message).data("newhtml");
		$(message)
			.off("mouseenter")
			.off("mouseleave");
		if (BDfunctionsDevilBro.loadData(type, this.getName(), "showMessageOnHover")) {
			$(message)
				.on("mouseenter", () => {	
					$(message)
						.html(orightml)
						.removeClass(type);
				})
				.on("mouseleave", () => {
					$(message)
						.html(newhtml)
						.addClass(type);
				});
		}
	}
}
