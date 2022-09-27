/**
 * @name PluginRepo
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 2.3.7
 * @description Allows you to download all Plugins from BD's Website within Discord
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/PluginRepo/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/PluginRepo/PluginRepo.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
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
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
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
		var _this;
		
		var list, header;
		
		var loading, cachedPlugins, grabbedPlugins, updateInterval;
		var searchString, searchTimeout, forcedSort, forcedOrder, showOnlyOutdated;
		
		var favorites = [];
		
		const pluginStates = {
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
		
		const pluginRepoIcon = `<svg width="37" height="32" viewBox="0 0 37 32"><path fill="COLOR_1" d="m 0,0 v 32 h 8.1672381 v -9.355469 h 4.7914989 c 7.802754,0 11.77368,-5.650788 11.77368,-11.345703 C 24.732417,5.6491106 20.8074,0 12.913386,0 Z m 8.1672381,7.5488281 h 4.7461479 c 4.928055,-0.045198 4.928055,7.9534009 0,7.9082029 H 8.1672381 Z"/><path fill="COLOR_2" d="M 23.173828 0 C 26.168987 2.3031072 27.920961 5.6614952 28.433594 9.2128906 C 29.159183 10.362444 29.181906 11.885963 28.511719 13.064453 C 28.098967 17.002739 26.191156 20.761973 22.810547 23.197266 L 29.287109 32 L 37 32 L 37 28.941406 L 30.65625 21.017578 C 34.580442 19.797239 37 16.452154 37 10.53125 C 36.81748 3.0284249 31.662 0 25 0 L 23.173828 0 z M 20.34375 24.603516 C 18.404231 25.464995 16.135462 25.970703 13.521484 25.970703 L 12.085938 25.970703 L 12.085938 32 L 20.34375 32 L 20.34375 24.603516 z"/></svg>`;
		
		const RepoListComponent = class PluginList extends BdApi.React.Component {
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
			}
			filterPlugins() {
				let plugins = grabbedPlugins.map(plugin => {
					const installedPlugin = _this.getInstalledPlugin(plugin);
					const state = installedPlugin ? (plugin.version && _this.compareVersions(plugin.version, _this.getString(installedPlugin.version)) ? pluginStates.OUTDATED : pluginStates.INSTALLED) : pluginStates.DOWNLOADABLE;
					return Object.assign(plugin, {
						search: [plugin.name, plugin.version, plugin.authorname, plugin.description, plugin.tags].flat(10).filter(n => typeof n == "string").join(" ").toUpperCase(),
						description: plugin.description || "No Description found",
						fav: favorites.includes(plugin.id) && 1,
						new: state == pluginStates.DOWNLOADABLE && !cachedPlugins.includes(plugin.id) && 1,
						state: state
					});
				});
				if (!this.props.updated)		plugins = plugins.filter(plugin => plugin.state != pluginStates.INSTALLED);
				if (!this.props.outdated)		plugins = plugins.filter(plugin => plugin.state != pluginStates.OUTDATED);
				if (!this.props.downloadable)	plugins = plugins.filter(plugin => plugin.state != pluginStates.DOWNLOADABLE);
				if (searchString) 	{
					let usedSearchString = searchString.toUpperCase();
					let spacelessUsedSearchString = usedSearchString.replace(/\s/g, "");
					plugins = plugins.filter(plugin => plugin.search.indexOf(usedSearchString) > -1 || plugin.search.indexOf(spacelessUsedSearchString) > -1);
				}
				
				BDFDB.ArrayUtils.keySort(plugins, this.props.sortKey.toLowerCase());
				if (this.props.orderKey == "DESC") plugins.reverse();
				if (reverseSorts.includes(this.props.sortKey)) plugins.reverse();
				return plugins;
			}
			render() {
				if (!this.props.tab) this.props.tab = "Plugins";
				
				this.props.entries = (!loading.is && grabbedPlugins.length ? this.filterPlugins() : []).map(plugin => BDFDB.ReactUtils.createElement(RepoCardComponent, {
					data: plugin
				})).filter(n => n);
				
				BDFDB.TimeUtils.timeout(_ => {
					if (!loading.is && header && this.props.entries.length != header.props.amount) {
						header.props.amount = this.props.entries.length;
						BDFDB.ReactUtils.forceUpdate(header);
					}
				});
				
				return [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
						tab: "Plugins",
						open: this.props.tab == "Plugins",
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
									children: `${BDFDB.LanguageUtils.LibraryStringsFormat("loading", "Plugin Repo")} - ${BDFDB.LanguageUtils.LibraryStrings.please_wait}`
								})
							]
						}) : BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.discoverycards,
							children: this.props.entries
						})
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
						tab: BDFDB.LanguageUtils.LanguageStrings.SETTINGS,
						open: this.props.tab == BDFDB.LanguageUtils.LanguageStrings.SETTINGS,
						render: false,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
								title: "Show following Plugins",
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
							}))
						].flat(10).filter(n => n)
					})
				];
			}
		};
		
		const RepoCardComponent = class PluginCard extends BdApi.React.Component {
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
													iconSVG: `<svg width="100%" height="100%" viewBox="0 0 24 24"><path fill="currentColor" d="${BDFDB.ArrayUtils.is(this.props.data.tags) && this.props.data.tags.includes("library") ? "m 7.3125,2.625 c -0.3238672,0 -0.5859375,0.2620703 -0.5859375,0.5859375 V 14.929687 c 0,0.323868 0.2620703,0.585938 0.5859375,0.585938 2.710313,0 3.840547,1.498711 4.101563,1.914062 V 3.9905599 C 10.603047,3.3127865 9.3007813,2.625 7.3125,2.625 Z M 4.96875,3.796875 c -0.3238672,0 -0.5859375,0.2620703 -0.5859375,0.5859375 V 17.273437 c 0,0.323868 0.2620703,0.585938 0.5859375,0.585938 h 5.30599 C 9.9465755,17.461602 9.0865625,16.6875 7.3125,16.6875 c -0.9692969,0 -1.7578125,-0.788516 -1.7578125,-1.757813 V 3.796875 Z m 9.375,0 c -0.662031,0 -1.266641,0.2287891 -1.757812,0.6005859 V 18.445312 c 0,-0.323281 0.262656,-0.585937 0.585937,-0.585937 h 5.859375 c 0.323868,0 0.585937,-0.26207 0.585937,-0.585938 V 4.3828125 c 0,-0.3238672 -0.262069,-0.5859375 -0.585937,-0.5859375 z M 2.5859375,4.96875 C 2.2620703,4.96875 2,5.2308203 2,5.5546875 V 19.617187 c 0,0.323868 0.2620703,0.585938 0.5859375,0.585938 H 9.171224 c 0.2420313,0.68207 0.892995,1.171875 1.656901,1.171875 h 2.34375 c 0.763906,0 1.414831,-0.489805 1.656901,-1.171875 h 6.585286 C 21.73793,20.203125 22,19.941055 22,19.617187 V 5.5546875 C 22,5.2308203 21.73793,4.96875 21.414062,4.96875 h -0.585937 v 12.304687 c 0,0.969297 -0.827578,1.757813 -1.796875,1.757813 H 13.656901 C 13.41487,19.71332 12.763907,20.203125 12,20.203125 c -0.763906,0 -1.414831,-0.489805 -1.656901,-1.171875 H 4.96875 c -0.9692968,0 -1.796875,-0.788516 -1.796875,-1.757813 V 4.96875 Z" : "m 11.470703,0.625 c -1.314284,0 -2.3808593,1.0666594 -2.3808592,2.3808594 V 4.4335938 H 5.2792969 c -1.0476168,0 -1.8945313,0.85855 -1.8945313,1.90625 v 3.6191406 h 1.4179688 c 1.41905,0 2.5722656,1.1512126 2.5722656,2.5703126 0,1.4191 -1.1532156,2.572266 -2.5722656,2.572265 H 3.375 v 3.619141 c 0,1.0477 0.8566801,1.904297 1.9042969,1.904297 h 3.6191406 v -1.427734 c 0,-1.4189 1.1532235,-2.572266 2.5722655,-2.572266 1.41905,0 2.570313,1.153366 2.570313,2.572266 V 20.625 h 3.61914 c 1.047626,0 1.90625,-0.856597 1.90625,-1.904297 v -3.810547 h 1.427735 c 1.314292,0 2.380859,-1.066559 2.380859,-2.380859 0,-1.3143 -1.066567,-2.38086 -2.380859,-2.380859 H 19.566406 V 6.3398438 c 0,-1.0477002 -0.858624,-1.90625 -1.90625,-1.90625 H 13.851562 V 3.0058594 c 0,-1.3142 -1.066568,-2.3808594 -2.380859,-2.3808594 z"}"/></svg>`
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
																	width: 16,
																	height: 16,
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
																	width: 16,
																	height: 16,
																	name: BDFDB.LibraryComponents.SvgIcon.Names.HEART
																}),
																this.props.data.likes
															]
														})
													]
												}),
												BDFDB.ReactUtils.createElement(RepoCardDownloadButtonComponent, {
													...buttonData[(Object.entries(pluginStates).find(n => n[1] == this.props.data.state) || [])[0]],
													installed: this.props.data.state == pluginStates.INSTALLED,
													outdated: this.props.data.state == pluginStates.OUTDATED,
													onDownload: _ => {
														if (this.props.downloading) return;
														this.props.downloading = true;
														let loadingToast = BDFDB.NotificationUtils.toast(`${BDFDB.LanguageUtils.LibraryStringsFormat("loading", this.props.data.name)} - ${BDFDB.LanguageUtils.LibraryStrings.please_wait}`, {timeout: 0, ellipsis: true});
														let autoloadKey = this.props.data.state == pluginStates.OUTDATED ? "startUpdated" : "startDownloaded";
														BDFDB.LibraryRequires.request(this.props.data.rawSourceUrl, (error, response, body) => {
															if (error) {
																delete this.props.downloading;
																loadingToast.close();
																BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("download_fail", `Plugin "${this.props.data.name}"`), {type: "danger"});
															}
															else {
																BDFDB.LibraryRequires.fs.writeFile(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), this.props.data.rawSourceUrl.split("/").pop()), body, error2 => {
																	delete this.props.downloading;
																	loadingToast.close();
																	if (error2) BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("save_fail", `Plugin "${this.props.data.name}"`), {type: "danger"});
																	else {
																		BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("save_success", `Plugin "${this.props.data.name}"`), {type: "success"});
																		if (_this.settings.general[autoloadKey]) BDFDB.TimeUtils.timeout(_ => {
																			if (this.props.data.state == pluginStates.INSTALLED && BDFDB.BDUtils.isPluginEnabled(this.props.data.name) == false) {
																				BDFDB.BDUtils.enablePlugin(this.props.data.name, false);
																				BDFDB.LogUtils.log(BDFDB.LanguageUtils.LibraryStringsFormat("toast_plugin_started", this.props.data.name), _this);
																			}
																		}, 3000);
																		this.props.data.state = pluginStates.INSTALLED;
																		BDFDB.ReactUtils.forceUpdate(this);
																	}
																});
															}
														});
													},
													onDelete: _ => {
														if (this.props.deleting) return;
														this.props.deleting = true;
														BDFDB.LibraryRequires.fs.unlink(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), this.props.data.rawSourceUrl.split("/").pop()), error => {
															delete this.props.deleting;
															if (error) BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("delete_fail", `Plugin "${this.props.data.name}"`), {type: "danger"});
															else {
																BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LibraryStringsFormat("delete_success", `Plugin "${this.props.data.name}"`));
																this.props.data.state = pluginStates.DOWNLOADABLE;
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
		
		const RepoCardDownloadButtonComponent = class PluginCardDownloadButton extends BdApi.React.Component {
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
		
		const RepoListHeaderComponent = class PluginListHeader extends BdApi.React.Component {
			componentDidMount() {
				header = this;
			}
			render() {
				if (!this.props.tab) this.props.tab = "Plugins";
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
										children: `Plugin Repo — ${loading.is ? 0 : this.props.amount || 0}/${loading.is ? 0 : grabbedPlugins.length}`
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
										_this.loadPlugins();
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
										items: [{value: "Plugins"}, {value: BDFDB.LanguageUtils.LanguageStrings.SETTINGS}],
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
	
		return class PluginRepo extends Plugin {
			onLoad () {
				_this = this;
				
				loading = {is: false, timeout: null, amount: 0};

				cachedPlugins = [];
				grabbedPlugins = [];
				searchString = "";

				this.defaults = {
					general: {
						notifyOutdated:		{value: true, 	autoload: false,	description: "Get a Notification when one of your Plugins is outdated"},
						notifyNewEntries:	{value: true, 	autoload: false,	description: "Get a Notification when there are new Entries in the Repo"},
						startDownloaded:	{value: false, 	autoload: true,		description: "Start new Plugins after Download"},
						startUpdated:		{value: false, 	autoload: true,		description: "Start updated Plugins after Download"}
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
						StandardSidebarView: "default"
					}
				};
				
			}
			
			onStart () {				
				this.forceUpdateAll();

				this.loadPlugins();

				updateInterval = BDFDB.TimeUtils.interval(_ => this.checkForNewPlugins(), 1000*60*30);
			}
			
			onStop () {
				BDFDB.TimeUtils.clear(updateInterval);
				BDFDB.TimeUtils.clear(loading.timeout);

				this.forceUpdateAll();

				BDFDB.DOMUtils.remove(BDFDB.dotCN._pluginreponotice, BDFDB.dotCN._pluginrepoloadingicon);
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
						label: "Plugin Repo",
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "repo"),
						action: _ => {
							BDFDB.LibraryModules.UserSettingsUtils.open("pluginrepo");
						}
					}));
				});
			}
			
			processSettingsView (e) {
				if (e.node) searchString = "";
				else {
					if (!BDFDB.PatchUtils.isPatched(this, e.component, "getPredicateSections")) BDFDB.PatchUtils.patch(this, e.component, "getPredicateSections", {after: e2 => {
						if (BDFDB.ArrayUtils.is(e2.returnValue) && e2.returnValue.findIndex(n => n.section && (n.section.toLowerCase() == "changelog" || n.section == BDFDB.DiscordConstants.UserSettingsSections.CHANGE_LOG || n.section.toLowerCase() == "logout" || n.section == BDFDB.DiscordConstants.UserSettingsSections.LOGOUT))) {
							e2.returnValue = e2.returnValue.filter(n => n.section != "pluginrepo");
							let index = e2.returnValue.indexOf(e2.returnValue.find(n => n.section == "themes") || e2.returnValue.find(n => n.section == BDFDB.DiscordConstants.UserSettingsSections.DEVELOPER_OPTIONS) || e2.returnValue.find(n => n.section == BDFDB.DiscordConstants.UserSettingsSections.HYPESQUAD_ONLINE));
							if (index > -1) {
								e2.returnValue.splice(index + 1, 0, {
									className: "pluginrepo-tab",
									section: "pluginrepo",
									label: "Plugin Repo",
									element: _ => {
										let options = Object.assign({}, this.settings.filters);
										options.updated = options.updated && !showOnlyOutdated;
										options.outdated = options.outdated || showOnlyOutdated;
										options.downloadable = options.downloadable && !showOnlyOutdated;
										options.sortKey = forcedSort || Object.keys(sortKeys)[0];
										options.orderKey = forcedOrder || Object.keys(orderKeys)[0];
										
										return BDFDB.ReactUtils.createElement(RepoListComponent, options, true);
									}
								});
								if (!e2.returnValue.find(n => n.section == "plugins")) e2.returnValue.splice(index + 1, 0, {section: "DIVIDER"});
							}
						}
					}});
				}
			}
			
			processStandardSidebarView (e) {
				if (e.instance.props.section == "pluginrepo") {
					let content = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.settingswindowcontentregion]]});
					if (content) content.props.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._repolistwrapper, content.props.className);
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.settingswindowcontentregionscroller]]});
					if (index > -1) {
						let options = {};
						options.sortKey = forcedSort || Object.keys(sortKeys)[0];
						options.orderKey = forcedOrder || Object.keys(orderKeys)[0];
						children[index] = [
							BDFDB.ReactUtils.createElement(RepoListHeaderComponent, options, true),
							children[index]
						];
					}
				}
			}

			loadPlugins () {
				BDFDB.DOMUtils.remove(BDFDB.dotCN._pluginrepoloadingicon);
				cachedPlugins = BDFDB.DataUtils.load(this, "cached");
				cachedPlugins = (typeof cachedPlugins == "string" ? cachedPlugins.split(" ") : []).map(n => parseInt(n)).filter(n => !isNaN(n));
				
				let loadingIcon;
				let newEntries = 0, outdatedEntries = 0, checkIndex = 0, checksRunning = 0, callbackCalled = false;
				
				const checkPlugin = _ => {
					if (checksRunning > 20) return;
					else if (grabbedPlugins.every(p => p.loaded || (!p.latestSourceUrl && !p.latest_source_url)) || !this.started || !loading.is) {
						if (!callbackCalled) {
							callbackCalled = true;
							if (!this.started) return BDFDB.TimeUtils.clear(loading.timeout);
							BDFDB.TimeUtils.clear(loading.timeout);
							BDFDB.DOMUtils.remove(loadingIcon, BDFDB.dotCN._pluginrepoloadingicon);
							loading = {is: false, timeout: null, amount: loading.amount};
							
							BDFDB.LogUtils.log("Finished fetching Plugins", this);
							BDFDB.ReactUtils.forceUpdate(list);
							
							if (this.settings.general.notifyOutdated && outdatedEntries > 0) {
								let notice = document.querySelector(BDFDB.dotCN._pluginrepooutdatednotice);
								if (notice) notice.close();
								BDFDB.NotificationUtils.notice(this.labels.notice_outdated_plugins.replace("{{var0}}", outdatedEntries), {
									type: "danger",
									className: BDFDB.disCNS._pluginreponotice + BDFDB.disCN._pluginrepooutdatednotice,
									customIcon: pluginRepoIcon.replace(/COLOR_[0-9]+/gi, "currentColor"),
									buttons: [{
										contents: BDFDB.LanguageUtils.LanguageStrings.OPEN,
										close: true,
										onClick: _ => {
											showOnlyOutdated = true;
											BDFDB.LibraryModules.UserSettingsUtils.open("pluginrepo");
										}
									}]
								});
							}
							
							if (this.settings.general.notifyNewEntries && newEntries > 0) {
								let notice = document.querySelector(BDFDB.dotCN._pluginreponewentriesnotice);
								if (notice) notice.close();
								BDFDB.NotificationUtils.notice(this.labels.notice_new_plugins.replace("{{var0}}", newEntries), {
									type: "success",
									className: BDFDB.disCNS._pluginreponotice + BDFDB.disCN._pluginreponewentriesnotice,
									customIcon: pluginRepoIcon.replace(/COLOR_[0-9]+/gi, "currentColor"),
									buttons: [{
										contents: BDFDB.LanguageUtils.LanguageStrings.OPEN,
										close: true,
										onClick: _ => {
											forcedSort = "RELEASEDATE";
											forcedOrder = "ASC";
											BDFDB.LibraryModules.UserSettingsUtils.open("pluginrepo");
										}
									}]
								});
							}
						}
						return;
					}
					else if (checkIndex > grabbedPlugins.length) return;
					
					const plugin = grabbedPlugins[checkIndex++];
					if (!plugin || (!plugin.latestSourceUrl && !plugin.latest_source_url)) checkPlugin();
					else {
						checksRunning++;
						plugin.releasedate = new Date(plugin.releaseDate || plugin.release_date || 0).getTime();
						plugin.latestSourceUrl = plugin.latestSourceUrl || plugin.latest_source_url;
						plugin.rawSourceUrl = plugin.latestSourceUrl.replace("https://github.com/", "https://raw.githubusercontent.com/").replace(/\/blob\/(.{32,})/i, "/$1");
						plugin.thumbnailUrl = plugin.thumbnailUrl || plugin.thumbnail_url;
						plugin.thumbnailUrl = plugin.thumbnailUrl ? (plugin.thumbnailUrl.startsWith("https://") ? plugin.thumbnailUrl : `https://betterdiscord.app${plugin.thumbnailUrl}`) : "";
						delete plugin.release_date;
						delete plugin.latest_source_url;
						delete plugin.thumbnail_url;
						BDFDB.LibraryRequires.request(plugin.rawSourceUrl, (error, response, body) => {
							if (body && body.indexOf("404: Not Found") != 0 && response.statusCode == 200) {
								plugin.name = BDFDB.StringUtils.upperCaseFirstChar((/@name\s+([^\t^\r^\n]+)|\/\/\**META.*["']name["']\s*:\s*["'](.+?)["']/i.exec(body) || []).filter(n => n)[1] || plugin.name || "");
								plugin.authorname = (/@author\s+(.+)|\/\/\**META.*["']author["']\s*:\s*["'](.+?)["']/i.exec(body) || []).filter(n => n)[1] || plugin.author.display_name || plugin.author;
								const version = (/@version\s+(.+)|\/\/\**META.*["']version["']\s*:\s*["'](.+?)["']/i.exec(body) || []).filter(n => n)[1];
								if (version) {
									plugin.version = version;
									const installedPlugin = this.getInstalledPlugin(plugin);
									if (installedPlugin && this.compareVersions(version, this.getString(installedPlugin.version))) outdatedEntries++;
								}
							}
							if (!cachedPlugins.includes(plugin.id)) newEntries++;
							
							plugin.loaded = true;
							
							let loadingTooltip = document.querySelector(BDFDB.dotCN._pluginrepoloadingtooltip);
							if (loadingTooltip) loadingTooltip.update(this.getLoadingTooltipText());
							
							checksRunning--;
							checkPlugin();
						});
					}
				};
				
				BDFDB.LibraryRequires.request("https://api.betterdiscord.app/v1/store/plugins", (error, response, body) => {
					if (!error && body && response.statusCode == 200) try {
						grabbedPlugins = BDFDB.ArrayUtils.keySort(JSON.parse(body).filter(n => n), "name");
						BDFDB.DataUtils.save(BDFDB.ArrayUtils.numSort(grabbedPlugins.map(n => n.id)).join(" "), this, "cached");
						
						loading = {is: true, timeout: BDFDB.TimeUtils.timeout(_ => {
							BDFDB.TimeUtils.clear(loading.timeout);
							if (this.started) {
								if (loading.is && loading.amount < 4) BDFDB.TimeUtils.timeout(_ => this.loadPlugins(), 10000);
								loading = {is: false, timeout: null, amount: loading.amount};
							}
						}, 1200000), amount: loading.amount + 1};
						
						loadingIcon = BDFDB.DOMUtils.create(pluginRepoIcon.replace(/COLOR_1/gi, "var(--bdfdb-blurple)").replace(/COLOR_2/gi, "#72767d"));
						BDFDB.DOMUtils.addClass(loadingIcon, BDFDB.disCN._pluginrepoloadingicon);
						loadingIcon.addEventListener("mouseenter", _ => {
							BDFDB.TooltipUtils.create(loadingIcon, this.getLoadingTooltipText(), {
								type: "left",
								className: BDFDB.disCN._pluginrepoloadingtooltip,
								delay: 500,
								style: "max-width: unset;"
							});
						});
						BDFDB.PluginUtils.addLoadingIcon(loadingIcon);
						
						BDFDB.ReactUtils.forceUpdate(list, header);
						
						for (let i = 0; i <= 20; i++) checkPlugin();
					}
					catch (err) {BDFDB.NotificationUtils.toast("Failed to load Plugin Store", {type: "danger"});}
					if (response && response.statusCode == 403) BDFDB.NotificationUtils.toast("Failed to fetch Plugin Store from the Website Api due to DDoS Protection", {type: "danger"});
					else if (response && response.statusCode == 404) BDFDB.NotificationUtils.toast("Failed to fetch Plugin Store from the Website Api due to Connection Issue", {type: "danger"});
				});
			}

			getLoadingTooltipText () {
				return BDFDB.LanguageUtils.LibraryStringsFormat("loading", `Plugin Repo - [${grabbedPlugins.filter(n => n.loaded).length}/${grabbedPlugins.length}]`);
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
			
			getInstalledPlugin (plugin) {
				if (!plugin || typeof plugin.authorname != "string") return;
				const iPlugin = BDFDB.BDUtils.getPlugin(plugin.name, false, true);
				if (iPlugin && plugin.authorname.toUpperCase() == this.getString(iPlugin.author).toUpperCase()) return iPlugin;
				else if (plugin.rawSourceUrl && window.BdApi && BdApi.Plugins && typeof BdApi.Plugins.getAll == "function") {
					const filename = plugin.rawSourceUrl.split("/").pop();
					for (let p of BdApi.Plugins.getAll()) if (p.filename == filename && plugin.authorname.toUpperCase() == this.getString(p.author).toUpperCase()) return p;
				}
			}

			checkForNewPlugins () {
				BDFDB.LibraryRequires.request("https://api.betterdiscord.app/v1/store/plugins", (error, response, body) => {
					if (!error && body) try {
						if (JSON.parse(body).filter(n => n).length != grabbedPlugins.length) {
							loading = {is: false, timeout: null, amount: 0};
							this.loadPlugins();
						}
					}
					catch (err) {BDFDB.NotificationUtils.toast("Failed to load Plugin Store", {type: "danger"});}
				});
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							list:								"Списък",
							notice_failed_plugins:				"Някои Plugins [{{var0}}] не можаха да бъдат заредени",
							notice_new_plugins:					"Новите Plugins [{{var0}}] бяха добавени към Plugin Repo",
							notice_outdated_plugins:			"Някои Plugins [{{var0}}] са остарели"
						};
					case "da":		// Danish
						return {
							list:								"Liste",
							notice_failed_plugins:				"Nogle Plugins [{{var0}}] kunne ikke indlæses",
							notice_new_plugins:					"Nye Plugins [{{var0}}] er blevet føjet til Plugin Repo",
							notice_outdated_plugins:			"Nogle Plugins [{{var0}}] er forældede"
						};
					case "de":		// German
						return {
							list:								"Liste",
							notice_failed_plugins:				"Einige Plugins [{{var0}}] konnten nicht geladen werden",
							notice_new_plugins:					"Neue Plugins [{{var0}}] wurden zur Plugin Repo hinzugefügt",
							notice_outdated_plugins:			"Einige Plugins [{{var0}}] sind veraltet"
						};
					case "el":		// Greek
						return {
							list:								"Λίστα",
							notice_failed_plugins:				"Δεν ήταν δυνατή η φόρτωση ορισμένων Plugins [{{var0}}] ",
							notice_new_plugins:					"Προστέθηκαν νέα Plugins [{{var0}}] στο Plugin Repo",
							notice_outdated_plugins:			"Ορισμένα Plugins [{{var0}}] είναι παλιά"
						};
					case "es":		// Spanish
						return {
							list:								"Lista",
							notice_failed_plugins:				"Algunos Plugins [{{var0}}] no se pudieron cargar",
							notice_new_plugins:					"Se han agregado nuevos Plugins [{{var0}}] a Plugin Repo",
							notice_outdated_plugins:			"Algunas Plugins [{{var0}}] están desactualizadas"
						};
					case "fi":		// Finnish
						return {
							list:								"Lista",
							notice_failed_plugins:				"Joitain kohdetta Plugins [{{var0}}] ei voitu ladata",
							notice_new_plugins:					"Uusi Plugins [{{var0}}] on lisätty Plugin Repo",
							notice_outdated_plugins:			"Jotkut Plugins [{{var0}}] ovat vanhentuneita"
						};
					case "fr":		// French
						return {
							list:								"Liste",
							notice_failed_plugins:				"Certains Plugins [{{var0}}] n'ont pas pu être chargés",
							notice_new_plugins:					"De nouveaux Plugins [{{var0}}] ont été ajoutés à Plugin Repo",
							notice_outdated_plugins:			"Certains Plugins [{{var0}}] sont obsolètes"
						};
					case "hr":		// Croatian
						return {
							list:								"Popis",
							notice_failed_plugins:				"Neke datoteke Plugins [{{var0}}] nije moguće učitati",
							notice_new_plugins:					"Novi Plugins [{{var0}}] dodani su u Plugin Repo",
							notice_outdated_plugins:			"Neki su Plugins [{{var0}}] zastarjeli"
						};
					case "hu":		// Hungarian
						return {
							list:								"Lista",
							notice_failed_plugins:				"Néhány Plugins [{{var0}}] nem sikerült betölteni",
							notice_new_plugins:					"Új Plugins [{{var0}}] hozzáadva a következőhöz: Plugin Repo",
							notice_outdated_plugins:			"Néhány Plugins [{{var0}}] elavult"
						};
					case "it":		// Italian
						return {
							list:								"Elenco",
							notice_failed_plugins:				"Impossibile caricare alcuni Plugins [{{var0}}] ",
							notice_new_plugins:					"Il nuovo Plugins [{{var0}}] è stato aggiunto a Plugin Repo",
							notice_outdated_plugins:			"Alcuni Plugins [{{var0}}] non sono aggiornati"
						};
					case "ja":		// Japanese
						return {
							list:								"リスト",
							notice_failed_plugins:				"一部の Plugins [{{var0}}] を読み込めませんでした",
							notice_new_plugins:					"新しい Plugins [{{var0}}] が Plugin Repo に追加されました",
							notice_outdated_plugins:			"一部の Plugins [{{var0}}] は古くなっています"
						};
					case "ko":		// Korean
						return {
							list:								"명부",
							notice_failed_plugins:				"일부 Plugins [{{var0}}] 을 (를)로드 할 수 없습니다.",
							notice_new_plugins:					"새 Plugins [{{var0}}] 이 Plugin Repo 에 추가되었습니다.",
							notice_outdated_plugins:			"일부 Plugins [{{var0}}] 이 오래되었습니다."
						};
					case "lt":		// Lithuanian
						return {
							list:								"Sąrašas",
							notice_failed_plugins:				"Kai kurių Plugins [{{var0}}] nepavyko įkelti",
							notice_new_plugins:					"Naujas Plugins [{{var0}}] pridėtas prie Plugin Repo",
							notice_outdated_plugins:			"Kai kurie Plugins [{{var0}}] yra pasenę"
						};
					case "nl":		// Dutch
						return {
							list:								"Lijst",
							notice_failed_plugins:				"Sommige Plugins [{{var0}}] konden niet worden geladen",
							notice_new_plugins:					"Nieuwe Plugins [{{var0}}] zijn toegevoegd aan de Plugin Repo",
							notice_outdated_plugins:			"Sommige Plugins [{{var0}}] zijn verouderd"
						};
					case "no":		// Norwegian
						return {
							list:								"Liste",
							notice_failed_plugins:				"Noen Plugins [{{var0}}] kunne ikke lastes inn",
							notice_new_plugins:					"Nye Plugins [{{var0}}] er lagt til i Plugin Repo",
							notice_outdated_plugins:			"Noen Plugins [{{var0}}] er utdaterte"
						};
					case "pl":		// Polish
						return {
							list:								"Lista",
							notice_failed_plugins:				"Nie można załadować niektórych Plugins [{{var0}}] ",
							notice_new_plugins:					"Nowe Plugins [{{var0}}] zostały dodane do Plugin Repo",
							notice_outdated_plugins:			"Niektóre Plugins [{{var0}}] są nieaktualne"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							list:								"Lista",
							notice_failed_plugins:				"Algum Plugins [{{var0}}] não pôde ser carregado",
							notice_new_plugins:					"Novo Plugins [{{var0}}] foi adicionado ao Plugin Repo",
							notice_outdated_plugins:			"Alguns Plugins [{{var0}}] estão desatualizados"
						};
					case "ro":		// Romanian
						return {
							list:								"Listă",
							notice_failed_plugins:				"Unele Plugins [{{var0}}] nu au putut fi încărcate",
							notice_new_plugins:					"Plugins [{{var0}}] nou au fost adăugate la Plugin Repo",
							notice_outdated_plugins:			"Unele Plugins [{{var0}}] sunt învechite"
						};
					case "ru":		// Russian
						return {
							list:								"Список",
							notice_failed_plugins:				"Не удалось загрузить некоторые Plugins [{{var0}}] ",
							notice_new_plugins:					"Новые Plugins [{{var0}}] добавлены в Plugin Repo",
							notice_outdated_plugins:			"Некоторые Plugins [{{var0}}] устарели"
						};
					case "sv":		// Swedish
						return {
							list:								"Lista",
							notice_failed_plugins:				"Vissa Plugins [{{var0}}] kunde inte laddas",
							notice_new_plugins:					"Nya Plugins [{{var0}}] har lagts till i Plugin Repo",
							notice_outdated_plugins:			"Vissa Plugins [{{var0}}] är föråldrade"
						};
					case "th":		// Thai
						return {
							list:								"รายการ",
							notice_failed_plugins:				"ไม่สามารถโหลด Plugins [{{var0}}] บางรายการได้",
							notice_new_plugins:					"เพิ่ม Plugins [{{var0}}] ใหม่ใน Plugin Repo แล้ว",
							notice_outdated_plugins:			"Plugins [{{var0}}] บางรายการล้าสมัย"
						};
					case "tr":		// Turkish
						return {
							list:								"Liste",
							notice_failed_plugins:				"Bazı Plugins [{{var0}}] yüklenemedi",
							notice_new_plugins:					"Yeni Plugins [{{var0}}], Plugin Repo 'ye eklendi",
							notice_outdated_plugins:			"Bazı Plugins [{{var0}}] güncel değil"
						};
					case "uk":		// Ukrainian
						return {
							list:								"Список",
							notice_failed_plugins:				"Деякі Plugins [{{var0}}] не вдалося завантажити",
							notice_new_plugins:					"Нові Plugins [{{var0}}] були додані до Plugin Repo",
							notice_outdated_plugins:			"Деякі Plugins [{{var0}}] застарілі"
						};
					case "vi":		// Vietnamese
						return {
							list:								"Danh sách",
							notice_failed_plugins:				"Không thể tải một số Plugins [{{var0}}] ",
							notice_new_plugins:					"Plugins [{{var0}}] mới đã được thêm vào Plugin Repo",
							notice_outdated_plugins:			"Một số Plugins [{{var0}}] đã lỗi thời"
						};
					case "zh-CN":	// Chinese (China)
						return {
							list:								"清单",
							notice_failed_plugins:				"某些 Plugins [{{var0}}] 无法加载",
							notice_new_plugins:					"新的 Plugins [{{var0}}] 已添加到 Plugin Repo",
							notice_outdated_plugins:			"一些 Plugins [{{var0}}] 已过时"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							list:								"清單",
							notice_failed_plugins:				"某些 Plugins [{{var0}}] 無法加載",
							notice_new_plugins:					"新的 Plugins [{{var0}}] 已添加到 Plugin Repo",
							notice_outdated_plugins:			"一些 Plugins [{{var0}}] 已過時"
						};
					default:		// English
						return {
							list:								"List",
							notice_failed_plugins:				"Some Plugins [{{var0}}] could not be loaded",
							notice_new_plugins:					"New Plugins [{{var0}}] have been added to the Plugin Repo",
							notice_outdated_plugins:			"Some Plugins [{{var0}}] are outdated"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
