//META{"name":"EditUsers"}*//

class EditUsers {
	constructor () {
		this.labels = {};

		this.css = `
			.user-tag {
				position: relative;
				border-radius: 3px;
				flex-shrink: 0;
				font-size: 10px;
				font-weight: 500;
				line-height: 16px;
				margin-left: 6px;
				padding: 1px 2px;
				text-transform: uppercase;
				vertical-align: bottom;
				white-space: nowrap;
			}
			
			.user-tag.profil-tag {
				bottom: 1px;
			}
			.user-tag.popout-tag {
				bottom: 2px;
			}`;
			
		this.tagMarkup = `<span class="user-tag"></span>`;

		this.userContextEntryMarkup =
			`<div class="itemGroup-oViAgA">
				<div class="item-1XYaYf localusersettings-item itemSubMenu-3ZgIw-">
					<span>REPLACE_context_localusersettings_text</span>
					<div class="hint-3TJykr"></div>
				</div>
			</div>`;
			
		this.userContextSubMenuMarkup = 
			`<div class="contextMenu-uoJTbz editusers-submenu">
				<div class="itemGroup-oViAgA">
					<div class="item-1XYaYf usersettings-item">
						<span>REPLACE_submenu_usersettings_text</span>
						<div class="hint-3TJykr"></div>
					</div>
					<div class="item-1XYaYf resetsettings-item disabled-dlOjhg">
						<span>REPLACE_submenu_resetsettings_text</span>
						<div class="hint-3TJykr"></div>
					</div>
				</div>
			</div>`;
			
		this.userSettingsModalMarkup =
			`<span class="editusers-modal DevilBro-modal">
				<div class="backdrop-2ohBEd"></div>
				<div class="modal-2LIEKY">
					<div class="inner-1_1f7b">
						<div class="modal-3HOjGZ sizeMedium-1-2BNS">
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
								<div class="flexChild-1KGW5q" style="flex: 1 1 auto;">
									<h4 class="h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl">REPLACE_modal_header_text</h4>
									<div class="guildName-1u0hy7 small-3-03j1 size12-1IGJl9 height16-1qXrGy primary-2giqSn"></div>
								</div>
								<svg class="btn-cancel close-3ejNTg flexChild-1KGW5q" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
									<g fill="none" fill-rule="evenodd">
										<path d="M0 0h12v12H0"></path>
										<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
									</g>
								</svg>
							</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4 inner-tqJwAU" style="flex: 0 0 auto;">
								<div tab="user" class="tab">REPLACE_modal_tabheader1_text</div>
								<div tab="name" class="tab">REPLACE_modal_tabheader2_text</div>
								<div tab="tag" class="tab">REPLACE_modal_tabheader3_text</div>
							</div>
							<div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW">
								<div class="scroller-fzNley inner-tqJwAU">
									<div tab="user" class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom20-2Ifj-2 tab-content" style="flex: 1 1 auto;">
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_username_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_" id="input-username"></div>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_usertag_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_" id="input-usertag"></div>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_userurl_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_" id="input-userurl"></div>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">REPLACE_modal_removeicon_text</h3>
											<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
												<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" id="input-removeicon">
											</div>
										</div>
									</div>
									<div tab="name" class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom20-2Ifj-2 tab-content" style="flex: 1 1 auto;">
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_colorpicker1_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="swatches1"></div>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_colorpicker2_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="swatches2"></div>
										</div>
									</div>
									<div tab="tag" class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom20-2Ifj-2 tab-content" style="flex: 1 1 auto;">
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_colorpicker3_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="swatches3"></div>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_colorpicker4_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="swatches4"></div>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">REPLACE_modal_ignoretagcolor_text</h3>
											<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
												<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" id="input-ignoretagcolor">
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw">
								<button type="button" class="btn-save button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u">
									<div class="contents-4L4hQM">REPLACE_btn_save_text</div>
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
				changeInDmHeader:		{value:true, 	description:"Direct Message Header"},
				changeInRecentDms:		{value:true, 	description:"Direct Message Notifications"},
				changeInDmsList:		{value:true, 	description:"Direct Message List"},
				changeInFriendList:		{value:true, 	description:"Friend List"},
				changeInUserPopout:		{value:true, 	description:"User Popouts"},
				changeInUserProfil:		{value:true, 	description:"User Profil Modal"},
				changeInUserAccount:	{value:true, 	description:"Your Account Information"}
			}
		};
	}

	getName () {return "EditUsers";}

	getDescription () {return "Allows you to change the icon, name, tag and color of users. Does not work in compact mode.";}

	getVersion () {return "2.2.1";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settings = BDfunctionsDevilBro.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">Change User in:</h3></div><div class="DevilBro-settings-inner-list">`;
		for (let key in settings) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Reset all Users.</h3><button type="button" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorRed-3HTNPV sizeMedium-2VGNaF grow-25YQ8u reset-button" style="flex: 0 0 auto;"><div class="contents-4L4hQM">Reset</div></button></div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);})
			.on("click", ".reset-button", () => {this.resetAll();});
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
			
			this.UserStore = BDfunctionsDevilBro.WebModules.findByProperties(["getUsers", "getUser"]);
			this.MemberPerms = BDfunctionsDevilBro.WebModules.findByProperties(["getNicknames", "getNick"]);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.nodeType == 1 && node.className.includes("contextMenu-uoJTbz")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".appMount-14L89u", {name:"userContextObserver",instance:observer}, {childList: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (BDfunctionsDevilBro.getData("changeInRecentDms", this, "settings")) this.loadUser(node, "recentdms", false);
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".dms", {name:"dmObserver",instance:observer}, {childList: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.classList && node.classList.length > 0 && node.classList.contains("channel") && node.classList.contains("private") && BDfunctionsDevilBro.getData("changeInDmsList", this, "settings")) {
									this.loadUser(node, "dms", false);
								}
								if (node && node.tagName && node.querySelector(".userDefault-2_cnT0") && BDfunctionsDevilBro.getData("changeInVoiceChat", this, "settings")) {
									this.loadUser(node.querySelector(".userDefault-2_cnT0").parentElement, "voice", false);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".channels-3g2vYe", {name:"channelListObserver",instance:observer}, {childList: true, subtree: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".friends-column") && BDfunctionsDevilBro.getData("changeInFriendList", this, "settings")) {
									this.loadUser(node, "friends", false);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, "#friends", {name:"friendListObserver",instance:observer}, {childList:true, subtree:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".username-MwOsla, .member-username") && BDfunctionsDevilBro.getData("changeInMemberList", this, "settings")) {
									this.loadUser(node, "list", false);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".channel-members, .members-1bid1J", {name:"userListObserver",instance:observer}, {childList:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (BDfunctionsDevilBro.getData("changeInChatWindow", this, "settings")) {
									var compact = document.querySelector(".message-group.compact");
									if (!compact) {
										if (node && node.tagName && node.querySelector(".username-wrapper")) {
											this.loadUser(node, "chat", compact);
										}
										else if (node && node.classList && node.classList.contains("message-text")) {
											this.loadUser($(".message-group").has(node)[0], "chat", compact);
										}
									}
									else {
										if (node && node.tagName && node.querySelector(".username-wrapper")) {
											if (node.classList.contains("markup")) {
												this.loadUser(node, "chat", compact);
											}
											else {
												for (let markup of node.querySelectorAll(".markup")) this.loadUser(markup, "chat", compact);
											}
										}
									}
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".messages.scroller", {name:"chatWindowObserver",instance:observer}, {childList:true, subtree:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".userPopout-11hFKo") && BDfunctionsDevilBro.getData("changeInUserPopout", this, "settings")) {
									this.loadUser(node, "popout", false);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".popouts", {name:"userPopoutObserver",instance:observer}, {childList: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector("[class*='topSection']") && BDfunctionsDevilBro.getData("changeInUserProfil", this, "settings")) {
									this.loadUser(node.querySelector("[class*='topSection']"), "profil", false);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".app-XZYfmp ~ [class^='theme-']:not([class*='popouts'])", {name:"userProfilModalObserver",instance:observer}, {childList: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && node.tagName && node.getAttribute("layer-id") == "user-settings") this.loadAllUsers();
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".layers, .layers-20RVFW", {name:"settingsWindowObserver",instance:observer}, {childList:true});
						
			this.loadAllUsers();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.resetAllUsers();
						
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			$(".titleText-2IfpkV[custom-editusers]").find(".channelName-1G03vu:not(.private-38vo6h)").css("color", "").css("background-color", "").parent().removeAttr("custom-editusers");
			this.loadAllUsers();
			BDfunctionsDevilBro.addObserver(this, ".channel-members, .members-1bid1J", {name:"userListObserver"}, {childList:true});
			BDfunctionsDevilBro.addObserver(this, ".messages.scroller", {name:"chatWindowObserver"}, {childList:true, subtree:true});
			BDfunctionsDevilBro.addObserver(this, "#friends", {name:"friendListObserver"}, {childList:true, subtree:true});
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

	resetAll () {
		if (confirm("Are you sure you want to reset all users?")) {
			BDfunctionsDevilBro.removeAllData(this, "users");
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
		var info = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"user"});
		if (info && BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"displayName", "value":"UserNoteItem"})) {
			$(context).append(this.userContextEntryMarkup)
				.on("mouseenter", ".localusersettings-item", (e) => {
					this.createContextSubMenu(info, e, context);
				});
				
			BDfunctionsDevilBro.updateContextPosition(context);
		}
	}
	
	createContextSubMenu (info, e, context) {
		var userContextSubMenu = $(this.userContextSubMenuMarkup);
		
		userContextSubMenu
			.on("click", ".usersettings-item", () => {
				$(context).hide();
				this.showUserSettings(info);
			});
			
		if (BDfunctionsDevilBro.loadData(info.id, this, "users")) {
			userContextSubMenu
				.find(".resetsettings-item")
				.removeClass("disabled").removeClass("disabled-dlOjhg")
				.on("click", () => {
					$(context).hide();
					BDfunctionsDevilBro.removeData(info.id, this, "users");
					this.loadAllUsers();
				});
		}
		
		BDfunctionsDevilBro.appendSubMenu(e.currentTarget, userContextSubMenu);
	}
	
	showUserSettings (info, e) {
		var data = BDfunctionsDevilBro.loadData(info.id, this, "users");
		
		var name =				data ? data.name : null;
		var tag =				data ? data.tag : null;
		var url =				data ? data.url : null;
		var removeIcon =		data ? data.removeIcon : false;
		var ignoreTagColor =	data && data.ignoreTagColor ? data.ignoreTagColor : false;
		var color1 =			data ? data.color1 : null;
		var color2 =			data ? data.color2 : null;
		var color3 =			data ? data.color3 : null;
		var color4 =			data ? data.color4 : null;
		
		var serverObj = BDfunctionsDevilBro.getSelectedServer();
		var member = serverObj ? this.MemberPerms.getMember(serverObj.id, info.id) : null;
		
		var userSettingsModal = $(this.userSettingsModalMarkup);
		userSettingsModal.find(".guildName-1u0hy7").text(member && member.nick ? member.nick : info.username);
		userSettingsModal.find("#input-username").val(name);
		userSettingsModal.find("#input-username").attr("placeholder", member && member.nick ? member.nick : info.username);
		userSettingsModal.find("#input-usertag").val(tag);
		userSettingsModal.find("#input-userurl").val(url);
		userSettingsModal.find("#input-userurl").attr("placeholder", BDfunctionsDevilBro.getUserAvatar(info.id));
		userSettingsModal.find("#input-userurl").addClass(url ? "valid" : "");
		userSettingsModal.find("#input-userurl").prop("disabled", removeIcon);
		userSettingsModal.find("#input-removeicon").prop("checked", removeIcon);
		userSettingsModal.find(".swatches3, .swatches4").toggleClass("disabled", ignoreTagColor);
		userSettingsModal.find("#input-ignoretagcolor").prop("checked", ignoreTagColor);
		BDfunctionsDevilBro.setColorSwatches(color1, userSettingsModal.find(".swatches1"), "swatch1");
		BDfunctionsDevilBro.setColorSwatches(color2, userSettingsModal.find(".swatches2"), "swatch2");
		BDfunctionsDevilBro.setColorSwatches(color3, userSettingsModal.find(".swatches3"), "swatch3");
		BDfunctionsDevilBro.setColorSwatches(color4, userSettingsModal.find(".swatches4"), "swatch4");
		BDfunctionsDevilBro.appendModal(userSettingsModal);
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
				$(".tooltips").find(".notice-tooltip").remove();
				$(event.target).removeClass("hovering");
			})
			.on("click", "button.btn-save", (event) => {
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
				
				color1 = BDfunctionsDevilBro.getSwatchColor("swatch1");
				color2 = BDfunctionsDevilBro.getSwatchColor("swatch2");
				color3 = BDfunctionsDevilBro.getSwatchColor("swatch3");
				color4 = BDfunctionsDevilBro.getSwatchColor("swatch4");
				
				if (name == null && tag == null && url == null && !removeIcon && !ignoreTagColor && color1 == null && color2 == null && color3 == null && color4 == null) {
					BDfunctionsDevilBro.removeData(info.id, this, "users")
				}
				else {
					BDfunctionsDevilBro.saveData(info.id, {name,tag,url,removeIcon,ignoreTagColor,color1,color2,color3,color4}, this, "users");
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
			if ($(e.target).hasClass("hovering")) $(".tooltips .notice-tooltip").remove();
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
		$(".tooltips").find(".notice-tooltip").remove();
		
		var input = e.target;
		var disabled = $(input).prop("disabled");
		var valid = $(input).hasClass("valid");
		var invalid = $(input).hasClass("invalid");
		if (disabled || valid || invalid) {
			var text = disabled ? this.labels.modal_ignoreurl_text : valid ? this.labels.modal_validurl_text : this.labels.modal_invalidurl_text;
			var bgColor = disabled ? "#282524" : valid ? "#297828" : "#8C2528";
			var customTooltipCSS = `
				.notice-tooltip {
					background-color: ${bgColor} !important;
				}
				.notice-tooltip:after {
					border-right-color: ${bgColor} !important;
				}`;
			BDfunctionsDevilBro.createTooltip(text, input, {type:"right",selector:"notice-tooltip",css:customTooltipCSS});
		}
	}

	loadAllUsers () {
		this.resetAllUsers();
		
		var settings = BDfunctionsDevilBro.getAllData(this, "settings");
		
		if (settings.changeInMemberList) {
			for (let user of document.querySelectorAll(".member-2FrNV0, .member")) {
				this.loadUser(user, "list", false);
			} 
		}
		if (settings.changeInChatWindow) {
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
		}
		if (settings.changeInVoiceChat) {
			for (let user of document.querySelectorAll(".userDefault-2_cnT0")) {
				this.loadUser(user.parentElement, "voice", false);
			}
		}
		if (settings.changeInRecentDms) {
			for (let user of document.querySelectorAll(".dms .guild")) {
				this.loadUser(user, "recentdms", false);
			}
		}
		if (settings.changeInDmsList) {
			for (let user of document.querySelectorAll(".channel.private")) {
				this.loadUser(user, "dms", false);
			}
		}
		if (settings.changeInDmHeader && !BDfunctionsDevilBro.getSelectedServer()) {
			for (let user of document.querySelectorAll(".titleText-2IfpkV")) {
				this.loadUser(user, "dmheader", false);
			}
		}
		if (settings.changeInFriendList) {
			for (let user of document.querySelectorAll(".friends-column")) {
				this.loadUser(user, "friends", false);
			}
		}
		if (settings.changeInUserAccount) {
			for (let user of document.querySelectorAll(".container-iksrDt")) {
				this.loadUser(user, "info", false);
			}
		}
		if (settings.changeInUserPopout) {
			for (let user of document.querySelectorAll(".userPopout-11hFKo")) {
				this.loadUser(user.parentElement, "popout", false);
			}
		}
		if (settings.changeInUserProfil) {
			for (let user of document.querySelectorAll(".topSectionPlaying-3jAH9b, .topSectionNormal-2LlRG1")) {
				this.loadUser(user, "profil", false);
			}
		}
	}
	
	loadUser (div, type, compact) {
		if (!div || $(div).attr("custom-editusers") || !div.tagName || (!div.querySelector(".channel-activity-text") && div.querySelector(".channel-activity"))) return;
		
		let {avatar, username, wrapper} = this.getAvatarNameWrapper(div);
		if (!avatar && !username && !wrapper) return;
		
		$(div).data("compact", compact);
		
		var info = this.getUserInfo(compact ? $(".message-group").has(div)[0] : div);
		if (!info) return;
		
		var data = BDfunctionsDevilBro.loadData(info.id, this, "users");
		
		if (data) {
			var serverObj = BDfunctionsDevilBro.getSelectedServer();
			var member = serverObj ? this.MemberPerms.getMember(serverObj.id, info.id) : null;
			if (username) {
				var name = data.name ? data.name : (type == "info" || type == "profil" || !member || !member.nick ? info.username : member.nick);
				var color1 = data.color1 ? BDfunctionsDevilBro.color2RGB(data.color1) : (member && member.colorString ? BDfunctionsDevilBro.color2RGB(member.colorString) : "");
				var color2 = data.color2 ? BDfunctionsDevilBro.color2RGB(data.color2) : "";
				BDfunctionsDevilBro.setInnerText(username, name);
				username.style.color = color1;
				username.style.background = color2;
				
				for (let markup of div.querySelectorAll(".markup")) {
					markup.style.color = settingsCookie["bda-gs-7"] && settingsCookie["bda-gs-7"] == true ? color1 : "";
				}
			}
			
			if (avatar) {
				avatar.style.background = data.removeIcon ? "" : (data.url ? "url(" + data.url + ")" : "url(" + BDfunctionsDevilBro.getUserAvatar(info.id) + ")");
				avatar.style.backgroundSize = "cover";
				avatar.style.backgroundPosition = "center";
			}
				
			var tag = data.tag ? data.tag : null;
			if (tag && wrapper && !wrapper.querySelector(".user-tag") && (type == "list" || type == "chat" || type == "popout" || type == "profil" || type == "dmheader")) {
				var color3 = data.ignoreTagColor ? 
								(member && member.colorString ? BDfunctionsDevilBro.color2RGB(member.colorString) : "") :
								(data.color3 ? BDfunctionsDevilBro.color2RGB(data.color3) : "");
				var color3COMP = color3 ? BDfunctionsDevilBro.color2COMP(color3) : [0,0,0];
				var color4 = !data.ignoreTagColor && data.color4 ? 
								BDfunctionsDevilBro.color2RGB(data.color4) : 
								(color3COMP[0] > 180 && color3COMP[1] > 180 && color3COMP[2] > 180 ? "black" : "white");
				var thisTag = $(this.tagMarkup)[0];
				thisTag.classList.add(type + "-tag");
				thisTag.innerText = tag;
				thisTag.style.background = color3;
				thisTag.style.color = color4;
				wrapper.appendChild(thisTag);
			}
			
			if (type == "recentdms") {
				$(div).find(".guild-inner")
					.off("mouseenter." + this.getName())
					.on("mouseenter." + this.getName(), () => {
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
			
			var info = this.getUserInfo($(div).data("compact") ? $(".message-group").has(div)[0] : div);
			if (!info) return;
			
			if (username) {
				var serverObj = BDfunctionsDevilBro.getSelectedServer();
				var member = serverObj ? this.MemberPerms.getMember(serverObj.id, info.id) : null;
				var name = div.classList.contains("container-iksrDt") || !member || !member.nick ? info.username : member.nick;
				var color1 = member && member.colorString ? BDfunctionsDevilBro.color2RGB(member.colorString) : "";
				var color2 = "";
				
				BDfunctionsDevilBro.setInnerText(username, name);
				username.style.color = color1;
				username.style.background = color2;
				
				for (let markup of div.querySelectorAll(".markup")) {
					markup.style.color = settingsCookie["bda-gs-7"] && settingsCookie["bda-gs-7"] == true ? color1 : "";
				}
			}
			
			if (avatar) {
				avatar.style.background = "url(" + BDfunctionsDevilBro.getUserAvatar(info.id) + ")";
				avatar.style.backgroundSize = "cover";
			}
			
			$(div).removeAttr("custom-editusers")
				.find(".guild-inner").off("mouseenter." + this.getName());
		});
	}
	
	createDmToolTip (userObj) {
		var text = userObj.nick ? userObj.nick : userObj.name;
		var customTooltipCSS = `
			.tooltip:not(.dm-custom-tooltip) {
				display: none !important;
			}`;
		BDfunctionsDevilBro.createTooltip(text, userObj.div, {type:"right",selector:"dm-custom-tooltip",css:customTooltipCSS});
	}
	
	getAvatarNameWrapper (div) {
		var avatar = div.querySelector(".avatar-small, .avatar-large, .avatarDefault-3jtQoc, .avatar-profile, .image-EVRGPw");
						
		var username = div.querySelector(".headerName-3U6eDn, .headerTagUsernameNoNickname-22Y2PV, .username-24t9uh, .username-MwOsla, .member-username-inner, .nameDefault-1I0lx8, .user-name, .channel-name, .channelName-1G03vu.private-38vo6h, .friends-column-name .username, .accountDetails-15i-_e .username");
						
		var wrapper = div.querySelector(".headerName-3U6eDn, .headerTagNoNickname-36rgb9, .nameTag-2n-N0D, .nameTag-3F0z_i, .member-username-inner, .nameDefault-1I0lx8, .username-wrapper, .channel-name, .channelName-1G03vu.private-38vo6h .friends-column-name .nameTag-26T3kW, .accountDetails-15i-_e .username");
						
		return {avatar, username, wrapper};
	}
	
	getUserInfo (div) {
		var info = null, comparator = div.getAttribute("comparator");
		if (comparator) {
			comparator = comparator.split("\0");
			comparator = comparator[comparator.length-1];
			comparator = !isNaN(parseInt(comparator)) ? comparator : null;
		}
		if (comparator) info = {"id":comparator};
		else {
			info = BDfunctionsDevilBro.getKeyInformation({"node":div,"key":"user"});
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
		}
		return info && info.id ? this.UserStore.getUser(info.id) : null;
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
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
