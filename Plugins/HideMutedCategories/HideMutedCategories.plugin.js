//META{"name":"HideMutedCategories","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/HideMutedCategories","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/HideMutedCategories/HideMutedCategories.plugin.js"}*//

var HideMutedCategories = (_ => {
	return class HideMutedCategories {
		getName () {return "HideMutedCategories";}

		getVersion () {return "1.0.2";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Hides muted categories the same way muted channels are hidden, when the server is set to hide muted channels.";}

		constructor () {
			this.changelog = {
				"fixed":[["New Scroller","Adjusted for the new scroller component"]]
			};
			
			this.patchPriority = 10;
			
			this.patchedModules = {
				before: {
					Channels: "render"
				},
				after: {
					Channels: "render"
				}
			};
		}

		// Legacy
		load () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) BDFDB.PluginUtils.load(this);
		}

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

				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
			else {
				console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
			}
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.ModuleUtils.forceAllUpdates(this);

				BDFDB.PluginUtils.clear(this);
			}
		}

		
		// Begin of own functions

		processChannels (e) {
			if (!e.instance.props.guild || !e.instance.props.collapseMuted) return;
			
			if (!e.returnvalue) {
				e.instance.props.categories = Object.assign({}, e.instance.props.categories);
				
				for (let catId in e.instance.props.categories) if (BDFDB.LibraryModules.MutedUtils.isChannelMuted(e.instance.props.guild.id, catId)) e.instance.props.categories[catId] = [];
			}
			else {
				let list = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.channelsscroller]]});
				if (list) {
					let renderSection = list.props.renderSection;
					list.props.renderSection = (...args) => {
						let section = renderSection(...args);
						if (section && section.props && section.props.channel && BDFDB.LibraryModules.MutedUtils.isChannelMuted(e.instance.props.guild.id, section.props.channel.id))return null;
						else return section;
					};
				}
			}
		}
	}
})();

module.exports = HideMutedCategories;