//META{"name":"EmojiStatistics"}*//

class EmojiStatistics {
	initConstructor () {
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
				overflow: hidden;
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
			
			.emojistatistics-modal .titles-entry .modal-titlesname-label,
			.emojistatistics-modal .emojiserver-entry .modal-emojiname-label {
				width: 300px;
			}
			
			.emojistatistics-modal .titles-entry .modal-sorttitle-label {
				cursor: pointer;
			}
			
			.emojistatistics-modal .titles-entry .modal-titlestotal-label,
			.emojistatistics-modal .titles-entry .modal-titlesglobal-label,
			.emojistatistics-modal .titles-entry .modal-titleslocal-label,
			.emojistatistics-modal .titles-entry .modal-titlescopies-label,
			.emojistatistics-modal .emojiserver-entry .modal-emojitotal-label,
			.emojistatistics-modal .emojiserver-entry .modal-emojiglobal-label,
			.emojistatistics-modal .emojiserver-entry .modal-emojilocal-label,
			.emojistatistics-modal .emojiserver-entry .modal-emojicopies-label {
				text-align: center;
				width: 82px;
			}
			
			.emojistatistics-button {
				background-image: url("/assets/f24711dae4f6d6b28335e866a93e9d9b.png");
				background-position: -770px -374px;
				background-size: 924px 704px;
				cursor: pointer;
				height: 22px;
				margin-right: 10px;
				width: 22px;
			}`;
			
		this.emojiInformationModalMarkup =
			`<span class="emojistatistics-modal DevilBro-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizelarge}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.headertitle + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.defaultcolor + BDFDB.disCNS.h4defaultmargin + BDFDB.disCN.marginreset}">REPLACE_modal_header_text</h4>
									<div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div>
								</div>
								<svg class="${BDFDB.disCNS.modalclose + BDFDB.disCN.flexchild}" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
									<g fill="none" fill-rule="evenodd">
										<path d="M0 0h12v12H0"></path>
										<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
									</g>
								</svg>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalsubinner} titles" style="flex: 0 0 auto;"></div>
							<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner} entries"></div>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontalreverse + BDFDB.disCNS.horizontalreverse2 + BDFDB.disCNS.directionrowreverse + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalfooter}">
								<button type="button" class="btn-ok ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}">REPLACE_btn_ok_text</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;

		this.emojiserverTitlesMarkup =
			`<div class="titles-entry">
				<label class="modal-titlesicon-label">REPLACE_modal_titlesicon-label</label>
				<label class="modal-sorttitle-label modal-titlesname-label" sortkey="name">REPLACE_modal_titlesname_text</label>
				<label class="modal-sorttitle-label modal-titlestotal-label" sortkey="total">REPLACE_modal_titlestotal_text</label>
				<label class="modal-sorttitle-label modal-titlesglobal-label" sortkey="global">REPLACE_modal_titlesglobal_text</label>
				<label class="modal-sorttitle-label modal-titleslocal-label" sortkey="local">REPLACE_modal_titleslocal_text</label>
				<label class="modal-sorttitle-label modal-titlescopies-label" sortkey="copies">REPLACE_modal_titlescopies_text</label>
			</div>`;

		this.emojiserverEntryMarkup =
			`<div class="emojiserver-entry">
				<div class="modal-emojiserver-icon"></div>
				<label class="modal-emojiname-label">modal-emojiname-label</label>
				<label class="modal-emojitotal-label">modal-emojitotal-label</label>
				<label class="modal-emojiglobal-label">modal-emojiglobal-label</label>
				<label class="modal-emojilocal-label">modal-emojilocal-label</label>
				<label class="modal-emojicopies-label">modal-emojicopies-label</label>
			</div>`;
			
		this.dividerMarkup = `<div class="${BDFDB.disCNS.modaldivider + BDFDB.disCN.modaldividerdefault}"></div>`;
			
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

	getVersion () {return "2.7.5";}

	getAuthor () {return "DevilBro";}

	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var settings = BDFDB.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);});
			
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
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
	}

	initialize () {
		if (typeof BDFDB === "object") {
			BDFDB.loadMessage(this);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(BDFDB.dotCN.emojipicker)) {
									this.loadEmojiList();
									if (!node.querySelector(".emojistatistics-button") && BDFDB.getData("enableEmojiStatisticsButton", this, "settings")) {
										this.addEmojiInformationButton(node);
									}
									if (BDFDB.getData("enableEmojiHovering", this, "settings")) {
										this.hoverEmoji(node);
									}
								}
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node.querySelector(BDFDB.dotCN.emojipicker)) {
									$(BDFDB.dotCN.tooltips).find(".emoji-tooltip").remove();
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.popouts, {name:"emojiPickerObserver",instance:observer}, {childList: true});
			
			this.GuildEmojis = BDFDB.WebModules.findByProperties(["getGuildEmoji", "getDisambiguatedEmojiContext"]);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {			
			BDFDB.unloadMessage(this);
		}
	}
	
	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
			settings[input.value] = input.checked;
		}
		BDFDB.saveAllData(settings, this, "settings");
	}
	
	changeLanguageStrings () {
		this.emojiInformationModalMarkup = 	this.emojiInformationModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.emojiInformationModalMarkup = 	this.emojiInformationModalMarkup.replace("REPLACE_btn_ok_text", this.labels.btn_ok_text);
		this.emojiInformationModalMarkup = 	this.emojiInformationModalMarkup.replace("REPLACE_btn_all_text", this.labels.btn_all_text);
		
		this.emojiserverTitlesMarkup = 		this.emojiserverTitlesMarkup.replace("REPLACE_modal_titlesicon-label", this.labels.modal_titlesicon_text);
		this.emojiserverTitlesMarkup = 		this.emojiserverTitlesMarkup.replace("REPLACE_modal_titlesname_text", this.labels.modal_titlesname_text);
		this.emojiserverTitlesMarkup = 		this.emojiserverTitlesMarkup.replace("REPLACE_modal_titlestotal_text", this.labels.modal_titlestotal_text);
		this.emojiserverTitlesMarkup = 		this.emojiserverTitlesMarkup.replace("REPLACE_modal_titlesglobal_text", this.labels.modal_titlesglobal_text);
		this.emojiserverTitlesMarkup = 		this.emojiserverTitlesMarkup.replace("REPLACE_modal_titleslocal_text", this.labels.modal_titleslocal_text);
		this.emojiserverTitlesMarkup = 		this.emojiserverTitlesMarkup.replace("REPLACE_modal_titlescopies_text", this.labels.modal_titlescopies_text);
	}
	
	loadEmojiList () {
		this.emojiReplicaList = {};
		this.emojiToServerList = {};
		for (let serverObj of BDFDB.readServerList()) {
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
			.on("mouseenter." + this.getName(), BDFDB.dotCN.emojipickeremojiitem, (e) => {
				var data = this.emojiToServerList[$(e.target).css("background-image").replace("url(\"","").replace("\")","")];
				if (data) {
					var text = `${BDFDB.encodeToHTML(data.emoji)}\n${BDFDB.encodeToHTML(data.server)}`;
					BDFDB.createTooltip(text, e.target, {type:"right",selector:"emoji-tooltip",css:`.emoji-tooltip{z-index:30000;}`});
				}
			});
	}
	
	addEmojiInformationButton (node) {
		$(node).find(BDFDB.dotCN.emojipickerheader)
			.append(this.emojiButtonMarkup)
			.off("click." + this.getName())
			.on("click." + this.getName(), ".emojistatistics-button", () => {
				$(node).hide();
				this.showEmojiInformationModal();
			});
	}
	
	showEmojiInformationModal () {
		var emojiInformationModal = $(this.emojiInformationModalMarkup);
		BDFDB.appendModal(emojiInformationModal);
		
		var entries = [], index = 0;
		for (let serverObj of BDFDB.readServerList()) {
			let amountGlobal = 0, amountLocal = 0, amountCopies = 0;
			for (let emoji of this.GuildEmojis.getGuildEmoji(serverObj.id)) {
				if (emoji.managed) {
					amountGlobal++;
					if (this.emojiReplicaList[emoji.name]) amountCopies++;
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
			entry.find(".modal-emojiname-label").text(serverObj.name);
			entry.find(".modal-emojitotal-label").text(amountGlobal+amountLocal);
			entry.find(".modal-emojiglobal-label").text(amountGlobal);
			entry.find(".modal-emojilocal-label").text(amountLocal);
			entry.find(".modal-emojicopies-label").text(amountCopies);
			entries.push({entry:entry, index:index++, name:serverObj.name, total:amountGlobal+amountLocal, global:amountGlobal, local:amountLocal, copies:amountCopies});
		}
		
		var titleentry = $(this.emojiserverTitlesMarkup)
			.appendTo(".emojistatistics-modal .titles")
			.on("click", ".modal-sorttitle-label ", (e2) => {
				var oldTitle = e2.target.innerText;
				
				var reverse = oldTitle.indexOf("▼") < 0 ? false : true;
				
				titleentry.find(".modal-titlesname-label").text(this.labels.modal_titlesname_text);
				titleentry.find(".modal-titlestotal-label").text(this.labels.modal_titlestotal_text);
				titleentry.find(".modal-titlesglobal-label").text(this.labels.modal_titlesglobal_text);
				titleentry.find(".modal-titleslocal-label").text(this.labels.modal_titleslocal_text);
				titleentry.find(".modal-titlescopies-label").text(this.labels.modal_titlescopies_text);
				
				var sortKey = "index";
				if (oldTitle.indexOf("▲") < 0) {
					sortKey = e2.target.getAttribute("sortkey");
					var title = this.labels["modal_titles" + sortKey + "_text"];
					e2.target.innerText = oldTitle.indexOf("▼") < 0 ? title + "▼" : title + "▲";
				}
				
				BDFDB.sortArrayByKey(entries, sortKey);
				if (reverse) entries.reverse();
				
				this.updateAllEntries(emojiInformationModal, entries);
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
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					modal_header_text:						"Statistike o emojima",
					modal_titlesicon_text:					"Ikona",
					modal_titlesname_text:					"Naziv poslužitelja",
					modal_titlestotal_text:					"Cjelokupni:",
					modal_titlesglobal_text:				"Globalno:",
					modal_titleslocal_text:					"Kokalne:",
					modal_titlescopies_text:				"Kopije:",
					btn_ok_text:							"OK"
				};
			case "da":		//danish
				return {
					modal_header_text:						"Statistikker af emojis",
					modal_titlesicon_text:					"Icon",
					modal_titlesname_text:					"Servernavn",
					modal_titlestotal_text:					"Total:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Lokal:",
					modal_titlescopies_text:				"Copies:",
					btn_ok_text:							"OK"
				};
			case "de":		//german
				return {
					modal_header_text:						"Statistiken über Emojis",
					modal_titlesicon_text:					"Icon",
					modal_titlesname_text:					"Servername",
					modal_titlestotal_text:					"Gesamt:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Lokal:",
					modal_titlescopies_text:				"Kopien:",
					btn_ok_text:							"OK"
				};
			case "es":		//spanish
				return {
					modal_header_text:						"Estadísticas de emojis",
					modal_titlesicon_text:					"Icono",
					modal_titlesname_text:					"Nombre del servidor",
					modal_titlestotal_text:					"Total:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Local:",
					modal_titlescopies_text:				"Copias:",
					btn_ok_text:							"OK"
				};
			case "fr":		//french
				return {
					modal_header_text:						"Statistiques des emojis",
					modal_titlesicon_text:					"Icône",
					modal_titlesname_text:					"Nom du serveur",
					modal_titlestotal_text:					"Total:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Local:",
					modal_titlescopies_text:				"Copies:",
					btn_ok_text:							"OK"
				};
			case "it":		//italian
				return {
					modal_header_text:						"Statistiche di emojis",
					modal_titlesicon_text:					"Icona",
					modal_titlesname_text:					"Nome del server",
					modal_titlestotal_text:					"Totale:",
					modal_titlesglobal_text:				"Globale:",
					modal_titleslocal_text:					"Locale:",
					modal_titlescopies_text:				"Copie:",
					btn_ok_text:							"OK"
				};
			case "nl":		//dutch
				return {
					modal_header_text:						"Statistieken van emojis",
					modal_titlesicon_text:					"Icoon",
					modal_titlesname_text:					"Servernaam",
					modal_titlestotal_text:					"Totaal:",
					modal_titlesglobal_text:				"Globaal:",
					modal_titleslocal_text:					"Lokaal:",
					modal_titlescopies_text:				"Kopieën:",
					btn_ok_text:							"OK"
				};
			case "no":		//norwegian
				return {
					modal_header_text:						"Statistikk av emojis",
					modal_titlesicon_text:					"Ikon",
					modal_titlesname_text:					"Servernavn",
					modal_titlestotal_text:					"Total:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Lokal:",
					modal_titlescopies_text:				"Kopier:",
					btn_ok_text:							"OK"
				};
			case "pl":		//polish
				return {
					modal_header_text:						"Statystyki emoji",
					modal_titlesicon_text:					"Ikona",
					modal_titlesname_text:					"Nazwa",
					modal_titlestotal_text:					"Całkowity:",
					modal_titlesglobal_text:				"Światowy:",
					modal_titleslocal_text:					"Lokalny:",
					modal_titlescopies_text:				"Kopie:",
					btn_ok_text:							"OK"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					modal_header_text:						"Estatísticas de emojis",
					modal_titlesicon_text:					"Ícone",
					modal_titlesname_text:					"Nome do servidor",
					modal_titlestotal_text:					"Total:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Local:",
					modal_titlescopies_text:				"Cópias:",
					btn_ok_text:							"OK"
				};
			case "fi":		//finnish
				return {
					modal_header_text:						"Tilastot emojista",
					modal_titlesicon_text:					"Ikoni",
					modal_titlesname_text:					"Palvelimen nimi",
					modal_titlestotal_text:					"Koko:",
					modal_titlesglobal_text:				"Globaali:",
					modal_titleslocal_text:					"Paikallinen:",
					modal_titlescopies_text:				"Kopiot:",
					btn_ok_text:							"OK"
				};
			case "sv":		//swedish
				return {
					modal_header_text:						"Statistik för emojis",
					modal_titlesicon_text:					"Ikon",
					modal_titlesname_text:					"Servernamn",
					modal_titlestotal_text:					"Total:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Lokal:",
					modal_titlescopies_text:				"Kopior:",
					btn_ok_text:							"OK"
				};
			case "tr":		//turkish
				return {
					modal_header_text:						"Emojis istatistikleri",
					modal_titlesicon_text:					"Icon",
					modal_titlesname_text:					"Sunucuadı",
					modal_titlestotal_text:					"Toplam:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Yerel:",
					modal_titlescopies_text:				"Kopya:",
					btn_ok_text:							"Okey"
				};
			case "cs":		//czech
				return {
					modal_header_text:						"Statistiky emojis",
					modal_titlesicon_text:					"Ikona",
					modal_titlesname_text:					"Název serveru",
					modal_titlestotal_text:					"Celkový:",
					modal_titlesglobal_text:				"Globální:",
					modal_titleslocal_text:					"Místní:",
					modal_titlescopies_text:				"Kopie:",
					btn_ok_text:							"OK"
				};
			case "bg":		//bulgarian
				return {
					modal_header_text:						"Статистика на емотис",
					modal_titlesicon_text:					"Икона",
					modal_titlesname_text:					"Име на сървъра",
					modal_titlestotal_text:					"Oбщо:",
					modal_titlesglobal_text:				"Cветовен:",
					modal_titleslocal_text:					"Mестен:",
					modal_titlescopies_text:				"Копия:",
					btn_ok_text:							"Добре"
				};
			case "ru":		//russian
				return {
					modal_header_text:						"Статистика emojis",
					modal_titlesicon_text:					"Значок",
					modal_titlesname_text:					"Имя сервера",
					modal_titlestotal_text:					"Всего:",
					modal_titlesglobal_text:				"Mировой:",
					modal_titleslocal_text:					"Местный:",
					modal_titlescopies_text:				"Копии:",
					btn_ok_text:							"ОК"
				};
			case "uk":		//ukrainian
				return {
					modal_header_text:						"Статистика емідій",
					modal_titlesicon_text:					"Ікона",
					modal_titlesname_text:					"Ім'я сервера",
					modal_titlestotal_text:					"Всього:",
					modal_titlesglobal_text:				"Cвітовий:",
					modal_titleslocal_text:					"Місцевий:",
					modal_titlescopies_text:				"Копії:",
					btn_ok_text:							"Добре"
				};
			case "ja":		//japanese
				return {
					modal_header_text:						"エモジスの統計",
					modal_titlesicon_text:					"アイコン",
					modal_titlesname_text:					"サーバーの名前",
					modal_titlestotal_text:					"合計:",
					modal_titlesglobal_text:				"グローバル:",
					modal_titleslocal_text:					"地元:",
					modal_titlescopies_text:				"コピー:",
					btn_ok_text:							"はい"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					modal_header_text:						"表情統計",
					modal_titlesicon_text:					"圖標",
					modal_titlesname_text:					"服務器名稱",
					modal_titlestotal_text:					"總:",
					modal_titlesglobal_text:				"全球:",
					modal_titleslocal_text:					"本地:",
					modal_titlescopies_text:				"副本:",
					btn_ok_text:							"好"
				};
			case "ko":		//korean
				return {
					modal_header_text:						"그림 이모티콘의 통계",
					modal_titlesicon_text:					"상",
					modal_titlesname_text:					"서버 이름",
					modal_titlestotal_text:					"합계:",
					modal_titlesglobal_text:				"글로벌:",
					modal_titleslocal_text:					"지방의:",
					modal_titlescopies_text:				"사본:",
					btn_ok_text:							"승인"
				};
			default:		//default: english
				return {
					modal_header_text:						"Statistics of emojis",
					modal_titlesicon_text:					"Icon",
					modal_titlesname_text:					"Servername",
					modal_titlestotal_text:					"Total:",
					modal_titlesglobal_text:				"Global:",
					modal_titleslocal_text:					"Local:",
					modal_titlescopies_text:				"Copies:",
					btn_ok_text:							"OK"
				};
		}
	}
}
