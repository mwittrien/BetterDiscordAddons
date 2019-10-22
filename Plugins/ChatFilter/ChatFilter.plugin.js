//META{"name":"ChatFilter","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ChatFilter","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ChatFilter/ChatFilter.plugin.js"}*//

class ChatFilter {
	getName () {return "ChatFilter";}

	getVersion () {return "3.3.5";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows the user to censor words or block complete messages based on words in the chatwindow.";}

	constructor () {
		this.changelog = {
			"fixed":[["Light Theme Update","Fixed bugs for the Light Theme Update, which broke 99% of my plugins"]]
		};

		this.patchModules = {
			"Message":["componentDidMount","componentDidUpdate"],
			"StandardSidebarView":"componentWillUnmount"
		};
	}

	initConstructor () {
		this.css = ` 
			${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messageaccessory}.blocked:not(.revealed),
			${BDFDB.dotCNS.messagegroup + BDFDB.dotCN.messagemarkup}.blocked:not(.revealed) {
				font-weight: bold;
				font-style: italic;
			}`;

		this.defaults = {
			configs: {
				empty: 		{value:false,		description:"Allows the replacevalue to be empty (ignoring the default)"},
				case: 		{value:false,		description:"Handle the wordvalue case sensitive"},
				exact: 		{value:true,		description:"Handle the wordvalue as an exact word and not as part of a word"}
			},
			replaces: {
				blocked: 	{value:"~~BLOCKED~~",	title:"Block:",		description:"Default Replace Word for blocked Messages:"},
				censored:	{value:"$!%&%!&",		title:"Censor:",	description:"Default Replace Word for censored Messages:"}
			},
			settings: {
				addContextMenu:			{value:true, 	inner:false,	description:"Add a ContextMenu entry to faster add new blocked/censored Words:"},
				showMessageOnClick: 	{value:{blocked:true, censored:true},	enabled:{blocked:true, censored:true},	inner:true,	description:"Show original Message on Click:"},
				hideMessage:			{value:{blocked:false, censored:false},	enabled:{blocked:true, censored:false},	inner:true,	description:"Completely hide targeted Messages:"}
			}
		};

		this.chatfilterAddModalMarkup =
			`<span class="${this.name}-modal BDFDB-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.defaultcolor + BDFDB.disCN.h4defaultmargin}">Add to ChatFilter</h4>
									<div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.titlesize12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div>
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
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner}">
									<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;">
										<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Block/Censor:</h3>
										<input action="add" type="text" placeholder="Wordvalue" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.titlesize16} wordInputs" id="input-wordvalue" style="flex: 1 1 auto;">
									</div>
									<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;">
										<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">With:</h3>
										<input action="add" type="text" placeholder="Replacevalue" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.titlesize16} wordInputs" id="input-replacevalue" style="flex: 1 1 auto;">
									</div>
									<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
										<h3 class="${BDFDB.disCNS.flex2 + BDFDB.disCNS.justifystart + BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Translator:</h3>
										<h3 class="${BDFDB.disCNS.flex2 + BDFDB.disCNS.justifystart + BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Use as Blockword</h3>
										<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCNS.switchthemedefault + BDFDB.disCN.switchvalueunchecked}" style="flex: 0 0 auto;">
											<input type="checkbox" id="input-choiceblockcensor" value="choiceblockcensor" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}">
										</div>
										<h3 class="${BDFDB.disCNS.flex2 + BDFDB.disCNS.justifyend + BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Use as Censorword</h3>
									</div>
									${Object.keys(this.defaults.configs).map((key, i) => 
									`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
										<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.configs[key].description}</h3>
										<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" id="input-config${key}" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${(this.defaults.configs[key].value ? ' checked' : '')}></div>
									</div>`).join('')}
								</div>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontalreverse + BDFDB.disCNS.horizontalreverse2 + BDFDB.disCNS.directionrowreverse + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalfooter}">
								<button type="button" class="btn-close btn-add ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}"></div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var replaces = BDFDB.DataUtils.get(this, "replaces");
		var settings = BDFDB.DataUtils.get(this, "settings");
		var settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.titlesize18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			if (!this.defaults.settings[key].inner) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let rtype in replaces) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto; min-width:55px;">${this.defaults.replaces[rtype].title}</h3><input rtype="${rtype}" action="add" type="text" placeholder="Wordvalue" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.titlesize16} wordInputs" id="input-${rtype}-wordvalue" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">With:</h3><input rtype="${rtype}" action="add" type="text" placeholder="Replacevalue" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.titlesize16} wordInputs" id="input-${rtype}-replacevalue" style="flex: 1 1 auto;"><button rtype="${rtype}" action="add" type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-add btn-addword" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div>`;
			for (let key in settings) {
				if (this.defaults.settings[key].inner && this.defaults.settings[key].enabled[rtype]) settingshtml += `<div value="${key}" class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key} ${rtype}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key][rtype] ? " checked" : ""}></div></div>`;
			}
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto; min-width: 320px;">${this.defaults.replaces[rtype].description}</h3><input rtype="${rtype}" type="text" placeholder="${this.defaults.replaces[rtype].value}" value="${replaces[rtype]}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.titlesize16} defaultInputs" id="input-${rtype}-defaultvalue" style="flex: 1 1 auto;"></div>`;
			settingshtml += `<div class="${BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto; max-width: ${560 - (Object.keys(this.defaults.configs).length * 33)}px;">List of ${rtype} Words:</h3><div class="${BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifycenter + BDFDB.disCNS.alignend + BDFDB.disCN.nowrap}" style="flex: 1 1 auto; max-width: ${Object.keys(this.defaults.configs).length * 34}px;">`;
			for (let config in this.defaults.configs) {
				settingshtml += `<div class="${BDFDB.disCNS.margintop8 +  BDFDB.disCNS.tableheadersize + BDFDB.disCNS.titlesize10 + BDFDB.disCNS.primary + BDFDB.disCN.weightbold}" style="flex: 1 1 auto; width: 34px !important; text-align: center;">${config.toUpperCase()}</div>`;
			}
			settingshtml += `</div></div><div class="BDFDB-settings-inner-list ${rtype}-list">`;
			for (let word in this.words[rtype]) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis}" style="flex: 1 1 auto;">${BDFDB.encodeToHTML(word)} (${BDFDB.encodeToHTML(this.words[rtype][word].replace)})</div>`
				for (let config in this.defaults.configs) {
					settingshtml += `<div class="${BDFDB.disCNS.checkboxcontainer + BDFDB.disCN.marginreset}" style="flex: 0 0 auto;"><label class="${BDFDB.disCN.checkboxwrapper}"><input word="${word}" rtype="${rtype}" config="${config}" type="checkbox" class="${BDFDB.disCN.checkboxinputdefault}"${this.words[rtype][word][config] ? " checked" : ""}><div class="${BDFDB.disCNS.checkbox + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex2 + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.checkboxround}"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label></div>`;
				}
				settingshtml += `</div><div word="${word}" rtype="${rtype}" action="remove" class="${BDFDB.disCN.hovercardbutton} remove-word"></div></div>`;
			}
			settingshtml += `</div>`
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Remove all added words.</h3><button rtype="${rtype}" action="removeall" type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} remove-all" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
			settingshtml += `<div class="${BDFDB.disCNS.divider + BDFDB.disCNS.dividerdefault + BDFDB.disCN.marginbottom40}"></div>`;
		}
		var infoHidden = BDFDB.loadData("hideInfo", this, "hideInfo");
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.cursorpointer} toggle-info" style="flex: 1 1 auto;"><svg class="toggle-infoarrow${infoHidden ? (" " + BDFDB.disCN.directionright) : ""}" width="12" height="12" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10"></path></svg><div class="toggle-infotext" style="flex: 1 1 auto;">Information</div></div>`;
		settingshtml += `<div class="BDFDB-settings-inner-list info-container" ${infoHidden ? "style='display:none;'" : ""}><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Case: Will block/censor words while comparing lowercase/uppercase. apple => apple, not APPLE or AppLe</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Not Case: Will block/censor words while ignoring lowercase/uppercase. apple => apple, APPLE and AppLe</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Exact: Will block/censor words that are exactly the selected word. apple => apple, not applepie or pineapple</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Not Exact: Will block/censor all words containing the selected word. apple => apple, applepie and pineapple</div><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCN.primary}">Empty: Ignores the default and set replace word and removes the word/message instead.</div></div>`;
		settingshtml += `</div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.ListenerUtils.add(this, settingspanel, "keypress", ".wordInputs", e => {if (e.which == 13) this.updateContainer(settingspanel, e.currentTarget);});
		BDFDB.ListenerUtils.add(this, settingspanel, "keyup", ".defaultInputs", e => {this.saveReplace(e.currentTarget);});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".btn-addword, .remove-word, .remove-all", e => {this.updateContainer(settingspanel, e.currentTarget);});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", BDFDB.dotCN.checkboxinput, e => {this.updateConfig(e.currentTarget);});
		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".toggle-info", e => {this.toggleInfo(e.currentTarget);});

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

			this.words = BDFDB.DataUtils.load(this, "words");
			for (let rtype in this.defaults.replaces) if (!BDFDB.ObjectUtils.is(this.words[rtype])) this.words[rtype] = {};

			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			document.querySelectorAll(`${BDFDB.dotCN.messagemarkup}.blocked, ${BDFDB.dotCN.messageaccessory}.censored, ${BDFDB.dotCN.messagemarkup}.blocked, ${BDFDB.dotCN.messageaccessory}.censored`).forEach(message => {this.resetMessage(message);});

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	updateContainer (settingspanel, ele) {
		var wordvalue = null, replacevalue = null, action = ele.getAttribute("action"), rtype = ele.getAttribute("rtype"), update = () => {
			BDFDB.DataUtils.save(this.words, this, "words");

			var containerhtml = ``;
			for (let word in this.words[rtype]) {
				containerhtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis}" style="flex: 1 1 auto;">${BDFDB.encodeToHTML(word)} (${BDFDB.encodeToHTML(this.words[rtype][word].replace)})</div>`
				for (let config in this.defaults.configs) {
					containerhtml += `<div class="${BDFDB.disCNS.checkboxcontainer + BDFDB.disCN.marginreset}" style="flex: 0 0 auto;"><label class="${BDFDB.disCN.checkboxwrapper}"><input word="${word}" rtype="${rtype}" config="${config}" type="checkbox" class="${BDFDB.disCN.checkboxinputdefault}"${this.words[rtype][word][config] ? " checked" : ""}><div class="${BDFDB.disCNS.checkbox + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex2 + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.checkboxround}"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label></div>`;
				}
				containerhtml += `</div><div word="${word}" rtype="${rtype}" action="remove" class="${BDFDB.disCN.hovercardbutton} remove-word"></div></div>`;
			}
			containerhtml += `</div>`;
			settingspanel.querySelector("." + rtype + "-list").innerHTML = containerhtml;
			BDFDB.initElements(settingspanel, this);
			this.SettingsUpdated = true;
		};

		if (action == "add") {
			var wordinput = settingspanel.querySelector("#input-" + rtype + "-wordvalue");
			var replaceinput = settingspanel.querySelector("#input-" + rtype + "-replacevalue");
			if (wordinput.value && wordinput.value.trim().length > 0) {
				this.saveWord(wordinput.value.trim(), replaceinput.value.trim(), rtype);
				wordinput.value = null;
				replaceinput.value = null;
				update();
			}
		}
		else if (action == "remove") {
			var wordvalue = ele.getAttribute("word");
			if (wordvalue) {
				delete this.words[rtype][wordvalue];
				update();
			}
		}
		else if (action == "removeall") {
			BDFDB.openConfirmModal(this, "Are you sure you want to remove all added Words from your list?", () => {
				this.words[rtype] = {};
				update();
			});
		}
	}

	saveWord (wordvalue, replacevalue, rtype, configs = BDFDB.DataUtils.get(this, "configs")) {
		if (!wordvalue || !replacevalue) return;
		wordvalue = wordvalue.trim();
		replacevalue = replacevalue.trim();
		this.words[rtype][wordvalue] = {
			replace: replacevalue,
			empty: configs.empty,
			case: configs.case,
			exact: wordvalue.indexOf(" ") > -1 ? false : configs.exact,
			regex: false
		};
	}

	saveReplace (input) {
		var rtype = input.getAttribute("rtype");
		var wordvalue = input.value;
		if (rtype) {
			var replaces = BDFDB.getData(rtype, this, "replaces");
			BDFDB.saveData(rtype, wordvalue.trim(), this, "replaces");
		}
	}

	updateConfig (ele) {
		var wordvalue = ele.getAttribute("word");
		var config = ele.getAttribute("config");
		var rtype = ele.getAttribute("rtype");
		if (wordvalue && this.words[rtype][wordvalue] && config) {
			this.words[rtype][wordvalue][config] = ele.checked;
			BDFDB.DataUtils.save(this.words, this, "words");
		}
	}

	toggleInfo (ele) {
		BDFDB.toggleClass(ele.querySelector("svg"), BDFDB.disCN.directionright);
		BDFDB.toggleEles(ele.nextElementSibling);
		BDFDB.saveData("hideInfo", BDFDB.isEleHidden(ele.nextElementSibling), this, "hideInfo");
	}

	onNativeContextMenu (instance, menu, returnvalue) {
		if (instance.props && instance.props.value && instance.props.value.trim() && !menu.querySelector(`${this.name}-contextMenuItem`)) {
			if ((instance.props.type == "NATIVE_TEXT" || instance.props.type == "CHANNEL_TEXT_AREA") && BDFDB.getData("addContextMenu", this, "settings")) this.appendItem(menu, returnvalue, instance.props.value.trim());
		}
	}

	onMessageContextMenu (instance, menu, returnvalue) {
		if (instance.props && instance.props.message && instance.props.channel && instance.props.target && !menu.querySelector(`${this.name}-contextMenuItem`)) {
			let text = document.getSelection().toString().trim();
			if (text && BDFDB.getData("addContextMenu", this, "settings")) this.appendItem(menu, returnvalue, text);
		}
	}

	appendItem (menu, returnvalue, text) {
		let [children, index] = BDFDB.ReactUtils.findChildren(returnvalue, {name:["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]});
		const itemgroup = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
			className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
			children: [
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
					label: "Add to ChatFilter",
					className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-addalias-contextMenuItem`,
					action: e => {
						BDFDB.closeContextMenu(menu);
						this.openAddModal(text);
					}
				})
			]
		});
		if (index > -1) children.splice(index, 0, itemgroup);
		else children.push(itemgroup);
	}

	processMessage (instance, wrapper, returnvalue) {
		wrapper.querySelectorAll(`${BDFDB.dotCNC.messagemarkup + BDFDB.dotCN.messageaccessory}`).forEach(message => {this.hideMessage(message);});
	}

	processStandardSidebarView (instance, wrapper, returnvalue) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			document.querySelectorAll(`${BDFDB.dotCN.messagemarkup}.blocked, ${BDFDB.dotCN.messageaccessory}.censored, ${BDFDB.dotCN.messagemarkup}.blocked, ${BDFDB.dotCN.messageaccessory}.censored`).forEach(message => {this.resetMessage(message);});
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
	}

	hideMessage (message) {
		if (message.tagName && !BDFDB.containsClass(message, "blocked", "censored", false)) {
			var orightml = message.innerHTML;
			var newhtml = "";

			if (orightml) {
				var blocked = null;

				var strings = [];
				var count = 0;
				orightml.split("").forEach((chara) => { 
					if (chara == "<") {
						if (strings[count]) count++;
					}
					strings[count] = strings[count] ? strings[count] + chara : chara;
					if (chara == ">") {
						count++;
					}
				});

				var settings = BDFDB.DataUtils.get(this, "settings");
				var replaces = BDFDB.DataUtils.get(this, "replaces");
				var blocked = false;
				for (let bWord in this.words.blocked) {
					var blockedReplace = this.words.blocked[bWord].empty ? "" : (this.words.blocked[bWord].replace || replaces.blocked);
					var reg = this.createReg(bWord, this.words.blocked[bWord]);
					strings.forEach(string => {
						if (this.testForEmoji(string, reg)) blocked = true;
						else if (string.indexOf('<img src="http') == 0) {
							var url = string.split('src="').length > 0 ? string.split('src="')[1] : null;
							url = url ? url.split('"')[0] : null;
							if (reg.test(url)) blocked = true;
						}
						else if (string.indexOf("<") != 0) {
							string.replace(/\n/g, " \n ").split(" ").forEach((word) => {
								let wordWithoutSpecial = word.replace(/[\?\¿\!\¡\.\"]/g, "");
								if (word && reg.test(word) || wordWithoutSpecial && reg.test(wordWithoutSpecial)) blocked = true;
							});
						}
					});
					if (blocked) break;
				}
				if (blocked) {
					if (settings.hideMessage.blocked) BDFDB.toggleEles(message, false);
					newhtml = BDFDB.encodeToHTML(blockedReplace);
					message.innerHTML = newhtml;
					BDFDB.addClass(message, "blocked");
					message.ChatFilterOriginalHTML = orightml;
					message.ChatFilterNewHTML = newhtml;

					this.addClickListener(message, settings.showMessageOnClick.blocked);
				}
				else {
					var censored = false;
					for (let cWord in this.words.censored) {
						var censoredReplace = this.words.censored[cWord].empty ? "" : (this.words.censored[cWord].replace || replaces.censored);
						var reg = this.createReg(cWord, this.words.censored[cWord]);
						strings.forEach((string,i) => {
							if (this.testForEmoji(string, reg)) {
								censored = true;
								strings[i] = BDFDB.encodeToHTML(censoredReplace);
								if (strings[i+1] && strings[i+1].indexOf("<input") == 0) {
									strings[i+1] = "";
									if (strings[i-1] && strings[i-1].indexOf("<span") == 0) strings[i-1] = "";
									if (strings[i+2] && strings[i+2].indexOf("</span") == 0) strings[i+2] = "";
								}
							}
							else if (string.indexOf('<img src="http') == 0) {
								var url = string.split('src="').length > 0 ? string.split('src="')[1] : null;
								url = url ? url.split('"')[0] : null;
								if (reg.test(url)) {
									censored = true;
									strings = [BDFDB.encodeToHTML(censoredReplace)];
								}
							}
							else if (string.indexOf("<") != 0) {
								var newstring = [];
								string.replace(/\n/g, " \n ").split(" ").forEach((word) => {
									let wordWithoutSpecial = word.replace(/[\?\¿\!\¡\.\"]/g, "");
									if (word && reg.test(word) || wordWithoutSpecial && reg.test(wordWithoutSpecial)) {
										censored = true;
										newstring.push(BDFDB.encodeToHTML(censoredReplace));
									}
									else {
										newstring.push(word);
									}
								});
								strings[i] = newstring.join(" ").replace(/ \n /g, "\n");
							}
						});
					}
					if (censored) {
						newhtml = strings.join("");
						message.innerHTML = newhtml;
						BDFDB.addClass(message, "censored");
						message.ChatFilterOriginalHTML = orightml;
						message.ChatFilterNewHTML = newhtml;

						this.addClickListener(message, settings.showMessageOnClick.censored);
					}
				}
			}
		}
	}

	createReg (word, config) {
		return new RegExp(BDFDB.encodeToHTML(config.exact ? "^" + BDFDB.regEscape(word) + "$" : BDFDB.regEscape(word)), config.case ? "" : "i");
	}

	testForEmoji (string, reg) {
		if (string.indexOf("<img ") == 0 && (string.indexOf('class="emote') > -1 || string.indexOf('class="emoji') > -1)) {
			var emojiname = string.split('alt="').length > 0 ? string.split('alt="')[1].split('"')[0] : null;
			return emojiname = !emojiname ? false : (reg.test(emojiname) || reg.test(emojiname.replace(/:/g, "")));
		}
		return false;
	}

	resetMessage (message) {
		message.innerHTML = message.ChatFilterOriginalHTML;
		BDFDB.removeClass(message, "blocked", "censored", "revealed");
		BDFDB.toggleEles(message, true);
		delete message.ChatFilterOriginalHTML;
		delete message.ChatFilterNewHTML;
		message.removeEventListener("click", message.clickChatFilterListener);
	}

	addClickListener (message, addListener) {
		message.removeEventListener("click", message.clickChatFilterListener);
		if (addListener) {
			message.clickChatFilterListener = () => {
				if (BDFDB.containsClass(message, "revealed")) {
					BDFDB.removeClass(message, "revealed");
					message.innerHTML = message.ChatFilterNewHTML;
				}
				else {
					BDFDB.addClass(message, "revealed");
					message.innerHTML = message.ChatFilterOriginalHTML;
				}
			};
			message.addEventListener("click", message.clickChatFilterListener);
		}
	}

	openAddModal (wordvalue) {
		let chatfilterAddModal = BDFDB.htmlToElement(this.chatfilterAddModalMarkup);
		let wordvalueinput = chatfilterAddModal.querySelector("#input-wordvalue");
		let replacevalueinput = chatfilterAddModal.querySelector("#input-replacevalue");
		let addbutton = chatfilterAddModal.querySelector(".btn-add");

		wordvalueinput.value = wordvalue || "";

		BDFDB.appendModal(chatfilterAddModal);

		wordvalueinput.addEventListener("input", () => {
			if (!wordvalueinput.value.trim()) {
				addbutton.disabled = true;
				BDFDB.addClass(wordvalueinput, "invalid");
				addbutton.style.setProperty("pointer-events", "none", "important");
				BDFDB.TooltipUtils.create(wordvalueinput, "Choose a Wordvalue", {type: "right", color: "red", selector: "chatfilter-disabled-tooltip"});
			}
			else {
				addbutton.disabled = false;
				BDFDB.removeClass(wordvalueinput, "invalid");
				addbutton.style.removeProperty("pointer-events");
				BDFDB.removeEles(".chatfilter-disabled-tooltip");
			}
		});

		BDFDB.ListenerUtils.addToChildren(chatfilterAddModal, "click", BDFDB.dotCNC.backdrop + BDFDB.dotCNC.modalclose + ".btn-add", () => {
			BDFDB.removeEles(".chatfilter-disabled-tooltip");
		});

		addbutton.addEventListener("click", e => {
			let configs = {};
			for (let key in this.defaults.configs) {
				let configinput = chatfilterAddModal.querySelector("#input-config" + key);
				if (configinput) configs[key] = configinput.checked;
			}
			let rtype = chatfilterAddModal.querySelector("#input-choiceblockcensor").checked ? "censored" : "blocked";
			this.saveWord(wordvalueinput.value.trim(), replacevalueinput.value.trim(), rtype, configs);
			BDFDB.DataUtils.save(this.words, this, "words");
			document.querySelectorAll(`${BDFDB.dotCN.messagemarkup}.blocked, ${BDFDB.dotCN.messageaccessory}.censored, ${BDFDB.dotCN.messagemarkup}.blocked, ${BDFDB.dotCN.messageaccessory}.censored`).forEach(message => {this.resetMessage(message);});
			BDFDB.ModuleUtils.forceAllUpdates(this);
		});
		wordvalueinput.focus();
	}
}
