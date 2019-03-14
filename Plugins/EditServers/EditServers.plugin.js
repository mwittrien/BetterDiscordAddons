//META{"name":"EditServers","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditServers","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EditServers/EditServers.plugin.js"}*//

class EditServers {
	getName () {return "EditServers";}

	getVersion () {return "1.9.6";} 

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to change the icon, name and color of servers.";}

	initConstructor () {
		this.changelog = {
			"added":[["Banners","You can now add/change/remove banners to/from servers"]]
		};
		
		this.labels = {};

		this.patchModules = {
			"GuildIcon":"componentDidMount",
			"GuildHeader":["componentDidMount","componentDidUpdate"],
			"Clickable":"componentDidMount"
		};

		this.serverContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} localserversettings-item ${BDFDB.disCN.contextmenuitemsubmenu}">
					<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_context_localserversettings_text</div></span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;

		this.serverContextSubMenuMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} editservers-submenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} serversettings-item">
						<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_submenu_serversettings_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} resetsettings-item ${BDFDB.disCN.contextmenuitemdisabled}">
						<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_submenu_resetsettings_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>
			</div>`;

		this.serverSettingsModalMarkup =
			`<span class="${this.name}-modal DevilBro-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto; padding-bottom: 10px;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.headertitle + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.defaultcolor + BDFDB.disCNS.h4defaultmargin + BDFDB.disCN.marginreset}">REPLACE_modal_header_text</h4>
									<div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div>
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
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.marginbottom8 + BDFDB.disCN.tabbarcontainer}" style="flex: 0 0 auto; padding-right: 12px;">
								<div class="${BDFDB.disCNS.tabbar + BDFDB.disCN.tabbartop}">
									<div tab="server" class="${BDFDB.disCNS.settingsitemdefault + BDFDB.disCNS.settingsitem + BDFDB.disCNS.settingsnotselected + BDFDB.disCN.tabbaritem}">REPLACE_modal_tabheader1_text</div>
									<div tab="icon" class="${BDFDB.disCNS.settingsitemdefault + BDFDB.disCNS.settingsitem + BDFDB.disCNS.settingsnotselected + BDFDB.disCN.tabbaritem}">REPLACE_modal_tabheader2_text</div>
									<div tab="tooltip" class="${BDFDB.disCNS.settingsitemdefault + BDFDB.disCNS.settingsitem + BDFDB.disCNS.settingsnotselected + BDFDB.disCN.tabbaritem}">REPLACE_modal_tabheader3_text</div>
								</div>
							</div>
							<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner}">
									<div tab="server" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_servername_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-servername"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_servershortname_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-servershortname"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_servericon_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-servericon"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">REPLACE_modal_removeicon_text</h3>
											<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
												<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-removeicon">
											</div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_serverbanner_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-serverbanner"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">REPLACE_modal_removebanner_text</h3>
											<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
												<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-removebanner">
											</div>
										</div>
									</div>
									<div tab="icon" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker1_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker2_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
									</div>
									<div tab="tooltip" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker3_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker4_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
									</div>
								</div>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontalreverse + BDFDB.disCNS.horizontalreverse2 + BDFDB.disCNS.directionrowreverse + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalfooter}">
								<button type="button" class="btn-save ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}">REPLACE_btn_save_text</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;

		this.defaults = {
			settings: {
				addOriginalTooltip:		{value:true, 	inner:false,	description:"Hovering over a changed Server Header shows the original Name as Tooltip"},
				changeInGuildList:		{value:true, 	inner:true,		description:"Server List"},
				changeInMutualGuilds:	{value:true, 	inner:true,		description:"Mutual Servers"},
				changeInGuildHeader:	{value:true, 	inner:true,		description:"Server Header"},
				changeInSearchPopout:	{value:true, 	inner:true,		description:"Search Popout"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var settings = BDFDB.getAllData(this, "settings");
		var settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			if (!this.defaults.settings[key].inner) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Change Server in:</h3></div><div class="DevilBro-settings-inner-list">`;
		for (let key in settings) {
			if (this.defaults.settings[key].inner) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Reset all Servers.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".reset-button", () => {
			BDFDB.openConfirmModal(this, "Are you sure you want to reset all servers?", () => {
				BDFDB.removeAllData(this, "servers");
				BDFDB.WebModules.forceAllUpdates(this);
				this.updateGuildSidebar();
			});
		});
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

			this.GuildUtils = BDFDB.WebModules.findByProperties("getGuilds","getGuild");
			
			BDFDB.WebModules.patch(BDFDB.WebModules.findByProperties('getGuildBannerURL'), 'getGuildBannerURL', this, {instead:e => {
				let guild = this.GuildUtils.getGuild(e.methodArguments[0].id);
				if (guild) {
					if (e.methodArguments[0].id == "410787888507256842") return guild.banner;
					let data = BDFDB.loadData(guild.id, this, "servers");
					if (data && data.banner && !data.removeBanner) return data.banner;
				}
				return e.callOriginalMethod();
			}});

			BDFDB.WebModules.forceAllUpdates(this);
			this.updateGuildSidebar();
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			let data = BDFDB.loadAllData(this, "servers");
			BDFDB.removeAllData(this, "servers");
			try {
				BDFDB.WebModules.forceAllUpdates(this);
				this.updateGuildSidebar();
			} catch (err) {}
			BDFDB.saveAllData(data, this, "servers");
			
			for (let guildobj of BDFDB.readServerList()) if (guildobj.instance) {
				delete guildobj.instance.props.guild.savedbanner;
				delete guildobj.instance.props.guild.savedsplash;
			}

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	changeLanguageStrings () {
		this.serverContextEntryMarkup = 	this.serverContextEntryMarkup.replace("REPLACE_context_localserversettings_text", this.labels.context_localserversettings_text);

		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_submenu_serversettings_text", this.labels.submenu_serversettings_text);
		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_submenu_resetsettings_text", this.labels.submenu_resetsettings_text);

		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_servername_text", this.labels.modal_servername_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_servershortname_text", this.labels.modal_servershortname_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_servericon_text", this.labels.modal_servericon_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_removeicon_text", this.labels.modal_removeicon_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_serverbanner_text", this.labels.modal_serverbanner_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_removebanner_text", this.labels.modal_removebanner_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_tabheader1_text", this.labels.modal_tabheader1_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_tabheader2_text", this.labels.modal_tabheader2_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_tabheader3_text", this.labels.modal_tabheader3_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_colorpicker1_text", this.labels.modal_colorpicker1_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_colorpicker2_text", this.labels.modal_colorpicker2_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_colorpicker3_text", this.labels.modal_colorpicker3_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_colorpicker4_text", this.labels.modal_colorpicker4_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_btn_save_text", this.labels.btn_save_text);
	}

	onGuildContextMenu (instance, menu) {
		if (instance.props && instance.props.target && instance.props.guild && !menu.querySelector(".localserversettings-item")) {
			let serverContextEntry = BDFDB.htmlToElement(this.serverContextEntryMarkup);
			let devgroup = BDFDB.React.findDOMNodeSafe(BDFDB.getOwnerInstance({node:menu,name:["DeveloperModeGroup","MessageDeveloperModeGroup"]}));
			if (devgroup) devgroup.parentElement.insertBefore(serverContextEntry, devgroup);
			else menu.appendChild(serverContextEntry, menu);
			let settingsitem = serverContextEntry.querySelector(".localserversettings-item");
			settingsitem.addEventListener("mouseenter", () => {
				let serverContextSubMenu = BDFDB.htmlToElement(this.serverContextSubMenuMarkup);
				let serveritem = serverContextSubMenu.querySelector(".serversettings-item");
				serveritem.addEventListener("click", () => {
					BDFDB.closeContextMenu(menu);
					this.showServerSettings(instance.props.guild);
				});
				if (BDFDB.loadData(instance.props.guild.id, this, "servers")) {
					let resetitem = serverContextSubMenu.querySelector(".resetsettings-item");
					BDFDB.removeClass(resetitem, BDFDB.disCN.contextmenuitemdisabled);
					resetitem.addEventListener("click", () => {
						BDFDB.closeContextMenu(menu);
						BDFDB.removeData(instance.props.guild.id, this, "servers");
						BDFDB.WebModules.forceAllUpdates(this);
						this.updateGuildSidebar();
					});
				}
				BDFDB.appendSubMenu(settingsitem, serverContextSubMenu);
			});
		}
	}

	showServerSettings (info) {
		var {name,shortName,url,removeIcon,banner,removeBanner,color1,color2,color3,color4} = BDFDB.loadData(info.id, this, "servers") || {};

		let serverSettingsModal = BDFDB.htmlToElement(this.serverSettingsModalMarkup);
		let servernameinput = serverSettingsModal.querySelector("#input-servername");
		let servershortnameinput = serverSettingsModal.querySelector("#input-servershortname");
		let servericoninput = serverSettingsModal.querySelector("#input-servericon");
		let removeiconinput = serverSettingsModal.querySelector("#input-removeicon");
		let serverbannerinput = serverSettingsModal.querySelector("#input-serverbanner");
		let removebannerinput = serverSettingsModal.querySelector("#input-removebanner");

		serverSettingsModal.querySelector(BDFDB.dotCN.modalguildname).innerText = info.name;
		servernameinput.value = name || "";
		servernameinput.setAttribute("placeholder", info.name);
		servershortnameinput.value = shortName || (info.icon ? "" : info.acronym);
		servershortnameinput.setAttribute("placeholder", info.acronym);
		servericoninput.value = url || "";
		servericoninput.setAttribute("placeholder", BDFDB.getGuildIcon(info.id) || "");
		BDFDB.toggleClass(servericoninput, "valid", servericoninput.value.length > 0);
		servericoninput.disabled = removeIcon;
		removeiconinput.checked = removeIcon;
		serverbannerinput.value = banner || "";
		serverbannerinput.setAttribute("placeholder", BDFDB.getGuildBanner(info.id) || "");
		BDFDB.toggleClass(serverbannerinput, "valid", serverbannerinput.value.length > 0);
		serverbannerinput.disabled = removeBanner;
		removebannerinput.checked = removeBanner;
		BDFDB.setColorSwatches(serverSettingsModal, color1);
		BDFDB.setColorSwatches(serverSettingsModal, color2);
		BDFDB.setColorSwatches(serverSettingsModal, color3);
		BDFDB.setColorSwatches(serverSettingsModal, color4);

		BDFDB.appendModal(serverSettingsModal);

		removeiconinput.addEventListener("click", () => {
			servericoninput.disabled = removeiconinput.checked;
		});
		removebannerinput.addEventListener("click", () => {
			serverbannerinput.disabled = removebannerinput.checked;
		});
		for (let urlinput of [servericoninput, serverbannerinput]) {
			urlinput.addEventListener("input", () => {
				this.checkUrl(urlinput);
			});
			urlinput.addEventListener("mouseenter", () => {
				BDFDB.addClass(urlinput, "hovering");
				this.createNoticeTooltip(urlinput);
			});
			urlinput.addEventListener("mouseleave", () => {
				BDFDB.removeClass(urlinput, "hovering");
				BDFDB.removeEles(BDFDB.dotCNS.tooltips + ".notice-tooltip");
			});
		}
		if (info.id == "410787888507256842") {
			serverbannerinput.parentElement.parentElement.previousSibling.remove();
			serverbannerinput.parentElement.parentElement.nextSibling.remove();
			serverbannerinput.parentElement.parentElement.remove();
			serverbannerinput = null;
			removebannerinput = null;
		}
		
		BDFDB.addChildEventListener(serverSettingsModal, "click", ".btn-save", e => {
			name = servernameinput.value.trim();
			name = name ? name : null;

			shortName = servershortnameinput.value.trim();
			shortName = shortName && shortName != info.acronym ? shortName : null;

			removeIcon = removeiconinput.checked;

			url = !removeIcon && BDFDB.containsClass(servericoninput, "valid") ? servericoninput.value.trim() : null;
			url = url ? url : null;

			removeBanner = removebannerinput ? removebannerinput.checked : false;

			banner = !removeBanner && serverbannerinput && BDFDB.containsClass(serverbannerinput, "valid") ? serverbannerinput.value.trim() : null;
			banner = banner ? banner : null;

			color1 = BDFDB.getSwatchColor(serverSettingsModal, 1);
			color2 = BDFDB.getSwatchColor(serverSettingsModal, 2);
			color3 = BDFDB.getSwatchColor(serverSettingsModal, 3);
			color4 = BDFDB.getSwatchColor(serverSettingsModal, 4);

			if (name == null && shortName == null && url == null && !removeIcon && banner == null && !removeBanner && color1 == null && color2 == null && color3 == null && color4 == null) BDFDB.removeData(info.id, this, "servers");
			else BDFDB.saveData(info.id, {name,shortName,url,removeIcon,banner,removeBanner,color1,color2,color3,color4}, this, "servers");
			BDFDB.WebModules.forceAllUpdates(this);
			this.updateGuildSidebar();
		});
		servernameinput.focus();
	}

	checkUrl (input) {
		BDFDB.removeEles(BDFDB.dotCNS.tooltips + ".notice-tooltip");
		if (!input.value) {
			BDFDB.removeClass(input, "valid");
			BDFDB.removeClass(input, "invalid");
		}
		else {
			require("request")(input.value, (error, response, result) => {
				if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") != -1) {
					BDFDB.addClass(input, "valid");
					BDFDB.removeClass(input, "invalid");
				}
				else {
					BDFDB.removeClass(input, "valid");
					BDFDB.addClass(input, "invalid");
				}
				if (BDFDB.containsClass(input, "hovering")) this.createNoticeTooltip(input);
			});
		}
	}

	createNoticeTooltip (input) {
		var disabled = input.disabled;
		var valid = BDFDB.containsClass(input, "valid");
		var invalid = BDFDB.containsClass(input, "invalid");
		if (disabled || valid || invalid) {
			BDFDB.createTooltip(disabled ? this.labels.modal_ignoreurl_text : valid ? this.labels.modal_validurl_text : this.labels.modal_invalidurl_text, input, {type:"right",selector:"notice-tooltip",color: disabled ? "black" : invalid ? "red" : "green"});
		}
	}
	
	processGuildIcon (instance, wrapper) {
		if (instance.props && instance.props.guild) {
			let icon = wrapper.classList && BDFDB.containsClass(wrapper, BDFDB.disCN.avataricon) ? wrapper : wrapper.querySelector(BDFDB.dotCN.avataricon);
			if (!icon) return;
			this.changeGuildIcon(instance.props.guild, icon);
			if (BDFDB.getParentEle(BDFDB.dotCN.guild, icon)) this.changeTooltip(instance.props.guild, wrapper, "right");
			else if (BDFDB.getParentEle(BDFDB.dotCN.friendscolumn, icon)) this.changeTooltip(instance.props.guild, icon.parentElement, "top");
		}
	}

	processGuildHeader (instance, wrapper) {
		if (instance.props && instance.props.guild) {
			this.changeGuildName(instance.props.guild, wrapper.querySelector(BDFDB.dotCN.guildheadername));
		}
	}

	processClickable (instance, wrapper) {
		if (!wrapper || !instance.props || !instance.props.className) return;
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.userprofilelistrow) > -1) {
			let guild = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.guild");
			if (guild && BDFDB.getReactValue(instance, "_reactInternalFiber.return.type.displayName") == "GuildRow") {
				this.changeGuildName(guild, wrapper.querySelector(BDFDB.dotCN.userprofilelistname));
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.quickswitchresult) > -1) {
			let guild = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.memoizedProps.guild");
			if (guild) this.changeGuildName(result.record, wrapper.querySelector(BDFDB.dotCN.quickswitchresultmatch));
			else {
				let channel = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.memoizedProps.channel");
				if (channel && channel.guild_id) this.changeGuildName(this.GuildUtils.getGuild(channel.guild_id), wrapper.querySelector(BDFDB.dotCN.quickswitchresultmisccontainer));
			}
		}
	}

	changeGuildName (info, guildname) {
		if (!info || !guildname || !guildname.parentElement) return;
		if (guildname.EditServersChangeObserver && typeof guildname.EditServersChangeObserver.disconnect == "function") guildname.EditServersChangeObserver.disconnect();
		guildname.removeEventListener("mouseenter", guildname.mouseenterListenerEditChannels);
		let data = this.getGuildData(info.id, guildname);
		if (data.name || data.color2 || guildname.getAttribute("changed-by-editservers")) {
			guildname.style.setProperty("color", BDFDB.colorCONVERT(data.color2, "RGB"), "important");
			BDFDB.setInnerText(guildname, data.name || info.name);
			if (data.name && BDFDB.containsClass(guildname, BDFDB.disCN.guildheadername) && BDFDB.getData("addOriginalTooltip", this, "settings")) {
				guildname.mouseenterListenerEditChannels = () => {
					BDFDB.createTooltip(info.name, guildname.parentElement, {type:"right",selector:"EditServers-tooltip"});
				};
				guildname.addEventListener("mouseenter", guildname.mouseenterListenerEditChannels);
			}
			if (data.name || data.color2) {
				guildname.setAttribute("changed-by-editservers", true);
				guildname.EditServersChangeObserver = new MutationObserver((changes, _) => {
					guildname.EditServersChangeObserver.disconnect();
					this.changeName(info, guildname);
				});
				guildname.EditServersChangeObserver.observe(guildname, {attributes:true});
			}
			else guildname.removeAttribute("changed-by-editservers");
		}
	}

	changeGuildIcon (info, icon) {
		if (!info || !icon || !icon.parentElement) return;
		if (icon.EditServersChangeObserver && typeof icon.EditServersChangeObserver.disconnect == "function") icon.EditServersChangeObserver.disconnect();
		let data = this.getGuildData(info.id, icon);
		if (data.url || data.shortName || data.removeIcon || icon.getAttribute("changed-by-editservers")) {
			let url = data.url || BDFDB.getGuildIcon(info.id);
			if (icon.tagName == "IMG") icon.setAttribute("src", data.removeIcon ? null : url);
			else {
				BDFDB.setInnerText(icon, data.url ? "" : (data.shortName || (info.icon && !data.removeIcon ? "" : info.acronym)));
				if (!data.removeIcon && !data.shortName && url) icon.style.setProperty("background-image", `url(${url})`);
				else icon.style.removeProperty("background-image");
				icon.style.setProperty("background-color", BDFDB.colorCONVERT(data.color1, "RGB"), "important");
				icon.style.setProperty("color", BDFDB.colorCONVERT(data.color2, "RGB", "important"));
				icon.style.setProperty("font-size", this.getFontSize(icon));
				BDFDB.toggleClass(icon, this.getNoIconClasses(icon), !icon.style.getPropertyValue("background-image"));
				if (data.url && !data.removeIcon) {
					icon.style.setProperty("background-position", "center");
					icon.style.setProperty("background-size", "cover");
				}
			}
			if (data.url || data.shortName || data.removeIcon) {
				icon.setAttribute("changed-by-editservers", true);
				icon.EditServersChangeObserver = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							icon.EditServersChangeObserver.disconnect();
							this.changeGuildIcon(info, icon);
						}
					);
				});
				icon.EditServersChangeObserver.observe(icon, {attributes:true});
			}
			else icon.removeAttribute("changed-by-editservers");
		}
	}

	changeTooltip (info, wrapper, type) {
		if (!info || !wrapper || !wrapper.parentElement) return;
		let data = this.getGuildData(info.id, wrapper);
		wrapper.removeEventListener("mouseenter", wrapper.tooltipListenerEditServers);
		if (data.name || data.color3 || data.color4) {
			var bgColor = data.color3 ? BDFDB.colorCONVERT(data.color3, "RGB") : "";
			var fontColor = data.color4 ? BDFDB.colorCONVERT(data.color4, "RGB") : "";
			wrapper.tooltipListenerEditServers = () => {
				BDFDB.createTooltip(data.name || info.name, wrapper, {type,selector:"EditServers-tooltip",style:`color: ${fontColor} !important; background-color: ${bgColor} !important; border-color: ${bgColor} !important;`,css:`body ${BDFDB.dotCN.tooltip}:not(.EditServers-tooltip) {display: none !important;}`});
			};
			wrapper.addEventListener("mouseenter", wrapper.tooltipListenerEditServers);
		}
	}

	getFontSize (icon) {
		if (icon.style.getPropertyValue("background-image")) return null;
		else if (BDFDB.containsClass(icon, BDFDB.disCN.guildicon)) {
			var shortname = icon.innerText;
			if (shortname) {
				if (shortname.length > 5) return "10px";
				else if (shortname.length > 4) return "12px";
				else if (shortname.length > 3) return "14px";
				else if (shortname.length > 1) return "16px";
				else if (shortname.length == 1) return "18px";
			}
		}
		else if (BDFDB.containsClass(icon, BDFDB.disCN.avatariconsizexlarge)) return "12px";
		else if (BDFDB.containsClass(icon, BDFDB.disCN.avatariconsizelarge)) return "10px";
		else if (BDFDB.containsClass(icon, BDFDB.disCN.avatariconsizemedium)) return "8px";
		else if (BDFDB.containsClass(icon, BDFDB.disCN.avatariconsizesmall)) return "4.8px";
		else if (BDFDB.containsClass(icon, BDFDB.disCN.avatariconsizemini)) return "4px";
		return "10px";
	}

	getNoIconClasses (icon) {
		let noiconclasses = [BDFDB.disCN.avatarnoicon];
		if (BDFDB.containsClass(icon, BDFDB.disCN.userprofilelistavatar)) noiconclasses.push(BDFDB.disCN.userprofilelistguildavatarwithouticon);
		return noiconclasses;
	}

	getGuildData (id, wrapper) {
		let data = BDFDB.loadData(id, this, "servers");
		this.setVerifiedFlags(id, data);
		if (!data) return {};
		let allenabled = true, settings = BDFDB.getAllData(this, "settings");
		for (let i in settings) if (!settings[i]) {
			allenabled = false;
			break;
		}
		if (allenabled) return data;
		let key = null;
		if (BDFDB.getParentEle(BDFDB.dotCN.guilds, wrapper)) key = "changeInGuildList";
		else if (BDFDB.getParentEle(BDFDB.dotCN.userprofile, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.friends, wrapper)) key = "changeInMutualGuilds";
		else if (BDFDB.getParentEle(BDFDB.dotCN.guildheader, wrapper)) key = "changeInGuildHeader";
		else if (BDFDB.getParentEle(BDFDB.dotCN.searchpopout, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.quickswitcher, wrapper)) key = "changeInSearchPopout";

		return !key || settings[key] ? data : {};
	}
	
	setVerifiedFlags (id, data) {
		data = data || {};
		let guild = this.GuildUtils.getGuild(id);
		if (!guild) return;
		if (!guild.savedbanner && guild.banner) guild.savedbanner = guild.banner;
		if (!guild.savedsplash && guild.splash) guild.savedsplash = guild.splash;
		if (guild.features.has("VERIFIED") && !guild.features.has("FAKE_VERIFIED")) guild.features.add("ORIG_VERIFIED");
		if (!data.removeBanner && !guild.features.has("ORIG_VERIFIED")) {
			if (data.banner || id == "410787888507256842") {
				guild.features.add("VERIFIED");
				guild.features.add("FAKE_VERIFIED");
				if (data.banner) {
					guild.banner = data.banner;
					guild.splash = data.banner;
				}
			}
			else {
				guild.features.delete("VERIFIED");
				guild.features.delete("FAKE_VERIFIED");
				guild.banner = null;
				guild.splash = null;
			}
		}
		if (data.removeBanner) {
			guild.features.delete("VERIFIED");
			guild.features.delete("FAKE_VERIFIED");
			guild.banner = null;
			guild.splash = null;
		}
		if (!data.removeBanner && !data.banner && guild.features.has("ORIG_VERIFIED")) {
			if (guild.savedbanner) guild.banner = guild.savedbanner;
			if (guild.savedsplash) guild.splash = guild.savedsplash;
			guild.features.add("VERIFIED");
			guild.features.delete("ORIG_VERIFIED");
		}
	}
	
	updateGuildSidebar() {
		if (document.querySelector(BDFDB.dotCN.guildheader)) {
			var ins = BDFDB.getOwnerInstance({node: document.querySelector(BDFDB.dotCN.app), name: ["GuildSidebar", "GuildHeader"], all: true, noCopies: true, depth: 99999999, time: 99999999});
			if (ins) for (let i in ins) ins[i].updater.enqueueForceUpdate(ins[i])
		}
	}

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					context_localserversettings_text:	"Lokalne postavke poslužitelja",
					submenu_serversettings_text:		"Promijeni postavke",
					submenu_resetsettings_text:			"Ponovno postavite poslužitelj",
					modal_header_text:					"Lokalne postavke poslužitelja",
					modal_servername_text:				"Naziv lokalnog poslužitelja",
					modal_servershortname_text:			"Poslužitelj prečaca",
					modal_servericon_text:				"Ikona",
					modal_removeicon_text:				"Ukloni ikonu",
					modal_serverbanner_text:			"Baner",
					modal_removebanner_text:			"Uklonite baner",
					modal_tabheader1_text:				"Poslužitelja",
					modal_tabheader2_text:				"Boja ikona",
					modal_tabheader3_text:				"Boja tooltip",
					modal_colorpicker1_text:			"Boja ikona",
					modal_colorpicker2_text:			"Boja fonta",
					modal_colorpicker3_text:			"Boja tooltip",
					modal_colorpicker4_text:			"Boja fonta",
					modal_ignoreurl_text:				"URL ignorirati",
					modal_validurl_text:				"Vrijedi URL",
					modal_invalidurl_text:				"Nevažeći URL",
					btn_cancel_text:					"Prekid",
					btn_save_text:						"Uštedjeti"
				};
			case "da":		//danish
				return {
					context_localserversettings_text:	"Lokal serverindstillinger",
					submenu_serversettings_text:		"Skift indstillinger",
					submenu_resetsettings_text:			"Nulstil server",
					modal_header_text:	 				"Lokal serverindstillinger",
					modal_servername_text:				"Lokalt servernavn",
					modal_servershortname_text:			"Initialer",
					modal_servericon_text:				"Ikon",
					modal_removeicon_text:				"Fjern ikon",
					modal_serverbanner_text:			"Banner",
					modal_removebanner_text:			"Fjern banner",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Ikonfarve",
					modal_tabheader3_text:				"Tooltipfarve",
					modal_colorpicker1_text:			"Ikonfarve",
					modal_colorpicker2_text:			"Skriftfarve",
					modal_colorpicker3_text:			"Tooltipfarve",
					modal_colorpicker4_text:			"Skriftfarve",
					modal_ignoreurl_text:				"Ignorer URL",
					modal_validurl_text:				"Gyldig URL",
					modal_invalidurl_text:				"Ugyldig URL",
					btn_cancel_text:					"Afbryde",
					btn_save_text:						"Spare"
				};
			case "de":		//german
				return {
					context_localserversettings_text:	"Lokale Servereinstellungen",
					submenu_serversettings_text:		"Einstellungen ändern",
					submenu_resetsettings_text:			"Server zurücksetzen",
					modal_header_text:					"Lokale Servereinstellungen",
					modal_servername_text:				"Lokaler Servername",
					modal_servershortname_text:			"Serverkürzel",
					modal_servericon_text:				"Icon",
					modal_removeicon_text:				"Icon entfernen",
					modal_serverbanner_text:			"Banner",
					modal_removebanner_text:			"Banner entfernen",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Iconfarbe",
					modal_tabheader3_text:				"Tooltipfarbe",
					modal_colorpicker1_text:			"Iconfarbe",
					modal_colorpicker2_text:			"Schriftfarbe",
					modal_colorpicker3_text:			"Tooltipfarbe",
					modal_colorpicker4_text:			"Schriftfarbe",
					modal_ignoreurl_text:				"URL ignorieren",
					modal_validurl_text:				"Gültige URL",
					modal_invalidurl_text:				"Ungültige URL",
					btn_cancel_text:					"Abbrechen",
					btn_save_text:						"Speichern"
				};
			case "es":		//spanish
				return {
					context_localserversettings_text:	"Ajustes local de servidor",
					submenu_serversettings_text:		"Cambiar ajustes",
					submenu_resetsettings_text:			"Restablecer servidor",
					modal_header_text:					"Ajustes local de servidor",
					modal_servername_text:				"Nombre local del servidor",
					modal_servershortname_text:			"Iniciales",
					modal_servericon_text:				"Icono",
					modal_removeicon_text:				"Eliminar icono",
					modal_serverbanner_text:			"Bandera",
					modal_removebanner_text:			"Eliminar bandera",
					modal_tabheader1_text:				"Servidor",
					modal_tabheader2_text:				"Color del icono",
					modal_tabheader3_text:				"Color de tooltip",
					modal_colorpicker1_text:			"Color del icono",
					modal_colorpicker2_text:			"Color de fuente",
					modal_colorpicker3_text:			"Color de tooltip",
					modal_colorpicker4_text:			"Color de fuente",
					modal_ignoreurl_text:				"Ignorar URL",
					modal_validurl_text:				"URL válida",
					modal_invalidurl_text:				"URL inválida",
					btn_cancel_text:					"Cancelar",
					btn_save_text:						"Guardar"
				};
			case "fr":		//french
				return {
					context_localserversettings_text:	"Paramètres locale du serveur",
					submenu_serversettings_text:		"Modifier les paramètres",
					submenu_resetsettings_text:			"Réinitialiser le serveur",
					modal_header_text:					"Paramètres locale du serveur",
					modal_servername_text:				"Nom local du serveur",
					modal_servershortname_text:			"Initiales",
					modal_servericon_text:				"Icône",
					modal_removeicon_text:				"Supprimer l'icône",
					modal_serverbanner_text:			"Bannière",
					modal_removebanner_text:			"Supprimer la bannière",
					modal_tabheader1_text:				"Serveur",
					modal_tabheader2_text:				"Couleur de l'icône",
					modal_tabheader3_text:				"Couleur de tooltip",
					modal_colorpicker1_text:			"Couleur de l'icône",
					modal_colorpicker2_text:			"Couleur de la police",
					modal_colorpicker3_text:			"Couleur de tooltip",
					modal_colorpicker4_text:			"Couleur de la police",
					modal_ignoreurl_text:				"Ignorer l'URL",
					modal_validurl_text:				"URL valide",
					modal_invalidurl_text:				"URL invalide",
					btn_cancel_text:					"Abandonner",
					btn_save_text:						"Enregistrer"
				};
			case "it":		//italian
				return {
					context_localserversettings_text:	"Impostazioni locale server",
					submenu_serversettings_text:		"Cambia impostazioni",
					submenu_resetsettings_text:			"Ripristina server",
					modal_header_text:					"Impostazioni locale server",
					modal_servername_text:				"Nome locale server",
					modal_servershortname_text:			"Iniziali",
					modal_servericon_text:				"Icona",
					modal_removeicon_text:				"Rimuova l'icona",
					modal_serverbanner_text:			"Bandiera",
					modal_removebanner_text:			"Rimuovi bandiera",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Colore dell'icona",
					modal_tabheader3_text:				"Colore della tooltip",
					modal_colorpicker1_text:			"Colore dell'icona",
					modal_colorpicker2_text:			"Colore del carattere",
					modal_colorpicker3_text:			"Colore della tooltip",
					modal_colorpicker4_text:			"Colore del carattere",
					modal_ignoreurl_text:				"Ignora l'URL",
					modal_validurl_text:				"URL valido",
					modal_invalidurl_text:				"URL non valido",
					btn_cancel_text:					"Cancellare",
					btn_save_text:						"Salvare"
				};
			case "nl":		//dutch
				return {
					context_localserversettings_text:	"Lokale serverinstellingen",
					submenu_serversettings_text:		"Verandere instellingen",
					submenu_resetsettings_text:			"Reset server",
					modal_header_text:					"Lokale serverinstellingen",
					modal_servername_text:				"Lokale servernaam",
					modal_servershortname_text:			"Initialen",
					modal_servericon_text:				"Icoon",
					modal_removeicon_text:				"Verwijder icoon",
					modal_serverbanner_text:			"Banier",
					modal_removebanner_text:			"Verwijder banier",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Icoonkleur",
					modal_tabheader3_text:				"Tooltipkleur",
					modal_colorpicker1_text:			"Icoonkleur",
					modal_colorpicker2_text:			"Doopvontkleur",
					modal_colorpicker3_text:			"Tooltipkleur",
					modal_colorpicker4_text:			"Doopvontkleur",
					modal_ignoreurl_text:				"URL negeren",
					modal_validurl_text:				"Geldige URL",
					modal_invalidurl_text:				"Ongeldige URL",
					btn_cancel_text:					"Afbreken",
					btn_save_text:						"Opslaan"
				};
			case "no":		//norwegian
				return {
					context_localserversettings_text:	"Lokal serverinnstillinger",
					submenu_serversettings_text:		"Endre innstillinger",
					submenu_resetsettings_text:			"Tilbakestill server",
					modal_header_text:					"Lokal serverinnstillinger",
					modal_servername_text:				"Lokalt servernavn",
					modal_servershortname_text:			"Initialer",
					modal_servericon_text:				"Ikon",
					modal_removeicon_text:				"Fjern ikon",
					modal_serverbanner_text:			"Banner",
					modal_removebanner_text:			"Fjern banner",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Ikonfarge",
					modal_tabheader3_text:				"Tooltipfarge",
					modal_colorpicker1_text:			"Ikonfarge",
					modal_colorpicker2_text:			"Skriftfarge",
					modal_colorpicker3_text:			"Tooltipfarge",
					modal_colorpicker4_text:			"Skriftfarge",
					modal_ignoreurl_text:				"Ignorer URL",
					modal_validurl_text:				"Gyldig URL",
					modal_invalidurl_text:				"Ugyldig URL",
					btn_cancel_text:					"Avbryte",
					btn_save_text:						"Lagre"
				};
			case "pl":		//polish
				return {
					context_localserversettings_text:	"Lokalne ustawienia serwera",
					submenu_serversettings_text:		"Zmień ustawienia",
					submenu_resetsettings_text:			"Resetuj ustawienia",
					modal_header_text:					"Lokalne ustawienia serwera",
					modal_servername_text:				"Lokalna nazwa serwera",
					modal_servershortname_text:			"Krótka nazwa",
					modal_servericon_text:				"Ikona",
					modal_removeicon_text:				"Usuń ikonę",
					modal_serverbanner_text:			"Baner",
					modal_removebanner_text:			"Usuń baner",
					modal_tabheader1_text:				"Serwer",
					modal_tabheader2_text:				"Kolor ikony",
					modal_tabheader3_text:				"Kolor podpowiedzi",
					modal_colorpicker1_text:			"Kolor ikony",
					modal_colorpicker2_text:			"Kolor czcionki",
					modal_colorpicker3_text:			"Kolor podpowiedzi",
					modal_colorpicker4_text:			"Kolor czcionki",
					modal_ignoreurl_text:				"Ignoruj URL",
					modal_validurl_text:				"Prawidłowe URL",
					modal_invalidurl_text:				"Nieprawidłowe URL",
					btn_cancel_text:					"Anuluj",
					btn_save_text:						"Zapisz"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_localserversettings_text:	"Configurações local do servidor",
					submenu_serversettings_text:		"Mudar configurações",
					submenu_resetsettings_text:			"Redefinir servidor",
					modal_header_text:					"Configurações local do servidor",
					modal_servername_text:				"Nome local do servidor",
					modal_servershortname_text:			"Iniciais",
					modal_servericon_text:				"Icone",
					modal_removeicon_text:				"Remover ícone",
					modal_serverbanner_text:			"Bandeira",
					modal_removebanner_text:			"Remover bandeira",
					modal_tabheader1_text:				"Servidor",
					modal_tabheader2_text:				"Cor do ícone",
					modal_tabheader3_text:				"Cor da tooltip",
					modal_colorpicker1_text:			"Cor do ícone",
					modal_colorpicker2_text:			"Cor da fonte",
					modal_colorpicker3_text:			"Cor da tooltip",
					modal_colorpicker4_text:			"Cor da fonte",
					modal_ignoreurl_text:				"Ignorar URL",
					modal_validurl_text:				"URL válido",
					modal_invalidurl_text:				"URL inválida",
					btn_cancel_text:					"Cancelar",
					btn_save_text:						"Salvar"
				};
			case "fi":		//finnish
				return {
					context_localserversettings_text:	"Paikallinen palvelimen asetukset",
					submenu_serversettings_text:		"Vaihda asetuksia",
					submenu_resetsettings_text:			"Nollaa palvelimen",
					modal_header_text:					"Paikallinen palvelimen asetukset",
					modal_servername_text:				"Paikallinen palvelimenimi",
					modal_servershortname_text:			"Nimikirjaimet",
					modal_servericon_text:				"Ikonin",
					modal_removeicon_text:				"Poista kuvake",
					modal_serverbanner_text:			"Banneri",
					modal_removebanner_text:			"Poista banneri",
					modal_tabheader1_text:				"Palvelimen",
					modal_tabheader2_text:				"Ikoninväri",
					modal_tabheader3_text:				"Tooltipväri",
					modal_colorpicker1_text:			"Ikoninväri",
					modal_colorpicker2_text:			"Fontinväri",
					modal_colorpicker3_text:			"Tooltipväri",
					modal_colorpicker4_text:			"Fontinväri",
					modal_ignoreurl_text:				"Ohita URL",
					modal_validurl_text:				"Voimassa URL",
					modal_invalidurl_text:				"Virheellinen URL",
					btn_cancel_text:					"Peruuttaa",
					btn_save_text:						"Tallentaa"
				};
			case "sv":		//swedish
				return {
					context_localserversettings_text:	"Lokal serverinställningar",
					submenu_serversettings_text:		"Ändra inställningar",
					submenu_resetsettings_text:			"Återställ server",
					modal_header_text:					"Lokal serverinställningar",
					modal_servername_text:				"Lokalt servernamn",
					modal_servershortname_text:			"Initialer",
					modal_servericon_text:				"Ikon",
					modal_removeicon_text:				"Ta bort ikonen",
					modal_serverbanner_text:			"Banderoll",
					modal_removebanner_text:			"Ta bort banderoll",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Ikonfärg",
					modal_tabheader3_text:				"Tooltipfärg",
					modal_colorpicker1_text:			"Ikonfärg",
					modal_colorpicker2_text:			"Fontfärg",
					modal_colorpicker3_text:			"Tooltipfärg",
					modal_colorpicker4_text:			"Fontfärg",
					modal_ignoreurl_text:				"Ignorera URL",
					modal_validurl_text:				"Giltig URL",
					modal_invalidurl_text:				"Ogiltig URL",
					btn_cancel_text:					"Avbryta",
					btn_save_text:						"Spara"
				};
			case "tr":		//turkish
				return {
					context_localserversettings_text:	"Yerel Sunucu Ayarları",
					submenu_serversettings_text:		"Ayarları Değiştir",
					submenu_resetsettings_text:			"Sunucu Sıfırla",
					modal_header_text:					"Yerel Sunucu Ayarları",
					modal_servername_text:				"Yerel Sunucu Adı",
					modal_servershortname_text:			"Baş harfleri",
					modal_servericon_text:				"Simge",
					modal_removeicon_text:				"Simge kaldır",
					modal_serverbanner_text:			"Afişi",
					modal_removebanner_text:			"Afişi kaldır",
					modal_tabheader1_text:				"Sunucu",
					modal_tabheader2_text:				"Simge rengi",
					modal_tabheader3_text:				"Tooltip rengi",
					modal_colorpicker1_text:			"Simge rengi",
					modal_colorpicker2_text:			"Yazı rengi",
					modal_colorpicker3_text:			"Tooltip rengi",
					modal_colorpicker4_text:			"Yazı rengi",
					modal_ignoreurl_text:				"URL yoksay",
					modal_validurl_text:				"Geçerli URL",
					modal_invalidurl_text:				"Geçersiz URL",
					btn_cancel_text:					"Iptal",
					btn_save_text:						"Kayıt"
				};
			case "cs":		//czech
				return {
					context_localserversettings_text:	"Místní nastavení serveru",
					submenu_serversettings_text:		"Změnit nastavení",
					submenu_resetsettings_text:			"Obnovit server",
					modal_header_text:					"Místní nastavení serveru",
					modal_servername_text:				"Místní název serveru",
					modal_servershortname_text:			"Iniciály",
					modal_servericon_text:				"Ikony",
					modal_removeicon_text:				"Odstranit ikonu",
					modal_serverbanner_text:			"Prapor",
					modal_removebanner_text:			"Odstraňte prapor",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Barva ikony",
					modal_tabheader3_text:				"Barva tooltip",
					modal_colorpicker1_text:			"Barva ikony",
					modal_colorpicker2_text:			"Barva fontu",
					modal_colorpicker3_text:			"Barva tooltip",
					modal_colorpicker4_text:			"Barva fontu",
					modal_ignoreurl_text:				"Ignorovat URL",
					modal_validurl_text:				"Platná URL",
					modal_invalidurl_text:				"Neplatná URL",
					btn_cancel_text:					"Zrušení",
					btn_save_text:						"Uložit"
				};
			case "bg":		//bulgarian
				return {
					context_localserversettings_text:	"Настройки за локални cървър",
					submenu_serversettings_text:		"Промяна на настройките",
					submenu_resetsettings_text:			"Възстановяване на cървър",
					modal_header_text:					"Настройки за локални cървър",
					modal_servername_text:				"Локално име на cървър",
					modal_servershortname_text:			"Инициали",
					modal_servericon_text:				"Икона",
					modal_removeicon_text:				"Премахване на иконата",
					modal_serverbanner_text:			"Знаме",
					modal_removebanner_text:			"Премахване на знаме",
					modal_tabheader1_text:				"Cървър",
					modal_tabheader2_text:				"Цвят на иконата",
					modal_tabheader3_text:				"Цвят на подсказка",
					modal_colorpicker1_text:			"Цвят на иконата",
					modal_colorpicker2_text:			"Цвят на шрифта",
					modal_colorpicker3_text:			"Цвят на подсказка",
					modal_colorpicker4_text:			"Цвят на шрифта",
					modal_ignoreurl_text:				"Игнориране на URL",
					modal_validurl_text:				"Валиден URL",
					modal_invalidurl_text:				"Невалиден URL",
					btn_cancel_text:					"Зъбести",
					btn_save_text:						"Cпасяване"
				};
			case "ru":		//russian
				return {
					context_localserversettings_text:	"Настройки локального cервер",
					submenu_serversettings_text:		"Изменить настройки",
					submenu_resetsettings_text:			"Сбросить cервер",
					modal_header_text:					"Настройки локального cервер",
					modal_servername_text:				"Имя локального cервер",
					modal_servershortname_text:			"Инициалы",
					modal_servericon_text:				"Значок",
					modal_removeicon_text:				"Удалить значок",
					modal_serverbanner_text:			"Баннер",
					modal_removebanner_text:			"Удалить баннер",
					modal_tabheader1_text:				"Cервер",
					modal_tabheader2_text:				"Цвет значков",
					modal_tabheader3_text:				"Цвет подсказка",
					modal_colorpicker1_text:			"Цвет значков",
					modal_colorpicker2_text:			"Цвет шрифта",
					modal_colorpicker3_text:			"Цвет подсказка",
					modal_colorpicker4_text:			"Цвет шрифта",
					modal_ignoreurl_text:				"Игнорировать URL",
					modal_validurl_text:				"Действительный URL",
					modal_invalidurl_text:				"Неверная URL",
					btn_cancel_text:					"Отмена",
					btn_save_text:						"Cпасти"
				};
			case "uk":		//ukrainian
				return {
					context_localserversettings_text:	"Налаштування локального cервер",
					submenu_serversettings_text:		"Змінити налаштування",
					submenu_resetsettings_text:			"Скидання cервер",
					modal_header_text:					"Налаштування локального cервер",
					modal_servername_text:				"Локальне ім'я cервер",
					modal_servershortname_text:			"Ініціали",
					modal_servericon_text:				"Іконка",
					modal_removeicon_text:				"Видалити піктограму",
					modal_serverbanner_text:			"Банер",
					modal_removebanner_text:			"Видалити банер",
					modal_tabheader1_text:				"Cервер",
					modal_tabheader2_text:				"Колір ікони",
					modal_tabheader3_text:				"Колір підказка",
					modal_colorpicker1_text:			"Колір ікони",
					modal_colorpicker2_text:			"Колір шрифту",
					modal_colorpicker3_text:			"Колір підказка",
					modal_colorpicker4_text:			"Колір шрифту",
					modal_ignoreurl_text:				"Ігнорувати URL",
					modal_validurl_text:				"Дійсна URL",
					modal_invalidurl_text:				"Недійсна URL",
					btn_cancel_text:					"Скасувати",
					btn_save_text:						"Зберегти"
				};
			case "ja":		//japanese
				return {
					context_localserversettings_text:	"ローカルサーバー設定",
					submenu_serversettings_text:		"設定を変更する",
					submenu_resetsettings_text:			"サーバーをリセットする",
					modal_header_text:					"ローカルサーバー設定",
					modal_servername_text:				"ローカルサーバー名",
					modal_servershortname_text:			"イニシャル",
					modal_servericon_text:				"アイコン",
					modal_removeicon_text:				"アイコンを削除",
					modal_serverbanner_text:			"バナー",
					modal_removebanner_text:			"バナーを削除",
					modal_tabheader1_text:				"サーバー",
					modal_tabheader2_text:				"アイコンの色",
					modal_tabheader3_text:				"ツールチップの色",
					modal_colorpicker1_text:			"アイコンの色",
					modal_colorpicker2_text:			"フォントの色",
					modal_colorpicker3_text:			"ツールチップの色",
					modal_colorpicker4_text:			"フォントの色",
					modal_ignoreurl_text:				"URL を無視する",
					modal_validurl_text:				"有効な URL",
					modal_invalidurl_text:				"無効な URL",
					btn_cancel_text:					"キャンセル",
					btn_save_text:						"セーブ"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_localserversettings_text:	"本地服務器設置",
					submenu_serversettings_text:		"更改設置",
					submenu_resetsettings_text:			"重置服務器",
					modal_header_text:					"本地服務器設置",
					modal_servername_text:				"服務器名稱",
					modal_servershortname_text:			"聲母",
					modal_servericon_text:				"圖標",
					modal_removeicon_text:				"刪除圖標",
					modal_serverbanner_text:			"旗幟",
					modal_removebanner_text:			"刪除橫幅",
					modal_tabheader1_text:				"服務器",
					modal_tabheader2_text:				"圖標顏色",
					modal_tabheader3_text:				"工具提示顏色",
					modal_colorpicker1_text:			"圖標顏色",
					modal_colorpicker2_text:			"字體顏色",
					modal_colorpicker3_text:			"工具提示顏色",
					modal_colorpicker4_text:			"字體顏色",
					modal_ignoreurl_text:				"忽略 URL",
					modal_validurl_text:				"有效的 URL",
					modal_invalidurl_text:				"無效的 URL",
					btn_cancel_text:					"取消",
					btn_save_text:						"保存"
				};
			case "ko":		//korean
				return {
					context_localserversettings_text:	"로컬 서버 설정",
					submenu_serversettings_text:		"설정 변경",
					submenu_resetsettings_text:			"서버 재설정",
					modal_header_text:					"로컬 서버 설정",
					modal_servername_text:				"로컬 서버 이름",
					modal_servershortname_text:			"머리 글자",
					modal_servericon_text:				"상",
					modal_removeicon_text:				"상 삭제",
					modal_serverbanner_text:			"기치",
					modal_removebanner_text:			"배너 삭제",
					modal_tabheader1_text:				"서버",
					modal_tabheader2_text:				"상 색깔",
					modal_tabheader3_text:				"툴팁 색깔",
					modal_colorpicker1_text:			"상 색깔",
					modal_colorpicker2_text:			"글꼴 색깔",
					modal_colorpicker3_text:			"툴팁 색깔",
					modal_colorpicker4_text:			"글꼴 색깔",
					modal_ignoreurl_text:				"URL 무시",
					modal_validurl_text:				"유효한 URL",
					modal_invalidurl_text:				"잘못된 URL",
					btn_cancel_text:					"취소",
					btn_save_text:						"저장"
				};
			default:		//default: english
				return {
					context_localserversettings_text:	"Local Serversettings",
					submenu_serversettings_text:		"Change Settings",
					submenu_resetsettings_text:			"Reset Server",
					modal_header_text:					"Local Serversettings",
					modal_servername_text:				"Local Servername",
					modal_servershortname_text:			"Initials",
					modal_servericon_text:				"Icon",
					modal_removeicon_text:				"Remove Icon",
					modal_serverbanner_text:			"Banner",
					modal_removebanner_text:			"Remove Banner",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Iconcolor",
					modal_tabheader3_text:				"Tooltipcolor",
					modal_colorpicker1_text:			"Iconcolor",
					modal_colorpicker2_text:			"Fontcolor",
					modal_colorpicker3_text:			"Tooltipcolor",
					modal_colorpicker4_text:			"Fontcolor",
					modal_ignoreurl_text:				"Ignore URL",
					modal_validurl_text:				"Valid URL",
					modal_invalidurl_text:				"Invalid URL",
					btn_cancel_text:					"Cancel",
					btn_save_text:						"Save"
				};
		}
	}
}
