//META{"name":"SpellCheck","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SpellCheck","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SpellCheck/SpellCheck.plugin.js"}*//

class SpellCheck {
	getName () {return "SpellCheck";}

	getVersion () {return "1.3.5";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a spellcheck to all textareas. Select a word and rightclick it to add it to your dictionary.";}

	initConstructor () {
		this.changelog = {
			"fixed":[["New Select Classes","The Dropdown-Select element got new classes on canary, this update will prevent stable from breaking once the class change is pushed to stable"]]
		};
		
		this.patchModules = {
			"ChannelTextArea":"componentDidMount"
		};

		this.languages = {};
		this.langDictionary = [];
		this.dictionary = [];

		this.spellCheckContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} similarwords-item ${BDFDB.disCN.contextmenuitemsubmenu}">
					<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_context_similarwords_text</div></span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
				<div class="${BDFDB.disCN.contextmenuitem} spellcheck-item">
					<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_context_spellcheck_text</div></span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;

		this.similarWordsContextSubMenuMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} spellcheck-submenu">
				<div class="${BDFDB.disCN.contextmenuitem} nosimilars-item">
					<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_similarwordssubmenu_none_text</div></span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;

		this.spellCheckLayerMarkup = 
			`<div class="spellcheck-overlay" style="position:absolute !important; pointer-events:none !important; background:transparent !important; color:transparent !important; text-shadow:none !important;"></div>`;

		this.css = 
			`.spellcheck-overlay::-webkit-scrollbar,
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
			choices: {
				dictionaryLanguage:			{value:"en", 	description:"Dictionay Language:"}
			},
			amounts: {
				maxSimilarAmount:			{value:6, 		min:1,	max:30,	description:"Maximal Amount of suggested Words:"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var settings = BDFDB.getAllData(this, "settings");
		var choices = BDFDB.getAllData(this, "choices");
		var amounts = BDFDB.getAllData(this, "amounts");
		var settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in choices) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 30%;">${this.defaults.choices[key].description}</h3>${BDFDB.createSelectMenu(this.createSelectChoice(choices[key]), choices[key], key)}</div>`;
		}
		for (let key in amounts) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 50%;">${this.defaults.amounts[key].description}</h3><div class="${BDFDB.disCN.inputwrapper} inputNumberWrapper ${BDFDB.disCNS.vertical +  BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn}" style="flex: 1 1 auto;"><span class="numberinput-buttons-zone"><span class="numberinput-button-up"></span><span class="numberinput-button-down"></span></span><input type="number"${(!isNaN(this.defaults.amounts[key].min) && this.defaults.amounts[key].min !== null ? ' min="' + this.defaults.amounts[key].min + '"' : '') + (!isNaN(this.defaults.amounts[key].max) && this.defaults.amounts[key].max !== null ? ' max="' + this.defaults.amounts[key].max + '"' : '')} option="${key}" value="${amounts[key]}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} amount-input"></div></div>`;
		}
		var ownDictionary = BDFDB.loadData(choices.dictionaryLanguage, this, "owndics") || [];
		settingshtml += `<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Your own Dictionary:</h3><div class="BDFDB-settings-inner-list word-list ${BDFDB.disCN.marginbottom8}">`;
		for (let word of ownDictionary) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.margintop4 + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis} entryword">${word}</div></div><div class="${BDFDB.disCN.hovercardbutton} remove-word"></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".remove-word", e => {this.removeFromOwnDictionarye;});
		BDFDB.addEventListener(this, settingspanel, "click", BDFDB.dotCN.selectcontrol, e => {
			BDFDB.openDropdownMenu(e, this.saveSelectChoice.bind(this), this.createSelectChoice.bind(this), this.languages, "inSettings");
		});
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			this.languages = Object.assign({},BDFDB.languages);
			this.languages = BDFDB.filterObject(this.languages , (lang) => {return lang.dic == true ? lang : null});
			this.setDictionary(BDFDB.getData("dictionaryLanguage", this, "choices"));

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".spellcheck-overlay");
			BDFDB.removeClasses("spellcheck-added");

			this.killLanguageToast();

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	changeLanguageStrings () {
		this.spellCheckContextEntryMarkup = this.spellCheckContextEntryMarkup.replace("REPLACE_context_spellcheck_text", this.labels.context_spellcheck_text);
		this.spellCheckContextEntryMarkup = this.spellCheckContextEntryMarkup.replace("REPLACE_context_similarwords_text", this.labels.context_similarwords_text);

		this.similarWordsContextSubMenuMarkup = this.similarWordsContextSubMenuMarkup.replace("REPLACE_similarwordssubmenu_none_text", this.labels.similarwordssubmenu_none_text);
	}

	onNativeContextMenu (instance, menu) {
		if (instance.props && instance.props.target && instance.props.type == "CHANNEL_TEXT_AREA" && !menu.querySelector(".spellcheck-item")) {
			BDFDB.toggleEles(BDFDB.React.findDOMNodeSafe(BDFDB.getOwnerInstance({node:menu,name:"NativeSpellcheckGroup"})), false);
			var textarea = instance.props.target, word = null, length = 0;
			if (textarea.value && (textarea.selectionStart || textarea.selectionEnd)) for (let splitword of textarea.value.split(/\s/g)) {
				length += splitword.length + 1;
				if (length > textarea.selectionStart) {
					word = splitword;
					break;
				}
			}
			if (true || !word && textarea.value) for (let error of textarea.parentElement.querySelectorAll(".spelling-error")) {
				let rects = BDFDB.getRects(error);
				if (BDFDB.mousePosition.pageX > rects.x && BDFDB.mousePosition.pageX < (rects.x + rects.width) && BDFDB.mousePosition.pageY > rects.y && BDFDB.mousePosition.pageY < (rects.y + rects.height)) {
					word = error.innerText;
					break;
				}
			}
			if (word && this.isWordNotInDictionary(word)) {
				let pasteentry = BDFDB.React.findDOMNodeSafe(BDFDB.getOwnerInstance({node:menu,props:["handlePasteItem"]}));
				if (pasteentry) {
					let spellCheckContextEntry = BDFDB.htmlToElement(this.spellCheckContextEntryMarkup);
					menu.appendChild(spellCheckContextEntry);
					spellCheckContextEntry.addEventListener("mouseenter", () => {
						BDFDB.createTooltip(word, spellCheckContextEntry, {type: "left"});
					});
					spellCheckContextEntry.querySelector(".spellcheck-item").addEventListener("click", () => {
						BDFDB.closeContextMenu(menu);
						this.addToOwnDictionary(word);
					});
					let similarwordsitem = spellCheckContextEntry.querySelector(".similarwords-item");
					similarwordsitem.addEventListener("mouseenter", () => {
						let similarWordsContextSubMenu = BDFDB.htmlToElement(this.similarWordsContextSubMenuMarkup);
						let similarWords = this.getSimilarWords(word.toLowerCase().trim());
						if (similarWords.length > 0) {
							BDFDB.removeEles(similarWordsContextSubMenu.querySelector(".nosimilars-item"));
							for (let foundWord of similarWords.sort()) similarWordsContextSubMenu.appendChild(BDFDB.htmlToElement(`<div value="${foundWord}" class="${BDFDB.disCN.contextmenuitem} similarword-item"><span>${foundWord}</span><div class="${BDFDB.disCN.contextmenuhint}"></div></div>`));
							BDFDB.addChildEventListener(similarWordsContextSubMenu, "click", ".similarword-item", e => {
								BDFDB.closeContextMenu(menu);
								this.replaceWord(textarea, word, e.currentTarget.getAttribute("value"));
							});
						}
						BDFDB.appendSubMenu(similarwordsitem, similarWordsContextSubMenu);
					});
				}
			}
		}
	}

	processChannelTextArea (instance, wrapper) {
		if (instance.props && instance.props.type) {
			var textarea = wrapper.querySelector("textarea");
			if (!textarea) return;

			var updateSpellcheck = () => {
				var style = Object.assign({},getComputedStyle(textarea));
				for (let i in style) if (i.indexOf("webkit") == -1) spellcheck.style[i] = style[i];
				spellcheck.style.setProperty("color", "transparent", "important");
				spellcheck.style.setProperty("background", "none", "important");
				spellcheck.style.setProperty("mask", "none", "important");
				spellcheck.style.setProperty("pointer-events", "none", "important");
				spellcheck.style.setProperty("position", "absolute", "important");
				spellcheck.style.setProperty("left", BDFDB.getRects(textarea).left - BDFDB.getRects(wrapper).left + "px", "important");
				spellcheck.style.setProperty("width", BDFDB.getRects(textarea).width - style.paddingLeft - style.paddingRight + "px", "important");
				spellcheck.style.setProperty("height", style.height, "important");

				spellcheck.innerHTML = this.spellCheckText(textarea.value);
				spellcheck.scrollTop = textarea.scrollTop;
			}

			var spellcheck = BDFDB.htmlToElement(this.spellCheckLayerMarkup);
			BDFDB.addClass(spellcheck, textarea.className);

			textarea.setAttribute("spellcheck", false);

			textarea.parentElement.appendChild(spellcheck);
			BDFDB.addClass(wrapper, "spellcheck-added");

			updateSpellcheck();
			BDFDB.addEventListener(this, textarea, "keyup", e => {
				clearTimeout(textarea.spellchecktimeout);
				if (textarea.value) textarea.spellchecktimeout = setTimeout(() => {updateSpellcheck();},100);
				else updateSpellcheck();
			});
			BDFDB.addEventListener(this, textarea, "scroll", e => {
				spellcheck.scrollTop = textarea.scrollTop;
			});
		}
	}

	replaceWord (textarea, word, replacement) {
		if (!textarea) return;
		textarea.focus();
		textarea.selectionStart = 0;
		textarea.selectionEnd = textarea.value.length;
		var firstLetter = word.charAt(0);
		var isCapitalised = firstLetter.toUpperCase() == firstLetter && firstLetter.toLowerCase() != firstLetter;
		replacement = isCapitalised ? replacement.charAt(0).toUpperCase() + replacement.slice(1) : replacement;
		document.execCommand("insertText", false, textarea.value.replace(new RegExp(word.trim(), "i"), replacement));
		textarea.dispatchEvent(new Event("input"));
		textarea.dispatchEvent(new Event("keyup"));
		textarea.dispatchEvent(new Event("change"));
	}

	addToOwnDictionary (word) {
		word = word.split(" ")[0].split("\n")[0].split("\r")[0].split("\t")[0];
		if (word) {
			var wordlow = word.toLowerCase();
			var lang = BDFDB.getData("dictionaryLanguage", this, "choices");
			var ownDictionary = BDFDB.loadData(lang, this, "owndics") || [];
			if (!ownDictionary.includes(wordlow)) {
				ownDictionary.push(wordlow);
				BDFDB.saveData(lang, ownDictionary, this, "owndics");
				BDFDB.showToast(this.labels.toast_wordadd_text ? this.labels.toast_wordadd_text.replace("${word}", word).replace("${dicname}", this.languages[lang].name) : "", {type:"success"});
				this.dictionary = this.langDictionary.concat(ownDictionary);
			}
		}
	}

	removeFromOwnDictionary (e) {
		var entry = e.currentTarget.parentElement;
		var word = entry.querySelector(".entryword").textContent;
		entry.remove();
		var lang = BDFDB.getData("dictionaryLanguage", this, "choices");
		var ownDictionary = BDFDB.loadData(lang, this, "owndics") || [];
		BDFDB.removeFromArray(ownDictionary, word);
		BDFDB.saveData(lang, ownDictionary, this, "owndics");
		this.dictionary = this.langDictionary.concat(ownDictionary);
	}
	
	saveSelectChoice (selectWrap, type, choice) {
		if (type && choice) {			
			selectWrap.querySelector(BDFDB.dotCN.title).innerText = this.languages[choice].name;
			this.setDictionary(choice);
			BDFDB.saveData(type, choice, this, "choices");

			var settingspanel = BDFDB.getParentEle(".BDFDB-settings", selectWrap), listcontainer = settingspanel ? settingspanel.querySelector(".word-list") : null;
			if (listcontainer) {
				var ownDictionary = BDFDB.loadData(choice, this, "owndics") || [];
				var containerhtml = ``;
				for (let word of ownDictionary) {
					containerhtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.margintop4 + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis} entryword">${word}</div></div><div class="${BDFDB.disCN.hovercardbutton} remove-word"></div></div>`;
				}
				listcontainer.innerHTML = containerhtml;
			}
		}
	}
	
	createSelectChoice (choice) {
		return `<div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCNS.weightnormal + BDFDB.disCN.cursorpointer}" style="padding:0;">${this.languages[choice].name}</div>`;
	}

	setDictionary (lang) {
		this.dictionary = BDFDB.loadData(lang, this, "owndics") || [];
		this.killLanguageToast();
		this.languageToast = BDFDB.showToast("Grabbing dictionary (" + this.languages[lang].name + "). Please wait", {timeout:0});
		this.languageToast.interval = setInterval(() => {
			this.languageToast.textContent = this.languageToast.textContent.indexOf(".....") > -1 ? "Grabbing dictionary (" + this.languages[lang].name + "). Please wait" : this.languageToast.textContent + ".";
		},500);
		this.languageToast.lang = lang
		require("request")("https://mwittrien.github.io/BetterDiscordAddons/Plugins/SpellCheck/dic/" + lang + ".dic", (error, response, result) => {
			if (error || (response && result.toLowerCase().indexOf("<!doctype html>") > -1)) {
				this.killLanguageToast();
				BDFDB.showToast("Failed to grab dictionary (" + this.languages[lang].name + ").", {type: "error"});
			}
			else if (response && this.languageToast.lang == lang) {
				this.langDictionary = result.split("\n");
				this.dictionary = this.langDictionary.concat(this.dictionary);
				this.dictionary = this.dictionary.map(word => word.toLowerCase());
				this.killLanguageToast();
				BDFDB.showToast("Successfully grabbed dictionary (" + this.languages[lang].name + ").", {type: "success"});
			}
		});
	}

	killLanguageToast () {
		if (this.languageToast && typeof this.languageToast.close == "function") {
			clearInterval(this.languageToast.interval);
			this.languageToast.close();
		}
	}

	spellCheckText (string) {
		var htmlString = [];
		string.replace(/\n/g, "\n ").split(" ").forEach(word => {
			let hasnewline = word.endsWith("\n");
			word = word.replace(/\n/g, "");
			htmlString.push(`<label class="${this.isWordNotInDictionary(word) ? "spelling-error" : "nospelling-error"}" style="color: transparent !important; text-shadow: none !important;">${BDFDB.encodeToHTML(word)}</label>${hasnewline ? "\n" : ""}`);
		});
		return htmlString.join(" ").replace(/\n /g, "\n");
	}

	isWordNotInDictionary (word) {
		var wordLow = word.toLowerCase();
		var wordWithoutSymbols = wordLow.replace(/[0-9\µ\@\$\£\€\¥\¢\²\³\>\<\|\,\;\.\:\_\#\+\*\~\?\¿\\\´\`\}\=\]\)\[\(\{\/\&\%\§\"\!\¡\^\°\n\t\r]/g, "");
		return (wordLow.indexOf("http://") != 0 && wordLow.indexOf("https://") != 0 && wordWithoutSymbols && Array.isArray(this.dictionary) && this.dictionary.length > 0 && !this.dictionary.includes(wordLow) && !this.dictionary.includes(wordWithoutSymbols));
	}


	getSimilarWords (word) {
		var maxAmount = BDFDB.getData("maxSimilarAmount", this, "amounts"), similarWords = [];
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
		switch (BDFDB.getDiscordLanguage().id) {
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
