//META{"name":"FriendNotifications","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/FriendNotifications","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/FriendNotifications/FriendNotifications.plugin.js"}*//

class FriendNotifications {
	getName () {return "FriendNotifications";}

	getVersion () {return "1.3.3";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Notifies you when a Friend or a User your choose to observe changing his online status, can be configured individually in the settings.";}

	constructor () {
		this.changelog = {
			"added":[["Toast/Desktop Time","The amount of seconds a toast or desktop notification is on screen can now be configured in the settings"]],
			"fixed":[["Double notifications","It now should be impossible for the plugin to trigger double notifications, if this problem still occurs to you, then something is wrong on your end (double plugin file or two different versions at the same time)"],["Listening/Playing/Streaming","Fixed notifications not showing for those types"]]
		};
		
		this.patchModules = {
			"StandardSidebarView":"componentWillUnmount"
		};
	}

	initConstructor () {
		this.userStatusStore = {};

		this.checkInterval = null;

		this.timeLog = [];

		this.timeLogModalMarkup =
			`<span class="${this.name}-modal BDFDB-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.defaultcolor + BDFDB.disCN.h4defaultmargin}">Friends LogIn/-Out Timelog</h4>
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
							<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.scrollerthemeghosthairline}">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner} entries">
								</div>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontalreverse + BDFDB.disCNS.horizontalreverse2 + BDFDB.disCNS.directionrowreverse + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalfooter}">
								<button type="button" class="btn-ok ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}"></div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;

		this.logEntryMarkup =
			`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4} entry" style="flex: 1 1 auto;">
				<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCNS.flexchild + BDFDB.disCNS.overflowellipsis} log-time" style="flex: 0 0 auto;"></h3>
				<div class="log-avatar"></div>
				<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCNS.flexchild + BDFDB.disCNS.overflowellipsis} log-description" style="flex: 1 1 auto;"></h3>
			</div>`;

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
				width: 35px;
				height: 35px;
				background-size: cover;
				background-position: center;
				border: 3px solid #7289DA;
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
			.${this.name}-settings .settings-avatar.disabled ~ * {
				filter: grayscale(100%) brightness(50%);
			}`;

		this.defaults = {
			settings: {
				disableForNew:		{value:false, 	description:"Disable Notifications for newly added Friends:"},
				muteOnDND:			{value:false, 	description:"Do not notify me when I am DnD:"},
				openOnClick:		{value:false, 	description:"Open the DM when you click a Notification:"}
			},
			notificationstrings: {
				online: 			{value:"$user changed status to '$status'",			libstring:"STATUS_ONLINE",			init:true},
				mobile: 			{value:"$user changed status to '$status'",			libstring:"STATUS_ONLINE_MOBILE",	init:true},
				idle: 				{value:"$user changed status to '$status'",			libstring:"STATUS_IDLE",			init:false},
				dnd: 				{value:"$user changed status to '$status'",			libstring:"STATUS_DND",				init:false},
				playing: 			{value:"$user started playing '$game'",				statusname:"Playing",				init:false},
				listening: 			{value:"$user started listening to '$song'",		statusname:"Listening",				init:false},
				streaming: 			{value:"$user started streaming '$game'",			libstring:"STATUS_STREAMING",		init:false},
				offline: 			{value:"$user changed status to '$status'",			libstring:"STATUS_OFFLINE",			init:true}
			},
			notificationsounds: {},
			amounts: {
				toastTime:			{value:5, 		min:1,		description:"Amount of seconds a toast notification stays on screen:"},
				desktopTime:		{value:5, 		min:1,		description:"Amount of seconds a desktop notification stays on screen:"},
				checkInterval:		{value:10, 		min:5,		description:"Check Users every X seconds:"}
			}
		};
		
		for (let type in this.defaults.notificationstrings) {
			this.defaults.notificationsounds["toast" + type] = {value:{url:null,song:null,mute:false}};
			this.defaults.notificationsounds["desktop" + type] = {value:{url:null,song:null,mute:false}};
		}

		this.activityTypes = {};
		for (let type in BDFDB.DiscordConstants.ActivityTypes) this.activityTypes[BDFDB.DiscordConstants.ActivityTypes[type]] = type;
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;

		let settings = BDFDB.DataUtils.get(this, "settings");
		let notificationstrings = BDFDB.DataUtils.get(this, "notificationstrings");
		let notificationsounds = BDFDB.DataUtils.get(this, "notificationsounds");
		let amounts = BDFDB.DataUtils.get(this, "amounts");

		let friendIDs = BDFDB.LibraryModules.FriendUtils.getFriendIDs();
		let friends = BDFDB.DataUtils.load(this, "friends");
		let nonfriends = BDFDB.DataUtils.load(this, "nonfriends");

		let settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.titlesize18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		settingshtml += `<div class="${BDFDB.disCNS.h2 + BDFDB.disCNS.cursorpointer + BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4} BDFDB-containertext"><span class="BDFDB-containerarrow closed"></span>General Settings</div><div class="BDFDB-collapsecontainer">`;
		for (let key in settings) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		for (let key in amounts) if (key.indexOf("desktop") == -1 || "Notification" in window) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCN.flexchild}" style="flex: 0 0 80%;">${this.defaults.amounts[key].description}</h3><div class="${BDFDB.disCN.inputwrapper} inputNumberWrapper ${BDFDB.disCNS.vertical}" style="flex: 1 1 auto;"><span class="numberinput-buttons-zone"><span class="numberinput-button-up"></span><span class="numberinput-button-down"></span></span><input type="number"${(!isNaN(this.defaults.amounts[key].min) && this.defaults.amounts[key].min !== null ? ' min="' + this.defaults.amounts[key].min + '"' : '') + (!isNaN(this.defaults.amounts[key].max) && this.defaults.amounts[key].max !== null ? ' max="' + this.defaults.amounts[key].max + '"' : '')} option="${key}" value="${amounts[key]}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.titlesize16} amount-input"></div></div>`;
		settingshtml += `</div><div class="${BDFDB.disCNS.divider + BDFDB.disCN.marginbottom4}"></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.h2 + BDFDB.disCNS.cursorpointer + BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4} BDFDB-containertext"><span class="BDFDB-containerarrow closed"></span>Friend-List</div><div class="BDFDB-collapsecontainer">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Click on an Icon to toggle <label class="type-toast">Toast</label> Notifications for that User:</h3></div>`;
		if ("Notification" in window) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Rightclick on an Icon to toggle <label class="type-desktop">Desktop</label> Notifications for that User:</h3></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Click/Rightclick on the table headers to batch set all Friends</h3></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} BDFDB-tableheader" table-id="friends" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild} BDFDB-tableheadertext"><div class="${BDFDB.disCNS.margintop8 + BDFDB.disCNS.tableheadersize + BDFDB.disCNS.titlesize10 + BDFDB.disCNS.primary + BDFDB.disCNS.weightbold + BDFDB.disCN.cursorpointer} btn-batch" group="friends" config="desktop" style="display: inline-block; margin: 0 25px;">TYPE</div><div class="${BDFDB.disCNS.margintop8 + BDFDB.disCNS.tableheadersize + BDFDB.disCNS.titlesize10 + BDFDB.disCNS.primary + BDFDB.disCNS.weightbold + BDFDB.disCN.cursorpointer} btn-batch" group="friends" config="disabled" style="display: inline-block;">DISABLE</div></h3><div class="${BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifycenter + BDFDB.disCNS.alignend + BDFDB.disCN.nowrap} BDFDB-tableheadercolumns">`;
		for (let config in this.defaults.notificationstrings) settingshtml += `<div class="${BDFDB.disCNS.margintop8 + BDFDB.disCNS.tableheadersize + BDFDB.disCNS.titlesize10 + BDFDB.disCNS.primary + BDFDB.disCNS.weightbold + BDFDB.disCN.cursorpointer} BDFDB-tableheadercolumn" config="${config}" group="friends">${config.toUpperCase()}</div>`;
		settingshtml += `</div></div><div class="BDFDB-settings-inner-list friend-list ${BDFDB.disCN.marginbottom8}">`;
		for (let id of friendIDs) {
			let user = BDFDB.LibraryModules.UserStore.getUser(id);
			if (user) {
				let friend = null;
				if (friends[id]) {}
				else if (nonfriends[id]) {
					friends[id] = Object.assign({}, nonfriends[id]);
					delete nonfriends[id];
				}
				else friends[id] = this.createDefaultConfig();
				settingshtml += this.createHoverCard(user, friends[id], "friends");
			}
		}
		settingshtml += `</div>`;
		settingshtml += `</div><div class="${BDFDB.disCNS.divider + BDFDB.disCN.marginbottom4}"></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.h2 + BDFDB.disCNS.cursorpointer + BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4} BDFDB-containertext"><span class="BDFDB-containerarrow closed"></span>Non-Friend-List</div><div class="BDFDB-collapsecontainer">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Click on a Icon to toggle <label class="type-toast">Toast</label> Notifications for that User:</h3></div>`;
		if ("Notification" in window) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Rightclick on a Icon to toggle <label class="type-desktop">Desktop</label> Notifications for that User:</h3></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Click/Rightclick on the table headers to batch set all Non-Friends</h3></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCN.flexchild}" style="flex: 0 0 50%;">Add Non-Friend:</h3><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex2 + BDFDB.disCN.directioncolumn}" style="flex: 1 1 auto;"><input type="text" value="" placeholder="UserID" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.titlesize16}" id="input-userid"></div><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-add btn-adduser" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} BDFDB-tableheader" table-id="nonfriends" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild} BDFDB-tableheadertext"><div class="${BDFDB.disCNS.margintop8 + BDFDB.disCNS.tableheadersize + BDFDB.disCNS.titlesize10 + BDFDB.disCNS.primary + BDFDB.disCNS.weightbold + BDFDB.disCN.cursorpointer} btn-batch" group="nonfriends" config="desktop" style="display: inline-block; margin: 0 25px;">TYPE</div><div class="${BDFDB.disCNS.margintop8 + BDFDB.disCNS.tableheadersize + BDFDB.disCNS.titlesize10 + BDFDB.disCNS.primary + BDFDB.disCNS.weightbold + BDFDB.disCN.cursorpointer} btn-batch" group="nonfriends" config="disabled" style="display: inline-block;">DISABLE</div></h3><div class="${BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifycenter + BDFDB.disCNS.alignend + BDFDB.disCN.nowrap} BDFDB-tableheadercolumns">`;
		for (let config in this.defaults.notificationstrings) settingshtml += `<div class="${BDFDB.disCNS.margintop8 + BDFDB.disCNS.tableheadersize + BDFDB.disCNS.titlesize10 + BDFDB.disCNS.primary + BDFDB.disCNS.weightbold + BDFDB.disCN.cursorpointer} BDFDB-tableheadercolumn" config="${config}" group="nonfriends">${config.toUpperCase()}</div>`;
		settingshtml += `</div></div><div class="BDFDB-settings-inner-list nonfriend-list ${BDFDB.disCN.marginbottom8}">`;
		for (let id in nonfriends) if (!friendIDs.includes(id)) {
			let user = BDFDB.LibraryModules.UserStore.getUser(id);
			if (user) {
				delete friends[id];
				settingshtml += this.createHoverCard(user, nonfriends[id] || (nonfriends[id] = this.createDefaultConfig()), "nonfriends");
			}
		}
		settingshtml += `</div>`;
		settingshtml += `</div><div class="${BDFDB.disCNS.divider + BDFDB.disCN.marginbottom4}"></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.h2 + BDFDB.disCNS.cursorpointer + BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4} BDFDB-containertext"><span class="BDFDB-containerarrow closed"></span>Timelog</div><div class="BDFDB-collapsecontainer">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Timelog of LogIns/-Outs:</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-timelog" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Timelog</div></button></div>`;
		settingshtml += `</div><div class="${BDFDB.disCNS.divider + BDFDB.disCN.marginbottom4}"></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.h2 + BDFDB.disCNS.cursorpointer + BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4} BDFDB-containertext"><span class="BDFDB-containerarrow closed"></span>Notification Message Settings</div><div class="BDFDB-collapsecontainer">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}">Allows you to configure your own message strings for the different statuses. <strong>$user</strong> is the placeholder for the username, <strong>$status</strong> for the statusname, <strong>$game</strong> for the gamename, <strong>$song</strong> for the songname and <strong>$artist</strong> for the songartist.</h3></div>`;
		for (let config in notificationstrings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCN.flexchild}" style="flex: 0 0 30%;">${config.charAt(0).toUpperCase() + config.slice(1)} Message:</h3><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex2 + BDFDB.disCN.directioncolumn}" style="flex: 1 1 auto;"><input type="text" config="${config}" value="${notificationstrings[config]}" placeholder="${this.defaults.notificationstrings[config].value}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.titlesize16} input-notificationstring"></div></div>`;
		}
		settingshtml += `</div><div class="${BDFDB.disCNS.divider + BDFDB.disCN.marginbottom4}"></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.h2 + BDFDB.disCNS.cursorpointer + BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4} BDFDB-containertext"><span class="BDFDB-containerarrow closed"></span>Notification Sound Settings</div><div class="BDFDB-collapsecontainer">`;
		for (let config in notificationsounds) if (config.indexOf("desktop") == -1 || "Notification" in window) settingshtml += `<div class="${BDFDB.disCNS.flexchild + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h5 class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.h5 + BDFDB.disCNS.title + BDFDB.disCNS.titlesize12 + BDFDB.disCNS.height16 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.h5defaultmargin}" style="flex: 1 1 auto;">${config} notification sound:</h5><h5 class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.h5 + BDFDB.disCNS.title + BDFDB.disCNS.titlesize12 + BDFDB.disCNS.height16 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.h5defaultmargin}" style="flex: 0 0 auto;">Mute:</h5><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" config="${config}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} mute-checkbox"${notificationsounds[config].mute ? " checked" : ""}></div></div><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex2 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" config="${config}" value="${notificationsounds[config].url ? notificationsounds[config].url : ""}" placeholder="Url or Filepath" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.titlesize16}"></div><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} file-navigator" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div><input type="file" accept="audio/*,video/*" style="display:none!important;"></button><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-save btn-savesong" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div></div>`;
		settingshtml += `</div>`;
		settingshtml += `</div></div>`;

		BDFDB.DataUtils.save(friends, this, "friends");
		BDFDB.DataUtils.save(nonfriends, this, "nonfriends");

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.ListenerUtils.add(this, settingspanel, "keyup", ".input-notificationstring", e => {this.saveNotificationString(e.currentTarget);});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".btn-savesong", e => {this.saveNotificationSound(e.currentTarget.parentElement.querySelector(BDFDB.dotCN.input));});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".mute-checkbox", e => {
			let config = e.currentTarget.getAttribute("config");
			if (config) {
				let notificationsound = BDFDB.DataUtils.get(this, "notificationsounds", config);
				notificationsound.mute = e.currentTarget.checked;
				BDFDB.DataUtils.save(notificationsound, this, "notificationsounds", config);
			}
		});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".settings-avatar", e => {
			this.changeNotificationType(e.currentTarget, false, !BDFDB.containsClass(e.currentTarget, "disabled", "desktop", false));
		});
		BDFDB.ListenerUtils.add(this, settingspanel, "contextmenu", ".settings-avatar", e => {
			if (!("Notification" in window)) return;
			this.changeNotificationType(e.currentTarget, true, !(BDFDB.containsClass(e.currentTarget, "disabled") || !BDFDB.containsClass(e.currentTarget, "desktop")));
		});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".btn-batch", e => {
			this.changeAllNotificationTypes(settingspanel, e.currentTarget, true);
		});
		BDFDB.ListenerUtils.add(this, settingspanel, "contextmenu", ".btn-batch", e => {
			this.changeAllNotificationTypes(settingspanel, e.currentTarget, false);
		});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", BDFDB.dotCN.checkboxinput, e => {
			if (BDFDB.containsClass(e.target, "remove-user")) return;
			this.changeNotificationConfig(e.currentTarget);
		});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".BDFDB-tableheadercolumn", e => {
			this.changeAllNotificationConfigs(settingspanel, e.currentTarget, true);
		});
		BDFDB.ListenerUtils.add(this, settingspanel, "contextmenu", ".BDFDB-tableheadercolumn", e => {
			this.changeAllNotificationConfigs(settingspanel, e.currentTarget, false);
		});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".remove-user", e => {
			let id = e.currentTarget.getAttribute("user-id");
			let group = e.currentTarget.getAttribute("group");
			if (id && group) {
				BDFDB.DataUtils.remove(this, group, id);
				BDFDB.removeEles(BDFDB.getParentEle(BDFDB.dotCN.hovercard, e.currentTarget));
				this.SettingsUpdated = true;
			}
		});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".btn-adduser", e => {
			let idinput = settingspanel.querySelector("#input-userid");
			let id = idinput.value;
			idinput.value = "";
			if (friendIDs.includes(id)) BDFDB.NotificationUtils.toast("User is already a friend of yours. Please use the 'Friends' area to configure him/her.", {type:"error"});
			else if (BDFDB.DataUtils.load(this, "nonfriends")) BDFDB.NotificationUtils.toast("User is already being observed as a 'Non-Friend'.", {type:"error"}, id);
			else {
				let user = BDFDB.LibraryModules.UserStore.getUser(id);
				if (user) {
					let data = this.createDefaultConfig();
					BDFDB.DataUtils.save(data, this, "nonfriends", user.id);
					let hovercard = BDFDB.htmlToElement(this.createHoverCard(user, data, "nonfriends"));
					settingspanel.querySelector(".nonfriend-list").appendChild(hovercard);
					BDFDB.initElements(hovercard);
					this.SettingsUpdated = true;
				}
				else if (/.+#[0-9]{4}/.test(id)) BDFDB.NotificationUtils.toast("A UserID does not consist of the username and discriminator.", {type:"error"});
				else BDFDB.NotificationUtils.toast("Please enter a valid UserID of a user that has been loaded in your client.", {type:"error"});
			}
		});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".btn-timelog", () => {this.showTimeLog();});

		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);

			this.startInterval();

			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			clearInterval(this.checkInterval);
			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	createHoverCard (user, data, group) {
		let EUdata = BDFDB.DataUtils.load("EditUsers", "users", user.id) || {};
		var hovercardhtml = `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="settings-avatar${data.desktop ? " desktop" : ""}${data.disabled ? " disabled" : ""}" group="${group}" user-id="${user.id}" style="flex: 0 0 auto; background-image: url(${EUdata.removeIcon ? "" : (EUdata.url ? EUdata.url : BDFDB.UserUtils.getAvatar(user.id))});"></div><div class="BDFDB-textscrollwrapper" style="flex: 1 1 auto;"><div class="BDFDB-textscroll">${BDFDB.encodeToHTML(EUdata.name || user.username)}</div></div>`;
		for (let config in this.defaults.notificationstrings) {
			hovercardhtml += `<div class="${BDFDB.disCNS.checkboxcontainer + BDFDB.disCN.marginreset} BDFDB-tablecheckbox" table-id="${group}" style="flex: 0 0 auto;"><label class="${BDFDB.disCN.checkboxwrapper}"><input user-id="${user.id}" group="${group}" config="${config}" type="checkbox" class="${BDFDB.disCN.checkboxinputdefault}"${data[config] ? " checked" : ""}><div class="${BDFDB.disCNS.checkbox + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex2 + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.checkboxround}"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label></div>`;
		}
		return hovercardhtml + `</div>${group == "nonfriends" ? `<div class="${BDFDB.disCN.hovercardbutton} remove-user" group="${group}" user-id="${user.id}"></div>` : ''}</div>`
	}

	changeNotificationType (avatar, desktopon, disableon) {
		let id = avatar.getAttribute("user-id");
		let group = avatar.getAttribute("group");
		if (id && group) {
			let data = BDFDB.DataUtils.load(this, group, id) || this.createDefaultConfig();
			data.desktop = desktopon;
			data.disabled = disableon;
			BDFDB.toggleClass(avatar, "desktop", desktopon);
			BDFDB.toggleClass(avatar, "disabled", disableon);
			BDFDB.DataUtils.save(data, this, group, id);
			this.SettingsUpdated = true;
		}
	}

	changeAllNotificationTypes (settingspanel, tableheader, enable) {
		let config = tableheader.getAttribute("config");
		let group = tableheader.getAttribute("group");
		if (config && group) {
			let data = BDFDB.DataUtils.load(this, group);
			if (config == "desktop") {
				enable = !enable;
				for (let id in data) data[id].disabled = false;
				for (let avatar of settingspanel.querySelectorAll(`.settings-avatar[group="${group}"]`)) BDFDB.removeClass(avatar, "disabled");
			}
			for (let id in data) data[id][config] = enable;
			for (let avatar of settingspanel.querySelectorAll(`.settings-avatar[group="${group}"]`)) BDFDB.toggleClass(avatar, config, enable);
			BDFDB.DataUtils.save(data, this, group);
			this.SettingsUpdated = true;
		}
	}

	changeNotificationConfig (checkbox) {
		let id = checkbox.getAttribute("user-id");
		let config = checkbox.getAttribute("config");
		let group = checkbox.getAttribute("group");
		if (id && config && group) {
			let data = BDFDB.DataUtils.load(this, group, id) || this.createDefaultConfig();
			data[config] = checkbox.checked;
			BDFDB.DataUtils.save(data, this, group, id);
			this.SettingsUpdated = true;
		}
	}

	changeAllNotificationConfigs (settingspanel, tableheader, enable) {
		let config = tableheader.getAttribute("config");
		let group = tableheader.getAttribute("group");
		if (config && group) {
			let data = BDFDB.DataUtils.load(this, group);
			for (let id in data) data[id][config] = enable;
			BDFDB.DataUtils.save(data, this, group);
			for (let checkbox of settingspanel.querySelectorAll(`${BDFDB.dotCN.checkboxinput}[config="${config}"][group="${group}"]`)) {
				checkbox.checked = enable;
				if (typeof checkbox.BDFDBupdateElement == "function") checkbox.BDFDBupdateElement();
			}
			this.SettingsUpdated = true;
		}
	}

	createDefaultConfig () {
		return Object.assign({desktop: false, disabled: BDFDB.DataUtils.get(this, "settings")}, BDFDB.ObjectUtils.map(this.defaults.notificationstrings, "init"), "disableForNew");
	}

	saveNotificationString (input) {
		let config = input.getAttribute("config");
		if (config) {
			BDFDB.DataUtils.save(input.value, this, "notificationstrings", config);
			this.SettingsUpdated = true;
		}
	}

	saveNotificationSound (input) {
		let config = input.getAttribute("config");
		if (config) {
			let successSavedAudio = (parsedurl, parseddata) => {
				if (parsedurl && parseddata) BDFDB.NotificationUtils.toast(`Sound was saved successfully.`, {type:"success"});
				let notificationsound = BDFDB.DataUtils.get(this, "notificationsounds", config);
				notificationsound.url = parsedurl;
				notificationsound.song = parseddata;
				BDFDB.DataUtils.save(notificationsound, this, "notificationsounds", config);
				this.SettingsUpdated = true;
			};

			let url = input.value;
			if (url.length == 0) {
				BDFDB.NotificationUtils.toast(`Sound file was removed.`, {type:"warn"});
				successSavedAudio(url, url);
			}
			else if (url.indexOf("http") == 0) {
				BDFDB.LibraryRequires.request(url, (error, response, result) => {
					if (response) {
						let type = response.headers["content-type"];
						if (type && (type.indexOf("octet-stream") > -1 || type.indexOf("audio") > -1 || type.indexOf("video") > -1)) {
							successSavedAudio(url, url);
							return;
						}
					}
					BDFDB.NotificationUtils.toast("Use a valid direct link to a video or audio source. They usually end on something like .mp3, .mp4 or .wav.", {type:"danger"});
				});
			}
			else {
				BDFDB.LibraryRequires.fs.readFile(url, (error, response) => {
					if (error) BDFDB.NotificationUtils.toast("Could not fetch file. Please make sure the file exists.", {type:"danger"});
					else successSavedAudio(url, `data:audio/mpeg;base64,${response.toString("base64")}`);
				});
			}
		}
	}

	processStandardSidebarView (instance, wrapper, returnvalue) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			this.startInterval();
		}
	}

	getStatusWithMobileAndActivity (id, config) {
		let statusname = BDFDB.UserUtils.getStatus(id);
		let status = {statusname, isactivity:false};
		let activity = BDFDB.LibraryModules.StatusMetaUtils.getPrimaryActivity(id);
		if (activity && this.activityTypes[activity.type]) {
			let activityname = this.activityTypes[activity.type].toLowerCase();
			if (this.defaults.notificationstrings[activityname] && config[activityname]) {
				status = Object.assign({statusname:activityname, isactivity:true}, activity);
				if (activityname == "listening" || activityname == "streaming") delete status.name;
			}
		}
		if (status.statusname == "online" && BDFDB.LibraryModules.StatusMetaUtils.isMobileOnline(id)) status.statusname = "mobile";
		return status;
	}

	startInterval () {
		clearInterval(this.checkInterval);
		let settings = BDFDB.DataUtils.get(this, "settings");
		let amounts = BDFDB.DataUtils.get(this, "amounts");
		let notificationstrings = BDFDB.DataUtils.get(this, "notificationstrings");
		let notificationsounds = BDFDB.DataUtils.get(this, "notificationsounds");
		let users = Object.assign({}, BDFDB.DataUtils.load(this, "nonfriends"), BDFDB.DataUtils.load(this, "friends"));
		for (let id in users) this.userStatusStore[id] = this.getStatusWithMobileAndActivity(id, users[id]).statusname;
		let toasttime = (amounts.toastTime > amounts.checkInterval ? amounts.checkInterval : amounts.toastTime) * 1000;
		let desktoptime = (amounts.desktopTime > amounts.checkInterval ? amounts.checkInterval : amounts.desktopTime) * 1000;
		this.checkInterval = setInterval(() => {
			for (let id in users) if (!users[id].disabled) {
				let user = BDFDB.LibraryModules.UserStore.getUser(id);
				let status = this.getStatusWithMobileAndActivity(id, users[id]);
				if (user && this.userStatusStore[id] != status.statusname && users[id][status.statusname]) {
					let EUdata = BDFDB.DataUtils.load("EditUsers", "users", user.id) || {};
					let libstring = (this.defaults.notificationstrings[status.statusname].libstring ? BDFDB.LanguageUtils.LanguageStrings[this.defaults.notificationstrings[status.statusname].libstring] : (this.defaults.notificationstrings[status.statusname].statusname || "")).toLowerCase();
					let string = notificationstrings[status.statusname] || "$user changed status to $status";
					let toaststring = BDFDB.encodeToHTML(string).replace(/'{0,1}\$user'{0,1}/g, `<strong>${BDFDB.encodeToHTML(EUdata.name || user.username)}</strong>`).replace(/'{0,1}\$status'{0,1}/g, `<strong>${libstring}</strong>`);
					if (status.isactivity) toaststring = toaststring.replace(/'{0,1}\$song'{0,1}|'{0,1}\$game'{0,1}/g, `<strong>${status.name || status.details}</strong>`).replace(/'{0,1}\$artist'{0,1}/g, `<strong>${status.state}</strong>`);
					let avatar = EUdata.removeIcon ? "" : (EUdata.url ? EUdata.url : BDFDB.UserUtils.getAvatar(user.id));
					this.timeLog.push({string:toaststring, avatar, time: new Date()});
					if (!(settings.muteOnDND && BDFDB.UserUtils.getStatus() == "dnd")) {
						let openChannel = () => {
							if (settings.openOnClick) {
								let DMid = BDFDB.LibraryModules.ChannelStore.getDMFromUserId(user.id);
								if (DMid) BDFDB.LibraryModules.SelectChannelUtils.selectPrivateChannel(DMid);
								else BDFDB.LibraryModules.DirectMessageUtils.openPrivateChannel(BDFDB.UserUtils.me.id, user.id);
								BDFDB.LibraryRequires.electron.remote.getCurrentWindow().maximize();
							}
						};
						if (!users[id].desktop) {
							if (!document.querySelector(`.friendnotifications-${id}-toast`)) {
								let toast = BDFDB.NotificationUtils.toast(`<div class="toast-inner"><div class="toast-avatar" style="background-image:url(${avatar});"></div><div>${toaststring}</div></div>`, {html:true, timeout:toasttime, color:BDFDB.UserUtils.getStatusColor(status.statusname), icon:false, selector:`friendnotifications-${status.statusname}-toast friendnotifications-${id}-toast`});
								toast.addEventListener("click", openChannel);
								let notificationsound = notificationsounds["toast" + status.statusname] || {};
								if (!notificationsound.mute && notificationsound.song) {
									let audio = new Audio();
									audio.src = notificationsound.song;
									audio.play();
								}
							}
						}
						else {
							let desktopstring = string.replace(/\$user/g, EUdata.name || user.username).replace(/\$status/g, libstring);
							if (status.isactivity) desktopstring = desktopstring.replace(/\$song|\$game/g, status.name || status.details).replace(/\$artist/g, status.state);
							let notificationsound = notificationsounds["desktop" + status.statusname] || {};
							BDFDB.NotificationUtils.desktop(desktopstring, {icon:avatar, timeout:desktoptime, click:openChannel, silent:notificationsound.mute, sound:notificationsound.song});
						}
					}
				}
				this.userStatusStore[id] = status.statusname;
			}
		}, amounts.checkInterval * 1000);
	}

	showTimeLog () {
		let timeLogModal = BDFDB.htmlToElement(this.timeLogModalMarkup);
		let container = timeLogModal.querySelector(".entries");
		if (!container) return;
		let logs = this.timeLog.slice(0).reverse();
		for (let log of logs) {
			if (container.childElementCount) container.appendChild(BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.divider + BDFDB.disCN.marginbottom4}"></div>`));
			let entry = BDFDB.htmlToElement(this.logEntryMarkup);
			entry.querySelector(".log-time").innerText = `[${log.time.toLocaleTimeString()}]`;
			entry.querySelector(".log-avatar").style.setProperty("background-image", `url(${log.avatar})`);
			entry.querySelector(".log-description").innerHTML = log.string;
			container.appendChild(entry);
		}
		BDFDB.appendModal(timeLogModal);
	}
}