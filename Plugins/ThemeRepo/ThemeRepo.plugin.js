/**
 * @name ThemeRepo
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 2.3.6
 * @description Allows you to download all Themes from BD's Website within Discord
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
			"version": "2.3.6",
			"description": "Allows you to download all Themes from BD's Website within Discord"
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
		var _this;
		
		var list, header, preview;
		
		var loading, cachedThemes, grabbedThemes, generatorThemes, updateInterval;
		var searchString, searchTimeout, forcedSort, forcedOrder, showOnlyOutdated;
		var updateGeneratorTimeout, forceRerenderGenerator, nativeCSS, nativeCSSvars;
		
		var favorites = [];
		
		const themeStates = {
			INSTALLED: 0,
			OUTDATED: 1,
			DOWNLOADABLE: 2
		};
		const buttonData = {
			INSTALLED: {
				backgroundColor: "var(--bdfdb-green)",
				icon: "CHECKMARK",
				text: "installed"
			},
			OUTDATED: {
				backgroundColor: "var(--bdfdb-red)",
				icon: "CLOSE",
				text: "outdated"
			},
			DOWNLOADABLE: {
				backgroundColor: "var(--bdfdb-blurple)",
				icon: "DOWNLOAD",
				text: "download"
			}
		};
		const reverseSorts = [
			"RELEASEDATE", "DOWNLOADS", "LIKES", "FAV"
		];
		const sortKeys = {
			NAME:			"Name",
			AUTHORNAME:		"Author",
			VERSION:		"Version",
			DESCRIPTION:	"Description",
			RELEASEDATE:	"Release Date",
			STATE:			"Update State",
			DOWNLOADS:		"Downloads",
			LIKES:			"Likes",
			FAV:			"Favorites"
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
				let themes = grabbedThemes.map(theme => {
					const installedTheme = _this.getInstalledTheme(theme);
					const state = installedTheme ? (theme.version && _this.compareVersions(theme.version, _this.getString(installedTheme.version)) ? themeStates.OUTDATED : themeStates.INSTALLED) : themeStates.DOWNLOADABLE;
					return Object.assign(theme, {
						search: [theme.name, theme.version, theme.authorname, theme.description, theme.tags].flat(10).filter(n => typeof n == "string").join(" ").toUpperCase(),
						description: theme.description || "No Description found",
						fav: favorites.includes(theme.id) && 1,
						new: state == themeStates.DOWNLOADABLE && !cachedThemes.includes(theme.id) && 1,
						state: state
					});
				});
				if (!this.props.updated)		themes = themes.filter(theme => theme.state != themeStates.INSTALLED);
				if (!this.props.outdated)		themes = themes.filter(theme => theme.state != themeStates.OUTDATED);
				if (!this.props.downloadable)	themes = themes.filter(theme => theme.state != themeStates.DOWNLOADABLE);
				if (searchString) 	{
					let usedSearchString = searchString.toUpperCase();
					let spacelessUsedSearchString = usedSearchString.replace(/\s/g, "");
					themes = themes.filter(theme => theme.search.indexOf(usedSearchString) > -1 || theme.search.indexOf(spacelessUsedSearchString) > -1);
				}
				
				BDFDB.ArrayUtils.keySort(themes, this.props.sortKey.toLowerCase());
				if (this.props.orderKey == "DESC") themes.reverse();
				if (reverseSorts.includes(this.props.sortKey)) themes.reverse();
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
						bdCSS: (document.querySelector("#bd-stylesheet") || {}).innerText || "",
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
						css: (generatorThemes.find(t => t.id == this.props.currentGenerator) || {}).fullCSS
					});
					if (this.props.useLightMode) this.runInPreview({
						reason: "DarkLight",
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
			createThemeFile(name, filename, body, autoloadKey) {
				return new Promise(callback => BDFDB.LibraryRequires.fs.writeFile(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getThemesFolder(), filename), body, error => {
					if (error) {
						callback(true);
						BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("save_fail", `Theme "${name}"`), {type: "danger"});
					}
					else {
						BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("save_success", `Theme "${name}"`), {type: "success"});
						if (_this.settings.general[autoloadKey]) BDFDB.TimeUtils.timeout(_ => {
							if (BDFDB.BDUtils.isThemeEnabled(name) == false) {
								BDFDB.BDUtils.enableTheme(name, false);
								BDFDB.LogUtils.log(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_started", name), _this);
							}
						}, 3000);
						callback();
					}
				}));
			}
			generateTheme(css) {
				if (!css || !BDFDB.ObjectUtils.is(this.props.generatorValues)) return "";
				for (let inputId in this.props.generatorValues) if (this.props.generatorValues[inputId].value && this.props.generatorValues[inputId].value.trim() && this.props.generatorValues[inputId].value != this.props.generatorValues[inputId].oldValue) css = css.replace(new RegExp(`--${BDFDB.StringUtils.regEscape(inputId)}(\\s*):(\\s*)${BDFDB.StringUtils.regEscape(this.props.generatorValues[inputId].oldValue)}`,"g"),`--${inputId}$1: $2${this.props.generatorValues[inputId].value}`);
				return css;
			}
			createFixerCSS(body) {
				let oldCSS = body.replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r").split("REPLACE_CLASS_");
				let newCSS = oldCSS.shift();
				for (let str of oldCSS) {
					let reg = /([A-z0-9_]+)(.*)/.exec(str);
					newCSS += BDFDB.dotCN[reg[1]] + reg[2];
				}
				return newCSS.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "\r");
			}
			render() {
				if (!this.props.tab) this.props.tab = "Themes";
				
				this.props.entries = (!loading.is && grabbedThemes.length ? this.filterThemes() : []).map(theme => BDFDB.ReactUtils.createElement(RepoCardComponent, {
					data: theme
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
						}) : BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.discoverycards,
							children: this.props.entries
						})
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
								options: [{value: "-----", label: "-----"}, nativeCSSvars && {value: "nativediscord", label: "Discord"}].concat(generatorThemes.map(t => ({value: t.id, label: t.name || "-----"})).sort((x, y) => (x.label < y.label ? -1 : x.label > y.label ? 1 : 0))).filter(n => n),
								onChange: value => {
									let generatorTheme = generatorThemes.find(t => t.id == value);
									if (generatorTheme || value == "nativediscord") {
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
										css: (generatorTheme || {}).fullCSS
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
											this.createThemeFile("Discord", "Discord.theme.css", `/**\n * @name Discord\n * @description Allow you to easily customize Discord's native Look  \n * @author DevilBro\n * @version 1.0.0\n * @authorId 278543574059057154\n * @invite Jx3TjNS\n * @donate https://www.paypal.me/MircoWittrien\n * @patreon https://www.patreon.com/MircoWittrien\n */\n\n` + this.generateTheme(nativeCSSvars), "startDownloaded");
										}
										else {
											let generatorTheme = generatorThemes.find(t => t.id == this.props.currentGenerator);
											if (generatorTheme) this.createThemeFile(generatorTheme.name, generatorTheme.name + ".theme.css", this.generateTheme(generatorTheme.fullCSS), "startDownloaded");
										}
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
									className: BDFDB.disCN.marginbottom20
								}),
								(_ => {
									let generatorTheme = generatorThemes.find(t => t.id == this.props.currentGenerator);
									let vars = this.props.currentGeneratorIsNative ? nativeCSSvars.split(".theme-dark, .theme-light") : ((generatorTheme || {}).fullCSS || "").split(":root");
									if (vars.length < 2) return null;
									vars = vars[1].replace(/\t\(/g, " (").replace(/\r|\t| {2,}/g, "").replace(/\/\*\n*((?!\/\*|\*\/).|\n)*\n+((?!\/\*|\*\/).|\n)*\n*\*\//g, "").replace(/\n\/\*.*?\*\//g, "").replace(/\n/g, "");
									vars = vars.split("{");
									vars.shift();
									vars = vars.join("{").replace(/\s*(:|;|--|\*)\s*/g, "$1");
									vars = vars.split("}")[0];
									vars = (vars.endsWith(";") ? vars.slice(0, -1) : vars).slice(2).split(/;--|\*\/--/);
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
												label: varName.split("-").map(BDFDB.LibraryModules.StringUtils.upperCaseFirstChar).join(" "),
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
															css: this.generateTheme(this.props.currentGeneratorIsNative ? nativeCSSvars : (generatorTheme || {}).fullCSS)
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
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
								title: "Show following Themes",
								children: Object.keys(_this.defaults.filters).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
									type: "Switch",
									plugin: _this,
									keys: ["filters", key],
									label: _this.defaults.filters[key].description,
									value: _this.settings.filters[key],
									onChange: value => {
										this.props[key] = _this.settings.filters[key] = value;
										BDFDB.ReactUtils.forceUpdate(this);
									}
								}))
							}),
							Object.keys(_this.defaults.general).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: _this,
								keys: ["general", key],
								label: _this.defaults.general[key].description,
								value: _this.settings.general[key],
								onChange: value => {
									_this.settings.general[key] = value;
									BDFDB.ReactUtils.forceUpdate(this);
								}
							})),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
								title: "Preview Settings",
								children: [
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
										type: "Switch",
										label: "Use Light Mode",
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
										label: "Include Custom CSS",
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
										label: "Include ThemeFixer",
										value: this.props.useThemeFixer,
										onChange: value => {
											this.props.useThemeFixer  = value;
											BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/_res/ThemeFixer.css", (error, response, body) => {
												if (preview) this.runInPreview({
													reason: "ThemeFixer",
													checked: this.props.useThemeFixer,
													css: this.createFixerCSS(body)
												});
											});
										}
									})
								]
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Button",
								margin: 20,
								label: "Download ThemeFixer",
								children: "Download",
								onClick: _ => {
									BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/_res/ThemeFixer.css", (error, response, body) => {
										this.createThemeFile("ThemeFixer", "ThemeFixer.theme.css", `/**\n * @name ThemeFixer\n * @description ThemeFixerCSS for transparent themes\n * @author DevilBro\n * @version 1.0.3\n * @authorId 278543574059057154\n * @invite Jx3TjNS\n * @donate https://www.paypal.me/MircoWittrien\n * @patreon https://www.patreon.com/MircoWittrien\n */\n\n` + this.createFixerCSS(body), "startDownloaded");
									});
								}
							})
						].flat(10).filter(n => n)
					})
				];
			}
		};
		
		const RepoCardComponent = class ThemeCard extends BdApi.React.Component {
			render() {
				if (this.props.data.thumbnailUrl && !this.props.data.thumbnailChecked) {
					if (!window.Buffer) this.props.data.thumbnailChecked = true;
					else BDFDB.LibraryRequires.request(this.props.data.thumbnailUrl, {encoding: null}, (error, response, body) => {
						if (response && response.headers["content-type"] && response.headers["content-type"] == "image/gif") {
							const throwAwayImg = new Image(), instance = this;
							throwAwayImg.onload = function() {
								const canvas = document.createElement("canvas");
								canvas.getContext("2d").drawImage(throwAwayImg, 0, 0, canvas.width = this.width, canvas.height = this.height);
								try {
									const oldUrl = instance.props.data.thumbnailUrl;
									instance.props.data.thumbnailUrl = canvas.toDataURL("image/png");
									instance.props.data.thumbnailGifUrl = oldUrl;
									instance.props.data.thumbnailChecked = true;
									BDFDB.ReactUtils.forceUpdate(instance);
								}
								catch (err) {
									instance.props.data.thumbnailChecked = true;
									BDFDB.ReactUtils.forceUpdate(instance);
								}
							};
							throwAwayImg.onerror = function() {
								instance.props.data.thumbnailChecked = true;
								BDFDB.ReactUtils.forceUpdate(instance);
							};
							throwAwayImg.src = "data:" + response.headers["content-type"] + ";base64," + (new Buffer(body).toString("base64"));
						}
						else {
							this.props.data.thumbnailChecked = true;
							BDFDB.ReactUtils.forceUpdate(this);
						}
					});
				}
				return BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN.discoverycard,
					children: [
						BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.discoverycardheader,
							children: [
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.discoverycardcoverwrapper,
									children: [
										this.props.data.thumbnailUrl && this.props.data.thumbnailChecked && BDFDB.ReactUtils.createElement("img", {
											className: BDFDB.disCN.discoverycardcover,
											src: this.props.data.thumbnailUrl,
											loading: "lazy",
											onMouseEnter: this.props.data.thumbnailGifUrl && (e => e.target.src = this.props.data.thumbnailGifUrl),
											onMouseLeave: this.props.data.thumbnailGifUrl && (e => e.target.src = this.props.data.thumbnailUrl),
											onClick: _ => {
												const url = this.props.data.thumbnailGifUrl || this.props.data.thumbnailUrl;
												console.log(this.props.data);
												const img = document.createElement("img");
												img.addEventListener("load", function() {
													BDFDB.LibraryModules.ModalUtils.openModal(modalData => {
														return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalRoot, Object.assign({
															className: BDFDB.disCN.imagemodal
														}, modalData, {
															size: BDFDB.LibraryComponents.ModalComponents.ModalSize.DYNAMIC,
															"aria-label": BDFDB.LanguageUtils.LanguageStrings.IMAGE,
															children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ImageModal, {
																animated: false,
																src: url,
																original: url,
																width: this.width,
																height: this.height,
																className: BDFDB.disCN.imagemodalimage,
																shouldAnimate: true,
																renderLinkComponent: props => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, props)
															})
														}), true);
													});
												});
												img.src = url;
											}
										}),
										this.props.data.new && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.TextBadge, {
											className: BDFDB.disCN.discoverycardcoverbadge,
											style: {
												borderRadius: 3,
												textTransform: "uppercase",
												background: BDFDB.DiscordConstants.Colors.STATUS_YELLOW
											},
											text: BDFDB.LanguageUtils.LanguageStrings.NEW
										})
									]
								}),
								BDFDB.ReactUtils.createElement(class extends BDFDB.ReactUtils.Component {
									render() {
										return BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.disCN.discoverycardiconwrapper,
											children: this.props.data.author && this.props.data.author.discord_avatar_hash && this.props.data.author.discord_snowflake && !this.props.data.author.discord_avatar_failed ? BDFDB.ReactUtils.createElement("img", {
												className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.discoverycardicon, !this.props.data.author.discord_avatar_loaded && BDFDB.disCN.discoverycardiconloading),
												src: `https://cdn.discordapp.com/avatars/${this.props.data.author.discord_snowflake}/${this.props.data.author.discord_avatar_hash}.webp?size=128`,
												loading: "lazy",
												onLoad: _ => {
													this.props.data.author.discord_avatar_loaded = true;
													BDFDB.ReactUtils.forceUpdate(this);
												},
												onError: _ => {
													this.props.data.author.discord_avatar_failed = true;
													BDFDB.ReactUtils.forceUpdate(this);
												}
											}) : BDFDB.ReactUtils.createElement("div", {
												className: BDFDB.disCN.discoverycardicon,
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
													nativeClass: true,
													iconSVG: `<svg width="100%" height="100%" viewBox="0 0 24 24"><path fill="currentColor" d="m 14.69524,1.9999881 c -0.17256,0 -0.34519,0.065 -0.47686,0.1969 L 8.8655531,7.5498683 16.449675,15.134198 21.802502,9.7812182 c 0.26333,-0.2633 0.26333,-0.6904 0,-0.9537 L 20.7902,7.8168183 c -0.22885,-0.2289 -0.58842,-0.2633 -0.85606,-0.081 l -2.127134,1.4452499 1.437076,-2.1418399 c 0.17949,-0.2675 0.14486,-0.6251001 -0.083,-0.8528001 l -2.195488,-2.19433 c -0.20264,-0.2026 -0.51169,-0.2562 -0.7698,-0.1318 l -0.37921,0.1839 0.18228,-0.4036001 c 0.11521,-0.2555 0.0599,-0.5553 -0.13834,-0.7535 l -0.68843,-0.6901 c -0.131639,-0.13172 -0.30429,-0.19701 -0.476854,-0.19701 z M 7.8695308,8.5459582 6.3201566,10.095378 c -0.126449,0.1264 -0.196927,0.298 -0.196927,0.4769 0,0.1788 0.07043,0.3505 0.196927,0.4769 l 1.469627,1.46967 c 0.283151,0.2832 0.421272,0.6744 0.377578,1.07255 -0.04365,0.3979 -0.264001,0.7495 -0.602173,0.9651 -4.3184212,2.75283 -4.720939,3.15533 -4.853187,3.28763 -0.9493352,0.9493 -0.9493352,2.494471 0,3.443871 0.9502793,0.9503 2.4954759,0.9484 3.4437772,0 0.132338,-0.1323 0.534965,-0.535 3.2875378,-4.853321 0.215049,-0.3374 0.5670574,-0.5568 0.9651044,-0.6006 0.399307,-0.044 0.790042,0.094 1.072518,0.376 l 1.469626,1.46967 c 0.26328,0.2633 0.69043,0.2633 0.95371,0 l 1.549374,-1.54942 z M 4.4762059,18.571608 c 0.243902,0 0.487705,0.092 0.673783,0.2783 0.3722,0.3722 0.3722,0.975401 0,1.347601 -0.3722,0.3722 -0.97541,0.3722 -1.3475649,0 -0.3722,-0.3722 -0.3722,-0.975401 0,-1.347601 0.1861,-0.1861 0.42988,-0.2783 0.6737819,-0.2783 z"/></svg>`
												})
											})
										});
									}
								}, this.props)
							]							
						}),
						BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.discoverycardinfo,
							children: [
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.discoverycardtitle,
									children: [
										BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.disCN.discoverycardname,
											children: this.props.data.name
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
											text: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_VIDEO_PREVIEW,
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
												className: BDFDB.disCN.discoverycardtitlebutton,
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
													nativeClass: true,
													width: 16,
													height: 16,
													name: BDFDB.LibraryComponents.SvgIcon.Names.EYE
												})
											}),
											onClick: _ => {
												if (!list) return;
												
												list.props.currentTheme = this.props.data;
												delete list.props.currentGenerator;
												delete list.props.generatorValues;
												
												if (preview) list.runInPreview({
													reason: "NewTheme",
													checked: value,
													css: this.props.data.css
												});
												else list.openPreview();
												
												BDFDB.ReactUtils.forceUpdate(this);
											}
										}),
										this.props.data.latestSourceUrl && 
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
											text: BDFDB.LanguageUtils.LanguageStrings.SCREENSHARE_SOURCE,
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
												className: BDFDB.disCN.discoverycardtitlebutton,
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
													nativeClass: true,
													width: 16,
													height: 16,
													name: BDFDB.LibraryComponents.SvgIcon.Names.GITHUB
												})
											}),
											onClick: _ => BDFDB.DiscordUtils.openLink(this.props.data.latestSourceUrl)
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FavButton, {
											className: BDFDB.disCN.discoverycardtitlebutton,
											isFavorite: this.props.data.fav,
											onClick: value => {
												this.props.data.fav = value && 1;
												if (value) favorites.push(this.props.data.id);
												else BDFDB.ArrayUtils.remove(favorites, this.props.data.id, true);
												BDFDB.DataUtils.save(BDFDB.ArrayUtils.numSort(favorites).join(" "), _this, "favorites");
											}
										})
									]
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.discoverycardauthor,
									children: `by ${this.props.data.authorname}`
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Scrollers.Thin, {
									className: BDFDB.disCN.discoverycarddescription,
									children: this.props.data.description
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.discoverycardfooter,
									children: [
										BDFDB.ArrayUtils.is(this.props.data.tags) && this.props.data.tags.length && BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.disCN.discoverycardtags,
											children: this.props.data.tags.map(tag => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.TextBadge, {
												className: BDFDB.disCN.discoverycardtag,
												style: {background: "var(--background-accent)"},
												text: tag
											}))
										}),
										BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.disCN.discoverycardcontrols,
											children: [
												BDFDB.ReactUtils.createElement("div", {
													className: BDFDB.disCN.discoverycardstats,
													children: [
														BDFDB.ReactUtils.createElement("div", {
															className: BDFDB.disCN.discoverycardstat,
															children: [
																BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
																	className: BDFDB.disCN.discoverycardstaticon,
																	name: BDFDB.LibraryComponents.SvgIcon.Names.DOWNLOAD
																}),
																this.props.data.downloads
															]
														}),
														BDFDB.ReactUtils.createElement("div", {
															className: BDFDB.disCN.discoverycardstat,
															children: [
																BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
																	className: BDFDB.disCN.discoverycardstaticon,
																	name: BDFDB.LibraryComponents.SvgIcon.Names.HEART
																}),
																this.props.data.likes
															]
														})
													]
												}),
												BDFDB.ReactUtils.createElement(RepoCardDownloadButtonComponent, {
													...buttonData[(Object.entries(themeStates).find(n => n[1] == this.props.data.state) || [])[0]],
													installed: this.props.data.state == themeStates.INSTALLED,
													outdated: this.props.data.state == themeStates.OUTDATED,
													onDownload: _ => {
														if (!list || this.props.downloading) return;
														this.props.downloading = true;
														let loadingToast = BDFDB.NotificationUtils.toast(`${BDFDB.LanguageUtils.LibraryStringsFormat("loading", this.props.data.name)} - ${BDFDB.LanguageUtils.LibraryStrings.please_wait}`, {timeout: 0, ellipsis: true});
														let autoloadKey = this.props.data.state == themeStates ? "startUpdated" : "startDownloaded";
														BDFDB.LibraryRequires.request(this.props.data.rawSourceUrl, (error, response, body) => {
															if (error) {
																delete this.props.downloading;
																loadingToast.close();
																BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("download_fail", `Theme "${this.props.data.name}"`), {type: "danger"});
															}
															else list.createThemeFile(this.props.data.name, this.props.data.rawSourceUrl.split("/").pop(), body, autoloadKey).then(error2 => {
																delete this.props.downloading;
																loadingToast.close();
																if (!error2) {
																	this.props.data.state = themeStates.INSTALLED;
																	BDFDB.ReactUtils.forceUpdate(this);
																}
															});
														});
													},
													onDelete: _ => {
														if (this.props.deleting) return;
														this.props.deleting = true;
														BDFDB.LibraryRequires.fs.unlink(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getThemesFolder(), this.props.data.rawSourceUrl.split("/").pop()), error => {
															delete this.props.deleting;
															if (error) BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("delete_fail", `Theme "${this.props.data.name}"`), {type: "danger"});
															else {
																BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("delete_success", `Theme "${this.props.data.name}"`));
																this.props.data.state = themeStates.DOWNLOADABLE;
																BDFDB.ReactUtils.forceUpdate(this);
															}
														});
													}
												})
											]
										})
									]
								})
							]
						})
					]
				});
			}
		};
		
		const RepoCardDownloadButtonComponent = class ThemeCardDownloadButton extends BdApi.React.Component {
			render() {
				const backgroundColor = this.props.doDelete ? buttonData.OUTDATED.backgroundColor : this.props.doUpdate ? buttonData.INSTALLED.backgroundColor : this.props.backgroundColor;
				return BDFDB.ReactUtils.createElement("button", {
					className: BDFDB.disCN.discoverycardbutton,
					style: {backgroundColor: BDFDB.DiscordConstants.Colors[backgroundColor] || backgroundColor},
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.disCN.discoverycardstaticon,
							width: 16,
							height: 16,
							name: this.props.doDelete ? BDFDB.LibraryComponents.SvgIcon.Names.TRASH : this.props.doUpdate ? BDFDB.LibraryComponents.SvgIcon.Names.DOWNLOAD : BDFDB.LibraryComponents.SvgIcon.Names[this.props.icon]
						}),
						this.props.doDelete ? BDFDB.LanguageUtils.LanguageStrings.APPLICATION_CONTEXT_MENU_UNINSTALL : this.props.doUpdate ? BDFDB.LanguageUtils.LanguageStrings.GAME_ACTION_BUTTON_UPDATE : (BDFDB.LanguageUtils.LibraryStringsCheck[this.props.text] ? BDFDB.LanguageUtils.LibraryStrings[this.props.text] : BDFDB.LanguageUtils.LanguageStrings[this.props.text])
					],
					onClick: _ => {
						if (this.props.doDelete) typeof this.props.onDelete == "function" && this.props.onDelete();
						else if (!this.props.installed) typeof this.props.onDownload == "function" && this.props.onDownload();
					},
					onMouseEnter: this.props.installed ? (_ => {
						this.props.doDelete = true;
						BDFDB.ReactUtils.forceUpdate(this);
					}) : this.props.outdated ? (_ => {
						this.props.doUpdate = true;
						BDFDB.ReactUtils.forceUpdate(this);
					}) : (_ => {}),
					onMouseLeave: this.props.installed ? (_ => {
						this.props.doDelete = false;
						BDFDB.ReactUtils.forceUpdate(this);
					}) : this.props.outdated ? (_ => {
						this.props.doUpdate = false;
						BDFDB.ReactUtils.forceUpdate(this);
					}) : (_ => {})
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
										children: `Theme Repo — ${loading.is ? 0 : this.props.amount || 0}/${loading.is ? 0 : grabbedThemes.length}`
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SearchBar, {
										autoFocus: true,
										query: searchString,
										onChange: (value, instance) => {
											if (loading.is) return;
											BDFDB.TimeUtils.clear(searchTimeout);
											searchTimeout = BDFDB.TimeUtils.timeout(_ => {
												searchString = value.replace(/[<|>]/g, "");
												BDFDB.ReactUtils.forceUpdate(this, list);
											}, 1000);
										},
										onClear: instance => {
											if (loading.is) return;
											searchString = "";
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
										options: Object.keys(sortKeys).map(key => ({
											label: sortKeys[key],
											value: key
										})),
										onChange: key => {
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
										onChange: key => {
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
				generatorThemes = [];
				searchString = "";

				this.defaults = {
					general: {
						notifyOutdated:		{value: true, 	autoload: false,	description: "Get a Notification when one of your Themes is outdated"},
						notifyNewEntries:	{value: true, 	autoload: false,	description: "Get a Notification when there are new Entries in the Repo"},
						startDownloaded:	{value: false, 	autoload: true,		description: "Start new Themes after Download"},
						startUpdated:		{value: false, 	autoload: true,		description: "Start updated Themes after Download"}
					},
					filters: {
						updated: 			{value: true,	description: "Updated"},
						outdated:			{value: true, 	description: "Outdated"},
						downloadable:		{value: true, 	description: "Downloadable"},
					}
				};
			
				this.patchedModules = {
					before: {
						SettingsView: ["render", "componentWillUnmount"]
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

				updateInterval = BDFDB.TimeUtils.interval(_ => this.checkForNewThemes(), 1000*60*30);
			}
			
			onStop () {
				BDFDB.TimeUtils.clear(updateInterval);
				BDFDB.TimeUtils.clear(loading.timeout);

				this.forceUpdateAll();

				BDFDB.DOMUtils.remove(BDFDB.dotCN._themereponotice, BDFDB.dotCN._themerepoloadingicon);
			}
			
			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
			
			forceUpdateAll () {
				favorites = BDFDB.DataUtils.load(this, "favorites");
				favorites = (typeof favorites == "string" ? favorites.split(" ") : []).map(n => parseInt(n)).filter(n => !isNaN(n));
				
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
				if (e.node) searchString = "";
				else {
					if (!BDFDB.PatchUtils.isPatched(this, e.component, "getPredicateSections")) BDFDB.PatchUtils.patch(this, e.component, "getPredicateSections", {after: e2 => {
						if (BDFDB.ArrayUtils.is(e2.returnValue) && e2.returnValue.findIndex(n => n.section && (n.section.toLowerCase() == "changelog" || n.section == BDFDB.DiscordConstants.UserSettingsSections.CHANGE_LOG || n.section.toLowerCase() == "logout" || n.section == BDFDB.DiscordConstants.UserSettingsSections.LOGOUT))) {
							e2.returnValue = e2.returnValue.filter(n => n.section != "themerepo");
							let index = e2.returnValue.indexOf(e2.returnValue.find(n => n.section == "pluginrepo") || e2.returnValue.find(n => n.section == "themes") || e2.returnValue.find(n => n.section == BDFDB.DiscordConstants.UserSettingsSections.DEVELOPER_OPTIONS) || e2.returnValue.find(n => n.section == BDFDB.DiscordConstants.UserSettingsSections.HYPESQUAD_ONLINE));
							if (index > -1) {
								e2.returnValue.splice(index + 1, 0, {
									section: "themerepo",
									label: "Theme Repo",
									element: _ => {
										let options = Object.assign({}, this.settings.filters);
										options.updated = options.updated && !showOnlyOutdated;
										options.outdated = options.outdated || showOnlyOutdated;
										options.downloadable = options.downloadable && !showOnlyOutdated;
										options.sortKey = forcedSort || Object.keys(sortKeys)[0];
										options.orderKey = forcedOrder || Object.keys(orderKeys)[0];
										options.useLightMode = BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themelight;
										options.useThemeFixer = false;
										options.useCustomCSS = false;
										
										return BDFDB.ReactUtils.createElement(RepoListComponent, options);
									}
								});
								if (!e2.returnValue.find(n => n.section == "plugins" || n.section == "pluginrepo")) e2.returnValue.splice(index + 1, 0, {section: "DIVIDER"});
							}
						}
					}});
				}
			}
			
			processStandardSidebarView (e) {
				if (e.instance.props.section == "themerepo") {
					let content = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.settingswindowcontentregion]]});
					if (content) content.props.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._repolistwrapper, content.props.className);
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.settingswindowcontentregionscroller]]});
					if (index > -1) {
						let options = {};
						options.sortKey = forcedSort || Object.keys(sortKeys)[0];
						options.orderKey = forcedOrder || Object.keys(orderKeys)[0];
						children[index] = [
							BDFDB.ReactUtils.createElement(RepoListHeaderComponent, options),
							children[index]
						];
					}
				}
			}
			
			generateTheme (fullCSS, generatorValues) {
				if (!fullCSS || !BDFDB.ObjectUtils.is(generatorValues)) return "";
				for (let inputId in generatorValues) if (generatorValues[inputId].value && generatorValues[inputId].value.trim() && generatorValues[inputId].value != generatorValues[inputId].oldValue) fullCSS = fullCSS.replace(new RegExp(`--${BDFDB.StringUtils.regEscape(inputId)}(\\s*):(\\s*)${BDFDB.StringUtils.regEscape(generatorValues[inputId].oldValue)}`,"g"),`--${inputId}$1: $2${generatorValues[inputId].value}`);
				return fullCSS;
			}

			loadThemes () {
				BDFDB.DOMUtils.remove(BDFDB.dotCN._themerepoloadingicon);
				cachedThemes = BDFDB.DataUtils.load(this, "cached");
				cachedThemes = (typeof cachedThemes == "string" ? cachedThemes.split(" ") : []).map(n => parseInt(n)).filter(n => !isNaN(n));
				
				let loadingIcon;
				let newEntries = 0, outdatedEntries = 0, checkIndex = 0, checksRunning = 0, callbackCalled = false;
				
				const checkTheme = _ => {
					if (checksRunning > 20) return;
					else if (grabbedThemes.every(t => t.loaded || (!t.latestSourceUrl && !t.latest_source_url)) || !this.started || !loading.is) {
						if (!callbackCalled) {
							callbackCalled = true;
							if (!this.started) return BDFDB.TimeUtils.clear(loading.timeout);
							BDFDB.TimeUtils.clear(loading.timeout);
							BDFDB.DOMUtils.remove(loadingIcon, BDFDB.dotCN._themerepoloadingicon);
							loading = {is: false, timeout: null, amount: loading.amount};
							
							BDFDB.LogUtils.log("Finished fetching Themes", this);
							BDFDB.ReactUtils.forceUpdate(list);
							
							if (this.settings.general.notifyOutdated && outdatedEntries > 0) {
								let notice = document.querySelector(BDFDB.dotCN._themerepooutdatednotice);
								if (notice) notice.close();
								BDFDB.NotificationUtils.notice(this.labels.notice_outdated_themes.replace("{{var0}}", outdatedEntries), {
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
							
							if (this.settings.general.notifyNewEntries && newEntries > 0) {
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
											forcedSort = "RELEASEDATE";
											forcedOrder = "ASC";
											BDFDB.LibraryModules.UserSettingsUtils.open("themerepo");
										}
									}]
								});
							}
							
							BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/_res/GeneratorList.txt", (error, response, body) => {
								if (!error && body) for (let id of body.replace(/[\r\t]/g, "").split(" ").map(n => parseInt(n)).filter(n => n != null)) {
									let theme = grabbedThemes.find(t => t.id == id);
									if (theme) generatorThemes.push(theme);
								}
							});
							
							BDFDB.LibraryRequires.request(document.querySelector("head link[rel='stylesheet'][integrity]").href, (error, response, body) => {
								if (!error && body) {
									nativeCSS = body;
									let theme = BDFDB.DiscordUtils.getTheme();
									let vars = (nativeCSS.split(`.${theme}{`)[1] || "").split("}")[0];
									nativeCSSvars = vars ? `.theme-dark, .theme-light {${vars}}` : "";
								}
								else nativeCSS = nativeCSSvars = "";
							});
						}
						return;
					}
					else if (checkIndex > grabbedThemes.length) return;
					
					const theme = grabbedThemes[checkIndex++];
					if (!theme || (!theme.latestSourceUrl && !theme.latest_source_url)) checkTheme();
					else {
						checksRunning++;
						theme.releasedate = new Date(theme.releaseDate || theme.release_date || 0).getTime();
						theme.latestSourceUrl = theme.latestSourceUrl || theme.latest_source_url;
						theme.rawSourceUrl = theme.latestSourceUrl.replace("https://github.com/", "https://raw.githubusercontent.com/").replace(/\/blob\/(.{32,})/i, "/$1");
						theme.thumbnailUrl = theme.thumbnailUrl || theme.thumbnail_url;
						theme.thumbnailUrl = theme.thumbnailUrl ? (theme.thumbnailUrl.startsWith("https://") ? theme.thumbnailUrl : `https://betterdiscord.app${theme.thumbnailUrl}`) : "";
						delete theme.release_date;
						delete theme.latest_source_url;
						delete theme.thumbnail_url;
						BDFDB.LibraryRequires.request(theme.rawSourceUrl, (error, response, body) => {
							if (body && body.indexOf("404: Not Found") != 0 && response.statusCode == 200) {
								theme.name = BDFDB.LibraryModules.StringUtils.upperCaseFirstChar((/@name\s+([^\t^\r^\n]+)|\/\/\**META.*["']name["']\s*:\s*["'](.+?)["']/i.exec(body) || []).filter(n => n)[1] || theme.name || "");
								theme.authorname = (/@author\s+(.+)|\/\/\**META.*["']author["']\s*:\s*["'](.+?)["']/i.exec(body) || []).filter(n => n)[1] || theme.author.display_name || theme.author;
								const version = (/@version\s+(.+)|\/\/\**META.*["']version["']\s*:\s*["'](.+?)["']/i.exec(body) || []).filter(n => n)[1];
								if (version) theme.version = version;
								if (theme.version) {
									const installedTheme = this.getInstalledTheme(theme);
									if (installedTheme && this.compareVersions(version, this.getString(installedTheme.version))) outdatedEntries++;
								}
								let text = body.trim();
								let hasMETAline = text.replace(/\s/g, "").indexOf("//META{"), newMeta = "";
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
							}
							if (!cachedThemes.includes(theme.id)) newEntries++;
							
							theme.loaded = true;
							
							let loadingTooltip = document.querySelector(BDFDB.dotCN._themerepoloadingtooltip);
							if (loadingTooltip) loadingTooltip.update(this.getLoadingTooltipText());
							
							checksRunning--;
							checkTheme();
						});
					}
				};
				
				BDFDB.LibraryRequires.request("https://api.betterdiscord.app/v1/store/themes", (error, response, body) => {
					if (!error && body && response.statusCode == 200) try {
						grabbedThemes = BDFDB.ArrayUtils.keySort(JSON.parse(body).filter(n => n), "name");
						
						BDFDB.DataUtils.save(BDFDB.ArrayUtils.numSort(grabbedThemes.map(n => n.id)).join(" "), this, "cached");
						
						loading = {is: true, timeout: BDFDB.TimeUtils.timeout(_ => {
							BDFDB.TimeUtils.clear(loading.timeout);
							if (this.started) {
								if (loading.is && loading.amount < 4) BDFDB.TimeUtils.timeout(_ => this.loadThemes(), 10000);
								loading = {is: false, timeout: null, amount: loading.amount};
							}
						}, 1200000), amount: loading.amount + 1};
						
						loadingIcon = BDFDB.DOMUtils.create(themeRepoIcon.replace(/COLOR_1/gi, "var(--bdfdb-blurple)").replace(/COLOR_2/gi, "#72767d"));
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
						
						for (let i = 0; i <= 20; i++) checkTheme();
					}
					catch (err) {BDFDB.NotificationUtils.toast("Failed to load Theme Store", {type: "danger"});}
					if (response && response.statusCode == 403) BDFDB.NotificationUtils.toast("Failed to fetch Theme Store from the Website Api due to DDoS Protection", {type: "danger"});
					else if (response && response.statusCode == 404) BDFDB.NotificationUtils.toast("Failed to fetch Theme Store from the Website Api due to Connection Issue", {type: "danger"});
				});
			}

			getLoadingTooltipText () {
				return BDFDB.LanguageUtils.LibraryStringsFormat("loading", `Theme Repo - [${grabbedThemes.filter(n => n.loaded).length}/${grabbedThemes.length}]`);
			}

			getString (obj) {
				let string = "";
				if (typeof obj == "string") string = obj;
				else if (obj && obj.props) {
					if (typeof obj.props.children == "string") string = obj.props.children;
					else if (Array.isArray(obj.props.children)) for (let c of obj.props.children) string += typeof c == "string" ? c : this.getString(c);
				}
				return string;
			}

			compareVersions (v1, v2) {
				return !(v1 == v2 || !BDFDB.NumberUtils.compareVersions(v1, v2));
			}
			
			getInstalledTheme (theme) {
				if (!theme || typeof theme.authorname != "string") return;
				const iTheme = BDFDB.BDUtils.getTheme(theme.name, false, true);
				if (iTheme && theme.authorname.toUpperCase() == this.getString(iTheme.author).toUpperCase()) return iTheme;
				else if (theme.rawSourceUrl && window.BdApi && BdApi.Themes && typeof BdApi.Themes.getAll == "function") {
					const filename = theme.rawSourceUrl.split("/").pop();
					for (let t of BdApi.Themes.getAll()) if (t.filename == filename && theme.authorname.toUpperCase() == this.getString(t.author).toUpperCase()) return t;
				}
			}

			checkForNewThemes () {
				BDFDB.LibraryRequires.request("https://api.betterdiscord.app/v1/store/themes", (error, response, body) => {
					if (!error && body) try {
						if (JSON.parse(body).filter(n => n).length != grabbedThemes.length) {
							loading = {is: false, timeout: null, amount: 0};
							this.loadThemes();
						}
					}
					catch (err) {BDFDB.NotificationUtils.toast("Failed to load Theme Store", {type: "danger"});}
				});
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
