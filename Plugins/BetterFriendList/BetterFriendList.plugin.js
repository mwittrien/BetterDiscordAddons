/**
 * @name BetterFriendList
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.6.1
 * @description Adds extra Controls to the Friends Page, for example sort by Name/Status, Search and Amount Numbers, new Tabs
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterFriendList/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/BetterFriendList/BetterFriendList.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		"added": {
			"Blocked and Ignored Tab": "Brought back the Blocked Tab and added the Ignored Tab, can be disabled in the Plugin Settings"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js").then(r => {
				if (!r || r.status != 200) throw new Error();
				else return r.text();
			}).then(b => {
				if (!b) throw new Error();
				else return require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.UI.showToast("Finished downloading BDFDB Library", {type: "success"}));
			}).catch(error => {
				BdApi.UI.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.UI.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var rerenderTimeout, sortKey, sortReversed;
		
		const customSections = {
			BLOCKED: "BLOCKED",
			FAVORITES: "FAVORIZED_FRIENDS",
			HIDDEN: "HIDDEN_FRIENDS",
			IGNORED: "IGNORED"
		};
		const placeHolderId = "PLACEHOLDER_BETTERFRIENDLIST";
		
		var favorizedFriends = [], hiddenFriends = [];
		var currentSection = null;
		
		const statusSortOrder = {
			online: 0,
			streaming: 1,
			idle: 2,
			dnd: 3,
			offline: 4,
			invisible: 5,
			unknown: 6
		};
		
		return class BetterFriendList extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						addTotalAmount:			{value: true, 	description: "Adds total Amount for All/Requested/Blocked"},
						addBlockedCategory:		{value: true, 	description: "Adds Blocked Category"},
						addIgnoredCategory:		{value: true, 	description: "Adds Ignored Category"},
						addFavorizedCategory:		{value: true, 	description: "Adds Favorites Category"},
						addHiddenCategory:		{value: true, 	description: "Adds Hidden Category"},
						addSortOptions:			{value: true, 	description: "Adds Sort Options"},
						addMutualGuild:			{value: true, 	description: "Adds mutual Servers in Friend List"}
					}
				};

				this.modulePatches = {
					before: [
						"AnalyticsContext",
						"PeopleListSectionedLazy",
						"PeopleListSectionedNonLazy",
						"TabBar"
					],
					after: [
						"PeopleListItem",
						"TabBar"
					],
					componentDidMount: [
						"PeopleListItem"
					],
					componentWillUnmount: [
						"PeopleListItem"
					]
				};
				
				this.css = `
					${BDFDB.dotCNS.peoplestabbar + BDFDB.dotCN.peoplesbadge} {
						background-color: var(--background-accent);
						margin-left: 6px;
					}
					${BDFDB.dotCN._betterfriendlisttitle} {
						width: 200px;
					}
					${BDFDB.dotCN._betterfriendlistnamecell} {
						width: 200px;
					}
					${BDFDB.dotCNS.peoplespeoplecolumn + BDFDB.dotCN.searchbar} {
						padding-bottom: 0;
						margin-bottom: 0;
					}
					${BDFDB.dotCN.peoplesuser} {
						flex: 1 1 auto;
					}
					${BDFDB.dotCN.peoplesactions} {
						flex: 0 0 auto;
					}
					${BDFDB.dotCN._betterfriendlistmutualguilds} {
						flex: 0 0 200px;
						margin-left: 13px;
					}
				`;
			}
			
			onStart () {
				sortKey = null;
				sortReversed = false;
				currentSection = null;

				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
				
						for (let key in this.defaults.general) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["general", key],
							label: this.defaults.general[key].description,
							value: this.settings.general[key]
						}));
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				favorizedFriends = BDFDB.DataUtils.load(this, "favorizedFriends");
				favorizedFriends = !BDFDB.ArrayUtils.is(favorizedFriends) ? [] : favorizedFriends;
				hiddenFriends = BDFDB.DataUtils.load(this, "hiddenFriends");
				hiddenFriends = !BDFDB.ArrayUtils.is(hiddenFriends) ? [] : hiddenFriends;
				
				BDFDB.PatchUtils.forceAllUpdates(this);
				this.rerenderList();
			}
			
			onUserContextMenu (e) {
				if (!e.instance.props.user || !BDFDB.LibraryStores.RelationshipStore.isFriend(e.instance.props.user.id)) return;
				let favorized = favorizedFriends.indexOf(e.instance.props.user.id) > -1;
				let hidden = hiddenFriends.indexOf(e.instance.props.user.id) > -1;
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "remove-friend"});
				if (index > -1) children.splice(index + 1, 0, this.settings.general.addFavorizedCategory && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
					label: favorized ? this.labels.context_unfavorizefriend : this.labels.context_favorizefriend,
					id: BDFDB.ContextMenuUtils.createItemId(this.name, favorized ? "unfavorize-friend" : "favorize-friend"),
					action: _ => {
						if (favorized) BDFDB.ArrayUtils.remove(favorizedFriends, e.instance.props.user.id, true);
						else {
							favorizedFriends.push(e.instance.props.user.id);
							BDFDB.ArrayUtils.remove(hiddenFriends, e.instance.props.user.id, true);
						}
						BDFDB.DataUtils.save(favorizedFriends, this, "favorizedFriends");
						BDFDB.DataUtils.save(hiddenFriends, this, "hiddenFriends");
						this.rerenderList();
					}
				}), this.settings.general.addHiddenCategory && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
					label: hidden ? this.labels.context_unhidefriend : this.labels.context_hidefriend,
					id: BDFDB.ContextMenuUtils.createItemId(this.name, hidden ? "unhide-friend" : "hide-friend"),
					action: _ => {
						if (hidden) BDFDB.ArrayUtils.remove(hiddenFriends, e.instance.props.user.id, true);
						else {
							BDFDB.ArrayUtils.remove(favorizedFriends, e.instance.props.user.id, true);
							hiddenFriends.push(e.instance.props.user.id);
						}
						BDFDB.DataUtils.save(favorizedFriends, this, "favorizedFriends");
						BDFDB.DataUtils.save(hiddenFriends, this, "hiddenFriends");
						this.rerenderList();
					}
				}));
			}
			
			processTabBar (e) {
				if (e.instance.props.children && e.instance.props.children.some(c => c && c.props && c.props.id == BDFDB.DiscordConstants.FriendsSections.ADD_FRIEND)) {
					let relationships = BDFDB.LibraryStores.RelationshipStore.getRelationships(), relationshipCount = {};
					for (let type in BDFDB.DiscordConstants.RelationshipTypes) relationshipCount[type] = 0;
					for (let id in relationships) if (!this.settings.general.addHiddenCategory || (hiddenFriends.indexOf(id) == -1 || relationships[id] != BDFDB.DiscordConstants.RelationshipTypes.FRIEND)) relationshipCount[relationships[id]]++;
					relationshipCount.IGNORED = BDFDB.LibraryStores.RelationshipStore.getIgnoredIDs().length;
					currentSection = e.instance.props.selectedItem;
					let hasFriends = relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.FRIEND] > 0;
					if (!e.returnvalue) {
						e.instance.props.children = e.instance.props.children.filter(c => c && c.props.id != customSections.FAVORITES && c.props.id != customSections.HIDDEN);
						if (this.settings.general.addFavorizedCategory && hasFriends) e.instance.props.children.splice(e.instance.props.children.findIndex(c => c && c.props.id == BDFDB.DiscordConstants.FriendsSections.ONLINE) + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TabBar.Item, {
							id: customSections.FAVORITES,
							className: BDFDB.disCN.peoplestabbaritem,
							children: this.labels.favorites
						}));
						let index = e.instance.props.children.findIndex(c => c && c.props.id == BDFDB.DiscordConstants.FriendsSections.PENDING);
						if (index == -1) index = e.instance.props.children.findIndex(c => c && c.props.id == customSections.FAVORITES);
						if (index == -1) index = e.instance.props.children.findIndex(c => c && c.props.id == BDFDB.DiscordConstants.FriendsSections.ONLINE);
						if (this.settings.general.addHiddenCategory && hasFriends) e.instance.props.children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TabBar.Item, {
							id: customSections.HIDDEN,
							className: BDFDB.disCN.peoplestabbaritem,
							children: this.labels.hidden
						}));
						if (this.settings.general.addIgnoredCategory) e.instance.props.children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TabBar.Item, {
							id: customSections.IGNORED,
							className: BDFDB.disCN.peoplestabbaritem,
							children: this.labels.ignored
						}));
						if (this.settings.general.addBlockedCategory) e.instance.props.children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TabBar.Item, {
							id: customSections.BLOCKED,
							className: BDFDB.disCN.peoplestabbaritem,
							children: this.labels.blocked
						}));
					}
					else {
						if (this.settings.general.addTotalAmount) {
							for (let child of e.returnvalue.props.children) if (child && child.props.id != BDFDB.DiscordConstants.FriendsSections.ADD_FRIEND) {
								let newChildren = [child.props.children].flat().filter(n => !n || !n.props || n.props.count == undefined);
								switch (child.props.id) {
									case BDFDB.DiscordConstants.FriendsSections.ALL:
										newChildren.push(this.createBadge(relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.FRIEND]));
										break;
									case customSections.FAVORITES:
										newChildren.push(this.createBadge(favorizedFriends.filter(id => relationships[id] == BDFDB.DiscordConstants.RelationshipTypes.FRIEND).length));
										break;
									case BDFDB.DiscordConstants.FriendsSections.ONLINE:
										newChildren.push(this.createBadge(Object.entries(relationships).filter(n => n[1] == BDFDB.DiscordConstants.RelationshipTypes.FRIEND && !(this.settings.general.addHiddenCategory && hiddenFriends.indexOf(n[0]) > -1) && BDFDB.LibraryStores.PresenceStore.getStatus(n[0]) != BDFDB.LibraryComponents.StatusComponents.Types.OFFLINE).length));
										break;
									case BDFDB.DiscordConstants.FriendsSections.PENDING:
										newChildren.push(this.createBadge(relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.PENDING_INCOMING], this.labels.incoming, relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.PENDING_INCOMING] > 0));
										newChildren.push(this.createBadge(relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.PENDING_OUTGOING], this.labels.outgoing));
										break;
									case customSections.BLOCKED:
										newChildren.push(this.createBadge(relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.BLOCKED]));
										break;
									case customSections.IGNORED:
										newChildren.push(this.createBadge(relationshipCount.IGNORED));
										break;
									case customSections.HIDDEN:
										newChildren.push(this.createBadge(hiddenFriends.filter(id => relationships[id] == BDFDB.DiscordConstants.RelationshipTypes.FRIEND).length));
										break;
								}
								child.props.children = newChildren;
							}
						}
					}
				}
			}
			
			processAnalyticsContext (e) {
				if (e.instance.props.section != BDFDB.DiscordConstants.AnalyticsSections.FRIENDS_LIST) return;
				console.log(e);
				let body = BDFDB.ReactUtils.findChild(e.instance, {filter: n => n && n.props && n.props.renderRow && n.props.rows});
				if (!body) return;
				let users = body.props.rows.flat(10);
				let filteredUsers = users;
				if (this.settings.general.addFavorizedCategory && currentSection == customSections.FAVORITES) filteredUsers = filteredUsers.filter(n => n && n.user && favorizedFriends.indexOf(n.user.id) > -1);
				if (this.settings.general.addHiddenCategory) {
					if (currentSection == customSections.HIDDEN) filteredUsers = filteredUsers.filter(n => n && n.user && hiddenFriends.indexOf(n.user.id) > -1);
					else filteredUsers = filteredUsers.filter(n => n && n.user && hiddenFriends.indexOf(n.user.id) == -1);
				}
				if (this.settings.general.addBlockedCategory && currentSection == customSections.BLOCKED || this.settings.general.addIgnoredCategory && currentSection == customSections.IGNORED) {
					filteredUsers = currentSection == customSections.IGNORED ? BDFDB.LibraryStores.RelationshipStore.getIgnoredIDs() : this.getBlockedIDs();
					for (let className of [BDFDB.disCN.peopleslistsearchbar, BDFDB.disCN.peopleslistempty]) {
						let [children, index] = BDFDB.ReactUtils.findParent(e.instance, {props: [["className", className]]});
						if (index > -1) children[index] = null;
					}
					body.props.hasSearchQuery = false;
				}
				if (this.settings.general.addBlockedCategory || this.settings.general.addIgnoredCategory) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.instance, {filter: n => n.type && n.type.toLocaleString().indexOf("blockedIgnoredSettingsNotice") > -1});
					if (index > -1) children[index] = null;
				}
				let renderSection = body.props.renderSection;
				body.props.renderSection = BDFDB.TimeUtils.suppress((...args) => {
					let returnValue = renderSection(...args);
					let title = returnValue.props.children.props.title, customTitle = null;
					if (this.settings.general.addFavorizedCategory && currentSection == customSections.FAVORITES) customTitle = this.labels.favorites;
					else if (this.settings.general.addHiddenCategory && currentSection == customSections.HIDDEN) customTitle = this.labels.hidden;
					else if (this.settings.general.addBlockedCategory && currentSection == customSections.BLOCKED) customTitle = this.labels.blocked;
					else if (this.settings.general.addIgnoredCategory && currentSection == customSections.IGNORED) customTitle = this.labels.ignored;
					returnValue.props.children.props.title = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
						align: BDFDB.LibraryComponents.Flex.Align.CENTER,
						children: [
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN._betterfriendlisttitle,
								children: customTitle ? `${customTitle} - ${filteredUsers.filter(u => u && u.key != placeHolderId).length}` : title.replace(users.length, filteredUsers.filter(u => u && u.key != placeHolderId).length)
							}),
							this.settings.general.addSortOptions && [
								{key: "nicknameLower", label: BDFDB.LanguageUtils.LanguageStrings.USER_SETTINGS_LABEL_USERNAME},
								{key: "statusIndex", label: BDFDB.LanguageUtils.LibraryStrings.status}
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
							}))
						].flat(10).filter(n => n)
					});
					return returnValue;
				}, "Error in Section Render of PeopleList!", this);
			}

			processPeopleListSectionedLazy (e) {
				this.processPeopleListSectionedNonLazy(e);
			}
			
			processPeopleListSectionedNonLazy (e) {
				if (this.settings.general.addFavorizedCategory && currentSection == customSections.FAVORITES) e.instance.props.rows = [].concat(e.instance.props.rows).map(section => [].concat(section).filter(entry => entry && entry.user && favorizedFriends.indexOf(entry.user.id) > -1));
				if (this.settings.general.addHiddenCategory) {
					if (currentSection == customSections.HIDDEN) e.instance.props.rows = [].concat(e.instance.props.rows).map(section => [].concat(section).filter(entry => entry && entry.user && hiddenFriends.indexOf(entry.user.id) > -1));
					else if (([].concat(e.instance.props.rows).flat(10)[0] || {}).type == BDFDB.DiscordConstants.RelationshipTypes.FRIEND) e.instance.props.rows = [].concat(e.instance.props.rows).map(section => [].concat(section).filter(entry => entry && entry.user && hiddenFriends.indexOf(entry.user.id) == -1));
				}
				if (this.settings.general.addBlockedCategory && currentSection == customSections.BLOCKED || this.settings.general.addIgnoredCategory && currentSection == customSections.IGNORED) {
					let ignoredSection = currentSection == customSections.IGNORED;
					let userIDs = ignoredSection ? BDFDB.LibraryStores.RelationshipStore.getIgnoredIDs() : this.getBlockedIDs();
					let RelationshipConstructor = e.instance.props.rows.flat(10)[0] && e.instance.props.rows.flat(10)[0].constructor || class RelationshipConstructor {
						get comparator() {
							return [this.type, 1, this.nickname || this.user && this.user.global && this.user.global.toLowerCase() || this.usernameLower]
						}
						constructor(e) {
							for (let prop of Object.keys(e)) this[prop] = e[prop];
						}
					};
					e.instance.props.rows = [userIDs.map(id => {
						let user = BDFDB.LibraryStores.UserStore.getUser(id);
						return new RelationshipConstructor({
							activities: [],
							applicationId: undefined,
							applicationStream: null,
							giftIntentType: undefined,
							ignoredUser: ignoredSection,
							isGameRelationship: false,
							isMobile: false,
							key: id,
							mutualGuilds: [],
							mutualGuildsLength: 0,
							nickname: undefined,
							spam: false,
							status: BDFDB.UserUtils.getStatus(id) || "offline",
							type: BDFDB.DiscordConstants.RelationshipTypes.BLOCKED,
							user: user ? user : new BDFDB.DiscordObjects.User({id: id, username: BDFDB.LanguageUtils.LanguageStrings.UNKNOWN_USER}),
							userId: id,
							usernameLower: user ? user.username.toLowerCase() : BDFDB.LanguageUtils.LanguageStrings.UNKNOWN_USER
						});
					})];
				}
				if (sortKey && e.instance.props.rows.flat(10).length) e.instance.props.rows = [].concat(e.instance.props.rows).map(section => {
					let newSection = [].concat(section);
					newSection = BDFDB.ArrayUtils.keySort(newSection.map(entry => Object.assign({}, entry, {
						statusIndex: statusSortOrder[entry.status],
						nicknameLower: entry.nickname ? entry.nickname.toLowerCase() : entry.usernameLower
					})), sortKey);
					if (sortReversed) newSection.reverse();
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
			
			processPeopleListItem (e) {
				if (e.node) {
					BDFDB.TimeUtils.clear(rerenderTimeout);
					rerenderTimeout = BDFDB.TimeUtils.timeout(_ => BDFDB.PatchUtils.forceAllUpdates(this, "TabBar"), 1000);
				}
				else {
					if (e.instance.props.user.id == placeHolderId) return null;
					let childrenRender = e.returnvalue.props.children;
					e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let returnValue = childrenRender(...args);
						if (BDFDB.LibraryStores.RelationshipStore.isBlocked(e.instance.props.user.id) || BDFDB.LibraryStores.RelationshipStore.isIgnored(e.instance.props.user.id)) {
							let actions = BDFDB.ReactUtils.findChild(returnValue, {props: [["className", BDFDB.disCN.peoplesactions]]});
							if (actions) actions.props.children.pop();
						}
						if (this.settings.general.addMutualGuild) {
							let mutualGuilds = BDFDB.ArrayUtils.removeCopies([].concat(BDFDB.LibraryStores.GuildMemberStore.memberOf(e.instance.props.user.id), (BDFDB.LibraryStores.UserProfileStore.getMutualGuilds(e.instance.props.user.id) || []).map(n => n && n.guild && n.guild.id)).flat()).filter(n => n);
							if (mutualGuilds && mutualGuilds.length) {
								let guildsIds = BDFDB.LibraryStores.SortedGuildStore.getFlattenedGuildIds();
								let [children, index] = BDFDB.ReactUtils.findParent(returnValue, {filter: n => n && n.props && n.props.subText && n.props.user});
								if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildSummaryItem, {
									className: BDFDB.disCN._betterfriendlistmutualguilds,
									guilds: mutualGuilds.sort((x, y) => guildsIds.indexOf(x) < guildsIds.indexOf(y) ? -1 : 1).map(BDFDB.LibraryStores.GuildStore.getGuild),
									showTooltip: true,
									max: 10
								}, true));
							}
						}
						return returnValue;
					}, "Error in PeopleListItem Render!", this);
				}
			}
			
			createBadge (amount, text, red) {
				let badge = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.NumberBadge, {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.peoplesbadge),
					count: amount,
					disableColor: !red
				});
				return text ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: text,
					tooltipConfig: {
						type: "bottom"
					},
					children: badge
				}) : badge;
			}
			
			getBlockedIDs () {
				return Object.entries(BDFDB.LibraryStores.RelationshipStore.getRelationships()).filter(n => n[1] == BDFDB.DiscordConstants.RelationshipTypes.BLOCKED).map(n => n[0]);
			}
			
			rerenderList () {
				let selectedButton = document.querySelector(BDFDB.dotCNS.dmchannel + BDFDB.dotCNS.namecontainerselected + "a");
				if (selectedButton) selectedButton.click();
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							blocked:							"Блокиран",
							context_favorizefriend:						"Добавете приятел към любими",
							context_hidefriend:						"Скрий приятел",
							context_unfavorizefriend:					"Премахване на приятел от любимите",
							context_unhidefriend:						"Разкрий приятел",
							favorites:							"Любими",
							hidden:								"Скрити",
							ignored:							"Игнориран",
							incoming:							"Входящи",
							outgoing:							"Изходящи"
						};
					case "cs":		// Czech
						return {
							blocked:							"Blokované",
							context_favorizefriend:						"Přidat přítele do oblíbených",
							context_hidefriend:						"Skrýt přítele",
							context_unfavorizefriend:					"Odebrat přítele z oblíbených",
							context_unhidefriend:						"Odkrýt přítele",
							favorites:							"Oblíbené",
							hidden:								"Skrytý",
							ignored:							"Ignorováno",
							incoming:							"Přicházející",
							outgoing:							"Odchozí"
						};
					case "da":		// Danish
						return {
							blocked:							"Blokeret",
							context_favorizefriend:						"Føj ven til favoritter",
							context_hidefriend:						"Skjul ven",
							context_unfavorizefriend:					"Fjern ven fra favoritter",
							context_unhidefriend:						"Skjul ven",
							favorites:							"Favoritter",
							hidden:								"Skjult",
							ignored:							"Ignoreret",
							incoming:							"Indgående",
							outgoing:							"Udgående"
						};
					case "de":		// German
						return {
							blocked:							"Blockiert",
							context_favorizefriend:						"Freund zu Favoriten hinzufügen",
							context_hidefriend:						"Freund ausblenden",
							context_unfavorizefriend:					"Freund aus Favoriten entfernen",
							context_unhidefriend:						"Freund einblenden",
							favorites:							"Favoriten",
							hidden:								"Versteckt",
							ignored:							"Ignoriert",
							incoming:							"Eingehend",
							outgoing:							"Ausgehend"
						};
					case "el":		// Greek
						return {
							blocked:							"Μπλοκαρισμένος",
							context_favorizefriend:						"Προσθήκη φίλου στους αγαπημένους",
							context_hidefriend:						"Απόκρυψη φίλου",
							context_unfavorizefriend:					"Κατάργηση φίλου από τούς αγαπημένους",
							context_unhidefriend:						"Επανεμφάνιση φίλου",
							favorites:							"Αγαπημένοι",
							hidden:								"Σε απόκρυψη",
							ignored:							"Αγνοημένος",
							incoming:							"Εισερχόμενος",
							outgoing:							"Εξερχόμενος"
						};
					case "es":		// Spanish
						return {
							blocked:							"Obstruido",
							context_favorizefriend:						"Agregar amigo a favoritos",
							context_hidefriend:						"Ocultar amigo",
							context_unfavorizefriend:					"Quitar amigo de favoritos",
							context_unhidefriend:						"Mostrar amigo",
							favorites:							"Favoritos",
							hidden:								"Oculto",
							ignored:							"Ignorado",
							incoming:							"Entrante",
							outgoing:							"Saliente"
						};
					case "es-419":		// Spanish (Latin America)
						return {
							blocked:							"Obstruido",
							context_favorizefriend:						"Agregar amigo a los favoritos",
							context_hidefriend:						"Esconder a amigo",
							context_unfavorizefriend:					"Eliminar amigo de los favoritos",
							context_unhidefriend:						"Amigo dehide",
							favorites:							"Favoritos",
							hidden:								"Oculto",
							ignored:							"Ignorado",
							incoming:							"Entrante",
							outgoing:							"Extrovertido"
						};
					case "fi":		// Finnish
						return {
							blocked:							"Estetty",
							context_favorizefriend:						"Lisää ystävä suosikkeihin",
							context_hidefriend:						"Piilota ystävä",
							context_unfavorizefriend:					"Poista ystävä suosikeista",
							context_unhidefriend:						"Näytä ystävä",
							favorites:							"Suosikit",
							hidden:								"Piilotettu",
							ignored:							"Sivuutettu",
							incoming:							"Saapuva",
							outgoing:							"Lähtevä"
						};
					case "fr":		// French
						return {
							blocked:							"Bloqué",
							context_favorizefriend:						"Ajouter un ami aux favoris",
							context_hidefriend:						"Masquer l'ami",
							context_unfavorizefriend:					"Supprimer un ami des favoris",
							context_unhidefriend:						"Afficher l'ami",
							favorites:							"Favoris",
							hidden:								"Caché",
							ignored:							"Ignoré",
							incoming:							"Entrant",
							outgoing:							"Sortant"
						};
					case "hi":		// Hindi
						return {
							blocked:							"अवरोधित",
							context_favorizefriend:						"मित्र को पसंदीदा में जोड़ें",
							context_hidefriend:						"दोस्त छुपाएं",
							context_unfavorizefriend:					"मित्र को पसंदीदा से हटाएं",
							context_unhidefriend:						"मित्र दिखाएँ",
							favorites:							"पसंदीदा",
							hidden:								"छिपा हुआ",
							ignored:							"अवहेलना करना",
							incoming:							"आने वाली",
							outgoing:							"निवर्तमान"
						};
					case "hr":		// Croatian
						return {
							blocked:							"Blokiran",
							context_favorizefriend:						"Dodaj prijatelja u favorite",
							context_hidefriend:						"Sakrij prijatelja",
							context_unfavorizefriend:					"Ukloni prijatelja iz omiljenih",
							context_unhidefriend:						"Otkrij prijatelja",
							favorites:							"Favoriti",
							hidden:								"Skriven",
							ignored:							"Zanemaren",
							incoming:							"Dolazni",
							outgoing:							"Odlazni"
						};
					case "hu":		// Hungarian
						return {
							blocked:							"Zárolt",
							context_favorizefriend:						"Ismerős hozzáadása a kedvencekhez",
							context_hidefriend:						"Barát elrejtése",
							context_unfavorizefriend:					"Ismerős eltávolítása a kedvencekből",
							context_unhidefriend:						"Barát megjelenítése",
							favorites:							"Kedvencek",
							hidden:								"Rejtett",
							ignored:							"Figyelmen kívül hagyott",
							incoming:							"Beérkező",
							outgoing:							"Kimenő"
						};
					case "it":		// Italian
						return {
							blocked:							"Bloccato",
							context_favorizefriend:						"Aggiungi amico ai preferiti",
							context_hidefriend:						"Nascondi amico",
							context_unfavorizefriend:					"Rimuovi amico dai preferiti",
							context_unhidefriend:						"Scopri amico",
							favorites:							"Preferiti",
							hidden:								"Nascosto",
							ignored:							"Ignorato",
							incoming:							"In arrivo",
							outgoing:							"Estroverso"
						};
					case "ja":		// Japanese
						return {
							blocked:							"ブロックされています",
							context_favorizefriend:						"お気に入りに友達を追加する",
							context_hidefriend:						"友達を隠す",
							context_unfavorizefriend:					"お気に入りから友達を削除する",
							context_unhidefriend:						"友達を再表示",
							favorites:							"お気に入り",
							hidden:								"隠し",
							ignored:							"無視した",
							incoming:							"着信",
							outgoing:							"発信"
						};
					case "ko":		// Korean
						return {
							blocked:							"막힌",
							context_favorizefriend:						"즐겨찾기에 친구 추가",
							context_hidefriend:						"친구 숨기기",
							context_unfavorizefriend:					"즐겨찾기에서 친구 제거",
							context_unhidefriend:						"친구 숨기기 해제",
							favorites:							"즐겨찾기",
							hidden:								"숨겨진",
							ignored:							"무시했습니다",
							incoming:							"들어오는",
							outgoing:							"나가는"
						};
					case "lt":		// Lithuanian
						return {
							blocked:							"Užblokuotas",
							context_favorizefriend:						"Pridėti draugą prie mėgstamiausių",
							context_hidefriend:						"Slėpti draugą",
							context_unfavorizefriend:					"Pašalinti draugą iš mėgstamiausių",
							context_unhidefriend:						"Nerodyti draugo",
							favorites:							"Mėgstamiausi",
							hidden:								"Paslėpta",
							ignored:							"Ignoruojamas",
							incoming:							"Gaunamasis",
							outgoing:							"Išeinantis"
						};
					case "nl":		// Dutch
						return {
							blocked:							"Geblokkeerd",
							context_favorizefriend:						"Vriend toevoegen aan favorieten",
							context_hidefriend:						"Vriend verbergen",
							context_unfavorizefriend:					"Vriend uit favorieten verwijderen",
							context_unhidefriend:						"Vriend zichtbaar maken",
							favorites:							"Favorieten",
							hidden:								"Verborgen",
							ignored:							"Genegeerd",
							incoming:							"Inkomend",
							outgoing:							"Uitgaand"
						};
					case "no":		// Norwegian
						return {
							blocked:							"Blokkert",
							context_favorizefriend:						"Legg til en venn i favoritter",
							context_hidefriend:						"Skjul venn",
							context_unfavorizefriend:					"Fjern venn fra favoritter",
							context_unhidefriend:						"Skjul venn",
							favorites:							"Favoritter",
							hidden:								"Skjult",
							ignored:							"Ignorert",
							incoming:							"Innkommende",
							outgoing:							"Utgående"
						};
					case "pl":		// Polish
						return {
							blocked:							"Zablokowany",
							context_favorizefriend:						"Dodaj znajomego do ulubionych",
							context_hidefriend:						"Ukryj znajomego",
							context_unfavorizefriend:					"Usuń znajomego z ulubionych",
							context_unhidefriend:						"Pokaż znajomego",
							favorites:							"Ulubione",
							hidden:								"Ukryci",
							ignored:							"Ignorowane",
							incoming:							"Przychodzące",
							outgoing:							"Wychodzące"
						};
					case "pt-BR":		// Portuguese (Brazil)
						return {
							blocked:							"Bloqueado",
							context_favorizefriend:						"Adicionar amigo aos favoritos",
							context_hidefriend:						"Esconder Amigo",
							context_unfavorizefriend:					"Remover amigo dos favoritos",
							context_unhidefriend:						"Reexibir amigo",
							favorites:							"Favoritos",
							hidden:								"Escondido",
							ignored:							"Ignorado",
							incoming:							"Entrada",
							outgoing:							"Extrovertido"
						};
					case "ro":		// Romanian
						return {
							blocked:							"Blocat",
							context_favorizefriend:						"Adaugă prieten la favorite",
							context_hidefriend:						"Ascunde prietenul",
							context_unfavorizefriend:					"Scoateți prietenul din favorite",
							context_unhidefriend:						"Afișează prietenul",
							favorites:							"Favorite",
							hidden:								"Ascuns",
							ignored:							"Ignorat",
							incoming:							"Primite",
							outgoing:							"De ieșire"
						};
					case "ru":		// Russian
						return {
							blocked:							"Заблокированный",
							context_favorizefriend:						"Добавить друга в избранное",
							context_hidefriend:						"Скрыть друга",
							context_unfavorizefriend:					"Удалить друга из избранного",
							context_unhidefriend:						"Показать друга",
							favorites:							"Избранное",
							hidden:								"Скрытый",
							ignored:							"Игнорируется",
							incoming:							"Входящий",
							outgoing:							"Исходящий"
						};
					case "sv":		// Swedish
						return {
							blocked:							"Blockerad",
							context_favorizefriend:						"Lägg till vän till favoriter",
							context_hidefriend:						"Dölj vän",
							context_unfavorizefriend:					"Ta bort vän från favoriter",
							context_unhidefriend:						"Göm din vän",
							favorites:							"Favoriter",
							hidden:								"Dold",
							ignored:							"Ignorerad",
							incoming:							"Inkommande",
							outgoing:							"Utgående"
						};
					case "th":		// Thai
						return {
							blocked:							"ที่ถูกปิดกั้น",
							context_favorizefriend:						"เพิ่มเพื่อนในรายการโปรด",
							context_hidefriend:						"ซ่อนเพื่อน",
							context_unfavorizefriend:					"ลบเพื่อนออกจากรายการโปรด",
							context_unhidefriend:						"เลิกซ่อนเพื่อน",
							favorites:							"รายการโปรด",
							hidden:								"ซ่อนเร้น",
							ignored:							"เพิกเฉย",
							incoming:							"ขาเข้า",
							outgoing:							"ขาออก"
						};
					case "tr":		// Turkish
						return {
							blocked:							"Engellenmiş",
							context_favorizefriend:						"Favorilere arkadaş ekle",
							context_hidefriend:						"Arkadaşı Gizle",
							context_unfavorizefriend:					"Arkadaşını favorilerden kaldır",
							context_unhidefriend:						"Arkadaşı Göster",
							favorites:							"Favoriler",
							hidden:								"Gizli",
							ignored:							"Göz ardı edilen",
							incoming:							"Gelen",
							outgoing:							"Dışa dönük"
						};
					case "uk":		// Ukrainian
						return {
							blocked:							"Заблокований",
							context_favorizefriend:						"Додати друга у вибране",
							context_hidefriend:						"Сховати друга",
							context_unfavorizefriend:					"Видалити друга з вибраного",
							context_unhidefriend:						"Показати друга",
							favorites:							"Вибране",
							hidden:								"Прихований",
							ignored:							"Ігнорований",
							incoming:							"Вхідні",
							outgoing:							"Вихідний"
						};
					case "vi":		// Vietnamese
						return {
							blocked:							"Bị chặn",
							context_favorizefriend:						"Thêm bạn bè vào danh sách yêu thích",
							context_hidefriend:						"Ẩn bạn bè",
							context_unfavorizefriend:					"Xóa bạn bè khỏi danh sách yêu thích",
							context_unhidefriend:						"Bỏ ẩn bạn bè",
							favorites:							"Yêu thích",
							hidden:								"Ẩn",
							ignored:							"Bỏ qua",
							incoming:							"Mới đến",
							outgoing:							"Hướng ngoaị"
						};
					case "zh-CN":		// Chinese (China)
						return {
							blocked:							"阻止",
							context_favorizefriend:						"添加好友到收藏夹",
							context_hidefriend:						"隐藏好友",
							context_unfavorizefriend:					"从收藏夹中移除好友",
							context_unhidefriend:						"取消隐藏好友",
							favorites:							"收藏夹",
							hidden:								"隐藏",
							ignored:							"被忽略",
							incoming:							"导入",
							outgoing:							"导出"
						};
					case "zh-TW":		// Chinese (Taiwan)
						return {
							blocked:							"阻止",
							context_favorizefriend:						"新增好友到我的最愛",
							context_hidefriend:						"隱藏好友",
							context_unfavorizefriend:					"從我的最愛中移除好友",
							context_unhidefriend:						"取消隱藏好友",
							favorites:							"我的最愛",
							hidden:								"隱藏",
							ignored:							"被忽略",
							incoming:							"匯入",
							outgoing:							"匯出"
						};
					default:		// English
						return {
							blocked:							"Blocked",
							context_favorizefriend:						"Add Friend to Favorites",
							context_hidefriend:						"Hide Friend",
							context_unfavorizefriend:					"Remove Friend from Favorites",
							context_unhidefriend:						"Unhide Friend",
							favorites:							"Favorites",
							hidden:								"Hidden",
							ignored:							"Ignored",
							incoming:							"Incoming",
							outgoing:							"Outgoing"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();