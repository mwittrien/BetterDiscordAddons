//META{"name":"EmojiStatistics"}*//

class EmojiStatistics {
	constructor () {
		this.labels = {};
		
		this.emojiPickerObserver = new MutationObserver(() => {});
		
		this.emojiToServerList = {};
		this.emojiReplicaList = {};
		
		this.emojiInformation;
		this.serverInformation;
		
		this.css = `
			#emojistatistics-scrolldiv::-webkit-scrollbar {
				width: 12px;
			}

			#emojistatistics-scrolldiv::-webkit-scrollbar-thumb {
				background-color: #1e2124;
				border-radius: 7px;
			}

			#emojistatistics-scrolldiv::-webkit-scrollbar-track-piece {
				background-color: #2f3136;
				border-radius: 7px;
			}
			
			.emojistatistics-modal .modal {
				align-content: space-around;
				align-items: center;
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				justify-content: center;
				min-height: initial;
				max-height: initial;
				opacity: 0;
				pointer-events: none;
				user-select: none;
				height: 100%;
				width: 100%;
				margin: 0;
				padding: 0;
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				z-index: 1000;
			}
			
			.emojistatistics-modal .form {
				width: 100%;
			}

			.emojistatistics-modal .form-header, .emojistatistics-modal .form-actions {
				background-color: rgba(32,34,37,.3);
				box-shadow: inset 0 1px 0 rgba(32,34,37,.6);
				padding: 20px;
				
			}

			.emojistatistics-modal .form-header {
				color: #f6f6f7;
				cursor: default;
				font-size: 16px;
				font-weight: 600;
				letter-spacing: .3px;
				line-height: 20px;
				text-transform: uppercase;
			}

			.emojistatistics-modal .form-actions {
				display: flex;
				flex-direction: row-reverse;
				flex-wrap: nowrap;
				flex: 0 0 auto;
				padding-right: 32px;
			}

			.emojistatistics-modal .form-titles, 
			.emojistatistics-modal .form-inner {
				margin: 10px 0;
				overflow-x: hidden;
				overflow-y: hidden;
				padding: 0 20px;	
			}

			.emojistatistics-modal .form-inner {
				max-height: 340px;
				overflow-y: scroll;
			}
			
			.emojistatistics-modal .modal-inner {
				background-color: #36393E;
				border-radius: 5px;
				box-shadow: 0 0 0 1px rgba(32,34,37,.6),0 2px 10px 0 rgba(0,0,0,.2);
				display: flex;
				min-height: 200px;
				pointer-events: auto;
				width: 680px;
			}

			.emojistatistics-modal .btn {
				align-items: center;
				background: none;
				border-radius: 3px;
				border: none;
				box-sizing: border-box;
				display: flex;
				font-size: 14px;
				font-weight: 500;
				justify-content: center;
				line-height: 16px;
				min-height: 38px;
				min-width: 96px;
				padding: 2px 16px;
				position: relative;
			}

			.emojistatistics-modal .btn-ok {
				background-color: #3A71C1;
				color: #fff;
			}

			.emojistatistics-modal .emojiserver-entry {
				border-bottom: 1px solid #2F3237;
				border-top: 1px solid #2F3237;
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
				height: 32px;
				letter-spacing: .5px;
				padding-top: 18px;
				text-align: center;
				vertical-align: middle;
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
				width: 180px;
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
			}
			
			.emoji-tooltip {
				position: absolute;
				z-index: 3000;
			}
			
			.emoji-tooltip div {
				white-space: nowrap;
				overflow: hidden;
			}`;

		this.emojiInformationModalMarkup =
			`<span class="emojistatistics-modal">
				<div class="backdrop-2ohBEd callout-backdrop" style="background-color:#000; opacity:0.85"></div>
				<div class="modal" style="opacity: 1">
					<div class="modal-inner">
						<div class="form">
							<div class="form-header">
								<header class="modal-header">REPLACE_modal_header_text</header>
							</div>
							<div class="form-titles"></div>
							<div class="form-inner" id="emojistatistics-scrolldiv"></div>
							<div class="form-actions">
								<button type="button" class="btn btn-ok">REPLACE_btn_ok_text</button>
							</div>
						</form>
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
			
		this.emojiButtonMarkup =
			`<div class="emojistatistics-button"></div>`;
			
		this.emojiTooltipMarkup = 
			`<div class="tooltip tooltip-right tooltip-black emoji-tooltip"><div class="emoji-name"></div><div class="emoji-server"></div></div>`;
	}

	getName () {return "EmojiStatistics";}

	getDescription () {return "Adds some helpful options to show you more information about emojis and emojiservers.";}

	getVersion () {return "2.3.4";}

	getAuthor () {return "DevilBro";}

    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			return `
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="enableEmojiHovering"${(this.getSettings().enableEmojiHovering ? " checked" : void 0)}> Show emojiinformation when hovering over an emoji in the emojipicker.</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="enableEmojiStatisticsButton"${(this.getSettings().enableEmojiStatisticsButton ? " checked" : void 0)}> Add a button in the emojipicker to open statistics overview.</label>`;
		}
    }

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
			this.emojiPickerObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.classList && node.classList.contains("popout") && $(node).find(".emoji-picker").length != 0 ) {
									this.loadEmojiList();
									if ($(".emojistatistics-button").length == 0 && this.getSettings().enableEmojiStatisticsButton) {
										this.addEmojiInformationButton(node);
									}
									if (this.getSettings().enableEmojiHovering) {
										this.hoverEmoji(node);
									}
								}
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if ($(node).find(".emoji-picker").length > 0) {
									$(".tooltips").find(".emoji-tooltip").remove();
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".app")) this.emojiPickerObserver.observe(document.querySelector(".app"), {childList: true, subtree: true});
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
		
			setTimeout(() => {
				this.labels = this.setLabelsByLanguage();
				this.changeLanguageStrings();
			},5000);
			
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.emojiPickerObserver.disconnect();
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
		}
	}
	
	// begin of own functions
	
	getSettings () {
		var defaultSettings = {
			enableEmojiHovering: true,
			enableEmojiStatisticsButton: true
		};
		var settings = BDfunctionsDevilBro.loadAllData(this.getName(), "settings");
		var saveSettings = false;
		for (var key in defaultSettings) {
			if (settings[key] == null) {
				settings[key] = settings[key] ? settings[key] : defaultSettings[key];
				saveSettings = true;
			}
		}
		if (saveSettings) {
			BDfunctionsDevilBro.saveAllData(settings, this.getName(), "settings");
		}
		return settings;
	}

    static updateSettings (ele, pluginName) {
		var settingspanel = BDfunctionsDevilBro.getSettingsPanelDiv(ele);
		var settings = {};
		var inputs = settingspanel.querySelectorAll("input");
		for (var i = 0; i < inputs.length; i++) {
			settings[inputs[i].value] = inputs[i].checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, pluginName, "settings");
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
		
		BDfunctionsDevilBro.translateMessage(this.getName());
	}
	
	loadEmojiList () {
		var emojipicker = $(".emoji-picker")[0];
		if (emojipicker) {
			var rows = BDfunctionsDevilBro.getKeyInformation({"node":emojipicker, "key":"cachedMetaDataNoSearch"});
			this.emojiInformation = rows;
			var categories = BDfunctionsDevilBro.getKeyInformation({"node":emojipicker, "key":"categories"});
			this.serverInformation = categories;
			
			if (rows && categories) {
				for (var i = 0; i < rows.length; i++) {
					var currentServer = rows[i].category;
					if (currentServer.indexOf("custom") != -1){	
						var emojis = rows[i].items;
						for (var j = 0; j < emojis.length; j++) {
							var emoji = emojis[j].emoji;
							var emojiUrl = emoji.url;
							var emojiName = emoji.allNamesString;
							var emojiClearName = emojiName.split(":")[1].split("~")[0];
							var serverName = this.getNameOfServer(currentServer, categories);
							this.emojiToServerList[emojiUrl] = {emojiName, serverName};
							if (emoji.managed) {
								if (this.emojiReplicaList[emojiClearName] != undefined) {
									this.emojiReplicaList[emojiClearName] = true;
								}
								else {
									this.emojiReplicaList[emojiClearName] = false;
								}
							}
						}
					}
				}
			}
		}
	}
	
	hoverEmoji (picker) {
		$(picker)
			.off("mouseover." + this.getName()).off("mouseout." + this.getName())
			.on("mouseover." + this.getName(), "div.emoji-item", (e) => {
				if (!this.hovering) {
					this.hovering = true;
					var emoji = e.target;
					var emojiUrl = $(emoji).css("background-image");
					emojiUrl = emojiUrl.replace("url(\"","").replace("\")","");
					var data = this.emojiToServerList[emojiUrl];
					if (data) {
						var emojiTooltip = $(this.emojiTooltipMarkup);
						$(".tooltips").append(emojiTooltip);
						$(emojiTooltip).find(".emoji-name").text(data.emojiName);
						$(emojiTooltip).find(".emoji-server").text(data.serverName);
						$(emojiTooltip)
							.css("left", ($(emoji).offset().left + $(emoji).outerWidth()) + "px")
							.css("top", ($(emoji).offset().top + ($(emoji).outerHeight() - $(emojiTooltip).outerHeight())/2) + "px");
					}
				}
			})
			.on("mouseout." + this.getName(), "div.emoji-item", (e) => {
				$(".tooltips").find(".emoji-tooltip").remove();
				this.hovering = false;
			});
	}
	
	addEmojiInformationButton (node) {
		$(node.querySelector(".emoji-picker .header")).append(this.emojiButtonMarkup)
		.on("click." + this.getName(), ".emojistatistics-button", this.showEmojiInformationModal.bind(this));
	}
	
	showEmojiInformationModal () {
		var entries = [];
		
		var emojiInformationModal = $(this.emojiInformationModalMarkup);
		emojiInformationModal.appendTo($(".app"))
		.on("click", ".callout-backdrop,button.btn-ok", (e) => {
			emojiInformationModal.remove();
		});
		$(".popout").hide();
				
		var servers = BDfunctionsDevilBro.readServerList();
		
		var rows = this.emojiInformation;
		var categories = this.serverInformation;
		
		if (rows && categories) {
			for (var i = 0; i < servers.length; i++) {
				let data = BDfunctionsDevilBro.getKeyInformation({"node":servers[i], "key":"guild"});
				if (data) {
					var entry = $(this.emojiserverEntryMarkup);
					if (data.icon) {
						entry.find(".modal-emojiserver-icon").css("background-image", "url('https://cdn.discordapp.com/icons/" + data.id + "/" + data.icon + ".png')");
					}
					else {
						entry.find(".modal-emojiserver-icon").text(servers[i].firstChild.innerText);
					}
					entry.find(".modal-emojiservername-label").text(data.name);
					entry.find(".modal-emojiservername-label").attr("id", data.id);
					
					var currentServer = "";
					var amountGlobal = 0;		
					var amountLocal = 0;	
					var amountReplicate = 0;
					
					for (var j = 0; j < rows.length; j++) {
						var newServer = rows[j].category;
						if (newServer.indexOf("custom") != -1) {	
							if (currentServer == "" || currentServer == newServer) {
								var serverName = this.getNameOfServer(newServer, categories);
								if (serverName == data.name) {
									currentServer = newServer;
									var emojis = rows[j].items;
									for (var k = 0; k < emojis.length; k++) {
										var emoji = emojis[k].emoji;
										var emojiName = emoji.allNamesString;
										var emojiClearName = emojiName.split(":")[1].split("~")[0];
										if (emoji.managed) {
											amountGlobal++; 
											if (this.emojiReplicaList[emojiClearName] == true) {
												amountReplicate++;
											} 
										}
										else {
											amountLocal++; 
										}
									}
								}
							}
							else {
								break;
							}
						}
					}
					entry.find(".modal-emojitotal-label").text(amountGlobal+amountLocal);
					entry.find(".modal-emojiglobal-label").text(amountGlobal);
					entry.find(".modal-emojilocal-label").text(amountLocal);
					entry.find(".modal-emojireplicate-label").text(amountReplicate);
					entries.push({entry:entry, index:i, name:data.name, total:amountGlobal+amountLocal, global:amountGlobal, local:amountLocal, copies:amountReplicate});
				}
			}
			
			var titleentry = $(this.emojiserverTitlesMarkup)
			.on("click", ".modal-titlesservername-label,.modal-titlestotal-label,.modal-titlesglobal-label,.modal-titleslocal-label,.modal-titlesreplicate-label", (e) => {
				var oldTitle = e.target.innerText;
				var sortKey = "index";
				var reverse = oldTitle.indexOf("▼") < 0 ? false : true;
				
				titleentry.find(".modal-titlesservername-label").text(this.labels.modal_titlesservername_text);
				titleentry.find(".modal-titlestotal-label").text(this.labels.modal_titlestotal_text);
				titleentry.find(".modal-titlesglobal-label").text(this.labels.modal_titlesglobal_text);
				titleentry.find(".modal-titleslocal-label").text(this.labels.modal_titleslocal_text);
				titleentry.find(".modal-titlesreplicate-label").text(this.labels.modal_titlesreplicate_text);
				
				if (oldTitle.indexOf("▲") < 0) {
					var title = "";
					switch (e.target.className) {
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
					e.target.innerText = oldTitle.indexOf("▼") < 0 ? title + "▼" : title + "▲";
				}
				
				var sortedEntries = BDfunctionsDevilBro.sortArrayByKey(entries, sortKey);
				
				if (reverse) {
					sortedEntries.reverse();
				}
				
				this.updateAllEntries(sortedEntries);
			})
			.appendTo(".form-titles");
					
			this.updateAllEntries(entries);
		}
	}
	
	updateAllEntries (entries) {
		$(".emojiserver-entry").remove();
		for (var i = 0; entries.length > i; i++) {
			var entry = entries[i].entry;
			entry.appendTo(".form-inner");
		}
	}
	
	getNameOfServer (server, categories) {
		var name = "";
		for (var i = 0; i < categories.length; i++) {
			if (server == categories[i].category) {
				name = categories[i].title;
				break;
			}
		}
		return name;
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "da": 		//danish
				return {
					modal_header_text: 				"Statistikker af emojis",
					modal_titlesicon_text : 		"Icon",
					modal_titlesservername_text : 	"Servernavn",
					modal_titlestotal_text : 		"Total:",
					modal_titlesglobal_text : 		"Global:",
					modal_titleslocal_text : 		"Lokal:",
					modal_titlesreplicate_text : 	"Copies:",
					btn_ok_text: 					"OK"
				};
			case "de": 		//german
				return {
					modal_header_text: 				"Statistiken über Emojis",
					modal_titlesicon_text : 		"Symbol",
					modal_titlesservername_text : 	"Servername",
					modal_titlestotal_text : 		"Gesamt:",
					modal_titlesglobal_text : 		"Global:",
					modal_titleslocal_text : 		"Lokal:",
					modal_titlesreplicate_text : 	"Kopien:",
					btn_ok_text: 					"OK"
				};
			case "es": 		//spanish
				return {
					modal_header_text: 				"Estadísticas de emojis",
					modal_titlesicon_text : 		"Icono",
					modal_titlesservername_text : 	"Nombre del servidor",
					modal_titlestotal_text : 		"Total:",
					modal_titlesglobal_text : 		"Global:",
					modal_titleslocal_text : 		"Local:",
					modal_titlesreplicate_text : 	"Copias:",
					btn_ok_text: 					"OK"
				};
			case "fr": 		//french
				return {
					modal_header_text: 				"Statistiques des emojis",
					modal_titlesicon_text : 		"Icône",
					modal_titlesservername_text : 	"Nom du serveur",
					modal_titlestotal_text : 		"Total:",
					modal_titlesglobal_text : 		"Global:",
					modal_titleslocal_text : 		"Local:",
					modal_titlesreplicate_text : 	"Copies:",
					btn_ok_text: 					"OK"
				};
			case "it": 		//italian
				return {
					modal_header_text: 				"Statistiche di emojis",
					modal_titlesicon_text : 		"Icona",
					modal_titlesservername_text : 	"Nome del server",
					modal_titlestotal_text : 		"Totale:",
					modal_titlesglobal_text : 		"Globale:",
					modal_titleslocal_text : 		"Locale:",
					modal_titlesreplicate_text : 	"Copie:",
					btn_ok_text: 					"OK"
				};
			case "nl":		//dutch
				return {
					modal_header_text: 				"Statistieken van emojis",
					modal_titlesicon_text : 		"Icoon",
					modal_titlesservername_text : 	"Servernaam",
					modal_titlestotal_text : 		"Totaal:",
					modal_titlesglobal_text : 		"Globaal:",
					modal_titleslocal_text : 		"Lokaal:",
					modal_titlesreplicate_text : 	"Kopieën:",
					btn_ok_text: 					"OK"
				};
			case "no":		//norwegian
				return {
					modal_header_text: 				"Statistikk av emojis",
					modal_titlesicon_text : 		"Ikon",
					modal_titlesservername_text : 	"Servernavn",
					modal_titlestotal_text : 		"Total:",
					modal_titlesglobal_text : 		"Global:",
					modal_titleslocal_text : 		"Lokal:",
					modal_titlesreplicate_text : 	"Kopier:",
					btn_ok_text: 					"OK"
				};
			case "pl":		//polish
				return {
					modal_header_text: 				"Statystyki emojisa",
					modal_titlesicon_text : 		"Ikona",
					modal_titlesservername_text : 	"Nome do servidor",
					modal_titlestotal_text : 		"Całkowity:",
					modal_titlesglobal_text : 		"Światowy:",
					modal_titleslocal_text : 		"Lokalny:",
					modal_titlesreplicate_text : 	"Kopie:",
					btn_ok_text: 					"OK"
				};
			case "pt":		//portuguese (brazil)
				return {
					modal_header_text: 				"Estatísticas de emojis",
					modal_titlesicon_text : 		"Ícone",
					modal_titlesservername_text : 	"Nome do servidor",
					modal_titlestotal_text : 		"Total:",
					modal_titlesglobal_text : 		"Global:",
					modal_titleslocal_text : 		"Local:",
					modal_titlesreplicate_text : 	"Cópias:",
					btn_ok_text: 					"OK"
				};
			case "fi":		//finnish
				return {
					modal_header_text: 				"Tilastot emojista",
					modal_titlesicon_text : 		"Ikoni",
					modal_titlesservername_text : 	"Palvelimen nimi",
					modal_titlestotal_text : 		"Koko:",
					modal_titlesglobal_text : 		"Globaali:",
					modal_titleslocal_text : 		"Paikallinen:",
					modal_titlesreplicate_text : 	"Kopiot:",
					btn_ok_text: 					"OK"
				};
			case "sv":		//swedish
				return {
					modal_header_text: 				"Statistik för emojis",
					modal_titlesicon_text : 		"Ikon",
					modal_titlesservername_text : 	"Servernamn",
					modal_titlestotal_text : 		"Total:",
					modal_titlesglobal_text : 		"Global:",
					modal_titleslocal_text : 		"Lokal:",
					modal_titlesreplicate_text : 	"Kopior:",
					btn_ok_text: 					"OK"
				};
			case "tr":		//turkish
				return {
					modal_header_text: 				"Emojis istatistikleri",
					modal_titlesicon_text : 		"Icon",
					modal_titlesservername_text : 	"Sunucuadı",
					modal_titlestotal_text : 		"Toplam:",
					modal_titlesglobal_text : 		"Global:",
					modal_titleslocal_text : 		"Yerel:",
					modal_titlesreplicate_text : 	"Kopya:",
					btn_ok_text: 					"Okey"
				};
			case "cs":		//czech
				return {
					modal_header_text: 				"Statistiky emojis",
					modal_titlesicon_text : 		"Ikona",
					modal_titlesservername_text : 	"Název serveru",
					modal_titlestotal_text : 		"Celkový:",
					modal_titlesglobal_text : 		"Globální:",
					modal_titleslocal_text : 		"Místní:",
					modal_titlesreplicate_text : 	"Kopie:",
					btn_ok_text: 					"OK"
				};
			case "bg":		//bulgarian
				return {
					modal_header_text: 				"Статистика на емотис",
					modal_titlesicon_text : 		"Икона",
					modal_titlesservername_text : 	"Име на сървъра",
					modal_titlestotal_text : 		"Oбщо:",
					modal_titlesglobal_text : 		"Cветовен:",
					modal_titleslocal_text : 		"Mестен:",
					modal_titlesreplicate_text : 	"Копия:",
					btn_ok_text: 					"Добре"
				};
			case "ru":		//russian
				return {
					modal_header_text: 				"Статистика emojis",
					modal_titlesicon_text : 		"Значок",
					modal_titlesservername_text : 	"Имя сервера",
					modal_titlestotal_text : 		"Всего:",
					modal_titlesglobal_text : 		"Mировой:",
					modal_titleslocal_text : 		"Местный:",
					modal_titlesreplicate_text : 	"Копии:",
					btn_ok_text: 					"ОК"
				};
			case "uk":		//ukranian
				return {
					modal_header_text: 				"Статистика емідій",
					modal_titlesicon_text : 		"Ікона",
					modal_titlesservername_text : 	"Ім'я сервера",
					modal_titlestotal_text : 		"Всього:",
					modal_titlesglobal_text : 		"Cвітовий:",
					modal_titleslocal_text : 		"Місцевий:",
					modal_titlesreplicate_text : 	"Копії:",
					btn_ok_text: 					"Добре"
				};
			case "ja":		//japanese
				return {
					modal_header_text: 				"エモジスの統計",
					modal_titlesicon_text : 		"アイコン",
					modal_titlesservername_text : 	"サーバーの名前",
					modal_titlestotal_text : 		"合計:",
					modal_titlesglobal_text : 		"グローバル:",
					modal_titleslocal_text : 		"地元:",
					modal_titlesreplicate_text : 	"コピー:",
					btn_ok_text: 					"はい"
				};
			case "zh":		//chinese (traditional)
				return {
					modal_header_text: 				"表情統計",
					modal_titlesicon_text : 		"圖標",
					modal_titlesservername_text : 	"服務器名稱",
					modal_titlestotal_text : 		"總:",
					modal_titlesglobal_text : 		"全球:",
					modal_titleslocal_text : 		"本地:",
					modal_titlesreplicate_text : 	"副本:",
					btn_ok_text: 					"好"
				};
			case "ko":		//korean
				return {
					modal_header_text: 				"그림 이모티콘의 통계",
					modal_titlesicon_text : 		"상",
					modal_titlesservername_text : 	"서버 이름",
					modal_titlestotal_text : 		"합계:",
					modal_titlesglobal_text : 		"글로벌:",
					modal_titleslocal_text : 		"지방의:",
					modal_titlesreplicate_text : 	"사본:",
					btn_ok_text: 					"승인"
				};
			default:		//default: english
				return {
					modal_header_text: 				"Statistics of emojis",
					modal_titlesicon_text : 		"Icon",
					modal_titlesservername_text : 	"Servername",
					modal_titlestotal_text : 		"Total:",
					modal_titlesglobal_text : 		"Global:",
					modal_titleslocal_text : 		"Local:",
					modal_titlesreplicate_text : 	"Copies:",
					btn_ok_text: 					"OK"
				};
		}
	}
}
