//META{"name":"UserNotes","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/UserNotes","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/UserNotes/UserNotes.plugin.js"}*//

var UserNotes = (_ => {
	return class UserNotes {
		getName () {return "UserNotes";}

		getVersion () {return "1.0.5";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Allows you to write your own user notes wihtout a character limit.";}
		
		constructor () {
			this.changelog = {
				"fixed":[["Context Menu Update","Fixes for the context menu update, yaaaaaay"]]
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

		onUserContextMenu (e) {
			if (e.instance.props.user) {
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
				children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: BDFDB.LanguageUtils.LanguageStrings.USERS + " " + BDFDB.LanguageUtils.LanguageStrings.NOTE,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "user-note"),
						action: _ => {
							this.openNotesModal(e.instance.props.user);
						}
					})
				}));
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
})();

module.exports = UserNotes;