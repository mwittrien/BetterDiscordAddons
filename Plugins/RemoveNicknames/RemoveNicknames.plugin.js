//META{"name":"RemoveNicknames"}*//

class RemoveNicknames {
	constructor () {
		this.channelListObserver = new MutationObserver(() => {});
		this.userListObserver = new MutationObserver(() => {});
		this.chatWindowObserver = new MutationObserver(() => {});
		this.settingsWindowObserver = new MutationObserver(() => {});
			
		this.defaults = {
			settings: {
				replaceOwn:		{value:false, 	description:"Replace your own name:"},
				addNickname:    {value:false, 	description:"Add nickname as parentheses:"}
			}
		};
	}

	getName () {return "RemoveNicknames";}

	getDescription () {return "Replace all nicknames with the actual accountnames.";}

	getVersion () {return "1.0.3";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settings = BDfunctionsDevilBro.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
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
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"></script>');
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			this.UserStore = BDfunctionsDevilBro.WebModules.findByProperties(["getUsers", "getUser"]);
			this.MemberPerms = BDfunctionsDevilBro.WebModules.findByProperties(["getNicknames", "getNick"]);
			
			var observertarget = null;

			this.channelListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".userDefault-2_cnT0")) {
									this.loadUser(node.querySelector(".userDefault-2_cnT0").parentElement, "voice", false);
								}
							});
						}
					}
				);
			});
			if (observertarget = document.querySelector(".channels-3g2vYe")) this.channelListObserver.observe(observertarget, {childList: true, subtree: true});
			
			this.userListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".member-username")) {
									this.loadUser(node, "list", false);
								}
							});
						}
					}
				);
			});
			if (observertarget = document.querySelector(".channel-members")) this.userListObserver.observe(observertarget, {childList:true});
			
			this.chatWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if ($(".message-group").has(".avatar-large").length > 0) {
									if (node && node.tagName && node.querySelector(".username-wrapper")) {
										this.loadUser(node, "chat", false);
									}
									else if (node && node.classList && node.classList.contains("message-text")) {
										this.loadUser($(".message-group").has(node)[0], "chat", false);
									}
								}
								else {
									if (node && node.tagName && node.querySelector(".username-wrapper")) {
										if (node.classList.contains("markup")) {
											this.loadUser(node, "chat", true);
										}
										else {
											var markups = node.querySelectorAll(".markup");
											for (var i = 0; i < markups.length; i++) {
												this.loadUser(markups[i], "chat", true);
											}
										}
									}
								}
							});
						}
					}
				);
			});
			if (observertarget = document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(observertarget, {childList:true, subtree:true});
			
			this.settingsWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && node.tagName && node.getAttribute("layer-id") == "user-settings") {
									this.resetAllUsers();
									this.loadAllUsers();
								}
							});
						}
					}
				);
			});
			if (observertarget = document.querySelector(".layers-20RVFW")) this.settingsWindowObserver.observe(observertarget, {childList:true});
			
			this.loadAllUsers();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.userListObserver.disconnect();
			this.chatWindowObserver.disconnect();
			this.channelListObserver.disconnect();
			this.settingsWindowObserver.disconnect();
			
			this.resetAllUsers();
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.loadAllUsers();
			var observertarget = null;
			if (observertarget = document.querySelector(".channel-members")) this.userListObserver.observe(observertarget, {childList:true});
			if (observertarget = document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(observertarget, {childList:true, subtree:true});
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

	loadAllUsers () {
		for (let user of document.querySelectorAll(".member")) {
			this.loadUser(user, "list", false);
		} 
		for (let user of document.querySelectorAll(".message-group")) {
			if (user.querySelector(".avatar-large")) {
				this.loadUser(user, "chat", false);
			}
			else {
				for (let markup of user.querySelectorAll(".markup")) {
					this.loadUser(markup, "chat", true);
				}
			}
		}
		for (let user of document.querySelectorAll(".userDefault-2_cnT0")) {
			this.loadUser(user.parentElement, "voice", false);
		}
	}
	
	loadUser (div, type, compact) {
		if (!div || $(div).attr("removed-nickname") || !div.tagName) return;
		
		let usernameWrapper = this.getNameWrapper(div);
		if (!usernameWrapper) return;
		
		$(div).data("compact", compact);
		
		var info = this.getUserInfo(compact ? $(".message-group").has(div)[0] : div);
		if (!info) return;
		
		var settings = BDfunctionsDevilBro.getAllData(this, "settings");
		if (info.id == BDfunctionsDevilBro.myData.id && !settings.replaceOwn) return;
		
		var serverObj = BDfunctionsDevilBro.getSelectedServer();
		if (!serverObj) return;
		
		var member = this.MemberPerms.getMember(serverObj.id, info.id);
		if (!member || !member.nick) return;
		
		BDfunctionsDevilBro.setInnerText(usernameWrapper, settings.addNickname ? info.username + " (" + member.nick + ")" : info.username);
			
		$(div).attr("removed-nickname", true);
	}
	
	resetAllUsers () {
		document.querySelectorAll("[removed-nickname]").forEach((div) => {
			let usernameWrapper = this.getNameWrapper(div);
			if (!usernameWrapper) return;
			
			var info = this.getUserInfo($(div).data("compact") ? $(".message-group").has(div)[0] : div);
			if (!info) return;
			
			var serverObj = BDfunctionsDevilBro.getSelectedServer();
			if (!serverObj) return;
			
			var member = this.MemberPerms.getMember(serverObj.id, info.id);
			if (!member || !member.nick) return;
			
			BDfunctionsDevilBro.setInnerText(usernameWrapper, member.nick);
				
			$(div).removeAttr("removed-nickname");
		});
	}
	
	getNameWrapper (div) {		
		return div.querySelector(".user-name, .member-username-inner, .nameDefault-1I0lx8");
	}
	
	getUserInfo (div) {
		var info = BDfunctionsDevilBro.getKeyInformation({"node":div,"key":"user"});
		if (!info) {
			info = BDfunctionsDevilBro.getKeyInformation({"node":div,"key":"message"});
			if (info) info = info.author;
			else {
				info = BDfunctionsDevilBro.getKeyInformation({"node":div,"key":"channel"});
				if (info) info = {"id":info.recipients[0]};
				else {
					info = BDfunctionsDevilBro.getKeyInformation({"node":$(".message-group").has(div)[0],"key":"message"});
					if (info) info = info.author;
				}
			}
		}
		return info && info.id ? this.UserStore.getUser(info.id) : null;
	}
}
