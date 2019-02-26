//META{"name":"EmojiStatistics","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EmojiStatistics","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EmojiStatistics/EmojiStatistics.plugin.js"}*//

class EmojiStatistics {
	getName () {return "EmojiStatistics";}

	getVersion () {return "2.8.0";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds some helpful options to show you more information about emojis and emojiservers.";}

	initConstructor () {
		this.labels = {};

		this.patchModules = {
			"EmojiPicker":"componentDidMount" 
		};

		this.css = `
			.emojistatistics-tooltip,
			.emoji-tooltip {
				z-index: 2002;
			}

			.${this.name}-modal .titles {
				height: 20px;
			}

			.${this.name}-modal .emojiserver-entry {
				height: 50px;
				padding-top: 5px;
				padding-bottom: 5px;
			}

			.${this.name}-modal .emojiserver-entry .modal-emojiserver-icon {
				display: inline-block;
			}

			.${this.name}-modal .titles-entry label,
			.${this.name}-modal .emojiserver-entry label {
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

			.${this.name}-modal .emojiserver-entry label {
				height: 12px;
				overflow: hidden;
			}

			.${this.name}-modal .titles-entry label {
				margin-top: 0px;
			}
			.${this.name}-modal .titles-entry .modal-titlesicon-label {
				margin-left: 0px;
				text-align: center;
				width: 50px;
			}

			.${this.name}-modal .titles-entry .modal-titlesname-label,
			.${this.name}-modal .emojiserver-entry .modal-emojiname-label {
				width: 300px;
			}

			.${this.name}-modal .titles-entry .modal-sorttitle-label {
				cursor: pointer;
			}

			.${this.name}-modal .titles-entry .modal-titlestotal-label,
			.${this.name}-modal .titles-entry .modal-titlesglobal-label,
			.${this.name}-modal .titles-entry .modal-titleslocal-label,
			.${this.name}-modal .titles-entry .modal-titlescopies-label,
			.${this.name}-modal .emojiserver-entry .modal-emojitotal-label,
			.${this.name}-modal .emojiserver-entry .modal-emojiglobal-label,
			.${this.name}-modal .emojiserver-entry .modal-emojilocal-label,
			.${this.name}-modal .emojiserver-entry .modal-emojicopies-label {
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
			`<span class="${this.name}-modal DevilBro-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizelarge}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.headertitle + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.defaultcolor + BDFDB.disCNS.h4defaultmargin + BDFDB.disCN.marginreset}">REPLACE_modal_header_text</h4>
									<div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div>
								</div>
								<button type="button" class="${BDFDB.disCNS.modalclose + BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookblank + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}">
										<svg name="Close" width="18" height="18" viewBox="0 0 12 12" style="flex: 0 1 auto;">
											<g fill="none" fill-rule="evenodd">
												<path d="M0 0h12v12H0"></path>
												<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
											</g>
										</svg>
									</div>
								</button>
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

		this.defaults = {
			settings: {
				enableEmojiHovering:			{value:true, 	description:"Show Information about Emojis on hover over an Emoji in the Emojipicker."},
				enableEmojiStatisticsButton:	{value:true, 	description:"Add a Button in the Emojipicker to open the Statistics Overview."}
			},
			amounts: {
				hoverDelay:						{value:1000, 	min:0,	description:"Tooltip delay in millisec:"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var settings = BDFDB.getAllData(this, "settings");
		var amounts = BDFDB.getAllData(this, "amounts");
		var settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in amounts) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 50%;">${this.defaults.amounts[key].description}</h3><div class="${BDFDB.disCN.inputwrapper} inputNumberWrapper ${BDFDB.disCNS.vertical +  BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn}" style="flex: 1 1 auto;"><span class="numberinput-buttons-zone"><span class="numberinput-button-up"></span><span class="numberinput-button-down"></span></span><input type="number"${(!isNaN(this.defaults.amounts[key].min) && this.defaults.amounts[key].min !== null ? ' min="' + this.defaults.amounts[key].min + '"' : '') + (!isNaN(this.defaults.amounts[key].max) && this.defaults.amounts[key].max !== null ? ' max="' + this.defaults.amounts[key].max + '"' : '')} option="${key}" value="${amounts[key]}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} amount-input"></div></div>`;
		}
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

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

			this.GuildEmojis = BDFDB.WebModules.findByProperties("getGuildEmoji", "getDisambiguatedEmojiContext");

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".emoji-tooltip",".emojistatistics-button");
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

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

	processEmojiPicker (instance, wrapper) {
		if (!wrapper.querySelector(".emojistatistics-button")) {
			let emojipickerdiversityselector = document.querySelector(BDFDB.dotCN.emojipickerdiversityselector);
			if (!emojipickerdiversityselector) return;
			this.loadEmojiList();
			let settings = BDFDB.getAllData(this, "settings");
			if (settings.enableEmojiStatisticsButton) {
				let emojiStatisticsButton = BDFDB.htmlToElement(`<div class="emojistatistics-button"></div>`);
				emojipickerdiversityselector.parentElement.insertBefore(emojiStatisticsButton, emojipickerdiversityselector);
				emojiStatisticsButton.addEventListener("click", () => {
					this.showEmojiInformationModal();
					let close = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.return.return.return.stateNode.close") || BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.return.return.stateNode.close");
					if (close) close();
				});
				emojiStatisticsButton.addEventListener("mouseenter", e => {
					BDFDB.createTooltip("Emoji Statistics", emojiStatisticsButton, {type:"top",selector:"emojistatistics-tooltip"});
				});
			}
			if (settings.enableEmojiHovering) {
				BDFDB.addEventListener(this, wrapper, "mouseenter", BDFDB.dotCN.emojipickeremojiitem, e => {
					let data = this.emojiToServerList[e.target.style.getPropertyValue("background-image").replace('url("',"").replace('")',"")];
					if (data) BDFDB.createTooltip(`${BDFDB.encodeToHTML(data.emoji)}\n${BDFDB.encodeToHTML(data.server)}`, e.target, {type:"right",selector:"emoji-tooltip",delay:BDFDB.getData("hoverDelay", this, "amounts")});
				});
			}
		}
	}

	loadEmojiList () {
		this.emojiReplicaList = {};
		this.emojiToServerList = {};
		for (let serverObj of BDFDB.readServerList()) {
			for (let emoji of this.GuildEmojis.getGuildEmoji(serverObj.id)) {
				this.emojiToServerList[emoji.url] = {emoji:emoji.allNamesString, server:serverObj.name};
				if (emoji.managed) this.emojiReplicaList[emoji.name] = this.emojiReplicaList[emoji.name] != undefined;
			}
		}
	}

	showEmojiInformationModal () {
		var emojiInformationModal = BDFDB.htmlToElement(this.emojiInformationModalMarkup);

		let titlescontainer = emojiInformationModal.querySelector(".titles");
		let entriescontainer = emojiInformationModal.querySelector(".entries");

		if (!titlescontainer || !entriescontainer) return;

		var titleEntry = BDFDB.htmlToElement(this.emojiserverTitlesMarkup);
		titlescontainer.appendChild(titleEntry);
		BDFDB.addChildEventListener(titleEntry, "click", ".modal-sorttitle-label ", e => {
			var oldTitle = e.currentTarget.innerText;

			var reverse = oldTitle.indexOf("▼") < 0 ? false : true;

			titleEntry.querySelector(".modal-titlesname-label").innerText = this.labels.modal_titlesname_text;
			titleEntry.querySelector(".modal-titlestotal-label").innerText = this.labels.modal_titlestotal_text;
			titleEntry.querySelector(".modal-titlesglobal-label").innerText = this.labels.modal_titlesglobal_text;
			titleEntry.querySelector(".modal-titleslocal-label").innerText = this.labels.modal_titleslocal_text;
			titleEntry.querySelector(".modal-titlescopies-label").innerText = this.labels.modal_titlescopies_text;

			var sortKey = "index";
			if (oldTitle.indexOf("▲") < 0) {
				sortKey = e.currentTarget.getAttribute("sortkey");
				var title = this.labels["modal_titles" + sortKey + "_text"];
				e.currentTarget.innerText = oldTitle.indexOf("▼") < 0 ? title + "▼" : title + "▲";
			}

			BDFDB.sortArrayByKey(entries, sortKey);
			if (reverse) entries.reverse();

			this.updateAllEntries(entriescontainer, entries);
		});

		var entries = [], index = 0;
		for (let info of BDFDB.readServerList()) {
			let amountGlobal = 0, amountLocal = 0, amountCopies = 0;
			for (let emoji of this.GuildEmojis.getGuildEmoji(info.id)) {
				if (emoji.managed) {
					amountGlobal++;
					if (this.emojiReplicaList[emoji.name]) amountCopies++;
				}
				else {
					amountLocal++;
				}
			}
			var emojiEntry = BDFDB.htmlToElement(this.emojiserverEntryMarkup);
			emojiEntry.querySelector(".modal-emojiserver-icon").innerHTML = this.createCopyOfServer(info).outerHTML;
			emojiEntry.querySelector(".modal-emojiname-label").innerText = info.name || "";
			emojiEntry.querySelector(".modal-emojitotal-label").innerText = amountGlobal + amountLocal;
			emojiEntry.querySelector(".modal-emojiglobal-label").innerText = amountGlobal;
			emojiEntry.querySelector(".modal-emojilocal-label").innerText = amountLocal;
			emojiEntry.querySelector(".modal-emojicopies-label").innerText = amountCopies;
			entries.push({div:emojiEntry, index:index++, name:info.name || "", total:amountGlobal+amountLocal, global:amountGlobal, local:amountLocal, copies:amountCopies});
		}

		BDFDB.appendModal(emojiInformationModal);

		this.updateAllEntries(entriescontainer, entries);
	}

	updateAllEntries (entriescontainer, entries) {
		BDFDB.removeEles(entriescontainer.childNodes);
		for (let entry of entries) {
			if (entriescontainer.childElementCount) entriescontainer.appendChild(BDFDB.htmlToElement(`<div class="${BDFDB.disCN.modaldivider}"></div>`));
			entriescontainer.appendChild(entry.div);
		}
	}

	createCopyOfServer (info) {
		let serverCopy = info.div.cloneNode(true);
		BDFDB.toggleEles(serverCopy, true);
		BDFDB.removeClass(serverCopy, BDFDB.disCN.guildunread, BDFDB.disCN.guildselected);
		serverCopy.style.setProperty("pointer-events", "none", "important");
		let serverInner = serverCopy.querySelector(BDFDB.dotCN.guildinner);
		serverInner.style.removeProperty("background-color");
		serverInner.style.removeProperty("border-radius");
		return serverCopy;
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
