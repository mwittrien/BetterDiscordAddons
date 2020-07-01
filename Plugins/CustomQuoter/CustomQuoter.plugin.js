//META{"name":"CustomQuoter","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CustomQuoter","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CustomQuoter/CustomQuoter.plugin.js"}*//

var CustomQuoter = (_ => {
	var _this;
	var settings = {}, formats = {}, format = null;
	
	const PreviewMessage = class PreviewMessage extends BdApi.React.Component {
		render() {
			let spoofChannel = new BDFDB.DiscordObjects.Channel({
				id: "126223823845647771",
				guild_id: "850725684241078788",
				name: "Test Channel"
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
			return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MessageGroup, {
				className: BDFDB.disCNS.message + BDFDB.disCN.messagecozymessage,
				message: spoofMessage,
				channel: spoofChannel
			});
		}
	};
	
	return class CustomQuoter {
		getName () {return "CustomQuoter";}

		getVersion () {return "1.1.1";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Let's you customize the output of the native quote feature of Discord.";}
		
		constructor () {
			this.changelog = {
				"added":[["More Choices","You can now add more formats, which you can choose from in the context submenu (clicking the main item will use first 'standard' format"],["Clipboard","You can now quote in channels that you got no writting permissions in, meaning quoting a message in such a channel will copy the quote to the clipboard instead of the channel textarea"]],
				"improved":[["Quote selected text","Works more smoothly with formating symbols like (~, _, `, etc.)"]]
			};
		}

		initConstructor () {
			_this = this;
			
			this.defaults = {
				settings: {
					quoteOnlySelected:		{value:true, 				description:"Only insert selected text in a quoted message"},
					ignoreMentionInDM:		{value:true, 				description:"Do not add a mention in DM channels"},
					forceZeros:				{value:false, 				description:"Force leading Zeros"}
				}
			};
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settingsPanel, settingsItems = [], innerItems = [];
			
			for (let key in settings) innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key],
				onChange: (value, instance) => {
					settings[key] = value;
				}
			}));
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Settings",
				collapseStates: collapseStates,
				children: innerItems
			}));
			
			innerItems = [];
			
			innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
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
							for (let input of settingsPanel.querySelectorAll(".input-newquote " + BDFDB.dotCN.input)) if (!input.value || input.value.length == 0 || input.value.trim().length == 0) return BDFDB.NotificationUtils.toast("Fill out all fields to add a new quote.", {type:"danger"});
							let key = settingsPanel.querySelector(".input-name " + BDFDB.dotCN.input).value.trim();
							let quote = settingsPanel.querySelector(".input-quote " + BDFDB.dotCN.input).value.trim();
							if (formats[key]) return BDFDB.NotificationUtils.toast("A quote with the choosen name already exists. Please choose another name.", {type:"danger"});
							else {
								formats[key] = quote;
								BDFDB.DataUtils.save(formats, this, "formats");
								BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
							}
						},
						children: BDFDB.LanguageUtils.LanguageStrings.ADD
					})
				]
			}));
			
			innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
				className: BDFDB.disCN.marginbottom20
			}));
			
			for (let key in formats) innerItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Card, {
				cardId: key,
				noRemove: key == "Standard",
				onRemove: _ => {
					delete formats[key];
					BDFDB.DataUtils.save(formats, this, "formats");
					BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
				},
				children: BDFDB.ReactUtils.createElement("div", {
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							className: BDFDB.disCN.marginbottom8,
							type: "TextInput",
							plugin: this,
							keys: ["formats", key],
							label: key + ":",
							basis: "70%",
							value: formats[key],
							onChange: (value, instance) => {
								formats[key] = value;
								BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {key: "PREVIEW_MESSAGE_" + key.replace(/\s/g, "_")}));
							}
						}),
						BDFDB.ReactUtils.createElement(PreviewMessage, {
							key: "PREVIEW_MESSAGE_" + key.replace(/\s/g, "_"),
							format: key
						})
					]
				})
			}));
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Formats",
				collapseStates: collapseStates,
				dividertop: true,
				children: innerItems
			}));
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Placeholder Guide",
				collapseStates: collapseStates,
				dividertop: true,
				children: [
					"$quote will be replaced with the quoted message content",
					"$mention will be replaced with a mention of the message author",
					"$link will be replaced with a discord direct link pointing to the message",
					"$authorId will be replaced with the ID of the message author",
					"$authorName will be replaced with the nickname or username of the message author",
					"$authorAccount will be replaced with the accountname of the message author (username#discriminator)",
					"$channel will be replaced with a mention of the channel (ignored for DMs)",
					"$channelId will be replaced with the ID of the channel",
					"$channelName will be replaced with the Name of the channel",
					"$serverId will be replaced with the ID of the server",
					"$serverName will be replaced with the name of the server",
					"$hour will be replaced with the quote hour",
					"$minute will be replaced with the quote minutes",
					"$second will be replaced with the quote seconds",
					"$msecond will be replaced with the quote milliseconds",
					"$timemode will change $hour to a 12h format and will be replaced with AM/PM",
					"$year will be replaced with the quote year",
					"$month will be replaced with the quote month",
					"$day will be replaced with the quote day",
					"$monthnameL will be replaced with the monthname in long format based on the Discord Language",
					"$monthnameS will be replaced with the monthname in short format based on the Discord Language",
					"$weekdayL will be replaced with the weekday in long format based on the Discord Language",
					"$weekdayS will be replaced with the weekday in short format based on the Discord Language"
				].map(string => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormText, {
					type: BDFDB.LibraryComponents.FormComponents.FormTextTypes.DESCRIPTION,
					children: string
				}))
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
				
				let customQuote = BDFDB.DataUtils.load(this, "formats", "customQuote"); // REMOVE 01.07.2020
				if (typeof customQuote == "string") BDFDB.DataUtils.save(customQuote, this, "formats", "Standard");
				
				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.QuoteUtils, "createQuotedText", {instead: e => {
					return this.parseQuote(e.methodArguments[0], e.methodArguments[1]);
				}});
				
				this.forceUpdateAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}


		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

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

		onMessageContextMenu (e) {
			if (e.instance.props.message && e.instance.props.channel) {
				let item = null, action = choice => {
					format = choice;
					if (!BDFDB.LibraryModules.QuoteUtils.canQuote(e.instance.props.message, e.instance.props.channel)) {
						BDFDB.LibraryRequires.electron.clipboard.write({text:this.parseQuote(e.instance.props.message, e.instance.props.channel)});
						BDFDB.NotificationUtils.toast("Quote has been copied to clipboard.", {type:"success"});
					}
					else BDFDB.LibraryModules.MessageManageUtils.quoteMessage(e.instance.props.channel, e.instance.props.message);
					format = null;
				};
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "quote"});
				if (index > -1) item = children[index];
				else {
					item = BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: BDFDB.LanguageUtils.LanguageStrings.QUOTE,
						id: "quote",
						action: _ => {action(null);}
					});
					let [unreadChildren, unreadIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "mark-unread"});
					unreadChildren.splice(unreadIndex > -1 ? unreadIndex - 1 : unreadChildren.length, 0, item);
				}
				let addedFormats = BDFDB.ObjectUtils.exclude(formats, "Standard");
				if (!BDFDB.ObjectUtils.isEmpty(addedFormats)) item.props.children = BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: Object.keys(addedFormats).map(key => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: key,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "added-quote", key),
						action: _ => {action(key);}
					}))
				});
			}
		}

		parseQuote (message, channel, choice = format) {
			let languageId = BDFDB.LanguageUtils.getLanguage().id;
			
			let quoteFormat = formats[choice] || formats.Standard || "";
			
			let guild = channel.guild_id ? (BDFDB.LibraryModules.GuildStore.getGuild(channel.guild_id) || {id: channel.guild_id, name: "Test Server"}) : {id: BDFDB.DiscordConstants.ME, name: BDFDB.LanguageUtils.LanguageStrings.DIRECT_MESSAGES};
			let member = guild && BDFDB.LibraryModules.MemberStore.getMember(guild.id, message.author.id);
			
			let timestamp = new Date(message.editedTimestamp || message.timestamp);
			let hour = timestamp.getHours(), minute = timestamp.getMinutes(), second = timestamp.getSeconds(), msecond = timestamp.getMilliseconds(), day = timestamp.getDate(), month = timestamp.getMonth()+1, timemode = "";
			if (quoteFormat.indexOf("$timemode") > -1) {
				timemode = hour >= 12 ? "PM" : "AM";
				hour = hour % 12;
				hour = hour ? hour : 12;
			}
			
			let content = message.content;
			let selectedText = settings.quoteOnlySelected && document.getSelection().toString().trim();
			if (selectedText) content = BDFDB.StringUtils.extractSelection(content, selectedText);
			let unquotedLines = content.split("\n").filter(line => !line.startsWith("> "));
			let quotedLines = unquotedLines.slice(unquotedLines.findIndex(line => line.trim().length > 0)).map(line => "> " + line + "\n").join("");
			if (quotedLines) {
				quotedLines = quotedLines.replace(/(@everyone|@here)/g, "`$1`").replace(/``(@everyone|@here)``/g, "`$1`");
				quotedLines = quotedLines.replace(/<@[!&]{0,1}([0-9]{10,})>/g, (string, match) => {
					let user = BDFDB.LibraryModules.UserStore.getUser(match);
					if (user) {
						let userMember = guild && BDFDB.LibraryModules.MemberStore.getMember(guild.id, match);
						return `\`@${userMember && userMember.nick || user.username}\``;
					}
					else if (guild && guild.roles[match] && guild.roles[match].name) return `\`${guild.roles[match].name.indexOf("@") == 0 ? "" : "@"}${guild.roles[match].name}\``;
					return string;
				});
			}
			
			return BDFDB.StringUtils.insertNRST(quoteFormat)
				.replace("$mention", settings.ignoreMentionInDM && channel.isDM() ? "" : `<@!${message.author.id}>`)
				.replace("$link", `https://discordapp.com/channels/${guild.id}/${channel.id}/${message.id}`)
				.replace("$authorName", member && member.nick || message.author.username || "")
				.replace("$authorAccount", `${message.author.username}#${message.author.discriminator}`)
				.replace("$authorId", message.author.id || "")
				.replace("$channelName", channel.name || "")
				.replace("$channelId", channel.id || "")
				.replace("$channel", channel.isDM() ? "" : `<#${channel.id}>`)
				.replace("$serverId", guild.id || "")
				.replace("$serverName", guild.name || "")
				.replace("$hour", settings.forceZeros && hour < 10 ? "0" + hour : hour)
				.replace("$minute", minute < 10 ? "0" + minute : minute)
				.replace("$second", second < 10 ? "0" + second : second)
				.replace("$msecond", settings.forceZeros ? (msecond < 10 ? "00" + msecond : (msecond < 100 ? "0" + msecond : msecond)) : msecond)
				.replace("$timemode", timemode)
				.replace("$weekdayL", timestamp.toLocaleDateString(languageId, {weekday: "long"}))
				.replace("$weekdayS", timestamp.toLocaleDateString(languageId, {weekday: "short"}))
				.replace("$monthnameL", timestamp.toLocaleDateString(languageId, {month: "long"}))
				.replace("$monthnameS", timestamp.toLocaleDateString(languageId, {month: "short"}))
				.replace("$day", settings.forceZeros && day < 10 ? "0" + day : day)
				.replace("$month", settings.forceZeros && month < 10 ? "0" + month : month)
				.replace("$year", timestamp.getFullYear())
				.replace("$quote", quotedLines || "")
				.split(" ").filter(n => n).join(" ");
		}

		addLeadingZeros (timestring) {
			let charArray = timestring.split("");
			let numreg = /[0-9]/;
			for (let i = 0; i < charArray.length; i++) if (!numreg.test(charArray[i-1]) && numreg.test(charArray[i]) && !numreg.test(charArray[i+1])) charArray[i] = "0" + charArray[i];

			return charArray.join("");
		}
			
		forceUpdateAll() {
			settings = BDFDB.DataUtils.get(this, "settings");
			formats = Object.assign({"Standard": "$quote $mention"}, BDFDB.DataUtils.load(this, "formats"));
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
			BDFDB.MessageUtils.rerenderAll();
		}
	}
})();
