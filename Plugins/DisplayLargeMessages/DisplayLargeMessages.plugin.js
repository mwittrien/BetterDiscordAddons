//META{"name":"DisplayLargeMessages","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/DisplayLargeMessages","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/DisplayLargeMessages/DisplayLargeMessages.plugin.js"}*//

var DisplayLargeMessages = (_ => {
	var encodedMessages, requestedMessages, updateTimeout, messagesInstance;
	
	return class DisplayLargeMessages {
		getName () {return "DisplayLargeMessages";}

		getVersion () {return "1.0.1";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Injects the contents of large messages that were sent by discord via 'message.txt'.";}

		constructor () {
			this.changelog = {
				"added":[["On demand option","Added option to load the content of a 'message.txt' on demand instead of automatically"]],
				"improved":[["Max Filesize","Added a max file size option for the automatic-mode to protect the app from injecting huge files, possibly causing a slowdown"]],
				"fixed":[["Editing","Content of a 'message.txt' no longer gets inserted in the input when you edit your own message"],["Scrolling","No longer force scrolls to the bottom on large messages"]]
			};
			
			this.patchedModules = {
				before: {
					Messages: "render",
				},
				after: {
					Attachment: "default"
				}
			};
		}

		initConstructor () {
			encodedMessages = {};
			requestedMessages = [];
			
			this.css = `
				${BDFDB.dotCN._displaylargemessagesinjectbutton} {
					color: #4f545c;
					cursor: pointer;
					margin-left: 4px;
				}
				${BDFDB.dotCN._displaylargemessagesinjectbutton}:hover {
					color: rgba(114, 118, 125, 0.6);
				}`;

			this.defaults = {
				settings: {
					onDemand:				{value:false, 	description:"Inject the content of 'message.txt' on demand instead of automatically"}
				},
				amounts: {
					maxFileSize:			{value:10, 	min:0,		description:"Max Filesize a fill will be read automatically",	note: "in KB / 0 = inject all / ignored in On-Demand"}
				}
			};
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let amounts = BDFDB.DataUtils.get(this, "amounts");
			let settingsPanel, settingsItems = [];
			
			for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key],
				onChange: _ => {
					if (key == "onDemand") BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
				}
			}));
			for (let key in amounts) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "TextInput",
				childProps: {
					type: "number"
				},
				plugin: this,
				keys: ["amounts", key],
				disabled: key == "maxFileSize" && settings.onDemand,
				label: this.defaults.amounts[key].description,
				note: this.defaults.amounts[key].note,
				basis: "20%",
				min: this.defaults.amounts[key].min,
				max: this.defaults.amounts[key].max,
				value: amounts[key]
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
				
				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.MessageUtils, "startEditMessage", {before: e => {
					let encodedContent = encodedMessages[e.methodArguments[1]];
					if (encodedContent != null) e.methodArguments[2] = encodedContent.content;
				}});
				
				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.MessageUtils, "editMessage", {before: e => {
					let encodedContent = encodedMessages[e.methodArguments[1]];
					if (encodedContent != null) encodedContent.content = e.methodArguments[2].content;
				}});

				this.forceUpdateAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
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
				encodedMessages = {};
				requestedMessages = [];
				this.forceUpdateAll();
			}
		}

		processMessages (e) {
			messagesInstance = e.instance;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let amounts = BDFDB.DataUtils.get(this, "amounts");
			for (let i in e.instance.props.messages._array) {
				let message = e.instance.props.messages._array[i];
				let encodedContent = encodedMessages[e.instance.props.messages._array[i].id];
				if (encodedContent != null) {
					if (message.content.indexOf(encodedContent.attachment) == -1) {
						message = new BDFDB.DiscordObjects.Message(Object.assign({}, message, {
							content: (message.content && (message.content + "\n\n") || "") + encodedContent.attachment
						}));
						message.attachments = message.attachments.filter(n => n.filename != "message.txt");
						e.instance.props.messages._array[i] = message;
						let stream = e.instance.props.channelStream.find(n => n.groupId == message.id);
						if (stream) stream.content = message;
					}
				}
				else if (!settings.onDemand && !requestedMessages.includes(message.id)) for (let attachment of message.attachments) {
					if (attachment.filename == "message.txt" && (!amounts.maxFileSize || (amounts.maxFileSize >= attachment.size/1024))) {
						requestedMessages.push(message.id);
						BDFDB.LibraryRequires.request(attachment.url, (error, response, body) => {
							encodedMessages[message.id] = {
								content: message.content || "",
								attachment: body || ""
							};
							BDFDB.TimeUtils.clear(updateTimeout);
							updateTimeout = BDFDB.TimeUtils.timeout(_ => {
								BDFDB.ReactUtils.forceUpdate(messagesInstance);
							}, 1000);
						});
					}
				}
			}
		}
		
		processAttachment (e) {
			if (e.instance.props.filename == "message.txt") {
				let settings = BDFDB.DataUtils.get(this, "settings");
				let amounts = BDFDB.DataUtils.get(this, "amounts");
				if (settings.onDemand || amounts.maxFileSize && (amounts.maxFileSize < e.instance.props.size/1024)) e.returnvalue.props.children.splice(2, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: BDFDB.LanguageUtils.LanguageStrings.TEXT,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
						rel: "noreferrer noopener",
						target: "_blank",
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.disCN._displaylargemessagesinjectbutton,
							name: BDFDB.LibraryComponents.SvgIcon.Names.RAW_TEXT
						}),
						onClick: event => {
							BDFDB.ListenerUtils.stopEvent(event);
							let message = BDFDB.ReactUtils.findValue(event.target, "message", {up: true});
							if (message) BDFDB.LibraryRequires.request(e.instance.props.url, (error, response, body) => {
								encodedMessages[message.id] = {
									content: message.content || "",
									attachment: body || ""
								};
								BDFDB.ReactUtils.forceUpdate(messagesInstance);
							});
						}
					})
				}));
			}
		}
		
		forceUpdateAll () {
			BDFDB.ModuleUtils.forceAllUpdates(this);
			BDFDB.MessageUtils.rerenderAll();
		}
	}
})();