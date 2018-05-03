module.exports = (Plugin, Api, Vendor) => {
	if (typeof BDFDB !== "object") global.BDFDB = {$: Vendor.$, BDv2Api: Api};
	
	const {$} = Vendor;

	return class extends Plugin {
		initConstructor () {
			this.configstypes = ["case","exact","autoc","regex","file"];
			
			this.defaults = {
				settings: {
					addAutoComplete:	{value:true, 	description:"Add an Autocomplete-Menu for Non-Regex Aliases:"}
				}
			};
		}
		
		onstart () {
			var libraryScript = null;
			if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
				libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
				document.head.appendChild(libraryScript);
			}
			this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
			if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
			else libraryScript.addEventListener("load", () => {this.initialize();});
			return true;
		}

		initialize () {
			if (typeof BDFDB === "object") {
				BDFDB.loadMessage(this);

				this.UploadModule = BDFDB.WebModules.findByProperties(["instantBatchUpload"]);
				this.CurrentUserPerms = BDFDB.WebModules.findByProperties(["getChannelPermissions", "can"]);
				this.Permissions = BDFDB.WebModules.findByProperties(["Permissions", "ActivityTypes"]).Permissions;

				var observer = null;

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.tagName && node.querySelector(BDFDB.dotCNC.textareainnerenabled + BDFDB.dotCN.textareainnerenablednoattach)) {
										this.bindEventToTextArea(node.querySelector("textarea"));
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.appmount, {name:"textareaObserver",instance:observer}, {childList: true, subtree:true});

				// PATCH OLD DATA REMOVE SOON
				let aliases = BDFDB.loadAllData(this, "words");
				for (let alias in aliases) {
					aliases[alias].autoc = aliases[alias].autoc == undefined ? !aliases[alias].regex : aliases[alias].autoc;
				}
				BDFDB.saveAllData(aliases, this, "words");
				
				document.querySelectorAll("textarea").forEach(textarea => {this.bindEventToTextArea(textarea);});
				
				$(document).off("click." + this.name).on("click." + this.name, (e) => {
					if (!e.target.tagName === "TEXTAREA") $(".autocompleteAliases, .autocompleteAliasesRow").remove();
				});

				return true;
			}
			else {
				console.error(this.name + ": Fatal Error: Could not load BD functions!");
				return false;
			}
		}

		onStop () {
			if (typeof BDFDB === "object") {
				$(".autocompleteAliases, .autocompleteAliasesRow").remove();
				
				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}


		// begin of own functions

		updateSettings (settingspanel) {
			var settings = {};
			for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
				settings[input.value] = input.checked;
			}
			BDFDB.saveAllData(settings, this, "settings");
			
			document.querySelectorAll("textarea").forEach(textarea => {this.bindEventToTextArea(textarea);});
		}

		updateContainer (settingspanel, ele) {
			var update = false, wordvalue = null, replacevalue = null;
			var action = ele.getAttribute("action");
			var words = BDFDB.loadAllData(this, "words");

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
					words[wordvalue] = {
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
				BDFDB.saveAllData(words, this, "words");
				words = BDFDB.loadAllData(this, "words");

				var containerhtml = ``;
				for (let word in words) {
					containerhtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class=${BDFDB.disCN.hovercardinner}><input type="text" word="${word}" action="edit" class="${BDFDB.disCNS.gamename + BDFDB.disCN.gamenameinput} word-name" value="${BDFDB.encodeToHTML(word)}"><input type="text" word="${word}" action="edit" class="${BDFDB.disCNS.gamename + BDFDB.disCN.gamenameinput} replace-name" value="${BDFDB.encodeToHTML(words[word].replace)}">`;
					for (let config of this.configstypes) {
						containerhtml += `<div class="${BDFDB.disCNS.checkboxcontainer + BDFDB.disCN.marginreset}" style="flex: 0 0 auto;"><label class="${BDFDB.disCN.checkboxwrapper}"><input word="${word}" config="${config}" type="checkbox" class="${BDFDB.disCNS.checkboxinputdefault + BDFDB.disCN.checkboxinput}"${words[word][config] ? " checked" : ""}><div class="${BDFDB.disCNS.checkbox + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.checkboxround}"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label></div>`;
					}
					containerhtml += `</div><div word="${word}" action="remove" class="${BDFDB.disCN.hovercardbutton} remove-word"></div></div>`;
				}
				$(settingspanel).find(".alias-list").html(containerhtml);
				BDFDB.initElements(settingspanel);
			}
		}

		updateWord (ele) {
			clearTimeout(ele.updateTimeout);
			ele.updateTimeout = setTimeout(() => {
				var card = ele.parentElement.parentElement;
				var words = BDFDB.loadAllData(this, "words");
				var oldwordvalue = ele.getAttribute("word");
				if (oldwordvalue && words[oldwordvalue]) {
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
					words[newwordvalue] = words[oldwordvalue];
					words[newwordvalue].replace = newreplacevalue;
					if (newwordvalue != oldwordvalue) delete words[oldwordvalue];
					BDFDB.saveAllData(words, this, "words");
				}
			},500);
		}

		updateConfig (ele) {
			var words = BDFDB.loadAllData(this, "words");
			var wordvalue = ele.getAttribute("word");
			var config = ele.getAttribute("config");
			if (wordvalue && words[wordvalue] && config) {
				words[wordvalue][config] = ele.checked;
				BDFDB.saveAllData(words, this, "words");
			}
		}

		toggleInfo (settingspanel, ele) {
			ele.classList.toggle(BDFDB.disCN.categorywrappercollapsed);
			ele.classList.toggle(BDFDB.disCN.categorywrapperdefault);
			var svg = ele.querySelector(BDFDB.dotCN.categoryicontransition);
			svg.classList.toggle(BDFDB.disCN.closed);
			svg.classList.toggle(BDFDB.disCN.categoryiconcollapsed);
			svg.classList.toggle(BDFDB.disCN.categoryicondefault);

			var visible = $(settingspanel).find(".info-container").is(":visible");
			$(settingspanel).find(".info-container").toggle(!visible);
			BDFDB.saveData("hideInfo", visible, this, "hideInfo");
		}

		bindEventToTextArea (textarea) {
			if (!textarea) return;
			var channelObj = BDFDB.getSelectedChannel();
			var channel = channelObj ? channelObj.data : null;
			if (!channel) return;
			var settings = BDFDB.getAllData(this, "settings"); 
			$(textarea)
				.off("input." + this.name)
				.on("input." + this.name, () => {
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
				})
				.off("keydown." + this.name)
				.on("keydown." + this.name, e => {
					if (e.which == 9) {
						let selectedChatAlias = textarea.parentElement.querySelector(".autocompleteAliasesRow " + BDFDB.dotCN.autocompleteselected)
						if (selectedChatAlias) {
							e.preventDefault();
							e.stopPropagation();
							this.swapWordWithAlias(textarea);
						}
					}
					else if (!e.ctrlKey && e.which != 38 && e.which != 40) {
						if (!(e.which == 39 && textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length)) {
							$(".autocompleteAliases, .autocompleteAliasesRow").remove();
						}
					}
					
					if (textarea.value && !e.shiftKey && e.which == 13 && !textarea.parentElement.querySelector(BDFDB.dotCN.autocomplete)) {
						this.format = true;
						$(textarea).trigger("input");
					}
					else if (!e.ctrlKey && settings.addAutoComplete && textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length) {
						clearTimeout(textarea.chataliastimeout);
						textarea.chataliastimeout = setTimeout(() => {this.addAutoCompleteMenu(textarea);},100);
					}
				})
				.off("click." + this.name)
				.on("click." + this.name, e => {
					if (settings.addAutoComplete && textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length) {
						setImmediate(() => {this.addAutoCompleteMenu(textarea);});
					}
				});
		}
		
		addAutoCompleteMenu (textarea) {
			if (textarea.parentElement.querySelector(".autocompleteAliasesRow")) return;
			let words = textarea.value.split(" ");
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
				let aliases = BDFDB.loadAllData(this, "words"), matchedaliases = {};
				for (let alias in aliases) {
					let aliasdata = aliases[alias];
					if (!aliasdata.regex && aliasdata.autoc) {
						if (aliasdata.exact) {
							if (aliasdata.case && alias.indexOf(lastword) == 0) matchedaliases[alias] = aliasdata;
							else if (!aliasdata.case && alias.toLowerCase().indexOf(lastword.toLowerCase()) == 0) matchedaliases[alias] = aliasdata;
						}
						else {
							if (aliasdata.case && alias.indexOf(lastword) > -1) matchedaliases[alias] = aliasdata;
							else if (!aliasdata.case && alias.toLowerCase().indexOf(lastword.toLowerCase()) > -1) matchedaliases[alias] = aliasdata;
						}
					}
				}
				if (!BDFDB.isObjectEmpty(matchedaliases)) {
					let autocompletemenu = textarea.parentElement.querySelector(BDFDB.dotCNS.autocomplete + BDFDB.dotCN.autocompleteinner), amount = 15;
					if (!autocompletemenu) {
						autocompletemenu = $(`<div class="${BDFDB.disCNS.autocomplete + BDFDB.disCN.autocomplete2} autocompleteAliases"><div class="${BDFDB.disCN.autocompleteinner}"></div></div>`)[0];
						textarea.parentElement.appendChild(autocompletemenu);
						autocompletemenu = autocompletemenu.firstElementChild;
					}
					else {
						amount -= autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselectable).length;
					}
					
					$(autocompletemenu)
						.append(`<div class="${BDFDB.disCNS.autocompleterowvertical + BDFDB.disCN.autocompleterow} autocompleteAliasesRow"><div class="${BDFDB.disCN.autocompleteselector}"><div class="${BDFDB.disCNS.autocompletecontenttitle + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.weightsemibold}">Aliases: <strong class="lastword">${BDFDB.encodeToHTML(lastword)}</strong></div></div></div>`)
						.off("mouseenter." + this.name).on("mouseenter." + this.name, BDFDB.dotCN.autocompleteselectable, (e) => {
							autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselected).forEach(selected => {selected.classList.remove(BDFDB.disCN.autocompleteselected);});
							e.currentTarget.classList.add(BDFDB.disCN.autocompleteselected);
						});
						
					for (let alias in matchedaliases) {
						if (amount-- < 1) break;
						$(`<div class="${BDFDB.disCNS.autocompleterowvertical + BDFDB.disCN.autocompleterow} autocompleteAliasesRow"><div class="${BDFDB.disCNS.autocompleteselector + BDFDB.disCN.autocompleteselectable}"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.autocompletecontent}" style="flex: 1 1 auto;"><div class="${BDFDB.disCN.flexchild} aliasword" style="flex: 1 1 auto;">${BDFDB.encodeToHTML(alias)}</div><div class="${BDFDB.disCNS.autocompletedescription + BDFDB.disCN.flexchild}">${BDFDB.encodeToHTML(matchedaliases[alias].replace)}</div></div></div></div>`)
							.appendTo(autocompletemenu)
							.off("click." + this.name).on("click." + this.name, BDFDB.dotCN.autocompleteselectable, (e) => {
								this.swapWordWithAlias(textarea);
							});
					}
					if (!autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected)) {
						autocompletemenu.querySelector(".autocompleteAliasesRow " + BDFDB.dotCN.autocompleteselectable).classList.add(BDFDB.disCN.autocompleteselected);
					}
				}
			}
		}
		
		swapWordWithAlias (textarea) {
			let aliasword = textarea.parentElement.querySelector(".autocompleteAliasesRow " + BDFDB.dotCN.autocompleteselected + " .aliasword").innerText;
			let lastword = textarea.parentElement.querySelector(".autocompleteAliasesRow .lastword").innerText;
			if (aliasword && lastword) {
				$(".autocompleteAliases, .autocompleteAliasesRow").remove();
				textarea.focus();
				textarea.selectionStart = textarea.value.length - lastword.length;
				textarea.selectionEnd = textarea.value.length;
				document.execCommand("insertText", false, aliasword);
				textarea.selectionStart = textarea.value.length;
				textarea.selectionEnd = textarea.value.length;
			}
		}

		formatText (text) {
			var newText = [], files = [], wordAliases = {}, multiAliases = {}, aliases = BDFDB.loadAllData(this, "words");
			for (let alias in aliases) {
				if (!aliases[alias].regex && alias.indexOf(" ") == -1) wordAliases[alias] = aliases[alias];
				else multiAliases[alias] = aliases[alias];
			}
			for (let word of text.trim().split(" ")) {
				newText.push(this.useAliases(word, wordAliases, files, true));
			}
			newText = newText.length == 1 ? newText[0] : newText.join(" ");
			newText = this.useAliases(newText, multiAliases, files, false);
			return {text:newText, files};
		}

		useAliases (string, aliases, files, singleword) {
			for (let alias in aliases) {
				let aliasdata = aliases[alias];
				let escpAlias = aliasdata.regex ? alias : BDFDB.regEscape(alias);
				let result = true, replaced = false, tempstring1 = string, tempstring2 = "";
				let regstring = aliasdata.exact ? "^" + escpAlias + "$" : escpAlias;
				while (result != null) {
					result = new RegExp(regstring, (aliasdata.case ? "" : "i") + (aliasdata.exact ? "" : "g")).exec(tempstring1);
					if (result) {
						replaced = true;
						let replace = aliasdata.file ? "" : BDFDB.insertNRST(aliasdata.replace);
						if (result.length > 1) for (var i = 1; i < result.length; i++) replace = replace.replace(new RegExp("\\\\" + i, "g"), result[i]);
						tempstring2 += tempstring1.slice(0, result.index + result[0].length).replace(result[0], replace);
						tempstring1 = tempstring1.slice(result.index + result[0].length);
						if (aliasdata.file && typeof aliasdata.filedata == "string") {
							var filedata = JSON.parse(aliasdata.filedata);
							files.push(new File([Buffer.from(filedata.data, "base64")], filedata.name, {type:filedata.type}));
						}
						if (aliasdata.regex && regstring.indexOf("^") == 0) result = null;
					}
					if (!result) {
						tempstring2 += tempstring1;
					}
				}
				if (replaced) {
					string = tempstring2;
					if (singleword) break;
				}
			}
			return string;
		}

		replaceWord (string, regex) {
			let result = regex.exec(string), rest = "";
			if (result) {
				rest = string.slice(a.indexOf(b)+b.length);
			}
		}
		
		getSettingsPanel () {
			var settings = BDFDB.getAllData(this, "settings"); 
			var words = BDFDB.loadAllData(this, "words");
			var settingshtml = `<div class="DevilBro-settings ${this.name}-settings">`;
			for (let key in settings) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
			}
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Replace:</h3><input action="add" type="text" placeholder="Wordvalue" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} wordInputs" id="input-wordvalue" style="flex: 1 1 auto;"><button action="add" type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-add btn-addword" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">With:</h3><input action="add" type="text" placeholder="Replacevalue" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} wordInputs" id="input-replacevalue" style="flex: 1 1 auto;"><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} file-navigator" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div><input id="input-file" type="file" style="display:none!important;"></button></div>`;
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto; max-width: ${556 - (this.configstypes.length * 33)}px;">List of Chataliases:</h3><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifycenter + BDFDB.disCNS.alignend + BDFDB.disCN.nowrap}" style="flex: 1 1 auto; max-width: ${this.configstypes.length * 34}px;">`;
			for (let config of this.configstypes) {
				settingshtml += `<div class="${BDFDB.disCNS.margintop8 +  BDFDB.disCNS.tableheadersize + BDFDB.disCNS.size10 + BDFDB.disCNS.primary + BDFDB.disCN.weightbold}" style="flex: 1 1 auto; width: 34px !important; text-align: center;">${config.toUpperCase()}</div>`;
			}
			settingshtml += `</div></div><div class="DevilBro-settings-inner-list alias-list ${BDFDB.disCNS.gamesettings + BDFDB.disCN.marginbottom8}">`;
			for (let word in words) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class=${BDFDB.disCN.hovercardinner}><input type="text" word="${word}" action="edit" class="${BDFDB.disCNS.gamename + BDFDB.disCN.gamenameinput} word-name" value="${BDFDB.encodeToHTML(word)}"><input type="text" word="${word}" action="edit" class="${BDFDB.disCNS.gamename + BDFDB.disCN.gamenameinput} replace-name" value="${BDFDB.encodeToHTML(words[word].replace)}">`;
				for (let config of this.configstypes) {
					settingshtml += `<div class="${BDFDB.disCNS.checkboxcontainer + BDFDB.disCN.marginreset}" style="flex: 0 0 auto;"><label class="${BDFDB.disCN.checkboxwrapper}"><input word="${word}" config="${config}" type="checkbox" class="${BDFDB.disCNS.checkboxinputdefault + BDFDB.disCN.checkboxinput}"${words[word][config] ? " checked" : ""}><div class="${BDFDB.disCNS.checkbox + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.checkboxround}"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label></div>`;
					console.log();
				}
				settingshtml += `</div><div word="${word}" action="remove" class="${BDFDB.disCN.hovercardbutton} remove-word"></div></div>`;
			}
			settingshtml += `</div>`;
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Remove all added words.</h3><button action="removeall" type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} remove-all" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
			var infoHidden = BDFDB.loadData("hideInfo", this, "hideInfo");
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.cursorpointer} ${infoHidden ? BDFDB.disCN.categorywrappercollapsed : BDFDB.disCN.categorywrapperdefault} toggle-info" style="flex: 1 1 auto;"><svg class="${BDFDB.disCNS.categoryicontransition + (infoHidden ? BDFDB.disCNS.closed + BDFDB.disCN.categoryiconcollapsed : BDFDB.disCN.categoryicondefault)}" width="12" height="12" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10"></path></svg><div class="${BDFDB.disCNS.categorycolortransition + BDFDB.disCNS.overflowellipsis + BDFDB.disCN.categorynamecollapsed}" style="flex: 1 1 auto;">Information</div></div>`;
			settingshtml += `<div class="DevilBro-settings-inner-list info-container" ${infoHidden ? "style='display:none;'" : ""}><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Case: Will replace words while comparing lowercase/uppercase. apple => apple, not APPLE or AppLe</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Not Case: Will replace words while ignoring lowercase/uppercase. apple => apple, APPLE and AppLe</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Exact: Will replace words that are exactly the replaceword. apple to pear => applepie stays applepie</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Not Exact: Will replace words anywhere they appear. apple to pear => applepieapple to pearpiepear</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Autoc: Will appear in the Autocomplete Menu (if enabled).</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Regex: Will treat the entered wordvalue as a regular expression. <a target="_blank" href="https://regexr.com/">Help</a></div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">File: If the replacevalue is a filepath it will try to upload the file located at the filepath.</div></div>`;
			settingshtml += `</div>`;

			var settingspanel = $(settingshtml)[0];

			$(settingspanel)
				.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);})
				.on("keypress", ".wordInputs", (e) => {if (e.which == 13) this.updateContainer(settingspanel, e.currentTarget);})
				.on("keyup", BDFDB.dotCN.gamenameinput, (e) => {this.updateWord(e.currentTarget);})
				.on("click", ".btn-addword, .remove-word, .remove-all", (e) => {this.updateContainer(settingspanel, e.currentTarget);})
				.on("click", BDFDB.dotCN.checkboxinput, (e) => {this.updateConfig(e.currentTarget);})
				.on("click", ".toggle-info", (e) => {this.toggleInfo(settingspanel, e.currentTarget);});
			return settingspanel;
		}
		
		onSettingsClosed () {
			document.querySelectorAll("textarea").forEach(textarea => {this.bindEventToTextArea(textarea);});
		}
	}
};
