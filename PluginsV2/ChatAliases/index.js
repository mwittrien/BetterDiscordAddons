module.exports = (Plugin, Api, Vendor) => {
	if (!global.BDFDB || typeof BDFDB != "object") global.BDFDB = {myPlugins:{}, BDv2Api: Api};

	return class extends Plugin {
		initConstructor () {
			this.patchModules = {
				"ChannelTextArea":"componentDidMount"
			};

			this.configs = ["case","exact","autoc","regex","file"];

			this.defaults = {
				settings: {
					addAutoComplete:	{value:true, 	description:"Add an Autocomplete-Menu for Non-Regex Aliases:"}
				}
			};
		}

		onStart () {
			if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.name] = this;
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
				if (this.started) return true;
				BDFDB.loadMessage(this);

				this.UploadModule = BDFDB.WebModules.findByProperties("instantBatchUpload");
				this.CurrentUserPerms = BDFDB.WebModules.findByProperties("getChannelPermissions", "can");
				this.Permissions = BDFDB.WebModules.findByProperties("Permissions", "ActivityTypes").Permissions;

				this.aliases = BDFDB.loadAllData(this, "words");

				BDFDB.addEventListener(document, "click", e => {
					if (!e.target.tagName === "TEXTAREA") BDFDB.removeEles(".autocompleteAliases", ".autocompleteAliasesRow");
				});

				BDFDB.WebModules.forceAllUpdates(this);

				return true;
			}
			else {
				console.error(`%c[${this.name}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
				return false;
			}
		}

		onStop () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				BDFDB.removeEles(".autocompleteAliases", ".autocompleteAliasesRow"); 

				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}


		// begin of own functions

		updateContainer (settingspanel, ele) {
			var update = false, wordvalue = null, replacevalue = null;
			var action = ele.getAttribute("action");

			if (action == "add") {
				var wordinput = settingspanel.querySelector("#input-wordvalue");
				var replaceinput = settingspanel.querySelector("#input-replacevalue");
				var fileselection = settingspanel.querySelector("#input-file");
				wordvalue = wordinput.value;
				replacevalue = replaceinput.value;
				if (wordvalue && wordvalue.trim().length > 0 && replacevalue && replacevalue.trim().length > 0) {
					wordvalue = wordvalue.trim();
					replacevalue = replacevalue.trim();
					var filedata = null;
					var fs = require("fs");
					if (fileselection.files && fileselection.files[0] && fs.existsSync(replacevalue)) {
						filedata = JSON.stringify({
							data: fs.readFileSync(replacevalue).toString("base64"),
							name: fileselection.files[0].name,
							type: fileselection.files[0].type
						});
					}
					this.aliases[wordvalue] = {
						replace: replacevalue,
						filedata: filedata,
						case: false,
						exact: wordvalue.indexOf(" ") == -1,
						autoc: true,
						regex: false,
						file: filedata != null
					};
					wordinput.value = null;
					replaceinput.value = null;
					update = true;
				}
			}
			else if (action == "remove") {
				wordvalue = ele.getAttribute("word");
				if (wordvalue) {
					delete this.aliases[wordvalue];
					update = true;
				}
			}
			else if (action == "removeall") {
				if (confirm("Are you sure you want to remove all added Words from your list?")) {
					this.aliases = {};
					update = true;
				}
			}
			if (update) {
				BDFDB.saveAllData(this.aliases, this, "words");

				var containerhtml = ``;
				for (let word in this.aliases) {
					containerhtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><input type="text" word="${word}" action="edit" class="${BDFDB.disCNS.gamename + BDFDB.disCN.gamenameinput} word-name" value="${BDFDB.encodeToHTML(word)}"><input type="text" word="${word}" action="edit" class="${BDFDB.disCNS.gamename + BDFDB.disCN.gamenameinput} replace-name" value="${BDFDB.encodeToHTML(this.aliases[word].replace)}">`;
					for (let config of this.configs) {
						containerhtml += `<div class="${BDFDB.disCNS.checkboxcontainer + BDFDB.disCN.marginreset}" style="flex: 0 0 auto;"><label class="${BDFDB.disCN.checkboxwrapper}"><input word="${word}" config="${config}" type="checkbox" class="${BDFDB.disCNS.checkboxinputdefault + BDFDB.disCN.checkboxinput}"${this.aliases[word][config] ? " checked" : ""}><div class="${BDFDB.disCNS.checkbox + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.checkboxround}"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label></div>`;
					}
					containerhtml += `</div><div word="${word}" action="remove" class="${BDFDB.disCN.hovercardbutton} remove-word"></div></div>`;
				}
				settingspanel.querySelector(".alias-list").innerHTML = containerhtml;
				BDFDB.initElements(settingspanel, this);
			}
		}

		updateWord (ele) {
			clearTimeout(ele.updateTimeout);
			ele.updateTimeout = setTimeout(() => {
				var card = ele.parentElement.parentElement;
				var oldwordvalue = ele.getAttribute("word");
				if (oldwordvalue && this.aliases[oldwordvalue]) {
					var wordinput = card.querySelector(".word-name");
					var replaceinput = card.querySelector(".replace-name");
					var removebutton = card.querySelector(".remove-word");
					var newwordvalue = wordinput.value;
					var newreplacevalue = replaceinput.value;
					wordinput.setAttribute("word", newwordvalue);
					wordinput.setAttribute("value", newwordvalue);
					replaceinput.setAttribute("word", newwordvalue);
					replaceinput.setAttribute("value", newreplacevalue);
					removebutton.setAttribute("word", newwordvalue);
					this.aliases[newwordvalue] = this.aliases[oldwordvalue];
					this.aliases[newwordvalue].replace = newreplacevalue;
					if (newwordvalue != oldwordvalue) delete this.aliases[oldwordvalue];
					BDFDB.saveAllData(this.aliases, this, "words");
				}
			},500);
		}

		updateConfig (ele) {
			var wordvalue = ele.getAttribute("word");
			var config = ele.getAttribute("config");
			if (wordvalue && this.aliases[wordvalue] && config) {
				this.aliases[wordvalue][config] = ele.checked;
				BDFDB.saveAllData(this.aliases, this, "words");
			}
		}

		toggleInfo (ele) {
			BDFDB.toggleClass(ele, BDFDB.disCN.categorywrappercollapsed);
			BDFDB.toggleClass(ele, BDFDB.disCN.categorywrapperdefault);
			var svg = ele.querySelector(BDFDB.dotCN.categoryicontransition);
			BDFDB.toggleClass(svg, BDFDB.disCN.directionright);
			BDFDB.toggleClass(svg, BDFDB.disCN.categoryiconcollapsed);
			BDFDB.toggleClass(svg, BDFDB.disCN.categoryicondefault);

			BDFDB.toggleEles(ele.nextElementSibling);
			BDFDB.saveData("hideInfo", BDFDB.isEleHidden(ele.nextElementSibling), this, "hideInfo");
		}

		processChannelTextArea (instance, wrapper) {
			if (instance.props && instance.props.type) {
				var textarea = wrapper.querySelector("textarea");
				if (!textarea) return;
				var channel = BDFDB.getSelectedChannel();
				if (!channel) return;
				var settings = BDFDB.getAllData(this, "settings");
				BDFDB.addEventListener(this, textarea, "input", () => {
					if (this.format) {
						this.format = false;
						textarea.focus();
						textarea.selectionStart = 0;
						textarea.selectionEnd = textarea.value.length;
						if (document.activeElement == textarea) {
							var messageInput = this.formatText(textarea.value);
							if (messageInput && messageInput.text != null) {
								document.execCommand("insertText", false, messageInput.text ? messageInput.text + " " : "");
							}
							if (messageInput && messageInput.files.length > 0 && (channel.type == 1 || this.CurrentUserPerms.can(this.Permissions.ATTACH_FILES, channel))) {
								this.UploadModule.instantBatchUpload(channel.id, messageInput.files);
							}
						}
					}
				});
				BDFDB.addEventListener(this, textarea, "keydown", e => {
					let autocompletemenu = textarea.parentElement.querySelector(BDFDB.dotCN.autocomplete);
					if (autocompletemenu && (e.which == 9 || e.which == 13)) {
						if (BDFDB.containsClass(autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected).parentElement, "autocompleteAliasesRow")) {
							e.originalEvent.preventDefault();
							e.originalEvent.stopPropagation();
							this.swapWordWithAlias(textarea); 
						}
					}
					else if (autocompletemenu && (e.which == 38 || e.which == 40)) {
						let autocompleteitems = autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselectable + ":not(.autocompleteAliasesSelector)");
						let selected = autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected);
						if (BDFDB.containsClass(selected, "autocompleteAliasesSelector") || autocompleteitems[e.which == 38 ? 0 : (autocompleteitems.length-1)] == selected) {
							e.originalEvent.preventDefault();
							e.originalEvent.stopPropagation();
							let next = this.getNextSelection(autocompletemenu, null, e.which == 38 ? false : true);
							BDFDB.removeClass(selected, BDFDB.disCN.autocompleteselected);
							BDFDB.addClass(selected, BDFDB.disCN.autocompleteselector);
							BDFDB.addClass(next, BDFDB.disCN.autocompleteselected);
						}
					}
					else if (textarea.value && !e.shiftKey && e.which == 13 && !autocompletemenu && textarea.value.indexOf("s/") != 0) {
						this.format = true;
						textarea.dispatchEvent(new Event("input"));
					}
					else if (!e.ctrlKey && e.which != 16 && settings.addAutoComplete && textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length) {
						clearTimeout(textarea.ChatAliasAutocompleteTimeout);
						textarea.ChatAliasAutocompleteTimeout = setTimeout(() => {this.addAutoCompleteMenu(textarea);},100);
					}

					if (!e.ctrlKey && e.which != 38 && e.which != 40 && !(e.which == 39 && textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length)) BDFDB.removeEles(".autocompleteAliases", ".autocompleteAliasesRow");
				});
				BDFDB.addEventListener(this, textarea, "click", e => {
					if (settings.addAutoComplete && textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length) setImmediate(() => {this.addAutoCompleteMenu(textarea);});
				});
			}
		}

		addAutoCompleteMenu (textarea) {
			if (textarea.parentElement.querySelector(".autocompleteAliasesRow")) return;
			let words = textarea.value.split(/\s/);
			let lastword = words[words.length-1].trim();
			if (words.length == 1 && BDFDB.isPluginEnabled("WriteUpperCase")) {
				let first = lastword.charAt(0);
				if (first === first.toUpperCase() && lastword.toLowerCase().indexOf("http") == 0) {
					lastword = lastword.charAt(0).toLowerCase() + lastword.slice(1);
				}
				else if (first === first.toLowerCase() && first !== first.toUpperCase() && lastword.toLowerCase().indexOf("http") != 0) {
					lastword = lastword.charAt(0).toUpperCase() + lastword.slice(1);
				}
			}
			if (lastword) {
				let matchedaliases = {};
				for (let word in this.aliases) {
					let aliasdata = this.aliases[word];
					if (!aliasdata.regex && aliasdata.autoc) {
						if (aliasdata.exact) {
							if (aliasdata.case && word.indexOf(lastword) == 0) matchedaliases[word] = aliasdata;
							else if (!aliasdata.case && word.toLowerCase().indexOf(lastword.toLowerCase()) == 0) matchedaliases[word] = aliasdata;
						}
						else {
							if (aliasdata.case && word.indexOf(lastword) > -1) matchedaliases[word] = aliasdata;
							else if (!aliasdata.case && word.toLowerCase().indexOf(lastword.toLowerCase()) > -1) matchedaliases[word] = aliasdata;
						}
					}
				}
				if (!BDFDB.isObjectEmpty(matchedaliases)) {
					let autocompletemenu = textarea.parentElement.querySelector(BDFDB.dotCNS.autocomplete + BDFDB.dotCN.autocompleteinner), amount = 15;
					if (!autocompletemenu) {
						autocompletemenu = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.autocomplete + BDFDB.disCN.autocomplete2} autocompleteAliases"><div class="${BDFDB.disCN.autocompleteinner}"></div></div>`);
						textarea.parentElement.appendChild(autocompletemenu);
						autocompletemenu = autocompletemenu.firstElementChild;
					}
					else {
						amount -= autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselectable).length;
					}
					let autocompleterowheader = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.autocompleterowvertical + BDFDB.disCN.autocompleterow} autocompleteAliasesRow"><div class="${BDFDB.disCN.autocompleteselector} autocompleteAliasesSelector"><div class="${BDFDB.disCNS.autocompletecontenttitle + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.weightsemibold}">Aliases: <strong class="lastword">${BDFDB.encodeToHTML(lastword)}</strong></div></div></div>`);
					autocompletemenu.appendChild(autocompleterowheader);
					BDFDB.addEventListener(this, autocompletemenu, "mouseenter", BDFDB.dotCN.autocompleteselectable, e => {
						var selected = autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselected);
						BDFDB.removeClass(selected, BDFDB.disCN.autocompleteselected);
						BDFDB.addClass(selected, BDFDB.disCN.autocompleteselector);
						BDFDB.addClass(e.currentTarget, BDFDB.disCN.autocompleteselected);
					});

					for (let word in matchedaliases) {
						if (amount-- < 1) break;
						let autocompleterow = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.autocompleterowvertical + BDFDB.disCN.autocompleterow} autocompleteAliasesRow"><div class="${BDFDB.disCNS.autocompleteselector + BDFDB.disCN.autocompleteselectable} autocompleteAliasesSelector"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.autocompletecontent}" style="flex: 1 1 auto;"><div class="${BDFDB.disCN.flexchild} aliasword" style="flex: 1 1 auto;">${BDFDB.encodeToHTML(word)}</div><div class="${BDFDB.disCNS.autocompletedescription + BDFDB.disCN.flexchild}">${BDFDB.encodeToHTML(matchedaliases[word].replace)}</div></div></div></div>`);
						autocompleterow.querySelector(BDFDB.dotCN.autocompleteselectable).addEventListener("click", () => {this.swapWordWithAlias(textarea);});
						autocompletemenu.appendChild(autocompleterow);
					}
					if (!autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected)) {
						BDFDB.addClass(autocompletemenu.querySelector(".autocompleteAliasesRow " + BDFDB.dotCN.autocompleteselectable), BDFDB.disCN.autocompleteselected);
					}
				}
			}
		}

		getNextSelection (menu, selected, forward) {
			selected = selected ? selected : menu.querySelector(BDFDB.dotCN.autocompleteselected).parentElement;
			let next, sibling = forward ? selected.nextElementSibling : selected.previousElementSibling;
			if (sibling) {
				next = sibling.querySelector(BDFDB.dotCN.autocompleteselectable);
			}
			else {
				let items = menu.querySelectorAll(BDFDB.dotCN.autocompleteselectable);
				next = forward ? items[0] : items[items.length-1]; 
			}
			return next ? next : this.getNextSelection(menu, sibling, forward);
		}

		swapWordWithAlias (textarea) {
			let aliasword = textarea.parentElement.querySelector(".autocompleteAliasesRow " + BDFDB.dotCN.autocompleteselected + " .aliasword").innerText;
			let lastword = textarea.parentElement.querySelector(".autocompleteAliasesRow .lastword").innerText;
			if (aliasword && lastword) {
				BDFDB.removeEles(".autocompleteAliases", ".autocompleteAliasesRow");
				textarea.focus(); 
				textarea.selectionStart = textarea.value.length - lastword.length;
				textarea.selectionEnd = textarea.value.length;
				document.execCommand("insertText", false, aliasword);
				textarea.selectionStart = textarea.value.length;
				textarea.selectionEnd = textarea.value.length;
			}
		}

		formatText (text) {
			text = text.replace(/([\n\t\r])/g, " $1 ");
			var newText = [], files = [], wordAliases = {}, multiAliases = {};
			for (let word in this.aliases) {
				if (!this.aliases[word].regex && word.indexOf(" ") == -1) wordAliases[word] = this.aliases[word];
				else multiAliases[word] = this.aliases[word];
			}
			for (let word of text.trim().split(" ")) {
				newText.push(this.useAliases(word, wordAliases, files, true));
			}
			newText = newText.length == 1 ? newText[0] : newText.join(" ");
			newText = newText.replace(/ ([\n\t\r]) /g, "$1");
			newText = this.useAliases(newText, multiAliases, files, false);
			return {text:newText, files};
		}

		useAliases (string, aliases, files, singleword) {
			for (let word in aliases) {
				let aliasdata = aliases[word];
				let escpAlias = aliasdata.regex ? word : BDFDB.regEscape(word);
				let result = true, replaced = false, tempstring1 = string, tempstring2 = "";
				let regstring = aliasdata.exact ? "^" + escpAlias + "$" : escpAlias;
				while (result != null) {
					result = new RegExp(regstring, (aliasdata.case ? "" : "i") + (aliasdata.exact ? "" : "g")).exec(tempstring1);
					if (result) {
						replaced = true;
						let replace = aliasdata.file ? "" : BDFDB.insertNRST(aliasdata.replace);
						if (result.length > 1) for (var i = 1; i < result.length; i++) replace = replace.replace(new RegExp("\\\\" + i + "|\\$" + i, "g"), result[i]);
						tempstring2 += tempstring1.slice(0, result.index + result[0].length).replace(result[0], replace);
						tempstring1 = tempstring1.slice(result.index + result[0].length);
						if (aliasdata.file && typeof aliasdata.filedata == "string") {
							var filedata = JSON.parse(aliasdata.filedata);
							files.push(new File([Buffer.from(filedata.data, "base64")], filedata.name, {type:filedata.type}));
						}
						if (aliasdata.regex && regstring.indexOf("^") == 0) result = null;
					}
					if (!result) tempstring2 += tempstring1;
				}
				if (replaced) {
					string = tempstring2;
					if (singleword) break;
				}
			}
			return string;
		}

		getSettingsPanel () {
			if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			var settings = BDFDB.getAllData(this, "settings");
			var settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
			for (let key in settings) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
			}
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Replace:</h3><input action="add" type="text" placeholder="Wordvalue" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} wordInputs" id="input-wordvalue" style="flex: 1 1 auto;"><button action="add" type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-add btn-addword" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">With:</h3><input action="add" type="text" placeholder="Replacevalue" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} wordInputs" id="input-replacevalue" style="flex: 1 1 auto;"><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} file-navigator" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div><input id="input-file" type="file" style="display:none!important;"></button></div>`;
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto; max-width: ${560 - (this.configs.length * 33)}px;">List of Chataliases:</h3><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifycenter + BDFDB.disCNS.alignend + BDFDB.disCN.nowrap}" style="flex: 1 1 auto; max-width: ${this.configs.length * 34}px;">`;
			for (let config of this.configs) {
				settingshtml += `<div class="${BDFDB.disCNS.margintop8 +  BDFDB.disCNS.tableheadersize + BDFDB.disCNS.size10 + BDFDB.disCNS.primary + BDFDB.disCN.weightbold}" style="flex: 1 1 auto; width: 34px !important; text-align: center;">${config.toUpperCase()}</div>`;
			}
			settingshtml += `</div></div><div class="DevilBro-settings-inner-list alias-list ${BDFDB.disCNS.gamesettings + BDFDB.disCN.marginbottom8}">`;
			for (let word in this.aliases) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><input type="text" word="${word}" action="edit" class="${BDFDB.disCNS.gamename + BDFDB.disCN.gamenameinput} word-name" value="${BDFDB.encodeToHTML(word)}"><input type="text" word="${word}" action="edit" class="${BDFDB.disCNS.gamename + BDFDB.disCN.gamenameinput} replace-name" value="${BDFDB.encodeToHTML(this.aliases[word].replace)}">`;
				for (let config of this.configs) {
					settingshtml += `<div class="${BDFDB.disCNS.checkboxcontainer + BDFDB.disCN.marginreset}" style="flex: 0 0 auto;"><label class="${BDFDB.disCN.checkboxwrapper}"><input word="${word}" config="${config}" type="checkbox" class="${BDFDB.disCNS.checkboxinputdefault + BDFDB.disCN.checkboxinput}"${this.aliases[word][config] ? " checked" : ""}><div class="${BDFDB.disCNS.checkbox + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.checkboxround}"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label></div>`;
				}
				settingshtml += `</div><div word="${word}" action="remove" class="${BDFDB.disCN.hovercardbutton} remove-word"></div></div>`;
			}
			settingshtml += `</div>`;
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Remove all added words.</h3><button action="removeall" type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} remove-all" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
			var infoHidden = BDFDB.loadData("hideInfo", this, "hideInfo");
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.cursorpointer + (infoHidden ? BDFDB.disCN.categorywrappercollapsed : BDFDB.disCN.categorywrapperdefault)} toggle-info" style="flex: 1 1 auto;"><svg class="${BDFDB.disCNS.categoryicontransition + BDFDB.disCNS.directionright + (infoHidden ? BDFDB.disCN.categoryiconcollapsed : BDFDB.disCN.categoryicondefault)}" width="12" height="12" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10"></path></svg><div class="${BDFDB.disCNS.categorycolortransition + BDFDB.disCNS.categoryoverflowellipsis + BDFDB.disCN.categorynamecollapsed}" style="flex: 1 1 auto;">Information</div></div>`;
			settingshtml += `<div class="DevilBro-settings-inner-list info-container" ${infoHidden ? "style='display:none;'" : ""}><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Case: Will replace words while comparing lowercase/uppercase. apple => apple, not APPLE or AppLe</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Not Case: Will replace words while ignoring lowercase/uppercase. apple => apple, APPLE and AppLe</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Exact: Will replace words that are exactly the replaceword. apple to pear => applepie stays applepie</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Not Exact: Will replace words anywhere they appear. apple to pear => applepieapple to pearpiepear</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Autoc: Will appear in the Autocomplete Menu (if enabled).</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Regex: Will treat the entered wordvalue as a regular expression. <a class="${BDFDB.disCNS.anchor + BDFDB.disCN.anchorunderlineonhover}" target="_blank" href="https://regexr.com/">Help</a></div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">File: If the replacevalue is a filepath it will try to upload the file located at the filepath.</div></div>`;
			settingshtml += `</div>`;

			let settingspanel = BDFDB.htmlToElement(settingshtml);

			BDFDB.initElements(settingspanel, this);

			BDFDB.addEventListener(this, settingspanel, "keypress", ".wordInputs", e => {if (e.which == 13) this.updateContainer(settingspanel, e.currentTarget);});
			BDFDB.addEventListener(this, settingspanel, "keyup", BDFDB.dotCN.gamenameinput, e => {this.updateWord(e.currentTarget);});
			BDFDB.addEventListener(this, settingspanel, "click", ".btn-addword, .remove-word, .remove-all", e => {this.updateContainer(settingspanel, e.currentTarget);});
			BDFDB.addEventListener(this, settingspanel, "click", BDFDB.dotCN.checkboxinput, e => {this.updateConfig(e.currentTarget);});
			BDFDB.addEventListener(this, settingspanel, "click", ".toggle-info", e => {this.toggleInfo(e.currentTarget);});
			return settingspanel;
		}

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				BDFDB.WebModules.forceAllUpdates(this);
			}
		}
	}
};
