//META{"name":"EditChannels"}*//

class EditChannels {
	constructor () {
		this.labels = {};
		
		this.channelContextEntryMarkup =
			`<div class="itemGroup-oViAgA">
				<div class="item-1XYaYf localchannelsettings-item itemSubMenu-3ZgIw-">
					<span>REPLACE_context_localchannelsettings_text</span>
					<div class="hint-3TJykr"></div>
				</div>
			</div>`;
			
		this.channelContextSubMenuMarkup = 
			`<div class="contextMenu-uoJTbz editchannels-submenu">
				<div class="itemGroup-oViAgA">
					<div class="item-1XYaYf channelsettings-item">
						<span>REPLACE_submenu_channelsettings_text</span>
						<div class="hint-3TJykr"></div>
					</div>
					<div class="item-1XYaYf resetsettings-item disabled-dlOjhg">
						<span>REPLACE_submenu_resetsettings_text</span>
						<div class="hint-3TJykr"></div>
					</div>
				</div>
			</div>`;

		this.channelSettingsModalMarkup =
			`<span class="editchannels-modal DevilBro-modal">
				<div class="backdrop-2ohBEd"></div>
				<div class="modal-2LIEKY">
					<div class="inner-1_1f7b">
						<div class="modal-3HOjGZ sizeMedium-1-2BNS">
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
							<div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW">
								<div class="scroller-fzNley inner-tqJwAU">
									<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 1 1 auto;">
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_channelname_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_" id="input-channelname"></div>
										</div>
										<div class="divider-1G01Z9 dividerDefault-77PXsz marginTop20-3UscxH"></div>
									</div>
									<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 1 1 auto;">
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_colorpicker1_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="swatches1"></div>
										</div>
									</div>
								</div>
							</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw">
								<button type="button" class="btn-save button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u">
									<div class="contents-4L4hQM">REPLACE_btn_save_text</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;
			
		this.defaults = {
			settings: {
				changeInChannelHeader:	{value:true, 	description:"Change in Channel Header."}
			}
		};
	}

	getName () {return "EditChannels";}

	getDescription () {return "Allows you to rename and recolor channelnames.";}

	getVersion () {return "3.7.3";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settings = BDfunctionsDevilBro.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Reset all Channels.</h3><button type="button" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorRed-3HTNPV sizeMedium-2VGNaF grow-25YQ8u reset-button" style="flex: 0 0 auto;"><div class="contents-4L4hQM">Reset</div></button></div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);})
			.on("click", ".reset-button", () => {this.resetAll();});
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
						if (change.attributeName == "class" && $(change.target).attr("class").indexOf("wrapper") > -1 && $("[custom-editchannels]").has(change.target)[0]) {
							let info = BDfunctionsDevilBro.getKeyInformation({"node":change.target, "key":"channel"});
							if (info) this.loadChannel(BDfunctionsDevilBro.getDivOfChannel(info.id));
						}
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.classList && (node.classList.contains("containerDefault-7RImuF") || node.classList.contains("containerDefault-1bbItS"))) {
									let info = BDfunctionsDevilBro.getKeyInformation({"node":node, "key":"channel"});
									if (info) this.loadChannel(BDfunctionsDevilBro.getDivOfChannel(info.id));
								}
								if (node && node.className && node.className.length > 0 && node.className.indexOf("container-") > -1) {
									for (let channel of node.querySelectorAll(".containerDefault-7RImuF, .containerDefault-1bbItS")) {
										let info = BDfunctionsDevilBro.getKeyInformation({"node":channel, "key":"channel"});
										if (info) this.loadChannel(BDfunctionsDevilBro.getDivOfChannel(info.id));
									}
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".channels-3g2vYe", {name:"channelListObserver",instance:observer}, {childList: true, attributes:true, subtree: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.nodeType == 1 && node.className.includes("contextMenu-uoJTbz")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".appMount-14L89u", {name:"channelContextObserver",instance:observer}, {childList: true});
			
			this.loadAllChannels();
			
			this.changeChannelHeader();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.resetAllChannels();
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			$(".titleText-2IfpkV[custom-editchannelsheader]").find(".channelName-1G03vu.private-38vo6h").css("color", "").css("background-color", "").parent().removeAttr("custom-editchannelsheader");
			this.loadAllChannels();
			setImmediate(() => {this.changeChannelHeader();}); //setImmediate so EditChannels sets the color after EditUsers set it back to white
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

	resetAll () {
		if (confirm("Are you sure you want to reset all channels?")) {
			BDfunctionsDevilBro.removeAllData(this, "channels");
			
			this.resetAllChannels();
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
		if (!context || !context.tagName || !context.parentElement || context.querySelector(".localchannelsettings-item")) return;
		var info = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"channel"});
		if (info && BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"displayName", "value":"ChannelDeleteGroup"})) {
			$(context).append(this.channelContextEntryMarkup)
				.on("mouseenter", ".localchannelsettings-item", (e) => {
					this.createContextSubMenu(info, e, context);
				});
				
			BDfunctionsDevilBro.updateContextPosition(context);
		}
	}
	
	createContextSubMenu (info, e, context) {
		var channelContextSubMenu = $(this.channelContextSubMenuMarkup);
			
		channelContextSubMenu
			.on("click", ".channelsettings-item", () => {
				$(context).hide();
				this.showChannelSettings(info);
			});
			
		if (BDfunctionsDevilBro.loadData(info.id, this, "channels")) {
			channelContextSubMenu
				.find(".resetsettings-item")
				.removeClass("disabled").removeClass("disabled-dlOjhg")
				.on("click", () => {
					$(context).hide();
					this.removeChannelData(info);
				});
		}
		
		BDfunctionsDevilBro.appendSubMenu(e.currentTarget, channelContextSubMenu);
	}
	
	showChannelSettings (info) {
		var channelObj = BDfunctionsDevilBro.getDivOfChannel(info.id);
		
		var data = BDfunctionsDevilBro.loadData(info.id, this, "channels");
		
		var name = data ? data.name : null;
		var color = data ? data.color : null;
		
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
					BDfunctionsDevilBro.saveData(info.id, {name,color}, this, "channels");
					this.loadChannel(channelObj);
					this.changeChannelHeader();
				}
			});
			
		channelSettingsModal.find("#input-channelname").focus();
	}
	
	removeChannelData (info) {
		this.resetChannel(BDfunctionsDevilBro.getDivOfChannel(info.id));
		
		BDfunctionsDevilBro.removeData(info.id, this, "channels");
		
		this.changeChannelHeader();
	}
	
	resetChannel (channelObj) {
		if (!channelObj || !channelObj.div) return;
		
		var channel = channelObj.div.querySelector(".name-2SL4ev, .colorTransition-2iZaYd");
	
		$(channelObj.div)
			.removeAttr("custom-editchannels");
		$(channel)
			.css("color", "");
			
		BDfunctionsDevilBro.setInnerText(channel, channelObj.name);
	}
	
	loadChannel (channelObj) {
		if (!channelObj || !channelObj.div) return;
		
		var channel = channelObj.div.querySelector(".name-2SL4ev, .colorTransition-2iZaYd");
		
		var data = BDfunctionsDevilBro.loadData(channelObj.id, this, "channels");
		if (data) {
			var name = data.name ? data.name : channelObj.name;
			var color = data.color ? this.chooseColor(channel, data.color) : "";
			
			$(channelObj.div)
				.attr("custom-editchannels", true);
			$(channel)
				.css("color", color);
				
			BDfunctionsDevilBro.setInnerText(channel, name);
		}
	}
	
	loadAllChannels () {
		for (let channelObj of BDfunctionsDevilBro.readChannelList()) {
			this.loadChannel(channelObj);
		}
	}
	
	changeChannelHeader () {
		if (BDfunctionsDevilBro.getData("changeInChannelHeader", this, "settings")) {
			var channelHeader = document.querySelector(".title-qAcLxz .titleText-2IfpkV");
			if (!channelHeader) return;
			var channel = channelHeader.querySelector(".channelName-1G03vu:not(.private-38vo6h)");
			if (!channel) return;
			var info = BDfunctionsDevilBro.getKeyInformation({"node":channelHeader,"key":"channel"});
			if (info) {
				var data = BDfunctionsDevilBro.loadData(info.id, this, "channels");
				var name = data && data.name ? data.name : info.name;
				var color = data && data.color ? BDfunctionsDevilBro.color2RGB(data.color) : "";
				BDfunctionsDevilBro.setInnerText(channel, name);
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
	
	resetAllChannels () {
		document.querySelectorAll("[custom-editchannels]").forEach(channelDiv => {
			var info = BDfunctionsDevilBro.getKeyInformation({"node":channelDiv, "key":"channel"});
			if (info) this.resetChannel({div:channelDiv,info});
		});
			
		var channelHeader = document.querySelector("[custom-editchannelsheader]");
		if (channelHeader) {
			var info = BDfunctionsDevilBro.getKeyInformation({"node":channelHeader, "key":"channel"});
			if (info) {
				var channel = channelHeader.querySelector(".channelName-1G03vu");
				BDfunctionsDevilBro.setInnerText(channel, info.name);
				$(channel).css("color", "");
				$(channelHeader).removeAttr("custom-editchannelsheader");
			}
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
			if (channel.className.indexOf("nameSelected") > -1 || channel.className.indexOf("nameHovered") > -1 || channel.className.indexOf("nameUnread") > -1) {
				color = BDfunctionsDevilBro.colorCHANGE(color, 50);
			}
			return BDfunctionsDevilBro.color2RGB(color);
		}
		return null;
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					context_localchannelsettings_text:		"Postavke lokalnih kanala",
					submenu_channelsettings_text:			"Promijeni postavke",
					submenu_resetsettings_text:				"Vraćanje kanala",
					modal_header_text:						"Postavke lokalnih kanala",
					modal_channelname_text:					"Naziv lokalnog kanala",
					modal_colorpicker1_text:				"Boja lokalnog kanala",
					btn_cancel_text:						"Prekid",
					btn_save_text:							"Uštedjeti"
				};
			case "da":		//danish
				return {
					context_localchannelsettings_text:		"Lokal kanalindstillinger",
					submenu_channelsettings_text:			"Skift indstillinger",
					submenu_resetsettings_text:				"Nulstil kanal",
					modal_header_text:						"Lokal kanalindstillinger",
					modal_channelname_text:					"Lokalt kanalnavn",
					modal_colorpicker1_text:				"Lokal kanalfarve",
					btn_cancel_text:						"Afbryde",
					btn_save_text:							"Spare"
				};
			case "de":		//german
				return {
					context_localchannelsettings_text:		"Lokale Kanaleinstellungen",
					submenu_channelsettings_text:			"Einstellungen ändern",
					submenu_resetsettings_text:				"Kanal zurücksetzen",
					modal_header_text:						"Lokale Kanaleinstellungen",
					modal_channelname_text:					"Lokaler Kanalname",
					modal_colorpicker1_text:				"Lokale Kanalfarbe",
					btn_cancel_text:						"Abbrechen",
					btn_save_text:							"Speichern"
				};
			case "es":		//spanish
				return {
					context_localchannelsettings_text:		"Ajustes local de canal",
					submenu_channelsettings_text:			"Cambiar ajustes",
					submenu_resetsettings_text:				"Restablecer canal",
					modal_header_text:						"Ajustes local de canal",
					modal_channelname_text:					"Nombre local del canal",
					modal_colorpicker1_text:				"Color local del canal",
					btn_cancel_text:						"Cancelar",
					btn_save_text:							"Guardar"
				};
			case "fr":		//french
				return {
					context_localchannelsettings_text:		"Paramètres locale du canal",
					submenu_channelsettings_text:			"Modifier les paramètres",
					submenu_resetsettings_text:				"Réinitialiser le canal",
					modal_header_text:						"Paramètres locale du canal",
					modal_channelname_text:					"Nom local du canal",
					modal_colorpicker1_text:				"Couleur locale de la chaîne",
					btn_cancel_text:						"Abandonner",
					btn_save_text:							"Enregistrer"
				};
			case "it":		//italian
				return {
					context_localchannelsettings_text:		"Impostazioni locale canale",
					submenu_channelsettings_text:			"Cambia impostazioni",
					submenu_resetsettings_text:				"Ripristina canale",
					modal_header_text:						"Impostazioni locale canale",
					modal_channelname_text:					"Nome locale canale",
					modal_colorpicker1_text:				"Colore locale canale",
					btn_cancel_text:						"Cancellare",
					btn_save_text:							"Salvare"
				};
			case "nl":		//dutch
				return {
					context_localchannelsettings_text:		"Lokale kanaalinstellingen",
					submenu_channelsettings_text:			"Verandere instellingen",
					submenu_resetsettings_text:				"Reset kanaal",
					modal_header_text:						"Lokale kanaalinstellingen",
					modal_channelname_text:					"Lokale kanaalnaam",
					modal_colorpicker1_text:				"Lokale kanaalkleur",
					btn_cancel_text:						"Afbreken",
					btn_save_text:							"Opslaan"
				};
			case "no":		//norwegian
				return {
					context_localchannelsettings_text:		"Lokal kanalinnstillinger",
					submenu_channelsettings_text:			"Endre innstillinger",
					submenu_resetsettings_text:				"Tilbakestill kanal",
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
			case "pt-BR":	//portuguese (brazil)
				return {
					context_localchannelsettings_text:		"Configurações local do canal",
					submenu_channelsettings_text:			"Mudar configurações",
					submenu_resetsettings_text:				"Redefinir canal",
					modal_header_text:						"Configurações local do canal",
					modal_channelname_text:					"Nome local do canal",
					modal_colorpicker1_text:				"Cor local do canal",
					btn_cancel_text:						"Cancelar",
					btn_save_text:							"Salvar"
				};
			case "fi":		//finnish
				return {
					context_localchannelsettings_text:		"Paikallinen kanavan asetukset",
					submenu_channelsettings_text:			"Vaihda asetuksia",
					submenu_resetsettings_text:				"Nollaa kanava",
					modal_header_text:						"Paikallinen kanavan asetukset",
					modal_channelname_text:					"Paikallinen kanavanimi",
					modal_colorpicker1_text:				"Paikallinen kanavanväri",
					btn_cancel_text:						"Peruuttaa",
					btn_save_text:							"Tallentaa"
				};
			case "sv":		//swedish
				return {
					context_localchannelsettings_text:		"Lokal kanalinställningar",
					submenu_channelsettings_text:			"Ändra inställningar",
					submenu_resetsettings_text:				"Återställ kanal",
					modal_header_text:						"Lokal kanalinställningar",
					modal_channelname_text:					"Lokalt kanalnamn",
					modal_colorpicker1_text:				"Lokal kanalfärg",
					btn_cancel_text:						"Avbryta",
					btn_save_text:							"Spara"
				};
			case "tr":		//turkish
				return {
					context_localchannelsettings_text:		"Yerel Kanal Ayarları",
					submenu_channelsettings_text:			"Ayarları Değiştir",
					submenu_resetsettings_text:				"Kanal Sıfırla",
					modal_header_text:						"Yerel Kanal Ayarları",
					modal_channelname_text:					"Yerel Kanal Adı",
					modal_colorpicker1_text:				"Yerel Kanal Rengi",
					btn_cancel_text:						"Iptal",
					btn_save_text:							"Kayıt"
				};
			case "cs":		//czech
				return {
					context_localchannelsettings_text:		"Místní nastavení kanálu",
					submenu_channelsettings_text:			"Změnit nastavení",
					submenu_resetsettings_text:				"Obnovit kanál",
					modal_header_text:						"Místní nastavení kanálu",
					modal_channelname_text:					"Místní název kanálu",
					modal_colorpicker1_text:				"Místní barvy kanálu",
					btn_cancel_text:						"Zrušení",
					btn_save_text:							"Uložit"
				};
			case "bg":		//bulgarian
				return {
					context_localchannelsettings_text:		"Настройки за локални канали",
					submenu_channelsettings_text:			"Промяна на настройките",
					submenu_resetsettings_text:				"Възстановяване на канал",
					modal_header_text:						"Настройки за локални канали",
					modal_channelname_text:					"Локално име на канал",
					modal_colorpicker1_text:				"Локален цветен канал",
					btn_cancel_text:						"Зъбести",
					btn_save_text:							"Cпасяване"
				};
			case "ru":		//russian
				return {
					context_localchannelsettings_text:		"Настройки локального канала",
					submenu_channelsettings_text:			"Изменить настройки",
					submenu_resetsettings_text:				"Сбросить канал",
					modal_header_text:						"Настройки локального канала",
					modal_channelname_text:					"Имя локального канала",
					modal_colorpicker1_text:				"Цвет локального канала",
					btn_cancel_text:						"Отмена",
					btn_save_text:							"Cпасти"
				};
			case "uk":		//ukrainian
				return {
					context_localchannelsettings_text:		"Налаштування локального каналу",
					submenu_channelsettings_text:			"Змінити налаштування",
					submenu_resetsettings_text:				"Скидання каналу",
					modal_header_text:						"Налаштування локального каналу",
					modal_channelname_text:					"Локальне ім'я каналу",
					modal_colorpicker1_text:				"Колір місцевого каналу",
					btn_cancel_text:						"Скасувати",
					btn_save_text:							"Зберегти"
				};
			case "ja":		//japanese
				return {
					context_localchannelsettings_text:		"ローカルチャネル設定",
					submenu_channelsettings_text:			"設定を変更する",
					submenu_resetsettings_text:				"チャネルをリセットする",
					modal_header_text:						"ローカルチャネル設定",
					modal_channelname_text:					"ローカルチャネル名",
					modal_colorpicker1_text:				"ローカルチャネルの色",
					btn_cancel_text:						"キャンセル",
					btn_save_text:							"セーブ"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_localchannelsettings_text:		"本地頻道設置",
					submenu_channelsettings_text:			"更改設置",
					submenu_resetsettings_text:				"重置通道",
					modal_header_text:						"本地頻道設置",
					modal_channelname_text:					"本地頻道名稱",
					modal_colorpicker1_text:				"本地頻道顏色",
					btn_cancel_text:						"取消",
					btn_save_text:							"保存"
				};
			case "ko":		//korean
				return {
					context_localchannelsettings_text:		"로컬 채널 설정",
					submenu_channelsettings_text:			"설정 변경",
					submenu_resetsettings_text:				"채널 재설정",
					modal_header_text:						"로컬 채널 설정",
					modal_channelname_text:					"로컬 채널 이름",
					modal_colorpicker1_text:				"지역 채널 색깔",
					btn_cancel_text:						"취소",
					btn_save_text:							"저장"
				};
			default:		//default: english
				return {
					context_localchannelsettings_text:		"Local Channelsettings",
					submenu_channelsettings_text:			"Change Settings",
					submenu_resetsettings_text:				"Reset Channel",
					modal_header_text:						"Local Channelsettings",
					modal_channelname_text:					"Local Channelname",
					modal_colorpicker1_text:				"Local Channelcolor",
					btn_cancel_text:						"Cancel",
					btn_save_text:							"Save"
				};
		}
	}
}
