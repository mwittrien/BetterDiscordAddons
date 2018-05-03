module.exports = (Plugin, Api, Vendor) => {
	if (typeof BDFDB !== "object") global.BDFDB = {$: Vendor.$, BDv2Api: Api};
	
	const {$} = Vendor;

	return class extends Plugin {
		initConstructor () {
			this.updateUsers = false;
			
			this.defaults = {
				settings: {
					replaceOwn:		{value:false, 	description:"Replace your own name:"},
					addNickname:    {value:false, 	description:"Add nickname as parentheses:"}
				}
			};
		}

		onStart () {
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
			return true;
		}

		initialize () {
			if (typeof BDFDB === "object") {
				BDFDB.loadMessage(this);
				
				this.UserStore = BDFDB.WebModules.findByProperties(["getUsers", "getUser"]);
				this.MemberPerms = BDFDB.WebModules.findByProperties(["getNicknames", "getNick"]);
				
				var observer = null;

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.tagName && node.querySelector(BDFDB.dotCN.voiceuserdefault)) {
										this.loadUser(node.querySelector(BDFDB.dotCN.voiceuserdefault).parentElement, "voice", false);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.channels, {name:"channelListObserver",instance:observer}, {childList: true, subtree: true});
				
				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.tagName && node.querySelector(BDFDB.dotCN.memberusername)) {
										this.loadUser(node, "list", false);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.members, {name:"userListObserver",instance:observer}, {childList:true});
				
				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if ($(BDFDB.dotCN.messagegroup).has(BDFDB.dotCN.avatarlargeold).length > 0) {
										if (node && node.tagName && node.querySelector(BDFDB.dotCN.messageusernamewrapper)) {
											this.loadUser(node, "chat", false);
										}
										else if (node && node.classList && node.classList.contains(BDFDB.disCN.messagetext)) {
											this.loadUser($(BDFDB.dotCN.messagegroup).has(node)[0], "chat", false);
										}
									}
									else {
										if (node && node.tagName && node.querySelector(BDFDB.dotCN.messageusernamewrapper)) {
											if (node.classList.contains(BDFDB.disCN.messagemarkup)) {
												this.loadUser(node, "chat", true);
											}
											else {
												var markups = node.querySelectorAll(BDFDB.dotCN.messagemarkup);
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
				BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"chatWindowObserver",instance:observer}, {childList:true, subtree:true});
				
				this.loadAllUsers();

				return true;
			}
			else {
				console.error(this.name + ": Fatal Error: Could not load BD functions!");
				return false;
			}
		}


		onStop () {
			if (typeof BDFDB === "object") {
				this.resetAllUsers();
				
				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}
		
		onSwitch () {
			if (typeof BDFDB === "object") {
				this.loadAllUsers();
				BDFDB.addObserver(this, BDFDB.dotCN.members, {name:"userListObserver"}, {childList:true});
				BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"chatWindowObserver"}, {childList:true, subtree:true});
			}
		}

		
		// begin of own functions

		updateSettings (settingspanel) {
			var settings = {};
			for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
				settings[input.value] = input.checked;
			}
			BDFDB.saveAllData(settings, this, "settings");
			this.updateUsers = true;
		}

		loadAllUsers () {
			for (let user of document.querySelectorAll(BDFDB.dotCN.member)) {
				this.loadUser(user, "list", false);
			} 
			for (let user of document.querySelectorAll(BDFDB.dotCN.messagegroup)) {
				if (user.querySelector(BDFDB.dotCN.avatarlargeold)) {
					this.loadUser(user, "chat", false);
				}
				else {
					for (let markup of user.querySelectorAll(BDFDB.dotCN.messagemarkup)) {
						this.loadUser(markup, "chat", true);
					}
				}
			}
			for (let user of document.querySelectorAll(BDFDB.dotCN.voiceuserdefault)) {
				this.loadUser(user.parentElement, "voice", false);
			}
		}
		
		loadUser (div, type, compact) {
			if (!div || $(div).attr("removed-nickname") || !div.tagName) return;
			
			let usernameWrapper = this.getNameWrapper(div);
			if (!usernameWrapper) return;
			
			$(div).data("compact", compact);
			
			var info = this.getUserInfo(compact ? $(BDFDB.dotCN.messagegroup).has(div)[0] : div);
			if (!info) return;
			
			var settings = BDFDB.getAllData(this, "settings");
			if (info.id == BDFDB.myData.id && !settings.replaceOwn) return;
			
			var serverObj = BDFDB.getSelectedServer();
			if (!serverObj) return;
			
			var member = this.MemberPerms.getMember(serverObj.id, info.id);
			if (!member || !member.nick) return;
			
			BDFDB.setInnerText(usernameWrapper, settings.addNickname ? info.username + " (" + member.nick + ")" : info.username);
				
			$(div).attr("removed-nickname", true);
		}
		
		resetAllUsers () {
			document.querySelectorAll("[removed-nickname]").forEach((div) => {
				let usernameWrapper = this.getNameWrapper(div);
				if (!usernameWrapper) return;
				
				var info = this.getUserInfo($(div).data(BDFDB.disCN.messagecompact) ? $(BDFDB.dotCN.messagegroup).has(div)[0] : div);
				if (!info) return;
				
				var serverObj = BDFDB.getSelectedServer();
				if (!serverObj) return;
				
				var member = this.MemberPerms.getMember(serverObj.id, info.id);
				if (!member || !member.nick) return;
				
				BDFDB.setInnerText(usernameWrapper, member.nick);
					
				$(div).removeAttr("removed-nickname");
			});
		}
		
		getNameWrapper (div) {		
			return div.querySelector(BDFDB.dotCNC.memberusername + BDFDB.dotCNC.voicenamedefault + BDFDB.dotCN.messageusername);
		}
		
		getUserInfo (div) {
			var info = BDFDB.getKeyInformation({"node":div,"key":"user"});
			if (!info) {
				info = BDFDB.getKeyInformation({"node":div,"key":"message"});
				if (info) info = info.author;
				else {
					info = BDFDB.getKeyInformation({"node":div,"key":"channel"});
					if (info) info = {"id":info.recipients[0]};
					else {
						info = BDFDB.getKeyInformation({"node":$(BDFDB.dotCN.messagegroup).has(div)[0],"key":"message"});
						if (info) info = info.author;
					}
				}
			}
			return info && info.id ? this.UserStore.getUser(info.id) : null;
		}
		
		getSettingsPanel () {
			var settings = BDFDB.getAllData(this, "settings"); 
			var settingshtml = `<div class="DevilBro-settings ${this.name}-settings">`;
			for (let key in settings) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
			}
			settingshtml += `</div>`;
			
			var settingspanel = $(settingshtml)[0];

			$(settingspanel)
				.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);});
			return settingspanel;
		}
		
		onSettingsClosed () {
			if (this.updateUsers) {
				this.resetAllUsers();
				this.loadAllUsers();
				this.updateUsers = false;
			}
		}
	}
};
