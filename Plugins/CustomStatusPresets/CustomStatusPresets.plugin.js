/**
 * @name CustomStatusPresets
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CustomStatusPresets
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CustomStatusPresets/CustomStatusPresets.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CustomStatusPresets/CustomStatusPresets.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "CustomStatusPresets",
			"author": "DevilBro",
			"version": "1.0.5",
			"description": "Allows you to save custom statuses as quick select"
		},
		"changeLog": {
			"improved": {
				"Settings": "You can now reorder the presets in the plugin settings and 'disable' them which stops them from showing in the quick menu"
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
				if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin, try again later or download it manually from GitHub: https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/");
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
		var presets = {};
		
		const CustomStatusInput = class CustomStatusInput extends BdApi.React.Component {
			handleChange() {
				this.props.onChange(this.props);
			}
			render() {
				return BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN.emojiinputcontainer,
					children: [
						BDFDB.ReactUtils.createElement("div", {
							key: "EMOJIINPUT",
							className: BDFDB.disCN.emojiinputbuttoncontainer,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.EmojiPickerButton, {
								emoji: this.props.emoji,
								onSelect: this.handleChange.bind(this)
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
							key: "TEXTINPUT",
							inputClassName: BDFDB.disCN.emojiinput,
							maxLength: 128,
							value: this.props.text,
							placeholder: this.props.text,
							onChange: this.handleChange.bind(this)
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
							size: BDFDB.LibraryComponents.Button.Sizes.NONE,
							look: BDFDB.LibraryComponents.Button.Looks.BLANK,
							className: BDFDB.disCN.emojiinputclearbutton,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								className: BDFDB.disCN.emojiinputclearicon,
								name: BDFDB.LibraryComponents.SvgIcon.Names.CLOSE_CIRCLE
							}),
							onClick: (e, instance) => {
								this.props.text = "";
								delete this.props.text;
								this.handleChange();
								BDFDB.ReactUtils.forceUpdate(this);
							}
						})
					]
				});
			}
		};
		
		const SortableList = class SortableList extends BdApi.React.Component {
			createDragPreview(div, event) {
				if (!Node.prototype.isPrototypeOf(div)) return;
				let dragPreview = div.cloneNode(true);
				BDFDB.DOMUtils.addClass(dragPreview, BDFDB.disCN._customstatuspresetsdragpreview);
				BDFDB.DOMUtils.hide(dragPreview);
				dragPreview.style.setProperty("pointer-events", "none", "important");
				dragPreview.style.setProperty("left", event.clientX - 25 + "px", "important");
				dragPreview.style.setProperty("top", event.clientY - 25 + "px", "important");
				document.querySelector(BDFDB.dotCN.appmount).appendChild(dragPreview);
				this.props.dragPreview = dragPreview;
			}
			updateDragPreview(event) {
				if (!Node.prototype.isPrototypeOf(this.props.dragPreview)) return;
				BDFDB.DOMUtils.show(this.props.dragPreview);
				this.props.dragPreview.style.setProperty("left", event.clientX - 25 + "px", "important");
				this.props.dragPreview.style.setProperty("top", event.clientY - 25 + "px", "important");
			}
			render() {
				return Object.keys(BDFDB.ObjectUtils.sort(this.props.entries, this.props.sortKey)).map(id => [
					this.props.hovered == id && BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._customstatuspresetssortdivider
					}),
					this.props.dragged != id && BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._customstatuspresetssortablecard,
						cardId: id,
						onMouseDown: event => {
							event = event.nativeEvent || event;
							let target = BDFDB.DOMUtils.containsClass(event.target, BDFDB.disCN.hovercard) ? event.target.parentElement : event.target;
							if (!BDFDB.DOMUtils.containsClass(target, BDFDB.disCN._customstatuspresetssortablecard)) return;
							let mouseMove = event2 => {
								if (Math.sqrt((event.pageX - event2.pageX)**2) > 20 || Math.sqrt((event.pageY - event2.pageY)**2) > 20) {
									BDFDB.ListenerUtils.stopEvent(event);
									this.createDragPreview(target, event2);
									this.props.dragged = id;
									BDFDB.ReactUtils.forceUpdate(this);
									document.removeEventListener("mousemove", mouseMove);
									document.removeEventListener("mouseup", mouseUp);
									let dragging = event3 => {
										this.updateDragPreview(event3);
										let hoveredId = BDFDB.DOMUtils.getParent(BDFDB.dotCN._customstatuspresetssortablecard, event3.target)?.getAttribute("cardId");
										let update = hoveredId != this.props.hovered;
										this.props.hovered = hoveredId;
										if (update) BDFDB.ReactUtils.forceUpdate(this);
									};
									let releasing = event3 => {
										BDFDB.ListenerUtils.stopEvent(event3);
										BDFDB.DOMUtils.remove(this.props.dragPreview);
										if (this.props.hovered) {
											presets[id][this.props.sortKey] = presets[this.props.hovered][this.props.sortKey] - 0.5;
											let pos = 0, sortedPresets = BDFDB.ObjectUtils.sort(presets, this.props.sortKey);
											for (let sortId in sortedPresets) presets[sortId][this.props.sortKey] = pos++;
											this.props.entries = presets;
											BDFDB.DataUtils.save(presets, _this, "presets");
										}
										delete this.props.dragged;
										delete this.props.hovered;
										BDFDB.ReactUtils.forceUpdate(this);
										document.removeEventListener("mousemove", dragging);
										document.removeEventListener("mouseup", releasing);
									};
									document.addEventListener("mousemove", dragging);
									document.addEventListener("mouseup", releasing);
								}
							};
							let mouseUp = _ => {
								document.removeEventListener("mousemove", mouseMove);
								document.removeEventListener("mouseup", mouseUp);
							};
							document.addEventListener("mousemove", mouseMove);
							document.addEventListener("mouseup", mouseUp);
						},
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Card, {
							horizontal: true,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									wrap: true,
									children: BDFDB.ReactUtils.createElement(CustomStatusInput, {
										text: presets[id].text,
										emoji: presets[id].emojiInfo,
										onChange: value => {
											presets[id].text = value.text;
											presets[id].emojiInfo = value.emoji;
											BDFDB.DataUtils.save(presets, _this, "presets");
										}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Switch, {
										value: !presets[id].disabled,
										onChange: value => {
											presets[id].disabled = !value;
											BDFDB.DataUtils.save(presets, _this, "presets");
										}
									})
								})
							],
							onRemove: _ => {
								delete presets[id];
								BDFDB.DataUtils.save(presets, _this, "presets");
								this.props.entries = presets;
								BDFDB.ReactUtils.forceUpdate(this);
							}
						})
					})
				]).flat().filter(n => n);
			}
		};
		
		return class CustomStatusPresets extends Plugin {
			onLoad () {
				_this = this;
				
				this.patchedModules = {
					before: {
						Menu: "default"
					},
					after: {
						Account: "render",
						CustomStatusModal: "render"
					}
				};
				
				this.css = `
					${BDFDB.dotCN.customstatusmodal} {
						min-width: 440px;
						width: unset;
					}
					${BDFDB.dotCN.animationcontainerscale + BDFDB.dotCN.animationcontainerrender} {
						transform: unset !important;
					}
					#status-picker${BDFDB.dotCN.menu} #status-picker-custom-status${BDFDB.dotCN.menulabelcontainer} {
						padding: 0;
					}
					#status-picker${BDFDB.dotCN.menu} #status-picker-custom-status ${BDFDB.dotCN.menulabel} {
						overflow: visible;
						white-space: unset;
					}
					#status-picker${BDFDB.dotCN.menu} #status-picker-custom-status ${BDFDB.dotCN.customstatusitemcustom},
					#status-picker${BDFDB.dotCN.menu} #status-picker-custom-status ${BDFDB.dotCN.customstatusitemcustomwithemoji} {
						display: flex;
						padding-right: 0;
						padding-left: 0;
					}
					#status-picker${BDFDB.dotCN.menu} #status-picker-custom-status ${BDFDB.dotCNS.customstatusitemcustomwithemoji + BDFDB.dotCN.customstatusitememoji} {
						margin-left: 4px;
						order: 3;
					}
					#status-picker${BDFDB.dotCN.menu} #status-picker-custom-status ${BDFDB.dotCN.customstatusitemcustomtext} {
						flex: 1 1 auto;
						max-width: 126px;
						overflow: hidden;
						order: 2;
					}
					#status-picker${BDFDB.dotCN.menu} #status-picker-custom-status ${BDFDB.dotCN.customstatusitemclearbutton} {
						margin-right: 10px;
						margin-left: 2px;
						order: 1;
					}
					${BDFDB.dotCN._customstatuspresetscustomstatusitem} {
						display: flex;
						align-items: center;
					}
					${BDFDB.dotCN._customstatuspresetsdeletebutton} {
						display: flex;
						margin-right: 6px;
					}
					${BDFDB.dotCN._customstatuspresetssortdivider} {
						background: ${BDFDB.DiscordConstants.Colors.STATUS_GREEN};
						height: 2px;
						margin: 0 26px 8px 0;
					}
					${BDFDB.dotCN._customstatuspresetsdragpreview} {
						pointer-events: none !important;
						position: absolute !important;
						opacity: 0.5 !important;
						z-index: 10000 !important;
					}
				`;
			}
			
			onStart () {
				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
					title: "Custom Status Presets:",
					dividerTop: true,
					children: BDFDB.ReactUtils.createElement(SortableList, {
						entries: presets,
						sortKey: "pos"
					})
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}
			
			forceUpdateAll () {
				presets = BDFDB.DataUtils.load(this, "presets");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			processMenu (e) {
				let enabledPresets = BDFDB.ObjectUtils.filter(presets, id => !presets[id].disabled, true);
				if (e.instance.props.navId == "status-picker" && Object.keys(enabledPresets).length) {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.instance, {id: "custom-status"});
					if (index > -1 && children[index].props && !children[index].props.children) {
						let render = children[index].props.render;
						delete children[index].props.render;
						children[index] = BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, Object.assign({}, children[index].props, {
							label: render(),
							children: Object.keys(BDFDB.ObjectUtils.sort(enabledPresets, "pos")).map(id => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "custom-status-preset", id),
								label: BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN._customstatuspresetscustomstatusitem,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
											text: BDFDB.LanguageUtils.LanguageStrings.CUSTOM_STATUS_CLEAR_CUSTOM_STATUS,
											tooltipConfig: {
												zIndex: 2001
											},
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
												className: BDFDB.disCN._customstatuspresetsdeletebutton,
												onClick: _ => {
													delete presets[id];
													let pos = 0, sortedPresets = BDFDB.ObjectUtils.sort(presets, "pos");
													for (let id in sortedPresets) presets[id].pos = pos++;
													BDFDB.DataUtils.save(presets, this, "presets");
												},
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
													className: BDFDB.disCN._customstatuspresetsdeleteicon,
													name: BDFDB.LibraryComponents.SvgIcon.Names.CLOSE_CIRCLE,
													width: 14,
													height: 14
												})
											})
										}),
										presets[id].text
									]
								}),
								imageUrl: presets[id].emojiInfo && (presets[id].emojiInfo.id ? BDFDB.LibraryModules.IconUtils.getEmojiURL(presets[id].emojiInfo) : BDFDB.LibraryModules.EmojiStateUtils.getURL(presets[id].emojiInfo.name)),
								hint: !presets[id].clearAfter ? BDFDB.LanguageUtils.LanguageStrings.DISPLAY_OPTION_NEVER : presets[id].clearAfter == BDFDB.LibraryModules.CustomStatusConstants.ClearAfterValues.TODAY ? BDFDB.LanguageUtils.LanguageStrings.CUSTOM_STATUS_TODAY : BDFDB.LanguageUtils.LanguageStringsFormat("CUSTOM_STATUS_HOURS", presets[id].clearAfter/3600000),
								action: _ => {
									if (!presets[id]) return;
									let expiresAt = presets[id].clearAfter ? presets[id].clearAfter : null;
									if (presets[id].clearAfter === BDFDB.LibraryModules.CustomStatusConstants.ClearAfterValues.TODAY) {
										let date = new Date;
										expiresAt = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime() - date.getTime();
									}
									BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({
										customStatus: {
											text: presets[id].text && presets[id].text.length > 0 ? presets[id].text : null,
											expiresAt: expiresAt ? BDFDB.DiscordObjects.Timestamp().add(expiresAt, "ms").toISOString() : null,
											emojiId: presets[id].emojiInfo ? presets[id].emojiInfo.id : null,
											emojiName: presets[id].emojiInfo ? presets[id].emojiInfo.name : null
										}
									});
								}
							}))
						}));
					}
				}
			}
			
			processCustomStatusModal (e) {
				let id = BDFDB.NumberUtils.generateId(Object.keys(presets));
				let footer = BDFDB.ReactUtils.findChild(e.returnvalue, {name: ["ModalFooter", "Footer"]});
				if (footer) footer.props.children.splice(1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
					color: BDFDB.disCN.modalcancelbutton,
					look: BDFDB.LibraryComponents.Button.Looks.LINK,
					onClick: event => {
						presets[id] = Object.assign({pos: Object.keys(presets).length}, BDFDB.ObjectUtils.extract(e.instance.state, "clearAfter", "emojiInfo", "text"));
						BDFDB.DataUtils.save(presets, this, "presets");
						if (!event.shiftKey) e.instance.props.onClose();
						else id = BDFDB.NumberUtils.generateId(Object.keys(presets));
					},
					children: this.labels.modal_savepreset
				}));
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							modal_savepreset:					"Запазване като бърз избор"
						};
					case "da":		// Danish
						return {
							modal_savepreset:					"Gem som hurtigvalg"
						};
					case "de":		// German
						return {
							modal_savepreset:					"Als Schnellauswahl speichern"
						};
					case "el":		// Greek
						return {
							modal_savepreset:					"Αποθήκευση ως γρήγορη επιλογή"
						};
					case "es":		// Spanish
						return {
							modal_savepreset:					"Guardar como selección rápida"
						};
					case "fi":		// Finnish
						return {
							modal_savepreset:					"Tallenna pikavalintana"
						};
					case "fr":		// French
						return {
							modal_savepreset:					"Enregistrer en tant que sélection rapide"
						};
					case "hr":		// Croatian
						return {
							modal_savepreset:					"Spremi kao brzi odabir"
						};
					case "hu":		// Hungarian
						return {
							modal_savepreset:					"Mentés gyorsválasztásként"
						};
					case "it":		// Italian
						return {
							modal_savepreset:					"Salva come selezione rapida"
						};
					case "ja":		// Japanese
						return {
							modal_savepreset:					"クイック選択として保存"
						};
					case "ko":		// Korean
						return {
							modal_savepreset:					"빠른 선택으로 저장"
						};
					case "lt":		// Lithuanian
						return {
							modal_savepreset:					"Išsaugoti kaip greitą pasirinkimą"
						};
					case "nl":		// Dutch
						return {
							modal_savepreset:					"Opslaan als snel selecteren"
						};
					case "no":		// Norwegian
						return {
							modal_savepreset:					"Lagre som hurtigvalg"
						};
					case "pl":		// Polish
						return {
							modal_savepreset:					"Zapisz jako Szybki wybór"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							modal_savepreset:					"Salvar como seleção rápida"
						};
					case "ro":		// Romanian
						return {
							modal_savepreset:					"Salvați ca selecție rapidă"
						};
					case "ru":		// Russian
						return {
							modal_savepreset:					"Сохранить как быстрый выбор"
						};
					case "sv":		// Swedish
						return {
							modal_savepreset:					"Spara som snabbval"
						};
					case "th":		// Thai
						return {
							modal_savepreset:					"บันทึกเป็น เลือกด่วน"
						};
					case "tr":		// Turkish
						return {
							modal_savepreset:					"Hızlı Seçim olarak kaydet"
						};
					case "uk":		// Ukrainian
						return {
							modal_savepreset:					"Зберегти як швидкий вибір"
						};
					case "vi":		// Vietnamese
						return {
							modal_savepreset:					"Lưu dưới dạng Chọn nhanh"
						};
					case "zh-CN":	// Chinese (China)
						return {
							modal_savepreset:					"另存为快速选择"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							modal_savepreset:					"另存為快速選擇"
						};
					default:		// English
						return {
							modal_savepreset:					"Save as Quick Select"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();