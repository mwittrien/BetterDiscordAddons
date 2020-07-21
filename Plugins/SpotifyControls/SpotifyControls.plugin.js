//META{"name":"SpotifyControls","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/SpotifyControls","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/SpotifyControls/SpotifyControls.plugin.js"}*//

var SpotifyControls = (_ => {
	var controls, lastSong, stopTime, updateInterval;
	
	var settings = {};
	
	const SpotifyControlsComponent = class SpotifyControls extends BdApi.React.Component {
		componentDidMount() {
			controls = this;
		}
		request(socket, device, type, song, data) {
			return new Promise(callback => {
				BDFDB.LibraryRequires.request({
					url: `https://api.spotify.com/v1/me/player/${type}`,
					method: type == "next" || type == "previous" ? "POST" : "PUT",
					query: {device_id: device.id},
					headers: {
						authorization: `Bearer ${socket.accessToken}`
					},
					body: JSON.stringify(Object.assign({}, data))
				}, (error, response, result) => {
					if (response.statusCode == 401) {
						BDFDB.LibraryModules.SpotifyUtils.getAccessToken(socket.accountId).then(promiseResult => {
							let newSocketDevice = BDFDB.LibraryModules.SpotifyTrackUtils.getActiveSocketAndDevice();
							this.request(newSocketDevice.socket, newSocketDevice.device, type, song, data).then(_ => {
								callback(error, response, result);
							});
						});
					}
					else callback(error, response, result);
				});
			});
		}
		render() {
			let socketDevice = BDFDB.LibraryModules.SpotifyTrackUtils.getActiveSocketAndDevice();
			if (this.props.song) {
				lastSong = this.props.song;
				stopTime = null;
			}
			else if (!stopTime && lastSong) stopTime = new Date();
			return !socketDevice || !lastSong ? null : BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._spotifycontrolscontainer, settings.addTimeline && BDFDB.disCN._spotifycontrolscontainerwithtimeline),
				children: [
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._spotifycontrolscontainerinner,
						children: [
							BDFDB.ReactUtils.createElement("img", {
								className: BDFDB.disCN._spotifycontrolscover,
								src: BDFDB.LibraryModules.AssetUtils.getAssetImage(lastSong.application_id, lastSong.assets.large_image, [128, 128])
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
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.accountinfobutton, !socketDevice.device.is_restricted ? BDFDB.disCN.accountinfobuttonenabled : BDFDB.disCN.accountinfobuttondisabled),
											style: {fontFamily: "glue1-spoticon"},
											look: BDFDB.LibraryComponents.Button.Looks.BLANK,
											size: BDFDB.LibraryComponents.Button.Sizes.NONE,
											children: "",
											onClick: socketDevice.device.is_restricted ? _ => {} : _ => {
												this.request(socketDevice.socket, socketDevice.device, "previous");
											}
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.accountinfobutton, !socketDevice.device.is_restricted ? BDFDB.disCN.accountinfobuttonenabled : BDFDB.disCN.accountinfobuttondisabled),
											style: {fontFamily: "glue1-spoticon"},
											look: BDFDB.LibraryComponents.Button.Looks.BLANK,
											size: BDFDB.LibraryComponents.Button.Sizes.NONE,
											children: this.props.song ? "" : "",
											onClick: socketDevice.device.is_restricted ? _ => {} : _ => {
												if (this.props.song) this.request(socketDevice.socket, socketDevice.device, "pause");
												else this.request(socketDevice.socket, socketDevice.device, "play", lastSong);
											}
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.accountinfobutton, !socketDevice.device.is_restricted ? BDFDB.disCN.accountinfobuttonenabled : BDFDB.disCN.accountinfobuttondisabled),
											style: {fontFamily: "glue1-spoticon"},
											look: BDFDB.LibraryComponents.Button.Looks.BLANK,
											size: BDFDB.LibraryComponents.Button.Sizes.NONE,
											children: "",
											onClick: socketDevice.device.is_restricted ? _ => {} : _ => {
												this.request(socketDevice.socket, socketDevice.device, "next");
											}
										})
									]
								})
							})
						]
					}),
					settings.addTimeline && BDFDB.ReactUtils.createElement(SpotifyControlsTimelineComponent, {
						song: lastSong,
						running: !!this.props.song
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
				else if (this.props.running) {
					let song = BDFDB.LibraryModules.SpotifyTrackUtils.getActivity(false);
					if (!song) BDFDB.ReactUtils.forceUpdate(controls);
					else if (this.props.running) BDFDB.ReactUtils.forceUpdate(this);
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
			let currentTime = (!this.props.running && stopTime ? stopTime : new Date()) - this.props.song.timestamps.start;
			currentTime = currentTime > maxTime ? maxTime : currentTime;
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN._spotifycontrolsbarcontainer,
				children: [
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._spotifycontrolsbar,
						children: BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._spotifycontrolsbarfill,
							style: {width: `${currentTime / maxTime * 100}%`}
						})
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

		getVersion () {return "1.0.4";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds a control panel to discord when listening to spotify.";}

		constructor () {
			this.changelog = {
				"fixed":[["Controls","Fixed an issue where the controls would stop working after some time"],["Resume","Playlists should no longer restart, when you resume a song"]]
			};
			
			this.patchedModules = {
				after: {
					AnalyticsContext: "render"
				}
			};
		}
		
		initConstructor () {
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
				}
				${BDFDB.dotCN._spotifycontrolsbarcontainer} {
					margin: 4px 0;
				}
				${BDFDB.dotCN._spotifycontrolsbar} {
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
					background: var(--header-primary);
				}
				${BDFDB.dotCN._spotifycontrolsbartext} {
					display: flex;
					align-items: center;
					justify-content: space-between;
				}
				${BDFDB.dotCN._spotifycontrolscover} {
					display: block;
					width: 32px;
					height: 32px;
					margin-right: 8px;
					border-radius: 4px;
					object-fit: cover;
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
				${BDFDB.dotCNS._spotifycontrolscontainer + BDFDB.dotCN.accountinfobuttondisabled}{
					cursor: no-drop;
				}
			`;
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
							song: BDFDB.LibraryModules.SpotifyTrackUtils.getActivity()
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