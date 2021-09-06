/**
 * @name EditRoles
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.0.6
 * @description Allows you to locally edit Roles
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditRoles/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/EditRoles/EditRoles.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "EditRoles",
			"author": "DevilBro",
			"version": "1.0.6",
			"description": "Allows you to locally edit Roles"
		},
		"changeLog": {
			"fixed": {
				"Crashs": ""
			}
		}
	};

	return (window.Lightcord && !Node.prototype.isPrototypeOf(window.Lightcord) || window.LightCord && !Node.prototype.isPrototypeOf(window.LightCord) || window.Astra && !Node.prototype.isPrototypeOf(window.Astra)) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return "Do not use LightCord!";}
		load () {BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)");}
		start() {}
		stop() {}
	} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
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
		var changedRoles = {};
		
		return class EditRoles extends Plugin {
			onLoad () {
				this.patchedModules = {
					before: {
						ChannelMembers: "render",
						MemberListItem: "render",
						UserPopoutBody: "default"
					}
				};
			}
			
			onStart () {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.GuildStore, "getGuild", {after: e => {
					if (e.returnValue) e.returnValue = this.changeRolesInGuild(e.returnValue, true);
				}});
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.PermissionRoleUtils, "getHighestRole", {after: e => {
					if (e.returnValue && changedRoles[e.returnValue.id]) {
						let data = changedRoles[e.returnValue.id];
						e.returnValue = Object.assign({}, e.returnValue, {
							name: data.name || e.returnValue.name,
							color: data.color ? BDFDB.ColorUtils.convert(data.color, "INT") : e.returnValue.color,
							colorString: data.color ? BDFDB.ColorUtils.convert(data.color, "HEX") : e.returnValue.colorString
						});
					}
				}});
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MemberStore, "getMember", {after: e => {
					if (e.returnValue) {
						let guild = BDFDB.LibraryModules.GuildStore.getGuild(e.methodArguments[0]);
						if (guild) {
							let role;
							for (let id of e.returnValue.roles) if (guild.roles[id] && guild.roles[id].colorString && (!role || role.position < guild.roles[id].position)) role = guild.roles[id];
							let data = role && changedRoles[role.id];
							if (data) e.returnValue = Object.assign({}, e.returnValue, {colorString: data.color ? BDFDB.ColorUtils.convert(data.color, "HEX") : e.returnValue.colorString});
						}
					}
				}});
				
				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Button",
							color: BDFDB.LibraryComponents.Button.Colors.RED,
							label: "Reset all Roles",
							onClick: _ => {
								BDFDB.ModalUtils.confirm(this, this.labels.confirm_resetall, _ => {
									BDFDB.DataUtils.remove(this, "roles");
									this.forceUpdateAll();
								});
							},
							children: BDFDB.LanguageUtils.LanguageStrings.RESET
						}));
						
						return settingsItems.flat(10);
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				changedRoles = BDFDB.DataUtils.load(this, "roles");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}
			
			onUserContextMenu (e) {
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "roles"});
				if (index > -1 && children[index].props && BDFDB.ArrayUtils.is(children[index].props.children)) for (let child of children[index].props.children) {
					if (child && child.props && typeof child.props.label == "function") {
						let renderLabel = child.props.label;
						child.props.label = (...args) => {
							let label = renderLabel(...args);
							let onContextMenu = typeof label.props.onContextMenu == "function" ? label.props.onContextMenu : (_ => {});
							label.props.onContextMenu = event => {
								BDFDB.LibraryModules.ContextMenuUtils.openContextMenu(event, function (e) {
									return BDFDB.ReactUtils.createElement(BDFDB.ModuleUtils.findByName("DeveloperContextMenu"), Object.assign({}, e, {id: child.props.id}));
								});
							};
							return label;
						};
					}
				}
			}
			
			onGuildContextMenu (e) {
				if (e.instance.props.guild) e.instance.props.guild = this.changeRolesInGuild(e.instance.props.guild);
			}

			onDeveloperContextMenu (e) {
				let guild = this.getGuildFromRoleId(e.instance.props.id);
				if (guild) e.returnvalue.props.children = [
					BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_localrolesettings,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-submenu"),
							children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
								children: [
									BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
										label: this.labels.submenu_rolesettings,
										id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-change"),
										action: _ => {
											this.openRoleSettingsModal(guild.roles[e.instance.props.id]);
										}
									}),
									BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
										label: this.labels.submenu_resetsettings,
										id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-reset"),
										color: BDFDB.LibraryComponents.MenuItems.Colors.DANGER,
										disabled: !changedRoles[e.instance.props.id],
										action: event => {
											let remove = _ => {
												BDFDB.DataUtils.remove(this, "roles", e.instance.props.id);
												this.forceUpdateAll(true);
											};
											if (event.shiftKey) remove();
											else BDFDB.ModalUtils.confirm(this, this.labels.confirm_reset, remove);
										}
									})
								]
							})
						})
					}),
					e.returnvalue.props.children
				].flat(10).filter(n => n);
			}
			processChannelMembers (e) {
				e.instance.props.groups = [].concat(e.instance.props.groups);
				for (let i in e.instance.props.groups) if (e.instance.props.groups[i].type == "GROUP") {
					let data = changedRoles[e.instance.props.groups[i].id];
					if (data && data.name) e.instance.props.groups[i] = Object.assign({}, e.instance.props.groups[i], {title: data.name});
				}
				e.instance.props.rows = [].concat(e.instance.props.rows);
				for (let i in e.instance.props.rows) if (e.instance.props.rows[i].type == "GROUP") {
					let data = changedRoles[e.instance.props.rows[i].id];
					if (data && data.name) e.instance.props.rows[i] = Object.assign({}, e.instance.props.rows[i], {title: data.name});
				}
			}
			
			processMemberListItem (e) {
				if (e.instance.props.user) {
					let member = BDFDB.LibraryModules.MemberStore.getMember(e.instance.props.guildId, e.instance.props.user.id);
					if (member) e.instance.props.colorString = member.colorString;
				}
			}
			
			processUserPopoutBody (e) {
				if (e.instance.props.guild) e.instance.props.guild = this.changeRolesInGuild(e.instance.props.guild);
			}
			
			getGuildFromRoleId (roleId) {
				return BDFDB.LibraryModules.FolderStore.getFlattenedGuilds().find(g => g.roles[roleId]);
			}
			
			changeRolesInGuild (guild, useNative) {
				let changed = false, roles = Object.assign({}, guild.roles);
				for (let id in guild.roles) {
					let data = changedRoles[id];
					if (data) {
						changed = true;
						roles[id] = Object.assign({}, roles[id], {
							name: data.name || roles[id].name,
							color: data.color ? BDFDB.ColorUtils.convert(data.color, "INT") : roles[id].color,
							colorString: data.color ? BDFDB.ColorUtils.convert(data.color, "HEX") : roles[id].colorString
						});
					}
				}
				if (useNative) guild.roles = roles;
				return !changed || useNative ? guild : (new BDFDB.DiscordObjects.Guild(Object.assign({}, guild, {roles})));
			}

			openRoleSettingsModal (role) {
				let data = changedRoles[role.id] || {};
				let newData = Object.assign({}, data);
				
				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: this.labels.modal_header,
					subHeader: role.name,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ROLE_NAME,
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									value: data.name,
									placeholder: role.name,
									autoFocus: true,
									onChange: value => {newData.name = value;}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
									className: BDFDB.disCN.dividerdefault
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ROLE_COLOR,
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color,
									defaultCustomColor: role.colorString,
									pickerConfig: {
										alpha: false,
										gradient: false
									},
									onColorChange: value => {newData.color = value;}
								})
							]
						})
					],
					buttons: [{
						contents: BDFDB.LanguageUtils.LanguageStrings.SAVE,
						color: "BRAND",
						close: true,
						onClick: _ => {
							let changed = false;
							if (Object.keys(newData).every(key => newData[key] == null || newData[key] == false) && (changed = true)) {
								BDFDB.DataUtils.remove(this, "roles", role.id);
							}
							else if (!BDFDB.equals(newData, data) && (changed = true)) {
								BDFDB.DataUtils.save(newData, this, "roles", role.id);
							}
							if (changed) this.forceUpdateAll();
						}
					}]
				});
			}
			
			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							confirm_reset:						"Наистина ли искате да нулирате тази роля?",
							confirm_resetall:					"Наистина ли искате да нулирате всички роли?",
							context_localrolesettings:			"Настройки на местната роля",
							modal_header:						"Настройки на местната роля",
							submenu_resetsettings:				"Нулиране на ролята",
							submenu_rolesettings:				"Промяна на настройките"
						};
					case "da":		// Danish
						return {
							confirm_reset:						"Er du sikker på, at du vil nulstille denne rolle?",
							confirm_resetall:					"Er du sikker på, at du vil nulstille alle roller?",
							context_localrolesettings:			"Lokale rolleindstillinger",
							modal_header:						"Lokale rolleindstillinger",
							submenu_resetsettings:				"Nulstil rolle",
							submenu_rolesettings:				"Ændre indstillinger"
						};
					case "de":		// German
						return {
							confirm_reset:						"Möchtest du diese Rolle wirklich zurücksetzen?",
							confirm_resetall:					"Möchtest du wirklich alle Rollen zurücksetzen?",
							context_localrolesettings:			"Lokale Rolleneinstellungen",
							modal_header:						"Lokale Rolleneinstellungen",
							submenu_resetsettings:				"Rolle zurücksetzen",
							submenu_rolesettings:				"Einstellungen ändern"
						};
					case "el":		// Greek
						return {
							confirm_reset:						"Είστε βέβαιοι ότι θέλετε να επαναφέρετε αυτόν τον ρόλο;",
							confirm_resetall:					"Είστε βέβαιοι ότι θέλετε να επαναφέρετε όλους τους ρόλους;",
							context_localrolesettings:			"Ρυθμίσεις τοπικού ρόλου",
							modal_header:						"Ρυθμίσεις τοπικού ρόλου",
							submenu_resetsettings:				"Επαναφορά ρόλου",
							submenu_rolesettings:				"Αλλαξε ρυθμίσεις"
						};
					case "es":		// Spanish
						return {
							confirm_reset:						"¿Está seguro de que desea restablecer este rol?",
							confirm_resetall:					"¿Está seguro de que desea restablecer todos los roles?",
							context_localrolesettings:			"Configuración de roles locales",
							modal_header:						"Configuración de roles locales",
							submenu_resetsettings:				"Restablecer rol",
							submenu_rolesettings:				"Cambiar ajustes"
						};
					case "fi":		// Finnish
						return {
							confirm_reset:						"Haluatko varmasti nollata tämän roolin?",
							confirm_resetall:					"Haluatko varmasti nollata kaikki roolit?",
							context_localrolesettings:			"Paikalliset rooliasetukset",
							modal_header:						"Paikalliset rooliasetukset",
							submenu_resetsettings:				"Nollaa rooli",
							submenu_rolesettings:				"Vaihda asetuksia"
						};
					case "fr":		// French
						return {
							confirm_reset:						"Voulez-vous vraiment réinitialiser ce rôle?",
							confirm_resetall:					"Voulez-vous vraiment réinitialiser tous les rôles?",
							context_localrolesettings:			"Paramètres de rôle locaux",
							modal_header:						"Paramètres de rôle locaux",
							submenu_resetsettings:				"Réinitialiser le rôle",
							submenu_rolesettings:				"Modifier les paramètres"
						};
					case "hr":		// Croatian
						return {
							confirm_reset:						"Jeste li sigurni da želite resetirati ovu ulogu?",
							confirm_resetall:					"Jeste li sigurni da želite resetirati sve uloge?",
							context_localrolesettings:			"Postavke lokalne uloge",
							modal_header:						"Postavke lokalne uloge",
							submenu_resetsettings:				"Resetiraj ulogu",
							submenu_rolesettings:				"Promijeniti postavke"
						};
					case "hu":		// Hungarian
						return {
							confirm_reset:						"Biztosan vissza akarja állítani ezt a szerepet?",
							confirm_resetall:					"Biztosan vissza akarja állítani az összes szerepet?",
							context_localrolesettings:			"Helyi szerepbeállítások",
							modal_header:						"Helyi szerepbeállítások",
							submenu_resetsettings:				"A szerepkör visszaállítása",
							submenu_rolesettings:				"Beállítások megváltoztatása"
						};
					case "it":		// Italian
						return {
							confirm_reset:						"Sei sicuro di voler reimpostare questo ruolo?",
							confirm_resetall:					"Sei sicuro di voler reimpostare tutti i ruoli?",
							context_localrolesettings:			"Impostazioni ruolo locale",
							modal_header:						"Impostazioni ruolo locale",
							submenu_resetsettings:				"Reimposta ruolo",
							submenu_rolesettings:				"Cambia impostazioni"
						};
					case "ja":		// Japanese
						return {
							confirm_reset:						"この役割をリセットしてもよろしいですか？",
							confirm_resetall:					"すべての役割をリセットしてもよろしいですか？",
							context_localrolesettings:			"ローカルロール設定",
							modal_header:						"ローカルロール設定",
							submenu_resetsettings:				"役割をリセット",
							submenu_rolesettings:				"設定を変更する"
						};
					case "ko":		// Korean
						return {
							confirm_reset:						"이 역할을 재설정 하시겠습니까?",
							confirm_resetall:					"모든 역할을 재설정 하시겠습니까?",
							context_localrolesettings:			"로컬 역할 설정",
							modal_header:						"로컬 역할 설정",
							submenu_resetsettings:				"역할 재설정",
							submenu_rolesettings:				"설정 변경"
						};
					case "lt":		// Lithuanian
						return {
							confirm_reset:						"Ar tikrai norite iš naujo nustatyti šį vaidmenį?",
							confirm_resetall:					"Ar tikrai norite iš naujo nustatyti visus vaidmenis?",
							context_localrolesettings:			"Vietos vaidmens nustatymai",
							modal_header:						"Vietos vaidmens nustatymai",
							submenu_resetsettings:				"Iš naujo nustatyti vaidmenį",
							submenu_rolesettings:				"Pakeisti nustatymus"
						};
					case "nl":		// Dutch
						return {
							confirm_reset:						"Weet u zeker dat u deze rol wilt resetten?",
							confirm_resetall:					"Weet u zeker dat u alle rollen opnieuw wilt instellen?",
							context_localrolesettings:			"Lokale rolinstellingen",
							modal_header:						"Lokale rolinstellingen",
							submenu_resetsettings:				"Rol opnieuw instellen",
							submenu_rolesettings:				"Instellingen veranderen"
						};
					case "no":		// Norwegian
						return {
							confirm_reset:						"Er du sikker på at du vil tilbakestille denne rollen?",
							confirm_resetall:					"Er du sikker på at du vil tilbakestille alle rollene?",
							context_localrolesettings:			"Lokale rolleinnstillinger",
							modal_header:						"Lokale rolleinnstillinger",
							submenu_resetsettings:				"Tilbakestill rolle",
							submenu_rolesettings:				"Endre innstillinger"
						};
					case "pl":		// Polish
						return {
							confirm_reset:						"Czy na pewno chcesz zresetować tę rolę?",
							confirm_resetall:					"Czy na pewno chcesz zresetować wszystkie role?",
							context_localrolesettings:			"Ustawienia roli lokalnej",
							modal_header:						"Ustawienia roli lokalnej",
							submenu_resetsettings:				"Zresetuj rolę",
							submenu_rolesettings:				"Zmień ustawienia"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							confirm_reset:						"Tem certeza de que deseja redefinir esta função?",
							confirm_resetall:					"Tem certeza de que deseja redefinir todas as funções?",
							context_localrolesettings:			"Configurações de função local",
							modal_header:						"Configurações de função local",
							submenu_resetsettings:				"Redefinir função",
							submenu_rolesettings:				"Mudar configurações"
						};
					case "ro":		// Romanian
						return {
							confirm_reset:						"Sigur doriți să resetați acest rol?",
							confirm_resetall:					"Sigur doriți să resetați toate rolurile?",
							context_localrolesettings:			"Setări rol local",
							modal_header:						"Setări rol local",
							submenu_resetsettings:				"Resetați rolul",
							submenu_rolesettings:				"Schimbă setările"
						};
					case "ru":		// Russian
						return {
							confirm_reset:						"Вы уверены, что хотите сбросить эту роль?",
							confirm_resetall:					"Вы уверены, что хотите сбросить все роли?",
							context_localrolesettings:			"Настройки локальной роли",
							modal_header:						"Настройки локальной роли",
							submenu_resetsettings:				"Сбросить роль",
							submenu_rolesettings:				"Изменить настройки"
						};
					case "sv":		// Swedish
						return {
							confirm_reset:						"Är du säker på att du vill återställa denna roll?",
							confirm_resetall:					"Är du säker på att du vill återställa alla roller?",
							context_localrolesettings:			"Lokala rollinställningar",
							modal_header:						"Lokala rollinställningar",
							submenu_resetsettings:				"Återställ roll",
							submenu_rolesettings:				"Ändra inställningar"
						};
					case "th":		// Thai
						return {
							confirm_reset:						"แน่ใจไหมว่าต้องการรีเซ็ตบทบาทนี้",
							confirm_resetall:					"แน่ใจไหมว่าต้องการรีเซ็ตบทบาททั้งหมด",
							context_localrolesettings:			"การตั้งค่าบทบาทท้องถิ่น",
							modal_header:						"การตั้งค่าบทบาทท้องถิ่น",
							submenu_resetsettings:				"รีเซ็ตบทบาท",
							submenu_rolesettings:				"เปลี่ยนการตั้งค่า"
						};
					case "tr":		// Turkish
						return {
							confirm_reset:						"Bu Rolü sıfırlamak istediğinizden emin misiniz?",
							confirm_resetall:					"Tüm Rolleri sıfırlamak istediğinizden emin misiniz?",
							context_localrolesettings:			"Yerel Rol Ayarları",
							modal_header:						"Yerel Rol Ayarları",
							submenu_resetsettings:				"Rolü Sıfırla",
							submenu_rolesettings:				"Ayarları değiştir"
						};
					case "uk":		// Ukrainian
						return {
							confirm_reset:						"Ви впевнені, що хочете скинути цю роль?",
							confirm_resetall:					"Ви впевнені, що хочете скинути всі ролі?",
							context_localrolesettings:			"Налаштування локальної ролі",
							modal_header:						"Налаштування локальної ролі",
							submenu_resetsettings:				"Скинути роль",
							submenu_rolesettings:				"Змінити налаштування"
						};
					case "vi":		// Vietnamese
						return {
							confirm_reset:						"Bạn có chắc chắn muốn đặt lại Vai trò này không?",
							confirm_resetall:					"Bạn có chắc chắn muốn đặt lại tất cả các Vai trò không?",
							context_localrolesettings:			"Cài đặt vai trò cục bộ",
							modal_header:						"Cài đặt vai trò cục bộ",
							submenu_resetsettings:				"Đặt lại vai trò",
							submenu_rolesettings:				"Thay đổi cài đặt"
						};
					case "zh-CN":	// Chinese (China)
						return {
							confirm_reset:						"您确定要重置此角色吗？",
							confirm_resetall:					"您确定要重置所有角色吗？",
							context_localrolesettings:			"本地角色设置",
							modal_header:						"本地角色设置",
							submenu_resetsettings:				"重置角色",
							submenu_rolesettings:				"更改设置"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							confirm_reset:						"您確定要重置此角色嗎？",
							confirm_resetall:					"您確定要重置所有角色嗎？",
							context_localrolesettings:			"本地角色設置",
							modal_header:						"本地角色設置",
							submenu_resetsettings:				"重置角色",
							submenu_rolesettings:				"更改設置"
						};
					default:		// English
						return {
							confirm_reset:						"Are you sure you want to reset this Role?",
							confirm_resetall:					"Are you sure you want to reset all Roles?",
							context_localrolesettings:			"Local Role Settings",
							modal_header:						"Local Role Settings",
							submenu_resetsettings:				"Reset Role",
							submenu_rolesettings:				"Change Settings"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();