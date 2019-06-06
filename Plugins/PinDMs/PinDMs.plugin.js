//META{"name":"PinDMs","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/PinDMs","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/PinDMs/PinDMs.plugin.js"}*//

class PinDMs {
	getName () {return "PinDMs";}

	getVersion () {return "1.4.5";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to pin DMs, making them appear at the top of your DMs/Guild-list.";}

	initConstructor () {
		this.changelog = {
			"fixed":[["Pinned DMs","Changed to new DM classes"]]
		};
		
		this.patchModules = {
			"Guilds":"componentDidMount",
			"PrivateChannel":"componentDidMount",
			"DirectMessage":["componentDidMount","componentDidUpdate","componentWillUnmount"],
			"LazyScroller":"render",
			"StandardSidebarView":"componentWillUnmount"
		};

		this.dmContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} pindms-item ${BDFDB.disCN.contextmenuitemsubmenu}">
					<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_context_pindm_text</div></span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;

		this.dmContextSubMenuMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} pindms-submenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} pindm-channel-item">
						<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_context_pinchannel_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} unpindm-channel-item ${BDFDB.disCN.contextmenuitemdanger}">
						<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_context_unpinchannel_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} pindm-guild-item">
						<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_context_pinguild_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} unpindm-guild-item ${BDFDB.disCN.contextmenuitemdanger}">
						<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_context_unpinguild_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>
			</div>`;

		this.dmPinContextMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} pinneddm-contextmenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} pindm-guild-item">
						<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_context_pinguild_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>
			</div>`;

		this.dmUnpinContextMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} pinneddm-contextmenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} unpindm-guild-item ${BDFDB.disCN.contextmenuitemdanger}">
						<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_context_unpinguild_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>
			</div>`;

		this.recentDMMarkup =
			`<div class="pinned-dm" style="opacity: 1; height: 56px; transform: scale(1);">
				<div class="${BDFDB.disCN.guildouter}">
					<div class="${BDFDB.disCNS.guildpillwrapper + BDFDB.disCN.dmpill}">
						<span class="${BDFDB.disCN.guildpillitem}" style="opacity: 0; height: 8px; transform: translate3d(0px, 0px, 0px);"></span>
					</div>
					<div class="${BDFDB.disCN.guildinnerwrapper}">
						<div class="${BDFDB.disCN.guildinner}">
							<svg width="48" height="48" viewBox="0 0 48 48" class="${BDFDB.disCN.guildsvg}">
								<mask id="" fill="black" x="0" y="0" width="48" height="48">
									<path d="M0 0 l50 0l0 50l-50 0l0 -50Z" fill="white"></path>
									<rect x="28" y="-4" width="24" height="24" rx="12" ry="12" transform="translate(0 0)" fill="black"></rect>
									<rect x="28" y="28" width="24" height="24" rx="12" ry="12" transform="translate(-20 20)" fill="black"></rect>
								</mask>
								<foreignObject mask="" x="0" y="0" width="48" height="48">
									<a class="${BDFDB.disCN.guildiconwrapper}" draggable="false" style="border-radius: 50%;">
										<img class="${BDFDB.disCN.guildicon}" src="" width="48" height="48" draggable="false"></img>
									</a>
								</foreignObject>
							</svg>
							<div class="${BDFDB.disCN.guildbadgewrapper}">
								<div class="${BDFDB.disCN.guildupperbadge} pin-badge" style="opacity: 1; transform: translate(0px, 0px);">
									<div class="${BDFDB.disCNS.guildbadgeiconbadge + BDFDB.disCN.guildbadgeiconbadge2}" style="width: 16px; padding-right: 1px;">
										<svg class="${BDFDB.disCN.guildbadgeicon}" name="Nova_Pin" width="24" height="24" viewBox="0 0 520 520">
											<g fill="white">
												<path d="M291.31, 402.761L109.241, 220.693C79.073, 190.525, 30.166, 190.526, 0, 220.692l291.31, 291.31C321.474, 481.835, 321.476, 432.927, 291.31, 402.761z"></path>
												<polygon points="273.104, 111.449 154.758, 211.589 300.412, 357.242 400.55, 238.898"></polygon>
												<path d="M500.688, 175.174L336.827, 11.313c-15.085-15.085-39.539-15.083-54.621, 0c-15.082, 15.082-15.082, 39.538, 0, 54.62 l163.861, 163.861c15.083, 15.085, 39.539, 15.085, 54.621, 0.001C515.773, 214.712, 515.773, 190.257, 500.688, 175.174z"></path>
												<polygon points="91.032, 366.346 0, 512 145.655, 420.967"></polygon>
											</g>
										</svg>
									</div>
								</div>
								<div class="${BDFDB.disCN.guildlowerbadge}" style="opacity: 1; transform: translate(0px, 0px); display: none;">
									<div class="${BDFDB.disCN.guildbadgenumberbadge}" style="background-color: rgb(240, 71, 71); width: 16px; padding-right: 1px;">0</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>`;

		this.dragPlaceholderMarkup =
			`<div class="dmplaceholder" style="opacity: 1; height: 56px; transform: scale(1);">
				<div class="${BDFDB.disCN.guildouter}">
					<div class="${BDFDB.disCNS.guildpillwrapper + BDFDB.disCN.dmpill}">
						<span class="${BDFDB.disCN.guildpillitem}"></span>
					</div>
					<div class="${BDFDB.disCN.guildinnerwrapper}">
						<div class="${BDFDB.disCN.guildinner}">
							<svg width="48" height="48" viewBox="0 0 48 48" class="${BDFDB.disCN.guildsvg}">
								<mask id="PINDMSDRAG" fill="black" x="0" y="0" width="48" height="48">
									<path d="M48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24Z" fill="white"></path>
								</mask>
								<foreignObject mask="url(#PINDMSDRAG)" x="0" y="0" width="48" height="48">
									<div class="${BDFDB.disCN.guildplaceholder}"></div>
								</foreignObject>
							</svg>
							<div class="${BDFDB.disCN.guildbadgewrapper}"></div>
						</div>
					</div>
				</div>
			</div>`;

		this.css = `
			${BDFDB.dotCN.dmchannel}.pindms-dragpreview,
			.pinned-dm.pindms-dragpreview {
				pointer-events: none !important;
				position: absolute !important;
				opacity: 0.5 !important;
				z-index: 10000 !important;
			}
			.pinned-dm.pindms-dragpreview ${BDFDB.dotCN.guildupperbadge},
			.pinned-dm.pindms-dragpreview ${BDFDB.dotCN.guildlowerbadge} {
				display: none !important;
			}`;

		this.defaults = {
			settings: {
				showPinIcon:		{value:true, 	description:"Shows a little 'Pin' icon for pinned DMs in the server list:"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var settings = BDFDB.getAllData(this, "settings");
		var settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Unpin all DMs.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".reset-button", () => {
			BDFDB.openConfirmModal(this, "Are you sure you want to unpin all pinned DMs?", () => {
				BDFDB.removeAllData(this, "pinnedDMs");
				BDFDB.removeAllData(this, "pinnedRecents");
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
				require("request")("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
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

			this.UserUtils = BDFDB.WebModules.findByProperties("getUsers", "getUser");
			this.ChannelUtils = BDFDB.WebModules.findByProperties("getChannels", "getChannel");
			this.PrivateChannelUtils = BDFDB.WebModules.findByProperties("ensurePrivateChannel");
			this.ChannelSwitchUtils = BDFDB.WebModules.findByProperties("selectPrivateChannel");
			this.CurrentChannelStore = BDFDB.WebModules.findByProperties("getLastSelectedChannelId");
			this.UnreadUtils = BDFDB.WebModules.findByProperties("getUnreadCount");
			this.DiscordConstants = BDFDB.WebModules.findByProperties("Permissions", "ActivityTypes", "StatusTypes");
			this.Animations = BDFDB.WebModules.findByProperties("spring");

			this.forceAdding = true;
			BDFDB.WebModules.forceAllUpdates(this);
			delete this.forceAdding;
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			let dmsscrollerinstance = BDFDB.getReactInstance(document.querySelector(BDFDB.dotCNS.dmchannels + BDFDB.dotCN.scroller));
			if (dmsscrollerinstance) {
				let dms = dmsscrollerinstance.return.return.return.memoizedProps.children;
				let amount = 0;
				let insertpoint = null;
				for (let i in dms) {
					let ele = dms[i];
					if (ele && ele.pinned) {
						delete ele.pinned;
						if (ele.props.ispin) {
							if (ele.type == "header") insertpoint = i;
							amount++;
						}
					}
				}
				dms.splice(insertpoint, amount);
				this.forceUpdateScroller(dmsscrollerinstance.stateNode);
			}

			for (let info of BDFDB.readDmList()) {
				this.unhideNativeDM(info.id);
				if (info.div) info.div.removeEventListener("contextmenu", info.div.PinDMsContextMenuListener);
			}
			BDFDB.removeEles(".pinned-dm", ".dmplaceholder", ".pindms-dragpreview");

			BDFDB.unloadMessage(this);
		}
	}
	
	onSwitch () {
		for (let pin of document.querySelectorAll(".pinned-dm")) this.updatePinnedRecent(pin.getAttribute("channelid"));
	}


	// begin of own functions

	changeLanguageStrings () {
		this.dmContextEntryMarkup = 	this.dmContextEntryMarkup.replace("REPLACE_context_pindm_text", this.labels.context_pindm_text);

		this.dmContextSubMenuMarkup = 	this.dmContextSubMenuMarkup.replace("REPLACE_context_pinchannel_text", this.labels.context_pinchannel_text);
		this.dmContextSubMenuMarkup = 	this.dmContextSubMenuMarkup.replace("REPLACE_context_unpinchannel_text", this.labels.context_unpinchannel_text);
		this.dmContextSubMenuMarkup = 	this.dmContextSubMenuMarkup.replace("REPLACE_context_pinguild_text", this.labels.context_pinguild_text);
		this.dmContextSubMenuMarkup = 	this.dmContextSubMenuMarkup.replace("REPLACE_context_unpinguild_text", this.labels.context_unpinguild_text);

		this.dmPinContextMarkup = 		this.dmPinContextMarkup.replace("REPLACE_context_pinguild_text", this.labels.context_pinguild_text);

		this.dmUnpinContextMarkup = 	this.dmUnpinContextMarkup.replace("REPLACE_context_unpinguild_text", this.labels.context_unpinguild_text);
	}

	onUserContextMenu (instance, menu) {
		if (instance.props && instance.props.user && !menu.querySelector(".pindms-item")) {
			let closeentry = BDFDB.React.findDOMNodeSafe(BDFDB.getOwnerInstance({node:menu,props:["handleClose"]}));
			if (closeentry) {
				let id = this.ChannelUtils.getDMFromUserId(instance.props.user.id);
				if (id) this.appendItem(id, closeentry);
				else this.PrivateChannelUtils.ensurePrivateChannel(BDFDB.myData.id, instance.props.user.id).then(id => {this.appendItem(id, closeentry);});
			}
		}
	}

	onGroupDMContextMenu (instance, menu) {
		if (instance.props && instance.props.channelId && !menu.querySelector(".pindms-item")) {
			let changeentry = BDFDB.React.findDOMNodeSafe(BDFDB.getOwnerInstance({node:menu,props:["handleChangeIcon"]}));
			if (changeentry) {
				this.appendItem(instance.props.channelId, changeentry);
			}
		}
	}

	appendItem (id, target) {
		let dmContextEntry = BDFDB.htmlToElement(this.dmContextEntryMarkup);
		target.parentElement.insertBefore(dmContextEntry, target);
		let pindmsitem = dmContextEntry.querySelector(".pindms-item");
		pindmsitem.addEventListener("mouseenter", () => {
			let dmContextSubMenu = BDFDB.htmlToElement(this.dmContextSubMenuMarkup);
			let pinchannelitem = dmContextSubMenu.querySelector(".pindm-channel-item");
			let unpinchannelitem = dmContextSubMenu.querySelector(".unpindm-channel-item");
			let pinguilditem = dmContextSubMenu.querySelector(".pindm-guild-item");
			let unpinguilditem = dmContextSubMenu.querySelector(".unpindm-guild-item");
			let pinnedDMs = BDFDB.loadAllData(this, "pinnedDMs");
			if (pinnedDMs[id] == undefined) {
				BDFDB.removeEles(unpinchannelitem);
				pinchannelitem.addEventListener("click", () => {
					BDFDB.closeContextMenu(target);
					let dmsscrollerinstance = BDFDB.getReactInstance(document.querySelector(BDFDB.dotCNS.dmchannels + BDFDB.dotCN.scroller));
					if (dmsscrollerinstance) {
						let dms = dmsscrollerinstance.return.return.return.memoizedProps.children;
						let insertpoint = this.getInsertPoint(dms);
						this.addPinnedDM(id, dms, insertpoint); 
						this.forceUpdateScroller(dmsscrollerinstance.stateNode);
					}
					this.updatePinnedPositions("pinnedDMs");
				});
			}
			else {
				BDFDB.removeEles(pinchannelitem);
				unpinchannelitem.addEventListener("click", () => {
					BDFDB.closeContextMenu(target);
					this.removePinnedDM(id);
				});
			}
			let pinnedRecents = BDFDB.loadAllData(this, "pinnedRecents");
			if (pinnedRecents[id] == undefined) {
				BDFDB.removeEles(unpinguilditem);
				pinguilditem.addEventListener("click", () => {
					BDFDB.closeContextMenu(target);
					this.addPinnedRecent(id);
					this.updatePinnedPositions("pinnedRecents");
				});
			}
			else {
				BDFDB.removeEles(pinguilditem);
				unpinguilditem.addEventListener("click", () => {
					BDFDB.closeContextMenu(target);
					BDFDB.removeEles(document.querySelector(`.pinned-dm[channelid="${id}"]`));
					this.unhideNativeDM(id);
					BDFDB.removeData(id, this, "pinnedRecents");
					this.updatePinnedPositions("pinnedRecents");
				});
			}
			BDFDB.appendSubMenu(pindmsitem, dmContextSubMenu);
		});
	}

	processGuilds (instance, wrapper) {
		for (let id of this.sortAndUpdate("pinnedRecents")) this.addPinnedRecent(id);
	}

	processPrivateChannel (instance, wrapper) {
		if (instance && instance.props && instance.props.ispin) {
			let id = BDFDB.getReactValue(instance, "props.channel.id");
			wrapper.setAttribute("channelid", id);
			BDFDB.addClass(wrapper, "pinned");
			BDFDB.removeClass(BDFDB.getChannelDiv(id), BDFDB.disCN.dmchannelselected);
			wrapper.querySelector("a").setAttribute("draggable", false);
			wrapper.addEventListener("click", e => {
				let dmsscroller = document.querySelector(BDFDB.dotCNS.dmchannels + BDFDB.dotCN.scroller);
				if (dmsscroller) {
					this.oldScrollerPos = dmsscroller.scrollTop;
					setTimeout(() => {this.oldScrollerPos = null;},1000);
				}
			});
			wrapper.querySelector(BDFDB.dotCN.dmchannelclose).addEventListener("click", e => {
				BDFDB.stopEvent(e);
				this.removePinnedDM(id);
			});
			wrapper.addEventListener("mousedown", e => {
				let x = e.pageX, y = e.pageY;
				let mousemove = e2 => {
					if (Math.sqrt((x - e2.pageX)**2) > 20 || Math.sqrt((y - e2.pageY)**2) > 20) {
						document.removeEventListener("mousemove", mousemove);
						document.removeEventListener("mouseup", mouseup);
						let dmchannelswrap = document.querySelector(`${BDFDB.dotCNS.dmchannels + BDFDB.dotCN.scroller}`);
						if (!dmchannelswrap) return;
						let hovele = null;
						let placeholder = BDFDB.htmlToElement(`<div class="${BDFDB.disCN.dmchannel} dmchannelplaceholder" style="height: 42px; opacity: 1;"><a style="border: 1px dashed #535559 !important;"></a></div>`);
						let dragpreview = this.createDragPreview(wrapper, e);
						let dragging = e3 => {
							BDFDB.removeEles(placeholder);
							BDFDB.toggleEles(wrapper, false);
							this.updateDragPreview(dragpreview, e3);
							hovele = BDFDB.getParentEle(BDFDB.dotCNS.dmchannels + BDFDB.dotCN.dmchannel + ".pinned", e3.target);
							if (hovele) dmchannelswrap.insertBefore(placeholder, hovele.nextSibling);
						};
						let releasing = e3 => {
							document.removeEventListener("mousemove", dragging);
							document.removeEventListener("mouseup", releasing);
							BDFDB.removeEles(placeholder, dragpreview);
							BDFDB.toggleEles(wrapper, true);
							if (hovele) {
								dmchannelswrap.insertBefore(wrapper, hovele.nextSibling);
								this.updatePinnedPositions("pinnedDMs");
							}
						};
						document.addEventListener("mousemove", dragging);
						document.addEventListener("mouseup", releasing);
					}
				};
				let mouseup = () => {
					document.removeEventListener("mousemove", mousemove);
					document.removeEventListener("mouseup", mouseup);
				};
				document.addEventListener("mousemove", mousemove);
				document.addEventListener("mouseup", mouseup);
			});
		}
	}

	processDirectMessage (instance, wrapper, methodnames) {
		if (instance.props && instance.props.channel) {
			if (methodnames.includes("componentDidMount")) {
				wrapper.removeEventListener("contextmenu", wrapper.PinDMsContextMenuListener);
				wrapper.PinDMsContextMenuListener = e => {
					let freshPinnedRecents = BDFDB.loadAllData(this, "pinnedRecents");
					if (freshPinnedRecents[instance.props.channel.id] == undefined) {
						let dmContext = BDFDB.htmlToElement(this.dmPinContextMarkup);
						dmContext.querySelector(".pindm-guild-item").addEventListener("click", () => {
							BDFDB.removeEles(dmContext);
							this.addPinnedRecent(instance.props.channel.id);
							this.updatePinnedPositions("pinnedRecents");
						});
						BDFDB.appendContextMenu(dmContext, e);
					}
				};
				wrapper.addEventListener("contextmenu", wrapper.PinDMsContextMenuListener);
			}
			let pinnedRecents = BDFDB.loadAllData(this, "pinnedRecents");
			if (pinnedRecents[instance.props.channel.id] != undefined) {
				if (methodnames.includes("componentDidMount")) {
					if (!document.querySelector(`.pinned-dm[channelid="${instance.props.channel.id}"]`)) this.addPinnedRecent(instance.props.channel.id);
					else this.hideNativeDM(instance.props.channel.id);
				}
				this.updatePinnedRecent(instance.props.channel.id);
			}
		}
	}

	processLazyScroller (instance, wrapper) {
		let privateChannelIds = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.privateChannelIds");
		if (privateChannelIds) {
			if (this.forceAdding || !instance.props.PinDMsPatched) {
				instance.props.PinDMsPatched = true;
				let dms = instance.props.children;
				let sortedDMs = this.sortAndUpdate("pinnedDMs");
				if (sortedDMs.length > 0) {
					let insertpoint = this.getInsertPoint(dms);
					for (let pos in sortedDMs) this.addPinnedDM(sortedDMs[pos], dms, insertpoint);
				}
				this.forceUpdateScroller(instance.getScrollerNode());
			}
			if (this.oldScrollerPos != null) {
				instance.getScrollerNode().scrollTop = this.oldScrollerPos;
			}
		}
	}

	processStandardSidebarView (instance, wrapper) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			for (let id of this.sortAndUpdate("pinnedRecents")) this.updatePinnedRecent(id);
		}
	}

	getInsertPoint (dms) {
		let insertpoint = null;
		for (let i in dms) {
			let ele = dms[i];
			if (ele && ele.type == "header") {
				insertpoint = parseInt(i);
				if (!ele.pinned && !ele.props.ispin) {
					ele.pinned = true;
					let headerpin = Object.assign({},ele);
					headerpin.key = "pin" + headerpin.key;
					headerpin.props = {children:this.labels.header_pinneddms_text,ispin:true};
					dms.splice(insertpoint, 0, headerpin);
				}
				insertpoint++;
				break;
			}
		}
		return insertpoint;
	}

	addPinnedDM (id, dms, insertpoint) {
		for (let ele of dms) if (ele && !ele.pinned && id == ele.key) {
			ele.pinned = true;
			let dmpin = Object.assign({ispin:true},ele);
			dmpin.key = "pin" + ele.key;
			dmpin.props = {channel:ele.props.channel,selected:ele.props.selected,ispin:true};
			dms.splice(insertpoint, 0, dmpin);
		}
	}

	removePinnedDM (id) {
		if (!id) return;
		let div = document.querySelector(`${BDFDB.dotCNS.dmchannels + BDFDB.dotCN.dmchannel}.pinned[channelid="${id}"]`);
		if (div) {
			BDFDB.removeClass(div, "pinned");
			div.removeAttribute("channelid");
		}
		BDFDB.removeData(id, this, "pinnedDMs");
		this.updatePinnedPositions("pinnedDMs");
		let dmsscrollerinstance = BDFDB.getReactInstance(document.querySelector(BDFDB.dotCNS.dmchannels + BDFDB.dotCN.scroller));
		if (dmsscrollerinstance) {
			let dms = dmsscrollerinstance.return.return.return.memoizedProps.children;
			let existingDMs = this.sortAndUpdate("pinnedDMs");
			let removepoint = null;
			for (let i in dms) {
				let ele = dms[i];
				if (ele && ele.pinned && (id == ele.key || ("pin" + id) == ele.key)) {
					delete ele.pinned;
					if (ele.props.ispin) removepoint = parseInt(i);
				}
			}
			if (removepoint) {
				let offset = existingDMs.length ? 0 : 1;
				if (offset) delete dms[removepoint + offset].pinned;
				dms.splice(removepoint-offset,1+offset);
			}
			this.forceUpdateScroller(dmsscrollerinstance.stateNode);
		}
	}

	sortAndUpdate (type) {
		let pinnedDMs = BDFDB.loadAllData(this, type);
		delete pinnedDMs[""];
		delete pinnedDMs["null"];
		let sortedDMs = [], existingDMs = [], sortDM = (id, pos) => {
			if (typeof sortedDMs[pos] == "undefined") sortedDMs[pos] = id;
			else sortDM(id, pos+1);
		};
		for (let id in pinnedDMs) sortDM(id, pinnedDMs[id]);
		sortedDMs = sortedDMs.filter(n => n);
		for (let pos in sortedDMs) if (this.ChannelUtils.getChannel(sortedDMs[pos])) existingDMs.push(sortedDMs[pos]);
		this.updatePinnedPositions(type); 
		return existingDMs;
	}

	forceUpdateScroller (scroller) {
		if (this.updatingScroller) return;
		var stateNode = BDFDB.getReactValue(scroller, "return.return.return.stateNode");
		if (stateNode) {
			this.updatingScroller = true;
			stateNode.updater.enqueueForceUpdate(stateNode);
			setTimeout(() => {stateNode.updater.enqueueForceUpdate(stateNode);},500);
			setTimeout(() => {delete this.updatingScroller;},1000);
		}
	}

	addPinnedRecent (id) {
		let anker = BDFDB.getParentEle(BDFDB.dotCN.guildouter, document.querySelector(BDFDB.dotCN.homebuttonicon));
		if (anker && !document.querySelector(`.pinned-dm[channelid="${id}"]`)) {
			let info = this.ChannelUtils.getChannel(id);
			if (info) {
				let dmdiv = BDFDB.htmlToElement(this.recentDMMarkup);
				let dmdivinner = dmdiv.querySelector(BDFDB.dotCN.guildinnerwrapper);
				let dmiconwrapper = dmdiv.querySelector(BDFDB.dotCN.guildiconwrapper);
				dmiconwrapper.style.setProperty("border-radius", this.CurrentChannelStore.getChannelId() == id ? "30%" : "50%");
				dmiconwrapper.style.setProperty("overflow", "hidden");
				dmdiv.querySelector("mask").setAttribute("id", "PINDMS" + id);
				dmdiv.querySelector("foreignObject").setAttribute("mask", "url(#PINDMS" + id + ")");
				let user = info.type == 1 ? this.UserUtils.getUser(info.recipients[0]) : null;
				dmdiv.setAttribute("channelid", id);
				anker.parentElement.insertBefore(dmdiv, anker.nextSibling);
				let avatar = dmdiv.querySelector(BDFDB.dotCN.guildicon);
				let dmname = info.name;
				if (!dmname && info.recipients.length > 0) {
					for (let dmuser_id of info.recipients) {
						dmname = dmname ? dmname + ", " : dmname;
						dmname = dmname + this.UserUtils.getUser(dmuser_id).username;
					}
				}
				let EditUsersData = user && BDFDB.isPluginEnabled("EditUsers") ? bdplugins.EditUsers.plugin.getUserData(user.id, dmdiv) : {};
				if (!EditUsersData.removeIcon) avatar.setAttribute("src", `${EditUsersData.url || BDFDB.getChannelIcon(id)}`);
				avatar.setAttribute("channel", dmname);
				if (user) avatar.setAttribute("user", user.username);
				dmdivinner.addEventListener("mouseenter", () => {
					let FreshEditUsersData = user && BDFDB.isPluginEnabled("EditUsers") ? bdplugins.EditUsers.plugin.getUserData(user.id, dmdiv) : {};
					BDFDB.createTooltip(FreshEditUsersData.name || dmname, dmdivinner, {selector:(BDFDB.isObjectEmpty(FreshEditUsersData) ? "" : "EditUsers-tooltip"),type:"right"});
				});
				avatar.parentElement.addEventListener("click", e => {
					if (user) {
						let DMid = this.ChannelUtils.getDMFromUserId(user.id)
						if (DMid) this.ChannelSwitchUtils.selectPrivateChannel(DMid);
						else this.PrivateChannelUtils.openPrivateChannel(BDFDB.myData.id, user.id);
					}
					else this.ChannelSwitchUtils.selectPrivateChannel(id);
					BDFDB.stopEvent(e);
				});
				avatar.parentElement.addEventListener("contextmenu", e => {
					let dmContext = BDFDB.htmlToElement(this.dmUnpinContextMarkup);
					dmContext.querySelector(".unpindm-guild-item").addEventListener("click", () => {
						BDFDB.removeEles(dmdiv, dmContext);
						this.unhideNativeDM(id);
						BDFDB.removeData(id, this, "pinnedRecents");
						this.updatePinnedPositions("pinnedRecents");
					});
					BDFDB.appendContextMenu(dmContext, e);
				});
				dmdiv.addEventListener("mousedown", e => {
					let x = e.pageX, y = e.pageY;
					let mousemove = e2 => {
						if (Math.sqrt((x - e2.pageX)**2) > 20 || Math.sqrt((y - e2.pageY)**2) > 20) {
							document.removeEventListener("mousemove", mousemove);
							document.removeEventListener("mouseup", mouseup);
							let hovele = null;
							let placeholder = BDFDB.htmlToElement(this.dragPlaceholderMarkup);
							let dragpreview = this.createDragPreview(dmdiv, e);
							let dragging = e3 => {
								BDFDB.removeEles(placeholder);
								BDFDB.toggleEles(dmdiv, false);
								this.updateDragPreview(dragpreview, e3);
								hovele = BDFDB.getParentEle(".pinned-dm", e3.target);
								if (hovele) hovele.parentElement.insertBefore(placeholder, hovele.nextSibling);
							};
							let releasing = e3 => {
								document.removeEventListener("mousemove", dragging);
								document.removeEventListener("mouseup", releasing);
								BDFDB.removeEles(placeholder, dragpreview);
								BDFDB.toggleEles(dmdiv, true);
								if (hovele) {
									hovele.parentElement.insertBefore(dmdiv, hovele.nextSibling);
									this.updatePinnedPositions("pinnedRecents");
								}
							};
							document.addEventListener("mousemove", dragging);
							document.addEventListener("mouseup", releasing);
						}
					};
					let mouseup = () => {
						document.removeEventListener("mousemove", mousemove);
						document.removeEventListener("mouseup", mouseup);
					};
					document.addEventListener("mousemove", mousemove);
					document.addEventListener("mouseup", mouseup);
				});
				this.updatePinnedRecent(id);
				this.addHoverBehaviour(dmdiv, id);
				this.hideNativeDM(id);
			}
		}
	}

	createDragPreview (div, e) {
		if (!Node.prototype.isPrototypeOf(div)) return;
		let dragpreview = div.cloneNode(true);
		BDFDB.addClass(dragpreview, "pindms-dragpreview");
		document.querySelector(BDFDB.dotCN.appmount).appendChild(dragpreview);
		let rects = BDFDB.getRects(dragpreview);
		BDFDB.toggleEles(dragpreview, false);
		dragpreview.style.setProperty("pointer-events", "none", "important");
		dragpreview.style.setProperty("left", e.clientX - (rects.width/2) + "px", "important");
		dragpreview.style.setProperty("top", e.clientY - (rects.height/2) + "px", "important");
		return dragpreview;
	}

	updateDragPreview (dragpreview, e) {
		if (!Node.prototype.isPrototypeOf(dragpreview)) return;
		BDFDB.toggleEles(dragpreview, true);
		let rects = BDFDB.getRects(dragpreview);
		dragpreview.style.setProperty("left", e.clientX - (rects.width/2) + "px", "important");
		dragpreview.style.setProperty("top", e.clientY - (rects.height/2) + "px", "important");
	}

	updatePinnedPositions (type) {
		let newPinned = {}, oldPinned = BDFDB.loadAllData(this, type);
		let pins = Array.from(document.querySelectorAll(type == "pinnedRecents" ? `.pinned-dm` : `${BDFDB.dotCNS.dmchannels + BDFDB.dotCN.dmchannel}.pinned`)).map(div => {return div.getAttribute("channelid");}).reverse();
		for (let i in pins) if (pins[i]) newPinned[pins[i]] = parseInt(i);
		for (let id in oldPinned) if (newPinned[id] == undefined) newPinned[id] = Object.keys(newPinned).length;
		BDFDB.saveAllData(newPinned, this, type);
	}

	updatePinnedRecent (id) {
		let pinneddmdiv = document.querySelector(`.pinned-dm[channelid="${id}"]`);
		if (Node.prototype.isPrototypeOf(pinneddmdiv)) {
			let count = this.UnreadUtils.getUnreadCount(id);
			let showpin = BDFDB.getData("showPinIcon", this, "settings");
			
			let dmdiv = BDFDB.getDmDiv(id);
			let pinneddmiconwrapper = pinneddmdiv.querySelector(BDFDB.dotCN.guildiconwrapper);
			let pinneddmdivpill = pinneddmdiv.querySelector(BDFDB.dotCN.guildpillitem);
			let iconbadge = pinneddmdiv.querySelector(BDFDB.dotCN.guildupperbadge);
			let notificationbadge = pinneddmdiv.querySelector(BDFDB.dotCN.guildlowerbadge);
			
			BDFDB.toggleClass(pinneddmdiv, "has-new-messages", count > 0);
			let selected = this.CurrentChannelStore.getChannelId() == id;
			pinneddmiconwrapper.style.setProperty("border-radius", selected ? "30%" : "50%");
			pinneddmdivpill.style.setProperty("opacity", selected ? 1 : (count ? 0.7 : 0));
			pinneddmdivpill.style.setProperty("height", selected ? "40px" : "8px");
			pinneddmdivpill.style.setProperty("transform", "translate3d(0px, 0px, 0px)");
			
			BDFDB.toggleEles(iconbadge, showpin);
			notificationbadge.firstElementChild.innerText = count;
			notificationbadge.firstElementChild.style.setProperty("width", `${count > 99 ? 30 : (count > 9 ? 22 : 16)}px`);
			notificationbadge.firstElementChild.style.setProperty("padding-right", `${count > 99 ? 0 : (count > 9 ? 0 : 1)}px`);
			BDFDB.toggleEles(notificationbadge, count > 0);
			
			let masks = pinneddmdiv.querySelectorAll("mask rect");
			masks[0].setAttribute("transform", showpin ? "translate(0 0)" : "translate(20 -20)");
			masks[1].setAttribute("transform", count > 0 ? "translate(0 0)" : "translate(20 20)");
			masks[1].setAttribute("x", `${count > 99 ? 14 : (count > 9 ? 22 : 28)}`);
			masks[1].setAttribute("width", `${count > 99 ? 38 : (count > 9 ? 30 : 24)}`);
		}
	}

	hideNativeDM (id) {
		let dmdiv = BDFDB.getDmDiv(id);
		if (Node.prototype.isPrototypeOf(dmdiv)) {
			BDFDB.toggleEles(dmdiv, false);
			BDFDB.addClass(dmdiv, "hidden-by-pin");
		}
	}

	unhideNativeDM (id) {
		let dmdiv = BDFDB.getDmDiv(id);
		if (Node.prototype.isPrototypeOf(dmdiv) && BDFDB.containsClass(dmdiv, "hidden-by-pin")) {
			BDFDB.toggleEles(dmdiv, true);
			BDFDB.removeClass(dmdiv, "hidden-by-pin");
		}
	}

	addHoverBehaviour (div, id) {
		let divinner = div.querySelector(BDFDB.dotCN.guildinnerwrapper);
		let diviconwrapper = div.querySelector(BDFDB.dotCN.guildiconwrapper);
		let divpillitem = div.querySelector(BDFDB.dotCN.guildpillitem);
		
		let pillvisible = divpillitem.style.getPropertyValue("opacity") != 0;

		let borderRadius = new this.Animations.Value(0);
		borderRadius
			.interpolate({
				inputRange: [0, 1],
				outputRange: [50, 30]
			})
			.addListener((value) => {
				diviconwrapper.style.setProperty("border-radius", `${this.CurrentChannelStore.getChannelId() == id ? 30 : value.value}%`);
			});

		let pillHeight = new this.Animations.Value(0);
		pillHeight
			.interpolate({
				inputRange: [0, 1],
				outputRange: [8, 20]
			})
			.addListener((value) => {
				divpillitem.style.setProperty("height", `${this.CurrentChannelStore.getChannelId() == id ? 40 : value.value}px`);
			});

		let pillOpacity = new this.Animations.Value(0);
		pillOpacity
			.interpolate({
				inputRange: [0, 1],
				outputRange: [0, 0.7]
			})
			.addListener((value) => {
				divpillitem.style.setProperty("opacity", `${this.CurrentChannelStore.getChannelId() == id ? 1 : value.value}`);
			});
		
		let animate = (v) => {
			this.Animations.parallel([
				this.Animations.timing(borderRadius, {toValue: v, duration: 200}),
				this.Animations.spring(pillHeight, {toValue: v, friction: 5})
			]).start();
		};
		
		let animate2 = (v) => {
			this.Animations.parallel([
				this.Animations.timing(pillOpacity, {toValue: v, duration: 200}),
			]).start();
		};

		divinner.addEventListener("mouseenter", () => {
			pillvisible = divpillitem.style.getPropertyValue("opacity") != 0;
			if (this.CurrentChannelStore.getChannelId() != id) {
				animate(1);
				if (!pillvisible) animate2(1);
			}
		})
		divinner.addEventListener("mouseleave", () => {
			if (this.CurrentChannelStore.getChannelId() != id) {
				animate(0);
				if (!pillvisible) animate2(0);
			}
		});
	}

	addHoverBehaviour2 (div) {
		/* based on stuff from Zerebos */
		let divinner = div.querySelector(BDFDB.dotCN.guildinner);
		let divicon = div.querySelector(BDFDB.dotCN.dmguildavatarinner);
		let backgroundColor = new this.Animations.Value(0);
		backgroundColor
			.interpolate({
				inputRange: [0, 1],
				outputRange: [this.DiscordConstants.Colors.CHANNELS_GREY, this.DiscordConstants.Colors.BRAND_PURPLE]
			})
			.addListener((value) => {
				if (BDFDB.containsClass(divicon, BDFDB.disCN.avatarnoicon)) {
					let comp = BDFDB.colorCONVERT(value.value, "RGBCOMP");
					if (comp) divinner.style.setProperty("background-color", `rgb(${comp[0]}, ${comp[1]}, ${comp[2]})`);
				}
			});

		let borderRadius = new this.Animations.Value(0);
		borderRadius
			.interpolate({
				inputRange: [0, 1],
				outputRange: [25, 15]
			})
			.addListener((value) => {
				divinner.style.setProperty("border-radius", `${value.value}px`);
			});

		let animate = (v) => {
			this.Animations.parallel([
				this.Animations.timing(backgroundColor, {toValue: v, duration: 200}),
				this.Animations.spring(borderRadius, {toValue: v, friction: 3})
			]).start();
		};

		div.addEventListener("mouseenter", () => {animate(1);})
		div.addEventListener("mouseleave", () => {if (!BDFDB.containsClass(div, BDFDB.disCN.guildselected)) animate(0);});
	}

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					context_pindm_text:				"Prikljucite Izravnu Poruku",
					context_pinchannel_text:		"Priložite popisu kanala",
					context_unpinchannel_text:		"Ukloni s popisa kanala",
					context_pinguild_text:			"Priložite popisu poslužitelja",
					context_unpinguild_text:		"Ukloni s popisa poslužitelja",
					header_pinneddms_text:			"Prikvačene Izravne Poruke"
				};
			case "da":		//danish
				return {
					context_pindm_text:				"Fastgør PB",
					context_pinchannel_text:		"Vedhæft til kanalliste",
					context_unpinchannel_text:		"Fjern fra kanalliste",
					context_pinguild_text:			"Vedhæft til serverliste",
					context_unpinguild_text:		"Fjern fra serverliste",
					header_pinneddms_text:			"Pinned Privat Beskeder"
				};
			case "de":		//german
				return {
					context_pindm_text:				"Direktnachricht anheften",
					context_pinchannel_text:		"An Kanalliste anheften",
					context_unpinchannel_text:		"Von Kanalliste loslösen",
					context_pinguild_text:			"An Serverliste anheften",
					context_unpinguild_text:		"Von Serverliste loslösen",
					header_pinneddms_text:			"Gepinnte Direktnachrichten"
				};
			case "es":		//spanish
				return {
					context_pindm_text:				"Anclar MD",
					context_pinchannel_text:		"Adjuntar a la lista de canales",
					context_unpinchannel_text:		"Deshazte de la lista de canales",
					context_pinguild_text:			"Adjuntar a la lista de servidores",
					context_unpinguild_text:		"Deshazte de la lista de servidores",
					header_pinneddms_text:			"Mensajes Directos Fijados"
				};
			case "fr":		//french
				return {
					context_pindm_text:				"Épingler MP",
					context_pinchannel_text:		"Épingler à la liste des chaînes",
					context_unpinchannel_text:		"Détacher de la liste des chaînes",
					context_pinguild_text:			"Épingler à la liste de serveurs",
					context_unpinguild_text:		"Détacher de la liste de serveurs",
					header_pinneddms_text:			"Messages Prives Épinglés"
				};
			case "it":		//italian
				return {
					context_pindm_text:				"Fissa il messaggio diretto",
					context_pinchannel_text:		"Allega alla lista dei canali",
					context_unpinchannel_text:		"Rimuovi dalla lista dei canali",
					context_pinguild_text:			"Allega alla lista dei server",
					context_unpinguild_text:		"Rimuovi dalla lista dei server",
					header_pinneddms_text:			"Messaggi Diretti Aggiunti"
				};
			case "nl":		//dutch
				return {
					context_pindm_text:				"PB pinnen",
					context_pinchannel_text:		"Pin naar de kanalenlijst",
					context_unpinchannel_text:		"Losmaken van kanalenlijst",
					context_pinguild_text:			"Pin naar de serverlijst",
					context_unpinguild_text:		"Losmaken van serverlijst",
					header_pinneddms_text:			"Vastgezette Persoonluke Berichten"
				};
			case "no":		//norwegian
				return {
					context_pindm_text:				"Fest DM",
					context_pinchannel_text:		"Fest på kanalliste",
					context_unpinchannel_text:		"Fjern fra kanalliste",
					context_pinguild_text:			"Fest på serverliste",
					context_unpinguild_text:		"Fjern fra serverlisten",
					header_pinneddms_text:			"Pinned Direktemeldinger"
				};
			case "pl":		//polish
				return {
					context_pindm_text:				"Przypnij PW",
					context_pinchannel_text:		"Dołącz do listy kanałów",
					context_unpinchannel_text:		"Usuń z listy kanałów",
					context_pinguild_text:			"Dołącz do listy serwerów",
					context_unpinguild_text:		"Usuń z listy serwerów",
					header_pinneddms_text:			"Prywatne Wiadomości Bezpośrednie"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_pindm_text:				"Fixar MD",
					context_pinchannel_text:		"Anexar à lista de canais",
					context_unpinchannel_text:		"Remover da lista de canais",
					context_pinguild_text:			"Anexar à lista de servidores",
					context_unpinguild_text:		"Remover da lista de servidores",
					header_pinneddms_text:			"Mensagens diretas fixadas"
				};
			case "fi":		//finnish
				return {
					context_pindm_text:				"Kiinnitä yksityisviestit",
					context_pinchannel_text:		"Liitä kanavaluetteloon",
					context_unpinchannel_text:		"Poista kanavaluettelosta",
					context_pinguild_text:			"Liitä palvelinluetteloon",
					context_unpinguild_text:		"Poista palvelinluettelosta",
					header_pinneddms_text:			"Liitetyt yksityisviestit"
				};
			case "sv":		//swedish
				return {
					context_pindm_text:				"Fäst DM",
					context_pinchannel_text:		"Fäst till kanallista",
					context_unpinchannel_text:		"Ta bort från kanallistan",
					context_pinguild_text:			"Fäst till servernlista",
					context_unpinguild_text:		"Ta bort från servernlista",
					header_pinneddms_text:			"Inlagda Direktmeddelanden"
				};
			case "tr":		//turkish
				return {
					context_pindm_text:				"DM'yi Sabitle",
					context_pinchannel_text:		"Kanal listesine ekle",
					context_unpinchannel_text:		"Kanal listesinden kaldır",
					context_pinguild_text:			"Sunucu listesine ekle",
					context_unpinguild_text:		"Sunucu listesinden kaldır",
					header_pinneddms_text:			"Direkt Mesajlar Sabitleyin"
				};
			case "cs":		//czech
				return {
					context_pindm_text:				"Připnout PZ",
					context_pinchannel_text:		"Připojení k seznamu kanálů",
					context_unpinchannel_text:		"Odstranit ze seznamu kanálů",
					context_pinguild_text:			"Připojit ke seznamu serverů",
					context_unpinguild_text:		"Odstranit ze seznamu serverů",
					header_pinneddms_text:			"Připojené Přímá Zpráva"
				};
			case "bg":		//bulgarian
				return {
					context_pindm_text:				"Закачени ДС",
					context_pinchannel_text:		"Прикачете към списъка с канали",
					context_unpinchannel_text:		"Премахване от списъка с канали",
					context_pinguild_text:			"Прикачване към списъка със сървъри",
					context_unpinguild_text:		"Премахване от списъка със сървъри",
					header_pinneddms_text:			"Свързани директни съобщения"
				};
			case "ru":		//russian
				return {
					context_pindm_text:				"Закрепить ЛС",
					context_pinchannel_text:		"Прикрепить к списку каналов",
					context_unpinchannel_text:		"Удалить из списка каналов",
					context_pinguild_text:			"Присоединить к списку серверов",
					context_unpinguild_text:		"Удалить из списка серверов",
					header_pinneddms_text:			"Прикрепленные Личные Сообщения"
				};
			case "uk":		//ukrainian
				return {
					context_pindm_text:				"Закріпити ОП",
					context_pinchannel_text:		"Додайте до списку каналів",
					context_unpinchannel_text:		"Видалити зі списку каналів",
					context_pinguild_text:			"Додайте до списку серверів",
					context_unpinguild_text:		"Видалити зі списку серверів",
					header_pinneddms_text:			"Прикріплені oсобисті повідомлення"
				};
			case "ja":		//japanese
				return {
					context_pindm_text:				"DMピン",
					context_pinchannel_text:		"チャンネルリストに添付",
					context_unpinchannel_text:		"チャンネルリストから削除",
					context_pinguild_text:			"サーバーリストに添付",
					context_unpinguild_text:		"サーバーリストから削除",
					header_pinneddms_text:			"固定された直接メッセージ"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_pindm_text:				"引腳直接留言",
					context_pinchannel_text:		"附加到頻道列表",
					context_unpinchannel_text:		"從頻道列表中刪除",
					context_pinguild_text:			"附加到服務器列表",
					context_unpinguild_text:		"從服務器列表中刪除",
					header_pinneddms_text:			"固定私人信息"
				};
			case "ko":		//korean
				return {
					context_pindm_text:				"비공개 메시지 고정",
					context_pinchannel_text:		"채널 목록에 첨부",
					context_unpinchannel_text:		"채널 목록에서 삭제",
					context_pinguild_text:			"서버 목록에 첨부",
					context_unpinguild_text:		"서버 목록에서 제거",
					header_pinneddms_text:			"고정 된 비공개 메시지"
				};
			default:		//default: english
				return {
					context_pindm_text:				"Pin DM",
					context_pinchannel_text:		"Pin to Channellist",
					context_unpinchannel_text:		"Unpin from Channellist",
					context_pinguild_text:			"Pin to Serverlist",
					context_unpinguild_text:		"Unpin from Serverlist",
					header_pinneddms_text:			"Pinned Direct Messages"
				};
		}
	}
}