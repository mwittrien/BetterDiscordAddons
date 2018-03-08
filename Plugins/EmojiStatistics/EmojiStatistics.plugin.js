//META{"name":"EmojiStatistics"}*//

class EmojiStatistics {
	constructor () {
		this.labels = {};
		
		this.css = `
			.emojistatistics-modal .titles {
				height: 20px;
			}
			
			.emojistatistics-modal .emojiserver-entry {
				height: 50px;
				padding-top: 5px;
				padding-bottom: 5px;
			}
			
			.emojistatistics-modal .emojiserver-entry .modal-emojiserver-icon {
				background-color: #484B51;
				background-size: cover;
				border-radius: 25px;
				color: #b9bbbe;
				display: inline-block;
				font-size: 16px;
				font-weight: 600;
				height: 35px;
				letter-spacing: .5px;
				padding-top: 15px;
				text-align: center;
				width: 50px;
			}
			
			.emojistatistics-modal .titles-entry label,
			.emojistatistics-modal .emojiserver-entry label {
				color: #b9bbbe;
				display: inline-block;
				flex: 1;
				font-size: 12px;
				font-weight: 600;
				letter-spacing: .5px;
				margin-left: 10px;
				margin-top: 20px;
				overflow: hidden;
				vertical-align: top;
				text-transform: uppercase;
			}
			
			.emojistatistics-modal .emojiserver-entry label {
				height: 12px;
				overflow: hidden;
			}
			
			.emojistatistics-modal .titles-entry label {
				margin-top: 0px;
			}
			.emojistatistics-modal .titles-entry .modal-titlesicon-label {
				margin-left: 0px;
				text-align: center;
				width: 50px;
			}
			
			.emojistatistics-modal .titles-entry .modal-titlesservername-label,
			.emojistatistics-modal .emojiserver-entry .modal-emojiservername-label {
				width: 300px;
			}
			
			.emojistatistics-modal .titles-entry .modal-titlestotal-label,
			.emojistatistics-modal .titles-entry .modal-titlesglobal-label,
			.emojistatistics-modal .titles-entry .modal-titleslocal-label,
			.emojistatistics-modal .titles-entry .modal-titlesreplicate-label {
				cursor: pointer;
			}
			
			.emojistatistics-modal .titles-entry .modal-titlestotal-label,
			.emojistatistics-modal .titles-entry .modal-titlesglobal-label,
			.emojistatistics-modal .titles-entry .modal-titleslocal-label,
			.emojistatistics-modal .titles-entry .modal-titlesreplicate-label,
			.emojistatistics-modal .emojiserver-entry .modal-emojitotal-label,
			.emojistatistics-modal .emojiserver-entry .modal-emojiglobal-label,
			.emojistatistics-modal .emojiserver-entry .modal-emojilocal-label,
			.emojistatistics-modal .emojiserver-entry .modal-emojireplicate-label {
				text-align: center;
				width: 82px;
			}
			
			.emojistatistics-button {
				background-image: url("/assets/f24711dae4f6d6b28335e866a93e9d9b.png");
				background-position: -770px -374px;
				background-size: 924px 704px;
				height: 22px;
				margin-right: 10px;
				width: 22px;
			}`;
			
		this.emojiInformationModalMarkup =
			`<span class="emojistatistics-modal DevilBro-modal">
				<div class="backdrop-2ohBEd"></div>
				<div class="modal-2LIEKY">
					<div class="inner-1_1f7b">
						<div class="modal-3HOjGZ sizeLarge-1AHXtx">
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
								<div class="flexChild-1KGW5q" style="flex: 1 1 auto;">
									<h4 class="h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl">REPLACE_modal_header_text</h4>
									<div class="guildName-1u0hy7 small-3-03j1 size12-1IGJl9 height16-1qXrGy primary-2giqSn"></div>
								</div>
								<svg class="btn-cancel close-3ejNTg flexChild-1KGW5q" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
									<g fill="none" fill-rule="evenodd">
										<path d="M0 0h12v12H0"></path>
										<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
									</g>
								</svg>
							</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO inner-tqJwAU titles" style="flex: 0 0 auto;"></div>
							<div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW">
								<div class="scroller-fzNley inner-tqJwAU entries"></div>
							</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw">
								<button type="button" class="btn-save button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u">
									<div class="contents-4L4hQM">REPLACE_btn_ok_text</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;

		this.emojiserverTitlesMarkup =
			`<div class="titles-entry">
				<label class="modal-titlesicon-label" for="modal-text">REPLACE_modal_titlesicon-label</label>
				<label class="modal-titlesservername-label" for="modal-text">REPLACE_modal_titlesservername_text</label>
				<label class="modal-titlestotal-label" for="modal-text">REPLACE_modal_titlestotal_text</label>
				<label class="modal-titlesglobal-label" for="modal-text">REPLACE_modal_titlesglobal_text</label>
				<label class="modal-titleslocal-label" for="modal-text">REPLACE_modal_titleslocal_text</label>
				<label class="modal-titlesreplicate-label" for="modal-text">REPLACE_modal_titlesreplicate_text</label>
			</div>`;

		this.emojiserverEntryMarkup =
			`<div class="emojiserver-entry">
				<div class="modal-emojiserver-icon"></div>
				<label class="modal-emojiservername-label" for="modal-text">modal-emojiservername-label</label>
				<label class="modal-emojitotal-label" for="modal-text">modal-emojitotal-label</label>
				<label class="modal-emojiglobal-label" for="modal-text">modal-emojiglobal-label</label>
				<label class="modal-emojilocal-label" for="modal-text">modal-emojilocal-label</label>
				<label class="modal-emojireplicate-label" for="modal-text">modal-emojireplicate-label</label>
			</div>`;
			
		this.dividerMarkup = `<div class="divider-1G01Z9 dividerDefault-77PXsz"></div>`;
			
		this.emojiButtonMarkup = `<div class="emojistatistics-button"></div>`;
			
		this.defaults = {
			settings: {
				enableEmojiHovering:			{value:true, 	description:"Show Information about Emojis on hover over an Emoji in the Emojipicker."},
				enableEmojiStatisticsButton:	{value:true, 	description:"Add a Button in the Emojipicker to open the Statistics Overview."}
			}
		};
	}

	getName () {return "EmojiStatistics";}

	getDescription () {return "Adds some helpful options to show you more information about emojis and emojiservers.";}

	getVersion () {return "2.7.1";}

	getAuthor () {return "DevilBro";}

	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settings = BDfunctionsDevilBro.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);});
			
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
								if (node && node.tagName && node.querySelector(".emoji-picker, .emojiPicker-3g68GS")) {
									this.loadEmojiList();
									if (!node.querySelector(".emojistatistics-button") && BDfunctionsDevilBro.getData("enableEmojiStatisticsButton", this, "settings")) {
										this.addEmojiInformationButton(node);
									}
									if (BDfunctionsDevilBro.getData("enableEmojiHovering", this, "settings")) {
										this.hoverEmoji(node);
									}
								}
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node.querySelector(".emoji-picker, .emojiPicker-3g68GS")) {
									$(".tooltips").find(".emoji-tooltip").remove();
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".popouts", {name:"emojiPickerObserver",instance:observer}, {childList: true});
			
			this.GuildEmojis = BDfunctionsDevilBro.WebModules.findByProperties(["getGuildEmoji", "getDisambiguatedEmojiContext"]);
					}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(".checkbox-1KYsPm")) {
			settings[input.value] = input.checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, this, "settings");
	}
	
	changeLanguageStrings () {
		this.emojiInformationModalMarkup = 	this.emojiInformationModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.emojiInformationModalMarkup = 	this.emojiInformationModalMarkup.replace("REPLACE_btn_ok_text", this.labels.btn_ok_text);
		this.emojiInformationModalMarkup = 	this.emojiInformationModalMarkup.replace("REPLACE_btn_all_text", this.labels.btn_all_text);
		
		this.emojiserverTitlesMarkup = 		this.emojiserverTitlesMarkup.replace("REPLACE_modal_titlesicon-label", this.labels.modal_titlesicon_text);
		this.emojiserverTitlesMarkup = 		this.emojiserverTitlesMarkup.replace("REPLACE_modal_titlesservername_text", this.labels.modal_titlesservername_text);
		this.emojiserverTitlesMarkup = 		this.emojiserverTitlesMarkup.replace("REPLACE_modal_titlestotal_text", this.labels.modal_titlestotal_text);
		this.emojiserverTitlesMarkup = 		this.emojiserverTitlesMarkup.replace("REPLACE_modal_titlesglobal_text", this.labels.modal_titlesglobal_text);
		this.emojiserverTitlesMarkup = 		this.emojiserverTitlesMarkup.replace("REPLACE_modal_titleslocal_text", this.labels.modal_titleslocal_text);
		this.emojiserverTitlesMarkup = 		this.emojiserverTitlesMarkup.replace("REPLACE_modal_titlesreplicate_text", this.labels.modal_titlesreplicate_text);
	}
	
	loadEmojiList () {
		this.emojiReplicaList = {};
		this.emojiToServerList = {};
		for (let serverObj of BDfunctionsDevilBro.readServerList()) {
			for (let emoji of this.GuildEmojis.getGuildEmoji(serverObj.id)) {
				this.emojiToServerList[emoji.url] = {emoji:emoji.allNamesString, server:serverObj.name};
				if (emoji.managed) {
					if (this.emojiReplicaList[emoji.name] != undefined) {
						this.emojiReplicaList[emoji.name] = true;
					}
					else {
						this.emojiReplicaList[emoji.name] = false;
					}
				}
			}
		}
	}
	
	hoverEmoji (picker) {
		$(picker)
			.off("mouseenter." + this.getName())
			.on("mouseenter." + this.getName(), ".emoji-item, .emojiItem-3l4Fa9", (e) => {
				var data = this.emojiToServerList[$(e.target).css("background-image").replace("url(\"","").replace("\")","")];
				if (data) {
					var text = `${BDfunctionsDevilBro.encodeToHTML(data.emoji)}\n${BDfunctionsDevilBro.encodeToHTML(data.server)}`;
					BDfunctionsDevilBro.createTooltip(text, e.target, {type:"right",selector:"emoji-tooltip",css:`.emoji-tooltip{z-index:30000;}`});
				}
			});
	}
	
	addEmojiInformationButton (node) {
		$(node).find(".header, .header-27dQ-e")
			.append(this.emojiButtonMarkup)
			.off("click." + this.getName())
			.on("click." + this.getName(), ".emojistatistics-button", () => {
				$(node).hide();
				this.showEmojiInformationModal();
			});
	}
	
	showEmojiInformationModal () {
		var emojiInformationModal = $(this.emojiInformationModalMarkup);
		BDfunctionsDevilBro.appendModal(emojiInformationModal);
		
		var entries = [], index = 0;
		for (let serverObj of BDfunctionsDevilBro.readServerList()) {
			let amountGlobal = 0, amountLocal = 0, amountReplicate = 0;
			for (let emoji of this.GuildEmojis.getGuildEmoji(serverObj.id)) {
				if (emoji.managed) {
					amountGlobal++;
					if (this.emojiReplicaList[emoji.name]) amountReplicate++;
				}
				else {
					amountLocal++;
				}
			}
			var entry = $(this.emojiserverEntryMarkup);
			if (serverObj.icon) {
				entry.find(".modal-emojiserver-icon").css("background-image", "url('https://cdn.discordapp.com/icons/" + serverObj.id + "/" + serverObj.icon + ".png')");
			}
			else {
				entry.find(".modal-emojiserver-icon").text(serverObj.div.querySelector("a").innerText);
			}
			entry.find(".modal-emojiservername-label").text(serverObj.name);
			entry.find(".modal-emojitotal-label").text(amountGlobal+amountLocal);
			entry.find(".modal-emojiglobal-label").text(amountGlobal);
			entry.find(".modal-emojilocal-label").text(amountLocal);
			entry.find(".modal-emojireplicate-label").text(amountReplicate);
			entries.push({entry:entry, index:index++, name:serverObj.name, total:amountGlobal+amountLocal, global:amountGlobal, local:amountLocal, copies:amountReplicate});
		}
		
		var titleentry = $(this.emojiserverTitlesMarkup)
			.appendTo(".emojistatistics-modal .titles")
			.on("click", ".modal-titlesservername-label,.modal-titlestotal-label,.modal-titlesglobal-label,.modal-titleslocal-label,.modal-titlesreplicate-label", (e2) => {
				var oldTitle = e2.target.innerText;
				
				var reverse = oldTitle.indexOf("▼") < 0 ? false : true;
				
				titleentry.find(".modal-titlesservername-label").text(this.labels.modal_titlesservername_text);
				titleentry.find(".modal-titlestotal-label").text(this.labels.modal_titlestotal_text);
				titleentry.find(".modal-titlesglobal-label").text(this.labels.modal_titlesglobal_text);
				titleentry.find(".modal-titleslocal-label").text(this.labels.modal_titleslocal_text);
				titleentry.find(".modal-titlesreplicate-label").text(this.labels.modal_titlesreplicate_text);
				
				var sortKey = "index", title = "";
				if (oldTitle.indexOf("▲") < 0) {
					switch (e2.target.className) {
						case "modal-titlesservername-label": 
							title = this.labels.modal_titlesservername_text;
							sortKey = "name";
							break;
						case "modal-titlestotal-label": 
							title = this.labels.modal_titlestotal_text;
							sortKey = "total";
							break;
						case "modal-titlesglobal-label": 
							title = this.labels.modal_titlesglobal_text;
							sortKey = "global";
							break;
						case "modal-titleslocal-label": 
							title = this.labels.modal_titleslocal_text;
							sortKey = "local";
							break;
						case "modal-titlesreplicate-label": 
							title = this.labels.modal_titlesreplicate_text;
							sortKey = "copies";
							break;
					}
					e2.target.innerText = oldTitle.indexOf("▼") < 0 ? title + "▼" : title + "▲";
				}
				
				var sortedEntries = BDfunctionsDevilBro.sortArrayByKey(entries, sortKey);
				if (reverse) sortedEntries.reverse();
				
				this.updateAllEntries(emojiInformationModal, sortedEntries);
			});
				
		this.updateAllEntries(emojiInformationModal, entries);
	}
	
	updateAllEntries (modal, entries) {
		var container = modal.find(".entries");
		container.children().remove();
		for (let i = 0; entries.length > i; i++) {
			if (i > 0) container.append(this.dividerMarkup);
			container.append(entries[i].entry);
		}
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					modal_header_text:						"Statistike o emojima",
					modal_titlesicon_text:					"Ikona",
					modal_titlesservername_text:			"Naziv poslužitelja",
					modal_titlestotal_text:					"Cjelokupni:",
					modal_titlesglobal_text:				"Globalno:",
					modal_titleslocal_text:					"Kokalne:",
					modal_titlesreplicate_text:				"Kopije:",
					btn_ok_text:							"OK"
				};
			case "da":		//danish
				return {
					modal_header_text:						"Statistikker af emojis",
					modal_titlesicon_text:					"Icon",
					modal_titlesservername_text:			"Servernavn",
					modal_titlestotal_text:					"Total:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Lokal:",
					modal_titlesreplicate_text:				"Copies:",
					btn_ok_text:							"OK"
				};
			case "de":		//german
				return {
					modal_header_text:						"Statistiken über Emojis",
					modal_titlesicon_text:					"Icon",
					modal_titlesservername_text:			"Servername",
					modal_titlestotal_text:					"Gesamt:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Lokal:",
					modal_titlesreplicate_text:				"Kopien:",
					btn_ok_text:							"OK"
				};
			case "es":		//spanish
				return {
					modal_header_text:						"Estadísticas de emojis",
					modal_titlesicon_text:					"Icono",
					modal_titlesservername_text:			"Nombre del servidor",
					modal_titlestotal_text:					"Total:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Local:",
					modal_titlesreplicate_text:				"Copias:",
					btn_ok_text:							"OK"
				};
			case "fr":		//french
				return {
					modal_header_text:						"Statistiques des emojis",
					modal_titlesicon_text:					"Icône",
					modal_titlesservername_text:			"Nom du serveur",
					modal_titlestotal_text:					"Total:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Local:",
					modal_titlesreplicate_text:				"Copies:",
					btn_ok_text:							"OK"
				};
			case "it":		//italian
				return {
					modal_header_text:						"Statistiche di emojis",
					modal_titlesicon_text:					"Icona",
					modal_titlesservername_text:			"Nome del server",
					modal_titlestotal_text:					"Totale:",
					modal_titlesglobal_text:				"Globale:",
					modal_titleslocal_text:					"Locale:",
					modal_titlesreplicate_text:				"Copie:",
					btn_ok_text:							"OK"
				};
			case "nl":		//dutch
				return {
					modal_header_text:						"Statistieken van emojis",
					modal_titlesicon_text:					"Icoon",
					modal_titlesservername_text:			"Servernaam",
					modal_titlestotal_text:					"Totaal:",
					modal_titlesglobal_text:				"Globaal:",
					modal_titleslocal_text:					"Lokaal:",
					modal_titlesreplicate_text:				"Kopieën:",
					btn_ok_text:							"OK"
				};
			case "no":		//norwegian
				return {
					modal_header_text:						"Statistikk av emojis",
					modal_titlesicon_text:					"Ikon",
					modal_titlesservername_text:			"Servernavn",
					modal_titlestotal_text:					"Total:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Lokal:",
					modal_titlesreplicate_text:				"Kopier:",
					btn_ok_text:							"OK"
				};
			case "pl":		//polish
				return {
					modal_header_text:						"Statystyki emoji",
					modal_titlesicon_text:					"Ikona",
					modal_titlesservername_text:			"Nazwa",
					modal_titlestotal_text:					"Całkowity:",
					modal_titlesglobal_text:				"Światowy:",
					modal_titleslocal_text:					"Lokalny:",
					modal_titlesreplicate_text:				"Kopie:",
					btn_ok_text:							"OK"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					modal_header_text:						"Estatísticas de emojis",
					modal_titlesicon_text:					"Ícone",
					modal_titlesservername_text:			"Nome do servidor",
					modal_titlestotal_text:					"Total:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Local:",
					modal_titlesreplicate_text:				"Cópias:",
					btn_ok_text:							"OK"
				};
			case "fi":		//finnish
				return {
					modal_header_text:						"Tilastot emojista",
					modal_titlesicon_text:					"Ikoni",
					modal_titlesservername_text:			"Palvelimen nimi",
					modal_titlestotal_text:					"Koko:",
					modal_titlesglobal_text:				"Globaali:",
					modal_titleslocal_text:					"Paikallinen:",
					modal_titlesreplicate_text:				"Kopiot:",
					btn_ok_text:							"OK"
				};
			case "sv":		//swedish
				return {
					modal_header_text:						"Statistik för emojis",
					modal_titlesicon_text:					"Ikon",
					modal_titlesservername_text:			"Servernamn",
					modal_titlestotal_text:					"Total:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Lokal:",
					modal_titlesreplicate_text:				"Kopior:",
					btn_ok_text:							"OK"
				};
			case "tr":		//turkish
				return {
					modal_header_text:						"Emojis istatistikleri",
					modal_titlesicon_text:					"Icon",
					modal_titlesservername_text:			"Sunucuadı",
					modal_titlestotal_text:					"Toplam:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Yerel:",
					modal_titlesreplicate_text:				"Kopya:",
					btn_ok_text:							"Okey"
				};
			case "cs":		//czech
				return {
					modal_header_text:						"Statistiky emojis",
					modal_titlesicon_text:					"Ikona",
					modal_titlesservername_text:			"Název serveru",
					modal_titlestotal_text:					"Celkový:",
					modal_titlesglobal_text:				"Globální:",
					modal_titleslocal_text:					"Místní:",
					modal_titlesreplicate_text:				"Kopie:",
					btn_ok_text:							"OK"
				};
			case "bg":		//bulgarian
				return {
					modal_header_text:						"Статистика на емотис",
					modal_titlesicon_text:					"Икона",
					modal_titlesservername_text:			"Име на сървъра",
					modal_titlestotal_text:					"Oбщо:",
					modal_titlesglobal_text:				"Cветовен:",
					modal_titleslocal_text:					"Mестен:",
					modal_titlesreplicate_text:				"Копия:",
					btn_ok_text:							"Добре"
				};
			case "ru":		//russian
				return {
					modal_header_text:						"Статистика emojis",
					modal_titlesicon_text:					"Значок",
					modal_titlesservername_text:			"Имя сервера",
					modal_titlestotal_text:					"Всего:",
					modal_titlesglobal_text:				"Mировой:",
					modal_titleslocal_text:					"Местный:",
					modal_titlesreplicate_text:				"Копии:",
					btn_ok_text:							"ОК"
				};
			case "uk":		//ukrainian
				return {
					modal_header_text:						"Статистика емідій",
					modal_titlesicon_text:					"Ікона",
					modal_titlesservername_text:			"Ім'я сервера",
					modal_titlestotal_text:					"Всього:",
					modal_titlesglobal_text:				"Cвітовий:",
					modal_titleslocal_text:					"Місцевий:",
					modal_titlesreplicate_text:				"Копії:",
					btn_ok_text:							"Добре"
				};
			case "ja":		//japanese
				return {
					modal_header_text:						"エモジスの統計",
					modal_titlesicon_text:					"アイコン",
					modal_titlesservername_text:			"サーバーの名前",
					modal_titlestotal_text:					"合計:",
					modal_titlesglobal_text:				"グローバル:",
					modal_titleslocal_text:					"地元:",
					modal_titlesreplicate_text:				"コピー:",
					btn_ok_text:							"はい"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					modal_header_text:						"表情統計",
					modal_titlesicon_text:					"圖標",
					modal_titlesservername_text:			"服務器名稱",
					modal_titlestotal_text:					"總:",
					modal_titlesglobal_text:				"全球:",
					modal_titleslocal_text:					"本地:",
					modal_titlesreplicate_text:				"副本:",
					btn_ok_text:							"好"
				};
			case "ko":		//korean
				return {
					modal_header_text:						"그림 이모티콘의 통계",
					modal_titlesicon_text:					"상",
					modal_titlesservername_text:			"서버 이름",
					modal_titlestotal_text:					"합계:",
					modal_titlesglobal_text:				"글로벌:",
					modal_titleslocal_text:					"지방의:",
					modal_titlesreplicate_text:				"사본:",
					btn_ok_text:							"승인"
				};
			default:		//default: english
				return {
					modal_header_text:						"Statistics of emojis",
					modal_titlesicon_text:					"Icon",
					modal_titlesservername_text:			"Servername",
					modal_titlestotal_text:					"Total:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Local:",
					modal_titlesreplicate_text:				"Copies:",
					btn_ok_text:							"OK"
				};
		}
	}
}
