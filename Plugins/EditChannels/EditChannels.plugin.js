//META{"name":"EditChannels"}*//

class EditChannels {
	constructor () {
		this.labels = {};
		
		this.channelObserver = new MutationObserver(() => {});
		this.channelListObserver = new MutationObserver(() => {});
		this.channelContextObserver = new MutationObserver(() => {});
    
		this.css = `
			.editchannels-modal .modal {
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
			
			.editchannels-modal .form {
				width: 100%;
			}

			.editchannels-modal .form-header, .editchannels-modal .form-actions {
				background-color: rgba(32,34,37,.3);
				box-shadow: inset 0 1px 0 rgba(32,34,37,.6);
				padding: 20px;
				
			}

			.editchannels-modal .form-header {
				color: #f6f6f7;
				cursor: default;
				font-size: 16px;
				font-weight: 600;
				letter-spacing: .3px;
				line-height: 20px;
				text-transform: uppercase;
			}

			.editchannels-modal .form-actions {
				display: flex;
				flex-direction: row-reverse;
				flex-wrap: nowrap;
				flex: 0 0 auto;
				padding-right: 32px;
			}

			.editchannels-modal .form-inner{
				margin: 10px 0;
				max-height: 360px;
				overflow-x: hidden;
				overflow-y: hidden;
				padding: 0 20px;
				height: 200px;
			}

			.editchannels-modal .modal-inner {
				background-color: #36393E;
				border-radius: 5px;
				box-shadow: 0 0 0 1px rgba(32,34,37,.6),0 2px 10px 0 rgba(0,0,0,.2);
				display: flex;
				min-height: 200px;
				pointer-events: auto;
				width: 470px;
			}

			.editchannels-modal input {
				color: #f6f6f7;
				background-color: rgba(0,0,0,.1);
				border-color: rgba(0,0,0,.3);
				padding: 10px;
				height: 40px;
				box-sizing: border-box;
				width: 100%;
				border-width: 1px;
				border-style: solid;
				border-radius: 3px;
				outline: none;
				transition: background-color .15s ease,border .15s ease;
			}

			.editchannels-modal .btn {
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

			.editchannels-modal .btn-cancel {
				background-color: #2f3136;
				color: #fff;
			}

			.editchannels-modal .btn-save {
				background-color: #3A71C1;
				color: #fff;
			}

			.editchannels-modal .control-group label {
				color: #b9bbbe;
				letter-spacing: .5px;
				text-transform: uppercase;
				flex: 1;
				cursor: default;
				font-weight: 600;
				line-height: 16px;
				font-size: 12px;
			}

			.editchannels-modal .control-group {
				margin-top: 10px;
			}`;

		this.channelContextEntryMarkup =
			`<div class="item-group">
				<div class="item localchannelsettings-item item-subMenu">
					<span>REPLACE_context_localchannelsettings_text</span>
					<div class="hint"></div>
				</div>
			</div>`;
			
		this.channelContextSubMenuMarkup = 
			`<div class="context-menu editchannels-submenu">
				<div class="item-group">
					<div class="item channelsettings-item">
						<span>REPLACE_submenu_channelsettings_text</span>
						<div class="hint"></div>
					</div>
					<div class="item resetsettings-item">
						<span>REPLACE_submenu_resetsettings_text</span>
						<div class="hint"></div>
					</div>
				</div>
			</div>`;

		this.channelSettingsModalMarkup =
			`<span class="editchannels-modal">
				<div class="backdrop-2ohBEd callout-backdrop" style="background-color:#000; opacity:0.85"></div>
				<div class="modal" style="opacity: 1">
					<div class="modal-inner">
						<div class="form">
							<div class="form-header">
								<header class="modal-header">REPLACE_modal_header_text</header>
							</div>
							<div class="form-inner">
								<div class="control-group">
									<label class="modal-text-label" for="modal-text">REPLACE_modal_channelname_text</label>
									<input type="text" id="modal-text" name="text">
								</div>
								<div class="control-group">
									<div class="modal-color-picker">
										<label class="color-picker-label">REPLACE_modal_colorpicker_text</label>
										<div class="swatches1"></div>
									</div>
								</div>
							</div>
							<div class="form-actions">
								<button type="button" class="btn btn-cancel">REPLACE_btn_cancel_text</button>
								<button type="button" class="btn btn-save">REPLACE_btn_save_text</button>
							</div>
						</form>
					</div>
				</div>
			</span>`;
	}

	getName () {return "EditChannels";}

	getDescription () {return "Allows you to rename and recolor channelnames.";}

	getVersion () {return "3.3.3";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			return `<button class="` + this.getName() + `ResetBtn" style="height:23px" onclick='` + this.getName() + `.resetAll("` + this.getName() + `")'>Reset all Channels`;
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
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
			
			this.channelObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.attributeName == "class" && change.target && change.target.classList && change.target.classList.contains("wrapper-fDmxzK")) {
							this.loadChannel(change.target.parentElement);
						}
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.classList && node.classList.contains("containerDefault-7RImuF")) {
									this.loadChannel($(node));
								}
							});
						}
					}
				);
			});
			
			this.channelListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								 if (node && node.className && node.className.length > 0 && node.className.indexOf("container-") > -1) {
									this.channelObserver.observe(node, {childList: true, attributes: true, subtree: true});
									this.loadAllChannels();
								} 
							});
						}
					}
				);
			});
			if (document.querySelector("[class*='channels-'][class*='flex-']")) this.channelListObserver.observe(document.querySelector("[class*='channels-'][class*='flex-']"), {childList: true, subtree: true});
			
			$(".flex-vertical.channels-wrap .scroller-fzNley.scroller-NXV0-d [class^='container-']").each(
				(i,category) => {
					this.channelObserver.observe(category, {childList: true, attributes: true, subtree: true});
				}
			);
			
			this.channelContextObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.nodeType == 1 && node.className.includes("context-menu")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".app")) this.channelContextObserver.observe(document.querySelector(".app"), {childList: true});
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.loadAllChannels();
			
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
			this.channelObserver.disconnect();
			this.channelListObserver.disconnect();
			this.channelContextObserver.disconnect();
			
			$(".custom-editchannels").each(
				(i,channelDiv) => {
					var info = BDfunctionsDevilBro.getKeyInformation({"node":channelDiv, "key":"channel"});
					if (info) {
						var channel = $(channelDiv).find(".name-2SL4ev");
					
						$(channelDiv)
							.removeClass("custom-editchannels");
						$(channel)
							.text(info.name)
							.css("color", "");
					}
				}
			);
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
		}
	}

	
	// begin of own functions

    static resetAll (pluginName) {
		if (confirm("Are you sure you want to reset all channels?")) {
			BDfunctionsDevilBro.removeAllData(pluginName, "channels");
			
			$(".custom-editchannels").each(
				(i,channelDiv) => {
					var info = BDfunctionsDevilBro.getKeyInformation({"node":channelDiv, "key":"channel"});
					if (info) {
						var channel = $(channelDiv).find(".name-2SL4ev");
					
						$(channelDiv)
							.removeClass("custom-editchannels");
						$(channel)
							.text(info.name)
							.css("color", "");
					}
				}
			);
		}
    }

	changeLanguageStrings () {
		this.channelContextEntryMarkup = 	this.channelContextEntryMarkup.replace("REPLACE_context_localchannelsettings_text", this.labels.context_localchannelsettings_text);
		
		this.channelContextSubMenuMarkup = 	this.channelContextSubMenuMarkup.replace("REPLACE_submenu_channelsettings_text", this.labels.submenu_channelsettings_text);
		this.channelContextSubMenuMarkup = 	this.channelContextSubMenuMarkup.replace("REPLACE_submenu_resetsettings_text", this.labels.submenu_resetsettings_text);
		
		this.channelSettingsModalMarkup = 	this.channelSettingsModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.channelSettingsModalMarkup = 	this.channelSettingsModalMarkup.replace("REPLACE_modal_channelname_text", this.labels.modal_channelname_text);
		this.channelSettingsModalMarkup = 	this.channelSettingsModalMarkup.replace("REPLACE_modal_colorpicker_text", this.labels.modal_colorpicker_text);
		this.channelSettingsModalMarkup = 	this.channelSettingsModalMarkup.replace("REPLACE_btn_cancel_text", this.labels.btn_cancel_text);
		this.channelSettingsModalMarkup = 	this.channelSettingsModalMarkup.replace("REPLACE_btn_save_text", this.labels.btn_save_text);
		
		BDfunctionsDevilBro.translateMessage(this.getName());
	}
	
	onContextMenu (context) {
		if ($(context).find(".localchannelsettings-item").length == 0) {
			var channelData = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"channel"});
			var contextType = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"displayName", "value":"ChannelInviteCreateGroup"});
			
			if (channelData && contextType) {
				$(context).append(this.channelContextEntryMarkup)
					.on("mouseenter", ".localchannelsettings-item", channelData, this.createContextSubMenu.bind(this))
					.on("mouseleave", ".localchannelsettings-item", channelData, this.deleteContextSubMenu.bind(this));
			}
		}
	}
	
	createContextSubMenu (e) {
		var theme = BDfunctionsDevilBro.themeIsLightTheme() ? "" : "theme-dark";
		
		var targetDiv = e.target.tagName != "SPAN" ? e.target : e.target.parentNode;
		
		var channelContextSubMenu = $(this.channelContextSubMenuMarkup);
		$(targetDiv).append(channelContextSubMenu)
			.off("click", ".channelsettings-item")
			.on("click", ".channelsettings-item", e.data, this.showChannelSettings.bind(this));
		$(channelContextSubMenu)
			.addClass(theme)
			.css("left", $(targetDiv).offset().left + "px")
			.css("top", $(targetDiv).offset().top + "px");
		var id = e.data.id + "_" + e.data.guild_id;
		var info = BDfunctionsDevilBro.loadData(id, this.getName(), "channels");
		if (!info) {
			$(targetDiv).find(".resetsettings-item").addClass("disabled");
		}
		else {
			$(targetDiv)
				.off("click", ".resetsettings-item")
				.on("click", ".resetsettings-item", e.data, this.resetChannel.bind(this));
		}
	}
	
	deleteContextSubMenu (e) {
		$(".editchannels-submenu").remove();
	}
	
	showChannelSettings (e) {
		$(".context-menu").hide();
		var id = e.data.id + "_" + e.data.guild_id;
		if (id) {
			var info = BDfunctionsDevilBro.loadData(id, this.getName(), "channels");
			
			var channelID = e.data.id;
			var serverID = 	e.data.guild_id;
			var name = 		info ? info.name : null;
			var color = 	info ? info.color : null;
			
			var channelDiv = BDfunctionsDevilBro.getDivOfChannel(channelID, serverID);
			var channel = $(channelDiv).find(".name-2SL4ev");
			
			var channelSettingsModal = $(this.channelSettingsModalMarkup);
			channelSettingsModal.find("#modal-text")[0].value = name;
			channelSettingsModal.find("#modal-text").attr("placeholder", e.data.name);
			BDfunctionsDevilBro.setColorSwatches(color, channelSettingsModal.find(".swatches1"), "swatch1");
			channelSettingsModal.appendTo($("body > div > [class*='platform-'] > div").last())
				.on("click", ".callout-backdrop,button.btn-cancel", (event) => {
					channelSettingsModal.remove();
				})
				.on("click", "button.btn-save", (event) => {
					event.preventDefault();
					
					name = null;
					if (channelSettingsModal.find("#modal-text")[0].value) {
						if (channelSettingsModal.find("#modal-text")[0].value.trim().length > 0) {
							name = channelSettingsModal.find("#modal-text")[0].value.trim();
						}
					}
					
					
					color = BDfunctionsDevilBro.getSwatchColor("swatch1");
					if (color) {
						if (color[0] < 30 && color[1] < 30 && color[2] < 30) BDfunctionsDevilBro.colorCHANGE(color, 30);
						else if (color[0] > 225 && color[1] > 225 && color[2] > 225) BDfunctionsDevilBro.colorCHANGE(color, -30);
					}
					
					if (name == null && color == null) {
						this.resetChannel(e);
					}
					else {
						BDfunctionsDevilBro.saveData(id, {channelID,serverID,name,color}, this.getName(), "channels");
						this.loadChannel(channelDiv);
					}
					
					channelSettingsModal.remove();
				});
				
			channelSettingsModal.find("#modal-text")[0].focus();
		}
	}

	chooseColor (channel, color) {
		if (color && channel && channel.className) {
			if (channel.className.indexOf("nameMuted") > -1 || channel.className.indexOf("nameLocked") > -1) {
				color = BDfunctionsDevilBro.colorCHANGE(color, -50);
			}
			if (channel.className.indexOf("nameDefault") > -1) {
				color = color;
			}
			if (channel.className.indexOf("nameSelected") > -1 || channel.className.indexOf("nameHovered") > -1 ||  channel.className.indexOf("nameUnread") > -1) {
				color = BDfunctionsDevilBro.colorCHANGE(color, 50);
			}
			return BDfunctionsDevilBro.color2RGB(color);
		}
		return null;
	}
	
	resetChannel (e) {
		$(".context-menu").hide();
		
		var id = e.data.id + "_" + e.data.guild_id;
		if (id) {
			var channelDiv = BDfunctionsDevilBro.getDivOfChannel(e.data.id, e.data.guild_id);
			var channel = $(channelDiv).find(".name-2SL4ev");
			
			$(channelDiv)
				.removeClass("custom-editchannels");
			$(channel)
				.text(e.data.name)
				.css("color", "");
			
			BDfunctionsDevilBro.removeData(id, this.getName(), "channels");
		}
	}
	
	loadChannel (channelDiv) {
		var info = BDfunctionsDevilBro.getKeyInformation({"node":channelDiv, "key":"channel"});
		if (info) {
			var channel = $(channelDiv).find(".name-2SL4ev");
			var id = info.id + "_" + info.guild_id;
			var data = BDfunctionsDevilBro.loadData(id, this.getName(), "channels");
			if (data) {
				var name = 		data.name ? data.name : info.name;
				var color = 	data.color ? this.chooseColor(channel[0], data.color) : "";
				
				$(channelDiv)
					.addClass("custom-editchannels");
				$(channel)
					.text(name)
					.css("color", color);
			}
		}
	}
	
	loadAllChannels () {
		var channels = BDfunctionsDevilBro.readChannelList();
		for (var i = 0; i < channels.length; i++) {
			this.loadChannel(channels[i]);
		}
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "da": 		//danish
				return {
					context_localchannelsettings_text: 		"Lokal kanalindstillinger",
					submenu_channelsettings_text: 			"Skift indstillinger",
					submenu_resetsettings_text: 			"Nulstil kanal",
					modal_header_text:						"Lokal kanalindstillinger",
					modal_channelname_text:					"Lokalt kanalnavn",
					modal_colorpicker_text:				"Lokal kanalfarve",
					btn_cancel_text:						"Afbryde",
					btn_save_text:							"Spare"
				};
			case "de": 		//german
				return {
					context_localchannelsettings_text: 		"Lokale Kanaleinstellungen",
					submenu_channelsettings_text: 			"Ändere Einstellungen",
					submenu_resetsettings_text: 			"Kanal zurücksetzen",
					modal_header_text:						"Lokale Kanaleinstellungen",
					modal_channelname_text:					"Lokaler Kanalname",
					modal_colorpicker_text:				"Lokale Kanalfarbe",
					btn_cancel_text:						"Abbrechen",
					btn_save_text:							"Speichern"
				};
			case "es": 		//spanish
				return {
					context_localchannelsettings_text: 		"Ajustes local de canal",
					submenu_channelsettings_text: 			"Cambiar ajustes",
					submenu_resetsettings_text: 			"Restablecer canal",
					modal_header_text:						"Ajustes local de canal",
					modal_channelname_text:					"Nombre local del canal",
					modal_colorpicker_text:				"Color local del canal",
					btn_cancel_text:						"Cancelar",
					btn_save_text:							"Guardar"
				};
			case "fr": 		//french
				return {
					context_localchannelsettings_text: 		"Paramètres locale du canal",
					submenu_channelsettings_text: 			"Modifier les paramètres",
					submenu_resetsettings_text: 			"Réinitialiser le canal",
					modal_header_text:						"Paramètres locale du canal",
					modal_channelname_text:					"Nom local du canal",
					modal_colorpicker_text:				"Couleur locale de la chaîne",
					btn_cancel_text:						"Abandonner",
					btn_save_text:							"Enregistrer"
				};
			case "it": 		//italian
				return {
					context_localchannelsettings_text: 		"Impostazioni locale canale",
					submenu_channelsettings_text: 			"Cambia impostazioni",
					submenu_resetsettings_text: 			"Ripristina canale",
					modal_header_text:						"Impostazioni locale canale",
					modal_channelname_text:					"Nome locale canale",
					modal_colorpicker_text:				"Colore locale canale",
					btn_cancel_text:						"Cancellare",
					btn_save_text:							"Salvare"
				};
			case "nl":		//dutch
				return {
					context_localchannelsettings_text: 		"Lokale kanaalinstellingen",
					submenu_channelsettings_text: 			"Verandere instellingen",
					submenu_resetsettings_text: 			"Reset kanaal",
					modal_header_text:						"Lokale kanaalinstellingen",
					modal_channelname_text:					"Lokale kanaalnaam",
					modal_colorpicker_text:				"Lokale kanaalkleur",
					btn_cancel_text:						"Afbreken",
					btn_save_text:							"Opslaan"
				};
			case "no":		//norwegian
				return {
					context_localchannelsettings_text: 		"Lokal kanalinnstillinger",
					submenu_channelsettings_text: 			"Endre innstillinger",
					submenu_resetsettings_text: 			"Tilbakestill kanal",
					modal_header_text:						"Lokal kanalinnstillinger",
					modal_channelname_text:					"Lokalt kanalnavn",
					modal_colorpicker_text:				"Lokal kanalfarge",
					btn_cancel_text:						"Avbryte",
					btn_save_text:							"Lagre"
				};
			case "pl":		//polish
				return {
					context_localchannelsettings_text: 		"Lokalny ustawienia kanału",
					submenu_channelsettings_text: 			"Zmień ustawienia",
					submenu_resetsettings_text: 			"Resetuj kanał",
					modal_header_text:						"Lokalny ustawienia kanału",
					modal_channelname_text:					"Lokalna nazwa kanału",
					modal_colorpicker_text:				"Lokalny kolor kanału",
					btn_cancel_text:						"Anuluj",
					btn_save_text:							"Zapisz"
				};
			case "pt":		//portuguese (brazil)
				return {
					context_localchannelsettings_text: 		"Configurações local do canal",
					submenu_channelsettings_text: 			"Mudar configurações",
					submenu_resetsettings_text: 			"Redefinir canal",
					modal_header_text:						"Configurações local do canal",
					modal_channelname_text:					"Nome local do canal",
					modal_colorpicker_text:				"Cor local do canal",
					btn_cancel_text:						"Cancelar",
					btn_save_text:							"Salvar"
				};
			case "fi":		//finnish
				return {
					context_localchannelsettings_text: 		"Paikallinen kanavan asetukset",
					submenu_channelsettings_text: 			"Vaihda asetuksia",
					submenu_resetsettings_text: 			"Nollaa kanava",
					modal_header_text:						"Paikallinen kanavan asetukset",
					modal_channelname_text:					"Paikallinen kanavanimi",
					modal_colorpicker_text:				"Paikallinen kanavanväri",
					btn_cancel_text:						"Peruuttaa",
					btn_save_text:							"Tallentaa"
				};
			case "sv":		//swedish
				return {
					context_localchannelsettings_text: 		"Lokal kanalinställningar",
					submenu_channelsettings_text: 			"Ändra inställningar",
					submenu_resetsettings_text: 			"Återställ kanal",
					modal_header_text:						"Lokal kanalinställningar",
					modal_channelname_text:					"Lokalt kanalnamn",
					modal_colorpicker_text:				"Lokal kanalfärg",
					btn_cancel_text:						"Avbryta",
					btn_save_text:							"Spara"
				};
			case "tr":		//turkish
				return {
					context_localchannelsettings_text: 		"Yerel Kanal Ayarları",
					submenu_channelsettings_text: 			"Ayarları Değiştir",
					submenu_resetsettings_text: 			"Kanal Sıfırla",
					modal_header_text:						"Yerel Kanal Ayarları",
					modal_channelname_text:					"Yerel Kanal Adı",
					modal_colorpicker_text:				"Yerel Kanal Rengi",
					btn_cancel_text:						"Iptal",
					btn_save_text:							"Kayıt"
				};
			case "cs":		//czech
				return {
					context_localchannelsettings_text: 		"Místní nastavení kanálu",
					submenu_channelsettings_text: 			"Změnit nastavení",
					submenu_resetsettings_text: 			"Obnovit kanál",
					modal_header_text:						"Místní nastavení kanálu",
					modal_channelname_text:					"Místní název kanálu",
					modal_colorpicker_text:				"Místní barvy kanálu",
					btn_cancel_text:						"Zrušení",
					btn_save_text:							"Uložit"
				};
			case "bg":		//bulgarian
				return {
					context_localchannelsettings_text: 		"Настройки за локални канали",
					submenu_channelsettings_text: 			"Промяна на настройките",
					submenu_resetsettings_text: 			"Възстановяване на канал",
					modal_header_text:						"Настройки за локални канали",
					modal_channelname_text:					"Локално име на канал",
					modal_colorpicker_text:				"Локален цветен канал",
					btn_cancel_text:						"Зъбести",
					btn_save_text:							"Cпасяване"
				};
			case "ru":		//russian
				return {
					context_localchannelsettings_text: 		"Настройки локального канала",
					submenu_channelsettings_text: 			"Изменить настройки",
					submenu_resetsettings_text: 			"Сбросить канал",
					modal_header_text:						"Настройки локального канала",
					modal_channelname_text:					"Имя локального канала",
					modal_colorpicker_text:				"Цвет локального канала",
					btn_cancel_text:						"Отмена",
					btn_save_text:							"Cпасти"
				};
			case "uk":		//ukranian
				return {
					context_localchannelsettings_text: 		"Налаштування локального каналу",
					submenu_channelsettings_text: 			"Змінити налаштування",
					submenu_resetsettings_text: 			"Скидання каналу",
					modal_header_text:						"Налаштування локального каналу",
					modal_channelname_text:					"Локальне ім'я каналу",
					modal_colorpicker_text:				"Колір місцевого каналу",
					btn_cancel_text:						"Скасувати",
					btn_save_text:							"Зберегти"
				};
			case "ja":		//japanese
				return {
					context_localchannelsettings_text: 		"ローカルチャネル設定",
					submenu_channelsettings_text: 			"設定を変更する",
					submenu_resetsettings_text: 			"チャネルをリセットする",
					modal_header_text:						"ローカルチャネル設定",
					modal_channelname_text:					"ローカルチャネル名",
					modal_colorpicker_text:				"ローカルチャネルの色",
					btn_cancel_text:						"キャンセル",
					btn_save_text:							"セーブ"
				};
			case "zh":		//chinese (traditional)
				return {
					context_localchannelsettings_text: 		"本地頻道設置",
					submenu_channelsettings_text: 			"更改設置",
					submenu_resetsettings_text: 			"重置通道",
					modal_header_text:						"本地頻道設置",
					modal_channelname_text:					"本地頻道名稱",
					modal_colorpicker_text:				"本地頻道顏色",
					btn_cancel_text:						"取消",
					btn_save_text:							"保存"
				};
			case "ko":		//korean
				return {
					context_localchannelsettings_text: 		"로컬 채널 설정",
					submenu_channelsettings_text: 			"설정 변경",
					submenu_resetsettings_text: 			"채널 재설정",
					modal_header_text:						"로컬 채널 설정",
					modal_channelname_text:					"로컬 채널 이름",
					modal_colorpicker_text:				"지역 채널 색깔",
					btn_cancel_text:						"취소",
					btn_save_text:							"저장"
				};
			default:		//default: english
				return {
					context_localchannelsettings_text: 		"Local Channelsettings",
					submenu_channelsettings_text: 			"Change Settings",
					submenu_resetsettings_text: 			"Reset Channel",
					modal_header_text:						"Local Channelsettings",
					modal_channelname_text:					"Local Channelname",
					modal_colorpicker_text:				"Local Channelcolor",
					btn_cancel_text:						"Cancel",
					btn_save_text:							"Save"
				};
		}
	}
}
