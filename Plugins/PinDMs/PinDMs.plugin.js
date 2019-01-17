//META{"name":"PinDMs"}*//

class PinDMs {
	getName () {return "PinDMs";}

	getVersion () {return "1.2.7";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to pin DMs, making them appear at the top of your DM-list.";}
	
	initConstructor () {
		this.patchModules = {
			"LazyScroller":["render"]
		};
		
		this.pinDMEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitem} pindms-item pindm-item">
				<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_context_pindm_text</div></span>
				<div class="${BDFDB.disCN.contextmenuhint}"></div>
			</div>`;
			
		this.unpinDMEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitem} pindms-item unpindm-item">
				<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_context_unpindm_text</div></span>
				<div class="${BDFDB.disCN.contextmenuhint}"></div>
			</div>`;
	}

	//legacy
	load () {}

	start () {
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {
				BDFDB.loaded = true;
				this.initialize();
			});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.loadMessage(this);
			
			this.ChannelUtils = BDFDB.WebModules.findByProperties("getDMFromUserId");
			this.PrivateChannelUtils = BDFDB.WebModules.findByProperties("ensurePrivateChannel");
			
			
			BDFDB.addEventListener(this, document, "click", BDFDB.dotCNS.dmchannels + BDFDB.dotCN.dmchannel, e => {
				let instance = BDFDB.getReactInstance(e.currentTarget);
				if (BDFDB.getReactValue(instance, "return.return.return.memoizedProps.ispin")) {
					let dmsscroller = document.querySelector(BDFDB.dotCNS.dmchannels + BDFDB.dotCN.scroller);
					if (dmsscroller) {
						this.oldScrollerPos = dmsscroller.scrollTop;
						setTimeout(() => {this.oldScrollerPos = null;},1000);
					}
				}
			});
			BDFDB.addEventListener(this, document, "click", BDFDB.dotCNS.dmchannels + BDFDB.dotCNS.dmchannel + BDFDB.dotCN.dmchannelclose, e => {
				let instance = BDFDB.getReactInstance(e.currentTarget);
				if (BDFDB.getReactValue(instance, "return.return.return.return.return.memoizedProps.ispin")) {
					e.originalEvent.stopPropagation();
					e.originalEvent.preventDefault();
					this.removePinnedDM(BDFDB.getReactValue(instance, "return.return.return.return.return.memoizedProps.channel.id")); 
				}
			});
				
			this.forceAdding = true;
			BDFDB.WebModules.forceAllUpdates(this);
			delete this.forceAdding;
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			let dmsscrollerinstance = BDFDB.getReactInstance(document.querySelector(BDFDB.dotCNS.dmchannels + BDFDB.dotCN.scroller));
			if (dmsscrollerinstance) {
				let dms = dmsscrollerinstance.return.return.return.memoizedProps.children;
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
				this.forceUpdateScroller(dmsscrollerinstance.stateNode);
			}
			
			BDFDB.unloadMessage(this);
		}
	}
	
	
	// begin of own functions
	
	changeLanguageStrings () {		
		this.pinDMEntryMarkup = 	this.pinDMEntryMarkup.replace("REPLACE_context_pindm_text", this.labels.context_pindm_text);
		
		this.unpinDMEntryMarkup = 	this.unpinDMEntryMarkup.replace("REPLACE_context_unpindm_text", this.labels.context_unpindm_text);
	}
	
	onUserContextMenu (instance, menu) {
		if (instance.props && instance.props.user && !menu.querySelector(".pindms-item")) {
			let closeentry = BDFDB.React.findDOMNodeSafe(BDFDB.getOwnerInstance({node:menu,props:["handleClose"]}));
			if (closeentry) {
				let id = this.ChannelUtils.getDMFromUserId(instance.props.user.id);
				if (id) this.appendItem(instance, id, closeentry);
				else this.PrivateChannelUtils.ensurePrivateChannel(BDFDB.myData.id, instance.props.user.id).then(id => {this.appendItem(instance, id, closeentry);});
			}
		}
	}
	
	onGroupDMContextMenu (instance, menu) {
		if (instance.props && instance.props.channelId && !menu.querySelector(".pindms-item")) {
			let changeentry = BDFDB.React.findDOMNodeSafe(BDFDB.getOwnerInstance({node:menu,props:["handleChangeIcon"]}));
			if (changeentry) {
				this.appendItem(instance, instance.props.channelId, changeentry);
			}
		}
	}
	
	appendItem (instance, id, target) {
		let pinnedDMs = BDFDB.loadAllData(this, "pinnedDMs");
		if (!pinnedDMs[id]) {
			let pinDMEntry = BDFDB.htmlToElement(this.pinDMEntryMarkup);
			target.parentElement.insertBefore(pinDMEntry, target);
			pinDMEntry.addEventListener("click", () => {
				instance._reactInternalFiber.return.memoizedProps.closeContextMenu();
				let dmsscrollerinstance = BDFDB.getReactInstance(document.querySelector(BDFDB.dotCNS.dmchannels + BDFDB.dotCN.scroller));
				if (dmsscrollerinstance) {
					let dms = dmsscrollerinstance.return.return.return.memoizedProps.children;
					let insertpoint = this.getInsertPoint(dms);
					this.addPinnedDM(id, dms, insertpoint); 
					this.forceUpdateScroller(dmsscrollerinstance.stateNode);
				}
				pinnedDMs[id] = Object.keys(pinnedDMs).length;
				BDFDB.saveAllData(pinnedDMs, this, "pinnedDMs");
			});
		}
		else {
			let unpinDMEntry = BDFDB.htmlToElement(this.unpinDMEntryMarkup);
			target.parentElement.insertBefore(unpinDMEntry, target);
			unpinDMEntry.addEventListener("click", () => {
				instance._reactInternalFiber.return.memoizedProps.closeContextMenu();
				this.removePinnedDM(id);
			});
		}
	}
	
	processLazyScroller (instance, wrapper) {
		if (instance._reactInternalFiber && instance._reactInternalFiber.return.memoizedProps && instance._reactInternalFiber.return.memoizedProps.privateChannelIds) {
			if (this.forceAdding || !instance.props.PinDMsPatched) {
				instance.props.PinDMsPatched = true;
				let dms = instance.props.children;
				let sortedDMs = this.sortAndUpdate();
				if (sortedDMs.length > 0) {
					let insertpoint = this.getInsertPoint(dms);
					for (let pos in sortedDMs) this.addPinnedDM(sortedDMs[pos], dms, insertpoint);
				}
				this.forceUpdateScroller(instance.getScrollerNode());
			}
			if (this.oldScrollerPos != null) {
				instance.getScrollerNode().scrollTop = this.oldScrollerPos;
			}
		}
	}
	
	getInsertPoint (dms) {
		let insertpoint = null;
		for (let i in dms) {
			let ele = dms[i];
			if (ele && ele.type == "header") {
				insertpoint = parseInt(i);
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
	
	removePinnedDM (id) {
		if (!id) return;
		BDFDB.removeData(id, this, "pinnedDMs");
		let dmsscrollerinstance = BDFDB.getReactInstance(document.querySelector(BDFDB.dotCNS.dmchannels + BDFDB.dotCN.scroller));
		if (dmsscrollerinstance) {
			let dms = dmsscrollerinstance.return.return.return.memoizedProps.children;
			let existingDMs = this.sortAndUpdate();
			let removepoint = null;
			for (let i in dms) {
				let ele = dms[i];
				if (ele && ele.pinned && (id == ele.key || ("pin" + id) == ele.key)) {
					delete ele.pinned;
					if (ele.props.ispin) removepoint = parseInt(i);
				}
			}
			if (removepoint) {
				let offset = existingDMs.length ? 0 : 1;
				if (offset) delete dms[removepoint + offset].pinned;
				dms.splice(removepoint-offset,1+offset);
			}
			this.forceUpdateScroller(dmsscrollerinstance.stateNode);
		}
	}
	
	sortAndUpdate () {
		let pinnedDMs = BDFDB.loadAllData(this, "pinnedDMs");
		delete pinnedDMs[""];
		let sortedDMs = [], existingDMs = [], sortDM = (id) => {
			if (typeof sortedDMs[pinnedDMs[id]] == "undefined") sortedDMs[pinnedDMs[id]] = id;
			else sortDM(sortedDMs, pinnedDMs[id]+1, id);
		};
		for (let id in pinnedDMs) sortDM(id);
		sortedDMs = sortedDMs.filter(n => n);
		for (let pos in sortedDMs) {
			pinnedDMs[sortedDMs[pos]] = parseInt(pos);
			if (this.ChannelUtils.getChannel(sortedDMs[pos])) existingDMs.push(sortedDMs[pos]);
		}
		BDFDB.saveAllData(pinnedDMs, this, "pinnedDMs");
		return existingDMs;
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