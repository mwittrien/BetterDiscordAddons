//META{"name":"GoogleTranslateOption"}*//

class GoogleTranslateOption {
	constructor () {
		
		this.labels = {};
		
		this.languages;
		
		this.textareaObserver = new MutationObserver(() => {});
		this.messageContextObserver = new MutationObserver(() => {});
		
		this.doTranslate = false;
		this.translateMessage = false;

		this.messageContextEntryMarkup =
			`<div class="item-group">
				<div class="item googletranslateoption-item">
					<span>REPLACE_context_googletranslateoption_text</span>
					<div class="hint"></div>
				</div>
			</div>`;
			
		this.translateButtonMarkup = 
			`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="translate-button" width="22" height="30" fill="#FFFFFF">
				<path d="M 19.794, 3.299 H 9.765 L 8.797, 0 h -6.598 C 0.99, 0, 0, 0.99, 0, 2.199 V 16.495 c 0, 1.21, 0.99, 2.199, 2.199, 2.199 H 9.897 l 1.1, 3.299 H 19.794 c 1.21, 0, 2.199 -0.99, 2.199 -2.199 V 5.498 C 21.993, 4.289, 21.003, 3.299, 19.794, 3.299 z M 5.68, 13.839 c -2.48, 0 -4.492 -2.018 -4.492 -4.492 s 2.018 -4.492, 4.492 -4.492 c 1.144, 0, 2.183, 0.407, 3.008, 1.171 l 0.071, 0.071 l -1.342, 1.298 l -0.066 -0.06 c -0.313 -0.297 -0.858 -0.643 -1.671 -0.643 c -1.441, 0 -2.612, 1.193 -2.612, 2.661 c 0, 1.468, 1.171, 2.661, 2.612, 2.661 c 1.507, 0, 2.161 -0.962, 2.337 -1.606 h -2.43 v -1.704 h 4.344 l 0.016, 0.077 c 0.044, 0.231, 0.06, 0.434, 0.06, 0.665 C 10.001, 12.036, 8.225, 13.839, 5.68, 13.839 z M 11.739, 9.979 h 4.393 c 0, 0 -0.374, 1.446 -1.715, 3.008 c -0.588 -0.676 -0.995 -1.336 -1.254 -1.864 h -1.089 L 11.739, 9.979 z M 13.625, 13.839 l -0.588, 0.583 l -0.72 -2.452 C 12.685, 12.63, 13.13, 13.262, 13.625, 13.839 z M 20.893, 19.794 c 0, 0.605 -0.495, 1.1 -1.1, 1.1 H 12.096 l 2.199 -2.199 l -0.896 -3.041 l 1.012 -1.012 l 2.953, 2.953 l 0.803 -0.803 l -2.975 -2.953 c 0.99 -1.138, 1.759 -2.474, 2.106 -3.854 h 1.397 V 8.841 H 14.697 v -1.144 h -1.144 v 1.144 H 11.398 l -1.309 -4.443 H 19.794 c 0.605, 0, 1.1, 0.495, 1.1, 1.1 V 19.794 z"/>
			</svg>`;
			
			
		this.translatePopoutMarkup = 
			`<div class="popout popout-bottom-right no-arrow no-shadow popout-googletranslate DevilBro-modal" style="z-index: 1000; visibility: visible; transform: translateX(-100%) translateY(-100%) translateZ(0px);">
				<div class="themed-popout">
					<h3 class="titleDefault-1CWM9y title-3i-5G_ weightMedium-13x9Y8 size16-3IvaX_ flexChild-1KGW5q marginBottom8-1mABJ4 marginTop8-2gOa2N" style="flex: 1 1 auto;">Input Language:</h3>
					<div class="ui-form-item flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
						<div class="ui-select format-select-wrapper" style="flex: 1 1 auto;">
							<div class="Select Select--single has-value" type="input">
								<div class="Select-control">
									<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-value" style="flex: 1 1 auto;">
										<div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm" style="flex: 1 1 auto;"></div>
									</div>
									<span class="Select-arrow-zone">
										<span class="Select-arrow"></span>
									</span>
								</div>
							</div>
						</div>
					</div>
					<h3 class="titleDefault-1CWM9y title-3i-5G_ weightMedium-13x9Y8 size16-3IvaX_ flexChild-1KGW5q marginBottom8-1mABJ4" style="flex: 1 1 auto;">Output Language:</h3>
					<div class="ui-form-item flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
						<div class="ui-select format-select-wrapper" style="flex: 1 1 auto;">
							<div class="Select Select--single has-value" type="output">
								<div class="Select-control">
									<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-value" style="flex: 1 1 auto;">
										<div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm" style="flex: 1 1 auto;"></div>
									</div>
									<span class="Select-arrow-zone">
										<span class="Select-arrow"></span>
									</span>
								</div>
							</div>
						</div>
					</div>
					<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
						<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Translate</h3>
						<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU valueUnchecked-XR6AOk" style="flex: 0 0 auto;">
							<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm">
						</div>
					</div>
				</div>
			</div>`;
			
		this.css = `
			textarea {
				padding-right: 0 !important;
			}
			
			.translate-button {
				position: absolute;
				right: 46px;
				top: 11px;
				opacity: 0.2;
				transition: all 200ms ease;
			}
			
			.translate-button.active {
				fill: #F04747;
				opacity: 1;
			}

			.translate-button:hover {
				cursor: pointer;
				opacity: 1;
				transform:scale(1.1);
			}
			
			.popout.popout-googletranslate .themed-popout {
				padding: 0 10px;
				width: 300px;
			}
			
			.Select-menu-outer.GoogleTranslate {
				top: 0%;
				transform: translateY(-100%);
				border-radius: 4px 4px 0 0;
				margin-top: 1px;
			}`;
	}
		
	getName () {return "GoogleTranslateOption";}

	getDescription () {return "Adds a Google Translate option to your context menu, which shows a preview of the translated text and on click will open the selected text in Google Translate. Also adds a translation button to your textareas, which will automatically translate the text for you before it is being send.";}

	getVersion () {return "1.1.0";}
	
	getAuthor () {return "DevilBro";}
	
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
			
			this.messageContextObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.nodeType == 1 && node.className.includes("context-menu")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".app")) this.messageContextObserver.observe(document.querySelector(".app"), {childList: true});
			
			this.textareaObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".innerEnabled-gLHeOL, .innerEnabledNoAttach-36PpAk")) {
									this.addTranslationButton(node.querySelector("textarea"));
								}
							});
						}
					}
				);
			});
			if (document.querySelector("#app-mount")) this.textareaObserver.observe(document.querySelector("#app-mount"), {childList: true, subtree:true});
			
			document.querySelectorAll("textarea").forEach(textarea => {this.addTranslationButton(textarea);});
			
			this.languages = Object.assign({},BDfunctionsDevilBro.languages,{$Discord:{name:"Auto",id:"auto",integrated:false}});
			this.languages.Binary = {name:"Binary",id:"binary",integrated:false};
			
			if (!BDfunctionsDevilBro.loadData("input", this.getName(), "language")) {
				BDfunctionsDevilBro.saveData("input", Object.keys(this.languages)[0], this.getName(), "language");
			}
			if (!BDfunctionsDevilBro.loadData("output", this.getName(), "language")) {
				BDfunctionsDevilBro.saveData("output", "EnglishUS", this.getName(), "language");
			}
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.textareaObserver.disconnect();
			this.messageContextObserver.disconnect();
			
			$(".translate-button").remove();
			document.querySelectorAll(".innerEnabled-gLHeOL, .innerEnabledNoAttach-36PpAk").forEach(textareaWrap => {textareaWrap.style.paddingRight = "0px";});
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	// begin of own functions
	
	changeLanguageStrings () {
		this.messageContextEntryMarkup = this.messageContextEntryMarkup.replace("REPLACE_context_googletranslateoption_text", this.labels.context_googletranslateoption_text);
	}
	
	onContextMenu (context) {
		var groups = $(context).find(".item-group");
		for (let i = 0; i < groups.length; i++) {
			var group = groups[i];
			if (BDfunctionsDevilBro.getKeyInformation({"node":group, "key":"handleSearchWithGoogle"})) {
				var text = BDfunctionsDevilBro.getKeyInformation({"node":group, "key":"value"});
				if (text) {
					var input = this.languages[BDfunctionsDevilBro.loadData("input", this.getName(), "language")];
					var output = this.languages[BDfunctionsDevilBro.loadData("output", this.getName(), "language")];
					var translation = "";
					let request = require("request");
					request(this.getGoogleTranslateApiURL(input.id, output.id, text), (error, response, result) => {
						if (response) {
							JSON.parse(result)[0].forEach((array) => {translation += array[0];});
						}
					});
					$(this.messageContextEntryMarkup).insertAfter(group)
						.on("mouseenter", ".googletranslateoption-item", (e) => {
							var tooltiptext = `From ${input.name}: ${text}\nTo ${output.name}: ${translation}`;
							BDfunctionsDevilBro.createTooltip(tooltiptext, e.currentTarget, {type: "right"});
						})
						.on("click", ".googletranslateoption-item", (e) => {
							window.open(this.getGoogleTranslatePageURL(input.id, output.id, text), "_blank");
						});
				}
				break;
			}
		}
	}
	
	addTranslationButton (textarea, type) {
		if (!textarea) return;
		var textareaWrap = textarea.parentElement;
		if (textareaWrap && !textareaWrap.querySelector(".translate-button")) {
			var textareaInstance = BDfunctionsDevilBro.getOwnerInstance({"node":textarea, "props":["handlePaste","saveCurrentText"], "up":true});
			if (textareaInstance && textareaInstance.props && textareaInstance.props.type) {
				var button = $(this.translateButtonMarkup)[0];
				$(button).appendTo(textareaWrap)
					.on("click." + this.getName(), () => {
						this.openTranslatePopout(button);
					});
				button.classList.add(textareaInstance.props.type);
				button.classList.toggle("active", this.translateMessage);
				var sendButtonEnabled = BDfunctionsDevilBro.isPluginEnabled("SendButton");
				if (sendButtonEnabled) button.style.marginRight = "40px";
				textareaWrap.style.paddingRight = sendButtonEnabled ? "110px" : "70px";
				$(textarea)
					.off("input." + this.getName())
					.on("input." + this.getName(), () => {
						if (this.doTranslate) {
							this.doTranslate = false;
							var text = textarea.value;
							var input = this.languages[BDfunctionsDevilBro.loadData("input", this.getName(), "language")].id;
							var output = this.languages[BDfunctionsDevilBro.loadData("output", this.getName(), "language")].id;
							var translation = "";
							if (input == "binary" || output == "binary") {
								if (input == "binary" && output != "binary") 		translation = this.binary2string(text);
								else if (input != "binary" && output == "binary") 	translation = this.string2binary(text);
								else if (input == "binary" && output == "binary") 	translation = text;
							}
							else {
								var request = new XMLHttpRequest();
								request.open("GET", this.getGoogleTranslateApiURL(input, output, text), false);
								request.send(null);
								if (request.status === 200) {
									JSON.parse(request.response)[0].forEach((array) => {translation += array[0];});
								}
							}
							if (translation) {
								textarea.focus();
								textarea.selectionStart = 0;
								textarea.selectionEnd = text.length;
								document.execCommand("insertText", false, translation);
							}
						}
					})
					.off("keydown." + this.getName())
					.on("keydown." + this.getName(), e => {
						if (this.translateMessage && !e.shiftKey && e.which == 13 && !document.querySelector(".chat form .autocomplete-1TnWNR")) {
							this.doTranslate = true;
							$(textarea).trigger("input");
						}
					});
			}
		}
	}
	
	openTranslatePopout (button) {
		if (button.classList.contains("popout-open")) return;
		button.classList.add("popout-open");
		var popout = $(this.translatePopoutMarkup);
		popout
			.appendTo(".popouts")
			.css("left", $(button).offset().left + $(button).outerWidth()/2 + popout.outerWidth()/2 + "px")
			.css("top", $(button).offset().top - $(button).outerHeight()/2 + "px")
				.on("click", ".Select-control", (e) => {this.openDropdownMenu(popout, e);});
				
		popout.find(".Select").each((_,selectWrap) => {
			let language = BDfunctionsDevilBro.loadData(selectWrap.getAttribute("type"), this.getName(), "language");
			selectWrap.setAttribute("value", language);
			selectWrap.querySelector(".title-3I2bY1").innerText = this.languages[language].name;
		});
			
		var checkbox = popout.find(".checkbox-1KYsPm")[0];
		checkbox.checked = this.translateMessage;
		checkbox.parentElement.classList.toggle("valueChecked-3Bzkbm", checkbox.checked);
		checkbox.parentElement.classList.toggle("valueUnchecked-XR6AOk", !checkbox.checked);
		$(checkbox).on("click." + this.getName(), () => {
			checkbox.parentElement.classList.toggle("valueChecked-3Bzkbm", checkbox.checked);
			checkbox.parentElement.classList.toggle("valueUnchecked-XR6AOk", !checkbox.checked);
			button.classList.toggle("active", checkbox.checked);
			this.translateMessage = checkbox.checked;
		});
			
		$(document).on("mousedown.translatepopout" + this.getName(), (e) => {
			if (popout.has(e.target).length == 0) {
				$(document).off("mousedown.translatepopout" + this.getName());
				popout.remove();
				setTimeout(() => {button.classList.remove("popout-open");},300);
			}
		});
	}
	
	openDropdownMenu (popout, e) {
		var selectControl = e.currentTarget;
		var selectWrap = selectControl.parentElement;
		
		if (selectWrap.classList.contains("is-open")) return;
		
		selectWrap.classList.add("is-open");
		popout.css("overflow", "visible");
		
		var type = selectWrap.getAttribute("type");
		var selectMenu = this.createDropdownMenu(selectWrap.getAttribute("value"), type);
		selectWrap.appendChild(selectMenu);
		
		$(selectMenu).on("mousedown." + this.getName(), ".Select-option", (e2) => {
			var language = e2.currentTarget.getAttribute("value");
			selectWrap.setAttribute("value", language);
			selectControl.querySelector(".title-3I2bY1").innerText = this.languages[language].name;
			BDfunctionsDevilBro.saveData(type, language, this.getName(), "language");
		});
		$(document).on("mousedown.select" + this.getName(), (e2) => {
			if (e2.target.parentElement == selectMenu) return;
			$(document).off("mousedown.select" + this.getName());
			selectMenu.remove();
			popout.css("overflow", "auto");
			setTimeout(() => {selectWrap.classList.remove("is-open");},100);
		});
	}
	
	createDropdownMenu (choice, type) {
		var menuhtml = `<div class="Select-menu-outer GoogleTranslate"><div class="Select-menu">`;
		for (var language in this.languages) {
			if (type == "output" && language == "$Discord") continue;
			var isSelected = language == choice ? " is-selected" : "";
			menuhtml += `<div value="${language}" class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-option ${isSelected}" style="flex: 1 1 auto; display:flex;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm" style="flex: 1 1 42%;">${this.languages[language].name}</div></div>`
		}
		menuhtml += `</div></div>`;
		return $(menuhtml)[0];
	}
	
	string2binary (string) {
		var binary = "";
		for (var character of string) binary += parseInt(character.charCodeAt(0).toString(2)).toPrecision(8).split(".").reverse().join("").toString() + " ";
		return binary;
	}
	
	binary2string (binary) {
		var string = "";
		binary = binary.replace(new RegExp(" ", "g"), "");
		if (/^[0-1]*$/.test(binary)) {
			var eightdigits = "";
			var counter = 0;
			for (var digit of binary) {
				eightdigits += digit;
				counter++;
				if (counter > 7) {
					string += String.fromCharCode(parseInt(eightdigits,2).toString(10));
					eightdigits = "";
					counter = 0;
				}
			}
		}
		else {
			BDfunctionsDevilBro.showToast("Invalid binary format. Only use 0s and 1s.", {type:"error"});
		}
		return string;
	}
	
	getGoogleTranslateApiURL (input, output, text) {
		return "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + input + "&tl=" + output + "&dt=t&ie=UTF-8&oe=UTF-8&q=" + encodeURIComponent(text);
	}
	
	getGoogleTranslatePageURL (input, output, text) {
		return "https://translate.google.com/#" + input + "/" + output + "/" + encodeURIComponent(text);
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					context_googletranslateoption_text:	"Traži prijevod"
				};
			case "da":		//danish
				return {
					context_googletranslateoption_text:	"Søg oversættelse"
				};
			case "de":		//german
				return {
					context_googletranslateoption_text:	"Suche Übersetzung"
				};
			case "es":		//spanish
				return {
					context_googletranslateoption_text:	"Buscar traducción"
				};
			case "fr":		//french
				return {
					context_googletranslateoption_text:	"Rechercher une traduction"
				};
			case "it":		//italian
				return {
					context_googletranslateoption_text:	"Cerca la traduzione"
				};
			case "nl":		//dutch
				return {
					context_googletranslateoption_text:	"Zoek vertaling"
				};
			case "no":		//norwegian
				return {
					context_googletranslateoption_text:	"Søk oversettelse"
				};
			case "pl":		//polish
				return {
					context_googletranslateoption_text:	"Wyszukaj tłumaczenie"
				};
			case "pt":		//portuguese (brazil)
				return {
					context_googletranslateoption_text:	"Pesquisar tradução"
				};
			case "fi":		//finnish
				return {
					context_googletranslateoption_text:	"Etsi käännös"
				};
			case "sv":		//swedish
				return {
					context_googletranslateoption_text:	"Sök översättning"
				};
			case "tr":		//turkish
				return {
					context_googletranslateoption_text:	"Arama tercümesi"
				};
			case "cs":		//czech
				return {
					context_googletranslateoption_text:	"Hledat překlad"
				};
			case "bg":		//bulgarian
				return {
					context_googletranslateoption_text:	"Търсене на превод"
				};
			case "ru":		//russian
				return {
					context_googletranslateoption_text:	"Поиск перевода"
				};
			case "uk":		//ukrainian
				return {
					context_googletranslateoption_text:	"Пошук перекладу"
				};
			case "ja":		//japanese
				return {
					context_googletranslateoption_text:	"翻訳の検索"
				};
			case "zh":		//chinese (traditional)
				return {
					context_googletranslateoption_text:	"搜索翻譯"
				};
			case "ko":		//korean
				return {
					context_googletranslateoption_text:	"검색 번역"
				};
			default:		//default: english
				return {
					context_googletranslateoption_text:	"Search translation"
				};
		}
	}
}
