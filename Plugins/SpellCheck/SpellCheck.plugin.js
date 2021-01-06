/**
 * @name SpellCheck
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SpellCheck
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SpellCheck/SpellCheck.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SpellCheck/SpellCheck.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "SpellCheck",
			"author": "DevilBro",
			"version": "1.5.4",
			"description": "Add a spellcheck to all textareas. Select a word and rightclick it to add it to your dictionary"
		}
	};
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName() {return config.info.name;}
		getAuthor() {return config.info.author;}
		getVersion() {return config.info.version;}
		getDescription() {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
		stop() {}
		getSettingsPanel() {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The library plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", _ => {
				require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
					if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
					else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
				});
			});
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var languages, dictionaries, langDictionaries, languageToasts, checkTimeout, currentText;
		var settings = {}, choices = {}, amounts = {};
	
		return class SpellCheck extends Plugin {
			onLoad() {
				languages = {};
				dictionaries = {};
				langDictionaries = {};
				languageToasts = {};
				
				this.defaults = {
					settings: {
						downloadDictionary:			{value: false, 	description: "Use local dictionary file (downloads dictionary on first usage)"}
					},
					choices: {
						dictionaryLanguage:			{value: "en", 	force: true,		description: "Primary Language: "},
						secondaryLanguage:			{value: "-", 	force: false,	description: "Secondary Language: "}
					},
					amounts: {
						maxSimilarAmount:			{value: 6, 		min: 1,		max: 30,		description: "Maximal Amount of suggested Words: "}
					}
				};
			
				this.patchedModules = {
					after: {
						SlateChannelTextArea: ["componentDidMount", "componentDidUpdate"]
					}
				};
				
				this.css = `
					${BDFDB.dotCNS._spellcheckoverlay + BDFDB.dotCN._spellcheckerror} {
						background-image: url('data:image/png;base64,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');
						background-repeat: repeat-x;
						background-position: bottom;
					}
				`;
			}
			
			onStart() {
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
			
			onStop() {
				this.forceUpdateAll();
				
				BDFDB.DOMUtils.remove(BDFDB.dotCN._spellcheckoverlay);

				for (let key in languageToasts) this.killLanguageToast(key);
			}

			getSettingsPanel (collapseStates = {}) {
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
					options: (this.defaults.choices[key].force ? [] : [{value: "-", label: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_NOTHING}]).concat(BDFDB.ObjectUtils.toArray(BDFDB.ObjectUtils.map(languages, (lang, id) => ({value: id, label: this.getLanguageName(lang)})))),
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
				
				if (ownDictionary.length) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
					title: "Your own Dictionary:",
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

			onSettingsClosed() {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll() {
				settings = BDFDB.DataUtils.get(this, "settings");
				choices = BDFDB.DataUtils.get(this, "choices");
				amounts = BDFDB.DataUtils.get(this, "amounts");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			onSlateContextMenu (e) {
				let [SCparent, SCindex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "spellcheck", group: true});
				if (SCindex > -1) SCparent.splice(SCindex, 1);
				let textarea = BDFDB.DOMUtils.getParent(BDFDB.dotCN.textarea, e.instance.props.target), word = null;
				if (textarea) for (let error of textarea.parentElement.querySelectorAll(BDFDB.dotCN._spellcheckerror)) {
					let rects = BDFDB.DOMUtils.getRects(error);
					let position = BDFDB.ListenerUtils.getPosition();
					if (position.pageX > rects.x && position.pageX < (rects.x + rects.width) && position.pageY > rects.y && position.pageY < (rects.y + rects.height)) {
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
									label: this.labels.context_spellcheck,
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
									label: this.labels.context_nosimilarwords,
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
							BDFDB.NotificationUtils.toast(this.labels.toast_wordadd.replace("{{word}}", word).replace("{{dicName}}", this.getLanguageName(languages[choices.dictionaryLanguage])), {type: "success"});
							dictionaries.dictionaryLanguage = this.formatDictionary(langDictionaries.dictionaryLanguage.concat(ownDictionary));
						}
					}
				}
			}

			setDictionary (key, lang) {
				this.killLanguageToast(key);
				if (languages[lang]) {
					let ownDictionary = BDFDB.DataUtils.load(this, "owndics", lang) || [];
					languageToasts[key] = BDFDB.NotificationUtils.toast("Grabbing dictionary (" + this.getLanguageName(languages[lang]) + "). Please wait", {timeout: 0});
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

			setLabelsByLanguage() {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							context_nosimilarwords:				"Няма подобни думи",
							context_spellcheck:					"Добавяне към речника",
							toast_wordadd:						"Думата '{{word}}' е добавена към речника '{{dicName}}'."
						};
					case "da":		// Danish
						return {
							context_nosimilarwords:				"Ingen lignende ord",
							context_spellcheck:					"Føj til ordbog",
							toast_wordadd:						"Ordet '{{word}}' blev føjet til ordbogen '{{dicName}}'."
						};
					case "de":		// German
						return {
							context_nosimilarwords:				"Keine ähnlichen Wörter",
							context_spellcheck:					"Zum Wörterbuch hinzufügen",
							toast_wordadd:						"Wort '{{word}}' zum Wörterbuch '{{dicName}}' hinzugefügt."
						};
					case "el":		// Greek
						return {
							context_nosimilarwords:				"Δεν υπάρχουν παρόμοιες λέξεις",
							context_spellcheck:					"Προσθήκη στο λεξικό",
							toast_wordadd:						"Προστέθηκε η λέξη '{{word}}' στο λεξικό '{{dicName}}'."
						};
					case "es":		// Spanish
						return {
							context_nosimilarwords:				"No hay palabras similares",
							context_spellcheck:					"Agregar al diccionario",
							toast_wordadd:						"Se agregó la palabra '{{word}}' al diccionario '{{dicName}}'."
						};
					case "fi":		// Finnish
						return {
							context_nosimilarwords:				"Ei vastaavia sanoja",
							context_spellcheck:					"Lisää sanakirjaan",
							toast_wordadd:						"Sana '{{word}}' lisättiin sanakirjaan '{{dicName}}'."
						};
					case "fr":		// French
						return {
							context_nosimilarwords:				"Pas de mots similaires",
							context_spellcheck:					"Ajouter au dictionnaire",
							toast_wordadd:						"Mot '{{word}}' ajouté au dictionnaire '{{dicName}}'."
						};
					case "hr":		// Croatian
						return {
							context_nosimilarwords:				"Nema sličnih riječi",
							context_spellcheck:					"Dodaj u rječnik",
							toast_wordadd:						"Riječ '{{word}}' dodana je u rječnik '{{dicName}}'."
						};
					case "hu":		// Hungarian
						return {
							context_nosimilarwords:				"Nincsenek hasonló szavak",
							context_spellcheck:					"Hozzáadás a szótárhoz",
							toast_wordadd:						"A '{{word}}' szó hozzáadva a '{{dicName}}' szótárhoz."
						};
					case "it":		// Italian
						return {
							context_nosimilarwords:				"Nessuna parola simile",
							context_spellcheck:					"Aggiungi al dizionario",
							toast_wordadd:						"Parola '{{word}}' aggiunta al dizionario '{{dicName}}'."
						};
					case "ja":		// Japanese
						return {
							context_nosimilarwords:				"同様の言葉はありません",
							context_spellcheck:					"辞書に追加",
							toast_wordadd:						"単語'{{word}}'が辞書'{{dicName}}'に追加されました。"
						};
					case "ko":		// Korean
						return {
							context_nosimilarwords:				"유사한 단어 없음",
							context_spellcheck:					"사전에 추가",
							toast_wordadd:						"단어 '{{word}}'이 '{{dicName}}' 사전에 추가되었습니다."
						};
					case "lt":		// Lithuanian
						return {
							context_nosimilarwords:				"Jokių panašių žodžių",
							context_spellcheck:					"Pridėti prie žodyno",
							toast_wordadd:						"Žodis '{{word}}' pridėtas prie žodyno '{{dicName}}'."
						};
					case "nl":		// Dutch
						return {
							context_nosimilarwords:				"Geen vergelijkbare woorden",
							context_spellcheck:					"Toevoegen aan woordenboek",
							toast_wordadd:						"Woord '{{word}}' toegevoegd aan woordenboek '{{dicName}}'."
						};
					case "no":		// Norwegian
						return {
							context_nosimilarwords:				"Ingen lignende ord",
							context_spellcheck:					"Legg til ordbok",
							toast_wordadd:						"Ordet '{{word}}' ble lagt til ordboken '{{dicName}}'."
						};
					case "pl":		// Polish
						return {
							context_nosimilarwords:				"Brak podobnych słów",
							context_spellcheck:					"Dodaj do słownika",
							toast_wordadd:						"Słowo '{{word}}' zostało dodane do słownika '{{dicName}}'."
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							context_nosimilarwords:				"Sem palavras semelhantes",
							context_spellcheck:					"Adicionar ao Dicionário",
							toast_wordadd:						"Palavra '{{word}}' adicionada ao dicionário '{{dicName}}'."
						};
					case "ro":		// Romanian
						return {
							context_nosimilarwords:				"Fără cuvinte similare",
							context_spellcheck:					"Adăugați la dicționar",
							toast_wordadd:						"Cuvântul '{{word}}' a fost adăugat în dicționar '{{dicName}}'."
						};
					case "ru":		// Russian
						return {
							context_nosimilarwords:				"Нет похожих слов",
							context_spellcheck:					"Добавить в словарь",
							toast_wordadd:						"Слово '{{word}}' добавлено в словарь '{{dicName}}'."
						};
					case "sv":		// Swedish
						return {
							context_nosimilarwords:				"Inga liknande ord",
							context_spellcheck:					"Lägg till ordbok",
							toast_wordadd:						"Ordet '{{word}}' har lagts till i ordboken '{{dicName}}'."
						};
					case "th":		// Thai
						return {
							context_nosimilarwords:				"ไม่มีคำที่คล้ายกัน",
							context_spellcheck:					"เพิ่มในพจนานุกรม",
							toast_wordadd:						"เพิ่มคำ '{{word}}' ในพจนานุกรม '{{dicName}}' แล้ว"
						};
					case "tr":		// Turkish
						return {
							context_nosimilarwords:				"Benzer kelime yok",
							context_spellcheck:					"Sözlüğe Ekle",
							toast_wordadd:						"'{{word}}' kelimesi, '{{dicName}}' sözlüğüne eklendi."
						};
					case "uk":		// Ukrainian
						return {
							context_nosimilarwords:				"Немає подібних слів",
							context_spellcheck:					"Додати до словника",
							toast_wordadd:						"Слово '{{word}}' додано до словника '{{dicName}}'."
						};
					case "vi":		// Vietnamese
						return {
							context_nosimilarwords:				"Không có từ tương tự",
							context_spellcheck:					"Thêm vào từ điển",
							toast_wordadd:						"Đã thêm từ '{{word}}' vào từ điển '{{dicName}}'."
						};
					case "zh":		// Chinese
						return {
							context_nosimilarwords:				"没有类似的词",
							context_spellcheck:					"添加到字典",
							toast_wordadd:						"将单词'{{word}}'添加到字典'{{dicName}}'中。"
						};
					case "zh-TW":	// Chinese (Traditional)
						return {
							context_nosimilarwords:				"沒有類似的詞",
							context_spellcheck:					"添加到字典",
							toast_wordadd:						"將單詞'{{word}}'添加到字典'{{dicName}}'中。"
						};
					default:		// English
						return {
							context_nosimilarwords:				"No similar Words",
							context_spellcheck:					"Add to Dictionary",
							toast_wordadd:						"Word '{{word}}' added to dictionary '{{dicName}}'."
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
