window.onload = function () {
	window.parent.postMessage({origin:"DiscordPreview",reason:"OnLoad"},"*");
};
window.onkeyup = function (e) {
	window.parent.postMessage({origin:"DiscordPreview",reason:"KeyUp",key:e.which},"*");
};
window.onmessage = function (e) {
	if (typeof e.data === "object" && e.data.origin == "ThemeRepo") {
		switch (e.data.reason) {
			var body = document.querySelector("body"), head = document.querySelector("head"), theme;
			case "OnLoad":
				body.innerHTML = body.innerHTML.replace(new RegExp("REPLACE_USERNAME", "g"), e.data.username);
				body.innerHTML = body.innerHTML.replace(new RegExp("REPLACE_AVATAR", "g"), e.data.avatar.split('"').join(''));
				body.innerHTML = body.innerHTML.replace(new RegExp("REPLACE_DISCRIMINATOR", "g"), e.data.discriminator);
				break;
			case "NewTheme":
				document.querySelectorAll("style.previewTheme").forEach(theme => theme.remove());
				
				theme = document.createElement("style");
				theme.classList.add("previewTheme");
				theme.innerText = e.data.css;
					
				head.appendChild(theme);
				break;
			case "DarkLight":
				if (e.data.light)
					body.innerHTML = body.innerHTML.replace(new RegExp("theme-dark", "g"), "theme-light");
				else 
					body.innerHTML = body.innerHTML.replace(new RegExp("theme-light", "g"), "theme-dark");
				break;
			case "ThemeFixer":		
				if (e.data.fixer) {
					theme = document.createElement("style");
					theme.classList.add("themeFixer");
					theme.innerText =`#voice-connection,#friends,.friends-header,.friends-table,.guilds-wrapper,.guild-headerheader,.channels-wrap,.private-channels.search-bar,.private-channels,.guild-channels,.account,.friend-table-add-header,.chat,.content,.layers,.title-wrap:not(.search-bar),.messages-wrapper,.messages.dividerspan,.messages.divider:before,.content,.message-group-blocked,.is-local-bot-message,.channel-members-loading,.channel-members-loading.heading,.channel-members-loading.member,.typing,.layer,.layers,.container-RYiLUQ,.theme-dark.ui-standard-sidebar-view,.theme-dark.ui-standard-sidebar-view.sidebar-region,.theme-dark.ui-standard-sidebar-view.content-region,.theme-dark.channel-members,.layer,.layers,.container-2OU7Cz,.theme-dark.title-qAcLxz,.theme-dark.chatform,.channels-3g2vYe,.theme-dark.friends-table,.theme-dark.messages-wrapper,.content.flex-spacer,.theme-dark.chat>.content,.theme-dark.chat,.container-2OU7Cz,.theme-dark.channel-members,.channel-members,.channels-3g2vYe,.guilds-wrapper,.search.search-bar,.theme-dark.chatform,.container-iksrDt,.container-3lnMWU,.theme-dark.title-qAcLxz{background:transparent!important;}.theme-dark.layer,.theme-dark.layers,.typeWindows-15E0Ys{background:rgba(0,0,0,0.18)!important;}`
						
					head.appendChild(theme);
				}
				else {
					document.querySelectorAll("style.themeFixer").forEach(theme => theme.remove());
				}
				break;
		}
	}
};
