//META{"name":"EditChannels"}*//

class EditChannels {
	constructor () {
		this.labels = {};
		
		this.switchFixObserver = new MutationObserver(() => {});
		this.channelObserver = new MutationObserver(() => {});
		this.channelListObserver = new MutationObserver(() => {});
		this.channelContextObserver = new MutationObserver(() => {});

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
			`<span class="editchannels-modal DevilBro-modal">
				<div class="backdrop-2ohBEd"></div>
				<div class="modal-2LIEKY">
					<div class="inner-1_1f7b">
						<div class="modal-3HOjGZ sizeMedium-1-2BNS">
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
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
							<div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW">
								<div class="scroller-fzNley inner-tqJwAU">
									<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 1 1 auto;">
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_channelname_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_" id="input-channelname"></div>
										</div>
										<div class="divider-1G01Z9 dividerDefault-77PXsz marginTop20-3UscxH"></div>
									</div>
									<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 1 1 auto;">
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_colorpicker1_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="swatches1"></div>
										</div>
									</div>
								</div>
							</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw">
								<button type="button" class="btn-save buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu">
									<div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM">REPLACE_btn_save_text</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;
	}

	getName () {return "EditChannels";}

	getDescription () {return "Allows you to rename and recolor channelnames.";}

	getVersion () {return "3.5.4";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			var settings = this.getSettings();
			var settingspanel = 
				$(`<div class="${this.getName()}-settings">
					<label style="color:grey;"><input class="settings-checkbox" type="checkbox" value="changeInChannelHeader"${settings.changeInChannelHeader ? " checked" : void 0}>Change in Channel Header</label><br><br>
					<button class="reset-button" style="height:23px">Reset all Channels</button>
				</div>`)[0];
			$(settingspanel)
				.on("change", ".settings-checkbox", () => {this.updateSettings(settingspanel);})
				.on("click", ".reset-button", () => {this.resetAll();});
			return settingspanel;
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
									this.loadChannel(node);
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
			if (document.querySelector(".channels-3g2vYe")) this.channelListObserver.observe(document.querySelector(".channels-3g2vYe"), {childList: true, subtree: true});
			
			$(".channels-3g2vYe [class^='container-']").each(
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
			
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);
			
			this.loadAllChannels();
			
			this.changeChannelHeader();
			
			BDfunctionsDevilBro.translatePlugin(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.switchFixObserver.disconnect();
			this.channelObserver.disconnect();
			this.channelListObserver.disconnect();
			this.channelContextObserver.disconnect();
			
			document.querySelectorAll("[custom-editchannels]").forEach(channelDiv => {this.resetChannel(channelDiv);});
			
			var channelHeader = document.querySelector("[custom-editchannelsheader]");
			if (channelHeader) {
				var info = BDfunctionsDevilBro.getKeyInformation({"node":channelHeader, "key":"channel"});
				if (info) {
					var channel = channelHeader.querySelector(".channelName-1G03vu");
					this.setChannelHeader(channel, info.name);
					$(channel).css("color", "");
					$(channelHeader).removeAttr("custom-editchannelsheader");
				}
			}
			
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.changeChannelHeader();
		}
	}
	
	// begin of own functions
	
	getSettings () {
		var defaultSettings = {
			changeInChannelHeader: true
		};
		var settings = BDfunctionsDevilBro.loadAllData(this.getName(), "settings");
		var saveSettings = false;
		for (var key in defaultSettings) {
			if (settings[key] == null) {
				settings[key] = defaultSettings[key];
				saveSettings = true;
			}
		}
		if (saveSettings) {
			BDfunctionsDevilBro.saveAllData(settings, this.getName(), "settings");
		}
		return settings;
	}

	updateSettings (settingspanel) {
		var settings = {};
		var inputs = settingspanel.querySelectorAll(".settings-checkbox");
		for (var i = 0; i < inputs.length; i++) {
			settings[inputs[i].value] = inputs[i].checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, this.getName(), "settings");
	}

    resetAll () {
		if (confirm("Are you sure you want to reset all channels?")) {
			BDfunctionsDevilBro.removeAllData(this.getName(), "channels");
			
			document.querySelectorAll("[custom-editchannels]").forEach(channelDiv => {this.resetChannel(channelDiv);});
			
			this.changeChannelHeader();
		}
    }

	changeLanguageStrings () {
		this.channelContextEntryMarkup = 	this.channelContextEntryMarkup.replace("REPLACE_context_localchannelsettings_text", this.labels.context_localchannelsettings_text);
		
		this.channelContextSubMenuMarkup = 	this.channelContextSubMenuMarkup.replace("REPLACE_submenu_channelsettings_text", this.labels.submenu_channelsettings_text);
		this.channelContextSubMenuMarkup = 	this.channelContextSubMenuMarkup.replace("REPLACE_submenu_resetsettings_text", this.labels.submenu_resetsettings_text);
		
		this.channelSettingsModalMarkup = 	this.channelSettingsModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.channelSettingsModalMarkup = 	this.channelSettingsModalMarkup.replace("REPLACE_modal_channelname_text", this.labels.modal_channelname_text);
		this.channelSettingsModalMarkup = 	this.channelSettingsModalMarkup.replace("REPLACE_modal_colorpicker1_text", this.labels.modal_colorpicker1_text);
		this.channelSettingsModalMarkup = 	this.channelSettingsModalMarkup.replace("REPLACE_btn_save_text", this.labels.btn_save_text);
	}
	
	onContextMenu (context) {
		if (!context.querySelector(".localchannelsettings-item")) {
			var info = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"channel"});
			
			if (info && BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"displayName", "value":"ChannelInviteCreateGroup"})) {
				$(context).append(this.channelContextEntryMarkup)
					.on("mouseenter", ".localchannelsettings-item", (e) => {
						this.createContextSubMenu(info, e);
					})
					.on("mouseleave", ".localchannelsettings-item", () => {
						this.deleteContextSubMenu();
					});
			}
		}
	}
	
	createContextSubMenu (info, e) {
		var id = info.id;
		
		var targetDiv = e.currentTarget;
		var channelContextSubMenu = $(this.channelContextSubMenuMarkup);
		
		$(targetDiv).append(channelContextSubMenu)
			.off("click", ".channelsettings-item")
			.on("click", ".channelsettings-item", () => {
				this.showChannelSettings(info);
			});
			
		$(channelContextSubMenu)
			.addClass(BDfunctionsDevilBro.getDiscordTheme())
			.css("left", $(targetDiv).offset().left + "px")
			.css("top", $(targetDiv).offset().top + "px");
			
		if (BDfunctionsDevilBro.loadData(id, this.getName(), "channels")) {
			$(targetDiv)
				.off("click", ".resetsettings-item")
				.on("click", ".resetsettings-item", () => {
					this.removeChannelData(info.id);
				});
		}
		else {
			$(targetDiv).find(".resetsettings-item").addClass("disabled");
		}
	}
	
	deleteContextSubMenu () {
		$(".editchannels-submenu").remove();
	}
	
	showChannelSettings (info) {
		$(".context-menu").hide();
		
		var id = info.id;
		
		var data = BDfunctionsDevilBro.loadData(id, this.getName(), "channels");
		
		var name = data ? data.name : null;
		var color = data ? data.color : null;
		
		var channelDiv = BDfunctionsDevilBro.getDivOfChannel(id);
		
		var channelSettingsModal = $(this.channelSettingsModalMarkup);
		channelSettingsModal.find(".guildName-1u0hy7").text(info.name);
		channelSettingsModal.find("#input-channelname").val(name);
		channelSettingsModal.find("#input-channelname").attr("placeholder", info.name);
		BDfunctionsDevilBro.setColorSwatches(color, channelSettingsModal.find(".swatches1"), "swatch1");
		BDfunctionsDevilBro.appendModal(channelSettingsModal);
		channelSettingsModal
			.on("click", ".btn-save", (event) => {
				event.preventDefault();
				
				name = null;
				if (channelSettingsModal.find("#input-channelname").val()) {
					if (channelSettingsModal.find("#input-channelname").val().trim().length > 0) {
						name = channelSettingsModal.find("#input-channelname").val().trim();
					}
				}
				
				color = BDfunctionsDevilBro.getSwatchColor("swatch1");
				if (color) {
					if (color[0] < 30 && color[1] < 30 && color[2] < 30) BDfunctionsDevilBro.colorCHANGE(color, 30);
					else if (color[0] > 225 && color[1] > 225 && color[2] > 225) BDfunctionsDevilBro.colorCHANGE(color, -30);
				}
				
				if (name == null && color == null) {
					this.removeChannelData(info.id);
				}
				else {
					BDfunctionsDevilBro.saveData(id, {id,name,color}, this.getName(), "channels");
					this.loadChannel(channelDiv);
					this.changeChannelHeader();
				}
			});
			
		channelSettingsModal.find("#input-channelname").focus();
	}
	
	removeChannelData (id) {
		$(".context-menu").hide();
		
		this.resetChannel(BDfunctionsDevilBro.getDivOfChannel(id));
		
		BDfunctionsDevilBro.removeData(id, this.getName(), "channels");
		
		this.changeChannelHeader();
	}
	
	resetChannel (channelDiv) {
		var info = BDfunctionsDevilBro.getKeyInformation({"node":channelDiv, "key":"channel"});
		if (info) {
			var channel = channelDiv.querySelector(".name-2SL4ev");
		
			$(channelDiv)
				.removeAttr("custom-editchannels");
			$(channel)
				.text(info.name)
				.css("color", "");
		}
	}
	
	loadChannel (channelDiv) {
		var info = BDfunctionsDevilBro.getKeyInformation({"node":channelDiv, "key":"channel"});
		if (info) {
			var channel = channelDiv.querySelector(".name-2SL4ev");
			var data = BDfunctionsDevilBro.loadData(info.id, this.getName(), "channels");
			if (data) {
				var name = data.name ? data.name : info.name;
				var color = data.color ? this.chooseColor(channel, data.color) : "";
				
				$(channelDiv)
					.attr("custom-editchannels", true);
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
	
	changeChannelHeader () {
		if (this.getSettings().changeInChannelHeader && BDfunctionsDevilBro.getSelectedServer()) {
			var channelHeader = document.querySelector("div.titleText-2IfpkV");
			if (!channelHeader) return;
			var info = BDfunctionsDevilBro.getKeyInformation({"node":channelHeader,"key":"channel"});
			if (info) {
				var data = BDfunctionsDevilBro.loadData(info.id, this.getName(), "channels");
				var channel = channelHeader.querySelector(".channelName-1G03vu");
				var name = data && data.name ? data.name : info.name;
				var color = data && data.color ? BDfunctionsDevilBro.color2RGB(data.color) : "";
				this.setChannelHeader(channel, name);
				$(channel).css("color", color);
				
				if (data && (data.name || data.color)) {
					$(channelHeader).attr("custom-editchannelsheader", true);
				}
				else {
					$(channelHeader).removeAttr("custom-editchannelsheader");
				}
			}
		}
	}
	
	setChannelHeader (div, name) {
		return $(div).contents().filter(function() {
			return this.nodeType == Node.TEXT_NODE;
		})[0].textContent = name;
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
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "da": 		//danish
				return {
					context_localchannelsettings_text: 		"Lokal kanalindstillinger",
					submenu_channelsettings_text: 			"Skift indstillinger",
					submenu_resetsettings_text: 			"Nulstil kanal",
					modal_header_text:						"Lokal kanalindstillinger",
					modal_channelname_text:					"Lokalt kanalnavn",
					modal_colorpicker1_text:				"Lokal kanalfarve",
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
					modal_colorpicker1_text:				"Lokale Kanalfarbe",
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
					modal_colorpicker1_text:				"Color local del canal",
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
					modal_colorpicker1_text:				"Couleur locale de la chaîne",
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
					modal_colorpicker1_text:				"Colore locale canale",
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
					modal_colorpicker1_text:				"Lokale kanaalkleur",
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
					modal_colorpicker1_text:				"Lokal kanalfarge",
					btn_cancel_text:						"Avbryte",
					btn_save_text:							"Lagre"
				};
			case "pl":		//polish
				return {
					context_localchannelsettings_text:		"Lokalne ustawienia kanału",
                    submenu_channelsettings_text:			"Zmień ustawienia",
                    submenu_resetsettings_text:				"Resetuj ustawienia",
                    modal_header_text:						"Lokalne ustawienia kanału",
                    modal_channelname_text:					"Lokalna nazwa kanału",
                    modal_colorpicker1_text:				"Lokalny kolor kanału",
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
					modal_colorpicker1_text:				"Cor local do canal",
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
					modal_colorpicker1_text:				"Paikallinen kanavanväri",
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
					modal_colorpicker1_text:				"Lokal kanalfärg",
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
					modal_colorpicker1_text:				"Yerel Kanal Rengi",
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
					modal_colorpicker1_text:				"Místní barvy kanálu",
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
					modal_colorpicker1_text:				"Локален цветен канал",
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
					modal_colorpicker1_text:				"Цвет локального канала",
					btn_cancel_text:						"Отмена",
					btn_save_text:							"Cпасти"
				};
			case "uk":		//ukrainian
				return {
					context_localchannelsettings_text: 		"Налаштування локального каналу",
					submenu_channelsettings_text: 			"Змінити налаштування",
					submenu_resetsettings_text: 			"Скидання каналу",
					modal_header_text:						"Налаштування локального каналу",
					modal_channelname_text:					"Локальне ім'я каналу",
					modal_colorpicker1_text:				"Колір місцевого каналу",
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
					modal_colorpicker1_text:				"ローカルチャネルの色",
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
					modal_colorpicker1_text:				"本地頻道顏色",
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
					modal_colorpicker1_text:				"지역 채널 색깔",
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
					modal_colorpicker1_text:				"Local Channelcolor",
					btn_cancel_text:						"Cancel",
					btn_save_text:							"Save"
				};
		}
	}
}
