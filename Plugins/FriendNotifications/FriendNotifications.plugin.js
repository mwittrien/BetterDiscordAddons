//META{"name":"FriendNotifications"}*//

class FriendNotifications {
	constructor () {
		this.friendsOnlineList = {};
		
		this.css = `
			.DevilBro-settings .avatar-list {
				display: flex;
				align-items: center;
				flex-wrap: wrap;
			}
			.DevilBro-settings .settings-avatar {
				margin: 5px;
				width: 50px;
				height: 50px;
				background-size: cover;
				background-position: center;
				border-radius: 50%;
				cursor: pointer;
			}
			.DevilBro-settings .settings-avatar.disabled {
				filter: grayscale(100%) brightness(50%);
				opacity: 0.5;
			}
		`;
			
		this.defaults = {
			settings: {
				onlyOnOnline:		{value:false, 	description:"Only notify me when a user comes online:"}
			}
		};
	}

	getName () {return "FriendNotifications";}

	getDescription () {return "Notifies you when a friend either logs in or out.";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		
		var settings = BDfunctionsDevilBro.getAllData(this, "settings");
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">Click on a Icon to disable Notifications for that User:</h3></div>`;
		settingshtml += `<div class="avatar-list">`;
		for (let id of this.FriendUtils.getFriendIDs()) {
			let user = this.UserUtils.getUser(id);
			settingshtml += `<div class="settings-avatar" user-id="${id}" style="background-image: ${this.getUserAvatar(user)}"></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Reset Notification Settings.</h3><button type="button" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorRed-3HTNPV sizeMedium-2VGNaF grow-25YQ8u reset-button" style="flex: 0 0 auto;"><div class="contents-4L4hQM">Reset</div></button></div>`;
		settingshtml += `</div></div>`;
			
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);})
			.on("mouseenter", ".settings-avatar", (e) => {
				let user = this.UserUtils.getUser(e.currentTarget.getAttribute("user-id"));
				BDfunctionsDevilBro.createTooltip(user.username, e.currentTarget, {type:"top"});
			})
			.on("click", ".settings-avatar", (e) => {
				let disable = !e.currentTarget.classList.contains("disabled");
				e.currentTarget.classList.toggle("disabled", disable);
				BDfunctionsDevilBro.saveData(e.currentTarget.getAttribute("user-id"), disable, this, "disabled");
			})
			.on("click", ".reset-button", () => {
				settingspanel.querySelectorAll(".settings-avatar.disabled").forEach(avatar => {
					avatar.classList.remove("disabled");
				});
				BDfunctionsDevilBro.removeAllData(this, "disabled");
			});
			
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
			
			this.FriendUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getFriendIDs", "getRelationships"]);
			this.UserMetaStore = BDfunctionsDevilBro.WebModules.findByProperties(["getStatuses", "getOnlineFriendCount"]);
			this.UserUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getUsers"]);
			this.IconUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getUserAvatarURL"]);
			
			var observer = null;
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						for (let id of this.FriendUtils.getFriendIDs()) {
							let online = this.UserMetaStore.getStatus(id) != "offline";
							let user = this.UserUtils.getUser(id);
							if (this.friendsOnlineList[id] != online && !BDfunctionsDevilBro.loadData(id, this, "disabled")) {
								if (!(BDfunctionsDevilBro.getData("onlyOnOnline", this, "settings") && !online)) {
									let string = `<div class="toast-inner"><div class="toast-avatar" style="background-image:${this.getUserAvatar(user)}"></div><div>${BDfunctionsDevilBro.encodeToHTML(user.username)} is ${online ? "online" : "offline"}.</div></div>`;
									BDfunctionsDevilBro.showToast(string, {html:true, type:(online ? "success" : null), icon:false});
								}
							}
							this.friendsOnlineList[id] = online;
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".friends-online", {name:"friendCountObserver",instance:observer}, {childList:true, subtree:true, characterData:true});
			
			for (let id of this.FriendUtils.getFriendIDs()) {
				this.friendsOnlineList[id] = this.UserMetaStore.getStatus(id) != "offline";
			}
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.unloadMessage(this);
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
	
	getUserAvatar (user) {
		return "url(" + (user.avatar ? "" : "https://discordapp.com") + this.IconUtils.getUserAvatarURL(user) + ");".split("?size")[0];
	}
}