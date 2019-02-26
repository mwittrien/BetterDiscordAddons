//META{"name":"StalkerNotifications","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/StalkerNotifications","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/StalkerNotifications/StalkerNotifications.plugin.js"}*//

class StalkerNotifications {
	getName () {return "StalkerNotifications";}

	getVersion () {return "1.1.2";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Lets you observe the status of people that aren't your friends.";}

	initConstructor () {
		this.patchModules = {
			"StandardSidebarView":"componentWillUnmount"
		};
		
		this.stalkerOnlineList = {};

		this.checkInterval = null;

		this.timeLog = [];

		this.timeLogModalMarkup =
			`<span class="${this.name}-modal DevilBro-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.headertitle + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.defaultcolor + BDFDB.disCNS.h4defaultmargin + BDFDB.disCN.marginreset}">User LogIn/-Out Timelog</h4>
								</div>
								<button type="button" class="${BDFDB.disCNS.modalclose + BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookblank + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}">
										<svg name="Close" width="18" height="18" viewBox="0 0 12 12" style="flex: 0 1 auto;">
											<g fill="none" fill-rule="evenodd">
												<path d="M0 0h12v12H0"></path>
												<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
											</g>
										</svg>
									</div>
								</button>
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
			.${this.name}-modal .log-time {
				width: 110px;
			}
			.${this.name}-modal .log-avatar {
				width: 35px;
				height: 35px;
				background-size: cover;
				background-position: center;
				border-radius: 50%;
			}
			.${this.name}-settings .avatar-list {
				display: flex;
				align-items: center;
				flex-wrap: wrap;
			}
			.${this.name}-settings .type-toast, .${this.name}-settings .type-desktop {
				border-radius: 3px;
				padding: 0 3px;
			}
			.${this.name}-settings .type-toast {
				background-color: #7289DA;
			}
			.${this.name}-settings .type-desktop {
				background-color: #43B581;
			}
			.${this.name}-settings .settings-avatar.desktop {
				border-color: #43B581;
			}
			.${this.name}-settings .settings-avatar {
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
			.${this.name}-settings .settings-avatar.desktop {
				border-color: #43B581;
			} 
			.${this.name}-settings .settings-avatar.disabled {
				border-color: #36393F;
				filter: grayscale(100%) brightness(50%);
			}
			.${this.name}-settings .settings-avatar ${BDFDB.dotCN.hovercardbutton} {
				position: relative;
				top: -10px;
				right: -25px;
			}
			.${this.name}-settings .settings-avatar:not(:hover) ${BDFDB.dotCN.hovercardbutton} {
				opacity: 1;
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
			},
			amounts: {
				checkInterval:		{value:10, 		min:5,		description:"Check Users every X seconds:"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;

		let amounts = BDFDB.getAllData(this, "amounts");
		let settings = BDFDB.getAllData(this, "settings");
		let users = BDFDB.loadAllData(this, "users");
		let notificationsounds = BDFDB.getAllData(this, "notificationsounds");
		let settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 50%;">Add User:</h3><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCN.directioncolumn}" style="flex: 1 1 auto;"><input type="text" value="" placeholder="UserID" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-userid"></div><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-add btn-adduser" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div>`;
		for (let key in amounts) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 50%;">${this.defaults.amounts[key].description}</h3><div class="${BDFDB.disCN.inputwrapper} inputNumberWrapper ${BDFDB.disCNS.vertical +  BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn}" style="flex: 1 1 auto;"><span class="numberinput-buttons-zone"><span class="numberinput-button-up"></span><span class="numberinput-button-down"></span></span><input type="number"${(!isNaN(this.defaults.amounts[key].min) && this.defaults.amounts[key].min !== null ? ' min="' + this.defaults.amounts[key].min + '"' : '') + (!isNaN(this.defaults.amounts[key].max) && this.defaults.amounts[key].max !== null ? ' max="' + this.defaults.amounts[key].max + '"' : '')} option="${key}" value="${amounts[key]}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} amount-input"></div></div>`;
		}
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in notificationsounds) {
			if (key.indexOf("desktop") == -1 || "Notification" in window) settingshtml += `<div class="${BDFDB.disCNS.flexchild + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h5 class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.h5 + BDFDB.disCNS.title + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.h5defaultmargin}" style="flex: 1 1 auto;">${key} notification sound:</h5><h5 class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.h5 + BDFDB.disCNS.title + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.h5defaultmargin}" style="flex: 0 0 auto;">Mute:</h5><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" option="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} mute-checkbox"${notificationsounds[key].mute ? " checked" : ""}></div></div><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" option="${key}" value="${notificationsounds[key].url ? notificationsounds[key].url : ""}" placeholder="Url or Filepath" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} songInput"></div><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} file-navigator" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div><input type="file" accept="audio/*,video/*" style="display:none!important;"></button><button type="button" option="${key}" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-save btn-savesong" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Click on a Icon to toggle <label class="type-toast">Toast</label> Notifications for that User:</h3></div>`;
		if ("Notification" in window) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Rightclick on a Icon to toggle <label class="type-desktop">Desktop</label> Notifications for that User:</h3></div>`;
		settingshtml += `<div class="avatar-list ${BDFDB.disCN.marginbottom8}">`;
		for (let id in users) {
			let user = this.UserUtils.getUser(id);
			if (user) settingshtml += this.createSettingsAvatarHtml(user, users[id]);
		}
		settingshtml += `</div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Batch set Users:</h3><button type="button" do-disable=true class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttoncolorprimary + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} disable-all" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Disable</div></button><button type="button" do-toast=true class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} toast-all" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Toast</div></button>${"Notification" in window ? `<button type="button" do-desktop=true class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorgreen + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} desktop-all" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Desktop</div></button>` : ``}</div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Timelog of LogIns/-Outs:</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-timelog" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Timelog</div></button></div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".btn-savesong", e => {this.saveAudio(settingspanel, e.currentTarget.getAttribute("option"));})
		BDFDB.addEventListener(this, settingspanel, "click", ".mute-checkbox", e => {
			let option = e.currentTarget.getAttribute("option");
			let notificationsound = BDFDB.getData(option, this, "notificationsounds");
			notificationsound.mute = e.currentTarget.checked;
			BDFDB.saveData(option, notificationsound, this, "notificationsounds");
		});
		BDFDB.addEventListener(this, settingspanel, "mouseenter", ".settings-avatar", e => {
			let user = this.UserUtils.getUser(e.currentTarget.getAttribute("user-id"));
			let data = BDFDB.loadData(user.id, "EditUsers", "users") || {};
			BDFDB.createTooltip(data.name ? data.name : user.username, e.currentTarget, {type:"top"});
		});
		BDFDB.addEventListener(this, settingspanel, "contextmenu", ".settings-avatar", e => {
			if (!("Notification" in window)) return;
			let desktopoff = !BDFDB.containsClass(e.currentTarget, "desktop");
			let id = e.currentTarget.getAttribute("user-id");
			BDFDB.removeClass(e.currentTarget, "disabled");
			BDFDB.toggleClass(e.currentTarget, "desktop", desktopoff);
			BDFDB.saveData(id, {"desktop":desktopoff,"disabled":false}, this, "users");
		});
		BDFDB.addEventListener(this, settingspanel, "click", ".settings-avatar", e => {
			if (BDFDB.containsClass(e.target, "remove-user")) return;
			let disableoff = !BDFDB.containsClass(e.currentTarget, "disabled");
			let id = e.currentTarget.getAttribute("user-id");
			BDFDB.removeClass(e.currentTarget, "desktop");
			BDFDB.toggleClass(e.currentTarget, "disabled", disableoff);
			BDFDB.saveData(id, {"desktop":false,"disabled":disableoff}, this, "users");
		});
		BDFDB.addEventListener(this, settingspanel, "click", ".remove-user", e => {
			BDFDB.removeData(e.currentTarget.parentElement.getAttribute("user-id"), this, "users");
			BDFDB.removeEles(this.name + "-settings .settings-avatar");
			let listhtml = `<div class="avatar-list ${BDFDB.disCN.marginbottom8}">`;
			let users = BDFDB.loadAllData(this, "users");
			for (let id in users) {
				let user = this.UserUtils.getUser(id);
				if (user) listhtml += this.createSettingsAvatarHtml(user, users[id]);
			}
			listhtml += `</div>`;
			settingspanel.querySelector(".avatar-list").innerHTML = listhtml;
		});
		BDFDB.addEventListener(this, settingspanel, "click", ".disable-all, .toast-all, .desktop-all", e => {
			let disableon = e.currentTarget.getAttribute("do-disable");
			let desktopon = e.currentTarget.getAttribute("do-desktop");
			let users = BDFDB.loadAllData(this, "users");
			settingspanel.querySelectorAll(".settings-avatar").forEach(avatar => {
				let id = avatar.getAttribute("user-id");
				BDFDB.toggleClass(avatar, "disabled", disableon);
				BDFDB.toggleClass(avatar, "desktop", desktopon);
				users[id].desktop = desktopon ? true : false;
				users[id].disabled = disableon ? true : false;
			});
			BDFDB.saveAllData(users, this, "users");
		});
		BDFDB.addEventListener(this, settingspanel, "click", ".btn-adduser", e => {
			let idinput = settingspanel.querySelector("#input-userid");
			let user = this.UserUtils.getUser(idinput.value);
			if (user) {
				idinput.value = "";
				BDFDB.saveData(user.id, {desktop:false,disabled:false}, this, "users");
				BDFDB.removeEles(this.name + "-settings .settings-avatar");
				let listhtml = `<div class="avatar-list ${BDFDB.disCN.marginbottom8}">`;
				let users = BDFDB.loadAllData(this, "users");
				for (let id in users) {
					let user = this.UserUtils.getUser(id);
					if (user) listhtml += this.createSettingsAvatarHtml(user, users[id]);
				}
				listhtml += `</div>`;
				settingspanel.querySelector(".avatar-list").innerHTML = listhtml;
			}
			else BDFDB.showToast("Please enter a valid UserID.",{type:"error"});
		});
		BDFDB.addEventListener(this, settingspanel, "click", ".btn-timelog", () => {this.showTimeLog();});

		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			this.ChannelUtils = BDFDB.WebModules.findByProperties("getDMFromUserId");
			this.ChannelSwitchUtils = BDFDB.WebModules.findByProperties("selectPrivateChannel");
			this.PrivateChannelUtils = BDFDB.WebModules.findByProperties("openPrivateChannel");
			this.UserMetaStore = BDFDB.WebModules.findByProperties("getStatus", "getOnlineFriendCount");
			this.UserUtils = BDFDB.WebModules.findByProperties("getUsers");

			for (let id in BDFDB.loadAllData(this, "users")) {
				this.stalkerOnlineList[id] = this.UserMetaStore.getStatus(id) != "offline";
			}

			this.startInterval();
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			clearInterval(this.checkInterval);
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

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

	createSettingsAvatarHtml (user, settings) {
		let data = BDFDB.loadData(user.id, "EditUsers", "users") || {};
		return `<div class="settings-avatar${settings.desktop ? " desktop" : ""}${settings.disabled ? " disabled" : ""}" user-id="${user.id}" style="background-image: url(${data.removeIcon ? "" : (data.url ? data.url : BDFDB.getUserAvatar(user.id))});"><div class="${BDFDB.disCN.hovercardbutton} remove-user"></div></div>`;
	}

	processStandardSidebarView (instance, wrapper) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			this.startInterval();
		}
	}

	startInterval () {
		clearInterval(this.checkInterval);
		this.checkInterval = setInterval(() => {
			let settings = BDFDB.getAllData(this, "settings");
			let users = BDFDB.loadAllData(this, "users");
			for (let id in users) {
				let online = this.UserMetaStore.getStatus(id) != "offline";
				let user = this.UserUtils.getUser(id);
				if (user && !user.disabled && this.stalkerOnlineList[id] != online) {
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
						if (!user.desktop) {
							let toast = BDFDB.showToast(`<div class="toast-inner"><div class="toast-avatar" style="background-image:url(${avatar});"></div><div>${string}</div></div>`, {html:true, timeout:5000, type:(online ? "success" : null), icon:false, selector:`stalkernotifications-${online ? "online" : "offline"}-toast`});
							toast.addEventListener("click", openChannel);
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
				this.stalkerOnlineList[id] = online;
			}
		},BDFDB.getData("checkInterval", this, "amounts") * 1000);
	}

	showTimeLog () {
		let timeLogModal = BDFDB.htmlToElement(this.timeLogModalMarkup);
		let container = timeLogModal.querySelector(".entries");
		if (!container) return;
		let logs = this.timeLog.slice(0).reverse();
		for (let log of logs) {
			if (container.childElementCount) container.appendChild(BDFDB.htmlToElement(`<div class="${BDFDB.disCN.modaldivider}"></div>`));
			let data = BDFDB.loadData(log.user.id, "EditUsers", "users") || {};
			let entry = BDFDB.htmlToElement(this.logEntryMarkup);
			entry.querySelector(".log-time").innerText = `[${log.time.toLocaleTimeString()}]`;
			entry.querySelector(".log-avatar").style.setProperty("background-image", `url(${data.removeIcon ? "" : (data.url ? data.url : BDFDB.getUserAvatar(log.user.id))})`);
			entry.querySelector(".log-description").innerText = `${data.name || log.user.username} is ${log.online ? "online" : "offline"}.`;
			container.appendChild(entry)
		}
		BDFDB.appendModal(timeLogModal);
	}
}