module.exports = (Plugin, Api, Vendor) => {
	if (!global.BDFDB || typeof BDFDB != "object") global.BDFDB = {BDv2Api: Api};

	return class extends Plugin {
		initConstructor () {
			this.newStrings = {
				NO_THANKS: "Nein Danke",
				VAD_PERMISSION_SMALL: "Dieser Kanal erfordert Push-to-Talk um zu sprechen.",
				FORM_HELP_NSFW: "Benutzer müssen bestätigen, dass sie über 18 Jahre alt sind, um Inhalte des Kanals zu sehen.\nNSFW-Kanäle sind vom expliziten Inhaltsfilter ausgeschlossen.",
				SEND_TTS_MESSAGES_DESCRIPTION: "Mitglieder mit dieser Berechtigung können Text-zu-Sprache-Nachrichten schicken, indem sie die Nachricht mit /tts (Text-to-Speech) beginnen. Diese Nachrichten können von jedem gehört werden, der sich in dem Kanal befindet.",
				MANAGE_MESSAGES_DESCRIPTION: "Mitglieder mit dieser Berechtigung können Nachrichten von anderen Mitgliedern löschen oder eine Nachricht anpinnen.",
				MOVE_MEMBERS_DESCRIPTION: "Mitglieder mit dieser Berechtigung können andere Mitglieder aus diesem Kanal herausziehen. Sie können ausschließlich Mitglieder zwischen Kanälen hin- und herziehen, in denen sowohl sie als auch das Mitglied Zutritt haben.",
				USE_VAD_DESCRIPTION: "Wenn diese Berechtigung entzogen wird, müssen Benutzer in diesem Kanal Push-to-Talk verwenden.",
				MENTION_USERS_WITH_ROLE: "Benachrichtige Benutzer mit dieser Rolle, welche die Rechte haben diesen Kanal zu sehen.",
				MENTION_EVERYONE_AUTOCOMPLETE_DESCRIPTION: "Benachrichtige jeden, der die Berechtigung zum Lesen des Kanals hat.",
				MENTION_HERE_AUTOCOMPLETE_DESCRIPTION: "Benachrichtige jeden der Online ist und der die Rechte hat diesen Kanal zu sehen.",
				FORM_HELP_CHANNEL_PERMISSIONS: "Das Auswählen der Rollen wird automatisch grundlegende Berechtigungen für diesen Kanal erstellen.",
				JOIN_SERVER_DESCRIPTION_MOBILE: "Gib eine Soforteinladung ein, um einen existierenden Server beizutreten.",
				INSTANT_INVITE_LOOKS_LIKE: "Die Einladung wird in etwa so aussehen:",
				FORM_LABEL_INSTANT_INVITE: "Gib eine Soforteinladung ein",
				INVALID_INVITE_LINK_ERROR: "Bitte gib einen gültigen Einladungslink oder Code ein.",
				EDIT_CHANNEL: "Kanal bearbeiten",
				EDIT_VOICE_CHANNEL_NO_PERMISSION: "Deine Rolle hat keine Berechtigung diesen Sprachkanal zu bearbeiten.",
				DELETE_SERVER_ENTER_NAME: "Gib den Servernamen ein",
				EXPLICIT_CONTENT_FILTER_HIGH_DESCRIPTION: "Empfohlen, wenn du alles blitze blank haben willst.",
				GUILD_SETTINGS_AUDIT_LOG_CHANNEL_PERMISSION_OVERRIDES_CREATE: "Mit Berechtigungsüberschreibung",
				GUILD_SETTINGS_AUDIT_LOG_CHANNEL_NSFW_ENABLED: "Hat den Kanal als NSFW markiert",
				GUILD_SETTINGS_AUDIT_LOG_ROLE_HOIST_OFF: "Nicht separiert",
				SORTING: "Am Sortieren",
				GUILD_SETTINGS_WIDGET_ENABLE_WIDGET: "Server Widget aktivieren",
				ADMINISTRATOR_DESCRIPTION: "Mitglieder mit dieser Berechtigung haben jede Berechtigung und können kanalspezifische Berechtigungen umgehen. Mit dieser Berechtigung ist vorsichtig umzugehen.",
				VIEW_AUDIT_LOG_DESCRIPTION: "Mitglieder mit dieser Berechtigung können die Audit Logs des Servers einsehen.",
				ANIMATED_EMOJI: "Animierter Emoji",
				NO_EMOJI_BODY: "Nichts",
				TOO_MANY_EMOJI: "Du hast keine freien Plätze mehr für Emojis.",
				TOO_MANY_ANIMATED_EMOJI: "Du hast keine freien Plätze mehr für animierte Emojis.",
				INVITE_FRIEND_MODAL_TITLE: "Lade deine Freunde ein",
				INVITE_FRIEND_MODAL_LOADING: "Lädt deine Freundesliste...",
				INSTANT_INVITE_INVALID_CHANNEL: "Du kannst keine Soforteinladung für diesen Kanal erstellen. Versuch's mit einem anderen!",
				INSTANT_INVITE_NOT_ALLOWED: "Mist. Scheint als könntest du für diesen Server keine Soforteinladung erstellen.",
				LOGIN_BODY: "Log dich mit deiner E-Mail-Adresse ein um loszulegen",
				FORM_LABEL_EMAIL: "E-Mail",
				EMAIL_REQUIRED: "Eine gültige E-Mail-Adresse wird benötigt.",
				EMAIL_INVALID: "Die angegebene E-Mail-Adresse ist ungültig. Bitte aktualisiere sie und versuch es erneut.",
				PASSWORD_REQUIRED: "Ein Passwort ist erforderlich.",
				FORGOT_PASSWORD_BODY: "Keine Sorge. Bitte gib die E-Mail-Adresse deines Accounts an, damit wir deine Identität überprüfen können.",
				ACCOUNT_SCHEDULED_FOR_DELETION_TITLE: "Account zur Löschung geplant",
				ACCOUNT_SCHEDULED_FOR_DELETION_DESCRIPTION: "Dein Account wird sich bald selbst zerstören.. sicher, dass du dies immer noch möchtest?",
				BEGINNING_GROUP_DM_PARTY: "Willkommen zu LFG. Bitte sei freundlich und respektvoll zu einander. Wenn du Freunde findest, vergiss nicht sie hinzuzufügen!",
				USERNAME_REQUIRED: "Ein Benutzername ist erforderlich.",
				RESEND: "Erneut senden",
				NOTICE_SPOTIFY_AUTO_PAUSED: "Dein Mikrofon sendet seit 30 Sekunden. Spotify wurde pausiert.",
				SELF_MUTED: "Selbst stummschalten",
				SERVER_MUTE: "Mikrofone deaktivieren",
				SERVER_UNMUTE: " Mikrofone aktivieren",
				SERVER_MUTED: "Mikrofone deaktiviert",
				SERVER_DEAFEN: "Lautsprecher deaktivieren",
				SERVER_UNDEAFEN: "Lautsprecher aktivieren",
				SERVER_DEAFENED: "Lautsprecher deaktiviert",
				USER_SETTINGS_STARTUP_BEHAVIOR: "System Startup Behavior",
				USER_SETTINGS_CLOSE_BUTTON: "Schließknopf",
				USER_SETTINGS_OPEN_ON_STARTUP_LABEL: "Discord öffnen",
				USER_SETTINGS_OPEN_ON_STARTUP_BODY: "Spar dir ein paar Klicks und lass Discord dich grüßen, wenn du nach Hause kommst wie ein guter Junge",
				USER_SETTINGS_START_MINIMIZED_LABEL: "Minimiert starten",
				USER_SETTINGS_START_MINIMIZED_BODY: "Discord startet minimiert wie ein guter Junge und steht dir nicht im Weg",
				USER_SETTINGS_MINIMIZE_TO_TRAY_LABEL: "In Symbolleiste minimieren",
				USER_SETTINGS_MINIMIZE_TO_TRAY_BODY: "Lass Discord in deiner Symbolleiste wie ein guter Junge kuscheln, wenn du die Anwendung schließt",
				USER_SETTINGS_LINUX_SETTINGS: "Linux-Einstellungen",
				ADD_KEYBIND_WARNING: "Hotkeys sind deaktiviert, während diese Schaltfläche sichtbar ist.",
				GAME_NOTIFICATIONS_USER_OVERRIDES: "Leute mit denen du spielst",
				GAME_NOTIFICATION_SETTING_DESKTOP_ONLY_DESC: "Benachrichtigungen werden auf deinem Desktop angezeigt, wenn du online oder untätig bist.",
				GAME_NOTIFICATION_SETTINGS_FOLLOWING_EMPTY: "Wir versuchen immer noch herauszufinden mit wem du Spiele spielst. Los spiel ein Bisschen mit deinen Freunden!",
				VERIFICATION_EMAIL_ERROR_TITLE: "Fehler bei deiner Verifizierungs-E-Mail",
				DESKTOP_NOTIFICATIONS_ENABLE: "Aktiviere Desktopbenachrichtigungen",
				MOBILE_ENABLE_HARDWARE_SCALING_DESC: "Experimentelle Funktion, die die Performanz bei Videogesprächen verbessern könnte. Vorsicht kann Stuss verursachen.",
				PIN_MESSAGE_BODY_PRIVATE_CHANNEL: "Möchte nur sicherstellen, dass du diese scheinbar bedeutsame Nachricht wirklich in diesen Kanal für die Nachwelt anheften möchtest.",
				PINS_DISABLED_NSFW: "Dies ist ein NSFW-Kanal und der Inhalt sollte lieber für niemanden als angeheftete Nachricht sichtbar sein.",
				SERVER_MUTE_DMS: "Direktnachrichten stummschalten",
				SCOPE_WEBHOOK_INCOMING: "Fügt einen WebHook zu einem Kanal hinzu",
				CLAIM_ACCOUNT_REQUIRED_BODY: "Bitte registriere deinen Account um die Desktop App zu benutzen.",
				CLAIM_ACCOUNT_GET_APP: "Hol dir die Desktop App",
				NOTE_PLACEHOLDER: "Hier tippen, um eine Notiz hinzuzufügen",
				VANITY_URL_HELP_CONFLICT: "Vergiss nicht, dass wir Vanity-URLs zurücknehmen, wenn wir einen Missbrauch oder Interessenkonflikt feststellen.",
				SCREENSHARE_UNAVAILABLE: "Bildschirmübertragung nicht verfügbar",
				SCREENSHARE_UNAVAILABLE_DOWNLOAD_APP: "Lade die Desktop App herunter, um Bildschirmübertragungen zu benutzen!",
				VIDEO_POOR_CONNECTION_BODY: "Video wurde deaktiviert. Es wird automatisch fortgesetzt, sobald sich deine Verbindung verbessert hat.",
				INVITE_MODAL_ERROR_TITLE: "Upps...",
				DISABLE_EMAIL_NOTIFICATIONS_FAILED: "Upps! Wir konnten die E-Mail Benachrichtigungen für deine E-Mail Adresse nicht ausschalten.",
				KEYBIND_DESCRIPTION_MODAL_TOGGLE_PINS: "Verankerte Pins an-/ausschalten",
				KEYBIND_DESCRIPTION_MODAL_FOCUS_TEXT_AREA: "Textbereich fokussieren",
				INVALID_ANIMATED_EMOJI_BODY: "Dieser Emoji funktioniert nicht, da er animiert ist. Hol dir Discord Nitro, um all deine animierten Emoji Träume zu erfüllen.",
				INVALID_ANIMATED_EMOJI_BODY_UPGRADE: "Dieser Emoji funktioniert nicht, da er animiert ist. Discord Nitro löst dieses Problem, schau auf Benutzereinstellungen > Discord Nitro für mehr Informationen.",
				INVALID_EXTERNAL_EMOJI_BODY: "Dieser Emoji funktioniert nicht, da er von einem anderem Server stammt. Hol dir Discord Nitro, um Emojis von anderen Servern zu benutzen.",
				INVALID_EXTERNAL_EMOJI_BODY_UPGRADE: "Dieser Emoji funktioniert nicht, da er von einem anderem Server stammt. Discord Nitro löst dieses Problem, schau auf Benutzereinstellungen > Discord Nitro für mehr Informationen.",
				NEW_TERMS_TITLE: "Neue AGBs und Nutzungsbedingungen",
				NEW_TERMS_DESCRIPTION: "Um weiterhin Discord zu nutzen, lies und stimme bitte\nunseren neuen AGBs und Nutzungsbedingungen zu.",
				PREMIUM_FEATURE_DESCRIPTION_ANIMATED_AVATAR: "Lade ein GIF als Benutzerprofilbild hoch und spiel es ab wenn du im Chat mit der Maus darüber fährst.",
				PAYMENT_SOURCE_TITLE: "Zahlungsmethode",
				PAYMENT_SOURCE_CREDIT_CARD: "Kreditkarte",
				PAYMENT_SOURCE_CHANGE_CARD: "Kreditkarte ändern",
				PAYMENT_SOURCE_REMOVE_CARD: "Kreditkarte entfernen",
				PAYMENT_SOURCE_CHANGE_PAYPAL: "PayPal-Account ändern",
				PAYMENT_SOURCE_INVALID_DETAILS: "Du musst deine Kreditkarte aktualisieren oder dein Nitro Abonnement läuft ab",
				PAYMENT_SOURCE_CONFIRM_PAYPAL_DETAILS: "Bestätige deine PayPal Daten in deinem Browser!",
				PAYMENT_SOURCE_PAYPAL_REOPEN: "Fenster erneut öffnen",
				PAYMENT_STEPS_GO_BACK: "Zurück",
				PAYMENT_MODAL_TITLE_CHANGE_CARD: "Kreditkarte ändern",
				PAYMENT_MODAL_TITLE_CHANGE_PAYPAL: "PayPal-Account ändern",
				PAYMENT_MODAL_SUBTITLE: "Discord Nitro Abonnement",
				PAYMENT_MODAL_BUTTON_CHANGE_CARD: "Kreditkarte aktualisieren",
				PAYMENT_MODAL_BUTTON_CHANGE_PAYPAL: "PayPal-Account aktualisieren",
				PAYPAL_ACCOUNT_VERIFYING: "Zu PayPal verbinden",
				PAYPAL_CALLBACK_ERROR: "Etwas ist schief gelaufen, versuche es erneut.",
				PERMISSION_CAMERA_ACCESS_DENIED: "Kamerazugriff verweigert - Discord braucht Videozugriff, um einen Videostream zu senden.",
				GUILD_SETTINGS_SERVER_INVITE_BACKGROUND: "Soforteinladungshintergrund",
				VERIFICATION_FOOTER: "Glaubst du du siehst dies fälschlicher Weise?",
				USER_SETTINGS_NOTIFICATIONS_SHOW_BADGE_LABEL: "Ungelesene Nachrichten Indikator aktivieren",
				USER_SETTINGS_NOTIFICATIONS_SHOW_BADGE_BODY: "Zeigt einen roten Punkt-Indikator auf dem App Symbol, wenn du ungelesene Nachrichten hast.",
				USER_SETTINGS_NOTIFICATIONS_SHOW_FLASH_LABEL: "Taskleisten Blinken aktivieren",
				USER_SETTINGS_NOTIFICATIONS_SHOW_FLASH_BODY: "Lässt das App Symbol in der Taskleiste blinken, wenn du neue Benachrichtigungen hast.",
				HIDE_MUTED_CHANNELS: "Stumme Kanäle verstecken",
				SHOW_MUTED_CHANNELS: "Stumme Kanäle anzeigen",
				CREATE_CATEGORY: "Kategorie erstellen",
				ADD_CHANNEL_TO_OVERRIDE: "Füge einen Kanal hinzu, um die Standard-Benachrichtigungseinstellungen zu überschreiben",
				PRIVATE_CHANNEL_NOTE: "Wenn du einen Kanal auf privat stellst, können nur ausgewählte Rollen Nachrichten in diesem Kanal lesen oder sich mit ihm verbinden.",
				PRIVATE_CATEGORY_NOTE: "Wenn du einen Kategorie auf privat stellst, werden alle privaten Kanäle in ihr die Rechte vererbt bekommen.",
				USER_ACTIVITY_ERROR_FRIENDS_TITLE: "Freunde!",
				USER_ACTIVITY_CANNOT_SPECTATE_SELF: "Du kannst dich nicht selbst beobachten.",
				USER_ACTIVITY_LISTEN_ALONG: "Hör zu",
				USER_ACTIVITY_CANNOT_PLAY_SELF: "Du kannst nicht mit dir selbst spielen.",
				USER_ACTIVITY_CANNOT_SYNC_SELF: "Du kannst dir nicht selbst zuhören.",
				USER_ACTIVITY_ALREADY_PLAYING: "Du spielst bereits dieses Spiel.",
				USER_ACTIVITY_ALREADY_SYNCING: "Du hörst bereits zu.",
				USER_ACTIVITY_NEVER_MIND: "Vergiss es",
				USER_ACTIVITY_INVITE_EDUCATION_MODAL_TITLE: "Wusstest du schon?",
				USER_ACTIVITY_INVITE_EDUCATION_MODAL_BODY_BOTTOM: "Halte Ausschau nach dem grünen Spielsymbol. Wenn du es siehst, dann kannst Spieleinladungen verschicken! Los hab Spaß!",
				INVITE_EMBED_SESSION_HAS_ENDED: "Sitzung wurde beendet",
				INVITE_EMBED_JOINED: "Beigetreten",
				NUX_POST_REG_JOIN_SERVER_DESCRIPTION: "Hol das Meiste aus Discord raus, indem du einem Server beitrittst.",
				VERIFY_BY_RECAPTCHA: "Durch reCaptcha bestätigen",
				VERIFY_BY_RECAPTCHA_DESCRIPTION: "Wir müssen überprüfen, dass es sich bei dir um keinen Roboter handelt.",
				CAPTCHA_FAILED: "Das Captcha ist fehlgeschlagen. Versuch es erneut.",
				CAPTCHA_FAILED_UNSUPPORTED: "Das Captcha ist fehlgeschlagen. Dein Gerät wird nicht unterstützt.",
				CAPTCHA_FAILED_PLAY_SERVICES: "Das Captcha ist fehlgeschlagen, Google Play wird benötigt. Nachdem du es heruntergeladen oder aktualisiert hast, versuche es erneut.",
				SPOTIFY_APP_NOT_FOUND: "Die Spotify App konnte nicht gefunden werden.",
				SPOTIFY_APP_NOT_OPENED: "Die Spotify App konnte nicht geöffnet werden.",
				BROWSER_HANDOFF_DETECTING_TITLE: "Ermittle Account",
				BROWSER_HANDOFF_DONE_DESCRIPTION: "Es wird versucht die Discord Desktop App zu authentisieren. Schließe nicht das Fenster.",
				GAME_FEED_EMPTY_STATE_TITLE: "Niemand spielt gerade irgend etwas...",
				GAME_FEED_DIVIDER_TITLE: "Kürzlich gespielte Spiele",
				GAME_FEED_RECENT_ACTIVITY: "Letzte Aktivität´",
				GAME_FEED_USER_PLAYING_JUST_STARTED: "Gerade angefangen zu spielen",
				GAME_FEED_SETTINGS_SHOW_GAME_TITLE: "Du wirst nicht in dem Aktivitäten-Feed von anderen angezeigt!",
				GAME_FEED_SETTINGS_SEARCH_MORE_FRIENDS: "Suche um mehr Freunde zu finden.",
				GAME_FEED_SETTINGS_SEARCH_MORE_SERVER_MEMBERS: "Suche um mehr Servermitglieder zu finden.",
				SPOTIFY_PREMIUM_UPGRADE_HEADER: "*Schallplatten reißen*",
				SPOTIFY_PREMIUM_UPGRADE_BODY: "Schade, sieht aus als wärst du kein Spotify Premium Mitglied! Premium Mitglieder können bei anderen Benutzern mithören.",
				SPOTIFY_PREMIUM_UPGRADE_BUTTON: "Spotify aktualisieren",
				EXPERIMENT_BUTTON_CONNECT_FACEBOOK: "Facebook verbinden",
				EXPERIMENT_BUTTON_CONNECT_STEAM: "Steam verbinden",
				LFG_FULL: "Gruppe suchen (LFG)",
				LFG_LANDING_TITLE: "Suchst du eine Gruppe?",
				LFG_LANDING_BODY_1: "Kannste den letzten Platz nicht besetzen? Niemand online?",
				LFG_LANDING_BODY_2: "Wähle ein Spiel aus und finde Gruppen mit Leuten mit denen du spielen kannst.",
				LFG_SELECT_GAME: "Wähle ein Spiel um zu beginnen:",
				LFG_NO_GROUPS_FOUND_TITLE: "Keine Gruppen verfügbar",
				LFG_NO_GROUPS_FOUND_BODY: "Sei ein Trendsetter. Erstelle eine neue Gruppe!",
				LFG_ALREADY_IN_PARTY_TITLE: "Du bist bereits in einer Gruppe",
				LFG_ALREADY_IN_PARTY_BODY: "Möchtest du deine jetzige Gruppe verlassen, um diese Gruppe beizutreten?",
				LFG_ALREADY_IN_PARTY_BODY_ALT: "Möchtest du deine jetzige Gruppe verlassen, um eine neue Gruppe zu erstellen?",
				LFG_SWITCH_PARTY: "Gruppen wechseln",
				GROUP_OWNER: "Gruppenbesitzer",
				PARTY_EDIT_HEADER: "Gruppe bearbeiten",
				PARTY_CREATE_NEW: "Neue Gruppe erstellen",
				PARTY_CREATE_SELECT_GAME: "Spiel auswählen",
				PARTY_CREATE_PARTY_TITLE: "Gruppenname",
				PARTY_CREATE_PARTY_TITLE_PLACEHOLDER: "Wonach schaust du dich um?",
				PARTY_CREATE_PARTY_DESCRIPTION: "Beschreibung",
				PARTY_CREATE_PARTY_DESCRIPTION_PLACEHOLDER: "Provide more details like region, rank, classes, level, etc, to better find the right players.",
				PARTY_CREATE_PARTY_SIZE: "Gruppengröße",
				PARTY_LOCKED: "Geschlossen",
				PARTY_FULL: "Volle Gruppe",
				FULL: "Voll",
				PARTY_JOIN: "Gruppe beitreten",
				PARTY_JOINED: "In Gruppe",
				LFG_GROUP_ADD_FRIENDS: "Füge Freunde deiner Gruppe hinzu",
				LFG_INVITE_FULL_MAIN: "Diese Gruppe ist voll!",
				LFG_JOIN_FAILED_TOO_MANY_MEMBERS: "Upps. Du kannst dieser Gruppe nicht beitreten, da sie bereits voll ist.",
				LFG_JOIN_FAILED_BLOCKED: "Upps. Du kannst dieser Gruppe nicht beitreten. Entweder blockiert dich der Gruppenbesitzer oder du ihn.",
				LFG_REPORT_HEADER: "LFG Gruppe melden",
				LFG_LEAVE_BODY: "Bist du sicher, dass du die Gruppe verlassen möchtest?",
				LFG_RATE_LIMIT_CREATE_BODY: "Du erstellst Gruppen zu schnell!",
				LFG_RATE_LIMIT_JOIN_BODY: "Du trittst Gruppen zu schnell bei!",
				LFG_HAS_CHANGES: "Gruppen aktualisieren"
			};
			this.oldStrings = {};
		}

		onStart () {
			var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", () => {
					BDFDB.loaded = true;
					this.initialize();
				});
				document.head.appendChild(libraryScript);
			}
			else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		}

		initialize () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				BDFDB.loadMessage(this);
				this.LanguageUtils = BDFDB.WebModules.findByProperties("getLanguages");
				this.translateInterval = setInterval(() => {
					if (document.querySelector("html").lang && document.querySelector("html").lang == "de") {
						clearInterval(this.translateInterval);
						for (var key in this.newStrings) {
							this.oldStrings[key] = this.LanguageUtils.Messages[key];
							this.LanguageUtils.Messages[key] = this.newStrings[key];
						}
					}
				},100);

				return true;
			}
			else {
				console.error(`%c[${this.name}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
				return false;
			}
		}

		onStop () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				clearInterval(this.translateInterval);
				for (var key in this.oldStrings) {
					this.LanguageUtils.Messages[key] = this.oldStrings[key];
				}

				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}
	}
};
