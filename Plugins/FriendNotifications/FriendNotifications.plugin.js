//META{"name":"FriendNotifications"}*//

class FriendNotifications {
	initConstructor () {
		this.patchModules = {
			"FluxContainer(FriendsOnline)":["componentDidMount","componentDidUpdate"]
		};
		
		this.friendsOnlineList = {};
		
		this.timeLog = [];

		this.timeLogModalMarkup =
			`<span class="${this.getName()}-modal DevilBro-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.headertitle + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.defaultcolor + BDFDB.disCNS.h4defaultmargin + BDFDB.disCN.marginreset}">Friends LogIn/-Out Timelog</h4>
								</div>
								<svg class="${BDFDB.disCNS.modalclose + BDFDB.disCN.flexchild}" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
									<g fill="none" fill-rule="evenodd">
										<path d="M0 0h12v12H0"></path>
										<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
									</g>
								</svg>
							</div>
							<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner} entries">
								</div>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontalreverse + BDFDB.disCNS.horizontalreverse2 + BDFDB.disCNS.directionrowreverse + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalfooter}">
								<button type="button" class="btn-ok ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}"></div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;

		this.logEntryMarkup =
			`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4} entry" style="flex: 1 1 auto;">
				<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCNS.flexchild + BDFDB.disCNS.overflowellipsis} log-time" style="flex: 0 0 auto;"></h3>
				<div class="log-avatar"></div>
				<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCNS.flexchild + BDFDB.disCNS.overflowellipsis} log-description" style="flex: 1 1 auto;"></h3>
			</div>`;
			
		this.dividerMarkup = `<div class="${BDFDB.disCN.modaldivider}"></div>`;
		
		this.css = `
			${BDFDB.dotCN.guilds} > ${BDFDB.dotCN.friendsonline} {
				cursor: pointer;
			}
			.${this.getName()}-modal .log-time {
				width: 110px;
			}
			.${this.getName()}-modal .log-avatar {
				width: 35px;
				height: 35px;
				background-size: cover;
				background-position: center;
				border-radius: 50%;
			}
			.${this.getName()}-settings .avatar-list {
				display: flex;
				align-items: center;
				flex-wrap: wrap;
			}
			.${this.getName()}-settings .type-toast, .${this.getName()}-settings .type-desktop {
				border-radius: 3px;
				padding: 0 3px;
			}
			.${this.getName()}-settings .type-toast {
				background-color: #7289DA;
			}
			.${this.getName()}-settings .type-desktop {
				background-color: #43B581;
			}
			.${this.getName()}-settings .settings-avatar.desktop {
				border-color: #43B581;
			}
			.${this.getName()}-settings .settings-avatar {
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
			.${this.getName()}-settings .settings-avatar.desktop {
				border-color: #43B581;
			} 
			.${this.getName()}-settings .settings-avatar.disabled {
				border-color: #36393F;
				filter: grayscale(100%) brightness(50%);
			}`;
			
		this.defaults = {
			settings: {
				muteOnDND:			{value:false, 	description:"Do not notify me when I am DnD:"},
				onlyOnOnline:		{value:false, 	description:"Only notify me when a User logs in:"},
				openOnClick:		{value:false, 	description:"Open the DM when you click a Notification:"}
			},
			notificationsounds: {
				toastonline: 		{value:{url:null,song:null,mute:false}},
				toastoffline: 		{value:{url:null,song:null,mute:false}},
				desktoponline: 		{value:{url:null,song:null,mute:false}},
				desktopoffline: 	{value:{url:null,song:null,mute:false}}
			}
		};
	}

	getName () {return "FriendNotifications";}

	getDescription () {return "Notifies you when a friend either logs in or out. Click the Online Friend-Counter to display a timelog of the current session.";}

	getVersion () {return "1.1.5";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		
		let settings = BDFDB.getAllData(this, "settings");
		let notificationsounds = BDFDB.getAllData(this, "notificationsounds");
		let desktop = BDFDB.loadAllData(this, "desktop");
		let disabled = BDFDB.loadAllData(this, "disabled");
		let settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-checkbox"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in notificationsounds) {
			if (key.indexOf("desktop") == -1 || "Notification" in window) settingshtml += `<div class="${BDFDB.disCNS.flexchild + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h5 class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.h5 + BDFDB.disCNS.title + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.h5defaultmargin}" style="flex: 1 1 auto;">${key} notification sound:</h5><h5 class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.h5 + BDFDB.disCNS.title + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.h5defaultmargin}" style="flex: 0 0 auto;">Mute:</h5><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" option="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} mute-checkbox"${notificationsounds[key].mute ? " checked" : ""}></div></div><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" option="${key}" value="${notificationsounds[key].url ? notificationsounds[key].url : ""}" placeholder="Url or Filepath" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} songInput"></div><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} file-navigator" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div><input type="file" accept="audio/*,video/*" style="display:none!important;"></button><button type="button" option="${key}" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-save btn-savesong" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Click on a Icon to toggle <label class="type-toast">Toast</label> Notifications for that User:</h3></div>`;
		if ("Notification" in window) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Rightclick on a Icon to toggle <label class="type-desktop">Desktop</label> Notifications for that User:</h3></div>`;
		settingshtml += `<div class="avatar-list ${BDFDB.disCN.marginbottom8}">`;
		for (let id of this.FriendUtils.getFriendIDs()) {
			let user = this.UserUtils.getUser(id);
			if (user) {
				let data = BDFDB.loadData(user.id, "EditUsers", "users") || {};
				settingshtml += `<div class="settings-avatar${desktop[id] ? " desktop" : ""}${disabled[id] ? " disabled" : ""}" user-id="${id}" style="background-image: url(${data.removeIcon ? "" : (data.url ? data.url : BDFDB.getUserAvatar(user.id))});"></div>`;
			}
		}
		settingshtml += `</div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Batch set Users:</h3><button type="button" do-disable=true class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttoncolorprimary + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} disable-all" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Disable</div></button><button type="button" do-toast=true class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} toast-all" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Toast</div></button>${"Notification" in window ? `<button type="button" do-desktop=true class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorgreen + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} desktop-all" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Desktop</div></button>` : ``}</div>`;
		settingshtml += `</div></div>`;
			
		let settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".settings-checkbox", () => {this.updateSettings(settingspanel);})
			.on("click", ".btn-savesong", (e) => {this.saveAudio(settingspanel, e.currentTarget.getAttribute("option"));})
			.on("click", ".mute-checkbox", (e) => {
				let option = e.currentTarget.getAttribute("option");
				let notificationsound = BDFDB.getData(option, this, "notificationsounds");
				notificationsound.mute = e.currentTarget.checked;
				BDFDB.saveData(option, notificationsound, this, "notificationsounds");
			})
			.on("mouseenter", ".settings-avatar", (e) => {
				let user = this.UserUtils.getUser(e.currentTarget.getAttribute("user-id"));
				let data = BDFDB.loadData(user.id, "EditUsers", "users") || {};
				BDFDB.createTooltip(data.name ? data.name : user.username, e.currentTarget, {type:"top"});
			})
			.on("contextmenu", ".settings-avatar", (e) => {
				if (!("Notification" in window)) return;
				let desktopoff = !e.currentTarget.classList.contains("desktop");
				let id = e.currentTarget.getAttribute("user-id");
				e.currentTarget.classList.remove("disabled");
				e.currentTarget.classList.toggle("desktop", desktopoff);
				BDFDB.saveData(id, desktopoff, this, "desktop");
				BDFDB.removeData(id, this, "disabled");
			})
			.on("click", ".settings-avatar", (e) => {
				let disableoff = !e.currentTarget.classList.contains("disabled");
				let id = e.currentTarget.getAttribute("user-id");
				e.currentTarget.classList.remove("desktop");
				e.currentTarget.classList.toggle("disabled", disableoff);
				BDFDB.saveData(id, disableoff, this, "disabled");
				BDFDB.removeData(id, this, "desktop");
			})
			.on("click", ".disable-all, .toast-all, .desktop-all", (e) => {
				let button = e.currentTarget;
				let disableon = button.getAttribute("do-disable");
				let desktopon = button.getAttribute("do-desktop");
				let disabledata = BDFDB.loadAllData(this, "disabled");
				let desktopdata = BDFDB.loadAllData(this, "desktop");
				settingspanel.querySelectorAll(".settings-avatar").forEach(avatar => {
					let id = avatar.getAttribute("user-id");
					avatar.classList.toggle("disabled", disableon);
					avatar.classList.toggle("desktop", desktopon);
					disableon ? disabledata[id] = true : delete disabledata[id];
					desktopon ? desktopdata[id] = true : delete desktopdata[id];
				});
				BDFDB.saveAllData(disabledata, this, "disabled");
				BDFDB.saveAllData(desktopdata, this, "desktop");
			});
			
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		let libraryScript = null;
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
			
			this.FriendUtils = BDFDB.WebModules.findByProperties("getFriendIDs", "getRelationships");
			this.ChannelUtils = BDFDB.WebModules.findByProperties("getDMFromUserId");
			this.ChannelSwitchUtils = BDFDB.WebModules.findByProperties("selectPrivateChannel");
			this.PrivateChannelUtils = BDFDB.WebModules.findByProperties("openPrivateChannel");
			this.UserMetaStore = BDFDB.WebModules.findByProperties("getStatus", "getOnlineFriendCount");
			this.UserUtils = BDFDB.WebModules.findByProperties("getUsers");
			
			for (let id of this.FriendUtils.getFriendIDs()) {
				this.friendsOnlineList[id] = this.UserMetaStore.getStatus(id) != "offline";
			}
				
			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			BDFDB.unloadMessage(this);
		}
	}
	
	
	// begin of own functions

	updateSettings (settingspanel) {
		let settings = {};
		for (let input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner + ".settings-checkbox")) {
			settings[input.value] = input.checked;
		}
		BDFDB.saveAllData(settings, this, "settings");
	}
	
	saveAudio (settingspanel, option) {
		let successSavedAudio = (parsedurl, parseddata) => {
			if (parsedurl && parseddata) BDFDB.showToast(`Sound was saved successfully.`, {type:"success"});
			let notificationsound = BDFDB.getData(option, this, "notificationsounds");
			notificationsound.url = parsedurl;
			notificationsound.song = parseddata;
			BDFDB.saveData(option, notificationsound, this, "notificationsounds");
		};
		
		let url = settingspanel.querySelector(`.songInput[option="${option}"]`).value;
		if (url.length == 0) {
			BDFDB.showToast(`Sound file was removed.`, {type:"warn"});
			successSavedAudio(url, url);
		}
		else if (url.indexOf("http") == 0) {
			require("request")(url, (error, response, result) => {
				if (response) {
					let type = response.headers["content-type"];
					if (type && (type.indexOf("octet-stream") > -1 || type.indexOf("audio") > -1 || type.indexOf("video") > -1)) {
						successSavedAudio(url, url);
						return;
					}
				}
				BDFDB.showToast("Use a valid direct link to a video or audio source. They usually end on something like .mp3, .mp4 or .wav.", {type:"danger"});
			});
		}
		else {
			require("fs").readFile(url, (error, response) => {
				if (error) BDFDB.showToast("Could not fetch file. Please make sure the file exists.", {type:"danger"});
				else successSavedAudio(url, `data:audio/mpeg;base64,${response.toString("base64")}`);
			});
		}
	}
	
	processFluxContainerFriendsOnline (instance, wrapper) {
		$(wrapper)
			.off("." + this.getName())
			.on("mouseenter." + this.getName(), (e) => {
				BDFDB.createTooltip("Timelog", e.currentTarget, {type:"right"});
			})
			.on("click." + this.getName(), (e) => {
				this.showTimeLog();
			});
			
		let settings = BDFDB.getAllData(this, "settings");
		for (let id of this.FriendUtils.getFriendIDs()) {
			let online = this.UserMetaStore.getStatus(id) != "offline";
			let user = this.UserUtils.getUser(id);
			if (user && this.friendsOnlineList[id] != online && !BDFDB.loadData(id, this, "disabled")) {
				this.timeLog.push({user, online, time: new Date()});
				if (!(settings.onlyOnOnline && !online) && !(settings.muteOnDND && BDFDB.getUserStatus() == "dnd")) {
					let data = BDFDB.loadData(user.id, "EditUsers", "users") || {};
					let string = `${BDFDB.encodeToHTML(data.name ? data.name : user.username)} is ${online ? "online" : "offline"}.`;
					let avatar = data.removeIcon ? "" : (data.url ? data.url : BDFDB.getUserAvatar(user.id));
					let openChannel = () => {
						if (settings.openOnClick) {
							let DMid = this.ChannelUtils.getDMFromUserId(user.id)
							if (DMid) this.ChannelSwitchUtils.selectPrivateChannel(DMid);
							else this.PrivateChannelUtils.openPrivateChannel(BDFDB.myData.id, user.id);
							require("electron").remote.getCurrentWindow().maximize();
						}
					};
					if (!BDFDB.loadData(id, this, "desktop")) {
						let toast = BDFDB.showToast(`<div class="toast-inner"><div class="toast-avatar" style="background-image:url(${avatar});"></div><div>${string}</div></div>`, {html:true, timeout:5000, type:(online ? "success" : null), icon:false});
						$(toast).on("click." + this.getName(), openChannel);
						let notificationsound = BDFDB.getData(online ? "toastonline" : "toastoffline", this, "notificationsounds");
						if (!notificationsound.mute && notificationsound.song) {
							let audio = new Audio();
							audio.src = notificationsound.song;
							audio.play();
						}
					}
					else {
						let notificationsound = BDFDB.getData(online ? "desktoponline" : "desktopoffline", this, "notificationsounds");
						BDFDB.showDesktopNotification(string, {icon:avatar, timeout:5000, click:openChannel, silent:notificationsound.mute, sound:notificationsound.song});
					}
				}
			}
			this.friendsOnlineList[id] = online;
		}
	}
	
	showTimeLog () {		
		let timeLogModal = $(this.timeLogModalMarkup);
		let logs = this.timeLog.slice(0).reverse();
		for (let log of logs) {
			let entry = $(this.logEntryMarkup);
			let divider = $(this.dividerMarkup);
			let data = BDFDB.loadData(log.user.id, "EditUsers", "users") || {};
			entry.find(".log-time").text(`[${log.time.toLocaleTimeString()}]`);
			entry.find(".log-avatar").css("background-image", `url(${data.removeIcon ? "" : (data.url ? data.url : BDFDB.getUserAvatar(log.user.id))})`);
			entry.find(".log-description").text(`${data.name ? data.name : log.user.username} is ${log.online ? "online" : "offline"}.`);
			timeLogModal.find(".entries").append(entry).append(divider);
		}
		BDFDB.removeEles("." + this.getName() + "-modal " + BDFDB.dotCN.modaldivider + ":last-of-type");
		BDFDB.appendModal(timeLogModal);
	}
}