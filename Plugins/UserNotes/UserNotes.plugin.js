//META{"name":"UserNotes","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/UserNotes","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/UserNotes/UserNotes.plugin.js"}*//

class UserNotes {
	getName () {return "UserNotes";}

	getVersion () {return "1.0.4";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to write your own user notes wihtout a character limit.";}
	
	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};
	}
	
	initConstructor () {
		this.css = `
			.${this.name}-modal textarea {
				height: 50vh;
			}`;
	}

	getSettingsPanel () {
		if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settingsPanel, settingsItems = [];
		
		settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
			type: "Button",
			className: BDFDB.disCN.marginbottom8,
			color: BDFDB.LibraryComponents.Button.Colors.RED,
			label: "Delete all Usernotes",
			onClick: _ => {
				BDFDB.ModalUtils.confirm(this, "Are you sure you want to remove all usernotes?", _ => {
					BDFDB.DataUtils.remove(this, "notes");
				});
			},
			children: BDFDB.LanguageUtils.LanguageStrings.DELETE
		}));
		
		return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
	}

	//legacy
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
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}


	stop () {
		if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	onUserContextMenu (e) {
		if (e.instance.props.user) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]});
			const itemgroup = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Group, {
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
						label: BDFDB.LanguageUtils.LanguageStrings.USERS + " " + BDFDB.LanguageUtils.LanguageStrings.NOTE,
						action: _ => {
							BDFDB.ContextMenuUtils.close(e.instance);
							this.openNotesModal(e.instance.props.user);
						}
					})
				]
			});
			if (index > -1) children.splice(index, 0, itemgroup);
			else children.push(itemgroup);
		}
	}

	openNotesModal (user) {
		let note = BDFDB.DataUtils.load(this, "notes", user.id);
		
		BDFDB.ModalUtils.open(this, {
			size: "LARGE",
			header: BDFDB.LanguageUtils.LanguageStrings.USERS + " " + BDFDB.LanguageUtils.LanguageStrings.NOTE,
			subheader: user.username,
			scroller: false,
			children: [
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextArea, {
					value: note,
					placeholder: note,
					autoFocus: true
				})
			],
			buttons: [{
				contents: BDFDB.LanguageUtils.LanguageStrings.SAVE,
				color: "BRAND",
				close: true,
				click: modal => {
					note = modal.querySelector("textarea").value;
					if (note) BDFDB.DataUtils.save(note, this, "notes", user.id);
					else BDFDB.DataUtils.remove(this, "notes", user.id);
				}
			}]
		});
	}
}
