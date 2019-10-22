//META{"name":"UserNotes","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/UserNotes","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/UserNotes/UserNotes.plugin.js"}*//

class UserNotes {
	getName () {return "UserNotes";}

	getVersion () {return "1.0.3";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to write your own user notes wihtout a character limit.";}
	
	constructor () {
		this.changelog = {
			"fixed":[["Light Theme Update","Fixed bugs for the Light Theme Update, which broke 99% of my plugins"]]
		};
	}

	initConstructor () {
		this.css = `
			.${this.name}-modal textarea {
				rows: 0;
				cols: 0;
				height: 30vw;
				resize: none;
			}`;

		this.userNotesModalMarkup =
			`<span class="${this.name}-modal BDFDB-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.defaultcolor + BDFDB.disCN.h4defaultmargin}">${BDFDB.LanguageUtils.LanguageStrings.USERS + " " + BDFDB.LanguageUtils.LanguageStrings.NOTE}</h4>
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
							<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCNS.scrollerthemeghosthairline + BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex2 + BDFDB.disCNS.flexchild + BDFDB.disCNS.modalsubinner + BDFDB.disCN.marginbottom20}" style="flex: 1 1 auto;">
								<textarea class="${BDFDB.disCNS.scroller + BDFDB.disCNS.inputdefault + BDFDB.disCN.input}" id="modal-inputtext"></textarea>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontalreverse + BDFDB.disCNS.horizontalreverse2 + BDFDB.disCNS.directionrowreverse + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalfooter}">
								<button type="button" class="btn-save ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}"></div>
								</button>
								<button type="button" class="btn-cancel ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlooklink + BDFDB.disCNS.buttoncolorwhite + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
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
		var settings = BDFDB.getAllData(this, "settings");
		var settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.titlesize18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Remove all User Notes.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} remove-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Remove</div></button></div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.ListenerUtils.add(this, settingspanel, "click", ".remove-button", () => {
			BDFDB.openConfirmModal(this, "Are you sure you want to remove all usernotes?", () => {
				BDFDB.removeAllData(this, "notes");
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
		}
		else console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	onUserContextMenu (instance, menu, returnvalue) {
		if (instance.props && instance.props.user && !menu.querySelector(`${this.name}-contextMenuItem`)) {
			let [children, index] = BDFDB.getContextMenuGroupAndIndex(returnvalue, ["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]);
			const itemgroup = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
						label: BDFDB.LanguageUtils.LanguageStrings.USERS + " " + BDFDB.LanguageUtils.LanguageStrings.NOTE,
						className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-usernote-contextMenuItem`,
						action: e => {
							BDFDB.closeContextMenu(menu);
							this.openNotesModal(instance.props.user);
						}
					})
				]
			});
			if (index > -1) children.splice(index, 0, itemgroup);
			else children.push(itemgroup);
		}
	}

	openNotesModal (info) {
		let note = BDFDB.loadData(info.id, this, "notes") || "";

		let userNotesModal = BDFDB.htmlToElement(this.userNotesModalMarkup);
		let noteinput = userNotesModal.querySelector("#modal-inputtext")
		userNotesModal.querySelector(BDFDB.dotCN.modalguildname).innerText = info.username || "";
		noteinput.value = note;
		noteinput.setAttribute("placeholder", note);
		BDFDB.appendModal(userNotesModal);
		BDFDB.ListenerUtils.addToChildren(userNotesModal, "click", ".btn-save", (e) => {
			e.preventDefault();
			BDFDB.saveData(info.id, noteinput.value, this, "notes")
		});
		noteinput.focus();
	}
}
