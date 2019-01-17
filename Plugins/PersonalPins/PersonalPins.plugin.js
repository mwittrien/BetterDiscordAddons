//META{"name":"PersonalPins"}*//

class PersonalPins {
	getName () {return "PersonalPins";}

	getDescription () {return "Similar to normal pins. Lets you save messages as notes for yourself.";}

	getVersion () {return "1.7.3";}

	getAuthor () {return "DevilBro";}
	
	initConstructor () {
		this.labels = {};
		
		this.patchModules = {
			"HeaderBar":["componentDidMount","componentDidUpdate"],
			"Message":"componentDidMount",
			"MessageOptionPopout":"componentDidMount"
		};
		
		this.notesButtonMarkup =
			`<span class="${BDFDB.disCN.channelheadericonmargin} notes-button">
				<svg class="${BDFDB.disCNS.channelheadericoninactive + BDFDB.disCN.channelheadericon}" name="Note" width="16" height="16" viewBox="0 0 26 26">
					<g fill="none" fill-rule="evenodd" transform="translate(3,2)">
						<path class="${BDFDB.disCN.channelheadericonforeground}" fill="currentColor" d="M 4.618, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 s 0.573 -0.256, 0.573 -0.573 V 0.573 C 5.191, 0.256, 4.935, 0, 4.618, 0 z"/>
						<path class="${BDFDB.disCN.channelheadericonforeground}" fill="currentColor" d="M 8.053, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 s 0.573 -0.256, 0.573 -0.573 V 0.573 C 8.626, 0.256, 8.37, 0, 8.053, 0 z"/>
						<path class="${BDFDB.disCN.channelheadericonforeground}" fill="currentColor" d="M 11.489, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 c 0.316, 0, 0.573 -0.256, 0.573 -0.573 V 0.573 C 12.061, 0.256, 11.805, 0, 11.489, 0 z "/>
						<path class="${BDFDB.disCN.channelheadericonforeground}" fill="currentColor" d="M 14.924, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 c 0.316, 0, 0.573 -0.256, 0.573 -0.573 V 0.573 C 15.496, 0.256, 15.24, 0, 14.924, 0 z"/>
						<path class="${BDFDB.disCN.channelheadericonforeground}" fill="currentColor" d="M 16.641, 1.25 V 1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 V 1.25 C 2.236, 1.488, 1.756, 2.117, 1.756, 2.863 v 14.962 c 0, 0.947, 0.77, 1.718, 1.718, 1.718 h 12.595 c 0.947, 0, 1.718 -0.77, 1.718 -1.718 V 2.863 C 17.786, 2.117, 17.306, 1.488, 16.641, 1.25 z M 14.924, 16.679 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 c 0 -0.316, 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 C 15.496, 16.423, 15.24, 16.679, 14.924, 16.679 z M 14.924, 13.244 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 c 0 -0.316, 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 C 15.496, 12.988, 15.24, 13.244, 14.924, 13.244 z M 14.924, 9.733 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 s 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 S 15.24, 9.733, 14.924, 9.733 z M 14.924, 6.298 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 s 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 S 15.24, 6.298, 14.924, 6.298 z"/>
					</g>
				</svg>
			</span>`;
			
		this.notesPopoutMarkup = 
			`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottomright + BDFDB.disCNS.popoutnoarrow + BDFDB.disCN.popoutnoshadow} popout-personalpins-notes DevilBro-modal" style="z-index: 1000; visibility: visible; left: 544.844px; top: 35.9896px; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div class="${BDFDB.disCNS.messagespopoutwrap + BDFDB.disCNS.recentmentionspopout + BDFDB.disCN.popoutthemedpopout}" style="max-height: 740px; width: 500px;">
					<div class="${BDFDB.disCNS.recentmentionsheader + BDFDB.disCNS.recentmentionsheader2 + BDFDB.disCN.messagespopoutheader}" style="padding-bottom: 0;">
						<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.margintop8}" style="flex: 0 0 auto;">
							<div class="${BDFDB.disCNS.recentmentionstitle + BDFDB.disCN.messagespopouttitle}">REPLACE_popout_note_text</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.searchbar + BDFDB.disCN.size14}" style="flex: 1 1 auto;">
								<input class="${BDFDB.disCN.searchbarinput}" value="" placeholder="Search for ..." style="flex: 1 1 auto;">
								<div class="${BDFDB.disCN.searchbariconwrap}">
									<i class="${BDFDB.disCNS.searchbaricon + BDFDB.disCNS.searchbareyeglass + BDFDB.disCN.searchbarvisible}"></i>
									<i class="${BDFDB.disCNS.searchbaricon + BDFDB.disCN.searchbarclear}"></i>
								</div>
							</div>
						</div>
						<div class="${BDFDB.disCN.tabbarheadercontainer}" style="flex: 0 0 auto;">
							<div class="${BDFDB.disCNS.tabbarheader + BDFDB.disCN.tabbartop}">
								<div tab="channel" class="${BDFDB.disCNS.settingsitemdefault + BDFDB.disCNS.settingsitem + BDFDB.disCNS.settingsnotselected + BDFDB.disCN.tabbarheaderitem}">REPLACE_popout_channel_text</div>
								<div tab="server" class="${BDFDB.disCNS.settingsitemdefault + BDFDB.disCNS.settingsitem + BDFDB.disCNS.settingsnotselected + BDFDB.disCN.tabbarheaderitem}">REPLACE_popout_server_text</div>
								<div tab="allservers" class="${BDFDB.disCNS.settingsitemdefault + BDFDB.disCNS.settingsitem + BDFDB.disCNS.settingsnotselected + BDFDB.disCN.tabbarheaderitem}">REPLACE_popout_allservers_text</div>
							</div>
							<div class="${BDFDB.disCN.recentmentionsmentionfilter}" style="padding-right: 15px;">
								<div class="${BDFDB.disCN.recentmentionsmentionfilterlabel}">REPLACE_popout_sort_text:</div>
								<div option="timestamp" class="${BDFDB.disCN.recentmentionsmentionfiltervalue}" style="text-transform: none;">REPLACE_popout_messagesort_text</div>
							</div>
						</div>
					</div>
					<div class="${BDFDB.disCN.scrollerwrap}">
						<div class="${BDFDB.disCNS.messagespopout + BDFDB.disCN.scroller}">
							<div class="${BDFDB.disCN.messagespopoutemptyplaceholder}">
								<div class="${BDFDB.disCN.messagespopoutimage}"></div>
								<div class="${BDFDB.disCN.messagespopoutbody}"></div>
							</div>
						</div>
					</div>
				</div>
			</div>`;
			
		this.sortPopoutMarkup =
			`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottomright + BDFDB.disCN.popoutnoshadow} personalpins-sort-popout" style="z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="${BDFDB.disCN.contextmenu} quickSelectPopout">
						<div class="${BDFDB.disCN.contextmenuitemgroup}">
							<div option="timestamp" class="${BDFDB.disCN.contextmenuitem}">REPLACE_popout_messagesort_text</div>
							<div option="addedat" class="${BDFDB.disCN.contextmenuitem}">REPLACE_popout_datesort_text</div>
						</div>
					</div>
				</div>
			</div>`;
		
		this.messagePinContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} personalpins-item personalpins-pin-item">
					<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_context_pinoption_text</div></span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;
		
		this.messageUnpinContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} personalpins-item personalpins-unpin-item">
					<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_context_unpinoption_text</div></span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;
			
		this.popoutPinEntryMarkup = 
			`<button role="menuitem" type="button" class="${BDFDB.disCNS.optionpopoutitem + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookblank + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCN.buttongrow} personalpins-itembtn personalpins-pin-itembtn">
				<div class="${BDFDB.disCN.buttoncontents}">REPLACE_popout_pinoption_text</div>
			</button>`;
			
		this.popoutUnpinEntryMarkup = 
			`<button role="menuitem" type="button" class="${BDFDB.disCNS.optionpopoutitem + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookblank + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCN.buttongrow} personalpins-itembtn personalpins-unpin-itembtn">
				<div class="${BDFDB.disCN.buttoncontents}">REPLACE_popout_unpinoption_text</div>
			</button>`;
			
		this.messageDividerMarkup = 
			`<div class="${BDFDB.disCN.messagespopoutchannelseparator}">
				<span tabindex="0" class="${BDFDB.disCN.messagespopoutchannelname}" role="button"></span>
				<span class=${BDFDB.disCN.messagespopoutguildname}></span>
			</div>`;
			
		this.messageMarkup = 
			`<div class="${BDFDB.disCN.messagespopoutmessagegroupwrapper}">
				<div class="${BDFDB.disCN.messagespopoutmessagegroupwrapperoffsetcorrection}">
					<div class="${BDFDB.disCNS.messagespopoutcontainercozybounded + BDFDB.disCNS.messagegroup + BDFDB.disCN.messagegroupcozy}">
						<div class="${BDFDB.disCNS.messagespopoutmessagegroupcozy + BDFDB.disCNS.messagecozy + BDFDB.disCN.message}" aria-disabled="true">
							<div class="${BDFDB.disCN.messageheadercozy}">
								<div tabindex="-1" aria-hidden="true" class="${BDFDB.disCNS.avatarwrapper + BDFDB.disCNS.avatarlarge + BDFDB.disCN.avatar}" role="button">
									<div class="${BDFDB.disCNS.avatarimage + BDFDB.disCN.avatarlarge}"></div>
								</div>
								<h2 class="${BDFDB.disCN.messageheadercozymeta}">
									<span class="">
										<strong tabindex="0" class="${BDFDB.disCN.messageusername}" role="button"></strong>
									</span>
									<time class="${BDFDB.disCN.messagetimestampcozy}"></time>
								</h2>
							</div>
							<div class="${BDFDB.disCNS.messagecontentcozy + BDFDB.disCN.messagecontent}">
								<div class="${BDFDB.disCNS.messagebodycozy + BDFDB.disCN.messagebody}">
									<div class="${BDFDB.disCN.messagemarkup}"></div>
								</div>
								<div class="${BDFDB.disCNS.messagespopoutaccessories + BDFDB.disCNS.messageaccessorycozy + BDFDB.disCN.messageaccessory}"></div>
							</div>
						</div>
						<div class="${BDFDB.disCNS.sinkinteractions + BDFDB.disCN.clickable}"></div>
						<div class="${BDFDB.disCN.messagespopoutactionbuttons}">
							<div tabindex="0" class="${BDFDB.disCN.messagespopoutjumpbutton} jump" role="button">
								<div class="${BDFDB.disCN.messagespopouttext}">REPLACE_popout_jump_text</div>
							</div>
							<div tabindex="0" class="${BDFDB.disCN.messagespopoutjumpbutton} copy" aria-label="Jump" role="button">
								<div class="${BDFDB.disCN.messagespopouttext}">REPLACE_popout_copy_text</div>
							</div>
							<button type="button" class="${BDFDB.disCNS.button + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonlookblank + BDFDB.disCN.buttongrow}">
								<div class="${BDFDB.disCN.buttoncontents}">
									<div class="${BDFDB.disCN.messagespopoutclosebutton}"></div>
								</div>
							</button>
						</div>
						<hr aria-hidden="true" class="${BDFDB.disCNS.messagedividerenabled + BDFDB.disCN.messagedivider}">
					</div>
				</div>
			</div>`;
	}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		let settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Delete all Notes.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;
		
		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		settingspanel.querySelector(".reset-button").addEventListener("click", () => {
			BDFDB.openConfirmModal(this, "Are you sure you want to delete all pinned notes?", () => {
				BDFDB.removeAllData(this, "pins");
			});
		});
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
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
			
			this.SelectChannelUtils = BDFDB.WebModules.findByProperties("selectGuild","selectChannel");
			this.GuildUtils = BDFDB.WebModules.findByProperties("getGuilds","getGuild");
			this.ChannelUtils = BDFDB.WebModules.findByProperties("getChannels","getChannel");
			this.UserUtils = BDFDB.WebModules.findByProperties("getUsers","getUser");
			this.MemberUtils = BDFDB.WebModules.findByProperties("getMembers","getMember");
			this.LastGuildStore = BDFDB.WebModules.findByProperties("getLastSelectedGuildId");
			this.LastChannelStore = BDFDB.WebModules.findByProperties("getLastSelectedChannelId");
			this.HistoryUtils = BDFDB.WebModules.findByProperties("transitionTo", "replaceWith", "getHistory");
			this.MainDiscord = BDFDB.WebModules.findByProperties("ActionTypes");
			
			/* REMOVE 11.01.2019 */
			let p = BDFDB.loadAllData(this, "pins");
			for (let g in p) {
				for (let c in p[g]) {
					for (let m in p[g][c]) {
						if (p[g][c][m].serverID) {
							p[g][c][m].guild_id = p[g][c][m].serverID;
							delete p[g][c][m].serverID;
							p[g][c][m].guild_name = p[g][c][m].serverName;
							delete p[g][c][m].serverName;
							p[g][c][m].channel_id = p[g][c][m].channelID;
							delete p[g][c][m].channelID;
							p[g][c][m].channel_name = p[g][c][m].channelName;
							delete p[g][c][m].channelName;
							p[g][c][m].author_id = p[g][c][m].authorID;
							delete p[g][c][m].authorID;
							p[g][c][m].author_name = p[g][c][m].authorName;
							delete p[g][c][m].authorName;
							p[g][c][m].dmuser_id = p[g][c][m].dmUserID;
							delete p[g][c][m].dmUserID;
							p[g][c][m] = BDFDB.sortObject(p[g][c][m]);
						}
						if (BDFDB.isObjectEmpty(p[g][c][m])) delete p[g][c][m];
					}
					if (BDFDB.isObjectEmpty(p[g][c])) delete p[g][c];
				}
				if (BDFDB.isObjectEmpty(p[g])) delete p[g];
			}
			BDFDB.saveAllData(p, this, "pins");
			
			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".popout-personalpins-notes", ".personalpins-sort-popout", ".notes-button");
			BDFDB.unloadMessage(this);
		}
	}

	
	// begin of own functions
	
	changeLanguageStrings () {
		this.messagePinContextEntryMarkup = 	this.messagePinContextEntryMarkup.replace("REPLACE_context_pinoption_text", this.labels.context_pinoption_text);
		this.messageUnpinContextEntryMarkup = 	this.messageUnpinContextEntryMarkup.replace("REPLACE_context_unpinoption_text", this.labels.context_unpinoption_text);
		
		this.notesPopoutMarkup = 				this.notesPopoutMarkup.replace("REPLACE_popout_note_text", this.labels.popout_note_text);
		this.notesPopoutMarkup = 				this.notesPopoutMarkup.replace("REPLACE_popout_channel_text", this.labels.popout_channel_text);
		this.notesPopoutMarkup = 				this.notesPopoutMarkup.replace("REPLACE_popout_server_text", this.labels.popout_server_text);
		this.notesPopoutMarkup = 				this.notesPopoutMarkup.replace("REPLACE_popout_allservers_text", this.labels.popout_allservers_text);
		this.notesPopoutMarkup = 				this.notesPopoutMarkup.replace("REPLACE_popout_sort_text", this.labels.popout_sort_text);
		this.notesPopoutMarkup = 				this.notesPopoutMarkup.replace("REPLACE_popout_messagesort_text", this.labels.popout_messagesort_text);
		
		this.messageMarkup = 					this.messageMarkup.replace("REPLACE_popout_jump_text", this.labels.popout_jump_text);
		this.messageMarkup = 					this.messageMarkup.replace("REPLACE_popout_copy_text", this.labels.popout_copy_text);
		
		this.sortPopoutMarkup = 				this.sortPopoutMarkup.replace("REPLACE_popout_messagesort_text", this.labels.popout_messagesort_text);
		this.sortPopoutMarkup = 				this.sortPopoutMarkup.replace("REPLACE_popout_datesort_text", this.labels.popout_datesort_text);
		
		this.popoutPinEntryMarkup = 			this.popoutPinEntryMarkup.replace("REPLACE_popout_pinoption_text", this.labels.popout_pinoption_text);
		this.popoutUnpinEntryMarkup = 			this.popoutUnpinEntryMarkup.replace("REPLACE_popout_unpinoption_text", this.labels.context_unpinoption_text);
	}
	
	onMessageContextMenu (instance, menu) {
		if (instance.props && instance.props.message && instance.props.channel && instance.props.target && !menu.querySelector(".personalpins-item")) {
			let pinentry = BDFDB.React.findDOMNodeSafe(BDFDB.getOwnerInstance({node:menu,name:"MessagePinItem"}));
			let messagePinContextEntry = BDFDB.htmlToElement(this.getNoteData(instance.props.message, instance.props.target, instance.props.channel) ? this.messageUnpinContextEntryMarkup : this.messagePinContextEntryMarkup);
			if (pinentry) pinentry.parentElement.insertBefore(messagePinContextEntry, pinentry.nextElementSibling);
			else menu.insertBefore(messagePinContextEntry, menu.firstElementChild);
			let pinitem = messagePinContextEntry.querySelector(".personalpins-item");
			pinitem.addEventListener("click", () => {
				instance._reactInternalFiber.return.memoizedProps.closeContextMenu();
				this.addMessageToNotes(instance.props.message, instance.props.target, instance.props.channel);
			});
			if (BDFDB.isPluginEnabled("MessageUtilities")) {
				BDFDB.setContextHint(pinitem, bdplugins.MessageUtilities.plugin.getActiveShortcutString("__Note_Message"));
			}
		}
	}
	
	processHeaderBar (instance, wrapper) {
		BDFDB.removeEles(".notes-button");
		let search = wrapper.querySelector(BDFDB.dotCN.channelheadersearch);
		if (!search) return;
		let notesbutton = BDFDB.htmlToElement(this.notesButtonMarkup);
		search.parentElement.insertBefore(notesbutton, search);
		let icon = notesbutton.querySelector(BDFDB.dotCN.channelheadericon);
		icon.addEventListener("click", () => {
			this.openNotesPopout(icon);
		});
		icon.addEventListener("mouseenter", () => {
			BDFDB.createTooltip(this.labels.popout_note_text, icon, {type:"bottom",selector:"note-button-tooltip"});
		});
	}
	
	processMessage (instance, wrapper) {  
		if (instance.props && typeof instance.props.renderButtons == "function" && !wrapper.querySelector(BDFDB.dotCN.optionpopoutbutton)) {
			let buttonwrap = wrapper.querySelector(BDFDB.dotCN.messagebuttoncontainer);
			if (buttonwrap) {
				let optionPopoutButton = BDFDB.htmlToElement(`<div class="${BDFDB.disCN.optionpopoutbutton}"></div>`);
				optionPopoutButton.addEventListener("click", () => {BDFDB.createMessageOptionPopout(optionPopoutButton);});
				buttonwrap.appendChild(optionPopoutButton);
			}
		}
	}
	
	processMessageOptionPopout (instance, wrapper) {
		if (instance.props.message && instance.props.channel && instance._reactInternalFiber.memoizedProps.target && !wrapper.querySelector(".personalpins-itembtn")) {
			let {messagediv, pos} = this.getMessageAndPos(instance._reactInternalFiber.memoizedProps.target);
			if (!messagediv || pos == -1) return;
			let popoutUnpinEntry = BDFDB.htmlToElement(this.getNoteData(instance.props.message, instance._reactInternalFiber.memoizedProps.target, instance.props.channel) ? this.popoutUnpinEntryMarkup : this.popoutPinEntryMarkup);
			wrapper.appendChild(popoutUnpinEntry);
			popoutUnpinEntry.addEventListener("click", () => {
				this.addMessageToNotes(instance.props.message, instance._reactInternalFiber.memoizedProps.target, instance.props.channel);
				instance.props.onClose();
			});
		}
	}
	
	openNotesPopout (button) {
		let container = document.querySelector(BDFDB.dotCN.popouts);
		if (!container || BDFDB.containsClass(button, "popout-open")) return;
		BDFDB.addClass(button, "popout-open");
		let notespopout = BDFDB.htmlToElement(this.notesPopoutMarkup);
		container.appendChild(notespopout);
		BDFDB.initElements(notespopout);
		let buttonrects = BDFDB.getRects(button); 
		notespopout.style.setProperty("left", buttonrects.left + buttonrects.width/2 + "px");
		notespopout.style.setProperty("top", buttonrects.top + buttonrects.height + "px")
		notespopout.querySelectorAll(BDFDB.dotCN.tabbarheaderitem).forEach(tab => {tab.addEventListener("click", () => {
			this.addNotes(notespopout);
		});});
		notespopout.querySelector(BDFDB.dotCN.searchbarinput).addEventListener("keyup", () => {
			clearTimeout(notespopout.searchTimeout);
			notespopout.searchTimeout = setTimeout(() => {this.addNotes(notespopout);},1000);
		});
		notespopout.querySelector(BDFDB.dotCN.searchbarclear).addEventListener("click", e => {
			clearTimeout(notespopout.searchTimeout);
			notespopout.searchTimeout = setTimeout(() => {this.addNotes(notespopout);},1000);
		});
		notespopout.querySelector(BDFDB.dotCN.recentmentionsmentionfilter).addEventListener("click", e => {
			BDFDB.createSortPopout(e.currentTarget, this.sortPopoutMarkup, () => {this.addNotes(notespopout);});
		});
		
		var removePopout = e => {
			if (!notespopout.contains(e.target) && !BDFDB.getParentEle(".personalpins-sort-popout", e.target)) {
				document.removeEventListener("mousedown", removePopout);
				notespopout.remove();
				setTimeout(() => {BDFDB.removeClass(button, "popout-open");},300);
			}
		};
		document.addEventListener("mousedown", removePopout);
		
		this.addNotes(notespopout);
	}
	
	addNotes (notespopout) {
		BDFDB.removeEles(notespopout.querySelectorAll(BDFDB.dotCNC.messagegroupwrapper + BDFDB.dotCN.messagespopoutchannelseparator));
		let channel = BDFDB.getSelectedChannel();
		if (channel) {
			let guild_id = channel.guild_id ? channel.guild_id : "@me";
			let pins = BDFDB.loadAllData(this, "pins");
			if (!BDFDB.isObjectEmpty(pins)) {
				let container = notespopout.querySelector(BDFDB.dotCN.messagespopout);
				let placeholder = notespopout.querySelector(BDFDB.dotCN.messagespopoutemptyplaceholder);
				if (!container || !placeholder) return;
				placeholder.querySelector(BDFDB.dotCN.messagespopoutimage).style.setProperty("background-image", `url(${BDFDB.getDiscordTheme() == BDFDB.disCN.themelight ? "/assets/03c7541028afafafd1a9f6a81cb7f149.svg" : "/assets/6793e022dc1b065b21f12d6df02f91bd.svg"})`);
				let notes = {};
				switch (notespopout.querySelector(BDFDB.dotCN.tabbarheaderitem + BDFDB.dotCN.settingsitemselected).getAttribute("tab")) {
					case "channel":
						notes = pins[guild_id] && pins[guild_id][channel.id] ? pins[guild_id][channel.id] : {};
						break;
					case "server":
						if (pins[guild_id]) for (let channel in pins[guild_id]) notes = Object.assign(notes, pins[guild_id][channel]); 
						break;
					case "allservers":
						for (let server in pins) if (pins[server]) for (let channel in pins[server]) notes = Object.assign(notes, pins[server][channel]); 
						break;
				}
				let noteArray = [];
				for (let id in notes) {noteArray.push(notes[id]);}
				BDFDB.sortArrayByKey(noteArray, notespopout.querySelector(BDFDB.dotCN.recentmentionsmentionfiltervalue).getAttribute("option"));
				for (let noteData of noteArray) this.appendNote(container, noteData, placeholder);
				let searchstring = notespopout.querySelector(BDFDB.dotCN.searchbarinput).value.replace(/[<|>]/g, "");
				if (searchstring) for (let note of notespopout.querySelectorAll(BDFDB.dotCN.messagegroupwrapper)) {
					note.innerHTML = BDFDB.highlightText(note.innerHTML, searchstring);
					if (!note.querySelector(BDFDB.dotCN.highlight)) {
						note.previousSibling.remove();
						note.remove();
					}
				}
				BDFDB.toggleEles(placeholder, container.firstElementChild == placeholder);
			}
		}
	}
	
	appendNote (container, noteData, placeholder) {
		if (!container || !noteData) return;
		let server = this.GuildUtils.getGuild(noteData.guild_id) || {};
		let channel = this.ChannelUtils.getChannel(noteData.channel_id) || {};
		let user = this.UserUtils.getUser(noteData.author_id) || {};
		let member = this.MemberUtils.getMember(noteData.guild_id, noteData.author_id) || {};
		let date = new Date(noteData.timestamp);
		let message = BDFDB.htmlToElement(this.messageMarkup);
		let messagedivider = BDFDB.htmlToElement(this.messageDividerMarkup);
		container.insertBefore(message, container.firstChild);
		container.insertBefore(messagedivider, container.firstChild);
		let channelname = messagedivider.querySelector(BDFDB.dotCN.messagespopoutchannelname);
		channelname.innerText = (noteData.guild_id == "@me" ? " @" : " #") + (channel.name || noteData.channel_name);
		if (noteData.guild_id != "@me" && BDFDB.isPluginEnabled("EditChannels")) {
			bdplugins.EditChannels.plugin.changeChannel2({id:noteData.channel_id,name:noteData.channel_name}, channelname);
		}
		else if (noteData.guild_id == "@me" && BDFDB.isPluginEnabled("EditUsers")) {
			let dmuser_id = channel && channel.type == 1 ? channel.recipients[0] : noteData.dmuser_id;
			if (dmuser_id) {
				bdplugins.EditUsers.plugin.changeName2({id:dmuser_id,username:noteData.channel_name}, channelname);
				if (channelname.innerText.indexOf("@") != 0) channelname.innerText = "@" + channelname.innerText;
			}
		}
		let guildname = messagedivider.querySelector(BDFDB.dotCN.messagespopoutguildname);
		guildname.innerText = server.name || noteData.guild_name;
		let avatar = message.querySelector(BDFDB.dotCN.avatarimage);
		avatar.style.setProperty("background-image", `url(${user.id ? BDFDB.getUserAvatar(user.id) : noteData.avatar})`);
		let username = message.querySelector(BDFDB.dotCN.messageusername);
		username.innerText = user.username || noteData.author_name;
		username.style.setProperty("color", member.colorString || noteData.color);
		if (BDFDB.isPluginEnabled("EditUsers")) {
			bdplugins.EditUsers.plugin.changeName({id:noteData.author_id,username:noteData.author_name}, username, noteData.guild_id);
			if (user.id) bdplugins.EditUsers.plugin.changeAvatar({id:noteData.author_id,username:noteData.author_name}, avatar);
			bdplugins.EditUsers.plugin.addTag({id:noteData.author_id,username:noteData.author_name}, username.parentElement, " " + BDFDB.disCN.bottagnametag);
		}
		let timestamp = message.querySelector(BDFDB.dotCN.messagetimestampcozy);
		timestamp.innerText = date.toLocaleString(BDFDB.getDiscordLanguage().id);
		timestamp.setAttribute("datetime", date);
		if (BDFDB.isPluginEnabled("CompleteTimestamps")) bdplugins.CompleteTimestamps.plugin.changeTimestamp(timestamp);
		message.querySelector(BDFDB.dotCN.messagemarkup).innerHTML = noteData.markup.replace(`<span class="edited">`,`<span class="${BDFDB.disCN.messageedited}">`);
		message.querySelector(BDFDB.dotCN.messageaccessory).innerHTML = noteData.accessory;
		if (noteData.accessory) {
			let ytvideo = message.querySelector(BDFDB.dotCN.embed + " iframe[src*='https://www.youtube.com']");
			if (ytvideo) {
				let ytlink = ytvideo.parentElement.parentElement.querySelector(BDFDB.dotCN.embedtitle).href;
				let wrapper = ytvideo.parentElement;
				ytvideo.remove();
				require("request")(ytlink, (error, response, result) => {
					if (result) {
						wrapper.innerHTML = `<a class="${BDFDB.disCNS.imagewrapper + BDFDB.disCN.imagezoom}" href="" rel="noreferrer noopener" target="_blank" style="width: 400px; height: 225px;"><img alt="" src="${result.split('<link itemprop="thumbnailUrl" href="')[1].split('"')[0]}" style="width: 400px; height: 225px;"></a><div class="${BDFDB.disCNS.embedvideoactions + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex + BDFDB.disCNS.justifycenter + BDFDB.disCN.aligncenter}"><div class="${BDFDB.disCNS.embedvideoactionsinner + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex + BDFDB.disCNS.justifycenter + BDFDB.disCN.aligncenter}"><div class="${BDFDB.disCN.iconactionswrapper}"><div tabindex="0" class="${BDFDB.disCNS.iconwrapper + BDFDB.disCN.iconwrapperactive}" role="button"><svg name="Play" class="${BDFDB.disCNS.iconplay + BDFDB.disCN.icon}" width="16" height="16" viewBox="0 0 24 24"><polygon fill="currentColor" points="0 0 0 14 11 7" transform="translate(7 5)"></polygon></svg></div><a class="${BDFDB.disCNS.anchor + BDFDB.disCN.iconwrapper}" href="${ytlink}" rel="noreferrer noopener" target="_blank"><svg name="OpenExternal" class="${BDFDB.disCNS.iconexternalmargins + BDFDB.disCN.icon}" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" transform="translate(3.000000, 4.000000)" d="M16 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4v-2H2V4h14v10h-4v2h4c1.1 0 2-.9 2-2V2a2 2 0 0 0-2-2zM9 6l-4 4h3v6h2v-6h3L9 6z"></path></svg></a></div></div></div></div>`;
						wrapper.querySelector(BDFDB.dotCN.iconplay).addEventListener("click", e => {
							while (wrapper.firstChild) wrapper.firstChild.remove();
							let width = 400;
							let height = Math.round(width*(result.split('<meta itemprop="height" content="')[1].split('"')[0]/result.split('<meta itemprop="width" content="')[1].split('"')[0]));
							wrapper.appendChild(BDFDB.htmlToElement(`<iframe src="${result.split('<link itemprop="embedURL" href="')[1].split('"')[0]}?start=0&amp;autoplay=1&amp;auto_play=1" width="${width}" height="${height}" frameborder="0" allowfullscreen=""></iframe>`));
						});
					}
				});
			}
		}
		messagedivider.querySelector(BDFDB.dotCN.messagespopoutchannelname).addEventListener("click", e => {
			if (!BDFDB.isObjectEmpty(channel)) {
				notespopout.remove();
				this.SelectChannelUtils.selectChannel(server.id, channel.id);
			}
			else BDFDB.shake();
		});
		message.querySelector(BDFDB.dotCN.messagespopoutclosebutton).addEventListener("click", e => {
			BDFDB.removeEles(messagedivider, message);
			this.removeNoteData(noteData);
			BDFDB.toggleEles(placeholder, container.firstElementChild == placeholder);
		});
		message.querySelector(BDFDB.dotCN.messagespopoutjumpbutton + ".jump").addEventListener("click", e => {
			this.HistoryUtils.transitionTo(this.MainDiscord.Routes.MESSAGE(noteData.guild_id, noteData.channel_id, noteData.id));
		});
		message.querySelector(BDFDB.dotCN.messagespopoutjumpbutton + ".copy").addEventListener("click", e => {
			let clipboard = require("electron").clipboard;
			if (noteData.content) clipboard.write({text: noteData.content});
			else {
				let image = message.querySelector(BDFDB.dotCNS.imagewrapper + "img");
				if (image) {
					// stolen from Image2Clipboard
					require("request")({url: image.src, encoding: null}, (error, response, buffer) => {
						if (buffer) {
							let platform = require("process").platform;
							if (platform === "win32" || platform === "darwin") {
								clipboard.write({image: require("electron").nativeImage.createFromBuffer(buffer)});
							}
							else {
								let file = require("path").join(require("process").env["HOME"], "personalpinstemp.png");
								require("fs").writeFileSync(file, buffer, {encoding: null});
								clipboard.write({image: file});
								require("fs").unlinkSync(file);
							}
						}
					});
				}
			}
		});
	}
	
	addMessageToNotes (message, target, channel) {
		if (!message || !target) return;
		let {messagediv, pos} = this.getMessageAndPos(target);
		if (!messagediv || pos == -1) return;
		let pins = BDFDB.loadAllData(this, "pins");
		let guild = this.GuildUtils.getGuild(channel.guild_id) || {};
		let guild_id = guild.id ? guild.id : "@me";
		channel = channel ? channel : this.ChannelUtils.getChannel(message.channel_id);
		pins[guild_id] = pins[guild_id] || {}
		pins[guild_id][channel.id] = pins[guild_id][channel.id] || {}
		if (!pins[guild_id][channel.id][message.id + "_" + pos]) {
			let channelname = channel.name;
			if (!channelname && channel.recipients.length > 0) {
				for (let dmuser_id of channel.recipients) {
					channelname = channelname ? channelname + ", @" : channelname;
					channelname = channelname + this.UserUtils.getUser(dmuser_id).username;
				}
			}
			let markup = messagediv.querySelector(BDFDB.dotCN.messagemarkup).cloneNode(true);
			markup.querySelectorAll(BDFDB.dotCN.messageheadercompact).forEach(h2 => {h2.remove();});
			pins[guild_id][channel.id][message.id + "_" + pos] = BDFDB.sortObject({
				"guild_id": guild_id,
				"guild_name": guild.name ? guild.name : "Direct Messages",
				"channel_id": channel.id,
				"channel_name": channelname,
				"dmuser_id": channel.type == 1 ? channel.recipients[0] : null,
				"id": message.id,
				"pos": pos,
				"timestamp": message.timestamp._i.getTime(),
				"addedat": new Date().getTime(),
				"color": message.colorString,
				"author_id": message.author.id,
				"author_name": message.author.username,
				"avatar": BDFDB.getUserAvatar(message.author.id),
				"content": message.content,
				"markup": markup.innerHTML,
				"accessory": messagediv.querySelector(BDFDB.dotCN.messageaccessory).innerHTML
			});
			BDFDB.saveAllData(pins, this, "pins");
			BDFDB.showToast(this.labels.toast_noteadd_text, {type:"success"});
		}
		else this.removeNoteData(pins[guild_id][channel.id][message.id + "_" + pos]);
	}
	
	getNoteData (message, target, channel) {
		if (!message || !target) return;
		let {messagediv, pos} = this.getMessageAndPos(target);
		if (!messagediv || pos == -1) return;
		channel = channel ? channel : this.ChannelUtils.getChannel(message.channel_id);
		let pins = BDFDB.loadAllData(this, "pins");
		let guildid = channel.guild_id ? channel.guild_id : "@me";
		return pins[guildid] && pins[guildid][channel.id] && pins[guildid][channel.id][message.id + "_" + pos] ? pins[guildid][channel.id][message.id + "_" + pos] : null;
	}
	
	removeNoteData (noteData) {
		let pins = BDFDB.loadAllData(this, "pins");
		delete pins[noteData.guild_id][noteData.channel_id][noteData.id + "_" + noteData.pos];
		if (BDFDB.isObjectEmpty(pins[noteData.guild_id][noteData.channel_id])) {
			delete pins[noteData.guild_id][noteData.channel_id];
			if (BDFDB.isObjectEmpty(pins[noteData.guild_id])) delete pins[noteData.guild_id];
		}
		BDFDB.saveAllData(pins, this, "pins");
		BDFDB.showToast(this.labels.toast_noteremove_text, {type:"danger"});
	}
	
	getMessageAndPos (target) {
		let messagediv = BDFDB.getParentEle(BDFDB.dotCN.message, target);
		let pos = messagediv ? Array.from(messagediv.parentElement.querySelectorAll(BDFDB.dotCN.message)).indexOf(messagediv) : -1;
		return {messagediv, pos};
	}
	
	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					popout_note_text:				"Bilješke",
					popout_channel_text:			"Kanal",
					popout_server_text:				"Poslužavnik",
					popout_allservers_text:			"Svi poslužitelji",
					popout_sort_text:				"Poredaj po",
					popout_messagesort_text:		"Vijesti-Datum",
					popout_datesort_text:			"Bilješka-Datum",
					popout_jump_text:				"Skok",
					popout_copy_text:				"Kopija",
					context_pinoption_text:			"Napominjemo poruku",
					context_unpinoption_text:		"Uklonite bilješku",
					popout_pinoption_text:			"Bilješka",
					toast_noteadd_text:				"Poruka dodana u bilježnicu.",
					toast_noteremove_text:			"Poruka uklonjena iz bilježnice."
				};
			case "da":		//danish
				return {
					popout_note_text:				"Noter",
					popout_channel_text:			"Kanal",
					popout_server_text:				"Server",
					popout_allservers_text:			"Alle servere",
					popout_sort_text:				"Sorter efter",
					popout_messagesort_text:		"Meddelelse-Dato",
					popout_datesort_text:			"Note-Dato",
					popout_jump_text:				"Hop",
					popout_copy_text:				"Kopi",
					context_pinoption_text:			"Noter besked",
					context_unpinoption_text:		"Fjern notatet",
					popout_pinoption_text:			"Noter",
					toast_noteadd_text:				"Meddelelse tilføjet til notesbog.",
					toast_noteremove_text:			"Meddelelse fjernet fra notesbog."
				};
			case "de":		//german
				return {
					popout_note_text:				"Notizen",
					popout_channel_text:			"Kanal",
					popout_server_text:				"Server",
					popout_allservers_text:			"Alle Server",
					popout_sort_text:				"Sortieren nach",
					popout_messagesort_text:		"Nachrichten-Datum",
					popout_datesort_text:			"Notiz-Datum",
					popout_jump_text:				"Springen",
					popout_copy_text:				"Kopieren",
					context_pinoption_text:			"Nachricht notieren",
					context_unpinoption_text:		"Notiz entfernen",
					popout_pinoption_text:			"Notieren",
					toast_noteadd_text:				"Nachricht zum Notizbuch hinzugefügt.",
					toast_noteremove_text:			"Nachricht aus dem Notizbuch entfernt."
				};
			case "es":		//spanish
				return {
					popout_note_text:				"Notas",
					popout_channel_text:			"Canal",
					popout_server_text:				"Servidor",
					popout_allservers_text:			"Todos los servidores",
					popout_sort_text:				"Ordenar por",
					popout_messagesort_text:		"Mensaje-Fecha",
					popout_datesort_text:			"Nota-Fecha",
					popout_jump_text:				"Ir a",
					popout_copy_text:				"Copiar",
					context_pinoption_text:			"Anotar mensaje",
					context_unpinoption_text:		"Quitar la nota",
					popout_pinoption_text:			"Anotar",
					toast_noteadd_text:				"Mensaje agregado al cuaderno.",
					toast_noteremove_text:			"Mensaje eliminado del cuaderno."
				};
			case "fr":		//french
				return {
					popout_note_text:				"Notes",
					popout_channel_text:			"Canal",
					popout_server_text:				"Serveur",
					popout_allservers_text:			"Tous les serveurs",
					popout_sort_text:				"Trier par",
					popout_messagesort_text:		"Message-Date",
					popout_datesort_text:			"Note-Date",
					popout_jump_text:				"Accéder",
					popout_copy_text:				"Copier",
					context_pinoption_text:			"Noter le message",
					context_unpinoption_text:		"Enlevez la note",
					popout_pinoption_text:			"Noter",
					toast_noteadd_text:				"Message ajouté au bloc-notes.",
					toast_noteremove_text:			"Message supprimé du bloc-notes."
				};
			case "it":		//italian
				return {
					popout_note_text:				"Note",
					popout_channel_text:			"Canale",
					popout_server_text:				"Server",
					popout_allservers_text:			"Tutti i server",
					popout_sort_text:				"Ordina per",
					popout_messagesort_text:		"Messaggio-Data",
					popout_datesort_text:			"Nota-Data",
					popout_jump_text:				"Vai",
					popout_copy_text:				"Copiare",
					context_pinoption_text:			"Annotare il messaggio",
					context_unpinoption_text:		"Rimuovi la nota",
					popout_pinoption_text:			"Annotare",
					toast_noteadd_text:				"Messaggio aggiunto al blocco note.",
					toast_noteremove_text:			"Messaggio rimosso dal blocco note."
				};
			case "nl":		//dutch
				return {
					popout_note_text:				"Notities",
					popout_channel_text:			"Kanaal",
					popout_server_text:				"Server",
					popout_allservers_text:			"Alle servers",
					popout_sort_text:				"Sorteer op",
					popout_messagesort_text:		"Bericht-Datum",
					popout_datesort_text:			"Notitie-Datum",
					popout_jump_text:				"Openen",
					popout_copy_text:				"Kopiëren",
					context_pinoption_text:			"Noteer bericht",
					context_unpinoption_text:		"Verwijder de notitie",
					popout_pinoption_text:			"Noteer",
					toast_noteadd_text:				"Bericht toegevoegd aan notitieblok.",
					toast_noteremove_text:			"Bericht verwijderd van notitieblok."
				};
			case "no":		//norwegian
				return {
					popout_note_text:				"Notatene",
					popout_channel_text:			"Kanal",
					popout_server_text:				"Server",
					popout_allservers_text:			"Alle servere",
					popout_sort_text:				"Sorter etter",
					popout_messagesort_text:		"Melding-Dato",
					popout_datesort_text:			"Merknad-Dato",
					popout_jump_text:				"Hoppe",
					popout_copy_text:				"Kopiere",
					context_pinoption_text:			"Notat ned meldingen",
					context_unpinoption_text:		"Fjern notatet",
					popout_pinoption_text:			"Notere",
					toast_noteadd_text:				"Melding lagt til i notisboken.",
					toast_noteremove_text:			"Melding fjernet fra notatboken."
				};
			case "pl":		//polish
				return {
					popout_note_text:				"Notatki",
					popout_channel_text:			"Kanał",
					popout_server_text:				"Serwer",
					popout_allservers_text:			"Wszystkie serwery",
					popout_sort_text:				"Sortuj według",
					popout_messagesort_text:		"Wiadomość-Data",
					popout_datesort_text:			"Notatka-Data",
					popout_jump_text:				"Skocz",
					popout_copy_text:				"Kopiować",
					context_pinoption_text:			"Notuj wiadomość",
					context_unpinoption_text:		"Usuń notatkę",
					popout_pinoption_text:			"Notuj",
					toast_noteadd_text:				"Wiadomość została dodana do notatnika.",
					toast_noteremove_text:			"Wiadomość została usunięta z notatnika."
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					popout_note_text:				"Notas",
					popout_channel_text:			"Canal",
					popout_server_text:				"Servidor",
					popout_allservers_text:			"Todos os servidores",
					popout_sort_text:				"Ordenar por",
					popout_messagesort_text:		"Mensagem-Data",
					popout_datesort_text:			"Nota-Data",
					popout_jump_text:				"Pular",
					popout_copy_text:				"Copiar",
					context_pinoption_text:			"Anote a mensagem",
					context_unpinoption_text:		"Remova a nota",
					popout_pinoption_text:			"Anotar",
					toast_noteadd_text:				"Mensagem adicionada ao caderno.",
					toast_noteremove_text:			"Mensagem removida do caderno."
				};
			case "fi":		//finnish
				return {
					popout_note_text:				"Muistiinpanot",
					popout_channel_text:			"Kanava",
					popout_server_text:				"Palvelin",
					popout_allservers_text:			"Kaikki palvelimet",
					popout_sort_text:				"Järjestä",
					popout_messagesort_text:		"Viesti-Päivämäärä",
					popout_datesort_text:			"Huomaa-Päivämäärä",
					popout_jump_text:				"Siirry",
					popout_copy_text:				"Kopioida",
					context_pinoption_text:			"Huomaa viesti",
					context_unpinoption_text:		"Poista muistiinpano",
					popout_pinoption_text:			"Huomaa",
					toast_noteadd_text:				"Viesti lisätty muistikirjaan.",
					toast_noteremove_text:			"Viesti poistettiin muistikirjaan."
				};
			case "sv":		//swedish
				return {
					popout_note_text:				"Anteckningarna",
					popout_channel_text:			"Kanal",
					popout_server_text:				"Server",
					popout_allservers_text:			"Alla servrar",
					popout_sort_text:				"Sortera efter",
					popout_messagesort_text:		"Meddelande-Datum",
					popout_datesort_text:			"Anteckningen-Datum",
					popout_jump_text:				"Hoppa",
					popout_copy_text:				"Kopiera",
					context_pinoption_text:			"Anteckna meddelande",
					context_unpinoption_text:		"Ta bort noten",
					popout_pinoption_text:			"Anteckna",
					toast_noteadd_text:				"Meddelandet läggs till i anteckningsboken.",
					toast_noteremove_text:			"Meddelande borttaget från anteckningsboken."
				};
			case "tr":		//turkish
				return {
					popout_note_text:				"Notlar",
					popout_channel_text:			"Kanal",
					popout_server_text:				"Sunucu",
					popout_allservers_text:			"Tüm Sunucular",
					popout_sort_text:				"Göre sırala",
					popout_messagesort_text:		"Mesaj-Tarih",
					popout_datesort_text:			"Not-Tarih",
					popout_jump_text:				"Git",
					popout_copy_text:				"Kopyalamak",
					context_pinoption_text:			"Mesajı not alın",
					context_unpinoption_text:		"Notu kaldırmak",
					popout_pinoption_text:			"Not almak",
					toast_noteadd_text:				"Mesaj not defteri'ya eklendi.",
					toast_noteremove_text:			"Mesaj not defteri'dan kaldırıldı."
				};
			case "cs":		//czech
				return {
					popout_note_text:				"Poznámky",
					popout_channel_text:			"Kanál",
					popout_server_text:				"Server",
					popout_allservers_text:			"Všechny servery",
					popout_sort_text:				"Seřazeno podle",
					popout_messagesort_text:		"Zpráva-datum",
					popout_datesort_text:			"Poznámka-datum",
					popout_jump_text:				"Skok",
					popout_copy_text:				"Kopírovat",
					context_pinoption_text:			"Poznámka dolů zprávu",
					context_unpinoption_text:		"Odstraňte poznámku",
					popout_pinoption_text:			"Poznámka dolů",
					toast_noteadd_text:				"Zpráva byla přidána do notebooku.",
					toast_noteremove_text:			"Zpráva byla odebrána z notebooku."
				};
			case "bg":		//bulgarian
				return {
					popout_note_text:				"бележките",
					popout_channel_text:			"Канал",
					popout_server_text:				"Сървър",
					popout_allservers_text:			"Всички сървъри",
					popout_sort_text:				"Сортиране по",
					popout_messagesort_text:		"Съобщение-Дата",
					popout_datesort_text:			"Забележка-Дата",
					popout_jump_text:				"Направо",
					popout_copy_text:				"Копирам",
					context_pinoption_text:			"Oтбележете съобщението",
					context_unpinoption_text:		"Премахнете бележката",
					popout_pinoption_text:			"Oтбележете",
					toast_noteadd_text:				"Съобщението бе добавено към бележника.",
					toast_noteremove_text:			"Съобщението е премахнато от преносимия компютър."
				};
			case "ru":		//russian
				return {
					popout_note_text:				"Заметки",
					popout_channel_text:			"Канал",
					popout_server_text:				"Cервер",
					popout_allservers_text:			"Все серверы",
					popout_sort_text:				"Сортировать по",
					popout_messagesort_text:		"Сообщение-дата",
					popout_datesort_text:			"Заметки-Дата",
					popout_jump_text:				"Перейти",
					popout_copy_text:				"Копировать",
					context_pinoption_text:			"Записывать вниз",
					context_unpinoption_text:		"Удалить заметку",
					popout_pinoption_text:			"Записывать",
					toast_noteadd_text:				"Сообщение добавлено в блокнот.",
					toast_noteremove_text:			"Сообщение удалено из записной книжки."
				};
			case "uk":		//ukrainian
				return {
					popout_note_text:				"Замітки",
					popout_channel_text:			"Канал",
					popout_server_text:				"Сервер",
					popout_allservers_text:			"Всі сервери",
					popout_sort_text:				"Сортувати за",
					popout_messagesort_text:		"Повідомлення-дата",
					popout_datesort_text:			"Примітка-дата",
					popout_jump_text:				"Плиг",
					popout_copy_text:				"Копіювати",
					context_pinoption_text:			"Зверніть увагу на повідомлення",
					context_unpinoption_text:		"Видаліть нотатку",
					popout_pinoption_text:			"Занотуйте",
					toast_noteadd_text:				"Повідомлення додається до ноутбука.",
					toast_noteremove_text:			"Повідомлення видалено з ноутбука."
				};
			case "ja":		//japanese
				return {
					popout_note_text:				"ノート",
					popout_channel_text:			"チャネル",
					popout_server_text:				"サーバ",
					popout_allservers_text:			"すべてのサーバー",
					popout_sort_text:				"並び替え",
					popout_messagesort_text:		"メッセージ-日付",
					popout_datesort_text:			"注-日付",
					popout_jump_text:				"ジャンプ",
					popout_copy_text:				"写す",
					context_pinoption_text:			"ノートダウンメッセージ",
					context_unpinoption_text:		"メモを削除",
					popout_pinoption_text:			"書き留める",
					toast_noteadd_text:				"ノートブックにメッセージが追加されました.",
					toast_noteremove_text:			"ノートブックからメッセージが削除されました."
				};
			case "zh-TW":	//chinese (traditional)
				return {
					popout_note_text:				"筆記",
					popout_channel_text:			"渠道",
					popout_server_text:				"服務器",
					popout_allservers_text:			"所有服務器",
					popout_sort_text:				"排序方式",
					popout_messagesort_text:		"消息-日期",
					popout_datesort_text:			"注-日期",
					popout_jump_text:				"跳到",
					popout_copy_text:				"複製",
					context_pinoption_text:			"記下下來的消息",
					context_unpinoption_text:		"刪除備註",
					popout_pinoption_text:			"記下",
					toast_noteadd_text:				"消息添加到筆記本.",
					toast_noteremove_text:			"消息從筆記本中刪除."
				};
			case "ko":		//korean
				return {
					popout_note_text:				"노트",
					popout_channel_text:			"채널",
					popout_server_text:				"섬기는 사람",
					popout_allservers_text:			"모든 서버",
					popout_sort_text:				"정렬 기준",
					popout_messagesort_text:		"메시지-날짜",
					popout_datesort_text:			"주-날짜",
					popout_jump_text:				"이동",
					popout_copy_text:				"베끼다",
					context_pinoption_text:			"메모 다운 메시지",
					context_unpinoption_text:		"메모 삭제",
					popout_pinoption_text:			"메모하다",
					toast_noteadd_text:				"노트북에 메시지 추가됨.",
					toast_noteremove_text:			"노트에서 메시지 삭제됨."
				};
			default:		//default: english
				return {
					popout_note_text:				"Notes",
					popout_channel_text:			"Channel",
					popout_server_text:				"Server",
					popout_allservers_text:			"All Servers",
					popout_sort_text:				"Sort by",
					popout_messagesort_text:		"Message-Date",
					popout_datesort_text:			"Note-Date",
					popout_jump_text:				"Jump",
					popout_copy_text:				"Copy",
					context_pinoption_text:			"Note Message",
					context_unpinoption_text:		"Remove Note",
					popout_pinoption_text:			"Note",
					toast_noteadd_text:				"Message added to notebook.",
					toast_noteremove_text:			"Message removed from notebook."
				};
		}
	}
}