//META{"name":"StalkerNotifications"}*//

class StalkerNotifications {
	constructor () {
		this.stalkerOnlineList = {};
		
		this.checkInterval = null;
		
		this.timeLog = [];

		this.timeLogModalMarkup =
			`<span class="stalkernotifications-modal DevilBro-modal">
				<div class="backdrop-2ohBEd"></div>
				<div class="modal-2LIEKY">
					<div class="inner-1_1f7b">
						<div class="modal-3HOjGZ sizeMedium-1-2BNS">
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
								<div class="flexChild-1KGW5q" style="flex: 1 1 auto;">
									<h4 class="h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl">User LogIn/-Out Timelog</h4>
								</div>
								<svg class="btn-cancel close-3ejNTg flexChild-1KGW5q" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
									<g fill="none" fill-rule="evenodd">
										<path d="M0 0h12v12H0"></path>
										<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
									</g>
								</svg>
							</div>
							<div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW">
								<div class="scroller-fzNley inner-tqJwAU entries">
								</div>
							</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw">
								<button type="button" class="btn-ok button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u">
									<div class="contents-4L4hQM"></div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;

		this.logEntryMarkup =
			`<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginTop4-2rEBfJ marginBottom4-_yArcI entry" style="flex: 1 1 auto;">
				<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q overflowEllipsis-3Rxxjf log-time" style="flex: 0 0 auto;"></h3>
				<div class="log-avatar"></div>
				<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q overflowEllipsis-3Rxxjf log-description" style="flex: 1 1 auto;"></h3>
			</div>`;
			
		this.dividerMarkup = `<div class="divider-1G01Z9 dividerDefault-77PXsz"></div>`;
		
		this.css = `
			.guilds > .friends-online {
				cursor: pointer;
			}
			.stalkernotifications-modal .log-time {
				width: 100px;
			}
			.stalkernotifications-modal .log-avatar {
				width: 35px;
				height: 35px;
				background-size: cover;
				background-position: center;
				border-radius: 50%;
			}
			.StalkerNotifications-settings .avatar-list {
				display: flex;
				align-items: center;
				flex-wrap: wrap;
			}
			.StalkerNotifications-settings .type-toast, .StalkerNotifications-settings .type-desktop {
				border-radius: 3px;
				padding: 0 3px;
			}
			.StalkerNotifications-settings .type-toast {
				background-color: #7289DA;
			}
			.StalkerNotifications-settings .type-desktop {
				background-color: #43B581;
			}
			.StalkerNotifications-settings .settings-avatar.desktop {
				border-color: #43B581;
			}
			.StalkerNotifications-settings .settings-avatar {
				margin: 5px;
				width: 50px;
				height: 50px;
				background-size: cover;
				background-position: center;
				border: 5px solid #7289DA;
				border-radius: 50%;
				box-sizing: border-box;
				cursor: pointer;
			}
			.StalkerNotifications-settings .settings-avatar.desktop {
				border-color: #43B581;
			} 
			.StalkerNotifications-settings .settings-avatar.disabled {
				border-color: #36393F;
				filter: grayscale(100%) brightness(50%);
			}
			.StalkerNotifications-settings .settings-avatar .button-1qrA-N {
				position: relative;
				top: -10px;
				right: -25px;
			}
			.StalkerNotifications-settings .settings-avatar:not(:hover) .button-1qrA-N {
				opacity: 1;
			}
			.StalkerNotifications-settings .disable-all {
				color: white;
				background-color: #36393F;
			}
		`;
			
		this.defaults = {
			settings: {
				onlyOnOnline:		{value:false, 	description:"Only notify me when a User logs in:"},
				openOnClick:		{value:false, 	description:"Open the DM when you click a Notification:"}
			},
			amounts: {
				checkInterval:		{value:10, 		description:"Check Users every X seconds:"}
			}
		};
	}

	getName () {return "StalkerNotifications";}

	getDescription () {return "Lets you observe the status of people that aren't your friends.";}

	getVersion () {return "1.0.1";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		
		var amounts = BDfunctionsDevilBro.getAllData(this, "amounts");
		var settings = BDfunctionsDevilBro.getAllData(this, "settings");
		var users = BDfunctionsDevilBro.loadAllData(this, "users");
		var notificationsound = BDfunctionsDevilBro.loadAllData(this, "notificationsound");
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ weightMedium-13x9Y8 size16-3IvaX_ flexChild-1KGW5q" style="flex: 0 0 50%; line-height: 38px;">Add User:</h3><div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR" style="flex: 1 1 auto;"><input type="text" value="" placeholder="UserID" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_" id="input-userid"></div><button type="button" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u btn-add btn-adduser" style="flex: 0 0 auto;"><div class="contents-4L4hQM"></div></button></div>`;
		for (let key in amounts) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ weightMedium-13x9Y8 size16-3IvaX_ flexChild-1KGW5q" style="flex: 0 0 50%;">${this.defaults.amounts[key].description}</h3><div class="inputWrapper-3xoRWR inputNumberWrapper vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR" style="flex: 1 1 auto;"><span class="numberinput-buttons-zone"><span class="numberinput-button-up"></span><span class="numberinput-button-down"></span></span><input type="number" min="0" option="${key}" value="${amounts[key]}" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ amountInput"></div></div>`;
		}
		for (let key in settings) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm settings-checkbox"${settings[key] ? " checked" : ""}></div></div>`;
		}
		if ("Notification" in window) settingshtml += `<div class="flexChild-1KGW5q marginBottom8-1mABJ4" style="flex: 1 1 auto;"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h5 class="flexChild-1KGW5q h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY" style="flex: 1 1 auto;">Desktop Notification Sound:</h5><h5 class="flexChild-1KGW5q h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY" style="flex: 0 0 auto;">Mute:</h5><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm mute-checkbox"${notificationsound.mute ? " checked" : ""}></div></div><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO" style="flex: 1 1 auto;"><div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" value="${notificationsound.url ? notificationsound.url : ""}" placeholder="Url or Filepath" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ songInput"></div><button type="button" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u file-navigator" style="flex: 0 0 auto;"><div class="contents-4L4hQM"></div><input type="file" accept="audio/*,video/*" style="display:none!important;"></button><button type="button" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u btn-save btn-savesong" style="flex: 0 0 auto;"><div class="contents-4L4hQM"></div></button></div></div>`;
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">Click on a Icon to toggle <label class="type-toast">Toast</label> Notifications for that User:</h3></div>`;
		if ("Notification" in window) settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">Rightclick on a Icon to toggle <label class="type-desktop">Desktop</label> Notifications for that User:</h3></div>`;
		settingshtml += `<div class="avatar-list marginBottom8-1mABJ4">`;
		for (let id in users) {
			let user = this.UserUtils.getUser(id);
			if (user) settingshtml += this.createSettingsAvatarHtml(user, users[id]);
		}
		settingshtml += `</div>`;
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Batch set Users:</h3><button type="button" do-disable=true class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo sizeMedium-2VGNaF grow-25YQ8u disable-all" style="flex: 0 0 auto;"><div class="contents-4L4hQM">Disable</div></button><button type="button" do-toast=true class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u toast-all" style="flex: 0 0 auto;"><div class="contents-4L4hQM">Toast</div></button>${"Notification" in window ? '<button type="button" do-desktop=true class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorGreen-22At8E sizeMedium-2VGNaF grow-25YQ8u desktop-all" style="flex: 0 0 auto;"><div class="contents-4L4hQM">Desktop</div></button>' : ''}</div>`;
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Timelog of LogIns/-Outs:</h3><button type="button" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u btn-timelog" style="flex: 0 0 auto;"><div class="contents-4L4hQM">Timelog</div></button></div>`;
		settingshtml += `</div></div>`;
			
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".settings-checkbox", () => {this.updateSettings(settingspanel);})
			.on("click", ".btn-savesong", () => {this.saveAudio(settingspanel);})
			.on("click", ".mute-checkbox", (e) => {
				var notificationsound = BDfunctionsDevilBro.loadAllData(this, "notificationsound");
				notificationsound.mute = e.currentTarget.checked;
				BDfunctionsDevilBro.saveAllData(notificationsound, this, "notificationsound");
			})
			.on("mouseenter", ".settings-avatar", (e) => {
				let user = this.UserUtils.getUser(e.currentTarget.getAttribute("user-id"));
				let data = BDfunctionsDevilBro.loadData(user.id, "EditUsers", "users") || {};
				BDfunctionsDevilBro.createTooltip(data.name ? data.name : user.username, e.currentTarget, {type:"top"});
			})
			.on("contextmenu", ".settings-avatar", (e) => {
				if (!("Notification" in window)) return;
				let desktopoff = !e.currentTarget.classList.contains("desktop");
				let id = e.currentTarget.getAttribute("user-id");
				e.currentTarget.classList.remove("disabled");
				e.currentTarget.classList.toggle("desktop", desktopoff);
				BDfunctionsDevilBro.saveData(id, {"desktop":desktopoff,"disabled":false}, this, "users");
			})
			.on("click", ".settings-avatar", (e) => {
				if (e.target.classList.contains("remove-user")) return;
				let disableoff = !e.currentTarget.classList.contains("disabled");
				let id = e.currentTarget.getAttribute("user-id");
				e.currentTarget.classList.remove("desktop");
				e.currentTarget.classList.toggle("disabled", disableoff);
				BDfunctionsDevilBro.saveData(id, {"desktop":false,"disabled":disableoff}, this, "users");
			})
			.on("click", ".disable-all, .toast-all, .desktop-all", (e) => {
				let button = e.currentTarget;
				let disableon = button.getAttribute("do-disable");
				let desktopon = button.getAttribute("do-desktop");
				let users = BDfunctionsDevilBro.loadAllData(this, "users");
				settingspanel.querySelectorAll(".settings-avatar").forEach(avatar => {
					let id = avatar.getAttribute("user-id");
					avatar.classList.toggle("disabled", disableon);
					avatar.classList.toggle("desktop", desktopon);
					users[id].desktop = desktopon ? true : false;
					users[id].disabled = disableon ? true : false;
				});
				BDfunctionsDevilBro.saveAllData(users, this, "users");
			})
			.on("click", ".btn-adduser", (e) => {
				let idinput = settingspanel.querySelector("#input-userid");
				let user = this.UserUtils.getUser(idinput.value);
				if (user) {
					idinput.value = "";
					BDfunctionsDevilBro.saveData(user.id, {desktop:false,disabled:false}, this, "users");
					settingspanel.querySelectorAll(".settings-avatar").forEach(entry => {entry.remove();});
					let listhtml = `<div class="avatar-list marginBottom8-1mABJ4">`;
					let users = BDfunctionsDevilBro.loadAllData(this, "users");
					for (let id in users) {
						let user = this.UserUtils.getUser(id);
						if (user) listhtml += this.createSettingsAvatarHtml(user, users[id]);
					}
					listhtml += `</div>`;
					settingspanel.querySelector(".avatar-list").innerHTML = listhtml;
				}
				else BDfunctionsDevilBro.showToast("Please enter a valid UserID.",{type:"error"});
			})
			.on("click", ".remove-user", (e) => {
				BDfunctionsDevilBro.removeData(e.currentTarget.parentElement.getAttribute("user-id"), this, "users");
				settingspanel.querySelectorAll(".settings-avatar").forEach(entry => {entry.remove();});
				let listhtml = `<div class="avatar-list marginBottom8-1mABJ4">`;
				let users = BDfunctionsDevilBro.loadAllData(this, "users");
				for (let id in users) {
					let user = this.UserUtils.getUser(id);
					if (user) listhtml += this.createSettingsAvatarHtml(user, users[id]);
				}
				listhtml += `</div>`;
				settingspanel.querySelector(".avatar-list").innerHTML = listhtml;
			})
			.on("click", ".btn-timelog", () => {
				this.showTimeLog();
			})
			.on("input", ".amountInput", (e) => {
				let input = parseInt(e.currentTarget.value);
				if (!isNaN(input) && input > 0) {
					BDfunctionsDevilBro.saveData(e.currentTarget.getAttribute("option"), input, this, "amounts");
					this.startInterval();
				}
				else e.currentTarget.value = 1;
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
			
			this.ChannelUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getDMFromUserId"]);
			this.ChannelSwitchUtils = BDfunctionsDevilBro.WebModules.findByProperties(["selectPrivateChannel"]);
			this.UserMetaStore = BDfunctionsDevilBro.WebModules.findByProperties(["getStatuses", "getOnlineFriendCount"]);
			this.UserUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getUsers"]);
			
			for (let id in BDfunctionsDevilBro.loadAllData(this, "users")) {
				this.stalkerOnlineList[id] = this.UserMetaStore.getStatus(id) != "offline";
			}
			
			this.startInterval();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			clearInterval(this.checkInterval);
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
	
	createSettingsAvatarHtml (user, settings) {
		let data = BDfunctionsDevilBro.loadData(user.id, "EditUsers", "users") || {};
		return `<div class="settings-avatar${settings.desktop ? " desktop" : ""}${settings.disabled ? " disabled" : ""}" user-id="${user.id}" style="background-image: url(${data.removeIcon ? "" : (data.url ? data.url : BDfunctionsDevilBro.getUserAvatar(user.id))});"><div class="button-1qrA-N remove-user"></div></div>`;
	}
	
	startInterval () {
		clearInterval(this.checkInterval);
		this.checkInterval = setInterval(() => {
			let settings = BDfunctionsDevilBro.getAllData(this, "settings");
			let notificationsound = BDfunctionsDevilBro.loadAllData(this, "notificationsound");
			let users = BDfunctionsDevilBro.loadAllData(this, "users");
			for (let id in users) {
				let online = this.UserMetaStore.getStatus(id) != "offline";
				let user = this.UserUtils.getUser(id);
				if (user && this.stalkerOnlineList[id] != online && !users[id].disabled) {
					this.timeLog.push({user, online, time: new Date()});
					if (!(settings.onlyOnOnline && !online)) {
						let data = BDfunctionsDevilBro.loadData(user.id, "EditUsers", "users") || {};
						let string = `${BDfunctionsDevilBro.encodeToHTML(data.name ? data.name : user.username)} is ${online ? "online" : "offline"}.`;
						let avatar = data.removeIcon ? "" : (data.url ? data.url : BDfunctionsDevilBro.getUserAvatar(user.id));
						let openChannel = () => {
							if (settings.openOnClick){
								let DMid = this.ChannelUtils.getDMFromUserId(user.id);
								if (DMid) {
									require("electron").remote.getCurrentWindow().maximize();
									this.ChannelSwitchUtils.selectPrivateChannel(DMid);
								}
							}
						};
						if (!users[id].desktop) {
							let toast = BDfunctionsDevilBro.showToast(`<div class="toast-inner"><div class="toast-avatar" style="background-image:url(${avatar});"></div><div>${string}</div></div>`, {html:true, timeout:5000, type:(online ? "success" : null), icon:false});
							$(toast).on("click." + this.getName(), openChannel);
						}
						else {
							let notificationsound = BDfunctionsDevilBro.loadAllData(this, "notificationsound");
							BDfunctionsDevilBro.showDesktopNotification(string, {icon:avatar, timeout:5000, click:openChannel, silent:notificationsound.mute, sound:notificationsound.song});
						}
					}
				}
				this.stalkerOnlineList[id] = online;
			}
		},BDfunctionsDevilBro.getData("checkInterval", this, "amounts") * 1000);
	}
	
	saveAudio (settingspanel) {
		var successSavedAudio = (parsedurl, parseddata) => {
			if (parsedurl && parseddata) BDfunctionsDevilBro.showToast(`Sound was saved successfully.`, {type:"success"});
			let notificationsound = BDfunctionsDevilBro.loadAllData(this, "notificationsound");
			notificationsound.url = parsedurl;
			notificationsound.song = parseddata;
			BDfunctionsDevilBro.saveAllData(notificationsound, this, "notificationsound");
		};
		
		var url = settingspanel.querySelector(".songInput").value;
		if (url.length == 0) {
			BDfunctionsDevilBro.showToast(`Sound was set to the default sound.`, {type:"warn"});
			successSavedAudio(url, url);
		}
		else if (url.indexOf("http") == 0) {
			require("request")(url, (error, response, result) => {
				if (response) {
					var type = response.headers["content-type"];
					if (type && (type.indexOf("octet-stream") > -1 || type.indexOf("audio") > -1 || type.indexOf("video") > -1)) {
						successSavedAudio(url, url);
						return;
					}
				}
				BDfunctionsDevilBro.showToast("Use a valid direct link to a video or audio source. They usually end on something like .mp3, .mp4 or .wav.", {type:"danger"});
			});
		}
		else {
			require("fs").readFile(url, (error, response) => {
				if (error) {
					BDfunctionsDevilBro.showToast("Could not fetch file. Please make sure the file exists.", {type:"danger"});
				}
				else {
					successSavedAudio(url, `data:audio/mpeg;base64,${response.toString("base64")}`);
				}
			});
		}
	}
	
	showTimeLog () {		
		var timeLogModal = $(this.timeLogModalMarkup);
		let logs = this.timeLog.slice(0).reverse();
		for (let log of logs) {
			let entry = $(this.logEntryMarkup);
			let divider = $(this.dividerMarkup);
			let data = BDfunctionsDevilBro.loadData(log.user.id, "EditUsers", "users") || {};
			entry.find(".log-time").text(`[${log.time.toLocaleTimeString()}]`);
			entry.find(".log-avatar").css("background-image", `url(${data.removeIcon ? "" : (data.url ? data.url : BDfunctionsDevilBro.getUserAvatar(log.user.id))})`);
			entry.find(".log-description").text(`${data.name ? data.name : log.user.username} is ${log.online ? "online" : "offline"}.`);
			timeLogModal.find(".entries").append(entry).append(divider);
		}
		timeLogModal.find(".divider-1G01Z9:last-of-type").remove();
		BDfunctionsDevilBro.appendModal(timeLogModal);
	}
}
