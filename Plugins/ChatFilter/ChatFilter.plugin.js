//META{"name":"ChatFilter"}*//

class ChatFilter {
	constructor () {
		this.configs = ["case","exact"];
		
		this.css = ` 
			.message-group .comment .accessory.blocked:not(.revealed),
			.message-group .comment .markup.blocked:not(.revealed) {
				font-weight: bold;
				font-style: italic;
			}
			
			.message-group .comment .accessory.censored:not(.revealed),
			.message-group .comment .markup.censored:not(.revealed) {
				
			}`;
		
		this.defaults = {
			replaces: {
				blocked: 	{value:"~~BLOCKED~~",	title:"Block:",		description:"Default Replace Word for blocked Messages:"},
				censored:	{value:"$!%&%!&",		title:"Censor:",	description:"Default Replace Word for censored Messages:"}
			},
			settings: {
				showMessageOnClick: 	{value:{blocked:true, censored:true},	enabled:{blocked:true, censored:true},		description:"Show original Message on Click:"},
				hideMessage:			{value:{blocked:false, censored:false},	enabled:{blocked:true, censored:false},		description:"Completely hide targeted Messages:"}
			}
		};
	}

	getName () {return "ChatFilter";}

	getDescription () {return "Allows the user to censor words or block complete messages based on words in the chatwindow.";}

	getVersion () {return "3.1.9";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var replaces = BDfunctionsDevilBro.getAllData(this, "replaces");
		var settings = BDfunctionsDevilBro.getAllData(this, "settings");
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let rtype in replaces) {
			var words = BDfunctionsDevilBro.loadData(rtype, this, "words");
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto; min-width:55px;">${this.defaults.replaces[rtype].title}</h3><input rtype="${rtype}" action="add" type="text" placeholder="Wordvalue" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ wordInputs" id="input-${rtype}-wordvalue" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">With:</h3><input rtype="${rtype}" action="add" type="text" placeholder="Replacevalue" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ wordInputs" id="input-${rtype}-replacevalue" style="flex: 1 1 auto;"><button rtype="${rtype}" action="add" type="button" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u btn-add btn-addword" style="flex: 0 0 auto;"><div class="contents-4L4hQM"></div></button></div>`;
			for (let key in settings) {
				settingshtml += `<div rtype="${rtype}" value="${key}" class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" rtype="${rtype}" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key][rtype] ? " checked" : ""}></div></div>`;
			}
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto; min-width: 320px;">${this.defaults.replaces[rtype].description}</h3><input rtype="${rtype}" type="text" placeholder="${this.defaults.replaces[rtype].value}" value="${replaces[rtype]}" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ defaultInputs" id="input-${rtype}-defaultvalue" style="flex: 1 1 auto;"></div>`;
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto; max-width: 495px;">List of ${rtype} Words:</h3><div class="marginTop8-2gOa2N headerSize-22dv1R size10-1ZEdeK primary-2giqSn weightBold-2qbcng" style="flex: 1 1 auto; max-width: 32px;">CASE</div><div class="marginTop8-2gOa2N headerSize-22dv1R size10-1ZEdeK primary-2giqSn weightBold-2qbcng" style="flex: 0 0 auto;">EXACT</div></div><div class="DevilBro-settings-inner-list ${rtype}-list">`;			
			for (let word in words) {
				settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginTop4-2rEBfJ marginBottom4-_yArcI card-11ynQk"><div class="card-11ynQk-inner"><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn ellipsis-CYOqEr" style="flex: 1 1 auto;">${BDfunctionsDevilBro.encodeToHTML(word)} (${BDfunctionsDevilBro.encodeToHTML(words[word].replace)})</div>`
				for (let config of this.configs) {
					settingshtml += `<div class="checkboxContainer-1sZ9eo marginReset-2tTc4H" style="flex: 0 0 auto;"><label class="checkboxWrapper-2Yvr_Y"><input word="${word}" rtype="${rtype}" config="${config}" type="checkbox" class="inputDefault-2tiBIA input-oWyROL"${words[word][config] ? " checked" : ""}><div class="checkbox-1QwaS4 center-1MLNrE flex-3B1Tl4 justifyStart-2yIZo0 alignCenter-3VxkQP round-30vw42"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label></div>`;
				}
				settingshtml += `</div><div word="${word}" rtype="${rtype}" action="remove" class="button-1qrA-N remove-word"></div></div>`;
			}
			settingshtml += `</div>`
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Remove all added words.</h3><button rtype="${rtype}" action="removeall" type="button" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorRed-3HTNPV sizeMedium-2VGNaF grow-25YQ8u remove-all" style="flex: 0 0 auto;"><div class="contents-4L4hQM">Reset</div></button></div>`;
			settingshtml += `<div class="divider-1G01Z9 dividerDefault-77PXsz marginBottom40-1zK7fE"></div>`;
		}
		var infoHidden = BDfunctionsDevilBro.loadData("hideInfo", this, "hideInfo");
		settingshtml += `<div class="DevilBro-settings-inner-list info-container" ${infoHidden ? "style='display:none;'" : ""}><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">Case: Will block/censor words while comparing lowercase/uppercase. apple => apple, not APPLE or AppLe</div><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">Not Case: Will block/censor words while ignoring lowercase/uppercase. apple => apple, APPLE and AppLe</div><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">Exact: Will block/censor words that are exactly the selected word. apple => apple, not applepie or pineapple</div><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn">Not Exact: Will block/censor all words containing the selected word. apple => apple, applepie and pineapple</div></div>`;
		settingshtml += `</div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);})
			.on("keypress", ".wordInputs", (e) => {if (e.which == 13) this.updateContainer(settingspanel, e.currentTarget);})
			.on("keyup", ".defaultInputs", (e) => {this.saveReplace(e.currentTarget);})
			.on("click", ".btn-addword, .remove-word, .remove-all", (e) => {this.updateContainer(settingspanel, e.currentTarget);})
			.on("click", ".input-oWyROL", (e) => {this.updateConfig(e.currentTarget);})
			.on("click", ".toggle-info", (e) => {this.toggleInfo(settingspanel, e.currentTarget);});
			
		for (let key in settings) {
			for (let rtype in this.defaults.settings[key].enabled) {
				if (!this.defaults.settings[key].enabled[rtype]) $(settingspanel).find(".flex-lFgbSz[value='" + key + "'][rtype='" + rtype + "']").hide();
			}
		}
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDfunctionsDevilBro === "object") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
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
			BDfunctionsDevilBro.addObserver(this, null, {name:"messageChangeObserver",instance:observer,multi:true}, {childList:true, characterData:true, subtree:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".message")) {
									BDfunctionsDevilBro.addObserver(this, node, {name:"messageChangeObserver",multi:true}, {childList:true, characterData:true, subtree:true});
									node.querySelectorAll(".markup, .accessory").forEach(message => {
										this.hideMessage(message);
									});
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".messages.scroller", {name:"chatWindowObserver",instance:observer}, {childList:true});
			
			observer = new MutationObserver((changes, _) => {
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
			BDfunctionsDevilBro.addObserver(this, ".layers-20RVFW", {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			this.hideAllMessages();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			
			document.querySelectorAll(".markup.blocked, .markup.censored, .accessory.blocked, .accessory.censored").forEach(message => {
				this.resetMessage(message);
			});
						
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.hideAllMessages();
			BDfunctionsDevilBro.addObserver(this, ".messages.scroller", {name:"chatWindowObserver"}, {childList:true, subtree:true});
		}
	}
	
	
	// begin of own functions
	
	
	updateContainer (settingspanel, ele) {
		var update = false, wordvalue = null, replacevalue = null;
		var action = ele.getAttribute("action"), rtype = ele.getAttribute("rtype");
		var words = BDfunctionsDevilBro.loadData(rtype, this, "words") || {};
		
		if (action == "add") {
			var wordinput = settingspanel.querySelector("#input-" + rtype + "-wordvalue");
			var replaceinput = settingspanel.querySelector("#input-" + rtype + "-replacevalue");
			wordvalue = wordinput.value;
			replacevalue = replaceinput.value;
			if (wordvalue && wordvalue.trim().length > 0) {
				wordvalue = wordvalue.trim();
				replacevalue = replacevalue.trim();
				words[wordvalue] = {
					replace: replacevalue,
					exact: true,
					case: false
				};
				wordinput.value = null;
				replaceinput.value = null;
				update = true;
			}
		}
		else if (action == "remove") {
			wordvalue = ele.getAttribute("word");
			if (wordvalue) {
				delete words[wordvalue];
				update = true;
			}
		}
		else if (action == "removeall") {
			if (confirm("Are you sure you want to remove all added Words from your list?")) {
				words = {};
				update = true;
			}
		}
		if (update) {
			BDfunctionsDevilBro.saveData(rtype, words, this, "words");
			words = BDfunctionsDevilBro.loadData(rtype, this, "words");
			
			var containerhtml = ``;
			for (let word in words) {
				containerhtml += `<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginTop4-2rEBfJ marginBottom4-_yArcI card-11ynQk"><div class="card-11ynQk-inner"><div class="description-3MVziF formText-1L-zZB note-UEZmbY modeDefault-389VjU primary-2giqSn ellipsis-CYOqEr" style="flex: 1 1 auto;">${BDfunctionsDevilBro.encodeToHTML(word)} (${BDfunctionsDevilBro.encodeToHTML(words[word].replace)})</div>`
				for (let config of this.configs) {
					containerhtml += `<div class="checkboxContainer-1sZ9eo marginReset-2tTc4H" style="flex: 0 0 auto;"><label class="checkboxWrapper-2Yvr_Y"><input word="${word}" rtype="${rtype}" config="${config}" type="checkbox" class="inputDefault-2tiBIA input-oWyROL"${words[word][config] ? " checked" : ""}><div class="checkbox-1QwaS4 center-1MLNrE flex-3B1Tl4 justifyStart-2yIZo0 alignCenter-3VxkQP round-30vw42"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label></div>`;
				}
				containerhtml += `</div><div word="${word}" rtype="${rtype}" action="remove" class="button-1qrA-N remove-word"></div></div>`;
			}
			containerhtml += `</div>`;
			$(settingspanel).find("." + rtype + "-list").html(containerhtml);
			BDfunctionsDevilBro.initElements(settingspanel);
		}
	}
	
	saveReplace (input) {
		var rtype = input.getAttribute("rtype");
		var wordvalue = input.value;
		if (rtype) {
			var replaces = BDfunctionsDevilBro.getData(rtype, this, "replaces");
			BDfunctionsDevilBro.saveData(rtype, wordvalue.trim(), this, "replaces");
		}
	}

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(".checkbox-1KYsPm")) {
			let key = input.getAttribute("value");
			let rtype = input.getAttribute("rtype");
			if (!settings[key]) settings[key] = {};
			settings[key][rtype] = input.checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, this, "settings");
	}
	
	updateConfig (ele) {
		var wordvalue = ele.getAttribute("word");
		var config = ele.getAttribute("config");
		var rtype = ele.getAttribute("rtype");
		var words = BDfunctionsDevilBro.loadData(rtype, this, "words") || {};
		if (wordvalue && words[wordvalue] && config) {
			words[wordvalue][config] = ele.checked;
			BDfunctionsDevilBro.saveData(rtype, words, this, "words");
		}
	}
	
	toggleInfo (settingspanel, ele) {
		ele.classList.toggle("wrapperCollapsed-18mf-c");
		ele.classList.toggle("wrapperDefault-1Dl4SS");
		var svg = ele.querySelector(".iconTransition-VhWJ85");
		svg.classList.toggle("closed-2Hef-I");
		svg.classList.toggle("iconCollapsed-1INdMX");
		svg.classList.toggle("iconDefault-xzclSQ");
		
		var visible = $(settingspanel).find(".info-container").is(":visible");
		$(settingspanel).find(".info-container").toggle(!visible);
		BDfunctionsDevilBro.saveData("hideInfo", visible, this, "hideInfo");
	}
	
	hideAllMessages () {
		document.querySelectorAll(".markup.blocked, .markup.censored, .accessory.blocked, .accessory.censored").forEach(message => {
			this.resetMessage(message);
		});
		document.querySelectorAll(".message-group").forEach(messageContainer => {
			BDfunctionsDevilBro.addObserver(this, messageContainer, {name:"messageChangeObserver",multi:true}, {childList:true, characterData:true, subtree:true});
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
					if (chara == "<") {
						if (strings[count]) count++;
					}
					strings[count] = strings[count] ? strings[count] + chara : chara; 
					if (chara == ">") {
						count++;
					}
				});
			
				var settings = BDfunctionsDevilBro.getAllData(this, "settings");
				var replaces = BDfunctionsDevilBro.getAllData(this, "replaces");
				var blockedWords = BDfunctionsDevilBro.loadData("blocked", this, "words");
				var blocked = false;
				for (let bWord in blockedWords) {
					var blockedReplace = blockedWords[bWord].replace || replaces.blocked;
					var modifier = blockedWords[bWord].case ? "" : "i";
					bWord = blockedWords[bWord].exact ? "^" + BDfunctionsDevilBro.regEscape(bWord) + "$" : BDfunctionsDevilBro.regEscape(bWord);
					bWord = BDfunctionsDevilBro.encodeToHTML(bWord);
					
					var reg = new RegExp(bWord, modifier);
					strings.forEach(string => {
						if (string.indexOf("<img ") == 0 && (string.indexOf('class="emote') > -1 || string.indexOf('class="emoji') > -1)) {
							var emojiname = string.split('alt="').length > 0 ? string.split('alt="')[1] : null;
							emojiname = emojiname ? emojiname.split('"')[0] : null;
							emojiname = emojiname ? emojiname.replace(new RegExp(":", 'g'), "") : null;
							if (reg.test(emojiname)) blocked = true;
						}
						else if (string.indexOf('<img src="http') == 0) {
							var url = string.split('src="').length > 0 ? string.split('src="')[1] : null;
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
					if (settings.hideMessage.blocked) $(message).hide();
					newhtml = BDfunctionsDevilBro.encodeToHTML(blockedReplace);
					$(message)
						.html(newhtml)
						.addClass("blocked")
						.data("newhtmlChatFilter",newhtml)
						.data("orightmlChatFilter",orightml);
						
					this.addClickListener(message, settings.showMessageOnClick.blocked);
				}
				else {
					var censoredWords = BDfunctionsDevilBro.loadData("censored", this, "words");
					for (let cWord in censoredWords) {
						var censoredReplace = censoredWords[cWord].replace || replaces.censored;
						var modifier = censoredWords[cWord].case ? "" : "i";
						cWord = censoredWords[cWord].exact ? "^" + BDfunctionsDevilBro.regEscape(cWord) + "$" : BDfunctionsDevilBro.regEscape(cWord);
						cWord = BDfunctionsDevilBro.encodeToHTML(cWord);
						
						var reg = new RegExp(cWord, modifier);
						strings.forEach((string,i) => {
							if (string.indexOf("<img ") == 0 && (string.indexOf('class="emote') > -1 || string.indexOf('class="emoji') > -1)) {
								var emojiname = string.split('alt="').length > 0 ? string.split('alt="')[1] : null;
								emojiname = emojiname ? emojiname.split('" src')[0] : null;
								emojiname = emojiname ? emojiname.replace(new RegExp(":", 'g'), "") : null;
								if (reg.test(emojiname)) {
									strings[i] = BDfunctionsDevilBro.encodeToHTML(censoredReplace);
									if (strings[i+1] && strings[i+1].indexOf("<input") == 0) {
										strings[i+1] = "";
										if (strings[i-1] && strings[i-1].indexOf("<span") == 0) strings[i-1] = "";
										if (strings[i+2] && strings[i+2].indexOf("</span") == 0) strings[i+2] = "";
									}
								}
							}
							else if (string.indexOf('<img src="http') == 0) {
								var url = string.split('src="').length > 0 ? string.split('src="')[1] : null;
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
							.data("newhtmlChatFilter",newhtml)
							.data("orightmlChatFilter",orightml);
							
						this.addClickListener(message, settings.showMessageOnClick.censored);
					}
				}
			}
		}
	}
	
	resetMessage (message) {
		$(message)
			.html($(message).data("orightmlChatFilter"))
			.off("click." + this.getName())
			.removeClass("blocked")
			.removeClass("censored")
			.removeClass("revealed");
	}
	
	addClickListener (message, add) {
		$(message)
			.off("click." + this.getName());
		if (add) {
			var orightml = $(message).data("orightmlChatFilter");
			var newhtml = $(message).data("newhtmlChatFilter");
			$(message)
				.on("click." + this.getName(), () => {	
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
