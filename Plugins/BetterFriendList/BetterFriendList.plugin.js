/**
 * @name BetterFriendList
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.3.3
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
			"version": "1.3.3",
			"description": "Adds extra Controls to the Friends Page, for example sort by Name/Status, Search and All/Request/Blocked Amount"
		},
		"changeLog": {
			"fixed": {
				"Changed Style": ""
			}
		}
	};

	return (window.Lightcord || window.LightCord) ? class {
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
			onLoad () {
				this.defaults = {
					general: {
						addTotalAmount:		{value: true, 	description: "Add total Amount for All/Requested/Blocked"},
						addSortOptions:		{value: true, 	description: "Add Sort Options"},
						addSearchbar:		{value: true, 	description: "Add a Searchbar"},
						addMutualGuild:		{value: true, 	description: "Add mutual Servers in Friend List"}
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
				`;
			}
			
			onStart () {
				sortKey = null;
				sortReversed = false;
				searchQuery = "";

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
				BDFDB.PatchUtils.forceAllUpdates(this);
				this.rerenderList();
			}

			processTabBar (e) {
				if (this.settings.general.addTotalAmount && e.returnvalue.props.children) for (let checkChild of e.returnvalue.props.children) if (checkChild && checkChild.props.id == "ADD_FRIEND") {
					let relationships = BDFDB.LibraryModules.RelationshipStore.getRelationships(), relationshipCount = {};
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
								newChildren.push(this.createBadge(relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.PENDING_INCOMING], this.labels.incoming, relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.PENDING_INCOMING] > 0));
								newChildren.push(this.createBadge(relationshipCount[BDFDB.DiscordConstants.RelationshipTypes.PENDING_OUTGOING], this.labels.outgoing));
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
					else if (this.settings.general.addMutualGuild && e.instance.props.mutualGuilds && e.instance.props.mutualGuilds.length) {
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
				let selectedButton = document.querySelector(BDFDB.dotCNS.peoplestabbar + BDFDB.dotCN.settingsitemselected);
				if (selectedButton) selectedButton.click();
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							incoming:							"Входящи",
							outgoing:							"Изходящи"
						};
					case "da":		// Danish
						return {
							incoming:							"Indgående",
							outgoing:							"Udgående"
						};
					case "de":		// German
						return {
							incoming:							"Eingehend",
							outgoing:							"Ausgehend"
						};
					case "el":		// Greek
						return {
							incoming:							"Εισερχόμενος",
							outgoing:							"Εξερχόμενος"
						};
					case "es":		// Spanish
						return {
							incoming:							"Entrante",
							outgoing:							"Saliente"
						};
					case "fi":		// Finnish
						return {
							incoming:							"Saapuva",
							outgoing:							"Lähtevä"
						};
					case "fr":		// French
						return {
							incoming:							"Entrant",
							outgoing:							"Sortant"
						};
					case "hr":		// Croatian
						return {
							incoming:							"Dolazni",
							outgoing:							"Odlazni"
						};
					case "hu":		// Hungarian
						return {
							incoming:							"Beérkező",
							outgoing:							"Kimenő"
						};
					case "it":		// Italian
						return {
							incoming:							"In arrivo",
							outgoing:							"Estroverso"
						};
					case "ja":		// Japanese
						return {
							incoming:							"着信",
							outgoing:							"発信"
						};
					case "ko":		// Korean
						return {
							incoming:							"들어오는",
							outgoing:							"나가는"
						};
					case "lt":		// Lithuanian
						return {
							incoming:							"Gaunamasis",
							outgoing:							"Išeinantis"
						};
					case "nl":		// Dutch
						return {
							incoming:							"Inkomend",
							outgoing:							"Uitgaand"
						};
					case "no":		// Norwegian
						return {
							incoming:							"Innkommende",
							outgoing:							"Utgående"
						};
					case "pl":		// Polish
						return {
							incoming:							"Przychodzący",
							outgoing:							"Towarzyski"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							incoming:							"Entrada",
							outgoing:							"Extrovertido"
						};
					case "ro":		// Romanian
						return {
							incoming:							"Primite",
							outgoing:							"De ieșire"
						};
					case "ru":		// Russian
						return {
							incoming:							"Входящий",
							outgoing:							"Исходящий"
						};
					case "sv":		// Swedish
						return {
							incoming:							"Inkommande",
							outgoing:							"Utgående"
						};
					case "th":		// Thai
						return {
							incoming:							"ขาเข้า",
							outgoing:							"ขาออก"
						};
					case "tr":		// Turkish
						return {
							incoming:							"Gelen",
							outgoing:							"Dışa dönük"
						};
					case "uk":		// Ukrainian
						return {
							incoming:							"Вхідні",
							outgoing:							"Вихідний"
						};
					case "vi":		// Vietnamese
						return {
							incoming:							"Mới đến",
							outgoing:							"Hướng ngoaị"
						};
					case "zh-CN":	// Chinese (China)
						return {
							incoming:							"进来的",
							outgoing:							"外向"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							incoming:							"傳入",
							outgoing:							"外向"
						};
					default:		// English
						return {
							incoming:							"Incoming",
							outgoing:							"Outgoing"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();