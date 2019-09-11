//META{"name":"PersonalPins","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/PersonalPins","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/PersonalPins/PersonalPins.plugin.js"}*//

class PersonalPins {
	getName () {return "PersonalPins";}

	getDescription () {return "Similar to normal pins. Lets you save messages as notes for yourself.";}

	getVersion () {return "1.8.2";} 

	getAuthor () {return "DevilBro";}

	constructor () {
		this.changelog = {
			"fixed":[["Light Theme Update","Fixed bugs for the Light Theme Update, which broke 99% of my plugins"]]
		};

		this.labels = {};

		this.patchModules = {
			"HeaderBar":["componentDidMount","componentDidUpdate"],
			"HeaderBarContainer":["componentDidMount","componentDidUpdate"],
			"Message":"componentDidMount"
		};
	}

	initConstructor () {
		this.notesButtonMarkup =
			`<div class="${BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable} notes-button">
				<svg class="${BDFDB.disCN.channelheadericon}" name="Note" width="24" height="24" viewBox="-1 -1 23 23">
					<path fill="currentColor" d="M 4.618, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 s 0.573 -0.256, 0.573 -0.573 V 0.573 C 5.191, 0.256, 4.935, 0, 4.618, 0 z"/>
					<path fill="currentColor" d="M 8.053, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 s 0.573 -0.256, 0.573 -0.573 V 0.573 C 8.626, 0.256, 8.37, 0, 8.053, 0 z"/>
					<path fill="currentColor" d="M 11.489, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 c 0.316, 0, 0.573 -0.256, 0.573 -0.573 V 0.573 C 12.061, 0.256, 11.805, 0, 11.489, 0 z "/>
					<path fill="currentColor" d="M 14.924, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 c 0.316, 0, 0.573 -0.256, 0.573 -0.573 V 0.573 C 15.496, 0.256, 15.24, 0, 14.924, 0 z"/>
					<path fill="currentColor" d="M 16.641, 1.25 V 1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 V 1.25 C 2.236, 1.488, 1.756, 2.117, 1.756, 2.863 v 14.962 c 0, 0.947, 0.77, 1.718, 1.718, 1.718 h 12.595 c 0.947, 0, 1.718 -0.77, 1.718 -1.718 V 2.863 C 17.786, 2.117, 17.306, 1.488, 16.641, 1.25 z M 14.924, 16.679 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 c 0 -0.316, 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 C 15.496, 16.423, 15.24, 16.679, 14.924, 16.679 z M 14.924, 13.244 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 c 0 -0.316, 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 C 15.496, 12.988, 15.24, 13.244, 14.924, 13.244 z M 14.924, 9.733 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 s 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 S 15.24, 9.733, 14.924, 9.733 z M 14.924, 6.298 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 s 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 S 15.24, 6.298, 14.924, 6.298 z"/>
				</svg>
			</div>`;

		this.notesPopoutMarkup = 
			`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottomright + BDFDB.disCNS.popoutnoarrow + BDFDB.disCN.popoutnoshadow} popout-personalpins-notes BDFDB-modal" style="z-index: 1000; visibility: visible; left: 544.844px; top: 35.9896px; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div class="${BDFDB.disCNS.messagespopoutwrap + BDFDB.disCNS.recentmentionspopout + BDFDB.disCN.popoutthemedpopout}" style="max-height: 740px; width: 500px;">
					<div class="${BDFDB.disCNS.recentmentionsheader + BDFDB.disCNS.popoutheader + BDFDB.disCN.messagespopoutheader}" style="padding-bottom: 0;">
						<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.margintop8}" style="flex: 0 0 auto;">
							<div class="${BDFDB.disCNS.popouttitle + BDFDB.disCN.messagespopouttitle}">REPLACE_popout_note_text</div>
						</div>
						<div class="${BDFDB.disCN.tabbarheadercontainer}" style="flex: 0 0 auto;">
							<div class="${BDFDB.disCNS.tabbarheader + BDFDB.disCN.tabbartop}">
								<div tab="channel" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbarheaderitem}">REPLACE_popout_channel_text</div>
								<div tab="server" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbarheaderitem}">REPLACE_popout_server_text</div>
								<div tab="allservers" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbarheaderitem}">REPLACE_popout_allservers_text</div>
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
					<div class="${BDFDB.disCN.contextmenu} BDFDB-quickSelectPopout">
						<div class="${BDFDB.disCN.contextmenuitemgroup}">
							<div option="timestamp" class="${BDFDB.disCNS.contextmenuitem + BDFDB.disCN.contextmenuitemclickable}">REPLACE_popout_messagesort_text</div>
							<div option="addedat" class="${BDFDB.disCNS.contextmenuitem + BDFDB.disCN.contextmenuitemclickable}">REPLACE_popout_datesort_text</div>
						</div>
					</div>
				</div>
			</div>`;

		this.messageDividerMarkup = 
			`<div class="${BDFDB.disCN.messagespopoutchannelseparator}">
				<span tabindex="0" class="${BDFDB.disCN.messagespopoutchannelname}" role="button"></span>
				<span class="${BDFDB.disCN.messagespopoutguildname}"></span>
			</div>`;

		this.messageMarkup = 
			`<div class="${BDFDB.disCN.messagespopoutmessagegroupwrapper}">
				<div class="${BDFDB.disCN.messagespopoutmessagegroupwrapperoffsetcorrection}">
					<div class="${BDFDB.disCNS.messagespopoutcontainercozybounded + BDFDB.disCNS.messagegroup + BDFDB.disCN.messagegroupcozy}">
						<div class="${BDFDB.disCN.messagespopoutmessagegroupcozy}" aria-disabled="true">
							<div class="${BDFDB.disCN.messageheadercozy}">
								<div class="${BDFDB.disCN.messageavatar}" aria-hidden="true">
									<div class="${BDFDB.disCN.avatarwrapper}" role="img" aria-hidden="true" style="width: 40px; height: 40px;">
										<svg width="49" height="40" viewBox="0 0 49 40" class="${BDFDB.disCN.avatarmask}" aria-hidden="true">
											<foreignObject x="0" y="0" width="40" height="40" mask="url(#svg-mask-avatar-default)">
												<img src="" alt=" " class="${BDFDB.disCN.avatar}" aria-hidden="true">
											</foreignObject>
										</svg>
									</div>
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
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
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
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
					if (body) {
						libraryScript = document.createElement("script");
						libraryScript.setAttribute("id", "BDFDBLibraryScript");
						libraryScript.setAttribute("type", "text/javascript");
						libraryScript.setAttribute("date", performance.now());
						libraryScript.innerText = body;
						document.head.appendChild(libraryScript);
					}
					this.initialize();
				});
			}, 15000);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
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
	}

	onMessageContextMenu (instance, menu, returnvalue) {
		if (instance.props && instance.props.message && instance.props.channel && instance.props.target && !menu.querySelector(`${this.name}-contextMenuItem`)) {
			let {messagediv, pos} = this.getMessageAndPos(instance.props.target);
			if (!messagediv || pos == -1) return;
			let note = this.getNoteData(instance.props.message, instance.props.target, instance.props.channel);
			let [children, index] = BDFDB.getContextMenuGroupAndIndex(returnvalue, "MessagePinItem");
			const pinUnpinItem = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
				label: this.labels[note ? "context_unpinoption_text" : "context_pinoption_text"],
				hint: BDFDB.isPluginEnabled("MessageUtilities") ? window.bdplugins.MessageUtilities.plugin.getActiveShortcutString("__Note_Message") : null,
				className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-${note ? "unpin" : "pin"}-contextMenuItem`,
				action: e => {
					BDFDB.closeContextMenu(menu);
					this.addMessageToNotes(instance.props.message, instance.props.target, instance.props.channel);
				}
			});
			if (index > -1) children.splice(index, 0, pinUnpinItem);
			else children.push(pinUnpinItem);
			if (note) {
				let newmarkup = this.getMarkup(messagediv).innerHTML;
				let newaccessory = messagediv.querySelector(BDFDB.dotCN.messageaccessory).innerHTML;
				if (note.markup != newmarkup || note.accessory != newaccessory) {
					const updateItem = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
						label: this.labels.context_updateoption_text,
						className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-update-contextMenuItem`,
						action: e => {
							BDFDB.closeContextMenu(menu);
							this.updateNoteData(note, newmarkup, newaccessory);
						}
					});
					if (index > -1) children.splice(index, 0, updateItem);
					else children.push(updateItem);
				}	
			}
		}
	}

	onMessageOptionPopout (instance, popout, returnvalue) {
		if (instance.props.message && instance.props.channel && instance.props.target && !popout.querySelector(`${this.name}-popoutMenuItem`)) {
			let {messagediv, pos} = this.getMessageAndPos(instance.props.target);
			if (!messagediv || pos == -1) return;
			let note = this.getNoteData(instance.props.message, instance.props.target, instance.props.channel);
			let [children, index] = BDFDB.getContextMenuGroupAndIndex(returnvalue, [BDFDB.LanguageStrings.PIN, BDFDB.LanguageStrings.UNPIN]);
			const pinUnpinItem = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
				label: this.labels[note ? "context_unpinoption_text" : "popout_pinoption_text"],
				className: `${BDFDB.disCN.optionpopoutitem} BDFDB-popoutMenuItem ${this.name}-popoutMenuItem ${this.name}-${note ? "unpin" : "pin"}-popoutMenuItem`,
				action: e => {
					this.addMessageToNotes(instance.props.message, instance.props.target, instance.props.channel);
					instance.props.onClose();
				}
			});
			children.splice(index + 1, 0, pinUnpinItem);
			if (note) {
				let newmarkup = this.getMarkup(messagediv).innerHTML;
				let newaccessory = messagediv.querySelector(BDFDB.dotCN.messageaccessory).innerHTML;
				if (note.markup != newmarkup || note.accessory != newaccessory) {
					const updateItem = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
						label: this.labels.context_updateoption_text,
						className: `${BDFDB.disCN.optionpopoutitem} BDFDB-popoutMenuItem ${this.name}-popoutMenuItem ${this.name}-update-popoutMenuItem`,
						action: e => {
							this.updateNoteData(note, newmarkup, newaccessory);
							instance.props.onClose();
						}
					});
					children.splice(index + 1, 0, updateItem);
				}	
			}
		}
	}

	processHeaderBarContainer (instance, wrapper, returnvalue) {
		this.processHeaderBar(instance, wrapper);
	}

	processHeaderBar (instance, wrapper, returnvalue) {
		if (wrapper.querySelector(".notes-button")) return;
		let search = wrapper.querySelector(BDFDB.dotCN.channelheadersearch);
		if (!search) return;
		let notesbutton = BDFDB.htmlToElement(this.notesButtonMarkup);
		search.parentElement.insertBefore(notesbutton, search);
		let icon = notesbutton.querySelector(BDFDB.dotCN.channelheadericon);
		icon.addEventListener("click", () => {
			this.openNotesPopout(icon.parentElement);
		});
		icon.addEventListener("mouseenter", () => {
			BDFDB.createTooltip(this.labels.popout_note_text, icon, {type:"bottom",selector:"note-button-tooltip"});
		});
	}

	processMessage (instance, wrapper, returnvalue) {
		if (instance.props && typeof instance.props.renderButtons == "function" && !wrapper.querySelector(BDFDB.dotCN.optionpopoutbutton) && BDFDB.getReactValue(instance, "props.message.author.id") != 1) {
			let buttonwrap = wrapper.querySelector(BDFDB.dotCN.messagebuttoncontainer);
			if (buttonwrap) {
				let optionPopoutButton = BDFDB.htmlToElement(`<div tabindex="0" class="${BDFDB.disCN.optionpopoutbutton}" aria-label="More Options" role="button"><svg name="OverflowMenu" class="${BDFDB.disCN.optionpopoutbuttonicon}" aria-hidden="false" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0z"></path><path fill="currentColor" d="M12 16c1.1045695 0 2 .8954305 2 2s-.8954305 2-2 2-2-.8954305-2-2 .8954305-2 2-2zm0-6c1.1045695 0 2 .8954305 2 2s-.8954305 2-2 2-2-.8954305-2-2 .8954305-2 2-2zm0-6c1.1045695 0 2 .8954305 2 2s-.8954305 2-2 2-2-.8954305-2-2 .8954305-2 2-2z"></path></g></svg></div>`);
				optionPopoutButton.addEventListener("click", () => {BDFDB.createMessageOptionPopout(optionPopoutButton);});
				buttonwrap.appendChild(optionPopoutButton);
			}
		}
	} 

	openNotesPopout (button) {
		let container = document.querySelector(BDFDB.dotCN.popouts);
		if (!container || BDFDB.containsClass(button, BDFDB.disCN.channelheadericonselected)) return;
		BDFDB.addClass(button, BDFDB.disCN.channelheadericonselected);
		let notespopout = BDFDB.htmlToElement(this.notesPopoutMarkup);
		notespopout.querySelector(BDFDB.dotCN.popoutheader).firstElementChild.appendChild(BDFDB.createSearchBar("small"));
		container.appendChild(notespopout);
		BDFDB.initElements(notespopout, this);
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
				setTimeout(() => {BDFDB.removeClass(button, BDFDB.disCN.channelheadericonselected);},300);
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
				for (let noteData of noteArray) this.appendNote(notespopout, container, noteData, placeholder);
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

	appendNote (notespopout, container, noteData, placeholder) {
		if (!container || !noteData) return;
		let server = BDFDB.LibraryModules.GuildStore.getGuild(noteData.guild_id) || {};
		let channel = BDFDB.LibraryModules.ChannelStore.getChannel(noteData.channel_id) || {};
		let user = BDFDB.LibraryModules.UserStore.getUser(noteData.author_id) || {};
		let member = BDFDB.LibraryModules.MemberStore.getMember(noteData.guild_id, noteData.author_id) || {};
		let date = new Date(noteData.timestamp);
		let message = BDFDB.htmlToElement(this.messageMarkup);
		let messagedivider = BDFDB.htmlToElement(this.messageDividerMarkup);
		container.insertBefore(message, container.firstChild);
		container.insertBefore(messagedivider, container.firstChild);
		let channelname = messagedivider.querySelector(BDFDB.dotCN.messagespopoutchannelname);
		channelname.innerText = (noteData.guild_id == "@me" ? " @" : " #") + (channel.name || noteData.channel_name);
		if (noteData.guild_id != "@me" && BDFDB.isPluginEnabled("EditChannels")) {
			window.bdplugins.EditChannels.plugin.changeChannel2({id:noteData.channel_id,name:noteData.channel_name}, channelname);
		}
		else if (noteData.guild_id == "@me" && BDFDB.isPluginEnabled("EditUsers")) {
			let dmuser_id = channel && channel.type == 1 ? channel.recipients[0] : noteData.dmuser_id;
			if (dmuser_id) {
				window.bdplugins.EditUsers.plugin.changeName2({id:dmuser_id,username:noteData.channel_name}, channelname);
				if (channelname.innerText.indexOf("@") != 0) channelname.innerText = "@" + channelname.innerText;
			}
		}
		let guildname = messagedivider.querySelector(BDFDB.dotCN.messagespopoutguildname);
		guildname.innerText = server.name || noteData.guild_name;
		let avatar = message.querySelector(BDFDB.dotCN.avatar);
		avatar.setAttribute("src", `${user.id ? BDFDB.getUserAvatar(user.id) : noteData.avatar}`);
		let username = message.querySelector(BDFDB.dotCN.messageusername);
		username.innerText = user.username || noteData.author_name;
		username.style.setProperty("color", member.colorString || noteData.color);
		if (BDFDB.isPluginEnabled("EditUsers")) {
			window.bdplugins.EditUsers.plugin.changeName({id:noteData.author_id,username:noteData.author_name}, username, noteData.guild_id);
			if (user.id) window.bdplugins.EditUsers.plugin.changeAvatar({id:noteData.author_id,username:noteData.author_name}, avatar);
			window.bdplugins.EditUsers.plugin.addTag({id:noteData.author_id,username:noteData.author_name}, username.parentElement, " " + BDFDB.disCN.bottagnametag);
		}
		let timestamp = message.querySelector(BDFDB.dotCN.messagetimestampcozy);
		timestamp.innerText = date.toLocaleString(BDFDB.getDiscordLanguage().id);
		timestamp.setAttribute("datetime", date);
		if (BDFDB.isPluginEnabled("CompleteTimestamps") && BDFDB.loadData("showInChat", "CompleteTimestamps", "settings")) {
			window.bdplugins.CompleteTimestamps.plugin.changeTimestamp(timestamp);
		}
		message.querySelector(BDFDB.dotCN.messagemarkup).innerHTML = noteData.markup.replace(`<span class="edited">`,`<span class="${BDFDB.disCN.messageedited}">`);
		message.querySelector(BDFDB.dotCN.messageaccessory).innerHTML = noteData.accessory;
		if (noteData.accessory) {
			BDFDB.addChildEventListener(message, "click", BDFDB.dotCN.iconplay, e => {this.startYoutubeVideo(e.currentTarget);});
			let ytvideo = message.querySelector(BDFDB.dotCN.embed + " iframe[src*='https://www.youtube.com']");
			if (ytvideo) {
				let ytlink = ytvideo.parentElement.parentElement.querySelector(BDFDB.dotCN.embedtitle).href;
				let wrapper = ytvideo.parentElement;
				ytvideo.remove();
				BDFDB.LibraryRequires.request(ytlink, (error, response, result) => {
					if (result) {
						wrapper.innerHTML = `<div class="${BDFDB.disCNS.imagewrapper + BDFDB.disCNS.imageclickable + BDFDB.disCN.embedvideoimagecomponent}" style="width: 400px; height: 225px;"><img alt="" src="${result.split('<link itemprop="thumbnailUrl" href="')[1].split('"')[0]}" style="width: 400px; height: 225px;"></div><div class="${BDFDB.disCN.embedvideoactions}"><div class="${BDFDB.disCN.embedcentercontent}"><div class="${BDFDB.disCN.iconactionswrapper}"><div tabindex="0" class="${BDFDB.disCNS.iconwrapper + BDFDB.disCN.iconwrapperactive}" role="button"><svg name="Play" class="${BDFDB.disCNS.iconplay + BDFDB.disCN.icon}" width="16" height="16" viewBox="0 0 24 24"><polygon fill="currentColor" points="0 0 0 14 11 7" transform="translate(7 5)"></polygon></svg></div><a class="${BDFDB.disCNS.anchor + BDFDB.disCNS.anchorunderlineonhover + BDFDB.disCNS.iconwrapper + BDFDB.disCN.iconwrapperactive}" href="${ytlink}" rel="noreferrer noopener" target="_blank"><svg name="OpenExternal" class="${BDFDB.disCNS.iconexternalmargins + BDFDB.disCN.icon}" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" transform="translate(3.000000, 4.000000)" d="M16 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4v-2H2V4h14v10h-4v2h4c1.1 0 2-.9 2-2V2a2 2 0 0 0-2-2zM9 6l-4 4h3v6h2v-6h3L9 6z"></path></svg></a></div></div></div>`;
						wrapper.querySelector(BDFDB.dotCN.iconplay).addEventListener("click", e => {this.startYoutubeVideo(e.currentTarget);});
					}
				});
			}
		}
		messagedivider.querySelector(BDFDB.dotCN.messagespopoutchannelname).addEventListener("click", e => {
			if (!BDFDB.isObjectEmpty(channel)) {
				notespopout.remove();
				BDFDB.LibraryModules.SelectChannelUtils.selectChannel(server.id, channel.id);
			}
			else BDFDB.shake();
		});
		message.querySelector(BDFDB.dotCN.messagespopoutclosebutton).addEventListener("click", e => {
			BDFDB.removeEles(messagedivider, message);
			this.removeNoteData(noteData);
			BDFDB.toggleEles(placeholder, container.firstElementChild == placeholder);
		});
		message.querySelector(BDFDB.dotCN.messagespopoutjumpbutton + ".jump").addEventListener("click", e => {
			BDFDB.LibraryModules.HistoryUtils.transitionTo(BDFDB.DiscordConstants.Routes.CHANNEL(noteData.guild_id, noteData.channel_id, noteData.id));
		});
		message.querySelector(BDFDB.dotCN.messagespopoutjumpbutton + ".copy").addEventListener("click", e => {
			if (noteData.content) {
				let text = noteData.content;
				for (let file of message.querySelectorAll(BDFDB.dotCN.filenamelink)) text += ("\n" + file.href);
				BDFDB.LibraryRequires.electron.clipboard.write({text});
			}
			else {
				let image = message.querySelector(BDFDB.dotCNS.imagewrapper + "img");
				if (image) BDFDB.LibraryRequires.request({url: image.src, encoding: null}, (error, response, buffer) => {
					if (buffer) {
						if (BDFDB.LibraryRequires.process.platform === "win32" || BDFDB.LibraryRequires.process.platform === "darwin") {
							BDFDB.LibraryRequires.electron.clipboard.write({image: BDFDB.LibraryRequires.electron.nativeImage.createFromBuffer(buffer)});
						}
						else {
							let file = BDFDB.LibraryRequires.path.join(BDFDB.LibraryRequires.process.env["HOME"], "personalpinstemp.png");
							BDFDB.LibraryRequires.fs.writeFileSync(file, buffer, {encoding: null});
							BDFDB.LibraryRequires.electron.clipboard.write({image: file});
							BDFDB.LibraryRequires.fs.unlinkSync(file);
						}
					}
				});
			}
		});
	}

	startYoutubeVideo (button) {
		let embedwrapper = BDFDB.getParentEle(BDFDB.dotCN.embedvideo, button);
		let ytlink = embedwrapper.parentElement.querySelector(BDFDB.dotCN.embedtitle).href;
		BDFDB.LibraryRequires.request(ytlink, (error, response, result) => {
			if (result && response.headers && typeof response.headers.server == "string" && response.headers.server.toUpperCase() == "YOUTUBE FRONTEND PROXY") {
				while (embedwrapper.firstChild) embedwrapper.firstChild.remove();
				let width = 400;
				let height = Math.round(width*(result.split('<meta itemprop="height" content="')[1].split('"')[0]/result.split('<meta itemprop="width" content="')[1].split('"')[0]));
				embedwrapper.appendChild(BDFDB.htmlToElement(`<iframe src="${result.split('<link itemprop="embedURL" href="')[1].split('"')[0]}?start=0&amp;autoplay=1&amp;auto_play=1" width="${width}" height="${height}" frameborder="0" allowfullscreen=""></iframe>`));
			}
		});
	}

	addMessageToNotes (message, target, channel) {
		if (!message || !target) return;
		let {messagediv, pos} = this.getMessageAndPos(target);
		if (!messagediv || pos == -1) return;
		let pins = BDFDB.loadAllData(this, "pins");
		let guild = BDFDB.LibraryModules.GuildStore.getGuild(channel.guild_id) || {};
		let guild_id = guild.id ? guild.id : "@me";
		channel = channel ? channel : BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
		pins[guild_id] = pins[guild_id] || {}
		pins[guild_id][channel.id] = pins[guild_id][channel.id] || {}
		if (!pins[guild_id][channel.id][message.id + "_" + pos]) {
			for (let spoiler of messagediv.querySelectorAll(BDFDB.dotCN.spoilerhidden)) spoiler.click();
			let channelname = channel.name;
			if (!channelname && channel.recipients.length > 0) {
				for (let dmuser_id of channel.recipients) {
					channelname = channelname ? channelname + ", @" : channelname;
					channelname = channelname + BDFDB.LibraryModules.UserStore.getUser(dmuser_id).username;
				}
			}
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
				"markup": this.getMarkup(messagediv).innerHTML,
				"accessory": messagediv.querySelector(BDFDB.dotCN.messageaccessory).innerHTML
			});
			BDFDB.saveAllData(pins, this, "pins");
			BDFDB.showToast(this.labels.toast_noteadd_text, {type:"success"});
		}
		else this.removeNoteData(pins[guild_id][channel.id][message.id + "_" + pos]);
	}

	updateNoteData (note, markup, accessory) {
		let pins = BDFDB.loadAllData(this, "pins");
		pins[note.guild_id][note.channel_id][note.id + "_" + note.pos].markup = markup;
		pins[note.guild_id][note.channel_id][note.id + "_" + note.pos].accessory = accessory;
		pins[note.guild_id][note.channel_id][note.id + "_" + note.pos] = BDFDB.sortObject(pins[note.guild_id][note.channel_id][note.id + "_" + note.pos]);
		BDFDB.saveAllData(pins, this, "pins");
		BDFDB.showToast(this.labels.toast_noteupdate_text, {type:"info"});
	}

	getMarkup (messagediv) {
		let markup = messagediv.querySelector(BDFDB.dotCN.messagemarkup).cloneNode(true);
		markup.querySelectorAll(BDFDB.dotCN.messageheadercompact).forEach(h2 => {h2.remove();});
		return markup;
	}

	getNoteData (message, target, channel) {
		if (!message || !target) return;
		let {messagediv, pos} = this.getMessageAndPos(target);
		if (!messagediv || pos == -1) return;
		channel = channel ? channel : BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
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
		let messagediv = BDFDB.getParentEle(BDFDB.dotCN.messagegroup + "> [aria-disabled]", target);
		let pos = messagediv ? Array.from(messagediv.parentElement.childNodes).filter(n => n.nodeType != Node.TEXT_NODE).indexOf(messagediv) : -1;
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
					context_updateoption_text:		"Ažuriraj bilješku",
					context_unpinoption_text:		"Uklonite bilješku",
					popout_pinoption_text:			"Bilješka",
					toast_noteadd_text:				"Poruka dodana u bilježnicu.",
					toast_noteupdate_text:			"Poruka je ažurirana u bilježnici.",
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
					context_updateoption_text:		"Opdater note",
					context_unpinoption_text:		"Fjern note",
					popout_pinoption_text:			"Noter",
					toast_noteadd_text:				"Meddelelse tilføjet til notesbog.",
					toast_noteupdate_text:			"Meddelelse opdateret i den notesbog.",
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
					context_updateoption_text:		"Notiz aktualisieren",
					context_unpinoption_text:		"Notiz entfernen",
					popout_pinoption_text:			"Notieren",
					toast_noteadd_text:				"Nachricht zum Notizbuch hinzugefügt.",
					toast_noteupdate_text:			"Nachricht im Notizbuch aktualisiert.",
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
					context_updateoption_text:		"Actualiza la nota",
					context_unpinoption_text:		"Eliminar la nota",
					popout_pinoption_text:			"Anotar",
					toast_noteadd_text:				"Mensaje agregado al cuaderno.",
					toast_noteupdate_text:			"Mensaje actualizado en el cuaderno.",
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
					context_updateoption_text:		"Mettre à jour la note",
					context_unpinoption_text:		"Enlevez la note",
					popout_pinoption_text:			"Noter",
					toast_noteadd_text:				"Message ajouté au cahier.",
					toast_noteupdate_text:			"Message mis à jour dans le cahier.",
					toast_noteremove_text:			"Message supprimé du cahier."
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
					context_updateoption_text:		"Aggiorna la nota",
					context_unpinoption_text:		"Rimuovi la nota",
					popout_pinoption_text:			"Annotare",
					toast_noteadd_text:				"Messaggio aggiunto al blocco note.",
					toast_noteupdate_text:			"Messaggio aggiornato nel blocco note.",
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
					context_updateoption_text:		"Update de notitie",
					context_unpinoption_text:		"Verwijder de notitie",
					popout_pinoption_text:			"Noteer",
					toast_noteadd_text:				"Bericht toegevoegd aan notitieblok.",
					toast_noteupdate_text:			"Bericht bijgewerkt in het notitieblok.",
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
					context_updateoption_text:		"Oppdater notatet",
					context_unpinoption_text:		"Fjern notatet",
					popout_pinoption_text:			"Notere",
					toast_noteadd_text:				"Melding lagt til i notisboken.",
					toast_noteupdate_text:			"Melding oppdatert i notisbok.",
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
					context_updateoption_text:		"Zaktualizuj notatkę",
					context_unpinoption_text:		"Usuń notatkę",
					popout_pinoption_text:			"Notuj",
					toast_noteadd_text:				"Wiadomość została dodana do notatnika.",
					toast_noteupdate_text:			"Wiadomość zaktualizowana w notatniku.",
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
					context_updateoption_text:		"Atualize a nota",
					context_unpinoption_text:		"Remova a nota",
					popout_pinoption_text:			"Anotar",
					toast_noteadd_text:				"Mensagem adicionada ao caderno.",
					toast_noteupdate_text:			"Mensagem atualizada no caderno.",
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
					context_updateoption_text:		"Päivitä muistiinpano",
					context_unpinoption_text:		"Poista muistiinpano",
					popout_pinoption_text:			"Huomaa",
					toast_noteadd_text:				"Viesti lisätty muistikirjaan.",
					toast_noteupdate_text:			"Viesti päivitetty muistikirjaan.",
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
					context_updateoption_text:		"Uppdatera noten",
					context_unpinoption_text:		"Ta bort noten",
					popout_pinoption_text:			"Anteckna",
					toast_noteadd_text:				"Meddelandet läggs till i anteckningsboken.",
					toast_noteupdate_text:			"Meddelandet uppdateras i anteckningsboken.",
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
					context_updateoption_text:		"Notu güncelle",
					context_unpinoption_text:		"Notu kaldırmak",
					popout_pinoption_text:			"Not almak",
					toast_noteadd_text:				"Mesaj not defteri'ya eklendi.",
					toast_noteupdate_text:			"Mesaj defterde güncellendi.",
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
					context_updateoption_text:		"Aktualizujte poznámku",
					context_unpinoption_text:		"Odstraňte poznámku",
					popout_pinoption_text:			"Poznámka dolů",
					toast_noteadd_text:				"Zpráva byla přidána do notebooku.",
					toast_noteupdate_text:			"Zpráva byla v notebooku aktualizována.",
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
					context_updateoption_text:		"Актуализирайте бележката",
					context_unpinoption_text:		"Премахнете бележката",
					popout_pinoption_text:			"Oтбележете",
					toast_noteadd_text:				"Съобщението бе добавено към бележника.",
					toast_noteupdate_text:			"Съобщението е актуализирано в бележника.",
					toast_noteremove_text:			"Съобщението е премахнато от преносимия бележника."
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
					context_updateoption_text:		"Обновить заметку",
					context_unpinoption_text:		"Удалить заметку",
					popout_pinoption_text:			"Записывать",
					toast_noteadd_text:				"Сообщение добавлено в блокнот.",
					toast_noteupdate_text:			"Сообщение обновлено в записной блокнот.",
					toast_noteremove_text:			"Сообщение удалено из записной блокнот."
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
					context_updateoption_text:		"Оновіть нотатку",
					context_unpinoption_text:		"Видаліть нотатку",
					popout_pinoption_text:			"Занотуйте",
					toast_noteadd_text:				"Повідомлення додається до ноутбука.",
					toast_noteupdate_text:			"Повідомлення оновлено в ноутбука.",
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
					context_updateoption_text:		"メモを更新する",
					context_unpinoption_text:		"メモを削除",
					popout_pinoption_text:			"書き留める",
					toast_noteadd_text:				"ノートブックにメッセージが追加されました.",
					toast_noteupdate_text:			"ノートブックで更新されたメッセージ.",
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
					context_updateoption_text:		"更新說明",
					context_unpinoption_text:		"刪除備註",
					popout_pinoption_text:			"記下",
					toast_noteadd_text:				"消息添加到筆記本.",
					toast_noteupdate_text:			"消息在筆記本中更新.",
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
					context_updateoption_text:		"메모 업데이트",
					context_unpinoption_text:		"메모 삭제",
					popout_pinoption_text:			"메모하다",
					toast_noteadd_text:				"노트북에 메시지 추가됨.",
					toast_noteupdate_text:			"노트북에서 메시지가 업데이트되었습니다.",
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
					context_updateoption_text:		"Update Note",
					context_unpinoption_text:		"Remove Note",
					popout_pinoption_text:			"Note",
					toast_noteadd_text:				"Message added to notebook.",
					toast_noteupdate_text:			"Message updated in the notebook.",
					toast_noteremove_text:			"Message removed from notebook."
				};
		}
	}
}