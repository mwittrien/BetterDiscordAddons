module.exports = (Plugin, Api, Vendor) => {
	if (!global.BDFDB || typeof BDFDB != "object") global.BDFDB = {BDv2Api: Api};

	return class extends Plugin {
		initConstructor () {
			this.labels = {};

			this.updateUsers = false;

			this.css = `
				.user-tag {
					border-radius: 3px;
					box-sizing: border-box;
					display: inline-block;
					flex-shrink: 0;
					font-size: 10px;
					font-weight: 500;
					line-height: 13px;
					margin-left: 6px;
					padding: 1px 2px;
					text-transform: uppercase;
					text-indent: 0px !important;
					vertical-align: top;
				}
				${BDFDB.dotCN.messagecompact} .user-tag {
					margin-left: 2px;
					margin-right: 6px;
				}
				.user-tag.popout-tag,
				.user-tag.profil-tag {
					position: relative;
					top: 2px;
				}`;

			this.tagMarkup = `<span class="user-tag"></span>`;

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
				`<span class=""${this.name}-modal DevilBro-modal"">
					<div class="${BDFDB.disCN.backdrop}"></div>
					<div class="${BDFDB.disCN.modal}">
						<div class="${BDFDB.disCN.modalinner}">
							<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}">
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
									<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
										<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.headertitle + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.defaultcolor + BDFDB.disCNS.h4defaultmargin + BDFDB.disCN.marginreset}">REPLACE_modal_header_text</h4>
										<div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div>
									</div>
									<svg class="${BDFDB.disCNS.modalclose + BDFDB.disCN.flexchild}" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
										<g fill="none" fill-rule="evenodd">
											<path d="M0 0h12v12H0"></path>
											<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
										</g>
									</svg>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.marginbottom8 + BDFDB.disCN.modalsubinner}" style="flex: 0 0 auto;">
									<div tab="user" class="tab">REPLACE_modal_tabheader1_text</div>
									<div tab="name" class="tab">REPLACE_modal_tabheader2_text</div>
									<div tab="tag" class="tab">REPLACE_modal_tabheader3_text</div>
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
											<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
												<div class="swatches1"></div>
											</div>
											<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
												<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker2_text</h3>
											</div>
											<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
												<div class="swatches2"></div>
											</div>
										</div>
										<div tab="tag" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
												<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker3_text</h3>
											</div>
											<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
												<div class="swatches3"></div>
											</div>
											<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
												<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker4_text</h3>
											</div>
											<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
												<div class="swatches4"></div>
											</div>
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
					changeInChatWindow:		{value:true, 	description:"Chat"},
					changeInVoiceChat:		{value:true, 	description:"Voice Channels"},
					changeInMemberList:		{value:true, 	description:"Member List"},
					changeInRecentDms:		{value:true, 	description:"Direct Message Notifications"},
					changeInDmsList:		{value:true, 	description:"Direct Message List"},
					changeInDmHeader:		{value:true, 	description:"Direct Message Header"},
					changeInDmCalls:		{value:true, 	description:"Direct Message Calls"},
					changeInTyping:			{value:true, 	description:"Typing List"},
					changeInFriendList:		{value:true, 	description:"Friend List"},
					changeInUserPopout:		{value:true, 	description:"User Popouts"},
					changeInUserProfil:		{value:true, 	description:"User Profil Modal"},
					changeInUserAccount:	{value:true, 	description:"Your Account Information"}
				}
			};
		}

		onStart () {
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

				this.UserStore = BDFDB.WebModules.findByProperties("getUsers", "getUser");
				this.MemberPerms = BDFDB.WebModules.findByProperties("getNicknames", "getNick");
				this.TypingUtils = BDFDB.WebModules.findByProperties("getTypingUsers");
				this.LastGuildStore = BDFDB.WebModules.findByProperties("getLastSelectedGuildId");
				this.LastChannelStore = BDFDB.WebModules.findByProperties("getLastSelectedChannelId");

				var observer = null;

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node.nodeType == 1 && node.className.includes(BDFDB.disCN.contextmenu)) {
										this.onContextMenu(node);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.appmount, {name:"userContextObserver",instance:observer}, {childList: true});

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (BDFDB.getData("changeInRecentDms", this, "settings")) this.loadUser(node, "recentdms", false);
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.dms, {name:"dmObserver",instance:observer}, {childList: true});

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node.tagName && node.classList && node.classList.length > 0 && node.classList.contains(BDFDB.disCN.dmchannel) && node.classList.contains(BDFDB.disCN.dmchannelprivate) && BDFDB.getData("changeInDmsList", this, "settings")) {
										this.loadUser(node, "dms", false);
									}
									if (node.tagName && node.querySelector(BDFDB.dotCN.voiceuserdefault) && BDFDB.getData("changeInVoiceChat", this, "settings")) {
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
									if (node.tagName && node.querySelector(BDFDB.dotCN.friendscolumn) && BDFDB.getData("changeInFriendList", this, "settings")) {
										this.loadUser(node, "friends", false);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.idCN.friends, {name:"friendListObserver",instance:observer}, {childList:true, subtree:true});

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node.tagName && node.querySelector(BDFDB.dotCN.memberusername) && BDFDB.getData("changeInMemberList", this, "settings")) {
										this.loadUser(node, "list", false);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.memberswrap, {name:"userListObserver",instance:observer}, {childList:true, subtree:true});

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (BDFDB.getData("changeInChatWindow", this, "settings")) {
										var compact = document.querySelector(BDFDB.dotCN.messagegroup + BDFDB.dotCN.messagecompact);
										if (!compact) {
											if (node.tagName && node.querySelector(BDFDB.dotCN.messageusernamewrapper)) {
												this.loadUser(node, "chat", compact);
											}
											else if (node.classList && node.classList.contains(BDFDB.disCN.messagetext)) {
												this.loadUser($(BDFDB.dotCN.messagegroup).has(node)[0], "chat", compact);
											}
										}
										else {
											if (node.tagName && node.querySelector(BDFDB.dotCN.messageusernamewrapper)) {
												if (node.classList.contains(BDFDB.disCN.messagemarkup)) {
													this.loadUser(node, "chat", compact);
												}
												else {
													for (let markup of node.querySelectorAll(BDFDB.dotCN.messagemarkup)) this.loadUser(markup, "chat", compact);
												}
											}
										}
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"messagesObserver",instance:observer}, {childList:true, subtree:true});

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node.tagName && node.classList.contains(BDFDB.disCN.typing) && BDFDB.getData("changeInTyping", this, "settings")) {
										let innerobserver = new MutationObserver((changes2, _) => {
											changes2.forEach(
												(change2, i) => {
													if (change2.addedNodes) {
														change2.addedNodes.forEach((node2) => {
															if (node2.tagName && node2.tagName == "STRONG") this.changeTyping(node);
														});
													}
													if (change2.removedNodes) {
														change2.removedNodes.forEach((node2) => {
															if (node2.tagName && node2.tagName == "STRONG") this.changeTyping(node);
														});
													}
												}
											);
										});
										innerobserver.observe(node, {childList:true, subtree:true});
										this.changeTyping(node);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCNS.chat + "form", {name:"chatFormObserver",instance:observer}, {childList:true});

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node.tagName && node.classList.contains(BDFDB.disCN.callcurrentcontainer) && BDFDB.getData("changeInDmCalls", this, "settings")) {
										for (let user of node.querySelectorAll(BDFDB.dotCN.callavatarwrapper)) this.loadUser(user, "call", false);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.chat, {name:"chatObserver",instance:observer}, {childList:true});

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									let user;
									if (node.tagName && (user = node.querySelector(BDFDB.dotCN.callavatarwrapper)) != null && BDFDB.getData("changeInDmCalls", this, "settings")) {
										this.loadUser(user, "call", false);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.callcurrentcontainer, {name:"callObserver",instance:observer}, {childList:true, subtree:true});

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node.tagName && node.querySelector(BDFDB.dotCN.userpopout) && BDFDB.getData("changeInUserPopout", this, "settings")) {
										this.loadUser(node, "popout", false);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.popouts, {name:"userPopoutObserver",instance:observer}, {childList: true});

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node.tagName && node.querySelector(BDFDB.dotCN.userprofile) && BDFDB.getData("changeInUserProfil", this, "settings")) {
										this.loadUser(node.querySelector("[class*='topSection']"), "profil", false);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.app + " ~ [class^='theme-']:not([class*='popouts'])", {name:"userProfilModalObserver",instance:observer}, {childList: true});

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.removedNodes) {
								change.removedNodes.forEach((node) => {
									if (node.tagName && node.getAttribute("layer-id") == "user-settings") this.loadAllUsers();
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.layers, {name:"settingsWindowObserver",instance:observer}, {childList:true});

				this.loadAllUsers();

				return true;
			}
			else {
				console.error(`%c[${this.name}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
				return false;
			}
		}

		onStop () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.resetAllUsers();

				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}

		onSwitch () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				$(`${BDFDB.dotCN.channelheadertitletext}[custom-editusers]`).find(`${BDFDB.dotCN.channelheaderchannelname}:not(${BDFDB.dotCN.channelheaderprivate})`).css("color", "").css("background-color", "").parent().removeAttr("custom-editusers");
				BDFDB.addObserver(this, BDFDB.dotCN.memberswrap, {name:"userListObserver"}, {childList:true, subtree:true});
				BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"messagesObserver"}, {childList:true, subtree:true});
				BDFDB.addObserver(this, BDFDB.dotCNS.chat + "form", {name:"chatFormObserver"}, {childList:true});
				BDFDB.addObserver(this, BDFDB.dotCN.chat, {name:"chatObserver"}, {childList:true});
				BDFDB.addObserver(this, BDFDB.dotCN.callcurrentcontainer, {name:"callObserver"}, {childList:true, subtree:true});
				BDFDB.addObserver(this, BDFDB.idCN.friends, {name:"friendListObserver"}, {childList:true, subtree:true});
				this.loadAllUsers();
			}
		}


		// begin of own functions

		updateSettings (settingspanel) {
			var settings = {};
			for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
				settings[input.value] = input.checked;
			}
			BDFDB.saveAllData(settings, this, "settings");
		}

		resetAll () {
			if (confirm("Are you sure you want to reset all users?")) {
				BDFDB.removeAllData(this, "users");
				this.resetAllUsers();
			}
		}

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

		onContextMenu (context) {
			if (!context || !context.tagName || !context.parentElement || context.querySelector(".localusersettings-item")) return;
			var info = BDFDB.getKeyInformation({"node":context, "key":"user"});
			if (info && BDFDB.getKeyInformation({"node":context, "key":"displayName", "value":"UserNoteItem"})) {
				$(context).append(this.userContextEntryMarkup)
					.on("mouseenter", ".localusersettings-item", (e) => {
						this.createContextSubMenu(info, e, context);
					});

				BDFDB.updateContextPosition(context);
			}
		}

		createContextSubMenu (info, e, context) {
			var userContextSubMenu = $(this.userContextSubMenuMarkup);

			userContextSubMenu
				.on("click", ".usersettings-item", () => {
					$(context).hide();
					this.showUserSettings(info);
				});

			if (BDFDB.loadData(info.id, this, "users")) {
				userContextSubMenu
					.find(".resetsettings-item")
					.removeClass(BDFDB.disCN.contextmenuitemdisabled)
					.on("click", () => {
						$(context).hide();
						BDFDB.removeData(info.id, this, "users");
						this.loadAllUsers();
					});
			}

			BDFDB.appendSubMenu(e.currentTarget, userContextSubMenu);
		}

		showUserSettings (info, e) {
			var data = BDFDB.loadData(info.id, this, "users");

			var name =				data ? data.name : null;
			var tag =				data ? data.tag : null;
			var url =				data ? data.url : null;
			var removeIcon =		data ? data.removeIcon : false;
			var ignoreTagColor =	data && data.ignoreTagColor ? data.ignoreTagColor : false;
			var color1 =			data ? data.color1 : null;
			var color2 =			data ? data.color2 : null;
			var color3 =			data ? data.color3 : null;
			var color4 =			data ? data.color4 : null;

			var member = this.MemberPerms.getMember(this.LastGuildStore.getGuildId(), info.id) ;

			var userSettingsModal = $(this.userSettingsModalMarkup);
			userSettingsModal.find(BDFDB.dotCN.modalguildname).text(member && member.nick ? member.nick : info.username);
			userSettingsModal.find("#input-username").val(name);
			userSettingsModal.find("#input-username").attr("placeholder", member && member.nick ? member.nick : info.username);
			userSettingsModal.find("#input-usertag").val(tag);
			userSettingsModal.find("#input-userurl").val(url);
			userSettingsModal.find("#input-userurl").attr("placeholder", BDFDB.getUserAvatar(info.id));
			userSettingsModal.find("#input-userurl").addClass(url ? "valid" : "");
			userSettingsModal.find("#input-userurl").prop("disabled", removeIcon);
			userSettingsModal.find("#input-removeicon").prop("checked", removeIcon);
			userSettingsModal.find(".swatches3, .swatches4").toggleClass("disabled", ignoreTagColor);
			userSettingsModal.find("#input-ignoretagcolor").prop("checked", ignoreTagColor);
			BDFDB.setColorSwatches(color1, userSettingsModal.find(".swatches1"), "swatch1");
			BDFDB.setColorSwatches(color2, userSettingsModal.find(".swatches2"), "swatch2");
			BDFDB.setColorSwatches(color3, userSettingsModal.find(".swatches3"), "swatch3");
			BDFDB.setColorSwatches(color4, userSettingsModal.find(".swatches4"), "swatch4");
			BDFDB.appendModal(userSettingsModal);
			userSettingsModal
				.on("click", "#input-removeicon", (event) => {
					userSettingsModal.find("#input-userurl").prop("disabled", event.target.checked);
				})
				.on("click", "#input-ignoretagcolor", (event) => {
					userSettingsModal.find(".swatches3, .swatches4").toggleClass("disabled", event.target.checked);
				})
				.on("change keyup paste", "#input-userurl", (event) => {
					this.checkUrl(userSettingsModal, event);
				})
				.on("mouseenter", "#input-userurl", (event) => {
					$(event.target).addClass("hovering");
					this.createNoticeTooltip(event);
				})
				.on("mouseleave", "#input-userurl", (event) => {
					$(BDFDB.dotCN.tooltips).find(".notice-tooltip").remove();
					$(event.target).removeClass("hovering");
				})
				.on("click", ".btn-save", (event) => {
					event.preventDefault();

					removeIcon = userSettingsModal.find("#input-removeicon").prop("checked");
					ignoreTagColor = userSettingsModal.find("#input-ignoretagcolor").prop("checked");

					name = null;
					if (userSettingsModal.find("#input-username").val()) {
						if (userSettingsModal.find("#input-username").val().trim().length > 0) {
							name = userSettingsModal.find("#input-username").val().trim();
						}
					}

					tag = null;
					if (userSettingsModal.find("#input-usertag").val()) {
						if (userSettingsModal.find("#input-usertag").val().trim().length > 0) {
							tag = userSettingsModal.find("#input-usertag").val().trim();
						}
					}

					if (userSettingsModal.find("#input-userurl:not('.invalid')").length > 0) {
						url = null;
						if (!removeIcon && userSettingsModal.find("#input-userurl").val()) {
							if (userSettingsModal.find("#input-userurl").val().trim().length > 0) {
								url = userSettingsModal.find("#input-userurl").val().trim();
							}
						}
					}

					color1 = BDFDB.getSwatchColor("swatch1");
					color2 = BDFDB.getSwatchColor("swatch2");
					color3 = BDFDB.getSwatchColor("swatch3");
					color4 = BDFDB.getSwatchColor("swatch4");

					if (name == null && tag == null && url == null && !removeIcon && !ignoreTagColor && color1 == null && color2 == null && color3 == null && color4 == null) {
						BDFDB.removeData(info.id, this, "users")
					}
					else {
						BDFDB.saveData(info.id, {name,tag,url,removeIcon,ignoreTagColor,color1,color2,color3,color4}, this, "users");
					}
					this.loadAllUsers();
				});
			userSettingsModal.find("#input-username").focus();
		}

		checkUrl (modal, e) {
			if (!e.target.value) {
				$(e.target)
					.removeClass("valid")
					.removeClass("invalid");
				if ($(e.target).hasClass("hovering")) $(BDFDB.dotCNS.tooltips + ".notice-tooltip").remove();
			}
			else {
				let request = require("request");
				request(e.target.value, (error, response, result) => {
					if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") != -1) {
						$(e.target)
							.removeClass("invalid")
							.addClass("valid");
					}
					else {
						$(e.target)
							.removeClass("valid")
							.addClass("invalid");
					}
					if ($(e.target).hasClass("hovering")) this.createNoticeTooltip(e);
				});
			}
		}

		createNoticeTooltip (e) {
			$(BDFDB.dotCN.tooltips).find(".notice-tooltip").remove();

			var input = e.target;
			var disabled = $(input).prop("disabled");
			var valid = $(input).hasClass("valid");
			var invalid = $(input).hasClass("invalid");
			if (disabled || valid || invalid) {
				var text = disabled ? this.labels.modal_ignoreurl_text : valid ? this.labels.modal_validurl_text : this.labels.modal_invalidurl_text;
				var bgColor = disabled ? "#282524" : valid ? "#297828" : "#8C2528";
				var customTooltipCSS = `
					body .notice-tooltip {
						background-color: ${bgColor} !important;
					}
					body .notice-tooltip:after {
						border-right-color: ${bgColor} !important;
					}`;
				BDFDB.createTooltip(text, input, {type:"right",selector:"notice-tooltip",css:customTooltipCSS});
			}
		}

		loadAllUsers () {
			this.resetAllUsers();

			var settings = BDFDB.getAllData(this, "settings");

			if (settings.changeInMemberList) {
				for (let user of document.querySelectorAll(BDFDB.dotCN.member)) {
					this.loadUser(user, "list", false);
				} 
			}
			if (settings.changeInChatWindow) {
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
			}
			if (settings.changeInVoiceChat) {
				for (let user of document.querySelectorAll(BDFDB.dotCN.voiceuserdefault)) {
					this.loadUser(user.parentElement, "voice", false);
				}
			}
			if (settings.changeInRecentDms) {
				for (let user of document.querySelectorAll(BDFDB.dotCNS.dms + BDFDB.dotCN.guild)) {
					this.loadUser(user, "recentdms", false);
				}
			}
			if (settings.changeInDmsList) {
				for (let user of document.querySelectorAll(BDFDB.dotCN.dmchannel + BDFDB.dotCN.dmchannelprivate)) {
					this.loadUser(user, "dms", false);
				}
			}
			if (settings.changeInDmHeader && !this.LastGuildStore.getGuildId()) {
				for (let user of document.querySelectorAll(BDFDB.dotCN.channelheadertitletext)) {
					this.loadUser(user, "dmheader", false);
				}
			}
			if (settings.changeInDmCalls) {
				for (let user of document.querySelectorAll(BDFDB.dotCN.callavatarwrapper)) {
					this.loadUser(user, "call", false);
				}
			}
			if (settings.changeInFriendList) {
				for (let user of document.querySelectorAll(BDFDB.dotCN.friendscolumn)) {
					this.loadUser(user, "friends", false);
				}
			}
			if (settings.changeInUserAccount) {
				for (let user of document.querySelectorAll(BDFDB.dotCN.accountinfo)) {
					this.loadUser(user, "info", false);
				}
			}
			if (settings.changeInUserPopout) {
				for (let user of document.querySelectorAll(BDFDB.dotCN.userpopout)) {
					this.loadUser(user.parentElement, "popout", false);
				}
			}
			if (settings.changeInUserProfil) {
				for (let user of document.querySelectorAll(`${BDFDB.dotCN.userprofile} [class*='topSection']`)) {
					this.loadUser(user, "profil", false);
				}
			}
		}

		loadUser (div, type, compact) {
			if (!div || $(div).attr("custom-editusers") || !div.tagName || (!div.querySelector(BDFDB.dotCN.dmchannelactivitytext) && div.querySelector(BDFDB.dotCN.dmchannelactivity))) return;

			let {avatar, username, wrapper} = this.getAvatarNameWrapper(div);
			if (!avatar && !username && !wrapper) return;

			$(div).data("compact", compact);

			var info = this.getUserInfo(compact ? $(BDFDB.dotCN.messagegroup).has(div)[0] : div);
			if (!info) return;

			var data = BDFDB.loadData(info.id, this, "users");

			if (data) {
				var member = this.MemberPerms.getMember(this.LastGuildStore.getGuildId(), info.id);
				if (username) {
					var name = data.name ? data.name : (type == "info" || type == "profil" || !member || !member.nick ? info.username : member.nick);
					var color1 = data.color1 ? BDFDB.color2RGB(data.color1) : (member && member.colorString ? BDFDB.color2RGB(member.colorString) : "");
					var color2 = data.color2 ? BDFDB.color2RGB(data.color2) : "";
					BDFDB.setInnerText(username, name);
					username.style.color = color1;
					username.style.background = color2;
				}

				if (avatar && (data.removeIcon || data.url)) {
					avatar.style.background = data.removeIcon ? "" : "url(" + data.url + ")";
					avatar.style.backgroundSize = "cover";
					avatar.style.backgroundPosition = "center";
					if (type == "call") {
						$(avatar)
							.off("mouseenter." + this.name)
							.on("mouseenter." + this.name, () => {
								this.createCallToolTip({"div":div,"nick":data.name,"name":info.username});
							});
					}
				}

				var tag = data.tag ? data.tag : null;
				if (tag && wrapper && !wrapper.querySelector(".user-tag") && (type == "list" || type == "chat" || type == "popout" || type == "profil" || type == "dmheader")) {
					var color3 = data.ignoreTagColor ? 
									(member && member.colorString ? BDFDB.color2RGB(member.colorString) : "") :
									(data.color3 ? BDFDB.color2RGB(data.color3) : "");
					var color3COMP = color3 ? BDFDB.color2COMP(color3) : [0,0,0];
					var color4 = !data.ignoreTagColor && data.color4 ? 
									BDFDB.color2RGB(data.color4) : 
									(color3COMP[0] > 180 && color3COMP[1] > 180 && color3COMP[2] > 180 ? "black" : "white");
					var thisTag = $(this.tagMarkup)[0];
					thisTag.classList.add(type + "-tag");
					thisTag.innerText = tag;
					thisTag.style.background = color3;
					thisTag.style.color = color4;
					wrapper.appendChild(thisTag);
				}

				if (type == "recentdms") {
					$(div).find(BDFDB.dotCN.guildinner)
						.off("mouseenter." + this.name)
						.on("mouseenter." + this.name, () => {
							this.createDmToolTip({"div":div,"nick":data.name,"name":info.username});
						});
				}

				$(div).attr("custom-editusers", true);
			}
		}

		resetAllUsers () {
			document.querySelectorAll(".user-tag").forEach(node=>{node.remove();});
			document.querySelectorAll("[custom-editusers]").forEach((div) => {
				var {avatar, username, wrapper} = this.getAvatarNameWrapper(div);
				if (!avatar && !username && !wrapper) return;

				var info = this.getUserInfo($(div).data(BDFDB.disCN.messagecompact) ? $(BDFDB.dotCN.messagegroup).has(div)[0] : div);
				if (!info) return;

				if (username) {
					var serverObj = BDFDB.getSelectedServer();
					var member = serverObj ? this.MemberPerms.getMember(serverObj.id, info.id) : null;
					var name = div.classList.contains(BDFDB.disCN.accountinfo) || !member || !member.nick ? info.username : member.nick;
					var color1 = member && member.colorString ? BDFDB.color2RGB(member.colorString) : "";
					var color2 = "";

					BDFDB.setInnerText(username, name);
					username.style.color = color1;
					username.style.background = color2;
				}

				if (avatar) {
					avatar.style.background = "url(" + BDFDB.getUserAvatar(info.id) + ")";
					avatar.style.backgroundSize = "cover";
					$(avatar).off("mouseenter." + this.name);
				}

				$(div).removeAttr("custom-editusers")
					.find(BDFDB.dotCN.guildinner).off("mouseenter." + this.name);
			});
		}

		createDmToolTip (userObj) {
			var text = userObj.nick ? userObj.nick : userObj.name;
			var customTooltipCSS = `
				${BDFDB.dotCN.tooltip}:not(.dm-custom-tooltip) {
					display: none !important;
				}`;
			BDFDB.createTooltip(text, userObj.div, {type:"right",selector:"dm-custom-tooltip",css:customTooltipCSS});
		}

		createCallToolTip (userObj) {
			var text = userObj.nick ? userObj.nick : userObj.name;
			var customTooltipCSS = `
				${BDFDB.dotCN.tooltip}:not(.call-custom-tooltip) {
					display: none !important;
				}`;
			BDFDB.createTooltip(text, userObj.div, {type:"left",selector:"call-custom-tooltip",css:customTooltipCSS});
		}

		getAvatarNameWrapper (div) {
			var avatar = div.querySelector(BDFDB.dotCNC.avatarsmallold + BDFDB.dotCN.avatarlargeold + ":not(" + BDFDB.dotCN.avatarwrapper + "), " + BDFDB.dotCNC.avatarprofileold + BDFDB.dotCNC.voiceavatardefault + BDFDB.dotCNC.avatarimage + BDFDB.dotCN.callavatar);

			var username = div.querySelector(BDFDB.dotCNC.userpopoutheadernickname + BDFDB.dotCNC.userpopoutheadernonickname + BDFDB.dotCNC.userprofileusername + BDFDB.dotCNC.memberusername + BDFDB.dotCNC.voicenamedefault + BDFDB.dotCNC.messageusername + BDFDB.dotCNC.dmchannelname + BDFDB.dotCN.channelheaderchannelname + BDFDB.dotCNC.channelheaderprivate + BDFDB.dotCNS.friendscolumnnamewrap + BDFDB.dotCNC.friendscolumnusername + BDFDB.dotCNS.accountinfodetails + BDFDB.dotCN.accountinfousername);

			var wrapper = div.querySelector(BDFDB.dotCNC.userpopoutheadernickname + BDFDB.dotCNC.userpopoutheadernonickname + BDFDB.dotCNC.userprofileusername + BDFDB.dotCNC.memberusername + BDFDB.dotCNC.voicenamedefault + BDFDB.dotCNC.messageusernamewrapper + BDFDB.dotCNC.dmchannelname + BDFDB.dotCN.channelheaderchannelname + BDFDB.dotCNC.channelheaderprivate + BDFDB.dotCNS.friendscolumnnamewrap + BDFDB.dotCNC.nametag + BDFDB.dotCNS.accountinfodetails + BDFDB.dotCN.accountinfousername);

			return {avatar, username, wrapper};
		}

		getUserInfo (div) {
			let info, avatar = div.querySelector("[style*='/avatars/']");
			if (avatar) info = this.UserStore.getUser(avatar.style.backgroundImage.split("/avatars/")[1].split("/")[0]);
			else {
				info = BDFDB.getKeyInformation({"node":div,"key":"user"});
				if (!info) {
					info = this.UserStore.getUser(BDFDB.getKeyInformation({"node":div,"key":"id","up":true}));  
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
				}
			}
			return info && info.id ? this.UserStore.getUser(info.id) : null;
		}

		changeTyping (div) {
			let i = 0, ids = Object.assign({},this.TypingUtils.getTypingUsers(this.LastChannelStore.getChannelId())), sortedids = [], alldata = BDFDB.loadAllData(this, "users");
			delete ids[BDFDB.myData.id];
			for (let id in ids) sortedids.push({id:id,time:ids[id]});
			BDFDB.sortArrayByKey(sortedids, "time");
			for (let strong of div.querySelectorAll("strong")) {
				let data = alldata[sortedids[i].id];
				let user = this.UserStore.getUser(sortedids[i].id);
				let member = this.MemberPerms.getMember(this.LastGuildStore.getGuildId(), sortedids[i].id);
				if (user) {
					var name = data && data.name ? data.name : (member && member.nick ? member.nick : user.username);
					var color1 = data && data.color1 ? BDFDB.color2RGB(data.color1) : (member && member.colorString ? BDFDB.color2RGB(member.colorString) : "");
					var color2 = data && data.color2 ? BDFDB.color2RGB(data.color2) : "";
					strong.innerHTML = `<label style="color:${color1};background-color:${color2};">${name}</label>`;
				}
				i++;
			}
		}

		getSettingsPanel () {
			var settings = BDFDB.getAllData(this, "settings"); 
			var settingshtml = `<div class="DevilBro-settings ${this.name}-settings">`;
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Change User in:</h3></div><div class="DevilBro-settings-inner-list">`;
			for (let key in settings) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
			}
			settingshtml += `</div>`;
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Reset all Users.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
			settingshtml += `</div>`;

			var settingspanel = $(settingshtml)[0];

			$(settingspanel)
				.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);})
				.on("click", ".reset-button", () => {this.resetAll();});
			return settingspanel;
		}

		onSettingsClosed () {
			if (this.updateUsers) {
				this.loadAllUsers();
				this.updateUsers = false;
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
};
