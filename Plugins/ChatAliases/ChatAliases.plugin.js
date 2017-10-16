//META{"name":"ChatAliases"}*//

class ChatAliases {
	constructor () {
		
		this.switchFixObserver = new MutationObserver(() => {});
		
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
				width: 150px;
				height: 21px;
				margin: 0 15px 0 0 !important;
				padding: 0 !important;
				border-radius: 5px;
			}

			.chataliases-settings button.word-add,
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

			.chataliases-settings .word-delete {
				color: black;
				position: relative;
				display: inline-block;
				width: 15px;
				text-align: center;
				font-size: 13px;
				margin: 2px !important;
				padding: 2px !important;
				border-radius: 5px;
			}

			.chataliases-settings .word-delete.fake {
				bottom: 0px;
			}

			.chataliases-settings .word-delete:hover {
				color: #757C87;
				background-color: #26272B;
				cursor: pointer;
			}

			.chataliases-settings .replace-word-text {
				margin: 0 10px 0 0 !important;
			}
			
			.chataliases-settings .replace-settings,
			.chataliases-settings .wordtype-info,
			.chataliases-settings .blocked-censored-info {
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

	getDescription () {return "Allows the user configure their own chat-aliases that will automatically be replaced before the message is being sent.";}

	getVersion () {return "1.0.0";}

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
			settingspanel += `<button name="removeall" class="remove-all" id="chataliases-remove-all" onclick='` + this.getName() + `.updateContainer(this, "` + this.getName() + `", event);'>Remove All</button>`;
			settingspanel += `</div>`;
			settingspanel += `<div class="word-container" id="chataliases-word-container">`;
			for (let word in words) {
				settingspanel += `<div name="` + word + `" class="added-word chataliases-word">` + BDfunctionsDevilBro.encodeToHTML(word) + ` (` + BDfunctionsDevilBro.encodeToHTML(words[word]) + `)<div class="word-delete" onclick='` + this.getName() + `.updateContainer(this.parentElement, "` + this.getName() + `", event);'>✖</div></div>`;
			}		
			settingspanel += `</div>`;
			settingspanel += `</div>`;
			return settingspanel;
		}
    }

	//legacy
	load () {
		BdApi.injectCSS(this.getName(), this.css);
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
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);	
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.bindEventToTextArea();
			
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.switchFixObserver.disconnect();
			$(".channel-text-area-default").find("textarea").off("keydown." + this.getName()).off("input." + this.getName());
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
					words[wordvalue] = replacevalue;
					wordinput.value = null;
					replaceinput.value = null;
				}
			}
			else if (ele.name == "removeall") {
				words = {};
			}
		}
		else if (ele.tagName == "INPUT") {
			if (event.keyCode == '13'){
				wordvalue = wordinput.value;
				replacevalue = replaceinput.value;
				if (wordvalue && wordvalue.trim().length > 0 && replacevalue && replacevalue.trim().length > 0) {
					wordvalue = wordvalue.trim();
					replacevalue = replacevalue.trim();
					words[wordvalue] = replacevalue;
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
			container += `<div name="` + word + `" class="added-word chataliases-word">` + BDfunctionsDevilBro.encodeToHTML(word) + ` (` + BDfunctionsDevilBro.encodeToHTML(words[word]) + `)<div class="word-delete" onclick='` + pluginName + `.updateContainer(this.parentElement, "` + pluginName + `", event);'>✖</div></div>`;
		}
		
		$(settingspanel).find("#chataliases-word-container").html(container);
	}
	
	bindEventToTextArea () {
		$(".channel-text-area-default").find("textarea")
			.off("input." + this.getName())
			.on("input." + this.getName(), e => {
				if (!this.format) return;
				this.format = false;
				var textarea = e.target;
				var text = textarea.value;
				var words = BDfunctionsDevilBro.loadAllData(this.getName(), "words");
				
				for (let wordvalue in words) {
					let replacevalue = words[wordvalue];
					let reg = new RegExp("^" + wordvalue + "$");
					var newText = [];
					text.split(" ").forEach((word) => {
						newText.push(reg.test(word) ? replacevalue : word);
					});
					text = newText.join(" ");
				}
				BDfunctionsDevilBro.getOwnerInstance({"node":document.querySelector(".layers"), "name":"ChannelTextAreaForm"}).setState({textValue:text});
			})
			.off("keydown." + this.getName())
			.on("keydown." + this.getName(), e => {
				if (!e.shiftKey && e.which == 13) this.format = true;
			});
	}
}
