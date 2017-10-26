//META{"name":"GoogleTranslateOption"}*//

class GoogleTranslateOption {
	constructor () {
		
		this.labels = {};
		
		this.messageContextObserver = new MutationObserver(() => {});

		this.messageContextEntryMarkup =
			`<div class="item-group">
				<div class="item googletranslateoption-item">
					<span>REPLACE_context_googletranslateoption_text</span>
					<div class="hint"></div>
				</div>
			</div>`;
	}
		
	getName () {return "GoogleTranslateOption";}

	getDescription () {return "Adds a Google Translate option to your context menu, which will open the selected text in Google Translate.";}

	getVersion () {return "1.0.0";}
	
	getAuthor () {return "DevilBro";}
	
	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
			
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
			
			setTimeout(() => {
				this.labels = this.setLabelsByLanguage();
				this.changeLanguageStrings();
			},5000);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.messageContextObserver.disconnect();
		}
	}
	
	// begin of own functions
	
	changeLanguageStrings () {
		this.messageContextEntryMarkup = 	this.messageContextEntryMarkup.replace("REPLACE_context_googletranslateoption_text", this.labels.context_googletranslateoption_text);
		
		BDfunctionsDevilBro.translateMessage(this.getName());
	}
	
	onContextMenu (context) {
		var groups = $(context).find(".item-group");
		for (let i = 0; i < groups.length; i++) {
			var group = groups[i];
			if (BDfunctionsDevilBro.getKeyInformation({"node":group, "key":"handleSearchWithGoogle"})) {
				var text = BDfunctionsDevilBro.getKeyInformation({"node":group, "key":"value"});
				if (text) {
					$(this.messageContextEntryMarkup).insertAfter(group)
						.on("click", ".googletranslateoption-item", () => {
							var language = BDfunctionsDevilBro.getDiscordLanguage();
							var langid = language.googleid ? language.googleid : language.id;
							var translateurl = "https://translate.google.com/#en/" + langid + "/" +  encodeURIComponent(text);
							window.open(translateurl, "_blank");
						});
				}
				break;
			}
		}
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "da": 	//danish
				return {
					context_googletranslateoption_text: 	"Søg oversættelse"
				};
			case "de": 	//german
				return {
					context_googletranslateoption_text: 	"Suche Übersetzung"
				};
			case "es": 	//spanish
				return {
					context_googletranslateoption_text: 	"Buscar traducción"
				};
			case "fr": 	//french
				return {
					context_googletranslateoption_text: 	"Rechercher une traduction"
				};
			case "it": 	//italian
				return {
					context_googletranslateoption_text: 	"Cerca la traduzione"
				};
			case "nl": 	//dutch
				return {
					context_googletranslateoption_text: 	"Zoek vertaling"
				};
			case "no": 	//norwegian
				return {
					context_googletranslateoption_text: 	"Søk oversettelse"
				};
			case "pl": 	//polish
				return {
					context_googletranslateoption_text: 	"Wyszukaj tłumaczenie"
				};
			case "pt": 	//portuguese (brazil)
				return {
					context_googletranslateoption_text: 	"Pesquisar tradução"
				};
			case "fi": 	//finnish
				return {
					context_googletranslateoption_text: 	"Etsi käännös"
				};
			case "sv": 	//swedish
				return {
					context_googletranslateoption_text: 	"Sök översättning"
				};
			case "tr": 	//turkish
				return {
					context_googletranslateoption_text: 	"Arama tercümesi"
				};
			case "cs": 	//czech
				return {
					context_googletranslateoption_text: 	"Hledat překlad"
				};
			case "bg": 	//bulgarian
				return {
					context_googletranslateoption_text: 	"Търсене на превод"
				};
			case "ru": 	//russian
				return {
					context_googletranslateoption_text: 	"Поиск перевода"
				};
			case "uk": 	//ukranian
				return {
					context_googletranslateoption_text: 	"Пошук перекладу"
				};
			case "ja": 	//japanese
				return {
					context_googletranslateoption_text: 	"翻訳の検索"
				};
			case "zh": 	//chinese (traditional)
				return {
					context_googletranslateoption_text: 	"搜索翻譯"
				};
			case "ko": 	//korean
				return {
					context_googletranslateoption_text: 	"검색 번역"
				};
			default: 	//default: english
				return {
					context_googletranslateoption_text: 	"Search translation"
				};
		}
	}
}
