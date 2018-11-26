//META{"name":"PinDMs"}*//

class PinDMs {
	initConstructor () {
		this.pinDMEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitem} pindm-item">
				<span>REPLACE_context_pindm_text</span>
				<div class="${BDFDB.disCN.contextmenuhint}"></div>
			</div>`;
			
		this.unpinDMEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitem} unpindm-item">
				<span>REPLACE_context_unpindm_text</span>
				<div class="${BDFDB.disCN.contextmenuhint}"></div>
			</div>`;
	}

	getName () {return "PinDMs";}

	getDescription () {return "Allows you to pin DMs, making them appear at the top of your DM-list.";}

	getVersion () {return "1.1.7";}

	getAuthor () {return "DevilBro";}

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
			
			this.UserStore = BDFDB.WebModules.findByProperties(["getUsers", "getUser"]);
			this.ActivityModule = BDFDB.WebModules.findByProperties(["getApplicationActivity","getStatus"]);
			this.ChannelStore = BDFDB.WebModules.findByProperties(["getDMFromUserId"]);
			this.ChannelSwitchUtils = BDFDB.WebModules.findByProperties(["selectPrivateChannel"]);
			this.PrivateChannelUtils = BDFDB.WebModules.findByProperties(["openPrivateChannel"]);
			this.UserContextMenuUtils = BDFDB.WebModules.findByProperties(["openUserContextMenu"]);
			
			var observer = null;
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.nodeType == 1 && node.className.includes(BDFDB.disCN.contextmenu)) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.appmount, {name:"dmContextObserver",instance:observer}, {childList: true});
			
			$(BDFDB.dotCN.appmount).on("click." + this.getName(), BDFDB.dotCNS.dmchannels + BDFDB.dotCNS.dmchannel + BDFDB.dotCN.dmchannelclose, (e) => {
				let instance = BDFDB.getReactInstance(e.currentTarget);
				if (instance.return.return.return.return.return.memoizedProps.ispin) {
					e.stopPropagation();
					e.preventDefault();
					let dmsscroller = document.querySelector(BDFDB.dotCNS.dmchannels + BDFDB.dotCN.scroller);
					if (dmsscroller) {
						let channel = instance.return.return.return.return.return.memoizedProps.channel;
						let dms = BDFDB.getReactInstance(dmsscroller).return.return.return.memoizedProps.children;
						this.removePinnedDM(channel.type == 1 ? channel.recipients[0] : channel.id, dms); 
						this.forceUpdateScroller(dmsscroller);
					}
				}
				else setImmediate(() => {this.addAllPinnedDMs();});
			});
			
			setTimeout(() => {this.onSwitch();},1000);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			let dmsscroller = document.querySelector(BDFDB.dotCNS.dmchannels + BDFDB.dotCN.scroller);
			if (dmsscroller) {
				let dms = BDFDB.getReactInstance(dmsscroller).return.return.return.memoizedProps.children;
				let amount = 0;
				let insertpoint = null;
				for (let i in dms) {
					let ele = dms[i];
					if (ele && ele.pinned) {
						delete ele.pinned;
						if (ele.props.ispin) {
							if (ele.type == "header") insertpoint = i;
							amount++;
						}
					}
				}
				dms.splice(insertpoint, amount);
				this.forceUpdateScroller(dmsscroller);
			}
			BDFDB.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (!document.querySelector(BDFDB.dotCNS.guildselected + BDFDB.dotCN.friendsicon) || document.querySelector(BDFDB.dotCN.dmchannel + ".pinned")) return;
		
		this.addAllPinnedDMs();
	}
	
	
	// begin of own functions
	
	changeLanguageStrings () {		
		this.pinDMEntryMarkup = 	this.pinDMEntryMarkup.replace("REPLACE_context_pindm_text", this.labels.context_pindm_text);
		
		this.unpinDMEntryMarkup = 	this.unpinDMEntryMarkup.replace("REPLACE_context_unpindm_text", this.labels.context_unpindm_text);
	}
	
	onContextMenu (context) {
		if (!document.querySelector(BDFDB.dotCNS.guildselected + BDFDB.dotCN.friendsicon) || !context || !context.tagName || !context.parentElement || context.querySelector(".pindm-item") || context.querySelector(".unpindm-item")) return;
		var info = BDFDB.getKeyInformation({"node":context, "key":"user"}), ele = null;
		if (info && BDFDB.getKeyInformation({"node":context, "key":"handleClose"})) {
			ele = context.querySelectorAll(BDFDB.dotCN.contextmenuitem)[3];
		}
		else {
			info = BDFDB.getKeyInformation({"node":context, "key":"channel"});
			if (info && BDFDB.getKeyInformation({"node":context, "key":"handleChangeIcon"})) {
				ele = context.querySelectorAll(BDFDB.dotCN.contextmenuitem)[1];
			}
		}
		if (ele) {
			let pinnedDMs = BDFDB.loadAllData(this, "pinnedDMs");
			if (typeof pinnedDMs[info.id] == "undefined") {
				$(this.pinDMEntryMarkup).insertBefore(ele)
					.on("click", (e) => {
						$(context).hide();
						let dmsscroller = document.querySelector(BDFDB.dotCNS.dmchannels + BDFDB.dotCN.scroller);
						if (dmsscroller) {
							let dms = BDFDB.getReactInstance(dmsscroller).return.return.return.memoizedProps.children;
							let insertpoint = this.getInsertPoint(dms);
							this.addPinnedDM(info.id, dms, insertpoint); 
							this.forceUpdateScroller(dmsscroller);
							pinnedDMs[info.id] = Object.keys(pinnedDMs).length;
							BDFDB.saveAllData(pinnedDMs, this, "pinnedDMs");
						}
					});
			}
			else {
				$(this.unpinDMEntryMarkup).insertBefore(ele)
					.on("click", (e) => {
						$(context).hide();
						let dmsscroller = document.querySelector(BDFDB.dotCNS.dmchannels + BDFDB.dotCN.scroller);
						if (dmsscroller) {
							let dms = BDFDB.getReactInstance(dmsscroller).return.return.return.memoizedProps.children;
							this.removePinnedDM(info.id, dms); 
							this.forceUpdateScroller(dmsscroller);
						}
					});
			}
			
			BDFDB.updateContextPosition(context);
		}
	}
	
	addAllPinnedDMs () {
		let dmsscroller = document.querySelector(BDFDB.dotCNS.dmchannels + BDFDB.dotCN.scroller);
		if (dmsscroller) {
			let dms = BDFDB.getReactInstance(dmsscroller).return.return.return.memoizedProps.children;
			let insertpoint = this.getInsertPoint(dms);
			let sortedDMs = this.sortAndUpdate();
			for (let pos in sortedDMs) this.addPinnedDM(sortedDMs[pos], dms, insertpoint);
			this.forceUpdateScroller(dmsscroller);
		}
	}
	
	getInsertPoint (dms) {
		let insertpoint = null;
		for (let i in dms) {
			let ele = dms[i];
			if (ele && ele.type == "header") {
				insertpoint = i;
				if (!ele.pinned && !ele.props.ispin) {
					ele.pinned = true;
					let headerpin = Object.assign({},ele);
					headerpin.key = "pin" + headerpin.key;
					headerpin.props = {children:this.labels.header_pinneddms_text,ispin:true};
					dms.splice(insertpoint,0,headerpin);
				}
				insertpoint++;
				break;
			}
		}
		return insertpoint;
	}
	
	addPinnedDM (id, dms, insertpoint) {
		id = this.ChannelStore.getDMFromUserId(id) || id;
		for (let ele of dms) {
			if (ele && !ele.pinned && id == ele.key) {
				ele.pinned = true;
				let dmpin = Object.assign({ispin:true},ele);
				dmpin.key = "pin" + ele.key;
				dmpin.props = {channel:ele.props.channel,selected:ele.props.selected,ispin:true};
				dms.splice(insertpoint,0,dmpin);
			}
		}
	}
	
	removePinnedDM (id, dms) {
		BDFDB.removeData(id, this, "pinnedDMs");
		this.sortAndUpdate();
		id = this.ChannelStore.getDMFromUserId(id) || id;
		let removepoint = null;
		for (let i in dms) {
			let ele = dms[i];
			if (ele && ele.pinned && (id == ele.key || ("pin" + id) == ele.key)) {
				delete ele.pinned;
				if (ele.props.ispin) removepoint = i;
			}
		}
		if (removepoint) {
			dms.splice(removepoint,1);
		}
	}
	
	sortAndUpdate () {
		let pinnedDMs = BDFDB.loadAllData(this, "pinnedDMs");
		delete pinnedDMs[""];
		let sortedDMs = [], sortDM = (id) => {
			if (!this.UserStore.getUser(id) && !this.ChannelStore.getChannel(id)) delete pinnedDMs[id];
			else if (typeof sortedDMs[pinnedDMs[id]] == "undefined") sortedDMs[pinnedDMs[id]] = id;
			else sortDM(sortedDMs, pinnedDMs[id]+1, id);
		};
		for (let id in pinnedDMs) sortDM(id);
		sortedDMs = sortedDMs.filter(n => n);
		for (let pos in sortedDMs) pinnedDMs[sortedDMs[pos]] = parseInt(pos);
		BDFDB.saveAllData(pinnedDMs, this, "pinnedDMs");
		return sortedDMs;
	}
	
	forceUpdateScroller (scroller) {
		scroller.scrollTop += 10;
		scroller.scrollTop -= 10;
	}
	
	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					context_pindm_text:				"Prikljucite Izravnu Poruku",
					context_unpindm_text:			"Otključaj Izravnu Poruku",
					header_pinneddms_text:			"Prikvačene Izravne Poruke"
				};
			case "da":		//danish
				return {
					context_pindm_text:				"Fastgør PB",
					context_unpindm_text:			"Frigør PB",
					header_pinneddms_text:			"Pinned Privat Beskeder"
				};
			case "de":		//german
				return {
					context_pindm_text:				"Direktnachricht anheften",
					context_unpindm_text:			"Direktnachricht loslösen",
					header_pinneddms_text:			"Gepinnte Direktnachrichten"
				};
			case "es":		//spanish
				return {
					context_pindm_text:				"Anclar MD",
					context_unpindm_text:			"Desanclar MD",
					header_pinneddms_text:			"Mensajes Directos Fijados"
				};
			case "fr":		//french
				return {
					context_pindm_text:				"Épingler MP",
					context_unpindm_text:			"Désépingler MP",
					header_pinneddms_text:			"Messages Prives Épinglés"
				};
			case "it":		//italian
				return {
					context_pindm_text:				"Fissa il messaggio diretto",
					context_unpindm_text:			"Togli il messaggio diretto",
					header_pinneddms_text:			"Messaggi Diretti Aggiunti"
				};
			case "nl":		//dutch
				return {
					context_pindm_text:				"PB pinnen",
					context_unpindm_text:			"PB losmaken",
					header_pinneddms_text:			"Vastgezette Persoonluke Berichten"
				};
			case "no":		//norwegian
				return {
					context_pindm_text:				"Fest DM",
					context_unpindm_text:			"Løsne DM",
					header_pinneddms_text:			"Pinned Direktemeldinger"
				};
			case "pl":		//polish
				return {
					context_pindm_text:				"Przypnij PW",
					context_unpindm_text:			"Odepnij PW",
					header_pinneddms_text:			"Prywatne Wiadomości Bezpośrednie"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_pindm_text:				"Fixar MD",
					context_unpindm_text:			"Desafixar MD",
					header_pinneddms_text:			"Mensagens diretas fixadas"
				};
			case "fi":		//finnish
				return {
					context_pindm_text:				"Kiinnitä yksityisviestit",
					context_unpindm_text:			"Poista yksityisviestit",
					header_pinneddms_text:			"Liitetyt yksityisviestit"
				};
			case "sv":		//swedish
				return {
					context_pindm_text:				"Fäst DM",
					context_unpindm_text:			"Lossa DM",
					header_pinneddms_text:			"Inlagda Direktmeddelanden"
				};
			case "tr":		//turkish
				return {
					context_pindm_text:				"DM'yi Sabitle",
					context_unpindm_text:			"DM'yi Kaldır",
					header_pinneddms_text:			"Direkt Mesajlar Sabitleyin"
				};
			case "cs":		//czech
				return {
					context_pindm_text:				"Připnout PZ",
					context_unpindm_text:			"Odepnout PZ",
					header_pinneddms_text:			"Připojené Přímá Zpráva"
				};
			case "bg":		//bulgarian
				return {
					context_pindm_text:				"Закачени ДС",
					context_unpindm_text:			"Откачи ДС",
					header_pinneddms_text:			"Свързани директни съобщения"
				};
			case "ru":		//russian
				return {
					context_pindm_text:				"Закрепить ЛС",
					context_unpindm_text:			"Открепить ЛС",
					header_pinneddms_text:			"Прикрепленные Личные Сообщения"
				};
			case "uk":		//ukrainian
				return {
					context_pindm_text:				"Закріпити ОП",
					context_unpindm_text:			"Відкріпити ОП",
					header_pinneddms_text:			"Прикріплені oсобисті повідомлення"
				};
			case "ja":		//japanese
				return {
					context_pindm_text:				"DMピン",
					context_unpindm_text:			"DMをピン止めする",
					header_pinneddms_text:			"固定された直接メッセージ"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_pindm_text:				"引腳直接留言",
					context_unpindm_text:			"分離直接消息",
					header_pinneddms_text:			"固定私人信息"
				};
			case "ko":		//korean
				return {
					context_pindm_text:				"비공개 메시지 고정",
					context_unpindm_text:			"비공개 메시지 고정 해제",
					header_pinneddms_text:			"고정 된 비공개 메시지"
				};
			default:		//default: english
				return {
					context_pindm_text:				"Pin DM",
					context_unpindm_text:			"Unpin DM",
					header_pinneddms_text:			"Pinned Direct Messages"
				};
		}
	}
}