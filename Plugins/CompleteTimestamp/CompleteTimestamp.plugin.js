//META{"name":"CompleteTimestamps"}*//

class CompleteTimestamps {
	constructor () {
		this.languages;
		
		this.updateTimestamps = false;
		
		this.messageObserver = new MutationObserver(() => {});
		this.settingsWindowObserver = new MutationObserver(() => {});
			
		this.defaults = {
			settings: {
				displayTime:	{value:true, 	description:"Display the Time in the Timestamp:"},
				displayDate:	{value:true, 	description:"Display the Date in the Timestamp:"},
				cutSeconds:		{value:false, 	description:"Cut off Seconds of the Time:"},
				forceZeros:		{value:false, 	description:"Force leading Zeros:"},
				otherOrder:		{value:false, 	description:"Show the Time before the Date:"}
			},
			choices: {
				creationDateLang:		{value:"$discord", 	description:"Timestamp Format:"}
			}
		};
	}

	getName () {return "CompleteTimestamps";}

	getDescription () {return "Replace all timestamps with complete timestamps.";}

	getVersion () {return "1.0.4";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settings = BDfunctionsDevilBro.getAllData(this, "settings");
		var choices = BDfunctionsDevilBro.getAllData(this, "choices");
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU ${settings[key] ? "valueChecked-3Bzkbm" : "valueUnchecked-XR6AOk"}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in choices) {
			settingshtml += `<div class="ui-form-item flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ weightMedium-13x9Y8 size16-3IvaX_ flexChild-1KGW5q" style="flex: 0 0 30%; line-height: 38px;">${this.defaults.choices[key].description}</h3><div class="ui-select format-select-wrapper" style="flex: 1 1 70%;"><div class="Select Select--single has-value" type="${key}" value="${choices[key]}"><div class="Select-control"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-value" style="flex: 1 1 auto;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm languageName" style="flex: 1 1 42%;">${this.languages[choices[key]].name}</div><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm languageTimestamp" style="flex: 1 1 58%;">${this.getTimestamp(this.languages[choices[key]].id)}</div></div><span class="Select-arrow-zone"><span class="Select-arrow"></span></span></div></div></div></div>`;
		}
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];
		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {
				this.updateSettings(settingspanel);
				var choices = BDfunctionsDevilBro.getAllData(this, "choices");
				for (let key in choices) {
					settingspanel.querySelector(".Select[type='" + key + "'] .languageTimestamp").innerText = this.getTimestamp(this.languages[choices[key]].id);
				}
			})
			.on("click", ".Select-control", (e) => {this.openDropdownMenu(e);});
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
			
			var observertarget = null;

			this.messageObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.tagName && node.querySelector(".message-text")) {
									node.querySelectorAll(".message-text").forEach(message => {this.changeTimestamp(message);});
								}
								else if (node.classList && node.classList.contains("message-text")) {
									this.changeTimestamp(node);
								}
							});
						}
					}
				);
			});
			if (observertarget = document.querySelector("#app-mount")) this.messageObserver.observe(observertarget, {childList: true, subtree: true});
			
			this.settingsWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (this.updateTimestamps && node && node.tagName && node.getAttribute("layer-id") == "user-settings") {
									document.querySelectorAll(".complete-timestamp").forEach(timestamp => {timestamp.classList.remove("complete-timestamp");});
									document.querySelectorAll(".message-text").forEach(message => {this.changeTimestamp(message);});
								}
							});
						}
					}
				);
			});
			if (observertarget = document.querySelector(".layers, .layers-20RVFW")) this.settingsWindowObserver.observe(observertarget, {childList:true});
			
			this.languages = Object.assign({},BDfunctionsDevilBro.languages);
			
			document.querySelectorAll(".message-text").forEach(message => {this.changeTimestamp(message);});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.messageObserver.disconnect();
			this.settingsWindowObserver.disconnect();
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}

	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(".checkbox-1KYsPm")) {
			settings[input.value] = input.checked;
			input.parentElement.classList.toggle("valueChecked-3Bzkbm", input.checked);
			input.parentElement.classList.toggle("valueUnchecked-XR6AOk", !input.checked);
		}
		BDfunctionsDevilBro.saveAllData(settings, this, "settings");
		this.updateTimestamps = true;
	}
	
	openDropdownMenu (e) {
		var selectControl = e.currentTarget;
		var selectWrap = selectControl.parentElement;
		
		if (selectWrap.classList.contains("is-open")) return;
		
		selectWrap.classList.add("is-open");
		$("li").has(selectWrap).css("overflow", "visible");
		
		var type = selectWrap.getAttribute("type");
		var selectMenu = this.createDropdownMenu(selectWrap.getAttribute("value"), type);
		selectWrap.appendChild(selectMenu);
		
		$(selectMenu).on("mousedown." + this.getName(), ".Select-option", (e2) => {
			var language = e2.currentTarget.getAttribute("value");
			selectWrap.setAttribute("value", language);
			selectControl.querySelector(".languageName").innerText = this.languages[language].name;
			selectControl.querySelector(".languageTimestamp").innerText = new Date().toLocaleString(this.languages[language].id);
			BDfunctionsDevilBro.saveData(type, language, this, "choices");
		});
		$(document).on("mousedown.select" + this.getName(), (e2) => {
			if (e2.target.parentElement == selectMenu) return;
			$(document).off("mousedown.select" + this.getName());
			selectMenu.remove();
			$("li").has(selectWrap).css("overflow", "auto");
			setTimeout(() => {selectWrap.classList.remove("is-open");},100);
		});
	}
	
	createDropdownMenu (choice, type) {
		var menuhtml = `<div class="Select-menu-outer"><div class="Select-menu">`;
		for (var key in this.languages) {
			var isSelected = key == choice ? " is-selected" : "";
			menuhtml += `<div value="${key}" class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-option ${isSelected}" style="flex: 1 1 auto; display:flex;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm" style="flex: 1 1 42%;">${this.languages[key].name}</div><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm" style="flex: 1 1 58%;">${this.getTimestamp(this.languages[key].id)}</div></div>`
		}
		menuhtml += `</div></div>`;
		return $(menuhtml)[0];
	}
	
	changeTimestamp (message) {
		if (!message || !message.tagName) return;
		message = this.getMessageGroup(message);
		if (!message || !message.tagName || message.querySelector(".complete-timestamp")) return;
		var timestamp = message.querySelector(".timestamp");
		if (!timestamp) return;
		var info = BDfunctionsDevilBro.getKeyInformation({node:message, key:"message"});
		if (!info || !info.timestamp || !info.timestamp._i) return;
		var choice = BDfunctionsDevilBro.getData("creationDateLang", this, "choices");
		timestamp.classList.add("complete-timestamp");
		BDfunctionsDevilBro.setInnerText(timestamp, this.getTimestamp (this.languages[choice].id, info.timestamp._i));
	}
	
	getMessageGroup (message) {
		var messagegroup = null;
		while (messagegroup == null || message.parentElement) {
			message = message.parentElement;
			if (message.classList && message.classList.contains("message-group")) messagegroup = message;
		}
		return messagegroup;
	}
	
	getTimestamp (languageid, time = new Date()) {
		var settings = BDfunctionsDevilBro.getAllData(this, "settings");
		var timestamp = [];
		if (settings.displayDate) 	timestamp.push(time.toLocaleDateString(languageid));
		if (settings.displayTime) 	timestamp.push(settings.cutSeconds ? this.cutOffSeconds(time.toLocaleTimeString(languageid)) : time.toLocaleTimeString(languageid));
		if (settings.otherOrder)	timestamp.reverse();
		var timestring = timestamp.length > 1 ? timestamp.join(", ") : (timestamp.length > 0 ? timestamp[0] : "");
		if (timestring && settings.forceZeros) timestring = this.addLeadingZeros(timestring);
		return timestring;
	}
	
	cutOffSeconds (timestring) {
		return timestring.replace(/(.*):(.*):(.{2})(.*)/, "$1:$2$4");
	}
	
	addLeadingZeros (timestring) {
		var chararray = timestring.split("");
		var numreg = /[0-9]/;
		for (var i = 0; i < chararray.length; i++) {
			if (!numreg.test(chararray[i-1]) && numreg.test(chararray[i]) && !numreg.test(chararray[i+1])) chararray[i] = "0" + chararray[i];
		}
		
		return chararray.join("");
	}
}
