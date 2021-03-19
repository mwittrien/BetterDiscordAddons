/**
 * @name CustomQuoter
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.2.8
 * @description Brings back the Quote Feature and allows you to set your own Quote Formats
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CustomQuoter/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/CustomQuoter/CustomQuoter.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "CustomQuoter",
			"author": "DevilBro",
			"version": "1.2.8",
			"description": "Brings back the Quote Feature and allows you to set your own Quote Formats"
		},
		"changeLog": {
			"improved": {
				"Date Insert": "Changed the manual Timestamp Placeholders to the new Date Component"
			},
			"added": {
				"Auto new Lines": "Added Option to auto insert new line feeds for Quotes"
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
		var _this, ChannelTextAreaForm;
		var formats = {}, format = null;
		
		const PreviewMessageComponent = class PreviewMessage extends BdApi.React.Component {
			render() {
				let spoofChannel = new BDFDB.DiscordObjects.Channel({
					id: "126223823845647771",
					guild_id: "850725684241078788",
						"name": "Test Channel"
				});
				let spoofQuotedMessage = new BDFDB.DiscordObjects.Message({
					id: "562432230424221059",
					author: new BDFDB.DiscordObjects.User({
						id: "230422432565221049",
						username: "Quoted User"
					}),
					channel_id: spoofChannel.id,
					content: "This is a test message\nto showcase what the quote would look like"
				});
				let spoofMessage = new BDFDB.DiscordObjects.Message({
					author: new BDFDB.DiscordObjects.User({
						id: "222242304256531049",
						username: "Test User"
					}),
					channel_id: spoofChannel.id,
					content: _this.parseQuote(spoofQuotedMessage, spoofChannel, this.props.format)
				});
				return BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN.messagepopout,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MessageGroup, {
						disableInteraction: true,
						message: spoofMessage,
						channel: spoofChannel
					})
				});
			}
		};
		
		return class CustomQuoter extends Plugin {
			onLoad () {
				_this = this;
				
				this.patchedModules = {
					before: {
						ChannelTextAreaForm: "render"
					}
				};
				
				this.defaults = {
					general: {
						autoAddNewLine:			{value: true, 			description: "Try to add New Lines before/after Quotes"},
						holdShiftToolbar:		{value: false, 			description: "Need to hold Shift on a Message to show Quick Quote"},
						alwaysCopy:				{value: false, 			description: "Always copy Quote to Clipboard without holding Shift"}
					},
					dates: {
						quoteDate:				{value: {}, 			description: "Message Timestamp"},
					}
				};
			}
			
			onStart () {				
				this.forceUpdateAll();
			}
			
			onStop () {}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Settings",
							collapseStates: collapseStates,
							children: Object.keys(this.defaults.general).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["general", key],
								label: this.defaults.general[key].description,
								value: this.settings.general[key]
							})).concat(Object.keys(this.defaults.dates).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.DateInput, Object.assign({}, this.settings.dates[key], {
								label: this.defaults.dates[key].description,
								onChange: valueObj => {
									this.SettingsUpdated = true;
									this.settings.dates[key] = valueObj;
									BDFDB.DataUtils.save(this.settings.dates, this, "dates");
								}
							}))))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Formats",
							collapseStates: collapseStates,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									className: BDFDB.disCN.marginbottom8,
									align: BDFDB.LibraryComponents.Flex.Align.END,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
												title: "Name:",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													className: "input-newquote input-name",
													value: "",
													placeholder: "Formatname"
												})
											})
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
												title: "Quote:",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													className: "input-newquote input-quote",
													value: "",
													placeholder: "Quote"
												})
											})
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											style: {marginBottom: 1},
											onClick: _ => {
												for (let input of settingsPanel.props._node.querySelectorAll(".input-newquote " + BDFDB.dotCN.input)) if (!input.value || input.value.length == 0 || input.value.trim().length == 0) return BDFDB.NotificationUtils.toast("Fill out all fields to add a new quote.", {type: "danger"});
												let key = settingsPanel.props._node.querySelector(".input-name " + BDFDB.dotCN.input).value.trim();
												let quote = settingsPanel.props._node.querySelector(".input-quote " + BDFDB.dotCN.input).value.trim();
												if (formats[key]) return BDFDB.NotificationUtils.toast("A quote with the choosen name already exists, please choose another name", {type: "danger"});
												else {
													formats[key] = quote;
													BDFDB.DataUtils.save(formats, this, "formats");
													BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
												}
											},
											children: BDFDB.LanguageUtils.LanguageStrings.ADD
										})
									]
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
									className: BDFDB.disCN.marginbottom20
								})
							].concat(Object.keys(formats).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Card, {
								cardId: key,
								noRemove: key == "Standard",
								onRemove: _ => {
									delete formats[key];
									BDFDB.DataUtils.save(formats, this, "formats");
									BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
								},
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									direction: BDFDB.LibraryComponents.Flex.Direction.VERTICAL,
									style: {width: "100%"},
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
											type: "TextInput",
											plugin: this,
											keys: ["formats", key],
											label: key + ":",
											basis: "70%",
											value: formats[key],
											onChange: (value, instance) => {
												formats[key] = value;
												BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(BDFDB.ObjectUtils.get(instance, `${BDFDB.ReactUtils.instanceKey}.return`), {key: "PREVIEW_MESSAGE_" + key.replace(/\s/g, "_")}));
											}
										}),
										BDFDB.ReactUtils.createElement(PreviewMessageComponent, {
											key: "PREVIEW_MESSAGE_" + key.replace(/\s/g, "_"),
											format: key
										})
									]
								})
							})))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Placeholder Guide",
							collapseStates: collapseStates,
							children: [
								"$quote will be replaced with the quoted Message Content",
								"$rawQuote will be replaced with the raw quoted Message Content",
								"$mention will be replaced with a Mention of the Message Author",
								"$link will be replaced with a Discord Direct Link pointing to the Message",
								"$authorId will be replaced with the ID of the Message Author",
								"$authorName will be replaced with the Nickname or Username of the Message Author",
								"$authorAccount will be replaced with the Accountname of the Message Author (username#discriminator)",
								"$channel will be replaced with a Mention of the Channel",
								"$channelId will be replaced with the ID of the Channel",
								"$channelName will be replaced with the Name of the Channel",
								"$serverId will be replaced with the ID of the Server",
								"$serverName will be replaced with the Name of the Server",
								"$timestamp will be replaced with the Timestamp of the quoted Message"
							].map(string => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormText, {
								type: BDFDB.LibraryComponents.FormComponents.FormTextTypes.DESCRIPTION,
								children: string
							}))
						}));
						
						return settingsItems;
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
				formats = Object.assign({"Standard": "$quote $mention"}, BDFDB.DataUtils.load(this, "formats"));
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			onMessageContextMenu (e) {
				if (e.instance.props.message && e.instance.props.channel) {
					let item = null, action = (choice, shift) => {
						format = choice;
						this.quote(e.instance.props.channel, e.instance.props.message, shift);
						format = null;
					};
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "quote"});
					if (index > -1) {
						item = children[index];
						item.props.action = event => {action(null, event.shiftKey);};
					}
					else {
						item = BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.QUOTE,
							id: "quote",
							action: event => {action(null, event.shiftKey);}
						});
						let [unreadChildren, unreadIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "mark-unread"});
						unreadChildren.splice(unreadIndex > -1 ? unreadIndex - 1 : unreadChildren.length, 0, item);
					}
					let addedFormats = BDFDB.ObjectUtils.exclude(formats, "Standard");
					if (!BDFDB.ObjectUtils.isEmpty(addedFormats)) item.props.children = BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: Object.keys(addedFormats).map(key => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: key,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "added-quote", key),
							action: event => {action(key, event.shiftKey);}
						}))
					});
					else {
						let hint = BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("__Quote_Message") : null;
						if (hint) item.props.hint = _ => {
							return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
								hint: hint
							});
						};
					}
				}
			}
			
			onMessageOptionContextMenu (e) {
				if (e.instance.props.message && e.instance.props.channel) {
					let [quoteChildren, quoteIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "quote"});
					if (quoteIndex == -1) {
						let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "mark-unread"});
						children.splice(index > -1 ? index : 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.QUOTE,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "quote"),
							icon: _ => {
								return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									className: BDFDB.disCN.menuicon,
									name: BDFDB.LibraryComponents.SvgIcon.Names.QUOTE
								});
							},
							action: event => {
								this.quote(e.instance.props.channel, e.instance.props.message, event.shiftKey);
							}
						}));
					}
				}
			}
		
			onMessageOptionToolbar (e) {
				if ((e.instance.props.expanded || !this.settings.general.holdShiftToolbar) && e.instance.props.message && e.instance.props.channel) {
					let quoteButton = BDFDB.ReactUtils.findChild(e.returnvalue, {key: "quote"});
					if (!quoteButton) {
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {key: ["reply", "mark-unread"]});
						children.splice(index > -1 ? index : (!e.instance.props.expanded ? 1 : 0), 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							key: "quote",
							text: BDFDB.LanguageUtils.LanguageStrings.QUOTE,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
								className: BDFDB.disCN.messagetoolbarbutton,
								onClick: _ => {
									this.quote(e.instance.props.channel, e.instance.props.message);
								},
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									className: BDFDB.disCN.messagetoolbaricon,
									name: BDFDB.LibraryComponents.SvgIcon.Names.QUOTE
								})
							})
						}));
					}
				}
			}
		
			processChannelTextAreaForm (e) {
				ChannelTextAreaForm = e.instance;
			}
			
			quote (channel, message, shift) {
				let text = this.parseQuote(message, channel);
				if (text && text.length) {
					if (shift && !this.settings.general.alwaysCopy || !shift && this.settings.general.alwaysCopy || !(BDFDB.DMUtils.isDMChannel(channel.id) || BDFDB.UserUtils.can("SEND_MESSAGES"))) {
						BDFDB.LibraryRequires.electron.clipboard.write({text: text});
						BDFDB.NotificationUtils.toast(this.labels.toast_quotecopied, {type: "success"});
					}
					else {
						BDFDB.LibraryModules.DispatchUtils.ComponentDispatch.dispatchToLastSubscribed(BDFDB.DiscordConstants.ComponentActions.INSERT_TEXT, {content: [this.settings.general.autoAddNewLine && ChannelTextAreaForm && ChannelTextAreaForm.state.textValue && !this.isNewLine(ChannelTextAreaForm.state.textValue, true) && !this.isNewLine(text, false) && "\n", text, this.settings.general.autoAddNewLine && !this.isNewLine(text, true) && "\n"].filter(n => n).join("")});
					}
				}
			}
			
			isNewLine (string, end) {
				return string && typeof string == "string" && string.replace(/[*~_ ]/g, "")[end ? "endsWith" : "startsWith"]("\n");
			}

			parseQuote (message, channel, choice = format) {
				let languageId = BDFDB.LanguageUtils.getLanguage().id;
				
				let quoteFormat = formats[choice] || formats.Standard || "";
				
				let guild = channel.guild_id ? (BDFDB.LibraryModules.GuildStore.getGuild(channel.guild_id) || {id: channel.guild_id, name: "Test Server"}) : {id: BDFDB.DiscordConstants.ME, name: BDFDB.LanguageUtils.LanguageStrings.DIRECT_MESSAGES};
				let member = guild && BDFDB.LibraryModules.MemberStore.getMember(guild.id, message.author.id);
				
				let content = message.content;
				let selectedText = document.getSelection().toString().trim();
				if (selectedText) content = BDFDB.StringUtils.extractSelection(content, selectedText);
				if (content) {
					content = content.replace(/(@everyone|@here)/g, "`$1`").replace(/``(@everyone|@here)``/g, "`$1`");
					content = content.replace(/<@[!&]{0,1}([0-9]{10,})>/g, (string, match) => {
						let user = BDFDB.LibraryModules.UserStore.getUser(match);
						if (user) {
							let userMember = channel.guild_id && BDFDB.LibraryModules.MemberStore.getMember(guild.id, match);
							return `@ ${userMember && userMember.nick || user.username}`;
						}
						else if (channel.guild_id && guild.roles[match] && guild.roles[match].name) return `${guild.roles[match].name.indexOf("@") == 0 ? "" : "@"} ${guild.roles[match].name}`;
						return string;
					});
				}
				let unquotedLines = content.split("\n").filter(line => !line.startsWith("> "));
				let quotedLines = unquotedLines.slice(unquotedLines.findIndex(line => line.trim().length > 0)).map(line => "> " + line + "\n").join("");
				
				return BDFDB.StringUtils.insertNRST(quoteFormat)
					.replace("$mention", channel.isDM() ? "" : `<@!${message.author.id}>`)
					.replace("$link", `<https://discordapp.com/channels/${guild.id}/${channel.id}/${message.id}>`)
					.replace("$authorName", member && member.nick || message.author.username || "")
					.replace("$authorAccount", `${message.author.username}#${message.author.discriminator}`)
					.replace("$authorId", message.author.id || "")
					.replace("$channelName", channel.name || "")
					.replace("$channelId", channel.id || "")
					.replace("$channel", channel.isDM() && channel.rawRecipients[0] ? `@ ${channel.rawRecipients[0].username}` : `<#${channel.id}>`)
					.replace("$serverId", guild.id || "")
					.replace("$serverName", guild.name || "")
					.replace("$timestamp", BDFDB.LibraryComponents.DateInput.format(this.settings.dates.quoteDate, new Date(message.editedTimestamp || message.timestamp)))
					.replace("$quote", quotedLines || "")
					.replace("$rawQuote", unquotedLines.join("\n") || "");
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							toast_quotecopied:					"Цитатът е копиран в клипборда"
						};
					case "da":		// Danish
						return {
							toast_quotecopied:					"Citatet er kopieret til udklipsholderen"
						};
					case "de":		// German
						return {
							toast_quotecopied:					"Zitat wurde in die Zwischenablage kopiert"
						};
					case "el":		// Greek
						return {
							toast_quotecopied:					"Το απόσπασμα έχει αντιγραφεί στο πρόχειρο"
						};
					case "es":		// Spanish
						return {
							toast_quotecopied:					"La cita se copió al portapapeles"
						};
					case "fi":		// Finnish
						return {
							toast_quotecopied:					"Lainaus on kopioitu leikepöydälle"
						};
					case "fr":		// French
						return {
							toast_quotecopied:					"Le devis a été copié dans le presse-papiers"
						};
					case "hr":		// Croatian
						return {
							toast_quotecopied:					"Citat je kopiran u međuspremnik"
						};
					case "hu":		// Hungarian
						return {
							toast_quotecopied:					"Az árajánlatot a vágólapra másolta"
						};
					case "it":		// Italian
						return {
							toast_quotecopied:					"La citazione è stata copiata negli appunti"
						};
					case "ja":		// Japanese
						return {
							toast_quotecopied:					"見積もりがクリップボードにコピーされました"
						};
					case "ko":		// Korean
						return {
							toast_quotecopied:					"견적이 클립 보드에 복사되었습니다."
						};
					case "lt":		// Lithuanian
						return {
							toast_quotecopied:					"Citata nukopijuota į mainų sritį"
						};
					case "nl":		// Dutch
						return {
							toast_quotecopied:					"Citaat is naar het klembord gekopieerd"
						};
					case "no":		// Norwegian
						return {
							toast_quotecopied:					"Tilbudet er kopiert til utklippstavlen"
						};
					case "pl":		// Polish
						return {
							toast_quotecopied:					"Cytat został skopiowany do schowka"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							toast_quotecopied:					"A citação foi copiada para a área de transferência"
						};
					case "ro":		// Romanian
						return {
							toast_quotecopied:					"Citatul a fost copiat în clipboard"
						};
					case "ru":		// Russian
						return {
							toast_quotecopied:					"Цитата скопирована в буфер обмена"
						};
					case "sv":		// Swedish
						return {
							toast_quotecopied:					"Citatet har kopierats till Urklipp"
						};
					case "th":		// Thai
						return {
							toast_quotecopied:					"คัดลอกใบเสนอราคาไปยังคลิปบอร์ดแล้ว"
						};
					case "tr":		// Turkish
						return {
							toast_quotecopied:					"Alıntı panoya kopyalandı"
						};
					case "uk":		// Ukrainian
						return {
							toast_quotecopied:					"Цитата скопійована в буфер обміну"
						};
					case "vi":		// Vietnamese
						return {
							toast_quotecopied:					"Trích dẫn đã được sao chép vào khay nhớ tạm"
						};
					case "zh-CN":	// Chinese (China)
						return {
							toast_quotecopied:					"报价已复制到剪贴板"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							toast_quotecopied:					"報價已復製到剪貼板"
						};
					default:		// English
						return {
							toast_quotecopied:					"Quote has been copied to clipboard"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
