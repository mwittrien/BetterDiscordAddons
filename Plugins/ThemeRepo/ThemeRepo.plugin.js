/**
 * @name ThemeRepo
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 2.1.7
 * @description Allows you to preview all Themes from the Theme Repo and download them on the fly
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ThemeRepo/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/ThemeRepo.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ThemeRepo",
			"author": "DevilBro",
			"version": "2.1.7",
			"description": "Allows you to preview all Themes from the Theme Repo and download them on the fly"
		},
		"changeLog": {
			"fixed": {
				"Old META": "Downloading a Theme that still uses the old META Format will now automatically transform it into the new META Format"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
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
		const isBeta = !(window.BdApi && !Array.isArray(BdApi.settings));
		var _this;
		var loading, cachedThemes, grabbedThemes, foundThemes, loadedThemes, generatorThemes, updateInterval;
		var list, header, preview, searchTimeout, updateGeneratorTimeout, forceRerenderGenerator, nativeCSS, nativeCSSvars, forcedSort, forcedOrder, showOnlyOutdated;
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
				icon: "CHECKMARK",
				text: "updated"
			},
			OUTDATED: {
				colorClass: "RED",
				backgroundColor: "STATUS_RED",
				icon: "CLOSE",
				text: "outdated"
			},
			DOWNLOADABLE: {
				colorClass: "BRAND",
				backgroundColor: "var(--bdfdb-blurple)",
				icon: "DOWNLOAD",
				text: "download"
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
		
		const themeRepoIcon = `<svg width="42" height="32" viewBox="0 0 42 32"><path fill="COLOR_1" d="M 0,0 V 7.671875 H 8.6211458 V 32 H 16.922769 V 7.672 l 8.621146,-1.25e-4 V 0 Z"/><path fill="COLOR_2" d="M 29.542969 0 L 29.542969 7.5488281 L 30.056641 7.5488281 C 35.246318 7.5488281 35.246318 14.869141 30.056641 14.869141 L 25.234375 14.869141 L 25.234375 11.671875 L 20.921875 11.671875 L 20.921875 32 L 25.234375 32 L 25.234375 21.830078 L 26.705078 21.830078 L 34.236328 32 L 42 32 L 42 28.931641 L 35.613281 21.017578 C 39.562947 19.797239 41.998047 16.452154 41.998047 10.53125 C 41.814341 3.0284252 36.625168 0 29.919922 0 L 29.542969 0 z"/></svg>`;
		
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
				list = null;
				this.closePreview();
			}
			filterThemes() {
				let themes = Object.keys(loadedThemes).map(url => {
					let theme = loadedThemes[url];
					let instTheme = BDFDB.BDUtils.getTheme(theme.name);
					if (instTheme && instTheme.author && instTheme.author.toUpperCase() == theme.author.toUpperCase()) theme.state = instTheme.version != theme.version ? themeStates.OUTDATED : themeStates.UPDATED;
					else theme.state = themeStates.DOWNLOADABLE;
					return {
						url: theme.url,
						search: (theme.name + " " + theme.version + " " + theme.author + " " + theme.description).toUpperCase(),
						name: theme.name,
						version: theme.version,
						author: theme.author,
						description: theme.description || "No Description found",
						fav: favorites.includes(url) ? favStates.FAVORIZED : favStates.NOT_FAVORIZED,
						new: theme.state == themeStates.DOWNLOADABLE && !cachedThemes.includes(url) ? newStates.NEW : newStates.NOT_NEW,
						state: theme.state,
						css: theme.css,
						fullCSS: theme.fullCSS
					};
				});
				if (!this.props.updated) themes = themes.filter(theme => theme.state != themeStates.UPDATED);
				if (!this.props.outdated) themes = themes.filter(theme => theme.state != themeStates.OUTDATED);
				if (!this.props.downloadable) themes = themes.filter(theme => theme.state != themeStates.DOWNLOADABLE);
				if (this.props.searchString) {
					let searchString = this.props.searchString.toUpperCase();
					themes = themes.filter(theme => theme.search.indexOf(searchString) > -1);
				}

				BDFDB.ArrayUtils.keySort(themes, (!this.props.sortKey || this.props.sortKey == "NEW" && !themes.some(theme => theme.new == newStates.NEW) ? Object.keys(sortKeys)[0] : this.props.sortKey).toLowerCase());
				if (this.props.orderKey == "DESC") themes.reverse();
				return themes;
			}
			openPreview() {
				preview = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN._themerepopreview}">
					<div class="${BDFDB.disCN._themerepomovebar}"></div>
					<div class="${BDFDB.disCN._themerepodraginterface}">
						<div class="${BDFDB.disCN._themerepodragbar}" id="top" vertical="top"></div>
						<div class="${BDFDB.disCN._themerepodragbar}" id="right" horizontal="right"></div>
						<div class="${BDFDB.disCN._themerepodragbar}" id="bottom" vertical="bottom"></div>
						<div class="${BDFDB.disCN._themerepodragbar}" id="left" horizontal="left"></div>
						<div class="${BDFDB.disCN._themerepodragcorner}" id="top-left" vertical="top" horizontal="left"></div>
						<div class="${BDFDB.disCN._themerepodragcorner}" id="top-right" vertical="top" horizontal="right"></div>
						<div class="${BDFDB.disCN._themerepodragcorner}" id="bottom-right" vertical="bottom" horizontal="right"></div>
						<div class="${BDFDB.disCN._themerepodragcorner}" id="bottom-left" vertical="bottom" horizontal="left"></div>
					</div>
				</div>`);
				preview.frame = document.createElement("iframe");
				preview.frame.src = "https://mwittrien.github.io/BetterDiscordAddons/Plugins/_res/DiscordPreview.html";
				preview.querySelector(BDFDB.dotCN._themerepomovebar).addEventListener("mousedown", e => {
					let moving = false;
					let rects = BDFDB.DOMUtils.getRects(preview).toJSON();
					let oldX = e.pageX, oldY = e.pageY;
					let mouseUp = _ => {
						BDFDB.DOMUtils.removeClass(preview, BDFDB.disCN._themerepopreviewmoving);
						document.removeEventListener("mouseup", mouseUp);
						document.removeEventListener("mousemove", mouseMove);
					};
					let mouseMove = e2 => {
						if (moving || Math.sqrt((e.pageX - e2.pageX)**2) > 20 || Math.sqrt((e.pageY - e2.pageY)**2) > 20) {
							if (!moving) BDFDB.DOMUtils.addClass(preview, BDFDB.disCN._themerepopreviewmoving);
							moving = true;
							BDFDB.ListenerUtils.stopEvent(e);
							rects.top = rects.top - (oldY - e2.pageY);
							rects.left = rects.left - (oldX - e2.pageX);
							oldX = e2.pageX, oldY = e2.pageY;
							preview.style.setProperty("top", `${rects.top}px`);
							preview.style.setProperty("left", `${rects.left}px`);
						}
					};
					document.addEventListener("mouseup", mouseUp);
					document.addEventListener("mousemove", mouseMove);
				});
				for (let ele of preview.querySelectorAll(BDFDB.dotCNC._themerepodragbar + BDFDB.dotCN._themerepodragcorner)) ele.addEventListener("mousedown", e => {
					let moving = false;
					let rects = BDFDB.DOMUtils.getRects(preview).toJSON();
					let oldX = e.pageX, oldY = e.pageY;
					let mouseUp = _ => {
						BDFDB.DOMUtils.removeClass(preview, BDFDB.disCN._themerepopreviewmoving);
						document.removeEventListener("mouseup", mouseUp);
						document.removeEventListener("mousemove", mouseMove);
					};
					let vertical = ele.getAttribute("vertical");
					let horizontal = ele.getAttribute("horizontal");
					let mouseMove = e2 => {
						if (moving || Math.sqrt((e.pageX - e2.pageX)**2) > 20 || Math.sqrt((e.pageY - e2.pageY)**2) > 20) {
							if (!moving) BDFDB.DOMUtils.addClass(preview, BDFDB.disCN._themerepopreviewmoving);
							moving = true;
							BDFDB.ListenerUtils.stopEvent(e);
							if (vertical) switch (vertical) {
								case "top":
									rects.top = rects.top - (oldY - e2.pageY);
									if (rects.bottom - rects.top > 25) {
										preview.style.setProperty("top", `${rects.top}px`);
										preview.style.setProperty("height", `${rects.bottom - rects.top}px`);
									}
									break;
								case "bottom":
									rects.bottom = rects.bottom - (oldY - e2.pageY);
									if (rects.bottom - rects.top > 25) preview.style.setProperty("height", `${rects.bottom - rects.top}px`);
									break;
							}
							if (horizontal) switch (horizontal) {
								case "right":
									rects.right = rects.right - (oldX - e2.pageX);
									if (rects.right - rects.left > 200) preview.style.setProperty("width", `${rects.right - rects.left}px`);
									break;
								case "left":
									rects.left = rects.left - (oldX - e2.pageX);
									if (rects.right - rects.left > 200) {
										preview.style.setProperty("left", `${rects.left}px`);
										preview.style.setProperty("width", `${rects.right - rects.left}px`);
									}
									break;
							}
							oldX = e2.pageX, oldY = e2.pageY;
						}
					};
					document.addEventListener("mouseup", mouseUp);
					document.addEventListener("mousemove", mouseMove);
				});
				preview.frame.addEventListener("load", _ => {
					let titleBar = document.querySelector(BDFDB.dotCN.titlebar);
					this.runInPreview({
						reason: "OnLoad",
						username: BDFDB.UserUtils.me.username,
						id: BDFDB.UserUtils.me.id,
						discriminator: BDFDB.UserUtils.me.discriminator,
						avatar: BDFDB.UserUtils.getAvatar(),
						classes: JSON.stringify(BDFDB.DiscordClasses),
						classModules: JSON.stringify(BDFDB.DiscordClassModules),
						nativeCSS: (nativeCSS || "").replace(/\/assets\//g, document.location.origin + "/assets/").replace(/[\t\r\n]/g, ""),
						htmlClassName: document.documentElement.className,
						titleBar: titleBar && titleBar.outerHTML || ""
					});
					if (this.props.currentTheme) this.runInPreview({
						reason: "NewTheme",
						checked: true,
						css: this.props.currentTheme.css
					});
					if (this.props.currentGenerator) this.runInPreview({
						reason: "NewTheme",
						checked: true,
						css: (loadedThemes[this.props.currentGenerator] || {}).fullCSS
					});
					if (this.props.useLightMode) this.runInPreview({
						reason: "DarkLight",
						checked: true
					});
					if (this.props.useNormalizer) this.runInPreview({
						reason: "Normalize",
						checked: true
					});
					if (this.props.useCustomCSS) this.runInPreview({
						reason: "CustomCSS",
						checked: true
					});
					if (this.props.useThemeFixer) this.runInPreview({
						reason: "ThemeFixer",
						checked: true
					});
				});
				preview.appendChild(preview.frame);
				document.body.appendChild(preview);
				let outerRects = BDFDB.DOMUtils.getRects(document.body);
				preview.style.setProperty("top", `${outerRects.width/4}px`);
				preview.style.setProperty("left", `${outerRects.height/4}px`);
				preview.style.setProperty("width", `${outerRects.width/2}px`);
				preview.style.setProperty("height", `${outerRects.height/2}px`);
				window.removeEventListener("message", list.onPreviewMessage);
				window.addEventListener("message", list.onPreviewMessage);
			}
			closePreview() {
				if (list) window.removeEventListener("message", list.onPreviewMessage);
				if (preview) preview.remove();
				preview = null;
			}
			runInPreview(data) {
				if (preview && preview.frame) preview.frame.contentWindow.postMessage(Object.assign({origin: "ThemeRepo"}, data), "*");
			}
			onPreviewMessage(e) {
				let rects, outerRects;
				if (preview && e.data && e.data.origin == "DiscordPreview") switch (e.data.reason) {
					case "close":
						list.closePreview();
						break;
					case "minimize":
						outerRects = BDFDB.DOMUtils.getRects(document.body);
						preview.style.setProperty("top", `${outerRects.height - 25}px`);
						preview.style.setProperty("left", "0px");
						preview.style.setProperty("width", "520px");
						preview.style.setProperty("height", "25px");
						break;
					case "maximize":
						rects = BDFDB.DOMUtils.getRects(preview), outerRects = BDFDB.DOMUtils.getRects(document.body);
						if (!(rects.x == 0 && rects.y == 0 && outerRects.width - rects.width == 0 && outerRects.height - rects.height == 0)) {
							preview.rects = rects;
							BDFDB.DOMUtils.addClass(preview, BDFDB.disCN._themerepopreviewfullscreen);
							preview.style.setProperty("top", "0px");
							preview.style.setProperty("left", "0px");
							preview.style.setProperty("width", `${outerRects.width}px`);
							preview.style.setProperty("height", `${outerRects.height}px`);
						}
						else {
							BDFDB.DOMUtils.removeClass(preview, BDFDB.disCN._themerepopreviewfullscreen);
							if (!preview.rects || (outerRects.width - preview.rects.width == 0 && outerRects.height - preview.rects.height == 0)) {
								preview.style.setProperty("top", `${outerRects.width/4}px`);
								preview.style.setProperty("left", `${outerRects.height/4}px`);
								preview.style.setProperty("width", `${outerRects.width/2}px`);
								preview.style.setProperty("height", `${outerRects.height/2}px`);
							}
							else {
								preview.style.setProperty("top", `${preview.rects.x}px`);
								preview.style.setProperty("left", `${preview.rects.y}px`);
								preview.style.setProperty("width", `${preview.rects.width}px`);
								preview.style.setProperty("height", `${preview.rects.height}px`);
							}
						}
						break;
				}
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
									children: `${BDFDB.LanguageUtils.LibraryStringsFormat("loading", "Theme Repo")} - ${BDFDB.LanguageUtils.LibraryStrings.please_wait}`
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
								type: "Select",
								margin: 20,
								label: "Choose a Generator Theme",
								basis: "60%",
								value: this.props.currentGenerator || "-----",
								options: [{value: "-----", label: "-----"}, nativeCSSvars && {value: "nativediscord", label: "Discord"}].concat((generatorThemes).map(url => ({value: url, label: (loadedThemes[url] || {}).name || "-----"})).sort((x, y) => (x.label < y.label ? -1 : x.label > y.label ? 1 : 0))).filter(n => n),
								onChange: value => {
									if (loadedThemes[value] || value == "nativediscord") {
										if (this.props.currentGenerator) forceRerenderGenerator = true;
										this.props.currentGenerator = value;
										this.props.currentGeneratorIsNative = value == "nativediscord";
										this.props.generatorValues = {};
									}
									else {
										delete this.props.currentGenerator;
										delete this.props.currentGeneratorIsNative;
										delete this.props.generatorValues;
									}
									delete this.props.currentTheme;
									if (preview) this.runInPreview({
										reason: "NewTheme",
										checked: true,
										css: (loadedThemes[value.value] || {}).fullCSS
									});
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
										if (this.props.currentGeneratorIsNative) {
											_this.createThemeFile("Discord.theme.css", `/**\n * @name Discord\n * @description Allow you to easily customize Discord's native Look  \n * @author DevilBro\n * @version 1.0.0\n * @authorId 278543574059057154\n * @invite Jx3TjNS\n * @donate https://www.paypal.me/MircoWittrien\n * @patreon https://www.patreon.com/MircoWittrien\n */\n\n` + _this.generateTheme(nativeCSSvars, this.props.generatorValues));
										}
										else if (loadedThemes[this.props.currentGenerator]) {
											_this.createThemeFile(loadedThemes[this.props.currentGenerator].name + ".theme.css", _this.generateTheme(loadedThemes[this.props.currentGenerator].fullCSS, this.props.generatorValues));
										}
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
									className: BDFDB.disCN.marginbottom20
								}),
								(_ => {
									let vars = this.props.currentGeneratorIsNative ? nativeCSSvars.split(".theme-dark, .theme-light") : loadedThemes[this.props.currentGenerator].fullCSS.split(":root");
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
											let isComp = !isColor && /^[0-9 ]+,[0-9 ]+,[0-9 ]+$/g.test(oldValue);
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
											this.props.generatorValues[varName] = {value: oldValue, oldValue};
											inputRefs.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
												dividerBottom: vars[vars.length-1] != varStr,
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
														if (preview) this.runInPreview({
															reason: "NewTheme",
															checked: true,
															css: _this.generateTheme(this.props.currentGeneratorIsNative ? nativeCSSvars : loadedThemes[this.props.currentGenerator].fullCSS, this.props.generatorValues)
														});
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
									className: BDFDB.disCNS.settingsrowtitle + BDFDB.disCNS.settingsrowtitledefault + BDFDB.disCN.cursordefault,
									children: "To experience ThemeRepo in the best way. I would recommend you to enable BD intern reload function, that way all downloaded files are loaded into Discord without the need to reload."
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Switch",
								margin: 20,
								label: "Preview in light mode",
								value: this.props.useLightMode,
								onChange: value => {
									this.props.useLightMode = value;
									if (preview) this.runInPreview({
										reason: "DarkLight",
										checked: this.props.useLightMode
									});
								}
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Switch",
								margin: 20,
								label: "Preview with useNormalizer classes",
								value: this.props.useNormalizer,
								onChange: value => {
									this.props.useNormalizer = value;
									if (preview) this.runInPreview({
										reason: "Normalize",
										checked: this.props.useNormalizer
									});
								}
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Switch",
								margin: 20,
								label: "Include Custom CSS in Preview",
								value: this.props.useCustomCSS,
								onChange: value => {
									this.props.useCustomCSS = value;
									let customCSS = document.querySelector("style#customcss");
									if (preview && customCSS && customCSS.innerText.length > 0) this.runInPreview({
										reason: "CustomCSS",
										checked: this.props.useCustomCSS,
										css: customCSS.innerText
									});
								}
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Switch",
								margin: 20,
								label: "Include ThemeFixer CSS in Preview",
								value: this.props.useThemeFixer,
								onChange: value => {
									this.props.useThemeFixer  = value;
									BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/_res/ThemeFixer.css", (error, response, body) => {
										if (preview) this.runInPreview({
											reason: "ThemeFixer",
											checked: this.props.useThemeFixer,
											css: _this.createFixerCSS(body)
										});
									});
								}
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Button",
								margin: 20,
								label: "Download ThemeFixer",
								children: "Download",
								onClick: _ => {
									BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/_res/ThemeFixer.css", (error, response, body) => {
										_this.createThemeFile("ThemeFixer.theme.css", `/**\n * @name ThemeFixer\n * @description ThemeFixerCSS for transparent themes\n * @author DevilBro\n * @version 1.0.3\n * @authorId 278543574059057154\n * @invite Jx3TjNS\n * @donate https://www.paypal.me/MircoWittrien\n * @patreon https://www.patreon.com/MircoWittrien\n */\n\n` + _this.createFixerCSS(body));
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
								onChange: value => {
									this.props[key] = modalSettings[key] = value;
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
					icon: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCN._repoicon,
						nativeClass: true,
						iconSVG: `<svg viewBox="0 0 24 24" fill="#FFFFFF" style="width: 18px; height: 18px;"><path d="M0 0h24v24H0z" fill="none"></path><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path></svg>`
					}),
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
						!isBeta && BDFDB.ReactUtils.createElement("div", {
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
										if (gitUrl) BDFDB.DiscordUtils.openLink(gitUrl);
									}
								})
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Switch, {
							value: list && list.props.currentTheme && list.props.currentTheme.url == this.props.theme.url,
							onChange: value => {
								if (!list) return;
								
								if (list.props.currentTheme) for (let ins of BDFDB.ReactUtils.findOwner(BDFDB.ObjectUtils.get(this, `${BDFDB.ReactUtils.instanceKey}.return`), {name: "ThemeCard", all: true}).filter(ins => ins && ins.props && ins.props.theme && ins.props.theme.url == list.props.currentTheme.url)) BDFDB.ReactUtils.forceUpdate(ins);
								
								if (value) list.props.currentTheme = this.props.theme;
								else delete list.props.currentTheme;
								delete list.props.currentGenerator;
								delete list.props.generatorValues;
								
								if (preview) list.runInPreview({
									reason: "NewTheme",
									checked: value,
									css: this.props.theme.css
								});
								else list.openPreview();
								
								BDFDB.ReactUtils.forceUpdate(this);
							}
						})
					],
					links: isBeta && [{
						label: "Source",
						icon: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							name: BDFDB.LibraryComponents.SvgIcon.Names.GITHUB,
							nativeClass: true,
							width: 18,
							height: 18
						}),
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
							if (gitUrl) BDFDB.DiscordUtils.openLink(gitUrl);
						}
					}],
					buttons: isBeta ? [
						this.props.theme.state != themeStates.DOWNLOADABLE && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: BDFDB.LanguageUtils.LanguageStrings.DELETE,
							children: BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCNS._repobutton + BDFDB.disCNS._repocontrolsbutton + BDFDB.disCN._repobuttondanger,
								onClick: _ => {
									_this.removeTheme(this.props.theme);
									_this.deleteThemeFile(this.props.theme);
									this.props.theme.state = themeStates.DOWNLOADABLE;
									BDFDB.ReactUtils.forceUpdate(this);
								},
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									name: BDFDB.LibraryComponents.SvgIcon.Names.TRASH,
									nativeClass: true,
									color: "#FFFFFF",
									width: 20,
									height: 20
								})
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: BDFDB.LanguageUtils.LibraryStrings[buttonConfig.text],
							children: BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCNS._repobutton + BDFDB.disCN._repocontrolsbutton,
								style: {backgroundColor: BDFDB.DiscordConstants.Colors[buttonConfig.backgroundColor] || buttonConfig.backgroundColor},
								onClick: _ => {
									_this.downloadTheme(this.props.theme);
									if (list && list.props.rnmStart) BDFDB.TimeUtils.timeout(_ => {
										if (this.props.theme.state == themeStates.UPDATED) _this.applyTheme(this.props.theme);
									}, 3000);
									this.props.theme.state = themeStates.UPDATED;
									BDFDB.ReactUtils.forceUpdate(this);
								},
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									name: BDFDB.LibraryComponents.SvgIcon.Names[buttonConfig.icon],
									nativeClass: true,
									color: "#FFFFFF",
									width: 20,
									height: 20
								})
							})
						})
					] : [
						this.props.theme.state != themeStates.DOWNLOADABLE && BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._repocontrolsbutton,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
								text: BDFDB.LanguageUtils.LanguageStrings.DELETE,
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
							style: {backgroundColor: BDFDB.DiscordConstants.Colors[buttonConfig.backgroundColor] || buttonConfig.backgroundColor},
							children: BDFDB.LanguageUtils.LibraryStrings[buttonConfig.text],
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
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									grow: 1,
									shrink: 0,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
										tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H2,
										className: BDFDB.disCN.marginreset,
										children: `Theme Repo — ${loading.is ? 0 : this.props.amount || 0}/${loading.is ? 0 : Object.keys(loadedThemes).length}`
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SearchBar, {
										autoFocus: true,
										query: this.props.searchString,
										onChange: value => {
											if (loading.is) return;
											BDFDB.TimeUtils.clear(searchTimeout);
											searchTimeout = BDFDB.TimeUtils.timeout(_ => {
												this.props.searchString = list.props.searchString = value.replace(/[<|>]/g, "");
												BDFDB.ReactUtils.forceUpdate(this, list);
											}, 1000);
										},
										onClear: instance => {
											if (loading.is) return;
											this.props.searchString = list.props.searchString = "";
											BDFDB.ReactUtils.forceUpdate(this, list);
										}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
									size: BDFDB.LibraryComponents.Button.Sizes.TINY,
									children: BDFDB.LanguageUtils.LibraryStrings.check_for_updates,
									onClick: _ => {
										if (loading.is) return;
										loading = {is: false, timeout: null, amount: 0};
										_this.loadThemes();
									}
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
										items: [{value: "Themes"}, {value: "Generator"}, {value: BDFDB.LanguageUtils.LanguageStrings.SETTINGS}],
										onItemSelect: value => {
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
		return class ThemeRepo extends Plugin {
			onLoad () {
				_this = this;
				
				loading = {is: false, timeout: null, amount: 0};
				
				cachedThemes = [];
				grabbedThemes = [];
				foundThemes = [];
				loadedThemes = {};
				generatorThemes = [];

				this.defaults = {
					settings: {
						keepOnTop: 			{value: false,		description: "Keep the Preview Window always on top"},
						notifyOutdated:		{value: true, 		description: "Get a Notification when one of your Themes is outdated"},
						notifyNewentries:	{value: true, 		description: "Get a Notification when there are new Entries in the Repo"}
					},
					modalSettings: {
						updated: 			{value: true,	modify: true,	description: "Show updated Themes",},
						outdated:			{value: true, 	modify: true,	description: "Show outdated Themes"},
						downloadable:		{value: true, 	modify: true,	description: "Show downloadable Themes"},
						rnmStart:			{value: true, 	modify: false,	description: "Apply Theme after Download"}
					}
				};
				
				this.patchedModules = {
					before: {
						SettingsView: "render"
					},
					after: {
						StandardSidebarView: "render"
					}
				};
				
				this.css = `
					${BDFDB.dotCN._themerepopreview} {
						border: 2px solid transparent;
						box-shadow: var(--elevation-medium);
						box-sizing: border-box;
						position: absolute;
						z-index: 10000000;
					}
					${BDFDB.dotCN._themerepopreviewfullscreen} {
						border: none;
					}
					${BDFDB.dotCN._themerepomovebar} {
						position: absolute;
						height: 21px;
						right: 100px;
						left: 100px;
						cursor: move;
						z-index: 10000002;
					}
					${BDFDB.dotCN._themerepodragbar} {
						position: absolute;
						z-index: 10000002;
					}
					${BDFDB.dotCN._themerepodragcorner} {
						position: absolute;
						z-index: 10000003;
					}
					${BDFDB.dotCN._themerepodragbar}#top {
						top: -2px;
						width: 100%;
						height: 2px;
						cursor: n-resize;
					}
					${BDFDB.dotCN._themerepodragbar}#right {
						right: -2px;
						width: 2px;
						height: 100%;
						cursor: e-resize;
					}
					${BDFDB.dotCN._themerepodragbar}#bottom {
						bottom: -2px;
						width: 100%;
						height: 2px;
						cursor: s-resize;
					}
					${BDFDB.dotCN._themerepodragbar}#left {
						left: -2px;
						width: 2px;
						height: 100%;
						cursor: w-resize;
					}
					${BDFDB.dotCN._themerepodragcorner} {
						width: 4px;
						height: 4px;
					}
					${BDFDB.dotCN._themerepodragcorner}#top-left {
						top: -2px;
						left: -2px;
						cursor: nw-resize;
					}
					${BDFDB.dotCN._themerepodragcorner}#top-right {
						top: -2px;
						right: -2px;
						cursor: ne-resize;
					}
					${BDFDB.dotCN._themerepodragcorner}#bottom-right {
						right: -2px;
						bottom: -2px;
						cursor: se-resize;
					}
					${BDFDB.dotCN._themerepodragcorner}#bottom-left {
						bottom: -2px;
						left: -2px;
						cursor: sw-resize;
					}
					${BDFDB.dotCNS._themerepopreviewfullscreen + BDFDB.dotCN._themerepomovebar},
					${BDFDB.dotCNS._themerepopreviewfullscreen + BDFDB.dotCN._themerepodraginterface} {
						display: none;
					}
					${BDFDB.dotCN._themerepopreview} iframe {
						width: 100%;
						height: 100%;
						z-index: 10000001;
					}
					${BDFDB.dotCN._themerepopreviewmoving} iframe {
						pointer-events: none;
					}
				`;
			}
			
			onStart () {
				this.forceUpdateAll();

				this.loadThemes();

				updateInterval = BDFDB.TimeUtils.interval(_ => {this.checkForNewThemes();}, 1000*60*30);
			}
			
			onStop () {
				BDFDB.TimeUtils.clear(updateInterval);
				BDFDB.TimeUtils.clear(loading.timeout);

				this.forceUpdateAll();

				BDFDB.DOMUtils.remove(BDFDB.dotCN._themereponotice, BDFDB.dotCN._themerepoloadingicon);
			}

			getSettingsPanel (collapseStates = {}) {
				let customUrl = "";
				let settingsPanel, settingsItems = [];
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: "Settings",
					collapseStates: collapseStates,
					children: Object.keys(settings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
						customList.length ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Custom Theme List:",
							className: BDFDB.disCNS.margintop8 + BDFDB.disCN.marginbottom20,
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
							margin: 0,
							color: BDFDB.LibraryComponents.Button.Colors.RED,
							label: "Remove all custom added Themes",
							onClick: _ => {
								BDFDB.ModalUtils.confirm(this, "Are you sure you want to remove all added Themes from your own List", _ => {
									BDFDB.DataUtils.save([], this, "custom");
									BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
								});
							},
							children: BDFDB.LanguageUtils.LanguageStrings.REMOVE
						})
					].flat(10).filter(n => n)
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
			
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
				modalSettings = BDFDB.DataUtils.get(this, "modalSettings");
				favorites = BDFDB.DataUtils.load(this, "favorites");
				favorites = BDFDB.ArrayUtils.is(favorites) ? favorites : [];
				customList = BDFDB.DataUtils.load(this, "custom");
				customList = BDFDB.ArrayUtils.is(customList) ? customList : [];
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			onUserSettingsCogContextMenu (e) {
				BDFDB.TimeUtils.timeout(_ => {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["label", ["BandagedBD", "BetterDiscord"]]]});
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
				if (BDFDB.ArrayUtils.is(e.instance.props.sections) && e.instance.props.sections[0] && e.instance.props.sections[0].label == BDFDB.LanguageUtils.LanguageStrings.USER_SETTINGS) {
					e.instance.props.sections = e.instance.props.sections.filter(n => n.section != "themerepo");
					let index = e.instance.props.sections.indexOf(e.instance.props.sections.find(n => n.section == "pluginrepo") || e.instance.props.sections.find(n => n.section == "themes") || e.instance.props.sections.find(n => n.section == BDFDB.DiscordConstants.UserSettingsSections.DEVELOPER_OPTIONS) || e.instance.props.sections.find(n => n.section == BDFDB.DiscordConstants.UserSettingsSections.HYPESQUAD_ONLINE));
					if (index > -1) {
						e.instance.props.sections.splice(index + 1, 0, {
							section: "themerepo",
							label: "Theme Repo",
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
						if (!e.instance.props.sections.find(n => n.section == "plugins" || n.section == "pluginrepo")) e.instance.props.sections.splice(index + 1, 0, {section: "DIVIDER"});
					}
				}
			}
			
			processStandardSidebarView (e) {
				if (e.instance.props.section == "themerepo") {
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
				if (!BDFDB.ObjectUtils.is(theme) || !BDFDB.ObjectUtils.is(generatorValues) || !theme.fullCSS) return null;
				return inputRefs;
			}
			
			generateTheme (fullCSS, generatorValues) {
				if (!fullCSS || !BDFDB.ObjectUtils.is(generatorValues)) return "";
				for (let inputId in generatorValues) if (generatorValues[inputId].value && generatorValues[inputId].value.trim() && generatorValues[inputId].value != generatorValues[inputId].oldValue) fullCSS = fullCSS.replace(new RegExp(`--${BDFDB.StringUtils.regEscape(inputId)}(\\s*):(\\s*)${BDFDB.StringUtils.regEscape(generatorValues[inputId].oldValue)}`,"g"),`--${inputId}$1: $2${generatorValues[inputId].value}`);
				return fullCSS;
			}

			loadThemes () {
				BDFDB.DOMUtils.remove(BDFDB.dotCN._themerepoloadingicon);
				let getThemeInfo, outdated = 0, newEntries = 0, i = 0;
				let tags = ["name", "description", "author", "version"];
				let newEntriesData = BDFDB.DataUtils.load(this, "newentriesdata");
				cachedThemes = (newEntriesData.urlbase64 ? atob(newEntriesData.urlbase64).split("\n") : []).concat(customList);
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/_res/ThemeList.txt", (error, response, body) => {
					if (!error && body) {
						body = body.replace(/[\r\t]/g, "");
						BDFDB.DataUtils.save(btoa(body), this, "newentriesdata", "urlbase64");
						
						loadedThemes = {};
						grabbedThemes = body.split("\n").filter(n => n);
						foundThemes = grabbedThemes.concat(customList);

						loading = {is: true, timeout: BDFDB.TimeUtils.timeout(_ => {
							BDFDB.TimeUtils.clear(loading.timeout);
							if (this.started) {
								if (loading.is && loading.amount < 4) BDFDB.TimeUtils.timeout(_ => {this.loadThemes();}, 10000);
								loading = {is: false, timeout: null, amount: loading.amount};
							}
						}, 1200000), amount: loading.amount+1};
					
						let loadingIcon = BDFDB.DOMUtils.create(themeRepoIcon.replace(/COLOR_1/gi, "var(--bdfdb-blurple)").replace(/COLOR_2/gi, "#72767d"));
						BDFDB.DOMUtils.addClass(loadingIcon, BDFDB.disCN._themerepoloadingicon);
						loadingIcon.addEventListener("mouseenter", _ => {
							BDFDB.TooltipUtils.create(loadingIcon, this.getLoadingTooltipText(), {
								type: "left",
								className: BDFDB.disCN._themerepoloadingtooltip,
								delay: 500,
								style: "max-width: unset;"
							});
						});
						BDFDB.PluginUtils.addLoadingIcon(loadingIcon);
						
						BDFDB.ReactUtils.forceUpdate(list, header);

						getThemeInfo(_ => {
							if (!this.started) {
								BDFDB.TimeUtils.clear(loading.timeout);
								return;
							}
							BDFDB.TimeUtils.clear(loading.timeout);
							BDFDB.DOMUtils.remove(loadingIcon, BDFDB.dotCN._themerepoloadingicon);
							loading = {is: false, timeout: null, amount: loading.amount};
							
							BDFDB.LogUtils.log("Finished fetching Themes", this);
							if (list) BDFDB.ReactUtils.forceUpdate(list);
							
							if (settings.notifyOutdated && outdated > 0) {
								let notice = document.querySelector(BDFDB.dotCN._themerepooutdatednotice);
								if (notice) notice.close();
								BDFDB.NotificationUtils.notice(this.labels.notice_outdated_themes.replace("{{var0}}", outdated), {
									type: "danger",
									className: BDFDB.disCNS._themereponotice + BDFDB.disCN._themerepooutdatednotice,
									customIcon: themeRepoIcon.replace(/COLOR_[0-9]+/gi, "currentColor"),
									buttons: [{
										contents: BDFDB.LanguageUtils.LanguageStrings.OPEN,
										close: true,
										onClick: _ => {
											showOnlyOutdated = true;
											BDFDB.LibraryModules.UserSettingsUtils.open("themerepo");
										}
									}]
								});
							}
							
							if (settings.notifyNewEntries && newEntries > 0) {
								let notice = document.querySelector(BDFDB.dotCN._themereponewentriesnotice);
								if (notice) notice.close();
								BDFDB.NotificationUtils.notice(this.labels.notice_new_themes.replace("{{var0}}", newEntries), {
									type: "success",
									className: BDFDB.disCNS._themereponotice + BDFDB.disCN._themereponewentriesnotice,
									customIcon: themeRepoIcon.replace(/COLOR_[0-9]+/gi, "currentColor"),
									buttons: [{
										contents: BDFDB.LanguageUtils.LanguageStrings.OPEN,
										close: true,
										onClick: _ => {
											forcedSort = "NEW";
											forcedOrder = "ASC";
											BDFDB.LibraryModules.UserSettingsUtils.open("themerepo");
										}
									}]
								});
							}
							
							if (BDFDB.UserUtils.me.id == "278543574059057154") {
								let notice = document.querySelector(BDFDB.dotCN._themerepofailnotice);
								if (notice) notice.close();
								let wrongUrls = [];
								for (let url of foundThemes) if (url && !loadedThemes[url] && !wrongUrls.includes(url)) wrongUrls.push(url);
								if (wrongUrls.length) {
									BDFDB.NotificationUtils.notice(this.labels.notice_failed_themes.replace("{{var0}}", wrongUrls.length), {
										type: "danger",
										className: BDFDB.disCNS._themereponotice + BDFDB.disCN._themerepofailnotice,
										customIcon: themeRepoIcon.replace(/COLOR_[0-9]+/gi, "currentColor"),
										buttons: [{
											contents: this.labels.list,
											onClick: _ => {
												let toast = BDFDB.NotificationUtils.toast(wrongUrls.join("\n"), {type: "danger"});
												toast.style.setProperty("overflow", "hidden");
												for (let url of wrongUrls) console.log(url);
											}
										}]
									});
								}
							}
							
							BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/_res/GeneratorList.txt", (error3, response3, body3) => {
								if (!error3 && body3) for (let url of body3.replace(/[\r\t]/g, "").split("\n").filter(n => n)) if (loadedThemes[url]) generatorThemes.push(url);
							});
							
							BDFDB.LibraryRequires.request(document.querySelector("head link[rel='stylesheet'][integrity]").href, (error3, response3, body3) => {
								if (!error3 && body3) {
									nativeCSS = body3;
									let theme = BDFDB.DiscordUtils.getTheme();
									let vars = (nativeCSS.split(`.${theme}{`)[1] || "").split("}")[0];
									nativeCSSvars = vars ? `.theme-dark, .theme-light {${vars}}` : "";
								}
								else nativeCSS = nativeCSSvars = "";
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
					BDFDB.LibraryRequires.request(url, (error, response, body) => {
						if (!response) {
							if (url && BDFDB.ArrayUtils.getAllIndexes(foundThemes, url).length < 2) foundThemes.push(url);
						}
						else if (body && body.indexOf("404: Not Found") != 0 && response.statusCode == 200) {
							let theme = {}, text = body.trim();
							if ((text.split("*//").length > 1 || text.indexOf("/**") == 0) && text.split("\n").length > 1) {
								let hasMETAline = text.replace(/\s/g, "").indexOf("//META{");
								if (hasMETAline < 20 && hasMETAline > -1) {
									let searchText = text.replace(/\s*:\s*/g, ":").replace(/\s*}\s*/g, "}");
									for (let tag of tags) {
										let result = searchText.split('"' + tag + '":"');
										result = result.length > 1 ? result[1].split('",')[0].split('"}')[0] : null;
										result = result && tag != "version" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
										theme[tag] = result ? result.trim() : result;
									}
								}
								else {
									let searchText = text.replace(/[\r\t| ]*\*\s*/g, "*");
									for (let tag of tags) {
										let result = searchText.split('@' + tag + ' ');
										result = result.length > 1 ? result[1].split('\n')[0] : null;
										result = result && tag != "version" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
										theme[tag] = result ? result.trim() : result;
									}
								}
								
								let valid = true;
								for (let tag of tags) if (theme[tag] === null) {
									if (tag == "author") theme[tag] = "???";
									else valid = false;
								}
								if (valid) {
									let newMeta = "";
									if (hasMETAline < 20 && hasMETAline > -1) {
										let i = 0, j = 0, metaString = "";
										try {
											for (let c of `{${text.split("{").slice(1).join("{")}`) {
												metaString += c;
												if (c == "{") i++;
												else if (c == "}") j++;
												if (i > 0 && i == j) break;
											}
											let metaObj = JSON.parse(metaString);
											newMeta = "/**\n";
											for (let key in metaObj) newMeta += ` * @${key} ${metaObj[key]}\n`;
											newMeta += "*/";
										}
										catch (err) {newMeta = "";}
									}
									theme.fullCSS = [newMeta, newMeta ? text.split("\n").slice(1).join("\n") : text].filter(n => n).join("\n");
									theme.css = (hasMETAline < 20 && hasMETAline > -1 ? text.split("\n").slice(1).join("\n") : text).replace(/[\r|\n|\t]/g, "");
									theme.url = url;
									loadedThemes[url] = theme;
									let instTheme = BDFDB.BDUtils.getTheme(theme.name);
									if (instTheme && instTheme.author && instTheme.author.toUpperCase() == theme.author.toUpperCase() && instTheme.version != theme.version) outdated++;
									if (!cachedThemes.includes(url)) newEntries++;
								}
							}
						}
						i++;
						
						let loadingTooltip = document.querySelector(BDFDB.dotCN._themerepoloadingtooltip);
						if (loadingTooltip) loadingTooltip.update(this.getLoadingTooltipText());
						
						getThemeInfo(callback);
					});
				}
			}

			getLoadingTooltipText () {
				return BDFDB.LanguageUtils.LibraryStringsFormat("loading", `Theme Repo - [${Object.keys(loadedThemes).length}/${Object.keys(grabbedThemes).length}]`);
			}

			checkForNewThemes () {
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/_res/ThemeList.txt", (error, response, result) => {
					if (response && !BDFDB.equals(result.replace(/\t|\r/g, "").split("\n").filter(n => n), grabbedThemes)) {
						loading = {is: false, timeout: null, amount: 0};
						this.loadThemes();
					}
				});
			}

			downloadTheme (data) {
				BDFDB.LibraryRequires.request(data.url, (error, response, body) => {
					if (error) BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("download_fail", `Theme "${data.name}"`), {type: "danger"});
					else this.createThemeFile(data.url.split("/").pop(), body);
				});
			}

			createThemeFile (filename, content) {
				BDFDB.LibraryRequires.fs.writeFile(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getThemesFolder(), filename), content, (error) => {
					if (error) BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("save_fail", `Theme "${filename}"`), {type: "danger"});
					else BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("save_success", `Theme "${filename}"`), {type: "success"});
				});
			}

			applyTheme (data) {
				if (data.name && BDFDB.BDUtils.isThemeEnabled(data.name) == false) {
					let id = data.name.replace(/^[^a-z]+|[^\w-]+/gi, "-");
					BDFDB.DOMUtils.remove(`style#${id}`);
					BDFDB.BDUtils.enableTheme(data.name, false);
					BDFDB.LogUtils.log(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_started", data.name), this);
				}
			}

			deleteThemeFile (data) {
				let filename = data.url.split("/").pop();
				BDFDB.LibraryRequires.fs.unlink(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getThemesFolder(), filename), (error) => {
					if (error) BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("delete_fail", `Theme "${filename}"`), {type: "danger"});
					else BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("delete_success", `Theme "${filename}"`));
				});
			}

			removeTheme (data) {
				if (data.name && BDFDB.BDUtils.isThemeEnabled(data.name) == true) {
					let id = data.name.replace(/^[^a-z]+|[^\w-]+/gi, "-");
					BDFDB.DOMUtils.remove(`style#${id}`);
					BDFDB.BDUtils.disableTheme(data.name, false);
					BDFDB.LogUtils.log(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_stopped", data.name), this);
				}
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							list:								"Списък",
							notice_failed_themes:				"Някои Themes [{{var0}}] не можаха да бъдат заредени",
							notice_new_themes:					"Новите Themes [{{var0}}] бяха добавени към Theme Repo",
							notice_outdated_themes:				"Някои Themes [{{var0}}] са остарели"
						};
					case "da":		// Danish
						return {
							list:								"Liste",
							notice_failed_themes:				"Nogle Themes [{{var0}}] kunne ikke indlæses",
							notice_new_themes:					"Nye Themes [{{var0}}] er blevet føjet til Theme Repo",
							notice_outdated_themes:				"Nogle Themes [{{var0}}] er forældede"
						};
					case "de":		// German
						return {
							list:								"Liste",
							notice_failed_themes:				"Einige Themes [{{var0}}] konnten nicht geladen werden",
							notice_new_themes:					"Neue Themes [{{var0}}] wurden zur Theme Repo hinzugefügt",
							notice_outdated_themes:				"Einige Themes [{{var0}}] sind veraltet"
						};
					case "el":		// Greek
						return {
							list:								"Λίστα",
							notice_failed_themes:				"Δεν ήταν δυνατή η φόρτωση ορισμένων Themes [{{var0}}] ",
							notice_new_themes:					"Προστέθηκαν νέα Themes [{{var0}}] στο Theme Repo",
							notice_outdated_themes:				"Ορισμένα Themes [{{var0}}] είναι παλιά"
						};
					case "es":		// Spanish
						return {
							list:								"Lista",
							notice_failed_themes:				"Algunos Themes [{{var0}}] no se pudieron cargar",
							notice_new_themes:					"Se han agregado nuevos Themes [{{var0}}] a Theme Repo",
							notice_outdated_themes:				"Algunas Themes [{{var0}}] están desactualizadas"
						};
					case "fi":		// Finnish
						return {
							list:								"Lista",
							notice_failed_themes:				"Joitain kohdetta Themes [{{var0}}] ei voitu ladata",
							notice_new_themes:					"Uusi Themes [{{var0}}] on lisätty Theme Repo",
							notice_outdated_themes:				"Jotkut Themes [{{var0}}] ovat vanhentuneita"
						};
					case "fr":		// French
						return {
							list:								"Liste",
							notice_failed_themes:				"Certains Themes [{{var0}}] n'ont pas pu être chargés",
							notice_new_themes:					"De nouveaux Themes [{{var0}}] ont été ajoutés à Theme Repo",
							notice_outdated_themes:				"Certains Themes [{{var0}}] sont obsolètes"
						};
					case "hr":		// Croatian
						return {
							list:								"Popis",
							notice_failed_themes:				"Neke datoteke Themes [{{var0}}] nije moguće učitati",
							notice_new_themes:					"Novi Themes [{{var0}}] dodani su u Theme Repo",
							notice_outdated_themes:				"Neki su Themes [{{var0}}] zastarjeli"
						};
					case "hu":		// Hungarian
						return {
							list:								"Lista",
							notice_failed_themes:				"Néhány Themes [{{var0}}] nem sikerült betölteni",
							notice_new_themes:					"Új Themes [{{var0}}] hozzáadva a következőhöz: Theme Repo",
							notice_outdated_themes:				"Néhány Themes [{{var0}}] elavult"
						};
					case "it":		// Italian
						return {
							list:								"Elenco",
							notice_failed_themes:				"Impossibile caricare alcuni Themes [{{var0}}] ",
							notice_new_themes:					"Il nuovo Themes [{{var0}}] è stato aggiunto a Theme Repo",
							notice_outdated_themes:				"Alcuni Themes [{{var0}}] non sono aggiornati"
						};
					case "ja":		// Japanese
						return {
							list:								"リスト",
							notice_failed_themes:				"一部の Themes [{{var0}}] を読み込めませんでした",
							notice_new_themes:					"新しい Themes [{{var0}}] が Theme Repo に追加されました",
							notice_outdated_themes:				"一部の Themes [{{var0}}] は古くなっています"
						};
					case "ko":		// Korean
						return {
							list:								"명부",
							notice_failed_themes:				"일부 Themes [{{var0}}] 을 (를)로드 할 수 없습니다.",
							notice_new_themes:					"새 Themes [{{var0}}] 이 Theme Repo 에 추가되었습니다.",
							notice_outdated_themes:				"일부 Themes [{{var0}}] 이 오래되었습니다."
						};
					case "lt":		// Lithuanian
						return {
							list:								"Sąrašas",
							notice_failed_themes:				"Kai kurių Themes [{{var0}}] nepavyko įkelti",
							notice_new_themes:					"Naujas Themes [{{var0}}] pridėtas prie Theme Repo",
							notice_outdated_themes:				"Kai kurie Themes [{{var0}}] yra pasenę"
						};
					case "nl":		// Dutch
						return {
							list:								"Lijst",
							notice_failed_themes:				"Sommige Themes [{{var0}}] konden niet worden geladen",
							notice_new_themes:					"Nieuwe Themes [{{var0}}] zijn toegevoegd aan de Theme Repo",
							notice_outdated_themes:				"Sommige Themes [{{var0}}] zijn verouderd"
						};
					case "no":		// Norwegian
						return {
							list:								"Liste",
							notice_failed_themes:				"Noen Themes [{{var0}}] kunne ikke lastes inn",
							notice_new_themes:					"Nye Themes [{{var0}}] er lagt til i Theme Repo",
							notice_outdated_themes:				"Noen Themes [{{var0}}] er utdaterte"
						};
					case "pl":		// Polish
						return {
							list:								"Lista",
							notice_failed_themes:				"Nie można załadować niektórych Themes [{{var0}}] ",
							notice_new_themes:					"Nowe Themes [{{var0}}] zostały dodane do Theme Repo",
							notice_outdated_themes:				"Niektóre Themes [{{var0}}] są nieaktualne"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							list:								"Lista",
							notice_failed_themes:				"Algum Themes [{{var0}}] não pôde ser carregado",
							notice_new_themes:					"Novo Themes [{{var0}}] foi adicionado ao Theme Repo",
							notice_outdated_themes:				"Alguns Themes [{{var0}}] estão desatualizados"
						};
					case "ro":		// Romanian
						return {
							list:								"Listă",
							notice_failed_themes:				"Unele Themes [{{var0}}] nu au putut fi încărcate",
							notice_new_themes:					"Themes [{{var0}}] nou au fost adăugate la Theme Repo",
							notice_outdated_themes:				"Unele Themes [{{var0}}] sunt învechite"
						};
					case "ru":		// Russian
						return {
							list:								"Список",
							notice_failed_themes:				"Не удалось загрузить некоторые Themes [{{var0}}] ",
							notice_new_themes:					"Новые Themes [{{var0}}] добавлены в Theme Repo",
							notice_outdated_themes:				"Некоторые Themes [{{var0}}] устарели"
						};
					case "sv":		// Swedish
						return {
							list:								"Lista",
							notice_failed_themes:				"Vissa Themes [{{var0}}] kunde inte laddas",
							notice_new_themes:					"Nya Themes [{{var0}}] har lagts till i Theme Repo",
							notice_outdated_themes:				"Vissa Themes [{{var0}}] är föråldrade"
						};
					case "th":		// Thai
						return {
							list:								"รายการ",
							notice_failed_themes:				"ไม่สามารถโหลด Themes [{{var0}}] บางรายการได้",
							notice_new_themes:					"เพิ่ม Themes [{{var0}}] ใหม่ใน Theme Repo แล้ว",
							notice_outdated_themes:				"Themes [{{var0}}] บางรายการล้าสมัย"
						};
					case "tr":		// Turkish
						return {
							list:								"Liste",
							notice_failed_themes:				"Bazı Themes [{{var0}}] yüklenemedi",
							notice_new_themes:					"Yeni Themes [{{var0}}], Theme Repo 'ye eklendi",
							notice_outdated_themes:				"Bazı Themes [{{var0}}] güncel değil"
						};
					case "uk":		// Ukrainian
						return {
							list:								"Список",
							notice_failed_themes:				"Деякі Themes [{{var0}}] не вдалося завантажити",
							notice_new_themes:					"Нові Themes [{{var0}}] були додані до Theme Repo",
							notice_outdated_themes:				"Деякі Themes [{{var0}}] застарілі"
						};
					case "vi":		// Vietnamese
						return {
							list:								"Danh sách",
							notice_failed_themes:				"Không thể tải một số Themes [{{var0}}] ",
							notice_new_themes:					"Themes [{{var0}}] mới đã được thêm vào Theme Repo",
							notice_outdated_themes:				"Một số Themes [{{var0}}] đã lỗi thời"
						};
					case "zh-CN":	// Chinese (China)
						return {
							list:								"清单",
							notice_failed_themes:				"某些 Themes [{{var0}}] 无法加载",
							notice_new_themes:					"新的 Themes [{{var0}}] 已添加到 Theme Repo",
							notice_outdated_themes:				"一些 Themes [{{var0}}] 已过时"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							list:								"清單",
							notice_failed_themes:				"某些 Themes [{{var0}}] 無法加載",
							notice_new_themes:					"新的 Themes [{{var0}}] 已添加到 Theme Repo",
							notice_outdated_themes:				"一些 Themes [{{var0}}] 已過時"
						};
					default:		// English
						return {
							list:								"List",
							notice_failed_themes:				"Some Themes [{{var0}}] could not be loaded",
							notice_new_themes:					"New Themes [{{var0}}] have been added to the Theme Repo",
							notice_outdated_themes:				"Some Themes [{{var0}}] are outdated"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();