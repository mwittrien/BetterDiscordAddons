/**
 * @name BetterFriendList
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterFriendList
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterFriendList/BetterFriendList.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterFriendList/BetterFriendList.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "BetterFriendList",
			"author": "DevilBro",
			"version": "1.3.2",
			"description": "Add extra controls to the friends page, like sort by name/status, search and all/request/blocked amount"
		},
		"changeLog": {
			"fixed": {
				"Mutual Guilds": "Visible again"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
		stop() {}
		getSettingsPanel() {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The library plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", _ => {
				require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
					if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
					else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
				});
			});
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
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
		
		return class BetterFriendList extends Plugin {
			onLoad() {
				this.defaults = {
					settings: {
						addTotalAmount:		{value: true, 	description: "Add total amount for all/requested/blocked"},
						addSortOptions:		{value: true, 	description: "Add sort options"},
						addSearchbar:		{value: true, 	description: "Add searchbar"},
						addMutualGuild:		{value: true, 	description: "Add mutual servers in friend list"}
					}
				};

				this.patchedModules = {
					before: {
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
			}
			
			onStart() {
				sortKey = null;
				sortReversed = false;
				searchQuery = "";

				this.forceUpdateAll();
			}
			
			onStop() {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll() {
				settings = BDFDB.DataUtils.get(this, "settings");

				BDFDB.PatchUtils.forceAllUpdates(this);
				this.rerenderList();
			}

			processTabBar (e) {
				if (settings.addTotalAmount && e.returnvalue.props.children) for (let checkChild of e.returnvalue.props.children) if (checkChild && checkChild.props.id == "ADD_FRIEND") {
					let relationships = BDFDB.LibraryModules.FriendUtils.getRelationships(), relationshipCount = {};
					for (let type in BDFDB.DiscordConstants.RelationshipTypes) relationshipCount[type] = 0;
					for (let id in relationships) relationshipCount[relationships[id]]++;
					for (let child of e.returnvalue.props.children) if (child && child.props.id != "ADD_FRIEND") {
						let newChildren = [child.props.children].flat().filter(child => BDFDB.ObjectUtils.get(child, "type.displayName") != "NumberBadge");
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
				if (!BDFDB.PatchUtils.isPatched(this, e.instance.props, "getSectionTitle")) BDFDB.PatchUtils.patch(this, e.instance.props, "getSectionTitle", {after: e2 => {
					if (typeof e2.returnValue == "string") {
						let users = e.instance.props.statusSections.flat(10);
						return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							align: BDFDB.LibraryComponents.Flex.Align.CENTER,
							children: [
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN._betterfriendlisttitle,
									children: e2.returnValue.replace(users.length, users.filter(u => u && u.key != placeHolderId).length)
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
					}
				}}, {force: true, noCache: true});
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
					rerenderTimeout = BDFDB.TimeUtils.timeout(_ => {BDFDB.PatchUtils.forceAllUpdates(this, "TabBar");}, 1000);
				}
				else {
					if (e.instance.props.user.id == placeHolderId) return null;
					else if (settings.addMutualGuild && e.instance.props.mutualGuilds && e.instance.props.mutualGuilds.length) {
						if (typeof e.returnvalue.props.children == "function") {
							let childrenRender = e.returnvalue.props.children;
							e.returnvalue.props.children = (...args) => {
								let children = childrenRender(...args);
								this.injectMutualGuilds(children, e.instance.props.mutualGuilds);
								return children;
							};
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
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();