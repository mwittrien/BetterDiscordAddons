/**
 * @name SpotifyControls
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SpotifyControls
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SpotifyControls/SpotifyControls.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SpotifyControls/SpotifyControls.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "SpotifyControls",
			"author": "DevilBro",
			"version": "1.0.8",
			"description": "Add a control panel to discord when listening to spotify"
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
		var _this;
		var insertPatchCancel;
		var controls, starting, lastSong, currentVolume, lastVolume, stopTime, previousIsClicked, previousDoubleTimeout, timelineTimeout, timelineDragging, updateInterval;
		var playbackState = {};
		var settings = {}, buttonConfigs = {};
		
		const repeatStates = [
			"off",
			"context",
			"track"
		];
	
		const SpotifyControlsComponent = class SpotifyControls extends BdApi.React.Component {
			componentDidMount() {
				controls = this;
			}
			request(socket, device, type, data) {
				return new Promise(callback => {
					let method = "PUT";
					switch (type) {
						case "next":
						case "previous":
							method = "POST";
							break;
						case "get":
							type = "";
							method = "GET";
							break;
					};
					BDFDB.LibraryRequires.request({
						url: `https://api.spotify.com/v1/me/player${type ? "/" + type : ""}${Object.entries(Object.assign({}, data)).map(n => `?${n[0]}=${n[1]}`).join("")}`,
						method: method,
						headers: {
							authorization: `Bearer ${socket.accessToken}`
						}
					}, (error, response, result) => {
						if (response && response.statusCode == 401) {
							BDFDB.LibraryModules.SpotifyUtils.getAccessToken(socket.accountId).then(promiseResult => {
								let newSocketDevice = BDFDB.LibraryModules.SpotifyTrackUtils.getActiveSocketAndDevice();
								this.request(newSocketDevice.socket, newSocketDevice.device, type, data).then(_ => {
									try {callback(JSON.parse(result));}
									catch (err) {callback({});}
								});
							});
						}
						else {
							try {callback(JSON.parse(result));}
							catch (err) {callback({});}
						}
					});
				});
			}
			render() {
				let socketDevice = BDFDB.LibraryModules.SpotifyTrackUtils.getActiveSocketAndDevice();
				if (!socketDevice) return null;
				if (this.props.song) {
					playbackState.is_playing = true;
					let fetchState = !BDFDB.equals(this.props.song, lastSong);
					lastSong = this.props.song;
					stopTime = null;
					if (fetchState) this.request(socketDevice.socket, socketDevice.device, "get").then(response => {
						playbackState = Object.assign({}, response);
						BDFDB.ReactUtils.forceUpdate(this);
					});
				}
				else if (!stopTime && lastSong) {
					playbackState.is_playing = false;
					stopTime = new Date();
				}
				if (!lastSong) return null;
				currentVolume = socketDevice.device.volume_percent;
				let playerSize = this.props.maximized ? "big" : "small";
				return BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._spotifycontrolscontainer, this.props.maximized && BDFDB.disCN._spotifycontrolscontainermaximized, this.props.timeline && BDFDB.disCN._spotifycontrolscontainerwithtimeline),
					children: [
						BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._spotifycontrolscontainerinner,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
									className: BDFDB.disCN._spotifycontrolscoverwrapper,
									onClick: _ => {
										this.props.maximized = !this.props.maximized;
										BDFDB.DataUtils.save(this.props.maximized, _this, "playerState", "maximized");
										if (this.props.maximized) this.request(socketDevice.socket, socketDevice.device, "get").then(response => {
											playbackState = Object.assign({}, response);
											BDFDB.ReactUtils.forceUpdate(this);
										});
										else BDFDB.ReactUtils.forceUpdate(this);
									},
									children: [
										BDFDB.ReactUtils.createElement("img", {
											className: BDFDB.disCN._spotifycontrolscover,
											src: BDFDB.LibraryModules.AssetUtils.getAssetImage(lastSong.application_id, lastSong.assets.large_image)
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
											className: BDFDB.disCN._spotifycontrolscovermaximizer,
											name: BDFDB.LibraryComponents.SvgIcon.Names.LEFT_CARET
										})
									]
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN._spotifycontrolsdetails,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
											className: BDFDB.disCN._spotifycontrolssong,
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
												children: lastSong.details
											})
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
											className: BDFDB.disCNS.subtext + BDFDB.disCN._spotifycontrolsinterpret,
											color: BDFDB.LibraryComponents.TextElement.Colors.CUSTOM,
											size: BDFDB.LibraryComponents.TextElement.Sizes.SIZE_12,
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
												children: BDFDB.LanguageUtils.LanguageStringsFormat("USER_ACTIVITY_LISTENING_ARTISTS", lastSong.state)
											})
										})
									]
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
									text: socketDevice.device.is_restricted ? "Can not control Spotify while playing on restricted device" : null,
									tooltipConfig: {color: "red"},
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
										grow: 0,
										children: [
											BDFDB.ReactUtils.createElement(SpotifyControlsButtonComponent, {
												type: "share",
												playerSize: playerSize,
												style: this.props.maximized ? {marginRight: 4} : {},
												onClick: _ => {
													let url = BDFDB.ObjectUtils.get(playbackState, "item.external_urls.spotify") || BDFDB.ObjectUtils.get(playbackState, "context.external_urls.spotify");
													if (url) {
														BDFDB.LibraryRequires.electron.clipboard.write({text: url});
														BDFDB.NotificationUtils.toast("Song URL was copied to clipboard", {type: "success"});
													}
													else BDFDB.NotificationUtils.toast("Could not copy song URL to clipboard", {type: "error"});
												}
											}),
											BDFDB.ReactUtils.createElement(SpotifyControlsButtonComponent, {
												type: "shuffle",
												playerSize: playerSize,
												active: playbackState.shuffle_state,
												disabled: socketDevice.device.is_restricted,
												onClick: _ => {
													playbackState.shuffle_state = !playbackState.shuffle_state;
													this.request(socketDevice.socket, socketDevice.device, "shuffle", {
														state: playbackState.shuffle_state
													});
													BDFDB.ReactUtils.forceUpdate(this);
												}
											}),
											BDFDB.ReactUtils.createElement(SpotifyControlsButtonComponent, {
												type: "previous",
												playerSize: playerSize,
												disabled: socketDevice.device.is_restricted,
												onClick: _ => {
													if (previousIsClicked) {
														previousIsClicked = false;
														this.request(socketDevice.socket, socketDevice.device, "previous");
													}
													else {
														previousIsClicked = true;
														previousDoubleTimeout = BDFDB.TimeUtils.timeout(_ => {
															previousIsClicked = false;
															this.request(socketDevice.socket, socketDevice.device, "seek", {
																position_ms: 0
															});
														}, 300);
													}
												}
											}),
											BDFDB.ReactUtils.createElement(SpotifyControlsButtonComponent, {
												type: "pauseplay",
												playerSize: playerSize,
												icon: this.props.song ? 0 : 1,
												disabled: socketDevice.device.is_restricted,
												onClick: _ => {
													if (this.props.song) {
														playbackState.is_playing = false;
														this.request(socketDevice.socket, socketDevice.device, "pause");
													}
													else {
														playbackState.is_playing = true;
														this.request(socketDevice.socket, socketDevice.device, "play");
													}
												}
											}),
											BDFDB.ReactUtils.createElement(SpotifyControlsButtonComponent, {
												type: "next",
												playerSize: playerSize,
												disabled: socketDevice.device.is_restricted,
												onClick: _ => {
													this.request(socketDevice.socket, socketDevice.device, "next");
												}
											}),
											BDFDB.ReactUtils.createElement(SpotifyControlsButtonComponent, {
												type: "repeat",
												playerSize: playerSize,
												icon: playbackState.repeat_state != repeatStates[2] ? 0 : 1,
												active: playbackState.repeat_state != repeatStates[0],
												disabled: socketDevice.device.is_restricted,
												onClick: _ => {
													playbackState.repeat_state = repeatStates[repeatStates.indexOf(playbackState.repeat_state) + 1] || repeatStates[0];
													this.request(socketDevice.socket, socketDevice.device, "repeat", {
														state: playbackState.repeat_state
													});
													BDFDB.ReactUtils.forceUpdate(this);
												}
											}),
											BDFDB.ReactUtils.createElement(SpotifyControlsButtonComponent, {
												type: "volume",
												playerSize: playerSize,
												icon: Math.ceil(currentVolume/34),
												disabled: socketDevice.device.is_restricted,
												style: this.props.maximized ? {marginLeft: 4} : {},
												onContextMenu: _ => {
													if (currentVolume == 0) {
														if (lastVolume) this.request(socketDevice.socket, socketDevice.device, "volume", {
															volume_percent: lastVolume
														});
													}
													else {
														lastVolume = currentVolume;
														this.request(socketDevice.socket, socketDevice.device, "volume", {
															volume_percent: 0
														});
													}
												},
												renderPopout: instance => {
													return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Slider, {
														className: BDFDB.disCN._spotifycontrolsvolumeslider,
														defaultValue: currentVolume,
														digits: 0,
														barStyles: {height: 6, top: 3},
														fillStyles: {backgroundColor: BDFDB.DiscordConstants.Colors.SPOTIFY},
														onValueRender: value => {
															return value + "%";
														},
														onValueChange: value => {
															currentVolume = value;
															this.request(socketDevice.socket, socketDevice.device, "volume", {
																volume_percent: currentVolume
															});
														}
													});
												}
											})
										].filter(n => n)
									})
								})
							]
						}),
						this.props.timeline && BDFDB.ReactUtils.createElement(SpotifyControlsTimelineComponent, {
							song: lastSong,
							socket: socketDevice.socket,
							device: socketDevice.device,
							controls: this
						})
					].filter(n => n)
				});
			}
		};
		const SpotifyControlsButtonComponent = class SpotifyControlsButton extends BdApi.React.Component {
			render() {
				if (!this.props.playerSize || !buttonConfigs[this.props.type] || !buttonConfigs[this.props.type][this.props.playerSize]) return null;
				let button = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, BDFDB.ObjectUtils.exclude(Object.assign({}, this.props, {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.accountinfobutton, this.props.disabled ? BDFDB.disCN.accountinfobuttondisabled : BDFDB.disCN.accountinfobuttonenabled, this.props.active && BDFDB.disCN._spotifycontrolsbuttonactive),
					look: BDFDB.LibraryComponents.Button.Looks.BLANK,
					size: BDFDB.LibraryComponents.Button.Sizes.NONE,
					children: _this.defaults.buttonConfigs[this.props.type] && _this.defaults.buttonConfigs[this.props.type].icons ? (_this.defaults.buttonConfigs[this.props.type].icons[this.props.icon] || _this.defaults.buttonConfigs[this.props.type].icons[0]) : "?",
					onClick: this.props.disabled ? _ => {} : this.props.onClick,
					onContextMenu: this.props.disabled ? _ => {} : this.props.onContextMenu,
				}), "active", "disabled", "renderPopout", "icon", "type", "playerSize"));
				return !this.props.disabled && typeof this.props.renderPopout == "function" ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PopoutContainer, {
					children: button,
					animation: BDFDB.LibraryComponents.PopoutContainer.Animation.SCALE,
					position: BDFDB.LibraryComponents.PopoutContainer.Positions.TOP,
					align: BDFDB.LibraryComponents.PopoutContainer.Align.CENTER,
					arrow: true,
					shadow: true,
					renderPopout: this.props.renderPopout
				}) : button;
	}
		};
		const SpotifyControlsTimelineComponent = class SpotifyControlsTimeline extends BdApi.React.Component {
			componentDidMount() {
				BDFDB.TimeUtils.clear(updateInterval);
				updateInterval = BDFDB.TimeUtils.interval(_ => {
					if (!this.updater || typeof this.updater.isMounted != "function" || !this.updater.isMounted(this)) BDFDB.TimeUtils.clear(updateInterval);
					else if (playbackState.is_playing) {
						let song = BDFDB.LibraryModules.SpotifyTrackUtils.getActivity(false);
						if (!song) BDFDB.ReactUtils.forceUpdate(controls);
						else if (playbackState.is_playing) BDFDB.ReactUtils.forceUpdate(this);
					}
				}, 1000);
			}
			formatTime(time) {
				let seconds = Math.floor((time / 1000) % 60);
				let minutes = Math.floor((time / (1000 * 60)) % 60);
				let hours = Math.floor((time / (1000 * 60 * 60)) % 24);
				return `${hours > 0 ? hours + ":" : ""}${hours > 0 && minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`
			}
			render() {
				let maxTime = this.props.song.timestamps.end - this.props.song.timestamps.start;
				let currentTime = (!playbackState.is_playing && stopTime ? stopTime : new Date()) - this.props.song.timestamps.start;
				currentTime = currentTime > maxTime ? maxTime : currentTime;
				return BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN._spotifycontrolstimeline,
					children: [
						BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._spotifycontrolsbar,
							children: [
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN._spotifycontrolsbarfill,
									style: {width: `${currentTime / maxTime * 100}%`}
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN._spotifycontrolsbargrabber,
									style: {left: `${currentTime / maxTime * 100}%`}
								})
							],
							onClick: event => {
								let rects = BDFDB.DOMUtils.getRects(BDFDB.DOMUtils.getParent(BDFDB.dotCN._spotifycontrolsbar, event.target));
								this.props.controls.request(this.props.socket, this.props.device, "seek", {
									position_ms: Math.round(BDFDB.NumberUtils.mapRange([rects.left, rects.left + rects.width], [0, maxTime], event.clientX))
								});
							}
						}),
						BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._spotifycontrolsbartext,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
									className: BDFDB.disCN.height12,
									size: BDFDB.LibraryComponents.TextElement.Sizes.SIZE_12,
									children: this.formatTime(currentTime)
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
									className: BDFDB.disCN.height12,
									size: BDFDB.LibraryComponents.TextElement.Sizes.SIZE_12,
									children: this.formatTime(maxTime)
								})
							]
						})
					]
				});
			}
		};
	
		return class SpotifyControls extends Plugin {
			onLoad() {
				_this = this;
				
				this.defaults = {
					settings: {
						addTimeline: 		{value: true,		description: "Show the song timeline in the controls"}
					},
					buttonConfigs: {
						share: 				{value: {small: false, big: true},		icons: [""],						description: "Share"},
						shuffle: 			{value: {small: false, big: true},		icons: [""],						description: "Shuffle"},
						previous: 			{value: {small: true, big: true},		icons: [""],						description: "Previous"},
						pauseplay: 			{value: {small: true, big: true},		icons: ["", ""],					description: "Pause/Play"},
						next: 				{value: {small: true, big: true},		icons: [""],						description: "Next"},
						repeat: 			{value: {small: false, big: true},		icons: ["", ""],					description: "Repeat"},
						volume: 			{value: {small: false, big: true},		icons: ["", "", "", ""],		description: "Volume"}
					}
				};
				
				this.patchedModules = {
					before: {
						AppView: "render"
					}
				};
				
				
				this.css = `
					@font-face {
						font-family: glue1-spoticon;
						src: url("https://mwittrien.github.io/BetterDiscordAddons/Plugins/SpotifyControls/_res/spoticon.ttf") format("truetype");
						font-weight: 400;
						font-style: normal
					}
					${BDFDB.dotCN._spotifycontrolscontainer} {
						display: flex;
						flex-direction: column;
						justify-content: center;
						min-height: 52px;
						margin-bottom: 1px;
						border-bottom: 1px solid var(--background-modifier-accent);
						padding: 0 8px;
						box-sizing: border-box;
					}
					${BDFDB.dotCN._spotifycontrolscontainer + BDFDB.dotCN._spotifycontrolscontainerwithtimeline} {
						padding-top: 8px;
					}
					${BDFDB.dotCN._spotifycontrolscontainerinner} {
						display: flex;
						align-items: center;
						font-size: 14px;
						width: 100%;
					}
					${BDFDB.dotCN._spotifycontrolstimeline} {
						margin: 6px 0 4px 0;
					}
					${BDFDB.dotCN._spotifycontrolsbar} {
						position: relative;
						border-radius: 2px;
						background-color: rgba(79, 84, 92, 0.16);
						height: 4px;
						margin-bottom: 4px;
					}
					${BDFDB.dotCN._spotifycontrolsbarfill} {
						border-radius: 2px;
						height: 100%;
						min-width: 4px;
						border-radius: 2px;
						background: var(--text-normal);
					}
					${BDFDB.dotCN._spotifycontrolstimeline}:hover ${BDFDB.dotCN._spotifycontrolsbarfill} {
						background: ${BDFDB.DiscordConstants.Colors.SPOTIFY};
					}
					${BDFDB.dotCN._spotifycontrolsbargrabber} {
						display: none;
						position: absolute;
						top: 0;
						left: 0;
						width: 8px;
						height: 8px;
						margin-top: -2px;
						margin-left: -2px;
						background: var(--text-normal);
						border-radius: 50%;
					}
					${BDFDB.dotCN._spotifycontrolstimeline}:hover ${BDFDB.dotCN._spotifycontrolsbargrabber} {
						display: block;
					}
					${BDFDB.dotCN._spotifycontrolsbartext} {
						display: flex;
						align-items: center;
						justify-content: space-between;
					}
					${BDFDB.dotCN._spotifycontrolscoverwrapper} {
						position: relative;
						width: 32px;
						min-width: 32px;
						height: 32px;
						min-height: 32px;
						margin-right: 8px;
						border-radius: 4px;
						overflow: hidden;
						transition: width .3s ease, height .3s ease;
					}
					${BDFDB.dotCN._spotifycontrolscover} {
						display: block;
						width: 100%;
						height: 100%;
						object-fit: cover;
					}
					${BDFDB.dotCN._spotifycontrolscovermaximizer} {
						visibility: hidden;
						position: absolute;
						background-color: rgba(0, 0, 0, 0.5);
						color: rgba(255, 255, 255, 0.5);
						top: 0;
						right: 0;
						border-radius: 50%;
						width: 12px;
						height: 12px;
						padding: 3px;
						transform: rotate(90deg);
						transition: width .3s ease, height .3s ease, transform .3s ease;
						pointer-events: none;
					}
					${BDFDB.dotCN._spotifycontrolscoverwrapper}:hover ${BDFDB.dotCN._spotifycontrolscovermaximizer} {
						visibility: visible;
					}
					${BDFDB.dotCN._spotifycontrolsdetails} {
						user-select: text;
						flex-grow: 1;
						margin-right: 4px;
						min-width: 0;
					}
					${BDFDB.dotCN._spotifycontrolssong} {
						font-weight: 500;
					}
					${BDFDB.dotCN._spotifycontrolsinterpret} {
						font-weight: 300;
					}
					${BDFDB.dotCN._spotifycontrolsvolumeslider} {
						height: 12px;
						width: 140px;
						margin: 5px;
					}
					${BDFDB.dotCNS._spotifycontrolsvolumeslider + BDFDB.dotCN.slidergrabber} {
						height: 10px;
						margin-top: -6px;
						border-radius: 50%;
					}
					${BDFDB.dotCNS._spotifycontrolscontainer + BDFDB.dotCN.accountinfobuttondisabled} {
						cursor: no-drop;
					}
					${BDFDB.dotCNS._spotifycontrolscontainer + BDFDB.dotCNS.accountinfobutton + BDFDB.dotCN.buttoncontents} {
						font-family: glue1-spoticon !important;
					}
					${BDFDB.dotCNS._spotifycontrolscontainer + BDFDB.dotCN.accountinfobutton + BDFDB.dotCN._spotifycontrolsbuttonactive} {
						color: ${BDFDB.DiscordConstants.Colors.SPOTIFY};
					}
					${BDFDB.dotCN._spotifycontrolscontainer + BDFDB.dotCN._spotifycontrolscontainermaximized} {
						padding-top: 0;
					}
					${BDFDB.dotCN._spotifycontrolscontainer + BDFDB.dotCNS._spotifycontrolscontainermaximized + BDFDB.dotCN._spotifycontrolscontainerinner} {
						flex-direction: column;
					}
					${BDFDB.dotCN._spotifycontrolscontainer + BDFDB.dotCNS._spotifycontrolscontainermaximized + BDFDB.dotCN._spotifycontrolsdetails} {
						margin: 0 0 4px 0;
						width: 100%;
						text-align: center;
					}
					${BDFDB.dotCN._spotifycontrolscontainer + BDFDB.dotCNS._spotifycontrolscontainermaximized + BDFDB.dotCN._spotifycontrolscoverwrapper} {
						width: calc(100% + 16px);
						height: 100%;
						margin: 0 0 8px 0;
						border-radius: 0;
					}
					${BDFDB.dotCN._spotifycontrolscontainer + BDFDB.dotCNS._spotifycontrolscontainermaximized + BDFDB.dotCN._spotifycontrolscovermaximizer} {
						top: 4px;
						right: 4px;
						width: 22px;
						height: 22px;
						padding: 5px;
						transform: rotate(-90deg);
					}
					${BDFDB.dotCN._spotifycontrolssettingsicon} {
						margin: 4px;
						font-size: 16px;
						font-family: glue1-spoticon !important;
					}
					${BDFDB.dotCN._spotifycontrolssettingslabel} {
						margin-left: 10px;
					}
				`;
			}
			
			onStart() {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SpotifyTrackUtils, "getActivity", {after: e => {
					if (e.methodArguments[0] !== false) {
						if (e.returnValue && e.returnValue.name == "Spotify") this.updatePlayer(e.returnValue);
						else if (!e.returnValue) this.updatePlayer(null);
					}
				}});

				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SpotifyTrackUtils, "wasAutoPaused", {instead: e => {
					return false;
				}});

				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SpotifyUtils, "pause", {instead: e => {
					return false;
				}});
				
				if (!BDFDB.LibraryModules.SpotifyTrackUtils.hasConnectedAccount()) BDFDB.ModalUtils.open(this, {
					size: "SMALL",
					header: this.name + ": Something is missing...",
					subheader: "You need to connect a Spotify account",
					text: "You are missing a connected Spotify account, without a connected account you won't be able to use Spotify Controls. To connect a Spotify account with your discord account click the button below.",
					buttons: [{
						contents: BDFDB.LanguageUtils.LanguageStrings.CONNECT,
						color: "BRAND",
						close: true,
						click: modal => {
							BDFDB.LibraryModules.UserSettingsUtils.open(BDFDB.DiscordConstants.UserSettingsSections.CONNECTIONS)
						}
					}]
				});
				
				this.forceUpdateAll();
			}
			
			onStop() {
				this.forceUpdateAll();
				
				if (typeof insertPatchCancel == "function") insertPatchCancel();
			}

			getSettingsPanel (collapseStates = {}) {
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
					title: "Button Settings",
					collapseStates: collapseStates,
					children: [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
						className: BDFDB.disCN.marginbottom4,
						tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H3,
						children: "Add control buttons in small and/or big player version: "
					})].concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsList, {
						settings: Object.keys(this.defaults.buttonConfigs[Object.keys(this.defaults.buttonConfigs)[0]].value),
						data: Object.keys(buttonConfigs).map(key => Object.assign({}, buttonConfigs[key], {
							key: key,
							label: this.defaults.buttonConfigs[key].description,
							icons: this.defaults.buttonConfigs[key].icons
						})),
						noRemove: true,
						renderLabel: data => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							align: BDFDB.LibraryComponents.Flex.Align.CENTER,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									justify: BDFDB.LibraryComponents.Flex.Justify.CENTER,
									wrap: BDFDB.LibraryComponents.Flex.Wrap.WRAP,
									basis: 50,
									grow: 0,
									children: data.icons.map(icon => BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN._spotifycontrolssettingsicon,
										children: icon
									}))
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN._spotifycontrolssettingslabel,
									children: data.label
								})
							]
						}),
						onCheckboxChange: (value, instance) => {
							buttonConfigs[instance.props.cardId][instance.props.settingId] = value;
							BDFDB.DataUtils.save(buttonConfigs, this, "buttonConfigs");
							this.SettingsUpdated = true;
						}
					}))
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
				buttonConfigs = BDFDB.DataUtils.get(this, "buttonConfigs");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processAppView (e) {
				if (typeof insertPatchCancel == "function") insertPatchCancel();
				insertPatchCancel = BDFDB.PatchUtils.patch(this, e.instance, "renderChannelSidebar", {after: e2 => {
					let [children, index] = BDFDB.ReactUtils.findParent(e2.returnValue, {props: [["section", BDFDB.DiscordConstants.AnalyticsSections.ACCOUNT_PANEL]]});
					if (index > -1) children.splice(index - 1, 0, BDFDB.ReactUtils.createElement(SpotifyControlsComponent, {
						song: BDFDB.LibraryModules.SpotifyTrackUtils.getActivity(false),
						maximized: BDFDB.DataUtils.load(this, "playerState", "maximized"),
						timeline: settings.addTimeline
					}, true));
				}}, {force: true, noCache: true});
			}
			
			updatePlayer (song) {
				if (controls) {
					controls.props.song = song;
					BDFDB.ReactUtils.forceUpdate(controls);
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();