//META{"name":"SpotifyControls","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SpotifyControls","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SpotifyControls/SpotifyControls.plugin.js"}*//

var SpotifyControls = (_ => {
	var _this;
	var controls, lastSong, currentVolume, lastVolume, stopTime, previousIsClicked, previousDoubleTimeout, timelineTimeout, timelineDragging, updateInterval;
	var playbackState = {};
	var settings = {};
	
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
					if (response.statusCode == 401) {
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
				let fetchState = this.props.maximized && !BDFDB.equals(this.props.song, lastSong);
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
										this.props.maximized && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.accountinfobutton, BDFDB.disCN.accountinfobuttonenabled),
											style: {marginRight: 4},
											look: BDFDB.LibraryComponents.Button.Looks.BLANK,
											size: BDFDB.LibraryComponents.Button.Sizes.NONE,
											children: "",
											onClick: _ => {
												let url = BDFDB.ReactUtils.getValue(playbackState, "item.external_urls.spotify") || BDFDB.ReactUtils.getValue(playbackState, "context.external_urls.spotify");
												if (url) {
													BDFDB.LibraryRequires.electron.clipboard.write({text:url});
													BDFDB.NotificationUtils.toast("Song URL was copied to clipboard.", {type: "success"});
												}
												else BDFDB.NotificationUtils.toast("Could not copy song URL to clipboard.", {type: "error"});
											}
										}),
										this.props.maximized && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.accountinfobutton, !socketDevice.device.is_restricted ? BDFDB.disCN.accountinfobuttonenabled : BDFDB.disCN.accountinfobuttondisabled, playbackState.shuffle_state && BDFDB.disCN._spotifycontrolsbuttonactive),
											look: BDFDB.LibraryComponents.Button.Looks.BLANK,
											size: BDFDB.LibraryComponents.Button.Sizes.NONE,
											children: "",
											onClick: socketDevice.device.is_restricted ? _ => {} : _ => {
												playbackState.shuffle_state = !playbackState.shuffle_state;
												this.request(socketDevice.socket, socketDevice.device, "shuffle", {
													state: playbackState.shuffle_state
												});
												BDFDB.ReactUtils.forceUpdate(this);
											}
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.accountinfobutton, !socketDevice.device.is_restricted ? BDFDB.disCN.accountinfobuttonenabled : BDFDB.disCN.accountinfobuttondisabled),
											look: BDFDB.LibraryComponents.Button.Looks.BLANK,
											size: BDFDB.LibraryComponents.Button.Sizes.NONE,
											children: "",
											onClick: socketDevice.device.is_restricted ? _ => {} : _ => {
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
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.accountinfobutton, !socketDevice.device.is_restricted ? BDFDB.disCN.accountinfobuttonenabled : BDFDB.disCN.accountinfobuttondisabled),
											look: BDFDB.LibraryComponents.Button.Looks.BLANK,
											size: BDFDB.LibraryComponents.Button.Sizes.NONE,
											children: this.props.song ? "" : "",
											onClick: socketDevice.device.is_restricted ? _ => {} : _ => {
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
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.accountinfobutton, !socketDevice.device.is_restricted ? BDFDB.disCN.accountinfobuttonenabled : BDFDB.disCN.accountinfobuttondisabled),
											look: BDFDB.LibraryComponents.Button.Looks.BLANK,
											size: BDFDB.LibraryComponents.Button.Sizes.NONE,
											children: "",
											onClick: socketDevice.device.is_restricted ? _ => {} : _ => {
												this.request(socketDevice.socket, socketDevice.device, "next");
											}
										}),
										this.props.maximized && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.accountinfobutton, !socketDevice.device.is_restricted ? BDFDB.disCN.accountinfobuttonenabled : BDFDB.disCN.accountinfobuttondisabled, playbackState.repeat_state != repeatStates[0] && BDFDB.disCN._spotifycontrolsbuttonactive),
											look: BDFDB.LibraryComponents.Button.Looks.BLANK,
											size: BDFDB.LibraryComponents.Button.Sizes.NONE,
											children: playbackState.repeat_state != repeatStates[2] ? "" : "",
											onClick: socketDevice.device.is_restricted ? _ => {} : _ => {
												playbackState.repeat_state = repeatStates[repeatStates.indexOf(playbackState.repeat_state) + 1] || repeatStates[0];
												this.request(socketDevice.socket, socketDevice.device, "repeat", {
													state: playbackState.repeat_state
												});
												BDFDB.ReactUtils.forceUpdate(this);
											}
										}),
										this.props.maximized && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PopoutContainer, {
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
												className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.accountinfobutton, !socketDevice.device.is_restricted ? BDFDB.disCN.accountinfobuttonenabled : BDFDB.disCN.accountinfobuttondisabled),
												style: {marginLeft: 4},
												look: BDFDB.LibraryComponents.Button.Looks.BLANK,
												size: BDFDB.LibraryComponents.Button.Sizes.NONE,
												children: currentVolume == 0 ? "" : ["", "", ""][Math.floor(currentVolume/34)],
												onContextMenu: socketDevice.device.is_restricted ? _ => {} : _ => {
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
												}
											}),
											animation: BDFDB.LibraryComponents.PopoutContainer.Animation.SCALE,
											position: BDFDB.LibraryComponents.PopoutContainer.Positions.TOP,
											align: BDFDB.LibraryComponents.PopoutContainer.Align.CENTER,
											arrow: true,
											shadow: true,
											renderPopout: instance => {
												return socketDevice.device.is_restricted ? null : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Slider, {
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
	
	return class SpotifyControls {
		getName () {return "SpotifyControls";}

		getVersion () {return "1.0.7";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds a control panel to discord when listening to spotify.";}

		constructor () {
			this.changelog = {
				"progress":[["Final update","This will be the final update for now, if something still doesn't work please let me know"]],
				"added":[["Maximized Mode","Similar as in spotify you can now click the song cover to maximize the player controls, this will display the cover in a bigger size and will allow you to control more stuff like share button, shuffle, repeat and volume (right click the volume button to mute, left click to change volume)"]],
				"improved":[["Previous","The previous button will now restart the current song on a single click and jump to the previous song on a double click"], ["Timeline","You can now hide the timeline in the settings and can now be used to jump to a certain part of a song"]],
				"fixed":[["Theme Issue with Buttons","Fixed issue where some themes would fuck with the icons of the buttons and would display them as squares, if this still happens to you, then you should seriously switch to another one because your theme is written extremely poorly"]]
			};
			
			this.patchedModules = {
				after: {
					AnalyticsContext: "render"
				}
			};
		}
		
		initConstructor () {
			_this = this;
			
			this.defaults = {
				settings: {
					addTimeline: 		{value:true,	description:"Show the song timeline in the controls"}
				}
			};
			
			this.css = `
				@font-face {
					font-family: glue1-spoticon;
					src: url("https://mwittrien.github.io/BetterDiscordAddons/Plugins/SpotifyControls/res/spoticon.ttf") format("truetype");
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
			`;
		}

		getSettingsPanel (collapseStates = {}) {
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
		load () {}

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

				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.SpotifyTrackUtils, "getActivity", {after: e => {
					if (e.methodArguments[0] !== false) {
						if (e.returnValue && e.returnValue.name == "Spotify") this.updatePlayer(e.returnValue);
						else if (!e.returnValue) this.updatePlayer(null);
					}
				}});

				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.SpotifyTrackUtils, "wasAutoPaused", {instead: e => {
					return false;
				}});

				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.SpotifyUtils, "pause", {instead: e => {
					return false;
				}});
				
				this.forceUpdateAll();
			}
			else {
				console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
			}
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

		processAnalyticsContext (e) {
			if (typeof e.returnvalue.props.children == "function" && e.instance.props.section == BDFDB.DiscordConstants.AnalyticsSections.ACCOUNT_PANEL) {
				let renderChildren = e.returnvalue.props.children;
				e.returnvalue.props.children = (...args) => {
					return [
						BDFDB.ReactUtils.createElement(SpotifyControlsComponent, {
							song: BDFDB.LibraryModules.SpotifyTrackUtils.getActivity(false),
							maximized: BDFDB.DataUtils.load(this, "playerState", "maximized"),
							timeline: settings.addTimeline
						}),
						renderChildren(...args)
					];
				};
			}
		}
		
		updatePlayer (song) {
			if (controls) {
				controls.props.song = song;
				BDFDB.ReactUtils.forceUpdate(controls);
			}
		}
		
		forceUpdateAll() {
			settings = BDFDB.DataUtils.get(this, "settings");
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
	}
})();

module.exports = SpotifyControls;