/**
 * @name PersonalPins
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 2.1.7
 * @description Allows you to locally pin Messages
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/PersonalPins/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/PersonalPins/PersonalPins.plugin.js
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
		let _this;
		
		const pinIconGeneral = `<svg name="Note" width="24" height="24" viewBox="0 0 24 24"><mask/><path fill="currentColor" mask="url(#pinIconMask)" d="M 6.7285156 2 C 6.4051262 2 6.1425781 2.2615247 6.1425781 2.5859375 L 6.1425781 3.7578125 C 6.1425781 4.081202 6.4041028 4.34375 6.7285156 4.34375 C 7.0529284 4.34375 7.3144531 4.0822254 7.3144531 3.7578125 L 7.3144531 2.5859375 C 7.3144531 2.2615247 7.0529284 2 6.7285156 2 z M 10.244141 2 C 9.9207511 2 9.6582031 2.2615247 9.6582031 2.5859375 L 9.6582031 3.7578125 C 9.6582031 4.081202 9.9197277 4.34375 10.244141 4.34375 C 10.568554 4.34375 10.830078 4.0822254 10.830078 3.7578125 L 10.830078 2.5859375 C 10.830078 2.2615247 10.568554 2 10.244141 2 z M 13.759766 2 C 13.436377 2 13.173828 2.2615247 13.173828 2.5859375 L 13.173828 3.7578125 C 13.173828 4.081202 13.435354 4.34375 13.759766 4.34375 C 14.083156 4.34375 14.347656 4.0822254 14.347656 3.7578125 L 14.347656 2.5859375 C 14.346656 2.2615247 14.083156 2 13.759766 2 z M 17.275391 2 C 16.952002 2 16.689453 2.2615247 16.689453 2.5859375 L 16.689453 3.7578125 C 16.689453 4.081202 16.950979 4.34375 17.275391 4.34375 C 17.598781 4.34375 17.863281 4.0822254 17.863281 3.7578125 L 17.863281 2.5859375 C 17.862281 2.2615247 17.598781 2 17.275391 2 z M 4.9667969 3.2792969 C 4.2903399 3.5228623 3.8007813 4.1662428 3.8007812 4.9296875 L 3.8007812 20.242188 C 3.8007812 21.211333 4.5884253 22 5.5585938 22 L 18.447266 22 C 19.41641 22 20.205078 21.212356 20.205078 20.242188 L 20.205078 4.9296875 C 20.204054 4.1662428 19.713754 3.5228623 19.033203 3.2792969 L 19.033203 3.7578125 C 19.033203 4.7269575 18.245559 5.515625 17.275391 5.515625 C 16.306246 5.515625 15.517578 4.7279808 15.517578 3.7578125 C 15.517578 4.7269575 14.72798 5.515625 13.757812 5.515625 C 12.788668 5.515625 12 4.7279808 12 3.7578125 C 12 4.7269575 11.212357 5.515625 10.242188 5.515625 C 9.2730428 5.515625 8.484375 4.7279808 8.484375 3.7578125 C 8.484375 4.7269575 7.6967309 5.515625 6.7265625 5.515625 C 5.7574176 5.515625 4.9667969 4.7279808 4.9667969 3.7578125 L 4.9667969 3.2792969 z M 6.7285156 7.2734375 L 17.275391 7.2734375 C 17.598781 7.2734375 17.861328 7.5349622 17.861328 7.859375 C 17.861328 8.1837878 17.598781 8.4453125 17.275391 8.4453125 L 6.7285156 8.4453125 C 6.4051262 8.4453125 6.1425781 8.1837878 6.1425781 7.859375 C 6.1425781 7.5349622 6.4041028 7.2734375 6.7285156 7.2734375 z M 6.7285156 10.787109 L 17.275391 10.787109 C 17.598781 10.787109 17.861328 11.050587 17.861328 11.375 C 17.861328 11.699413 17.598781 11.960938 17.275391 11.960938 L 6.7285156 11.960938 C 6.4051262 11.960938 6.1425781 11.699413 6.1425781 11.375 C 6.1425781 11.050587 6.4041028 10.787109 6.7285156 10.787109 z M 6.7285156 14.380859 L 17.275391 14.380859 C 17.598781 14.380859 17.861328 14.642384 17.861328 14.966797 C 17.861328 15.29121 17.598781 15.552734 17.275391 15.552734 L 6.7285156 15.552734 C 6.4051262 15.552734 6.1425781 15.29121 6.1425781 14.966797 C 6.1425781 14.643408 6.4041028 14.380859 6.7285156 14.380859 z M 6.7285156 17.896484 L 17.275391 17.896484 C 17.598781 17.896484 17.861328 18.158009 17.861328 18.482422 C 17.861328 18.806835 17.598781 19.068359 17.275391 19.068359 L 6.7285156 19.068359 C 6.4051262 19.068359 6.1425781 18.806835 6.1425781 18.482422 C 6.1425781 18.159033 6.4041028 17.896484 6.7285156 17.896484 z"/><extra/></svg>`;
		const pinIconMask = `<mask id="pinIconMask" fill="black"><path fill="white" d="M 0 0 H 24 V 24 H 0 Z"/><path fill="black" d="M24 12 H 12 V 24 H 24 Z"/></mask>`;
		const pinIcon = pinIconGeneral.replace(`<extra/>`, ``).replace(`<mask/>`, ``).replace(` mask="url(#pinIconMask)"`, ``);
		const pinIconDelete = pinIconGeneral.replace(`<extra/>`, `<path fill="none" stroke="#f04747" stroke-width="2" d="m 14.702359,14.702442 8.596228,8.596148 m 0,-8.597139 -8.59722,8.596147 z"/>`).replace(`<mask/>`, pinIconMask);
		const pinIconUpdate = pinIconGeneral.replace(`<extra/>`, `<path fill="#43b581" d="M 24,18.375879 V 14 l -1.470407,1.468882 C 21.626418,14.562588 20.378506,14 18.996922,14 16.232873,14 14,16.238045 14,19 c 0,2.761955 2.231994,5 4.996043,5 2.32873,0 4.280186,-1.594585 4.833347,-3.750879 h -1.301556 c -0.516226,1.455696 -1.89781,2.5 -3.53355,2.5 -2.073696,0 -3.752528,-1.678973 -3.752528,-3.750879 0,-2.071906 1.678832,-3.750879 3.751649,-3.750879 1.034209,0 1.962887,0.430731 2.641808,1.109353 L 19.6178,18.372363 H 24 Z"/>`).replace(`<mask/>`, pinIconMask);
		
		const filterKeys = ["channel", "server", "all"];
		const sortKeys = ["notetime", "messagetime"];
		const orderKeys = ["ascending", "descending"];
		
		const popoutProps = {};
		let notes = {};
		
		const NotesPopoutComponent = class NotesPopout extends BdApi.React.Component {
			containsSearchkey(data, key, searchKey) {
				let value = BDFDB.ObjectUtils.get(data, key);
				return value && value.toUpperCase().indexOf(searchKey) > -1;
			}
			filterMessages() {
				let messages = [], updateData = false;
				for (let guild_id in notes) for (let channel_id in notes[guild_id]) for (let message_idPOS in notes[guild_id][channel_id]) {
					let message = JSON.parse(notes[guild_id][channel_id][message_idPOS].message);
					message.author = new BDFDB.DiscordObjects.User(message.author);
					if (message.interaction && message.interaction.user) message.interaction.user = new BDFDB.DiscordObjects.User(message.interaction.user);
					message.timestamp = new BDFDB.DiscordObjects.Timestamp(message.timestamp);
					message.editedTimestamp = message.editedTimestamp && new BDFDB.DiscordObjects.Timestamp(message.editedTimestamp);
					if (message.customRenderedContent && message.customRenderedContent.content.length) message.customRenderedContent.content = BDFDB.ReactUtils.objectToReact(message.customRenderedContent.content);
					for (let embed of message.embeds) {
						embed.color = typeof embed.color != "string" ? null : embed.color;
						embed.timestamp = embed.timestamp && new BDFDB.DiscordObjects.Timestamp(embed.timestamp);
					}
					message.embeds = message.embeds.filter(n => !(n && n.type == "gifv"));
					message.reactions = [];
					message = new BDFDB.DiscordObjects.Message(message);
					let channel = notes[guild_id][channel_id][message_idPOS].channel && new BDFDB.DiscordObjects.Channel(JSON.parse(notes[guild_id][channel_id][message_idPOS].channel));
					if (!channel) {
						channel = BDFDB.LibraryStores.ChannelStore.getChannel(message.channel_id);
						if (channel) {
							updateData = true;
							notes[guild_id][channel_id][message_idPOS].channel = JSON.stringify(channel);
						}
					}
					if (!BDFDB.MessageUtils.isSystemMessage(message)) messages.push({
						note: notes[guild_id][channel_id][message_idPOS],
						channel_id: channel_id,
						guild_id: guild_id,
						message: message,
						channel: channel,
						messagetime: notes[guild_id][channel_id][message_idPOS].timestamp,
						notetime: notes[guild_id][channel_id][message_idPOS].addedat
					});
				}
				if (updateData) BDFDB.DataUtils.save(notes, _this, "notes");
				let allCount = messages.length;
				let currentChannel = BDFDB.LibraryStores.ChannelStore.getChannel(BDFDB.LibraryStores.SelectedChannelStore.getChannelId()) || {};
				switch (popoutProps.selectedFilter.value) {
					case "channel":
						messages = messages.filter(m => m.channel_id == currentChannel.id);
						break;
					case "server":
						messages = messages.filter(m => m.guild_id == (currentChannel.guild_id || BDFDB.DiscordConstants.ME));
						break;
					case "allservers":
						messages = messages;
						break;
				}
				let searchKey = popoutProps.searchKey.toUpperCase();
				if (searchKey) {
					let searchValues = ["content", "author.username", "rawDescription", "author.name"];
					messages = messages.filter(m => m.note.tags && m.note.tags.some(tag => tag.indexOf(searchKey.toUpperCase()) > -1) || searchValues.some(key => this.containsSearchkey(m.message, key, searchKey) || m.message.embeds.some(embed => this.containsSearchkey(embed, key, searchKey))));
				}
				BDFDB.ArrayUtils.keySort(messages, popoutProps.selectedSort.value);
				if (popoutProps.selectedOrder.value != "descending") messages.reverse();
				return [messages, allCount];
			}
			renderMessage(note, message, channel) {
				if (!message || !channel) return null;
				let channelName = channel.name;
				let guild = channel.guild_id && BDFDB.LibraryStores.GuildStore.getGuild(channel.guild_id);
				let role = guild && BDFDB.LibraryModules.PermissionRoleUtils.getHighestRole(guild, message.author.id);
				if (role) message.colorString = role.colorString;
				if (popoutProps.selectedFilter.value != "channel" && !channelName && channel.recipients.length > 0) {
					for (let dmuser_id of channel.recipients) {
						channelName = channelName ? channelName + ", @" : channelName;
						channelName = channelName + ((BDFDB.LibraryStores.UserStore.getUser(dmuser_id) || {}).username || BDFDB.LanguageUtils.LanguageStrings.UNKNOWN_USER);
					}
				}
				return [
					popoutProps.selectedFilter.value != "channel" && BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.messagespopoutchannelseparator,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
								tag: "span",
								className: BDFDB.disCN.messagespopoutchannelname,
								onClick: _ => {
									if (!channel.guild_id || BDFDB.LibraryStores.GuildStore.getGuild(channel.guild_id)) BDFDB.LibraryModules.HistoryUtils.transitionTo(BDFDB.DiscordConstants.Routes.CHANNEL(channel.guild_id, channel.id));
								},
								children: channelName ? ((channel.guild_id ? "#" : "@") + channelName) : "???"
							}),
							popoutProps.selectedFilter.value == "all" ? BDFDB.ReactUtils.createElement("span", {
								className: BDFDB.disCN.messagespopoutguildname,
								children: channel.guild_id ? (BDFDB.LibraryStores.GuildStore.getGuild(channel.guild_id) || {}).name || BDFDB.LanguageUtils.LanguageStrings.GUILD_UNAVAILABLE_HEADER : BDFDB.LanguageUtils.LanguageStrings.DIRECT_MESSAGES
							}) : null
						]
					}),
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.messagespopoutgroupwrapper,
						key: message.id,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MessageGroup, {
								className: BDFDB.disCN.messagespopoutgroupcozy,
								message: message,
								channel: channel,
								onContextMenu: e => BDFDB.MessageUtils.openMenu(message, e, true)
							}, true),
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN.messagespopoutactionbuttons,
								children: [
									(!channel.guild_id || BDFDB.LibraryStores.GuildStore.getGuild(channel.guild_id)) && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
										className: BDFDB.disCN.messagespopoutjumpbutton,
										onClick: _ => BDFDB.LibraryModules.HistoryUtils.transitionTo(BDFDB.DiscordConstants.Routes.CHANNEL(channel.guild_id, channel.id, message.id)),
										children: BDFDB.ReactUtils.createElement("div", {
											children: BDFDB.LanguageUtils.LanguageStrings.JUMP
										})
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
										className: BDFDB.disCN.messagespopoutjumpbutton,
										onClick: _ => {
											if (message.content || message.attachments.length > 1) {
												let text = message.content || "";
												for (let attachment of message.attachments) if (attachment.url) text += ((text ? "\n" : "") + attachment.url);
												BDFDB.LibraryModules.WindowUtils.copy(text);
											}
											else if (message.attachments.length == 1 && message.attachments[0].url) {
												BDFDB.LibraryModules.WindowUtils.copyImage(message.attachments[0].url);
											}
										},
										children: BDFDB.ReactUtils.createElement("div", {
											children: BDFDB.LanguageUtils.LanguageStrings.COPY
										})
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
										look: BDFDB.LibraryComponents.Button.Looks.BLANK,
										size: BDFDB.LibraryComponents.Button.Sizes.NONE,
										onClick: _ => {
											_this.removeNoteData(note);
											BDFDB.ReactUtils.forceUpdate(this);
										},
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
											className: BDFDB.disCN.messagespopoutclosebutton,
											name: BDFDB.LibraryComponents.SvgIcon.Names.CLOSE
										})
									})
								]
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
								wrap: BDFDB.LibraryComponents.Flex.Wrap.WRAP,
								justify: BDFDB.LibraryComponents.Flex.Justify.END,
								children: [note.tags].flat(10).filter(n => n).map(label => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.TextBadge, {
									className: BDFDB.disCN._personalpinsmessagetag,
									color: "var(--background-tertiary)",
									onClick: _ => {
										BDFDB.ArrayUtils.remove(note.tags, label, true);
										BDFDB.DataUtils.save(notes, _this, "notes");
										BDFDB.ReactUtils.forceUpdate(this);
									},
									text: [
										BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.disCN._personalpinsmessagetagname,
											children: label
										}),
										BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.disCN._personalpinsmessagetagdelete,
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
												name: BDFDB.LibraryComponents.SvgIcon.Names.CLOSE,
												width: 14,
												height: 14,
												nativeClass: true,
											})
										})
									]
								})).concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PopoutContainer, {
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.TextBadge, {
										className: BDFDB.disCNS._personalpinsmessagetag + BDFDB.disCN._personalpinsmessagetagadd,
										color: "var(--background-tertiary)",
										text: "+"
									}),
									animation: BDFDB.LibraryComponents.PopoutContainer.Animation.SCALE,
									position: BDFDB.LibraryComponents.PopoutContainer.Positions.TOP,
									align: BDFDB.LibraryComponents.PopoutContainer.Align.CENTER,
									arrow: true,
									onOpen: instance => BDFDB.DOMUtils.addClass(instance.domElementRef.current, BDFDB.disCN._personalpinsmessagetagaddactive),
									onClose: instance => BDFDB.DOMUtils.removeClass(instance.domElementRef.current, BDFDB.disCN._personalpinsmessagetagaddactive),
									renderPopout: instance => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										onKeyDown: (event, textInstance) => {
											let tag = textInstance.props.value && textInstance.props.value.toUpperCase();
											if (tag && event.which == 13 && (!note.tags || note.tags.indexOf(tag) == -1)) {
												instance.toggle();
												if (!note.tags) note.tags = [];
												note.tags.push(tag);
												BDFDB.DataUtils.save(notes, _this, "notes");
												BDFDB.ReactUtils.forceUpdate(this);
											}
										}
									})
								}))
							})
						]
					})
				];
			}
			render() {
				let searchTimeout;
				const [messages, allCount] = this.filterMessages();
				return BDFDB.ReactUtils.createElement(BDFDB.ReactUtils.Fragment, {
					children: [
						BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCNS.messagespopouttabbarheader + BDFDB.disCN.messagespopoutheader,
							style: {paddingBottom: 4},
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
								direction: BDFDB.LibraryComponents.Flex.Direction.VERTICAL,
								children: [
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
										className: BDFDB.disCN.marginbottom4,
										align: BDFDB.LibraryComponents.Flex.Align.CENTER,
										children: [
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												className: BDFDB.disCN.messagespopouttitle,
												children: `${_this.labels.popout_note} - ${messages.length}/${allCount}`
											}),
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SearchBar, {
												query: popoutProps.searchKey,
												onChange: value => {
													BDFDB.TimeUtils.clear(searchTimeout);
													searchTimeout = BDFDB.TimeUtils.timeout(_ => {
														popoutProps.searchKey = value;
														BDFDB.ReactUtils.forceUpdate(this);
													}, 1000);
												},
												onClear: _ => {
													popoutProps.searchKey = "";
													BDFDB.ReactUtils.forceUpdate(this);
												}
											})
										]
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
										align: BDFDB.LibraryComponents.Flex.Align.CENTER,
										children: [
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TabBar, {
												className: BDFDB.disCN.messagespopouttabbar,
												itemClassName: BDFDB.disCN.messagespopouttabbartab,
												itemSelectedClassName: BDFDB.disCN.messagespopouttabbartabactive,
												type: BDFDB.LibraryComponents.TabBar.Types.TOP_PILL,
												selectedItem: popoutProps.selectedFilter.value,
												items: filterKeys.map(option => _this.getPopoutValue(option, "filter")),
												onItemSelect: option => {
													popoutProps.selectedFilter = _this.getPopoutValue(option, "filter");
													BDFDB.ReactUtils.forceUpdate(this);
												}
											}),
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.QuickSelect, {
												label: BDFDB.LanguageUtils.LibraryStrings.sort_by + ":",
												value: popoutProps.selectedSort,
												options: sortKeys.map(option => _this.getPopoutValue(option, "sort")),
												onChange: option => {
													popoutProps.selectedSort = _this.getPopoutValue(option, "sort");
													BDFDB.ReactUtils.forceUpdate(this);
												}
											}),
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.QuickSelect, {
												label: BDFDB.LanguageUtils.LibraryStrings.order + ":",
												value: popoutProps.selectedOrder,
												options: orderKeys.map(option => _this.getPopoutValue(option, "order")),
												onChange: option => {
													popoutProps.selectedOrder = _this.getPopoutValue(option, "order");
													BDFDB.ReactUtils.forceUpdate(this);
												}
											})
										]
									})
								]
							})
						}),
						messages.length ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PaginatedList, {
							className: BDFDB.disCN.messagespopout,
							items: messages,
							amount: 25,
							copyToBottom: true,
							renderItem: messageData => this.renderMessage(messageData.note, messageData.message, messageData.channel).flat(10).filter(n => n)
						}) : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MessagesPopoutComponents.EmptyState, {
							msg: BDFDB.LanguageUtils.LanguageStrings.AUTOCOMPLETE_NO_RESULTS_HEADER,
							image: BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themelight ? "/assets/03c7541028afafafd1a9f6a81cb7f149.svg" : "/assets/6793e022dc1b065b21f12d6df02f91bd.svg"
						})
					]
				});
			}
		};
	
		return class PersonalPins extends Plugin {
			onLoad () {
				_this = this;
				
				this.defaults = {
					choices: {
						defaultFilter:		{value: filterKeys[0], 		options: filterKeys,	type: "filter",		description: "Default choice tab"},
						defaultSort:		{value: sortKeys[0], 		options: sortKeys,		type: "sort",		description: "Default sort choice"},
						defaultOrder:		{value: orderKeys[0], 		options: orderKeys,		type: "order",		description: "Default order choice"},
					}
				};
			
				this.modulePatches = {
					before: [
						"HeaderBar"
					],
					after: [
						"MessageActionsContextMenu",
						"MessageToolbar"
					]
				};
				
				this.css = `
					${BDFDB.dotCN._personalpinsmessagetag} {
						margin: 0 3px 4px 3px;
						cursor: pointer;
					}
					${BDFDB.dotCN._personalpinsmessagetag}:hover ${BDFDB.dotCN._personalpinsmessagetagname} {
						height: 0;
						visibility: hidden;
					}
					${BDFDB.dotCNS._personalpinsmessagetag + BDFDB.dotCN._personalpinsmessagetagdelete} {
						visibility: hidden;
					}
					${BDFDB.dotCN._personalpinsmessagetag}:hover ${BDFDB.dotCN._personalpinsmessagetagdelete} {
						visibility: visible;
					}
					${BDFDB.dotCN._personalpinsmessagetag + BDFDB.notCN._personalpinsmessagetagadd}:hover {
						background-color: var(--status-danger) !important;
					}
					${BDFDB.dotCN._personalpinsmessagetagadd} {
						font-size: 16px;
					}
					${BDFDB.dotCN._personalpinsmessagetagadd + BDFDB.dotCN._personalpinsmessagetagaddactive} {
						background-color: var(--bdfdb-blurple) !important;
					}
				`;
			}
			
			onStart () {
				notes = BDFDB.DataUtils.load(this, "notes");
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.DispatchApiUtils, "dispatch", {after: e => {
					if (BDFDB.ObjectUtils.is(e.methodArguments[0]) && e.methodArguments[0].type == "MESSAGE_DELETE") {
						let note = this.getNoteData({id: e.methodArguments[0].id, channel_id: e.methodArguments[0].channelId});
						if (note) this.removeNoteData(note, true);
					}
				}});
				
				BDFDB.DiscordUtils.rerenderAll();
			}
			
			onStop () {
				BDFDB.DiscordUtils.rerenderAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						for (let key in this.settings.choices) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Select",
							plugin: this,
							keys: ["choices", key],
							label: this.defaults.choices[key].description,
							basis: "50%",
							value: this.settings.choices[key],
							options: (this.defaults.choices[key].options || []).map(option => this.getPopoutValue(option, this.defaults.choices[key].type)),
							searchable: true
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Button",
							color: BDFDB.LibraryComponents.Button.Colors.RED,
							label: "Delete all Notes",
							onClick: _ => BDFDB.ModalUtils.confirm(this, "Are you sure you want to delete all pinned Notes?", _ => {
								notes = {};
								BDFDB.DataUtils.remove(this, "notes");
							}),
							children: BDFDB.LanguageUtils.LanguageStrings.DELETE
						}));
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					BDFDB.DiscordUtils.rerenderAll();
				}
			}

			onMessageContextMenu (e) {
				if (e.instance.props.message && e.instance.props.channel) {
					let note = this.getNoteData(e.instance.props.message, e.instance.props.channel);
					let hint = BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("__Note_Message") : null;
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["pin", "unpin"]});
					if (index == -1) [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["edit", "add-reaction", "quote"]});
					children.splice(index > -1 ? index + 1: 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: note ? this.labels.context_unpinoption : this.labels.context_pinoption,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, note ? "unpin-note" : "pin-note"),
						hint: hint && (_ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
							hint: hint
						})),
						icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
							icon: note ? pinIconDelete : pinIcon
						}),
						action: _ => this.addMessageToNotes(e.instance.props.message, e.instance.props.channel)
					}));
					if (this.isNoteOutdated(note, e.instance.props.message)) children.splice(index > -1 ? index + 1: 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.context_updateoption,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "update-note"),
						icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
							icon: pinIconUpdate
						}),
						action: _ => this.updateNoteData(note, e.instance.props.message)
					}));
				}
			}
			
			processMessageActionsContextMenu (e) {
				if (e.instance.props.message && e.instance.props.channel) {
					let note = this.getNoteData(e.instance.props.message, e.instance.props.channel);
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["pin", "unpin"]});
					children.splice(index + 1, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: note ? this.labels.context_unpinoption : this.labels.context_pinoption,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, note ? "unpin-note" : "pin-note"),
						icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
							icon: note ? pinIconDelete : pinIcon
						}),
						action: _ => this.addMessageToNotes(e.instance.props.message, e.instance.props.channel)
					}));
					if (this.isNoteOutdated(note, e.instance.props.message)) children.splice(index + 1, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.context_updateoption,
						id: "update-note",
						icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
							icon: pinIconUpdate
						}),
						action: _ => this.updateNoteData(note, e.instance.props.message)
					}));
				}
			}
		
			processMessageToolbar (e) {
				if (!e.instance.props.message || !e.instance.props.channel) return;
				let expanded = !BDFDB.LibraryStores.AccessibilityStore.keyboardModeEnabled && !e.instance.props.showEmojiPicker && !e.instance.props.showEmojiBurstPicker && !e.instance.props.showMoreUtilities && BDFDB.ListenerUtils.isPressed(16);
				if (!expanded) return;
				let note = this.getNoteData(e.instance.props.message, e.instance.props.channel);
				e.returnvalue.props.children.unshift(BDFDB.ReactUtils.createElement(class extends BdApi.React.Component {
					render() {
						return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							key: note ? "unpin-note" : "pin-note",
							text: _ => note ? _this.labels.context_unpinoption : _this.labels.context_pinoption,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
								className: BDFDB.disCN.messagetoolbarbutton,
								onClick: _ => {
									_this.addMessageToNotes(e.instance.props.message, e.instance.props.channel);
									note = _this.getNoteData(e.instance.props.message, e.instance.props.channel);
									BDFDB.ReactUtils.forceUpdate(this);
								},
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									className: BDFDB.disCN.messagetoolbaricon,
									iconSVG: note ? pinIconDelete : pinIcon
								})
							})
						})
					}
				}));
				if (this.isNoteOutdated(note, e.instance.props.message)) e.returnvalue.props.children.unshift(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					key: "update-note",
					text: this.labels.context_updateoption,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
						className: BDFDB.disCN.messagetoolbarbutton,
						onClick: _ => this.updateNoteData(note, e.instance.props.message),
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.disCN.messagetoolbaricon,
							iconSVG: pinIconUpdate
						})
					})
				}));
			}

			processHeaderBar (e) {
				if (!e.instance.props.toolbar) return;
				let [children, index] = BDFDB.ReactUtils.findParent(e.instance.props.toolbar, {props: [["className", BDFDB.disCN.channelheadersearch]]});
				if (index > -1) children.splice(index, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PopoutContainer, {
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: this.labels.popout_note,
						tooltipConfig: {type: "bottom"},
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
							className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								className: BDFDB.disCNS.channelheadericon,
								iconSVG: pinIcon
							})
						})
					}),
					popoutClassName: BDFDB.disCN.messagespopoutwrap,
					animation: BDFDB.LibraryComponents.PopoutContainer.Animation.SCALE,
					position: BDFDB.LibraryComponents.PopoutContainer.Positions.BOTTOM,
					align: BDFDB.LibraryComponents.PopoutContainer.Align.RIGHT,
					width: 750,
					maxHeight: "calc(100vh - 100px)",
					onClose: instance => BDFDB.DOMUtils.removeClass(instance.domElementRef.current, BDFDB.disCN.channelheadericonselected),
					renderPopout: instance => {
						BDFDB.DOMUtils.addClass(instance.domElementRef.current, BDFDB.disCN.channelheadericonselected);
						popoutProps.selectedFilter = popoutProps.selectedFilter || this.getPopoutValue(this.settings.choices.defaultFilter || filterKeys[0], "filter");
						popoutProps.selectedSort = popoutProps.selectedSort || this.getPopoutValue(this.settings.choices.defaultSort || sortKeys[0], "sort");
						popoutProps.selectedOrder = popoutProps.selectedOrder || this.getPopoutValue(this.settings.choices.defaultOrder || orderKeys[0], "order");
						popoutProps.searchKey = popoutProps.searchKey || "";
						return BDFDB.ReactUtils.createElement(NotesPopoutComponent, {}, true);
					}
				}));
			}
			
			getPopoutValue (key, type) {
				return {
					label: type == "order" ? BDFDB.LanguageUtils.LibraryStrings[key] : this.labels[`popout_${type}_${key}`],
					value: key
				};
			}

			addMessageToNotes (message, channel) {
				if (!message) return;
				channel = channel || BDFDB.LibraryStores.ChannelStore.getChannel(message.channel_id);
				let guild_id = channel.guild_id || BDFDB.DiscordConstants.ME;
				notes[guild_id] = notes[guild_id] || {};
				notes[guild_id][channel.id] = notes[guild_id][channel.id] || {}
				if (!notes[guild_id][channel.id][message.id]) {
					notes[guild_id][channel.id][message.id] = {
						addedat: new Date().getTime(),
						channel: JSON.stringify(channel),
						id: message.id,
						message: JSON.stringify(message),
						timestamp: message.timestamp._i.getTime()
					};
					BDFDB.DataUtils.save(notes, this, "notes");
					BDFDB.NotificationUtils.toast(this.labels.toast_noteadd, {type: "success"});
				}
				else this.removeNoteData(notes[guild_id][channel.id][message.id]);
			}
			
			isNoteOutdated (note, message) {
				let noteMessage = note && JSON.parse(note.message), keys = ["content", "embeds", "attachment"];
				return noteMessage && !BDFDB.equals(BDFDB.ObjectUtils.extract(noteMessage, keys), BDFDB.ObjectUtils.extract(message, keys));
			}

			getNoteData (message, channel) {
				if (!message) return;
				channel = channel || BDFDB.LibraryStores.ChannelStore.getChannel(message.channel_id);
				let guild_id = channel.guild_id || BDFDB.DiscordConstants.ME;
				return notes[guild_id] && notes[guild_id][channel.id] && notes[guild_id][channel.id][message.id];
			}

			updateNoteData (note, newMessage) {
				let message = JSON.parse(note.message);
				let channel = JSON.parse(note.channel);
				if (!message || !channel) return;
				let guild_id = channel.guild_id || BDFDB.DiscordConstants.ME;
				notes[guild_id][channel.id][note.id].message = JSON.stringify(newMessage);
				BDFDB.DataUtils.save(notes, this, "notes");
				BDFDB.NotificationUtils.toast(this.labels.toast_noteupdate, {type: "info"});
			}

			removeNoteData (note, noToast = false) {
				let message = JSON.parse(note.message);
				let channel = JSON.parse(note.channel);
				if (!message || !channel) return;
				let guild_id = channel.guild_id || BDFDB.DiscordConstants.ME;
				delete notes[guild_id][channel.id][note.id];
				if (BDFDB.ObjectUtils.isEmpty(notes[guild_id][channel.id])) {
					delete notes[guild_id][channel.id];
					if (BDFDB.ObjectUtils.isEmpty(notes[guild_id])) delete notes[guild_id];
				}
				BDFDB.DataUtils.save(notes, this, "notes");
				if (!noToast) BDFDB.NotificationUtils.toast(this.labels.toast_noteremove, {type: "danger"});
			}


			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							context_pinoption:					"Запишете съобщението",
							context_unpinoption:				"Премахване на бележката",
							context_updateoption:				"Бележката за актуализация",
							popout_filter_all:					"Всички сървъри",
							popout_filter_channel:				"Канал",
							popout_filter_server:				"Сървър",
							popout_note:						"Бележки",
							popout_pinoption:					"Забележка",
							popout_sort_messagetime:			"Дата на съобщението",
							popout_sort_notetime:				"Дата на бележка",
							toast_noteadd:						"Съобщението е добавено към бележника",
							toast_noteremove:					"Съобщението е премахнато от бележника",
							toast_noteupdate:					"Актуализира съобщението в бележника"
						};
					case "cs":		// Czech
						return {
							context_pinoption:					"Poznamenat zprávu",
							context_unpinoption:				"Odebrat poznámku",
							context_updateoption:				"Aktualizovat poznámku",
							popout_filter_all:					"Všechny servery",
							popout_filter_channel:				"Kanál",
							popout_filter_server:				"Server",
							popout_note:						"Poznámky",
							popout_pinoption:					"Poznámka",
							popout_sort_messagetime:			"Datum zprávy",
							popout_sort_notetime:				"Datum poznámky",
							toast_noteadd:						"Zpráva přidána do poznámek",
							toast_noteremove:					"Zpráva odebrána z poznámek",
							toast_noteupdate:					"Zpráva v poznámkách aktualizována"
						};
					case "da":		// Danish
						return {
							context_pinoption:					"Skriv beskeden ned",
							context_unpinoption:				"Fjern noten",
							context_updateoption:				"Opdater noten",
							popout_filter_all:					"Alle servere",
							popout_filter_channel:				"Kanal",
							popout_filter_server:				"Server",
							popout_note:						"Noter",
							popout_pinoption:					"Bemærk",
							popout_sort_messagetime:			"Meddelelsesdato",
							popout_sort_notetime:				"Bemærkdato",
							toast_noteadd:						"Besked føjet til notesbog",
							toast_noteremove:					"Besked fjernet fra notesbog",
							toast_noteupdate:					"Opdateret meddelelsen i notesbogen"
						};
					case "de":		// German
						return {
							context_pinoption:					"Nachricht notieren",
							context_unpinoption:				"Notiz entfernen",
							context_updateoption:				"Notiz aktualisieren",
							popout_filter_all:					"Alle Server",
							popout_filter_channel:				"Kanal",
							popout_filter_server:				"Server",
							popout_note:						"Notizen",
							popout_pinoption:					"Notieren",
							popout_sort_messagetime:			"Nachrichtendatum",
							popout_sort_notetime:				"Notizdatum",
							toast_noteadd:						"Nachricht zum Notizbuch hinzugefügt",
							toast_noteremove:					"Nachricht aus dem Notizbuch entfernt",
							toast_noteupdate:					"Nachricht im Notizbuch aktualisiert"
						};
					case "el":		// Greek
						return {
							context_pinoption:					"Γράψτε το μήνυμα",
							context_unpinoption:				"Αφαιρέστε τη σημείωση",
							context_updateoption:				"Ενημέρωση τη σημείωση",
							popout_filter_all:					"Όλοι οι διακομιστές",
							popout_filter_channel:				"Κανάλι",
							popout_filter_server:				"Υπηρέτης",
							popout_note:						"Σημειώσεις",
							popout_pinoption:					"Σημείωση",
							popout_sort_messagetime:			"Ημερομηνία μηνύματος",
							popout_sort_notetime:				"Σημείωση ημερομηνίας",
							toast_noteadd:						"Το μήνυμα προστέθηκε στο σημειωματάριο",
							toast_noteremove:					"Το μήνυμα καταργήθηκε από το σημειωματάριο",
							toast_noteupdate:					"Ενημερώθηκε το μήνυμα στο σημειωματάριο"
						};
					case "es":		// Spanish
						return {
							context_pinoption:					"Escribe el mensaje",
							context_unpinoption:				"Eliminar la nota",
							context_updateoption:				"Actualiza la nota",
							popout_filter_all:					"Todos los servidores",
							popout_filter_channel:				"Canal",
							popout_filter_server:				"Servidor",
							popout_note:						"Notas",
							popout_pinoption:					"Nota",
							popout_sort_messagetime:			"Fecha del mensaje",
							popout_sort_notetime:				"Fecha della nota",
							toast_noteadd:						"Mensaje agregado al cuaderno",
							toast_noteremove:					"Mensaje eliminado de la libreta",
							toast_noteupdate:					"Se actualizó el mensaje en el cuaderno."
						};
					case "fi":		// Finnish
						return {
							context_pinoption:					"Kirjoita viesti muistiin",
							context_unpinoption:				"Poista muistiinpano",
							context_updateoption:				"Päivitä muistiinpano",
							popout_filter_all:					"Kaikki palvelimet",
							popout_filter_channel:				"Kanava",
							popout_filter_server:				"Palvelin",
							popout_note:						"Muistiinpanoja",
							popout_pinoption:					"Merkintä",
							popout_sort_messagetime:			"Viestin päivämäärä",
							popout_sort_notetime:				"Muistiinpanon päivämäärä",
							toast_noteadd:						"Viesti lisättiin muistikirjaan",
							toast_noteremove:					"Viesti poistettu muistikirjasta",
							toast_noteupdate:					"Päivitetty muistikirjan viesti"
						};
					case "fr":		// French
						return {
							context_pinoption:					"Noter le message",
							context_unpinoption:				"Supprimer la note",
							context_updateoption:				"Mettre à jour la note",
							popout_filter_all:					"Tous les serveurs",
							popout_filter_channel:				"Salon",
							popout_filter_server:				"Serveur",
							popout_note:						"Notes",
							popout_pinoption:					"Note",
							popout_sort_messagetime:			"Date du message",
							popout_sort_notetime:				"Date de la note",
							toast_noteadd:						"Message ajouté au carnet",
							toast_noteremove:					"Message supprimé du carnet",
							toast_noteupdate:					"Mise à jour du message dans le carnet"
						};
					case "hi":		// Hindi
						return {
							context_pinoption:					"नोट संदेश",
							context_unpinoption:				"नोट हटाएं",
							context_updateoption:				"अद्यतन नोट",
							popout_filter_all:					"सभी सर्वर",
							popout_filter_channel:				"चैनल",
							popout_filter_server:				"सर्वर",
							popout_note:						"टिप्पणियाँ",
							popout_pinoption:					"ध्यान दें",
							popout_sort_messagetime:			"संदेश दिनांक",
							popout_sort_notetime:				"नोट दिनांक",
							toast_noteadd:						"संदेश नोटबुक में जोड़ा गया",
							toast_noteremove:					"नोटबुक से संदेश हटाया गया",
							toast_noteupdate:					"नोटबुक में संदेश अपडेट किया गया"
						};
					case "hr":		// Croatian
						return {
							context_pinoption:					"Zapišite poruku",
							context_unpinoption:				"Izbriši bilješku",
							context_updateoption:				"Ažurirajte bilješku",
							popout_filter_all:					"Svi poslužitelji",
							popout_filter_channel:				"Kanal",
							popout_filter_server:				"Poslužitelju",
							popout_note:						"Bilješke",
							popout_pinoption:					"Bilješka",
							popout_sort_messagetime:			"Datum poruke",
							popout_sort_notetime:				"Datum bilješke",
							toast_noteadd:						"Poruka dodana u bilježnicu",
							toast_noteremove:					"Poruka uklonjena iz bilježnice",
							toast_noteupdate:					"Ažurirana je poruka u bilježnici"
						};
					case "hu":		// Hungarian
						return {
							context_pinoption:					"Írja le az üzenetet",
							context_unpinoption:				"Törölje a jegyzetet",
							context_updateoption:				"Frissítse a jegyzetet",
							popout_filter_all:					"Minden szerver",
							popout_filter_channel:				"Csatorna",
							popout_filter_server:				"Szerver",
							popout_note:						"Jegyzetek",
							popout_pinoption:					"Jegyzet",
							popout_sort_messagetime:			"Üzenet dátuma",
							popout_sort_notetime:				"Jegyzet dátuma",
							toast_noteadd:						"Üzenet hozzáadva a jegyzetfüzethez",
							toast_noteremove:					"Üzenet eltávolítva a jegyzetfüzetből",
							toast_noteupdate:					"Frissítette az üzenetet a jegyzetfüzetben"
						};
					case "it":		// Italian
						return {
							context_pinoption:					"Annota il messaggio",
							context_unpinoption:				"Elimina la nota",
							context_updateoption:				"Aggiorna la nota",
							popout_filter_all:					"Tutti i server",
							popout_filter_channel:				"Canale",
							popout_filter_server:				"Server",
							popout_note:						"Appunti",
							popout_pinoption:					"Nota",
							popout_sort_messagetime:			"Messaggio data",
							popout_sort_notetime:				"Nota data",
							toast_noteadd:						"Messaggio aggiunto al taccuino",
							toast_noteremove:					"Messaggio rimosso dal taccuino",
							toast_noteupdate:					"Aggiornato il messaggio nel taccuino"
						};
					case "ja":		// Japanese
						return {
							context_pinoption:					"メッセージを書き留めます",
							context_unpinoption:				"メモを削除します",
							context_updateoption:				"メモを更新する",
							popout_filter_all:					"すべてのサーバー",
							popout_filter_channel:				"チャネル",
							popout_filter_server:				"サーバ",
							popout_note:						"ノート",
							popout_pinoption:					"注意",
							popout_sort_messagetime:			"メッセージの日付",
							popout_sort_notetime:				"メモ日",
							toast_noteadd:						"ノートブックにメッセージを追加",
							toast_noteremove:					"ノートブックからメッセージが削除されました",
							toast_noteupdate:					"ノートブックのメッセージを更新しました"
						};
					case "ko":		// Korean
						return {
							context_pinoption:					"메시지를 적어",
							context_unpinoption:				"메모 삭제",
							context_updateoption:				"메모 업데이트",
							popout_filter_all:					"모든 서버",
							popout_filter_channel:				"채널",
							popout_filter_server:				"섬기는 사람",
							popout_note:						"메모",
							popout_pinoption:					"노트",
							popout_sort_messagetime:			"메시지 날짜",
							popout_sort_notetime:				"메모 날짜",
							toast_noteadd:						"노트북에 추가 된 메시지",
							toast_noteremove:					"노트북에서 메시지가 제거되었습니다.",
							toast_noteupdate:					"노트북의 메시지를 업데이트했습니다."
						};
					case "lt":		// Lithuanian
						return {
							context_pinoption:					"Užrašykite žinutę",
							context_unpinoption:				"Ištrinkite užrašą",
							context_updateoption:				"Atnaujinkite užrašą",
							popout_filter_all:					"Visi serveriai",
							popout_filter_channel:				"Kanalą",
							popout_filter_server:				"Serverio",
							popout_note:						"Pastabos",
							popout_pinoption:					"Pastaba",
							popout_sort_messagetime:			"Pranešimo data",
							popout_sort_notetime:				"Užrašo data",
							toast_noteadd:						"Pranešimas pridėtas prie užrašų knygelės",
							toast_noteremove:					"Pranešimas pašalintas iš užrašų knygelės",
							toast_noteupdate:					"Atnaujino pranešimą užrašų knygutėje"
						};
					case "nl":		// Dutch
						return {
							context_pinoption:					"Schrijf het bericht op",
							context_unpinoption:				"Verwijder de notitie",
							context_updateoption:				"Werk de notitie bij",
							popout_filter_all:					"Alle servers",
							popout_filter_channel:				"Kanaal",
							popout_filter_server:				"Server",
							popout_note:						"Notities",
							popout_pinoption:					"Notitie",
							popout_sort_messagetime:			"Datum bericht",
							popout_sort_notetime:				"Datum notitie",
							toast_noteadd:						"Bericht toegevoegd aan notitieblok",
							toast_noteremove:					"Bericht verwijderd uit notitieblok",
							toast_noteupdate:					"Het bericht in het notitieblok bijgewerkt"
						};
					case "no":		// Norwegian
						return {
							context_pinoption:					"Skriv ned meldingen",
							context_unpinoption:				"Slett notatet",
							context_updateoption:				"Oppdater notatet",
							popout_filter_all:					"Alle servere",
							popout_filter_channel:				"Kanal",
							popout_filter_server:				"Server",
							popout_note:						"Notater",
							popout_pinoption:					"Merk",
							popout_sort_messagetime:			"Meldingsdato",
							popout_sort_notetime:				"Merkdato",
							toast_noteadd:						"Melding lagt til notatbok",
							toast_noteremove:					"Melding fjernet fra notatblokken",
							toast_noteupdate:					"Oppdaterte meldingen i notatboken"
						};
					case "pl":		// Polish
						return {
							context_pinoption:					"Zapisz wiadomość",
							context_unpinoption:				"Usuń notatkę",
							context_updateoption:				"Zaktualizuj notatkę",
							popout_filter_all:					"Wszystkie serwery",
							popout_filter_channel:				"Kanał",
							popout_filter_server:				"Serwer",
							popout_note:						"Notatki",
							popout_pinoption:					"Uwaga",
							popout_sort_messagetime:			"Data wiadomości",
							popout_sort_notetime:				"Data notatki",
							toast_noteadd:						"Wiadomość dodana do notatnika",
							toast_noteremove:					"Wiadomość została usunięta z notatnika",
							toast_noteupdate:					"Zaktualizowano wiadomość w notatniku"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							context_pinoption:					"Anotar mensagem",
							context_unpinoption:				"Desanotar mensagem",
							context_updateoption:				"Atualizar nota",
							popout_filter_all:					"Todos os servidores",
							popout_filter_channel:				"Canal",
							popout_filter_server:				"Servidor",
							popout_note:						"Notas",
							popout_pinoption:					"Nota",
							popout_sort_messagetime:			"Data da mensagem",
							popout_sort_notetime:				"Data da nota",
							toast_noteadd:						"Mensagem adicionada ao caderno",
							toast_noteremove:					"Mensagem removida do caderno",
							toast_noteupdate:					"Atualizou a mensagem no caderno"
						};
					case "ro":		// Romanian
						return {
							context_pinoption:					"Notează mesajul",
							context_unpinoption:				"Ștergeți nota",
							context_updateoption:				"Actualizați nota",
							popout_filter_all:					"Toate serverele",
							popout_filter_channel:				"Canal",
							popout_filter_server:				"Server",
							popout_note:						"Note",
							popout_pinoption:					"Notă",
							popout_sort_messagetime:			"Mesajului data",
							popout_sort_notetime:				"Notați data",
							toast_noteadd:						"Mesaj adăugat în caiet",
							toast_noteremove:					"Mesaj eliminat din caiet",
							toast_noteupdate:					"Am actualizat mesajul din caiet"
						};
					case "ru":		// Russian
						return {
							context_pinoption:					"Сохранить сообщение",
							context_unpinoption:				"Удалить из сохранённых",
							context_updateoption:				"Обновить в сохранённых",
							popout_filter_all:					"Все сервера",
							popout_filter_channel:				"Канал",
							popout_filter_server:				"Сервер",
							popout_note:						"Сохранённые сообщения",
							popout_pinoption:					"Запись",
							popout_sort_messagetime:			"Дата отправки",
							popout_sort_notetime:				"Дата сохранения",
							toast_noteadd:						"Сообщение сохранено",
							toast_noteremove:					"Сообщение удалено из сохранённых",
							toast_noteupdate:					"Сообщение обновлено в сохранённых"
						};
					case "sv":		// Swedish
						return {
							context_pinoption:					"Skriv ner meddelandet",
							context_unpinoption:				"Radera anteckningen",
							context_updateoption:				"Uppdatera anteckningen",
							popout_filter_all:					"Alla servrar",
							popout_filter_channel:				"Kanal",
							popout_filter_server:				"Server",
							popout_note:						"Anteckningar",
							popout_pinoption:					"Notera",
							popout_sort_messagetime:			"Meddelandedatum",
							popout_sort_notetime:				"Noteradatum",
							toast_noteadd:						"Meddelande tillagt anteckningsbok",
							toast_noteremove:					"Meddelandet har tagits bort från anteckningsboken",
							toast_noteupdate:					"Uppdaterat meddelandet i anteckningsboken"
						};
					case "th":		// Thai
						return {
							context_pinoption:					"จดข้อความ",
							context_unpinoption:				"ลบบันทึก",
							context_updateoption:				"อัปเดตบันทึก",
							popout_filter_all:					"เซิร์ฟเวอร์ทั้งหมด",
							popout_filter_channel:				"ช่อง",
							popout_filter_server:				"เซิร์ฟเวอร์",
							popout_note:						"หมายเหตุ",
							popout_pinoption:					"บันทึก",
							popout_sort_messagetime:			"วันที่ส่งข้อความ",
							popout_sort_notetime:				"วันที่หมายเหตุ",
							toast_noteadd:						"เพิ่มข้อความในสมุดบันทึกแล้ว",
							toast_noteremove:					"ข้อความถูกลบออกจากสมุดบันทึก",
							toast_noteupdate:					"อัปเดตข้อความในสมุดบันทึก"
						};
					case "tr":		// Turkish
						return {
							context_pinoption:					"Mesajı yazın",
							context_unpinoption:				"Notu silin",
							context_updateoption:				"Notu güncelleyin",
							popout_filter_all:					"Tüm sunucular",
							popout_filter_channel:				"Kanal",
							popout_filter_server:				"Sunucu",
							popout_note:						"Notlar",
							popout_pinoption:					"Not",
							popout_sort_messagetime:			"Mesaj tarihi",
							popout_sort_notetime:				"Not tarihi",
							toast_noteadd:						"Not defterine mesaj eklendi",
							toast_noteremove:					"Mesaj not defterinden kaldırıldı",
							toast_noteupdate:					"Defterdeki mesaj güncellendi"
						};
					case "uk":		// Ukrainian
						return {
							context_pinoption:					"Запишіть повідомлення",
							context_unpinoption:				"Видаліть нотатку",
							context_updateoption:				"Оновіть нотатку",
							popout_filter_all:					"Усі сервери",
							popout_filter_channel:				"Каналу",
							popout_filter_server:				"Сервер",
							popout_note:						"Нотатки",
							popout_pinoption:					"Примітка",
							popout_sort_messagetime:			"Дата повідомлення",
							popout_sort_notetime:				"Дата примітки",
							toast_noteadd:						"Повідомлення додано до блокнота",
							toast_noteremove:					"Повідомлення видалено з блокнота",
							toast_noteupdate:					"Оновлено повідомлення в блокноті"
						};
					case "vi":		// Vietnamese
						return {
							context_pinoption:					"Viết lại tin nhắn",
							context_unpinoption:				"Xóa ghi chú",
							context_updateoption:				"Cập nhật ghi chú",
							popout_filter_all:					"Tất cả các máy chủ",
							popout_filter_channel:				"Kênh",
							popout_filter_server:				"Người phục vụ",
							popout_note:						"Ghi chú",
							popout_pinoption:					"Ghi chú",
							popout_sort_messagetime:			"Ngày nhắn tin",
							popout_sort_notetime:				"Ghi chú ngày",
							toast_noteadd:						"Đã thêm tin nhắn vào sổ tay",
							toast_noteremove:					"Đã xóa tin nhắn khỏi sổ ghi chép",
							toast_noteupdate:					"Đã cập nhật tin nhắn trong sổ tay"
						};
					case "zh-CN":	// Chinese (China)
						return {
							context_pinoption:					"写下消息",
							context_unpinoption:				"删除笔记",
							context_updateoption:				"更新笔记",
							popout_filter_all:					"所有服务器",
							popout_filter_channel:				"渠道",
							popout_filter_server:				"服务器",
							popout_note:						"笔记",
							popout_pinoption:					"注意",
							popout_sort_messagetime:			"留言日期",
							popout_sort_notetime:				"备注日期",
							toast_noteadd:						"邮件已添加到笔记本",
							toast_noteremove:					"邮件已从笔记本中删除",
							toast_noteupdate:					"更新了笔记本中的消息"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							context_pinoption:					"寫下消息",
							context_unpinoption:				"刪除筆記",
							context_updateoption:				"更新筆記",
							popout_filter_all:					"所有服務器",
							popout_filter_channel:				"渠道",
							popout_filter_server:				"服務器",
							popout_note:						"筆記",
							popout_pinoption:					"注意",
							popout_sort_messagetime:			"留言日期",
							popout_sort_notetime:				"備註日期",
							toast_noteadd:						"郵件已添加到筆記本",
							toast_noteremove:					"郵件已從筆記本中刪除",
							toast_noteupdate:					"更新了筆記本中的消息"
						};
					default:		// English
						return {
							context_pinoption:					"Note Message",
							context_unpinoption:				"Remove Note",
							context_updateoption:				"Update Note",
							popout_filter_all:					"All Servers",
							popout_filter_channel:				"Channel",
							popout_filter_server:				"Server",
							popout_note:						"Notes",
							popout_pinoption:					"Note",
							popout_sort_messagetime:			"Message Date",
							popout_sort_notetime:				"Note Date",
							toast_noteadd:						"Message added to Notebook",
							toast_noteremove:					"Message removed from Notebook",
							toast_noteupdate:					"Updated the Message in the Notebook"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
