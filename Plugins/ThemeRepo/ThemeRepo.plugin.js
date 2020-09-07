//META{"name":"ThemeRepo","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ThemeRepo","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ThemeRepo/ThemeRepo.plugin.js"}*//

var ThemeRepo = (_ => {
	var _this;	
	var loading, cachedThemes, grabbedThemes, foundThemes, loadedThemes, generatorThemes, updateInterval;
	var list, header, preview, searchTimeout, updateGeneratorTimeout, forceRerenderGenerator, forcedSort, forcedOrder, showOnlyOutdated;
	var settings = {}, modalSettings = {}, favorites = [], customList = [];
	
	const themeStates = {
		UPDATED: 0,
		OUTDATED: 1,
		DOWNLOADABLE: 2
	};
	const buttonData = {
		UPDATED: {
			colorClass: "GREEN",
			backgroundColor: "STATUS_GREEN",
			text: "Updated"
		},
		OUTDATED: {
			colorClass: "RED",
			backgroundColor: "STATUS_RED",
			text: "Outdated"
		},
		DOWNLOADABLE: {
			colorClass: "BRAND",
			backgroundColor: "BRAND",
			text: "Download"
		}
	};
	const favStates = {
		FAVORIZED: 0,
		NOT_FAVORIZED: 1
	};
	const newStates = {
		NEW: 0,
		NOT_NEW: 1
	};
	const sortKeys = {
		NAME:			"Name",
		AUTHOR:			"Author",
		VERSION:		"Version",
		DESCRIPTION:	"Description",
		STATE:			"Update State",
		FAV:			"Favorites",
		NEW:			"New Themes"
	};
	const orderKeys = {
		ASC:			"ascending",
		DESC:			"descending"
	};
	
	const themeRepoIcon = `<svg width="36" height="31" viewBox="20 0 400 332"><path d="M0.000 39.479 L 0.000 78.957 43.575 78.957 L 87.151 78.957 87.151 204.097 L 87.151 329.236 129.609 329.236 L 172.067 329.236 172.067 204.097 L 172.067 78.957 215.642 78.957 L 259.218 78.957 259.218 39.479 L 259.218 0.000 129.609 0.000 L 0.000 0.000 0.000 39.479" stroke="none" fill="#7289da" fill-rule="evenodd"></path><path d="M274.115 38.624 L 274.115 77.248 280.261 77.734 C 309.962 80.083,325.986 106.575,313.378 132.486 C 305.279 149.131,295.114 152.700,255.800 152.700 L 230.168 152.700 230.168 123.277 L 230.168 93.855 208.566 93.855 L 186.965 93.855 186.965 211.546 L 186.965 329.236 208.566 329.236 L 230.168 329.236 230.168 277.068 L 230.168 224.899 237.268 225.113 L 244.368 225.326 282.215 277.095 L 320.062 328.864 360.031 329.057 L 400.000 329.249 400.000 313.283 L 400.000 297.317 367.924 256.908 L 335.848 216.499 340.182 214.869 C 376.035 201.391,395.726 170.616,399.382 122.342 C 405.008 48.071,360.214 0.000,285.379 0.000 L 274.115 0.000 274.115 38.624" stroke="none" fill="#7f8186" fill-rule="evenodd"></path></svg>`;
	
	const RepoListComponent = class ThemeList extends BdApi.React.Component {
		componentDidMount() {
			list = this;
			BDFDB.TimeUtils.timeout(_ => {
				forcedSort = null;
				forcedOrder = null;
				showOnlyOutdated = false;
			}, 5000);
		}
		componentWillUnmount() {
			if (preview) {
				BDFDB.WindowUtils.close(preview);
				preview = null;
			}
		}
		filterThemes() {
			let themes = Object.keys(loadedThemes).map(url => {
				let theme = loadedThemes[url];
				let instTheme = BDFDB.BDUtils.getTheme(theme.name);
				if (instTheme && instTheme.author.toUpperCase() == theme.author.toUpperCase()) theme.state = instTheme.version != theme.version ? themeStates.OUTDATED : themeStates.UPDATED;
				else theme.state = themeStates.DOWNLOADABLE;
				return {
					url: theme.url,
					requesturl: theme.requesturl,
					search: (theme.name + " " + theme.version + " " + theme.author + " " + theme.description).toUpperCase(),
					name: theme.name,
					version: theme.version,
					author: theme.author,
					description: theme.description || "No Description found.",
					fav: favorites.includes(url) ? favStates.FAVORIZED : favStates.NOT_FAVORIZED,
					new: !cachedThemes.includes(url) ? newStates.NEW : newStates.NOT_NEW,
					state: theme.state,
					css: theme.css,
					fullcss: theme.fullcss
				};
			});
			if (!this.props.updated)		themes = themes.filter(theme => theme.state != themeStates.UPDATED);
			if (!this.props.outdated)		themes = themes.filter(theme => theme.state != themeStates.OUTDATED);
			if (!this.props.downloadable)	themes = themes.filter(theme => theme.state != themeStates.DOWNLOADABLE);
			if (this.props.searchString) 	{
				let searchString = this.props.searchString.toUpperCase();
				themes = themes.filter(theme => theme.search.indexOf(searchString) > -1).map(theme => Object.assign({}, theme, {
					name: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(theme.name, searchString))) || theme.name,
					version: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(theme.version, searchString))) || theme.version,
					author: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(theme.author, searchString))) || theme.author,
					description: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(theme.description, searchString))) || theme.description
				}));
			}

			BDFDB.ArrayUtils.keySort(themes, (!this.props.sortKey || this.props.sortKey == "NEW" && !themes.some(theme => theme.new == newStates.NEW) ? Object.keys(sortKeys)[0] : this.props.sortKey).toLowerCase());
			if (this.props.orderKey == "DESC") themes.reverse();
			return themes;
		}
		openPreview() {
			preview = BDFDB.WindowUtils.open(this, "https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/DiscordPreview.html", {
				alwaysOnTop: settings.keepOnTop,
				showOnReady: true,
				frame: false,
				onLoad: _ => {
					let nativeCSS = document.querySelector("head link[rel='stylesheet'][integrity]");
					let titleBar = document.querySelector(BDFDB.dotCN.titlebar);
					preview.executeJavaScriptSafe(`window.onmessage({
						origin: "ThemeRepo",
						reason: "OnLoad",
						username: ${JSON.stringify(BDFDB.UserUtils.me.username || "")},
						id: ${JSON.stringify(BDFDB.UserUtils.me.id || "")},
						discriminator: ${JSON.stringify(BDFDB.UserUtils.me.discriminator || "")},
						avatar: ${JSON.stringify(BDFDB.UserUtils.getAvatar() || "")},
						classes: ${JSON.stringify(JSON.stringify(BDFDB.DiscordClasses))},
						classModules: ${JSON.stringify(JSON.stringify(BDFDB.DiscordClassModules))},
						nativeCSS: ${JSON.stringify(nativeCSS && nativeCSS.href || "")},
						htmlClassName: ${JSON.stringify(document.documentElement.className || "")},
						titleBar: ${JSON.stringify(titleBar && titleBar.outerHTML || "")}
					})`);
					if (this.props.currentTheme) preview.executeJavaScriptSafe(`window.onmessage({
						origin: "ThemeRepo",
						reason: "NewTheme",
						checked: true,
						css: ${JSON.stringify(this.props.currentTheme.css || "")}
					})`);
					if (this.props.currentGenerator) preview.executeJavaScriptSafe(`window.onmessage({
						origin: "ThemeRepo",
						reason: "NewTheme",
						checked: true,
						css: ${JSON.stringify((loadedThemes[this.props.currentGenerator] || {}).fullcss || "")}
					})`);
					if (this.props.useLightMode) preview.executeJavaScriptSafe(`window.onmessage({
						origin: "ThemeRepo",
						reason: "DarkLight",
						checked: true
					})`);
					if (this.props.useNormalizer) preview.executeJavaScriptSafe(`window.onmessage({
						origin: "ThemeRepo",
						reason: "Normalize",
						checked: true
					})`);
					if (this.props.useCustomCSS) preview.executeJavaScriptSafe(`window.onmessage({
						origin: "ThemeRepo",
						reason: "CustomCSS",
						checked: true
					})`);
					if (this.props.useThemeFixer) preview.executeJavaScriptSafe(`window.onmessage({
						origin: "ThemeRepo",
						reason: "ThemeFixer",
						checked: true
					})`);
				},
				onClose: _ => {
					preview = null;
				}
			});
		}
		render() {
			let automaticLoading = BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.automaticLoading);
			if (!this.props.tab) this.props.tab = "Themes";
			this.props.entries = (!loading.is && !BDFDB.ObjectUtils.isEmpty(loadedThemes) ? this.filterThemes() : []).map(theme => BDFDB.ReactUtils.createElement(RepoCardComponent, {
				theme: theme
			})).filter(n => n);
			
			BDFDB.TimeUtils.timeout(_ => {
				if (!loading.is && header && this.props.entries.length != header.props.amount) {
					header.props.amount = this.props.entries.length;
					BDFDB.ReactUtils.forceUpdate(header);
				}
			});
			
			if (forceRerenderGenerator && this.props.tab == "Generator") BDFDB.TimeUtils.timeout(_ => {
				forceRerenderGenerator = false;
				BDFDB.ReactUtils.forceUpdate(this);
			});
			
			return [
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
					tab: "Themes",
					open: this.props.tab == "Themes",
					render: false,
					children: loading.is ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
						direction: BDFDB.LibraryComponents.Flex.Direction.VERTICAL,
						justify: BDFDB.LibraryComponents.Flex.Justify.CENTER,
						style: {marginTop: "50%"},
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Spinner, {
								type: BDFDB.LibraryComponents.Spinner.Type.WANDERING_CUBES
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
								className: BDFDB.disCN.margintop20,
								style: {textAlign: "center"},
								children: "Themes are still being fetched. Please wait a moment."
							})
						]
					}) : BDFDB.ReactUtils.forceStyle(BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._repolist,
						style: {
							display: "flex",
							flexDirection: "column",
							margin: "unset",
							width: "unset"
						},
						children: this.props.entries
					}), ["display", "flex-direction", "margin", "width"])
				}),
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
					tab: "Generator",
					open: this.props.tab == "Generator",
					render: false,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							className: BDFDB.disCN.marginbottom20,
							type: "Select",
							label: "Choose a Generator Theme",
							basis: "60%",
							value: this.props.currentGenerator || "-----",
							options: ["-----"].concat(generatorThemes).map(url => ({value:url, label:(loadedThemes[url] || {}).name || "-----"})).sort((x, y) => (x.label < y.label ? -1 : x.label > y.label ? 1 : 0)),
							searchable: true,
							onChange: (value, instance) => {
								if (loadedThemes[value.value]) {
									if (this.props.currentGenerator) forceRerenderGenerator = true;
									this.props.currentGenerator = value.value;
									this.props.generatorValues = {};
								}
								else {
									delete this.props.currentGenerator;
									delete this.props.generatorValues;
								}
								delete this.props.currentTheme;
								if (preview) preview.executeJavaScriptSafe(`window.onmessage({
									origin: "ThemeRepo",
									reason: "NewTheme",
									checked: true,
									css: ${JSON.stringify((loadedThemes[value.value] || {}).fullcss || "")}
								})`);
								else this.openPreview();
								BDFDB.ReactUtils.forceUpdate(this);
							}
						}),
						!this.props.currentGenerator ? null : (forceRerenderGenerator ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							direction: BDFDB.LibraryComponents.Flex.Direction.VERTICAL,
							justify: BDFDB.LibraryComponents.Flex.Justify.CENTER,
							style: {marginTop: "50%"},
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Spinner, {
								type: BDFDB.LibraryComponents.Spinner.Type.WANDERING_CUBES
							})
						}) : [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								className: BDFDB.disCN.marginbottom20,
								type: "Button",
								label: "Download generated Theme",
								children: "Download",
								onClick: _ => {
									if (loadedThemes[this.props.currentGenerator]) _this.createThemeFile(loadedThemes[this.props.currentGenerator].name + ".theme.css", _this.generateTheme(loadedThemes[this.props.currentGenerator], this.props.generatorValues));
								}
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
								className: BDFDB.disCN.marginbottom20
							}),
							(_ => {
								let vars = loadedThemes[this.props.currentGenerator].fullcss.split(":root");
								if (vars.length < 2) return null;
								vars = vars[1].replace(/\t\(/g, " (").replace(/\r|\t| {2,}/g, "").replace(/\/\*\n*((?!\/\*|\*\/).|\n)*\n+((?!\/\*|\*\/).|\n)*\n*\*\//g, "").replace(/\n\/\*.*?\*\//g, "").replace(/\n/g, "");
								vars = vars.split("{");
								vars.shift();
								vars = vars.join("{").replace(/\s*(:|;|--|\*)\s*/g, "$1");
								vars = vars.split("}")[0];
								vars = vars.slice(2).split(/;--|\*\/--/);
								let inputRefs = [];
								for (let varStr of vars) {
									varStr = varStr.split(":");
									let varName = varStr.shift().trim();
									varStr = varStr.join(":").split(/;[^A-z0-9]|\/\*/);
									let oldValue = varStr.shift().trim();
									if (oldValue) {
										let childType = "text", childMode = "";
										let isColor = BDFDB.ColorUtils.getType(oldValue);
										let isComp = !isColor && /[0-9 ]+,[0-9 ]+,[0-9 ]+/g.test(oldValue);
										if (isColor || isComp) {
											childType = "color";
											childMode = isComp && "comp";
										}
										else {
											let isUrlFile = /url\(.+\)/gi.test(oldValue);
											let isFile = !isUrlFile && /(http(s)?):\/\/[(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(oldValue);
											if (isFile || isUrlFile) {
												childType = "file";
												childMode = isUrlFile && "url";
											}
										}
										let varDescription = varStr.join("").replace(/\*\/|\/\*/g, "").replace(/:/g, ": ").replace(/: \//g, ":/").replace(/--/g, " --").replace(/\( --/g, "(--").trim();
										this.props.generatorValues[varName] = {value:oldValue, oldValue};
										inputRefs.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
											className: BDFDB.disCN.marginbottom20,
											dividerbottom: vars[vars.length-1] != varStr,
											type: "TextInput",
											childProps: {
												type: childType,
												mode: childMode,
												filter: childType == "file" && "image"
											},
											label: varName[0].toUpperCase() + varName.slice(1),
											note: varDescription && varDescription.indexOf("*") == 0 ? varDescription.slice(1) : varDescription,
											basis: "70%",
											value: oldValue,
											placeholder: oldValue,
											onChange: value => {
												BDFDB.TimeUtils.clear(updateGeneratorTimeout);
												updateGeneratorTimeout = BDFDB.TimeUtils.timeout(_ => {
													this.props.generatorValues[varName] = {value, oldValue};
													if (preview) preview.executeJavaScriptSafe(`window.onmessage({
														origin: "ThemeRepo",
														reason: "NewTheme",
														checked: true,
														css: ${JSON.stringify(_this.generateTheme(loadedThemes[this.props.currentGenerator], this.props.generatorValues) || "")}
													})`);
												}, 1000);
											}
										}));
									}
								}
								return inputRefs;
							})()
						])
					].flat(10).filter(n => n)
				}),
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
					tab: BDFDB.LanguageUtils.LanguageStrings.SETTINGS,
					open: this.props.tab == BDFDB.LanguageUtils.LanguageStrings.SETTINGS,
					render: false,
					children: [
						!automaticLoading && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							className: BDFDB.disCN.marginbottom20,
							children: BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCNS.titledefault + BDFDB.disCN.cursordefault,
								children: "To experience ThemeRepo in the best way. I would recommend you to enable BD intern reload function, that way all downloaded files are loaded into Discord without the need to reload."
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							className: BDFDB.disCN.marginbottom20,
							type: "Switch",
							label: "Preview in light mode",
							value: this.props.useLightMode,
							onChange: (value, instance) => {
								this.props.useLightMode = value;
								if (preview) preview.executeJavaScriptSafe(`window.onmessage({
									origin: "ThemeRepo",
									reason: "DarkLight",
									checked: ${this.props.useLightMode}
								})`);
							}
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							className: BDFDB.disCN.marginbottom20,
							type: "Switch",
							label: "Preview with useNormalizer classes",
							value: this.props.useNormalizer,
							onChange: (value, instance) => {
								this.props.useNormalizer = value;
								if (preview) preview.executeJavaScriptSafe(`window.onmessage({
									origin: "ThemeRepo",
									reason: "Normalize",
									checked: ${this.props.useNormalizer}
								})`);
							}
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							className: BDFDB.disCN.marginbottom20,
							type: "Switch",
							label: "Include Custom CSS in Preview",
							value: this.props.useCustomCSS,
							onChange: (value, instance) => {
								this.props.useCustomCSS = value;
								let customCSS = document.querySelector("style#customcss");
								if (preview && customCSS && customCSS.innerText.length > 0) preview.executeJavaScriptSafe(`window.onmessage({
									origin: "ThemeRepo",
									reason: "CustomCSS",
									checked: ${this.props.useCustomCSS},
									css: ${JSON.stringify(customCSS.innerText || "")}
								})`);
							}
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							className: BDFDB.disCN.marginbottom20,
							type: "Switch",
							label: "Include ThemeFixer CSS in Preview",
							value: this.props.useThemeFixer,
							onChange: (value, instance) => {
								this.props.useThemeFixer  = value;
								BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeFixer.css", (error, response, body) => {
									if (preview) preview.executeJavaScriptSafe(`window.onmessage({
										origin: "ThemeRepo",
										reason: "ThemeFixer",
										checked: ${this.props.useThemeFixer},
										css: ${JSON.stringify(_this.createFixerCSS(body) || "")}
									})`);
								});
							}
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							className: BDFDB.disCN.marginbottom20,
							type: "Button",
							label: "Download ThemeFixer",
							children: "Download",
							onClick: _ => {
								BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeFixer.css", (error, response, body) => {
									_this.createThemeFile("ThemeFixer.theme.css", `//META{"name":"ThemeFixer","description":"ThemeFixerCSS for transparent themes","author":"DevilBro","version":"1.0.3","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien"}*//\n\n` + _this.createFixerCSS(body));
								});
							}
						}),
						Object.keys(modalSettings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							className: BDFDB.disCN.marginbottom20,
							type: "Switch",
							plugin: _this,
							keys: ["modalSettings", key],
							label: _this.defaults.modalSettings[key].description,
							note: key == "rnmStart" && !automaticLoading && "Automatic Loading has to be enabled",
							disabled: key == "rnmStart" && !automaticLoading,
							value: this.props[key],
							onChange: (value, instance) => {
								this.props[key] = value;
								BDFDB.ReactUtils.forceUpdate(this);
							}
						}))
					].flat(10).filter(n => n)
				})
			];
		}
	};
	
	const RepoCardComponent = class ThemeCard extends BdApi.React.Component {
		render() {
			let buttonConfig = buttonData[(Object.entries(themeStates).find(n => n[1] == this.props.theme.state) || [])[0]];
			return buttonConfig && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.AddonCard, {
				data: this.props.theme,
				controls: [
					this.props.theme.new == newStates.NEW && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.TextBadge, {
						style: {
							borderRadius: 3,
							textTransform: "uppercase",
							background: BDFDB.DiscordConstants.Colors.STATUS_YELLOW
						},
						text: BDFDB.LanguageUtils.LanguageStrings.NEW
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FavButton, {
						className: BDFDB.disCN._repocontrolsbutton,
						isFavorite: this.props.theme.fav == favStates.FAVORIZED,
						onClick: value => {
							this.props.theme.fav = value ? favStates.FAVORIZED : favStates.NOT_FAVORIZED;
							if (value) favorites.push(this.props.theme.url);
							else BDFDB.ArrayUtils.remove(favorites, this.props.theme.url, true);
							BDFDB.DataUtils.save(favorites, _this, "favorites");
						}
					}),
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._repocontrolsbutton,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: "Go to Source",
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								name: BDFDB.LibraryComponents.SvgIcon.Names.GITHUB,
								className: BDFDB.disCN._repoicon,
								onClick: _ => {
									let gitUrl = null;
									if (this.props.theme.url.indexOf("https://raw.githubusercontent.com") == 0) {
										let temp = this.props.theme.url.replace("//raw.githubusercontent", "//github").split("/");
										temp.splice(5, 0, "blob");
										gitUrl = temp.join("/");
									}
									else if (this.props.theme.url.indexOf("https://gist.githubusercontent.com/") == 0) {
										gitUrl = this.props.theme.url.replace("//gist.githubusercontent", "//gist.github").split("/raw/")[0];
									}
									if (gitUrl) BDFDB.DiscordUtils.openLink(gitUrl, settings.useChromium);
								}
							})
						})
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Switch, {
						value: list && list.props.currentTheme && list.props.currentTheme.url == this.props.theme.url,
						onChange: (value, instance) => {
							if (!list) return;
							if (value) list.props.currentTheme = this.props.theme;
							else delete list.props.currentTheme;
							delete list.props.currentGenerator;
							delete list.props.generatorValues;
							if (preview) preview.executeJavaScriptSafe(`window.onmessage({
								origin: "ThemeRepo",
								reason: "NewTheme",
								checked: ${value},
								css: ${JSON.stringify(this.props.theme.css || "")}
							})`);
							else list.openPreview();
							BDFDB.ReactUtils.forceUpdate(this);
						}
					})
				],
				buttons: [
					this.props.theme.state != themeStates.DOWNLOADABLE && BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._repocontrolsbutton,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: "Delete Themefile",
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								name: BDFDB.LibraryComponents.SvgIcon.Names.NOVA_TRASH,
								className: BDFDB.disCN._repoicon,
								onClick: (e, instance) => {
									_this.removeTheme(this.props.theme);
									_this.deleteThemeFile(this.props.theme);
									this.props.theme.state = themeStates.DOWNLOADABLE;
									BDFDB.ReactUtils.forceUpdate(this);
								}
							})
						})
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
						size: BDFDB.LibraryComponents.Button.Sizes.MIN,
						color: BDFDB.LibraryComponents.Button.Colors[buttonConfig.colorClass],
						style: {backgroundColor: BDFDB.DiscordConstants.Colors[buttonConfig.backgroundColor]},
						children: buttonConfig.text,
						onClick: (e, instance) => {
							_this.downloadTheme(this.props.theme);
							if (list && list.props.rnmStart) BDFDB.TimeUtils.timeout(_ => {
								if (this.props.theme.state == themeStates.UPDATED) _this.applyTheme(this.props.theme);
							}, 3000);
							this.props.theme.state = themeStates.UPDATED;
							BDFDB.ReactUtils.forceUpdate(this);
						}
					})
				]
			});
		}
	};
	
	const RepoListHeaderComponent = class ThemeListHeader extends BdApi.React.Component {
		componentDidMount() {
			header = this;
		}
		render() {
			if (!this.props.tab) this.props.tab = "Themes";
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN._repolistheader,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
						className: BDFDB.disCN.marginbottom4,
						align: BDFDB.LibraryComponents.Flex.Align.CENTER,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
								tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H2,
								className: BDFDB.disCN.marginreset,
								children: `Theme Repo — ${loading.is ? 0 : this.props.amount || 0}/${loading.is ? 0 : Object.keys(loadedThemes).length}`
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SearchBar, {
									autoFocus: true,
									query: this.props.searchString,
									onChange: (value, instance) => {
										BDFDB.TimeUtils.clear(searchTimeout);
										searchTimeout = BDFDB.TimeUtils.timeout(_ => {
											this.props.searchString = list.props.searchString = value.replace(/[<|>]/g, "");
											BDFDB.ReactUtils.forceUpdate(this, list);
										}, 1000);
									},
									onClear: instance => {
										this.props.searchString = list.props.searchString = "";
										BDFDB.ReactUtils.forceUpdate(this, list);
									}
								})
							})
						]
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
						className: BDFDB.disCNS.tabbarcontainer + BDFDB.disCN.tabbarcontainerbottom,
						align: BDFDB.LibraryComponents.Flex.Align.CENTER,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TabBar, {
									className: BDFDB.disCN.tabbar,
									itemClassName: BDFDB.disCN.tabbaritem,
									type: BDFDB.LibraryComponents.TabBar.Types.TOP,
									selectedItem: this.props.tab,
									items: [{value:"Themes"}, {value:"Generator"}, {value:BDFDB.LanguageUtils.LanguageStrings.SETTINGS}],
									onItemSelect: (value, instance) => {
										this.props.tab = list.props.tab = value;
										BDFDB.ReactUtils.forceUpdate(list);
									}
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.QuickSelect, {
									label: BDFDB.LanguageUtils.LibraryStrings.sort_by + ":",
									value: {
										label: sortKeys[this.props.sortKey],
										value: this.props.sortKey
									},
									options: Object.keys(sortKeys).filter(n => n != "NEW" || Object.keys(loadedThemes).some(p => !cachedThemes.includes(p))).map(key => ({
										label: sortKeys[key],
										value: key
									})),
									onChange: (key, instance) => {
										this.props.sortKey = list.props.sortKey = key;
										BDFDB.ReactUtils.forceUpdate(this, list);
									}
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.QuickSelect, {
									label: BDFDB.LanguageUtils.LibraryStrings.order + ":",
									value: {
										label: BDFDB.LanguageUtils.LibraryStrings[orderKeys[this.props.orderKey]],
										value: this.props.orderKey
									},
									options: Object.keys(orderKeys).map(key => ({
										label: BDFDB.LanguageUtils.LibraryStrings[orderKeys[key]],
										value: key
									})),
									onChange: (key, instance) => {
										this.props.orderKey = list.props.orderKey = key;
										BDFDB.ReactUtils.forceUpdate(this, list);
									}
								})
							})
						]
					})
				]
			});
		}
	};
	
	return class ThemeRepo {
		getName () {return "ThemeRepo";}

		getVersion () {return "2.0.6";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Allows you to preview all themes from the theme repo and download them on the fly. Repo button is in the theme settings.";}

		constructor () {
			this.changelog = {
				"fixed":[["Auto Enable","No longer adds two copies of the theme"]]
			};
			
			this.patchedModules = {
				before: {
					SettingsView: "render"
				},
				after: {
					StandardSidebarView: "render"
				}
			};
		}

		initConstructor () {
			_this = this;
			
			loading = {is:false, timeout:null, amount:0};
			
			cachedThemes = [];
			grabbedThemes = [];
			foundThemes = [];
			loadedThemes = {};
			generatorThemes = [];

			this.defaults = {
				settings: {
					useChromium: 		{value:false,		description:"Use an inbuilt browser window instead of opening your default browser"},
					keepOnTop: 			{value:false,		description:"Keep the preview window always on top"},
					notifyOutdated:		{value:true, 		description:"Notifies you when one of your Themes is outdated"},
					notifyNewentries:	{value:true, 		description:"Notifies you when there are new entries in the Repo"}
				},
				modalSettings: {
					updated: 			{value:true,	modify:true,	description:"Show updated Themes",},
					outdated:			{value:true, 	modify:true,	description:"Show outdated Themes"},
					downloadable:		{value:true, 	modify:true,	description:"Show downloadable Themes"},
					rnmStart:			{value:true, 	modify:false,	description:"Apply Theme after Download"}
				}
			};

			this.css = `
				.${this.name}-modal.repo-modal {
					max-width: 800px;
					min-height: 90vh;
					max-height: 90vh;
				}
			`;
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let customUrl = "";
			let settingsPanel, settingsItems = [];
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Settings",
				collapseStates: collapseStates,
				children: Object.keys(settings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}))
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Custom Themes",
				collapseStates: collapseStates,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: "Add Theme:",
						tag: BDFDB.LibraryComponents.FormComponents.FormTitleTags.H3,
						className: BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom8,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							align: BDFDB.LibraryComponents.Flex.Align.CENTER,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										placeholder: "Insert Raw Github Link of Theme (https://raw.githubusercontent.com/...)",
										onChange: value => {customUrl = value.trim();}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
									onClick: _ => {
										if (customUrl) {
											customList.push(customUrl);
											BDFDB.DataUtils.save(BDFDB.ArrayUtils.removeCopies(customList), this, "custom");
											BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
										}
									},
									children: BDFDB.LanguageUtils.LanguageStrings.ADD
								})
							]
						})
					}),
					customList.length ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
						title: "Custom Theme List:",
						className: BDFDB.disCNS.margintop8 + BDFDB.disCN.marginbottom20,
						first: true,
						last: true,
						children: customList.map(url => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Card, {
							children: url,
							onRemove: _ => {
								BDFDB.ArrayUtils.remove(customList, url, true);
								BDFDB.DataUtils.save(customList, this, "custom");
								BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
							}
						}))
					}) : null,
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						type: "Button",
						color: BDFDB.LibraryComponents.Button.Colors.RED,
						label: "Remove all custom added Themes",
						onClick: _ => {
							BDFDB.ModalUtils.confirm(this, "Are you sure you want to remove all added Themes from your own list", _ => {
								BDFDB.DataUtils.save([], this, "custom");
								BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
							});
						},
						children: BDFDB.LanguageUtils.LanguageStrings.REMOVE
					})
				].flat(10).filter(n => n)
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Refetch All",
				collapseStates: collapseStates,
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					type: "Button",
					label: "Force all Themes to be fetched again",
					onClick: _ => {
						loading = {is:false, timeout:null, amount:0};
						this.loadThemes();
					},
					children: BDFDB.LanguageUtils.LanguageStrings.ERRORS_RELOAD
				})
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

				this.loadThemes();

				updateInterval = BDFDB.TimeUtils.interval(_ => {this.checkForNewThemes();}, 1000*60*30);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}


		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.TimeUtils.clear(updateInterval);
				BDFDB.TimeUtils.clear(loading.timeout);

				this.forceUpdateAll();

				BDFDB.DOMUtils.remove(".bd-themerepobutton", ".themerepo-notice", ".themerepo-loadingicon");

				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions
		
		forceUpdateAll () {
			settings = BDFDB.DataUtils.get(this, "settings");
			modalSettings = BDFDB.DataUtils.get(this, "modalSettings");
			favorites = BDFDB.DataUtils.load(this, "favorites");
			favorites = BDFDB.ArrayUtils.is(favorites) ? favorites : [];
			customList = BDFDB.DataUtils.load(this, "custom");
			customList = BDFDB.ArrayUtils.is(customList) ? customList : [];
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
		}

		onUserSettingsCogContextMenu (e) {
			BDFDB.TimeUtils.timeout(_ => {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["label", "BandagedBD"]]});
				if (index > -1 && BDFDB.ArrayUtils.is(children[index].props.children)) children[index].props.children.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
					label: "Theme Repo",
					id: BDFDB.ContextMenuUtils.createItemId(this.name, "repo"),
					action: _ => {
						BDFDB.LibraryModules.UserSettingsUtils.open("themerepo");
					}
				}));
			});
		}
		
		processSettingsView (e) {
			if (BDFDB.ArrayUtils.is(e.instance.props.sections) && e.instance.props.sections[0] && e.instance.props.sections[0].label == BDFDB.LanguageUtils.LanguageStrings.USER_SETTINGS && !e.instance.props.sections.find(n => n.section == "themerepo")) {
				let oldSettings = !e.instance.props.sections.find(n => n.section == "themes");
				let isPRinjected = oldSettings && e.instance.props.sections.find(n => n.section == "pluginrepo");
				let search = oldSettings ? (isPRinjected ? n => n.section == "pluginrepo" : n => n.section == BDFDB.DiscordConstants.UserSettingsSections.DEVELOPER_OPTIONS) : n => n.section == BDFDB.DiscordConstants.UserSettingsSections.CHANGE_LOG || n.section == "changelog"
				let index = e.instance.props.sections.indexOf(e.instance.props.sections.find(search));
				if (index > -1) {
					e.instance.props.sections.splice(oldSettings ? index + 1 : index - 1, 0, {
						label: "Theme Repo",
						section: "themerepo",
						element: _ => {
							let options = Object.assign({}, modalSettings);
							options.updated = options.updated && !showOnlyOutdated;
							options.outdated = options.outdated || showOnlyOutdated;
							options.downloadable = options.downloadable && !showOnlyOutdated;
							options.searchString = "";
							options.sortKey = forcedSort || Object.keys(sortKeys)[0];
							options.orderKey = forcedOrder || Object.keys(orderKeys)[0];
							options.useLightMode = BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themelight;
							options.useNormalizer = BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.normalizedClasses);
							options.useThemeFixer = false;
							options.useCustomCSS = false;
							
							return BDFDB.ReactUtils.createElement(RepoListComponent, options);
						}
					});
					if (oldSettings && !isPRinjected) e.instance.props.sections.splice(index + 1, 0, {section: "DIVIDER"});
				}
			}
		}
		
		processStandardSidebarView (e) {
			if (BDFDB.ReactUtils.getValue(e, "instance.props.content.props.section") == "themerepo") {
				let content = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.settingswindowcontentregion]]});
				if (content) content.props.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._repolistwrapper, content.props.className);
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.settingswindowcontentregionscroller]]});
				if (index > -1) {
					let options = {};
					options.searchString = "";
					options.sortKey = forcedSort || Object.keys(sortKeys)[0];
					options.orderKey = forcedOrder || Object.keys(orderKeys)[0];
					children[index] = [
						BDFDB.ReactUtils.createElement(RepoListHeaderComponent, options),
						children[index]
					];
				}
			}
		}
		
		createFixerCSS (body) {
			let oldcss = body.replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r").split("REPLACE_CLASS_");
			let newcss = oldcss.shift();
			for (let str of oldcss) {
				let reg = /([A-z0-9_]+)(.*)/.exec(str);
				newcss += BDFDB.dotCN[reg[1]] + reg[2];
			}
			return newcss.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "\r");
		}
		
		createGeneratorInputs (theme, generatorValues) {
			if (!BDFDB.ObjectUtils.is(theme) || !BDFDB.ObjectUtils.is(generatorValues) || !theme.fullcss) return null;
			return inputRefs;
		}
		
		generateTheme (theme, generatorValues) {
			if (!BDFDB.ObjectUtils.is(theme) || !BDFDB.ObjectUtils.is(generatorValues)) return "";
			let css = theme.fullcss;
			for (let inputId in generatorValues) if (generatorValues[inputId].value && generatorValues[inputId].value.trim() && generatorValues[inputId].value != generatorValues[inputId].oldValue) css = css.replace(new RegExp(`--${BDFDB.StringUtils.regEscape(inputId)}(\\s*):(\\s*)${BDFDB.StringUtils.regEscape(generatorValues[inputId].oldValue)}`,"g"),`--${inputId}$1:$2${generatorValues[inputId].value}`);
			return css;
		}

		loadThemes () {
			BDFDB.DOMUtils.remove(".themerepo-loadingicon");
			let getThemeInfo, outdated = 0, newEntries = 0, i = 0, NFLDreplace = null;
			let tags = ["name","description","author","version"];
			let newEntriesData = BDFDB.DataUtils.load(this, "newentriesdata");
			cachedThemes = (newEntriesData.urlbase64 ? atob(newEntriesData.urlbase64).split("\n") : []).concat(customList);
			BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeList.txt", (error, response, body) => {
				if (!error && body) {
					body = body.replace(/[\r\t]/g, "");
					BDFDB.DataUtils.save(btoa(body), this, "newentriesdata", "urlbase64");
					loadedThemes = {};
					grabbedThemes = body.split("\n").filter(n => n);
					BDFDB.LibraryRequires.request("https://github.com/NFLD99/Better-Discord", (error2, response2, body2) => {
						if (!error2 && body2) {
							NFLDreplace = /\/NFLD99\/Better-Discord\/tree\/master\/Themes_[^"]+">([^<]+)/i.exec(body2);
							NFLDreplace = NFLDreplace && NFLDreplace.length > 1 ? NFLDreplace[1] : null;
						}
						foundThemes = grabbedThemes.concat(customList);

						loading = {is:true, timeout:BDFDB.TimeUtils.timeout(_ => {
							BDFDB.TimeUtils.clear(loading.timeout);
							if (this.started) {
								if (loading.is && loading.amount < 4) BDFDB.TimeUtils.timeout(_ => {this.loadThemes();}, 10000);
								loading = {is: false, timeout:null, amount:loading.amount};
							}
						},1200000), amount:loading.amount+1};
					
						let loadingicon = BDFDB.DOMUtils.create(themeRepoIcon);
						BDFDB.DOMUtils.addClass(loadingicon, "themerepo-loadingicon");
						loadingicon.addEventListener("mouseenter", _ => {
							BDFDB.TooltipUtils.create(loadingicon, this.getLoadingTooltipText(), {
								type: "left",
								delay: 500,
								style: "max-width: unset;",
								selector: "themerepo-loading-tooltip"
							});
						});
						BDFDB.PluginUtils.addLoadingIcon(loadingicon);

						getThemeInfo(_ => {
							if (!this.started) {
								BDFDB.TimeUtils.clear(loading.timeout);
								return;
							}
							BDFDB.TimeUtils.clear(loading.timeout);
							BDFDB.DOMUtils.remove(loadingicon, ".themerepo-loadingicon");
							loading = {is:false, timeout:null, amount:loading.amount};
							
							BDFDB.LogUtils.log("Finished fetching Themes.", this.name);
							if (list) BDFDB.ReactUtils.forceUpdate(list);
							
							if ((settings.notifyOutdated || settings.notifyOutdated == undefined) && outdated > 0) {
								let oldbarbutton = document.querySelector(".themerepo-outdate-notice " + BDFDB.dotCN.noticedismiss);
								if (oldbarbutton) oldbarbutton.click();
								let bar = BDFDB.NotificationUtils.notice(`${outdated} of your Themes ${outdated == 1 ? "is" : "are"} outdated. Check:`, {
									type: "danger",
									btn: "ThemeRepo",
									selector: "themerepo-notice themerepo-outdate-notice",
									customicon: themeRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#7f8186/gi, "#B9BBBE")
								});
								bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", _ => {
									showOnlyOutdated = true;
									BDFDB.LibraryModules.UserSettingsUtils.open("themerepo");
									bar.querySelector(BDFDB.dotCN.noticedismiss).click();
								});
							}
							
							if (settings.notifyNewEntries && newEntries > 0) {
								let oldbarbutton = document.querySelector(".themerepo-newentries-notice " + BDFDB.dotCN.noticedismiss);
								if (oldbarbutton) oldbarbutton.click();
								let single = newEntries == 1;
								let bar = BDFDB.NotificationUtils.notice(`There ${single ? "is" : "are"} ${newentries} new Theme${single ? "" : "s"} in the Repo. Check:`, {
									type: "success",
									btn: "ThemeRepo",
									selector: "themerepo-notice themerepo-newentries-notice",
									customicon: themeRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#7f8186/gi, "#B9BBBE")
								});
								bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", _ => {
									forcedSort = "NEW";
									forcedOrder = "ASC";
									BDFDB.LibraryModules.UserSettingsUtils.open("themerepo");
									bar.querySelector(BDFDB.dotCN.noticedismiss).click();
								});
							}
							
							if (BDFDB.UserUtils.me.id == "278543574059057154") {
								let wrongUrls = [];
								for (let url of foundThemes) if (url && !loadedThemes[url] && !wrongUrls.includes(url)) wrongUrls.push(url);
								if (wrongUrls.length) {
									let bar = BDFDB.NotificationUtils.notice(`ThemeRepo: ${wrongUrls.length} Theme${wrongUrls.length > 1 ? "s" : ""} could not be loaded.`, {
										type: "danger",
										btn: "List",
										selector: "themerepo-notice themerepo-fail-notice",
										customicon: themeRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#7f8186/gi, "#B9BBBE")
									});
									bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", e => {
										let toast = BDFDB.NotificationUtils.toast(wrongUrls.join("\n"), {type: "error"});
										toast.style.setProperty("overflow", "hidden");
										for (let url of wrongUrls) console.log(url);
									});
								}
							}
							
							BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/GeneratorList.txt", (error3, response3, body3) => {
								if (!error3 && body3) for (let url of body3.replace(/[\r\t]/g, "").split("\n").filter(n => n)) if (loadedThemes[url]) generatorThemes.push(url);
							});
						});
					});
				}
			});
			 
			getThemeInfo = (callback) => {
				if (i >= foundThemes.length || !this.started || !loading.is) {
					callback();
					return;
				}
				let url = foundThemes[i];
				let requesturl = NFLDreplace && url.includes("NFLD99/Better-Discord/master/Themes") ? url.replace("master/Themes", "master/" + NFLDreplace) : url;
				BDFDB.LibraryRequires.request(requesturl, (error, response, body) => {
					if (!response) {
						if (url && BDFDB.ArrayUtils.getAllIndexes(foundThemes, url).length < 2) foundThemes.push(url);
					}
					else if (body && body.indexOf("404: Not Found") != 0 && response.statusCode == 200) {
						let theme = {}, text = body;
						if ((text.split("*//").length > 1 || text.indexOf("/**") == 0) && text.split("\n").length > 1) {
							let hasMETAline = text.replace(/\s/g, "").indexOf("//META{");
							if (hasMETAline < 20 && hasMETAline > -1) {
								let searchtext = text.replace(/\s*:\s*/g, ":").replace(/\s*}\s*/g, "}");
								for (let tag of tags) {
									let result = searchtext.split('"' + tag + '":"');
									result = result.length > 1 ? result[1].split('",')[0].split('"}')[0] : null;
									result = result && tag != "version" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
									theme[tag] = result ? result.trim() : result;
								}
							}
							else {
								let searchtext = text.replace(/[\r\t| ]*\*\s*/g, "*");
								for (let tag of tags) {
									let result = searchtext.split('@' + tag + ' ');
									result = result.length > 1 ? result[1].split('\n')[0] : null;
									result = result && tag != "version" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
									theme[tag] = result ? result.trim() : result;
								}
							}
							
							let valid = true;
							for (let tag of tags) if (theme[tag] === null) valid = false;
							if (valid) {
								theme.fullcss = text;
								theme.css = hasMETAline < 20 && hasMETAline > -1 ? text.split("\n").slice(1).join("\n").replace(/[\r|\n|\t]/g, "") : text.replace(/[\r|\n|\t]/g, "");
								theme.url = url;
								theme.requesturl = requesturl;
								loadedThemes[url] = theme;
								let instTheme = BDFDB.BDUtils.getTheme(theme.name);
								if (instTheme && instTheme.author.toUpperCase() == theme.author.toUpperCase() && instTheme.version != theme.version) outdated++;
								if (!cachedThemes.includes(url)) newentries++;
							}
						}
					}
					i++;
					
					let loadingTooltip = document.querySelector(".themerepo-loading-tooltip");
					if (loadingTooltip) loadingTooltip.update(this.getLoadingTooltipText());
					
					getThemeInfo(callback);
				});
			}
		}

		getLoadingTooltipText () {
			return `Loading ThemeRepo - [${Object.keys(loadedThemes).length}/${Object.keys(grabbedThemes).length}]`;
		}

		checkForNewThemes () {
			BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeList.txt", (error, response, result) => {
				if (response && !BDFDB.equals(result.replace(/\t|\r/g, "").split("\n").filter(n => n), grabbedThemes)) {
					loading = {is:false, timeout:null, amount:0};
					this.loadThemes();
				}
			});
		}

		downloadTheme (data) {
			BDFDB.LibraryRequires.request(data.requesturl, (error, response, body) => {
				if (error) BDFDB.NotificationUtils.toast(`Unable to download Theme "${data.name}".`, {type:"danger"});
				else this.createThemeFile(data.requesturl.split("/").pop(), body);
			});
		}

		createThemeFile (filename, content) {
			BDFDB.LibraryRequires.fs.writeFile(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getThemesFolder(), filename), content, (error) => {
				if (error) BDFDB.NotificationUtils.toast(`Unable to save Theme "${filename}".`, {type:"danger"});
				else BDFDB.NotificationUtils.toast(`Successfully saved Theme "${filename}".`, {type:"success"});
			});
		}

		applyTheme (data) {
			if (data.name && BDFDB.BDUtils.isThemeEnabled(data.name) == false) {
				let id = data.name.replace(/^[^a-z]+|[^\w-]+/gi, "-");
				BDFDB.DOMUtils.remove(`style#${id}`);
				BDFDB.BDUtils.enableTheme(data.name, false);
				BDFDB.LogUtils.log(`Applied Theme ${data.name}.`, this.name);
			}
		}

		deleteThemeFile (data) {
			let filename = data.requesturl.split("/").pop();
			BDFDB.LibraryRequires.fs.unlink(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getThemesFolder(), filename), (error) => {
				if (error) BDFDB.NotificationUtils.toast(`Unable to delete Theme "${filename}".`, {type:"danger"});
				else BDFDB.NotificationUtils.toast(`Successfully deleted Theme "${filename}".`);
			});
		}

		removeTheme (data) {
			if (data.name && BDFDB.BDUtils.isThemeEnabled(data.name) == true) {
				let id = data.name.replace(/^[^a-z]+|[^\w-]+/gi, "-");
				BDFDB.DOMUtils.remove(`style#${id}`);
				BDFDB.BDUtils.disableTheme(data.name, false);
				BDFDB.LogUtils.log(`Removed Theme ${data.name}.`, this.name);
			}
		}
	}
})();

module.exports = ThemeRepo;
