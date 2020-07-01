//META{"name":"BadgesEverywhere","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BadgesEverywhere","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BadgesEverywhere/BadgesEverywhere.plugin.js"}*//

var BadgesEverywhere = (_ => {
	var badgeClasses, requestedUsers = {}, loadedUsers = {}, requestQueue = {queue:[], timeout:null, id:null}, cacheTimeout;
	var nitroflag, boostflag;
	var settings = {}, badges = {}, indicators = {};
	
	const miniTypes = ["list", "chat"];
			
	return class BadgesEverywhere {
		getName () {return "BadgesEverywhere";} 

		getVersion () {return "1.6.0";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Displays Badges (Nitro, HypeSquad, etc...) in the chat/memberlist/userpopout.";}

		constructor () {
			this.patchedModules = {
				after: {
					MemberListItem: "render",
					MessageHeader: "default",
					UserPopout: "render"
				}
			};
		}

		initConstructor () {
			this.css = `
				${BDFDB.dotCN._badgeseverywherebadgeschat} {
					display: inline-flex;
					position: relative;
					top: 2px;
				}
				${BDFDB.dotCN._badgeseverywheremini} {
					margin-left: 5px;
				}
				${BDFDB.dotCNS.messagecozy + BDFDB.dotCNS.messageusername} + ${BDFDB.dotCN._badgeseverywherebadges},
				${BDFDB.dotCNS.messagecompact + BDFDB.dotCN.messagetimestampseparator} + ${BDFDB.dotCN._badgeseverywherebadges} {
					margin-left: 0;
				}
				${BDFDB.dotCNS.messagecompact + BDFDB.dotCN.messageusername} ~ ${BDFDB.dotCN._badgeseverywherebadges} {
					margin-right: .25rem;
					text-indent: 0;
				}
				
				${BDFDB.dotCN._badgeseverywherebadgesinner} {
					display: inline-grid;
					grid-auto-flow: column;
					grid-gap: 6px;
				}
				${BDFDB.dotCNS._badgeseverywheremini + BDFDB.dotCN._badgeseverywherebadgesinner} {
					grid-gap: 4px;
				}
				
				${BDFDB.dotCN._badgeseverywherebadge} {
					background-size: contain;
					background-position: center;
					background-repeat: no-repeat;
				}
				${BDFDB.dotCN._badgeseverywhereindicator} {
					display: flex;
					align-items: center;
					justify-content: center;
				}
				${BDFDB.dotCN._badgeseverywhereindicatorinner} {
					position: static !important;
					margin: 0 !important;
				}
				${BDFDB.dotCN._badgeseverywherebadge} {
					height: 17px !important;
				}
				${BDFDB.dotCN._badgeseverywheresize17} {
					width: 17px !important; min-width: 17px !important;
				}
				${BDFDB.dotCN._badgeseverywheresize21} {
					width: 21px !important; min-width: 21px !important;
				}
				${BDFDB.dotCN._badgeseverywheresize22} {
					width: 22px !important; min-width: 22px !important;
				}
				${BDFDB.dotCN._badgeseverywheresize24} {
					width: 24px !important; min-width: 24px !important;
				}
				${BDFDB.dotCN._badgeseverywhereindicator} {
					height: 14px !important; min-height: 14px !important; width: 14px !important; min-width: 14px !important;
				}
				${BDFDB.dotCN._badgeseverywhereindicatorinner} {
					height: inherit !important; min-height: inherit !important; width: inherit !important; min-width: inherit !important;
				}
				${BDFDB.dotCNS._badgeseverywheremini + BDFDB.dotCN._badgeseverywherebadge} {
					height: 14px !important;
				}
				${BDFDB.dotCNS._badgeseverywheremini + BDFDB.dotCN._badgeseverywheresize17} {
					width: 14px !important; min-width: 14px !important;
				}
				${BDFDB.dotCNS._badgeseverywheremini + BDFDB.dotCN._badgeseverywheresize21} {
					width: 18px !important; min-width: 18px !important;
				}
				${BDFDB.dotCNS._badgeseverywheremini + BDFDB.dotCN._badgeseverywheresize22} {
					width: 18px !important; min-width: 18px !important;
				}
				${BDFDB.dotCNS._badgeseverywheremini + BDFDB.dotCN._badgeseverywheresize24} {
					width: 19px !important; min-width: 19px !important;
				}
				${BDFDB.dotCNS._badgeseverywheremini + BDFDB.dotCN._badgeseverywhereindicator} {
					height: 12px !important; min-height: 12px !important; width: 12px !important; min-width: 12px !important;
				}
				#app-mount ${BDFDB.dotCNS._badgeseverywherebadgessettings + BDFDB.dotCN._badgeseverywherebadge} {
					width: 30px !important; min-width: 30px !important;
				}
				
				${BDFDB.dotCNS.userprofiletopsectionplaying + BDFDB.dotCN._badgeseverywherebadge} svg {
					color: unset !important;
				}

				${BDFDB.dotCNS.member + BDFDB.dotCN.memberpremiumicon + BDFDB.notCN._badgeseverywhereindicatorinner} {display: none;}
			`;

			this.defaults = {
				settings: {
					showInPopout:		{value:true, 	description:"Show Badge in User Popout."},
					showInChat:			{value:true, 	description:"Show Badge in Chat Window."},
					showInMemberList:	{value:true, 	description:"Show Badge in Member List."},
					useColoredVersion:	{value:true, 	description:"Use colored version of the Badges for Chat and Members."},
					showNitroDate:		{value:true, 	description:"Show the subscription date for Nitro/Boost Badges"}
				},
				badges: {
					"STAFF": {
						value: true,
						id: "Staff",
						name: "STAFF_BADGE_TOOLTIP",
						icon: "profileBadgeStaff",
						size: 17
					},
					"PARTNER": {
						value: true,
						id: "Partner",
						name: "PARTNER_BADGE_TOOLTIP",
						icon: "profileBadgePartner",
						size: 22
					},
					"HYPESQUAD": {
						value: true,
						id: "HypeSquad",
						name: "HYPESQUAD_BADGE_TOOLTIP",
						icon: "profileBadgeHypesquad",
						size: 17
					},
					"BUG_HUNTER_LEVEL_1": {
						value: true,
						id: "BugHunter1",
						name: "BUG_HUNTER_BADGE_TOOLTIP",
						icon: "profileBadgeBugHunterLevel1",
						size: 17,
						suffix: "Level 1"
					},
					"BUG_HUNTER_LEVEL_2": {
						value: true,
						id: "BugHunter2",
						name: "BUG_HUNTER_BADGE_TOOLTIP",
						icon: "profileBadgeBugHunterLevel2",
						size: 17,
						suffix: "Level 2"
					},
					"VERIFIED_DEVELOPER": {
						value: true,
						id: "VerifiedDeveloper",
						name: "VERIFIED_DEVELOPER_BADGE_TOOLTIP",
						icon: "profileBadgeVerifiedDeveloper",
						size: 17
					},
					"HYPESQUAD_ONLINE_HOUSE_1": {
						value: true,
						id: "HypeSquad1",
						name: "HypeSquad Bravery",
						icon: "profileBadgeHypeSquadOnlineHouse1",
						size: 17
					},
					"HYPESQUAD_ONLINE_HOUSE_2": {
						value: true,
						id: "HypeSquad2",
						name: "HypeSquad Brilliance",
						icon: "profileBadgeHypeSquadOnlineHouse2",
						size: 17
					},
					"HYPESQUAD_ONLINE_HOUSE_3": {
						value: true,
						id: "HypeSquad3",
						name: "HypeSquad Balance",
						icon: "profileBadgeHypeSquadOnlineHouse3",
						size: 17
					},
					"PREMIUM_EARLY_SUPPORTER": {
						value: true,
						id: "EarlySupporter",
						name: "EARLY_SUPPORTER_TOOLTIP",
						icon: "profileBadgeEarlySupporter",
						size: 24
					},
					"NITRO": {
						value: true,
						id: "Nitro",
						name: "Nitro",
						icon: "profileBadgePremium",
						size: 21
					},
					"GUILD_BOOST": {
						value: true,
						id: "NitroGuildBoost",
						name: "Nitro Guild Boost",
						icon: "profileGuildSubscriberlvl",
						size: 17,
						types: [1,2,3,4,5,6,7,8,9]
					}
				},
				indicators: {
					"CURRENT_GUILD_BOOST": {
						value: true,
						id: "CurrentGuildBoost",
						name: "Current Nitro Guild Boost",
						inner: `<svg name="PremiumGuildSubscriberBadge" class="${BDFDB.disCNS.memberpremiumicon + BDFDB.disCN.membericon}" aria-hidden="false" width="24" height="24" viewBox="0 0 8 12"><path d="M4 0L0 4V8L4 12L8 8V4L4 0ZM7 7.59L4 10.59L1 7.59V4.41L4 1.41L7 4.41V7.59Z" fill="currentColor"></path><path d="M2 4.83V7.17L4 9.17L6 7.17V4.83L4 2.83L2 4.83Z" fill="currentColor"></path></svg>`
					},
				}
			};

			for (let flagname in BDFDB.DiscordConstants.UserFlags) if (this.defaults.badges[flagname]) {
				if (BDFDB.LanguageUtils.LanguageStringsCheck[this.defaults.badges[flagname].name]) this.defaults.badges[flagname].name = BDFDB.LanguageUtils.LanguageStrings[this.defaults.badges[flagname].name];
				this.defaults.badges[BDFDB.DiscordConstants.UserFlags[flagname]] = this.defaults.badges[flagname];
				delete this.defaults.badges[flagname];
			}
			nitroflag = Math.max(...BDFDB.ObjectUtils.toArray(BDFDB.DiscordConstants.UserFlags)) * 2;
			this.defaults.badges[nitroflag] = this.defaults.badges.NITRO;
			delete this.defaults.badges.NITRO;
			boostflag = nitroflag * 2;
			this.defaults.badges[boostflag] = this.defaults.badges.GUILD_BOOST;
			delete this.defaults.badges.GUILD_BOOST;
			for (let flag in this.defaults.badges) if (!this.defaults.badges[flag].icon || isNaN(parseInt(flag))) delete this.defaults.badges[flag];
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let badges = BDFDB.DataUtils.get(this, "badges");
			let indicators = BDFDB.DataUtils.get(this, "indicators");
			let settingsPanel, settingsItems = [], innerItems = [];
			
			for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
			}));
			for (let flag in badges) innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["badges", flag],
				label: this.defaults.badges[flag].name + (this.defaults.badges[flag].suffix ? ` ${this.defaults.badges[flag].suffix}` : ""),
				value: badges[flag],
				labelchildren: this.createSettingsBadges(flag)
			}));
			for (let flag in indicators) innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["indicators", flag],
				label: this.defaults.indicators[flag].name + (this.defaults.indicators[flag].suffix ? ` ${this.defaults.indicators[flag].suffix}` : ""),
				value: indicators[flag],
				labelchildren: this.createSettingsBadges(flag)
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
				title: "Display Badges:",
				first: settingsItems.length == 0,
				last: true,
				children: innerItems
			}));
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
		}

		// Legacy
		load () {}

		start () {
			if (!window.BDFDB) window.BDFDB = {myPlugins:{}};
			if (window.BDFDB && window.BDFDB.myPlugins && typeof window.BDFDB.myPlugins == "object") window.BDFDB.myPlugins[this.getName()] = this;
			let libraryScript = document.querySelector("head script#BDFDBLibraryScript");
			if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("id", "BDFDBLibraryScript");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", _ => {this.initialize();});
				document.head.appendChild(libraryScript);
			}
			else if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(_ => {
				try {return this.initialize();}
				catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
			}, 30000);
		}

		initialize () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				if (this.started) return;
				BDFDB.PluginUtils.init(this);

				badgeClasses = BDFDB.ModuleUtils.findByProperties("profileBadgeStaff", "profileBadgePremium");

				requestedUsers = {}, loadedUsers = {};
				requestQueue = {queue:[], timeout:null, id:null};
				
				let badgeCache = BDFDB.DataUtils.load(this, "badgeCache");
				if (badgeCache) {
					let now = (new Date()).getTime(), month = 1000*60*60*24*30;
					for (let id in badgeCache) {
						if (now - badgeCache[id].date > month) delete badgeCache[id];
						else loadedUsers[id] = badgeCache[id];
					}
					BDFDB.DataUtils.save(badgeCache, this, "badgeCache");
				}
				
				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.DispatchApiUtils, "dispatch", {after: e => {
					if (BDFDB.ObjectUtils.is(e.methodArguments[0]) && e.methodArguments[0].type == BDFDB.DiscordConstants.ActionTypes.USER_PROFILE_MODAL_FETCH_SUCCESS && e.methodArguments[0].user) {
						let userCopy = Object.assign({}, e.methodArguments[0].user);
						if (e.methodArguments[0].premium_since) userCopy.flags += nitroflag;
						userCopy.premium_since = e.methodArguments[0].premium_since;
						if (e.methodArguments[0].premium_guild_since) userCopy.flags += boostflag;
						userCopy.premium_guild_since = e.methodArguments[0].premium_guild_since;
						loadedUsers[e.methodArguments[0].user.id] = BDFDB.ObjectUtils.extract(userCopy, "flags", "premium_since", "premium_guild_since");
						loadedUsers[e.methodArguments[0].user.id].date = (new Date()).getTime();
						
						BDFDB.TimeUtils.clear(cacheTimeout);
						cacheTimeout = BDFDB.TimeUtils.timeout(_ => {BDFDB.DataUtils.save(loadedUsers, this, "badgeCache");}, 5000);
						
						if (requestQueue.id && requestQueue.id == e.methodArguments[0].user.id) {
							while (requestedUsers[requestQueue.id].length) BDFDB.ReactUtils.forceUpdate(requestedUsers[requestQueue.id].pop());
							requestQueue.id = null;
							BDFDB.TimeUtils.timeout(_ => {this.runQueue();}, 1000);
						}
					}
				}});

				this.forceUpdateAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;
				
				BDFDB.TimeUtils.clear(requestQueue.timeout);

				this.forceUpdateAll();
				
				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
		}

		processMemberListItem (e) {
			if (e.instance.props.user && settings.showInMemberList) {
				this.injectBadges(e.instance, BDFDB.ReactUtils.getValue(e.returnvalue, "props.decorators.props.children"), e.instance.props.user, "list");
			}
		}

		processMessageHeader (e) {
			if (e.instance.props.message && settings.showInChat) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue.props.children.slice(1), {name: "Popout", props: [["className", BDFDB.disCN.messageusername]]});
				if (index > -1) this.injectBadges(e.instance, children, e.instance.props.message.author, "chat");
			}
		}

		processUserPopout (e) {
			if (e.instance.props.user && settings.showInPopout) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "CustomStatus"});
				if (index > -1) this.injectBadges(e.instance, children, e.instance.props.user, "popout", e.instance.props.activity && e.instance.props.activity.type != BDFDB.DiscordConstants.ActivityTypes.CUSTOM_STATUS);
			}
		}

		injectBadges (instance, children, user, type, colored) {
			if (!BDFDB.ArrayUtils.is(children) || !user || user.bot) return;
			if (loadedUsers[user.id] && ((new Date()).getTime() - loadedUsers[user.id].date < 1000*60*60*24*7)) children.push(this.createBadges(user, type, colored));
			else if (!BDFDB.ArrayUtils.is(requestedUsers[user.id])) {
				requestedUsers[user.id] = [instance];
				requestQueue.queue.push(user.id);
				this.runQueue();
			}
			else requestedUsers[user.id].push(instance);
		}
		
		runQueue () {
			if (!requestQueue.id) {
				let id = requestQueue.queue.shift();
				if (id) {
					requestQueue.id = id;
					BDFDB.TimeUtils.clear(requestQueue.timeout);
					requestQueue.timeout = BDFDB.TimeUtils.timeout(_ => {
						requestQueue.id = null;
						this.runQueue();
					}, 30000);
					BDFDB.LibraryModules.UserProfileUtils.fetchProfile(id);
				}
			}
		}
		
		createWrapper (renderedBadges, type, uncolored) {
			let colorWrapper = BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(`<span class="${uncolored ? BDFDB.disCN.userprofiletopsectionplaying : BDFDB.disCN.userprofiletopsectionnormal}" style="all: unset !important;"></span>`));
			colorWrapper.props.children = BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN._badgeseverywherebadgesinner,
				children: renderedBadges
			});
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._badgeseverywherebadges, BDFDB.disCN[`_badgeseverywherebadges${type}`], miniTypes.includes(type) && BDFDB.disCN._badgeseverywheremini), 
				children: colorWrapper
			});
		}

		createBadges (user, type, uncolored) {
			let renderedBadges = [];
			for (let flag in badges) if ((loadedUsers[user.id].flags | flag) == loadedUsers[user.id].flags && badges[flag]) {
				renderedBadges.push(this.createBadge(settings.showNitroDate ? this.getTimeString(user.id, flag) : null, type, flag, flag == boostflag ? BDFDB.LibraryModules.GuildBoostUtils.getUserLevel(loadedUsers[user.id].premium_guild_since) : null));
			}
			let member = BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), user.id);
			if (indicators.CURRENT_GUILD_BOOST && member && member.premiumSince) {
				renderedBadges.push(this.createBadge(settings.showNitroDate ? this.getTimeString(user.id, "CURRENT_GUILD_BOOST") : null, type, "CURRENT_GUILD_BOOST"));
			}
			if (!renderedBadges.length) return null;
			else return this.createWrapper(renderedBadges, type, uncolored == undefined ? !settings.useColoredVersion : uncolored);
		}
		
		createBadge (timestring, type, flag, rank) {
			let data = this.defaults.badges[flag] || this.defaults.indicators[flag];
			if (!data) return null;
			let inner = data.inner && BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(data.inner));
			if (inner) inner.props.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._badgeseverywhereindicatorinner, inner.props.className);
			else inner = null;
			return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
				text: timestring || (data.name + (data.suffix ? ` ${data.suffix}` : "") + (rank ? ` Level ${rank}` : "")),
				tooltipConfig: {style: "white-space: nowrap; max-width: unset;"},
				children: BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._badgeseverywherebadge, data.inner && BDFDB.disCN._badgeseverywhereindicator, data.icon && badgeClasses[data.icon + (rank || "")], data.size && BDFDB.disCN[`_badgeseverywheresize${data.size}`]),
					badgeId: data.id,
					children: inner
				})
			});
		}
		
		getTimeString (id, flag) {
			let member = BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), id);
			if (flag == nitroflag) return BDFDB.LanguageUtils.LanguageStringsFormat("PREMIUM_BADGE_TOOLTIP", new Date(loadedUsers[id].premium_since));
			else if (flag == boostflag) return BDFDB.LanguageUtils.LanguageStringsFormat("PREMIUM_GUILD_SUBSCRIPTION_TOOLTIP", new Date(loadedUsers[id].premium_guild_since));
			else if (member && flag == "CURRENT_GUILD_BOOST") return BDFDB.LanguageUtils.LanguageStringsFormat("PREMIUM_GUILD_SUBSCRIPTION_TOOLTIP", new Date(member.premiumSince));
			return null;
		}
		
		createSettingsBadges (flag) {
			let data = this.defaults.badges[flag] || this.defaults.indicators[flag];
			if (!data) return null;
			let eles = null;
			if (Array.isArray(data.types)) {
				let renderedBadges = [];
				for (let rank of data.types) renderedBadges.push(this.createBadge(null, "settings", flag, rank));
				eles = BDFDB.ReactUtils.createElement("div", {children: [this.createWrapper(renderedBadges, "settings", false), BDFDB.ReactUtils.createElement("br"), this.createWrapper(renderedBadges, "settings", true)]});
			}
			else {
				let badge = this.createBadge(null, "settings", flag);
				eles = [this.createWrapper(badge, "settings", false), this.createWrapper(badge, "settings", true)];
			}
			return eles;
		}
		
		forceUpdateAll() {
			settings = BDFDB.DataUtils.get(this, "settings");
			badges = BDFDB.DataUtils.get(this, "badges");
			indicators = BDFDB.DataUtils.get(this, "indicators");
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
			BDFDB.MessageUtils.rerenderAll();
		}
	}
})();