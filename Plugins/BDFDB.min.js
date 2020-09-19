if (window.BDFDB && window.BDFDB.myPlugins && Object.keys(window.BDFDB.myPlugins).length) BdApi.showConfirmationModal("Switching from remote library to local library", `Due to recent security concerns, plugins are no longer allowed to load remote libraries. That's why I moved my plugin library to a plugin file and converted all my plugins so they use the local library. To download the library plugin and convert all plugins to the newest version press "Download now". This might take a moment depending on how many of my plugins you are using. This will not delete any of your plugin configurations! Found plugins: ${Object.keys(window.BDFDB.myPlugins).length}`, {
	confirmText: "Download Now",
	cancelText: "Cancel",
	onConfirm: _ => {
		let request = require("request");
		let fs = require("fs");
		let path = require("path");
		let finish = _ => {
			BdApi.alert("Finished converting", "The new library has been downloaded and all old plugins that were enabled have been converted. Old disabled plugins need to be converted once you enable them.");
		};
		let downloadPlugins = _ => {
			let plugins = Object.assign({}, window.BDFDB.myPlugins), i = 0;
			for (let name in plugins) {
				i++;
				let last = i >= Object.keys(plugins).length;
				setTimeout(_ => {
					let url = typeof plugins[name].getRawUrl == "function" && typeof plugins[name].getRawUrl() == "string" ? plugins[name].getRawUrl() : `https://mwittrien.github.io/BetterDiscordAddons/Plugins/${name}/${name}.plugin.js`;
					request(url, (error, response, body) => {
						if (!error && body) fs.writeFile(path.join(BdApi.Plugins.folder, name + ".plugin.js"), body, _ => {
							if (last) finish();
						});
						else if (last) finish();
					});
				}, i * 1000);
			}
		};
		if (BdApi.Plugins.get("BDFDB")) downloadPlugins();
		else request.get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (error, response, body) => {
			fs.writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), body, _ => {
				let count = 0, interval = setInterval(_ => {
					if (window.BDFDB_Global) {
						clearInterval(interval);
						downloadPlugins();
					}
					else if (count > 100) clearInterval(interval);
				}, 1000);
			});
		});
	}
});