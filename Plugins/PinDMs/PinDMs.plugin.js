//META{"name":"PinDMs"}*//

class PinDMs {
	constructor () {
		this.pinDMEntryMarkup =
			`<div class="item-1XYaYf pindm-item">
				<span>REPLACE_context_pindm_text</span>
				<div class="hint-3TJykr"></div>
			</div>`;
			
		this.pinDMsHeaderMarkup =
			`<header class="pinneddms-header">REPLACE_header_pinneddms_text</header>`;
			
		this.pinnedDMMarkup =
			`<div class="channel private pinned" style="height: 42px; opacity: 1;">
				<a>
					<div class="avatar-small stop-animation">
						<div class="status"></div>
					</div>
					<div class="channel-name">
						<label></label>
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO channel-activity" style="flex: 1 1 auto;">
							<div class="channel-activity-text"></div>
						</div>
					</div>
					<button class="close"></button>
				</a>
			</div>`;
		
		this.richActivityMarkup = 
			`<svg name="RichActivity" class="channel-activity-icon" width="16" height="16" viewBox="0 0 16 16">
				<path class="channel-activity-icon-foreground" fill="currentColor" d="M6,7 L2,7 L2,6 L6,6 L6,7 Z M8,5 L2,5 L2,4 L8,4 L8,5 Z M8,3 L2,3 L2,2 L8,2 L8,3 Z M8.88888889,0 L1.11111111,0 C0.494444444,0 0,0.494444444 0,1.11111111 L0,8.88888889 C0,9.50253861 0.497461389,10 1.11111111,10 L8.88888889,10 C9.50253861,10 10,9.50253861 10,8.88888889 L10,1.11111111 C10,0.494444444 9.5,0 8.88888889,0 Z" transform="translate(3 3)"></path>
			</svg>`;
	}

	getName () {return "PinDMs";}

	getDescription () {return "Allows you to pin DMs, making them appear at the top of your DM-list.";}

	getVersion () {return "1.0.3";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
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
			
			this.languageStrings = BDfunctionsDevilBro.getLanguageTable();
			this.englishStrings = BDfunctionsDevilBro.getLanguageTable("en-US");
			
			this.UserStore = BDfunctionsDevilBro.WebModules.findByProperties(["getUsers", "getUser"]);
			this.ActivityStore = BDfunctionsDevilBro.WebModules.findByProperties(["getStatuses", "getActivities"]);
			this.ChannelUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getDMFromUserId"]);
			this.ChannelSwitchUtils = BDfunctionsDevilBro.WebModules.findByProperties(["selectPrivateChannel"]);
			this.UserContextMenuUtils = BDfunctionsDevilBro.WebModules.findByProperties(["openUserContextMenu"]);
			
			var observer = null;
			
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
			BDfunctionsDevilBro.addObserver(this, ".appMount-14L89u", {name:"dmContextObserver",instance:observer}, {childList: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.classList && node.classList.contains("btn-friends")) {
									$(".channel.private.pinned, header.pinneddms-header").remove();
									this.addAllPinnedDMs();
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".private-channels .scroller-fzNley", {name:"friendButtonObserver",instance:observer}, {childList: true});
			
			setTimeout(() => {this.onSwitch();},1000);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			$(".channel.private.pinned, header.pinneddms-header").remove();
			
			clearInterval(this.statusInterval);
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (!document.querySelector(".active .friends-icon") || document.querySelector(".channel.private.pinned")) return;
		
		this.addAllPinnedDMs();
		
		BDfunctionsDevilBro.addObserver(this, ".private-channels .scroller-fzNley", {name:"friendButtonObserver"}, {childList: true});
	}
	
	// begin of own functions
	
	changeLanguageStrings () {
		this.pinDMsHeaderMarkup = 	this.pinDMsHeaderMarkup.replace("REPLACE_header_pinneddms_text", this.labels.header_pinneddms_text);
		
		this.pinDMEntryMarkup = 	this.pinDMEntryMarkup.replace("REPLACE_context_pindm_text", this.labels.context_pindm_text);
	}
	
	onContextMenu (context) {
		if (!document.querySelector(".active .friends-icon") || !context || !context.tagName || !context.parentElement || context.querySelector(".pindm-item")) return;
		var info = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"user"}), ele = null;
		if (info && BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"handleClose"})) {
			ele = context.querySelectorAll(".item-1XYaYf")[3];
		}
		/* else {
			info = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"channel"});
			if (info && BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"handleChangeIcon"})) {
				ele = context.querySelectorAll(".item-1XYaYf")[1];
			}
		} */
		if (ele) {
			$(this.pinDMEntryMarkup).insertBefore(ele)
				.on("click", (e) => {
					$(context).hide();
					var pinnedDMs = BDfunctionsDevilBro.loadAllData(this, "pinnedDMs");
					if (typeof pinnedDMs[info.id] == "undefined") {
						var pos = Object.keys(pinnedDMs).length;
						pinnedDMs[info.id] = pos;
						BDfunctionsDevilBro.saveAllData(pinnedDMs, this, "pinnedDMs")
						this.addPinnedDM(info.id, pos); 
					}
				});
				
			BDfunctionsDevilBro.updateContextPosition(context);
		}
	}
	
	addAllPinnedDMs () {
		var pinnedDMs = BDfunctionsDevilBro.loadAllData(this, "pinnedDMs");
		var sortedDMs = [];
		for (let id in pinnedDMs) sortedDMs[pinnedDMs[id]] = id;
		for (let pos in sortedDMs.reverse()) {
			this.addPinnedDM(sortedDMs[pos], pos);
		}
	}
	
	addPinnedDM (id, pos) {
		if (!document.querySelector(".channel.btn-friends + header.pinneddms-header")) {
			$(this.pinDMsHeaderMarkup).insertBefore(".channel.btn-friends + header");
			this.startUpdateInterval();
		}
		let user = this.UserStore.getUser(id);
		if (user) {
			let pinnedDM = $(this.pinnedDMMarkup);
			pinnedDM.attr("user-id", user.id).insertAfter(".channel.btn-friends + header.pinneddms-header")
				.on("contextmenu." + this.getName(), (e) => {
					let DMid = this.ChannelUtils.getDMFromUserId(user.id);
					if (DMid) this.UserContextMenuUtils.openUserContextMenu(e, user, this.ChannelUtils.getChannel(DMid));
					else BDfunctionsDevilBro.showToast("Could not open ContextMenu, make sure the DM exists.", {type:"error"});
				})
				.on("click." + this.getName(), (e) => {
					if (e.target.classList && e.target.classList.contains("close")) return;
					let DMid = this.ChannelUtils.getDMFromUserId(user.id);
					if (DMid) this.ChannelSwitchUtils.selectPrivateChannel(DMid);
					else BDfunctionsDevilBro.showToast("Could not open DM, make sure it exists.", {type:"error"});
				})
				.on("click." + this.getName(), ".close", () => {
					pinnedDM.remove();
					BDfunctionsDevilBro.removeData(user.id, this, "pinnedDMs");
					this.updatePinnedDMPositions();
				});
				
			this.setPinnedDM(pinnedDM[0]);
		}
	}
	
	setPinnedDM (pinnedDM) {
		if (pinnedDM && pinnedDM.parentElement) {
			let user = this.UserStore.getUser(pinnedDM.getAttribute("user-id"));
			if (user) {
				let data = BDfunctionsDevilBro.loadData(user.id, "EditUsers", "users") || {};
				let activity = this.ActivityStore.getActivity(user.id);
				pinnedDM.querySelector(".avatar-small").style.backgroundImage = `${data.removeIcon ? `` : (data.url ? `url(${data.url})` : `url(${BDfunctionsDevilBro.getUserAvatar(user.id)})`)}`;
				pinnedDM.querySelector(".status").className = `status status-${BDfunctionsDevilBro.getUserStatus(user.id)}`;
				pinnedDM.querySelector(".channel-name > label").textContent = data.name ? data.name : user.username;
				pinnedDM.querySelector(".channel-name").style.color = data.color1 ? BDfunctionsDevilBro.color2RGB(data.color1) : "";
				pinnedDM.querySelector(".channel-name").style.background = data.color2 ? BDfunctionsDevilBro.color2RGB(data.color2) : "";
				pinnedDM.querySelector(".channel-activity-text").innerHTML = activity ? this.getActivityString(activity.type, activity.name) : "";
				if (activity && activity.application_id && activity.session_id) {
					if (!pinnedDM.querySelector(".channel-activity-icon")) $(".channel-activity", pinnedDM).append(this.richActivityMarkup);
				}
				else $(".channel-activity-icon", pinnedDM).remove();
			}
		}
	}
	
	startUpdateInterval () {
		this.statusInterval = setInterval(() => {
			for (let pinnedDM of document.querySelectorAll(".channel.private.pinned")) this.setPinnedDM(pinnedDM);
			if (!document.querySelector(".channel.btn-friends + header.pinneddms-header")) clearInterval(this.statusInterval); 
		},10000);
	}
	
	getActivityString (type, name) {
		let stringname = "";
		switch (type) {
			case 0:
				stringname = "PLAYING_GAME";
				break;
			case 1:
				stringname = "STREAMING";
				break;
			case 2:
				stringname = "LISTENING_TO";
				break;
			case 3:
				stringname = "WATCHING";
				break;
		}
		
		let string = stringname ? (this.languageStrings[stringname] ? this.languageStrings[stringname] : this.englishStrings[stringname]) : "";
		
		return string.replace("**!!{name}!!**", `<strong>${name}</strong>`).replace("**!!{game}!!**", `<strong>${name}</strong>`);
	}
	
	updatePinnedDMPositions () {
		let pinnedDMs = BDfunctionsDevilBro.loadAllData(this, "pinnedDMs");
		let pinnedDMEles = document.querySelectorAll(".channel.private.pinned");
		for (let i = 0; i < pinnedDMEles.length; i++) {
			pinnedDMs[pinnedDMEles[i].id] = i;
		}
		if (pinnedDMEles.length == 0) $(".channel.btn-friends + header.pinneddms-header").remove();
		BDfunctionsDevilBro.saveAllData(pinnedDMs, this, "pinnedDMs")
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					context_pindm_text:				"Prikljucite Izravnu Dopisivanje",
					header_pinneddms_text:			"Prikvačene izravne poruke"
				};
			case "da":		//danish
				return {
					context_pindm_text:				"Pin DB",
					header_pinneddms_text:			"Pinned Privat Beskeder"
				};
			case "de":		//german
				return {
					context_pindm_text:				"Direktnachricht anpinnen",
					header_pinneddms_text:			"Gepinnte Direktnachrichten"
				};
			case "es":		//spanish
				return {
					context_pindm_text:				"Pin MD",
					header_pinneddms_text:			"Mensajes Directos Fijados"
				};
			case "fr":		//french
				return {
					context_pindm_text:				"Épingler MP",
					header_pinneddms_text:			"Messages Prives Épinglés"
				};
			case "it":		//italian
				return {
					context_pindm_text:				"Appuntare il messaggio diretto",
					header_pinneddms_text:			"Messaggi Diretti Aggiunti"
				};
			case "nl":		//dutch
				return {
					context_pindm_text:				"PB vastpinnen",
					header_pinneddms_text:			"Vastgezette Persoonluke Berichten"
				};
			case "no":		//norwegian
				return {
					context_pindm_text:				"Pinne DM",
					header_pinneddms_text:			"Pinned Direktemeldinger"
				};
			case "pl":		//polish
				return {
					context_pindm_text:				"Przypnij PW",
					header_pinneddms_text:			"Prywatne Wiadomości Bezpośrednie"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_pindm_text:				"Fixar MD",
					header_pinneddms_text:			"Mensagens diretas fixadas"
				};
			case "fi":		//finnish
				return {
					context_pindm_text:				"Kiinnitä yksityisviestit",
					header_pinneddms_text:			"Liitetyt yksityisviestit"
				};
			case "sv":		//swedish
				return {
					context_pindm_text:				"Peka DM",
					header_pinneddms_text:			"Inlagda Direktmeddelanden"
				};
			case "tr":		//turkish
				return {
					context_pindm_text:				"DM'yi Sabitle",
					header_pinneddms_text:			"Direkt Mesajlar Sabitleyin"
				};
			case "cs":		//czech
				return {
					context_pindm_text:				"Připojte PZ",
					header_pinneddms_text:			"Připojené přímá zpráva"
				};
			case "bg":		//bulgarian
				return {
					context_pindm_text:				"Закачете",
					header_pinneddms_text:			"Свързани директни съобщения"
				};
			case "ru":		//russian
				return {
					context_pindm_text:				"Подключить ЛС",
					header_pinneddms_text:			"Прикрепленные Личные сообщения"
				};
			case "uk":		//ukrainian
				return {
					context_pindm_text:				"Прикріпити ОП",
					header_pinneddms_text:			"Прикріплені oсобисті повідомлення"
				};
			case "ja":		//japanese
				return {
					context_pindm_text:				"DMをピン留めする",
					header_pinneddms_text:			"固定された直接メッセージ"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_pindm_text:				"引用私人信息",
					header_pinneddms_text:			"固定私人信息"
				};
			case "ko":		//korean
				return {
					context_pindm_text:				"개인 메시지 비공개",
					header_pinneddms_text:			"고정 된 비공개 메시지"
				};
			default:		//default: english
				return {
					context_pindm_text:				"Pin DM",
					header_pinneddms_text:			"Pinned Direct Messages"
				};
		}
	}
}
