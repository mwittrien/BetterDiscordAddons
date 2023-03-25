/**
 * @name TimedLightDarkMode
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.1.8
 * @description Adds a Time Slider to the Appearance Settings
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/TimedLightDarkMode/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/TimedLightDarkMode/TimedLightDarkMode.plugin.js
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
		var checkInterval, changeTimeout, disableChanging;
		
		return class TimedLightDarkMode extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						running:	{value: true}
					},
					values: {
						timer1:		{value: 25},
						timer2:		{value: 75}
					}
				};
				
				this.modulePatches = {
					after: [
						"UserSettingsAppearance"
					]
				};
			}
			
			onStart () {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.AppearanceSettingsUtils, "updateTheme", {after: e => {
					if (this.settings.general.running) {
						BDFDB.TimeUtils.clear(changeTimeout);
						disableChanging = true;
						changeTimeout = BDFDB.TimeUtils.timeout(_ => {
							disableChanging = false;
						}, 1000*60*10);
					}
				}});

				this.startInterval();

				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.TimeUtils.clear(checkInterval);

				BDFDB.DOMUtils.remove(BDFDB.dotCN._timedlightdarkmodetimersettings);
			}

			processUserSettingsAppearance (e) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {filter: n => n && n.props && n.props.children == BDFDB.LanguageUtils.LanguageStrings.ACCESSIBILITY_DARK_SIDEBAR});
				if (index == -1) return;
				let slider;
				children.splice(index, 0, [
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCNS._timedlightdarkmodetimersettings + BDFDB.disCN.margintop20,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["general", "running"],
								value: this.settings.general.running,
								label: `${BDFDB.LanguageUtils.LanguageStrings.THEME} Timer`,
								tag: BDFDB.LibraryComponents.FormComponents.FormTags.H5,
								childProps: {
									checkedColor: BDFDB.DiscordConstants.Colors.GREEN_360
								},
								onChange: (value, instance) => {
									this.startInterval();
									if (slider) BDFDB.DOMUtils.toggleClass(slider, BDFDB.disCN.sliderdisabled, !value);
								}
							}),
							BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(`<div class="${BDFDB.disCNS.slider + BDFDB.disCN.margintop20}${!this.settings.general.running ? (" " + BDFDB.disCN.sliderdisabled): ""}"><div class="${BDFDB.disCN.slidertrack}">${[["0%", "00:00"], ["12.5%", "03:00"], ["25%", "06:00"], ["37.5%", "09:00"], ["50%", "12:00"], ["62.5%", "15:00"], ["75%", "18:00"], ["87.5%", "21:00"], ["100%", "24:00"]].map(n => `<div class="${BDFDB.disCNS.slidermark + BDFDB.disCN.slidermarkabove}" style="left:${n[0]};"><div class="${BDFDB.disCN.slidermarkvalue}">${n[1]}</div><div class="${BDFDB.disCN.slidermarkdash}"></div></div>`).join("")}</div><div class="${BDFDB.disCN.sliderbar}"><div class="${BDFDB.disCN.sliderbarfill}"></div></div><div class="${BDFDB.disCN.slidertrack}"><div class="${BDFDB.disCNS.slidergrabber + BDFDB.disCN._timedlightdarkmodetimergrabber}" timer="timer1" style="left: ${this.settings.values.timer1}%;"></div><div class="${BDFDB.disCNS.slidergrabber + BDFDB.disCN._timedlightdarkmodetimergrabber}" timer="timer2" style="left: ${this.settings.values.timer2}%;"></div><div class="${BDFDB.disCNS.slidergrabber + BDFDB.disCN._timedlightdarkmodedategrabber}" timer="current" style="left: ${this.getPercent(new Date())}%; cursor: help !important; height: 12px; margin-top: -7px;"></div></div></div>`), node => {
								if (!Node.prototype.isPrototypeOf(node)) return;
								slider = node;
								this.updateSlider(slider);
								BDFDB.ListenerUtils.addToChildren(slider, "mousedown", BDFDB.dotCN._timedlightdarkmodetimergrabber, event => this.dragSlider(event.currentTarget));
								BDFDB.ListenerUtils.addToChildren(slider, "mouseenter", BDFDB.dotCN._timedlightdarkmodedategrabber, event => this.showCurrentTime(event.currentTarget));
							})
						]
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
						className: BDFDB.disCNS.margintop20 + BDFDB.disCN.marginbottom8
					})
				]);
			}

			startInterval () {
				BDFDB.TimeUtils.clear(checkInterval);
				disableChanging = false;
				if (this.settings.general.running) {
					let inverted = this.settings.values.timer1 > this.settings.values.timer2;
					let timer1LOW = this.getTime(this.settings.values.timer1), timer2LOW = this.getTime(this.settings.values.timer2);
					let timer1HIGH = this.getHighTime(timer2LOW), timer2HIGH = this.getHighTime(timer1LOW);
					let check = _ => {
						if (disableChanging) return;
						let currentTime = new Date();
						let currentHours = currentTime.getHours();
						let currentMinutes = currentTime.getMinutes();
						if (inverted) this.changeTheme(!(this.checkTime(timer1LOW, timer1HIGH, [currentHours, currentMinutes])));
						else this.changeTheme(this.checkTime(timer2LOW, timer2HIGH, [currentHours, currentMinutes]));
					};
					check();
					checkInterval = BDFDB.TimeUtils.interval(_ => {check();}, 1000*60*1);
				}
			}

			checkTime (timerLOW, timerHIGH, time) {
				return timerHIGH[0] > time[0] || timerHIGH[0] == time[0] && timerHIGH[1] >= time[1] || time[0] > timerLOW[0] || time[0] == timerLOW[0] && time[1] >= timerLOW[1];
			}

			changeTheme (dark) {
				let theme = BDFDB.DiscordUtils.getTheme(), newTheme = null;
				if (dark && theme == BDFDB.disCN.themelight) newTheme = "dark";
				else if (!dark && theme == BDFDB.disCN.themedark) newTheme = "light";
				if (newTheme) BDFDB.LibraryModules.AppearanceSettingsUtils.updateTheme(newTheme);
			}

			showCurrentTime (grabber) {
				let currentTime = new Date();
				let currentHours = currentTime.getHours();
				let currentMinutes = currentTime.getMinutes();
				grabber.style.setProperty("left", `${this.getPercent(currentTime)}%`);
				BDFDB.TooltipUtils.create(grabber, (currentHours > 9 ? currentHours : ("0" + currentHours)) + ":" + (currentMinutes > 9 ? currentMinutes : ("0" + currentMinutes)), {color: "grey"});
			}

			dragSlider (grabber) {
				let track = grabber.parentNode;
				if (BDFDB.DOMUtils.containsClass(track.parentNode, BDFDB.disCN.sliderdisabled)) return;
				let timer = grabber.getAttribute("timer");

				BDFDB.DOMUtils.appendLocalStyle("disableTextSelection", `*{user-select: none !important;}`);

				let value = this.settings.values[timer];
				let sY = 0;
				let sHalfW = BDFDB.DOMUtils.getRects(grabber).width/2;
				let sMinX = BDFDB.DOMUtils.getRects(track).left;
				let sMaxX = sMinX + BDFDB.DOMUtils.getRects(track).width;
				let tooltip = BDFDB.TooltipUtils.create(grabber, this.getTime(value, true), {color: "grey", perssist: true});
				let tooltipContent = tooltip.querySelector(BDFDB.dotCN.tooltipcontent);
				let mouseUp = _ => {
					document.removeEventListener("mouseup", mouseUp);
					document.removeEventListener("mousemove", mouseMove);
					BDFDB.DOMUtils.removeLocalStyle("disableTextSelection");
					BDFDB.DataUtils.save(value, this, "values", timer);
					BDFDB.DOMUtils.remove(tooltip);
					this.startInterval();
				};
				let mouseMove = e => {
					sY = e.clientX > sMaxX ? sMaxX - sHalfW : (e.clientX < sMinX ? sMinX - sHalfW : e.clientX - sHalfW);
					value = BDFDB.NumberUtils.mapRange([sMinX - sHalfW, sMaxX - sHalfW], [0, 100], sY);
					grabber.style.setProperty("left", value + "%");
					tooltipContent.innerText = this.getTime(value, true);
					tooltip.update();
					this.settings.values[timer] = value;
					this.updateSlider(track.parentNode);
				};
				document.addEventListener("mouseup", mouseUp);
				document.addEventListener("mousemove", mouseMove);
			}

			updateSlider (slider) {
				let bar = slider.querySelector(BDFDB.dotCN.sliderbar);
				let fill = slider.querySelector(BDFDB.dotCN.sliderbarfill);
				let inverted = this.settings.values.timer1 > this.settings.values.timer2;
				fill.style.setProperty("width", (inverted ? (this.settings.values.timer1 - this.settings.values.timer2) : (this.settings.values.timer2 - this.settings.values.timer1)) + "%");
				fill.style.setProperty("margin-left", (inverted ? this.settings.values.timer2 : this.settings.values.timer1) + "%");
				fill.style.setProperty("background-color", inverted ? "#66757F" : "#E0C460", "important");
				bar.style.setProperty("background-color", inverted ? "#E0C460" : "#66757F", "important");
			}

			getTime (percent, stringify) {
				let time = BDFDB.NumberUtils.mapRange([0, 100], [0, 1440], percent)/60;
				let hours = Math.floor(time);
				let minutes = Math.floor((time - hours) * 60);
				return stringify ? (hours > 9 ? hours : ("0" + hours)) + ":" + (minutes > 9 ? minutes : ("0" + minutes)) : [hours, minutes];
			}

			getPercent (time) {
				if (!time) return 0;
				let hours = Array.isArray(time) ? time[0] : (typeof time == "object" && typeof time.getHours == "function" ? time.getHours() :0);
				let minutes = Array.isArray(time) ? time[1] : (typeof time == "object" && typeof time.getMinutes == "function" ? time.getMinutes() :0);
				return BDFDB.NumberUtils.mapRange([0, 1440], [0, 100], (hours * 60) + minutes);
			}

			getHighTime (timer) {
				let hours = timer[0];
				let minutes = timer[1] - 1;
				if (minutes < 0) {
					minutes = 59;
					hours -= 1;
				}
				if (hours < 0) hours = 0;
				return [hours, minutes];
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();