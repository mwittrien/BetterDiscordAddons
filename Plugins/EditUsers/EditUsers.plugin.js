//META{"name":"EditUsers","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditUsers","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EditUsers/EditUsers.plugin.js"}*//

class EditUsers {
	getName () {return "EditUsers";}

	getVersion () {return "3.6.3";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to change the icon, name, tag and color of users.";}

	constructor () {
		this.changelog = {
			"improved":[["Switching to React","Using React to create settings and modals, faster and more less likely to break"]]
		};

		this.labels = {};

		this.patchModules = {
			"ChannelTextArea":"componentDidMount",
			"MemberListItem":["componentDidMount","componentDidUpdate"],
			"UserPopout":["componentDidMount","componentDidUpdate"],
			"UserProfile":["componentDidMount","componentDidUpdate"],
			"FriendRow":"componentDidMount",
			"VoiceUser":["componentDidMount","componentDidUpdate"],
			"Account":["componentDidMount","componentDidUpdate"],
			"AuditLog":"componentDidMount",
			"BannedCard":"render",
			"InviteCard":"render",
			"MemberCard":"render",
			"InvitationCard":"componentDidMount",
			"TypingUsers":"componentDidUpdate",
			"MessageUsername":["componentDidMount","componentDidUpdate"],
			"DirectMessage":"componentDidMount",
			"CallAvatar":"componentDidMount",
			"VideoTile":"componentDidMount",
			"PictureInPictureVideo":"componentDidMount",
			"PrivateChannel":["componentDidMount","componentDidUpdate"],
			"HeaderBar":["componentDidMount","componentDidUpdate"],
			"HeaderBarContainer":["componentDidMount","componentDidUpdate"],
			"Clickable":"componentDidMount",
			"MessageContent":["componentDidMount","componentDidUpdate"],
			"StandardSidebarView":"componentWillUnmount"
		};
	}

	initConstructor () {
		this.avatarselector = BDFDB.dotCNC.guildicon + BDFDB.dotCNC.avatar + BDFDB.dotCNC.callavatarwrapper + BDFDB.dotCN.voiceavatarcontainer;

		this.css = `
			${BDFDB.dotCN.bottag} {
				line-height: 13px;
				height: 13px;
				top: unset;
				bottom: 0px;
				position: relative;
				margin: 0 0 0 1ch;
			}
			${BDFDB.dotCN.userpopoutheaderbottagwithnickname} {
				bottom: 4px;
			}
			${BDFDB.dotCN.userpopoutheaderbottagwithnickname} {
				bottom: 0px;
			}
			${BDFDB.dotCNS.userpopoutheadernamewrapper + BDFDB.dotCN.bottag},
			${BDFDB.dotCN.userprofilebottag},
			${BDFDB.dotCN.bottagmessagecozy} {
				bottom: 2px;
			}
			${BDFDB.dotCN.bottagmessagecompact} {
				margin-right: 6px;
				bottom: 3px;
			}`;

		this.defaults = {
			settings: {
				changeInChatTextarea:	{value:true, 	description:"Chat Textarea"},
				changeInChatWindow:		{value:true, 	description:"Messages"},
				changeInMentions:		{value:true, 	description:"Mentions"},
				changeInVoiceChat:		{value:true, 	description:"Voice Channels"},
				changeInMemberList:		{value:true, 	description:"Member List"},
				changeInRecentDms:		{value:true, 	description:"Direct Message Notifications"},
				changeInDmsList:		{value:true, 	description:"Direct Message List"},
				changeInDmHeader:		{value:true, 	description:"Direct Message Header"},
				changeInDmCalls:		{value:true, 	description:"Calls/ScreenShares"},
				changeInTyping:			{value:true, 	description:"Typing List"},
				changeInFriendList:		{value:true, 	description:"Friend List"},
				changeInInviteList:		{value:true, 	description:"Invite List"},
				changeInActivity:		{value:true, 	description:"Activity Page"},
				changeInUserPopout:		{value:true, 	description:"User Popouts"},
				changeInUserProfil:		{value:true, 	description:"User Profile Modal"},
				changeInAutoComplete:	{value:true, 	description:"Autocomplete Menu"},
				changeInAuditLog:		{value:true, 	description:"Audit Log"},
				changeInMemberLog:		{value:true, 	description:"Member Log"},
				changeInSearchPopout:	{value:true, 	description:"Search Popout"},
				changeInUserAccount:	{value:true, 	description:"Your Account Information"},
				changeInAppTitle:		{value:true, 	description:"Discord App Title (DMs)"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var settings = BDFDB.getAllData(this, "settings");
		var settingsitems = [], inneritems = [];
		
		for (let key in settings) (!this.defaults.settings[key].inner ? settingsitems : inneritems).push(BDFDB.React.createElement(BDFDB.LibraryComponents.SettingsSwitch, {
			className: BDFDB.disCN.marginbottom8,
			plugin: this,
			keys: ["settings", key],
			label: this.defaults.settings[key].description,
			value: settings[key]
		}));
		settingsitems.push(BDFDB.React.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
			title: "Change Users in:"
			children: inneritems
		}));
		settingsitems.push(BDFDB.React.createElement(BDFDB.LibraryComponents.SettingsItem, {
			type: "BUTTON",
			className: BDFDB.disCN.marginbottom8,
			color: BDFDB.LibraryComponents.Button.Colors.RED,
			label: "Reset all Users",
			onClick: _ => {
				BDFDB.openConfirmModal(this, "Are you sure you want to reset all users?", () => {
					BDFDB.removeAllData(this, "users");
					this.forceUpdateAll();
				});
			},
			children: BDFDB.LanguageStrings.RESET
		}));
		
		return BDFDB.createSettingsPanel(this, settingsitems);
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
					if (body) {
						libraryScript = document.createElement("script");
						libraryScript.setAttribute("id", "BDFDBLibraryScript");
						libraryScript.setAttribute("type", "text/javascript");
						libraryScript.setAttribute("date", performance.now());
						libraryScript.innerText = body;
						document.head.appendChild(libraryScript);
					}
					this.initialize();
				});
			}, 15000);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			var observer = new MutationObserver(() => {this.changeAppTitle();});
			BDFDB.addObserver(this, document.head.querySelector("title"), {name:"appTitleObserver",instance:observer}, {childList:true});
			
			this.forceUpdateAll();
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			let data = BDFDB.loadAllData(this, "users");
			BDFDB.removeAllData(this, "users");
			try {this.forceUpdateAll();} catch (err) {}
			BDFDB.saveAllData(data, this, "users");

			BDFDB.removeEles(".autocompleteEditUsers", ".autocompleteEditUsersRow");

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions
	
	onUserContextMenu (instance, menu, returnvalue) {
		if (instance.props && instance.props.user && !menu.querySelector(`${this.name}-contextMenuSubItem`)) {
			let [children, index] = BDFDB.getContextMenuGroupAndIndex(returnvalue, ["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]);
			const itemgroup = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
				children: [
					BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuSubItem, {
						label: this.labels.context_localusersettings_text,
						className: `BDFDB-contextMenuSubItem ${this.name}-contextMenuSubItem ${this.name}-usersettings-contextMenuSubItem`,
						render: [BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
							className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
							children: [
								BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
									label: this.labels.submenu_usersettings_text,
									className: `BDFDB-ContextMenuItem ${this.name}-ContextMenuItem ${this.name}-usersettings-ContextMenuItem`,
									action: e => {
										BDFDB.closeContextMenu(menu);
										this.showUserSettings(instance.props.user);
									}
								}),
								BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
									label: this.labels.submenu_resetsettings_text,
									className: `BDFDB-ContextMenuItem ${this.name}-ContextMenuItem ${this.name}-resetsettings-ContextMenuItem`,
									disabled: !BDFDB.loadData(instance.props.user.id, this, "users"),
									action: e => {
										BDFDB.closeContextMenu(menu);
										BDFDB.removeData(instance.props.user.id, this, "users");
										this.forceUpdateAll();
									}
								})
							]
						})]
					})
				]
			});
			if (index > -1) children.splice(index, 0, itemgroup);
			else children.push(itemgroup);
		}
	}
	
	forceUpdateAll () {
		this.changeAppTitle();
		BDFDB.WebModules.forceAllUpdates(this);
	}

	showUserSettings (info) {
		let data = BDFDB.loadData(info.id, this, "users") || {};
		let member = BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), info.id) || {};
		
		BDFDB.openModal(this, {
			size: "MEDIUM",
			header: this.labels.modal_header_text,
			subheader: member.nick || info.username,
			children: [
				BDFDB.React.createElement(BDFDB.LibraryComponents.ModalTabContent, {
					tab: this.labels.modal_tabheader1_text,
					children: [
						BDFDB.React.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_username_text,
							className: BDFDB.disCN.marginbottom20 + " input-username",
							children: [
								BDFDB.React.createElement(BDFDB.LibraryComponents.TextInput, {
									value: data.name,
									placeholder: member.nick || info.username,
									autoFocus: true
								})
							]
						}),
						BDFDB.React.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_usertag_text,
							className: BDFDB.disCN.marginbottom20 + " input-usertag",
							children: [
								BDFDB.React.createElement(BDFDB.LibraryComponents.TextInput, {
									value: data.tag
								})
							]
						}),
						BDFDB.React.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_useravatar_text,
							className: BDFDB.disCN.marginbottom8 + " input-useravatar",
							children: [
								BDFDB.React.createElement(BDFDB.LibraryComponents.TextInput, {
									inputClassName: !data.removeIcon && data.url ? BDFDB.disCN.inputsuccess : null,
									value: data.url,
									placeholder: BDFDB.getUserAvatar(info.id),
									disabled: data.removeIcon,
									onFocus: e => {
										this.createNoticeTooltip(e.target);
									},
									onChange: (value, instance) => {
										this.checkUrl(value, instance);
									}
								})
							]
						}),
						BDFDB.React.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Switch",
							className: BDFDB.disCN.marginbottom20 + " input-removeicon",
							label: this.labels.modal_removeicon_text,
							value: data.removeIcon,
							onChange: (value, instance) => {
								let avatarinputins = BDFDB.getReactValue(instance, "_reactInternalFiber.return.child.sibling.sibling.child.child.sibling.child.stateNode");
								if (avatarinputins) {
									avatarinputins.props.inputClassName = null;
									avatarinputins.props.disabled = value;
									avatarinputins.forceUpdate();
								}
							}
						})
					]
				}),
				BDFDB.React.createElement(BDFDB.LibraryComponents.ModalTabContent, {
					tab: this.labels.modal_tabheader2_text,
					children: [
						BDFDB.React.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_colorpicker1_text,
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.React.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color1,
									number: 1
								})
							]
						}),
						BDFDB.React.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_colorpicker2_text,
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.React.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color2,
									number: 2
								})
							]
						})
					]
				}),
				BDFDB.React.createElement(BDFDB.LibraryComponents.ModalTabContent, {
					tab: this.labels.modal_tabheader3_text,
					children: [
						BDFDB.React.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_colorpicker3_text,
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.React.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color3,
									number: 3,
									disabled: data.ignoreTagColor
								})
							]
						}),
						BDFDB.React.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_colorpicker4_text,
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.React.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color4,
									number: 4,
									disabled: data.ignoreTagColor
								})
							]
						}),
						BDFDB.React.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Switch",
							className: BDFDB.disCN.marginbottom20 + " input-ignoretagcolor",
							label: this.labels.modal_ignoretagcolor_text,
							value: data.ignoreTagColor,
							onChange: (value, instance) => {
								let colorpicker3ins = BDFDB.getReactValue(instance, "_reactInternalFiber.return.child.child.child.sibling.child.stateNode");
								let colorpicker4ins = BDFDB.getReactValue(instance, "_reactInternalFiber.return.child.sibling.child.child.sibling.child.stateNode");
								if (colorpicker3ins) colorpicker3ins.setState({disabled: value});
								if (colorpicker4ins) colorpicker4ins.setState({disabled: value});
							}
						})
					]
				})
			],
			buttons: [{
				contents: BDFDB.LanguageStrings.SAVE,
				color: "BRAND",
				close: true,
				click: modal => {
					let olddata = Object.assign({}, data);
					
					let usernameinput = modal.querySelector(".input-username " + BDFDB.dotCN.input);
					let usertaginput = modal.querySelector(".input-usertag " + BDFDB.dotCN.input);
					let useravatarinput = modal.querySelector(".input-useravatar " + BDFDB.dotCN.input);
					let removeiconinput = modal.querySelector(".input-removeicon " + BDFDB.dotCN.switchinner);
					let ignoretagcolorinput = modal.querySelector(".input-ignoretagcolor " + BDFDB.dotCN.switchinner);
					
					data.name = usernameinput.value.trim() || null;
					data.tag = usertaginput.value.trim() || null;
					data.url = (!data.removeIcon && BDFDB.containsClass(useravatarinput, BDFDB.disCN.inputsuccess) ? useravatarinput.value.trim() : null) || null;
					data.removeIcon = removeiconinput.checked;
					data.ignoreTagColor = ignoretagcolorinput.checked;

					data.color1 = BDFDB.getSwatchColor(modal, 1);
					data.color2 = BDFDB.getSwatchColor(modal, 2);
					data.color3 = BDFDB.getSwatchColor(modal, 3);
					data.color4 = BDFDB.getSwatchColor(modal, 4);

					let changed = false;
					if (Object.keys(data).every(key => data[key] == null || data[key] == false) && (changed = true)) BDFDB.removeData(info.id, this, "users");
					else if (!BDFDB.equals(olddata, data) && (changed = true)) BDFDB.saveData(info.id, data, this, "users");
					if (changed) this.forceUpdateAll();
				}
			}]
		});
	}
	
	processChannelTextArea (instance, wrapper, returnvalue) {
		let channel = BDFDB.getReactValue(instance, "props.channel");
		if (channel) {
			var textarea = wrapper.querySelector("textarea");
			if (!textarea) return;
			if (channel.type == 1 && instance.props.type == "normal" && !instance.props.disabled) {
				let user = BDFDB.LibraryModules.UserStore.getUser(channel.recipients[0]);
				if (user) {
					let data = this.getUserData(user.id, wrapper);
					textarea.setAttribute("placeholder", BDFDB.LanguageStrings.TEXTAREA_PLACEHOLDER.replace("{{channel}}", "@" + (data.name || user.username)));
				}
			}
			BDFDB.removeEventListener(this, textarea);
			if (BDFDB.getData("changeInAutoComplete", this, "settings")) {
				BDFDB.addEventListener(this, textarea, "keydown", e => {
					let autocompletemenu = textarea.parentElement.querySelector(BDFDB.dotCN.autocomplete);
					if (autocompletemenu && (e.which == 9 || e.which == 13)) {
						if (BDFDB.containsClass(autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected).parentElement, "autocompleteEditUsersRow")) {
							BDFDB.stopEvent(e);
							this.swapWordWithMention(textarea);
						}
					}
					else if (autocompletemenu && (e.which == 38 || e.which == 40)) {
						let autocompleteitems = autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselectable + ":not(.autocompleteEditUsersSelector)");
						let selected = autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected);
						if (BDFDB.containsClass(selected, "autocompleteEditUsersSelector") || autocompleteitems[e.which == 38 ? 0 : (autocompleteitems.length-1)] == selected) {
							BDFDB.stopEvent(e);
							let next = this.getNextSelection(autocompletemenu, null, e.which == 38 ? false : true);
							BDFDB.removeClass(selected, BDFDB.disCN.autocompleteselected);
							BDFDB.addClass(selected, BDFDB.disCN.autocompleteselector);
							BDFDB.addClass(next, BDFDB.disCN.autocompleteselected);
						}
					}
					else if (textarea.value && !e.shiftKey && e.which == 13 && !autocompletemenu && textarea.value.indexOf("s/") != 0) {
						this.format = true;
						textarea.dispatchEvent(new Event("input"));
					}
					else if (!e.ctrlKey && e.which != 16 && textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length) {
						clearTimeout(textarea.EditUsersAutocompleteTimeout);
						textarea.EditUsersAutocompleteTimeout = setTimeout(() => {this.addAutoCompleteMenu(textarea, channel);},100);
					}

					if (!e.ctrlKey && e.which != 38 && e.which != 40 && !(e.which == 39 && textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length)) BDFDB.removeEles(".autocompleteEditUsers", ".autocompleteEditUsersRow");
				});
				BDFDB.addEventListener(this, textarea, "click", e => {
					if (textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length) setImmediate(() => {this.addAutoCompleteMenu(textarea, channel);});
				});
			}
		}
	}

	processMemberListItem (instance, wrapper, returnvalue) {
		let username = wrapper.querySelector(BDFDB.dotCN.memberusername);
		if (username) {
			this.changeName(instance.props.user, username);
			this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
			this.addTag(instance.props.user, username.parentElement, BDFDB.disCN.bottagmember);
		}
	}

	processUserPopout (instance, wrapper, returnvalue) {
		let username = wrapper.querySelector(BDFDB.dotCNC.userpopoutheadertagusernamenonickname + BDFDB.dotCN.userpopoutheadernickname);
		if (username) {
			this.changeName(instance.props.user, username);
			this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
			this.addTag(instance.props.user, username.parentElement, BDFDB.disCN.bottagnametag, wrapper);
		}
	}

	processUserProfile (instance, wrapper, returnvalue) {
		let username = wrapper.querySelector(BDFDB.dotCN.userprofileusername);
		if (username) {
			this.changeName(instance.props.user, username);
			this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
			this.addTag(instance.props.user, username.parentElement, BDFDB.disCNS.userprofilebottag + BDFDB.disCN.bottagnametag, wrapper);
		}
	}

	processFriendRow (instance, wrapper, returnvalue) {
		let username = wrapper.querySelector(BDFDB.dotCN.friendsusername);
		if (username) {
			this.changeName(instance.props.user, username);
			this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
		}
	}

	processVoiceUser (instance, wrapper, returnvalue) {
		let user = instance.props.user;
		if (user && wrapper.className) {
			this.changeVoiceUser(user, wrapper.querySelector(BDFDB.dotCN.voicename), instance.props.speaking);
			this.changeAvatar(user, this.getAvatarDiv(wrapper));
		}
	}

	processAccount (instance, wrapper, returnvalue) {
		let user = BDFDB.getReactValue(instance, "_reactInternalFiber.child.stateNode.props.currentUser");
		if (user) {
			this.changeName(user, wrapper.querySelector(BDFDB.dotCN.accountinfodetails).firstElementChild);
			this.changeAvatar(user, this.getAvatarDiv(wrapper));
		}
	}

	processMessageUsername (instance, wrapper, returnvalue) {
		let message = BDFDB.getReactValue(instance, "props.message");
		if (message) {
			let username = wrapper.querySelector(BDFDB.dotCN.messageusername);
			if (username) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id) || {};
				this.changeName(message.author, username, channel.guild_id);
				if (!BDFDB.containsClass(wrapper.parentElement, BDFDB.disCN.messageheadercompact)) this.changeAvatar(message.author, this.getAvatarDiv(wrapper));
				let messagegroup = BDFDB.getParentEle(BDFDB.dotCN.messagegroup, wrapper);
				this.addTag(message.author, wrapper, BDFDB.containsClass(messagegroup, BDFDB.disCN.messagegroupcozy) ? BDFDB.disCN.bottagmessagecozy : BDFDB.disCN.bottagmessagecompact);
			}
		}
	}

	processAuditLog (instance, wrapper, returnvalue) {
		let log = BDFDB.getReactValue(instance, "props.log");
		if (log && log.user) {
			let hooks = wrapper.querySelectorAll(BDFDB.dotCN.auditloguserhook);
			let guild_id = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.guildId");
			if (hooks.length > 0) this.changeName2(log.user, hooks[0].firstChild, guild_id);
			if (hooks.length > 1 && log.targetType == "USER") this.changeName2(log.target, hooks[1].firstChild, guild_id);
		}
	}

	processBannedCard (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.user && instance.props.guild) {
			let username = wrapper.querySelector(BDFDB.dotCN.guildsettingsbannedusername);
			if (username) {
				this.changeName3(instance.props.user, username);
				this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
			}
		}
	}

	processInviteCard (instance, wrapper, returnvalue) {
		let invite = BDFDB.getReactValue(instance, "props.invite");
		if (invite && invite.inviter && invite.guild) {
			let username = wrapper.querySelector(BDFDB.dotCN.username);
			if (username) {
				this.changeName2(invite.inviter, username, invite.guild.id);
				this.changeAvatar(invite.inviter, this.getAvatarDiv(wrapper));
			}
		}
	}

	processMemberCard (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.user && instance.props.guild) {
			let username = wrapper.querySelector(BDFDB.dotCN.guildsettingsmembername);
			if (username) {
				this.changeName2(instance.props.user, username, instance.props.guild.id);
				this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
			}
		}
	}

	processInvitationCard (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.user) {
			let username = wrapper.querySelector(BDFDB.dotCN.invitemodalinviterowname);
			if (username) {
				this.changeName3(instance.props.user, username);
				this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
			}
		}
	}

	processTypingUsers (instance, wrapper, returnvalue) {
		let users = !instance.props.typingUsers ? [] : Object.keys(instance.props.typingUsers).filter(id => id != BDFDB.myData.id).filter(id => !BDFDB.LibraryModules.FriendUtils.isBlocked(id)).map(id => BDFDB.LibraryModules.UserStore.getUser(id)).filter(id => id != null);
		wrapper.querySelectorAll(BDFDB.dotCNS.typing + "strong").forEach((username, i) => {
			if (users[i] && username) this.changeName2(users[i], username);
		});
	}

	processDirectMessage (instance, wrapper, returnvalue) {
		let channel = BDFDB.getReactValue(instance, "props.channel");
		if (channel && channel.type == 1) {
			let user = BDFDB.LibraryModules.UserStore.getUser(channel.recipients[0]);
			if (user) {
				let avatar = this.getAvatarDiv(wrapper);
				if (avatar) {
					this.changeAvatar(user, avatar);
					this.changeTooltip(user, avatar, "right");
				}
			}
		}
	}

	processCallAvatar (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.id) {
			let user = BDFDB.LibraryModules.UserStore.getUser(instance.props.id);
			if (!user) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(instance.props.id);
				if (channel && channel.type == 1) user = BDFDB.LibraryModules.UserStore.getUser(channel.recipients[0]);
			}
			if (user) {
				this.changeName2(user, wrapper.parentElement.querySelector(BDFDB.dotCN.callmembers));
				let avatar = this.getAvatarDiv(wrapper);
				if (avatar) {
					this.changeAvatar(user, avatar);
					if (BDFDB.containsClass(avatar.parentElement, BDFDB.disCN.callvideo)) this.changeTooltip(user, avatar.parentElement, "left");
				}
			}
		}
	}

	processVideoTile (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.user) this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
	}

	processPictureInPictureVideo (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.backgroundKey) {
			let user = BDFDB.LibraryModules.UserStore.getUser(instance.props.backgroundKey);
			if (user) this.changeAvatar(user, this.getAvatarDiv(wrapper));
		}
	}

	processPrivateChannel (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.user) {
			let username = wrapper.querySelector(BDFDB.dotCN.namecontainername);
			this.changePrivateChannel(instance.props.user, username && username.firstElementChild ? username.firstElementChild : username);
			this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
		}
	}

	processHeaderBarContainer (instance, wrapper, returnvalue) {
		this.processHeaderBar(instance, wrapper);
	}

	processHeaderBar (instance, wrapper, returnvalue) {
		let channel_id = BDFDB.getReactValue(instance, "props.channelId") || BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.channelId");
		if (channel_id) {
			let channelname = wrapper.querySelector(BDFDB.dotCN.channelheaderheaderbartitle);
			if (channelname) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channel_id);
				if (channel) {
					if (channel.type == 1) this.changeName(BDFDB.LibraryModules.UserStore.getUser(channel.recipients[0]), channelname);
					else {
						if (channelname.EditUsersChangeObserver && typeof channelname.EditUsersChangeObserver.disconnect == "function") channelname.EditUsersChangeObserver.disconnect();
						if (BDFDB.isPluginEnabled("EditChannels")) BDFDB.getPlugin("EditChannels").changeChannel(channel, channelname);
						else {
							channelname.style.removeProperty("color");
							channelname.style.removeProperty("background");
							BDFDB.setInnerText(channelname, channel.name);
						}
					}
				}
			}
		}
	}

	processClickable (instance, wrapper, returnvalue) {
		if (!wrapper || !instance.props || !instance.props.className) return;
		if (instance.props.tag == "a" && instance.props.className.indexOf(BDFDB.disCN.anchorunderlineonhover) > -1) {
			if (BDFDB.containsClass(wrapper.parentElement, BDFDB.disCN.messagesystemcontent) && wrapper.parentElement.querySelector("a") == wrapper) {
				let message = BDFDB.getKeyInformation({node:wrapper.parentElement, key:"message", up:true});
				if (message) {
					this.changeName(message.author, wrapper);
					if (message.mentions.length == 1) this.changeName(BDFDB.LibraryModules.UserStore.getUser(message.mentions[0]), wrapper.parentElement.querySelectorAll("a")[1]);
				}
			}
		}
		else if (instance.props.tag == "span" && instance.props.className.indexOf(BDFDB.disCN.mention) > -1) {
			let render = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.stateNode.props.render");
			if (typeof render == "function") {
				var props = render().props;
				if (props && props.user) this.changeMention(props.user, wrapper);
				else if (props && props.userId) this.changeMention(BDFDB.LibraryModules.UserStore.getUser(props.userId), wrapper);
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.quickswitchresult) > -1) {
			let user = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.memoizedProps.user");
			if (user) {
				this.changeName2(user, wrapper.querySelector(BDFDB.dotCN.quickswitchresultmatch));
				this.changeAvatar(user, this.getAvatarDiv(wrapper));
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.autocompleterow) > -1) {
			let user = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.user");
			if (user) {
				this.changeName2(user, wrapper.querySelector(BDFDB.dotCN.marginleft8));
				this.changeAvatar(user, this.getAvatarDiv(wrapper));
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.searchpopoutuser) > -1) {
			let result = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.result");
			if (result && result.user) {
				this.changeName3(result.user, wrapper.querySelector(BDFDB.dotCN.searchpopoutdisplayednick));
				this.changeAvatar(result.user, wrapper.querySelector(BDFDB.dotCN.searchpopoutdisplayavatar));
			}
		}
	}

	processMessageContent (instance, wrapper, returnvalue) {
		let message = BDFDB.getReactValue(instance, "props.message");
		if (message && message.author) {
			let markup = wrapper.querySelector(BDFDB.dotCN.messagemarkup);
			if (markup) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id) || {};
				let member = BDFDB.LibraryModules.MemberStore.getMember(channel.guild_id, message.author.id) || {};
				let data = this.getUserData(message.author.id, wrapper);
				markup.style.setProperty("color", window.settingsCookie["bda-gs-7"] ? BDFDB.colorCONVERT(data.color1 && !BDFDB.isObject(data.color1) ? data.color1 : member.colorString, "RGBA") : null, "important");
			}
		}
	}

	processStandardSidebarView (instance, wrapper, returnvalue) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			this.forceUpdateAll();
		}
	}
	
	checkUrl (url, instance) {
		let input = BDFDB.React.findDOMNode(instance).firstElementChild;
		clearTimeout(instance.checkTimeout);
		if (url == null || !url.trim()) {
			if (input) BDFDB.removeEles(input.tooltip);
			instance.props.inputClassName = null;
			instance.forceUpdate();
		}
		else instance.checkTimeout = setTimeout(() => {
			BDFDB.LibraryRequires.request(url.trim(), (error, response, result) => {
				if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") != -1) {
					if (input) BDFDB.removeEles(input.tooltip);
					instance.props.inputClassName = BDFDB.disCN.inputsuccess;
				}
				else {
					this.createNoticeTooltip(input, true);
					instance.props.inputClassName = BDFDB.disCN.inputerror;
				}
				delete instance.checkTimeout;
				instance.forceUpdate();
			});
		}, 1000);
	}

	createNoticeTooltip (input, isinvalid = false) {
		if (!input) return;
		BDFDB.removeEles(input.tooltip);
		var invalid = isinvalid || BDFDB.containsClass(input, BDFDB.disCN.inputerror);
		var valid = invalid ? false : BDFDB.containsClass(input, BDFDB.disCN.inputsuccess);
		if (invalid || valid) input.tooltip = BDFDB.createTooltip(invalid ? this.labels.modal_invalidurl_text : this.labels.modal_validurl_text, input, {type:"right", selector:"notice-tooltip", color: invalid ? "red" : "green"});
	}

	changeAppTitle () {
		let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
		let title = document.head.querySelector("title");
		if (title && channel && channel.type == 1) {
			let info = BDFDB.LibraryModules.UserStore.getUser(channel.recipients[0]);
			if (info) {
				let data = this.getUserData(info.id, title);
				BDFDB.setInnerText(title, "@" + (data.name || info.username));
			}
		}
	}

	changeName (info, username, guildid = BDFDB.LibraryModules.LastGuildStore.getGuildId()) {
		if (!info || !username || !username.parentElement) return;
		if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
		let data = this.getUserData(info.id, username);
		let member = BDFDB.LibraryModules.MemberStore.getMember(guildid, info.id) || {};
		this.changeBotTags(data, username, member);
		if (data.name || data.color1 || data.color2 || username.getAttribute("changed-by-editusers")) {
			let isBRCenabled = BDFDB.isPluginEnabled("BetterRoleColors");
			let usenick = !BDFDB.containsClass(username, BDFDB.disCN.userprofileusername) && !BDFDB.containsClass(username.parentElement, BDFDB.disCN.userprofilelistname, BDFDB.disCN.accountinfodetails, false) && member.nick;
			let usemembercolor = !BDFDB.containsClass(username.parentElement, BDFDB.disCN.userprofilelistname) && (BDFDB.containsClass(username, BDFDB.disCN.memberusername, BDFDB.disCN.messageusername, false) || isBRCenabled);

			if (BDFDB.isObject(data.color1)) {
				username.style.setProperty("color", BDFDB.colorCONVERT(data.color1[Object.keys(data.color1)[0]], "RGBA"), "important");
				BDFDB.setInnerText(username, BDFDB.htmlToElement(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.colorGRADIENT(data.color1)} !important;">${BDFDB.encodeToHTML(data.name || (usenick ? member.nick : info.username))}</span>`));
			}
			else {
				username.style.setProperty("color", BDFDB.colorCONVERT(data.color1 || (usemembercolor ? member.colorString : null), "RGBA"), "important");
				BDFDB.setInnerText(username, data.name || (usenick ? member.nick : info.username));
			}

			username.style.setProperty("background", BDFDB.isObject(data.color2) ? BDFDB.colorGRADIENT(data.color2) : BDFDB.colorCONVERT(data.color2, "RGBA"), "important");

			if (data.name || data.color1 || data.color2) {
				username.setAttribute("changed-by-editusers", true);
				username.EditUsersChangeObserver = new MutationObserver((changes, _) => {
					username.EditUsersChangeObserver.disconnect();
					this.changeName(info, username);
				});
				username.EditUsersChangeObserver.observe(username, {attributes:true});
			}
			else username.removeAttribute("changed-by-editusers");
		}
	}

	changeName2 (info, username, guildid = BDFDB.LibraryModules.LastGuildStore.getGuildId()) {
		if (!info || !username || !username.parentElement) return;
		if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
		let data = this.getUserData(info.id, username);
		let member = BDFDB.LibraryModules.MemberStore.getMember(guildid, info.id) || {};
		this.changeBotTags(data, username, member);
		if (data.name || data.color1 || username.getAttribute("changed-by-editusers")) {
			if (BDFDB.isObject(data.color1)) {
				username.style.setProperty("color", BDFDB.colorCONVERT(data.color1[Object.keys(data.color1)[0]], "RGBA"), "important");
				BDFDB.setInnerText(username, BDFDB.htmlToElement(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.colorGRADIENT(data.color1)} !important;">${BDFDB.encodeToHTML(data.name || member.nick || info.username)}</span>`));
			}
			else {
				username.style.setProperty("color", BDFDB.colorCONVERT(data.color1 || (BDFDB.isPluginEnabled("BetterRoleColors") ? member.colorString : null), "RGBA"), "important");
				BDFDB.setInnerText(username, data.name || member.nick || info.username);
			}
			if (data.name || data.color1) {
				username.setAttribute("changed-by-editusers", true);
				username.EditUsersChangeObserver = new MutationObserver((changes, _) => {
					username.EditUsersChangeObserver.disconnect();
					this.changeName(info, username);
				});
				username.EditUsersChangeObserver.observe(username, {attributes:true});
			}
			else username.removeAttribute("changed-by-editusers");
		}
	}

	changeName3 (info, username, adddisc = false) {
		if (!info || !username || !username.parentElement) return;
		if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
		let data = this.getUserData(info.id, username);
		if (data.name || data.color1 || username.getAttribute("changed-by-editusers")) {
			if (adddisc) {
				BDFDB.setInnerText(username, BDFDB.htmlToElement(`<span ${data.color1 ? (BDFDB.isObject(data.color1) ? 'style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image:' + BDFDB.colorGRADIENT(data.color1) + ' !important;"' : 'style="color:' + data.color1 + ' !important;"'): ''}>${BDFDB.encodeToHTML(data.name || info.username)}</span><span${typeof adddisc == "string" ? ' class="' + adddisc + '"' : ''}>#${info.discriminator}</span>`));
			}
			else {
				if (BDFDB.isObject(data.color1)) {
					username.style.setProperty("color", BDFDB.colorCONVERT(data.color1[Object.keys(data.color1)[0]], "RGBA"), "important");
					BDFDB.setInnerText(username, BDFDB.htmlToElement(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.colorGRADIENT(data.color1)} !important;">${BDFDB.encodeToHTML(data.name || info.username)}</span>`));
				}
				else {
					username.style.setProperty("color", BDFDB.colorCONVERT(data.color1, "RGBA"), "important");
					BDFDB.setInnerText(username, data.name || info.username);
				}
			}
			if (data.name || data.color1) {
				username.setAttribute("changed-by-editusers", true);
				username.EditUsersChangeObserver = new MutationObserver((changes, _) => {
					username.EditUsersChangeObserver.disconnect();
					this.changeName(info, username);
				});
				username.EditUsersChangeObserver.observe(username, {attributes:true});
			}
			else username.removeAttribute("changed-by-editusers");
		}
	}

	changeBotTags (data, username, member) {
		for (let tag of username.parentElement.parentElement.querySelectorAll(BDFDB.dotCN.bottag)) if (!BDFDB.containsClass(tag, "TRE-tag")) {
			let isBRCbottagsEnabled = BDFDB.getReactValue(BDFDB.getPlugin("BetterRoleColors", true), "settings.modules.botTags");
			let tagcolor =  BDFDB.colorCONVERT(data.color1 || (isBRCbottagsEnabled || BDFDB.containsClass(tag, "owner-tag-rolecolor") ? member.colorString : null), "RGBA");
			tagcolor = BDFDB.colorISBRIGHT(tagcolor) ? BDFDB.colorCHANGE(tagcolor, -0.3) : tagcolor;
			tag.style.setProperty(BDFDB.containsClass(tag, BDFDB.disCN.bottaginvert) ? "color" : "background-color", tagcolor, "important");
		}
	}

	changeAvatar (info, avatar) {
		if (!info || !avatar || !avatar.parentElement) return;
		if (avatar.EditUsersChangeObserver && typeof avatar.EditUsersChangeObserver.disconnect == "function") avatar.EditUsersChangeObserver.disconnect();
		let data = this.getUserData(info.id, avatar);
		if (data.url || data.removeIcon || avatar.getAttribute("changed-by-editusers")) {
			if (avatar.tagName == "IMG") avatar.setAttribute("src", data.removeIcon ? null : (data.url || BDFDB.getUserAvatar(info.id)));
			else {
				let url = data.removeIcon ? null : ("url(" + (data.url || BDFDB.getUserAvatar(info.id)) + ")");
				if (url && BDFDB.getParentEle(BDFDB.dotCN.userprofile, avatar) && url.search(/discordapp\.com\/avatars\/[0-9]*\/a_/) > -1) url = url.replace(".webp)", ".gif)");
				avatar.style.setProperty("background-image", url);
				if (data.url && !data.removeIcon) {
					avatar.style.setProperty("background-position", "center");
					avatar.style.setProperty("background-size", "cover");
				}
			}
			if (data.url || data.removeIcon) {
				avatar.setAttribute("changed-by-editusers", true);
				avatar.EditUsersChangeObserver = new MutationObserver((changes, _) => {changes.forEach((change, i) => {
					avatar.EditUsersChangeObserver.disconnect();
					this.changeAvatar(info, avatar);
				});});
				avatar.EditUsersChangeObserver.observe(avatar, {attributes:true});
			}
			else avatar.removeAttribute("changed-by-editusers");
		}
	}

	changeTooltip (info, wrapper, type) {
		if (!info || !wrapper || !wrapper.parentElement) return;
		let data = this.getUserData(info.id, wrapper);
		wrapper = BDFDB.containsClass(wrapper, BDFDB.disCN.guildicon) ? wrapper.parentElement.parentElement.parentElement : wrapper;
		wrapper.removeEventListener("mouseenter", wrapper.tooltipListenerEditUsers);
		if (data.name) {
			wrapper.tooltipListenerEditUsers = () => {
				BDFDB.createTooltip(data.name, wrapper, {type,selector:"EditUsers-tooltip",css:`body ${BDFDB.dotCN.tooltip}:not(.EditUsers-tooltip) {display: none !important;}`});
			};
			wrapper.addEventListener("mouseenter", wrapper.tooltipListenerEditUsers);
		}
	}

	addTag (info, wrapper, selector = "", container) {
		if (!info || !wrapper || !wrapper.parentElement || BDFDB.containsClass(wrapper, BDFDB.disCN.accountinfodetails) || BDFDB.containsClass(wrapper, "discord-tag")) return;
		BDFDB.removeEles(wrapper.querySelectorAll(".EditUsers-tag"));
		let data = this.getUserData(info.id, wrapper);
		if (data.tag) {
			let member = data.ignoreTagColor ? (BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), info.id) || {}) : {};
			let color3 = BDFDB.isObject(data.color3) && !data.ignoreTagColor ? BDFDB.colorGRADIENT(data.color3) : BDFDB.colorCONVERT(!data.ignoreTagColor ? data.color3 : member.colorString, "RGBA");
			let color4 = BDFDB.isObject(data.color4) && !data.ignoreTagColor ? BDFDB.colorGRADIENT(data.color4) : (!data.ignoreTagColor && data.color4 ? BDFDB.colorCONVERT(data.color4, "RGBA") : (color3 ? (BDFDB.colorISBRIGHT(color3) ? "black" : "white") : null));
			let tag = document.createElement("span");
			let invert = container && !color3 && !color4 && container.firstElementChild && !(BDFDB.containsClass(container.firstElementChild, BDFDB.disCN.userpopoutheadernormal) || BDFDB.containsClass(container.firstElementChild, BDFDB.disCN.userprofiletopsectionnormal));
			tag.className = "EditUsers-tag " + (!invert ? BDFDB.disCN.bottagregular : BDFDB.disCN.bottaginvert) + (selector ? (" " + selector) : "");
			tag.style.setProperty("background", !invert ? color3 : color4, "important");
			let fontcolor = invert ? color3 : color4;
			let fontobj = invert ? data.color3 : data.color4;
			if (BDFDB.isObject(fontobj)) tag.appendChild(BDFDB.htmlToElement(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${fontcolor} !important;">${BDFDB.encodeToHTML(data.tag)}</span>`));
			else {
				tag.innerText = data.tag;
				tag.style.setProperty("color", fontcolor, "important");
			}
			wrapper.appendChild(tag);
		}
	}

	changePrivateChannel (info, username) {
		if (!info || !username || !username.parentElement) return;
		let dmchannel = BDFDB.getParentEle(BDFDB.dotCN.dmchannel, username);
		if (!dmchannel) return;
		if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
		dmchannel.removeEventListener("mouseenter", dmchannel.mouseenterListenerEditUsers);
		dmchannel.removeEventListener("mouseleave", dmchannel.mouseleaveListenerEditUsers);
		let data = this.getUserData(info.id, username);
		if (data.name || data.color1 || data.color2 || username.getAttribute("changed-by-editusers")) {
			if (username.EditUsersHovered || BDFDB.containsClass(dmchannel, BDFDB.disCN.namecontainerselected)) colorHover();
			else colorDefault();

			if (data.name || data.color1 || data.color2) {
				dmchannel.mouseenterListenerEditUsers = () => {
					username.EditUsersHovered = true;
					colorHover();
				};
				dmchannel.mouseleaveListenerEditUsers = () => {
					delete username.EditUsersHovered;
					colorDefault();
				};
				dmchannel.addEventListener("mouseenter", dmchannel.mouseenterListenerEditUsers);
				dmchannel.addEventListener("mouseleave", dmchannel.mouseleaveListenerEditUsers);
				username.setAttribute("changed-by-editusers", true);
				username.EditUsersChangeObserver = new MutationObserver((changes, _) => {
					username.EditUsersChangeObserver.disconnect();
					this.changePrivateChannel(info, username);
				});
				username.EditUsersChangeObserver.observe(username, {attributes:true});
			}
			else username.removeAttribute("changed-by-editusers");
			function colorDefault() {
				if (BDFDB.isObject(data.color1)) {
					username.style.removeProperty("color");
					BDFDB.setInnerText(username, BDFDB.htmlToElement(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.colorGRADIENT(BDFDB.colorCHANGE(data.color1, -0.5))} !important;">${BDFDB.encodeToHTML(data.name || info.username)}</span>`));
				}
				else {
					username.style.setProperty("color", BDFDB.colorCHANGE(data.color1, -0.5, "RGBA"), "important");
					BDFDB.setInnerText(username, data.name || info.username);
				}
				username.style.setProperty("background", BDFDB.isObject(data.color2) ? BDFDB.colorGRADIENT(BDFDB.colorCHANGE(data.color2, -0.5)) : BDFDB.colorCHANGE(data.color2, -0.5, "RGBA"), "important");
			}
			function colorHover() {
				if (BDFDB.isObject(data.color1)) {
					username.style.removeProperty("color");
					BDFDB.setInnerText(username, BDFDB.htmlToElement(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.colorGRADIENT(data.color1)} !important;">${BDFDB.encodeToHTML(data.name || info.username)}</span>`));
				}
				else {
					username.style.setProperty("color", BDFDB.colorCONVERT(data.color1, "RGBA"), "important");
					BDFDB.setInnerText(username, data.name || info.username);
				}
				username.style.setProperty("background", BDFDB.isObject(data.color2) ? BDFDB.colorGRADIENT(data.color2) : BDFDB.colorCONVERT(data.color2, "RGBA"), "important");
			}
		}
	}

	changeMention (info, mention) {
		if (!info || !mention || !mention.parentElement) return;
		if (mention.EditUsersChangeObserver && typeof mention.EditUsersChangeObserver.disconnect == "function") mention.EditUsersChangeObserver.disconnect();
		mention.removeEventListener("mouseover", mention.mouseoverListenerEditUsers);
		mention.removeEventListener("mouseout", mention.mouseoutListenerEditUsers);
		let data = this.getUserData(info.id, mention);
		let member = BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), info.id) || {};
		let name = "@" + (data.name ? data.name : (BDFDB.isPluginEnabled("RemoveNicknames") ? BDFDB.getPlugin("RemoveNicknames").getNewName(info, mention) : member.nick || info.username));

		let isgradient = data.color1 && BDFDB.isObject(data.color1);
		let datacolor = data.color1 || (BDFDB.isPluginEnabled("BetterRoleColors") ? member.colorString : null);
		let color = isgradient ? BDFDB.colorGRADIENT(data.color1) : BDFDB.colorCONVERT(datacolor, "RGBA");
		let color0_1 = isgradient ? BDFDB.colorGRADIENT(BDFDB.colorSETALPHA(data.color1, 0.1, "RGBA")) : BDFDB.colorSETALPHA(datacolor, 0.1, "RGBA");
		let color0_7 = isgradient ? BDFDB.colorGRADIENT(BDFDB.colorSETALPHA(data.color1, 0.7, "RGBA")) : BDFDB.colorSETALPHA(datacolor, 0.7, "RGBA");

		if (mention.EditUsersHovered) colorHover();
		else colorDefault();
		mention.mouseoverListenerEditUsers = () => {
			mention.EditUsersHovered = true;
			colorHover();
		};
		mention.mouseoutListenerEditUsers = () => {
			delete mention.EditUsersHovered;
			colorDefault();
		};
		mention.addEventListener("mouseover", mention.mouseoverListenerEditUsers);
		mention.addEventListener("mouseout", mention.mouseoutListenerEditUsers);
		mention.EditUsersChangeObserver = new MutationObserver((changes, _) => {
			mention.EditUsersChangeObserver.disconnect();
			this.changeMention(info, mention);
		});
		mention.EditUsersChangeObserver.observe(mention, {attributes:true});
		function colorDefault() {
			mention.style.setProperty("background", color0_1, "important");
			if (isgradient) {
				mention.style.removeProperty("color");
				BDFDB.setInnerText(mention, BDFDB.htmlToElement(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${color} !important;">${BDFDB.encodeToHTML(name)}</span>`));
			}
			else {
				mention.style.setProperty("color", color, "important");
				BDFDB.setInnerText(mention, name);
			}
		}
		function colorHover() {
			mention.style.setProperty("background", color0_7, "important");
			mention.style.setProperty("color", data.color1 ? "#FFFFFF" : null, "important");
			BDFDB.setInnerText(mention, name);
		}
	}

	changeVoiceUser (info, username, speaking) {
		if (!info || !username || !username.parentElement) return;
		if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
		username.removeEventListener("mouseover", username.mouseoverListenerEditUsers);
		username.removeEventListener("mouseout", username.mouseoutListenerEditUsers);
		let data = this.getUserData(info.id, username);
		if (data.name || data.color1 || username.getAttribute("changed-by-editusers")) {
			let member = BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), info.id) || {};
			if (username.EditUsersHovered) colorHover();
			else colorDefault();
			if (data.name || data.color1) {
				username.mouseoverListenerEditUsers = () => {
					username.EditUsersHovered = true;
					colorHover();
				};
				username.mouseoutListenerEditUsers = () => {
					delete username.EditUsersHovered;
					colorDefault();
				};
				username.parentElement.parentElement.addEventListener("mouseover", username.mouseoverListenerEditUsers);
				username.parentElement.parentElement.addEventListener("mouseout", username.mouseoutListenerEditUsers);
				username.EditUsersChangeObserver = new MutationObserver((changes, _) => {
					username.EditUsersChangeObserver.disconnect();
					this.changeVoiceUser(info, username, speaking);
				});
				username.EditUsersChangeObserver.observe(username, {attributes:true});
			}
			else username.removeAttribute("changed-by-editusers");
			function colorDefault() {
				if (BDFDB.isObject(data.color1)) {
					username.style.removeProperty("color");
					BDFDB.setInnerText(username, BDFDB.htmlToElement(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.colorGRADIENT(!speaking ? BDFDB.colorCHANGE(data.color1, -50) : data.color1)} !important;">${BDFDB.encodeToHTML(data.name || member.nick || info.username)}</span>`));
				}
				else {
					var color1 = data.color1 || (BDFDB.isPluginEnabled("BetterRoleColors") ? member.colorString : "");
					username.style.setProperty("color", !speaking ? BDFDB.colorCHANGE(color1, -50, "RGBA") : BDFDB.colorCONVERT(color1, "RGBA"), "important");
					BDFDB.setInnerText(username, data.name || member.nick || info.username);
				}
			}
			function colorHover() {
				if (BDFDB.isObject(data.color1)) {
					username.style.removeProperty("color");
					BDFDB.setInnerText(username, BDFDB.htmlToElement(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.colorGRADIENT(data.color1)} !important;">${BDFDB.encodeToHTML(data.name || member.nick || info.username)}</span>`));
				}
				else {
					username.style.setProperty("color", BDFDB.colorCONVERT(data.color1, "RGBA"), "important");
					BDFDB.setInnerText(username, data.name || member.nick || info.username);
				}
			}
		}
	}

	getAvatarDiv (wrapper) {
		var avatar = wrapper.querySelector(this.avatarselector);
		while (!avatar && wrapper.parentElement) {
			wrapper = wrapper.parentElement;
			avatar = wrapper.querySelector(this.avatarselector);
		}
		return avatar.querySelector("img") || avatar.firstElementChild || avatar;
	}

	getUserData (id, wrapper) {
		let data = BDFDB.loadData(id, this, "users");
		if (!data) {
			delete wrapper.EditUsersCachedDataState;
			return {};
		}
		else if (wrapper.EditUsersCachedDataState) {
			return data;
		}

		let allenabled = true, settings = BDFDB.getAllData(this, "settings");
		for (let i in settings) if (!settings[i]) {
			allenabled = false;
			break;
		}
		if (allenabled) return data;

		let key = null;
		if (!BDFDB.containsClass(wrapper, BDFDB.disCN.mention) && BDFDB.getParentEle(BDFDB.dotCN.messagegroup, wrapper)) key = "changeInChatWindow";
		else if (BDFDB.containsClass(wrapper, BDFDB.disCN.mention)) key = "changeInMentions";
		else if (BDFDB.getParentEle(BDFDB.dotCN.textareawrapchat, wrapper)) key = "changeInChatTextarea";
		else if (BDFDB.getParentEle(BDFDB.dotCN.voiceuser, wrapper)) key = "changeInVoiceChat";
		else if (BDFDB.getParentEle(BDFDB.dotCN.members, wrapper)) key = "changeInMemberList";
		else if (BDFDB.getParentEle(BDFDB.dotCN.guildouter, wrapper)) key = "changeInRecentDms";
		else if (BDFDB.getParentEle(BDFDB.dotCN.dmchannels, wrapper)) key = "changeInDmsList";
		else if (BDFDB.getParentEle(BDFDB.dotCN.channelheaderheaderbar, wrapper)) key = "changeInDmHeader";
		else if (BDFDB.getParentEle(BDFDB.dotCN.callavatarwrapper, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.callincoming, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.callcurrentcontainer, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.pictureinpicture, wrapper)) key = "changeInDmCalls";
		else if (BDFDB.getParentEle(BDFDB.dotCN.typing, wrapper)) key = "changeInTyping";
		else if (BDFDB.getParentEle(BDFDB.dotCN.friends, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.userprofilebody, wrapper)) key = "changeInFriendList";
		else if (BDFDB.getParentEle(BDFDB.dotCN.invitemodalinviterow, wrapper)) key = "changeInInviteList";
		else if (BDFDB.getParentEle(BDFDB.dotCN.activityfeed, wrapper)) key = "changeInActivity";
		else if (BDFDB.getParentEle(BDFDB.dotCN.userpopout, wrapper)) key = "changeInUserPopout";
		else if (BDFDB.getParentEle(BDFDB.dotCN.userprofileheader, wrapper)) key = "changeInUserProfil";
		else if (BDFDB.getParentEle(BDFDB.dotCN.autocomplete, wrapper)) key = "changeInAutoComplete";
		else if (BDFDB.getParentEle(BDFDB.dotCN.auditlog, wrapper)) key = "changeInAuditLog";
		else if (BDFDB.getParentEle(BDFDB.dotCN.guildsettingsbannedcard, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.guildsettingsinvitecard, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.guildsettingsmembercard, wrapper)) key = "changeInMemberLog";
		else if (BDFDB.getParentEle(BDFDB.dotCN.searchpopout, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.searchpopoutdmaddpopout, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.quickswitcher, wrapper)) key = "changeInSearchPopout";
		else if (BDFDB.getParentEle(BDFDB.dotCN.accountinfo, wrapper)) key = "changeInUserAccount";
		else if (wrapper.parentElement == document.head) key = "changeInAppTitle";

		if (!key || settings[key]) {
			wrapper.EditUsersCachedDataState = true;
			return data;
		}
		else {
			return {};
		}
	}

	addAutoCompleteMenu (textarea, channel) {
		if (textarea.parentElement.querySelector(".autocompleteEditUsersRow")) return;
		let words = textarea.value.split(/\s/);
		let lastword = words[words.length-1].trim();
		if (lastword && lastword.length > 1 && lastword[0] == "@") {
			let users = BDFDB.loadAllData(this, "users");
			if (!users) return;
			let userarray = [];
			for (let id in users) if (users[id].name) {
				let user = BDFDB.LibraryModules.UserStore.getUser(id);
				let member = user ? BDFDB.LibraryModules.MemberStore.getMember(channel.guild_id, id) : null;
				if (user && member) userarray.push(Object.assign({lowercasename:users[id].name.toLowerCase(),user,member},users[id]));
			}
			userarray = BDFDB.sortArrayByKey(userarray.filter(n => n.lowercasename.indexOf(lastword.toLowerCase().slice(1)) != -1), "lowercasename");
			if (userarray.length) {
				let autocompletemenu = textarea.parentElement.querySelector(BDFDB.dotCNS.autocomplete + BDFDB.dotCN.autocompleteinner), amount = 15;
				if (!autocompletemenu) {
					autocompletemenu = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.autocomplete + BDFDB.disCN.autocomplete2} autocompleteEditUsers"><div class="${BDFDB.disCN.autocompleteinner}"><div class="${BDFDB.disCNS.autocompleterowvertical + BDFDB.disCN.autocompleterow} autocompleteEditUsersRow"><div class="${BDFDB.disCN.autocompleteselector} autocompleteEditUsersSelector"><div class="${BDFDB.disCNS.autocompletecontenttitle + BDFDB.disCNS.small + BDFDB.disCNS.titlesize12 + BDFDB.disCNS.height16 + BDFDB.disCN.weightsemibold}">${BDFDB.LanguageStrings.MEMBERS_MATCHING.replace("{{prefix}}", BDFDB.encodeToHTML(lastword))}</strong></div></div></div></div></div>`);
					textarea.parentElement.appendChild(autocompletemenu);
					autocompletemenu = autocompletemenu.firstElementChild;
				}
				else {
					amount -= autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselectable).length;
				}

				BDFDB.addEventListener(this, autocompletemenu, "mouseenter", BDFDB.dotCN.autocompleteselectable, e => {
					var selected = autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselected);
					BDFDB.removeClass(selected, BDFDB.disCN.autocompleteselected);
					BDFDB.addClass(selected, BDFDB.disCN.autocompleteselector);
					BDFDB.addClass(e.currentTarget, BDFDB.disCN.autocompleteselected);
				});

				for (let data of userarray) {
					if (amount-- < 1) break;
					let status = BDFDB.getUserStatus(data.user.id);
					let isgradient = data.color1 && BDFDB.isObject(data.color1);
					let username = isgradient ? `<div class="${BDFDB.disCN.marginleft8}" changed-by-editusers="true" style="flex: 1 1 auto;"><span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.colorGRADIENT(data.color1)} !important;">${BDFDB.encodeToHTML(data.name || data.member.nick || data.user.username)}</span></div>` : `<div class="${BDFDB.disCN.marginleft8}" changed-by-editusers="true" style="flex: 1 1 auto;${data.color1 ? (' color: ' + BDFDB.colorCONVERT(data.color1, 'RGB') + ' !important;') : ''}">${BDFDB.encodeToHTML(data.name || data.member.nick || data.user.username)}</div>`;
					let autocompleterow = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.autocompleterowvertical + BDFDB.disCN.autocompleterow} autocompleteEditUsersRow"><div userid="${data.user.id}" class="${BDFDB.disCNS.autocompleteselector + BDFDB.disCN.autocompleteselectable} autocompleteEditUsersSelector"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.autocompletecontent}" style="flex: 1 1 auto;"><div class="${BDFDB.disCN.avatarwrapper}" role="img" aria-label="${data.user.username}, ${BDFDB.LanguageStrings["STATUS_" + status.toUpperCase()]}" aria-hidden="false" style="width: 24px; height: 24px;"><svg width="30" height="24" viewBox="0 0 30 24" class="${BDFDB.disCN.avatarmask}" aria-hidden="true"><foreignObject x="0" y="0" width="24" height="24" mask="url(#svg-mask-avatar-status-round-24)"><img src="${data.url || BDFDB.getUserAvatar(data.user.id)}" alt=" " class="${BDFDB.disCN.avatar}" aria-hidden="true"></foreignObject><rect width="8" height="8" x="16" y="16" fill="${BDFDB.getUserStatusColor(status)}" mask="url(#svg-mask-status-${status})" class="${BDFDB.disCN.avatarpointerevents}"></rect></svg></div>${username}<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.autocompletedescription}" style="flex: 0 1 auto;"><div class="${BDFDB.disCN.autocompletedescriptionusername}">${BDFDB.encodeToHTML(data.user.username)}</div><div class="${BDFDB.disCN.autocompletedescriptiondiscriminator}">#${data.user.discriminator}</div></div></div></div></div>`);
					autocompleterow.querySelector(BDFDB.dotCN.autocompleteselectable).addEventListener("click", () => {this.swapWordWithMention(textarea);});
					autocompletemenu.appendChild(autocompleterow);
				}
				if (!autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected)) {
					BDFDB.addClass(autocompletemenu.querySelector(".autocompleteEditUsersRow " + BDFDB.dotCN.autocompleteselectable), BDFDB.disCN.autocompleteselected);
				}
			}
		}
	}

	getNextSelection (menu, selected, forward) {
		selected = selected ? selected : menu.querySelector(BDFDB.dotCN.autocompleteselected).parentElement;
		let next, sibling = forward ? selected.nextElementSibling : selected.previousElementSibling;
		if (sibling) {
			next = sibling.querySelector(BDFDB.dotCN.autocompleteselectable);
		}
		else {
			let items = menu.querySelectorAll(BDFDB.dotCN.autocompleteselectable);
			next = forward ? items[0] : items[items.length-1];
		}
		return next ? next : this.getNextSelection(menu, sibling, forward);
	}

	swapWordWithMention (textarea) {
		let selected = textarea.parentElement.querySelector(".autocompleteEditUsersRow " + BDFDB.dotCN.autocompleteselected);
		let words = textarea.value.split(/\s/);
		let lastword = words[words.length-1].trim();
		if (selected && lastword) {
			let username = selected.querySelector(BDFDB.dotCN.autocompletedescriptionusername).textContent;
			let discriminator = selected.querySelector(BDFDB.dotCN.autocompletedescriptiondiscriminator).textContent;
			let userid = selected.getAttribute("userid");
			BDFDB.removeEles(".autocompleteEditUsers", ".autocompleteEditUsersRow");
			textarea.focus();
			textarea.selectionStart = textarea.value.length - lastword.length;
			textarea.selectionEnd = textarea.value.length;
			document.execCommand("insertText", false, (username && discriminator ? ("@" + username + discriminator) : `<@!${userid}>`) + " ");
			textarea.selectionStart = textarea.value.length;
			textarea.selectionEnd = textarea.value.length;
		}
	}

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					context_localusersettings_text:		"Lokalne korisničke postavke",
					submenu_usersettings_text:			"Promijeni postavke",
					submenu_resetsettings_text:			"Poništi korisnika",
					modal_header_text:					"Lokalne korisničke postavke",
					modal_username_text:				"Lokalno korisničko ime",
					modal_usertag_text:					"Oznaka",
					modal_useravatar_text:				"Ikona",
					modal_removeicon_text:				"Ukloni ikonu",
					modal_tabheader1_text:				"Korisnik",
					modal_tabheader2_text:				"Boja naziva",
					modal_tabheader3_text:				"Boja oznaka",
					modal_colorpicker1_text:			"Boja naziva",
					modal_colorpicker2_text:			"Boja pozadine",
					modal_colorpicker3_text:			"Boja oznaka",
					modal_colorpicker4_text:			"Boja fonta",
					modal_ignoretagcolor_text:			"Upotrijebite boju uloga",
					modal_validurl_text:				"Vrijedi URL",
					modal_invalidurl_text:				"Nevažeći URL"
				};
			case "da":		//danish
				return {
					context_localusersettings_text:		"Lokal brugerindstillinger",
					submenu_usersettings_text:			"Skift indstillinger",
					submenu_resetsettings_text:			"Nulstil bruger",
					modal_header_text:					"Lokal brugerindstillinger",
					modal_username_text:				"Lokalt brugernavn",
					modal_usertag_text:					"Initialer",
					modal_useravatar_text:				"Ikon",
					modal_removeicon_text:				"Fjern ikon",
					modal_tabheader1_text:				"Bruger",
					modal_tabheader2_text:				"Navnefarve",
					modal_tabheader3_text:				"Etiketfarve",
					modal_colorpicker1_text:			"Navnefarve",
					modal_colorpicker2_text:			"Baggrundsfarve",
					modal_colorpicker3_text:			"Etiketfarve",
					modal_colorpicker4_text:			"Skriftfarve",
					modal_ignoretagcolor_text:			"Brug rollefarve",
					modal_validurl_text:				"Gyldig URL",
					modal_invalidurl_text:				"Ugyldig URL"
				};
			case "de":		//german
				return {
					context_localusersettings_text:		"Lokale Benutzereinstellungen",
					submenu_usersettings_text:			"Einstellungen ändern",
					submenu_resetsettings_text:			"Benutzer zurücksetzen",
					modal_header_text:					"Lokale Benutzereinstellungen",
					modal_username_text:				"Lokaler Benutzername",
					modal_usertag_text:					"Etikett",
					modal_useravatar_text:				"Icon",
					modal_removeicon_text:				"Entferne Icon",
					modal_tabheader1_text:				"Benutzer",
					modal_tabheader2_text:				"Namensfarbe",
					modal_tabheader3_text:				"Etikettfarbe",
					modal_colorpicker1_text:			"Namensfarbe",
					modal_colorpicker2_text:			"Hintergrundfarbe",
					modal_colorpicker3_text:			"Etikettfarbe",
					modal_colorpicker4_text:			"Schriftfarbe",
					modal_ignoretagcolor_text:			"Benutze Rollenfarbe",
					modal_validurl_text:				"Gültige URL",
					modal_invalidurl_text:				"Ungültige URL"
				};
			case "es":		//spanish
				return {
					context_localusersettings_text:		"Ajustes local de usuario",
					submenu_usersettings_text:			"Cambiar ajustes",
					submenu_resetsettings_text:			"Restablecer usuario",
					modal_header_text:					"Ajustes local de usuario",
					modal_username_text:				"Nombre local de usuario",
					modal_usertag_text:					"Etiqueta",
					modal_useravatar_text:				"Icono",
					modal_removeicon_text:				"Eliminar icono",
					modal_tabheader1_text:				"Usuario",
					modal_tabheader2_text:				"Color del nombre",
					modal_tabheader3_text:				"Color de la etiqueta",
					modal_colorpicker1_text:			"Color del nombre",
					modal_colorpicker2_text:			"Color de fondo",
					modal_colorpicker3_text:			"Color de la etiqueta",
					modal_colorpicker4_text:			"Color de fuente",
					modal_ignoretagcolor_text:			"Usar color de rol",
					modal_validurl_text:				"URL válida",
					modal_invalidurl_text:				"URL inválida"
				};
			case "fr":		//french
				return {
					context_localusersettings_text:		"Paramètres locale d'utilisateur",
					submenu_usersettings_text:			"Modifier les paramètres",
					submenu_resetsettings_text:			"Réinitialiser l'utilisateur",
					modal_header_text:					"Paramètres locale d'utilisateur",
					modal_username_text:				"Nom local d'utilisateur",
					modal_usertag_text:					"Étiquette",
					modal_useravatar_text:				"Icône",
					modal_removeicon_text:				"Supprimer l'icône",
					modal_tabheader1_text:				"Serveur",
					modal_tabheader2_text:				"Couleur du nom",
					modal_tabheader3_text:				"Couleur de l'étiquette",
					modal_colorpicker1_text:			"Couleur du nom",
					modal_colorpicker2_text:			"Couleur de fond",
					modal_colorpicker3_text:			"Couleur de l'étiquette",
					modal_colorpicker4_text:			"Couleur de la police",
					modal_ignoretagcolor_text:			"Utiliser la couleur de rôle",
					modal_validurl_text:				"URL valide",
					modal_invalidurl_text:				"URL invalide"
				};
			case "it":		//italian
				return {
					context_localusersettings_text:		"Impostazioni locale utente",
					submenu_usersettings_text:			"Cambia impostazioni",
					submenu_resetsettings_text:			"Ripristina utente",
					modal_header_text:					"Impostazioni locale utente",
					modal_username_text:				"Nome locale utente",
					modal_usertag_text:					"Etichetta",
					modal_useravatar_text:				"Icona",
					modal_removeicon_text:				"Rimuova l'icona",
					modal_tabheader1_text:				"Utente",
					modal_tabheader2_text:				"Colore del nome",
					modal_tabheader3_text:				"Colore della etichetta",
					modal_colorpicker1_text:			"Colore del nome",
					modal_colorpicker2_text:			"Colore di sfondo",
					modal_colorpicker3_text:			"Colore della etichetta",
					modal_colorpicker4_text:			"Colore del carattere",
					modal_ignoretagcolor_text:			"Usa il colore del ruolo",
					modal_validurl_text:				"URL valido",
					modal_invalidurl_text:				"URL non valido"
				};
			case "nl":		//dutch
				return {
					context_localusersettings_text:		"Lokale gebruikerinstellingen",
					submenu_usersettings_text:			"Verandere instellingen",
					submenu_resetsettings_text:			"Reset gebruiker",
					modal_header_text:					"Lokale gebruikerinstellingen",
					modal_username_text:				"Lokale gebruikernaam",
					modal_usertag_text:					"Etiket",
					modal_useravatar_text:				"Icoon",
					modal_removeicon_text:				"Verwijder icoon",
					modal_tabheader1_text:				"Gebruiker",
					modal_tabheader2_text:				"Naamkleur",
					modal_tabheader3_text:				"Etiketkleur",
					modal_colorpicker1_text:			"Naamkleur",
					modal_colorpicker2_text:			"Achtergrondkleur",
					modal_colorpicker3_text:			"Etiketkleur",
					modal_colorpicker4_text:			"Doopvontkleur",
					modal_ignoretagcolor_text:			"Gebruik rolkleur",
					modal_validurl_text:				"Geldige URL",
					modal_invalidurl_text:				"Ongeldige URL"
				};
			case "no":		//norwegian
				return {
					context_localusersettings_text:		"Lokal brukerinnstillinger",
					submenu_usersettings_text:			"Endre innstillinger",
					submenu_resetsettings_text:			"Tilbakestill bruker",
					modal_header_text:					"Lokal brukerinnstillinger",
					modal_username_text:				"Lokalt gebruikernavn",
					modal_usertag_text:					"Stikkord",
					modal_useravatar_text:				"Ikon",
					modal_removeicon_text:				"Fjern ikon",
					modal_tabheader1_text:				"Bruker",
					modal_tabheader2_text:				"Navnfarge",
					modal_tabheader3_text:				"Stikkordfarge",
					modal_colorpicker1_text:			"Navnfarge",
					modal_colorpicker2_text:			"Bakgrunnfarge",
					modal_colorpicker3_text:			"Stikkordfarge",
					modal_colorpicker4_text:			"Skriftfarge",
					modal_ignoretagcolor_text:			"Bruk rollefarge",
					modal_validurl_text:				"Gyldig URL",
					modal_invalidurl_text:				"Ugyldig URL"
				};
			case "pl":		//polish
				return {
					context_localusersettings_text:		"Lokalne ustawienia użytkownika",
					submenu_usersettings_text:			"Zmień ustawienia",
					submenu_resetsettings_text:			"Resetuj ustawienia",
					modal_header_text:					"Lokalne ustawienia użytkownika",
					modal_username_text:				"Lokalna nazwa użytkownika",
					modal_usertag_text:					"Etykieta",
					modal_useravatar_text:				"Ikona",
					modal_removeicon_text:				"Usuń ikonę",
					modal_tabheader1_text:				"Użytkownik",
					modal_tabheader2_text:				"Kolor nazwy",
					modal_tabheader3_text:				"Kolor etykiety",
					modal_colorpicker1_text:			"Kolor nazwy",
					modal_colorpicker2_text:			"Kolor tła",
					modal_colorpicker3_text:			"Kolor etykiety",
					modal_colorpicker4_text:			"Kolor czcionki",
					modal_ignoretagcolor_text:			"Użyj kolor roli",
					modal_validurl_text:				"Prawidłowe URL",
					modal_invalidurl_text:				"Nieprawidłowe URL"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_localusersettings_text:		"Configurações local do utilizador",
					submenu_usersettings_text:			"Mudar configurações",
					submenu_resetsettings_text:			"Redefinir utilizador",
					modal_header_text:					"Configurações local do utilizador",
					modal_username_text:				"Nome local do utilizador",
					modal_usertag_text:					"Etiqueta",
					modal_useravatar_text:				"Icone",
					modal_removeicon_text:				"Remover ícone",
					modal_tabheader1_text:				"Utilizador",
					modal_tabheader2_text:				"Cor do nome",
					modal_tabheader3_text:				"Cor da etiqueta",
					modal_colorpicker1_text:			"Cor do nome",
					modal_colorpicker2_text:			"Cor do fundo",
					modal_colorpicker3_text:			"Cor da etiqueta",
					modal_colorpicker4_text:			"Cor da fonte",
					modal_ignoretagcolor_text:			"Use a cor do papel",
					modal_validurl_text:				"URL válido",
					modal_invalidurl_text:				"URL inválida"
				};
			case "fi":		//finnish
				return {
					context_localusersettings_text:		"Paikallinen käyttäjä asetukset",
					submenu_usersettings_text:			"Vaihda asetuksia",
					submenu_resetsettings_text:			"Nollaa käyttäjä",
					modal_header_text:					"Paikallinen käyttäjä asetukset",
					modal_username_text:				"Paikallinen käyttäjätunnus",
					modal_usertag_text:					"Merkki",
					modal_useravatar_text:				"Ikonin",
					modal_removeicon_text:				"Poista kuvake",
					modal_tabheader1_text:				"Käyttäjä",
					modal_tabheader2_text:				"Nimiväri",
					modal_tabheader3_text:				"Merkkiväri",
					modal_colorpicker1_text:			"Nimiväri",
					modal_colorpicker2_text:			"Taustaväri",
					modal_colorpicker3_text:			"Merkkiväri",
					modal_colorpicker4_text:			"Fontinväri",
					modal_ignoretagcolor_text:			"Käytä rooliväriä",
					modal_validurl_text:				"Voimassa URL",
					modal_invalidurl_text:				"Virheellinen URL"
				};
			case "sv":		//swedish
				return {
					context_localusersettings_text:		"Lokal användareinställningar",
					submenu_usersettings_text:			"Ändra inställningar",
					submenu_resetsettings_text:			"Återställ användare",
					modal_header_text:					"Lokal användareinställningar",
					modal_username_text:				"Lokalt användarenamn",
					modal_usertag_text:					"Märka",
					modal_useravatar_text:				"Ikon",
					modal_removeicon_text:				"Ta bort ikonen",
					modal_tabheader1_text:				"Användare",
					modal_tabheader2_text:				"Namnfärg",
					modal_tabheader3_text:				"Märkafärg",
					modal_colorpicker1_text:			"Namnfärg",
					modal_colorpicker2_text:			"Bakgrundfärg",
					modal_colorpicker3_text:			"Märkafärg",
					modal_colorpicker4_text:			"Fontfärg",
					modal_ignoretagcolor_text:			"Använd rollfärg",
					modal_validurl_text:				"Giltig URL",
					modal_invalidurl_text:				"Ogiltig URL"
				};
			case "tr":		//turkish
				return {
					context_localusersettings_text:		"Yerel Kullanıcı Ayarları",
					submenu_usersettings_text:			"Ayarları Değiştir",
					submenu_resetsettings_text:			"Kullanıcı Sıfırla",
					modal_header_text:					"Yerel Kullanıcı Ayarları",
					modal_username_text:				"Yerel Kullanıcı Isim",
					modal_usertag_text:					"Etiket",
					modal_useravatar_text:				"Simge",
					modal_removeicon_text:				"Simge kaldır",
					modal_tabheader1_text:				"Kullanıcı",
					modal_tabheader2_text:				"Simge rengi",
					modal_tabheader3_text:				"Isim rengi",
					modal_colorpicker1_text:			"Simge rengi",
					modal_colorpicker2_text:			"Arka fon rengi",
					modal_colorpicker3_text:			"Etiket rengi",
					modal_colorpicker4_text:			"Yazı rengi",
					modal_ignoretagcolor_text:			"Rol rengini kullan",
					modal_validurl_text:				"Geçerli URL",
					modal_invalidurl_text:				"Geçersiz URL"
				};
			case "cs":		//czech
				return {
					context_localusersettings_text:		"Místní nastavení uživatel",
					submenu_usersettings_text:			"Změnit nastavení",
					submenu_resetsettings_text:			"Obnovit uživatel",
					modal_header_text:					"Místní nastavení uživatel",
					modal_username_text:				"Místní název uživatel",
					modal_usertag_text:					"Štítek",
					modal_useravatar_text:				"Ikony",
					modal_removeicon_text:				"Odstranit ikonu",
					modal_tabheader1_text:				"Uživatel",
					modal_tabheader2_text:				"Barva název",
					modal_tabheader3_text:				"Barva štítek",
					modal_colorpicker1_text:			"Barva název",
					modal_colorpicker2_text:			"Barva pozadí",
					modal_colorpicker3_text:			"Barva štítek",
					modal_colorpicker4_text:			"Barva fontu",
					modal_ignoretagcolor_text:			"Použijte barva role",
					modal_validurl_text:				"Platná URL",
					modal_invalidurl_text:				"Neplatná URL"
				};
			case "bg":		//bulgarian
				return {
					context_localusersettings_text:		"Настройки за локални потребител",
					submenu_usersettings_text:			"Промяна на настройките",
					submenu_resetsettings_text:			"Възстановяване на потребител",
					modal_header_text:					"Настройки за локални потребител",
					modal_username_text:				"Локално име на потребител",
					modal_usertag_text:					"Cвободен край",
					modal_useravatar_text:				"Икона",
					modal_removeicon_text:				"Премахване на иконата",
					modal_tabheader1_text:				"Потребител",
					modal_tabheader2_text:				"Цвят на име",
					modal_tabheader3_text:				"Цвят на свободен край",
					modal_colorpicker1_text:			"Цвят на име",
					modal_colorpicker2_text:			"Цвят на заден план",
					modal_colorpicker3_text:			"Цвят на свободен край",
					modal_colorpicker4_text:			"Цвят на шрифта",
					modal_ignoretagcolor_text:			"Използвайте цвят на ролите",
					modal_validurl_text:				"Валиден URL",
					modal_invalidurl_text:				"Невалиден URL"
				};
			case "ru":		//russian
				return {
					context_localusersettings_text:		"Настройки локального пользователь",
					submenu_usersettings_text:			"Изменить настройки",
					submenu_resetsettings_text:			"Сбросить пользователь",
					modal_header_text:					"Настройки локального пользователь",
					modal_username_text:				"Имя локального пользователь",
					modal_usertag_text:					"Tег",
					modal_useravatar_text:				"Значок",
					modal_removeicon_text:				"Удалить значок",
					modal_tabheader1_text:				"Пользователь",
					modal_tabheader2_text:				"Цвет имя",
					modal_tabheader3_text:				"Цвет тег",
					modal_colorpicker1_text:			"Цвет имя",
					modal_colorpicker2_text:			"Цвет задний план",
					modal_colorpicker3_text:			"Цвет тег",
					modal_colorpicker4_text:			"Цвет шрифта",
					modal_ignoretagcolor_text:			"Использовать цвет ролей",
					modal_validurl_text:				"Действительный URL",
					modal_invalidurl_text:				"Неверная URL"
				};
			case "uk":		//ukrainian
				return {
					context_localusersettings_text:		"Налаштування локального користувач",
					submenu_usersettings_text:			"Змінити налаштування",
					submenu_resetsettings_text:			"Скидання користувач",
					modal_header_text:					"Налаштування локального користувач",
					modal_username_text:				"Локальне ім'я користувач",
					modal_usertag_text:					"Tег",
					modal_useravatar_text:				"Іконка",
					modal_removeicon_text:				"Видалити піктограму",
					modal_tabheader1_text:				"Користувач",
					modal_tabheader2_text:				"Колір ім'я",
					modal_tabheader3_text:				"Колір тег",
					modal_colorpicker1_text:			"Колір ім'я",
					modal_colorpicker2_text:			"Колір фон",
					modal_colorpicker3_text:			"Колір тег",
					modal_colorpicker4_text:			"Колір шрифту",
					modal_ignoretagcolor_text:			"Використовуйте рольовий колір",
					modal_validurl_text:				"Дійсна URL",
					modal_invalidurl_text:				"Недійсна URL"
				};
			case "ja":		//japanese
				return {
					context_localusersettings_text:		"ローカルユーザーー設定",
					submenu_usersettings_text:			"設定を変更する",
					submenu_resetsettings_text:			"ユーザーーをリセットする",
					modal_header_text:					"ローカルユーザーー設定",
					modal_username_text:				"ローカルユーザーー名",
					modal_usertag_text:					"タグ",
					modal_useravatar_text:				"アイコン",
					modal_removeicon_text:				"アイコンを削除",
					modal_tabheader1_text:				"ユーザー",
					modal_tabheader2_text:				"名の色",
					modal_tabheader3_text:				"タグの色",
					modal_colorpicker1_text:			"名の色",
					modal_colorpicker2_text:			"バックグラウンドの色",
					modal_colorpicker3_text:			"タグの色",
					modal_colorpicker4_text:			"フォントの色",
					modal_ignoretagcolor_text:			"ロールカラーを使用する",
					modal_validurl_text:				"有効な URL",
					modal_invalidurl_text:				"無効な URL"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_localusersettings_text:		"本地用戶設置",
					submenu_usersettings_text:			"更改設置",
					submenu_resetsettings_text:			"重置用戶",
					modal_header_text:					"本地用戶設置",
					modal_username_text:				"用戶名稱",
					modal_usertag_text:					"標籤",
					modal_useravatar_text:				"圖標",
					modal_removeicon_text:				"刪除圖標",
					modal_tabheader1_text:				"用戶",
					modal_tabheader2_text:				"名稱顏色",
					modal_tabheader3_text:				"標籤顏色",
					modal_colorpicker1_text:			"名稱顏色",
					modal_colorpicker2_text:			"背景顏色",
					modal_colorpicker3_text:			"標籤顏色",
					modal_colorpicker4_text:			"字體顏色",
					modal_ignoretagcolor_text:			"使用角色",
					modal_validurl_text:				"有效的 URL",
					modal_invalidurl_text:				"無效的 URL"
				};
			case "ko":		//korean
				return {
					context_localusersettings_text:		"로컬 사용자 설정",
					submenu_usersettings_text:			"설정 변경",
					submenu_resetsettings_text:			"사용자 재설정",
					modal_header_text:					"로컬 사용자 설정",
					modal_username_text:				"로컬 사용자 이름",
					modal_usertag_text:					"꼬리표",
					modal_useravatar_text:				"상",
					modal_removeicon_text:				"상 삭제",
					modal_tabheader1_text:				"사용자",
					modal_tabheader2_text:				"이름 색깔",
					modal_tabheader3_text:				"꼬리표 색깔",
					modal_colorpicker1_text:			"이름 색깔",
					modal_colorpicker2_text:			"배경 색깔",
					modal_colorpicker3_text:			"꼬리표 색깔",
					modal_colorpicker4_text:			"글꼴 색깔",
					modal_ignoretagcolor_text:			"역할 색상 사용",
					modal_validurl_text:				"유효한 URL",
					modal_invalidurl_text:				"잘못된 URL"
				};
			default:	//default: english
				return {
					context_localusersettings_text:		"Local Usersettings",
					submenu_usersettings_text:			"Change Settings",
					submenu_resetsettings_text:			"Reset User",
					modal_header_text:					"Local Usersettings",
					modal_username_text:				"Local Username",
					modal_usertag_text:					"Tag",
					modal_useravatar_text:				"Icon",
					modal_removeicon_text:				"Remove Icon",
					modal_tabheader1_text:				"User",
					modal_tabheader2_text:				"Namecolor",
					modal_tabheader3_text:				"Tagcolor",
					modal_colorpicker1_text:			"Namecolor",
					modal_colorpicker2_text:			"Backgroundcolor",
					modal_colorpicker3_text:			"Tagcolor",
					modal_colorpicker4_text:			"Fontcolor",
					modal_ignoretagcolor_text:			"Use Rolecolor",
					modal_validurl_text:				"Valid URL",
					modal_invalidurl_text:				"Invalid URL"
				};
		}
	}
}
