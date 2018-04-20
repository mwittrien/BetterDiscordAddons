//META{"name":"SpellCheck"}*//

class SpellCheck {
	constructor () {
		this.languages = {};
		this.langDictionary = [];
		this.dictionary = [];

		this.spellCheckContextEntryMarkup =
			`<div class="itemGroup-oViAgA">
				<div class="item-1XYaYf similarwords-item itemSubMenu-3ZgIw-">
					<span>REPLACE_context_similarwords_text</span>
					<div class="hint-3TJykr"></div>
				</div>
				<div class="item-1XYaYf spellcheck-item">
					<span>REPLACE_context_spellcheck_text</span>
					<div class="hint-3TJykr"></div>
				</div>
			</div>`;
			
		this.similarWordsContextSubMenuMarkup = 
			`<div class="contextMenu-uoJTbz spellcheck-submenu">
				<div class="item-1XYaYf nosimilars-item">
					<span>REPLACE_similarwordssubmenu_none_text</span>
					<div class="hint-3TJykr"></div>
				</div>
			</div>`;
		
		this.spellCheckLayerMarkup = 
			`<div class="spellcheck-overlay" style="position:absolute !important; pointer-events:none !important; background:transparent !important; color:transparent !important;"></div>`;
			
		this.css = 
			`.spellcheck-overlay {
				display: inline-block;
				font-family: Whitney,Helvetica Neue,Helvetica,Arial,sans-serif;
				white-space: pre-wrap !important;
				word-wrap: break-word !important;
				overflow-x: hidden !important;
				overflow-y: scroll !important;
			}
			.spellcheck-overlay::-webkit-scrollbar,
			.spellcheck-overlay::-webkit-scrollbar-button,
			.spellcheck-overlay::-webkit-scrollbar-track,
			.spellcheck-overlay::-webkit-scrollbar-track-piece,
			.spellcheck-overlay::-webkit-scrollbar-thumb,
			.spellcheck-overlay::-webkit-scrollbar-corner,
			.spellcheck-overlay::-webkit-resizer {
				visibility: hidden !important;
			}
			.spellcheck-overlay .spelling-error {
				background-image: url('data:image/png;base64,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');
				background-repeat: repeat-x;
				background-position: bottom;
			}`;
			
			
		this.defaults = {
			settings: {
				disableDiscordSpellcheck:	{value:true, 	description:"Disable Discord's internal Spellcheck:"}
			},
			choices: {
				dictionaryLanguage:			{value:"en", 	description:"Dictionay Language:"}
			},
			amounts: {
				maxSimilarAmount:			{value:6, 		description:"Maximal Amount of suggested Words:"}
			}
		};
	}

	getName () {return "SpellCheck";}

	getDescription () {return "Adds a spellcheck to all textareas. Select a word and rightclick it to add it to your dictionary.";}

	getVersion () {return "1.2.2";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settings = BDfunctionsDevilBro.getAllData(this, "settings");
		var choices = BDfunctionsDevilBro.getAllData(this, "choices");
		var amounts = BDfunctionsDevilBro.getAllData(this, "amounts");
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in choices) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ weightMedium-13x9Y8 size16-3IvaX_ flexChild-1KGW5q" style="flex: 0 0 50%; line-height: 38px;">${this.defaults.choices[key].description}</h3><div class="select-3JqNgs" style="flex: 1 1 auto"><div class="Select Select--single has-value" type="${key}" value="${choices[key]}"><div class="Select-control"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-value" style="flex: 1 1 auto;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm" style="padding:0;">${this.languages[choices[key]].name}</div></div><span class="Select-arrow-zone"><span class="Select-arrow"></span></span></div></div></div></div>`;
		}
		for (let key in amounts) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ weightMedium-13x9Y8 size16-3IvaX_ flexChild-1KGW5q" style="flex: 0 0 50%; line-height: 38px;">${this.defaults.amounts[key].description}</h3><div class="inputWrapper-3xoRWR inputNumberWrapper vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR" style="flex: 1 1 auto;"><span class="numberinput-buttons-zone"><span class="numberinput-button-up"></span><span class="numberinput-button-down"></span></span><input type="number" min="0" option="${key}" value="${amounts[key]}" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ amountInput"></div></div>`;
		}
		var ownDictionary = BDfunctionsDevilBro.loadData(choices.dictionaryLanguage, this, "owndics") || [];
		settingshtml += `<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Your own Dictionary:</h3><div class="DevilBro-settings-inner-list word-list marginBottom8-1mABJ4">`;
		for (let word of ownDictionary) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginTop4-2rEBfJ marginBottom4-_yArcI card-11ynQk"><div class="card-11ynQk-inner"><div class="description-3MVziF formText-1L-zZB note-UEZmbY marginTop4-2rEBfJ modeDefault-389VjU primary-2giqSn ellipsis-CYOqEr entryword">${word}</div></div><div class="button-1qrA-N remove-word"></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);
		
		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);})
			.on("click", ".Select-control", (e) => {this.openDropdownMenu(settingspanel, e);})
			.on("click", ".remove-word", (e) => {this.removeFromOwnDictionary(e);})
			.on("input", ".amountInput", (e) => {
				var input = parseInt(e.currentTarget.value);
				if (!isNaN(input) && input > -1) BDfunctionsDevilBro.saveData(e.currentTarget.getAttribute("option"), input, this, "amounts");
			});
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
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.nodeType == 1 && node.className.includes("contextMenu-uoJTbz")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, "#app-mount", {name:"messageContextObserver",instance:observer}, {childList: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".innerEnabled-gLHeOL, .innerEnabledNoAttach-36PpAk")) {
									this.addSpellCheck(node.querySelector(".textArea-20yzAH"));
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, "#app-mount", {name:"textareaObserver",instance:observer}, {childList: true, subtree:true});
			
			document.querySelectorAll(".textArea-20yzAH").forEach(textarea => {this.addSpellCheck(textarea);});
			
			this.languages = Object.assign({},BDfunctionsDevilBro.languages);
			this.languages = BDfunctionsDevilBro.filterObject(this.languages , (lang) => {return lang.dic == true ? lang : null});
			
			this.setDictionary(BDfunctionsDevilBro.getData("dictionaryLanguage", this, "choices"));
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			$(".spellcheck-overlay").remove();
			$(".textArea-20yzAH").off("keyup." + this.getName()).off("scroll." + this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}

	
	// begin of own functions

	changeLanguageStrings () {
		this.spellCheckContextEntryMarkup = this.spellCheckContextEntryMarkup.replace("REPLACE_context_spellcheck_text", this.labels.context_spellcheck_text);
		this.spellCheckContextEntryMarkup = this.spellCheckContextEntryMarkup.replace("REPLACE_context_similarwords_text", this.labels.context_similarwords_text);
		
		this.similarWordsContextSubMenuMarkup = this.similarWordsContextSubMenuMarkup.replace("REPLACE_similarwordssubmenu_none_text", this.labels.similarwordssubmenu_none_text);
	}

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(".checkbox-1KYsPm")) {
			settings[input.value] = input.checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, this, "settings");
	}
	
	onContextMenu (context) {
		if (!context || !context.tagName || !context.parentElement || context.querySelector(".spellcheck-item")) return;
		var word = window.getSelection().toString();
		if (word && BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"handleCutItem"}) && this.isWordNotInDictionary(word)) {
			var group = $(this.spellCheckContextEntryMarkup);
			$(context).append(group)
				.on("click", ".spellcheck-item", (e) => {
					$(context).hide();
					this.addToOwnDictionary(word);
				})
				.on("mouseenter", ".similarwords-item", (e) => {
					this.createContextSubMenu(word, e, context);
				});
				
			BDfunctionsDevilBro.updateContextPosition(context);
		}
	}
	
	createContextSubMenu (word, e, context) {
		var similarWordsContextSubMenu = $(this.similarWordsContextSubMenuMarkup);
		
		var similarWords = this.getSimilarWords(word.toLowerCase().trim());
			
		if (similarWords.length > 0) {
			similarWordsContextSubMenu.find(".nosimilars-item").remove();
			for (let foundWord of similarWords.sort()) {
				similarWordsContextSubMenu.append(`<div value="${foundWord}" class="item-1XYaYf similarword-item"><span>${foundWord}</span><div class="hint-3TJykr"></div></div>`);
			}
		}
		
		var textarea = window.getSelection().getRangeAt(0).startContainer.querySelector("textarea");
		similarWordsContextSubMenu
			.on("click", ".similarword-item", (e) => {
				$(context).hide();
				this.replaceWord(textarea, word, e.currentTarget.getAttribute("value"));
			});
		
		BDfunctionsDevilBro.appendSubMenu(e.currentTarget, similarWordsContextSubMenu);
	}
	
	replaceWord (textarea, word, replacement) {
		textarea.focus();
		textarea.selectionStart = 0;
		textarea.selectionEnd = textarea.value.length;
		if (document.activeElement == textarea) {
			var firstLetter = word.charAt(0);
			var isCapitalised = firstLetter.toUpperCase() == firstLetter && firstLetter.toLowerCase() != firstLetter;
			replacement = isCapitalised ? replacement.charAt(0).toUpperCase() + replacement.slice(1) : replacement;
			document.execCommand("insertText", false, textarea.value.replace(new RegExp(word.trim(), "i"), replacement));
			$(textarea).trigger("keyup");
		}
	}
	
	addToOwnDictionary (word) {
		word = word.split(" ")[0].split("\n")[0].split("\r")[0].split("\t")[0];
		if (word) {
			var wordlow = word.toLowerCase();
			var lang = BDfunctionsDevilBro.getData("dictionaryLanguage", this, "choices");
			var ownDictionary = BDfunctionsDevilBro.loadData(lang, this, "owndics") || [];
			if (!ownDictionary.includes(wordlow)) {
				ownDictionary.push(wordlow);
				BDfunctionsDevilBro.saveData(lang, ownDictionary, this, "owndics");
				var message = this.labels.toast_wordadd_text ? 
							this.labels.toast_wordadd_text.replace("${word}", word).replace("${dicname}", this.languages[lang].name) : "";
				BDfunctionsDevilBro.showToast(message, {type:"success"});
				this.dictionary = this.langDictionary.concat(ownDictionary);
			}
		}
	}
	
	removeFromOwnDictionary (e) {
		var entry = e.currentTarget.parentElement;
		var word = entry.querySelector(".entryword").textContent;
		entry.remove();
		var lang = BDfunctionsDevilBro.getData("dictionaryLanguage", this, "choices");
		var ownDictionary = BDfunctionsDevilBro.loadData(lang, this, "owndics") || [];
		BDfunctionsDevilBro.removeFromArray(ownDictionary, word);
		BDfunctionsDevilBro.saveData(lang, ownDictionary, this, "owndics");
		this.dictionary = this.langDictionary.concat(ownDictionary);
	}
	
	openDropdownMenu (settingspanel, e) {
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
			selectControl.querySelector(".title-3I2bY1").innerText = this.languages[language].name;
			this.setDictionary(language);
			BDfunctionsDevilBro.saveData(type, language, this, "choices");
			
			var listcontainer = settingspanel.querySelector(".word-list");
			if (listcontainer) {
				var ownDictionary = BDfunctionsDevilBro.loadData(language, this, "owndics") || [];
				var containerhtml = ``;
				for (let word of ownDictionary) {
					containerhtml += `<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginTop4-2rEBfJ marginBottom4-_yArcI card-11ynQk"><div class="card-11ynQk-inner"><div class="description-3MVziF formText-1L-zZB note-UEZmbY marginTop4-2rEBfJ modeDefault-389VjU primary-2giqSn ellipsis-CYOqEr entryword">${word}</div></div><div class="button-1qrA-N remove-word"></div></div>`;
				}
				listcontainer.innerHTML = containerhtml;
			}
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
			menuhtml += `<div value="${key}" class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-option ${isSelected}" style="flex: 1 1 auto; display:flex;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm" style="flex: 1 1 42%;">${this.languages[key].name}</div></div>`
		}
		menuhtml += `</div></div>`;
		return $(menuhtml)[0];
	}
	
	addSpellCheck (textarea) {
		if (!textarea) return;
		var textareaWrap = textarea.parentElement;
		if (textareaWrap && !textareaWrap.querySelector(".spellcheck-overlay")) {
			var textareaInstance = BDfunctionsDevilBro.getOwnerInstance({"node":textarea, "props":["handlePaste","saveCurrentText"], "up":true});
			if (textareaInstance) {
				var wrapper = $(".channelTextArea-1HTP3C").has(textarea)[0];
				
				var updateSpellcheck = () => {
					$(spellcheck)
						.css("visibility", "hidden")
						.html(this.spellCheckText(textarea.value))
						.css("left", textarea.getBoundingClientRect().left - wrapper.getBoundingClientRect().left)
						.css("margin", $(textarea).css("margin"))
						.css("padding", $(textarea).css("padding"))
						.css("width", parseInt($(textarea).css("width")) + (parseInt($(textarea).css("height")) >= parseInt($(textarea).css("max-height")) ? 0 : 10))
						.css("height", $(textarea).css("height"))
						.scrollTop(textarea.scrollTop)
						.css("visibility", "visible");
				}
						
				var spellcheck = $(this.spellCheckLayerMarkup)[0];
				textarea.classList.forEach(classname => {spellcheck.classList.add(classname);});
				textarea.setAttribute("spellcheck", !BDfunctionsDevilBro.getData("disableDiscordSpellcheck", this, "settings"));
				$(spellcheck).appendTo(textareaWrap)
					
				updateSpellcheck();
					
				$(textarea)
					.off("keyup." + this.getName()).off("scroll." + this.getName())
					.on("keyup." + this.getName(), (e) => {
						updateSpellcheck();
					})
					.on("scroll." + this.getName(), (e) => {
						$(spellcheck).scrollTop(textarea.scrollTop);
					});
			}
		}
	}
	
	setDictionary (lang) {
		this.dictionary = BDfunctionsDevilBro.loadData(lang, this, "owndics") || [];
		let request = require("request");
		request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/SpellCheck/dic/" + lang + ".dic", (error, response, result) => {
			if (response) {
				this.langDictionary = result.replace(new RegExp("[\\r|\\t]", "g"), "").split("\n");
				this.dictionary = this.langDictionary.concat(this.dictionary);
				this.dictionary = this.dictionary.map(word => word.toLowerCase());
			}
		});
	}
	
	spellCheckText (string) {
		var htmlString = [];
		string.replace(/[\n]/g, "\n ").split(" ").forEach((word, i) => {
			htmlString.push(`<label class="${this.isWordNotInDictionary(word) ? "spelling-error" : "nospelling-error"}">${BDfunctionsDevilBro.encodeToHTML(word)}</label>`);
		});
		return htmlString.join(" ");
	}
	
	isWordNotInDictionary (word) {
		var wordLow = word.toLowerCase();
		var wordWithoutSymbols = wordLow.replace(/[0-9\µ\@\$\£\€\¥\¢\²\³\>\<\|\,\;\.\:\_\#\+\*\~\?\¿\\\´\`\}\=\]\)\[\(\{\/\&\%\§\"\!\¡\^\°\n\t\r]/g, "");
		return (wordLow.indexOf("http://") != 0 && wordLow.indexOf("https://") != 0 && wordWithoutSymbols && Array.isArray(this.dictionary) && this.dictionary.length > 0 && !this.dictionary.includes(wordLow) && !this.dictionary.includes(wordWithoutSymbols));
	}
	
	
	getSimilarWords (word) {
		var maxAmount = BDfunctionsDevilBro.getData("maxSimilarAmount", this, "amounts"), similarWords = [];
		if (maxAmount > 0) {
			var sameLetterDic = this.dictionary.filter(string => string.indexOf(word.toLowerCase().charAt(0)) == 0 ? string : null);
			var similarities = {};
			for (let string of sameLetterDic) {
				let value = this.wordSimilarity(word, string);
				if (!similarities[value]) similarities[value] = [];
				similarities[value].push(string);
			}
			var amount = 0;
			for (let value of Object.keys(similarities).sort().reverse()) {
				for (let similarWord of similarities[value]) {
					if (amount < maxAmount && !similarWords.includes(similarWord)) {
						similarWords.push(similarWord);
						amount++;
					}
					if (amount >= maxAmount) break;
				}
				if (amount >= maxAmount) break;
			}
		}
		return similarWords;
	}
	
	wordSimilarity (a, b) {
		var temp;
		if (a.length === 0 || b.length === 0 || a.length - b.length > 3 || b.length - a.length > 3) { return 0; }
		if (a.length > b.length) {
			temp = a;
			a = b;
			b = temp;
		}
		let result = 0;
		let row = [...Array(a.length + 1).keys()];
		for (let i = 1; i <= b.length; i++) {
			result = i;
			for (let j = 1; j <= a.length; j++) {
				temp = row[j - 1];
				row[j - 1] = result;
				result = b[i - 1] === a[j - 1] ? temp : Math.min(temp + 1, Math.min(result + 1, row[j] + 1));
			}
		}
		return (b.length - result) / b.length;
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					context_spellcheck_text:				"Dodaj u rječnik",
					context_similarwords_text:				"Pretraga sličnih riječi...",
					similarwordssubmenu_none_text:			"Nema sličnih riječi",
					toast_wordadd_text:						"Riječ ${word} dodana je u rječnik ${dicname}."
				};
			case "da":		//danish
				return {
					context_spellcheck_text:				"Tilføj til ordbog",
					context_similarwords_text:				"Søg lignende ord...",
					similarwordssubmenu_none_text:			"Ingen lignende ord",
					toast_wordadd_text:						"Ord ${word} tilføjet til ordbog ${dicname}."
				};
			case "de":		//german
				return {
					context_spellcheck_text:				"Zum Wörterbuch hinzufügen",
					context_similarwords_text:				"Ähnliche Wörter suchen...",
					similarwordssubmenu_none_text:			"Keine ähnlichen Wörter",
					toast_wordadd_text:						"Wort ${word} wurde zum Wörterbuch ${dicname} hinzugefügt."
				};
			case "es":		//spanish
				return {
					context_spellcheck_text:				"Agregar al diccionario",
					context_similarwords_text:				"Buscar palabras similares...",
					similarwordssubmenu_none_text:			"No hay palabras similares",
					toast_wordadd_text:						"Se agregó la palabra ${word} al diccionario ${dicname}."
				};
			case "fr":		//french
				return {
					context_spellcheck_text:				"Ajouter au dictionnaire",
					context_similarwords_text:				"Chercher des mots similaires...",
					similarwordssubmenu_none_text:			"Pas de mots similaires",
					toast_wordadd_text:						"Le mot ${word} a été ajouté au dictionnaire ${dicname}."
				};
			case "it":		//italian
				return {
					context_spellcheck_text:				"Aggiungi al dizionario",
					context_similarwords_text:				"Cerca parole simili...",
					similarwordssubmenu_none_text:			"Nessuna parola simile",
					toast_wordadd_text:						"Parola ${word} aggiunta al dizionario ${dicname}."
				};
			case "nl":		//dutch
				return {
					context_spellcheck_text:				"Toevoegen aan woordenboek",
					context_similarwords_text:				"Zoek vergelijkbare woorden...",
					similarwordssubmenu_none_text:			"Geen vergelijkbare woorden",
					toast_wordadd_text:						"Word ${word} toegevoegd aan woordenboek ${dicname}."
				};
			case "no":		//norwegian
				return {
					context_spellcheck_text:				"Legg til i ordbok",
					context_similarwords_text:				"Søk lignende ord...",
					similarwordssubmenu_none_text:			"Ingen lignende ord",
					toast_wordadd_text:						"Ord ${word} legges til ordbok ${dicname}."
				};
			case "pl":		//polish
				return {
					context_spellcheck_text:				"Dodaj do słownika",
					context_similarwords_text:				"Wyszukaj podobne słowa...",
					similarwordssubmenu_none_text:			"Brak podobnych słów",
					toast_wordadd_text:						"Słowo ${word} dodane do słownika ${dicname}."
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_spellcheck_text:				"Adicionar ao dicionário",
					context_similarwords_text:				"Pesquisar palavras similares...",
					similarwordssubmenu_none_text:			"Sem palavras semelhantes",
					toast_wordadd_text:						"Palavra ${word} adicionado ao dicionário ${dicname}."
				};
			case "fi":		//finnish
				return {
					context_spellcheck_text:				"Lisää sanakirjaan",
					context_similarwords_text:				"Hae samankaltaisia sanoja...",
					similarwordssubmenu_none_text:			"Ei vastaavia sanoja",
					toast_wordadd_text:						"Sana ${word} lisättiin sanakirjaan ${dicname}."
				};
			case "sv":		//swedish
				return {
					context_spellcheck_text:				"Lägg till i ordbok",
					context_similarwords_text:				"Sök liknande ord...",
					similarwordssubmenu_none_text:			"Inga liknande ord",
					toast_wordadd_text:						"Ord ${word} läggs till ordbok ${dicname}."
				};
			case "tr":		//turkish
				return {
					context_spellcheck_text:				"Sözlükye Ekle",
					context_similarwords_text:				"Benzer Kelimeler Ara...",
					similarwordssubmenu_none_text:			"Benzer kelime yoktur",
					toast_wordadd_text:						"Sözcük ${word} sözlük ${dicname}'ye eklendi."
				};
			case "cs":		//czech
				return {
					context_spellcheck_text:				"Přidat do slovníku",
					context_similarwords_text:				"Hledat podobné výrazy...",
					similarwordssubmenu_none_text:			"Žádné podobné slova",
					toast_wordadd_text:						"Slovo ${word} bylo přidáno do slovníku ${dicname}."
				};
			case "bg":		//bulgarian
				return {
					context_spellcheck_text:				"Добави в речника",
					context_similarwords_text:				"Търсене на подобни думи...",
					similarwordssubmenu_none_text:			"Няма подобни думи",
					toast_wordadd_text:						"Думата ${word} е добавена към речника ${dicname}."
				};
			case "ru":		//russian
				return {
					context_spellcheck_text:				"Добавить в словарь",
					context_similarwords_text:				"Поиск похожих слов...",
					similarwordssubmenu_none_text:			"Нет похожих слов",
					toast_wordadd_text:						"Слово ${word} добавлено в словарь ${dicname}."
				};
			case "uk":		//ukrainian
				return {
					context_spellcheck_text:				"Додати до словника",
					context_similarwords_text:				"Шукати схожі слова...",
					similarwordssubmenu_none_text:			"Немає подібних слів",
					toast_wordadd_text:						"Словник ${word} додається до словника ${dicname}."
				};
			case "ja":		//japanese
				return {
					context_spellcheck_text:				"辞書に追加",
					context_similarwords_text:				"類似のワードを検索...",
					similarwordssubmenu_none_text:			"類似の単語はありません",
					toast_wordadd_text:						"単語 ${word} が辞書 ${dicname} に追加されました。"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_spellcheck_text:				"添加到詞典",
					context_similarwords_text:				"搜索類似的單詞...",
					similarwordssubmenu_none_text:			"沒有類似的詞",
					toast_wordadd_text:						"單詞 ${word} 添加到字典 ${dicname}。"
				};
			case "ko":		//korean
				return {
					context_spellcheck_text:				"사전에 추가",
					context_similarwords_text:				"비슷한 단어 검색...",
					similarwordssubmenu_none_text:			"유사한 단어 없음",
					toast_wordadd_text:						"단어 ${word} 사전 ${dicname} 에 추가되었습니다."
				};
			default:		//default: english
				return {
					context_spellcheck_text:				"Add to Dictionay",
					context_similarwords_text:				"Search similar Words...",
					similarwordssubmenu_none_text:			"No similar Words",
					toast_wordadd_text:						"Word ${word} added to dictionary ${dicname}."
				};
		}
	}
}
