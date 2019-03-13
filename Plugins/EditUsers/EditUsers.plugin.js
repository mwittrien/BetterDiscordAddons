//META{"name":"EditUsers","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditUsers","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EditUsers/EditUsers.plugin.js"}*//

class EditUsers {
	getName () {return "EditUsers";}

	getVersion () {return "3.3.1";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to change the icon, name, tag and color of users.";}

	initConstructor () {
		this.changelog = {
			"fixed":[["Quick Switcher","Fixed Users not being changed in the Quick Switcher"]]
		};
		
		this.labels = {};

		this.patchModules = {
			"ChannelTextArea":"componentDidMount",
			"NameTag":"componentDidMount",
			"AuditLog":"componentDidMount",
			"BannedCard":"componentDidMount",
			"InviteCard":"componentDidMount",
			"MemberCard":"componentDidMount",
			"TypingUsers":"componentDidUpdate",
			"MessageUsername":"componentDidMount",
			"DirectMessage":"componentDidMount",
			"CallAvatar":"componentDidMount",
			"VideoTile":"componentDidMount",
			"PictureInPictureVideo":"componentDidMount",
			"PrivateChannel":["componentDidMount","componentDidUpdate"],
			"HeaderBar":["componentDidMount","componentDidUpdate"],
			"Clickable":"componentDidMount",
			"MessageContent":["componentDidMount","componentDidUpdate"],
			"StandardSidebarView":"componentWillUnmount"
		};

		this.avatarselector = BDFDB.dotCNC.avatarinner + BDFDB.dotCNC.avatarimage + BDFDB.dotCNC.callavatarwrapper + BDFDB.dotCNC.voiceavatarcontainer + "[class*='avatar-']";

		this.css = `
			${BDFDB.dotCN.bottag} {
				top: -4px;
				position: relative;
				margin-left: 1ch;
			}
			${BDFDB.dotCNS.guildsettingsmembercard + BDFDB.dotCN.bottag},
			${BDFDB.dotCNS.userpopoutheadertagwithnickname + BDFDB.dotCN.bottag},
			${BDFDB.dotCNS.friendscolumn + BDFDB.dotCN.bottag},
			${BDFDB.dotCN.memberusername} ~ ${BDFDB.dotCN.bottag} {
				top: 0px;
			}
			${BDFDB.dotCN.messagegroupcompact} ${BDFDB.dotCN.bottag} {
				margin-right: 6px;
			}`;

		this.userContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} localusersettings-item ${BDFDB.disCN.contextmenuitemsubmenu}">
					<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_context_localusersettings_text</div></span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;

		this.userContextSubMenuMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} editusers-submenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} usersettings-item">
						<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_submenu_usersettings_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} resetsettings-item ${BDFDB.disCN.contextmenuitemdisabled}">
						<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_submenu_resetsettings_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>
			</div>`;

		this.userSettingsModalMarkup =
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
									<div tab="user" class="${BDFDB.disCNS.settingsitemdefault + BDFDB.disCNS.settingsitem + BDFDB.disCNS.settingsnotselected + BDFDB.disCN.tabbaritem}">REPLACE_modal_tabheader1_text</div>
									<div tab="name" class="${BDFDB.disCNS.settingsitemdefault + BDFDB.disCNS.settingsitem + BDFDB.disCNS.settingsnotselected + BDFDB.disCN.tabbaritem}">REPLACE_modal_tabheader2_text</div>
									<div tab="tag" class="${BDFDB.disCNS.settingsitemdefault + BDFDB.disCNS.settingsitem + BDFDB.disCNS.settingsnotselected + BDFDB.disCN.tabbaritem}">REPLACE_modal_tabheader3_text</div>
								</div>
							</div>
							<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner}">
									<div tab="user" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_username_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-username"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_usertag_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-usertag"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_userurl_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-userurl"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">REPLACE_modal_removeicon_text</h3>
											<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
												<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-removeicon">
											</div>
										</div>
									</div>
									<div tab="name" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker1_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker2_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
									</div>
									<div tab="tag" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker3_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker4_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">REPLACE_modal_ignoretagcolor_text</h3>
											<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
												<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-ignoretagcolor">
											</div>
										</div>
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
				changeInChatTextarea:	{value:true, 	description:"Chat Textarea"},
				changeInChatWindow:		{value:true, 	description:"Messages"},
				changeInMentions:		{value:true, 	description:"Mentions"},
				changeInVoiceChat:		{value:true, 	description:"Voice Channels"},
				changeInMemberList:		{value:true, 	description:"Member List"},
				changeInRecentDms:		{value:true, 	description:"Direct Message Notifications"},
				changeInDmsList:		{value:true, 	description:"Direct Message List"},
				changeInDmHeader:		{value:true, 	description:"Direct Message Header"},
				changeInDmCalls:		{value:true, 	description:"Calls/ScreenShares"},
				changeInTyping:			{value:true, 	description:"Typing List"},
				changeInFriendList:		{value:true, 	description:"Friend List"},
				changeInActivity:		{value:true, 	description:"Activity Page"},
				changeInUserPopout:		{value:true, 	description:"User Popouts"},
				changeInUserProfil:		{value:true, 	description:"User Profile Modal"},
				changeInAutoComplete:	{value:true, 	description:"Autocomplete Menu"},
				changeInAuditLog:		{value:true, 	description:"Audit Log"},
				changeInMemberLog:		{value:true, 	description:"Member Log"},
				changeInSearchPopout:	{value:true, 	description:"Search Popout"},
				changeInUserAccount:	{value:true, 	description:"Your Account Information"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var settings = BDFDB.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Change User in:</h3></div><div class="DevilBro-settings-inner-list">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Reset all Users.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".reset-button", () => {
			BDFDB.openConfirmModal(this, "Are you sure you want to reset all users?", () => {
				BDFDB.removeAllData(this, "users");
				BDFDB.WebModules.forceAllUpdates(this);
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

			this.RelationshipUtils = BDFDB.WebModules.findByProperties("isBlocked", "isFriend");
			this.UserUtils = BDFDB.WebModules.findByProperties("getUsers","getUser");
			this.MemberUtils = BDFDB.WebModules.findByProperties("getMembers", "getMember");
			this.ChannelUtils = BDFDB.WebModules.findByProperties("getChannels","getChannel");
			this.LastGuildStore = BDFDB.WebModules.findByProperties("getLastSelectedGuildId");
			this.LastChannelStore = BDFDB.WebModules.findByProperties("getLastSelectedChannelId");

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			let data = BDFDB.loadAllData(this, "users");
			BDFDB.removeAllData(this, "users");
			try {BDFDB.WebModules.forceAllUpdates(this);} catch (err) {}
			BDFDB.saveAllData(data, this, "users");

			BDFDB.removeEles(".autocompleteEditUsers", ".autocompleteEditUsersRow");

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	changeLanguageStrings () {
		this.userContextEntryMarkup =		this.userContextEntryMarkup.replace("REPLACE_context_localusersettings_text", this.labels.context_localusersettings_text);

		this.userContextSubMenuMarkup =		this.userContextSubMenuMarkup.replace("REPLACE_submenu_usersettings_text", this.labels.submenu_usersettings_text);
		this.userContextSubMenuMarkup =		this.userContextSubMenuMarkup.replace("REPLACE_submenu_resetsettings_text", this.labels.submenu_resetsettings_text);

		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_username_text", this.labels.modal_username_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_usertag_text", this.labels.modal_usertag_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_userurl_text", this.labels.modal_userurl_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_removeicon_text", this.labels.modal_removeicon_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_ignoretagcolor_text", this.labels.modal_ignoretagcolor_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_tabheader1_text", this.labels.modal_tabheader1_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_tabheader2_text", this.labels.modal_tabheader2_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_tabheader3_text", this.labels.modal_tabheader3_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker1_text", this.labels.modal_colorpicker1_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker2_text", this.labels.modal_colorpicker2_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker3_text", this.labels.modal_colorpicker3_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker4_text", this.labels.modal_colorpicker4_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_btn_cancel_text", this.labels.btn_cancel_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_btn_save_text", this.labels.btn_save_text);
	}

	onUserContextMenu (instance, menu) {
		if (instance.props && instance.props.user && !menu.querySelector(".localusersettings-item")) {
			let userContextEntry = BDFDB.htmlToElement(this.userContextEntryMarkup);
			let devgroup = BDFDB.React.findDOMNodeSafe(BDFDB.getOwnerInstance({node:menu,name:["DeveloperModeGroup","MessageDeveloperModeGroup"]}));
			if (devgroup) devgroup.parentElement.insertBefore(userContextEntry, devgroup);
			else menu.appendChild(userContextEntry, menu);
			let settingsitem = userContextEntry.querySelector(".localusersettings-item");
			settingsitem.addEventListener("mouseenter", () => {
				let userContextSubMenu = BDFDB.htmlToElement(this.userContextSubMenuMarkup);
				let useritem = userContextSubMenu.querySelector(".usersettings-item");
				useritem.addEventListener("click", () => {
					BDFDB.closeContextMenu(menu);
					this.showUserSettings(instance.props.user);
				});
				if (BDFDB.loadData(instance.props.user.id, this, "users")) {
					let resetitem = userContextSubMenu.querySelector(".resetsettings-item");
					BDFDB.removeClass(resetitem, BDFDB.disCN.contextmenuitemdisabled);
					resetitem.addEventListener("click", () => {
						BDFDB.closeContextMenu(menu);
						BDFDB.removeData(instance.props.user.id, this, "users");
						BDFDB.WebModules.forceAllUpdates(this);
					});
				}
				BDFDB.appendSubMenu(settingsitem, userContextSubMenu);
			});
		}
	}

	showUserSettings (info) {
		var {name,tag,url,removeIcon,ignoreTagColor,color1,color2,color3,color4} = BDFDB.loadData(info.id, this, "users") || {};

		var member = this.MemberUtils.getMember(this.LastGuildStore.getGuildId(), info.id) || {};

		let userSettingsModal = BDFDB.htmlToElement(this.userSettingsModalMarkup);
		let usernameinput = userSettingsModal.querySelector("#input-username");
		let usertaginput = userSettingsModal.querySelector("#input-usertag");
		let userurlinput = userSettingsModal.querySelector("#input-userurl");
		let removeiconinput = userSettingsModal.querySelector("#input-removeicon");
		let ignoretagcolorinput = userSettingsModal.querySelector("#input-ignoretagcolor");

		userSettingsModal.querySelector(BDFDB.dotCN.modalguildname).innerText = member.nick || info.username;
		usernameinput.value = name || "";
		usernameinput.setAttribute("placeholder", member.nick || info.username);
		usertaginput.value = tag || "";
		userurlinput.value = url || "";
		userurlinput.setAttribute("placeholder", BDFDB.getUserAvatar(info.id) || "");
		BDFDB.toggleClass(userurlinput, "valid", userurlinput.value.length > 0);
		userurlinput.disabled = removeIcon;
		removeiconinput.checked = removeIcon;
		ignoretagcolorinput.checked = ignoreTagColor;
		BDFDB.setColorSwatches(userSettingsModal, color1);
		BDFDB.setColorSwatches(userSettingsModal, color2);
		BDFDB.setColorSwatches(userSettingsModal, color3);
		BDFDB.setColorSwatches(userSettingsModal, color4);

		let ignoredswatches = userSettingsModal.querySelectorAll(".swatches[swatchnr='3'], .swatches[swatchnr='4']");

		BDFDB.toggleClass(ignoredswatches, "disabled", ignoretagcolorinput.checked);

		BDFDB.appendModal(userSettingsModal);

		removeiconinput.addEventListener("click", () => {
			userurlinput.disabled = removeiconinput.checked;
		});
		ignoretagcolorinput.addEventListener("click", () => {
			BDFDB.toggleClass(ignoredswatches, "disabled", ignoretagcolorinput.checked);
		});
		userurlinput.addEventListener("input", () => {
			this.checkUrl(userurlinput);
		});
		userurlinput.addEventListener("mouseenter", () => {
			BDFDB.addClass(userurlinput, "hovering");
			this.createNoticeTooltip(userurlinput);
		});
		userurlinput.addEventListener("mouseleave", () => {
			BDFDB.removeClass(userurlinput, "hovering");
			BDFDB.removeEles(BDFDB.dotCNS.tooltips + ".notice-tooltip");
		});
		BDFDB.addChildEventListener(userSettingsModal, "click", ".btn-save", e => {
			name = usernameinput.value.trim();
			name = name ? name : null;

			tag = usertaginput.value.trim();
			tag = tag ? tag : null;

			removeIcon = removeiconinput.checked;

			ignoreTagColor = ignoretagcolorinput.checked;

			url = !removeIcon && BDFDB.containsClass(userurlinput, "valid") ? userurlinput.value.trim() : null;
			url = url ? url : null;

			color1 = BDFDB.getSwatchColor(userSettingsModal, 1);
			color2 = BDFDB.getSwatchColor(userSettingsModal, 2);
			color3 = BDFDB.getSwatchColor(userSettingsModal, 3);
			color4 = BDFDB.getSwatchColor(userSettingsModal, 4);

			if (name == null && tag == null && url == null && !removeIcon && !ignoreTagColor && color1 == null && color2 == null && color3 == null && color4 == null) {
				BDFDB.removeData(info.id, this, "users")
			}
			else {
				BDFDB.saveData(info.id, {name,tag,url,removeIcon,ignoreTagColor,color1,color2,color3,color4}, this, "users");
			}
			BDFDB.WebModules.forceAllUpdates(this);
		});
		usernameinput.focus();
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

	processChannelTextArea (instance, wrapper) {
		let channel = BDFDB.getReactValue(instance, "props.channel");
		if (channel) {
			var textarea = wrapper.querySelector("textarea");
			if (!textarea) return;
			if (instance.props.type == "normal" && channel.type == 1) {
				let user = this.UserUtils.getUser(channel.recipients[0]);
				if (user) {
					let data = this.getUserData(user.id, wrapper);
					textarea.setAttribute("placeholder", BDFDB.LanguageStrings.TEXTAREA_PLACEHOLDER.replace("{{channel}}", "@" + (data.name || user.username)));
				}
			}
			BDFDB.removeEventListener(this, textarea);
			if (BDFDB.getData("changeInAutoComplete", this, "settings")) {
				BDFDB.addEventListener(this, textarea, "keydown", e => {
					let autocompletemenu = textarea.parentElement.querySelector(BDFDB.dotCN.autocomplete);
					if (autocompletemenu && (e.which == 9 || e.which == 13)) {
						if (BDFDB.containsClass(autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected).parentElement, "autocompleteEditUsersRow")) {
							BDFDB.stopEvent(e);
							this.swapWordWithMention(textarea); 
						}
					}
					else if (autocompletemenu && (e.which == 38 || e.which == 40)) {
						let autocompleteitems = autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselectable + ":not(.autocompleteEditUsersSelector)");
						let selected = autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected);
						if (BDFDB.containsClass(selected, "autocompleteEditUsersSelector") || autocompleteitems[e.which == 38 ? 0 : (autocompleteitems.length-1)] == selected) {
							BDFDB.stopEvent(e);
							let next = this.getNextSelection(autocompletemenu, null, e.which == 38 ? false : true);
							BDFDB.removeClass(selected, BDFDB.disCN.autocompleteselected);
							BDFDB.addClass(selected, BDFDB.disCN.autocompleteselector);
							BDFDB.addClass(next, BDFDB.disCN.autocompleteselected);
						}
					}
					else if (textarea.value && !e.shiftKey && e.which == 13 && !autocompletemenu && textarea.value.indexOf("s/") != 0) {
						this.format = true;
						textarea.dispatchEvent(new Event("input"));
					}
					else if (!e.ctrlKey && e.which != 16 && textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length) {
						clearTimeout(textarea.EditUsersAutocompleteTimeout);
						textarea.EditUsersAutocompleteTimeout = setTimeout(() => {this.addAutoCompleteMenu(textarea, channel);},100);
					}

					if (!e.ctrlKey && e.which != 38 && e.which != 40 && !(e.which == 39 && textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length)) BDFDB.removeEles(".autocompleteEditUsers", ".autocompleteEditUsersRow");
				});
				BDFDB.addEventListener(this, textarea, "click", e => {
					if (textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length) setImmediate(() => {this.addAutoCompleteMenu(textarea, channel);});
				});
			}
		}
	}

	processNameTag (instance, wrapper) {
		let username = wrapper.parentElement.querySelector("." + (BDFDB.containsClass(wrapper, BDFDB.disCN.userpopoutheadertagwithnickname) ? BDFDB.disCN.userpopoutheadernickname : instance.props.usernameClass).replace(/ /g, "."));
		this.changeName(instance.props.user, username);
		this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
		this.addTag(instance.props.user, username.parentElement, BDFDB.disCN.bottagnametag + (instance.props.botClass ? (" " + instance.props.botClass) : ""));
	}

	processMessageUsername (instance, wrapper) {
		let message = BDFDB.getReactValue(instance, "props.message");
		if (message) {
			let username = wrapper.querySelector(BDFDB.dotCN.messageusername);
			if (username) {
				let channel = this.ChannelUtils.getChannel(message.channel_id) || {};
				this.changeName(message.author, username, channel.guild_id);
				if (!BDFDB.containsClass(wrapper.parentElement, BDFDB.disCN.messageheadercompact)) this.changeAvatar(message.author, this.getAvatarDiv(wrapper));
				let messagegroup = BDFDB.getParentEle(BDFDB.dotCN.messagegroup, wrapper);
				this.addTag(message.author, wrapper, BDFDB.disCN.bottagmessage + " " + (BDFDB.containsClass(messagegroup, BDFDB.disCN.messagegroupcozy) ? BDFDB.disCN.bottagmessagecozy : BDFDB.disCN.bottagmessagecompact));
			}
		}
	}

	processAuditLog (instance, wrapper) {
		let log = BDFDB.getReactValue(instance, "props.log");
		if (log && log.user) {
			let hooks = wrapper.querySelectorAll(BDFDB.dotCN.auditloguserhook);
			let guild_id = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.guildId");
			if (hooks.length > 0) this.changeName2(log.user, hooks[0].firstChild, guild_id);
			if (hooks.length > 1 && log.targetType == "USER") this.changeName2(log.target, hooks[1].firstChild, guild_id);
		}
	}

	processBannedCard (instance, wrapper) {
		if (instance.props && instance.props.user && instance.props.guild) {
			let username = wrapper.querySelector(BDFDB.dotCN.guildsettingsbannedusername);
			if (username) {
				this.changeName3(instance.props.user, username, BDFDB.disCN.guildsettingsbanneddiscrim); 
				this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
			}
		}
	}

	processInviteCard (instance, wrapper) {
		let invite = BDFDB.getReactValue(instance, "props.invite");
		if (invite && invite.inviter && invite.guild) {
			let username = wrapper.querySelector(BDFDB.dotCN.guildsettingsinviteusername);
			if (username) {
				this.changeName2(invite.inviter, username, invite.guild.id);
				this.changeAvatar(invite.inviter, this.getAvatarDiv(wrapper));
			}
		}
	}

	processMemberCard (instance, wrapper) {
		if (instance.props && instance.props.user && instance.props.guild) {
			let username = wrapper.querySelector(BDFDB.dotCN.guildsettingsmembername);
			if (username) {
				this.changeName2(instance.props.user, username, instance.props.guild.id);
				this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
			}
		}
	}

	processTypingUsers (instance, wrapper) {
		let users = !instance.props.typingUsers ? [] : Object.keys(instance.props.typingUsers).filter(id => id != BDFDB.myData.id).filter(id => !this.RelationshipUtils.isBlocked(id)).map(id => this.UserUtils.getUser(id)).filter(id => id != null);
		wrapper.querySelectorAll(BDFDB.dotCNS.typing + "strong").forEach((username, i) => {
			if (users[i] && username) this.changeName2(users[i], username);
		});
	}

	processDirectMessage (instance, wrapper) {
		let channel = BDFDB.getReactValue(instance, "props.channel");
		if (channel && channel.type == 1) {
			let user = this.UserUtils.getUser(channel.recipients[0]);
			if (user) {
				let avatar = this.getAvatarDiv(wrapper);
				if (avatar) {
					this.changeAvatar(user, avatar);
					this.changeTooltip(user, avatar, "right");
				}
			}
		}
	}

	processCallAvatar (instance, wrapper) {
		if (instance.props && instance.props.id) {
			let user = this.UserUtils.getUser(instance.props.id);
			if (!user) {
				let channel = this.ChannelUtils.getChannel(instance.props.id);
				if (channel && channel.type == 1) user = this.UserUtils.getUser(channel.recipients[0]);
			}
			if (user) {
				let avatar = wrapper.querySelector(BDFDB.dotCN.callavatar);
				this.changeName2(user, wrapper.parentElement.querySelector(BDFDB.dotCN.callmembers));
				this.changeAvatar(user, avatar);
				if (BDFDB.containsClass(avatar, BDFDB.disCN.callvideo)) this.changeTooltip(user, avatar, "left");
			}
		}
	}

	processVideoTile (instance, wrapper) {
		if (instance.props && instance.props.user) this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
	}

	processPictureInPictureVideo (instance, wrapper) {
		if (instance.props && instance.props.backgroundKey) {
			let user = this.UserUtils.getUser(instance.props.backgroundKey);
			if (user) this.changeAvatar(user, this.getAvatarDiv(wrapper));
		}
	}

	processPrivateChannel (instance, wrapper) {
		if (instance.props && instance.props.user) {
			let username = wrapper.querySelector(BDFDB.dotCN.dmchannelname);
			this.changePrivateChannel(instance.props.user, username.firstElementChild ? username.firstElementChild : username);
			this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
		}
	}

	processHeaderBar (instance, wrapper) {
		let channel_id = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.channelId");
		if (channel_id) {
			let username = wrapper.querySelector(BDFDB.dotCN.channelheaderchannelname);
			if (username) {
				let channel = this.ChannelUtils.getChannel(channel_id);
				if (channel) {
					if (channel.type == 1) this.changeName(this.UserUtils.getUser(channel.recipients[0]), username);
					else {
						if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
						username.style.removeProperty("color");
						username.style.removeProperty("background");
						BDFDB.setInnerText(username, channel.name);
					}
				}
			}
		}
	}

	processClickable (instance, wrapper) {
		if (!wrapper || !instance.props || !instance.props.className) return;
		if (instance.props.tag == "a" && instance.props.className.indexOf(BDFDB.disCN.anchorunderlineonhover) > -1) {
			if (BDFDB.containsClass(wrapper.parentElement, BDFDB.disCN.messagesystemcontent) && wrapper.parentElement.querySelector("a") == wrapper) {
				let message = BDFDB.getKeyInformation({node:wrapper.parentElement, key:"message", up:true});
				if (message) {
					this.changeName(message.author, wrapper);
					if (message.mentions.length == 1) this.changeName(this.UserUtils.getUser(message.mentions[0]), wrapper.parentElement.querySelectorAll("a")[1]);
				}
			}
		}
		else if (instance.props.tag == "span" && instance.props.className.indexOf(BDFDB.disCN.mention) > -1) {
			let render = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.stateNode.props.render");
			if (typeof render == "function") this.changeMention(render().props.user, wrapper);
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.voiceuser) > -1) {
			let user = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.user");
			if (user) {
				this.changeVoiceUser(user, wrapper.querySelector(BDFDB.dotCN.voicename));
				this.changeAvatar(user, this.getAvatarDiv(wrapper));
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.quickswitchresult) > -1) {
			let user = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.memoizedProps.user");
			if (user) {
				this.changeName2(user, wrapper.querySelector(BDFDB.dotCN.quickswitchresultmatch));
				this.changeAvatar(user, this.getAvatarDiv(wrapper));
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.autocompleterow) > -1) {
			let user = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.user");
			if (user) {
				this.changeName2(user, wrapper.querySelector(BDFDB.dotCN.marginleft8));
				this.changeAvatar(user, this.getAvatarDiv(wrapper));
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.searchpopoutoption) > -1) {
			let user = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.user");
			let tokens = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedState.tokens");
			if (user && tokens && Array.isArray(tokens)) {
				for (let i in tokens) {
					let token = tokens[i];
					if (token.type == "ANSWER_USERNAME_FROM" && token._data && token._data.get("user")) {
						this.changeName3(token._data.get("user"), wrapper.children[i], true);
						this.changeAvatar(user, this.getAvatarDiv(wrapper));
						break;
					}
				}
			}
			else if (instance.props.className.indexOf(BDFDB.disCN.searchpopoutuser) > -1) {
				let result = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.result");
				if (result && result.user) {
					this.changeName3(result.user, wrapper.querySelector(BDFDB.dotCN.searchpopoutdisplayednick), false);
					this.changeAvatar(result.user, wrapper.querySelector(BDFDB.dotCN.searchpopoutdisplayavatar));
				}
			}
		}
	}

	processMessageContent (instance, wrapper) {
		let message = BDFDB.getReactValue(instance, "props.message");
		if (message && message.author) {
			let markup = wrapper.querySelector(BDFDB.dotCN.messagemarkup);
			if (markup) {
				let channel = this.ChannelUtils.getChannel(message.channel_id) || {};
				let member = this.MemberUtils.getMember(channel.guild_id, message.author.id) || {};
				let data = this.getUserData(message.author.id, wrapper);
				markup.style.setProperty("color", settingsCookie["bda-gs-7"] ? BDFDB.colorCONVERT(data.color1 || member.colorString, "RGB") : null, "important");
			}
		}
	}

	processStandardSidebarView (instance, wrapper) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			BDFDB.WebModules.forceAllUpdates(this);
		}
	}

	changeName (info, username, guildid = this.LastGuildStore.getGuildId()) {
		if (!info || !username || !username.parentElement) return;
		if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
		let data = this.getUserData(info.id, username);
		if (data.name || data.color1 || data.color2 || username.getAttribute("changed-by-editusers")) {
			let member = this.MemberUtils.getMember(guildid, info.id) || {};
			let isBRCenabled = BDFDB.isPluginEnabled("BetterRoleColors");
			let usenick = !BDFDB.containsClass(username, BDFDB.disCN.userprofileusername) && !BDFDB.containsClass(username.parentElement, BDFDB.disCN.userprofilelistname, BDFDB.disCN.accountinfodetails, false) && member.nick;
			let usemembercolor = !BDFDB.containsClass(username.parentElement, BDFDB.disCN.userprofilelistname) && (BDFDB.containsClass(username, BDFDB.disCN.memberusername, BDFDB.disCN.messageusername, false) || isBRCenabled);
			username.style.setProperty("color", BDFDB.colorCONVERT(data.color1 || (usemembercolor ? member.colorString : null), "RGB"), "important");
			username.style.setProperty("background-color", BDFDB.colorCONVERT(data.color2, "RGB"), "important");
			BDFDB.setInnerText(username, data.name || (usenick ? member.nick : info.username));
			this.changeBotTags(data, username, member);
			if (data.name || data.color1 || data.color2) {
				username.setAttribute("changed-by-editusers", true);
				username.EditUsersChangeObserver = new MutationObserver((changes, _) => {
					username.EditUsersChangeObserver.disconnect();
					this.changeName(info, username);
				});
				username.EditUsersChangeObserver.observe(username, {attributes:true});
			}
			else username.removeAttribute("changed-by-editusers");
		}
	}

	changeName2 (info, username, guildid = this.LastGuildStore.getGuildId()) {
		if (!info || !username || !username.parentElement) return;
		if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
		let data = this.getUserData(info.id, username);
		if (data.name || data.color1 || username.getAttribute("changed-by-editusers")) {
			let member = this.MemberUtils.getMember(guildid, info.id) || {};
			username.style.setProperty("color", BDFDB.colorCONVERT(data.color1 || (BDFDB.isPluginEnabled("BetterRoleColors") ? member.colorString : null), "RGB"), "important");
			BDFDB.setInnerText(username, data.name || member.nick || info.username);
			this.changeBotTags(data, username, member);
			if (data.name || data.color1) {
				username.setAttribute("changed-by-editusers", true);
				username.EditUsersChangeObserver = new MutationObserver((changes, _) => {
					username.EditUsersChangeObserver.disconnect();
					this.changeName(info, username);
				});
				username.EditUsersChangeObserver.observe(username, {attributes:true});
			}
			else username.removeAttribute("changed-by-editusers");
		}
	}

	changeName3 (info, username, adddisc) {
		if (!info || !username || !username.parentElement) return;
		if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
		let data = this.getUserData(info.id, username);
		if (data.name || data.color1 || username.getAttribute("changed-by-editusers")) {
			let color1 = BDFDB.colorCONVERT(data.color1, "RGB");
			if (adddisc) {
				username.innerHTML = `<span ${color1 ? 'style="color:' + color1 + ' !important;"': ''}>${BDFDB.encodeToHTML(data.name || info.username)}</span><span${typeof adddisc == "string" ? ' class="' + adddisc + '"' : ''}>#${info.discriminator}</span>`;
			}
			else {
				username.style.setProperty("color", color1, "important");
				BDFDB.setInnerText(username, data.name || info.username);
			}
			if (data.name || data.color1) {
				username.setAttribute("changed-by-editusers", true);
				username.EditUsersChangeObserver = new MutationObserver((changes, _) => {
					username.EditUsersChangeObserver.disconnect();
					this.changeName(info, username);
				});
				username.EditUsersChangeObserver.observe(username, {attributes:true});
			}
			else username.removeAttribute("changed-by-editusers");
		}
	}
	
	changeBotTags (data, username, member) {
		for (let tag of username.parentElement.querySelectorAll(BDFDB.dotCN.bottag)) {
			let invert = tag.className.indexOf(BDFDB.disCN.bottaginvert) > -1;
			let tagcolor =  BDFDB.colorCONVERT(data.color1 || (isBRCenabled || BDFDB.containsClass(tag, "owner-tag-rolecolor") ? member.colorString : null), "RGB");
			tagcolor = BDFDB.colorISBRIGHT(tagcolor) ? BDFDB.colorCHANGE(tagcolor, -0.3) : tagcolor;
			tag.style.setProperty(invert ? "color" : "background-color", tagcolor, "important");
		}
	}

	changeAvatar (info, avatar) {
		if (!info || !avatar || !avatar.parentElement) return;
		if (avatar.EditUsersChangeObserver && typeof avatar.EditUsersChangeObserver.disconnect == "function") avatar.EditUsersChangeObserver.disconnect();
		let data = this.getUserData(info.id, avatar);
		if (data.url || data.removeIcon || avatar.getAttribute("changed-by-editusers")) {
			if (avatar.tagName == "IMG") avatar.setAttribute("src", data.removeIcon ? null : (data.url || BDFDB.getUserAvatar(info.id)));
			else {
				let url = data.removeIcon ? null : ("url(" + (data.url || BDFDB.getUserAvatar(info.id)) + ")");
				if (url && BDFDB.containsClass(avatar, BDFDB.disCN.avatarmaskprofile) && url.search(/discordapp\.com\/avatars\/[0-9]*\/a_/) > -1) url = url.replace(".webp)", ".gif)");
				avatar.style.setProperty("background-image", url);
				if (data.url && !data.removeIcon) {
					avatar.style.setProperty("background-position", "center");
					avatar.style.setProperty("background-size", "cover");
				}
			}
			if (data.url || data.removeIcon) {
				avatar.setAttribute("changed-by-editusers", true);
				avatar.EditUsersChangeObserver = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							avatar.EditUsersChangeObserver.disconnect();
							this.changeAvatar(info, avatar);
						}
					);
				});
				avatar.EditUsersChangeObserver.observe(avatar, {attributes:true});
			}
			else avatar.removeAttribute("changed-by-editusers");
		}
	}

	changeTooltip (info, wrapper, type) {
		if (!info || !wrapper || !wrapper.parentElement) return;
		let data = this.getUserData(info.id, wrapper);
		wrapper.removeEventListener("mouseenter", wrapper.tooltipListenerEditUsers);
		if (data.name) {
			wrapper.tooltipListenerEditUsers = () => {
				BDFDB.createTooltip(data.name, wrapper, {type,selector:"EditUsers-tooltip",css:`body ${BDFDB.dotCN.tooltip}:not(.EditUsers-tooltip) {display: none !important;}`});
			};
			wrapper.addEventListener("mouseenter", wrapper.tooltipListenerEditUsers);
		}
	}

	addTag (info, wrapper, selector = "") {
		if (!info || !wrapper || !wrapper.parentElement || BDFDB.containsClass(wrapper, BDFDB.disCN.accountinfodetails) || BDFDB.containsClass(wrapper, "discord-tag")) return;
		BDFDB.removeEles(wrapper.querySelectorAll(".EditUsers-tag"));
		let data = this.getUserData(info.id, wrapper);
		if (data.tag) {
			let member = data.ignoreTagColor ? (this.MemberUtils.getMember(this.LastGuildStore.getGuildId(), info.id) || {}) : {};
			let color3 = BDFDB.colorCONVERT(!data.ignoreTagColor ? data.color3 : member.colorString, "RGB");
			let color4 = !data.ignoreTagColor && data.color4 ? BDFDB.colorCONVERT(data.color4, "RGB") : (BDFDB.colorISBRIGHT(color3) ? "black" : "white");
			let tag = document.createElement("span");
			tag.className = "EditUsers-tag " + BDFDB.disCN.bottag + (selector ? (" " + selector) : "");
			tag.innerText = data.tag;
			tag.style.setProperty("background-color", color3, "important");
			tag.style.setProperty("color", color4, "important");
			wrapper.appendChild(tag);
		}
	}

	changePrivateChannel (info, username) {
		if (!info || !username || !username.parentElement) return;
		let dmchannel = BDFDB.getParentEle(BDFDB.dotCN.dmchannel, username);
		if (!dmchannel) return;
		if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
		dmchannel.removeEventListener("mouseenter", dmchannel.mouseenterListenerEditUsers);
		dmchannel.removeEventListener("mouseleave", dmchannel.mouseleaveListenerEditUsers);
		let data = this.getUserData(info.id, username);
		if (data.name || data.color1 || data.color2 || username.getAttribute("changed-by-editusers")) {
			let color1 = BDFDB.colorCONVERT(data.color1, "RGB");
			let color2 = BDFDB.colorCONVERT(data.color2, "RGB");
			BDFDB.setInnerText(username, data.name || info.username);
			if (username.EditUsersHovered || BDFDB.containsClass(dmchannel, BDFDB.disCN.dmchannelselected)) colorHover();
			else colorDefault();

			if (data.name || data.color1 || data.color2) {
				dmchannel.mouseenterListenerEditUsers = () => {
					username.EditUsersHovered = true;
					colorHover();
				};
				dmchannel.mouseleaveListenerEditUsers = () => {
					delete username.EditUsersHovered;
					colorDefault();
				};
				dmchannel.addEventListener("mouseenter", dmchannel.mouseenterListenerEditUsers);
				dmchannel.addEventListener("mouseleave", dmchannel.mouseleaveListenerEditUsers);
				username.setAttribute("changed-by-editusers", true);
				username.EditUsersChangeObserver = new MutationObserver((changes, _) => {
					username.EditUsersChangeObserver.disconnect();
					this.changePrivateChannel(info, username);
				});
				username.EditUsersChangeObserver.observe(username, {attributes:true});
			}
			else username.removeAttribute("changed-by-editusers");
			function colorDefault() {
				username.style.setProperty("color", color1 ? BDFDB.colorCHANGE(color1, -0.5) : null, "important");
				username.style.setProperty("background", color2 ? BDFDB.colorCHANGE(color2, -0.5) : null, "important");
			}
			function colorHover() {
				username.style.setProperty("color", color1, "important");
				username.style.setProperty("background", color2, "important");
			}
		}
	}

	changeMention (info, mention) {
		if (!info || !mention || !mention.parentElement) return;
		if (mention.EditUsersChangeObserver && typeof mention.EditUsersChangeObserver.disconnect == "function") mention.EditUsersChangeObserver.disconnect();
		mention.removeEventListener("mouseover", mention.mouseoverListenerEditUsers);
		mention.removeEventListener("mouseout", mention.mouseoutListenerEditUsers);
		let data = this.getUserData(info.id, mention);
		let member = this.MemberUtils.getMember(this.LastGuildStore.getGuildId(), info.id) || {};
		let color1 = BDFDB.colorCONVERT(data.color1 || (BDFDB.isPluginEnabled("BetterRoleColors") ? member.colorString : null), "RGBCOMP");
		let name = data.name ? data.name : (BDFDB.isPluginEnabled("RemoveNicknames") ? bdplugins.RemoveNicknames.plugin.getNewName(info) : member.nick || info.username);
		BDFDB.setInnerText(mention, "@" + name);
		if (mention.EditUsersHovered) colorHover();
		else colorDefault();
		mention.mouseoverListenerEditUsers = () => {
			mention.EditUsersHovered = true;
			colorHover();
		};
		mention.mouseoutListenerEditUsers = () => {
			delete mention.EditUsersHovered;
			colorDefault();
		};
		mention.addEventListener("mouseover", mention.mouseoverListenerEditUsers);
		mention.addEventListener("mouseout", mention.mouseoutListenerEditUsers);
		mention.EditUsersChangeObserver = new MutationObserver((changes, _) => {
			mention.EditUsersChangeObserver.disconnect();
			this.changeMention(info, mention);
		});
		mention.EditUsersChangeObserver.observe(mention, {attributes:true});
		function colorDefault() {
			mention.style.setProperty("color", color1 ? "rgb(" + color1[0] + "," + color1[1] + "," + color1[2] + ")" : null, "important");
			mention.style.setProperty("background", color1 ? "rgba(" + color1[0] + "," + color1[1] + "," + color1[2] + ",.1)" : null, "important");
		}
		function colorHover() {
			mention.style.setProperty("color", color1 ? "#FFFFFF" : null, "important");
			mention.style.setProperty("background", color1 ? "rgba(" + color1[0] + "," + color1[1] + "," + color1[2] + ",.7)" : null, "important");
		}
	}

	changeVoiceUser (info, username) {
		if (!info || !username || !username.parentElement) return;
		if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
		let data = this.getUserData(info.id, username);
		if (data.name || data.color1 || username.getAttribute("changed-by-editusers")) {
			let member = this.MemberUtils.getMember(this.LastGuildStore.getGuildId(), info.id) || {};
			let color1 = BDFDB.colorCONVERT(data.color1 || (BDFDB.isPluginEnabled("BetterRoleColors") ? member.colorString : ""), "RGB");
			BDFDB.setInnerText(username, data.name || member.nick || info.username);
			username.style.setProperty("color", BDFDB.containsClass(username, BDFDB.disCN.voicenamedefault) ? BDFDB.colorCHANGE(color1, -50) : color1, "important");
			if (data.name || data.color1) {
				username.EditUsersChangeObserver = new MutationObserver((changes, _) => {
					username.EditUsersChangeObserver.disconnect();
					this.changeVoiceUser(info, username);
				});
				username.EditUsersChangeObserver.observe(username, {attributes:true});
			}
			else username.removeAttribute("changed-by-editusers");
		}
	}

	getAvatarDiv (wrapper) {
		var avatar = wrapper.querySelector(this.avatarselector);
		while (!avatar && wrapper.parentElement) {
			wrapper = wrapper.parentElement;
			avatar = wrapper.querySelector(this.avatarselector);
		}
		return avatar.firstElementChild || avatar;
	}

	getUserData (id, wrapper) {
		let data = BDFDB.loadData(id, this, "users");
		if (!data) return {};
		let allenabled = true, settings = BDFDB.getAllData(this, "settings");
		for (let i in settings) if (!settings[i]) {
			allenabled = false;
			break;
		}
		if (allenabled) return data;
		let key = null;
		if (!BDFDB.containsClass(wrapper, BDFDB.disCN.mention) && BDFDB.getParentEle(BDFDB.dotCN.messagegroup, wrapper)) key = "changeInChatWindow";
		else if (BDFDB.containsClass(wrapper, BDFDB.disCN.mention)) key = "changeInMentions";
		else if (BDFDB.getParentEle(BDFDB.dotCN.textareawrapchat, wrapper)) key = "changeInChatTextarea";
		else if (BDFDB.getParentEle(BDFDB.dotCN.voiceuser, wrapper)) key = "changeInVoiceChat";
		else if (BDFDB.getParentEle(BDFDB.dotCN.members, wrapper)) key = "changeInMemberList";
		else if (BDFDB.getParentEle(BDFDB.dotCN.dmguild, wrapper)) key = "changeInRecentDms";
		else if (BDFDB.getParentEle(BDFDB.dotCN.dmchannels, wrapper)) key = "changeInDmsList";
		else if (BDFDB.getParentEle(BDFDB.dotCN.channelheaderheaderbar, wrapper)) key = "changeInDmHeader";
		else if (BDFDB.getParentEle(BDFDB.dotCN.callavatarwrapper, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.callincoming, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.callcurrentcontainer, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.pictureinpicture, wrapper)) key = "changeInDmCalls";
		else if (BDFDB.getParentEle(BDFDB.dotCN.typing, wrapper)) key = "changeInTyping";
		else if (BDFDB.getParentEle(BDFDB.dotCN.friends, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.userprofilebody, wrapper)) key = "changeInFriendList";
		else if (BDFDB.getParentEle(BDFDB.dotCN.activityfeed, wrapper)) key = "changeInActivity";
		else if (BDFDB.getParentEle(BDFDB.dotCN.userpopout, wrapper)) key = "changeInUserPopout";
		else if (BDFDB.getParentEle(BDFDB.dotCN.userprofileheader, wrapper)) key = "changeInUserProfil";
		else if (BDFDB.getParentEle(BDFDB.dotCN.autocomplete, wrapper)) key = "changeInAutoComplete";
		else if (BDFDB.getParentEle(BDFDB.dotCN.auditlog, wrapper)) key = "changeInAuditLog";
		else if (BDFDB.getParentEle(BDFDB.dotCN.guildsettingsbannedcard, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.guildsettingsinvitecard, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.guildsettingsmembercard, wrapper)) key = "changeInMemberLog";
		else if (BDFDB.getParentEle(BDFDB.dotCN.searchpopout, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.searchpopoutdmaddpopout, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.quickswitcher, wrapper)) key = "changeInSearchPopout";
		else if (BDFDB.getParentEle(BDFDB.dotCN.accountinfo, wrapper)) key = "changeInUserAccount";

		return !key || settings[key] ? data : {};
	}

	addAutoCompleteMenu (textarea, channel) {
		if (textarea.parentElement.querySelector(".autocompleteEditUsersRow")) return;
		let words = textarea.value.split(/\s/);
		let lastword = words[words.length-1].trim();
		if (lastword && lastword.length > 1 && lastword[0] == "@") {
			let users = BDFDB.loadAllData(this, "users");
			if (!users) return;
			let userarray = [];
			for (let id in users) if (users[id].name) {
				let user = this.UserUtils.getUser(id);
				let member = user ? this.MemberUtils.getMember(channel.guild_id, id) : null;
				if (user && member) userarray.push(Object.assign({lowercasename:users[id].name.toLowerCase(),user,member},users[id]));
			}
			userarray = BDFDB.sortArrayByKey(userarray.filter(n => n.lowercasename.indexOf(lastword.toLowerCase().slice(1)) != -1), "lowercasename");
			if (userarray.length) {
				let autocompletemenu = textarea.parentElement.querySelector(BDFDB.dotCNS.autocomplete + BDFDB.dotCN.autocompleteinner), amount = 15;
				if (!autocompletemenu) {
					autocompletemenu = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.autocomplete + BDFDB.disCN.autocomplete2} autocompleteEditUsers"><div class="${BDFDB.disCN.autocompleteinner}"><div class="${BDFDB.disCNS.autocompleterowvertical + BDFDB.disCN.autocompleterow} autocompleteEditUsersRow"><div class="${BDFDB.disCN.autocompleteselector} autocompleteEditUsersSelector"><div class="${BDFDB.disCNS.autocompletecontenttitle + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.weightsemibold}">${BDFDB.LanguageStrings.MEMBERS_MATCHING.replace("{{prefix}}", BDFDB.encodeToHTML(lastword))}</strong></div></div></div></div></div>`);
					textarea.parentElement.appendChild(autocompletemenu);
					autocompletemenu = autocompletemenu.firstElementChild;
				}
				else {
					amount -= autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselectable).length;
				}

				BDFDB.addEventListener(this, autocompletemenu, "mouseenter", BDFDB.dotCN.autocompleteselectable, e => {
					var selected = autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselected);
					BDFDB.removeClass(selected, BDFDB.disCN.autocompleteselected);
					BDFDB.addClass(selected, BDFDB.disCN.autocompleteselector);
					BDFDB.addClass(e.currentTarget, BDFDB.disCN.autocompleteselected);
				});

				for (let data of userarray) {
					if (amount-- < 1) break;
					let autocompleterow = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.autocompleterowvertical + BDFDB.disCN.autocompleterow} autocompleteEditUsersRow"><div userid="${data.user.id}" class="${BDFDB.disCNS.autocompleteselector + BDFDB.disCN.autocompleteselectable} autocompleteEditUsersSelector"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.autocompletecontent}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.avatarwrapper + BDFDB.disCN.avatarxsmall}"><div class="${BDFDB.disCN.avatarimage + BDFDB.disCNS.avatarxsmall + BDFDB.disCN.avatarmask}"${data.removeIcon ? '' : 'style="background-image: url(' + (data.url || BDFDB.getUserAvatar(data.user.id)) + ');"'}></div><div class="${BDFDB.disCNS['status' + BDFDB.getUserStatus(data.user.id)] + BDFDB.disCNS.status + BDFDB.disCNS.avatarxsmall + BDFDB.disCN.autocompleteavatarstatus}"></div></div><div class="${BDFDB.disCN.marginleft8}" changed-by-editusers="true" style="flex: 1 1 auto;${data.color1 ? (' color: ' + BDFDB.colorCONVERT(data.color1, 'RGB') + ' !important;') : ''}">${BDFDB.encodeToHTML(data.name || data.member.nick || data.user.username)}</div><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.autocompletedescription}" style="flex: 0 1 auto;"><div class="${BDFDB.disCN.autocompletedescriptionusername}">${BDFDB.encodeToHTML(data.user.username)}</div><div class="${BDFDB.disCN.autocompletedescriptiondiscriminator}">#${data.user.discriminator}</div></div></div></div></div>`);
					autocompleterow.querySelector(BDFDB.dotCN.autocompleteselectable).addEventListener("click", () => {this.swapWordWithMention(textarea);});
					autocompletemenu.appendChild(autocompleterow);
				}
				if (!autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected)) {
					BDFDB.addClass(autocompletemenu.querySelector(".autocompleteEditUsersRow " + BDFDB.dotCN.autocompleteselectable), BDFDB.disCN.autocompleteselected);
				}
			}
		}
	}

	getNextSelection (menu, selected, forward) {
		selected = selected ? selected : menu.querySelector(BDFDB.dotCN.autocompleteselected).parentElement;
		let next, sibling = forward ? selected.nextElementSibling : selected.previousElementSibling;
		if (sibling) {
			next = sibling.querySelector(BDFDB.dotCN.autocompleteselectable);
		}
		else {
			let items = menu.querySelectorAll(BDFDB.dotCN.autocompleteselectable);
			next = forward ? items[0] : items[items.length-1]; 
		}
		return next ? next : this.getNextSelection(menu, sibling, forward);
	}

	swapWordWithMention (textarea) {
		let selected = textarea.parentElement.querySelector(".autocompleteEditUsersRow " + BDFDB.dotCN.autocompleteselected);
		let words = textarea.value.split(/\s/);
		let lastword = words[words.length-1].trim();
		if (selected && lastword) {
			let username = selected.querySelector(BDFDB.dotCN.autocompletedescriptionusername).textContent;
			let discriminator = selected.querySelector(BDFDB.dotCN.autocompletedescriptiondiscriminator).textContent;
			let userid = selected.getAttribute("userid");
			BDFDB.removeEles(".autocompleteEditUsers", ".autocompleteEditUsersRow");
			textarea.focus(); 
			textarea.selectionStart = textarea.value.length - lastword.length;
			textarea.selectionEnd = textarea.value.length;
			document.execCommand("insertText", false, (username && discriminator ? ("@" + username + discriminator) : `<@!${userid}>`) + " ");
			textarea.selectionStart = textarea.value.length;
			textarea.selectionEnd = textarea.value.length;
		}
	}

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					context_localusersettings_text:		"Lokalne korisničke postavke",
					submenu_usersettings_text:			"Promijeni postavke",
					submenu_resetsettings_text:			"Poništi korisnika",
					modal_header_text:					"Lokalne korisničke postavke",
					modal_username_text:				"Lokalno korisničko ime",
					modal_usertag_text:					"Oznaka",
					modal_userurl_text:					"Ikona",
					modal_removeicon_text:				"Ukloni ikonu",
					modal_tabheader1_text:				"Korisnik",
					modal_tabheader2_text:				"Boja naziva",
					modal_tabheader3_text:				"Boja oznaka",
					modal_colorpicker1_text:			"Boja naziva",
					modal_colorpicker2_text:			"Boja pozadine",
					modal_colorpicker3_text:			"Boja oznaka",
					modal_colorpicker4_text:			"Boja fonta",
					modal_ignoreurl_text:				"URL ignorirati",
					modal_ignoretagcolor_text:			"Upotrijebite boju uloga",
					modal_validurl_text:				"Vrijedi URL",
					modal_invalidurl_text:				"Nevažeći URL",
					btn_cancel_text:					"Prekid",
					btn_save_text:						"Uštedjeti"
				};
			case "da":		//danish
				return {
					context_localusersettings_text:		"Lokal brugerindstillinger",
					submenu_usersettings_text:			"Skift indstillinger",
					submenu_resetsettings_text:			"Nulstil bruger",
					modal_header_text:					"Lokal brugerindstillinger",
					modal_username_text:				"Lokalt brugernavn",
					modal_usertag_text:					"Initialer",
					modal_userurl_text:					"Ikon",
					modal_removeicon_text:				"Fjern ikon",
					modal_tabheader1_text:				"Bruger",
					modal_tabheader2_text:				"Navnefarve",
					modal_tabheader3_text:				"Etiketfarve",
					modal_colorpicker1_text:			"Navnefarve",
					modal_colorpicker2_text:			"Baggrundsfarve",
					modal_colorpicker3_text:			"Etiketfarve",
					modal_colorpicker4_text:			"Skriftfarve",
					modal_ignoreurl_text:				"Ignorer URL",
					modal_ignoretagcolor_text:			"Brug rollefarve",
					modal_validurl_text:				"Gyldig URL",
					modal_invalidurl_text:				"Ugyldig URL",
					btn_cancel_text:					"Afbryde",
					btn_save_text:						"Spare"
				};
			case "de":		//german
				return {
					context_localusersettings_text:		"Lokale Benutzereinstellungen",
					submenu_usersettings_text:			"Einstellungen ändern",
					submenu_resetsettings_text:			"Benutzer zurücksetzen",
					modal_header_text:					"Lokale Benutzereinstellungen",
					modal_username_text:				"Lokaler Benutzername",
					modal_usertag_text:					"Etikett",
					modal_userurl_text:					"Icon",
					modal_removeicon_text:				"Entferne Icon",
					modal_tabheader1_text:				"Benutzer",
					modal_tabheader2_text:				"Namensfarbe",
					modal_tabheader3_text:				"Etikettfarbe",
					modal_colorpicker1_text:			"Namensfarbe",
					modal_colorpicker2_text:			"Hintergrundfarbe",
					modal_colorpicker3_text:			"Etikettfarbe",
					modal_colorpicker4_text:			"Schriftfarbe",
					modal_ignoreurl_text:				"URL ignorieren",
					modal_ignoretagcolor_text:			"Benutze Rollenfarbe",
					modal_validurl_text:				"Gültige URL",
					modal_invalidurl_text:				"Ungültige URL",
					btn_cancel_text:					"Abbrechen",
					btn_save_text:						"Speichern"
				};
			case "es":		//spanish
				return {
					context_localusersettings_text:		"Ajustes local de usuario",
					submenu_usersettings_text:			"Cambiar ajustes",
					submenu_resetsettings_text:			"Restablecer usuario",
					modal_header_text:					"Ajustes local de usuario",
					modal_username_text:				"Nombre local de usuario",
					modal_usertag_text:					"Etiqueta",
					modal_userurl_text:					"Icono",
					modal_removeicon_text:				"Eliminar icono",
					modal_tabheader1_text:				"Usuario",
					modal_tabheader2_text:				"Color del nombre",
					modal_tabheader3_text:				"Color de la etiqueta",
					modal_colorpicker1_text:			"Color del nombre",
					modal_colorpicker2_text:			"Color de fondo",
					modal_colorpicker3_text:			"Color de la etiqueta",
					modal_colorpicker4_text:			"Color de fuente",
					modal_ignoreurl_text:				"Ignorar URL",
					modal_ignoretagcolor_text:			"Usar color de rol",
					modal_validurl_text:				"URL válida",
					modal_invalidurl_text:				"URL inválida",
					btn_cancel_text:					"Cancelar",
					btn_save_text:						"Guardar"
				};
			case "fr":		//french
				return {
					context_localusersettings_text:		"Paramètres locale d'utilisateur",
					submenu_usersettings_text:			"Modifier les paramètres",
					submenu_resetsettings_text:			"Réinitialiser l'utilisateur",
					modal_header_text:					"Paramètres locale d'utilisateur",
					modal_username_text:				"Nom local d'utilisateur",
					modal_usertag_text:					"Étiquette",
					modal_userurl_text:					"Icône",
					modal_removeicon_text:				"Supprimer l'icône",
					modal_tabheader1_text:				"Serveur",
					modal_tabheader2_text:				"Couleur du nom",
					modal_tabheader3_text:				"Couleur de l'étiquette",
					modal_colorpicker1_text:			"Couleur du nom",
					modal_colorpicker2_text:			"Couleur de fond",
					modal_colorpicker3_text:			"Couleur de l'étiquette",
					modal_colorpicker4_text:			"Couleur de la police",
					modal_ignoreurl_text:				"Ignorer l'URL",
					modal_ignoretagcolor_text:			"Utiliser la couleur de rôle",
					modal_validurl_text:				"URL valide",
					modal_invalidurl_text:				"URL invalide",
					btn_cancel_text:					"Abandonner",
					btn_save_text:						"Enregistrer"
				};
			case "it":		//italian
				return {
					context_localusersettings_text:		"Impostazioni locale utente",
					submenu_usersettings_text:			"Cambia impostazioni",
					submenu_resetsettings_text:			"Ripristina utente",
					modal_header_text:					"Impostazioni locale utente",
					modal_username_text:				"Nome locale utente",
					modal_usertag_text:					"Etichetta",
					modal_userurl_text:					"Icona",
					modal_removeicon_text:				"Rimuova l'icona",
					modal_tabheader1_text:				"Utente",
					modal_tabheader2_text:				"Colore del nome",
					modal_tabheader3_text:				"Colore della etichetta",
					modal_colorpicker1_text:			"Colore del nome",
					modal_colorpicker2_text:			"Colore di sfondo",
					modal_colorpicker3_text:			"Colore della etichetta",
					modal_colorpicker4_text:			"Colore del carattere",
					modal_ignoreurl_text:				"Ignora l'URL",
					modal_ignoretagcolor_text:			"Usa il colore del ruolo",
					modal_validurl_text:				"URL valido",
					modal_invalidurl_text:				"URL non valido",
					btn_cancel_text:					"Cancellare",
					btn_save_text:						"Salvare"
				};
			case "nl":		//dutch
				return {
					context_localusersettings_text:		"Lokale gebruikerinstellingen",
					submenu_usersettings_text:			"Verandere instellingen",
					submenu_resetsettings_text:			"Reset gebruiker",
					modal_header_text:					"Lokale gebruikerinstellingen",
					modal_username_text:				"Lokale gebruikernaam",
					modal_usertag_text:					"Etiket",
					modal_userurl_text:					"Icoon",
					modal_removeicon_text:				"Verwijder icoon",
					modal_tabheader1_text:				"Gebruiker",
					modal_tabheader2_text:				"Naamkleur",
					modal_tabheader3_text:				"Etiketkleur",
					modal_colorpicker1_text:			"Naamkleur",
					modal_colorpicker2_text:			"Achtergrondkleur",
					modal_colorpicker3_text:			"Etiketkleur",
					modal_colorpicker4_text:			"Doopvontkleur",
					modal_ignoreurl_text:				"URL negeren",
					modal_ignoretagcolor_text:			"Gebruik rolkleur",
					modal_validurl_text:				"Geldige URL",
					modal_invalidurl_text:				"Ongeldige URL",
					btn_cancel_text:					"Afbreken",
					btn_save_text:						"Opslaan"
				};
			case "no":		//norwegian
				return {
					context_localusersettings_text:		"Lokal brukerinnstillinger",
					submenu_usersettings_text:			"Endre innstillinger",
					submenu_resetsettings_text:			"Tilbakestill bruker",
					modal_header_text:					"Lokal brukerinnstillinger",
					modal_username_text:				"Lokalt gebruikernavn",
					modal_usertag_text:					"Stikkord",
					modal_userurl_text:					"Ikon",
					modal_removeicon_text:				"Fjern ikon",
					modal_tabheader1_text:				"Bruker",
					modal_tabheader2_text:				"Navnfarge",
					modal_tabheader3_text:				"Stikkordfarge",
					modal_colorpicker1_text:			"Navnfarge",
					modal_colorpicker2_text:			"Bakgrunnfarge",
					modal_colorpicker3_text:			"Stikkordfarge",
					modal_colorpicker4_text:			"Skriftfarge",
					modal_ignoreurl_text:				"Ignorer URL",
					modal_ignoretagcolor_text:			"Bruk rollefarge",
					modal_validurl_text:				"Gyldig URL",
					modal_invalidurl_text:				"Ugyldig URL",
					btn_cancel_text:					"Avbryte",
					btn_save_text:						"Lagre"
				};
			case "pl":		//polish
				return {
					context_localusersettings_text:		"Lokalne ustawienia użytkownika",
					submenu_usersettings_text:			"Zmień ustawienia",
					submenu_resetsettings_text:			"Resetuj ustawienia",
					modal_header_text:					"Lokalne ustawienia użytkownika",
					modal_username_text:				"Lokalna nazwa użytkownika",
					modal_usertag_text:					"Etykieta",
					modal_userurl_text:					"Ikona",
					modal_removeicon_text:				"Usuń ikonę",
					modal_tabheader1_text:				"Użytkownik",
					modal_tabheader2_text:				"Kolor nazwy",
					modal_tabheader3_text:				"Kolor etykiety",
					modal_colorpicker1_text:			"Kolor nazwy",
					modal_colorpicker2_text:			"Kolor tła",
					modal_colorpicker3_text:			"Kolor etykiety",
					modal_colorpicker4_text:			"Kolor czcionki",
					modal_ignoreurl_text:				"Ignoruj URL",
					modal_ignoretagcolor_text:			"Użyj kolor roli",
					modal_validurl_text:				"Prawidłowe URL",
					modal_invalidurl_text:				"Nieprawidłowe URL",
					btn_cancel_text:					"Anuluj",
					btn_save_text:						"Zapisz"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_localusersettings_text:		"Configurações local do utilizador",
					submenu_usersettings_text:			"Mudar configurações",
					submenu_resetsettings_text:			"Redefinir utilizador",
					modal_header_text:					"Configurações local do utilizador",
					modal_username_text:				"Nome local do utilizador",
					modal_usertag_text:					"Etiqueta",
					modal_userurl_text:					"Icone",
					modal_removeicon_text:				"Remover ícone",
					modal_tabheader1_text:				"Utilizador",
					modal_tabheader2_text:				"Cor do nome",
					modal_tabheader3_text:				"Cor da etiqueta",
					modal_colorpicker1_text:			"Cor do nome",
					modal_colorpicker2_text:			"Cor do fundo",
					modal_colorpicker3_text:			"Cor da etiqueta",
					modal_colorpicker4_text:			"Cor da fonte",
					modal_ignoreurl_text:				"Ignorar URL",
					modal_ignoretagcolor_text:			"Use a cor do papel",
					modal_validurl_text:				"URL válido",
					modal_invalidurl_text:				"URL inválida",
					btn_cancel_text:					"Cancelar",
					btn_save_text:						"Salvar"
				};
			case "fi":		//finnish
				return {
					context_localusersettings_text:		"Paikallinen käyttäjä asetukset",
					submenu_usersettings_text:			"Vaihda asetuksia",
					submenu_resetsettings_text:			"Nollaa käyttäjä",
					modal_header_text:					"Paikallinen käyttäjä asetukset",
					modal_username_text:				"Paikallinen käyttäjätunnus",
					modal_usertag_text:					"Merkki",
					modal_userurl_text:					"Ikonin",
					modal_removeicon_text:				"Poista kuvake",
					modal_tabheader1_text:				"Käyttäjä",
					modal_tabheader2_text:				"Nimiväri",
					modal_tabheader3_text:				"Merkkiväri",
					modal_colorpicker1_text:			"Nimiväri",
					modal_colorpicker2_text:			"Taustaväri",
					modal_colorpicker3_text:			"Merkkiväri",
					modal_colorpicker4_text:			"Fontinväri",
					modal_ignoreurl_text:				"Ohita URL",
					modal_ignoretagcolor_text:			"Käytä rooliväriä",
					modal_validurl_text:				"Voimassa URL",
					modal_invalidurl_text:				"Virheellinen URL",
					btn_cancel_text:					"Peruuttaa",
					btn_save_text:						"Tallentaa"
				};
			case "sv":		//swedish
				return {
					context_localusersettings_text:		"Lokal användareinställningar",
					submenu_usersettings_text:			"Ändra inställningar",
					submenu_resetsettings_text:			"Återställ användare",
					modal_header_text:					"Lokal användareinställningar",
					modal_username_text:				"Lokalt användarenamn",
					modal_usertag_text:					"Märka",
					modal_userurl_text:					"Ikon",
					modal_removeicon_text:				"Ta bort ikonen",
					modal_tabheader1_text:				"Användare",
					modal_tabheader2_text:				"Namnfärg",
					modal_tabheader3_text:				"Märkafärg",
					modal_colorpicker1_text:			"Namnfärg",
					modal_colorpicker2_text:			"Bakgrundfärg",
					modal_colorpicker3_text:			"Märkafärg",
					modal_colorpicker4_text:			"Fontfärg",
					modal_ignoreurl_text:				"Ignorera URL",
					modal_ignoretagcolor_text:			"Använd rollfärg",
					modal_validurl_text:				"Giltig URL",
					modal_invalidurl_text:				"Ogiltig URL",
					btn_cancel_text:					"Avbryta",
					btn_save_text:						"Spara"
				};
			case "tr":		//turkish
				return {
					context_localusersettings_text:		"Yerel Kullanıcı Ayarları",
					submenu_usersettings_text:			"Ayarları Değiştir",
					submenu_resetsettings_text:			"Kullanıcı Sıfırla",
					modal_header_text:					"Yerel Kullanıcı Ayarları",
					modal_username_text:				"Yerel Kullanıcı Isim",
					modal_usertag_text:					"Etiket",
					modal_userurl_text:					"Simge",
					modal_removeicon_text:				"Simge kaldır",
					modal_tabheader1_text:				"Kullanıcı",
					modal_tabheader2_text:				"Simge rengi",
					modal_tabheader3_text:				"Isim rengi",
					modal_colorpicker1_text:			"Simge rengi",
					modal_colorpicker2_text:			"Arka fon rengi",
					modal_colorpicker3_text:			"Etiket rengi",
					modal_colorpicker4_text:			"Yazı rengi",
					modal_ignoreurl_text:				"URL yoksay",
					modal_ignoretagcolor_text:			"Rol rengini kullan",
					modal_validurl_text:				"Geçerli URL",
					modal_invalidurl_text:				"Geçersiz URL",
					btn_cancel_text:					"Iptal",
					btn_save_text:						"Kayıt"
				};
			case "cs":		//czech
				return {
					context_localusersettings_text:		"Místní nastavení uživatel",
					submenu_usersettings_text:			"Změnit nastavení",
					submenu_resetsettings_text:			"Obnovit uživatel",
					modal_header_text:					"Místní nastavení uživatel",
					modal_username_text:				"Místní název uživatel",
					modal_usertag_text:					"Štítek",
					modal_userurl_text:					"Ikony",
					modal_removeicon_text:				"Odstranit ikonu",
					modal_tabheader1_text:				"Uživatel",
					modal_tabheader2_text:				"Barva název",
					modal_tabheader3_text:				"Barva štítek",
					modal_colorpicker1_text:			"Barva název",
					modal_colorpicker2_text:			"Barva pozadí",
					modal_colorpicker3_text:			"Barva štítek",
					modal_colorpicker4_text:			"Barva fontu",
					modal_ignoreurl_text:				"Ignorovat URL",
					modal_ignoretagcolor_text:			"Použijte barva role",
					modal_validurl_text:				"Platná URL",
					modal_invalidurl_text:				"Neplatná URL",
					btn_cancel_text:					"Zrušení",
					btn_save_text:						"Uložit"
				};
			case "bg":		//bulgarian
				return {
					context_localusersettings_text:		"Настройки за локални потребител",
					submenu_usersettings_text:			"Промяна на настройките",
					submenu_resetsettings_text:			"Възстановяване на потребител",
					modal_header_text:					"Настройки за локални потребител",
					modal_username_text:				"Локално име на потребител",
					modal_usertag_text:					"Cвободен край",
					modal_userurl_text:					"Икона",
					modal_removeicon_text:				"Премахване на иконата",
					modal_tabheader1_text:				"Потребител",
					modal_tabheader2_text:				"Цвят на име",
					modal_tabheader3_text:				"Цвят на свободен край",
					modal_colorpicker1_text:			"Цвят на име",
					modal_colorpicker2_text:			"Цвят на заден план",
					modal_colorpicker3_text:			"Цвят на свободен край",
					modal_colorpicker4_text:			"Цвят на шрифта",
					modal_ignoreurl_text:				"Игнориране на URL",
					modal_ignoretagcolor_text:			"Използвайте цвят на ролите",
					modal_validurl_text:				"Валиден URL",
					modal_invalidurl_text:				"Невалиден URL",
					btn_cancel_text:					"Зъбести",
					btn_save_text:						"Cпасяване"
				};
			case "ru":		//russian
				return {
					context_localusersettings_text:		"Настройки локального пользователь",
					submenu_usersettings_text:			"Изменить настройки",
					submenu_resetsettings_text:			"Сбросить пользователь",
					modal_header_text:					"Настройки локального пользователь",
					modal_username_text:				"Имя локального пользователь",
					modal_usertag_text:					"Tег",
					modal_userurl_text:					"Значок",
					modal_removeicon_text:				"Удалить значок",
					modal_tabheader1_text:				"Пользователь",
					modal_tabheader2_text:				"Цвет имя",
					modal_tabheader3_text:				"Цвет тег",
					modal_colorpicker1_text:			"Цвет имя",
					modal_colorpicker2_text:			"Цвет задний план",
					modal_colorpicker3_text:			"Цвет тег",
					modal_colorpicker4_text:			"Цвет шрифта",
					modal_ignoreurl_text:				"Игнорировать URL",
					modal_ignoretagcolor_text:			"Использовать цвет ролей",
					modal_validurl_text:				"Действительный URL",
					modal_invalidurl_text:				"Неверная URL",
					btn_cancel_text:					"Отмена",
					btn_save_text:						"Cпасти"
				};
			case "uk":		//ukrainian
				return {
					context_localusersettings_text:		"Налаштування локального користувач",
					submenu_usersettings_text:			"Змінити налаштування",
					submenu_resetsettings_text:			"Скидання користувач",
					modal_header_text:					"Налаштування локального користувач",
					modal_username_text:				"Локальне ім'я користувач",
					modal_usertag_text:					"Tег",
					modal_userurl_text:					"Іконка",
					modal_removeicon_text:				"Видалити піктограму",
					modal_tabheader1_text:				"Користувач",
					modal_tabheader2_text:				"Колір ім'я",
					modal_tabheader3_text:				"Колір тег",
					modal_colorpicker1_text:			"Колір ім'я",
					modal_colorpicker2_text:			"Колір фон",
					modal_colorpicker3_text:			"Колір тег",
					modal_colorpicker4_text:			"Колір шрифту",
					modal_ignoreurl_text:				"Ігнорувати URL",
					modal_ignoretagcolor_text:			"Використовуйте рольовий колір",
					modal_validurl_text:				"Дійсна URL",
					modal_invalidurl_text:				"Недійсна URL",
					btn_cancel_text:					"Скасувати",
					btn_save_text:						"Зберегти"
				};
			case "ja":		//japanese
				return {
					context_localusersettings_text:		"ローカルユーザーー設定",
					submenu_usersettings_text:			"設定を変更する",
					submenu_resetsettings_text:			"ユーザーーをリセットする",
					modal_header_text:					"ローカルユーザーー設定",
					modal_username_text:				"ローカルユーザーー名",
					modal_usertag_text:					"タグ",
					modal_userurl_text:					"アイコン",
					modal_removeicon_text:				"アイコンを削除",
					modal_tabheader1_text:				"ユーザー",
					modal_tabheader2_text:				"名の色",
					modal_tabheader3_text:				"タグの色",
					modal_colorpicker1_text:			"名の色",
					modal_colorpicker2_text:			"バックグラウンドの色",
					modal_colorpicker3_text:			"タグの色",
					modal_colorpicker4_text:			"フォントの色",
					modal_ignoreurl_text:				"URL を無視する",
					modal_ignoretagcolor_text:			"ロールカラーを使用する",
					modal_validurl_text:				"有効な URL",
					modal_invalidurl_text:				"無効な URL",
					btn_cancel_text:					"キャンセル",
					btn_save_text:						"セーブ"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_localusersettings_text:		"本地用戶設置",
					submenu_usersettings_text:			"更改設置",
					submenu_resetsettings_text:			"重置用戶",
					modal_header_text:					"本地用戶設置",
					modal_username_text:				"用戶名稱",
					modal_usertag_text:					"標籤",
					modal_userurl_text:					"圖標",
					modal_removeicon_text:				"刪除圖標",
					modal_tabheader1_text:				"用戶",
					modal_tabheader2_text:				"名稱顏色",
					modal_tabheader3_text:				"標籤顏色",
					modal_colorpicker1_text:			"名稱顏色",
					modal_colorpicker2_text:			"背景顏色",
					modal_colorpicker3_text:			"標籤顏色",
					modal_colorpicker4_text:			"字體顏色",
					modal_ignoreurl_text:				"忽略 URL",
					modal_ignoretagcolor_text:			"使用角色",
					modal_validurl_text:				"有效的 URL",
					modal_invalidurl_text:				"無效的 URL",
					btn_cancel_text:					"取消",
					btn_save_text:						"保存"
				};
			case "ko":		//korean
				return {
					context_localusersettings_text:		"로컬 사용자 설정",
					submenu_usersettings_text:			"설정 변경",
					submenu_resetsettings_text:			"사용자 재설정",
					modal_header_text:					"로컬 사용자 설정",
					modal_username_text:				"로컬 사용자 이름",
					modal_usertag_text:					"꼬리표",
					modal_userurl_text:					"상",
					modal_removeicon_text:				"상 삭제",
					modal_tabheader1_text:				"사용자",
					modal_tabheader2_text:				"이름 색깔",
					modal_tabheader3_text:				"꼬리표 색깔",
					modal_colorpicker1_text:			"이름 색깔",
					modal_colorpicker2_text:			"배경 색깔",
					modal_colorpicker3_text:			"꼬리표 색깔",
					modal_colorpicker4_text:			"글꼴 색깔",
					modal_ignoreurl_text:				"URL 무시",
					modal_ignoretagcolor_text:			"역할 색상 사용",
					modal_validurl_text:				"유효한 URL",
					modal_invalidurl_text:				"잘못된 URL",
					btn_cancel_text:					"취소",
					btn_save_text:						"저장"
				};
			default:	//default: english
				return {
					context_localusersettings_text:		"Local Usersettings",
					submenu_usersettings_text:			"Change Settings",
					submenu_resetsettings_text:			"Reset User",
					modal_header_text:					"Local Usersettings",
					modal_username_text:				"Local Username",
					modal_usertag_text:					"Tag",
					modal_userurl_text:					"Icon",
					modal_removeicon_text:				"Remove Icon",
					modal_tabheader1_text:				"User",
					modal_tabheader2_text:				"Namecolor",
					modal_tabheader3_text:				"Tagcolor",
					modal_colorpicker1_text:			"Namecolor",
					modal_colorpicker2_text:			"Backgroundcolor",
					modal_colorpicker3_text:			"Tagcolor",
					modal_colorpicker4_text:			"Fontcolor",
					modal_ignoreurl_text:				"Ignore URL",
					modal_ignoretagcolor_text:			"Use Rolecolor",
					modal_validurl_text:				"Valid URL",
					modal_invalidurl_text:				"Invalid URL",
					btn_cancel_text:					"Cancel",
					btn_save_text:						"Save"
				};
		}
	}
}
