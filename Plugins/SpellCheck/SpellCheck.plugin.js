//META{"name":"SpellCheck","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SpellCheck","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SpellCheck/SpellCheck.plugin.js"}*//

var SpellCheck = (_ => {
	var languages, dictionaries, langDictionaries, languageToasts, checkTimeout, currentText;
	var settings = {}, choices = {}, amounts = {};
	
	return class SpellCheck {
		getName () {return "SpellCheck";}

		getVersion () {return "1.5.3";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds a spellcheck to all textareas. Select a word and rightclick it to add it to your dictionary.";}

		constructor () {
			this.changelog = {
				"improved":[["Special Character / Symbols","If half or more of the characters in a word are symbols, the word will automatically be ignored by the dictionary check to avoid stuff like 'v1.2.3' being marked as incorrect"]]
			};
			
			this.patchedModules = {
				after: {
					SlateChannelTextArea: ["componentDidMount", "componentDidUpdate"]
				}
			};
		}

		initConstructor () {
			languages = {};
			dictionaries = {};
			langDictionaries = {};
			languageToasts = {};

			this.css = `
				${BDFDB.dotCNS._spellcheckoverlay + BDFDB.dotCN._spellcheckerror} {
					background-image: url('data:image/png;base64,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');
					background-repeat: repeat-x;
					background-position: bottom;
				}`;


			this.defaults = {
				settings: {
					downloadDictionary:			{value:false, 	description:"Use local dictionary file (downloads dictionary on first useage)"}
				},
				choices: {
					dictionaryLanguage:			{value:"en", 	force:true,		description:"Primary Language:"},
					secondaryLanguage:			{value:"-", 	force:false,	description:"Secondary Language:"}
				},
				amounts: {
					maxSimilarAmount:			{value:6, 		min:1,		max:30,		description:"Maximal Amount of suggested Words:"}
				}
			};
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let choices = BDFDB.DataUtils.get(this, "choices");
			let amounts = BDFDB.DataUtils.get(this, "amounts");
			let ownDictionary = BDFDB.DataUtils.load(this, "owndics", choices.dictionaryLanguage) || [];
			let settingsPanel, settingsItems = [];
			
			for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
			}));
			
			for (let key in choices) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Select",
				plugin: this,
				keys: ["choices", key],
				label: this.defaults.choices[key].description,
				basis: "70%",
				value: choices[key],
				options: (this.defaults.choices[key].force ? [] : [{value:"-", label:BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_NOTHING}]).concat(BDFDB.ObjectUtils.toArray(BDFDB.ObjectUtils.map(languages, (lang, id) => ({value:id, label:this.getLanguageName(lang)})))),
				searchable: true,
				onChange: value => {
					this.setDictionary(key, value);
					BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel);
				}
			}));
			
			for (let key in amounts) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "TextInput",
				childProps: {
					type: "number"
				},
				plugin: this,
				keys: ["amounts", key],
				label: this.defaults.amounts[key].description,
				basis: "20%",
				min: this.defaults.amounts[key].min,
				max: this.defaults.amounts[key].max,
				value: amounts[key]
			}));
			
			if (ownDictionary.length) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
				title: "Your own Dictionary:",
				first: settingsItems.length == 0,
				last: true,
				children: ownDictionary.map(word => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Card, {
					children: word.toLowerCase(),
					onRemove: _ => {
						BDFDB.ArrayUtils.remove(ownDictionary, word);
						BDFDB.DataUtils.save(ownDictionary, this, "owndics", choices.dictionaryLanguage);
						dictionaries.dictionaryLanguage = this.formatDictionary(langDictionaries.dictionaryLanguage.concat(ownDictionary));
						BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel);
					}
				}))
			}));
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
		}

		// Legacy
		load () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) BDFDB.PluginUtils.load(this);
		}

		start () {
			if (!window.BDFDB) window.BDFDB = {myPlugins:{}};
			if (window.BDFDB && window.BDFDB.myPlugins && typeof window.BDFDB.myPlugins == "object") window.BDFDB.myPlugins[this.getName()] = this;
			let libraryScript = document.querySelector("head script#BDFDBLibraryScript");
			if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("id", "BDFDBLibraryScript");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", _ => {this.initialize();});
				document.head.appendChild(libraryScript);
			}
			else if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(_ => {
				try {return this.initialize();}
				catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
			}, 30000);
		}

		initialize () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				if (this.started) return;
				BDFDB.PluginUtils.init(this);
				
				BDFDB.LibraryRequires.request("https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SpellCheck/dic", (error, response, body) => {
					let dictionaryLanguageIds = Array.from(BDFDB.DOMUtils.create(body).querySelectorAll(`[href*="/mwittrien/BetterDiscordAddons/blob/master/Plugins/SpellCheck/dic/"]`)).map(n => n.innerText.split(".")[0]).filter(n => n);
					languages = BDFDB.ObjectUtils.filter(BDFDB.LanguageUtils.languages, langId => dictionaryLanguageIds.includes(langId), true);
					
					if ((BDFDB.LibraryModules.StoreChangeUtils && BDFDB.LibraryModules.StoreChangeUtils.get("SpellcheckStore") || {}).enabled) BDFDB.LibraryModules.SpellCheckUtils.toggleSpellcheck();

					this.forceUpdateAll();
					
					for (let key in choices) {
						if (key == "dictionaryLanguage" && !languages[choices[key]]) {
							choices[key] = "en";
							BDFDB.DataUtils.save(choices[key], this, "choices", key);
						}
						this.setDictionary(key, choices[key]);
					}
				});
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;
				
				BDFDB.DOMUtils.remove(BDFDB.dotCN._spellcheckoverlay);

				for (let key in languageToasts) this.killLanguageToast(key);

				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		onSlateContextMenu (e) {
			let [SCparent, SCindex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "spellcheck", group:true});
			if (SCindex > -1) SCparent.splice(SCindex, 1);
			let textarea = BDFDB.DOMUtils.getParent(BDFDB.dotCN.textarea, e.instance.props.target), word = null;
			if (textarea) for (let error of textarea.parentElement.querySelectorAll(BDFDB.dotCN._spellcheckerror)) {
				let rects = BDFDB.DOMUtils.getRects(error);
				if (BDFDB.InternalData.mousePosition.pageX > rects.x && BDFDB.InternalData.mousePosition.pageX < (rects.x + rects.width) && BDFDB.InternalData.mousePosition.pageY > rects.y && BDFDB.InternalData.mousePosition.pageY < (rects.y + rects.height)) {
					word = error.innerText;
					break;
				}
			}
			if (word && this.isWordNotInDictionary(word)) {
				let similarWords = this.getSimilarWords(word.toLowerCase().trim());
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
				children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: BDFDB.LanguageUtils.LanguageStrings.SPELLCHECK,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "spellcheck"),
						children: [
							BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								label: this.labels.context_spellcheck_text,
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "add-to-spellcheck"),
								hint: _ => {
									return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
										hint: word
									});
								},
								action: _ => {
									this.addToOwnDictionary(word);
								}
							}),
							BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuSeparator, {}),
							!similarWords.length ? BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								label: this.labels.context_nosimilarwords_text,
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "no-suggestions"),
								disabled: true
							}) : similarWords.sort().map(suggestion => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								label: suggestion,
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "suggestion", suggestion),
								action: _ => {
									this.replaceWord(e.instance.props.editor, word, suggestion);
								}
							}))
						].flat(10).filter(n => n)
					})
				}));
			}
		}

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
		}

		processSlateChannelTextArea (e) {
			let newText = BDFDB.LibraryModules.SlateUtils.serialize(e.instance.props.value);
			if (newText != currentText) {
				currentText = newText;
				BDFDB.DOMUtils.remove(e.node.parentElement.querySelectorAll(BDFDB.dotCN._spellcheckoverlay));
				BDFDB.TimeUtils.clear(checkTimeout);
				checkTimeout = BDFDB.TimeUtils.timeout(_ => {
					let overlay = e.node.cloneNode(true), wrapper = BDFDB.DOMUtils.getParent(BDFDB.dotCN.textareainner, e.node);
					BDFDB.DOMUtils.addClass(overlay, BDFDB.disCN._spellcheckoverlay);
					let style = Object.assign({}, getComputedStyle(e.node));
					for (let i in style) if (i.indexOf("webkit") == -1 && isNaN(parseInt(i))) overlay.style[i] = style[i];
					overlay.style.setProperty("color", "transparent", "important");
					overlay.style.setProperty("background", "none", "important");
					overlay.style.setProperty("mask", "none", "important");
					overlay.style.setProperty("pointer-events", "none", "important");
					overlay.style.setProperty("position", "absolute", "important");
					overlay.style.setProperty("left", BDFDB.DOMUtils.getRects(e.node).left - BDFDB.DOMUtils.getRects(wrapper).left + "px", "important");
					overlay.style.setProperty("width", BDFDB.DOMUtils.getRects(e.node).width - style.paddingLeft - style.paddingRight + "px", "important");
					overlay.style.setProperty("height", style.height, "important");
					for (let child of overlay.querySelectorAll("*")) {
						child.style.setProperty("color", "transparent", "important");
						child.style.setProperty("background-color", "transparent", "important");
						child.style.setProperty("border-color", "transparent", "important");
						child.style.setProperty("text-shadow", "none", "important");
						child.style.setProperty("pointer-events", "none", "important");
						if (child.getAttribute("data-slate-string") && child.parentElement.getAttribute("data-slate-leaf")) {
							let newline = child.querySelector("br");
							if (newline) newline.remove();
							child.innerHTML = this.spellCheckText(child.textContent);
							if (newline) child.appendChild(newline);
						}
					}
					e.node.parentElement.appendChild(overlay);
				}, 300);
			}
		}

		spellCheckText (string) {
			let htmlString = [];
			string.replace(/\n/g, "\n ").split(" ").forEach(word => {
				let hasNewline = word.endsWith("\n");
				word = word.replace(/\n/g, "");
				htmlString.push(`<label class="${this.isWordNotInDictionary(word) ? BDFDB.disCN._spellcheckerror : ""}" style="color: transparent !important; text-shadow: none !important;">${BDFDB.StringUtils.htmlEscape(word)}</label>${hasNewline ? "\n" : ""}`);
			});
			return htmlString.join(" ").replace(/\n /g, "\n");
		}

		replaceWord (editor, toBeReplaced, replacement) {
			let editorContainer = BDFDB.ReactUtils.findOwner(editor, {name: "ChannelEditorContainer", up: true});
			if (!editor || !editorContainer || !editorContainer.props || !editorContainer.props.textValue) return;
			toBeReplaced = toBeReplaced.toUpperCase();
			let newString = [];
			editorContainer.props.textValue.replace(/\n/g, "\n ").split(" ").forEach(word => {
				let hasNewline = word.endsWith("\n");
				word = word.replace(/\n/g, "");
				if (word.toUpperCase() == toBeReplaced) {
					let firstLetter = word.charAt(0);
					let isCapitalised = firstLetter.toUpperCase() == firstLetter && firstLetter.toLowerCase() != firstLetter;
					newString.push((isCapitalised ? replacement.charAt(0).toUpperCase() + replacement.slice(1) : replacement) + (hasNewline ? "\n" : ""));
				}
				else newString.push(word + (hasNewline ? "\n" : ""));
			});
			editor.setValue(BDFDB.SlateUtils.copyRichValue(newString.join(" ").replace(/\n /g, "\n"), editor.props.value));
		}

		addToOwnDictionary (word) {
			word = word.split(" ")[0].split("\n")[0].split("\r")[0].split("\t")[0];
			if (word) {
				let wordLow = word.toLowerCase();
				if (languages[choices.dictionaryLanguage]) {
					let ownDictionary = BDFDB.DataUtils.load(this, "owndics", choices.dictionaryLanguage) || [];
					if (!ownDictionary.includes(wordLow)) {
						ownDictionary.push(wordLow);
						BDFDB.DataUtils.save(ownDictionary, this, "owndics", choices.dictionaryLanguage);
						BDFDB.NotificationUtils.toast(this.labels.toast_wordadd_text.replace("${word}", word).replace("${dicName}", this.getLanguageName(languages[choices.dictionaryLanguage])), {type:"success"});
						dictionaries.dictionaryLanguage = this.formatDictionary(langDictionaries.dictionaryLanguage.concat(ownDictionary));
					}
				}
			}
		}

		setDictionary (key, lang) {
			this.killLanguageToast(key);
			if (languages[lang]) {
				let ownDictionary = BDFDB.DataUtils.load(this, "owndics", lang) || [];
				languageToasts[key] = BDFDB.NotificationUtils.toast("Grabbing dictionary (" + this.getLanguageName(languages[lang]) + "). Please wait", {timeout:0});
				languageToasts[key].interval = BDFDB.TimeUtils.interval(_ => {
					languageToasts[key].textContent = languageToasts[key].textContent.indexOf(".....") > -1 ? "Grabbing dictionary (" + this.getLanguageName(languages[lang]) + "). Please wait" : languageToasts[key].textContent + ".";
				}, 500);
				languageToasts[key].lang = lang
				
				let folder = BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), "dictionaries");
				let filePath = BDFDB.LibraryRequires.path.join(folder, lang + ".dic");
				
				let parse = (error, response, body, download) => {
					this.killLanguageToast(key);
					if (error || (response && body.toLowerCase().indexOf("<!doctype html>") > -1)) {
						BDFDB.NotificationUtils.toast("Failed to grab dictionary (" + this.getLanguageName(languages[lang]) + ").", {type: "error"});
					}
					else if (response && languageToasts[key].lang == lang) {
						if (download) {
							if (!BDFDB.LibraryRequires.fs.existsSync(folder)) BDFDB.LibraryRequires.fs.mkdirSync(folder);
							BDFDB.LibraryRequires.fs.writeFile(filePath, body, _ => {});
						}
						langDictionaries[key] = body.toLowerCase().replace(/\r/g, "").split("\n");
						dictionaries[key] = this.formatDictionary(langDictionaries[key].concat(ownDictionary));
						BDFDB.NotificationUtils.toast("Successfully grabbed dictionary (" + this.getLanguageName(languages[lang]) + ").", {type: "success"});
					}
				};
				
				if (settings.downloadDictionary && BDFDB.LibraryRequires.fs.existsSync(filePath)) BDFDB.LibraryRequires.fs.readFile(filePath, (error, buffer) => {
					parse(error, buffer, buffer.toString(), false);
				});
				else BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/SpellCheck/dic/" + lang + ".dic", (error, response, body) => {
					parse(error, response, body, settings.downloadDictionary);
				});
			}
			else {
				delete dictionaries[key];
				delete langDictionaries[key];
			}
		}
		
		formatDictionary (words) {
			let i = 0;
			return words.reduce((dictionary, word) => {
				let firstLetterLower = word.charAt(0).toLowerCase();
				if (!dictionary[firstLetterLower]) dictionary[firstLetterLower] = {};
				if (!dictionary[firstLetterLower][word.length]) dictionary[firstLetterLower][word.length] = [];
				dictionary[firstLetterLower][word.length].push(word);
				return dictionary;
			}, {});
		}

		killLanguageToast (key) {
			if (languageToasts[key] && typeof languageToasts[key].close == "function") {
				BDFDB.TimeUtils.clear(languageToasts[key].interval);
				languageToasts[key].close();
			}
		}

		isWordNotInDictionary (unformatedWord) {
			let wordLow = unformatedWord.toLowerCase();
			let wordWithoutSymbols = wordLow.replace(/[0-9\µ\@\$\£\€\¥\¢\²\³\>\<\|\,\;\.\:\-\_\#\+\*\~\?\¿\\\´\`\}\=\]\)\[\(\{\/\&\%\§\"\!\¡\^\°\n\t\r]/g, "");
			if (wordLow.indexOf("http://") != 0 && wordLow.indexOf("https://") != 0 && wordWithoutSymbols && wordWithoutSymbols.length > wordLow.length/2) {
				let wordStartingPos = /^.{1}'/.test(wordWithoutSymbols) ? wordWithoutSymbols.split("'")[1] : "";
				let wordEndingPos = /'.{1}$/.test(wordWithoutSymbols) ? wordWithoutSymbols.split("'").reverse()[1] : "";
				for (let key in dictionaries) for (let word of BDFDB.ArrayUtils.removeCopies([wordLow, wordWithoutSymbols, wordStartingPos, wordEndingPos].filter(n => n))) {
					let firstLetterLower = word.charAt(0);
					if (dictionaries[key] && dictionaries[key][firstLetterLower] && dictionaries[key][firstLetterLower][word.length] && dictionaries[key][firstLetterLower][word.length].includes(word)) return false;
				}
				return true;
			}
			return false;
		}

		getSimilarWords (word) {
			let similarWords = [];
			if (amounts.maxSimilarAmount > 0) {
				let firstLetterLower = word.charAt(0).toLowerCase();
				let possibilities = [];
				for (let key in dictionaries) if (dictionaries[key] && dictionaries[key][firstLetterLower]) possibilities = possibilities.concat(BDFDB.ObjectUtils.toArray(dictionaries[key][firstLetterLower]).flat());
				possibilities = BDFDB.ArrayUtils.removeCopies(possibilities);
				let similarities = {};
				for (let string of possibilities) {
					let value = this.wordSimilarity(word, string);
					if (!similarities[value]) similarities[value] = [];
					similarities[value].push(string);
				}
				let amount = 0;
				for (let value of Object.keys(similarities).sort().reverse()) {
					for (let similarWord of similarities[value]) {
						if (amount < amounts.maxSimilarAmount && !similarWords.includes(similarWord)) {
							similarWords.push(similarWord);
							amount++;
						}
						if (amount >= amounts.maxSimilarAmount) break;
					}
					if (amount >= amounts.maxSimilarAmount) break;
				}
			}
			return similarWords;
		}

		wordSimilarity (a, b) {
			let temp;
			if (a.length === 0 || b.length === 0 || a.length - b.length > 3 || b.length - a.length > 3) return 0;
			if (a.length > b.length) {
				temp = a;
				a = b;
				b = temp;
			}
			let result = 0, row = [...Array(a.length + 1).keys()];
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
		
		getLanguageName (language) {
			if (language.name.startsWith("Discord")) return language.name.slice(0, -1) + (language.ownlang && languages[language.id].name != language.ownlang ? ` / ${language.ownlang}` : "") + ")";
			else return language.name + (language.ownlang && language.name != language.ownlang ? ` / ${language.ownlang}` : "");
		}
		
		forceUpdateAll () {
			settings = BDFDB.DataUtils.get(this, "settings");
			choices = BDFDB.DataUtils.get(this, "choices");
			amounts = BDFDB.DataUtils.get(this, "amounts");
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}

		setLabelsByLanguage () {
			switch (BDFDB.LanguageUtils.getLanguage().id) {
				case "hr":		//croatian
					return {
						context_spellcheck_text:				"Dodaj u rječnik",
						context_nosimilarwords_text:			"Nema sličnih riječi",
						toast_wordadd_text:						"Riječ ${word} dodana je u rječnik ${dicName}."
					};
				case "da":		//danish
					return {
						context_spellcheck_text:				"Tilføj til ordbog",
						context_nosimilarwords_text:			"Ingen lignende ord",
						toast_wordadd_text:						"Ord ${word} tilføjet til ordbog ${dicName}."
					};
				case "de":		//german
					return {
						context_spellcheck_text:				"Zum Wörterbuch hinzufügen",
						context_nosimilarwords_text:			"Keine ähnlichen Wörter",
						toast_wordadd_text:						"Wort ${word} wurde zum Wörterbuch ${dicName} hinzugefügt."
					};
				case "es":		//spanish
					return {
						context_spellcheck_text:				"Agregar al diccionario",
						context_nosimilarwords_text:			"No hay palabras similares",
						toast_wordadd_text:						"Se agregó la palabra ${word} al diccionario ${dicName}."
					};
				case "fr":		//french
					return {
						context_spellcheck_text:				"Ajouter au dictionnaire",
						context_nosimilarwords_text:			"Pas de mots similaires",
						toast_wordadd_text:						"Le mot ${word} a été ajouté au dictionnaire ${dicName}."
					};
				case "it":		//italian
					return {
						context_spellcheck_text:				"Aggiungi al dizionario",
						context_nosimilarwords_text:			"Nessuna parola simile",
						toast_wordadd_text:						"Parola ${word} aggiunta al dizionario ${dicName}."
					};
				case "nl":		//dutch
					return {
						context_spellcheck_text:				"Toevoegen aan woordenboek",
						context_nosimilarwords_text:			"Geen vergelijkbare woorden",
						toast_wordadd_text:						"Word ${word} toegevoegd aan woordenboek ${dicName}."
					};
				case "no":		//norwegian
					return {
						context_spellcheck_text:				"Legg til i ordbok",
						context_nosimilarwords_text:			"Ingen lignende ord",
						toast_wordadd_text:						"Ord ${word} legges til ordbok ${dicName}."
					};
				case "pl":		//polish
					return {
						context_spellcheck_text:				"Dodaj do słownika",
						context_nosimilarwords_text:			"Brak podobnych słów",
						toast_wordadd_text:						"Słowo ${word} dodane do słownika ${dicName}."
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						context_spellcheck_text:				"Adicionar ao dicionário",
						context_nosimilarwords_text:			"Sem palavras semelhantes",
						toast_wordadd_text:						"Palavra ${word} adicionado ao dicionário ${dicName}."
					};
				case "fi":		//finnish
					return {
						context_spellcheck_text:				"Lisää sanakirjaan",
						context_nosimilarwords_text:			"Ei vastaavia sanoja",
						toast_wordadd_text:						"Sana ${word} lisättiin sanakirjaan ${dicName}."
					};
				case "sv":		//swedish
					return {
						context_spellcheck_text:				"Lägg till i ordbok",
						context_nosimilarwords_text:			"Inga liknande ord",
						toast_wordadd_text:						"Ord ${word} läggs till ordbok ${dicName}."
					};
				case "tr":		//turkish
					return {
						context_spellcheck_text:				"Sözlükye Ekle",
						context_nosimilarwords_text:			"Benzer kelime yoktur",
						toast_wordadd_text:						"Sözcük ${word} sözlük ${dicName}'ye eklendi."
					};
				case "cs":		//czech
					return {
						context_spellcheck_text:				"Přidat do slovníku",
						context_nosimilarwords_text:			"Žádné podobné slova",
						toast_wordadd_text:						"Slovo ${word} bylo přidáno do slovníku ${dicName}."
					};
				case "bg":		//bulgarian
					return {
						context_spellcheck_text:				"Добави в речника",
						context_nosimilarwords_text:			"Няма подобни думи",
						toast_wordadd_text:						"Думата ${word} е добавена към речника ${dicName}."
					};
				case "ru":		//russian
					return {
						context_spellcheck_text:				"Добавить в словарь",
						context_nosimilarwords_text:			"Нет похожих слов",
						toast_wordadd_text:						"Слово ${word} добавлено в словарь ${dicName}."
					};
				case "uk":		//ukrainian
					return {
						context_spellcheck_text:				"Додати до словника",
						context_nosimilarwords_text:			"Немає подібних слів",
						toast_wordadd_text:						"Словник ${word} додається до словника ${dicName}."
					};
				case "ja":		//japanese
					return {
						context_spellcheck_text:				"辞書に追加",
						context_nosimilarwords_text:			"類似の単語はありません",
						toast_wordadd_text:						"単語 ${word} が辞書 ${dicName} に追加されました。"
					};
				case "zh-TW":	//chinese (traditional)
					return {
						context_spellcheck_text:				"添加到詞典",
						context_nosimilarwords_text:			"沒有類似的詞",
						toast_wordadd_text:						"單詞 ${word} 添加到字典 ${dicName}。"
					};
				case "ko":		//korean
					return {
						context_spellcheck_text:				"사전에 추가",
						context_nosimilarwords_text:			"유사한 단어 없음",
						toast_wordadd_text:						"단어 ${word} 사전 ${dicName} 에 추가되었습니다."
					};
				default:		//default: english
					return {
						context_spellcheck_text:				"Add to Dictionary",
						context_nosimilarwords_text:			"No similar Words",
						toast_wordadd_text:						"Word ${word} added to dictionary ${dicName}."
					};
			}
		}
	}
})();

module.exports = SpellCheck;