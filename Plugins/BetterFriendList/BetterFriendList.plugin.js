/**
 * @name BetterFriendList
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.3.9
 * @description Adds extra Controls to the Friends Page, for example sort by Name/Status, Search and All/Request/Blocked Amount
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterFriendList/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/BetterFriendList/BetterFriendList.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "BetterFriendList",
			"author": "DevilBro",
			"version": "1.3.9",
			"description": "Adds extra Controls to the Friends Page, for example sort by Name/Status, Search and All/Request/Blocked Amount"
		},
		"changeLog": {
			"fixed": {
				"Count": "No longer says Count = 0 for all categories if hidden is disabled"
			}
		}
	};

	return (window.Lightcord && !Node.prototype.isPrototypeOf(window.Lightcord) || window.LightCord && !Node.prototype.isPrototypeOf(window.LightCord) || window.Astra && !Node.prototype.isPrototypeOf(window.Astra)) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return "Do not use LightCord!";}
		load () {BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)");}
		start() {}
		stop() {}
	} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var rerenderTimeout, sortKey, sortReversed, searchQuery, searchTimeout;
		
		const favorizedFriendsSection = "FAVORIZED_FRIENDS";
		const hiddenFriendsSection = "HIDDEN_FRIENDS";
		const placeHolderId = "PLACEHOLDER_BETTERFRIENDLIST";
		
		var favorizedFriends = [], hiddenFriends = [];
		var currentSection, isFavoritesSelected = false, isHiddenSelected = false;
		
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
						addFavorizedCategory:	{value: true, 	description: "Adds Favorites Category"},
						addHiddenCategory:		{value: true, 	description: "Adds Hidden Category"},
						addSortOptions:			{value: true, 	description: "Adds Sort Options"},
						addSearchbar:			{value: true, 	description: "Adds a Searchbar"},
						addMutualGuild:			{value: true, 	description: "Adds mutual Servers in Friend List"}
					}
				};

				this.patchedModules = {
					before: {
						TabBar: "render",
						PeopleListSectionedLazy: "default",
						PeopleListSectionedNonLazy: "default"
					},
					after: {
						TabBar: "render",
						PeopleListSectionedLazy: "default",
						PeopleListSectionedNonLazy: "default",
						FriendRow: "render",
						PendingRow: "default",
						BlockedRow: "render",
						PeopleListItem: ["render", "componentDidMount","componentWillUnmount"]
					}
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
						width: 150px;
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
				searchQuery = "";
				isFavoritesSelected = false;
				isHiddenSelected = false;

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
				if (e.instance.props.user) {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "remove-friend"});
					let favorized = favorizedFriends.indexOf(e.instance.props.user.id) > -1;
					let hidden = hiddenFriends.indexOf(e.instance.props.user.id) > -1;
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
			}
			
			processTabBar (e) {
				if (e.instance.props.children && e.instance.props.children.some(c => c && c.props.id == BDFDB.DiscordConstants.FriendsSections.ADD_FRIEND)) {
					currentSection = e.instance.props.selectedItem;
					isFavoritesSelected = currentSection == favorizedFriendsSection;
					isHiddenSelected = currentSection == hiddenFriendsSection;
					if (!e.returnvalue) {
						e.instance.props.children = e.instance.props.children.filter(c => c && c.props.id != favorizedFriendsSection && c.props.id != hiddenFriendsSection);
						if (this.settings.general.addFavorizedCategory) e.instance.props.children.splice(e.instance.props.children.findIndex(c => c && c.props.id == BDFDB.DiscordConstants.FriendsSections.ONLINE) + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TabBar.Item, {
							id: favorizedFriendsSection,
							className: BDFDB.disCN.peoplestabbaritem,
							children: this.labels.favorites
						}));
						if (this.settings.general.addHiddenCategory) e.instance.props.children.splice(e.instance.props.children.findIndex(c => c && c.props.id == BDFDB.DiscordConstants.FriendsSections.BLOCKED) + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TabBar.Item, {
							id: hiddenFriendsSection,
							className: BDFDB.disCN.peoplestabbaritem,
							children: this.labels.hidden
						}));
					}
					else {
						if (this.settings.general.addTotalAmount) {
							let relationships = BDFDB.LibraryModules.RelationshipStore.getRelationships(), relationshipCount = {};
							for (let type in BDFDB.DiscordConstants.RelationshipTypes) relationshipCount[type] = 0;
							for (let id in relationships) if (!this.settings.general.addHiddenCategory || (hiddenFriends.indexOf(id) == -1 || relationships[id] != BDFDB.DiscordConstants.RelationshipTypes.FRIEND)) relationshipCount[relationships[id]]++;
							for (let child of e.returnvalue.props.children) if (child && child.props.id != BDFDB.DiscordConstants.FriendsSections.ADD_FRIEND) {
								let newChildren = [child.props.children].flat().filter(child => BDFDB.ObjectUtils.get(child, "type.displayName") != "NumberBadge");
								switch (child.props.id) {
									case BDFDB.DiscordConstants.FriendsSections.ALL:
										newChildren.push(this.createBadge(relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.FRIEND]));
										break;
									case favorizedFriendsSection:
										newChildren.push(this.createBadge(favorizedFriends.filter(id => relationships[id] == BDFDB.DiscordConstants.RelationshipTypes.FRIEND).length));
										break;
									case BDFDB.DiscordConstants.FriendsSections.ONLINE:
										newChildren.push(this.createBadge(Object.entries(relationships).filter(n => n[1] == BDFDB.DiscordConstants.RelationshipTypes.FRIEND && !(this.settings.general.addHiddenCategory && hiddenFriends.indexOf(n[0]) > -1) && BDFDB.LibraryModules.StatusMetaUtils.getStatus(n[0]) != BDFDB.DiscordConstants.StatusTypes.OFFLINE).length));
										break;
									case BDFDB.DiscordConstants.FriendsSections.PENDING:
										newChildren.push(this.createBadge(relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.PENDING_INCOMING], this.labels.incoming, relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.PENDING_INCOMING] > 0));
										newChildren.push(this.createBadge(relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.PENDING_OUTGOING], this.labels.outgoing));
										break;
									case BDFDB.DiscordConstants.FriendsSections.BLOCKED:
										newChildren.push(this.createBadge(relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.BLOCKED]));
										break;
									case hiddenFriendsSection:
										newChildren.push(this.createBadge(hiddenFriends.filter(id => relationships[id] == BDFDB.DiscordConstants.RelationshipTypes.FRIEND).length));
										break;
								}
								child.props.children = newChildren;
							}
						}
					}
				}
			}

			processPeopleListSectionedLazy (e) {
				if (this.settings.general.addFavorizedCategory) {
					if (isFavoritesSelected) e.instance.props.statusSections = [].concat(e.instance.props.statusSections).map(section => [].concat(section).filter(entry => entry && entry.user && favorizedFriends.indexOf(entry.user.id) > -1));
				}
				if (this.settings.general.addHiddenCategory) {
					if (isHiddenSelected) e.instance.props.statusSections = [].concat(e.instance.props.statusSections).map(section => [].concat(section).filter(entry => entry && entry.user && hiddenFriends.indexOf(entry.user.id) > -1));
					else if (([].concat(e.instance.props.statusSections).flat(10)[0] || {}).type == BDFDB.DiscordConstants.RelationshipTypes.FRIEND) e.instance.props.statusSections = [].concat(e.instance.props.statusSections).map(section => [].concat(section).filter(entry => entry && entry.user && hiddenFriends.indexOf(entry.user.id) == -1));
				}
				if (sortKey || searchQuery) e.instance.props.statusSections = [].concat(e.instance.props.statusSections).map(section => {
					let newSection = [].concat(section);
					if (searchQuery) {
						let usedSearchQuery = searchQuery.toLowerCase();
						newSection = newSection.filter(entry => entry && typeof entry.usernameLower == "string" && entry.usernameLower.indexOf(usedSearchQuery) > -1);
					}
					if (sortKey) {
						newSection = BDFDB.ArrayUtils.keySort(newSection.map(entry => Object.assign({}, entry, {statusIndex: statusSortOrder[entry.status]})), sortKey);
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
				BDFDB.PatchUtils.patch(this, e.instance.props, "getSectionTitle", {after: e2 => {
					if (typeof e2.returnValue == "string") {
						let users = e.instance.props.statusSections.flat(10);
						return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							align: BDFDB.LibraryComponents.Flex.Align.CENTER,
							children: [
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN._betterfriendlisttitle,
									children: this.settings.general.addFavorizedCategory && isFavoritesSelected ? `${this.labels.favorites} - ${users.filter(u => u && u.key != placeHolderId).length}` : this.settings.general.addHiddenCategory && isHiddenSelected ? `${this.labels.hidden} - ${users.filter(u => u && u.key != placeHolderId).length}` : e2.returnValue.replace(users.length, users.filter(u => u && u.key != placeHolderId).length)
								}),
								this.settings.general.addSortOptions && [
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
								this.settings.general.addSearchbar && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
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
					}
				}}, {force: true, noCache: true});
				if (e.returnvalue && !e.instance.props.statusSections.flat(10).length) e.returnvalue.props.children = BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN.peopleslistempty,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FriendsEmptyState, {
						type: !currentSection || !Object.entries(BDFDB.DiscordConstants.FriendsSections).find(n => n[1] == currentSection) ? BDFDB.DiscordConstants.FriendsSections.ALL : currentSection
					})
				});
			}
			
			processPeopleListSectionedNonLazy (e) {
				this.processPeopleListSectionedLazy(e);
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
					rerenderTimeout = BDFDB.TimeUtils.timeout(_ => BDFDB.PatchUtils.forceAllUpdates(this, "TabBar"), 1000);
				}
				else {
					if (e.instance.props.user.id == placeHolderId) return null;
					else if (this.settings.general.addMutualGuild && e.instance.props.mutualGuilds && e.instance.props.mutualGuilds.length) {
						if (typeof e.returnvalue.props.children == "function") {
							let childrenRender = e.returnvalue.props.children;
							e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
								let children = childrenRender(...args);
								this.injectMutualGuilds(children, e.instance.props.mutualGuilds);
								return children;
							}, "", this);
						}
						else this.injectMutualGuilds(e.returnvalue, e.instance.props.mutualGuilds);
					}
				}
			}
			
			injectMutualGuilds (returnvalue, mutualGuilds) {
				let [children, index] = BDFDB.ReactUtils.findParent(returnvalue, {name: "UserInfo"});
				if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildSummaryItem, {
					className: BDFDB.disCN._betterfriendlistmutualguilds,
					guilds: mutualGuilds,
					showTooltip: true,
					max: 10
				}, true));
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
			
			rerenderList () {
				let selectedButton = document.querySelector(BDFDB.dotCN.dmchannel + BDFDB.dotCN.namecontainerselected);
				if (selectedButton) selectedButton.click();
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							context_favorizefriend:				"Добавете приятел към любими",
							context_hidefriend:					"Скрий приятел",
							context_unfavorizefriend:			"Премахване на приятел от любимите",
							context_unhidefriend:				"Разкрий приятел",
							favorites:							"Любими",
							hidden:								"Скрити",
							incoming:							"Входящи",
							outgoing:							"Изходящи"
						};
					case "cs":		// Czech
						return {
							context_favorizefriend:				"Přidat přítele do oblíbených",
							context_hidefriend:					"Skrýt přítele",
							context_unfavorizefriend:			"Odebrat přítele z oblíbených",
							context_unhidefriend:				"Odkrýt přítele",
							favorites:							"Oblíbené",
							hidden:								"Skrytý",
							incoming:							"Přicházející",
							outgoing:							"Odchozí"
						};
					case "da":		// Danish
						return {
							context_favorizefriend:				"Føj ven til favoritter",
							context_hidefriend:					"Skjul ven",
							context_unfavorizefriend:			"Fjern ven fra favoritter",
							context_unhidefriend:				"Skjul ven",
							favorites:							"Favoritter",
							hidden:								"Skjult",
							incoming:							"Indgående",
							outgoing:							"Udgående"
						};
					case "de":		// German
						return {
							context_favorizefriend:				"Freund zu Favoriten hinzufügen",
							context_hidefriend:					"Freund ausblenden",
							context_unfavorizefriend:			"Freund aus Favoriten entfernen",
							context_unhidefriend:				"Freund einblenden",
							favorites:							"Favoriten",
							hidden:								"Versteckt",
							incoming:							"Eingehend",
							outgoing:							"Ausgehend"
						};
					case "el":		// Greek
						return {
							context_favorizefriend:				"Προσθήκη φίλου στα αγαπημένα",
							context_hidefriend:					"Απόκρυψη φίλου",
							context_unfavorizefriend:			"Κατάργηση φίλου από τα αγαπημένα",
							context_unhidefriend:				"Απόκρυψη φίλου",
							favorites:							"Αγαπημένα",
							hidden:								"Κρυμμένος",
							incoming:							"Εισερχόμενος",
							outgoing:							"Εξερχόμενος"
						};
					case "es":		// Spanish
						return {
							context_favorizefriend:				"Agregar amigo a favoritos",
							context_hidefriend:					"Ocultar amigo",
							context_unfavorizefriend:			"Quitar amigo de favoritos",
							context_unhidefriend:				"Mostrar amigo",
							favorites:							"Favoritos",
							hidden:								"Oculto",
							incoming:							"Entrante",
							outgoing:							"Saliente"
						};
					case "fi":		// Finnish
						return {
							context_favorizefriend:				"Lisää ystävä suosikkeihin",
							context_hidefriend:					"Piilota ystävä",
							context_unfavorizefriend:			"Poista ystävä suosikeista",
							context_unhidefriend:				"Näytä ystävä",
							favorites:							"Suosikit",
							hidden:								"Piilotettu",
							incoming:							"Saapuva",
							outgoing:							"Lähtevä"
						};
					case "fr":		// French
						return {
							context_favorizefriend:				"Ajouter un ami aux favoris",
							context_hidefriend:					"Masquer l'ami",
							context_unfavorizefriend:			"Supprimer un ami des favoris",
							context_unhidefriend:				"Afficher l'ami",
							favorites:							"Favoris",
							hidden:								"Caché",
							incoming:							"Entrant",
							outgoing:							"Sortant"
						};
					case "hi":		// Hindi
						return {
							context_favorizefriend:				"मित्र को पसंदीदा में जोड़ें",
							context_hidefriend:					"दोस्त छुपाएं",
							context_unfavorizefriend:			"मित्र को पसंदीदा से हटाएं",
							context_unhidefriend:				"मित्र दिखाएँ",
							favorites:							"पसंदीदा",
							hidden:								"छिपा हुआ",
							incoming:							"आने वाली",
							outgoing:							"निवर्तमान"
						};
					case "hr":		// Croatian
						return {
							context_favorizefriend:				"Dodaj prijatelja u favorite",
							context_hidefriend:					"Sakrij prijatelja",
							context_unfavorizefriend:			"Ukloni prijatelja iz omiljenih",
							context_unhidefriend:				"Otkrij prijatelja",
							favorites:							"Favoriti",
							hidden:								"Skriven",
							incoming:							"Dolazni",
							outgoing:							"Odlazni"
						};
					case "hu":		// Hungarian
						return {
							context_favorizefriend:				"Ismerős hozzáadása a kedvencekhez",
							context_hidefriend:					"Barát elrejtése",
							context_unfavorizefriend:			"Ismerős eltávolítása a kedvencekből",
							context_unhidefriend:				"Barát megjelenítése",
							favorites:							"Kedvencek",
							hidden:								"Rejtett",
							incoming:							"Beérkező",
							outgoing:							"Kimenő"
						};
					case "it":		// Italian
						return {
							context_favorizefriend:				"Aggiungi amico ai preferiti",
							context_hidefriend:					"Nascondi amico",
							context_unfavorizefriend:			"Rimuovi amico dai preferiti",
							context_unhidefriend:				"Scopri amico",
							favorites:							"Preferiti",
							hidden:								"Nascosto",
							incoming:							"In arrivo",
							outgoing:							"Estroverso"
						};
					case "ja":		// Japanese
						return {
							context_favorizefriend:				"お気に入りに友達を追加する",
							context_hidefriend:					"友達を隠す",
							context_unfavorizefriend:			"お気に入りから友達を削除する",
							context_unhidefriend:				"友達を再表示",
							favorites:							"お気に入り",
							hidden:								"隠し",
							incoming:							"着信",
							outgoing:							"発信"
						};
					case "ko":		// Korean
						return {
							context_favorizefriend:				"즐겨찾기에 친구 추가",
							context_hidefriend:					"친구 숨기기",
							context_unfavorizefriend:			"즐겨찾기에서 친구 제거",
							context_unhidefriend:				"친구 숨기기 해제",
							favorites:							"즐겨찾기",
							hidden:								"숨겨진",
							incoming:							"들어오는",
							outgoing:							"나가는"
						};
					case "lt":		// Lithuanian
						return {
							context_favorizefriend:				"Pridėti draugą prie mėgstamiausių",
							context_hidefriend:					"Slėpti draugą",
							context_unfavorizefriend:			"Pašalinti draugą iš mėgstamiausių",
							context_unhidefriend:				"Nerodyti draugo",
							favorites:							"Mėgstamiausi",
							hidden:								"Paslėpta",
							incoming:							"Gaunamasis",
							outgoing:							"Išeinantis"
						};
					case "nl":		// Dutch
						return {
							context_favorizefriend:				"Vriend toevoegen aan favorieten",
							context_hidefriend:					"Vriend verbergen",
							context_unfavorizefriend:			"Vriend uit favorieten verwijderen",
							context_unhidefriend:				"Vriend zichtbaar maken",
							favorites:							"Favorieten",
							hidden:								"Verborgen",
							incoming:							"Inkomend",
							outgoing:							"Uitgaand"
						};
					case "no":		// Norwegian
						return {
							context_favorizefriend:				"Legg til en venn i favoritter",
							context_hidefriend:					"Skjul venn",
							context_unfavorizefriend:			"Fjern venn fra favoritter",
							context_unhidefriend:				"Skjul venn",
							favorites:							"Favoritter",
							hidden:								"Skjult",
							incoming:							"Innkommende",
							outgoing:							"Utgående"
						};
					case "pl":		// Polish
						return {
							context_favorizefriend:				"Dodaj znajomego do ulubionych",
							context_hidefriend:					"Ukryj znajomego",
							context_unfavorizefriend:			"Usuń znajomego z ulubionych",
							context_unhidefriend:				"Pokaż znajomego",
							favorites:							"Ulubione",
							hidden:								"Ukryci",
							incoming:							"Przychodzące",
							outgoing:							"Wychodzące"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							context_favorizefriend:				"Adicionar amigo aos favoritos",
							context_hidefriend:					"Esconder Amigo",
							context_unfavorizefriend:			"Remover amigo dos favoritos",
							context_unhidefriend:				"Reexibir amigo",
							favorites:							"Favoritos",
							hidden:								"Escondido",
							incoming:							"Entrada",
							outgoing:							"Extrovertido"
						};
					case "ro":		// Romanian
						return {
							context_favorizefriend:				"Adaugă prieten la favorite",
							context_hidefriend:					"Ascunde prietenul",
							context_unfavorizefriend:			"Scoateți prietenul din favorite",
							context_unhidefriend:				"Afișează prietenul",
							favorites:							"Favorite",
							hidden:								"Ascuns",
							incoming:							"Primite",
							outgoing:							"De ieșire"
						};
					case "ru":		// Russian
						return {
							context_favorizefriend:				"Добавить друга в избранное",
							context_hidefriend:					"Скрыть друга",
							context_unfavorizefriend:			"Удалить друга из избранного",
							context_unhidefriend:				"Показать друга",
							favorites:							"Избранное",
							hidden:								"Скрытый",
							incoming:							"Входящий",
							outgoing:							"Исходящий"
						};
					case "sv":		// Swedish
						return {
							context_favorizefriend:				"Lägg till vän till favoriter",
							context_hidefriend:					"Dölj vän",
							context_unfavorizefriend:			"Ta bort vän från favoriter",
							context_unhidefriend:				"Göm din vän",
							favorites:							"Favoriter",
							hidden:								"Dold",
							incoming:							"Inkommande",
							outgoing:							"Utgående"
						};
					case "th":		// Thai
						return {
							context_favorizefriend:				"เพิ่มเพื่อนในรายการโปรด",
							context_hidefriend:					"ซ่อนเพื่อน",
							context_unfavorizefriend:			"ลบเพื่อนออกจากรายการโปรด",
							context_unhidefriend:				"เลิกซ่อนเพื่อน",
							favorites:							"รายการโปรด",
							hidden:								"ซ่อนเร้น",
							incoming:							"ขาเข้า",
							outgoing:							"ขาออก"
						};
					case "tr":		// Turkish
						return {
							context_favorizefriend:				"Favorilere arkadaş ekle",
							context_hidefriend:					"Arkadaşı Gizle",
							context_unfavorizefriend:			"Arkadaşını favorilerden kaldır",
							context_unhidefriend:				"Arkadaşı Göster",
							favorites:							"Favoriler",
							hidden:								"Gizli",
							incoming:							"Gelen",
							outgoing:							"Dışa dönük"
						};
					case "uk":		// Ukrainian
						return {
							context_favorizefriend:				"Додати друга у вибране",
							context_hidefriend:					"Сховати друга",
							context_unfavorizefriend:			"Видалити друга з вибраного",
							context_unhidefriend:				"Показати друга",
							favorites:							"Вибране",
							hidden:								"Прихований",
							incoming:							"Вхідні",
							outgoing:							"Вихідний"
						};
					case "vi":		// Vietnamese
						return {
							context_favorizefriend:				"Thêm bạn bè vào danh sách yêu thích",
							context_hidefriend:					"Ẩn bạn bè",
							context_unfavorizefriend:			"Xóa bạn bè khỏi danh sách yêu thích",
							context_unhidefriend:				"Bỏ ẩn bạn bè",
							favorites:							"Yêu thích",
							hidden:								"Ẩn",
							incoming:							"Mới đến",
							outgoing:							"Hướng ngoaị"
						};
					case "zh-CN":	// Chinese (China)
						return {
							context_favorizefriend:				"将朋友添加到收藏夹",
							context_hidefriend:					"隐藏朋友",
							context_unfavorizefriend:			"从收藏夹中删除朋友",
							context_unhidefriend:				"取消隐藏好友",
							favorites:							"收藏夹",
							hidden:								"隐",
							incoming:							"进来的",
							outgoing:							"外向"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							context_favorizefriend:				"將朋友添加到收藏夾",
							context_hidefriend:					"隱藏朋友",
							context_unfavorizefriend:			"從收藏夾中刪除朋友",
							context_unhidefriend:				"取消隱藏好友",
							favorites:							"收藏夾",
							hidden:								"隱",
							incoming:							"傳入",
							outgoing:							"外向"
						};
					default:		// English
						return {
							context_favorizefriend:				"Add Friend to Favorites",
							context_hidefriend:					"Hide Friend",
							context_unfavorizefriend:			"Remove Friend from Favorites",
							context_unhidefriend:				"Unhide Friend",
							favorites:							"Favorites",
							hidden:								"Hidden",
							incoming:							"Incoming",
							outgoing:							"Outgoing"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
