//META{"name":"BetterFriendList","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterFriendList","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterFriendList/BetterFriendList.plugin.js"}*//

var BetterFriendList = (_ => {
	var rerenderTimeout, sortKey, sortReversed, searchQuery, searchTimeout;
	var settings = {};
	
	const placeHolderId = "PLACEHOLDER_BETTERFRIENDLIST";
	
	const statusSortOrder = {
		online: 0,
		streaming: 1,
		idle: 2,
		dnd: 3,
		offline: 4,
		invisible: 5,
		unknown: 6
	};
	
	return class BetterFriendList {
		getName () {return "BetterFriendList";}

		getVersion () {return "1.2.9";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds extra controls to the friends page, like sort by name/status, search and all/request/blocked amount.";}

		initConstructor () {
			sortKey = null;
			sortReversed = false;
			searchQuery = "";
			
			this.css = `
				${BDFDB.dotCN.peoplewrapper} > * {
					justify-content: unset;
				}
				${BDFDB.dotCNS.peoplewrapper + BDFDB.dotCN.userinfo} {
					flex: 1 1 auto;
				}
				${BDFDB.dotCN._betterfriendlistmutualguilds} {
					margin-left: 13px;
					width: 200px;
				}
				${BDFDB.dotCN._betterfriendlisttitle} {
					width: 200px;
				}
				${BDFDB.dotCN._betterfriendlistnamecell} {
					width: 150px;
				}
			`;

			this.defaults = {
				settings: {
					addTotalAmount:		{value:true, 	description:"Add total amount for all/requested/blocked"},
					addSortOptions:		{value:true, 	description:"Add sort options"},
					addSearchbar:		{value:true, 	description:"Add searchbar"},
					addMutualGuild:		{value:true, 	description:"Add mutual servers in friend list"}
				}
			};
		}

		constructor () {
			this.changelog = {
				"progress":[["New Features & Name","Name was changed from BetterFriendCount to BetterFriendList and new features were added"]],
				"fixed":[["Empty Search","Empty search no longer stops the friend list from being displayed"]],
				"improved":[["Settings","You can now disable the single features of this plugin"]],
				"added":[["Mutual Servers","Mutual servers are now displayed in the friend list again"]]
			};

			this.patchedModules = {
				before: {
					PeopleListSectionedLazy: "default",
				},
				after: {
					TabBar: "render",
					PeopleListSectionedLazy: "default",
					FriendRow: "render",
					PendingRow: "default",
					BlockedRow: "render",
					PeopleListItem: ["render", "componentWillMount","componentWillUnmount"]
				}
			};
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settingsPanel, settingsItems = [];
			
			for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
			}));
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
		}
		
		// Legacy
		load () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) BDFDB.PluginUtils.load(this);
		}

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

				this.forceUpdateAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

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

		processTabBar (e) {
			if (settings.addTotalAmount && e.returnvalue.props.children) for (let checkChild of e.returnvalue.props.children) if (checkChild && checkChild.props.id == "ADD_FRIEND") {
				let relationships = BDFDB.LibraryModules.FriendUtils.getRelationships(), relationshipCount = {};
				for (let type in BDFDB.DiscordConstants.RelationshipTypes) relationshipCount[type] = 0;
				for (let id in relationships) relationshipCount[relationships[id]]++;
				for (let child of e.returnvalue.props.children) if (child && child.props.id != "ADD_FRIEND") {
					let newChildren = [child.props.children].flat().filter(child => BDFDB.ReactUtils.getValue(child, "type.displayName") != "NumberBadge");
					switch (child.props.id) {
						case "ALL":
							newChildren.push(this.createBadge(relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.FRIEND]));
							break;
						case "ONLINE":
							newChildren.push(this.createBadge(BDFDB.LibraryModules.StatusMetaUtils.getOnlineFriendCount()));
							break;
						case "PENDING":
							newChildren.push(this.createBadge(relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.PENDING_INCOMING]));
							newChildren.push(this.createBadge(relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.PENDING_OUTGOING]));
							break;
						case "BLOCKED":
							newChildren.push(this.createBadge(relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.BLOCKED]));
							break;
					}
					child.props.children = newChildren;
				}
				break;
			}
		}

		processPeopleListSectionedLazy (e) {
			if (sortKey || searchQuery) {
				e.instance.props.statusSections = [].concat(e.instance.props.statusSections).map(section => {
					let newSection = [].concat(section);
					if (searchQuery) {
						let usedSearchQuery = searchQuery.toLowerCase();
						newSection = newSection.filter(user => user && typeof user.usernameLower == "string" && user.usernameLower.indexOf(usedSearchQuery) > -1);
					}
					if (sortKey) {
						newSection = BDFDB.ArrayUtils.keySort(newSection.map(user => Object.assign({}, user, {statusIndex: statusSortOrder[user.status]})), sortKey);
						if (sortReversed) newSection.reverse();
					}
					if (!newSection.length) {
						let placeholder = new BDFDB.DiscordObjects.User({
							id: placeHolderId,
							username: placeHolderId
						});
						if (placeholder) newSection.push(new BDFDB.DiscordObjects.Relationship({
							activities: [],
							applicationStream: null,
							isMobile: false,
							key: placeHolderId,
							mutualGuilds: [],
							mutualGuildsLength: 0,
							status: "offline",
							type: BDFDB.DiscordConstants.RelationshipTypes.NONE,
							user: placeholder,
							usernameLower: placeholder.usernameNormalized
						}));
					}
					return newSection;
				});
			}
			let getSectionTitle = e.instance.props.getSectionTitle;
			e.instance.props.getSectionTitle = (...args) => {
				let users = e.instance.props.statusSections.flat(10);
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
					align: BDFDB.LibraryComponents.Flex.Align.CENTER,
					children: [
						BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._betterfriendlisttitle,
							children: getSectionTitle(...args).replace(users.length, users.filter(u => u && u.key != placeHolderId).length)
						}),
						settings.addSortOptions && [
							{key: "usernameLower", label: BDFDB.LanguageUtils.LanguageStrings.FRIENDS_COLUMN_NAME},
							{key: "statusIndex", label: BDFDB.LanguageUtils.LanguageStrings.FRIENDS_COLUMN_STATUS}
						].filter(n => n).map(data => BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.tableheadercellwrapper, BDFDB.disCN.tableheadercell, BDFDB.disCN._betterfriendlistnamecell, sortKey == data.key && BDFDB.disCN.tableheadercellsorted, BDFDB.disCN.tableheadercellclickable),
							children: BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.tableheadercellcontent,
								children: [
									data.label,
									sortKey == data.key && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
										className: BDFDB.disCN.tableheadersorticon,
										name: BDFDB.LibraryComponents.SvgIcon.Names[sortReversed ? "ARROW_UP" : "ARROW_DOWN"]
									})
								].filter(n => n)
							}),
							onClick: event => {
								if (sortKey == data.key) {
									if (!sortReversed) sortReversed = true;
									else {
										sortKey = null;
										sortReversed = false;
									}
								}
								else {
									sortKey = data.key;
									sortReversed = false;
								}
								this.rerenderList();
							}
						})),
						settings.addSearchbar && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SearchBar, {
								query: searchQuery,
								onChange: value => {
									BDFDB.TimeUtils.clear(searchTimeout);
									searchTimeout = BDFDB.TimeUtils.timeout(_ => {
										searchQuery = value;
										this.rerenderList();
									}, 1000);
								},
								onClear: _ => {
									searchQuery = "";
									this.rerenderList();
								}
							})
						})
					].flat(10).filter(n => n)
				});
			};
		}
		
		processFriendRow (e) {
			e.returnvalue.props.mutualGuilds = e.instance.props.mutualGuilds;
		}
		
		processPendingRow (e) {
			this.processFriendRow(e);
		}
		
		processBlockedRow (e) {
			this.processFriendRow(e);
		}
		
		processPeopleListItem (e) {
			if (e.node) {
				BDFDB.TimeUtils.clear(rerenderTimeout);
				rerenderTimeout = BDFDB.TimeUtils.timeout(_ => {BDFDB.ModuleUtils.forceAllUpdates(this, "TabBar");}, 1000);
			}
			else {
				if (e.instance.props.user.id == placeHolderId) return null;
				else if (settings.addMutualGuild && e.instance.props.mutualGuilds && e.instance.props.mutualGuilds.length) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "UserInfo"});
					if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildSummaryItem, {
						className: BDFDB.disCN._betterfriendlistmutualguilds,
						guilds: e.instance.props.mutualGuilds,
						tooltip: true,
						max: 10
					}, true));
				}
			}
		}
		
		createBadge (amount) {
			return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.NumberBadge, {
				className: BDFDB.disCN.peoplesbadge,
				count: amount,
				style: {marginLeft: 6}
			});
		}
		
		rerenderList () {
			let selectedButton = document.querySelector(BDFDB.dotCNS.peoplestabbar + BDFDB.dotCN.settingsitemselected);
			if (selectedButton) selectedButton.click();
		}
		
		forceUpdateAll() {
			settings = BDFDB.DataUtils.get(this, "settings");

			BDFDB.ModuleUtils.forceAllUpdates(this);
			this.rerenderList();
		}
	}
})();

module.exports = BetterFriendList;