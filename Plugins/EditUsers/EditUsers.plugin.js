//META{"name":"EditUsers"}*//

class EditUsers {
	constructor () {
		
		this.labels = {};
		
		this.nickNames = {};
    
		this.switchFixObserver = new MutationObserver(() => {});
		this.userContextObserver = new MutationObserver(() => {});
		this.dmObserver = new MutationObserver(() => {});
		this.friendListObserver = new MutationObserver(() => {});
		this.userListObserver = new MutationObserver(() => {});
		this.chatWindowObserver = new MutationObserver(() => {});
		this.channelListObserver = new MutationObserver(() => {});
		this.userPopoutObserver = new MutationObserver(() => {});
		this.userProfilModalObserver = new MutationObserver(() => {});
		this.settingsWindowObserver = new MutationObserver(() => {});
		
		this.css = `
			.user-tag {
				position: relative;
				overflow: hidden; 
				padding: 2px 3px 1px 3px; 
				margin-left: 5px; 
				border-radius: 3px;
				text-transform: uppercase;
				font-size: 10px;
				font-weight: 600;
				height: 13px;
				line-height: 13px;
				white-space: nowrap;
			}
			
			.user-tag.dmheader-tag,
			.user-tag.popout-tag,
			.user-tag.profil-tag {
				bottom: 2px;
			}
			
			.user-tag.chat-tag {
				bottom: 1px;
			}`
			
		this.tagMarkup = `<span class="user-tag"></span>`;

		this.userContextEntryMarkup =
			`<div class="item-group">
				<div class="item localusersettings-item item-subMenu">
					<span>REPLACE_context_localusersettings_text</span>
					<div class="hint"></div>
				</div>
			</div>`;
			
		this.userContextSubMenuMarkup = 
			`<div class="context-menu editusers-submenu">
				<div class="item-group">
					<div class="item usersettings-item">
						<span>REPLACE_submenu_usersettings_text</span>
						<div class="hint"></div>
					</div>
					<div class="item resetsettings-item">
						<span>REPLACE_submenu_resetsettings_text</span>
						<div class="hint"></div>
					</div>
				</div>
			</div>`;
			
		this.userSettingsModalMarkup =
			`<span class="editusers-modal DevilBro-modal">
				<div class="backdrop-2ohBEd"></div>
				<div class="modal-2LIEKY">
					<div class="inner-1_1f7b">
						<div class="modal-3HOjGZ sizeMedium-1-2BNS">
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
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
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 0 0 auto;">
								<button type="button" value="modalTab-user" class="modalTabButton buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 mediumGrow-uovsMu">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_tabheader1_text</h3>
								</button>
								<button type="button" value="modalTab-name" class="modalTabButton buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 mediumGrow-uovsMu">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_tabheader2_text</h3>
								</button>
								<button type="button" value="modalTab-tag" class="modalTabButton buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 mediumGrow-uovsMu">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_tabheader3_text</h3>
								</button>
							</div>
							<div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW">
								<div class="scroller-fzNley inner-tqJwAU">
									<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom20-2Ifj-2 modalTab modalTab-user" style="flex: 1 1 auto;">
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_username_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_" id="input-username"></div>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_usertag_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_" id="input-usertag"></div>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_userurl_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="inputWrapper-3xoRWR vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR flexChild-1KGW5q" style="flex: 1 1 auto;"><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_" id="input-userurl"></div>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO  marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">REPLACE_modal_removeicon_text</h3>
											<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
												<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" id="input-removeicon">
											</div>
										</div>
									</div>
									<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom20-2Ifj-2 modalTab modalTab-name" style="flex: 1 1 auto;">
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_colorpicker1_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="swatches1"></div>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_colorpicker2_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="swatches2"></div>
										</div>
									</div>
									<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginBottom20-2Ifj-2 modalTab modalTab-tag" style="flex: 1 1 auto;">
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_colorpicker3_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="swatches3"></div>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO" style="flex: 1 1 auto;">
											<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">REPLACE_modal_colorpicker4_text</h3>
										</div>
										<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
											<div class="swatches4"></div>
										</div>
									</div>
								</div>
							</div>
							<div class="flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw">
								<button type="button" class="btn-save buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu">
									<div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM">REPLACE_btn_save_text</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;
	}

	getName () {return "EditUsers";}

	getDescription () {return "Allows you to change the icon, name, tag and color of users. Does not work in compact mode.";}

	getVersion () {return "1.9.0";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			return `
			<label style="color:grey; font-size:20px; margin-bottom:5px;">Change user information in:</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="changeInChatWindow"${(this.getSettings().changeInChatWindow ? " checked" : void 0)}> Chat</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="changeInVoiceChat"${(this.getSettings().changeInVoiceChat ? " checked" : void 0)}> Voice Channels</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="changeInMemberList"${(this.getSettings().changeInMemberList ? " checked" : void 0)}> Server Member List</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="changeInDmHeader"${(this.getSettings().changeInDmHeader ? " checked" : void 0)}> DM Title</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="changeInRecentDms"${(this.getSettings().changeInRecentDms ? " checked" : void 0)}> Recent DMs</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="changeInDmsList"${(this.getSettings().changeInDmsList ? " checked" : void 0)}> DM-Conversation List</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="changeInFriendList"${(this.getSettings().changeInFriendList ? " checked" : void 0)}> Friends List</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="changeInUserPopout"${(this.getSettings().changeInUserPopout ? " checked" : void 0)}> User Popups</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="changeInUserProfil"${(this.getSettings().changeInUserProfil ? " checked" : void 0)}> User Profil</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="changeInUserAccount"${(this.getSettings().changeInUserAccount ? " checked" : void 0)}> Your Account Window</label><br>\n<br>\n
			<button class="` + this.getName() + `ResetBtn" style="height:23px" onclick='` + this.getName() + `.resetAll("` + this.getName() + `")'>Reset all Users`;
		}
    }

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
			
			this.userContextObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.nodeType == 1 && node.className.includes("context-menu")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".app")) this.userContextObserver.observe(document.querySelector(".app"), {childList: true});
			
			this.dmObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (this.getSettings().changeInRecentDms) this.loadUser(node, "recentdms", false);
							});
						}
					}
				);
			});
			if (document.querySelector(".dms")) this.dmObserver.observe(document.querySelector(".dms"), {childList: true});
			
			this.channelListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.classList && node.classList.length > 0 && node.classList.contains("channel") && node.classList.contains("private")) {
									if (this.getSettings().changeInDmsList) this.loadUser(node, "dms", false);
								}
								if (node && node.tagName && node.querySelector(".userDefault-2_cnT0")) {
									if (this.getSettings().changeInVoiceChat) this.loadUser(node.querySelector(".userDefault-2_cnT0").parentElement, "voice", false);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".channels-3g2vYe")) this.channelListObserver.observe(document.querySelector(".channels-3g2vYe"), {childList: true, subtree: true});
			
			this.friendListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".friends-column")) {
									if (this.getSettings().changeInFriendList) this.loadUser(node, "friends", false);
								}
							});
						}
					}
				);
			});
			if (document.querySelector("#friends")) this.friendListObserver.observe(document.querySelector("#friends"), {childList:true, subtree:true});
			
			this.userListObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".member-username")) {
									if (this.getSettings().changeInMemberList) this.loadUser(node, "list", false);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".channel-members")) this.userListObserver.observe(document.querySelector(".channel-members"), {childList:true});
			
			this.chatWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (this.getSettings().changeInChatWindow) {
									if ($(".message-group").has(".avatar-large").length > 0) {
										if (node && node.tagName && node.querySelector(".username-wrapper")) {
											this.loadUser(node, "chat", false);
										}
										else if (node && node.classList && node.classList.contains("message-text")) {
											this.loadUser($(".message-group").has(node)[0], "chat", false);
										}
									}
									else {
										if (node && node.tagName && node.querySelector(".username-wrapper")) {
											if (node.classList.contains("markup")) {
												this.loadUser(node, "chat", true);
											}
											else {
												var markups = node.querySelectorAll("div.markup");
												for (var i = 0; i < markups.length; i++) {
													this.loadUser(markups[i], "chat", true);
												}
											}
										}
									}
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true, subtree:true});
			
			this.userPopoutObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector("[class*='userPopout']")) {
									if (this.getSettings().changeInUserPopout) this.loadUser(node, "popout", false);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".popouts")) this.userPopoutObserver.observe(document.querySelector(".popouts"), {childList: true});
			
			this.userProfilModalObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector("#user-profile-modal")) {
									if (this.getSettings().changeInUserProfil) this.loadUser(node.querySelector("#user-profile-modal"), "profil", false);
								}
							});
						}
					}
				);
			});
			if (document.querySelector("#app-mount")) this.userProfilModalObserver.observe(document.querySelector("#app-mount"), {childList: true, subtree:true});
			
			this.settingsWindowObserver = new MutationObserver((changes, _) => {
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
			if (document.querySelector(".layers")) this.settingsWindowObserver.observe(document.querySelector(".layers"), {childList:true});
			
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.loadAllUsers();
			
			setTimeout(() => {
				this.labels = this.setLabelsByLanguage();
				this.changeLanguageStrings();
			},5000);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.switchFixObserver.disconnect();
			this.dmObserver.disconnect();
			this.userContextObserver.disconnect();
			this.friendListObserver.disconnect();
			this.userListObserver.disconnect();
			this.chatWindowObserver.disconnect();
			this.channelListObserver.disconnect();
			this.userPopoutObserver.disconnect();
			this.userProfilModalObserver.disconnect();
			this.settingsWindowObserver.disconnect();
			
			this.resetAllUsers();
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			setTimeout(() => {this.loadAllUsers();}, 30000);
			if (document.querySelector(".channel-members")) this.userListObserver.observe(document.querySelector(".channel-members"), {childList:true});
			if (document.querySelector(".messages.scroller")) this.chatWindowObserver.observe(document.querySelector(".messages.scroller"), {childList:true, subtree:true});
			if (document.querySelector("#friends")) this.friendListObserver.observe(document.querySelector("#friends"), {childList:true, subtree:true});
		}
	}

	
	// begin of own functions
	
	getSettings () {
		var defaultSettings = {
			changeInMemberList: true,
			changeInChatWindow: true,
			changeInVoiceChat: true,
			changeInDmHeader: true,
			changeInRecentDms: true,
			changeInDmsList: true,
			changeInFriendList: true,
			changeInUserAccount: true,
			changeInUserPopout: true,
			changeInUserProfil: true
		};
		var settings = BDfunctionsDevilBro.loadAllData(this.getName(), "settings");
		var saveSettings = false;
		for (var key in defaultSettings) {
			if (settings[key] == null) {
				settings[key] = defaultSettings[key];
				saveSettings = true;
			}
		}
		if (saveSettings) {
			BDfunctionsDevilBro.saveAllData(settings, this.getName(), "settings");
		}
		return settings;
	}

    static updateSettings (ele, pluginName) {
		var settingspanel = BDfunctionsDevilBro.getSettingsPanelDiv(ele);
		var settings = {};
		var inputs = settingspanel.querySelectorAll("input");
		for (var i = 0; i < inputs.length; i++) {
			settings[inputs[i].value] = inputs[i].checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, pluginName, "settings");
    }

    static resetAll (pluginName) {
		if (confirm("Are you sure you want to reset all users?")) {
			BDfunctionsDevilBro.removeAllData(pluginName, "users");
		}
    }

	changeLanguageStrings () {
		this.userContextEntryMarkup = 		this.userContextEntryMarkup.replace("REPLACE_context_localusersettings_text", this.labels.context_localusersettings_text);
		
		this.userContextSubMenuMarkup = 	this.userContextSubMenuMarkup.replace("REPLACE_submenu_usersettings_text", this.labels.submenu_usersettings_text);
		this.userContextSubMenuMarkup = 	this.userContextSubMenuMarkup.replace("REPLACE_submenu_resetsettings_text", this.labels.submenu_resetsettings_text);
		
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_username_text", this.labels.modal_username_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_usertag_text", this.labels.modal_usertag_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_userurl_text", this.labels.modal_userurl_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_removeicon_text", this.labels.modal_removeicon_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_tabheader1_text", this.labels.modal_tabheader1_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_tabheader2_text", this.labels.modal_tabheader2_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_tabheader3_text", this.labels.modal_tabheader3_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker1_text", this.labels.modal_colorpicker1_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker2_text", this.labels.modal_colorpicker2_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker3_text", this.labels.modal_colorpicker3_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker4_text", this.labels.modal_colorpicker4_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_btn_cancel_text", this.labels.btn_cancel_text);
		this.userSettingsModalMarkup = 		this.userSettingsModalMarkup.replace("REPLACE_btn_save_text", this.labels.btn_save_text);
		
		BDfunctionsDevilBro.translateMessage(this.getName());
	}
	
	onContextMenu (context) {
		if ($(context).find(".localusersettings-item").length == 0) {
			var userData = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"user"});
			var contextType = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"displayName", "value":"UserNoteItem"});
			
			if (userData && contextType) {
				$(context).append(this.userContextEntryMarkup)
					.on("mouseenter", ".localusersettings-item", userData, this.createContextSubMenu.bind(this))
					.on("mouseleave", ".localusersettings-item", userData, this.deleteContextSubMenu.bind(this));
			}
		}
	}
	
	createContextSubMenu (e) {
		var targetDiv = e.currentTarget;
		var userContextSubMenu = $(this.userContextSubMenuMarkup);
		$(targetDiv).append(userContextSubMenu)
			.off("click", ".usersettings-item")
			.on("click", ".usersettings-item", e.data, this.showUserSettings.bind(this));
		$(userContextSubMenu)
			.addClass(BDfunctionsDevilBro.getDiscordTheme())
			.css("left", $(targetDiv).offset().left + "px")
			.css("top", $(targetDiv).offset().top + "px");
			
		var info = BDfunctionsDevilBro.loadData(e.data.id, this.getName(), "users");
		if (!info) {
			$(targetDiv).find(".resetsettings-item").addClass("disabled");
		}
		else {
			$(targetDiv)
				.off("click", ".resetsettings-item")
				.on("click", ".resetsettings-item", () => {
					$(".context-menu").hide();
					if (e.data.id) {
						BDfunctionsDevilBro.removeData(e.data.id, this.getName(), "users");
						this.loadAllUsers();
					}
				});
		}
	}
	
	deleteContextSubMenu (e) {
		$(".editusers-submenu").remove();
	}
	
	showUserSettings (e) {
		$(".context-menu").hide();
		var id = e.data.id;
		if (id) {
			var info = BDfunctionsDevilBro.loadData(id, this.getName(), "users");
			
			var name = 			info ? info.name : null;
			var tag = 			info ? info.tag : null;
			var url = 			info ? info.url : null;
			var removeIcon = 	info ? info.removeIcon : false;
			var color1 = 		info ? info.color1 : null;
			var color2 = 		info ? info.color2 : null;
			var color3 = 		info ? info.color3 : null;
			var color4 = 		info ? info.color4 : null;
			
			var userSettingsModal = $(this.userSettingsModalMarkup);
			userSettingsModal.find(".guildName-1u0hy7").text(e.data.username);
			userSettingsModal.find("#input-username").val(name);
			userSettingsModal.find("#input-username").attr("placeholder", e.data.username);
			userSettingsModal.find("#input-usertag").val(tag);
			userSettingsModal.find("#input-userurl").val(url);
			userSettingsModal.find("#input-userurl").attr("placeholder", e.data.avatar ? "https://cdn.discordapp.com/avatars/" + e.data.id + "/" + e.data.avatar + ".webp" : null);
			userSettingsModal.find("#input-userurl").addClass(url ? "valid" : "");
			userSettingsModal.find("#input-userurl").prop("disabled", removeIcon);
			userSettingsModal.find("#input-removeicon").prop("checked", removeIcon);
			BDfunctionsDevilBro.setColorSwatches(color1, userSettingsModal.find(".swatches1"), "swatch1");
			BDfunctionsDevilBro.setColorSwatches(color2, userSettingsModal.find(".swatches2"), "swatch2");
			BDfunctionsDevilBro.setColorSwatches(color3, userSettingsModal.find(".swatches3"), "swatch3");
			BDfunctionsDevilBro.setColorSwatches(color4, userSettingsModal.find(".swatches4"), "swatch4");
			BDfunctionsDevilBro.appendModal(userSettingsModal);
			userSettingsModal
				.on("click", "#input-removeicon", (event) => {
					userSettingsModal.find("#input-userurl").prop("disabled", event.target.checked);
				})
				.on("change keyup paste", "#input-userurl", (event) => {
					this.checkUrl(event, userSettingsModal);
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
						if (!userSettingsModal.find("#input-removeicon").prop("checked") && userSettingsModal.find("#input-userurl").val()) {
							if (userSettingsModal.find("#input-userurl").val().trim().length > 0) {
								url = userSettingsModal.find("#input-userurl").val().trim();
							}
						}
					}
					
					removeIcon = userSettingsModal.find("#input-removeicon").prop("checked");
					
					color1 = BDfunctionsDevilBro.getSwatchColor("swatch1");
					color2 = BDfunctionsDevilBro.getSwatchColor("swatch2");
					color3 = BDfunctionsDevilBro.getSwatchColor("swatch3");
					color4 = BDfunctionsDevilBro.getSwatchColor("swatch4");
					
					if (name == null && tag == null && url == null && !removeIcon && color1 == null && color2 == null && color3 == null && color4 == null) {
						BDfunctionsDevilBro.removeData(id, this.getName(), "users")
					}
					else {
						BDfunctionsDevilBro.saveData(id, {id,name,tag,url,removeIcon,color1,color2,color3,color4}, this.getName(), "users");
					};
					this.loadAllUsers();
				});
			userSettingsModal.find("#input-username").focus();
		}
	}
	
	checkUrl (e, modal) {
		if (!e.target.value) {
			$(e.target)
				.removeClass("valid")
				.removeClass("invalid");
			if ($(e.target).hasClass("hovering")) $(".tooltips").find(".notice-tooltip").remove();
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
		
		var serverID = BDfunctionsDevilBro.getIdOfServer(BDfunctionsDevilBro.getSelectedServer());
		var id = serverID ? serverID : "friend-list";
		
		if (!this.nickNames.id || this.nickNames.id != id) this.nickNames = {"id":id, "names":{}};
		
		var settings = this.getSettings();
		
		if (settings.changeInMemberList) {
			var membersList = document.querySelectorAll("div.member");
			for (let i = 0; i < membersList.length; i++) {
				this.loadUser(membersList[i], "list", false);
			} 
		}
		if (settings.changeInChatWindow) {
			var membersChat = document.querySelectorAll("div.message-group");
			for (let j = 0; j < membersChat.length; j++) {
				if ($(membersChat[j]).has(".avatar-large").length > 0) {
					this.loadUser(membersChat[j], "chat", false);
				}
				else {
					var markups = membersChat[j].querySelectorAll("div.markup");
					for (let j2 = 0; j2 < markups.length; j2++) {
						this.loadUser(markups[j2], "chat", true);
					}
				}
			}
		}
		if (settings.changeInVoiceChat) {
			var membersVoice = document.querySelectorAll("div.userDefault-2_cnT0");
			for (let k = 0; k < membersVoice.length; k++) {
				this.loadUser(membersVoice[k].parentElement, "voice", false);
			}
		}
		if (settings.changeInRecentDms) {
			var membersRecentDMS = document.querySelectorAll("span.dms div.guild");
			for (let l = 0; l < membersRecentDMS.length; l++) {
				this.loadUser(membersRecentDMS[l], "recentdms", false);
			}
		}
		if (settings.changeInDmsList) {
			var membersDMS = document.querySelectorAll("div.channel.private");
			for (let m = 0; m < membersDMS.length; m++) {
				this.loadUser(membersDMS[m], "dms", false);
			}
		}
		if (settings.changeInDmHeader && !BDfunctionsDevilBro.getSelectedServer()) {
			var channelHeader = document.querySelector("div.titleText-2IfpkV");
			if (channelHeader) {
				this.loadUser(channelHeader, "dmheader", false);
			}
		}
		if (settings.changeInFriendList) {
			var membersFriends = document.querySelectorAll("div.friends-column");
			for (let n = 0; n < membersFriends.length; n++) {
				this.loadUser(membersFriends[n], "friends", false);
			}
		}
		if (settings.changeInUserAccount) {
			var account = document.querySelector("div.container-iksrDt");
			if (account) {
				this.loadUser(account, "info", false);
			}
		}
		if (settings.changeInUserPopout) {
			var popout = document.querySelector("[class*='userPopout']");
			if (popout) {
				this.loadUser(popout.parentElement, "popout", false);
			}
		}
		if (settings.changeInUserProfil) {
			var profil = document.querySelector("div#user-profile-modal");
			if (profil) {
				this.loadUser(profil, "profil", false);
			}
		}
	}
	
	loadUser (div, type, compact) {
		if (!div || div.classList.contains("custom-editusers")) return;
		
		let {avatar, username, wrapper} = this.getAvatarNameWrapper(div);
		if (!avatar && !username && !wrapper) return;
		
		$(div).data("compact", compact);
		
		var info = this.getUserInfo(compact ? $(".message-group").has(div)[0] : div);
		if (!info) return;
		
		var styleInfo = BDfunctionsDevilBro.getKeyInformation({"node":type == "list" ? div : wrapper,"key":"style","blackList":{"child":true}});
		
		var data = BDfunctionsDevilBro.loadData(info.id, this.getName(), "users");
		
		
		if (data) {
			if (username) {
				if (!this.nickNames.names[info.id]) this.nickNames.names[info.id] = this.getUserName(username);
				var name = data.name ? data.name : (type == "info" || type == "profil" ? info.username : this.nickNames.names[info.id]);
				var color1 = data.color1 ? BDfunctionsDevilBro.color2RGB(data.color1) : (styleInfo ? BDfunctionsDevilBro.color2RGB(styleInfo.color) : "");
				var color2 = data.color2 ? BDfunctionsDevilBro.color2RGB(data.color2) : "";
				console.log(color1);
				this.setUserName(username, name);
				username.style.color = color1;
				username.style.background = color2;
				
				var messages = div.querySelectorAll(".markup");
				for (var i = 0; i < messages.length; i++) {
					var markup = messages[i];
					if (settingsCookie["bda-gs-7"] && settingsCookie["bda-gs-7"] == true) {
						markup.style.color = color1;
					}
					else {
						markup.style.color = "";
					}
				}
			}
			
			if (avatar) {
				var removeIcon = data.removeIcon ? data.removeIcon : false;
				var bgImage = data.url ? "url(" + data.url + ")" : (info.avatar ? "url('https://cdn.discordapp.com/avatars/" + info.id + "/" + info.avatar + ".webp')" : "url(/assets/1cbd08c76f8af6dddce02c5138971129.png");
				avatar.style.background = removeIcon ? "" : bgImage;
				avatar.style.backgroundSize = "cover";
				avatar.style.backgroundPosition = "center";
			}
				
			var tag = data.tag ? data.tag : null;
			if (tag && (type == "list" || type == "chat" || type == "popout" || type == "profil" || type == "dmheader")) {
				var color3 = data.color3 ? BDfunctionsDevilBro.color2RGB(data.color3) : "";
				var color4 = data.color4 ? BDfunctionsDevilBro.color2RGB(data.color4) : "white";
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
					.on("mouseenter." + this.getName(), {"div":div,"nick":data.name,"name":info.username}, this.createDmToolTip.bind(this));
			}
			
			div.classList.add("custom-editusers");
		}
	}
	
	createDmToolTip (e) {
		var text = e.data.nick ? e.data.nick : e.data.name;
		var customTooltipCSS = `
			.tooltip:not(.dm-custom-tooltip) {
				display: none !important;
			}`;
		BDfunctionsDevilBro.createTooltip(text, e.data.div, {type:"right",selector:"dm-custom-tooltip",css:customTooltipCSS});
	}
	
	resetAllUsers () {
		document.querySelectorAll(".user-tag").forEach(node=>{node.parentElement.removeChild(node)});
		document.querySelectorAll(".custom-editusers").forEach((div) => {
			var {avatar, username, wrapper} = this.getAvatarNameWrapper(div);
			if (!avatar && !username && !wrapper) return;
			
			var info = this.getUserInfo($(div).data("compact") ? $(".message-group").has(div)[0] : div);
			if (!info) return;
			
			var styleInfo = BDfunctionsDevilBro.getKeyInformation({"node":wrapper,"key":"style"});
			
			if (username) {
				var name = div.classList.contains("container-iksrDt") ? info.username : this.nickNames.names[info.id];
				var color1 = styleInfo ? BDfunctionsDevilBro.color2RGB(styleInfo.color) : "";
				var color2 = "";
				this.setUserName(username, name);
				username.style.color = color1;
				username.style.background = color2;
				
				var messages = div.querySelectorAll(".markup");
				for (var i = 0; i < messages.length; i++) {
					var markup = messages[i];
					if (settingsCookie["bda-gs-7"] && settingsCookie["bda-gs-7"] == true) {
						markup.style.color = color1;
					}
					else {
						markup.style.color = "";
					}
				}
			}
			
			if (avatar) {
				var bgImage = info.avatar ? "url('https://cdn.discordapp.com/avatars/" + info.id + "/" + info.avatar + ".webp')" :"url(/assets/1cbd08c76f8af6dddce02c5138971129.png";
				avatar.style.background = bgImage;
				avatar.style.backgroundSize = "cover";
			}
			
			$(div).find(".guild-inner")
				.off("mouseenter." + this.getName());
			
			div.classList.remove("custom-editusers");
		});
	}
	
	getAvatarNameWrapper (div) {
		var avatar = div.querySelector(".avatar-small, .avatar-large, .avatarDefault-3jtQoc, .avatar-profile, .avatar-1BXaQj .image-EVRGPw");
						
		var username = div.querySelector(".user-name, .member-username-inner, .channel-name, .username, .headerName-2N8Pdz, .nameDefault-1I0lx8, .headerUsernameNoNickname-1iGxNP, .channelName-1G03vu");
						
		var wrapper = div.querySelector(".member-username, .username-wrapper, .channel-name, .discord-tag, .accountDetails-15i-_e, .headerName-2N8Pdz, .nameDefault-1I0lx8, .headerTag-3zin_i, .channelName-1G03vu");
						
		return {avatar, username, wrapper};
	}
	
	setUserName (div, name) {
		return $(div).contents().filter(function() {
			return this.nodeType == Node.TEXT_NODE;
		})[0].textContent = name;
	}
	
	getUserName (div) {
		return $(div).contents().filter(function() {
			return this.nodeType == Node.TEXT_NODE;
		}).text();
	}
	
	getUserInfo (div) {
		var info = BDfunctionsDevilBro.getKeyInformation({"node":div,"key":"user"});
		if (info) info = info;
		else {
			info = BDfunctionsDevilBro.getKeyInformation({"node":div,"key":"message"});
			if (info) info = info.author;
			else {
				info = BDfunctionsDevilBro.getKeyInformation({"node":div,"key":"channel"});
				if (info) info = {"id":info.recipients[0]};
			}
		}
		return info;
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "da": 	//danish
				return {
					context_localusersettings_text: 	"Lokal brugerindstillinger",
					submenu_usersettings_text: 			"Skift indstillinger",
					submenu_resetsettings_text: 		"Nulstil bruger",
					modal_header_text: 	 				"Lokal brugerindstillinger",
					modal_username_text: 				"Lokalt brugernavn",
					modal_usertag_text:			 		"Initialer",
					modal_userurl_text: 				"Ikon",
					modal_removeicon_text: 				"Fjern ikon",
					modal_tabheader1_text: 				"Bruger",
					modal_tabheader2_text: 				"Navnefarve",
					modal_tabheader3_text: 				"Etiketfarve",
					modal_colorpicker1_text: 			"Navnefarve",
					modal_colorpicker2_text: 			"Baggrundsfarve",
					modal_colorpicker3_text: 			"Etiketfarve",
					modal_colorpicker4_text: 			"Skriftfarve",
					modal_ignoreurl_text: 				"Ignorer URL",
					modal_validurl_text: 				"Gyldig URL",
					modal_invalidurl_text: 				"Ugyldig URL",
					btn_cancel_text: 					"Afbryde",
					btn_save_text: 						"Spare"
				};
			case "de": 	//german
				return {
					context_localusersettings_text: 	"Lokale Benutzereinstellungen",
					submenu_usersettings_text: 			"Ändere Einstellungen",
					submenu_resetsettings_text: 		"Benutzer zurücksetzen",
					modal_header_text: 					"Lokale Benutzereinstellungen",
					modal_username_text: 				"Lokaler Benutzername",
					modal_usertag_text:			 		"Etikett",
					modal_userurl_text: 				"Icon",
					modal_removeicon_text: 				"Entferne Icon",
					modal_tabheader1_text: 				"Benutzer",
					modal_tabheader2_text: 				"Namensfarbe",
					modal_tabheader3_text: 				"Etikettfarbe",
					modal_colorpicker1_text: 			"Namensfarbe",
					modal_colorpicker2_text: 			"Hintergrundfarbe",
					modal_colorpicker3_text: 			"Etikettfarbe",
					modal_colorpicker4_text: 			"Schriftfarbe",
					modal_ignoreurl_text: 				"URL ignorieren",
					modal_validurl_text: 				"Gültige URL",
					modal_invalidurl_text: 				"Ungültige URL",
					btn_cancel_text: 					"Abbrechen",
					btn_save_text: 						"Speichern"
				};
			case "es": 	//spanish
				return {
					context_localusersettings_text: 	"Ajustes local de usuario",
					submenu_usersettings_text: 			"Cambiar ajustes",
					submenu_resetsettings_text: 		"Restablecer usuario",
					modal_header_text: 					"Ajustes local de usuario",
					modal_username_text: 				"Nombre local de usuario",
					modal_usertag_text:			 		"Etiqueta",
					modal_userurl_text: 				"Icono",
					modal_removeicon_text: 				"Eliminar icono",
					modal_tabheader1_text: 				"Usuario",
					modal_tabheader2_text: 				"Color del nombre",
					modal_tabheader3_text:				"Color de la etiqueta",
					modal_colorpicker1_text: 			"Color del nombre",
					modal_colorpicker2_text: 			"Color de fondo",
					modal_colorpicker3_text: 			"Color de la etiqueta",
					modal_colorpicker4_text: 			"Color de fuente",
					modal_ignoreurl_text: 				"Ignorar URL",
					modal_validurl_text: 				"URL válida",
					modal_invalidurl_text: 				"URL inválida",
					btn_cancel_text: 					"Cancelar",
					btn_save_text: 						"Guardar"
				};
			case "fr": 	//french
				return {
					context_localusersettings_text: 	"Paramètres locale d'utilisateur",
					submenu_usersettings_text: 			"Modifier les paramètres",
					submenu_resetsettings_text: 		"Réinitialiser l'utilisateur",
					modal_header_text: 					"Paramètres locale d'utilisateur",
					modal_username_text: 				"Nom local d'utilisateur",
					modal_usertag_text:			 		"Étiquette",
					modal_userurl_text: 				"Icône",
					modal_removeicon_text: 				"Supprimer l'icône",
					modal_tabheader1_text: 				"Serveur",
					modal_tabheader2_text: 				"Couleur du nom",
					modal_tabheader3_text:				"Couleur de l'étiquette",
					modal_colorpicker1_text: 			"Couleur du nom",
					modal_colorpicker2_text: 			"Couleur de fond",
					modal_colorpicker3_text:			"Couleur de l'étiquette",
					modal_colorpicker4_text:			"Couleur de la police",
					modal_ignoreurl_text: 				"Ignorer l'URL",
					modal_validurl_text: 				"URL valide",
					modal_invalidurl_text: 				"URL invalide",
					btn_cancel_text: 					"Abandonner",
					btn_save_text: 						"Enregistrer"
				};
			case "it": 	//italian
				return {
					context_localusersettings_text: 	"Impostazioni locale utente",
					submenu_usersettings_text: 			"Cambia impostazioni",
					submenu_resetsettings_text: 		"Ripristina utente",
					modal_header_text: 					"Impostazioni locale utente",
					modal_username_text: 				"Nome locale utente",
					modal_usertag_text:			 		"Etichetta",
					modal_userurl_text: 				"Icona",
					modal_removeicon_text: 				"Rimuova l'icona",
					modal_tabheader1_text: 				"Utente",
					modal_tabheader2_text: 				"Colore del nome",
					modal_tabheader3_text:				"Colore della etichetta",
					modal_colorpicker1_text: 			"Colore del nome",
					modal_colorpicker2_text: 			"Colore di sfondo",
					modal_colorpicker3_text:			"Colore della etichetta",
					modal_colorpicker4_text:			"Colore del carattere",
					modal_ignoreurl_text: 				"Ignora l'URL",
					modal_validurl_text: 				"URL valido",
					modal_invalidurl_text: 				"URL non valido",
					btn_cancel_text: 					"Cancellare",
					btn_save_text: 						"Salvare"
				};
			case "nl": 	//dutch
				return {
					context_localusersettings_text: 	"Lokale gebruikerinstellingen",
					submenu_usersettings_text: 			"Verandere instellingen",
					submenu_resetsettings_text: 		"Reset gebruiker",
					modal_header_text: 					"Lokale gebruikerinstellingen",
					modal_username_text: 				"Lokale gebruikernaam",
					modal_usertag_text:			 		"Etiket",
					modal_userurl_text: 				"Icoon",
					modal_removeicon_text: 				"Verwijder icoon",
					modal_tabheader1_text: 				"Gebruiker",
					modal_tabheader2_text: 				"Naam kleur",
					modal_tabheader3_text:				"Etiket kleur",
					modal_colorpicker1_text: 			"Naam kleur",
					modal_colorpicker2_text: 			"Achtergrond kleur",
					modal_colorpicker3_text:			"Etiket kleur",
					modal_colorpicker4_text:			"Doopvont kleur",
					modal_ignoreurl_text: 				"URL negeren",
					modal_validurl_text: 				"Geldige URL",
					modal_invalidurl_text: 				"Ongeldige URL",
					btn_cancel_text: 					"Afbreken",
					btn_save_text: 						"Opslaan"
				};
			case "no": 	//norwegian
				return {
					context_localusersettings_text: 	"Lokal brukerinnstillinger",
					submenu_usersettings_text: 			"Endre innstillinger",
					submenu_resetsettings_text: 		"Tilbakestill bruker",
					modal_header_text: 					"Lokal brukerinnstillinger",
					modal_username_text: 				"Lokalt gebruikernavn",
					modal_usertag_text:			 		"Stikkord",
					modal_userurl_text: 				"Ikon",
					modal_removeicon_text: 				"Fjern ikon",
					modal_tabheader1_text: 				"Bruker",
					modal_tabheader2_text: 				"Navnfarge",
					modal_tabheader3_text:				"Stikkordfarge",
					modal_colorpicker1_text: 			"Navnfarge",
					modal_colorpicker2_text: 			"Bakgrunnfarge",
					modal_colorpicker3_text:			"Stikkordfarge",
					modal_colorpicker4_text:			"Skriftfarge",
					modal_ignoreurl_text: 				"Ignorer URL",
					modal_validurl_text: 				"Gyldig URL",
					modal_invalidurl_text: 				"Ugyldig URL",
					btn_cancel_text: 					"Avbryte",
					btn_save_text: 						"Lagre"
				};
			case "pl": 	//polish
				return {
					context_localusersettings_text: 	"Lokalny ustawienia użytkownik",
					submenu_usersettings_text: 			"Zmień ustawienia",
					submenu_resetsettings_text: 		"Resetuj użytkownik",
					modal_header_text: 					"Lokalny ustawienia użytkownik",
					modal_username_text: 				"Lokalna nazwa użytkownik",
					modal_usertag_text:			 		"Etykietka",
					modal_userurl_text: 				"Ikony",
					modal_removeicon_text: 				"Usuń ikonę",
					modal_tabheader1_text: 				"Użytkownik",
					modal_tabheader2_text: 				"Kolor nazwa",
					modal_tabheader3_text:				"Kolor etykietka",
					modal_colorpicker1_text: 			"Kolor nazwa",
					modal_colorpicker2_text: 			"Kolor tło",
					modal_colorpicker3_text:			"Kolor etykietka",
					modal_colorpicker4_text:			"Kolor czcionki",
					modal_ignoreurl_text: 				"Zignoruj URL",
					modal_validurl_text: 				"Prawidłowy URL",
					modal_invalidurl_text: 				"Nieprawidłowy URL",
					btn_cancel_text: 					"Anuluj",
					btn_save_text: 						"Zapisz"
				};
			case "pt": 	//portuguese (brazil)
				return {
					context_localusersettings_text: 	"Configurações local do utilizador",
					submenu_usersettings_text: 			"Mudar configurações",
					submenu_resetsettings_text: 		"Redefinir utilizador",
					modal_header_text: 					"Configurações local do utilizador",
					modal_username_text: 				"Nome local do utilizador",
					modal_usertag_text:			 		"Etiqueta",
					modal_userurl_text: 				"Icone",
					modal_removeicon_text: 				"Remover ícone",
					modal_tabheader1_text: 				"Utilizador",
					modal_tabheader2_text: 				"Cor do nome",
					modal_tabheader3_text:				"Cor da etiqueta",
					modal_colorpicker1_text: 			"Cor do nome",
					modal_colorpicker2_text: 			"Cor do fundo",
					modal_colorpicker3_text:			"Cor da etiqueta",
					modal_colorpicker4_text:			"Cor da fonte",
					modal_ignoreurl_text: 				"Ignorar URL",
					modal_validurl_text: 				"URL válido",
					modal_invalidurl_text: 				"URL inválida",
					btn_cancel_text: 					"Cancelar",
					btn_save_text: 						"Salvar"
				};
			case "fi": 	//finnish
				return {
					context_localusersettings_text: 	"Paikallinen käyttäjä asetukset",
					submenu_usersettings_text: 			"Vaihda asetuksia",
					submenu_resetsettings_text: 		"Nollaa käyttäjä",
					modal_header_text: 					"Paikallinen käyttäjä asetukset",
					modal_username_text: 				"Paikallinen käyttäjätunnus",
					modal_usertag_text:			 		"Merkki",
					modal_userurl_text: 				"Ikonin",
					modal_removeicon_text: 				"Poista kuvake",
					modal_tabheader1_text: 				"Käyttäjä",
					modal_tabheader2_text: 				"Nimi väri",
					modal_tabheader3_text:				"Merkki väri",
					modal_colorpicker1_text: 			"Nimi väri",
					modal_colorpicker2_text: 			"Tausta väri",
					modal_colorpicker3_text:			"Merkki väri",
					modal_colorpicker4_text:			"Fontin väri",
					modal_ignoreurl_text: 				"Ohita URL",
					modal_validurl_text: 				"Voimassa URL",
					modal_invalidurl_text: 				"Virheellinen URL",
					btn_cancel_text: 					"Peruuttaa",
					btn_save_text: 						"Tallentaa"
				};
			case "sv": 	//swedish
				return {
					context_localusersettings_text: 	"Lokal användareinställningar",
					submenu_usersettings_text: 			"Ändra inställningar",
					submenu_resetsettings_text: 		"Återställ användare",
					modal_header_text: 					"Lokal användareinställningar",
					modal_username_text: 				"Lokalt användarenamn",
					modal_usertag_text:			 		"Märka",
					modal_userurl_text: 				"Ikon",
					modal_removeicon_text: 				"Ta bort ikonen",
					modal_tabheader1_text: 				"Användare",
					modal_tabheader2_text: 				"Namnfärg",
					modal_tabheader3_text:				"Märkafärg",
					modal_colorpicker1_text: 			"Namnfärg",
					modal_colorpicker2_text: 			"Bakgrundfärg",
					modal_colorpicker3_text:			"Märkafärg",
					modal_colorpicker4_text:			"Fontfärg",
					modal_ignoreurl_text: 				"Ignorera URL",
					modal_validurl_text: 				"Giltig URL",
					modal_invalidurl_text: 				"Ogiltig URL",
					btn_cancel_text: 					"Avbryta",
					btn_save_text: 						"Spara"
				};
			case "tr": 	//turkish
				return {
					context_localusersettings_text: 	"Yerel Kullanıcı Ayarları",
					submenu_usersettings_text: 			"Ayarları Değiştir",
					submenu_resetsettings_text: 		"Kullanıcı Sıfırla",
					modal_header_text: 					"Yerel Kullanıcı Ayarları",
					modal_username_text: 				"Yerel Kullanıcı Isim",
					modal_usertag_text:			 		"Etiket",
					modal_userurl_text: 				"Simge",
					modal_removeicon_text: 				"Simge kaldır",
					modal_tabheader1_text: 				"Kullanıcı",
					modal_tabheader2_text: 				"Simge rengi",
					modal_tabheader3_text:				"Isim rengi",
					modal_colorpicker1_text: 			"Simge rengi",
					modal_colorpicker2_text: 			"Arka fon rengi",
					modal_colorpicker3_text:			"Etiket rengi",
					modal_colorpicker4_text:			"Yazı rengi",
					modal_ignoreurl_text: 				"URL yoksay",
					modal_validurl_text: 				"Geçerli URL",
					modal_invalidurl_text: 				"Geçersiz URL",
					btn_cancel_text: 					"Iptal",
					btn_save_text: 						"Kayıt"
				};
			case "cs": 	//czech
				return {
					context_localusersettings_text: 	"Místní nastavení uživatel",
					submenu_usersettings_text: 			"Změnit nastavení",
					submenu_resetsettings_text: 		"Obnovit uživatel",
					modal_header_text: 					"Místní nastavení uživatel",
					modal_username_text: 				"Místní název uživatel",
					modal_usertag_text:			 		"Štítek",
					modal_userurl_text: 				"Ikony",
					modal_removeicon_text: 				"Odstranit ikonu",
					modal_tabheader1_text: 				"Uživatel",
					modal_tabheader2_text: 				"Barva název",
					modal_tabheader3_text:				"Barva štítek",
					modal_colorpicker1_text: 			"Barva název",
					modal_colorpicker2_text: 			"Barva pozadí",
					modal_colorpicker3_text:			"Barva štítek",
					modal_colorpicker4_text:			"Barva fontu",
					modal_ignoreurl_text: 				"Ignorovat URL",
					modal_validurl_text: 				"Platná URL",
					modal_invalidurl_text: 				"Neplatná URL",
					btn_cancel_text: 					"Zrušení",
					btn_save_text: 						"Uložit"
				};
			case "bg": 	//bulgarian
				return {
					context_localusersettings_text: 	"Настройки за локални потребител",
					submenu_usersettings_text: 			"Промяна на настройките",
					submenu_resetsettings_text: 		"Възстановяване на потребител",
					modal_header_text: 					"Настройки за локални потребител",
					modal_username_text: 				"Локално име на потребител",
					modal_usertag_text:			 		"Cвободен край",
					modal_userurl_text: 				"Икона",
					modal_removeicon_text: 				"Премахване на иконата",
					modal_tabheader1_text: 				"Потребител",
					modal_tabheader2_text: 				"Цвят на име",
					modal_tabheader3_text:				"Цвят на свободен край",
					modal_colorpicker1_text: 			"Цвят на име",
					modal_colorpicker2_text: 			"Цвят на заден план",
					modal_colorpicker3_text:			"Цвят на свободен край",
					modal_colorpicker4_text:			"Цвят на шрифта",
					modal_ignoreurl_text: 				"Игнориране на URL",
					modal_validurl_text: 				"Валиден URL",
					modal_invalidurl_text: 				"Невалиден URL",
					btn_cancel_text: 					"Зъбести",
					btn_save_text: 						"Cпасяване"
				};
			case "ru": 	//russian
				return {
					context_localusersettings_text: 	"Настройки локального пользователь",
					submenu_usersettings_text: 			"Изменить настройки",
					submenu_resetsettings_text: 		"Сбросить пользователь",
					modal_header_text: 					"Настройки локального пользователь",
					modal_username_text: 				"Имя локального пользователь",
					modal_usertag_text:			 		"Tег",
					modal_userurl_text: 				"Значок",
					modal_removeicon_text: 				"Удалить значок",
					modal_tabheader1_text: 				"Пользователь",
					modal_tabheader2_text: 				"Цвет имя",
					modal_tabheader3_text:				"Цвет тег",
					modal_colorpicker1_text: 			"Цвет имя",
					modal_colorpicker2_text: 			"Цвет задний план",
					modal_colorpicker3_text:			"Цвет тег",
					modal_colorpicker4_text:			"Цвет шрифта",
					modal_ignoreurl_text: 				"Игнорировать URL",
					modal_validurl_text: 				"Действительный URL",
					modal_invalidurl_text: 				"Неверная URL",
					btn_cancel_text: 					"Отмена",
					btn_save_text: 						"Cпасти"
				};
			case "uk": 	//ukrainian
				return {
					context_localusersettings_text: 	"Налаштування локального користувач",
					submenu_usersettings_text: 			"Змінити налаштування",
					submenu_resetsettings_text: 		"Скидання користувач",
					modal_header_text: 					"Налаштування локального користувач",
					modal_username_text: 				"Локальне ім'я користувач",
					modal_usertag_text:			 		"Tег",
					modal_userurl_text: 				"Іконка",
					modal_removeicon_text: 				"Видалити піктограму",
					modal_tabheader1_text: 				"Користувач",
					modal_tabheader2_text: 				"Колір ім'я",
					modal_tabheader3_text:				"Колір тег",
					modal_colorpicker1_text: 			"Колір ім'я",
					modal_colorpicker2_text: 			"Колір фон",
					modal_colorpicker3_text:			"Колір тег",
					modal_colorpicker4_text:			"Колір шрифту",
					modal_ignoreurl_text: 				"Ігнорувати URL",
					modal_validurl_text: 				"Дійсна URL",
					modal_invalidurl_text: 				"Недійсна URL",
					btn_cancel_text: 					"Скасувати",
					btn_save_text: 						"Зберегти"
				};
			case "ja": 	//japanese
				return {
					context_localusersettings_text: 	"ローカルユーザーー設定",
					submenu_usersettings_text: 			"設定を変更する",
					submenu_resetsettings_text: 		"ユーザーーをリセットする",
					modal_header_text: 					"ローカルユーザーー設定",
					modal_username_text: 				"ローカルユーザーー名",
					modal_usertag_text:			 		"タグ",
					modal_userurl_text: 				"アイコン",
					modal_removeicon_text: 				"アイコンを削除",
					modal_tabheader1_text: 				"ユーザー",
					modal_tabheader2_text: 				"名の色",
					modal_tabheader3_text:				"タグの色",
					modal_colorpicker1_text: 			"名の色",
					modal_colorpicker2_text: 			"バックグラウンドの色",
					modal_colorpicker3_text:			"タグの色",
					modal_colorpicker4_text:			"フォントの色",
					modal_ignoreurl_text: 				"URL を無視する",
					modal_validurl_text: 				"有効な URL",
					modal_invalidurl_text: 				"無効な URL",
					btn_cancel_text: 					"キャンセル",
					btn_save_text: 						"セーブ"
				};
			case "zh": 	//chinese (traditional)
				return {
					context_localusersettings_text: 	"本地用戶設置",
					submenu_usersettings_text: 			"更改設置",
					submenu_resetsettings_text: 		"重置用戶",
					modal_header_text: 					"本地用戶設置",
					modal_username_text: 				"用戶名稱",
					modal_usertag_text:			 		"標籤",
					modal_userurl_text: 				"圖標",
					modal_removeicon_text: 				"刪除圖標",
					modal_tabheader1_text: 				"用戶",
					modal_tabheader2_text: 				"名稱顏色",
					modal_tabheader3_text: 				"標籤顏色",
					modal_colorpicker1_text: 			"名稱顏色",
					modal_colorpicker2_text: 			"背景顏色",
					modal_colorpicker3_text:			"標籤顏色",
					modal_colorpicker4_text:			"字體顏色",
					modal_ignoreurl_text: 				"忽略 URL",
					modal_validurl_text: 				"有效的 URL",
					modal_invalidurl_text: 				"無效的 URL",
					btn_cancel_text: 					"取消",
					btn_save_text: 						"保存"
				};
			case "ko": 	//korean
				return {
					context_localusersettings_text: 	"로컬 사용자 설정",
					submenu_usersettings_text: 			"설정 변경",
					submenu_resetsettings_text: 		"사용자 재설정",
					modal_header_text: 					"로컬 사용자 설정",
					modal_username_text: 				"로컬 사용자 이름",
					modal_usertag_text:			 		"꼬리표",
					modal_userurl_text: 				"상",
					modal_removeicon_text: 				"상 삭제",
					modal_tabheader1_text: 				"사용자",
					modal_tabheader2_text: 				"이름 색깔",
					modal_tabheader3_text:				"꼬리표 색깔",
					modal_colorpicker1_text: 			"이름 색깔",
					modal_colorpicker2_text: 			"배경 색깔",
					modal_colorpicker3_text:			"꼬리표 색깔",
					modal_colorpicker4_text:			"글꼴 색깔",
					modal_ignoreurl_text: 				"URL 무시",
					modal_validurl_text: 				"유효한 URL",
					modal_invalidurl_text: 				"잘못된 URL",
					btn_cancel_text: 					"취소",
					btn_save_text: 						"저장"
				};
			default: 	//default: english
				return {
					context_localusersettings_text: 	"Local Usersettings",
					submenu_usersettings_text: 			"Change Settings",
					submenu_resetsettings_text: 		"Reset User",
					modal_header_text: 					"Local Usersettings",
					modal_username_text: 				"Local Username",
					modal_usertag_text:			 		"Tag",
					modal_userurl_text: 				"Icon",
					modal_removeicon_text: 				"Remove Icon",
					modal_tabheader1_text: 				"User",
					modal_tabheader2_text: 				"Namecolor",
					modal_tabheader3_text:				"Tagcolor",
					modal_colorpicker1_text: 			"Namecolor",
					modal_colorpicker2_text: 			"Backgroundcolor",
					modal_colorpicker3_text:			"Tagcolor",
					modal_colorpicker4_text:			"Fontcolor",
					modal_ignoreurl_text: 				"Ignore URL",
					modal_validurl_text: 				"Valid URL",
					modal_invalidurl_text: 				"Invalid URL",
					btn_cancel_text: 					"Cancel",
					btn_save_text: 						"Save"
				};
		}
	}
}
