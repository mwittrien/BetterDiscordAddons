//META{"name":"FixGermanTranslation"}*//

class FixGermanTranslation {
	constructor () {
		this.oldStringTable;
	}

	getName () {return "FixGermanTranslation";}

	getDescription () {return "Fixes the german translation.";}

	getVersion () {return "2.0.0";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	unload () {}

	start () {
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"></script>');
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			var strings = BDfunctionsDevilBro.getLanguageTable("de");
			this.oldStringTable = Object.assign({}, strings);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.unloadMessage(this);
			
			var strings = BDfunctionsDevilBro.getLanguageTable("de");
			strings = this.oldStringTable;
		}
	}
}
