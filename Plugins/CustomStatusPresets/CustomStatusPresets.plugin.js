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
			"version": "1.0.0",
			"description": "Allows you to save custom statuses as quick select"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load () {
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
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
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
		var presets = {};
		
		return class CustomStatusPresets extends Plugin {
			onLoad () {
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
				`;
			}
			
			onStart () {
				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
			}
			
			forceUpdateAll () {
				presets = BDFDB.DataUtils.load(this, "presets");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			processMenu (e) {
				if (e.instance.props.navId == "status-picker" && Object.keys(presets).length) {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.instance, {id: "custom-status"});
					if (index > -1 && children[index].props && !children[index].props.children) {
						let render = children[index].props.render;
						delete children[index].props.render;
						children[index] = BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, Object.assign({}, children[index].props, {
							label: render(),
							children: Object.keys(BDFDB.ObjectUtils.sort(presets, "pos")).map(key => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "custom-status-preset", key),
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
													delete presets[key];
													let pos = 0, sortedPresets = BDFDB.ObjectUtils.sort(presets, "pos");
													for (let key in sortedPresets) presets[key].pos = pos++;
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
										presets[key].text
									]
								}),
								imageUrl: presets[key].emojiInfo && (presets[key].emojiInfo.id ? BDFDB.LibraryModules.IconUtils.getEmojiURL(presets[key].emojiInfo.id) : BDFDB.LibraryModules.EmojiStateUtils.getURL(presets[key].emojiInfo.name)),
								hint: !presets[key].clearAfter ? BDFDB.LanguageUtils.LanguageStrings.DISPLAY_OPTION_NEVER : presets[key].clearAfter == BDFDB_Global.ModuleUtils.findByProperties("ClearAfterValues").ClearAfterValues.TODAY ? BDFDB.LanguageUtils.LanguageStrings.CUSTOM_STATUS_TODAY : BDFDB.LanguageUtils.LanguageStringsFormat("CUSTOM_STATUS_HOURS", presets[key].clearAfter/3600000),
								action: _ => {
									if (!presets[key]) return;
									let expiresAt = presets[key].clearAfter ? presets[key].clearAfter : null;
									if (presets[key].clearAfter === BDFDB_Global.ModuleUtils.findByProperties("ClearAfterValues").ClearAfterValues.TODAY) {
										let date = new Date;
										expiresAt = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime() - date.getTime();
									}
									BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({
										customStatus: {
											text: presets[key].text.length > 0 ? presets[key].text : null,
											expiresAt: expiresAt ? BDFDB_Global.ModuleUtils.findByProperties("HTML5_FMT")().add(expiresAt, "ms").toISOString() : null,
											emojiId: presets[key].emojiInfo ? presets[key].emojiInfo.id : null,
											emojiName: presets[key].emojiInfo ? presets[key].emojiInfo.name : null
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
					case "zh":		// Chinese
						return {
							modal_savepreset:					"另存为快速选择"
						};
					case "zh-TW":	// Chinese (Traditional)
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