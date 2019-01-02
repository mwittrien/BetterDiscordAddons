//META{"name":"PersonalPins"}*//

class PersonalPins {
	initConstructor () {
		this.labels = {};
		
		this.patchModules = {
			"HeaderBar":["componentDidMount","componentDidUpdate"],
			"Message":"componentDidMount",
			"MessageOptionPopout":"componentDidMount" 
		};
		
		this.notesButton =
			`<span class="${BDFDB.disCN.channelheadericonmargin} notesButton">
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
									<i class="${BDFDB.disCNS.searchbaricon + BDFDB.disCNS.searchbareyeglass + BDFDB.disCN.searchbarvisible}"/>
									<i class="${BDFDB.disCNS.searchbaricon + BDFDB.disCN.searchbarclear}"/>
								</div>
							</div>
						</div>
						<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.margintop8}" style="flex: 0 0 auto;">
							<div tab="channel" class="tab">REPLACE_popout_channel_text</div>
							<div tab="server" class="tab">REPLACE_popout_server_text</div>
							<div tab="allservers" class="tab">REPLACE_popout_allservers_text</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.quickselect}" style="padding-bottom: 15px; float:right;">
								<div class="${BDFDB.disCN.quickselectlabel}">REPLACE_popout_sort_text:</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.quickselectclick}" style="flex: 0 0 auto;">
									<div option="timestamp" class="${BDFDB.disCN.quickselectvalue}">REPLACE_popout_messagesort_text</div>
									<div class="${BDFDB.disCN.quickselectarrow}"></div>
								</div>
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

	getName () {return "PersonalPins";}

	getDescription () {return "Similar to normal pins. Lets you save messages as notes for yourself.";}

	getVersion () {return "1.7.0";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		let settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Delete all Notes.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;
		
		let settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".reset-button", () => {if (confirm("Are you sure you want to delete all pinned notes?")) BDFDB.removeAllData(this, "pins");});
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
			
			this.SelectChannelUtils = BDFDB.WebModules.findByProperties("selectGuild","selectChannel");
			this.GuildUtils = BDFDB.WebModules.findByProperties("getGuilds","getGuild");
			this.ChannelUtils = BDFDB.WebModules.findByProperties("getChannels","getChannel");
			this.UserUtils = BDFDB.WebModules.findByProperties("getUsers","getUser");
			this.MemberUtils = BDFDB.WebModules.findByProperties("getMembers","getMember");
			this.LastGuildStore = BDFDB.WebModules.findByProperties("getLastSelectedGuildId");
			this.LastChannelStore = BDFDB.WebModules.findByProperties("getLastSelectedChannelId");
			this.HistoryUtils = BDFDB.WebModules.findByProperties("transitionTo", "replaceWith", "getHistory");
			this.MainDiscord = BDFDB.WebModules.findByProperties("ActionTypes");
			
			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDFDB === "object") {
			BDFDB.removeEles(".popout-personalpins-notes", ".personalpins-sort-popout", ".notesButton");
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
			let pininstance = BDFDB.getOwnerInstance({node:menu,name:"MessagePinItem"});
			if (pininstance && pininstance._reactInternalFiber && pininstance._reactInternalFiber.return && pininstance._reactInternalFiber.return.stateNode) {
				let {messagediv, pos} = this.getMessageAndPos(instance.props.target);
				if (!messagediv || pos == -1) return;
				if (this.getNoteData(instance.props.message, instance.props.channel, pos)) {
					$(this.messageUnpinContextEntryMarkup).insertAfter(pininstance._reactInternalFiber.return.stateNode)
						.on("click", ".personalpins-unpin-item", () => {
							instance._reactInternalFiber.return.memoizedProps.closeContextMenu();
							this.removeNoteData(instance.props.message, instance.props.channel, pos);
						});
				}
				else {
					$(this.messagePinContextEntryMarkup).insertAfter(pininstance._reactInternalFiber.return.stateNode)
						.on("click", ".personalpins-pin-item", () => {
							instance._reactInternalFiber.return.memoizedProps.closeContextMenu();
							this.addMessageToNotes(instance.props.message, instance.props.target, instance.props.channel);
						});
				}
				if (BDFDB.isPluginEnabled("MessageUtilities")) {
					BDFDB.setContextHint(menu.querySelector(".personalpins-item"), bdplugins.MessageUtilities.plugin.getActiveShortcutString("__Note_Message"));
				}
			}
		}
	}
	
	processHeaderBar (instance, wrapper) {
		BDFDB.removeEles(".notesButton");
		$(this.notesButton)
			.insertBefore(wrapper.querySelector(BDFDB.dotCN.channelheadersearch))
			.on("click." + this.getName(), BDFDB.dotCN.channelheadericon, (e) => {
				this.openNotesPopout(e);
			})
			.on("mouseenter." + this.getName(), BDFDB.dotCN.channelheadericon, (e) => {
				BDFDB.createTooltip(this.labels.popout_note_text, e.currentTarget, {type:"bottom",selector:"note-button-tooltip"});
			});
	}
	
	processMessage (instance, wrapper) {  
		if (instance.props && typeof instance.props.renderButtons == "function" && !wrapper.querySelector(BDFDB.dotCN.optionpopoutbutton)) {
			let buttonwrap = wrapper.querySelector(BDFDB.dotCN.messagebuttoncontainer);
			if (buttonwrap) {
				let button = $(`<div class="${BDFDB.disCN.optionpopoutbutton}"></div>`)[0];
				$(button).on("click", () => {BDFDB.createMessageOptionPopout(button);}).appendTo(buttonwrap);
			}
		}
	}
	
	processMessageOptionPopout (instance, wrapper) {
		if (instance.props.message && instance.props.channel && instance._reactInternalFiber.memoizedProps.target && !wrapper.querySelector(".personalpins-itembtn")) {
			let {messagediv, pos} = this.getMessageAndPos(instance._reactInternalFiber.memoizedProps.target);
			if (!messagediv || pos == -1) return;
			if (this.getNoteData(instance.props.message, instance.props.channel, pos)) {
				$(this.popoutUnpinEntryMarkup)
					.on("click." + this.getName(), () => {
						this.removeNoteData(instance.props.message, instance.props.channel, pos);
						instance.props.onClose();
					})
					.appendTo(wrapper);
			}
			else {
				$(this.popoutPinEntryMarkup)
					.on("click." + this.getName(), () => {
						this.addMessageToNotes(instance.props.message, instance._reactInternalFiber.memoizedProps.target, instance.props.channel);
						instance.props.onClose();
					})
					.appendTo(wrapper);
			}
		}
	}
	
	openNotesPopout (e) {
		let wrapper = e.currentTarget;
		if (wrapper.classList.contains("popout-open")) return;
		wrapper.classList.add("popout-open");
		let popout = $(this.notesPopoutMarkup);
		BDFDB.initElements(popout);
		let wrappersize = wrapper.getBoundingClientRect(); 
		popout
			.appendTo(BDFDB.dotCN.popouts)
			.css("left", wrappersize.width/2 + wrappersize.left + "px")
			.css("top", wrappersize.height + wrappersize.top + "px")
			.on("click", ".tab:not(.selected)", () => {
				this.addNotes(popout[0]);
			})
			.on("keyup." + this.getName(), BDFDB.dotCN.searchbarinput, () => {
				clearTimeout(popout.searchTimeout);
				popout.searchTimeout = setTimeout(() => {this.addNotes(popout[0]);},1000);
			})
			.on("click." + this.getName(), BDFDB.dotCN.searchbarclear + BDFDB.dotCN.searchbarvisible, () => {
				clearTimeout(popout.searchTimeout);
				popout.searchTimeout = setTimeout(() => {this.addNotes(popout[0]);},1000);
			})
			.on("click", BDFDB.dotCN.quickselectclick, (e2) => {
				this.openSortPopout(e2, popout[0]);
			});
			
		$(document).on("mousedown.notepopout" + this.getName(), (e2) => {
			if (popout.has(e2.target).length == 0 && $(".personalpins-sort-popout").has(e2.target).length == 0) {
				$(document).off("mousedown.notepopout" + this.getName());
				popout.remove();
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			}
		});
		
		this.addNotes(popout[0]);
	}
	
	openSortPopout (e, notespopout) {
		let wrapper = e.currentTarget;
		if (wrapper.classList.contains("popout-open")) return;
		wrapper.classList.add("popout-open");
		let value = $(wrapper).find(BDFDB.dotCN.quickselectvalue);
		let popout = $(this.sortPopoutMarkup);
		$(BDFDB.dotCN.popouts).append(popout)
			.off("click", BDFDB.dotCN.contextmenuitem)
			.on("click", BDFDB.dotCN.contextmenuitem, (e2) => {
				value.text($(e2.currentTarget).text());
				value.attr("option", $(e2.currentTarget).attr("option"));
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
				this.addNotes(notespopout);
			});
			
		popout
			.css("left", $(e.currentTarget).offset().left + $(e.currentTarget).outerWidth() + "px")
			.css("top", $(e.currentTarget).offset().top + value.outerHeight() + "px")
			.find(BDFDB.dotCN.contextmenu).addClass(BDFDB.getDiscordTheme());
			
		$(document).on("mousedown.sortpopout" + this.getName(), (e2) => {
			if (popout.has(e2.target).length == 0) {
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			}
		});
	}
	
	getMessageAndPos (target) {
		let messagediv = BDFDB.getParentEle(BDFDB.dotCN.message, target);
		let pos = Array.from(messagediv.parentElement.querySelectorAll(BDFDB.dotCN.message)).indexOf(messagediv);
		return {messagediv, pos};
	}
	
	addMessageToNotes (message, target, channel) {
		if (!message || !target) return;
		let {messagediv, pos} = this.getMessageAndPos(target);
		if (!messagediv || pos == -1) return;
		channel = channel ? channel : this.ChannelUtils.getChannel(message.channel_id);
		let guild = this.GuildUtils.getGuild(channel.guild_id) || {};
		let channelID = channel.id;
		let serverID = guild.id ? guild.id : "@me";
		let pins = BDFDB.loadAllData(this, "pins");
		pins[serverID] = pins[serverID] ? pins[serverID] : {}
		pins[serverID][channelID] = pins[serverID][channelID] ? pins[serverID][channelID] : {}
		let messageID = message.id;
		let channelname = channel.name;
		if (!channelname && channel.recipients.length > 0) {
			for (let dmmemberID of channel.recipients) {
				channelname = channelname ? channelname + ", @" : channelname;
				channelname = channelname + this.UserUtils.getUser(dmmemberID).username;
			}
		}
		let markup = messagediv.querySelector(BDFDB.dotCN.messagemarkup).cloneNode(true);
		markup.querySelectorAll(BDFDB.dotCN.messageheadercompact).forEach(h2 => {h2.remove();});
		pins[serverID][channelID][messageID + "_" + pos] = {
			"serverID": serverID,
			"serverName": guild.name ? guild.name : "Direct Messages",
			"channelID": channelID,
			"channelName": channelname,
			"dmUserID": channel.type == 1 ? channel.recipients[0] : null,
			"id": messageID,
			"pos": pos,
			"timestamp": message.timestamp._i.getTime(),
			"addedat": new Date().getTime(),
			"color": message.colorString,
			"authorID": message.author.id,
			"authorName": message.author.username,
			"avatar": BDFDB.getUserAvatar(message.author.id),
			"content": message.content,
			"markup": markup.innerHTML,
			"accessory": messagediv.querySelector(BDFDB.dotCN.messageaccessory).innerHTML
		};
		BDFDB.saveAllData(pins, this, "pins");
		BDFDB.showToast(this.labels.toast_noteadd_text, {type:"success"});
	}
	
	addNotes (notespopout) {
		BDFDB.removeEles(".popout-personalpins-notes " + BDFDB.dotCN.messagegroupwrapper, ".popout-personalpins-notes " + BDFDB.dotCN.messagespopoutchannelseparator);
		let channelObj = BDFDB.getSelectedChannel();
		if (channelObj) {
			let serverID = channelObj.guild_id ? channelObj.guild_id : "@me";
			let channelID = channelObj.id;
			let pins = BDFDB.loadAllData(this, "pins");
			if (!BDFDB.isObjectEmpty(pins)) {
				let container = notespopout.querySelector(BDFDB.dotCN.messagespopout);
				let placeholder = notespopout.querySelector(BDFDB.dotCN.messagespopoutemptyplaceholder);
				placeholder.querySelector(BDFDB.dotCN.messagespopoutimage).style.setProperty("background-image", `url(${BDFDB.getDiscordTheme() == BDFDB.disCN.themelight ? "/assets/03c7541028afafafd1a9f6a81cb7f149.svg" : "/assets/6793e022dc1b065b21f12d6df02f91bd.svg"})`);
				let messages = {};
				switch (notespopout.querySelector(".tab.selected").getAttribute("tab")) {
					case "channel":
						messages = pins[serverID] && pins[serverID][channelID] ? pins[serverID][channelID] : {};
						break;
					case "server":
						if (pins[serverID]) for (let channel in pins[serverID]) messages = Object.assign(messages, pins[serverID][channel]); 
						break;
					case "allservers":
						for (let server in pins) if (pins[server]) for (let channel in pins[server]) messages = Object.assign(messages, pins[server][channel]); 
						break;
				}
				let messageArray = [];
				for (let id in messages) {
					messageArray.push(messages[id]);
				}
				BDFDB.sortArrayByKey(messageArray, notespopout.querySelector(BDFDB.dotCN.quickselectvalue).getAttribute("option"));
				for (let messageData of messageArray) {
					let server = this.GuildUtils.getGuild(messageData.serverID) || {};
					let channel = this.ChannelUtils.getChannel(messageData.channelID) || {};
					let user = this.UserUtils.getUser(messageData.authorID) || {};
					let member = this.MemberUtils.getMember(messageData.serverID, messageData.authorID) || {};
					let date = new Date(messageData.timestamp);
					let message = $(this.messageMarkup)[0];
					let messagedivider = $(this.messageDividerMarkup)[0];
					container.insertBefore(message, container.firstChild);
					container.insertBefore(messagedivider, container.firstChild);
					let channelname = messagedivider.querySelector(BDFDB.dotCN.messagespopoutchannelname);
					channelname.innerText = (messageData.serverID == "@me" ? " @" : " #") + (channel.name || messageData.channelName);
					if (messageData.serverID != "@me" && BDFDB.isPluginEnabled("EditChannels")) {
						bdplugins.EditChannels.plugin.changeChannel2({id:messageData.channelID,name:messageData.channelName}, channelname);
					}
					else if (messageData.serverID == "@me" && BDFDB.isPluginEnabled("EditUsers")) {
						let dmUserID = channel && channel.type == 1 ? channel.recipients[0] : messageData.dmUserID;
						if (dmUserID) {
							bdplugins.EditUsers.plugin.changeName2({id:dmUserID,username:messageData.channelName}, channelname);
							channelname.innerText = "@" + channelname.innerText;
						}
					}
					let guildname = messagedivider.querySelector(BDFDB.dotCN.messagespopoutguildname);
					guildname.innerText = server.name || messageData.serverName;
					let avatar = message.querySelector(BDFDB.dotCN.avatarimage);
					avatar.style.setProperty("background-image", `url(${user.id ? BDFDB.getUserAvatar(user.id) : messageData.avatar})`);
					let username = message.querySelector(BDFDB.dotCN.messageusername);
					username.innerText = user.username || messageData.authorName;
					username.style.setProperty("color", member.colorString || messageData.color);
					if (BDFDB.isPluginEnabled("EditUsers")) {
						bdplugins.EditUsers.plugin.changeName({id:messageData.authorID,username:messageData.authorName}, username, messageData.serverID);
						if (user.id) bdplugins.EditUsers.plugin.changeAvatar({id:messageData.authorID,username:messageData.authorName}, avatar);
						bdplugins.EditUsers.plugin.addTag({id:messageData.authorID,username:messageData.authorName}, username.parentElement, " " + BDFDB.disCN.bottagnametag);
					}
					let timestamp = message.querySelector(BDFDB.dotCN.messagetimestampcozy);
					timestamp.innerText = date.toLocaleString(BDFDB.getDiscordLanguage().id);
					timestamp.setAttribute("datetime", date);
					if (BDFDB.isPluginEnabled("CompleteTimestamps")) bdplugins.CompleteTimestamps.plugin.changeTimestamp(timestamp);
					message.querySelector(BDFDB.dotCN.messagemarkup).innerHTML = messageData.markup.replace(`<span class="edited">`,`<span class="${BDFDB.disCN.messageedited}">`);
					message.querySelector(BDFDB.dotCN.messageaccessory).innerHTML = messageData.accessory;
					if (messageData.accessory) {
						let ytvideo = message.querySelector(BDFDB.dotCN.embed + " iframe[src*='https://www.youtube.com']");
						if (ytvideo) {
							let ytlink = ytvideo.parentElement.parentElement.querySelector(BDFDB.dotCN.embedtitle).href;
							let wrapper = ytvideo.parentElement;
							ytvideo.remove();
							require("request")(ytlink, (error, response, result) => {
								if (result) {
									wrapper.innerHTML = `<a class="${BDFDB.disCNS.imagewrapper + BDFDB.disCN.imagezoom}" href="" rel="noreferrer noopener" target="_blank" style="width: 400px; height: 225px;"><img alt="" src="${result.split('<link itemprop="thumbnailUrl" href="')[1].split('"')[0]}" style="width: 400px; height: 225px;"></a><div class="${BDFDB.disCNS.embedvideoactions + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex + BDFDB.disCNS.justifycenter + BDFDB.disCN.aligncenter}"><div class="${BDFDB.disCNS.embedvideoactionsinner + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex + BDFDB.disCNS.justifycenter + BDFDB.disCN.aligncenter}"><div class="${BDFDB.disCN.iconactionswrapper}"><div tabindex="0" class="${BDFDB.disCNS.iconwrapper + BDFDB.disCN.iconwrapperactive}" role="button"><svg name="Play" class="${BDFDB.disCNS.iconplay + BDFDB.disCN.icon}" width="16" height="16" viewBox="0 0 24 24"><polygon fill="currentColor" points="0 0 0 14 11 7" transform="translate(7 5)"></polygon></svg></div><a class="${BDFDB.disCNS.anchor + BDFDB.disCN.iconwrapper}" href="${ytlink}" rel="noreferrer noopener" target="_blank"><svg name="OpenExternal" class="${BDFDB.disCNS.iconexternalmargins + BDFDB.disCN.icon}" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" transform="translate(3.000000, 4.000000)" d="M16 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4v-2H2V4h14v10h-4v2h4c1.1 0 2-.9 2-2V2a2 2 0 0 0-2-2zM9 6l-4 4h3v6h2v-6h3L9 6z"></path></svg></a></div></div></div></div>`;
									$(wrapper).on("click." + this.getName(), BDFDB.dotCN.iconplay, (e) => {
										while (wrapper.firstChild) wrapper.firstChild.remove();
										let width = 400;
										let height = Math.round(width*(result.split('<meta itemprop="height" content="')[1].split('"')[0]/result.split('<meta itemprop="width" content="')[1].split('"')[0])); 
										$(`<iframe src="${result.split('<link itemprop="embedURL" href="')[1].split('"')[0]}?start=0&amp;autoplay=1&amp;auto_play=1" width="${width}" height="${height}" frameborder="0" allowfullscreen=""></iframe>`).appendTo(wrapper);
									});
								}
							});
						}
					}
					$(messagedivider)
						.on("click." + this.getName(), BDFDB.dotCN.messagespopoutchannelname, (e) => {
							if (!BDFDB.isObjectEmpty(channel)) {
								notespopout.remove();
								this.SelectChannelUtils.selectChannel(server.id, channel.id);
							}
							else BDFDB.shake();
						});
					$(message)
						.on("click." + this.getName(), BDFDB.dotCN.messagespopoutclosebutton, (e) => {
							messagedivider.remove();
							message.remove();
							this.removeNoteData(messageData, channel, messageData.pos);
							if (!container.querySelector(BDFDB.dotCN.messagegroup)) $(placeholder).show();
						})
						.on("click." + this.getName(), BDFDB.dotCN.messagespopoutjumpbutton + ".jump", (e) => {
							this.HistoryUtils.transitionTo(this.MainDiscord.Routes.MESSAGE(messageData.serverID, messageData.channelID, messageData.id));
						})
						.on("click." + this.getName(), BDFDB.dotCN.messagespopoutjumpbutton + ".copy", (e) => {
							let clipboard = require("electron").clipboard;
							if (messageData.content) clipboard.write({text: messageData.content});
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
				let searchstring = notespopout.querySelector(BDFDB.dotCN.searchbarinput).value.replace(/[<|>]/g, "");
				if (searchstring) for (let note of notespopout.querySelectorAll(BDFDB.dotCN.messagegroup)) {
					note.innerHTML = BDFDB.highlightText(note.innerHTML, searchstring);
					if (!note.querySelector(BDFDB.dotCN.highlight)) note.remove();
				}
				$(placeholder).toggle(notespopout.querySelectorAll(BDFDB.dotCN.messagegroup).length == 0);
			}
		}
	}
	
	getNoteData (message, channel, pos) {
		let pins = BDFDB.loadAllData(this, "pins");
		let guildid = channel.guild_id ? channel.guild_id : "@me";
		return pins[guildid] && pins[guildid][channel.id] && pins[guildid][channel.id][message.id + "_" + pos] ? pins[guildid][channel.id][message.id + "_" + pos] : null;
	}
	
	removeNoteData (message, channel, pos) {
		if (!message || !channel) return;
		let pins = BDFDB.loadAllData(this, "pins");
		let guildid = channel.guild_id ? channel.guild_id : "@me";
		delete pins[guildid][channel.id][message.id + "_" + pos];
		if (BDFDB.isObjectEmpty(pins[guildid][channel.id])) {
			delete pins[guildid][channel.id];
			if (BDFDB.isObjectEmpty(pins[guildid])) delete pins[guildid];
		}
		BDFDB.saveAllData(pins, this, "pins");
		BDFDB.showToast(this.labels.toast_noteremove_text, {type:"danger"});
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