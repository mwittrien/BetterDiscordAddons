/**
 * @name EmojiReplaceSettings
 * @description Adds a settings menu to select different emoji providers for the theme EmojiReplace by DevilBro.
 * @author AidanTheDev
 * @version 1.0.0
 */

module.exports = (() => {
	const config = {
		info: {
			name: "EmojiReplaceSettings",
			authors: [{ name: "AidanTheDev" }],
			version: "1.0.0",
			description: "Adds a settings menu to select different emoji providers for the theme EmojiReplace by DevilBro."
		}
	};

	return class {
		constructor() {
			this.emojiProviders = [
				"Apple", "BlobMoji", "Facebook", "Google", "Huawei",
				"JoyPixels", "Microsoft", "Microsoft-3D", "OpenMoji",
				"Samsung", "Samsung-Old", "Toss", "WhatsApp"
			];
		}

		// Function to inject emoji provider stylesheet
		setEmojiProvider(provider) {
			// Remove existing emoji styles
			document.querySelectorAll("link[data-emoji-provider]").forEach(link => link.remove());

			// Create a new <link> element
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = `https://mwittrien.github.io/BetterDiscordAddons/Themes/EmojiReplace/base/${provider}.css`;
			link.setAttribute("data-emoji-provider", provider);

			// Append to head
			document.head.appendChild(link);
		}

		// Load saved settings or default to Samsung
		loadSettings() {
			const savedProvider = BdApi.loadData(config.info.name, "emojiProvider") || "Samsung";
			this.setEmojiProvider(savedProvider);
		}

		// Save the selected provider
		saveSettings(provider) {
			BdApi.saveData(config.info.name, "emojiProvider", provider);
			this.setEmojiProvider(provider);
		}

		start() {
			this.loadSettings();
		}

		stop() {
			document.querySelectorAll("link[data-emoji-provider]").forEach(link => link.remove());
		}

		// Adds the settings menu to BetterDiscord
		getSettingsPanel() {
			const panel = document.createElement("div");
			panel.style.padding = "10px";
			panel.style.backgroundColor = "#36393f";
			panel.style.borderRadius = "8px";
			panel.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.3)";

			// Label styling
			const label = document.createElement("label");
			label.textContent = "Select Emoji Provider:";
			label.style.color = "#ffffff";
			label.style.fontSize = "14px";
			label.style.fontWeight = "bold";
			panel.appendChild(label);

			// Dropdown (select) styling
			const select = document.createElement("select");
			select.style.marginLeft = "10px";
			select.style.padding = "5px";
			select.style.backgroundColor = "#2f3136";
			select.style.border = "1px solid #4f545c";
			select.style.borderRadius = "5px";
			select.style.color = "#ffffff";
			select.style.fontSize = "14px";
			select.style.cursor = "pointer";

			this.emojiProviders.forEach(provider => {
				const option = document.createElement("option");
				option.value = provider;
				option.textContent = provider;
				select.appendChild(option);
			});

			// Load saved selection
			select.value = BdApi.loadData(config.info.name, "emojiProvider") || "Samsung";

			select.addEventListener("change", () => {
				this.saveSettings(select.value);
			});

			// Add the dropdown to the panel
			panel.appendChild(select);
			return panel;
		}
	};
})();